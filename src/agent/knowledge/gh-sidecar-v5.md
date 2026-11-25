---
id: "gh-sidecar-v5"
title: "Sidecar v5"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Qualitätskontrolle", "Lernverfolgung", "Trendverfolgung", "Evaluationspipeline", "A/B-Tests", "Claude Code"]
aliases: ["Sidecar v5", "Sidecar Eval Pipeline", "Claude-Code-Lerntracker"]
link: "https://github.com/smlfg/sidecar-v5"
source: "https://github.com/smlfg/sidecar-v5"
source_kind: "github"
source_hash: "af7907eb1fff88242f20f3300e4b3f5aa6c77b28fd9e5e1dd2259482d3ca8aea"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:ad88b906624823161f6f95d8dcbb63d4559a13a29a86832b85168ce27dce0d5b
---

Sidecar v5 erweitert die Qualitätskontrolle für Claude Code um Lern- und Trendverfolgung sowie eine Offline-Evaluationspipeline. Neben Mustererkennung, Quick Judge und Deep Judge Agent erfasst es implementierte, gelernte und offene Lücken über mehrere Sitzungen. EventStore, 30 Szenarien, A/B-Tests, Drift-Erkennung und Regelökonomie unterstützen die Evaluation. Die Architektur umfasst weiterhin 22 Regeln, sechs Gates, neun Detektoren, Phasen-Tracking, Sitzungsarchiv, Sprachbrücke und GTK3-Oberfläche. Die Kommunikation erfolgt über einen Unix-Socket; der Daemon bleibt fail-open. Die Versionshistorie nennt https://github.com/smlfg/sidecar-v5.
