// Pure parametric kinematics engine for the Living Surface Eye Motion System.
// Separates motion computation (positioning, spread, bounded asymmetry, idle
// drift, focus tracking, responsive clamping, reduced motion, smooth damping)
// completely from DOM manipulation and CSS rendering.

import {
  DEFAULT_MOTION_CONFIG,
  EYE_MOTION_LIMITS,
  EYE_STATE_PROFILES,
  normalizeEyeState,
} from './eye-motion-profiles.js';

const TWO_PI = Math.PI * 2;
const POINTER_HOLD_MS = 2000;
const POINTER_DECAY_MS = 1200;
const FOCUS_IDLE_SOFT_THRESHOLD = 0.65;

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function finiteOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function softResponse(value, deadzone = 0.06) {
  const abs = Math.abs(value);
  if (abs <= deadzone) return 0;
  const scaled = (abs - deadzone) / (1 - deadzone);
  return Math.sign(value) * (scaled / (1 + 0.55 * scaled));
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Deterministic mulberry32 PRNG for reproducible tests and organic motion.
 *
 * @param {number} [seed]
 * @returns {() => number}
 */
export function createRng(seed = 0x51a7e) {
  let a = (Number(seed) || 0) >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Compute responsive pixel bounds from measured container/viewport geometry.
 * Ensures eyes move freely on desktop and shrink ranges gracefully on mobile
 * without clipping or overlapping.
 *
 * @param {object} [viewport]
 * @param {object} [config]
 */
export function computeResponsiveBounds(viewport = {}, config = DEFAULT_MOTION_CONFIG) {
  const viewportWidth = Math.max(240, finiteOr(viewport.viewportWidth, 1280));
  const viewportHeight = Math.max(320, finiteOr(viewport.viewportHeight, 800));
  const containerWidth = Math.max(200, finiteOr(viewport.containerWidth, viewportWidth));

  const defaultEyeWidth = Math.min(100, viewportWidth * 0.22);
  const defaultEyeHeight = Math.min(115, viewportWidth * 0.25);
  const defaultGap = Math.min(30, viewportWidth * 0.06);

  const eyeWidth = Math.max(36, finiteOr(viewport.eyeWidth, defaultEyeWidth));
  const eyeHeight = Math.max(36, finiteOr(viewport.eyeHeight, defaultEyeHeight));
  const baseGapPx = Math.max(EYE_MOTION_LIMITS.minGapPx, finiteOr(viewport.baseGapPx, defaultGap));

  const margin = EYE_MOTION_LIMITS.viewportMarginPx;
  const minGapPx = Math.max(EYE_MOTION_LIMITS.minGapPx, eyeWidth * 0.08);
  const maxTotalSpan = Math.max(2 * eyeWidth + minGapPx, containerWidth - 2 * margin);
  const restSpan = 2 * eyeWidth + baseGapPx;
  const availableHalfWidth = Math.max(0, (maxTotalSpan - restSpan) / 2);

  const autoRangeX = clamp(containerWidth * 0.24, 32, 240);
  const autoRangeY = clamp(viewportHeight * 0.095, 36, 86);

  const hasCustomRangeX = Number.isFinite(config.motionRangeX) && config.motionRangeX > 0;
  const hasCustomRangeY = Number.isFinite(config.motionRangeY) && config.motionRangeY > 0;

  const rangeX = Math.min(hasCustomRangeX ? config.motionRangeX : autoRangeX, availableHalfWidth);
  const rangeY = hasCustomRangeY
    ? Math.min(config.motionRangeY, Math.max(12, viewportHeight * 0.22))
    : autoRangeY;

  const spreadStepRatio = Math.max(0.1, finiteOr(config.spreadStepRatio, DEFAULT_MOTION_CONFIG.spreadStepRatio));
  const spreadStepPx = Math.max(eyeWidth * spreadStepRatio, Math.max(0, maxTotalSpan - restSpan) * 0.42);
  const minSpreadDeltaPx = minGapPx - baseGapPx;
  const maxSpreadDeltaPx = Math.max(
    0,
    Math.min((EYE_MOTION_LIMITS.spread[1] - 1) * spreadStepPx, maxTotalSpan - restSpan),
  );

  const pupilRatio = Math.max(0.06, finiteOr(config.pupilRangeRatio, DEFAULT_MOTION_CONFIG.pupilRangeRatio));
  const pupilRangeX = clamp(eyeWidth * pupilRatio, 8, 22);
  const pupilRangeY = clamp(eyeHeight * pupilRatio * 0.85, 7, 19);

  return Object.freeze({
    viewportWidth,
    viewportHeight,
    containerWidth,
    eyeWidth,
    eyeHeight,
    baseGapPx,
    minGapPx,
    maxTotalSpan,
    availableHalfWidth,
    rangeX,
    rangeY,
    spreadStepPx,
    minSpreadDeltaPx,
    maxSpreadDeltaPx,
    pupilRangeX,
    pupilRangeY,
  });
}

function createFilterChannel(initial = 0) {
  return { mid: initial, value: initial, vel: 0 };
}

function stepCriticallyDamped(channel, target, omega, dtSec) {
  if (dtSec <= 0) return channel.value;
  const k = 1 - Math.exp(-omega * dtSec);
  const prev = channel.value;
  channel.mid += (target - channel.mid) * k;
  channel.value += (channel.mid - channel.value) * k;
  channel.vel = (channel.value - prev) / dtSec;
  return channel.value;
}

function snapChannel(channel, target) {
  channel.mid = target;
  channel.value = target;
  channel.vel = 0;
  return target;
}

function clampParamValue(key, raw) {
  if (key === 'motionRangeX' || key === 'motionRangeY') {
    if (raw === null || raw === undefined) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const range = EYE_MOTION_LIMITS[key];
  const fallback = DEFAULT_MOTION_CONFIG[key];
  const n = finiteOr(raw, fallback);
  if (range) return clamp(n, range[0], range[1]);
  if (key === 'spreadStepRatio') return clamp(n, 0.1, 0.9);
  if (key === 'pupilRangeRatio') return clamp(n, 0.06, 0.35);
  if (key === 'reducedMotionScale') return clamp(n, 0, 0.5);
  return n;
}

/**
 * Create a pure parametric eye motion engine.
 *
 * @param {{
 *   state?: string,
 *   params?: Partial<typeof DEFAULT_MOTION_CONFIG>,
 *   viewport?: object,
 *   reducedMotion?: boolean,
 *   seed?: number,
 * }} [options]
 */
export function createEyeMotionEngine({
  state = 'dormant',
  params = {},
  viewport = {},
  reducedMotion = false,
  seed = 0x51a7e,
} = {}) {
  const rng = createRng(seed);
  const userParams = { ...DEFAULT_MOTION_CONFIG };
  const explicitKeys = new Set();

  let currentState = normalizeEyeState(state);
  let isReducedMotion = Boolean(reducedMotion);
  let isPaused = false;
  let bounds = computeResponsiveBounds(viewport, userParams);

  let elapsedMs = 0;
  let microShift = { x: 0, y: 0, spread: 0 };
  let shiftCounter = 0;
  let nextShiftInMs = 1800;

  let pointerState = { active: false, nx: 0, ny: 0, ageMs: 0 };
  let focusState = { active: false, nx: 0, ny: 0, strength: 0, source: null };
  let surfaceGaze = { active: false, nx: 0, ny: 0, strength: 0.65 };

  const channels = {
    pairX: createFilterChannel(0),
    pairY: createFilterChannel(0),
    spreadDeltaPx: createFilterChannel(0),
    pairScale: createFilterChannel(1),
    pairTiltDeg: createFilterChannel(0),
    leftOffsetY: createFilterChannel(0),
    rightOffsetY: createFilterChannel(0),
    leftScale: createFilterChannel(1),
    rightScale: createFilterChannel(1),
    leftPupilX: createFilterChannel(0),
    leftPupilY: createFilterChannel(0),
    rightPupilX: createFilterChannel(0),
    rightPupilY: createFilterChannel(0),
    pupilDilation: createFilterChannel(1),
    leftLidTop: createFilterChannel(0),
    rightLidTop: createFilterChannel(0),
    leftLidBottom: createFilterChannel(0),
    rightLidBottom: createFilterChannel(0),
    lidTiltDeg: createFilterChannel(0),
    microX: createFilterChannel(0),
    microY: createFilterChannel(0),
    microSpread: createFilterChannel(0),
  };

  function applyParamPatch(patch = {}) {
    if (!patch || typeof patch !== 'object') return;
    for (const key of Object.keys(DEFAULT_MOTION_CONFIG)) {
      if (!Object.hasOwn(patch, key)) continue;
      const incoming = patch[key];
      if (incoming === undefined || (incoming === null && key !== 'motionRangeX' && key !== 'motionRangeY')) {
        userParams[key] = DEFAULT_MOTION_CONFIG[key];
        explicitKeys.delete(key);
        continue;
      }
      userParams[key] = clampParamValue(key, incoming);
      if (incoming === null && (key === 'motionRangeX' || key === 'motionRangeY')) {
        explicitKeys.delete(key);
      } else {
        explicitKeys.add(key);
      }
    }
    bounds = computeResponsiveBounds(viewportState, userParams);
  }

  let viewportState = { ...viewport };
  applyParamPatch(params);

  function scheduleNextMicroShift(profile) {
    const [minMs, maxMs] = profile.microShiftIntervalMs || [2600, 5400];
    const span = Math.max(200, maxMs - minMs);
    const speedFactor = clamp(userParams.speed, EYE_MOTION_LIMITS.speed[0], EYE_MOTION_LIMITS.speed[1]);
    nextShiftInMs = (minMs + rng() * span) / speedFactor;
  }

  function triggerMicroShift(profile, intensity) {
    shiftCounter += 1;
    // Periodically return gently near center so the eyes never linger at an edge.
    const returning = shiftCounter % 3 === 0;
    const ambient = clamp(userParams.ambientMovement, EYE_MOTION_LIMITS.ambientMovement[0], EYE_MOTION_LIMITS.ambientMovement[1]);
    const scale = (returning ? 0.25 : 1) * clamp(intensity, 0, 1.3) * ambient;
    microShift = {
      x: (rng() * 2 - 1) * profile.microShiftAmpX * scale,
      y: (rng() * 2 - 1) * profile.microShiftAmpY * scale,
      spread: (rng() * 2 - 1) * profile.spreadBreathAmp * 0.65 * scale,
    };
    scheduleNextMicroShift(profile);
  }

  function normalizeTargetInputs(input = {}) {
    if (Number.isFinite(input.nx) && Number.isFinite(input.ny)) {
      return {
        nx: clamp(input.nx, -1, 1),
        ny: clamp(input.ny, -1, 1),
      };
    }
    const anchorX = finiteOr(input.anchor?.x, bounds.viewportWidth / 2);
    const anchorY = finiteOr(input.anchor?.y, bounds.viewportHeight * 0.22);
    const halfW = Math.max(120, bounds.viewportWidth * 0.5);
    const halfH = Math.max(120, bounds.viewportHeight * 0.5);
    return {
      nx: clamp((finiteOr(input.x, anchorX) - anchorX) / halfW, -1, 1),
      ny: clamp((finiteOr(input.y, anchorY) - anchorY) / halfH, -1, 1),
    };
  }

  function resolveEffectiveParams() {
    const profile = EYE_STATE_PROFILES[currentState] ?? EYE_STATE_PROFILES.present;
    const motionScale = isReducedMotion ? userParams.reducedMotionScale : 1;

    const intensity = clamp(
      (explicitKeys.has('intensity') ? userParams.intensity : 1) * profile.intensity,
      EYE_MOTION_LIMITS.intensity[0],
      EYE_MOTION_LIMITS.intensity[1],
    );
    const speed = clamp(
      explicitKeys.has('speed') ? userParams.speed : 1,
      EYE_MOTION_LIMITS.speed[0],
      EYE_MOTION_LIMITS.speed[1],
    );
    const ambientMovement = clamp(
      explicitKeys.has('ambientMovement') ? userParams.ambientMovement : 1,
      EYE_MOTION_LIMITS.ambientMovement[0],
      EYE_MOTION_LIMITS.ambientMovement[1],
    );
    const damping = clamp(
      explicitKeys.has('damping') ? userParams.damping : profile.damping,
      EYE_MOTION_LIMITS.damping[0],
      EYE_MOTION_LIMITS.damping[1],
    );
    const asymmetry = clamp(
      (explicitKeys.has('asymmetry') ? userParams.asymmetry : profile.asymmetry) * (isReducedMotion ? 0.35 : 1),
      EYE_MOTION_LIMITS.asymmetry[0],
      EYE_MOTION_LIMITS.asymmetry[1],
    );
    const asymmetryBias = clamp(
      explicitKeys.has('asymmetryBias') ? userParams.asymmetryBias : profile.asymmetryBias,
      EYE_MOTION_LIMITS.asymmetryBias[0],
      EYE_MOTION_LIMITS.asymmetryBias[1],
    );

    const spreadBase = explicitKeys.has('spread')
      ? clamp(
          userParams.spread * (1 + (profile.spread - 1) * 0.25),
          EYE_MOTION_LIMITS.spread[0],
          EYE_MOTION_LIMITS.spread[1],
        )
      : clamp(profile.spread, EYE_MOTION_LIMITS.spread[0], EYE_MOTION_LIMITS.spread[1]);
    const scaleBase = explicitKeys.has('scale')
      ? clamp(
          userParams.scale * (1 + (profile.scale - 1) * 0.25),
          EYE_MOTION_LIMITS.scale[0],
          EYE_MOTION_LIMITS.scale[1],
        )
      : clamp(profile.scale, EYE_MOTION_LIMITS.scale[0], EYE_MOTION_LIMITS.scale[1]);

    return {
      profile,
      motionScale,
      intensity,
      speed,
      ambientMovement,
      damping,
      asymmetry,
      asymmetryBias,
      spreadBase,
      scaleBase,
    };
  }

  function computeTargets(dtMs) {
    const eff = resolveEffectiveParams();
    const { profile, motionScale, intensity, speed, ambientMovement, asymmetry, asymmetryBias } = eff;
    const tSec = (elapsedMs / 1000) * speed;

    // 1. Focus & pointer weights (non-creepy, calm priority hierarchy)
    let focusEngagement = 0;
    let focusPullX = 0;
    let focusPullY = 0;
    let driftSuppression = 0;

    if (!isReducedMotion && focusState.active && currentState !== 'dormant') {
      const strength = clamp01(focusState.strength);
      const isIdleSource = focusState.source === 'idle';
      if (isIdleSource) {
        const isGlance = strength >= FOCUS_IDLE_SOFT_THRESHOLD;
        focusEngagement = isGlance ? 0.56 * strength : 0.14 * strength;
        driftSuppression = isGlance ? 0.35 : 0.08;
      } else {
        focusEngagement = clamp01(strength * userParams.focusStrength * 1.15);
        driftSuppression = clamp01(focusEngagement * Math.max(profile.focusCenterPull, 0.78));
      }
      focusPullX = softResponse(focusState.nx, 0.03);
      focusPullY = softResponse(focusState.ny, 0.03);
    } else if (!isReducedMotion && surfaceGaze.active && currentState !== 'dormant') {
      focusEngagement = clamp01(surfaceGaze.strength * 0.75);
      driftSuppression = 0.15;
      focusPullX = softResponse(surfaceGaze.nx, 0.02);
      focusPullY = softResponse(surfaceGaze.ny, 0.02);
    }

    let pointerWeight = 0;
    let pointerPullX = 0;
    let pointerPullY = 0;
    if (!isReducedMotion && pointerState.active && currentState !== 'dormant') {
      const decay = pointerState.ageMs <= POINTER_HOLD_MS
        ? 1
        : Math.max(0, 1 - (pointerState.ageMs - POINTER_HOLD_MS) / POINTER_DECAY_MS);
      pointerWeight = profile.pointerFollow * decay * (1 - clamp01(focusEngagement * 1.1));
      pointerPullX = softResponse(pointerState.nx, 0.06);
      pointerPullY = softResponse(pointerState.ny, 0.06);
    }

    // 2. Autonomous drift & breathing (zeroed under reduced motion)
    const liveAmp = isReducedMotion ? 0 : intensity * ambientMovement * (1 - driftSuppression * 0.85);
    const omegaDrift = profile.driftFreq * TWO_PI;
    const driftWaveX = Math.sin(tSec * omegaDrift) * 0.64 + Math.sin(tSec * omegaDrift * 1.618 + 1.15) * 0.36;
    const driftWaveY = Math.cos(tSec * omegaDrift * 0.84 + 0.5) * 0.62 + Math.sin(tSec * omegaDrift * 1.37 + 2.3) * 0.38;
    const breathWave = Math.sin(tSec * (profile.driftFreq * 0.85) * TWO_PI + 0.4);

    // Step micro-shift filter smoothly even when autonomous shifts ease toward zero
    const microOmega = 4.2;
    const microTargetX = isReducedMotion ? 0 : microShift.x * (1 - driftSuppression * 0.8);
    const microTargetY = isReducedMotion ? 0 : microShift.y * (1 - driftSuppression * 0.8);
    const microTargetSpread = isReducedMotion ? 0 : microShift.spread * (1 - driftSuppression * 0.6);

    const dtSec = dtMs / 1000;
    const mX = isReducedMotion ? 0 : stepCriticallyDamped(channels.microX, microTargetX, microOmega, dtSec);
    const mY = isReducedMotion ? 0 : stepCriticallyDamped(channels.microY, microTargetY, microOmega, dtSec);
    const mSpread = isReducedMotion ? 0 : stepCriticallyDamped(channels.microSpread, microTargetSpread, microOmega, dtSec);

    // 3. Pair center + state offset + user offset + drift + focus/pointer pull
    const combinedOffsetX = clamp(
      userParams.centerX + (profile.offsetX * (1 - driftSuppression * 0.55) + userParams.offsetX) * motionScale,
      EYE_MOTION_LIMITS.centerX[0] + EYE_MOTION_LIMITS.offsetX[0],
      EYE_MOTION_LIMITS.centerX[1] + EYE_MOTION_LIMITS.offsetX[1],
    );
    const combinedOffsetY = clamp(
      userParams.centerY + (profile.offsetY * (1 - driftSuppression * 0.35) + userParams.offsetY) * motionScale,
      EYE_MOTION_LIMITS.centerY[0] + EYE_MOTION_LIMITS.offsetY[0],
      EYE_MOTION_LIMITS.centerY[1] + EYE_MOTION_LIMITS.offsetY[1],
    );

    const focusFollow = Math.max(profile.eyeFollowRatio, 0.42);
    const targetNormX = combinedOffsetX
      + (driftWaveX * profile.driftAmpX + mX) * liveAmp
      + focusPullX * focusFollow * focusEngagement
      + pointerPullX * profile.eyeFollowRatio * pointerWeight;

    const targetNormY = combinedOffsetY
      + (driftWaveY * profile.driftAmpY + mY) * liveAmp
      + focusPullY * focusFollow * 0.9 * focusEngagement
      + pointerPullY * profile.eyeFollowRatio * 0.85 * pointerWeight;

    const rawPairX = clamp(targetNormX, -1.15, 1.15) * bounds.rangeX;
    const rawPairY = clamp(targetNormY, -1.15, 1.15) * bounds.rangeY;

    // 4. Dynamic spread (closer / wider) — keep static spread legible under reducedMotion
    const spreadFocusShift = isReducedMotion
      ? 0
      : -0.09 * focusEngagement * (focusState.source === 'idle' || !focusState.active ? 0.35 : 1);
    const spreadBreath = isReducedMotion ? 0 : breathWave * profile.spreadBreathAmp * intensity * ambientMovement + mSpread;
    const effectiveSpread = clamp(
      eff.spreadBase + spreadFocusShift + spreadBreath,
      EYE_MOTION_LIMITS.spread[0],
      EYE_MOTION_LIMITS.spread[1],
    );
    const rawSpreadDeltaPx = clamp(
      (effectiveSpread - 1) * bounds.spreadStepPx,
      bounds.minSpreadDeltaPx,
      bounds.maxSpreadDeltaPx,
    );

    // 5. Pair scale + subtle tilt — keep static scale legible under reducedMotion
    const scaleBreath = isReducedMotion ? 0 : breathWave * profile.scaleBreathAmp * intensity * ambientMovement;
    const scaleFocusLift = isReducedMotion ? 0 : 0.015 * focusEngagement;
    const pairScale = clamp(
      eff.scaleBase + scaleFocusLift + scaleBreath,
      EYE_MOTION_LIMITS.scale[0],
      EYE_MOTION_LIMITS.scale[1],
    );

    const tiltNorm = (rawPairX / Math.max(bounds.rangeX, 1)) * 0.65 + asymmetry * asymmetryBias * 1.65;
    const pairTiltDeg = isReducedMotion
      ? 0
      : clamp(tiltNorm * 1.45, -EYE_MOTION_LIMITS.maxTiltDeg, EYE_MOTION_LIMITS.maxTiltDeg);

    // 6. Bounded left/right asymmetry (vertical nuance, scale nuance, subtle lead/lag)
    const asymWave = isReducedMotion ? 0 : Math.sin(tSec * 0.42 + 0.7) * 0.45;
    const asymDirection = asymmetryBias !== 0 ? asymmetryBias : asymWave;
    const asymVertPx = clamp(asymmetry * asymDirection * bounds.rangeY * 0.14, -6, 6);

    const asymScaleWave = isReducedMotion ? 0 : Math.cos(tSec * 0.35 + 0.2) * 0.35;
    const asymScaleDelta = clamp(
      asymmetry * (asymmetryBias * 0.08 + asymScaleWave * 0.05),
      -EYE_MOTION_LIMITS.maxAsymmetryScaleDelta,
      EYE_MOTION_LIMITS.maxAsymmetryScaleDelta,
    );

    // 7. Pupil gaze relative to each eye (includes wide convergence & bounded asymmetry)
    const pupilFocusWeight = focusEngagement * 0.78;
    const pupilPointerWeight = pointerWeight * 0.85;
    const pupilNormX = clamp(
      profile.pupilBiasX * (1 - driftSuppression * 0.7)
        + (driftWaveX * profile.driftAmpX * 0.5 + mX * 0.65) * liveAmp
        + focusPullX * pupilFocusWeight
        + pointerPullX * pupilPointerWeight,
      -1,
      1,
    );
    const pupilNormY = clamp(
      profile.pupilBiasY * (1 - driftSuppression * 0.45)
        + (driftWaveY * profile.driftAmpY * 0.45 + mY * 0.6) * liveAmp
        + focusPullY * pupilFocusWeight
        + pointerPullY * pupilPointerWeight,
      -1,
      1,
    );

    const wideConvergence = effectiveSpread > 1.3 ? clamp((effectiveSpread - 1.3) * 2.4, 0, 3.2) : 0;
    const proximityConvergence = pairScale > 1.05 ? clamp((pairScale - 1.05) * 3.0, 0, 1.4) : 0;
    const convergencePx = clamp(
      ((focusEngagement * 1.1 + asymmetry * 0.55) * (isReducedMotion ? 0.25 : 1))
        + wideConvergence
        + proximityConvergence,
      -2.2,
      4.2,
    );
    const pupilAsymY = clamp(asymmetry * asymDirection * 1.1, -1.5, 1.5);

    const proximityDilation = (pairScale - 1) * 0.14;
    const pupilDilation = clamp(
      profile.pupilDilation + 0.03 * focusEngagement + proximityDilation,
      0.66,
      1.3,
    );

    // 8. Anatomical gaze-coupled lids, low-energy calm weight, and panoramic wide-spread poise
    const gazeLid = pupilNormY * 13;
    const explicitIntensity = explicitKeys.has('intensity') ? userParams.intensity : 1;
    const lowEnergyLid = explicitIntensity < 0.35 ? (0.35 - explicitIntensity) * 24 : 0;
    const wideCalmLid = effectiveSpread > 1.35 ? 3 : 0;
    const lidAsym = profile.lidAsymmetryPct * (isReducedMotion ? 0.25 : 1);

    const baseLidTop = profile.lidTopPct + gazeLid + lowEnergyLid + wideCalmLid;
    const leftLidTop = clamp(baseLidTop + lidAsym * 0.5, -10, 32);
    const rightLidTop = clamp(baseLidTop - lidAsym * 0.5, -10, 32);
    const leftLidBottom = clamp(profile.lidBottomPct - lowEnergyLid * 0.15, -28, 6);
    const rightLidBottom = clamp(profile.lidBottomPct - lowEnergyLid * 0.15, -28, 6);
    const lidTiltDeg = isReducedMotion ? 0 : clamp(asymmetry * asymmetryBias * 6.5, -4, 4);

    return {
      eff,
      focusEngagement,
      pointerWeight,
      pairX: rawPairX,
      pairY: rawPairY,
      spreadDeltaPx: rawSpreadDeltaPx,
      pairScale,
      pairTiltDeg,
      leftOffsetY: asymVertPx,
      rightOffsetY: -asymVertPx,
      leftScale: 1 + asymScaleDelta,
      rightScale: 1 - asymScaleDelta,
      leftPupilX: pupilNormX * bounds.pupilRangeX + convergencePx,
      leftPupilY: pupilNormY * bounds.pupilRangeY + pupilAsymY,
      rightPupilX: pupilNormX * bounds.pupilRangeX - convergencePx,
      rightPupilY: pupilNormY * bounds.pupilRangeY - pupilAsymY,
      pupilDilation,
      leftLidTop,
      rightLidTop,
      leftLidBottom,
      rightLidBottom,
      lidTiltDeg,
    };
  }

  function buildFrame(targets) {
    const profile = targets?.eff?.profile ?? (EYE_STATE_PROFILES[currentState] ?? EYE_STATE_PROFILES.present);
    const asymRatio = targets?.eff?.asymmetry ?? profile.asymmetry;

    // Enforce responsive non-overflow and non-overlap invariants across all viewports
    const maxFitScale = Math.max(
      EYE_MOTION_LIMITS.scale[0],
      (bounds.maxTotalSpan - bounds.minGapPx) / Math.max(2 * bounds.eyeWidth, 1),
    );
    const pairScale = clamp(
      channels.pairScale.value,
      EYE_MOTION_LIMITS.scale[0],
      Math.min(EYE_MOTION_LIMITS.scale[1], maxFitScale),
    );
    const scaledEyesWidth = 2 * bounds.eyeWidth * pairScale;
    const maxSpreadForScale = Math.max(
      bounds.minSpreadDeltaPx,
      bounds.maxTotalSpan - scaledEyesWidth - bounds.baseGapPx,
    );
    const spreadDeltaPx = clamp(
      channels.spreadDeltaPx.value,
      bounds.minSpreadDeltaPx,
      Math.min(bounds.maxSpreadDeltaPx, maxSpreadForScale),
    );
    const maxPairX = Math.max(
      0,
      (bounds.maxTotalSpan - (scaledEyesWidth + bounds.baseGapPx + spreadDeltaPx)) / 2,
    );
    const pairX = clamp(channels.pairX.value, -maxPairX, maxPairX);
    const pairY = clamp(channels.pairY.value, -bounds.rangeY * 1.2, bounds.rangeY * 1.2);

    // Subtle horizontal velocity lag creates organic lead/follow asymmetry during sweeps
    const normVelX = clamp(channels.pairX.vel / Math.max(bounds.rangeX * 2, 1), -1, 1);
    const dynamicLagPx = isReducedMotion ? 0 : clamp(normVelX * asymRatio * 5.5, -3.5, 3.5);

    const halfSpread = spreadDeltaPx / 2;
    const leftX = -halfSpread - dynamicLagPx * 0.5;
    const rightX = halfSpread + dynamicLagPx * 0.5;

    const effectiveGapPx = Math.max(
      bounds.minGapPx,
      bounds.baseGapPx + rightX - leftX,
    );
    const clampedSpreadHalf = (effectiveGapPx - bounds.baseGapPx) / 2;

    const leftScale = clamp(channels.leftScale.value, 0.92, 1.08);
    const rightScale = clamp(channels.rightScale.value, 0.92, 1.08);
    const lidTiltDeg = round(channels.lidTiltDeg.value, 2);

    return {
      state: currentState,
      pair: {
        x: round(pairX, 2),
        y: round(pairY, 2),
        scale: round(pairScale, 4),
        tiltDeg: round(channels.pairTiltDeg.value, 3),
      },
      left: {
        x: round(-clampedSpreadHalf, 2),
        y: round(channels.leftOffsetY.value, 2),
        scaleX: round(leftScale, 4),
        scaleY: round(leftScale, 4),
        pupilX: round(clamp(channels.leftPupilX.value, -bounds.pupilRangeX * 1.1, bounds.pupilRangeX * 1.1), 2),
        pupilY: round(clamp(channels.leftPupilY.value, -bounds.pupilRangeY * 1.1, bounds.pupilRangeY * 1.1), 2),
        lidTopPct: round(channels.leftLidTop.value, 2),
        lidBottomPct: round(channels.leftLidBottom.value, 2),
        lidTiltDeg,
      },
      right: {
        x: round(clampedSpreadHalf, 2),
        y: round(channels.rightOffsetY.value, 2),
        scaleX: round(rightScale, 4),
        scaleY: round(rightScale, 4),
        pupilX: round(clamp(channels.rightPupilX.value, -bounds.pupilRangeX * 1.1, bounds.pupilRangeX * 1.1), 2),
        pupilY: round(clamp(channels.rightPupilY.value, -bounds.pupilRangeY * 1.1, bounds.pupilRangeY * 1.1), 2),
        lidTopPct: round(channels.rightLidTop.value, 2),
        lidBottomPct: round(channels.rightLidBottom.value, 2),
        lidTiltDeg: round(-lidTiltDeg, 2),
      },
      effectiveGapPx: round(effectiveGapPx, 2),
      pupilDilation: round(channels.pupilDilation.value, 4),
      focusActive: focusState.active && currentState !== 'dormant',
      reducedMotion: isReducedMotion,
      paused: isPaused,
    };
  }

  function settleImmediate() {
    const targets = computeTargets(0);
    snapChannel(channels.pairX, targets.pairX);
    snapChannel(channels.pairY, targets.pairY);
    snapChannel(channels.spreadDeltaPx, targets.spreadDeltaPx);
    snapChannel(channels.pairScale, targets.pairScale);
    snapChannel(channels.pairTiltDeg, targets.pairTiltDeg);
    snapChannel(channels.leftOffsetY, targets.leftOffsetY);
    snapChannel(channels.rightOffsetY, targets.rightOffsetY);
    snapChannel(channels.leftScale, targets.leftScale);
    snapChannel(channels.rightScale, targets.rightScale);
    snapChannel(channels.leftPupilX, targets.leftPupilX);
    snapChannel(channels.leftPupilY, targets.leftPupilY);
    snapChannel(channels.rightPupilX, targets.rightPupilX);
    snapChannel(channels.rightPupilY, targets.rightPupilY);
    snapChannel(channels.pupilDilation, targets.pupilDilation);
    snapChannel(channels.leftLidTop, targets.leftLidTop);
    snapChannel(channels.rightLidTop, targets.rightLidTop);
    snapChannel(channels.leftLidBottom, targets.leftLidBottom);
    snapChannel(channels.rightLidBottom, targets.rightLidBottom);
    snapChannel(channels.lidTiltDeg, targets.lidTiltDeg);
    snapChannel(channels.microX, 0);
    snapChannel(channels.microY, 0);
    snapChannel(channels.microSpread, 0);
    return buildFrame(targets);
  }

  let lastFrame = settleImmediate();

  function step(dtMs = 16.667) {
    if (isPaused) return lastFrame;

    const dt = clamp(finiteOr(dtMs, 16.667), 0, 64);
    if (isReducedMotion) {
      lastFrame = settleImmediate();
      return lastFrame;
    }

    elapsedMs += dt;
    if (pointerState.active) pointerState.ageMs += dt;

    const profile = EYE_STATE_PROFILES[currentState] ?? EYE_STATE_PROFILES.present;
    if (currentState !== 'dormant' && profile.microShiftAmpX > 0) {
      nextShiftInMs -= dt;
      if (nextShiftInMs <= 0) {
        triggerMicroShift(profile, resolveEffectiveParams().intensity);
      }
    }

    const targets = computeTargets(dt);
    const dtSec = dt / 1000;
    const omega = 2.5 + targets.eff.damping * 55;
    const pupilOmega = omega * 1.45;

    stepCriticallyDamped(channels.pairX, targets.pairX, omega, dtSec);
    stepCriticallyDamped(channels.pairY, targets.pairY, omega, dtSec);
    stepCriticallyDamped(channels.spreadDeltaPx, targets.spreadDeltaPx, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.pairScale, targets.pairScale, omega * 0.85, dtSec);
    stepCriticallyDamped(channels.pairTiltDeg, targets.pairTiltDeg, omega * 0.85, dtSec);
    stepCriticallyDamped(channels.leftOffsetY, targets.leftOffsetY, omega, dtSec);
    stepCriticallyDamped(channels.rightOffsetY, targets.rightOffsetY, omega, dtSec);
    stepCriticallyDamped(channels.leftScale, targets.leftScale, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.rightScale, targets.rightScale, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.leftPupilX, targets.leftPupilX, pupilOmega, dtSec);
    stepCriticallyDamped(channels.leftPupilY, targets.leftPupilY, pupilOmega, dtSec);
    stepCriticallyDamped(channels.rightPupilX, targets.rightPupilX, pupilOmega, dtSec);
    stepCriticallyDamped(channels.rightPupilY, targets.rightPupilY, pupilOmega, dtSec);
    stepCriticallyDamped(channels.pupilDilation, targets.pupilDilation, omega * 0.75, dtSec);
    stepCriticallyDamped(channels.leftLidTop, targets.leftLidTop, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.rightLidTop, targets.rightLidTop, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.leftLidBottom, targets.leftLidBottom, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.rightLidBottom, targets.rightLidBottom, omega * 0.9, dtSec);
    stepCriticallyDamped(channels.lidTiltDeg, targets.lidTiltDeg, omega * 0.8, dtSec);

    lastFrame = buildFrame(targets);
    return lastFrame;
  }

  return {
    setState(nextState) {
      const normalized = normalizeEyeState(nextState);
      if (normalized === currentState) return currentState;
      currentState = normalized;
      const profile = EYE_STATE_PROFILES[currentState];
      microShift = { x: 0, y: 0, spread: 0 };
      scheduleNextMicroShift(profile);
      if (isReducedMotion) lastFrame = settleImmediate();
      return currentState;
    },

    setParams(partial) {
      applyParamPatch(partial);
      if (isReducedMotion) lastFrame = settleImmediate();
      return { ...userParams };
    },

    resetParams() {
      Object.assign(userParams, DEFAULT_MOTION_CONFIG);
      explicitKeys.clear();
      bounds = computeResponsiveBounds(viewportState, userParams);
      if (isReducedMotion) lastFrame = settleImmediate();
      return { ...userParams };
    },

    setViewport(nextViewport = {}) {
      viewportState = { ...viewportState, ...nextViewport };
      bounds = computeResponsiveBounds(viewportState, userParams);
      if (isReducedMotion) lastFrame = settleImmediate();
      return bounds;
    },

    setPointer(x, y, anchor = null) {
      const norm = normalizeTargetInputs({ x, y, anchor });
      pointerState = { active: true, nx: norm.nx, ny: norm.ny, ageMs: 0 };
    },

    clearPointer() {
      pointerState = { active: false, nx: 0, ny: 0, ageMs: 0 };
    },

    setFocusTarget(target = {}) {
      const norm = normalizeTargetInputs(target);
      const source = typeof target.source === 'string' ? target.source : 'focus';
      const strength = clamp01(finiteOr(target.strength ?? target.intensity, 1));
      if (source === 'surface') {
        surfaceGaze = {
          active: Math.abs(norm.nx) > 0.02 || Math.abs(norm.ny) > 0.02,
          nx: norm.nx,
          ny: norm.ny,
          strength,
        };
      } else {
        focusState = {
          active: true,
          nx: norm.nx,
          ny: norm.ny,
          strength,
          source,
        };
      }
      if (isReducedMotion) lastFrame = settleImmediate();
    },

    clearFocusTarget(source = null) {
      if (source === 'surface') {
        surfaceGaze = { active: false, nx: 0, ny: 0, strength: 0.65 };
        if (isReducedMotion) lastFrame = settleImmediate();
        return;
      }
      if (source && focusState.source && focusState.source !== source) return;
      focusState = { active: false, nx: 0, ny: 0, strength: 0, source: null };
      if (isReducedMotion) lastFrame = settleImmediate();
    },

    setReducedMotion(flag) {
      const next = Boolean(flag);
      if (next === isReducedMotion) return isReducedMotion;
      isReducedMotion = next;
      if (isReducedMotion) lastFrame = settleImmediate();
      return isReducedMotion;
    },

    setPaused(flag) {
      isPaused = Boolean(flag);
      return isPaused;
    },

    step,

    settle() {
      lastFrame = settleImmediate();
      return lastFrame;
    },

    getFrame() {
      return lastFrame;
    },

    getSnapshot() {
      const eff = resolveEffectiveParams();
      return {
        state: currentState,
        params: { ...userParams },
        effectiveParams: {
          intensity: eff.intensity,
          damping: eff.damping,
          asymmetry: eff.asymmetry,
          asymmetryBias: eff.asymmetryBias,
          spread: eff.spreadBase,
          scale: eff.scaleBase,
        },
        bounds,
        reducedMotion: isReducedMotion,
        paused: isPaused,
        focus: { ...focusState },
        frame: lastFrame,
      };
    },
  };
}
