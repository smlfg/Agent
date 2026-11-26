---
id: "gh-nextbike-cli"
title: "nextbike-cli"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["CLI", "Leihräder", "Live-Daten", "Stationen", "JSON"]
aliases: ["nextbike-cli", "nextbike", "Leihrad-Terminal", "Fahrradstationen-CLI"]
link: "https://github.com/smlfg/nextbike-cli"
source: "https://github.com/smlfg/nextbike-cli"
source_kind: "github"
source_hash: "7fb04297f4d7d223c5d9404901cb816378ec0cbb92e90e3d77765e42005504f6"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:e87f79dc9c0431cec52241e5e98450eb46a6c2cba84bc8d0f662c9ceda2c35aa
---

nextbike-cli zeigt Live-Verfügbarkeiten von Leihrädern im Terminal. Das lesende Werkzeug findet Städte und Stationen, zeigt Räder und Stellplätze, sucht Stationen in der Nähe, löst Fahrräder per Nummer auf und beobachtet Änderungen. Es benötigt weder Login noch App und verwendet öffentlich erreichbare JSON-Daten. Stadt- und Live-Daten werden unterschiedlich lange gecacht. Konfiguration, Cache und Watch-Stand liegen lokal mit restriktiven Dateirechten. Im Terminal erscheint Text; ohne TTY oder mit --json ein JSON-Objekt. Mehrdeutige Treffer werden ohne interaktive Auswahl nicht geraten. Ausleihe, Reservierung und Konten gehören nicht zum Funktionsumfang.
