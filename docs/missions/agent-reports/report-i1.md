I'll read the contract document first.
Read the contract and both context files. Catalog below follows the entry format exactly (≤3 weights per metric, −1…1, all fields filled). All 36 metrics run in browser-side JS; 19 lexical, 11 syntactic, 6 readability.

```json
[
  {
    "id": "word_count",
    "name": "Word count",
    "group": "lexical",
    "source": "user_text",
    "compute": "Strip punctuation, split on whitespace, count tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..N tokens",
    "normalize": "clamp(tokens / 60, 0, 1)",
    "weights": { "density": 0.6, "tempo": 0.3, "energy": 0.2 },
    "confidence": "high",
    "rationale": "Longer prompts carry more content (density), more production momentum (tempo) and more activation (energy)."
  },
  {
    "id": "type_token_ratio",
    "name": "Type-token ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Unique lowercase word types divided by total tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp((ttr - 0.35) / 0.55, 0, 1)",
    "weights": { "density": 0.3, "openness": 0.3, "depth": 0.4 },
    "confidence": "medium",
    "rationale": "Varied vocabulary signals exploratory breadth (openness) and less repetitive, conceptually deeper text."
  },
  {
    "id": "mtld",
    "name": "Measure of textual lexical diversity",
    "group": "lexical",
    "source": "user_text",
    "compute": "Forward and reverse MTLD with a 0.72 TTR threshold, mean of both factors.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~200",
    "normalize": "clamp(mtld / 120, 0, 1)",
    "weights": { "depth": 0.4, "openness": 0.3, "attention": 0.3 },
    "confidence": "medium",
    "rationale": "Sustained lexical variety over a longer stretch indicates sustained focus on one exploration (attention) plus depth."
  },
  {
    "id": "mean_word_length",
    "name": "Mean word length",
    "group": "lexical",
    "source": "user_text",
    "compute": "Mean character count of alphabetic tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "1..~12 chars",
    "normalize": "clamp((mw - 3) / 4, 0, 1)",
    "weights": { "density": 0.4, "formality": 0.3, "depth": 0.3 },
    "confidence": "high",
    "rationale": "Longer words pack more information per token and correlate with formal, abstract register."
  },
  {
    "id": "long_word_ratio",
    "name": "Long-word ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Share of tokens with 7 or more characters.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.35, 0, 1)",
    "weights": { "formality": 0.4, "depth": 0.4, "density": 0.2 },
    "confidence": "high",
    "rationale": "Latinate multi-syllable vocabulary is the classic marker of formal, abstract, information-dense prose."
  },
  {
    "id": "mean_syllables_per_word",
    "name": "Mean syllables per word",
    "group": "lexical",
    "source": "user_text",
    "compute": "Mean syllable count per token using a vowel-group heuristic.",
    "library": "syllable (MIT)",
    "raw_range": "1..~3.5",
    "normalize": "clamp((syl - 1.2) / 1.3, 0, 1)",
    "weights": { "formality": 0.4, "depth": 0.3, "calm": 0.2 },
    "confidence": "medium",
    "rationale": "Polysyllabic words slow delivery and mark a measured, formal, reflective tone."
  },
  {
    "id": "function_word_ratio",
    "name": "Function-word ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Closed-class words (articles, prepositions, auxiliaries, conjunctions, pronouns) divided by tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp((ratio - 0.3) / 0.35, 0, 1)",
    "weights": { "formality": 0.4, "depth": 0.2, "density": 0.2 },
    "confidence": "high",
    "rationale": "High function-word density reflects grammatically elaborated, formal, structurally dense sentences."
  },
  {
    "id": "noun_ratio",
    "name": "Noun ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Nouns divided by tokens via POS tagging.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.45, 0, 1)",
    "weights": { "density": 0.4, "formality": 0.3, "depth": 0.2 },
    "confidence": "medium",
    "rationale": "Nominal style is dense, formal and tends toward abstract entities rather than actions."
  },
  {
    "id": "verb_ratio",
    "name": "Verb ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Verbs divided by tokens via POS tagging.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.3, 0, 1)",
    "weights": { "tempo": 0.4, "energy": 0.4, "calm": -0.2 },
    "confidence": "medium",
    "rationale": "Verb-heavy, action-oriented language reads as faster and more energized than nominal style."
  },
  {
    "id": "adjective_ratio",
    "name": "Adjective ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Adjectives divided by tokens via POS tagging.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.2, 0, 1)",
    "weights": { "density": 0.3, "warmth": 0.4, "depth": 0.2 },
    "confidence": "medium",
    "rationale": "Descriptive qualification adds texture and evaluative warmth to otherwise bare statements."
  },
  {
    "id": "adverb_ratio",
    "name": "Adverb ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Adverbs (excluding not) divided by tokens via POS tagging.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.15, 0, 1)",
    "weights": { "energy": 0.3, "playfulness": 0.2, "tempo": 0.2 },
    "confidence": "medium",
    "rationale": "Intensifying and manner adverbs add pace and liveliness to the phrasing."
  },
  {
    "id": "pronoun_ratio",
    "name": "Pronoun ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "All personal and possessive pronouns divided by tokens.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.25, 0, 1)",
    "weights": { "closeness": 0.4, "warmth": 0.3, "formality": -0.3 },
    "confidence": "high",
    "rationale": "Pronoun-dense text is interpersonal and informal rather than distanced and institutional."
  },
  {
    "id": "first_person_singular_ratio",
    "name": "First-person singular ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Count of I, me, my, mine, myself divided by tokens.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.12, 0, 1)",
    "weights": { "closeness": 0.5, "warmth": 0.3, "formality": -0.4 },
    "confidence": "high",
    "rationale": "Self-reference is the strongest single marker of personal, close, informal talk."
  },
  {
    "id": "second_person_ratio",
    "name": "Second-person ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Count of you, your, yours, yourself divided by tokens.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.1, 0, 1)",
    "weights": { "warmth": 0.4, "closeness": 0.4, "attention": 0.2 },
    "confidence": "high",
    "rationale": "Direct address creates interpersonal warmth and keeps the exchange mutually focused."
  },
  {
    "id": "first_person_plural_ratio",
    "name": "First-person plural ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Count of we, us, our, ours divided by tokens.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.06, 0, 1)",
    "weights": { "closeness": 0.4, "warmth": 0.2, "openness": 0.2 },
    "confidence": "high",
    "rationale": "We-language builds a shared frame, which reads as close, warm and jointly exploratory."
  },
  {
    "id": "modal_verb_ratio",
    "name": "Modal verb ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Count of can, could, may, might, must, shall, should, will, would divided by tokens.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.1, 0, 1)",
    "weights": { "certainty": -0.4, "openness": 0.3, "formality": 0.3 },
    "confidence": "high",
    "rationale": "Modal framing hedges commitment and opens alternatives, which lowers felt certainty."
  },
  {
    "id": "negation_ratio",
    "name": "Negation ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Count of not, n't, never, no, none, nothing, neither, nor divided by tokens.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.08, 0, 1)",
    "weights": { "calm": -0.3, "warmth": -0.4, "certainty": -0.3 },
    "confidence": "medium",
    "rationale": "Frequent negation correlates with defensive, cooler, less settled phrasing."
  },
  {
    "id": "emoji_ratio",
    "name": "Emoji ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Unicode emoji count per sentence via property escapes.",
    "library": "none",
    "raw_range": "0..N per sentence",
    "normalize": "clamp(emojiCount / max(1, sentences * 2), 0, 1)",
    "weights": { "playfulness": 0.5, "warmth": 0.3, "formality": -0.4 },
    "confidence": "high",
    "rationale": "Emoji are a direct, reliable signal of playful, warm, informal register."
  },
  {
    "id": "hedge_ratio",
    "name": "Hedge ratio",
    "group": "lexical",
    "source": "user_text",
    "compute": "Count of maybe, perhaps, possibly, probably, kind of, sort of, I think, seems, apparently per 10 tokens.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(hedges / max(1, tokens / 10), 0, 1)",
    "weights": { "certainty": -0.6, "openness": 0.3, "formality": 0.2 },
    "confidence": "medium",
    "rationale": "Explicit hedging is the most direct lexical cue of hesitation and reduced certainty."
  },
  {
    "id": "sentence_count",
    "name": "Sentence count",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Count of sentences from sentence segmentation.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..N",
    "normalize": "clamp(sentences / 8, 0, 1)",
    "weights": { "density": 0.4, "tempo": 0.3, "energy": 0.2 },
    "confidence": "high",
    "rationale": "More sentences per prompt mean more points made quickly, i.e. denser and faster output."
  },
  {
    "id": "mean_sentence_length",
    "name": "Mean sentence length",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Tokens divided by sentence count.",
    "library": "winkNLP (MIT)",
    "raw_range": "1..~50 words",
    "normalize": "clamp((msl - 6) / 24, 0, 1)",
    "weights": { "density": 0.5, "depth": 0.3, "tempo": -0.4 },
    "confidence": "high",
    "rationale": "Long sentences are information-dense and deliberate, which reads as slow rather than snappy."
  },
  {
    "id": "clause_depth",
    "name": "Clause nesting depth",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Mean depth of subordinate clause nesting from the dependency parse.",
    "library": "compromise (MIT)",
    "raw_range": "1..~6 levels",
    "normalize": "clamp((depth - 1) / 4, 0, 1)",
    "weights": { "depth": 0.6, "formality": 0.2, "attention": 0.2 },
    "confidence": "medium",
    "rationale": "Nested subordination is the clearest syntactic proxy for abstraction and sustained focus."
  },
  {
    "id": "subordinate_conjunction_ratio",
    "name": "Subordinating-conjunction ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Count of because, although, while, since, unless, whereas, if, that, which, who per sentence.",
    "library": "compromise (MIT)",
    "raw_range": "0..N per sentence",
    "normalize": "clamp(count / max(1, sentences), 0, 1)",
    "weights": { "depth": 0.4, "formality": 0.2, "calm": 0.2 },
    "confidence": "high",
    "rationale": "Explicit causal and concessive links mark reasoning-heavy, composed, formal prose."
  },
  {
    "id": "punctuation_density",
    "name": "Punctuation density",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Non-terminal punctuation marks divided by tokens.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~0.3",
    "normalize": "clamp(marks / max(1, tokens) / 0.15, 0, 1)",
    "weights": { "energy": 0.3, "density": 0.2, "calm": -0.2 },
    "confidence": "high",
    "rationale": "Heavy punctuation chopping accompanies fast, dense, less composed delivery."
  },
  {
    "id": "question_ratio",
    "name": "Question ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Sentences ending in a question mark divided by sentences.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio, 0, 1)",
    "weights": { "openness": 0.5, "attention": 0.3, "certainty": -0.3 },
    "confidence": "high",
    "rationale": "Questions open the space and signal engagement, while conceding that the user does not yet know."
  },
  {
    "id": "exclamation_ratio",
    "name": "Exclamation ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Sentences ending in an exclamation mark divided by sentences.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio, 0, 1)",
    "weights": { "energy": 0.5, "playfulness": 0.3, "calm": -0.4 },
    "confidence": "high",
    "rationale": "Exclamations are among the strongest surface cues of high activation and arousal."
  },
  {
    "id": "passive_voice_ratio",
    "name": "Passive-voice ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Passive clauses divided by total clauses via parse match.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.2, 0, 1)",
    "weights": { "formality": 0.5, "warmth": -0.3, "certainty": 0.2 },
    "confidence": "medium",
    "rationale": "Agentless passive constructions read as detached and formal, so they cool the exchange."
  },
  {
    "id": "future_tense_ratio",
    "name": "Future-tense ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Future auxiliaries (will, shall, 'll) divided by verbs.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.15, 0, 1)",
    "weights": { "openness": 0.4, "energy": 0.2, "certainty": -0.2 },
    "confidence": "medium",
    "rationale": "Future reference points away from the settled present, which reads as more open and less certain."
  },
  {
    "id": "conditional_ratio",
    "name": "Conditional ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Conditional constructions (if + would/could/should/might) per sentence.",
    "library": "compromise (MIT)",
    "raw_range": "0..N per sentence",
    "normalize": "clamp(count / max(1, sentences) / 1.2, 0, 1)",
    "weights": { "openness": 0.4, "certainty": -0.4, "depth": 0.2 },
    "confidence": "medium",
    "rationale": "Hypothetical framing expands possibility space and explicitly withholds commitment."
  },
  {
    "id": "contraction_ratio",
    "name": "Contraction ratio",
    "group": "syntactic",
    "source": "user_text",
    "compute": "Apostrophe contractions (don't, it's, I'm) divided by tokens.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(ratio / 0.2, 0, 1)",
    "weights": { "formality": -0.5, "closeness": 0.3, "tempo": 0.3 },
    "confidence": "high",
    "rationale": "Contractions are the most reliable orthographic marker of informal, fast, personal speech."
  },
  {
    "id": "flesch_reading_ease",
    "name": "Flesch Reading Ease",
    "group": "syntactic",
    "source": "user_text",
    "compute": "206.835 - 1.015*(words/sentences) - 84.6*(syllables/words).",
    "library": "winkNLP (MIT)",
    "raw_range": "0..100",
    "normalize": "clamp(score / 100, 0, 1)",
    "weights": { "tempo": 0.4, "depth": -0.5, "formality": -0.3 },
    "confidence": "medium",
    "rationale": "Easy, plain text is skimmed fast and stays surface-level and informal; dense text slows it down."
  },
  {
    "id": "flesch_kincaid_grade",
    "name": "Flesch-Kincaid Grade Level",
    "group": "syntactic",
    "source": "user_text",
    "compute": "0.39*(words/sentences) + 11.8*(syllables/words) - 15.59.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~20 grade",
    "normalize": "clamp(grade / 16, 0, 1)",
    "weights": { "formality": 0.3, "depth": 0.4, "density": 0.2 },
    "confidence": "medium",
    "rationale": "Higher grade level means more formal, more information-dense, more abstract wording."
  },
  {
    "id": "gunning_fog",
    "name": "Gunning Fog Index",
    "group": "syntactic",
    "source": "user_text",
    "compute": "0.4*((words/sentences) + 100*(polysyllables/words)).",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~20 grade",
    "normalize": "clamp(grade / 16, 0, 1)",
    "weights": { "formality": 0.3, "depth": 0.4, "density": 0.2 },
    "confidence": "medium",
    "rationale": "Fog weights polysyllables explicitly, which tracks formal register and conceptual load."
  },
  {
    "id": "smog_index",
    "name": "SMOG Index",
    "group": "syntactic",
    "source": "user_text",
    "compute": "1.043*sqrt(30*(polysyllables/sentences)) + 3.1291.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~20 grade",
    "normalize": "clamp(smog / 16, 0, 1)",
    "weights": { "formality": 0.3, "depth": 0.3, "density": 0.3 },
    "confidence": "medium",
    "rationale": "SMOG is poly-syllable driven, so it rises with formal, dense, abstract phrasing."
  },
  {
    "id": "coleman_liau",
    "name": "Coleman-Liau Index",
    "group": "syntactic",
    "source": "user_text",
    "compute": "0.0588*L - 0.296*S - 15.8, with L letters per 100 words and S sentences per 100 words.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~20 grade",
    "normalize": "clamp(index / 16, 0, 1)",
    "weights": { "formality": 0.4, "depth": 0.3, "tempo": -0.2 },
    "confidence": "high",
    "rationale": "Character-based instead of syllable-based, giving an independent estimate of formal, slow-reading text."
  },
  {
    "id": "ari",
    "name": "Automated Readability Index",
    "group": "syntactic",
    "source": "user_text",
    "compute": "4.71*(chars/words) + 0.5*(words/sentences) - 21.43.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..~20 grade",
    "normalize": "clamp(index / 16, 0, 1)",
    "weights": { "formality": 0.3, "depth": 0.3, "density": 0.2 },
    "confidence": "high",
    "rationale": "Letter-heavy, long-sentence text is exactly the formal, dense, abstract register the index measures."
  }
]
```

| id | parameters (weights) | confidence |
|---|---|---|
| word_count | density +0.6, tempo +0.3, energy +0.2 | high |
| type_token_ratio | density +0.3, openness +0.3, depth +0.4 | medium |
| mtld | depth +0.4, openness +0.3, attention +0.3 | medium |
| mean_word_length | density +0.4, formality +0.3, depth +0.3 | high |
| long_word_ratio | formality +0.4, depth +0.4, density +0.2 | high |
| mean_syllables_per_word | formality +0.4, depth +0.3, calm +0.2 | medium |
| function_word_ratio | formality +0.4, depth +0.2, density +0.2 | high |
| noun_ratio | density +0.4, formality +0.3, depth +0.2 | medium |
| verb_ratio | tempo +0.4, energy +0.4, calm −0.2 | medium |
| adjective_ratio | density +0.3, warmth +0.4, depth +0.2 | medium |
| adverb_ratio | energy +0.3, playfulness +0.2, tempo +0.2 | medium |
| pronoun_ratio | closeness +0.4, warmth +0.3, formality −0.3 | high |
| first_person_singular_ratio | closeness +0.5, warmth +0.3, formality −0.4 | high |
| second_person_ratio | warmth +0.4, closeness +0.4, attention +0.2 | high |
| first_person_plural_ratio | closeness +0.4, warmth +0.2, openness +0.2 | high |
| modal_verb_ratio | certainty −0.4, openness +0.3, formality +0.3 | high |
| negation_ratio | calm −0.3, warmth −0.4, certainty −0.3 | medium |
| emoji_ratio | playfulness +0.5, warmth +0.3, formality −0.4 | high |
| hedge_ratio | certainty −0.6, openness +0.3, formality +0.2 | medium |
| sentence_count | density +0.4, tempo +0.3, energy +0.2 | high |
| mean_sentence_length | density +0.5, depth +0.3, tempo −0.4 | high |
| clause_depth | depth +0.6, formality +0.2, attention +0.2 | medium |
| subordinate_conjunction_ratio | depth +0.4, formality +0.2, calm +0.2 | high |
| punctuation_density | energy +0.3, density +0.2, calm −0.2 | high |
| question_ratio | openness +0.5, attention +0.3, certainty −0.3 | high |
| exclamation_ratio | energy +0.5, playfulness +0.3, calm −0.4 | high |
| passive_voice_ratio | formality +0.5, warmth −0.3, certainty +0.2 | medium |
| future_tense_ratio | openness +0.4, energy +0.2, certainty −0.2 | medium |
| conditional_ratio | openness +0.4, certainty −0.4, depth +0.2 | medium |
| contraction_ratio | formality −0.5, closeness +0.3, tempo +0.3 | high |
| flesch_reading_ease | tempo +0.4, depth −0.5, formality −0.3 | medium |
| flesch_kincaid_grade | formality +0.3, depth +0.4, density +0.2 | medium |
| gunning_fog | formality +0.3, depth +0.4, density +0.2 | medium |
| smog_index | formality +0.3, depth +0.3, density +0.3 | medium |
| coleman_liau | formality +0.4, depth +0.3, tempo −0.2 | high |
| ari | formality +0.3, depth +0.3, density +0.2 | high |

Coverage check: every parameter has ≥3 feeders — tempo 8, density 14, warmth 8, calm 6, closeness 5, openness 8, attention 4, certainty 7, playfulness 3, formality 19, depth 18, energy 7. All sources are `user_text` (the current prompt); the same functions can be re-run on `agent_text` without changing the schema.
