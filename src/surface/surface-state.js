// Unified, schema-validated Surface State for agentfähig.de.
// Single source of truth across Embodiment, Motion, Atmosphere, and Communication.
// Pure ES module with zero DOM dependencies.

export const SURFACE_DIMENSIONS = Object.freeze([
  'embodiment',
  'motion',
  'atmosphere',
  'communication',
]);

export const EYE_SHAPES = Object.freeze(['soft', 'neutral', 'sharp', 'wide']);
export const BACKGROUNDS = Object.freeze(['paper', 'warm', 'cool', 'dusk', 'vivid', 'minimal']);
export const RESPONSE_LENGTHS = Object.freeze(['brief', 'balanced', 'detailed']);
export const TONES = Object.freeze(['calm', 'warm', 'direct', 'playful', 'reserved', 'curious']);

export const MAX_VISIBLE_CONTROLS = 3;
const MAX_HISTORY = 25;
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export const SURFACE_SCHEMA = Object.freeze({
  embodiment: Object.freeze({
    eyePositionX: Object.freeze({ type: 'number', min: -1, max: 1, default: 0 }),
    eyePositionY: Object.freeze({ type: 'number', min: -1, max: 1, default: 0 }),
    eyeSpacing: Object.freeze({ type: 'number', min: 0.42, max: 2.35, default: 1.0 }),
    eyeScale: Object.freeze({ type: 'number', min: 0.64, max: 1.48, default: 1.0 }),
    eyeShape: Object.freeze({ type: 'enum', values: EYE_SHAPES, default: 'neutral' }),
    gazeDirection: Object.freeze({
      type: 'vector2',
      min: -1,
      max: 1,
      default: Object.freeze({ x: 0, y: 0 }),
    }),
    asymmetry: Object.freeze({ type: 'number', min: 0, max: 0.35, default: 0.08 }),
  }),
  motion: Object.freeze({
    energy: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.5 }),
    speed: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.5 }),
    damping: Object.freeze({ type: 'number', min: 0.03, max: 0.35, default: 0.12 }),
    ambientMovement: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.6 }),
    responsiveness: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.6 }),
  }),
  atmosphere: Object.freeze({
    primaryColor: Object.freeze({ type: 'color', default: '#C17A4D' }),
    secondaryColor: Object.freeze({ type: 'color', default: '#8A4B22' }),
    background: Object.freeze({ type: 'enum', values: BACKGROUNDS, default: 'paper' }),
    contrast: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.5 }),
    visualIntensity: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.45 }),
  }),
  communication: Object.freeze({
    typographyScale: Object.freeze({ type: 'number', min: 0.80, max: 1.36, default: 1.0 }),
    textDensity: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.45 }),
    responsePace: Object.freeze({ type: 'number', min: 0, max: 1, default: 0.5 }),
    responseLength: Object.freeze({ type: 'enum', values: RESPONSE_LENGTHS, default: 'balanced' }),
    tone: Object.freeze({ type: 'enum', values: TONES, default: 'warm' }),
  }),
});

function buildDefaultState() {
  const out = {};
  for (const dim of SURFACE_DIMENSIONS) {
    const dimObj = {};
    for (const [key, spec] of Object.entries(SURFACE_SCHEMA[dim])) {
      dimObj[key] = spec.type === 'vector2'
        ? Object.freeze({ x: spec.default.x, y: spec.default.y })
        : spec.default;
    }
    out[dim] = Object.freeze(dimObj);
  }
  return Object.freeze(out);
}

export const DEFAULT_SURFACE_STATE = buildDefaultState();

export const CONTEXTUAL_CONTROL_SPECS = Object.freeze({
  'motion.energy': Object.freeze({
    id: 'motion.energy',
    dimension: 'motion',
    param: 'energy',
    kind: 'range',
    label: 'Energie',
    lowLabel: 'ruhig',
    highLabel: 'lebendig',
    min: 0,
    max: 1,
    step: 0.05,
  }),
  'motion.ambientMovement': Object.freeze({
    id: 'motion.ambientMovement',
    dimension: 'motion',
    param: 'ambientMovement',
    kind: 'range',
    label: 'Eigenbewegung',
    lowLabel: 'still',
    highLabel: 'bewegt',
    min: 0,
    max: 1,
    step: 0.05,
  }),
  'motion.speed': Object.freeze({
    id: 'motion.speed',
    dimension: 'motion',
    param: 'speed',
    kind: 'range',
    label: 'Bewegungstempo',
    lowLabel: 'langsam',
    highLabel: 'flink',
    min: 0,
    max: 1,
    step: 0.05,
  }),
  'embodiment.eyeSpacing': Object.freeze({
    id: 'embodiment.eyeSpacing',
    dimension: 'embodiment',
    param: 'eyeSpacing',
    kind: 'range',
    label: 'Augenabstand',
    lowLabel: 'beisammen',
    highLabel: 'weit',
    min: 0.42,
    max: 2.35,
    step: 0.05,
  }),
  'embodiment.eyeScale': Object.freeze({
    id: 'embodiment.eyeScale',
    dimension: 'embodiment',
    param: 'eyeScale',
    kind: 'range',
    label: 'Präsenz / Nähe',
    lowLabel: 'fern',
    highLabel: 'nah',
    min: 0.64,
    max: 1.48,
    step: 0.02,
  }),
  'embodiment.eyePositionX': Object.freeze({
    id: 'embodiment.eyePositionX',
    dimension: 'embodiment',
    param: 'eyePositionX',
    kind: 'range',
    label: 'Blickachse X',
    lowLabel: 'links',
    highLabel: 'rechts',
    min: -1,
    max: 1,
    step: 0.05,
  }),
  'embodiment.eyePositionY': Object.freeze({
    id: 'embodiment.eyePositionY',
    dimension: 'embodiment',
    param: 'eyePositionY',
    kind: 'range',
    label: 'Blickhöhe Y',
    lowLabel: 'oben',
    highLabel: 'unten',
    min: -1,
    max: 1,
    step: 0.05,
  }),
  'embodiment.asymmetry': Object.freeze({
    id: 'embodiment.asymmetry',
    dimension: 'embodiment',
    param: 'asymmetry',
    kind: 'range',
    label: 'Asymmetrie',
    lowLabel: 'gerade',
    highLabel: 'frei',
    min: 0,
    max: 0.35,
    step: 0.01,
  }),
  'atmosphere.visualIntensity': Object.freeze({
    id: 'atmosphere.visualIntensity',
    dimension: 'atmosphere',
    param: 'visualIntensity',
    kind: 'range',
    label: 'Farbintensität',
    lowLabel: 'dezent',
    highLabel: 'farbig',
    min: 0,
    max: 1,
    step: 0.05,
  }),
  'atmosphere.contrast': Object.freeze({
    id: 'atmosphere.contrast',
    dimension: 'atmosphere',
    param: 'contrast',
    kind: 'range',
    label: 'Kontrast',
    lowLabel: 'weich',
    highLabel: 'klar',
    min: 0,
    max: 1,
    step: 0.05,
  }),
  'communication.responseLength': Object.freeze({
    id: 'communication.responseLength',
    dimension: 'communication',
    param: 'responseLength',
    kind: 'enum',
    label: 'Antwortlänge',
    lowLabel: 'knapp',
    highLabel: 'lang',
    options: Object.freeze([
      { value: 'brief', label: 'Kurz' },
      { value: 'balanced', label: 'Mittel' },
      { value: 'detailed', label: 'Lang' },
    ]),
  }),
  'communication.typographyScale': Object.freeze({
    id: 'communication.typographyScale',
    dimension: 'communication',
    param: 'typographyScale',
    kind: 'range',
    label: 'Schriftgröße',
    lowLabel: 'kompakt',
    highLabel: 'groß',
    min: 0.8,
    max: 1.36,
    step: 0.02,
  }),
  'communication.responsePace': Object.freeze({
    id: 'communication.responsePace',
    dimension: 'communication',
    param: 'responsePace',
    kind: 'range',
    label: 'Schreibtempo',
    lowLabel: 'gemächlich',
    highLabel: 'zügig',
    min: 0,
    max: 1,
    step: 0.05,
  }),
});

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function cloneState(state) {
  return Object.freeze({
    embodiment: Object.freeze({
      ...state.embodiment,
      gazeDirection: Object.freeze({ ...state.embodiment.gazeDirection }),
    }),
    motion: Object.freeze({ ...state.motion }),
    atmosphere: Object.freeze({ ...state.atmosphere }),
    communication: Object.freeze({ ...state.communication }),
  });
}

function hasUnsafeText(value) {
  return /[;<>{}]|javascript:|url\s*\(/i.test(String(value));
}

function resolveNumberSpec(spec, incoming, current) {
  if (typeof incoming === 'number' && Number.isFinite(incoming)) {
    return { ok: true, value: round(clamp(incoming, spec.min, spec.max)) };
  }
  if (incoming && typeof incoming === 'object' && typeof incoming.delta === 'number' && Number.isFinite(incoming.delta)) {
    return { ok: true, value: round(clamp(current + incoming.delta, spec.min, spec.max)) };
  }
  return { ok: false };
}

function resolveVector2Spec(spec, incoming, current) {
  if (!incoming || typeof incoming !== 'object') return { ok: false };
  const nextX = incoming.x !== undefined
    ? resolveNumberSpec(spec, incoming.x, current.x)
    : { ok: true, value: current.x };
  const nextY = incoming.y !== undefined
    ? resolveNumberSpec(spec, incoming.y, current.y)
    : { ok: true, value: current.y };
  if (!nextX.ok || !nextY.ok) return { ok: false };
  return { ok: true, value: Object.freeze({ x: nextX.value, y: nextY.value }) };
}

function resolveField(spec, incoming, current) {
  if (spec.type === 'number') return resolveNumberSpec(spec, incoming, current);
  if (spec.type === 'vector2') return resolveVector2Spec(spec, incoming, current);
  if (spec.type === 'enum') {
    if (typeof incoming !== 'string' || hasUnsafeText(incoming)) return { ok: false };
    const normalized = incoming.trim().toLowerCase();
    return spec.values.includes(normalized) ? { ok: true, value: normalized } : { ok: false };
  }
  if (spec.type === 'color') {
    if (typeof incoming !== 'string' || hasUnsafeText(incoming)) return { ok: false };
    const normalized = incoming.trim().toUpperCase();
    return HEX_COLOR_RE.test(normalized) ? { ok: true, value: normalized } : { ok: false };
  }
  return { ok: false };
}

function valuesEqual(a, b) {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return a.x === b.x && a.y === b.y;
  }
  return false;
}

/**
 * Strictly validate and clamp a partial SurfaceState patch against SURFACE_SCHEMA.
 * Rejects unknown keys, malformed colors, out-of-set enums, or unsafe strings.
 *
 * @param {object} rawPatch
 * @param {typeof DEFAULT_SURFACE_STATE} [currentState]
 */
export function validateSurfacePatch(rawPatch, currentState = DEFAULT_SURFACE_STATE) {
  const base = cloneState(currentState);
  const nextDraft = {
    embodiment: { ...base.embodiment, gazeDirection: { ...base.embodiment.gazeDirection } },
    motion: { ...base.motion },
    atmosphere: { ...base.atmosphere },
    communication: { ...base.communication },
  };
  const cleanPatch = {};
  const changedPaths = [];
  const rejected = [];

  if (!rawPatch || typeof rawPatch !== 'object' || Array.isArray(rawPatch)) {
    return { patch: cleanPatch, nextState: base, changedPaths, rejected: ['<root>'] };
  }

  for (const [dim, dimPatch] of Object.entries(rawPatch)) {
    if (!SURFACE_DIMENSIONS.includes(dim) || !dimPatch || typeof dimPatch !== 'object' || Array.isArray(dimPatch)) {
      rejected.push(dim);
      continue;
    }
    const dimSchema = SURFACE_SCHEMA[dim];
    for (const [param, rawVal] of Object.entries(dimPatch)) {
      if (!Object.hasOwn(dimSchema, param)) {
        rejected.push(`${dim}.${param}`);
        continue;
      }
      const res = resolveField(dimSchema[param], rawVal, base[dim][param]);
      if (!res.ok) {
        rejected.push(`${dim}.${param}`);
        continue;
      }
      if (!cleanPatch[dim]) cleanPatch[dim] = {};
      cleanPatch[dim][param] = res.value;
      if (!valuesEqual(res.value, base[dim][param])) {
        nextDraft[dim][param] = res.value;
        changedPaths.push(`${dim}.${param}`);
      }
    }
  }

  const nextState = Object.freeze({
    embodiment: Object.freeze({
      ...nextDraft.embodiment,
      gazeDirection: Object.freeze({ ...nextDraft.embodiment.gazeDirection }),
    }),
    motion: Object.freeze({ ...nextDraft.motion }),
    atmosphere: Object.freeze({ ...nextDraft.atmosphere }),
    communication: Object.freeze({ ...nextDraft.communication }),
  });

  return { patch: cleanPatch, nextState, changedPaths, rejected };
}

/**
 * Project the unified SurfaceState into the 12 legacy 0..1 surface parameters
 * consumed by deriveStyle, deriveSurface, and styledDevAgent.
 */
export function toLegacyParams(surfaceState = DEFAULT_SURFACE_STATE) {
  const s = surfaceState || DEFAULT_SURFACE_STATE;
  const { embodiment, motion, atmosphere, communication } = s;

  let warmth = 0.52;
  if (atmosphere.background === 'warm') warmth = 0.84;
  else if (atmosphere.background === 'cool') warmth = 0.24;
  else if (atmosphere.background === 'dusk') warmth = 0.66;
  else if (atmosphere.background === 'vivid') warmth = 0.72;
  else if (atmosphere.background === 'minimal') warmth = 0.44;

  let calm = 1 - motion.energy * 0.72 + (1 - motion.ambientMovement) * 0.14;
  let energy = motion.energy;
  let tempo = communication.responsePace;
  let density = communication.textDensity;
  let closeness = clamp(0.45 + (embodiment.eyeScale - 1.0) * 2.2 - (embodiment.eyeSpacing - 1.0) * 0.25, 0.15, 0.92);
  let openness = clamp(0.5 + (embodiment.eyeSpacing - 1.0) * 0.35 + (motion.energy - 0.5) * 0.2, 0.15, 0.92);
  let attention = clamp(0.5 + (motion.responsiveness - 0.5) * 0.7, 0.2, 0.95);
  let certainty = 0.55;
  let playfulness = clamp(0.2 + atmosphere.visualIntensity * 0.25 + (motion.energy - 0.5) * 0.25, 0.05, 0.92);
  let formality = 0.36;
  let depth = 0.48;

  if (communication.responseLength === 'brief') {
    tempo = Math.max(tempo, 0.8);
    density = Math.max(density, 0.62);
    depth = 0.22;
  } else if (communication.responseLength === 'detailed') {
    tempo = Math.min(tempo, 0.32);
    depth = 0.78;
    openness = Math.max(openness, 0.68);
  }

  switch (communication.tone) {
    case 'calm':
      calm = Math.max(calm, 0.84);
      warmth = Math.max(warmth, 0.56);
      playfulness = Math.min(playfulness, 0.18);
      certainty = 0.62;
      break;
    case 'warm':
      warmth = Math.max(warmth, 0.62);
      closeness = Math.max(closeness, 0.55);
      formality = 0.32;
      break;
    case 'direct':
      formality = 0.52;
      certainty = 0.82;
      warmth = Math.min(warmth, 0.42);
      tempo = Math.max(tempo, 0.68);
      break;
    case 'playful':
      playfulness = Math.max(playfulness, 0.78);
      warmth = Math.max(warmth, 0.7);
      formality = 0.2;
      openness = Math.max(openness, 0.72);
      break;
    case 'reserved':
      closeness = Math.min(closeness, 0.26);
      formality = 0.72;
      warmth = Math.min(warmth, 0.42);
      openness = Math.min(openness, 0.28);
      calm = Math.max(calm, 0.76);
      playfulness = 0.1;
      break;
    case 'curious':
      openness = Math.max(openness, 0.82);
      warmth = Math.max(warmth, 0.64);
      playfulness = Math.max(playfulness, 0.48);
      break;
  }

  return Object.freeze({
    tempo: round(clamp(tempo, 0, 1), 3),
    density: round(clamp(density, 0, 1), 3),
    warmth: round(clamp(warmth, 0, 1), 3),
    calm: round(clamp(calm, 0, 1), 3),
    closeness: round(clamp(closeness, 0, 1), 3),
    openness: round(clamp(openness, 0, 1), 3),
    attention: round(clamp(attention, 0, 1), 3),
    certainty: round(clamp(certainty, 0, 1), 3),
    playfulness: round(clamp(playfulness, 0, 1), 3),
    formality: round(clamp(formality, 0, 1), 3),
    depth: round(clamp(depth, 0, 1), 3),
    energy: round(clamp(energy, 0, 1), 3),
  });
}

function statesEqual(a, b) {
  for (const dim of SURFACE_DIMENSIONS) {
    for (const key of Object.keys(SURFACE_SCHEMA[dim])) {
      if (!valuesEqual(a[dim][key], b[dim][key])) return false;
    }
  }
  return true;
}

function selectActiveControls(changedPaths, explicitFocus, fallback) {
  const next = [];
  const push = (id) => {
    if (typeof id === 'string' && Object.hasOwn(CONTEXTUAL_CONTROL_SPECS, id) && !next.includes(id)) {
      if (next.length < MAX_VISIBLE_CONTROLS) next.push(id);
    }
  };
  for (const id of explicitFocus || []) push(id);
  for (const path of changedPaths || []) push(path);
  for (const id of fallback || []) push(id);
  return Object.freeze(next);
}

/**
 * Create the central unified SurfaceState store with undo history and
 * contextual control selection (max 3 visible controls).
 */
export function createSurfaceStore(initialState = DEFAULT_SURFACE_STATE) {
  const validatedInit = validateSurfacePatch(initialState, DEFAULT_SURFACE_STATE).nextState;
  let state = cloneState(validatedInit);
  const undoStack = [];
  let activeControls = Object.freeze([]);
  let lastChange = null;
  const listeners = new Set();

  function notify(event) {
    for (const fn of [...listeners]) {
      fn(state, event);
    }
  }

  function pushSnapshot(summary = '') {
    undoStack.push({
      state,
      activeControls,
      summary,
    });
    while (undoStack.length > MAX_HISTORY) undoStack.shift();
  }

  return {
    getState: () => state,
    getActiveControls: () => activeControls,
    getLastChange: () => lastChange,
    canUndo: () => undoStack.length > 0,
    getHistoryLength: () => undoStack.length,
    isModified: () => !statesEqual(state, DEFAULT_SURFACE_STATE),
    toLegacyParams: () => toLegacyParams(state),

    applyPatch(rawPatch, {
      source = 'api',
      summary = '',
      focusControls = null,
      recordHistory = true,
    } = {}) {
      const { nextState, changedPaths, rejected } = validateSurfacePatch(rawPatch, state);
      const nextControls = selectActiveControls(changedPaths, focusControls, activeControls);
      const controlsChanged = nextControls.length !== activeControls.length
        || nextControls.some((c, i) => c !== activeControls[i]);

      if (!changedPaths.length && !controlsChanged) {
        return { changed: false, changedPaths, rejected, state };
      }

      if (changedPaths.length && recordHistory) {
        pushSnapshot(summary);
      }

      state = nextState;
      activeControls = nextControls;
      lastChange = Object.freeze({
        action: 'patch',
        source,
        summary,
        changedPaths: Object.freeze([...changedPaths]),
      });
      notify(lastChange);
      return { changed: true, changedPaths, rejected, state };
    },

    checkpoint(summary = 'Manuelle Anpassung') {
      pushSnapshot(summary);
    },

    undo({ source = 'user' } = {}) {
      if (!undoStack.length) return { changed: false, state };
      const prev = undoStack.pop();
      state = prev.state;
      activeControls = prev.activeControls;
      lastChange = Object.freeze({
        action: 'undo',
        source,
        summary: 'Letzte Änderung rückgängig',
        changedPaths: Object.freeze([]),
      });
      notify(lastChange);
      return { changed: true, state };
    },

    reset({ source = 'user' } = {}) {
      if (statesEqual(state, DEFAULT_SURFACE_STATE) && activeControls.length === 0) {
        return { changed: false, state };
      }
      if (!statesEqual(state, DEFAULT_SURFACE_STATE)) {
        pushSnapshot('Vor Zurücksetzen');
      }
      state = DEFAULT_SURFACE_STATE;
      activeControls = Object.freeze([]);
      lastChange = Object.freeze({
        action: 'reset',
        source,
        summary: 'Alles zurückgesetzt',
        changedPaths: Object.freeze([]),
      });
      notify(lastChange);
      return { changed: true, state };
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
