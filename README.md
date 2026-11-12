# Agentfähig

Ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird.
Dieses Repository sammelt derzeit die Idee, Designquellen und das Projektgerüst.
Eine lauffähige Anwendung ist noch nicht enthalten.

## Einstieg

- [Projektstand und nächste Entscheidungen](docs/PROJECT.md)
- [Bestätigte Designentscheidungen](docs/DESIGN-DECISIONS.md)
- [Aggregierte Scout-Befunde](research/SCOUT-SYNTHESIS.md)
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
