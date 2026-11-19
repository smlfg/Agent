HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). NUR LESEN: keine Datei ändern oder anlegen, kein git, keine Installation. Projekt agentfähig: eine Website, die sich wie ein Agent verhält; die UI soll sich aus Gesprächsmetriken verändern. Lies ZUERST docs/missions/M-20261119T220518-4585e9fd-METRIK-PARAMETER-VERTRAG.md (12 feste Parameter + JSON-Format) und halte dich exakt daran. Kontext: src/state/store.js, src/conversation/conversation.js. Rahmen: Englisch, nur Text, alles im Browser, Reload = Neustart, strikt Prompt/Response.
Lies zusätzlich src/living-surface.html, src/styles/*.css, src/presence/presence.js, src/conversation/typewriter.js, docs/adr/ADR-0004-regler-veraendert-oberflaeche-und-haltung.md.

ROLLE: AGENT J — SCHICHT 3: PARAMETER → OBERFLÄCHE
AUFGABE: Für jeden der 12 Parameter festlegen, was er auf der Seite bewirkt — überwiegend VERHALTEN (Seite/Agent handelt anders), nicht nur Optik.
Liefere:
1. Tabelle je Parameter: CSS-Variablen (--p-<id> plus abgeleitete, z. B. --type-cadence-ms, --pair-measure, --eye-pupil-scale), Wirkung je Komponente: Presence/Augen (Blickverhalten, Blinzelrate, Pupille, Lidhöhe, Sakkaden), Typewriter (Takt, Pausen, Jitter), Paar (Zeilenlänge, Abstand, Schriftgewicht, Auflösegeschwindigkeit), Composer, Agent-Antwortstil (Länge, Fragen ja/nein, Satzbau — als Prompt-Fragment für später), Stille/Wartezeit. Je Wirkung VERHALTEN oder DEKORATION. Mindestens zwei Drittel VERHALTEN.
2. Wertebereiche: welche Spanne ist spürbar, aber nicht kitschig (z. B. Typewriter 22–48 ms/Zeichen).
3. Konflikte zwischen Parametern (z. B. tempo hoch + calm hoch) und eine einfache Auflösungsregel.
4. Technischer Vorschlag (kein Code schreiben, nur Schnittstelle): Modul src/metrics/surface.js mit applySurface(params, root) → setzt CSS-Variablen auf :root und liefert behaviour-Objekt { typeCadenceMs, blinkIntervalMs, pupilScale, ... } für JS-Komponenten; Glättung (EMA über Turns), Übergangsdauer.
5. Ein Prompt-Fragment-Muster, mit dem später der echte Agent seinen Antwortstil aus den Parametern ableitet.
Markdown, Deutsch, max. 1800 Wörter. STOP nach der Antwort.
