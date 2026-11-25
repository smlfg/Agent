# Entscheidungen — Agentic RAG für den Site-Agent (Grilling 25.11.2026)

Status: vom Owner entschieden (Grilling-Session 25.11.2026). Baut auf
[`PROMPT-ENTWURF-orchestrator.md`](PROMPT-ENTWURF-orchestrator.md) auf und
ersetzt dort, wo es widerspricht.

## Auslöser

Live-Frage „wer ist samuel" → „Ehrlich, ich weiß nur den Namen. Mehr steckt hier
nicht drin. Samuel kann dir das selbst beantworten, nicht ich."

Ursache (Recherche 25.11.):
1. **Glue-Bug:** `collectFacts` in `public/agent/prompt.js` (Stand 19.11.) las
   `knowledge.facts|entries|items` — Schlüssel, die `knowledge.json` nicht hat →
   leere Faktenliste, Prompt sagt nur „This conversation is the only source".
2. **Datenlücke:** Über Samuel existiert ein einziger Satz (`knowledge.json` owner-Block).
3. **Ton:** Beispiel „That part is Samuel's to answer" (`persona.json:211`) wurde
   vom Modell auf die Frage übertragen.
4. Kein Test für Antwort-/Retrieval-Qualität, nur Schema-Tests.

## Entscheidungen

| # | Frage | Entscheidung |
|---|---|---|
| Q1 | Soll-Antwort „wer ist samuel" | Chunk `about-samuel` im Format der Wissens-Chunks; Entwurf schreibt Haiku aus Kontext-Wiki, Samuel gibt frei |
| Q2 | Freigabe | Gesamt 20–50 Chunks, Samuel gibt jeden frei. Start mit 5–9 Website-Chunks |
| Q3 | RAG oder alles in den Prompt | Echtes RAG / Tool-Calling |
| Q4 | Wann läuft das Tool | Bei **jeder Faktenfrage**. Aus ABOUT nur Small Talk und „was ist diese Seite" (nicht nur bei `wants_depth`) |
| Q5 | Suchraum | Über **alle** freigegebenen Chunks; Waypoint ist nur Ranking-Bonus, kein Filter |
| Q6 | Tool-Schnitt | Hybrid: `search_knowledge(query, waypoint_hint) → {chunks[], coverage}`; `coverage: GIVEN\|NOT_COVERED` setzt der **Server** deterministisch per Score-Schwelle |
| Q7 | LLM-Schichten | **Eine** Schicht (Agent + Tool). Ausbaustufe: Agent + Worker, erst wenn Logs Ausschmücken trotz `NOT_COVERED` zeigen |
| Q8 | Suchverfahren | Hybrid BM25 (inkl. `aliases`) + mehrsprachige Embeddings, Reciprocal Rank Fusion; Embeddings beim Build vorberechnet, Suche in-memory, keine Vektor-DB |
| Q9 | Eval-Gate | Erst offline testen, dann deployen. Golden Questions; Retrieval-Teil blockiert den Deploy, LLM-Teil nightly/auf Knopfdruck |
| Q10 | Schreiber | Geminis Stand wird Baseline (dieser Commit); danach genau ein Schreiber für den Umbau |
| Q11 | `NOT_COVERED`-Verhalten | Fester Fallback-Satz vom Server; bei Business-Fragen (Preis, Termin, Zusammenarbeit) blendet die Seite die Karte „Kontakt / Buchen" ein — der Text erwähnt sie nicht. Beispiel in `persona.json:211` wird entfernt |
| Q12 | Kontaktweg | Buchungslink + E-Mail (eigene Site-Adresse) + Formular |
| Q13 | Formular-Zustellung | **Geparkt / out of scope** |
| Q14 | `knowledge.json` | **Abgelöst.** Ein Chunk pro Datei in `src/agent/knowledge/*.md`, Build → `chunks.json` + Embeddings. Schalter (`approved`, Preis-Haltung, Kontakt) → `site-config.json` |
| Q15 | Zitate | Quellen-Chips unter der Antwort; optionales Frontmatter-Feld `link:` (Website/Repo), Chip verlinkt wörtlich. Voice liest Chips nicht vor |

### Nachträge (25.11., nach dem Grilling)

| # | Frage | Entscheidung |
|---|---|---|
| Q16 | Definition of Done | übernommen (siehe unten) |
| Q17 | Plaud / Notion | Samuels eigene Repräsentation → Hauptquelle für alles über ihn; nur Plaud-Summaries, nie Transkripte. Inhalte über andere Personen/Projekte entscheidet Samuels **Veröffentlichungsfreigabe**, ein Namensfilter ist nur Hinweis |
| Q18 | Freigabe | Samuel skimmt alle Chunks; Freigabe ist an den Inhalts-Hash gebunden (`approved_hash`) |
| Q19 | Repos | **alle** öffentlichen Nicht-Fork-Repos (Luck Surface Area), aktuell 91 |
| Q20 | Gewichtung | kein Tiering |
| **Q3/Q6 revidiert** | Tool-Calling | **Kein Tool-Calling in V1.** „Für ‚Wer ist Samuel?' braucht es keinen Agenten, der erst entscheidet, ob er suchen soll. Es braucht eine gute Suche." → Server sucht immer vor dem einen LLM-Aufruf (Pre-Retrieval), mit Alias-Garantie, Multi-Query und Gesprächsanker. Tool-Calling nur als gemessene Ausbaustufe |
| Plan-Review | Härtung | Coverage empirisch kalibriert; Server-Budget ≤ 9 s passend zum 10-s-Client-Timeout; Zitate serverseitig gegen abgerufene IDs geprüft; Persona-Parameter nur per Whitelist; Golden-Set mit unbekannten, mehrdeutigen, Rückfrage- und adversarialen Fragen |
| Umsetzung | Schreiber | Codex schreibt den Code; Chunk-Verdichtung mit `gpt-5.6-luna`; HAI-Mission `M-20261125T212109-5dd54792` |

## Chunk-Format

```yaml
---
id: about-samuel
title: Über Samuel
waypoints: ["*"]          # Ranking-Bonus, kein Filter
topics: [person, owner, about]
aliases: [Samuel, wer hat das gebaut, Autor, Owner]
link: null                # optional, wörtlich übernommene URL
source: kontext-wiki/01_SAMUEL_CORE
source_kind: manual       # github | web | notion | plaud | manual
source_hash: sha256:…
updated_at: 2026-11-25
visibility: public
approved_hash: sha256:…   # Hash des Chunks bei Freigabe; Build nimmt nur passende
---
```

## Definition of Done (V1)

1. 5–9 Website-Chunks + `about-samuel` freigegeben, `knowledge.json` abgelöst.
2. `search_knowledge` hybrid (BM25 + Embeddings), `coverage` serverseitig.
3. Ein Agent, eine Schicht; jede Faktenfrage übers Tool; Quellen-Chips mit Link.
4. `NOT_COVERED` → fester Fallback-Satz; Business-Fragen → Kontakt-Karte (Buchungslink + E-Mail).
5. Offline-Gate: 15–30 Golden Questions, Retrieval-Teil blockiert Deploy;
   „wer ist samuel" → `about-samuel`, `GIVEN`.
6. Live-Abnahme durch Samuel: „wer ist samuel", „was kostet das".

**Nicht in V1:** Formular, Worker-Schicht, Vektor-DB, Klassifikator-Feintuning.

## Offen

- **Chunk-Qualität — später nochmal ran (Samuel, Screening 25.11.):** Chunks sind zu kurz,
  5 waren leer, inhaltlich eher zu schwach und unpersönlich — das Risiko ist *zu wenig*
  Persönliches, nicht zu viel. Jetzt bewusst kein Overengineering; V1 geht mit 125
  freigegebenen Chunks weiter. Ansatzpunkte für später: längere Chunks (statt ≤120 Wörter),
  Notion/Plaud als Quellen für Samuels eigene Stimme, README-Kürzung prüfen, leere Repos
  ohne README gar nicht erst verdichten.

- Fundort der vorbereiteten 5–9 Website-Chunks (im Repo nicht gefunden).
- `about-samuel`-Entwurf: Satz über Privates und lokale Pfade in `source` entfernen, dann Freigabe.
- `contact.method` + Site-E-Mail-Adresse festlegen und `approved: true` setzen.
