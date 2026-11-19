# ADR-0005 — Vor dem Ausbau: ein Fremder testet den ersten Durchstich

- **Status:** vorgeschlagen (Owner-Entscheidung ausstehend)
- **Datum:** 19.11.2026
- **Bezieht sich auf:** `docs/GUTACHTEN-wow-oder-scheitern.md`,
  `docs/PLAN-STUFEN-0-5.md` (Stufe 3), `docs/DESIGN-DECISIONS.md`

## Kontext

Der Plan hat Stufen für Messung (1), Entscheidung (2), Prototyp (3),
Ausweichpfad (4) und Erstbau (5). Keine dieser Stufen prüft die eine Frage, die
alle anderen nicht beantworten können:

> **Ist das ein Erlebnis oder eine Spielerei?**

Alle Messungen in Stufe 1 sind technisch: Latenz, Transkript, Audio. Alle
Entscheidungen in Stufe 2 sind technisch: welches Modell, welcher Anbieter.
Der Prototyp in Stufe 3 kann perfekt sein — Latenz unter 1 Sekunde, deutsch,
ein Regler, der reagiert — und trotzdem flach wirken.

Der Grund ist strukturell: **Samuel ist der Bauherr.** Er hat die Skizze
gezeichnet, er kennt die Absicht, er hat die Designentscheidungen getroffen,
er weiß, dass der Regler aus einer bestimmten Absicht heraus existiert. Wenn
er die Seite sieht, sieht er die Absicht dahinter. Ein Besucher sieht nur die
Oberfläche.

Die Skizze selbst warnt in diesem Sinn — nicht gegen Agentfähig, aber gegen
die Oberflächlichkeit, die Agentfähig vermeiden will:

> „what works for others" · „prior art!" · „what can we copy"
> — Skizze, Abschnitt 9 „Steps und Recherche"

Die Frage „was funktioniert für andere" ist gestellt und noch unbeantwortet.

## Entscheidung

**Nach dem ersten Durchstich (Stufe 3) wird gebaut und getestet — aber nicht
weitergebaut, bevor ein Fremder 20 Sekunden damit gemacht hat.**

Der Test:

1. **Wer:** eine Person, die das Projekt nicht kennt. Kein Entwickler, kein
   Freund mit Tech-Blase, niemand, der den Kontext mitbringt.
2. **Was:** 20 Sekunden mit der Seite, **ohne Anleitung**. Kein „klicken Sie
   hier", kein Erklären, was der Agent kann.
3. **Was wird beobachtet:** der Bildschirm wird aufgezeichnet. Beobachtet wird
   **nicht** die Bedienung, sondern die Reaktion — scrollt die Person von
   selbst? bleibt sie stehen? fragt sie, was passiert?
4. **Zwei Fragen danach:**
   - *„Was hat die Seite gerade gemacht?"*
   - *„Würdest du das jemandem zeigen?"*

**Bestehensgrenze:** Die Person muss von allein scrollen oder fragen, was
passiert. Beides nicht, und der erste Durchstich ist eine Spielerei — egal wie
schön er aussieht. Dann zurück in Stufe 3, nicht weiter.

## Konsequenzen

**Positiv**

- Es ist der **einzige** Test, der die eigentliche Frage beantwortet. Keine
  Latenzmessung und kein Review sagt etwas darüber, ob es berührt.
- Er ist billig: ein Link, ein Browser, 20 Minuten Aufmerksamkeit.
- Er findet genau den Fehler, den Samuel per Konstruktion nicht finden kann.
- Er liefert eine konkrete, unbestechliche Zahl: die Person scrollt oder
  nicht.

**Negativ**

- Ein einzelner Test ist eine Stichprobe, kein Beweis. Zwei Personen wären
  belastbarer. Der Plan setzt auf eine Person, weil eine Person den Test
  überhaupt erst durchführbar macht.
- Der Test kostet **Zeit im Projekt**, in der nichts gebaut wird. Das ist der
  teuerste Teil der Regel — und der, der am ehesten wegfällt, wenn die
  Spannung nachlässt.
- Der Test kann nicht sagen, **was** falsch ist, wenn er durchfällt. Er sagt
  nur: nicht so.

**Neutral**

- Der Test ist kein Benchmark und kein Nutzertest. Er ist eine
  Existenzprüfung der Prämisse.

## Offen

- Wer ist die Person? Das ist eine organisatorische Frage, keine technische.
  Vielleicht jemand aus dem Grilling-Umfeld, vielleicht jemand, der
  `human-agent-interface` kennt (Zielgruppe — aber Vorsicht: die kennen den
  Kontext).
- Wann? Unmittelbar nach dem ersten Durchstich, bevor Stage 5 beginnt.
- Wird der Test wiederholt, wenn Stage 5 fertig ist? Sinnvoll — dann mit
  mehreren Personen.

## Abgrenzung

Das ist **kein** Ersatz für die Messungen in Stufe 1 und **kein** Ersatz für
die Designprüfung in Stufe 3. Er prüft eine andere Schicht: nicht „funktioniert
es", sondern „wirkt es".
