# 0009 — Verified-Store: Missionen extern gekillt, dann MCP down

Datum: 2026-08-09 ~14:50 UTC+2
Host: Cursor (kimi-k3)
Status: BLOCKED + DEGRADED (hai-mcp "Not connected")

## Was passiert ist

1. Mission `M-20260809T144408-c8798df5` (Verified-Store, Gate ACCEPT vorhanden) 34s nach Open extern abandoned: "CallMcpTool in Cursor-Session Not connected; Close via ControlPlane_API_uv_run Backfill" (12:44:40Z).
2. Neu geöffnet als `M-20260809T144631-994e89fa` — wieder 34s später identisch extern abandoned (12:47:05Z). Meine MCP-Calls funktionierten zu beiden Zeitpunkten.
3. ~12:50Z: `hai_park` und `hai_health` → "Not connected". Server/Transport down (vermutlich Reload durch parallele Arbeit am Server).

## Stand der Arbeit (uncommitted, auf Disk)

- `src/hai_mcp/mission.py`: check_activity Verify-and-Store (`verified.json` im Mission-Dir, sha256, contract_version-gebunden), close_mission Store-Fallback (explizite Evidence > Store; Re-Hash beim Close; `evidence=None` erlaubt), Helper `_load_verified_store` / `_recheck_verified_record`.
- `src/hai_mcp/server.py`: Docstrings für hai_check_activity / hai_close_mission.
- `tests/test_mission_lifecycle.py`: 7 neue Tests (Pin+Close via Store, invalid path, path fehlt, Override, Stale, Recontract-Version-Match, Nicht-Recording).
- `Projek-Managment/PLAN_VALIDATION_REPORT.md`: ACCEPT, Attempt 1/2.

## Fehlt

- pytest-Lauf (Shell-Hook blockt Schreibbefehle ohne aktive Mission; Mission stirbt < 1 min).
- `Projek-Managment/EVIDENCE_VERIFIED_STORE.md`.
- Mission-Close.

## Backfill in der nächsten MCP-Session

1. Prüfen, welcher Prozess Missionen extern abandoned ("ControlPlane-Backfill" gegen Cursor-Sessions) — ggf. Watchdog anhalten.
2. Neue Mission Verified-Store öffnen (Contract wie M-20260809T144631-994e89fa), Lease.
3. `.venv/bin/python -m pytest -q` im hai-mcp-Repo (Basis war 170 grün).
4. EVIDENCE_VERIFIED_STORE.md schreiben, checkpoint, close_mission — gern über den neuen Store selbst.
