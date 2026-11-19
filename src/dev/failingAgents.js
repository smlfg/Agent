// DEVELOPMENT ONLY — simulated provider failures so the fallback chain can be
// exercised without a backend. Open the page with ?fail=quota,timeout to put
// these in front of the canned dev agent.

import * as devAgent from './devAgent.js';
import { createAgentChain } from '../agent/chain.js';

export const FAILURE_KINDS = Object.freeze(['quota', 'timeout', 'network', 'server', 'content-filter']);

const ALIASES = Object.freeze({
  filter: 'content-filter',
  content_filter: 'content-filter',
  rate: 'quota',
  ratelimit: 'quota',
  'rate-limit': 'quota',
  429: 'quota',
  503: 'server',
  500: 'server',
});

function abortError() {
  const error = new Error('aborted');
  error.name = 'AbortError';
  return error;
}

export function normalizeFailureKind(value) {
  const key = String(value ?? '').trim().toLowerCase();
  if (!key) return null;
  const kind = ALIASES[key] ?? key;
  return FAILURE_KINDS.includes(kind) ? kind : null;
}

function failureError(kind) {
  switch (kind) {
    case 'quota': {
      const error = new Error('quota exceeded');
      error.name = 'QuotaError';
      error.kind = 'quota';
      error.status = 429;
      error.code = '4006';
      return error;
    }
    case 'timeout': {
      const error = new Error('simulated provider timeout');
      error.name = 'TimeoutError';
      error.kind = 'timeout';
      error.code = 'timeout';
      return error;
    }
    case 'network': {
      const error = new TypeError('simulated network failure');
      error.kind = 'network';
      error.code = 'ECONNRESET';
      return error;
    }
    case 'server': {
      const error = new Error('simulated server error');
      error.name = 'ServerError';
      error.kind = 'server';
      error.status = 503;
      return error;
    }
    case 'content-filter': {
      const error = new Error('simulated content filter');
      error.name = 'ContentFilterError';
      error.kind = 'content-filter';
      error.status = 400;
      return error;
    }
    default: {
      const error = new Error(`unknown simulated failure: ${kind}`);
      error.kind = 'unknown';
      return error;
    }
  }
}

/** One dev adapter that always fails with the given class. */
export function createFailingAgent(kind, { delayMs = 20, id } = {}) {
  const normalized = normalizeFailureKind(kind) ?? String(kind);
  return {
    id: id ?? `fail-${normalized}`,
    respond(prompt, { signal } = {}) {
      return new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(abortError());
          return;
        }
        const onAbort = () => {
          clearTimeout(timer);
          reject(abortError());
        };
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          reject(failureError(normalized));
        }, delayMs);
        signal?.addEventListener('abort', onAbort, { once: true });
      });
    },
  };
}

/** Read ?fail=quota,timeout (URLSearchParams, query string, or plain object). */
export function parseFailureKinds(searchParams) {
  let value = '';
  if (typeof searchParams === 'string') {
    const query = searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    value = new URLSearchParams(query).get('fail') ?? '';
  } else if (searchParams && typeof searchParams.get === 'function') {
    value = searchParams.get('fail') ?? '';
  } else if (searchParams && typeof searchParams === 'object') {
    value = searchParams.fail ?? '';
  }

  const kinds = [];
  for (const part of String(value).split(',')) {
    const kind = normalizeFailureKind(part);
    if (kind && !kinds.includes(kind)) kinds.push(kind);
  }
  return kinds;
}

/**
 * Build the dev chain: one failing adapter per requested kind, then the canned
 * dev agent as the last link. Unknown names are ignored.
 */
export function buildDevChain(searchParams, options = {}) {
  const adapters = parseFailureKinds(searchParams).map((kind) => createFailingAgent(kind));
  adapters.push({
    id: 'dev',
    respond: (prompt, opts) => devAgent.respond(prompt, opts),
  });
  return createAgentChain(adapters, options);
}
