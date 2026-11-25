// Layer 3 — Embodiment orchestrator: maps AgentEvents to eye overlays, spatial tokens,
// and accessible status without coupling to vendor eye markup.

import { EMBODIED_INTENT_PROFILES } from './eye-motion-profiles.js';

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

/** Higher number = wins when multiple actions run in parallel. */
export const INTENT_PRIORITY = Object.freeze({
  error: 100,
  interrupted: 95,
  tool_failed: 90,
  switching: 85,
  tooling: 80,
  tool_retry: 78,
  searching: 75,
  multi_source: 74,
  grounded: 72,
  uncovered: 70,
  degraded: 68,
  concentrating: 60,
  streaming: 55,
  pausing: 54,
  completing: 52,
  orienting: 45,
  contextualizing: 30,
  embedding: 28,
  waiting: 20,
  idle: 10,
});

const CRITICAL_INTENTS = new Set([
  'searching',
  'grounded',
  'multi_source',
  'uncovered',
  'tooling',
  'tool_failed',
  'switching',
  'interrupted',
  'error',
]);

const COALESCE_INTENTS = new Set(['contextualizing', 'embedding']);

const TERMINAL_EVENT_TYPES = new Set([
  'retrieval.completed',
  'tool.completed',
  'tool.failed',
  'embedding.timeout',
  'embedding.failed',
  'provider.switched',
  'response.completed',
  'turn.interrupted',
  'system.error',
]);

const EVENT_TO_INTENT = Object.freeze({
  'turn.received': 'orienting',
  'context.prepared': 'contextualizing',
  'embedding.started': 'embedding',
  'retrieval.started': 'searching',
  'retrieval.failed': 'degraded',
  'embedding.timeout': 'degraded',
  'embedding.failed': 'degraded',
  'tool.started': 'tooling',
  'tool.retry': 'tool_retry',
  'tool.failed': 'tool_failed',
  'provider.switched': 'switching',
  'provider.retry': 'switching',
  'generation.started': 'concentrating',
  'response.completed': 'completing',
  'turn.waiting': 'waiting',
  'turn.interrupted': 'interrupted',
  'system.error': 'error',
});

export const HUMAN_STATUS_LABELS = Object.freeze({
  orienting: Object.freeze({ en: 'Acknowledging turn', de: 'Nehme Anfrage an' }),
  contextualizing: Object.freeze({ en: 'Preparing context', de: 'Bereite Kontext vor' }),
  embedding: Object.freeze({ en: 'Embedding query', de: 'Bette Anfrage ein' }),
  searching: Object.freeze({ en: 'Searching knowledge', de: 'Durchsuche Wissen' }),
  grounded: Object.freeze({ en: 'Relevant source found', de: 'Belegte Quelle gefunden' }),
  multi_source: Object.freeze({ en: 'Multiple sources matched', de: 'Mehrere Quellen verbunden' }),
  uncovered: Object.freeze({ en: 'Not in verified sources', de: 'Nicht in belegten Quellen' }),
  degraded: Object.freeze({ en: 'Fallback active', de: 'Ausweichpfad aktiv' }),
  tooling: Object.freeze({ en: 'Running tool', de: 'Werkzeug aktiv' }),
  tool_retry: Object.freeze({ en: 'Retrying tool', de: 'Werkzeug erneut' }),
  tool_failed: Object.freeze({ en: 'Tool failed', de: 'Werkzeug fehlgeschlagen' }),
  switching: Object.freeze({ en: 'Switching model provider', de: 'Wechsle Modell-Anbieter' }),
  concentrating: Object.freeze({ en: 'Formulating answer', de: 'Formuliere Antwort' }),
  streaming: Object.freeze({ en: 'Responding', de: 'Antwortet' }),
  pausing: Object.freeze({ en: 'Brief pause', de: 'Kurze Pause' }),
  completing: Object.freeze({ en: 'Finishing response', de: 'Schließe Antwort ab' }),
  waiting: Object.freeze({ en: 'Waiting', de: 'Wartet' }),
  interrupted: Object.freeze({ en: 'Turn interrupted', de: 'Turn unterbrochen' }),
  error: Object.freeze({ en: 'Temporarily unavailable', de: 'Vorübergehend nicht erreichbar' }),
  idle: Object.freeze({ en: 'Ready', de: 'Bereit' }),
});

const ACTION_TYPE_INTENT = Object.freeze({
  'retrieval.started': 'searching',
  'tool.started': 'tooling',
  'tool.retry': 'tool_retry',
  'embedding.started': 'embedding',
  'generation.started': 'concentrating',
  'provider.switched': 'switching',
  'provider.retry': 'switching',
  'provider.started': 'switching',
});

function intentFromEvent(event) {
  if (!event || typeof event.type !== 'string') return 'idle';

  if (event.type === 'retrieval.completed') {
    const cov = event.metadata?.coverage;
    const hits = Number(event.metadata?.hits);
    const multi = event.metadata?.multi_source === true || (Number.isFinite(hits) && hits >= 2);
    if (cov === 'GIVEN' && multi) return 'multi_source';
    if (cov === 'GIVEN') return 'grounded';
    if (cov === 'NOT_COVERED') return 'uncovered';
    return 'grounded';
  }

  if (event.type === 'response.streaming') {
    const streamState = event.metadata?.state;
    if (streamState === 'pausing') return 'pausing';
    return 'streaming';
  }

  return EVENT_TO_INTENT[event.type] ?? null;
}

function intentFromActiveAction(action) {
  if (!action?.type) return null;
  if (action.type === 'retrieval.started') return 'searching';
  return ACTION_TYPE_INTENT[action.type] ?? null;
}

function pickHighestIntent(intents) {
  let best = 'idle';
  let bestPri = INTENT_PRIORITY.idle;
  for (const name of intents) {
    if (!name) continue;
    const pri = INTENT_PRIORITY[name] ?? 0;
    if (pri > bestPri) {
      bestPri = pri;
      best = name;
    }
  }
  return best;
}

/**
 * Pure resolver: event + bus snapshot → embodied intent name.
 *
 * @param {{ event?: object, snapshot?: object, phase?: string }} input
 * @returns {string}
 */
export function resolveEmbodiedIntent({ event = null, snapshot = null, phase = 'idle' } = {}) {
  const candidates = [];

  const direct = intentFromEvent(event);
  if (direct) candidates.push(direct);

  const actions = snapshot?.activeActions;
  if (Array.isArray(actions) && actions.length) {
    for (const act of actions) {
      const fromAct = intentFromActiveAction(act);
      if (fromAct) candidates.push(fromAct);
    }
  }

  if (!candidates.length) {
    if (phase === 'thinking') candidates.push('concentrating');
    else if (phase === 'speaking') candidates.push('streaming');
    else if (phase === 'listening') candidates.push('orienting');
    else if (phase === 'error') candidates.push('error');
    else candidates.push('idle');
  }

  return pickHighestIntent(candidates);
}

const EMBODIED_CSS_VARS = [
  '--embodied-depth-boost',
  '--embodied-sheen-boost',
  '--embodied-focal-boost',
  '--embodied-search-sweep',
  '--embodied-parallel-load',
  '--embodied-haze-boost',
];

const HISTORY_MAX = 32;

/**
 * @param {{
 *   eventBus?: { subscribe: Function, getSnapshot?: Function } | null,
 *   store?: { subscribe: Function, getState: Function } | null,
 *   presence?: { setEmbodiedOverlay?: Function, clearEmbodiedOverlay?: Function, setState?: Function, unlockState?: Function, triggerCue?: Function } | null,
 *   stage?: HTMLElement | null,
 *   root?: HTMLElement | null,
 *   reducedMotion?: boolean,
 *   minDwellMs?: number,
 *   now?: () => number,
 * }} [options]
 */
export function mountEmbodiment({
  eventBus = null,
  store = null,
  presence = null,
  stage = null,
  root = null,
  reducedMotion = false,
  minDwellMs = 110,
  now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
} = {}) {
  const doc =
    typeof document !== 'undefined'
      ? document
      : null;
  const docRoot = doc?.documentElement ?? null;
  const presenceRoot = root ?? (doc ? doc.getElementById('presence') : null);
  const stageEl = stage ?? (doc ? doc.getElementById('stage') : null);
  const statusEl = doc ? doc.getElementById('embodied-status') : null;

  let destroyed = false;
  let intent = 'idle';
  let eyeState = 'idle';
  let coverage = null;
  let hits = 0;
  let parallelCount = 0;
  let simulated = false;
  let lastVisualCommitAt = 0;
  let dwellTimer = null;
  let settleTimer = null;
  const intentHistory = [];
  let readingX = 0;
  let pendingIntent = null;

  const win = doc?.defaultView ?? (typeof globalThis !== 'undefined' ? globalThis : {});

  function clearTimer(id) {
    if (id != null && typeof win.clearTimeout === 'function') win.clearTimeout(id);
  }

  function scheduleDwell(ms, fn) {
    clearTimer(dwellTimer);
    if (typeof win.setTimeout !== 'function') {
      fn();
      return;
    }
    dwellTimer = win.setTimeout(() => {
      dwellTimer = null;
      if (!destroyed) fn();
    }, ms);
  }

  function pushHistory(name, at = now()) {
    intentHistory.push({ intent: name, at });
    while (intentHistory.length > HISTORY_MAX) intentHistory.shift();
  }

  function setCssBoost(name, value) {
    const target = stageEl?.style ?? docRoot?.style;
    if (!target) return;
    if (value == null || value === 0 || value === '0') {
      target.removeProperty(name);
    } else {
      target.setProperty(name, String(value));
    }
  }

  function clearEmbodiedBoosts() {
    const target = stageEl?.style ?? docRoot?.style;
    if (!target) return;
    for (const name of EMBODIED_CSS_VARS) target.removeProperty(name);
  }

  function applySpatialTokens(profile, extra = {}) {
    const depth = profile.depthBoost ?? 0;
    const sheen = profile.sheenBoost ?? 0;
    const focal = profile.focalBoost ?? 0;
    const sweep = profile.searchSweep ?? 0;
    const haze = profile.hazeBoost ?? 0;
    const parallel = extra.parallelBoost ?? 0;

    setCssBoost('--embodied-depth-boost', depth);
    setCssBoost('--embodied-sheen-boost', sheen);
    setCssBoost('--embodied-focal-boost', focal);
    setCssBoost('--embodied-search-sweep', sweep);
    setCssBoost('--embodied-haze-boost', haze);
    setCssBoost('--embodied-parallel-load', parallel);
  }

  function updateDomAttributes(name, meta = {}) {
    if (presenceRoot) {
      presenceRoot.dataset.agentIntent = name === 'idle' ? 'idle' : name;
    }
    if (stageEl) {
      stageEl.dataset.agentIntent = name === 'idle' ? 'idle' : name;
      if (meta.parallelCount >= 2) {
        stageEl.dataset.parallelActions = String(meta.parallelCount);
      } else {
        delete stageEl.dataset.parallelActions;
      }
    }
    if (meta.simulated === true) {
      presenceRoot?.setAttribute('data-embodied-simulated', 'true');
      stageEl?.setAttribute('data-embodied-simulated', 'true');
    } else if (meta.clearSimulated) {
      presenceRoot?.removeAttribute('data-embodied-simulated');
      stageEl?.removeAttribute('data-embodied-simulated');
    }
    if (meta.coverage === 'GIVEN' || meta.coverage === 'NOT_COVERED') {
      presenceRoot?.setAttribute('data-retrieval-coverage', meta.coverage);
      stageEl?.setAttribute('data-retrieval-coverage', meta.coverage);
    } else if (meta.clearCoverage) {
      presenceRoot?.removeAttribute('data-retrieval-coverage');
      stageEl?.removeAttribute('data-retrieval-coverage');
    }
  }

  function updateStatusLabel(name) {
    if (!statusEl) return;
    const labels = HUMAN_STATUS_LABELS[name] ?? HUMAN_STATUS_LABELS.idle;
    const lang = doc?.documentElement?.lang?.startsWith('de') ? 'de' : 'en';
    statusEl.textContent = labels[lang] ?? labels.en;
    statusEl.dataset.intent = name;
  }

  function buildOverlay(name, parallelBoost = 0, offsetXExtra = 0) {
    const base = EMBODIED_INTENT_PROFILES[name];
    if (!base) return null;
    const overlay = { ...base };
    if (parallelBoost > 0) {
      overlay.pupilDelta = (overlay.pupilDelta ?? 0) + parallelBoost;
    }
    if (offsetXExtra !== 0) {
      overlay.offsetX = (overlay.offsetX ?? 0) + offsetXExtra;
    }
    return overlay;
  }

  function commitIntent(name, meta = {}) {
    if (destroyed) return;
    intent = name;
    const profile = EMBODIED_INTENT_PROFILES[name];
    eyeState = profile?.baseEyeState ?? 'idle';
    parallelCount = meta.parallelCount ?? parallelCount;
    simulated = Boolean(meta.simulated);
    if (meta.coverage !== undefined) coverage = meta.coverage;
    if (meta.hits !== undefined) hits = meta.hits;

    const parallelBoost =
      parallelCount >= 2 ? Math.min(3, parallelCount - 1) * 0.035 : 0;

    const overlay = name === 'idle' ? null : buildOverlay(name, parallelBoost, readingX);
    if (presence?.clearEmbodiedOverlay && name === 'idle') {
      presence.clearEmbodiedOverlay();
      presence.unlockState?.();
    } else if (presence?.setEmbodiedOverlay && overlay) {
      presence.setEmbodiedOverlay(overlay);
    }

    applySpatialTokens(profile ?? {}, { parallelBoost });
    updateDomAttributes(name, meta);
    updateStatusLabel(name);
    pushHistory(name);
    lastVisualCommitAt = now();
  }

  function shouldCoalesce(name) {
    if (CRITICAL_INTENTS.has(name)) return false;
    if (!COALESCE_INTENTS.has(name)) return false;
    const elapsed = now() - lastVisualCommitAt;
    return elapsed < minDwellMs && !CRITICAL_INTENTS.has(intent);
  }

  function applyIntent(name, meta = {}, { force = false } = {}) {
    if (destroyed) return;
    if (!force && shouldCoalesce(name)) {
      pendingIntent = { name, meta };
      scheduleDwell(minDwellMs, () => {
        if (pendingIntent) {
          const p = pendingIntent;
          pendingIntent = null;
          commitIntent(p.name, p.meta);
        }
      });
      return;
    }
    pendingIntent = null;
    commitIntent(name, meta);
  }

  function handleAgentEvent(event, snapshot, meta) {
    if (destroyed || meta?.stale === true) return;

    const phase = store?.getState?.().phase ?? 'idle';
    const resolved = resolveEmbodiedIntent({ event, snapshot, phase });

    if (event?.type === 'retrieval.completed') {
      const cov = event.metadata?.coverage;
      if (cov === 'GIVEN' || cov === 'NOT_COVERED') {
        coverage = cov;
        hits = Number.isFinite(event.metadata?.hits) ? Math.floor(event.metadata.hits) : hits;
      }
    }

    if (event?.simulated === true) simulated = true;
    else if (event?.type === 'turn.received' && event.simulated === false) simulated = false;

    parallelCount = snapshot?.parallelCount ?? parallelCount;

    if (event?.type === 'response.streaming') {
      const progress = clamp(Number(event.metadata?.progress ?? 0), 0, 1);
      const lineProgress = clamp(
        Number(event.metadata?.line_progress ?? ((progress * 3) % 1)),
        0,
        1,
      );
      const streamState = event.metadata?.state;
      if (reducedMotion) {
        readingX = 0;
      } else if (streamState === 'pausing') {
        readingX = 0;
      } else {
        readingX = (lineProgress - 0.5) * 0.28;
      }
    }

    const isTerminal = TERMINAL_EVENT_TYPES.has(event?.type);
    const force = isTerminal || CRITICAL_INTENTS.has(resolved);

    applyIntent(resolved, {
      parallelCount,
      simulated,
      coverage,
      hits,
      clearSimulated: event?.type === 'turn.received' && !event.simulated,
    }, { force });

    if (isTerminal && snapshot?.parallelCount >= 1 && !CRITICAL_INTENTS.has(resolved)) {
      scheduleDwell(minDwellMs, () => {
        const snap = eventBus?.getSnapshot?.() ?? snapshot;
        const next = resolveEmbodiedIntent({ event: null, snapshot: snap, phase: store?.getState?.().phase });
        if (next !== intent) applyIntent(next, { parallelCount: snap?.parallelCount ?? 0, simulated, coverage, hits }, { force: true });
      });
    }

    if (event?.type === 'response.completed' || event?.type === 'turn.completed') {
      clearTimer(settleTimer);
      settleTimer = win.setTimeout?.(() => {
        settleTimer = null;
        if (!destroyed) {
          applyIntent('idle', { clearCoverage: false, parallelCount: 0, simulated }, { force: true });
        }
      }, minDwellMs + 180);
    }

    if (event?.type === 'turn.interrupted') {
      clearTimer(dwellTimer);
      clearTimer(settleTimer);
      pendingIntent = null;
      applyIntent('interrupted', { parallelCount: 0, simulated, coverage, hits }, { force: true });
    }

    if (event?.type === 'SUBMIT' || (store && event === undefined)) {
      /* store SUBMIT clears coverage on next turn via store reducer; mirror on idle settle */
    }
  }

  function onStoreChange(state, prev, reduxEvent) {
    if (destroyed) return;
    if (reduxEvent?.type === 'SUBMIT') {
      coverage = null;
      hits = 0;
      updateDomAttributes(intent, { clearCoverage: true, parallelCount: 0 });
    }
    if (reduxEvent?.type === 'RESPONSE_END') {
      handleAgentEvent({ type: 'response.completed', simulated: false }, eventBus?.getSnapshot?.(), { stale: false });
    }
  }

  const unsubBus = eventBus?.subscribe?.((event, snapshot, meta) => {
    handleAgentEvent(event, snapshot, meta);
  });

  const unsubStore = store?.subscribe?.((state, prev, reduxEvent) => {
    onStoreChange(state, prev, reduxEvent);
  });

  function getState() {
    const labels = HUMAN_STATUS_LABELS[intent] ?? HUMAN_STATUS_LABELS.idle;
    const lang = doc?.documentElement?.lang?.startsWith('de') ? 'de' : 'en';
    return {
      intent,
      eyeState,
      coverage,
      hits,
      parallelCount,
      simulated,
      label: labels[lang] ?? labels.en,
      history: intentHistory.slice(),
    };
  }

  function reset() {
    if (destroyed) return;
    intent = 'idle';
    coverage = null;
    hits = 0;
    parallelCount = 0;
    simulated = false;
    readingX = 0;
    pendingIntent = null;
    clearTimer(dwellTimer);
    clearTimer(settleTimer);
    dwellTimer = null;
    settleTimer = null;
    presence?.clearEmbodiedOverlay?.();
    presence?.unlockState?.();
    clearEmbodiedBoosts();
    updateDomAttributes('idle', { clearCoverage: true, parallelCount: 0, clearSimulated: true });
    updateStatusLabel('idle');
    intentHistory.length = 0;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    unsubBus?.();
    unsubStore?.();
    clearTimer(dwellTimer);
    clearTimer(settleTimer);
    reset();
    if (presenceRoot) delete presenceRoot.dataset.agentIntent;
    if (stageEl) {
      delete stageEl.dataset.agentIntent;
      delete stageEl.dataset.parallelActions;
    }
  }

  return {
    getState,
    applyIntent,
    reset,
    destroy,
  };
}