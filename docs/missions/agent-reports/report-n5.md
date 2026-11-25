# Doku-Code-Abgleich Agentfähig (Stand 19.11.2026)

Basis: `docs/missions/M-20261119T220518-4585e9fd-M1-BERICHT.md` (M1), `...-M1-CONTRACT.md:6` (Owner-Vorgaben), `...-ADR-BESPRECHUNG.md:24–30` (Owner-Entscheidungen). Gebaute UI: `src/living-surface.html`, `src/state/store.js`, `src/conversation/*`, `src/presence/presence.js`.

## 1 · Veraltete Stellen

### DESIGN-DECISIONS.md
- `:17` „Ältere Antworten … beim Scrollen sichtbar" – gilt: nur aktuelles Paar, Älteres löst sich auf (`M1-BERICHT:17`) → ändern.
- `:27`, `:37` „Voice gehört zum Kern / Teil des Erstbaus" – gilt: Text zuerst, Voice Phase 2 (`M1-CONTRACT:6`) → ändern.
- `:29` „Mikrofon-Button von Anfang an sichtbar" – gebaut ist kein Mikrofon (`living-surface.html:50–59`) → streichen.
- `:32`, `:38`, `:42–46` drei/ein Slider, Agent erfragt Aussehen – gilt: Regler optional, UI aus Gespräch, Agent fragt nicht (`ADR-BESPRECHUNG:25–27`; `M1-BERICHT:46–47`) → als überholt markieren.
- `:40` „Messlauf als Gate vor dem Erstbau" – M1 wurde gebaut (`git log`: `7e5b0f2`), Messlauf ist blockiert (`M1-BERICHT:37`) → Gate-Status ehrlich nachtragen.
- `:106–107` Textsprache offen – gilt Englisch (`M1-CONTRACT:6`; `living-surface.html:2`) → beantwortet.

### PROJECT_CONTRACT.md
- `:57–58` „null Anwendungscode, null Tests" – falsch seit M1 (`src/*`, 41 Tests laut `M1-BERICHT:26`) → aktualisieren.
- `:87` P1 „scrollt von selbst oder fragt" – Owner-0005: Person tippt oder spricht von selbst (`ADR-BESPRECHUNG:28`) → Kriterium ändern.
- `:89`, `:154–158`, `:168` Agent fragt Aussehen + ein Regler – entfällt (`M1-BERICHT:47`) → ändern.
- `:101` T3 Reglerzustand – jetzt Metrik-Parameter (`METRIK-PARAMETER-VERTRAG:5–9`) → neu formulieren.
- `:123` Q2 „Zustand überlebt Reload", `:128` Q7 Reload-Smoke – Owner: Reload = Neustart (`M1-CONTRACT:6`) → streichen.
- `:169` F4 stiller Sub-Agent und `:170` F5 Voice – F4 nicht gebaut, F5 Phase 2; F4 ist nicht bewusst gestrichen (siehe unten) → Priorität korrigieren.
- `:222–226` D4/D5 offen, `:262–264` CR-2/CR-3 – D5 Englisch, D4 Phase 2 → als beantwortet schließen.

### PLAN-STUFEN-0-5.md
- `:39`, `:51` „1 Regler" / „2/3 Regler, Voice" – Regler optional, Voice Phase 2 → ändern.
- `:44`, `:194` „scrollt von allein" – Owner-Kriterium tippt/spricht (`ADR-BESPRECHUNG:28`) → ändern.
- `:181` Mikrofon-Knopf, `:183–184` Regler + Sub-Agent im ersten Prototyp – nicht gebaut → markieren.
- `:226–236` Stufenfolge – M1 lief vor Stufe 1 → Reihenfolge überholt.
- `:247–252` „alle fünf ADRs vorgeschlagen" – Owner hat 0001–0006 angenommen (`ADR-BESPRECHUNG:24–29`), ADR-Dateien aber nicht geändert → Status nachziehen.
- `:278–281`, `:291` „kein Build ohne Stufe 1" – durch M1 widerlegt → korrigieren.

### EXECUTION_PLAN-M0-M5.md
- `:114–119` M2: Reload-Persistenz, Sub-Agent, „wortlängen-abhängiger Typewriter" – nichts davon gebaut; der Typewriter ist zeichenbasiert mit Jitter/Satzpausen (`typewriter.js:153–182`).
- `:131–136` M3: Agent fragt Aussehen, Regler, drei Fehlerfälle – entfällt/offen (`M1-BERICHT:46–49`).
- `:240` Persistenz als Zustandsverbraucher; `:518` Reload-Snapshot; `:530` UI-3 – Persistenz bewusst gestrichen (`M1-CONTRACT:6`).
- `:450–461` Mapping `HistoryList`, `AppearanceSlider`, `MicControl`, `PermissionNotice`, `BackgroundResult`, `StatusLine`, `NewAnswerAnchor` – C-11/C-12/C-06/C-05/C-16 entfallen, C-08/C-09 nur minimal (`M1-BERICHT:45–49`).
- `:478–482` React/Vite + DO – tatsächlich plain ES Modules, kein Build (`M1-CONTRACT:3`; `main.js:2–5`) → ersetzen.
- `:532`/`:534`/`:559–584` UI-5 Regler, UI-7 Voice – Reihenfolge überholt: Metriken vor Regler/Voice.
- `:621–628` D5/D6/OD-04/06 als Voraussetzungen – beantwortet: Englisch, kein Regler, Unterbrechen erlaubt, Reload Neustart.

### docs/wireframes/*
- `README.md:87–89` Scope mit Regler, Hintergrund-Ergebnis, Voice, Reload; `:23` WF-12 als Zustand – V1 ist kleiner (`M1-BERICHT:45–48`).
- `00-flows-and-viewports.md:96,123,231,282` Scrollen/Verlauf – nur aktuelles Paar.
- `01-screens.md:40,45,119,217,324,337,386–396` Regler, Mikrofon, Reload-Entwurf, gesperrte Eingabe – alles nicht gebaut; Eingabe ist nie gesperrt (`M1-CONTRACT:34–36`).
- `02-components.md:35–46`, `:260–267` C-05/C-06/C-08/C-09/C-11/C-12/C-16 – als entfallen/verschoben markieren.
- `03-state-matrix.md:24–34`, `:46`, `:62`, `:74–77`, `:178–189` WF-05/06/07/09/12, Regler-Sync, Reload-Überleben – überholt.
- `04-open-decisions.md:13,15–20,22–23,27` OD-02/04/05/06/07/08/09/11/12/16 – durch Owner-Entscheidungen beantwortet oder überstimmt. `:24` OD-13 (Typewriter-Schwellen) bleibt offen; `:25` OD-14/17/18 sind gebaut (Feld ab t=0, Aufwachen beim Tippen, Enter+Knopf; `M1-BERICHT:12–15`).

### UX-INFORMATIONSARCHITEKTUR.md
- `:54`, `:358`, `:376–379`, `:385–395` „Regler ist eine Antwort" / Agent fragt Aussehen – Prinzip teilweise gültig, der J2-Flow nicht (`ADR-BESPRECHUNG:25`).
- `:515` „Verlauf ist die Seite selbst", `:580` R-B Leseposition – nur aktuelles Paar.
- `:533` L3 Consent, `:422/431/557` Mikrofon – Voice Phase 2.
- `:579–584` R-A Reglerstufen, R-E Mikrofon, R-F Reload – überholt.
- `:140` E7 Text deutsch/Stimme englisch; `:734` A8 – Englisch gilt für Text (`M1-CONTRACT:6`).
- `:69`/`:91` U2/N3 „anders als beim letzten Mal" – Reload = Neustart, Prämisse entfällt.
- `:281–285` Pika-Abgrenzung bleibt, die Begründung „der eine Regler bleibt wiederfindbar" trägt ohne Regler nicht mehr.

### docs/adr/*
- Alle `:3` „Status: vorgeschlagen" – Owner hat 0001–0006 angenommen (`ADR-BESPRECHUNG:24–29`) → Status/Datum ändern, Inhalt nur mit Owner.
- `0001:36` „kein Anwendungscode vor Messlauf" und `:46–49` deutsche Fragen – M1 gebaut, Englisch (`ADR-BESPRECHUNG:24`; `c2:12`).
- `0002:38–39` „Agent fragt colour·form·output style" – entfällt (`ADR-BESPRECHUNG:25`).
- `0003:39–42` EyeFace am Cloudflare-Protokoll – tatsächlich direktes `PHASE_MOOD` (`presence.js:9–15`).
- `0004:33–44` Regler-Achse + Prompt-Kopplung – Regler optional, Kopplung über Metriken (`ADR-BESPRECHUNG:26–27`).
- `0005:53–55` „scrollt oder fragt" – ersetzt durch tippt/spricht (`ADR-BESPRECHUNG:28`).
- `0006:38–40` DO-Segmentierung, Typewriter liest Segmentliste – nicht gebaut; Typewriter tippt lokalen Volltext (`typewriter.js:117–230`).

### Zusatz
- `docs/missions/...-PARAMETER-OBERFLAECHE.md:8,217` behauptet festen Worttakt 45 ms – tatsächlich `unit:'char'`, Default 30 ms (`conversation.js:120–123`; `typewriter.js:119–121`).
- `docs/PROJECT.md:3–6,18–19,100–140,219–229` beschreibt weiter Planungsphase, 3 Slider und Voice im Erstbau – als Projektstand veraltet.
- `src/metrics/metrics-catalog.json` (1853 Zeilen) und `src/dev/conversation-pathways.json` werden nirgends importiert (Suche findet nur die Dateien selbst) – vorbereitet, nicht verdrahtet.

**Geplant, nicht gebaut, nicht bewusst gestrichen:** F4/T4 stilles Hintergrund-Ergebnis (`PROJECT_CONTRACT:169`, `EXECUTION_PLAN:457`; `M1-BERICHT:40` nennt es nur „nicht implementiert"); wortlängen-abhängiger Typewriter (`DESIGN-DECISIONS:20`, `PROJECT_CONTRACT:100`, `EXECUTION_PLAN:114,119`); drei sichtbare Fehlerzustände/StatusLine (`EXECUTION_PLAN:119,136`; `M1-BERICHT:49` nur Minimaltext); `first_glyph_ms`-Messung (`ADR-0006:51–53`); Prompt-/Haltungsfragment (`ADR-0004`; `promptFragment` fehlt); Serverzustand/`seq`/Reconnect (`EXECUTION_PLAN:492–518`). Bewusst gestrichen sind dagegen Verlauf, Regler, Mikrofon/Consent, Reload-Persistenz und Reload-Reconnect.

## 2 · Andock-Schnittstellen

```js
// store.js: bestehend
createStore() -> { getState(), dispatch(event), subscribe((state, prev, event) => void) }
// neu, mit bestehender Turn-Regel (store.js:39–52)
{ type: 'TURN_PARAMS', turn, metrics, params }   // params: 12 Werte 0…1
// state.params = { tempo, density, warmth, calm, closeness, openness,
//                  attention, certainty, playfulness, formality, depth, energy }
```

```js
// src/metrics/surface.js (neu; schreibt nur CSS + liefert JS-Werte)
applySurface(params, root = document.documentElement) -> {
  typeCadenceMs, typeJitterMs, onsetDelayMs, leaveMs,
  measureRem, pairGapRem, answerWeight, letterSpacingEm, promptFragment
}
createSurfaceSmoother({ alphaPerTurn = 0.35, maxSlew = 0.08 }) -> { push(raw) -> params }
promptFragment(params) -> string
```

CSS-Variablen auf `:root` (Baseline = heutiger Ist-Zustand): `--p-tempo…--p-energy` (0.5), `--type-cadence-ms: 30`, `--type-jitter-ms: 4`, `--onset-delay-ms: 0`, `--leave-ms: 600`, `--pair-measure: 38rem`. Heutige Anker: `base.css:2–23`, `conversation.css:9,26,85`.

```js
mountConversation({ root, store, agent, reducedMotion, behaviour }) -> { destroy() }
// intern: createTypewriter({ unit:'char', charDelayMs: behaviour.typeCadenceMs, ... })
// heute: conversation.js:120–123 übergibt charDelayMs nicht -> fester Default 30 ms.

mountPresence({ root, store, reducedMotion, surface }) -> { pause(), resume(), destroy() }
// surface: { blinkMs, saccadeMs, gazeGain, pupilScale, lidOpenRatio }
```

Wichtig: Für Blinzeln/Sakkaden reichen CSS-Variablen nicht; `EyeFace._startRandomBehavior` nutzt private Timer mit festen Zufallsgrenzen (`EyeFace.js:176–200`). Entweder Adapter in `presence.js` oder dokumentierter Vendor-Patch.

## 3 · Was die UI vorbereiten/ändern muss

1. `store.js`: `params`/`metrics` in den Zustand, Event mit `turn`-Guard; keine Persistenz, keine Reload-Events.
2. `main.js`: Surface-Schicht erzeugen, `applySurface` abonnieren, `behaviour` an beide Mounts geben (`main.js:22–23`).
3. `conversation.js`: `charDelayMs`, Jitter, `onsetDelayMs` an `createTypewriter` durchreichen; Wortlängen-Regel fehlt bewusst/unbewusst; `is-leaving`-Dauer aus `--leave-ms` statt Fixwert (`conversation.css:26`).
4. `presence.js`: `EyeFace`-Zufall überstimmen; `reducedMotion` und `is-motion-paused` müssen die Bewegung abschalten, Typografie aber nicht (`presence.js:79–83,123–125`).
5. `base.css`/`conversation.css`: `--p-*` und abgeleitete Variablen ergänzen, Ruhewerte = heutige Werte; `--pair-measure` entspricht bereits `38rem` (`conversation.css:9,85`).
6. Metriken: `metrics-catalog.json` per `fetch`/JSON-Modul laden, Berechnung an `INPUT`/`SUBMIT`/`RESPONSE_*` hängen; `conversation-pathways.json` bleibt Dev-Daten, kein Runtime-Pfad.
7. HTML: keine neuen Bedienelemente; weiterhin nur aktuelles Paar, Composer nie sperren.

## 4 · Reihenfolge/Prio

- **P1:** Doku-Wahrheit herstellen (Owner-Entscheidungen, ADR-Status, „nicht gebaut"-Liste); Store-/Surface-Vertrag; `applySurface` + `--p-*`; Typewriter-Kadenz; Presence-Adapter.
- **P2:** Metrikberechnung + Glättung + `promptFragment`; Entscheidung F4 (bauen oder streichen); sichtbare Fehlerzustände; `first_glyph_ms`.
- **P3:** Wireframes/UX-IA auf „nur Paar, kein Regler, kein Mikrofon, kein Reload" umschreiben; EXECUTION_PLAN-Stack und M2–M5-Reihenfolge ersetzen; Voice Phase 2; optionaler Regler.

## 5 · Owner-Fragen (nur Produkt)

1. Soll sich die Oberfläche schon während der Antwort sichtbar verschieben oder erst am Turn-Ende (kein Flackern)?
2. Soll der Besucher das Aussehen zusätzlich selbst ziehen können (optionaler Regler) oder ausschließlich über das Gespräch?
3. Bleibt das stille Hintergrund-Ergebnis (F4) Teil der ersten Version, oder ist „strikt Prompt/Response" die bewusste Streichung?
4. Woran erkennt ein Fremder in 20 s, dass die Seite ein Agent ist, wenn „scrollt von selbst" als Kriterium wegfällt?
5. Soll der Agent irgendwann nach seinem Aussehen fragen dürfen – als Gesprächsthema, nicht als Regler?
6. Ist Deutsch nur geparkt oder für den Textkanal endgültig raus?
