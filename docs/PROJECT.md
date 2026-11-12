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
5. **Die max. 3 Slider sind die direkten Parameter des H.A.I.:**
   - Die Regler steuern nicht nur Optik, sondern die **Human-Agent-Interaction-Parameter**
     selbst (vgl. `BIO-HAI` Cognitive-Load-Slider):
     1. **Tempo / Tiefe:** `schnell ↔ tief` (sofortige Kurz-Antwort vs. tiefere Synthese)
     2. **Input/Output-Dichte:** `knapp ↔ ausführlich` (wie viel Output/Rückfrage der Mensch gerade will)
     3. **Atmosphäre / Ton:** `warm ↔ cold` (Farbtemperatur & sprachliche Nähe)

## Stand der 5 Kernfragen vor dem ersten Build

1. **Erster Besucherablauf:** *Entschieden* — Pathway `What this is` Ende-zu-Ende vom
   Besucher über Front-Agent zum Schwarm-Agenten mit echter Live-Antwort. *(Noch zu
   präzisieren: konkretes Abschluss-Ergebnis/CTA am Ende dieses Pathways.)*
2. **Eingabemodalität & Reaktivität:** *Entschieden* — Mensch initiiert sofort (keine
   5-s-Sperre); Text und Voice gehören beide rein; Text streamt sofort reaktiv vor TTS.
   *(Noch zu bestätigen: Fingerfolgen als Handy-Standard + konkretes Mikrofon-Klick-UI.)*
3. **Regler & sichtbare Effekte:** *Entschieden* — Standard-3 `warm ↔ cold`,
   `soft ↔ sharp`, `still ↔ alive` (live gekoppelt an CSS Custom Properties, Variable
   Fonts und System-Prompt-Buckets).
4. **Backend-Aufruf:** *Entschieden* — Echter Live-Call über Cloudflare (`Front-Agent` →
   `What this is`-Worker/Sub-Agent; deutsches STT über `WorkersAINova3STT({ language: "de" })`).
   *(Noch zu entscheiden: konkretes Front-/Schwarm-Modell und TTS-Provider.)*
5. **Prüfung von Reaktionszeit, Nutzerkontrolle und Fehlerverhalten:** *Offen* —
   messbare Abnahmekriterien (`first_token_ms`, `first_audio_ms`, Verhalten bei
   Netz-/Modell-Pause) vor Build-Freigabe gemeinsam festlegen.

## Aktuell vorhanden

- Ursprüngliche Idee (`Idea`), Skizze (`sketches/2026-11-12-agentfaehig.md`) und Inspiration (`Agentfähig/GreateWriting.txt`).
- Laufendes Grilling-Protokoll (`docs/DESIGN-DECISIONS.md`), Prior-Art-Synthese (`research/SCOUT-SYNTHESIS.md`) und Cloudflare-Machbarkeitsanalyse (`tech/`).
- Strukturprüfung über `bash scripts/validate.sh`.

Noch offen: restliche Grilling-Punkte (Abschluss-Ergebnis von `What this is`, Mobile/Wake-Trigger, Modellwahl, Abnahmekriterien), gemeinsame Designabnahme und Build-Freigabe.
