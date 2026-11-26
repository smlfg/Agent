---
id: "gh-promptboost"
title: "PromptBoost v0.1.1"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Prompt-Compiler", "Prompt-Evaluation", "deterministische Verarbeitung", "OpenAI-kompatible Modelle", "SQLite"]
aliases: ["PromptBoost", "lokaler Prompt-Compiler", "Prompt-Eval-Logger", "no-new-facts check"]
link: "https://github.com/smlfg/PromptBoost"
source: "https://github.com/smlfg/PromptBoost"
source_kind: "github"
source_hash: "5f259c46a429f515a89ecd4ff558ac420d79fdd418a66898d1e14578a24a0de5"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:7ae071084780a6e81b75dad47bb8857aa4276439f0ce45675fe64256a72f6d32
---

PromptBoost ist ein lokaler Compiler und Evaluationslogger für persönliche Prompts. Er liest PromptGarage-Beispiele schreibgeschützt, verarbeitet Rohprompts, wählt Regeln für Aufgabe, Harness und Modell, erzeugt deterministisch verbesserte Prompts und prüft konservativ auf neue Fakten. Boost-Läufe werden in promptboost.db gespeichert. Ein optionaler agentischer Modus nutzt zunächst ein OpenAI-kompatibles Sprachmodell und fällt bei Ausfall oder vermuteten neuen Fakten auf den deterministischen Ablauf zurück. Die Anwendung läuft als lokale Uvicorn-Webanwendung. In Version 0.1 werden keine kostenpflichtigen Sprachmodell-APIs verwendet.
