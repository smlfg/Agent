---
id: "gh-variance-workflow"
title: "variance-workflow"
waypoints: ["what-this-is", "product-for-x"]
topics: ["Variantenvergleich", "Worktrees", "KI-Modelle", "Akzeptanztests", "Harness", "Git"]
aliases: ["variance-workflow", "vw", "A/B/C/D/E-Variantenvergleich"]
link: "https://github.com/smlfg/variance-workflow"
source: "https://github.com/smlfg/variance-workflow"
source_kind: "github"
source_hash: "7f8c2c8e53d6bfd89433d4f319b031e32de2d33b17cf0c7f5369b7cc247d2f12"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:8ef0a27cf66bd05550ffaf394680df4390e6169b1700b4d15bfa598ef817b3a4
---

variance-workflow lässt mehrere KI-Modelle dieselbe Funktion parallel in getrennten Git-Worktrees umsetzen. Varianten bleiben als auswählbare Alternativen erhalten, wenn sie gemeinsame Akzeptanztests bestehen. Der Ablauf friert einen Basisstand ein, weist Modelle und Entwurfswinkel zu, startet Harness-Adapter, sammelt Tests und Messwerte, erstellt Vergleichsberichte und integriert nur erlaubte Pfade. Unterstützt werden unter anderem OpenCode, Claude Code, Codex, Cursor Agent und Aider. Härtungsregeln begrenzen Parallelität, Laufzeit und Wiederholungen, isolieren Geheimnisse und protokollieren Fehler. Die Standardimplementierung benötigt Python 3.11+, Git und Bash.
