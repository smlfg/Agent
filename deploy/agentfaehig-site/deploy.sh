#!/usr/bin/env bash
# Einziger vorgesehener Weg, agentfähig.de zu deployen.
# Schutz gegen Fehldeploy: deployt ausschließlich den Worker "agentfaehig" aus diesem Ordner,
# nur nach grünen Tests, Build und Dry-Run, nur mit --prod, und prüft danach beide Seiten.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
W="${WRANGLER:-$HOME/Projects/00_AKTUELL/claudeflareworkerhaus/node_modules/.bin/wrangler}"
cd "$HERE"

name="$(sed -n 's/^ *"name": *"\([^"]*\)".*/\1/p' wrangler.jsonc | head -1)"
if [ "$name" != "agentfaehig" ]; then
  echo "ABBRUCH: wrangler.jsonc nennt Worker '$name', erwartet 'agentfaehig'." >&2; exit 2
fi
if grep -q '"routes"\|"route"' wrangler.jsonc; then
  echo "ABBRUCH: routes in wrangler.jsonc – die Custom Domains bleiben im Dashboard." >&2; exit 2
fi

( cd "$ROOT" && npm test >/dev/null ) || { echo "ABBRUCH: npm test rot." >&2; exit 3; }
node --check src/worker.js
bash "$HERE/build.sh"
"$W" deploy --dry-run --outdir "$(mktemp -d)" >/dev/null

if [ "${1:-}" != "--prod" ]; then
  echo "Dry-Run ok. Produktiv nur mit: bash deploy/agentfaehig-site/deploy.sh --prod"; exit 0
fi

before="$("$W" deployments list --name agentfaehig 2>/dev/null | grep -o '(100%) [0-9a-f-]*' | tail -1)"
echo "Vorher live: $before"
"$W" deploy --name agentfaehig
after="$("$W" deployments list --name agentfaehig 2>/dev/null | grep -o '(100%) [0-9a-f-]*' | tail -1)"
echo "Jetzt live:  $after   (Rücksprung: wrangler rollback ${before#(100%) } --name agentfaehig)"
sleep 3
bash "$HERE/verify-live.sh"
