# PARKED — Owner Gate Multi-Agent (cao / agent-collab)

**Status:** PARKED — Tryout Functional Check DONE; wartet auf explizite Owner-Entscheidung.  
**Regel:** Schweigen ist keine Zustimmung. Keine Promotion ohne exakte Owner-Freigabe.

## Voraussetzung

Tryout Functional Check liegt vor: `workbench/runs/R-20260807T182212-cao-tryout.evidence.md` (cao 2.4.1 CLI/Server OK).  
Live-Assign und hai-mcp-Primary-Pfad fehlen noch (Fail `0002`).

## Promotion-Pipeline (fail-closed)

`Discover` (done: Registry) → Qualify → Sandbox → Functional Check (done, partial) → Contract Validation → Tests/Conformance → Tryout (Live-Assign offen) → read-only Review → **Owner Gate** → Stable

## Owner entscheidet explizit

1. cao als primärer Multi-Agent-Harness: ja/nein  
2. agent-collab nur als Claude-Shortcut belassen (kein Repo unter Projects): ja/nein  
3. Bei cao-Ja: Verschieben `05_INBOX/cao` → Zielpfad unter `03_HAI/` oder dokumentierter Workbench-Pfad; Registry `state` anheben nur mit Evidenz  
4. `STACK.md` Zustand von `candidate_unverified` auf den freigegebenen State aktualisieren  
5. agent-collab: kein Inbox-Klon; Plugin-Install bleibt Host-seitig  
6. hai-mcp in Cursor MCP eintragen (schließt Fail `0002` / Backfill)

## Bekannte Pfade

- `registry/components/cao.json`
- `registry/components/agent-collab.json`
- `~/Projects/STACK.md`
- `~/Projects/05_INBOX/cao`
- `workbench/runs/R-20260807T182212-cao-tryout.json`
- `fails/0002-hai-mcp-unavailable-in-cursor.json`
- `sessions/E-20260807T183230-feierabend.json`

## Nächster Schritt (genau einer)

Samuel: Owner-Gate Ja/Nein zu cao-Promotion / Live-Assign / hai-mcp-MCP — ohne Ja nichts verschieben und keinen Registry-State anheben.
