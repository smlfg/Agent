# Maschinenlesbare Verträge

Die Schemas sind kleine Übergabegrenzen zwischen Main Session, Harnesses, Projekten und Reviews. Sie implementieren keinen Agent-Loop.

| Schema | Zweck |
| --- | --- |
| `capability-agent.schema.json` | ehrlicher Registry-Record für Agenten oder Komponenten; Installation bleibt von Qualifikation getrennt |
| `session-event.schema.json` | persistierbares Ereignis mit Actor, Zustand und Pfad-Evidenz |
| `tree-node.schema.json` | Baumknoten mit optionalen Graphbeziehungen, Familien, Varianten und Resume-Punkten |
| `consolidation-map.schema.json` | Verdichtung: N Family-Mitglieder → ≤3 Implementierungsziele + Parkliste; kein Writer-Start |
| `run-contract.schema.json` | begrenzter Slice mit den fünf Dispatch-Feldern, Harness-Rollen und Abschluss |
| `hai-fail.schema.json` | sicherer Lernrecord ohne Secrets oder versteckte Gedankengänge |
| `promotion.schema.json` | fail-closed Nachweis der Stufen bis zum Owner Gate |

Alle Schemas verwenden JSON Schema Draft 2020-12. Relative `$schema`-Verweise in Instanzen zeigen auf die passende Datei. Ein syntaktisch gültiger Record ist noch keine funktionale Qualifikation; Promotion verlangt weiterhin Evidenz für jede Stufe.

