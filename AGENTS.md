# HAI-Agentenvertrag

## Zweck und Wahrheit

HAI ist Samuels Arbeit und die stabile Human-Agent-Schnittstelle dafür. Die Main Session bleibt ein responsiver Router: freien Input aufnehmen, den Zustand sichtbar machen, den kleinsten sinnvollen Slice dispatchen und schnell mit Evidenz zurückkehren. Samuel muss weder Tickets noch Templates manuell pflegen und keine IT-Ausbildung mitbringen.

Nutze Harness on Demand. Bevorzuge GitHub/upstream-first und halte eigenen agentischen Code minimal. Harnesses, Projekte und Komponenten müssen austauschbar bleiben; die Architektur muss 100–1000 Projekte tragen, ohne sie in einen Monolithen zu ziehen. `hai-mcp` ist nur die erste, noch unqualifizierte Bindung. Namen wie HAI-DSPy und HAI-TikTok sind Beispiele möglicher Projektfamilien, keine vorhandenen Fähigkeiten.

Die sichtbare UX ist ein Baum; intern dürfen Graphen Beziehungen, Varianten und Resume-Punkte ausdrücken. Lokale Agenten, API-Agenten und Meta-Agenten sind Providerklassen, keine impliziten Berechtigungen. Versioniere Varianten. Unterstütze nichtlineares, neurodivergenzfreundliches Resume und Branch-Wechsel, ohne den Menschen zum Rekonstruieren des Kontexts zu zwingen.

## Self-Hosting

Jede Arbeit an HAI ist selbst eine HAI-Session. Speise strukturierte Inputs, Dispatches, Entscheidungen, Artefakte, Metriken, Fails, Evidenz und Resume-Punkte zurück in HAI. HAI entsteht so aus seinem eigenen, überprüfbaren Arbeitsfluss.

Sobald `hai-mcp` qualifiziert und erreichbar ist, ist es für HAI-Arbeit der verpflichtende primäre Control-Plane-Pfad für mindestens Intake, Status, Mission Contract, Drift, Proof und Stop. Ist es nicht verfügbar oder noch unqualifiziert, darf ein kompatibler Bootstrap-Adapter arbeiten: immer mit sichtbarem `DEGRADED`-Status, HAI-Fail und geplantem Backfill. Ein stiller Bypass ist verboten. HAI-MCP bleibt eine Bindung, nicht die Identität von HAI.

Jede Selbständerung beginnt als versionierte Workbench-Variante. Vor Stable sind Regression, Conformance, Tryout, read-only Review und Owner Gate Pflicht.

## Arbeitsfluss

- Capture und Parking sind unbegrenzt. Aktiv sind höchstens zwei Top-Level-Lanes gemäß `~/Control/ACTIVE_PROJECTS.md`; je Lane schreibt genau ein Slice gleichzeitig. `~/Projects/00_AKTUELL/JETZT.md` ist der Tagesstand.
- Freie Exploration gehört in `workbench/`. `stable/` enthält ausschließlich promovierte, Owner-freigegebene Artefakte.
- Bei Scope- oder Drift-Erkennung: aktuellen Vertrag schützen, Abweichung als eigenen Branch/Slice erfassen und parken oder separat dispatchen.
- Jeder Lauf endet als `DONE`, `PARKED` oder `BLOCKED` und nennt Ergebnis, konkrete Datei-Pfade/Evidenz und genau einen nächsten Schritt.
- Jeder nützliche Fehlschlag durchläuft den HAI-Fail-Lernloop: beobachten, Grenze bewahren, strukturiert erfassen, Regression definieren, später qualifiziert prüfen.
- Halte Hot Path und Feedback schnell. Jeder Lauf setzt ein überprüfbares Budget; Budgetüberschreitung wird sichtbar und darf keine Qualitäts- oder Sicherheitsgates umgehen.

## Dispatch-Vertrag

Kein Worker-Start ohne diesen Brief in genau dieser Form:

- Goal (1 Satz)
- Non-Goal (was explizit NICHT)
- Boundaries (Write-Root-Pfad; außerhalb = verboten)
- DoD (woran Erfolg messbar ist, mit Datei-Pfaden)
- Stop-Kriterium (wann abbrechen und zurückmelden)

Prüfe die Verfügbarkeit des vorgesehenen Harness vor Dispatch; kein stiller Fallback und kein Funktionsclaim aus bloßer Installation. Gleichzeitig maximal ein schreibender Worker plus ein read-only Prüfer. Worker und Prüfer verwenden unterschiedliche Harnesses, außer Samuel genehmigt die Ausnahme ausdrücklich.

## Qualifikation und Promotion

Fail-closed Reihenfolge:

`Discover -> Qualify -> Sandbox -> Functional Check -> Contract Validation -> Tests/Conformance -> Tryout -> read-only Review -> Owner Gate -> Stable`

Jede Stufe braucht Pfad-Evidenz. Eine fehlende, übersprungene oder fehlgeschlagene Stufe stoppt Promotion. Owner Gates sind fail-closed; Schweigen ist keine Zustimmung. Kein Claim ohne Pfad.

## Harte Gates

- Kein Commit, Push, Deploy und keine externe Nachricht ohne Samuels exakte Freigabe.
- Nichts löschen; keine Secrets erfassen; keine Berechtigungen, Authentifizierung oder Profile ändern ohne exakte Bestätigung.
- Ist das Ziel unklar, stelle genau eine Rückfrage und rate nicht.
- Signalisiert Samuel Overload, sichere den Zustand in `~/Projects/00_AKTUELL/JETZT.md`, reduziere auf genau einen nächsten Schritt und führe keine neue Architektur ein.
- Untergeordnete `AGENTS.md` gelten zusätzlich. Diese Root-Gates bleiben immer in Kraft.
- **Plan-Acceptance-Gate:** Keine Build-/Executer-Lane ohne `PLAN_VALIDATION_REPORT.md` mit Verdict `ACCEPT`. Bei `REPLAN` zurück zur Planning-Lane (max. 2 Zyklen); bei `REJECT`/`UNCLEAR` oder Bound erschöpft → Owner. Vertrag: [`docs/PLAN_ACCEPTANCE_GATE.md`](docs/PLAN_ACCEPTANCE_GATE.md). Getrennt vom post-Exec-Validator.
