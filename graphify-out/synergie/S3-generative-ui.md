# S3 — Generative UI ↔ Agent-Output

Untersucht am 19.11.2026 · Subagent (read-only außer dieser Datei) · Projekt
`03_HAI/Agentfaehig/Agent`

Frage: Ist „Generative UI ↔ Agent-Output" eine Synergie mit gemeinsamem Anker
oder nur verwandte Themen? Kurzantwort: **beides, und die Trennlinie ist
scharf** — gemeinsamer Anker ist ein typisierter Kanal Agent → UI; *kein*
gemeinsamer Anker ist „Antwort als Komponentenbaum".

Belegstand: alle Zeilenangaben beziehen sich auf den Arbeitsbaum vom
19.11.2026. `tech/UPSTREAM_SEARCH.md` heißt dort inzwischen
`tech/UPSTREAM_SEARCH-cloudflare.md` (reiner Rename, gleicher Inhalt), die
Zeilenangaben gelten unverändert. `docs/DESIGN-DECISIONS.md`, `tech/INTENT.md`,
`tech/ABGLEICH.md`, `tech/CLOUDFLARE_MACHBARKEIT.md` und `tech/LUECKEN.md` sind
gegenüber `HEAD` geändert; zitiert ist der gelesene Arbeitsstand, nicht `HEAD`.

## 0 · Korrektur der Beteiligten-Liste (vor der Sache)

Die Hyperedge heißt exakt `Generative UI Ansätze` und enthält **drei** Knoten:
`Vercel AI SDK`, `json-render`, `A2UI` — nachgeprüft mit
`graph.json → hyperedges`. Open WebUI und LiveKit Agents sind **nicht** Teil
dieser Hyperedge; sie stehen in `tech/research/konkurrenz.md:21` (Gruppe 1) und
`:27` (Gruppe 2) und begründen keine Generative-UI-Kante. Wer sie mitzählt,
zählt Themenverwandtschaft hinzu, nicht den Anker. Open WebUI ist für diese
Frage trotzdem nützlich — aber als Gegenbeispiel („ein Fenster, Chat als Heim",
`:21`), nicht als Generative-UI-Beitrag.

Graph-Befund zur Ausgangslage: es existiert **keine** Kante zwischen einem
Skizzen-Knoten und einem der drei Generative-UI-Knoten. Die einzigen
Verbindungen laufen über die Sammelknoten `Konkurrenz Recherche` und
`UPSTREAM_SEARCH (Tech)`. Die Skizze hängt an `Sliders` und `HAI Interaction`,
die Generative-UI-Knoten hängen an `Generative UI`. Zwei Inseln, eine Brücke
fehlt.

## Der Anker

Es gibt **einen** Kandidaten, der beide Stränge trägt, und er ist nicht
„Generative UI" im landläufigen Sinn. Es sind drei Anker zur Auswahl, und nur
zwei überleben die Prüfung an der Skizze:

| # | Anker-Kandidat | Was er behauptet | Von der Skizze gefordert? |
|---|---|---|---|
| A1 | **Antwort-Inhalt als Komponentenbaum** (Tool-Ergebnis → React-Komponente; Vercel AI SDK, `konkurrenz.md:39`) | Der Agent beschreibt, *was inhaltlich* gezeigt wird (Tabelle, Karte, Formular) | **Nein.** Kein Skizzen-Zitat verlangt Antwortinhalt als Komponente. Die Skizze will Text („1 message", `sketches:82`), Augen (`:75`, `:82`) und Slider (`:82`). `SCOUT-SYNTHESIS.md:65` warnt ausdrücklich: „Ein Text-Eingabefeld beweist keine bereits spezifizierte Text-Ausgabe." |
| A2 | **Steuerflächen-Deskriptor**: der Agent bestimmt, *welche* Bedienelemente sichtbar sind und mit welchem Wert | Katalog + Auswahl statt freier HTML-Erzeugung (`konkurrenz.md:40`) | **Ja.** `sketches:84` „max 3", `sketches:105` „maybe 5 options but only show 3" — die Auswahl aus einem Vorrat ist wörtlich da. `SCOUT-SYNTHESIS.md:60` bestätigt: „max 3 ist ein Slider-Limit". |
| A3 | **Zustandskanal Agent ↔ Browser** mit Zwei-Wege-Bindung: Agent setzt Werte, Mensch zieht Regler, beide sehen dasselbe | `tech/INTENT.md:23` (T5: „Agent verändert das Aussehen der Seite"), json-renders `$bindState` (`konkurrenz.md:41`) | **Ja, explizit.** `sketches:26-27` („asks the user for what it should look like: colour · form · output style"), `sketches:84` („real time effects"), `sketches:102` („the 'design' colour feel of the website"). |

**Der Anker ist A2 + A3, nicht A1.** Konkret: eine typisierte Nachricht
Agent → Browser, die neben Text auch trägt, *welche* Katalog-Elemente sichtbar
sind und *welche Werte* sie haben, und die in Gegenrichtung dieselben Werte
zurücknimmt. Das ist genau der Teil, den `json-render` mit `$bindState`
abdeckt (`konkurrenz.md:41`) und den `A2UI` als „Protokoll als Daten statt
Code" beschreibt (`konkurrenz.md:40`). Es ist **nicht** die Generative-UI-Idee
„die Oberfläche entsteht zur Laufzeit aus dem Tool-Ergebnis"
(`konkurrenz.md:39`) — die braucht die Skizze nirgends.

Wichtige Einschränkung, die den Anker schmaler macht als er klingt: die
Konkurrenz-Recherche hat **keinen** Fall gefunden, in dem ein Agent seine
eigene Seite zur Laufzeit umfärbt (`konkurrenz.md:77`). Der Anker ist also
nicht „ bewährtes Upstream-Muster", sondern „Schnittmenge zweier Upstreams, die
für etwas anderes gebaut wurden". Das ist ein Risiko, kein Beleg.

## Belege

| Behauptung | Beleg (Datei:Zeile) | Belastbarkeit |
|---|---|---|
| Einziges sichtbares Bedienelement sind Slider | `sketches/2026-11-12-agentfaehig.md:28` | Skizze, wörtlich |
| Der Agent fragt den Menschen nach `colour · form · output style` | `sketches/2026-11-12-agentfaehig.md:26-27` | Skizze, wörtlich |
| Slider haben „real time effects", Serie heißt „on the HAI Interaction" | `sketches/2026-11-12-agentfaehig.md:84-85` | Skizze, wörtlich |
| 5 Optionen im Vorrat, nur 3 sichtbar | `sketches/2026-11-12-agentfaehig.md:105` | Skizze, wörtlich; Bedeutung „Optionen = Slider" ist Lesart |
| „max 3" ist ein Slider-Limit, kein Nachrichtenlimit | `research/SCOUT-SYNTHESIS.md:60` | geprüfte Korrektur eines früheren Scout-Fehlers |
| HAI-Interaction darf sichtbar sein („Connect effect") | `sketches/2026-11-12-agentfaehig.md:154` | Skizze, wörtlich |
| „popups move 'when … is …'" — UI ändert sich an Bedingungen | `sketches/2026-11-12-agentfaehig.md:155` | Skizze, wörtlich, Ellipse unklar |
| Ruhe ist ein dichter Kritzel-Textur-Stand **ohne lesbaren Inhalt** | `sketches/2026-11-12-agentfaehig.md:71` | Skizze, wörtlich |
| „nicht bevormundend", „soft smooth", „welcomed" | `sketches/2026-11-12-agentfaehig.md:60-65` | Skizze, wörtlich |
| Präsenz darf „sanft, minimal, unaufregend" sein | `docs/DESIGN-DECISIONS.md:13` | Owner-Entscheidung, bestätigt |
| Typewriter soll „lebendig und pulsierend" sein | `docs/DESIGN-DECISIONS.md:17` | Owner-Entscheidung, bestätigt |
| **Agent verändert das Aussehen der Seite** — als technische Anforderung T5 | `tech/INTENT.md:23` | abgeleitete Anforderung aus der Skizze |
| T6 (Augen, Effekte) ist ausdrücklich „reines Frontend" | `tech/INTENT.md:24` | abgeleitete Anforderung |
| Reglerwerte sind Felder im Agent-Zustand, Echtzeit an alle Browser, geprüft | `tech/ABGLEICH.md:42` | Orchestrator-geprüft |
| T5 ist machbar; „wie der Zustand zur Oberfläche wird, ist Frontend; Kandidat json-render" | `tech/CLOUDFLARE_MACHBARKEIT.md:61` | geprüft, Kandidat offen |
| A2UI: Agent darf nur aus Katalog wählen, nicht beliebig umschreiben | `tech/research/konkurrenz.md:40` | Worker-Bericht |
| json-render: Katalog + `$bindState`-Zwei-Wege-Bindung + progressives Rendern | `tech/research/konkurrenz.md:41` | Worker-Bericht |
| json-render als Upstream-Kandidat, Entscheidung erst nach Design | `tech/UPSTREAM_SEARCH-cloudflare.md:19`, `:31-32` | geprüft (Lizenz/Push) |
| A2UI vorerst reject: „breiter als nötig (Flutter, SwiftUI, Compose)" | `tech/UPSTREAM_SEARCH-cloudflare.md:20` | geprüft |
| json-render-`Slider`-Baustein nur vom Worker behauptet, nicht gegengeprüft | `tech/LUECKEN.md:204-206` | offene Lücke |
| Kein Fund für „Agent färbt eigene Seite live um" | `tech/research/konkurrenz.md:77` | Negativbeleg, wichtig |
| „Bedeutung und Belegung der bis zu drei sichtbaren Slider" ist offen | `docs/DESIGN-DECISIONS.md:38` | offene Owner-Frage |
| Beispiel für einen bereits eingetretenen Doppelstrom-Konflikt (Typewriter vs. Stimme) | `tech/ABGLEICH.md:46-54` | dokumentiert |

### Was die Skizze **nicht** sagt (Gegenbelege)

- Kein Satz verlangt, dass der Agent die Antwort *als Oberfläche* liefert. Der
  Ausgabeweg der Skizze ist Text plus Augen plus Nachlauf, nicht Layout.
- `colour · form · output style` (`sketches:26-27`) sind drei *Adjektive*, kein
  Schema. „output style" kann Textstil (Länge, Ton) heißen und nicht
  UI-Komposition. Diese Doppellesart ist der Kern der Unschärfe.
- Die Skizze beschreibt keine Katalog-Begriffe. „max 3" und „5 options" sind
  Mengen, keine benannten Komponenten.
- `tech/INTENT.md:6-7` stellt klar: „Design und Requirements kommen vom Owner
  … und sind hier nicht Thema." Der Anker ist damit vorläufig eine
  *technische* Lesart der Skizze, keine Designzusage.

## Konflikt Ruhe vs Dynamik

**Urteil: echter Spannungsbogen, aber kein Widerspruch — und die Skizze löst
ihn selbst, an einer Stelle, die leicht überlesen wird.**

Die beiden Seiten, hart gegenübergestellt:

- Ruhe-Seite: „dichtes, kurzes Gekritzel — Textur **ohne lesbaren Inhalt**"
  (`sketches:71`); „soft smooth · effortless", „nicht bevormundend"
  (`sketches:60-65`); „sanft, minimal, unaufregend" (`DESIGN-DECISIONS:13`).
- Dynamik-Seite: „die Oberfläche entsteht zur Laufzeit" (`konkurrenz.md:39`);
  „progressive Darstellung während des Streams" (`konkurrenz.md:41`);
  „real time effects" (`sketches:84`).

Auf den ersten Blick schließen sich das aus: ein Feld, dessen Reiz gerade
darin liegt, *keinen lesbaren Inhalt* zu haben, ist das Gegenteil einer
Oberfläche, die aus Daten zusammengesetzt wird. Generative UI ist
standardmäßig sichtbares Werden — genau die Unruhe, die
`DESIGN-DECISIONS:13` ausschließt.

Die Auflösung steht in der Skizze: **jede UI-Veränderung ist an ein Ereignis
gebunden, nicht an einen Dauerstrom.** „after click", „mouse move"
(`sketches:81`), „popups move 'when … is …'" (`sketches:155`),
„on wind" (`sketches:72-73`), „2 more when this" (`sketches:105`). Es gibt
kein einziges Skizzen-Zitat für eine Oberfläche, die sich *während* der
Antwort umbaut. Ruhe heißt hier: zwischen den Ereignissen passiert nichts.

Damit sind drei Ausgänge möglich, alle mit anderem Preis — Entscheidung liegt
beim Owner:

1. **Katalog-Enge** (A2UI-Linie): Der Agent darf ohnehin nur aus einem
   winzigen Katalog wählen (`konkurrenz.md:40`), und „max 3" begrenzt die
   Fläche (`sketches:84`). Dynamik wird durch Vorratsgröße entschärft.
   Preis: die Oberfläche wird nie überraschen; das „vivid · alive"
   (`sketches:60`) muss dann komplett aus Bewegung/Textur kommen, nicht aus
   Struktur.
2. **Ereignis-Gatter**: Deskriptor-Updates nur zu definierten Zeitpunkten
   (Klick, Runde beendet, Slider losgelassen), nie mitten im Token-Strom.
   Preis: eine explizite Regel, die niemand in der Skizze aufgeschrieben hat —
   sie wäre eine neue Designentscheidung, nicht bloß eine Umsetzung.
3. **Kein Deskriptor, nur Style-Token**: Der Agent schreibt Farb-/Form-/Textur-
   Variablen, die Struktur bleibt statisch. Preis: „maybe 5 options but only
   show 3" (`sketches:105`) verliert seinen Witz — Auswahl ohne Struktur ist
   nur Theming, und genau das nennt `Agentfähig/GreateWriting.txt:222`
   „decoration, not adaptation".

Nebenbefund, der in dieselbe Kerbe schlägt: `sketches:189-199` notiert selbst
eine Spannung zwischen „der Agent fragt sein Aussehen selbst ab" und der
Kritik am oberflächlichen Farbthema. Wer die Slider als Generative-UI-Kanal
baut, baut die vom Inspirationstext kritisierte Variante — aber mit besserer
Mechanik. Das ist kein Argument gegen den Anker, sondern für die
Reihenfolge: erst Slider-Belegung (`DESIGN-DECISIONS:38`), dann Technik.

## Kosten des Verpassens

Drei Szenarien, wenn Interface und Agent-Output getrennt entworfen werden.
Kein hypothetisches Zukunftsszenario — jedes hat im Repo schon eine Vorstufe.

**1. Der Textkanal verhärtet sich, bevor die Slider-Frage entschieden ist.**
`DESIGN-DECISIONS:38` lässt die Slider-Belegung ausdrücklich offen, gleichzeitig
sind acht Antwort-Entscheidungen bereits bestätigt (`DESIGN-DECISIONS:10-19`).
Wer jetzt Typewriter und Antwort-Lebenszyklus baut, baut sie gegen „ein Strom
Text". Kommt später „der Agent zeigt 3 von 5 Reglern", muss die Nachricht
zwischen Agent und Browser neu geschnitten werden — Prompt-Vertrag, Renderer
und Typewriter-Puffer gleichzeitig. Das ist die teuerste Art Nacharbeit: keine
Stelle ist falsch, aber die Naht liegt quer durch alle.

**2. Der Agent bekommt keinen Schreibweg in die Oberfläche und bleibt
Requisite.** `tech/INTENT.md:24` ordnet Augen und Effekte als „reines
Frontend" ab; das ist für T6 richtig, macht aber T5 (`INTENT.md:23`:
„Agent verändert das Aussehen der Seite") zur Ausnahme, die niemand besitzt.
Ergebnis: „HAI Interaction → can be visible" (`sketches:154`) bleibt dekorativ,
der „Connect effect" (`:154`) wird eine CSS-Animation, die aussieht wie eine
Agent-Reaktion, aber keine ist. Der Unterschied fällt im Betrieb auf, nicht im
Review — es gibt keinen Test, der „der Agent hat das ausgelöst" prüfen kann,
weil es keinen Kanal gibt, auf dem er es täte.

**3. Zwei Ströme ohne Vorrangregel — der Fehler, den das Projekt schon hat.**
`tech/ABGLEICH.md:46-54` dokumentiert genau diese Klasse: Typewriter und Stimme
laufen auseinander, weil zwei Ströme ohne Führungsregel existieren. Ein
Deskriptor-Strom neben dem Textstrom reproduziert das mit höherem Preis: ein
verspäteter Deskriptor überschreibt den Regler, den der Mensch gerade zieht
(genau die Zwei-Wege-Bindung aus `konkurrenz.md:41`), oder er setzt die
Oberfläche auf einen Stand zurück, der zur bereits gelesenen Antwort nicht
mehr passt. Die Latenz ist dabei nicht das Problem — `CLOUDFLARE_MACHBARKEIT:61`
hält den Sync für machbar. Das Problem ist die Reihenfolge, und die ist
nirgends definiert.

Gegenprobe, warum das Verpassen *nicht* teuer wäre: wenn die Slider am Ende
reines Theming werden (Ausgang 3 oben), ist der Anker wertlos, und getrennt
entwickelte Style-Token wären billiger gewesen. Das Verpassen kostet also
genau dann, wenn die Slider mehr als Farbe dürfen — und das ist wegen
`DESIGN-DECISIONS:38` offen. Deshalb ist die Reihenfolge wichtig und nicht die
Antwort.

## Verankerung

**Ziel: `docs/DESIGN-DECISIONS.md`, offene Frage in Zeile 38** („Bedeutung und
Belegung der bis zu drei sichtbaren Slider"), mit Rückverweis auf
`tech/INTENT.md:23`.

Warum dort und nicht in `tech/`: der Anker ist keine Technikfrage, sondern eine
Scope-Frage. `tech/UPSTREAM_SEARCH-cloudflare.md:31-32` sagt selbst, json-render bleibt
„Kandidat offen, bis das Design vorliegt" — die Technik wartet also schon
richtig. Was fehlt, ist die eine Aussage, ob ein Slider ein *Stilwert* ist oder
ein *Strukturelement*. Ist er Stilwert, braucht es keinen Deskriptor und die
Synergie schrumpft auf Theming. Ist er Strukturelement, ist der Kanal
zwingend und `tech/INTENT.md:23` ist bereits die halbe Spezifikation. Beides
ist mit derselben Zeile entscheidbar, und beide Ausgänge sind billig — nur der
Nichtentscheid ist teuer, weil dann beide Stränge parallel gegen verschiedene
Annahmen bauen. Die Verankerung sollte maximal eine Zeile Skizzen-Zitat pro
Ausgang nennen (`sketches:84` + `:105` für Struktur, `sketches:26-27` für
Stil), damit die Entscheidung prüfbar bleibt und nicht als Gefühl im Raum
steht.

## Urteil

**ECHTE SYNERGIE — aber eng und nur auf dem Kanal, nicht auf dem Inhalt.**

Begründung in einem Satz: beide Stränge können ohne dieselbe fehlende Zutat
nicht fertig werden — einen typisierten Agent→UI-Kanal, der Sichtbarkeit und
Werte von Katalogelementen trägt und in beide Richtungen gebunden ist
(`tech/INTENT.md:23` fordert ihn, `json-render`/`A2UI` liefern die Mechanik,
`sketches:84`/`:105` liefern die Begrenzung).

Abgrenzung, damit das Urteil nicht überdehnt wird: die *inhaltliche*
Generative-UI-Idee („Antwort wird aus Tool-Ergebnissen zu Komponenten",
`konkurrenz.md:39`) ist für dieses Projekt **THEMENVERWANDT** und bleibt es,
solange die Skizze Text als Antwortweg führt (`docs/DESIGN-DECISIONS.md:14-15`)
und `SCOUT-SYNTHESIS.md:65` davor warnt, aus einem Eingabefeld eine
Ausgabespezifikation zu machen. A1 ist nicht der Anker.

Der Konflikt Ruhe vs. Dynamik ist **aufgelöst, nicht nur benannt**: die Skizze
bindet jede Veränderung an Ereignisse (`sketches:81`, `:155`) und begrenzt die
Fläche auf drei (`:84`, `:105`). Ob das reicht, entscheidet die Slider-Belegung
— deshalb ist der Konflikt kein Blocker, sondern die erste Frage.

Restrisiko, ehrlich benannt: die Schnittmenge ist upstream unbelegt
(`konkurrenz.md:77`: kein Fund für Agent-färbt-eigene-Seite). Der Anker ist
plausibel und billig zu prüfen, aber nicht durch Vorarbeiten gedeckt.

## Ein nächster Schritt

Eine Festlegung, ein Beispiel, ein Test — in dieser Reihenfolge, ohne Code:

1. **Festlegung** (Owner, eine Zeile in `docs/DESIGN-DECISIONS.md:38`): Ist ein
   Slider ein Stilwert oder ein Strukturelement? Struktur ⇒ Kanal nötig,
   Stil ⇒ Kanal optional.
2. **Beispiel** (falls „Struktur"): ein einziges dokumentiertes Nachrichten-
   beispiel `{ text, ui: { visible: [id…], values: {id: wert} } }` mit
   Katalog-IDs, keine Implementierung. Prüfbar daran, dass jede ID in einem
   benannten Katalog vorkommt — der Katalog ist die Sicherheitsgrenze
   (`konkurrenz.md:40`).
3. **Test** (der eigentliche Beweis, ohne Framework): Stub-Agent sendet das
   Beispiel, drei Regler erscheinen mit den Werten aus der Nachricht, ein
   gezogener Regler kommt als Wert zurück. Erst wenn dieser Kreis einmal
   geschlossen ist, ist der Anker belegt statt behauptet.

Fällt die Festlegung auf „Stil", ist die Folge nicht „nichts tun", sondern:
`json-render`/`A2UI` aus `tech/UPSTREAM_SEARCH-cloudflare.md:19-20` endgültig als
Kandidaten schließen und den Anker als Style-Token-Kanal (A3 allein)
weiterführen. Auch das ist ein Ergebnis — nur ein anderes.
