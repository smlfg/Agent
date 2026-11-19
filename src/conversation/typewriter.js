// Typewriter for the current answer: character-by-character by default, with a
// gentle "tick, tick, tick" cadence and readable pauses at punctuation.
//
// Patterns and provenance (inspiration only, no third-party code copied and
// nothing downloaded):
// - Character cadence, seeded jitter and punctuation pauses follow the
//   approach popularised by tameemsafi/typewriter-effect (MIT).
// - The block caret that blinks only while the typist pauses is the standard
//   CSS steps() technique (see src/styles/typewriter.css).
// - typed.js and TypeIt are GPL-3.0 and were deliberately not used.
//
// Determinism: the default random source is a PRNG seeded from the text, so the
// same text always yields the same rhythm and the tests stay stable. Callers can
// inject `random` (a function returning 0..1) to override it.

const CLAUSE_PAUSE_MS = 140;
const SENTENCE_PAUSE_MS = 320;
const LINE_PAUSE_MS = 320;
const PAUSE_THRESHOLD_MS = 100;

// Interrupt finish: a short sentence remainder is typed out at roughly four
// times the normal cadence, but never for longer than the cap.
export const INTERRUPT_MAX_CHARS = 40;
export const INTERRUPT_MAX_MS = 500;
const INTERRUPT_SPEED_FACTOR = 4;
const ELLIPSIS = '…';

// Jitter factor: 0.72 .. 1.28 of the base delay, i.e. 30 ms becomes 22..38 ms.
const JITTER_MIN = 0.72;
const JITTER_SPAN = 0.56;

const CLAUSE_END = new Set([',', ';', ':', '—', '–']);
const SENTENCE_END = new Set(['.', '!', '?', '…', '。', '！', '？']);
const CLOSERS = new Set(['"', "'", '”', '’', ')', ']', '}', '»']);

// xmur3-style string hash + mulberry32 PRNG.
// mulberry32 is a widely circulated public-domain (CC0) generator by Tommy
// Ettinger; the string hash is the public xmur3 snippet. Pattern only.
function hashSeed(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeededRandom(text) {
  return mulberry32(hashSeed(text));
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

// Split by grapheme where the platform supports it, so emoji and combining
// marks are typed as one unit; fall back to code points.
function splitGraphemes(text) {
  const Segmenter = typeof Intl !== 'undefined' ? Intl.Segmenter : undefined;
  if (typeof Segmenter === 'function') {
    const segmenter = new Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

// Word mode keeps the original behaviour: words plus their trailing whitespace,
// so visible whitespace is preserved exactly.
function splitIntoChunks(text) {
  const tokens = text.split(/(\s+)/).filter((token) => token !== '');
  const chunks = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/^\s+$/.test(token)) {
      // Leading whitespace with no word yet keeps its own step.
      chunks.push(token);
      continue;
    }
    let chunk = token;
    const next = tokens[i + 1];
    if (next !== undefined && /^\s+$/.test(next)) {
      chunk += next;
      i++;
    }
    chunks.push(chunk);
  }
  return chunks;
}

function isLineBreak(unit) {
  return /[\n\r\u2028\u2029]/.test(unit);
}

function isWhitespaceUnit(unit) {
  return /^\s+$/.test(unit);
}

function clampIndex(value, total) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= total) return total;
  return n;
}

/**
 * The running sentence starts at `fromIndex` and ends at the next sentence
 * mark (. ! ? … and their full-width forms) or at the next line end.
 * Closing quotes/brackets after the mark still belong to the sentence.
 * The returned `end` is an exclusive unit index; `restChars` counts the units
 * that would still have to be typed.
 */
export function findSentenceRest(units, fromIndex = 0) {
  const list = Array.isArray(units) ? units : Array.from(units ?? []);
  const total = list.length;
  const start = clampIndex(fromIndex, total);
  let end = total;

  for (let i = start; i < total; i++) {
    const unit = list[i];
    if (isLineBreak(unit)) {
      end = i;
      break;
    }
    if (SENTENCE_END.has(unit)) {
      end = i + 1;
      while (end < total && (SENTENCE_END.has(list[end]) || CLOSERS.has(list[end]))) {
        end += 1;
      }
      break;
    }
  }

  return { start, end, restChars: end - start };
}

/**
 * End of the word that contains the current typing position (exclusive unit
 * index). Whitespace and line ends count as word boundaries.
 */
export function findWordEnd(units, fromIndex = 0) {
  const list = Array.isArray(units) ? units : Array.from(units ?? []);
  const total = list.length;
  let end = clampIndex(fromIndex, total);
  while (end < total && !isWhitespaceUnit(list[end]) && !isLineBreak(list[end])) {
    end += 1;
  }
  return end;
}

function fastDelay(steps, baseDelayMs, maxMs) {
  if (steps <= 0) return 0;
  const fastBase = Math.max(1, Math.round((Number(baseDelayMs) || 30) / INTERRUPT_SPEED_FACTOR));
  const cap = Number(maxMs);
  if (!Number.isFinite(cap) || cap <= 0) return 0;
  return Math.max(1, Math.min(fastBase, Math.floor(cap / steps) || 1));
}

/**
 * Pure decision for an interrupted answer:
 * - if the current sentence has at most `maxChars` left, finish that sentence
 *   (`result: 'finished'`);
 * - otherwise finish only the current word and append an ellipsis
 *   (`result: 'cut'`).
 * Both paths type at ~4x cadence and stay within `maxMs`.
 */
export function planFinishSentence({
  units,
  index = 0,
  maxChars = INTERRUPT_MAX_CHARS,
  maxMs = INTERRUPT_MAX_MS,
  baseDelayMs = 30,
} = {}) {
  const list = Array.isArray(units) ? units : Array.from(units ?? []);
  const from = clampIndex(index, list.length);
  const limitChars = Math.max(0, Math.floor(Number(maxChars) || 0));
  const capMs = Math.max(0, Number(maxMs) || 0);
  const rest = findSentenceRest(list, from);

  if (rest.restChars <= limitChars) {
    const steps = rest.restChars;
    const delayMs = fastDelay(steps, baseDelayMs, capMs);
    return {
      result: 'finished',
      appendEllipsis: false,
      fromIndex: from,
      endIndex: rest.end,
      steps,
      delayMs,
      totalMs: steps * delayMs,
      tail: list.slice(from, rest.end).join(''),
    };
  }

  const endIndex = findWordEnd(list, from);
  const steps = endIndex - from;
  const delayMs = fastDelay(steps, baseDelayMs, capMs);
  // A cut right after a finished sentence ("I hear you. |") needs no "…".
  const visible = list.slice(0, endIndex).join('').trimEnd();
  const endsSentence = visible.length > 0 && SENTENCE_END.has(visible.at(-1));
  return {
    result: 'cut',
    appendEllipsis: !endsSentence,
    fromIndex: from,
    endIndex,
    steps,
    delayMs,
    totalMs: steps * delayMs,
    tail: `${list.slice(from, endIndex).join('')}${endsSentence ? '' : ELLIPSIS}`,
  };
}

/**
 * @param {object} options
 * @param {string} options.text
 * @param {'char' | 'word'} [options.unit]
 * @param {number} [options.charDelayMs]
 * @param {number} [options.wordDelayMs]
 * @param {boolean} [options.reducedMotion]
 * @param {(fn: Function, ms: number) => any} [options.schedule]
 * @param {(id: any) => void} [options.cancel]
 * @param {() => number} [options.random]
 * @param {(visible: string, meta: {state: 'typing' | 'pausing' | 'done', delayMs: number, index: number, total: number, unit: 'char' | 'word'}) => void} [options.onUpdate]
 * @param {() => void} [options.onDone]
 * @returns {{start: () => void, stop: () => void, finishSentence: (options?: {maxChars?: number, maxMs?: number}) => Promise<'finished' | 'cut'>}}
 */
export function createTypewriter({
  text,
  unit = 'char',
  charDelayMs = 30,
  wordDelayMs = 45,
  reducedMotion = false,
  schedule = (fn, ms) => setTimeout(fn, ms),
  cancel = (id) => clearTimeout(id),
  random,
  onUpdate,
  onDone,
} = {}) {
  const full = String(text ?? '');
  const charMode = unit !== 'word';
  const units = charMode ? splitGraphemes(full) : splitIntoChunks(full);
  const total = units.length;
  const unitName = charMode ? 'char' : 'word';

  const jitterRandom = typeof random === 'function' ? random : createSeededRandom(full);

  let started = false;
  let stopped = false;
  let finished = false;
  let index = 0;
  let timerId = null;
  let finishPromise = null;
  let finishSettle = null;

  function finish() {
    if (finished) return;
    finished = true;
    if (onDone) onDone();
  }

  function emit(visible, meta) {
    if (onUpdate) onUpdate(visible, meta);
  }

  function baseDelay() {
    const factor = JITTER_MIN + clamp01(jitterRandom()) * JITTER_SPAN;
    return Math.max(1, Math.round(charDelayMs * factor));
  }

  function delayAfter(position) {
    if (!charMode) return wordDelayMs;

    const current = units[position] ?? '';
    const previous = units[position - 1] ?? '';
    const next = units[position + 1] ?? '';

    if (isLineBreak(current)) return LINE_PAUSE_MS;

    // Closing quotes/brackets and runs like "..." belong to the same pause:
    // wait for the last mark instead of pausing several times in a row.
    if (CLOSERS.has(current)) {
      if (SENTENCE_END.has(previous)) return SENTENCE_PAUSE_MS;
      if (CLAUSE_END.has(previous)) return CLAUSE_PAUSE_MS;
    }

    if (SENTENCE_END.has(current)) {
      const defer = SENTENCE_END.has(next) || CLOSERS.has(next);
      return defer ? baseDelay() : SENTENCE_PAUSE_MS;
    }
    if (CLAUSE_END.has(current)) {
      return CLOSERS.has(next) ? baseDelay() : CLAUSE_PAUSE_MS;
    }

    return baseDelay();
  }

  function step() {
    timerId = null;
    if (stopped) return;

    index += 1;
    const visible = units.slice(0, index).join('');

    if (index >= total) {
      emit(visible, { state: 'done', delayMs: 0, index, total, unit: unitName });
      finish();
      return;
    }

    const delay = delayAfter(index - 1);
    emit(visible, {
      state: delay >= PAUSE_THRESHOLD_MS ? 'pausing' : 'typing',
      delayMs: delay,
      index,
      total,
      unit: unitName,
    });
    timerId = schedule(step, delay);
  }

  function start() {
    if (started || stopped) return;
    started = true;

    if (reducedMotion || total === 0) {
      emit(full, { state: 'done', delayMs: 0, index: total, total, unit: unitName });
      finish();
      return;
    }

    timerId = schedule(step, charMode ? baseDelay() : wordDelayMs);
  }

  function settleFinish(result) {
    if (!finishSettle) return;
    const settle = finishSettle;
    finishSettle = null;
    settle(result);
  }

  // Interrupt path: stop at a clean sentence boundary. A short remainder is
  // typed out quickly; a long one is cut after the current word with an
  // ellipsis. Resolves with which branch ran. Deliberately does not call
  // onDone: the caller decides how the interrupted pair leaves the surface.
  function finishSentence({ maxChars = INTERRUPT_MAX_CHARS, maxMs = INTERRUPT_MAX_MS } = {}) {
    if (finishPromise) return finishPromise;
    if (finished) return Promise.resolve('finished');
    if (stopped) return Promise.resolve('cut');

    const plan = planFinishSentence({
      units,
      index,
      maxChars,
      maxMs,
      baseDelayMs: charMode ? charDelayMs : wordDelayMs,
    });

    if (timerId !== null) {
      cancel(timerId);
      timerId = null;
    }

    if (reducedMotion || plan.steps === 0) {
      index = plan.endIndex;
      const visible = units.slice(0, plan.fromIndex).join('') + plan.tail;
      emit(visible, { state: 'done', delayMs: 0, index, total, unit: unitName });
      finished = true;
      finishPromise = Promise.resolve(plan.result);
      return finishPromise;
    }

    finishPromise = new Promise((resolve) => {
      finishSettle = resolve;
      let typed = 0;

      function stepFast() {
        timerId = null;
        if (stopped) {
          finished = true;
          settleFinish('cut');
          return;
        }

        typed += 1;
        index += 1;

        if (typed >= plan.steps) {
          const visible = units.slice(0, plan.fromIndex).join('') + plan.tail;
          emit(visible, { state: 'done', delayMs: 0, index, total, unit: unitName });
          finished = true;
          settleFinish(plan.result);
          return;
        }

        const visible = units.slice(0, index).join('');
        emit(visible, {
          state: 'typing',
          delayMs: plan.delayMs,
          index,
          total,
          unit: unitName,
        });
        timerId = schedule(stepFast, plan.delayMs);
      }

      timerId = schedule(stepFast, plan.delayMs);
    });

    return finishPromise;
  }

  function stop() {
    stopped = true;
    if (timerId !== null) {
      cancel(timerId);
      timerId = null;
    }
    if (finishSettle) {
      finished = true;
      settleFinish('cut');
    }
  }

  return { start, stop, finishSentence };
}
