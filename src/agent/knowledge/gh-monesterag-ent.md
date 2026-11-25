---
id: "gh-monesterag-ent"
title: "Monster World"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Cloudflare Worker", "KI-Chat", "Durable Objects", "TTS", "SQLite"]
aliases: ["Monster World", "Monster-Chat", "KI-Monster", "Cloudflare-Monster-App"]
link: "https://monster-world.smlflg.workers.dev"
source: "https://github.com/smlfg/MonesterAG-ent-"
source_kind: "github"
source_hash: "38502dc83f980d05dad530f00bdaddc88a99e806527f613bc311ac4d96927256"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:314b30a9ff5e9d4334ce4becafb44673a48f7433d1560610594b127d9c81a501
---

Monster World ist ein interaktiver Cloudflare-Worker-Prototyp mit fünf KI-Monstern. Jedes Monster besitzt Charakter, Stimme, Gedächtnis und Identität; Nutzer können mit ihm chatten. Der Worker verwendet ein kompatibles Remote-LLM, Edge-TTS und ein SQLite-Gedächtnis pro Monster und Sitzung. Ein Demo-Modus funktioniert ohne LLM-Schlüssel. Ein Durable Object hält die letzten zwölf Nachrichten, Reset löscht nur das jeweilige Gespräch. Sprachaufnahme nutzt die Web Speech API mit Tastatur-Fallback. Schutzmechanismen umfassen Turnstile, IP-Limit und Tageskostengrenze. Unit- und Smoke-Tests prüfen unter anderem Identität, Sitzungsisolierung, Persistenz, Reset, Validierung und TTS.
