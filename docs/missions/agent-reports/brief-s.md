HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Projekt agentfähig: eine Website, die sich wie ein Agent verhält. Plain ES modules + CSS, kein Framework, kein Build, keine npm-Installation, kein git, kein Netzwerk-Code zu echten Anbietern (noch kein Backend; keine API-Schlüssel im Browser!).

ROLLE: AGENT S — AGENTEN-KETTE MIT FALLBACK (Redundanz)
OWNER-ENTSCHEIDUNG 3: Ein Ausfall soll nicht passieren. Redundanz durch Fallback-Kette: erster Versuch Hauptmodell, dann nächster Anbieter, dann übernächster — nach unten durchhangeln. Erst wenn alles scheitert, ein ehrlicher kurzer Satz an der Stelle der Antwort: "I can't answer right now. Try again in a bit." Kein Knopf; erneutes Senden ist der Retry. Augen bleiben wach.
LIES: src/main.js (austauschbarer Agent: setAgent, agent.respond), src/dev/devAgent.js (Schnittstelle respond(prompt,{signal}) → Promise<{text, dev}>, AbortError), src/conversation/conversation.js (RESPONSE_ERROR-Pfad), src/state/store.js, Abschnitt <!-- n1 --> und <!-- n6 --> in docs/missions/M-20261119T220518-4585e9fd-ANALYSEN-N1-N7.md.
DATEIEN (nur diese): neu src/agent/chain.js, src/agent/providers.json (Konfig der Kette, nur Namen/Modelle/Timeouts, KEINE Schlüssel), src/dev/failingAgents.js (simulierte Ausfälle für Entwicklung), tests/chain.test.js; in src/conversation/conversation.js NUR den Fehlertext/Fehlerpfad (Satz oben, aria-live) anpassen.
SCHNITTSTELLE:
export function createAgentChain(adapters, { timeoutMs = 8000, now, onAttempt } = {}) → { respond(prompt, { signal }) }
- adapters: Array von { id, respond(prompt,{signal}) } in Prioritätsreihenfolge. Pro Versuch eigener AbortController mit Timeout; äußeres signal (Unterbrechung durch Besucher) bricht ALLES sofort ab (AbortError durchreichen, keine weiteren Versuche).
- Fehlerklassen unterscheiden (exportierte Funktion classifyError): quota/429/'4006' → sofort nächster Anbieter; timeout → nächster; network → nächster; content-filter/400 → nicht weiterreichen, sondern Fehler. Optional ein Retry mit kurzem Backoff nur beim selben Anbieter bei 5xx.
- Ergebnis enthält { text, dev, provider: id, attempts: [...] } (für spätere Metriken/Logs, nichts persistieren).
- Wenn alle scheitern: wirft einen Fehler { name: 'AllProvidersFailed', attempts }.
- Circuit-Breaker leicht: ein Anbieter, der 3× hintereinander quota meldet, wird für 60 s übersprungen (nur im Speicher, Reload = Neustart).
- src/dev/failingAgents.js: Dev-Adapter, die quota/timeout/network simulieren; wenn die Seite mit ?fail=quota,timeout geöffnet wird, baut src/main.js (macht der Integrator) eine Kette aus diesen Fehlern + devAgent als letztem Glied. Exportiere dafür export function buildDevChain(searchParams).
- tests/chain.test.js: Reihenfolge, Durchhangeln bei quota/timeout/network, Abbruch durch äußeres Signal stoppt Kette, AllProvidersFailed, Circuit-Breaker, content-filter wird nicht weitergereicht, buildDevChain.
Das Verdrahten in src/main.js macht der Integrator.
VERIFIKATION: node --check für neue JS-Dateien; node --test tests/*.test.js grün. STOP danach; antworte mit geänderten Dateien + 5 Zeilen.
