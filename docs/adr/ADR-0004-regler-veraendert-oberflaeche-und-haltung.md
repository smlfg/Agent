# ADR-0004 — Der Regler verändert Oberfläche *und* Haltung

- **Status:** vorgeschlagen (Owner-Entscheidung ausstehend)
- **Datum:** 19.11.2026
- **Bezieht sich auf:** `docs/GUTACHTEN-wow-oder-scheitern.md` (Falle 1),
  `docs/DESIGN-DECISIONS.md`, `Agentfähig/GreateWriting.txt` Z. 222

## Kontext

Die Skizze verlangt Regler mit „real time effects" und den Agenten, der nach
`colour · form · output style` fragt. In `docs/DESIGN-DECISIONS.md` steht das
als **Regler-Belegung im Gespräch** — die Belegung entsteht, während man
redet. Das ist das Besondere, und es ist richtig.

Aber es gibt eine Falle, die bisher nur als Randnotiz geführt wurde. Die
Designinspiration warnt wörtlich:

> „True adaptation is behavioral: 'Personalization' today is superficial:
> picking a dark mode or a color theme. **That is decoration, not adaptation.**"
> — [`Agentfähig/GreateWriting.txt`](../../Agentfähig/GreateWriting.txt), Z. 222

Ein Regler, der CSS-Farben von Blau auf Braun schiebt, ist ein Dark-Mode-
Schalter mit Extra-Schritten. Der Besucher sieht nach fünf Sekunden: *nur*
Farbe. Der Zauber ist vorbei, und es bleibt eine Website, die sich selbst
umstellt — was als Spielerei wirkt, nicht als Präsenz.

Das unabhängige Zweitgutachten
([`docs/GUTACHTEN-wow-oder-scheitern.md`](../GUTACHTEN-wow-oder-scheitern.md))
hat diese Falle als die gefährlichste der drei Produktfallen benannt.

## Entscheidung

**Der eine Regler der ersten Version verändert Oberfläche und Antwort-Haltung
des Agenten gleichzeitig.**

Konkret: Eine Achse, an deren Enden nicht nur Farbe steht, sondern ein
**Verhalten**:

| Achse | Farbe | Typografie / Raum | Rhythmus | **Antwort-Haltung** |
|---|---|---|---|---|
| warm ↔ kühl | Palette | Dichte, Laufweite, Schriftgewicht | Antwort-Tempo | **Formulierung**: erzählend und einladend ↔ präzise und strukturiert |

Der Agent ändert also nicht nur, wie die Seite *aussieht*, sondern **wie er
spricht**. Der Nutzer hört und sieht dieselbe Verschiebung.

## Konsequenzen

**Positiv**

- Der Regler wird zum Steuerorgan zwischen Mensch und Agent statt zum
  Farbwahl-Widget. Genau das ist der Unterschied zwischen Dekoration und
  Anpassung.
- Die Haltung ist über den bestehenden Zustandskanal technisch billig: ein
  Zustandsfeld steuert CSS-Variablen **und** einen Prompt-Baustein bzw. ein
  System-Fragment. Das ist keine neue Architektur, es ist eine zweite
  Verwendung desselben Kanals.
- Die Achse passt zur Skizze („warm ↔ cold", Abschnitt 6) und zur dortigen
  Notiz „2 more when this — maybe 5 options but only show 3". Ein Regler mit
  3 sichtbaren Positionen ist die erste Ausbaustufe.

**Negativ**

- Die Antwort-Haltung ist **schwerer zu machen** als die Farbe. Farbe ist CSS.
  Haltung ist Prompt, System-Instruktion, vielleicht Temperatur und
  Satzlänge. Das gehört ins Design, nicht in den Prototyp.
- Das Risiko, dass der Agent die Haltung *behauptet* statt sie zu zeigen: Der
  Agent könnte „kühler formulieren" sagen und gleichsam warm schreiben. Dann
  ist die Illusion kaputt und schlimmer als ohne.
- Zwei Achsen gleichzeitig (Farbe *und* Haltung) sind mehr Testaufwand als eine.

**Neutral**

- Die Skizze nennt drei mögliche Achsen: `colour`, `form`, `output style`.
  Die hier gewählte verbindet alle drei zu einer. Das ist eine
  Designentscheidung, die Samuel treffen muss — siehe „Offen".

## Offen

- **Welche Achse zuerst?** Vorschlag: die combined. Form (also wie das
  Aussehen *strukturiert* ist) ist für den ersten Durchstich schwerer als
  Farbe, weil sie Layout bedeutet. Farbe allein ist die Falle.
- **Wie koppelt man Haltung an Zustand?** Ein zusätzliches Zustandsfeld
  (`tone: "warm" | "cool"`) plus ein System-Fragment im Agenten-Prompt. Wie
  genau der Agent darauf reagiert, ist eine Designfrage und wird erst im
  Prototyp sichtbar.
- **Abgrenzung:** Regler-Belegung *im Gespräch* (Agent fragt, Nutzer
  antwortet) und Regler-Belegung *durch den Nutzer* (Nutzer zieht selbst).
  Entscheidung vom 19.11.2026 ist die erste Variante. Der Nutzer darf danach
  aber regelrecht ziehen — sonst ist es kein Regler, sondern eine Ansage.
