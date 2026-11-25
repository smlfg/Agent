// Live Surface Projector: projects the unified SurfaceState onto CSS custom
// properties, typography, atmosphere aura, and the Eye Motion Engine.
// Single authoritative DOM projection writer so parameters and CSS stay in sync.

import {
  PARAMETER_IDS,
  applySurface,
  currentBehaviour,
  deriveSpatialDepth,
  deriveSurface,
} from '../metrics/surface.js';
import { DEFAULT_SURFACE_STATE, toLegacyParams } from './surface-state.js';
import {
  BONE_SCHEMA,
  DEFAULT_BONES,
  compileBonesToCssVars,
  ensureWcagContrast,
  mutateBonesCreative,
  validateBonePatch,
} from './surface-bones.js';
import { WORLD_LIST, getWorldById } from './surface-worlds.js';

const BACKGROUND_PALETTES = Object.freeze({
  paper: Object.freeze({
    bgStart: [246, 241, 233],
    bgEnd: [237, 228, 211],
    text: [61, 50, 41],
    muted: [107, 91, 76],
    prompt: [122, 90, 64],
    accent: [193, 122, 77],
    focus: [138, 75, 34],
    line: [74, 63, 53],
    auraThird: [212, 160, 106],
    irisHue: 0,
    irisSat: 1.0,
    irisBright: 1.0,
  }),
  warm: Object.freeze({
    bgStart: [255, 244, 224],
    bgEnd: [240, 214, 174],
    text: [48, 34, 22],
    muted: [102, 79, 58],
    prompt: [122, 69, 32],
    accent: [204, 102, 46],
    focus: [143, 64, 22],
    line: [92, 64, 38],
    auraThird: [232, 176, 84],
    irisHue: -8,
    irisSat: 1.2,
    irisBright: 1.05,
  }),
  cool: Object.freeze({
    bgStart: [224, 235, 241],
    bgEnd: [190, 211, 224],
    text: [24, 40, 50],
    muted: [58, 84, 100],
    prompt: [39, 80, 102],
    accent: [64, 104, 122],
    focus: [41, 72, 87],
    line: [36, 54, 66],
    auraThird: [132, 174, 194],
    irisHue: 185,
    irisSat: 0.72,
    irisBright: 0.96,
  }),
  dusk: Object.freeze({
    bgStart: [239, 231, 236],
    bgEnd: [219, 204, 217],
    text: [45, 33, 41],
    muted: [92, 74, 86],
    prompt: [108, 64, 90],
    accent: [158, 82, 114],
    focus: [110, 48, 76],
    line: [74, 54, 68],
    auraThird: [194, 128, 152],
    irisHue: -22,
    irisSat: 0.9,
    irisBright: 0.96,
  }),
  vivid: Object.freeze({
    bgStart: [255, 243, 224],
    bgEnd: [244, 210, 174],
    text: [40, 26, 19],
    muted: [92, 66, 54],
    prompt: [145, 42, 16],
    accent: [217, 78, 40],
    focus: [15, 118, 110],
    line: [86, 48, 32],
    auraThird: [234, 179, 8],
    irisHue: -14,
    irisSat: 1.48,
    irisBright: 1.1,
  }),
  minimal: Object.freeze({
    bgStart: [239, 239, 238],
    bgEnd: [228, 228, 226],
    text: [46, 45, 43],
    muted: [100, 97, 93],
    prompt: [78, 75, 71],
    accent: [87, 83, 78],
    focus: [63, 59, 55],
    line: [68, 65, 61],
    auraThird: [180, 180, 176],
    irisHue: 0,
    irisSat: 0.46,
    irisBright: 0.96,
  }),
});

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function parseHex(hexStr) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hexStr ?? '').trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function mixRgb(a, b, t) {
  const k = clamp(t, 0, 1);
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

function toHex(rgb) {
  return `#${rgb.map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

function toRgba(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Number(clamp(alpha, 0, 1).toFixed(3))})`;
}

// ── Layer 2 <-> Layer 3 bridge ───────────────────────────────────────────────
// Conversation metrics arrive as a vector of 12 parameters around the neutral
// 0.5 point. They are folded additively into the SurfaceState anchor parameters
// instead of replacing them, so a later reapply() cannot erase the conversation.

const DEFAULT_METRIC_WEIGHT = 0.35;

// Tokens whose value should follow the (metric-modulated) conversation instead
// of the static SurfaceState anchor. Palette and layout tokens stay authored by
// projectSurfaceState, so the surface keeps its designed identity.
const DERIVED_MOTION_TOKENS = Object.freeze([
  '--type-jitter-ms',
  '--leave-ms',
  '--onset-delay-ms',
  '--blink-interval-ms',
  '--blink-jitter-ms',
  '--saccade-interval-ms',
  '--saccade-radius-px',
  '--pupil-scale',
  '--lid-open-ratio',
  '--gaze-gain',
  '--gaze-hold-ms',
  '--breathe-ms',
  '--breathe-amplitude',
  '--thinking-dots-ms',
  '--surface-jitter-amp',
  '--surface-jitter-state',
  '--surface-jitter-cycle',
]);

function param01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0.5;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function round3(value) {
  return Number(clamp(value, 0, 1).toFixed(3));
}

/**
 * Fold the conversation metric parameters into the 12 anchor parameters.
 * Δp = (metricParams[id] - 0.5) * weight, added to the anchor, clamped to [0, 1]
 * and rounded to three decimals so DOM output stays stable.
 *
 * @param {object} anchorParams output of toLegacyParams(state)
 * @param {object|null} metricParams 12 conversation parameters (null = no conversation)
 * @param {number} [weight=0.35] how strongly the conversation pulls the surface
 */
export function blendLegacyWithMetrics(anchorParams, metricParams, weight = DEFAULT_METRIC_WEIGHT) {
  if (!metricParams || typeof metricParams !== 'object') return anchorParams;
  const anchor = anchorParams && typeof anchorParams === 'object' ? anchorParams : {};
  const requested = Number(weight);
  const w = Number.isFinite(requested) ? clamp(requested, 0, 1) : DEFAULT_METRIC_WEIGHT;

  const out = {};
  for (const [id, anchorValue] of Object.entries(anchor)) {
    const anchorNumber = Number(anchorValue);
    const base = Number.isFinite(anchorNumber) ? clamp(anchorNumber, 0, 1) : 0.5;
    const metricValue = metricParams[id];
    const hasMetric = metricValue !== undefined
      && metricValue !== null
      && Number.isFinite(Number(metricValue));
    const delta = hasMetric ? (param01(metricValue) - 0.5) * w : 0;
    out[id] = round3(base + delta);
  }
  return out;
}

/**
 * Additive metric modulation of the live 180-bone layer. Only depth, light and
 * physics bones move; authored colours, fonts and layout keep the world's
 * identity and stay WCAG-guarded. Values are clamped to BONE_SCHEMA bounds.
 */
export function modulateBonesWithMetrics(bones, params = {}, spatial = null) {
  const base = bones && typeof bones === 'object' ? bones : DEFAULT_BONES;
  const out = { ...base };

  const p = {};
  for (const id of PARAMETER_IDS) p[id] = param01(params?.[id]);
  const s = spatial && typeof spatial === 'object'
    ? spatial
    : deriveSpatialDepth(p, { reducedMotion: false });

  const set = (id, value) => {
    const spec = BONE_SCHEMA[id];
    if (!spec || spec.type !== 'number') return;
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    out[id] = Number(clamp(n, spec.min, spec.max).toFixed(4));
  };

  set('pupilSizeBias', base.pupilSizeBias + 0.12 * (p.closeness - 0.5) + 0.08 * (p.warmth - 0.5));
  set('horizonLineAlpha', Math.max(base.horizonLineAlpha, 0.12 * s.depthIntensity) * (1 - 0.35 * s.atmosphericHaze));
  set('sedimentOpacity', Math.max(base.sedimentOpacity, 0.08 * s.depthIntensity));
  set('auraOpacity', base.auraOpacity + 0.18 * (s.depthIntensity - 0.5) + 0.12 * (p.warmth - 0.5));
  set('auraBreathMs', base.auraBreathMs * (1 + 0.35 * (p.calm - 0.5) - 0.25 * (p.energy - 0.5)));
  set('vignetteAlpha', base.vignetteAlpha + 0.14 * (s.focalSeparation - 0.5));
  set('answerShadowAlpha', base.answerShadowAlpha + 0.08 * s.focalSeparation);
  set('eyeShadowX', base.eyeShadowX + s.lightX * 6);
  set('eyeShadowY', base.eyeShadowY + (s.shadowLengthPx - 14) * 0.45);
  set('eyeShadowBlur', base.eyeShadowBlur + (s.shadowLengthPx - 14) * 0.6);
  set('eyeRimGlowBlur', base.eyeRimGlowBlur + 10 * Math.max(0, s.cornealDepth - 0.65));
  set('catchlightMainX', base.catchlightMainX + s.lightX * 5);
  set('catchlightMainY', base.catchlightMainY + s.lightY * 4);
  set('irisLimbusAlpha', base.irisLimbusAlpha + 0.04 * Math.max(0, s.cornealDepth - 0.5));
  set('focusPull', base.focusPull + 0.18 * (s.focalSeparation - 0.5));
  set('saccadeAmp', base.saccadeAmp + 0.2 * (s.depthIntensity - 0.5));
  set('driftFreqScale', base.driftFreqScale + 0.25 * (s.parallaxGain - 0.85));

  return out;
}

function pickMotionTokens(behaviour) {
  const source = behaviour?.variables;
  const out = {};
  if (!source) return out;
  for (const name of DERIVED_MOTION_TOKENS) {
    if (source[name] !== undefined) out[name] = source[name];
  }
  return out;
}

/**
 * Pure projection of SurfaceState -> CSS variables and presence parameters.
 * Exported separately so tests can verify exact token output without a browser.
 *
 * `metricParams` (the 12 conversation parameters) is folded additively into the
 * state anchor, so conversation-driven depth survives every reapply().
 */
export function projectSurfaceState(
  state = DEFAULT_SURFACE_STATE,
  {
    metricParams = null,
    metricWeight = DEFAULT_METRIC_WEIGHT,
    reducedMotion = false,
    orbAX,
    orbAY,
  } = {},
) {
  const s = state || DEFAULT_SURFACE_STATE;
  const { embodiment, motion, atmosphere, communication } = s;

  const anchorParams = toLegacyParams(s);
  const effectiveLegacyParams = metricParams
    ? blendLegacyWithMetrics(anchorParams, metricParams, metricWeight)
    : anchorParams;
  const spatial = deriveSpatialDepth(effectiveLegacyParams, { reducedMotion, orbAX, orbAY });
  const motionTokens = pickMotionTokens(deriveSurface(effectiveLegacyParams, { reducedMotion }));

  const pal = BACKGROUND_PALETTES[atmosphere.background] ?? BACKGROUND_PALETTES.paper;
  const primaryRgb = parseHex(atmosphere.primaryColor) ?? pal.accent;
  const secondaryRgb = parseHex(atmosphere.secondaryColor) ?? pal.focus;

  // Richer background tint + multi-pole aura so color shifts are immediately tangible.
  const tintBlend = atmosphere.background === 'vivid'
    ? clamp(0.14 + atmosphere.visualIntensity * 0.34, 0.14, 0.48)
    : atmosphere.background === 'minimal'
      ? clamp(atmosphere.visualIntensity * 0.04, 0, 0.04)
      : clamp(atmosphere.visualIntensity * 0.24, 0.02, 0.24);

  const bgStart = mixRgb(pal.bgStart, primaryRgb, tintBlend * 0.55);
  const bgEnd = mixRgb(pal.bgEnd, secondaryRgb, tintBlend * 0.72);

  const contrastDelta = atmosphere.contrast - 0.5;
  const inkTarget = [22, 18, 15];
  const textRgb = contrastDelta > 0
    ? mixRgb(pal.text, inkTarget, contrastDelta * 0.7)
    : pal.text;
  const mutedRgb = contrastDelta > 0
    ? mixRgb(pal.muted, inkTarget, contrastDelta * 0.48)
    : pal.muted;
  const promptRgb = contrastDelta > 0
    ? mixRgb(pal.prompt, inkTarget, contrastDelta * 0.38)
    : pal.prompt;

  const lineAlpha = clamp(0.26 + contrastDelta * 0.45, 0.12, 0.64);
  const auraOpacity = atmosphere.background === 'minimal'
    ? clamp(atmosphere.visualIntensity * 0.12, 0, 0.08)
    : atmosphere.background === 'vivid'
      ? clamp(0.28 + atmosphere.visualIntensity * 0.52, 0.25, 0.8)
      : clamp(0.04 + atmosphere.visualIntensity * 0.42, 0.03, 0.48);

  const auraThirdOpacity = atmosphere.background === 'minimal'
    ? 0
    : atmosphere.background === 'vivid'
      ? clamp(0.18 + atmosphere.visualIntensity * 0.2, 0.15, 0.38)
      : clamp(auraOpacity * 0.25, 0, 0.16);

  const grainOpacity = atmosphere.background === 'minimal'
    ? 0
    : atmosphere.background === 'vivid'
      ? Number(clamp(0.03 + atmosphere.visualIntensity * 0.025, 0.02, 0.055).toFixed(3))
      : Number(clamp(0.01 + atmosphere.visualIntensity * 0.02, 0.006, 0.032).toFixed(3));

  const eyeHaloAlpha = atmosphere.background === 'minimal'
    ? 0.04
    : atmosphere.background === 'vivid'
      ? clamp(0.14 + atmosphere.visualIntensity * 0.22, 0.12, 0.36)
      : clamp(0.08 + atmosphere.visualIntensity * 0.14, 0.06, 0.24);

  const spacingMeasureAdj = embodiment.eyeSpacing > 1.35
    ? Math.min(6, (embodiment.eyeSpacing - 1.35) * 6)
    : embodiment.eyeSpacing < 0.75
      ? -3
      : 0;
  const lengthMeasureAdj = communication.responseLength === 'brief'
    ? -6
    : communication.responseLength === 'detailed' ? 4 : 0;
  const measureRem = Number(clamp(41 - 11 * communication.textDensity + lengthMeasureAdj + spacingMeasureAdj, 25, 45).toFixed(2));
  const gapRem = Number(clamp(1.15 - 0.55 * communication.textDensity, 0.5, 1.4).toFixed(2));
  const lineHeight = Number(clamp(1.78 - 0.34 * communication.textDensity, 1.4, 1.9).toFixed(3));
  const letterSpacingEm = Number(clamp((embodiment.eyeSpacing - 1) * 0.022, -0.012, 0.028).toFixed(4));
  const charDelayMs = Math.round(clamp(64 - 44 * communication.responsePace, 20, 66));
  const eyeGapPx = Math.round(clamp(
    24 - 10 * communication.textDensity + Math.max(0, -embodiment.eyePositionY) * 26,
    8,
    52,
  ));

  let answerWeight = 400;
  if (communication.tone === 'calm') answerWeight = 330;
  else if (communication.tone === 'reserved') answerWeight = 360;
  else if (communication.tone === 'playful' || atmosphere.background === 'vivid') answerWeight = 485;
  else if (communication.tone === 'direct') answerWeight = 490;

  const transitionMs = motion.energy <= 0.2 ? 2200 : 1100;

  const variables = {
    ...motionTokens,
    '--bg-start': toHex(bgStart),
    '--bg-end': toHex(bgEnd),
    '--text': toHex(textRgb),
    '--muted': toHex(mutedRgb),
    '--prompt': toHex(promptRgb),
    '--placeholder': toHex(mutedRgb),
    '--accent': toHex(primaryRgb),
    '--focus-ring': toHex(secondaryRgb),
    '--line': toRgba(pal.line, lineAlpha),
    '--surface-rule': toRgba(pal.line, Math.min(0.65, lineAlpha + 0.04)),
    '--surface-chip': toRgba(bgStart, 0.68),
    '--surface-veil-38': toRgba(bgEnd, 0.82),
    '--surface-veil-96': toRgba(bgEnd, 0.96),
    '--surface-send-hover': toRgba(primaryRgb, 0.16 + atmosphere.visualIntensity * 0.1),
    '--surface-focus-shadow': toRgba(secondaryRgb, 0.55),
    '--surface-aura-a': toRgba(primaryRgb, auraOpacity),
    '--surface-aura-b': toRgba(secondaryRgb, auraOpacity * 0.85),
    '--surface-aura-c': toRgba(pal.auraThird, auraThirdOpacity),
    '--surface-aura-opacity': String(Number(auraOpacity.toFixed(3))),
    '--surface-grain-opacity': String(grainOpacity),
    '--surface-eye-halo': toRgba(primaryRgb, eyeHaloAlpha),
    '--iris-hue': `${pal.irisHue}deg`,
    '--iris-sat': String(Number((pal.irisSat + atmosphere.visualIntensity * 0.16).toFixed(3))),
    '--iris-bright': String(pal.irisBright),
    '--surface-type-scale': String(Number(communication.typographyScale.toFixed(4))),
    '--answer-weight': String(answerWeight),
    '--letter-spacing': `${letterSpacingEm}em`,
    '--pair-measure': `${measureRem}rem`,
    '--pair-gap': `${gapRem}rem`,
    '--pair-line-height': String(lineHeight),
    '--type-cadence-ms': String(charDelayMs),
    '--type-char-ms': String(charDelayMs),
    '--surface-eye-gap': `${eyeGapPx}px`,
    '--surface-transition-ms': `${transitionMs}ms`,
    ...spatial.variables,
  };

  const presenceParams = {
    offsetX: embodiment.eyePositionX,
    offsetY: embodiment.eyePositionY,
    spread: embodiment.eyeSpacing,
    scale: embodiment.eyeScale,
    asymmetry: embodiment.asymmetry,
    intensity: Number(clamp(0.15 + motion.energy * 1.25, 0.1, 1.5).toFixed(3)),
    speed: Number(clamp(0.4 + motion.speed * 1.35, 0.35, 1.8).toFixed(3)),
    damping: motion.damping,
    ambientMovement: Number(clamp(motion.ambientMovement * 1.35, 0, 1.5).toFixed(3)),
    focusStrength: Number(clamp(0.2 + motion.responsiveness * 0.75, 0.15, 0.95).toFixed(3)),
  };

  return {
    legacyParams: anchorParams,
    effectiveLegacyParams,
    spatial,
    variables,
    presenceParams,
    eyeShape: embodiment.eyeShape,
    gazeDirection: embodiment.gazeDirection,
    charDelayMs,
  };
}

/**
 * Mount the live projector that syncs SurfaceState -> DOM CSS + Eye Motion.
 */
export function mountSurfaceProjector({
  surfaceStore,
  presence = null,
  root = typeof document !== 'undefined' ? document.documentElement : null,
  reducedMotion = false,
} = {}) {
  if (!surfaceStore) throw new TypeError('mountSurfaceProjector requires surfaceStore');

  const doc = root?.ownerDocument ?? (typeof document !== 'undefined' ? document : null);
  let resetTimerId = 0;
  let activeBones = null;
  let activeWorldId = null;
  let activeMetricParams = null;
  const writtenBoneVars = new Set();
  const writtenEmbodimentModVars = new Set();

  function clearEmbodimentModulationVars() {
    if (root?.style && typeof root.style.removeProperty === 'function') {
      for (const name of writtenEmbodimentModVars) root.style.removeProperty(name);
    }
    writtenEmbodimentModVars.clear();
  }

  /** Temporary CSS-only atmosphere shift (AT-06); never writes surfaceStore. */
  function setEmbodimentModulation(mod = {}) {
    clearEmbodimentModulationVars();
    if (!mod || typeof mod !== 'object' || !root?.style) return;
    for (const [name, value] of Object.entries(mod)) {
      if (value == null || value === '' || value === 0 || value === '0') continue;
      root.style.setProperty(name, String(value));
      writtenEmbodimentModVars.add(name);
    }
  }

  function clearEmbodimentModulation() {
    clearEmbodimentModulationVars();
  }

  function clearBoneCssVars() {
    if (root && root.style && typeof root.style.removeProperty === 'function') {
      for (const name of writtenBoneVars) root.style.removeProperty(name);
    }
    writtenBoneVars.clear();
    if (root && root.dataset) {
      delete root.dataset.bonesActive;
      delete root.dataset.bonesWorld;
    }
  }

  function apply(state = surfaceStore.getState()) {
    // Conversation metrics are transient state of this mount: they modulate the
    // anchor additively, so a reapply() rebuilds the same surface + conversation.
    const metricWeight = surfaceStore.isModified() ? DEFAULT_METRIC_WEIGHT : 0.75;
    const projected = projectSurfaceState(state, {
      metricParams: activeMetricParams,
      metricWeight,
      reducedMotion,
      orbAX: activeBones?.orbAX,
      orbAY: activeBones?.orbAY,
    });

    // 1. Update legacy behaviour registry + baseline variables first.
    applySurface(projected.effectiveLegacyParams, root, { reducedMotion });
    const behaviour = currentBehaviour();
    if (behaviour && typeof behaviour === 'object') {
      behaviour.charDelayMs = projected.charDelayMs;
      if (behaviour.type) behaviour.type.charMs = projected.charDelayMs;
    }

    // 2. Write curated adaptive variables cleanly on top.
    if (root && root.style && typeof root.style.setProperty === 'function') {
      for (const [name, value] of Object.entries(projected.variables)) {
        root.style.setProperty(name, value);
      }
    }

    if (root && root.dataset) {
      root.dataset.surfaceBackground = state.atmosphere.background;
      root.dataset.surfaceTone = state.communication.tone;
      root.dataset.surfaceLength = state.communication.responseLength;
      root.dataset.surfaceModified = surfaceStore.isModified() ? 'true' : 'false';
      root.dataset.surfaceAlive = state.motion.energy > 0.65 && !reducedMotion ? 'true' : 'false';
    }

    // 3. Apply articulated 180-bone layer if active, merged live with dial changes.
    let finalPresenceParams = projected.presenceParams;
    if (activeBones) {
      const liveBones = ensureWcagContrast({
        ...activeBones,
        eyeScale: state.embodiment.eyeScale,
        eyeSpacing: state.embodiment.eyeSpacing,
        eyePositionX: state.embodiment.eyePositionX,
        eyePositionY: state.embodiment.eyePositionY,
        asymmetry: state.embodiment.asymmetry,
        energy: state.motion.energy,
        speed: state.motion.speed,
        damping: state.motion.damping,
        ambientMovement: state.motion.ambientMovement,
        responsiveness: state.motion.responsiveness,
        answerScale: state.communication.typographyScale,
      });
      // Conversation delta modulates depth, light and physics bones on top of
      // the authored world without replacing its colours or typography.
      const modulatedBones = activeMetricParams
        ? modulateBonesWithMetrics(liveBones, projected.effectiveLegacyParams, projected.spatial)
        : null;
      const mergedBones = modulatedBones ?? liveBones;
      const boneVars = compileBonesToCssVars(mergedBones);
      if (root && root.style && typeof root.style.setProperty === 'function') {
        for (const [name, value] of Object.entries(boneVars)) {
          root.style.setProperty(name, value);
          writtenBoneVars.add(name);
        }
        // Only a live conversation re-writes the light origin; without metrics
        // the 180-bone orb stays the single source of truth for --depth-light-*.
        if (modulatedBones) {
          for (const [name, value] of Object.entries(projected.spatial.variables)) {
            root.style.setProperty(name, value);
          }
        }
      }
      if (root && root.dataset) {
        root.dataset.bonesActive = 'true';
        root.dataset.bonesWorld = activeWorldId || 'custom';
        root.dataset.surfaceAlive = mergedBones.energy > 0.4 && !reducedMotion ? 'true' : 'false';
      }
      if (behaviour && typeof behaviour === 'object') {
        behaviour.charDelayMs = mergedBones.typeCharMs;
        if (behaviour.type) behaviour.type.charMs = mergedBones.typeCharMs;
      }
      finalPresenceParams = {
        ...projected.presenceParams,
        centerX: mergedBones.centerX,
        centerY: mergedBones.centerY,
        asymmetryBias: mergedBones.asymmetryBias,
      };
    }

    // 4. Drive Eye Motion Engine + shape + gaze.
    if (presence) {
      presence.setParams?.(finalPresenceParams);
      presence.setEyeShape?.(projected.eyeShape);
      const gx = projected.gazeDirection?.x ?? 0;
      const gy = projected.gazeDirection?.y ?? 0;
      if (Math.abs(gx) > 0.02 || Math.abs(gy) > 0.02) {
        presence.setFocus?.({ nx: gx, ny: gy, strength: 0.75, source: 'surface' });
      } else {
        presence.clearFocus?.('surface');
      }
    }

    return projected;
  }

  function activateBoneSet(bones, { worldId = null, summary = 'Gestaltete Oberfläche', source = 'world' } = {}) {
    activeBones = bones;
    activeWorldId = worldId;
    const visualIntensity = clamp(bones.auraOpacity ?? 0.5, 0.1, 1);
    surfaceStore.applyPatch({
      embodiment: {
        eyeScale: bones.eyeScale,
        eyeSpacing: bones.eyeSpacing,
        eyePositionX: bones.eyePositionX,
        eyePositionY: bones.eyePositionY,
        asymmetry: bones.asymmetry,
      },
      motion: {
        energy: bones.energy,
        speed: bones.speed,
        damping: bones.damping,
        ambientMovement: bones.ambientMovement,
        responsiveness: bones.responsiveness,
      },
      atmosphere: {
        primaryColor: bones.accentColor,
        secondaryColor: bones.focusRingColor,
        visualIntensity,
      },
      communication: {
        typographyScale: clamp(bones.answerScale, 0.8, 1.36),
      },
    }, {
      source,
      summary,
      focusControls: ['embodiment.eyeSpacing', 'embodiment.eyeScale', 'motion.energy'],
    });
    apply(surfaceStore.getState());
  }

  function applyBonePatch(patch, { source = 'api', summary = 'Knochen-Anpassung' } = {}) {
    const base = activeBones || DEFAULT_BONES;
    const validated = validateBonePatch(patch, base);
    if (!validated.changedBones.length && activeBones) {
      return { changed: false, bones: activeBones, rejected: validated.rejected };
    }
    const nextBones = ensureWcagContrast(validated.nextBones);
    activateBoneSet(nextBones, { worldId: activeWorldId || 'custom', summary, source });
    return { changed: true, bones: nextBones, rejected: validated.rejected };
  }

  function applyWorld(id, { source = 'world' } = {}) {
    const world = getWorldById(id);
    if (!world) return null;
    activateBoneSet(world.bones, { worldId: world.id, summary: world.name, source });
    return world;
  }

  function surprise({ temperature = 0.95, seed = Date.now(), source = 'world' } = {}) {
    const mutated = mutateBonesCreative({ seed, temperature, baseBones: DEFAULT_BONES });
    const worldId = `surprise-${seed}`;
    activateBoneSet(mutated.bones, { worldId, summary: `Experiment #${seed}`, source });
    return { worldId, seed: mutated.seed, bones: mutated.bones };
  }

  function clearBones() {
    if (!activeBones && !writtenBoneVars.size) return;
    activeBones = null;
    activeWorldId = null;
    clearBoneCssVars();
    apply(surfaceStore.getState());
  }

  function getMetricParams() {
    return activeMetricParams ? { ...activeMetricParams } : null;
  }

  // Single entry point for the metrics layer (layer 3 -> layer 2 -> surface).
  function setMetricParams(params) {
    const next = params && typeof params === 'object' && !Array.isArray(params) ? { ...params } : null;
    activeMetricParams = next;
    apply(surfaceStore.getState());
    return getMetricParams();
  }

  function onMetricsCommit(event) {
    setMetricParams(event?.detail?.params ?? null);
  }
  if (doc && typeof doc.addEventListener === 'function') {
    doc.addEventListener('agentfaehig:metrics-commit', onMetricsCommit);
  }

  const unsubscribe = surfaceStore.subscribe((nextState, change) => {
    if (change?.action === 'reset') {
      activeBones = null;
      activeWorldId = null;
      clearBoneCssVars();
      clearEmbodimentModulation();
      if (root?.dataset) {
        clearTimeout(resetTimerId);
        root.dataset.surfaceTransition = 'reset';
        resetTimerId = setTimeout(() => {
          if (root?.dataset) delete root.dataset.surfaceTransition;
        }, 850);
      }
    }
    apply(nextState);
    if (presence) {
      if (change?.action === 'reset') {
        presence.triggerCue?.('reset');
      } else if (change?.source === 'conversation' || change?.source === 'world') {
        presence.triggerCue?.('adapt');
      }
    }
  });

  // Initial synchronous projection so DOM starts consistent with SurfaceState.
  apply(surfaceStore.getState());

  return {
    reapply: () => apply(surfaceStore.getState()),
    applyBonePatch,
    applyWorld,
    surprise,
    clearBones,
    getActiveBones: () => activeBones ? { ...activeBones } : { ...DEFAULT_BONES },
    getActiveWorldId: () => activeWorldId,
    listWorlds: () => WORLD_LIST.map((w) => ({ id: w.id, name: w.name, feeling: w.feeling })),
    boneCount: Object.keys(BONE_SCHEMA).length,
    setMetricParams,
    getMetricParams,
    setEmbodimentModulation,
    clearEmbodimentModulation,
    destroy() {
      clearTimeout(resetTimerId);
      clearBoneCssVars();
      clearEmbodimentModulation();
      unsubscribe();
      if (doc && typeof doc.removeEventListener === 'function') {
        doc.removeEventListener('agentfaehig:metrics-commit', onMetricsCommit);
      }
    },
  };
}
