# Plan-Acceptance-Gate vor Build-Lane

**Status:** ACTIVE Contract (Doku-Gate; keine hai-mcp-Enforcement)  
**Mission:** `M-20260809T123147-0b278c97`  
**Abgrenzung:** Post-Exec-Validator (nach Execution-Report) bleibt separat.

## Zweck

Bevor eine Build-/Executer-Lane freigegeben wird, muss ein unabhängiger **Plan-Validator** den Plan prüfen und dokumentiert freigeben. Ohne `ACCEPT` kein Build. Ist der Plan zu schwach, schickt der Validator die Planning-Lane mit Findings zurück in den Loop.

## Flow

```text
Planning Lane → Plan-Artefakt → Plan-Validator-Gate
  ├─ ACCEPT  → Build-Lane darf starten
  ├─ REPLAN  → zurück Planning (Findings = Pflichtinput)
  └─ REJECT | UNCLEAR → Owner (Samuel); kein Build
```

Fail-closed: Main Session / Dispatcher startet keine Build-Lane ohne gültigen `PLAN_VALIDATION_REPORT` mit Verdict `ACCEPT` für denselben Plan-Pfad.

## Rollen

| Rolle | Darf | Darf nicht |
|---|---|---|
| Planner | Plan schreiben / nach REPLAN schärfen | eigenen Plan ACCEPT-en; Build starten |
| Plan-Validator (Gate Agent) | Plan lesen; Report schreiben; Verdict setzen | Plan umschreiben; Code bauen; Commit |
| Builder / Executer | Nur nach Gate-`ACCEPT` | Gate überspringen; Plan-Validator ersetzen |

**Validator ≠ Planner.** Anderer Agent und — außer expliziter Owner-Ausnahme — anderer Harness (siehe Root-Dispatch in `03_HAI/AGENTS.md`).

## Artefakte

Übergabekanal: Projekt-`Projek-Managment/` falls vorhanden; sonst Mission-Write-Root / `00_AKTUELL/`.

| Artefakt | Rolle |
|---|---|
| Plan (Cursor-Plan, `PLAN.md`, Mission-Plan) | Gate-Input |
| `PLAN_VALIDATION_REPORT.md` | Gate-Output (Pflicht) |

Existiert der Report schon für denselben Attempt, nicht überschreiben — Zeitstempelvariante anlegen und kanonischen Pfad nur bei neuem Attempt aktualisieren.

### Report-Minimalformat

```md
# PLAN_VALIDATION_REPORT

## Verdict
ACCEPT | REPLAN | REJECT | UNCLEAR

## Checked Plan
<path to plan>

## Attempt
n/2

## Findings
- <konkret, prüfbar>

## Replan Instructions
<nur bei REPLAN; was der Planner ändern muss>

## Build Release
allowed: yes|no
```

## Verdicts

- `ACCEPT` — Scope, DoD, Non-Goals und Boundaries sind klar genug; Build-Lane freigeben.
- `REPLAN` — Plan zu dünn, Drift, fehlende DoD/Boundaries oder riskante Annahmen; Planning erneut.
- `REJECT` — Plan unbrauchbar oder Scope kaputt; Owner, kein Auto-Replan.
- `UNCLEAR` — Evidenz fehlt; Owner, kein Build.

## Loop-Bound

- Max. **2** REPLAN-Zyklen (`Attempt 1/2`, `2/2`).
- Nach dem zweiten REPLAN ohne brauchbaren Plan: Status `BLOCKED`, Evidenzpfad, genau ein Next Step an Samuel.
- Kein stilles Weitermachen ohne Report.

## Gates (nicht kollabieren)

| Gate | Wann | Artefakt | Verdicts / Wirkung |
|---|---|---|---|
| **Plan-Acceptance-Gate** | vor Build-Lane | `PLAN_VALIDATION_REPORT.md` | ACCEPT, REPLAN, REJECT, UNCLEAR |
| **Continuous Authorize** | während Execute bei Pflicht-Triggern | Step-/Capability-Lease, Deny, Revoke | hält / widerruft Steps — kein Ersatz für ACCEPT |
| **Post-Exec-Validator** | nach Execution-Report | `VALIDATION_REPORT_NEXT_STEP.md` | ACCEPT, REJECT, UNCLEAR |

Plan-`ACCEPT` startet die Lane; Continuous Authorize hält die Aufsicht danach. Vertrag: [`CONTINUOUS_AUTHORIZE.md`](CONTINUOUS_AUTHORIZE.md). Fail: [`fails/0014-execute-ohne-continuous-authorize.json`](../fails/0014-execute-ohne-continuous-authorize.json).

Owner-Gates (Commit, Push, Deploy, Secrets) bleiben unberührt und stehen **nach** den Agent-Gates.

## Dispatch-Brief (Gate Agent)

```text
Goal: Prüfe den Plan und schreibe PLAN_VALIDATION_REPORT.md mit genau einem Verdict.
Non-Goal: Kein Code, kein Plan-Rewrite, kein Build, kein Commit.
Boundaries: Write-Root = Ordner des Reports; Plan und Contract nur lesen.
DoD: Report mit Verdict, Checked Plan, Attempt n/2, Findings; bei REPLAN Replan Instructions.
Stop: Nach Report-Schreiben sofort stoppen. Bei fehlendem Plan: UNCLEAR und stoppen.
mission_id / session_id: <aus Main Session>
```

## Pflichtverhalten Main Session

1. Planning liefert Plan-Artefakt.
2. Gate Agent dispatchen (Brief oben).
3. Nur bei `ACCEPT` Build-Lane starten.
4. Bei `REPLAN`: Findings an Planner; Attempt erhöhen; erneut Gate.
5. Bei `REJECT`/`UNCLEAR` oder Bound erschöpft: `BLOCKED` + Owner.

## Non-Goals dieses Contracts

- Keine technische Blockade in `hai-mcp` (späterer Slice).
- Kein neues Hermes-Profil.
- Keine Änderung am post-Exec-Validator.
