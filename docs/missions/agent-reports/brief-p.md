HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Projekt agentfähig: eine Website, die sich wie ein Agent verhält; zwei Augen (src/vendor/openvoiceui/face/EyeFace.js, eingebunden über src/presence/presence.js) folgen heute der Maus. Plain ES modules, kein Framework, kein Build, keine npm-Installation, kein git. Vendor-Dateien NICHT ändern.

ROLLE: AGENT P — AUGEN FOLGEN DEM SCHREIB-CURSOR
OWNER: "Die Eyes sollen den Fortschritt des Cursors beobachten. Wenn ich lange oder viele Wörter schreibe, sollen sie antizipierend schauen."
UPSTREAM-FIRST: Caret-Pixelposition in input/textarea mit dem bekannten Mirror-Element-Muster (component/textarea-caret-position, MIT) — als Muster übernehmen, Quelle + Lizenz im Dateikopf nennen; nichts herunterladen.
DATEIEN (nur diese anlegen): src/presence/gaze.js, tests/gaze.test.js.
SCHNITTSTELLE:
export function mountGaze({ input, reducedMotion = false, now = () => performance.now() }) → { destroy() }
- Beobachtet input/keydown/selectionchange/focus/blur am Eingabefeld (#composer-input, ein einzeiliges <input type="text">, das bei langem Text horizontal scrollt — scrollLeft berücksichtigen).
- Berechnet die Bildschirmposition des Carets (x, y in clientX/clientY-Koordinaten) und sendet sie als CustomEvent auf document: new CustomEvent('agentfaehig:gaze', { detail: { x, y, source: 'caret', intensity } }). Bei blur oder 1.5 s ohne Tippen: detail { source: 'release' } (Augen dürfen wieder der Maus folgen).
- ANTIZIPATION (das eigentliche Feature, gern detailliert): Blick leicht VOR dem Caret in Schreibrichtung (Vorlauf proportional zur Tippgeschwindigkeit, gedeckelt); bei schnellem Tippen ruhiger, glatter Blick (Glättung/Lerp), bei Pausen kurz zurück zum Wortanfang oder zur Mitte des Geschriebenen ("liest mit"); bei Backspace ein kleiner Rückblick nach links; ab ~8 Wörtern gelegentliche kurze Rücksprünge an den Anfang (Überblick), intensity steigt mit Textlänge (0..1) — Augen dürfen sich darüber später weiten. Alle Zeitkonstanten als exportierte Konstanten.
- Nur requestAnimationFrame für Glättung, keine Layout-Thrash: Mirror-Element einmal anlegen, wiederverwenden.
- reducedMotion: keine Glättung/keine Rücksprünge, nur gelegentliche statische Positionen (max. 1×/s).
- Reine Logik testbar machen: export function planGaze(state, input) → { x, y, intensity } o. ä. ohne DOM; tests/gaze.test.js prüft Vorlauf in Schreibrichtung, Backspace-Rückblick, release nach Pause, intensity-Anstieg, Determinismus.
HINWEIS: Das Anbinden an die Augen (Event 'agentfaehig:gaze' → Pupillen) und das Mounten in src/main.js macht der Integrator; du lieferst nur gaze.js + Tests.
VERIFIKATION: node --check src/presence/gaze.js; node --test tests/*.test.js grün. STOP danach, antworte mit 6 Zeilen zum Verhalten.
