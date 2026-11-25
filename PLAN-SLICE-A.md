# PLAN — Slice A: Expliziter ruhiger `error`-Zustand (Living Surface)

- **Modus:** `DEGRADED` (ohne `hai-mcp` gemäß expliziter Owner-Freigabe „ohne hai mcp arbeiten !“)
- **Write-Root:** `/Users/samuelfleig/Projects/03_HAI/Agentfaehig/Agent`
- **Quelle:** `docs/Ai-Avatare-usefull.md` (§10 A) & `UPSTREAM_SEARCH.md` (Decision: `ADAPT`)

## 1. Goal
Führe einen echten, ruhigen Fehlerzustand (`error`) durch Gesprächszustand (`store.js`), Augenprojektion (`presence.js`, `eye-motion-profiles.js`) und Tests (`tests/store.test.js`, `tests/eye-motion.test.js`, `tests/remoteAgent.test.js`), damit die Living Surface nach einem fehlgeschlagenen Agentenaufruf nicht irreführend normalen Leerlauf (`idle`) anzeigt.

## 2. Non-Goal
- Keine Umsetzung der Abschnitte B–F aus `docs/Ai-Avatare-usefull.md`.
- Kein neues Avatar-Modul, kein zweiter Gesprächs-State, kein visueller Umbau.
- Kein `background`-Zustand, keine Emotionsanalyse, keine neuen Modalitäten.
- Keine neuen Dependencies, Provider, Config-Keys oder API-Änderungen.
- Kein Commit, Push, Deploy und keine externe Nachricht.
- Keine Änderung an `docs/AI_Avatare`, `docs/Ai-Avatare-usefull.md`, `src/vendor/`, `src/conversation/conversation.js` oder bestehenden ungetrackten Dateien anderer Sessions.

## 3. Boundaries (einzige freigegebene Code- und Testpfade)
- `src/state/store.js`
- `src/presence/eye-motion-profiles.js`
- `src/presence/presence.js`
- `tests/store.test.js`
- `tests/eye-motion.test.js`
- `tests/remoteAgent.test.js`

(`src/conversation/conversation.js` bleibt unverändert, da die Ist-Analyse bestätigt hat, dass Fehlertext `"I can't answer right now. Try again in a bit."`, `aria-busy="false"`, `aria-live="polite"` auf `#live`, `RESPONSE_ERROR`-Dispatch mit Turn-Check und Wiedereinstieg über `INPUT`/`SUBMIT` bereits vollständig korrekt implementiert sind.)

## 4. Ist-Analyse & technische Umsetzung je Datei

### 4.1 `src/state/store.js`
- `PHASES`: `'error'` ergänzen → `Object.freeze(['dormant', 'idle', 'listening', 'thinking', 'speaking', 'error'])`.
- `case 'RESPONSE_ERROR'`: Turn- **und** Phase-Guard prüfen:
  ```js
  case 'RESPONSE_ERROR':
    if (event.turn !== state.turn || (state.phase !== 'thinking' && state.phase !== 'speaking')) return state;
    return { ...state, phase: 'error' };
  ```
  - Stale Turns (`event.turn !== state.turn`) und Nicht-Antwortphasen (`dormant`, `idle`, `listening`, `error`) verändern den Zustand nicht.
- `case 'INPUT'`:
  - `if (state.phase === 'thinking' || state.phase === 'speaking') return state;`
  - Falls `state.phase === 'error'` und `!(event.value && event.value.length > 0)`: in `'error'` bleiben (`return state`), damit Löschen eines bereits leeren Felds nicht still nach `idle` kippt.
  - Bei nicht-leerem Wert (`event.value.length > 0`) wechselt `error` → `listening`.
- `case 'SUBMIT'`: bestehende Logik bleibt unverändert und führt aus `error` (und `listening`) mit `prompt.trim()` direkt in `thinking` (`turn + 1`, `answer: ''`, `dev: false`).

### 4.2 `src/presence/eye-motion-profiles.js`
- `'error'` in `EYE_STATES` ergänzen (9 kanonische Zustände).
- Ruhiges, neutrales, symmetrisches `error`-Profil in `EYE_STATE_PROFILES` innerhalb `EYE_MOTION_LIMITS` hinzufügen (kein trauriges Gesicht, kein aggressives Rot, keine hektische Bewegung):
  - `offsetX: 0`, `offsetY: 0.06`
  - `spread: 0.94`, `scale: 0.97`
  - `asymmetry: 0`, `asymmetryBias: 0`
  - `intensity: 0.35`, `damping: 0.14`
  - `driftAmpX: 0.03`, `driftAmpY: 0.02`, `driftFreq: 0.08`
  - `spreadBreathAmp: 0.012`, `scaleBreathAmp: 0.008`
  - `microShiftIntervalMs: Object.freeze([4800, 8200])`, `microShiftAmpX: 0.06`, `microShiftAmpY: 0.04`
  - `pointerFollow: 0.12`, `focusCenterPull: 0.2`, `eyeFollowRatio: 0.14`
  - `pupilBiasX: 0`, `pupilBiasY: 0.12`, `pupilDilation: 0.88`
  - `lidTopPct: 6`, `lidBottomPct: 3`, `lidAsymmetryPct: 0`
  - `blinkMinMs: 3600`, `blinkMaxMs: 6800`, `doubleBlinkChance: 0.04`
- Alle 30 Schema-Felder vorhanden; Signaturen bleiben eindeutig gegenüber `dormant`, `idle`, `present`, `listening`, `thinking`, `responding`, `adapting`, auch unter `reducedMotion: true` (durch unskalierte Felder `spread`, `scale`, `pupilBiasY`, `pupilDilation`, `lidTopPct`, `lidBottomPct`).

### 4.3 `src/presence/presence.js`
- In `PHASE_MOOD`: `error: 'neutral'` ergänzen (Vendor-`VALID_MOODS`-kompatibel).
- In `applyPhase(nextPhase, prevPhase)`: vor dem `idle`-Fallback expliziten Zweig ergänzen:
  ```js
  if (phase === 'error') {
    applyEngineState('error');
    return;
  }
  ```
- Wirkung:
  - Setzt `root.dataset.phase = 'error'` und `root.dataset.eyeState = 'error'`.
  - Deaktiviert `idle.js` automatisch (`state.phase !== 'idle'`), sodass keine Wartetimer oder `.is-waiting-*`-Klassen im Fehlerzustand laufen.
  - Bei `reducedPref === true` ruft `applyEngineState('error')` direkt synchron `renderFrame(engine.settle())` auf (statischer Fehlerzustand ohne Animation).
  - Bei anschließendem `INPUT` (`listening`) oder `SUBMIT` (`thinking`) greifen die regulären `applyPhase`-Zweige für den kontrollierten Wiedereinstieg.

### 4.4 Tests (`tests/store.test.js`, `tests/eye-motion.test.js`, `tests/remoteAgent.test.js`)
- `tests/store.test.js`:
  - `PHASES` enthält `'error'`; `AWAKE` ignoriert `'error'`.
  - `RESPONSE_ERROR` aus `thinking` und `speaking` → `phase === 'error'` für aktuellen Turn.
  - Stale `RESPONSE_ERROR` (`turn !== state.turn`) und `RESPONSE_ERROR` außerhalb `thinking`/`speaking` (z. B. `dormant`, `idle`, `listening`, `error`) verändern `state` nicht.
  - Wiedereinstieg aus `error`: `INPUT` mit `''` bleibt `error`; `INPUT` mit nicht-leerem Text → `listening`; `SUBMIT` aus `error` (und nach `INPUT`) → `thinking` mit `turn + 1` und leerer `answer`; späte `RESPONSE_*` im Zustand `error` werden ignoriert.
- `tests/eye-motion.test.js`:
  - `EYE_STATES` enthält `'error'` (9 Zustände); `all states produce distinct resting/settled motion characteristics` bleibt grün.
  - Dedizierter `error`-Test: symmetrisch/ruhig (`asymmetry === 0`, `lidAsymmetryPct === 0`, geringere Auslenkung als `idle`), unterscheidbar von `idle` & `present` im Normalbetrieb und bei `reducedMotion: true`, sowie statisch über 180 Steps bei `reducedMotion: true`.
  - `PHASE_MOOD.error === 'neutral'` und Integrations-Test für `mountPresence` mit minimalem DOM-Stub: `thinking` → `RESPONSE_ERROR` → `error` (`data-phase="error"`, `data-eye-state="error"`) → `INPUT` → `listening` → `SUBMIT` → `thinking`, sowie statisches Settlement bei `reducedMotion: true`.
- `tests/remoteAgent.test.js`:
  - Test für Fehlerfluss `createRemoteAgent` (HTTP 503) → `store.dispatch({ type: 'RESPONSE_ERROR', turn })` → `phase === 'error'`, stale Turn unverändert, `AbortError` erzeugt keinen `error`-Zustand, gefolgt vom Wiedereinstieg via `INPUT`/`SUBMIT`.

## 5. DoD & Verifikation
1. Gezielte Tests: `node --test tests/store.test.js tests/eye-motion.test.js tests/remoteAgent.test.js` → alle grün.
2. Gesamte Node-Testsuite: `node --test tests/*.test.js deploy/agentfaehig-site/test/*.test.mjs` → alle grün.
3. `npm test` und `bash scripts/validate.sh` → Baseline-Differenz prüfen (einzig bestehender Fehler darf `keine Dateiendung: docs/AI_Avatare` sein; 0 neue Fehler).
4. `git diff --check` → Exit `0`; `git status --short` → nur die freigegebenen Dateien geändert (+ Gate-Artefakte im Write-Root).
5. Kontrollierter Browser-Smoke-Lauf (Playwright gegen lokalen Dev-Server, ohne neue Installation/Freigabe): simulierter Providerfehler über `window.__agentfaehig.setAgent`, Prüfung von `#stage[data-phase="error"]`, `#presence[data-eye-state="error"]`, sichtbarem Fehlertext + `#live`, Reduced Motion und Wiedereinstieg via Input/Submit.

## 6. Stop-Kriterium
Stopp und Meldung (`BLOCKED`), falls Plan-Council unter Threshold (`< 0.75`) oder `NO_JUDGMENT` liefert, Plan-Validator nicht `ACCEPT` erteilt, fremde Dateien überschrieben werden müssten oder neue Test-/Validierungsfehler auftreten.
