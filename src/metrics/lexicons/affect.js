// Own seed lists for affect cues that AFINN does not carry: intensity,
// hedging, assertion, politeness, imperatives, negation, self-disclosure and
// emoticons. Written for agentfaehig (no upstream code). CC0-1.0.
// AFINN itself is imported separately from ./afinn.js (Apache-2.0).

export const INTENSIFIERS = [
  'very', 'so', 'really', 'totally', 'absolutely', 'extremely', 'incredibly',
  'super', 'such', 'too', 'quite', 'way', 'damn', 'freaking', 'fucking',
  'hella', 'seriously', 'truly', 'utterly', 'deeply', 'completely',
];

export const BOOSTERS = [
  'definitely', 'absolutely', 'clearly', 'always', 'must', 'of course',
  'certainly', 'obviously', 'surely', 'indeed', 'undoubtedly', 'no doubt',
  'without doubt', 'for sure', 'guaranteed', 'never fail',
];

export const HEDGE_PHRASES = [
  'maybe', 'perhaps', 'possibly', 'probably', 'kind of', 'sort of', 'i think',
  'i guess', 'seems', 'seem', 'apparently', 'might', 'could be', 'not sure',
  'sorta', 'kinda', 'presumably', 'suppose', 'i suppose', 'i dunno', 'dunno',
  'not really', 'if that is ok', 'if that is okay', 'if thats ok',
  'if thats okay', 'or something', 'or whatever', 'i hope', 'hopefully',
];

export const POLITENESS_PHRASES = [
  'please', 'kindly', 'appreciate', 'grateful', 'cheers', 'thank you',
  'if you do not mind', 'if you dont mind', 'would you', 'could you',
  'may i', 'excuse me',
];

// Base forms that read as a command when they open a sentence with no subject.
export const IMPERATIVE_VERBS = new Set([
  'answer', 'ask', 'add', 'bring', 'build', 'call', 'calm', 'change', 'check',
  'clarify', 'close', 'come', 'confirm', 'consider', 'continue', 'define',
  'describe', 'do', 'explain', 'find', 'fix', 'forget', 'get', 'give', 'go',
  'help', 'hold', 'ignore', 'imagine', 'keep', 'leave', 'let', 'list', 'look',
  'make', 'move', 'name', 'open', 'pick', 'put', 'read', 'remember', 'remove',
  'repeat', 'say', 'send', 'show', 'sit', 'start', 'stay', 'stop', 'take',
  'tell', 'think', 'try', 'turn', 'use', 'wait', 'watch', 'write',
]);

export const SENTENCE_FILLERS = new Set([
  'just', 'please', 'now', 'so', 'then', 'ok', 'okay', 'hey', 'um', 'uh',
  'well', 'and', 'but', 'also', 'still', 'only', 'first', 'quickly',
]);

export const NEGATORS = new Set([
  'not', 'no', 'never', 'none', 'nothing', 'nobody', 'neither', 'nor',
  'without', 'hardly', 'barely', 'cannot', 'cant', 'wont', 'dont', 'isnt',
  'arent', 'wasnt', 'werent', 'didnt', 'doesnt', 'havent', 'hasnt', 'hadnt',
  'couldnt', 'wouldnt', 'shouldnt', "can't", "won't", "don't", "isn't",
  "aren't", "wasn't", "weren't", "didn't", "doesn't", "haven't", "hasn't",
  "hadn't", "couldn't", "wouldn't", "shouldn't", "ain't", 'aint',
]);

export const FEELING_WORDS = new Set([
  'feel', 'feels', 'felt', 'feeling', 'think', 'believe', 'want', 'need',
  'hope', 'worry', 'worried', 'love', 'hate', 'fear', 'wish', 'miss',
  'enjoy', 'glad', 'happy', 'sad', 'angry', 'mad', 'upset', 'tired',
  'excited', 'anxious', 'nervous', 'scared', 'afraid', 'grateful', 'sorry',
  'confused', 'frustrated', 'lonely', 'exhausted', 'stressed', 'curious',
  'okay', 'fine', 'good', 'bad', 'great', 'terrible', 'awful',
]);

export const SECOND_PERSON = new Set([
  'you', 'your', 'yours', 'yourself', 'yourselves',
]);

// Emoticons and emoji as a small valence table, scored like an AFINN hit.
export const EMOTICON_SCORES = Object.freeze({
  ':)': 2, ':-)': 2, '=)': 1.5, ';)': 1.5, ';-)': 1.5, ':d': 2, ':-d': 2,
  ':(': -2, ':-(': -2, ':/': -1, ':-/': -1, ":')": 1, ":'(": -2,
  '<3': 3, '^_^': 2, '^^': 1,
});

export const EMOJI_SCORES = Object.freeze({
  '😊': 2, '🙂': 1.5, '😄': 2, '😀': 2, '😁': 2, '😂': 2, '🤣': 2,
  '😍': 3, '🥰': 3, '😘': 2, '❤': 3, '❤️': 3, '💕': 3, '💖': 3,
  '👍': 2, '👏': 2, '🙏': 2, '🔥': 2, '✨': 1.5, '🎉': 3,
  '😢': -2, '😭': -3, '😞': -2, '😔': -2, '😟': -2, '😠': -2,
  '😡': -3, '🤬': -3, '💔': -2, '👎': -2, '😐': 0, '🤔': 0.5,
});
