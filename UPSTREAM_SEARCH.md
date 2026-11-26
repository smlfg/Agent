# UPSTREAM_SEARCH

## Need
Der Living-Surface-Gesprächs-Store und die parametrische Augenprojektion benötigen einen expliziten, ruhigen `error`-Zustand mit kontrolliertem Wiedereinstieg (inkl. Reduced Motion und `aria-live`), damit fehlgeschlagene Antworten nicht sofort als normales `idle` dargestellt werden.

## Slice / Mission
- mission_id: DEGRADED (ohne `hai-mcp`, explizite Owner-Freigabe „ohne hai mcp arbeiten!“)
- slice: Slice A — Expliziter ruhiger `error`-Zustand im Gesprächs-Store und Projektion auf kanonischen Augenzustand (Bezug: `docs/Ai-Avatare-usefull.md` §10 A)
- write_root: `/Users/samuelfleig/Projects/03_HAI/Agentfaehig/Agent`
- stand: 2026-11-25
- gate_contract: `/Users/samuelfleig/Projects/03_HAI/docs/UPSTREAM_FIRST_GATE.md`

## Candidates (≥3)

### 1. Bestehende interne Living-Surface-Architektur (`store.js` + `eye-motion-profiles.js` + `presence.js`)
- url: `src/state/store.js`, `src/presence/eye-motion-profiles.js`, `src/presence/presence.js` (lokales Repository, Zero-Build Vanilla ES Modules)
- license_or_note: MIT (Eigenbestand in `package.json`, null Runtime-Dependencies, kein Bundler)
- dock_idea: Direkte Erweiterung des bestehenden 74-Zeilen-Pure-Reducers (`PHASES` + `RESPONSE_ERROR -> 'error'`), Ergänzung genau eines Datenprofils im einheitlichen 30-Feld-Schema von `EYE_STATE_PROFILES` (`EYE_STATES` + ruhiges `error`-Profil innerhalb `EYE_MOTION_LIMITS`) sowie Projektion in `applyPhase()` + `PHASE_MOOD` (`error: 'neutral'`) in `presence.js`.
- verdict: use (ADAPT)
- reason: Alle benötigten Mechanismen — Turn-Guard gegen späte Events, automatischer Wiedereinstieg via `INPUT`/`SUBMIT`, deterministische Reduced-Motion-Ruhelage (`engine.settle()`), Pause-Toggle (WCAG 2.2.2) und einheitliches Verhaltensprofil-Schema ohne Sonderlogik — existieren bereits und sind getestet. Kein neues Modul und keine neue Dependency erforderlich.

### 2. Vendored OpenVoiceUI (`BaseFace.js` / `EyeFace.js`)
- url: https://github.com/MCERQUA/OpenVoiceUI (`@ efd921f576c4992d3714b2b2829abc356f338dd3`, lokal unter `src/vendor/openvoiceui/face/BaseFace.js` & `EyeFace.js`)
- license_or_note: MIT (`src/vendor/openvoiceui/LICENSE-openvoiceui.txt`; laut `THIRD_PARTY_NOTICES.md` und `src/presence/presence.js:4` bleiben Vendor-Dateien unverändert)
- dock_idea: `VALID_MOODS` aus `BaseFace.js` bleibt unverändert als Kompatibilitätskonstante importiert; `PHASE_MOOD` in `presence.js` bildet `error` auf `'neutral'` ab.
- verdict: reject als Error-State-Träger / REUSE unverändert als Vendor-Basis
- reason: `BaseFace.js` kennt ausschließlich `['neutral', 'happy', 'sad', 'angry', 'thinking', 'surprised', 'listening']` — keinen `error`-Zustand. `sad` oder `angry` widersprechen der Slice-A-Anforderung („kein trauriges Gesicht, kein aggressives Rot, keine hektische Animation“). Zudem besitzt `EyeFace.js` keine `prefers-reduced-motion`-Behandlung (vgl. `research/PRIOR_ART_REPORT.md` A5/E3) und koppelt global an `document.getElementById`. Vendor-Code bleibt unberührt.

### 3. XState v5 / `@xstate/store` (Stately Statecharts — `onError` & Recovery Pattern)
- url: https://github.com/statelyai/xstate · https://stately.ai/docs/lifecycle-and-errors
- license_or_note: MIT; `xstate` ~14–15 kB min+gzip (0 Runtime-Deps), `@xstate/store` <1 kB min+gzip; offizielle Statechart-Referenz für Fehler- und Recovery-Übergänge
- dock_idea: Entweder (a) npm-Installation + Umstellung von `src/state/store.js` auf XState-Actor-Machine (erfordert Bundler/Import-Map im bisherigen No-Build-Setup) oder (b) reine Übernahme des offiziellen Statechart-Musters (lokale Fehlerbehandlung per explizitem Zielzustand statt Absturz oder stillem Idle-Rückfall; definierter Recovery-Übergang bei neuer Nutzereingabe).
- verdict: reject als Runtime-Dependency / REUSE als Statechart-Muster
- reason: Der bestehende Store umfasst 74 Zeilen reines ESM ohne Build-Schritt; eine externe State-Machine-Bibliothek einzuführen wäre für genau eine zusätzliche Phase (`error`) unverhältnismäßiger Integrations- und Bundler-Aufwand. Das XState-Muster — expliziter, lokal abgefangener Fehlerzustand mit klarem Recovery-Pfad (`INPUT` → `listening`, `SUBMIT` → `thinking`) und Schutz vor veralteten Events (`turn !== state.turn`) — wird direkt im bestehenden Pure-Reducer übernommen.

### 4. W3C WAI-ARIA 1.2 Live Regions (`aria-live="polite"`, `aria-atomic="true"`, `role="status"` vs. `role="alert"`)
- url: https://www.w3.org/TR/wai-aria-1.2/ (Abschnitt `aria-live`, `aria-atomic`, Rollen `status` / `alert`)
- license_or_note: W3C Recommendation (W3C Document License; normativer Webstandard, keine Software-Dependency)
- dock_idea: Vorab im DOM gemountete Live-Region (`<div id="live" class="sr-only" aria-live="polite" aria-atomic="true"></div>` in `src/living-surface.html:81`) bei `RESPONSE_ERROR` mit verständlicher, ruhiger Fehlermeldung befüllen (`src/conversation/conversation.js:211-214`), statt ein unterbrechendes `role="alert"` (`aria-live="assertive"`) auszulösen.
- verdict: use (REUSE — bereits integriert)
- reason: W3C/MDN empfehlen `aria-live="polite"` + `aria-atomic="true"` auf einer beim Seitenstart vorhandenen Container-Node für nicht-kritische, ruhige Status-/Fehlerhinweise und warnen vor übermäßigem `assertive`. Genau dieses Muster ist in `src/living-surface.html:81` und `src/conversation/conversation.js:211-214` bereits aktiv; für Slice A sind dort 0 LOC Änderung nötig.

### 5. BoopFace (ehemals Agent Robot Avatar)
- url: https://github.com/CX-ArtLab/BoopFace
- license_or_note: MIT; leichtgewichtige SVG-Roboter-Avatar-Web-Component mit vordefinierten Zuständen (`idle`, `success`, `refuse`, `surprise`, `sleep`, `waiting`, `angry`, `love`)
- dock_idea: Einbindung als `<boop-face>`-Web-Component in `#presence` und Mapping von `error` auf `refuse`.
- verdict: reject
- reason: Ersetzt die vorhandene parametrische Augen-Engine (`eye-motion-engine.js` + `eye-motion-profiles.js`) durch eine fremde Roboter-SVG-Figur, bricht das bestehende visuelle und barrierefreie Design („reaktive Augen ohne Gesicht, soft and not scary“), führt eine neue externe Komponente ein und verletzt ADR-0003 („kein zweiter Augen-Baustein“; vgl. `research/PRIOR_ART_REPORT.md` C2).

## Decision
**ADAPT bestehender interner Architektur (`use` interner Bausteine `store.js` / `eye-motion-profiles.js` / `presence.js` + `REUSE` der offiziellen Muster XState-Error-Recovery & W3C-WAI-ARIA-1.2-Live-Region) — kein neues Modul, keine neue Runtime-Dependency.**

Es entsteht kein neues Feature-Modul und kein neuer Dienst, sondern minimaler Zustands- und Projektions-Glue innerhalb bestehender Dateien unterhalb des Gate-Standardbudgets von 80 LOC. Zur vollständigen Fail-Closed-Konformität mit `UPSTREAM_FIRST_GATE.md` sind sowohl `If use` als auch die Budget-/Zielpfad-Nachweise analog `If owner_exception` dokumentiert.

## If use
- install: `none` (bestehende Vanilla-ESM-Dateien im Repo; Vendor-Dateien unter `src/vendor/openvoiceui/` und `package.json` bleiben unverändert)
- stack_row: Keine neue Stack-Zeile erforderlich; bestehender Eintrag `OpenVoiceUI (MIT)` in `THIRD_PARTY_NOTICES.md` bleibt unverändert bestehen, ergänzt um Muster-Referenz W3C WAI-ARIA 1.2 + XState-Error-Recovery in Slice A.
- registry: `n/a` (DEGRADED-Run ohne `hai-mcp`; keine neue Komponente zu registrieren)
- smoke_evidence: Nach Umsetzung zu belegen durch `npm test` / `node --test tests/*.test.js deploy/agentfaehig-site/test/*.test.mjs`, `bash scripts/validate.sh` sowie explizite Nachweise in `tests/store.test.js`, `tests/eye-motion.test.js` und `tests/remoteAgent.test.js` (inkl. Reduced-Motion- und Wiedereinstiegs-Check).

## Glue-Budget & Zielpfade (analog `If owner_exception`, falls als Feature-Code gewertet)
- owner_ack_when: 2026-11-25 (Owner-Auftrag für Slice A aus `docs/Ai-Avatare-usefull.md` §10 A; kein neues Modul, keine neue Dependency)
- loc_budget: **≤ 60 LOC Produktiv-Glue** (Default-Gate-Obergrenze: ≤ 80 LOC; geschätzter Bedarf: **~41–50 LOC** verteilt auf 3 bestehende Dateien)
- target_path (alle unter Write-Root `/Users/samuelfleig/Projects/03_HAI/Agentfaehig/Agent`):
  - `src/state/store.js` (~4–8 LOC): `'error'` in `PHASES`; `RESPONSE_ERROR` → `{ ...state, phase: 'error' }` mit Turn- + Phase-Guard; `INPUT` behält bei leerem Wert `error`.
  - `src/presence/eye-motion-profiles.js` (~32–34 LOC): `'error'` in `EYE_STATES`; genau ein ruhiges, neutrales, symmetrisches 30-Feld-Profil `error` in `EYE_STATE_PROFILES` innerhalb `EYE_MOTION_LIMITS`.
  - `src/presence/presence.js` (~5–8 LOC): `error: 'neutral'` in `PHASE_MOOD`; expliziter `error`-Zweig in `applyPhase()` vor dem `idle`-Fallback.
  - `src/conversation/conversation.js` (0 LOC): Bestehende Fehlermeldung und `aria-live="polite"` bleiben unverändert erhalten.
  - Verifikation (außerhalb Produktiv-Glue): `tests/store.test.js`, `tests/eye-motion.test.js`, `tests/remoteAgent.test.js`.
- replace_later_with: Bei späterer Einführung komplexerer paralleler Sub-Agent- oder Duplex-Voice-Zustände (z. B. `background`, Barge-in, Multi-Actor-Orchestrierung) prüfbar gegen `@xstate/store` oder `xstate` v5 (MIT); für das aktuelle 6-Phasen-Text-Surface bleibt der Pure-Reducer optimal.
