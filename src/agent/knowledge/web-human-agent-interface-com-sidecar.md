---
id: "web-human-agent-interface-com-sidecar"
title: "Sidecar als HAI-Kontrollschicht"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Sidecar", "HAI", "Kontrolllayer", "Scope Drift", "Verifikation", "Kontrollgates"]
aliases: ["Sidecar HAI", "Sidecar-NG", "agentische Kontrollschicht", "4h HAI Setup"]
link: null
source: "https://human-agent-interface.com/sidecar/"
source_kind: "web"
source_hash: "d7d9fd08f6a0f4d06343ba7209ee175f48f2ceca4ae96e9369332ea4436e2bb0"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:0d1147d85c262939accd8a8d837b49aad905a6ea81b252dc7906441c2c48534f
---

Sidecar ist ein prototypengestützter Kontrolllayer hinter HAI. Während ein Hauptagent arbeitet, beobachtet Sidecar Überlastung, Scope Drift, Verifikationslücken und menschliche Entscheidungspunkte. Sidecar V7 verband Hooks, Daemon, Sicherheitsgates, Beobachtung, Kontextinjektion, Analyse und Dashboard. Die Entwicklung zeigte, dass weiche Regeln nicht ausreichen und ein Kontrollsystem selbst ausufern kann. Sidecar-NG verkleinerte den Ansatz zu einem lokalen Kontroll-Hook mit situativen Regeln und deterministischen Gates. Vorgesehene Modi sind PlanMode, ReviewMode, EvalMode und VerifyMode. Der Ansatz blockiert riskante Werkzeugnutzung, verlangt sichtbaren Zustand und unabhängige Prüfung. Für einen Workflow werden Kontrollbruchstellen kartiert, menschliche Entscheidungen getrennt, die kleinste Kontrollschicht entworfen und ihre Wirkung verifiziert.
