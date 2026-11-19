# Graph Report - Agent  (2026-11-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 130 nodes · 128 edges · 28 communities (9 shown, 19 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.79)
- Token cost: 6,927 input · 17,264 output

## Graph Freshness
- Built from commit: `6bdc3a62`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Front-Agent
- Agentfähig
- Konkurrenz Recherche
- validate.yml
- README.md
- Upstream Search Document
- Notion README Status Document
- Agentfähig Agent Concept
- Hai Interaction und Design
- Research README Document
- validate.sh
- Samuel (Owner)
- cloudflare/agents
- Claude Skills Graphify Directory
- Graphify Cloud Service
- Kimi/Moonshot Backend Service
- Agent Introduction Sketch
- Block Introduction Sketch
- diagram
- diagram
- screenshot
- screenshot
- Agent Architecture Sketch
- Meta & Philosophy Sketch
- Steps & Research Sketch
- Technology & Outlook Sketch
- Application Code README
- Verhaltenstests README

## God Nodes (most connected - your core abstractions)
1. `Agentfähig` - 11 edges
2. `Konkurrenz Recherche` - 11 edges
3. `Notion README Status Document` - 11 edges
4. `Upstream Search Document` - 10 edges
5. `Agentfähig Agent Concept` - 7 edges
6. `Front-Agent` - 6 edges
7. `Voice Pipeline` - 5 edges
8. `Cloudflare Bausteine Research` - 5 edges
9. `Agentfähig Sketch Document` - 5 edges
10. `on` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Notion README Status Document` --references--> `Agentfaehig Sketch PDF`  [EXTRACTED]
  notion/README.md → sketches/2026-11-12-agentfaehig.pdf
- `Cloudflare Bausteine Brief` --references--> `Hai Interaction und Design`  [EXTRACTED]
  tech/briefs/cloudflare-bausteine.md → sketches/blocks/06-hai-interaction-und-design.png
- `Technische Konkurrenz-Recherche Brief` --references--> `Hai Interaction und Design`  [EXTRACTED]
  tech/briefs/konkurrenz.md → sketches/blocks/06-hai-interaction-und-design.png
- `Front-Agent` --calls--> `Analysing Agent`  [EXTRACTED]
  tech/CLOUDFLARE_MACHBARKEIT.md → sketches/2026-11-12-agentfaehig.md
- `Front-Agent` --calls--> `Backup Agent`  [EXTRACTED]
  tech/CLOUDFLARE_MACHBARKEIT.md → sketches/2026-11-12-agentfaehig.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design vs Technical Feasibility Comparison** — tech_abgleich, docs_design_decisions_ref, docs_project_ref, research_scout_synthesis_ref, cloudflare_machbarkeit_ref [EXTRACTED 0.90]
- **Implementation Tech Stack Targets** — cloudflare_agent_sdk, css_implementation_target [EXTRACTED 0.90]
- **Agent Architecture Flow** — front_man_agent, analysing_agent, looking_up_agent, backup_agent [EXTRACTED 0.95]
- **Multi-Agent Kommunikationsmuster** — tech_cloudflare_machbarkeit_front_agent, analysing_agent, looking_up_agent, backup_agent [EXTRACTED 1.00]
- **Generative UI Ansätze** — vercel_ai_sdk, json_render, a2ui [EXTRACTED 1.00]
- **Graphify Upstream Candidate Evaluation** — graphify_labs_graphify, lucasrosati_claude_code_memory_setup, tttrz_graphify_rs, foambubble_foam [EXTRACTED 1.00]
- **Notion Project Context Pages** — hai_agenten_architektur_page, projekte_db, gedanken_ideen_1, gedanken_ideen_2, mensch_heute_page, tp_control_center_hub, tasks_db [EXTRACTED 1.00]
- **Upstream Kandidaten für Agentfähig** — tech_upstream_search_cloudflare_agents_repo, tech_upstream_search_voice_agent_example, tech_upstream_search_json_render [EXTRACTED 1.00]
- **Voice Pipeline Komponenten** — cloudflare_agents_sdk, workers_ai, stt_models, tts_models [EXTRACTED 1.00]
- **Design Philosophy & Interaction Cluster** — h_ai_interaction_design, ui_sliders_component, pathways_routing [INFERRED 0.75]
- **Graphify Generation Artifacts** — graph_html, graph_report_md, graph_json [INFERRED 0.75]
- **Async Agent Implementierungen** — stimm, langchain_deep_agents, openai_agents_sdk [INFERRED 0.80]
- **Latenzkritische Infrastruktur** — workers_ai, tech_cloudflare_machbarkeit_agents_sdk, tech_cloudflare_machbarkeit_latenz_budget [INFERRED 0.80]

## Communities (28 total, 19 thin omitted)

### Community 0 - "Front-Agent"
Cohesion: 0.16
Nodes (16): Analysing Agent, Backup Agent, Cloudflare Agents SDK, Durable Objects, Front Man Agent, Looking Up Agent, Pipecat, RealtimeKit (+8 more)

### Community 1 - "Agentfähig"
Cohesion: 0.13
Nodes (15): Agentfähig, Agents SDK, Cloudflare Plattform, Latenzbudget (<1s), Zustands-Synchronisation, T1: Eingang voice/text/picture, T2: unter 1 sec even with TTS, T3: Front man Agent → drei Agenten (+7 more)

### Community 2 - "Konkurrenz Recherche"
Cohesion: 0.20
Nodes (14): A2UI, Async Agent Pattern, Generative UI, Hume EVI, json-render, LangChain Deep Agents, Latenzziel 800ms, LiveKit Agents (+6 more)

### Community 3 - "validate.yml"
Cohesion: 0.14
Nodes (13): jobs, validate, name, on, pull_request, push, workflow_dispatch, permissions (+5 more)

### Community 4 - "README.md"
Cohesion: 0.29
Nodes (7): Cloudflare Feasibility Document, Design Decisions Document, Project Document, Scout Synthesis Research, Agentfähig Sketch Document, Grilling Skill, Design vs Tech Comparison

### Community 5 - "Upstream Search Document"
Cohesion: 0.18
Nodes (13): AGENTS.md Configuration File, Foambubble Foam Repository, Graph HTML Output, Graph JSON Querybar Data, Graph Report Markdown, Graphify CLI Tool, Graphify-Labs/Graphify Repository, Graphifyy PyPI Package (+5 more)

### Community 6 - "Notion README Status Document"
Cohesion: 0.20
Nodes (12): Gedanken IDEEN Page 1, Gedanken IDEEN Page 2, HAI Agent Architecture Page, MCP Server Notion Connector, Mensch Heute Page, Notion README Status Document, Projects Database, Agentfaehig Sketch PDF (+4 more)

### Community 7 - "Agentfähig Agent Concept"
Cohesion: 0.29
Nodes (7): Agentfähig Agent Concept, Cloudflare Agent SDK, CSS / Design System, HAI Interaction Design Philosophy, Pathways Routing Mechanism, UI Sliders Configuration, User Input Channels

### Community 8 - "Hai Interaction und Design"
Cohesion: 0.67
Nodes (3): Hai Interaction und Design, Cloudflare Bausteine Brief, Technische Konkurrenz-Recherche Brief

## Knowledge Gaps
- **66 isolated node(s):** `RealtimeKit`, `Realtime SFU`, `STT Modelle`, `WebSocket Transport`, `TTS Modelle` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 76 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Konkurrenz Recherche` connect `Konkurrenz Recherche` to `Front-Agent`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `RealtimeKit`, `Realtime SFU`, `STT Modelle` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agentfähig` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Why does `Pipecat` connect `Front-Agent` to `Konkurrenz Recherche`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `validate.yml` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._