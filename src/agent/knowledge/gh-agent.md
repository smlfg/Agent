---
id: "gh-agent"
title: "Agentfähig"
waypoints: ["what-this-is", "product-for-x", "creator", "*"]
topics: ["Human-Agent Interface", "Living Surface", "Agent-Website", "POST /api/agent", "Cloudflare", "Verhaltenstests"]
aliases: ["Agentfähig", "Living Surface", "Human-Agent Interface", "agentfaehig"]
link: "https://github.com/smlfg/Agent"
source: "https://github.com/smlfg/Agent"
source_kind: "github"
source_hash: "7ee97056add7c5e7f4ea607dcf8f4617299a6085e580ba49884aa57c6cb30934"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:ed3771c0ed2904f31e227c7f653a6dc749ec6d7399bd50f5b8548d198b5b8319
---

Agentfähig ist ein lokal laufendes Human-Agent Interface mit einer als Agent erlebbaren Website. Die Living Surface bietet Texteingabe, Typewriter-Antworten, Unterbrechen, konversationsgesteuerte Oberflächenanpassung, räumliche 2.5D-Tiefe und einen Fehlerzustand. Produktiv verarbeitet ein Worker Anfragen über `POST /api/agent`; Voice-Ausgabe ist nicht freigeschaltet. Lokal dienen deterministische Entwicklungsdaten. Das Projekt besitzt keinen Build und keine Laufzeit-Abhängigkeiten. Es enthält Validierungs- und Verhaltenstests sowie Deployment- und Verifikationsskripte. Die Umsetzung ist lokal bedienbar und live erreichbar; Voice-Ausgabe, ein 20-Turn-Latenzmesslauf und Fremdtests stehen noch aus.
