#!/usr/bin/env python3
"""Ersetzt absolute Home-Pfade durch relative Formen.

Ein oeffentliches Repo soll keine Home-Verzeichnis-Pfade enthalten. Aus
/Users/samuelfleig/Projects/03_HAI/Agentfaehig/Agent/docs/X.md wird
../<pfad> oder ~/Projects/... je nach Ziel.

Regel: Pfade innerhalb des Projekts -> relativ zum Repo-Root mit ~/.
       Pfade ausserhalb -> ~/Projects/... (kurz, portabel, ohne Benutzername).
"""
from pathlib import Path
import re
import sys

ROOT = Path.cwd()
HOME = "/Users/samuelfleig"

# Reihenfolge zaehlt: laengste Pfade zuerst.
REPLACEMENTS = [
    # Projektinterne Pfade -> ~/Projects/03_HAI/Agentfaehig/Agent/...
    (f"{HOME}/Projects/03_HAI/Agentfaehig/Agent", "~/Projects/03_HAI/Agentfaehig/Agent"),
    # Benachbarte Projekte
    (f"{HOME}/Projects/03_HAI", "~/Projects/03_HAI"),
    (f"{HOME}/Projects/00_AKTUELL", "~/Projects/00_AKTUELL"),
    (f"{HOME}/Projects/05_INBOX", "~/Projects/05_INBOX"),
    (f"{HOME}/Projects", "~/Projects"),
    # Werkzeuge
    (f"{HOME}/.local/share/uv", "~/.local/share/uv"),
    (f"{HOME}/.local/bin", "~/.local/bin"),
    (f"{HOME}/.hermes/node/bin", "~/.hermes/node/bin"),
    (f"{HOME}/.claude/skills", "~/.claude/skills"),
    (f"{HOME}/.config/opencode", "~/.config/opencode"),
    (f"{HOME}/.codex/skills", "~/.codex/skills"),
    (f"{HOME}/.agents/skills", "~/.agents/skills"),
    (f"{HOME}/.minimax", "~/.minimax"),
    (f"{HOME}/.hai", "~/.hai"),
    (f"{HOME}/.local/share", "~/.local/share"),
    (f"{HOME}/.config", "~/.config"),
    (f"{HOME}/.claude", "~/.claude"),
    (f"{HOME}/.npm", "~/.npm"),
    (f"{HOME}", "~"),
]

SKIP_DIRS = {".git", "node_modules", ".archify", "graphify-out"}
TEXT_SUFFIXES = {".md", ".json", ".jsonc", ".txt", ".yaml", ".yml", ".sh", ".ts", ".js"}


def main() -> int:
    changed = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if HOME not in text:
            continue
        new = text
        for old, repl in REPLACEMENTS:
            new = new.replace(old, repl)
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))
    for c in changed:
        print(f"  {c}")
    print(f"\n{len(changed)} Dateien angepasst")
    return 0


if __name__ == "__main__":
    sys.exit(main())
