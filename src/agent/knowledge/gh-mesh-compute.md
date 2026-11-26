---
id: "gh-mesh-compute"
title: "mesh-compute"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Tailscale", "Inference", "Ollama", "Hermes", "OpenAI-Kompatibilität"]
aliases: ["mesh-compute", "Tailscale-Mesh-Compute", "MBP-Inference", "Hermes-Fallback"]
link: "https://github.com/smlfg/mesh-compute"
source: "https://github.com/smlfg/mesh-compute"
source_kind: "github"
source_hash: "d9d86eacc4a8b070d81425dea2ad31985f4acefb79c820ee180ec55e258c98fd"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:0b847d6478da74d1f27a90355c5a39b15c73288981458857b6debbf90cc97f84
---

mesh-compute dokumentiert eine geteilte Tailscale-Mesh-Compute-Verbindung. Ein MacBook mit Metal dient als Ausweich-Provider für OpenAI-kompatible Inference, während ein ThinkPad Hermes nutzt. Das Repository enthält Interconnect-Konfiguration, Keep-Awake-Mechanismen, Provider-Fallbacks und Smoke-Tests, nicht die Modell-Runtime. Unterstützt werden die Endpunkte GET /v1/models sowie POST /v1/chat/completions mit Tools und Tool-Calls. Die Einrichtung umfasst Ollama-Exposition, einen wachhaltenden LaunchAgent, Endpoint-Prüfung und einen Tool-Calling-Test. Für lange Läufe ist eine feste Modellreihenfolge dokumentiert; echte API-Schlüssel und private Konfigurationen dürfen nicht eingecheckt werden.
