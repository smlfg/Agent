# Messlauf-Plan: Voice-Latenz auf dem Default-Stack (Englisch)

Stand: 19.11.2026, zweite Fassung. Status: **PLAN — nicht ausgeführt.** Der Lauf
braucht Plan-Modus und die Freigabe des Owners
([CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md](CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md) „Nächster Schritt";
[LUECKEN-2026-11-12.md](LUECKEN-2026-11-12.md) Z. 92–93).

**Änderung gegenüber der ersten Fassung (gleicher Tag):** Samuel hat entschieden,
dass die Voice-Pipeline **auf Englisch** läuft („kein Deutsch, das ist jetzt
nicht so ein schlimmer Wechsel"). Damit entfällt die deutsche Phase komplett:
der Default-Stack (`@cf/deepgram/flux` + `@cf/deepgram/aura-1`) ist genau der
Baustein-Satz, der gemessen wird. Der Plan ist wieder einstufig; die deutsche
Pipeline ist unten geparkt.

## Ziel

Die offene Skizzen-Anforderung „under 1 sec even with TTS" durch **Messung statt
Raten** klären, bevor irgendeine Build-Entscheidung fällt. Beantwortet: T2
(Latenzbudget, [INTENT-TECHNIK.md](INTENT-TECHNIK.md) Z. 20), Stille-Erkennung, und ob der
lokale Lauf (Voice-WebSocket) funktioniert. Die Deutsch-Frage ist durch
Samuels Entscheidung geklärt (Englisch akzeptiert), nicht durch Messung.

## Befund vom 19.11.2026 — warum Englisch der Default ist

Recherche gegen Primärquellen (alle URLs abgerufen am 19.11.2026); dieser
Befund hat zur Sprach-Entscheidung geführt und bleibt als Beleg dokumentiert:

1. **`@cf/deepgram/flux` (STT) ist auf Workers AI nur Englisch.** Cloudflare-
   Maintaineraussage: „Workers AI currently only hosts the English-language
   model" (Issue, closed als not planned). Die Binding kennt kein
   `language`/`language_hint`.
   https://github.com/cloudflare/agents/issues/1441
2. **`@cf/deepgram/aura-1` (TTS) ist nur Englisch** (Modellseite listet nur
   englische Stimmen; Deepgram führt Aura-1 ausschließlich als `-en`-Stimmen).
   Deutsch gäbe es erst bei Aura-2/Flux-TTS — nur über Deepgrams eigene API,
   **nicht** über Workers AI.
   https://developers.cloudflare.com/workers-ai/models/aura-1/
   https://developers.deepgram.com/docs/tts-models
3. **Keine deutsche TTS auf Workers AI:** Katalog bietet nur aura-1,
   aura-2-en, aura-2-es und melotts; melotts unterstützt kein Deutsch
   (nur EN/ES/FR/ZH/JP/KR) und ist ohnehin zur Deprecation am 20.11.2026
   markiert. https://developers.cloudflare.com/workers-ai/models
   https://github.com/myshell-ai/MeloTTS
4. **Limits präzisiert** (korrigiert den Worker-Bericht „20 req/min pauschal"):
   Task-Typ-Limits gelten unabhängig vom Modell — ASR **720 req/min**, Text
   Generation **300 req/min**; die **20/50 req/min** gelten nur für Paid-Modelle,
   je Konto und Modell. Inferenzen im lokalen Dev-Modus zählen mit gegen Limits
   und Neuronen-Budget (10.000 Neurons/Tag Freikontingent, Reset 00:00 UTC).
   Für 20 Wechsel unkritisch.
   https://developers.cloudflare.com/workers-ai/platform/limits/
   https://developers.cloudflare.com/workers-ai/platform/pricing/
5. **Default-LLM des Beispiels braucht Paid:** `@cf/deepseek-ai/
   deepseek-v4.1-flash-1017` ist „not available through standard Workers Free
   billing" — auf einem Free-Account schlägt der LLM-Pfad fehl; dann gehört das
   LLM im Klon auf ein Free-fähiges Modell getauscht (z. B. `gpt-oss-20b` oder
   `llama-3.2-1b-instruct` aus dem Katalog kleiner Modelle,
   [research/cloudflare-bausteine.md](research/cloudflare-bausteine.md) Z. 169–179).
   https://developers.cloudflare.com/workers-ai/models/deepseek-v4.1-flash-1017/

## Bestätigung durch SDK-Nachweis (19.11., Missions-Artefakt)

Die abgeschlossene HAI-Mission „Cloudflare-Machbarkeit für Agentfähig …"
(`M-20261119T160534-30b4d0f9`, Audit `A-20261119T161858-753a2d1e`) hat die
Befunde am lokal installierten SDK (`agents@0.27.0` in `claudeflareworkerhaus`)
verifiziert — [CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md](../docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md),
sha256 am 19.11. gegen das Audit verifiziert:

- **Deutsches STT ist SDK-seitig möglich:** `WorkersAINova3STT` reicht
  `language` (BCP-47) direkt an `ai.run("@cf/deepgram/nova-3", …)` durch und
  implementiert dasselbe `Transcriber`-Interface wie `WorkersAIFluxSTT`.
- **Deutsches TTS braucht einen `TTSProvider`-Adapter** — fertige Klassen
  existieren (`ElevenLabsTTS`, `TelnyxTTS`); das Interface ist offen.
- **Stille-Erkennung stackt nicht auf die Server-Latenz:** der Server
  ignoriert `end_of_speech`; das Turn-Ende bestimmt das STT-Modell
  (`endpointingMs: 300`). Entkräftet die +500-ms-Sorge.
- **Typewriter-Synchronisation ist möglich:** LLM-Text-Token (`transcript_delta`)
  kommen vor dem Audio beim Browser an; das Frontend kann den Wortlängen-
  Typewriter darauf synchronisieren.
- **Proaktives Nachsprechen existiert:** `this.speak(connection, text)` /
  `this.speakAll(text)` — neben dem bestätigten stillen State-Sync-Pfad.
- **Deprecations zum 20.11.2026** (praxisrelevant für die Modell-Wahl):
  `kimi-k2.6`, `llama-3.1-8b-instruct-fp8`, `llama-3.2-3b-instruct`,
  `qwen3-30b-a3b-fp8`, `melotts`. Alternativen ohne Deprecation:
  `glm-4.7-flash`, `gpt-oss-20b`, `llama-4-scout-17b`, `llama-3.3-70b-fast`.

## Non-Goals

- Kein Eigenbau: nur das vorgefundene Beispiel, konfiguriert, nicht erweitert.
- Kein Deploy; alles läuft lokal (`vite dev`: Worker und Durable Object lokal,
  KI-Inferenz immer remote — es wird also die echte Cloud-Latenz gemessen).
- Keine Build- oder Provider-Entscheidung aus einem Lauf allein; die Messwerte
  fließen zurück in [DESIGN-DECISIONS.md](../docs/DESIGN-DECISIONS.md).
- Keine Änderung an Agentfähig-Quellen außerhalb von `tech/` (dieser Plan und
  das Messprotokoll).

## Phase 0 — Voraussetzungen und Checks

1. **Freigabe einholen:** Klon nach `~/Projects/05_INBOX/cloudflare-agents`
   (Zielordner gemäß [UPSTREAM-SEARCH-cloudflare.md](UPSTREAM-SEARCH-cloudflare.md)
   Z. 40; auf Wunsch Samuels auch innerhalb des Projekts). Plan-Modus +
   Owner-Freigabe ist Pflicht.
2. **Node.js 18+** (offizielle Vorgabe der Agents-Doku; das Repo pinnt keine
   `engines`-Version). https://developers.cloudflare.com/agents/examples/voice-agent/
3. **Cloudflare-Account mit Workers-AI-Zugriff.** Samuel: „free ist immer besser
   als paid" — **Annahme für den Lauf: Free-Plan.** Damit läuft das Default-LLM
   (deepseek-v4.1-flash, Paid-only) sehr wahrscheinlich nicht; der LLM-Tausch
   im Klon auf ein Free-fähiges Modell wird als erwarteter Schritt geführt,
   nicht nur als Ausweichpfad. Kandidaten ohne Deprecation und mit vollem
   300-req/min-Limit (laut
   [CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md](../docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md)):
   `@cf/zai-org/glm-4.7-flash` oder `@cf/openai/gpt-oss-20b`. Der
   Account-Status wird im Lauf geprüft und protokolliert.
4. **Auth für die Remote-AI-Binding:** `wrangler login` bzw.
   `CLOUDFLARE_API_TOKEN`. Die Doku sagt es nicht explizit; im Lauf prüfen und
   protokollieren (offener Punkt).
5. Start laut Beispiel: `npm install` + `npm run start` (vite dev). Keine
   API-Keys nötig für den Workers-AI-Pfad; externe STT-Provider (AssemblyAI,
   Telnyx, ElevenLabs) bleiben unbenutzt.
   https://raw.githubusercontent.com/cloudflare/agents/main/examples/voice-agent/README.md

## Phase 1 — Der Lauf (20 englische Sprach-Wechsel)

**Ablauf:** Browser-Mikrofon nach Klick freigeben; **20 englische
Sprach-Wechsel** (kurze Frage → Antwort). Je Wechsel protokollieren:

- `llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms`
- Stage-Timings: speech-to-final-transcript, model-to-first-text,
  TTS-to-first-audio, total turn duration
- Outcome: `completed` / `no_output` / `aborted`
- Stille-Erkennung beobachten: Client-Default 500 ms (`silenceDurationMs`),
  serverseitige Turn-Erkennung des STT-Modells.

**Beantwortet:** T2 (wo geht die Zeit hin — Cloudflares Budget 40 + 300 + 400
+ 150 = 890 ms, [CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md](CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md) Z. 73–81),
Stille-Erkennung, ob der lokale Voice-Lauf funktioniert, und die Free/Paid-Frage
aus Phase 0.

**Ausweichpfad, falls die Messung über 1 s landet** (bereits dokumentiert,
[ABGLEICH-DESIGN-TECHNIK.md](ABGLEICH-DESIGN-TECHNIK.md) Z. 88–92): kleineres Front-Modell oder Cloudflare
Realtime Agents (WebRTC, offene Beta). Diese Pfade sind keine Entscheidung,
nur Reserve.

## Geparkt: deutsche Pipeline

Nur aktivierbar, falls Deutsch später doch gewünscht wird — Samuel:
„schönes Feature, aber wenn es nicht geht, dann halt Englisch". STT: `nova-3`
mit `language: "de"` — **SDK-seitig belegt** (siehe Bestätigung oben), kein
Adapter-Eigenbau nötig. TTS: kein deutsches Angebot auf Workers AI → externer
Provider; fertige Adapter-Klassen existieren: `ElevenLabsTTS`
(`@cloudflare/voice-elevenlabs`, von Samuel genannt) und `TelnyxTTS`
(`@cloudflare/voice-telnyx`); weitere Kandidaten: Deepgram Aura-2/Flux-TTS
per API und andere Anbieter. **Kostenrecherche abgeschlossen (19.11.):**
[kosten-tts-voice.md](research/kosten-tts-voice.md) — Deepgram ist der
Preis-Leader (einmalig $200 Free-Credit, Aura-2 $0,030/1k Zeichen, deutsche
Stimmen), ElevenLabs ≈ $0,18/1k (aber einzige fertige SDK-Klasse);
Große-Cloud-Free-Tiers (Google 4 Mio, Polly 5 Mio Zeichen/Monat) brauchen
jeweils Eigenbau-Adapter. Braucht dann erneut Samuels Provider-Entscheidung
und Freigabe des kostenpflichtigen Dienstes.

## Messprotokoll und Auswertung

- Protokoll nach `tech/MESSPROTOKOLL-<Datum>.md`: je Wechsel eine Zeile,
  Rohwerte ungeschönt; Turns nur mit Begründung aussortieren (z. B. Outcome
  `aborted`). Keine erfundenen Zahlen ([INTENT-TECHNIK.md](INTENT-TECHNIK.md) Z. 36–37).
- Auswertung: Min / Median / P90 von `first_audio_ms` über 20 Wechsel.
  Vergleichspunkte: Cloudflare-Budget 890 ms, Skizzenwunsch „under 1 sec"
  (Skizze Z. 119), Pipecat-Referenz 500–800 ms
  ([research/konkurrenz.md](research/konkurrenz.md)).
- **Latenz-Kriterien werden aus den Messwerten abgeleitet** (Entscheidung 5 vom
  19.11.), nicht vorab erfunden.

## Budget und Stop-Kriterien

- Vorschlag (überprüfbar): Phase 0 + Phase 1 ≤ 2 h reine Arbeitszeit.
  Überschreitung sichtbar melden, keine Gates umgehen.
- Beispiel läuft nach ca. 1 h Fehlersuche nicht lokal → **BLOCKED** mit
  Fehlermeldung und Log-Ausschnitt; kein Debugging-Fork, kein Eigenbau.
- Paid- oder Key-Wand ohne Freigabe → Stop und Rückfrage bei Samuel.

## Offene Punkte

- Free oder Paid: Cloudflare-Account-Status (entscheidet über das LLM).
- Ob die Remote-Binding im lokalen Modus zwingend `wrangler login` verlangt.
- Ob die Task-Typ-Limits (720/300 req/min) pro Konto oder global gelten
  (für 20 Wechsel ohnehin unkritisch).

---

## Nachtrag 19.11.2026 (abends) — was die Messgröße misst

**Status: Befund + Vorschlag. Kein Teil des freigegebenen Plans.** Der Plan oben
bleibt unverändert; die Vorschläge brauchen die Freigabe des Owners. Quelle der
Recherche: [`research/PRIOR_ART_REPORT.md`](../research/PRIOR_ART_REPORT.md).

### Befund 1 — `first_audio_ms` ist eine Servergröße (VERIFIED)

Die Turn-Metriken des SDK laufen laut Doku
([`docs/agents/voice.md`](https://github.com/cloudflare/agents/blob/main/docs/agents/voice.md),
gelesen 19.11.2026) auf der **Worker-Uhr**, überlappen und sind **nicht
additiv**. `finalInputToFirstAudioMs` bezeichnet „finales Transkript → erstes
**gesendetes** Audiopaket“. Der Plan wertet `first_audio_ms` aus; die aktuelle
Doku führt die vier kompakten Felder nicht mehr einzeln, sondern
`VoiceTurnMetrics`. Dass beide Namen dieselbe Größe meinen, ist **nicht wörtlich
belegt** und vor dem Lauf zu klären.

**Folge:** Der Plan misst die Pipeline bis zum Versand, nicht den Beginn
hörbarer Antwort im Browser. Netz, Decoder und Wiedergabepuffer fehlen.

### Befund 2 — Wiedergabefehler bleiben in dieser Metrik unsichtbar (VERIFIED)

- [`cloudflare/agents#1747`](https://github.com/cloudflare/agents/pull/1747)
  (closed 12.06.2026): hörbare Klicks an jeder Audiopaket-Grenze, weil der
  nächste Block auf ein `ended`-Event wartete.
- [`#1816`](https://github.com/cloudflare/agents/pull/1816) (closed 25.06.2026):
  zweite Antwort nach einer Gesprächspause in Zeitlupe, verursacht durch eine
  wiederverwendete Wiedergabe-Brücke; gefunden an einem Messestand-Demo.

Beide wären in `first_audio_ms` unauffällig geblieben, weil sie **nach** dem
ersten Paket passieren.

### Befund 3 — Erfassungsweg offen (Befund im Arbeitsbaum, nicht committet)

[`MESSPROTOKOLL-2026-11-19.md`](MESSPROTOKOLL-2026-11-19.md), Laufversuch 2:
`turn_metrics` ist im unveränderten Beispiel nicht sichtbar (keine Anzeige für
Text-Turns, keine WS-Aufzeichnung, kein Treffer im Observability-Store). Das
betrifft die Annahme in [`EXECUTION_PLAN-M1-MESSLAUF.md`](EXECUTION_PLAN-M1-MESSLAUF.md) §1, die Werte
seien „ohne Codeänderung ablesbar“. Nicht in diesem Lauf geprüft.

### Vorschlag (RECOMMENDED — nicht beschlossen)

1. **Zwei Messnähte je Turn:** Worker-Wert **und** Client-Zeitstempel (Ende der
   Äußerung → erster hörbarer Ton). Gate auf die Client-Zahl; Median **und** p90.
2. **Reproduzierbarkeit:** Commit-SHA, `agents`-Version und **effektive
   Modell-ID** protokollieren. Nicht das UI-Label: im Arbeitsbaum belegt, dass
   es nach dem Modelltausch das falsche Modell anzeigt.
3. **Kriterium weiterhin erst nach der Messung** ableiten (unverändert).

### Unverändert

Scope, 20 Wechsel, Sprache Englisch, Non-Goals und Stop-Kriterien. Keine
Anwendungscode-Änderung durch diesen Nachtrag.

### Ergänzung (Konsolidierung 19.11.) — p95, Kaltstart, Fehlerquote

**RECOMMENDED — nicht beschlossen.** Betrifft die Auswertung, nicht den Scope.

- **n = 20 trägt keinen p95.** Bei 20 Werten ist „p95" praktisch das Maximum.
  Entweder n erhöhen (Vorschlag: ≥ 50 warme Turns) oder ausdrücklich nur
  Median/P90/Max berichten und p95 als „indikativ, n zu klein" kennzeichnen.
- **Kalt und warm trennen.** Kaltstart = erster Turn nach ≥ 10 min Idle bzw.
  nach Instanz-Evakuierung; mindestens 10 kalte Turns separat ausweisen.
- **Fehlerquote mit Nenner.** Timeout vorab definieren (Vorschlag: keine hörbare
  Antwort in 10 s), `no_output`/`aborted`/ungültige Turns getrennt zählen.
- **Ungültig ist kein Messwert.** Account-/Quota-Fehler, nicht verfügbares
  Modell, keine erkannte Sprache, defekter Messaufbau → Lauf INVALID, keine
  Zahl. Laufversuch 1 und der STT-Blocker fallen darunter.

Die Messgröße selbst (hörbarer Ton statt Server-Versand) steht bereits im
Nachtrag oben; hier kommt nur die Statistik hinzu.
