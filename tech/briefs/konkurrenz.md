# Brief: Technische Konkurrenz-Recherche

Mission `M-20261112T230610-fd237a98` · Lease `S-20261112T230618-36284bd9` (Orchestrator) · Stand 12.11.2026

Du recherchierst. Du entscheidest nichts, planst nichts und baust nichts.

## Hintergrund

Wir prüfen ein Produkt namens „Agentfähig": keine Website, sondern ein Agent
als Startseite. Der Besucher spricht, tippt oder zeigt ein Bild. Ein schneller
Front-Agent antwortet in unter einer Sekunde (auch mit Sprachausgabe) und
reicht Arbeit an langsamere Agenten weiter (Analyse, Nachschlagen). Der Agent
verändert das Aussehen der Seite in Echtzeit (Farbe, Form, Ausgabestil) über
höchstens drei Schieberegler. Geplant ist der Bau auf Cloudflare. Lies zuerst
`tech/INTENT.md` und `sketches/2026-11-12-agentfaehig.md`.

## Goal

Finde heraus, wer so etwas technisch schon baut und womit. Gesucht sind
Produkte und offene Projekte in diesen vier Gruppen:

1. Agent statt Website: Startseiten, die ein Gespräch sind (Text oder Stimme).
2. Sprach-Agenten im Browser mit niedriger Latenz (Voice-to-Voice).
3. Generative Oberflächen: Der Agent erzeugt oder verändert die Oberfläche zur Laufzeit.
4. Front-Agent plus Hintergrund-Agenten (schnell/langsam getrennt).

Je Fund brauche ich: Name, URL, was es tut (ein Satz), technischer Stack
soweit öffentlich belegt (Transport, Modelle, Hosting), gemessene oder
behauptete Latenz mit Quelle, Lizenz bei offenen Projekten, und was wir davon
übernehmen könnten.

## Non-Goals

- Keine Marktgröße, keine Preise, kein Marketing-Vergleich.
- Keine Design-Bewertung.
- Keine Empfehlung, was wir bauen sollen.
- Kein Code.

## Boundaries

- Schreibe genau eine Datei: `tech/research/konkurrenz.md`. Sonst nichts ändern, nichts installieren, kein git.
- Jede Aussage braucht eine URL, die du in diesem Lauf selbst abgerufen hast. Was du nur aus dem Gedächtnis weißt, kennzeichnest du in der Zeile mit `unbelegt`.
- Erfinde keine URLs, Zahlen oder Projektnamen. Lieber weniger Funde als falsche.

## Definition of Done

- Mindestens 8 Funde, mindestens einer je Gruppe, als Tabelle je Gruppe.
- Abschnitt „Latenz": alle gefundenen Zahlen mit Quelle und Messbedingung.
- Abschnitt „Nicht gefunden": was du gesucht und nicht belegt bekommen hast.
- Abschnitt „Quellen": Liste aller abgerufenen URLs.
- Sprache Deutsch, kurze Sätze.

## Stop

Hör auf, wenn die Datei steht, oder wenn du keinen Webzugriff hast. Im zweiten
Fall schreibe die Datei trotzdem, mit der ersten Zeile `STATUS: KEIN WEBZUGRIFF`
und allem als `unbelegt` markiert.

## Rückgabe

Letzte Nachricht: Pfad der Datei, Anzahl Funde, Anzahl `unbelegt`.

## Arbeitsweise

Lege die Ergebnisdatei früh an und ergänze sie nach jeweils zwei bis drei Funden, damit bei einem Abbruch nichts verloren geht. Arbeite nur mit relativen Pfaden im aktuellen Verzeichnis.
