# Upstream-First Pre-Write-Gate

**Status:** ACTIVE Contract (Doku-Gate; keine hai-mcp-Enforcement)  
**Mission:** `M-20260818T161713-f6050145`  
**Intake:** `I-20260818T161328-d4a4fbc7`  
**Fail:** [`fails/0012-eigenbau-ohne-upstream-search.json`](../fails/0012-eigenbau-ohne-upstream-search.json)  
**Abgrenzung:** Plan-Acceptance-Gate bleibt separat ([`PLAN_ACCEPTANCE_GATE.md`](PLAN_ACCEPTANCE_GATE.md)).

## Zweck

Bevor ein Agent Feature-/App-Code schreibt, muss er nachweisbar Upstream suchen und verdrahten. Ohne `UPSTREAM_SEARCH`-Evidenz kein Eigenbau. Ziel: Installieren und Andocken statt Agenten-Module.

## Flow

```text
Bedarf erkannt
  → Whitelist? (Config/Glue/Vertrag/Docs/Wizard)
      ├─ ja  → schreiben erlaubt
      └─ nein → UPSTREAM_SEARCH.md (≥3 Kandidaten)
            ├─ brauchbarer Upstream → installieren / andocken / STACK+Registry
            ├─ keiner brauchbar     → PARKED mit Suchprotokoll (kein Eigenbau)
            └─ Owner-Ausnahme       → LOC-Budget + Ausnahme-Notiz; sonst BLOCKED
```

Fail-closed: Main Session / Worker starten keinen Feature-Code-Write ohne gültige `UPSTREAM_SEARCH.md` für denselben Slice (oder dokumentierte Owner-Ausnahme).

## Write-Whitelist (ohne UPSTREAM_SEARCH)

Erlaubt ohne Suche, solange Boundaries eingehalten werden:

| Kategorie | Beispiele |
|---|---|
| Verträge / Schemas | `contracts/*.json`, Gate-Docs unter `docs/` |
| Registry | `registry/components/*.json`, `registry/agents/*.json` |
| Config / MCP-Verdrahtung | `mcp.json`, Server-Einträge, Env-Hinweise ohne Secrets |
| Shell-Wizards / Startskripte | `scripts/setup-*.sh`, reine Install-/Probe-Wrapper |
| Docs / Fail / STACK | Markdown-Evidenz, `STACK.md`, Fail-Records |
| Run-Contracts / Mission-JSON | Briefs, Checkpoints, Evidence-Notizen |

Alles andere (neue `.py` / `.ts` / `.go` / `.rs` / App-Module, Libraries, Services) gilt als **Feature-Code** und braucht das Gate.

## Pflichtartefakt

Pfad: Slice-Write-Root oder Mission-Artefaktordner, kanonischer Name `UPSTREAM_SEARCH.md`.  
Minimalformat: [`templates/UPSTREAM_SEARCH.md`](templates/UPSTREAM_SEARCH.md).

Pflichtfelder:

- Need (1 Satz)
- ≥ **3** Kandidaten mit URL, Lizenz/Hinweis, Andock-Idee, Verdict (`use` / `reject` + Grund)
- Decision: gewählter Upstream **oder** `PARKED` / Owner-Ausnahme
- Bei `use`: Installationsweg + Platz in `STACK.md` / Registry

## Owner-Ausnahme (Eigenbau)

Nur mit Samuels exakter Freigabe in derselben Session. Pflichtnotiz in `UPSTREAM_SEARCH.md`:

- Ausnahme-Grund (warum kein Upstream)
- **LOC-Budget** (Default-Obergrenze: **80** Zeilen Glue; höher nur mit neuer Freigabe)
- Zielpfad unter Write-Root
- Ersetzungsplan (welches Upstream später ersetzen soll)

Ohne diese Notiz: Status `BLOCKED`, Fail analog `0012`.

## Dispatch-Pflichtfelder

Jeder Brief mit möglichem Feature-Code enthält:

- **Non-Goal:** neues Modul/Repo/Feature-Code außer dokumentierter Owner-Ausnahme
- **DoD:** Upstream-URL + Install-/Andock-Pfad + Smoke-Evidenz (oder PARKED-Protokoll)
- **Stop:** kein brauchbarer Upstream in Budget → `PARKED` mit `UPSTREAM_SEARCH.md`, nicht selber bauen

## Zwei Gates (nicht kollabieren)

| Gate | Wann | Artefakt |
|---|---|---|
| Plan-Acceptance | vor Build-/Executer-Lane | `PLAN_VALIDATION_REPORT.md` |
| Upstream-First | vor Feature-Code-Write | `UPSTREAM_SEARCH.md` |

Reihenfolge bei Build-Slices: Plan-ACCEPT → Upstream-SEARCH (falls Feature-Code) → dann Write.

## Regression (desired)

Dispatch ohne `UPSTREAM_SEARCH.md`, der Feature-Code schreiben will, endet `BLOCKED` oder wird vor dem Write gestoppt; Evidenz: Fail `0012` + Gate-Doc.
