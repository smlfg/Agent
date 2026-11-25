# Projektstand — Agentfähig

Stand: 25.11.2026, **Reality Sync auf dem integrierten
Spatial-/Error-State-Stand**. Die Produktvision bleibt gültig; diese Datei
unterscheidet ab hier nachweisbaren Ist-Stand, Dokumentationswissen und offene
Nachweise.

## Verifizierter Produktstand (VERIFIED)

- Aktueller Integrations-HEAD während dieses Syncs: `ea3bd2e` auf
  `integration/spatial-depth-error-state`. Er verbindet die adaptive Living
  Surface, den ruhigen `error`-Zustand und die aktivierte 2.5D-Spatial-Depth-
  Erweiterung.
- Die Anwendung besteht aus Vanilla-ES-Modulen für Gesprächszustand, Typewriter,
  reaktive Augen, validierte Surface-Anpassung, kontextuelle Regler, Metriken,
  Provider-Fallbacks und räumliche Tiefe. Es gibt keine WebGL-/Three.js-Welt.
- **279/279 Node-Tests** laufen auf dem Integrations-HEAD grün; die gezielten
  Slice-A-Tests laufen mit **43/43** grün.
- Der lokale Browser-Smoke belegt den echten `error`-Zustand, Fehlermeldung und
  `aria-live`, Wiedereinstieg und Reduced Motion. Der erweiterte Spatial-Browser-
  Test läuft für Default-Desktop, Bones-Desktop, Mobile und Reduced Motion grün.
- Die öffentliche UI beantwortet einen realen Browser-Turn mit `PONG` vom Provider
  `minimax`; das `DEV-DATA`-Badge bleibt verborgen. `verify-live.sh` ist grün.
- Cloudflare ist mit Worker `agentfaehig`, Assets, Workers-AI-Binding und den
  Provider-Variablen konfiguriert. Die aktive Version zum Prüfzeitpunkt ist
  `9e0c8e7f-777f-4981-9f37-98c6f1679a52` (Version 20, 25.11.2026).
- `bash scripts/validate.sh` ist nach der inhaltserhaltenden Umbenennung des
  Talk-Transkripts nach `docs/ai-avatare.txt` grün.

Belege: [`tech/REALITY-SYNC-2026-11-25.md`](../tech/REALITY-SYNC-2026-11-25.md),
[`README.md`](../README.md), [`src/README.md`](../src/README.md) und
[`tests/README.md`](../tests/README.md).

## Dokumentierte Zielrichtung und Historie (DOCUMENTED)

- Die bestätigte Produktvision und Designentscheidungen stehen in
  [`VISION-samuel.md`](VISION-samuel.md) und
  [`DESIGN-DECISIONS.md`](DESIGN-DECISIONS.md).
- Die Abschnitte ab „Historischer Planungsstand“ beschreiben die Entscheidungs-
  und Messlage vom 19./20.11.2026. Sie bleiben als Geschichte erhalten, sind aber
  keine Aussage über den heutigen Implementierungsstand.
- Der M1-Bericht und die Messprotokolle bleiben historische Belege. Sie werden
  durch den Reality Sync weder gelöscht noch rückwirkend mit neuen Ergebnissen
  versehen.

## Offene Nachweise (UNVERIFIED / EVIDENCE DEBT)

- **Voice:** kein erneuter 20-Turn-Latenzmesslauf in diesem Sync; keine aktuelle
  Bestätigung der STT-Stabilität und kein neuer `first_audio_ms`-Wert.
- **Fremdtest:** weiterhin 0 durchgeführte Fremdtests. Die vorhandenen Pläne sind
  keine Nutzerbelege.
- **DPPM/On-Demand-Agenten, serverautoritative Zwei-Tab-Synchronisation und
  langfristige Evolution:** in diesem Sync nicht als End-to-End-Verhalten geprüft.
- **Öffentlicher Spatial-Depth-Lauf:** die öffentliche UI und echte Antwort sind
  verifiziert; die vollständige Spatial-Browser-Matrix wurde lokal, nicht erneut
  auf der Produktions-URL ausgeführt.
- Kleinbefund: lokal erscheint ein `favicon.ico`-404; kein Pageerror und kein
  nachgewiesener Zusammenhang mit Slice A oder Spatial Depth.

## Execution Rebaseline

- [`EXECUTION_PLAN-M0-M5.md`](EXECUTION_PLAN-M0-M5.md) ist der **eine vorgeschlagene
  Gesamtplan** für den aktuellen Stand. Seine Rebaseline ist eine
  **OPEN OWNER DECISION**, bis Samuel sie ratifiziert.
- [`../tech/EXECUTION_PLAN-M1-MESSLAUF.md`](../tech/EXECUTION_PLAN-M1-MESSLAUF.md)
  ist ausschließlich das historische Task-Protokoll für den Voice-Messlauf und
  kein konkurrierender Gesamtplan mehr.
- Alte Gates werden nicht rückwirkend bestanden. Unverändert gelten Owner-Gates
  für Commits, Deploys und Secrets, Upstream-First, unabhängige Plan-Annahme vor
  neuen Build-Lanes und Continuous Authorize.
- Voice-Latenz und Fremdtests sind **Evidence Debt**, aber keine pauschale
  Blockade für unabhängige UI-/Spatial-Arbeit. Sie werden erneut verbindlich,
  wenn ein aktueller Plan sie ausdrücklich verknüpft oder eine Stable-/Voice-
  Abnahme ansteht.
- Slice A besitzt `ACCEPT` in [`PLAN_VALIDATION_REPORT.md`](../PLAN_VALIDATION_REPORT.md)
  und eine zusätzliche unabhängige mcode-Validierung
  ([`PLAN-VALIDATION-REPORT-mcode-reality-sync-2026-11-25.md`](../PLAN-VALIDATION-REPORT-mcode-reality-sync-2026-11-25.md)).

**Empfohlener nächster Implementierungsschritt:** genau einen räumlichen Vertical
Slice auf dem verifizierten Integrationsstand definieren und durch Upstream- und
Plan-Gates bringen; keine Voice- oder DPPM-Arbeit in diesen Slice schmuggeln.

## Historischer Planungsstand (19./20.11.2026)

Was ich vorhabe, in meinen eigenen Worten: [`VISION-samuel.md`](VISION-samuel.md).

Ein unabhängiges Zweitgutachten (Argon/Gemini und ich) zur Frage „WOW oder zum
Scheitern verurteilt" mit drei Produktfallen und der fehlenden Teststufe:
[`GUTACHTEN-wow-oder-scheitern.md`](GUTACHTEN-wow-oder-scheitern.md).

Der Bauplan steht in [`PLAN-STUFEN-0-5.md`](PLAN-STUFEN-0-5.md): fünf Stufen von der
Planung bis zum Erstbau, mit Wenn-Dann-Diagramm, Mess-Gates und fünf ADRs in
[`adr/`](adr/). Der nächste Schritt ist der Messlauf (Stufe 1), kein
Anwendungscode.

Der Scope-Vertrag liegt als [`PROJECT_CONTRACT.md`](PROJECT_CONTRACT.md) vor, ist
aber **nicht genehmigt**: Status `VORSCHLAG`, O1–O11 unbeantwortet, Sign-off leer.
Bis zur Signatur sind D1–D5 Empfehlungen; D2–D5 sind durch `F4` gesperrt.
Ausführbar ist allein D1 (Messlauf).

Der UI-Implementierungsplan (Wireframe → Code) steht als Kapitel 10 in
[`EXECUTION_PLAN-M0-M5.md`](EXECUTION_PLAN-M0-M5.md). Er ist ein Vorschlag und derzeit
blockiert durch D4/D5/D6 sowie die offenen Designentscheidungen OD-00 bis OD-17
(davon sieben P0) und die fehlende Lane.

Der Messlauf ist angelaufen und in Laufversuch 1 **gescheitert**: Der Klon läuft,
der Free-Account trägt das Default-Modell des Beispiels nicht
(`AI_APICallError 5035`, 5 User- und 0 Assistant-Nachrichten, keine
`turn_metrics`). Die 5/0 gelten für das Fenster 17:47–17:50; später enthält
dieselbe Tabelle eine nicht zugeordnete Session mit fünf Assistant-Antworten
(Gegenprüfung in [`tech/MESSPROTOKOLL-2026-11-19.md`](../tech/MESSPROTOKOLL-2026-11-19.md),
Abschnitt „Gegenprüfung der Laufversuch-1-Zahlen"). Beleg und Konsequenz:
[`tech/MESSPROTOKOLL-2026-11-19.md`](../tech/MESSPROTOKOLL-2026-11-19.md).

**Vorprüfung 19:57** hat den Modellpfad geklärt: Mit dem in einer Zeile
getauschten Modell `@cf/zai-org/glm-4.7-flash` antwortet der Free-Plan — zwei
Text-Turns, keine Konsolenfehler (Beleg ebd., Abschnitt „Vorprüfung 19:57").
Damit ist der Modellpfad für die Messung belegt. Der Voice-Pfad ist dagegen
**instabil**: Sprach-Turns gelangen 19:44–19:47, danach scheiterte der Start der
Spracherkennung fünfmal (`Flux STT WebSocket upgrade failed`, ebd. „Messversuch
20:01–20:04"). Ein Turn hat vier Metrikwerte, aber die zwei von `AC-D1-2`
geforderten Stage-Timings fehlen. Offen sind damit zwei Entscheidungen: der
Erfassungsweg ([`UNSOLVED-TECHNIK.md`](UNSOLVED-TECHNIK.md) U1) und der Umgang mit der
STT-Instabilität (U12).

Vergleichbare Projekte wurden gesucht:
[`UPSTREAM-SEARCH-vergleichbare-projekte.md`](../UPSTREAM-SEARCH-vergleichbare-projekte.md).
Für Augen mit Präsenz gibt es einen übernehmbaren Baustein (`EyeFace.js`, MIT);
für die live erzeugte Oberfläche gibt es Muster, aber keinen belastbaren Code.
Das Kernversprechen — der Agent verhandelt seine eigene Präsenz — bleibt
Eigenbau. Die technische
Muster-Ebene (Präsenz-Zustände, Streaming-Typografie, Turn-Taking, stille
Hintergrundarbeit) steht in
[`research/EMBODIMENT-RECHERCHE.md`](../research/EMBODIMENT-RECHERCHE.md); sie
stützt ADR-0002/0004 und ändert keine Entscheidung.

<!-- Merge 19.11.: Stand 13.11. aus origin/main, von dort uebernommen:
Stand: 13.11.2026. Phase: Idee und Design strukturieren (Grilling & Spezifikation).
-->

## Kanonische Ablage der Spezifikationen

Samuels lokales Transkript in `IDEA-TRANSKRIPT.txt` beschreibt die Reihenfolge Planen, Malen,
Strukturieren und Bauen. Ziel ist ein Embodiment des Human-Agent Interface auf
Agentfähig, mit Voice, Text, Kontext und Skills. Cloudflare ist die genannte
technische Richtung; eine konkrete Implementierung ist noch nicht festgelegt.

Damit Ziele, Entscheidungen und Belege nicht auseinanderlaufen, gilt im Repo:

| Datei | Kanonische Rolle |
| --- | --- |
| `docs/PROJECT.md` (diese Datei) | **Smarte Projektziele (v1-Scope)**, aktueller Stand und verbleibende Entscheidungen vor dem Build |
| [`docs/DESIGN-DECISIONS.md`](DESIGN-DECISIONS.md) | **Bestätigte Designentscheidungen** aus dem Grilling mit Samuel |
| [`research/SCOUT-SYNTHESIS.md`](../research/SCOUT-SYNTHESIS.md) | **Prior Art & verifizierte Fakten** (interne Vorarbeiten + OpenCode-Scouts) |
| [`tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md`](../tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md) & [`tech/ABGLEICH-DESIGN-TECHNIK.md`](../tech/ABGLEICH-DESIGN-TECHNIK.md) | **Technische Machbarkeit** auf Cloudflare und Abgleich gegen das Design |
| [`docs/notes/2026-11-13-nightly-status.md`](notes/2026-11-13-nightly-status.md) | **Nächtlicher Plaud-Zwischenstand (13.11.2026)** mit Fokus auf Pathways, DPPM, Voice-Modul und HAI-Slidern |
| [`sketches/2026-11-12-agentfaehig.md`](../sketches/2026-11-12-agentfaehig.md) | **Unveränderte Primärquelle** der gezeichneten Skizze |
| [`docs/missions/INTEGRATION-FIRST-WHAT-THIS-IS.md`](missions/INTEGRATION-FIRST-WHAT-THIS-IS.md) | **HAI-Missionsvorschlag** zur Integration des ersten Besucherablaufs; DRAFT, keine Build-Freigabe |
| [`docs/missions/SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md`](missions/SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md) | **Abhängige Secondary-Mission (COLD)**: Evidenz-basiertes Optimierungs-Flywheel erst nach erfolgreicher Integration und separatem Owner-GO |

## Bestehende Produktziele für V1 (Zielrichtung, kein Ist-Nachweis)

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

## Ursprüngliche Anti-Scope-Creep-Slices (19.11., historische Planungsgrundlage)

Am 19.11.2026 mit Samuel geklärt ([Entscheidungen](DESIGN-DECISIONS.md)):

1. Erster Besucherablauf: text-erster Ablauf — Ankommen, Augen wachen nach
   etwa 5 Sekunden auf, eine Textnachricht, Typewriter-Antwort im Fokus;
   Hintergrund-Ergebnisse erscheinen still über State-Sync.
2. Eingabemodalität: Text zuerst, Mikrofon nach Klick. Voice ist damit Teil
   des Erstbaus.
3. Regler: erste Version mit einem Regler, dessen Belegung im Gespräch entsteht
   (Agent erfragt sein Aussehen); Ausbaupfad 1 → 2/3 → max 3.
4. Backend-Aufrufe: Front-Agent als schneller echter Duplex-Sprachagent;
   dahinter echte schlaue Agenten (Analysing, Looking-up).
5. Prüfung: Messlauf als Gate vor dem Erstbau — `examples/voice-agent` lokal,
   20 englische Sprach-Wechsel (Sprach-Entscheidung vom 19.11., 2. Runde;
   ursprünglich deutsch geplant), Auswertung von `first_audio_ms`; benötigt
   Plan-Modus und Owner-Freigabe.

Nächster Schritt: Der Messlauf-Plan liegt ausgearbeitet vor
([MESSLAUF-PLAN.md](../tech/MESSLAUF-PLAN.md)) — nach Samuels Sprach-Entscheidung
(Voice auf Englisch) **einstufig und ohne externe Keys**: 20 englische
Sprach-Wechsel auf dem unveränderten Beispiel, Auswertung von `first_audio_ms`
und Stage-Timings. Die deutsche Pipeline bleibt wünschbares Feature und ist
näher dran als gedacht: deutsches STT via `nova-3` ist SDK-seitig belegt
([CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md](CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md), Missions-Artefakt vom
19.11., Audit `A-20261119T161858-753a2d1e`); die Turn-Erkennung ist allerdings
strittig (U26). Nur TTS braucht einen externen Provider — Kostenrecherche läuft.
Freigabe für Klon und Lauf ist erteilt (mit Plan-Validator); der Modellpfad auf
dem Free-Plan ist in Laufversuch 2 belegt, die STT-Stufe ist instabil. Offen
sind Erfassungsweg (U1) und STT-Entscheidung (U12). Danach entscheidet die
Build-Freigabe. Noch keine abschließende gemeinsame Designabnahme: offen sind
die Fokusregel für Hintergrund-Ergebnisse, Fehler-UX und die Sprache des
Text-Kanals neben dem englischen Voice-Kanal.

**Addendum 19.11., ~20:30 (Messlauf-Slice, BLOCKED):** Der deployte Lauf
(https://voice-agent.smlflg.workers.dev, von Samuel freigegebene Abweichung)
ist am **4006-Neuronen-Limit** gescheitert: Tageskontingent durch offene
Mikro-Sessions verbraucht, Reset 00:00 UTC. Wiederholung nach Reset, Mikrofon
nur beim Sprechen. Details: [MESSPROTOKOLL-2026-11-19.md](../tech/MESSPROTOKOLL-2026-11-19.md)
und U32 in [UNSOLVED-TECHNIK.md](UNSOLVED-TECHNIK.md).

## Prüfstand 19.11.2026 (HCI-Review, keine Messung)

| Gate | Urteil | Basis |
|---|---|---|
| UX | **NOT TESTED** | Living Surface live, aber Agent-Pfad ohne Provider: `POST /api/agent` → `503 no_provider`, Antworten aus `DEV DATA`; 0 Fremdtests |
| VOICE | **NOT TESTED** | 0 von 20 Messzeilen; Voice laut `README.md` nicht freigeschaltet |
| CONTROL | **NOT TESTED** | „Pause motion" und Mikrofon-Knopf vorhanden; nicht geprüft |
| EVIDENCE | **FAIL** | keine Testbelege; „FAIL" heißt nicht belegt, nicht widerlegt |

Daraus ist keine Freigabe ableitbar. „NOT TESTED" ist kein „bestanden".

**Live-Stand ≠ messbarer Agent (Befund 19.11., 22:57 UTC).** `agentfähig.de`
liefert jetzt die Living Surface (Textfeld, Augen, Typewriter, „Pause motion",
Mikrofon-Knopf); die frühere Seite liegt unter `/classic/` (HTTP 200). Ein
Testturn antwortet sichtbar mit **DEV DATA**. Ursache ist nicht ein fehlender
Key — `MINIMAX_API_KEY` ist gesetzt — sondern der Provider: MiniMax antwortet
**429** (Rate-Limit/Guthaben), der Worker meldet daraufhin `503
{"error":"no_provider"}` und die Fallback-Kette nimmt deterministische
Antworten. `verify-live.sh` akzeptierte bisher auch diesen Fehler als „ok" und
ist jetzt auf echte Agentenantwort (`text`) verschärft. Ein 20-Sekunden-Test
würde heute die Hülle messen, nicht den Agenten. Vor jeder Sitzung prüfen:
`/api/agent` liefert 200 mit `text` und im DOM steht kein „DEV DATA" (→
[`UNSOLVED-TECHNIK.md`](UNSOLVED-TECHNIK.md) U29,
[`FREMDTEST-PLAN.md`](../tech/FREMDTEST-PLAN.md) §3).

Prüfprotokoll der ersten Runde: [`FREMDTEST-PLAN.md`](../tech/FREMDTEST-PLAN.md)
(Vorschlag, n = 5).

## Aktuell vorhanden

- Ursprüngliche Idee als Sprachtranskript in `IDEA-TRANSKRIPT.txt`.
- Versionierte Skizze mit PDF, PNG, Ausschnitten und Rohdaten.
- Low-Fidelity-Wireframe-System für V1 als **Vorschlag zur Owner-Abnahme**
  (kein Build): [`wireframes/README.md`](wireframes/README.md). Es enthält
  WF-01…WF-12, Zustandsmatrix, Komponenten und die offenen
  Designentscheidungen OD-00…OD-17.
- Interaktiver Lo-Fi-Prototyp als **visuelle und zeitliche Ergänzung** dazu
  (kein Produktivcode, keine Abhängigkeiten):
  [`wireframes/agentfaehig-wireframe.html`](wireframes/agentfaehig-wireframe.html)
  mit 20-Sekunden-Storyboard, dreizehn Zustandskompositionen, orthogonaler
  Zustandsmaschine, Motion- und Typografieregeln und Voice-Demo; **v0.2 ist an
  den Live-Stand vom 20.11. angepasst** (ein Auge rechts, Composer unten,
  warme Palette, „Pause motion"); Spezifikation und
  ehrliche Simulationsliste in
  [`wireframes/wireframe-prototype-interactive.md`](wireframes/wireframe-prototype-interactive.md).
  Die **Audio-Ausgabe des Agenten** fehlt dort noch und ist als eigener Schnitt
  geplant: [`wireframes/PLAN-AUDIO-AUSGABE.md`](wireframes/PLAN-AUDIO-AUSGABE.md)
  (opt-in, Default stumm nach DD:14; S1–S5, offene Entscheidungen A-01…A-05).
- **Visual Exploration** (13.11.2026, Scope: nur visuelles und Motion-Design,
  kein Code): die ausgearbeitete Beschreibung des Kernkonzepts — wie aus dem
  Gekritzel Augen werden, wie der Blick folgt, wie der Pathway-Fluss läuft.
  - [`visual-exploration/01-idle-presence.md`](visual-exploration/01-idle-presence.md)
    — der Ruhezustand: atmende Textur, die zu zwei weichen Augen coalesziert
  - [`visual-exploration/02-active-conversation-ui.md`](visual-exploration/02-active-conversation-ui.md)
    — die Oberfläche im Gespräch
  - [`visual-exploration/03-pathway-flow.md`](visual-exploration/03-pathway-flow.md)
    — die drei Pathways und ihre Fäden
- Projektanweisungen und Ablage für die nächsten Arbeitsschritte.

Um Scope Creep („1 Task → 5 Schichten“) auszuschließen, wird die EINE Ownership-Version
in **drei strikt getrennten vertikalen Slices** gebaut — jeder Slice hat ein eigenes
`Not included`-Gate und muss Ende-zu-Ende laufen, bevor der nächste startet:
| Slice | Was gebaut & verifiziert wird | Explizit `Not included` (Scope-Parkplatz) |
| --- | --- | --- |
| **Slice 1 — Core Vertical Slice (`What this is`)** | Polierte reaktive Augen (`BoopFace`-Mechanik) + 3 Dual-Channel-Slider (CSS Custom Properties + Prompt-Steuerung) + pulsierender Typewriter + Front-Agent (Text + Voice-Modul) + **1 Pathway (`What this is`)** mit „Bridge + max. 2 Fäden“ und **3 statischen JSON-Waypoints** (`What is HAI`, `hai-mcp`, `Website-Agent als Produkt`). | Keine mehrstufige DPPM-Hintergrund-Kaskade, noch nicht alle 8 Domains im Katalog, kein Bild-Upload. |
| **Slice 2 — On-Demand DPPM & voller Portfolio-Katalog** | Caching-First + asynchrone On-Demand-Agents (DPPM-Synthese nachliefern) + Freischaltung der Pathways `creator` und `product for X` inkl. komplettem Waypoint-Katalog (alle 8 Domains, beste GitHub-Repos, Kontaktdaten, Buchungs-/Anfrage-Waypoint). | Keine neuen UI-Bedienelemente außerhalb der 3 Slider + 1 Waypoint-Card. |
| **Slice 3 — Polish, Latenz-Messung & Live-Deploy** | E2E-Latenz- & Deutsch-Verifikation (`first_token_ms`, `first_audio_ms`), Graceful-Degradation-Tests und kontrollierter Deploy auf `agentfähig.de` nach Samuels Freigabe. | Kein Umbau der Kernarchitektur. |
## Stand der 5 Kernfragen (19.11., historische Baseline)
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
- Ursprüngliche Idee (`Idea`), Skizze (`sketches/2026-11-12-agentfaehig.md`) und Inspiration (`Agentfähig/GreateWriting.txt`).
- Laufendes Grilling-Protokoll (`docs/DESIGN-DECISIONS.md`), Prior-Art-Synthese (`research/SCOUT-SYNTHESIS.md`) und Cloudflare-Machbarkeitsanalyse (`tech/`).
- Strukturprüfung über `bash scripts/validate.sh`.
- Klar benannte Ablage (19.11. abends): Warteschlangen
  [`docs/UNSOLVED-TECHNIK.md`](UNSOLVED-TECHNIK.md) und
  [`docs/UNSOLVED-PLANUNG.md`](UNSOLVED-PLANUNG.md), Handoffs in
  [`docs/handoffs/`](handoffs/README.md), keine Root-`UNSOLVED.md` mehr.
- Namensregel prüfbar (19.11., 20:45): [`DATEINAMEN.md`](DATEINAMEN.md) hält
  N1–N4 fest, `scripts/check-names.sh` prüft sie und läuft in
  `scripts/validate.sh` mit. Letzte drei Verstöße behoben:
  `Idea` → `IDEA-TRANSKRIPT.txt`, doppelte `konkurrenz.md` /
  `cloudflare-bausteine.md` in `tech/briefs/` → `BRIEF-…`. Zusätzlich
  `PLAN-ADREN` → `PLAN-STUFEN-0-5`, `INTENT` → `INTENT-TECHNIK`,
  `MISSION_BRIEF` → `MISSION-BRIEF`.
- Mobile-Tastatur-Fix (20.11., erster Mobile-Test): Bei ausgeklappter
  Tastatur verschwanden die Augen hinter dem Keyboard. Zwei-teilige Lösung:
  `interactive-widget=resizes-content` im Viewport-Meta (Chromium-Familie)
  und [`src/surface/keyboard-viewport.js`](../src/surface/keyboard-viewport.js)
  via `visualViewport` (iOS Safari), das `--keyboard-inset` /
  `data-keyboard` auf `<html>` schreibt und die Stage komprimiert
  ([`src/styles/base.css`](../src/styles/base.css)). Verifikation vor Push:
  13 Unit-Tests ([`tests/keyboard-viewport.test.js`](../tests/keyboard-viewport.test.js))
  und der Playwright-Handylauf
  [`scripts/verify-mobile-keyboard.py`](../scripts/verify-mobile-keyboard.py)
  (12/12 Checks grün, Screenshots unter
  [`tech/mobile-keyboard-verify/`](../tech/mobile-keyboard-verify/)).
  Bekannte Restgrenze: falls iOS beim Aufklappen trotzdem wegpannt, genügt
  ein Wisch zurück — Stage und Tastaturband teilen sich dann den sichtbaren
  Bereich; auf Chromium-Mobilgeräten greift der native Meta-Tag-Pfad.

Aktuelle offene Punkte stehen oben unter „Offene Nachweise“ und in der
Reality-Sync-Triage von [`UNSOLVED-TECHNIK.md`](UNSOLVED-TECHNIK.md). Die
ursprünglich offenen Grilling-, Designabnahme- und Build-Freigaben werden nicht
rückwirkend als erledigt dargestellt; ihre erneute Gültigkeit ist Teil der
OPEN OWNER DECISION zur Execution Rebaseline.
