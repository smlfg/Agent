# S7 — Technische Grenzen vor dem Bau

Stand: 19.11.2026. Geprüft gegen Upstream-Doku, nicht gegen Erinnerung.
Alle Cloudflare-, Deepgram-, Notion-, ElevenLabs- und PyPI-Seiten wurden am
19.11.2026 abgerufen; die Seiten nennen ihr eigenes `dateModified`, wo es
relevant ist. Repo-Belege sind als `Datei:Zeile` angegeben.

**Beleglegende.** „Repo" = Aussage steht so im Projekt. „Upstream" = wörtlich
aus der genannten Doku. „Unbelegt" = weder Repo noch Doku liefern die Zahl;
dann steht dort `UNKLAR`, nicht eine geschätzte Zahl.

**Wichtig zur Lesart.** Die Skizze sagt „under 1 sec even with TTS **if
possible**" (`sketches/2026-11-12-agentfaehig.md:119`), `docs/PROJECT.md:20`
nennt es „Wunschziel". Die Urteile unten gelten für den Fall, dass daraus ein
hartes Abnahmekriterium wird. Bleibt es Wunschziel, sind A1a/A1c keine
Blocker, sondern Designgrenzen.

---

## Tabelle: Annahme gegen harte Grenze

| Annahme | steht wo | harte Grenze (Fakt + URL) | Urteil | Kompromiss/Alternative |
|---|---|---|---|---|
| **A1a** Ende-zu-Ende-Sprachlatenz **< 800 ms** | `tech/CLOUDFLARE_MACHBARKEIT.md:9-10` („800 bis 950 ms"), `:73`; `sketches/2026-11-12-agentfaehig.md:118-119` | Cloudflares eigenes Budget: 40 ms Mikrofon + 300 ms STT + 400 ms LLM + 150 ms TTS = **890 ms**, also schon 90 ms über dem Ziel. https://blog.cloudflare.com/cloudflare-realtime-voice-ai/ | **GEHT NICHT** | Ziel auf „erstes Audio < 1 s" verschieben; Text zuerst; WebRTC/Realtime Agents statt WebSocket; kleinstes Front-Modell. |
| **A1b** **< 1 s bis zum ersten Audio** | `tech/CLOUDFLARE_MACHBARKEIT.md:58`, `docs/PROJECT.md:20` | Die Voice-Doku zeigt `first_audio_ms: 950`, `total_ms: 1200`. Ob das ein Messwert oder nur ein Beispiel ist, sagt die Seite nicht. https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ | **GEHT MIT KOMPROMISS** | 50 ms Reserve sind kein Budget. p95 messen, nicht p50; Satz-Chunking und kleines Modell erzwingen. |
| **A1c** **< 1 s für die ganze Antwort** mit TTS | `sketches/2026-11-12-agentfaehig.md:119` („under 1 sec even with TTS") | Dieselbe Doku: `total_ms: 1200` — 200 ms über dem Ziel. | **GEHT NICHT** | Abnahmekriterium auf „Time-to-First-Audio" definieren, nicht auf „Antwort fertig". |
| **A2** Queues als Transport für Agenten-Kommunikation in Echtzeit | `tech/INTENT.md:21` („Durable Objects, RPC, Sub-Agenten, Queues?") | Standard `max_batch_timeout` = **5 s** (Maximum 60 s), at-least-once, **keine Reihenfolgegarantie**, 128 KB pro Nachricht. https://developers.cloudflare.com/queues/configuration/batching-retries/ · https://developers.cloudflare.com/queues/reference/how-queues-works/ | **GEHT NICHT** | Echtzeit: DO-RPC/Sub-Agenten. Queues nur für Arbeit, die Sekunden warten darf. |
| **A2b** Queues für Analyse-/Backup-Arbeit im Hintergrund | `tech/research/cloudflare-bausteine.md:213-215` | 5 s Batch-Verzögerung ist dort egal; Consumer-Walltime 15 min. https://developers.cloudflare.com/queues/platform/limits/ | **GEHT** | — |
| **A3** Durable Objects für Zustands-Sync und/oder Audio-Streaming | `tech/CLOUDFLARE_MACHBARKEIT.md:31-32`, `:63`; `tech/research/cloudflare-bausteine.md:225-230` | DOs tragen WebSockets und Audio; Limits: 32 MiB WS-Nachricht, 1.000 req/s Soft-Limit pro Objekt, 6 gleichzeitige ausgehende Verbindungen pro Request, 30 s CPU (konfigurierbar 5 min). https://developers.cloudflare.com/durable-objects/platform/limits/ | **GEHT** | Während eines Calls `keepAlive`; ein DO pro Besucher ist unkritisch, weil Objektzahl unbegrenzt. |
| **A4a** Workers-AI-**STT** kann Deutsch | `tech/CLOUDFLARE_MACHBARKEIT.md:55`, `:98` | Der Katalog exportiert nur `@cf/deepgram/flux` **ohne Sprachparameter** (nur `encoding`, `sample_rate`, `eot_*`, `keyterm`). https://developers.cloudflare.com/workers-ai/models/flux/ · Deepgram: `flux-general-en` ist Englisch; Deutsch gibt es nur als separates `flux-general-multi`. https://developers.deepgram.com/docs/flux/language-prompting | **GEHT MIT KOMPROMISS** | `@cf/deepgram/nova-3` hat `language` (Deutsch `de`) — aber Nova-3 hat laut Deepgram **keine Turn Detection**. https://developers.deepgram.com/docs/models-languages-overview · Alternative: Deepgram direkt (`flux-general-multi`) am Agents-Provider vorbei. |
| **A4b** Workers-AI-**TTS** kann Deutsch | `tech/CLOUDFLARE_MACHBARKEIT.md:55`, `:98` | `@cf/deepgram/aura-1` hat 12 **englische** Stimmen und keinen Sprachparameter. https://developers.deepgram.com/docs/tts-models · Im Workers-AI-Katalog gibt es nur `aura-2-en` und `aura-2-es`, **kein** `aura-2-de`. https://developers.cloudflare.com/workers-ai/llms.txt · `melotts` unterstützt laut Upstream kein Deutsch (EN, ES, FR, ZH, JP, KR) und ist ab **20.11.2026** zur Deprecation vorgesehen. https://github.com/myshell-ai/MeloTTS · https://developers.cloudflare.com/workers-ai/models/melotts/ | **GEHT NICHT** | ElevenLabs-TTS (Deutsch, Median ~100 ms ohne Netz); https://elevenlabs.io/docs/models · Deepgram Aura-2-de direkt als eigener `TTSProvider` · oder Browser-`speechSynthesis` mit `de-DE` (Stimmenqualität geräteabhängig). |
| **A4c** Workers-AI-**LLM** kann Deutsch | `tech/research/cloudflare-bausteine.md:49-62` | Die offenen Modelle im Katalog sind mehrsprachig; eine belegte deutsche Qualitätszahl gibt es nicht. | **GEHT** | Qualität und Rate-Limit sind zwei Fragen: Qualität messen, Limit siehe A9. |
| **A5** Notion als **Laufzeit**-Gedächtnis des Agenten | **steht nicht im Repo.** Nur Zugangsstatus: `notion/README.md:7-11`, Exportoptionen `:32-35`. Kein Tech-Dokument fordert Notion zur Laufzeit. | 180 req/min (3/s) auf Nicht-Business-Plänen, **pro Workspace geteilt**; separate Query-Grenze ~3/s; 500 KB und 1.000 Blöcke pro Request; 429 mit `Retry-After` bis 60 s; kein Push/Streaming. https://developers.notion.com/reference/request-limits | **GEHT NICHT** | Gesprächsspeicher in DO-SQLite (die Voice-Pipeline persistiert dort bereits: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/). Notion asynchron als Projekt-/Wissensspiegel. |
| **A6** Vectorize als **sofort konsistentes** Gedächtnis (schreiben, gleich lesen) | `tech/INTENT.md:26`; `tech/CLOUDFLARE_MACHBARKEIT.md:39,64` | Schreiben landen zuerst im Write-Ahead-Log; sichtbar werden sie erst nach einem **asynchronen** Index-Job. Jobs fassen bis zu 1.000 Updates zusammen; 250.000 Einzel-Inserts „could take at least an hour". https://developers.cloudflare.com/vectorize/best-practices/insert-vectors/ | **GEHT NICHT** | DO-SQLite als Source of Truth, Vectorize als Hintergrundindex mit Version/Tombstone. AI Search indexing ist ebenfalls „automatically and continuously", also dieselbe Klasse Verzögerung: https://developers.cloudflare.com/ai-search/ |
| **A7** PDF-Verarbeitung mit **pypdfium2** **in** der Worker-Runtime | Nur als **lokales** Werkzeug belegt: `sketches/2026-11-12-agentfaehig.md:10`, `:177` (Rastern der Skizze auf dem Mac). Keine Produktanforderung im Repo. | Workers Python unterstützt pure Python und **PyEmscripten**-Wheels. https://developers.cloudflare.com/workers/languages/python/packages/ · pypdfium2 5.15.2 hat tatsächlich ein `pyemscripten_2026_0_wasm32`-Wheel (2,57 MB). https://pypi.org/pypi/pypdfium2/json · Ob dieses ABI im aktuellen workerd/Pyodide lädt, ist nirgends belegt. Worker: 64 MiB uncompressed, 1 s Startup. https://developers.cloudflare.com/workers/platform/limits/ | **UNKLAR** | Nicht nötig für das Produkt. Falls doch: `pdf.js`/`unpdf` in JS, AI-Search-OCR beim Upload, oder Container. |
| **A8** Generative UI (json-render / A2UI / AI SDK) im selben Stack | `tech/UPSTREAM_SEARCH.md:19`; `tech/CLOUDFLARE_MACHBARKEIT.md:61`; `tech/research/konkurrenz.md:39-41` | json-render rendert **clientseitig** React aus einem JSON-Katalog; der Worker liefert nur JSON/Assets. Kein Runtime-Konflikt. https://json-render.dev/docs | **GEHT** | Katalog ist die Sicherheitsgrenze; `workers-ai-provider` ist archiviert (`tech/research/cloudflare-bausteine.md:363-367`), also `createAI` aus dem Agents SDK oder OpenAI-kompatibler Endpoint. |
| **A9** Vier Agentenrollen gleichzeitig unter einem Latenzbudget | `tech/CLOUDFLARE_MACHBARKEIT.md:29-42`, `:47-49`; `sketches/2026-11-12-agentfaehig.md:115-119` | Sub-Agenten sind co-lokalisierte DOs mit eigenem SQLite und lassen sich parallel aufrufen. https://developers.cloudflare.com/agents/agent-class/sub-agents/ · Aber: Paid-Textmodelle haben **20 req/min pro Account und Modell** (50 mit Prepaid-Credits). Vier Rollen × 1 Call = 4 Calls/Turn → **5 Turns/min global**. https://developers.cloudflare.com/workers-ai/platform/limits/ | **GEHT MIT KOMPROMISS** | Front antwortet ohne auf Sub-Agenten zu warten; Sub-Agenten asynchron; nicht alle Rollen auf dasselbe Paid-Modell legen; 300 req/min für Nicht-Paid-Textmodelle einplanen (Doku nennt sie pro Task-Typ, nicht ausdrücklich pro Account). |
| **A10** **Eine** WebSocket-Verbindung für Audio, Text, Zustand und Animationssignale | `tech/CLOUDFLARE_MACHBARKEIT.md:30`, `:40-41`, `:44-49` | Der Voice-Client bietet `sendJSON`/`custommessage` für App-Nachrichten, aber **kein** `setState`/`onStateUpdate` in `useVoiceAgent`; dessen Rückgabe listet Status, Transkript, Metriken, Pegel, Aktionen — keinen Agent-State. https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ | **GEHT MIT KOMPROMISS** | Zustand als Custom-Message über denselben Socket oder zweite `useAgent`-Verbindung. Ob `setState` an Voice-Clients broadcastet, ist nicht dokumentiert → Code-Lesen oder Spike. |
| **A11** Der Agent kann **nachträglich** sprechen, wenn ein Sub-Agent fertig ist | `tech/CLOUDFLARE_MACHBARKEIT.md:60`, `:99` („steht in keiner geprüften Quelle") | Die Doku nennt `speak(connection, text)` und `speakAll(text)`. https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ | **GEHT** | Verhalten bei laufender Wiedergabe (Queue? Abbruch?) ist nicht beschrieben → testen. |
| **A12** Wort-Zeitmarken für den Typewriter | `tech/ABGLEICH.md:48-54`, besonders `:53-54` | Der Voice-Client liefert Text, `interimTranscript` und Pipeline-Metriken, **keine Wortzeiten**. Flux liefert `words[]`, im Cloudflare-Schema ohne Start/End-Zeiten. https://developers.cloudflare.com/workers-ai/models/flux/ | **UNKLAR** | Client taktet selbst nach Wortlänge; Drift gegenüber der Stimme in Kauf nehmen oder Stimme erst nach Satzende starten. |
| **A13** Satzweises Vorlesen, während das Modell noch schreibt | `tech/CLOUDFLARE_MACHBARKEIT.md:58` | „LLM tokens are sentence-chunked and synthesized concurrently." https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ | **GEHT** | Erste Sätze kurz halten, sonst wächst Time-to-First-Audio. |

**Zählung:** 6 GEHT · 4 GEHT MIT KOMPROMISS · 6 GEHT NICHT · 2 UNKLAR.

---

## Harte Blocker

Nur die `GEHT NICHT`-Fälle. Je 2–3 Sätze: was bricht, warum, was stattdessen.

### 1. „Unter 800 ms" und „unter 1 s für die ganze Antwort" (A1a, A1c)

Das 800-ms-Ziel ist schon in Cloudflares eigener Addition gerissen: 40 + 300 +
400 + 150 = 890 ms, bevor irgendetwas dazwischenkommt. Die veröffentlichte
Beispielmessung der Voice-Doku liegt bei 950 ms bis zum ersten Audio und
1.200 ms für den ganzen Turn; damit ist „unter 1 s fertig" nicht erreichbar,
und „unter 800 ms" ist es auch nicht mit dem schnellsten Modell garantiert.
Was bleibt: das Kriterium auf **Time-to-First-Audio** schneiden, Text als
Grundweg liefern, und für Sprache WebRTC/Realtime Agents oder ein kleineres
Front-Modell messen — nicht versprechen.

### 2. Queues als Echtzeit-Transport (A2)

Queues liefert standardmäßig erst nach **5 Sekunden** Batch-Timeout aus
(konfigurierbar 0–60 s), garantiert keine Reihenfolge und kann Nachrichten
doppelt zustellen. Das ist um den Faktor 6 über dem Latenzbudget und damit
kein Transport für „Front-Agent ruft Analyse-Agent". Was bleibt: DO-RPC bzw.
Sub-Agenten für alles, was während eines Turns passiert; Queues nur für
Aufträge, die Sekunden bis Minuten warten dürfen.

### 3. Deutscher TTS auf Workers AI (A4b)

Im Workers-AI-Katalog gibt es keine deutsche Stimme: `aura-1` ist Englisch
(12 Stimmen), `aura-2` nur `en` und `es`, und `melotts` kann laut Upstream
kein Deutsch und wird ab **20.11.2026** abgekündigt. Deepgram hat deutsche
Aura-2-Stimmen, Cloudflare exportiert sie aber nicht. Was bleibt: ElevenLabs
(Deutsch, ~100 ms Median ohne Netz), Deepgram Aura-2-de direkt als eigener
Provider, oder Browser-TTS — jeweils mit eigener Latenz-, Kosten- und
Qualitätsmessung.

### 4. Notion als Laufzeit-Gedächtnis (A5)

Notion erlaubt 180 Requests/Minute (3/s) auf normalen Plänen, geteilt über den
ganzen Workspace, mit 429 und `Retry-After` bis 60 s; ein Request trägt
maximal 500 KB bzw. 1.000 Blöcke, und es gibt kein Push. Ein Agent, der pro
Turn liest und schreibt, läuft damit sofort in Drosselung. Was bleibt:
DO-SQLite als Gesprächsspeicher (die Voice-Pipeline schreibt dort ohnehin
bereits), Notion asynchron als Projekt- und Wissensspiegel.

### 5. Vectorize als sofort konsistentes Gedächtnis (A6)

Vectorize schreibt in ein Write-Ahead-Log und macht Änderungen erst nach einem
asynchronen Index-Job sichtbar; Jobs bündeln bis zu 1.000 Updates, und die Doku
nennt für 250.000 Einzel-Inserts „at least an hour". „Schreiben, dann im
nächsten Satz wieder lesen" ist damit nicht garantiert. Was bleibt: DO-SQLite
als Source of Truth und Vectorize als Hintergrundindex, der semantische
Treffer nachliefert — nie als primäre Lesequelle im selben Turn.

---

## Zahlen, die kippen

Repo-Anspruch gegen echte Grenze. „Delta" ist die Differenz, die den Anspruch
kippt.

| Anspruch (Repo) | Quelle im Repo | Echte Grenze (Upstream) | Delta / Folge |
|---|---|---|---|
| 800 ms E2E | `tech/CLOUDFLARE_MACHBARKEIT.md:9-10` | 890 ms Summe des Cloudflare-Budgets | **+90 ms**, bevor Overhead beginnt |
| 800 ms E2E | ebd. | 950 ms `first_audio_ms` im Doku-Beispiel | **+150 ms** |
| 1.000 ms ganze Antwort | `sketches/2026-11-12-agentfaehig.md:119` | 1.200 ms `total_ms` | **+200 ms** |
| 1.000 ms erstes Audio | `docs/PROJECT.md:20` | 950 ms `first_audio_ms` | nur **50 ms** Reserve (5 %) |
| „no latency!" | `sketches/2026-11-12-agentfaehig.md:118` | 890–1.200 ms | Faktor 1,1–1,5 über dem 800-ms-Ideal |
| Stille-Erkennung | `tech/CLOUDFLARE_MACHBARKEIT.md:82` | Client-Default `silenceDurationMs: 500` | **62,5 %** des 800-ms-Budgets; ob additiv zu Flux-EOT, sagt die Doku nicht |
| WebSocket-Chunking | `tech/research/cloudflare-bausteine.md:318-321` | 100–500 ms pro Chunk = Latency Floor | **12–62 %** des 800-ms-Budgets zusätzlich |
| 20 req/min Paid-Modell | `tech/research/cloudflare-bausteine.md:282-286` | 20/min pro Account und Modell (50 mit Prepaid) | 4 Rollen = **5 Turns/min global** |
| 300 req/min Text-Generation | `tech/research/cloudflare-bausteine.md:281` | 300/min pro Task-Typ | 75 Turns/min bei 4 Calls — reicht für klein |
| 720 req/min STT | `tech/research/cloudflare-bausteine.md:279` | 720/min | 12 Turns/s — nicht bindend |
| 1.000 req/s pro DO | `tech/research/cloudflare-bausteine.md:269-270` | Soft-Limit 1.000 req/s pro Objekt | bei 1 Voice-Session nicht bindend |
| 6 ausgehende Verbindungen | `tech/research/cloudflare-bausteine.md:268` | 6 pro Request | 3 Sub-Agenten passen, 7 nicht mehr |
| 32 MiB WebSocket-Nachricht | `tech/research/cloudflare-bausteine.md:265` | 32 MiB (nur empfangen) | 16 kHz/16-bit = 32 KB/s → ~17 min Audio pro Nachricht |
| Queue als Agenten-Transport | `tech/INTENT.md:21` | 5 s Standard-Batch-Timeout, max. 60 s | **6,25×** über 800 ms |
| 128 KB Queue-Nachricht | `tech/research/cloudflare-bausteine.md:211-215` | 128 KB | 16 kHz/16-bit → **4 s** PCM pro Nachricht |
| Notion pro Turn | `notion/README.md` (nur Zugang) | 180 req/min = 3/s, workspace-weit | max. 3 Lesevorgänge/s für alle Agenten zusammen |
| Vectorize sofort lesbar | `tech/INTENT.md:26` | asynchroner Index-Job, 1.000 Updates pro Job | „at least an hour" bei 250k Einzel-Inserts |
| pypdfium2 im Worker | `sketches/2026-11-12-agentfaehig.md:10,177` (lokal) | Wheel 2,57 MB; Worker 64 MiB, 1 s Startup | Größe unkritisch, ABI/Startzeit offen |
| MeloTTS als Rückfall | `tech/research/cloudflare-bausteine.md:39-41` | Deprecation **20.11.2026** | fällt einen Tag nach diesem Bericht weg |
| Externe TTS-Kapazität | — | ElevenLabs Concurrency: Free 4, Pro 20 (Flash) | parallele Sprecher hart begrenzt |

---

## Vor dem Bau zu klären

Offene Fragen, die eine Messung brauchen — jeweils mit einem Weg, der **keinen
Produktcode** erfordert.

1. **Klingt Deutsch mit Aura-1/aura-2-en akzeptabel?**
   Ein einzelner REST-Call mit deutschem Text an `@cf/deepgram/aura-1` und
   `aura-2-en`, Ergebnis anhören. Kein Worker, kein Deploy. Damit ist die
   Frage „englische Phonetik auf deutschem Text" in Minuten beantwortet.
2. **Wie gut ist deutsches STT mit Nova-3, und wie gut mit Flux?**
   Zehn deutsche Sätze aufnehmen, einmal an `@cf/deepgram/nova-3` mit
   `language=de`, einmal an `flux`. Transkripte von Hand vergleichen. Kein
   Build. Zusätzlich: bei Cloudflare anfragen, ob `flux-general-multi` in den
   Katalog kommt — sonst ist deutsches Turn-Taking nicht belegt.
3. **Wie verhält sich Turn-Taking auf Deutsch?**
   Deepgram `flux-general-multi` direkt per WebSocket-Demo testen (nicht über
   Cloudflare). Damit sieht man EOT-Verhalten und Unterbrechungen, bevor eine
   Architektur daran hängt. Ohne diesen Test bleibt A4a nur „Sprache erkannt",
   nicht „Gespräch fühlt sich richtig an".
4. **Hält die Latenz mit einem echten Front-Modell?**
   Das Upstream-Beispiel `examples/voice-agent` lokal mit `wrangler dev`
   starten und 20 deutsche Wechsel fahren; der Client liefert
   `first_audio_ms`/`total_ms`. Das ist Upstream-Code, kein Eigenbau — braucht
   aber Klon und Owner-Freigabe. Ohne Freigabe: 950/1.200 ms als Baseline
   zitieren und **keine** eigene Zahl behaupten.
5. **Trägt eine Verbindung Audio, Zustand und Signale?**
   Quellcode von `useVoiceAgent` im Paket `agents` lesen: Wird `setState` an
   Voice-Clients gesendet oder nur an `useAgent`-Clients? Reines Code-Lesen,
   kein Build. Ergebnis entscheidet, ob eine oder zwei Verbindungen nötig sind.
6. **Wie lange dauert Vectorize bis „sichtbar"?**
   Ein Skript gegen die REST-API: einen Vektor upserten, in einer Schleife
   queryen, Zeit bis zum Treffer notieren. 30 Minuten, kein Worker. Ergebnis
   entscheidet, ob Write-then-Read überhaupt als Muster erlaubt ist.
7. **Was kostet ein Notion-Zugriff real?**
   `curl -w` gegen die eigene Seite, 20 Messungen. Kein Build. Wenn p95 über
   300 ms liegt, ist Notion als Turn-Gedächtnis endgültig raus.
8. **Lädt pypdfium2 im Worker?**
   `pywrangler`-Hallo-Welt plus `import pypdfium2` und eine Seite rastern.
   Ein Deploy, kein Produktcode. Nur nötig, falls PDF wirklich Produktumfang
   wird — im Repo ist es das nicht.
9. **Welches Modell-Tier ist bezahlbar und erlaubt?**
   Vor dem Bau entscheiden, ob Paid-Modelle (20/min) oder Nicht-Paid
   (300/min) die Rollen tragen; sonst ist die öffentliche Seite sofort
   gedrosselt. Limit-Erhöhung früh beantragen, nicht nach dem Launch.

---

## Was das für die Reihenfolge heißt

Risiko-first, nicht Feature-first. Jede Stufe kann die nächste kippen.

1. **Deutsch zuerst klären (A4a/A4b).** Zwei einzelne API-Calls entscheiden,
   ob Sprache überhaupt in den ersten Build gehört. Fällt TTS Deutsch weg,
   ist der ganze Voice-Pfad ein anderer.
2. **Latenz messen, bevor Architektur festgelegt wird (A1).** Ein gemessener
   Lauf mit Upstream-Beispiel und deutschem Text; erst danach über WebSocket
   vs. WebRTC und Front-Modell entscheiden. Bis dahin bleibt „unter 1 s" ein
   Wunschziel.
3. **Verbindungsmodell prüfen (A10).** Eine oder zwei WebSockets entscheidet,
   ob Regler, Augen und Audio denselben Kanal teilen — das ist teuer
   nachzurüsten.
4. **Gedächtnis lokal beginnen (A5/A6).** DO-SQLite als Source of Truth,
   Vectorize/AI Search erst danach und asynchron. Wer mit Vectorize als
   Primärspeicher startet, baut eine Konsistenzlücke ein, die später jede
   Antwort gefährdet.
5. **Orchestrierung über Sub-Agenten (A2/A9).** Nicht über Queues. Die
   Rate-Limits (20/min pro Modell) gehören in die Kapazitätsplanung, nicht in
   die Nachrüstung.
6. **Generative UI zuletzt (A8).** Sie ist clientseitig, gut isoliert und
   blockiert nichts anderes; sie braucht nur einen stabilen JSON-Vertrag.

**Querschnitt:** Text-first macht A1a, A1c und A4b aus dem kritischen Pfad
heraus. Das ist keine Empfehlung für die Produktentscheidung, sondern die
technische Folge: Text hat kein STT, kein TTS und damit 450 ms weniger im
Budget.

---

## Quellen (alle 19.11.2026 abgerufen)

- https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/
- https://developers.cloudflare.com/agents/agent-class/sub-agents/
- https://developers.cloudflare.com/workers-ai/platform/limits/
- https://developers.cloudflare.com/workers-ai/models/flux/
- https://developers.cloudflare.com/workers-ai/models/aura-1/
- https://developers.cloudflare.com/workers-ai/models/melotts/
- https://developers.cloudflare.com/workers-ai/models/nova-3/
- https://developers.cloudflare.com/durable-objects/platform/limits/
- https://developers.cloudflare.com/queues/platform/limits/
- https://developers.cloudflare.com/queues/configuration/batching-retries/
- https://developers.cloudflare.com/queues/reference/how-queues-works/
- https://developers.cloudflare.com/vectorize/platform/limits/
- https://developers.cloudflare.com/vectorize/best-practices/insert-vectors/
- https://developers.cloudflare.com/ai-search/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/languages/python/packages/
- https://blog.cloudflare.com/cloudflare-realtime-voice-ai/
- https://developers.deepgram.com/docs/tts-models
- https://developers.deepgram.com/docs/models-languages-overview
- https://developers.deepgram.com/docs/flux/language-prompting
- https://developers.notion.com/reference/request-limits
- https://elevenlabs.io/docs/models
- https://json-render.dev/docs
- https://pypi.org/pypi/pypdfium2/json
- https://github.com/myshell-ai/MeloTTS
