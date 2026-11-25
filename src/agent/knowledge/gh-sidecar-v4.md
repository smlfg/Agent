---
id: "gh-sidecar-v4"
title: "Sidecar v4"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Qualitätskontrolle", "Claude Code", "Deep Judge", "Function Calling", "Detektoren", "Gates"]
aliases: ["Sidecar v4", "Deep Judge Agent", "Claude-Code-Qualitätskontrolle"]
link: "https://github.com/smlfg/sidecar-v4"
source: "https://github.com/smlfg/sidecar-v4"
source_kind: "github"
source_hash: "16856737fc32e0a87a9f1f5b5266aa5b4513cb176fbec2a3ed20b94c5eb592c7"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:7822d407e30802fd794ae60cc98218057b93f2b493905ebe8df8066af71e2713
---

Sidecar v4 ist ein persistenter Qualitätskontroll-Daemon für Claude Code. Er verbindet deterministische Mustererkennung, einen synchronen Quick Judge und einen asynchronen Deep Judge Agent mit Function Calling. Der Deep Judge navigiert eine Wissensbasis und erzeugt personalisiertes Feedback. Die Architektur umfasst Unix-Socket-Hooks, 22 Regeln, sechs Gates, neun Detektoren, Phasen-Tracking, Kontextauswahl, Sitzungsüberwachung, Skill-Empfehlungen und eine GTK3-Oberfläche. Plugins können per SIGHUP nachgeladen werden. Der Daemon ist fail-open ausgelegt und soll Claude bei eigenen Fehlern nicht blockieren. Die Versionshistorie verweist auf https://github.com/smlfg/sidecar-v4.
