// Presence (M1 contract, section A) — owns the eye face and the motion toggle.
// Plain ES module. Uses the CSS anatomy layered on top of the vendor eye
// markup while driving all movement through the parametric Eye Motion System
// (eye-motion-profiles.js + eye-motion-engine.js). Vendor files stay untouched.

import { VALID_MOODS } from '../vendor/openvoiceui/face/BaseFace.js';
import { createEyeMotionEngine } from './eye-motion-engine.js';
import { EYE_STATE_PROFILES, normalizeEyeState } from './eye-motion-profiles.js';

// Contract + extended eye-state mapping for mood compatibility.
export const PHASE_MOOD = Object.freeze({
  dormant: 'neutral',
  awakening: 'neutral',
  present: 'neutral',
  idle: 'neutral',
  listening: 'listening',
  thinking: 'thinking',
  processing: 'thinking',
  speaking: 'happy',
  responding: 'happy',
  adapting: 'neutral',
  error: 'neutral',
});

const BLINK_CLOSE_MS = 95;
const BLINK_HOLD_MS = 55;
const BLINK_OPEN_MS = 260;
const AWAKEN_HOLD_MS = 1300;
const PRESENT_SETTLE_MS = 1500;
const ADAPT_HOLD_MS = 1400;

const VAR_AMBIENT = '--pupil-ambient';
const VAR_SACCADE_X = '--saccade-x';
const VAR_SACCADE_Y = '--saccade-y';
const MOTION_VARS = Object.freeze([
  '--eye-pair-x',
  '--eye-pair-y',
  '--eye-pair-z',
  '--eye-pair-scale',
  '--eye-pair-tilt',
  '--eye-pair-rot-x',
  '--eye-pair-rot-y',
  '--eye-left-x',
  '--eye-left-y',
  '--eye-left-scale-x',
  '--eye-left-scale-y',
  '--eye-left-rot-x',
  '--eye-left-rot-y',
  '--eye-right-x',
  '--eye-right-y',
  '--eye-right-scale-x',
  '--eye-right-scale-y',
  '--eye-right-rot-x',
  '--eye-right-rot-y',
  '--eye-left-pupil-x',
  '--eye-left-pupil-y',
  '--eye-right-pupil-x',
  '--eye-right-pupil-y',
  '--eye-left-lid-top',
  '--eye-left-lid-bottom',
  '--eye-right-lid-top',
  '--eye-right-lid-bottom',
  '--eye-left-lid-tilt',
  '--eye-right-lid-tilt',
  '--eye-top-clearance',
  '--eye-bottom-clearance',
  '--eye-presence-opacity',
  '--eye-depth',
  '--eye-lid-shadow-strength',
  '--eye-shadow-y',
  '--eye-shadow-blur',
  '--eye-shadow-alpha',
  '--eye-catchlight-opacity',
  '--blink-close-ms',
  '--blink-open-ms',
  '--pupil-state',
]);
const OWN_VARS = [VAR_AMBIENT, VAR_SACCADE_X, VAR_SACCADE_Y, ...MOTION_VARS];

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Delicate scleral vessels. Drawn in a stretched viewBox so they hug the
// corners of whichever eye size the viewport produces.
const VEIN_SVG = `
<svg viewBox="0 0 100 115" preserveAspectRatio="none" focusable="false">
  <g fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round">
    <path d="M-3 31 C 10 33 16 39 20 48 C 22.5 53 23.5 57 24.5 63"/>
    <path d="M13 41 C 16 44 17.5 48 18 52"/>
    <path d="M-3 76 C 9 73 16 67 21 59"/>
    <path d="M103 34 C 90 36 84 42 80 51 C 78 56 77 60 76 66"/>
    <path d="M87 44 C 84 47 82.5 51 82 55"/>
    <path d="M103 79 C 90 76 83 70 78 62"/>
  </g>
</svg>`;

function element(className) {
  const node = document.createElement('span');
  node.className = className;
  return node;
}

function parseGapPx(el, win) {
  if (!el || typeof win.getComputedStyle !== 'function') return undefined;
  const style = win.getComputedStyle(el);
  const raw = style.columnGap && style.columnGap !== 'normal' ? style.columnGap : style.gap;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * @param {{root: HTMLElement, store: {getState: Function, subscribe: Function}, reducedMotion?: boolean}} options
 */
export function mountPresence({ root, store, reducedMotion = false } = {}) {
  if (!root) throw new Error('mountPresence: root element is required');
  if (!store) throw new Error('mountPresence: store is required');

  const doc = root.ownerDocument ?? document;
  const win = doc.defaultView ?? window;
  const faceBox = root.querySelector('.face-box');
  const eyesContainer = root.querySelector('.eyes-container');
  const leftEye = root.querySelector('#left-eye') ?? root.querySelector('.left-eye');
  const rightEye = root.querySelector('#right-eye') ?? root.querySelector('.right-eye');
  const motionToggle = doc.getElementById('motion-toggle');

  const motionMedia =
    typeof win.matchMedia === 'function'
      ? win.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  const darkMedia =
    typeof win.matchMedia === 'function'
      ? win.matchMedia('(prefers-color-scheme: dark)')
      : null;

  let reducedPref = Boolean(reducedMotion) || Boolean(motionMedia?.matches);
  let phase = store.getState().phase ?? 'dormant';
  let stateLocked = false;
  let paused = false;
  let destroyed = false;
  let motionRunning = false;

  const timers = new Set();
  let stateTimerId = null;
  let rafId = 0;
  let lastFrameAt = 0;
  let ambientFrame = 0;

  let lastPointer = null;
  let eyeCenters = [];
  let measuredAt = 0;
  let cachedAnchor = { x: (win.innerWidth || 1280) / 2, y: (win.innerHeight || 800) * 0.18 };
  let lastSurfaceLevel = doc.documentElement?.dataset?.surfaceLevel ?? '';
  let adaptingPending = false;
  const writtenVars = new Map();
  let lastScenePx = null;
  let lastScenePy = null;

  const initialEngineState = phase === 'dormant'
    ? 'dormant'
    : phase === 'speaking'
      ? 'responding'
      : normalizeEyeState(phase);

  const engine = createEyeMotionEngine({
    state: initialEngineState,
    reducedMotion: reducedPref,
  });

  function eyes() {
    return root.querySelectorAll('.eye');
  }

  function isDormant() {
    return root.classList.contains('is-dormant');
  }

  function motionAllowed() {
    return !destroyed && !paused && !reducedPref;
  }

  // ── Variable & DOM helpers ───────────────────────────────────────────────

  function setVariable(name, value) {
    if (writtenVars.get(name) === value) return;
    writtenVars.set(name, value);
    root.style.setProperty(name, value);
  }

  function setSceneParallax(px, py) {
    const scene = doc.documentElement;
    if (!scene?.style) return;
    if (lastScenePx !== px) {
      lastScenePx = px;
      scene.style.setProperty('--scene-px', px);
    }
    if (lastScenePy !== py) {
      lastScenePy = py;
      scene.style.setProperty('--scene-py', py);
    }
  }

  function renderFrame(frame) {
    if (!frame) return;
    if (motionAllowed()) {
      const sx = clamp((frame.scene?.x ?? frame.pair.x / 240) * 14, -14, 14);
      const sy = clamp((frame.scene?.y ?? frame.pair.y / 86) * 10, -10, 10);
      setSceneParallax(`${sx.toFixed(2)}px`, `${sy.toFixed(2)}px`);
    } else {
      setSceneParallax('0px', '0px');
    }
    setVariable('--eye-pair-x', `${frame.pair.x}px`);
    setVariable('--eye-pair-y', `${frame.pair.y}px`);
    setVariable('--eye-pair-z', `${frame.pair.zPx ?? 0}px`);
    setVariable('--eye-pair-scale', `${frame.pair.scale}`);
    setVariable('--eye-pair-tilt', `${frame.pair.tiltDeg}deg`);
    setVariable('--eye-pair-rot-x', `${motionAllowed() ? (frame.pair.rotXDeg ?? 0) : 0}deg`);
    setVariable('--eye-pair-rot-y', `${motionAllowed() ? (frame.pair.rotYDeg ?? 0) : 0}deg`);
    setVariable('--eye-left-x', `${frame.left.x}px`);
    setVariable('--eye-left-y', `${frame.left.y}px`);
    setVariable('--eye-left-scale-x', `${frame.left.scaleX}`);
    setVariable('--eye-left-scale-y', `${frame.left.scaleY}`);
    setVariable('--eye-left-rot-x', `${motionAllowed() ? (frame.left.rotXDeg ?? 0) : 0}deg`);
    setVariable('--eye-left-rot-y', `${motionAllowed() ? (frame.left.rotYDeg ?? 0) : 0}deg`);
    setVariable('--eye-right-x', `${frame.right.x}px`);
    setVariable('--eye-right-y', `${frame.right.y}px`);
    setVariable('--eye-right-scale-x', `${frame.right.scaleX}`);
    setVariable('--eye-right-scale-y', `${frame.right.scaleY}`);
    setVariable('--eye-right-rot-x', `${motionAllowed() ? (frame.right.rotXDeg ?? 0) : 0}deg`);
    setVariable('--eye-right-rot-y', `${motionAllowed() ? (frame.right.rotYDeg ?? 0) : 0}deg`);
    setVariable('--eye-left-pupil-x', `${frame.left.pupilX}px`);
    setVariable('--eye-left-pupil-y', `${frame.left.pupilY}px`);
    setVariable('--eye-right-pupil-x', `${frame.right.pupilX}px`);
    setVariable('--eye-right-pupil-y', `${frame.right.pupilY}px`);
    setVariable('--eye-left-lid-top', `${frame.left.lidTopPct}%`);
    setVariable('--eye-left-lid-bottom', `${frame.left.lidBottomPct}%`);
    setVariable('--eye-right-lid-top', `${frame.right.lidTopPct}%`);
    setVariable('--eye-right-lid-bottom', `${frame.right.lidBottomPct}%`);
    setVariable('--eye-left-lid-tilt', `${frame.left.lidTiltDeg ?? 0}deg`);
    setVariable('--eye-right-lid-tilt', `${frame.right.lidTiltDeg ?? 0}deg`);
    setVariable('--pupil-state', `${frame.pupilDilation}`);

    const depth = clamp(frame.scene?.depthZ ?? (frame.pair.scale - 1) / 0.42, -1, 1);
    setVariable('--eye-depth', depth.toFixed(3));
    const avgLidTop = ((frame.left.lidTopPct ?? 0) + (frame.right.lidTopPct ?? 0)) * 0.5;
    const lidShadowStrength = clamp(0.46 + Math.max(0, avgLidTop) * 0.02, 0.36, 0.96);
    setVariable('--eye-lid-shadow-strength', lidShadowStrength.toFixed(3));
    setVariable('--eye-shadow-y', `${Math.round(14 + depth * 11)}px`);
    setVariable('--eye-shadow-blur', `${Math.round(28 + depth * 15)}px`);
    setVariable('--eye-shadow-alpha', `${clamp(0.32 + depth * 0.18, 0.14, 0.54).toFixed(3)}`);
    const presenceOpacity = depth < -0.12 ? clamp(1 + (depth + 0.12) * 0.44, 0.72, 1) : 1;
    setVariable('--eye-presence-opacity', presenceOpacity.toFixed(3));
    setVariable('--eye-catchlight-opacity', clamp(0.86 + depth * 0.16, 0.55, 1).toFixed(3));

    const vw = win.innerWidth || 1280;
    const baseTop = vw <= 640 ? 10 : 20;
    const topClearance = Math.round(
      baseTop + Math.max(0, -frame.pair.y) * 0.3 + Math.max(0, frame.pair.scale - 1) * (vw <= 640 ? 22 : 42),
    );
    const bottomClearance = Math.round(
      (vw <= 640 ? 10 : 14)
      + Math.max(0, frame.pair.y) * (vw <= 640 ? 0.38 : 0.58)
      + Math.max(0, frame.pair.scale - 1) * (vw <= 640 ? 40 : 76),
    );
    setVariable('--eye-top-clearance', `${topClearance}px`);
    setVariable('--eye-bottom-clearance', `${bottomClearance}px`);
  }

  function measureViewport() {
    const viewportWidth = win.innerWidth || doc.documentElement?.clientWidth || 1280;
    const viewportHeight = win.innerHeight || doc.documentElement?.clientHeight || 800;
    const containerWidth = root.clientWidth || viewportWidth;

    const eyeWidth = leftEye && leftEye.offsetWidth > 0 ? leftEye.offsetWidth : undefined;
    const eyeHeight = leftEye && leftEye.offsetHeight > 0 ? leftEye.offsetHeight : undefined;
    const baseGapPx = parseGapPx(eyesContainer, win);

    if (faceBox && typeof faceBox.getBoundingClientRect === 'function') {
      const box = faceBox.getBoundingClientRect();
      if (box.width > 0 || box.height > 0) {
        cachedAnchor = {
          x: box.left + box.width / 2,
          y: box.top + box.height * 0.5,
        };
      }
    }

    engine.setViewport({
      viewportWidth,
      viewportHeight,
      containerWidth,
      eyeWidth,
      eyeHeight,
      baseGapPx,
    });
  }

  // ── Anatomy injection ────────────────────────────────────────────────────

  function decorateEye(eye) {
    const white = eye.querySelector('.eye-white');
    const pupil = eye.querySelector('.pupil');

    if (white && !white.querySelector('.eye-veins')) {
      const veins = element('eye-veins');
      veins.innerHTML = VEIN_SVG;
      white.append(
        veins,
        element('eye-catchlight eye-catchlight--main'),
        element('eye-catchlight eye-catchlight--window'),
        element('eye-wetline'),
      );
    }

    if (pupil && !pupil.querySelector('.pupil-core')) {
      pupil.append(
        element('iris-fibers'),
        element('iris-sheen'),
        element('iris-limbus'),
        element('pupil-core'),
      );
    }
  }

  function decorate() {
    for (const eye of eyes()) decorateEye(eye);
  }

  function removeDecoration() {
    const selector =
      '.eye-veins, .eye-catchlight, .eye-wetline, .iris-fibers, .iris-sheen, .iris-limbus, .pupil-core';
    for (const node of root.querySelectorAll(selector)) node.remove();
  }

  // ── Timers ───────────────────────────────────────────────────────────────

  function after(ms, run) {
    const id = win.setTimeout(() => {
      timers.delete(id);
      run();
    }, ms);
    timers.add(id);
    return id;
  }

  function clearStateTimer() {
    if (stateTimerId !== null) {
      win.clearTimeout(stateTimerId);
      timers.delete(stateTimerId);
      stateTimerId = null;
    }
  }

  function scheduleStateTransition(ms, run) {
    clearStateTimer();
    stateTimerId = after(ms, () => {
      stateTimerId = null;
      if (!destroyed && !stateLocked) run();
    });
  }

  function stopTimers() {
    clearStateTimer();
    for (const id of timers) win.clearTimeout(id);
    timers.clear();
  }

  // ── Blinking ─────────────────────────────────────────────────────────────

  function setBlinkPose(pose) {
    for (const eye of eyes()) {
      eye.classList.toggle('is-blinking', pose === 'close');
      eye.classList.toggle('is-reopening', pose === 'open');
    }
  }

  function clearBlinkPose() {
    setBlinkPose('none');
  }

  function performBlink({
    closeMs = BLINK_CLOSE_MS,
    holdMs = BLINK_HOLD_MS,
    openMs = BLINK_OPEN_MS,
    doubleChance = null,
  } = {}) {
    if (!motionAllowed() || isDormant()) return;
    const profile = EYE_STATE_PROFILES[engine.getFrame().state] ?? EYE_STATE_PROFILES.present;
    const params = engine.getSnapshot().params;
    const calmOpen = params.intensity < 0.35 ? 480 : openMs;
    const resolvedDouble = doubleChance !== null
      ? doubleChance
      : clamp((profile.doubleBlinkChance ?? 0.16) * (0.4 + params.intensity * 0.8), 0, 0.38);

    setVariable('--blink-close-ms', `${closeMs}ms`);
    setVariable('--blink-open-ms', `${calmOpen}ms`);
    setBlinkPose('close');
    after(closeMs + holdMs, () => {
      setBlinkPose('open');
      after(calmOpen, () => {
        clearBlinkPose();
        if (Math.random() < resolvedDouble) {
          after(120 + Math.random() * 80, () => performBlink({ closeMs, holdMs, openMs: calmOpen, doubleChance: 0 }));
        }
      });
    });
  }

  function blinkOnce() {
    performBlink();
  }

  function scheduleBlink() {
    if (!motionAllowed()) return;
    const profile = EYE_STATE_PROFILES[engine.getFrame().state] ?? EYE_STATE_PROFILES.present;
    const params = engine.getSnapshot().params;
    const energy = clamp(params.intensity ?? 1, 0.1, 1.5);
    const speed = clamp(params.speed ?? 1, 0.35, 1.8);
    // Low energy halves blink frequency (~5.5-10.5 s); lively/fast wakes the cadence.
    const intervalScale = clamp(1.35 / (0.45 + 0.6 * energy + 0.3 * speed), 0.65, 2.3);
    const minWait = (profile.blinkMinMs > 0 ? profile.blinkMinMs : 2400) * intervalScale;
    const maxWait = (profile.blinkMaxMs > profile.blinkMinMs ? profile.blinkMaxMs : 5400) * intervalScale;
    const longPause = Math.random() < 0.12;
    const wait = longPause
      ? maxWait + Math.random() * 2800
      : minWait + Math.random() * (maxWait - minWait);
    after(wait, () => {
      if (motionAllowed() && !isDormant()) blinkOnce();
      scheduleBlink();
    });
  }

  // ── Ambient pupil dilation (pointer proximity + colour scheme) ───────────

  function measureEyes() {
    const now = performance.now();
    if (eyeCenters.length && now - measuredAt < 350) return;
    measuredAt = now;
    eyeCenters = [];
    for (const eye of eyes()) {
      const rect = eye.getBoundingClientRect();
      if (!rect.width) continue;
      eyeCenters.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.45,
      });
    }
  }

  function baseAmbient() {
    return darkMedia && darkMedia.matches ? 0.035 : 0;
  }

  function restingAmbient() {
    setVariable(VAR_AMBIENT, baseAmbient().toFixed(3));
  }

  function applyAmbient() {
    ambientFrame = 0;
    if (!motionAllowed() || !lastPointer) return;
    measureEyes();
    if (!eyeCenters.length) return;

    let nearest = Infinity;
    for (const center of eyeCenters) {
      const dx = lastPointer.x - center.x;
      const dy = lastPointer.y - center.y;
      nearest = Math.min(nearest, Math.hypot(dx, dy));
    }

    const near = Math.max(0, 1 - nearest / 460);
    const value = baseAmbient() + 0.012 + near * near * 0.06;
    setVariable(VAR_AMBIENT, value.toFixed(3));
  }

  function queueAmbient() {
    if (ambientFrame) return;
    ambientFrame = win.requestAnimationFrame(applyAmbient);
  }

  // ── Pointer & Resize listeners ───────────────────────────────────────────

  function onPointerSample(event) {
    if (!motionAllowed()) return;
    lastPointer = { x: event.clientX, y: event.clientY };
    engine.setPointer(event.clientX, event.clientY, cachedAnchor);
    queueAmbient();
  }

  function onPointerLeave() {
    lastPointer = null;
    engine.clearPointer();
    restingAmbient();
  }

  function onWindowBlur() {
    lastPointer = null;
    engine.clearPointer();
    restingAmbient();
  }

  function onResize() {
    eyeCenters = [];
    measuredAt = 0;
    measureViewport();
    if (reducedPref) renderFrame(engine.settle());
  }

  function onSchemeChange() {
    if (lastPointer && motionAllowed()) queueAmbient();
    else restingAmbient();
  }

  // ── Animation loop (driven only when motion is allowed) ──────────────────

  function stepFrame(now) {
    if (!motionRunning || !motionAllowed()) {
      rafId = 0;
      return;
    }
    const dt = lastFrameAt > 0 ? now - lastFrameAt : 16.667;
    lastFrameAt = now;
    const frame = engine.step(dt);
    renderFrame(frame);
    rafId = win.requestAnimationFrame(stepFrame);
  }

  function startLoop() {
    if (rafId || !motionAllowed()) return;
    lastFrameAt = performance.now();
    rafId = win.requestAnimationFrame(stepFrame);
  }

  function stopLoop() {
    if (!rafId) return;
    win.cancelAnimationFrame(rafId);
    rafId = 0;
    lastFrameAt = 0;
  }

  // ── State orchestration ──────────────────────────────────────────────────

  function syncStateAttributes(nextEyeState) {
    root.dataset.eyeState = nextEyeState;
    const dormant = nextEyeState === 'dormant';
    root.classList.toggle('is-dormant', dormant);
  }

  function applyEngineState(name) {
    const canonical = engine.setState(name);
    syncStateAttributes(canonical);
    if (reducedPref) {
      renderFrame(engine.settle());
    }
    return canonical;
  }

  function applyPhase(nextPhase, prevPhase = phase) {
    phase = nextPhase;
    root.dataset.phase = phase;
    if (stateLocked) return;

    clearStateTimer();

    if (phase === 'dormant') {
      applyEngineState('dormant');
      return;
    }

    if (phase === 'listening') {
      applyEngineState('listening');
      return;
    }

    if (phase === 'thinking') {
      applyEngineState('thinking');
      return;
    }

    if (phase === 'speaking') {
      applyEngineState('responding');
      return;
    }

    if (phase === 'error') {
      applyEngineState('error');
      return;
    }

    // phase === 'idle' (or fallback)
    if (prevPhase === 'dormant') {
      if (!motionAllowed()) {
        applyEngineState('present');
        return;
      }
      applyEngineState('awakening');
      scheduleStateTransition(AWAKEN_HOLD_MS, () => {
        if (phase !== 'idle') return;
        applyEngineState('present');
        scheduleStateTransition(PRESENT_SETTLE_MS, () => {
          if (phase === 'idle') applyEngineState('idle');
        });
      });
      return;
    }

    if (prevPhase === 'speaking') {
      const currentLevel = doc.documentElement?.dataset?.surfaceLevel ?? '';
      const surfaceChanged = adaptingPending || currentLevel !== lastSurfaceLevel;
      lastSurfaceLevel = currentLevel;
      adaptingPending = false;

      if (surfaceChanged && motionAllowed()) {
        applyEngineState('adapting');
        scheduleStateTransition(ADAPT_HOLD_MS, () => {
          if (phase !== 'idle') return;
          applyEngineState('present');
          scheduleStateTransition(PRESENT_SETTLE_MS, () => {
            if (phase === 'idle') applyEngineState('idle');
          });
        });
        return;
      }

      if (motionAllowed()) {
        applyEngineState('present');
        scheduleStateTransition(PRESENT_SETTLE_MS, () => {
          if (phase === 'idle') applyEngineState('idle');
        });
        return;
      }
    }

    applyEngineState('idle');
  }

  // ── Motion lifecycle ─────────────────────────────────────────────────────

  function startOwnMotion() {
    if (!motionAllowed() || motionRunning) return;
    motionRunning = true;
    engine.setPaused(false);
    measureViewport();

    win.addEventListener('mousemove', onPointerSample, { passive: true });
    win.addEventListener('pointerdown', onPointerSample, { passive: true });
    doc.addEventListener('pointerleave', onPointerLeave);
    win.addEventListener('blur', onWindowBlur);
    if (darkMedia && typeof darkMedia.addEventListener === 'function') {
      darkMedia.addEventListener('change', onSchemeChange);
    }

    restingAmbient();
    scheduleBlink();
    startLoop();
  }

  function stopOwnMotion() {
    if (!motionRunning) return;
    motionRunning = false;

    stopLoop();
    stopTimers();
    clearBlinkPose();

    win.removeEventListener('mousemove', onPointerSample);
    win.removeEventListener('pointerdown', onPointerSample);
    doc.removeEventListener('pointerleave', onPointerLeave);
    win.removeEventListener('blur', onWindowBlur);
    if (darkMedia && typeof darkMedia.removeEventListener === 'function') {
      darkMedia.removeEventListener('change', onSchemeChange);
    }

    if (ambientFrame) {
      win.cancelAnimationFrame(ambientFrame);
      ambientFrame = 0;
    }

    setVariable(VAR_SACCADE_X, '0px');
    setVariable(VAR_SACCADE_Y, '0px');
  }

  function syncToggle() {
    if (!motionToggle) return;
    motionToggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
    motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
  }

  function pause() {
    if (destroyed || paused) return;
    paused = true;
    engine.setPaused(true);
    root.classList.add('is-motion-paused');
    stopOwnMotion();
    setSceneParallax('0px', '0px');
    setVariable('--eye-pair-rot-x', '0deg');
    setVariable('--eye-pair-rot-y', '0deg');
    setVariable('--eye-left-rot-x', '0deg');
    setVariable('--eye-left-rot-y', '0deg');
    setVariable('--eye-right-rot-x', '0deg');
    setVariable('--eye-right-rot-y', '0deg');
    syncToggle();
  }

  function resume() {
    if (destroyed || !paused) return;
    paused = false;
    engine.setPaused(false);
    root.classList.remove('is-motion-paused');
    if (motionAllowed()) startOwnMotion();
    else renderFrame(engine.settle());
    syncToggle();
  }

  function onToggle() {
    if (paused) resume();
    else pause();
  }

  function onMotionPrefChange(event) {
    reducedPref = Boolean(reducedMotion) || Boolean(event.matches);
    root.classList.toggle('is-reduced-motion', reducedPref);
    engine.setReducedMotion(reducedPref);
    if (reducedPref) {
      stopOwnMotion();
      renderFrame(engine.settle());
    } else if (!paused) {
      startOwnMotion();
    }
  }

  // ── External bridges (gaze, focus, params, state) ────────────────────────

  function onGaze(event) {
    const detail = event.detail || {};
    if (detail.source === 'release') {
      engine.clearFocusTarget();
      if (reducedPref) renderFrame(engine.settle());
      return;
    }
    if (typeof detail.x !== 'number' || typeof detail.y !== 'number') return;
    engine.setFocusTarget({
      x: detail.x,
      y: detail.y,
      anchor: cachedAnchor,
      strength: Number.isFinite(detail.intensity) ? detail.intensity : 1,
      source: typeof detail.source === 'string' ? detail.source : 'focus',
    });
    if (reducedPref) renderFrame(engine.settle());
  }

  function onFocusIn(event) {
    const target = event.target;
    if (!target || target.id !== 'composer-input') return;
    const rect = typeof target.getBoundingClientRect === 'function'
      ? target.getBoundingClientRect()
      : null;
    if (rect && (rect.width > 0 || rect.height > 0)) {
      engine.setFocusTarget({
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
        anchor: cachedAnchor,
        strength: 0.72,
        source: 'focus',
      });
      if (reducedPref) renderFrame(engine.settle());
    }
  }

  function onFocusOut(event) {
    const target = event.target;
    if (!target || target.id !== 'composer-input') return;
    engine.clearFocusTarget('focus');
    if (reducedPref) renderFrame(engine.settle());
  }

  function onParamsSignal() {
    adaptingPending = true;
    if (!stateLocked && (phase === 'idle') && motionAllowed()) {
      const currentEye = engine.getFrame().state;
      if (currentEye === 'idle' || currentEye === 'present') {
        adaptingPending = false;
        applyEngineState('adapting');
        scheduleStateTransition(ADAPT_HOLD_MS, () => {
          if (phase !== 'idle') return;
          applyEngineState('present');
          scheduleStateTransition(PRESENT_SETTLE_MS, () => {
            if (phase === 'idle') applyEngineState('idle');
          });
        });
      }
    }
  }

  function onEyeStateEvent(event) {
    const detail = event.detail || {};
    if (detail.lock === false) {
      unlockState();
      return;
    }
    if (typeof detail.state === 'string') {
      setState(detail.state, { lock: detail.lock !== false });
    }
  }

  function onEyeParamsEvent(event) {
    const detail = event.detail || {};
    if (detail.reset) {
      resetParams();
      return;
    }
    setParams(detail);
  }

  // ── Public control API ───────────────────────────────────────────────────

  function setState(nextState, { lock = true } = {}) {
    if (destroyed) return engine.getFrame().state;
    stateLocked = Boolean(lock);
    clearStateTimer();
    return applyEngineState(nextState);
  }

  function unlockState() {
    if (destroyed) return;
    stateLocked = false;
    applyPhase(store.getState().phase ?? 'idle', phase);
  }

  function setParams(partial) {
    if (destroyed) return engine.getSnapshot().params;
    const updated = engine.setParams(partial);
    if (reducedPref) renderFrame(engine.settle());
    return updated;
  }

  function resetParams() {
    if (destroyed) return engine.getSnapshot().params;
    const reset = engine.resetParams();
    if (reducedPref) renderFrame(engine.settle());
    return reset;
  }

  function setFocus(target) {
    if (destroyed) return;
    engine.setFocusTarget({ ...target, anchor: target?.anchor ?? cachedAnchor });
    if (reducedPref) renderFrame(engine.settle());
  }

  function clearFocus(source = null) {
    if (destroyed) return;
    engine.clearFocusTarget(source);
    if (reducedPref) renderFrame(engine.settle());
  }

  function getState() {
    return engine.getSnapshot();
  }

  function setEyeShape(shape) {
    if (destroyed) return 'neutral';
    const allowed = new Set(['soft', 'neutral', 'sharp', 'wide']);
    const next = allowed.has(shape) ? shape : 'neutral';
    root.dataset.eyeShape = next;
    return next;
  }

  function triggerCue(kind = 'adapt') {
    if (destroyed) return;
    if (kind === 'reset') {
      root.classList.remove('is-cue-adapt');
      if (motionAllowed() && !isDormant()) {
        performBlink({ closeMs: 130, holdMs: 110, openMs: 340, doubleChance: 0 });
      }
      return;
    }
    if (kind === 'adapt') {
      onParamsSignal();
      root.classList.add('is-cue-adapt');
      after(360, () => {
        if (!destroyed) root.classList.remove('is-cue-adapt');
      });
      if (motionAllowed() && !isDormant()) {
        performBlink({ closeMs: 75, holdMs: 35, openMs: 190, doubleChance: 0 });
      }
    }
  }

  // ── Wiring ───────────────────────────────────────────────────────────────

  root.classList.toggle('is-reduced-motion', reducedPref);
  root.dataset.phase = phase;
  syncStateAttributes(initialEngineState);

  decorate();
  measureViewport();
  renderFrame(engine.settle());

  if (motionToggle) {
    motionToggle.addEventListener('click', onToggle);
  }
  syncToggle();

  win.addEventListener('resize', onResize, { passive: true });
  let resizeObserver = null;
  if (typeof win.ResizeObserver === 'function') {
    resizeObserver = new win.ResizeObserver(() => onResize());
    resizeObserver.observe(root);
  }

  if (motionMedia && typeof motionMedia.addEventListener === 'function') {
    motionMedia.addEventListener('change', onMotionPrefChange);
  }

  const surfaceObserver = typeof win.MutationObserver === 'function' && doc.documentElement
    ? new win.MutationObserver((records) => {
        for (const rec of records) {
          if (rec.attributeName === 'data-surface-level') {
            const nextLevel = doc.documentElement.dataset.surfaceLevel ?? '';
            if (nextLevel !== lastSurfaceLevel) {
              lastSurfaceLevel = nextLevel;
              onParamsSignal();
            }
          }
        }
      })
    : null;
  if (surfaceObserver && doc.documentElement) {
    surfaceObserver.observe(doc.documentElement, {
      attributes: true,
      attributeFilter: ['data-surface-level'],
    });
  }

  doc.addEventListener('agentfaehig:gaze', onGaze);
  doc.addEventListener('focusin', onFocusIn);
  doc.addEventListener('focusout', onFocusOut);
  doc.addEventListener('agentfaehig:params', onParamsSignal);
  doc.addEventListener('agentfaehig:eye-state', onEyeStateEvent);
  doc.addEventListener('agentfaehig:eye-params', onEyeParamsEvent);

  const unsubscribe = store.subscribe((state, prev) => {
    if (!destroyed) applyPhase(state.phase, prev?.phase ?? phase);
  });

  if (motionAllowed()) {
    startOwnMotion();
  } else {
    restingAmbient();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    unsubscribe();
    stopOwnMotion();
    if (resizeObserver) resizeObserver.disconnect();
    if (surfaceObserver) surfaceObserver.disconnect();
    win.removeEventListener('resize', onResize);
    if (motionMedia && typeof motionMedia.removeEventListener === 'function') {
      motionMedia.removeEventListener('change', onMotionPrefChange);
    }
    doc.removeEventListener('agentfaehig:gaze', onGaze);
    doc.removeEventListener('focusin', onFocusIn);
    doc.removeEventListener('focusout', onFocusOut);
    doc.removeEventListener('agentfaehig:params', onParamsSignal);
    doc.removeEventListener('agentfaehig:eye-state', onEyeStateEvent);
    doc.removeEventListener('agentfaehig:eye-params', onEyeParamsEvent);
    if (motionToggle) motionToggle.removeEventListener('click', onToggle);

    removeDecoration();
    for (const eye of eyes()) {
      for (const candidate of VALID_MOODS) eye.classList.remove(candidate);
      eye.classList.remove('is-blinking', 'is-reopening');
    }
    for (const name of OWN_VARS) root.style.removeProperty(name);
    doc.documentElement?.style.removeProperty('--scene-px');
    doc.documentElement?.style.removeProperty('--scene-py');
    lastScenePx = null;
    lastScenePy = null;
    writtenVars.clear();
    root.classList.remove('is-motion-paused', 'is-reduced-motion', 'is-dormant', 'is-cue-adapt');
    delete root.dataset.phase;
    delete root.dataset.eyeState;
    delete root.dataset.eyeShape;
  }

  return {
    pause,
    resume,
    destroy,
    setState,
    unlockState,
    setParams,
    resetParams,
    setEyeShape,
    triggerCue,
    setFocus,
    clearFocus,
    getState,
    engine,
  };
}
