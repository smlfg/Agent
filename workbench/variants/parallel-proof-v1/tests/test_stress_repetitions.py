"""Stress repetitions of the 10-way race via isolated subprocess runs."""

from __future__ import annotations

import os
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STRESS_REPETITIONS = 50


class StressRepetitionTest(unittest.TestCase):
    def test_fifty_full_repetition_runs(self) -> None:
        env = os.environ.copy()
        env["PYTHONPATH"] = str(ROOT / "src")

        for iteration in range(STRESS_REPETITIONS):
            proc = subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "unittest",
                    "test_ten_way_race.TenWayRaceTest.test_ten_way_parallel_race",
                ],
                cwd=ROOT / "tests",
                env=env,
                capture_output=True,
                text=True,
            )
            self.assertEqual(
                proc.returncode,
                0,
                f"iteration {iteration} failed:\nstdout={proc.stdout}\nstderr={proc.stderr}",
            )


if __name__ == "__main__":
    unittest.main()
