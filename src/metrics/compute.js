// Layer 1: turn text and typing events -> normalized metrics (0..1).
// Metrics that need no NLP library are computed here. The affect set is also
// computed locally: AFINN-111 (Apache-2.0) plus own seed lists stand in for the
// sentiment/vader packages, so no dependency is installed.

import { AFINN, AFINN_MAX, AFINN_MIN } from './lexicons/afinn.js';
import {
  BOOSTERS,
  EMOJI_SCORES,
  EMOTICON_SCORES,
  FEELING_WORDS,
  HEDGE_PHRASES,
  IMPERATIVE_VERBS,
  INTENSIFIERS,
  NEGATORS,
  POLITENESS_PHRASES,
  SECOND_PERSON,
  SENTENCE_FILLERS,
} from './lexicons/affect.js';

export const AFFECT_METRIC_IDS = Object.freeze([
  'sentiment_valence',
  'sentiment_balance',
  'arousal_vader',
  'self_disclosure',
  'hedges',
  'boosters',
  'politeness_markers',
  'imperative_mood',
  'negation_ratio',
  'second_person_ratio',
]);

const EMOTICON_PATTERN = /[:;=8][-']?[)(dDpPoO/\\|*]/g;
const FIRST_PERSON_SINGULAR = new Set(['i', 'me', 'my', 'mine', 'myself', "i'm", 'im', 'ive']);

const clamp = (value, lo = 0, hi = 1) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return lo;
  return n < lo ? lo : n > hi ? hi : n;
};

const clamp01 = (value) => clamp(value, 0, 1);

const HEDGES = [
  'maybe', 'perhaps', 'possibly', 'probably', 'kind of', 'sort of', 'i think',
  'i guess', 'seems', 'seem', 'apparently', 'might', 'could be', 'not sure',
  'sorta', 'kinda', 'presumably', 'suppose',
];

const JOY = new Set([
  'happy', 'love', 'great', 'glad', 'excited', 'thanks', 'thank', 'wonderful',
  'nice', 'good', 'enjoy', 'fun', 'awesome', 'grateful', 'delighted', 'pleased',
  'smile', 'laugh', 'hope', 'beautiful', 'amazing', 'lovely', 'joy', 'yay',
  'perfect', 'brilliant', 'sweet', 'excellent',
]);

const ANGER = new Set([
  'angry', 'hate', 'awful', 'ridiculous', 'furious', 'mad', 'annoyed',
  'terrible', 'stupid', 'dumb', 'disgusting', 'rage', 'irritated', 'unfair',
  'garbage', 'useless', 'worst', 'sick', 'fed', 'pathetic',
]);

const FEAR = new Set([
  'afraid', 'worried', 'scary', 'anxious', 'nervous', 'fear', 'terrified',
  'panic', 'dread', 'concerned', 'uneasy', 'stressed', 'frightened',
  'uncertain', 'risky', 'danger', 'dangerous', 'scared',
]);

const SADNESS = new Set([
  'sad', 'lonely', 'tired', 'lost', 'sorry', 'unhappy', 'depressed',
  'miserable', 'hopeless', 'grief', 'cry', 'hurt', 'disappointed', 'exhausted',
  'alone', 'empty', 'broken', 'weary',
]);

const SURPRISE = new Set([
  'wow', 'whoa', 'unexpected', 'surprise', 'surprising', 'unbelievable',
  'incredible', 'gosh', 'omg', 'seriously', 'astonishing', 'shocking',
]);

const GRATITUDE = ['thanks', 'thank you', 'thank', 'appreciate', 'grateful', 'thankful', 'cheers'];

const APOLOGY = ['sorry', 'apologies', 'apology', 'my mistake', 'excuse me', 'my bad', 'forgive'];

const HUMOR = [
  'haha', 'hah', 'lol', 'lmao', 'heh', 'joke', 'joking', 'kidding', 'funny',
  'irony', 'sarcasm', 'sarcastic', ':)', ':-)', '😄', '😊', '😉', '😂',
];

const CURIOSITY = [
  'what if', 'wonder', 'explore', 'imagine', 'curious', 'idea', 'experiment',
  'try', 'how', 'why', 'what', 'suppose',
];

const POLITENESS = ['please', 'thanks', 'thank you', 'sorry', 'excuse me'];
const ABORT = ['stop', 'wait', 'never mind', 'nevermind', 'forget it', 'cancel', 'abort'];
const CONFIRM = /^(?:yes|yeah|yep|ok|okay|right|sure|got it|alright|fine|true|correct)\b/i;
const BACKCHANNEL = /^(?:hm+|mm+|ah+|i see|ok then|right then)\b/i;

const CONTENT_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'so', 'of', 'to', 'in',
  'on', 'at', 'for', 'with', 'about', 'from', 'by', 'as', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did', 'have', 'has',
  'had', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that',
  'these', 'those', 'what', 'which', 'who', 'whom', 'how', 'why', 'when',
  'where', 'not', 'no', 'yes', 'can', 'could', 'would', 'should', 'will',
  'just', 'very', 'really', 'there', 'here', 'also', 'than', 'too', 'more',
  'most', 'some', 'any', 'all', 'one', 'like', 'get', 'got', 'make', 'made',
]);

const BARE_CONTRACTIONS = new Set([
  'dont', 'cant', 'wont', 'isnt', 'arent', 'wasnt', 'werent', 'didnt',
  'doesnt', 'havent', 'hasnt', 'hadnt', 'couldnt', 'wouldnt', 'shouldnt',
  'im', 'ive', 'ill', "i'm", 'youre', 'youve', 'youll', 'theyre', 'theyve',
  'weve', 'thats', 'whats', 'lets', 'gonna', 'wanna', 'gotta',
]);

const VAD_DOMINANCE = {
  can: 0.8, will: 0.75, want: 0.7, need: 0.6, decide: 0.85, choose: 0.8,
  control: 0.9, lead: 0.8, make: 0.7, build: 0.75, know: 0.75, sure: 0.85,
  confident: 0.9, able: 0.8, manage: 0.75, create: 0.75, must: 0.7,
  should: 0.6, allow: 0.65, let: 0.6, plan: 0.7, try: 0.55, help: 0.6,
  cannot: 0.15, cant: 0.1, helpless: 0.05, stuck: 0.15, forced: 0.2,
  powerless: 0.05, confused: 0.25, lost: 0.2, trapped: 0.1, weak: 0.2,
  unsure: 0.25, maybe: 0.4, might: 0.4, dont: 0.2, unable: 0.15, fail: 0.15,
  failing: 0.15, overwhelmed: 0.1, anxious: 0.2, afraid: 0.2,
};

const CONCRETENESS = {
  table: 4.8, chair: 4.9, cup: 4.9, hand: 4.7, door: 4.9, window: 4.8,
  street: 4.8, car: 4.9, book: 4.8, phone: 4.8, tree: 4.9, water: 4.8,
  food: 4.8, coffee: 4.8, walk: 4.2, run: 4.3, sit: 4.5, stand: 4.4,
  eat: 4.5, sleep: 4.3, touch: 4.2, see: 4.0, hear: 4.0, build: 4.0,
  make: 3.8, write: 4.2, read: 4.1, type: 4.2, draw: 4.3, open: 4.0,
  close: 4.0, hold: 4.2, move: 3.8, work: 3.9, play: 4.1, talk: 3.9,
  speak: 3.9, listen: 4.0, think: 2.5, idea: 2.0, concept: 1.5, meaning: 1.8,
  truth: 2.0, love: 2.2, fear: 2.4, hope: 2.2, time: 2.5, space: 2.4,
  system: 2.3, process: 2.2, pattern: 2.2, model: 2.4, agent: 2.0,
  interface: 2.2, website: 3.5, page: 4.2, conversation: 2.5, question: 2.8,
  answer: 2.7, problem: 2.5, solution: 2.3, change: 2.6, grow: 3.0,
  learn: 2.8, remember: 2.9, forget: 2.8, feel: 2.6, emotion: 1.8, mind: 2.0,
  body: 4.5, face: 4.6, eye: 4.7, voice: 3.8, word: 3.5, language: 2.6,
  story: 2.8, example: 2.9, number: 3.4, math: 2.5, data: 2.4, code: 3.2,
  light: 4.4, dark: 4.2, warm: 4.0, cold: 4.2, soft: 4.0, hard: 4.0,
  big: 3.8, small: 3.9, fast: 3.5, slow: 3.5, good: 2.5, bad: 2.6,
  new: 2.8, old: 3.2, real: 2.6, true: 2.4, false: 2.4, here: 3.0,
  there: 3.0, now: 2.8, then: 2.6, person: 4.5, people: 4.4,
};

const TECH_TERMS = new Set([
  'api', 'llm', 'model', 'data', 'algorithm', 'framework', 'javascript',
  'python', 'cloudflare', 'worker', 'workers', 'token', 'prompt', 'agent',
  'metrics', 'parameter', 'interface', 'sdk', 'json', 'css', 'html', 'git',
  'npm', 'deploy', 'latency', 'inference', 'server', 'browser', 'runtime',
  'regex', 'database', 'backend', 'frontend', 'typescript', 'node',
]);

const FIRST_PERSON = new Set(['i', 'me', 'my', 'mine', 'myself']);
const FEELING_VERBS = new Set([
  'feel', 'felt', 'think', 'believe', 'want', 'need', 'hope', 'worry',
  'love', 'hate', 'fear', 'wish', 'miss', 'enjoy',
]);

export function computeMetrics(text, turnInputs = {}, history = []) {
  const source = String(text ?? turnInputs?.prompt ?? '');
  const lower = source.toLowerCase();
  const words = tokensOf(source);
  const tokenCount = words.length;
  const sentences = splitSentences(source);
  const sentenceCount = sentences.length;

  const metrics = {};

  const emojiCount = countEmoji(source);
  metrics.emoji_ratio = clamp01(emojiCount / Math.max(1, sentenceCount * 2));

  const hedgeCount = HEDGES.reduce((sum, phrase) => sum + countPhrase(lower, phrase), 0);
  metrics.hedge_ratio = clamp01(hedgeCount / Math.max(1, tokenCount / 10));

  const contractions = countContractions(source);
  metrics.contraction_ratio = clamp01((contractions / Math.max(1, tokenCount)) / 0.2);

  metrics.dominance_vad = clamp01(seedMean(words, VAD_DOMINANCE, 0.5));
  metrics.joy_lexicon = clamp01(countSetHits(words, JOY) / Math.max(1, tokenCount));
  metrics.anger_lexicon = clamp01(countSetHits(words, ANGER) / Math.max(1, tokenCount));
  metrics.fear_lexicon = clamp01(countSetHits(words, FEAR) / Math.max(1, tokenCount));
  metrics.sadness_lexicon = clamp01(countSetHits(words, SADNESS) / Math.max(1, tokenCount));

  const surpriseCount = countSetHits(words, SURPRISE)
    + countPhrase(lower, '?!')
    + countPhrase(lower, '‽');
  metrics.surprise_markers = clamp01(1 - Math.exp(-surpriseCount / 2));

  const excl = countChar(source, '!');
  const ellipsis = (source.match(/…|\.\.\./g) ?? []).length;
  const caps = (source.match(/\b[A-Z]{2,}\b/g) ?? []).length;
  const affectCues = excl + ellipsis + caps;
  metrics.affect_punctuation = clamp01((affectCues / Math.max(1, tokenCount)) * 4);

  const gratitudeCount = GRATITUDE.reduce((sum, phrase) => sum + countPhrase(lower, phrase), 0);
  metrics.gratitude_markers = clamp01(1 - Math.exp(-gratitudeCount / 2));
  const apologyCount = APOLOGY.reduce((sum, phrase) => sum + countPhrase(lower, phrase), 0);
  metrics.apology_markers = clamp01(1 - Math.exp(-apologyCount / 2));
  const humorCount = HUMOR.reduce((sum, phrase) => sum + countPhrase(lower, phrase), 0);
  metrics.humor_irony = clamp01(1 - Math.exp(-humorCount / 2));

  metrics.concreteness = clamp01((seedMean(words, CONCRETENESS, 3) - 1) / 4);

  const meanSentenceLength = tokenCount / Math.max(1, sentenceCount);
  metrics.sentence_length = clamp01(sigmoid((meanSentenceLength - 18) / 8));

  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const ease = 206.835
    - 1.015 * (tokenCount / Math.max(1, sentenceCount))
    - 84.6 * (syllables / Math.max(1, tokenCount));
  metrics.readability_flesch = clamp01(1 - ease / 100);

  const acronyms = (source.match(/\b[A-Z]{2,6}\b/g) ?? []).length;
  const techHits = words.reduce((sum, word) => sum + (TECH_TERMS.has(word) ? 1 : 0), 0);
  metrics.jargon_acronym_density = clamp01(((acronyms + techHits) / Math.max(1, tokenCount)) * 20);

  const curiosityCount = CURIOSITY.reduce((sum, phrase) => sum + countPhrase(lower, phrase), 0);
  metrics.curiosity_words = clamp01(1 - Math.exp(-curiosityCount / 2));

  Object.assign(metrics, computeInteractionMetrics(source, turnInputs, history));
  Object.assign(metrics, computeAffectMetrics(source, lower, words, sentences));

  return metrics;
}

function computeAffectMetrics(source, lower, words, sentences) {
  const tokenCount = Math.max(1, words.length);
  const sentenceCount = Math.max(1, sentences.length);

  const emojiScores = emoticonAndEmojiScores(source);
  const tokenScores = [];
  for (let i = 0; i < words.length; i++) {
    const score = afinnTokenScore(words[i]);
    if (!score) continue;
    let negated = false;
    for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
      if (NEGATORS.has(words[j])) { negated = true; break; }
    }
    tokenScores.push(negated ? -score * 0.9 : score);
  }

  const scores = tokenScores.concat(emojiScores);
  const hits = scores.length;
  const sum = scores.reduce((total, score) => total + score, 0);
  const mean = hits ? sum / hits : 0;
  const confidence = hits / (hits + 1.5);
  const valence = mean * confidence;
  const positive = scores.filter((score) => score > 0).length;
  const negative = scores.filter((score) => score < 0).length;

  const exclamations = countChar(source, '!');
  const capsWords = (source.match(/\b[A-Z]{2,}\b/g) ?? []).length;
  const repeatedPunctuation = (source.match(/[!?]{2,}/g) ?? []).length;
  const elongations = (lower.match(/([a-z])\1{2,}/g) ?? []).length;
  const intensifiers = INTENSIFIERS.reduce(
    (total, phrase) => total + countPhrase(lower, phrase), 0,
  );
  const negations = words.reduce(
    (total, word) => total + (NEGATORS.has(word) || /n['’]t$/.test(word) ? 1 : 0), 0,
  );
  const intensityCue = exclamations * 0.7
    + capsWords * 0.5
    + repeatedPunctuation * 0.5
    + elongations * 0.4
    + intensifiers * 0.5
    + emojiScores.length * 0.4
    + negations * 0.2;

  let disclosureHits = 0;
  let imperativeHits = 0;
  for (const sentence of sentences) {
    const sentenceWords = tokensOf(sentence);
    if (sentenceWords.length === 0) continue;
    if (sentenceWords.some((word) => FIRST_PERSON_SINGULAR.has(word))
      && sentenceWords.some((word) => FEELING_WORDS.has(word))) {
      disclosureHits += 1;
    }
    let start = 0;
    while (start < sentenceWords.length && SENTENCE_FILLERS.has(sentenceWords[start])) start += 1;
    if (start < sentenceWords.length && IMPERATIVE_VERBS.has(sentenceWords[start])) {
      imperativeHits += 1;
    }
  }

  const hedgeCount = HEDGE_PHRASES.reduce(
    (total, phrase) => total + countPhrase(lower, phrase), 0,
  );
  const boosterCount = BOOSTERS.reduce(
    (total, phrase) => total + countPhrase(lower, phrase), 0,
  );
  const politenessCount = POLITENESS_PHRASES.reduce(
    (total, phrase) => total + countPhrase(lower, phrase), 0,
  );
  const secondPersonHits = words.reduce(
    (total, word) => total + (SECOND_PERSON.has(word) ? 1 : 0), 0,
  );

  return {
    sentiment_valence: clamp01((valence - AFINN_MIN) / (AFINN_MAX - AFINN_MIN)),
    sentiment_balance: clamp01(((positive - negative) / (positive + negative + 1) + 1) / 2),
    arousal_vader: clamp01(1 - Math.exp(-intensityCue / 2.2)),
    self_disclosure: clamp01(disclosureHits / sentenceCount),
    hedges: clamp01((hedgeCount / tokenCount) * 10),
    boosters: clamp01((boosterCount / tokenCount) * 10),
    politeness_markers: clamp01(1 - Math.exp(-politenessCount / 2)),
    imperative_mood: clamp01(imperativeHits / sentenceCount),
    negation_ratio: clamp01((negations / tokenCount) / 0.08),
    second_person_ratio: clamp01((secondPersonHits / tokenCount) / 0.1),
  };
}

function afinnTokenScore(word) {
  return Object.prototype.hasOwnProperty.call(AFINN, word) ? AFINN[word] : 0;
}

function emoticonAndEmojiScores(source) {
  const scores = [];
  const text = String(source);
  for (const match of text.match(EMOTICON_PATTERN) ?? []) {
    const key = match.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(EMOTICON_SCORES, key)) {
      scores.push(EMOTICON_SCORES[key]);
    }
  }
  let emojiMatches = [];
  try {
    emojiMatches = [...text.matchAll(/\p{Extended_Pictographic}\uFE0F?/gu)].map((m) => m[0]);
  } catch {
    emojiMatches = [];
  }
  for (const glyph of emojiMatches) {
    const bare = glyph.replace(/\uFE0F/g, '');
    const value = EMOJI_SCORES[glyph] ?? EMOJI_SCORES[bare];
    if (Number.isFinite(value)) scores.push(value);
  }
  return scores;
}

function computeInteractionMetrics(source, turnInputs, history) {
  const typing = turnInputs?.typing ?? {};
  const keys = Array.isArray(typing.keys) ? typing.keys : [];
  const keyTimes = keys
    .map((entry) => Number(Array.isArray(entry) ? entry[0] : entry?.at))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < keyTimes.length; i++) {
    const delta = keyTimes[i] - keyTimes[i - 1];
    if (delta >= 0) intervals.push(delta);
  }

  const printable = keyTimes.length;
  const backspaces = Number.isFinite(typing.backspaces) ? typing.backspaces : 0;
  const keydowns = Number.isFinite(typing.keydowns) ? typing.keydowns : printable + backspaces;

  const submitAt = Number.isFinite(turnInputs?.submitAt) ? turnInputs.submitAt : 0;
  const mountedAt = Number.isFinite(turnInputs?.mountedAt) ? turnInputs.mountedAt : 0;
  const firstKeyAt = Number.isFinite(turnInputs?.firstKeyAt) ? turnInputs.firstKeyAt : null;
  const lastKeyAt = Number.isFinite(turnInputs?.lastKeyAt) ? turnInputs.lastKeyAt : null;
  const responseEndAt = Number.isFinite(turnInputs?.responseEndAt) ? turnInputs.responseEndAt : null;
  const turnStart = responseEndAt !== null ? responseEndAt : mountedAt;

  const activeMs = intervals.reduce((sum, value) => sum + (value <= 5000 ? value : 0), 0);
  const speed = activeMs > 0 ? printable / (activeMs / 1000) : 0;

  const bursts = splitBursts(keyTimes, 1500);
  const burstSizes = bursts.map((burst) => burst.length);
  const fastIntervals = intervals.filter((value) => value <= 1500);
  const longPauses = intervals.filter((value) => value > 2000);

  const answers = [...history, turnInputs].filter(Boolean).slice(-10);
  const prompts = [...history, turnInputs]
    .filter(Boolean)
    .map((entry) => String(entry.prompt ?? ''))
    .slice(-10);

  const submitTimes = answers
    .map((entry) => Number(entry.submitAt))
    .filter((value) => Number.isFinite(value));
  const turnIntervals = [];
  for (let i = 1; i < submitTimes.length; i++) {
    const delta = submitTimes[i] - submitTimes[i - 1];
    if (delta >= 0) turnIntervals.push(delta);
  }

  const recentPrompts = prompts.map((prompt) => tokensOf(prompt));
  let duplicates = 0;
  for (let i = 1; i < recentPrompts.length; i++) {
    if (similarity(recentPrompts[i - 1], recentPrompts[i]) > 0.9) duplicates += 1;
  }

  const weightedQuestions = emaShare(prompts, (prompt) => prompt.includes('?'));
  const confirmationShare = shareMatches(prompts, (prompt) => {
    const count = tokensOf(prompt).length;
    return count > 0 && count <= 3 && CONFIRM.test(prompt.trim());
  });
  const backchannelShare = shareMatches(prompts, (prompt) => {
    const count = tokensOf(prompt).length;
    return count > 0 && count <= 4 && BACKCHANNEL.test(prompt.trim());
  });
  const abortShare = shareMatches(prompts, (prompt) =>
    ABORT.some((phrase) => countPhrase(prompt.toLowerCase(), phrase) > 0));

  const recentFive = prompts.slice(-5);
  const recentFiveWords = recentFive.reduce((sum, prompt) => sum + tokensOf(prompt).length, 0);
  const recentFiveSentences = recentFive.reduce((sum, prompt) => sum + splitSentences(prompt).length, 0);

  const recentTenText = prompts.join(' ');
  const recentTenWords = tokensOf(recentTenText).length;
  const recentTenChars = recentTenText.replace(/\s/g, '').length || 1;

  const previous = history.length ? history[history.length - 1] : null;
  const previousPrompt = previous ? String(previous.prompt ?? '') : '';
  const contentNow = contentWords(source);
  const contentBefore = contentWords(previousPrompt);
  const topicShift = previous ? 1 - jaccard(contentNow, contentBefore) : 0;

  const pointer = turnInputs?.pointer ?? {};
  const sessionMs = Math.max(1, submitAt - mountedAt);
  const pointerWindow = Math.max(1, sessionMs / 10000);
  const pointerSamples = Number.isFinite(pointer.samples) ? pointer.samples : 0;
  const pointerNear = Number.isFinite(pointer.nearPresence) ? pointer.nearPresence : 0;
  const blurCount = Number.isFinite(turnInputs?.blurCount) ? turnInputs.blurCount : 0;
  const hiddenMs = Number.isFinite(turnInputs?.hiddenMs) ? turnInputs.hiddenMs : 0;

  const turnDuration = Math.max(1, submitAt - turnStart);
  const firstLatency = firstKeyAt !== null ? Math.max(0, firstKeyAt - turnStart) : 0;
  const idleAfterAnswer = firstKeyAt !== null && responseEndAt !== null
    ? Math.max(0, firstKeyAt - responseEndAt)
    : 0;
  const thinkTotal = submitAt - (firstKeyAt !== null ? firstKeyAt : turnStart);
  const holdBeforeSend = lastKeyAt !== null ? Math.max(0, submitAt - lastKeyAt) : 0;

  const promptLengths = prompts.map((prompt) => prompt.length);
  const slope = olsSlope(promptLengths);
  const meanLength = mean(promptLengths);

  const minutes = Math.max(1, (submitTimes.length > 1
    ? submitTimes[submitTimes.length - 1] - submitTimes[0]
    : 60000) / 60000);
  const interruptions = answers.map((entry) => (entry?.interruption ? 1 : 0));
  const formalityCues = [
    countContractions(source) === 0 ? 1 : 0,
    /\bI\b/.test(source) ? 1 : 0,
    /[.!?…]["'”’)\]]*\s*$/.test(source.trim()) ? 1 : 0,
    /[A-Z]/.test(source) ? 1 : 0,
  ];

  return {
    typing_speed_cps: clamp01(speed / 8),
    typing_burst_length: clamp01((median(burstSizes) - 1) / 30),
    long_pause_ratio: clamp01(intervals.length ? longPauses.length / intervals.length : 0),
    median_ikey_interval: clamp01((median(fastIntervals.length ? fastIntervals : intervals) - 60) / 900),
    backspace_ratio: clamp01((backspaces / Math.max(1, keydowns)) / 0.35),
    hold_before_send: clamp01(holdBeforeSend / 6000),
    first_key_latency: clamp01((firstLatency - 300) / 12000),
    think_time_total: clamp01(thinkTotal / 20000),
    interruption_rate: clamp01(mean(interruptions) / 0.5),
    prompt_length_chars: clamp01(median(promptLengths) / 280),
    prompt_length_trend: clamp01(0.5 + clamp(meanLength > 0 ? slope / meanLength : 0, -0.5, 0.5)),
    turn_interval_median: clamp01(median(turnIntervals) / 45000),
    turns_per_minute: clamp01((submitTimes.length / minutes) / 4),
    idle_after_answer: clamp01(idleAfterAnswer / 30000),
    window_blur_rate: clamp01(blurCount / 3),
    hidden_time_ratio: clamp01((hiddenMs / turnDuration) / 0.6),
    mouse_activity_rate: clamp01(((pointerSamples + (turnInputs?.clicks ?? 0)) / pointerWindow) / 40),
    pointer_near_presence_ratio: clamp01((pointerSamples > 0 ? pointerNear / pointerSamples : 0) / 0.5),
    resubmit_duplicate: clamp01((duplicates / Math.max(1, recentPrompts.length - 1)) / 0.5),
    keystroke_cadence_variance: clamp01((cv(fastIntervals.length ? fastIntervals : intervals) - 0.4) / 1.2),
    question_rate: clamp01(weightedQuestions / 0.6),
    topic_shift_score: clamp01(topicShift),
    confirmation_rate: clamp01(confirmationShare / 0.5),
    backchannel_rate: clamp01(backchannelShare / 0.4),
    abort_signal_rate: clamp01(abortShare / 0.3),
    politeness_rate: clamp01(
      (POLITENESS.reduce((sum, phrase) => sum + countPhrase(source.toLowerCase(), phrase), 0)
        / Math.max(1, tokensOf(source).length)) * 100 / 6),
    formality_score: clamp01(mean(formalityCues)),
    exclamation_rate: clamp01((countChar(recentTenText, '!') / Math.max(1, recentTenWords)) * 100 / 20),
    emoji_rate: clamp01((countEmoji(recentTenText) / recentTenChars) * 100 / 5),
    self_disclosure_rate: clamp01(
      (tokensOf(source).reduce((sum, word) =>
        sum + (FIRST_PERSON.has(word) || FEELING_VERBS.has(word) ? 1 : 0), 0)
        / Math.max(1, tokensOf(source).length)) * 100 / 10),
    hedging_rate: clamp01(
      (HEDGES.reduce((sum, phrase) => sum + countPhrase(source.toLowerCase(), phrase), 0)
        / Math.max(1, tokensOf(source).length)) * 100 / 8),
    sentence_length_avg: clamp01(((recentFiveWords / Math.max(1, recentFiveSentences)) - 3) / 25),
  };
}

export function tokensOf(text) {
  return String(text).toLowerCase().match(/[a-z0-9]+(?:['’][a-z]+)?/g) ?? [];
}

function splitSentences(text) {
  const parts = String(text)
    .split(/[.!?…]+["'”’)\]]*(?:\s+|$)/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [String(text)];
}

function countPhrase(haystack, phrase) {
  if (!phrase) return 0;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (/[^a-z0-9]/.test(phrase)) {
    return (haystack.match(new RegExp(escaped, 'g')) ?? []).length;
  }
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'g');
  return (haystack.match(pattern) ?? []).length;
}

function countChar(text, char) {
  let count = 0;
  for (const value of String(text)) if (value === char) count += 1;
  return count;
}

function countEmoji(text) {
  try {
    return (String(text).match(/\p{Extended_Pictographic}/gu) ?? []).length;
  } catch {
    return 0;
  }
}

function countSetHits(words, set) {
  return words.reduce((sum, word) => sum + (set.has(word) ? 1 : 0), 0);
}

function countContractions(text) {
  const apostrophes = (String(text).toLowerCase().match(/\b[a-z]+['’](?:s|t|re|ve|ll|d|m)\b/g) ?? []).length;
  const bare = tokensOf(text).reduce(
    (sum, word) => sum + (BARE_CONTRACTIONS.has(word) ? 1 : 0),
    0,
  );
  return apostrophes + bare;
}

function seedMean(words, table, fallback) {
  let sum = 0;
  let count = 0;
  for (const word of words) {
    if (Object.prototype.hasOwnProperty.call(table, word)) {
      sum += table[word];
      count += 1;
    }
  }
  return count ? sum / count : fallback;
}

function countSyllables(word) {
  const clean = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 1;
  const groups = clean.match(/[aeiouy]+/g) ?? [];
  let count = groups.length;
  if (count > 1 && clean.endsWith('e') && !clean.endsWith('le')) count -= 1;
  return Math.max(1, count);
}

function contentWords(text) {
  return new Set(tokensOf(text).filter((word) => word.length > 2 && !CONTENT_STOPWORDS.has(word)));
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

function similarity(a, b) {
  return jaccard(new Set(a ?? []), new Set(b ?? []));
}

function splitBursts(times, gapMs) {
  if (!times.length) return [];
  const bursts = [[times[0]]];
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] > gapMs) bursts.push([times[i]]);
    else bursts[bursts.length - 1].push(times[i]);
  }
  return bursts;
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function cv(values) {
  if (values.length < 2) return 0;
  const average = mean(values);
  if (average === 0) return 0;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance) / average;
}

function olsSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }
  return denominator ? numerator / denominator : 0;
}

function emaShare(values, predicate) {
  if (!values.length) return 0;
  let weightSum = 0;
  let hitSum = 0;
  let weight = 1;
  for (let i = values.length - 1; i >= 0; i--) {
    weightSum += weight;
    if (predicate(values[i])) hitSum += weight;
    weight *= 0.85;
  }
  return weightSum ? hitSum / weightSum : 0;
}

function shareMatches(values, predicate) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + (predicate(value) ? 1 : 0), 0) / values.length;
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}
