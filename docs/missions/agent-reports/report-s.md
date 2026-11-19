Geändert: `src/agent/chain.js`, `src/agent/providers.json`, `src/dev/failingAgents.js`, `src/conversation/conversation.js`, `tests/chain.test.js`.
`chain.js`: `createAgentChain`, exportiertes `classifyError`, Timeout/äußeres Abort, Quota-Circuit-Breaker (3×/60 s), 5xx-Retry, `AllProvidersFailed`, `ContentFilterError`.
`failingAgents.js`: `createFailingAgent`, `parseFailureKinds`, `buildDevChain(searchParams)` mit `devAgent` als letztem Glied; `conversation.js` nutzt den geforderten Satz und schreibt ihn in `#live` (aria-live).
Verifikation: `node --check` für alle neuen JS-Dateien OK; `node --test tests/*.test.js` = 96/96 grün; `scripts/validate.sh` Scaffold/Skills OK, der Git-Schritt scheitert nur, weil dieses Verzeichnis kein Git-Repo ist.
DONE — `main.js` bleibt wie beauftragt beim Integrator.
