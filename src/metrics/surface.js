// Layer 3: the 12 parameters -> CSS variables and runtime behaviour.
// applySurface is the only writer; mountMetrics applies it exactly once per
// turn, at RESPONSE_END.
//
// Three derived axes carry the mood across the whole surface:
//   temperature  warm (+1) <-> cold (-1)      (warmth, closeness, formality)
//   nervousness  nervous (+1) <-> calm (-1)   (calm, energy, tempo, attention)
//   compactness  dense/near (+1) <-> airy (-1) (density, closeness, depth)
// Colour, type, spacing and eye surroundings are interpolated from three
// anchor palettes (warm / neutral / cold) and written as CSS variables.
// Neutral (all parameters 0.5) reproduces the original warm prototype.

import { createCollector } from './collect.js';
import { computeMetrics } from './compute.js';
import { createParameterEngine } from './engine.js';

export const PARAMETER_IDS = Object.freeze([
  'tempo', 'density', 'warmth', 'calm', 'closeness', 'openness',
  'attention', 'certainty', 'playfulness', 'formality', 'depth', 'energy',
]);

const NEUTRAL = Object.freeze(Object.fromEntries(PARAMETER_IDS.map((id) => [id, 0.5])));

// Dev preview presets. Open living-surface.html?mood=warm|cold|nervous|calm or
// ?params=warmth:0.9,calm:0.2. Applied once at load; the next turn takes over.
export const MOOD_PRESETS = Object.freeze({
  warm: Object.freeze({
    warmth: 0.94, closeness: 0.86, formality: 0.18,
    calm: 0.62, energy: 0.55, tempo: 0.46,
  }),
  cold: Object.freeze({
    warmth: 0.06, closeness: 0.16, formality: 0.88,
    calm: 0.70, energy: 0.40, tempo: 0.55, depth: 0.60,
  }),
  nervous: Object.freeze({
    calm: 0.08, energy: 0.92, tempo: 0.90, attention: 0.28,
    certainty: 0.35, playfulness: 0.60,
  }),
  calm: Object.freeze({
    calm: 0.95, energy: 0.22, tempo: 0.30, attention: 0.82,
    certainty: 0.70,
  }),
});

// Colour anchors. RGB triples interpolate linearly; neutral is the current
// prototype palette (with --muted darkened so it reaches WCAG AA on --bg-end).
const ANCHORS = Object.freeze({
  neutral: {
    bgStart: [246, 241, 233], bgEnd: [237, 228, 211],
    text: [61, 50, 41], muted: [107, 91, 76],
    accent: [193, 122, 77], prompt: [122, 90, 64], focus: [138, 75, 34],
    line: [74, 63, 53], lineAlpha: 0.28,
    shadow: [63, 43, 29],
    skinHi: [241, 229, 212], skin: [230, 212, 187],
    skinShade: [214, 190, 159], skinDeep: [198, 172, 139],
    lash: [58, 39, 27], vein: [160, 96, 80],
    scleraHi: [255, 253, 249], scleraMid: [247, 238, 225],
    scleraLow: [237, 223, 204], scleraEdge: [222, 203, 179],
    scleraWarm: [208, 132, 88], scleraShade: [74, 52, 36],
    scleraInner: [60, 40, 28], lidShadow: [63, 43, 29],
  },
  warm: {
    bgStart: [255, 246, 230], bgEnd: [242, 223, 191],
    text: [51, 38, 26], muted: [109, 89, 66],
    accent: [180, 98, 42], prompt: [122, 74, 40], focus: [138, 67, 24],
    line: [92, 64, 38], lineAlpha: 0.30,
    shadow: [74, 45, 20],
    skinHi: [248, 234, 213], skin: [238, 215, 184],
    skinShade: [221, 190, 147], skinDeep: [201, 163, 116],
    lash: [70, 42, 18], vein: [176, 102, 72],
    scleraHi: [255, 251, 242], scleraMid: [251, 240, 220],
    scleraLow: [243, 226, 198], scleraEdge: [230, 208, 172],
    scleraWarm: [222, 150, 88], scleraShade: [88, 58, 30],
    scleraInner: [72, 46, 24], lidShadow: [74, 45, 20],
  },
  cold: {
    bgStart: [233, 238, 243], bgEnd: [201, 213, 223],
    text: [28, 40, 51], muted: [71, 88, 101],
    accent: [65, 101, 138], prompt: [63, 90, 116], focus: [44, 74, 102],
    line: [38, 52, 64], lineAlpha: 0.30,
    shadow: [26, 38, 50],
    skinHi: [234, 240, 245], skin: [216, 225, 232],
    skinShade: [191, 203, 213], skinDeep: [166, 182, 194],
    lash: [30, 46, 60], vein: [98, 126, 148],
    scleraHi: [248, 251, 253], scleraMid: [237, 243, 247],
    scleraLow: [222, 232, 239], scleraEdge: [203, 218, 228],
    scleraWarm: [98, 132, 160], scleraShade: [38, 56, 72],
    scleraInner: [28, 42, 56], lidShadow: [26, 38, 50],
  },
});

const SERIF_STACK = '"Newsreader", Georgia, "Times New Roman", serif';
const GROTESK_STACK = '"Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif';

let lastBehaviour = deriveSurface(NEUTRAL);

export function currentBehaviour() {
  return lastBehaviour;
}

export function parsePreviewParams(search = '') {
  let query;
  try {
    query = new URLSearchParams(String(search ?? ''));
  } catch {
    return null;
  }

  if (query.has('params')) {
    const parsed = {};
    for (const entry of query.get('params').split(',')) {
      const [rawId, rawValue] = entry.split(':');
      const id = String(rawId ?? '').trim();
      if (!PARAMETER_IDS.includes(id)) continue;
      const value = Number(String(rawValue ?? '').trim());
      if (!Number.isFinite(value)) continue;
      parsed[id] = clamp01(value);
    }
    if (Object.keys(parsed).length) return parsed;
  }

  const mood = String(query.get('mood') ?? '').trim().toLowerCase();
  if (mood && Object.prototype.hasOwnProperty.call(MOOD_PRESETS, mood)) {
    return { ...MOOD_PRESETS[mood] };
  }
  return null;
}

export function applySurface(params, root = defaultRoot(), options = {}) {
  const values = {};
  for (const id of PARAMETER_IDS) values[id] = clamp01(params?.[id]);

  const behaviour = deriveSurface(values, options);
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

  // Dev preview only when the URL actually carries mood/params.
  const preview = parsePreviewParams(searchOf(root));
  if (preview) commit(preview);

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

export function deriveSurface(params, options = {}) {
  const p = {};
  for (const id of PARAMETER_IDS) p[id] = clamp01(params?.[id]);

  const {
    tempo, density, warmth, calm, closeness, openness, attention,
    certainty, playfulness, formality, depth, energy,
  } = p;

  // ── Axes: no cap beyond -1..1; the 2.4/2.6 gains make 2–3 coloured turns
  // clearly visible to a stranger while a single neutral turn stays quiet.
  const temperature = Number(clamp(
    3.0 * (0.55 * (warmth - 0.5) + 0.30 * (closeness - 0.5) + 0.15 * (0.5 - formality)),
    -1,
    1,
  ).toFixed(4));
  const nervousness = Number(clamp(
    2.6 * (0.55 * (0.5 - calm) + 0.25 * (energy - 0.5) + 0.12 * (tempo - 0.5) + 0.08 * (0.5 - attention)),
    -1,
    1,
  ).toFixed(4));
  const compactness = Number(clamp(
    2.4 * (0.50 * (density - 0.5) + 0.35 * (closeness - 0.5) + 0.15 * (0.5 - depth)),
    -1,
    1,
  ).toFixed(4));

  const nervousUp = Math.max(0, nervousness);
  const calmDown = Math.max(0, -nervousness);
  const reducedMotion = Boolean(options?.reducedMotion ?? prefersReducedMotion());

  // ── Rhythm (behaviour; consumed by typewriter and, once wired, presence).
  const baseCharMs = tempo <= 0.5 ? 48 - 36 * tempo : 30 - 16 * (tempo - 0.5);
  const charDelayMs = Math.round(clamp(
    baseCharMs * (1 - 0.20 * nervousUp + 0.08 * calmDown),
    20,
    60,
  ));
  const leaveMs = Math.round(900 - 600 * tempo);
  const onsetDelayMs = Math.round(clamp(500 + (depth - 0.5) * 1000, 250, 1800));
  const jitterMs = Math.round(clamp(4 + (0.5 - certainty) * 60 + 12 * nervousUp, 0, 45));
  const stallChance = Number(clamp((0.5 - certainty) * 0.16, 0, 0.08).toFixed(3));
  const chunksPerTick = density > 0.66 ? 2 : 1;

  const baseBlink = 4000 + (calm - 0.5) * 8000;
  const blinkIntervalMs = Math.round(clamp(
    baseBlink * (1 - 0.18 * nervousUp) + 250 * calmDown,
    2200,
    8200,
  ));
  const blinkJitterMs = Math.round(clamp(1200 - (calm - 0.5) * 1600, 400, 2000));
  const baseSaccade = 2500 + (calm - 0.5) * 4000;
  const saccadeIntervalMs = Math.round(clamp(
    baseSaccade * (1 - 0.22 * nervousUp) + 150 * calmDown,
    900,
    4600,
  ));
  const saccadeRadiusPx = Math.round(clamp((8 + 20 * openness) * (1 - 0.4 * attention), 8, 28));
  const pupilScale = Number(clamp(
    1 + (closeness - 0.5) * 0.2 + (playfulness - 0.5) * 0.1,
    0.9,
    1.15,
  ).toFixed(3));
  const lidOpenRatio = Number(clamp((warmth - 0.5) * 0.44, 0, 0.22).toFixed(3));
  const gazeGain = Number((0.6 + 0.7 * closeness).toFixed(3));
  const gazeHoldMs = Math.round(300 + 1100 * warmth);
  const breatheMs = Math.round(clamp(6000 + (calm - 0.5) * 6000 + 600 * calmDown, 3600, 10800));
  const breatheAmplitude = Number((1 + energy * 0.04).toFixed(4));
  const thinkingDotsMs = Math.round(1800 - 900 * energy);
  const doubleBlinkP = Number((0.35 * playfulness * (1 - 0.6 * formality)).toFixed(3));

  // ── Layout / typography.
  const measureRem = Number(clamp(
    38 - 6 * compactness + 2.5 * (openness - 0.5),
    27,
    44,
  ).toFixed(2));
  const gapRem = Number(clamp(
    0.8 - 0.28 * compactness - 0.08 * nervousUp + 0.10 * calmDown,
    0.42,
    1.3,
  ).toFixed(2));
  const lineHeight = Number(clamp(
    1.5 + (depth - 0.5) * 0.5 + 0.16 * temperature,
    1.38,
    1.9,
  ).toFixed(3));
  const answerWeight = Math.round(clamp(400 + (formality - 0.5) * 240, 320, 560));
  const letterSpacingEm = Number(clamp(
    0.03 * (formality - 0.5) + 0.004 * Math.max(0, temperature) - 0.006 * Math.max(0, -temperature) - 0.004 * nervousUp,
    -0.02,
    0.02,
  ).toFixed(4));
  const tiltDeg = Number(clamp((playfulness - 0.5) * 2.4, 0, 1.2).toFixed(3));
  const typeScale = Number(clamp(1 - 0.06 * compactness - 0.02 * nervousUp, 0.88, 1.1).toFixed(4));
  const eyeGapPx = Math.round(clamp(
    16 - 6 * compactness - 3 * nervousUp + 4 * calmDown,
    8,
    32,
  ));

  // ── Palette and eye surroundings.
  const pal = pickPalette(temperature);
  const accent = hex(pal.accent);
  // Always write both stacks so a return to neutral restores the base pairing.
  const font = temperature > 0.25 ? SERIF_STACK : GROTESK_STACK;
  const fontReading = temperature > 0.25
    ? SERIF_STACK
    : temperature < -0.25 ? GROTESK_STACK : SERIF_STACK;

  const jitterAmp = reducedMotion ? 0 : nervousUp > 0.04 ? 0.35 + 0.65 * nervousUp : 0;
  const jitterState = reducedMotion || nervousUp <= 0.04 ? 'paused' : 'running';
  const jitterCycle = Math.round(clamp(4200 - 1400 * nervousness - 400 * energy, 2200, 4600));

  const irisHue = Number((205 * Math.max(0, -temperature) - 8 * Math.max(0, temperature)).toFixed(2));
  const irisSat = Number((1 + 0.12 * Math.max(0, temperature) - 0.28 * Math.max(0, -temperature)).toFixed(3));
  const irisBright = Number((1 + 0.04 * Math.max(0, temperature) - 0.06 * Math.max(0, -temperature)).toFixed(3));

  const variables = {
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

    // Whole-surface palette.
    '--bg-start': hex(pal.bgStart),
    '--bg-end': hex(pal.bgEnd),
    '--text': hex(pal.text),
    '--muted': hex(pal.muted),
    '--prompt': hex(pal.prompt),
    '--placeholder': hex(pal.muted),
    '--focus-ring': hex(pal.focus),
    '--line': rgba(pal.line, pal.lineAlpha),

    // Vendor eye environment tokens.
    '--neutral-50': hex(pal.bgStart),
    '--neutral-100': hex(mix(pal.bgStart, pal.bgEnd, 0.5)),
    '--neutral-200': hex(pal.bgEnd),
    '--border-strong': rgba(pal.line, 0.22),
    '--border-accent': rgba(pal.accent, 0.5),
    '--border-default': rgba(pal.line, 0.14),
    '--dark-bg': hex(pal.bgStart),

    // Whole-surface derived colours.
    '--surface-chip': rgba(pal.bgStart, 0.62),
    '--surface-rule': rgba(pal.line, 0.30),
    '--surface-send-hover': rgba(pal.accent, 0.14),
    '--surface-veil-38': rgba(pal.bgEnd, 0.82),
    '--surface-veil-96': rgba(pal.bgEnd, 0.96),
    '--surface-shadow': rgba(pal.shadow, 0.4),
    '--surface-eye-halo': rgba(pal.shadow, 0.14),
    '--surface-eye-drop': rgba(pal.shadow, 0.4),
    '--surface-focus-shadow': rgba(pal.focus, 0.55),
    '--surface-skin-hi': hex(pal.skinHi),
    '--surface-skin': hex(pal.skin),
    '--surface-skin-shade': hex(pal.skinShade),
    '--surface-skin-deep': hex(pal.skinDeep),
    '--surface-lash': rgba(pal.lash, 0.4),
    '--surface-vein': hex(pal.vein),
    '--surface-lid-shadow': rgba(pal.lidShadow, 0.58),
    '--surface-lid-soft': rgba(pal.lidShadow, 0.32),
    '--surface-lid-rim': rgba(pal.skinDeep, 0.4),
    '--surface-sclera-hi': hex(pal.scleraHi),
    '--surface-sclera-mid': hex(pal.scleraMid),
    '--surface-sclera-low': hex(pal.scleraLow),
    '--surface-sclera-edge': hex(pal.scleraEdge),
    '--surface-sclera-warm': rgba(pal.scleraWarm, 0.2),
    '--surface-sclera-shade': rgba(pal.scleraShade, 0.22),
    '--surface-sclera-inner': rgba(pal.scleraInner, 0.42),

    // Mood axes for CSS.
    '--surface-temperature': String(temperature),
    '--surface-nervous': String(nervousness),
    '--surface-compact': String(compactness),
    '--surface-eye-gap': `${eyeGapPx}px`,
    '--surface-type-scale': String(typeScale),
    '--surface-tracking': `${letterSpacingEm}em`,
    '--surface-jitter-amp': `${Number(jitterAmp.toFixed(3))}px`,
    '--surface-jitter-state': jitterState,
    '--surface-jitter-cycle': `${jitterCycle}ms`,
    '--iris-hue': `${irisHue}deg`,
    '--iris-sat': String(irisSat),
    '--iris-bright': String(irisBright),
    '--font': font,
    '--font-reading': fontReading,
  };

  return {
    motion: !reducedMotion,
    charDelayMs,
    leaveMs,
    onsetDelayMs,
    blinkIntervalMs,
    saccadeIntervalMs,
    pupilScale,
    accent,
    axes: { temperature, nervousness, compactness },
    palette: {
      bgStart: hex(pal.bgStart),
      bgEnd: hex(pal.bgEnd),
      text: hex(pal.text),
      muted: hex(pal.muted),
      prompt: hex(pal.prompt),
      accent,
      focus: hex(pal.focus),
    },
    variables,
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
      typeScale,
      eyeGapPx,
    },
    prompt: { fragment: '' },
  };
}

function pickPalette(temperature) {
  const t = clamp(temperature, -1, 1);
  const anchorKey = t >= 0 ? 'warm' : 'cold';
  const factor = Math.abs(t);
  const from = ANCHORS.neutral;
  const to = ANCHORS[anchorKey];
  const out = {};
  for (const [key, value] of Object.entries(from)) {
    out[key] = typeof value === 'number'
      ? value + (to[key] - value) * factor
      : mix(value, to[key], factor);
  }
  return out;
}

function mix(a, b, t) {
  return a.map((value, index) => Math.round(value + (b[index] - value) * t));
}

function hex(rgb) {
  return `#${rgb.map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

function rgba(rgb, alpha) {
  const [r, g, b] = rgb.map((value) => clamp(Math.round(value), 0, 255));
  return `rgba(${r}, ${g}, ${b}, ${Number(Number(alpha).toFixed(3))})`;
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

function prefersReducedMotion() {
  return Boolean(
    typeof globalThis !== 'undefined'
    && typeof globalThis.matchMedia === 'function'
    && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
}

function searchOf(root) {
  const win = root?.ownerDocument?.defaultView
    ?? (typeof window !== 'undefined' ? window : null);
  const search = win?.location?.search;
  if (typeof search === 'string') return search;
  return typeof globalThis?.location?.search === 'string' ? globalThis.location.search : '';
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
