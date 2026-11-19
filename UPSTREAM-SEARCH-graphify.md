# UPSTREAM-SEARCH — Mesh/Graphify über Ordner und Pläne

Stand: 18.11.2026 · Vertrag: `03_HAI/docs/UPSTREAM_FIRST_GATE.md`

## Need

Ein Mesh (Wissensgraph) zwischen den Ordnern und Plänen dieses Repos, damit
klar ist, was wo drinhängt: `IDEA-TRANSKRIPT.txt`, `sketches/`, `docs/`, `tech/`, `research/`
und die Pläne darunter als ein begehbarer, klickbarer Graph — kein Eigenbau,
falls ein gepflegtes Upstream existiert.

## Kandidaten

Lizenz, Sterne, letzter Push am 18.11.2026 geprüft (GitHub-Repo-Seite bzw.
GitHub-API).

| # | Repo | Lizenz | Sterne | Letzter Push | Deckt ab | Verdict |
|---|---|---|---|---|---|---|
| 1 | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | Apache-2.0 (+ MIT) | 150.0k | 17.11.2026 (Stand 18.11., vor 17 h) | Genau das Need: Ordner inkl. Docs/PDFs zu einem klickbaren Knowledge-Graph (`graph.html`), plus `GRAPH_REPORT.md` und `graph.json`; Abfragen per `graphify query/path/explain`; `--wiki` baut eine Markdown-Wiki aus dem Graph (Option 1 gratis mitgeliefert). Skill/Integration für OpenCode, Claude Code, Cursor, Codex u. a. | **use (Kandidat)** |
| 2 | [lucasrosati/claude-code-memory-setup](https://github.com/lucasrosati/claude-code-memory-setup) | MIT | 1.071 | 21.10.2026 | Setup-Guide: Obsidian + Graphify als persistentes Gedächtnis für Claude Code | reject als Werkzeug — baut auf #1 auf, ist selbst keins |
| 3 | [TtTRz/graphify-rs](https://github.com/TtTRz/graphify-rs) | laut GitHub-API nicht als SPDX-Lizenz erkannt | 80 | 09.11.2026 | Rust-Neuimplementierung von #1 | reject — Fork-Artefakt ohne geklärte Lizenz, kein Mehrwert hier |
| 4 | [foambubble/foam](https://github.com/foambubble/foam) | laut GitHub-API „Other" (nicht SPDX-normalisiert) | 17.5k | 17.11.2026 | VS-Code-Wiki: manuelle Wikilinks plus Graph-Ansicht | reject — verlangt manuelles Verlinken jedes Dokuments; Graph entsteht nicht aus dem Repo-Bestand |

Ältere/Namensvettern (Starkbastani, StarGraphitti, raufer — archiviert oder
abwegig) nicht weiter geprüft.

## Decision

**Vorschlag: `Graphify-Labs/graphify` (REUSE, kein Eigenbau).** Es ist ein
aktiv gepflegtes, permissiv lizenziertes Upstream (150k Sterne, Commit
vor Stunden, YC-S26-Unternehmen dahinter) und deckt beide Samuel-Optionen ab:
den Graph (Option „Graphify") und die vernetzte Karte (Option „Wiki", via
`--wiki` bzw. `GRAPH_REPORT.md`). Die Entscheidung liegt bei Samuel und ist
nicht bestätigt.

Was bei einem Lauf zu beachten ist:

- **Dieses Repo ist fast nur Markdown.** Code-Dateien parst Graphify lokal per
  tree-sitter; **Docs/PDFs brauchen einen semantischen Pass über ein
  LLM-Backend** (API-Key von Anthropic/OpenAI/DeepSeek, Ollama lokal, oder das
  Modell der laufenden Assistenz-Session über den `/graphify`-Skill).
  `--code-only` oder `GRAPHIFY_BACKEND=none` würden ausgerechnet die Pläne
  überspringen — für dieses Repo ungeeignet. Kimi/Moonshot routet zu Servern
  in China; Datenresidenz bei Backend-Wahl bedenken.
- **Falschbenennung auf PyPI:** offizielles Paket ist `graphifyy`
  (doppel-y), CLI heißt `graphify`. Andere `graphify*`-Pakete sind nicht
  zugehörig.
- **Schreibt Anweisungsdateien:** `graphify install --project` legt
  `.agents/skills/graphify/SKILL.md` bzw. `.claude/skills/graphify/` an und
  ergänzt Anweisungen in `AGENTS.md`-ähnlichen Dateien. Das berührt die
  Projektregel „keine Config/AGENTS-Änderung ohne Freigabe" → Teil der
  Freigabe, nicht stillschweigend.
- **Graphify Cloud** (kommerzieller Upsell, Sentry/Jira-Connectors) ist für
  dieses Need nicht erforderlich; die lokale CLI reicht.

## Installationsweg (ausgeführt am 18.11.2026)

1. ~~Freigabe von Samuel einholen~~ — erteilt.
2. ~~`uv tool install graphifyy`~~ — inkl. Extras `[ollama,pdf]` installiert
   (ohne `[ollama]` bricht der Backend ab, ohne `[pdf]` werden PDFs still
   übersprungen).
3. Mesh über dieses Repo gebaut: klickbarer Mesh (`graph.html`), Bericht
   [`GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md) (God-Nodes, Communities)
   und `graph.json` (querybar). Deep-Mode: 130 Knoten, 128 Kanten,
   28 Communities; komplett lokal über Ollama (Modell `qwen3.6:35b-a3b-64k`,
   Bilder über `qwen2.5vl:7b`).
   Die Graph-Dateien selbst sind **nicht** im Repo — sie sind großer
   Maschinen-Output und bei jedem Lauf reproduzierbar (`graphify update .`).
   Dauerhaft im Repo liegen die Auswertungen mit Belegen:
   `graphify-out/prebuild/`, `graphify-out/synergie/`, `graphify-out/triage/`.
4. Known Gaps: die Skizzen-PDF hat keinen Textlayer (das PNG deckt den Inhalt
   ab). Behoben am 19.11.: das Transkript heißt jetzt
   [`IDEA-TRANSKRIPT.txt`](IDEA-TRANSKRIPT.txt) und hat eine Endung — graphify
   überspringt es nicht mehr.
5. Skill [`~/.agents/skills/graphify-mesh/`](https://github.com/smlfg/agents)
   erzeugt den Mesh bei Bedarf in jedem Repo; Backend-Regel:
   privat → Ollama lokal, öffentlich → MiniMax 3.1 Flash.

Schwester-Suche für die Technik-Seite (Cloudflare-Agent-Upstreams):
[`tech/UPSTREAM-SEARCH-cloudflare.md`](tech/UPSTREAM-SEARCH-cloudflare.md).

## Nicht gesucht

Graphify Cloud, Obsidian-Setup-Guides und veröffentlichte Digital Gardens
(Quartz & Co.) — um den Mesh im eigenen Repo geht es, nicht um Hosting.
