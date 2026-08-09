# Architektur des HAI Control Root

## Aufgabe des Roots

Der Root ist Control Plane und dauerhafte Human-Agent-Schnittstelle. Er übersetzt Samuels freien Input in begrenzte, prüfbare Arbeit und hält Verträge, Zustände, Evidenz und Lernartefakte zusammen. Er implementiert weder Agent-Loop noch Planner, Memory, Browser, Tool-Router oder Modellclient.

## Schichten

1. **Human Interface:** Die Main Session nimmt Rohideen auf, zeigt den aktuellen Baum und liefert kurze Rückkopplungen. Sie routet; sie besitzt die Ausführung nicht.
2. **Control Contracts:** `AGENTS.md` und `contracts/` definieren Dispatch, Events, Baumknoten, Laufgrenzen, Fails und Promotion. JSON-Dateien sind austauschbare Übergabepunkte, nicht ein versteckter Scheduler.
3. **Execution Providers:** Harnesses werden je Slice gewählt. Lokal, API und Meta sind mögliche Providerklassen. Ein Registry-Eintrag beweist nur den dort ausdrücklich beobachteten Zustand.
4. **Project/Component Plane:** Projekte bleiben eigenständig. `hai-mcp/` und `MBP_HAI_MIGRATION/` sind vom Root ignoriert und werden von ihm weder besessen noch gestaged.
5. **Evidence and Learning:** Tree-, Run-, Promotion- und Fail-Artefakte erlauben Resume, Branch-Wechsel und Regression, ohne Secrets oder interne Gedankengänge zu speichern.

## Arbeitsbaum und Nebenläufigkeit

Die Baum-UX zeigt Root, Lanes, Projekte, Varianten, Runs und Artefakte. Interne Graphkanten dürfen Querverweise wie `variant_of`, Evidenz oder Resume-Punkte tragen. So bleibt die Oberfläche einfach, während nichtlineare Arbeit erhalten bleibt.

Capture und Parking dürfen wachsen. Die operative Begrenzung liegt bei höchstens zwei aktiven Top-Level-Lanes und genau einem schreibenden Slice je Lane. Ein Scope- oder Drift-Fund wird abgezweigt, statt den laufenden Vertrag still zu verändern. Varianten erhalten eigene IDs und bleiben unabhängig promotierbar.

## Harness on Demand

Die Auswahl folgt dem Run-Contract und dem kleinsten qualifizierten Fähigkeitsbedarf. Installation ist keine Qualifikation. Fehlen Authentifizierung, funktionaler Check, Conformance oder Evidenz, bleibt der Harness unqualifiziert und der Lauf stoppt oder wird geparkt. GitHub/upstream-first begrenzt Eigenbau; Glue darf nur Verträge verbinden und muss klein, deterministisch und ersetzbar sein.

Die Zielgröße von 100–1000 Projekten wird durch getrennte Repositories, kleine Registry-Records und referenzierte Artefakte getragen, nicht durch zentral eingebetteten Projektcode. `hai-mcp` ist die erste Bindung, nicht der universelle Kern. HAI-DSPy und HAI-TikTok benennen lediglich denkbare Projektfamilien.

## Self-Hosting und Bootstrap

HAI dogfoodet seine eigene Schnittstelle: Jede Änderung an HAI läuft als HAI-Session. Strukturierte Inputs, Dispatches, Entscheidungen, Artefakte, Metriken, Fails, Evidenz und Resume-Punkte fließen in den Control-Root zurück. Selbständerungen entstehen als versionierte Workbench-Varianten und erreichen Stable erst nach Regression, Conformance, Tryout, read-only Review und Owner Gate.

Nach seiner Qualifikation und bei Erreichbarkeit ist `hai-mcp` der verpflichtende primäre Control-Plane-Pfad für HAI-Arbeit, mindestens für Intake, Status, Mission Contract, Drift, Proof und Stop. Das erzeugt keinen Bootstrap-Deadlock: Solange die Bindung unqualifiziert oder unerreichbar ist, darf ein kompatibler Adapter dieselben Vertragsgrenzen bedienen. Der Lauf markiert sich sichtbar als `DEGRADED`, erfasst einen HAI-Fail und plant den Backfill in den primären Pfad. Ein stiller Bypass ist unzulässig. HAI-MCP ist eine ersetzbare Bindung und nicht die Identität von HAI.

## Stable, Workbench und Promotion

`workbench/` ist frei, explizit unqualifiziert und reversibel. `stable/` ist fail-closed. Der einzige Übergang lautet:

`Discover -> Qualify -> Sandbox -> Functional Check -> Contract Validation -> Tests/Conformance -> Tryout -> read-only Review -> Owner Gate -> Stable`

Jede Stufe erzeugt Pfad-Evidenz. Der Owner Gate kann nicht durch Automatisierung, Zeitablauf oder Mehrheitsentscheidung ersetzt werden.

## Responsivität und Sicherheit

Hot-Path- und Feedback-Budgets werden pro Lauf messbar gesetzt; dieser Root erfindet vor der Qualifikation keine universelle Latenzzahl. Ein Budgetmiss wird als Ergebnis oder HAI-Fail sichtbar. Geschwindigkeit reduziert niemals Boundary-, Review- oder Owner-Gates.

Laufzeit- und rohe Sessiondaten bleiben lokal und ignoriert. Dauerhafte Events speichern Entscheidungen, Zustände und Artefaktpfade, aber keine Secrets und keine versteckten Gedankengänge.

## Aktueller Reifegrad

Heute vorhanden sind die statischen Verträge, Registry-Records, der Root-Knoten, der erste Fail und ein lokaler Validator. Die registrierten Harnesses und Komponenten sind unqualifiziert; die beschriebene Baum-UX und Harness-Auswahl sind Zukunftsarchitektur, keine implementierte Produktfunktion.
