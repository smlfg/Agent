HAI-Mission M-20261119T220518-4585e9fd, Lease S-20261119T220524-ff2cce7b (Integrator Claude Code). Du bist Implementierungs-Agent. Lies ZUERST docs/missions/M-20261119T220518-4585e9fd-M1-CONTRACT.md und halte dich exakt an die Schnittstellen.
Regeln: Plain ES modules + CSS, kein Framework, keine npm-Installation, kein Netzwerk. Ändere AUSSCHLIESSLICH die unten genannten Dateien. Keine Dokumente schreiben, nur Code. Keine Vendor-Dateien ändern. Englische UI-Texte. Kein git.

ROLLE: AGENT A — PRESENCE
DATEIEN (nur diese anlegen/ändern): src/presence/presence.js, src/styles/presence.css
AUFGABE: Implementiere mountPresence({root, store, reducedMotion}) → {pause, resume, destroy} laut Vertrag Abschnitt "A — Presence".
- EyeFace standalone nutzen: import { EyeFace } from '../vendor/openvoiceui/face/EyeFace.js'; face.init(root.querySelector('.face-box')).
- EyeFace startet eigene Timer + mousemove in init(). Für pause(): face.destroy() (räumt Timer/Listener ab, ändert keine DOM-Struktur); resume(): neue EyeFace-Instanz init + aktuelle Mood setzen. Bei reducedMotion: EyeFace NICHT init'en, nur Mood-Klassen direkt setzen (VALID_MOODS aus BaseFace.js) und statisch offene Augen.
- Phase→Mood laut Vertrag via store.subscribe; dormant = Klasse .is-dormant auf root: Lider geschlossen (eyelid-top nach unten), opacity ~0.55. Übergang zu idle: Lider öffnen sich über ~1.2 s (transition auf .eyelid-top/.eyelid-bottom, nur ohne reducedMotion).
- #motion-toggle (document.getElementById) verdrahten: aria-pressed, Text "Pause motion"/"Resume motion". Bei reducedMotion trotzdem bedienbar (no-op-sicher).
- presence.css: Positionierung der Augen im oberen Drittel, ruhig; Farben über bestehende CSS-Variablen aus src/styles/base.css; dezente Atmung im idle (transform scale ≤1.02, 6 s), aus bei reducedMotion und bei .is-motion-paused auf root; @media (prefers-reduced-motion: reduce) alle transitions/animations in .presence aus. Motion-Toggle-Button: klein, unten links, gut fokussierbar.
VERIFIKATION: node --check src/presence/presence.js; Datei importiert nur relative Pfade, die existieren.
STOP nach Umsetzung. Antworte mit: geänderte Dateien + 5 Zeilen Zusammenfassung.
