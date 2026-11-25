# Agentfähig

Ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird.
Die **Living Surface** läuft lokal und ist live unter
[agentfähig.de](https://www.xn--agentfhig-02a.de/) erreichbar: erwachende Augen,
Texteingabe, Typewriter-Antwort und Unterbrechen. Der Live-Betrieb nutzt den
Worker `agentfaehig` mit `POST /api/agent` (MiniMax M3.1 Flash, OpenAI-Fallback);
Voice ist noch nicht freigeschaltet.

Stand: 19.11.2026.

## Schnellstart

Voraussetzungen: Node.js 22+ und Python 3.

```bash
npm run dev       # http://127.0.0.1:5173/living-surface.html
npm test          # Strukturcheck + 239 Verhaltenstests
npm run validate  # nur der Strukturcheck
```

Live: [https://www.agentfähig.de](https://www.xn--agentfhig-02a.de/) — die
Living Surface als Startseite, die frühere Seite bleibt unter
[/classic/](https://www.xn--agentfhig-02a.de/classic/) erreichbar.

`npm run dev` serviert `src/` mit Pythons `http.server`; es gibt keinen Build
und keine Laufzeit-Abhängigkeiten. Lokal antwortet standardmäßig
[`src/dev/devAgent.js`](src/dev/devAgent.js) (deterministische `DEV DATA`),
nicht ein Modell; produktiv geht der Aufruf an `POST /api/agent`. Abschluss und
Grenzen von M1:
[`M1-Bericht`](docs/missions/M-20261119T220518-4585e9fd-M1-BERICHT.md).

## Einstieg

**Produkt und Entscheidungen**

- [Projektstand und nächste Entscheidungen](docs/PROJECT.md)
- [Was ich vorhabe — in meinen Worten](docs/VISION-samuel.md)
- [Bestätigte Designentscheidungen](docs/DESIGN-DECISIONS.md)
- [Projektvertrag — Erfolgsdefinition, Scope, offene Owner-Entscheidungen](docs/PROJECT_CONTRACT.md)
- [Offene Produkt- und Planungsentscheidungen](docs/UNSOLVED-PLANUNG.md)
- [Offene Technikentscheidungen](docs/UNSOLVED-TECHNIK.md)
- [Entscheidungsgrundlagen (ADRs)](docs/adr/)
- [UX und Informationsarchitektur](docs/UX-INFORMATIONSARCHITEKTUR.md)
- [Low-Fidelity-Wireframes V1 (Vorschlag)](docs/wireframes/README.md)
- [Bauplan mit Wenn-Dann-Wegen](docs/PLAN-STUFEN-0-5.md)
- [Execution Plan — Meilensteine M0–M5](docs/EXECUTION_PLAN-M0-M5.md)
- [HAI-Missionsvorschlag: Integration First](docs/missions/INTEGRATION-FIRST-WHAT-THIS-IS.md)

**Umsetzung und Messung**

- [M1 Living Surface — Abschlussbericht](docs/missions/M-20261119T220518-4585e9fd-M1-BERICHT.md)
- [Messlauf-Plan](tech/MESSLAUF-PLAN.md)
- [Messprotokoll 19.11.2026](tech/MESSPROTOKOLL-2026-11-19.md)
- [Cloudflare-Machbarkeit mit Nachweisen](docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md)
- [Prior-Art- und Embodiment-Recherche](research/PRIOR_ART_REPORT.md)
- [Embodiment-Muster](research/EMBODIMENT-RECHERCHE.md)
- [Aggregierte Scout-Befunde](research/SCOUT-SYNTHESIS.md)
- [Vergleichbare Projekte — Upstream-Suche](UPSTREAM-SEARCH-vergleichbare-projekte.md)

**Quellen, Ablage und Betrieb**

- [Designskizze vom 12.11.2026](sketches/2026-11-12-agentfaehig.md)
- [Ursprüngliches Sprachtranskript](IDEA-TRANSKRIPT.txt)
- [Designinspiration](Agentfähig/GreateWriting.txt)
- [Was liegt wo — Projektpfade](PROJEKTPFADE.md)
- [Dateinamen — Regel und Umbenennungen](docs/DATEINAMEN.md)
- [Handoffs — nicht angewendete Änderungen](docs/handoffs/README.md)
- [Handoff Gesprächsführung des Website-Agenten](HANDOFF-gespraechsfuehrung.md)
- [Visual Exploration — Idle Presence, Conversation UI, Pathway Flow](docs/visual-exploration/)
- [Nächtlicher Plaud-Zwischenstand vom 13.11.2026](docs/notes/2026-11-13-nightly-status.md)
- [CodeCanvas — Setup, Werkzeuge, Agent Notes](docs/CODECANVAS.md)
- [Skills im Projekt — Herkunft, Lizenzen, Einsatz](skills/README.md)
- [Drittanbieter-Hinweise](THIRD_PARTY_NOTICES.md)
- [Graphify-Upstream-Suche — Wissensgraph über das Repo](UPSTREAM-SEARCH-graphify.md)
- [Anweisungen für Coding-Agents](AGENTS.md)

## Struktur

```text
IDEA-TRANSKRIPT.txt   Ursprüngliches Sprachtranskript, unverändert
sketches/             Handskizze, Ausschnitte und Rohdaten
Agentfähig/           Designinspiration, keine Anforderung
docs/                 Stand, Verträge, ADRs, UX, Wireframes, Missionsberichte
research/             Prior Art, Embodiment-Muster, Scout-Synthese
tech/                 Machbarkeit, Messlauf, Protokoll und Belege
src/                  Lauffähige M1-Oberfläche (HTML/CSS/JS)
tests/                Verhaltenstests für `node --test`
scripts/              `validate.sh`, `check-names.sh`
deploy/agentfaehig-site/  Worker und Assets für agentfähig.de (`public/` generiert)
prototype/            Älterer eigenständiger HTML-Prototyp
graphify-out/         Generierter Wissensgraph, kein Projektinhalt
skills/               Projektkopien der Agent-Skills
.opencode/            Skill-Verweis für OpenCode
```

## Wissensgraph

Der Graph wird aus dem Repo erzeugt:

- [`graphify-out/graph.html`](graphify-out/graph.html) — klickbare Ansicht
- [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md) — God-Nodes,
  Communities und Verbindungen
- [`graphify-out/graph.json`](graphify-out/graph.json) — abfragbarer Graph

Er ist generiertes Arbeitsmittel, kein Projektinhalt, und kann dem Arbeitsstand
hinterherlaufen. Aufbau und Upstream:
[`UPSTREAM-SEARCH-graphify.md`](UPSTREAM-SEARCH-graphify.md).

## Werkzeuge

Der MCP-Server **CodeCanvas** stellt das Repository räumlich dar: Dateien,
Ordner, Abhängigkeiten, Diffs und LSP-Symbole. Er ist lokal installiert
(`devDependency`) und in der OpenCode-Konfiguration eingetragen — siehe
[docs/CODECANVAS.md](docs/CODECANVAS.md). Der Free-Plan des Dienstes enthält den
MCP-Zugang.

```bash
npm install    # installiert code-canvas-server lokal
```

## Prüfen

```bash
bash scripts/validate.sh
npm test
```

`scripts/validate.sh` benötigt Bash und Python 3. Er prüft, dass 13
Pflichtdateien existieren und nicht leer sind, löst die lokalen
Markdown-Verweise in diesen Dateien auf, prüft die YAML-Köpfe der Skills und
wendet die Namensregel aus [`docs/DATEINAMEN.md`](docs/DATEINAMEN.md) an.
Verweise in allen anderen Dokumenten prüft er nicht. Er ist kein
Funktionsnachweis für die Anwendung.

`npm test` ruft denselben Check auf und führt danach die 239 Verhaltenstests
unter `tests/` aus.

## Deployment

Der Live-Stand wird aus `src/` gebaut; `public/` ist generiert und nicht die
Quelle. Der Worker heißt `agentfaehig`, die Custom Domains bleiben im
Cloudflare-Dashboard.

```bash
bash deploy/agentfaehig-site/deploy.sh          # Tests, Build und Dry-Run
bash deploy/agentfaehig-site/deploy.sh --prod   # nur mit Owner-Freigabe
bash deploy/agentfaehig-site/verify-live.sh     # prüft Seiten und /api/agent
```

Konfiguration und Ablauf stehen in
[`deploy/agentfaehig-site/wrangler.jsonc`](deploy/agentfaehig-site/wrangler.jsonc),
[`build.sh`](deploy/agentfaehig-site/build.sh),
[`deploy.sh`](deploy/agentfaehig-site/deploy.sh) und
[`verify-live.sh`](deploy/agentfaehig-site/verify-live.sh).

## Stand und Grenzen

- Die Living Surface ist lokal bedienbar und live unter
  [agentfähig.de](https://www.xn--agentfhig-02a.de/); 239 Tests grün
  (Stand 19.11.2026).
- Produktiv beantwortet `POST /api/agent` Anfragen über MiniMax M3.1 Flash,
  mit OpenAI-Fallback; ohne konfigurierten Provider antwortet der Endpoint
  mit `503`.
- Voice ist noch nicht freigeschaltet; der Mikrofon-Knopf bleibt verborgen.
- Messlauf, Latenzabnahme und Fremdtest stehen aus — Stand und offene
  Entscheidungen: [`docs/PROJECT.md`](docs/PROJECT.md),
  [`docs/UNSOLVED-PLANUNG.md`](docs/UNSOLVED-PLANUNG.md) und
  [`docs/UNSOLVED-TECHNIK.md`](docs/UNSOLVED-TECHNIK.md).
