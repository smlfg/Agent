HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Projekt agentfähig: Website, die sich wie ein Agent verhält. Plain ES modules, kein Framework, kein Build, KEINE npm-Installation, kein git.

ROLLE: AGENT AA — LOKALES DEV-LLM ÜBER OLLAMA
OWNER: "Für die Entwicklung lokal ein ganz simples LLM, damit der Agent nicht immer dasselbe antwortet, sondern natürliche Varianz. Qualität ist noch keine Metrik, nur Geschwindigkeit zählt."
FAKTEN (gemessen): Ollama läuft auf http://127.0.0.1:11434, CORS für Origin http://127.0.0.1:5173 erlaubt. Schnellstes Modell: "lfm3-vl:latest" (1.9B, Antwort ~0.2 s nach dem Laden, Kaltstart ~1.3 s). Alternativen: "qwen3:8b" (think:false nötig), "mistral:latest".
LIES: src/agent/chain.js (Adapter-Schnittstelle: { id, respond(prompt,{signal}) → Promise<{text, dev}> }, AbortError), src/dev/devAgent.js, src/main.js (wie die Kette gebaut wird), src/dev/failingAgents.js (buildDevChain).
DATEIEN (nur diese anlegen): src/agent/ollamaAgent.js, tests/ollama.test.js. Das Einhängen in src/main.js macht der Integrator.
SCHNITTSTELLE:
export function createOllamaAgent({ baseUrl = 'http://127.0.0.1:11434', model = 'lfm3-vl:latest', system = DEFAULT_SYSTEM, getSystem = null, maxTokens = 90, temperature = 0.9, historyTurns = 3, fetchImpl = fetch } = {}) → { id: 'ollama:<model>', respond(prompt, { signal }), warmUp(), probe() }
- POST /api/chat, stream:false, think:false, keep_alive:'30m', options { num_predict: maxTokens, temperature }. getSystem() (falls gesetzt) liefert pro Anfrage den aktuellen System-Prompt (später aus Stil/Persona).
- Kurzes Sitzungsgedächtnis nur im Speicher: letzte historyTurns Paare (Reload = Neustart).
- Antwort bereinigen: Thinking-Tags (<think>…</think>) entfernen, Whitespace trimmen, auf max. 3 Sätze kürzen; leere Antwort → Fehler (kind 'server'), damit die Kette weiterreicht.
- Fehler klassifizierbar für chain.classifyError: Netzwerk/Ollama aus → kind 'network'; HTTP 5xx → 'server'; 404 Modell fehlt → 'server'. Äußeres AbortSignal → AbortError.
- Ergebnis { text, dev: true, provider: 'ollama', model } — dev bleibt true (lokale Entwicklung, Badge "DEV DATA" bleibt sinnvoll).
- warmUp(): ein billiger Request (num_predict 1) zum Vorladen des Modells beim Seitenstart, Fehler still. probe(): GET /api/tags mit 800 ms Timeout → true/false.
- DEFAULT_SYSTEM (englisch): "You are the presence on agentfähig.de, a website that behaves like an agent. Answer in one to three short sentences. React to what the visitor says. Never say 'How can I help'. Be warm, curious and honest. No lists, no markdown." 
- Exportiere export function parseModelParam(searchParams) (URL ?model=qwen3:8b überschreibt das Modell; ?llm=off schaltet den lokalen Adapter ab).
TESTS (mit fetchImpl-Mock, kein echtes Netz): Request-Form (think:false, num_predict, keep_alive), Bereinigung, Kürzung, History-Fenster, Fehlerklassen, Abort, parseModelParam.
VERIFIKATION: node --check src/agent/ollamaAgent.js; node --test tests/*.test.js grün. STOP; antworte mit 5 Zeilen.
