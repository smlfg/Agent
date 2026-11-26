# Agentfähig — Projektanweisungen

## Ziel und Quellen

Agentfähig soll ein interaktives Embodiment des Human-Agent Interface werden.
Samuel entscheidet über Produkt, Design und Freigaben.

Vor Projektarbeit zuerst `README.md` und `docs/PROJECT.md` lesen. Für konkrete
Designarbeit die relevante Stelle in `sketches/2026-11-12-agentfaehig.md` lesen.
`IDEA-TRANSKRIPT.txt` enthält Samuels ursprüngliche Absicht; `Agentfähig/GreateWriting.txt`
ist Inspiration, keine verbindliche Produktspezifikation. Unsichere Lesarten
der Skizze bleiben offen, bis Samuel sie klärt.

## Arbeitsweise

- Conserve ist Default: ein begrenzter Arbeitsstrang, keine automatische
  Breitenrecherche oder Subagents ohne expliziten Auftrag.
- Reihenfolge: planen → zeichnen → strukturieren → bauen. Dieser Stand ist
  ein Projektgerüst, noch keine implementierte Anwendung.
- **Skills:** Die versionierten Projektkopien in [`skills/`](skills/README.md)
  gelten. Je nach Aufgabe werden passende geladen — `systematic-debugging` bei
  Fehlern, `verification-before-completion` und `task-closure` bei jedem
  Abschluss, `webapp-testing` für Browserprüfung, `agents-sdk` /
  `workers-development` / `durable-objects` für Cloudflare-Fragen.
- **Ein Writer pro Integrationsstelle.** Während eines Arbeitsabschnitts
  schreibt genau eine Session an Klon, Browser-Tab, laufenden Server und
  Protokolldatei. Weitere Harnesses bleiben lesend. Grund: derselbe
  Browser-Tab teilt sich eine Durable-Object-Konversation, fremde Turns
  kontaminieren den Messlauf.
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
- Keine automatische Folgeaufgabe starten. Nach dem Abschluss warten.

## Ablage und Verifikation

`docs/` enthält Projektstand und Entscheidungen, `research/` gezielte Recherche,
`src/` spätere Implementierung, `tests/` Verhaltenstests und `scripts/` Checks.
Originalskizzen bleiben unter `sketches/`.

Vor Abschluss `bash scripts/validate.sh` ausführen. Sobald Code existiert,
zusätzlich passende Tests beziehungsweise Smoke-Checks ausführen. Nur tatsächlich
geprüfte Ergebnisse als erledigt melden; offene Punkte in `docs/PROJECT.md`
festhalten. Keine Framework-, Hosting- oder Modellentscheidung als bestätigt
darstellen, solange sie nur aus einer Skizze abgeleitet ist.

Wer Prompt, Persona, Wissen, Suche oder Modell ändert, fährt vor dem Commit
`npm run eval`; Regeln in [`evals/promptfoo/README.md`](evals/promptfoo/README.md).

Der Abschluss folgt [`skills/task-closure/SKILL.md`](skills/task-closure/SKILL.md):
Kriterien einzeln prüfen, Verifikation ausführen, Belege zeigen, Projektstand
fortschreiben, Blocker mit Pfad festhalten, und genau eine Abschlussformulierung
— `DONE`, `BLOCKED` oder `ABANDONED`.
