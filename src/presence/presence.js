// Presence (M1 contract, section A) — owns the eye face and the motion toggle.
// Plain ES module. Uses the unmodified standalone EyeFace from vendor.
//
// Beyond the vendor eye, this module layers a hyperreal anatomy on top of the
// existing markup (iris fibres, limbus, soft pupil, fixed catchlights, veins,
// wet lid margins) and owns its own gaze-adjacent motion: asymmetric blinking
// with occasional double blinks, rare microsaccades, and subtle pupil dilation
// from state, ambient brightness and pointer proximity. Vendor files stay
// untouched; everything here is additive and removable in destroy().

import { EyeFace } from '../vendor/openvoiceui/face/EyeFace.js';
import { VALID_MOODS } from '../vendor/openvoiceui/face/BaseFace.js';

// Contract mapping: dormant closes the lids (own root class), every other
// phase maps to one of the vendor moods.
export const PHASE_MOOD = Object.freeze({
  dormant: 'neutral',
  idle: 'neutral',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'happy',
});

const BLINK_CLOSE_MS = 95;
const BLINK_HOLD_MS = 55;
const BLINK_OPEN_MS = 260;
const DOUBLE_BLINK_CHANCE = 0.16;

const VAR_AMBIENT = '--pupil-ambient';
const VAR_SACCADE_X = '--saccade-x';
const VAR_SACCADE_Y = '--saccade-y';
const OWN_VARS = [VAR_AMBIENT, VAR_SACCADE_X, VAR_SACCADE_Y];

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

function normalizeMood(value) {
  return VALID_MOODS.includes(value) ? value : 'neutral';
}

function element(className) {
  const node = document.createElement('span');
  node.className = className;
  return node;
}

/**
 * @param {{root: HTMLElement, store: {getState: Function, subscribe: Function}, reducedMotion?: boolean}} options
 * @returns {{pause(): void, resume(): void, destroy(): void}}
 */
export function mountPresence({ root, store, reducedMotion = false } = {}) {
  if (!root) throw new Error('mountPresence: root element is required');
  if (!store) throw new Error('mountPresence: store is required');

  const faceBox = root.querySelector('.face-box');
  const motionToggle = document.getElementById('motion-toggle');

  let face = null;
  let phase = store.getState().phase;
  let mood = normalizeMood(PHASE_MOOD[phase] ?? 'neutral');
  let paused = false;
  let destroyed = false;
  let motionRunning = false;

  const timers = new Set();
  const darkMedia =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  let lastPointer = null;
  let lastPointerAt = 0;
  let eyeCenters = [];
  let measuredAt = 0;
  let ambientFrame = 0;

  root.classList.toggle('is-reduced-motion', Boolean(reducedMotion));
  root.classList.toggle('is-dormant', phase === 'dormant');
  root.dataset.phase = phase;

  function eyes() {
    return root.querySelectorAll('.eye');
  }

  function isDormant() {
    return root.classList.contains('is-dormant');
  }

  function motionAllowed() {
    return !destroyed && !paused && !reducedMotion;
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
        element('eye-wetline')
      );
    }

    if (pupil && !pupil.querySelector('.pupil-core')) {
      pupil.append(
        element('iris-fibers'),
        element('iris-sheen'),
        element('iris-limbus'),
        element('pupil-core')
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

  // ── Own timers (all cleared by pause/destroy) ────────────────────────────

  function after(ms, run) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      run();
    }, ms);
    timers.add(id);
    return id;
  }

  function stopTimers() {
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  }

  function setVariable(name, value) {
    root.style.setProperty(name, value);
  }

  function setBlinkPose(pose) {
    for (const eye of eyes()) {
      eye.classList.toggle('is-blinking', pose === 'close');
      eye.classList.toggle('is-reopening', pose === 'open');
    }
  }

  function clearBlinkPose() {
    setBlinkPose('none');
  }

  function blinkOnce() {
    if (!motionAllowed() || isDormant()) return;
    setBlinkPose('close');
    after(BLINK_CLOSE_MS + BLINK_HOLD_MS, () => {
      setBlinkPose('open');
      after(BLINK_OPEN_MS, () => {
        clearBlinkPose();
        if (Math.random() < DOUBLE_BLINK_CHANCE) {
          after(120 + Math.random() * 80, blinkOnce);
        }
      });
    });
  }

  function scheduleBlink() {
    if (!motionAllowed()) return;
    const longPause = Math.random() < 0.12;
    const wait = longPause ? 5600 + Math.random() * 3400 : 2400 + Math.random() * 3000;
    after(wait, () => {
      if (motionAllowed() && !isDormant()) blinkOnce();
      scheduleBlink();
    });
  }

  function scheduleSaccade() {
    if (!motionAllowed()) return;
    after(900 + Math.random() * 2300, () => {
      const pointerIdle = performance.now() - lastPointerAt > 700;
      if (motionAllowed() && !isDormant() && pointerIdle && Math.random() < 0.72) {
        const reach = Math.random() < 0.12 ? 1.15 : 0.65;
        setVariable(VAR_SACCADE_X, `${((Math.random() * 2 - 1) * reach).toFixed(2)}px`);
        setVariable(VAR_SACCADE_Y, `${((Math.random() * 2 - 1) * reach * 0.72).toFixed(2)}px`);
        after(80 + Math.random() * 70, () => {
          setVariable(VAR_SACCADE_X, '0px');
          setVariable(VAR_SACCADE_Y, '0px');
        });
      }
      scheduleSaccade();
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
    ambientFrame = window.requestAnimationFrame(applyAmbient);
  }

  function onPointerSample(event) {
    if (!motionAllowed()) return;
    lastPointer = { x: event.clientX, y: event.clientY };
    lastPointerAt = performance.now();
    queueAmbient();
  }

  function onPointerLeave() {
    lastPointer = null;
    restingAmbient();
  }

  function onWindowBlur() {
    lastPointer = null;
    restingAmbient();
  }

  function onResize() {
    eyeCenters = [];
    measuredAt = 0;
  }

  function onSchemeChange() {
    if (lastPointer && motionAllowed()) queueAmbient();
    else restingAmbient();
  }

  // ── Motion lifecycle ─────────────────────────────────────────────────────

  function startOwnMotion() {
    if (!motionAllowed() || motionRunning) return;
    motionRunning = true;

    window.addEventListener('mousemove', onPointerSample, { passive: true });
    window.addEventListener('pointerdown', onPointerSample, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('resize', onResize, { passive: true });
    if (darkMedia && typeof darkMedia.addEventListener === 'function') {
      darkMedia.addEventListener('change', onSchemeChange);
    }

    restingAmbient();
    scheduleBlink();
    scheduleSaccade();
  }

  function stopOwnMotion() {
    if (!motionRunning) return;
    motionRunning = false;

    stopTimers();
    clearBlinkPose();

    window.removeEventListener('mousemove', onPointerSample);
    window.removeEventListener('pointerdown', onPointerSample);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onWindowBlur);
    window.removeEventListener('resize', onResize);
    if (darkMedia && typeof darkMedia.removeEventListener === 'function') {
      darkMedia.removeEventListener('change', onSchemeChange);
    }

    if (ambientFrame) {
      window.cancelAnimationFrame(ambientFrame);
      ambientFrame = 0;
    }

    setVariable(VAR_SACCADE_X, '0px');
    setVariable(VAR_SACCADE_Y, '0px');
  }

  // ── Mood / phase ─────────────────────────────────────────────────────────

  // Direct class application: used while paused, when reduced motion is on,
  // or when the face instance has been torn down.
  function applyMoodClasses(value) {
    const next = normalizeMood(value);
    for (const eye of eyes()) {
      for (const candidate of VALID_MOODS) eye.classList.remove(candidate);
      if (next !== 'neutral') eye.classList.add(next);
    }
  }

  function applyMood(value) {
    mood = normalizeMood(value);
    if (face) face.setMood(mood);
    else applyMoodClasses(mood);
  }

  function applyPhase(next) {
    phase = next;
    root.dataset.phase = phase;
    const dormant = phase === 'dormant';
    root.classList.toggle('is-dormant', dormant);
    // While dormant the lids are closed by CSS; keep the mood neutral so no
    // residual mood classes fight the closed-lid rule.
    applyMood(dormant ? 'neutral' : (PHASE_MOOD[phase] ?? 'neutral'));
  }

  function syncToggle() {
    if (!motionToggle) return;
    motionToggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
    motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
  }

  // Held gaze target from the gaze bridge below. While set, the vendor's own
  // mouse/random look calls are ignored so caret/idle/ack targets win.
  let gazeHold = null;

  function startFace() {
    if (destroyed || reducedMotion || paused || face || !faceBox) return;
    face = new EyeFace();
    face.init(faceBox);
    const vendorLook = face.updateEyePosition.bind(face);
    face.updateEyePosition = (x, y, fromGaze = false) => {
      if (gazeHold && !fromGaze) return;
      vendorLook(x, y);
    };
    // The vendor blink is symmetric (150 ms down and up) and would fight the
    // asymmetric, occasionally doubled blink that our own timers drive.
    face.blink = () => {};
    face.setMood(mood);
  }

  function stopFace({ restore = true } = {}) {
    if (!face) return;
    // Tears down timers, mousemove listener and event-bus subscriptions.
    // EyeFace.destroy() also clears its mood classes, so restore the pose
    // directly to keep the eyes visually unchanged while paused.
    face.destroy();
    face = null;
    if (restore) applyMoodClasses(mood);
  }

  function pause() {
    if (destroyed || paused) return;
    paused = true;
    root.classList.add('is-motion-paused');
    stopOwnMotion();
    stopFace();
    syncToggle();
  }

  function resume() {
    if (destroyed || !paused) return;
    paused = false;
    root.classList.remove('is-motion-paused');
    startFace();
    if (face) face.setMood(mood);
    else applyMoodClasses(mood);
    startOwnMotion();
    syncToggle();
  }

  function onToggle() {
    if (paused) resume();
    else pause();
  }

  // ── Wiring ───────────────────────────────────────────────────────────────

  decorate();

  if (motionToggle) {
    motionToggle.addEventListener('click', onToggle);
  }
  syncToggle();

  // reducedMotion: never init the face — only static mood classes.
  if (reducedMotion) applyMoodClasses(mood);
  else {
    startFace();
    startOwnMotion();
  }

  const unsubscribe = store.subscribe((state) => {
    if (!destroyed) applyPhase(state.phase);
  });

  // ── Gaze bridge (integrator) ─────────────────────────────────────────────
  // Other modules (caret gaze, idle waiting, interrupt ack) send
  // 'agentfaehig:gaze' { x, y, source } or { source: 'release' }. While a
  // target is held, the pupils look there and the vendor's idle wandering is
  // kept quiet; on release the mouse takes over again.
  function onGaze(event) {
    const detail = event.detail || {};
    if (detail.source === 'release') {
      gazeHold = null;
      return;
    }
    if (typeof detail.x !== 'number' || typeof detail.y !== 'number') return;
    gazeHold = { x: detail.x, y: detail.y };
    if (face && !paused && !isDormant()) {
      face.updateEyePosition(detail.x, detail.y, true);
    }
  }
  document.addEventListener('agentfaehig:gaze', onGaze);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    document.removeEventListener('agentfaehig:gaze', onGaze);
    unsubscribe();
    stopOwnMotion();
    stopFace({ restore: false });
    removeDecoration();
    for (const eye of eyes()) {
      for (const candidate of VALID_MOODS) eye.classList.remove(candidate);
      eye.classList.remove('is-blinking', 'is-reopening');
    }
    for (const name of OWN_VARS) root.style.removeProperty(name);
    if (motionToggle) motionToggle.removeEventListener('click', onToggle);
    root.classList.remove('is-motion-paused', 'is-reduced-motion', 'is-dormant');
    delete root.dataset.phase;
  }

  return { pause, resume, destroy };
}
