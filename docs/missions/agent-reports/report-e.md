# Agent E — Gesprächsmetriken: Konzept, Abbildung, erster Durchstich

**Randbedingungen aus dem Code:** Der Store kennt heute nur `phase, prompt, answer, turn, dev` (`src/state/store.js:7-13`); `INPUT` wird während `thinking`/`speaking` verworfen (`src/state/store.js:26`), `SUBMIT` bricht den laufenden Turn ab und erhöht `turn` (`src/state/store.js:31-36`), veraltete Turns werden ignoriert (`src/state/store.js:39-51`). Antworttempo ist bereits parametrisierbar: `delayMs = 700` (`src/dev/devAgent.js:28`) und `wordDelayMs = 45` (`src/conversation/typewriter.js:27`). Das ist der Hebel für den ersten Durchstich — ohne Vendor- oder Vertragsänderung an `devAgent`.

## 1. Metrik-Katalog (nur Browser, nur Text)

| Signal | Berechnung | Rauschen / Fallstricke |
|---|---|---|
| Tipptempo | Median der Tastenintervalle der letzten 30–40 Anschläge, Pausen > 1,5 s ausgeschlossen; Ausgabe in Zeichen/s. | Autorepeat, Paste, Autokorrektur, IME; Handy-Layouts sind systematisch langsamer. Nie absolut vergleichen, nur relativ zur Person. |
| Pausenprofil | Variationskoeffizient der Intervalle plus Anteil Lücken zwischen 0,6 und 3 s innerhalb einer Nachricht. | Nachdenken, Lesen und Tab-Wechsel sehen gleich aus; `visibilitychange` mitloggen und Lücken mit verstecktem Tab verwerfen. |
| Korrekturen | Backspace/Delete pro 100 Zeichen; zusätzlich „Entwurf verworfen“: Feld nach ≥ 15 Zeichen geleert, ohne Submit. | Normales Editieren und Autokorrektur zählen mit; Satzzeichen-Korrekturen herausfiltern. |
| Nachrichtenlänge | Wörter/Sätze über `Intl.Segmenter` (nativ, keine Lizenz); Zeichenlänge getrennt. | Ein-Wort-Antworten und Zitate verzerren; Code/Namen als ein Token behandeln. |
| Fragenanteil | Endet mit „?“, beginnt mit Wh-Wort/Hilfsverb, oder POS-Tag `?`; Anteil der letzten 3 Prompts. | Rhetorische Fragen, „really?“ als Ausruf, Zitate. |
| Antwortlatenz des Nutzers | `t_ersteTaste − t_RESPONSE_END`; zweite Variante `t_SUBMIT − t_RESPONSE_END` (Denk- vs. Tippzeit). | Tab weg, Lesen, Push-Nachricht. Nur bei sichtbarem Tab zählen. |
| Unterbrechung | `SUBMIT` in `thinking`/`speaking`; zusätzlich sichtbare Zeichen im Moment des Abbruchs (`answer.length` als Schnittpunkt). | Versehentliches Enter, kurze Korrektur. Erst ab sichtbarem Text zählen. |
| Valenz | VADER auf maximal zwei Sätze, Bereich −1…+1, Totzone ±0,3. | Sarkasmus, Fachsprache, Verneinung; kurze Texte sind unzuverlässig. |
| Themenwechsel | Jaccard der Inhaltswörter (ohne Stoppwörter) zwischen zwei Prompts; zusätzlich Anteil neuer Wörter. | Synonyme, Pronomen, sehr kurze Prompts; ein Themenwechsel kann auch Vertiefung sein. |
| Register/Komplexität | Ø Satzlänge, Nebensatzanteil (POS) und Flesch-Wert zu einer 0…1-Zahl. | Zitate, Listen, Nicht-Muttersprachler; nie als Kompetenz lesen. |
| Ich/Du/Wir | Anteil der Pronomen `I`, `you`, `we` an allen Pronomen. | Berichtete Rede, Zitate; „we“ kann auch formelhaft sein. |
| Verweildauer | Zeit vom ersten sichtbaren Zeichen bis zur nächsten Taste; parallel Copy-Events. | Lesegeschwindigkeit, Tab weg, Handy in der Hand. |
| Hedging | „maybe“, „I think“, Modalverben pro 100 Wörter. | Höflichkeitskonvention, nicht automatisch Unsicherheit. |

Alles läuft lokal; kein Netzwerk, keine Persistenz (Vertrag: Reload = Neustart, `M1-CONTRACT.md:6`).

## 2. Signal → Oberfläche

| Signal | Wirkung | Typ |
|---|---|---|
| Tipptempo | Typewriter-`wordDelayMs` und `delayMs` folgen dem Tempo; schnelle Tipper bekommen knappen Rhythmus. | **VERHALTEN** |
| Pausenprofil | Vor dem ersten Wort ein hörbarer Beat Stille; danach ein Satz weniger und höchstens eine Rückfrage. | **VERHALTEN** |
| Korrekturen | Agent zitiert/paraphrasiert nicht, wartet länger, stellt keine Doppelfrage. | **VERHALTEN** |
| Nachrichtenlänge | Antwortform: eine Zeile ↔ zwei Absätze; ein Gedanke ↔ zwei Schritte. | **VERHALTEN** |
| Fragenanteil | Bei vielen Fragen antwortet der Agent direkt, ohne Gegenfrage. | **VERHALTEN** |
| Antwortlatenz | Schnelle Antwort → Antwort kommt schnell; lange Pause → der Agent lässt Raum (längerer Vorlauf, langsameres Enthüllen). | **VERHALTEN** |
| Unterbrechung | Sofortiges Nachgeben: altes Paar verschwindet ohne 600-ms-Theater (`conversation.css:26`), Augen sofort `listening`. | **VERHALTEN** |
| Negative Valenz | Kein Spiegeln: kürzere Sätze, neutraler Blick statt `happy` (`presence.js:9-15`), keine Ausrufezeichen, keine Aufmunterung. | **VERHALTEN** |
| Themenwechsel | Altes Paar löst sich schneller, Agent lässt altes Vokabular fallen, ein Satz Brücke statt Zusammenfassung. | **VERHALTEN** |
| Geringe Komplexität | Einfachere Satzstruktur, kein Jargon — ohne den Ton zu wechseln. | **VERHALTEN** |
| Verworfener Entwurf | Agent bleibt still, Blick wandert zum Eingabefeld, keine Aufforderung. | **VERHALTEN** |
| Verweildauer auf der Antwort | Lange Verweildauer → Agent hält inne, hängt nichts an; schnelles Weitertippen → weniger Text. | **VERHALTEN** |
| Valenz | Palette/Akzentfarbe verschiebt sich. | DEKORATION |
| Register | Laufweite, Zeilenhöhe, Schriftgewicht. | DEKORATION |
| Tipptempo | Pupillengröße/Blinzrate. | DEKORATION |
| Turnzahl | Hintergrundtiefe/Gradient. | DEKORATION |

12 von 16 = 75 % VERHALTEN. Die vier Dekorationen sind bewusst geduldet, aber nie die einzige Reaktion (ADR-0004:18-24, :33-45).

## 3. Zustandsschema

```js
metrics: {
  typing:  { rate, hesitation, revision, keys },              // 0..1, 0..1, 0..1, int
  message: { words, sentences, question, valence,            // 1.., 1.., 0..1, -1..1
             complexity, overlap, hedges },                  // 0..1, 0..1, 0..1
  rhythm:  { replyLatency, dwell, interruptions, abandoned },// 0..1, 0..1, int, int
  surface: { pace, room, focus, warmth },                    // 0..1, abgeleitet/geglättet
  n, lastTurn                                                // Stichprobe, Turn-Guard
}
```

- **Glättung:** Pro Turn eine EWMA mit α = 0,35 über die Turn-Aggregate; `n` zählt gültige Turns. Unter `n < 2` bleibt `surface` neutral (0,5) — ein einzelner lahmer Satz darf nichts prägen.
- **Aktualisierung:** `INPUT` pflegt nur `typing`-Akkumulatoren (Zeitstempel im Payload, nicht `Date.now()` im Reducer — sonst sind die Tests nicht mehr deterministisch, vgl. `typewriter.js:25-35`). `SUBMIT` friert `message` ein und startet die NLP-Auswertung. `RESPONSE_START/END` liefern die Zeitanker für `replyLatency`/`dwell`. `SUBMIT` während `thinking`/`speaking` erhöht `interruptions` und notiert den Schnittpunkt. Alles mit `event.turn !== state.turn → ignore` wie `store.js:39-51`.
- **Architektur:** Roherfassung in einem eigenen Modul (Input-/Submit-Listener), in den Store geht nur ein Event `METRICS {patch, turn, at}`. Das ist eine Vertragsänderung (`M1-CONTRACT.md:13`) und braucht den Integrator; der Reducer bleibt rein, `devAgent` unberührt. Achtung: `INPUT` wird während der Antwort heute verworfen (`store.js:26`) — „Vorlehn“-Signale brauchen ein eigenes Event.
- **Nicht in den Store:** abgeleitete CSS-Werte. `surface` ist ein reines Prädikat, Views lesen es über `subscribe` (`presence.js:127-129`) und setzen `data-*`/CSS-Variablen.

## 4. Kleinster erster Durchstich

**Ein Signal:** `rhythm.replyLatency` = Zeit von `RESPONSE_END` bis zur ersten Taste der nächsten Nachricht, gemittelt über die letzten zwei Turns, normiert `clamp((ms − 1500) / 8000, 0, 1)`.

**Eine Verhaltensänderung:** *Die Fläche übernimmt das Tempo des Besuchers.* Bei `warm`/schnell: `delayMs 250`, `wordDelayMs 28`. Neutral: 700/45 (heute, `devAgent.js:28`, `typewriter.js:27`). Bei langsam: `delayMs 1100`, `wordDelayMs 70`. Ein Wert, zwei Stellschrauben, ein Verhalten: Rhythmus. Kein Farbwechsel, keine Kopie.

**Akzeptanzkriterium:** Bei simuliertem `< 2 s`-Turn erscheint das erste Wort in ≤ 350 ms und der Wortabstand ist ≤ 30 ms; bei `> 9 s`-Turn ≥ 950 ms und ≥ 62 ms. Der Unterschied ist mindestens 2×, über drei Latenzstufen monoton, und wird pro Turn genau einmal eingefroren (kein Umschalten mitten in der Antwort). Im Fremdtest (ADR-0005) antwortet die Person auf „Hat die Seite auf dich reagiert?“ mit dem Tempo, nicht mit der Farbe; die Bildschirmaufzeichnung zeigt den Unterschied zweier aufeinanderfolgender Turns in unter 20 s. `reducedMotion` bleibt unverändert sofort.

## 5. Anti-Muster

- **Stimmung spiegeln.** Traurige Seite auf traurigen Text wirkt manipulativ und verstärkt Negatives. Regel: sempre reduzieren, nie verstärken.
- **Gefühle benennen.** „Du wirkst unsicher“ aus drei Pausen ist Therapie-Kitsch und fast immer falsch.
- **Schmeicheln/Echo.** Wörter zurückwerfen, um Verstehen zu simulieren, entlarvt sich beim zweiten Mal.
- **Langsamkeit bestrafen.** Wer zögert, bekommt kürzere, kühlere Antworten — das liest sich als Ungeduld.
- **Metriken sichtbar machen.** „Engagement 78 %“ macht aus Begegnung Überwachung; keine Zahlen, keine Persistenz.
- **Kompetenz ableiten.** Tipptempo/Komplexität als Intelligenzproxy führt zu Bevormundung.
- **Dauerbewegung.** Jede Taste verschiebt Layout oder Blick → Jitter, CLS, Lesestörung.
- **Haltungswechsel mitten im Turn.** Der Agent behauptet Wärme, statt sie zu zeigen (ADR-0004:64-68).
- **Themen-Upsell.** Entität erkannt → ungefragte Empfehlung: Verkaufsbot-Uncanny.
- **Slang mitsprechen.** Klingt wie Nachäffen, nicht wie Nähe.
- **Bedeutung nur in Motion.** Wer `prefers-reduced-motion` nutzt, muss dieselbe Information behalten (WCAG 2.2.2, bereits im Projekt).

## 6. Upstreams (Browser, englisch)

| Projekt | Lizenz | Eignung |
|---|---|---|
| [winkNLP](https://github.com/winkjs/wink-nlp) 2.4.0 + [wink-eng-lite-web-model](https://github.com/winkjs/wink-eng-lite-web-model) 1.8.1 | MIT | POS, Sätze, Entitäten, synchron; explizit für Browser gebaut. `wink-eng-lite-web-model` ~3,7 MB entpackt (npm) — der schwerste Brocken, nur bei echtem POS-Bedarf. |
| [compromise](https://github.com/spencermountain/compromise) 14.20.0 | MIT | Kleinere API für Fragen, Verben, Themen; ~2,8 MB entpackt, per Tree-Shaking reduzierbar. Guter Kandidat für Fragenanteil/Themenwechsel. |
| [vader-sentiment](https://github.com/vaderSentiment/vaderSentiment-js) 1.1.3 | **Apache-2.0** (nicht MIT) | Valenz inkl. Verneinung/Verstärker, browserfähig; Namensnennung und NOTICE beachten. |
| [sentiment](https://github.com/thisandagain/sentiment) 5.0.2 | MIT | AFINN-Lexikon, klein und schnell; Paket ist Node-orientiert, im Browser nur über Bundler oder als kopierte Wortliste. |
| `Intl.Segmenter` (nativ) | keine | Wörter/Sätze/Grapheme ohne Abhängigkeit — für Länge, Satzgrenzen und Typewriter-Tokens erste Wahl. |

GPL bleibt ausgeschlossen (bereits so entschieden, `M1-BERICHT.md:54`). Empfehlung: für den ersten Durchstich **keine** NLP-Bibliothek, nur `Intl.Segmenter` und Timing; compromise erst, wenn Fragenanteil/Themenwechsel wirklich gebaut werden, winkNLP nur wenn POS-Tiefe gebraucht wird.

**STOP.**
