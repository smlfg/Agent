# Thematic Leases v1 — Design-Entwurf

Status: Workbench-Variante, read-only, NICHT implementiert
Owner: Samuel Fleig
Datum: 2026-09-17

## Goal (1 Satz)

Statt „maximal 2 beliebige Writer" sollen **3 thematische Leases** gleichzeitig laufen können —
`learning`, `work`, `fun` — je Theme genau ein Writer.

## Non-Goal

- Kein Code, keine Promotions-Arbeit, kein Push (nur Design).
- Keine Änderung an Qualifikation (6 Pflichtpfade) oder Transport-Fails (0002–0016).
- Keine Abschaffung von `write_scope` — Theme ergänzt, ersetzt nicht.

## Ist-Zustand (was schon da ist)

| Baustein | Stand |
|---|---|
| Themen/Lanes | bereits unbegrenzt (`max_active_lanes = 0`) |
| Read-only-Leases | parallelisieren bereits frei |
| Writer-Admission | `two_writer_disjoint`, hart bei 2 (`MAX_CONCURRENT_WRITERS = 2`) |
| `write_scope` | feine Pfad-Präfix-Trennung innerhalb der 2 Writer |
| `worker_capacity` | floor 2 + Lernblöcke, cap 6 — **informational**, wird bei Admission nicht konsultiert |

Der einzige bindende Engpass ist also `authorize_session` in `mission.py`: overlap-Check +
`len(active_writers) >= cap`. Dort liegt der Eingriffspunkt.

## Soll-Zustand

1. **`theme` als erste-Klasse-Lease-Dimension** (`learning` | `work` | `fun`).
   - Abgeleitet aus `project_path` (Owner-Entscheidung 2026-09-17):
     `~/Projects/01_WORK/**` → `work`, `~/Projects/02_STUDIUM/**` → `learning`, sonst → `fun`.
   - Kein explizites Feld in v1; ein manueller Override bleibt möglicher späterer Escape-Hatch.
2. **Cap-Regel**: Map `{learning: 1, work: 1, fun: 1}` — maximal ein Writer pro Theme.
   Drei Themes → bis zu drei gleichzeitige Writer, jeder in einer eigenen Spur.
3. **Lernen ist eine volle Schreib-Spur** (Owner 2026-09-17). Lernen heißt auch Lernmaterial
   erstellen, Uni-Arbeit, Coden und Üben — nicht nur passiv lesen. Der `learning`-Slot ist also
   ein echter Writer-Slot wie die anderen. Der LOGBUCH-Schutz („Wer agentisch codet, lernt nichts
   mehr") entsteht nicht durch einen Sonderstatus, sondern durch die Map: `learning` hat einen
   **eigenen** reservierten Slot und kann nicht von drei `work`-Writern verhungert werden.

## Cap-Regel (entschieden, 2026-09-17)

```
themes = {learning, work, fun}
cap    = {learning: 1, work: 1, fun: 1}   # Map, je Theme max 1 Writer

learning: 1 Writer (eigener Slot, nicht verhandelbar)
work:     1 Writer
fun:      1 Writer
```

Kollisions-Sorge entfällt fast von selbst: die Themes liegen in getrennten Wurzeln
(`02_STUDIUM`, `01_WORK`, Rest). `write_scope` bleibt als **feine** Absicherung darunter erhalten —
Theme ist grob, `write_scope` ist fein, orthogonal.

## Wo im Code das landen würde

- `src/hai_mcp/config.py`: `THEMES`-Set + `max_writer_per_theme` (ersetzt/ergänzt `MAX_CONCURRENT_WRITERS`).
- `src/hai_mcp/mission.py::authorize_session`: `theme`-Ableitung + Admission „0 Writer im Theme?".
- Lease-Record + `writer_lock_status()`: `theme` ausweisen, damit der Owner sieht, welche Spuren offen sind.

## Entschieden (Owner, 2026-09-17)

1. **`learning` ist eine volle Schreib-Spur.** Lernen = Lernmaterial erstellen, Uni-Arbeit, Coden,
   Üben. Verbraucht einen Writer-Slot.
2. **Theme wird aus `project_path` abgeleitet.** Kein explizites Feld in v1.
3. **Cap ist eine Map:** `{learning: 1, work: 1, fun: 1}`.

## Wo im Code das landen würde

- `src/hai_mcp/config.py`: `THEME_BY_PATH`-Ableitung + `writer_cap_by_theme = {learning: 1, work: 1, fun: 1}`
  (ersetzt `MAX_CONCURRENT_WRITERS`).
- `src/hai_mcp/mission.py::authorize_session`: `theme`-Ableitung aus `project_path` + Admission
  „hat dieses Theme schon einen Writer?".
- Lease-Record + `writer_lock_status()`: `theme` ausweisen, damit der Owner sieht, welche Spuren offen sind.

## Was NICHT angefasst wird

- Qualifikation (Discover → … → Contract Validation) bleibt offen und separat.
- Die 8 Transport-Fails bleiben offen und separat.
- `hai-mcp` bleibt unqualifizierte Python-Bindung bis zum Qualifikations-Slice.

## Nächster Schritt

Entscheidungen stehen. Der nächste Schritt wäre ein Build-Slice (Themen-Ableitung + Map-Cap in
`authorize_session`), der durch die normalen Gates läuft: Plan-Council → Plan-Acceptance →
Continuous-Authorize. Noch NICHT gestartet.
