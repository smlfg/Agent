# Agentfähig um zusätzliche interaktive Dimensionen erweitern und deren sichtbare Wirkung im bestehenden Living-Surface-Konzept prüfen (M-20261120T001455-ce62b600)

| Feld | Wert |
|---|---|
| Mission | Agentfähig um zusätzliche interaktive Dimensionen erweitern und deren sichtbare Wirkung im bestehenden Living-Surface-Konzept prüfen |
| Missions-ID | `M-20261120T001455-ce62b600` |
| Contract Version | 3 |
| Session | `S-20261120T004705-a9af5409` |
| Datum | 20.11.2026 |
| Schreiber | Subagent (OpenCode, `opencode-go/deepseek-v4.1-flash`), exklusiver Write-Root: diese Datei |
| Belegstand | 20.11.2026, 00:52–00:54 CET (Arbeitsbaum wurde parallel von einer zweiten Session beschrieben — siehe §3.5) |
| Kriterien | C1 dokumentiert · C2 dokumentiert · C3 dokumentiert (jeweils mit Pfadbelegen) |

## Kernbefund in einem Absatz

Der Datenpfad der räumlichen Tiefe steht und ist getestet: `deriveSpatialDepth()` rechnet aus den 12 Gesprächs-Parametern 14 CSS-Tokens, `compileBonesToCssVars()` leitet aus dem Hauptlicht-Orb `orbA` einen globalen Lichtvektor ab, `modulateBonesWithMetrics()` verschiebt 17 Bones, und die Metrik-Brücke läuft über ein DOM-Event in den Projektor. **Sichtbar im Pixel ist davon heute noch nichts**, weil keine einzige CSS-Regel `--depth-*`, `--surface-spatial` oder `--scene-*` liest (§3.3a). Die Tokens sind scharfgeschaltet, aber noch nicht verdrahtet — genau diese Verdrahtung ist der nächste verifizierbare Schritt (§3.4).

---

# C1 — Benennung und Abgrenzung der zusätzlichen räumlichen Dimensionen

## 1.1 Die 8 Spatial-Depth-Dimensionen und die 4. Mood-Achse

Spatial Depth ist **keine neue State-Engine**, sondern eine reine Projektionsfunktion über den bereits vorhandenen 12 Parametern:

```
P: [0,1]^12 × {orbA-Position, reducedMotion} → 14 Zahlen (11 Achsen-/Dimensionswerte + 3 Trägheitswerte)
                                              → 14 CSS-Tokens
```

Quelle der Formeln: `src/metrics/surface.js` → `deriveSpatialDepth()`; identische Werte liefert der Projektor über denselben Import (`src/surface/surface-projector.js`, Import-Liste).

| # | Dimension | CSS Custom Property | Wertebereich (Clamp) | Neutral (alle Δ = 0) | Bedeutung in einem Satz |
|---|---|---|---|---|---|
| 0 | `spatiality` *(4. Mood-Achse, abgeleitet)* | `--surface-spatial` | −1.00 … +1.00 | `0.0000` | Zusammenfassender Raumtiefe-Skalar des Gesprächs (flach/konkret ↔ tief/weit/nahbar) |
| 1 | `depthIntensity` | `--depth-intensity` | 0.15 … 0.95 | `0.500` | Master-Amplitude: skaliert den Abstand der Z-Ebenen |
| 2 | `parallaxGain` | `--depth-parallax` | 0.20 … 1.35 (reduced motion: hart `0`) | `0.850` | Stärke der gegenläufigen Mikro-Parallaxe zwischen den Ebenen |
| 3 | `cornealDepth` | `--depth-cornea` | 0.25 … 1.00 | `0.650` | Wölbung/Plastizität des Auges (Gegenlauf Hornhaut ↔ Pupille) |
| 4 | `lightDirectionCoupling` | `--depth-light-x`, `--depth-light-y` | je −1.00 … +1.00 | `+0.560` / `+0.640` | globaler Lichtvektor aus `orbA` (22 % / 18 %), „One Light Truth“ |
| 5 | `shadowElevation` | `--depth-shadow-length`, `--depth-contact-alpha` | 8 … 32 px, 0.14 … 0.48 | `14px`, `0.280` | Verhältnis Kontaktschatten ↔ schwebender Umgebungsschatten |
| 6 | `atmosphericHaze` | `--depth-haze` | 0.08 … 0.78 | `0.350` | Luftperspektive auf den hinteren Ebenen (Dunst, weiche Kanten) |
| 7 | `focalSeparation` | `--depth-focal-contrast` | 0.15 … 0.95 | `0.500` | Luminanz-Spreizung zwischen Antwortebene und Peripherie |
| 8 | `visualGravity` | `--depth-gravity` | −0.85 … +0.85 | `0.000` | vertikaler Raumzug: hebt an (< 0) oder erdet (> 0) |
| — | *Ebenen-Trägheit (Hilfstokens, keine eigene Dimension)* | `--scene-lag-far`, `--scene-lag-mid`, `--scene-lag-near` | 850–1650 / 420–920 / 180–420 ms | `1250` / `650` / `280` ms | gestaffelte Reaktionszeit der Z-Ebenen |

Neutralwerte verifiziert für alle 12 Parameter = 0.5: `spatiality 0`, `intensity 0.5`, `parallax 0.85`, `cornea 0.65`, `lightX (50−22)/50 = 0.56`, `lightY (50−18)/50 = 0.64`, `shadowLength 14`, `contact 0.28`, `haze 0.35`, `focal 0.5`, `gravity 0`.
Dass der Lichtvektor im Neutralzustand **nicht** bei `0/0` liegt, ist Absicht: `orbA` steht oben links (`src/surface/surface-bones.js` → `BONE_SCHEMA.orbAX/ orbAY`, Defaults 22 % / 18 %), also fällt jeder Schatten per Default nach rechts unten. Genau das fehlte dem alten Stand, der `eyeShadowX: 0` hart senkrecht nach unten warf.

## 1.2 Scharfe Abgrenzung gegen die drei bestehenden Systeme

| System | Datei / Symbol (verifiziert) | Achse & Einheit | Was es steuert | Was es **nicht** steuert | Übergabepunkt an Spatial Depth |
|---|---|---|---|---|---|
| **`SurfaceState`** — 4 Dimensionen, **22 Felder** (7 + 5 + 5 + 5) | `src/surface/surface-state.js` → `SURFACE_DIMENSIONS`, `SURFACE_SCHEMA` | X/Y, Skalare, Farben, Textmaße (2D + Stil) | `embodiment` (Augenposition, Abstand, Skalierung, Form, Blick, Asymmetrie), `motion` (Energie, Tempo, Dämpfung, Ambient, Reaktivität), `atmosphere` (Hintergrund, Primär-/Sekundärfarbe, Intensität, Kontrast), `communication` (Dichte, Länge, Tempo, Ton, Typo-Skala) | **keine Z-Staffelung, keine Licht-Schatten-Kopplung, keine Hornhaut-Wölbung.** `MAX_VISIBLE_CONTROLS = 3` bleibt unangetastet (`surface-state.js`) | `toLegacyParams(state)` → `anchorParams`; Spatial Depth liest den **Anker**, schreibt aber nie in den Store zurück |
| **12 Schicht-2-Parameter** | `src/metrics/surface.js` → `PARAMETER_IDS` | 12 × [0,1], Ruhewert 0.5 | `tempo, density, warmth, calm, closeness, openness, attention, certainty, playfulness, formality, depth, energy` — geglättete Gesprächsgrößen | **keine Geometrie, keine Pixel.** Sie beschreiben das Gespräch, nicht den Raum | `deriveSpatialDepth(params)` ist eine **reine Funktion dieser 12 Werte** (+ `orbAX/orbAY`, `reducedMotion`); keine eigene Glättung, kein eigener Speicher |
| **Bone-Skelett** (Projektname „180-Bone“) | `src/surface/surface-bones.js` → `BONE_SCHEMA`, `compileBonesToCssVars()` | **183 Schema-Felder** in 7 Familien (`light` 36, `texture` 14, `stage` 16, `eyes` 51, `typography` 28, `controls` 24, `motion` 14), daraus **187 `--bone-*`-Custom-Properties** | Material, Palette, Typografie, Augen-Anatomie, Stage-Geometrie, Interaktions-Chrome — alles **koplanar** gerendert | **keine Parallax-Faktoren `k_z`, keine Licht-Schatten-Konsistenz, kein Schicht-Gegenlauf.** `eyeShadowX` steht im Default auf `0` | `compileBonesToCssVars()` schreibt `--depth-light-x/y` aus `orbA`; `modulateBonesWithMetrics()` verschiebt danach **17 Bones** (§2.4) |

> **Namenshinweis (Ehrlichkeit statt Rundung):** Der Code nennt das System durchgehend „180-Bone CSS Skeleton“ (`src/surface/surface-bones.js`, Kopfkommentar). Tatsächlich enthält `BONE_SCHEMA` **183** Felder und `compileBonesToCssVars()` **187** `--bone-*`-Properties (gezählt am 20.11.2026). Dieser Bericht nennt die Zahl dort, wo sie zählt, und behält „180-Bone“ nur als Projektnamen bei.

## 1.3 Warum das keine vierte Dimension im UI ist

Explizite Nutzerwünsche bleiben stärker als passive Metriken. Das Kompositionsgesetz lautet:

```
EffectiveValue = clamp(anchorValue + w · (metricValue − 0.5), min, max)
```

- `w = 0.35` (`DEFAULT_METRIC_WEIGHT`) sobald der Besucher eine Welt oder einen Regler gesetzt hat (`surfaceStore.isModified()`),
- `w = 0.75` im unveränderten Default-Zustand.

Beides liegt in `src/surface/surface-projector.js` (`DEFAULT_METRIC_WEIGHT`, `blendLegacyWithMetrics()`, Aufruf in `apply()`). Folge: Eine gewählte Welt wird **nicht überschrieben**, sondern um ein relatives Delta moduliert; bei `Δ = 0` ist die Ausgabe bit-identisch zum Anker.

---

# C2 — Sichtbare UI-Wirkung, HAI-Interaktionswirkung und Metrik-Vernetzung je Dimension

> **Belegstatus der Spalte „sichtbare Wirkung“:** Heute schreibt der Code die Tokens, aber **keine CSS-Regel liest sie** (§3.3a). Die sichtbaren Wirkungen unten sind daher die **spezifizierte** 2.5D-Wirkung (aus `research/UPSTREAM-SEARCH-spatial-depth.md` §B.2–B.3), nicht ein Pixel-Beleg. Alles andere in diesem Abschnitt ist am laufenden Code belegt.

## 2.1 Die 7 Z-Ebenen und ihre realen DOM-Anker

`Z` ist ein **Modell-Index** (Kompositionsschicht), **kein** `z-index`. Jede Ebene adressiert ein bereits existierendes Element — es wird kein DOM-Container hinzugefügt.

| Z | Name | Realer Anker im Code | Rolle | `k_z` (Spezifikation, noch nicht im CSS) | Trägheit |
|---|---|---|---|---|---|
| **−3** | Deep Light Field | `body::before` — 4-Orb-Verlauf `orbA..D` (`src/styles/bones/bones-light.css`), `orbA` Default bei 22 %/18 % | tiefe Lichtkammer, definiert die Hauptlichtquelle | `−0.32` (max. ±4 px gegenläufig) | 1200–1400 ms + 14–19 s Atemzyklus (`--bone-aura-breath-ms`) |
| **−2** | Material, Sediment & Horizont | `html::before` (Vignette), `.stage::before` (Sedimentbänder + Horizontline, `src/styles/bones/bones-texture.css`), `body::after` (Grain) | Trägerfläche aus Papier/Ton/Kalkstein/Lapis | `−0.12` (max. ±1.5 px) | 850 ms |
| **−1** | Ambient Socket & Light Pool | `box-shadow`-Halo + gerichteter Schatten unter `.presence .eye` (`src/styles/presence.css`) | verbindet das schwebende Auge mit dem Grund | `+0.35` | 560 ms |
| **0** | Ocular Body (3 Sub-Schichten) | `.presence .eye`: Venen (`z-index 1`), Pupillen-Container (`z-index 2`), Hornhaut-Sheen + Lidschatten (`z-index 3`), Catchlights (`z-index 4`), Wetline (`z-index 5`); Lider ohne eigenen `z-index` — `src/styles/presence.css` | plastisches Präsenzzentrum; Iris vertieft, Catchlight auf der gewölbten Hornhaut | `+0.75` Auge / `+1.06` Pupillenkern / `−0.18` Catchlight-Gegenlauf | 60 fps kritisch gedämpft (`src/presence/eye-motion-engine.js`) |
| **+1** | Conversation Focus Plane | `#focus` / `#pair` (`z-index 2`, `src/styles/conversation.css`) | Dialogbühne; aktive Antwort tritt nach vorn | `+1.15` (max. ±5 px Desktop, 0 px Mobile) | 320 ms |
| **+2** | Foreground Controls & Composer | `#composer`, `#surface-controls` (`z-index 1`-Gruppe, `src/styles/bones/bones-stage.css`) | greifbare Interaktionsschwelle im Vordergrund | `+1.35` bzw. vertikale Gravitation ±4 px | 220 ms (0 ms beim Dial-Scrubbing) |
| **+3** | Micro-Overlays & Rahmen | `#motion-toggle`, `#dev-badge` (`z-index 5`), `.skip-link` (`z-index 100`) | viewport-fixierter Sicherheits-/A11y-Rahmen | `0.00` (fixiert) | 180 ms |

Alle sieben Ebenen liegen heute im Default auf `z-index: 1` und teilen `--bone-transition-ms: 1100ms` — das ist die Ursache des „flachen Karten“-Eindrucks und der Grund, warum die Trägheits-Staffelung als eigenes Token-Paar (`--scene-lag-*`) existiert.

## 2.2 Vollständige Zuordnung je Dimension

### 2.2.0 `spatiality` — `--surface-spatial` (4. Mood-Achse)

| Feld | Wert |
|---|---|
| CSS Custom Property | `--surface-spatial` |
| Wertebereich / Neutral | −1.0000 … +1.0000 / `0.0000` (4 Dezimalstellen) |
| Formel | `clamp(2.4 · (0.45·Δdepth + 0.30·Δopenness + 0.25·Δcloseness), −1, 1)`, mit `Δx = x − 0.5` |
| Treibende Schicht-2-Parameter | `depth` (+0.45), `openness` (+0.30), `closeness` (+0.25) |
| Treibende Schicht-1-Metriken | `clause_depth`, `abstractness`, `mtld`, `think_time_total`, `hold_before_send`, `open_question`, `self_disclosure` (positiv); `concreteness`, `flesch_reading_ease` (negativ) — alle 109 IDs im Katalog verifiziert |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | Summenzeiger: skaliert die Wirkung aller acht Dimensionen gemeinsam; bei `−1` liest sich die Seite als ein Blatt, bei `+1` als gestaffelter Raum |
| HAI-Interaktionswirkung | „Das Gespräch bekommt einen Raum“: Floskeln bleiben flach, substanzielle/persönliche Turns öffnen Tiefe — ohne dass der Besucher etwas bedient |
| Modulierte Bone-Felder | keine direkt (nur über die 8 Dimensionen) |

### 2.2.1 `depthIntensity` — `--depth-intensity`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-intensity` |
| Wertebereich / Neutral | 0.15 … 0.95 / `0.500` |
| Formel | `clamp(0.50 + 0.32·Δdepth + 0.18·Δopenness + 0.14·Δattention, 0.15, 0.95)` |
| Treibende Schicht-2-Parameter | `depth` (+0.32), `openness` (+0.18), `attention` (+0.14) |
| Treibende Schicht-1-Metriken | `type_token_ratio`, `long_word_ratio`, `subordinate_conjunction_ratio`, `long_pause_ratio`, `topic_keyword_density`, `topic_coherence`; gegenläufig `window_blur_rate`, `hidden_time_ratio` |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | Master-Amplitude des Ebenenabstands: `Z = −3` rückt tiefer, `Z = 0` bleibt Anker, `Z = +1/+2` treten vor; skaliert `k_z` aller Ebenen |
| HAI-Interaktionswirkung | gedankliche Tiefe: Smalltalk = ruhiges Blatt, Reflexion = tiefer Resonanzraum |
| Modulierte Bone-Felder | `horizonLineAlpha` (über `max(base, 0.12·intensity)`), `sedimentOpacity` (`max(base, 0.08·intensity)`), `auraOpacity` (+0.18·(intensity−0.5)), `saccadeAmp` (+0.2·(intensity−0.5)) |

### 2.2.2 `parallaxGain` — `--depth-parallax`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-parallax` |
| Wertebereich / Neutral | 0.20 … 1.35 / `0.850`; bei `prefers-reduced-motion: reduce` hart `0` |
| Formel | `reducedMotion ? 0 : clamp(0.85 + 0.35·Δopenness + 0.25·Δenergy + 0.20·Δplayfulness − 0.20·Δformality, 0.20, 1.35)` |
| Treibende Schicht-2-Parameter | `openness` (+0.35), `energy` (+0.25), `playfulness` (+0.20), `formality` (−0.20) |
| Treibende Schicht-1-Metriken | `curiosity_words`, `question_ratio`, `surprise_markers`, `emoji_ratio`, `humor_irony`, `arousal_vader` (positiv); `formality_f_score`, `passive_voice_ratio` (negativ) |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | Bewegungsstärke der gegenläufigen Mikro-Parallaxe: `Z = −3` ca. −4 px, `Z = −2` ca. −1.5 px, `Z = 0` +0.75×, `Z = +1` bis +5 px — reine `translate3d`-Compositor-Kosten, 0 Paint |
| HAI-Interaktionswirkung | wache räumliche Präsenz: der ganze Raum geht minimal mit, nicht nur die Pupillen |
| Modulierte Bone-Felder | `driftFreqScale` (+0.25·(parallax−0.85)) |

### 2.2.3 `cornealDepth` — `--depth-cornea`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-cornea` |
| Wertebereich / Neutral | 0.25 … 1.00 / `0.650` |
| Formel | `clamp(0.65 + 0.35·Δcloseness + 0.25·Δattention + 0.15·Δwarmth, 0.25, 1.00)` |
| Treibende Schicht-2-Parameter | `closeness` (+0.35), `attention` (+0.25), `warmth` (+0.15) |
| Treibende Schicht-1-Metriken | `first_person_singular_ratio`, `second_person_ratio`, `self_disclosure`, `vocative_address`, `gratitude_markers`, `pointer_near_presence_ratio` |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | wirkt ausschließlich auf `Z = 0`: Catchlight wandert `−0.18×` gegen die Pupille (Deckel ±2.5 px), Pupillenkern `+1.06×`, Lid-Kontaktschatten auf der Sklera wird schärfer |
| HAI-Interaktionswirkung | unmittelbare persönliche Zuwendung: „du“ und Dankbarkeit machen den Blick plastischer und nahbarer |
| Modulierte Bone-Felder | `eyeRimGlowBlur` (+10·max(0, cornea−0.65)), `irisLimbusAlpha` (+0.04·max(0, cornea−0.5)), `catchlightMainX/Y` (indirekt über den Lichtvektor, §2.4) |

### 2.2.4 `lightDirectionCoupling` — `--depth-light-x` / `--depth-light-y`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-light-x`, `--depth-light-y` |
| Wertebereich / Neutral | je −1.00 … +1.00 / `+0.560` / `+0.640` (aus `orbA` 22 %/18 %) |
| Formel | `lightX = clamp((50 − orbAX)/50 + 0.18·Δwarmth, −1, 1)` · `lightY = clamp((50 − orbAY)/50 + 0.15·Δcalm, −1, 1)` |
| Treibende Schicht-2-Parameter | `orbAX`/`orbAY` (Anker), `warmth` (+0.18), `calm` (+0.15) |
| Treibende Schicht-1-Metriken | `sentiment_valence`, `sentiment_balance`, `joy_lexicon` (positiv); `anger_lexicon`, `negation_ratio` (negativ) |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | **eine** Lichtwahrheit für alle Ebenen: Schattenwurf von `Z = −1/0` und Glanzwinkel von `Z = 0` folgen demselben Vektor; bei Weltwechsel (warmer Atelier- vs. kühler Nachtorb) wandert das Licht glaubwürdig |
| HAI-Interaktionswirkung | stimmige physische Verankerung: Stimmung verschiebt den Lichteinfall, statt nur die Farbe |
| Modulierte Bone-Felder | `eyeShadowX` (+lightX·6), `catchlightMainX` (+lightX·5), `catchlightMainY` (+lightY·4); zusätzlich statisch in `compileBonesToCssVars()`: `--depth-light-x/y` aus `orbA` |

### 2.2.5 `shadowElevation` — `--depth-shadow-length` / `--depth-contact-alpha`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-shadow-length` (px), `--depth-contact-alpha` |
| Wertebereich / Neutral | 8 … 32 px, 0.14 … 0.48 / `14px`, `0.280` |
| Formel | `round(clamp(14 + 16·Δdepth − 10·Δcloseness + 6·Δcalm, 8, 32))` · `clamp(0.28 + 0.18·Δcloseness + 0.12·Δcertainty, 0.14, 0.48)` |
| Treibende Schicht-2-Parameter | `depth` (+16 px), `closeness` (−10 px / +0.18 Alpha), `calm` (+6 px), `certainty` (+0.12 Alpha) |
| Treibende Schicht-1-Metriken | `clause_depth`, `think_time_total` (heben); `first_person_singular_ratio`, `boosters`, `dominance_vad`, `imperative_mood` (senken/verdichten) |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | `Z = −1`: kurzer, harter Kontaktschatten (8–11 px) bei Nähe ↔ langer, weicher Umgebungsschatten (20–32 px) beim Schweben; `Z = 0` bleibt davon unberührt |
| HAI-Interaktionswirkung | Nähe vs. innere Distanz: Zuhören/Sprechen sitzt geerdet, Nachdenken/Rückzug schwebt |
| Modulierte Bone-Felder | `eyeShadowY` (+(len−14)·0.45), `eyeShadowBlur` (+(len−14)·0.6); `contactAlpha` wird heute **nur als Token** geschrieben und von keinem Bone gelesen (Grep über `src/surface/` und `src/metrics/`) |

### 2.2.6 `atmosphericHaze` — `--depth-haze`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-haze` |
| Wertebereich / Neutral | 0.08 … 0.78 / `0.350` |
| Formel | `clamp(0.35 + 0.30·Δopenness + 0.20·Δdepth − 0.25·Δcertainty − 0.20·Δformality, 0.08, 0.78)` |
| Treibende Schicht-2-Parameter | `openness` (+0.30), `depth` (+0.20), `certainty` (−0.25), `formality` (−0.20) |
| Treibende Schicht-1-Metriken | `conditional_ratio`, `future_tense_ratio` (positiv); `hedge_ratio`, `hedges`, `modal_verb_ratio` (senken die Sicherheit), `boosters` (negativ) |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | dämpft Kontraste und blendet Kanten auf `Z = −3/−2` weich in den Dunst; Horizont- und Sedimentkante verlieren Schärfe, der Lichtraum wird weiter |
| HAI-Interaktionswirkung | Offenheit vs. analytische Schärfe: Abwägen („vielleicht“, „was wäre wenn“) legt Dunst über den Raum, klare Aussagen machen die Luft glasklar |
| Modulierte Bone-Felder | `horizonLineAlpha` (×(1 − 0.35·haze)), indirekt `sedimentOpacity` |

### 2.2.7 `focalSeparation` — `--depth-focal-contrast`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-focal-contrast` |
| Wertebereich / Neutral | 0.15 … 0.95 / `0.500` |
| Formel | `clamp(0.50 + 0.35·Δattention + 0.25·Δdensity + 0.15·Δcertainty − 0.15·Δopenness, 0.15, 0.95)` |
| Treibende Schicht-2-Parameter | `attention` (+0.35), `density` (+0.25), `certainty` (+0.15), `openness` (−0.15) |
| Treibende Schicht-1-Metriken | `word_count`, `mean_sentence_length`, `noun_ratio`, `topic_keyword_density`, `closed_question` |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | Luminanz-Spreizung: `Z = +1` (Antwort) hebt sich, `Z = −1/−2` (Prompt-Rest, Horizont, Chrome) treten zurück; **kein** Text-Blur, nur Helligkeit/Kontrast |
| HAI-Interaktionswirkung | Fokus-Führung und Cognitive-Load-Schutz: dichte, konzentrierte Turns bekommen eine beleuchtete Lesebühne |
| Modulierte Bone-Felder | `vignetteAlpha` (+0.14·(focal−0.5)), `answerShadowAlpha` (+0.08·focal), `focusPull` (+0.18·(focal−0.5)) |

### 2.2.8 `visualGravity` — `--depth-gravity`

| Feld | Wert |
|---|---|
| CSS Custom Property | `--depth-gravity` |
| Wertebereich / Neutral | −0.85 … +0.85 / `0.000` |
| Formel | `clamp(0.45·Δcalm + 0.35·Δdepth − 0.45·Δenergy − 0.25·Δtempo, −0.85, 0.85)` |
| Treibende Schicht-2-Parameter | `calm` (+0.45), `depth` (+0.35), `energy` (−0.45), `tempo` (−0.25) |
| Treibende Schicht-1-Metriken | `typing_speed_cps`, `typing_burst_length`, `turns_per_minute`, `interruption_rate`, `long_pause_ratio`, `turn_interval_median` |
| Sichtbare 2.5D-Wirkung (Z −3 … +3) | vertikaler Zug von ±6 px auf `Z = +1/+2`: negatives Vorzeichen hebt Bühne und Antwort leicht an, positives lässt sie schwerer ruhen |
| HAI-Interaktionswirkung | Initiative und Gesprächsenergie: lebendige Dialoge heben an, Ruhe/Müdigkeit/Nachdenken erden |
| Modulierte Bone-Felder | keine direkt (Token für `translate3d`-Projektion in §3.4 vorgesehen) |

## 2.3 Formeln als Code (eine Quelle, zwei Aufrufer)

Alle elf Messwerte, die 14 Tokens und die Trägheitswerte entstehen in **einer** Funktion; der Projektor importiert sie, statt sie zu duplizieren (Stand 00:54:15 CET):

```js
// src/metrics/surface.js — deriveSpatialDepth(params, options)
const Δ = (v) => v - 0.5;
spatiality        = clamp(2.4*(0.45*Δ(depth) + 0.30*Δ(openness) + 0.25*Δ(closeness)), -1, 1);
depthIntensity    = clamp(0.50 + 0.32*Δ(depth) + 0.18*Δ(openness) + 0.14*Δ(attention), 0.15, 0.95);
parallaxGain      = reducedMotion ? 0
                  : clamp(0.85 + 0.35*Δ(openness) + 0.25*Δ(energy) + 0.20*Δ(playfulness) - 0.20*Δ(formality), 0.20, 1.35);
cornealDepth      = clamp(0.65 + 0.35*Δ(closeness) + 0.25*Δ(attention) + 0.15*Δ(warmth), 0.25, 1.00);
lightX            = clamp((50 - orbAX)/50 + 0.18*Δ(warmth), -1, 1);
lightY            = clamp((50 - orbAY)/50 + 0.15*Δ(calm), -1, 1);
shadowLengthPx    = round(clamp(14 + 16*Δ(depth) - 10*Δ(closeness) + 6*Δ(calm), 8, 32));
contactAlpha      = clamp(0.28 + 0.18*Δ(closeness) + 0.12*Δ(certainty), 0.14, 0.48);
atmosphericHaze   = clamp(0.35 + 0.30*Δ(openness) + 0.20*Δ(depth) - 0.25*Δ(certainty) - 0.20*Δ(formality), 0.08, 0.78);
focalSeparation   = clamp(0.50 + 0.35*Δ(attention) + 0.25*Δ(density) + 0.15*Δ(certainty) - 0.15*Δ(openness), 0.15, 0.95);
visualGravity     = clamp(0.45*Δ(calm) + 0.35*Δ(depth) - 0.45*Δ(energy) - 0.25*Δ(tempo), -0.85, 0.85);
lagFarMs          = round(clamp(1250 + 350*Δ(calm) - 200*Δ(tempo), 850, 1650));
lagMidMs          = round(clamp(650  + 180*Δ(calm) - 120*Δ(tempo), 420, 920));
lagNearMs         = round(clamp(280  +  80*Δ(calm) -  60*Δ(tempo), 180, 420));
```

Rundung: `spatiality` 4 Dezimalstellen, die übrigen Messwerte 3, `shadowLengthPx` und die Lags ganzzahlig, `--depth-shadow-length` als `"14px"`.

## 2.4 Die 17 modulierten Bone-Felder

`modulateBonesWithMetrics(bones, params, spatial)` in `src/surface/surface-projector.js` läuft **nur**, wenn ein Bone-Set aktiv ist und Metrik-Parameter vorliegen; jeder Wert wird auf die `BONE_SCHEMA`-Grenzen geklemmt und das Ergebnis durch `ensureWcagContrast()` geschützt (`src/surface/surface-bones.js`).

| Bone (Familie) | Änderung | Sichtbare Wirkung |
|---|---|---|
| `eyeShadowX` (eyes) | `base + lightX·6` | Schatten fällt vom Licht weg statt starr `X = 0` |
| `eyeShadowY` (eyes) | `base + (len−14)·0.45` | Schattenlänge folgt Schwebehöhe ↔ Nähe |
| `eyeShadowBlur` (eyes) | `base + (len−14)·0.6` | weicherer Umgebungsschatten bei Elevation |
| `eyeRimGlowBlur` (eyes) | `base + 10·max(0, cornea−0.65)` | plastischerer Limbus/Rim bei Nähe |
| `catchlightMainX` (eyes) | `base + lightX·5` | Glanzpunkt sitzt auf der Lichtseite |
| `catchlightMainY` (eyes) | `base + lightY·4` | Glanzpunkt folgt der Lichtneigung |
| `irisLimbusAlpha` (eyes) | `base + 0.04·max(0, cornea−0.5)` | Irisrand gewinnt Tiefe |
| `pupilSizeBias` (eyes) | `base + 0.12·Δcloseness + 0.08·Δwarmth` | subtile relationale Pupillenweitung |
| `focusPull` (eyes) | `base + 0.18·(focal−0.5)` | Blick zieht bei hohem Fokus zusammen |
| `saccadeAmp` (eyes) | `base + 0.2·(intensity−0.5)` | größere Sakkaden im tiefen Raum |
| `driftFreqScale` (eyes) | `base + 0.25·(parallax−0.85)` | mehr/weniger räumliche Unruhe |
| `horizonLineAlpha` (texture) | `max(base, 0.12·intensity)·(1 − 0.35·haze)` | zarte Turrell-Raumschwelle, im Dunst weicher |
| `sedimentOpacity` (texture) | `max(base, 0.08·intensity)` | Tiefenschichtung im Hintergrundfeld |
| `auraOpacity` (light) | `base + 0.18·(intensity−0.5) + 0.12·Δwarmth` | Lichtfeld gewinnt Leuchtkraft |
| `auraBreathMs` (light) | `base·(1 + 0.35·Δcalm − 0.25·Δenergy)` | Raum-Atmung wird ruhiger/schneller |
| `vignetteAlpha` (light) | `base + 0.14·(focal−0.5)` | Peripherie schließt sich bei Fokus |
| `answerShadowAlpha` (typography) | `base + 0.08·focal` | Antwort hebt sich hauchfein vom Grund |

## 2.5 Signalweg Ende-zu-Ende (belegt)

```
Turn-Text + Tipp-Ereignisse
  → computeMetrics()                      src/metrics/compute.js        (109 Katalog-IDs, 7 Gruppen)
  → createParameterEngine()               src/metrics/engine.js         (12 Parameter, geglättet über Turns)
  → applySurface() / writeVariables()     src/metrics/surface.js        schreibt --p-<id> + alle Tokens
  → CustomEvent 'agentfaehig:metrics-commit'  src/metrics/surface.js    detail: {params, behaviour}
  → setMetricParams() / apply()           src/surface/surface-projector.js   ein Writer für alle CSS-Variablen
  → projectSurfaceState()                 … blendLegacyWithMetrics() (w=0.35 / 0.75)
                                          … deriveSpatialDepth()       → 14 Tokens
  → modulateBonesWithMetrics()            … nur bei aktivem Bone-Set, 17 Felder
  → compileBonesToCssVars()               src/surface/surface-bones.js  → 187 --bone-* + --depth-light-x/y
  → document.documentElement.style.setProperty(...)
  → (offen) CSS liest --depth-*/--scene-* → sichtbare 2.5D-Wirkung
```

Der letzte Schritt fehlt — das ist die einzige Lücke zwischen „gerechnet“ und „sichtbar“ (§3.3a, §3.4).

---

# C3 — Nicht-Ziele und nächster verifizierbarer Implementierungsschritt

## 3.1 Harte Nicht-Ziele

| # | Nicht-Ziel | Durchsetzung / Beleg |
|---|---|---|
| N1 | **Kein WebGL, Three.js oder Rive.** Zero-Build bleibt. | `package.json` hat keine Runtime-Dependency (nur `code-canvas-server` als Dev-Dependency); 180-Bone-System und `ensureWcagContrast()` bleiben der Renderpfad |
| N2 | **Kein vierter Slider für „Tiefe/3D“.** | `MAX_VISIBLE_CONTROLS = 3` in `src/surface/surface-state.js`, unverändert; Tiefe entsteht ausschließlich aus Gespräch, Metriken, Welt und den drei bestehenden Polen |
| N3 | **Kein `filter: blur()` auf Lesetext.** | Tiefe im Dialogbereich nur über Luminanz/Kontrast (`--depth-focal-contrast`); `presence.css` nutzt `blur` ausschließlich für `backdrop-filter` der Chrome, nie auf Text |
| N4 | **Keine 60-fps-Animation von `box-shadow`-Blur-Radien oder SVG-Filtern.** | Im Loop sind nur `transform` (`translate3d`/`scale`) und `opacity` erlaubt; Schattenradien ändern sich nur bei Phasen-/Turn-Wechsel |
| N5 | **Kein Überschreiben expliziter Nutzer-Welten.** | `DEFAULT_METRIC_WEIGHT = 0.35` bei `isModified()`, sonst 0.75; `keepAuthoritativeSurface()` in `src/main.js` ruft `reapply()` nach `RESPONSE_END` |
| N6 | **Kein Commit, Push oder Deploy ohne Owner-Freigabe.** | Dieser Lauf hat ausschließlich diese Datei geschrieben; `git status` zeigt keine neuen Commits |

## 3.2 Was heute belegt scharfgeschaltet ist

| Baustein | Pfad / Symbol | Beleg |
|---|---|---|
| Ableitung der 8 Dimensionen + `spatiality` + Lags | `src/metrics/surface.js` → `deriveSpatialDepth()` | 14 Tokens; von `deriveSurface()` aufgerufen und dort in `variables` gespreizt |
| Token-Schreibung in den DOM | `src/metrics/surface.js` → `writeVariables()` | schreibt `--p-<id>` und alle `variables` über `setProperty` |
| Lichtvektor aus `orbA` („One Light Truth“) | `src/surface/surface-bones.js` → `compileBonesToCssVars()` | `--depth-light-x = clamp((50−orbAX)/50, −1, 1)`, `--depth-light-y` analog; Test 8 der Bridge-Suite prüft es für alle 8 Welten |
| Metrik-Modulation von 17 Bones | `src/surface/surface-projector.js` → `modulateBonesWithMetrics()` | im `apply()`-Pfad an `activeMetricParams` gekoppelt, Ergebnis durch `ensureWcagContrast()` |
| Metrik-Brücke (ohne Fremd-Listener) | `src/metrics/surface.js` (dispatch) → `src/surface/surface-projector.js` (`setMetricParams`, `agentfaehig:metrics-commit`) | `setMetricParams()` ist der einzige Eingang; `reapply()` rechnet denselben Zustand neu |
| Anker + Delta-Komposition | `src/surface/surface-projector.js` → `blendLegacyWithMetrics()`, `DEFAULT_METRIC_WEIGHT` | Neutralfall bit-identisch zum Anker |
| Tests | `tests/metrics-spatial-bridge.test.js` | 8 Tests: Wertebereiche aller Tokens, `depth`/`closeness`-Monotonie, `openness`/`attention·density`, Vorzeichen der Gravitation, reduced motion, Ende-zu-Ende-Turn, persönlich vs. förmlich, Lichtvektor je Welt |

**Testlauf (Beleg, 20.11.2026):**

```
$ node --test tests/metrics-spatial-bridge.test.js
# tests 8   # pass 8   # fail 0

$ npm test
# tests 274  # pass 274  # fail 0
```

## 3.3 Was noch **nicht** sichtbar ist (die eigentliche Prüfantwort)

| # | Befund | Beleg | Folge |
|---|---|---|---|
| a | **Keine CSS-Regel liest die Tiefen-Tokens.** | `grep -rn -- "--depth-\|--surface-spatial\|--scene-" src/styles/ src/living-surface.html` → **0 Treffer** (20.11., 00:54 CET) | Die Tokens sind im DOM gesetzt, haben aber **null Pixelwirkung**. „Sichtbare Wirkung“ ist heute spezifiziert, nicht belegt |
| b | **`src/styles/bones/bones-depth.css` existiert nicht.** | `ls src/styles/bones/` → 6 Dateien (controls, eyes, light, stage, texture, typography) | Es gibt keinen Ort, an dem die 7 Ebenen aktuell verdrahtet wären |
| c | **`--scene-px` / `--scene-py` fehlen.** | `grep -rn "scene-px" src/presence/` → 0 Treffer | Ohne Szenen-Vektor keine Parallaxe, egal wie gut `parallaxGain` rechnet |
| d | **`.stage { filter: saturate() contrast() }` rasiert alle Kind-Ebenen in eine Bitmap.** | `src/styles/bones/bones-texture.css` | Hebt die Z-Staffelung optisch wieder auf, selbst wenn (a)–(c) gelöst sind |
| e | **Doppel-Implementierung in `surface-bones.js`.** | `modulateBonesWithMetrics()` existiert dort zusätzlich mit abweichenden Formeln (z. B. `shadowDeltaY` statt `shadowLengthPx`) und wird **von niemandem importiert** | Divergenzrisiko: zwei Wahrheiten für dieselbe Modulation. Empfehlung: die Variante in `surface-bones.js` entfernen oder als einzige Quelle etablieren — Entscheidung liegt beim Owner, nicht in diesem Lauf |

## 3.4 Nächster verifizierbarer Schritt: Stufe-1-Visual-Slice

Ziel: die bereits gerechneten Tokens in **sichtbare** Wirkung bringen, ohne ein Nicht-Ziel zu verletzen. Vier kleine, unabhängig prüfbare Änderungen:

| # | Änderung | Datei | Fertig-Kriterium (prüfbar) |
|---|---|---|---|
| S1 | 7 Z-Ebenen an die Tokens hängen: `transform: translate3d(calc(var(--scene-px, 0px) * var(--k-z-far)), calc(var(--scene-py, 0px) * var(--k-z-far)), 0)` je Ebene (`Z = −3 … +3`), `k_z` als `--k-z-*`; `transition` aus `--scene-lag-far/mid/near` | **neu:** `src/styles/bones/bones-depth.css`, eingebunden in `src/living-surface.html` | Im Browser ändern sich `getComputedStyle(body, '::before').transform` und die Ebenen-Transforms, sobald `--scene-px ≠ 0`; bei `--depth-parallax: 0` bleibt jede Transform `none`/`matrix(1,0,0,1,0,0)` |
| S2 | Corneal Counter-Parallax: Catchlight gegen die Pupille, `translate3d(calc(var(--eye-left-pupil-x) * -0.18 * var(--depth-cornea, 0.65)), …)`; Deckel ±2.5 px | `src/styles/presence.css` | Style-Test prüft die Regel; Sichtprüfung: bei maximaler Blickbewegung wandert der Glanzpunkt minimal gegenläufig, ohne Schielen |
| S3 | Szenen-Vektor im bestehenden rAF-Loop ausgeben: gedämpfter Kanal (`omega · 0.45`, `stepCriticallyDamped()` existiert bereits), schreibt `--scene-px` / `--scene-py` | `src/presence/presence.js` (+ ggf. `src/presence/eye-motion-engine.js`) | `tests/eye-motion.test.js`: Kanal bleibt geklemmt, ist bei `reducedMotion` exakt 0, und der Loop erzeugt keine Layout-/Paint-Reads |
| S4 | `.stage`-Filter entkoppeln: `saturate/contrast` von der Bühne auf die Hintergrund-Ebenen (`html::before` / `body::before`) verschieben | `src/styles/bones/bones-texture.css` | Style-Test: `.stage` trägt keinen `filter` mehr; `ensureWcagContrast()`-Tests und die Kontrast-Assertions in `tests/style.test.js` bleiben grün; Sichtprüfung: Hintergrund bleibt getönt, Ebenen bleiben getrennt |

**Gate danach (nicht Teil dieses Auftrags):** Erst wenn S1–S4 grün sind **und** ein Screenshot-Vergleich (vorher/nachher, `reducedMotion` an/aus) die Tiefenwirkung zeigt, darf Stufe 2 (Phasen-Choreografie über `html[data-depth-phase]`, Ambient-Socket `Z = −1`, Turrell-Apertur `Z = −2`) beginnen. Vorher wäre jede Stufe-2-Arbeit auf unsichtbaren Tokens gebaut.

## 3.5 Belegstand, Reproduktion und Vorbehalte

**Momentaufnahme (SHA-256, 12 Stellen) und Zeilenumfang:**

| Datei | SHA-256 | Zeilen (Stand) |
|---|---|---|
| `src/metrics/surface.js` | `46f1e5229b3a` | 722 |
| `src/surface/surface-bones.js` | `21780eb1cfc2` | 777 |
| `src/surface/surface-projector.js` | `1500d5fb7a49` (00:57) | 697 — im Umbau: 502 zu Beginn des Laufs (00:50), 693 um 00:54, 697 um 00:57; jede Zahl ist eine Momentaufnahme derselben Parallel-Session |
| `tests/metrics-spatial-bridge.test.js` | `399c1648e5a0` | 363 |

**Reproduktion:**

```
grep -rn "deriveSpatialDepth\|modulateBonesWithMetrics\|agentfaehig:metrics-commit" src/
grep -rn -- "--depth-\|--surface-spatial\|--scene-" src/styles/ src/living-surface.html   # erwartet: 0 Treffer (Stand 00:54)
node --test tests/metrics-spatial-bridge.test.js
npm test
```

**Vorbehalt 1 — bewegter Baum:** `src/surface/surface-projector.js` und `tests/metrics-spatial-bridge.test.js` wurden während dieses Laufs von einer zweiten Session angelegt und umgebaut. Um 00:50 CET existierten weder Bridge noch Testdatei (der Projektor importierte nur `applySurface`/`deriveSurface`); um 00:52 lief die Suite 7/8 (der reduzierte-Motion-Test kollidierte mit der generischen Wertebereichs-Assertion, die `--depth-parallax = 0` nicht zulässt); um 00:53:33 und 00:54:23 lief sie 8/8. Zeilennummern in diesem Dokument sind daher Momentaufnahmen — maßgeblich sind die **Symbolnamen**.

**Vorbehalt 2 — was dieses Dokument nicht behauptet:**
- Es behauptet **keine** sichtbare Tiefenwirkung im Pixel. Belegt ist der Datenpfad, nicht das Bild (§3.3a).
- Es behauptet **keine** bestätigte Framework-, Hosting- oder Modellentscheidung.
- Es enthält **keinen** Commit, Push oder Deploy; die einzige geschriebene Datei ist diese.

**Abschluss:** C1, C2 und C3 sind mit Pfaden, Formeln und Testläufen dokumentiert. Die Prüfung der sichtbaren Wirkung ergibt: Datenpfad steht (8/8 Bridge-Tests, 274/274 Gesamtsuite), Pixelwirkung fehlt (0 CSS-Konsumenten) — nächster verifizierbarer Schritt ist der Stufe-1-Visual-Slice S1–S4 aus §3.4.
