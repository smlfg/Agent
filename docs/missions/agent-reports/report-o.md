Geänderte Dateien: `src/dev/replay.js`, `src/styles/replay.css`, `tests/replay.test.js`.
Bedienung: Seite mit `?replay` öffnen, Pathway im Panel wählen, `Play`/`Pause`, `Next turn`, `Restart`, Speed `0.5×–4×`, `Auto-advance`.
Taste `R` blendet das Panel ein/aus (nicht während der Eingabe im Composer); das Panel zeigt 12 Parameterbalken, Surface-Notiz, Outcome und Lesson.
Verifiziert: `node --check src/dev/replay.js` ok, `node --test tests/*.test.js` 59/59 grün, zusätzlich Headless-Chrome-Smoke (Playback bis Finished, Pause stoppt Timer, Restart/Ende setzt Agent und CSS-Variablen zurück, keine Konsolenfehler).
Hinweis: `scripts/validate.sh` bricht nur im git-abhängigen `check-names.sh` ab, weil dieser Worktree kein Git-Repo ist; die geforderten Prüfungen sind grün.
