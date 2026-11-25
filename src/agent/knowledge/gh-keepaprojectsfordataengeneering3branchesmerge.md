---
id: "gh-keepaprojectsfordataengeneering3branchesmerge"
title: "Keepa Arbitrage Engine"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Keepa", "Arbitrage", "Kafka", "Elasticsearch", "Kibana", "Data Engineering"]
aliases: ["Keepa Arbitrage Engine", "Keepa Data Engineering", "Keepa Deal Pipeline"]
link: null
source: "https://github.com/smlfg/KeepaProjectsforDataEngeneering3BranchesMerge"
source_kind: "github"
source_hash: "3a8c9f5a66aa51c8a68459581a131b9a19fc8153cd3d74850066a2fe8b3d5724"
updated_at: "2026-11-25"
visibility: public
---

Keepa Arbitrage Engine ist ein Data-Engineering-Projekt zur automatisierten Deal-Erkennung mit Keepa API, Kafka, Elasticsearch und Kibana. Ein Scheduler verarbeitet Daten in einem fünfminütigen Zyklus. Elasticsearch speichert Deals und Arbitrage-Daten, Kibana visualisiert sie, Kafka stellt rohe Deal-Daten für unabhängige Consumer-Gruppen bereit. Das Projekt beschreibt einen Elasticsearch-Alias, eine serverseitige Ingest-Pipeline und ein Index-Template. Zusätzlich gibt es einen Clusterbetrieb mit mehreren Elasticsearch-Knoten und Kafka-Brokern. Architekturentscheidungen betreffen Elasticsearch als primären Sink, Kafka als sekundären Bus, KRaft, serverseitige Anreicherung und asynchrone Verarbeitung.
