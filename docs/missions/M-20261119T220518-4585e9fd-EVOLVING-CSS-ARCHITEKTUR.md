# Evolving CSS: das wachsende Oberflächen-Genom

Mission `M-20261119T220518-4585e9fd` · 19.11.2026 · Entwurf Claude Code (Integrator), Umsetzung DeepSeek.

## Problem (Owner, 23:33)

„Die ersten 5 Änderungen sind heftig, aber zwischen 5 und 25 passiert kaum noch was. Das soll ein Evolving-CSS-System sein.“

Ursache: Heute ist die Oberfläche eine **Funktion des aktuellen Zustands** — 12 Parameter, per EMA geglättet, auf feste Variablen abgebildet. Ein geglätteter Mittelwert konvergiert; nach ein paar Turns pendelt alles um denselben Punkt. Es gibt kein Gedächtnis, keine Akkumulation, keinen neuen Ausdruck.

## Idee

Die Oberfläche ist nicht f(Zustand), sondern das **Ergebnis einer Geschichte**: ein Genom, das mit jedem Turn **wächst**. Der Verlauf hinterlässt Sediment. Zwei Gespräche erzeugen zwei verschiedene Seiten; ein langes Gespräch eine reichere Seite als ein kurzes.

```
Turn-Metriken ──► Δ-Signal (Änderung, nicht Absolutwert)
                       │
                       ▼
   Genom { generation, traits[], unlocked families, palette sediment, seed }
     ├─ Mutation: bestehende Traits driften in Richtung des Signals (Random Walk mit Drift)
     ├─ Wachstum: neue Traits entstehen (alle k Turns oder bei Schwellen-Überschreitung)
     ├─ Freischaltung: neue Ausdrucks-Familien nach Reife (Turn-Stufen)
     └─ Neuheits-Garantie: Ist die Wahrnehmungsdistanz zum letzten Zustand < ε,
        mutiert ein ruhender Trait (jeder Turn bewirkt etwas Sichtbares)
                       │
                       ▼
   Expression: Traits → CSS
     ├─ Custom Properties (kontinuierlich)
     └─ generiertes <style data-genome> mit @layer genome.turn-N (diskret, stapelnd)
                       │
                       ▼
   Wächter: Kontrast AA, Lesbarkeit, reduced motion, Performance-Budget
```

## Bausteine

1. **Genom (Zustand, nur im Speicher, Reload = Neustart):** `{ seed, generation, traits: [{ id, family, gene, value, velocity, age, weight }], unlocked: Set<family>, sediment: [{ turn, hue, chroma, lightness }] }`. Seed pro Besuch zufällig, im Replay fest (`?seed=`) → reproduzierbar.
2. **Δ-Signal statt Absolutwert:** Pro Turn zählt, wie sich die 12 Parameter *verändert* haben, plus die Rohmetriken des Turns. Ein ruhiges Gespräch erzeugt kleine, aber stetige Drift; ein Bruch im Gespräch einen Sprung.
3. **Traits wachsen, statt zu sättigen:** Jeder Trait hat einen Wert ohne harten Deckel (weiche Asymptote nur pro Trait), aber die **Anzahl** der Traits steigt. Reifegrad `m = log(1 + turns)` skaliert die Amplituden; nichts konvergiert, weil ständig neue Dimensionen dazukommen.
4. **Ausdrucks-Familien nach Reife** (Vorschlag, Stufen anpassbar):
   - Turn 1–3: Temperatur & Licht (Farbe, Hintergrundverlauf)
   - Turn 4–7: Typografie (Gewicht, Laufweite, Größe, Stil, Zeilenfall)
   - Turn 8–12: Raum & Komposition (Abstände, Achsen, Asymmetrie, Position von Augen/Text/Feld)
   - Turn 13–20: Textur & Grund (Muster, Körnung, Linien, Formen im Hintergrund)
   - Turn 21+: Struktur & Bewegungs-Signatur (Raster, Rahmenlose Formen, eigene Übergangskurven, „Handschrift“ der Seite)
   Welche Familie zuerst kommt, kann von den Metriken abhängen (z. B. hohe playfulness schaltet Form früher frei).
5. **Sediment:** Jede Runde legt eine Farb-/Form-Schicht ab, ältere Schichten bleiben mit abklingendem Gewicht sichtbar (z. B. als feine Bänder/Ringe/Konturen im Hintergrund). Das ist das sichtbare Gedächtnis — ohne lesbaren Verlauf.
6. **Neuheits-Garantie:** Wahrnehmungsdistanz (OKLCH-Distanz der Hauptfarben + normierte Raum-/Typo-Deltas) zwischen Turn N und N−1 muss ≥ ε sein; sonst wird ein ruhender Trait mutiert oder ein neuer erzeugt.
7. **Expression stapelnd:** pro Turn ein eigener `@layer genome.t<N>`-Block, der auf dem vorherigen aufsetzt (kleine relative Änderungen), plus kontinuierliche Custom Properties. Der DOM bleibt gleich; nur CSS wächst. Alte Layer werden nach ~40 Turns zu einem Basis-Layer verdichtet (Speicher/Performance).
8. **Wächter:** Kontrast ≥ 4.5:1 für Text (sonst Lichtheit nachführen), keine Animation während die Antwort tippt, `prefers-reduced-motion` → nur statische Zustände, Budget ≤ 1 Layout-Änderung pro Turn.
9. **Schnittstelle:** `createGenome({ seed })`, `genome.evolve(turnSignal) → { css, vars, summary }`, `mountGenome({ store, root })` hängt sich an `RESPONSE_END` (eine Veränderung pro Nachricht bleibt), `?turns=N&seed=S` simuliert N Turns sofort, `window.__agentfaehig.genome` für Debug.
10. **Evaluation:** Replay der 13 Pathways mit `?turns`: Distanz zwischen Turn 5 und 25 muss deutlich > Distanz zwischen Turn 1 und 5 · Faktor sein (kein Stillstand); zwei Pathways → messbar verschiedene Endzustände.
