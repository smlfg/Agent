HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Rolle: RECHERCHE, nur lesen. Keine Datei ändern oder anlegen. Kein git, keine Installation.

GOAL
Finde vergleichbare Projekte (Upstreams) für agentfähig: eine Website, die sich wie ein Agent verhält. Owner-Vorgaben: nur das aktuelle Paar Eingabe/Antwort sichtbar (kein Chat-Verlauf), Text erscheint per Typewriter und löst sich nach oben auf, die UI verändert sich dynamisch aus dem Gespräch (gesteuert v. a. durch NLP-Metriken der Gesprächsführung wie Tempo, Stimmung, Länge), Augen als Präsenz, Besucher spricht zuerst, Unterbrechen erlaubt.

ZUERST lesen: UPSTREAM-SEARCH-vergleichbare-projekte.md und tech/UPSTREAM-SEARCH-cloudflare.md. Bereits gefundene Kandidaten (u. a. OpenVoiceUI/EyeFace, Pika generative-ui, capturia, json-render) NICHT erneut melden, außer du hast neue Fakten.

SUCHE (Web/GitHub) nach neuen Kandidaten in vier Kategorien:
1. Websites/Interfaces, bei denen der Agent selbst die Oberfläche ist (kein Chat-Widget).
2. Generative/adaptive UI aus Gesprächssignalen (Sentiment, Tempo, Intent → Layout/Farbe/Typografie).
3. Text-Animationen: Typewriter + Text, der sich auflöst/verdampft (fertige CSS/JS-Bibliotheken, MIT/Apache).
4. Gesprächsmetriken im Browser (leichtgewichtige Sentiment-/Stimmungsanalyse in JS ohne Server).

RÜCKGABEFORMAT (Markdown, Deutsch, max. 900 Wörter)
Pro Kategorie 2–4 Kandidaten als Tabelle: Name | URL | Lizenz | Sterne/letzte Aktivität | was genau übernehmbar ist | Andockpunkt an agentfähig (Datei/Schnittstelle: src/conversation/typewriter.js, src/state/store.js, src/presence/presence.js oder CSS) | Risiko.
Danach: Top-3-Empfehlung mit je einem Satz Begründung.
Nur Kandidaten mit überprüfbarer URL und erkennbarer Lizenz. Was du nicht belegen kannst, lass weg. STOP nach der Antwort.
