---
id: "gh-sidecar-v2"
title: "Sidecar v2"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Claude Code", "SessionWatcher", "ContextSelector", "SkillRecommender", "GTK3", "Phasen-Tracking"]
aliases: ["Sidecar v2", "ContextSelector", "SessionWatcher", "Claude-Sidecar v2"]
link: "https://github.com/smlfg/sidecar-v2"
source: "https://github.com/smlfg/sidecar-v2"
source_kind: "github"
source_hash: "d30e74f1f442679dc4eec1f8dcbec33c7668173232d5fca60e92b1b26b281418"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:b4c6e23eddda9b2a55ae887ca662dd34bc108bfb86e9015498f50451b253a4b0
---

Sidecar v2 erweitert einen Kontext-Daemon für Claude Code um Echtzeit-Sitzungsüberwachung und phasenabhängige Auswahl. Ein SessionWatcher verfolgt JSONL-Dateien, ein ContextSelector reduziert injizierten Kontext, und ein SkillRecommender schlägt passende Skills vor. Der Phasen-Tracker nutzt Werkzeugfenster und Verlauf. Eine optionale GTK3-Oberfläche zeigt Status, Regeln, Sitzungen, Befunde und Injektionen. Die v1-Detektoren, Gates, Plugins, Sprachbrücke und fail-open-Auslegung bleiben erhalten. Ein optionaler LLM-Judge ist als spätere Funktion beschrieben. Die Kommunikation erfolgt über einen Unix-Socket.
