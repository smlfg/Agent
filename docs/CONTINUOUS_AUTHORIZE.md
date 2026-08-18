# Continuous Authorize

**Status:** ACTIVE Contract (Doku-Gate; keine hai-mcp-Enforcement in diesem Slice)  
**Mission:** `M-20260818T165240-4b06e4f4`  
**Fail:** [`fails/0014-execute-ohne-continuous-authorize.json`](../fails/0014-execute-ohne-continuous-authorize.json)  
**Upstream:** [`workbench/continuous-authorize/UPSTREAM_SEARCH.md`](../workbench/continuous-authorize/UPSTREAM_SEARCH.md) · Qualify: [`QUALIFY_LEASEBROKER.md`](../workbench/continuous-authorize/QUALIFY_LEASEBROKER.md) · Registry: [`leasebroker`](../registry/components/leasebroker.json)  
**Abgrenzung:** Plan-Acceptance ([`PLAN_ACCEPTANCE_GATE.md`](PLAN_ACCEPTANCE_GATE.md)) und Upstream-First ([`UPSTREAM_FIRST_GATE.md`](UPSTREAM_FIRST_GATE.md)) bleiben separate Gates.

## Zweck

Agenten haben keine Verantwortung als Rolle — auch starke Modelle machen dumme lokale Shortcuts. HAI legt Haftung in **Struktur**: wer freigibt, bleibt zuständig, bis Close / Park / Block.

**Autorisierung ist Aufsicht, kein Stempel.** Ein einmaliges Plan-`ACCEPT` reicht nicht für den ganzen Executer-Lauf.

## Prinzip

1. **Ausführer ≠ Autorisierer** — wer den Plan freigibt, führt ihn nicht allein durch und darf Drift stoppen.
2. **Freigabe ist laufend** — riskante Steps brauchen erneute, scoped Freigabe; kein Session-Grant für „alles unter Write-Root“.
3. **Eine Freigabe = ein Step / eine Capability** — kein `approveAll`, kein Übertragen auf Methodenwechsel.
4. **Owner ist letzter Autorisierer** — Terminal-Kill / manueller Stop = Control-Plane-`BLOCKED`/`abandoned` mit Evidenz, nicht stille Fortsetzung.

## Schichten (nicht kollabieren)

```text
Plan-Acceptance (ACCEPT)
  → Mission-Lease (hai_open_mission + hai_authorize_session)
    → Step- / Capability-Lease (Continuous Authorize)
      → Execute
        → Close | Park | Block | Revoke
```

| Schicht | Was sie freigibt | Was sie nicht freigibt |
|---|---|---|
| **Plan-ACCEPT** | Build-/Executer-Lane darf *starten* | Konkrete Tool-Calls, Methoden, Host-Ressourcen |
| **Mission-Lease** | Wer, Write-Root, Zeit, Criterion-IDs | Jeden Step; RAM; Upload-Methode |
| **Step-/Capability-Lease** | Genau diese Capability/Pfad/Dauer (oder One-Call) | Stehende Vollmacht für den Rest der Mission |

## Wann Step-Reauth Pflicht ist

Fail-closed: ohne Step-Freigabe **halten / BLOCKED**, nicht „weiter optimieren“.

| Trigger | Beispiel |
|---|---|
| Capability `execute` / Shell | Beliebiger Shell-Start nach Lease |
| Bulk-Media / große Payloads | Viele oder große Dateien in RAM oder Upload |
| Methodenwechsel vs. Plan/DoD | Plan sagt `hai-post.sh`; Agent wechselt zu `read_bytes()` |
| Destructive / Write außerhalb deklarierter Helper | Löschen, Schema-Migration, Remote-Post |
| Scope-Drift | Neuer Write-Pfad, neues Repo, neues Tool |

Lesen unter erlaubten Pfaden ohne Side-Effect darf ohne Step-Lease laufen, sofern Mission-Lease `read` hat.

## Rollen

| Rolle | Darf | Darf nicht |
|---|---|---|
| **Planner** | Plan schreiben | Eigenen Plan ACCEPT-en; Execute |
| **Plan-Validator (Gate)** | Plan ACCEPT/REPLAN/REJECT | Build; Execute |
| **Authorizer / Oversight** | Step-Leases erteilen/verweigern/revoken; bei Drift stoppen | Den Executer ersetzen und selbst den Bulk durchziehen (außer Owner-Ausnahme) |
| **Executer** | Nur freigegebene Steps im Lease-Scope | Freigabe erweitern; Methodenwechsel ohne Reauth |
| **Owner (Samuel)** | Not-Stop, Revoke, Contract-Änderung | — |

**Authorizer ≠ Executer.** Ausnahme nur mit Samuels exakter Freigabe in derselben Session.

## Stop-Kriterien (zusätzlich zum Run-Contract)

- Step-Freigabe verweigert oder fehlt bei Pflicht-Trigger → `BLOCKED` / held, Evidenzpfad, genau ein Next Step.
- Lease revoked oder abgelaufen → keine weiteren Side-Effects.
- Host-Druck (Owner meldet RAM/OOM/Kill; oder messbarer Ceiling wenn verdrahtet) → sofort stoppen, Mission `abandoned`/`BLOCKED` mit Fail-Bezug, Writer-Lock freigeben.
- Methodenwechsel ohne Reauth → Drift: `hai_check_activity` / Park / Block — nicht still fortsetzen.

## Evidenz

Jeder Step-Grant/Deny/Revoke braucht einen Pfad (Audit-Log, Checkpoint-Note, oder Lease-ID in Mission-Evidenz). Claims ohne Pfad sind ungültig.

## Upstream (Andock, nicht Eigenbau)

Primary: **leasebroker** (Capability-Leases, Deny-by-default, Revoke) — Sandbox-Smoke belegt.  
Companions (Folge-Qualify): `agent-approval-gate` (One-Call), LangGraph `interrupt` (durable Pause).

Runtime-Verdrahtung an `hai_authorize_session` / MCP-`serve` ist **Folge-Slice**, nicht Teil dieses Contracts.

## Pflichtverhalten Main Session

1. Plan-Gate wie bisher; ohne `ACCEPT` kein Executer.
2. Mission + `hai_authorize_session` wie bisher.
3. Vor Pflicht-Triggern (Tabelle oben): Step-/Capability-Freigabe einholen oder Lauf halten.
4. Bei Owner-Kill / OOM: Mission schließen (`abandoned`/`BLOCKED`), Lock freigeben, Fail fortschreiben — nicht weitermachen als wäre nichts.
5. Close nur mit Evidenz; Autorisierung endet mit Close/Park/Block, nicht mit dem ersten ACCEPT.

## Drei Gates (nicht kollabieren)

| Gate | Wann | Artefakt |
|---|---|---|
| Plan-Acceptance | vor Build-Lane | `PLAN_VALIDATION_REPORT.md` |
| Upstream-First | vor Feature-Code-Write | `UPSTREAM_SEARCH.md` |
| Continuous Authorize | während Execute bei Pflicht-Triggern | Step-Lease / Deny / Revoke-Evidenz |

## Non-Goals dieses Contracts

- Keine technische Enforcement in `hai-mcp` in diesem Slice.
- Kein Ersatz von Mission-Leases durch leasebroker.
- Kein Feature-Code, kein Commit ohne Owner.
- Keine RAM-cgroup-Pflicht ohne verdrahteten Upstream (OpenShell o. ä. = später).
