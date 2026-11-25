---
id: "gh-typotuner"
title: "TypoTuner"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Tippfehleranalyse", "Linux", "evdev", "QWERTZ", "Tastatur", "Datenschutz"]
aliases: ["TypoTuner", "Tastatur-Analyse-Daemon", "QWERTZ Heatmap"]
link: "https://github.com/smlfg/typotuner"
source: "https://github.com/smlfg/typotuner"
source_kind: "github"
source_hash: "6ef8aac5362efa1b6cbff4ab69dea7276cff4312377ed6d505042abede1466e4"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:6f448713e744dd038813fed07876a27ca70839fe81d6409443944c9c120a0cf8
---

TypoTuner ist ein Linux-Daemon zur Analyse von Tippfehlern und Tastaturbetätigung. Er liest rohe Eingabeereignisse über evdev, erkennt Fehlertypen, berechnet geglättete Fehler- und Verweilzeiten und speichert nur Tastencodes sowie Zeitdaten. Auf Basis der Muster empfiehlt er Betätigungspunkte für eine SteelSeries Apex Pro TKL. Die Oberfläche umfasst eine Rich-CLI mit QWERTZ-Heatmap und Statistiken sowie ein Webdashboard mit interaktiver Tastatur und Diagrammen. SQLite, asyncio, FastAPI und Chart.js gehören zum technischen Aufbau. Getippte Zeichen oder Wörter werden nicht gespeichert.
