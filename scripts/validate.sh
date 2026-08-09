#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "${BASH_SOURCE[0]%/*}/.." && pwd)"

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

command -v jq >/dev/null 2>&1 || fail "jq is required"
bash -n "$ROOT/scripts/validate.sh" || fail "scripts/validate.sh has invalid Bash syntax"

required_files=(
  ".gitignore"
  "AGENTS.md"
  "README.md"
  "docs/ARCHITECTURE.md"
  "contracts/README.md"
  "contracts/capability-agent.schema.json"
  "contracts/session-event.schema.json"
  "contracts/tree-node.schema.json"
  "contracts/run-contract.schema.json"
  "contracts/hai-fail.schema.json"
  "contracts/promotion.schema.json"
  "registry/agents/hermes.json"
  "registry/agents/claude-code.json"
  "registry/agents/opencode.json"
  "registry/agents/pi.json"
  "registry/agents/codex.json"
  "registry/components/hai-mcp.json"
  "registry/components/crabbox.json"
  "tree/root.json"
  "fails/0001-github-repository-discovery.json"
  "workbench/README.md"
  "stable/README.md"
  "parking/README.md"
  "scripts/validate.sh"
  ".github/workflows/validate.yml"
)

for relative_path in "${required_files[@]}"; do
  [[ -f "$ROOT/$relative_path" ]] || fail "missing required file: $relative_path"
done

check_json_tree() {
  local directory="$1"
  local path

  for path in "$directory"/* "$directory"/.[!.]* "$directory"/..?*; do
    [[ -e "$path" ]] || continue
    case "$path" in
      "$ROOT/.git"|"$ROOT/hai-mcp"|"$ROOT/MBP_HAI_MIGRATION"|"$ROOT/runtime"|"$ROOT/sessions/raw"|"$ROOT/.local"|"$ROOT/tmp"|*.local.json|*/node_modules|*/.worker-home)
        continue
        ;;
    esac

    if [[ -d "$path" ]]; then
      check_json_tree "$path"
    elif [[ "$path" == *.json ]]; then
      jq empty "$path" >/dev/null || fail "invalid JSON: ${path#"$ROOT/"}"
    fi
  done
}

check_json_tree "$ROOT"

for schema in "$ROOT"/contracts/*.schema.json; do
  jq -e '
    .["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    and (.title | type == "string" and length > 0)
    and (.type == "object")
  ' "$schema" >/dev/null || fail "invalid schema header: ${schema#"$ROOT/"}"
done

jq -e '
  (.required | index("kind"))
  and (.required | index("state"))
  and (.properties.state.enum | index("installed_unqualified"))
  and (.properties.state.enum | index("installed_provider_unconfigured"))
  and (.properties.state.enum | index("candidate_unverified"))
' "$ROOT/contracts/capability-agent.schema.json" >/dev/null || fail "capability/agent schema lacks central fields or states"

jq -e '
  (.required | index("event_id"))
  and (.required | index("session_id"))
  and (.required | index("content_policy"))
  and (.properties.type.enum | index("branched"))
  and (.properties.type.enum | index("blocked"))
' "$ROOT/contracts/session-event.schema.json" >/dev/null || fail "session-event schema lacks central fields or states"

jq -e '
  (.required | index("parent_id"))
  and (.required | index("graph_refs"))
  and (.required | index("next_step"))
  and (.properties.state.enum | index("active"))
  and (.properties.state.enum | index("parked"))
' "$ROOT/contracts/tree-node.schema.json" >/dev/null || fail "tree-node schema lacks central fields or states"

jq -e '
  (.required | index("goal"))
  and (.required | index("non_goal"))
  and (.required | index("boundaries"))
  and (.required | index("dod"))
  and (.required | index("stop_criterion"))
  and (.required | index("control_plane"))
  and (.properties.status.enum | index("DONE"))
  and (.properties.status.enum | index("PARKED"))
  and (.properties.status.enum | index("BLOCKED"))
  and (.properties.control_plane.properties.status.enum | index("DEGRADED"))
  and (.properties.control_plane.required | index("hai_fail_id"))
  and (.properties.control_plane.required | index("backfill_required"))
' "$ROOT/contracts/run-contract.schema.json" >/dev/null || fail "run-contract schema lacks dispatch fields or terminal states"

jq -e '
  (.required | index("regression_test"))
  and (.required | index("safety_boundary"))
  and (.required | index("content_policy"))
  and (.properties.status.enum | index("open"))
' "$ROOT/contracts/hai-fail.schema.json" >/dev/null || fail "HAI-fail schema lacks central fields or states"

jq -e '
  .properties.pipeline.const == [
    "Discover",
    "Qualify",
    "Sandbox",
    "Functional Check",
    "Contract Validation",
    "Tests/Conformance",
    "Tryout",
    "read-only Review",
    "Owner Gate",
    "Stable"
  ]
  and (.properties.owner_gate.properties.status.enum | index("approved"))
' "$ROOT/contracts/promotion.schema.json" >/dev/null || fail "promotion schema lacks the fail-closed pipeline"

check_agent() {
  local file="$1"
  local id="$2"
  local version="$3"
  local state="$4"

  jq -e --arg id "$id" --arg version "$version" --arg state "$state" '
    .["$schema"] == "../../contracts/capability-agent.schema.json"
    and .schema_version == "1.0.0"
    and .kind == "agent"
    and .id == $id
    and .version == $version
    and .state == $state
    and .observed_at == "2026-08-07"
    and .observation.source == "owner_supplied_local_observation"
    and (.observation.scope == ["installation", "version"])
    and (has("auth") | not)
    and (has("capabilities") | not)
  ' "$file" >/dev/null || fail "dishonest or incomplete agent registry: ${file#"$ROOT/"}"
}

check_agent "$ROOT/registry/agents/hermes.json" "hermes" "0.18.2" "installed_provider_unconfigured"
check_agent "$ROOT/registry/agents/claude-code.json" "claude-code" "2.1.224" "installed_unqualified"
check_agent "$ROOT/registry/agents/opencode.json" "opencode" "1.18.1" "installed_unqualified"
check_agent "$ROOT/registry/agents/pi.json" "pi" "0.84.1" "installed_unqualified"
check_agent "$ROOT/registry/agents/codex.json" "codex" "0.144.4" "installed_unqualified"

jq -e '
  .kind == "component"
  and .id == "hai-mcp"
  and .state == "present_unqualified"
  and .role == "mcp_binding"
  and .relative_path == "hai-mcp"
  and .observed_at == "2026-08-07"
  and (has("capabilities") | not)
' "$ROOT/registry/components/hai-mcp.json" >/dev/null || fail "hai-mcp registry state is not conservative"

jq -e '
  .kind == "component"
  and .id == "crabbox"
  and .state == "candidate_unverified"
  and .upstream_url == "https://github.com/openclaw/crabbox"
  and .observed_at == "2026-08-07"
  and (has("capabilities") | not)
' "$ROOT/registry/components/crabbox.json" >/dev/null || fail "Crabbox registry state is not conservative"

jq -e '
  .id == "hai-root"
  and .kind == "root"
  and .state == "active"
  and .limits.max_active_top_level_lanes == 2
  and .limits.max_writing_slices_per_lane == 1
  and (.artifact_paths | length > 0)
  and (.next_step | length > 0)
' "$ROOT/tree/root.json" >/dev/null || fail "tree root lacks central state or limits"

jq -e '
  .id == "0001-github-repository-discovery"
  and .status == "open"
  and ([.attempts[].result] == ["empty_results", "network_unavailable", "access_denied"])
  and .regression_test.status == "desired"
  and (.regression_test.precondition | contains("Research-Agent"))
  and .content_policy.secrets_stored == false
  and .content_policy.hidden_reasoning_stored == false
  and (.next_step | length > 0)
' "$ROOT/fails/0001-github-repository-discovery.json" >/dev/null || fail "first HAI-fail record is incomplete or unsafe"

require_text() {
  local file="$1"
  local needle="$2"
  local contents
  contents="$(<"$file")"
  [[ "$contents" == *"$needle"* ]] || fail "missing required text in ${file#"$ROOT/"}: $needle"
}

require_text "$ROOT/.gitignore" "/hai-mcp/"
require_text "$ROOT/.gitignore" "/MBP_HAI_MIGRATION/"
require_text "$ROOT/.gitignore" "/runtime/"
require_text "$ROOT/.gitignore" "/sessions/raw/"
require_text "$ROOT/AGENTS.md" "- Goal (1 Satz)"
require_text "$ROOT/AGENTS.md" "- Non-Goal (was explizit NICHT)"
require_text "$ROOT/AGENTS.md" "- Boundaries (Write-Root-Pfad; außerhalb = verboten)"
require_text "$ROOT/AGENTS.md" "- DoD (woran Erfolg messbar ist, mit Datei-Pfaden)"
require_text "$ROOT/AGENTS.md" "- Stop-Kriterium (wann abbrechen und zurückmelden)"
require_text "$ROOT/AGENTS.md" "Discover -> Qualify -> Sandbox -> Functional Check -> Contract Validation -> Tests/Conformance -> Tryout -> read-only Review -> Owner Gate -> Stable"
require_text "$ROOT/AGENTS.md" "Jede Arbeit an HAI ist selbst eine HAI-Session"
require_text "$ROOT/AGENTS.md" "verpflichtende primäre Control-Plane-Pfad"
require_text "$ROOT/AGENTS.md" 'sichtbarem `DEGRADED`-Status, HAI-Fail und geplantem Backfill'
require_text "$ROOT/AGENTS.md" "HAI-MCP bleibt eine Bindung, nicht die Identität von HAI"
require_text "$ROOT/AGENTS.md" "Jede Selbständerung beginnt als versionierte Workbench-Variante"
require_text "$ROOT/docs/ARCHITECTURE.md" "Jede Änderung an HAI läuft als HAI-Session"
require_text "$ROOT/docs/ARCHITECTURE.md" "Ein stiller Bypass ist unzulässig"

printf 'PASS: HAI control root validation\n'
