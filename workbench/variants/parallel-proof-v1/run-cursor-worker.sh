#!/usr/bin/env bash
set -euo pipefail
ROOT="/Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1"
export HOME="$ROOT/.worker-home"
export TMPDIR="$ROOT/.worker-tmp"
export AGENT_CLI_CREDENTIAL_STORE=file
cd "$ROOT"
exec /Users/samuelfleig/.local/bin/cursor-agent --print --trust --sandbox enabled --model composer-2.5 --output-format json --workspace "$ROOT" -- '- Goal (1 Satz)
Implementiere als versionierte Workbench-Variante ein tiefes, dateisystembasiertes HAI-Parallel-State-Modul, das zehn gleichzeitig laufende, isolierte Agenten-Runs ohne Handoff-Überschreibung und mit genau einem serialisierten Integrator nachweisbar unterstützt.
- Non-Goal (was explizit NICHT)
Keine UI-V1-Gesamtimplementierung, keine Änderung an hai-mcp, AGENTS.md, ACTIVE_PROJECTS.md, JETZT.md oder Dateien außerhalb des Write-Roots; kein Commit, Push, Deploy, Netzwerk, Provider-/Profil-/Auth-/Rechteänderung, Löschen oder echte Agenten-Fanout-Ausführung.
- Boundaries (Write-Root-Pfad; außerhalb = verboten)
Einziger Write-Root: /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1; außerhalb ist jeder Schreibzugriff verboten.
- DoD (woran Erfolg messbar ist, mit Datei-Pfaden)
Erzeuge dort eine eigenständige Python-Workbench-Variante mit kleiner öffentlicher Interface-Seam für Run-Reservierung, write-once/content-addressed Handoff, Status-Snapshot und atomaren Integrator-Claim; schreibe zuerst einen roten prozessbasierten 10-Wege-Race-Test und danach minimalen grünen Code; belege 10 eindeutige disjunkte Workspaces, 10 unveränderte Handoffs, abgewiesene zweite Handoff-Schreibversuche und exakt einen erfolgreichen Integrator-Claim; alle Tests müssen offline reproduzierbar sein; dokumentiere Befehle und Resultate unter /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/evidence/ und den Worker-Abschluss unter /Users/samuelfleig/Projects/03_HAI/workbench/variants/parallel-proof-v1/handoff/worker.md.
- Stop-Kriterium (wann abbrechen und zurückmelden)
Sofort ohne weitere Änderungen stoppen und mit vorhandenen Pfaden melden, wenn Authentifizierung fehlt, der Write-Root nicht strikt isolierbar ist, der rote Test nicht das konkrete Überschreibungs-/Integrationsrennen reproduziert, eine Änderung außerhalb des Write-Roots oder eine externe Wirkung nötig wäre, oder irgendein Safety-/Owner-Gate umgangen werden müsste.'
