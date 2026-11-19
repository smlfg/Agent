// Presence (M1 contract, section A) — owns the eye face and the motion toggle.
// Plain ES module. Uses the unmodified standalone EyeFace from vendor.

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

function normalizeMood(value) {
  return VALID_MOODS.includes(value) ? value : 'neutral';
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

  root.classList.toggle('is-reduced-motion', Boolean(reducedMotion));
  root.classList.toggle('is-dormant', phase === 'dormant');
  root.dataset.phase = phase;

  function eyes() {
    return root.querySelectorAll('.eye');
  }

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

  function startFace() {
    if (destroyed || reducedMotion || paused || face || !faceBox) return;
    face = new EyeFace();
    face.init(faceBox);
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
    if (destroyed) return;
    paused = true;
    root.classList.add('is-motion-paused');
    stopFace();
    syncToggle();
  }

  function resume() {
    if (destroyed) return;
    paused = false;
    root.classList.remove('is-motion-paused');
    startFace();
    if (face) face.setMood(mood);
    else applyMoodClasses(mood);
    syncToggle();
  }

  function onToggle() {
    if (paused) resume();
    else pause();
  }

  if (motionToggle) {
    motionToggle.addEventListener('click', onToggle);
  }
  syncToggle();

  // reducedMotion: never init the face — only static mood classes.
  if (reducedMotion) applyMoodClasses(mood);
  else startFace();

  const unsubscribe = store.subscribe((state) => {
    if (!destroyed) applyPhase(state.phase);
  });

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    unsubscribe();
    stopFace({ restore: false });
    for (const eye of eyes()) {
      for (const candidate of VALID_MOODS) eye.classList.remove(candidate);
    }
    if (motionToggle) motionToggle.removeEventListener('click', onToggle);
    root.classList.remove('is-motion-paused', 'is-reduced-motion', 'is-dormant');
    delete root.dataset.phase;
  }

  return { pause, resume, destroy };
}
