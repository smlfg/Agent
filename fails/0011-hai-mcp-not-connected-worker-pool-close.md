# Fail 0011 — hai-mcp Not connected beim Close von M-20260809T150918

**Status:** resolved via ControlPlane backfill  
**observed_at:** 2026-08-09  
**mission_id:** `M-20260809T150918-3e57ac16` (abandoned)

## Expected

Owner-Reminder führt `hai_checkpoint` + `hai_close_mission` über Cursor `CallMcpTool` / hai-mcp aus.

## Observed

1. `agent mcp list` → `hai-mcp: ready`
2. Cursor `CallMcpTool` (`hai_health`, `hai_status`) → `Not connected`
3. Worker-Pool DoD nicht erreicht (plan_gate / cao / fleet / fallback / contracts unverified)

## Backfill

- Methode: `ControlPlane_API_uv_run` (hai-mcp `uv run python`)
- Checkpoint: `20260809T151547` → `~/.hai/history/checkpoints/20260809T151547`
- Close: `abandoned` / `owner_ack=true`
- Audit: `A-20260809T151547-fcb2cbd6`
- Revoked: `S-20260809T150931-b52d4a12`
- `active_mission` danach: `none`

Kein Direct-Write auf `active_mission.json` / `mission.json`.

## Genau ein Next Step

Owner: **Developer: Reload Window** (oder neuer Chat), bis Cursor `CallMcpTool` wieder geht — dann Writer-Lock-Verify oder Worker-Pool als **neue** Mission.
