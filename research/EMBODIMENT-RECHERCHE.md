# Embodiment-Recherche — wie lebendige, agentische Interfaces tatsächlich gebaut werden

Stand: 19.11.2026 · Untersuchung im Projekt Agentfähig · Keine Neuplanung

## 0 · Auftrag, Grenze, Prüfmethode

**Frage.** Wie realisieren existierende Produkte sechs Dinge, die Agentfähig
braucht: animierte Präsenz, Gespräch ohne Chatfenster, generative/adaptive
Oberfläche, Streaming-Typografie, Voice-first-Interaktion, stille
Hintergrundarbeit?

**Grenze.** Die Planung ist abgeschlossen. Dieses Dokument erfindet sie nicht
neu und schlägt keine Architektur vor. Es prüft, welche Muster es gibt, was
davon belegt ist, und was die bereits getroffenen Entscheidungen stützt oder
ihnen widerspricht. Maßgeblich bleiben
[`DESIGN-DECISIONS.md`](../docs/DESIGN-DECISIONS.md),
[ADR-0002](../docs/adr/ADR-0002-agent-als-interface.md),
[ADR-0004](../docs/adr/ADR-0004-regler-veraendert-oberflaeche-und-haltung.md)
und der [Projektvertrag](../docs/PROJECT_CONTRACT.md).

**Evidenzstufen.** Jede Referenz bekommt eine Stufe:

| Stufe | Bedeutung |
|---|---|
| **A** | Im ausgelieferten Produkt oder im offenen Quelltext belegt (Doku, API, Repo) |
| **B** | Demo, Research-Preview, Hackathon — funktioniert, aber nicht als Betrieb belegt |
| **C** | Anbieter-Claim oder Blog-Aussage ohne nachvollziehbare Messung |

Für die Weitergabe: **A = VERIFIED**, **B = VERIFIED für die Funktion**, die
Wirkung bleibt **HYPOTHESIS**, **C = unbelegter Claim** (nicht als Tatsache
übernehmen). `[P]` markiert Aussagen, die aus einer parallelen Session im
Arbeitsbaum stammen und hier nicht neu belegt wurden.

**Abgrenzung zu den parallelen Dokumenten.** Nutzerführung und UX-Prior-Art
stehen in
[`UX-INFORMATIONSARCHITEKTUR.md`](../docs/UX-INFORMATIONSARCHITEKTUR.md), die
Bauen/Kaufen-Entscheidung je Kandidat in
[`PRIOR_ART_REPORT.md`](PRIOR_ART_REPORT.md). Dieses Dokument liefert die
*technischen Muster* — Zustand, Timing, Kanäle — und überschneidet sich mit
beiden nur dort, wo es sie ergänzt oder korrigiert.

**Was dieser Lauf nicht getan hat.** Nichts geklont, nichts ausgeführt, keine
Latenz gemessen. `EyeFace.js` und die Cloudflare-Voice-Zustände sind
**repo-belegt** aus dem vorherigen Upstream-Lauf und wurden hier nicht erneut
geprüft. Alle anderen Aussagen tragen eine URL, die am 19.11.2026 abgerufen
wurde (Liste in § 10).

**Hinweis zum Auftragstext.** Die Anweisung endete nach „Beachte: — Die
Oberfläche reagiert,“. Die daraus folgende Richtung (reagieren statt bedienen)
ist als Prinzip 1 aufgenommen; falls dort weitere Bedingungen standen, sind sie
hier nicht berücksichtigt.

---

## 1 · Kurzfazit

1. **Für jeden der sechs Bereiche existiert mindestens ein belastbarer
   Upstream.** Nichts davon muss erfunden werden — aber fast nichts davon ist
   als *Kombination* erprobt. Genau die Kombination ist Agentfähig.
2. **Animierte Präsenz ist ein Zustandsproblem, kein Zeichenproblem.** Rive,
   dotLottie und `EyeFace.js` lösen alle dieselbe Aufgabe: benannte Zustände
   rein, Bewegung raus. Das ist die technisch einfachste Schicht des Projekts.
3. **„Kein Chatfenster" ist als Muster belegt, aber nicht als Web-Produkt.**
   Die nächsten Belege (Arc „Browse for Me", Docket, Capturia) sind App,
   kommerzielle Website oder Hackathon. Für „eine Antwort im Fokus, Älteres
   tritt zurück" gibt es **kein kopierbares Vorbild** — das bleibt ein
   gestaltetes Wagnis, kein übernommenes Muster.
4. **Streaming-Typografie hat eine harte, messbare Grenze: Lesbarkeit,
   Layout-Stabilität und Screenreader.** Kaum ein Teil der Vision geht bei
   falscher Umsetzung so nachweislich kaputt (WCAG, Live-Regions, CLS) — und
   kaum einer wirkt bei richtiger so unsichtbar gut.
5. **Voice-first ist 2026 technisch gelöst — aber englisch gelöst.** Flux'
   Turn-Erkennung war zum Start englisch („extending CSR beyond English"). Für
   den geparkten deutschen Pfad ist die Turn-Erkennung jedoch **nicht** offen
   (`nova-3` + `endpointingMs`, LiveKit-Detector mit Deutsch, `[P]`); die einzige
   harte Lücke ist **TTS**.
6. **Stille Hintergrundarbeit ist ein Durability-Problem, kein UI-Problem.**
   Calm Technology liefert die Gestaltungsregel, Cloudflare und GitHub liefern
   den Beleg, dass Arbeit einen Neustart überleben muss, damit „still" nicht
   „verschwunden" bedeutet.

**Die eine Lücke, die bleibt:** Kein gefundener Upstream verhandelt die eigene
Präsenz *mit* dem Besucher und ändert dabei Aussehen **und** Haltung. Das ist
weiterhin die Eigenbau-Stelle — jetzt aber mit belegten Bausteinen ringsum.

---

## 2 · Animated Presence

### 2.1 Rive — Zustandsmaschinen für Grafik

| | |
|---|---|
| Primärquellen | [State Machine](https://rive.app/docs/editor/state-machine/state-machine.md) · [Data Binding](https://rive.app/docs/editor/data-binding/overview.md) · [Reduced Motion](https://rive.app/docs/editor/accessibility/reduced-motion.md) · [Runtimes](https://rive.app/docs/getting-started/introduction.md) |
| Evidenz | **A** — Engine und Runtimes sind ausgeliefert (Web: JS/WASM, React, Flutter, C++ u. a.) |

**Was tatsächlich funktioniert.** Eine State Machine verbindet Timelines über
Transitions; **Layer laufen gleichzeitig** — das Dokument nennt ausdrücklich
„one layer can play a character's idle and walk cycle while another layer plays
its blinking". Getrieben wird sie von Data Binding (View-Model-Properties),
Listenern und Zeit.

**Wiederverwendbares Muster.** *Zustand rein, Bewegung raus.* Die Anwendung
setzt benannte Werte (`idle`, `thinking`, `intensity`), das Artwork entscheidet,
wie sie sich bewegen. Genau die Trennung, die Agentfähig braucht: Die Augen sind
eine Anzeige des Agentzustands, keine zweite Logik.

**Bewiesen / nur Demo.** Bewiesen ist die Engine. **Nicht** bewiesen ist, dass
eine bestimmte Augenanimation „soft and not scary" wirkt — das ist Design, keine
Technik. Ebenso unbewiesen in diesem Lauf: Performance, Lizenz des Editors,
Preis.

**Passt.** Als Zielbild für einen späteren Ausbau, wenn `EyeFace.js` zu flach
ist: Layer-Trennung (atmen / blinzeln / Status), reduzierte Bewegung als
eigenes Datenfeld.

**Verwässert.** Wenn Rive die Zustandslogik übernimmt (zweiter Wahrheitspfad)
oder wenn die Augen nur noch in einer Editor-Datei änderbar sind. Der Vertrag
verlangt, dass Samuel eine Zuordnung **selbst** ändern kann
([O2](../docs/PROJECT_CONTRACT.md)) — eine proprietäre Editor-Abhängigkeit
verletzt das.

### 2.2 dotLottie — dieselbe Idee, MIT-lizenziert

| | |
|---|---|
| Primärquelle | [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) |
| Evidenz | **A** — MIT, Rust/WASM-Kern, ausgelieferte SDKs für sechs Frameworks |

**Was tatsächlich funktioniert.** State Machines sind Teil des `.lottie`-Formats
(„no JS glue required"), es gibt typisierte Events (`stateMachineStateEntered`,
`stateMachineTransition`), **Runtime-Theming** (Farben, Skalare, Text ohne
Re-Export) und Rendering im Worker (`DotLottieWorker`, OffscreenCanvas).

**Muster.** Zwei Dinge, die Rive auch kann, hier aber billiger: (a) Zustand über
Events beobachtbar, (b) **Aussehen als Theme-Daten** — der Regler könnte die
Augenfarbe mitziehen, nicht nur die Seite.

**Bewiesen / nur Demo.** Der Player ist Produktcode mit MIT-Lizenz. Ob die
verwendete Animationsdatei gut ist, ist wieder Design.

**Passt.** Wenn die Augen als Lottie geliefert werden und der eine Regler auch
sie verändern soll.

**Verwässert.** Wenn daraus „das ganze UI ist ein Canvas" wird. Text,
Typografie, Selektion und Screenreader müssen im DOM bleiben; die Animation ist
ein Geschwister der Antwort, nie ihr Container.

### 2.3 `EyeFace.js` — das kleinste funktionierende Gesicht

| | |
|---|---|
| Primärquelle | [MCERQUA/OpenVoiceUI](https://github.com/MCERQUA/OpenVoiceUI) → `src/face/EyeFace.js` |
| Evidenz | **A** im Quelltext gelesen (Vorlauf-Lauf), **nicht ausgeführt** |

**Was tatsächlich funktioniert.** Zwei Augen mit stimmungsabhängigen
Lidanimationen (`happy`, `sad`, `angry`, `thinking`, `surprised`, `listening`),
Maus-verfolgende Pupillen, autonomes Blinzeln und Umsehen; Gesichter sind zur
Laufzeit austauschbar (`faceManager.register`). Reines Frontend-JS, kein
Build-Schritt, MIT.

**Muster.** *Präsenz entsteht aus Blick und Lidschlag, nicht aus einem
Gesicht.* Das ist der billigste soziale Reiz, den eine Website senden kann.

**Bewiesen / nur Demo.** Code ist lesbar und klein (~200 Zeilen). Es gibt keinen
Beleg, dass er unter Last, in Safari oder mit `prefers-reduced-motion` sauber
läuft — das ist ein Smoke-Check im Erstbau, keine Annahme.

**Passt.** Der Erstbau verlangt ihn ausdrücklich (F6). Die vorhandenen
Lidzustände decken die Voice-Zustände fast vollständig ab.

**Verwässert.** Wenn die Augen *schauspielern* — Freude, Trauer, Überraschung als
Mienenspiel. Das kippt von „Zustand anzeigen" zu „Charakter aufführen" und
nähert sich der Bevormundung, die die Vision ausschließt.

### 2.4 Sesame — Präsenz ohne Gesicht

| | |
|---|---|
| Primärquelle | [Crossing the uncanny valley of conversational voice](https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice) |
| Evidenz | **B** — Research Preview, die Autoren schreiben selbst „We're not there yet" |

**Was tatsächlich funktioniert.** Sesame definiert „voice presence" über vier
Komponenten: emotionale Intelligenz, Gesprächsdynamik (Timing, Pausen,
Unterbrechungen), Kontextbewusstsein, konsistente Persönlichkeit. Das CSM-Modell
ist einstufig, Die Modelle sollen unter Apache 2.0 erscheinen (Ankündigung im Beitrag).

**Muster.** *Präsenz ist Timing und Konsistenz, nicht Aussehen.* Der Satz „a
personal assistant who speaks only in a neutral tone … becomes exhausting" ist
die beste Kurzbegründung dafür, warum die Haltung (ADR-0004) nicht Dekoration
ist.

**Bewiesen / nur Demo.** Demo. Das Papier nennt die offene Grenze selbst: ein
Sprachmodell modelliert Prosodie, aber nicht die **Struktur** des Gesprächs
(Turn-Taking, Pacing) — dafür braucht es vollduplexe Modelle.

**Passt.** Als Begründung, warum die Augen nicht die ganze Präsenz tragen
müssen und warum der Antwortrhythmus Teil der Präsenz ist.

**Verwässert.** Wenn daraus ein „freundlicher Companion" wird. Agentfähig ist
eine Oberfläche, kein Begleiter.

---

## 3 · Gespräch ohne Chatfenster

### 3.1 Arc Search „Browse for Me" — Antwort als gebaute Seite

| | |
|---|---|
| Primärquellen | [arc.net/blog/arc-search](https://arc.net/blog/arc-search) · [TechCrunch, 28.01.2024](https://techcrunch.com/2024/01/28/arcs-new-iphone-browser-wants-to-be-your-search-companion) |
| Evidenz | **A** für das Verhalten (ausgelieferte App), **C** für die Nutzungszahl |

**Was tatsächlich funktioniert.** Statt einer Ergebnisliste liest der Dienst
mehrere Seiten und **baut eine Seite**, die es so vorher nicht gab: Abschnitte,
Medien, Quellen. TechCrunch beschreibt den Ablauf („reads at least six web
pages and builds a new page"). Eine Berichterstattung nennt 32 % der Suchen, die
darüber laufen — Anbieterangabe, nicht unabhängig geprüft.

**Muster.** *Die Form der Antwort folgt dem Intent, nicht dem Kanal.* Es gibt
keinen Verlauf, den man lesen müsste, um zu wissen, was gilt.

**Bewiesen / nur Demo.** Ausgeliefert, aber mobil und als Dokument. Die Seite
ist das **Ergebnis**, nicht der **Zustand** — sie lebt nach dem Aufbau nicht
weiter. Genau darin geht Agentfähig weiter.

**Passt.** Als Beleg, dass Menschen eine generierte Fläche akzeptieren, wenn sie
ihnen Arbeit abnimmt. Auch die Kritik daran ist lehrreich: Die Antwort ersetzt
die Quellen, und das erzeugt Gegenwind (Engadget). Für Agentfähig heißt das:
Der Agent darf die Seite sein, aber er darf nicht so tun, als hätte er die Welt
geschrieben.

**Verwässert.** Wenn jede Antwort die Seite **neu aufbaut**. Das erzeugt
Orientierungsverlust und Layout-Shift und lässt den Agenten wie einen Generator
wirken statt wie ein Gegenüber.

### 3.2 Docket „Frameless" — der Agent steht in der Seite

| | |
|---|---|
| Primärquelle | [docket.io/blog/designing-docket-frameless](https://www.docket.io/blog/designing-docket-frameless) |
| Evidenz | **C** — kommerzielles Produkt; Aussagen aus dem Blog (im Vorlauf-Lauf gelesen), Stack und Zahlen nicht offengelegt |

**Was tatsächlich funktioniert (laut Blog).** Der Avatar wird als
Transparent-Video in den Hero komponiert statt als Kasten darüber; der Besucher
redet von Anfang an mit der Seite. Ausdrücklich **verworfen** wurde ein
„ask-first hero", in dem der ganze Hero eine offene Frage ist.

**Muster.** *Der Agent gehört in die Fläche, nicht daneben.* Und die verworfene
Variante ist ein Warnschild: Eine Seite, die als Erstes eine Frage stellt,
**verlangt**, bevor sie etwas gibt.

**Bewiesen / nur Demo.** Nur Blog-Aussage. Kein Stack, keine Latenz, keine
Zahlen.

**Passt.** Die Komposition (Agent in der Fläche) und die Anti-Erkenntnis
(keine Frage als Einstieg).

**Verwässert.** Avatar-Video. Es ist teuer, uncanny-nah und macht die Augen
überflüssig — zwei Präsenzsysteme, die gegeneinander arbeiten.

### 3.3 Capturia — der Agent antwortet nur in Zustand

| | |
|---|---|
| Primärquelle | [AndresCarreonDiaz/capturia](https://github.com/AndresCarreonDiaz/capturia) |
| Evidenz | **B** — Hackathon-Projekt, MIT |

**Was tatsächlich funktioniert.** „The agent never replies in prose. Every
utterance is either a tool call that changes the on-screen state, or silence."
Voice oder Text rein, Overlays/Panels/Sparklines raus, unter einer Sekunde
(Selbstangabe).

**Muster.** Die radikalste Form von „Zustand statt Verlauf": Es gibt **keine**
Nachricht, die man lesen müsste — nur eine Fläche, die sich ändert.

**Bewiesen / nur Demo.** Hackathon-Rohling. Als Muster stark, als Code nicht.

**Passt.** Als Beweis, dass „der Agent verändert die Oberfläche" in einem Jahr
von einer Person gebaut werden kann.

**Verwässert.** Ohne Prosa. Agentfähig hat entschieden, dass die Antwort auch
als Text erscheint. Ein Agent, der nur Zustand ändert, erklärt nichts — und
Erklären ist Teil der Haltung.

### 3.4 Der Gegenpol: der Chat-Verlauf

ChatGPT, Claude und die meisten Agent-Produkte setzen den Verlauf ins Zentrum.
Das ist kein Fehler — es ist nur die austauschbare Form, gegen die
[ADR-0002](../docs/adr/ADR-0002-agent-als-interface.md) argumentiert. Für diese
Recherche zählt: **Es gibt kein gefundenes Web-Produkt, das den Verlauf
konsequent zur Nebensache macht und trotzdem auffindbar hält.** Der nächste
Beleg ist Capturia, und der ist ein Hackathon.

**Folge.** „Ein Fokus, Älteres tritt zurück" bleibt ein gestaltetes Wagnis. Es
ist nicht widerlegt — nur nicht kopierbar. Der Fremdtest (P1/P3) ist deshalb
die einzige ehrliche Prüfung.

---

## 4 · Generative und adaptive Oberfläche

### 4.1 A2UI — Daten statt Code, Katalog als Grenze

| | |
|---|---|
| Primärquelle | [a2ui-project/a2ui](https://github.com/a2ui-project/a2ui) · [a2ui.org](https://a2ui.org) |
| Evidenz | **A** — Apache-2.0, Renderer für React, Angular, Lit, Flutter, SwiftUI, Jetpack Compose |

**Was tatsächlich funktioniert.** Der Agent streamt **Layout-Daten**, die App
rendert sie mit nativen Widgets. Ein Schema validiert; der Katalog definiert,
was der Agent überhaupt ausdrücken darf; „Security first" heißt ausdrücklich:
kein ausführbarer Code, jede Fähigkeit explizit freigegeben.

**Muster.** *Die Grenze ist der Katalog, nicht die Prompt-Formulierung.* Der
Agent darf nur aus dem schöpfen, was der App-Entwickler erlaubt hat.

**Bewiesen / nur Demo.** Protokoll v1.0 mit funktionierenden Renderern und
Composer; die Roadmap sammelt bereits Anforderungen für v1.1. Kein
Langzeit-Produktionsbeleg.

**Passt.** Als Guardrail, sobald der Agent mehr als Farbe und Haltung ändern
soll. Der Katalog-Gedanke passt außerdem zur Skizze „max 3 Regler".

**Verwässert.** Wenn die Präsenz zu einer Katalog-Auswahl wird. Genau das hat
das Zweitgutachten festgehalten: A2UI und `json-render` ändern **Inhalte** in
einem festen Katalog, nicht das **Aussehen und Verhalten** der Oberfläche. Wer
das verwechselt, baut einen Formular-Generator und nennt ihn Agent.

### 4.2 Vercel AI SDK — generative UI als Werkzeug-Ergebnis

| | |
|---|---|
| Primärquelle | [ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) |
| Evidenz | **A** — dokumentierte, verbreitete Implementierung |

**Was tatsächlich funktioniert.** Ein Tool liefert Daten, ein React-Baustein
rendert sie. Die Tool-Teile haben **explizite Zustände**:
`input-available`, `output-available`, `output-error`.

**Muster.** *Ein Ergebnis hat einen Lebenszyklus, nicht nur einen Wert.* Das ist
direkt auf stille Hintergrundarbeit übertragbar: „läuft / fertig / Fehler" ist
ein Zustand der Fläche, keine Nachricht.

**Bewiesen / nur Demo.** Ausgeliefert und breit genutzt.

**Verwässert.** Die Form ist chat-zentriert (`messages`, `useChat`). Wer sie
kopiert, bekommt eine Chat-App mit hübschen Karten — also genau das, was
Agentfähig nicht sein will.

### 4.3 `json-render` — Katalog mit Slider

Nur repo-belegt aus dem Vorlauf
([`UPSTREAM-SEARCH-cloudflare.md`](../tech/UPSTREAM-SEARCH-cloudflare.md)):
Katalog aus 41 Komponenten und 6 Aktionen, Zwei-Wege-Bindung über `$bindState`,
progressive Darstellung während des Streams. Der `Slider` im Katalog ist der
naheliegendste Baustein für die Regler-Idee.

**Grenze.** Ein Slider im Katalog ist ein **Bedienelement**. Die Skizze will
einen Regler, dessen **Belegung im Gespräch entsteht** — also eine vom Agenten
gesetzte Achse. Das ist mehr als eine Komponente; es ist eine Zustands- und
Haltungsfrage.

### 4.4 Der eigentliche Fund: Aussehen als Daten

Rive (View Models), dotLottie (Themes, Slots) und A2UI (Schema + Katalog) zeigen
unabhängig voneinander dasselbe: **Erscheinung lässt sich als kleiner,
typisierter Datensatz beschreiben** — Farbe, Zahl, Enum, Text — und muss nicht
als Struktur generiert werden.

Das ist die technisch saubere Fassung von `colour · form · output style`:
kein HTML vom Modell, sondern wenige benannte Felder, die CSS-Variablen **und**
ein Prompt-Fragment speisen. Damit ist
[ADR-0004](../docs/adr/ADR-0004-regler-veraendert-oberflaeche-und-haltung.md)
nicht nur design-, sondern auch engineering-seitig die naheliegende Lösung.

---

## 5 · Streaming-Typografie

### 5.1 Die drei Zeitgrenzen

| | |
|---|---|
| Primärquelle | [NN/g: Response Times — The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) |
| Evidenz | **A** — etablierte UX-Forschung, 1993, 2014 aktualisiert |

- **0,1 s** — das Gefühl direkter Manipulation. Gilt für den Regler: ziehen →
  Fläche ändert sich sofort. Nicht „unter einer Sekunde".
- **1 s** — der Gedankenfluss bleibt intakt. Gilt für den ersten Text-Token.
- **10 s** — Aufmerksamkeit; darüber braucht es Fortschritt und Abbruch.

**Folge für Agentfähig.** Die Vision nennt „unter 1 s inklusive TTS" als eine
Zahl. Die Recherche trennt sie in zwei verschiedene Versprechen: **0,1 s für
jede direkte Berührung**, **1 s für den Beginn der Antwort**. Der Regler ist
damit der strengste Teil, nicht die Stimme.

### 5.2 Lesen ist schneller als Tippen

| | |
|---|---|
| Primärquelle | [NN/g: How Little Do Users Read?](https://www.nngroup.com/articles/how-little-do-users-read/) |
| Evidenz | **A** — naturalistische Studie, 45.237 Seitenaufrufe |

Kernzahlen: Nutzer lesen im Schnitt etwa **20 %** des Texts (Maximum 28 %);
pro 100 zusätzliche Wörter bleiben **4,4 Sekunden** mehr auf der Seite; bei
250 Wörtern pro Minute entspricht das 18 gelesenen Wörtern pro 100 geschriebenen.

**Folge.** Ein Typewriter, der langsamer einblendet, als der Mensch lesen kann,
ist kein Gefühl, sondern eine **Bremse**. Der Rhythmus darf pulsieren — aber der
Puffer muss vorauslaufen. Sonst entsteht die Situation, die der Projektvertrag
ausschließt: „Puffer läuft nie leer sichtbar" (T2).

**Zuständigkeit.** *Wie* der Strom geschnitten und getaktet wird, regelt
[`ADR-0006`](../docs/adr/ADR-0006-zeitvertrag.md) (vorgeschlagen): eine Uhr, ein
Segmentierer, der Typewriter als Play-out-Puffer im Budget. Dieses Dokument
liefert dazu nur die **Wahrnehmungsgrenze**, keine Mechanik und keine Raten.

**Ehrliche Grenze.** Es gibt weiterhin **keine** Studie, die den
wortlängenabhängigen Typewriter selbst prüft; die frühere Scout-Synthese hat das
bereits festgehalten. Die Zahlen hier begründen nur die Obergrenze des Tempos,
nicht die Kurve.

### 5.3 Layout-Shift: die Fläche muss stehen

| | |
|---|---|
| Primärquelle | [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls) |
| Evidenz | **A** — Teil der Core Web Vitals, mit Messverfahren |

Unerwartete Verschiebungen zerstören die Leseposition; gute Werte liegen bei
CLS ≤ 0,1. Empfohlen: Platz **vorher** reservieren, mit `transform` animieren
statt mit `height`/`top`, `prefers-reduced-motion` respektieren.

**Folge.** Die Antwortfläche braucht eine reservierte Höhe, bevor der erste
Token kommt. Sonst schiebt jede Zeile die Seite — und der Fokuswechsel, den die
Designentscheidung verlangt, wird zum Ruck.

### 5.4 Screenreader: zwei Kanäle, ein Ereignis

| | |
|---|---|
| Primärquellen | [azukiazusa: How Should a Streaming Chat UI Announce Its Response to Screen Readers?](https://azukiazusa.dev/en/blog/accessible-streaming-chat-ui) · [generative-a11y: Screen readers and streaming AI](https://generativea11y.com/docs/screen-readers-and-streaming-ai) · [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) |
| Evidenz | **A** für WCAG, **B** für die beiden Praxisberichte |

**Was tatsächlich kaputtgeht.** Ein `aria-live`-Bereich um den wachsenden Text
lässt Screenreader jede Token-Änderung ansagen — fragmentiert, doppelt oder
stumm, je nach Browser und Reader. Die Artikel beschreiben dieselbe Lösung:
`role="log"` mit `aria-live="off"` für den sichtbaren Verlauf, dazu eine
**separate, immer vorhandene Statusregion**, die nur Lebenszyklus meldet
(„Antwort beginnt", „Antwort fertig", „abgebrochen", „Fehler").

**WCAG — zwei Kriterien, nicht eines.** **2.2.2 (Level A)** verlangt für
automatisch bewegte oder aktualisierte Inhalte über fünf Sekunden eine Pause-,
Stop- oder Versteck-Möglichkeit; das betrifft die **dauerhaft blinzelnden
Augen** ohne jede Interaktion. **2.3.3 (AAA)** betrifft Bewegung, die *durch
Interaktion* ausgelöst wird; dort ist `prefers-reduced-motion` die anerkannte
Technik (C39/SCR40). Reduced Motion ersetzt 2.2.2 **nicht** — dieselbe
Korrektur steht in [`UX-INFORMATIONSARCHITEKTUR.md`](../docs/UX-INFORMATIONSARCHITEKTUR.md)
§ 2.6 und [`PRIOR_ART_REPORT.md`](PRIOR_ART_REPORT.md), Abschnitt E3 `[P]`.

**Folge.** Der Typewriter ist ein **visuelles** Instrument. Der zugängliche Kanal
ist ein anderer. Wer beides in dasselbe DOM-Element legt, baut nachweislich
eine kaputte Oberfläche — und zwar unabhängig davon, wie schön sie aussieht.

**Passt.** Rive zeigt genau die Umsetzung für den Animations-Teil: die
Motion-Präferenz als Datenfeld in die Datei geben und dort entscheiden, welche
Bewegung wesentlich ist. `EyeFace.js` muss diesen Kanal erst bekommen.

---

## 6 · Voice-first

### 6.1 LiveKit — Turn-Taking als eigene Disziplin

| | |
|---|---|
| Primärquelle | [LiveKit: Turns overview](https://docs.livekit.io/agents/build/turns/) |
| Evidenz | **A** — dokumentiertes, ausgeliefertes Agent-Framework |

**Was tatsächlich funktioniert.** Fünf Erkennungsmodi (Turn-Detector-Modell,
Realtime-Modell, nur VAD, STT-Endpointing, manuell), dazu Endpointing-Delay,
adaptive Unterbrechungserkennung und **False-Interruption-Recovery**: Wenn die
Unterbrechung ein Huster war, spricht der Agent nach einer Wartezeit weiter.
Bei einer echten Unterbrechung wird der Gesprächsverlauf auf **den Teil
gekürzt, den der Nutzer gehört hat**.

**Muster.** *Zuhören ist ein Versprechen, das man brechen kann.* Drei Details
sind direkt übertragbar:

1. **Barge-in ist Pflicht** — der Mensch darf jederzeit dazwischenreden.
2. **Backchannel ist keine Unterbrechung** — „mhm" darf den Agenten nicht stoppen.
3. **Nur Gehörtes zählt** — der Verlauf darf nicht behaupten, der Agent habe
   etwas gesagt, das unterbrochen wurde.

**Bewiesen / nur Demo.** Framework-Code, produktionsnah, aber die Qualität
hängt an Konfiguration und Sprache: Das Turn-Detector-Modell deckt nicht alle
Sprachen ab; für andere empfiehlt die Doku VAD-only.

**Passt.** Push-to-Talk ist dort ein **eigener, unterstützter Modus** („manual"),
kein Notbehelf. Die Entscheidung „Mikrofon nach Klick" ist damit nicht nur
Design, sondern technisch der ruhigste Pfad.

**Verwässert.** Ein Agent, der „zuhört", obwohl das Mikrofon aus ist. Der
Listening-State muss an den tatsächlichen Audiostrom gebunden sein, nicht an
eine Animation.

### 6.2 Deepgram Flux — Turn-Ende im Modell

| | |
|---|---|
| Primärquelle | [Introducing Flux STT](https://deepgram.com/learn/introducing-flux-conversational-speech-recognition) |
| Evidenz | **A** für die API, **C** für die Leistungszahlen |

**Was tatsächlich funktioniert.** Ein Modell erkennt das Turn-Ende aus Semantik
*und* Akustik statt aus Stille. Es liefert `StartOfTurn` / `EndOfTurn`, optional
`EagerEndOfTurn` (mittlere Konfidenz, Antwort spekulativ vorbereiten) und
`TurnResumed` (weitersprechen, Vorbereitung verwerfen). Parameter:
`eot_threshold` (Default 0,7), `eot_silence_threshold_ms` (Default 5000).

**Muster.** *Warten ist eine Entscheidung mit Kosten, nicht eine Konstante.*
Eager-Turn ist die sauberste bekannte Form von „schnell antworten, ohne den
Menschen abzuschneiden": vorbereiten, dann bestätigen oder verwerfen.

**Bewiesen / nur Demo.** Die Anbieterzahlen (200–600 ms weniger Latenz, ~30 %
weniger Fehlunterbrechungen, p90 1 s / p95 1,5 s) sind **Claims**, keine
unabhängige Messung. Belastbar ist die Architektur und die Ereignisliste.

**Passt.** Als Referenz für den Front-Agenten und als Beleg, dass „unter einer
Sekunde" nicht durch einen schnelleren Satz entsteht, sondern durch ein
besseres Turn-Ende.

**Verwässert.** Wenn Latenz zum Produktversprechen wird. Der Projektvertrag
sagt ausdrücklich: Latenz ist Mittel, nicht Nutzen.

**Wichtig für die geparkte deutsche Stimme.** Flux war zum Start **englisch**;
„extending CSR beyond English" steht unter „What's next". Das ist aber **kein
zweiter offener Punkt**: Der parallele Bauen/Kaufen-Bericht belegt den deutschen
Pfad mit `nova-3` + `endpointingMs` und nennt einen offenen Turn-Detector mit
Deutsch unter seinen 14 Sprachen (`[P]`,
[`PRIOR_ART_REPORT.md`](PRIOR_ART_REPORT.md)). Die einzige harte Lücke bleibt
**TTS** ([`docs/UNSOLVED-TECHNIK.md`](../docs/UNSOLVED-TECHNIK.md) U5). Für die Kostenrecherche heißt
das: ein Anbieter-Hop, nicht zwei.

### 6.3 Cloudflare Voice Agent — der Zustandsvertrag

Nur repo-belegt ([`CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`](../docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md),
[`konkurrenz.md`](../tech/research/konkurrenz.md)): Der Client liefert `status`
(`idle | listening | thinking | speaking`), `audioLevel` (0–1),
`interimTranscript` und `turnMetrics` inklusive `first_audio_ms`.

**Muster.** Das ist bereits der vollständige Vertrag für die Augen. Es braucht
**keine** zusätzliche Animation-API: Die Augen abonnieren vier Strings und einen
Pegel.

**Bewiesen / nur Demo.** SDK-seitig belegt (Vorlauf-Mission), Latenz nicht
gemessen (Messlauf gescheitert, siehe
[`MESSPROTOKOLL`](../tech/MESSPROTOKOLL-2026-11-19.md)).

### 6.4 Sesame CSM — warum Prosodie nicht reicht

Siehe § 2.4. Der relevante Zusatz hier: Das Modell erzeugt gute Prosodie, aber
die **Gesprächsstruktur** bleibt Aufgabe der Pipeline. Für Agentfähig heißt das:
Ein schöner Stimmenklang ersetzt kein Turn-Taking.

---

## 7 · Ambient Agents

### 7.1 Calm Technology — die Gestaltungsregel

| | |
|---|---|
| Primärquelle | [calmtech.com](https://calmtech.com/) — Amber Case, acht Prinzipien |
| Evidenz | **A** für die Prinzipiensammlung (Designkanon), nicht empirisch geprüft |

Direkt einschlägig:

- „Technology should require the smallest possible amount of attention."
- „Technology can communicate, but doesn't need to speak."
- „A calm technology will move easily from the periphery of our attention, to
  the center, and back."
- „Technology should work even when it fails."

**Muster.** *Das Ergebnis ist da, wenn man hinsieht — nicht, wenn es klingelt.*
Die Teekanne ist das beste Bild: Sie schweigt, bis sie fertig ist, und dann
singt sie **einmal**.

**Passt.** Exakt die Entscheidung „Hintergrund-Ergebnisse erscheinen still über
State-Sync" (T4/F4).

**Verwässert.** Wenn „still" mit „unsichtbar" verwechselt wird. Calm Technology
fordert ein Signal, nur kein aufdringliches. Ein Ergebnis, das man nur durch
Zufall findet, ist nicht ruhig, sondern verschwunden.

### 7.2 Cloudflare Scheduler — Arbeit muss den Neustart überleben

| | |
|---|---|
| Primärquelle | [developers.cloudflare.com/agents/agent-class/schedule-tasks](https://developers.cloudflare.com/agents/agent-class/schedule-tasks/) |
| Evidenz | **A** — dokumentierte Plattformfähigkeit |

**Was tatsächlich funktioniert.** Zeitpläne liegen in SQLite und laufen aus der
Job-Queue; sie überleben Neustarts und Evictions. Gleichzeitig nennt die Doku
die harte Grenze: Ein idle Durable Object wird nach **etwa 70–140 Sekunden**
evictet, laufende Arbeit stoppt. `keepAliveWhile()` hält den Agenten am Leben;
für Arbeit, die einen Deploy überleben muss, verweist die Doku auf Workflows.

**Muster.** *„Still" ist eine Durability-Eigenschaft.* Ein Hintergrund-Ergebnis,
das nur im Speicher eines evicteten Objekts existiert, ist kein stilles Ergebnis,
sondern ein verlorenes.

**Passt.** Für den einen Sub-Agenten im Erstbau: Ergebnis in den Zustand
schreiben, nicht in eine Nachricht.

**Verwässert.** Wenn Hintergrundarbeit als Chat-Nachricht nachgeschoben wird.
Dann ist sie nicht still, sondern nur spät.

### 7.3 GitHub Copilot in the Cloud — Ergebnis als Artefakt

| | |
|---|---|
| Primärquelle | [docs.github.com: Copilot on GitHub.com](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) |
| Evidenz | **A** — ausgeliefertes Produkt mit dokumentierten Grenzen |

**Was tatsächlich funktioniert.** Agentische Arbeit läuft in einer Cloud-Umgebung
gegen ein Repo, während der Mensch weiterarbeitet; das Ergebnis ist ein
**Pull Request** — ein Ort, an dem man es später anschaut, nicht ein Dialog, den
man verpasst hat. Sessions lassen sich zwischen Oberflächen fortsetzen; eine
Actions-Session ist auf **59 Minuten** begrenzt.

**Muster.** *Hintergrundarbeit endet in einem auffindbaren Artefakt, nicht in
einer Benachrichtigung.* Und: Arbeit hat ein Zeitlimit, das sichtbar sein muss.

**Passt.** Der Sub-Agent des Erstbaus sollte sein Ergebnis ebenfalls an einem
**Ort in der Fläche** abliefern, nicht als Toast.

**Verwässert.** Wenn daraus ein zweiter Verlauf wird („Aufgabenliste"). Die
Fläche ist der Agent; ein Task-Panel daneben wäre wieder ein Chatfenster.

### 7.4 LangChain async subagents

Nur repo-belegt ([`konkurrenz.md`](../tech/research/konkurrenz.md)):
`start_async_task`, `check_async_task`, `update_async_task`,
`cancel_async_task`, `list_async_tasks`; der Supervisor bleibt ansprechbar.

**Muster.** *Nachfragen, Korrigieren, Abbrechen* sind Teil des Modells — nicht
nur „starten". Ein Hintergrund-Agent, den man nicht korrigieren kann, ist ein
Versprechen ohne Rückweg.

---

## 8 · Sieben Embodiment-Prinzipien

Diese Prinzipien sind aus der Recherche abgeleitet und gegen die bestehenden
Entscheidungen geprüft. Sie ersetzen keine Entscheidung; sie sagen, woran eine
Umsetzung zu erkennen ist, die die Vision trägt — und woran eine, die sie
verwässert.

### P1 · Reagieren, bevor Bedienen verlangt wird

**Die Fläche antwortet auf Anwesenheit, bevor sie einen Schritt verlangt.**

- Kein Pflichtklick vor dem ersten eigenen Intent (P4 im Vertrag).
- Blick, Nähe, Tippen, Scrollen sind Eingaben — auch ohne Absenden.
- Das Mikrofon öffnet nur nach ausdrücklichem Klick.
- **Bedienen ist erlaubt, nur nicht Bedingung:** Dass der Mensch den Regler
  selbst zieht (`DESIGN-DECISIONS.md`, 19.11. abends), ist mit diesem Prinzip
  vereinbar — der Regler ist Angebot, nicht Eintrittsticket.

*Beleg:* Docket (verworfener „ask-first hero"), Calm Technology
(„smallest possible amount of attention"), Projektvertrag P4.
*Verwässerung:* Ein Onboarding-Dialog, ein Consent-Screen, eine „Wie kann ich
helfen?"-Box.

### P2 · Präsenz ist Zustand, nicht Figur

**Die Augen zeigen, was gerade gilt — sie spielen keine Persönlichkeit.**

- Vier bis fünf Zustände, benannt nach dem Agenten, nicht nach Gefühlen.
- Blick und Lidschlag sind erlaubt; Mienenspiel und Emoji-Posen nicht.
- Der Zustand kommt aus dem echten System (Voice-Status), nie aus einem Timer.

*Beleg:* Rive-Layer (idle + blinken getrennt), `EyeFace.js`
(`listening`/`thinking` als Lidzustände), Cloudflare-Status-Vertrag.
*Verwässerung:* Ein Maskottchen, das „traurig" ist, wenn das Modell langsam ist.

### P3 · Ein Fokus, kein Verlauf

**Es gibt immer genau eine gültige Antwort; ältere treten zurück.**

- Die neue Antwort steht im Fokus, auch wenn vorher gescrollt wurde.
- Der Verlauf ist auffindbar, aber nicht die Hauptfläche.
- Keine Sprechblasen, keine Avatare pro Nachricht, keine Zeitstempel.

*Beleg:* ADR-0002, Capturia („never replies in prose"), Arc (Antwort als Fläche).
*Verwässerung:* Ein „Verlauf"-Knopf, der aussieht wie ein Chat-Panel.

### P4 · Der Zustand ist klein und typisiert

**Aussehen und Haltung sind wenige benannte Felder, kein generierter Code.**

- Ein Zustandsfeld speist CSS-Variablen **und** ein Prompt-Fragment.
- Kein Modell schreibt HTML-Struktur oder CSS.
- Was der Agent ändern darf, ist eine endliche, benannte Menge.

*Beleg:* ADR-0004, Rive View Models, dotLottie Themes, A2UI-Katalog als Grenze.
*Verwässerung:* „Generative UI" als Freibrief — dann ist die Seite nicht mehr
der Agent, sondern sein Output.

### P5 · Der Rhythmus dient dem Lesen

**Der Typewriter darf nie langsamer sein als das Auge.**

- 0,1 s Reaktion auf jede direkte Berührung (Regler, Scrollen, Tippen).
- Der Puffer läuft voraus; Pausen werden überbrückt, nicht sichtbar.
- Die Antwortfläche hat reservierte Höhe; nichts springt.

*Beleg:* NN/g-Zeitgrenzen, NN/g-Lesestudie, CLS.
*Verwässerung:* Ein „eindrucksvoller" Typewriter, der bei langen Wörtern so
langsam wird, dass man wartet.

### P6 · Zwei Kanäle, ein Ereignis

**Sichtbar lebendig, hörbar ruhig.**

- Der sichtbare Text streamt; der Screenreader hört Start, Ende, Abbruch, Fehler.
- Die Statusregion existiert von Anfang an und ist leer.
- `prefers-reduced-motion` ersetzt Bewegung durch Opazität oder Farbe, nicht
  durch Schweigen.

*Beleg:* WCAG 2.2.2 (Level A) und 2.3.3, `aria-live`-Praxisberichte,
Rive-Reduced-Motion-Pattern.
*Verwässerung:* Animation um des Effekts willen; „wir machen das später".

### P7 · Still, aber auffindbar

**Hintergrundarbeit verändert den Zustand, nicht die Aufmerksamkeit.**

- Kein Toast, kein Ton, kein Fokuswechsel, keine zweite Sprechspur.
- Das Ergebnis ist da, wenn man hinsieht — und es überlebt Reload.
- Wenn Arbeit scheitert, ist der Fehler sichtbar, ohne zu unterbrechen.

*Beleg:* Calm Technology (Peripherie ↔ Zentrum), Cloudflare-Scheduler
(Durability), Copilot (Artefakt statt Benachrichtigung), T4/F4.
*Verwässerung:* Proaktives Nachsprechen im Erstbau (T4 ist Wunsch, nicht Scope).

---

## 9 · Was wir ausdrücklich nicht übernehmen

| Anti-Muster | Woher | Warum nicht |
|---|---|---|
| Avatar-Video im Hero | Docket | Teuer, uncanny, konkurriert mit den Augen |
| Frei generierte HTML-Struktur | allgemein „generative UI" | Sicherheit, Layout-Shift, Orientierungsverlust; widerspricht P4 |
| Katalog-Karten als Antwort | A2UI, `json-render` | Ändert Inhalte, nicht Präsenz — die Lücke, die Agentfähig füllt |
| Chat-Verlauf als Hauptfläche | ChatGPT/Claude | Austauschbar; widerspricht ADR-0002 |
| Token-Stream in `aria-live` | verbreitete Chat-UIs | Nachweislich kaputt (P6) |
| „Listening", obwohl das Mikrofon aus ist | diverse Voice-Demos | Vertrauensbruch; widerspricht P1/P2 |
| Proaktives Sprechen im Erstbau | T4-Wunsch | Bevormundungsrisiko, nicht durch Messlauf gedeckt |
| Latenz als Produktversprechen | Anbieter-Marketing | Der Vertrag trennt Mittel und Nutzen |

---

## 10 · Quellen

**In diesem Lauf abgerufen (19.11.2026):**

- https://rive.app/docs/editor/state-machine/state-machine.md
- https://rive.app/docs/runtimes/data-binding
- https://rive.app/docs/editor/accessibility/reduced-motion.md
- https://rive.app/docs/getting-started/introduction.md (via `llms.txt`)
- https://github.com/LottieFiles/dotlottie-web
- https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice
- https://arc.net/blog/arc-search
- https://techcrunch.com/2024/01/28/arcs-new-iphone-browser-wants-to-be-your-search-companion
- https://github.com/a2ui-project/a2ui
- https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
- https://www.nngroup.com/articles/response-times-3-important-limits/
- https://www.nngroup.com/articles/how-little-do-users-read/
- https://web.dev/articles/cls
- https://azukiazusa.dev/en/blog/accessible-streaming-chat-ui
- https://generativea11y.com/docs/screen-readers-and-streaming-ai
- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- https://docs.livekit.io/agents/build/turns/
- https://deepgram.com/learn/introducing-flux-conversational-speech-recognition
- https://calmtech.com/
- https://developers.cloudflare.com/agents/api-reference/schedule-tasks/
- https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent

**Nicht abrufbar in diesem Lauf:** Microsoft Research „SUPPLE" (404). Damit fehlt
eine HCI-Primärquelle für adaptives UI; die Aussagen zu adaptiv vs. dekorativ
stützen sich auf `Agentfähig/GreateWriting.txt` und das Zweitgutachten.

**Nur aus dem Repo, nicht neu geprüft:** `EyeFace.js` (Struktur und
Lidzustände), Cloudflare-Voice-Status und `first_audio_ms`, `json-render`,
LangChain async subagents, Docket und Navless.

---

## 11 · Offene Punkte

1. **`EyeFace.js` + reduzierte Bewegung + Safari** ist ungeprüft. Das ist ein
   Smoke-Check, keine Designfrage — und er gehört vor F1 „fertig".
2. **Deutsche Turn-Erkennung** ist *kein* zweiter Blocker: `nova-3` +
   `endpointingMs` und der offene LiveKit-Turn-Detector mit Deutsch decken sie ab
   (`[P]`, `PRIOR_ART_REPORT.md`). Offen bleibt allein TTS (`docs/UNSOLVED-TECHNIK.md` U5).
3. **„Ein Fokus, kein Verlauf" hat kein Vorbild.** Der Fremdtest (P1/P3) ist
   die einzige Prüfung; jede zusätzliche Recherche ersetzt ihn nicht.
