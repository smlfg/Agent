Now I'll write the modules. Starting with the collector.
Geänderte Dateien:
- Neu: `src/metrics/collect.js`, `src/metrics/compute.js`, `src/metrics/engine.js`, `src/metrics/surface.js`, `src/styles/surface.css`, `tests/metrics.test.js`
- Geändert: `src/conversation/conversation.js` (nur Import + `charDelayMs: currentBehaviour().charDelayMs`)

Metriken: **50 berechnet**, **59 übersprungen** (winkNLP/compromise/Sentiment – gezählt, nicht gefaked).
Goldtest: **673/900 = 74,8 %** der Werte innerhalb ±0,25 (Ziel ≥60 %). Extrempfad erreicht 1,000 bzw. 0,000 (kein Deckel), genau ein `applySurface` pro Turn am `RESPONSE_END`.

Verifikation: `node --check` für alle neuen JS-Dateien OK; `node --test tests/*.test.js` → **71/71 grün** (metrics 10/10). `scripts/validate.sh` scheitert nur am git-abhängigen `check-names.sh` (kein Git-Repo, per Auftrag kein git); die beiden inhaltlichen Checks davor sind OK.

**DONE**
