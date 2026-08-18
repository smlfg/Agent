# UPSTREAM_SEARCH

## Need
Continuous Authorize: nach Plan-ACCEPT muss Freigabe schrittweise und fail-closed bleiben (kein Session-Grant), weil Agenten keine Verantwortung haben und auch starke Modelle Methoden-Drift + Host-Schäden erzeugen (Owner musste Terminal killen).

## Slice / Mission
- mission_id: `M-20260818T164534-950ddfe3`
- write_root: `/Users/samuelfleig/Projects/03_HAI/workbench/continuous-authorize`
- motivierender Fail: `fails/0014-execute-ohne-continuous-authorize.json`
- verwandt: `docs/PLAN_ACCEPTANCE_GATE.md` (einmaliger Stempel), `hai_authorize_session` (Lease existiert, überwacht aber keine Schritte/RAM)

## Candidates (≥3)

### 1. leasebroker
- url: https://github.com/TomCruiseTorpedo/leasebroker
- license_or_note: prüfen bei Qualify (PASETO leases, MCP middleware proxy)
- dock_idea: Capability-Leases (scoped, expiring, revocable, human veto) vor `tools/call` — verdrahten als Ergänzung/Vorbild zu `hai_authorize_session`; Enforcement-Proxy vor MCP/`execute`
- verdict: use
- reason: Semantik am nächsten an HAI (Lease ≠ stehende Vollmacht); Deny-by-default; Revoke mid-flight; passt zu „Autorisierung endet erst mit Close“

### 2. agent-approval-gate
- url: https://github.com/byQuexo/agent-approval-gate
- license_or_note: zero-runtime-deps Core; YAML-Policy optional
- dock_idea: Jede Write/Destructive-Aktion einzeln freigeben; **kein** `approveAll` / Session-Cache — Wrapper um Tool-Execute in Main Session / Worker
- verdict: use
- reason: Löst exakt den Schauen-Fehler (ein ACCEPT, dann `read_bytes`-Drift); strukturelle One-Call-Authorize-Regel

### 3. LangGraph (interrupt / HITL)
- url: https://github.com/langchain-ai/langgraph
- license_or_note: MIT; bereits in STACK als `langfuse-langchain-langgraph` (candidate_unverified, Tracing-Fokus)
- dock_idea: Durable `interrupt()` + Checkpointer vor riskanten Steps; Gate-Agent resumed mit Command — Muster für Continuous Authorize ohne Eigenbau des Pause/Resume
- verdict: use
- reason: Produktionsreifes Interrupt/Resume; trennt Freigabe vom Executer; STACK-Andock vorhanden (nicht Control-Plane-Ersatz)

### 4. AgentGovernor
- url: https://github.com/veristamp/AgentGovernor
- license_or_note: prüfen bei Qualify
- dock_idea: PlanYAML → Validator → Owner/Gate-Approve → deterministischer DAG-Executor (LLM plant, Runtime führt) — Pattern für Plan≠Execute
- verdict: reject (als Primary)
- reason: Starkes Plan-Validate-Execute-Muster, aber schwerer Stack und weniger Lease/MCP-nativ; als Pattern-Referenz behalten, nicht First-Install

### 5. OpenShell (NVIDIA)
- url: https://github.com/NVIDIA/OpenShell
- license_or_note: prüfen bei Qualify
- dock_idea: Sandbox + Policy auf FS/Netz/Prozess für Agent-`execute` — Host-Ceiling (RAM/Pfad), den Mission-Lease nicht liefert
- verdict: reject (als Primary dieses Slices)
- reason: Löst Ressourcen-/Sandbox-Seite, nicht die Autorisierungs-Rolle „wer freigibt bleibt im Loop“; Folge-Slice nach Lease+Gate

### 6. microsoft/agent-governance-toolkit
- url: https://github.com/microsoft/agent-governance-toolkit
- license_or_note: prüfen bei Qualify (OPA/Cedar, Kill-Switch)
- dock_idea: Policy vor jeder Aktion + Termination — Enterprise-Governance-Layer
- verdict: reject (als Primary)
- reason: Umfangreich, multi-package; Qualify-Aufwand hoch; Muster Kill-Switch/Policy behalten für spätere Runtime-Lane

### 7. builderz-labs/mission-control
- url: https://github.com/builderz-labs/mission-control
- license_or_note: prüfen bei Qualify
- dock_idea: Control-Plane-UI/CLI für Dispatch + Review-Gates über Claude/Codex/… — Operator-Aufsicht
- verdict: reject (als Primary)
- reason: Überlappt mit hai-mcp Identity; eher UI/Fleet-Ops als Vertrags-Gate; nach Lease-Dock neu bewerten

## Decision
use **leasebroker** als Primary-Andock für Capability-Leases; Companion-Patterns **agent-approval-gate** (One-Call-Freigabe) und **LangGraph interrupt** (durable Pause/Resume) im selben Qualify-Pfad prüfen — kein Eigenbau der Authorize-Schleife.

## If use
- install: noch nicht in diesem Slice (Non-Goal). Nächster Slice: Discover→Qualify für leasebroker (+ Smoke agent-approval-gate / LangGraph interrupt Docs)
- stack_row: geplant unter `STACK.md` — `leasebroker` = capability-lease broker vor Agent-Tool/MCP; Companion `agent-approval-gate`; LangGraph bereits Zeile (Rolle um HITL-Interrupt erweitern, nicht nur Trace)
- registry: geplant `registry/components/leasebroker.json` + ggf. `agent-approval-gate.json` nach Sandbox-Smoke
- smoke_evidence: nach Qualify — Lease ausstellen, Tool-Call ohne Lease deny, Revoke mid-flight; optional eine Write-Aktion durch Approval-Gate gehalten

## Notes (HAI-Prinzip)
Autorisierung ist Aufsicht, kein Stempel. Plan-ACCEPT bleibt; Continuous Authorize hält den Executer danach. Agenten führen aus; Struktur autorisiert bis Close/Park/Block.
