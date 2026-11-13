# Agentfähig

Ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird.
Dieses Repository sammelt derzeit die Idee, Designquellen und das Projektgerüst.
Eine lauffähige Anwendung ist noch nicht enthalten.

## Einstieg

- [Projektstand und nächste Entscheidungen](docs/PROJECT.md)
- [HAI-Missionsvorschlag: Integration First](docs/missions/INTEGRATION-FIRST-WHAT-THIS-IS.md)
- [Nachgelagerte HAI-Mission: Evidence-Based ML Flywheel (COLD)](docs/missions/SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md)
- [Bestätigte Designentscheidungen](docs/DESIGN-DECISIONS.md)
- [Nächtlicher Plaud-Zwischenstand vom 13.11.2026](docs/notes/2026-11-13-nightly-status.md)
- [Aggregierte Scout-Befunde & Prior Art](research/SCOUT-SYNTHESIS.md)
- [Cloudflare-Machbarkeit](tech/CLOUDFLARE_MACHBARKEIT.md) und [Technik-Abgleich](tech/ABGLEICH.md)
- [Offene Lücken-Übersicht](tech/LUECKEN.md)
- [Grilling-Skill als Projektkopie](skills/grilling/SKILL.md)
- [Anweisungen für Coding-Agents](AGENTS.md)
- [Designskizze vom 12.11.2026](sketches/2026-11-12-agentfaehig.md)
- [Designinspiration](Agentfähig/GreateWriting.txt)

Die Datei [Idea](Idea) enthält das ursprüngliche Sprachtranskript.

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
skills/         Versionierte Projektkopie des Grilling-Skills
```

## Prüfen

```bash
bash scripts/validate.sh
```

Der Check benötigt Bash und Python 3. Er prüft das Projektgerüst und lokale
Markdown-Verweise; er ist noch kein Funktionsnachweis für eine Anwendung.
Der bestehende GitHub-Workflow verwendet denselben Einstiegspunkt.
