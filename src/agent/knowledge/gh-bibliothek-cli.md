---
id: "gh-bibliothek-cli"
title: "bibliothek-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Bibliothekskatalog", "CLI", "OPAC", "Ausleihen", "Keyword-Watch", "Bestätigung"]
aliases: ["bibliothek-cli", "Bibliotheks-CLI", "LIV-Bibliothekskatalog", "OPAC-Suche"]
link: "https://github.com/smlfg/bibliothek-cli"
source: "https://github.com/smlfg/bibliothek-cli"
source_kind: "github"
source_hash: "dc89f61865b03dc377b9c76a64af7b8acf3482164efb79b08ad70fccfee5b923"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:5952187af2d0e82afd4060f7efc4975b5a878b5f78a57228815fbcaee3976e89
---

bibliothek-cli ist eine Agent-CLI für den LIV-Bibliothekskatalog. Sie bietet Live-Suche, Detaildatensätze, statische Standorte, lokale Keyword-Watches, Kontologin, Ausleihanzeige und Verlängerung mit Bestätigung. Zugangsdaten werden über Umgebungsvariablen gelesen und nicht als CLI-Argumente verwendet. JSON-Ausgabe erzeugt genau ein Objekt auf stdout. Die Suche wurde live getestet. Login und Detailanzeige sind in der beschriebenen Version jedoch als Mock implementiert; ein Live-Login-Roundtrip steht als Follow-up aus. Das Werkzeug nutzt einen aDISWeb-/BSZ-Treiber, der als JavaScript- und Forms-Anwendung ohne SRU, DAIA oder REST beschrieben wird. Schreibende Verlängerungen benötigen `--confirm`.
