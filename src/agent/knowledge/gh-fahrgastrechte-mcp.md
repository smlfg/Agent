---
id: "gh-fahrgastrechte-mcp"
title: "fahrgastrechte-mcp"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["MCP", "FastMCP", "Verspätungskonto", "stdio", "Fahrgastrechte"]
aliases: ["fahrgastrechte-mcp", "Fahrgastrechte MCP", "Verspätungs-MCP", "Bahnentschädigungsserver"]
link: null
source: "https://github.com/smlfg/fahrgastrechte-mcp"
source_kind: "github"
source_hash: "42a7f61870afa74a4b3023e0723f1e7d31fd1cc5c4559118aa4b22537da4f251"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:4ef3b9bd8fe3335ccfdb080062ed494541fb35696aff21eb41dac563e4d1c4bd
---

fahrgastrechte-mcp ist ein FastMCP-Server über stdio für ein Verspätungskonto. Er soll Funktionen des zugehörigen CLI als MCP-Tools bereitstellen, darunter das Anlegen und Auflisten von Verspätungsfällen sowie die Berechnung einer Entschädigung. Im dokumentierten MVP ist zunächst ein Server-Skelett mit einem Ping-Tool umgesetzt. Der Server startet mit uv und wird durch Tests geprüft. Der Kern ist derzeit als vendored Platzhalter enthalten und wird manuell aus dem CLI-Kontext übernommen. Das Absenden eines Antrags bleibt beim Menschen.
