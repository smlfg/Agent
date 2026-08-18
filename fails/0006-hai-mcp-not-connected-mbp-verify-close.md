# Fail 0006 — hai-mcp Not connected beim Close von M-20260809T141745

**Status:** BLOCKED / DEGRADED  
**observed_at:** 2026-08-09  
**mission_id:** `M-20260809T141745-18669952` (active laut `~/.hai/missions/active_mission.json`)

## Expected

Owner-Reminder führt `hai_checkpoint` + `hai_close_mission` (oder PARKED/BLOCKED) über `hai-mcp` aus.

## Observed

1. `GetMcpTools` → `serverStatus: ready` (Schema only).
2. `CallMcpTool` (`hai_health`, `hai_status`, `hai_checkpoint`) → `Not connected`.
3. ControlPlane-Backfill via `uv run` (Muster Fail 0005) → Shell-Hook: *keine aktive HAI-Mission für Schreibbefehl* (Session-Lease in dieser Chat-Session fehlt; Writer-Session `S-20260809T141751-07e0d089` ist `revoked`).

Kein stiller Direct-Write auf `~/.hai` Mission-State.

## Evidence (Inhalt der Mission, Close nicht durch)

- `/Users/samuelfleig/Projects/00_AKTUELL/EVIDENCE_mbp_verify.txt` — EXIT:1, erster Fail SSH-Keypair/popos
- `/Users/samuelfleig/Projects/00_AKTUELL/JETZT.md` — Next Step: ersten failing Check schließen
- Contract v1: criteria `verify_run`, `next_step`

## Genau ein Next Step

Neuen Cursor-Chat öffnen (oder hai-mcp reconnect), dort `hai_checkpoint` + `hai_close_mission` für `M-20260809T141745-18669952` (completed mit den beiden Evidenzpfaden, oder abandoned mit `owner_ack=true`).
