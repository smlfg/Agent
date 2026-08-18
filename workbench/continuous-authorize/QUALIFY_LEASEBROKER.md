# QUALIFY — leasebroker

**Mission:** `M-20260818T164814-da71496c`  
**Upstream:** https://github.com/TomCruiseTorpedo/leasebroker  
**npm:** `leasebroker@0.3.0` (Apache-2.0)  
**Stufe:** Discover → Qualify → Sandbox (Functional Check teilweise via Smoke) — **nicht** Contract Validation / Tryout / Stable  
**Vorlage:** `workbench/continuous-authorize/UPSTREAM_SEARCH.md` (Decision: use leasebroker)

## Discover

| Feld | Wert |
|---|---|
| Zweck | Time-bounded, least-privilege Capability-Leases für Agenten/MCP; Deny-by-default; Revoke mid-flight; Audit hash-chained |
| Install | `npm install leasebroker@0.3.0` (Node ≥20); CLI via `npx leasebroker` |
| Sandbox-Pfad | `workbench/continuous-authorize/sandbox/` |
| Andock an HAI | Ergänzung zu `hai_authorize_session`: Mission-Lease bleibt Control Plane; leasebroker kann Tool-/Pfad-Capabilities enforcen (MCP `serve` Proxy oder `LeaseEnforcer.check`) |
| Nicht | Kein Ersatz für hai-mcp; `agentId` ist nicht authentifiziert (Identity upstream) |

## Smoke (2026-08-18)

Skript: `sandbox/smoke-deny-revoke.mjs` → `sandbox/smoke-result.json` (`ok: true`).

| Check | Ergebnis |
|---|---|
| Request ohne Allow-Rule | `denied` — *No matching allow-rule for capability kind 'fs.read'* |
| CLI denselben Deny | exit `2`, JSON `type: denied` |
| Grant mit `rules-allow-fs.json` | `granted`, Lease-ID gesetzt; Enforce `./data/hello.txt` = ok |
| Out-of-scope Pfad | `./private/secret.txt` = deny |
| Revoke + Enforce | `ok: false`, reason `lease has been revoked` |
| CLI grant → revoke | `{"type":"revoked","leaseId":"47153ce7-…"}`; Audit enthält issuance + revocation |

## Registry

`registry/components/leasebroker.json` — `candidate_unverified` (Smoke belegt; kein hai-mcp Runtime-Andock, keine Promotion).

## Gaps / Next

1. Contract-Doc: Continuous Authorize (Plan-ACCEPT + Step-Lease / One-Call) — Owner-Go.
2. Probe: `leasebroker serve` vor einem MCP (z. B. read-only) mit `--strict`.
3. Companion-Qualify (separat): `agent-approval-gate`, LangGraph interrupt.
4. STACK.md-Zeile nach Owner-Freigabe.

## Stop

Kein Runtime-Wiring in hai-mcp in diesem Slice.
