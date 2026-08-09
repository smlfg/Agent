"""Filesystem-backed parallel run state with write-once handoffs."""

from __future__ import annotations

import fcntl
import hashlib
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


class ParallelStateError(Exception):
    """Base error for parallel state operations."""


class ReservationError(ParallelStateError):
    """Run reservation failed."""


class RunLimitError(ReservationError):
    """Maximum concurrent runs reached."""


class HandoffExistsError(ParallelStateError):
    """Handoff for this run already exists (write-once)."""


class IntegratorClaimedError(ParallelStateError):
    """Integrator slot already claimed."""


class CompletionError(ParallelStateError):
    """Run completion failed."""


_RUN_ID_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$")
_COMPLETION_MARKER = "completed.marker"
_COMPLETION_LOG = "completion.log"


@dataclass(frozen=True)
class RunStatus:
    run_id: str
    workspace: Path
    handoff_digest: str | None
    reserved_at: str
    completed: bool


@dataclass(frozen=True)
class StatusSnapshot:
    runs: tuple[RunStatus, ...]
    integrator_claimed: bool
    integrator_claimer: str | None


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _digest_payload(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _validate_run_id(run_id: str) -> None:
    if not run_id:
        raise ReservationError("invalid run_id: empty")
    if run_id.startswith(".") or "/" in run_id or "\\" in run_id:
        raise ReservationError(f"invalid run_id: {run_id!r}")
    if ".." in run_id:
        raise ReservationError(f"invalid run_id: {run_id!r}")
    if run_id.startswith("/") or (len(run_id) >= 2 and run_id[1] == ":"):
        raise ReservationError(f"invalid run_id: {run_id!r}")
    if not _RUN_ID_RE.match(run_id):
        raise ReservationError(f"invalid run_id: {run_id!r}")


def _atomic_write_text(path: Path, content: str) -> None:
    tmp = path.with_name(f".{path.name}.atomic-{os.getpid()}.tmp")
    tmp.write_text(content, encoding="utf-8")
    os.replace(tmp, path)


class ParallelState:
    """Deep filesystem state for isolated parallel agent runs."""

    MAX_RUNS = 10

    def __init__(self, root: os.PathLike[str] | str) -> None:
        self.root = Path(root)
        self.runs_dir = self.root / "runs"
        self.handoffs_dir = self.root / "handoffs"
        self.integrator_dir = self.root / "integrator"
        self._claim_path = self.integrator_dir / "claim.json"
        self._reserve_lock = self.runs_dir / ".reserve.lock"

    def ensure_layout(self) -> None:
        self.runs_dir.mkdir(parents=True, exist_ok=True)
        self.handoffs_dir.mkdir(parents=True, exist_ok=True)
        self.integrator_dir.mkdir(parents=True, exist_ok=True)
        if not self._reserve_lock.exists():
            self._reserve_lock.touch()

    def _assert_run_path_contained(self, run_dir: Path) -> None:
        runs_root = self.runs_dir.resolve()
        resolved = run_dir.resolve()
        if resolved != runs_root and not str(resolved).startswith(str(runs_root) + os.sep):
            raise ReservationError(f"path escapes runs_dir: {run_dir}")
        if run_dir.is_symlink():
            raise ReservationError(f"symlink escape: {run_dir}")

    def _active_run_dirs(self) -> list[Path]:
        active: list[Path] = []
        for path in sorted(self.runs_dir.iterdir()):
            if not path.is_dir() or path.name.startswith("."):
                continue
            if (path / _COMPLETION_MARKER).exists():
                continue
            active.append(path)
        return active

    def blob_path_for_digest(self, digest: str) -> Path:
        return self.handoffs_dir / digest[:2] / digest / "payload"

    def reserve_run(self, run_id: str) -> Path:
        _validate_run_id(run_id)

        self.ensure_layout()
        run_dir = self.runs_dir / run_id
        self._assert_run_path_contained(run_dir)
        workspace = run_dir / "workspace"

        if run_dir.exists():
            if run_dir.is_symlink():
                raise ReservationError(f"symlink escape: {run_id}")
            raise ReservationError(f"run already reserved: {run_id}")

        with self._reserve_lock.open("r+", encoding="utf-8") as lock_file:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
            active = self._active_run_dirs()
            if len(active) >= self.MAX_RUNS:
                raise RunLimitError(f"maximum of {self.MAX_RUNS} concurrent runs reached")

            run_dir.mkdir(exist_ok=False)
            workspace.mkdir(exist_ok=False)

            meta = {
                "run_id": run_id,
                "workspace": str(workspace),
                "reserved_at": _utc_now(),
                "pid": os.getpid(),
            }
            _atomic_write_text(run_dir / "meta.json", json.dumps(meta, indent=2) + "\n")

        return workspace

    def complete_run(self, run_id: str) -> None:
        _validate_run_id(run_id)
        run_dir = self.runs_dir / run_id
        if not run_dir.is_dir() or run_dir.is_symlink():
            raise CompletionError(f"unknown run: {run_id}")
        if (run_dir / _COMPLETION_MARKER).exists():
            raise CompletionError(f"run already completed: {run_id}")

        marker_path = run_dir / _COMPLETION_MARKER
        entry = f"{run_id}\t{_utc_now()}\t{os.getpid()}\n"

        with self._reserve_lock.open("r+", encoding="utf-8") as lock_file:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
            if not run_dir.is_dir():
                raise CompletionError(f"unknown run: {run_id}")
            if marker_path.exists():
                raise CompletionError(f"run already completed: {run_id}")

            completion_log = self.runs_dir / _COMPLETION_LOG
            with completion_log.open("a", encoding="utf-8") as log_handle:
                log_handle.write(entry)
                log_handle.flush()
                os.fsync(log_handle.fileno())

            fd = os.open(marker_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644)
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(entry)
                handle.flush()
                os.fsync(handle.fileno())

    def _store_content_addressed(self, payload: bytes, digest: str) -> Path:
        shard = digest[:2]
        blob_dir = self.handoffs_dir / shard / digest
        blob_dir.mkdir(parents=True, exist_ok=True)
        blob_path = blob_dir / "payload"

        if blob_path.exists():
            existing = blob_path.read_bytes()
            if existing != payload:
                raise ParallelStateError("content hash collision with differing payload")
            return blob_path

        try:
            fd = os.open(blob_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644)
        except FileExistsError:
            existing = blob_path.read_bytes()
            if existing != payload:
                raise ParallelStateError("content hash collision with differing payload")
            return blob_path

        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        return blob_path

    def write_handoff(self, run_id: str, payload: bytes) -> str:
        _validate_run_id(run_id)
        run_dir = self.runs_dir / run_id
        self._assert_run_path_contained(run_dir)
        if not run_dir.is_dir() or run_dir.is_symlink():
            raise ReservationError(f"unknown run: {run_id}")

        digest = _digest_payload(payload)
        ref_path = run_dir / "handoff.ref"
        lock_path = run_dir / ".handoff.lock"

        with lock_path.open("a", encoding="utf-8") as lock_file:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
            if ref_path.exists():
                raise HandoffExistsError(f"handoff already written for run: {run_id}")

            blob_path = self._store_content_addressed(payload, digest)

            try:
                fd = os.open(ref_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644)
            except FileExistsError:
                raise HandoffExistsError(f"handoff already written for run: {run_id}")

            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(digest + "\n")
                handle.flush()
                os.fsync(handle.fileno())

            if blob_path.read_bytes() != payload:
                raise ParallelStateError("blob bytes diverged after handoff write")

        return digest

    def _read_integrator_claim(self) -> dict | None:
        if not self._claim_path.is_file():
            return None
        try:
            claim = json.loads(self._claim_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            raise ParallelStateError("partial integrator claim.json")
        required = {"claimer_id", "pid", "claimed_at"}
        if not required.issubset(claim.keys()):
            raise ParallelStateError("incomplete integrator claim.json")
        return claim

    def status_snapshot(self) -> StatusSnapshot:
        self.ensure_layout()
        runs: list[RunStatus] = []

        for run_dir in sorted(self.runs_dir.iterdir()):
            if not run_dir.is_dir() or run_dir.name.startswith("."):
                continue

            meta_path = run_dir / "meta.json"
            if not meta_path.is_file():
                continue

            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                raise ParallelStateError(f"partial meta.json for {run_dir.name}")

            required_meta = {"run_id", "workspace", "reserved_at"}
            if not required_meta.issubset(meta.keys()):
                raise ParallelStateError(f"incomplete meta.json for {run_dir.name}")

            ref_path = run_dir / "handoff.ref"
            digest: str | None = None
            if ref_path.is_file():
                ref_text = ref_path.read_text(encoding="utf-8").strip()
                if ref_text:
                    if len(ref_text) != 64 or not all(c in "0123456789abcdef" for c in ref_text):
                        raise ParallelStateError(f"partial handoff.ref for {run_dir.name}")
                    digest = ref_text

            completed = (run_dir / _COMPLETION_MARKER).is_file()

            runs.append(
                RunStatus(
                    run_id=meta["run_id"],
                    workspace=Path(meta["workspace"]),
                    handoff_digest=digest,
                    reserved_at=meta["reserved_at"],
                    completed=completed,
                )
            )

        integrator_claimed = self._claim_path.is_file()
        integrator_claimer = None
        if integrator_claimed:
            claim = self._read_integrator_claim()
            integrator_claimer = claim["claimer_id"] if claim else None

        return StatusSnapshot(
            runs=tuple(runs),
            integrator_claimed=integrator_claimed,
            integrator_claimer=integrator_claimer,
        )

    def claim_integrator(self, claimer_id: str) -> bool:
        self.ensure_layout()
        claim = {
            "claimer_id": claimer_id,
            "pid": os.getpid(),
            "claimed_at": _utc_now(),
        }
        payload = json.dumps(claim, indent=2) + "\n"

        try:
            fd = os.open(self._claim_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644)
        except FileExistsError:
            return False

        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())

        published = self._read_integrator_claim()
        if published is None or published.get("claimer_id") != claimer_id:
            raise ParallelStateError("integrator claim not fully published")

        return True
