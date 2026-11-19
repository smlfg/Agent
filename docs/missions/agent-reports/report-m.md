## Kandidatenliste (Upstream-Suche)

| Ansatz | Quelle | Lizenz | Urteil |
|---|---|---|---|
| anime.js `splitText` + `stagger` | https://github.com/juliangarnier/anime | MIT | Gute Wirkung/Steuerung, aber 24,5 KB Bibliothek und npm/Build unzulässig → nicht übernommen, Muster selbst nachgebaut |
| Codrops – SVG `feTurbulence`/`feDisplacementMap` | https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence | MIT (Codrops-Demos) | Sehr rauchig, aber Filter rerastert die ganze Ebene je Frame → 60-fps-Risiko mobil, verworfen |
| MDN `feTurbulence`-Beispiel | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence | Code-Samples CC0 | Technische Referenz, gleicher Performance-Einwand; kein Code kopiert |
| CodeFronts – „Smoke / Dissolve Particle Effect" | https://codefronts.com/motion/css-text-hover-effects/smoke-dissolve-particle-effect/ | MIT (angegeben) | Trifft die Metapher exakt (pro Letter blur/drift, 35 ms Stagger); als Inspiration adaptiert, Hover-Umkehrlogik passt nicht zum Ausblenden |
| Codrops – ParticleEffectsButtons | https://github.com/codrops/ParticleEffectsButtons | Eigene Lizenz (keine freie Redistribution) | Ausgeschlossen (nicht MIT/Apache/BSD/CC0) |
| GSAP SplitText | https://gsap.com/docs/v3/Plugins/SplitText/ | GSAP-Standardlizenz, nicht MIT | Ausgeschlossen (Lizenzvorgabe) |
| text-fx.app – Particle Dissolve | https://text-fx.app/effects/particle-dissolve | keine Lizenz angegeben | Ausgeschlossen (unklar) |
| glyphdust | https://github.com/linno-inc/glyphdust | MIT | React + three.js/WebGL, zu groß und nicht DOM-Text → verworfen |
| confettiText | https://github.com/over-punch/confettiText | MIT | DOM-Letter-Physik, aber Konfetti statt Aufwärts-Auflösen → verworfen |
| particle-text | https://github.com/aayusharyan/particle-text | MIT | Canvas-Partikel; Text nicht mehr selektierbar/Screenreader-Problem → verworfen |

## Entscheidung

Per-Glyph-Stagger mit Aufwärtsdrift, kurzem Blur und Fade – „Schall und Rauch" ohne SVG-Turbulenz. Grund: nur `transform`/`opacity`/kurzer `filter` auf kleinen Spans, deterministisches Rauschen für ungleichmäßiges Aufsteigen, Wort-/Block-Fallback bei langen Antworten (Node-Zahl bleibt begrenzt). `feTurbulence` verworfen, weil es die gesamte scheidende Ebene pro Frame neu rastert. Kein Fremdcode übernommen, daher kein Vendor-Ordner und kein Eintrag in `THIRD_PARTY_NOTICES.md`.

## Geänderte Dateien

- `src/conversation/dissolve.js` (neu): `dissolve(entry, { reducedMotion }) → Promise<void>`, reine Helfer `splitGraphemen`, `tokenizeDissolveText`, `countGlyphs`, `countWords`, `planDissolve`, `createDissolveGroup`; `aria-hidden="true"`, ausschließlich `textContent`, Supersede-Gruppe gegen Stapel/Leaks, Dauer 780–1300 ms (Block 900 ms).
- `src/styles/dissolve.css`: überschreibt mit `.pair .pair-entry.is-dissolving` (absolute, kein Flow-Einfluss auf das neue Paar), Wort-/Glyph-Geometrie, Reduced-Motion-Guard; `.pair-entry.is-leaving` in `conversation.css` unangetastet.
- `src/conversation/conversation.js`: nur Import `dissolve` und `dismissEntry` ersetzt.
- `tests/dissolve.test.js` (neu): Graphem-/Token-Zerlegung, Markup bleibt Text, Reduced-Motion-Plan, 700–1400-ms-Grenzen, Granularitäts-Fallback, Nicht-Stapeln ohne DOM.

## Verifikation

- `node --check` für alle drei geänderten/neuen JS-Dateien: ok.
- `node --test tests/*.test.js`: **61 pass, 0 fail**.
- Zusätzlicher Laufzeit-Smoke mit DOM-Stubs: animierter Pfad, `reducedMotion` (synchron entfernt) und Supersede alter Dissolves ok.
- `bash scripts/validate.sh`: Die zwei ersten Stufen ok; `scripts/check-names.sh` bricht ab, weil dieser Scratchpad kein Git-Repository ist (`git ls-files` → 128). Umgebungsblocker, nicht Code.

DONE
