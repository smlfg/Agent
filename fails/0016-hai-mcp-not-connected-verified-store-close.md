# Fail 0016 — hai-mcp Not connected beim Close von M-20260809T144408

**Status:** resolved via ControlPlane backfill  
**observed_at:** 2026-08-09  
**mission_id:** `M-20260809T144408-c8798df5` (abandoned)

## Expected

Owner-Reminder führt `hai_checkpoint` + `hai_close_mission` über Cursor `CallMcpTool` / hai-mcp aus.

## Observed

1. `GetMcpTools` → `serverStatus: ready` (Schema only).
2. `CallMcpTool` (`hai_health`, `hai_status`) → `Not connected`.
3. Verified-Store DoD nicht erreicht (keine `PLAN_VALIDATION_REPORT.md` / `EVIDENCE_VERIFIED_STORE.md`).

## Backfill

- Methode: `ControlPlane_API_uv_run` (hai-mcp `uv run python`)
- Checkpoint: `20260809T144440` → `~/.hai/history/checkpoints/20260809T144440`
- Close: `abandoned` / `owner_ack=true`
- Audit: `A-20260809T144441-e4e96cf0`
- Revoked: `S-20260809T144414-02f28ec5`

Kein Direct-Write auf `active_mission.json` / `mission.json`.

## Genau ein Next Step

hai-mcp in Cursor reconnecten, dann Verified-Store als **neue** Mission öffnen.
