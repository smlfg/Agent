// Local-only session transcript recorder. Captures prompt/answer/provider turns
// in memory, mirrors the latest sessions to localStorage, and posts each turn
// to the local dev server so conversations are persisted to sessions/raw/.
// Never instantiated in production (see src/main.js isProductionHost guard).

const STORAGE_KEY = 'agentfaehig.local.sessions';
const MAX_STORED_SESSIONS = 30;

function defaultSessionId(tsMs) {
  const iso = new Date(tsMs).toISOString();
  const stamp = `${iso.slice(0, 10)}_${iso.slice(11, 19).replace(/:/g, '-')}`;
  const suffix = Math.random().toString(36).slice(2, 6).padEnd(4, '0');
  return `${stamp}_${suffix}`;
}

function defaultEndpoint() {
  const loc = globalThis.location;
  if (loc && (loc.hostname === '127.0.0.1' || loc.hostname === 'localhost') && String(loc.port) === '5173') {
    return '/__dev/transcript';
  }
  return 'http://127.0.0.1:5173/__dev/transcript';
}

function persistToStorage(storage, sessionId, origin, entries) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') return;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const sessions = Array.isArray(parsed) ? parsed.filter((s) => s && typeof s === 'object') : [];
    const filtered = sessions.filter((s) => s.sessionId !== sessionId);
    filtered.push({
      sessionId,
      origin,
      updatedAt: entries.at(-1)?.ts ?? new Date().toISOString(),
      entries: [...entries],
    });
    const trimmed = filtered.slice(-MAX_STORED_SESSIONS);
    storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota/disabled storage errors in local dev */
  }
}

function formatSources(sources) {
  if (!Array.isArray(sources) || !sources.length) return '';
  return sources
    .map((s) => s?.title || s?.id || s?.url || '')
    .filter(Boolean)
    .join(', ');
}

export function createLocalRecorder({
  sessionId,
  origin,
  endpoint,
  storage,
  fetchImpl,
  now = () => Date.now(),
} = {}) {
  const id = String(sessionId || defaultSessionId(now()));
  const resolvedOrigin = origin !== undefined ? String(origin) : String(globalThis.location?.origin ?? '');
  const resolvedEndpoint = endpoint !== undefined ? endpoint : defaultEndpoint();
  const resolvedStorage = storage === undefined ? (globalThis.localStorage ?? null) : storage;
  const resolvedFetch = fetchImpl === undefined
    ? (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null)
    : fetchImpl;

  const entries = [];
  let turnCounter = 0;

  function record(entry) {
    const fullEntry = {
      ts: new Date(now()).toISOString(),
      sessionId: id,
      origin: resolvedOrigin,
      ...entry,
    };
    entries.push(fullEntry);
    persistToStorage(resolvedStorage, id, resolvedOrigin, entries);

    if (resolvedFetch && resolvedEndpoint) {
      try {
        Promise.resolve(
          resolvedFetch(resolvedEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullEntry),
            keepalive: true,
          }),
        ).catch(() => {});
      } catch {
        /* never fail a turn due to local logging */
      }
    }

    return fullEntry;
  }

  function wrapRespond(respondFn) {
    return async (prompt, opts) => {
      turnCounter += 1;
      const turn = turnCounter;
      const startedAt = now();
      const promptText = String(prompt ?? '');

      try {
        const result = await respondFn(prompt, opts);
        const durationMs = Math.max(0, Math.round(now() - startedAt));
        record({
          turn,
          status: 'ok',
          prompt: promptText,
          answer: String(result?.text ?? ''),
          provider: result?.provider ?? null,
          model: result?.model ?? null,
          dev: Boolean(result?.dev),
          sources: Array.isArray(result?.sources) ? result.sources : [],
          coverage: result?.coverage ?? null,
          contact_card: Boolean(result?.contact_card),
          durationMs,
        });
        return result;
      } catch (error) {
        const durationMs = Math.max(0, Math.round(now() - startedAt));
        const aborted = error?.name === 'AbortError' || error?.kind === 'abort';
        record({
          turn,
          status: aborted ? 'aborted' : 'error',
          prompt: promptText,
          error: String(error?.message ?? error ?? 'error'),
          durationMs,
        });
        throw error;
      }
    };
  }

  function exportMarkdown() {
    const lines = [
      `# Local Session ${id}`,
      '',
      `- Origin: ${resolvedOrigin || 'unknown'}`,
      `- Turns: ${entries.length}`,
      '',
    ];
    for (const entry of entries) {
      lines.push(`## Turn ${entry.turn ?? '?'} (${entry.ts}) — ${entry.status ?? 'ok'}`);
      lines.push('');
      lines.push(`**Visitor:** ${entry.prompt ?? ''}`);
      lines.push('');
      if (entry.status === 'ok') {
        lines.push(`**Agent:** ${entry.answer ?? ''}`);
        lines.push('');
        const meta = [
          `provider=${entry.provider ?? 'unknown'}`,
          `model=${entry.model ?? 'none'}`,
          `dev=${Boolean(entry.dev)}`,
          `latency=${entry.durationMs ?? 0}ms`,
        ];
        if (entry.coverage) meta.push(`coverage=${JSON.stringify(entry.coverage)}`);
        if (entry.contact_card) meta.push('contact_card=true');
        const src = formatSources(entry.sources);
        if (src) meta.push(`sources=${src}`);
        lines.push(`_Meta: ${meta.join(' | ')}_`);
      } else {
        lines.push(`**Error:** ${entry.error ?? 'unknown error'} (${entry.durationMs ?? 0}ms)`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  return {
    sessionId: id,
    getEntries: () => [...entries],
    record,
    wrapRespond,
    exportMarkdown,
  };
}
