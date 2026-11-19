Read the contract and the two context files (`src/state/store.js` phases `idle/listening/thinking/speaking` + `turn` counter; `src/conversation/conversation.js` `onInput`/`onSubmit`/`respond`). All metrics below are computable from DOM events in `conversation.js` plus store phase transitions, no server.

## Metric catalog — interaction + discourse (36 entries)

```json
[
  {
    "id": "typing_speed_cps",
    "name": "Typing speed (chars per second)",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Count printable keydown characters per composer session divided by active typing time (first to last keystroke, pauses over 5 s excluded).",
    "library": "none",
    "raw_range": "0..15 chars/s",
    "normalize": "clamp(x / 8, 0, 1)",
    "weights": { "tempo": 0.5, "energy": 0.3, "calm": -0.2 },
    "confidence": "high",
    "rationale": "Fast sustained typing reads as a quick, activated exchange."
  },
  {
    "id": "typing_burst_length",
    "name": "Typing burst length",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Split a prompt into bursts at inter-key gaps over 1.5 s, take the median characters per burst.",
    "library": "none",
    "raw_range": "1..60 chars",
    "normalize": "clamp((x - 1) / 30, 0, 1)",
    "weights": { "energy": 0.4, "tempo": 0.3, "density": 0.2 },
    "confidence": "medium",
    "rationale": "Long unbroken bursts signal momentum and packed input."
  },
  {
    "id": "long_pause_ratio",
    "name": "Long-pause ratio while typing",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Share of inter-key intervals within a prompt that exceed 2 s.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x, 0, 1)",
    "weights": { "depth": 0.3, "calm": 0.3, "tempo": -0.4 },
    "confidence": "high",
    "rationale": "Pausing mid-sentence indicates deliberation rather than reflex."
  },
  {
    "id": "median_ikey_interval",
    "name": "Median inter-key interval",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Median milliseconds between keystrokes inside bursts.",
    "library": "none",
    "raw_range": "40..1500 ms",
    "normalize": "clamp((x - 60) / 900, 0, 1)",
    "weights": { "tempo": -0.5, "calm": 0.3, "certainty": -0.2 },
    "confidence": "medium",
    "rationale": "Slow keying is careful but also hesitant."
  },
  {
    "id": "backspace_ratio",
    "name": "Backspace / correction ratio",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Backspace and Delete keydowns divided by all keydowns in the composer.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.35, 0, 1)",
    "weights": { "certainty": -0.5, "calm": -0.3 },
    "confidence": "high",
    "rationale": "Heavy deletion means second-guessing the wording."
  },
  {
    "id": "hold_before_send",
    "name": "Hold before send",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Milliseconds from the last keystroke to the submit event.",
    "library": "none",
    "raw_range": "0..20000 ms",
    "normalize": "clamp(x / 6000, 0, 1)",
    "weights": { "certainty": -0.4, "depth": 0.4, "calm": 0.2 },
    "confidence": "medium",
    "rationale": "Lingering before sending means weighing the message."
  },
  {
    "id": "first_key_latency",
    "name": "Latency to first keystroke after answer end",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Milliseconds from RESPONSE_END (or page mount) to the first keydown in the composer.",
    "library": "none",
    "raw_range": "0..60000 ms",
    "normalize": "clamp((x - 300) / 12000, 0, 1)",
    "weights": { "attention": -0.4, "depth": 0.3, "calm": 0.2 },
    "confidence": "medium",
    "rationale": "Long dead time suggests drift, yet a slow start can also be reflection."
  },
  {
    "id": "think_time_total",
    "name": "Total think time per turn",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Time from first focus or keydown in the composer to SUBMIT, including pauses.",
    "library": "none",
    "raw_range": "0..60000 ms",
    "normalize": "clamp(x / 20000, 0, 1)",
    "weights": { "depth": 0.4, "calm": 0.3, "tempo": -0.3 },
    "confidence": "medium",
    "rationale": "A long composed turn reads as deeper, slower processing."
  },
  {
    "id": "interruption_rate",
    "name": "Interruption rate (send during answer)",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Share of SUBMIT events dispatched while the store phase is thinking or speaking.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.5, 0, 1)",
    "weights": { "energy": 0.4, "attention": -0.4, "calm": -0.3 },
    "confidence": "high",
    "rationale": "Barging in is high drive with low patience."
  },
  {
    "id": "prompt_length_chars",
    "name": "Prompt length (chars)",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Median character count of the last 10 submitted prompts.",
    "library": "none",
    "raw_range": "0..600 chars",
    "normalize": "clamp(x / 280, 0, 1)",
    "weights": { "density": 0.5, "depth": 0.3 },
    "confidence": "high",
    "rationale": "Longer messages carry more information per turn."
  },
  {
    "id": "prompt_length_trend",
    "name": "Prompt length trend",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Ordinary least squares slope of prompt length over turn index, divided by mean length.",
    "library": "none",
    "raw_range": "-1..1",
    "normalize": "0.5 + clamp(slope, -0.5, 0.5)",
    "weights": { "density": 0.4, "openness": 0.3, "energy": 0.2 },
    "confidence": "low",
    "rationale": "Growing prompts mean expanding scope and rising involvement."
  },
  {
    "id": "turn_interval_median",
    "name": "Median turn interval",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Median milliseconds between consecutive SUBMIT events.",
    "library": "none",
    "raw_range": "1000..180000 ms",
    "normalize": "clamp(x / 45000, 0, 1)",
    "weights": { "tempo": -0.4, "calm": 0.2, "energy": -0.2 },
    "confidence": "high",
    "rationale": "Spaced turns read as slow and composed."
  },
  {
    "id": "turns_per_minute",
    "name": "Turn frequency",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "SUBMIT count divided by elapsed session minutes.",
    "library": "none",
    "raw_range": "0..10 /min",
    "normalize": "clamp(x / 4, 0, 1)",
    "weights": { "tempo": 0.5, "energy": 0.3 },
    "confidence": "high",
    "rationale": "More exchanges per minute is a faster, livelier rhythm."
  },
  {
    "id": "idle_after_answer",
    "name": "Idle time after answer",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Seconds of no typing after RESPONSE_END before the next input event.",
    "library": "none",
    "raw_range": "0..300000 ms",
    "normalize": "clamp(x / 30000, 0, 1)",
    "weights": { "attention": -0.4, "energy": -0.4, "calm": 0.2 },
    "confidence": "medium",
    "rationale": "Silence after the answer points to disengagement or rest."
  },
  {
    "id": "window_blur_rate",
    "name": "Window blur rate",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Window blur events per turn.",
    "library": "none",
    "raw_range": "0..5",
    "normalize": "clamp(x / 3, 0, 1)",
    "weights": { "attention": -0.5, "calm": -0.2 },
    "confidence": "high",
    "rationale": "Leaving the window is a direct signal of divided attention."
  },
  {
    "id": "hidden_time_ratio",
    "name": "Hidden-document time ratio",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Accumulated document hidden time divided by turn duration.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.6, 0, 1)",
    "weights": { "attention": -0.4, "energy": -0.3 },
    "confidence": "medium",
    "rationale": "Time spent on another tab drains focus and drive."
  },
  {
    "id": "mouse_activity_rate",
    "name": "Mouse activity rate",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Throttled pointermove plus click events per 10 s of session.",
    "library": "none",
    "raw_range": "0..100",
    "normalize": "clamp(x / 40, 0, 1)",
    "weights": { "energy": 0.4, "attention": 0.2, "playfulness": 0.2 },
    "confidence": "low",
    "rationale": "Restless pointer motion reads as activation, not necessarily focus."
  },
  {
    "id": "pointer_near_presence_ratio",
    "name": "Pointer near the eyes",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Share of pointer samples within 200 px of the presence/eyes element center.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.5, 0, 1)",
    "weights": { "closeness": 0.3, "attention": 0.3, "playfulness": 0.3 },
    "confidence": "low",
    "rationale": "Hovering near the face reads as engaging with the agent itself."
  },
  {
    "id": "resubmit_duplicate",
    "name": "Duplicate resubmission rate",
    "group": "interaction",
    "source": "turn_timing",
    "compute": "Share of SUBMIT prompts with normalized similarity above 0.9 to the previous prompt.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.5, 0, 1)",
    "weights": { "certainty": -0.3, "attention": -0.3 },
    "confidence": "medium",
    "rationale": "Repeating the same prompt signals a stuck, unsure loop."
  },
  {
    "id": "keystroke_cadence_variance",
    "name": "Keystroke cadence variance",
    "group": "interaction",
    "source": "user_input_events",
    "compute": "Coefficient of variation of inter-key intervals within a prompt.",
    "library": "none",
    "raw_range": "0..3",
    "normalize": "clamp((x - 0.4) / 1.2, 0, 1)",
    "weights": { "calm": -0.3, "certainty": -0.2, "energy": 0.2 },
    "confidence": "low",
    "rationale": "An irregular typing rhythm reads as unsettled."
  },
  {
    "id": "question_rate",
    "name": "Question rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Share of the last 10 prompts containing a question mark, EMA-weighted.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.6, 0, 1)",
    "weights": { "openness": 0.5, "attention": 0.2 },
    "confidence": "high",
    "rationale": "Asking keeps the exchange open and directed at the agent."
  },
  {
    "id": "lexical_entrainment",
    "name": "Lexical entrainment with agent answer",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Jaccard overlap of content words (stopwords removed) between a prompt and the preceding agent answer.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.5, 0, 1)",
    "weights": { "closeness": 0.4, "warmth": 0.3, "attention": 0.2 },
    "confidence": "medium",
    "rationale": "Borrowing the agent's words is linguistic alignment, a closeness cue."
  },
  {
    "id": "topic_shift_score",
    "name": "Topic shift score",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "One minus the Jaccard overlap of content words between the current and previous prompt.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x, 0, 1)",
    "weights": { "openness": 0.5, "attention": -0.4 },
    "confidence": "medium",
    "rationale": "Jumping topics widens exploration but scatters attention."
  },
  {
    "id": "repetition_rate",
    "name": "Self-repetition rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Repeated 3-grams across the last 5 prompts divided by all 3-grams.",
    "library": "winkNLP (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.3, 0, 1)",
    "weights": { "attention": -0.4, "certainty": -0.2 },
    "confidence": "medium",
    "rationale": "Repeating phrasing suggests a stalled, less certain user."
  },
  {
    "id": "confirmation_rate",
    "name": "Confirmation rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Share of prompts of at most 3 words matching yes, ok, yeah, right, sure, got it.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.5, 0, 1)",
    "weights": { "certainty": 0.4, "warmth": 0.3, "closeness": 0.2 },
    "confidence": "high",
    "rationale": "Short affirmations signal agreement and a settled decision."
  },
  {
    "id": "backchannel_rate",
    "name": "Backchannel rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Share of prompts matching hm, mm, ah, i see, ok then.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.4, 0, 1)",
    "weights": { "warmth": 0.4, "closeness": 0.3 },
    "confidence": "low",
    "rationale": "Backchannels are rapport signals that keep the partner talking."
  },
  {
    "id": "abort_signal_rate",
    "name": "Abort-signal rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Share of prompts containing stop, wait, never mind, forget it, cancel.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.3, 0, 1)",
    "weights": { "calm": -0.4, "certainty": -0.3 },
    "confidence": "medium",
    "rationale": "Abort language marks tension and lost confidence."
  },
  {
    "id": "politeness_rate",
    "name": "Politeness markers",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Occurrences of please, thanks, thank you, sorry, excuse me per 100 words.",
    "library": "none",
    "raw_range": "0..15",
    "normalize": "clamp(x / 6, 0, 1)",
    "weights": { "formality": 0.4, "warmth": 0.3 },
    "confidence": "medium",
    "rationale": "Politeness raises formality and signals goodwill."
  },
  {
    "id": "formality_score",
    "name": "Formality score",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Average of binary cues: no contractions, capital I, terminal punctuation, no all-lowercase.",
    "library": "none",
    "raw_range": "0..1",
    "normalize": "clamp(x, 0, 1)",
    "weights": { "formality": 0.5, "closeness": -0.3 },
    "confidence": "high",
    "rationale": "Careful orthography reads as formal and slightly distant."
  },
  {
    "id": "exclamation_rate",
    "name": "Exclamation rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Exclamation marks per 100 words over the last 10 prompts.",
    "library": "none",
    "raw_range": "0..30",
    "normalize": "clamp(x / 20, 0, 1)",
    "weights": { "energy": 0.4, "playfulness": 0.3 },
    "confidence": "medium",
    "rationale": "Exclamations raise perceived activation and lightness."
  },
  {
    "id": "emoji_rate",
    "name": "Emoji rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Emoji code points per 100 characters, matched by Unicode ranges.",
    "library": "none",
    "raw_range": "0..10",
    "normalize": "clamp(x / 5, 0, 1)",
    "weights": { "playfulness": 0.4, "warmth": 0.2 },
    "confidence": "low",
    "rationale": "Emoji are a reliable marker of playfulness in chat."
  },
  {
    "id": "self_disclosure_rate",
    "name": "Self-disclosure rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "First-person singular pronouns plus feeling verbs per 100 words.",
    "library": "none",
    "raw_range": "0..20",
    "normalize": "clamp(x / 10, 0, 1)",
    "weights": { "closeness": 0.4, "warmth": 0.3, "depth": 0.2 },
    "confidence": "medium",
    "rationale": "Talking about oneself deepens closeness and personal depth."
  },
  {
    "id": "hedging_rate",
    "name": "Hedging rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Occurrences of maybe, perhaps, i guess, kind of, sort of, not sure per 100 words.",
    "library": "none",
    "raw_range": "0..15",
    "normalize": "clamp(x / 8, 0, 1)",
    "weights": { "certainty": -0.5, "calm": -0.2 },
    "confidence": "high",
    "rationale": "Hedges mark uncertainty and mild unease."
  },
  {
    "id": "imperative_rate",
    "name": "Imperative rate",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Share of prompts whose first word is a bare verb (show, give, make, tell, explain, list), POS-checked.",
    "library": "compromise (MIT)",
    "raw_range": "0..1",
    "normalize": "clamp(x / 0.6, 0, 1)",
    "weights": { "certainty": 0.3, "energy": 0.3, "formality": -0.2 },
    "confidence": "medium",
    "rationale": "Bare commands are assertive and direct, hence less formal."
  },
  {
    "id": "sentence_length_avg",
    "name": "Average sentence length",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Mean words per sentence over the last 5 prompts, sentence split on terminal punctuation.",
    "library": "none",
    "raw_range": "2..40 words",
    "normalize": "clamp((x - 3) / 25, 0, 1)",
    "weights": { "density": 0.5, "depth": 0.3 },
    "confidence": "medium",
    "rationale": "Longer sentences pack more information and structure."
  },
  {
    "id": "vocabulary_richness",
    "name": "Vocabulary richness (Guiraud index)",
    "group": "discourse",
    "source": "turn_timing",
    "compute": "Unique lemmas divided by square root of token count over the last 5 prompts.",
    "library": "winkNLP (MIT)",
    "raw_range": "2..10",
    "normalize": "clamp((x - 2) / 6, 0, 1)",
    "weights": { "depth": 0.3, "openness": 0.3 },
    "confidence": "low",
    "rationale": "A wider vocabulary reads as deeper and more exploratory."
  }
]
```

## Parameters fed (coverage check)

| Parameter | Fed by |
|---|---|
| tempo | typing_speed_cps, typing_burst_length, long_pause_ratio, median_ikey_interval, think_time_total, turn_interval_median, turns_per_minute |
| density | typing_burst_length, prompt_length_chars, prompt_length_trend, sentence_length_avg |
| warmth | lexical_entrainment, confirmation_rate, backchannel_rate, politeness_rate, emoji_rate, self_disclosure_rate |
| calm | 14 metrics |
| closeness | pointer_near_presence_ratio, lexical_entrainment, confirmation_rate, backchannel_rate, formality_score(−), self_disclosure_rate |
| openness | prompt_length_trend, question_rate, topic_shift_score, vocabulary_richness |
| attention | 12 metrics |
| certainty | 10 metrics |
| playfulness | mouse_activity_rate, pointer_near_presence_ratio, exclamation_rate, emoji_rate |
| formality | politeness_rate, formality_score, imperative_rate(−) |
| depth | 8 metrics |
| energy | 12 metrics |

## Kurz-Tabelle

| id | Parameter (Gewichte) | confidence |
|---|---|---|
| typing_speed_cps | tempo .5 · energy .3 · calm −.2 | high |
| typing_burst_length | energy .4 · tempo .3 · density .2 | medium |
| long_pause_ratio | depth .3 · calm .3 · tempo −.4 | high |
| median_ikey_interval | tempo −.5 · calm .3 · certainty −.2 | medium |
| backspace_ratio | certainty −.5 · calm −.3 | high |
| hold_before_send | certainty −.4 · depth .4 · calm .2 | medium |
| first_key_latency | attention −.4 · depth .3 · calm .2 | medium |
| think_time_total | depth .4 · calm .3 · tempo −.3 | medium |
| interruption_rate | energy .4 · attention −.4 · calm −.3 | high |
| prompt_length_chars | density .5 · depth .3 | high |
| prompt_length_trend | density .4 · openness .3 · energy .2 | low |
| turn_interval_median | tempo −.4 · calm .2 · energy −.2 | high |
| turns_per_minute | tempo .5 · energy .3 | high |
| idle_after_answer | attention −.4 · energy −.4 · calm .2 | medium |
| window_blur_rate | attention −.5 · calm −.2 | high |
| hidden_time_ratio | attention −.4 · energy −.3 | medium |
| mouse_activity_rate | energy .4 · attention .2 · playfulness .2 | low |
| pointer_near_presence_ratio | closeness .3 · attention .3 · playfulness .3 | low |
| resubmit_duplicate | certainty −.3 · attention −.3 | medium |
| keystroke_cadence_variance | calm −.3 · certainty −.2 · energy .2 | low |
| question_rate | openness .5 · attention .2 | high |
| lexical_entrainment | closeness .4 · warmth .3 · attention .2 | medium |
| topic_shift_score | openness .5 · attention −.4 | medium |
| repetition_rate | attention −.4 · certainty −.2 | medium |
| confirmation_rate | certainty .4 · warmth .3 · closeness .2 | high |
| backchannel_rate | warmth .4 · closeness .3 | low |
| abort_signal_rate | calm −.4 · certainty −.3 | medium |
| politeness_rate | formality .4 · warmth .3 | medium |
| formality_score | formality .5 · closeness −.3 | high |
| exclamation_rate | energy .4 · playfulness .3 | medium |
| emoji_rate | playfulness .4 · warmth .2 | low |
| self_disclosure_rate | closeness .4 · warmth .3 · depth .2 | medium |
| hedging_rate | certainty −.5 · calm −.2 | high |
| imperative_rate | certainty .3 · energy .3 · formality −.2 | medium |
| sentence_length_avg | density .5 · depth .3 | medium |
| vocabulary_richness | depth .3 · openness .3 | low |

Nur gelesen, nichts geändert. STOP.
