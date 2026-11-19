# Skills im Projekt

Stand: 19.11.2026 · Zweck: versionierte Projektkopien von Skills, die Agentfähig
tragen. Diese Kopien liegen **im Repo**, damit jede Session dieselben Regeln
arbeitet — unabhängig von globaler Installation.

## Waren im Repo?

OpenCode erkennt Skills unter `.opencode/skills/<id>/SKILL.md` und global
unter `~/.config/opencode/skills/`. Hier liegen sie unter `skills/<id>/SKILL.md`
— **das ist ein bewusster Unterschied.** Der `grilling`-Skill (Projektkopie)
lag schon vor hier, und die Projektanweisung in `AGENTS.md` sagt, dass die
Projektkopie gilt.

Damit die Skills im Repo trotzdem als Skills erkannt werden, muss
`.opencode/skills/` auf dieses Verzeichnis zeigen. Das ist eine
Konfigurationsentscheidung des Owners — **nicht** automatisch gesetzt.

## Herkunft und Lizenz

Jede Kopie behält ihre Upstream-Datei (`LICENSE` bzw. `LICENSE.txt`) im
Skill-Ordner, wo vorhanden.

| Skill | Upstream | Lizenz | Stand |
|---|---|---|---|
| `systematic-debugging` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging) | MIT | 19.11.2026 |
| `verification-before-completion` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion) | MIT | 19.11.2026 |
| `executing-plans` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/executing-plans) | MIT | 19.11.2026 |
| `test-driven-development` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/test-driven-development) | MIT | 19.11.2026 |
| `agents-sdk` | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/agents-sdk) | Apache-2.0 | 19.11.2026 |
| `workers-development` | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/workers-development) | Apache-2.0 | 19.11.2026 |
| `durable-objects` | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/durable-objects) | Apache-2.0 | 19.11.2026 |
| `wrangler` | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/wrangler) | Apache-2.0 | 19.11.2026 |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | Apache-2.0 | 19.11.2026 |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | MIT | 19.11.2026 |
| `grilling` | Eigenentwicklung, Samuels Grilling-Methodik | — | 12.11.2026 |
| `task-closure` | Eigenentwicklung dieses Projekts | — | 19.11.2026 |

Lizenzen am 19.11.2026 gegen die `LICENSE`-Datei des jeweiligen Repos geprüft,
nicht gegen die Repo-Beschreibung.

## Welche Skills wofür

| Aufgabe | Skills |
|---|---|
| STT-WebSocket-Fehler (Flux STT startet nicht) | `systematic-debugging` + `workers-development` |
| Messinstrumentierung (`turn_metrics` nicht erfassbar) | `agents-sdk` + `verification-before-completion` |
| Erste funktionierende Website | `executing-plans` + `test-driven-development` |
| Lebendige UI, Augen, Typewriter, Zustände | `webapp-testing` + `web-design-guidelines` |
| Zustand pro Besucher, Sub-Agents | `durable-objects` |
| Deploy, Logs, Wrangler-Probleme | `wrangler` |
| Jede Task-Abnahme | `verification-before-completion` + `task-closure` |

## Was bewusst nicht übernommen wurde

Aus `obra/superpowers` gibt es weitere Skills. Sie sind **nicht** kopiert:

- `brainstorming` — die Idee ist geklärt, ein offenes Brainstorming erzeugt
  nur Umfang.
- `dispatching-parallel-agents`, `subagent-driven-development` — paralleles
  Schreiben hat in diesem Projekt bereits zu Kollisionen geführt (zwei
  Sessions teilten sich Browser-Tab und Durable-Object-Unterhaltung). Siehe
  [`task-closure`](task-closure/SKILL.md), Abschnitt „Kollisionsregel".
- `writing-plans`, `writing-skills` — die Plan- und ADR-Formate dieses
  Projekts sind eigens definiert ([`docs/PLAN-STUFEN-0-5.md`](../docs/PLAN-STUFEN-0-5.md),
  [`docs/adr/`](../docs/adr/)).
- `using-git-worktrees`, `finishing-a-development-branch` — die HAI-Verträge
  regeln Lanes und Freigaben; Branch-Automatik würde daran vorbeilaufen.

## Pflege

Upstream-Skills werden **nicht** automatisch aktualisiert. Ein Update ist ein
bewusster Schritt: Upstream holen, Diff prüfen, Änderungen in der Kopie
übernehmen. Kein blindes Überschreiben — die Kopien sind inzwischen
projektspezifisch angepasst.

## Validierung

`scripts/validate.sh` prüft das Gerüst und lokale Markdown-Verweise. Es prüft
**nicht** die Skills selbst. Für die Skills gilt: `SKILL.md` vorhanden,
YAML-Frontmatter mit `name` und `description` vorhanden.
