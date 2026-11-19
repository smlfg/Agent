# M1-Analyse: Ersatz von `src/dev/devAgent.js` durch einen echten Agenten

## 1 · Befunde

**Der Typewriter bekommt heute Volltext, nicht einen Strom.** `conversation.js:113` wartet `await agent.respond(...)` ab; erst danach wird `RESPONSE_START` dispatcht (`conversation.js:117`) und der Typewriter mit dem fertigen `text` gebaut (`conversation.js:120-141`). Damit ist `first_glyph_ms` heute = volle Modell-/Netzzeit + erste Kadenz, nicht TTFT + ein Glyph. ADR-0006 verlangt den Typewriter ausdrücklich als Play-out-Puffer im Budget (`docs/adr/ADR-0006-zeitvertrag.md:48-53`).

**Aktueller „Streaming“-Effekt ist Simulation.** `devAgent.respond` liefert nach `delayMs` genau einen String (`devAgent.js:28-41`); der Typewriter teilt ihn vorab in Einheiten (`typewriter.js:129-135`) und hat keine API, um während des Tippens Text nachzuliefern. `stop()` beendet ohne `onDone` (`typewriter.js:222-228`).

**Abbruch ist rein lokal.** `stopTurn()` ruft `aborter.abort()` und `typewriter.stop()` (`conversation.js:77-86`), aber es gibt kein Signal an einen Server; der Dev-Agent lehnt nur seinen Timer ab (`devAgent.js:37-40`). Beobachtete Client-Frames sind `hello`, `text_message`, `interrupt` — `interrupt` ist im **Voice**-Pfad belegt (`tech/M0-LATENZMESSUNG-2026-11-19.md:73-75`); für den Textpfad ist er **unbelegt**. Der Plan verlangt diese Belegung ausdrücklich vor UI-2 (`docs/EXECUTION_PLAN-M0-M5.md:522`).

**Das Transportprotokoll ist bereits real beobachtet, nicht geraten.** Server→Client im Textpfad: `welcome`, `status`, `transcript`, `transcript_start`, `transcript_delta`, `transcript_end`, `completion_outcome`, `error`, `turn_metrics` (`M0-LATENZMESSUNG:76-80`). Tokens kommen als `transcript_delta {text}` **vor** dem Audio, ohne Wort-Zeitmarken (`docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md:106-114`). Serverseitige Teilzeiten existieren (`modelToFirstTextMs`, `turnTotalMs`, `docs/...AUDIT...:220-230`), `turn_metrics` kommt aber **nach** `status: idle` (`M0-LATENZMESSUNG:84-96`) — wer bei „idle“ schließt, verliert sie.

**Der Store kennt weder Verbindung noch Fehlerdetails noch `seq`.** Zustand ist nur `{phase, prompt, answer, turn, dev}` (`store.js:7-13`), Phasen fest fünf (`store.js:5`). `RESPONSE_ERROR` setzt lediglich `phase: 'idle'` (`store.js:50-52`); sichtbar wird ein hartkodierter Satz (`conversation.js:147`). §10.3 fordert dagegen `connection: idle|connecting|open|offline`, streng monotones `seq`, Snapshot bei Lücke (`EXECUTION_PLAN-M0-M5.md:487-509`).

**Es gibt keine Laufzeit im UI-Repo.** `npm run dev` ist ein Python-`http.server` (`package.json:8`), einzige Dev-Abhängigkeit ist `code-canvas-server` (`package.json:22-23`); `agents`/`wrangler` liegen nicht in `node_modules` (geprüft). Der echte Agent lebt also in einem separaten Worker-Projekt (Klon `examples/voice-agent`, `M0-LATENZMESSUNG:41-43`); der Adapter muss ein reiner ES-Modul-WebSocket-Client ohne Build sein.

**Dokumentwiderspruch Reload.** M2 fordert „Zustandsfeld … überlebt Reload“ (`EXECUTION_PLAN-M0-M5.md:112`) und §10.3 „Reload → Snapshot → sofort Wach, kein zweites Aufwachen“ (`:504-505, :518`). Owner-Entscheid 19.11.: „Reload = Neustart, nichts bleibt“ (`docs/missions/M-20261119T212224-5bca4784-ADR-BESPRECHUNG.md:30`, `M1-CONTRACT.md:6`). Vor Snapshot-Bau muss das aufgelöst werden.

**Offline/Quota hat keinen Ort in der UI.** Presence mappt nur Phase→Mood (`presence.js:9-15`); `#status`/`#error` fehlen im Markup (`living-surface.html:45-68`). Der reale Fehlerfall ist belegt: `4006` Tageskontingent (`M0-LATENZMESSUNG:186-199`).

**Messpunkt existiert als Muster, nicht als Code.** `t_send` = ausgehendes `text_message` (`tech/m0/instrument.js:16, 81-90`); „erster sichtbarer Text“ = nicht-leerer Assistant-Text im DOM + zwei `requestAnimationFrame` (`instrument.js:306-347`, Definition `M0-LATENZMESSUNG:51-66`).

**Nebenbefund Kadenz-Drift:** Vertrag sagt wortweise (`M1-CONTRACT.md:32-33`), Code nutzt `unit: 'char'` (`conversation.js:122`) mit Default 30 ms (`typewriter.js:121`). Für ADR-0006 (Kadenz = Budget) ist das relevant.

## 2 · Konkrete Schnittstellen

**Adapter (neues Modul, Namensregel N1 beachten, `docs/DATEINAMEN.md:9-17`):**

```js
export function createAgentTransport({
  url,                        // ws://127.0.0.1:8787/agents/<name>/<sessionId>
  sessionId,
  WebSocketImpl = WebSocket,
  now = () => performance.now(),
}) => {
  connect(): Promise<{ snapshot: { seq, turnId, text, status } | null }>;
  respond(prompt, { turn, signal, onSegment, onDone, onError }): void;
  interrupt(turn): void;              // Frame-Name vor Bau belegen (Plan:522)
  close(): void;
  getConnection(): 'idle'|'connecting'|'open'|'offline';
  subscribe(fn): () => void;          // {type:'connection'|'error'|'snapshot'|'metrics'}
}
```

**Segmentform (Client sieht sie; Zeit aus dem DO laut ADR-0006:44-47):**

```json
{ "turnClient": 3, "turnId": "turn_7", "seq": 41, "index": 7,
  "text": "word ", "unit": "word", "tServerMs": 2891 }
```

`tServerMs` ist **nicht** mit `performance.now()` verrechenbar (`M0-LATENZMESSUNG:47-49`); `first_glyph_ms` bleibt eine reine Client-Größe.

**Store-Erweiterung (additiv, `store.js:7-13`):**
`link: 'idle'|'connecting'|'open'|'offline'`, `error: null | {code, stage, retryable}`, `seq`/`lastSeq`, `source: 'agent'|'dev'`.
Neue Events: `LINK {connection}` · `RESPONSE_START {turn, source}` (jetzt beim **ersten** Segment, nicht nach Volltext) · `RESPONSE_PROGRESS {turn, text}` (unverändert) · `RESPONSE_ERROR {turn, code, stage, retryable}` · `METRIC {turn, name, value}`. Stale-Turn-Regel bleibt (`store.js:38-52`).

**`mountConversation`** behält die Signatur (`M1-CONTRACT.md:31`), nur `agent.respond` wechselt von `Promise<{text,dev}>` auf Streaming mit `onSegment`. Zusätzlich `mountStatus({root, store})` für C-08/C-09.

**`createTypewriter`** additiv: `→ { start(), stop(), append(chunk), end() }`; `end()` ruft `onDone`, sobald die Queue leer ist. Der bestehende Volltext-Pfad (`typewriter.js:129-135, 209-220`) bleibt, damit `tests/typewriter.test.js` gültig bleibt.

**CSS:** vorhandene Tokens in `base.css:3-22`; neu `[data-link="offline"]` am `#stage` (Muster `main.js:14-16`), `--type-cadence-ms`/`--type-jitter-ms` (heute keine Variablen in `typewriter.css`, geprüft), `--leave-ms` statt fixer `600ms` (`conversation.css:26`), später `--p-*` laut `PARAMETER-OBERFLAECHE.md`.

## 3 · Was in der bestehenden UI vorbereitet/geändert werden muss

- `living-surface.html` (Integrator-Datei, `M1-CONTRACT.md:8-9`): `#status`, `#error`, Dev-Badge semantisch an `source` binden statt fest (`main.js:18-20`).
- `store.js`: Felder/Events aus §2; `RESPONSE_START` beim ersten Segment zulassen, sonst bleibt die Phase bis zum Volltext `thinking`.
- `conversation.js`: Typewriter **vor** Textende starten, `append` pro Segment, `interrupt(turn)` im Abort-Pfad, Fehlertext/Code aus dem Server statt `conversation.js:147`.
- `typewriter.js`: `append/end` plus definiertes Verhalten bei leerem Puffer (ADR-0006:91-95 nennt das ausdrücklich als offene Produktfrage).
- `main.js`: Transport statt `devAgent` wählen; Endpoint ist ein neuer Config-Key → Freigabe nötig (`AGENTS.md:34`). Dev-Daten als klar markierter Fallback (`devAgent.js:4`) erhalten.
- Tests: Fake-WebSocket-Adapter (Reihenfolge, `seq`-Lücke ⇒ Snapshot, Duplikat verwerfen, Quota ⇒ genau eine Meldung, Plan:507-509), gestreamter Typewriter, `first_glyph_ms`-Probe nach `instrument.js:306-347`.

## 4 · Reihenfolge / Priorität

**P1 (M2-Durchstich):** Transportmodul + Adaptervertrag, gestreamter Typewriter (`append/end`), `RESPONSE_START` am ersten Segment, `first_glyph_ms`-Messpunkt, minimale Fehler-/Offline-Zeile, Store-Felder `link/error/source`.
**P2:** Snapshot/`seq`/Reconnect nach §10.3, serverseitiger `interrupt` (Frame zuerst belegen), Reload-Semantik klären.
**P3:** Segment-Zeitstempel aus dem DO (ADR-0006, heute HYPOTHESIS `ADR-0006:86-87`), Metriken → CSS-Variablen (M3).

## 5 · Owner-Fragen (Produkt)

1. Wenn Kontingent/Modell ausfällt (`4006`, `M0:186-199`): sichtbarer Satz, stilles Dimmen der Augen, oder ein Knopf „erneut versuchen“?
2. Heißt Unterbrechen nur „sichtbare Antwort stoppt“ oder auch „der Agent hört auf zu arbeiten“ (Kosten/Zeit)?
3. Reißt die Verbindung mitten im Satz ab: Rest nachliefern (Snapshot) oder Turn als beendet behandeln — und wie passt das zu „Reload = Neustart“?
4. Darf die Seite ohne erreichbaren Agenten weiterhin erkennbar erfundene Antworten zeigen, oder muss sie dann schweigen?
5. Was tun die Augen offline — schlafen oder wach und still?
6. Bleibt die Tipp-Kadenz fest, oder folgt sie später dem Gesprächs-`tempo` (dann ist sie Teil des Zeitvertrags)?
