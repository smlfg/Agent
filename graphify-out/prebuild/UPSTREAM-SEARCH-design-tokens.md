# UPSTREAM_SEARCH — Design-Parameter (Token-Vertrag, Kontrast, warm ↔ cold, Slider)

Stand: 19.11.2026 · Subagent · Schreibbereich: nur diese Datei ·
Projekt `03_HAI/Agentfaehig/Agent`

Ergänzt [`UPSTREAM-SEARCH-generative-ui.md`](UPSTREAM-SEARCH-generative-ui.md)
und prüft die dort offen gebliebene Annahme, dass ein Design-Token-Vertrag und
eine Kontrast-Validierung Eigenbau sein müssen. Geprüft wurde gegen den Markt
und gegen die Spezifikationen, nicht gegen die Projektvorprüfung.

**Kein Designvorschlag.** Die Tabellen sind Fakten + Urteil; die Wahl trifft
der Owner.

## Need

Der Mensch stellt Design-Parameter live ein, der Agent nicht. Erste Achse
`warm ↔ cold`: warm = `warmhearted`, `wooden?`, `gentel?` (gentle); cold =
`techy`, `blueish` ([`sketches/2026-11-12-agentfaehig.md:101-105`](../../sketches/2026-11-12-agentfaehig.md)).
Geplant: 5 Parameter, „maybe 5 options but only show 3", „2 more when this".
Projektregel: „Kein eigener Code. Upstream zuerst" (`tech/INTENT.md:34`).

Die Vorprüfung schätzte **40–60 Zeilen** für den Token-Vertrag und **60–100**
für die Kontrast-Validierung, beides ohne Upstream-Prüfung. Diese Schätzung ist
im Abschnitt [„Eigenbau nach dem besten Stack"](#eigenbau-nach-dem-besten-stack)
explizit dagegen gestellt.

---

## a) Token-Formate und -Standards

| # | Kandidat | URL | Lizenz | Reifegrad | Was es löst | Was Eigenbau bleibt | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | **W3C DTCG Design Tokens Format Module 2025.10** | [designtokens.org/TR/2025.10/format](https://www.designtokens.org/TR/2025.10/format/) | W3C Community Final Specification Agreement (FSA) — Spezifikation, keine Code-Lizenz | **Final Community Group Report, 28.10.2025**; Statuszeile: „It is **not a W3C Standard** nor is it on the W3C Standards Track"; im CG-Prozess als *Candidate Recommendation* veröffentlicht | Datenvertrag für Token-Dateien: `$value`/`$type`/`$description`, Gruppen, Aliasse (`{token}`), `$extends` (JSON-Schema-`$ref`-Semantik), `$deprecated`, `$extensions` (Reverse-Domain-Keys) | Alles zur **Laufzeit**: kein Verhalten, kein Zustand, keine UI, keine Kontrastprüfung. Kein `oklch` im abgerufenen Spec-Text (0 Vorkommen); Farbraum wird nur als `colorSpace`-Feld benannt, alle Beispiele `"srgb"` | **DECKT** (Datei-/Austauschvertrag) |
| 2 | **Style Dictionary 5.8.0** | [styledictionary.com/info/tokens](https://styledictionary.com/info/tokens/) | Apache-2.0 | npm 5.8.0, 03.11.2026 · ★ 4.887 · Push 03.11.2026 | Übersetzt Token-Dateien in Plattform-Ausgaben. Docs: „**forward-compatible with the Design Token Community Group spec**"; ab v4 beide Formate (`$value` **oder** `value`), „pick one though as they cannot be combined inside a single Style Dictionary instance" | Kein Runtime, kein Kontrastcheck, kein Parameter-Modell. Nur Build-Schritt | **TEILWEISE** |
| 3 | **Tailwind CSS 4.3.5 `@theme`** | [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) | MIT | npm 4.3.5, 06.11.2026 · ★ 98.670 · Push 18.11.2026 | Theme-Variablen sind echte CSS-Variablen **und** erzeugen Utilities; Doku-Beispiel in `oklch(0.72 0.11 178)`; „required to be defined top-level and not nested under other selectors or media queries". `:root` bleibt für Variablen ohne Utility | Kein Token-Datei-Format (kein Export/Import), kein Kontrastcheck, Kopplung an Utility-Klassen | **TEILWEISE** |
| 4 | **Open Props 1.7.23** | [open-props.style](https://open-props.style/) | MIT (Seitenkopf: „v1.7.23 MIT") | npm 1.7.23, 31.01.2026 · ★ 5.582 · Push 11.10.2026 | 500+ fertige CSS-Variablen; `open-props/palette` liefert **16 OKLCH-Stufen**, gesteuert über `--palette-hue`, `--palette-hue-rotate-by`, `--palette-chroma` (Quelltext geprüft: jede Stufe `oklch(<feste L> calc(<Faktor> * var(--palette-chroma)) calc(var(--palette-hue) + (<n> * var(--palette-hue-rotate-by))))`) | Keine Kontrastgarantie: L ist pro Stufe fix, C nur ein globaler Multiplikator. Welche Hue „warm" ist, ist Projektentscheidung. Kein Token-Datei-Format | **TEILWEISE** |
| 5 | **CSS `light-dark()`** | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) | Spec-Primitive (keine Software-Lizenz) | Baseline **2024**, „newly available, since May 2024" | Zwei Farbwerte, Auswahl über das aktive Farbschema, ohne `prefers-color-scheme`-Block. Braucht `color-scheme: light dark` (MDN: „usually set on the `:root` pseudo-class"). Ersetzt doppelte Hell/Dunkel-Token-Sätze | Nichts für warm ↔ cold und nichts für Kontrast | **DECKT** (Teilproblem Hell/Dunkel) |
| 6 | **CSS `color-mix()`** | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) | Spec-Primitive | Baseline „**widely available** … since May 2023" | Mischt zur Laufzeit in einem wählbaren Raum. MDN: Default-Raum ist **oklab** (`color-mix(red, blue)` ≡ `color-mix(in oklab, red, blue)`); in `oklch` ist die Hue-Interpolation per Default `shorter hue` | Keine Kontrastgarantie, kein Vertrag, keine Grenzprüfung | **DECKT** (Interpolation warm ↔ cold) |
| 7 | **CSS `@property`** | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) | Spec-Primitive | Baseline **2024**, „since July 2024" | Typisierte Custom Properties: Typprüfung, Default, Vererbung — nötig, damit eine Variable sauber interpolierbar/überschreibbar bleibt | Kein Semantik-Modell („warm" ≠ Typ) | **TEILWEISE** |

**Befund zu a):** Es gibt einen Format-Standard (DTCG), und er ist final
verabschiedet — aber als CG-Report, ausdrücklich **kein W3C-Standard**. Für
„Mensch setzt Design-Parameter live" gibt es in keinem der sieben Kandidaten
ein Modell: das ist Zustand, nicht Token.

---

## b) Kontrast

| # | Kandidat | URL | Lizenz | Reifegrad | Prüft | Was es löst | Was Eigenbau bleibt | Urteil |
|---|---|---|---|---|---|---|---|---|
| 1 | **WCAG 2.2, SC 1.4.3 / 1.4.6 / 1.4.11** | [w3.org/TR/WCAG22](https://www.w3.org/TR/WCAG22/#contrast-minimum) | W3C Document License | **W3C Recommendation, 12.12.2024** | **WCAG** | Die Schwelle selbst: Text 4,5:1, große Schrift 3:1 (1.4.3); verschärft 7:1/4,5:1 (1.4.6); Bedienelemente 3:1 (1.4.11). Formel im Glossar: `(L1 + 0,05) / (L2 + 0,05)` mit **relativer Luminanz** | Kein Code. Die Spec enthält nur die Formel; Implementierung, Token-Bezug und Produktverhalten bleiben offen | **DECKT** (Maßstab, keine Bibliothek) |
| 2 | **colorjs.io 0.7.1** | [colorjs.io/docs/contrast](https://colorjs.io/docs/contrast) | MIT | npm 0.7.1, 24.07.2026 · ★ 2.325 · Push 16.11.2026 · 81,7 kB min / **32,4 kB gzip**, 0 Deps, laut Doku tree-shakable | **beides** (WCAG 2.1 **und** APCA) | `contrastWCAG21()`, `contrast(x,"APCA")` (implementiert „APCA version 0.0.98G-4g", laut Doku), zusätzlich Weber, Michelson, Lstar; dazu Konvertierung, Gamut-Mapping, `oklch()`-Rechnung. Selbst geprüft: `black/white = 21`, Handformel stimmt auf 2 Dezimalstellen überein | Kein Token-Datei-Leser, keine Pass/Fail-Policy, kein „welches Paar ist Text auf Hintergrund" | **DECKT** |
| 3 | **@adobe/leonardo-contrast-colors 1.1.0** | [github.com/adobe/leonardo](https://github.com/adobe/leonardo) | Apache-2.0 | npm 1.1.0, 18.02.2026 · ★ 2.179 · Push 08.07.2026 · 85,4 kB min / 23,6 kB gzip, 5 Deps | **WCAG** (Ziel-Ratio), kein APCA | Erzeugt Farben **aus** Zielverhältnissen: `new Color({colorKeys:[…], ratios:[3, 4.5]})`, `Theme({lightness, contrast, saturation})`, Ausgabe `theme.contrastColors`. Kontrast ist damit Eingabe, nicht Prüfobjekt | Ausgabeformate laut README: HEX, RGB, HSL, HSV, HSLuv, LAB, LCH — **kein OKLCH**. Kontrast ist bei Erzeugung exakt, nicht bei nachträglicher Hue-Rotation | **DECKT** (Erzeugung) |
| 4 | **APCACH 0.6.4** | [github.com/antiflasher/apcach](https://github.com/antiflasher/apcach) | MIT | npm 0.6.4, 13.11.2023 · ★ 188 · letzter Push 04.02.2025 | **nur APCA** | „apcach = apca + oklch": `apcach(60, 0.2, 145)` = Zielkontrast 60, Chroma, Hue → Farbe. Damit ist Kontrast über den ganzen Hue-Weg **konstruktiv konstant**; `maxChroma()` findet die gamut-grenzige Variante | Nur APCA (kein WCAG-Verhältnis), README-Warnung: „always returns a result even if the color doesn't exist in any color spaces"; seit 2023 keine Releases | **TEILWEISE** |
| 5 | **apca-w3 0.1.9** | [github.com/Myndex/apca-w3](https://github.com/Myndex/apca-w3) | **„Limited W3 License"** (npm-Feld) | npm 0.1.9, 04.07.2022 · ★ 218 | nur APCA | APCA-Referenzimplementierung (`Lc`) | LICENSE.md: „W3 License for **Compliant Code Only**", „Patent(s) pending"; Nutzung der Bezeichnung „APCA" nur für regelkonforme Implementierungen; Verwendung außerhalb der W3-Kooperation unter „AGPU v3" | **NICHT** (Lizenz, nicht Technik) |
| 6 | **color-contrast-checker 2.1.0** | [npmjs.com/package/color-contrast-checker](https://www.npmjs.com/package/color-contrast-checker) | Apache-2.0 | npm 2.1.0, **10.09.2021**, 8 Versionen | WCAG **2.0** | Zweifarben-Prüfung, simpel | Fünf Jahre ohne Release, WCAG-2.0-Stand, kein OKLCH, kein APCA | **NICHT** |
| 7 | **incluud/color-contrast-checker** | [github.com/incluud/color-contrast-checker](https://github.com/incluud/color-contrast-checker) | MIT | ★ 27 · Push 24.01.2026 | WCAG 2.2 (AA/AAA) | Prüf-**App** (Astro) mit OKLCH-Palettengenerator und Token-Export | Keine Bibliothek, keine API — nur Web-Oberfläche. Nicht als Build-Gate einsetzbar | **NICHT** |

**Wichtigster Befund zu b):** WCAG 3.0 ist **Working Draft 10.09.2026** und
schreibt im Editor's note zum Kontrastbegriff: „**The contrast algorithm used
in WCAG 3 is yet to be determined.**" Der Begriff „APCA" kommt im gesamten
Draft-Text nicht vor. Damit ist WCAG 2.2 (Luminanz-Verhältnis) heute die einzige
verabschiedete Schwelle; APCA ist eine Ergänzung, kein Ersatz.

---

## c) „warm ↔ cold" ohne Kontrastbruch

### Was die Spezifikation sagt

- **OKLCH-Lichtheit ist nicht Luminanz.** CSS Color 4 (§ 9.2, nicht normativ)
  begründet die L-Achse genau damit: „In OkLCh, sRGB blue is
  `oklch(0.452 0.313 264.1)` while sRGB yellow is `oklch(0.968 0.211 109.8)`.
  The OkLCh Lightnesses of 0.452 and 0.968 clearly reflect the visual
  lightnesses of the two colors." WCAG rechnet dagegen mit **relativer
  Luminanz** (Glossar `contrast ratio`). Zwei verschiedene Größen — konstantes
  L garantiert kein konstantes Verhältnis.
- **HSL ist für diese Achse unbrauchbar.** CSS Color 4 § 9.2: „The hue angle in
  HSL is **not perceptually uniform**; colors appear bunched up in some areas
  and widely spaced in others."
- **Hue-Rotation in OKLCH ist visuell stabil, in CIE-LCH nicht.** CSS Color 4
  § 9.2 zeigt beide Gamut-Schnitte: konstanter CIE-LCH-Hue ergibt „a noticeable
  purpling"; konstanter OKLCh-Hue: „The visual hue remains constant."
- **Chroma ist nicht über alle Hues konstant darstellbar.** CSS Color 4
  § 14.1.3 (Gamut Mapping): gemappt wird, indem „holding the hue constant, and
  reducing the chroma until the color falls in gamut" — Lightness und Hue
  bleiben, Chroma fällt.

### Eigene Messung (kein Bauchgefühl, aber auch keine Spec-Aussage)

Methode: `colorjs.io@0.7.1` in `/tmp` (nicht im Repo), Hue in 5°-Schritten über
den Regelweg **30° … 260°** (warm → cold), Lightness/Chroma konstant, WCAG-Ratio
je Schritt. Zur Kontrolle wurde die Handformel aus WCAG 2.2 nachgerechnet
(Abweichung 0,00 bei 2 Dezimalstellen).

| Paar (Hintergrund / Text) | WCAG über den Regelweg | Drift | APCA \|Lc\| |
|---|---|---|---|
| Tint-Fläche `oklch(.97 .02 h)` / Text `oklch(.35 .05 h)` | **10,18 – 10,53** | +3,4 % | 89,8 – 90,1 |
| Panel `oklch(.85 .08 h)` / Text `oklch(.25 .04 h)` | **9,96 – 10,31** | +3,5 % | 72,9 – 75,8 |
| Akzent `oklch(.60 .15 h)` / Weiß `oklch(.98 .02 h)` | **3,48 – 3,97** | **+14,1 %** | 64,7 – 69,2 |
| Kräftiger Akzent `oklch(.62 .19 h)` / Text `oklch(.30 .05 h)` | **3,49 – 4,02** | **+15,2 %** | 32,4 – 38,2 |
| Kontrastprobe HSL, gleicher Weg (S 60, L 95 / L 25) | **5,72 – 12,87** | **Faktor 2,25×** | — |
| Kontrastprobe OKLCH, gleicher Weg (L .95 / .25, C .04) | **13,82 – 13,85** | **+0,2 %** | — |

Gamut-Grenze, ebenfalls gemessen (maximales sRGB-Chroma bei fester Lightness):

| L | Chroma-Spanne über 12 Hues | engster / weiteste Hue |
|---|---|---|
| 0,70 | **0,121 – 0,314** | 210° / 330° |
| 0,55 | **0,095 – 0,294** | 210° / 300° |

### Urteil zum Farbraum

**OKLCH, nicht HSL, nicht CIE-LCH.** Beleg: konstantes L hält den WCAG-Kontrast
über den warm↔cold-Weg bei niedrigem Chroma auf **< 4 %** Drift (HSL: Faktor
2,25×), und nur OKLCh hält den visuellen Hue beim Rotieren konstant (CSS Color 4
§ 9.2). CIE-LCH fällt raus, weil der konstante-Hue-Schnitt dort sichtbar ins
Purpur kippt — genau der Fehler, den „wooden → techy" nicht verträgt.

### Wo es trotzdem bricht

1. **Gesättigte Akzente.** 14–15 % Drift auf demselben Weg. Ein Paar, das bei
   `h=30` 4,02:1 hat, liegt bei `h=170` bei 3,49:1 — unter 4,5:1. Wer den Slider
   über gesättigte Flächen laufen lässt, braucht die Prüfung, nicht nur die
   Formel.
2. **Gamut.** Konstantes C ist in sRGB nicht über alle Hues darstellbar
   (0,121 vs. 0,314 bei L 0,70). Der Browser hält Hue und L und senkt C
   (CSS Color 4 § 14.1.3) — die deklarierte Sättigung ist dann nicht die
   gerenderte.
3. **Sehr helle Gelb-/Cyan-Bereiche.** CSS Color 4 § 14.1.4: bei flacher oder
   leicht konkaver Gamut-Kante kann die Chroma-Reduktion „excessively low"
   ausfallen. Warm-Gelb ist genau so eine Ecke.
4. **Polarität / Dark Mode.** `light-dark()` liefert zwei Werte; APCA
   unterscheidet Text- und Hintergrundrolle (colorjs-Doku: „Swapping them gives
   a somewhat different, and incorrect, result"). Ein rotierter Wert ist hell
   auf dunkel nicht derselbe Fall wie dunkel auf hell.
5. **Alpha und gestapelte Hintergründe.** WCAG misst gegen den *spezifizierten*
   Hintergrund (WCAG 2.2, Glossar Note 3/4). Transluzenz und Overlays sind aus
   der Rechnung draußen.
6. **Hue-Wahrnehmung ist nicht linear.** CSS Color 4 führt den Abney-Effekt in
   den non-normativen Referenzen; „gleicher Winkelabstand" ist kein gleicher
   empfundener Schritt.

---

## d) Zwei-Wege-Bindung Slider ↔ Zustand

| # | Kandidat | URL | Lizenz | Reifegrad | Accessibility | Urteil |
|---|---|---|---|---|---|---|
| 1 | **`<input type="range">` (nativ)** | [HTML-AAM § 3.5.71](https://www.w3.org/TR/html-aam-1.0/) · [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) | Plattform | MDN: „**Widely available** … since March 2017" | HTML-AAM mappt „input (type attribute in the Range state)" auf **`slider role`**; Tastatur, Fokus, Wertansage nativ. Bindung: `value` + `oninput` — der Zustand ist die Wahrheit, kein zweiter Speicher | **DECKT** |
| 2 | **Radix Slider 1.6.1** | [radix-ui.com/primitives/docs/components/slider](https://www.radix-ui.com/primitives/docs/components/slider) | MIT | npm 1.6.1, 12.10.2026 · ★ 19.529 · Doku-Stand 1.5.0 | „**Adheres to the Slider WAI-ARIA design pattern**"; „Can be controlled or uncontrolled"; `value` / `onValueChange` / `onValueCommit`; volle Tastatur (Arrows, PageUp/Down, Shift+Arrow) | **DECKT** (React) |
| 3 | **Zag.js `@zag-js/slider` 1.48.0** | [zagjs.com/components/react/slider](https://zagjs.com/components/react/slider) | MIT | npm 1.48.0, 13.11.2026 · ★ 5.289 · Push 19.11.2026 | „Adheres to the **Slider WAI-ARIA design pattern**"; State-Machine, Framework-agnostisch (React/Solid/Vue/Svelte/Vanilla); `onValueChange`, `getAriaValueText` | **DECKT** |
| 4 | **Ark UI `@ark-ui/react` 5.40.0** | [ark-ui.com](https://ark-ui.com) | MIT | npm 5.40.0, 29.10.2026 · ★ 5.477 | Wrapper um Zag — gleiches A11y-Versprechen, mehr Komfort | **DECKT** (Wrapper) |
| 5 | **Leva 0.10.1** | [github.com/pmndrs/leva](https://github.com/pmndrs/leva) | MIT | npm 0.10.1, 31.10.2025 · ★ 6.277 | **Eigene Prüfung des veröffentlichten Bundles** (`npm pack leva@0.10.1`, `grep` in `leva.esm.js`): **kein** `role="slider"`, **kein** `aria-*`; der Slider ist eine Drag-Fläche, Zahlenfelder sind `<input>` | **NICHT** für eine Mensch-Oberfläche; Debug-Panel ja |
| 6 | **Tweakpane 4.0.5** | [github.com/tweakpane/tweakpane](https://github.com/tweakpane/tweakpane) | MIT | npm 4.0.5, 03.11.2024 | Gleiche Prüfung (`tweakpane.js`): **kein** `aria-*`, **kein** `role`; kein `input type=range` im Bundle | **NICHT** (gleicher Grund) |
| 7 | **CSS `:has()`** | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) | Spec-Primitive | Baseline „**widely available** … since December 2023" | Bindet **Zustand** an Styling (`:has(:checked)`), nicht **Zahlen**. Für 5 diskrete Stufen pro Achse reicht es ohne JS; für einen stufenlosen Slider nicht | **TEILWEISE** |
| 8 | **WAI-ARIA APG Slider Pattern** | [w3.org/WAI/ARIA/apg/patterns/slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | W3C (permissive license laut Seitenfuß) | APG, laufend gepflegt | Maßstab: `role=slider`, `aria-valuenow/-valuemin/-valuemax`, `aria-valuetext` wenn die Zahl nicht sprechbar ist, `aria-orientation`; Tasten Right/Up/Left/Down/Home/End. Warnung der Seite: Touch-AT synthetisiert ggf. keine Key-Events → „should fully test … before considering incorporation into production systems" | **DECKT** (Referenz, keine Lib) |

**Befund zu d):** Zwei-Wege-Bindung ist gelöst — `value` + `oninput`/
`onValueChange`, gesteuert, eine Wahrheit. Die beiden „Designer-GUI"-Bibliotheken
(Leva, Tweakpane) sind bewusst nicht barrierefrei und damit für eine Oberfläche,
die der Mensch bedient, die falsche Kategorie.

---

## Eigenbau nach dem besten Stack

**Zählbasis (für die Zeilen, ausdrücklich keine Empfehlung):** DTCG-JSON als
Datendatei · CSS-Variablen (`:root`/`@theme`) · `oklch()` + `color-mix()` +
`light-dark()` im CSS · nativer `input[type=range]` oder Radix/Zag ·
`colorjs.io` als Test-Gate.

| Baustein | Trägt Upstream | Zeilen (Schätzung) | Begründung der Zahl |
|---|---|---|---|
| Token-Datei (DTCG-JSON) | DTCG-Format, Style Dictionary (optional) | **25–40 Zeilen JSON** — Daten, kein Code | 5 Parameter × 2–3 Stufen × `$type`/`$value`; DTCG-Beispiele im Spec sind 8–20 Zeilen pro Gruppe |
| Parameter → CSS-Variablen (Hue-Bereich, Chroma-Deckel, Name→Variable) | `oklch()`/`color-mix()`, `@property` | **12–18** | eine Zuordnungstabelle + ein Setter; die Farbrechnung selbst ist CSS, nicht Code |
| Slider-UI + A11y | nativ oder Radix/Zag | **0 (nativ) / 10–15 (Radix)** | nativ: Markup + `oninput`. Radix: Import, `value`/`onValueChange`-Verdrahtung, Styles |
| Hell/Dunkel | `light-dark()` | **0** | ein Funktionsaufruf pro Token statt zweitem Token-Satz |
| Kontrast-Gate (Test) | colorjs.io (WCAG **und** APCA) | **20–30** | Paarliste + `contrastWCAG21()` je Paar + `expect(ratio).toBeGreaterThanOrEqual(4.5)`; die Formel, die Konvertierung und das Gamut-Mapping sind Bibliothek |
| Kontrast-Gate (nur bei Erzeugung) | Leonardo oder APCACH | **0** | Kontrast ist Eingabe der Erzeugung, nicht Prüfobjekt — Preis: Farbe folgt dem Modell der Bibliothek (Leonardo: WCAG-Ziel, kein OKLCH-Ausgabeformat; APCACH: nur APCA) |
| Persistenz / Kanal zum Agenten | existiert bereits für T5 (State-Sync) | **10–20**, nicht Token-Problem | dieselbe Größenordnung wie jeder andere UI-Zustand; hier nicht mitgezählt |

**Summe gegen die Vorprüfung:**

| | Vorprüfung | Mit Upstream | Delta |
|---|---|---|---|
| Token-Vertrag | 40–60 | **12–18** (+ 25–40 Zeilen Datendatei) | **−55 … −80 %** Code |
| Kontrast-Validierung | 60–100 | **20–30** (Prüfung) / **0** (Erzeugung) | **−50 … −80 %** / −100 % |
| Gesamt (Code, ohne Persistenz) | **100–160** | **32–48** | **−52 … −80 %** |

Die Vorprüfung war also nicht falsch, sondern **doppelt so hoch wie nötig**:
beide Blöcke sind zur Hälfte oder mehr Upstream. Was übrig bleibt, ist die
Zuordnung „Reglerstellung → Variable" und ein Test, der eine Bibliotheksfunktion
aufruft.

Ehrliche Gegenrechnung: der Stack kostet **Abhängigkeiten und Bytes** —
`colorjs.io` 32,4 kB gzip (tree-shakable), `@adobe/leonardo-contrast-colors`
23,6 kB gzip mit 5 Deps, ein Radix-Primitive 9,08 kB laut Doku. Deshalb steht in
der Tabelle „0 Zeilen" nicht automatisch für „billiger".

---

## Was am Token-Vertrag unvermeidlich Eigenbau bleibt

1. **Die Bedeutung der Achse.** Welcher Hue-Bereich „warmhearted/wooden/gentle"
   ist und welcher „techy/blueish" — 0 Upstream. Kein Token-Standard und keine
   Bibliothek kennt diese Adjektive (DTCG hat `$description`, keine Semantik).
2. **Die 5 Parameter und ihre Reihenfolge.** Weder DTCG noch Tailwind noch
   Open Props haben ein Konzept „Parameter, den ein Mensch einstellt".
3. **Die Sichtbarkeitsregel „3 sichtbar, 2 nach".** Kein Upstream gefunden; für
   den Aufklapp-Teil existiert mit `<details>` nur ein generisches Element
   (nicht geprüft, siehe Belegstand).
4. **Autorität.** „Der Mensch schreibt, der Agent liest" ist eine
   Berechtigungsfrage. Sie steht in keinem der geprüften Formate — DTCG kennt
   keine Schreiber.
5. **Die Paarliste für den Kontrast-Gate.** Welche Variable auf welcher liegt,
   in welcher Schriftgröße, mit welchem Zielwert — das ist Produktentscheidung.
   WCAG liefert die Schwelle, nicht die Zuordnung.
6. **Das Verhalten bei Verletzung.** Blocken, Chroma senken, Lightness
   nachziehen oderSliderbereich begrenzen: WCAG sagt nichts dazu, die
   Bibliotheken auch nicht.
7. **Der Chroma-Deckel pro Hue**, wenn du im sRGB-Gamut bleiben willst
   (Messung: 0,121–0,314 bei L 0,70). `maxChroma()` gibt es nur in APCACH,
   `oklch()` in CSS clippt/gamut-mappt still.

Das ist der ehrliche Rest: **Regeln und Bedeutungen, kein Rechenwerk.**

---

## Belegstand

**Mehrfach geprüft (Spezifikation +zweite Quelle oder eigene Messung):**

- WCAG-Schwelle 4,5:1 / 3:1 und die Formel `(L1+0,05)/(L2+0,05)`: WCAG 2.2
  (REC 12.12.2024) gelesen, zusätzlich gegen `colorjs.io` nachgerechnet
  (schwarz/weiß = 21; ein OKLCH-Paar 3,98 in beiden Wegen).
- DTCG-Status: TR-Seite 2025.10 („Final Community Group Report", „not a W3C
  Standard") **und** Preview-Draft-Seite 2025.10 mit Warnung.
- OKLCH-Lichtheit vs. HSL: CSS Color 4 § 9.2 (Text + eigenes Zitat) **und**
  eigene Messung (HSL 2,25× vs. OKLCH +0,2 %).
- `colorjs.io` kann WCAG **und** APCA: Doku-Seite gelesen, APCA-Version
  (0.0.98G-4g) dort benannt, `contrastWCAG21` am Objekt verifiziert.
- Radix **und** Zag halten das APG-Slider-Pattern ein: beide Doku-Seiten mit
  identischem Satz, APG-Seite als Maßstab.
- Nativer Slider = `slider role`: HTML-AAM § 3.5.71 (normativ) + MDN-Baseline.
- `light-dark()`, `color-mix()`, `:has()`, `@property`: je MDN-Seite mit
  Baseline-Angabe; `color-mix`-Default `oklab` und `oklch` shorter-hue dort
  explizit.
- Leva/Tweakpane ohne ARIA: **eigene Bundle-Prüfung** der veröffentlichten
  Pakete (`npm pack`, `grep`), nicht nur Doku.
- Lizenzen und Reifegrade: GitHub-API (`license.spdx_id`, Stars, `pushed_at`)
  plus npm-Registry (`version`, `time`, `license`) am 19.11.2026.

**Nur eine Quelle (Vorsicht bei Zitaten):**

- APCA-Lizenz: `LICENSE.md` im Repo + npm-Feld „Limited W3 License" —
  keine Rechtsprüfung, keine Rücksprache mit dem Autor.
- Leonardo-Ausgabeformate (kein OKLCH): nur README-Liste, nicht im Code geprüft.
- Open-Props-Palette: nur Quelltext `props.palette.css`, keine Doku-Aussage zu
  Kontrastverhalten.
- APCACH-Verhalten („always returns a result"): nur README.
- incluud/color-contrast-checker: nur README, nicht ausgeführt.

**Nicht belegbar / offen (nicht in die Tabellen aufgenommen):**

- Ob das DTCG-Format `oklch` als `colorSpace` zulässt: der abgerufene Spec-Text
  enthält **kein** „oklch" (0 Treffer) und definiert die Farbraumliste im
  extrahierten Text nicht. Offen, nicht „nein".
- Ob Radix/Zag im gebauten Bundle tatsächlich `role="slider"` setzen: nur
  Doku-Claim, nicht selbst geprüft (im Gegensatz zu Leva/Tweakpane).
- Ob Browser das CSS-Gamut-Mapping (§ 14.2) exakt spec-konform umsetzen:
  Spec gelesen, kein Browsertest.
- `<details>` als Aufklapp-Mechanismus für „2 more": nicht geprüft.
- Tailwind v4 + DTCG in der Praxis (Doppelpflege zweier Token-Quellen): keine
  Quelle gefunden.
- Ob ein Token-Linter mit DTCG-Bewusstsein + Kontrastregel existiert: die
  GitHub-Suche (`design tokens contrast`, `wcag contrast cli`, `apca contrast`,
  sortiert nach Stars, 19.11.2026) lieferte nur Apps und kleine Einzelprojekte
  (≤ 27 ★) — **kein belastbarer Kandidat**, deshalb keine Zeile in Tabelle b).
