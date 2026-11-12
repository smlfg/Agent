# Brief: Cloudflare-Bausteine und Upstream-Repos

Mission `M-20261112T230610-fd237a98` · Lease `S-20261112T230618-36284bd9` (Orchestrator) · Stand 12.11.2026

Du recherchierst. Du entscheidest nichts, planst nichts und baust nichts.

## Hintergrund

Wir prüfen ein Produkt namens „Agentfähig": keine Website, sondern ein Agent
als Startseite. Der Besucher spricht, tippt oder zeigt ein Bild. Ein schneller
Front-Agent antwortet in unter einer Sekunde (auch mit Sprachausgabe) und
reicht Arbeit an langsamere Agenten weiter (Analyse, Nachschlagen, Backup). Der
Agent verändert das Aussehen der Seite in Echtzeit über höchstens drei
Schieberegler. Gebaut werden soll auf Cloudflare. Lies zuerst `tech/INTENT.md`
(dort stehen die Anforderungen T1 bis T9) und `sketches/2026-11-12-agentfaehig.md`.

## Goal

Stelle für jede Anforderung T1 bis T9 fest, welcher Cloudflare-Baustein sie
abdeckt, und belege das aus der offiziellen Dokumentation
(developers.cloudflare.com, blog.cloudflare.com, github.com/cloudflare).

Zu prüfen sind mindestens:

- Agents SDK (`agents` auf npm, github.com/cloudflare/agents): Zustand, WebSocket, State-Sync zum Browser, Sub-Agenten, Zeitplanung, Sprach-Unterstützung.
- Durable Objects: Adressierung (ein Objekt pro Besucher oder Mandant), WebSocket-Hibernation, RPC zwischen Objekten, Limits.
- Workers AI: verfügbare Modelle für Sprache-zu-Text, Text-zu-Sprache, kleine schnelle Sprachmodelle, Bildverständnis; Streaming; Limits.
- Cloudflare Realtime (WebRTC, RealtimeKit, Realtime Agents): Sprach-Pipelines und was dort zu Latenz steht.
- AI Gateway, Workflows, Queues, Vectorize, AI Search (AutoRAG): je ein Satz, wofür sie hier taugen.
- Bezahlen durch Agenten (zum Beispiel x402), nur ob es das gibt.

Zusätzlich: Finde mindestens 5 offene Repos oder Vorlagen, die als Ausgangspunkt
taugen (Sprach-Agent auf Cloudflare, Agents-SDK-Starter, Multi-Agent-Beispiele).
Je Repo: URL, Lizenz, letzter Commit (Datum), was es abdeckt, an welches T es andockt.

## Non-Goals

- Keine Konkurrenzprodukte außerhalb von Cloudflare (macht ein anderer Worker).
- Keine Preise im Detail, nur ob ein Baustein den bezahlten Workers-Plan braucht.
- Keine Architektur-Empfehlung, kein Code.

## Boundaries

- Schreibe genau eine Datei: `tech/research/cloudflare-bausteine.md`. Sonst nichts ändern, nichts installieren, kein git.
- Jede Aussage braucht eine URL, die du in diesem Lauf selbst abgerufen hast. Was du nur aus dem Gedächtnis weißt, kennzeichnest du in der Zeile mit `unbelegt`.
- Erfinde keine URLs, Modellnamen, Limits oder Zahlen. Modellnamen wörtlich aus der Dokumentation übernehmen.
- Wenn etwas als Beta, experimentell oder eingestellt markiert ist, schreib das dazu.

## Definition of Done

- Tabelle T1 bis T9: Baustein, was er kann, Reifegrad, Quelle, Lücke.
- Abschnitt „Latenz": alles, was Cloudflare selbst zu Latenz von Sprach-Pipelines sagt, mit Quelle.
- Abschnitt „Limits": die Grenzen, die das Vorhaben berühren können.
- Abschnitt „Upstream-Kandidaten": mindestens 5 Repos wie oben.
- Abschnitt „Nicht gefunden" und Abschnitt „Quellen".
- Sprache Deutsch, kurze Sätze.

## Stop

Hör auf, wenn die Datei steht, oder wenn du keinen Webzugriff hast. Im zweiten
Fall schreibe die Datei trotzdem, mit der ersten Zeile `STATUS: KEIN WEBZUGRIFF`
und allem als `unbelegt` markiert.

## Rückgabe

Letzte Nachricht: Pfad der Datei, Anzahl belegter Zeilen, Anzahl `unbelegt`.

## Arbeitsweise

Lege die Ergebnisdatei früh an und ergänze sie nach jeweils zwei bis drei Funden, damit bei einem Abbruch nichts verloren geht. Arbeite nur mit relativen Pfaden im aktuellen Verzeichnis.
