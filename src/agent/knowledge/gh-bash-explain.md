---
id: "gh-bash-explain"
title: "bash-explain"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Bash", "Fehlererklärung", "Ollama", "Shell-Lernen", "offline", "stderr"]
aliases: ["bash-explain", "Bash-Erklärer", "Shell-Fehlererklärung", "Ollama Bash Hook"]
link: "https://github.com/smlfg/bash-explain"
source: "https://github.com/smlfg/bash-explain"
source_kind: "github"
source_hash: "595da0fbcd51e3b0843a4257cbbded7e5c9780bf9d097dc7bc4006a6350cf9d0"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:c3bd878e370a9dab1241add22b358c3f94e6db3ac61177f80992c225d8c1230f
---

bash-explain ist ein einzelnes Bash-Skript, das fehlgeschlagene interaktive Shell-Befehle mit einem lokalen Ollama-Modell auf Deutsch erklärt. Es sammelt sichtbare Standardfehlerausgabe, merkt den letzten Befehl, prüft Exit-Code und Fehlertext und zeigt anschließend eine kurze Erklärung unter dem Prompt. Standardmäßig wird `codellama` verwendet. Das Werkzeug ist offline-fähig und richtet sich an Lernende, die Fehlermeldungen verstehen möchten. Es arbeitet nur in interaktiven Shells und verändert die Standardfehlerumleitung dauerhaft für diese Shell. Stille Fehler ohne Standardfehlerausgabe werden nicht erklärt. Modelllatenz, lange Stacktraces und die Modellqualität begrenzen das Verhalten.
