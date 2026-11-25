---
id: "gh-mensa-agent"
title: "Mensa Notifier"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Python", "CLI", "Mensa-Speiseplan", "HTML-Parsing", "Heilbronn"]
aliases: ["Mensa Notifier", "mensa_today.py", "Mensa-Speiseplan-CLI", "imensa-Mensa-Tool"]
link: "https://github.com/smlfg/mensa-agent"
source: "https://github.com/smlfg/mensa-agent"
source_kind: "github"
source_hash: "e5a692da49759fbace383a01bb3559f008571ec8d714730ca991e899c7608e05"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:2bc2462eaf85193093226d0da98c9a2289ad45796779b6369a1835234d2bc3d0
---

Mensa Notifier ist ein kleines Python-Kommandozeilenprogramm für den täglichen Speiseplan der Mensa am Bildungscampus Heilbronn. Es lädt HTML, extrahiert Kategorien, Gerichte und Preise und wählt deterministisch bis zu drei repräsentative Mahlzeiten. Eine vegetarische Alternative wird bei Bedarf zusätzlich ausgegeben. Das Programm nutzt requests und BeautifulSoup, arbeitet synchron, benötigt keine Datenbank oder Geheimnisse und gibt bei Netzfehlern eine kurze Meldung aus. Es ist auf die HTML-Struktur von imensa.de angewiesen und unterstützt keine Historie, Mehrstandortabfragen, Benachrichtigungen oder Wiederholungslogik. Die Ausgabe kann über einen Zeitplan wie Cron oder einen Agenten verteilt werden.
