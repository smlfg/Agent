---
id: "gh-selfai-minimaxm2"
title: "Terminal-Chatbot mit NPU-Beschleunigung"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Terminal-Chatbot", "NPU", "CPU-Fallback", "AnythingLLM", "Llama.cpp", "SelfAI"]
aliases: ["SelfAI NPU Chatbot", "MiniMax M2 Chatbot", "NPU-CPU-Fallback"]
link: null
source: "https://github.com/smlfg/SelfAI-MiniMaxM2-"
source_kind: "github"
source_hash: "fb947708d4f2c3713eeb02598fb30b6fde64e08f0a746885c8eb85ff50b7c202"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:3c97ead6ca80db9dfbe64dfb52d3567e287095b9dadc64accb5934385b09337a
---

Das Projekt ist ein terminalbasierter Chatbot für Windows on ARM mit Snapdragon-X-Elite-NPU. AnythingLLM dient als primäres Inferenz-Backend; bei Nichterreichbarkeit übernimmt ein lokales GGUF-Modell über llama.cpp auf der CPU. Das SelfAI-CLI gliedert Anfragen in Planner-, Execution- und Merge-Phasen, protokolliert Status und nutzt bei fehlgeschlagenem Planning einen Analyse-zu-Antwort-Fallback. Eine zentrale YAML-Datei konfiguriert beide Backends. Zusätzlich bietet das CLI Memory-Befehle zum Auflisten und Reduzieren von Kategorien. Vorausgesetzt werden Python 3.12 ARM64, eine konfigurierte AnythingLLM-Installation und ein lokales Modell.
