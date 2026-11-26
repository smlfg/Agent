#!/usr/bin/env bash
# npm run eval [-- <promptfoo-Optionen>]. Braucht .env (MINIMAX_API_KEY) und Ollama mit bge-m3.
# Laeuft gegen eine Wegwerfkopie mit 30 s Zeitlimit statt 4 s, damit Netzlatenz keine
# Faelle rot faerbt. Der echte Worker bleibt unveraendert.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.."
repo="$PWD"
copy="$(mktemp -d)"
trap 'rm -rf "$copy"' EXIT

mkdir -p "$copy/deploy/agentfaehig-site"
cp -R src package.json "$copy/"
cp -R deploy/agentfaehig-site/src "$copy/deploy/agentfaehig-site/"
for modules in node_modules deploy/agentfaehig-site/node_modules; do
  if [ -d "$modules" ]; then ln -s "$repo/$modules" "$copy/$modules"; fi
done
worker="$copy/deploy/agentfaehig-site/src/worker.js"
sed -i.bak -e 's/AGENT_TIMEOUT_MS = 4000;/AGENT_TIMEOUT_MS = 30000;/' \
  -e 's/AGENT_TOTAL_BUDGET_MS = 9000;/AGENT_TOTAL_BUDGET_MS = 31000;/' "$worker"
grep -q 'AGENT_TIMEOUT_MS = 30000;' "$worker" || { echo "Zeitlimit in worker.js nicht gefunden" >&2; exit 2; }

set -a; . ./.env; set +a
AGENT_PROMPT_ROOT="$copy" PROMPTFOO_DISABLE_TELEMETRY=1 npx -y promptfoo@0.126.0 eval \
  -c evals/promptfoo/promptfoo-eval.yaml --repeat "${EVAL_REPEAT:-3}" \
  --no-cache --no-write --no-share -j 1 -o evals/promptfoo/eval-last-run.html "$@"
