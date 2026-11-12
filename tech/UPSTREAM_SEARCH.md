# UPSTREAM_SEARCH — Agentfähig auf Cloudflare

Stand: 12.11.2026 · HAI-Mission `M-20261112T230610-fd237a98` · Vertrag: `03_HAI/docs/UPSTREAM_FIRST_GATE.md`

## Need

Ein Agent als Startseite: Stimme, Text und Bild als Eingang, ein schneller
Front-Agent mit nachgelagerten Agenten, Zustand in Echtzeit im Browser — auf
Cloudflare, ohne eigenen Feature-Code.

## Kandidaten

Lizenz, letzter Push und Status am 12.11.2026 über die GitHub-API geprüft.

| # | Repo | Lizenz | Letzter Push | Deckt ab | Andock-Idee | Verdict |
|---|---|---|---|---|---|---|
| 1 | [cloudflare/agents](https://github.com/cloudflare/agents) — Beispiele `voice-agent`, `voice-input`, `agents-as-tools` | MIT | 12.11.2026 | T1 Stimme und Text, T3 Sub-Agenten, T5 Zustands-Sync, T6 Zustände für die Animation, T7 ein Agent pro Besucher, T9 x402 | Beispiel `voice-agent` als Ausgangspunkt übernehmen; dockt über Durable Objects und Workers AI an dieselbe Plattform wie `claudeflareworkerhaus` | **use** |
| 2 | [cloudflare/agents-starter](https://github.com/cloudflare/agents-starter) | MIT | 19.08.2026 | Chat-Agent mit Werkzeugen, ohne Stimme | Nur als Vergleich für Projektaufbau und Deploy | reject — älter als das Voice-Beispiel in #1, deckt Stimme nicht ab |
| 3 | [vercel-labs/json-render](https://github.com/vercel-labs/json-render) | Apache-2.0 | 12.11.2026 | T5: Agent erzeugt JSON aus festem Komponentenkatalog, enthält laut Worker-Bericht einen `Slider`-Baustein | Renderer im Frontend; der Agent-Zustand aus #1 liefert das JSON | **use (Kandidat)** — erst entscheiden, wenn das Design steht; Slider-Baustein ist nur vom Worker belegt, nicht von mir geprüft |
| 4 | [a2ui-project/a2ui](https://github.com/a2ui-project/a2ui) | Apache-2.0 | 12.11.2026 | T5: Protokoll, mit dem Agenten Oberflächen aus einem Katalog streamen | Alternative zu #3 | reject vorerst — breiter als nötig (Flutter, SwiftUI, Compose); nur relevant, wenn mehr als Web gebraucht wird |
| 5 | [stimm-ai/stimm](https://github.com/stimm-ai/stimm) | MIT | 12.11.2026 | T4: schneller Sprach-Agent plus Supervisor im Hintergrund | Nur das Muster übernehmen | reject als Baustein — Python auf LiveKit, läuft nicht auf Workers; Muster zählt |
| 6 | [pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat) | BSD-2-Clause | 12.11.2026 | Sprach-Pipeline-Framework, Referenzwert 500–800 ms | Referenz für das Latenzbudget | reject als Baustein — Python, eigener Server nötig |
| 7 | [cloudflare/realtime-examples](https://github.com/cloudflare/realtime-examples) | **keine Lizenz angegeben** | 15.10.2026 | WebRTC über Cloudflare Realtime | Ausweichpfad, falls WebSocket die Latenz nicht hält | reject vorerst — Lizenz ungeklärt, vor Übernahme prüfen |
| 8 | [anomalyco/phonecall](https://github.com/anomalyco/phonecall) | MIT | 04.11.2026 | Telefon-Agent auf Cloudflare mit MCP | — | reject — Telefonie ist nicht gefragt |

## Decision

**Vorschlag: `cloudflare/agents`, Beispiel `examples/voice-agent`.** Die
Entscheidung liegt bei Samuel und ist nicht bestätigt (siehe `AGENTS.md`).
Es deckt sieben der neun technischen Fragen ab und ist der von Cloudflare
gepflegte Weg. Für die Regler-Oberfläche bleibt `json-render` als Kandidat
offen, bis das Design vorliegt.

Kein Eigenbau geplant. Was die Upstreams nicht abdecken (Augen, „on wind",
Connect-Effekt), ist Frontend-Gestaltung und gehört zum Design, nicht in diese
Suche.

## Installationsweg (noch nicht ausgeführt)

1. `git clone https://github.com/cloudflare/agents` in `05_INBOX`, Beispiel `examples/voice-agent` lokal mit `wrangler dev` starten.
2. Latenz messen (siehe `CLOUDFLARE_MACHBARKEIT.md`, Abschnitt „Nächster Schritt").
3. Erst bei bestandener Messung: Eintrag in `STACK.md` und `registry/components/`, Platz neben `claudeflareworkerhaus`.

Der Klon ist ein Eingriff, der installiert. Er braucht Plan-Modus und die
Freigabe des Owners und ist nicht Teil dieser Mission.

## Nicht gesucht

Konkurrenzprodukte ohne offenen Code (Docket, Navless, Hume) stehen in
[`research/konkurrenz.md`](research/konkurrenz.md); sie sind keine Upstreams.
