// Remote agent adapter for the production surface. It speaks to the page's own
// POST /api/agent endpoint, keeps a short in-memory history, and reports failures
// in the same shapes src/agent/chain.js classifies.

import { createSseParser, sanitizeAgentEvent, turnIdFor } from '../state/agent-events.js';
//
// Endpoint URLs are resolved against the page origin so a <base href="/surface/">
// on the deployed page cannot redirect the API call.

const ADAPTER_ID = 'remote';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_HISTORY_TURNS = 3;

const PRODUCTION_HOSTS = new Set([
  'www.xn--agentfhig-02a.de',
  'xn--agentfhig-02a.de',
  'www.agentfähig.de',
  'agentfähig.de',
]);

function abortError(reason) {
  const error = new Error('aborted');
  error.name = 'AbortError';
  if (reason !== undefined) error.cause = reason;
  return error;
}

function remoteError(kind, message, extra = {}) {
  const error = new Error(message);
  error.name = kind === 'timeout' ? 'TimeoutError' : 'RemoteAgentError';
  error.kind = kind;
  Object.assign(error, extra);
  return error;
}

function statusError(status) {
  if (status === 429 || status === 402) {
    return remoteError('quota', `remote agent quota exhausted (${status})`, { status });
  }
  return remoteError('server', `remote agent returned ${status || 'an error'}`, { status });
}

function resolveEndpoint(endpoint) {
  const raw = String(endpoint ?? '/api/agent');
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)) return raw;

  const location = globalThis.location;
  const origin = location && typeof location.origin === 'string' && location.origin
    ? location.origin
    : 'http://localhost';
  try {
    return new URL(raw, origin).toString();
  } catch {
    return raw;
  }
}

/**
 * True only for the production hosts, never for local development.
 * @param {string} hostname
 * @returns {boolean}
 */
export function isProductionHost(hostname) {
  const host = String(hostname ?? '').trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  return PRODUCTION_HOSTS.has(host) || PRODUCTION_HOSTS.has(host.replace(/:\d+$/, ''));
}

/**
 * Remote adapter, same interface as the dev agent and chain adapters.
 * @param {{endpoint?: string, getSystem?: (() => string) | null, getParams?: (() => object) | null, historyTurns?: number,
 *          fetchImpl?: typeof fetch, timeoutMs?: number}} [options]
 * @returns {{id: 'remote', respond: (prompt: string, opts?: {signal?: AbortSignal}) =>
 *   Promise<{text: string, dev: false, provider: string, model: string | null}>}}
 */
export function createRemoteAgent(options = {}) {
  const adapterOnEvent = typeof options.onEvent === 'function' ? options.onEvent : null;
  const url = resolveEndpoint(options.endpoint ?? '/api/agent');
  const getSystem = typeof options.getSystem === 'function' ? options.getSystem : null;
  const getParams = typeof options.getParams === 'function' ? options.getParams : null;
  const historyTurns = Number.isFinite(options.historyTurns)
    ? Math.max(0, Math.floor(options.historyTurns))
    : DEFAULT_HISTORY_TURNS;
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
    ? options.timeoutMs
    : DEFAULT_TIMEOUT_MS;
  const fetchImpl = typeof options.fetchImpl === 'function'
    ? options.fetchImpl
    : (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null);

  // Session memory only: a reload starts over.
  const history = [];
  let lastSourceIds = [];

  async function readSystem() {
    if (!getSystem) return null;
    try {
      const value = await getSystem();
      return typeof value === 'string' && value.trim() ? value : null;
    } catch {
      return null;
    }
  }

  function remember(prompt, answer) {
    if (historyTurns === 0) return;
    history.push({ role: 'user', content: prompt });
    history.push({ role: 'assistant', content: answer });
    const limit = historyTurns * 2;
    while (history.length > limit) history.shift();
  }

  function emitEvent(event, callOnEvent) {
    try {
      callOnEvent?.(event);
    } catch { /* listeners must not break the adapter */ }
    try {
      adapterOnEvent?.(event);
    } catch { /* ignore */ }
  }

  function normalizeResult(data) {
    return {
      text: String(data.text ?? ''),
      dev: false,
      provider: typeof data.provider === 'string' && data.provider ? data.provider : ADAPTER_ID,
      model: data.model ?? null,
      sources: Array.isArray(data.sources) ? data.sources : [],
      contact_card: Boolean(data.contact_card),
      coverage: data.coverage ?? null,
    };
  }

  async function consumeSseStream(response, { signal, turnId, callOnEvent }) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalData = null;
    let streamError = null;

    const parser = createSseParser({
      onFrame({ event, data }) {
        if (event === 'agent.event') {
          const clean = sanitizeAgentEvent(data);
          if (clean) {
            emitEvent(
              {
                ...clean,
                ...(turnId !== undefined ? { turn_id: turnIdFor(turnId) } : {}),
              },
              callOnEvent,
            );
          }
          return;
        }
        if (event === 'agent.result') {
          finalData = data;
          return;
        }
        if (event === 'agent.error') {
          streamError = data;
        }
      },
    });

    const onAbort = () => {
      try { reader.cancel(); } catch { /* ignore */ }
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      while (true) {
        if (signal?.aborted) {
          onAbort();
          throw abortError(signal.reason);
        }
        const { done, value } = await reader.read();
        if (value) parser.push(decoder.decode(value, { stream: true }));
        if (done) break;
      }
      parser.push(decoder.decode());
      parser.flush();
    } catch (error) {
      if (signal?.aborted || error?.name === 'AbortError') {
        onAbort();
        throw abortError(signal.reason);
      }
      throw error;
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }

    if (streamError) {
      throw statusError(Number(streamError.status) || 503);
    }
    if (!finalData || typeof finalData !== 'object') {
      throw remoteError('server', 'remote event stream ended without result');
    }
    return normalizeResult(finalData);
  }

  async function respond(prompt, { signal, turnId, onEvent: callOnEvent } = {}) {
    if (signal?.aborted) throw abortError(signal.reason);
    if (!fetchImpl) throw remoteError('network', 'fetch is not available');

    const text = String(prompt ?? '');
    const controller = new AbortController();
    let timedOut = false;
    let timer = null;
    let abortListener = null;

    const onTimeout = () => {
      timedOut = true;
      try { controller.abort(); } catch { /* ignore */ }
    };

    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        onTimeout();
        reject(remoteError('timeout', `remote agent timed out after ${timeoutMs}ms`, { code: 'timeout' }));
      }, timeoutMs);
    });

    const abortPromise = new Promise((_, reject) => {
      abortListener = () => {
        try { controller.abort(signal?.reason); } catch { /* ignore */ }
        reject(abortError(signal?.reason));
      };
      signal?.addEventListener('abort', abortListener, { once: true });
    });

    const cleanup = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (abortListener) {
        signal?.removeEventListener('abort', abortListener);
        abortListener = null;
      }
    };

    const request = (async () => {
      const body = { prompt: text };
      if (getParams) {
        try { body.params = await getParams(); } catch { /* defaults on server */ }
      }
      if (history.length) body.history = history.map((turn) => ({ ...turn }));
      if (lastSourceIds.length) body.last_source_ids = [...lastSourceIds];
      if (turnId !== undefined) body.turn_id = turnIdFor(turnId);

      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (response?.ok === false || Number(response?.status) >= 400) {
        throw statusError(Number(response?.status) || 0);
      }

      const contentType = String(response?.headers?.get?.('content-type') ?? '').toLowerCase();
      if (contentType.includes('text/event-stream') && typeof response?.body?.getReader === 'function') {
        return consumeSseStream(response, { signal, turnId, callOnEvent });
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!data || typeof data !== 'object') {
        throw remoteError('server', 'remote agent returned an invalid payload');
      }

      return normalizeResult(data);
    })();

    try {
      const result = await Promise.race([request, timeoutPromise, abortPromise]);
      lastSourceIds = result.sources.map((source) => source.id).filter(Boolean).slice(0, 5);
      remember(text, result.text);
      return result;
    } catch (error) {
      if (signal?.aborted) throw abortError(signal.reason);
      if (timedOut || error?.name === 'TimeoutError') {
        throw remoteError('timeout', `remote agent timed out after ${timeoutMs}ms`, { code: 'timeout' });
      }
      if (error && typeof error === 'object' && typeof error.kind === 'string') throw error;
      if (error?.name === 'AbortError') {
        throw remoteError('network', 'remote request aborted', { cause: error });
      }
      throw remoteError('network', `remote request failed: ${error?.message ?? 'unknown error'}`, { cause: error });
    } finally {
      cleanup();
    }
  }

  return { id: ADAPTER_ID, respond };
}
