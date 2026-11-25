Geänderte Dateien:
- `src/styles/conversation.css`
- `src/living-surface.html` (nur `<form id="composer">`-Inhalt)

Rahmenlose Schreibfläche: weiche, an den Enden auslaufende Linie unter dem Feld, die im Fokus zu einer 2px-Linie in `--focus-ring` verdichtet und warm aufleuchtet; `var(--font-reading)`, `caret-color: var(--accent)`, kein Placeholder-Ton (nur „…“).
Senden ist ein dezenter SVG-Pfeil (`aria-label="Send"`, sr-only-Text), gedämpft wenn leer, deutlicher bei Inhalt/Fokus, immer fokussierbar; `:focus-visible`-Ring bleibt für WCAG erhalten.
Mobile ≥16px, safe-area, sticky unten; `prefers-contrast: more` hebt Linie/Button an, `prefers-reduced-motion` schaltet alle Übergänge ab.
Verifikation: `node --test tests/*.test.js` → 41/41 grün. `scripts/validate.sh` bricht nur im git-Schritt ab (diese Kopie ist kein Git-Repo), nicht wegen der Änderung.
