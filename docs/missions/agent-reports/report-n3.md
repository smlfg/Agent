# Voice Phase 2 — Andockanalyse (nur lesen)

Gelesen: M1-BERICHT, M1-CONTRACT, ADR-BESPRECHUNG, `store.js`, `conversation.js`, `typewriter.js`, `presence.js`, `living-surface.html`, CSS, `BaseFace.js`/`EyeFace.js`, Metrik-Vertrag, Parameter-Oberfläche, ADR-0006, Metrik-Katalog, Wireframes C-05/C-16. Keine Datei geändert, kein git.

## 1) Befunde

**Phase ist überlastet.** `phase` ist eindimensional (`store.js:5`) und wird von Presence direkt auf einen Mood abgebildet (`presence.js:9-15,62-70`). „Agent spricht" und „Mikrofon hört" sind beim Unterbrechen gleichzeitig wahr, `phase` kann nur eines sein. Voice braucht ein orthogonales Feld, keine neuen Phasen.

**Reducer kennt Voice nicht.** Zustand nur `phase,prompt,answer,turn,dev` (`store.js:7-13`). `INPUT` wird während `thinking/speaking` verworfen (`store.js:26`); `RESPONSE_*` gilt nur in exakt `thinking/speaking` (`store.js:39,43,47`). Ein `phase='listening'` fürs Mikrofon würde Antwort-Deltas still verschlucken.

**Store meldet nur echte Änderungen.** `if (state !== prev)` (`store.js:66`). Ein Event, das nur „Mikrofon angefragt" vermerkt, muss ein neues Objekt zurückgeben, sonst sieht die UI nichts.

**Kein Voice-UI.** `living-surface.html` hat Composer (`:50-59`), Live-Region (`:62`), Motion-Toggle (`:65`), aber keinen Mic-Knopf und keine Consent-Zeile. Ein `#mic` existiert nur im nicht akzeptierten Prototyp (`prototype/index.html:311`; `INTEGRATION-FIRST-WHAT-THIS-IS.md:60`). Die Vokabeln liegen vor: C-05 MicControl mit bereit/angefragt/hört/verweigert/nicht verfügbar/gesperrt und C-16 ConsentLine „eine Zeile, kein Pflichtklick" (`docs/wireframes/02-components.md:35,46`); M1 strich beide bewusst (`M1-BERICHT.md:48-49`).

**Composer ist einzeilig und quellenblind.** `type="text"` (`living-surface.html:52`); jedes `input` dispatcht `INPUT` ohne Quelle (`conversation.js:153-155`); Submit liest nur `input.value` (`:157-172`). Ein STT-Teiltranskript im selben Feld ist nicht von Tippen unterscheidbar und überschreibt Nutzereingaben.

**Typewriter ist eine selbstgetaktete Kette, keine Uhr.** Jeder Schritt berechnet seine Verzögerung neu (`typewriter.js:153-183`) und plant `schedule(step, delay)` (`:206`). Öffentlich nur `start/stop` (`:230`), kein `pause/resume`, keine Clock- oder Segmentparameter. `conversation.js:120-141` übergibt weder Kadenz noch Zeitbasis. ADR-0006 verlangt genau eine Uhr und denselben Segmentschnitt für TTS, Typewriter und Messung (`ADR-0006:38-53`), dazu `first_glyph_ms` und `first_audio_ms` getrennt (`:50-53`).

**Amplitude ist heute ein No-op.** `BaseFace.setAmplitude` ist leer (`BaseFace.js:77-79`), `EyeFace` überschreibt es nicht (`EyeFace.js:26-208`: nur `setMood`, `blink`, `updateEyePosition`, `destroy`). `FaceManager` delegiert (`BaseFace.js:238-240`), Presence nutzt ihn aber nicht, sondern instanziiert `EyeFace` direkt (`presence.js:4,80-82`) und gibt nur `pause/resume/destroy` zurück (`:144`). Ein Amplitude-Ruf an die Augen ist wirkungslos.

**Vendor-EventBus kollidiert mit Mood.** `EyeFace` hört auf `tts:start/stop` und `stt:start/stop` und setzt selbst `listening`/`neutral` (`EyeFace.js:75-78`). Emittiert ein Voice-Modul diese Events, überschreibt es die Zuordnung aus `presence.js:9-15`.

**Barge-in ist im Metrik-Katalog schon definiert.** `interruption_rate` = „SUBMIT während thinking/speaking" (`metrics-catalog.json:1394-1408`); der Reducer behandelt genau das als Unterbrechung (`store.js:31-36`). Voice-Barge-in kann `SUBMIT` wiederverwenden, statt einen zweiten Begriff zu erfinden.

**Voice fehlt in den Metriken.** 109 Einträge, Quellen ausschließlich `user_text` (73), `turn_timing` (26), `user_input_events` (10); `first_glyph_ms`/`first_audio_ms` kommen nicht vor (Suche: 0 Treffer).

**Kosten erzwingen Push-to-Talk.** Offene Mikrofon-Sessions haben das Tageskontingent verbraucht; „Push-to-Talk/VAD ist Kosten-Necessität" (`docs/UNSOLVED-TECHNIK.md:26`, U32).

## 2) Schnittstellen

Additive Store-Events (unbekannte fallen heute still durch, `store.js:54-55`):

```js
// state additions, keine neuen PHASES
state = { ..., turn, source: 'text'|'voice',
  mic: 'idle'|'requested'|'listening'|'denied'|'unavailable'|'blocked',
  interim: '', consent: 'unseen'|'seen' }

{ type:'INPUT', value, source:'text'|'stt' }           // bestehend + optional source
{ type:'SUBMIT', prompt, source:'text'|'voice' }       // source wird heute ignoriert (store.js:31-36)
{ type:'MIC_PERMISSION', state:'requested'|'granted'|'denied'|'unavailable'|'blocked' }
{ type:'STT_PARTIAL', turn, text }                     // nur interim, keine Phase
{ type:'STT_FINAL', turn, text }                       // → SUBMIT {source:'voice'}
{ type:'SPEECH_START', turn, at }
{ type:'SPEECH_LEVEL', turn, level }                   // 0..1, gedrosselt
{ type:'SPEECH_END', turn, at, reason:'done'|'barge-in'|'error' }
{ type:'BARGE_IN', turn }                              // → stopTurn + SUBMIT
{ type:'CONSENT_SEEN', kind:'microphone' }
```

Mount-Signaturen im bestehenden Muster (`M1-CONTRACT.md:22,31`):

```js
export function mountVoice({ root, store, presence, agent, reducedMotion })
  // → { requestMic(), startListening(), stopListening(),
  //     speak(text,{turn,segments}), stopSpeaking(), setConsent(), destroy() }

mountPresence(...) // Ergänzung: → { pause, resume, setAmplitude(level), destroy }
createTypewriter({ ..., clock, segments }) // → { start, stop, pause, resume }
  // onUpdate(visible, { state, index, total, unit, atMs })
```

DOM/CSS:
```html
<button id="mic-toggle" type="button" aria-pressed="false" aria-describedby="consent">…</button>
<p id="consent">…one line…</p>
```
```css
#stage[data-mic="idle|requested|listening|denied|unavailable"] { … }
:root { --voice-level: 0; --p-energy: .5; } /* Layer-3-Konvention, METRIK-PARAMETER-VERTRAG.md:48 */
```
`#stage[data-mic]` spiegelt wie `data-phase` (`main.js:14-16`) und ist ohne JS prüfbar. `#mic-toggle` braucht `type="button"`, weil der Send-Button `type="submit"` ist (`living-surface.html:53`).

TTS-Vertrag, eine Uhr:
```js
speak(text, { turn, segments:[{ text, startMs, endMs }], clock: () => ms })
// Fallback ohne Zeitmarken: Satz sprechen, sobald sein erster Buchstabe sichtbar wird
```
Der Typewriter liest dieselbe `clock`; beide Messgrößen beziehen sich auf dieselbe Nullpunktsreferenz (`ADR-0006:44-53`). Ob Zeitmarken aus STT/TTS kommen oder der DO sie vergibt, ist offen (`ADR-0006:91-97`).

Barge-in ruft den vorhandenen Abbruchpfad (`conversation.js:77-86`, heute privat — aus `mountConversation` exponieren) und dispatcht `SUBMIT {source:'voice'}`, damit `interruption_rate` stimmt.

## 3) Was vorbereitet oder geändert werden muss

| Datei | Nötig |
|---|---|
| `state/store.js` | `mic/interim/consent/source`; Events oben; jede akzeptierte Änderung als neues Objekt (`:66`); Turn-Guards für STT wie bei `RESPONSE_*` (`:39,43,47`) |
| `main.js` | `stage.dataset.mic = state.mic`; Voice-Mount nur mit Adapter |
| `living-surface.html` | `#mic-toggle` (type=button), `#consent`, `aria-describedby`; `#live` bleibt einzige Ansage (`:62`) |
| `conversation/conversation.js` | `interim` getrennt vom Nutzertext; `stopTurn`/`interrupt` exportieren; `clock/segments` an Typewriter; `RESPONSE_END` erst wenn Text **und** Audio fertig |
| `conversation/typewriter.js` | `pause/resume`, `clock`, `segments`, `atMs`; reducedMotion bleibt synchron (`:213-217`) |
| `presence/presence.js` | `setAmplitude` als Adapter; respektiert `is-motion-paused`/reducedMotion (`:95-111`) |
| `styles/*` | Mic-/Consent-Zustände, `--voice-level`; Kontrastpfad wie `conversation.css:234` |
| Metriken | Quellen `user_speech`/`agent_audio`, `first_glyph_ms`, `first_audio_ms`; `--p-energy` als einziger Amplitude-Schreiber (`PARAMETER-OBERFLAECHE.md:190`) |

Nicht ändern: `src/vendor/**` nur mit Owner-Freigabe (`PARAMETER-OBERFLAECHE.md:218`).

## 4) Reihenfolge

**P1 — Nähte, bevor Voice-Code entsteht**
1. Store-Felder/Events. 2. `data-mic` plus Mic-/Consent-Markup. 3. Typewriter-Uhr/Segmente plus `pause/resume`. 4. `presence.setAmplitude`. 5. Barge-in über `SUBMIT`.
Grund: ohne 1–4 müsste Phase 2 den Textpfad umbauen; `PARAMETER-OBERFLAECHE.md:216-219` benennt dieselben drei Nähte.

**P2 — Voice anschließen**
6. Mikrofon-Freigabe nach Klick (Zustände C-05). 7. `STT_PARTIAL` in den Composer, provisorisch markiert. 8. TTS synchron (Audio-Uhr treibt den Typewriter), getrennte Enden. 9. Fallback/Fehler im `RESPONSE_ERROR`-Muster (`conversation.js:142-147`). 10. Metrik-Quellen.

**P3 — Feinschliff**
11. `EyeFace.setAmplitude` als Vendor-Patch, falls der Adapter nicht reicht. 12. VAD, Halbduplex, Echo. 13. Anbieterwahl, `first_*`-Messung.

## 5) Owner-Fragen (Produkt)

1. Push-to-Talk (halten) oder Klick-zum-Hören mit Auto-Stop? (U32 belegt den Kostenunterschied, nicht das Gefühl.)
2. Wenn Sprache während der Antwort beginnt: sofort ersetzen oder den laufenden Satz zu Ende sprechen? (ADR-0006:93-95 stellt dieselbe Frage für den Puffer.)
3. Darf der Teiltranskript im Feld stehen, oder erscheint der Prompt erst nach dem Final?
4. Reicht eine Consent-Zeile ohne Pflichtklick (`02-components.md:46`), auch öffentlich?
5. Bei verweigerter Freigabe: einmal sichtbar erklären oder still bleiben (ADR-0002 „Hintergrund still")?
6. Bleibt der Agent auch mit Stimme stumm, bis der Besucher spricht (`M1-CONTRACT.md:6`)?
7. Bekommt die Stimme eine Identität (Name/Klang), obwohl die Agent-Identität offen ist (`ADR-BESPRECHUNG.md:30`)?
8. Ist ein rein sprechender Besucher ohne Tastatur Phase-2-Umfang, oder bleibt Text primär?
9. Consent bei jedem Reload neu, weil Reload Neustart ist (`M1-CONTRACT.md:6`)?
10. Zählt Sprach-Barge-in als `interruption_rate` oder als eigene Metrik?
