---
id: "gh-mesh-ear"
title: "mesh-ear / vorlesen"
waypoints: ["what-this-is", "product-for-x", "*"]
topics: ["Text-to-Speech", "Piper", "Tailscale", "SSH", "CLI"]
aliases: ["mesh-ear", "vorlesen", "Ein Ohr im Mesh", "pycoach-speak"]
link: "https://github.com/smlfg/mesh-ear"
source: "https://github.com/smlfg/mesh-ear"
source_kind: "github"
source_hash: "433e24fde6fd0996ad0740bf90643389e1da882297c75af1eb00d8f130870273"
updated_at: "2026-11-25"
visibility: public
approved_hash: sha256:cab72c03fb89fe5c4f45f31b625ac9e7434ed10eef26e8b2a899ac518caae63e
---

mesh-ear ist ein lokales Text-zu-Sprache-Werkzeug für ein Tailscale-Mesh. Der Einstieg vorlesen nimmt Text als Argument oder über stdin entgegen. Piper erzeugt deutsche Sprache mit einer Thorsten-Stimme; die Wiedergabe wird über eine lokale oder per SSH erreichbare Mesh-Sperre koordiniert. Dadurch läuft im gesamten Mesh nur ein Vorlesevorgang gleichzeitig. Statusmeldungen erscheinen auf stderr. Die benötigten Piper-Modelldateien liegen außerhalb des Repositories. Die Installation erfolgt über ein Shell-Skript, das den lokalen Binärpfad ergänzt. Das Werkzeug verwendet keine Cloud-APIs und unterstützt sowohl direkte Texteingabe als auch bereinigte Markdown-Pipelines.
