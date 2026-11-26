---
id: "gh-doctolib-cli"
title: "doctolib-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["CLI", "Doctolib", "Terminsuche", "medizinische Profile", "Watchlist", "read-only"]
aliases: ["doctolib-cli", "Doctolib CLI", "Arzttermin-CLI", "freie Termine suchen"]
link: "https://github.com/smlfg/doctolib-cli"
source: "https://github.com/smlfg/doctolib-cli"
source_kind: "github"
source_hash: "8105688c13180df64e2ce1be79bcf5df855ccc4d87806d2cf355ae2a10a6f127"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:d5c0754119ba124c0a941b8dd6b0ce3ed833c4e1a1bc7bdb8b101032ebf2f2ab
---

doctolib-cli ist ein ausschließlich lesendes Kommandozeilenwerkzeug für die Suche nach medizinischen Profilen und freien Terminen. Es unterstützt Suche, Profilanzeige, Terminabfrage, Fachrichtungsfilter und lokale Watchlisten. Login und Buchung sind ausgeschlossen; der Buchungsbefehl endet immer mit Exit 5. Live-Suchen verwenden Playwright, Terminabfragen eine Verfügbarkeits-Schnittstelle. Ausgaben können terminallesbar oder als einzelnes JSON-Objekt erfolgen. Watchlisten werden lokal gespeichert. Mehrere Praxisstandorte werden pro Aufruf begrenzt abgefragt.
