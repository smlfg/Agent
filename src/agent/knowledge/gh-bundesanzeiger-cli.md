---
id: "gh-bundesanzeiger-cli"
title: "bundesanzeiger-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Bundesanzeiger", "Bekanntmachungen", "Firmenrecherche", "Captcha", "CLI", "Watch-Modus"]
aliases: ["bundesanzeiger-cli", "Bundesanzeiger-Suche", "Bekanntmachungs-CLI", "Jahresabschluss-Index"]
link: null
source: "https://github.com/smlfg/bundesanzeiger-cli"
source_kind: "github"
source_hash: "bc88bce0aed66ee3a375000c08bf1f20f472ff80041c922c91a87fa14cbf034c"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:a67325eb3ded3b15a0f02cf3b395254e6f3a089e32100e90b13f8ba4e5378f1b
---

bundesanzeiger-cli durchsucht und liest Bekanntmachungen im Bundesanzeiger. Es findet Firmenbekanntmachungen nach Name, filtert Bereiche und Datum, liest Volltexte und zeigt neue Bekanntmachungen seit dem letzten Aufruf. Ein Login ist nicht nötig; die Zugriffe sind lesend. Jahresabschlüsse bleiben durchsuchbare Indizes, während ihr Volltext wegen eines Captchas nicht abgerufen wird. Das Werkzeug umgeht Captchas nicht, sondern nennt eine Such-URL. JSON wird bei nicht interaktivem stdout standardmäßig ausgegeben. Cache und Watch-Zustand werden lokal gespeichert. Exit-Codes unterscheiden Erfolg, Nutzungsfehler, allgemeine Fehler, Quellenfehler und Abbruch. Die öffentliche Website wird ohne dokumentierte API verwendet.
