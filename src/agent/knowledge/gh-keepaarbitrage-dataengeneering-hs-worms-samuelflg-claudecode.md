---
id: "gh-keepaarbitrage-dataengeneering-hs-worms-samuelflg-claudecode"
title: "Keeper System"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Keepa", "Amazon", "Data Engineering", "Kafka", "Elasticsearch", "PostgreSQL", "Kibana"]
aliases: ["Keeper System", "Keepa Deal Finder", "Amazon Preisüberwachung"]
link: "https://github.com/smlfg/DataEngeneering_KEEPA_HSWORMS.git"
source: "https://github.com/smlfg/KeepaArbitrage_DataEngeneering_HS-WORMS_SamuelFLG-ClaudeCode"
source_kind: "github"
source_hash: "7f3b46bbe822461dab8840b525532159cc32cf881bfdeda0819c922b00ccd4ab"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:58a102ba14cc6c9dab352f33348a86d1d451e03fa82a876aa0ef27bbf441a6e0
---

Keeper System ist eine Data-Engineering-Pipeline zur Überwachung von Amazon-Preisen und zur Deal-Suche. Preis- und Produktdaten werden über die Keepa API bezogen, mit Kafka verarbeitet und in PostgreSQL sowie Elasticsearch gespeichert. Kibana dient der Visualisierung. Ergänzend sind Agenten für Preisüberwachung, Deal-Findung und Benachrichtigungen vorgesehen. Eine FastAPI stellt REST-Endpunkte für Zustände, Watches, Preisprüfungen, Deals und Tokenstatus bereit. Docker Compose orchestriert die Dienste. Unterstützt werden Preisalarme, personalisierte Deal-Berichte, mehrere Benachrichtigungskanäle und europäische Marktplätze.
