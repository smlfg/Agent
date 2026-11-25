# Verhaltenstests

Die Suite enthält echte Node-Verhaltenstests für Gesprächszustand, Typewriter,
Provider-Fallbacks, Augenbewegung, adaptive Oberfläche, räumliche Tiefe,
Metriken, Mikrofon und Worker-Verhalten.

## Ausführen

```bash
npm test
```

Das Kommando führt zuerst `bash scripts/validate.sh` und danach die Node-Tests
aus. Bei laufender Gesamtprüfung ohne den Strukturcheck:

```bash
node --test tests/*.test.js deploy/agentfaehig-site/test/*.test.mjs
```

Verifizierter Reality-Sync-Stand 25.11.2026:

- **279/279 Node-Tests bestanden** auf dem integrierten Spatial-/Error-HEAD.
- **43/43 gezielte Slice-A-Tests bestanden** mit
  `node --test tests/store.test.js tests/eye-motion.test.js tests/remoteAgent.test.js`.
- `tests/spatial-depth-browser.py` lief lokal erfolgreich für Default-Desktop,
  Bones-Desktop, Mobile und Reduced Motion.

Für Browserprüfungen wird Python Playwright samt Chromium/Chrome benötigt. Der
Vorfall mit anfänglich fehlendem Playwright-Browser wurde in diesem Lauf durch
den vorhandenen systeminstallierten Chrome gelöst; es wurde kein Paket
installiert.

## Abgrenzung

Diese Suite ersetzt weder den separaten Voice-Latenzmesslauf noch Fremdtests.
Voice-20-Turn-Messung und Fremdtest wurden im Reality Sync **nicht ausgeführt**
und gelten nicht als bestanden. Die öffentliche UI wurde separat mit einer
echten, sichtbar nicht als `DEV DATA` markierten Agentenantwort geprüft.
