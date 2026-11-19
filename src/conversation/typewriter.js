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
 * @returns {{start: () => void, stop: () => void}}
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

  function stop() {
    stopped = true;
    if (timerId !== null) {
      cancel(timerId);
      timerId = null;
    }
  }

  return { start, stop };
}
