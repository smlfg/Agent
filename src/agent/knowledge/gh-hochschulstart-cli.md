---
id: "gh-hochschulstart-cli"
title: "hochschulstart"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["DoSV", "Bewerbungsportal", "CLI", "Rangliste", "Fristen", "Statusüberwachung"]
aliases: ["hochschulstart CLI", "DoSV CLI", "Bewerbungsstatus CLI"]
link: "https://github.com/smlfg/hochschulstart-cli"
source: "https://github.com/smlfg/hochschulstart-cli"
source_kind: "github"
source_hash: "ba05e6c1b5f769ca31a9ab66e8d046f75b67d4689ffc0030c743f5c264db0909"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:986cd4cddcffdcb462b5329c8f5d084b8381f754cc98f2c6edcaa1feeb69563b
---

hochschulstart ist eine CLI für das DoSV-Bewerbungsportal. Sie unterstützt Login, Bewerbungsstatus, Ranglisten, öffentliche Fristen und lokale Statusüberwachung. Annahme und Absage sind verbindliche Aktionen: Im Terminal wird vorher mit Standardantwort Nein gefragt; Agenten benötigen --confirm oder --yes. JSON-Ausgaben sind für Skripte vorgesehen. Sitzungen und Konfiguration werden lokal verwaltet, Geheimnisse nicht ausgegeben. Offline-Tests verwenden ein synthetisches Fake-Portal und prüfen auch Fehlerpfade, Bestätigungs-Gates und Secret-Leaks. Ein dokumentierter Live-Check öffentlicher Seiten war möglich, ein Live-Test mit Konto blieb wegen Portalwartung offen.
