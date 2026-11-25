---
id: "gh-sidecar-v3"
title: "Sidecar v3"
waypoints: ["what-this-is", "product-for-x"]
topics: ["QA-Inspektion", "Claude Code", "LLM-Judge", "MiniMax", "Gemini", "Ollama"]
aliases: ["Sidecar v3", "Claude-Code-QA", "LLM-Judge für Sidecar"]
link: "https://github.com/smlfg/sidecar-v3"
source: "https://github.com/smlfg/sidecar-v3"
source_kind: "github"
source_hash: "c7f096231a6d69a56ed85486cc9e18f63521c3e8003975e915e2edd38e037b0b"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:07595e86d2d9bdb5e4d14d5266d4407ef6a6c7d81858f51787222fa7a48ea921
---

Sidecar v3 ist ein QA-Inspektor für das Arbeitsverhalten von Claude Code. Neben deterministischen Detektoren und blockierenden Gates enthält es einen optionalen LLM-Judge. Dieser bewertet Sitzungen bei ausgelösten Detektoren, periodisch oder bei Phasenwechseln. Als Provider sind MiniMax M2.5, Gemini Flash und Ollama vorgesehen; ein Tagesbudget und ein Cache begrenzen Kosten und Wiederholungen. Coaching-Regeln, Best Practices und modulare Provider ergänzen die Architektur. Die bestehende Unix-Socket-Kommunikation, Sitzungsüberwachung, Kontextauswahl, Skill-Empfehlungen und GTK3-Oberfläche bleiben erhalten. Der Judge lässt sich über sidecar-ctl steuern.
