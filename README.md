Samuel gibt rohe Ideen in die Main Session. Agenten strukturieren, dispatchen, implementieren, prüfen und berichten. Er braucht dafür weder eine IT-Ausbildung noch manuell gepflegte Tickets oder Templates.

# HAI Control Root

Dieser kleine Root hält die stabile Human-Agent-Schnittstelle, Verträge, ehrliche Registry-Zustände, den sichtbaren Arbeitsbaum und Fail-Lernen zusammen. Er ist kein eigener Agent, kein Tool-Router und keine Produktanwendung. Ausführung bleibt bei austauschbaren Harnesses und vorhandenen Komponenten.

## Was heute wahr ist

| Bereich | Zustand | Beleg |
| --- | --- | --- |
| Control-Root | vorhanden; Verträge und Validator sind lokal | `AGENTS.md`, `contracts/`, `scripts/validate.sh` |
| `hai-mcp` | vorhandene, noch unqualifizierte erste MCP-Bindung; eigenständiges ignoriertes Repository | `registry/components/hai-mcp.json` |
| Hermes 0.18.2 | installiert, Provider unkonfiguriert | `registry/agents/hermes.json` |
| Claude Code 2.1.224, OpenCode 1.18.1, Pi 0.84.1, Codex CLI 0.144.4 | lokal beobachtet, aber unqualifiziert | `registry/agents/` |
| Crabbox | nur unbestätigter Kandidat; nicht lokal oder funktional verifiziert | `registry/components/crabbox.json` |
| Repository-Recherche | erster offener Fail, ohne Umgehung der Sicherheitsgrenzen | `fails/0001-github-repository-discovery.json` |

„Installiert“ bedeutet hier weder authentifiziert noch einsatzfähig. „Vorhanden“ bedeutet nicht qualifiziert. Die Registry behauptet keine Fähigkeiten, die nicht durch den vorgesehenen Qualifizierungsweg gelaufen sind.

## Was Zukunftsarchitektur ist

Harness on Demand, eine Baum-UX über internen Graphen, lokale/API-/Meta-Agenten, versionierte Varianten und Projektfamilien wie HAI-DSPy oder HAI-TikTok sind Zielbilder. Sie sind keine vorhandenen Funktionen dieses Roots. Der Root hält dafür nur die Grenzen und maschinenlesbaren Verträge bereit.

## Arbeitsweise

1. Die Main Session nimmt freien Input auf und macht daraus den kleinsten ausführbaren Slice.
2. `AGENTS.md` setzt Dispatch-, Lane-, Owner- und Abschlussgates.
3. `tree/root.json`, `parking/` und Laufartefakte halten Resume, Branch-Wechsel und Evidenz nachvollziehbar; Samuels kanonische Lane-Wahrheit bleibt `~/Control/ACTIVE_PROJECTS.md`, der Tagesstand `~/Projects/00_AKTUELL/JETZT.md`.
4. Freie Versuche leben in `workbench/`. Nur der vollständige Promotion-Pfad mit Owner Gate darf nach `stable/` führen.
5. Jeder relevante Fehlschlag wird als HAI-Fail festgehalten, ohne Secrets oder versteckte Gedankengänge.

Lokale Prüfung:

```bash
bash scripts/validate.sh
```

Der Validator liest nur Dateien, benötigt Bash und `jq`, führt keine Netzwerkaufrufe aus und verändert nichts.

