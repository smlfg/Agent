// Presence / idle — the waiting behaviour of the eyes.
//
// Owner decision 2: the eyes should read as *waiting* — expectant, attentive,
// inviting, so the visitor does something. Never sleepy, never insistent.
//
// Rules (see docs/wireframes/02-components.md, C-02):
// - No forced eye contact: glances are brief and always return to the visitor.
// - Meaning never lives in the eyes alone: this module only nudges attention;
//   the composer and copy carry the actual invitation.
// - WCAG 2.2.2: motion can be paused, and prefers-reduced-motion leaves only a
//   static, calm state.
// - The agent never speaks first. This module only looks; it never writes.
//
// The eyes are not steered here directly. Every look is sent through the
// existing gaze protocol:
//   document.dispatchEvent(new CustomEvent('agentfaehig:gaze',
//     { detail: { x, y, source: 'idle', intensity } }))
//   document.dispatchEvent(new CustomEvent('agentfaehig:gaze',
//     { detail: { source: 'release' } }))
// src/presence/presence.js owns the pupils and consumes those events; the
// integrator mounts this module from src/main.js.

export const EVENT_NAME = 'agentfaehig:gaze';
export const IDLE_SOURCE = 'idle';
export const RELEASE_SOURCE = 'release';

// Waiting stages (ms of uninterrupted idle time).
export const STAGE1_MS = 8000;   // first expectant glance to the composer
export const STAGE2_MS = 25000;  // a little more often, with a short linger
export const STAGE3_MS = 60000;  // rare, soft "still there?" impulse

// Decision cadence per stage (ms between planning instants).
export const CALM_STEP_MS = 2500;
export const STAGE1_INTERVAL_MIN_MS = 7000;
export const STAGE1_INTERVAL_MAX_MS = 11000;
export const STAGE1_GLANCE_CHANCE = 0.5;
export const STAGE2_INTERVAL_MIN_MS = 5000;
export const STAGE2_INTERVAL_MAX_MS = 8000;
export const STAGE2_GLANCE_CHANCE = 0.65;

// "Nachfrage" impulses: at most one per 20–30 s, never speeding up.
export const IMPULSE_MIN_INTERVAL_MS = 22000;
export const IMPULSE_JITTER_MS = 7000;

// Shortest possible step, so a plan can never spin the timer.
export const MIN_PLAN_MS = 500;

// Resolved behaviour inside one planned moment (the pure plan only names the
// intent; the browser side in mountIdle turns it into timed eye motion).
export const GLANCE_HOLD_MS = 1200;
export const LINGER_HOLD_MS = 1800;
export const ASK_WIDEN_MS = 400;

// After any input the eyes are fully present again, then calm down quietly.
export const QUIET_AFTER_MS = 1400;
export const RESET_EMIT_INTERVAL_MS = 200;

export const VALID_ACTIONS = Object.freeze(['visitor', 'glance', 'linger', 'ask']);

// Deterministic PRNG (mulberry32). Injected into planIdle so tests are stable.
export function createRng(seed = 0x1d1e) {
  let a = (Number(seed) || 0) >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stageFor(elapsedMs) {
  const t = Math.max(0, Number(elapsedMs) || 0);
  if (t >= STAGE3_MS) return 3;
  if (t >= STAGE2_MS) return 2;
  if (t >= STAGE1_MS) return 1;
  return 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pure idle planner. Called once per decision moment with the current page
 * `now` and a seeded rng. Returns the stage, the next intent, and how long
 * until the next decision. Impulse spacing is encoded in `nextInMs`, so the
 * caller cannot make the eyes ask more often than every 20 s.
 *
 * @param {number} elapsedMs ms since idle began / was last reset
 * @param {() => number} [rng] deterministic [0,1) source
 * @returns {{stage: number, action: string, nextInMs: number}}
 */
export function planIdle(elapsedMs, rng = createRng()) {
  const t = Math.max(0, Number(elapsedMs) || 0);
  const stage = stageFor(t);
  const roll = rng();

  if (stage === 0) {
    return {
      stage,
      action: 'visitor',
      nextInMs: clamp(STAGE1_MS - t, MIN_PLAN_MS, CALM_STEP_MS),
    };
  }

  if (stage === 1) {
    const action = roll < STAGE1_GLANCE_CHANCE ? 'glance' : 'visitor';
    return {
      stage,
      action,
      nextInMs: STAGE1_INTERVAL_MIN_MS + rng() * (STAGE1_INTERVAL_MAX_MS - STAGE1_INTERVAL_MIN_MS),
    };
  }

  if (stage === 2) {
    const action = roll < STAGE2_GLANCE_CHANCE ? 'linger' : 'visitor';
    return {
      stage,
      action,
      nextInMs: STAGE2_INTERVAL_MIN_MS + rng() * (STAGE2_INTERVAL_MAX_MS - STAGE2_INTERVAL_MIN_MS),
    };
  }

  return {
    stage,
    action: 'ask',
    nextInMs: IMPULSE_MIN_INTERVAL_MS + rng() * IMPULSE_JITTER_MS,
  };
}

// ── Browser side ──────────────────────────────────────────────────────────

const CSS_ID = 'agentfaehig-idle-css';
const CSS_HREF = new URL('../styles/idle.css', import.meta.url).href;
const WAITING_CLASSES = ['is-waiting-1', 'is-waiting-2', 'is-waiting-3'];

function ensureStylesheet(doc) {
  if (!doc || doc.getElementById(CSS_ID)) return;
  const link = doc.createElement('link');
  link.id = CSS_ID;
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  doc.head.appendChild(link);
}

/**
 * Mount the waiting behaviour on #presence.
 *
 * @param {{
 *   store: {getState: Function, subscribe: Function},
 *   root: HTMLElement,
 *   composer: HTMLElement,
 *   reducedMotion?: boolean,
 *   now?: () => number,
 * }} options
 * @returns {{destroy: () => void}}
 */
export function mountIdle({ store, root, composer, reducedMotion = false, now = Date.now } = {}) {
  if (!root || !store || typeof document === 'undefined') return { destroy() {} };

  ensureStylesheet(document);

  const rng = createRng((now() ^ 0x9e3779b9) >>> 0);
  const timers = new Set();
  let active = false;
  let startedAt = 0;
  let lastResetAt = -Infinity;
  let pausedPrev = false;
  let disposed = false;

  const motionAllowed = () =>
    !reducedMotion &&
    !root.classList.contains('is-motion-paused') &&
    !root.classList.contains('is-reduced-motion');

  function emit(detail) {
    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  }

  function visitorPoint() {
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    // Screen centre, a touch below the eyes: straight ahead, not into them.
    return { x: w / 2, y: h * 0.56 };
  }

  function composerPoint() {
    if (composer && typeof composer.getBoundingClientRect === 'function') {
      const box = composer.getBoundingClientRect();
      if (box.width > 0 || box.height > 0) {
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      }
    }
    const { x, y } = visitorPoint();
    return { x, y: y + 40 };
  }

  function lookVisitor(intensity = 0.5) {
    const { x, y } = visitorPoint();
    emit({ x, y, source: IDLE_SOURCE, intensity });
  }

  function lookComposer(intensity = 0.8) {
    const { x, y } = composerPoint();
    emit({ x, y, source: IDLE_SOURCE, intensity });
  }

  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function later(ms, fn) {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!disposed) fn();
    }, Math.max(0, ms));
    timers.add(id);
    return id;
  }

  function setWaiting(stage) {
    for (const name of WAITING_CLASSES) root.classList.remove(name);
    if (stage >= 1) root.classList.add(`is-waiting-${Math.min(stage, 3)}`);
  }

  function clearTransient() {
    root.classList.remove('is-asking');
  }

  function runGlance() {
    lookComposer(0.7);
    later(GLANCE_HOLD_MS, () => {
      if (active && motionAllowed()) lookVisitor(0.5);
    });
  }

  function runLinger() {
    lookComposer(0.85);
    later(LINGER_HOLD_MS, () => {
      if (active && motionAllowed()) lookVisitor(0.5);
    });
  }

  function runAsk() {
    if (!motionAllowed()) return;
    root.classList.add('is-asking');
    lookComposer(1);
    later(ASK_WIDEN_MS, () => {
      root.classList.remove('is-asking');
      if (active && motionAllowed()) lookVisitor(0.6);
    });
  }

  function schedule(ms) {
    later(Math.max(MIN_PLAN_MS, ms), step);
  }

  function step() {
    if (disposed || !active) return;
    if (!motionAllowed()) {
      applyStatic();
      return;
    }
    const plan = planIdle(now() - startedAt, rng);
    setWaiting(plan.stage);
    if (plan.action === 'glance') runGlance();
    else if (plan.action === 'linger') runLinger();
    else if (plan.action === 'ask') runAsk();
    else lookVisitor(plan.stage === 0 ? 0.45 : 0.55);
    schedule(plan.nextInMs);
  }

  function applyStatic() {
    clearTimers();
    setWaiting(1);
    lookComposer(0.35);
  }

  function activate() {
    if (active || disposed) return;
    active = true;
    startedAt = now();
    pausedPrev = !motionAllowed();
    clearTransient();
    if (motionAllowed()) step();
    else applyStatic();
  }

  function deactivate() {
    if (!active) return;
    active = false;
    clearTimers();
    setWaiting(0);
    clearTransient();
    emit({ source: RELEASE_SOURCE });
  }

  // Any input, pointer movement, focus or submit resets the wait at once:
  // the eyes are fully present again, then settle back into waiting.
  function noteActivity() {
    if (disposed) return;
    const t = now();
    startedAt = t;
    if (!active) return;
    clearTimers();
    clearTransient();
    setWaiting(0);
    if (t - lastResetAt >= RESET_EMIT_INTERVAL_MS) {
      lastResetAt = t;
      emit({ source: RELEASE_SOURCE });
      if (motionAllowed()) {
        lookVisitor(1);
        schedule(QUIET_AFTER_MS);
      } else {
        applyStatic();
      }
    } else {
      schedule(QUIET_AFTER_MS);
    }
  }

  const onMotionChange = () => {
    if (!active || disposed) return;
    const paused = !motionAllowed();
    if (paused === pausedPrev) return;
    pausedPrev = paused;
    if (paused) {
      applyStatic();
    } else {
      clearTimers();
      setWaiting(0);
      startedAt = now();
      step();
    }
  };

  const observer = new MutationObserver(onMotionChange);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });

  const activityEvents = ['input', 'keydown', 'pointerdown', 'pointermove', 'mousemove', 'focusin', 'submit'];
  for (const name of activityEvents) {
    document.addEventListener(name, noteActivity, { capture: true, passive: true });
  }

  const unsubscribe = store.subscribe((state) => {
    if (state.phase === 'idle') activate();
    else deactivate();
  });

  if (store.getState().phase === 'idle') activate();

  return {
    destroy() {
      if (disposed) return;
      disposed = true;
      deactivate();
      unsubscribe();
      observer.disconnect();
      for (const name of activityEvents) {
        document.removeEventListener(name, noteActivity, { capture: true });
      }
    },
  };
}
