# Fail 0008 — active_mission.json wird bei JEDEM Close gewischt (Fokus-Pointer-Defekt)

**Status:** observed, sichtbar repariert (Bootstrap-Adapter-Norm); Root-Fix offen
**observed_at:** 2026-08-09

## Expected

`~/.hai/missions/active_mission.json` ist laut `mission.py:312` ein **Fokus-Pointer**, kein exklusiver Lock — mehrere Missionen dürfen aktiv sein. Der Pointer darf nur dann auf `none` gesetzt werden, wenn die **gepointete** Mission geschlossen wird; sonst sollte er auf eine andere aktive Mission umgesetzt werden.

## Observed

`mission.py:1425` (abandon) und `mission.py:1494` (completed) rufen `save_active_pointer(None, "none")` **unbedingt** auf — ohne Prüfung, welche Mission im Pointer steht.

Zeitleiste 2026-08-09 (UTC+2):

1. 14:43:50 — `hai_open_mission` öffnet `M-20260809T144350-e69605cf` (Worker-Pool) → Pointer `active`.
2. 14:44:08 / 14:45:16 — Parallel-Session öffnet `M-...144408` / `M-...144516`.
3. 14:44:41 / 14:45:50 — Parallel-Session abandoned ihre Missionen (Audit `A-20260809T144441-e4e96cf0`) → Pointer beide Male auf `none` gewischt, obwohl `M-...144350` weiter `active` ist.
4. Folge: `.cursor/hooks/hai-before-shell.py` liest Pointer `none` → blockiert **alle** mutierenden Shells der rechtmäßig aktiven Mission ("keine aktive HAI-Mission für Schreibbefehl").

Das ist vermutlich ein Mitverursacher der heutigen wiederholten Dispatch-Blockaden (fail 0007): parallele Sessions wischen sich gegenseitig den Fokus.

## Repair (sichtbar, kein stiller Bypass)

Pointer von Hand auf die tatsächlich aktive Mission `M-20260809T144350-e69605cf` zurückgesetzt (Inhalt: mission_id/status/updated_at). Norm aus `docs/ARCHITECTURE.md` (Bootstrap-Adapter bei unqualifizierter/unerreichbarer Bindung): sichtbar, dokumentiert hier, Backfill = Root-Fix in hai-mcp. Keine Session-/Mission-Records manipuliert, kein Audit-Eintrag verändert.

## Regression Test (desired)

**Precondition:** Zwei aktive Missionen A (Pointer) und B.
**Success:** Close von B lässt Pointer auf A; Close von A setzt Pointer auf B (oder `none`, falls keine weitere aktive Mission). Test in `hai-mcp/tests/test_mission_lifecycle.py`.

## Genau ein Next Step

Root-Fix als eigener hai-mcp-Slice: `save_active_pointer` beim Close nur aufrufen, wenn die geschlossene Mission die gepointete ist, und sonst auf verbliebene aktive Mission umsetzen (mission.py:1425, 1494).
