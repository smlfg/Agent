# Notion — Stand für „Agentfähig"

Kurzfassung dessen, was aus Notion für dieses Projekt verfügbar ist. Stand 12.11.2026.

## Zugriff

- **Aus diesem Zed-Thread: nicht möglich.** Der Zed-MCP-Server `mcp-server-notion`
  läuft, hat aber nur den Platzhalter `YOUR_NOTION_TOKEN` → API antwortet `401`.
- Codex/Claude kennen nur `https://mcp.notion.com/mcp` (OAuth), hier ohne Credentials.
- Lokaler Notion-Desktop-Cache (1,8 GB): keine Treffer für „Agentfähig".
- Der funktionierende Zugang ist der Connector `user-Notion` (Claude/ChatGPT), nicht hier.

## Relevante Seiten (aus dem Kontext-Wiki, noch nicht gelesen)

| Thema | Seite | Warum relevant |
|---|---|---|
| HAI – Agentenarchitektur | `3f84bf3cf60e81afb455c091334c8200` | direkte Vorgängerspur zur Agenten-Struktur in der Skizze |
| Projekte (DB) | `b121070cef1246ebbaf8eaf8b250fe26` | Status, Ziele, Verantwortlichkeiten |
| Gedanken / IDEEN | `01cdb4d70f3a436da05427272b97041b` | Ideenfundus, vermutlich Herkunft von „Agentfähig" |
| Gedanken / IDEEN (2) | `8a399ebe4a43488395a891b4f1b9e90b` | zweite Sammlung |
| Mensch heute | `3f84bf3cf60e81c29b84f3975c264e6d` | Samuels Zustand/Kontext für Agenten |
| TP Control Center | `3f64bf3cf60e8173ba21d54b0c99de4a` | Hub, von dem die anderen Seiten hängen |
| Tasks (DB) | `afffc551fc6b4ef0944678cd202f25d7` | offene Aufgaben zum Projekt |

## Was fehlt

Inhalt der obigen Seiten. Ohne ihn bleibt die Notion-Spalte im Projekt leer —
die Skizze (`../sketches/`) ist derzeit die einzige inhaltliche Quelle.

## Nächster Schritt (eine Entscheidung)

1. **Export:** Seiten in Notion als „Markdown & CSV" exportieren und hier ablegen.
2. **Token:** interne Integration anlegen, Token nach `~/.config/notion/token`,
   Seiten freigeben — dann per API suchen.
3. **Copy-Paste:** Seitenlink + Text hier einwerfen.

Sobald Material da ist, steht die Zusammenfassung in dieser Datei statt dieses Status.
