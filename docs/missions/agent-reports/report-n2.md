I'll read the required documents and inspect the existing UI first.
**M-20261119T220518-4585e9fd · Analyse Metrik-Engine-Integration**

## 1) Befunde (mit Beleg)

**Katalog.** 109 Metriken, 12 Parameter (`src/metrics/metrics-catalog.json:…`, Struktur `version/note/parameters/metrics`). Quellen: 73 `user_text`, 26 `turn_timing`, 10 `user_input_events`; **0 `agent_text`**. Folge: alle Metriken sind beim `SUBMIT` berechenbar, bevor die Antwort existiert – außer `lexical_entrainment` (braucht die vorige Antwort). Das ist der wichtigste Latenzbefund: die Oberfläche kann während `thinking` umschalten, nicht erst danach.

**Gewichte.** max. 3 Parameter je Metrik, Gewichte −0.6…+0.6. Summe der Beträge je Parameter schwankt stark (`formality` 11.35 aus 37 Metriken, `playfulness` 3.70 aus 13). `METRIK-PARAMETER-VERTRAG.md:11` fordert 0…1 mit Ruhe 0.5, nennt aber **keine** Normierungsformel → eine ungewichtete Summe sättigt sofort. Es fehlt eine Divisionsregel (`Σ|w|`).

**`normalize` ist Prosa.** 109 Einträge, 75 verschiedene Strings (`"clamp(x / 0.5, 0, 1)"`, `"1 - exp(-count/2)"`, `"count / tokens, clamp"`). Nicht ausführbar; jede Metrik braucht eine JS-Normalisierung.

**Bibliotheken.** 50 ohne Library, 37 winkNLP, 18 compromise, 4 Sentiment/Silben. `package.json` hat **keine** Runtime-Dependency (nur `code-canvas-server` dev) → Installation ist Freigabesache.

**Datenerhebung fehlt.** `store.js:24-29` kennt nur `INPUT {value}`; `conversation.js:153-155` dispatcht nur den Wert. Es gibt **keine** `keydown/keyup/pointer/blur/visibility`-Listener (nur `input`/`submit` in `conversation.js:174-175`, `click` in `presence.js:119`). Damit sind 10 `user_input_events`-Metriken und die meisten der 26 `turn_timing`-Metriken heute nicht messbar (z. B. `backspace_ratio`, `typing_speed_cps`, `window_blur_rate`, `pointer_near_presence_ratio`). `reduce` ist rein (`store.js:19-57`), enthält keine Zeitstempel → Turn-Timing braucht eine Uhr außerhalb des Stores. `first_glyph_ms` (ADR-0006) ist nicht erfasst.

**Unterbrechung.** `SUBMIT` überschreibt `phase` hart (`store.js:31-36`); die Phase *vor* dem Dispatch ist nur am Aufrufort verfügbar (`conversation.js:162-163`). `interruption_rate` muss dort gemessen werden.

**Kein Metrik-Code.** `src/metrics/` enthält ausschließlich `metrics-catalog.json`; kein Import im Repo, kein Worker, kein `requestAnimationFrame`.

**Typewriter.** Inzwischen Zeichen-Modus mit Jitter (`typewriter.js:117-128`), aber `conversation.js:120-128` übergibt **kein** `charDelayMs` → fix 30 ms (`typewriter.js:121`). Kein Stall-, Onset- oder Chunk-Hook. `PARAMETER-OBERFLAECHE.md:8` beschreibt noch Wort-Kadenz – veraltet.

**Augen.** `EyeFace._startRandomBehavior` ist hart verdrahtet (`EyeFace.js:176-201`: Blinzeln 2000+4000 ms, Blick 1500+2500 ms; `maxOffset = 15` in `:136`). Öffentlich sind nur `blink()` (`:114`) und `updateEyePosition()` (`:131`). `presence.js:95-111` zerstört die Face-Instanz bei Pause und baut sie neu → Surface-Werte müssen nach `resume()` erneut gesetzt werden. `presence.js:123-125` startet bei `reducedMotion` gar keine Face-Instanz.

**CSS ist fest.** `max-width: 38rem` (`conversation.css:9`, `:85`), `line-height: 1.5` (`:40`), `pair-in 400ms` (`:17`), `pair-out 600ms` (`:26`), Atem `6s` (`presence.css:57-63`). Keine `--p-*`-Variable; nur `--ease` (`base.css:22`).

**Fixtures.** `conversation-pathways.json`: 13 Pfade, 75 Turns, jeder mit `typing {duration_ms, backspaces, pause_before_send_ms, interrupted_agent}` und **12 erwarteten Parametern**. Also: Goldwerte für Schicht 2 vorhanden, Metrik-Rohwerte fehlen. `tests/markup.test.js:4` zeigt das Muster `readFileSync` → kein JSON-Import-Attribut nötig.

**Store ist im M1-Vertrag fix** (`M1-CONTRACT.md:8`). `subscribe` liefert aber das Event (`store.js:66`), also kann die Engine ohne Store-Änderung an `SUBMIT/RESPONSE_*` andocken.

## 2) Konkrete Schnittstellen

```js
// src/metrics/collect.js
export function createCollector({ root = document.getElementById('stage'), now = () => performance.now() })
// hängt keydown/keyup (nur #composer-input), blur, visibilitychange, pointermove (throttled) an.
// → { beginTurn(turn), endTurn({turn, prompt, phaseBeforeSubmit}) → TurnInputs, destroy() }
```

`TurnInputs` (JSON, einzige Übergabe an Schicht 1):
```json
{ "turn": 3, "prompt": "…", "answer": "…", "phaseBeforeSubmit": "speaking",
  "submitAt": 12345.6, "firstKeyAt": 11000.2, "lastKeyAt": 12290.4,
  "firstGlyphAt": 12387.1,
  "typing": { "keys": [[12000,"a"], …], "backspaces": 2, "longPauses": [1] },
  "pointer": { "samples": 120, "nearPresence": 44 },
  "hiddenMs": 0, "blurCount": 0, "aborted": false }
```

```js
// src/metrics/compute.js
export function computeMetrics(turnInputs, { context })            // → {[id]: 0..1}
export function createParameterEngine({ catalog, alpha = 0.35, maxSlew = 0.08, neutral = 0.5 })
  // → { push(metrics, {turn}) → Params, getParams(), contributions() }
export function normalizeMetric(id, raw, stats)                    // Op-Registry, keine eval()
```
`Params` = `{tempo, density, warmth, calm, closeness, openness, attention, certainty, playfulness, formality, depth, energy}`, je 0…1. Formelvorschlag: `p = clamp(0.5 + Σ wᵢ(mᵢ−0.5) / Σ|wᵢ|, 0, 1)`, dann EMA α und Slew ±0.08.

```js
// src/metrics/surface.js
export function applySurface(params, root = document.documentElement, opts = {})
  // schreibt in einem rAF: --p-<id> plus abgeleitete Variablen
  // → Behaviour (siehe unten), EINZIGE JS-Quelle
export function createSurfaceSmoother({ alphaPerTurn = 0.35, maxSlew = 0.08 })
export function promptFragment(params) → string
```

CSS-Variablen (Namen fix): `--p-tempo --p-density --p-warmth --p-calm --p-closeness --p-openness --p-attention --p-certainty --p-playfulness --p-formality --p-depth --p-energy`, abgeleitet `--type-char-ms --type-jitter-ms --type-stall --onset-delay-ms --leave-ms --pair-measure --pair-gap --pair-line-height --answer-weight --letter-spacing --pair-tilt-deg --blink-interval-ms --blink-jitter-ms --saccade-interval-ms --saccade-radius-px --pupil-scale --lid-open-ratio --gaze-gain --gaze-hold-ms --breathe-ms --breathe-amplitude --thinking-dots-ms`. Immer mit Fallback benutzt: `max-width: var(--pair-measure, 38rem)`.

`Behaviour` (Rückgabe von `applySurface`, wird an die `mount*`-Funktionen gereicht):
```js
{ motion: true,
  type:     { charMs, jitterMs, stallChance, chunksPerTick, onsetMs, leaveMs },
  presence: { blinkMs, blinkJitterMs, doubleBlinkP, saccadeMs, saccadeRadiusPx,
              pupilScale, lidOpenRatio, gazeGain, gazeHoldMs, breatheMs, breatheAmplitude },
  pair:     { measureRem, gapRem, lineHeight, weight, letterSpacingEm, tiltDeg },
  prompt:   { fragment } }
```

Event-Namen. Empfehlung: **kein** neues Store-Event nötig – die Engine abonniert `SUBMIT/RESPONSE_START/RESPONSE_PROGRESS/RESPONSE_END` und veröffentlicht über eigenen Kanal `subscribeParams(fn) → unsubscribe`. Nur falls der Store die Wahrheit halten soll: `{type:'METRICS_UPDATE', turn, params, metrics}` mit `state.params`; dann Pflicht `queueMicrotask` beim Dispatch, weil `store.js:66` die Listener-Kopie synchron durchläuft und ein Dispatch im Listener die Runde reentrant macht.

## 3) Was in der bestehenden UI vorbereitet/geändert werden muss

| Datei | Änderung |
|---|---|
| `conversation.js:120-128` | `charDelayMs`, `jitter`-Anteil, `stallChance` aus `Behaviour` übergeben; erster `onUpdate` → `firstGlyphAt` |
| `conversation.js:157-172` | `phaseBeforeSubmit = store.getState().phase` vor `stopTurn()`; `collector.endTurn()` + `engine.push()`; `onset-delay` vor `agent.respond` |
| `conversation.js:7`, `:66-75` | `LEAVE_FALLBACK_MS` durch `behaviour.type.leaveMs` ersetzen |
| `conversation.js` | `keydown/keyup` und `blur` am Input ergänzen (nur Messung) |
| `presence.js:78-111` | Adapter: eigenes Blinzeln/Sakkaden-Timing über `face.blink()`/`face.updateEyePosition()`; `setSurface(behaviour)`; nach `resume()` neu anwenden; Vendor unverändert |
| `store.js` | nur bei `METRICS_UPDATE`; `params: null` in `initialState` ist testverträglich (`tests/store.test.js:5,8-12` prüft feldweise) |
| `styles/*.css` | harte Werte (`conversation.css:9,17,26,40,85`; `presence.css:57-63`) auf Variablen mit Fallback umstellen; Übergänge auf konkrete Eigenschaften (nicht auf Custom Properties) |
| `living-surface.html` | optional `#metrics-debug` (hidden); muss `tests/markup.test.js` bestehen |
| `main.js:22-23` | `mountPresence/mountConversation` bekommen `surface`; Engine-Start nach Store-Erzeugung |

`reducedMotion`: Variablen ja, Rhythmus nein (`PARAMETER-OBERFLAECHE.md:219`); `presence.js:123-125` bleibt der Pfad ohne Face.

## 4) Reihenfolge / Priorität

- **P1** — Collector (Input-Events + Uhr), `computeMetrics` für die 50 library-freien Metriken, Normierung + `createParameterEngine`, `applySurface` (nur `--p-*`), Anbindung an Typewriter-Kadenz, `leave-ms`, `onset-delay`, `pair-measure`; Goldtest: 75 Fixture-Turns → 12 Parameter in ±0.12, plus `reducedMotion`-Test.
- **P2** — Turn-Timing (26) und Input-Event-Metriken (10) über den Collector, `presence`-Adapter (Blinzeln/Sakkade/Pupille), Debug-Overlay mit Gewichts-Slidern (nur Dev, kein Produktweg).
- **P3** — winkNLP (37) lazy nach `SUBMIT`, erst im Worker, wenn die Messung zeigt, dass der Hauptthread leidet; compromise (18) danach; `promptFragment` in den Agent-Prompt; Feinwirkungen (`stallChance`, `doubleBlinkP`, `tiltDeg`).

Worker-Grenze: DOM-Metriken (`*_rate`, `hidden_time_ratio`, `pointer_near_presence_ratio`) müssen im Hauptthread bleiben und als Zahlen in `TurnInputs` wandern; nur Text-Metriken sind workerfähig.

## 5) Owner-Fragen (nur Produkt)

1. Soll die Veränderung **sichtbar in Stufen** pro Turn passieren (merklicher Wechsel) oder so gleitend, dass niemand sie benennen kann?
2. Darf der Besucher die Metriken je sehen (Debug-Overlay als Teil des Erlebnisses) oder bleibt das reines Entwicklerwerkzeug?
3. Soll der Agent seine Haltung (Prompt-Fragment) schon in Phase 1 bekommen oder erst, wenn die Oberfläche nachweislich funktioniert?
4. Gibt es Parameter, die sich **nie** ändern dürfen (z. B. `formality`), damit die Seite nicht wie ein Kostüm wirkt?
5. Reicht „Reload = Neustart" auch für die Metrik-Historie im Speicher, oder soll ein Turn nach langer Pause bewusst bei 0.5 beginnen?

STOP.
