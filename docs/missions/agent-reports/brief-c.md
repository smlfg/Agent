HAI-Mission M-20261119T220518-4585e9fd, Lease S-20261119T220524-ff2cce7b (Integrator Claude Code). Du bist Implementierungs-Agent. Lies ZUERST docs/missions/M-20261119T220518-4585e9fd-M1-CONTRACT.md und halte dich exakt an die Schnittstellen.
Regeln: Plain ES modules + CSS, kein Framework, keine npm-Installation, kein Netzwerk. Ändere AUSSCHLIESSLICH die unten genannten Dateien. Keine Dokumente schreiben, nur Code. Keine Vendor-Dateien ändern. Englische UI-Texte. Kein git.

ROLLE: AGENT C — UI QUALITY (Tests)
DATEIEN (nur diese anlegen/ändern): tests/store.test.js, tests/devAgent.test.js, tests/typewriter.test.js, tests/markup.test.js
AUFGABE: Tests mit node:test + node:assert/strict gegen den Vertrag (Abschnitt "C — UI Quality"). Die Implementierung von src/conversation/typewriter.js existiert in deiner Kopie noch NICHT — schreibe die Typewriter-Tests rein gegen die Schnittstelle im Vertrag:
createTypewriter({ text, wordDelayMs, reducedMotion, schedule, cancel, onUpdate, onDone }) → { start, stop }; wortweise inkl. Whitespace; letzter onUpdate === text; reducedMotion synchron; stop() ohne onDone, idempotent; leerer Text → onUpdate('') + onDone(). Nutze einen Fake-Scheduler (Queue von Callbacks), keine echten Timer.
- store.test.js: alle Übergänge aus src/state/store.js inkl. AWAKE nur aus dormant, INPUT leer/nicht leer, INPUT ignoriert während thinking/speaking, SUBMIT leer ignoriert, SUBMIT unterbricht speaking (turn+1, answer leer), veraltete RESPONSE_* (falscher turn) ignoriert, createStore subscribe/unsubscribe, keine Benachrichtigung ohne Zustandsänderung.
- devAgent.test.js: pickResponse deterministisch und string; respond mit delayMs:0 liefert {text, dev:true}; Abort vor und während → AbortError.
- markup.test.js: src/index.html als Text lesen (fs) und mit Regex prüfen: html lang="en", <main, h1 mit class sr-only, label for="composer-input", id="presence" mit aria-hidden="true", aria-live="polite", id="motion-toggle", Skip-Link href="#composer-input", Elemente left-eye/right-eye/left-pupil-container/right-pupil-container, Lizenzdatei src/vendor/openvoiceui/LICENSE enthält "MIT License".
VERIFIKATION: node --test tests/store.test.js tests/devAgent.test.js tests/markup.test.js muss grün sein (typewriter.test.js darf in deiner Kopie wegen fehlender Implementierung fehlschlagen).
STOP nach Umsetzung. Antworte mit: geänderte Dateien + Testergebnis.
