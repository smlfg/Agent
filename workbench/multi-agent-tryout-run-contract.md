# Workbench — Multi-Agent Tryout (Run-Contract)

Unqualifiziert. Kein Stable-Claim. Ausführung erst nach HAI-Unpark (siehe `parking/multi-agent-collab-wait-hai-unpark.md`).

## Ziel des Tryouts

Ein Slice beweist die Verdrahtung:

`hai-mcp` Mission → Run-Contract (Worker ≠ Reviewer) → cao **oder** agent-collab → Evidenzpfade → Mission close.

## DoD

- Run-Contract-Datei unter `workbench/runs/` validiert gegen `contracts/run-contract.schema.json`
- Worker- und Reviewer-Harness-IDs unterschiedlich; Reviewer `read_only: true`
- Mindestens ein evidence_path aus dem Execution-Harness
- `hai_close_mission` bzw. dokumentierter Close mit Status DONE/PARKED/BLOCKED

## Non-Goals

- Keine Orchestrationslogik in `hai-mcp`
- Keine Stable-Promotion in diesem Tryout
- Kein paralleles Install beider Harnesses im selben Slice (eins wählen)

## Pfad A — cao (Default)

1. `uv tool install git+https://github.com/awslabs/cli-agent-orchestrator.git@main --upgrade`
2. `cao-server` starten; `cao-ops-mcp` neben `hai-mcp` im Host eintragen
3. `hai_mission_start` mit Dispatch-Brief
4. Run-Contract schreiben (Vorlage unten), `harnesses.worker.id` z. B. `codex`, `harnesses.reviewer.id` z. B. `claude-code`
5. Via cao: Worker `assign`, Reviewer read-only; Artefakte unter Write-Root
6. Evidenzpfade in Contract `result`; Mission schließen

## Pfad B — agent-collab (nur Claude Code Main Session)

1. `/plugin marketplace add zebbern/agent-collab`
2. `/plugin install codex@agent-collab` und/oder `cursor@agent-collab`; `/codex:setup` bzw. `/cursor:setup`
3. Mission + Run-Contract wie oben
4. z. B. `/codex:review --background` → `/codex:result` als Reviewer-Evidenz (oder `/cursor:task` als Worker)
5. Evidenz manuell in Contract; Mission schließen

## Run-Contract-Vorlage

Nach Unpark unter `workbench/runs/<run_id>.json` ablegen und Felder füllen:

```json
{
  "$schema": "../../contracts/run-contract.schema.json",
  "schema_version": "1.0.0",
  "run_id": "REPLACE",
  "lane_id": "hai-multi-agent-tryout",
  "created_at": "REPLACE_ISO8601",
  "goal": "Ein Worker/Reviewer-Slice über cao oder agent-collab mit Evidenz zurück in hai-mcp.",
  "non_goal": "Kein Einbau von Delegation in hai-mcp; keine Stable-Promotion.",
  "boundaries": {
    "write_roots": ["workbench/runs"],
    "forbidden_paths": ["stable", "hai-mcp"]
  },
  "dod": [
    {
      "criterion": "Run-Contract terminal mit evidence_paths aus dem gewählten Harness",
      "evidence_paths": ["workbench/runs/REPLACE.json"]
    }
  ],
  "stop_criterion": "Budget überschritten, Harness unqualifiziert blockiert, oder Owner stoppt.",
  "harnesses": {
    "worker": { "id": "codex" },
    "reviewer": { "id": "claude-code", "read_only": true },
    "same_harness_owner_exception": false
  },
  "control_plane": {
    "primary_binding": "hai-mcp",
    "path": "primary_hai_mcp",
    "status": "NORMAL",
    "adapter_id": null,
    "hai_fail_id": null,
    "backfill_required": false
  },
  "budgets": {
    "hot_path_seconds": 120,
    "feedback_seconds": 600
  },
  "status": "planned"
}
```

Wenn `hai-mcp` noch unqualifiziert/unerreichbar: `control_plane.path` = `bootstrap_adapter`, `status` = `DEGRADED`, `adapter_id` + `hai_fail_id` setzen, `backfill_required` = true.

## Nächster Schritt nach erfolgreichem Tryout

Owner-Gate-Checkliste in `parking/multi-agent-owner-gate.md` — keine automatische Promotion.
