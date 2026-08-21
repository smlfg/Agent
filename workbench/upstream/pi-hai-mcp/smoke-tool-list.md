# Smoke: Tool-Liste nach pi-mcp-adapter + hai-mcp

Quelle: `pi -p "List all available tools" --no-session` (frische Pi-Subprozess-Session, kein Session-State)

## Eingelesene Packages

```
$ pi list
User packages:
  npm:pi-mcp-adapter@2.26.1
    /Users/samuelfleig/.pi/agent/npm/node_modules/pi-mcp-adapter
```

## Verfügbare Tools (33 insgesamt)

### Built-in (4)
- `read`, `write`, `edit`, `bash`

### pi-mcp-adapter intern (2)
- `mcp` — MCP gateway (status, search, describe, auth, single call)
- `mcpScript` — multi-call JS runner

### HAI-MCP via directTools (27, alle mit `hai-mcp_`-Präfix)
- `hai-mcp_hai_health`, `hai-mcp_hai_status`, `hai-mcp_hai_get_next_step`, `hai-mcp_hai_read_artifacts`
- `hai-mcp_hai_park`, `hai-mcp_hai_park_item`, `hai-mcp_hai_set_focus`, `hai-mcp_hai_deactivate_lane`
- `hai-mcp_hai_propose_next_step`, `hai-mcp_hai_accept_next_step`
- `hai-mcp_hai_checkpoint`, `hai-mcp_hai_recover`
- `hai-mcp_hai_open_mission`, `hai-mcp_hai_mission_start`, `hai-mcp_hai_close_mission`, `hai-mcp_hai_proof`
- `hai-mcp_hai_authorize_session`, `hai-mcp_hai_get_contract`, `hai-mcp_hai_check_activity`, `hai-mcp_hai_drift_check`, `hai-mcp_hai_recontract`
- `hai-mcp_hai_learning_start`, `hai-mcp_hai_learning_complete`, `hai-mcp_hai_learning_abandon`
- `hai-mcp_hai_intake`, `hai-mcp_hai_distill`
- `hai-mcp_hai_stop`

## Befund

- **27 von 27 erwarteten HAI-MCP-Tools** in `hai-mcp/docs/TOOL_CONTRACT.md` (v0.1) sind sichtbar.
- `directTools: true` + `toolPrefix: "server"` wirkt: jedes Tool bekommt den `<server>_-Präfix`.
- Kein Tool-Name-Collision mit Built-ins.
