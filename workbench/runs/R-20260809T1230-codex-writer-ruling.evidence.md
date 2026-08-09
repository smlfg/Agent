# Evidence — Codex Writer Ruling (Fremd-Review offen)

Run: `R-20260809T1230-codex-writer-ruling`  
Mission: `M-20260809T123054-ade76cbe`  
Writer lease: `S-20260809T123057-d598f5fb` (`agent_identity=codex`, role=writer)  
Datum: 2026-08-09

## Owner Ack

Codex alleiniger Writer erlaubt. Fremd-Harness-Review bleibt sichtbar offen bis Cursor (`api2.cursor.sh`) oder Hermes wieder dispatchbar ist. Kein Same-Harness-Review; `same_harness_owner_exception=false`.

Rechtsgrundlage: `03_HAI/AGENTS.md` Z.38 — kein stiller Fallback; unterschiedliche Harnesses außer ausdrücklicher Ausnahme (hier nicht beantragt für Review).

Park: `/Users/samuelfleig/.hai/inbox/park_20260809T123029_31607_fe5a3042.md`

## Harness

| Slot | ID | Status |
|------|----|--------|
| Worker | `codex` | leased / writing |
| Reviewer | `null` (pending) | PARKED — Unblock: Cursor oder Hermes |
| Same-harness exception | `false` | nicht genehmigt |

## Provider-Blocker (Kontext)

- Cursor: `api2.cursor.sh` wegen Netzsperre nicht erreichbar (Worker-Meldung).
- Hermes: Roster `installed_provider_unconfigured` / Reparatur — nicht dispatchbar.
- Baseline hai-mcp: 151 passed, Repo für Writer-Lock-Slice unverändert gelassen.

## Learning / Credits

Learning Block `LB-20260809T095643-7751613b` mit `owner_ack=true` completed → Writer Credits gemintet; ein Credit für dieses Writer-Lease verbraucht.

## Genau ein nächster Schritt

Fremd-Harness-Reviewer (nicht `codex`) assignen, sobald Cursor oder Hermes dispatchbar ist.
