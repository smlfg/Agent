HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Projekt agentfähig: eine Website, die sich wie ein Agent verhält. Zwei Augen (src/vendor/openvoiceui/face/EyeFace.js über src/presence/presence.js) zeigen Präsenz. Der Agent spricht nie von sich aus; der Besucher spricht zuerst. Plain ES modules + CSS, kein Framework, kein Build, keine npm-Installation, kein git. Vendor-Dateien und src/presence/presence.js NICHT ändern (ein anderer Agent arbeitet dort).

ROLLE: AGENT R — WARTE-VERHALTEN DER AUGEN IN STILLE
OWNER-ENTSCHEIDUNG 2: "Die Augen sollen so wirken, als würde die Seite warten — einen wartenden Eindruck, dass der User etwas tun soll." Nicht einschlafen, nicht schläfrig, nicht drängen oder betteln — erwartungsvoll, aufmerksam, einladend.
LIES: src/state/store.js (phase idle = wach und still), src/main.js, src/presence/presence.js (nur lesen), src/styles/presence.css, src/living-surface.html, docs/wireframes/02-components.md (C-02 EyePresence Regeln: kein erzwungener Blickkontakt, keine Bedeutung nur über Augen, WCAG 2.2.2).
DATEIEN (nur diese anlegen): src/presence/idle.js, src/styles/idle.css (per JS als <link> einfügen), tests/idle.test.js.
SCHNITTSTELLE: export function mountIdle({ store, root /* #presence */, composer /* #composer-input */, reducedMotion, now }) → { destroy() }
- Aktiv nur in phase 'idle' ohne Tippen/Mausbewegung; jede Eingabe, Mausbewegung, Fokus oder SUBMIT setzt sofort zurück (Augen sind dann sofort voll da).
- Blick steuerst du NICHT direkt, sondern über das bestehende Blick-Protokoll: document.dispatchEvent(new CustomEvent('agentfaehig:gaze', { detail: { x, y, source: 'idle', intensity } })) und { source: 'release' } zum Freigeben (der Integrator verbindet das Event mit den Pupillen). Ziele: Besucher (Bildschirmmitte, leicht unterhalb der Augen) und das Eingabefeld (getBoundingClientRect von composer).
- Stufen (Zeitkonstanten exportieren, gern verfeinern): 0–8 s ruhig nach vorn; ab ~8 s gelegentlich ein erwartungsvoller Blick zum Eingabefeld und zurück zum Besucher ("du kannst hier schreiben"); ab ~25 s etwas häufiger, mit kurzem Verweilen auf dem Feld, leichte Pupillenweitung und minimal gehobene Lider (Neugier, Klassen auf root: is-waiting-1, is-waiting-2, is-waiting-3 → idle.css); ab ~60 s ein seltener, sanfter "Nachfrage"-Impuls (z. B. Augen weiten sich 400 ms und Blick springt einmal zum Feld), höchstens alle 20–30 s, niemals schneller werdend; nie schließen, nie schläfrig.
- Zufall deterministisch (seeded PRNG, injizierbar) für Tests.
- reducedMotion oder Motion-Pause (root hat Klasse is-motion-paused): keine Bewegungsimpulse; nur statischer Zustand is-waiting-1 und ein ruhiger Blick zum Eingabefeld.
- idle.css: nur transform/opacity auf .eye-white/.pupil/.eyelid-* via .presence.is-waiting-N; prefers-reduced-motion respektieren.
- Reine Logik testen: export function planIdle(elapsedMs, rng) → { stage, action } und tests/idle.test.js (Stufen nach Zeit, Reset, Impuls-Frequenz nie unter 20 s, Determinismus).
Das Mounten in src/main.js macht der Integrator.
VERIFIKATION: node --check src/presence/idle.js; node --test tests/*.test.js grün. STOP danach; antworte mit 6 Zeilen zum Verhalten.
