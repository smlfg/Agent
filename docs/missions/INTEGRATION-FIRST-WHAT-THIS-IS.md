# HAI Mission Packet — Agentfähig / Integration First

**Stand:** 13.11.2026  
**Status:** DRAFT / WARM — dokumentierter Missionsvorschlag, **keine** aktive HAI-Mission und **keine** Build-Freigabe  
**Owner:** Samuel  
**Mission-ID / Lease:** Nicht vergeben. Nicht aus diesem Dokument ableiten.  
**Aktueller Kontext:** Design/Planung; noch kein echter Agent-End-to-End-Lauf.

## 0. Mission-Lock / Owner Intent

**Mission:** Die erste echte Besucherreise `„Was bist du?“` über **eine** zusammenhängende Agentfähig-Anwendung verlässlich integrieren und belegen. Jeder neue Teil muss an einen bereits funktionierenden Teil anschließen.

**Erfolg bedeutet nicht** mehr Dokumente, Modelle, Scouts oder Codezeilen. Erfolg bedeutet: ein Besucher löst eine reale Anfrage aus, ein Cloudflare-Front-Agent antwortet nachvollziehbar, und die Oberfläche reagiert korrekt auf echte Ereignisse.

**Eine Version mit Ownership.** Kleine, testbare Integrations-Inkremente *innerhalb* von Slice 1 sind erlaubt; keine weiteren Wegwerf-Varianten oder zweite App. Voice bleibt Kernbestandteil des vollständigen Slice 1, auch wenn die erste verifizierbare Verbindung zunächst textbasiert erfolgt.

**Kanonische Quellen (keine parallele Wahrheit):**
- [PROJECT.md](../PROJECT.md): Umfang, Slice-Zuordnung, aktuelle offene Entscheidungen.
- [DESIGN-DECISIONS.md](../DESIGN-DECISIONS.md): ausschließlich hier bestätigte Produkt- und Verhaltensentscheidungen.
- [AGENTS.md](../../AGENTS.md): Schreibrechte, Freigaben und Agentenverhalten.
- [SCOUT-SYNTHESIS.md](../../research/SCOUT-SYNTHESIS.md), [Cloudflare-Machbarkeit](../../tech/CLOUDFLARE_MACHBARKEIT.md), [Upstream-Suche](../../tech/UPSTREAM_SEARCH.md): Evidenz/Vorschläge, **keine** automatische Architekturfreigabe.

Bei Widerspruch: neuere bestätigte Entscheidungen anhand der Quellen prüfen, Konflikt im Projektstand vermerken, **nicht** durch zusätzliche Agenteninterpretationen „lösen“. Die historische [Lückenliste](../../tech/LUECKEN.md) ist keine laufend kanonische Checkliste.

## 1. Mission Boundary

**IN:** Ein Front-Agent, **ein** Pathway `What this is`, echte Modellantwort mit Text-Streaming, reagierende Augen, drei gekoppelte HAI-Slider, genau eine relevante Waypoint-Card zur Zeit, definierter Fehlerpfad, deutsches Voice-Modul als nachfolgendes Inkrement desselben Slice 1. Die drei statischen JSON-Waypoints und das Bridge/2-Fäden-Verhalten folgen `PROJECT.md`.

**NOT INCLUDED / PARKED:** Weitere Pathways (`creator`, `product for X`), DPPM-Schwarm, dynamischer Portfolio-Katalog, acht Domains, Bild-Upload, neue UI-Regler, neue Prototypen, Marketing/Lead-Optimierung, zusätzlicher Framework-Eigenbau und Live-Deployment. Diese Themen gehören zu späteren Slices oder brauchen eine neue Owner-Entscheidung.

**Keine stillen Nebenaufträge:** Änderungen außerhalb des genehmigten Write-Roots, globale Harness-/MCP-Konfiguration, kostenpflichtige Dienste, Datenlöschung, Deployments sowie zusätzliche Scouts benötigen explizite Freigabe gemäß `AGENTS.md`.

## 2. HAI-Gates (Planung, nicht vorgetäuschte Enforcement)

| Gate | Eintrittsbedingung | Prüfergebnis / Stop |
| --- | --- | --- |
| **G0 — Preflight** | Aktuelle Dateien + Git-Status prüfen; ältere/abweichende Aussagen abgleichen; offene Q7-Modellwahl, Kosten und messbare Kriterien markieren. | `BLOCKED` bei fehlender Entscheidung über kostenpflichtige Provider oder unklarem kritischem Vertrag. |
| **G1 — Plan-Acceptance** | Ein minimaler Event-/Datenvertrag, erlaubte Pfade, Testfälle und ein unabhängiger Plan-Review liegen vor. | Nur `ACCEPT` **und** separate Owner-Freigabe erlauben einen Build-Auftrag; `REPLAN` zurück an Planner. |
| **G2 — Upstream-First** | Vor Feature-Code die vorhandene [Upstream-Suche](../../tech/UPSTREAM_SEARCH.md) für diesen Slice auf Aktualität/Lizenz prüfen; vorhandene Komponenten bevorzugen. | Fehlt ein tragfähiger Weg: `PARKED`, kein spontaner Eigenbau. |
| **G3 — Continuous Authorize** | Jede Erweiterung des Write-Scopes, Methodenänderung, Deployment oder Kostenänderung erneut vorlegen. | `BLOCKED`/Owner-Eskalation statt stiller Ausweitung. |
| **G4 — Verifier-first / Evidence** | Erwartete Ereignisse und Testfälle **vor** dem Implementieren formulieren; anschließend unabhängig smoke-testen. | Ohne überprüfbare Laufspur kein `DONE`. |

Die Gate-Begriffe greifen die bisherige HAI-Arbeitsweise auf, sind hier jedoch **Doku-Gates**, keine Behauptung einer aktiven technischen HAI-MCP-Sperre. Verifier und Implementierer sollen verschieden sein; ein Selbstbericht des Builders ist kein unabhängiger Nachweis.

## 3. Geordnete Integration: ein Vertrag, eine lauffähige Kette

```text
Besucher: „Was bist du?“
    → Browser: absichtliche Text-Eingabe
    → Cloudflare Front-Agent: echte Anfrage, erster Text-Stream
    → Browser: Response/Typewriter + statusgetriebene Augen
    → Nutzer wählt Richtung → max. 1 passender Waypoint sichtbar
    → später im selben Slice: bewusst aktivierte Voice-Lane
```

Der technische Vertrag wird **vor Code** konkretisiert: Eingabe, Session-Identität, Slider-Zustand, Statuswechsel, Text-Deltas, Abschluss, Waypoint, Fehler und optionale Voice-Ereignisse. Keine neuen Config-Keys oder selbst erfundenen Cloudflare-Events; vorhandene SDK-Ereignisse und Formate zuerst prüfen. Im Vertrag stehen für jedes Feld: Sender, Empfänger, Typ, Besitzer des Zustands, Fehlermodus und ein Beispiel.

**Inkremente in *derselben* Anwendung (jeweils erst nach Gate-Freigabe):**

1. **C0 Vertrag und Testfälle:** vorhandenen `prototype/index.html` ausdrücklich als *nicht akzeptiertes* visuelles Experiment behandeln; ein Event-/Datenvertrag und Minimal-Smoke-Plan, ohne App-Code zu schreiben.
2. **C1 Ein echter Textpfad:** Textfrage → Cloudflare-Front-Agent → echte, sichtbare Streaming-Antwort für `What this is`; keine hartcodierten `fakeAnswers`. Den Fehlerfall einmal absichtlich testen.
3. **C2 Eine verbundene Oberfläche:** Augen auf echte Status-/Fokusereignisse; lebendiger Typewriter aus echten Text-Deltas; Bridge mit höchstens zwei natürlichen Richtungsimpulsen; genau eine Waypoint-Card; drei Slider ändern **sowohl** CSS/Typografie **als auch** Agentenparameter. Jede neue Wirkung mit Regressionstest.
4. **C3 Deutsches Voice-Modul:** Mikrofon erst nach bewusster Geste; STT/TTS und Reaktionszeit real prüfen; Text beginnt unabhängig vom TTS sofort. Voice-Fehler darf den Textpfad nicht zerstören. Danach **vollständige Slice-1-Abnahme** gemäß `PROJECT.md`.

**Wichtig:** Bestehender Text-Smoke ist ein Zwischenmeilenstein, **nicht** der Nachweis „Slice 1 fertig“. Bei einer Blockade in C1–C3 `PARKED` mit Befund, nicht die nächste Schicht anfangen.

## 4. Verifier-first: Definition of Done

Alle Punkte brauchen eine reproduzierbare Prüfung, erwartetes und tatsächliches Ergebnis, Testumgebung sowie Beleg (Testausgabe/Browser-Trace oder manuelles Prüfprotokoll):

- [ ] Ohne Begrüßungsmonolog kann der Mensch sofort `„Was bist du?“` eingeben; kein ungefragter Permission-Dialog.
- [ ] Ein **echter** Cloudflare-/Modellaufruf beantwortet die Anfrage (keine festen Demoantworten).
- [ ] Das erste empfangene Text-Delta macht eine sichtbare Antwort; Verlauf/Fokus folgen den bestätigten Designentscheidungen.
- [ ] Augen-/Wartezustände reagieren auf echte Eingabe-, Thinking- und Response-Signale, nicht nur auf künstliche Timer.
- [ ] Der erste `What this is`-Pfad antwortet knapp (Bridge + maximal zwei Fäden) und zeigt bei klarem Intent höchstens **eine** richtige Waypoint-Card.
- [ ] Alle drei Slider verändern bei einer Testinteraktion sichtbar **beide** Kanäle (CSS-Style und Antwortverhalten), nicht nur Farben.
- [ ] Bei Netzwerk-/Modellausfall bleibt die Oberfläche bedienbar; Fehler ist sichtbar und verständlich, kein irreführender Erfolg.
- [ ] Voice auf Deutsch ist mit bewusster Mikrofonfreigabe und Text-vor-TTS tatsächlich ausprobiert; Voice-Ausfall blockiert Text nicht.
- [ ] `first_token_ms`, `first_audio_ms` und Fehlerrate sind mit Messmethode und Stichprobe dokumentiert; **Grenzwerte** wurden vor Build von Samuel abgenommen (keine erfundenen Zahlen).
- [ ] Strukturprüfung `bash scripts/validate.sh` sowie passende echte Anwendungstests/Smokes laufen erfolgreich; unabhängiger Verifier bestätigt die konkrete Version.

## 5. Token-Freeze / Conserve

- **Vor jedem Lauf:** Ein Auftrag, ein eindeutiges erwartetes Artefakt, maximal zulässige Token-/Kostenmenge und Stop-Kriterium vereinbaren; solange Budget unbekannt: keine automatische Rekursion, kein Fächer-Scout.
- **Nur bedarfsgetriebene Recherche:** Erst konkrete Integrationsblockade + fehlender Beleg, dann **ein** enger Scout. Keine erneute Breitenrecherche zu schon entschiedenen Fragen.
- **Vermeide Kontext-Amplifikation:** Verweise auf kanonische Dateien und relevante Abschnitte statt alle langen Synthesen und Sitzungen neu einzulesen.
- **Nach jedem Inkrement:** Verbrauch (falls messbar), Resultat, Testbeleg, verbleibende Blockade und **genau ein** nächster Schritt notieren.
- **Token-/Kontingent-Ende:** `PARKED`, Evidenz sichern; kein automatischer Providerwechsel, keine unbegrenzte Wiederholung. Nur Owner kann Budget oder Scope neu autorisieren.

## 6. Mission-Handoff / Exit

**Aktueller Gate-Status:** `WARM — DRAFT`. Dokumentiert, noch **nicht** umgesetzt, nicht autorisiert.  
**Nächste zulässige Aktion:** C0 als konkreten Plan mit Event-Vertrag, Testbeispielen, erlaubtem Write-Root, Modell-/Provider-Vorschlag und überprüfbaren Akzeptanzgrenzen vorbereiten; unabhängigen Plan-Review einholen. Samuel bestätigt fehlende Entscheidungen **und** gibt Build gesondert frei.

**Closure-Packet (bei späterer Ausführung):**
- Mission-/Lease-ID (falls HAI tatsächlich eine zugewiesen hat), Owner-Freigaben und Commit-SHAs.
- Geänderte Dateien und tatsächlich ausgeführte Testbefehle/Browserprüfungen.
- `ACCEPT`/`REPLAN`/`BLOCKED`-Befunde, gemessene Latenzen und Kosten/Token-Verbrauch.
- Bekannte Mängel, Folge-Slice-Parkplatz, ein präziser nächster Schritt.

**Arbeitsprinzip:** Jede neue Komponente schließt an etwas bereits Funktionierendes an — nicht an ein weiteres Stück Planung.


## Abhängige Folgemission (nur Referenz)

[Evidence-Based ML Optimization Flywheel](SECONDARY-EVIDENCE-BASED-ML-FLYWHEEL.md) ist als **COLD / DEPENDENT** dokumentiert. Es beginnt **erst nach** unabhängiger Abnahme von C0–C3, geklärter Ground Truth, Datenschutz, Budgetgrenzen und separatem Owner-GO. Es verändert keine aktuellen Freigaben oder Scope-Grenzen dieser Primary Mission.
