# Kosten: TTS-Anbieter (deutsch, geparkt) und Workers-AI-Voice-Betrieb

Stand: 19.11.2026. Recherche im Auftrag von Samuel („11labs und es gibt noch
viele weitere anbieter — subagent soll mal die kosten recherchieren").
Alle Abrufe am 19.11.2026 gegen die genannten Primärquellen. Nach der
Beleg-Regel aus [../INTENT-TECHNIK.md](../INTENT-TECHNIK.md): keine erfundenen Zahlen; die
Ungeklärt-Liste am Ende nennt Lücken ausdrücklich.

## Teil A — Deutsche TTS-Anbieter (für die geparkte deutsche Pipeline)

| Anbieter | Free-Tier | Leitpreis | Deutsch? | Quelle |
|---|---|---|---|---|
| **ElevenLabs** | 10.000 Credits/Monat (~10 Min TTS); Attribution Pflicht („elevenlabs.io" im Titel), keine kommerzielle Nutzung im Free-Tier | Creator $22/121k Credits ≈ **$0,18 je 1k Zeichen** (abgeleitet); Pro $99/600k, Scale $299/1,8M; Black-Friday-Promo bis 1.12.2026 | **Ja** (V2/V3/V4 multilingual, 74 Sprachen) | elevenlabs.io/pricing; elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform |
| **Deepgram** | **$200 Free-Credit bei Registrierung**, läuft nicht ab, keine Kreditkarte | **Aura-2: $0,030 je 1k Zeichen**, Aura-1: $0,015/1k, Flux-TTS: $0,045/1k (Pay-as-you-go, Growth −10 %); Flux-TTS-Promo: $1 Gutschrift je $1 bis 31.12.2026 (max $500) | **Ja, stark:** Aura-2 mit 7 deutschen Stimmen (`aura-2-julius-de`, `aura-2-viktoria-de`, …); Flux-TTS mit 13 deutschen Stimmen inkl. Textnormalisierung Deutsch | deepgram.com/pricing; developers.deepgram.com/docs/tts-models; developers.deepgram.com/docs/flux-tts/voices |
| **OpenAI TTS** | kein TTS-spezifischer Free-Tier belegt | tts-1: **$15 je 1M Zeichen**, tts-1-hd: $30/1M; gpt-4o-mini-tts token-basiert ($0,60/1M Text-In + $12/1M Audio-Out). **Deprecated, Abschaltung 6.1.2027** (Nachfolger über Realtime API, Audio-Out $20/1M Tokens) | Ja (Whisper-Sprachliste; Stimmen auf Englisch optimiert) | platform.openai.com/docs/pricing; developers.openai.com/api/docs/guides/text-to-speech |
| **Google Cloud TTS** | Standard/WaveNet: **4 Mio Zeichen/Monat frei**; Neural2/Chirp-3-HD/Studio: 1 Mio/Monat | Standard & WaveNet **$4 je 1M Zeichen**; Neural2 $16/1M; Chirp 3 HD $30/1M; Gemini-TTS token-basiert | Ja (de-DE-Stimmen) | cloud.google.com/text-to-speech/pricing |
| **Microsoft Azure Speech** | F0: Neural **0,5 Mio Zeichen/Monat frei** (dauerhaft) + 5 h STT/Monat; F0 gedrosselt ~20 Req/Min | Neural **$15 je 1M Zeichen**, Neural HD $22/1M (nur via Retail-Prices-API belegt, s. Ungeklärt) | Ja (de-DE Neural-Stimmen) | azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/ |
| **Amazon Polly** | Standard: **5 Mio Zeichen/Monat frei** (dauerhaft); Neural 1 Mio/Monat, Generative 100k, Long-Form 500k (erste 12 Monate) | Standard **$4 je 1M Zeichen**, Neural $16/1M, Generative $30/1M, Long-Form $100/1M | Ja (de-DE Standard-/Neural-Stimmen) | aws.amazon.com/poly/pricing/ |
| **Cartesia (Sonic)** | Free: **20.000 Credits/Monat ≈ 27 TTS-Minuten** (Sonic-3.6), 2 parallele Requests | Pro $5/100k Credits (~133 Min), Startup $49/1,25M, Scale $299/8M | Ja — Sonic 3.6: 44 Sprachen inkl. `de` | cartesia.ai/pricing; docs.cartesia.ai/build-with-cartesia/tts-models/latest |
| **PlayHT** | — | — | — | **Eingestellt** (Meta übernahm PlayAI 07/2025; API aus seit 26.7.2025, Service tot seit 31.12.2025). Entfällt als Option. |

### Open-Source-Selbsthost (nur Übersicht, keine Empfehlung)

- **Piper** (MIT): **Deutsch ja** — 8 `de_DE`-Stimmen (u. a. thorsten
  low/medium/high, thorsten_emotional, ramona, kerstin, karlsson, pavoque).
  Läuft auf eigenem Server bis Raspberry Pi (ONNX, CPU). Repo archiviert
  (06.10.2025), Fortsetzung unter github.com/OHF-Voice/piper1-gpl.
  **Auf einem Cloudflare Worker unrealistisch** (Workers AI hostet nur
  Cloudflares Katalog; eigene ONNX-Modelle nicht deploybar) — nur eigener
  Server/Container. Quellen: github.com/rhasspy/piper; VOICES.md.
- **Kokoro-82M** (Apache-2.0): **Deutsch offiziell nicht unterstützt**
  (lang_codes nur en/es/fr/hi/it/ja/pt-br/zh). Für Deutsch unbrauchbar ohne
  Community-Finetunes. Quelle: github.com/hexgrad/kokoro.

### Lesart für die geparkte Pipeline

Für einen ersten deutschen Voice-Weg wären die attraktivsten Kandidaten nach
Kostenbild: **Deepgram** (einmalig $200 gratis, deutsche Aura-2-Stimmen,
$0,030/1k) und **Google/Polly** (große dauerhafte Free-Tiers, aber ohne fertige
Adapter-Klasse im Agents-SDK). Für ElevenLabs existiert die fertige Klasse
`ElevenLabsTTS` — $0,18/1k ist aber ~6× Deepgram Aura-2. Erschwernis bei allen
nicht-SDK-Anbietern: ein `TTSProvider`-Adapter wäre Eigenbau-Glue (Whitelist,
LOC-Budget beachten).

## Teil B — Workers-AI-Eigenkosten für den Voice-Betrieb (Erstbau Englisch)

Quelle für alle Zahlen: https://developers.cloudflare.com/workers-ai/platform/pricing/
(Seitenstand 18.11.2026, Abruf 19.11.2026).

- **$0,011 je 1.000 Neurons** — bestätigt. Freikontingent **10.000 Neurons/Tag**
  (Free und Paid), Reset 00:00 UTC.

**Neuron-Kosten je Einheit (Auszug):**

| Modell | Preis | Neurons |
|---|---|---|
| STT `flux` (WebSocket) | $0,0077/Audiominute | **700 / Min** |
| STT `nova-3` (HTTP / WS) | $0,0052 / $0,0092 je Min | 472,73 / 836,36 je Min |
| STT `whisper` | $0,0005/Min | **41,14 / Min** |
| TTS `aura-1` | $0,015 je 1k Zeichen | **1.363,64 / 1k** |
| TTS `aura-2-en` | $0,030 je 1k Zeichen | 2.727,27 / 1k |
| LLM `llama-3.2-1b` | — | 2.457 In / 18.252 Out je 1M Tokens |
| LLM `glm-4.7-flash` | — | 5.500 In / 36.400 Out je 1M Tokens |

**Was heißt 10.000 Neurons/Tag konkret?** Annahmen für einen kompletten
Voice-Wechsel: 10 s Nutzeraußerung (STT), LLM 600 In- + 150 Out-Tokens,
Antwort 300 Zeichen TTS (≈ 20 s Sprache):

```
flux STT:  700 × 10/60                          ≈ 116,7 Neurons
LLM:      2.457 × 0,0006 + 18.252 × 0,00015    ≈   4,2 Neurons
aura-1:   1.363,64 × 0,3                       ≈ 409,1 Neurons
                                              ─────────────
Summe ≈ 530 Neurons je Wechsel
10.000 / 530 ≈ 18 komplette Voice-Wechsel pro Tag gratis
Darüber: ≈ $0,0058 je Wechsel (~½ Cent)
```

Varianten: mit `whisper` statt `flux` (STT) ≈ 420 Neurons → **~23–24
Wechsel/Tag**; mit `aura-2-en` statt `aura-1` ≈ 939 Neurons → **~10 Wechsel/Tag**.
**TTS dominiert (~77 % der Neurons)** — die Antwortlänge ist der Hebel:
600 statt 300 Zeichen halbiert die Gratis-Wechsel auf ~9–10/Tag.

**Einordnung:** Für den Messlauf (20 Wechsel an einem Tag) ist das
Freikontingent locker ausreichend (~10.600 Neurons; knapp drüber, dann ~6 Cent).
Für eine öffentliche Startseite bedeutet es: ~18 kostenlose Voice-Besuche/Tag
— für einen echten Launch zu eng, für einen Beta-Betrieb mitbegrenzt brauchbar.

**Korrektur vom 19.11. (gemessen, nicht gerechnet):** Die Turn-Rechnung greift
zu kurz — **flux-STT rechnet pro gestreamter Audiominute**, unabhängig davon,
ob Turns entstehen. Eine durchgehend offene Mikrofon-Session verbraucht ~700
Neurons/Minute: **10.000 Neurons/Tag ≈ 14 Minuten offenes Mikrofon.** Der
Messlauf des 19.11. hat das Tageskontingent allein über live geschaltete
Mikrofone (zwei 15-Minuten-Handoff-Fenster plus Debugging) verbraucht
(`4006: you have used up your daily free allocation of 10,000 neurons`,
Beleg: `MESSPROTOKOLL-2026-11-19.md`). Produktkonsequenz für den Erstbau:
Push-to-Talk bzw. VAD-Gating ist nicht nur UX, sondern **Kosten-Necessität** —
ein dauerhaft lauschender Agent ist auf dem Free-Plan nach Minuten am Limit.

**Rate-Limits bestätigt** (developers.cloudflare.com/workers-ai/platform/limits/):
ASR **720 req/min**, Text Generation **300 req/min** (Defaults); 20/50 req/min
nur für Paid-Modelle; Reset täglich 00:00 UTC.

## Ungeklärt-Liste

1. Azure Pay-As-You-Go-Preise ($15/1M Neural) nur via Retail-Prices-API belegt,
   nicht direkt von der Microsoft-Seite ablesbar (rendert per Skript).
2. ElevenLabs exakter API-Preis je Modell/1k Zeichen (V4, Flash $0,04/1k lt.
   Dritquelle): aus der Preisseite nur per Credit-Ableitung; die separate
   API-Preisseite wurde nicht abgerufen.
3. de-DE-Stimmen bei Google/AWS/Azure heute nicht einzeln gegen die Voice-Listen
   geprüft (allgemein dokumentiert).
4. OpenAI TTS-Free-Tier: keine verlässliche Primärquelle gefunden.
5. Workers-Paid-Plan-Mindestpreis (üblich $5/Monat): heute nicht verifiziert.
6. Ob `flux`-STT auf Workers AI auch als HTTP/REST-Variante existiert: aus der
   Preisliste nicht ersichtlich (nur WebSocket gelistet).
