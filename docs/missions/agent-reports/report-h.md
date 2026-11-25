Now I understand the setup. Let me check the upstream/licence notes and remaining files, then implement.
Geänderte Dateien:
- `src/conversation/typewriter.js` — Char-Modus (Default), ~30 ms Basis mit seeded PRNG/Jitter, Pausen 140 ms (`; , :`) / 320 ms (`. ! ? …`, Zeilenumbruch), `unit: 'word'` unverändert, `random` injizierbar, `onUpdate(text, meta)` mit `state/delayMs`.
- `src/conversation/conversation.js` — nur Typewriter-/Caret-Anbindung: `span.tw-text` via `textContent` + `span.tw-caret` (aria-hidden), Blink-Klasse nur in Pausen, Fade/Entfernen 600 ms nach `onDone`, kein Caret bei Reduced Motion.
- `src/styles/typewriter.css` — Balken-Caret, `steps(1, end)`-Blinken nur bei `.is-pausing`, ruhig bei `.is-typing`, weiches Ausblenden, Reduced-Motion-Abschaltung.
- `tests/typewriter.test.js` — 17 Tests (Char-Reihenfolge/Präfixe, Grapheme, Jitter/`charDelayMs`, Satzzeichen-Pausen mit ms über Fake-Scheduler, Wortmodus wie bisher, reducedMotion, stop idempotent, Determinismus).

Testergebnis: `node --test tests/*.test.js` → **50/50 grün**. `npm test` scheitert nur an `scripts/check-names.sh`, weil dieser Scratch-Worktree keine Git-Metadaten hat (`git ls-files` → exit 128), nicht an den Änderungen.
