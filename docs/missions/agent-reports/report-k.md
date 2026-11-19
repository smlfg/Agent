I'll read the three specified files, then write the CSS.
DONE — nur `src/styles/presence-edges.css` geschrieben (138 Zeilen), `node --test` 50/50 grün, CSS-Klammern balanciert.

1. Lider (`.eyelid-top/-bottom`): horizontale `mask-image`-Fade (0→9 %→91 %→transparent), die 130-%-Überstände laufen seitlich aus; Deckfläche über dem Auge bleibt zu 100 % deckend (Fade endet bei −3 % Augenbreite), also Blinzeln/dormant weiter voll abgedeckt.
2. Unterlid: zusätzlich vertikaler Fade ab 52 % Lidhöhe — beginnt auch bei `translateY(-30 %)` erst unterhalb des Auges, Lidlinie bleibt scharf.
3. `.eye-cap-top`: Rechteck an allen vier Kanten aufgelöst (`mask-composite: intersect` aus Horizontal- + Vertikal-Gradient), unten sanft in den Augapfel auslaufend; Mobile 375 px mit früherem Seiten-Fade.
4. `.eye-white`: 30-px-`--border-strong`-Halo ersetzt durch zwei enge warme Schatten (rgba 74,63,53) plus elliptische Randmaske (62 %/60 %, deckend bis 78 %), Rand geht weich in den Verlauf über.
5. Farben/Iris/Hauttöne nicht angefasst, nur `-webkit-`- und Standard-Masken sowie Schattenränder; `scripts/validate.sh` scheitert unverändert nur am fehlenden Git-Repo (`git ls-files`), nicht am CSS.
