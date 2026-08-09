#!/usr/bin/env bash
set -euo pipefail
ROOT="/Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1"
export HOME="$ROOT/.worker-home"
export TMPDIR="$ROOT/.worker-tmp"
export AGENT_CLI_CREDENTIAL_STORE=file
cd "$ROOT"
exec /Users/samuelfleig/.local/bin/cursor-agent --print --trust --sandbox enabled --model composer-2.5 --output-format json --workspace "$ROOT" -- '- Goal (1 Satz)
Repariere den reproduzierten zweiten FAIL so, dass alle Zustände vollständig atomar publiziert werden und fünfzig echte vollständige Adversarial-Suiten hintereinander bestehen.
- Non-Goal (was explizit NICHT)
Keine Änderung außerhalb dieser Variante, keine UI-/hai-mcp-/AGENTS-/Control-Datei-Änderung, kein Commit, Push, Deploy, Auth-/Profil-/Rechtewechsel, keine Löschung vorbestehender Dateien, kein echtes Agenten-Fanout, keine Sleep-/Retry-Kosmetik als Ersatz für Atomizität und kein Fälschen, Umschreiben oder Abschwächen fehlgeschlagener Tests und Logs.
- Boundaries (Write-Root-Pfad; außerhalb = verboten)
Einziger Write-Root: /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1; .worker-home und .worker-tmp dürfen nur vom Launcher/Provider genutzt, aber nicht gelesen oder dokumentiert werden; außerhalb ist jeder Schreibzugriff verboten.
- DoD (woran Erfolg messbar ist, mit Datei-Pfaden)
Führe vor jeder Codeänderung die aktuelle Suite aus und erfasse ihren echten FAIL unter /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/evidence/fix2-red-run.log; behebe in /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/src/hai_parallel_state/state.py die konkret reproduzierten Fehler bei test_adversarial_races.py:147, :194, :247 und test_ten_way_race.py:58 durch per-Digest- und per-Run-Synchronisation plus Write-temp-fsync-atomic-publish, sodass niemals ein noch beschriebener Blob, handoff.ref, meta.json oder claim.json am finalen Pfad sichtbar ist; Verlierer desselben Runs müssen ausschließlich HandoffExistsError erhalten, Shared-Payload-Schreiber müssen denselben vollständigen Blob erhalten, Snapshot-Leser dürfen während Handoff- und Claim-Writern weder Fehler noch partielle Zustände sehen; Snapshot und Run-Aufzählung müssen Symlink-Verzeichnisse ablehnen oder ignorieren und innerhalb des aufgelösten Roots bleiben; ersetze den schmalen Stress-Test durch eine nicht-rekursive vollständige Suite und belege 50 aufeinanderfolgende Läufe aller Adversarial-, Kapazitäts-, Snapshot-, Claim- und 10-Wege-Tests; echte Ausgaben müssen nach /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/evidence/fix2-green-run.log und fix2-stress-run.log, aktualisierte Grenzen und Pfade nach evidence/README.md und handoff/worker.md; kein Testprozess darf nach PASS oder FAIL hängen bleiben.
- Stop-Kriterium (wann abbrechen und zurückmelden)
Sofort ohne weitere Änderungen stoppen und mit vorhandenen Pfaden melden, wenn der aktuelle rote Lauf nicht reproduzierbar erfasst wird, ein Race nur durch Timing-Glück grün wird, irgendein Testkind hängen bleibt, echte 50 vollständige Suiten nicht ausgeführt werden, eine Behauptung nicht durch Assertions und Rohlog gedeckt ist, eine Änderung außerhalb des Write-Roots oder externe Wirkung nötig wäre oder irgendein Safety-/Owner-Gate umgangen werden müsste.'
