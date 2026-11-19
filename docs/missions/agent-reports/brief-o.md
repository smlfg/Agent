HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Projekt agentfähig: eine Website, die sich wie ein Agent verhält. Plain ES modules + CSS, kein Framework, kein Build, keine npm-Installation, kein git. Englische UI-Texte.

ROLLE: AGENT O — REPLAY DER PERSONA-GESPRÄCHE (Entwicklungsfeature, nicht für Deployment)
OWNER: "Man soll die Persona-Conversations als Replay sehen können, um das Live-Verhalten der Seite upfront zu simulieren."
DATEN: src/dev/conversation-pathways.json (13 Pathways, je turns[]: user, typing{duration_ms, backspaces, pause_before_send_ms, interrupted_agent}, agent, params{12 Werte 0..1}, surface).
ANDOCKPUNKT (fertig, nicht ändern): src/main.js lädt bei URL-Parameter ?replay dynamisch src/dev/replay.js und ruft mountReplay({ stage, store, setAgent, reducedMotion }) auf. setAgent(agent) tauscht den Agenten, den die Konversation nutzt (Schnittstelle wie src/dev/devAgent.js: respond(prompt, {signal}) → Promise<{text, dev:true}>, Abort → AbortError); setAgent(null) stellt den Dev-Agenten wieder her. Lies src/conversation/conversation.js, src/state/store.js, src/living-surface.html, src/dev/devAgent.js.
DATEIEN (nur diese anlegen): src/dev/replay.js, src/styles/replay.css (per JS als <link> einfügen, NICHT in living-surface.html), tests/replay.test.js.
FUNKTION:
- Kleines, einklappbares Entwicklungs-Panel (unten rechts, deutlich als "REPLAY · DEV" markiert, halbtransparent, stört die Fläche nicht; per Taste "R" ein-/ausblenden).
- Auswahl eines Pathways (select mit title + persona), Buttons Play/Pause, Next turn, Restart, Geschwindigkeit (0.5×/1×/2×/4×), Checkbox "Auto-advance".
- Abspielen simuliert einen echten Besucher über die echte UI: Text Zeichen für Zeichen in #composer-input tippen (Dauer aus typing.duration_ms ÷ Speed, input-Events feuern, Backspaces simulieren: falsche Zeichen tippen und wieder löschen), pause_before_send_ms warten, dann das Formular absenden (requestSubmit). Bei interrupted_agent=true den nächsten Turn schon senden, während die vorige Antwort noch tippt.
- Ein Replay-Agent (über setAgent) liefert pro Turn genau den agent-Text aus dem Pathway (Wartezeit 500–900 ms ÷ Speed, Abort respektieren).
- Pro Turn: die 12 params als CSS-Variablen --p-<name> auf document.documentElement setzen (damit künftige Metrik-Styles reagieren) und im Panel als 12 schmale Balken zeigen; die surface-Notiz und outcome/design_lesson im Panel anzeigen.
- Nach Ende/Restart: setAgent(null), Variablen zurücksetzen.
- Echte Eingabe des Owners bleibt möglich; Pause stoppt sofort alle Timer.
- prefers-reduced-motion: Tippen trotzdem simulieren (ist Inhalt), Panel ohne Animationen.
- Exportiere reine Hilfsfunktionen für Tests (z. B. planTyping(text, {duration_ms, backspaces}, speed) → Liste von {action:'type'|'delete', char, delayMs}, deterministisch) und teste sie in tests/replay.test.js (Summe der Delays ≈ duration_ms/speed, Endtext = user-Text, Backspaces korrekt) sowie die JSON-Struktur aller Pathways (12 params je Turn im Bereich 0..1).
VERIFIKATION: node --check src/dev/replay.js; node --test tests/*.test.js grün. STOP danach, antworte mit geänderten Dateien + Bedienung in 5 Zeilen.
