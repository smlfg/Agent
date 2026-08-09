# Evidence — parallel-proof-v1 (gehärtet)

Control plane: **DEGRADED** (`hai-mcp` nicht im MCP-Katalog; Worker lief unter explizitem Dispatch-Vertrag mit Write-Root).

## Variantenpfad

`/Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1`

## Öffentliche Seam

Paket `hai_parallel_state` (`src/hai_parallel_state/`):

| Operation | Methode | Semantik |
| --- | --- | --- |
| Run-Reservierung | `ParallelState.reserve_run(run_id)` | `fcntl.flock` + max. 10 aktive Runs; strikte `run_id`-Validierung |
| Run-Abschluss | `ParallelState.complete_run(run_id)` | Append-only `completion.log` + `completed.marker`; gibt Kapazität frei |
| Write-once Handoff | `ParallelState.write_handoff(run_id, payload)` | SHA-256 Blob (`O_EXCL` + Race-Retry) + `handoff.ref` (`O_EXCL`) |
| Status-Snapshot | `ParallelState.status_snapshot()` | Vollständige JSON/Ref-Zustände; keine partiellen Claims |
| Integrator-Claim | `ParallelState.claim_integrator(claimer_id)` | Atomares `O_EXCL` + `fsync` auf `integrator/claim.json` |

## Dateisystem-Layout (Laufzeit)

```
<state_root>/
  runs/
    .reserve.lock
    completion.log          # append-only Abschlusslog
    <run-id>/
      meta.json             # atomisch publiziert
      workspace/
      handoff.ref           # write-once
      completed.marker      # nach complete_run
  handoffs/
    <aa>/<digest>/payload
  integrator/
    claim.json
```

## Tests

| Datei | Zweck |
| --- | --- |
| `tests/test_ten_way_race.py` | 10-Prozess-Barriere, Blob-Byte/SHA-Stabilität, Integrator |
| `tests/test_adversarial_races.py` | run_id-Escapes, 11. Run, Handoff-Races, Snapshot, Claim-Race |
| `tests/test_stress_repetitions.py` | 50× Wiederholung des 10-Wege-Race |
| `tests/race_helpers.py` | Shared Worker-Funktionen (picklable für `spawn`) |

## Befehle

```bash
cd /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1
./run-tests.sh
```

## Evidenz-Logs

| Log | Inhalt |
| --- | --- |
| `evidence/red-run.log` | Repräsentative FAIL-Review-Regressionen vor Härtung |
| `evidence/green-run.log` | Vollständiger grüner Testlauf (10 Tests) |
| `evidence/stress-run.log` | 50× 10-Wege-Race-Wiederholung |
| `evidence/repro-runs.log` | 3× offline Repro (legacy) |

## Nachweis-Kriterien (FAIL-Review geschlossen)

| Kriterium | Test / Code |
| --- | --- |
| 10-Prozess-Barriere (Simultanität) | `race_helpers._worker_barrier_race` + Barrier |
| Blob-Byte + SHA-256 vor/nach abgewiesenem 2. Handoff | `test_ten_way_parallel_race` |
| Konkurrierende Handoff-Schreiber (1 Run) | `test_same_run_competing_writers_*` |
| Identisches Payload, verschiedene Runs → 1 Blob | `test_different_runs_identical_payload_*` |
| `status_snapshot` ohne partielle JSON/Ref | `test_snapshot_during_active_writers_*` |
| `run_id`-Validierung + Traversal/Symlink | `test_rejects_absolute_traversal_*`, `test_rejects_symlink_*` |
| Integrator-Claim: 1 Gewinner, vollständiges JSON | `test_concurrent_integrator_claims_*` |
| 11. Run abgewiesen + `complete_run` freigibt Slot | `test_eleventh_active_run_*` |
| 50 Wiederholungsläufe grün | `test_fifty_full_repetition_runs` |

## Abhängigkeiten

Nur Python-Stdlib (≥3.9). Kein Netzwerk, kein pip-Install nötig.
