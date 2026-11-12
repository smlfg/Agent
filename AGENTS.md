# Agentfähig — Projektanweisungen

## Ziel und Quellen

Agentfähig soll ein interaktives Embodiment des Human-Agent Interface werden.
Samuel entscheidet über Produkt, Design und Freigaben.

Vor Projektarbeit zuerst `README.md` und `docs/PROJECT.md` lesen. Für konkrete
Designarbeit die relevante Stelle in `sketches/2026-11-12-agentfaehig.md` lesen.
`Idea` enthält Samuels ursprüngliche Absicht; `Agentfähig/GreateWriting.txt`
ist Inspiration, keine verbindliche Produktspezifikation. Unsichere Lesarten
der Skizze bleiben offen, bis Samuel sie klärt.

## Arbeitsweise

- Conserve ist Default: ein begrenzter Arbeitsstrang, keine automatische
  Breitenrecherche oder Subagents ohne expliziten Auftrag.
- Reihenfolge: planen → zeichnen → strukturieren → bauen. Dieser Stand ist
  ein Projektgerüst, noch keine implementierte Anwendung.
- Vor Änderungen Dateien lesen und Git-Status prüfen. Fremde und ungetrackte
  Arbeit erhalten; Quellen und Rohdaten nicht beiläufig umschreiben.
- Vor Rückfragen die kleinste relevante lokale Quelle prüfen. Verbleibende
  Mehrdeutigkeit zu Ziel, Komponente oder Ansatz mit Samuel klären.
- Keine neuen Config-Keys ohne ausdrücklichen Auftrag beziehungsweise Freigabe.
- Globale Agent-Instruktionen, Profile, Registries und MCP-Konfigurationen nur
  nach expliziter Freigabe ändern.
- Keine Commits, Pushes, Deployments, destruktiven Aktionen oder kostenpflichtigen
  Dienste ohne entsprechende Freigabe. Keine Secrets ins Repository.
- Pop!_OS, COSMIC und Wayland berücksichtigen; kein apt ohne Rückfrage.
- Nach einem fehlgeschlagenen Ansatz Befund melden, nicht eigenständig eskalieren.

## Ablage und Verifikation

`docs/` enthält Projektstand und Entscheidungen, `research/` gezielte Recherche,
`src/` spätere Implementierung, `tests/` Verhaltenstests und `scripts/` Checks.
Originalskizzen bleiben unter `sketches/`.

Vor Abschluss `bash scripts/validate.sh` ausführen. Sobald Code existiert,
zusätzlich passende Tests beziehungsweise Smoke-Checks ausführen. Nur tatsächlich
geprüfte Ergebnisse als erledigt melden; offene Punkte in `docs/PROJECT.md`
festhalten. Keine Framework-, Hosting- oder Modellentscheidung als bestätigt
darstellen, solange sie nur aus einer Skizze abgeleitet ist.
