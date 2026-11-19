# Agentfähig

Ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird.
Dieses Repository sammelt derzeit die Idee, Designquellen und das Projektgerüst.
Eine lauffähige Anwendung ist noch nicht enthalten.

## Einstieg

- [Projektstand und nächste Entscheidungen](docs/PROJECT.md)
- [HAI-Missionsvorschlag: Integration First](docs/missions/INTEGRATION-FIRST-WHAT-THIS-IS.md)
- [Nachgelagerte HAI-Mission: Evidence-Based ML Flywheel (COLD)](docs/missions/SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md)
- [Projektvertrag — Erfolgsdefinition, Scope, offene Owner-Entscheidungen](docs/PROJECT_CONTRACT.md)
- [Prior-Art- und Embodiment-Recherche](research/PRIOR_ART_REPORT.md)
- [Offene Owner-Entscheidungen](docs/UNSOLVED-PLANUNG.md)
- [Technische Entscheidungen](docs/UNSOLVED-TECHNIK.md)
- [Handoffs — nicht angewendete Änderungen](docs/handoffs/README.md)
- [Was liegt wo — Projektpfade](PROJEKTPFADE.md)
- [Dateinamen — Regel und Umbenennungen](docs/DATEINAMEN.md)
- [Was ich vorhabe — in meinen Worten](docs/VISION-samuel.md)
- [Bauplan mit Wenn-Dann-Wegen](docs/PLAN-STUFEN-0-5.md)
- [Execution Plan — Meilensteine M0–M5, Abhängigkeiten, Risiken](docs/EXECUTION_PLAN-M0-M5.md)
- [Entscheidungsgrundlagen (ADRs)](docs/adr/)
- [Bestätigte Designentscheidungen](docs/DESIGN-DECISIONS.md)
- [UX und Informationsarchitektur — Nutzerführung vor Screens](docs/UX-INFORMATIONSARCHITEKTUR.md)
- [Low-Fidelity-Wireframes V1 (Vorschlag)](docs/wireframes/README.md)
- [Visual Exploration — Idle Presence, Conversation UI, Pathway Flow](docs/visual-exploration/)
- [Nächtlicher Plaud-Zwischenstand vom 13.11.2026](docs/notes/2026-11-13-nightly-status.md)
- [Aggregierte Scout-Befunde](research/SCOUT-SYNTHESIS.md)
- [CodeCanvas — Setup, Werkzeuge, Agent Notes](docs/CODECANVAS.md)
- [Skills im Projekt — Herkunft, Lizenzen, Einsatz](skills/README.md)
- [Anweisungen für Coding-Agents](AGENTS.md)
- [Designskizze vom 12.11.2026](sketches/2026-11-12-agentfaehig.md)
- [Designinspiration](Agentfähig/GreateWriting.txt)

Die Datei [IDEA-TRANSKRIPT.txt](IDEA-TRANSKRIPT.txt) enthält das ursprüngliche Sprachtranskript.

## Struktur

```text
AGENTS.md       Projektregeln für Coding-Agents
Agentfähig/     Vorhandenes Inspirationsmaterial
sketches/       Skizzen, Transkription, Bilder und Rohdaten
docs/           Projektstand, Anforderungen und Entscheidungen
research/       Gezielte Recherche mit Quellen und offenen Fragen
tech/           Cloudflare-Machbarkeit, Technik-Abgleich und Lücken-Check
src/            Künftiger Anwendungscode
tests/          Künftige Verhaltenstests
scripts/        Lokale Checks und Automatisierung
skills/         Versionierte Projektkopien der Agent-Skills
.opencode/      Verweis auf skills/, damit OpenCode sie als Skills lädt
```

## Werkzeuge

Der MCP-Server **CodeCanvas** stellt das Repository räumlich dar: Dateien,
Ordner, Abhängigkeiten, Diffs und LSP-Symbole. Er ist lokal installiert
(`devDependency`) und in der OpenCode-Konfiguration eingetragen — siehe
[docs/CODECANVAS.md](docs/CODECANVAS.md). Der Free-Plan des Dienstes
enthält den MCP-Zugang.

```bash
npm install    # installiert code-canvas-server lokal
```

## Prüfen

```bash
bash scripts/validate.sh
```

Der Check benötigt Bash und Python 3. Er prüft, dass 13 Pflichtdateien
existieren und nicht leer sind, und löst die lokalen Markdown-Verweise **in
diesen Dateien** auf. Verweise in allen anderen Dokumenten prüft er nicht. Er
ist kein Funktionsnachweis für eine Anwendung.
Der bestehende GitHub-Workflow verwendet denselben Einstiegspunkt.
