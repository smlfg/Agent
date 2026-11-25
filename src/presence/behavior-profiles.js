// Declarative behavior matrix P01–P09: intents → 15 expression channel groups.

/** @typedef {import('./eye-motion-profiles.js').EMBODIED_INTENTS} EmbodiedIntent */

export const EXPRESSION_CHANNEL_GROUPS = Object.freeze([
  'gaze',
  'position',
  'spread',
  'scale',
  'eyeShape',
  'pupil',
  'lids',
  'blink',
  'asymmetry',
  'intensity',
  'speed',
  'damping',
  'ambient',
  'depthFocal',
  'atmosphere',
]);

export const BEHAVIOR_PROFILE_IDS = Object.freeze([
  'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09',
]);

/** Intents that trigger a short visual hold before concentrating may take over. */
export const MILESTONE_HOLD_INTENTS = Object.freeze(
  new Set(['grounded', 'multi_source', 'uncovered', 'tool_failed', 'degraded']),
);

export const MILESTONE_HOLD_MS = 320;

const neutralChannelSlice = () => ({
  gaze: Object.freeze({ offsetX: 0, offsetY: 0 }),
  position: Object.freeze({ shiftX: 0, shiftY: 0 }),
  spread: Object.freeze({ delta: 0 }),
  scale: Object.freeze({ mul: 1 }),
  eyeShape: Object.freeze({ shape: null }),
  pupil: Object.freeze({ delta: 0 }),
  lids: Object.freeze({ topDelta: 0, bottomDelta: 0 }),
  blink: Object.freeze({ suppressBlinks: false, rateMul: 1 }),
  asymmetry: Object.freeze({ delta: 0 }),
  intensity: Object.freeze({ mul: 1 }),
  speed: Object.freeze({ mul: 1 }),
  damping: Object.freeze({ value: null }),
  ambient: Object.freeze({ mul: 1 }),
  depthFocal: Object.freeze({ depthBoost: 0, focalBoost: 0 }),
  atmosphere: Object.freeze({
    sheenBoost: 0,
    hazeBoost: 0,
    visualIntensityDelta: 0,
    searchSweep: 0,
    lightShiftX: 0,
  }),
});

function freezeChannels(ch) {
  const out = {};
  for (const key of EXPRESSION_CHANNEL_GROUPS) {
    out[key] = Object.freeze({ ...neutralChannelSlice()[key], ...(ch[key] || {}) });
  }
  return Object.freeze(out);
}

/**
 * @param {string} id
 * @param {string} label
 * @param {number} reactionLatencyMs
 * @param {readonly string[]} intents
 * @param {object} channels
 */
function profile(id, label, reactionLatencyMs, intents, channels) {
  return Object.freeze({
    id,
    label,
    reactionLatencyMs,
    intents: Object.freeze([...intents]),
    channels: freezeChannels(channels),
  });
}

export const BEHAVIOR_PROFILES = Object.freeze({
  P01: profile('P01', 'Attend & orient', 72, ['orienting', 'contextualizing', 'embedding', 'waiting'], {
    gaze: { offsetX: 0, offsetY: 0.1 },
    position: { shiftX: 0, shiftY: 0.04 },
    spread: { delta: -0.05 },
    scale: { mul: 1.02 },
    pupil: { delta: 0.04 },
    damping: { value: 0.17 },
    depthFocal: { depthBoost: 0.04, focalBoost: 0.06 },
    atmosphere: { sheenBoost: 0.1, visualIntensityDelta: 0.02 },
  }),
  P02: profile('P02', 'Search & sweep', 84, ['searching'], {
    gaze: { offsetX: -0.44, offsetY: -0.32 },
    position: { shiftX: -0.06, shiftY: -0.04 },
    spread: { delta: 0.1 },
    scale: { mul: 0.98 },
    asymmetry: { delta: 0.1 },
    pupil: { delta: 0.03 },
    lids: { topDelta: 5, bottomDelta: 0 },
    blink: { suppressBlinks: true, rateMul: 0.35 },
    intensity: { mul: 0.88 },
    speed: { mul: 1.22 },
    damping: { value: 0.16 },
    ambient: { mul: 0.52 },
    depthFocal: { depthBoost: 0.07, focalBoost: 0.05 },
    atmosphere: { searchSweep: 1, sheenBoost: 0.06, visualIntensityDelta: 0.04 },
  }),
  P03: profile('P03', 'Grounded hit', 68, ['grounded'], {
    gaze: { offsetX: 0.02, offsetY: -0.03 },
    spread: { delta: -0.04 },
    scale: { mul: 1.04 },
    asymmetry: { delta: -0.04 },
    pupil: { delta: 0.12 },
    lids: { topDelta: -2, bottomDelta: 0 },
    ambient: { mul: 0.42 },
    damping: { value: 0.23 },
    depthFocal: { depthBoost: 0.1, focalBoost: 0.12 },
    atmosphere: { sheenBoost: 0.2, visualIntensityDelta: 0.06 },
  }),
  P04: profile('P04', 'Multi-source', 66, ['multi_source'], {
    gaze: { offsetY: -0.04 },
    spread: { delta: -0.09 },
    scale: { mul: 1.05 },
    asymmetry: { delta: -0.05 },
    pupil: { delta: 0.15 },
    lids: { topDelta: -2.5 },
    ambient: { mul: 0.36 },
    damping: { value: 0.24 },
    depthFocal: { depthBoost: 0.17, focalBoost: 0.16 },
    atmosphere: { sheenBoost: 0.26, visualIntensityDelta: 0.08 },
  }),
  P05: profile('P05', 'Uncovered gap', 78, ['uncovered'], {
    gaze: { offsetY: 0.08 },
    spread: { delta: -0.06 },
    scale: { mul: 0.95 },
    asymmetry: { delta: -0.06 },
    pupil: { delta: -0.09 },
    lids: { topDelta: 4 },
    ambient: { mul: 0.32 },
    damping: { value: 0.17 },
    depthFocal: { depthBoost: -0.05, focalBoost: 0.02 },
    atmosphere: { hazeBoost: 0.08, visualIntensityDelta: -0.03 },
  }),
  P06: profile('P06', 'Degraded path', 80, ['degraded'], {
    gaze: { offsetX: 0.14, offsetY: 0.05 },
    spread: { delta: -0.05 },
    scale: { mul: 0.96 },
    asymmetry: { delta: 0.15 },
    pupil: { delta: -0.05 },
    lids: { topDelta: 5 },
    intensity: { mul: 0.82 },
    damping: { value: 0.19 },
    depthFocal: { depthBoost: -0.03, focalBoost: 0.04 },
    atmosphere: { hazeBoost: 0.04, visualIntensityDelta: -0.02 },
  }),
  P07: profile('P07', 'Tools & switch', 76, ['tooling', 'tool_retry', 'tool_failed', 'switching'], {
    gaze: { offsetX: 0.26, offsetY: 0.12 },
    position: { shiftX: 0.08, shiftY: 0.06 },
    spread: { delta: -0.07 },
    scale: { mul: 1.01 },
    eyeShape: { shape: 'sharp' },
    asymmetry: { delta: 0.08 },
    pupil: { delta: 0.07 },
    ambient: { mul: 0.28 },
    speed: { mul: 1.08 },
    damping: { value: 0.21 },
    depthFocal: { depthBoost: 0.08, focalBoost: 0.1 },
    atmosphere: { lightShiftX: -0.06, visualIntensityDelta: 0.05 },
  }),
  P08: profile('P08', 'Formulate & stream', 70, ['concentrating', 'streaming', 'pausing', 'completing'], {
    gaze: { offsetX: 0.04, offsetY: -0.1 },
    spread: { delta: -0.04 },
    scale: { mul: 1.02 },
    asymmetry: { delta: 0.05 },
    pupil: { delta: 0.07 },
    lids: { topDelta: 3 },
    intensity: { mul: 0.94 },
    ambient: { mul: 0.38 },
    speed: { mul: 1.05 },
    damping: { value: 0.18 },
    depthFocal: { depthBoost: 0.06, focalBoost: 0.08 },
    atmosphere: { sheenBoost: 0.14, visualIntensityDelta: 0.03 },
  }),
  P09: profile('P09', 'Rest & fault', 60, ['error', 'interrupted', 'idle'], {
    gaze: { offsetY: 0.06 },
    spread: { delta: -0.04 },
    scale: { mul: 0.97 },
    pupil: { delta: -0.07 },
    lids: { topDelta: 4 },
    intensity: { mul: 0.7 },
    ambient: { mul: 0.55 },
    damping: { value: 0.15 },
    depthFocal: { depthBoost: -0.05, focalBoost: 0 },
    atmosphere: { hazeBoost: 0.03, visualIntensityDelta: -0.04 },
  }),
});

/** @type {Readonly<Record<string, string>>} */
export const INTENT_TO_PROFILE_ID = Object.freeze(
  Object.fromEntries(
    BEHAVIOR_PROFILE_IDS.flatMap((pid) =>
      BEHAVIOR_PROFILES[pid].intents.map((intent) => [intent, pid]),
    ),
  ),
);

/** Per-intent eye state + cue overrides (orthogonal to P01–P09 channels). */
export const INTENT_EMBODIED_META = Object.freeze({
  orienting: Object.freeze({ baseEyeState: 'listening' }),
  contextualizing: Object.freeze({ baseEyeState: 'thinking' }),
  embedding: Object.freeze({ baseEyeState: 'thinking' }),
  searching: Object.freeze({ baseEyeState: 'thinking' }),
  grounded: Object.freeze({ baseEyeState: 'present', cue: 'grounding' }),
  multi_source: Object.freeze({ baseEyeState: 'present', cue: 'grounding' }),
  uncovered: Object.freeze({ baseEyeState: 'idle' }),
  degraded: Object.freeze({ baseEyeState: 'thinking', cue: 'hesitation' }),
  tooling: Object.freeze({ baseEyeState: 'listening', cue: 'tool' }),
  tool_retry: Object.freeze({ baseEyeState: 'thinking', cue: 'hesitation' }),
  tool_failed: Object.freeze({ baseEyeState: 'error', cue: 'hesitation' }),
  switching: Object.freeze({ baseEyeState: 'adapting', cue: 'switch', lightShiftX: -0.08 }),
  concentrating: Object.freeze({ baseEyeState: 'thinking' }),
  streaming: Object.freeze({ baseEyeState: 'responding' }),
  pausing: Object.freeze({ baseEyeState: 'responding' }),
  completing: Object.freeze({ baseEyeState: 'present', cue: 'exhale' }),
  waiting: Object.freeze({ baseEyeState: 'idle' }),
  interrupted: Object.freeze({ baseEyeState: 'listening', cue: 'interrupt' }),
  error: Object.freeze({ baseEyeState: 'error' }),
  idle: Object.freeze({ baseEyeState: 'idle' }),
});

/**
 * @param {string} profileId
 * @returns {typeof BEHAVIOR_PROFILES[string] | null}
 */
export function getBehaviorProfile(profileId) {
  if (typeof profileId !== 'string') return null;
  return BEHAVIOR_PROFILES[profileId] ?? null;
}

/**
 * @param {string} intent
 * @returns {{ profileId: string, profile: object, channels: object, reactionLatencyMs: number } | null}
 */
export function resolveBehaviorForIntent(intent) {
  const profileId = INTENT_TO_PROFILE_ID[intent];
  if (!profileId) return null;
  const profile = BEHAVIOR_PROFILES[profileId];
  if (!profile) return null;
  return {
    profileId,
    profile,
    channels: profile.channels,
    reactionLatencyMs: profile.reactionLatencyMs,
  };
}

/**
 * Flat channel groups → presence / EMBODIED overlay keys.
 *
 * @param {object} channels
 * @param {object} [meta]
 */
export function channelsToEmbodiedOverlay(channels, meta = {}) {
  const c = channels || neutralChannelSlice();
  const overlay = {
    offsetX: (c.gaze?.offsetX ?? 0) + (c.position?.shiftX ?? 0),
    offsetY: (c.gaze?.offsetY ?? 0) + (c.position?.shiftY ?? 0),
    spreadDelta: c.spread?.delta ?? 0,
    scaleMul: c.scale?.mul ?? 1,
    pupilDelta: c.pupil?.delta ?? 0,
    lidTopDelta: c.lids?.topDelta ?? 0,
    asymmetryDelta: c.asymmetry?.delta ?? 0,
    intensityMul: c.intensity?.mul ?? 1,
    speedMul: c.speed?.mul ?? 1,
    ambientMul: c.ambient?.mul ?? 1,
    depthBoost: c.depthFocal?.depthBoost ?? 0,
    focalBoost: c.depthFocal?.focalBoost ?? 0,
    sheenBoost: c.atmosphere?.sheenBoost ?? 0,
    hazeBoost: c.atmosphere?.hazeBoost ?? 0,
    searchSweep: c.atmosphere?.searchSweep ?? 0,
    lightShiftX: c.atmosphere?.lightShiftX ?? 0,
    visualIntensityDelta: c.atmosphere?.visualIntensityDelta ?? 0,
  };
  if (c.eyeShape?.shape) overlay.eyeShape = c.eyeShape.shape;
  if (c.blink?.suppressBlinks) overlay.suppressBlinks = true;
  if (Number.isFinite(c.damping?.value)) overlay.damping = c.damping.value;
  if (meta.baseEyeState) overlay.baseEyeState = meta.baseEyeState;
  if (meta.cue) overlay.cue = meta.cue;
  if (Number.isFinite(meta.lightShiftX)) {
    overlay.lightShiftX = (overlay.lightShiftX ?? 0) + meta.lightShiftX;
  }
  return overlay;
}

/**
 * @param {string} intent
 * @returns {object | null}
 */
export function embodiedOverlayForIntent(intent) {
  const resolved = resolveBehaviorForIntent(intent);
  if (!resolved) return null;
  const meta = INTENT_EMBODIED_META[intent] ?? {};
  return channelsToEmbodiedOverlay(resolved.channels, meta);
}

/**
 * @param {object} channels
 * @returns {Readonly<Record<string, string>>}
 */
export function atmosphereModulationFromChannels(channels) {
  const atm = channels?.atmosphere ?? {};
  const depth = channels?.depthFocal ?? {};
  const out = {};
  if (Number(atm.sheenBoost)) out['--embodiment-atmosphere-sheen'] = String(atm.sheenBoost);
  if (Number(atm.hazeBoost)) out['--embodiment-atmosphere-haze'] = String(atm.hazeBoost);
  if (Number(atm.visualIntensityDelta)) {
    out['--embodiment-visual-intensity-delta'] = String(atm.visualIntensityDelta);
  }
  if (Number(atm.searchSweep)) out['--embodiment-search-sweep'] = String(atm.searchSweep);
  if (Number(atm.lightShiftX)) out['--embodiment-light-shift-x'] = String(atm.lightShiftX);
  if (Number(depth.depthBoost)) out['--embodiment-depth-boost'] = String(depth.depthBoost);
  if (Number(depth.focalBoost)) out['--embodiment-focal-boost'] = String(depth.focalBoost);
  return Object.freeze(out);
}

/**
 * @param {string} resolved
 * @param {{ milestoneIntent?: string | null, holdUntil?: number }} ctx
 * @param {number} [t]
 * @returns {string}
 */
export function applyMilestoneHold(resolved, ctx = {}, t = Date.now()) {
  if (resolved !== 'concentrating') return resolved;
  const holdIntent = ctx.milestoneIntent;
  if (!holdIntent || !MILESTONE_HOLD_INTENTS.has(holdIntent)) return resolved;
  if (t < (ctx.holdUntil ?? 0)) return holdIntent;
  return resolved;
}

/**
 * Returns channel group keys that differ from neutral defaults in any profile.
 * @returns {Set<string>}
 */
export function activeChannelGroupsAcrossMatrix() {
  const used = new Set();
  const neutral = neutralChannelSlice();
  for (const pid of BEHAVIOR_PROFILE_IDS) {
    const ch = BEHAVIOR_PROFILES[pid].channels;
    for (const group of EXPRESSION_CHANNEL_GROUPS) {
      const a = ch[group];
      const n = neutral[group];
      const differs = Object.keys(n).some((k) => a[k] !== n[k]);
      if (differs) used.add(group);
    }
  }
  return used;
}