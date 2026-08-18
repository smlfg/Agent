# Mission-Stand: EMAIL_MCP_READ_PATH

Gespeichert: 2026-08-10T06:53+02:00  
Ursprungs-Mission: `M-20260810T063231-f82a1698` (completed — Setup/Docs)  
Folgestand: Owner-Auth-Fortschritt nach Close

## Ziel (unverändert)

Read-only MCP für Privat-Gmail + Brüggen-Arbeitsmail als Arbeitsweg (nicht Produkt).

## Erledigt

| Item | Status | Beleg |
|---|---|---|
| Host-Config `gmail-mcp` + `ms365-mail` in `~/.cursor/mcp.json` | OK | Host-Datei |
| STACK + Registry-Stubs + Doc + Wizard | OK | `03_HAI/docs/EMAIL_MCP_READ_PATH.md`, `scripts/setup-email-mcp-readonly.sh` |
| Google Desktop OAuth JSON → `~/.gmail-mcp/gcp-oauth.keys.json` | OK | Datei vorhanden (kein Secret in Git) |
| Gmail Auth `gmail.readonly` | OK | `~/.gmail-mcp/credentials.json` (access + refresh) |
| Gmail API Smoke (getProfile + list inbox max 1) | OK | 2026-08-10; nur Metadaten, keine Mailbodies in Evidenz |
| Callback-Port-Fix | OK | Port 3000 von OrbStack belegt → Auth über freien Port (z. B. 3456); Wizard angepasst |

## Offen / BLOCKED

| Item | Status | Next |
|---|---|---|
| Cursor-Session lädt `gmail-mcp` Tools | ausstehend | MCP/Agent neu laden, dann search/read smoke in Session |
| ms365-mail Login `sfleig@brueggen-engineering.de` | **BLOCKED** | Token-Cache leer; Owner `--login`; ggf. Admin-Consent `Mail.Read` |
| ms365 Inbox/Folder Smoke | ausstehend | nach Login |

## Guardrails (weiter gültig)

Nur lesen/suchen. Kein Send/Move/Delete. Keine Bewerberinhalte aus M365 in externe Modelle/Git/Logs.

## Genau ein Next Step

1. Cursor MCP reload → `gmail-mcp` in Session prüfen.  
2. Dann: `bash ~/Projects/03_HAI/scripts/setup-email-mcp-readonly.sh` ab ms365-Stage **oder** manuell ms365 `--login` für `sfleig@brueggen-engineering.de`.

## Pfade

- Doc: `03_HAI/docs/EMAIL_MCP_READ_PATH.md`
- Dieser Stand: `03_HAI/docs/evidence/EMAIL_MCP_MISSION_STATE_2026-08-10.md`
- Smoke (älter/aktualisiert parallel): `03_HAI/docs/evidence/EMAIL_MCP_SMOKE_2026-08-10.md`
