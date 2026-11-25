# ADR-0007 — Wissen per Pre-Retrieval: freigegebene Chunks statt Fakten im Prompt

- **Status:** angenommen (Owner-Entscheidungen im Grilling, 25.11.2026);
  unabhängiger Validierungsreport für die neue Linie steht aus (siehe unten)
- **Datum:** 25.11.2026
- **Bezieht sich auf:** [`ENTSCHEIDUNGEN-RAG-2026-11-25.md`](../ENTSCHEIDUNGEN-RAG-2026-11-25.md)
  (Q1–Q20 im Detail), [`UPSTREAM_SEARCH-rag.md`](../../UPSTREAM_SEARCH-rag.md),
  [`ADR-0002`](ADR-0002-agent-als-interface.md) (der Agent ist die Schnittstelle — hier
  bekommt er seinen Inhalt), [`ADR-0003`](ADR-0003-wiederverwendung-vor-eigenbau.md)
  (minisearch, bge-m3), [`ADR-0005`](ADR-0005-fremder-testet.md) (Abnahme nach V1),
  [`PROMPT-ENTWURF-orchestrator.md`](../PROMPT-ENTWURF-orchestrator.md) (wird überholt),
  HAI-Mission `M-20261125T212109-5dd54792`

## Kontext

Live auf agentfähig.de: Frage „wer ist samuel" → „Ehrlich, ich weiß nur den Namen …
Samuel kann dir das selbst beantworten." Ursachen (Recherche 25.11.):

1. **Glue-Bug:** der Browser-Prompt las Schlüssel, die `knowledge.json` nicht hatte —
   die Faktenliste war leer.
2. **Datenlücke:** über Samuel stand ein einziger Satz im Wissen.
3. **Ton:** ein Persona-Beispiel („That part is Samuel's to answer") wurde übertragen.
4. **Kein Test** für Antwort- oder Suchqualität.

Der Orchestrator-Entwurf (Klassifikator → Orchestrator → Worker je Waypoint) hätte
denselben Fehler reproduziert: Orientierungsfragen laufen dort ohne Worker aus ABOUT,
und dort steht nichts über Samuel. Der Besucher sprach faktisch mit „blankem MiniMax".

## Entscheidung

**Der Worker sucht bei jeder Nachricht selbst in freigegebenen Wissens-Chunks und gibt
die Treffer in einen serverseitig gebauten Prompt — ein LLM-Aufruf, kein Tool-Calling.**

> „Für ‚Wer ist Samuel?' braucht es keinen Agenten, der erst entscheidet, ob er suchen
> soll. Es braucht eine gute Suche." — Samuel, 25.11.2026

1. **Inhaltsebene vs. Endpunkte:** Chunks sind *worüber* geredet wird (Samuel, Arbeiten,
   Repos, Websites); Endpunkte (`GESPRAECHS-ENDPUNKTE`) sind *wohin* es führt. Die
   Kontakt-Karte ist der Übergang zum Menschen.
2. **Chunks = einzige Wahrheit:** eine Markdown-Datei pro Chunk (`src/agent/knowledge/`),
   erzeugt aus GitHub, Websites, Notion/Plaud (Samuels eigene Repräsentation) mit einem
   günstigen Modell; `knowledge.json` abgelöst, Schalter in `site-config.json`.
3. **Human Control:** Samuel screent jeden Chunk; die Freigabe ist an den Inhalts-Hash
   gebunden (`approved_hash`). Jede Änderung braucht eine neue Freigabe; der Build nimmt nur
   passende Chunks. Bei Plaud/Notion ist Samuels Freigabe die Veröffentlichungsfreigabe.
4. **Suche (deterministisch):** BM25 (minisearch) + Embeddings (`@cf/baai/bge-m3`),
   RRF-Fusion, Alias-Garantie, Multi-Query, Gesprächsanker. `coverage` (GIVEN/NOT_COVERED)
   setzt der Server, empirisch kalibriert — nicht das Modell.
5. **Nachvollziehbarkeit:** das Modell markiert `[[id]]`; der Server akzeptiert nur IDs, die
   in dieser Anfrage abgerufen wurden, und zeigt sie als Quellen-Chips mit Link.
6. **Offline-Gate:** Golden-Set (bekannt, unbekannt, mehrdeutig, Rückfragen, adversarial)
   prüft genau die Produktions-Suche ohne LLM und blockiert `deploy.sh`.
7. **Ausbaustufen nur bei gemessenem Bedarf:** Tool-Calling (z. B. Multi-Hop), eine
   Worker-Schicht, Vektor-DB, Tiering.

## Konsequenzen

**Positiv**

- „Wer ist Samuel?" ist eine Garantie (Alias-Treffer), keine Wahrscheinlichkeit.
- Ein LLM-Aufruf: passt ins 10-s-Client-Budget und in die Voice-Latenzziele.
- Das System ist selbst ein HAI-Beispiel: Rohwissen → kuratierte Repräsentation →
  Freigabe (Human Control) → Kontextselektion → sprachliche Vermittlung → Quellen →
  Übergang zum Menschen.
- Fehler sind adressierbar: Suche (Log/Golden) vs. Formulierung (Antwort-Eval).

**Negativ**

- Embeddings brauchen zur Build-Zeit ein Cloudflare-API-Token (Owner, eigenes Terminal).
- Chunk-Qualität ist v1 zu kurz und zu unpersönlich (Screening 25.11.) — bewusst vertagt.
- Kein Nachsuchen durch das Modell: Multi-Hop-Fragen können verfehlt werden, bis
  Tool-Calling als Ausbaustufe gemessen nötig ist.

**Neutral**

- Der Orchestrator-Entwurf bleibt als Dokument und Fixture-Test erhalten, ist aber
  nicht der Produktionspfad.

## Offen

- **Gate-Nachholung:** `EXECUTION_PLAN` §2 verlangt Plan-Council + unabhängiges
  `PLAN_VALIDATION_REPORT.md` mit ACCEPT vor einer neuen Build-Lane. Für diese Linie
  wurde das nicht vorab gemacht; der Report wird vor dem Produktions-Deploy nachgeholt.
- Antwort-Ground-Truth (`evals/answers.mjs`: Pflichtbegriffe, verbotene Phrasen).
- Kontaktweg (Buchungslink, Site-E-Mail) und Formular (geparkt).
- Chunk-Qualität v2: längere Chunks, Notion/Plaud als Quellen für Samuels Stimme.
