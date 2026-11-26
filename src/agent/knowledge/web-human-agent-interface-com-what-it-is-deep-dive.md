---
id: "web-human-agent-interface-com-what-it-is-deep-dive"
title: "Technische Definition von Human Agent Interface"
waypoints: ["what-this-is", "creator", "product-for-x"]
topics: ["Human Agent Interface", "HAI-MCP", "Kontrollschicht", "Missionsvertrag", "Owner-Gate", "Evidenz"]
aliases: ["HAI Definition", "technische HAI-Definition", "Human-Agent-Interface", "HAI-MCP Control Plane"]
link: "https://human-agent-interface.com/what_it_is/deep-dive/"
source: "https://human-agent-interface.com/what_it_is/deep-dive/"
source_kind: "web"
source_hash: "a0c4f889517745086367de1fddff2e3cef3d3ec2606e870bb186f6b8ef1312a9"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:08e8fb2bddf23c20cb3d6f7b6b48cdcb209dc8702467adaafeb56831fbe21f35
---

Eine Human Agent Interface ist eine Kontrollschicht zwischen menschlicher Absicht und der Ausführung eines autonomen Agenten. Sie hält agentische Arbeit beobachtbar, begrenzt, durch den Owner freigegeben und evidenzbasiert. Dadurch kann der Mensch Arbeit steuern, stoppen, verifizieren und verantworten. HAI unterscheidet sich von einem normalen Agenten-Framework und von bloßem Human-in-the-Loop durch Missionsverträge, Sitzungsleases, Owner-Gates, Drift-Prüfungen, evidenzbasierte Abschlüsse, Parken und einen harten Stop. HAI-MCP implementiert diese Objekte als offene, modellunabhängige MCP-Control-Plane und ruft selbst kein Sprachmodell auf. Der Ansatz richtet sich gegen Scope Drift, Selbstfreigabe, False Done, Lease-Wiederverwendung, unendliche Delegation und Überlastung.
