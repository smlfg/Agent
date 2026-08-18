# EMAIL MCP Smoke / Gate — 2026-08-10

Mission: M-20260810T063231-f82a1698  
Stand aktualisiert: 2026-08-10T06:53+02:00  
Vollständiger Missionsstand: `EMAIL_MCP_MISSION_STATE_2026-08-10.md`

## gmail-mcp
- Host entry: present in ~/.cursor/mcp.json
- Package: @artymclabin/gmail-mcp (npx)
- ~/.gmail-mcp/: mode 700
- gcp-oauth.keys.json: OK (Desktop JSON)
- credentials.json: OK — scopes `gmail.readonly`, access+refresh present
- API Smoke: getProfile + messages.list(in:inbox,maxResults=1) OK
- Note: first auth failed on localhost:3000 (OrbStack); succeeded on free port (3456)
- Cursor tools/list: requires MCP reload in agent session

## ms365-mail
- Host entry: present in ~/.cursor/mcp.json
- Flags: --org-mode --read-only --expected-username sfleig@brueggen-engineering.de + enabled-tools list/get/download only (Mail.Read)
- --verify-login: FAILED — cached accounts: none
- Status: BLOCKED on Owner login / possible admin consent for Mail.Read

## Next step
Reload Cursor MCP for gmail-mcp, then ms365 login via wizard Stage 4+.
