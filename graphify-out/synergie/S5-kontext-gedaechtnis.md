# S5 · Kontext und Gedächtnis

Stand: 19.11.2026 · Prüfung eines Synergie-Kandidaten · read-only außer dieser Datei

Gelesen: `notion/README.md`, `sketches/2026-11-12-agentfaehig.md`, `tech/INTENT.md`,
`UPSTREAM_SEARCH-graphify.md`, `tech/UPSTREAM_SEARCH-cloudflare.md`, `research/SCOUT-SYNTHESIS.md`,
`tech/CLOUDFLARE_MACHBARKEIT.md`, `tech/LUECKEN.md`, `docs/PROJECT.md`,
`docs/DESIGN-DECISIONS.md`, `Idea`, `graphify-out/graph.json`.

> **Pfadhinweis:** Während dieser Prüfung wurden zwei Dateien von paralleler
> Arbeit umbenannt (Inhalt unverändert, Zeilennummern identisch):
> `UPSTREAM_SEARCH.md` → `UPSTREAM_SEARCH-graphify.md` (Mesh/Graphify) und
> `tech/UPSTREAM_SEARCH.md` → `tech/UPSTREAM_SEARCH-cloudflare.md` (Cloudflare).
> Alle Belege unten nennen die neuen Pfade. Ebenso wurde `docs/PROJECT.md` am
> 19.11.2026 auf den Stand der Produktklärungen gebracht; die Belege unten zitieren
> diesen Stand (die fünf Build-Fragen sind dort beantwortet, siehe Konflikte K6).

## Vorab: drei Korrekturen an der Auftragsannahme

1. **Die Skizze hat keinen Gedächtnis-/Archiv-Abschnitt.** Sie hat Ausschnitt 8
   „Meta und Philosophie" (`sketches/2026-11-12-agentfaehig.md:131-137`) mit
   `Concept of Meta`, `philosophy of HAI`, `plaud thoughts →` und dem Motto.
   Kein Wort zu Archiv, Verlauf, Memory, Persistenz. Auch kein Treffer für
   „Gedächtnis|Archiv|memory" irgendwo unter `sketches/`.
2. **Der einzige Produkt-Beleg für „Kontext" steht im Transkript, nicht in der Skizze.**
   `Idea:35-38`: „Voice, Text / Context, Skills." Das ist eine
   Feature-Aufzählung des Owners, ein Halbsatz, ohne Definition.
   `docs/PROJECT.md:9-11` wiederholt sie als „Voice, Text, Kontext und Skills".
3. **Claude Code Memory Setup / Foam / Graphify sind keine Agent-Gedächtnis-Lösungen
   in diesem Repo.** Sie wurden für ein anderes Need geprüft: den Mesh über die
   *Ordner dieses Repos* (`UPSTREAM_SEARCH-graphify.md:5-10`). Dort steht „persistentes
   Gedächtnis für Claude Code" (`:20`) — also das Gedächtnis der *bauenden*
   Assistenz, nicht des ausgelieferten Agenten. Die Hyperedge
   `Upstream Tool Evaluation Cluster` (4 Knoten, `relation: implement`) im Graph
   macht daraus eine Tool-Familie und verwischt genau diese Grenze.

## Der Anker

**Es gibt keinen gemeinsamen Anker. Es stehen drei Modelle nebeneinander, und der
Kandidat „alles ist ein Dokument mit Metadaten und Kanten" wird vom Text nicht
gestützt.**

Der gemeinsame Nenner ist ein *Wortfeld*, kein Modell: „Kontext", „Gedächtnis",
„KnowledgeGraph", „Wissensquelle" bezeichnen drei verschiedene Objekte mit
verschiedenem Besitzer, Lebenszyklus und Konsumenten.

| | (a) Notion-Kontext | (b) Laufzeit-Gedächtnis | (c) Repo-Mesh |
|---|---|---|---|
| Objekt | 7 Seiten/DBs in Notion | Antwortwissen des Looking-up-Agenten | Graph über Repo-Markdown |
| Besitzer | Samuel, in Notion | Agent (DO), zur Laufzeit | Repo, pro Commit neu |
| Lebenszyklus | von Hand gepflegt, Snapshot-Export | ingestiert einmal, dann abgefragt | wird bei jedem Lauf neu gebaut |
| Konsument | bauende Agenten + Samuel | Website-Besucher | Coding-Agenten, Menschen |
| Speicher | Notion-Cloud, Connector | Vectorize / AI Search / `llms.txt` | `graph.json`, `graph.html`, lokal |
| Status | **leer**, Inhalt fehlt | Kandidat, nicht gegengeprüft | gebaut, 130 Knoten |

Belege für die Trennung, nicht für den Anker: `notion/README.md:13`
(„noch nicht gelesen"), `tech/INTENT.md:26` (T8, Wissensquelle),
`UPSTREAM_SEARCH-graphify.md:5-10` (Mesh-Need). Keine der drei Dateien verweist auf eine
der anderen. Im Graph ist das messbar: **0 Kanten** zwischen den Notion-Knoten
und `Vectorize`/`AI Search`, **0 Kanten** zwischen den Notion-Knoten und den vier
Upstream-Repos, **0 Kanten** zwischen den Upstream-Repos und
`Vectorize`/`AI Search`. Drei Communities (6, 3, 4/7) ohne eine einzige
Verbindung.

Was es *gibt*, ist eine Einbahnstraße, keine Synergie: falls Notion-Inhalte je
zur Laufzeit gebraucht werden, müssen sie durch dieselbe Ingestion wie (b) —
Notion → Chunk → Embedding → Index. Das ist eine Datenrichtung, kein geteiltes
Modell. Und diese Straße ist heute versperrt (`notion/README.md:7-11`: 401,
kein Token, funktionierender Zugang nur im Claude/ChatGPT-Connector).

## Belege

| # | Behauptung | Beleg |
|---|---|---|
| 1 | Notion-Seiten sind als Bau-Material gerahmt, nicht als Laufzeitdaten | `notion/README.md:13` „Relevante Seiten (aus dem Kontext-Wiki, noch nicht gelesen)" |
| 2 | Der Zweck jeder Seite ist mit „Warum relevant" für *dieses Projekt* begründet | `notion/README.md:15-23` |
| 3 | HAI-Agentenarchitektur = Vorgängerspur der Skizzen-Struktur | `notion/README.md:17` |
| 4 | Gedanken/IDEEN = Herkunft von „Agentfähig" → Provenienz, nicht Wissen | `notion/README.md:19-20` |
| 5 | Projects/Tasks-DBs = Status und offene Aufgaben des Projekts | `notion/README.md:18,23` |
| 6 | „Mensch heute" = „Samuels Zustand/Kontext für Agenten" — einzige ambivalente Zeile | `notion/README.md:21` |
| 7 | Notion-Spur ist leer; die Skizze ist die einzige Inhaltsquelle | `notion/README.md:25-28` |
| 8 | Nächster Notion-Schritt ist Ingestion (Export/Token/Copy-Paste) | `notion/README.md:30-35` |
| 9 | Notion ist aus diesem Repo technisch nicht erreichbar (401) | `notion/README.md:7-11` |
| 10 | Einziger Produkt-Beleg für „Context" ist ein Halbsatz im Transkript | `Idea:35-38`; `docs/PROJECT.md:9-11` |
| 11 | Skizze liefert nur `plaud thoughts →` als Wissens-Eingang | `sketches/2026-11-12-agentfaehig.md:136` |
| 12 | Skizze hat keinen Gedächtnis-/Archiv-Abschnitt | `sketches/:131-137` (vollständiger Ausschnitt 8) |
| 13 | `philosophy of HAI` + `plaud thoughts` sind **nur** als T8 gedeutet — Interpretation, keine Owner-Aussage | `tech/INTENT.md:26`; `tech/LUECKEN.md:65-66,180` |
| 14 | T8-Lösung ist Cloud Vectorize, ausdrücklich ungeprüft | `tech/CLOUDFLARE_MACHBARKEIT.md:64`; `tech/LUECKEN.md:193-194` |
| 15 | Für wenig Wissen reicht statisches `llms.txt` — also gar kein Gedächtnis | `tech/CLOUDFLARE_MACHBARKEIT.md:64` |
| 16 | „Zustand" (T3) ist Regler-/Status-Sync, nicht Gedächtnis — vierte Sache | `tech/INTENT.md:21`; `tech/CLOUDFLARE_MACHBARKEIT.md:29-41` |
| 16b | „Text und Verlauf" ist Anzeige-Zustand, keine Wissensspeicherung — fünfte Sache | `docs/DESIGN-DECISIONS.md:15-16` |
| 16c | Fünf Build-Fragen beantwortet, sieben offen — keine betrifft Kontext/Gedächtnis | `docs/PROJECT.md:28-43`; `docs/DESIGN-DECISIONS.md:53-70` |
| 17 | Upstream-Memory-Kandidaten gehören zum Repo-Mesh-Need, nicht zum Produkt | `UPSTREAM_SEARCH-graphify.md:5-10,20` |
| 18 | Graphify rechnet pro Lauf per LLM-Backend, lokal über Ollama | `UPSTREAM_SEARCH-graphify.md:38-44,62-66` |
| 19 | Graphify schreibt Anweisungsdateien ins Repo (Nebenwirkung) | `UPSTREAM_SEARCH-graphify.md:48-52` |
| 20 | Produkt-Upstream-Suche enthält **keinen** Gedächtnis-Kandidaten | `tech/UPSTREAM_SEARCH-cloudflare.md:15-24` |
| 21 | Scout-Synthese liefert nichts zu Gedächtnis; KnowledgeGraph-Zugriff unnachgewiesen | `research/SCOUT-SYNTHESIS.md:69-74` |
| 22 | Graph: 0 Kanten zwischen den drei Strängen | `graphify-out/graph.json`, Communities 6 / 3 / 4+7 |

## Build-Kontext vs Laufzeit-Gedächtnis

**Die Trennung ist für 6 von 7 Seiten belegbar. Für „Mensch heute" ist sie es nicht.**

| Seite | Rolle laut Datei | Einordnung | Beleg |
|---|---|---|---|
| HAI – Agentenarchitektur | „direkte Vorgängerspur zur Agenten-Struktur in der Skizze" | **Build** | `notion/README.md:17` |
| Projekte (DB) | „Status, Ziele, Verantwortlichkeiten" des Projekts | **Build** | `:18` |
| Gedanken / IDEEN 1 | „Ideenfundus, vermutlich Herkunft von ‚Agentfähig'" | **Build** (Provenienz) | `:19` |
| Gedanken / IDEEN 2 | „zweite Sammlung" | **Build** (Provenienz) | `:20` |
| Tasks (DB) | „offene Aufgaben zum Projekt" | **Build** | `:23` |
| TP Control Center | „Hub, von dem die anderen Seiten hängen" | **Build** (Navigation) | `:22` |
| Mensch heute | „Samuels Zustand/Kontext für Agenten" | **UNKLAR — offene Owner-Frage** | `:21` |

Warum das keine Spitzfindigkeit ist: „Mensch heute" ist die einzige Seite, deren
Beschreibung einen *Agenten* als Leser nennt („für Agenten"). Wörtlich gelesen
könnte sie Laufzeitdaten sein — persönlicher Zustand des Owners, den der Agent
im Gespräch berücksichtigt, genau wie `plaud thoughts →`
(`sketches/:136`) auf Laufzeitwissen zeigt. Genauso gut kann sie Bau-Kontext
sein: Stimmung und Lage des Owners, damit bauende Agenten passend antworten.

Die Datei entscheidet das nicht. Sie sagt nur „Warum relevant" und meint damit
durchgehend die Entwicklung. Es steht nirgends, dass der ausgelieferte Agent
Notion liest — und technisch könnte er es aus diesem Repo auch nicht
(`notion/README.md:7-11`).

**Das ist der STOP-Punkt: die Datei gibt die Laufzeit-Seite nicht her.** Die
Frage ist nicht rekonstruierbar und wird nicht geraten:

> Ist „Mensch heute" (und ggf. „Gedanken / IDEEN") Bau-Material — oder soll der
> Agent auf agentfähig.de diesen Inhalt Besuchern gegenüber kennen?

Die Antwort hat eine Datenschutzfolge, nicht nur eine technische: persönlicher
Zustand des Owners im Kontext eines öffentlichen Besuchers.

## Konflikte

**K1 — Der vermutete Konflikt existiert nicht.** Die Skizze fordert nirgends ein
lokales Gedächtnis. Es gibt keinen Widerspruch „Skizze lokal vs. INTENT Cloud",
weil die Skizze zur Frage schweigt (`sketches/:131-137`) und INTENT Cloud nur
als *Kandidat* nennt (`tech/INTENT.md:26`, „möglich"), nicht als Entscheidung.
`tech/UPSTREAM_SEARCH-cloudflare.md:26-32` und `CLOUDFLARE_MACHBARKEIT.md:64` halten beide
Optionen offen.

**K2 — Echter Konflikt: „Gedächtnis" bezeichnet zwei Dinge, und beide Lager
empfehlen mit demselben Wort verschiedene Orte.** `UPSTREAM_SEARCH-graphify.md:44`
(„Datenresidenz bei Backend-Wahl bedenken") und der lokal-zuerst-Ansatz
(`:56-66`, komplett lokal über Ollama) gehören zum Repo-Mesh.
`tech/INTENT.md:26` und `CLOUDFLARE_MACHBARKEIT.md:39,64` zeigen für die
Laufzeit auf Cloudflare Vectorize. Beide sind für ihr Objekt richtig. Wer die
Wörter zusammenzieht, baut eines der beiden am falschen Ort — das ist der
teuerste Fehler dieser Synergie, und er ist rein sprachlich verursacht.

**K3 — Laufzeit-Notion ist heute nicht nur unspezifiziert, sondern
undurchführbar.** Der funktionierende Zugang liegt im Claude/ChatGPT-Connector,
nicht in diesem Repo (`notion/README.md:11`). Eine Funktion „der Agent liest
Notion" würde eine Abhängigkeit einführen, die das Projekt nicht kontrolliert.

**K4 — Statuszeile der Notion-Datei ist veraltet.** „die Skizze ist derzeit die
einzige inhaltliche Quelle" (`notion/README.md:27-28`) stimmt seit
`docs/DESIGN-DECISIONS.md` nicht mehr; schon in `tech/LUECKEN.md:123-124`
vermerkt. Kein Widerspruch zur Sache, aber die Datei lügt an ihrer eigenen
Statusstelle.

**K5 — Auflösungsunterschied, kein Widerspruch.** Graphify löst auf
Datei-Ebene mit `source_file`/`source_location` auf. Vectorize löst auf
Chunk-Ebene auf. Notion löst auf Block-/Property-Ebene auf. Drei Granularitäten.
Ein gemeinsames Kantenmodell müsste alle drei tragen — das ist die Stelle, an
der „ein Modell für alles" scheitert.

**K6 — Die Frage steht auf keiner Entscheidungsliste.** Fünf Build-Fragen sind
am 19.11.2026 beantwortet (`docs/PROJECT.md:28-43`), sieben Fragen bleiben offen
(`docs/DESIGN-DECISIONS.md:53-70`). Keine der zwölf betrifft Herkunft, Umfang
oder Ort des Kontexts. Das ist kein Widerspruch, sondern eine Auslassung: das
Thema ist aus dem aktuellen Entscheidungsstand verschwunden, obwohl der Owner
„Context" in `Idea:38` selbst genannt hat. Wer heute baut, entscheidet es
faktisch mit — stillschweigend, ohne Beleg.

**K7 — Ein viertes Ding heißt ebenfalls „Gedächtnis" und ist keins.** „Text und
Verlauf" (`docs/DESIGN-DECISIONS.md:15-16`: ältere Antworten treten zurück und
werden beim Scrollen sichtbar) ist Anzeige-Zustand im Browser, kein Wissen des
Agenten. Es braucht weder Index noch Suche. Wer diese Zeile als Memory-Anforderung
liest, baut einen Verlaufsspeicher, den niemand gefordert hat.

## Kosten des Verpassens

**S1 — Gedächtnis vor der Frage bauen (Vectorize-Schema + Chunker + Embeddings),
bevor klar ist, was der Looking-up-Agent beantworten soll.**
Der Looking-up-Agent hat heute keine definierte Aufgabe außer „Suche"
(`CLOUDFLARE_MACHBARKEIT.md:39`). Ein gebautes Index-Schema passt dann nicht auf
das, was später hineinmuss: Notion liefert Block-Bäume und DB-Zeilen mit
Properties, `plaud thoughts` liefert Transkripte mit Zeitmarken. Umbau heißt
neu chunken und neu indexieren, nicht umkonfigurieren. Kosten: Pipeline-Neubau
plus die bereits bezahlten Embedding-Läufe.

**S2 — Notion als Bau-Material ernten, später Laufzeit daraus machen (der
teuerste Fall).**
Ein Export nach `notion/README.md:30-35` erzeugt einen Snapshot ohne `scope`,
ohne `owner`, ohne Sichtbarkeitsmarkierung. Der ist für bauende Agenten
unbedenklich. Wird er später zur Laufzeitquelle, ist „Mensch heute"
automatisch im Besucherkontext — ein Datenschutzvorfall, kein Bug. Nachrüsten
heißt: Zugriffskontrolle auf einen Korpus legen, der ohne sie gesammelt wurde,
und jede Seite nachträglich klassifizieren. Das ist teurer als S1, weil der
Fehler nicht im Code sitzt, sondern im Bestand — und weil er erst auffällt,
wenn schon jemand zugegriffen hat.

**S3 — Den Repo-Graph als Agent-Gedächtnis missverstehen.**
`graph.json` ist ein Build-Artefakt: pro Lauf per LLM erzeugt
(`UPSTREAM_SEARCH-graphify.md:62-66`), ohne Schreib-API, ohne Endpoint, mit
`built_at_commit` als Stand. Als Laufzeitspeicher untauglich: kein Ingest,
keine Aktualisierung im Betrieb, kein Zugriff aus einem Worker. Kosten: man
baut die Suche zweimal, weil der Graph nur die halbe Strecke trägt, und zahlt
den LLM-Pass weiter bei jedem Commit.

**Zur im Auftrag genannten Kernfrage („später merken, dass beide dasselbe
Format brauchen"):** Die Kosten sind niedrig, wenn früh ein *Umschlag* mit
`scope` festgelegt wird, und hoch, wenn eine Seite ihr Format hartkodiert. Aber
die Prämisse ist zu prüfen: Notion-Kontext und Laufzeit-Gedächtnis brauchen
nicht dasselbe Format, sondern nur denselben Umschlag. Ein gemeinsames
*Modell* zu erzwingen wäre teurer als drei Modelle — DB-Zeilen mit Status zu
flachen Chunks verliert genau die Relationen, die „Projects" und „Tasks"
ausmachen; umgekehrt müsste die Laufzeit Block-Bäume traversieren und würde das
1-Sekunden-Budget (`tech/INTENT.md:20`) reißen.

## Verankerung

**Datei: `notion/README.md` — die einzige Stelle im Repo, die erklärt, wofür
Notion überhaupt da ist, und die es zugleich unterlässt, Laufzeit zu erwähnen.**
Sie ist der richtige Anker, weil sie schon die Halbstruktur trägt, die man
bräuchte: eine Tabelle mit „Thema | Seite | Warum relevant". Aus „Warum
relevant" wird eine Spalte `scope`, aus „Seite" wird `source`. Der Text müsste
nicht neu geschrieben werden, nur um eine Spalte und einen Satz ergänzt. Zweiter
Kandidat wäre `docs/PROJECT.md:28-49` („Vor dem ersten Build zu entscheiden") —
fünf Fragen, alle am 19.11.2026 beantwortet (`:30-43`), keine davon zu Kontext
oder Gedächtnis; die sieben verbliebenen offenen Fragen
(`docs/DESIGN-DECISIONS.md:53-70`) berühren es ebenfalls nicht. Die Frage wäre
dort also neu zu erfinden. `notion/README.md`
ist der einzige Ort, an dem die Frage schon halb gestellt ist, und der einzige,
an dem eine falsche Antwort sofort sichtbar würde. Nachteil: die Datei ist eine
Statusnotiz, kein Vertrag — ihre Autorität ist schwach, und sie ist an ihrer
eigenen Statusstelle veraltet (K4). Deshalb gehört die Festlegung am Ende nach
`docs/`; der Anker ist der Ausgangspunkt, nicht das Ziel.

## Urteil

**THEMENVERWANDT.**

Dasselbe Wortfeld, drei Objekte, null Kanten. Kein geteiltes Kontext-Modell,
keine gemeinsame Schnittstelle, kein gemeinsamer Besitzer. Der Kandidat „alles
ist ein Dokument mit Metadaten und Kanten" ist eine Analogie, die der Text nicht
trägt: Notion ist ein menschlich gepflegter Bestand, das Laufzeit-Gedächtnis ist
ein Index über einmal ingestierte Texte, der Repo-Graph ist ein Wegwerf-Artefakt
pro Commit. Es gibt genau eine echte Verbindung — die Einbahnstraße
Notion → Ingestion → Index, *falls* Laufzeit-Notion je gewollt ist — und die ist
heute technisch blockiert. Der teuerste Fehler wäre nicht, die Synergie zu
verpassen, sondern sie zu glauben: daraus ein Gedächtnis-Modul zu bauen, das
drei verschiedene Lebenszyklen in ein Schema zwingt.

## Ein nächster Schritt

**Eine Zeile Text, kein Code, keine Anbieterwahl:** Definition des Umschlags
plus die eine offene Owner-Frage.

```
Kontext-Eintrag := { id, source, title, body, links[], scope: build|runtime, owner }
Regel: scope:runtime nur nach ausdrücklicher Owner-Entscheidung pro Eintrag.
```

Zu beantworten von Samuel (eine Frage, `notion/README.md:21`):

> Ist „Mensch heute" Bau-Material oder Laufzeitwissen des Agenten?

Bis zur Antwort bleibt jede Seite `scope: build` — der Default ist der
unkritische. Diese Festlegung ist unabhängig davon, ob später Vectorize,
`llms.txt` oder nichts davon gebaut wird: sie entscheidet nur, was ein Eintrag
tragen muss, nicht wo er liegt.

Zweiter, gleichrangiger Schritt: die Frage überhaupt auf die Entscheidungsliste
setzen. Sie steht heute auf keiner (K6), und `docs/DESIGN-DECISIONS.md:72-76`
sagt ausdrücklich „Entscheidungen oben nicht erneut abfragen" — ohne Eintrag
wird sie also nie gestellt.

## Antwort in fünf Zeilen

1. **Anker oder keiner:** Keiner — drei Modelle, 0 Kanten im Graph, nur ein gemeinsames Wortfeld.
2. **Trennung build/runtime belegbar?** Für 6 von 7 Seiten ja (build); „Mensch heute" (`notion/README.md:21`) ist nicht entscheidbar → offene Owner-Frage.
3. **Teuerstes Verpassen:** S2 — Notion ohne `scope`/`owner` ernten und später zur Laufzeitquelle machen; Datenschutz im Bestand, nicht im Code.
4. **Verankerungsziel:** `notion/README.md` (Tabelle „Warum relevant" → Spalte `scope`), Festlegung wandert danach nach `docs/`.
5. **Urteil:** THEMENVERWANDT.
