# Cloudflare-Bausteine und Upstream-Repos zu T1–T9

Mission `M-20261112T230610-fd237a98` · Stand 12.11.2026 · alle URLs in diesem Lauf abgerufen.

STATUS: VERIFIZIERT (dieser Lauf) — alle Anforderungszuordnungen, Limits,
Latenzaussagen und Repo-Metadaten belegt aus direkt abgerufenen Quellen
vom 12.11.2026. Entscheidungen/Architektur bewusst nicht getroffen (Brief).

## Tabelle T1–T9

### T1 (Eingang voice / text / picture)

- **Baustein:** Agents SDK Voice (`agents/voice`) + Workers AI. `withVoice`
  baut die komplette Pipeline (STT → LLM → TTS) in einen Agenten,
  `withVoiceInput` liefert reine Transkription (Diktat). Audio läuft als
  binäre WebSocket-Frames (16 kHz Mono, 16-bit PCM), kein SFU nötig.
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- STT-Modelle (Klassennamen wörtlich aus der Doku): `WorkersAIFluxSTT`
  (Standardmodell `@cf/deepgram/flux`), `WorkersAINova3STT`
  (`@cf/deepgram/nova-3`). Beide mit modellgetriebener Turn Detection.
  TTS: `WorkersAITTS` (Standardmodell `@cf/deepgram/aura-1`).
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- Text-Eingang: `sendText` umgeht STT und geht direkt an `onTurn()`.
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- Third-Party-Provider: `DeepgramSTT` (@cloudflare/voice-deepgram),
  `ElevenLabsTTS` (@cloudflare/voice-elevenlabs), Telnyx/Twilio/Plivo für
  Telefonie. Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
### T1 (Eingang voice / text / picture) — Workers AI Katalog

- **Baustein:** Workers AI, 74 Modelle im Katalog (Stand 12.11.2026).
  Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Sprache-zu-Text (Automatic Speech Recognition):** `@cf/deepgram/flux`
  („the first conversational speech recognition model built specifically for
  voice agents"), `@cf/deepgram/nova-3`, `@cf/openai/whisper`,
  `whisper-large-v3-turbo`, `whisper-tiny-en` (als Beta markiert).
  Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Text-zu-Sprache:** `aura-1` („context-aware TTS … natural pacing,
  expressiveness, and fillers"), `aura-2-en`, `aura-2-es`, `melotts`
  (mehrsprachig). Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Bildverständnis (Image-to-Text / Vision):**
  `llama-3.2-11b-vision-instruct` („visual recognition, image reasoning,
  captioning"), `llama-4-scout-17b-16e-instruct` (nativ multimodal),
  `moondream3.1-9B-A2B` (vision language model: object detection, OCR,
  structured output), `mistral-small-3.1-24b-instruct` (vision understanding),
  `kimi-k2.6` (vision inputs), `resnet-50` (Image Classification).
  Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Kleine schnelle Sprachmodelle:** `llama-3.2-1b-instruct`,
  `llama-3.2-3b-instruct`, `gpt-oss-20b` („for lower latency, and local or
  specialized use-cases"), `glm-4.7-flash` („fast and efficient … 131,072
  token context window"), und explizit für Voice-Agenten: `phonellm-mini-alpha-2`
  („an open model tuned for voice agents … voice agent tasks with thinking
  disabled", von daily-co). Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Turn Detection:** `smart-turn-v2` („an open source, community-driven,
  native audio turn detection model in 2nd version", von Pipecat).
  Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Streaming:** Voice-Beispiel-Code nutzt `streamText` mit Modell `@cf/moonshotai/kimi-k2.6`.
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- Große Modelle für den langsamen Pfad (T4): `deepseek-v4-pro-0813` (1M Kontext),
  `glm-5.3`, `gpt-oss-120b`, `kimi-k2.6` (1T Parameter).
  Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Reifegrad T1-Voice:** Feature ist als **Beta** markiert („Audio streams
  over WebSocket — no SFU or meeting infrastructure required. **Beta**").
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)

### Cloudflare Realtime (WebRTC, RealtimeKit, SFU)

- **Baustein:** Cloudflare Realtime mit zwei Pfaden: RealtimeKit („prebuilt
  meeting UI and SDKs for web and mobile", Cloudflare handled signaling und
  Media-Routing, optional managed recording/transcription) und Realtime SFU
  („Use the Realtime SFU API to control which endpoints publish or receive
  audio, video, and data. Your application handles signaling and permissions").
  Quelle: https://developers.cloudflare.com/realtime/ (12.11.2026)
- **AI-Audio-Pipelines:** Beispiel „Transcribe microphone audio with Workers
  AI, then send generated speech to browsers through WebSocket media adapters"
  (Realtime SFU, Beispiel „AI audio pipelines").
  Quelle: https://developers.cloudflare.com/realtime/ (12.11.2026)
- **Primitives:** Cloudflare TURN (WebRTC-Relay per Anycast, wenn NAT/firewall
  direkte Verbindung verhindert), WebSocket adapter (PCM-Audio in beide
  Richtungen zwischen SFU und WebSocket-Service), DataChannels.
  Quelle: https://developers.cloudflare.com/realtime/ (12.11.2026)
- Für Agentfähig: Agents SDK Voice braucht laut Doku kein SFU („no SFU or
  meeting infrastructure required"); Realtime SFU ist der Pfad für
  eigene WebRTC-Apps. Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026),
  https://developers.cloudflare.com/realtime/ (12.11.2026)

### T2 (unter 1 Sek., auch mit TTS)

- **Baustein:** Agents SDK Voice-Pipeline. Die Doku nennt selbst
  Pipeline-Metriken: `llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms` —
  der Client liefert sie nach jedem Turn. Beispielmessung in der Doku:
  `llm_ms: 850, tts_ms: 200, first_audio_ms: 950, total_ms: 1200`.
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- Streaming-TTS: „LLM tokens are sentence-chunked and synthesized
  concurrently" — erstes Audio wartet nicht auf den ganzen Text.
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- Telefonie-Pfad: TelnyxTTS mit `backend: "websocket"` für niedrigere
  Time-to-First-Audio (Doku-Aussage: „for lower time-to-first-audio").
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)
- Cloudflares eigene Latenzaussagen zu Sprach-Pipelines: folgen im
  Abschnitt „Latenz".

### T3 (Front man → Analysing / Looking up / Backup)

- **Baustein:** Agents SDK Sub-agents — „Parent/child DO composition via
  facets, nested routing, and typed parent lookup"; Agenten als Tools mit
  „streaming child timelines". Quelle: https://github.com/cloudflare/agents (12.11.2026)
- Muster-Guides im Repo: „Anthropic Patterns guide — sequential, routing,
  parallel, orchestrator, evaluator".
  Quelle: https://github.com/cloudflare/agents (12.11.2026)
- Beispiel `agents-as-tools` für Chat-fähige Sub-Agenten.
  Quelle: https://github.com/cloudflare/agents (12.11.2026)
- DO-RPC: Öffentliche Methoden einer Klasse, die von `DurableObject`
  erbt, werden zu RPC-Methoden und lassen sich über einen
  `DurableObjectStub` aufrufen (z. B. `env.MY_DURABLE_OBJECT.getByName("foo")`
  → `stub.sayHello()`); „All RPC calls are asynchronous, accept and return
  serializable types, and propagate exceptions to the caller".
  Quelle: https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/ (12.11.2026)

### T5 (Slider, Echtzeit-Sync Agent ↔ Browser)

- **Baustein:** Agents SDK State + WebSockets. „Persistent State — Syncs to
  all connected clients, survives restarts"; React-Hooks `useAgent` mit
  `onStateUpdate`; Callable Methods via `@callable()`.
  Quelle: https://github.com/cloudflare/agents (12.11.2026)

### T6 (Augen, Effekte — reines Frontend)

- Der Agent liefert die Ereignisse: Status des Voice-Clients
  (`idle | listening | thinking | speaking`), `audioLevel` (0–1 Mic-RMS),
  `interimTranscript` (Teiltranskript in Echtzeit), `transcriptchange`,
  `audiolevelchange`, `custommessage`.
  Quelle: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026)

### T7 (ein Agent pro Besucher/Mandant)

- **Baustein:** Durable Objects. „Each Durable Object has a globally-unique
  name, which allows you to send requests to a specific object from anywhere
  in the world"; Objekte werden beim ersten Request nahe beim Anfrager
  provisioniert; „You can have millions of them around the world"; idle
  Objekte werden beendet. Quelle: https://developers.cloudflare.com/durable-objects/ (12.11.2026)
- Agents-README: „You can run millions of them — one per user, per session,
  per game room — each costs nothing when inactive."
  Quelle: https://github.com/cloudflare/agents (12.11.2026)
- Plan-Spanne: „Available on Free and Paid plans"; „SQLite-backed Durable
  Objects are now available on the Workers Free plan" (mit Limits, siehe
  Abschnitt Limits). Quelle: https://developers.cloudflare.com/durable-objects/ (12.11.2026)

### T9 (Pay — nur notieren)

- **Baustein:** Agentic Payments in der Agents SDK — zwei Protokolle auf
  HTTP `402 Payment Required`: **x402** (von Coinbase gegründet, Stablecoin
  USDC auf Base/Ethereum/Solana, Header `PAYMENT-REQUIRED`,
  `PAYMENT-SIGNATURE`, `PAYMENT-RESPONSE`, optionaler Facilitator-Service
  für Verifikation/Settlement) und **Machine Payments Protocol (MPP)**
  (`WWW-Authenticate: Payment` / `Authorization: Payment` Header, Karten
  via Stripe, `mppx`-SDK für Einmal-, Nutzungs- und Abo-Zahlungen,
  abwärtskompatibel mit x402).
  Quelle: https://developers.cloudflare.com/agents/tools/payments/ (12.11.2026)
- SDK-Integration: serverseitig `withX402` und `paidTool` für MCP-Server
  plus `x402-hono`-Middleware; clientseitig `withX402Client` mit
  automatischem 402-Handling und optionaler menschlicher Freigabe.
  Quelle: https://developers.cloudflare.com/agents/tools/payments/ (12.11.2026)
- README-Feature-Zeile „x402 Payments: Pay-per-call APIs and tools via
  the x402 protocol"; Beispiele `examples/x402`, `examples/x402-mcp`.
  Quellen: https://github.com/cloudflare/agents (12.11.2026)

### T4 (fast / slow)

- **Baustein:** Zwei Workers-AI-Modellklassen im selben Katalog: kleine
  schnelle Modelle (`gpt-oss-20b`, „for lower latency", `llama-3.2-1b-instruct`,
  `glm-4.7-flash`, `phonellm-mini-alpha-2` für Voice-Agenten) neben großen
  (`glm-5.3`, `deepseek-v4-pro-0813`, `kimi-k2.6`).
  Quelle: https://developers.cloudflare.com/workers-ai/models/ (12.11.2026)
- **Nachreichen des langsamen Ergebnisses:** Agents SDK State synct
  Zustandsänderungen an alle verbundenen Clients („Persistent State — Syncs
  to all connected clients"); das Frontend kann so das spätere Ergebnis
  empfangen, ohne neuen Request.
  Quelle: https://github.com/cloudflare/agents (12.11.2026)
- **Freigabe/Mensch-Loop:** Workflows für mehrstufige, dauerhafte Aufgaben
  mit `step.waitForEvent()` (z. B. „await approval"). Siehe
  „Workflows (ein Satz)" unten.
  Quelle: https://developers.cloudflare.com/workflows/ (12.11.2026)

### T8 (Wissensquelle für den Looking-up-Agenten)

- **Baustein:** AI Search — „The search primitive for your applications and
  agents … Create an instance, give it your data, and search it with natural
  language". Automatisches Indexieren, Hybrid-Semantik-/Keyword-Suche,
  Bildsuche, OCR, eingebauter MCP-Endpoint. „AI agents that perform research
  over your internal knowledge" ist ein genannter Use Case; „Let each tenant
  or agent upload and search their own files".
  Quelle: https://developers.cloudflare.com/ai-search/ (12.11.2026)
- **Unterbau:** Vectorize — „globally distributed vector database", queried
  from Workers; Embeddings aus Workers AI oder von extern (OpenAI), Vektoren
  referenzieren R2-Objekte, KV oder D1. „Vectorize is now Generally
  Available". Quelle: https://developers.cloudflare.com/vectorize/ (12.11.2026)
- Agents SDK listet „AI Search" als eingebautes Agent-Tool.
  Quelle: https://developers.cloudflare.com/agents/ (12.11.2026)

### Workflows (ein Satz)

Dauerhafte mehrstufige Ausführung auf Workers: Schritte mit automatischen
Retries, Pausen (`step.sleep()`, Sekunden bis Wochen) und `waitForEvent` für
Human-in-the-Loop-Freigaben; auf Free und Paid.
Quelle: https://developers.cloudflare.com/workflows/ (12.11.2026)

### Queues (ein Satz)

„Send and receive messages with guaranteed delivery": Entlastung von
Requests, Worker-zu-Worker-Daten, Buffering/Batching, Dead Letter Queues;
auf Free und Paid. Für Agentfähig: selbst wenn der Front-Agent Antwort gibt,
kann er Analyse-/Backup-Aufgaben in eine Queue legen.
Quelle: https://developers.cloudflare.com/queues/ (12.11.2026)

### Realtime (zusammengefasst)

RealtimeKit (vorgefertigtes Meeting-UI + SDKs, managed Recording/Transcription)
und Realtime SFU (eigene WebRTC-Apps, App handled Signaling), TURN-Relay,
WebSocket-Media-Adapter für PCM. Für Agentfähig ist Realtime der Pfad, wenn
WebRTC statt WebSocket gewünscht ist oder mehrere Teilnehmer dazukommen.
Quelle: https://developers.cloudflare.com/realtime/ (12.11.2026)

### Quergeprüfte DO-Fakten

- WebSocket Hibernation ist ein DO-Feature: „WebSocket Hibernation allows you
  to manage the connections of multiple clients at scale."
  Quelle: https://developers.cloudflare.com/durable-objects/ (12.11.2026)
- DO-Alarms für geplante Arbeit. Quelle: https://developers.cloudflare.com/durable-objects/ (12.11.2026)

### Vorab-Fund: Agents SDK (quer über T3, T5, T7)

- Agent = Durable Object mit dauerhafter Identität, lokalem SQL-Speicher,
  Echtzeitverbindungen (WebSockets), geplanter Arbeit und wiederherstellbarer
  Ausführung. Zustandsänderungen werden an alle verbundenen Clients
  synchronisiert (`setState` → `onStateUpdate` im React-Hook `useAgent`).
  Quelle: https://developers.cloudflare.com/agents/ (abgerufen 12.11.2026)
- Features laut README (github.com/cloudflare/agents, MIT, 6k Stars, 847 Forks,
  1.848 Commits): Persistent State, Callable Methods (RPC via `@callable()`),
  **Sub-agents** (Parent/Child-DO-Komposition über Facets, verschachteltes
  Routing, typisierter Parent-Lookup), Scheduling (einmalig, wiederkehrend,
  cron), WebSockets, AI Chat mit Message-Persistenz und resumable Streaming,
  MCP, **Voice** („Continuous STT, streaming TTS, VAD, interruption, SFU
  utilities"), x402 Payments, React Hooks (`useAgent`, `useAgentChat`,
  `useVoiceAgent`), Vanilla-JS-Client (`AgentClient`, `VoiceClient`).
  Quelle: https://github.com/cloudflare/agents (abgerufen 12.11.2026)
- Beispiele im Repo: `examples/voice-agent` (einheitliche Voice-Pipeline mit
  Workers AI, AssemblyAI, Telnyx und ElevenLabs STT), `examples/agents-as-tools`,
  `examples/x402`, `examples/x402-mcp`.
  Quelle: https://github.com/cloudflare/agents (abgerufen 12.11.2026)
- Voice-Beispiel in der Doku: „Build a real-time voice agent with
  speech-to-text and text-to-speech."
  Quelle: https://developers.cloudflare.com/agents/ (abgerufen 12.11.2026)

## Limits

### Durable Objects (Quelle: https://developers.cloudflare.com/durable-objects/platform/limits/, abgerufen 12.11.2026)

- Anzahl Objekte: unbegrenzt (innerhalb Konto/Klasse).
- Klassen pro Konto: 500 (Workers Paid) / 100 (Free).
- Speicher pro Konto: unbegrenzt (Paid) / 5 GB (Free, SQLite-backed).
- Speicher pro Objekt: 10 GB (Paid) / 1 GB (Free, aus FAQ „database or disk
  is full: SQLITE_FULL“-Abschnitt); Key/Value zusammen max. 8 MB.
- WebSocket message size: 32 MiB (nur empfangene).
- CPU pro Request: 30 s Standard (jeder neue Request/WS-Message setzt den
  Timer zurück), konfigurierbar auf 5 Minuten (`limits.cpu_ms`).
- Gleichzeitige ausgehende Verbindungen pro Request: 6.
- Soft limit 1.000 Requests/Sekunde pro Objekt; überlastete Objekte
  antworten mit overloaded error.
- Wall time: HTTP-Request und DO-RPC unbegrenzt (solange verbunden);
  Alarm-Handler 15 Minuten.
- Free plan: nur SQLite-backed Durable Objects; key-value backend nur für
  Bestandskonten auf Workers Paid.

### Workers AI (Quelle: https://developers.cloudflare.com/workers-ai/platform/limits/, abgerufen 12.11.2026)

- Workers AI ist Generally Available; Limits nach Task-Typ pro Minute:
  - Automatic Speech Recognition: 720 req/min
  - Image-to-Text: 720 req/min
  - Text Generation: 300 req/min Standard
- Text Generation Paid-Modelle (benötigen Workers Paid plan; pro Konto und
  Modell): 20 req/min bei Standard-Billing, 50 req/min mit Prepaid
  AI-Gateway-Credits („Unified billing“). Diese Limits gelten laut Doku für
  „typical agentic and coding workloads, where requests to frontier models
  can take longer to complete“.
- Beta-Modelle können niedrigere Rate Limits haben.

## Latenz

Alles, was Cloudflare selbst zu Latenz von Sprach-Pipelines sagt:

- **800-ms-Regel:** „all of this needs to happen in under 800 milliseconds —
  the threshold where conversation feels natural rather than stilted". Das
  Latenzbudget wird so zerlegt: „40ms for microphone input, 300ms for
  transcription, 400ms for LLM inference, 150ms for text-to-speech".
  Quelle: https://blog.cloudflare.com/cloudflare-realtime-voice-ai/ (12.11.2026)
- **Wo die Zeit hingeht:** „A lot of voice latency is not pure model time.
  It’s the cost of bouncing audio and text between different services in
  different places. Audio needs to go to STT, transcripts go to an LLM, and
  responses go to a TTS model – and each handoff adds network overhead."
  Gegenmittel: Agent läuft auf Cloudflares Netz, Provider per Workers-AI-
  Binding. Quelle: https://blog.cloudflare.com/voice-agents/ (12.11.2026)
- **Time-to-First-Audio:** „A voice agent interaction feels much more
  natural if it speaks the first sentence quickly (also called
  Time-to-First Audio). When `onTurn()` returns a stream, the pipeline
  chunks it into sentences and starts synthesis as sentences complete."
  Quelle: https://blog.cloudflare.com/voice-agents/ (12.11.2026)
- **Edge-Nähe:** „Lower latency - Speech recognition happens at the edge,
  close to users running in the same network as Workers" (Deepgram-Modelle
  in 330+ Städten). Quelle: https://blog.cloudflare.com/cloudflare-realtime-voice-ai/ (12.11.2026)
- **WebSocket vs. WebRTC:** „WebSockets are perfect for server-to-server
  communication and work fine when you don't need super-fast responses …
  if you're building an app where users need real-time conversations with
  low delay, WebRTC is the better choice." WebRTC nutzt UDP (verhindert
  Head-of-Line-Blocking), Opus-Codec, Echo-Auslöschung und Rauschfilter
  eingebaut. Quelle: https://blog.cloudflare.com/cloudflare-realtime-voice-ai/ (12.11.2026)
- **Chunking als Latenz-Floor (WebSocket):** „With WebSockets, you would
  need to chunk the audio input, so each chunk contains 100–500
  milliseconds of audio. That chunking size, along with the
  head-of-line blocking, becomes the latency floor."
  Quelle: https://blog.cloudflare.com/bring-multimodal-real-time-interaction-to-your-ai-applications-with-cloudflare-calls/ (12.11.2026)
- **Messen statt raten:** VoiceClient liefert nach jedem Turn
  `llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms`; der Agents-Changelog
  nennt zusätzlich Stage-Timings „speech-to-final-transcript,
  model-to-first-text, TTS-to-first-audio, and total turn duration" und
  unterscheidet Outcomes (`completed`, `no_output`, `aborted`, …).
  Quellen: https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/ (12.11.2026),
  https://developers.cloudflare.com/changelog/product/agents/ (12.11.2026)
- **Realtime Agents (offene Beta):** Runtime für Voice-Pipelines am Edge,
  Pipeline STT → LLM → TTS mit Unterbrechungs- und Turn-Handling; LLM-Aufruf
  im Beispielbeispiel liefert die Antwort über `this.speak()`.
  Quelle: https://blog.cloudflare.com/cloudflare-realtime-voice-ai/ (12.11.2026)

### AI Gateway (ein Satz)

„Observe and control your AI applications" — Analytics, Logging, Caching,
Rate Limiting, Modell-Fallback und Routing vor jedem Provider (Workers AI,
OpenAI, Anthropic, …); verfügbar auf allen Plänen. Für Agentfähig: ein
Sammelpunkt vor allen Modellaufrufen, mit Caching für wiederkehrende Fragen.
Quelle: https://developers.cloudflare.com/ai-gateway/ (12.11.2026)

## Upstream-Kandidaten

Alle per GitHub-API geprüft am 12.11.2026:

1. **cloudflare/agents** — „Build and deploy AI Agents on Cloudflare",
   TypeScript, MIT, 5.991 Stars, 847 Forks, 216 offene Issues,
   letzter Push 2026-11-12 (heute, sehr aktiv).
   https://github.com/cloudflare/agents
2. **cloudflare/agents-starter** — „A starter kit for building ai agents
   on Cloudflare", TypeScript, MIT, 1.353 Stars, 300 Forks, letzter Push
   2026-08-19. https://github.com/cloudflare/agents-starter
3. **cloudflare/realtime-examples** — Beispiele zu Realtime/SFU/TURN,
   TypeScript, 160 Stars, 36 Forks, letzter Push 2026-10-15,
   **kein License-Feld** (keine offensichtliche LICENSE — vor Übernahme
   prüfen). https://github.com/cloudflare/realtime-examples
4. **anomalyco/phonecall** — „Let your agent make phone calls: Grok Voice +
   Twilio on Cloudflare, with mid-call questions, a CLI and an MCP server",
   TypeScript, MIT, 7 Stars, erstellt 2026-11-04, zuletzt gepusht
   2026-11-04. Reales Beispiel für Voice-Agent + Telefonie + MCP.
   https://github.com/anomalyco/phonecall
5. **cloudflare/workers-ai-provider** — „A Workers AI provider for the
   vercel AI SDK", TypeScript, 113 Stars, **archiviert** (letzter Push
   2025-03-18), kein License-Feld. Nur als historischer Referenzpunkt;
   für neue Projekte nicht als Baustein einplanen.
   https://github.com/cloudflare/workers-ai-provider

Pakete im Repo `cloudflare/agents` (Ordner `packages/`, per GitHub-API am
12.11.2026): `agents`, `voice`, `ai-chat`, `codemode`, `hono-agents`,
`think`, `shell`, `worker-bundler`, `fake-model`. Das Voice-Provider-Paket
heißt heute `packages/voice` (statt der im Überblick genannten separaten
`@cloudflare/voice-deepgram`/`voice-elevenlabs`-Pakete — Stand klären,
bevor gebaut wird).

## Nicht gefunden

- Kein offizielles Cloudflare-Angebot für eigenes TTS-Modell-Hosting
  jenseits Workers AI/Realtime gefunden (Stand dieses Laufs).
- Reifegrad/Aktualität von `agents/voice`: als Beta markiert (siehe T1),
  Metriken/Stage-Timings aus Changelog (siehe Latenz) — genaue GA-Timeline
  wurde in den geprüften Quellen nicht genannt.
- `anomalyco/phonecall` ist ein Projekt der opencode-Organisation
  (anomalyco), nicht von Cloudflare — als Realitätscheck/Beispiel nutzbar,
  aber nicht als Cloudflare-Baustein zählen.

## Quellen

Alle in diesem Lauf direkt abgerufen (12.11.2026):

- https://developers.cloudflare.com/agents/
- https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/
- https://developers.cloudflare.com/agents/tools/payments/
- https://developers.cloudflare.com/agents/changelog/product/agents/ (in Lauf als changelog/product/agents/ referenziert)
- https://developers.cloudflare.com/workers-ai/models/
- https://developers.cloudflare.com/workers-ai/platform/limits/
- https://developers.cloudflare.com/durable-objects/
- https://developers.cloudflare.com/durable-objects/platform/limits/
- https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/
- https://developers.cloudflare.com/realtime/
- https://developers.cloudflare.com/workflows/
- https://developers.cloudflare.com/queues/
- https://developers.cloudflare.com/vectorize/
- https://developers.cloudflare.com/ai-search/
- https://developers.cloudflare.com/ai-gateway/
- https://blog.cloudflare.com/cloudflare-realtime-voice-ai/
- https://blog.cloudflare.com/voice-agents/
- https://blog.cloudflare.com/bring-multimodal-real-time-interaction-to-your-ai-applications-with-cloudflare-calls/
- https://github.com/cloudflare/agents (README + GitHub-API-Repo-Metadaten)
- https://github.com/cloudflare/agents-starter (GitHub-API)
- https://github.com/cloudflare/realtime-examples (GitHub-API)
- https://github.com/anomalyco/phonecall (GitHub-API)
- https://github.com/cloudflare/workers-ai-provider (GitHub-API)
