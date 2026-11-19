#!/usr/bin/env bash
# Prüft die Dateinamen des Projekts gegen die Regel in docs/DATEINAMEN.md.
# Aufruf: bash scripts/check-names.sh
set -uo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

python3 - <<'PY'
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

root = Path.cwd()

# Nicht Projektinhalt, sondern Fremd-/Generat: wird nicht bewertet.
EXCLUDE_DIRS = {".git", "node_modules", ".opencode", ".archify", "graphify-out"}
SKIP_SUBTREES = ("skills/", "sketches/raw/", "sketches/blocks/", "tech/m0/runs/", "tech/evidence/")

# Namen, die aus einem fremden System stammen und dort Verweisziel sind.
NAME_WHITELIST = {
    "README.md",                  # Konvention: eine README je Ordner
    "SKILL.md",                   # Konvention der Skill-Pakete
    "LICENSE.txt",
    "PLAN_VALIDATION_REPORT.md",  # kanonischer Anker des Plan-Validators (03_HAI)
}

# Stilhinweis, kein Fehler: Bindestrich ist die Projektkonvention.
UNDERSCORE_PREFIX_OK = {"EXECUTION_PLAN", "PROJECT_CONTRACT", "PRIOR_ART_REPORT"}


def files():
    out = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
        capture_output=True, text=True, check=True,
    ).stdout.splitlines()
    for p in map(Path, filter(None, out)):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        if any(str(p).startswith(s) for s in SKIP_SUBTREES):
            continue
        if p.is_file():
            yield p


errors, hints = [], []
project = list(files())

# 1 · Eindeutiger Basisname im ganzen Projekt.
by_name = defaultdict(list)
for p in project:
    if p.name not in NAME_WHITELIST:
        by_name[p.name].append(str(p))
for name, paths in sorted(by_name.items()):
    if len(paths) > 1:
        errors.append(f"doppelter Dateiname '{name}': {', '.join(sorted(paths))}")

for p in project:
    # 2 · Jede Datei hat eine Endung (Dotfiles wie .gitignore ausgenommen).
    if not p.name.startswith(".") and not p.suffix:
        errors.append(f"keine Dateiendung: {p}")
    # 3 · Keine Leerzeichen und keine Umlaute (Link- und Werkzeugsicherheit).
    if " " in p.name:
        errors.append(f"Leerzeichen im Dateinamen: {p}")
    if any(ch in p.name for ch in "äöüÄÖÜß"):
        errors.append(f"Umlaut im Dateinamen: {p}")
    # 4 · Stilhinweis: Unterstriche nur bei den etablierten Ankern.
    if p.name not in NAME_WHITELIST and "_" in p.name:
        if not any(p.name.startswith(pref) for pref in UNDERSCORE_PREFIX_OK):
            hints.append(f"Unterstrich statt Bindestrich: {p}")

if errors:
    print(f"FEHLER — {len(errors)} Namensverstoß/Verstöße:\n")
    for e in errors:
        print(f"  - {e}")
    print("\nRegel: docs/DATEINAMEN.md")
    sys.exit(1)

print(f"OK: {len(project)} Dateien — Basisnamen eindeutig, Endung vorhanden, ASCII, ohne Leerzeichen")
if hints:
    print(f"\nHinweise ({len(hints)}, kein Fehler):")
    for h in hints:
        print(f"  - {h}")
PY
