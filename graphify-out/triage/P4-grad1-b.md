# P4 — Grad-1-Triage: Cloudflare-Research, Konkurrenz, Brief/Machbarkeit, Upstream-Repos

Read-only Prüfung. Graph: `graphify-out/graph.json` (160 Knoten, 183 Links, 12 Hyperedges).
Kontingent: 23 Knoten (a 10, b 2, c 4, d 7). Nichts außer dieser Datei geändert, kein `graphify`-Lauf, kein git.

**Kurzfassung:** Die Verweiskette Cloudflare ist in den Dateien **vollständig geschrieben**; sie fehlt im Graphen. Von 23 Grad-1-Knoten sind **10 Identitäts-Splits des Extraktors** (dasselbe Konzept steht zweimal unter zwei Labels im Graph), **1 Anker-Fehler**, **12 echte Blätter** — davon nur **8 mit echtem Handlungsbedarf**, 4 sind legitim isoliert.

## Tabelle

| # | Label | Grad | Datei | Kategorie | Begründung (Beleg) | Vorschlag (Datei + was) | Aufwand |
|---|---|---|---|---|---|---|---|
| 1 | Cloudflare Agents SDK | 1 | `tech/research/cloudflare-bausteine.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split: derselbe Begriff existiert als „Agents SDK" mit Grad 4 (`tech/ABGLEICH.md`, Kanten `Abgleich Document →references`, `Brief Cloudflare-Bausteine →references`, Hyperedge 11). Inhaltlich zusätzlich in `research/cloudflare-bausteine.md:232` („Vorab-Fund") und `research/konkurrenz.md:47`; der Graph kennt nur eine Kante. | Extraktor: Alias `Cloudflare Agents SDK` → `Agents SDK`. Keine Dokumentänderung. | S |
| 2 | Cloudflare Queues | 1 | `tech/research/cloudflare-bausteine.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „Queues" (`tech/briefs/cloudflare-bausteine.md`, Grad 1). Derselbe Baustein: `research/…:209-215` (Absatz „Queues (ein Satz)") und `briefs/…:29`. Zusätzlich `tech/INTENT.md:21` („Queues?"), im Graph ohne Kante. | Alias `Cloudflare Queues` → `Queues`. | S |
| 3 | Cloudflare Workflows | 1 | `tech/research/cloudflare-bausteine.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „Workflows" (`briefs/…`, Grad 1). `research/…:202-207` und `briefs/…:29`. | Alias `Cloudflare Workflows` → `Workflows`. | S |
| 4 | Deepgram | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT | Echte Wissenszeile: STT-Provider, `research/…:20-29` (`@cf/deepgram/flux`, `DeepgramSTT`) und `:309` (Edge-Nähe, 330+ Städte). Zweite Fundstelle ohne Kante: `research/konkurrenz.md:33` („austauschbar gegen Deepgram STT"), dritte: `tech/LUECKEN.md:116`. | `tech/research/konkurrenz.md:33`: internen Verweis auf `research/cloudflare-bausteine.md` T1 ergänzen („Beleg: …"). | S |
| 5 | ElevenLabs | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT | Wie Deepgram: `research/…:27-29` (`ElevenLabsTTS`), zweite Fundstelle `research/konkurrenz.md:33`, dritte `LUECKEN.md:116`. | Gleiche Stelle in `konkurrenz.md:33` mitverweisen (ein Satz für beide Provider). | S |
| 6 | Plivo | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT (legitim) | Nur `research/…:28` als Telefonie-Provider. Telefonie ist laut `tech/UPSTREAM_SEARCH.md:24` „nicht gefragt". Ein zweiter Verweis wäre künstlich. | keiner | — |
| 7 | Telnyx | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT (legitim) | Nur `research/…:28` und `:98-100` (TelnyxTTS `backend: "websocket"`, Time-to-First-Audio). Relevanter Fakt, aber in keiner anderen Datei behauptet. | keiner | — |
| 8 | Twilio | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT (legitim) | `research/…:27-29` (Telefonie), `:358-362` (Repo `phonecall` = Grok Voice + Twilio). `konkurrenz.md:80` nennt „Twilio ConversationRelay" nur in der Liste *nicht abgerufener* Quellen — negative Erwähnung, kein Wissen. | keiner | — |
| 9 | Workers AI LLM Models | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT | Katalog-Facette `research/…:49-62` (kleine/schnelle vs. große Modelle). Inhaltlich trägt sie T4: `tech/CLOUDFLARE_MACHBARKEIT.md:60` sagt „Modellnamen Worker", ohne die Datei zu verlinken. | `tech/CLOUDFLARE_MACHBARKEIT.md:60` (Beleg-Spalte T4): `Worker` → interner Verweis auf `research/cloudflare-bausteine.md`, Abschnitt T4. | S |
| 10 | Workers AI Vision Models | 1 | `tech/research/cloudflare-bausteine.md` | ECHTES-BLATT | Katalog-Facette `research/…:42-48`; `machbarkeit:57` nennt dasselbe Modell (`llama-3.2-11b-vision-instruct`) als „nicht gegengeprüft" — mit externem Link, ohne interne Quelle. | `tech/CLOUDFLARE_MACHBARKEIT.md:57`: internen Verweis auf `research/…:42-48` ergänzen. | S |
| 11 | LiveKit Agents | 1 | `tech/research/konkurrenz.md` | ECHTES-BLATT | `konkurrenz.md:27` (Framework, WebRTC, eigenes Turn-Detection-Modell). Zweite Fundstelle ohne Kante: `UPSTREAM_SEARCH.md:21` („Python auf LiveKit"). Transport-Frage, an der T2 hängt. | `tech/UPSTREAM_SEARCH.md:21` Verweis auf `research/konkurrenz.md:27`; alternativ `machbarkeit:92` (WebRTC-Ausweichpfad) mit Verweis auf die Konkurrenz-Alternativen. | M |
| 12 | Open WebUI | 1 | `tech/research/konkurrenz.md` | ECHTES-BLATT (legitim) | Nur `konkurrenz.md:21` (Gruppe 1 „Agent statt Website"). Keine Zieldatei hat einen Satz, in dem Open WebUI hingehört; kein Cloudflare-Baustein, kein Upstream. | keiner | — |
| 13 | AI Gateway | 1 | `tech/briefs/cloudflare-bausteine.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „Cloudflare AI Gateway" (`research/…`, Grad 2). `briefs/…:29` (Auftrag) und `research/…:335-341` (Absatz „AI Gateway (ein Satz)"). | Alias `AI Gateway` ↔ `Cloudflare AI Gateway`. | S |
| 14 | Queues | 1 | `tech/briefs/cloudflare-bausteine.md` | EXTRAKTOR-ARTEFAKT | Gegenstück zu #2; `briefs/…:29` und `research/…:209`. | Alias (siehe #2). | S |
| 15 | Workflows | 1 | `tech/briefs/cloudflare-bausteine.md` | EXTRAKTOR-ARTEFAKT | Gegenstück zu #3; `briefs/…:29` und `research/…:202`. | Alias (siehe #3). | S |
| 16 | WebSocket Transport | 1 | `tech/CLOUDFLARE_MACHBARKEIT.md` | HUB-FEHLER | Einzige Kante ist `Front-Agent --shares_data_with-->` — entstanden aus der Mermaid-Kante `machbarkeit:30` („eine WebSocket-Verbindung"). Der Knoten ist aber keine Eigenschaft des Front-Agenten, sondern die T2-Transportentscheidung: belegt in `research/…:312-322` (WebSocket vs. WebRTC, Chunking als Latenz-Floor) und in `machbarkeit:75-76`. Diese Verbindung fehlt im Graph vollständig. | `tech/CLOUDFLARE_MACHBARKEIT.md:75-76`: Satz „Der Worker-Bericht begründet das mit dem Chunking als Latenz-Floor (`research/cloudflare-bausteine.md`, Abschnitt Latenz)." Anker muss der T2-Abschnitt sein, nicht `Front-Agent`. | S |
| 17 | a2ui-project/a2ui | 1 | `tech/UPSTREAM_SEARCH.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „A2UI" (`research/konkurrenz.md:40`, Grad 3 + Hyperedge 3). Zusätzlich **URL-Widerspruch**: `konkurrenz.md:40` → `github.com/google/A2UI`, `UPSTREAM_SEARCH.md:20` → `github.com/a2ui-project/a2ui`. Ob Umzug/Umbenennung vorliegt: **UNKLAR**, nicht belegt. | Extraktor: Alias. Redaktionell: `UPSTREAM_SEARCH.md:20` Verweis auf `research/konkurrenz.md:40`; URL-Differenz als offenen Punkt vermerken, nicht auflösen. | S |
| 18 | anomalyco/phonecall | 1 | `tech/UPSTREAM_SEARCH.md` | ECHTES-BLATT | Zweite Fundstelle ohne Kante: `research/…:358-362` (Upstream-Kandidat Nr. 4) und `:383-385` („nicht als Cloudflare-Baustein zählen"). Die beiden Kandidatenlisten kennen sich nicht. | `tech/research/cloudflare-bausteine.md:343` („## Upstream-Kandidaten"): ein Satz „Die geprüfte Fassung mit Verdicts steht in `../UPSTREAM_SEARCH.md`." | S |
| 19 | cloudflare/agents-starter | 1 | `tech/UPSTREAM_SEARCH.md` | ECHTES-BLATT | Zweite Fundstelle ohne Kante: `research/…:351-353` (mit Lizenz/Stars/Push). Nur in einer der beiden Listen extrahiert. | Gleicher Satz an `research/…:343` deckt #18–#20 mit ab. | S |
| 20 | cloudflare/realtime-examples | 1 | `tech/UPSTREAM_SEARCH.md` | ECHTES-BLATT | Zweite Fundstelle ohne Kante: `research/…:354-357` (kein License-Feld), dritte: `LUECKEN.md:207`. Relevanz für T2 (WebRTC-Ausweichpfad, `UPSTREAM_SEARCH.md:23`). | Gleicher Satz an `research/…:343`; zusätzlich optional Verweis von `machbarkeit:92`. | S |
| 21 | pipecat-ai/pipecat | 1 | `tech/UPSTREAM_SEARCH.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „Pipecat" (`konkurrenz.md:28,64`, Grad 2). `UPSTREAM_SEARCH.md:22` beruft sich auf „Referenzwert 500–800 ms" — der Wert steht in `konkurrenz.md:64`, ohne Verweis. | Alias; redaktionell `UPSTREAM_SEARCH.md:22` auf `research/konkurrenz.md:64` verweisen. | S |
| 22 | stimm-ai/stimm | 1 | `tech/UPSTREAM_SEARCH.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „Stimm" (`konkurrenz.md:29,51`, Grad 3 + Hyperedge 10). `UPSTREAM_SEARCH.md:21` beschreibt dasselbe Repo wie `konkurrenz.md:29`. | Alias; `UPSTREAM_SEARCH.md:21` Verweis auf `konkurrenz.md:29`. | S |
| 23 | vercel-labs/json-render | 1 | `tech/UPSTREAM_SEARCH.md` | EXTRAKTOR-ARTEFAKT | Identitäts-Split zu „json-render" (`konkurrenz.md:41`, Grad 3 + Hyperedge 3); dritte Fundstelle `machbarkeit:61`. `UPSTREAM_SEARCH.md:19` sagt „laut Worker-Bericht" — der Bericht ist `konkurrenz.md:41`, nicht verlinkt. | Alias; `UPSTREAM_SEARCH.md:19` auf `konkurrenz.md:41` verweisen. | S |

### Zählung je Kategorie

| Kategorie | Anzahl |
|---|---|
| EXTRAKTOR-ARTEFAKT | 10 |
| ECHTES-BLATT (davon mit Handlungsbedarf 8 / legitim isoliert 4) | 12 |
| HUB-FEHLER | 1 |
| PLATZHALTER | 0 |
| AST-RAUSCHEN | 0 |
| UNKLAR (Teilbefund in #17) | 1 Vermerk |
| **Summe** | **23** |

## Verweiskette Cloudflare

### Ist-Zustand in den Dateien: vollständig verlinkt

| Von | Nach | Beleg |
|---|---|---|
| research (Cloudflare) | Brief | `tech/research/cloudflare-bausteine.md:8` |
| research (Cloudflare) | INTENT | `tech/research/cloudflare-bausteine.md:9` |
| Brief | INTENT | `tech/briefs/cloudflare-bausteine.md:14` |
| Brief | research (als Schreibziel) | `tech/briefs/cloudflare-bausteine.md:44` |
| Machbarkeit | INTENT | `tech/CLOUDFLARE_MACHBARKEIT.md:16` |
| Machbarkeit | research (Cloudflare) | `tech/CLOUDFLARE_MACHBARKEIT.md:17` |
| Machbarkeit | research (Konkurrenz) | `tech/CLOUDFLARE_MACHBARKEIT.md:18` |
| Machbarkeit | UPSTREAM_SEARCH | `tech/CLOUDFLARE_MACHBARKEIT.md:19` |
| INTENT | UPSTREAM_SEARCH | `tech/INTENT.md:34` |
| INTENT | research (Konkurrenz) | `tech/INTENT.md:45` |
| INTENT | research (Cloudflare) | `tech/INTENT.md:46` |
| INTENT | briefs/ (Ordner) | `tech/INTENT.md:49` |
| INTENT | Machbarkeit | `tech/INTENT.md:53` |
| INTENT | ABGLEICH | `tech/INTENT.md:55` |
| INTENT | Skizze | `tech/INTENT.md:5` |

Die Kette research → Brief → Machbarkeit → INTENT ist also **nicht behauptet, sondern geschrieben**. Es gibt keine Lücke im Text.

### Ist-Zustand im Graphen: an vier Stellen gebrochen

| Erwartete Kante | Im Graph | Befund |
|---|---|---|
| Brief → INTENT | vorhanden (`references`, EXTRACTED) | einziges intaktes Glied der Kette |
| research → Brief (`:8`) | **fehlt** | `Cloudflare-Bausteine Research` hat `in=0`, `out=22` — keine Kante zum Brief |
| research → INTENT (`:9`) | **fehlt** | dito; INTENT hat nur 3 eingehende Kanten, keine davon aus research |
| Brief → research (`:44`) | **fehlt** | `Brief Cloudflare-Bausteine` hat `in=0`, `out=11`; keine Kante zu research |
| Machbarkeit → INTENT (`:16`) | **fehlt** | Knoten `CLOUDFLARE_MACHBARKEIT.md` hat `out=0`, `in=1` (nur `INTENT --cites-->`) |
| Machbarkeit → research ×2, → UPSTREAM (`:17-19`) | **fehlen alle** | dito, `out=0` |
| INTENT → research ×2, Machbarkeit, ABGLEICH (`:45,46,53,55`) | **fehlen als Kanten zu den Dateiknoten** | Die Links wurden extrahiert, aber als **vier neue Dokumentknoten** `konkurrenz.md`, `cloudflare-bausteine.md`, `CLOUDFLARE_MACHBARKEIT.md`, `ABGLEICH.md` (alle `deg=1`, `in=1`, `out=0`), getrennt von den gleichnamigen Datei-Hubs |

Damit hat die Kette im Graphen **null durchgehende Pfade**: research, Brief, Konkurrenz und UPSTREAM haben je `in=0`; die Machbarkeit hat `out=0`.

**Ursache: UNKLAR, nicht belegt.** Zwei Muster sind sichtbar, nur eines ist belegbar:
- belegt: Zielpfade werden als neuer Dokumentknoten angelegt statt auf den bestehenden Dateiknoten aufgelöst (die vier `…md`-Knoten aus INTENT).
- **nicht** belegbar: warum `research:8/9` und `machbarkeit:16-19` gar keine Kante erzeugen. Die Schreibweise `[`pfad`](pfad)` ist in `briefs/…:14` identisch und erzeugt dort eine Kante. Eine Ursachenbehauptung wäre geraten.

*Hinweis:* Die vier `…md`-Knoten und `Cloudflare Machbarkeit Document` (`tech/ABGLEICH.md`) gehören zum Kontingent der Parallel-Prüfer (INTENT/ABGLEICH). Hier nur als Ketten-Beleg genannt, nicht bewertet, nicht angefasst.

## Nur echte Lücken

Nach Wirkung sortiert. Alles andere aus der Tabelle ist Alias-Arbeit (Extraktor) oder legitim isoliert.

1. **WebSocket Transport (#16) — Transportentscheidung ohne Anker.** `machbarkeit:75-76` zitiert den Cloudflare-Blog („WebRTC is the better choice"), aber nicht den eigenen Worker-Bericht, der genau dazu die Chunking-Zahlen hat (`research/…:318-322`). Ein Satz in `tech/CLOUDFLARE_MACHBARKEIT.md:75` schließt die Lücke und ist inhaltlich nötig, nicht kosmetisch. Aufwand: S.
2. **UPSTREAM_SEARCH beruft sich auf zwei Worker-Berichte, ohne sie zu verlinken.** `:19` („laut Worker-Bericht … Slider-Baustein"), `:21` (Stimm-Muster), `:22` („Referenzwert 500–800 ms" — steht in `konkurrenz.md:64`), `:23` (Realtime-Beispiele). Ein Satz unter `tech/UPSTREAM_SEARCH.md:13` („Die Zeilen stammen aus `research/konkurrenz.md` und `research/cloudflare-bausteine.md`.") repariert vier Knoten auf einmal (#17, #21, #22, #23) und macht die Belegkette prüfbar. Aufwand: S.
3. **Zwei Kandidatenlisten, kein Querverweis.** `research/…:343-374` („Upstream-Kandidaten") und `UPSTREAM_SEARCH.md:11-24` („Kandidaten") listen dieselben Repos; nur eine Liste hat eine Kante in den Graph. Deshalb hängen `phonecall`, `agents-starter`, `realtime-examples` an genau einer Kante. Ein Satz an `research/…:343` („Geprüfte Fassung mit Verdicts: `../UPSTREAM_SEARCH.md`") löst #18–#20. Aufwand: S.
4. **Deepgram/ElevenLabs (#4, #5) — Austauschbarkeit behauptet, nicht verlinkt.** `konkurrenz.md:33` sagt „austauschbar gegen Deepgram STT und ElevenLabs TTS", ohne Bezug auf `research/…:20-29`. Ein Verweis in der Zeile. Aufwand: S.
5. **„Worker" als Quelle ohne Datei (#9, #10).** `machbarkeit:57,60` verweisen für Modellnamen auf „Worker" bzw. eine externe Doku, nicht auf `research/…`. Zwei interne Verweise. Aufwand: S.
6. **a2ui-URL ungeprüft (#17).** `konkurrenz.md:40` (google/A2UI) vs. `UPSTREAM_SEARCH.md:20` (a2ui-project/a2ui). Kein Link-Problem, sondern ein Belegstand — **UNKLAR**, braucht eine Abfrage, keine Reparatur. Aufwand: S (Prüfung), Ergebnis offen.

## Nicht anfassen

| Knoten | Grund |
|---|---|
| Plivo, Telnyx, Twilio (#6–#8) | Einmalige Provider-Nennung in `research/…:27-29`; Telefonie ist laut `UPSTREAM_SEARCH.md:24` „nicht gefragt". Ein zweiter Verweis würde Relevanz vortäuschen, die im Projekt nicht besteht. |
| Open WebUI (#12) | Ein Konkurrenz-Eintrag in `konkurrenz.md:21`; kein Cloudflare-Baustein, kein Upstream, keine Zieldatei mit passendem Satz. Verdrahtung wäre reine Kosmetik. |
| Die 10 Identitäts-Splits (#1–3, #13–15, #17, #21–23) | Nicht durch Dokumentänderung zu lösen: Die Kurzform („Queues") und die Präfixform („Cloudflare Queues") sind in ihren jeweiligen Dateien **richtig**. Ein Umbenennen im Text, nur damit der Graph fusioniert, wäre eine Verschlechterung der Quelle. Der Fix gehört in die Alias-Auflösung des Extraktors. |
| `cloudflare-bausteine.md`, `konkurrenz.md`, `CLOUDFLARE_MACHBARKEIT.md`, `ABGLEICH.md` (Dokumentknoten aus INTENT) | Fremdes Kontingent (INTENT/ABGLEICH-Prüfer). Hier nur als Ketten-Beleg zitiert. |
| Alle Knoten mit Grad ≥ 2 im Umfeld (`Agents SDK`, `A2UI`, `json-render`, `Stimm`, `Pipecat`, `Workers AI STT/TTS Models`, `800ms Latency Budget`, `Front-Agent`) | Nicht Teil des Grad-1-Kontingents; sie tragen die Gegenprobe für die Splits. |
| `graph.json`, `.md`-Quelldateien | Auftrag ist read-only Triage; keine Kanten eingebaut, keine Datei repariert. |

---
Geprüft gegen `graphify-out/graph.json` (Stand im Repo) und die genannten Dateien; alle Zeilenangaben aus dem gelesenen Inhalt.
