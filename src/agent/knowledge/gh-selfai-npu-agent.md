---
id: "gh-selfai-npu-agent"
title: "Terminal-Chatbot mit NPU-Beschleunigung"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Terminal-Chatbot", "NPU", "CPU-Fallback", "AnythingLLM", "Llama.cpp", "SelfAI"]
aliases: ["SelfAI NPU Agent", "NPU-Chatbot", "CPU-Fallback-Chatbot"]
link: "https://github.com/smlfg/SelfAi-NPU-AGENT"
source: "https://github.com/smlfg/SelfAi-NPU-AGENT"
source_kind: "github"
source_hash: "fb947708d4f2c3713eeb02598fb30b6fde64e08f0a746885c8eb85ff50b7c202"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:7f1c80d0d94d390c14204b03e320bbecba4b2ed37b457776b5c305c695aaa6fb
---

Das Projekt ist ein terminalbasierter Chatbot für Windows on ARM mit Snapdragon-X-Elite-NPU. AnythingLLM dient als primäres Inferenz-Backend; bei Nichterreichbarkeit übernimmt ein lokales GGUF-Modell über llama.cpp auf der CPU. Das SelfAI-CLI gliedert Anfragen in Planner-, Execution- und Merge-Phasen, protokolliert Status und nutzt bei fehlgeschlagenem Planning einen Analyse-zu-Antwort-Fallback. Eine zentrale YAML-Datei konfiguriert beide Backends. Zusätzlich bietet das CLI Memory-Befehle zum Auflisten und Reduzieren von Kategorien. Vorausgesetzt werden Python 3.12 ARM64, eine konfigurierte AnythingLLM-Installation und ein lokales Modell.
