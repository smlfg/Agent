"""Shared helpers for process-based adversarial race tests."""

from __future__ import annotations

import hashlib
import json
import multiprocessing as mp
import os
from pathlib import Path

from hai_parallel_state import HandoffExistsError, ParallelState

NUM_WORKERS = 10


def digest_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _worker_barrier_race(state_root: str, run_id: str, result_path: str, barrier: mp.synchronize.Barrier) -> None:
    state = ParallelState(state_root)
    outcome: dict = {"run_id": run_id, "second_handoff_rejected": False, "errors": []}

    workspace = state.reserve_run(run_id)
    outcome["workspace"] = str(workspace)

    barrier.wait()

    marker = workspace / "agent-marker.txt"
    marker.write_text(f"run={run_id}\npid={os.getpid()}\n", encoding="utf-8")
    outcome["marker"] = marker.read_text(encoding="utf-8")

    payload = f"handoff:{run_id}:{os.getpid()}".encode()
    digest = state.write_handoff(run_id, payload)
    outcome["handoff_digest"] = digest
    outcome["handoff_bytes"] = payload.decode()

    blob_path = state.blob_path_for_digest(digest)
    blob_before = blob_path.read_bytes()
    sha_before = digest_bytes(blob_before)
    outcome["blob_bytes_before"] = blob_before.decode()
    outcome["sha_before"] = sha_before

    try:
        state.write_handoff(run_id, b"overwrite-attempt")
        outcome["errors"].append("second_handoff_not_rejected")
    except HandoffExistsError:
        outcome["second_handoff_rejected"] = True
    except Exception as exc:
        outcome["errors"].append(f"second_handoff_wrong_error:{type(exc).__name__}")

    blob_after = blob_path.read_bytes()
    sha_after = digest_bytes(blob_after)
    outcome["blob_bytes_after"] = blob_after.decode()
    outcome["sha_after"] = sha_after
    outcome["blob_stable"] = blob_before == blob_after and sha_before == sha_after

    barrier.wait()

    outcome["integrator_claimed"] = state.claim_integrator(run_id)

    Path(result_path).write_text(json.dumps(outcome), encoding="utf-8")


def _worker_same_run_handoff(
    state_root: str,
    run_id: str,
    payload: bytes,
    result_path: str,
    barrier: mp.synchronize.Barrier,
) -> None:
    state = ParallelState(state_root)
    barrier.wait()
    outcome: dict = {"run_id": run_id, "pid": os.getpid()}
    try:
        digest = state.write_handoff(run_id, payload)
        outcome["result"] = "won"
        outcome["digest"] = digest
    except HandoffExistsError:
        outcome["result"] = "lost"
        outcome["error"] = "HandoffExistsError"
    except Exception as exc:
        outcome["result"] = "error"
        outcome["error"] = type(exc).__name__
    Path(result_path).write_text(json.dumps(outcome), encoding="utf-8")


def _worker_identical_payload_runs(
    state_root: str,
    run_id: str,
    payload: bytes,
    result_path: str,
    barrier: mp.synchronize.Barrier,
) -> None:
    state = ParallelState(state_root)
    workspace = state.reserve_run(run_id)
    barrier.wait()
    outcome = {
        "run_id": run_id,
        "workspace": str(workspace),
        "pid": os.getpid(),
    }
    try:
        digest = state.write_handoff(run_id, payload)
        blob = state.blob_path_for_digest(digest).read_bytes()
        outcome["result"] = "ok"
        outcome["digest"] = digest
        outcome["blob_len"] = len(blob)
        outcome["blob_sha"] = digest_bytes(blob)
    except Exception as exc:
        outcome["result"] = "error"
        outcome["error"] = type(exc).__name__
    Path(result_path).write_text(json.dumps(outcome), encoding="utf-8")


def _worker_snapshot_probe(state_root: str, run_id: str, payload: bytes, samples_path: str, barrier: mp.synchronize.Barrier) -> None:
    state = ParallelState(state_root)
    workspace = state.reserve_run(run_id)
    barrier.wait()
    state.write_handoff(run_id, payload)
    marker = workspace / "probe.txt"
    for _ in range(20):
        marker.write_text(f"pid={os.getpid()}\n", encoding="utf-8")
    Path(samples_path).write_text(json.dumps({"run_id": run_id, "done": True}), encoding="utf-8")


def _claim_worker(state_root: str, claimer_id: str, result_path: str, barrier: mp.synchronize.Barrier) -> None:
    barrier.wait()
    claimed = ParallelState(state_root).claim_integrator(claimer_id)
    Path(result_path).write_text(
        json.dumps({"claimer_id": claimer_id, "claimed": claimed}),
        encoding="utf-8",
    )


def _snapshot_reader(state_root: str, out_path: str, stop_path: str) -> None:
    import time

    state = ParallelState(state_root)
    samples: list[dict] = []
    while not Path(stop_path).exists():
        snapshot = state.status_snapshot()
        samples.append(
            {
                "run_count": len(snapshot.runs),
                "integrator_claimed": snapshot.integrator_claimed,
                "runs": [
                    {
                        "run_id": run.run_id,
                        "handoff_digest": run.handoff_digest,
                        "completed": run.completed,
                    }
                    for run in snapshot.runs
                ],
            }
        )
        time.sleep(0.002)
    Path(out_path).write_text(json.dumps(samples), encoding="utf-8")
