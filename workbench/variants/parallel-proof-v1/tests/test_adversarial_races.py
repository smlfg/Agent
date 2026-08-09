"""Adversarial race regressions for parallel state hardening."""

from __future__ import annotations

import json
import multiprocessing as mp
import shutil
import tempfile
import time
import unittest
from pathlib import Path

from hai_parallel_state import (
    CompletionError,
    HandoffExistsError,
    ParallelState,
    ParallelStateError,
    ReservationError,
    RunLimitError,
)

from race_helpers import (
    NUM_WORKERS,
    _claim_worker,
    _snapshot_reader,
    _worker_identical_payload_runs,
    _worker_same_run_handoff,
    _worker_snapshot_probe,
    digest_bytes,
)


class RunIdValidationTest(unittest.TestCase):
    def test_rejects_absolute_traversal_and_invalid_ids(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-runid-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()
            invalid_ids = [
                "",
                ".hidden",
                "../escape",
                "foo/bar",
                "foo\\bar",
                "/absolute",
                "a..b",
                "..",
                "bad space",
            ]
            for run_id in invalid_ids:
                with self.assertRaises(ReservationError, msg=run_id):
                    state.reserve_run(run_id)
        finally:
            shutil.rmtree(state_root, ignore_errors=True)

    def test_rejects_symlink_escape_target(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-symlink-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()
            outside = state_root / "outside"
            outside.mkdir()
            evil = state.runs_dir / "evil"
            evil.symlink_to(outside)
            with self.assertRaises(ReservationError):
                state.reserve_run("evil")
        finally:
            shutil.rmtree(state_root, ignore_errors=True)


class RunCapacityTest(unittest.TestCase):
    def test_eleventh_active_run_rejected_and_completion_frees_slot(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-capacity-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()
            for index in range(NUM_WORKERS):
                state.reserve_run(f"run-{index:02d}")

            with self.assertRaises(RunLimitError):
                state.reserve_run("run-10")

            state.complete_run("run-00")
            completion_log = state.runs_dir / "completion.log"
            self.assertTrue(completion_log.is_file())
            log_lines = completion_log.read_text(encoding="utf-8").strip().splitlines()
            self.assertEqual(len(log_lines), 1)
            self.assertTrue(log_lines[0].startswith("run-00\t"))

            marker = state.runs_dir / "run-00" / "completed.marker"
            self.assertTrue(marker.is_file())

            with self.assertRaises(CompletionError):
                state.complete_run("run-00")

            replacement = state.reserve_run("run-10")
            self.assertTrue(replacement.is_dir())

            with self.assertRaises(RunLimitError):
                state.reserve_run("run-11")
        finally:
            shutil.rmtree(state_root, ignore_errors=True)


class ConcurrentHandoffTest(unittest.TestCase):
    def test_same_run_competing_writers_one_wins_handoff_exists_for_losers(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-handoff-race-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()
            run_id = "shared-run"
            state.reserve_run(run_id)
            payload = b"shared-payload-for-one-run"

            ctx = mp.get_context("spawn")
            writers = 8
            barrier = ctx.Barrier(writers)
            result_dir = state_root / "handoff-race"
            result_dir.mkdir()
            processes: list[mp.Process] = []

            for index in range(writers):
                result_path = str(result_dir / f"writer-{index}.json")
                proc = ctx.Process(
                    target=_worker_same_run_handoff,
                    args=(str(state_root), run_id, payload, result_path, barrier),
                    name=f"writer-{index}",
                )
                processes.append(proc)

            for proc in processes:
                proc.start()
            for proc in processes:
                proc.join(timeout=30)
                self.assertEqual(proc.exitcode, 0)

            outcomes = [
                json.loads((result_dir / f"writer-{i}.json").read_text(encoding="utf-8"))
                for i in range(writers)
            ]

            winners = [o for o in outcomes if o["result"] == "won"]
            losers = [o for o in outcomes if o["result"] == "lost"]
            errors = [o for o in outcomes if o["result"] == "error"]
            if errors:
                self.fail(f"unexpected worker errors: {errors}")

            self.assertEqual(len(winners), 1)
            self.assertEqual(len(errors), 0)
            self.assertEqual(len(losers), writers - 1)
            for loser in losers:
                self.assertEqual(loser["error"], "HandoffExistsError")

            digest = winners[0]["digest"]
            blob = state.blob_path_for_digest(digest).read_bytes()
            self.assertEqual(blob, payload)
            self.assertEqual(digest_bytes(blob), digest)
        finally:
            shutil.rmtree(state_root, ignore_errors=True)

    def test_different_runs_identical_payload_share_one_blob(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-shared-blob-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()
            payload = b"identical-payload-across-runs"
            expected_digest = digest_bytes(payload)

            ctx = mp.get_context("spawn")
            barrier = ctx.Barrier(NUM_WORKERS)
            result_dir = state_root / "shared-blob"
            result_dir.mkdir()
            processes: list[mp.Process] = []

            for index in range(NUM_WORKERS):
                run_id = f"run-{index:02d}"
                result_path = str(result_dir / f"{run_id}.json")
                proc = ctx.Process(
                    target=_worker_identical_payload_runs,
                    args=(str(state_root), run_id, payload, result_path, barrier),
                    name=f"worker-{index:02d}",
                )
                processes.append(proc)

            for proc in processes:
                proc.start()
            for proc in processes:
                proc.join(timeout=60)
                self.assertEqual(proc.exitcode, 0)

            outcomes = [
                json.loads((result_dir / f"run-{i:02d}.json").read_text(encoding="utf-8"))
                for i in range(NUM_WORKERS)
            ]

            self.assertTrue(all(o["result"] == "ok" for o in outcomes))
            digests = {o["digest"] for o in outcomes}
            self.assertEqual(digests, {expected_digest})
            blob_paths = {
                ParallelState(state_root).blob_path_for_digest(expected_digest)
            }
            self.assertEqual(len(blob_paths), 1)
            blob = next(iter(blob_paths)).read_bytes()
            self.assertEqual(blob, payload)

            workspaces = {o["workspace"] for o in outcomes}
            self.assertEqual(len(workspaces), NUM_WORKERS)
        finally:
            shutil.rmtree(state_root, ignore_errors=True)


class StatusSnapshotRaceTest(unittest.TestCase):
    def test_snapshot_during_active_writers_never_partial(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-snapshot-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()

            ctx = mp.get_context("spawn")
            barrier = ctx.Barrier(NUM_WORKERS)
            probe_dir = state_root / "probes"
            probe_dir.mkdir()
            stop_path = str(state_root / "snapshot-stop")
            reader_out = str(state_root / "snapshot-samples.json")

            reader = ctx.Process(
                target=_snapshot_reader,
                args=(str(state_root), reader_out, stop_path),
                name="snapshot-reader",
            )
            reader.start()

            payload = b"snapshot-probe-payload"
            workers: list[mp.Process] = []
            for index in range(NUM_WORKERS):
                run_id = f"run-{index:02d}"
                samples_path = str(probe_dir / f"{run_id}.json")
                proc = ctx.Process(
                    target=_worker_snapshot_probe,
                    args=(str(state_root), run_id, payload, samples_path, barrier),
                    name=f"probe-{index:02d}",
                )
                workers.append(proc)

            for proc in workers:
                proc.start()
            for proc in workers:
                proc.join(timeout=60)
                self.assertEqual(proc.exitcode, 0)

            Path(stop_path).write_text("stop\n", encoding="utf-8")
            reader.join(timeout=30)
            self.assertEqual(reader.exitcode, 0)

            samples = json.loads(Path(reader_out).read_text(encoding="utf-8"))
            self.assertGreater(len(samples), 0)

            for sample in samples:
                self.assertLessEqual(sample["run_count"], NUM_WORKERS)
                for run in sample["runs"]:
                    self.assertTrue(run["run_id"])
                    if run["handoff_digest"] is not None:
                        self.assertEqual(len(run["handoff_digest"]), 64)

            final = ParallelState(state_root).status_snapshot()
            self.assertEqual(len(final.runs), NUM_WORKERS)
            for run in final.runs:
                self.assertIsNotNone(run.handoff_digest)
        finally:
            shutil.rmtree(state_root, ignore_errors=True)


class IntegratorClaimRaceTest(unittest.TestCase):
    def test_concurrent_integrator_claims_exactly_one_atomic_winner(self) -> None:
        state_root = Path(tempfile.mkdtemp(prefix="hai-integrator-"))
        try:
            state = ParallelState(state_root)
            state.ensure_layout()

            ctx = mp.get_context("spawn")
            claimers = 12
            barrier = ctx.Barrier(claimers)
            result_dir = state_root / "claims"
            result_dir.mkdir()

            processes: list[mp.Process] = []
            for index in range(claimers):
                claimer_id = f"claimer-{index:02d}"
                result_path = str(result_dir / f"{claimer_id}.json")
                proc = ctx.Process(
                    target=_claim_worker,
                    args=(str(state_root), claimer_id, result_path, barrier),
                    name=claimer_id,
                )
                processes.append(proc)

            for proc in processes:
                proc.start()
            for proc in processes:
                proc.join(timeout=30)
                self.assertEqual(proc.exitcode, 0)

            outcomes = [
                json.loads((result_dir / f"claimer-{i:02d}.json").read_text(encoding="utf-8"))
                for i in range(claimers)
            ]
            winners = [o for o in outcomes if o["claimed"]]
            self.assertEqual(len(winners), 1)

            claim_path = state_root / "integrator" / "claim.json"
            claim = json.loads(claim_path.read_text(encoding="utf-8"))
            self.assertEqual(claim["claimer_id"], winners[0]["claimer_id"])
            self.assertIn("claimed_at", claim)
            self.assertIn("pid", claim)

            snapshot = state.status_snapshot()
            self.assertTrue(snapshot.integrator_claimed)
            self.assertEqual(snapshot.integrator_claimer, winners[0]["claimer_id"])
        finally:
            shutil.rmtree(state_root, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
