I'll start by reading the sources specified for this mission.
Angelegt: `src/agent/knowledge.json`, `src/agent/persona.json`, `tests/knowledge.test.js`.

Verifikation: `node --test tests/*.test.js` → **126 pass, 0 fail**. `scripts/validate.sh` bricht vor dem Dateicheck ab, weil hier kein Git-Repo existiert (`git ls-files` → 128); das ist die Umgebung, nicht die Änderung.

**open_questions_for_samuel**

1. Wie soll ein Besucher dich erreichen? `contact.method` und `contact.text` sind `null`, der Agent kann nur sagen, dass der Weg hier noch fehlt.
2. Darf der Agent eine Adresse des Besuchers im Chat annehmen und an dich weiterleiten — und ist dieses Weiterleiten überhaupt gebaut? (Der Pathway verspricht es, `src/` implementiert nichts.)
3. Ist „I do not quote. Samuel does, after he has heard what you actually need." die freigegebene Preis-Haltung, oder bleibt Preis komplett aus dem Gespräch?
4. Darf der Agent etwas zu Zeitrahmen oder Verfügbarkeit sagen? Der Pathway bietet „a thin one" binnen einer Woche — heute nicht belegbar.
5. Welche Angebote dürfen öffentlich benannt werden: Website, Person, Team — und was ist mit Company-weiten Builds?
6. Welche Projekte dürfen als öffentliche Referenzen erscheinen? Aktuell ist keine freigegeben, der Agent darf keine nennen.
7. Welches Rollen-Label soll öffentlich stehen: „AI engineer", „builder" oder etwas anderes?
8. Ist Englisch die einzige öffentliche Sprache, oder soll der Agent auch auf Deutsch antworten?
9. Ist `agentfähig.de` die kanonische Adresse für diesen Agenten, oder eine separate ungelistete URL?
