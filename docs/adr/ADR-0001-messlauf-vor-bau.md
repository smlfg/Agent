# ADR-0001 — Erst bauen: Messlauf vor Anwendungscode

- **Status:** vorgeschlagen (Owner-Entscheidung ausstehend)
- **Datum:** 19.11.2026
- **Bezieht sich auf:** `docs/PROJECT.md`, `tech/CLOUDFLARE_MACHBARKEIT.md`

## Kontext

Die Skizze verlangt „under 1 sec even with TTS". Cloudflares eigene Zahlen
liegen bei 800–950 ms (`llm_ms: 850`, `tts_ms: 200`, `first_audio_ms: 950`).
Ob das im deutschen Betrieb hält, ist unbelegt. Die Designentscheidung vom
19.11.2026 hat Voice fest in den Erstbau aufgenommen — dadurch ist der
Messlauf vom Empfehlungs- zum Pflichtpunkt geworden.

Gleichzeitig ist der deutsche Sprachpfad **nicht geklärt**: Workers AI führt
laut offiziellem Modellkatalog nur drei TTS-Modelle (`aura-1`, `aura-2-en`,
`aura-2-es`). Ein deutschsprachiges TTS-Modell ist **nicht** im Katalog.
`aura-1` hat keine `language`-Option und nur englische Sprecher. Der einzige
mehrsprachige TTS auf Workers AI, `@cf/myshell-ai/melotts`, ist **zum 20.11.2026
zur Abschaltung vorgemerkt** und nicht realtimefähig.

Beim **STT** ist die Lage besser und zugleich klarer: `@cf/deepgram/flux` hat
keinen `language`-Parameter, `@cf/deepgram/nova-3` dagegen schon
(`language: "de"`, `detect_language`). Deutsch im Eingang ist also auf Workers
AI machbar — nur mit einem anderen Modell als im Standard-Beispiel.

Ohne Messung baut man möglicherweise auf einem Weg, der Deutsch nicht kann.

## Entscheidung

**Kein Anwendungscode, bevor ein Messlauf die offenen Fragen beantwortet.**

Der Messlauf ist ein Wegwerf-Experiment: `examples/voice-agent` aus
`cloudflare/agents` klonen, lokal mit `wrangler dev` starten, zwanzig deutsche
Sprachwechsel aufnehmen, `first_audio_ms` auswerten. Er dient **nicht** als
Anwendungscode und geht **nicht** in `src/`.

Der Messlauf beantwortet drei Fragen in einem Durchgang:

1. **T2** — hält „unter 1 Sekunde bis zum ersten Audio" auf Deutsch?
2. **Deutsch** — versteht `flux` (STT) deutsch, und was passiert, wenn
   `aura-1` deutschen Text bekommt?
3. **Stille-Erkennung** — wie verhält sich der 500-ms-Standard-Timeout zur
   modellgestützten `flux`-Turn-Erkennung?

## Konsequenzen

**Positiv**

- Ein Fehlschlag kostet einen Nachmittag, nicht ein halbes Jahr.
- Die drei kritischen Zahlen werden aus einer Quelle, in einem Lauf.
- Falls Deutsch auf `aura-1` nicht funktioniert, ist das **vor** dem Bau
  bekannt und der Fallback (externe TTS) wird geplant statt improvisiert.

**Negativ**

- Der Messlauf braucht einen Klon und damit Plan-Modus plus Owner-Freigabe.
- `wrangler dev` läuft lokal, der Messwert beschreibt also **lokale**
  Cloudflare-Edge-Nähe, nicht Produktionslatenz. Das ist zu notieren.

**Neutral**

- Das Beispiel verwendet `@cf/deepgram/aura-1` und `@cf/deepgram/flux`. Beide
  sind im Katalog bestätigt; die deutsche Tauglichkeit ist es nicht.

## Offen

- Welches deutsche TTS-Modell ist der Ersatz, falls `aura-1` Deutsch nicht
  kann? Kandidaten: Aura-2 mit `-de`-Stimmen (Deepgram-seitig vorhanden, auf
  Workers AI aber nicht im Katalog), oder ein externer Anbieter über
  `agents/voice` (`ElevenLabs`, `Telnyx`, `AssemblyAI` sind im Beispiel
  bereits als STT-Anbieter verdrahtet). → siehe
  [`docs/PLAN-ADREN.md`](../PLAN-ADREN.md), ADR-0004.
- Der parallele Prüfbericht [`docs/CLOUDFLARE-MACHBARKEIT.md`](../CLOUDFLARE-MACHBARKEIT.md)
  belegt gegen den lokalen SDK-Quellcode (`agents@0.27.0`), dass ein
  `TTSProvider`-Adapter für deutsche Ausgabe genügt (≈15 Zeilen). Das ist der
  billigste mögliche Ausweg — vor dem Wechsel des Anbieters (Stufe 4) also
  zwingend zu prüfen.
- Werden die 20 Wechsel im Browser aufgenommen oder über ein Skript? Der
  Browser-Check ist näher an der Realität, das Skript ist reproduzierbar.
