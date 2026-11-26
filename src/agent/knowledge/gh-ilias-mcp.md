---
id: "gh-ilias-mcp"
title: "ilias-mcp"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["MCP", "ILIAS", "Moodle", "Kursinhalte", "stdio", "Lernplattform"]
aliases: ["ILIAS MCP", "Moodle MCP", "ilias-mcp Server"]
link: "https://github.com/smlfg/ilias-cli"
source: "https://github.com/smlfg/ilias-mcp"
source_kind: "github"
source_hash: "4e60ee8dc6643d589e1deea4fef2bc98c53a0372a9099f7eabd90ad4534e0efb"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:f5fc2f6e98fc3b28e6e0f0d82c12d4fb4d7bbee990dbd451cc1864b5e1311af0
---

ilias-mcp ist ein MCP-Server für ILIAS- und Moodle-Lernplattformen. Er ermöglicht Login, Sitzungsprüfung, Abmeldung, Kursauflistung und die Navigation durch Kursinhalte als Baum aus Abschnitten, Modulen und Dateien. Der Transport erfolgt standardmäßig über stdio für lokale MCP-Clients. Das Projekt verwendet einen vendorten Kern, der unabhängig von der ursprünglichen CLI weiterentwickelt werden kann. Aufgaben, Fristen und Uploads sind nicht implementiert. Zugangsdaten stammen aus Umgebungsvariablen oder Laufzeitargumenten; Sitzungen werden bevorzugt im Schlüsselbund gespeichert. Tests verwenden HTTP-Mocks ohne echten Login.
