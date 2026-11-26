---
id: "gh-personal-sidecar"
title: "Sidecar V5"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["asyncio", "Claude Code", "Kontext-Hinweise", "Hooks", "Daemon"]
aliases: ["Sidecar V5", "Personal Context Awareness", "Claude-Kontext-Sidecar", "UserPromptSubmit-Bridge"]
link: "https://github.com/smlfg/personal-sidecar"
source: "https://github.com/smlfg/personal-sidecar"
source_kind: "github"
source_hash: "3c82893d855d8d1425778559e254656e0b5071b8c8d158f4fc7d27abd9fb3127"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:82612bd6984f23bdc1862bf99df7868e4efab57ea3a79cf69f6af1abbc3bc20b
---

Sidecar V5 ist ein eigenständiger asyncio-Daemon für persönliche Kontext-Hinweise in Claude Code. Er lädt Profile, erkennt Muster wie lange Sitzungen, fehlende Pausen, Sitzungsaufteilung und Stimmungsschwankungen und injiziert höchstens zwei Empfehlungen pro Prompt. Die UserPromptSubmit-Bridge ruft den lokalen Unix-Socket auf und liefert zusätzlichen Kontext. Der Dienst blockiert nicht und fällt bei Fehlern leer aus. Schwellenwerte, Profilquellen und Pfade liegen in einer Konfigurationsdatei. Der Zustand wird über einen Socket abgefragt, manuell getestet und als Benutzerdienst gestartet. Das System ist ausdrücklich von früheren Sidecar-Versionen entkoppelt.
