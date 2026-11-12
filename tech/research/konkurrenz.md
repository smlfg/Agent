# Technische Konkurrenz-Recherche

Stand: 12.11.2026 · HAI-Mission `M-20261112T230610-fd237a98` · Bearbeitung: MiniMax M3.1 Flash (OpenCode)
Auftrag: [`tech/briefs/konkurrenz.md`](../briefs/konkurrenz.md) · Grundlage: [`tech/INTENT.md`](../INTENT.md)

Regeln dieses Laufs: Jede Aussage trägt eine URL, die in diesem Lauf abgerufen
wurde. Was nicht belegt ist, steht als `unbelegt`. Keine Empfehlung, kein Code,
keine Marktgröße, keine Preise.

Hinweis zu den IDs: Der Brief nennt Mission `M-20261112T224900-417031a6` und
Lease `S-20261112T224910-15afe166`. Beide sind nicht mehr aktiv
(`hai_get_contract` meldet `mission_not_active`). Aktiv ist
`M-20261112T230610-fd237a98`, deren Ziel genau diese Recherche benennt.

## Gruppe 1 — Agent statt Website

| Name | URL | Was es tut | Technischer Stack | Latenz | Lizenz | Was wir übernehmen könnten |
|---|---|---|---|---|---|---|
| Docket Frameless | https://www.docket.io/blog/designing-docket-frameless | Der AI-Agent „Aura" wird aus dem Eck-Widget in den Homepage-Hero selbst eingebaut. Der Besucher redet von Anfang an mit der Seite statt mit einem Formular. | Avatar als Transparent-Video in den Hero komponiert, nicht als Kasten darüber. Live-Conversational-Agent, Live-Content der Seite. Transport, Modelle, Hosting `unbelegt` | keine Zahl belegt | kommerziell | „Agent gehört in die Seite, nicht daneben". Der Blog nennt einen verworfenen „ask-first hero": der ganze Hero wird eine offene Frage. |
| Navless Agent Page | https://guide.navless.ai/answers/landing-pages-were-built-for-a-buyer-who-doesnt-exist-anymore | Die Seite selbst ist ein Agent. Ein Snippet auf der bestehenden Landingpage ergänzt einen „Guide" mit eigenen Wissensquellen, Markenkit, Skills, Analytics. | Snippet plus konfigurierter Guide, Knowledge Sources, Analytics. Stack `unbelegt` | keine Zahl belegt | kommerziell | Signale lesen (Landingpage, Referrer, Frage, Hover, scroll-Pfad) und die Reihenfolge, Tiefe und Ausrichtung der Inhalte danach richten. |
| Open WebUI | https://github.com/open-webui/open-webui | Selbst gehostete Oberfläche, die als Ganzes ein Chat mit einem Agenten ist, der Werkzeuge nutzen kann. | Python-Backend, SvelteKit-Frontend, Vite, Tailwind, WebSockets, Ollama oder OpenAI-kompatible APIs, MCP, RAG, native Desktop-App (macOS, Windows, Linux) | keine Zahl belegt | Open WebUI License (branding-pflichtig, sonst Original-Lizenzen) | „Heim" statt „Website": die erste Seite ist die Konversation, Bedienung und Inhalt stecken in einem Fenster. |

## Gruppe 2 — Sprach-Agenten im Browser mit niedriger Latenz

| Name | URL | Was es tut | Technischer Stack | Latenz | Lizenz | Was wir übernehmen könnten |
|---|---|---|---|---|---|---|
| LiveKit Agents | https://docs.livekit.io/agents/ | Framework für zustandsbehaftete Echtzeit-Agenten in LiveKit-Räumen. Frontend und Agent sprechen per WebRTC, Agent und Backend per HTTP und WebSocket. | WebRTC (LiveKit Cloud oder selbst gehostet), Python und Node.js, Pipeline STT→LLM→TTS, eigenes Turn-Detection-Modell, Provider-Plugins, Agent-Server mit Load-Balancing | keine Zahl belegt | Apache 2.0 (Framework und Ökosystem) | Trennung Transport und Logik: WebRTC nur zwischen Browser und Agent. Turn-Erkennung als eigenes Modell statt fester Stille-Schwelle. |
| Pipecat | https://docs.pipecat.ai/pipecat/get-started/introduction.md | Python-Framework für Voice- und Multimodal-Agenten. Pipeline aus Transport, STT, LLM, TTS. Client-SDKs für Web und Mobil. | Python ≥ 3.11, 150+ AI-Service-Integrationen, Transport wahlweise Daily (WebRTC), LiveKit (WebRTC), WebSocket, SmallWebRTCTransport; Pipecat Cloud oder selbst gehostet | 500–800 ms für den kompletten Round-Trip, „in most cases"; Bedingungen: frei wählbare Provider, kein fester Messaufbau, keine Angabe zu Netz oder Gerät | BSD-2 | Referenzwert für das Budget. Mehragent-fähig: ein `WorkerRunner` koordiniert viele Agenten über einen Message-Bus. |
| Stimm | https://github.com/stimm-ai/stimm | „Optimistic VUI": ein VoiceAgent antwortet schnell, ein Supervisor denkt im Hintergrund weiter und kann korrigieren. | Python auf Basis von `livekit-agents`, LiveKit-WebRTC, VAD (Silero) → STT (Deepgram) → schnelles LLM (OpenAI) → TTS. Supervisor-Anbindung per LiveKit Data Channel, Protokoll auch in TypeScript (`@stimm/protocol`) | keine Messzahl; Projekt nennt `bridge_timeout` 1 s und Pre-TTS-Buffering (NONE, LOW, MEDIUM, HIGH) | MIT | Genau das Muster „fast/slow": der schnelle Pfad antwortet, der langsame steuert nach. Der Supervisor kann fertige Sätze nachschieben, ohne die erste Antwort zu blockieren. |
| Pydantic AI, Browser WebRTC | https://pydantic.dev/docs/ai/examples/realtime/realtime-webrtc | Der Browser tauscht Audio direkt per WebRTC mit dem Anbieter aus. Der Server ist nur Steuerungsebene und führt die Werkzeuge aus. | Browser ↔ OpenAI/Azure OpenAI Realtime per WebRTC (Medienweg); FastAPI beantwortet den SDP-Offer und hält eine „Sideband"-Session für Werkzeuge und Verlauf; Modell `openai:gpt-realtime`, Stimme `marin` | keine Zahl belegt; die Seite nennt WebRTC als „lowest latency" | Apache-2.0 (Pydantic AI) | „Server ist Control Plane, nicht Audio-Pfad". Der API-Key bleibt im Server, Werkzeuge laufen über den Control-WebSocket. |
| Moshi (Kyutai) | https://github.com/kyutai-labs/moshi | Speech-to-Speech-Grundmodell für vollduplex Gespräche. Kein STT/LLM/TTS-Bauklotz, sondern ein Modell, das direkt Sprache erzeugt. | Mimi als Streaming-Audiocodec (24 kHz, 12,5 Hz, 1,1 kbps, 80 ms Frame), 7B Temporal Transformer plus Depth Transformer; drei Stacks: PyTorch, MLX (On-Device), Rust (Produktion); Web-UI-Client im Repo; Gradio-WebRTC-Demo | 160 ms theoretisch (80 ms Mimi-Frame plus 80 ms akustische Verzögerung), praktisch bis 200 ms auf einer L4-GPU | Code MIT (Python), Apache 2.0 (Rust-Backend), Client MIT; Gewichte CC-BY 4.0 | Ende-zu-Ende statt Kaskade: das spart die Latenz der getrennten Glieder. Der Demo-Tunnel nach USA kostet laut Repo bis 500 ms extra aus Europa. |
| Hume EVI | https://www.hume.ai/blog/announcing-evi-3-api | Speech-to-Speech-Modell für Echtzeit-Stimme. EVI erzeugt die erste Antwort, ein zweites LLM übernimmt den Rest, sobald es fertig ist. | Speech-Language-Modell, Textantwort optional über Partner-LLMs (Anthropic, OpenAI, Google, Fireworks), WebSocket-Sitzungen; Prosodie-Modell für End-of-Turn-Erkennung | rund 300 ms als Zielvorgabe für „conversational latency", im Blog als Anforderung formuliert, nicht als Messung | kommerziell | Rollentrennung Interface/Agent/Worker: das Interface muss in Gesprächslatenz antworten, Agenten und Worker laufen langsamer. Genau die Drei-Ebenen-Logik der Skizze. |
| Cloudflare Voice Agent | https://developers.cloudflare.com/agents/examples/voice-agent/ | Sprachagent auf Workers: zuhören, mit LLM denken, sprechen. Alles in Echtzeit über WebSocket. | `agents` SDK mit `withVoice`-Mixin, Durable Object je Agent, Workers AI Flux STT und Workers AI TTS, AI SDK `streamText`, WebSocket, React-Client mit `useVoiceAgent`; Status `idle → listening → thinking → speaking`; austauschbar gegen Deepgram STT und ElevenLabs TTS; Doku-Stand Beta | keine festen Zahlen; der Client liefert `metrics.llm_ms`, `metrics.tts_ms`, `metrics.first_audio_ms` | Cloudflare-Paket (`agents`), Lizenz der geklonten Pakete `unbelegt` | Fertige Voice-Pipeline auf genau unserer Zielplattform. Satzweises Chunking des LLM-Streams in TTS, dazu sichtbare Zustände für die Augen-Animation. |

## Gruppe 3 — Generative Oberflächen

| Name | URL | Was es tut | Technischer Stack | Latenz | Lizenz | Was wir übernehmen könnten |
|---|---|---|---|---|---|---|
| Vercel AI SDK, Generative UI | https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces | Das Modell ruft ein Tool auf, das Ergebnis wird an eine React-Komponente gebunden. Die Oberfläche entsteht zur Laufzeit aus dem Tool-Ergebnis. | TypeScript, `ai` und `@ai-sdk/react`, `useChat`, `streamText` und `createUIMessageStreamResponse`, Tool-Teile mit Zuständen `input-available`, `output-available`, `output-error`; neu `json-render` | keine Zahl belegt | Apache-2.0 (AI SDK) | Agent an UI über Tool-Ergebnisse, nicht über HTML. Die Oberfläche wird aus Daten gebaut, der Renderer entscheidet. |
| A2UI | https://github.com/google/A2UI | Offenes generatives UI-Protokoll. Agenten streamen Layout-Daten, die App rendert sie mit nativen Widgets. | Protokoll als Daten statt Code, Schema-Validierung, Agent-SDKs (Python, TypeScript, Dart, Swift), Renderer für React, Angular, Lit, Flutter, SwiftUI, Jetpack Compose, Anbindung an A2A, ADK und MCP-Katalog | keine Zahl belegt; das Protokoll ist auf Streaming und schrittweises Darstellen ausgelegt | Apache 2.0 | Der Agent darf die Oberfläche nicht beliebig umschreiben, nur aus einem Katalog wählen. Passt zur Begrenzung „max 3" in der Skizze. |
| json-render | https://json-render.dev | Framework für generative Oberflächen: AI erzeugt JSON, gerendert wird in der App. Drei Schritte: Katalog definieren, AI erzeugt JSON im Katalog, React rendert streaming. | `@json-render/core` und `@json-render/react`, Katalog aus 41 Komponenten und 6 Aktionen, Zwei-Weichen-Bindung über `$bindState`, progressive Darstellung während des Streams, Export als eigenständiger React-Code | keine Zahl belegt | Vercel OSS | Katalog als Sicherheitsgrenze und als Bedienoberfläche zugleich. Der Katalog enthält eine `Slider`-Komponente mit `min`, `max`, `step` und Zwei-Weichen-Bindung. |

## Gruppe 4 — Front-Agent plus Hintergrund-Agenten

| Name | URL | Was es tut | Technischer Stack | Latenz | Lizenz | Was wir übernehmen könnten |
|---|---|---|---|---|---|---|
| Cloudflare Agents SDK | https://developers.cloudflare.com/agents/ | Jeder Agent ist eine Durable Object mit eigener Identität, lokalem SQL-Zustand, Echtzeit-Verbindungen und geplanten Aufgaben. Ein Harness führt die Agent-Schleife aus. | Durable Objects je Agent; Lifecycle mit Capabilities WebSockets, State, Scheduler, MCPClientManager; Harnesses (Pi, OpenCode, Think); Tools (Workspace, Sandbox, Browser, Web fetch, Web search, MCP, AI Search, Payments); Kanäle Chat, Voice, Email, Slack, Webhooks; Modelle über Workers AI und AI SDK | keine Zahl belegt | Cloudflare-Framework, Lizenz der geklonten Pakete `unbelegt` | Zustand gehört dem Agenten, nicht dem Browser. WebSockets für den Live-Sync, Scheduler für das Nachliefern des langsamen Pfads. |
| Cloudflare Agentic Patterns | https://developers.cloudflare.com/agents/patterns | Offizielle Muster auf Cloudflare: Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer. | TypeScript, AI SDK (`@ai-sdk/openai`), Durable Objects; das Routing-Beispiel wählt je nach Komplexität `gpt-4o-mini` oder `o1-mini`, Orchestrator-Worker nutzt `o1` plus `gpt-4o` pro Worker | keine Zahl belegt | Cloudflare-Doku, Lizenz der Beispiele `unbelegt` | Kleines Modell für einfache Fälle, großes für den Rest: das Routing-Beispiel ist die Skizze in Code. Die Worker sind unsere Analysing- und Looking-up-Agenten. |
| LangChain Deep Agents, async subagents | https://docs.langchain.com/oss/python/deepagents/async-subagents | Der Supervisor startet Hintergrundaufgaben und redet weiter. Fünf Werkzeuge steuern sie: `start_async_task`, `check_async_task`, `update_async_task`, `cancel_async_task`, `list_async_tasks`. | Python und JavaScript; Agent Protocol als Schnittstelle, ASGI-Transport (co-deployed, ohne Netzlatenz) oder HTTP-Transport zu einem entfernten Server; `mode` `isolated` oder `fork`; `update_strategy` `interrupt` oder `enqueue`; Task-Metadaten im eigenen Zustandskanal `async_tasks`; Webhook bei Laufende | keine Zahl belegt | LangChain Open Source, Lizenz der genannten Pakete `unbelegt` | Der Supervisor bleibt ansprechbar, während die Arbeit läuft. `update_async_task` ist die Korrektur, die Stimm als `instruct()` gelöst hat. Der eigene Zustandskanal verhindert, dass Task-IDs bei Kontext-Kompaktierung verloren gehen. |
| LangChain, „Agents Are Going Async" | https://www.langchain.com/blog/agents-are-going-async | Analyse des Musters: ein Agent bleibt beim Menschen, Background-Worker machen die lange Arbeit. | Blogbeitrag vom 5.11.2026, Deep Agents, Managed Deep Agents; genannt werden Claude Code, OpenAI dots, DeepSeek Harness als weitere Beispiele für dasselbe Muster | keine Zahl belegt | Blog, kein Code | Das Muster ist keine Eigenlösung, sondern Branchenstandard. Das spricht für die Grundentscheidung der Skizze, nicht für ein Detail. |
| Stimm (Dual-Agent) | https://github.com/stimm-ai/stimm | VoiceAgent führt den Live-Turn, Supervisor analysiert das Transkript asynchron und steuert. | LiveKit Data Channel für typisierte Protokollnachrichten, Python und TypeScript, Modi `autonomous`, `relay`, `hybrid` (Default: erste Antwort autonom, danach Supervisor-Korrektur) | keine Messzahl | MIT | Zwei Töne in einem Protokoll: schnell/schnell und langsam/langsam. Der Bridge-Stil übersetzt Wartezeit in einen kurzen gesprochenen Satz. |
| Hume EVI (Interface, Agent, Worker) | https://www.hume.ai/blog/announcing-evi-3-api | Hume beschreibt drei Rollen von Modellen: Interface, Agent, Worker. Das Interface antwortet schnell, Agenten suchen und rechnen, Worker lösen lange Denkketten. | Speech-Language-Modell als Interface, Partner-LLMs als Agenten, RAG und eigene Systeme als Worker; EVI 3 erzeugt die erste Antwort und übergibt den Rest, sobald das andere System fertig ist | rund 300 ms Zielvorgabe für das Interface, im Blog als Anforderung formuliert | kommerziell | Die slow-Path-Ergebnisse laufen in derselben Antwort nach, statt eine neue Runde zu brauchen. Das ist die Form von „no latency!" aus der Skizze. |
| OpenAI Agents SDK | https://openai.github.io/openai-agents-python/multi_agent | Zwei Orchestrierungsarten: per LLM oder per Code. Muster „Agents as tools" und „Handoffs". | Python und TypeScript, `Agent.as_tool()`, Handoffs als Werkzeug, Planen per Code über strukturierte Outputs, parallele Agenten über `asyncio.gather` | keine Zahl belegt | OpenAI SDK, Lizenz `unbelegt` | „Agents as tools": ein Manager behält die Antworthoheit, Spezialisten liefern Bausteine. „Handoffs": Übergabe, wenn der Spezialist direkt antworten soll. |

## Latenz

Alle gefundenen Zahlen, mit Quelle und Messbedingung.

| Zahl | Wo | Messbedingung | Quelle |
|---|---|---|---|
| 160 ms theoretisch, 200 ms praktisch | Moshi | Theoretische Latenz aus 80 ms Mimi-Frame plus 80 ms akustischer Verzögerung; praktisch als untere Schranke auf einer L4-GPU. End-to-End-Speech-to-Speech, also ohne getrennte STT- und TTS-Stufen. | https://github.com/kyutai-labs/moshi · https://arxiv.org/abs/2410.00037 |
| bis 500 ms zusätzlich | Moshi | Bedingung des Demo-Tunnels: Der Gradio-Tunnel läuft über die USA und kann aus Europa bis 500 ms Latenz dazufügen. Keine Modell-, sondern Transportlatenz. | https://github.com/kyutai-labs/moshi |
| 500 ms Verzögerung, 125 ms mit „flush trick" | Kyutai STT | `kyutai/stt-1b-en_fr` transkribiert Wörter 500 ms nach dem Sprechen; `kyutai/stt-2.6b-en` hat 2,5 s Verzögerung. Der „flush trick" nutzt aus, dass der Server mit rund 4× Echtzeit verarbeitet, und senkt die Wartezeit auf etwa 125 ms. | https://kyutai.org/stt |
| 500–800 ms | Pipecat | Kompletter Round-Trip einer typischen Sprachkonversation: Transport → STT → LLM → TTS → Transport. Anbieter frei wählbar, kein fester Messaufbau, keine Angabe zu Netz oder Gerät. | https://docs.pipecat.ai/pipecat/get-started/introduction.md |
| rund 500 ms Time-to-First-Byte, 800 ms Ziel | OpenAI Realtime API | Beobachtung von Kwindla Hultman Kramer (Daily.co, Autor des Pipecat-Artikels, von OpenAI-Mitarbeitern geprüft) für Clients in den USA. Das 800-ms-Ziel ist die Voice-to-Voice-Marke, gemessen vom Ende der Nutzerstimme bis zum Beginn der Agentenstimme im Audio-Editor. | https://www.latent.space/p/realtime-api |
| 500 ms Standard-Stillezeit | OpenAI Realtime API, VAD | `silence_duration_ms` steht standardmäßig auf 500 ms: so lange wartet die serverseitige VAD, bevor die Inferenz startet. Latent Space rät, bei normaler Sprach-KI nicht darunter zu gehen. | https://www.latent.space/p/realtime-api |
| mehrere hundert Millisekunden | Bluetooth-Audiogeräte | Latent Space nennt Bluetooth-Headsets als Beispiel für Zuschlag, der leicht übersehen wird. | https://www.latent.space/p/realtime-api |
| rund 300 ms | Hume EVI | Zielvorgabe für „conversational latency" der Interface-Modelle, im Blog als Anforderung formuliert, nicht als gemessener Wert. | https://www.hume.ai/blog/announcing-evi-3-api |
| 1 s | Stimm | `bridge_timeout`: ohne Bridge-Text innerhalb dieser Zeit schweigt die Stimme. Interne Timeout-Konstante, keine Latenzmessung. | https://github.com/stimm-ai/stimm |
| unter 800 ms (Zielwert) | Multi-Voice-Agent | Latenzsonde „user transcript → TTS start", im Repo als Ziel gesetzt, keine Messung veröffentlicht. Stack: LiveKit plus Pipecat. | https://github.com/praneethhh18/Multi-Voice-Agent |
| keine Zahlen, aber Messpunkte | Cloudflare Voice Agent | Der React-Client liefert `llm_ms`, `tts_ms` und `first_audio_ms`. Die Doku nennt keine Werte. | https://developers.cloudflare.com/agents/examples/voice-agent/ |

## Nicht gefunden

- **Keine belegte Latenzzahl** für LiveKit Agents, Stimm, Pydantic AI, A2UI, json-render, Open WebUI, Navless, Docket, die Cloudflare-Docs und die OpenAI-Docs. Diese Seiten nennen keine Zahlen.
- **Kein belegter Stack** für Docket Frameless und Navless. Beide sind geschlossene Produkte; Transport, Modelle und Hosting stehen nirgends.
- **Kein Fund, bei dem der Agent die Seite selbst zur Laufzeit umfärbt.** Die gefundenen generativen Oberflächen wählen Komponenten aus einem Katalog (json-render, A2UI) oder bauen einzelne Bausteine aus Tool-Ergebnissen (Vercel AI SDK). Eine Live-Umfärbung der eigenen Seite (Farbe, Form, Ausgabeart über Regler) wurde nicht belegt. Nächster Kandidat: der `Slider`-Baustein im json-render-Katalog.
- **Hume EVI: Doku nicht mehr abrufbar.** `dev.hume.ai/docs/speech-to-speech-evi/overview.md` leitet auf die Audio-Decisions-API um. Der Blogbeitrag ist noch da. Eine Ankündigung zur Abschaltung von TTS und EVI war nur in einer Suchvorschau sichtbar, nicht auf einer abgerufenen Seite, also `unbelegt`.
- **Ein Latenzartikel war nicht abrufbar.** `speko.ai/blog/cutting-voice-agent-latency` antwortete mit 404. Die dort genannten Zahlen (unter anderem p50/p90/p95 für `gpt-realtime`) sind deshalb `unbelegt` und nicht in die Tabelle übernommen.
- **Nicht abgerufen** (Zeitbudget dieses Laufs): Google Gemini Live API, Amazon Nova Sonic, Twilio ConversationRelay, Agora Conversational AI, Vapi, Retell, Bland, Cartesia Sonic, Deepgram Flux, ElevenLabs Conversational AI, Sesame CSM, CopilotKit und assistant-ui. Für diese Namen liegt in diesem Lauf keine belegte Aussage vor.

## Quellen

Alle in diesem Lauf abgerufenen URLs:

- https://www.docket.io/blog/designing-docket-frameless
- https://guide.navless.ai/answers/landing-pages-were-built-for-a-buyer-who-doesnt-exist-anymore
- https://github.com/open-webui/open-webui
- https://docs.livekit.io/agents/overview
- https://docs.pipecat.ai/
- https://docs.pipecat.ai/pipecat/get-started/introduction.md
- https://github.com/stimm-ai/stimm
- https://pydantic.dev/docs/ai/examples/realtime/realtime-webrtc
- https://github.com/kyutai-labs/moshi
- https://arxiv.org/abs/2410.00037
- https://kyutai.org/stt
- https://www.hume.ai/blog/announcing-evi-3-api
- https://dev.hume.ai/docs/speech-to-speech-evi/overview.md (Weiterleitung auf die Audio-Decisions-API)
- https://developers.cloudflare.com/agents/examples/voice-agent/
- https://developers.cloudflare.com/agents/
- https://developers.cloudflare.com/agents/patterns
- https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
- https://github.com/google/A2UI
- https://json-render.dev
- https://docs.langchain.com/oss/python/deepagents/async-subagents
- https://www.langchain.com/blog/agents-are-going-async
- https://openai.github.io/openai-agents-python/multi_agent
- https://github.com/praneethhh18/Multi-Voice-Agent
- https://www.latent.space/p/realtime-api

Nicht abrufbar (404): https://speko.ai/blog/cutting-voice-agent-latency
