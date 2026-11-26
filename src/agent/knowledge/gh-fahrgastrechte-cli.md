---
id: "gh-fahrgastrechte-cli"
title: "fahrgastrechte-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["CLI", "Fahrgastrechte", "Verspätungskonto", "Typer", "Antragsvorbereitung"]
aliases: ["fahrgastrechte-cli", "Verspätungskonto", "Bahnverspätungs-CLI", "Fahrgastrechte-Anträge"]
link: "https://github.com/smlfg/fahrgastrechte-cli"
source: "https://github.com/smlfg/fahrgastrechte-cli"
source_kind: "github"
source_hash: "ef008219e3df551509ba2d731a0ed81cf92a657fe49c8c9f7ebd9a7c76a03d66"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:42fa63ff7e31c2645d4942e11ac0bda4cb2a022357ef0c8f38ea15f1e0835d72
---

fahrgastrechte-cli ist eine Terminalanwendung für ein Verspätungskonto. Sie erfasst, sammelt und prüft Bahnverspätungsfälle und bereitet Anträge vor. Der Antrag wird vom Menschen selbst abgeschickt. Schreibende Aktionen verlangen standardmäßig eine Bestätigung und brechen ohne TTY ab, sofern kein explizites Bestätigungsflag gesetzt ist. Die Logik liegt in einem Kernpaket, die CLI bildet eine dünne Typer-Hülle. Der dokumentierte MVP umfasst Speicherung, Modelle, Konfiguration, einen Fahrplandaten-Connector sowie Fallverwaltung mit Duplikatschutz. Ein passender MCP-Server ist vorgesehen.
