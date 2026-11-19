// Dissolve (Agent M): the leaving pair evaporates upward like smoke.
//
// No third-party code was copied. The per-glyph stagger follows the widely
// documented "split text + stagger" pattern (anime.js splitText/stagger, MIT;
// Codrops text demos, MIT). The smoke vocabulary (per-glyph upward drift, blur
// and fade) is a common CSS demo idiom (MDN feTurbulence examples, CC0 code
// samples; CodeFronts smoke demo, MIT). SVG feTurbulence displacement was
// considered and rejected: filtering the whole leaving layer re-rasterises it
// on every frame and misses the 60 fps budget on mobile. Animating only
// transform, opacity and a short per-glyph blur stays cheap; very long answers
// fall back to word or block granularity so the node count cannot explode.
//
// Public surface:
//   dissolve(entry, { reducedMotion }) -> Promise<void>
// Pure helpers exported for tests:
//   splitGraphemes, tokenizeDissolveText, countGlyphs, countWords,
//   planDissolve, createDissolveGroup

const DURATION_MIN_MS = 700;
const DURATION_MAX_MS = 1400;
const GLYPH_BASE_MS = 780;
const WORD_BASE_MS = 820;
const BLOCK_MS = 900;
const STAGGER_BUDGET_MS = 480;
const GLYPH_MAX = 240;
const WORD_MAX = 1200;
const GLYPH_STAGGER_MAX_MS = 16;
const WORD_STAGGER_MAX_MS = 30;

const activeGroup = createDissolveGroup();
const pending = new WeakMap();

// Split by grapheme where the platform supports it, so emoji and combining
// marks dissolve as one unit; fall back to code points.
export function splitGraphemes(text) {
  const source = String(text ?? '');
  const Segmenter = typeof Intl !== 'undefined' ? Intl.Segmenter : undefined;
  if (typeof Segmenter === 'function') {
    const segmenter = new Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(source), (part) => part.segment);
  }
  return Array.from(source);
}

// Words carry their glyphs; whitespace is kept as plain text tokens so the
// leaving copy keeps its spacing and line widths as far as possible.
export function tokenizeDissolveText(text) {
  const tokens = [];
  for (const part of String(text ?? '').split(/(\s+)/)) {
    if (part === '') continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ type: 'space', text: part });
    } else {
      tokens.push({ type: 'word', text: part, glyphs: splitGraphemes(part) });
    }
  }
  return tokens;
}

export function countGlyphs(tokens) {
  let total = 0;
  for (const token of tokens) {
    if (token.type === 'word') total += token.glyphs.length;
  }
  return total;
}

export function countWords(tokens) {
  let total = 0;
  for (const token of tokens) {
    if (token.type === 'word') total += 1;
  }
  return total;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Pure timing/granularity decision, so the reduced-motion and budget rules can
// be tested without a DOM.
export function planDissolve({ reducedMotion = false, glyphCount = 0, wordCount = 0 } = {}) {
  const glyphs = Math.max(0, Math.floor(Number(glyphCount) || 0));
  const words = Math.max(0, Math.floor(Number(wordCount) || 0));

  if (reducedMotion) {
    return {
      animated: false,
      granularity: 'block',
      durationMs: 0,
      staggerMs: 0,
      totalMs: 0,
      glyphCount: glyphs,
      nodeCount: 0,
    };
  }

  let granularity = 'glyph';
  if (glyphs > WORD_MAX) granularity = 'block';
  else if (glyphs > GLYPH_MAX) granularity = 'word';

  if (granularity === 'block') {
    return {
      animated: true,
      granularity,
      durationMs: BLOCK_MS,
      staggerMs: 0,
      totalMs: BLOCK_MS,
      glyphCount: glyphs,
      nodeCount: 1,
    };
  }

  const nodes = granularity === 'glyph' ? glyphs : words;
  const nodeCount = Math.max(0, nodes);
  const base = granularity === 'glyph' ? GLYPH_BASE_MS : WORD_BASE_MS;
  const staggerMax = granularity === 'glyph' ? GLYPH_STAGGER_MAX_MS : WORD_STAGGER_MAX_MS;
  const staggerMs = nodeCount > 1
    ? Math.max(1, Math.min(staggerMax, Math.floor(STAGGER_BUDGET_MS / (nodeCount - 1))))
    : 0;

  const spread = staggerMs * Math.max(0, nodeCount - 1);
  const totalMs = clamp(base + spread, DURATION_MIN_MS, DURATION_MAX_MS);
  const durationMs = Math.max(320, totalMs - spread);

  return {
    animated: true,
    granularity,
    durationMs,
    staggerMs,
    totalMs,
    glyphCount: glyphs,
    nodeCount,
  };
}

// A tiny DOM-free group so overlapping dismissals cannot stack: starting a new
// dissolve finishes every older one first, which removes its element and
// resolves its promise immediately.
export function createDissolveGroup() {
  const active = new Set();

  function start(onFinish) {
    for (const finish of [...active]) finish();

    let done = false;
    const finish = () => {
      if (done) return false;
      done = true;
      active.delete(finish);
      if (typeof onFinish === 'function') onFinish();
      return true;
    };

    active.add(finish);
    return finish;
  }

  return {
    start,
    get size() {
      return active.size;
    },
    finishAll() {
      for (const finish of [...active]) finish();
    },
  };
}

function seededNoise(seed) {
  return (index) => {
    const value = Math.sin((index + 1) * 12.9898 + seed) * 43758.5453;
    return value - Math.floor(value);
  };
}

function splitElement(element, tokens, granularity) {
  const fragment = document.createDocumentFragment();
  const spans = [];

  for (const token of tokens) {
    if (token.type === 'space') {
      fragment.append(document.createTextNode(token.text));
      continue;
    }

    if (granularity === 'word') {
      const span = document.createElement('span');
      span.className = 'dissolve-token';
      span.textContent = token.text;
      fragment.append(span);
      spans.push(span);
      continue;
    }

    const word = document.createElement('span');
    word.className = 'dissolve-word';
    for (const glyph of token.glyphs) {
      const span = document.createElement('span');
      span.className = 'dissolve-glyph';
      span.textContent = glyph;
      word.append(span);
      spans.push(span);
    }
    fragment.append(word);
  }

  element.replaceChildren(fragment);
  return spans;
}

function animateSpan(span, index, plan, noise) {
  const rise = 18 + noise(index) * 26;
  const drift = (noise(index + 911) - 0.5) * 18;
  const spin = (noise(index + 1777) - 0.5) * 8;
  const scale = 1 + noise(index + 2411) * 0.12;
  const blur = 3 + noise(index + 2903) * 4;
  const midRise = rise * 0.35;
  const midDrift = drift * 0.6;

  return span.animate(
    [
      {
        offset: 0,
        opacity: 1,
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
        filter: 'blur(0px)',
      },
      {
        offset: 0.35,
        opacity: 0.92,
        transform: `translate3d(${midDrift.toFixed(2)}px, ${(-midRise).toFixed(2)}px, 0) rotate(${(spin * 0.5).toFixed(2)}deg) scale(${(1 + (scale - 1) * 0.5).toFixed(3)})`,
        filter: `blur(${(blur * 0.4).toFixed(2)}px)`,
      },
      {
        offset: 1,
        opacity: 0,
        transform: `translate3d(${drift.toFixed(2)}px, ${(-rise).toFixed(2)}px, 0) rotate(${spin.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
        filter: `blur(${blur.toFixed(2)}px)`,
      },
    ],
    {
      duration: plan.durationMs,
      delay: index * plan.staggerMs,
      easing: 'cubic-bezier(0.3, 0.05, 0.72, 0.2)',
      fill: 'both',
    },
  );
}

function animateBlock(element, plan) {
  return element.animate(
    [
      { offset: 0, opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0px)' },
      { offset: 1, opacity: 0, transform: 'translate3d(0, -26px, 0)', filter: 'blur(6px)' },
    ],
    {
      duration: plan.durationMs,
      easing: 'cubic-bezier(0.3, 0.05, 0.72, 0.2)',
      fill: 'both',
    },
  );
}

/**
 * Dissolve a leaving pair and remove it from the DOM.
 * @param {HTMLElement} entry
 * @param {{ reducedMotion?: boolean }} [options]
 * @returns {Promise<void>} resolves once the element is removed
 */
export function dissolve(entry, { reducedMotion = false } = {}) {
  if (!entry || !entry.isConnected) return Promise.resolve();

  const running = pending.get(entry);
  if (running) return running;

  let animations = [];
  let timer = null;
  let settle;
  const promise = new Promise((resolve) => {
    settle = resolve;
  });
  pending.set(entry, promise);

  const finish = activeGroup.start(() => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    for (const animation of animations) {
      try {
        animation.cancel();
      } catch {
        // A finished animation may already be detached; nothing to clean up.
      }
    }
    animations = [];
    if (entry.parentNode) entry.parentNode.removeChild(entry);
    if (pending.get(entry) === promise) pending.delete(entry);
    settle();
  });

  const textElements = Array.from(entry.querySelectorAll('.pair-prompt, .pair-answer'));
  const tokenLists = textElements.map((element) => tokenizeDissolveText(element.textContent));
  let glyphCount = 0;
  let wordCount = 0;
  for (const tokens of tokenLists) {
    glyphCount += countGlyphs(tokens);
    wordCount += countWords(tokens);
  }

  const plan = planDissolve({ reducedMotion, glyphCount, wordCount });

  // The live region already carries the answer; the leaving copy must not be
  // announced twice.
  entry.setAttribute('aria-hidden', 'true');

  if (!plan.animated) {
    finish();
    return promise;
  }

  entry.classList.add('is-dissolving');

  const seed = glyphCount + wordCount * 7;
  const noise = seededNoise(seed);

  if (plan.granularity === 'block') {
    for (const element of textElements) {
      if (!element.textContent) continue;
      animations.push(animateBlock(element, plan));
    }
  } else {
    let index = 0;
    for (let i = 0; i < textElements.length; i++) {
      const spans = splitElement(textElements[i], tokenLists[i], plan.granularity);
      for (const span of spans) {
        animations.push(animateSpan(span, index, plan, noise));
        index += 1;
      }
    }
  }

  if (animations.length === 0) {
    finish();
    return promise;
  }

  Promise.all(
    animations.map((animation) => animation.finished.then(
      () => undefined,
      () => undefined,
    )),
  ).then(finish);

  // Safety net if the Web Animations API never reports finished.
  timer = setTimeout(finish, plan.totalMs + 40);

  return promise;
}
