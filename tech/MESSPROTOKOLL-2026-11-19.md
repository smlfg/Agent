# Messprotokoll: Voice-Lauf examples/voice-agent (Englisch)

Datum: 19.11.2026. Plan: [MESSLAUF-PLAN.md](MESSLAUF-PLAN.md), Verdict des
Plan-Validators: ACCEPT ([PLAN_VALIDATION_REPORT.md](PLAN_VALIDATION_REPORT.md),
Attempt 1/2, Build Release: allowed). Council-Score: 0.792 (SCORE_OK, 3 Jurymodelle,
Evidence: `03_HAI/workbench/plan-council/out/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`,
Kopie im Projekt: [`evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`](evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json)).

## Setup-Belege (Phase 0)

| Punkt | Befund |
|---|---|
| Node | v22.23.1 (Vorgabe: 18+) ✅ |
| Klon | `git clone --depth 1 https://github.com/cloudflare/agents` → `~/Projects/05_INBOX/cloudflare-agents` (Owner-Freigabe 19.11.) |
| Install | `npm install --legacy-peer-deps` — **Abweichung 1 vom unveränderten Beispiel:** Upstream-Peer-Konflikt (`agents@0.33.0` ↔ `react@19.3.1`, ERESOLVE); nur Install-Flag, keine Code-Änderung |
| Fix 2 | Erster Server-Start scheiterte: `agents` importiert `@modelcontextprotocol/client@2.4.0` (optionaler Peer), den `--legacy-peer-deps` überspringt. **Abweichung 2:** Paket explizit installiert (`npm i --legacy-peer-deps @modelcontextprotocol/client@2.4.0`, trägt sich in package.json des Klons ein) — Install-Fix, kein Code geändert |
| Auth | `npx wrangler whoami`: eingeloggt (OAuth, Account smlflg@gmail.com, Scope `ai (write)` vorhanden) ✅ — der offene Punkt „Remote-Binding-Auth" ist damit geklärt |
| Account-Plan | **geklärt am 19.11.: Free.** Der Default-LLM `deepseek-v4.1-flash-1017` ist Paid-only und antwortet auf diesem Account nicht — Beleg in „Laufversuch 1" unten |
| Start | `npm run start` (vite dev; Worker + DO lokal, KI-Inferenz remote) |
| Fix 3 | **Methodenwechsel (Owner-freigabe 19.11.):** Nach STT-Instabilität im lokalen Modus (Flux-STT-WebSocket starb wiederholt: „Network connection lost"; Ursache vom SDK versteckt, cloudflare/agents#2377; Remote-Session-ENOTFOUND api.cloudflare.com als Symptom) entschied Samuel: **Beispiel deployen und messen** — die Cloudflare-Doku empfiehlt Deploy für stabile WebSocket-Flows. Abweichung vom Planpunkt „Kein Deploy", ausdrücklich freigegeben |
| Account-Plan (Ergebnis) | **Free, empirisch bestätigt:** Server-Fehler `5035: Model @cf/deepseek-ai/deepseek-v4.1-flash-1017 is not available on the Workers Free plan`. Qwen (`@cf/qwen/qwen3.8-27b`) läuft auf Free (Doku: nicht auf der Paid-only-Liste; Live-Test bestätigt) |

## Laufversuch 1 — gescheitert, keine Messwerte

Datum: 19.11.2026, Serverstart 17:45, Fehler ab 17:47 (ursprünglich „18:47"
notiert; siehe Gegenprüfung am Ende). Server lief, Sprachverbindung
stand, User-Turns kamen an — der LLM-Pfad antwortete in diesem Fenster nie.
Dieser Lauf ist **nicht** die Messung; er erklärt, warum die Tabelle darunter
leer ist.

| Befund | Beleg |
|---|---|
| **5 User, 0 Assistant** — nur im Fenster 17:47:24–17:50:49, nicht für die ganze Tabelle | `SELECT role, timestamp FROM cf_voice_messages WHERE id <= 5`; Tabellenstand 20:00: 10 User / 5 Assistant (wächst durch parallele Sessions), siehe „Gegenprüfung der Laufversuch-1-Zahlen" |
| LLM-Fehler | Trace-Store: `AI_APICallError: 5035: Model @cf/deepseek-ai/deepseek-v4.1-flash-1017 is not available on the Workers Free plan` und `Voice pipeline failed` (component `VoiceAgent`, stage `pipeline`) |
| Ursache im Code | `examples/voice-agent/src/server.ts:139` setzt `@cf/deepseek-ai/deepseek-v4.1-flash-1017` als Default-Modell |
| Kein Messwert | 0 Treffer für `turn_metrics` / `first_audio_ms` / `llm_ms` in den lokalen Stores |
| Account-Plan | damit **geklärt: Free** (Setup-Tabelle, Zeile „Account-Plan") |
| STT-Ausgabe | transkribiert wurde wenig zusammenhängende Sprache („McLewickside, Shakespeare's sister, …", „So", „I", „Yeah.", „See?") — für M2 ohne Aussage |

Zweites Fenster 19:44:12–19:47:09: 5 User **und 5 Assistant** (`id` 6–15). „0
Assistant" gilt also nur für das erste Fenster. Unverändert gilt: kein
`turn_metrics`-Wert, also keine Messung.

**Konsequenz:** Der nächste Versuch braucht zuerst den Modellwechsel im Klon auf
ein Free-fähiges, nicht abgekündigtes Modell (`src/server.ts:139`, eine Zeile) —
das ist der im Plan erwartete Fall, bisher aber nicht durchgeführt. Danach
20 englische Wechsel, dann die Tabelle unten füllen.

## Vorprüfung 19:57 — Modellpfad auf Free belegt (zwei Text-Turns)

Datum: 19.11.2026, ~19:57. Ziel: T1 aus
[`EXECUTION_PLAN-M1-MESSLAUF.md`](EXECUTION_PLAN-M1-MESSLAUF.md). Dies ist **kein** Laufversuch mit
Sprachaufnahme; er klärt den blockierenden Modellpfad.

### Änderung am Klon (eine Zeile)

| | |
|---|---|
| Datei | `examples/voice-agent/src/server.ts:139` |
| vorher | `"@cf/deepseek-ai/deepseek-v4.1-flash-1017"` |
| nachher | `"@cf/zai-org/glm-4.7-flash"` |
| sha256 vorher | `d9752314306ec9bab10a701fd45f4e74c1330a524f50f86caf5e1357e98065b8` |
| sha256 nachher | `4077277c2717a0a425ba499a4770da8ee9511ca610803a210e8f2273f7647e62` |

Grund: im Plan erwarteter Fall (`MESSLAUF-PLAN.md` Z. 104–112); Modell ohne
Deprecation, „flash" zielt auf Latenz. Server danach neu gestartet
(`npm run start`, Port 5173, HTTP 200).

### Ergebnis: der Free-Plan trägt das Modell

Zwei **Text**-Turns über das Eingabefeld des Beispiels (`sendText`), keine
Mikrofonnutzung.

| # | Eingabe | Antwort | UI-Zeitstempel | Konsolenfehler |
|---|---|---|---|---|
| 1 | `Hello! Please answer in one short sentence.` | „It's 06:57 PM UTC on Thursday, November 19, 2026." (Tool `get_current_time`) | 19:57:14 → 19:57:30 | keine |
| 2 | `Say only the word: test.` | „test" | 19:58:07 → 19:58:09 | keine |

Die Zeitstempel sind **UI-Anzeigezeiten, keine Messwerte**. Sie belegen
Funktion, nicht Latenz.

### Warum kein Voice-Turn

Der Textpfad nutzt denselben LLM-Pfad und beantwortet die teuerste offene Frage
(Paid-Wand) ohne Mikrofon. Der Voice-Pfad braucht eine sprechende Person oder
synthetisches Audio und bleibt für T1 offen.

### Befund: `turn_metrics` ist ohne Eingriff nicht erfassbar

| Prüfung | Ergebnis |
|---|---|
| UI-Anzeige | nur `metrics`; für Text-Turns **keine** Anzeige (Typdefinition: `metrics` gilt für „successful, non-empty speech turns", `types-_Faxb570.d.ts:190–197`) |
| Übertragung | `turn_metrics` wird als JSON über die WS-Verbindung gesendet (`agents/dist/diagnostics-C4jcz3VK.js:221`) |
| Netzwerkaufzeichnung im Browser | 0 Frames während eines Turns — WebSocket-Frames werden nicht erfasst |
| Lokaler Observability-Store | `spans`/`logs` enthalten keine Voice-Metriken (Abfrage: `SELECT ... FROM spans`, `logs` ohne Treffer für `metric`/`first_audio`/`llm_ms`) |
| Globale Objekte im Fenster | keine (`Object.keys(window)` ohne Agent/Voice/Socket) |

**Konsequenz:** `AC-D1-2` (`model→first-text`, `tts→first-audio` je Turn) ist
mit dem unveränderten Beispiel **nicht** erfüllbar. Ohne Erfassungsweg wäre der
20-Turn-Lauf nicht abnahmefähig und müsste wiederholt werden.

### Zweitbefund: das Modell-Label der UI lügt nach dem Tausch

`client.tsx:400` setzt `llmModel` auf `"deepseek"`; `server.ts:136–139` routet
`"qwen"` auf Qwen und **alles andere** auf das neue Modell. Der Button
„DeepSeek" startet damit `glm-4.7-flash`. Für die D1-Dokumentation gilt: nie das
UI-Label protokollieren, sondern die effektive Modell-ID aus dem Code.

### Status T1

| Teilziel | Status |
|---|---|
| Modellpfad auf Free-Plan | ✅ belegt |
| ein Voice-Turn end-to-end | ⛔ offen (kein Mikrofon-Eingang in diesem Lauf) |
| sieben Messwerte erfassbar | ⛔ **BLOCKED (Erfassungsweg)** |

Nächster Schritt: Erfassungsweg entscheiden (siehe
[`docs/UNSOLVED-TECHNIK.md`](../docs/UNSOLVED-TECHNIK.md) U1). Ein 20-Turn-Lauf ist derzeit
zusätzlich durch die **instabile STT-Stufe** gefährdet (U12) — Sprach-Turns
gelangen, aber der Start scheitert wiederholt. Keine erfundenen Werte, keine
Instrumentierung ohne Freigabe.

## Kollisionsbefund zur Messung (19.11.2026, ab 19:48)

Ergänzung zum Abschnitt „Laufversuch 2 — Modellpfad belegt, Metriken noch nicht
erfassbar" oben: derselbe Messgegenstand wurde in dieser Zeit von zwei Sessions
gleichzeitig benutzt. Noch **kein** Messwert.

| Punkt | Befund |
|---|---|
| Dev-Server | `curl localhost:5173` → 200; Prozesse dabei **neu gestartet** (PIDs 19822/19847 → 31990/31998), ein laufender Call wurde um ~19:56 abgerissen (Konsole: `[vite] server connection lost`) |
| Fremdänderung im Klon | `examples/voice-agent/src/server.ts:139` von `@cf/deepseek-ai/deepseek-v4.1-flash-1017` auf `@cf/zai-org/glm-4.7-flash` geändert (mtime 19:56:28) — **nicht in dieser Session**. Bleibt unangetastet, nicht zurückgedreht; sie ist der im Plan erwartete Ein-Zeilen-Tausch, aber hier für die Messung **nicht benutzt** |
| Zweiter Writer | parallele Session ersetzte `tech/EXECUTION_PLAN-M1-MESSLAUF.md` (19:54:50) und legte `docs/PROJECT_CONTRACT.md` sowie `docs/EXECUTION_PLAN-M0-M5.md` an (19:57) |
| Fremder Turn im selben DO | `cf_voice_messages` rowid 20 (19:57:14, user „Hello! Please answer in one short sentence.") → rowid 21 (19:57:31, assistant) — nicht in dieser Session |
| Eigener Turn, verworfen | rowid 19 („What time is it?", 19:56:33) kam an, Assistant-Antwort fehlt (Reload dazwischen). **Kein Messwert, zählt nicht** |
| Browser | Relay verbunden, Tab `localhost:5173`, Mikrofon `granted` (`navigator.permissions`) |
| Modellpfad dieser Messung | Qwen-Schalter des Beispiels: UI-Button → Query `?llm=qwen` → `src/server.ts:138` `@cf/qwen/qwen3.8-27b`; belegt durch die Verbindungs-URL mit `llm=qwen` in der Browser-Konsole. Keine Codeänderung nötig |
| Free-Pfad antwortet | Die Assistant-Antwort 19:57:31 existiert → auf diesem Pfad kein `AI_APICallError 5035` mehr. Indiz, **kein** Latenznachweis |

**Regel ab hier (Owner-Entscheidung, 19.11.): ein Writer pro Integrationsstelle.**
Während eines Messversuchs schreibt genau eine Session an Klon, Browser-Tab und
diesem Protokoll; weitere Harnesses (OpenCode Desktop, Zed-ACP, Hermes laufen
parallel) bleiben lesend. Grund: derselbe Browser-Tab teilt sich eine
Durable-Object-Konversation — fremde Turns kontaminieren den 20-Turn-Lauf.

**Nachtrag 20:10, Owner-Entscheidung:** Die parallele Session läuft weiter
(Tab `voice-agent`, eigenständige Browser-Session). Für jeden Messversuch gilt
deshalb: vor dem Turn `cf_voice_messages` prüfen und fremde Zeilen im Protokoll
ausweisen; die Konversation ist geteilt und **nicht** sauber. Vor dem 20-Turn-Lauf
(M2) braucht es eine isolierte Session, sonst ist der Lauf nicht abnahmefähig.

### Finding: Plan-ACCEPT nicht hashgebunden (Owner-Entscheidung 19.11.: als Finding dokumentieren)

Der Plan-Validator hat sein eigenes `ACCEPT` im Nachtrag entwertet
([`PLAN_VALIDATION_REPORT.md`](PLAN_VALIDATION_REPORT.md) Z. 88–104): Score und
Verdict gelten für `plan_sha256 29e81d628928e85ee58575ea5fb6e987c6aae2f04a455303845bdfe94e2f2f52`
(Council-Artefakt `tech/evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`),
die heutige `tech/MESSLAUF-PLAN.md` hat
`a10b394c7c9c47f1afc03ccf0d77e48b305c0b116244ffa493e22686b0449d0f`
(selbst geprüft mit `shasum -a 256`).

**Festgelegt:** Das `ACCEPT` gilt inhaltsbezogen weiter, **nicht** hashbezogen.
Inhaltlich unverändert sind Scope, DoD und Non-Goals in dem von beiden Fassungen
getragenen Umfang; belegt ist das damit nicht. Ein Re-Score (Attempt 2/2) bleibt
offen und ist spätestens vor der Kriterienableitung nachzuholen. Der geplante
strukturierte Fail-Record nach Muster `fails/0021-plan-validation-anchor-drift.json`
konnte in dieser Session nicht angelegt werden: `fails/` liegt außerhalb des
Write-Roots der Mission — als offener Punkt geführt, nicht stillschweigend
übersprungen.

## Messversuch 20:01–20:04 — blockiert an der STT-Stufe (kein Messwert)

Zweiter, unabhängiger Blocker neben dem fehlenden Erfassungsweg oben: der Call
lässt sich starten, die Spracherkennung aber nicht. Die Seite zeigt „Speech
recognition failed to start", der Server protokolliert den Grund. **Damit gibt
es keinen Sprach-Turn und keine vier Werte.**

Datum: 19.11.2026, fünf Startversuche um 20:01:12, 20:02:25 und 20:04:21/22/23.

| Befund | Beleg |
|---|---|
| Fehler | `component: FluxSTT, stage: connection, message: "Flux STT WebSocket upgrade failed", error: "Workers AI Flux STT did not return a WebSocket"` (`agents/dist/voice/workers-ai.js:203`) |
| Folgezeile | `component: VoiceAgent, stage: transcriber_startup, message: "Speech recognition failed to start"`, `connectionId f2159739-…` bzw. `cd4f70fe-…` |
| Häufung | 5 Startversuche in dieser Session (20:01:12, 20:02:25, 20:04:21/22/23) — alle mit demselben Fehler; derselbe Fehler trat bereits 18:43:50 auf, also **vor** dem Modellwechsel und **vor** dem Serverneustart |
| Serverlog | `/private/var/folders/.../T/opencode/voice-agent-dev.log` Z. 254–266, 305–317 |
| LLM/TTS-Pfad dagegen intakt | Assistant-Antwort um 19:57:31 im DO-Speicher (`cf_voice_messages` rowid 21) — Text-Pfad antwortet, nur die Sprachaufnahme startet nicht |
| **Nicht** verifiziert | `llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms`; Stage-Timings (WS-Frames); Stille-Erkennung; Transkriptqualität |
| **Nicht** getan | kein Debugging-Fork, keine nachträgliche Instrumentierung des Beispiels, kein Wechsel des STT-Providers ohne Owner-Entscheidung, kein Neustart mit anderen Flags |
| Budget | ~20 min reine Arbeitszeit in dieser Session (Grenze: 2 h für Phase 0+1); keine Überschreitung |

**Konsequenz:** Solange die STT-Stufe nicht startet, ist T1 nicht lieferbar —
unabhängig davon, welches LLM antwortet. Nächster Schritt ist eine
Owner-Entscheidung, kein weiterer Startversuch: entweder denselben Flux-Pfad
zu einem späteren Zeitpunkt erneut versuchen (upstream-seitig, ohne Änderung),
oder mit `Workers AI Nova 3` als STT eine dokumentierte Abweichung vom
Default-Stack messen.

**Nachtrag 20:12 (Faktenlage, nicht bewertet):** `wrangler deployments list`
zeigt für den Worker `voice-agent` ein Deployment, erstellt
`2026-11-19T19:09:41Z` (= 20:09:41 lokal), Version `6f4328ba-7904-4d04-ab96-4a5d29547211`,
Author `smlflg@gmail.com`, Quelle Upload. Es stammt **nicht** aus dieser Session;
deren Mission führt „kein Deploy" als Non-Goal. Ob es freigegeben war, ist eine
Owner-Frage und hier nicht entschieden. Der lokale DO-Speicher hat seit
19:58:09 keine neuen Nachrichten (letzte Zeile rowid 23) — die Abschnitte
„Teilmessung lokal" und „Messwerte — deployter Lauf" oben stützen sich also
nicht auf den lokalen Speicher.

## Teilmessung lokal (abgebrochen — STT-Instabilität)

Vor dem Methodenwechsel gemessen (Qwen auf Free, lokal + Remote-Inferenz):

| Turn | Kanal | llm_ms | tts_ms | first_audio_ms | Outcome | Befund |
|---|---|---|---|---|---|---|
| A | Text | 2205 | 521 | 2206 | completed | „Hey! Yes, I'm here and responding just fine." — First audio ≈ LLM-Ende: TTS streamt sofort nach erstem Text |
| B | Voice | — | — | — | completed | „Hey." transkribiert + beantwortet (kein Metrik-Panel erwischt) |
| C | Voice | — | — | — | completed | „Okay." transkribiert + beantwortet |
| D | Text | — | — | — | error | Gesendet mit DeepSeek-Konfig: `5035 not available on Workers Free plan` |
| E | Text | — | — | — | completed | Samuels Tab: „Hello! Please answer in one short sentence." → Antwort (19:57:14→19:57:30) |
| F | Text | — | — | — | completed | Samuels Tab: „Say only the word: test." → „test" (19:58:07→19:58:09) |

**Erste Lesart (n = 1 mit Metriken):** LLM (Qwen 3.8-27b) dominiert mit ~2,2 s — das 1-s-Ziel ist mit einem 27B-Front-Modell nicht erreichbar; der Hebel ist ein kleineres Modell (siehe Plan-Ausweichpfad). Stille-Erkennung: Turn-Ende kam deutlich schneller als befürchtet; die +500-ms-Sorge blieb ohne messbaren Effekt (konsistent mit dem SDK-Befund, dass der Server `end_of_speech` ignoriert).

**Lokale STT-Instabilität (Grund für den Abbruch):** Flux-STT-WebSocket starb wiederholt (`Network connection lost`, `websocket_close`), SDK versteckt die Ursache (cloudflare/agents#2377, offen); Remote-Session-ENOTFOUND (`api.cloudflare.com`) als Symptomkette. Kein WARP/Proxy auf dem Host (geprüft).

## Messwerte — deployter Lauf (20 englische Sprach-Wechsel)

**Status 19.11., ~20:15: BLOCKED — 0 gemessene Wechsel.** Deploy:
`https://voice-agent.smlflg.workers.dev` (Version `6f4328ba-7904-4d04-ab96-4a5d29547211`,
Owner-Freigabe für die Plan-Abweichung „Deploy" erteilt). Qwen vorab verifiziert
geschaltet (Programm-Klick, Primary-Stil geprüft). Erster Call-Versuch: „Speech
recognition failed to start" — Ursache lt. Samuel-Bildschirm und Server-Kontext:
**`4006: you have used up your daily free allocation of 10,000 neurons`**.

**Kostenlehre (operativ, wichtig):** Das Tagesbudget wurde nicht von den Turns
verbraucht, sondern von **durchgehend offenen Mikrofon-Sessions**: flux-STT
rechnet pro gestreamter Audiominute (~700 Neurons/Min, s.
[kosten-tts-voice.md](research/kosten-tts-voice.md)); die beiden 15-Minuten-
Handoff-Fenster mit live geschaltetem Mikro plus Debugging-Sessions
(~15+ Min Audio) ≈ 10.500 Neurons ≈ komplettes Tageskontingent.
**Regel für den Wiederholungslauf: Mikrofon nur während des Sprechens aktiv
(Mute zwischen den Wechseln oder kürzere Sessions).**

**Kollisionsbefund (per AGENTS.md „Ein Writer pro Integrationsstelle"):** Während
des lokalen Laufs war ein zweiter Tab (Samuels eigene Session) mit derselben
Durable-Object-Konversation verbunden; fremde Turns („Hello! Please answer…",
„Say only the word: test.") stehen zwischen den Mess-Turns. Für den
Wiederholungslauf gilt: eine Session, ein Tab. Außerdem lief ein zweiter
Dev-Server (Port 5173, andere Session) parallel — unangetastet gelassen.

Rohwerte, ungeschönt. Turns nur mit Begründung aussortiert (Spalte „Befund").

| # | llm_ms | tts_ms | first_audio_ms | total_ms | speech→transcript | model→first-text | tts→first-audio | Outcome | Befund |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |
| 4 | | | | | | | | | |
| 5 | | | | | | | | | |
| 6 | | | | | | | | | |
| 7 | | | | | | | | | |
| 8 | | | | | | | | | |
| 9 | | | | | | | | | |
| 10 | | | | | | | | | |
| 11 | | | | | | | | | |
| 12 | | | | | | | | | |
| 13 | | | | | | | | | |
| 14 | | | | | | | | | |
| 15 | | | | | | | | | |
| 16 | | | | | | | | | |
| 17 | | | | | | | | | |
| 18 | | | | | | | | | |
| 19 | | | | | | | | | |
| 20 | | | | | | | | | |

Stille-Erkennung (Beobachtungen): _hier notieren_
Konsolen-/Serverfehler: _hier notieren_

## Auswertung (wird nach dem Lauf gefüllt)

- Min / Median / P90 von `first_audio_ms`: _folgt_
- Vergleich: Cloudflare-Budget 890 ms · Skizzenwunsch „under 1 sec" · Pipecat-Referenz 500–800 ms
- Latenz-Kriterien aus den Messwerten ableiten (nicht vorab erfunden)

---

## Gegenprüfung der Laufversuch-1-Zahlen (unabhängige Verifikation, 20:09)

Anlass: Der Tabellenbefund „5 User / 0 Assistant" oben wurde als Gesamtbefund
der Tabelle zitiert. Nachprüfung an einer Kopie des zitierten DO-SQLite
(`…/voice-agent-MyVoiceAgent/5890aaec….sqlite` samt WAL) und am Trace-Store
(`…/observability/miniflare-wobs-trace-store/a590acd….sqlite`), read-only.

**VERIFIED — Zeitfenster und Zählung:**

| Fenster | User | Assistant | Beleg |
|---|---|---|---|
| 17:47:24 – 17:50:49 | 5 | 0 | `SELECT role, timestamp FROM cf_voice_messages WHERE id <= 5` |
| 19:44:12 – 19:47:09 | 5 | 5 | `id` 6–15, u. a. „Welcome back! How can I help you today?"; die User-Zeilen sind saubere Sätze ohne STT-Artefakte (im Unterschied zu `id` 1–5), also **wahrscheinlich getippt** — nicht bewiesen |
| Gesamt (Stand 20:00) | 10 | 5 | `SELECT role, count(*) … GROUP BY role` |

Nachtrag 20:15: aktueller Stand **14 User / 9 Assistant** (letzte Zeile 19:58:09).
Die Tabelle wächst durch parallele Sessions weiter; jede Zählung braucht daher
einen Zeitstempel. Die 5/0-Angabe gilt damit **nur für das erste Fenster**, nicht
für die Tabelle.

**VERIFIED — Fehlerbild und Modell:**

- `5035`-Treffer im Trace-Store: 10, Zeitraum **17:47:25 – 19:44:19**; die
  Formulierung „Fehler 18:47" hat keine Fundstelle.
- Kein `turn_metrics` / `first_audio_ms` / `llm_ms` in den lokalen Stores
  (0 Treffer) — die Kernaussage „keine Messwerte" bleibt richtig.
- Die Session 19:44–19:47 lief auf unverändertem `src/server.ts` (Verbindungs-URL
  `llm=deepseek`, `git diff` nur `package.json`); ein Modellwechsel war zu diesem
  Zeitpunkt nicht vorgenommen.

**HYPOTHESIS — Bedeutung der späteren Session:** Fünf Assistant-Antworten auf
dem als Paid-only belegten Default-Modell sind mit „der LLM-Pfad antwortete nie"
nicht vereinbar. Ob es sich um eine fremde Session, einen Kontingent-Effekt oder
einen anderen Pfad handelt, ist **nicht** geklärt. Die Aussage „Free-Account
trägt das Default-Modell dauerhaft nicht" ist für 17:47 belegt, als
Dauerzustand aber nicht. Metriken dieser Session wurden nicht festgehalten und
sind nicht rekonstruierbar.

**Konsequenz für die Abnahme:** Laufversuch 1 bleibt ein belegter Fehlversuch;
die Zählzeile und die Uhrzeit waren falsch und sind oben korrigiert. Vor einer
Verallgemeinerung der Paid-Wand ist die Session 19:44–19:47 einzuordnen. Die
zitierte SQLite liegt außerhalb des Repos, ist mutabel und nur abgekürzt
benannt — es existiert keine Evidenzkopie in `tech/evidence/`.

## Grenze der Belege: SDK-Version (geprüft 20:15)

**VERIFIED:** Alle SDK-Zeilennachweise in
[`docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`](../docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md) und in
[`tech/MESSLAUF-PLAN.md`](MESSLAUF-PLAN.md), Zeile 64) beziehen sich auf
`agents@0.27.0` (lokal in `claudeflareworkerhaus` installiert). Das Messobjekt
läuft `agents@0.33.0` — `examples/voice-agent/node_modules/agents/package.json`,
installiert am 19.11.

**Stichprobe an 0.33.0 (selbst gelesen):** `@cf/deepgram/nova-3` steht in
`dist/voice/workers-ai.js:460`; `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md:208` zitiert für
dieselbe Aussage `:361`. `end_of_speech` wird weiterhin serverseitig verworfen
(`dist/voice/index.js:237,706`), `finalInputToFirstAudioMs` existiert
(`dist/types-_Faxb570.d.ts:72`).

**Folge:** Die *Aussagen* halten in der Stichprobe, die *Zeilennummern* nicht.
Das widerspricht der Eintragung U14 in
[`docs/UNSOLVED-TECHNIK.md`](../docs/UNSOLVED-TECHNIK.md), die „die Zeilennummern stimmen" nennt
— dort ist die Stichprobe zu korrigieren. Vor der Auswertung von M2/M4 sind die
Zitate gegen die installierte Version zu prüfen, sonst wird gegen die
Dokumentation einer anderen Version gemessen.

---

## Messgrößen-Definition (verbindlich für M1/M2, Stand 19.11.2026)

**VERIFIED am installierten SDK** (`agents@0.33.0`,
`examples/voice-agent/node_modules/agents/dist/types-_Faxb570.d.ts`).
Zeilennummern sind versionsabhängig; hier zählt die Semantik.

| Größe | SDK-Definition | Konsequenz für die Auswertung |
|---|---|---|
| `llm_ms` | Zeit von vor `onTurn()` bis Abschluss des Modellstreams. Der SDK-Kommentar sagt ausdrücklich: „It is **not** time to first text." | Nicht als Text-Latenz verwenden. `MESSLAUF-PLAN.md` M0 tut das; die Auswertung nimmt `modelToFirstTextMs`. Der Plan bleibt unverändert (Hash), die Abweichung ist hier dokumentiert. |
| `modelToFirstTextMs` | Modellaufruf bis erstes nicht-leeres Text-Delta. | Das ist die Text-Latenz für den Typewriter-Start, zusammen mit der Produktmetrik `first_glyph_ms` aus ADR-0006. |
| `first_audio_ms` | Turn-Pipeline-Start (vor `afterTranscribe`) bis erstes **gesendetes** Audiopaket; schließt STT und Browser-Playback aus. `0` = kein Audio gesendet. | Nicht als „was der Nutzer hört" lesen. `0` ist ein Fehlschlag, keine Bestzeit. |
| `turnTotalMs` | Turn-Zuteilung bis Abschluss von Modell und TTS-Drain; Browser-Playback ausgeschlossen. | Server-Wert, keine Ende-zu-Ende-Zeit. |
| `VoiceTurnMetrics` | Alle Dauern auf **einer Server-Uhr**, überlappend, nicht addierbar; Browser-Playback ausgeschlossen, weil Browser- und Worker-Uhr unabhängig sind. | Für die Nutzerwahrnehmung braucht es eine zweite, clientseitige Marke (Ende der Äußerung → hörbarer Ton). |

**Folgen:**

1. Das Gate „unter 1 s" darf nicht allein auf `first_audio_ms` stehen; die
   Client-Marke ist das Gate (siehe `research/PRIOR_ART_REPORT.md` D1/E1).
2. Der Text-Hauptweg braucht `modelToFirstTextMs`/`first_glyph_ms`, nicht
   `first_audio_ms` (siehe `docs/adr/ADR-0006-zeitvertrag.md`).
3. Bei n = 20 ist P90 der zweitschlechteste Turn. Berichtet min/median/p90/max;
   keine Populations-Tails behaupten. Ausreißer nur mit Begründung aussortieren.
4. `Outcome` ist Pflichtspalte. Ein `0`-Wert ohne `Outcome=no_output`/`error`
   ist ungültig.
