// Presence / gaze — the composer caret as a gaze target for the eyes.
//
// Caret-pixel measurement adapts the mirror-element pattern from
// component/textarea-caret-position (Copyright (c) 2015 Jonathan Ong,
// MIT License), https://github.com/component/textarea-caret-position
// No code is vendored; the documented technique is re-implemented here for a
// single-line <input> that scrolls horizontally (scrollLeft is subtracted).
//
// Emits `agentfaehig:gaze` on document with detail {x, y, source, intensity},
// or detail {source: 'release'} after blur / 1.5 s without typing. Wiring the
// event to the pupils and mounting happens in src/main.js (integrator).

export const EVENT_NAME = 'agentfaehig:gaze';
export const CARET_SOURCE = 'caret';
export const RELEASE_SOURCE = 'release';

// Time constants (ms) — exported so tests and the integrator stay in sync.
export const RELEASE_AFTER_MS = 1500;
export const PAUSE_AFTER_MS = 360;
export const REDUCED_MOTION_INTERVAL_MS = 1000;
export const SPEED_DECAY_MS = 700;

// Typing-speed model (characters per second, exponential smoothing).
export const SPEED_SMOOTHING = 0.4;
export const SPEED_MAX_CHARS_PER_SECOND = 20;

// Anticipatory lead ahead of the caret in writing direction.
export const LEAD_MIN_PX = 2;
export const LEAD_MAX_PX = 30;
export const LEAD_PER_SPEED_PX = 1.5;

// Small glances away from the caret.
export const BACKSPACE_LOOKBACK_PX = 14;
export const PAUSE_LOOKBACK_PX = 16;

// Periodic overview jump to the beginning once enough words exist.
export const OVERVIEW_WORD_THRESHOLD = 8;
export const OVERVIEW_INTERVAL_MS = 2600;
export const OVERVIEW_HOLD_MS = 280;
export const OVERVIEW_LOOKBACK_PX = 160;

// Intensity ramp (0..1) fed to the eyes; already at 1 at this word count.
export const INTENSITY_FULL_WORDS = 24;

// Smoothing and emission budget for the rAF loop.
export const GAZE_SMOOTH_MS = 110;
export const EMIT_EPSILON_PX = 0.5;
export const EMIT_MIN_INTERVAL_MS = 28;

const ZERO_WIDTH = '\u200b';

const MIRROR_PROPERTIES = Object.freeze([
  'direction',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSizeAdjust',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textIndent',
  'textTransform',
  'textAlign',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderRightStyle',
  'borderBottomStyle',
  'borderLeftStyle',
  'tabSize',
]);

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

/** Count words in the composer text; whitespace-only input counts as zero. */
export function countWords(text) {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

function findWordStart(text, index) {
  let i = clamp(index, 0, text.length);
  while (i > 0 && !/\s/.test(text[i - 1])) i -= 1;
  return i;
}

/**
 * Pure gaze planner: no DOM, no clock, deterministic for equal arguments.
 *
 * state:  { now, lastInputAt, startedAt, speed, direction, focused,
 *           reducedMotion, words, length }
 * input:  { x, y, startX?, middleX?, wordStartX?, text? } — caret geometry in
 *         client coordinates.
 *
 * Returns { x, y, intensity, source, mode }. source is 'caret' or 'release';
 * mode is 'follow' | 'pause' | 'backspace' | 'overview' | 'steady' | 'release'.
 */
export function planGaze(state = {}, input = {}) {
  const nowMs = finiteOr(state.now, 0);
  const caretX = finiteOr(input.x, 0);
  const caretY = finiteOr(input.y, 0);
  const text = typeof input.text === 'string' ? input.text : '';
  const words = finiteOr(state.words, countWords(text));
  const intensity = clamp(words / INTENSITY_FULL_WORDS, 0, 1);
  const lastInputAt = finiteOr(state.lastInputAt, nowMs);
  const sinceInput = Math.max(0, nowMs - lastInputAt);
  const focused = state.focused !== false;

  // Eyes may return to the mouse after blur or a real pause in typing.
  if (!focused || sinceInput >= RELEASE_AFTER_MS) {
    return { x: caretX, y: caretY, intensity, source: RELEASE_SOURCE, mode: 'release' };
  }

  // Reduced motion: static positions only, no lead, no lookbacks, no overview.
  if (state.reducedMotion === true) {
    return { x: caretX, y: caretY, intensity, source: CARET_SOURCE, mode: 'steady' };
  }

  // Pause while still engaged: glance back towards the middle of what was
  // written and "read along" until either typing resumes or gaze releases.
  if (sinceInput >= PAUSE_AFTER_MS) {
    const anchor = finiteOr(
      input.middleX,
      finiteOr(input.wordStartX, caretX - PAUSE_LOOKBACK_PX),
    );
    return { x: anchor, y: caretY, intensity, source: CARET_SOURCE, mode: 'pause' };
  }

  // Backspace: a small glance to the left, just behind the caret.
  if (state.direction === -1) {
    return {
      x: caretX - BACKSPACE_LOOKBACK_PX,
      y: caretY,
      intensity,
      source: CARET_SOURCE,
      mode: 'backspace',
    };
  }

  // Overview: with enough text, occasionally jump back to the beginning.
  // Deterministic because it only depends on the provided clock values.
  const startedAt = finiteOr(state.startedAt, lastInputAt);
  const elapsed = Math.max(0, nowMs - startedAt);
  const cycles = Math.floor(elapsed / OVERVIEW_INTERVAL_MS);
  const cyclePosition = elapsed % OVERVIEW_INTERVAL_MS;
  if (
    words >= OVERVIEW_WORD_THRESHOLD
    && cycles >= 1
    && cyclePosition < OVERVIEW_HOLD_MS
  ) {
    const startX = finiteOr(
      input.startX,
      Math.max(0, caretX - OVERVIEW_LOOKBACK_PX),
    );
    return { x: startX, y: caretY, intensity, source: CARET_SOURCE, mode: 'overview' };
  }

  // Follow: lead ahead in writing direction, proportional to typing speed.
  const speed = clamp(finiteOr(state.speed, 0), 0, SPEED_MAX_CHARS_PER_SECOND);
  const lead = clamp(
    LEAD_MIN_PX + speed * LEAD_PER_SPEED_PX,
    LEAD_MIN_PX,
    LEAD_MAX_PX,
  );
  return {
    x: caretX + lead,
    y: caretY,
    intensity,
    source: CARET_SOURCE,
    mode: 'follow',
  };
}

/**
 * Mount caret gaze on the composer input.
 *
 * @param {{input: HTMLInputElement, reducedMotion?: boolean, now?: () => number}} options
 * @returns {{destroy(): void}}
 */
export function mountGaze({ input, reducedMotion = false, now = () => performance.now() } = {}) {
  if (!input) throw new Error('mountGaze: input element is required');

  const doc = input.ownerDocument ?? globalThis.document;
  const win = doc.defaultView ?? globalThis;
  const CustomEventCtor = win.CustomEvent ?? globalThis.CustomEvent;
  const raf = typeof win.requestAnimationFrame === 'function'
    ? win.requestAnimationFrame.bind(win)
    : (callback) => win.setTimeout(() => callback(now()), 16);
  const caf = typeof win.cancelAnimationFrame === 'function'
    ? win.cancelAnimationFrame.bind(win)
    : win.clearTimeout.bind(win);

  // One mirror for the lifetime of the mount; only its text is rewritten.
  const mirror = doc.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');
  mirror.style.position = 'fixed';
  mirror.style.top = '0';
  mirror.style.left = '0';
  mirror.style.margin = '0';
  mirror.style.visibility = 'hidden';
  mirror.style.pointerEvents = 'none';
  mirror.style.whiteSpace = 'pre';
  mirror.style.overflow = 'visible';
  mirror.style.zIndex = '-1';

  const startSpan = doc.createElement('span');
  const wordSpan = doc.createElement('span');
  const caretSpan = doc.createElement('span');
  for (const span of [startSpan, wordSpan, caretSpan]) {
    span.textContent = ZERO_WIDTH;
  }
  mirror.append(startSpan, wordSpan, caretSpan);
  doc.body.append(mirror);

  function syncMirrorStyles() {
    const computed = win.getComputedStyle(input);
    for (const property of MIRROR_PROPERTIES) {
      mirror.style[property] = computed[property];
    }
    mirror.style.position = 'fixed';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.margin = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.pointerEvents = 'none';
    mirror.style.whiteSpace = 'pre';
    mirror.style.overflow = 'visible';
  }

  // Measures the caret and the two anchor points (text start, word start) in
  // client coordinates. Reuses the single mirror element.
  function readGeometry() {
    const value = input.value ?? '';
    const caret = clamp(input.selectionStart ?? value.length, 0, value.length);
    const wordIndex = findWordStart(value, caret);

    syncMirrorStyles();
    mirror.replaceChildren(
      startSpan,
      doc.createTextNode(value.slice(0, wordIndex)),
      wordSpan,
      doc.createTextNode(value.slice(wordIndex, caret)),
      caretSpan,
    );

    const inputRect = input.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    const scrollLeft = input.scrollLeft || 0;
    const startRect = startSpan.getBoundingClientRect();
    const wordRect = wordSpan.getBoundingClientRect();
    const caretRect = caretSpan.getBoundingClientRect();

    const toClientX = (rect) => inputRect.left + (rect.left - mirrorRect.left) - scrollLeft;
    const x = toClientX(caretRect);
    const startX = toClientX(startRect);

    return {
      x,
      y: inputRect.top + inputRect.height / 2,
      startX,
      middleX: (startX + x) / 2,
      wordStartX: toClientX(wordRect),
      caret,
      length: value.length,
      words: countWords(value),
    };
  }

  let destroyed = false;
  let focused = doc.activeElement === input;
  let lastInputAt = now();
  let startedAt = lastInputAt;
  let speed = 0;
  let lastKeyAt = -Infinity;
  let direction = 1;
  let lastValue = input.value ?? '';
  let measurePending = true;

  let geometry = readGeometry();
  let currentX = geometry.x;
  let currentY = geometry.y;
  let lastFrameAt = now();
  let frameId = null;

  let lastEmittedX = NaN;
  let lastEmittedY = NaN;
  let lastEmitAt = -Infinity;
  let lastEmittedSource = null;

  function dispatch(detail) {
    doc.dispatchEvent(new CustomEventCtor(EVENT_NAME, { detail }));
  }

  function emitCaret(x, y, intensity, at) {
    lastEmittedX = x;
    lastEmittedY = y;
    lastEmitAt = at;
    lastEmittedSource = CARET_SOURCE;
    dispatch({ x, y, source: CARET_SOURCE, intensity });
  }

  function emitRelease() {
    lastEmittedSource = RELEASE_SOURCE;
    lastEmitAt = now();
    dispatch({ source: RELEASE_SOURCE });
  }

  function onInput() {
    const nowMs = now();
    const value = input.value ?? '';
    if (value.length > lastValue.length) direction = 1;
    else if (value.length < lastValue.length) direction = -1;
    if (lastValue.length === 0 && value.length > 0) startedAt = nowMs;
    if (value.length === 0) startedAt = nowMs;
    lastValue = value;
    lastInputAt = nowMs;
    measurePending = true;
  }

  function onKeyDown(event) {
    const nowMs = now();
    if (event.key === 'Backspace' || event.key === 'Delete') direction = -1;
    else if (event.key.length === 1) direction = 1;

    const typed = event.key.length === 1
      || event.key === 'Backspace'
      || event.key === 'Enter';
    if (!typed || event.repeat) return;

    const dt = nowMs - lastKeyAt;
    if (dt > 0 && dt < SPEED_DECAY_MS) {
      const instant = clamp(1000 / dt, 0, SPEED_MAX_CHARS_PER_SECOND);
      speed = SPEED_SMOOTHING * instant + (1 - SPEED_SMOOTHING) * speed;
    } else {
      speed = 0;
    }
    lastKeyAt = nowMs;
  }

  function onFocus() {
    focused = true;
    lastInputAt = now();
    startedAt = now();
    measurePending = true;
  }

  function onBlur() {
    focused = false;
    if (lastEmittedSource === CARET_SOURCE) emitRelease();
  }

  function onSelectionChange() {
    if (doc.activeElement === input) measurePending = true;
  }

  function onScroll() {
    measurePending = true;
  }

  function tick() {
    if (destroyed) return;
    const nowMs = now();
    const dt = clamp(nowMs - lastFrameAt, 1, 64);
    lastFrameAt = nowMs;

    if (measurePending) {
      geometry = readGeometry();
      measurePending = false;
    }

    if (speed > 0 && nowMs - lastKeyAt > SPEED_DECAY_MS) {
      speed *= Math.exp(-dt / SPEED_DECAY_MS);
      if (speed < 0.05) speed = 0;
    }

    const plan = planGaze({
      now: nowMs,
      lastInputAt,
      startedAt,
      speed,
      direction,
      focused,
      reducedMotion,
      words: geometry.words,
      length: geometry.length,
    }, {
      x: geometry.x,
      y: geometry.y,
      startX: geometry.startX,
      middleX: geometry.middleX,
      wordStartX: geometry.wordStartX,
    });

    if (plan.source === RELEASE_SOURCE) {
      if (lastEmittedSource === CARET_SOURCE) emitRelease();
    } else if (reducedMotion) {
      // Static caret positions only, at most once a second.
      const reengaged = lastEmittedSource !== CARET_SOURCE;
      if (reengaged || nowMs - lastEmitAt >= REDUCED_MOTION_INTERVAL_MS) {
        emitCaret(plan.x, plan.y, plan.intensity, nowMs);
      }
    } else {
      const blend = 1 - Math.exp(-dt / GAZE_SMOOTH_MS);
      currentX += (plan.x - currentX) * blend;
      currentY += (plan.y - currentY) * blend;
      const moved = Number.isFinite(lastEmittedX)
        ? Math.hypot(currentX - lastEmittedX, currentY - lastEmittedY)
        : Infinity;
      const due = moved >= EMIT_EPSILON_PX && nowMs - lastEmitAt >= EMIT_MIN_INTERVAL_MS;
      if (due || lastEmittedSource !== CARET_SOURCE) {
        emitCaret(currentX, currentY, plan.intensity, nowMs);
      }
    }

    frameId = raf(tick);
  }

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);
  input.addEventListener('focus', onFocus);
  input.addEventListener('blur', onBlur);
  input.addEventListener('scroll', onScroll, { passive: true });
  doc.addEventListener('selectionchange', onSelectionChange);

  frameId = raf(tick);

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frameId !== null) caf(frameId);
      input.removeEventListener('input', onInput);
      input.removeEventListener('keydown', onKeyDown);
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('scroll', onScroll);
      doc.removeEventListener('selectionchange', onSelectionChange);
      mirror.remove();
    },
  };
}
