# Worker-Abschluss — parallel-proof-v1 (gehärtet)

**Status:** `DONE`  
**Control plane:** `DEGRADED` (hai-mcp nicht verfügbar; Arbeit nur im autorisierten Write-Root)

## Goal

FAIL-Review schließen: 10-Wege-Nebenläufigkeitsbeweis unter adversarial races belastbar (Barriere, Handoff-Races, Kapazität, Integrator, Snapshot-Konsistenz).

## Ergebnis

| Bereich | Pfad |
| --- | --- |
| Implementierung | `src/hai_parallel_state/state.py` |
| 10-Wege-Barriere-Race | `tests/test_ten_way_race.py` |
| Adversarial-Regressionen | `tests/test_adversarial_races.py` |
| 50× Stress | `tests/test_stress_repetitions.py` |
| Worker-Helfer | `tests/race_helpers.py` |
| Testrunner | `run-tests.sh` |
| Evidenz | `evidence/red-run.log`, `evidence/green-run.log`, `evidence/stress-run.log` |

## DoD-Checkliste

| Kriterium | Evidenz |
| --- | --- |
| Roter Regressionstest zuerst | `evidence/red-run.log` |
| 10-Prozess-Barriere | `tests/race_helpers.py` (`Barrier` × 2) |
| Blob-Byte + SHA-256 stabil nach abgewiesenem 2. Handoff | `test_ten_way_parallel_race` |
| Konkurrierende Handoff-Schreiber (1 Erfolg, `HandoffExistsError`) | `test_same_run_competing_writers_*` |
| Identisches Payload → gemeinsamer Blob | `test_different_runs_identical_payload_*` |
| `status_snapshot` ohne partielle Zustände | `test_snapshot_during_active_writers_*` |
| Strikte `run_id`-Validierung + Escape-Ablehnung | `test_rejects_absolute_traversal_*`, `test_rejects_symlink_*` |
| Atomarer Integrator-Claim (1 Gewinner, `fsync`) | `test_concurrent_integrator_claims_*` |
| 11. Run abgewiesen + `complete_run` | `test_eleventh_active_run_*` |
| 50 Wiederholungsläufe grün | `evidence/stress-run.log` |
| Gesamtsuite grün | `evidence/green-run.log` |

## Restgrenzen (bewusst nicht in dieser Variante)

- Kein echtes Agenten-Fanout; nur Prozess-`spawn`-Simulation
- Kein `hai-mcp`-Mission-Backfill (Control Plane `DEGRADED`)
- Kapazität zählt nur Runs ohne `completed.marker`; abgeschlossene Run-Verzeichnisse bleiben auf Disk (append-only, kein Löschen)
- `status_snapshot` listet auch abgeschlossene Runs (mit `completed=True`); aktive Kapazität nur über `_active_run_dirs`
- Symlink-Abwehr bei Reservierung: pre-existierender Symlink-Run-Dir wird abgelehnt; kein OS-weites Sandbox-Hardening
- Integrator-Claim und Handoff-Ref: POSIX `O_EXCL` + `fsync`; kein cluster-weites FS-Guarantee über NFS-Edge-Cases
- Keine Promotion nach `stable/`; Owner Gate ausstehend

## Nächster Schritt

Owner-Review der gehärteten Variante; bei Promotion Conformance gegen Root-Contracts. `hai-mcp` Backfill sobald Control Plane qualifiziert und erreichbar.
