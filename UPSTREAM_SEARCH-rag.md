# UPSTREAM_SEARCH – RAG-Suche im Worker (Mission M-20261125T212109-5dd54792)

Stand: 2026-11-25. Recherche: Recherche-Agent (npm-Registry, GitHub-API, Bundlephobia,
developers.cloudflare.com). Entscheidung: Orchestrator, gegen Plan V1 und
`docs/ENTSCHEIDUNGEN-RAG-2026-11-25.md`.

## 1. BM25-/Volltext-Bibliothek (Worker, ES modules, ohne Node-APIs)

| Kandidat | Lizenz | min / gz | Ranking | Feld-Boost | Fuzzy/Prefix | DE-Stemming | Letztes Release |
|---|---|---|---|---|---|---|---|
| minisearch 7.2.0 | MIT | 17,7 / 5,7 kB | BM25+ | ja | beides | nein (`processTerm` frei) | 2025-09 |
| flexsearch 0.8.212 | Apache-2.0 | 49,8 / 16,8 kB | eigenes Kontext-Scoring | ja | phonetisch/partial | `flexsearch/lang/de` | 2025-09 |
| @orama/orama 3.1.18 | Apache-2.0 | 77,0 / 24,4 kB | BM25 | ja | Levenshtein, Prefix | `@orama/stemmers`, eine Sprache je Instanz | 2025-12 |
| wink-bm25-text-search 3.1.2 | MIT | 9,8 / 3,3 kB | BM25 | ja | nein | nicht belegt | 2022-11 |
| lunr 2.3.9 | MIT | 28,9 / 8,4 kB | BM25 | ja | Edit-Distanz | `lunr-languages` (Lizenz unbelegt) | 2020-08 |

Quellen: github.com/lucaong/minisearch · github.com/nextapps-de/flexsearch ·
github.com/oramasearch/orama · github.com/winkjs/wink-bm25-text-search ·
github.com/olivernn/lunr.js · bundlephobia.com

**Entscheidung: REUSE `minisearch`.** Kleinste aktiv gepflegte Lib mit echtem BM25,
Feld-Boosts (title/aliases > topics > text), Fuzzy und Prefix. Korpus ist DE+EN gemischt:
Orama bindet Stemming an eine Sprache, flexsearch nutzt kein BM25, wink/lunr sind
unbelebt. Flexion fangen `fuzzy: 0.2` + `prefix` und die Embeddings ab;
`processTerm` macht nur Normalisierung (Kleinschreibung, Umlaute/ß falten) — Konfiguration.
Vorbehalt: workerd-Lauftest steht aus (Phase-C-Test).

## 2. Embedding-Modell (Workers AI)

| Modell | Dim. | Max. Tokens | DE | $/M Tokens | Status |
|---|---|---|---|---|---|
| `@cf/baai/bge-m3` | 1024 (HF-Karte) | 8.192 (HF) / 60.000 (CF-Seite) | ausdrücklich multilingual | 0,012 | aktiv |
| `@cf/qwen/qwen3-embedding-0.6b` | k. A. | 8.192 | k. A. | 0,012 | aktiv |
| `@cf/google/embeddinggemma-2` | 768 (Matryoshka) | 8.192 | k. A. | 0,0017 | aktiv |
| `@cf/google/embeddinggemma-300m` | k. A. | k. A. | 100+ Sprachen | – | deprecated seit 2026-11-20 |
| `@cf/baai/bge-base-en-v1.5` | 768 | 512 | nur EN | 0,067 | aktiv |

Quellen: developers.cloudflare.com/workers-ai/models/?tasks=Text+Embeddings ·
…/models/bge-m3/ · …/platform/pricing/

**Entscheidung: REUSE `@cf/baai/bge-m3`.** Einziges Modell, das CF ausdrücklich als
mehrsprachig und aktiv führt. Kosten bei ~125 Chunks + Fragen vernachlässigbar.
Build: `POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`
mit `{"text":[…]}`; Laufzeit `env.AI.run("@cf/baai/bge-m3",{text:[frage]})`.
Dimension wird beim Build aus der Antwort gelesen und mit der Laufzeit geprüft.
`embeddinggemma-2` ist Ausweichkandidat, falls die Golden-Fragen bge-m3 auf Deutsch schwach zeigen.

## 3. Hybrid-Fusion / fertige Lösungen

- **Orama hybrid:** gewichtete Min-Max-Summe statt RRF (`search-hybrid.ts`), offline möglich.
- **Cloudflare AI Search:** verwalteter Hybrid-Index; kein dokumentierter Offline-Test,
  Index und Ranking außerhalb des Repos.
- **RRF:** keine eigene Bibliothek gefunden; die Formel `Σ 1/(k + rank)` ist Glue.

**Entscheidung: INTEGRATE** minisearch + bge-m3 mit RRF als Glue (wenige Zeilen).
AI Search abgelehnt: Das Offline-Gate (Q9) muss genau die Produktions-Suche
deterministisch prüfen. Orama hybrid abgelehnt: Min-Max-Gewichte schwanken mit der
Trefferliste, RRF ist rangbasiert und damit stabiler für die Coverage-Kalibrierung.
Index (~125 Chunks) + Vektoren (~0,5 MB Float32) liegen als statisches JSON im Worker-Bundle.

## 4. HTML→Text in der Chunk-Pipeline (Phase A)

Kandidaten: `@mozilla/readability` + `linkedom`, `html-to-text`, `turndown`.
**Entscheidung: vorerst Glue mit Node-Built-ins** (Tags/Script/Nav strippen), weil die
Quellen Samuels eigene, schlichte Seiten sind und Phase A ohne neue Dependencies laufen
soll. Wiedervorlage: wenn eine Seite unbrauchbaren Text liefert → `@mozilla/readability`.
