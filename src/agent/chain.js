// Fallback chain: try adapters in priority order, walk down on retryable
// failures, stop the whole chain on a visitor abort, and never fake success.
// In-memory only: reloading the page resets the circuit breaker.

const DEFAULTS = Object.freeze({
  timeoutMs: 8000,
  quotaTripAfter: 3,
  quotaCooldownMs: 60000,
  retryBackoffMs: 150,
});

export class AllProvidersFailed extends Error {
  constructor(attempts, message = 'All providers failed') {
    super(message);
    this.name = 'AllProvidersFailed';
    this.attempts = attempts;
  }
}

export class ContentFilterError extends Error {
  constructor(cause, provider) {
    super(cause?.message || 'content filtered');
    this.name = 'ContentFilterError';
    this.kind = 'content-filter';
    this.provider = provider;
    this.cause = cause;
  }
}

function abortError(reason) {
  const error = new Error('aborted');
  error.name = 'AbortError';
  if (reason !== undefined) error.cause = reason;
  return error;
}

function timeoutError(ms) {
  const error = new Error(`provider timed out after ${ms}ms`);
  error.name = 'TimeoutError';
  error.code = 'timeout';
  return error;
}

function positive(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

/**
 * Sort one adapter failure into the chain's policy classes.
 * quota/429/4006 -> next provider, timeout -> next, network -> next,
 * content-filter/400 -> fail the turn, 5xx -> one retry with backoff.
 */
export function classifyError(error) {
  const status = Number(error?.status ?? error?.statusCode ?? error?.response?.status);
  const code = String(error?.code ?? '').trim();
  const kind = String(error?.kind ?? error?.type ?? '').toLowerCase();
  const name = String(error?.name ?? '');
  const message = String(error?.message ?? '').toLowerCase();

  if (name === 'AbortError' || kind === 'abort') return 'abort';

  if (
    kind === 'quota' ||
    code === '4006' ||
    status === 429 ||
    status === 402 ||
    /quota|rate.?limit|too many requests/.test(message)
  ) return 'quota';

  if (
    kind === 'timeout' ||
    name === 'TimeoutError' ||
    code === 'ETIMEDOUT' ||
    code === 'timeout' ||
    /timed out|timeout/.test(message)
  ) return 'timeout';

  if (
    kind === 'content-filter' ||
    kind === 'content_filter' ||
    code === 'content_filter' ||
    /content.?filter|safety|moderation/.test(message)
  ) return 'content-filter';

  if (
    kind === 'network' ||
    name === 'TypeError' ||
    /ECONN|ENOTFOUND|EAI_AGAIN|socket|network|offline|fetch failed/i.test(code + ' ' + message)
  ) return 'network';

  if (kind === 'server' || status >= 500) return 'server';

  // A bare 400 is a bad request we must not replay against other providers.
  if (status === 400 || code === '400') return 'content-filter';

  return 'unknown';
}

function attemptProvider(adapter, prompt, { timeoutMs, signal }) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    let timer = null;
    const controller = new AbortController();

    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      if (timer !== null) clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (error) reject(error);
      else resolve(value);
    };

    const onAbort = () => {
      try { controller.abort(signal?.reason); } catch { /* ignore */ }
      finish(abortError(signal?.reason));
    };

    if (signal?.aborted) {
      finish(abortError(signal?.reason));
      return;
    }

    timer = setTimeout(() => {
      timedOut = true;
      const error = timeoutError(timeoutMs);
      try { controller.abort(error); } catch { /* ignore */ }
      finish(error);
    }, timeoutMs);

    signal?.addEventListener('abort', onAbort, { once: true });

    Promise.resolve()
      .then(() => adapter.respond(prompt, { signal: controller.signal }))
      .then(
        (value) => finish(null, value),
        (error) => finish(timedOut ? timeoutError(timeoutMs) : error),
      );
  });
}

function abortableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal?.reason));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal?.reason));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * @param {Array<{id: string, respond: (prompt: string, opts: {signal: AbortSignal}) => Promise<any>}>} adapters
 * @param {{timeoutMs?: number, now?: () => number, onAttempt?: Function,
 *          quotaTripAfter?: number, quotaCooldownMs?: number, retryBackoffMs?: number}} [options]
 * @returns {{respond: (prompt: string, opts?: {signal?: AbortSignal}) => Promise<{text: string, dev: boolean, provider: string, attempts: any[]}>}}
 */
export function createAgentChain(adapters, options = {}) {
  const list = Array.isArray(adapters)
    ? adapters.filter((adapter) => adapter && typeof adapter.respond === 'function')
    : [];
  const timeoutMs = positive(options.timeoutMs, DEFAULTS.timeoutMs);
  const quotaTripAfter = positive(options.quotaTripAfter, DEFAULTS.quotaTripAfter);
  const quotaCooldownMs = positive(options.quotaCooldownMs, DEFAULTS.quotaCooldownMs);
  const retryBackoffMs = Number.isFinite(options.retryBackoffMs)
    ? Math.max(0, options.retryBackoffMs)
    : DEFAULTS.retryBackoffMs;
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const onAttempt = typeof options.onAttempt === 'function' ? options.onAttempt : null;

  const breakers = new Map();

  function breakerFor(id) {
    let state = breakers.get(id);
    if (!state) {
      state = { quotaCount: 0, skipUntil: 0 };
      breakers.set(id, state);
    }
    return state;
  }

  function report(entry) {
    if (!onAttempt) return;
    try { onAttempt(entry); } catch { /* callbacks must not break the chain */ }
  }

  async function respond(prompt, { signal } = {}) {
    const attempts = [];
    if (signal?.aborted) throw abortError(signal?.reason);

    for (let index = 0; index < list.length; index++) {
      const adapter = list[index];
      const id = String(adapter.id ?? `adapter-${index}`);
      const breaker = breakerFor(id);

      if (breaker.skipUntil > now()) {
        const entry = {
          provider: id,
          attempt: 0,
          outcome: 'skipped',
          kind: 'quota',
          reason: 'circuit-open',
          skippedForMs: breaker.skipUntil - now(),
        };
        attempts.push(entry);
        report(entry);
        continue;
      }

      let attemptNumber = 0;
      let retried = false;

      for (;;) {
        if (signal?.aborted) throw abortError(signal?.reason);
        attemptNumber += 1;
        const startedAt = now();

        let result;
        try {
          result = await attemptProvider(adapter, prompt, { timeoutMs, signal });
        } catch (error) {
          if (signal?.aborted) throw abortError(signal?.reason);

          const kind = classifyError(error);
          const entry = {
            provider: id,
            attempt: attemptNumber,
            outcome: kind === 'timeout' ? 'timeout' : 'error',
            kind,
            elapsedMs: Math.max(0, now() - startedAt),
            message: String(error?.message ?? ''),
          };
          attempts.push(entry);
          report(entry);

          if (kind === 'quota') {
            breaker.quotaCount += 1;
            if (breaker.quotaCount >= quotaTripAfter) {
              breaker.skipUntil = now() + quotaCooldownMs;
            }
          } else {
            breaker.quotaCount = 0;
          }

          if (kind === 'content-filter') throw new ContentFilterError(error, id);

          if (kind === 'server' && !retried) {
            retried = true;
            await abortableDelay(retryBackoffMs, signal);
            continue;
          }

          break;
        }

        breaker.quotaCount = 0;
        const entry = {
          provider: id,
          attempt: attemptNumber,
          outcome: 'success',
          elapsedMs: Math.max(0, now() - startedAt),
        };
        attempts.push(entry);
        report(entry);

        return {
          ...result,
          text: String(result?.text ?? ''),
          dev: Boolean(result?.dev),
          provider: id,
          attempts,
        };
      }
    }

    throw new AllProvidersFailed(attempts);
  }

  return { respond };
}
