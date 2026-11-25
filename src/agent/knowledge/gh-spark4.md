---
id: "gh-spark4"
title: "Spark4"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Training", "JSONL", "YAML", "GPU", "Docker"]
aliases: ["Spark4", "Spark3-Portierung", "spark4_core"]
link: null
source: "https://github.com/smlfg/Spark4"
source_kind: "github"
source_hash: "0886b561cdd87cee675327b5f583db510f7c9095a00b03b981f4e6303fc62d99"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:d5661a7337e5c98436c29cfa0d8eafedbe8e2e066be6fbddfc082fde01492b43
---

Spark4 ist eine neu strukturierte Portierung von Spark3 für Training und Datenaufbereitung. Das Projekt trennt Kernfunktionen, Daten, Modelle und Ausgaben in eindeutig benannte Verzeichnisse. Es bietet einen YAML-Konfigurationsloader, einen JSONL-Trainings- und Validierungssplitter sowie eine GPU-Prüfung. Die Konfiguration wird aus einer Vorlage erzeugt; Daten lassen sich einfach oder detailliert im Verhältnis 80/20 teilen. Die Struktur vermeidet Konflikte mit Bibliotheksnamen und ist für Docker-Container vorbereitet. Die angegebene Version ist 4.0.0.
