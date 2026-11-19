# HAI Secondary Mission — Evidence-Based ML Optimization Flywheel

**Stand:** 13.11.2026  
**Status:** COLD / DEPENDENT / PARKED — ausschließlich Missionsentwurf; **keine aktive HAI-Mission, keine Freigabe für Datenerfassung, Experimente oder Training**  
**Owner:** Samuel  
**Mission-/Lease-ID:** Nicht vergeben. Erst durch tatsächlichen HAI-Start nachweisen.  
**Upstream-Mission:** [Integration First — What this is](INTEGRATION-FIRST-WHAT-THIS-IS.md)  
**Modus:** Evidence before Optimization; Sauerwein-Lernprinzip aus `KeepItSimple` anwenden, nicht ungeprüft den technischen Tutor-Stack übertragen.

## 0. Owner Intent / Mission-Lock

Ein **nachgelagertes, endliches Optimierungs-Flywheel** für den ersten funktionierenden Agentfähig-Besucherablauf entwerfen und später kontrolliert betreiben: reale Probleme erkennen, anhand unabhängiger Wahrheit messen, **genau eine** Veränderung prüfen, Wirkung in der tatsächlichen Anwendung nachweisen oder verwerfen, Erkenntnis versioniert festhalten.

**Produktnutzen statt Modell-Selbstbestätigung:** Besucher sollen ihre selbstgewählte Frage verlässlich beantworten und bei Bedarf einen passenden Waypoint erreichen können — ohne bevormundenden Gesprächsfluss. Eine bessere Proxy-Kennzahl (mehr Tokens, mehr Klicks, bessere LLM-Judge-Scores, schnellere Antwort) ist *kein* Beweis besseren Nutzens.

Das ist **keine** parallele Build-Mission. Das Flywheel beginnt nicht, solange der erste echte End-to-End-Ablauf nicht abgenommen ist.

### Herkunft / verbindliche Lessons aus KeepItSimple

- [Flywheel oder Death Flywheel](https://github.com/smlfg/keepitsimple/blob/main/docs/FLYWHEEL.md): Eine Runde ist nur valide, wenn unabhängige Wahrheit, isolierte Veränderung, mögliche Widerlegung, Stoppunkt und Gültigkeit nach Änderungen bekannt sind.
- [Verträge pro Schicht](https://github.com/smlfg/keepitsimple/blob/main/docs/CONTRACT.md): Eingang → Ausgang → Garantie → Messgröße → bekannte Fehler. Erst die Schicht messen, dann die nächste optimieren.
- [Arena-Vertrag](https://github.com/smlfg/keepitsimple/blob/main/arena/CONTRACT.md): Derselbe unveränderliche Snapshot für alle Kandidaten, getrennte Modell-/Prompt-/Strategie-Felder, menschliche Präferenz ≠ fertiges RL-Trainingssignal.
- [ADR: Kein a-priori bester Tutor](https://github.com/smlfg/keepitsimple/blob/main/docs/ADR-001-kein-apriori-tutor.md): Adaptive Strategie/Memory erst bei wiederholt beobachtetem Nutzensignal — keine Personalisierung aus wenigen Klicks.
- **Warnfall:** Bei KeepItSimple wirkte ein Bildzuschnitt mit 90 px im Korpus perfekt, las live aber eine 9 als 5. Offline-Benchmark und Live-Wahrheit können sich widersprechen. Der Korpus ist Regressionswächter, **nicht** Optimierungsziel.

## 1. Harte Abhängigkeiten und Aktivierungs-Gates

**E0 — Primary Mission DONE:** Die [Integrationsmission](INTEGRATION-FIRST-WHAT-THIS-IS.md) ist durch einen unabhängigen Verifier mit realem Cloudflare-/Modellaufruf, Textstream, Augen, drei echten Dual-Channel-Slidern, Waypoint, Ausfallpfad und deutschem Voice-Pfad gegen ihre DoD belegt. Genauer Commit/Build und Evidenzpfade sind festgehalten.

**E1 — Ground Truth vor Telemetrie:** Samuel definiert, was im ersten Pathway eine *korrekte und für den Besucher hilfreiche* Antwort ist. Belegquellen: freigegebene kanonische HAI-Inhalte und menschliche Beurteilung realer Aufgaben. Modell-Judges dürfen assistieren, entscheiden aber nicht allein. Die subjektive Nutzererfahrung benötigt gesondertes menschliches Feedback, nicht bloß Inhaltskorrektheit.

**E2 — Datenschutz und Erlaubnis:** Vor jeglicher Live-Datenerfassung werden Zweck, Datentypen, Einwilligung/Rechtsgrundlage, Löschfristen, Zugriffsrechte und Opt-out festgelegt. Standard: **keine** Speicherung roher Chats, Audioaufnahmen oder identifizierbarer Besucherdaten; aggregierte technisch notwendige Zähler nur im freigegebenen Rahmen. Kein heimliches Training auf Besuchernachrichten.

**E3 — Ressourcen und Abnahmegrenzen:** Vor der ersten Messung werden Sampling, Budget (Calls, Tokens, Euro, Zeit), maximale Runden, Abbruch-/Rollback-Bedingungen und konkrete Erfolgsgrenzen vom Owner genehmigt. Keine erfundenen Prozentwerte und kein automatischer Wechsel in kostenpflichtige Modelle.

**E4 — Explizite Owner-Aktivierung:** E0–E3 sind Voraussetzungen, **keine** automatische Startfreigabe. Ohne gesondertes `GO` bleibt die Secondary Mission `COLD` / `PARKED`. Eine von diesem Dokument behauptete aktive HAI-MCP-Enforcement-Schicht wäre falsch.

## 2. Instrumentierung — Schichtgrenzen statt Kennzahlen-Salat

Erst nach E2/E4: kleinster möglicher Beobachtungsvertrag, kompatibel mit dem von der Primary Mission gebauten Event-/Datenvertrag. Dimensionen werden nur erhoben, wenn notwendig und freigegeben.

| Schicht | Beobachtung / Ground Truth | Was sie **nicht** beweist |
| --- | --- | --- |
| Browser → Agent | Erfolgreiche Anfrage, Fehlerrate, Latenz bis erstes sichtbares Text-Delta, Session-/Build-Version | Dass die Antwort richtig oder hilfreich ist |
| Agent → Antwort | Korrektheit gegenüber freigegebenen HAI-Quellen; Halluzinations-/Nichtwissen-Fälle; unabhängige Stichprobe | Dass der Besucher sie verstanden hat |
| Antwort → Handlung | Ob ein passender Waypoint angezeigt wurde, Nutzer selbst entscheidet und ggf. bestätigt, sein Ziel erreicht zu haben | Dass mehr Klicks automatisch besser sind |
| HAI-Slider/Voice | Verhaltenswirkung der drei Regler; kein Popup ohne Geste; Text-Fallback bei Voice-Fehler; `first_audio_ms` | Dass längere Antworten oder mehr Animationen nützlicher sind |
| Betrieb | Kosten/Token je gültiger hilfreicher Antwort, Fehlerbudget, Latenzverteilung, Rollback-Fähigkeit | Produktnutzen allein |

**Primäre Outcome-Frage (muss vor Messung operationalisiert werden):** „Konnte der Besucher mit einer richtigen Antwort oder einem selbstgewählten Waypoint sein Anliegen erledigen?“ Korrektheit und menschliche Hilfreichkeit gesondert erfassen. Nicht verfügbare Labels als *unbekannt* führen, nie als Erfolg zählen.

## 3. Ein kontrollierter Lernzyklus

```text
FREEZE: freigegebener Build + Event-Vertrag + Testkorpus
   ↓
OBSERVE: reale, rechtmäßig erhobene Fehlersignale / Nutzerfeedback
   ↓
DIAGNOSE: Fehler in genau einer Schicht lokalisieren
   ↓
HYPOTHESIS: Variation, Kontrollbedingungen und Widerlegung vorab notieren
   ↓
COMPARE: Baseline vs. höchstens ein Challenger auf gleichen Fällen
   ↓
VERIFY: Offline-Regression + kleiner, bewilligter Live-Canary
   ↓
OWNER-GATE: PROMOTE / REJECT / REVERT / COLLECT_MORE / PARK
   └────────────────────→ neue versionierte Baseline, nur bei PROMOTE
```

**Rundenregel:** Maximal eine veränderte Dimension pro Versuch (z. B. Prompt **oder** Modell **oder** Routing **oder** UI-/Slider-Logik). Vergleiche mit identischem Eingabesnapshot und dokumentierter Modell-/Prompt-/Daten-/App-Version. Nicht gleichzeitig Provider, Daten, Prompt und UI verändern. Mindestens Baseline + ein Challenger; keine implizite Kandidatenexplosion.

**Sauerwein-Gate / Blind Guardrailing vermeiden:** Keine neue Filterregel oder Prompt-„Sicherheitsverbesserung“ allein aus plausibler Erzählung. Vorher Rohsignal und konkrete Fehlklasse auf **zulässiger, nicht personenbezogener/offline** Testbasis messen; Auswirkungen auf Recall, Präzision, False Positives, Nutzwert und Latenz prüfen. Sicherheit und Datenschutz gelten unabhängig vom Experiment; keine ungeschützte Rohmodell-Ausgabe an Besucher.

**Offline ≠ Live:** Ein Korpus darf Regressionen erkennen, aber nicht als Beweis für Nutzererfolg dienen. Canary und menschliche Prüfung müssen Hypothesen falsifizieren können. Kleine Stichproben erlauben `COLLECT_MORE`, nicht erfundene Signifikanz.

**Model training:** Optimierung meint zunächst *Messung, Auswahl, Prompt-/Routing-/Interaktionsverbesserung*. Fine-Tuning, RL, automatisches Online-Lernen, Langzeit-Personalisierung und Wiederverwendung individueller Besucherinputs bleiben ausgeschlossen, bis separate Evidenz, Datenrechte und Owner-Freigaben vorliegen.

## 4. HAI-Rundenartefakt / Evidence Packet

Eine Runde zählt **nur** mit diesem minimalen, überprüfbaren Protokoll:

```md
# Flywheel-Runde FW-<nummer> — <datum>
Status: PROPOSED | RUNNING | VERIFYING | ACCEPTED | REJECTED | PARKED
Primary Build: <commit + Test-Evidenz>
Datenschutz-/Owner-GO: <Belegpfad>
Baseline: <Build, Modell, Prompt, Routing, UI, Korpus-Version>
Hypothese: <was wird durch diese genau eine Änderung besser?>
Variiert: <genau eine Dimension>
Konstant: <alle anderen relevanten Dimensionen>
Unabhängige Wahrheit: <wer/was entscheidet; Coverage und Unsicherheit>
Erfolg/Guardrails: <vorab definierte Metrik, Schwellen, Fehlermodi>
Widerlegung: <welcher Befund zeigt, dass die Hypothese falsch ist?>
Budget: <max. Tokens/€ / Minuten / N Versuche>
Offline: <Metrik, N, Verteilung, Gegenbeispiele, Reproduzierbarkeit>
Live-Canary: <freigegebene Größe, reale Outcome-Messung oder unbekannt>
Entscheidung: PROMOTE | REJECT | REVERT | COLLECT_MORE | PARK
Verifier: <unabhängiges Urteil + Evidenz>
Owner-Freigabe: <Beleg>
Gültigkeit / Verfallsbedingung: <was eine Neumessung erzwingt?>
Kosten: <tatsächlicher Verbrauch, falls bekannt>
Nächster Schritt: <genau einer>
```

Die ausgefüllten Runden werden erst nach Owner-GO in einem genehmigten Ablagepfad versioniert. Kein jetzt schon fingiertes `FW-001` mit „Resultat“.

## 5. Freeze, Promotion und Stop-Bedingungen

- **Conserve / Token-Freeze:** Kein Scout- oder Modell-Schwarm ohne konkrete gemessene Fehlerklasse und enges Budget. Kein autonomer Wiederholungslauf. Maximal eine aktive Optimierungshypothese.
- **Verifier-first:** Erst Testdefinition, dann Änderung. Der Builder darf seine eigene Verbesserung nicht als einziges Urteil bestätigen.
- **Fail-closed:** Fehlende Wahrheit, unklare Quellen, unzulässige Daten, verletzte Guardrails, Budgetende oder fehlendes Owner-GO → `BLOCKED`/`PARKED`.
- **Rollback statt Erklärung:** Verschlechtert der Challenger den Nutzwert oder einen vorab definierten Guardrail, zurück zur freigegebenen Baseline. Keine „trotzdem besser“-Erzählung aus Proxy-Zahlen.
- **Promotion nur mit Beleg:** Unabhängiger Verifier + Owner-Freigabe + dokumentierter reproduzierbarer Gewinn und kein relevanter Live-Schaden. Ersetze die Baseline; keine unbegrenzte Sammlung von Varianten.
- **Revalidierung:** Bei Modell-, Daten-, Prompt-, Routing-, Schnittstellen- oder wesentlicher Produktänderung Gültigkeit betroffener Messungen neu prüfen. Alte Ergebnisse nicht als ewig gültig behandeln.
- **Exit:** Nach vereinbarter Anzahl Runden oder ohne nachgewiesenen zusätzlichen Nutzen wird die Mission `CLOSED` oder `PARKED`, mit Erkenntnis, Kosten und einer nächsten Entscheidung.

## 6. Abgrenzung zur Primary Mission

Die [Primary Mission](INTEGRATION-FIRST-WHAT-THIS-IS.md) beantwortet: **Funktioniert der gesamte Besucherablauf?**  
Diese Secondary Mission beantwortet erst danach: **Welche isolierte Änderung verbessert nachweisbar den realen Nutzererfolg, ohne die bestehende Funktion zu verschlechtern?**

Sie ändert **nicht** den aktuellen Slice-1-Umfang, fügt keine laufende Datenerfassung hinzu, startet keinen Agentenlauf und autorisiert weder Code-Änderung noch Deployment.

**Nächster Schritt (nach E0):** Die eine Outcome-Frage und ihre unabhängige Ground Truth auf einem kleinen, rechtmäßig nutzbaren Satz realer Besucheraufgaben operationalisieren; erst dann eine Baseline messen.

**Leitregel:** „Wodurch würde ich merken, dass ich falsch liege?“ — Wer diese Frage vor der Runde nicht beantworten kann, startet kein Flywheel.
