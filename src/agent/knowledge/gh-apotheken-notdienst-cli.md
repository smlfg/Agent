---
id: "gh-apotheken-notdienst-cli"
title: "apotheken-notdienst-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Notdienst-Apotheken", "CLI", "Deutschland", "Umkreissuche", "Caching", "Exit-Codes"]
aliases: ["apotheken-notdienst-cli", "notdienst", "Apotheken-Notdienstsuche"]
link: "https://github.com/smlfg/apotheken-notdienst-cli"
source: "https://github.com/smlfg/apotheken-notdienst-cli"
source_kind: "github"
source_hash: "6f0ec99c8e701de4ebce5e766cce88f6b9bee35c73f5d2f336ed975051ae6dcf"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:960c8790504671a56922aec126104345ad5b1d7a21aabf59ff464907402dd9da
---

apotheken-notdienst-cli findet Notdienst-Apotheken in Deutschland über die öffentliche Notdienstsuche. Es unterstützt aktuelle und datierte Suchen, Orte, Postleitzahlen, Umkreise, Straßen, Entfernungen, Öffnungszeiten, Details und JSON-Ausgabe. Ein Standardort kann lokal gespeichert werden. Ergebnisse werden zehn Minuten zwischengespeichert; ein Suchlauf verwendet höchstens drei lesende GET-Anfragen. Das Werkzeug benötigt keinen Login und führt keine schreibenden Web-Aktionen aus. Mehrdeutige Orte werden interaktiv oder mit einer Auswahloption behandelt. Exit-Codes unterscheiden Erfolg, keine Treffer, Eingabefehler und Quellenfehler. Die verwendete Website ist keine dokumentierte API; bei Änderungen meldet das Werkzeug einen Quellenfehler statt eines Tracebacks.
