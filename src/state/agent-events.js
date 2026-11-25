// Canonical AgentEvent schema, SSE codec, and embodied observation bus (ADR-0008).

export const AGENT_EVENT_TYPES = Object.freeze([
  'turn.received',
  'turn.interrupted',
  'turn.completed',
  'turn.waiting',
  'context.prepared',
  'surface.adapted',
  'embedding.started',
  'embedding.completed',
  'embedding.timeout',
  'embedding.failed',
  'retrieval.started',
  'retrieval.completed',
  'retrieval.failed',
  'tool.started',
  'tool.retry',
  'tool.completed',
  'tool.failed',
  'provider.started',
  'provider.retry',
  'provider.failed',
  'provider.switched',
  'generation.started',
  'generation.completed',
  'response.streaming',
  'response.completed',
  'system.error',
]);

export const AGENT_EVENT_CATEGORIES = Object.freeze([
  'turn',
  'context',
  'surface',
  'embedding',
  'retrieval',
  'tool',
  'provider',
  'generation',
  'response',
  'system',
]);

export const AGENT_EVENT_STATUSES = Object.freeze([
  'started',
  'running',
  'success',
  'empty',
  'warning',
  'error',
  'timeout',
  'cancelled',
]);

const FORBIDDEN_KEY = /(api[_-]?key|apikey|secret|token|password|passwd|auth|authorization|bearer|cookie|session|prompt|system|messages|reasoning|thought|think|raw|chunk[_-]?text|ip|client[_-]?ip|stack|headers)/i;
const THINK_BLOCK = /<think[\s\S]*?<\/think>/gi;
const BEARER = /Bearer\s+\S+/gi;
const SK_KEY = /sk-[A-Za-z0-9_-]{10,}/g;

const VALID_TYPES = new Set(AGENT_EVENT_TYPES);

export function turnIdFor(turn) {
  if (typeof turn === 'string' && /^turn-\d+$/.test(turn.trim())) return turn.trim();
  if (typeof turn === 'number' && Number.isFinite(turn) && turn >= 0) return `turn-${Math.floor(turn)}`;
  return 'turn-0';
}

export function parseTurnNumber(turnId) {
  if (typeof turnId === 'number' && Number.isFinite(turnId)) return Math.floor(turnId);
  if (typeof turnId === 'string') {
    const m = /^turn-(\d+)$/.exec(turnId.trim());
    if (m) return Number(m[1]);
  }
  return null;
}

export function isValidEventType(type) {
  return typeof type === 'string' && VALID_TYPES.has(type);
}

function sanitizeString(value) {
  let s = String(value);
  s = s.replace(THINK_BLOCK, '');
  s = s.replace(BEARER, '[REDACTED]');
  s = s.replace(SK_KEY, '[REDACTED]');
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length > 120) s = s.slice(0, 120);
  return s;
}

function sanitizeNumber(value) {
  if (!Number.isFinite(value)) return null;
  const str = String(value);
  const dot = str.indexOf('.');
  if (dot !== -1 && str.length - dot - 1 > 4) return Number(value.toFixed(4));
  return value;
}

function isForbiddenKey(key) {
  if (key === 'text' || key === 'content') return true;
  return FORBIDDEN_KEY.test(key);
}

function sanitizePrimitiveItem(item) {
  if (typeof item === 'boolean') return item;
  if (typeof item === 'number' && Number.isFinite(item)) return sanitizeNumber(item);
  if (item === null) return null;
  if (typeof item === 'string') return sanitizeString(item);
  return undefined;
}

export function sanitizeMetadata(rawMetadata) {
  if (!rawMetadata || typeof rawMetadata !== 'object' || Array.isArray(rawMetadata)) {
    return Object.freeze({});
  }

  const out = {};
  let count = 0;

  for (const [key, value] of Object.entries(rawMetadata)) {
    if (count >= 16) break;
    if (isForbiddenKey(key)) continue;

    if (typeof value === 'boolean') {
      out[key] = value;
      count++;
      continue;
    }
    if (value === null) {
      out[key] = null;
      count++;
      continue;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = sanitizeNumber(value);
      count++;
      continue;
    }
    if (typeof value === 'string') {
      out[key] = sanitizeString(value);
      count++;
      continue;
    }
    if (Array.isArray(value)) {
      const items = [];
      for (const item of value) {
        if (items.length >= 6) break;
        const clean = sanitizePrimitiveItem(item);
        if (clean !== undefined) items.push(clean);
      }
      if (items.length > 0) {
        out[key] = Object.freeze([...items]);
        count++;
      }
    }
  }

  return Object.freeze(out);
}

export function inferDefaultStatus(type, metadata) {
  if (type.endsWith('.started')) return 'started';
  if (type.endsWith('.completed')) {
    if (type === 'retrieval.completed' && metadata?.coverage === 'NOT_COVERED') return 'empty';
    return 'success';
  }
  if (type.endsWith('.failed') || type === 'system.error') return 'error';
  if (type.endsWith('.timeout')) return 'timeout';
  if (type.endsWith('.interrupted')) return 'cancelled';
  if (type.endsWith('.retry') || type.endsWith('.switched')) return 'warning';
  if (type.endsWith('.received') || type.endsWith('.streaming')) return 'running';
  if (type === 'context.prepared' || type === 'surface.adapted' || type === 'turn.waiting') return 'success';
  return 'running';
}

export function createAgentEvent(partial = {}, { turnStartMs = null, now = () => Date.now() } = {}) {
  const type = partial.type;
  if (!isValidEventType(type)) {
    throw new TypeError(`createAgentEvent: invalid or missing type: ${type}`);
  }

  const category = type.split('.')[0];
  const actionTail = type.split('.')[1] ?? 'event';
  let action_id = partial.action_id;
  if (typeof action_id === 'string' && action_id.trim()) {
    action_id = action_id.trim().slice(0, 80);
  } else {
    action_id = `${category}-${actionTail}`.slice(0, 80);
  }

  const turn_id = turnIdFor(partial.turn_id ?? partial.turn ?? 0);

  let timestamp;
  if (Number.isFinite(partial.timestamp) && partial.timestamp >= 0) {
    timestamp = Math.round(partial.timestamp);
  } else if (Number.isFinite(turnStartMs)) {
    timestamp = Math.max(0, Math.round(now() - turnStartMs));
  } else {
    timestamp = 0;
  }

  let duration_ms = null;
  if (Number.isFinite(partial.duration_ms) && partial.duration_ms >= 0) {
    duration_ms = Math.round(partial.duration_ms);
  }

  const metadata = sanitizeMetadata(partial.metadata);

  let status = partial.status;
  if (!AGENT_EVENT_STATUSES.includes(status)) {
    status = inferDefaultStatus(type, metadata);
  }

  const simulated = Boolean(partial.simulated);

  return Object.freeze({
    turn_id,
    action_id,
    type,
    category,
    timestamp,
    duration_ms,
    status,
    simulated,
    metadata,
  });
}

export function sanitizeAgentEvent(raw) {
  if (!raw || typeof raw !== 'object' || !isValidEventType(raw.type)) return null;
  try {
    return createAgentEvent(raw);
  } catch {
    return null;
  }
}

export function formatSseFrame(eventName, data) {
  return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createSseParser({ onFrame } = {}) {
  let buffer = '';
  let eventType = '';
  const dataLines = [];

  function emitFrame() {
    if (dataLines.length === 0) {
      eventType = '';
      return;
    }
    const rawData = dataLines.join('\n');
    dataLines.length = 0;
    const ev = eventType || 'message';
    eventType = '';
    let data = rawData;
    try {
      data = JSON.parse(rawData);
    } catch {
      /* keep string */
    }
    onFrame?.({ event: ev, data, rawData });
  }

  function processLine(line) {
    if (line.startsWith(':')) return;
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim();
      return;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
      return;
    }
    if (line === '') {
      emitFrame();
    }
  }

  let pending = '';

  function push(chunkText) {
    buffer += String(chunkText ?? '');
    const normalized = buffer.replace(/\r\n/g, '\n');
    const parts = normalized.split('\n');
    buffer = parts.pop() ?? '';
    for (const line of parts) {
      processLine(line);
    }
  }

  function flush() {
    if (buffer.length > 0) {
      const rest = buffer.replace(/\r\n/g, '\n');
      buffer = '';
      if (rest !== '') processLine(rest);
    }
    if (dataLines.length > 0 || eventType) {
      emitFrame();
    }
  }

  function reset() {
    buffer = '';
    eventType = '';
    dataLines.length = 0;
  }

  return { push, flush, reset };
}

function isRealTurnActive(store) {
  if (!store) return false;
  const phase = store.getState().phase;
  return phase === 'thinking' || phase === 'speaking';
}

function sleepMs(ms, signal) {
  if (!signal) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      const err = signal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' });
      reject(err);
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      const err = signal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' });
      reject(err);
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export function createAgentEventBus({ store = null, now = () => Date.now(), maxTimeline = 240 } = {}) {
  let activeTurnId = store ? turnIdFor(store.getState().turn) : 'turn-0';
  let turnStartMs = now();
  const activeActions = new Map();
  const timeline = [];
  let droppedStaleCount = 0;
  let lastCoverage = null;
  let lastProvider = null;
  let simulatedActive = false;
  let seq = 0;
  let toolSeq = 0;
  const busListeners = new Set();
  let unsubStore = null;

  function getSnapshot() {
    const last = timeline.length ? timeline[timeline.length - 1].event : null;
    return {
      activeTurnId,
      activeActions: getActiveActions(),
      parallelCount: activeActions.size,
      droppedStaleCount,
      lastCoverage,
      lastProvider,
      simulatedActive,
      lastEvent: last,
    };
  }

  function notify(event, meta) {
    const snap = getSnapshot();
    for (const fn of [...busListeners]) fn(event, snap, meta);
  }

  function pushTimeline(stale, event) {
    const entry = { seq: ++seq, stale, receivedAtMs: now(), event };
    timeline.push(entry);
    while (timeline.length > maxTimeline) timeline.shift();
    return entry;
  }

  function clearActiveActionsSimulatedOnly() {
    for (const [id, act] of [...activeActions.entries()]) {
      if (!act.simulated) activeActions.delete(id);
    }
  }

  function resetTurnState(turnOrId) {
    activeTurnId = turnIdFor(turnOrId ?? (store ? store.getState().turn : 0));
    turnStartMs = now();
    activeActions.clear();
    lastCoverage = null;
    simulatedActive = false;
  }

  if (store) {
    unsubStore = store.subscribe((state, prev, event) => {
      if (event?.type === 'SUBMIT' || state.turn !== prev.turn) {
        resetTurnState(state.turn);
      }
      if (
        (event?.type === 'RESPONSE_END' && state.phase === 'idle') ||
        (event?.type === 'RESPONSE_ERROR' && state.phase === 'error')
      ) {
        clearActiveActionsSimulatedOnly();
      }
    });
  }

  function startTurn(turnOrId, { simulated = false } = {}) {
    resetTurnState(turnOrId);
    simulatedActive = Boolean(simulated);
    return activeTurnId;
  }

  function isStale(event, partialHadTurnId) {
    if (event.simulated) {
      simulatedActive = true;
      if (partialHadTurnId && !isRealTurnActive(store)) {
        activeTurnId = event.turn_id;
      }
      return false;
    }

    if (store) {
      const st = store.getState();
      const expectedTurnId = turnIdFor(st.turn);
      if (st.turn === 0 || event.turn_id !== expectedTurnId) return true;
      return false;
    }

    if (activeTurnId === 'turn-0' && event.turn_id !== 'turn-0') {
      activeTurnId = event.turn_id;
      return false;
    }

    if (activeTurnId !== 'turn-0' && event.turn_id !== activeTurnId) return true;
    return false;
  }

  function trackActiveAction(event) {
    if (
      event.type.endsWith('.started') ||
      event.type.endsWith('.retry') ||
      event.type === 'provider.switched'
    ) {
      if (event.type === 'provider.switched') {
        for (const [id, act] of [...activeActions.entries()]) {
          if (act.category === 'provider' && id !== event.action_id) activeActions.delete(id);
        }
      }
      const existing = activeActions.get(event.action_id);
      activeActions.set(event.action_id, {
        action_id: event.action_id,
        turn_id: event.turn_id,
        type: event.type,
        category: event.category,
        startedAtMs: existing?.startedAtMs ?? now(),
        timestamp: event.timestamp,
        status: event.status,
        metadata: event.metadata,
        simulated: event.simulated,
      });
      return event;
    }

    if (
      event.type.endsWith('.completed') ||
      event.type.endsWith('.failed') ||
      event.type.endsWith('.timeout')
    ) {
      let existing = activeActions.get(event.action_id);
      if (!existing) {
        for (const [, act] of activeActions) {
          if (act.category === event.category && act.action_id.startsWith(event.action_id.split('-')[0])) {
            existing = act;
            break;
          }
        }
      }
      let finalized = event;
      if (event.duration_ms === null && existing) {
        finalized = createAgentEvent(
          {
            ...event,
            duration_ms: Math.max(0, Math.round(now() - existing.startedAtMs)),
          },
          { turnStartMs, now },
        );
      }
      activeActions.delete(event.action_id);
      if (existing && existing.action_id !== event.action_id) {
        activeActions.delete(existing.action_id);
      }
      return finalized;
    }

    if (
      event.type === 'turn.interrupted' ||
      event.type === 'turn.completed' ||
      event.type === 'turn.waiting' ||
      event.type === 'response.completed' ||
      event.type === 'system.error'
    ) {
      activeActions.clear();
    }

    return event;
  }

  function emit(partialEvent) {
    const partialHadTurnId = partialEvent.turn_id !== undefined || partialEvent.turn !== undefined;
    let event = createAgentEvent(
      {
        ...partialEvent,
        turn_id: partialEvent.turn_id ?? partialEvent.turn ?? activeTurnId,
      },
      { turnStartMs, now },
    );

    if (isStale(event, partialHadTurnId)) {
      droppedStaleCount++;
      const entry = pushTimeline(true, event);
      notify(event, { stale: true, seq: entry.seq });
      return { accepted: false, stale: true, event };
    }

    event = trackActiveAction(event);

    if (event.type === 'retrieval.completed') {
      const cov = event.metadata.coverage;
      if (cov === 'GIVEN' || cov === 'NOT_COVERED') lastCoverage = cov;
    }
    const prov = event.metadata.provider ?? event.metadata.to;
    if (typeof prov === 'string') lastProvider = prov;

    const entry = pushTimeline(false, event);

    if (store) {
      store.dispatch({
        type: 'AGENT_EVENT',
        turn: parseTurnNumber(event.turn_id) ?? store.getState().turn,
        agentEvent: event,
        activeActionCount: activeActions.size,
        parallelCount: activeActions.size,
        simulated: event.simulated,
      });
    }

    notify(event, { stale: false, seq: entry.seq });
    return { accepted: true, stale: false, event };
  }

  async function runTool(
    toolName,
    fn,
    {
      turnId,
      actionId,
      metadata = {},
      maxRetries = 0,
      retryDelayMs = 60,
      signal = null,
      simulated = false,
    } = {},
  ) {
    const action_id = actionId || `tool-${toolName}-${++toolSeq}`;
    let attempt = 1;

    const base = {
      turn_id: turnId ?? activeTurnId,
      action_id,
      simulated,
    };

    emit({
      ...base,
      type: 'tool.started',
      metadata: { ...metadata, tool: toolName, attempt: 1 },
    });

    for (;;) {
      try {
        const result = await fn({ attempt, signal });
        emit({
          ...base,
          type: 'tool.completed',
          metadata: { ...metadata, tool: toolName, attempt },
        });
        return result;
      } catch (error) {
        if (signal?.aborted || error?.name === 'AbortError') throw error;
        if (attempt <= maxRetries) {
          emit({
            ...base,
            type: 'tool.retry',
            metadata: {
              ...metadata,
              tool: toolName,
              attempt: attempt + 1,
              reason: error?.code || error?.name || 'error',
            },
          });
          attempt++;
          await sleepMs(retryDelayMs, signal);
          continue;
        }
        emit({
          ...base,
          type: 'tool.failed',
          status: error?.name === 'TimeoutError' ? 'timeout' : 'error',
          metadata: {
            ...metadata,
            tool: toolName,
            attempt,
            reason: error?.code || error?.name || 'error',
          },
        });
        throw error;
      }
    }
  }

  function getActiveActions() {
    return [...activeActions.values()].sort((a, b) => a.startedAtMs - b.startedAtMs);
  }

  function getTimeline() {
    return timeline.slice();
  }

  function clearTimeline() {
    timeline.length = 0;
  }

  function reset() {
    resetTurnState(store ? store.getState().turn : 0);
    timeline.length = 0;
    droppedStaleCount = 0;
    seq = 0;
  }

  function subscribe(fn) {
    busListeners.add(fn);
    return () => busListeners.delete(fn);
  }

  function destroy() {
    if (unsubStore) unsubStore();
    unsubStore = null;
    busListeners.clear();
    activeActions.clear();
    timeline.length = 0;
  }

  return {
    startTurn,
    emit,
    runTool,
    getActiveActions,
    getTimeline,
    getSnapshot,
    clearTimeline,
    reset,
    subscribe,
    destroy,
  };
}