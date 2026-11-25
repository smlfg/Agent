WARM: Creme-/Holz-/Bernstein-Verlauf, dunkelbraune Serifenschrift, größere Zeilenhöhe, weitere Zeilen, warme Lidhaut und bernsteinfarbene Iris.
COLD: Grau-Blau-/Stahl-Verlauf, fast schwarze Grotesk, engere Laufweite, schmalere Zeilen, kühle Lidhaut und blau entsättigte Iris.
NERVOUS: Fläche und Augen zittern in 0,3–1 px, der Text nur in Sprechpausen, Abstände und Schrift werden enger, Tippen/Blinzeln/Sakkaden schneller.
CALM: Mehr Luft zwischen Augen und Text, breitere Zeilen, langsamere Atmung, ruhigere Augenintervalle, weichere Übergänge.
Warm/kalt laufen über die ganze Seite: Hintergrund, Text, Akzent, Linien, Schatten, Composer, Motion-Chip und Augen-Umgebung.
Die Iris kippt per CSS-Filter von Amber zu Slate-Blau; Schriften wechseln bei deutlicher Temperatur zwischen Serif und Grotesk.
Turn-Ende bleibt der einzige Schreibzeitpunkt; Farben/Abstände faden 2 s, reduced-motion springt ohne Transition, Kontrast bleibt ≥ 4.5:1 (schlechtester Fall 4.80).
Vorschau: `?mood=warm|cold|nervous|calm` oder `?params=warmth:0.9,calm:0.2`; `node --check` und alle 142 Tests grün.
