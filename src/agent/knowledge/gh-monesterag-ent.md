---
id: "gh-monesterag-ent"
title: "Monster World"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Cloudflare Worker", "KI-Chat", "Durable Objects", "TTS", "SQLite"]
aliases: ["Monster World", "Monster-Chat", "KI-Monster", "Cloudflare-Monster-App"]
link: "https://github.com/smlfg/MonesterAG-ent-"
source: "https://github.com/smlfg/MonesterAG-ent-"
source_kind: "github"
source_hash: "38502dc83f980d05dad530f00bdaddc88a99e806527f613bc311ac4d96927256"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:aca7addc054a148d0dbcb0f1741ef19b1be1ce642d77b807a35f6a87879b1a1c
---

Monster World ist ein interaktiver Cloudflare-Worker-Prototyp mit fünf KI-Monstern. Jedes Monster besitzt Charakter, Stimme, Gedächtnis und Identität; Nutzer können mit ihm chatten. Der Worker verwendet ein kompatibles Remote-LLM, Edge-TTS und ein SQLite-Gedächtnis pro Monster und Sitzung. Ein Demo-Modus funktioniert ohne LLM-Schlüssel. Ein Durable Object hält die letzten zwölf Nachrichten, Reset löscht nur das jeweilige Gespräch. Sprachaufnahme nutzt die Web Speech API mit Tastatur-Fallback. Schutzmechanismen umfassen Turnstile, IP-Limit und Tageskostengrenze. Unit- und Smoke-Tests prüfen unter anderem Identität, Sitzungsisolierung, Persistenz, Reset, Validierung und TTS.
