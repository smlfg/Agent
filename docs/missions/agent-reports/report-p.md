1. `mountGaze` misst das Caret einmal pro Ereignis über ein wiederverwendetes Mirror-Element (Muster aus component/textarea-caret-position, MIT im Dateikopf; `scrollLeft` abgezogen) und sendet `agentfaehig:gaze` mit `{x, y, source:'caret', intensity}`.
2. Antizipation: Vorlauf von 2–30 px in Schreibrichtung, proportional zur geglätteten Tippgeschwindigkeit; Glättung per Lerp ausschließlich im `requestAnimationFrame`.
3. Nach 360 ms Tipppause liest der Blick zur Mitte des Geschriebenen zurück; Backspace blickt 14 px nach links; ab 8 Wörtern gibt es alle 2,6 s einen kurzen 280-ms-Blick an den Textanfang.
4. Nach 1,5 s ohne Tippen oder bei `blur` folgt `{source:'release'}`; `intensity` steigt mit der Wortzahl (`Wörter/24`, gedeckelt auf 0..1).
5. `reducedMotion` liefert nur statische Caret-Positionen, höchstens 1×/s, ohne Glättung und ohne Rücksprünge; alle Zeitkonstanten sind exportiert, `planGaze(state, input)` ist DOM-frei und deterministisch.
6. Verifikation: `node --check src/presence/gaze.js` ok, `node --test tests/*.test.js` 65/65 grün; `validate.sh`-Scaffold ok, nur der git-basierte Namenscheck scheitert erwartungsgemäß, weil dieses Projekt kein Git-Repo ist. DONE.
