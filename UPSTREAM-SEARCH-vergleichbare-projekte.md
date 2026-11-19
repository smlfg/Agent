# UPSTREAM-SEARCH — Vergleichbare Projekte für Agentfähig

Stand: 19.11.2026 · Vertrag: `03_HAI/docs/UPSTREAM_FIRST_GATE.md` · Verfasser: MiniMax M3 (OpenCode)

## Need

Samuel ist kein erfahrener Entwickler. Vor dem Bau soll geklärt sein, **was
andere bereits gebaut haben**, das Agentfähig ähnelt — und was davon
übernehmbar ist, statt es selbst zu bauen. Gesucht sind zwei Sorten:

- **Produkt-Vergleiche:** Projekte, die dasselbe Ziel verfolgen (die Website
  *ist* der Agent, Stimme, Echtzeit-Zustand, Agent verändert die Seite).
- **Baustein-Vergleiche:** Projekte, die einzelne Stücke liefern, die Agentfähig
  braucht (Voice-Pipeline, Echtzeit-Oberfläche, animiertes Gesicht, Zustands-Sync).

Der Upstream-Search für die Cloudflare-Plattform steht getrennt in
[`tech/UPSTREAM-SEARCH-cloudflare.md`](tech/UPSTREAM-SEARCH-cloudflare.md).
Dieses Dokument fragt **nicht** nach Cloudflare-Bausteinen, sondern nach dem,
was andere Produkte gebaut haben.

## Prüfmethode und Beleglage

- Lizenz und Dateiinhalt am 19.11.2026 über die GitHub-API des angemeldeten
  Kontos (`smlfg`) geprüft, nicht über Websuche geschätzt.
- Lizenzangaben stammen aus der Datei `LICENSE` im jeweiligen Repository.
- **Kein Kandidat wurde geklont oder ausgeführt.** Alle Aussagen zu
  Architektur und Funktionsumfang stammen aus `README.md`, `docs/` und
  Quellverzeichnissen der Repos. Aussagen über Latenz, Produktionsreife und
  Nutzerzahlen sind **nicht** belegt und unten als solche markiert.
- Lizenz der GitHub-API ist ratelimitiert; bei 403 wurde auf das MCP-Werkzeug
  `get_file_contents` ausgewichen, das mit Token arbeitet.

## Produkt-Vergleiche

### 1. Pika Labs — Generative UI (Höhepunkt)

| | |
|---|---|
| Repo | [Pika-Labs/Pika-Experiments](https://github.com/Pika-Labs/Pika-Experiments), Ordner `generative-ui/` |
| Lizenz | **Apache-2.0** (Datei `LICENSE` im Repo-Root geprüft) |
| Sprache | JavaScript, ~3.700 Zeilen, **null Abhängigkeiten**, kein Build-Schritt |
| Zweck | „A new way to interact with your AI agent using voice and generative UI." |

**Was es für Agentfähig liefert:**

- **Voice-Loop:** OpenAI Realtime (WebRTC) für Sprache rein und raus.
- **Generative Canvas:** Der Agent erzeugt während des Gesprächs live visuelles
  Layout — Moodboards, Dashboards, Folien, Vergleichstabellen. Das Layout-Historie
  ist navigierbar, Medien animieren zwischen Layouts.
- **Muster, das direkt passt:** „the agent listens, analyzes what's being
  discussed, and dynamically generates the most appropriate visual composition
  for each response." Das ist exakt die Idee aus der Skizze — der Agent fragt
  nach `colour · form · output style` und gestaltet die Seite live.

**Warum das der wichtigste Fund ist:** Die Skizze verlangt, dass der Agent die
Seite zur Laufzeit verändert. Der bestehende Upstream-Search fand dafür „keine
gefundene Vorlage" (siehe `tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md`, Risiken). **Das ist
jetzt überholt** — die Vorlage existiert, sie war nur nicht gefunden.

**Was davon nicht passt:** Verwendet OpenAI Realtime, nicht Cloudflare. Der
Muster-Teil (Agent erzeugt Layout) ist aber transportneutral: Der
Cloudflare-Agent könnte dasselbe über `setState` und ein Frontend-Baustein tun.

### 2. OpenVoiceUI — Voice-Shell mit Gesicht

| | |
|---|---|
| Repo | [MCERQUA/OpenVoiceUI](https://github.com/MCERQUA/OpenVoiceUI) |
| Lizenz | **MIT** (Datei `LICENSE` geprüft) |
| Architektur | Python-Flask-Server + Vanilla-JS-ES-Module im Browser, **kein Build-Schritt** |
| Zweck | „A browser-based, voice-first 'AI computer' for your own agent." |

**Was es für Agentfähig liefert:**

- **Ein animiertes Gesicht mit Präsenz** — Ordner `src/face/`:
  `BaseFace.js`, **`EyeFace.js`**, `HaloSmokeFace.js`, `FaceBench.js`, `manifest.json`.
  Die Datei `EyeFace.js` wurde gelesen. Sie kann:
  - zwei Augen mit **stimmungsabhängigen Lidanimationen** (`happy`, `sad`,
    `angry`, `thinking`, `surprised`, `listening`),
  - **Maus-verfolgende Pupillenbewegung**,
  - **autonomes Blinzeln und Umsehen**,
  - laufzeit-austauschbare Gesichter (`faceManager.register(...)`).
- **Provider-Schicht:** LLM, STT und TTS sind austauschbare Schnittstellen mit
  Registry und Fallback-Kette — direkt passend zur Frage „welches Modell, welche
  Stimme", die in `docs/PROJECT.md` noch offen ist.
- **Canvas-Seiten-System:** Der Agent schreibt echte HTML-Seiten, die versioniert
  in einem Manifest liegen und in einem Iframe gerendert werden.

**Warum das für Agentfähig relevant ist:** Die Skizze verlangt Augen, die nach
5 Sekunden aufwachen und „look at the user" tun. Das ist **keine
Erfindung** — es ist ein existierendes, austauschbares Bauteil mit ~200 Zeilen
JS. Der `EyeFace` ist unter MIT nutzbar.

**Abweichung:** Backend ist Flask/Python, nicht Cloudflare. Der Gesichtsteil ist
reines Frontend-JavaScript und damit **plattformneutral übernehmbar**.

### 3. Capturia — Agent erzeugt nur Oberfläche, keinen Text

| | |
|---|---|
| Repo | [AndresCarreonDiaz/capturia](https://github.com/AndresCarreonDiaz/capturia) |
| Lizenz | **MIT** (Datei `LICENSE` geprüft) |
| Zweck | „Broadcast-grade live video overlays composed by an AI agent, from voice or text, in under a second." |

**Was es für Agentfähig liefert:**

- Ein **radikales Muster gegen den Standard-Chat**: „The agent never replies in
  prose. Every utterance is either a tool call that changes the on-screen state,
  or silence."
- Genau die Interaktion, die in der Skizze steht: der Agent **fragt** und
  **verändert die Oberfläche** (unten: Overlays, Metrik-Panels, Sparklines,
  Zähler, Ticker-Bänder).
- Gebaut für die Generative-UI-Global-Hackathon, Mai 2026 — also ein
  Hackathon-Projekt mit direktem Ziel.

**Warum das als Muster zählt:** Es zeigt, dass „Agent verändert die Seite live"
in einem Jahr und mit einer Person gebaut wurde. Das senkt das Risiko in
`tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md` deutlich.

### 4. LiveKit — Generative UI per Voice (Thesys)

| | |
|---|---|
| Repo | [thesysdev/voice-agent-generativeui](https://github.com/thesysdev/voice-agent-generativeui) |
| Lizenz | **nicht als SPDX-Datei geprüft** — vor Übernahme klären |
| Architektur | Next.js-Frontend + LiveKit-Room, LiveKit-Voice-Agent in Node/TypeScript |

**Was es für Agentfähig liefert:** Voice-Agent, der per Tool-Call UI-Komponenten
streamt. Nützlich als **Referenz für die Frage „STT→LLM→TTS-Pipeline vs.
end-to-end-Sprachmodell"** — das Repo beschreibt beide Modi und benennt den
Latenz-Unterschied ausdrücklich.

**Verdict:** Als *Muster-Quelle* brauchbar, als *Baustein* nicht — die Lizenz
ist ungeklärt und es ist ein Next.js-Projekt mit kommerziellem Anbieter
(Thesys).

### 5. Qwen Audio Agent — Agent-Präsenz als Kern

| | |
|---|---|
| Repo | [QwenAudio/qwen-audio-agent](https://github.com/QwenAudio/qwen-audio-agent) |
| Lizenz | **Apache-2.0** (Datei `LICENSE` geprüft) |
| Papers | arXiv 2609.25195 (laut Repo-Badge) |

**Was es für Agentfähig liefert:** Das README stellt genau das Thema in den
Mittelpunkt, das Agentfähig auszeichnet:

> „Real conversation should not leave you waiting after a single sentence, nor
> should it grind to a halt just because the Agent is looking something up,
> calling a tool, or working on a task."

Das ist **fast wörtlich** der Fall, den die Skizze mit `fast / slow` und den
drei nachgelagerten Agenten beschreibt — und die Fähigkeit, während der
Nacharbeit weiterzusprechen, ist in `tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md` als offene
Frage T4 vermerkt.

**Verdict:** Als **Konzeptquelle für T4** wertvoll. Als Baustein: Node-Runtime,
anderes Modell-Ökosystem, Agent-Präsenz-Logik ist an deren Runtime gebunden.

## Baustein-Vergleiche (Plattformneutral)

| Baustein | Kandidat | Lizenz | Nutzbarkeit |
|---|---|---|---|
| Animierte Augen, Präsenz, Maus-Blick | `MCERQUA/OpenVoiceUI` → `src/face/EyeFace.js` | MIT | **hoch** — reines Frontend-JS, ~200 Zeilen, austauschbar |
| Agent erzeugt Oberfläche live | `Pika-Labs/Pika-Experiments` → `generative-ui/` | Apache-2.0 | **hoch** — Muster für Layout-Generierung |
| Agent ohne Prosa, nur Tool-Calls | `AndresCarreonDiaz/capturia` | MIT | **mittel** — Muster, andere Domäne (Video-Overlays) |
| Voice-Pipeline-Referenz (Pipeline vs. E2E) | `thesysdev/voice-agent-generativeui` | **ungeklärt** | **nur lesen** |
| Agent-Präsenz während Nacharbeit | `QwenAudio/qwen-audio-agent` | Apache-2.0 | **mittel** — Konzeptquelle |

## Decision

**Kein Eigenbau.** Für die drei Kernideen der Skizze gibt es jetzt Upstreams:

1. **Augen mit Präsenz** → `EyeFace.js` aus OpenVoiceUI (MIT). Direkt
   übernehmbar, plattformneutral.
2. **Agent verändert die Oberfläche live** → Muster aus Pika `generative-ui`
   (Apache-2.0). Das korrigiert die frühere Aussage „keine Vorlage gefunden".
3. **Agent redet weiter, während Sub-Agenten arbeiten** → Konzept aus
   `qwen-audio-agent` (Apache-2.0), beantwortet die offene Frage T4.

**Empfehlung an Samuel:** Die beiden Bausteine 1 und 3 sind klein und
lizenzlich sauber. Sie sind **kein Ersatz** für die Cloudflare-Entscheidung —
die bleibt davon unberührt — aber sie senken den Eigenbau-Anteil deutlich.

**Nicht entschieden.** Welche Kandidaten tatsächlich übernommen werden, ist eine
Entscheidung des Owners. Diese Suche liefert die Kandidaten und die Belege,
nicht die Entscheidung.

## Risiken, die aus dieser Suche folgen

- **Nur gelesen, nicht getestet.** Kein Kandidat wurde geklont, gestartet oder
  auf Deutsch geprüft. Das Verhalten in deutscher Sprache ist für alle
  Kandidaten **ungeprüft**.
- **Produktionsreife unbelegt.** Sternenzahlen, Nutzerzahlen und
  Latenzangaben wurden bewusst **nicht** übernommen, weil keine davon belegt
  ist. Das Projekt `capturia` nennt „in under a second" — das ist eine
  Eigenangabe des Projekts, keine geprüfte Messung.
- **Lizenz `thesysdev/voice-agent-generativeui` ungeklärt** — vor jeder
  Übernahme prüfen.
- **Hackerathon-Projekte** (`capturia`) sind von Natur aus Rohlinge. Muster ja,
  Produktionscode nein.

## Nicht gesucht

- Kommerzielle Produkte ohne offenen Code (Docket, Navless, Hume) — stehen in
  [`tech/research/konkurrenz.md`](tech/research/konkurrenz.md).
- Cloudflare-Bausteine selbst — siehe
  [`tech/UPSTREAM-SEARCH-cloudflare.md`](tech/UPSTREAM-SEARCH-cloudflare.md).
- Hosting- und Deployment-Anbieter für generative Oberflächen.

---

## Nachtrag vom 19.11.2026 — Argons Befunde

Ein unabhängiges Zweitgutachten (Argon/Gemini, über Samuel) hat die
Konkurrenzlage noch einmal geprüft und zwei Punkte ergänzt, die diese Suche
nicht abgedeckt hatte:

1. **`json-render` und A2UI rendern Standard-Karten aus JSON.** Sie stehen in
   dieser Suche als Kandidat für den Renderer (siehe
   [`tech/UPSTREAM-SEARCH-cloudflare.md`](tech/UPSTREAM-SEARCH-cloudflare.md)),
   sind aber **kein** Beispiel für die Kernidee: Der Agent verändert damit
   *Inhalte* in einem festen Katalog, nicht das *Aussehen und Verhalten* der
   Oberfläche. Die Lücke, die Agentfähig füllt, ist damit präziser als zuvor:
   **kein vorhandenes Vorbild verhandelt die eigene Präsenz mit dem Besucher.**
2. **Die „Theme-Switcher-Falle" hat keine Upstream-Lösung.** Die Designinspiration
   warnt, dass Farbwechsel „decoration, not adaptation" ist
   ([`Agentfähig/GreateWriting.txt`](Agentfähig/GreateWriting.txt), Z. 222).
   Kein gefundener Kandidat löst das — es ist eine bewusste Eigenbau-Stelle.
   Siehe [ADR-0004](docs/adr/ADR-0004-regler-veraendert-oberflaeche-und-haltung.md).

Beide Punkte ändern die Decision dieses Dokuments nicht: `EyeFace.js` (MIT) und
das Layout-Muster aus Pika (Apache-2.0) bleiben die Empfehlung. Sie schärfen
aber die Grenze zwischen „übernahmbar" und „muss selbst gebaut werden".

---

## Nachtrag 19.11.2026 — Reifegrad-Korrektur (Konflikt, keine Überschreibung)

**Status: Korrektur zur Owner-Prüfung. Die Decision oben bleibt unverändert.**
Quelle: [`research/PRIOR_ART_REPORT.md`](research/PRIOR_ART_REPORT.md), A6.

Der Satz oben „Für die drei Kernideen gibt es jetzt Upstreams … die Vorlage
existiert" ist für Pika **zu stark**. Am 19.11.2026 über die GitHub-API geprüft:

| Repo | Sterne | Letzter Push | Befund |
|---|---|---|---|
| `Pika-Labs/Pika-Experiments` (Apache-2.0) | 7 | 25.06.2026 | README: „Local-only prototype", ~3.700 Zeilen, null Abhängigkeiten |
| `AndresCarreonDiaz/capturia` (MIT) | 2 | 28.10.2026 | Hackathon-Rohling |

Wichtiger als die Zahlen: Die Layout-Erzeugung in Pika liegt **nicht im Repo**,
sondern im gehosteten **Pika MCP** (`mcp.pika.me`, Pika-Konto nötig). Das Repo
ist ein Canvas-Renderer plus OpenAI-Realtime-Client. Übernehmbar ist damit das
**Muster** („Agent wählt Layout passend zur Antwort"), nicht Code — genau so, wie
ADR-0003 es bereits einordnet.

**Konsequenz für die Empfehlung:** `EyeFace.js` bleibt der einzige echte
Code-Baustein aus dieser Suche. Die Aussage „keine Vorlage für die
Selbstveränderung" wird durch [`type0labs-dev/ui-morph`](https://github.com/type0labs-dev/ui-morph)
(PoC, 0 Sterne, MIT) relativiert: Dort existiert die Mechanik mit geschlossenem
Wortschatz und Seitengrenzen — aber ohne Gespräch als Wertequelle.

Keine Entscheidung aufgehoben; die Abweichung ist hier sichtbar dokumentiert.
