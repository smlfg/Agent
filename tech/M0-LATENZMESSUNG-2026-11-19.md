# M0 — Latenzmessung Textpfad (19.11.2026)

Status: **BLOCKED — keine Latenzzahl.** Die Instrumentierung ist gebaut und
selbstgetestet, der isolierte Verifikationslauf hat den Provider erreicht, aber
Workers AI hat die Anfrage vor dem ersten Token mit `4006` abgewiesen
(Tageskontingent erschöpft). Der geplante 20-Turn-Lauf wurde deshalb **nicht
gestartet**. Es gibt keine erfundenen, geschätzten oder aus früheren Sessions
übernommenen Werte.

Bezug: [Messlauf-Plan](MESSLAUF-PLAN.md), [Messprotokoll](MESSPROTOKOLL-2026-11-19.md),
[UNSOLVED-TECHNIK](../docs/UNSOLVED-TECHNIK.md) U1/U12, [Projektvertrag](../docs/PROJECT_CONTRACT.md) T1.

## 0 · Kurzfassung

| Punkt | Befund |
|---|---|
| Messharness | neu, ohne Produktcode-Änderung: [`m0/instrument.js`](m0/instrument.js), [`m0/run.mjs`](m0/run.mjs), [`m0/stats.mjs`](m0/stats.mjs) |
| Isolierte Conversation | `localStorage['voice-agent-session-id'] = <runId>` vor App-Load; ein Browser-Context, eine Seite, eine WS-Verbindung |
| Modell (tatsächlich) | `@cf/zai-org/glm-4.7-flash`, runtime-belegt über die Workers-AI-Request-URL im Dev-Log |
| Client-Uhr | `performance.now()` je Seite; `performance.timeOrigin` mitgeschrieben |
| Erster sichtbarer Text | Probe vorhanden und im Selbsttest belegt; im echten Turn **nicht gemessen**, weil kein Text entstand |
| Erstes hörbares Audio | Probe vorhanden und im Selbsttest belegt; im Textpfad **nicht gemessen**, weil ohne Call kein TTS läuft |
| Serverseitige Teilzeiten | aus `turn_metrics` verbatim übernommen, getrennte Uhr; im Fehlerturn nur `turnTotalMs`/`modelStreamConsumptionMs` |
| Verifikation | Instrumentierungs-Selbsttest **PASS**; ein echter Turn bis zum Provider, dann `4006` |
| 20-Turn-Lauf | **nicht ausgeführt** (Umgebung nicht stabil) |
| Statistik | Latenz: n = 0, Median/p95 nicht berechenbar. Fehlerquote des Verifikationslaufs: 1/1 = 100 %, ausschließlich `quota_4006` |
| Blockerbedingung | Workers-AI-Free-Kontingent 10.000 Neuronen/Tag, Reset 00:00 UTC; oder Owner entscheidet Paid |

## 1 · Auftrag und Abgrenzung

Der Auftrag war eine reproduzierbare, minimal-invasive Messung **nur des
funktionierenden Textpfads**: isolierte Conversation-ID, ein aktiver Testclient,
tatsächliche Modellkennung, clientseitige monotone End-to-End-Zeit, getrennte
Server-Teilzeiten, Unterscheidung von sichtbarem Text und hörbarem Audio,
dauerhafte Rohdaten, ein Verifikationsturn vor dem 20-Turn-Lauf, Statistik nur
aus Messwerten.

Nicht getan: keine Änderung an Produktarchitektur, UI, STT-Provider oder
Modellwahl; kein Deploy; kein Paid-Upgrade; keine neuen Agenten; keine
zusätzliche Recherche. Der Klon
`~/Projects/05_INBOX/cloudflare-agents/examples/voice-agent` blieb unverändert
(die vorhandene Ein-Zeilen-Modellanpassung stammt aus einer früheren Session und
wurde nicht angefasst).

## 2 · Messdefinition

Alle Client-Zeiten sind `performance.now()` **derselben Seite**. Sie sind
monoton, aber nicht mit der Worker-Uhr vergleichbar. Serverwerte werden
unverändert übernommen und **nie** von Clientwerten subtrahiert.

| Größe | Start | Ende | Uhr | Einheit | Definition |
|---|---|---|---|---|---|
| `t_send` | — | ausgehendes `text_message`-Frame verlässt die Seite | Client | ms | T0 des Turns |
| `e2e_first_visible_text_ms` | `t_send` | erster nicht-leerer Assistant-Text im DOM **plus zwei Animation-Frames** | Client | ms | **Primärgröße**; annähernd „nach Paint“, kein Compositor-Beweis |
| `e2e_first_visible_text_dom_ms` | `t_send` | MutationObserver sieht den ersten nicht-leeren Text | Client | ms | untere Schranke, ohne Frame-Wartezeit |
| `e2e_first_audio_bytes_ms` | `t_send` | erstes binäres WS-Frame kommt an | Client | ms | Transportankunft, **nicht** hörbar |
| `e2e_first_audible_audio_ms` | `t_send` | `AudioBufferSourceNode.start()` des ersten Audioblocks, plus geplantes `start`-Lead | Client | ms | hörbare Wiedergabe, soweit aus JS beobachtbar |
| `turn_metrics.turnTotalMs` | Turn-Allokation | terminale Zusammenfassung | Worker | ms | Serverwert, Fehlerpfad eingeschlossen |
| `turn_metrics.modelToFirstTextMs` | Modellaufruf | erster nicht-leerer Text-Delta | Worker | ms | Server-Teilzeit; in diesem Lauf nicht aufgetreten |
| `turn_metrics.timestamp`-Felder | — | — | Worker | ms | überlappen, sind **nicht additiv** |

Der Unterschied zwischen den beiden Textgrößen ist die Frame-Wartezeit; der
Selbsttest zeigt ihn: DOM-Mutation nach 0,3 ms, Frame-Bestätigung nach 22,7 ms.
Der Unterschied zwischen `first_audio_bytes_ms` und `first_audible_audio_ms` ist
Transport/Decoder/Wiedergabe; beide werden getrennt erfasst.

## 3 · Vorgefundene Instrumentierung und tatsächliches Event-Schema

Untersucht wurde der installierte Klient `agents@0.33.0`
(`examples/voice-agent/node_modules/agents`). Beobachtet wurde zusätzlich jeder
WebSocket-Frame im echten Lauf ([Roh-Events](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/raw-events.jsonl)).

**Client → Server:** `hello`, `text_message` (Textpfad), dazu `start_call`,
`end_call`, `interrupt` im Voice-Pfad.

**Server → Client (Textpfad, beobachtet):**
`welcome`, `status` (`idle`/`thinking`), `transcript` (Rolle `user`),
`transcript_start`, `transcript_delta`, `transcript_end`,
`completion_outcome`, `error`, `turn_metrics`; dazu die Agent-Control-Nachrichten
`cf_agent_identity` und `cf_agent_mcp_servers`.

**Wichtige Befunde:**

1. `turn_metrics` ist die einzige stabile, maschinenlesbare Zusammenfassung für
   **Text**-Turns. Sie trägt `turnId`, `source: "text"`, `outcome`,
   `turnTotalMs` und optionale Teilzeiten (`modelToFirstTextMs`,
   `modelStreamConsumptionMs`, …). Definition im SDK:
   `node_modules/agents/dist/types-_Faxb570.d.ts` (`VoiceTurnMetrics`).
2. `turn_metrics` wird im `finally` des Turns gesendet und kommt **nach**
   `status: idle`. Im Rohlauf: `status idle` bei 497 ms, `turn_metrics` bei
   503 ms nach `t_send`. Eine Instrumentierung, die bei `idle` schließt, verliert
   die Terminalmetrik. Der erste Harness-Entwurf hatte genau diesen Fehler; er
   ist behoben und im zweiten Verifikationslauf belegt.
3. Die kompakte `metrics`-Nachricht (`llm_ms`, `tts_ms`, `first_audio_ms`,
   `total_ms`) gehört zum **In-Call-Voice-Pfad**. Im Textpfad ohne Call wurde sie
   nicht gesendet. `first_audio_ms` bedeutet dort „erstes gesendetes
   Audiopaket“, nicht „hörbar“.
4. Text-Turns ohne Call liefern **kein TTS und kein Audio**. Das ist keine
   Instrumentierungslücke, sondern das Verhalten des Beispiels
   (`_handleTextMessage`: `isInCall` entscheidet über `_streamResponse`).
5. Ein Call konnte in diesem Lauf nicht genutzt werden: nach dem dokumentierten
   Befund U12 scheitert die STT-Stufe beim Start (`Flux STT WebSocket upgrade
   failed`). Damit ist im aktuellen Umgebungszustand auch kein hörbares
   Produkt-Audio messbar — unabhängig vom Kontingent. In diesem Lauf wurde kein
   Call versucht und kein STT-Provider gewechselt.

## 4 · Isolierte Conversation und ein aktiver Testclient

| Prüfung | Beleg |
|---|---|
| Conversation-ID | `localStorage['voice-agent-session-id'] = m0-verify-2026-11-19T19-28-00-711Z-a465` vor App-Load gesetzt ([instrument.js](m0/instrument.js)) |
| Clients | ein Playwright-Context, eine Seite, eine WS-Verbindung; keine weiteren Tabs dieses Laufs |
| Server-Echo | `cf_agent_identity.name` = Run-ID; `sessionIdSeen` = Run-ID (`isolated: true` in [summary.json](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/summary.json)) |
| Neue DO-Instanz | neue SQLite-Datei `9a1574…sqlite` entstand; Snapshot und Query in [do-store-evidence.txt](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/do-store-evidence.txt) |
| Keine Fremdzeilen | `cf_voice_messages`: genau **1 User**, **0 Assistant**, keine fremden Turns |
| Geteilter Dev-Server | Port 5173, PID 31990 vor **und** nach dem Lauf; nur der Transport ist geteilt, nicht die DO-Conversation |

Die frühere Kollision (gemeinsame `localStorage`-ID in einem Browserprofil) wird
durch das explizite Setzen der Run-ID vermieden. Der Lauf ist damit
abnahmefähig, was die Zuordnung angeht.

## 5 · Modell, Konfiguration, Versionen

| Punkt | Wert | Beleg |
|---|---|---|
| UI-Auswahl | Button „DeepSeek“ → Query `?llm=deepseek` | URL des Laufs |
| Aufgelöstes Modell | **`@cf/zai-org/glm-4.7-flash`** | `src/server.ts:136–139`; Runtime-URL im Dev-Log |
| Runtime-Beleg | `url: 'workers-ai:binding/run/@cf/zai-org/glm-4.7-flash'` | [server-model-evidence.txt](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/server-model-evidence.txt), Dev-Log Zeile 761 |
| Label-Falle | UI-Label „DeepSeek“ zeigt **nicht** DeepSeek; der else-Zweig routet auf glm | `client.tsx:400`, `server.ts:136–139` |
| `server.ts` sha256 | `4077277c2717a0a425ba499a4770da8ee9511ca610803a210e8f2273f7647e62` | Manifest |
| Klon-HEAD | `81726f7d18206a0864d183c219fad9fa6e7e28e6` | Manifest |
| Klon-Status | `M examples/voice-agent/package.json`, `M examples/voice-agent/src/server.ts` (fremde, vorbestehende Änderungen) | Manifest |
| SDKs | `agents 0.33.0`, `ai 7.0.177`, `workers-ai-provider 4.0.1`, `wrangler 4.165.0`, `vite 8.3.8` | Manifest |
| Browser | Chrome 158.0.8127.36, headless, 1440×900 | Manifest |
| Node / Playwright | v22.23.1 / 1.63.0 | Manifest |

Der Modellname ist damit **zur Laufzeit** belegt, nicht nur aus dem Quelltext
abgeleitet: die fehlgeschlagene Workers-AI-Anfrage nennt das gebundene Modell in
ihrer URL.

## 6 · Verifikationslauf (ein Turn)

Run: `m0-verify-2026-11-19T19-28-00-711Z-a465` ·
[Rohdaten](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/turns.jsonl) ·
[Events](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/raw-events.jsonl) ·
[Manifest](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/manifest.json).

Prompt: `Reply with exactly: verification-ok`.

| Beobachtung | Wert (relativ zu `t_send`) | Bewertung |
|---|---|---|
| ausgehendes `text_message` | 0 ms | Instrumentierung greift |
| `status: thinking` | +40,8 ms | Protokollbeobachtung, **keine** Antwortlatenz |
| `transcript` (user) | +45,5 ms | Server hat den Text angenommen |
| `completion_outcome: model_error` | vor `turn_metrics` | Provider-Fehler |
| `turn_metrics` | +503,4 ms; `turnTotalMs: 491`, `source: "text"`, `outcome: "model_error"` | Terminalmetrik korrekt zugeordnet |
| erster sichtbarer Text | — | **kein Text entstanden** |
| erstes hörbares Audio | — | **kein TTS** (kein Call) |

Der Turn ist als Fehlerturn vollständig instrumentiert. Er ist **kein**
Latenzmesswert: Der Provider hat vor dem ersten Token abgewiesen.

## 7 · Statistik (nur gemessene Daten)

| Größe | Wert | Grundlage |
|---|---|---|
| geplante Turns (Verifikation) | 1 | `manifest.measurement.turnsPlanned` |
| versuchte Turns | 1 | `turns.jsonl` |
| erfolgreiche Turns | 0 | kein sichtbarer Text, `outcome = model_error` |
| Fehlerquote | **1/1 = 100 %** | ausschließlich `quota_4006`; **keine Produktfehlerquote** |
| `e2e_first_visible_text_ms` | **n = 0** | Median/p95 **nicht berechenbar** |
| `e2e_first_visible_text_dom_ms` | **n = 0** | dito |
| `server modelToFirstTextMs` | **n = 0** | Feld im Fehlerturn nicht gesetzt |
| `server turnTotalMs` | n = 1, 491 ms | **Fehlerpfad**; nicht als Antwortlatenz lesbar |
| erstes hörbares Audio | 0/1 | ohne Call kein TTS |
| 20-Turn-Lauf | **0/20 versucht** | Umgebung nicht stabil; nicht gestartet |

Definition der Fehlerquote: Fehler / **versuchte** Turns. Ein Fehler ist ein Turn
ohne gemessenen ersten sichtbaren Text oder mit `outcome != completed`.
Nicht-versuchte Turns gehen nicht in den Nenner ein und werden separat
ausgewiesen. Bei n = 20 wäre p95 (Nearest-Rank) der zweitgrößte Wert; das ist
eine Eigenschaft der Stichprobe, keine Aussage über das Produkt.

## 8 · Blocker

**Was blockiert:** Jede Workers-AI-Inferenz auf diesem Account wird mit

> `4006: you have used up your daily free allocation of 10,000 neurons, please upgrade to Cloudflare's Workers Paid plan if you would like to continue usage.`

abgewiesen. Der Fehler tritt **nach** dem WebSocket- und DO-Pfad auf, bei der
Provider-Anfrage. Es ist kein Pfad-, Instrumentierungs- oder Modellfehler.

| Punkt | Beleg |
|---|---|
| Fehlermeldung im Turn | [turns.jsonl](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/turns.jsonl), Feld `error.message` |
| Fehlermeldung im Serverlog | Dev-Log Zeilen 744–760; Kopie in [server-model-evidence.txt](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/server-model-evidence.txt) |
| Modell der abgewiesenen Anfrage | `@cf/zai-org/glm-4.7-flash` (Dev-Log Zeile 761) |
| Zeitpunkt | 2026-11-19T19:28:02Z |
| Kontingent | 10.000 Neuronen/Tag, Free-Plan; Reset 00:00 UTC ([MESSLAUF-PLAN](MESSLAUF-PLAN.md), Phase 0) |
| Früherer Erfolg | Der Textpfad antwortete am 19.11. um 19:57 (zwei Text-Turns, [MESSPROTOKOLL](MESSPROTOKOLL-2026-11-19.md)); das Kontingent war damals noch nicht erschöpft |
| Abgrenzung STT | Der Voice-Pfad bleibt zusätzlich durch U12 blockiert; das betrifft Audio, nicht diese Textmessung |

**Bedingung zum Auflösen:** Entweder nach 00:00 UTC mit frischem Tageskontingent
messen, oder der Owner entscheidet ein Paid-Upgrade. Beides ist eine
Owner-Entscheidung; der Agent führt keins von beiden eigenmächtig aus.

## 9 · Verifikation der Instrumentierung

| Prüfung | Ergebnis | Beleg |
|---|---|---|
| Selbsttest DOM (synthetischer Assistant-Knoten) | PASS: Mutation und Frame bestätigt | [selftest.json](m0/runs/m0-selftest-2026-11-19T19-27-52-845Z-1a12/selftest.json) |
| Selbsttest Audio (synthetischer `AudioBufferSourceNode`) | PASS: `start()` und hörbarer Zeitpunkt erfasst | dito |
| Ausgehendes `text_message` im echten Turn | PASS | [raw-events.jsonl](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/raw-events.jsonl) |
| Server-Nachrichten vollständig | PASS (`status`, `transcript`, `completion_outcome`, `error`, `turn_metrics`) | dito |
| `turn_metrics` dem Turn zugeordnet | PASS (`turn: 1`, `turnId: turn_1`) | dito |
| Isolation | PASS (Run-ID, neue DO-Datei, 1 User / 0 Assistant) | [summary.json](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/summary.json) |
| Erster sichtbarer Text mit echtem Modell | **nicht verifiziert** | Modell antwortet nicht (Quota) |
| Hörbares Produkt-Audio | **nicht verifiziert** | kein Call möglich (STT), Textpfad ohne TTS |

Der erste Harness-Entwurf hatte zwei Fehler, beide sind behoben und durch die
Runs dokumentiert: `MutationObserver` auf `document.documentElement` zum
Init-Zeitpunkt (Lauf `…19-24-39…`, 0 Turns) und Schließen des Turns vor
`turn_metrics` (Lauf `…19-25-05…`). Der finale Verifikationslauf nutzt die
korrigierte Fassung.

## 10 · Einschränkungen

1. **Keine Latenzzahl.** n = 0 für die Primärgröße. Jede Zahl wäre erfunden.
2. **p95 bei n = 20** ist der zweitgrößte Wert, keine belastbare Tail-Aussage.
   Der Bericht nennt den Schätzer ausdrücklich; für echte Tail-Aussagen ist
   n ≥ 50 nötig ([MESSLAUF-PLAN](MESSLAUF-PLAN.md), Konsolidierung).
3. **„Sichtbar“ ist eine JS-Annäherung:** DOM-Text plus zwei Frames. Compositor-
   Paint ist aus JS nicht beobachtbar. Die DOM-Mutation ist die untere Schranke.
4. **„Hörbar“ ist eine JS-Annäherung:** `AudioBufferSourceNode.start()` plus
   geplantes Lead. Decoder-/Ausgabegeräte-Latenz und Lautstärke sind nicht
   messbar; im Textpfad entsteht ohnehin kein Audio.
5. **Serverzeit getrennt:** `turn_metrics` nutzt die Worker-Uhr. Sie wird nicht
   mit der Client-Uhr verrechnet; die Werte überlappen und sind nicht additiv.
6. **Geteilter Dev-Server:** Der Server auf :5173 wird auch von anderen Sessions
   genutzt. Die Conversation ist isoliert, der Transport nicht. Während der
   Läufe blieb die PID 31990 stabil; ein Neustart durch eine fremde Session
   würde den Lauf entwerten.
7. **Kein Kalt-/Warmvergleich:** Dafür gibt es in diesem Lauf keine Daten.
8. **Textpfad ≠ Sprachpfad:** Die Zahlen (sobald vorhanden) messen Tippen →
   sichtbarer Text, nicht Sprechen → hörbare Antwort.

## 11 · Reproduktion

Voraussetzungen: Dev-Server des unveränderten Beispiels auf `:5173`, Chrome,
Playwright-Paket (Default-Pfad im Runner, per `M0_PLAYWRIGHT` überschreibbar).

```bash
cd ~/Projects/05_INBOX/cloudflare-agents/examples/voice-agent
npm run start            # falls nicht schon aktiv

cd ~/Projects/03_HAI/Agentfaehig/Agent
node tech/m0/run.mjs --mode selftest
node tech/m0/run.mjs --mode verify
# nach freiem Kontingent und nur bei stabiler Umgebung:
node tech/m0/run.mjs --mode full --turns 20
node tech/m0/stats.mjs tech/m0/runs/<runId>
bash scripts/validate.sh
```

Der Runner bricht bei `4006` nach dem ersten Turn mit
`aborted: "quota_exhausted"` ab; er versucht nicht 20-mal dasselbe. Jeder Lauf
schreibt `manifest.json`, `turns.jsonl`, `raw-events.jsonl`, `console.log` und
`turns-final.json`; `stats.mjs` schreibt `summary.json` und prüft die Werte
gegen die Roh-Events (`rawVerification`).

## 12 · Dateien und Hashes

Harness (neu, keine getrackte Datei geändert):

| Datei | sha256 |
|---|---|
| [`m0/instrument.js`](m0/instrument.js) | `38c19e4e68aa51e7207a19e62729a848dad87e26afe3a8c937a61cf2074a56bc` |
| [`m0/run.mjs`](m0/run.mjs) | `e3338790358dda8bcc096a6af18aaf542297fd18391aba87507ae3b73c9a940e` |
| [`m0/stats.mjs`](m0/stats.mjs) | `522c7a1ff975a07f1c8c5f3babcfe68ac3d50fd6a1ad086476763490583439df` |
| [`m0/prompts.json`](m0/prompts.json) | `29cfb07716907d9d1f2dbb15d7dbe31fe56c62f75ff68336c98a49eeb5e8c654` |

Verifikationslauf `m0-verify-2026-11-19T19-28-00-711Z-a465`:

| Datei | Zweck |
|---|---|
| [`manifest.json`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/manifest.json) | Modell, Versionen, Hashes, Isolation, Blocker |
| [`turns.jsonl`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/turns.jsonl) | ein Turn, Client- und Serverfelder, Fehler |
| [`raw-events.jsonl`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/raw-events.jsonl) | jeder beobachtete Frame und jede Probe mit monotonem `t` und UTC-`wall` |
| [`summary.json`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/summary.json) | Statistik und Rohabgleich |
| [`server-model-evidence.txt`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/server-model-evidence.txt) | Runtime-Modell-URL und `4006`-Beleg |
| [`do-store-evidence.txt`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/do-store-evidence.txt) | 1 User / 0 Assistant, keine Fremdzeilen |
| [`do-store-snapshot.sqlite`](m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/do-store-snapshot.sqlite) | read-only Kopie der DO-SQLite inkl. WAL |
| `console.log` | Browser-Konsole und Seitenfehler |

Selbsttest: [`m0/runs/m0-selftest-2026-11-19T19-27-52-845Z-1a12/selftest.json`](m0/runs/m0-selftest-2026-11-19T19-27-52-845Z-1a12/selftest.json).

Zwei verworfene Vorläufe bleiben als Beleg der Harness-Fehler liegen:
`m0-verify-2026-11-19T19-24-39-096Z-e322` (Init-Fehler, 0 Turns) und
`m0-verify-2026-11-19T19-25-05-050Z-b875` (Turn vor `turn_metrics` geschlossen,
Quota-Fehler).

**Ablage-Hinweis:** `tech/MESSPROTOKOLL-2026-11-19.md` und `docs/PROJECT.md`
wurden bewusst **nicht** angefasst; beide waren während dieses Laufs von einer
parallelen Session geändert (`git status`). Dieser Bericht ist der kanonische
M0-Ort; die Übernahme der Zahlen in das Messprotokoll bleibt offen, bis die
parallele Bearbeitung endet.

## 13 · Nächster Schritt

**Owner-Entscheidung:** bis 00:00 UTC warten (frisches Free-Kontingent) oder
Paid freigeben. Danach in genau dieser Reihenfolge: `--mode verify` (muss
`sichtbaren Text` und `modelToFirstTextMs` liefern), dann `--mode full --turns 20`,
dann `stats.mjs`. Kein automatischer Start; die STT-Frage (U12) bleibt separat
und blockiert weiterhin jede Audiomessung.

---

**BLOCKED** — Latenzmessung Textpfad: Harness gebaut und selbstgetestet, ein
isolierter echter Turn bis zum Provider, dort `4006` (Tageskontingent); keine
Latenzzahl, 20-Turn-Lauf nicht gestartet.
**Bedingung zum Auflösen:** frisches Workers-AI-Tageskontingent (Reset 00:00 UTC)
oder Owner-Freigabe für Paid; danach `--mode verify`, dann `--mode full`.
**Beleg:** `tech/m0/runs/m0-verify-2026-11-19T19-28-00-711Z-a465/` (manifest,
turns, raw-events, summary, server-model-evidence, do-store-evidence).
