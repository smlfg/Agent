# Aggregierte OpenCode-Befunde — 12.11.2026

Scouts: OpenCode v2.2.7, Modell `opencode-go/deepseek-v4.1-flash`, frische Sessions,
read-only beauftragt. Diese Synthese trennt überprüfbare Befunde, offene Hypothesen
und verworfene Interpretationen. Keine vollständigen Tool-Logs im Repository.

## 1. Lokale Designquellen

Die [Skizze](../sketches/2026-11-12-agentfaehig.md) nennt `voice`, `text`, `picture`
(Zeile 25), menschliche Richtungswahl (34–37), `vibrant / alive / vivid` sowie
`soft smooth` (60–66), weiche Augen (75) und höchstens drei Slider (81–85).
Scroll-Verlauf, Mikrofonfreigabe und Typewriter-Rhythmus werden dort nicht festgelegt.
Die [neuen Entscheidungen](../docs/DESIGN-DECISIONS.md) ergänzen diese Quelle.

Mehrere lokale Scouts lieferten vor allem Abgrenzungen dessen, was noch offen ist,
keine neue externe Forschung. Die Wiederholungen sind hier zusammengefasst.

## 2. Cloudflare: Text-Streaming grundsätzlich vorhanden

Der Web-Scout hat offizielle Seiten abgerufen:

- [Chat-Agent-Beispiel](https://developers.cloudflare.com/agents/examples/chat-agent/)
- [Agent-Klasse](https://developers.cloudflare.com/agents/agent-class/)
- [WebSockets](https://developers.cloudflare.com/agents/agent-class/websockets/)

Das Beispiel verwendet `AIChatAgent`, `onChatMessage()` und eine Streaming-Response
über `toUIMessageStreamResponse()`. Damit ist Text-Streaming eine vorhandene
Plattformfähigkeit. Es beweist weder die Latenz unseres künftigen Produkts noch
eine funktionierende TTS-Pipeline. Provider, Netzwerk und UI bleiben zu prüfen.

Evidenz: Session `ses_e2e39222cffefGqEisHeuUfiZj`, erfolgreiche Web-Abrufe und Exit 0.

## 3. Wortrhythmus: interessante Hypothese, kein UI-Nachweis

Der Forschungs-Scout fand Literatur zu Wortlänge, Häufigkeit, Vorhersagbarkeit und
Blickbewegungen. Zentraler Fund:

- Kliegl, Grabner, Rolfs & Engbert (2004), *Length, frequency, and predictability
  effects of words on eye movements in reading*.
  [PDF beim Mitautor](http://www.martinrolfs.de/rolfslab/pdf/2004/Kliegl.EurJCognPsychol.16.2004.262.pdf),
  [vom Scout abgerufene Textkopie](https://docslib.org/doc/3539283/length-frequency-and-predictability-effects-of-words-on-eye-movements-in-reading).

Das PDF ließ sich mit dem Webfetch-Tool nicht auslesen; der Scout verwendete eine
Textkopie. Weitere Literaturhinweise betrafen Häufigkeitseffekte und parafoveale
Vorschau. Exakte Effektgrößen und Sekundärzitate werden hier nicht übernommen,
da sie nicht unabhängig anhand der Originalarbeiten geprüft wurden.

Belastbare Grenze der bisherigen Recherche: Sie liefert keinen direkten Versuch
zu unserem Typewriter-Effekt. Aus längerer Betrachtungsdauer folgt nicht automatisch,
dass jeder Buchstabe eines längeren Wortes langsamer eingeblendet werden sollte.
Auch die pauschale Scout-Empfehlung „konstantes Buchstabentempo“ ist damit nicht
als wissenschaftlich bewiesene Alternative begründet.

Samuels gewünschter Rhythmus bleibt eine Gestaltungshypothese. Nach Designabnahme
können Varianten hinsichtlich Gefühl, Lesbarkeit und Wartezeit verglichen werden.
Evidenz: Session `ses_e2e3166aaffelgCJYPBObv75LD`, Exit 0; Quellenzugriff teils begrenzt.

## 4. Korrigierte Scout-Aussagen

- „max 3“ ist ein Slider-Limit, kein nachgewiesenes Nachrichtenlimit.
- Automatisches Erwachen und Reaktion nach Klick müssen kein Widerspruch sein;
  sie können unterschiedliche Zustände beschreiben.
- „Lebendig“ ist sehr wohl in der Skizze verankert. Der konkrete pulsierende
  Typewriter kommt aus Samuels Antworten.
- Ein Text-Eingabefeld beweist keine bereits spezifizierte Text-Ausgabe.
- Der Cloudflare-Scout hat keine Grundlage für eine pauschale Aussage geliefert,
  dass Cloudflare generell keine Audio-/TTS-Integration besitzt.

## 5. Prior Art — Interne Vorarbeiten & Externe Scouts

### 5a. Interne Vorarbeiten im Workspace (`/home/smlflg/Projekte/`)

- **Live-Worker & Selbst-gehostete Fonts (`/home/smlflg/Projekte/Agentfägig.de/site/`):**
  Bereits vorhandener Cloudflare-Worker (`name: "agentfaehig"`), der `/api/explain/*`
  per Service Binding `EXPLAIN` an `cwh-11-explain-20261008` weiterleitet, sowie
  selbst gehostete Variable Fonts (`fraunces.woff2`, `newsreader.woff2`,
  `bricolage.woff2`, `plex-mono.woff2`, plus `caveat.woff2` und `special-elite.woff2`
  unter `landing/design/fonts/`).
- **Design- & Konkurrenz-Lektionen (`/home/smlflg/Projekte/Agentfägig.de/Projek-Managment/` und `/home/smlflg/Projekte/Human-Agent-Interface/Konkurz/`):**
  - `DESIGN_RESEARCH_2026-09-25.md`: Warmer Papiergrund statt Reinweiß/Dark-Default,
    eine charakterstarke Serif-Headline, Spur der Hand (Tusche/Linienzeichnung),
    „erst tun, dann lesen“ (interaktives Hero-Element statt Textwüste), sichtbare
    menschliche Kontrolle.
  - `DESIGN_RETHINK_2026-09-25.md`: 5-stufige Fähigkeits-Treppe (*Fragen →
    Zusammenarbeiten → Beauftragen → Abnehmen → Beaufsichtigen*), bei der HAI auf
    Stufe 4/5 sitzt.
  - `KONKURRENZ_LEKTIONEN.md`: Niederschwelliger Direkt-Einstieg ohne Termin-Hürde
    (von Dust), Alltagsmetapher „wie ein neuer Mitarbeiter/Praktikant mit Auftrag“
    statt Technik-Jargon (von Item), Start beim konkreten Schmerz statt bei der
    Methode (von Manus).
- **Wissensbasis für Pathway 1 (`What this is`):**
  Kanonische Quelle liegt bereits unter `/home/smlflg/Projekte/Human-Agent-Interface/what_it_is/index.html`
  sowie `/home/smlflg/Projekte/Human-Agent-Interface/what_it_is/deep-dive/index.md`.

### 5b. Prior Art Block A — Gekritzel-Textur & weiche Augen (Scout `ses_e2e1529efffee4qNO0eqeJJF0W`)

```markdown
## Prior Art
Problem: A web page displays a calm hand-drawn stroke texture that parts and coalesces into two soft non-human eyes that breathe and track attention.
Searched: internal ✓ · official ✓ (MDN SVG feTurbulence) · external ✓ ("roughjs", "eyes follow cursor", "SVG feTurbulence hand-drawn")
Candidates:
- Rough.js 4.6.6 — https://github.com/rough-stuff/rough — MIT, 8.85 kB gzip, covers sketchy SVG/Canvas strokes, lacks built-in morphing/eye tracking
- Vanilla SVG filters + CSS transforms — https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence — 0 kB, covers organic line jitter + stroke-dashoffset parting
- paranoia.js — https://github.com/krustnic/paranoia.js — covers cursor eyes, unmaintained since 2015 (no license)
Decision: ADAPT (vanilla SVG paths/filters + ~40 LoC pointer/focus lerp & blink timer; optional Rough.js path baking at authoring time)
Saved: zero runtime dependencies, full control over "soft and not scary" and prefers-reduced-motion
Residual risk: visual warmth of stroke-to-eye transition needs browser check against sketch block 4
```

### 5c. Prior Art Block B — Live-Shaping per max. 3 Slidern (Scout `ses_e2e14743affeSmc64K43R2fVmJ`)

```markdown
## Prior Art
Problem: An interactive AI interface lets users shape visual atmosphere (colour, form) and AI response style in real time via up to 3 visible single-word sliders.
Searched: internal ✓ · official ✓ (MDN <input type="range">, Variable Fonts) · external ✓ ("goblin.tools Formalizer", "tone-slyder", "AI tone slider")
Candidates:
- Native <input type="range"> + CSS Custom Properties + Variable Fonts — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Fonts/Variable_fonts — 0 kB, ARIA slider built in, instant visual update
- tone-slyder — https://github.com/studiosvash/tone-slyder — MIT, covers (-1..+1) -> 5 qualitative prompt buckets + top-3 weight priority, lacks visual CSS coupling
- goblin.tools Formalizer — https://goblin.tools/Formalizer/ — covers tone axis + spiciness level, lacks continuous live visual feedback
Decision: INTEGRATE (native range inputs driving CSS Custom Properties + variable font axes AND a 5-bucket prompt modifier vector)
Saved: no UI component library needed; accessible keyboard/touch sliders out of the box
Residual risk: coupling one slider to both visual feel and LLM output style needs E2E feel tuning
```

**Vom Scout abgeleitete 5 Kandidaten-Achsen („maybe 5 options but only show 3“, Skizze Block 1 & 6):**
1. **warm ↔ cold** *(aus Skizze Block 6 gesetzt)* — Farbtemperatur (Papier/Holz vs. Tech-Blau) + sprachliche Wärme.
2. **soft ↔ sharp** *(zu `form` & `soft and not scary`)* — Eckenradius/Strichweichheit + Direktheit der Sätze.
3. **still ↔ alive** *(zu `on wind` & `vibrant · alive`)* — Bewegungsruhe + Antwort-Energie/Kürze.
4. **dense ↔ airy** *(Option 4)* — Weißraum/Zeilenabstand + Informationsdichte.
5. **plain ↔ playful** *(Option 5)* — Schmucklosigkeit + sprachliche Spielfreude.
*(Empfohlene Standard-3 für `colour · form · output style`: **warm ↔ cold**, **soft ↔ sharp**, **still ↔ alive**.)*

### 5d. Prior Art Block C — Mobile-Sensoren & Pathway-Routing (Scout `ses_e2e12ee66ffe0Vb0rXz8GpRsLl`)

- **MDN Sensor-Verifikation:** `DeviceOrientationEvent.requestPermission()` erfordert
  auf iOS Safari zwingend eine explizite Nutzer-Geste (Transient Activation wie Button-Tap)
  und löst mit `"granted"`/`"denied"` auf
  ([MDN `requestPermission`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static),
  [MDN *Detecting device orientation*](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Detecting_device_orientation)).
  `PointerEvent` und `TouchEvent` benötigen dagegen keinerlei Berechtigung.
- **Cloudflare Service Bindings für Pathways:** Erlauben dem Front-Worker den Aufruf
  spezialisierter Pathway-Worker per RPC oder HTTP im selben Thread ohne Zusatzlatenz
  und ohne öffentliche URL ([Cloudflare Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)).
  Dieses Muster ist in `/home/smlflg/Projekte/Agentfägig.de/site/wrangler.jsonc` bereits
  für `EXPLAIN` erprobt (**REUSE / ADAPT**).

### 5e. Scout Q1 (`ses_e2e0cbb43ffetRePMa6kWjC43u`) — Deutsche Voice-Pipeline & Sub-Agent-Call in `agents/voice`

- **Deutsches STT in `agents/voice` (verifiziert im Quellcode `packages/agents/src/voice/workers-ai.ts`):**
  - `WorkersAIFluxSTT` (`@cf/deepgram/flux`) besitzt in `workers-ai.ts` keinen `language`-Parameter
    und ist auf Workers AI derzeit nur Englisch.
  - **`WorkersAINova3STT(this.env.AI, { language: "de" })`** (`@cf/deepgram/nova-3`,
    `workers-ai.ts:433-591`) ist bereits im Cloudflare `agents/voice`-SDK eingebaut,
    unterstützt Deutsch (`language: "de"`) per WebSocket-Streaming inkl. Endpointing/VAD
    ([Cloudflare Nova-3](https://developers.cloudflare.com/workers-ai/models/nova-3/)).
- **Deutsches TTS in `agents/voice`:**
  - `WorkersAITTS` (`@cf/deepgram/aura-1`) hat auf Workers AI aktuell nur englische Stimmen.
  - Für Deutsch unterstützt `agents/voice` direkt `ElevenLabsTTS` (`eleven_flash_v2_5` mit ~100 ms
    oder `eleven_multilingual_v2` inkl. `de`, [ElevenLabs Models](https://elevenlabs.io/docs/models))
    oder einen eigenen `TTSProvider`-Adapter. Damit ist die Deutsch-Lücke aus
    `tech/CLOUDFLARE_MACHBARKEIT.md:98` technisch geklärt.
- **Sub-Agent-Aufruf + nachgeliefertes Sprechen (klärt T4 aus `tech/CLOUDFLARE_MACHBARKEIT.md:60,99`):**
  - `withVoice(Agent)` behält `this.subAgent(Child, "what-this-is")` im selben Durable-Object-Kontext.
  - Über `this.speak(connection, text)` bzw. `this.speakAll(text)` (`packages/agents/src/voice/index.ts:254-255,585`)
    kann der Front-Agent auch asynchron nachgelieferte Antworten eines Sub-Agenten vorlesen
    und setzt dabei automatisch den Status `"speaking"` → `"listening"`/`"idle"` für die Augen.

### 5f. Scout `FableTP5.2talk` & `GreateWriting.txt` (`ses_e2e0b9f4affecB6LCHiiutwry2`)

- **Aus `FableTP5.2talk` (L1–116) extrahierter Gesprächsstand vor dem Token-Abbruch:**
  - Zwei weiche Augen entstehen aus Gekritzel ohne Gesicht („soft and not scary“, L1–3).
  - Vier Verhaltensweisen benannt: *Atmen* (leichte Bewegung im Ruhezustand), *Blinzeln*
    (unregelmäßig), *Aufmerksamkeit* (beim Tippen aufs Eingabefeld, sonst zum Besucher,
    beim Schwarm-Call kurz zur Seite), *Einschlafen* (bei langer Stille zurück ins Gekritzel, L7–14, 30–32).
  - Bestätigt durch Samuels `ja` (L108): Pathways als Arbeitsteilung (schneller Front-Agent +
    günstiger Schwarm-Agent pro Pathway), erster Build verdrahtet genau einen Pathway Ende-zu-Ende,
    beginnend mit `What this is`.
- **Aus `Agentfähig/GreateWriting.txt` (L180–349, Prinzipien 4–7 & Fazit):**
  - *Death of the Mode* (L182–193): Keine getrennten Modi erzwingen — Sprache, Text und Zeigen
    fließen nahtlos ineinander.
  - *Silence is a feature* (L195–211) & *Minimum Viable Transparency* (L245): Nur so viel
    sichtbares Signal zeigen, dass Vertrauen entsteht (z. B. Blickbewegung der Augen statt
    Spinner/Toasts), danach zurücktreten.
  - *Manual Modes / Exit Hatches* (L321): Sichtbare menschliche Steuerung (unsere max. 3 Slider)
    bewahrt Agency gegen erlernte Hilflosigkeit.

### 5g. Scout Q2 (`ses_e2e07a9eeffewDv37GH3hxOfMT`) — Kopierbare 2-Augen-State-Machines & Timing-Parameter

```markdown
## Prior Art
Problem: A two-eye non-human web avatar needs engineered state-machine timings for blinking, idle wandering/breathing, pointer/input attention, thinking/waiting gaze aversion, and auto-sleep.
Searched: internal ✓ · official ✓ · external ✓ ("CX-ArtLab/BoopFace", "FluxGarage/RoboEyes", "playfultechnology/esp32-eyes")
Candidates:
- CX-ArtLab/BoopFace — https://github.com/CX-ArtLab/BoopFace — MIT, 88 ★, vanilla JS Web Component (<agent-face>) + inline SVG, covers idle/blink/pointer-lerp/input/waiting/sleep
- FluxGarage/RoboEyes — https://github.com/FluxGarage/RoboEyes — GPL-3.0, 964 ★, C++ OLED eyes, covers blink/idle intervals + curious gaze height offset
- playfultechnology/esp32-eyes — https://github.com/playfultechnology/esp32-eyes — AGPL-3.0, 395 ★, Cozmo-style BlinkAssistant + LookAssistant
Decision: ADAPT (copy MIT-licensed state timings and pointer/gaze math from CX-ArtLab/BoopFace into our scribble-SVG eyes)
Saved: no trial-and-error tuning of blink curves, saccade intervals, foreshortening, or waiting cycles
Residual risk: combining BoopFace's SVG eye poses with the initial scribble-parting ("on wind") transition
```

**Direkt übernehmbare Engineering-Werte aus `CX-ArtLab/BoopFace` (`src/boopface-core.js`, `src/boopface-waiting.js`, MIT) & `RoboEyes`:**
- **Blinzel-Dauer:** `150 + Math.random() * 70` ms (150–220 ms), symmetrischer Schließ-/Öffnungs-Lerp auf `0.08` Resthöhe (`boopface-core.js:914-922`).
- **Blinzel-Intervall (unregelmäßig):** `1900 + Math.random() * 2600` ms (alle 1,9–4,5 s; `boopface-core.js:919`).
- **Aufmerksamkeit / Blick-Glättung (Frame-rate-unabhängiger Lerp):**
  `lookSpeed = 0.28` bei aktivem Pointer/Fokus, `0.16` bei ruhigem Idle-Wandern, normiert über `kL = 1 - Math.pow(1 - lookSpeed, dt / 16.67)` (`boopface-core.js:951-954`).
- **Perspektivische Weichheit beim Zur-Seite-Schauen:** Äußeres Auge wird am Rand leicht schmaler (`w = baseW * (1 - 0.22 * edgeFactor²)`, `h = baseH * (1 - 0.08 * edgeFactor²)`), plus „curious gaze“-Höhenoffset aus `RoboEyes` (`FluxGarage_RoboEyes.h:520-532`).
- **Waiting / Thinking (während der Schwarm-Agent arbeitet):** `WAITING_CYCLE = 3200` ms (`boopface-waiting.js:4`) mit sanftem Ein-/Ausblenden über `140` ms Smoothstep (`t * t * (3 - 2 * t)`).
- **Einschlafen (`sleepy` → `sleep`):** `940` ms `inOutCubic`-Übergang bei Inaktivität (`auto-sleep`, `boopface-core.js:739`).

### 5h. Scout Q3 (`ses_e2dff34e2ffeQXPeTD3AfX9Dpd`) — Streaming-Reihenfolge Text vs. Audio in `cloudflare/agents`

Verifiziert gegen `packages/agents/src/voice/index.ts` (L1351–1873) und `client.ts` (L813–907):
1. **Sofortiger Statuswechsel vor dem Modell-Aufruf:** Direkt nach Nutzereingabe sendet
   der Server `transcript { role: "user" }` (`index.ts:1351-1355`) und unmittelbar danach
   `status: "thinking"` (`index.ts:1357`), noch bevor `this.onTurn()` startet (`index.ts:1367`).
2. **Text-Deltas eilen TTS voraus:** In der Token-Schleife (`index.ts:1764-1808`) löst
   das erste nicht-leere Token sofort `transcript_start { role: "assistant" }` (`index.ts:1752-1755`)
   und jedes Token `transcript_delta` (`index.ts:1761, 1802`) aus — **bevor** `chunker.add(token)`
   (`index.ts:1804`) vollständige Sätze in die `ttsQueue` schiebt.
3. **Asynchrone TTS-Synthese im Hintergrund:** `ttsQueue` wird über `eagerAsyncIterable`
   (`index.ts:1901-1927`) nebenläufig abgearbeitet; `status: "speaking"` feuert erst, wenn
   das erste Audio-Chunk tatsächlich fertig synthetisiert ist (`index.ts:1648-1653`).
4. **Konsequenz für das Frontend:** Der Browser empfängt `transcriptchange`-Events
   (`client.ts:878, 890`) in Echtzeit pro Token, ohne auf TTS zu warten. Damit lässt sich
   Samuels Vorgabe („Hauptsache reaktiv — Text wartet nicht auf langsameres Voice“)
   ohne Umbau der Cloudflare-Pipeline direkt umsetzen.

### 5i. Scout Q4 (`ses_e2df5ab56ffe6EdW2yzEQNYPwh`) — Zero-Popup-Verhalten von `VoiceClient` (`cloudflare/agents`)

Verifiziert gegen `packages/agents/src/voice/client.ts` und `index.ts`:
- **Kein Mikrofon-Popup beim Verbinden oder Text-Senden:** `navigator.mediaDevices.getUserMedia`
  wird im gesamten Client **nur an einer einzigen Stelle** aufgerufen (`client.ts:1261`
  in `#startMic()`), und `#startMic()` wird ausschließlich durch einen expliziten Aufruf
  von `startCall()` (`client.ts:607`) erreicht.
- **`connect()` und `sendText()` sind komplett permission-frei:** `connect()` (`client.ts:554`)
  öffnet lediglich den WebSocket (`PartySocket`); `sendText(text)` (`client.ts:685-689`)
  sendet `{ type: "text_message" }` ohne `AudioContext` oder `getUserMedia`.
- **Streaming funktioniert auch außerhalb eines Audio-Calls:** Wenn `isInCall` `false` ist
  (`index.ts:1152, 1192-1269`), streamt `#handleTextMessage` trotzdem sofort `status: "thinking"`,
  `transcript_start`, `transcript_delta` (pro Token) und `transcript_end` an den Client.

### 5j. Scout Q5 (`ses_e2df1f9feffePaJIi3C9Um3F46`) — „Monster Repo“ (`smlfg/MonesterAG-ent-`) & spielerische HAI-Experimente

- **GitHub-Repo `smlfg/MonesterAG-ent-` („Monster World“, live unter `monster-world.smlflg.workers.dev`):**
  - **Architektur (`docs/ARCHITECTURE.md`, `src/monster-agent.ts`):** Ein Cloudflare Worker +
    `MonsterAgent` Durable Object pro `monsterId:sessionId` (`getAgentByName(env.MONSTER_AGENT, monsterId + ":" + sessionId)`),
    eigene SQLite-Tabelle (letzte 12 Nachrichten), Graceful-Degradation auf deterministische
    Antworten bei LLM-Fehlern.
  - **Spielerische UI (`public/app.js:204-314`):** Klick-/Tastatur-zugängliche SVG-Hotspots,
    Chips und Switcher mit sofortiger Reaktion (`showThinking`, `setSpeaking`, `setListening`).
  - **Deutsches Voice-Modul (`src/tts.ts`, `public/app.js:765-803`):** Austauschbarer TTS-Adapter
    (5 deutsche Stimmen mit eigener Rate/Pitch + Browser-`speechSynthesis`-Fallback) und
    Browser-`SpeechRecognition`, die erkannten Text zuerst ins Eingabefeld legt.
- **Weitere spielerische Vorarbeiten in `/home/smlflg/Projekte/Human-Agent-Interface/`:**
  - `AffeHTML/index.html` (mausreaktives Partikel-Chaos → Ordnung per Canvas).
  - `setupinflow/index.html` (6-Schritt-Klick-Intake → kopierbares „Owner Intake Packet“).
  - `Münztelfon/` (10-Minuten-Chat mit sichtbarem Timer & Nachrichten-Zähler).

### 5k. Scout Plaud-2 (`ses_e2df081f7ffeFcNgsEKS78z4as`) — DPPM, `hai-voice-builder` & HAI-Parameter-Slider

Verifiziert anhand des neuen Plaud-Transkripts (`sketches/raw/2026-11-13-nightly-status.txt` / `docs/notes/2026-11-13-nightly-status.md`):
- **DPPM & Merge-Vertrag (`/home/smlflg/Projekte/HAI-DPPM/` & `HAI-Agent-Workflow`):**
  - `HAI-DPPM/Projek-Managment/DPPM_CORE_CANON.md`: *Owner-Intent → parallele Agent-Lanes → Pyramiden-Synthese → ein ruhiges Interface*.
  - `HAI-Agent-Workflow/profiles/hai-agent/skills/hai-minimize/references/dppm-merge-contract.md`:
    definiert das Merge-Schema inkl. **`cognitive-load slider`**.
- **Eigenes HAI-Voice-Repo (`smlfg/hai-voice-builder` & `/home/smlflg/Projekte/TTS/02-hai-speak.md`):**
  - Saubere Modul-Pipeline: `Agent-Event → Policy (hv/profiles.py) → Guards (hv/guards.py: Code/Markdown strippen, Wortlimit) → Chunks (hv/chunk.py: 140 Zeichen, Satzgrenzen-first auf Deutsch) → TTS-Backend (edge/piper/openai/elevenlabs) → Audio-Lane-Lock → Player`.
  - Insbesondere `guards.py` und `chunk.py` (deutsch-bewusstes 140-Zeichen-Satz-Chunking) sind
    1:1 als eigenes Voice-Modul in Agentfähig übernehmbar.
- **Slider als direkte H.A.I.-Parameter (`bio-hai-architecture.md:95`):**
  - In `/home/smlflg/Projekte/HAI-Agent-Workflow/profiles/hai-agent/skills/hai-idea-spec/references/bio-hai-architecture.md:95`
    bereits wörtlich verankert: *„Dynamischer Slider – nicht statisch wenig oder viel Output,
    der Mensch sagt, wie viel er gerade verträgt.“*
  - Kombiniert mit Samuels neuem Plaud-Input (`00:06:02–00:06:13`) steuern die 3 Slider direkt
    die HAI-Parameter:
    1. **Tempo / Tiefe:** `schnell ↔ tief` (sofortige Kurz-Antwort vs. tiefere DPPM-Synthese)
    2. **Cognitive Load (Input/Output-Menge):** `knapp ↔ ausführlich` (weniger vs. mehr Input/Output)
    3. **Atmosphäre / Ton:** `warm ↔ cold` (Farbtemperatur & sprachliche Nähe)

### 5l. Scouts Q5b & Q5c (`ses_e2de968f5ffeb9KyqNckNfOOjr`, `ses_e2de7406dffe5QMTeGS1mFlEmd`, `ses_e2de68598ffe8R3ZoHF8jIOYIp`) — Portfolio-Waypoints & „How to carry the conversation“

**1. Interne Inventur der Ziel-Waypoints (Domains, Produkte, Best GH, Agent-als-Produkt):**
- **Domains (`Human-Agent-Interface/NewDomains/List`, `Domains/`, `project_domain_portfolio_2026_09.md`):**
  `agentfähig.de` (+ `www`), `human-agent-interface.com`, `humanagentinterface.de`,
  `humanagentcontrol.com` (+ `www`), `samuelfleig.com`, `agent-human-interface.com`.
- **Produkte & beste GitHub-Projekte:**
  - `hai-mcp` (`/home/smlflg/Projekte/Human-Agent-Interface/hai-mcp/`, `/home/smlflg/Projekte/hai-mcp-public`)
  - `smlfg/hai-voice-builder`, `smlfg/MonesterAG-ent-`, `HAI-DPPM`, `HAI-Agent-Workflow`, `/home/smlflg/Projekte/best_of`
- **„Solche Agents als Produkt anbieten“ (`for website` in Skizze Block 2):**
  Belegt in Samuels Plaud-Strategien (`06-05 Versionierte AI-Agenten als Produkt`,
  `06-06 Produktstrategie: Maßgeschneiderte KI-Agenten als eigenständiges, hochprofitables Produkt`)
  sowie technisch vorbereitet durch den mandantenfähigen Worker-Ansatz in `Agentfägig.de/site/`.
- **Kontaktdaten:** `/home/smlflg/Projekte/Human-Agent-Interface/samuel/` (`samuel@human-agent-interface.com`).

**2. Prior Art — „How to carry the conversational HAI interaction across many pathways“:**

```markdown
## Prior Art
Problem: Carry a visitor across 10+ destination waypoints (8 domains, hai-mcp, GitHub repos, website-agent-as-a-product, creator contact) through conversation without a menu wall, rigid wizard, or pushy sales script.
Searched: internal ✓ (docs/visual-exploration/03-pathway-flow.md, sketches/:30-53) · official ✓ · external ✓ (OpenAI Agents Handoffs, Anthropic Routing/Orchestrator-Workers, NN/g Progressive Disclosure)
Candidates:
- OpenAI Agents SDK Triage & Handoffs — https://openai.github.io/openai-agents-python/handoffs/ — front triage agent delegates via tool-handoffs to domain specialists
- Anthropic Routing + Orchestrator-Workers — https://www.anthropic.com/research/building-effective-agents — separates fast intent classification/routing from multi-worker synthesis
- NN/g Progressive Disclosure — https://www.nngroup.com/articles/progressive-disclosure/ — defers secondary options until primary direction is chosen
Decision: INTEGRATE (2-tier routing: 3 root currents [What this is / creator / product for X] -> specialist on-demand agent reveals the matching concrete waypoint via "Bridge + 2 Threads")
Saved: avoids building a static navigation menu or 10-button link tree while keeping all 8 domains and products reachable in <= 2 turns
Residual risk: tuning prompt guardrails so the front-agent suggests at most 2 natural next threads without sounding like a sales bot
```

**Konkrete Gesprächsmechanik („How to carry“):**
1. **Nie alle Ziele gleichzeitig zeigen:** Vor oder zu Beginn des Gesprächs existieren nur
   die **3 Grundströme** aus der Skizze (`What this is`, `creator`, `product for X`).
2. **Bridge + max. 2 Fäden pro Turn:** Der Front-Agent antwortet in **1–2 kurzen Sätzen**
   auf die aktuelle Frage (Caching-First) und legt am Ende **höchstens 2 Vokabel-nahe
   Richtungs-Impulse** hin (z. B. *„Willst du sehen, wie so ein Agent auf deiner eigenen
   Seite läuft — oder erst die Open-Source-Projekte wie `hai-mcp` dahinter?“*).
3. **Silent Step + 1 Waypoint-Card bei klarem Intent:** Sobald die Richtung klar ist,
   übernimmt der passende On-Demand-Agent und blendet **genau einen** passenden
   End-Waypoint (z. B. `hai-mcp`, GitHub-Repo, Website-Agent-Anfrage, Domain oder Kontakt)
   ein — ein Themenwechsel des Besuchers lässt den Waypoint sofort wieder ruhig zurücktreten.

### 5m. Scout Prototype-Audit (`ses_e2de031c4ffeXk7moKY9WSTAkS`) — Warum `prototype/index.html` nicht das Zielbild trifft

Geprüft gegen `prototype/index.html` (L1–440), `docs/notes/2026-11-13-nightly-status.md` und `DESIGN_COMMON.md`:
1. **Tote Typografie (`prototype/index.html:30`):** Deklariert `"Bricolage Grotesque", "Newsreader"`,
   bindet aber **keine einzige `@font-face`** ein → Browser fällt auf System-`Georgia` zurück.
2. **Starre Rechteck-Augen statt `BoopFace`-Rig (`:81-106`):** Zwei tote `70×42px`-Divs mit
   statischem `::after`-Punkt und einfachem `scaleY`-Lid — kein Pointer-/Fokus-Tracking,
   kein 3D-Foreshortening, kein Squash-&-Stretch, keine echte Präsenz.
3. **Wörtlicher Zufalls-Striche-Salat (`:328-351`):** `generateScribbles()` würfelt 60–110
   zufällige Mini-Bögen in die Mitte — genau das wörtliche Abmalen der Handskizze, das Samuel
   in der Plaud (`00:02:20`) ausgeschlossen hat.
4. **Verstöße gegen `DESIGN_COMMON.md` (`:31, 149, 190, 311`):** Nutzt `backdrop-filter: blur(...)`
   (Glassmorphism), `linear-gradient` und ein `🎙️`-Emoji statt klarer Materialität (Papierkorn,
   1px-Linien, Tinte, SVG-Ikonografie).
5. **Slider ohne HAI- & Typografie-Kopplung (`:354-376`):** Ändern nur 3 CSS-Variablen, aber
   weder Variable-Font-Achsen noch Antwortstil/Länge noch die sichtbare Interaktions-Architektur.

## 6. Betriebsstand

Direkte CLI-Aufrufe mit gesetztem Prozess-Arbeitsverzeichnis funktionieren.
Der MCP-Adapter übergibt weiterhin ein ungültiges `--dir` und wird umgangen.
Lokale Lesezugriffe sowie `webfetch`/`websearch` wurden beobachtet.
KnowledgeGraph-Zugriff aus OpenCode ist noch nicht nachgewiesen.
