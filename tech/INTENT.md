# Agentfähig — technischer Intent

Stand: 12.11.2026 · HAI-Mission `M-20261112T230610-fd237a98` · Orchestrator: Claude (`claude-orchestrator-tech`)

Grundlage ist die Skizze [`sketches/2026-11-12-agentfaehig.md`](../sketches/2026-11-12-agentfaehig.md).
Design und Requirements kommen vom Owner (anderer Rechner, wird gepusht) und
sind hier **nicht** Thema.

## Intent

Klären, ob und wie „Not a website — an Agent itself" auf Cloudflare gebaut
werden kann, und wie die Teile am Ende zusammenhängen. Ergebnis ist eine
Machbarkeitsdefinition, kein Code.

## Was die Skizze technisch verlangt

| Nr. | Anforderung aus der Skizze | Technische Frage |
|---|---|---|
| T1 | Eingang `voice`, `text`, `picture` | Welche Cloudflare-Bausteine nehmen Audio, Text und Bild an (STT, Vision)? |
| T2 | „under 1 sec even with TTS", „no latency!" | Latenzbudget: Transport + STT + LLM (erstes Token) + TTS (erstes Audio). Wo geht die Zeit hin? |
| T3 | Front man Agent → Analysing / Looking up / Backup | Wie reden Agenten untereinander (Durable Objects, RPC, Sub-Agenten, Queues)? Wer hält den Zustand? |
| T4 | `fast / slow` | Schneller Front-Pfad (kleines Modell am Edge) neben langsamem Pfad (größeres Modell, Suche). Wie wird das Ergebnis nachgereicht? |
| T5 | Sliders mit „real time effects", Agent fragt nach `colour / form / output style` | Zustand Agent ↔ Browser in Echtzeit synchron (WebSocket, State-Sync). Agent verändert das Aussehen der Seite. |
| T6 | Augen, „on wind", „Connect effect", „popups move" | Reines Frontend (CSS/Canvas). Technisch nur: Welche Ereignisse liefert der Agent dafür (Zuhören, Denken, Sprechen)? |
| T7 | `Pathways`: for website / person / team / company | Ein Agent pro Besucher oder pro Mandant? Adressierung und Isolation. |
| T8 | `plaud thoughts →`, „philosophy of HAI" | Wissensquelle für den Looking-up-Agenten (Vectorize / AI Search / statische `llms.txt`). |
| T9 | `⟨Pay⟩` (unsichere Lesart) | Nur notieren, ob Cloudflare dafür etwas hat. Nicht vertiefen. |

## Rahmenbedingungen

- **Plattform:** Cloudflare. Andockpunkt im Stack ist `claudeflareworkerhaus`
  (11 Worker, SQLite-Durable-Objects, Workers AI) und die Site
  `human-agent-interface`. Beide bleiben in dieser Mission unangetastet.
- **Kein eigener Code.** Upstream zuerst: `tech/UPSTREAM_SEARCH.md` mit
  mindestens drei Kandidaten ist Pflicht, bevor irgendetwas gebaut wird.
- **Jede Aussage mit Quelle** (URL, abgerufen am 12.11.2026). Was nicht belegt
  ist, steht als `unbelegt` da.
- **Schreibbereich:** nur `tech/`.

## Arbeitsteilung

| Wer | Auftrag | Liefert |
|---|---|---|
| Owner | Design und Requirements | Push ins Repo |
| MiniMax M3.1 Flash (OpenCode, frei) | Technische Konkurrenz: Wer baut Agent-statt-Website, Voice-Agenten, generative Oberflächen — mit welchem Stack und welcher Latenz? | `tech/research/konkurrenz.md` |
| GLM 5.3 Flash (OpenCode, frei) | Cloudflare-Bausteine und Upstream-Repos zu T1–T9 | `tech/research/cloudflare-bausteine.md` |
| Claude | Briefs, Stichprobenprüfung der Quellen, Verdichtung | `tech/UPSTREAM_SEARCH.md`, `tech/CLOUDFLARE_MACHBARKEIT.md` |

Briefs der beiden Worker liegen in [`briefs/`](briefs/).

## Wo es zusammenläuft

`tech/CLOUDFLARE_MACHBARKEIT.md`: ein Verdrahtungsbild, das Latenzbudget, je
Baustein ein Urteil (machbar / unklar / nicht machbar) und die offenen Risiken.
Sobald die Requirements des Owners da sind, werden sie gegen T1–T9 gelegt.
