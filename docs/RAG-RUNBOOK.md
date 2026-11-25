# RAG-Runbook — Wissen erneuern, erweitern, aktualisieren

Stand: 25.11.2026 (V1). Damit das nächste, größere RAG nicht bei null anfängt.
Entscheidungen: [`ADR-0007`](adr/ADR-0007-wissen-per-pre-retrieval.md) ·
Details: [`ENTSCHEIDUNGEN-RAG-2026-11-25.md`](ENTSCHEIDUNGEN-RAG-2026-11-25.md) ·
Bausteine: [`UPSTREAM_SEARCH-rag.md`](../UPSTREAM_SEARCH-rag.md) · Plan-Linie: K1 in
[`EXECUTION_PLAN-M0-M5.md`](EXECUTION_PLAN-M0-M5.md).

## 1. Wie es heute funktioniert

```
GitHub · Websites · knowledge.json · (Notion/Plaud: noch nicht)
   │ scripts/chunks/collect.mjs + migrate-knowledge.mjs        (0 Tokens)
   ▼
scripts/chunks/.out/sources/*.json
   │ scripts/chunks/run-condense.mjs --batch 15                (Codex gpt-5.6-luna, ~2,7k Tokens/Quelle)
   ▼
scripts/chunks/check.mjs  → src/agent/knowledge/<id>.md        (Schema, Link ∈ Quelle)
   │ scripts/chunks/screen.mjs → http://127.0.0.1:5174         (Samuel: + / − , approved_hash = Inhalts-Hash)
   ▼
scripts/build-knowledge.mjs → deploy/…/src/knowledge/chunks.json + embeddings.json (bge-m3, CF-Token)
   │
   ▼  Worker (deploy/agentfaehig-site/src/worker.js + search.js)
   Nachricht → Suche (BM25 + bge-m3, RRF, Alias-Garantie, Multi-Query, Gesprächsanker)
            → Top 5 + coverage in serverseitigen Prompt → 1 LLM-Aufruf → Zitate prüfen → sources
```

## 2. Wissen aktualisieren — Ablauf (Reihenfolge einhalten)

Alles aus `~/Projects/03_HAI/Agentfaehig/Agent`. Schritte mit 🔑 brauchen das Cloudflare-Token
und laufen **im eigenen Terminal** (nicht im Chat, nicht per `!`):

```bash
export CLOUDFLARE_ACCOUNT_ID=…   # aus `wrangler whoami`
read -s "CLOUDFLARE_API_TOKEN?Token: " && export CLOUDFLARE_API_TOKEN
```

| # | Befehl | Was | Kosten |
|---|---|---|---|
| 1 | `node scripts/chunks/collect.mjs` | Quellen sammeln (`content/sources.json` pflegen) | 0 |
| 2 | `node scripts/chunks/migrate-knowledge.mjs` | nur falls Legacy-Fixture neue Einträge braucht | 0 |
| 3 | `node scripts/chunks/run-condense.mjs --batch 15` | nur geänderte Quellen (Cache `source_hash`) | ~45k Tokens/Batch |
| 4 | `node scripts/chunks/check.mjs` | Chunks schreiben; erfundene Links fliegen raus | 0 |
| 5 | `node scripts/chunks/screen.mjs` | Samuel screent; geänderte Chunks verlieren ihre Freigabe | Owner-Zeit |
| 6 🔑 | `node scripts/build-knowledge.mjs` | chunks.json + nur geänderte Embeddings | ~1 Cent |
| 7 | Golden pflegen (`evals/golden.json`), neue Fragen 🔑 `node scripts/embed-golden.mjs` | Ground Truth der Suche | ~0 |
| 8 | `node scripts/calibrate-coverage.mjs` | Schwelle neu kalibrieren → `coverage.json` | 0 |
| 9 | `npm test` | Gate: Ranking + Sicherheit hart (`tests/retrieval.test.js`) | 0 |
| 10 | `deploy/agentfaehig-site/deploy.sh` → `--prod` | nur mit Owner-Freigabe | – |
| 11 | `node evals/answers.mjs --url https://www.xn--agentfhig-02a.de` | Antwort-Eval gegen Live (Rate-Limit beachten) | 15 Anfragen |

## 3. Was wir in V1 gelernt haben (nicht nochmal lernen)

1. **Ranking ≠ Beantwortbarkeit.** Cosinus misst Themennähe, nicht ob die Antwort drinsteht
   („wo wohnt samuel" ist nah an `about-samuel`). bge-m3 staucht Werte (fremde Sätze ≈ 0,4,
   Treffer 0,45–0,75) → feste Schwellen sind wackelig. `coverage` ist darum nur Hinweis; die
   Treffer gehen immer in den Kontext, das Modell entscheidet, `answers.mjs` misst.
2. **Upstream-Suche prüft Bausteine, nicht Methoden.** Vor dem Bau einen **Messlauf** machen
   (10 Fragen × 20 Chunks reicht), bevor Phasen darauf aufbauen (ADR-0001).
3. **Plan-Council/Validierung nicht überspringen** — genau die Frage „trennt die Schwelle?"
   wäre dort gekommen.
4. **Nutzereingabe ist Daten:** `[[id]]`-Marker vor der Suche entfernen (sonst erzwingbare Treffer).
5. **Codex-Harness kostet ~23k Tokens pro Aufruf**, unabhängig von MCP-Servern → Batches (15).
   Codex muss per Brief als Worker laufen (`~/.agents/instructions/codex/AGENTS.md`, Rolle „selbst").
6. **Codex-Code prüfen:** Hash-Freigabe deckte zuerst nur Frontmatter ab; Kalibrierung war ein
   Stub; ein Feature war immer 1. Tests waren trotzdem grün.
7. **Lokaler Antwort-Eval über Workers-AI-REST läuft in die Worker-Timeouts** → gegen Live testen.
8. **Erster Live-Eval (25.11., Version ac1e9d41): 11/14.** „wer ist samuel" belegt beantwortet.
   Schwäche: Zitat-Disziplin — richtige Antworten ohne `[[id]]` (→ keine Quellen-Chips), vor allem
   über den OpenRouter-Fallback; dort auch Füllsätze („I hear you") und Sprachwechsel DE→EN.
9. **`build.sh` kopiert `deploy/agentfaehig-site/src/` nach `public/`** — Worker-Quelltext,
   `chunks.json`, `site-config.json` sind dadurch öffentlich abrufbar (keine Secrets, aber nicht
   gewollt). Beim nächsten Umbau den zweiten rsync auf das Nötige begrenzen.
10. **Chunks v1 sind zu kurz und zu unpersönlich** (Screening): 120-Wort-Grenze, README-Anfänge,
   keine Notion/Plaud-Stimme, Repos ohne README erzeugen leere Chunks.

## 4. Das nächste RAG (größer, krasser) — Startpunkte

| Thema | V1 | Nächster Schritt | Vorher messen |
|---|---|---|---|
| Quellen | GitHub, Websites, Legacy | **Notion + Plaud** (Samuels Stimme, Summaries), Kontext-Wiki | Veröffentlichungsfreigabe pro Chunk |
| Chunk-Länge | ≤ 120 Wörter, 1 je Quelle | mehrere Chunks je großer Quelle, 200–400 Wörter, Abschnitte | Ranking-Quote vs. Länge |
| Beantwortbarkeit | Cosinus-Schwelle | **Reranker** (Workers AI, z. B. `bge-reranker-base` — Katalog prüfen) | Golden: falsche GIVEN |
| Mehrschritt-Fragen | nicht abgedeckt | Tool-Calling als Ausbaustufe | Golden-Klasse multi-hop |
| Skalierung | in-memory, 125 Chunks | ab ~200–500 Chunks Vectorize/AI Search prüfen | Bundle-Größe, Latenz |
| Pathways | nicht verbunden | Pathways mit `expect.endpoint` + Wissens-Fragen (§5) | τ-bench-Methodik |
| Endpunkte | Kontakt-Karte (wartet auf Freigabe) | `endpoints.json`-Resolver | `GESPRAECHS-ENDPUNKTE.md` |

## 5. Wie Wissen, Pathways und Endpunkte zusammenhängen

| Ebene | Frage | Wo | Laufzeit heute |
|---|---|---|---|
| **Pathways** (13) | *Wie* redet der Besucher, welche Haltung braucht der Agent? | `src/dev/conversation-pathways.json` (Persona, Turns, 12 Parameter) | **nur Dev-Replay und Tests**; die Parameter wirken live über den Adaptionsblock (Ton), nicht über Inhalt |
| **Wissen** (Chunks) | *Worüber* wird geredet? | `src/agent/knowledge/` → `chunks.json` | **live**: jede Nachricht wird gesucht |
| **Endpunkte** (6 geplant) | *Wohin* führt das Gespräch? | `docs/missions/…GESPRAECHS-ENDPUNKTE.md` | **nicht gebaut**; einzig die Kontakt-Karte (`business` + freigegebener Kontakt) und künftig Quellen-Chips mit Link (≈ `forward-resource`) |

Beispiel „Persona fragt nach HAI und MCP": Die Suche findet `gh-hai-mcp`,
`web-…-hai-mcp`, `kj-projects-public-hai`; der Agent antwortet mit Zitaten. Ausgang heute:
keiner — das Gespräch endet offen. Mit Phase D: Quellen-Chips verlinken Repo und Seite
(de facto `forward-resource`). Kontakt-Karte nur bei Business-Wörtern und freigegebenem Kontakt.
Kein Pathway prüft das bisher; `specialist-peer` kommt am nächsten.
