// Written-language steering: the 12 surface parameters -> concrete style levers.
// One direction only: parameters in, style out. Nothing here touches the DOM or
// the network, so the same derivation can feed a prompt and a dev responder.
//
// Every lever below is driven by at least one parameter and documented with its
// effect, because the owner wants to steer the agent's written language, not
// only its appearance.

export const STYLE_PARAMS = Object.freeze([
  'tempo', 'density', 'warmth', 'calm', 'closeness', 'openness',
  'attention', 'certainty', 'playfulness', 'formality', 'depth', 'energy',
]);

const WARMTH_PHRASES = Object.freeze([
  'I hear you.',
  'No rush.',
  'I am here.',
  'Take your time.',
  'Glad you said it.',
  'With you.',
]);

const HEDGE_PHRASES = Object.freeze([
  'maybe',
  'I think',
  'probably',
  'as far as I can tell',
  'I am not certain',
]);

/**
 * Turn raw parameters (0..1) into written-language levers.
 *
 * - targetWords    tempo is the ceiling: faster exchange -> fewer words.
 *                  density and depth add room; attention removes room, because a
 *                  focused listener answers the point instead of everything.
 *                  Returned as [min, max], both non-increasing in tempo.
 * - sentences      same length pressure as targetWords, expressed in sentences;
 *                  high tempo collapses to one or two.
 * - questionAllowed openness is the only permission. Below 0.66 the agent does
 *                  not ask; at or above it may ask exactly one question.
 * - register       formality bands: < 0.34 casual, < 0.67 neutral, else formal.
 * - warmthMarkers  warmth selects 0..3 acknowledgement phrases ("I hear you",
 *                  "No rush"). High warmth speaks first about the person.
 * - hedging        certainty inverted: low certainty allows "maybe"/"I think";
 *                  high certainty removes all softeners.
 * - punctuation    formality decides contractions and semicolons; calm allows an
 *                  ellipsis; energy plus playfulness may allow an exclamation.
 *                  Emoji are never allowed.
 * - vocabulary     depth plus formality choose concrete/everyday/precise words;
 *                  low formality permits contractions; no marketing claims.
 * - rhythm         tempo plus energy choose "short bursts", "even" or
 *                  "one thought per line".
 * - mirror         closeness plus attention decide how much of the visitor's own
 *                  words may be echoed: none, light, or direct.
 */
export function deriveStyle(params) {
  const p = normalize(params);

  // Length: tempo leads. The coefficients are ordered so that raising tempo
  // never increases either bound, which is what the monotonicity test checks.
  const maxWords = Math.round(clamp(
    42 - 32 * p.tempo + 14 * p.density + 10 * p.depth - 6 * p.attention,
    12,
    72,
  ));
  const minWords = Math.min(maxWords, Math.round(clamp(
    4 + 12 * (1 - p.tempo) + 2 * p.density,
    3,
    30,
  )));

  const maxSentences = Math.round(clamp(
    1 + 4 * (1 - p.tempo) + 2 * p.density + (p.depth - 0.5),
    1,
    6,
  ));
  const minSentences = Math.max(1, Math.min(
    maxSentences,
    Math.round(maxSentences * 0.5),
  ));

  const warmthLevel = Math.round(clamp((p.warmth - 0.15) / 0.85 * 3, 0, 3));
  const hedgeLevel = clamp((1 - p.certainty) * 0.8 + (1 - p.calm) * 0.2, 0, 1);
  const hedgeCount = hedgeLevel < 0.25 ? 0 : hedgeLevel < 0.5 ? 1 : hedgeLevel < 0.75 ? 2 : 3;

  const register = p.formality < 0.34 ? 'casual' : p.formality < 0.67 ? 'neutral' : 'formal';
  const precision = 0.5 * p.formality + 0.5 * p.depth;
  const vocabularyLevel = precision < 0.34 ? 'plain' : precision < 0.67 ? 'everyday' : 'precise';
  const pace = 0.6 * p.tempo + 0.4 * p.energy;
  const mirrorLevel = Number((0.6 * p.closeness + 0.4 * p.attention).toFixed(3));

  return {
    targetWords: [minWords, maxWords],
    sentences: [minSentences, maxSentences],
    questionAllowed: p.openness >= 0.66,
    register,
    warmthMarkers: {
      level: warmthLevel,
      phrases: WARMTH_PHRASES.slice(0, warmthLevel),
      soften: warmthLevel >= 2 ? 'acknowledge the person before the answer' : 'answer only',
    },
    hedging: {
      level: Number(hedgeLevel.toFixed(3)),
      phrases: HEDGE_PHRASES.slice(0, hedgeCount),
      stance: hedgeLevel >= 0.66 ? 'hedged' : hedgeLevel >= 0.34 ? 'even' : 'plain assertion',
    },
    punctuation: {
      contractions: p.formality < 0.5,
      emDash: p.formality < 0.6 && p.calm < 0.66,
      ellipsis: p.calm > 0.6 && p.tempo < 0.5,
      exclamation: p.energy > 0.7 && p.playfulness > 0.5,
      semicolon: p.formality > 0.66,
    },
    vocabulary: {
      level: vocabularyLevel,
      concrete: p.depth <= 0.33,
      abstract: p.depth >= 0.66,
      contractions: p.formality < 0.5,
      emoji: false,
      marketingClaims: false,
    },
    rhythm: pace > 0.66 ? 'short bursts' : pace < 0.36 ? 'one thought per line' : 'even, unhurried clauses',
    mirror: {
      level: mirrorLevel,
      mode: mirrorLevel < 0.35 ? 'none' : mirrorLevel < 0.68 ? 'light' : 'direct',
      effect: mirrorLevel >= 0.68
        ? 'you may reuse one of the visitor\'s own words'
        : mirrorLevel >= 0.35
          ? 'you may answer in the visitor\'s diction, without parroting'
          : 'do not echo the visitor\'s words',
    },
    // Kept for callers that want to show or log the exact source values.
    params: p,
  };
}

/** Short English prompt block, built only from the levers above. */
export function styleFragment(style) {
  const s = style || deriveStyle({});
  const words = s.targetWords || [6, 30];
  const sentences = s.sentences || [1, 4];
  const warmth = s.warmthMarkers || { level: 0, phrases: [] };
  const hedging = s.hedging || { level: 0, phrases: [] };
  const punctuation = s.punctuation || {};
  const vocabulary = s.vocabulary || {};
  const rhythm = s.rhythm || 'even';
  const mirror = s.mirror || { mode: 'light', effect: '' };
  const register = s.register || 'neutral';

  const parts = [
    `Length: ${words[0]} to ${words[1]} words, ${sentences[0]} to ${sentences[1]} sentences.`,
    `Question: ${s.questionAllowed
      ? 'at most one, only at the end, and only if it earns its place.'
      : 'none.'}`,
    `Register: ${register}.`,
    `Warmth: ${warmth.level > 0
      ? `${warmth.level} short warmth marker(s), e.g. ${warmth.phrases.join(', ')}; ${warmth.soften}.`
      : 'answer only, no warmth markers.'}`,
    `Hedging: ${hedging.level > 0
      ? `soften with ${hedging.phrases.join(', ')}.`
      : 'plain assertion, no softeners.'}`,
    `Punctuation: ${punctuation.contractions ? 'contractions allowed' : 'no contractions'};`
      + `${punctuation.emDash ? ' an em dash is allowed' : ' no em dash'};`
      + `${punctuation.ellipsis ? ' an ellipsis is allowed' : ' no ellipsis'};`
      + `${punctuation.semicolon ? ' semicolons allowed' : ' no semicolons'};`
      + `${punctuation.exclamation ? ' one exclamation is allowed' : ' no exclamation'};`
      + ' never emoji.',
    `Vocabulary: ${vocabulary.level || 'everyday'} words;`
      + `${vocabulary.concrete
        ? ' stay concrete'
        : vocabulary.abstract
          ? ' abstraction is allowed'
          : vocabulary.level === 'precise'
            ? ' prefer precise, concrete words'
            : ' stay everyday'};`
      + ' no marketing claims.',
    `Rhythm: ${rhythm}.`,
    `Mirror: ${mirror.mode}; ${mirror.effect || 'do not repeat the visitor back to them'}.`,
  ];

  return parts.join(' ');
}

function normalize(params) {
  const out = {};
  for (const id of STYLE_PARAMS) out[id] = clamp01(params?.[id]);
  return out;
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0.5;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function clamp(value, lo, hi) {
  const n = Number(value);
  if (!Number.isFinite(n)) return lo;
  return n < lo ? lo : n > hi ? hi : n;
}
