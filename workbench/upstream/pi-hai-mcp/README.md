# pi ↔ hai-mcp Bridge (Config/MCP-Whitelist-Slice)

**Datum:** 2026-08-20
**Status:** DONE, smoke grün
**Slice-Klasse:** Config/MCP-Whitelist (volle Plan-Acceptance-Gates **nicht** angewandt — siehe Reflection unten)

## Was wurde gemacht

```bash
pi install npm:pi-mcp-adapter@2.26.1
# + ~/.pi/agent/mcp.json geschrieben (bridge config)
# + ~/.pi/agent/settings.json: "packages": ["npm:pi-mcp-adapter@2.26.1"] (von pi install)
# + smoke: hai-mcp_hai_health → ok: true
```

Resultat: 27 `hai-mcp_*`-Tools sind im Pi-Tool-Set direkt registriert (kein Proxy-Umweg), `mcp` + `mcpScript` zusätzlich vom Adapter.

## Upstream (kurz)

| # | Kandidat | Verdict |
|---|---|---|
| 1 | `pi-mcp-adapter@2.26.1` (MIT, npm, 56 Versionen, Maintainer `nicopreme`) | **PRIMARY** — purpose-built, nutzt `@modelcontextprotocol/sdk` |
| 2 | `pi-fabric@0.61.3` | reject — Overkill (Actors/Swarm dabei) |
| 3 | `@modelcontextprotocol/sdk@1.30.0` (Eigenbau) | reject — wäre mehr als Glue-Limit, weniger Audit-Story |

## Bridge-Config (was am Ende läuft)

`~/.pi/agent/mcp.json`:

```json
{
  "mcpServers": {
    "hai-mcp": {
      "command": "uv",
      "args": ["run", "--directory", "/Users/samuelfleig/Projects/03_HAI/hai-mcp", "hai-mcp"],
      "env": { "HAI_HOME": "/Users/samuelfleig/.hai" },
      "directTools": true,
      "toolPrefix": "server"
    }
  }
}
```

`~/.pi/agent/settings.json` (Diff zu vorher): einziges neues Feld `packages: ["npm:pi-mcp-adapter@2.26.1"]`.

## Smoke

| Test | Resultat |
|---|---|
| `pi list` | `npm:pi-mcp-adapter@2.26.1` registriert |
| `pi -p "List all available tools"` | 33 Tools (4 builtin + 2 mcp + 27 hai-mcp_*) |
| `pi -p "Call hai-mcp_hai_health"` | `{"ok": true, "server": "hai-mcp", "version": "0.1.0", "hai_home": "/Users/samuelfleig/.hai", "hai_home_writable": true, "model_calls": false}` |

## Evidence-Files im Workbench

| File | Inhalt |
|---|---|
| `install.log` | `pi install` Output (Exit 0, 42 packages, 0 vulnerabilities) |
| `settings.before.json` | Settings vor Install (zur Diff-Kontrolle) |
| `mcp.after.json` | Hai-mcp-Config (Back-up; Original liegt unter `~/.pi/agent/mcp.json`) |
| `smoke-hai_health.json` | Strukturierte `hai_health`-Response |
| `smoke-tool-list.md` | Vollständige 33-Tools-Liste mit Beschreibungen |

## Reflection — was ich überdiszipliniert habe

Der Slice traf die **Config/MCP-Whitelist** (`docs/UPSTREAM_FIRST_GATE.md`). Whitelist bedeutet: keine volle Plan-Acceptance-Pflicht. Trotzdem habe ich ursprünglich produziert:

- `UPSTREAM_SEARCH.md` (4 Kandidaten, ~5KB)
- `PLAN.md` (Mini-Spec, ~4KB)
- `grade-PLAN-score_ok-20260820T073638Z.json` (Plan-Council-Fixture, 0.835)
- `PLAN_VALIDATION_REPORT.md` (ACCEPT, ~5KB)

Owner-Herausforderung „warum hast du hai-mcp nicht einfach installiert?" zerlegte das auf den harten Kern: 1 Install + 1 Config-File + 1 Smoke. Diese 4 Artefakte wurden daraufhin zu **dieser** `README.md` zusammengeführt und die Originale gelöscht.

**Lehre für künftige Slices:** Whitelist-Treffer (Config/MCP, Registry, Verträge, Docs, Shell-Wizards, Fails) mit kompaktem Logfile, ohne Plan-Council/Plan-Validation. Voller Gate-Lauf nur, wenn das echte Schreibvolumen >80 LOC ist oder mehrere Komponenten koppelt.

## Nächster Schritt (genau einer)

Owner entscheidet, ob (a) Commit der Workbench-Artefakte + (b) Folge-Slice (z. B. echte `hai-mcp_hai_set_focus`+`hai-mcp_hai_open_mission` aus Pi heraus) oder (c) Lane-Drop-Pick für die freie Lane. Aktuell: `BLOCKED on owner, awaiting next`.
