I'll start by reading the mission documents to understand the existing constraints and decisions.
## Agent Z — Prosodie-Ebene (Recherche/Planung, keine Datei geändert)

Stand 19.11.2026. Alle Abrufe heutig; „gemessen" = Drittbenchmark, „Hersteller" = Anbieterangabe, „o. B." = nicht belegt. Repo-Belege: `docs/adr/ADR-0006-zeitvertrag.md`, `docs/missions/…-METRIK-PARAMETER-VERTRAG.md`.

### 1) Kandidaten

| Name | URL | Lizenz | Kosten | Latenz first audio | Prosodie-Steuerung | Nonverbale Laute | Wort-Zeitstempel |
|---|---|---|---|---|---|---|---|
| **ElevenLabs v4 Turbo** | elevenlabs.io/pricing/api | proprietär | $0,04/1k Zeichen | ~100 ms server (Hersteller, Mediane 29.10.26) | Audio-Tags `[whispers]`, `[rushed]`, `[pause]`; kein SSML | `[laughs] [sighs] [exhales] [clears throat]` | **ja**, zeichengenau (`/with-timestamps`) |
| **ElevenLabs Flash v2.5** | ebd. | proprietär | $0,04/1k | ~100 ms server | Tags nur eingeschränkt; v. a. Speed/Stabilität | nein (Tags erst v3/v4) | ja |
| **Cartesia Sonic 3.6** | docs.cartesia.ai | proprietär | ~$50/1M eff. (Pro), Free 20k Credits ≈ 27 min | 166 ms gemessen (Vapi-Benchmark, 19.11.26) | `speed 0.6–1.5`, `volume 0.5–2.0`, `emotion` (Enum, EN), Inline-SSML `<speed>/<volume>/<emotion>` | keine Tags; Emotion nur als Stil | **ja**, Wort + Phonem, im selben Stream |
| **Deepgram Flux TTS / Aura-2** | developers.deepgram.com/docs/tts-voice-controls | proprietär | Aura-2 $0,030/1k (Repo-Recherche 19.11.) | ~200 ms tts_ms im CF-Pfad (Repo, `CLOUDFLARE-…AUDIT`) | `speed` 0.7–1.5; Flux: `{pause:500ms}` nur Batch; **kein SSML** | keine steuerbaren; Aura-2 „fillers based on context" (Model Card) = unkontrolliert | **nein** (Drittanbieter simulieren per CPS) |
| **Gemini 3.8 Flash-Lite TTS** | aistudio.google.com/docs/pricing | proprietär | $6/1M Audio-Token ≈ $0,009/min (bis 31.12.26) | 1,0–2,7 s gemessen/Drittforum | `speech_metadata.style` (freier Satz), Inline-Tags | `<laughs> <sighs> <breath>` (Inline-Events) | o. B. |
| **OpenAI gpt-4o-mini-tts** | developers.openai.com/api/docs/guides/text-to-speech | proprietär | $0,60/1M Text + $12/1M Audio out | nicht publiziert | `instructions` (freier Satz), `speed 0.25–4.0` | keine | nein |
| **OpenAI gpt-realtime-2.1-mini** | developers.openai.com/api/docs/models/gpt-realtime-2.1-mini | proprietär | Audio $10 in / $20 out je 1M Token | nicht publiziert | Voll-duplex, VAD/`interrupt_response` | modellimmanent | nein (Speech-to-Speech, umgeht Textsegmente) |
| **Cloudflare Workers AI `aura-2-en`** | developers.cloudflare.com/workers-ai/models/aura-2-en/ | CF-Resale | $0,03/1k Zeichen | ~200 ms (Repo-Audit) | nur `speaker`, kein SSML, keine Tags | automatisch, nicht steuerbar | nein |
| **Kokoro-82M** | github.com/hexgrad/kokoro | **Apache-2.0** | self-host, $0 | 0,9–1,3 s CPU-first-sound (gemessen, M2) | nur `speed`, `voice` | nein | nein |
| **Piper** | github.com/OHF-Voice/piper1-gpl | Engine **GPL-3.0** (altes `rhasspy/piper` MIT, archiviert) | $0 | 180–430 ms (gemessen) | `length_scale` (Tempo) | nein | nein |
| **Dia 1.6B** | github.com/nari-labs/dia | **Apache-2.0**, EN | self-host GPU | keine Streaming-Zusage (1,6B) | Audio-Prompt-Konditionierung | `(laughs) (sighs) (inhales) (coughs)` u. a. | nein |
| **Orpheus 3B** | github.com/canopyai/Orpheus-TTS | Code Apache-2.0, **Weights = Llama-3.2-Lizenz** | self-host GPU | ~200 ms (Hersteller), ~100 ms mit Input-Streaming | Emote-Tags | Tags für Emotion, nicht Laute | nein |
| **Chatterbox Turbo** | github.com/resemble-ai/chatterbox | MIT, **seit 08/2026 retired** | self-host | 110M-Variante CPU ~3× realtime (Hersteller) | `exaggeration` 0–1.5, `cfg_weight` | `[laugh] [chuckle] [cough]` | nein |
| **Sesame CSM-1B** | github.com/SesameAILabs/csm | Apache-2.0 | self-host GPU | RTF 0,28 auf 4090 (Fork) | Kontext-Audio statt Regler | nein | nein |
| **F5-TTS** | github.com/SWivid/F5-TTS | Code MIT, **Weights CC-BY-NC-4.0** | — | — | — | — | — |
| ~~**Hume Octave 2**~~ | — | — | — | **API am 13.11.2026 abgeschaltet** (Hume-Changelog 02.10.26) | — | — | — |

Ausgeschlossen für dieses Repo: **Piper** (GPL-3.0, Mission-Regel „GPL ausgeschlossen"), **F5-TTS** (NC-Weights), **Hume** (tot). Sesam/Orpheus/Chatterbox/Dia scheiden für Phase 2 an Latenz und Betrieb aus, bleiben aber Referenz für Laut-Katalog.

### 2) Die 12 Parameter als Prosodie-Hebel

Nicht alle 12 sind akustisch. Ehrliche Dreiteilung:

| Stärke | Parameter | Hebel |
|---|---|---|
| **stark** | `tempo` | `rate` (0,9–1,1) + Pausen-Skalar |
| | `energy` | `volume` 0,9–1,15 + Pausen kürzer |
| | `calm` | `rate` ↓, Pausen ↑, keine Lach-Tags, weiche Ausatmung |
| | `warmth` | Stil-Satz („warm, unhurried"), Backchannel-Rate ↑, `volume` leicht ↓ |
| | `playfulness` | Lach-Tag erlaubt, Pitch-Range „lively" |
| | `formality` | Stil „crisp, no fillers", Backchannel aus |
| **mittel** | `certainty` | fallende Endkontur (nur als Stil-Satz), keine „uh" |
| | `closeness` | `volume` ↓, Pausen ↓, „intimate" |
| | `depth` | `rate` ↓, längere Pause vor der Kernaussage |
| **schwach/indirekt** | `density`, `openness`, `attention` | wirken schon im Text (Länge, Frage, Fokus). Akustisch höchstens 1 abgeleiteter Wert; sonst Kostüm |

Regel: **max. 3 Hebel pro Turn**, angewendet am Turn-Ende für den nächsten Turn (Owner-Entscheid „ein Wechsel pro Nachricht"). Ein `ProsodyPlan` ist die Mittelschicht: `{rate, volume, pauseScale, styleText, tags[], breathRate, backchannelRate, laughAllowed}` — jeder Provider-Adapter übersetzt nur, was er kann; was er nicht kann, fällt still weg (kein Fehler, kein Flackern).

### 3) Laut-Katalog

| Laut | Wann | Risiko | Regel |
|---|---|---|---|
| **Einatmen** | vor einem längeren Satz, `calm > 0.6` | am wenigsten auffällig, größter Effekt | max. 1 pro Turn |
| **Ausatmen / Seufzen** | nach einer schweren Antwort, `energy < 0.4` | kitschig, wenn thematisch unpassend | nie nach einer Frage |
| **leises Lachen** | nur `playfulness > 0.7` **und** Text enthält Humor | Kitsch-Grenze Nr. 1 | nie über den Nutzer lachen, nur mit ihm |
| **„mm-hm" (Backchannel)** | während der Nutzer spricht | wirkt nur, wenn es wirklich zuhört; sonst Attrappe | braucht Listening-Modus + Rate-Limit |
| **„hmm" / „uh"** | `certainty < 0.4`, echtes Zögern | Provider erfinden sie sonst selbst (Aura-2) | nur wenn Text es hergibt |
| **Räuspern, Zungenschnalzen, Gähnen, Schlucken** | — | sofort unfreiwillig komisch | **verboten** |

Start mit **drei** Lauten: Einatmen, leises Lachen, Ausatmen. Warnung: die meisten Anbieter liefern Laute nur als Text-Tags; ein Tag, den das Modell nicht kennt, wird vorgelesen oder erzeugt Artefakte (Dia-README warnt ausdrücklich vor Übernutzung).

### 4) Architektur Phase 2

```
DO (eine Uhr, ADR-0006)
  └─ schneidet Segmente {index, text, tServerMs, estMs}
       ├─ transcript_delta → Client (Textpfad, startet sofort)
       └─ Satz → Worker-Route /api/tts → Provider-Adapter
                        └─ audio + words[] → DO speichert Wortzeiten
Client
  prosody.js  (Params → ProsodyPlan, 1× pro Turn)
  speech.js   (AudioContext, Queue, Gain-Rampe 30 ms)
  typewriter  (liest dieselben Segmente)
```

- **TTS läuft serverseitig** (Key nie im Client; DO bleibt Zeitautor). Der Textpfad **wartet nie** auf Audio — der Typewriter bleibt Play-out-Puffer (ADR-0006:48–53).
- **Eine Zeitachse, zwei Uhren**: DO-Zeit plant, `AudioContext.currentTime` spielt. Ein Anker `audioStartPerf ↔ ctx.currentTime` bildet `words[]` auf die Typewriter-Uhr ab. Der Typewriter darf dem Audio höchstens **ein Wort** vorauslaufen und nie zurückfallen.
- **Fallback**: keine Timestamps → Satz sprechen, sobald sein erster Buchstabe sichtbar ist (Muster aus N3).
- **Barge-in**: Gain-Rampe 30 ms, Queue leeren, Provider-`cancel` senden. Achtung: Cartesia-Cancel stoppt nur **noch nicht gestartete** Kontexte — der Client muss selbst verstummen.
- Offen bleibt ADR-0006:91–97: Zeitmarken vom TTS oder DO-geschätzt? Empfehlung: **TTS-Wortzeiten, wenn vorhanden; sonst DO-Schätzung** — und das ehrlich als HYPOTHESE führen.

### 5) Top-2 + Messplan

1. **ElevenLabs v4 Turbo** — Tags, ~100 ms, $0,04/1k, Zeichen-Alignment. Risiko: Tag-Zuverlässigkeit, Kosten, `/with-timestamps` vs. WebSocket muss geprüft werden.
2. **Cartesia Sonic 3.6** — echte Zahlenregler (nicht nur Prosa), Wort- **und** Phonemzeiten im selben Stream, 166 ms gemessen. Risiko: `emotion` ist grob und „guidance, not strict".

Lokal (Kokoro) nur als Privacy-/Nullkosten-Fallback, nicht als Erstweg: >1 s erster Ton, keine Zeitmarken.

**Messplan** (`metrics/voice-bench.json`): 3 Texte (3/8/15 s), 20 Turns je Provider, aus derselben Worker-Region. Messgrößen: `first_chunk_ms` (Server), `first_audio_ms` (Client: `t_send → erster hörbarer Sample`), `p50/p90`; `word_skew_ms` = |gesprochenes Wort − getipptes Wort|; `stop_to_silence_ms` bei Barge-in; `cost_per_turn` aus Zeichenzahl. Abnahme: `first_audio_ms` p90 ≤ 800 ms, `word_skew_ms` p90 ≤ 120 ms, `stop_to_silence_ms` ≤ 80 ms.

### 6) Owner-Fragen (nur Produkt)

1. **Stimme**: eine feste Identität, oder darf sie mit `warmth`/`energy` hörbar wechseln (Risiko: jede Antwort ein anderer Mensch)?
2. **Lachen**: gar nicht, nur mit dem Nutzer, oder auch über sich selbst?
3. **Backchannel**: darf der Agent Geräusche machen, *während* der Nutzer spricht — oder bleibt er hörbar still, bis er antwortet?
4. **Autoplay**: Stimme erst nach dem ersten Klick (Browser-Regel), oder erst ab dem zweiten Turn?
5. **Budget**: kostenpflichtiger Anbieter bis ~1 Cent/Turn erlaubt, oder muss es gratis/self-hosted bleiben?
6. **Akzent**: fest britisch, fest amerikanisch, oder „neutral"?
7. **Widerspruch**: wenn die Stimme ein Wort sagt, das noch nicht getippt ist — ist das Audio die Wahrheit oder der Text?

STOP.
