# Triage P3 — Grad-1-Knoten, Bereich a–f (read-only)

Stand: 19.11.2026 · Graph: `graphify-out/graph.json` (160 Knoten, 183 Kanten, 12 Hyperedges),
gebaut aus Commit `6bdc3a62`. Geprüft: 39 Knoten in den Gruppen a–f. Keine Repo-Datei und kein
Graph wurde verändert; nur diese Datei ist neu.

**Grad** = Kanten inkl. Hyperedges (wie vorgegeben). Zwei Knoten haben Grad 1 *nur* über eine
Hyperkante; das ist unten ausdrücklich vermerkt, weil `graph.html` Hyperedges als Fläche rendert,
`graph.json` sie aber nicht als Kante zählt.

**Lesart der Kategorien in diesem Bericht.** `AST-RAUSCHEN` = Extraktor-Müll ohne Wissensrolle
(syntaktisch *oder* aus Prosa gezogene Namen wie Werkzeuge, Modelle, Build-Ausgaben).
`EXTRAKTOR-ARTEFAKT` = Inhalt ist echt und im Text vorhanden, die Kante fehlt rein technisch
(Doppelknoten, fehlende Entitätsauflösung). `ECHTES-BLATT`/`HUB-FEHLER` = hier hilft Doku-Arbeit.
Eine Abweichung von der reinen AST-Definition ist damit offengelegt, nicht versteckt.

## Tabelle

| # | Label | Grad | Datei | Kategorie | Begründung (1 Satz) | Vorschlag (Datei + was) | Aufwand |
|---|---|---|---|---|---|---|---|
| 1 | `blocks/` | 1 | `sketches/2026-11-12-agentfaehig.md:12` | EXTRAKTOR-ARTEFAKT | Der Verzeichnisverweis ist ein echter Markdown-Link, aber die zehn enthaltenen Blockbilder wurden nicht als Kinder angehängt (sie stehen selbst bei Grad 0). | Extraktor: Verzeichnis-Link → `contains` je Blockbild; keine Doku-Änderung (Bild-Knoten sind Prüfer-Territorium). | S |
| 2 | `CSS` | 1 | `sketches/2026-11-12-agentfaehig.md:153` | EXTRAKTOR-ARTEFAKT | Der Begriff steht zusätzlich in `tech/INTENT.md:24` (T6) und `docs/PROJECT.md:21`, aber der Extraktor legt je Datei einen eigenen Mention-Knoten an statt auf dieselbe Entität aufzulösen. | Extraktor: Entitätsauflösung über Dateigrenzen; der Doku-Text ist vollständig. | S |
| 3 | `GreateWriting` | 1 | `sketches/2026-11-12-agentfaehig.md:194-198` | EXTRAKTOR-ARTEFAKT | Doppelknoten: Zeile 195 ist ein echter Link auf `Agentfähig/GreateWriting.txt`, das schon einen eigenen Knoten mit Grad 3 hat. | Extraktor: Linkziel als Knoten nehmen bzw. zusammenführen. | S |
| 4 | `Grilling-Skill` | 1 | `sketches/2026-11-12-agentfaehig.md:190` | EXTRAKTOR-ARTEFAKT | Doppelknoten: Zeile 190 verlinkt `skills/grilling/SKILL.md`, das bereits als „Grilling Skill" existiert. | Extraktor: zusammenführen (siehe #9). | S |
| 5 | `HAI Interaction` | 1 | `sketches/:85,101,154` | HUB-FEHLER | Der Begriff benennt genau das, was `README.md:3` und `docs/PROJECT.md:8` als „Human-Agent Interface" beschreiben — beide Stellen nennen den Skizzenbegriff nicht. | `README.md:3` → „Ein Human-Agent Interface (die Skizze nennt es „HAI Interaction"), bei dem die Website selbst als Agent erlebbar wird." | S |
| 6 | `pypdfium2` | 1 | `sketches/:10,177` | AST-RAUSCHEN | Werkzeugname in der Herkunftsnotiz („gerastert mit pypdfium2") — kein Projektwissen. | keiner | — |
| 7 | `raw/` | 1 | `sketches/:11` | EXTRAKTOR-ARTEFAKT | Verzeichnis mit Binärrohdaten; `.rm`/`.content.json`/`.metadata.json` werden nicht indexiert, eine weitere Kante wiederholte nur den existierenden Link. | Extraktor: Überspringen von Binärdateien explizit machen. | — |
| 8 | `reMarkable Paper Pro` | 1 | `sketches/:8` | AST-RAUSCHEN | Gerätename in der Quellentabelle — Provenienz ohne Wissensrolle. | keiner | — |
| 9 | `Grilling Skill` | 1 | `skills/grilling/SKILL.md` | EXTRAKTOR-ARTEFAKT | Die Projektkopie wird in `docs/DESIGN-DECISIONS.md:44` per echtem Markdown-Link und in `docs/PROJECT.md:36` („Das Grilling läuft bereits") genannt; extrahiert wurde nur die README-Kante. | Extraktor: Kante aus `docs/DESIGN-DECISIONS.md:44`. | S |
| 10 | `Anthropic/OpenAI/DeepSeek Backends` | 1 | `UPSTREAM_SEARCH.md:39-44` | EXTRAKTOR-ARTEFAKT | Backend-Optionen stehen im selben Bullet wie Kimi/Moonshot (Z. 43) und neben der Backend-Regel (Z. 70-71, `Ollama Backend`/`MiniMax 3.1 Flash Model` existieren als Knoten) — ohne Kanten dazwischen. | Extraktor: Bullet in Optionen und Regel zerlegen. | S |
| 11 | `Graphifyy Package` | 1 | `UPSTREAM_SEARCH.md:45-47` | EXTRAKTOR-ARTEFAKT | 1:1-Entität des Repos; die einzige Kante heißt „implements" (invertiert) statt „ist das PyPI-Paket von". | Extraktor: Relationsrichtung korrigieren. | S |
| 12 | `Kimi/Moonshot Routing` | 1 | `UPSTREAM_SEARCH.md:43-44` | EXTRAKTOR-ARTEFAKT | Der Datenresidenz-Satz hängt an derselben Aufzählung wie die Backend-Knoten, ohne Kante dorthin. | Extraktor: siehe #10. | S |
| 13 | `Qwen2.5VL Model` | 1 | `UPSTREAM_SEARCH.md:66` | AST-RAUSCHEN | Provenienz des Mesh-Laufs („Bilder über qwen2.5vl:7b") — kein Projektwissen. | keiner | — |
| 14 | `Qwen3.6 Model` | 1 | `UPSTREAM_SEARCH.md:66` | AST-RAUSCHEN | Dito (lokales Textmodell des Laufs). | keiner | — |
| 15 | `Graph HTML Output` | 1 | `UPSTREAM_SEARCH.md:62` | AST-RAUSCHEN | Ausgabedatei des Extraktor-Laufs, als Dokumentknoten ohne Inhalt im Graph. | keiner — besser aus dem Graph ausschließen als verdrahten. | — |
| 16 | `Graph JSON Output` | 1 | `UPSTREAM_SEARCH.md:64` | AST-RAUSCHEN | Dito (der Graph enthält sich selbst). | keiner | — |
| 17 | `Graph Report MD Output` | 1 | `UPSTREAM_SEARCH.md:63` | AST-RAUSCHEN | Dito. | keiner | — |
| 18 | `MCP Server Notion Connector` | 1 | `notion/README.md:7-8` | EXTRAKTOR-ARTEFAKT | Externer Servername mit 401-Status, als `file_type: code` fehlklassifiziert, hängt aber am richtigen Hub (Notion-README). | keiner | — |
| 19 | `User Notion Connector` | 1 | `notion/README.md:11` | EXTRAKTOR-ARTEFAKT | Der funktionierende Zugangsweg, ebenfalls Statusnotiz am selben Hub — die Beziehung „einer scheitert, einer geht" trägt das README. | keiner | — |
| 20 | `Agentfaehig Sketch PDF` | 1 | `sketches/2026-11-12-agentfaehig.pdf` | HUB-FEHLER | Das PDF ist die Quelle der Transkription, fehlt aber in deren eigener Kopftabelle; die einzige Kante entstand aus einer Fehlauflösung von `notion/README.md:28` (`../sketches/`). | `sketches/2026-11-12-agentfaehig.md:10-11` → neue Kopftabellen-Zeile: Spalte „PDF" mit Link `[2026-11-12-agentfaehig.pdf](2026-11-12-agentfaehig.pdf)` und Hinweis „ohne Textlayer" | S |
| 21 | `ABGLEICH.md` | 1 | `tech/INTENT.md:55` | EXTRAKTOR-ARTEFAKT | Doppelknoten zu „Abgleich Document" (Grad 7); `INTENT:55` ist ein echter Link. | Extraktor: zusammenführen. | S |
| 22 | `cloudflare-bausteine.md` | 1 | `tech/INTENT.md:46` | EXTRAKTOR-ARTEFAKT | Doppelknoten zu „Cloudflare-Bausteine Research" (Grad 22). | Extraktor: zusammenführen. | S |
| 23 | `CLOUDFLARE_MACHBARKEIT.md` | 1 | `tech/INTENT.md:53` | EXTRAKTOR-ARTEFAKT | Für diese Datei existiert **überhaupt kein** Dokumentknoten; dieser Ref-Knoten und „Cloudflare Machbarkeit Document" (Grad 1) sind zwei Hälften davon — deshalb hängen ihre Konzeptknoten (u. a. `Zustands-Synchronisation`, Grad 0) in der Luft. | Extraktor: genau ein Dokumentknoten je Datei erzwingen, Refs darauf auflösen. | M |
| 24 | `konkurrenz.md` | 1 | `tech/INTENT.md:45` | EXTRAKTOR-ARTEFAKT | Doppelknoten zu „Konkurrenz Recherche" (Grad 11). | Extraktor: zusammenführen. | S |
| 25 | `Claude` | 1 | `tech/INTENT.md:3,47` | EXTRAKTOR-ARTEFAKT | Rolle mit Deliverables in der Arbeitsteilungstabelle (Z. 42-47, dort in Backticks → keine Kante); dieselbe Figur steht in `AGENTS.md:5`, `docs/PROJECT.md:38`, `skills/grilling/SKILL.md:8`. | Extraktor: Rollen-Spalte → „Liefert"-Spalte auflösen. | S |
| 26 | `GLM 5.3 Flash` | 1 | `tech/INTENT.md:46` | EXTRAKTOR-ARTEFAKT | Liefert `tech/research/cloudflare-bausteine.md` — der Link steht in derselben Tabellenzeile, wurde aber als Ref-Knoten fehlaufgelöst. | Extraktor: siehe #25. | S |
| 27 | `human-agent-interface` | 1 | `tech/INTENT.md:31-33` | ECHTES-BLATT | Bestehende Site, die als Andockpunkt gilt, kommt in `docs/PROJECT.md` („Ausgangspunkt", „Aktuell vorhanden") nicht vor; dort steht nur „noch nicht festgelegt". | `docs/PROJECT.md` nach Z. 10 → ein Satz: „Vorhandene Andockpunkte sind der Worker-Verbund `claudeflareworkerhaus` und die Site `human-agent-interface` ([INTENT](../tech/INTENT.md)); beide bleiben vorerst unangetastet." | S |
| 28 | `MiniMax M3.1 Flash` | 1 | `tech/INTENT.md:45` | EXTRAKTOR-ARTEFAKT | Liefert `tech/research/konkurrenz.md`; Doppelknoten zu „MiniMax 3.1 Flash Model" (`UPSTREAM_SEARCH.md`). | Extraktor: zusammenführen + Rollen-Kante (#25). | S |
| 29 | `Cloudflare Machbarkeit Document` | 1 | `tech/ABGLEICH.md:8` | EXTRAKTOR-ARTEFAKT | Zweiter Ref-Knoten auf dieselbe Datei; `ABGLEICH:8` ist ein echter Link. | Extraktor: zusammenführen (siehe #23). | S |
| 30 | `Design Decisions Document` | 1 | `tech/ABGLEICH.md:5` | EXTRAKTOR-ARTEFAKT | Doppelknoten zu „Designentscheidungen" (Grad 4). | Extraktor: zusammenführen. | S |
| 31 | `Project Document` | 1 | `tech/ABGLEICH.md:6` | EXTRAKTOR-ARTEFAKT | Doppelknoten zu „docs/PROJECT.md" (Grad 6). | Extraktor: zusammenführen. | S |
| 32 | `Research README Document` | 1 | `research/README.md` | EXTRAKTOR-ARTEFAKT | Die sieben Zeilen sind eine echte Scope-Notiz; die eine Kante zeigt auf den falsch verankerten Doppelknoten „Scout Synthesis Report" statt auf „research/SCOUT-SYNTHESIS.md" (Grad 4). | Extraktor: Knoten am Dateipfad verankern, nicht am Fundort. | S |
| 33 | `Scout Synthesis Report` | 1 | `research/README.md` (gemeint: `research/SCOUT-SYNTHESIS.md`) | EXTRAKTOR-ARTEFAKT | Doppelknoten mit falschem `source_file`; das echte Dokument hat einen eigenen Knoten. | Extraktor: zusammenführen. | S |
| 34 | `validate.sh` | 1 | `scripts/validate.sh` | EXTRAKTOR-ARTEFAKT | AST-Knoten ohne Brücke zu den Doku-Knoten, obwohl `tests/README.md:5` das Skript als echten Markdown-Link führt. | Extraktor: AST-Dateiknoten mit Doku-Linkzielen verbinden. | S |
| 35 | `validate.sh script` | 1 | `scripts/validate.sh` | AST-RAUSCHEN | Synthetischer `__entry`-Knoten; Datei- und Entry-Knoten hängen nur über `contains` aneinander, sind also per Konstruktion Grad 1. | keiner | — |
| 36 | `Samuel (Owner)` | 1 | `tech/CLOUDFLARE_MACHBARKEIT.md` (Prosa, Z. 13) | EXTRAKTOR-ARTEFAKT | Der Owner steht in `AGENTS.md:5-12,23`, `docs/PROJECT.md:38`, `tech/LUECKEN.md:7`, `skills/grilling/SKILL.md:8`; der Knoten hängt an einer einzigen Prosa-Stelle einer Datei ohne Dokumentknoten. | Extraktor: Figuren-Auflösung — der Doku-Text ist vollständig. | S |
| 37 | `Offene Entscheidungen & Lücken` | 1 | `tech/LUECKEN.md` | ECHTES-BLATT | Die 217-Zeilen-Datei ist der einzige repo-weite Register für Lücken, Widersprüche und unbelegte Aussagen und wird von **keiner** anderen Datei verlinkt (grep über alle `*.md`: 0 Treffer). | `README.md`, Liste „Einstieg", nach Z. 11 → `- [Lücken und offene Entscheidungen im ganzen Repo](tech/LUECKEN.md)` | S |
| 38 | `Latenzbudget (<1s)` | 1 (nur Hyperkante) | `tech/CLOUDFLARE_MACHBARKEIT.md:67-92` | EXTRAKTOR-ARTEFAKT | Keine einfache Kante, weil die Datei keinen Dokumentknoten hat; im HTML hängt der Knoten an der Hyperkante „Latenzkritische Infrastruktur". | Extraktor: Dokumentknoten (#23) + Kante auf `tech/INTENT.md:20` (T2). | M |
| 39 | `Typewriter Feature` | 1 (nur Hyperkante) | `tech/ABGLEICH.md:46-54` | EXTRAKTOR-ARTEFAKT | Nur Hyperkante „Typewriter-Voice Sync Risk"; die Textkette `docs/DESIGN-DECISIONS.md:17` → `tech/ABGLEICH.md:46-54` → `tech/LUECKEN.md:29` existiert bereits in Prosa. | Extraktor: Kante `DESIGN-DECISIONS.md:17` → `ABGLEICH` (Risiko zur bestätigten Entscheidung). | S |

## Zählung

| Kategorie | Anzahl |
|---|---|
| AST-RAUSCHEN | 8 |
| EXTRAKTOR-ARTEFAKT | 27 |
| PLATZHALTER | 0 |
| ECHTES-BLATT | 2 |
| HUB-FEHLER | 2 |
| UNKLAR | 0 |
| **Summe** | **39** |

Befund: **27 von 39** Knoten sind dasselbe Muster — der semantische Pass legt Knoten pro Erwähnung
in *einer* Datei an und löst Entitäten nicht dateiübergreifend auf. Das ist keine Wissenslücke,
sondern Extraktor-Arbeit; Doku-Änderungen würden hier lügen.

## Nur echte Lücken

Sortiert nach Wirkung: vier Stellen, an denen ein Verweis tatsächlich fehlt (je eine Zeile).

1. **`Offene Entscheidungen & Lücken` (`tech/LUECKEN.md`)** — das einzige Dokument, das alle offenen
   Entscheidungen, Widersprüche und unbelegten Worker-Aussagen des Repos bündelt, ist von außen
   unerreichbar. Ein Eintrag in der README-Einstiegsliste öffnet 217 Zeilen Projektwissen.
2. **`Agentfaehig Sketch PDF` (`sketches/2026-11-12-agentfaehig.pdf`)** — die Transkription
   verschweigt ihre eigene Quelle in der Kopftabelle; das PDF hängt heute nur an einem falsch
   aufgelösten Verzeichnislink im Notion-README.
3. **`human-agent-interface`** — der Projektstand nennt kein bestehendes Asset, obwohl die Site (und
   `claudeflareworkerhaus`) als Andockpunkt feststehen; der Leser von `docs/PROJECT.md` erfährt
   nicht, worauf gebaut wird.
4. **`HAI Interaction`** — der Leitbegriff der Skizze (§5, §6) und die Selbstbeschreibung des Repos
   (`README.md:3`, `docs/PROJECT.md:8`) sind derselbe Gedanke in zwei Wörtern; niemand verknüpft sie.

Grenzfall, bewusst **nicht** in dieser Liste: `validate.sh` — `tests/README.md:5` ist bereits ein
echter Link, die Kante fehlt nur im Extraktor. Eine zusätzliche Doku-Zeile wäre Deko.

## Nicht anfassen

Bewusst isoliert lassen (ein zusätzlicher Verweis wäre Verdrahtung ohne Aussage):

- `pypdfium2`, `reMarkable Paper Pro` — Werkzeug- bzw. Gerätename in der Herkunftsnotiz der Skizze
  (`:8,10,177`). Provenienz, keine Wissensrolle.
- `Qwen2.5VL Model`, `Qwen3.6 Model` — welche Modelle den Mesh gebaut haben (`UPSTREAM_SEARCH:66`).
  Betriebsprovenienz; hat in der Produktplanung nichts zu suchen.
- `Graph HTML Output`, `Graph JSON Output`, `Graph Report MD Output` — Ausgaben des Extraktor-Laufs
  über dieses Repo. Sie zu verdrahten macht den Graphen selbstbezüglich und bricht bei jedem Re-Run;
  besser aus dem Graph ausschließen als verlinken.
- `blocks/`, `raw/` — Verzeichnisse mit Binärinhalt. Der Link aus der Skizze existiert; Kinder sind
  Sache des Bild-Prüfers, nicht der Doku.
- `Anthropic/OpenAI/DeepSeek Backends`, `Kimi/Moonshot Routing` — Backend- und Datenresidenz-Optionen
  stehen ausschließlich in `UPSTREAM_SEARCH.md:39-44` und hängen dort richtig. Eine zweite Fundstelle
  gibt es nicht; sie zu erfinden wäre der Musterfall künstlicher Verdrahtung.
- `MCP Server Notion Connector`, `User Notion Connector` — Statusnotizen zu Zugangswegen
  (`notion/README.md:7,11`). Der Hub ist das Notion-README; die Beziehung „einer scheitert, einer
  funktioniert" steht dort im Text.
- `Samuel (Owner)` — Owner-Gates sind Governance (`AGENTS.md:5-12,23`), keine Wissenskante. Wer den
  Knoten „vernetzt", verdrahtet eine Vertragsregel.
- `validate.sh script` — synthetischer `__entry`-Knoten des AST-Parsers.

Doppelknoten: **nicht** per Doku reparieren, sondern im Graph zusammenführen (sonst entstehen
künstliche „Verweise", die es im Text schon gibt): `GreateWriting`/`Agentfähig/GreateWriting.txt`,
`Grilling-Skill`/`Grilling Skill`, `ABGLEICH.md`/`Abgleich Document`,
`cloudflare-bausteine.md`/`Cloudflare-Bausteine Research`, `konkurrenz.md`/`Konkurrenz Recherche`,
`CLOUDFLARE_MACHBARKEIT.md`/`Cloudflare Machbarkeit Document`,
`Design Decisions Document`/`Designentscheidungen`, `Project Document`/`docs/PROJECT.md`,
`Scout Synthesis Report`/`research/SCOUT-SYNTHESIS.md`, `MiniMax M3.1 Flash`/`MiniMax 3.1 Flash Model`.

## Systemische Befunde (für den Graph-Lauf, nicht für die Doku)

1. **Keine Entitätsauflösung über Dateigrenzen.** 27 Knoten betroffen; jeder Mention in einer
   zweiten Datei wird ein neuer Knoten statt eine Kante. Das erzeugt Grad-1-Inseln, obwohl der Text
   die Beziehung bereits enthält.
2. **`tech/CLOUDFLARE_MACHBARKEIT.md` hat keinen Dokumentknoten.** Folge: ihre Konzeptknoten hängen
   an fremden Dokumenten oder in der Luft (`Zustands-Synchronisation` Grad 0, `WebSocket Transport`
   Grad 1, `Latenzbudget (<1s)` nur Hyperkante, `Samuel (Owner)` an einer Prosa-Stelle).
   Dieselbe Datei ist über `ABGLEICH:8`, `INTENT:53`, `UPSTREAM_SEARCH:41` und `LUECKEN` mehrfach
   verlinkt — die Kante fehlt nur, weil der Zielknoten fehlt.
3. **AST-Paar pro Datei.** Jede Code-Datei erzeugt `<datei>` + `<datei> __entry`, verbunden nur über
   `contains`. Dieses Paar ist per Konstruktion Grad 1 und sagt nichts über das Projekt.
4. **Hyperedges zählen nicht als Kante.** `Latenzbudget (<1s)` und `Typewriter Feature` haben
   einfache Kanten = 0; im HTML sind sie über eine Fläche sichtbar, in jeder Knoten-Query isoliert.
5. **Falsch verankerte Verweise.** `notion/README.md:28` (`../sketches/`) erzeugt den PDF-Knoten,
   `research/README.md:7` erzeugt den Scout-Knoten mit `source_file: research/README.md`. Beide
   Zielknoten tragen den Pfad ihres Fundorts statt ihren eigenen.

## Aufwand

Vier Doku-Änderungen, je eine Zeile bzw. ein Satz: **S, zusammen unter 15 Minuten**.
Der Rest ist Extraktor-Arbeit (Entitätsauflösung + Dokumentknoten): **S–M, eine Fix-Klasse**,
danach ein Re-Run ohne API-Kosten.
