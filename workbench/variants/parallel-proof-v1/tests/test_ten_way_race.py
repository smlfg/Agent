"""Process-based 10-way race proving isolation, write-once handoffs, single integrator."""

from __future__ import annotations

import json
import multiprocessing as mp
import shutil
import tempfile
import unittest
from pathlib import Path

from hai_parallel_state import ParallelState

from race_helpers import NUM_WORKERS, _worker_barrier_race


class TenWayRaceTest(unittest.TestCase):
    def test_ten_way_parallel_race(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-parallel-race-"))
        try:
            ParallelState(state_root).ensure_layout()
            ctx = mp.get_context("spawn")
            barrier = ctx.Barrier(NUM_WORKERS)

            result_dir = state_root / "worker-results"
            result_dir.mkdir()
            processes: list[mp.Process] = []

            for index in range(NUM_WORKERS):
                run_id = f"run-{index:02d}"
                result_path = str(result_dir / f"{run_id}.json")
                proc = ctx.Process(
                    target=_worker_barrier_race,
                    args=(str(state_root), run_id, result_path, barrier),
                    name=f"worker-{index:02d}",
                )
                processes.append(proc)

            for proc in processes:
                proc.start()
            for proc in processes:
                proc.join(timeout=60)
                self.assertEqual(proc.exitcode, 0, f"{proc.name} failed with exit {proc.exitcode}")

            outcomes = [
                json.loads((result_dir / f"run-{i:02d}.json").read_text(encoding="utf-8"))
                for i in range(NUM_WORKERS)
            ]

            workspaces = [item["workspace"] for item in outcomes]
            self.assertEqual(len(workspaces), NUM_WORKERS)
            self.assertEqual(len(set(workspaces)), NUM_WORKERS, "workspaces must be disjoint")

            for item in outcomes:
                ws = Path(item["workspace"])
                self.assertTrue(ws.is_dir())
                self.assertTrue((ws / "agent-marker.txt").exists())
                self.assertTrue(item["second_handoff_rejected"], item.get("errors"))
                self.assertEqual(item["errors"], [])
                self.assertTrue(item["blob_stable"])
                self.assertEqual(item["sha_before"], item["handoff_digest"])
                self.assertEqual(item["sha_after"], item["handoff_digest"])
                self.assertEqual(item["blob_bytes_before"], item["handoff_bytes"])
                self.assertEqual(item["blob_bytes_after"], item["handoff_bytes"])

            digests = [item["handoff_digest"] for item in outcomes]
            self.assertEqual(len(set(digests)), NUM_WORKERS, "handoffs must be content-distinct")

            state = ParallelState(state_root)
            snapshot = state.status_snapshot()
            self.assertEqual(len(snapshot.runs), NUM_WORKERS)

            for run in snapshot.runs:
                self.assertIsNotNone(run.handoff_digest)
                blob = state.blob_path_for_digest(run.handoff_digest)
                self.assertTrue(blob.is_file())
                ref = state.runs_dir / run.run_id / "handoff.ref"
                self.assertEqual(ref.read_text(encoding="utf-8").strip(), run.handoff_digest)

            integrator_winners = [item for item in outcomes if item["integrator_claimed"]]
            self.assertEqual(len(integrator_winners), 1, "exactly one integrator claim must succeed")
            self.assertTrue(snapshot.integrator_claimed)
            self.assertEqual(snapshot.integrator_claimer, integrator_winners[0]["run_id"])

            claim_file = state_root / "integrator" / "claim.json"
            self.assertTrue(claim_file.is_file())
            claim = json.loads(claim_file.read_text(encoding="utf-8"))
            self.assertEqual(claim["claimer_id"], integrator_winners[0]["run_id"])
            self.assertIn("claimed_at", claim)
            self.assertIn("pid", claim)
        finally:
            shutil.rmtree(state_root, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
