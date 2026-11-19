# ADR-0002 — Zielbild: Agent als Schnittstelle, nicht als Chat

- **Status:** vorgeschlagen (Owner-Entscheidung ausstehend)
- **Datum:** 19.11.2026
- **Bezieht sich auf:** `docs/DESIGN-DECISIONS.md`, `sketches/2026-11-12-agentfaehig.md`

## Kontext

Die Skizze beginnt mit „**Not a website — an Agent itself**". Das ist eine
Architektur-Aussage, keine Stilfrage: Die Seite ist kein Dokument, das einen
Agenten beschreibt, sondern **die Oberfläche des Agenten**.

Die Designentscheidungen vom 19.11.2026 bestätigen das:

- Text zuerst, Mikrofon nach Klick — der Agent bekommt den Intent,
  die Seite reagiert.
- „Einmal eine Frage pro Runde" — es gibt keinen Chat-Verlauf im klassischen
  Sinn, sondern einen laufenden Zustand.
- Ein Regler, dessen Belegung **im Gespräch entsteht** — der Agent fragt nach
  seinem Aussehen und wirkt live.
- Hintergrund-Agenten liefern Ergebnisse **still** per State-Sync, ohne den
  Hauptfokus zu unterbrechen.

Die Upstream-Suche hat bestätigt, dass genau dieses Muster gebaut wurde:
`capturia` formuliert es als „the agent never replies in prose", Pika
`generative-ui` als „dynamically generates the most appropriate visual
composition for each response".

## Entscheidung

**Der Agent ist das Interface. Die Seite ist sein Zustand, nicht sein Inhalt.**

Daraus folgen drei Regeln für die Umsetzung:

1. **Die Antwort erscheint an einem Ort, nicht in einem Verlauf.** Die aktuelle
   Antwort steht im Fokus. Ältere treten zurück. Es gibt kein Chat-Fenster,
   das man scrollen muss, um zu wissen, was gerade gilt.
2. **Der Agent fragt, bevor er baut.** Er erfragt `colour · form · output
   style` und gestaltet danach. Er fragt nicht „wie kann ich dir helfen".
3. **Was im Hintergrund passiert, passiert still.** Sub-Agenten liefern
   Ergebnisse über den Zustand, nicht über eine zweite Sprech spur.

## Konsequenzen

**Positiv**

- Das ist der unterscheidende Kern. Eine Chat-Oberfläche mit Agent dahinter
  wäre austauschbar und nicht schützenswert.
- Es macht die Upstream-Übernahme möglich: `EyeFace.js` und die Layout-Logik
  aus Pika sind Bausteine für genau dieses Muster.
- Der Zustand wird zum primären Objekt: Reglerwerte, Farben, Status,
  Mikrofonpegel, Teiltranskript — alles ein Zustandsmodell.

**Negativ**

- Es ist **schwerer** als ein Chat-Widget. Ein Chat-Widget hat einen
  Nachrichtenpuffer; ein Zustandsmodell braucht eine klare Frage: „Was ist
  gerade der gültige Zustand?"
- Die Animation hängt an Ereignissen (`idle`, `listening`, `thinking`,
  `speaking`, `audioLevel`). Das ist bindend an das Voice-Protokoll.

**Neutral**

- Es ist kein Widerspruch zu `capturia`: dort ist es eine Videobroadcast-
  Oberfläche, hier eine Website. Das Prinzip („Agent verändert Oberfläche,
  nicht nur Text") ist dasselbe.

## Offen

- Wie genau wird der gültige Zustand modelliert? Ein flacher Schlüssel-Wert-
  Zustand (wie `setState` im Agents SDK) oder ein typisiertes Schema
  (Kandidat aus `tech/UPSTREAM-SEARCH-cloudflare.md`: `json-render`)? → offen,
  es gibt dafür noch kein ADR; Kandidat nur laut Worker-Bericht.
- Der erste Regler: Farbe, Temperatur oder Form? In `docs/DESIGN-DECISIONS.md`
  als offene Frage vermerkt.
