DONE — Agent X, Voice-Knopf.
Dateien: `src/living-surface.html` (nur `#mic-toggle` im `<form id="composer">`, bestehende ids unverändert), neu `src/voice/mic.js`, `src/styles/mic.css`, `tests/mic.test.js`; `main.js` unangetastet (Mount macht der Integrator).
Verhalten: Button nur bei vorhandener API sichtbar, Klick = Aufnahme (`en-US`, interim), gedämpftes Teiltranskript feuert `input`, final bleibt im Feld + Fokus, kein Auto-Send; zweiter Klick/Esc stoppen; Fehler kurz + einmaliger Hinweis in `#live`; Consent-Zeile 6 s beim ersten Klick; `agentfaehig:mic` mit `listening|idle|error`.
Verifikation: `node --check src/voice/mic.js` und `tests/mic.test.js` ok; `node --test tests/*.test.js` = 147/147 grün (davon 13 neue).
`bash scripts/validate.sh` scheitert nur an `scripts/check-names.sh` (`git ls-files` in Nicht-Git-Repo), nicht an diesen Änderungen.
