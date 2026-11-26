---
id: "gh-chefkoch-mcp"
title: "chefkoch-mcp"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["MCP", "Rezepte", "Einkaufslisten", "stdio", "read-only"]
aliases: ["chefkoch-mcp", "Chefkoch MCP-Server", "Rezept-MCP", "MCP-Rezeptserver"]
link: "https://github.com/smlfg/chefkoch-cli"
source: "https://github.com/smlfg/chefkoch-mcp"
source_kind: "github"
source_hash: "26157b9d5855268f21f3226b9366348ed1a3e6c03cc7867d0b67d15e12db51f0"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:f651f984ae3a9920716f1c602dad5624aa48adb4248b2684a84875d86f5fb9a9
---

chefkoch-mcp ist ein ausschließlich lesender MCP-Server für Rezeptsuche, Rezeptdetails und Einkaufslisten. Er bildet eine dünne Hülle um den Kern von chefkoch-cli und verwendet dieselben Funktionen. Die Tools suchen Rezepte mit Filtern, laden Rezepte per ID, URL oder Suchbegriff und fassen Zutaten nach Name und Einheit zusammen. Der Server läuft über stdio und kann aus MCP-Clients gestartet werden. Die Daten stammen über eine inoffizielle API. Login und schreibende Web-Aktionen sind nicht erforderlich.
