---
id: "gh-minimalremarkableocrpipeline"
title: "MinimalreMarkableOCRPipeline"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["reMarkable", "OCR", "LaTeX", "Handschrift", "Benchmarking"]
aliases: ["MinimalreMarkableOCRPipeline", "reMarkable OCR", "Handschrift-zu-LaTeX", "OCR-Flywheel"]
link: "https://github.com/smlfg/MinimalreMarkableOCRPipeline"
source: "https://github.com/smlfg/MinimalreMarkableOCRPipeline"
source_kind: "github"
source_hash: "2c1e274d92ffdff7f2b787c29bca1193c746fa1be6c10b1f4ac6df6f1ea4a021"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:8779ae449c04bb0d82ee587c335aa64a0ca219d46fc181984325abae8afe122d
---

MinimalreMarkableOCRPipeline wandelt Handschrift vom reMarkable in LaTeX um und kennzeichnet Unsicherheit. Eine Pipeline kombiniert TexTeller und GLM-OCR, danach prüft eine Kohärenzschicht die Ergebnisse und liefert LaTeX, Unsicherheiten sowie Reparaturhinweise. Der Aufbau trennt Formel-Erkennung, Normalisierung, Strukturmetriken, Tablet-Import und Benchmarks. Für eigene Schrift werden Messungen zu Zeichen, Struktur und Latenz dokumentiert; Seitenstruktur ist noch nicht gemessen. Separate Python-Umgebungen isolieren Strukturpipeline und TexTeller-Worker. Experimente sind auf bestimmte OCR- und Kohärenzdateien begrenzt, während das Flywheel ansonsten eingefroren bleibt.
