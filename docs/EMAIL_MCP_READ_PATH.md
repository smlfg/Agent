# EMAIL_MCP_READ_PATH

Stand: 2026-08-10 (Auth-Gmail OK; ms365 noch BLOCKED)  
Mission: `M-20260810T063231-f82a1698`  
Missionsstand-Snapshot: [`evidence/EMAIL_MCP_MISSION_STATE_2026-08-10.md`](evidence/EMAIL_MCP_MISSION_STATE_2026-08-10.md)  
Zweck: **Arbeitsweg** (nicht BRUEGGEN-Produkt) — Mails lesen/suchen per MCP, ohne Copy-Paste.

## Andock

| Server (Cursor) | Konto | Paket | Modus |
|---|---|---|---|
| `gmail-mcp` | private Gmail | `@artymclabin/gmail-mcp` | OAuth `gmail.readonly` |
| `ms365-mail` | `sfleig@brueggen-engineering.de` | `@softeria/ms-365-mcp-server` | `--read-only --org-mode` + enabled-tools nur list/get/download |

Config: `~/.cursor/mcp.json` (Host).  
BRUEGGEN `.mcp.json` bleibt Produkt-SharePoint und wird hier nicht vermischt.

## Guardrails

- Nur lesen/suchen.
- Keine Mails senden, verschieben, löschen, Labels ändern.
- Keine echten Bewerberinhalte aus M365 in externe Modelle, Git oder Logs — bei Treffer stoppen und Owner fragen.
- Secrets nur unter `~/.gmail-mcp/` bzw. ms365 MSAL-Cache; nie committen.

## Owner-Setup (einmalig)

```bash
bash ~/Projects/03_HAI/scripts/setup-email-mcp-readonly.sh
```

`gcp-oauth.keys.json` muss die **komplette** Google-Download-JSON sein (`{"installed":{"client_id":...,"client_secret":...}}`), nicht nur die Client-ID-Zeichenkette.
Kurz ohne Wizard:

1. Google Cloud: Gmail API + OAuth Desktop Client → `~/.gmail-mcp/gcp-oauth.keys.json`
2. `npx -y @artymclabin/gmail-mcp auth --scopes=gmail.readonly`
3. `npx -y @softeria/ms-365-mcp-server --org-mode --read-only --expected-username sfleig@brueggen-engineering.de --enabled-tools 'list-mail-messages|list-mail-folders|list-mail-child-folders|list-mail-folder-messages|get-mail-message|list-mail-attachments|get-mail-message-mime|download-bytes|get-mailbox-settings|list-outlook-categories|get-mail-tips' --login`
4. Cursor MCP neu laden / Agent-Session neu starten

## Smoke-Status 2026-08-10

| Check | Ergebnis |
|---|---|
| Cursor `mcp.json` enthält `gmail-mcp` + `ms365-mail` | OK |
| `~/.gmail-mcp/gcp-oauth.keys.json` | OK (Desktop OAuth JSON) |
| Gmail `credentials.json` | OK — scopes `gmail.readonly`; Smoke list Inbox OK 2026-08-10 |
| ms365 `--verify-login` für Brüggen-User | **BLOCKED** — Token-Cache leer; Login/Admin-Consent Owner-Schritt |
| Live MCP tools/list in dieser Session | Nach Cursor-Reload `gmail-mcp` laden |

## Genau ein Next Step

1. Cursor MCP / Agent-Session neu laden und `gmail-mcp` Tools prüfen.  
2. ms365-Login für `sfleig@brueggen-engineering.de` (Wizard ab Stage 4 oder manuell `--login`).

Bei ms365 Admin-Consent: Tenant-Admin für `Mail.Read` (und ggf. `MailboxSettings.Read`) freigeben — kein IMAP-/App-Password-Bypass.

## Evidenzpfade

- Diese Datei
- `~/Projects/03_HAI/scripts/setup-email-mcp-readonly.sh`
- `~/Projects/03_HAI/registry/components/gmail-mcp.json`
- `~/Projects/03_HAI/registry/components/ms365-mail.json`
- `~/Projects/STACK.md`
- Host-Config: `~/.cursor/mcp.json` (nicht im Repo)
