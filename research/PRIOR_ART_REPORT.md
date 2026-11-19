# PRIOR_ART_REPORT — Agentfähig

Stand: 19.11.2026 · Auftrag: technische Voruntersuchung „Was haben andere bereits
gelernt, gebaut oder verworfen?" · Kein Anwendungscode, keine Produktentscheidung.

> **Control Plane, sichtbar:** `hai_health` und `hai_status` sind erreichbar
> (`ok: true`), aber es läuft genau eine aktive Mission
> (T1-Messlauf, `M-20261119T194948-3db0ab44`), `remaining_writer_capacity: 0`,
> `authenticated_owner: false`. Für diese Recherche wurde **keine** neue Mission
> geöffnet. Dieser Bericht ist daher als **lesende Vorarbeit** zu behandeln, nicht
> als autorisierter Schreib-Slice. Er ändert keine bestehende Datei.
>
> **Parallelarbeit:** Im selben Arbeitsbaum arbeiten weitere Sessions und haben
> ADRs, `PLAN-STUFEN-0-5.md`, `MESSPROTOKOLL-2026-11-19.md` und `tech/EXECUTION_PLAN-M1-MESSLAUF.md`
> uncommittet verändert. Wo dieser Bericht daraus zitiert, ist es mit **[P]** und
> „Arbeitsbaum" markiert. Keine dieser Dateien wurde hier angefasst.
>
> **Abgrenzung zur parallelen Muster-Recherche:** Im Baum liegt außerdem
> `research/EMBODIMENT-RECHERCHE.md` (Muster zu Präsenz, Typografie, adaptiver
> Oberfläche). Überschneidung besteht bei den Bausteinen. Dieser Bericht
> beantwortet die andere Frage: **was übernehmen, was anpassen, was weglassen** —
> mit Lizenz, Reifegrad und Integrationskosten je Kandidat.

## Beleglage

| Kürzel | Bedeutung |
|---|---|
| **[A]** | Am Primärartefakt selbst geprüft: GitHub-API (Lizenz, Sterne, letzter Push), Dateiinhalt, Quellcode, Doku-Seite — heute gelesen. |
| **[B]** | Primärquelle vollständig gelesen (Blog, Paper, Architektur-Dokument), aber nicht ausgeführt. |
| **[C]** | Nur Metadaten, Abstract oder Suchsnippet — nicht im Volltext geprüft. |
| **[P]** | Projektintern: steht schon in diesem Repo, hier nicht neu belegt. |

**Nichts aus diesem Bericht wurde ausgeführt.** Kein Kandidat wurde geklont,
installiert oder gemessen. Alle Latenz- und Reifeaussagen sind fremde Aussagen
oder Metadaten, keine eigenen Messungen.

## Status der Erkenntnisse

| Status | Erkenntnis (Kurzform) | Beleg |
|---|---|---|
| **VERIFIED** | Turn-Metriken laufen auf der Worker-Uhr, überlappen, sind nicht additiv; `finalInputToFirstAudioMs` endet beim **gesendeten** Paket | `docs/agents/voice.md`, gelesen 19.11.2026 |
| **VERIFIED** | Zwei Wiedergabefehler (`#1747` Klicks, `#1816` Zeitlupe nach Pause) waren für Server-Metriken unsichtbar | PRs, GitHub-API |
| **VERIFIED** | `turn_metrics` ist im unveränderten Beispiel nicht erfassbar | `tech/MESSPROTOKOLL`, Laufversuch 2 (Arbeitsbaum) |
| **VERIFIED** | Pika erzeugt Layouts über einen gehosteten MCP, nicht im Repo; 7 Sterne, capturia 2 Sterne | README, GitHub-API |
| **VERIFIED** | `EyeFace.js` existiert (6.755 B, MIT), bringt keine Reduced-Motion-Behandlung mit | Datei + API |
| **VERIFIED** | qwen-audio-agent: `spawn_thinking` wartet nie, begrenzte Aufnahme, „safe duplex insertion window" | Architektur-Dokument |
| **VERIFIED** | WCAG 2.2.2 (A) verlangt Pause/Stop für automatisch bewegte Inhalte > 5 s; Reduced-Motion ersetzt das nicht | W3C |
| **VERIFIED** | Menschliche Turn-Abstände: Median ~100 ms, cross-linguistisch 0–300 ms | Stivers et al. 2009 |
| **VERIFIED** | Effekt verzögerter Antworten hängt von Vorerfahrung ab (Novizen positiv, Erfahrene negativ), N=202 | Gnewuch et al. 2022 |
| **VERIFIED** | In der VR-Studie (N=24) unterschieden sich Präsenzwerte nicht zuverlässig nach Augendesign | Frontiers 2026 |
| **RECOMMENDED** | Zwei Messnähte (Worker + Client), Gate auf die Client-Zahl, p90 | D1, `tech/MESSLAUF-PLAN.md` Nachtrag |
| **RECOMMENDED** | Geschlossener Wortschatz (≤ 3 Achsen, diskrete Werte, Werte statt CSS), Anwendung an Turn-Grenzen | D5, `ui-morph` |
| **RECOMMENDED** | Typewriter: `smoothStream` nutzen, Pulsierung im Browser | C3 |
| **RECOMMENDED** | Fast/Slow: `detached`-Mechanik + qwen-Vertrag | C5 |
| **RECOMMENDED** | Messlauf reproduzierbar machen (Commit, SDK-Version, effektive Modell-ID) | A2, Nachtrag |
| **RECOMMENDED** | Pause/Stop + Reduced-Motion als Teil von V1 | E3 |
| **HYPOTHESIS** | Ein Regler, der Aussehen *und* Haltung ändert, wird als Anpassung erlebt | kein Vorbild, nur Indizien |
| **HYPOTHESIS** | Stilisierte Augen erzeugen auf einer 2D-Seite Präsenz | VR-Studie nicht übertragbar |
| **HYPOTHESIS** | 5-s-Erwachen und pulsierendes Tempo wirken für das Zielpublikum | Zielgruppe offen |
| **HYPOTHESIS** | Deutsche Stimme über externen Provider bleibt im Budget | ungemessen, zweiter Hop |
| **REJECTED** | „Pika `generative-ui` ist eine übernehmbare Vorlage" | nur Muster; Orchestrierung im MCP |
| **REJECTED** | „`first_audio_ms` allein belegt unter 1 s beim Nutzer" | misst bis zum Versand |
| **REJECTED** | „json-render/A2UI werden für V1 gebraucht" | löst Katalog-Inhalte, nicht Aussehen |
| **REJECTED** | „Pika/capturia sind belastbare Produktionsreferenzen" | 7 bzw. 2 Sterne, Demo-Status |
| **REJECTED** | „Es gibt kein Vorbild für Agent-verändert-Seite" (als absolute Aussage) | `ui-morph` als PoC; Produktbehauptung bleibt |

## Wo davon bereits etwas im Projekt steht

Diese Datei ist der Belegtteil. Übernommen (durch andere Sessions, uncommittet)
in: `docs/UX-INFORMATIONSARCHITEKTUR.md` (Regeln R-H/R-I, Pika-Korrektur,
WCAG, Fremdtest-Methodik, Betriebsgrenze), `docs/PROJECT_CONTRACT.md`
(Change Requests CR-1/CR-2, Qualitätskriterien), `docs/PROJECT.md` (verweist
auf die UX-Datei), `tech/MESSLAUF-PLAN.md` (Nachtrag zur Messgröße),
`UPSTREAM-SEARCH-vergleichbare-projekte.md` (Reifegrad-Korrektur).
Nicht integriert und in den Warteschlangen geführt:
[`docs/UNSOLVED-TECHNIK.md`](../docs/UNSOLVED-TECHNIK.md) (Erfassungsweg U1, Zustandsmodell
U9/P4, Barrierefreiheit U11, Schwellenzeitpunkt R01) und
[`docs/UNSOLVED-PLANUNG.md`](../docs/UNSOLVED-PLANUNG.md) (Prior-Art-Ergänzungen
PA-1 bis PA-5: Messort des Voice-Gates, Pika-Herabstufung, Typewriter-Mechanik,
Zielgruppe, Fast/Slow-Vertrag).

---

## Kurzantwort

1. **Der Kern ist nicht neu, aber enger als gedacht.** „Agent verändert die
   Oberfläche" existiert als PoC mit genau der richtigen Sicherheitsgrenze
   (`ui-morph`: fünf erlaubte Operationen, nur an Seitengrenzen, Design-Tokens
   statt CSS). Das ist die belastbarste Vorlage — nicht Pika.
2. **Der wichtigste Fund ist ein Messfehler, kein Baustein.** Cloudflares
   `first_audio_ms` ist eine **Worker-Uhr** bis zum ersten gesendeten Audiopaket.
   Es misst nicht, wann der Besucher etwas hört. Das Gate aus ADR-0001 kann grün
   werden und trotzdem das Gegenteil belegen.
3. **Zwei dokumentierte Cloudflare-Bugs betreffen genau unseren Pfad:** stockende
   Wiedergabe nach Gesprächspause (`#1816`) und Klicks an Audiopaket-Grenzen
   (`#1747`). Beide waren für Server-Metriken unsichtbar.
4. **Für den Erstbau ist weniger Cloudflare nötig, nicht mehr.** Text-first,
   ein Regler, Augen, stille Sub-Agent-Ergebnisse: alles vorhanden. Voice,
   generative Layouts und semantische Turn-Erkennung sind eigene, spätere Risiken.
5. **Die stärkste Einschränkung ist ökonomisch.** Nach der projektinternen
   Rechnung sind auf dem Free-Kontingent ca. **18 komplette Voice-Wechsel pro Tag**
   möglich ([P], `tech/research/kosten-tts-voice.md`). Das ist eine Demo, keine
   Startseite.

---

## 0 · Projektverständnis (aus dem Repo, nicht erfunden)

**Problem.** Eine Website, die nicht über einen Agenten berichtet, sondern dessen
Zustand *ist*: Präsenz vor dem Intent, eine Antwort im Fokus statt eines
Verlaufs, ein Regler, dessen Belegung im Gespräch entsteht
([`docs/VISION-samuel.md`](../docs/VISION-samuel.md), ADR-0002).

**Zielnutzer.** Erst der Besucher von `agentfähig.de` (Samuel selbst als
Bauherr und erster Kritiker), später „for website / person / team / company"
als Pfade ([P], Skizze). Ein realer Zielnutzer außerhalb des Projekts ist noch
nicht benannt — das ist relevant, weil mehrere Befunde unten von der Zielgruppe
abhängen.

**Geplante Komponenten** ([P], `tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md`, `docs/PROJECT.md`):

- Browser: Augen, Typewriter, ein Regler, Mikrofon nach Klick, eine WebSocket-Verbindung.
- Durable Object pro Besucher: Front-Agent (`withVoice`), Sub-Agenten (Analysing,
  Looking-up, Backup), Zustand (Reglerwerte, Status, Ergebnisse).
- Workers AI: STT, LLM, TTS; State-Sync über `setState` / `useAgent`.

**Kritischste Annahmen** — in der Reihenfolge, in der sie bei Fehlschlag alles
Weitere entwerten:

| # | Annahme | Status |
|---|---|---|
| A1 | „Antwort unter 1 s inkl. TTS" ist auf Cloudflare erreichbar | ungemessen; Lauf 1 scheiterte vor der ersten Zahl |
| A2 | Ein Regler, der Aussehen **und** Haltung ändert, wirkt als Anpassung statt Dekoration | Design-Hypothese, kein Vorbild gefunden |
| A3 | Augen erzeugen Präsenz | Baustein vorhanden; Wirkung ungeprüft |
| A4 | Ergebnisse aus Sub-Agenten „still" nachzureichen ist billig | SDK-seitig belegt, aber nicht gebaut |
| A5 | Free-Account trägt den Betrieb | bereits einmal gescheitert (Paid-Modell als Default) |

**Bereits vorhandene, wiederverwendbare Teile** ([P]): `EyeFace.js` (MIT) als
Absicht, `examples/voice-agent` als Messgrundlage, `claudeflareworkerhaus` als
erprobte Worker-Flotte mit `agents@0.27.0`, `FleetQuota`/`FleetLedger`.

---

## 1 · Methode und Grenzen

Gesucht wurde in vier Richtungen: (a) vollständige Produkte mit derselben These,
(b) Bausteine für Präsenz, Stimme, Zustand, Texteffekt, (c) dokumentierte
Engineering-Entscheidungen und Postmortems, (d) Forschung zu Timing, Präsenz und
Gestaltung. Priorität hatten Quellcode, Issues, Architektur-Dokumente und Papers;
Marketing-Seiten wurden nur als Existenznachweis verwendet.

Bewusst **nicht** getan: Klonen, Installieren, Messen, Lizenzen juristisch prüfen,
deutsche Sprachfähigkeit einzelner Kandidaten testen. Damit bleiben alle
Reuse-Urteile unter dem Vorbehalt „gelesen, nicht gelaufen".

---

## A · Die relevantesten bestehenden Lösungen

### A1 · Cloudflare Agents — `agents/voice` (die Plattform unseres Pfads)

- **Repo:** [cloudflare/agents](https://github.com/cloudflare/agents) · **MIT** [A] ·
  **6.008 Sterne**, letzter Push **19.11.2026**, **217 offene Issues** [A] ·
  Paketstand `agents@0.33.0` (03.11.2026) [A].
- **Was es wirklich ist:** ein Voice-Loop im Durable Object — PCM rein, STT,
  `onTurn()`, satzweises Streaming-TTS, MP3 zurück, Unterbrechung, SQLite-Verlauf.
  Die Doku markiert das Ganze als **Beta** [B].
- **Was es nicht ist:** kein fertiges Produkt, keine Garantie für Latenz, keine
  Wort-Zeitmarken im Audio, kein Schutz gegen Wiedergabe-Artefakte im Browser.
- **Belegte Reibungspunkte** (alle [A], Issues/PRs gelesen):
  - `#1816` (closed, 25.06.2026): Nach einer Pause zwischen zwei Fragen spielte die
    zweite Antwort **in Zeitlupe**, weil ein `MediaStreamAudioDestinationNode` →
    `HTMLAudioElement`-Brücke wiederverwendet wurde. Fix: Brücke pro Turn neu bauen.
    Entdeckt an einem **Messestand-Demo**, nicht durch Server-Metriken.
  - `#1747` (closed, 12.06.2026): hörbare **Klicks an jeder Paketgrenze**, weil der
    nächste Audioblock auf ein `ended`-Event wartete. Fix: Scheduling auf der
    Audio-Uhr mit Cursor.
  - `#2157` (closed, 24.08.2026): Diagnose- und Turn-Metrik-Schicht; seitdem wird
    `status: "speaking"` **erst unmittelbar vor dem ersten gesendeten Audiopaket**
    gesetzt, nicht beim Beginn der Generierung — relevant für Augen-Synchronität.
  - `#1849` (offen, 02.07.2026): `onCallEnd` feuert, bevor ein laufender Turn fertig
    ist → ein letzter Turn geht bei abruptem Disconnect verloren.
- **Reuse:** Ja, als Fundament. Aber die Issues sind die eigentliche Lehre: die
  Wiedergabeschicht ist Teil des Produkts und wird von den SDK-Metriken nicht
  abgedeckt.

### A2 · `examples/voice-agent` — der Messgegenstand selbst

- **Datei:** [`src/server.ts`](https://github.com/cloudflare/agents/blob/main/examples/voice-agent/src/server.ts) [A].
- Heute: Default-LLM `@cf/deepseek-ai/deepseek-v4.1-flash-1017`; über
  `?llm=qwen` → `@cf/qwen/qwen3.8-27b`. STT-Provider wählbar (Flux, Nova-3,
  AssemblyAI, Telnyx, ElevenLabs), TTS `aura-1`, Turn-Erkennung über
  Flux-`StartOfTurn`/`EndOfTurn`, Einzelsprecher-Zwang, Unterbrechung.
- **Wichtig für den Messlauf:** Der Querystring `?llm=qwen` ist bereits im Beispiel
  verdrahtet. Der im Plan vorgesehene „eine Zeile Modellwechsel" ist damit
  **keine Codeänderung**, sondern eine URL.
- **Stand im Arbeitsbaum (nicht committet, parallele Session, 19.11. abends) [P]:**
  Laufversuch 2 belegt den Free-Pfad auf zwei Wegen — `?llm=qwen`
  (`qwen3.8-27b`, ohne Codeänderung) und `glm-4.7-flash` per Ein-Zeilen-Tausch;
  ein Text-Turn antwortete ohne `AI_APICallError 5035`. Das ist ein
  **Funktions-, kein Latenznachweis**. Ebenfalls dort belegt: das UI-Label
  („DeepSeek") zeigt nach dem Tausch das falsche Modell — protokolliert werden
  muss die effektive Modell-ID aus dem Code, nie das Label.
- **Ebenfalls dort belegt:** `turn_metrics` ist mit dem **unveränderten** Beispiel
  nicht erfassbar (keine Anzeige für Text-Turns, WebSocket-Frames werden nicht
  aufgezeichnet, kein Treffer im lokalen Observability-Store). Der Lauf steht
  deshalb an der Erfassungsfrage, nicht an der Latenz.
- **Reproduzierbarkeitsrisiko** [A]: Beispiel pinnt `agents: "*"` und `ai: ^7.0.0`;
  ein frischer Klon installierte am 19.11. `agents@0.33.0` und kollidierte mit
  `react@19.3.1` (ERESOLVE). Die SDK-Interna, auf die sich
  `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md` beruft, stammen aus **0.27.0** — das ist ein
  anderer Stand als der geklonte.

### A3 · qwen-audio-agent (die belastbarste Vorlage für „fast / slow")

- **Repo:** [QwenAudio/qwen-audio-agent](https://github.com/QwenAudio/qwen-audio-agent)
  · **Apache-2.0** · **3.258 Sterne**, Push **18.11.2026**, CI, npm-Paket,
  Releases bis v2.1.0 (10.11.2026) [A]. README und
  [Architektur-Dokument](https://github.com/QwenAudio/qwen-audio-agent/blob/main/docs/architecture/deep-dive.md) gelesen [B].
- **Architektur:** Frontend-Agent (Echtzeit, kleine Werkzeugmenge) →
  Orchestration-Runtime (Tasks, Rechte, Events) → Backend-Agent (ACP/A2A).
  Antworten, die sofort gehen, gehen sofort; alles andere wird delegiert.
- **Die vier übertragbaren Entscheidungen** (wörtlich belegbar):
  1. `spawn_thinking` **wartet nie**; die Antwort kehrt sofort in den Realtime-Kanal zurück.
  2. Aufnahme ist **begrenzt**: ein aktiver Slot global, einer pro Nutzer; der Rest
     wartet in einer Warteschlange.
  3. Das Endergebnis wird **erst in ein „safe duplex insertion window"** gestellt —
     nicht mitten in die Äußerung des Nutzers.
  4. Neue Arbeit bricht bestehende **nie implizit** ab.
- **Zusätzlich relevant:** Trennung „core contract tools" vs. „optional capabilities"
  im Prompt, damit Options-Features nicht in die Kernregeln einsickern; und zwei
  Gedächtnis-Dokumente, getrennt nach **Autorität** (`user` = Stil/Direktiven,
  `memory` = Fakten), wobei Personalisierung die Kernregeln nicht überschreiben darf.
- **Reuse:** Code nein (eigene Runtime, Node, ACP). **Vertrag** ja — das ist die
  beste verfügbare Antwort auf T4.

### A4 · ui-morph — der einzige echte PoC für „Modell verändert die Seite"

- **Repo:** [type0labs-dev/ui-morph](https://github.com/type0labs-dev/ui-morph) ·
  **MIT** · **0 Sterne**, Push 21.10.2026, Status „proof of concept" [A]. README und
  [POST-MORTEM](https://github.com/type0labs-dev/ui-morph/blob/main/docs/POST-MORTEM.md) gelesen [B].
- **Was es macht:** Ein Modell schlägt Änderungen an einer bestehenden Seite vor —
  aber nur fünf Operationen (`hide`, `show`, `reorder`, `emphasize`,
  `swap-variant`), nur gegen **deklarierte Ziele** (`data-morph` + Manifest), nur
  an **Seitengrenzen**, validiert gegen Schema + geschützte Zonen + Budget, mit
  Audit-Log. Die Kette wird gecacht; danach kostet sie null Modellaufrufe.
- **Warum das hier zählt:** Es ist die ingenieurmäßige Antwort auf die Warnung aus
  `GreateWriting.txt` („decoration, not adaptation") — nicht Farbe freischalten,
  sondern einen **geschlossenen Wortschatz** mit Begründung und Grenze.
- **Was es nicht ist:** kein Produkt, keine Nutzerstudie, 0 Sterne. Die Aussage
  „Layout-Churn zerstört räumliches Gedächtnis" stammt aus zitierter HCI-Literatur
  (Findlater/McGrenere, Gajos, Office-2000-adaptive-Menüs), nicht aus eigener Messung.
- **Postmortem-Zahlen** [B]: 52 Unit-Tests, 9 E2E; Live-Modell p50 **5,5 s** pro
  Austausch; 12 Defekte, davon **4 „page-death races"** (`pagehide`, abgebrochene
  Fetches, Teardown) — alle in Unit-Tests unsichtbar.

### A5 · OpenVoiceUI — `EyeFace.js`

- **Repo:** [MCERQUA/OpenVoiceUI](https://github.com/MCERQUA/OpenVoiceUI) · **MIT** ·
  **86 Sterne**, Push **19.11.2026**, npm-Paket, CI-Tests, Docs-Site [A].
- **Der Baustein ist real** [A]: `src/face/EyeFace.js` = 6.755 Bytes, `BaseFace.js`
  7.466, `face.css` 14.570, `EventBus.js` 2.910. Sechs Stimmungen, mausfolgende
  Pupillen, autonomes Blinzeln/Umsehen, `destroy()` räumt Timer und Listener ab.
- **Der Preis** [A]: DOM-IDs (`left-eye`, `right-eye`, …), `BaseFace`, `EventBus`,
  eigenes CSS. Das ist ein Adapter, kein Ein-File-Drop-in. Und: **keine
  `prefers-reduced-motion`-Behandlung** — dauerhaft blinkende Inhalte sind genau
  der Fall von WCAG 2.2.2 (siehe E3).
- **Was es nicht ist:** kein Präsenznachweis. Es ist eine Darstellungsschicht.

### A6 · Pika `generative-ui` — Überschätzt in der bisherigen Planung

- **Repo:** [Pika-Labs/Pika-Experiments](https://github.com/Pika-Labs/Pika-Experiments/tree/main/generative-ui)
  · **Apache-2.0** · **7 Sterne**, letzter Push **25.06.2026** [A]; README: „Local-only
  prototype", ~3.700 Zeilen, null Abhängigkeiten [B].
- **Korrektur an [`UPSTREAM-SEARCH-vergleichbare-projekte.md`](../UPSTREAM-SEARCH-vergleichbare-projekte.md):**
  Die Layout-Erzeugung liegt **nicht** im Repo, sondern im gehosteten **Pika MCP**
  (`mcp.pika.me`); das Repo ist ein Canvas-Renderer plus OpenAI-Realtime-Client und
  verlangt ein Pika-Konto. Damit ist die Aussage „die Vorlage existiert" nur als
  *Muster* haltbar, nicht als Code. `server.js` (69.700 B) und `public/app.js`
  (80.206 B) sind eine Demo, kein Modul.

### A7 · json-render / OpenUI / A2UI — der Katalog-Ansatz

- [vercel-labs/json-render](https://github.com/vercel-labs/json-render): **Apache-2.0**,
  **19.778 Sterne**, Push 19.11.2026 [A]. Agent liefert JSON gegen einen
  Komponentenkatalog, React rendert streamend.
- [thesysdev/openui](https://github.com/thesysdev/openui): **MIT**, **15.352 Sterne**,
  Push 19.11.2026 [A] (die Lizenz des separaten
  `voice-agent-generativeui` bleibt ungeklärt — dort `null` [A]).
- **Einordnung:** reif und breit, aber sie lösen ein anderes Problem — *Inhalte* aus
  einem Katalog, nicht *Aussehen und Haltung* der Seite. Für Agentfähig v1
  zusätzliche Angriffsfläche ohne Nutzen (siehe F).

### A8 · LiveKit / Pipecat / Smart Turn — Turn-Taking als eigenes Problem

- [livekit/agents](https://github.com/livekit/agents): **Apache-2.0**, **15.282 Sterne** [A].
- [pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat): **BSD-2**, **17.344 Sterne** [A];
  [smart-turn](https://github.com/pipecat-ai/smart-turn): **BSD-2**, **1.678 Sterne** [A].
- [LiveKit Turn Detector](https://huggingface.co/livekit/turn-detector): offene
  Gewichte, 14 Sprachen **inkl. Deutsch**, German TPR 99,3 % / TNR 87,8 %,
  destilliert aus Qwen2.5-0.5B, 128 Tokens / 6 Turns, < 500 MB RAM [B].
  **Lizenz: „LiveKit Model License"**, nicht Apache/MIT [B] — vor Übernahme klären.
- **Nutzen für uns:** Referenz und Warnung, kein Baustein. Die Modelle laufen nicht
  auf Workers; sie begründen aber, warum ein reiner Stille-Timer die falsche
  Abstraktion ist.

### A9 · Stimm — „Optimistic VUI"

- [stimm-ai/stimm](https://github.com/stimm-ai/stimm): **MIT**, aber nur **53 Sterne** [A].
  Muster: VoiceAgent antwortet, Supervisor denkt nach und korrigiert über einen
  Data Channel; `bridge_timeout` 1 s. Als *Idee* wertvoll, als Beleg für
  Produktionsreife nicht.

### A10 · Die kommerzielle Referenzklasse (nur Existenznachweis)

Docket Frameless, Navless, Hume EVI (in [`tech/research/konkurrenz.md`](../tech/research/konkurrenz.md) [P]).
Kein offener Code, keine belegten Zahlen. Sie belegen nur, dass die These
„Agent gehört in die Seite" am Markt existiert.

---

## B · Vergleichsmatrix

Legende: **●** direkt übernehmbar · **◐** anpassen · **○** nur Muster · **—** nicht
relevant · Zahlen = Beleglage aus Abschnitt A.

| Unser Bedarf | cloudflare/agents | qwen-audio-agent | ui-morph | OpenVoiceUI | json-render | LiveKit/Pipecat |
|---|---|---|---|---|---|---|
| Voice-Loop (STT→LLM→TTS) im DO | ● MIT, aktiv | ○ anderes Runtime | — | — | — | ○ Python |
| Text-Kanal ohne STT/TTS | ● `sendText` | ○ | — | — | — | — |
| Zustand → Oberfläche | ● `setState`/`useAgent` | ○ | ◐ 5 Ops + Manifest | — | ◐ Katalog | — |
| Augen / Präsenz | — | ○ Orb/Pet | — | ● `EyeFace.js` | — | — |
| Typewriter-Rhythmus | ◐ AI SDK `smoothStream` | — | — | — | — | — |
| Fast/Slow-Vertrag | ● detached runs | ● Architektur | — | — | — | — |
| Turn-Taking | ◐ Flux EOT (EN) | ○ | — | — | — | ◐ Modelle |
| Adaptive UI mit Grenze | — | ○ | ● Muster | — | ○ Katalog | — |
| Messbarkeit „was hört der Nutzer" | ◐ Server-Uhr + eigene Playback-Marke | ○ | — | — | — | ● `e2e_latency` |

**Reifegrad-Realität** (Sterne/Push heute [A]): 6.008 · 3.258 · 0 · 86 · 19.778 ·
15.282/17.344. Zwei der drei „wichtigsten" bisherigen Funde (Pika, capturia mit
2 Sternen) sind Ein-Personen-Demos. Das ändert nichts an ihrer Idee, aber alles an
ihrem Gewicht als Beweis.

---

## C · Wiederverwendbare Bausteine und konkrete Integration

### C1 · Voice-Pipeline — REUSE, aber mit eigener Messnaht

`withVoice(Agent)` aus `agents/voice` unverändert als Transport- und Pipeline-Schicht.
Darüber **eine eigene Messnaht im Browser**: Zeitstempel bei `status === "speaking"`
plus `AudioBufferSourceNode`-Start, nicht nur `turnMetrics`. Begründung: `#1747`
und `#1816` waren serverseitig unsichtbar, und die Doku sagt ausdrücklich, alle
`VoiceTurnMetrics`-Dauern liefen auf der **Worker-Uhr**, überlappten und seien
nicht addierbar [B].

**Wichtige Konsequenz aus dem Arbeitsbaum [P]:** Dort ist belegt, dass
`turn_metrics` mit dem unveränderten Beispiel derzeit **gar nicht ankommt**.
Die Messnaht ist damit keine Nachbereitung, sondern Voraussetzung des Laufs —
und weil sie den Klon instrumentiert, ist sie eine Abweichung vom Plan
„unverändertes Beispiel" und braucht eine eigene Freigabe. Ohne sie ist der
20-Turn-Lauf nicht abnahmefähig.

### C2 · Augen — ADAPT

`EyeFace.js` + `BaseFace.js` + `EventBus.js` + zugehöriges CSS übernehmen, dann
drei kleine Änderungen:

1. **Mood-Mapping** `idle | listening | thinking | speaking` → vorhandene Klassen;
   `speaking` erst bei erstem Audiopaket (vgl. `#2157`), nicht bei Generierungsstart.
2. **`prefers-reduced-motion`**: Blinzeln und Pupillenfolge abschaltbar; ohne das ist
   die Übernahme ein Barrierefreiheits-Defekt (WCAG 2.2.2, Level A).
3. **DOM-IDs entkoppeln** (Container-basiert statt `document.getElementById`), sonst
   kollidiert der Baustein mit dem eigenen Layout.

MIT-Hinweis (Copyright) im Code. Kein zweiter Augen-Baustein.

### C3 · Typewriter — REUSE + ADAPT, nicht neu bauen

Der AI SDK hat `smoothStream` als offiziellen `streamText`-Transform: puffert und
gibt in Chunks mit konfigurierbarer Verzögerung frei, Default `chunking: "word"`,
`delayInMs: 10`, und überspringt die Verzögerung, wenn das Dokument verborgen ist
[B]. Damit ist „Wort für Wort statt Token-Sprünge" gelöst, bevor eigener Code
entsteht.

Was fehlt und deshalb **ADAPT** ist: die wortlängenabhängige Pulsierung
(`DESIGN-DECISIONS.md`) und das Verhalten bei leerlaufendem Puffer. Beides gehört
in den Browser (Anzeige-Takt), nicht in den Worker: der Server soll so schnell
liefern wie möglich, das Tempo ist eine Design-Entscheidung.

**Nicht** auf den Voice-Pfad anwenden — dort würde die künstliche Verzögerung
direkt auf die Hör-Latenz addieren.

### C4 · Zustand und Aussehen — BUILD (klein), mit geschlossenem Wortschatz

Kein generatives UI-Framework. Ein typisiertes Zustandsschema (z. B. Zod) mit
maximal drei Achsen und **diskreten Stufen**:

```text
appearance = { warmth: 0..4, form: 0..2, tone: 0..2 }   // Beispiel, nicht Festlegung
```

Der Agent liefert **Werte**, keine CSS-Regeln, kein HTML. Das Frontend mappt Werte
auf CSS Custom Properties **und** auf ein Prompt-Fragment. Serverseitig validiert
(`validateStateChange`), damit das Limit „max 3" nicht nur eine UI-Eigenschaft ist.

Übernommen aus `ui-morph` [B]: geschlossener Wortschatz, deklarierte Ziele,
Anwendung an **Turn-Grenzen** (nicht mitten im Lesen), deterministische Wiederholung
(gleicher Verlauf → gleiches Aussehen), Audit-Spur der Änderungen.

### C5 · Fast/Slow — REUSE der SDK-Mechanik, ADAPT des Vertrags

`this.subAgent()` bzw. `runAgentTool(..., { detached })`; Ergebnisse per `setState`
still nachreichen (entspricht `DESIGN-DECISIONS.md`). Aus qwen-audio-agent [B]
übernehmen: begrenzte Aufnahme (ein aktiver Sub-Task pro Besucher), Ergebnis nicht
mitten in eine laufende Äußerung schieben, neue Arbeit bricht alte nicht implizit ab.

### C6 · Text ↔ Stimme synchron — EXPERIMENT, nicht bauen

Wort-Zeitmarken liefert der Cloudflare-TTS-Pfad nicht [B]; ElevenLabs kann
Zeichen-Alignment liefern ([stream-with-timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/stream-with-timestamps) [C],
im Cloudflare-Adapter aber nicht durchgereicht). Für v1 gilt: **Text führt, Stimme
folgt** oder umgekehrt — aber nicht „beide unabhängig", solange niemand gemessen
hat, wie weit sie auseinanderlaufen.

---

## D · Fünf Lessons aus fremder Engineering-Erfahrung

### D1 · Latenz ist kumulativ und muss dort gemessen werden, wo der Mensch sie erlebt

1. **Was andere machen:** LiveKit zerlegt Latenz in Turn-Detection, Transkript,
   Modell, Tools, TTS und **Wiedergabebeginn** und empfiehlt, die Stage zu
   instrumentieren, die dominiert [B]. Die AAIF-Analyse nennt als eigentliche
   Nutzergröße „end of speech → playback begins" [B].
2. **Problem:** Teams optimieren den Modellaufruf und wundern sich über ein
   träges Produkt.
3. **Evidenz:** Cloudflares eigene Metriken laufen auf der Worker-Uhr und sind
   nicht additiv [B]; `#1747`/`#1816` sind Wiedergabefehler, die keine Server-Metrik
   zeigte [A].
4. **Gilt, wenn:** Audio im Browser abgespielt wird, also immer bei Voice.
5. **Übertragung:** M1/M3c nicht auf `first_audio_ms` allein stützen. Zwei Zahlen
   pro Turn: Server (Stage-Budget) **und** Client (Ende der Äußerung → hörbarer
   Ton). Die zweite ist das Gate.
6. **Falsch, wenn:** nur Kapazität/Backend-Kosten geplant werden — dann ist die
   Server-Uhr die richtige Größe.

### D2 · Turn-Taking ist semantisch, nicht „Stille"

1. **Was andere machen:** Deepgram Flux modelliert den Turn selbst (~260 ms p50
   End-of-Turn bei Defaults), liefert `EagerEndOfTurn` (früh antworten) und
   `TurnResumed` (doch nicht fertig → verwerfen); LiveKit nutzt ein Sprachmodell
   über dem Transkript, 14 Sprachen inkl. Deutsch [B].
2. **Problem:** „Can you move my appointment to … Thursday?" — die Pause nach „to"
   ist keine Turn-Grenze. Ein Stille-Timer schneidet den Satz ab oder wartet zu lang.
3. **Evidenz:** LiveKit-Benchmarks (German 99,3 % TPR / 87,8 % TNR) [B];
   Cloudflare-Beispiel nutzt Flux-Events, nicht den Client-Timer [A].
4. **Gilt, wenn:** freie Sprache, Korrekturen, Zögern, Zahlen/Buchstabieren.
5. **Übertragung:** Für den geparkten deutschen Pfad `nova-3` + `endpointingMs`
   statt eigener Stille-Schwelle; für Englisch Flux-EOT. Für den Erstbau (Text)
   ist das Problem **nicht existent** — ein Grund mehr, Voice separat zu gaten.
6. **Falsch, wenn:** Push-to-talk, Diktat, oder wenn Nutzer ohnehin klicken.

### D3 · Präsenz entsteht aus Kontingenz und Timing, nicht aus der Darstellung

1. **Was andere machen:** In einer VR-Studie (N=24) wurde die Augendarstellung
   variiert, das Blickverhalten konstant gehalten: explizitere Blickziele
   verbesserten das *Verstehen*, galten aber als **unheimlicher**; die
   Präsenzwerte unterschieden sich **nicht** zuverlässig [B].
2. **Problem:** Man poliert das Auge und hofft auf Wirkung, während die Wirkung
   an Reaktion und Rhythmus hängt.
3. **Evidenz:** obige Studie [B]; Response-Time-Forschung: verzögerte Antworten
   erhöhen soziale Präsenz **bei Novizen**, senken sie **bei erfahrenen** Nutzern
   (N=202) [B]; zu stark „humanisierte" Verzögerungen (70 wpm) senkten die
   Sympathie [C].
4. **Gilt, wenn:** das Publikum gemischt oder erfahren ist (Agentfähig.de).
5. **Übertragung:** Die 5 Sekunden bis zum Augenaufwachen und das pulsierende
   Typewriter-Tempo sind **soziale cues**, keine Animationen. Sie brauchen eine
   Zielgruppen-Entscheidung: erlebnisorientiert (Verzögerung wirkt) vs.
   werkzeugorientiert (Verzögerung nervt). Und die Augen müssen auf *Ereignisse*
   reagieren (zuhören, denken, sprechen), sonst ist es ein Bildschirmschoner.
6. **Falsch, wenn:** das Produkt primär Aufgabe statt Begegnung ist.

### D4 · „Fast / slow" funktioniert nur mit einem Vertrag, nicht mit einem zweiten Agenten

1. **Was andere machen:** qwen-audio-agent trennt Frontend-Agent, Runtime und
   Backend-Agent; `spawn_thinking` wartet nie, Aufnahme ist begrenzt, Ergebnisse
   kommen in ein „safe duplex insertion window", neue Arbeit bricht alte nicht ab [B].
2. **Problem:** Naiv gebaut entstehen drei Fehler: der Front-Agent blockiert, die
   Queue explodiert, oder ein Ergebnis platzt mitten in die nächste Äußerung.
3. **Evidenz:** Architektur-Dokument mit Invarianten und Tests [B]; Cloudflare
   bietet denselben Mechanismus technisch (`detached: { onFinish }`) [B].
4. **Gilt, wenn:** Hintergrundarbeit länger dauert als ein Turn und der Mensch
   weiterredet.
5. **Übertragung:** Den Vertrag übernehmen, nicht den Code — inklusive der
   Entscheidung, ob späte Ergebnisse **sprechen** dürfen. Aktuelle
   Designentscheidung sagt: nein, still über State-Sync. Das ist der billigere,
   robustere Zweig — und deckt sich mit qwens „insertion window"-Problem.
6. **Falsch, wenn:** Ergebnisse trivial schnell sind oder der Nutzer ohnehin wartet.

### D5 · Adaptive Oberflächen brauchen einen Sicherheitsgurt

1. **Was andere machen:** `ui-morph` erlaubt fünf Operationen gegen deklarierte
   Ziele, nur an Seitengrenzen, mit Schema, geschützten Zonen, Budget und Audit-Log;
   der geschlossene Wortschatz hielt über alle Szenarien, „Dichte kam aus Manifesten,
   nie aus Motorleistung" [B]. A2UI/GenUI-Community beantwortet Prompt-Injection und
   XSS mit **Katalogen/Allowlists statt freiem HTML** [C].
2. **Problem:** Ein Modell, das CSS/HTML schreiben darf, ist eine XSS- und
   Layout-Churn-Maschine; adaptive Menüs (Office 2000) wurden aus genau diesem
   Grund zurückgenommen [C, zitiert in B].
3. **Evidenz:** Postmortem mit 12 Defekten, 4 davon Grenz-/Teardown-Races [B];
   Sicherheitslage in mehreren GenUI-Quellen konsistent [C].
4. **Gilt, wenn:** ein Modell die laufende Oberfläche eines Menschen verändert.
5. **Übertragung:** ≤ 3 Achsen, diskrete Stufen, Werte statt Regeln, Anwendung an
   Turn-Grenzen, server-seitige Validierung, sichtbare Historie „was hat sich geändert".
6. **Falsch, wenn:** ein Designer einmalig ein Theme baut — dann ist ein klassischer
   Theme-Picker besser.

---

## E · Die drei größten Fehler, die wir nach dieser Recherche vermeiden sollten

### E1 · Das falsche Gate grün messen

`first_audio_ms` ist eine Servergröße. Wenn M1 „< 1000 ms" besteht und der Besucher
trotzdem eine Sekunde plus Netz, Decoder und Wiedergabepuffer wartet, ist die
Architekturentscheidung auf einer Zahl gebaut, die das Versprechen nicht abdeckt
(Details D1, `#1747`, `#1816`). **Gegenmittel:** zwei Messnähte, die Client-Zahl
als Gate; zusätzlich p90 und Streuung statt Median allein, weil Tail-Fälle das
Erlebnis prägen [B].

### E2 · Ein öffentliches Produkt auf ein Gratis-Kontingent und ein Abkündigungs-Datum bauen

Drei belegte Fakten kollidieren: (a) das Beispiel-Default-Modell ist Paid-only und
ließ Lauf 1 scheitern [P]; (b) Cloudflare hat am 18.11.2026 **alle Beispiele** auf
dieses Paid-Modell umgestellt und musste zuvor eine ganze Modellwelle zum
20.11.2026 ersetzen [A]; (c) nach projektinterner Rechnung trägt das Free-Kontingent
~18 Voice-Wechsel/Tag [P]. Das ergibt ein Produkt, das technisch funktioniert und
ökonomisch sofort stirbt. **Gegenmittel:** Kostenmodell und Modell-Ersatzplan
**vor** dem Erstbau, nicht danach; Betriebsgrenze explizit („Beta, N Besucher/Tag").

### E3 · Eine dauerhaft animierte, selbst umgestaltete Seite ohne Pause, ohne Reduced-Motion, ohne Sprachgrenze

Der Erstbau plant drei gleichzeitig laufende Dinge: blinzelnde Augen, pulsierenden
Typewriter, sprechende Stimme — plus eine Seite, die sich auf Zuruf umbaut. Kein
Dokument im Repo behandelt Barrierefreiheit. WCAG 2.2.2 (Level A) verlangt für
automatisch bewegte/aktualisierte Inhalte über fünf Sekunden eine Pause-, Stop-
oder Versteck-Möglichkeit; `prefers-reduced-motion` ist gute Praxis, aber **kein
Ersatz** [B]. `EyeFace.js` bringt keine solche Behandlung mit [A]. **Gegenmittel:**
Pause-Schalter, Reduced-Motion-Pfad, `aria-live="polite"` für die Antwort, und die
Regel „Aussehen ändert sich an Turn-Grenzen" — bevor über Ästhetik diskutiert wird.

---

## F · Build vs. Buy vs. Adapt

| Komponente | Entscheidung | Begründung | Aufwand / Risiko |
|---|---|---|---|
| Voice-Transport + Pipeline | **REUSE** `agents/voice` (MIT) | Beta, aber der gepflegte Weg auf der Zielplattform; 6.008 Sterne, täglicher Push | Klein; Risiko: API-Drift (`agents: "*"`) → Version pinnen |
| STT/LLM/TTS-Provider | **ADAPT** | Provider austauschbar; Free-/Paid-Frage und Deprecations sind der eigentliche Aufwand | Mittel; **vor** dem Lauf Modell-Fähigkeit belegen |
| Augen / Präsenz | **ADAPT** `EyeFace.js` (MIT) | real, klein, plattformneutral; braucht Reduced-Motion, DOM-Entkopplung, Mood-Mapping | Klein–mittel; keine Wirkungsgarantie (D3) |
| Typewriter-Takt | **REUSE** `smoothStream` + **ADAPT** im Browser | offizieller Transform, wortweise, 10 ms Default; Wortlängen-Pulsierung fehlt | Klein; Puffer-Leerlauf definieren |
| Zustand / Aussehen | **BUILD** (klein) mit geschlossenem Wortschatz | kein Framework löst „3 Achsen, Werte statt CSS, Turn-Grenzen" | Klein; Schema + Validierung + CSS-Variablen |
| Generative Layouts (json-render/A2UI) | **REMOVE** für v1 | löst Katalog-Inhalte, nicht Aussehen; mehr Fläche, mehr Risiko | — (später prüfbar) |
| Pika-Muster | **REMOVE** als Baustein, **behalten** als Ideengeber | Orchestrierung liegt in gehostetem MCP, 7 Sterne, Demo | — |
| Fast/Slow | **REUSE** `detached` + **ADAPT** qwen-Vertrag | Mechanik vorhanden, Vertrag fehlt | Klein; Rezenzkoordination |
| Turn-Taking (Voice, später) | **REUSE** Flux-EOT / `nova-3`-Endpointing | modellbasiert statt Timer | Mittel; Deutsch = eigener Pfad |
| Semantische EOU (nur falls nötig) | **EXPERIMENT** | LiveKit-Modell läuft nicht auf Workers; Lizenz unklar | Hoch, nur bei belegtem Bedarf |
| Messharness | **BUILD** (klein) | kein Upstream misst „was der Nutzer hört" | Klein, hoher Hebel |
| Text↔Stimme-Sync | **EXPERIMENT** | keine Zeitmarken im Cloudflare-Pfad | Mittel; sonst „wer führt" festlegen |
| Barrierefreiheit | **BUILD** (klein) | kein Upstream | Klein; Pflicht |
| Persistenz / Verlauf | **REUSE** DO-SQLite | im SDK vorhanden, `historyLimit` 20 | — |

---

## G · Verbleibende Unbekannte

1. **Ist die Latenz überhaupt erfassbar?** Im Arbeitsbaum belegt [P]: mit dem
   unveränderten Beispiel **nein**. Damit ist die erste offene Frage nicht
   „welches Modell", sondern „wie kommt eine Zahl heraus, ohne das Beispiel zu
   verbiegen". Diese Entscheidung gehört vor den 20-Turn-Lauf.
2. **Wie groß ist die Lücke zwischen Worker-Uhr und Ohr?** Unbekannt, geräte- und
   netzabhängig; Bluetooth und Puffergrößen sind bekannte Zusatzposten [B].
3. **Wirkt der Regler?** Kein Vorbild, keine Messung. Die Stilforschung stützt die
   Richtung (freundlicher Stil ↑ Zufriedenheit und Aufgabenerfolg gegenüber direktem
   Stil, aber Kontrollgruppe ohne Chatbot war am erfolgreichsten) [B] — sie belegt
   nicht, dass ein Regler als Steuerorgan erlebt wird.
4. **Wirken die Augen?** Die Studienlage ist VR, N=24, fotorealistisch; auf eine
   2D-Seite mit stilisierten Augen ist die Übertragung offen [B].
5. **Deutsch:** STT ja (`nova-3`), TTS nur extern. Ob ein zweiter Anbieter-Hop die
   Latenz Kante kostet, ist ungemessen — und die Sprach-Entscheidung ist bereits
   auf Englisch gefallen [P].
6. **Lizenz der LiveKit-Turn-Detector-Gewichte** („LiveKit Model License") vor
   jeder Nutzung prüfen [B].
7. **Datenschutz:** Audio und Transkripte liegen im Agent-SQLite [P]; Aufbewahrung,
   Löschung, DSGVO sind in keinem Dokument behandelt.
8. **Zielgruppe:** Ohne sie ist nicht entscheidbar, ob die 5-Sekunden-Präsenz und
   das pulsierende Tempo wirken oder künstlich wirken (D3).

---

## H · Was aus der bestehenden Planung trägt — und was geprüft werden muss

### Trägt unverändert

- **ADR-0001 (messen vor bauen).** Richtig und durch Lauf 1 bestätigt. Aber das
  *Gate* braucht eine neue Definition (siehe unten).
- **ADR-0002 (Agent als Interface).** Der Unterschied ist real und verteidigbar.
  Die Recherche liefert jetzt die fehlende Grenze: nicht „der Agent formt beliebig",
  sondern „der Agent wählt aus einem kleinen Wortschatz, an Turn-Grenzen".
- **ADR-0003 (Wiederverwendung).** Richtig, aber **enger**: `EyeFace.js` ja;
  Pika nur als Muster, nicht als Vorlage (A6). Die Aussage in
  `UPSTREAM-SEARCH-vergleichbare-projekte.md`, die Vorlage sei gefunden, ist zu
  optimistisch und sollte korrigiert werden.
- **ADR-0004 (Regler verändert Oberfläche *und* Haltung).** Die Stilforschung stützt
  die Richtung; die Grenze „Stil darf Policy nicht überschreiben" (qwen-Muster) ist
  zu ergänzen.
- **ADR-0005 (Fremder testet).** Richtig, aber die Methode ist zu schwach: „scrollt
  oder fragt" unterscheidet nicht zwischen Faszination und Verwirrung. Nächste
  etablierte Verfahren: 5-Sekunden-Test (erster Eindruck), First-Click-Test
  (nächster Schritt erkennbar) und eine Verständnisfrage. Nielsen/Landauer: ~5
  Personen zeigen ~85 % der Usability-Probleme — eine Person zeigt einen Datenpunkt,
  keine Rate [B].
- **Cloudflare als Hypothese.** Trägt für Text, Zustand, Sub-Agenten, Persistenz.

### Muss überprüft werden

1. **Die Gate-Definition in Stufe 1.** `first_audio_ms` (Server) ist nicht die
   Nutzergröße. Zwei Messnähte, Client-Zahl als Gate, p90 statt nur Median (D1/E1)
   — und zuerst der Erfassungsweg, der heute fehlt (G1).
2. **„Unter 1 Sekunde" als alleiniges Kriterium.** Menschliche Turn-Abstände liegen
   im Median bei ~100 ms, über Sprachen hinweg 0–300 ms [B] — 1 s ist bereits
   das Zehnfache. Gleichzeitig ist die Schwelle erreichbar; die Frage ist, ob sie
   das richtige Ziel ist. Besser: Stage-Budget plus Regel „es entsteht nie Stille
   ohne sichtbare Reaktion" (Augen, Status, Thinking-Sound).
3. **„Voice ist Teil des Erstbaus" (Owner-Entscheidung, 19.11.).** Aus
   Engineering-Sicht ist das der größte Risikomultiplikator: Voice bringt
   Turn-Taking, Barge-in, Echo, Wiedergabe-Artefakte, TTS-Kosten und die
   Sprachgrenze mit. Die Entscheidung bleibt Samuels; die Empfehlung ist, sie
   **nicht zurückzunehmen, aber zu entkoppeln**: text-first Durchstich als Gate 3,
   Voice als eigener Slice mit eigenem Messwert.
4. **Reproduzierbarkeit des Messlaufs.** Commit pinnen, Lockfile behalten,
   `agents`-Version und Modell-ID im Protokoll festhalten. `agents: "*"` plus
   Modellwellen machen sonst zwei Läufe unvergleichbar (A2).
5. **Die Aussage „kein Vorbild verhandelt die eigene Präsenz mit dem Besucher".**
   Sie bleibt als Produktbehauptung vermutlich richtig, ist aber keine
   Technik-Aussage mehr: `ui-morph` zeigt die Mechanik der kontrollierten
   Selbstveränderung. Der Unterschied liegt im *Gespräch als Quelle der Werte*,
   nicht im Mechanismus. Diese Schärfung gehört in ADR-0002/0004.
6. **Kosten und Betriebsgrenze.** Vor jedem öffentlichen Auftritt: Modell- und
   TTS-Kosten, Free-/Paid-Grenze, Rate-Limits, Verhalten bei Überschreitung.

---

## Quellen

**Selbst am Artefakt geprüft [A]:** GitHub-API für `cloudflare/agents`,
`MCERQUA/OpenVoiceUI`, `Pika-Labs/Pika-Experiments`, `AndresCarreonDiaz/capturia`,
`thesysdev/voice-agent-generativeui`, `QwenAudio/qwen-audio-agent`,
`vercel-labs/json-render`, `thesysdev/openui`, `livekit/agents`,
`pipecat-ai/pipecat`, `pipecat-ai/smart-turn`, `stimm-ai/stimm`,
`type0labs-dev/ui-morph`; Dateien `examples/voice-agent/src/server.ts` und
`README.md`; `src/face/EyeFace.js`; Issues/PRs `#1441`, `#1747`, `#1816`, `#1849`,
`#2157`; Commit `1a450e7`.

**Volltext gelesen [B]:**
- Cloudflare Voice-Doku — https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/
- Cloudflare Voice-Doku `docs/agents/voice.md` (Turn-Metriken) — https://github.com/cloudflare/agents/blob/main/docs/agents/voice.md
- qwen-audio-agent Architektur — https://github.com/QwenAudio/qwen-audio-agent/blob/main/docs/architecture/deep-dive.md
- ui-morph Post-Mortem — https://github.com/type0labs-dev/ui-morph/blob/main/docs/POST-MORTEM.md
- LiveKit „Understand and improve voice agent latency" — https://livekit.com/blog/understand-and-improve-agent-latency
- LiveKit Turn Detector Modellkarte — https://huggingface.co/livekit/turn-detector
- AAIF „Where voice agents fail in production, Part 1" — https://aaif.io/blog/where-voice-agents-fail-in-production-part-1-latency-turns-and-interruptions
- Stivers et al. 2009, PNAS — https://www.pnas.org/doi/10.1073/pnas.0903616106
- Gnewuch et al. 2022, BISE — https://link.springer.com/article/10.1007/s12599-022-00755-x
- Frontiers in Virtual Reality 2026, Avatar eyes — https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1804637/full
- AI SDK `smoothStream` — https://ai-sdk.dev/docs/reference/ai-sdk-core/smooth-stream
- W3C WCAG 2.2.2 — https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- arXiv 2602.17850 „Mind the Style" — https://arxiv.org/abs/2602.17850

**Nur Metadaten/Abstract/Snippet [C]:**
- Gnewuch et al. 2018, ECIS — https://aisel.aisnet.org/ecis2018_rp/113
- Deepgram Flux Konfiguration / Eager EOT / Migration — https://developers.deepgram.com/docs/flux/configuration · https://developers.deepgram.com/docs/flux/voice-agent-eager-eot · https://developers.deepgram.com/docs/flux/nova-3-migration
- ElevenLabs Streaming mit Zeitmarken — https://elevenlabs.io/docs/api-reference/text-to-speech/stream-with-timestamps
- A2UI/GenUI-Sicherheit (Katalog als Grenze) — https://hia2ui.com/concepts/trust-and-security
- NN/g 5-User-Regel und 5-Sekunden-Test — https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/ · https://www.nngroup.com/videos/5-second-usability-test/

**Projektintern [P]:** `docs/PROJECT.md`, `docs/PLAN-STUFEN-0-5.md`, `docs/DESIGN-DECISIONS.md`,
`docs/adr/*`, `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`, `tech/MESSPROTOKOLL-2026-11-19.md`,
`tech/MESSLAUF-PLAN.md`, `tech/EXECUTION_PLAN-M1-MESSLAUF.md`, `tech/LUECKEN-2026-11-12.md`,
`tech/research/kosten-tts-voice.md`, `UPSTREAM-SEARCH-vergleichbare-projekte.md`,
`tech/research/konkurrenz.md`.
