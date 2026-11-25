# ADR-0008: Embodied Agent State — Dreischichten-Architektur & Echtzeit-Event-Contract

- **Datum:** 2026-11-25
- **Status:** Angenommen (Wave 1 Vertical Slice implementiert; Upstream-Recherche, Eval-Simulator & erweiterte Lifecycle-Tests folgen in PR 2)
- **Bezug:** `ADR-0004` (Parametrisches Augen-System), `ADR-0007` (Hybrid Pre-Retrieval)

---

## Kontext

`agentfähig.de` verkörpert das Human-Agent Interface: Mensch und Agent agieren auf einer gemeinsamen lebendigen Oberfläche. Bisher arbeitete `POST /api/agent` als monolithischer Request-Response-Aufruf. Während Embedding, Pre-Retrieval (`search()`), Provider-Kaskade (`minimax` → `openrouter` → `workers-ai`), Fallbacks und Antwortvorbereitung abliefen, verharrte die Oberfläche pauschal im Zustand `thinking`. Selbst erfolgreiche Wissensfunde (`coverage: "GIVEN"`) oder Wissenslücken (`coverage: "NOT_COVERED"`) blieben bis zum Eintreffen der fertigen Modellantwort unsichtbar.

## Entscheidung

Wir führen eine strikte **Dreischichten-Architektur** und einen **einheitlichen, typisierten Echtzeit-Event-Contract** zwischen Worker, lokalen Adaptern, State-Store und Präsenz-Schicht ein:

1. **Layer 1 — Execution (Ausführung):** Reale Systemschritte im Cloudflare Worker (`worker.js`, `search.js`), in der Client-Kette (`remoteAgent.js`, `chain.js`, `local-retrieval.js`, `surface-adapter.js`) und im Antwortfluss (`conversation.js`, `typewriter.js`).
2. **Layer 2 — Observation (Beobachtung):** Jede semantisch relevante Aktion emittiert an ihrer realen Ausführungsstelle typisierte, sanitisierte `AgentEvent`-Objekte. Zwischen Worker und Browser werden diese inkrementell und asynchron per **Server-Sent Events (`text/event-stream`)** übertragen — **unmittelbar während die Aktion stattfindet und bevor die Modellantwort vorliegt**.
3. **Layer 3 — Embodiment (Verkörperung):** Ein dedizierter, zustandssicherer Embodiment-Orchestrator (`src/presence/embodiment.js`) übersetzt aktive und abgeschlossene Events unter Beachtung von Turn-Zugehörigkeit, Parallelität, Mindest-Verweildauer (Coalescing) und `prefers-reduced-motion` in Augenprofile, Blickziele, Pupillenweite, Lidschlag-Impulse und subtile 2.5D-Raumtiefe.

---

## Schnittstellen-Definition (Verbindlicher Vertrag für alle Module)

### 1. Kanonisches `AgentEvent`-Schema (`src/state/agent-events.js`)

```json
{
  "turn_id": "turn-3",
  "action_id": "retrieval-001",
  "type": "retrieval.completed",
  "category": "retrieval",
  "timestamp": 38,
  "duration_ms": 35,
  "status": "success",
  "simulated": false,
  "metadata": {
    "coverage": "GIVEN",
    "hits": 5,
    "multi_source": true,
    "alias_hit": true,
    "top_score": 0.942
  }
}
```

#### Kanonische Event-Typen (`AGENT_EVENT_TYPES`)
- **Turn & Kontext:** `turn.received`, `turn.interrupted`, `turn.completed`, `turn.waiting`, `context.prepared`, `surface.adapted`
- **Embedding:** `embedding.started`, `embedding.completed`, `embedding.timeout`, `embedding.failed`
- **Retrieval / Wissen:** `retrieval.started`, `retrieval.completed`, `retrieval.failed`
- **Werkzeuge (erweiterbar für zukünftige Agentic Tool-Calls):** `tool.started`, `tool.retry`, `tool.completed`, `tool.failed`
- **Provider & Generierung:** `provider.started`, `provider.retry`, `provider.failed`, `provider.switched`, `generation.started`, `generation.completed`
- **Antwort-Ausgabe & Fehler:** `response.streaming`, `response.completed`, `system.error`

#### Sicherheits- und Redaktions-Invarianten (`sanitizeAgentEvent`)
- Verbotene Schlüssel in `metadata` werden ausnahmslos verworfen: `api_key`, `apikey`, `key`, `token`, `secret`, `password`, `authorization`, `cookie`, `prompt`, `system`, `messages`, `reasoning`, `thought`, `think`, `raw`, `text`, `chunk_text`, `ip`, `stack`, `headers`.
- `metadata` akzeptiert ausschließlich flache, sichere Werte (`boolean`, endliche `number`, kurze Strings `<= 120` Zeichen ohne `<think>`-Blöcke oder Bearer-/Key-Muster).
- `simulated` ist nur `true`, wenn das Event explizit aus dem **Visual Evaluation Mode** stammt.

### 2. Inkrementeller Echtzeit-Transport (`POST /api/agent`)

- **Abwärtskompatibilität (JSON-Default):** Sendet ein Aufrufer (`evals/answers.mjs`, `verify-live.sh`, bestehende Endpoint-Tests) einen regulären `POST /api/agent` ohne `Accept: text/event-stream` und ohne `stream: true`, antwortet der Worker unverändert mit `application/json`.
- **Echtzeit-SSE-Modus (`Accept: text/event-stream` oder `payload.stream === true`):**
  - Validierungs-, Origin-, Methoden- und Rate-Limit-Fehler vor Turn-Start liefern weiterhin sofort HTTP `400 / 403 / 405 / 415 / 429` JSON.
  - Sobald der Turn startet, öffnet der Worker sofort einen `TransformStream` mit `200 OK`, `Content-Type: text/event-stream; charset=utf-8`, `Cache-Control: no-store`.
  - Jede reale Aktion schreibt **sofort** ein SSE-Frame:
    ```text
    event: agent.event
    data: {"turn_id":"turn-1","action_id":"retrieval-001","type":"retrieval.started",...}

    ```
  - Nach Abschluss der Modellgenerierung sendet der Worker:
    ```text
    event: agent.result
    data: {"text":"...","sources":[...],"contact_card":false,"coverage":"GIVEN","provider":"minimax","model":"MiniMax-M3.1-Flash"}

    ```
    gefolgt von `turn.completed` und Stream-Ende.
  - Scheitern alle Provider, sendet der Worker `system.error` als `agent.event` sowie `event: agent.error` mit `{ "error": "providers_unavailable", "status": 503, "attempts": [...] }`.
- **Client-Leser (`src/agent/remoteAgent.js`):** Liest `response.body.getReader()` inkrementell während die Verbindung offen ist, dekodiert SSE-Frames in Echtzeit und ruft `opts.onEvent?.(event)` sofort auf — **bevor** `agent.result` eintrifft.

### 3. Event-Bus, Stale-Turn-Schutz & Parallelitäts-Tracking (`src/state/agent-events.js`, `src/state/store.js`)

- `createAgentEventBus({ store, now })`:
  - Verknüpft den aktiven Turn mit `turn-${store.getState().turn}`.
  - **Stale-Turn-Guard:** Trifft ein verspätetes Event mit veralteter `turn_id` ein (z. B. nach Benutzer-Unterbrechung), wird es mit `stale: true` markiert, **ausschließlich** für die Developer-Observability protokolliert und verändert niemals den aktiven Embodiment-Zustand.
  - **Aktive Aktionen & Parallelität:** Führt `activeActions` (`Map<action_id, AgentEvent>`), berechnet fehlende `duration_ms` automatisch aus der Differenz zum Start-Event derselben `action_id` und liefert `parallelCount`.
- `store.js`: Erhält rückwärtskompatibel das optionale Feld `embodied` (letzter Intent, `coverage`, `parallelCount`, `activeActionCount`, `simulated`) über `AGENT_EVENT`, ohne bestehende Reducer-Tests zu verändern.

### 4. Embodiment-Komposition, Coalescing & Barrierefreiheit (`src/presence/embodiment.js`)

- **Prioritäts-Komposition bei parallelen Aktionen:** Laufen mehrere Aktionen gleichzeitig (z. B. `tool-1` + `tool-2` oder `retrieval` + `embedding`), bestimmt die höchste aktive semantische Priorität (`error` > `interrupted` > `switching` > `tooling` > `searching` > `grounded`/`uncovered` > `concentrating` > `streaming` > `orienting`) das primäre Augenprofil, während `parallelCount >= 2` additiv die räumliche Aufmerksamkeit und Pupillenöffnung (`+0.04` pro paralleler Aktion, gedeckelt) moduliert.
- **Visuelles Coalescing (Minimalismus):** Technische Events unterhalb von `110 ms` bleiben lückenlos im Event-Bus sichtbar, während visuelle Haltungswechsel sanft gedämpft überblenden, damit kein hektisches Flackern entsteht.
- **Barrierefreiheit (`prefers-reduced-motion` & Nicht-Farb-Codierung):**
  - Bei reduzierter Bewegung oder pausierter Bewegung entfallen kontinuierliche Sakkaden, Such-Drifts, Lidschläge und Lese-Sweeps vollständig; Zustände zeigen sich ruhig über statische Lid-/Skalen-Geometrie sowie nicht-farbliche Struktur- und Textindikatoren.
  - Informationen werden niemals ausschließlich über Farbe vermittelt.

### 5. Developer Observability & Visual Evaluation Mode (`src/dev/observability-panel.js`)

- Für normale Besucher vollständig unsichtbar (kein DOM-Ballast im Sichtfeld).
- **Developer Observability (`?dev=1` oder Tastenkürzel `Alt+Shift+D`):** Zeigt laufende Aktionen, Event-Timeline in Echtzeit, `duration_ms`, Retrieval-Coverage (`GIVEN` / `NOT_COVERED` + Trefferzahl), Tool-Aufrufe/Retries, Provider-Wechsel, verworfene Stale-Events und den aktuell abgeleiteten visuellen Zustand.
- **Visual Evaluation Mode (`?eval=1` oder Tab im Panel / `Alt+Shift+E`):** Erlaubt Samuel, jeden einzelnen verkörperten Zustand sowie komplette mehrstufige Abläufe (inkl. des 5-Sekunden-Verzögerungs-Akzeptanzszenarios) ohne echten LLM-Aufruf auszulösen und visuell zu beurteilen. **Jedes simulierte Ereignis trägt zwingend `simulated: true` sowie ein unübersehbares `SIMULATED`-Kennzeichen auf der Oberfläche und in der Timeline.**

## Konsequenzen

- Besucher nehmen Wissenssuche, Trefferqualität, Werkzeugarbeit, Provider-Wechsel und Antwortrhythmus unmittelbar in Echtzeit wahr — noch während das Sprachmodell rechnet.
- Bestehende JSON-Clients, Evaluatoren (`evals/answers.mjs`) und alle 301 Bestandstests bleiben ohne Breaking Changes funktionsfähig.
- Zukünftige agentische Werkzeuge im Worker oder Client müssen lediglich `onEvent({ action_id, type: 'tool.started' | 'tool.completed' | ... })` aufrufen und werden automatisch von Oberfläche und Observability verkörpert.
