#!/usr/bin/env bash
set -euo pipefail
ROOT="/Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1"
export HOME="$ROOT/.worker-home"
export TMPDIR="$ROOT/.worker-tmp"
export AGENT_CLI_CREDENTIAL_STORE=file
cd "$ROOT"
exec /Users/samuelfleig/.local/bin/cursor-agent --print --trust --sandbox enabled --model composer-2.5 --output-format json --workspace "$ROOT" -- '- Goal (1 Satz)
Härte parallel-proof-v1 test-first so, dass der unabhängige FAIL-Review vollständig geschlossen wird und der 10-Wege-Nebenläufigkeitsbeweis auch unter adversarial races belastbar ist.
- Non-Goal (was explizit NICHT)
Keine Änderung außerhalb dieser Variante, keine UI-/hai-mcp-/AGENTS-/Control-Datei-Änderung, kein Commit, Push, Deploy, Netzwerk, Auth-/Profil-/Rechteänderung, keine Löschung vorbestehender Dateien, kein echtes Agenten-Fanout und kein Abschwächen oder Entfernen bestehender Assertions beziehungsweise Evidenzbehauptungen.
- Boundaries (Write-Root-Pfad; außerhalb = verboten)
Einziger Write-Root: /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1; .worker-home und .worker-tmp dürfen nur vom Launcher/Provider genutzt, aber nicht gelesen oder dokumentiert werden; außerhalb ist jeder Schreibzugriff verboten.
- DoD (woran Erfolg messbar ist, mit Datei-Pfaden)
Erweitere zuerst /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/tests/ um nachweislich rote Regressionstests und implementiere danach minimal: eine 10-Prozess-Barriere als echten Simultanitätsbeleg; exakter Blob-Byte- und SHA-256-Vergleich vor und nach abgewiesenen Zweitschreibversuchen; konkurrierende Handoff-Schreiber desselben Runs mit genau einem Erfolg und ausschließlich HandoffExistsError bei Verlierern; konkurrierende verschiedene Runs mit identischem Payload, die alle denselben vollständigen Blob erfolgreich referenzieren; status_snapshot während aktiver Writer ohne fehlende/partielle JSON- oder Ref-Zustände; gemeinsame strikte run_id-Validierung plus Ablehnung absoluter, Traversal- und Symlink-Escapes; atomar vollständig publizierter Integrator-Claim mit genau einem Gewinner; Ablehnung des elften aktiven Runs und append-only Abschlussmarker, der Kapazität wieder freigibt; alle Regressionen sowie mindestens 50 vollständige Wiederholungsläufe müssen grün sein; aktualisiere /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/evidence/ mit echten Rot-/Grün-/Stress-Logs und /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/handoff/worker.md mit Pfaden und Restgrenzen.
- Stop-Kriterium (wann abbrechen und zurückmelden)
Sofort ohne weitere Änderungen stoppen und mit vorhandenen Pfaden melden, wenn ein roter Test die jeweilige Race-Lücke nicht konkret reproduziert, eine Behauptung nicht durch Assertions gedeckt werden kann, der Write-Root nicht strikt isolierbar ist, vorbestehende Dateien gelöscht werden müssten, eine Änderung außerhalb des Write-Roots oder externe Wirkung nötig wäre oder irgendein Safety-/Owner-Gate umgangen werden müsste.'
