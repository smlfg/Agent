## Neue Kandidaten (geprüft 19.11.2026, GitHub-API über `smlfg`)

Vorab zwei Negativbefunde, die Zeit sparen: **`mattboldt/typed.js` ist GPL-3.0** (LICENSE.txt, 16.274★) und **`alexmacarthur/typeit` ist GPL-3.0** (3.178★) — beide scheiden für ein ausgeliefertes Frontend aus. `agents-ui/agents-kit` (126★) ist **Non-Commercial** → raus.

### 1. Agent *ist* die Oberfläche (kein Chat-Widget)

| Name | URL | Lizenz | Sterne / Aktivität | Übernehmbar | Andockpunkt | Risiko |
|---|---|---|---|---|---|---|
| OpenDex (`aviarytech/jarvis`) | github.com/aviarytech/jarvis | MIT | 5★ / Push 29.06.2026 | Theme = gesamte UI: `src/renderer/src/components/themes/` mit `registry.ts`, `types.ts` (Theme-Vertrag), `use-amplitude.ts` (Audio-Pegel → UI), `overlay-transcript.tsx` | `src/presence/presence.js` + `src/styles/base.css` als Theme-Registry | Electron/React, kein Web-Build; Code ist React, Portierung auf Vanilla nötig |
| OpenGenerativeUI (`CopilotKit`) | github.com/CopilotKit/OpenGenerativeUI | MIT | 1.584★ / angelegt 03/2026 | Antwort *ist* eine gerenderte Fläche in sandboxed iframe, progressives Reveal, Theme-Vererbung | `src/main.js`/`src/state/store.js` für „Antwort → Fläche" | Chat-Scrollback bleibt — widerspricht der Owner-Vorgabe; nur als Muster |

### 2. Generative/adaptive UI aus Gesprächssignalen

| Name | URL | Lizenz | Sterne / Aktivität | Übernehmbar | Andockpunkt | Risiko |
|---|---|---|---|---|---|---|
| Adaptive UI Framework (`sabbour`) | github.com/sabbour/adaptive-ui-framework | MIT | 1★ / Push 08.04.2026 | `AdaptiveUISpec` pro Turn: `layout` **und** `theme.primaryColor`; alte Turns kollabieren, nur letzter Turn interaktiv (≈ „nur aktuelles Paar") | `src/state/store.js` (Spec-Schema), `src/styles/base.css` (Theme-Token) | React + eigener LLM-Adapter; Signalquelle ist Prompt, keine Metrik |
| Living House (`theletterf`) | github.com/theletterf/living-house | MIT | 2★ / Push 23.10.2026 | Erzwingt *sichere* CSS-Umschreibung: `CSS.supports`-Validierung, Verbot von `url()`/`@import`, CSS-Containment, Undo; `dom.js` nur 2,5 KB, keine Abhängigkeiten | `src/styles/base.css`-Schreibpfad (Guard), `src/state/store.js` (Change-Log/Undo) | LLM läuft per WebLLM im Browser (mehrere 100 MB–GB); treibt sich aus Nutzungsverhalten, nicht aus Gespräch |
| SentientUI SDK | github.com/SentientUI/sdk | MIT | 2★ / seit 08/2026 | „Adaptive style tokens" per Script-Tag: Persona-Attribute → CSS-Variablen, kein Build | `src/styles/base.css` (Token-Konvention) | Optimizer/Persona-Clustering ist hosted & geschlossen; Signal = Klickverhalten |

### 3. Typewriter + auflösender Text

| Name | URL | Lizenz | Sterne / Aktivität | Übernehmbar | Andockpunkt | Risiko |
|---|---|---|---|---|---|---|
| Motion Primitives (`ibelick`) | github.com/ibelick/motion-primitives | MIT | 6.988★ / Push 28.09.2026 | `components/core/text-effect.tsx`: Tippen **und** Exit-Variante, per Zeichen/Wort/Zeile, eigene Presets/Speed | `src/conversation/typewriter.js` (1:1-Vorlage) | React+Framer-Motion; für Vanilla nur Algorithmus/Preset-Werte |
| anime.js v4 (`juliangarnier`) | github.com/juliangarnier/anime | MIT | 74.904★ / Push 02.11.2026 | Pro-Glyph-Stagger mit `opacity`+`filter: blur()`+`translateY` = Verdampfen nach oben; Timeline rückwärts für Auflösen | `src/conversation/typewriter.js` | Kein Text-Splitting eingebaut (Split-Utilities selbst, ~20 Zeilen) |
| Motion (`motiondivision`) | github.com/motiondivision/motion | MIT | 35.368★ / Push 19.11.2026 | `AnimatePresence`-Exit, Layout-Animationen für UI-Wechsel | `src/state/store.js` → Renderer | Größer; React-Ökosystem, für Vanilla nur `motion`-Core |

### 4. Gesprächsmetriken im Browser

| Name | URL | Lizenz | Sterne / Aktivität | Übernehmbar | Andockpunkt | Risiko |
|---|---|---|---|---|---|---|
| NLP.js `@nlpjs/lang-de` (`axa-group`) | github.com/axa-group/nlp.js → `packages/lang-de/src/sentiment/` | MIT | 6.583★ / Push 09.01.2025 | **Deutsches Sentiment-Lexikon in JS**: `senticon_de.json` (91 KB), `negations_de.json`, `sentiment_de.js`; Tokenizer/Stemmer für Deutsch dabei | `src/state/store.js` (Metrik-Berechnung), keine Serverrunde | Repo seit 01/2025 ohne Push; Lexikon-Lizenz im Dateikopf MIT, aber Qualität auf Deutsch ungemessen |
| winkNLP (`winkjs`) | github.com/winkjs/wink-nlp | MIT | 1.391★ / Push 27.05.2026 | ~10 KB Kern, Satzgrenzen/Negation, Sentiment im Browser | `src/state/store.js` | Modell `wink-eng-lite-web-model` (~1 MB gz) ist **nur Englisch**; Deutsch nur tokenisierbar |
| sentiment (`thisandagain`) | github.com/thisandagain/sentiment | MIT | 2.678★ / Push 2020 | AFINN, sehr klein, `extraWord` für eigene Vokabeln | `src/state/store.js` | `languages/` enthält nur `en` — kein Deutsch; seit 2020 unverändert |

Hinweis: Tempo (Wörter/min, Pausenlänge, Unterbrechungsrate) braucht keine Bibliothek — reine Zeitstempel-Arithmetik aus dem Transkript; `src/state/store.js` ist der richtige Ort, `src/conversation/` und `src/presence/` sind derzeit leere Verzeichnisse.

### Top-3

1. **Motion Primitives `text-effect.tsx` (MIT)** — einzige gepflegte, permissiv lizenzierte Vorlage, die Tippen *und* Auflösen als Zustandswechsel abbildet.
2. **OpenDex Theme-Registry + `use-amplitude` (MIT)** — liefert genau das fehlende Muster „die ganze Seite ist das Theme, Audio pegelgesteuert", inklusive sauberem Theme-Vertrag.
3. **NLP.js `lang-de` Sentiment (MIT)** — die einzige geprüfte deutschsprachige Sentiment-Quelle, die ohne Server und ohne Modell-Download im Browser läuft.
