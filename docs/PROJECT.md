# Projektstand — Agentfähig

Stand: 13.11.2026. Phase: Idee und Design strukturieren (Grilling & Spezifikation).

## Kanonische Ablage der Spezifikationen

Damit Ziele, Entscheidungen und Belege nicht auseinanderlaufen, gilt im Repo:

| Datei | Kanonische Rolle |
| --- | --- |
| `docs/PROJECT.md` (diese Datei) | **Smarte Projektziele (v1-Scope)**, aktueller Stand und verbleibende Entscheidungen vor dem Build |
| [`docs/DESIGN-DECISIONS.md`](DESIGN-DECISIONS.md) | **Bestätigte Designentscheidungen** aus dem Grilling mit Samuel |
| [`research/SCOUT-SYNTHESIS.md`](../research/SCOUT-SYNTHESIS.md) | **Prior Art & verifizierte Fakten** (interne Vorarbeiten + OpenCode-Scouts) |
| [`tech/CLOUDFLARE_MACHBARKEIT.md`](../tech/CLOUDFLARE_MACHBARKEIT.md) & [`tech/ABGLEICH.md`](../tech/ABGLEICH.md) | **Technische Machbarkeit** auf Cloudflare und Abgleich gegen das Design |
| [`docs/notes/2026-11-13-nightly-status.md`](notes/2026-11-13-nightly-status.md) | **Nächtlicher Plaud-Zwischenstand (13.11.2026)** mit Fokus auf Pathways, DPPM, Voice-Modul und HAI-Slidern |
| [`sketches/2026-11-12-agentfaehig.md`](../sketches/2026-11-12-agentfaehig.md) | **Unveränderte Primärquelle** der gezeichneten Skizze |
| [`docs/missions/INTEGRATION-FIRST-WHAT-THIS-IS.md`](missions/INTEGRATION-FIRST-WHAT-THIS-IS.md) | **HAI-Missionsvorschlag** zur Integration des ersten Besucherablaufs; DRAFT, keine Build-Freigabe |
| [`docs/missions/SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md`](missions/SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md) | **Abhängige Secondary-Mission (COLD)**: Evidenz-basiertes Optimierungs-Flywheel erst nach erfolgreicher Integration und separatem Owner-GO |

## Smarte Projektziele für den ersten Build (v1 — EINE Version mit Ownership)

> **Wichtige Leitplanke (aus Plaud 13.11.2026):** Heute Nacht wird **nicht** mehr gebaut.
> Es gibt **keine mehreren Wegwerf-Prototypen**, sondern **eine** saubere Version mit
> echtem Ownership, die als starker Cloudflare-Agents-SDK-Showcase überzeugt.

1. **Kommunikations-Pathways mit klaren Determined End Waypoints:**
   - Einstiegs-User-Story: Besucher fragt z. B. *„Was bist du?“* → Der **Front-Worker**
     antwortet kurz, lebendig und nicht-bevormundend (*„Hey, ich bin ein Agent — dynamisch,
     adaptiv. Was möchtest du wissen?“*), ohne sofort einen Monolog abzuladen.
   - Der Mensch bestimmt die Richtung über die Pathways (`What this is`, `creator`,
     `product for X`) bis zu klaren **Determined End Waypoints** (Buchen, Informieren,
     Reinlesen, Installieren).
2. **Front-Worker + On-Demand Agents nach DPPM mit Caching-First:**
   - Der **Front-Worker** hält das unmittelbare Gespräch; dahinter liegen **On-Demand Agents**,
     die nur bei Bedarf aktiviert werden.
   - Nach dem **DPPM-Muster** (*Plan, Dispatch, Parallelize, Merge* aus `HAI-DPPM` / `SelfAI`)
     wird eine bereits vorhandene/gecachte Antwort **sofort zuerst ausgegeben**, und die
     tiefere **Synthese** fließt danach dynamisch nach.
3. **Starke, polierte reaktive Augen (kein wörtliches Abmalen der Handskizze):**
   - Die Handskizze gibt nur die Idee vor; die Umsetzung nutzt **hochwertige, stark
     aussehende reaktive Augen** mit maximaler Außenwirkung (State-Machine & Timings aus
     `CX-ArtLab/BoopFace`), die sofort zeigen, worauf der Agent achtet.
4. **Voice als eigenes Kern-Modul + Reaktivität (Text vor TTS):**
   - Text-Deltas (`transcript_start` / `transcript_delta`) starten den pulsierenden
     Typewriter sofort ab dem ersten Token; Voice folgt asynchron satzweise.
   - Das Voice-System wird als **eigenes Modul** gekapselt (unter Wiederverwendung von
     `smlfg/hai-voice-builder`: deutsche Text-Guards + 140-Zeichen-Satz-Chunking sowie
     der Durable-Object-/TTS-Erfahrung aus `smlfg/MonesterAG-ent-`).
5. **Die max. 3 Slider koppeln live CSS Visual Style × HAI Interaction Experience:**
   - Jeder Regler steuert gleichzeitig die **visuelle CSS-Oberfläche** (Custom Properties +
     Variable Fonts) und die **Interaktions-Parameter des H.A.I.** (vgl. `BIO-HAI` Cognitive-Load-Slider):
     1. **`warm ↔ cold` (Atmosphäre & Nähe):**
        - *CSS Visual Style:* Warmer Papier-/Holzton & Serif-Wärme ↔ kühles, klares Tech-Blau.
        - *HAI Interaction:* Nahbarer, persönlicher Gesprächston ↔ nüchtern-präziser Fakten-Ton.
     2. **`soft ↔ sharp` / `knapp ↔ ausführlich` (Form & Cognitive Load):**
        - *CSS Visual Style:* Weiche Radien, sanfte Striche, luftiger Raum ↔ scharfe Kanten, kompakte Dichte.
        - *HAI Interaction:* Sanft-ausführliche Erklärung ↔ radikal knapp und direkt auf den Punkt.
     3. **`still ↔ alive` / `schnell ↔ tief` (Bewegung & Initiative/Tiefe):**
        - *CSS Visual Style:* Ruhiges Feld, langsame Atmung ↔ lebendiger Puls, dynamischer Typewriter.
        - *HAI Interaction:* Ruhige Sofort-Antwort ohne Nachfragen ↔ aktive DPPM-Synthese + 2 weiterführende Fäden.

## Anti-Scope-Creep: 3 vertikale Build-Slices (HAI-Projektmanagement)

Um Scope Creep („1 Task → 5 Schichten“) auszuschließen, wird die EINE Ownership-Version
in **drei strikt getrennten vertikalen Slices** gebaut — jeder Slice hat ein eigenes
`Not included`-Gate und muss Ende-zu-Ende laufen, bevor der nächste startet:

| Slice | Was gebaut & verifiziert wird | Explizit `Not included` (Scope-Parkplatz) |
| --- | --- | --- |
| **Slice 1 — Core Vertical Slice (`What this is`)** | Polierte reaktive Augen (`BoopFace`-Mechanik) + 3 Dual-Channel-Slider (CSS Custom Properties + Prompt-Steuerung) + pulsierender Typewriter + Front-Agent (Text + Voice-Modul) + **1 Pathway (`What this is`)** mit „Bridge + max. 2 Fäden“ und **3 statischen JSON-Waypoints** (`What is HAI`, `hai-mcp`, `Website-Agent als Produkt`). | Keine mehrstufige DPPM-Hintergrund-Kaskade, noch nicht alle 8 Domains im Katalog, kein Bild-Upload. |
| **Slice 2 — On-Demand DPPM & voller Portfolio-Katalog** | Caching-First + asynchrone On-Demand-Agents (DPPM-Synthese nachliefern) + Freischaltung der Pathways `creator` und `product for X` inkl. komplettem Waypoint-Katalog (alle 8 Domains, beste GitHub-Repos, Kontaktdaten, Buchungs-/Anfrage-Waypoint). | Keine neuen UI-Bedienelemente außerhalb der 3 Slider + 1 Waypoint-Card. |
| **Slice 3 — Polish, Latenz-Messung & Live-Deploy** | E2E-Latenz- & Deutsch-Verifikation (`first_token_ms`, `first_audio_ms`), Graceful-Degradation-Tests und kontrollierter Deploy auf `agentfähig.de` nach Samuels Freigabe. | Kein Umbau der Kernarchitektur. |

## Stand der 5 Kernfragen vor dem ersten Build

1. **Erster Besucherablauf:** *Entschieden* — Pathway `What this is` Ende-zu-Ende mit
   „Bridge + max. 2 Fäden“ und genau 1 eingeblendeten Waypoint-Card zur Zeit.
2. **Eingabemodalität & Reaktivität:** *Entschieden* — Mensch initiiert sofort (Zero-Popup);
   Text streamt sofort reaktiv vor TTS; Fingerfolgen ist Handy-Standard.
3. **Regler & sichtbare Effekte:** *Entschieden* — 3 Dual-Channel-Slider (`warm ↔ cold`,
   `soft ↔ sharp`, `still ↔ alive`), die live CSS Visual Style + HAI-Interaktionsparameter koppeln.
4. **Backend-Aufruf:** *Entschieden für Slice 1* — Echter Live-Call über Cloudflare
   (`Front-Agent` + deutsches STT via `WorkersAINova3STT({ language: "de" })`).
   *(Letzte offene Frage Q7 unten: konkretes Modell & Abnahmekriterien.)*
5. **Prüfung von Reaktionszeit, Nutzerkontrolle und Fehlerverhalten:** *Offen (Q7)* —
   konkrete Modellwahl + messbare Abnahmekriterien vor dem Start von Slice 1 bestätigen.

## Aktuell vorhanden

- Ursprüngliche Idee (`Idea`), Skizze (`sketches/2026-11-12-agentfaehig.md`) und Inspiration (`Agentfähig/GreateWriting.txt`).
- Laufendes Grilling-Protokoll (`docs/DESIGN-DECISIONS.md`), Prior-Art-Synthese (`research/SCOUT-SYNTHESIS.md`) und Cloudflare-Machbarkeitsanalyse (`tech/`).
- Strukturprüfung über `bash scripts/validate.sh`.

Noch offen: restliche Grilling-Punkte (Abschluss-Ergebnis von `What this is`, Mobile/Wake-Trigger, Modellwahl, Abnahmekriterien), gemeinsame Designabnahme und Build-Freigabe.
