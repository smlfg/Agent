---
id: "gh-hochschulsport-cli"
title: "hochschulsport-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Hochschulsport", "Buchsys", "CLI", "Kursbuchung", "JSON", "Tests"]
aliases: ["hsport", "Hochschulsport CLI", "Buchsys CLI"]
link: "https://github.com/smlfg/hochschulsport-cli"
source: "https://github.com/smlfg/hochschulsport-cli"
source_kind: "github"
source_hash: "71d0e78cce39e25a05c95fb716a7689e75647205f45ade1943aa475411d87878"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:4e38561ed1f9874be06ce711e9539b58fae3a3f58b0b9022ffe6678a4db0245d
---

hochschulsport-cli ist eine Kommandozeilen-Schnittstelle für Buchsys-Hochschulsportportale. Sie kann Sportarten, Kurse und Kursdetails anzeigen, Buchungsstatus beobachten und Kurse buchen. Ohne Bestätigung läuft eine Buchung als Trockenlauf; das Absenden erfordert --confirm oder --yes sowie vollständige Umgebungsvariablen. Die CLI bietet stabile JSON-Ausgaben, lokale Statusdateien mit restriktiven Rechten und definierte Exit-Codes. Unterstützt werden mehrere bekannte Portale, konfigurierbar über Kurz-ID oder URL. Tests verwenden synthetische Fixtures und einen Netzwerk-Harness ohne echte Serverzugriffe. Passwörter werden nicht als Kommandozeilenargumente akzeptiert.
