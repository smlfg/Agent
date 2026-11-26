# M0 — Analyse des deployed Textpfads (agentfähig.de)

Stand: 20.11.2026. **Status: ANALYSE — kein POST an `/api/agent`, kein Prompt,
keine Messung.** Owner-Entscheidung vom 19.11.2026: „Nur analysieren, nichts
senden." Es wurden ausschließlich öffentliche GET/HEAD-Abrufe der statischen
Dateien und des `405`-Verhaltens von `/api/agent` gemacht; der Endpoint wurde
nicht aufgerufen.

Bezug: [M0-Messlauf Textpfad](M0-LATENZMESSUNG-2026-11-19.md),
[UNSOLVED-TECHNIK](../docs/UNSOLVED-TECHNIK.md) U1/U12/U30,
[Messlauf-Plan](MESSLAUF-PLAN.md).

## 0 · Kurzfassung

| Punkt | Befund |
|---|---|
| Ziel | deployed V1 „Living Surface", nicht der lokale `examples/voice-agent` |
| Backend | Cloudflare Worker, `POST /api/agent` → MiniMax `MiniMax-M3.1-Flash`, OpenAI als Fallback |
| Antwortform | **nicht streamend**: ein JSON `{ text, provider, model }` nach der vollständigen Generierung |
| Vorhandene Messung | `metrics/collect.js` sammelt Tippverhalten und `submitAt`/`responseEndAt`; **keine Latenz** |
| Erster sichtbarer Text | `RESPONSE_START` (nach vollständigem JSON) + erster Typewriter-Schritt (~22–38 ms) + Frame |
| Erstes hörbares Audio | **N/A** — die Oberfläche hat keine TTS-Ausgabe; das Mikrofon ist nur Eingabe (Web Speech API) |
| Serverseitige Teilzeiten | **nicht exponiert**: kein Streaming, kein `Server-Timing`, keine Timing-Felder im JSON |
| Modellkennung | `model` im Response-JSON; `provider` im JSON ist `minimax`/`openai`, wird aber vom Client-Chain auf `remote` überschrieben |
| Harte Grenze | Rate-Limit 20 POSTs / 10 min pro IP; Verifikation + 20 Turns = 21 → der letzte wird `429` und fällt auf Dev-Daten zurück |
| Timeouts | Client-Chain 8 s < Worker 9 s < Remote-Adapter 12 s; über 8 s wird der Turn Dev-Daten, nicht Messwert |

## 1 · Was die deployed Seite ist

Die Seite liefert statische Dateien plus einen Worker-Endpoint:

- `index.html`, `main.js`, `src/**` (Living Surface, Augen, Typewriter,
  Composer) werden als Assets ausgeliefert.
- `POST /api/agent` ist der einzige Agent-Endpoint
  ([`deploy/agentfaehig-site/src/worker.js:28`](../deploy/agentfaehig-site/src/worker.js)).
- Der Worker ruft MiniMax über den Anthropic-kompatiblen Endpoint auf
  (`MINIMAX_BASE_URL`/`DEFAULT_MINIMAX_MODEL`,
  [`worker.js:4–6`](../deploy/agentfaehig-site/src/worker.js)); Modell:
  `MiniMax-M3.1-Flash`, `max_tokens: 900`, `temperature: 0.8`,
  Provider-Timeout 9 s ([`worker.js:8–10`](../deploy/agentfaehig-site/src/worker.js)).
- OpenAI ist der Fallback, wenn `MINIMAX_API_KEY` fehlt oder MiniMax scheitert
  ([`worker.js:67–79`](../deploy/agentfaehig-site/src/worker.js)).
- Die Antwort ist **kein Stream**: Der Worker wartet auf `response.json()` und
  gibt erst dann `{ text, provider, model }` zurück
  ([`worker.js:165–176`](../deploy/agentfaehig-site/src/worker.js)).

## 2 · Messpunkte, die der Code tatsächlich bietet

Die Seite hat einen ausdrücklich als Debug-Handle ausgewiesenen Beobachtungspunkt:
`window.__agentfaehig` mit `store`, `surface`, `presence` usw.
([`src/main.js:128–140`](../src/main.js)). Der Store ist ein reiner Reducer mit
den Ereignissen `SUBMIT`, `RESPONSE_START`, `RESPONSE_PROGRESS`, `RESPONSE_END`,
`RESPONSE_ERROR` ([`src/state/store.js:31–52`](../src/state/store.js)).

| Messpunkt | Wo im Code | Uhr | Bedeutung |
|---|---|---|---|
| `T_submit` | `SUBMIT`-Event, [`store.js:31`](../src/state/store.js) | `performance.now()` | Nutzeraktion; der Fetch startet unmittelbar danach |
| `T_fetch_start` | `fetchImpl(url, …)`, [`remoteAgent.js:155`](../src/agent/remoteAgent.js) | Client | präziser T0, wenn der Request tatsächlich rausgeht |
| `T_backend` | `RESPONSE_START`, [`conversation.js:182`](../src/conversation/conversation.js) | Client | vollständiges JSON da; **keine TTFT**, weil nicht gestreamt |
| `T_first_text_event` | erster `RESPONSE_PROGRESS` mit nicht-leerem Text, [`conversation.js:197`](../src/conversation/conversation.js) | Client | erster sichtbarer Text im Store |
| `T_first_text_dom` | MutationObserver auf `.pair-answer .tw-text` + zwei Frames | Client | annähernd „nach Paint"; untere/obere Schranke dokumentieren |
| `T_response_end` | `RESPONSE_END`, [`conversation.js:200`](../src/conversation/conversation.js) | Client | Typewriter fertig; **keine Latenz**, sondern Lesedauer |
| `T_audio` | — | — | **N/A**, keine TTS-Ausgabe |
| `T_error` | `RESPONSE_ERROR`, [`conversation.js:211`](../src/conversation/conversation.js) | Client | Fehler-/Fallback-Turn |

Der Typewriter startet unmittelbar nach `RESPONSE_START`; der erste Schritt wird
nach `baseDelay()` geplant ([`typewriter.js:336–346`](../src/conversation/typewriter.js)).
Bei der Standard-Kadenz sind das etwa 22–38 ms, plus ein Frame bis zum Paint.
**Wichtig:** `--onset-delay-ms` wird in
[`metrics/surface.js:269`](../src/metrics/surface.js) berechnet und als
CSS-Variable geschrieben (`surface.js:355`), aber im ausgelieferten
`conversation.js` **nicht an `createTypewriter` übergeben**; ein Consumer im
CSS wurde nicht gefunden. Die in Design-Dokumenten erwartete 250–1800-ms-Pause
ist damit **nicht** wirksam. Für die Messung heißt das: „erster sichtbarer
Text" liegt nur wenige Millisekunden nach „Backend fertig", nicht 0,25–1,8 s.

## 3 · Was die vorhandene Instrumentierung leistet — und was nicht

`metrics/collect.js` ist die vorhandene Messinstrumentierung. Sie sammelt pro
Turn:

- `submitAt` (Zeitpunkt `SUBMIT`),
- `responseEndAt` (Zeitpunkt `RESPONSE_END`),
- Tastatur-, Pointer-, Blur- und Sichtbarkeitsdaten,
  ([`collect.js:58–75`](../src/metrics/collect.js)).

`metrics/compute.js` verarbeitet diese Eingaben zu Interaktionsmetriken
(Tipptempo, Pausen, Prompt-Länge, Topic-Shift usw.) für die Oberflächenanpassung.
Dort gibt es **keine** Latenzmessung und keine Weitergabe an den Store oder die
UI ([`compute.js:345–496`](../src/metrics/compute.js)).

**Konsequenz:** Die vorhandene Instrumentierung kann die M0-Frage nicht
beantworten. Sie misst `submitAt → RESPONSE_END`, also Modellzeit **plus**
Typewriter-Dauer; `responseEndAt` ist kein Modell-Endpunkt. Der Backend-Zeitpunkt
(`RESPONSE_START`) wird nirgends festgehalten. Ein Messlauf braucht deshalb
einen zusätzlichen Beobachter, nicht eine Änderung der vorhandenen Metriken.

## 4 · Modell, Provider und Fallback

Der Worker gibt `{ text, provider, model }` zurück
([`worker.js:70,77`](../deploy/agentfaehig-site/src/worker.js)). Der
Remote-Adapter übernimmt `provider` und `model` in sein Ergebnis
([`remoteAgent.js:176–181`](../src/agent/remoteAgent.js)).

**Aber:** Die Agent-Chain überschreibt `provider` mit der Adapter-ID:

```js
return { ...result, text, dev, provider: id, attempts }; // id === "remote"
```

([`chain.js:276–282`](../src/agent/chain.js)). Im Store/UI steht damit
`provider: "remote"`, nicht `minimax`/`openai`. Die tatsächliche
Provider-Kennung steht nur im Response-JSON des `/api/agent`-Requests. Für die
Messung muss deshalb der **Response-Body** erfasst werden (z. B. durch einen
`fetch`-Wrapper), nicht nur das Chain-Ergebnis.

`model` bleibt erhalten. Der Wert ist die Laufzeit-Wahrheit; es gibt keinen
UI-Modellschalter auf dieser Seite. Ein `dev: true` im Ergebnis bedeutet
Dev-Daten; die Seite zeigt dafür das Badge `DEV DATA`
([`main.js:67–68`](../src/main.js), `conversation.js` setzt `dev`). Solche Turns
sind **keine Messwerte** und müssen ausgeschlossen werden.

## 5 · Harte Randbedingungen für einen möglichen Lauf

1. **Rate-Limit:** 20 POSTs pro 10 Minuten pro IP, in-memory pro Isolate
   ([`worker.js:15–16,252–270`](../deploy/agentfaehig-site/src/worker.js)).
   Ein Verifikationsturn **plus** 20 Turns sind 21 POSTs; der 21. erhält `429`.
   Der Client klassifiziert `429` als `quota` und fällt auf Dev-Daten zurück
   ([`remoteAgent.js:36–41`](../src/agent/remoteAgent.js),
   [`chain.js:246–263`](../src/agent/chain.js)). Ein 20-Turn-Lauf ist daher nur
   möglich, wenn der Verifikationsturn **als Turn 1 zählt** oder ≥ 10 Minuten
   dazwischen liegen.
2. **Timeout-Kaskade:** Die Chain bricht jeden Provider nach **8 s** ab
   ([`chain.js:5–10`](../src/agent/chain.js)); der Remote-Adapter erlaubt 12 s
   ([`remoteAgent.js:9`](../src/agent/remoteAgent.js)), der Worker 9 s
   ([`worker.js:8`](../deploy/agentfaehig-site/src/worker.js)). Der
   wirksame Client-Grenzwert ist 8 s. Ein Antwort nach 8 s wird Dev-Daten; der
   OpenAI-Fallback des Workers (nach 9 s) ist vom Browser aus **nicht
   erreichbar**. Solche Turns sind ungültig, nicht langsam.
3. **Kein Streaming:** Der Client sieht nur das fertige JSON. „Time to first
   token“ ist auf dieser Oberfläche nicht messbar; `T_backend` ist die
   vollständige Generierung.
4. **Keine Server-Teilzeiten:** Der Worker setzt kein `Server-Timing` und gibt
   keine Timing-Felder zurück. Die Chain berechnet zwar pro Versuch
   `elapsedMs` ([`chain.js:240,271`](../src/agent/chain.js)), aber
   `conversation.js` und der Store ignorieren `attempts`; sie sind ohne
   Produktänderung nicht abrufbar.
5. **Kein Audio:** `voice/mic.js` nutzt ausschließlich die Web Speech API als
   **Eingabe**; es gibt keine TTS-Ausgabe
   ([`mic.js:1–20,276–345`](../src/voice/mic.js)). „Erstes hörbares Audio“ ist
   auf dieser Oberfläche systematisch **N/A**.
6. **Kontext:** Der Remote-Adapter hält drei Turn-Paare im Speicher; ein Reload
   setzt den Verlauf zurück ([`remoteAgent.js:9–10,100–106`](../src/agent/remoteAgent.js)).
   Ein frischer Browser-Context ist damit eine isolierte Conversation; eine
   explizite Conversation-ID wie im voice-agent gibt es nicht.

## 6 · Minimaler Messaufbau ohne Produktänderung

Der folgende Aufbau ist **nicht gebaut und nicht ausgeführt**; er beschreibt
den kleinsten Weg, wenn der Owner diesen Pfad als Messziel freigibt:

1. Playwright mit frischem Context, eine Seite, ein Client; keine parallelen
   Tabs auf derselben Seite.
2. `addInitScript` vor dem App-Start:
   - `window.fetch` wrappen: `T_fetch_start`, `T_headers`, `T_json`; für
     `/api/agent` Request-Prompt und Response-`{ text, provider, model }`
     festhalten. Der Wrapper verändert weder Request noch Response.
   - Nach dem Laden `window.__agentfaehig.store.subscribe(...)` und
     `SUBMIT`, `RESPONSE_START`, ersten nicht-leeren `RESPONSE_PROGRESS`,
     `RESPONSE_END`, `RESPONSE_ERROR` mit `performance.now()` aufzeichnen.
   - MutationObserver auf `.pair-answer .tw-text` für den DOM-/Frame-Zeitpunkt.
   - `performance.timeOrigin` mitschreiben; Serverwerte nie mit der Client-Uhr
     verrechnen.
3. Pro Turn: `#composer-input` füllen, Enter; auf `RESPONSE_END` oder
   `RESPONSE_ERROR` warten; `dev`, `provider`, `model` prüfen.
4. Rohdaten als JSONL je Turn plus vollständige Event-Spur; Statistik aus
   `T_fetch_start → erster nicht-leerer Text` (primär), `T_fetch_start →
   T_backend` (Backend total) und `T_fetch_start → T_response_end` (Typewriter,
   nur als Komfortgröße). Audio bleibt `null` mit Begründung.
5. Ungültig sind: `dev: true`, `429`, Timeout, `RESPONSE_ERROR`, leerer Text.
   Sie gehen in die Fehlerquote ein, nicht in die Latenzstatistik.

Das ist im Kern derselbe Beobachtertyp wie der vorhandene
[`m0/instrument.js`](m0/instrument.js), nur gegen den deployed Store und
`fetch` statt gegen den voice-agent-WebSocket.

## 7 · Was eine Produktänderung bräuchte (nicht getan)

- **TTFT / serverseitige Teilzeiten:** Streaming aus dem Worker oder ein
  `Server-Timing`-Header bzw. ein `timings`-Feld im JSON. Das ist eine
  Architektur-/API-Änderung, keine Messinstrumentierung.
- **Hörbares Audio:** eine TTS-Stufe. Die aktuelle Oberfläche hat keine.
- **Rate-Limit-Spielraum:** 20/10 min ist für 20 Turns exakt ausreichend, aber
  ohne Reserve. Mehr Turns brauchen eine andere Grenze oder ein anderes
  Messfenster.

## 8 · Entscheidung und nächster Schritt

Die deployed Seite ist ein **anderer Messgegenstand** als der lokale
voice-agent: text-only, nicht streamend, anderer Provider, andere Zeitgrenzen.
Eine Übernahme der früheren M0-Zahlen ist nicht möglich; die Definitionen und
Grenzen müssen neu geschrieben werden.

**Offen (Owner):** Soll agentfähig.de der M0-Messgegenstand sein? Wenn ja:
- entweder ein Lauf mit 20 Turns, bei dem Turn 1 die Verifikation ist,
- oder ein Verifikationsturn, ≥ 10 Minuten Pause, dann 20 Turns.
Beides braucht die ausdrückliche Freigabe für POSTs an die Produktion. Bis
dahin bleibt es bei dieser Analyse; es wurde kein Request an `/api/agent`
gesendet.

## 9 · Belege

| Aussage | Datei/Zeile |
|---|---|
| Endpoint `POST /api/agent` | `deploy/agentfaehig-site/src/worker.js:28` |
| MiniMax-Default, 9 s, 900 Tokens | `deploy/agentfaehig-site/src/worker.js:4–10` |
| Nicht streamende Antwort | `deploy/agentfaehig-site/src/worker.js:131–176` |
| Rate-Limit 20/10 min | `deploy/agentfaehig-site/src/worker.js:15–16,252–270` |
| Remote-Adapter, 12 s, `{provider, model}` | `src/agent/remoteAgent.js:9,155–181` |
| Chain-Timeout 8 s | `src/agent/chain.js:5–10` |
| Chain überschreibt `provider` | `src/agent/chain.js:276–282` |
| Store-Events | `src/state/store.js:31–52` |
| `RESPONSE_START`/`PROGRESS`/`END` | `src/conversation/conversation.js:182,197,200` |
| Typewriter erster Schritt | `src/conversation/typewriter.js:336–346` |
| `--onset-delay-ms` ohne Consumer | `src/metrics/surface.js:269,355`; `conversation.js` übergibt es nicht |
| Vorhandene Metriken ohne Latenz | `src/metrics/collect.js:58–75`; `src/metrics/compute.js:345–496` |
| Keine TTS, nur Web-Speech-Eingabe | `src/voice/mic.js:1–20,276–345` |
| Debug-Handle `window.__agentfaehig` | `src/main.js:128–140` |

Keine POST-Anfrage, kein Prompt, keine Latenzzahl in diesem Dokument.
