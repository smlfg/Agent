#!/usr/bin/env bash
# Baut public/ für den Worker "agentfaehig" (agentfähig.de) aus src/ und der alten Startseite.
# public/ ist generiert und nicht versioniert.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="$HERE/public"

node "$ROOT/scripts/build-knowledge.mjs" --no-embed
rm -rf "$OUT"
mkdir -p "$OUT/classic"
rsync -a --exclude README.md --exclude 'agent/knowledge/' --exclude 'agent/orchestrator.js' "$ROOT/src/" "$OUT/"
rsync -a "$HERE/src/" "$OUT/"
mv "$OUT/living-surface.html" "$OUT/index.html"

# agentfähig.de hat kein eigenes Impressum/Datenschutz: wie die bisherige Seite auf HAI verweisen.
sed -i '' \
  -e 's#href="/impressum/"#href="https://www.human-agent-interface.com/impressum/"#' \
  -e 's#href="/datenschutz/"#href="https://www.human-agent-interface.com/datenschutz/"#' \
  "$OUT/index.html"

# Bisherige Startseite (Stand 08.10.2026) bleibt unter /classic/ erreichbar.
cp "$HERE/classic-source/agentfaehig-classic-2026-10-08.html" "$OUT/classic/index.html"
cp -R "$HERE/classic-source/fonts" "$OUT/classic/fonts"

grep -q 'id="composer-input"' "$OUT/index.html"
grep -q 'human-agent-interface.com/impressum/' "$OUT/index.html"
echo "build ok: $(find "$OUT" -type f | wc -l | tr -d ' ') Dateien in public/"
