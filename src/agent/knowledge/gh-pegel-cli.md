---
id: "gh-pegel-cli"
title: "pegel"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["CLI", "Wasserstände", "PEGELONLINE", "REST-API", "Monitoring"]
aliases: ["pegel", "pegel-cli", "Wasserstands-CLI", "Pegel-Watch"]
link: "https://github.com/smlfg/pegel-cli"
source: "https://github.com/smlfg/pegel-cli"
source_kind: "github"
source_hash: "499557dde7d654e63a0cb0ad1176ec042a0253f1870ab9ae494465f6f52cdf58"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:c5b2d0fd97eddb728489f07e6d65832f6469645e8a522e30884b7903bf179c03
---

pegel ist ein lesendes Terminalwerkzeug für Live-Wasserstände an Bundeswasserstraßen. Es nutzt eine offene REST-API, findet Pegel nach Ort, zeigt aktuellen Stand, Einordnung und Drei-Stunden-Trend und liefert Verläufe, Kennwerte sowie flussabwärts sortierte Pegel. Ein Watch-Befehl meldet Änderungen und Schwellenüberschreitungen. Bei mehreren Treffern wird interaktiv ausgewählt; für Agenten gibt es eine explizite Erstwahl. Ohne TTY wird automatisch JSON ausgegeben. Cache und Watch-Zustand liegen lokal. Das Werkzeug sendet nur GET-Anfragen, benötigt keinen Login und schätzt fehlende Werte nicht. API-Ausfälle oder Änderungen der Quelle können die Nutzung beeinträchtigen.
