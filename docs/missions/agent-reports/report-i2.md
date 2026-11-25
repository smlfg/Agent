Read: contract (12 fixed parameters, entry schema, max 3 weights per metric, −1…1). Store gives only `prompt`/`answer` per turn, so all metrics are per-turn text analyzable in the browser.

```json
[
  {
    "id": "sentiment_valence",
    "name": "Sentiment valence (AFINN/VADER lexicon sum)",
    "group": "affective",
    "source": "user_text",
    "compute": "Tokenize prompt, sum AFINN scores of known words, divide by token count, average with VADER compound if available.",
    "library": "sentiment (MIT) + AFINN list (Apache-2.0)",
    "raw_range": "-5..5",
    "normalize": "(v + 5) / 10, clamp 0..1",
    "weights": { "warmth": 0.5, "calm": 0.2, "closeness": 0.15 },
    "confidence": "high",
    "rationale": "Positive valence reads as warm, easy and nearer; negative valence cools the surface."
  },
  {
    "id": "arousal_vader",
    "name": "Arousal / intensity (VADER cues)",
    "group": "affective",
    "source": "user_text",
    "compute": "Count exclamation marks, ALL-CAPS words, intensifiers (very, so, really) and negation flips; combine into an intensity score per sentence.",
    "library": "vader-sentiment (MIT)",
    "raw_range": "0..1",
    "normalize": "already 0..1, clamp",
    "weights": { "energy": 0.5, "calm": -0.45, "tempo": 0.2 },
    "confidence": "high",
    "rationale": "Intensity is the textbook arousal signal: high activation, low calm, faster perceived pace."
  },
  {
    "id": "dominance_vad",
    "name": "Dominance (NRC-VAD idea)",
    "group": "affective",
    "source": "user_text",
    "compute": "Mean dominance value over known tokens using a small hand-curated VAD seed list (control/agency words high, helplessness words low).",
    "library": "none (own ~200-word VAD seed list)",
    "raw_range": "0..1",
    "normalize": "mean, clamp",
    "weights": { "certainty": 0.35, "energy": 0.2, "openness": 0.15 },
    "confidence": "medium",
    "rationale": "Dominant language signals control and assertiveness, feeding certainty and active energy."
  },
  {
    "id": "joy_lexicon",
    "name": "Joy lexicon density",
    "group": "affective",
    "source": "user_text",
    "compute": "Share of tokens in a joy seed list (happy, love, great, glad, excited, thanks-adjacent).",
    "library": "none (own joy seed list)",
    "raw_range": "0..1",
    "normalize": "count / tokens, clamp",
    "weights": { "warmth": 0.4, "playfulness": 0.3, "energy": 0.2 },
    "confidence": "high",
    "rationale": "Joy vocabulary warms the tone, lightens it and adds activation."
  },
  {
    "id": "anger_lexicon",
    "name": "Anger lexicon density",
    "group": "affective",
    "source": "user_text",
    "compute": "Share of tokens in an anger seed list (angry, hate, awful, ridiculous, furious).",
    "library": "none (own anger seed list)",
    "raw_range": "0..1",
    "normalize": "count / tokens, clamp",
    "weights": { "calm": -0.5, "warmth": -0.35, "energy": 0.2 },
    "confidence": "high",
    "rationale": "Anger raises tension and heat: calm down, warmth down, energy up."
  },
  {
    "id": "fear_lexicon",
    "name": "Fear/anxiety lexicon density",
    "group": "affective",
    "source": "user_text",
    "compute": "Share of tokens in a fear seed list (afraid, worried, scary, anxious, nervous).",
    "library": "none (own fear seed list)",
    "raw_range": "0..1",
    "normalize": "count / tokens, clamp",
    "weights": { "calm": -0.45, "certainty": -0.3, "openness": -0.2 },
    "confidence": "medium",
    "rationale": "Anxiety reads as unsettled and uncertain, narrowing exploration."
  },
  {
    "id": "sadness_lexicon",
    "name": "Sadness lexicon density",
    "group": "affective",
    "source": "user_text",
    "compute": "Share of tokens in a sadness seed list (sad, lonely, tired, lost, sorry-for-self).",
    "library": "none (own sadness seed list)",
    "raw_range": "0..1",
    "normalize": "count / tokens, clamp",
    "weights": { "energy": -0.4, "calm": 0.1, "warmth": -0.15 },
    "confidence": "medium",
    "rationale": "Sadness is low-arousal withdrawal: energy down, slight quiet, less outward warmth."
  },
  {
    "id": "surprise_markers",
    "name": "Surprise markers",
    "group": "affective",
    "source": "user_text",
    "compute": "Count surprise cues (wow, whoa, really?!, unexpected, surprise, interrobang) per sentence.",
    "library": "none (regex + seed words)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "playfulness": 0.3, "openness": 0.25, "energy": 0.25 },
    "confidence": "medium",
    "rationale": "Surprise opens attention and play, and adds a burst of energy."
  },
  {
    "id": "affect_punctuation",
    "name": "Affect punctuation (caps, !, ...)",
    "group": "affective",
    "source": "user_text",
    "compute": "Ratio of exclamation marks, ellipses and ALL-CAPS tokens to total characters/tokens.",
    "library": "none (regex)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio * 4, 0, 1)",
    "weights": { "energy": 0.3, "tempo": 0.2, "calm": -0.25 },
    "confidence": "medium",
    "rationale": "Loud punctuation reads as fast, loud and less settled."
  },
  {
    "id": "self_disclosure",
    "name": "Self-disclosure (I + feeling/state)",
    "group": "affective",
    "source": "user_text",
    "compute": "Density of first-person singular pronouns co-occurring with feeling/state words in the same sentence.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "co-occurrence count / sentences, clamp",
    "weights": { "closeness": 0.5, "warmth": 0.3, "formality": -0.25 },
    "confidence": "medium",
    "rationale": "Talking about one's own state creates intimacy and relaxes formality."
  },
  {
    "id": "sentiment_balance",
    "name": "Positive/negative balance",
    "group": "affective",
    "source": "user_text",
    "compute": "(pos_count - neg_count) / (pos_count + neg_count + 1) over valence lexicon hits.",
    "library": "sentiment (MIT) + AFINN list (Apache-2.0)",
    "raw_range": "-1..1",
    "normalize": "(x + 1) / 2",
    "weights": { "warmth": 0.35, "calm": 0.2, "playfulness": 0.1 },
    "confidence": "high",
    "rationale": "Relative positivity is a robust, length-insensitive warmth signal."
  },
  {
    "id": "politeness_markers",
    "name": "Politeness markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count please, kindly, if you don't mind, would you, may I; normalize per sentence.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "formality": 0.4, "warmth": 0.3, "closeness": 0.1 },
    "confidence": "high",
    "rationale": "Politeness signals social distance handling and considerate warmth."
  },
  {
    "id": "gratitude_markers",
    "name": "Gratitude markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count thanks, thank you, appreciate, grateful.",
    "library": "none (regex + seed words)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "warmth": 0.45, "closeness": 0.2, "playfulness": 0.1 },
    "confidence": "high",
    "rationale": "Gratitude is a direct warmth and relational-closeness cue."
  },
  {
    "id": "apology_markers",
    "name": "Apology markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count sorry, apologies, my mistake, excuse me.",
    "library": "none (regex + seed words)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "warmth": 0.3, "calm": 0.2, "certainty": -0.15 },
    "confidence": "medium",
    "rationale": "Apology softens and de-escalates while admitting uncertainty."
  },
  {
    "id": "hedges",
    "name": "Hedges / uncertainty markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Density of maybe, perhaps, I think, sort of, kind of, possibly, might.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "count / tokens * 10, clamp",
    "weights": { "certainty": -0.5, "openness": 0.2, "formality": 0.1 },
    "confidence": "high",
    "rationale": "Hedges are the canonical low-certainty, exploratory marker."
  },
  {
    "id": "boosters",
    "name": "Boosters / certainty markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Density of definitely, absolutely, clearly, always, must, of course.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "count / tokens * 10, clamp",
    "weights": { "certainty": 0.5, "energy": 0.25, "formality": 0.1 },
    "confidence": "high",
    "rationale": "Boosters assert commitment: high certainty and drive."
  },
  {
    "id": "imperative_mood",
    "name": "Imperative mood",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Share of sentences tagged imperative via POS pattern (base verb in sentence-initial position, no subject).",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "imperatives / sentences, clamp",
    "weights": { "certainty": 0.3, "energy": 0.3, "tempo": 0.2 },
    "confidence": "medium",
    "rationale": "Commands are direct, activating and fast-reading."
  },
  {
    "id": "open_question",
    "name": "Open (wh-) questions",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count sentences ending in ? whose first wh-word is what/why/how/who/where/when.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "openness": 0.5, "attention": 0.15, "depth": 0.15 },
    "confidence": "high",
    "rationale": "Wh-questions invite wide exploration and deeper framing."
  },
  {
    "id": "closed_question",
    "name": "Closed (yes/no) questions",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count ? sentences not starting with a wh-word (aux-initial or tag questions).",
    "library": "winkNLP (MIT)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "attention": 0.3, "certainty": 0.2, "openness": -0.2 },
    "confidence": "medium",
    "rationale": "Yes/no questions narrow the field to a single point."
  },
  {
    "id": "question_ratio",
    "name": "Question ratio",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Sentences ending in ? divided by total sentences.",
    "library": "none (regex)",
    "raw_range": "0..1",
    "normalize": "already 0..1, clamp",
    "weights": { "attention": 0.35, "openness": 0.3, "tempo": 0.1 },
    "confidence": "high",
    "rationale": "Questions indicate engaged, directed attention and appetite to explore."
  },
  {
    "id": "request_markers",
    "name": "Request / directive markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count can you, could you, would you, I need, help me, please + verb.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "formality": 0.25, "closeness": 0.2, "openness": 0.2 },
    "confidence": "medium",
    "rationale": "Requests presume a relationship and usually open a new line of inquiry."
  },
  {
    "id": "humor_irony",
    "name": "Humor / irony markers",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count haha, lol, :), jokes, exaggeration cues, scare quotes, 'sure...' irony patterns; combine.",
    "library": "none (regex + seed words)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "playfulness": 0.5, "warmth": 0.2, "formality": -0.3 },
    "confidence": "medium",
    "rationale": "Humor is the clearest playfulness signal and loosens formality."
  },
  {
    "id": "speech_act_directive",
    "name": "Speech act class (directive share)",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Rule-based classification per sentence into assertive/directive/commissive/expressive; return share of directive+commissive.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "share, clamp",
    "weights": { "certainty": 0.3, "energy": 0.2, "formality": 0.15 },
    "confidence": "low",
    "rationale": "Action-oriented acts read as committed and driving; explicit approximation."
  },
  {
    "id": "vocative_address",
    "name": "Vocative / direct address",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count second-person pronouns (you/your) plus greeting names (hey, hi) at sentence start.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "count / tokens * 10, clamp",
    "weights": { "closeness": 0.35, "warmth": 0.2, "formality": -0.2 },
    "confidence": "medium",
    "rationale": "Addressing someone directly builds nearness and informality."
  },
  {
    "id": "modal_force",
    "name": "Modal verb force",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Weighted count of modals: must/shall/will (+1), should/would (0.5), could/might/may (0.2), divided by clauses.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "weighted / clauses, clamp",
    "weights": { "formality": 0.3, "certainty": 0.2, "openness": 0.1 },
    "confidence": "medium",
    "rationale": "Strong modals formalize and commit; weak modals leave room to explore."
  },
  {
    "id": "negation_ratio",
    "name": "Negation ratio",
    "group": "pragmatic",
    "source": "user_text",
    "compute": "Count not, no, never, none, nothing divided by tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "count / tokens * 10, clamp",
    "weights": { "calm": 0.2, "formality": 0.1, "certainty": -0.15 },
    "confidence": "low",
    "rationale": "Negation reads as correction/withholding; weak but stable formal cue."
  },
  {
    "id": "concreteness",
    "name": "Concreteness (lexical)",
    "group": "semantic",
    "source": "user_text",
    "compute": "Mean concreteness over known nouns/verbs using a compact concreteness seed table (Brysbaert-style, ~500 words).",
    "library": "none (own concreteness seed table)",
    "raw_range": "1..5",
    "normalize": "(mean - 1) / 4",
    "weights": { "depth": -0.5, "density": 0.2, "attention": 0.2 },
    "confidence": "medium",
    "rationale": "Concrete language is tangible, grounded and shallow-abstraction."
  },
  {
    "id": "abstractness",
    "name": "Abstractness (suffix + word class)",
    "group": "semantic",
    "source": "user_text",
    "compute": "Share of abstract-noun suffixes (-tion, -ness, -ity, -ism, -ment) plus abstract seed words.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "share / tokens * 20, clamp",
    "weights": { "depth": 0.5, "openness": 0.2, "formality": 0.15 },
    "confidence": "medium",
    "rationale": "Abstract nouns signal conceptual depth and formal register."
  },
  {
    "id": "topic_keyword_density",
    "name": "Topic keyword density",
    "group": "semantic",
    "source": "user_text",
    "compute": "Top non-stopword content-word frequency divided by content tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "already 0..1, clamp",
    "weights": { "attention": 0.45, "density": 0.2 },
    "confidence": "high",
    "rationale": "Repeating a few content words shows the user is holding one topic."
  },
  {
    "id": "topic_coherence",
    "name": "Topic coherence (sentence overlap)",
    "group": "semantic",
    "source": "user_text",
    "compute": "Mean Jaccard overlap of content-word sets between consecutive sentences.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "mean, clamp",
    "weights": { "attention": 0.35, "density": 0.15 },
    "confidence": "medium",
    "rationale": "Lexical chaining across sentences is a direct focus/coherence proxy."
  },
  {
    "id": "past_time_ref",
    "name": "Past time reference",
    "group": "semantic",
    "source": "user_text",
    "compute": "Density of past-tense verbs plus yesterday, ago, last, used to, was/were.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "count / clauses * 10, clamp",
    "weights": { "calm": 0.15, "depth": 0.15, "energy": -0.1 },
    "confidence": "medium",
    "rationale": "Looking back is reflective, settled and slower than forward drive."
  },
  {
    "id": "future_time_ref",
    "name": "Future time reference",
    "group": "semantic",
    "source": "user_text",
    "compute": "Density of will, going to, tomorrow, next, plan, soon, shall.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "count / clauses * 10, clamp",
    "weights": { "openness": 0.3, "energy": 0.2, "certainty": -0.1 },
    "confidence": "medium",
    "rationale": "Future talk opens possibility space and adds forward drive, while plans are still unsettled."
  },
  {
    "id": "pronoun_focus_you",
    "name": "Pronoun focus (you vs I)",
    "group": "semantic",
    "source": "user_text",
    "compute": "(you_count - i_count) / (you_count + i_count + 1).",
    "library": "winkNLP (MIT)",
    "raw_range": "-1..1",
    "normalize": "(x + 1) / 2",
    "weights": { "openness": 0.25, "attention": 0.2, "closeness": 0.1 },
    "confidence": "medium",
    "rationale": "Other-focus reads as outward attention and relational engagement."
  },
  {
    "id": "lexical_diversity",
    "name": "Lexical diversity (type-token ratio)",
    "group": "semantic",
    "source": "user_text",
    "compute": "Unique content-word types divided by content tokens (length-normalized by root TTR).",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "types / sqrt(tokens), clamp",
    "weights": { "density": 0.4, "depth": 0.2, "formality": 0.15 },
    "confidence": "medium",
    "rationale": "Varied vocabulary implies information density and reflective elaboration."
  },
  {
    "id": "mean_word_length",
    "name": "Mean word length",
    "group": "semantic",
    "source": "user_text",
    "compute": "Average characters per alphabetic token.",
    "library": "none (regex)",
    "raw_range": "1..15",
    "normalize": "(mean - 3) / 7, clamp",
    "weights": { "formality": 0.3, "depth": 0.2, "tempo": -0.2 },
    "confidence": "medium",
    "rationale": "Longer words read as formal and slower; classic readability component."
  },
  {
    "id": "sentence_length",
    "name": "Mean sentence length",
    "group": "semantic",
    "source": "user_text",
    "compute": "Mean tokens per sentence.",
    "library": "none (regex)",
    "raw_range": "1..60",
    "normalize": "sigmoid((mean - 18) / 8)",
    "weights": { "density": 0.35, "tempo": -0.2, "depth": 0.15 },
    "confidence": "high",
    "rationale": "Long sentences carry more information, feel slower and more elaborate."
  },
  {
    "id": "readability_flesch",
    "name": "Readability (Flesch ease, inverted)",
    "group": "semantic",
    "source": "user_text",
    "compute": "Flesch Reading Ease = 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words); invert.",
    "library": "self-written syllable counter (none)",
    "raw_range": "0..100",
    "normalize": "1 - ease/100, clamp",
    "weights": { "formality": 0.3, "depth": 0.2, "tempo": -0.15 },
    "confidence": "medium",
    "rationale": "Harder text correlates with formal, abstract, slow register."
  },
  {
    "id": "formality_f_score",
    "name": "Formality (Heylighen F-score)",
    "group": "semantic",
    "source": "user_text",
    "compute": "Heylighen F = (noun+adj+prep+article freq - pronoun+verb+adverb+interjection freq + 100) / 2.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..100",
    "normalize": "F / 100, clamp",
    "weights": { "formality": 0.6, "closeness": -0.2, "warmth": -0.1 },
    "confidence": "high",
    "rationale": "Established formal-register measure; formal text is also less intimate and cooler."
  },
  {
    "id": "jargon_acronym_density",
    "name": "Technical jargon / acronym density",
    "group": "semantic",
    "source": "user_text",
    "compute": "Share of unknown-but-multi-letter acronyms (e.g. API, LLM) plus a small technical-terms seed list.",
    "library": "none (regex + seed terms)",
    "raw_range": "0..1",
    "normalize": "hits / tokens * 20, clamp",
    "weights": { "formality": 0.3, "depth": 0.3, "density": 0.15 },
    "confidence": "low",
    "rationale": "Domain shorthand signals expertise, depth and packed information."
  },
  {
    "id": "curiosity_words",
    "name": "Curiosity / exploration words",
    "group": "semantic",
    "source": "user_text",
    "compute": "Count what if, wonder, explore, imagine, curious, idea, experiment, try.",
    "library": "none (regex + seed words)",
    "raw_range": "0..n",
    "normalize": "1 - exp(-count/2)",
    "weights": { "openness": 0.4, "playfulness": 0.2, "energy": 0.1 },
    "confidence": "medium",
    "rationale": "Exploratory wording is the most direct semantic openness cue."
  }
]
```

| id | Parameter mit Gewichten | confidence |
|---|---|---|
| sentiment_valence | warmth 0.5, calm 0.2, closeness 0.15 | high |
| arousal_vader | energy 0.5, calm −0.45, tempo 0.2 | high |
| dominance_vad | certainty 0.35, energy 0.2, openness 0.15 | medium |
| joy_lexicon | warmth 0.4, playfulness 0.3, energy 0.2 | high |
| anger_lexicon | calm −0.5, warmth −0.35, energy 0.2 | high |
| fear_lexicon | calm −0.45, certainty −0.3, openness −0.2 | medium |
| sadness_lexicon | energy −0.4, calm 0.1, warmth −0.15 | medium |
| surprise_markers | playfulness 0.3, openness 0.25, energy 0.25 | medium |
| affect_punctuation | energy 0.3, tempo 0.2, calm −0.25 | medium |
| self_disclosure | closeness 0.5, warmth 0.3, formality −0.25 | medium |
| sentiment_balance | warmth 0.35, calm 0.2, playfulness 0.1 | high |
| politeness_markers | formality 0.4, warmth 0.3, closeness 0.1 | high |
| gratitude_markers | warmth 0.45, closeness 0.2, playfulness 0.1 | high |
| apology_markers | warmth 0.3, calm 0.2, certainty −0.15 | medium |
| hedges | certainty −0.5, openness 0.2, formality 0.1 | high |
| boosters | certainty 0.5, energy 0.25, formality 0.1 | high |
| imperative_mood | certainty 0.3, energy 0.3, tempo 0.2 | medium |
| open_question | openness 0.5, attention 0.15, depth 0.15 | high |
| closed_question | attention 0.3, certainty 0.2, openness −0.2 | medium |
| question_ratio | attention 0.35, openness 0.3, tempo 0.1 | high |
| request_markers | formality 0.25, closeness 0.2, openness 0.2 | medium |
| humor_irony | playfulness 0.5, warmth 0.2, formality −0.3 | medium |
| speech_act_directive | certainty 0.3, energy 0.2, formality 0.15 | low |
| vocative_address | closeness 0.35, warmth 0.2, formality −0.2 | medium |
| modal_force | formality 0.3, certainty 0.2, openness 0.1 | medium |
| negation_ratio | calm 0.2, formality 0.1, certainty −0.15 | low |
| concreteness | depth −0.5, density 0.2, attention 0.2 | medium |
| abstractness | depth 0.5, openness 0.2, formality 0.15 | medium |
| topic_keyword_density | attention 0.45, density 0.2 | high |
| topic_coherence | attention 0.35, density 0.15 | medium |
| past_time_ref | calm 0.15, depth 0.15, energy −0.1 | medium |
| future_time_ref | openness 0.3, energy 0.2, certainty −0.1 | medium |
| pronoun_focus_you | openness 0.25, attention 0.2, closeness 0.1 | medium |
| lexical_diversity | density 0.4, depth 0.2, formality 0.15 | medium |
| mean_word_length | formality 0.3, depth 0.2, tempo −0.2 | medium |
| sentence_length | density 0.35, tempo −0.2, depth 0.15 | high |
| readability_flesch | formality 0.3, depth 0.2, tempo −0.15 | medium |
| formality_f_score | formality 0.6, closeness −0.2, warmth −0.1 | high |
| jargon_acronym_density | formality 0.3, depth 0.3, density 0.15 | low |
| curiosity_words | openness 0.4, playfulness 0.2, energy 0.1 | medium |

Coverage (each of the 12 ≥3): tempo 7, density 6, warmth 12, calm 9, closeness 8, openness 12, attention 7, certainty 11, playfulness 6, formality 15, depth 9, energy 13. Licensing: winkNLP MIT, compromise MIT, `sentiment` (MIT wrapper) over AFINN (Apache-2.0), `vader-sentiment` (MIT) — all browser-safe and small; NRC-VAD used only as an idea with an own seed list to avoid its research-only terms.
