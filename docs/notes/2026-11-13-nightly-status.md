# Nächtlicher Zwischenstand — 13.11.2026

Rohquelle: [`sketches/raw/2026-11-13-nightly-status.txt`](../../sketches/raw/2026-11-13-nightly-status.txt)

---

- Lange konzentriert gearbeitet (~2 h). Struktur und Arbeitsteilung fühlen sich richtig an.
- Token-Budget / Kontext ist knapp geworden (Astra + Fable out of tokens). Weiter mit OpenCode Go Gemini Argon.
- Heute nicht mehr bauen. Aufheben für neuen Tag mit frischem Kopf — jetzt 00 Uhr.
- Morgen eigentlich Brügge geplant; schauen, wie und ob das orchestriert umgesetzt werden kann.

## Projekt-Entscheidungen / Gedanken

- Kein Prototyp, keine mehreren Versionen. Eine Version, mit echtem Ownership.
- Pathways brauchen noch mehr Arbeit — besonders der Gesprächsfluss, nicht die Technik.
- Konkrete User Story: User fragt „Was bist du?" → Agent antwortet kurz, menschlich; Mensch bleibt bestimmen, wohin die Reise geht.
- Mehrere Kommunikationspathways nötig (ähnlich Variation Workflow).
- Determined End Waypoints: Conversions, Leads, Formulare (Buchen, Informieren, Reinlesen, Installieren).
- Ziel: reaktive Website, auf die Cloudflare stolz wäre (guter Agent-SDK-Showcase).
- Genug Skills und Session History als Orientierung.
- Architektur: Front Worker für Mensch-Agent-Kommunikation, dahinter On-Demand Agents.
- DPPM-artiges Pattern (Dispatch, Plan, Parallelize, Merge) wie bei SelfAI; dynamischer Flow State.
- Caching: wenn Antwort schon da, zuerst ausgeben, dann Synthese nachliefern.
- HAI Voice Skills aus eigenem Repo können wiederverwendet werden; Voice ist Kernfeature, ggf. eigenes Modul.
- Slider-Idee: schneller ↔ mehr Input/Output (Parameter von H.A.I.S).
