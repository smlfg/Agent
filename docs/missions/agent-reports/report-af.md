I'll start by reading the project docs and my assigned files to understand the current state.
Now I have the full picture. Let me build the pure model first.
Now the stylesheet:
**DONE** — Agent AF „Die Antwort nimmt Form an“ ist implementiert.

**Neue Dateien**
- `src/answerform/model.js` — reine Logik: Sinneinheiten (Satz/Klausel), Besucher-Keywords, Typografie-Ableitung, Zeilen-Rag; keine DOM-/Netz-Abhängigkeit
- `src/answerform/render.js` — DOM-Schicht: Flow während des Tippens, Turn-End-Form, `<link>`-Injektion, Parameter aus `:root`
- `src/answerform/answerform.js` — `mountAnswerForm` (einziger Writer am `RESPONSE_END`)
- `src/styles/answer-form.css`
- `tests/answerform.test.js` (20 Tests)

**Geändert:** `src/conversation/conversation.js` nur Darstellung (Flow-View mit Sinneinheiten-Zeilen, Pair-Style beim Anlegen). Typewriter-, Unterbrechungs- und Fehlerlogik unverändert.

**Mount für den Integrator** (`src/main.js`, nach `mountMetrics(...)`):
```js
import { mountAnswerForm } from './answerform/answerform.js';
mountAnswerForm({ store, root: stage, reducedMotion });
```

**Wirkung:** depth → größere, weitere Zeilen + Einzug; energy → Gewicht; formality → Laufweite, Blocksatz, flacher Rag; playfulness → versetzte/leicht gedrehte Zeilen. Besucherwörter werden nur als Textknoten in Gewicht/Farbe/Unterstreichung hervorgehoben. Das Prompt-Echo bekommt eigene Ausrichtung, Größe, Kursivität, Neigung und einen Energiestrich. Form wird am Turn-Ende gesetzt (2 s weicher Übergang), beim Tippen nur ruhiger Fluss.

**Belege**
- `node --test tests/answerform.test.js`: 20/20; `node --test tests/*.test.js`: 251/251 grün.
- Browser (headless Chromium, eigener Server auf `:5183`, da `:5173` eine andere Worktree bediente): 4 Stimmungen geprüft, Antworttext identisch mit `#live`, Schrift 23,0–26,2 px, Gewicht 393–545, Blocksatz bei formal, Prompt rechts/kursiv bei nah/verspielt, Rag bis ±3,8 px.
- Kontrast gemessen: Antwort 9,86–13,66:1, Keywords 6,58–10,94:1, Prompt 4,81–6,9:1 → AA. Mobile 375 px ohne Überlauf, Blocksatz aus. Reduced Motion: 0 s Transitions, kein Caret, keine Key-Animation. Keine Konsolenfehler.
- `bash scripts/validate.sh` ist in diesem Checkout nicht lauffähig, weil `scripts/check-names.sh` `git ls-files` braucht und hier kein `.git` existiert — umgebungsbedingt, nicht durch diese Änderung.
