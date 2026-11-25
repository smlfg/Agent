---
id: "gh-angebote-cli"
title: "angebote-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Prospektangebote", "CLI", "kaufDA", "Shopping", "Watch-Modus", "JSON"]
aliases: ["angebote-cli", "angebote", "Prospekt-Suche", "Angebote CLI"]
link: "https://github.com/smlfg/angebote-cli"
source: "https://github.com/smlfg/angebote-cli"
source_kind: "github"
source_hash: "96ef93b52bcea286743842272156ae3d83f8f4a6ac80fb942846263c89e36f41"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:645c18143b083ccd3b868a89c951de11cee64344466b95556320d8471f3e0301
---

angebote-cli ermöglicht Agenten und Menschen den lesenden Zugriff auf aktuelle Prospektangebote deutscher Händler. Die Suche unterstützt Begriffe, Händler, Marken, Preise, Rabatte, Seiten, Orte und JSON-Ausgabe. Zusätzlich zeigt das Werkzeug Händlerprospekte, sucht einzelne Angebote und beobachtet neue Angebote über einen lokalen Watch-Zustand. Es verwendet öffentlich abrufbare Seiten, benötigt keinen Login und führt keine Schreibaktionen aus. Ergebnisse enthalten den tatsächlich verwendeten Ort. Die Suche filtert irrelevante Treffer anhand normalisierter Wörter und kann diesen Filter abschalten. Die Installation erfolgt über pip oder pipx; als einzige Laufzeitabhängigkeit wird `httpx` genannt. Zugriffe werden gedrosselt und mit einem User-Agent gekennzeichnet.
