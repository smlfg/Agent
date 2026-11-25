---
id: "gh-sidecar-v1"
title: "Sidecar v1"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Claude Code", "Kontext-Daemon", "Unix-Socket", "Hooks", "Regeln", "Sicherheits-Gates"]
aliases: ["Sidecar v1", "Claude-Sidecar", "Kontext-Injektor"]
link: null
source: "https://github.com/smlfg/sidecar-v1"
source_kind: "github"
source_hash: "7a58dc13b2ad2cbcf17d6025a69581486384531edaba90121c357a27c06d396a"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:05b6f652887d4ded9fdf15f98f9da055b4f4e963a23d00e5aab7c520dee498d6
---

Sidecar v1 ist ein dauerhafter Kontext-Daemon für die Claude-Code-CLI. Er überwacht Sitzungen und injiziert situativ Regeln, Muster und Skill-Hinweise. Hooks reagieren auf UserPromptSubmit und PostToolUse; ein Unix-Socket verbindet Bridges und asyncio-Daemon. Der Daemon verwaltet 22 Regeln, einen Phasen-Tracker, Plugin-Nachladen und JSON-Sitzungszustände. Detektoren erkennen unter anderem Schleifen, Lesestürme, Fehlerketten, Drift und riskante Schreibvorgänge. Gates blockieren bestimmte Lösch-, Git- und Geheimnisaktionen. Das System ist fail-open ausgelegt: Bei Fehlern bleibt Claude funktionsfähig. Plugins liegen in rules/.
