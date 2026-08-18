# Konsolidierungs-Funnel

Vertrag für die fehlende Mitte zwischen unbegrenztem Denken und begrenzter Implementierung.

Verwandt: [ARCHITECTURE.md](ARCHITECTURE.md), [fails/0013-planning-fanout-ohne-konsolidierung.json](../fails/0013-planning-fanout-ohne-konsolidierung.json), [contracts/consolidation-map.schema.json](../contracts/consolidation-map.schema.json).

## Asymmetrie (verbindlich)

| Unbegrenzt | Streng begrenzt |
|---|---|
| Capture, FanOUT, Parken, Project Families, Varianten | Writer-Slots, aktive Lanes, `implementation_targets` |

HAI muss **ganz viel Denken** persistent aushalten und **nur ganz wenig implementieren**. Konsolidierung verdichtet Denken zu Implementierungszielen; sie erhöht keine Writer-Kapazität.

### LOGBUCH-Entwurf (noch nicht Owner-promoted)

**Entscheidung:** Konsolidierung verdichtet Denken zu Implementierungszielen; sie erhöht keine Writer-Kapazität.

**Warum:** FanOUT beim Planen ist schneller als Agentenarbeit. Ohne Verdichtungsschicht flacht Distill die Äste oder Agenten starten zu viele Slices. Die knappe Ressource bleibt Zurückkommen (Schreiben), nicht Themenzahl.

**Was nicht passieren darf:** Konsolidierung als Vorwand für mehr parallele Writer, Monolith-Merges oder automatischen Implementierungs-Start ohne Distill + Run-Contract.

## Funnel

```text
FanOUT (Intakes / Park)
  -> Project Family (Graph: related_to / family_of)
  -> Consolidation Map (N Gedanken -> M Ziele, M << N, Default M <= 3)
  -> Distill (genau 1 Entscheidung + 1 next_step)
  -> Run-Contract (Write-Root + DoD + Stop)
```

**Implementierung** = nur der unterste Ausgang. Alles darüber ist Denken mit Persistenz.

## Kardinalität

- Capture / Family-Mitglieder: unbegrenzt.
- `implementation_targets` pro Consolidation Map: `length <= max_targets` (Default **3**).
- `next_implementation`: genau ein aktives Ziel-ID oder `null`.
- `hai_distill`: unverändert 1 Entscheidung + 1 Schritt — sitzt *unter* der Map, nicht statt ihr.

## Was Konsolidierung nicht ist

- Kein Zusammenlegen von Repos / kein Monolith.
- Kein Ersatz für Distill oder Run-Contract.
- Kein beads-/MCP-Tool in diesem Slice (`hai_consolidate` bleibt geparkt).
- Keine UI-Pflicht; UX bleibt Baum, Familie ist interner Graph.

## Artefakte

| Artefakt | Rolle |
|---|---|
| `contracts/consolidation-map.schema.json` | Maschinenlesbare Map |
| `contracts/tree-node.schema.json` | `kind: family` + Relationen |
| `fails/0013-…` | Gap + Regression-DoD |

## Nächster Schritt nach diesem Vertrag

Erste echte Map-Instanz für eine bestehende Familie (z. B. Multi-Agent/STACK-Kandidaten) als Workbench-JSON — nur nach Owner-Go.
