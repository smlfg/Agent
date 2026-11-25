Now implementing. First the typewriter:
Geänderte Dateien:
- `src/conversation/typewriter.js` — `finishSentence({maxChars,maxMs}) → Promise<'finished'|'cut'>` plus pure Helfer `findSentenceRest`, `findWordEnd`, `planFinishSentence`; bestehende `start`/`stop`-Schnittstelle unverändert.
- `src/conversation/conversation.js` — Unterbrechungslogik: Quittung, Satz fertig tippen bzw. Wort + „…“, neuer Turn sofort raus, altes Paar erst danach `dissolve`; Fehlerpfad unberührt.
- `src/styles/ack.css` — neues per JS als `<link>` eingefügtes CSS für einmaliges Blinzeln und minimales Vorwandern der Pupillen.
- `tests/typewriter.test.js` — Finish-Sentence-Fälle (finished, cut, maxChars, maxMs-Deckel, reducedMotion, Idempotenz).
- `tests/interrupt.test.js` — reine Logiktests für Satz-Rest, Wortende, cut vs finished, Grenze 40 und 500-ms-Deckel.

Verifikation: `node --check` für alle geänderten JS-Dateien OK; `node --test tests/*.test.js` → 105 Tests, 105 pass, 0 fail.
Hinweis: `scripts/validate.sh` bricht nur am fehlenden Git-Repo (`git ls-files`), nicht an Inhalten; der Auftrag verlangt kein Git.
