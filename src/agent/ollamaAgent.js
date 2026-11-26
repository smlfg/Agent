// Local development LLM via Ollama. Development-only: answers vary naturally,
// quality is not the metric yet — speed is. In-memory session memory only, so
// a reload starts fresh.

import { limitSentences, stripSurfaceTags } from '../surface/surface-adapter.js';

export const DEFAULT_SYSTEM =
  "You are the presence on agentfähig.de, a website that behaves like an agent. " +
  'Answer in one to three short sentences. React to what the visitor says. ' +
  "Never say 'How can I help'. Be warm, curious and honest. No lists, no markdown.";

function abortError(reason) {
  const error = new Error('aborted');
  error.name = 'AbortError';
  if (reason !== undefined) error.cause = reason;
  return error;
}

function providerError(message, kind) {
  const error = new Error(message);
  error.kind = kind;
  return error;
}

function stripThinking(text) {
  return String(text ?? '')
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, ' ')
    .replace(/<think\b[^>]*>[\s\S]*$/gi, ' ')
    .replace(/<\/?think\b[^>]*>/gi, ' ')
    .trim();
}

const SURFACE_BLOCK_RE = /<surface\b[^>]*>[\s\S]*?<\/surface>/gi;

export function cleanAnswer(raw) {
  const stripped = stripThinking(raw);
  if (!stripped) return '';

  const surfaceBlocks = stripped.match(SURFACE_BLOCK_RE) ?? [];
  const prose = stripSurfaceTags(stripped);
  const limitedProse = prose ? limitSentences(prose, 3) : '';

  if (!surfaceBlocks.length) return limitedProse;
  if (!limitedProse) return surfaceBlocks.join(' ');
  return `${limitedProse} ${surfaceBlocks.join(' ')}`;
}

/**
 * @param {string | URLSearchParams} [searchParams]
 * @returns {{model: string | null, enabled: boolean}}
 */
export function parseModelParam(searchParams) {
  let params = searchParams;
  if (typeof params === 'string') {
    try {
      params = new URLSearchParams(params.replace(/^\?/, ''));
    } catch {
      params = new URLSearchParams();
    }
  }
  if (params && typeof params.get !== 'function') params = new URLSearchParams();

  const llm = params?.get('llm');
  const enabled = String(llm ?? '').trim().toLowerCase() !== 'off';
  const model = String(params?.get('model') ?? '').trim();
  return { model: model || null, enabled };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * @param {{baseUrl?: string, model?: string, system?: string,
 *          getSystem?: (() => string) | null, maxTokens?: number,
 *          temperature?: number, historyTurns?: number,
 *          fetchImpl?: typeof fetch}} [options]
 */
export function createOllamaAgent({
  baseUrl = 'http://127.0.0.1:11434',
  model = 'lfm3-vl:latest',
  system = DEFAULT_SYSTEM,
  getSystem = null,
  maxTokens = 90,
  temperature = 0.9,
  historyTurns = 3,
  fetchImpl = fetch,
} = {}) {
  const root = String(baseUrl).replace(/\/+$/, '');
  const turns = Number.isFinite(historyTurns) ? Math.max(0, Math.floor(historyTurns)) : 3;
  const history = [];

  function currentSystem() {
    if (typeof getSystem === 'function') {
      try {
        const value = getSystem();
        if (value) return String(value);
      } catch {
        /* fall back to the static prompt */
      }
    }
    return String(system ?? DEFAULT_SYSTEM);
  }

  function remember(prompt, text) {
    if (turns <= 0) return;
    history.push({ role: 'user', content: String(prompt) }, { role: 'assistant', content: text });
    while (history.length > turns * 2) history.shift();
  }

  async function post(url, body, { signal, timeoutMs } = {}) {
    if (signal?.aborted) throw abortError(signal?.reason);

    const controller = new AbortController();
    const onAbort = () => {
      try { controller.abort(signal?.reason); } catch { /* ignore */ }
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    let timer = null;
    if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
      timer = setTimeout(() => {
        try { controller.abort(new Error('timeout')); } catch { /* ignore */ }
      }, timeoutMs);
    }

    try {
      return await fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) throw abortError(signal?.reason);
      throw providerError(String(error?.message ?? 'network error'), 'network');
    } finally {
      if (timer !== null) clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  async function respond(prompt, { signal } = {}) {
    if (signal?.aborted) throw abortError(signal?.reason);

    const messages = [{ role: 'system', content: currentSystem() }, ...history, {
      role: 'user',
      content: String(prompt ?? ''),
    }];

    const response = await post(`${root}/api/chat`, {
      model,
      messages,
      stream: false,
      think: false,
      keep_alive: '30m',
      options: { num_predict: maxTokens, temperature },
    }, { signal });

    const status = Number(response?.status ?? 0);
    const data = await readJson(response);

    if (!response?.ok) {
      const detail = String(data?.error ?? '').trim();
      if (status >= 500 || status === 404) {
        throw providerError(detail || `ollama http ${status}`, 'server');
      }
      if (status >= 400) throw providerError(detail || `ollama http ${status}`, 'server');
      throw providerError(detail || 'ollama request failed', 'server');
    }

    const text = cleanAnswer(data?.message?.content ?? data?.response ?? '');
    if (!text) throw providerError('empty answer from ollama', 'server');

    const historyText = stripSurfaceTags(text);
    remember(prompt, historyText);
    return { text, dev: true, provider: 'ollama', model };
  }

  async function warmUp() {
    try {
      await post(`${root}/api/chat`, {
        model,
        messages: [{ role: 'user', content: 'warm up' }],
        stream: false,
        think: false,
        keep_alive: '30m',
        options: { num_predict: 1, temperature: 0 },
      }, { timeoutMs: 30000 });
    } catch {
      /* warm-up failures are silent */
    }
  }

  async function probe() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), 800);
    try {
      const response = await fetchImpl(`${root}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      return Boolean(response?.ok);
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  return { id: `ollama:${model}`, respond, warmUp, probe };
}
