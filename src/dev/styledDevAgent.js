// DEVELOPMENT DATA — not a real agent. Deterministic canned answers whose
// shape is driven by the 12 surface parameters, so the written-language steering
// can be experienced before any model is connected. Every answer is built from
// fixed English blocks; no network, no randomness, same prompt + same params =>
// same answer. Never presented as live: dev is always true.

import { deriveStyle } from '../agent/style.js';

const WARM_OPENERS = Object.freeze([
  'I hear you.',
  'No rush.',
  'I am here.',
  'Take your time.',
]);

const COOL_OPENERS = Object.freeze([
  'Noted.',
  'Understood.',
  'Right.',
]);

const NEUTRAL_OPENERS = Object.freeze([
  'Okay.',
  'All right.',
  'Right.',
]);

const FORMAL_OPENERS = Object.freeze([
  'Very well.',
  'I see.',
  'Understood.',
]);

const CORES = Object.freeze({
  short: {
    casual: [
      "I answer while you're here.",
      'No forms. Just this exchange.',
      'This page talks back, briefly.',
      'You type, I answer, then it forgets.',
      'Nothing piles up behind you.',
    ],
    neutral: [
      'This page answers while you are here.',
      'Nothing is stored between visits.',
      'I answer, then the page forgets.',
      'Only this exchange is visible.',
      'The loop is simple: you write, I answer.',
    ],
    formal: [
      'I answer only while this conversation is open.',
      'The page retains nothing after the exchange.',
      'I address the question directly.',
      'Only the present exchange is visible.',
      'Each session begins without history.',
    ],
  },
  long: {
    casual: [
      "I answer while you're here, and the page changes with the conversation instead of asking you to set it.",
      "There's no form and no menu. You write something, I answer, and the page resets when you leave.",
      "I don't remember yesterday, so we start from where you actually are right now.",
      "Think of it as a page that talks back, keeps only the last exchange, and stops when you do.",
      'You talk, I answer, and nothing accumulates behind you while you think.',
    ],
    neutral: [
      'I answer while you are here, and the surface shifts with the conversation rather than asking you to configure it.',
      'There is no form and no menu. You write something, I answer, and the page resets when you leave.',
      'I do not remember yesterday, so each conversation begins from the place you are in now.',
      'It is a page that answers, keeps only the current exchange visible, and stops when you do.',
      'You write, I answer, and nothing accumulates behind you while you think.',
    ],
    formal: [
      'I answer only while this conversation is open, and the surface adjusts to the exchange rather than requesting configuration.',
      'There is no form to complete. You write a message, I reply, and the page resets when you leave.',
      'I retain nothing from previous visits, so each conversation begins without prior context.',
      'This is a page that responds and keeps only the current exchange in view.',
      'You write, I answer, and no history accumulates behind the visible pair.',
    ],
  },
});

const ELABORATIONS = Object.freeze({
  casual: [
    'If it helps, the whole point is to keep the exchange small enough to stay honest.',
    "You can interrupt me; a half-finished thought doesn't get held against you.",
    "The page keeps changing because the conversation does, not because it wants attention.",
    "Ask something concrete and I'll stay with it instead of drifting.",
    'There is no hidden backlog, only the exchange you can see.',
  ],
  neutral: [
    'If it helps, the point is to keep the exchange small enough to stay honest.',
    'You can interrupt; a half-finished thought is not held against you.',
    'The page shifts because the conversation does, not to demand attention.',
    'Ask something concrete and I will stay with it instead of drifting.',
    'There is no hidden backlog, only the exchange you can see.',
  ],
  formal: [
    'The purpose is to keep the exchange small enough to remain honest.',
    'You may interrupt; an unfinished sentence is not held against you.',
    'The surface changes because the conversation does, not to demand attention.',
    'A concrete question will receive a concrete answer.',
    'There is no hidden backlog, only the exchange currently in view.',
  ],
});

const QUESTIONS = Object.freeze({
  casual: [
    'What would you want to ask it first?',
    'What are you trying to find out?',
    'Which part matters most to you?',
  ],
  neutral: [
    'What would you like to ask first?',
    'What are you trying to find out?',
    'Which part matters most?',
  ],
  formal: [
    'What would you like to establish first?',
    'Which aspect is most relevant to your question?',
    'What would you like me to address directly?',
  ],
});

const FILLERS = Object.freeze({
  casual: [
    "That's the whole of it.",
    'Nothing more is needed for now.',
    'We can stay with that.',
    'The rest can wait.',
  ],
  neutral: [
    'That is the whole of it.',
    'Nothing more is needed for now.',
    'We can stay with that.',
    'The rest can wait.',
  ],
  formal: [
    'That is the whole of it.',
    'Nothing further is required for now.',
    'We can remain with that.',
    'The rest can wait.',
  ],
});

export function createStyledDevAgent({ getParams = () => ({}) } = {}) {
  function paramsNow() {
    try {
      return getParams() ?? {};
    } catch {
      return {};
    }
  }

  return {
    /**
     * @param {string} prompt
     * @param {{signal?: AbortSignal, delayMs?: number}} [opts]
     * @returns {Promise<{text: string, dev: true}>}
     */
    respond(prompt, { signal, delayMs } = {}) {
      const style = deriveStyle(paramsNow());
      const wait = Number.isFinite(delayMs)
        ? Math.max(0, Number(delayMs))
        : Math.round(clamp(700 - 400 * style.params.tempo, 250, 950));

      return new Promise((resolve, reject) => {
        const abort = () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          return error;
        };

        if (signal?.aborted) return reject(abort());

        const timer = setTimeout(
          () => resolve({ text: composeResponse(prompt, style), dev: true }),
          wait,
        );

        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(abort());
        }, { once: true });
      });
    },
  };
}

/** Exported for direct inspection; the agent itself calls this per turn. */
export function composeResponse(prompt, style) {
  const register = style.register;
  const seed = hash(`${String(prompt ?? '')}|${signature(style)}`);

  const maxWords = style.targetWords[1];
  const minWords = style.targetWords[0];
  const maxSentences = style.sentences[1];
  const minSentences = style.sentences[0];

  const shortCores = [...CORES.short[register]].sort((a, b) => wordCount(a) - wordCount(b));
  const shortestCore = shortCores[0];

  // A question is a permission, not an obligation. Ask only if it fits next to
  // the shortest possible core and there is a sentence left for it.
  let question = null;
  if (style.questionAllowed && maxSentences >= 2) {
    const feasible = QUESTIONS[register].filter(
      (candidate) => wordCount(candidate) + wordCount(shortestCore) <= maxWords,
    );
    if (feasible.length) question = feasible[seed % feasible.length];
  }

  const reservedWords = question ? wordCount(question) : 0;
  const reservedSentence = question ? 1 : 0;
  const budget = maxWords - reservedWords;

  const core = chooseCore(register, style, budget, maxSentences - reservedSentence, seed);
  const body = [];
  let words = 0;
  let sentencesUsed = 0;

  const canAdd = (sentence) => (
    sentencesUsed + sentenceCount(sentence) + reservedSentence <= maxSentences
    && words + wordCount(sentence) + reservedWords <= maxWords
  );
  const add = (sentence) => {
    body.push(sentence);
    words += wordCount(sentence);
    sentencesUsed += sentenceCount(sentence);
  };

  if (canAdd(core)) add(core);

  const opener = chooseOpener(style, seed);
  if (opener && canAdd(opener)) {
    body.unshift(opener);
    words += wordCount(opener);
    sentencesUsed += sentenceCount(opener);
  }

  if (style.params.depth >= 0.45 || style.params.density >= 0.6) {
    const elaboration = ELABORATIONS[register][seed % ELABORATIONS[register].length];
    if (canAdd(elaboration)) add(elaboration);
  }

  const fillers = FILLERS[register];
  for (let i = 0; (words < minWords || sentencesUsed < minSentences) && i < fillers.length * 2; i++) {
    const filler = fillers[(seed + i) % fillers.length];
    if (!canAdd(filler)) break;
    add(filler);
  }

  if (question) body.push(question);

  return body.join(' ');
}

function chooseCore(register, style, budget, sentenceBudget, seed) {
  const shortList = CORES.short[register];
  const longList = CORES.long[register];
  const wantsLong = style.params.tempo <= 0.55
    && sentenceBudget >= 2
    && style.vocabulary.level !== 'plain';

  if (wantsLong) {
    const long = longList[seed % longList.length];
    if (wordCount(long) <= budget && sentenceCount(long) <= sentenceBudget) return long;
  }

  const fitting = shortList.filter((core) => wordCount(core) <= budget);
  if (fitting.length) return fitting[seed % fitting.length];

  return [...shortList].sort((a, b) => wordCount(a) - wordCount(b))[0];
}

function chooseOpener(style, seed) {
  if (style.warmthMarkers.level >= 2) return WARM_OPENERS[seed % WARM_OPENERS.length];
  if (style.register === 'formal') return FORMAL_OPENERS[seed % FORMAL_OPENERS.length];
  if (style.warmthMarkers.level === 0) return COOL_OPENERS[seed % COOL_OPENERS.length];
  return NEUTRAL_OPENERS[seed % NEUTRAL_OPENERS.length];
}

function signature(style) {
  return [
    style.register,
    style.targetWords.join('-'),
    style.sentences.join('-'),
    style.questionAllowed ? 1 : 0,
    style.warmthMarkers.level,
    style.hedging.level,
    style.vocabulary.level,
    style.rhythm,
    style.mirror.level,
  ].join('|');
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function wordCount(text) {
  return String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text) {
  const matches = String(text ?? '').match(/[.!?](?=\s|$)/g);
  return matches ? matches.length : 1;
}

function clamp(value, lo, hi) {
  const n = Number(value);
  if (!Number.isFinite(n)) return lo;
  return n < lo ? lo : n > hi ? hi : n;
}
