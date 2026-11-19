I'll start by reading the mission docs and source files.
Now I'll write the four files.
Angelegt: `src/agent/style.js`, `src/agent/prompt.js`, `src/dev/styledDevAgent.js`, `tests/style.test.js`. `node --check` sauber, `node --test tests/*.test.js` grün (153/153).

Lenk-Hebel der geschriebenen Sprache:

- **targetWords** — `tempo` zieht die Obergrenze, `density`/`depth` geben Raum, `attention` nimmt ihn weg; schneller = kürzer (`style.js:57`).
- **sentences** — dieselbe Längenpressung in Sätzen; hohes Tempo fällt auf ein bis zwei Sätze zusammen.
- **questionAllowed** — nur `openness ≥ 0.66` erlaubt, und dann höchstens eine Frage am Ende.
- **register** — `formality` schaltet casual (< 0.34), neutral, formal (≥ 0.67).
- **warmthMarkers** — `warmth` wählt 0–3 kurze Zuwendungen („I hear you“, „No rush“).
- **hedging** — `certainty` invertiert plus `calm`: unsicher erlaubt „maybe/I think“, sicher spricht geradeaus.
- **punctuation** — `formality` steuert Kontraktionen/Semikola, `calm` Ellipse, `energy`+`playfulness` höchstens ein Ausrufezeichen; nie Emoji.
- **vocabulary** — `depth`+`formality` wählen konkret/alltäglich/präzise, ohne Marketingbehauptungen.
- **rhythm** — `tempo`+`energy` ergeben „short bursts“, „even“ oder „one thought per line“.
- **mirror** — `closeness`+`attention` entscheiden, ob Besucherwörter gar nicht, leicht oder direkt gespiegelt werden.
- Zusätzlich im Prompt: Identität, harte Regeln, Marketing-Regeln aus `persona`, Wissensgrenze, Sicherheitsblock; `buildMessages` hält nur das aktuelle Paar und versteckt eine kurze Sitzungszusammenfassung im System-Prompt.
