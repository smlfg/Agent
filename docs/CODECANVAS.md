# CodeCanvas — Setup für dieses Projekt

Stand: 19.11.2026 · MCP-Server `code-canvas` · Paket `code-canvas-server@2.6.1`

## Was es ist

[CodeCanvas](https://www.codecanvas.app/) ist eine unendliche Canvas, die
Repositories räumlich darstellt: Dateien, Ordner, Abhängigkeiten, Diffs, LSP-
Symbole. Der MCP-Server verbindet den Agenten damit — der Agent liest den
Canvas und schreibt **Agent Notes** darauf, die auf Dateien und Symbolzeilen
verweisen.

**Kosten:** Der **Free-Plan (£0)** enthält den MCP-Server bereits. Pro Plan
(£8/Monat) gibt es private GitHub-Repositories, lokale Repositories und alle
Pull Requests. Für dieses Projekt reicht der Free-Plan: es ist ein öffentliches
Repo, und der MCP-Zugang funktioniert ohne Anmeldung.

## Installation

Das Paket liegt als **devDependency im Projekt**, nicht global:

```bash
npm install --save-dev code-canvas-server
```

Die MCP-Konfiguration steht in `~/.config/opencode/opencode.jsonc`:

```jsonc
"code-canvas": {
  "type": "local",
  "command": ["~/Projects/03_HAI/Agentfaehig/Agent/node_modules/.bin/code-canvas-mcp"],
  "environment": {},
  "enabled": true,
  "timeout": 120000
}
```

## Zwei Dinge, die beim Einrichten Zeit gekostet haben

**1. `npx -y` funktioniert nicht.** Der Befehl
`npx -y code-canvas-server code-canvas-mcp` verbringt das gesamte Timeout
mit der Paketauflösung, bevor der Handshake beginnt — der MCP-Client meldet
„Operation timed out after 60000ms". Die lokale Installation umgeht das:
`node_modules/.bin/code-canvas-mcp` startet in unter zwei Sekunden.

**2. Port 9315 ist der Default.** Der Canvas-Server (WebSocket) läuft auf
`127.0.0.1:9315` und legt eine Lock-Datei in `~/.code-canvas/server-<pid>.json`
(port, pid, token) an. Der MCP-Client findet darüber den laufenden Server.

Es läuft bereits eine CodeCanvas-Instanz aus der Zed-Umgebung. Ein zweiter
Server auf demselben Port scheitert mit:

```
[ws] Server error: listen EADDRINUSE: address already in use 127.0.0.1:9315
[server] Unable to start: port 9315 is already in use
```

Bei Portkonflikt: `lsof -i :9315` zeigt den Beleger. Eigener Port über die
Umgebungsvariable `CC_SERVER_PORT` setzen.

## Werkzeuge

| Werkzeug | Zweck |
|---|---|
| `query` | Canvas-Zustand, Knoten, Ordner, Layout, Rückwärtskanten |
| `search` | Volltextsuche im Workspace (`code`, `files`, `content`, `lsp`) |
| `use_command` | Befehle ausführen: Dateien öffnen, Layout, Diff, Agent Notes |
| `list_commands` | Befehlskatalog (`kind: "canvas"` oder `"ui"`) |
| `lsp_servers` | Sprachserver starten, stoppen, neu laden |
| `read_docs` | Die Canvas-Dokumentation lesen |

## Was noch zu tun ist

**Das Repository ist noch nicht mit dem Canvas verbunden.** `query { target:
"nodes" }` und `search` antworten erst, wenn ein Repo geladen ist. Das ist
eine Aktion in der Canvas-Oberfläche, nicht im Server:

- `connect-repository-local` — lokalen Ordner verbinden (dieses Repo)
- `connect-repository-github` — über GitHub verbinden

Danach stehen `search` und die Knoten-Abfragen zur Verfügung.

## Agent Notes

Der eigentliche Nutzen für dieses Projekt sind **Agent Notes**: Erklärungen,
die auf dem Canvas erscheinen und bei `cc://`-Links den Zielcode im Editor
markieren. Format:

```text
[Anzeigename](cc://file/pfad/datei.ts)
[Symbol](cc://symbol/pfad/datei.ts:42:0)
```

Pfade sind relativ zur Repository-Wurzel.

## Lizenz und Herkunft

- Paket: `code-canvas-server@2.6.1` (npm), Quelle
  <https://github.com/AlexC-design/code-canvas>
- Weboberfläche: <https://www.codecanvas.app/>
- Lizenz des Pakets: **nicht im Paket ausgewiesen** — vor einer Weiterveröffentlichung
  des Projekts prüfen.
- Die Canvas selbst ist ein Dienst mit Konten und Free/Pro-Plan. Der MCP-Server
  läuft lokal, die Bedienoberfläche ist die Web-App.
