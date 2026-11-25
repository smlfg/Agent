---
id: "gh-kleinanzeigen-cli"
title: "kleinanzeigen-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Kleinanzeigen", "CLI", "Suche", "Chats", "Watch", "Auth0", "JSON"]
aliases: ["Kleinanzeigen CLI", "kleinanzeigen-cli", "Kleinanzeigen-Agent"]
link: "https://www.kleinanzeigen.de"
source: "https://github.com/smlfg/kleinanzeigen-cli"
source_kind: "github"
source_hash: "3b140b9f2c88fa93939ae1c3a4f5a5774e5d8acf44ca2271b54c252eeba03274"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:251595c7472a9ca304fc96226cd9d9d691f270e1b283bd2ac89403537f143c46
---

kleinanzeigen-cli ist eine Kommandozeilen-Schnittstelle für öffentliche Suche, Anzeigen-Details, Kategorien und lokale Suchaufträge auf kleinanzeigen.de. Optional unterstützt sie Login, Konversationslisten, Lesen und Antworten. Antworten werden erst nach einer Bestätigung gesendet; ohne Bestätigung bleibt die Aktion aus. Die CLI bietet JSON-Ausgaben, lokale Watch-Zustände und Filter für Ort, Umkreis, Preis, Kategorie, Angebotsart, Anbieterart, Versand und Sortierung. Der Login verwendet einen Auth0-Flow; das Passwort wird nicht gespeichert. Tests nutzen synthetische HTML- und API-Fixtures ohne regulären Netzabruf. Abrufe sind lesend, höflich und standardmäßig ohne Login.
