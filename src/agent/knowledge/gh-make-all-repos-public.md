---
id: "gh-make-all-repos-public"
title: "make-all-repos-public"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["GitHub", "Veröffentlichung", "Secret-Scan", "README", "Benchmark", "Agenten"]
aliases: ["make-all-repos-public", "Repository-Publikationsverfahren", "README-Bench"]
link: "https://smlfg.github.io/make-all-repos-public/site"
source: "https://github.com/smlfg/make-all-repos-public"
source_kind: "github"
source_hash: "5fdd56720c3fe25cab4e214108ab0434865d479ecdef8250716c64204b2a97b0"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:491c64181742016d84478e6fd15322f4aa1dc0568518f21228ddea913a01a843
---

make-all-repos-public beschreibt ein Verfahren, um lokale Projekte kontrolliert auf GitHub zu veröffentlichen. Es kombiniert vollständige Secret-Scans, private Erstellung, Scope-Prüfung, README-Pfadanalyse und Read-back nach dem Push. Ein Agent darf schreiben; deterministische Skripte entscheiden über Gates. Das Repository enthält außerdem README-Bench-Auswertungen zu Pfadtreue, erfundenen Pfaden, Blindurteilen und Harness-Effekten. Die zentrale Beobachtung lautet, dass eine Dateiliste im Prompt und ein Pfad-Checker die Pfadtreue stark verbessern können. Die Benchmark-Basis umfasst zwei Repositories und einen Prüfer; die Ergebnisse werden deshalb als Tendenz eingeordnet.
