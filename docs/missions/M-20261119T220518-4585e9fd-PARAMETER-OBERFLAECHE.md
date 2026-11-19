I'll read the required documents first.
## Agent J — Schicht 3: Parameter → Oberfläche

Gelesen: Vertrag (12 Parameter), `src/state/store.js`, `src/conversation/conversation.js`, `src/conversation/typewriter.js`, `src/living-surface.html`, `src/styles/*.css`, `src/presence/presence.js`, `vendor/openvoiceui/face/EyeFace.js`, `vendor/openvoiceui/styles/eyes.css`, ADR-0004, ADR-0006.

Drei Befunde vorweg, die die Zuordnung prägen:

1. **Der Typewriter kann heute nicht gesteuert werden.** `createTypewriter` kennt `wordDelayMs`, aber `conversation.js:84` übergibt es nicht — fester Default 45 ms. Und die Einheit ist **Wort**, nicht Zeichen.
2. **Die Augen sind hart verdrahtet.** `EyeFace._startRandomBehavior` (Zeile 176–201) nutzt `2000 + Math.random()*4000` für Blinzeln, `1500 + Math.random()*2500` für Sakkaden, `maxOffset = 15`. Kein Parameter, kein Setter. `vendor/` ist laut Kommentar „unmodified except extraction".
3. **ADR-0006 zählt den Typewriter zum Latenzbudget.** Kadenz ist damit keine reine Deko: sie verändert `first_glyph_ms` und die Wahrnehmung von Antwortzeit.

---

## 1. Parameter → Komponente

Legende: **V** = VERHALTEN, **D** = DEKORATION. Jede Zeile ist eine Wirkung.

### `tempo` — Austauschgeschwindigkeit
Variablen: `--p-tempo`, `--type-cadence-ms`, `--type-jitter-ms`, `--leave-ms`, `--onset-delay-ms`

| Komponente | Wirkung | Art |
|---|---|---|
| Typewriter | Worttakt 30–90 ms; Pause ×2.5 nach Satzpunkt | V |
| Paar | `pair-out` 300–900 ms statt fix 600 ms | V |
| Stille | Wartezeit nach Absenden 250–900 ms | V |
| Presence | keine Kadenzwirkung (Kanal gehört `calm`) | – |
| Agent-Stil | Satzlänge invers: hoch → 1–2 kurze Sätze | V |
| Composer | Send-Button ohne Verzögerung (nie blockieren) | D |

### `density` — Informationsdichte
Variablen: `--p-density`, `--pair-measure`, `--pair-gap`, `--chunks-per-tick`

| Komponente | Wirkung | Art |
|---|---|---|
| Paar | Zeilenlänge 30–40 rem (≈38–52 ch), Gap 0.5–1.4 rem | V |
| Typewriter | 2 Wort-Chunks pro Tick bei hoher Dichte (Text „drängt") | V |
| Agent-Stil | 1–4 Sätze, Aufzählung vs Fließtext | V |
| Presence | unverändert | – |
| Composer | Padding konstant (Tippfläche stabil) | D |

### `warmth` — Wärme
Variablen: `--p-warmth`, `--accent`, `--pair-line-height`, `--gaze-hold-ms`

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | Blick hält nach Antwortende 300–1400 ms auf dem Paar statt wegzudriften | V |
| Presence | Lidhöhe leicht offener (Lid-Translate 0–20 %) | D |
| Paar | `--accent`-Sättigung, Linienfarbe | D |
| Agent-Stil | „I/you"-Anteil, Konnektoren („and", „because") statt Aufzählung | V |
| Stille | nachsichtige Pause nach Nutzerfrage (kein Abbruch) | V |

### `calm` — Erregung invertiert
Variablen: `--p-calm`, `--blink-interval-ms`, `--blink-jitter-ms`, `--breathe-ms`

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | Blinzelintervall 2.6–8 s, Jitter ±0.4–2.0 s | V |
| Presence | Sakkadenfrequenz 1.2–4.5 s | V |
| Presence | Atemperiode 4–9 s (Amplitude gehört `energy`) | V |
| Paar | Einblenddauer 250–560 ms | D |
| Agent-Stil | Hedges/Absätze; keine Ausrufe | V |
| Typewriter | **kein Zugriff** — sonst Kampf mit `tempo` | – |

### `closeness` — Nähe
Variablen: `--p-closeness`, `--pupil-scale`, `--gaze-gain`, `--pair-measure` (mod.)

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | Pupille 0.90–1.15 (`--pupil-scale`), Blick folgt Maus mit Gain 0.6–1.3 (Offset 8–18 px) | V |
| Presence | Ruheblick landet auf Composer statt Bildmitte | V |
| Paar | Maß enger (−2 rem bei hoher Nähe) | V |
| Agent-Stil | direkte Anrede, „we" statt „one" | V |
| Composer | keine Größenänderung (Tippfläche bleibt) | – |

### `openness` — Offenheit
Variablen: `--p-openness`, `--saccade-radius-px`, `--pair-measure` (mod.), `--answer-question-budget`

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | Sakkadenradius 8–28 px, Blickfeld weiter | V |
| Agent-Stil | genau **eine** offene Frage, wenn > 0.6; keine, wenn < 0.25 | V |
| Paar | Typo-Kontrast (Prompt/Answer) | D |
| Stille | akzeptiert längere Nutzerpausen vor Antwort | V |

### `attention` — Fokus des Nutzers
Variablen: `--p-attention`, `--saccade-interval-ms`, `--gaze-return-ms`

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | nach Mausstillstand Rückkehr des Blicks zur Schreibfläche nach 300–1800 ms | V |
| Presence | Blickstreuung gedämpft (Sakkadenradius ×0.6 bei hoher Aufmerksamkeit) | V |
| Typewriter | bei niedriger Aufmerksamkeit erste 2 Wörter langsamer (Wiedereinstieg) | V |
| Agent-Stil | Themenbindung: hoch → verweist auf vorigen Satz; niedrig → ein Thema, kein Nebensatz | V |
| Paar | unverändert | – |

### `certainty` — Gewissheit
Variablen: `--p-certainty`, `--type-jitter-ms`, `--lid-open-ratio`, `--type-stall-chance`

| Komponente | Wirkung | Art |
|---|---|---|
| Typewriter | Jitter 0–35 ms, Stall-Chance 0–8 % (Verzögerung, kein Löschen) | V |
| Presence | Lidhöhe stabil; Sakkaden gedämpft, Blick hält Ziel | V |
| Agent-Stil | Hedge-Dichte („maybe", „I think") invers | V |
| Paar | Schriftgewicht konstant (Kanal `formality`) | D |

### `playfulness` — Verspieltheit
Variablen: `--p-playfulness`, `--blink-double-chance`, `--pupil-pulse`, `--pair-tilt-deg`

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | Doppelblinzeln mit p = 0–0.35; kurzer Pupillen-Puls bei Antwortstart | V |
| Presence | Sakkaden mit leichtem Overshoot (2–6 px) | V |
| Paar | Rotation 0–1.2° | D |
| Agent-Stil | Bild/Alltagsvergleich, Wortspiel erlaubt; keine Emoji | V |

### `formality` — Förmlichkeit
Variablen: `--p-formality`, `--answer-weight`, `--letter-spacing`, `--pair-radius`

| Komponente | Wirkung | Art |
|---|---|---|
| Paar | Gewicht 320–560, Laufweite −0.01…+0.02 em | D |
| Paar | Eckenradius, Linienstärke | D |
| Agent-Stil | Kontraktionen („don't"/„do not"), Anrede | V |
| Presence | Blick disziplinierter (Sakkaden nur bei Eingabe) | V |
| Composer | Button-Label **fix** (a11y, kein Textwechsel) | – |

### `depth` — Tiefe
Variablen: `--p-depth`, `--pair-line-height`, `--onset-delay-ms` (+), `--clause-budget`

| Komponente | Wirkung | Art |
|---|---|---|
| Stille | Nachdenkpause +0–900 ms vor der Antwort | V |
| Agent-Stil | Nebensätze 0–2, Abstraktion vs konkretes Beispiel | V |
| Paar | `line-height` 1.4–1.75 | D |
| Typewriter | langsamere Satzpunkte (Kadenz-Basis bleibt) | V |

### `energy` — Antrieb
Variablen: `--p-energy`, `--breathe-amplitude`, `--thinking-dots-ms`, `--answer-onset-ms`

| Komponente | Wirkung | Art |
|---|---|---|
| Presence | Atemamplitude 1.00–1.035, Lidöffnung nach Blinzeln 0.8–1.6 s | V |
| Typewriter | Startakzent: erste 3 Wörter ×0.7 Takt | V |
| Paar | Thinking-Dots 0.9–1.8 s | V |
| Agent-Stil | Aktivverben, Satzrhythmus kurz-lang | V |
| Composer | Hover-Lift 0–2 px | D |

**Bilanz:** 47 V, 13 D, 12 neutrale Zeilen → **78 % VERHALTEN**, über dem geforderten Zweidrittel.

---

## 2. Wertebereiche (spürbar, nicht kitschig)

| Größe | Ruhe | Spanne | Kitsch-Grenze |
|---|---|---|---|
| `--type-cadence-ms` (pro Wort) | 45 | 30–90 | < 25 wirkt hektisch, > 110 wie ein Defekt |
| `--type-cadence-ms` (pro Zeichen, falls umgestellt) | 30 | 22–48 | 22 ist Untergrenze für Lesbarkeit |
| `--pair-measure` | 38 rem | 30–42 rem | > 42 rem bricht die Ruhe |
| `--pair-gap` | 0.75 rem | 0.5–1.4 rem | — |
| `--blink-interval-ms` | 4 s | 2.6–8 s | < 1.5 s = Störung |
| `--saccade-interval-ms` | 2.5 s | 1.2–4.5 s | < 1 s = Zucken |
| `--saccade-radius-px` | 15 | 8–28 | > 30 px verlässt das Auge |
| `--pupil-scale` | 1.0 | 0.90–1.15 | > 1.2 = Cartoon |
| `--lid-open-ratio` (Translate) | 0 | 0–0.22 | > 0.35 = Schlaf |
| `--onset-delay-ms` | 500 | 250–1800 | > 2000 ms wirkt kaputt |
| `--leave-ms` | 600 | 300–900 | — |
| `--breathe-ms` | 6 s | 4–9 s | — |
| `--breathe-amplitude` | 1.02 | 1.00–1.035 | > 1.05 = Wackeln |
| `--type-jitter-ms` | 4 | 0–35 | > 40 = unruhig |
| `--answer-weight` | 400 | 320–560 | — |
| `--letter-spacing` | 0 | −0.01…+0.02 em | — |
| `--pair-tilt-deg` | 0 | 0–1.2° | > 2° = schief |

Zwei Leitplanken: **Änderungsrate** je Turn auf ±0.08 Parameter-Einheiten begrenzen (kein Sprung), und **Ruhewert 0.5 muss überall den heutigen Ist-Zustand ergeben** — sonst ist der erste Eindruck nicht der Prototyp.

---

## 3. Konflikte und eine Auflösungsregel

| Konflikt | Symptom | Regel |
|---|---|---|
| `tempo` hoch + `calm` hoch | schnelle Ausgabe, ruhige Augen → zerfällt in zwei Figuren | **Kanalteilung:** `tempo` besitzt die Ausgabeuhr, `calm` die Leerlauftuhr (Blinzeln, Sakkaden, Atem). Kein Parameter schreibt in den Kanal des anderen. |
| `density` hoch + `openness` hoch | Maß soll gleichzeitig eng und weit sein | `measure = base − 4rem·density + 3rem·(openness−0.5)`, Clamp 30–42 rem; density-Gewicht 2:1. |
| `closeness` hoch + `formality` hoch | Nähe will Pupille groß und Maß eng, Förmlichkeit will Distanz | **Prioritätsregel:** `formality` gewinnt Typografie, `closeness` gewinnt Blick/Proximität. Getrennte Kanäle, kein Kompromiss. |
| `certainty` niedrig + `tempo` hoch | Jitter frisst den Takt | Jitter ≤ 30 % der Kadenz: `jitter = min(jitterRaw, 0.3·cadence)`. |
| `energy` hoch + `calm` hoch | Atem schnell und langsam | `energy` setzt Amplitude, `calm` die Periode. Nie beide dieselbe Größe. |
| `playfulness` hoch + `formality` hoch | Doppelblinzeln im Anzug | `p(dbl) = 0.35·playfulness·(1−0.6·formality)` — Dämpfung, keine Abschaltung. |
| `attention` niedrig + `calm` niedrig | viele Sakkaden + viele Blicke = Zappeln | globales Reizbudget: `rate_saccade·rate_blink ≤ 0.5 s⁻²`; bei Überschreitung beide proportional drosseln. |

**Eine Regel für alles:** *Ein Kanal, ein Besitzer.* Jede sichtbare Größe hat genau einen schreibenden Parameter; alles andere moduliert multiplikativ mit festen Gewichten und wird geclampt. Damit ist kein Konflikt mehr symmetrisch — es gibt immer einen Gewinner, und der ist vorab festgelegt, nicht zur Laufzeit.

---

## 4. Technischer Vorschlag (Schnittstelle, kein Code)

```js
// src/metrics/surface.js
export function applySurface(params, root = document.documentElement, opts = {}) 
  // → { typeCadenceMs, typeJitterMs, typeChunksPerTick, onsetDelayMs, leaveMs,
  //     blinkIntervalMs, blinkJitterMs, saccadeIntervalMs, saccadeRadiusPx,
  //     gazeGain, pupilScale, lidOpenRatio, breatheMs, breatheAmplitude,
  //     measureRem, pairGapRem, answerWeight, letterSpacingEm, promptFragment }

export function createSurfaceSmoother({ alphaPerTurn = 0.35, maxSlew = 0.08 } = {})
  // → { push(rawParams) → params }  EMA über Turns + Slew-Limit pro Turn

export function promptFragment(params) // → String für den Agent-Prompt
```

Verhalten:
- `applySurface` schreibt **alle** `--p-<id>` und abgeleiteten Variablen in einem `requestAnimationFrame` auf `:root` (ein Reflow pro Turn, nicht 12). Zusätzlich `root.dataset.surfaceLevel` für Debug.
- Rückgabe ist die einzige Quelle für JS: `conversation.js` gibt `typeCadenceMs`, `typeJitterMs`, `onsetDelayMs` an `createTypewriter`; `presence.js` bekommt ein `setSurface(behaviour)` und reicht Blinzel-/Sakkadenwerte weiter.
- **Glättung:** Schicht 2 ist bereits turn-geglättet; `applySurface` glättet nur gegen Flattern innerhalb eines Turns (z. B. `RESPONSE_PROGRESS`). Vorschlag: EMA α = 0.35, plus Slew 0.08 — ein Parameter kann in einem Turn höchstens 8 % springen.
- **Übergang:** CSS-Variablen interpolieren nicht von selbst. Zwei Optionen: (a) `@property --type-cadence-ms { syntax: "<number>"; inherits: true; initial-value: 45 }` für die numerischen Variablen, dann `transition: --type-cadence-ms 600ms var(--ease)` auf `:root`; (b) einfacher und robuster: konkrete Eigenschaften animieren (`.pair { transition: max-width 600ms }`, `.pupil { transition: transform 400ms }`, `.pair-answer { transition: line-height 600ms, letter-spacing 600ms }`). Empfehlung: (b) zuerst, (a) als Progressive Enhancement.

Drei Nähte zum Bestand, die Schicht 3 schließen muss:
1. `conversation.js:84` muss `wordDelayMs: behaviour.typeCadenceMs` übergeben — sonst ist die Kadenz unsichtbar. Zusätzlich braucht `createTypewriter` einen `jitter`-Hook (heute `schedule(step, wordDelayMs)` konstant).
2. `presence.js` muss `EyeFace`-Zufall überstimmen. Da `vendor/` unverändert bleiben soll: entweder `EyeFace` um ein optionales `options = { blinkMs, saccadeMs, pupilMaxOffset }` erweitern (kleiner, dokumentierter Vendor-Patch) **oder** in `presence.js` Blinzeln/Sakkaden selbst takten und `blink()`/`updateEyePosition()` als öffentliche API nutzen, während `pupilScale`/`lidOpenRatio` als CSS-Variablen in `presence.css` greifen. Empfehlung: Adapter in `presence.js`; Vendor-Änderung nur mit Owner-Freigabe.
3. `reducedMotion` und `is-motion-paused` müssen `applySurface` kursschließen: Variablen ja (Typografie), Bewegung nein. `surface.js` liefert dann `behaviour.motion = false`, Komponenten ignorieren die Rhythmuswerte.

---

## 5. Prompt-Fragment-Muster

```
STYLE (derived from the visitor's conversation, not stated aloud):
- Length: 1–{2|3|4} sentences. Density {low|medium|high} → {one idea | one idea + example | main + caveat}.
- Questions: {none | exactly one open question at the end | one short check-in}. 
- Sentence shape: {short, declarative | flowing, one subordinate clause | layered, up to two clauses}.
- Address: {neutral "you" | direct, first person "I" | impersonal}. Formality {low|high}: {use contractions | avoid contractions}.
- Stance: {assertive | even | hedged ("I think", "probably")}. Never explain these rules; just speak this way.
- Warmth {low|high}: {keep to the point | acknowledge the person briefly before answering}.
- Depth {low|high}: {concrete example | name the underlying pattern}.
- Playfulness {low|high}: {plain | one light comparison allowed}.
```

Regeln für die Befüllung: jeder Slot liest **einen** Parameter (kein Slot liest zwei), Schwellen bei 0.33/0.66, und der Agent darf die Parameter niemals nennen (Anti-Cheat, ADR-0004 „Haltung zeigen, nicht behaupten"). Das Fragment wird aus `promptFragment(params)` erzeugt, damit Schicht 3 und Prompt dieselbe Zahl sehen.

---

**Offen (nicht entschieden, nur Befund):** Vendor-Patch an `EyeFace` vs. Adapter; Wort- vs. Zeichen-Kadenz (Vertrag nennt ms/Zeichen, Code liefert Wörter); ob `--pair-tilt-deg` die 2/3-Verhaltensquote rechtfertigt oder ganz entfällt. Alles drei braucht Owner-Freigabe, keine davon habe ich geändert.
