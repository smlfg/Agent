---
id: "gh-fahrgastrechte-mcp"
title: "fahrgastrechte-mcp"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["MCP", "FastMCP", "Verspätungskonto", "stdio", "Fahrgastrechte"]
aliases: ["fahrgastrechte-mcp", "Fahrgastrechte MCP", "Verspätungs-MCP", "Bahnentschädigungsserver"]
link: "https://github.com/smlfg/fahrgastrechte-mcp"
source: "https://github.com/smlfg/fahrgastrechte-mcp"
source_kind: "github"
source_hash: "42a7f61870afa74a4b3023e0723f1e7d31fd1cc5c4559118aa4b22537da4f251"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:7434da69b627de0d1208dbe37851a4db7aaadfe948b725d374dfc99c64a80179
---

fahrgastrechte-mcp ist ein FastMCP-Server über stdio für ein Verspätungskonto. Er soll Funktionen des zugehörigen CLI als MCP-Tools bereitstellen, darunter das Anlegen und Auflisten von Verspätungsfällen sowie die Berechnung einer Entschädigung. Im dokumentierten MVP ist zunächst ein Server-Skelett mit einem Ping-Tool umgesetzt. Der Server startet mit uv und wird durch Tests geprüft. Der Kern ist derzeit als vendored Platzhalter enthalten und wird manuell aus dem CLI-Kontext übernommen. Das Absenden eines Antrags bleibt beim Menschen.
