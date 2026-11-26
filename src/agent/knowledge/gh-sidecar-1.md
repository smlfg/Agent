---
id: "gh-sidecar-1"
title: "Sidecar v1"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Claude Code", "Kontext-Daemon", "Unix-Socket", "Hooks", "Regeln", "Sicherheits-Gates"]
aliases: ["Sidecar v1", "Claude-Sidecar", "Kontext-Injektor"]
link: "https://github.com/smlfg/Sidecar-1"
source: "https://github.com/smlfg/Sidecar-1"
source_kind: "github"
source_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:a64049699dbf261b5669dfeebe17a91ba75e66090d97fde42ce258d0cf2a1faa
---

Sidecar v1 ist ein dauerhafter Kontext-Daemon für die Claude-Code-CLI. Er überwacht Sitzungen und injiziert situativ Regeln, Muster und Skill-Hinweise. Hooks reagieren auf UserPromptSubmit und PostToolUse; ein Unix-Socket verbindet Bridges und asyncio-Daemon. Der Daemon verwaltet 22 Regeln, einen Phasen-Tracker, Plugin-Nachladen und JSON-Sitzungszustände. Detektoren erkennen unter anderem Schleifen, Lesestürme, Fehlerketten, Drift und riskante Schreibvorgänge. Gates blockieren bestimmte Lösch-, Git- und Geheimnisaktionen. Das System ist fail-open ausgelegt: Bei Fehlern bleibt Claude funktionsfähig. Plugins liegen in rules/.
