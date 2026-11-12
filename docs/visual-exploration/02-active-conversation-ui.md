# Active Conversation UI — Visual Exploration

> Branch: `visual-exploration-2026-11-13`  
> Focus: reines visuelles & motion-design für den Zustand nach Intent-Start. Keine Implementierung, kein Backend.

---

## 1. Gesamtkomposition

Der Bildschirm ist vertikal in drei Zonen geteilt, aber nicht streng abgegrenzt — eher wie ein lebendiges Feld, in dem alles atmet.

```
┌─────────────────────────────┐
│                             │
│        [AUGEN]              │  ← obere 40 %
│     (mittig, groß)          │
│                             │
├─────────────────────────────┤
│  warm↔cold  soft↔sharp      │  ← mittlere 15 %
│  still↔alive                │
├─────────────────────────────┤
│                             │
│   „Hier entsteht die        │  ← untere 45 %
│    Antwort Wort für Wort“   │
│                             │
│   [  Textfeld        🎤 ]   │
│                             │
└─────────────────────────────┘
```

- **Augen sitzen in der oberen Bildschirmhälfte, exakt zentriert.** Sie sind das dominante Element. Alles andere gruppiert sich unterhalb, als würde der Agent auf dem Eingabefeld und der Antwort „sitzen“ und nach unten sprechen.
- **Sliders sind horizontal unter den Augen**, in einer leichten Reihe, nicht an einem Rand. Sie fühlen sich wie eine stille Bedienleiste an, keine technische Toolbar.
- **Antwort-Text liegt im unteren Drittel**, linksbündig, mit viel Luft drumherum. Er erscheint Wort für Wort und wirft einen leichten Schatten/Schimmer.
- **Eingabefeld am unteren Rand**, breit und niedrig, fast wie eine Linie, die man beschreibt. Mikrofon-Button rechts daneben, kreisrund, dezent.

Auf kleinen Bildschirmen (Handy) rücken die drei Zonen enger zusammen: Augen werden etwas kleiner, Slider werden vertikal gestapelt oder als horizontale Wischleiste, Eingabe bleibt unten fixiert.

---

## 2. Slider-Design

### 2.1 Grundaufbau

Drei Slider, nebeneinander, gleiche Breite. Jeder Slider ist ein **Ein-Wort-Paar**, keine Zahlen, keine Skala.

```
warm  ·············································  cold

soft  ·············································  sharp

still ·············································  alive
```

- **Links und rechts des Track steht je ein Wort**, klein, in der gleichen Handschrift-Variable-Font wie die Antwort.
- **Der Track selbst ist eine feine, leicht unregelmäßige Linie**, wie mit Fineliner gezogen — keine perfekte gerade CSS-Line.
- **Der Thumb ist ein kleiner weicher Kreis / Fleck**, kein geometrischer Rauten-Thumb. Beim Drüberfahren leicht größer, beim Ziehen pulsiert er dezent.

### 2.2 Thumb- und Active-States

| Zustand | Visuelles Verhalten |
|---|---|
| Ruhe | Thumb ist ein kleiner, matter Punkt in der aktuellen Farbe. |
| Hover / Touch | Thumb wächst sanft um ca. 25 %, bekommt einen weichen äußeren Schein (Glow), als würde er erwärmt. |
| Ziehen | Thumb pulsiert leicht im Takt von ~1,2 Hz; die Track-Linie leuchtet auf der aktiven Seite auf. |
| Loslassen | Thumb schnappt nicht hart, sondern gleitet in ~180 ms zur nächsten Position. |

### 2.3 Echtzeit-Visuelle Effekte

Jeder Slider steuert ein dominantes visuelles Feld. Die Änderung erfolgt **sofort während des Ziehens**, nicht erst beim Loslassen:

- **`warm ↔ cold`**: Hintergrundfarbe des gesamten UI gleitet in der Farbtemperatur. Warm = warmer Papier/Cremeton mit Holz- und Ocker-Touch, kühle Akzente werden gedämpft. Cold = helleres, bläulich-graues Licht, klare Schatten, Schrift kühler.
- **`soft ↔ sharp`**: Ecken, Linien und der Augenumriss werden weicher oder schärfer. Soft = alle Kanten leicht verwaschen, Schrift etwas rundender, Kritzelstriche dicker. Sharp = Linien feiner, Konturen klarer, Augen werden leicht spitzer.
- **`still ↔ alive`**: Bewegungsenergie des gesamten Bildschirms. Still = langsame Atmung, fast keine Mikrobewegung, Text erscheint ruhig. Alive = schnellere Pulsation der Augen, Textfluss lebendiger, Hintergrundtextur bewegt sich sanft wie im Wind.

Die Verbindung zwischen Slider und Hintergrund ist spürbar, aber nicht überwältigend — der Nutzer soll fühlen, dass er die Atmosphäre formt, nicht ein Equalizer-Plugin bedient.

---

## 3. Eingabefeld & Mikrofon

### 3.1 Eingabefeld

- **Form:** Eine lange, niedrige, abgerundete Linie — fast wie ein handschriftliches Eingabeband. Höhe ca. 56 px, sehr großzügige innere Seitenränder.
- **Rand:** Kein scharfer Rahmen, sondern eine 1,5 px dicke, leicht gezackte/unregelmäßige Linie in der aktuellen Akzentfarbe. Beim Fokus wird sie etwas dicker und leuchtet sanft auf.
- **Platzhaltertext:** „Schreib etwas …" oder „Sag, womit ich dir helfen kann." — in einer leicht ausgegrauten, handschriftlichen Kursiv.
- **Fokus-State:** Der untere Rand hebt sich auf; ein sehr weicher Schein breitet sich nach innen aus, als würde das Feld einatmen. Der Textcursor ist ein senkrechter Strich mit leichtem Blinken (nicht das störende System-Blinken).
- **Während des Tippens:** Die Augen blicken kurz auf das Feld herab (siehe Abschnitt 5).

### 3.2 Mikrofon-Button

- **Position:** Rechts am Eingabefeld, kreisrund, ca. 48 px Durchmesser.
- **Aussehen:** Ein weicher, matter Kreis mit einem schlichten Mikrofon-Symbol (Strichzeichnung, nicht gefülltes Icon). Kein harter Schatten.
- **Ruhe:** Fast transparent, nur ein Hauch von Hintergrundfarbe.
- **Hover / Touch:** Kreis füllt sich mit der aktuellen Akzentfarbe, Symbol wird sichtbarer.
- **Aufnahme (aktiv):** Kreis pulsiert sanft in Wellen nach außen, Farbe wird warmer/leuchtender. Ein kleiner roter oder warmer Punkt erscheint diskret oben rechts.
- **Verbotener Zustand:** Wenn Mikrofon deaktiviert ist, wird der Button nicht grau und tot, sondern nur leicht verschwommen — als wäre er eingeschlafen.

---

## 4. Typewriter-Antwort

### 4.1 Grundgefühl

Die Antwort erscheint nicht Buchstabe für Buchstabe wie ein Terminal, sondern **Wort für Wort**, als würde jemand gerade sprechen. Zwischen den Wörtern gibt es Mikropausen, die der menschlichen Atmung folgen.

### 4.2 Wortrhythmus

| Wortlänge | Erscheinungsgeschwindigkeit | Beschreibung |
|---|---|---|
| 1–3 Buchstaben (z. B. „Ja", „das", „ist") | Sehr schnell, ~80–120 ms | Kleine Wörter platzen kurz auf. |
| 4–7 Buchstaben (z. B. „Agent", „machen") | Mittel, ~150–220 ms | Normales Sprechtempo. |
| 8+ Buchstaben (z. B. „Agentfähigkeit", "Zusammenarbeit") | Langsamer, ~280–400 ms | Längere Wörter werden bewusst langsamer sichtbar, als würde der Agent sie artikulieren. |
| Satzzeichen | Kurze Pause danach (~120 ms) | Punkt/Komma erzeugen Atempause. |
| Neuer Satz | Etwas längere Pause (~250 ms) | Kleiner Rhythmuswechsel. |

### 4.3 Pulsierender Effekt

- Jedes neu erscheinende Wort hat beim Erscheinen eine **kurze, weiche Aufhellung / Skalierung**: es wird für ~120 ms leicht größer (1,03×) und heller, dann sinkt es in den normalen Ruhezustand zurück.
- Der **letzte Satz oder das aktuelle Wort pulsiert dezent weiter**, bis die nächste Einheit eintrifft — so entsteht ein lebendiger „Herzschlag" des Textes.
- Farbe und Stärke des Pulses hängen vom `still ↔ alive`-Slider ab: bei `still` fast unsichtbar, bei `alive` deutlich spürbar.

### 4.4 Fokus-Transition

- Sobald die erste Antwort anfängt, **gleitet der Blick der Augen sanft von der Eingabe zur Antwort** (nach unten).
- Die Antwort selbst **fährt leicht nach oben** in den Fokus, während das Eingabefeld und die Slider dezent zurücktreten (Leichtes Abdunkeln/Blur im Hintergrund, keine harte Verdunklung).
- Während der Antwort bleibt das Eingabefeld sichtbar, aber visuell zweitrangig.

### 4.5 Satz- und Absatzverhalten

- Abgeschlossene Sätze verblassen leicht in einen ruhigen Schwarzton.
- Der **aktuelle Satz** bleibt hell und lebendig.
- Längere Antworten werden nicht als Wand aus Text dargestellt: nach ca. 5–6 Zeilen beginnt der Text sanft nach oben zu scrollen, während die aktuelle Zeile im unteren Drittel bleibt.

---

## 5. Verhalten der Augen

Die Augen sind das emotionale Zentrum. Sie reagieren auf alles, was passiert, aber nie hysterisch.

### 5.1 Zustände

| Zustand | Augen-Verhalten |
|---|---|
| **Ruhe / Atmen** | Beide Augen führen eine sehr langsame, leichte Größen-Schwingung durch (Atmung, ca. 4–6 s Zyklus). Blick schweift sanft im Raum. Unregelmäßiges Blinzeln (alle 1,9–4,5 s). |
| **User tippt** | Augen blicken kurz nach unten auf das Eingabefeld, als würden sie lesen. Dann zurück zum Nutzer. Beim Tippen eines langen Satzes folgen sie dem Cursor leicht. |
| **Denken / Schwarm-Call** | Augen schauen kurz zur Seite (leicht nach oben außen), als würden sie nachdenken. Die Pupillen verkleinern sich minimal. Während des Wartens ein langsames, geduldiges Schaukeln. |
| **Antwort erscheint** | Augen gleiten zur Antwort (nach unten), fixieren den Text. Bei jedem neuen Wort macht der Blick eine winzige Sakkade, als würde der Agent selbst lesen. |
| **Sprechen (Voice)** | Augen bleiben auf dem Nutzer gerichtet (Mittelpunkt/Kamera), öffnen sich leicht, Mund gibt es nicht. Sanftes Mitwippen im Rhythmus der Sprache. |
| **Lesen / Scrollen** | Wenn der Nutzer im Verlauf scrollt, folgen die Augen kurz der Scrollrichtung, als würden sie mitlesen, kehren aber zum aktuellen Satz zurück, wenn die Antwort weiterläuft. |
| **Einschlafen (Inaktivität)** | Nach längerer Ruhe werden die Augenlider schwerer, Lider schließen sich langsam, Form löst sich zurück in das ursprüngliche Gekritzel auf. |

### 5.2 Blick-Glättung

Alle Augenbewegungen sind weich gelerpt. Kein hartes Springen. Bei Fokuswechsel (z. B. von Eingabefeld zu Antwort) dauert der Blickübergang ca. 400–700 ms, abhängig von der Entfernung.

### 5.3 Ausdrucksregel

Weniger ist mehr: Die Augen sollen menschliche Aufmerksamkeit andeuten, keine Cartoon-Emotionen spielen. Keine Tränen, keine Herzen, keine überraschten Sterne.

---

## 6. Scroll-Verlauf

### 6.1 Aktuelle Antwort im Fokus

- Die gerade entstehende Antwort ist immer das hellste und lebendigste Element.
- Ältere Antworten treten zurück: kleinerer Kontrast, leicht transparent, aber lesbar.

### 6.2 Übergang alter Antworten

- Wenn eine neue Antwort beginnt, **gleitet die alte Antwort nach oben aus dem Fokus** und verblasst in den Hintergrund.
- Ältere Nachrichten des Nutzers erscheinen als kleine, diskrete Blasen oder einfache Textzeilen am oberen Bildschirmrand, wenn man scrollt.
- Es gibt keine strengen Chat-Blasen — eher ein fließendes Band aus Gedanken, das nach oben wandert.

### 6.3 Scroll-Verhalten

- Der Nutzer kann jederzeit nach oben scrollen, um vorherige Antworten zu lesen.
- Währenddessen **pausiert der Typewriter-Effekt nicht**, aber die Augen folgen dem Scroll kurz mit und kehren dann zur aktuellen Antwort zurück.
- Neue Tokens während des Scrollens lösen eine dezent sichtbare Welle am unteren Rand aus (sanfter Glow), damit der Nutzer merkt, dass weitergeschrieben wird.

### 6.4 Visuelle Trennung

- Keine harten Trennlinien zwischen alt und neu.
- Stattdessen: leichte Farbverläufe oder Textur-Aufhellungen, die wie auf Papier gealtert wirken. Je älter ein Block, desto weiter im Hintergrund.

---

## 7. Drei konkrete Variationen

### Variation A — „Papier und Tusche"

- **Hintergrund:** Warmes, leicht gelbliches Papier mit subtiler Kritzel-Textur.
- **Augen:** Weiche, tuscheartige Umrisse, leicht verwaschen. Pupillen nicht perfekt rund.
- **Slider:** Handgezeichnete Striche, Thumb wie ein kleiner Tintenklecks.
- **Text:** Eine charakterstarke Serif-Variable-Font, leicht unregelmäßiges Lauf-/Schwellverhalten.
- **Stimmung:** Persönlich, warm, analog. Gut für `warm` + `soft`.

### Variation B — „Nebliges Interface"

- **Hintergrund:** Kühler, matter Grauton mit sanftem Nebel-Verlauf.
- **Augen:** Zwei leuchtende, aber weiche Formen wie Laternen im Nebel. Keine harten Kanten.
- **Slider:** Minimal, fast unsichtbare Tracks; Thumb leuchtet wie ein kleiner Lichtpunkt.
- **Text:** Grotesk-Variable-Font, sehr sauber, leichtes Glowing während des Erscheinens.
- **Stimmung:** Ruhig, fokussiert, techy. Gut für `cold` + `sharp`.

### Variation C — „Lebendige Skizze"

- **Hintergrund:** Weißer/heller Grund mit sich leicht bewegenden, kurzen Strichen (wie im Wind).
- **Augen:** Aus Kritzelstrichen geformt, die sich ständig minimal neu ordnen — lebendig, fast verspielt.
- **Slider:** Bunte, aber matte Akzente; Track ändert Farbe entlang der Achse (z. B. warm zu kalt).
- **Text:** Eine expressive, handschriftlich angehauchte Sans/Slab-Mischung mit starker Variation.
- **Stimmung:** Bewegt, experimentell, dynamisch. Gut für `alive` + `playful`.

---

## 8. Risiken & offene visuelle Fragen

| Risiko / Frage | Warum es wichtig ist |
|---|---|
| **Pulsierender Typewriter kann auf Dauer nerven** | Bei langen Antworten könnte das ständige Pulsieren ermüdend wirken. Brauchen wir eine Dämpfung nach den ersten Sätzen oder bei `still`-Slider? |
| **Augen als Ablenkung beim Lesen** | Wenn die Augen ständig mitlesen, könnten sie den Nutzer vom eigenen Lesefluss ablenken. Wie stark soll der Blick der Augen dem Text folgen? |
| **Slider-Effekte vs. Lesbarkeit** | Starke Farb-/Bewegungsänderungen im Hintergrund könnten den Text schwerer lesbar machen. Wo ist die Grenze zwischen atmosphärisch und ablenkend? |
| **Mobile Darstellung der drei Slider** | Drei horizontale Slider nebeneinander können auf schmalen Displays zu klein werden. Variante: vertikal gestapelte Regler oder ein kollabierbares „Atmosphere"-Panel? |
| **Einheitlicher Stil über Variationen** | Variation A/B/C dürfen nicht wie drei verschiedene Produkte wirken. Was ist das gemeinsame visuelle Rückgrat (Augen-Prinzip, Kritzel-Textur, Typografie-Familie)? |
| **Reduzierte Bewegung (prefers-reduced-motion)** | Für Nutzer mit Bewegungsempfindlichkeit muss alles flüssig auf statische Zustände herunterfallen. Wie sieht das Design ohne Pulsieren, Atmung und Scroll-Glow aus? |

---

## 9. Nächste Schritte (Design-Seite)

1. Samuel wählt eine der drei Variationen als Hauptrichtung oder markiert gewünschte Elemente aus A/B/C.
2. Statische Mockups / Moodboards für die gewählte Variante erstellen.
3. Bewegungsstudien für Augen-State-Machine und Typewriter-Rhythmus in einem isolierten Prototypen.
4. Barrierefreiheits-Check für `prefers-reduced-motion` und Kontrast festlegen.

---

*Dokument erstellt für die visuelle Exploration des Agentfähig-Active-Conversation-UI. Keine funktionale Spezifikation.*
