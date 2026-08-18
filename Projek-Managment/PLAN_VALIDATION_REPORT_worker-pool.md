# PLAN_VALIDATION_REPORT

## Verdict
ACCEPT (mit 2 Auflagen, siehe Findings A1/A2)

## Checked Plan
/Users/samuelfleig/.cursor/plans/Redundanter Worker-Pool-0877f09b.plan.md (v2 nach REPLAN)

## Attempt
2/2

## Findings

### Umsetzung der 7 Replan-Instructions aus Attempt 1/2

1. **write_root + forbidden_paths pro Slice — umgesetzt.** Slice 0 (`fails/`, `Projek-Managment/`), Slice 1 + 2 (`workbench/variants/worker-pool-v1/`, forbidden `stable/`, `hai-mcp/`, Slice 2 zusätzlich `registry/agents/`), Slice 3 (`dispatch/`, `contracts/` nur neue Datei, cao agent_store), Slice 4 (`workbench/runs/`, `evidence/`), Slice 5a/5b getrennt. Ausreichend für `boundaries.write_roots` im Run-Contract. Einschränkung: siehe A1.
2. **Slice 5 aufgeteilt — umgesetzt.** 5a Doku (STACK.md, JETZT.md), 5b AGENTS.md mit Owner-Gate-Vermerk (erteilt 2026-08-09) und Auflage „alle `require_text`-Needles erhalten, `bash 03_HAI/scripts/validate.sh` grün". Gegenprüfung: `scripts/validate.sh` Zeilen 217–227 enthält **keinen** Needle auf „kein stiller Fallback"; die geplante Umformulierung des Dispatch-Absatzes (AGENTS.md:38) bricht validate.sh nicht. Auflage ist trotzdem korrekt formuliert.
3. **Code-Ausnahme mit Umfangsgrenze — umgesetzt.** Owner-Entscheid 2: max. 5 Custom-Provider-Module im cao-Extension-Point nach `provider-template.md` + 1 CrewAI-Scaffold. Grenze zählbar, Zielpfad benannt, Rest bleibt „kein eigener Code".
4. **v1.1.0-Pfad + Prüfmittel — umgesetzt, aber inhaltlich fehlerhaft (A2).** Pfad `03_HAI/contracts/run-contract-v1.1.0.schema.json`, v1 unverändert, Prüfmittel (a) validate.sh Schema-Header-Loop (`scripts/validate.sh:68` iteriert `contracts/*.schema.json` — greift die neue Datei tatsächlich automatisch), (b) `jsonschema`-Läufe mit Evidenz `evidence/schema-v110-check.log`. Der Kompatibilitätsanspruch ist so aber nicht erfüllbar → A2.
5. **Konkrete Slice-2-DoD-Pfade — umgesetzt.** `03_HAI/workbench/variants/worker-pool-v1/FLEET_STATUS.md` + `evidence/probe-<worker>.log`, PASS/PARKED je Worker, nur PASS-Slots in die Kette. Messbar.
6. **Slice-0-Status — umgesetzt.** `fails/0007-dispatch-blockiert-bei-harness-ausfall.md` und `fails/0008-active-mission-pointer-wipe.md` existieren im Workspace und sind als erledigt markiert; Lane `hai-pflichtpfad` als Owner-Entscheid protokolliert; Mission-Wechsel (M-...-e69605cf extern abandoned → M-20260809T150918-3e57ac16) im Plan dokumentiert. Offen bleibt korrekt nur dieses Gate.
7. **Scope auf 3 Worker — umgesetzt.** codex, claude (Built-ins) + gemini (Custom-Provider); die 8 übrigen Slots namentlich als geparkte Folge-Slices in FLEET_STATUS.md.

### Auflagen (vor bzw. im betroffenen Slice zu erfüllen, kein Replan nötig)

**A1 — Slice 1: Schreibziel außerhalb des deklarierten write_root.** Der write_root ist `03_HAI/workbench/variants/worker-pool-v1/`, die dritte Bullet schreibt aber `03_HAI/registry/components/cao.json` (Notes um Evidenzpfad ergänzen). Der Run-Contract für Slice 1 muss `registry/components/cao.json` explizit in `boundaries.write_roots` aufnehmen — oder die Registry-Notiz nach Slice 4 (Tryout) verschieben. Ohne das ist die erste Schreibaktion bereits ein Boundary-Verstoß.

**A2 — Slice 3: „jeder v1.0.0-Contract validiert gegen v1.1.0" ist mit dem vorgesehenen Schema unmöglich.** `contracts/run-contract.schema.json:24` pinnt `"schema_version": { "const": "1.0.0" }`; der Plan pinnt v1.1.0 auf `"schema_version": "1.1.0"`. Ein bestehender `workbench/runs/*.json` mit `schema_version: "1.0.0"` fällt damit gegen v1.1.0 durch — Prüfmittel (b) scheitert per Konstruktion. Zusätzlich steht `harnesses.additionalProperties: false` (Zeile 87) und Root `additionalProperties: false` (Zeile 164) den additiven Feldern entgegen, solange sie nicht in v1.1.0 selbst deklariert sind. Auflage: In v1.1.0 `schema_version` als `enum: ["1.0.0","1.1.0"]` führen (oder den Kompatibilitätsanspruch auf „strukturell abwärtskompatibel, Version-Pin ausgenommen" umformulieren) und `worker_pool`/`attempts`/`selected_worker` explizit in den jeweiligen `properties` deklarieren. Ergebnis muss im Evidenzlog `schema-v110-check.log` sichtbar sein.

### Weitere Prüfungen (kein Einwand)

- Gate-Konformität nach `docs/PLAN_ACCEPTANCE_GATE.md`: Validator ≠ Planner (claude CLI), Report am kanonischen Pfad, Attempt-Feld erhöht statt Zeitstempelvariante — korrekt, weil neuer Attempt.
- `03_HAI/dispatch/` existiert und ist leer → Zielpfad für `hai-dispatch.sh` frei. `03_HAI/Projek-Managment/` ist der Übergabekanal laut Gate-Contract.
- `registry/agents/*` als forbidden ausgewiesen — deckt die jq-Pins in `scripts/validate.sh:144` ab.
- DEGRADED-Fallback über uv-Adapter bei MCP-Ausfall ist im Risiko-Abschnitt benannt und deckt sich mit dem AGENTS.md-Needle „sichtbarem `DEGRADED`-Status, HAI-Fail und geplantem Backfill".
- Non-Goals decken hai-mcp-Logik, registry/agents, Stable-Promotion, Commit/Push und Fallback außerhalb der Kette ab.

## Replan Instructions
Entfällt (Verdict ist kein REPLAN). A1/A2 sind Auflagen innerhalb der Build-Lane, keine Rückgabe an die Planning-Lane.

## Build Release
allowed: yes — Build-Lane darf starten. Slice 1 erst nach Umsetzung von A1, Slice 3 erst nach Umsetzung von A2; beide Auflagen sind im jeweiligen Run-Contract nachweisbar zu dokumentieren.
