# `src/voice/` — System-Prompt der Website-Stimme

Status: **Entwurf** (Quelle: Chat vom 2026-11-25). Noch keine Laufzeitimplementierung.

## Zweck des Moduls

`src/voice/` bündelt den System-Prompt-Entwurf für die Website-Stimme im Chat-Panel
([`voice-prompt.md`](voice-prompt.md)) sowie die dazugehörige Schnittstellenbeschreibung.
Die Stimme beantwortet Besuchernachrichten kurz (1–2 Sätze in der Sprache des Besuchers),
bestimmt aber **nicht** selbst die Gesprächsrichtung, sondern folgt einem vorgelagerten
Decision-Schritt.

## Platzhalter in `voice-prompt.md`

Vor dem Prompt-Text ab `# Role` enthält `voice-prompt.md` einen abgetrennten
YAML-Frontmatter-Header (für Parser wie `buildSystemPrompt`, z. B. über das
Entfernen des Frontmatters oder den Einstieg ab `# Role`).

Zur Laufzeit müssen folgende zwei Platzhalter im Prompt-Text ersetzt werden:

- `<SITE>` — Name bzw. Bezeichnung der Website.
- `<ABOUT: two or three plain sentences. This is the only knowledge you hold.>` —
  zwei bis drei schlichte Sätze dazu, worum es auf der Website geht. Das ist das
  einzige Vorwissen, das der Voice-Agent über den Seiteninhalt hält.

## Erwartete Turn-Eingaben

Jeder Turn übergibt dem Voice-Agenten drei Eingabeblöcke:

- `DECISION` — Ausgabe des vorgelagerten Decision-Schritts (ersetzt das eigene Urteil):
  - `has_direction`: `0..1`
  - `waypoint`: `{id, label, p}` oder `null`
  - `runner_up`: `{id, label, p}` oder `null`
- `HISTORY` — die letzten Turns als Klartext (`plain text`).
- `VISITOR_MESSAGE` — die aktuelle Nachricht des Besuchers.

## Tool `ask_worker`

Ist `DECISION.waypoint` gesetzt, ruft der Voice-Agent genau einmal pro Turn das Tool
`ask_worker` auf (niemals zweimal pro Turn; ist `DECISION.waypoint` `null`, antwortet
er ausschließlich aus `ABOUT`):

- **Parameter:**
  - `question` — die eigentliche Frage des Besuchers
  - `waypoint_id` — die `id` aus `DECISION.waypoint`
- **Rückgabe:**
  - Antwort des Workers zum angefragten Waypoint (vom Voice-Agenten bei Bedarf
    gekürzt wiedergegeben), oder
  - `NOT_COVERED`, falls der Waypoint die Frage nicht abdeckt (der Voice-Agent
    antwortet dann ehrlich und kurz ohne Ausschmückung).

## Offener Architekturkonflikt

Zwischen diesem Entwurf und [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md)
(§4 „Architektur“ und §6 „Nicht-Ziele“) besteht ein **ungelöster Architekturkonflikt**:

- **`HANDOFF-gespraechsfuehrung.md` (§4 / §6)** sieht ausdrücklich **einen einzelnen
  Agenten** vor, der alle Wegpunkte im Prompt kennt und über `show_waypoint(id)`
  genau eine Karte einblendet — explizit **ohne** Multi-Agent-Übergaben
  (*„Keine Multi-Agent-Übergaben in dieser Fassung“*).
- **`src/voice/voice-prompt.md`** trennt dagegen die Gesprächsführung in einen
  vorgelagerten **Decision-Schritt** (`DECISION`) und eine nachgelagerte Delegation
  an einen Worker per **`ask_worker`** (der Agent selbst kennt keine Seitenthemen).

Dieser Konflikt wird hier nicht aufgelöst und erfordert vor einer Implementierung
eine ausdrückliche Owner-Entscheidung.
