# P2 — INFERRED-Kanten gegen den echten Text verifiziert

Stand: 19.11.2026 · read-only Prüfung · Prüfobjekt: `graphify-out/graph.json` (160 Knoten, 183 Kanten, 12 Hyperedge-Einträge)
Prüffrage: Belegt die Kante eine Aussage, die in den Dateien tatsächlich steht?

## Prüfregel (vorab festgelegt, damit die Urteile vergleichbar sind)

- **BELEGT** — der Text stellt die Beziehung zwischen beiden Knoten her, einschließlich Richtung und Relationstyp.
- **SCHWACH** — beide Konzepte kommen vor, aber der behauptete Zusammenhang (oder sein Typ/seine Richtung) steht nicht im Text.
- **FALSCH** — der Text widerspricht der Kante.
- **UNKLAR** — nicht auflösbar.

Zusatzregel: Belege dürfen aus jeder Datei des Repos kommen (auch aus einer dritten Datei), weil der Graph Quellen frei zusammenzieht. Wo der Beleg nicht in der Datei liegt, die die Kante als `source_file` nennt, steht das im Kommentar.

Vorab-Befund zur Datenqualität: alle 183 Kanten haben auflösbare Endpunkte, keine dangling IDs. Es gibt keine `source_location` an Knoten oder Kanten (`None` bei allen 160 Knoten) — der Graph trägt also selbst keine Zeilenanker.

---

## Tabelle: alle 25 INFERRED-Kanten

| # | Score | Quelle (Label + Datei) | Ziel (Label + Datei) | Relation | Urteil | Beleg (Datei:Zeile) | Kommentar |
|---|---|---|---|---|---|---|---|
| 1 | 0.75 | Front man Agent (`sketches/2026-11-12-agentfaehig.md`) | Analysing Agent (`sketches/2026-11-12-agentfaehig.md`) | conceptually_related_to | BELEGT | `sketches/2026-11-12-agentfaehig.md:115-116`; `tech/CLOUDFLARE_MACHBARKEIT.md:33` | „User → Front man Agent → drei nachgelagerte Agenten: Analysing Agent …". Richtung stimmt. |
| 2 | 0.75 | Front man Agent (`sketches/…`) | Backup Agent (`sketches/…`) | conceptually_related_to | BELEGT | `sketches/…:116`; `tech/CLOUDFLARE_MACHBARKEIT.md:35` | „⟨Backup⟩" ist einer der drei nachgelagerten Agenten. Lesart in der Skizze als unsicher markiert (Zeile 167), als Rolle aber vorhanden. |
| 3 | 0.75 | Front man Agent (`sketches/…`) | Looking up agent (`sketches/…`) | conceptually_related_to | BELEGT | `sketches/…:116`; `tech/CLOUDFLARE_MACHBARKEIT.md:34` | wörtlich „Looking up agent". |
| 4 | 0.75 | HAI Agent Architecture Page (`notion/README.md`) | Sketches Directory (`notion/README.md`) | conceptually_related_to | BELEGT | `notion/README.md:17`, `notion/README.md:28` | Seite = „direkte Vorgängerspur zur Agenten-Struktur in der Skizze"; Skizze (`../sketches/`) = „derzeit die einzige inhaltliche Quelle". Zusammenhang belegt, aber ohne jeden Inhalt der Notion-Seite (nicht gelesen, Zeile 13). |
| 5 | 0.75 | Pathways (`sketches/…`) | Sliders (`sketches/…`) | conceptually_related_to | SCHWACH | `sketches/…:36-37` (Pathways), `sketches/…:28,82-84` (Sliders) | Beide Begriffe stehen in derselben Skizze, aber in verschiedenen Abschnitten (2 vs. 1/5). Kein Satz verbindet „user decides where the call is going to" mit den Reglern. `tech/INTENT.md:23,25` behandelt sie als getrennte Anforderungen T5 und T7. |
| 6 | 0.75 | TP Control Center Hub (`notion/README.md`) | HAI Agent Architecture Page (`notion/README.md`) | conceptually_related_to | BELEGT | `notion/README.md:22` | TP Control Center = „Hub, von dem die anderen Seiten hängen"; die Architektur-Seite ist eine der gelisteten Seiten (Zeile 17). |
| 7 | 0.75 | Front man Agent (`sketches/…`) | Workers AI (`tech/INTENT.md`) | references | BELEGT | `tech/CLOUDFLARE_MACHBARKEIT.md:37`, `tech/CLOUDFLARE_MACHBARKEIT.md:32` | Beleg liegt **nicht** in der genannten Quelldatei: die Skizze nennt Workers AI nirgends. Der Zusammenhang steht nur im Vorschlagsbild der Machbarkeit („F -- Sprache zu Text, Modell, Text zu Sprache --> WAI[Workers AI]"). |
| 8 | 0.75 | Looking up agent (`sketches/…`) | AI Search (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:26`; `tech/CLOUDFLARE_MACHBARKEIT.md:39` | T8: „Wissensquelle für den Looking-up-Agenten (Vectorize / AI Search / statische `llms.txt`)". Explizit benannt. |
| 9 | 0.75 | Looking up agent (`sketches/…`) | Vectorize (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:26` | gleiche Stelle, Vectorize ausdrücklich als Option. |
| 10 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | AI Search (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:26` | Dokument erwähnt AI Search als Kandidat — „references" trifft zu. Achtung: Kandidat, keine Entscheidung (Zeile 27: „Nur notieren"). |
| 11 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | Claude (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:3`, `tech/INTENT.md:47` | „Orchestrator: Claude"; Rolle in der Arbeitsteilung. |
| 12 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | Durable Objects (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:21`, `tech/INTENT.md:32` | T3 fragt ausdrücklich nach „Durable Objects, RPC, Sub-Agenten, Queues"; Zeile 32 nennt „SQLite-Durable-Objects". |
| 13 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | GLM 5.3 Flash (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:46` | als Worker mit Auftrag gelistet. |
| 14 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | MiniMax M3.1 Flash (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:45` | als Worker mit Auftrag gelistet. |
| 15 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | Vectorize (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:26` | wie #10. |
| 16 | 0.75 | Agentfähig Technical Intent (`tech/INTENT.md`) | Workers AI (`tech/INTENT.md`) | references | BELEGT | `tech/INTENT.md:32` | „claudeflareworkerhaus (11 Worker, SQLite-Durable-Objects, Workers AI)". |
| 17 | 0.75 | Front man Agent (`sketches/…`) | Durable Objects (`tech/INTENT.md`) | shares_data_with | SCHWACH | `tech/CLOUDFLARE_MACHBARKEIT.md:31-33`, `tech/CLOUDFLARE_MACHBARKEIT.md:44-49` | Die Verbindung existiert (Front-Agent liegt **in** einem Durable Object pro Besucher), aber das ist Containment, nicht Datenteilung. „shares_data_with" behauptet mehr als der Text: der Zustand gehört dem Agenten, geteilt wird er mit dem Browser (Zeile 40), nicht mit einem zweiten DO. |
| 18 | 0.8 | Hume EVI (`tech/research/konkurrenz.md`) | Latenzziel 800ms (`tech/research/konkurrenz.md`) | conceptually_related_to | FALSCH | `tech/research/konkurrenz.md:32`, `tech/research/konkurrenz.md:68` gegen `tech/research/konkurrenz.md:65,70` | Der Text nennt für Hume EVI „rund 300 ms als Zielvorgabe". Das 800-ms-Ziel gehört zu OpenAI Realtime (Zeile 65) und Multi-Voice-Agent (Zeile 70). Gleiche Tabelle, entgegengesetzte Aussage. |
| 19 | 0.8 | Moshi (`tech/research/konkurrenz.md`) | Latenzziel 800ms (`tech/research/konkurrenz.md`) | conceptually_related_to | FALSCH | `tech/research/konkurrenz.md:61`, `tech/research/konkurrenz.md:31` gegen `:65,70` | Moshi: „160 ms theoretisch, 200 ms praktisch". Ein 800-ms-Ziel wird Moshi nirgends zugeschrieben. |
| 20 | 0.8 | OpenAI Agents SDK (`tech/research/konkurrenz.md`) | Async Agent Pattern (`tech/research/konkurrenz.md`) | conceptually_related_to | SCHWACH | `tech/research/konkurrenz.md:53`, Gruppenüberschrift `:43` | Der Text beschreibt Handoffs, „agents as tools" und parallele Agenten per `asyncio.gather` — nebenläufig, nicht asynchron-nachgelagert. Das Async-Muster wird LangChain (`:49`), Stimm (`:51`) und Hume (`:52`) zugeschrieben, nicht dem OpenAI SDK. |
| 21 | 0.8 | Pipecat (`tech/research/konkurrenz.md`) | Voice Pipeline Feature (`tech/ABGLEICH.md`) | conceptually_related_to | SCHWACH | `konkurrenz.md:28` (Pipecat ist eine Voice-Pipeline), `tech/UPSTREAM_SEARCH.md:22` („reject als Baustein") | Pipecat ist laut eigenem Text ein Voice-Pipeline-Framework, also thematisch verwandt. Die Projekt-Voice-Pipeline in `ABGLEICH.md:43` verweist aber auf `CLOUDFLARE_MACHBARKEIT.md`/`UPSTREAM_SEARCH.md`, und dort wird Pipecat ausdrücklich **abgelehnt**. Die Kante lässt eine verworfene Option wie einen Baustein aussehen. |
| 22 | 0.85 | Graphify-Labs/Graphify Repo (`UPSTREAM_SEARCH.md`) | Graphifyy Package (`UPSTREAM_SEARCH.md`) | implements | SCHWACH | `UPSTREAM_SEARCH.md:45-47` | Belegt ist die Namenszuordnung: „offizielles Paket ist `graphifyy` (doppel-y), CLI heißt `graphify`". Nicht belegt ist „implements", und die Richtung ist verkehrt: das Paket vertreibt den Repo-Code, nicht umgekehrt. |
| 23 | 0.9 | Upstream Search Document (`UPSTREAM_SEARCH.md`) | Graph HTML Output (`UPSTREAM_SEARCH.md`) | creates | SCHWACH | `UPSTREAM_SEARCH.md:62-66` | Das Dokument **verlinkt** `graphify-out/graph.html` und protokolliert, dass es gebaut wurde. Erzeugt hat es der graphify-Lauf, nicht das Dokument. Assoziation belegt, Kausalität falsch. |
| 24 | 0.9 | Upstream Search Document (`UPSTREAM_SEARCH.md`) | Graph JSON Output (`UPSTREAM_SEARCH.md`) | creates | SCHWACH | `UPSTREAM_SEARCH.md:63-65` | wie #23 („`graph.json` (querybar)"). |
| 25 | 0.9 | Upstream Search Document (`UPSTREAM_SEARCH.md`) | Graph Report MD Output (`UPSTREAM_SEARCH.md`) | creates | SCHWACH | `UPSTREAM_SEARCH.md:63-64` | wie #23 („`GRAPH_REPORT.md` (God-Nodes, Communities)"). |

### Zählzeile

**15 belegt / 8 schwach / 2 falsch / 0 unklar** (Summe 25).

Nach Relation: `conceptually_related_to` 4/2/2 (belegt/schwach/falsch von 8), `references` 10/0/0 (von 10), `shares_data_with` 0/1/0, `implements` 0/1/0, `creates` 0/3/0.

---

## Hyperedge-Einträge (separat, nicht Teil der 25)

Die Datei enthält **12 Hyperedge-Einträge, aber nur 10 eindeutige IDs**: `agent_architecture_flow` kommt dreimal vor (einmal EXTRACTED, zweimal INFERRED, unterschiedliche Knotenmengen). Nur **eine** ist `AMBIGUOUS`.

| ID | Confidence | Relation | Quelldatei | Prüfung |
|---|---|---|---|---|
| `latency_sync_gap` | **AMBIGUOUS 0.65** | form | `tech/ABGLEICH.md` | **Belegt, und zwar am clearlysten im ganzen Graph.** `tech/ABGLEICH.md:46-54` ist ein eigener Abschnitt „Typewriter und Stimme laufen nicht von selbst synchron", inklusive der drei Wege. Die Hyperedge behauptet genau das, was dort steht — sie ist die am besten belegte Struktur im Graph und trägt trotzdem das schlechteste Label. |
| `upstream_evaluation_cluster` | EXTRACTED 0.9 | implement | `UPSTREAM_SEARCH.md` | Belegt (Tabelle `UPSTREAM_SEARCH.md:17-22`). „implement" bleibt aber falsch für die drei `reject`-Kandidaten. |
| `agent_communication_flow` | EXTRACTED 1.0 | participate_in | `tech/CLOUDFLARE_MACHBARKEIT.md` | Belegt (`:33-35`). |
| `generative_ui_approaches` | EXTRACTED 1.0 | implement | `konkurrenz.md` | Belegt (`:39-41` als Gruppe 3). |
| `notion_project_context` | EXTRACTED 1.0 | form | `notion/README.md` | Schwach: die sieben Seiten sind nur als „noch nicht gelesen" gelistet (`:13-23`), ein gemeinsamer Kontext ist behauptet, nicht belegt. |
| `payment_protocol_stack` | EXTRACTED 1.0 | implement | `tech/research/cloudflare-bausteine.md` | Belegt (`:153-162`, x402 und Machine Payments Protocol). |
| `agent_architecture_flow` (EXTRACTED) | 0.75 | form | `sketches/…` | Belegt (`:115-116`). |
| `agent_architecture_flow` (INFERRED) | 0.75 | form | `sketches/…` | Belegt, identische Knotenmenge wie die EXTRACTED-Variante → Duplikat mit schlechterem Label. |
| `agent_architecture_flow` (INFERRED) | 0.75 | participate_in | `UPSTREAM_SEARCH.md` (Wurzel, Graphify-Suche) | **Schwach.** Genannte Quelldatei spricht über den Mesh über Ordner/Pläne (`:5-9`), nicht über einen Architektur-Planungsfluss. Die Knoten (`sketches`, `tech/INTENT`, `tech/ABGLEICH`) sind aus dem Need-Text abgeleitet, nicht aus einer Aussage. |
| `cloudflare_infrastructure_stack` | INFERRED 0.75 | implement | `tech/INTENT.md` | **Schwach.** `claudeflareworkerhaus` + Workers AI + Durable Objects sind belegt (`:31-32`); Vectorize und AI Search stehen in T8 ausdrücklich als offene Frage mit drei Alternativen (`:26`) — als „implementierter Stack" überzeichnet. |
| `voice_pipeline_flow` | INFERRED 0.75 | form | `tech/research/cloudflare-bausteine.md` | Belegt (`:15-21` STT/TTS-Klassen, `:293` 800-ms-Regel). |
| `latency_critical_path` | INFERRED 0.8 | implement | `tech/CLOUDFLARE_MACHBARKEIT.md` | Belegt (`:69-92` Latenzbudget, `:73` Workers-AI-Budget). |

---

## Muster — welche Fehler der Extractor systematisch macht

**1. Gemeinsame Erwähnung wird zum Zusammenhang.**
Zwei Labels stehen in derselben Datei oder derselben Tabelle, und daraus wird eine Kante.
- `Pathways` und `Sliders` (Kante 5): beide in der Skizze, aber in Abschnitt 2 bzw. 1/5, ohne verbindenden Satz.
- `Hume EVI` / `Moshi` → `Latenzziel 800ms` (Kanten 18, 19): beide stehen in derselben Latenztabelle wie die 800-ms-Zeilen — mit 300 ms bzw. 200 ms, also dem Gegenteil. Das sind die zwei einzigen echten Falschaussagen, und beide entstehen aus Tabellennachbarschaft.

**2. Relationstypen werden überzeichnet, ohne dass der Text sie hergibt.**
`shares_data_with`, `creates`, `implements` klingen nach Architektur, der Text sagt etwas Schwächeres.
- `Front man Agent --shares_data_with--> Durable Objects` (Kante 17): der Text sagt „Durable Object pro Besucher" mit dem Agenten **darin** — Containment, keine geteilten Daten.
- `Upstream Search Document --creates--> graph.html / graph.json / GRAPH_REPORT.md` (Kanten 23–25, Score 0.9): das Dokument verlinkt und protokolliert die Artefakte; gebaut hat sie der graphify-Lauf. Drei Kanten mit dem höchsten Score im INFERRED-Set tragen den falschen Akteur.

**3. Erwähnung in einem Frage-/Optionskatalog wird zur gewählten Komponente.**
Alle 10 `references`-Kanten sind formal belegt, aber `tech/INTENT.md` ist ein Fragenkatalog: AI Search/Vectorize/`llms.txt` sind dort drei **Alternativen** (`:26`), Durable Objects eine **Frage** (`:21`). Im Graph sehen sie wie Bestandteile aus — und die Hyperedge `cloudflare_infrastructure_stack` behauptet genau das. Dieselbe Verwechslung trifft `tech/CLOUDFLARE_MACHBARKEIT.md:12-13` („Dieses Dokument ist eine Einschätzung, keine Architekturentscheidung"): der Graph macht daraus Kanten ohne diesen Vorbehalt.

**4. Provenance der Kante ≠ Provenance des Belegs.**
Kante 7 (`Front man Agent --references--> Workers AI`) nennt als Quelle die Skizze; die Skizze nennt Workers AI nirgends. Der Beleg liegt in `tech/CLOUDFLARE_MACHBARKEIT.md:37`. Ohne Zeilenanker ist das im Graph nicht sichtbar — alle 160 Knoten haben `source_location: None`.

**5. Scores sind kein Verlässlichkeitsmaß, teils invertiert.**
Schwache/falsche Kanten tragen 0.9 (`creates`) und 0.8 (Hume/Moshi), belegte tragen 0.75. Die einzige `AMBIGUOUS`-Hyperedge (`latency_sync_gap`, 0.65) ist die am besten belegte Aussage im ganzen Graph (`ABGLEICH.md:46-54`). Wer nach Score sortiert, prüft die falschen Kanten zuerst.

**6. ID-Kollision bei Hyperedges.**
`agent_architecture_flow` existiert dreimal mit unterschiedlicher Knotenmenge. Ein Graph, in dem IDs nicht eindeutig sind, ist als Nachschlagewerk nicht zuverlässig adressierbar.

---

## Konsequenz

**Nein — der Graph darf nicht als Belegquelle für Projektentscheidungen gelten.** Er ist als Navigations- und Erinnerungsindex brauchbar, als Beweis nicht.

Begründung in einem Satz: 15 von 25 INFERRED-Kanten halten, aber die Fehler treffen systematisch genau die Aussagen, die eine Entscheidung tragen würden — welche Komponente gewählt ist, wer etwas erzeugt, was mit wem Daten teilt — und die Konfidenz-Scores zeigen diese Fehler nicht an.

**Empfehlung (konkret, ohne Doku-Reparatur):**

1. **Pro Kante Textankerl oder keine Kante.** Für Entscheidungen zählt nur `Datei:Zeile` im Fließtext, nicht der Graph. Für dieses Repo existiert dieser Anker überall; er fehlt nur im Graph.
2. **Graph nur für Navigation zitieren**, nie für eine Sachaussage: „siehe `tech/ABGLEICH.md:46`", nicht „laut Graph hängt A mit B zusammen".
3. **Vor jeder Nutzung einer INFERRED-Kante die drei Risikoklassen prüfen:** `creates`/`implements`/`shares_data_with` (Rolle), Erwähnung in einem Fragen-/Optionskatalog (`tech/INTENT.md`), und Nachbarschaft in einer Vergleichstabelle (Latenztabelle).
4. **Proposal-Status mitführen.** `tech/CLOUDFLARE_MACHBARKEIT.md` und `tech/UPSTREAM_SEARCH.md` sind Vorschläge („Entscheidung liegt bei Samuel und ist nicht bestätigt"). Ein Graph, der Vorschläge und Entscheidungen gleich darstellt, ist für Gates untauglich.
5. **Wenn der Graph bleiben soll:** nur mit einem Feld `evidence: Datei:Zeile` je Kante, sonst ist er gegen den Text nicht auditierbar — dieser Lauf war genau diese Audit-Arbeit, manuell, 25-mal.
