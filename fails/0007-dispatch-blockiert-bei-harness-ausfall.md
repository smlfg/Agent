# Fail 0007 — Dispatch blockiert bei Harness-Ausfall: keine Fallback-Kette

**Status:** observed → Fix in Arbeit (Mission `M-20260809T144350-e69605cf`)
**observed_at:** 2026-08-09
**Gemeldet vom Owner:** "Das hatte ich heute zehn Mal."

## Expected

Ein Implementierungs-Dispatch (Owner: "ist okay, wir können das implementieren") läuft über die Control Plane an einen verfügbaren Worker. Fällt der vorgesehene Harness aus, übernimmt sichtbar der nächste qualifizierte Worker aus einer deklarierten Kette. Der Run blockiert nie an einem einzelnen Harness.

## Observed

Am 2026-08-09 blockierten ca. 10 Implementierungs-Dispatches in Folge. Muster je Vorkommnis:

1. Main Session erarbeitet Slice mit Agent, Owner gibt Freigabe.
2. Dispatch scheitert: "Cursor geht nicht, Hermes geht nicht, Ada geht nicht".
3. Main Session darf selbst nicht schreiben (Dispatch-Vertrag + Writer-Lock-Regime) → Run endet blockiert statt mit Fallback.

Strukturelle Ursachen:

- `contracts/run-contract.schema.json` v1.0.0 sieht genau **einen** Worker vor (`harnesses.worker`), keine Fallback-Kette.
- `03_HAI/AGENTS.md` Dispatch-Vertrag verbietet stillen Fallback, bietet aber keinen **deklarierten sichtbaren** Fallback-Weg — Blockieren ist die einzige erlaubte Reaktion.
- Kein Dispatcher: keine Probe (binary? Auth? headless-fähig?) vor dem Dispatch, kein `attempts[]`-Protokoll, kein geordnetes Weiterschalten.
- Nebenbefund: Alle 10 Kandidaten-CLIs waren installiert und erreichbar (cursor-agent 2026.08.04, codex 0.144.4, claude 2.1.226, gemini 0.54.4, aider 0.86.2, opencode 1.18.1, hermes 0.18.2, pi 0.84.1, warp 0.2026.08.05, ollama 0.32.6). Es fehlte der Vermittler, nicht die Worker.

## Safety Boundary

Der Fix (Fallback-Kette) ändert nichts an den harten Gates: Mission + Lease vor Dispatch, Write-Root-Confinement, Reviewer ≠ Worker-Harness, Owner-Gates für Commit/Push/Deploy. Fallback ist ausschließlich innerhalb der deklarierten Kette und wird sichtbar in `attempts[]` protokolliert; kein stiller Wechsel.

## Evidence

- `fails/0007-dispatch-blockiert-bei-harness-ausfall.md` (dieser Record)
- Plan: `/Users/samuelfleig/.cursor/plans/Redundanter Worker-Pool-0877f09b.plan.md`
- Mission: `M-20260809T144350-e69605cf`
- Bestehendes Isolationsmuster: `03_HAI/workbench/variants/parallel-proof-v1/run-cursor-worker.sh`

## Regression Test (desired)

**Goal:** Ein Dispatch mit erzwungenem Ausfall von Worker 1 endet `DONE` über den nächsten qualifizierten Worker, mit `attempts[]`-Evidenz im Run-Contract.
**Success:** `03_HAI/workbench/runs/` enthält einen Tryout-Run, in dem Worker 1 failt und Worker 2 sichtbar übernimmt; Gesamtkette bleibt ohne Owner-Eingriff durchlaufbar.

## Genau ein Next Step

Mission `M-20260809T144350-e69605cf` Slices 0–5 abarbeiten (Plan-Validator-Gate → cao qualifizieren → Fleet proben → Fallback-Dispatch → Tryout → Docs).
