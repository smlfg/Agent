// Layer 3: the 12 parameters -> CSS variables and runtime behaviour.
// applySurface is the only writer; mountMetrics applies it exactly once per
// turn, at RESPONSE_END.

import { createCollector } from './collect.js';
import { computeMetrics } from './compute.js';
import { createParameterEngine } from './engine.js';

export const PARAMETER_IDS = Object.freeze([
  'tempo', 'density', 'warmth', 'calm', 'closeness', 'openness',
  'attention', 'certainty', 'playfulness', 'formality', 'depth', 'energy',
]);

const NEUTRAL = Object.freeze(Object.fromEntries(PARAMETER_IDS.map((id) => [id, 0.5])));

let lastBehaviour = derive(NEUTRAL);

export function currentBehaviour() {
  return lastBehaviour;
}

export function applySurface(params, root = defaultRoot()) {
  const values = {};
  for (const id of PARAMETER_IDS) values[id] = clamp01(params?.[id]);

  const behaviour = derive(values);
  writeVariables(root, values, behaviour);
  lastBehaviour = behaviour;
  return behaviour;
}

export function mountMetrics({ store, input = null, root = defaultRoot(), catalog = null } = {}) {
  if (!store || typeof store.subscribe !== 'function') {
    throw new TypeError('mountMetrics needs a store');
  }

  const collector = createCollector({ input });
  const history = [];
  let engine = catalog ? createParameterEngine({ catalog }) : null;
  let pendingMetrics = null;
  let pendingOverride = null;
  let pendingInputs = null;
  let destroyed = false;
  let applied = 0;

  const link = ensureStylesheet(root);

  const catalogReady = engine ? Promise.resolve(engine) : loadCatalog().then((loaded) => {
    if (!engine) engine = createParameterEngine({ catalog: loaded });
    return engine;
  }).catch(() => null);

  function commit(params) {
    applySurface(params, root);
    applied += 1;
    if (root?.dataset) root.dataset.surfaceLevel = String(applied);
  }

  const unsubscribe = store.subscribe((state, prev, event) => {
    if (destroyed) return;

    if (event.type === 'SUBMIT') {
      pendingInputs = collector.endTurn({
        turn: state.turn,
        prompt: event.prompt,
        phaseBeforeSubmit: prev.phase,
      });
      pendingMetrics = computeMetrics(pendingInputs.prompt, pendingInputs, history);
      return;
    }

    if (event.type !== 'RESPONSE_END') return;

    if (!pendingOverride && !pendingMetrics) return;

    if (pendingOverride) {
      commit(pendingOverride);
      pendingOverride = null;
      pendingMetrics = null;
    } else if (engine) {
      commit(engine.update(pendingMetrics));
      pendingMetrics = null;
    } else {
      const metrics = pendingMetrics;
      pendingMetrics = null;
      catalogReady.then((ready) => {
        if (!ready || destroyed) return;
        commit(ready.update(metrics));
      });
    }

    collector.markResponseEnd();
    if (pendingInputs) history.push({ ...pendingInputs, answer: String(event.text ?? state.answer ?? '') });
    if (pendingInputs) pendingInputs = null;
  });

  const doc = documentFor(root);
  function onOverride(event) {
    if (!event || typeof event.detail !== 'object' || event.detail === null) return;
    pendingOverride = { ...event.detail };
  }
  if (doc && typeof doc.addEventListener === 'function') {
    doc.addEventListener('agentfaehig:params', onOverride);
  }

  return {
    destroy() {
      destroyed = true;
      unsubscribe();
      collector.destroy();
      if (doc && typeof doc.removeEventListener === 'function') {
        doc.removeEventListener('agentfaehig:params', onOverride);
      }
      if (link && link.parentNode) link.parentNode.removeChild(link);
    },
  };
}

function derive(params) {
  const { tempo, density, warmth, calm, closeness, openness, attention,
    certainty, playfulness, formality, depth, energy } = params;

  const charDelayMs = Math.round(tempo <= 0.5
    ? 48 - 36 * tempo
    : 30 - 16 * (tempo - 0.5));
  const leaveMs = Math.round(900 - 600 * tempo);
  const onsetDelayMs = Math.round(clamp(500 + (depth - 0.5) * 1000, 250, 1800));
  const measureRem = Number(clamp(
    38 - 4 * density + 3 * (openness - 0.5) - 2 * (closeness - 0.5),
    30,
    42,
  ).toFixed(2));
  const gapRem = Number(clamp(0.75 + (density - 0.5) * 1.3, 0.5, 1.4).toFixed(2));
  const lineHeight = Number(clamp(1.5 + (depth - 0.5) * 0.5, 1.4, 1.75).toFixed(3));
  const answerWeight = Math.round(clamp(400 + (formality - 0.5) * 240, 320, 560));
  const letterSpacingEm = Number(clamp((formality - 0.5) * 0.03, -0.01, 0.02).toFixed(4));
  const tiltDeg = Number(clamp((playfulness - 0.5) * 2.4, 0, 1.2).toFixed(3));
  const jitterMs = Math.round(clamp(4 + (0.5 - certainty) * 60, 0, 35));
  const stallChance = Number(clamp((0.5 - certainty) * 0.16, 0, 0.08).toFixed(3));
  const chunksPerTick = density > 0.66 ? 2 : 1;
  const blinkIntervalMs = Math.round(clamp(4000 + (calm - 0.5) * 8000, 2600, 8000));
  const blinkJitterMs = Math.round(clamp(1200 - (calm - 0.5) * 1600, 400, 2000));
  const saccadeIntervalMs = Math.round(clamp(2500 + (calm - 0.5) * 4000, 1200, 4500));
  const saccadeRadiusPx = Math.round(clamp((8 + 20 * openness) * (1 - 0.4 * attention), 8, 28));
  const pupilScale = Number(clamp(
    1 + (closeness - 0.5) * 0.2 + (playfulness - 0.5) * 0.1,
    0.9,
    1.15,
  ).toFixed(3));
  const lidOpenRatio = Number(clamp((warmth - 0.5) * 0.44, 0, 0.22).toFixed(3));
  const gazeGain = Number((0.6 + 0.7 * closeness).toFixed(3));
  const gazeHoldMs = Math.round(300 + 1100 * warmth);
  const breatheMs = Math.round(clamp(6000 + (calm - 0.5) * 6000, 4000, 9000));
  const breatheAmplitude = Number((1 + energy * 0.04).toFixed(4));
  const thinkingDotsMs = Math.round(1800 - 900 * energy);
  const doubleBlinkP = Number((0.35 * playfulness * (1 - 0.6 * formality)).toFixed(3));
  const accent = hslFor(warmth);

  return {
    motion: true,
    charDelayMs,
    leaveMs,
    onsetDelayMs,
    blinkIntervalMs,
    saccadeIntervalMs,
    pupilScale,
    accent,
    variables: {
      '--type-cadence-ms': String(charDelayMs),
      '--type-char-ms': String(charDelayMs),
      '--type-jitter-ms': String(jitterMs),
      '--type-stall-chance': String(stallChance),
      '--type-chunks-per-tick': String(chunksPerTick),
      '--leave-ms': String(leaveMs),
      '--onset-delay-ms': String(onsetDelayMs),
      '--pair-measure': `${measureRem}rem`,
      '--pair-gap': `${gapRem}rem`,
      '--pair-line-height': String(lineHeight),
      '--answer-weight': String(answerWeight),
      '--letter-spacing': `${letterSpacingEm}em`,
      '--pair-tilt-deg': `${tiltDeg}deg`,
      '--accent': accent,
      '--accent-warmth': String(Number(warmth.toFixed(3))),
      '--blink-interval-ms': String(blinkIntervalMs),
      '--blink-jitter-ms': String(blinkJitterMs),
      '--saccade-interval-ms': String(saccadeIntervalMs),
      '--saccade-radius-px': String(saccadeRadiusPx),
      '--pupil-scale': String(pupilScale),
      '--lid-open-ratio': String(lidOpenRatio),
      '--gaze-gain': String(gazeGain),
      '--gaze-hold-ms': String(gazeHoldMs),
      '--breathe-ms': String(breatheMs),
      '--breathe-amplitude': String(breatheAmplitude),
      '--thinking-dots-ms': String(thinkingDotsMs),
    },
    type: {
      charMs: charDelayMs,
      jitterMs,
      stallChance,
      chunksPerTick,
      onsetMs: onsetDelayMs,
      leaveMs,
    },
    presence: {
      blinkMs: blinkIntervalMs,
      blinkJitterMs,
      doubleBlinkP,
      saccadeMs: saccadeIntervalMs,
      saccadeRadiusPx,
      pupilScale,
      lidOpenRatio,
      gazeGain,
      gazeHoldMs,
      breatheMs,
      breatheAmplitude,
    },
    pair: {
      measureRem,
      gapRem,
      lineHeight,
      weight: answerWeight,
      letterSpacingEm,
      tiltDeg,
    },
    prompt: { fragment: '' },
  };
}

function writeVariables(root, params, behaviour) {
  if (!root || !root.style || typeof root.style.setProperty !== 'function') return;
  for (const id of PARAMETER_IDS) {
    root.style.setProperty(`--p-${id}`, String(Number(params[id].toFixed(3))));
  }
  for (const [name, value] of Object.entries(behaviour.variables)) {
    root.style.setProperty(name, value);
  }
}

function hslFor(warmth) {
  const hue = Math.round(30 - 10 * warmth);
  const saturation = Math.round(42 + 20 * warmth);
  const lightness = Math.round(50 - 4 * warmth);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0.5;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function clamp(value, lo, hi) {
  const n = Number(value);
  if (!Number.isFinite(n)) return lo;
  return n < lo ? lo : n > hi ? hi : n;
}

function defaultRoot() {
  if (typeof document !== 'undefined' && document.documentElement) return document.documentElement;
  return null;
}

function documentFor(root) {
  if (root?.ownerDocument) return root.ownerDocument;
  if (typeof document !== 'undefined') return document;
  return root ?? null;
}

function ensureStylesheet(root) {
  const doc = root?.ownerDocument ?? (typeof document !== 'undefined' ? document : null);
  if (!doc || !doc.head || typeof doc.createElement !== 'function') return null;
  const existing = doc.querySelector('link[data-surface-styles]');
  if (existing) return existing;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../styles/surface.css', import.meta.url).href;
  link.dataset.surfaceStyles = '';
  doc.head.append(link);
  return link;
}

async function loadCatalog() {
  if (typeof fetch !== 'function') throw new Error('fetch unavailable');
  const response = await fetch(new URL('./metrics-catalog.json', import.meta.url));
  if (!response.ok) throw new Error(`catalog fetch failed: ${response.status}`);
  return response.json();
}
