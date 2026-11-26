---
id: "gh-make-all-repos-public"
title: "make-all-repos-public"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["GitHub", "Veröffentlichung", "Secret-Scan", "README", "Benchmark", "Agenten"]
aliases: ["make-all-repos-public", "Repository-Publikationsverfahren", "README-Bench"]
link: "https://github.com/smlfg/make-all-repos-public"
source: "https://github.com/smlfg/make-all-repos-public"
source_kind: "github"
source_hash: "5fdd56720c3fe25cab4e214108ab0434865d479ecdef8250716c64204b2a97b0"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:0262e54218346225174496657269accec70788ae5494037bed16ab4966958b4b
---

make-all-repos-public beschreibt ein Verfahren, um lokale Projekte kontrolliert auf GitHub zu veröffentlichen. Es kombiniert vollständige Secret-Scans, private Erstellung, Scope-Prüfung, README-Pfadanalyse und Read-back nach dem Push. Ein Agent darf schreiben; deterministische Skripte entscheiden über Gates. Das Repository enthält außerdem README-Bench-Auswertungen zu Pfadtreue, erfundenen Pfaden, Blindurteilen und Harness-Effekten. Die zentrale Beobachtung lautet, dass eine Dateiliste im Prompt und ein Pfad-Checker die Pfadtreue stark verbessern können. Die Benchmark-Basis umfasst zwei Repositories und einen Prüfer; die Ergebnisse werden deshalb als Tendenz eingeordnet.
