---
id: "gh-dataengeneering-keepa-hsworms"
title: "Keeper System"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Data Engineering", "Keepa", "Kafka", "Elasticsearch", "PostgreSQL", "Preisüberwachung"]
aliases: ["Keeper System", "Amazon Price Monitoring", "Deal Finder", "Keepa-Datenpipeline"]
link: "https://github.com/smlfg/DataEngeneering_KEEPA_HSWORMS"
source: "https://github.com/smlfg/DataEngeneering_KEEPA_HSWORMS"
source_kind: "github"
source_hash: "da97b39b713060bbb54974643191620dd5d10652145d2ff08a9683a1de5ff0d5"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:d1285c595d3c0bc44951e1a493be3ab8e88c67fa6dc4fa991f0524bfc671f835
---

Keeper System ist eine Datenpipeline zur Überwachung von Amazon-Preisen und zur Deal-Suche. Eine Keepa-Schnittstelle liefert Daten an Kafka; Consumer verarbeiten sie für PostgreSQL und Elasticsearch. Eine REST-API, Scheduler und Agenten unterstützen Preisüberwachung, Deal-Berichte, Benachrichtigungen und Analysen. Elasticsearch-Indizes ermöglichen Suche und Aggregationen. Die Infrastruktur umfasst unter anderem Kafka, Redis, PostgreSQL, Elasticsearch und Kibana. Docker Compose dient zum Start der Dienste. Für den Betrieb werden API-Schlüssel und weitere Umgebungsvariablen konfiguriert.
