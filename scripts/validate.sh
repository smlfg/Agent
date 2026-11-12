#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

python3 - <<'PY'
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

root = Path.cwd()
required = [
    'README.md', 'AGENTS.md', 'docs/PROJECT.md', 'research/README.md',
    'src/README.md', 'tests/README.md', 'scripts/validate.sh',
    'sketches/2026-11-12-agentfaehig.md', 'Agentfähig/GreateWriting.txt',
    'docs/DESIGN-DECISIONS.md', 'research/SCOUT-SYNTHESIS.md',
    'skills/grilling/SKILL.md', 'Idea',
]
errors = []
for name in required:
    path = root / name
    if not path.is_file() or not path.stat().st_size:
        errors.append(f'Missing or empty: {name}')

# Check the authored scaffold documentation, not imported source material.
docs = [root / name for name in required if name.endswith('.md')
        and not name.startswith('sketches/')]
for path in docs:
    if not path.is_file():
        continue
    for target in re.findall(r'\]\(([^\s)]+)\)', path.read_text(encoding='utf-8')):
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        if not (path.parent / unquote(parsed.path)).exists():
            errors.append(f'Broken link in {path.relative_to(root)}: {target}')

if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print('OK: project scaffold and local documentation links')
PY
