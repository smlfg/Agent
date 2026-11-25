---
id: "gh-mensa-cli"
title: "mensa"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["CLI", "Python", "Mensa", "OpenMensa", "JSON"]
aliases: ["mensa", "mensa-cli", "Mensa-Terminal", "Speiseplan-CLI"]
link: "https://github.com/smlfg/mensa-cli"
source: "https://github.com/smlfg/mensa-cli"
source_kind: "github"
source_hash: "5e5da11c190e04cfb3b736a6fdf136e13b7563c9c22248539a7a262b0bd67e70"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:c900be95f23e6eb496182f7d09ae6497709d63fd0483c8a815c6750eaff386f2
---

mensa ist ein lesendes Terminalwerkzeug für deutsche Mensa-Speisepläne über die OpenMensa-API v2. Standardmäßig verwendet es die Mensa Bildungscampus/Europaplatz in Heilbronn. Es bietet Tages-, Wochen- und Datumsabfragen, Suche, vegane oder vegetarische Filter, Preis- und Rollenfilter sowie eine lokale Standardauswahl. Im Terminal erscheinen verständliche Ausgaben; ohne TTY oder mit --json wird genau ein JSON-Objekt geliefert. Mehrdeutige Treffer werden nicht geraten. Konfiguration, Cache und Auswahl liegen lokal. Geschlossene Tage gelten als regulärer Zustand. Das Tool sendet nur lesende Anfragen und verwendet definierte Exit-Codes für Erfolg, Eingabe-, Netz- und Quellenfehler.
