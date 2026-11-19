# S4 — Zustand und Streaming

Synergie-Kandidat geprüft: „Zustands-Synchronisation" (Grad 0) + „Typewriter Feature" (Grad 0) + Slider/Input (Skizze Ausschnitt 5).

Prüfer: Subagent Zustand. Abgrenzung: Latenzbudget und Sprachpipeline sind nicht mein Gegenstand; Überschneidung nur, wo Streaming den Zustand korrumpiert.

Stand: 19.11.2026. Graph-Daten: `graphify-out/graph.json` (`built_at_commit` im Kopf der Datei).

---

## Was ist gemeint

Die drei Stellen fordern **nicht dasselbe**, aber sie fordern denselben **Mechanismus**. Das ist der Unterschied, auf den es ankommt.

### Stelle A — „Zustands-Synchronisation" ist ein technisches Konzept, kein UI-Effekt

`tech/CLOUDFLARE_MACHBARKEIT.md:46-49`:

> „Darüber laufen Audio in beide Richtungen, Text, der Agent-Zustand (Reglerwerte, Farben, Ergebnisse) und die Signale für die Animation. […] Deren Ergebnisse kommen über die Zustands-Synchronisation im Browser an, ohne neue Anfrage."

`tech/CLOUDFLARE_MACHBARKEIT.md:61` (T5):

> „Agent-Zustand synchronisiert an alle verbundenen Browser (`setState`, `useAgent`)"

Und der Mechanismus dahinter, `tech/research/cloudflare-bausteine.md:236-237`:

> „Zustandsänderungen werden an alle verbundenen Clients synchronisiert (`setState` → `onStateUpdate` im React-Hook `useAgent`)."

Das ist **Server-Autorität über ein Zustandsobjekt**: der Durable Object hält den Zustand, der Browser liest ihn. Es ist *kein* Ereignisstrom und *keine* Reihenfolge — es ist ein Snapshot, der ersetzt wird. Der Satz „Text, der Agent-Zustand (Reglerwerte, Farben, Ergebnisse)" zählt Text **und** Reglerwerte in **eine** Aufzählung. Das ist die eigentliche Behauptung der Stelle: es gibt *einen* Kanal.

### Stelle B — Typewriter ist Render-Takt über einem bereits wahren Text

`tech/ABGLEICH.md:31`:

> „Das Modell liefert Bruchstücke von Wörtern in unregelmäßigen Abständen. Für einen eigenen Rhythmus muss der Browser den Text puffern und selbst takten. Das ist Frontend, braucht aber eine Regel für den Fall, dass der Puffer leerläuft."

`tech/ABGLEICH.md:32`:

> „[…] setzt voraus, dass ganze Wörter vorliegen, bevor sie erscheinen. Kostet pro Wort eine kleine Verzögerung."

Das ist **nicht** dasselbe Problem wie A. Bei A ist die Frage „welcher Zustand gilt?". Bei B ist die Frage „wann zeige ich Text, der schon feststeht?". B erzeugt aber genau das, was A verhindern soll: eine **zweite Darstellung desselben Textes im Browser** (den Puffer), die vom autoritativen Zustand abweichen kann. Und B benennt seinen eigenen Grenzfall selbst — „Puffer leerläuft".

### Stelle C — Slider sind wörtlich derselbe Zustand wie A

`sketches/2026-11-12-agentfaehig.md:82-84`:

> „Karte mit `sliders` oben, „1 message", Augen, Texteingabefeld […] Karte **„max 3"** (drei Slider) — Stichworte **„clear word"**, **„real time effects"**"

`tech/INTENT.md:23` (T5):

> „Zustand Agent ↔ Browser in Echtzeit synchron (WebSocket, State-Sync). Agent verändert das Aussehen der Seite."

`tech/ABGLEICH.md:42`:

> „Technisch frei: Jeder Reglerwert ist ein Feld im Agent-Zustand und kommt in Echtzeit bei allen verbundenen Browsern an (geprüft)."

**A und C sind identisch.** ABGLEICH.md:42 sagt es selbst: der Regler ist „ein Feld im Agent-Zustand", also derselbe Mechanismus, den A beschreibt. Das ist keine Synergie, das ist ein **Duplikat**: dieselbe Sache steht in zwei Dokumenten und wurde im Graphen zweimal als eigener Knoten angelegt (`Zustands-Synchronisation` Community 26, Grad 0; `Sliders` hängt nur an `Agentfähig Sketch` und `Pathways`, 2 Kanten, beide `conceptually_related_to`).

### Ist Typewriter „dasselbe Problem, dreimal gedacht"?

**Nein — aber es hängt über genau eine Naht daran.** Die Naht ist der Renderer:

| | Wer schreibt | Was der Browser hält | Was schiefgeht |
|---|---|---|---|
| A Zustands-Sync | Agent (Snapshot) | Kopie des Snapshots | veralteter Snapshot nach Reconnect |
| B Typewriter | Agent (Bruchstücke) → Browser (Puffer) | **zweite** Textversion | Puffer und Wahrheit laufen auseinander |
| C Slider | Mensch (Absicht) + Agent (Wert) | Kopie des Snapshots | wer gewinnt bei gleichzeitiger Änderung |

Drei Produzenten, ein Renderer, keine gemeinsame Ordnung. Das ist **ein** Zustandsmodell, das dreimal gedacht wird — aber die Problemstellungen sind verschieden. Die Gemeinsamkeit ist strukturell, nicht begrifflich.

**Vollständigkeit der beteiligten Stellen:** Es gibt eine vierte, die der Auftrag nicht nennt und die den Befund verschärft: `tech/ABGLEICH.md:41` —

> „Der Sprach-Client meldet die Zustände „denkt" und „spricht"; für reinen Text müsste das Frontend Pausen selbst erkennen."

Damit hat das Feld `status` **zwei Produzenten** (Voice-Client und Frontend-Heuristik), und `tech/INTENT.md:24` (T6) verlangt es als Ereignisfrage: „Welche Ereignisse liefert der Agent dafür (Zuhören, Denken, Sprechen)?". Ebenso `tech/ABGLEICH.md:29` („Der Verlauf muss gespeichert sein") — ein dritter Speicherort desselben Inhalts.

---

## Der Anker

Ein Zustandsmodell, eine Regel. Kandidat als Vertrag (Formulierung, keine Entscheidung):

> **Vertrag (Kandidat): Ein Gespräch ist ein append-only Ereignisstrom mit monotoner, agent-vergebener `seq`. Alles Sichtbare — Text, Status, Reglerwerte, späte Ergebnisse — ist eine Projektion dieses Stroms. Der Client rendert ausschließlich bestätigte Sequenzen, verwirft Duplikate und wendet keine `seq` doppelt an. Der Typewriter ist die Anzeigegeschwindigkeit eines Präfixes dieses Stroms, kein eigener Speicher. Reglerwerte sind Aktionen des Menschen (`client_seq`) mit agent-bestätigter `seq`; der Agent faltet den Zustand, der Client zeigt nur das bestätigte Ergebnis.**

Drei Konsequenzen, die genau die drei Stellen abdecken:

1. **Ein Snapshot ist keine Wahrheit, sondern ein Cache.** `setState` bleibt erlaubt, aber nur als *Beschleuniger* einer Projektion, die aus dem Strom jederzeit neu baubar ist. Damit ist der Reconnect-Fall in A gelöst, ohne den Mechanismus zu wechseln.
2. **Der Typewriter puffert Text, der schon eine `seq` hat.** „Puffer leerläuft" ist dann kein Zustandsfehler, sondern ein Anzeigezustand (letzte bestätigte `seq` ist erreicht). Der Typewriter darf nie Text erfinden, nur verzögert zeigen — das ist die Regel, die ABGLEICH.md:31 verlangt und nicht formuliert.
3. **Slider und Text kollidieren nicht, weil sie verschiedene `kind` haben.** Ein späteres Sub-Agent-Ergebnis (`kind: late_result`) kann den laufenden Text nicht überschreiben, weil es eine eigene `seq` hinter ihm hat und nicht dasselbe Feld belegt.

Der Vertrag ist **kleiner** als eine Architektur: er legt weder Transport (WebSocket/SSE/WebRTC), noch Speicher (SQLite/DO-Storage), noch Renderer (React/`json-render`) fest.

---

## Belege

| # | Stelle | Datei:Zeile | Zitat (gekürzt) | Was sie fordert |
|---|---|---|---|---|
| 1 | A Zustands-Sync | `tech/CLOUDFLARE_MACHBARKEIT.md:46-47` | „Text, der Agent-Zustand (Reglerwerte, Farben, Ergebnisse) und die Signale für die Animation" | ein Kanal für alles |
| 2 | A Zustands-Sync | `tech/CLOUDFLARE_MACHBARKEIT.md:49` | „über die Zustands-Synchronisation im Browser an, ohne neue Anfrage" | Push statt Poll |
| 3 | A Zustands-Sync | `tech/CLOUDFLARE_MACHBARKEIT.md:60` | „Ergebnis per Zustands-Sync nachreichen" | späte Ergebnisse im selben Kanal |
| 4 | A Zustands-Sync | `tech/CLOUDFLARE_MACHBARKEIT.md:61` | „Agent-Zustand synchronisiert an alle verbundenen Browser (`setState`, `useAgent`)" | Snapshot-Mechanismus belegt |
| 5 | A Mechanismus | `tech/research/cloudflare-bausteine.md:236-237` | „`setState` → `onStateUpdate` im React-Hook `useAgent`" | Ersetzen, nicht Anhängen |
| 6 | B Typewriter | `tech/ABGLEICH.md:31` | „muss der Browser den Text puffern und selbst takten […] Regel für den Fall, dass der Puffer leerläuft" | Client hält 2. Textversion |
| 7 | B Typewriter | `tech/ABGLEICH.md:32` | „setzt voraus, dass ganze Wörter vorliegen, bevor sie erscheinen" | Wortgrenze als Anzeigeeinheit |
| 8 | B Typewriter | `tech/ABGLEICH.md:40` | „Streaming liefert den Zeitpunkt des ersten Textes, das Ende der Antwort ist ebenfalls ein eigenes Ereignis" | Strom hat bereits benannte Ereignisse |
| 9 | C Slider | `sketches/2026-11-12-agentfaehig.md:84` | „drei Slider) — „clear word", „real time effects"" | Echtzeiteffekt gefordert |
| 10 | C Slider | `tech/INTENT.md:23` | „Zustand Agent ↔ Browser in Echtzeit synchron (WebSocket, State-Sync)" | beidseitig, nicht nur Push |
| 11 | C Slider | `tech/ABGLEICH.md:42` | „Jeder Reglerwert ist ein Feld im Agent-Zustand" | **Identität A = C** |
| 12 | 4. Stelle: Status | `tech/ABGLEICH.md:41` | „Der Sprach-Client meldet die Zustände „denkt" und „spricht"; für reinen Text müsste das Frontend Pausen selbst erkennen" | zwei Produzenten für `status` |
| 13 | 4. Stelle: Status | `tech/INTENT.md:24` | „Welche Ereignisse liefert der Agent dafür (Zuhören, Denken, Sprechen)?" | Status als Ereignisfrage |
| 14 | 5. Stelle: Verlauf | `tech/ABGLEICH.md:29` | „Der Verlauf muss gespeichert sein" | 3. Speicherort desselben Textes |
| 15 | Persistenz | `docs/DESIGN-DECISIONS.md:15-16` | „Ältere Antworten treten zurück" / „Neue Antwort steht im Fokus" | Wiederherstellung nach Reconnect nötig |
| 16 | Plattform-Fähigkeit | `tech/research/cloudflare-bausteine.md:243` | „AI Chat mit Message-Persistenz und resumable Streaming" | es gibt bereits „resumable" — aber nur laut README |
| 17 | Grenze des Belegs | `research/SCOUT-SYNTHESIS.md:26-29` | „`toUIMessageStreamResponse()`. Damit ist Text-Streaming eine vorhandene Plattformfähigkeit. Es beweist weder die Latenz […] noch eine funktionierende TTS-Pipeline." | Streaming belegt, Ordnungssemantik nicht |
| 18 | Offene Frage | `docs/DESIGN-DECISIONS.md:38` | „Bedeutung und Belegung der bis zu drei sichtbaren Slider" | Slider unbelegt |
| 19 | Graph | `graphify-out/graph.json` | `Zustands-Synchronisation` Grad 0, Community 26; `Typewriter Feature` Grad 0, Community 28 | beide isoliert |
| 20 | Graph-Hyperedge | `graphify-out/GRAPH_REPORT.md:75` | „**Typewriter-Voice Sync Risk** — typewriter, voice_pipeline, tech_abgleich [AMBIGUOUS 0.65]" | Risiko schon als Kante notiert |

---

## Konflikte

**1. ABGLEICH.md benennt das Risiko — aber nur das Voice-Risiko, nicht das Zustands-Risiko.**

`tech/ABGLEICH.md:46-54`:

> „Die Sprach-Pipeline liest satzweise vor, sobald ein Satz fertig ist. Der Typewriter soll dagegen nach Wortlänge pulsieren. Ohne Abstimmung laufen Text und Stimme auseinander: Die Stimme ist mal voraus, mal hinterher. […] Technisch gibt es drei Wege: Text führt und Stimme folgt, Stimme führt und Text folgt, oder beide laufen unabhängig. Ob die Pipeline Zeitmarken je Wort liefert, steht in keiner geprüften Quelle."

Das ist präzise — aber es ist die **Synchronsiation zweier Ausgabekanäle**, nicht die **Konsistenz eines Zustands**. Der Text nennt drei Wege und lässt alle drei offen. Genau das ist der Fehler: die drei Wege sind keine Architekturentscheidung, sondern drei Projektionen desselben Stroms. Wenn der Strom Zeitmarken trägt, ist „wer führt" eine Render-Einstellung; wenn nicht, ist es eine Architektur. Die Stelle fragt nach der Architektur, bevor die Frage nach den Zeitmarken beantwortet ist.

**2. Die anderen Stellen ignorieren es.**

- `tech/CLOUDFLARE_MACHBARKEIT.md:60` verspricht „Ergebnis per Zustands-Sync nachreichen" — ohne ein Wort darüber, was passiert, wenn zu diesem Zeitpunkt gerade Text getippt wird. Bei einem flachen Zustandsobjekt überschreibt das späte Ergebnis den laufenden Text.
- `tech/ABGLEICH.md:26` entschärft die Latenzfrage mit genau dieser Bewegung: „späte Ergebnisse können still über die Zustands-Synchronisation erscheinen." Das ist als **Vereinfachung** verbucht („passt, vereinfacht"), erzeugt aber den Konflikt aus 1.
- `tech/CLOUDFLARE_MACHBARKEIT.md:61` behandelt T5 als gelöst („**machbar**"), weil die Sync existiert. Die Frage, wer bei gleichzeitiger Änderung von Mensch und Agent gewinnt, steht in keiner Zeile.

**3. Echter Widerspruch in der Anzeige-Semantik.**

`tech/ABGLEICH.md:31` will den Text **verzögert** zeigen (puffern, takten). `docs/DESIGN-DECISIONS.md:16` will die neue Antwort **sofort im Fokus**. Das ist kein Widerspruch, solange „Fokus" und „Text fertig getippt" getrennte Ereignisse sind — genau das ist die Regel, die fehlt. Ohne sie baut man entweder einen Typewriter, der den Fokus verzögert, oder einen Fokus, der in den Puffer springt.

**4. Kein Widerspruch, aber eine Lücke:** `docs/DESIGN-DECISIONS.md:38` lässt die Slider-Belegung offen; `tech/ABGLEICH.md:42` sagt „technisch frei". „Frei" heißt hier: nicht entschieden, nicht: nicht relevant. Sobald ein Slider-Wert im selben Objekt liegt wie der Text (Beleg 11), ist die Belegung eine Zustandsfrage, nicht nur eine Designfrage.

**Fazit Konflikte:** Das Risiko ist an **einer** Stelle (ABGLEICH.md:46) korrekt benannt und an **drei** Stellen (CLOUDFLARE_MACHBARKEIT.md:49/60/61, ABGLEICH.md:26/42) stillschweigend übergangen. Der Graph hat es als `AMBIGUOUS 0.65` notiert und damit richtig geraten, aber nicht aufgelöst.

---

## Kosten des Verpassens

Drei Szenarien, jeweils aus den Belegen oben abgeleitet, mit Aufwandsschätzung für den Umbau **nachdem** der erste Ablauf steht.

**S1 — Typewriter auf den Roh-Stream gebaut, Slider-Zustand daneben.**
Umsetzung: Browser hängt direkt an `toUIMessageStreamResponse()` (Beleg 17), Ticker pro Wort; Slider schickt `setState` (Beleg 5). Folge: zwei Kanäle mit zwei Lebensdauern. Bei Reconnect überlebt der Snapshot (Slider bleiben), der Stream nicht — die UI zeigt alten Reglerzustand und halben Text. Zusätzlich: der Puffer aus ABGLEICH.md:31 ist eine zweite Textversion ohne `seq`, also nicht wiederherstellbar.
Umbau: Ereignisstrom + Projektion + Replay in der UI, Nachziehen von Typewriter, Slidern und Verlauf. **3–5 Tage**, plus Regression an drei Stellen.

**S2 — Spätes Sub-Agent-Ergebnis landet im laufenden Text.**
ABGLEICH.md:26 sieht es ausdrücklich vor („still über die Zustands-Synchronisation erscheinen"), CLOUDFLARE_MACHBARKEIT.md:60 nennt es als Feature. Bei einem flachen Zustandsobjekt belegt das Ergebnis dasselbe Feld wie der laufende Text → Sprung oder Dublette mitten im Tippen. Symptom ist intermittierend (nur wenn langsam) und deshalb teuer zu diagnostizieren.
Ohne Vertrag: pro neuem Feld eine eigene Schutzregel (N Felder = N Regeln). Mit Vertrag: 0 Zusatzregeln, weil `kind` und `seq` es tragen.
Umbau: **2–4 Tage** plus wiederkehrende Feld-für-Feld-Bugs.

**S3 — „Wer führt: Text oder Stimme?" wird als Architektur entschieden.**
ABGLEICH.md:52-53 lässt drei Wege offen. Wird einer davon als Architektur gewählt, bevor klar ist, ob die Pipeline Wort-Zeitmarken liefert („steht in keiner geprüften Quelle", :54), muss die Wahl bei der Messung möglicherweise revidiert werden — und sie berührt dann Transport, Renderer und Typewriter gleichzeitig.
Mit Strom + Zeitmarkenfeld ist „wer führt" ein Render-Flag: **1–2 Tage** statt **~1 Woche** Umbau.

**S4 (klein, aber sichtbar) — Verlauf und Scroll-Fokus.**
ABGLEICH.md:29 fordert Persistenz, DESIGN-DECISIONS.md:16 fordert Fokus auf die neue Antwort. Ohne `seq` muss beim Reconnect rekonstruiert werden, welche Antwort „neu" war. Mit `seq` ist es ein Vergleich. **~1 Tag** gegen **~1 Stunde**.

Summe des Verpassens: grob **6–10 Tage** verteilt über drei Bauabschnitte — und der teuerste Teil ist nicht der Umbau, sondern dass die drei Stellen unabhängig voneinander repariert werden.

---

## Verankerung

**Ziel: `docs/STATE_CONTRACT.md` (neu, Kandidat), verlinkt aus `docs/PROJECT.md` und als Antwort auf `tech/ABGLEICH.md:66-67`.**

Begründung in 5 Sätzen:

1. `docs/PROJECT.md:28-34` listet fünf Fragen, die „vor dem ersten Build zu entscheiden" sind; Frage 5 („Wie werden Reaktionszeit, Nutzerkontrolle und Fehlerverhalten geprüft?") ist ohne Zustandsvertrag nicht prüfbar, weil „Fehlerverhalten" bei einem Stream heißt: was passiert bei Lücke, Duplikat, Reconnect.
2. `tech/ABGLEICH.md:66-67` stellt zwei Grillings-Fragen („Typewriter und Stimme: Wer führt?", „Was soll der Typewriter tun, wenn das Modell stockt"). Beide sind **Projektionsfragen** und kollabieren zu einer Entscheidung, sobald der Strom eine `seq` und ein Zeitmarkenfeld hat — das ist der eigentliche Synergiegewinn: zwei offene Fragen werden zu einer.
3. `tech/CLOUDFLARE_MACHBARKEIT.md:46` behauptet bereits einen gemeinsamen Kanal für „Text, Agent-Zustand, Signale für die Animation". Der Vertrag macht diese Behauptung prüfbar, statt sie als „machbar" abzuhaken.
4. `tech/INTENT.md:23-24` fragt für T5 und T6 nach Zustand bzw. Ereignissen — beides sind dieselbe Frage in zwei Nummern. Ein Vertrag beantwortet T5 und T6 zusammen.
5. Der Vertrag ist **keine** Architekturentscheidung: er legt weder Cloudflare, noch WebSocket, noch React fest, sondern nur Ordnungssemantik. Er kann deshalb vor der Owner-Entscheidung stehen und sie vorbereiten, ohne sie zu ersetzen.

Nicht in Frage kommt als Verankerung: `docs/DESIGN-DECISIONS.md` (Owner-Quelle, direkte Antworten — ein Agent soll dort nichts einfügen) und `tech/ABGLEICH.md` selbst (Abgleich-Dokument, kein Vertrag; würde die offene Frage nur umformulieren).

---

## Urteil

**ECHTE SYNERGIE — aber nur zwischen Stelle A und C; Typewriter hängt über eine Naht daran, nicht über die Problemstellung.**

Begründung, ohne Aufblasen:

- **A = C ist Duplikat, keine Synergie.** Beleg 11 (`tech/ABGLEICH.md:42`) sagt wörtlich, der Reglerwert sei „ein Feld im Agent-Zustand" — also derselbe Mechanismus wie `tech/CLOUDFLARE_MACHBARKEIT.md:61`. Zwei Dokumente, ein Knoten, im Graphen zweimal angelegt und beide isoliert.
- **B ist themenverwandt, nicht identisch.** Typewriter fragt „wann zeigen", Zustands-Sync fragt „was gilt". Der gemeinsame Nenner entsteht erst durch den Renderer, der beide bedient — und genau dort entsteht der Schaden (S1, S2).
- **Echte Synergie entsteht durch den Vertrag, nicht durch die Stellen.** Ein Ereignisstrom mit `seq` löst A (Reconnect), B (Puffer/Grenzfall) und C (gleichzeitige Änderung) mit **einer** Regel und macht zwei der vier offenen Grilling-Fragen (`tech/ABGLEICH.md:66-67`) zu Render-Einstellungen. Das ist der Grund, den Kandidaten zu behalten.
- **Die Beleglage ist ausreichend, nicht dünn.** Anders als ein Halbsatz-Fund gibt es fünf Stellen mit konkretem Mechanismus-Namen (`setState`, `useAgent`, `onStateUpdate`, `toUIMessageStreamResponse`) und eine bereits notierte Risiko-Kante. Der Typewriter-Teil ist mit einer Zeile belegt (`tech/ABGLEICH.md:31`) — das ist die dünnste Stelle, reicht aber, weil ABGLEICH.md den Grenzfall selbst benennt.

Grenze des Urteils: Ob die Cloudflare-Pipeline tatsächlich Wort-Zeitmarken liefert, ist unbelegt (`tech/ABGLEICH.md:54`). Der Vertrag muss deshalb **ohne** Zeitmarken funktionieren und sie als optionales Feld führen. Das ist eine Vertrags-, keine Architekturfrage.

---

## Ein nächster Schritt

**Eine Seite, kein Code, keine Architektur: das Ereignis-Schema mit drei Feldern aufschreiben und gegen die fünf Produzenten prüfen.**

```
{ "seq": 41, "kind": "token", "payload": "Bewe" }
```

Prüfung in einer Tabelle, ~1 Stunde:

| `kind` | Produzent | bestätigt durch | Beleg |
|---|---|---|---|
| `token` | Front-Agent | `seq` | `tech/ABGLEICH.md:31`, `research/SCOUT-SYNTHESIS.md:26` |
| `final` | Front-Agent | `seq` | `tech/ABGLEICH.md:40` |
| `status` | Voice-Client **und** Frontend | **offen — zwei Produzenten** | `tech/ABGLEICH.md:41` |
| `state` | Agent (Regler, Farbe, Form) | `seq` | `tech/CLOUDFLARE_MACHBARKEIT.md:61`, `ABGLEICH.md:42` |
| `late_result` | Sub-Agent | `seq` | `tech/CLOUDFLARE_MACHBARKEIT.md:60`, `ABGLEICH.md:26` |

**Abbruchkriterium der Prüfung:** Wenn eine Zeile zwei Produzenten hat (hier: `status`), ist der Vertrag noch nicht entschieden — dann gehört genau diese Zeile in die nächste Grilling-Runde, nicht in einen Bau. Wenn alle Zeilen genau einen Produzenten haben, ist der Vertrag entscheidbar und die zwei Fragen aus `tech/ABGLEICH.md:66-67` werden zu Render-Flags.

Ergebnis der Stunde ist ein Vorschlag an den Owner (Freigabe nötig, keine Dateiänderung außerhalb dieses Berichts).
