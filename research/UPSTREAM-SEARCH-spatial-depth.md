# UPSTREAM SEARCH & ARCHITEKTURMODELL — Räumliche Tiefe (2.5D Spatial Presence) & Metrik-Vernetzung für `agentfähig.de`

Stand: 20.11.2026 · Mission: `Agentfähig um zusätzliche interaktive Dimensionen erweitern und deren sichtbare Wirkung im bestehenden Living-Surface-Konzept prüfen (M-20261120T001455-ce62b600)` · Session: `S-20261120T002620-19aa2e34` · Vertrag: `03_HAI/docs/UPSTREAM_FIRST_GATE.md`  
Recherche-Team: Gemini 4 Argon (Orchestrator) + 3 DeepSeek-Subagenten (`opencode-go/deepseek-v4-pro` für Spatial-UI-/Creative-Tech-Referenzen & Open-Source-/Engineering-Optionen; `opencode-go/deepseek-v4.1-flash` für Code-Diagnose & 2.5D-Schichtenmodell gegen `src/`).

---

## A. EXECUTIVE SUMMARY

### 1. Was dem aktuellen Design fehlt (Code-Diagnose an `src/`)
Die Living Surface von `agentfähig.de` besitzt bereits ein starkes visuelles und kinetisches Fundament:
- das **180-Bone-CSS-Skelett** (`src/surface/surface-bones.js`, `src/styles/bones/*.css`),
- **8 kuratierte Welten** + Hochtemperatur-Mutator (`src/surface/surface-worlds.js`),
- den deterministischen **WCAG-AA-Kontrastwächter** (`ensureWcagContrast`),
- die kritisch gedämpfte **60fps-Kinematik-Engine** der Augen (`src/presence/eye-motion-engine.js`, `src/presence/presence.js`),
- sowie das **3-Schichten-Metriksystem** (`src/metrics/metrics-catalog.json`, `compute.js`, `engine.js`, `surface.js`) mit 109 Katalog-Metriken (60 lokal aktiv) und 12 normierten Oberflächen-Parametern (`--p-tempo` bis `--p-energy`).

Dass die Oberfläche trotz dieser Substanz noch **zu flach / zweidimensional** wirkt, hat **fünf präzise am Code belegbare Ursachen**:

1. **Alle Inhaltsebenen liegen auf `z-index: 1` und teilen sich dieselbe Trägheitszeit:**  
   In `src/styles/bones/bones-stage.css:21-27` sitzen `.surface-controls`, `.presence`, `.focus` und `.site-footer` alle auf `z-index: 1` und nutzen dieselbe Übergangsdauer (`--bone-transition-ms: 1100ms`, `src/surface/surface-bones.js:93`). Gleiche Ebene + gleiche Zeitskala = Wahrnehmung als eine einzige flache Karte.
2. **0 % Hintergrund-Parallaxe bei ±240 px Augenbewegung („Sticker-Effekt“):**  
   `src/presence/eye-motion-engine.js:87` bewegt das Augenpaar um bis zu `±240 px`, während das 4-Orb-Lichtfeld (`body::before`, `src/styles/bones/bones-light.css:42-69`) und die Horizont-/Sediment-Ebene (`.stage::before`, `src/styles/bones/bones-texture.css:16-37`) exakt `0 px` mitgehen. Ein Objekt, das sich vor einem völlig starren Hintergrund bewegt, wird optisch als flach aufgemalt gelesen.
3. **Schattenwurf ist von der Lichtquelle entkoppelt:**  
   Der primäre Licht-Orb (`orbA`) steht oben links (`orbAX: 22%`, `orbAY: 18%`, `src/surface/surface-bones.js:46-47`), aber der Augenschatten fällt in `src/styles/presence.css:96-98` und `surface-bones.js:132` (`eyeShadowX: 0`) hart senkrecht nach unten (`0px 14px 28px`). Zudem fehlt eine Ebene `Z = -1` (Ambient Socket / Lichtmulde auf der Trägerfläche).
4. **Statische Hornhaut-Reflexe ohne Corneal Counter-Parallax:**  
   Catchlights (`.eye-catchlight--main`, `.eye-catchlight--window`) und Corneal Sheen sitzen auf festen Prozentkoordinaten (`src/styles/presence.css:398-427`). Es fehlt die minimale **gegenläufige Mikro-Parallaxe (`1–2.5 px`)** zwischen der vertieften Iris/Pupille und der nach außen gewölbten Hornhaut-Kuppel.
5. **`.stage { filter: saturate(...) contrast(...) }` flacht den Raum ab — und `--p-depth` läuft ins Leere:**  
   Der CSS-Filter auf `.stage` (`src/styles/bones/bones-texture.css:12`) zwingt den Browser, alle Kind-Ebenen in eine gemeinsame flache Bitmap zu rastern. Gleichzeitig schreibt `src/metrics/surface.js:525` nach jedem Turn `--p-depth`, `--p-closeness`, `--p-openness`, `--p-attention` in das DOM — **aber keine einzige CSS-Regel oder Bone-Projektion liest diese Werte bisher für räumliche Tiefe aus**.

### 2. Welche räumlichen Qualitäten sinnvoll sind
Gesucht ist **keine 3D-Welt mit Kameraflug**, sondern ein **beleuchtetes, geschichtetes 2.5D-Bas-Relief**:
- **Atmosphärische Schichtung (Aerial Perspective):** Tiefer Licht- und Materialraum (`Z = -3 / -2`), greifbarer Mittelgrund mit Lichtmulde und dreischichtigem Augenkörper (`Z = -1 / 0`) und klarer, hochlesbarer Vordergrund (`Z = +1 / +2`).
- **Einheitliche Lichtlogik („One Light Truth“):** Die 4 Licht-Orbs (`orbA..D`) bestimmen berechenbar den Winkel von Kontaktschatten, Umgebungs-Halo und Hornhaut-Glanz.
- **Konvexes Augenvolumen:** Gegenläufige Mikro-Parallaxe zwischen tiefer Pupille/Iris und äußerem Hornhaut-Catchlight.
- **Gesprächs- und Metrik-gekoppelte Raumtiefe:** Der Raum atmet sowohl sofort mit der Gesprächsphase (`dormant`, `listening`, `thinking`, `speaking`) als auch kontinuierlich über die Turns hinweg durch die 12 Metrik-Parameter (`depth`, `closeness`, `openness`, `attention`, `calm`, `energy`, `warmth`, `formality`).

### 3. Die drei vielversprechendsten Richtungen
1. **Richtung 1 — Gekoppeltes Licht- & Schattensystem:**  
   Ableitung eines globalen Lichtvektors (`--depth-light-x`, `--depth-light-y`) aus `orbAX/orbAY` + Trennung in scharfen **Kontaktschatten** (Verankerung) und weichen, farbgetönten **Ambient-Shadow/Light-Spill** (Schwebehöhe).
2. **Richtung 2 — 7-Ebenen-Mikro-Parallaxe & Corneal Depth (CSS + vorhandener 60fps-Loop):**  
   Projektion der bereits laufenden, gedämpften Vektoren aus `eye-motion-engine.js` auf gestaffelte Z-Ebenen (`-3 px` Gegenlauf im Lichtfeld, `-1.8 px` Gegenlauf am Hornhaut-Catchlight, `+3 bis +8 px` auf der Fokus-Ebene). Reine GPU-Compositor-Kosten (`translate3d`), null externe Bibliotheken.
3. **Richtung 3 — Vernetzung von Raumtiefe mit Gesprächsphasen & den 12 Metrik-Parametern:**  
   Sofortige Kopplung der 12 Parameter aus `src/metrics/surface.js` (`deriveSurface`) und `src/surface/surface-projector.js` an 8 normierte Spatial-Depth-Dimensionen (`--depth-*`), sodass sich der Raum aus dem Gespräch heraus organisch vertieft, öffnet, nähert oder fokussiert.

---

## B. CONCEPTUAL FRAMEWORK (Denkmodell & Kriterien C1 / C2)

### 1. Abgrenzung der zusätzlichen räumlichen Dimensionen von bestehenden Systemen (Kriterium C1)

In `agentfähig.de` existieren heute drei Parameterebenen. Das neue **Spatial-Depth-Modell** fügt keinen vierten UI-Slider und keine konkurrierende State-Engine hinzu, sondern bildet die **räumliche Projektionsschicht (Z-Achse)** zwischen ihnen:

| Systemebene | Datei / Ort | Was sie bisher steuert (2D / Zeit / Stil) | Was ihr bisher fehlte (und durch Spatial Depth ergänzt wird) |
| :--- | :--- | :--- | :--- |
| **1. `SurfaceState` (4 Dimensionen, 22 Felder)** | `src/surface/surface-state.js` | `embodiment` (2D-X/Y, Abstand, Größe, Form), `motion` (Energie, Tempo, Dämpfung), `atmosphere` (Farben, Kontrast, Intensität), `communication` (Schriftgröße, Dichte, Länge, Ton). | Kennt nur X/Y-Verschiebung und 2D-Skalierung (`eyeScale`), aber **keine Z-Staffelung, keine Licht-Schatten-Kopplung und keine Hornhaut-Wölbung**. |
| **2. `Metrik-Engine` (109 Metriken → 12 Parameter → 3 Achsen)** | `src/metrics/metrics-catalog.json`, `engine.js`, `surface.js` | 12 Parameter (`tempo`, `density`, `warmth`, `calm`, `closeness`, `openness`, `attention`, `certainty`, `playfulness`, `formality`, `depth`, `energy`) → 3 Achsen (`temperature`, `nervousness`, `compactness`). | `depth`, `closeness`, `openness` und `attention` veränderten bisher nur Zeilenabstand (`lineHeight`), Spaltenbreite (`measureRem`) und Sakkaden-Radius, **erzeugten aber keinerlei räumliche Z-Tiefe**. |
| **3. `180-Bone-Skelett` (7 Familien)** | `src/surface/surface-bones.js`, `src/styles/bones/*.css` | `light` (36), `texture` (14), `stage` (16), `eyes` (48), `typography` (28), `controls` (24), `motion` (14). | Alle 180 Bones renderten koplanar ohne Parallax-Faktoren (`k_z`), ohne Phasen-Staffelung und mit statischem `eyeShadowX: 0`. |
| **4. NEU: `Spatial Depth Layer` (7 Z-Ebenen, 8 Tiefen-Dimensionen)** | `deriveSpatialDepth()` (`src/metrics/surface.js` ↔ `src/surface/surface-projector.js` ↔ `bones-depth.css`) | **Neu & klar abgegrenzt:** Steuert ausschließlich die **Z-Achse und Licht-Raum-Kopplung** (`--depth-*` + `--scene-px/py`) über die 7 bestehenden DOM-Schichten. | Macht die vorhandenen 12 Metrik-Parameter und 180 Bones erstmals als dreidimensionales 2.5D-Relief erlebbar. |

---

### 2. Die 7 räumlichen Z-Ebenen (`Z = -3` bis `Z = +3`)

Keine neuen DOM-Container — jede Z-Ebene adressiert ein bereits vorhandenes Element in `src/living-surface.html`:

| Z-Ebene | Name | Bestehendes DOM-/CSS-Element | Räumliche Funktion | Parallax-Koeffizient `k_z` | Trägheits- / Transition-Zeit |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **`Z = -3`** | **Deep Light Field** | `body::before` (4 Licht-Orbs `orbA..D`, `bones-light.css:42`) | Tiefe, diffus leuchtende Lichtkammer hinter der Trägerfläche; `orbA` definiert die Hauptlichtquelle. | **`-0.32`** (sanft gegenläufig, max. `±4 px`) | `1200–1400 ms` (plus `14–19 s` Atemzyklus) |
| **`Z = -2`** | **Material, Sediment & Horizont** | `html::before` (Vignette), `.stage::before` (Sediment & Horizontlinie, `bones-texture.css:16`), `body::after` (Grain) | Physische Trägerfläche (Papier / Ton / Kalkstein / Lapis) mit seitlich weich ausblendender Turrell-Horizontschwelle. | **`-0.12`** (max. `±1.5 px`) | `850 ms` |
| **`Z = -1`** | **Ambient Socket & Light Pool** | Äußerer Halo + gerichteter Umgebungs-Schatten-Pool unter `.presence` und Fokus-Lichtinsel unter `#focus` | Verbindet schwebende Objekte mit dem Untergrund (Schattenfänger & Bodenreflexion). | **`+0.35`** (folgt den Augen gedämpft auf der Bodenfläche) | `560 ms` |
| **`Z = 0`** | **Ocular Body** (3 Sub-Schichten) | `.presence .eye`:<br>• `0.0`: `.eye-white` + `.eye-veins`<br>• `-0.1` (konkav): `.pupil` (`.iris-fibers`, `.pupil-core`)<br>• `+0.2` (konvex): `.eye-catchlight`, `.eye-wetline`, `.eyelid-*` | Das plastische Präsenz-Zentrum: Lider werfen Kontaktschatten auf die Sklera; Iris liegt vertieft; Catchlight sitzt auf der gewölbten Hornhaut. | **`+0.75`** (Augapfel)<br>**`+1.06`** (Pupil-Core)<br>**`-0.18`** relativ zur Pupille (Catchlight-Gegenlauf) | `60fps` kritisch gedämpft (`eye-motion-engine.js`) |
| **`Z = +1`** | **Conversation Focus Plane** | `#focus` / `#pair` (`.pair-prompt` auf `+0.8`, `.pair-answer` + `.tw-caret` auf `+1.1`) | Dialog-Bühne: Die aktive Antwort tritt kontrastreich und beleuchtet nach vorn; der Prompt liegt leicht dahinter. | **`+1.15`** (max. `±5 px` Desktop, `0 px` Mobile) | `320 ms` |
| **`Z = +2`** | **Foreground Controls & Composer** | `#composer` & `#surface-controls` (Horological Watch Dials) | Greifbare Interaktionsschwelle im Vordergrund mit sanfter Okklusions-Schleppe (`--surface-veil-38/96`). | **`+1.35`** (bzw. vertikale Gravitation `±4 px`) | `220 ms` (`0 ms` beim Dial-Scrubbing) |
| **`Z = +3`** | **Micro-Overlays & Rahmen** | `#motion-toggle`, `#dev-badge`, `.skip-link` | Kamerafester Sicherheits- und Barrierefreiheits-Rahmen. | **`0.00`** (viewport-fixiert) | `180 ms` |

---

### 3. Die 8 zusätzlichen Spatial-Depth-Dimensionen: UI-Wirkung & HAI-Interaktionswirkung (Kriterium C2)

Jede der 8 räumlichen Dimensionen koppelt eine **sichtbare 2.5D-UI-Wirkung** mit einer **kommunikativen HAI-Interaktionswirkung**:

| # | Dimension & CSS-Variable | Wertebereich (Neutral) | Sichtbare UI-Wirkung (Visuell / Räumlich) | HAI-Interaktionswirkung (Verkörperung & Gespräch) |
| :--- | :--- | :---: | :--- | :--- |
| **1** | **`depthIntensity`**<br>`--depth-intensity` | `0.00 – 1.00`<br>(`0.50`) | Master-Amplitude der Z-Staffelung: skaliert den Abstand zwischen Hintergrund-Lichtfeld (`Z = -3`), Augen (`Z = 0`) und Textbühne (`Z = +1`). | Verkörpert die **gedankliche Tiefe** des Gesprächs: oberflächlicher Smalltalk bleibt ein ruhiges, flaches Papierblatt; komplexe Reflexion öffnet einen tiefen Resonanzraum. |
| **2** | **`parallaxGain`**<br>`--depth-parallax` | `0.00 – 1.40`<br>(`0.85`) | Stärke der gegenläufigen Mikro-Parallaxe zwischen Lichtfeld (`-4 px`), Horizont (`-1.5 px`), Augen und Fokus (`+5 px`). Bei `reducedMotion` hart `0`. | Verkörpert **wache räumliche Präsenz & Mitgehen**: Der Agent beobachtet nicht nur mit den Pupillen, sondern der gesamte Raum reagiert subtil auf die Aufmerksamkeit des Besuchers. |
| **3** | **`cornealDepth`**<br>`--depth-cornea` | `0.00 – 1.00`<br>(`0.65`) | Gegenläufiger Versatz (`-0.18×`) zwischen tiefer Iris/Pupille und dem Glanzpunkt auf der Hornhaut-Kuppel + Schärfe des oberen Lid-Kontaktschattens. | Verkörpert **unmittelbare persönliche Zuwendung (`closeness` & `attention`)**: Je höher `cornealDepth`, desto lebendiger, plastischer und nahbarer wirkt der Blickkontakt. |
| **4** | **`lightDirectionCoupling`**<br>`--depth-light-x`<br>`--depth-light-y` | `-1.00 – +1.00`<br>(aus `orbAX/Y`) | Koppelt den Schattenwurf der Augen (`--eye-shadow-x/y`) und den Specular-Glanzwinkel mathematisch an die Position des Hauptlicht-Orbs (`orbA`). | Verkörpert **stimmige physische Verankerung**: Wenn sich die Stimmung oder Welt wandelt (z. B. warmes Atelierlicht vs. kühles Nachtobservatorium), wandert das Licht glaubwürdig durch den Raum. |
| **5** | **`shadowElevation`**<br>`--depth-shadow-length`<br>`--depth-contact-alpha` | `8px – 34px`<br>(`14px` / `0.28`) | Verhältnis zwischen kurzem, scharfem **Kontaktschatten** (nah am Untergrund) und langem, weichem **Umgebungsschatten** (hoch schwebend). | Verkörpert **Nähe vs. innere Distanz**: Beim aktiven Zuhören/Sprechen sitzt die Präsenz nah und geerdet (`9–10px`); beim Nachdenken (`thinking`) oder Rückzug schwebt sie weiter entfernt (`22–26px`). |
| **6** | **`atmosphericHaze`**<br>`--depth-haze` | `0.00 – 1.00`<br>(`0.35`) | Luftperspektive auf `Z = -3 / -2`: dämpft Hintergrundkontraste und blendet Horizont- sowie Sedimentkanten weich in den Dunst ein. | Verkörpert **Offenheit vs. analytische Schärfe**: Hoher Haze bei explorativen, suchenden oder ruhigen Gesprächen (`openness`, `calm`); klarer, dunstfreier Raum bei präzisen, direkten Faktenfragen (`certainty`, `formality`). |
| **7** | **`focalSeparation`**<br>`--depth-focal-contrast` | `0.00 – 1.00`<br>(`0.50`) | Luminanz- und Kontrastspreizung zwischen der aktuellen Antwort (`Z = +1`) und den peripheren Ebenen (Prompt, Horizont, Chrome). | Verkörpert **Fokus-Führung & Cognitive-Load-Schutz**: Bei hoher Informationsdichte (`density`) und hoher Konzentration (`attention`) hebt sich die Antwort wie auf einer beleuchteten Lesebühne vom Rest ab. |
| **8** | **`visualGravity`**<br>`--depth-gravity` | `-1.00 – +1.00`<br>(`0.00`) | Vertikaler Raumzug (`±6 px`): negativ hebt die Fokus- und Präsenzebene leicht zum Betrachter an; positiv lässt sie schwerer nach unten/innen ruhen. | Verkörpert **Initiative & Gesprächsenergie**: Aktive, lebendige Dialoge (`energy`, `tempo`, `speaking`) heben die Bühne leicht an; Ruhe, Müdigkeit oder Nachdenken (`dormant`, `thinking`, `calm`) erden den Raum nach unten. |

---

## C. REFERENCE SET (15 Primärreferenzen im 9-Punkte-Analyseraster)

### Referenz 1 — Josh W. Comeau: *Designing Beautiful Shadows in CSS*
1. **Name / URL:** Josh W. Comeau — *Designing Beautiful Shadows in CSS* · https://www.joshwcomeau.com/css/designing-shadows/
2. **Was daran relevant ist:** Erklärt präzise, warum einzelne schwarze `box-shadow`-Werte flach und künstlich wirken und wie geschichtete, farbgetönte Schatten aus einer einzigen globalen Lichtquelle sofort physische Tiefe erzeugen.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Globale Lichtkonsistenz (ein Winkel für alle Schatten), Trennung von **Contact Shadow** (kleiner Offset/Blur) und **Ambient Shadow** (progressiv gestaffelter Offset/Blur), **Color-Matched Shadows** (Schattenfarbe aus abgedunkelter Hintergrund-Hue statt Schwarz).
4. **Welche technischen Mittel vermutlich verwendet werden:** 3–5 komma-separierte CSS `box-shadow`-Schichten mit CSS Custom Properties.
5. **Was für agentfähig.de übertragbar ist:** Direkt auf `.presence .eye` (`src/styles/bones/bones-eyes.css:43-46`) übertragbar: Kombination aus engem Kontaktschatten, entlang `--depth-light-x/y` gerichtetem Hauptschatten und farbigem Orb-Licht-Spill.
6. **Was NICHT übertragbar ist:** Harte Card-Container-Schatten (da `agentfähig.de` kartenlos bleibt).
7. **Komplexität / Aufwand:** Sehr niedrig (~15 Zeilen CSS + 4 Zeilen JS).
8. **Risiken:** Keine 60fps-Animation von Blur-Radien (erzeugt Paint-Last); Blur-Stufen nur bei Phasen-/Turn-Wechsel interpolieren.
9. **Empfehlung:** **`REUSE`**

### Referenz 2 — 2.5D Corneal Parallax & Ocular Rigging (`OpenVoiceUI` + 2.5D Eye Rigging)
1. **Name / URL:** `MCERQUA/OpenVoiceUI` (`src/face/EyeFace.js`, im Projekt unter `src/vendor/openvoiceui/`) · https://github.com/MCERQUA/OpenVoiceUI erweitert um 2.5D Corneal Counter-Parallax.
2. **Was daran relevant ist:** Unser bestehendes Augen-Markup in `src/presence/presence.js:257-280` injiziert bereits Venen, Iris-Fasern, Sheen, Limbus, Pupil-Core und zwei Catchlights — bewegt sie aber bisher alle in derselben 2D-Fläche.
3. **Welche Tiefenprinzipien dort erkennbar sind:** **Konvex-Konkav-Gegenparallaxe:** Die Iris/Pupille liegt leicht vertieft hinter der gewölbten Hornhaut-Kuppel. Beim Blickwechsel wandert der äußere Lichtreflex (Catchlight) minimal *gegenläufig* zur Iris, während das Oberlid einen inneren Kontaktschatten auf die Sklera/Iris wirft.
4. **Welche technischen Mittel vermutlich verwendet werden:** Abgeleitete CSS `translate3d`-Faktoren pro Sub-Layer innerhalb von `.eye`.
5. **Was für agentfähig.de übertragbar ist:** Direkt in `presence.css` / `bones-eyes.css`: Catchlight-Gegenversatz (`calc(var(--eye-left-pupil-x) * -0.18 * var(--depth-cornea, 0.65))`) + tiefere Pupillen-Auslenkung (`1.06×`).
6. **Was NICHT übertragbar ist:** 3D-Polygon-Meshes.
7. **Komplexität / Aufwand:** Niedrig (~20 Zeilen CSS).
8. **Risiken:** Gegenlauf muss auf `±2.5 px` begrenzt bleiben, damit kein Schiel-Effekt entsteht.
9. **Empfehlung:** **`ADAPT`**

### Referenz 3 — Apple visionOS Human Interface Guidelines: *Spatial Materials & Luminance*
1. **Name / URL:** Apple Human Interface Guidelines — *Materials* · https://developer.apple.com/design/human-interface-guidelines/materials
2. **Was daran relevant ist:** Zeigt, wie räumliche Hierarchie auf 2D-Flächen durch **Luminanz-Staffelung, Specular Highlights und adaptive Hintergrund-Dämpfung** entsteht, ohne laute 3D-Gimmicks.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Luminanz-Hierarchie (näher = heller/kontrastreicher), gerichtete Specular-Kanten, Abdunklung/Kontrastrücknahme tieferer Ebenen bei Fokus.
4. **Welche technischen Mittel vermutlich verwendet werden:** Mehrschichtige Material-Pipelines (Luminanz + Specular Rim + Elevation Shadow).
5. **Was für agentfähig.de übertragbar ist:** Die **Fokus-Lichtinsel** unter `#focus` beim Sprechen (`--depth-focal-contrast`) und die feine Specular-Kante an Lid- und Composer-Linie.
6. **Was NICHT übertragbar ist:** Milchige Glassmorphismus-Karten (`adaptive-surface.css:2` verbietet Box-Glassmorphismus explizit).
7. **Komplexität / Aufwand:** Niedrig bis Mittel.
8. **Risiken:** Zu starke Glas-Boxen würden den Papier-/Atelier-Charakter zerstören.
9. **Empfehlung:** **`ADAPT`**

### Referenz 4 — Rauno Freiberg: *Designing Depth*
1. **Name / URL:** Rauno Freiberg — *Designing Depth* · https://rauno.me/craft/depth
2. **Was daran relevant ist:** Analysiert, wie 2D-Interfaces durch **zeitlich gestaffelte Bewegung (Staggered Motion), Kanten-Ausblendung (Infinite Fade) und selektiven Defocus** räumliche Tiefe erhalten.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Zeitliche Trägheitsstaffelung zwischen Vorder- und Hintergrund, weich auslaufende Raumkanten, Occlusion.
4. **Welche technischen Mittel vermutlich verwendet werden:** Gestaffelte CSS-Transition-Zeiten je Z-Ebene, radiale Masken (`mask-image`).
5. **Was für agentfähig.de übertragbar ist:** Ablösung der uniformen `--bone-transition-ms: 1100ms` durch **gestaffelte Ebenen-Trägheit** (`Z = -3`: `1350ms`, `Z = 0`: `680ms`, `Z = +1`: `320ms`) + seitliches Ausblenden der Horizontlinie.
6. **Was NICHT übertragbar ist:** Dekorative Foto-Rahmen.
7. **Komplexität / Aufwand:** Niedrig.
8. **Risiken:** `backdrop-filter` auf großen bewegten Flächen vermeiden.
9. **Empfehlung:** **`ADAPT`**

### Referenz 5 — Emil Kowalski: *Scale Recession & Spatial Elevation (Vaul)*
1. **Name / URL:** Emil Kowalski — *Building a Drawer Component* · https://emilkowal.ski/ui/building-a-drawer-component
2. **Was daran relevant ist:** Dokumentiert **Scale Recession**: Wenn eine vordere Ebene aktiv wird, tritt die hintere Ebene durch minimale Verkleinerung (`scale(0.98)`) und Kontrastdämpfung auf der Z-Achse zurück.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Relative Scale Recession, Contrast Dimming, physikalisch gedämpfte Übergangskurven.
4. **Welche technischen Mittel vermutlich verwendet werden:** Compositor-freundliches `transform: scale3d(...) translate3d(...)`.
5. **Was für agentfähig.de übertragbar ist:** Sanfte Scale-Rezession zwischen `thinking` (Präsenz zieht sich leicht nach innen zurück) und `speaking` (Antwortebene `#pair` rückt leicht vor).
6. **Was NICHT übertragbar ist:** Mobile Modal-Drawers.
7. **Komplexität / Aufwand:** Niedrig.
8. **Risiken:** Skalierung muss subtil (`0.98–1.015`) bleiben, sonst wirkt sie wie ein Zoom.
9. **Empfehlung:** **`ADAPT`**

### Referenz 6 — James Turrell: *Skyspaces & Ganzfeld Apertures*
1. **Name / URL:** James Turrell — *Skyspaces* · https://jamesturrell.com/work/type/skyspace/ (bereits Namensgeber für `nocturne-turrell-observatorium` in `src/surface/surface-worlds.js:239`).
2. **Was daran relevant ist:** Beweist, dass **ein präziser Apertur-/Horizontschnitt vor einem diffusen Lichtfeld** mehr räumliche Tiefe erzeugt als komplexe 3D-Geometrie.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Edge-vs-Void-Kontrast, Aerial Perspective, gerichteter Lichtverlauf.
4. **Welche technischen Mittel vermutlich verwendet werden:** Präzise Kantenführung gegen homogenes Streulicht.
5. **Was für agentfähig.de übertragbar ist:** Aktivierung der im Default (`surface-bones.js:82,88`) bisher auf `0` stehenden Horizont- und Sediment-Schwelle (`horizonLineAlpha`, `sedimentOpacity`) als subtile, seitlich ausblendende Raumkante auf `Z = -2`.
6. **Was NICHT übertragbar ist:** Physische Architektur.
7. **Komplexität / Aufwand:** Sehr niedrig (Bones existieren bereits!).
8. **Risiken:** Linie darf nicht hart bis zum Bildschirmrand durchlaufen (muss an den Seiten ausfaden).
9. **Empfehlung:** **`ADAPT`**

### Referenz 7 — Atropos.js (`nolimits4web/atropos`)
1. **Name / URL:** Atropos.js · https://github.com/nolimits4web/atropos (MIT)
2. **Was daran relevant ist:** Referenz für geschichtete 2.5D-Ebenen mit gegenläufiger Glanz- (Highlight) und Schattenschicht.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Normalisierte Koordinaten `[-1, 1]` × Ebenen-Offset + gegenläufiger Specular-Shine.
4. **Welche technischen Mittel vermutlich verwendet werden:** CSS `translate3d`, Pointer-Normalisierung.
5. **Was für agentfähig.de übertragbar ist:** Die Berechnungsformel `translate3d(calc(var(--scene-px) * var(--k-z)), ...)` für unsere 7 Z-Ebenen.
6. **Was NICHT übertragbar ist:** Gekippte 3D-Hover-Cards (`rotateX/Y` auf den ganzen Screen).
7. **Komplexität / Aufwand:** Sehr niedrig (Formel ohne Library übernehmbar).
8. **Risiken:** Vollbild-Rotationen erzeugen Motion Sickness → nur planare `translate3d`-Parallaxe nutzen.
9. **Empfehlung:** **`INSPIRE ONLY`**

### Referenz 8 — Parallax.js (`wagerfield/parallax`)
1. **Name / URL:** Parallax.js · https://github.com/wagerfield/parallax (MIT)
2. **Was daran relevant ist:** Deklaratives `data-depth`-Schichtenmodell mit gedämpfter Eingabeglättung.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Multi-Layer Motion Parallax proportional zum Z-Abstand.
4. **Welche technischen Mittel vermutlich verwendet werden:** `requestAnimationFrame` + Lerp + `translate3d`.
5. **Was für agentfähig.de übertragbar ist:** Das skalare Tiefenfaktor-Modell (`--scene-far`, `--scene-mid`, `--scene-near`), direkt gespeist aus den bereits gedämpften Kanälen von `src/presence/eye-motion-engine.js`.
6. **Was NICHT übertragbar ist:** Das veraltete Repo selbst (archiviert).
7. **Komplexität / Aufwand:** Sehr niedrig.
8. **Risiken:** Keine, wenn der bestehende `presence.js`-Loop genutzt wird.
9. **Empfehlung:** **`ADAPT` (Prinzip) / `AVOID` (Library)**

### Referenz 9 — Paper by FiftyThree & iA Writer: *Typographic Focal Depth*
1. **Name / URL:** FiftyThree *Paper* & iA Writer *Focus Mode* · https://ia.net/writer/support/editor/focus-mode
2. **Was daran relevant ist:** Zeigt auf warmem Papiergrund (`#F6F1E9`), wie man durch **selektive Kontrast-Staffelung** maximale Fokustiefe ohne Lesbarkeitsverlust erreicht.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Aktiver Gedanke in voller Tintenschärfe (`Z = +1.1`), Kontext/Prompt in ruhigerem Kontrast (`Z = +0.8`).
4. **Welche technischen Mittel vermutlich verwendet werden:** Luminanz- und Opazitäts-Staffelung unter Wahrung von WCAG AA.
5. **Was für agentfähig.de übertragbar ist:** Kontrast- und Ebenen-Trennung zwischen `.pair-prompt` und `.pair-answer` über `--depth-focal-contrast`.
6. **Was NICHT übertragbar ist:** Dokumenten-Editor-Layout.
7. **Komplexität / Aufwand:** Niedrig.
8. **Risiken:** `ensureWcagContrast()` muss für Prompt und Antwort aktiv bleiben (bereits durch `surface-bones.js:346-348` gesichert).
9. **Empfehlung:** **`ADAPT`**

### Referenz 10 — Motion (`motiondivision/motion`) Spring-Transform-Chains
1. **Name / URL:** Motion · https://github.com/motiondivision/motion (MIT)
2. **Was daran relevant ist:** Das Muster `useSpring` → `useTransform`, bei dem ein primärer Bewegungsvektor mit unterschiedlichen Dämpfungsfrequenzen (`omega`) auf mehrere Z-Ebenen abgebildet wird.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Phasenverschobene Massenträgheit (tiefe Ebenen folgen weicher als nahe Ebenen).
4. **Welche technischen Mittel vermutlich verwendet werden:** Kritisch gedämpfte Feder-Gleichungen.
5. **Was für agentfähig.de übertragbar ist:** `src/presence/eye-motion-engine.js:134` besitzt `stepCriticallyDamped(channel, target, omega, dtSec)` bereits! Ein gedämpfter Szenen-Kanal (`omega * 0.45`) erzeugt echte Tiefenträgheit ohne externe Library.
6. **Was NICHT übertragbar ist:** Die React-/DOM-Library selbst.
7. **Komplexität / Aufwand:** Sehr niedrig (~10 Zeilen in `eye-motion-engine.js`).
8. **Risiken:** Keine.
9. **Empfehlung:** **`ADAPT` (in eigener Engine) / `AVOID` (Library)**

### Referenz 11 — Teenage Engineering (`OP-1` / `Choir`): *Tactile 2.5D Micro-Relief*
1. **Name / URL:** Teenage Engineering · https://teenage.engineering/products/choir
2. **Was daran relevant ist:** Verbindet grafische Flachheit mit greifbarem 1–2px Micro-Relief an Skalen und Zeigern.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Feiner oberer Lichtsaum + 1.5px Kontaktschatten unter Zeigernadeln.
4. **Welche technischen Mittel vermutlich verwendet werden:** Vektor-SVG mit präzisem Drop-Shadow.
5. **Was für agentfähig.de übertragbar ist:** Subtiler Schattenwurf der Horological Watch-Index Needles (`.surface-dial-needle` in `adaptive-surface.css:242`) auf die Skala darunter.
6. **Was NICHT übertragbar ist:** Hardware-Skeuomorphismus.
7. **Komplexität / Aufwand:** Sehr niedrig.
8. **Risiken:** Muss unter 2px Relief bleiben.
9. **Empfehlung:** **`ADAPT`**

### Referenz 12 — Humane Ai Pin: *Laser Ink & Ambient Projection Pool*
1. **Name / URL:** Humane Ai Pin · https://humane.com/media/humane-launches-ai-pin
2. **Was daran relevant ist:** Embodied Interface, das Aufmerksamkeit durch einen gerichteten Lichtpool zwischen Präsenz und Text ausdrückt.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Licht als räumliche Brücke zwischen Sprecher (`Z = 0`) und Antwort (`Z = +1`).
4. **Welche technischen Mittel vermutlich verwendet werden:** Gerichteter radialer Licht-Falloff.
5. **Was für agentfähig.de übertragbar ist:** Sanfte Aufhellung des Antwortfelds (`#focus`) während `speaking`, als würden die Augen den Textraum beleuchten.
6. **Was NICHT übertragbar ist:** Monochromer Laser-Look.
7. **Komplexität / Aufwand:** Niedrig.
8. **Risiken:** Darf den Textkontrast niemals mindern.
9. **Empfehlung:** **`INSPIRE ONLY`**

### Referenz 13 — SVG Filter Lighting (`<feSpecularLighting>`, `<fePointLight>`)
1. **Name / URL:** MDN — *SVG `feSpecularLighting`* · https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting
2. **Was daran relevant ist:** Browser-native 3D-Punktlicht- und Bump-Map-Filter.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Relief-Glanzlicht und Refraktion.
4. **Welche technischen Mittel vermutlich verwendet werden:** Inline-SVG-Filterkette.
5. **Was für agentfähig.de übertragbar ist:** Nur für **statisches** Material-Korn (wie `<feTurbulence>` in `adaptive-surface.css:86`).
6. **Was NICHT übertragbar ist:** 60fps-Animation von Filter-Koordinaten (erzwingt CPU-Rerastering).
7. **Komplexität / Aufwand:** Mittel.
8. **Risiken:** Massive Paint-Kosten bei Animation.
9. **Empfehlung:** **`AVOID` (für 60fps-Motion)**

### Referenz 14 — Rive (`rive-app/rive-wasm`)
1. **Name / URL:** Rive Web Runtime · https://github.com/rive-app/rive-wasm
2. **Was daran relevant ist:** State-Machine-getriebene 2.5D-Charakter-Animation auf Canvas/WebGL.
3. **Welche Tiefenprinzipien dort erkennbar sind:** 2.5D-Mesh-Deformation über Blend-Achsen.
4. **Welche technischen Mittel vermutlich verwendet werden:** `.riv` Binärdatei + ~200 KB WASM.
5. **Was für agentfähig.de übertragbar ist:** Nur die State-Machine-Logik (die in `eye-motion-engine.js` bereits nativ implementiert ist).
6. **Was NICHT übertragbar ist:** Rive-Canvas zerstört die 48 CSS-Augen-Bones (`surface-bones.js`) und den Zero-Build-Vertrag.
7. **Komplexität / Aufwand:** Hoch.
8. **Risiken:** Blackbox-Canvas, Verlust von CSS-Tokens und Unit-Tests.
9. **Empfehlung:** **`AVOID`**

### Referenz 15 — Active Theory / Lusion: *WebGL Depth-of-Field Pipelines*
1. **Name / URL:** Active Theory — *Fiomet Case Study* · https://medium.com/active-theory/fiomet-case-study-9a0180268423
2. **Was daran relevant ist:** High-End-Referenz für Poisson-Disk-Tiefenunschärfe und atmosphärische Schichtung.
3. **Welche Tiefenprinzipien dort erkennbar sind:** Z-Buffer-DOF, atmosphärischer Dunst, Parallaxe.
4. **Welche technischen Mittel vermutlich verwendet werden:** Custom WebGL2 / GLSL Shader.
5. **Was für agentfähig.de übertragbar ist:** Nur das gestalterische Prinzip der sanften Rand-Vignette und Luftperspektive.
6. **Was NICHT übertragbar ist:** WebGL/Three.js-Renderpipeline (Scope Creep, Akku-/Lüfterlast, Awwwards-Show-Effekt).
7. **Komplexität / Aufwand:** Sehr hoch.
8. **Risiken:** Überladung, Verlust der ruhigen Papier-Identität.
9. **Empfehlung:** **`INSPIRE ONLY` (Technisch: `AVOID`)**

---

## D. DESIGN PRINCIPLES (10 Gestaltungsprinzipien für Spatial Depth)

1. **Ein Licht, eine Wahrheit („One Light Truth“):** Schattenwinkel und Specular-Glanz leiten sich mathematisch aus dem primären Licht-Orb (`orbAX`, `orbAY`) ab (`--depth-light-x`, `--depth-light-y`).
2. **Kein Schweben ohne Verankerung (Contact + Ambient Shadow):** Jedes erhabene Element kombiniert einen scharfen, kurzen Kontaktschatten mit einem weichen, farbgetönten Umgebungsschatten.
3. **Konvexe Hornhaut statt flacher Scheibe (Corneal Counter-Parallax):** Die Iris/Pupille liegt vertieft (`1.06×`), während der Hornhaut-Reflex (`-0.18×`) minimal gegenläufig wandert.
4. **Mikro-Parallaxe schlägt zusätzliche Farbverläufe:** `3–4 px` Gegenbewegung des Lichtfelds (`Z = -3`) gegen die Augen (`Z = 0`) erzeugen mehr Raum als zehn weitere Gradients.
5. **Ebenen haben unterschiedliche Masse und Zeit (Inertial Staggering):** Ferne Ebenen reagieren träge (`~1300 ms`), mittlere organisch (`~680 ms`), nahe unmittelbar (`~280 ms`).
6. **Luminanz-Fokus statt Text-Blur:** Tiefe im Dialogbereich entsteht durch Kontrast- und Helligkeitsstaffelung (`--depth-focal-contrast`), niemals durch unscharfen Fließtext.
7. **Kante + diffuser Lichtraum = Raumtiefe (Turrell-Prinzip):** Eine hauchfeine, zu den Seiten auslaufende Horizont-/Sediment-Schwelle (`Z = -2`) gibt dem diffusen Lichtfeld (`Z = -3`) räumliche Distanz.
8. **Der Raum atmet mit dem Gespräch und seinen Metriken:** Sowohl die momentane Phase (`listening`, `thinking`, `speaking`) als auch die 12 Gesprächs-Parameter (`--p-depth`, `--p-closeness`, `--p-openness`, `--p-attention`) formen kontinuierlich die Raumtiefe.
9. **Kein vierter Slider für „3D“:** `MAX_VISIBLE_CONTROLS = 3` bleibt unantastbar. Tiefe entsteht emergent aus Gespräch, Metriken, Welten und den bestehenden 3 Polen.
10. **Reduced Motion heißt „Ruhe mit Tiefe“, nicht „Flachheit“:** Bei `prefers-reduced-motion: reduce` oder *„Pause motion“* fällt nur `--depth-parallax` auf `0`; Lichtwinkel, Kontaktschatten, Hornhaut-Schichtung und Luminanz-Hierarchie bleiben voll erhalten.

---

## E. TECHNICAL OPTIONS (Bewertung für `agentfähig.de`)

| Ansatz | GPU Paint vs. Composite | Mobile & Akku | Integration in 180 Bones & 12 Metrik-Parameter | Aufwand | Empfehlung |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Nur CSS** (Multi-Layer Shadows, Luminanz-Staffel, Horizont-Maske, Phasen-Tokens) | Statischer Paint bei Phasen-/Turn-Wechsel; 0 Frame-Kosten. | Exzellent. | **100 % nativ** über `--depth-*` und `--bone-*`. | Sehr niedrig. | **Sofort nutzen** (Statisches Tiefen-Fundament). |
| **2. CSS + JS Motion** (Vorhandener `eye-motion-engine.js`-Loop treibt `--scene-px/py` & Corneal Parallax via `translate3d`) | **100 % GPU-Composite** (`translate3d`, `scale`, `opacity`), 0 Layout/Paint. | Sehr gut (nutzt den *bereits laufenden* rAF-Loop). | **100 % nativ**, deterministisch in `node --test` prüfbar. | Sehr niedrig. | **PRIMÄRPFAD** (Maximaler Gewinn bei minimalem Scope). |
| **3. SVG Filter** (`feSpecularLighting`, `feDisplacementMap`) | Teurer CPU/GPU-Reraster bei jedem Animations-Tick. | Schwach bei Animation. | Nur statisch (`body::after` Grain) sinnvoll. | Mittel. | **Nur statisch**, `AVOID` für 60fps-Loop. |
| **4. Rive** (`rive-wasm`) | Eigener Canvas/WebGL-Loop. | Mittel (+200 KB WASM). | **Bricht 180-Bone-System** & Zero-Build-Vertrag. | Hoch. | **`AVOID`**. |
| **5. Canvas / WebGL** (Three.js / Custom Shader) | GPU-Draw-Call, aber Alpha-Overdraw unter DOM. | Kritisch für Akku/Laptop-Ruhe. | Entzieht sich `ensureWcagContrast()` & Node-Tests. | Sehr hoch. | **`AVOID`**. |

---

## F. RECOMMENDED PATH (Empfohlener Ausbaupfad in 3 Stufen — Kriterium C3)

1. **Stufe 0 (Heute — Konzept & Metrik-Vernetzung sichern):**
   - Upstream Search, 7-Ebenen-Modell und die vollständige mathematische wie architektonische Vernetzung mit den 109 Metriken / 12 Parametern in `research/UPSTREAM-SEARCH-spatial-depth.md` (siehe **Abschnitt I** unten) verbindlich festhalten.
2. **Stufe 1 (Morgen — Minimaler visueller Vertical Slice + aktive Metrik-Brücke, ~85 Zeilen CSS/JS):**
   - `deriveSpatialDepth(params, axes, options)` in `src/metrics/surface.js` aktivieren und über `src/surface/surface-projector.js` mit dem 180-Bone-System verknüpfen.
   - `src/styles/bones/bones-depth.css` anlegen und in `src/living-surface.html` einbinden.
   - `--scene-px` / `--scene-py` im bestehenden `presence.js`-rAF-Loop ausgeben.
   - Corneal Counter-Parallax (`.eye-catchlight` vs. `.pupil-core`), `orbA`-gekoppelten Kontakt-/Umgebungsschatten und 7-Ebenen-Mikro-Parallaxe aktivieren; `filter` von `.stage` auf den Hintergrund verschieben.
3. **Stufe 2 (Ausbaustufe nach Sichtprüfung):**
   - Phasen-Choreografie über `html[data-depth-phase]` mit gestaffelten Trägheitszeiten (`1350ms` / `680ms` / `320ms`), Ambient-Socket (`Z = -1`) und seitlich ausfadender Turrell-Horizont-Apertur (`Z = -2`).

---

## G. ANTI-PATTERNS & NON-GOALS (Kriterium C3)

### Harte Nicht-Ziele (`Non-Goals`)
- **Kein Umbau auf Three.js, WebGL oder Rive:** Die Zero-Build-Architektur (`npm run dev` ohne Bundler), das 180-Bone-CSS-System und `ensureWcagContrast()` bleiben vollständig unangetastet.
- **Kein vierter UI-Regler für „Tiefe / 3D“:** `MAX_VISIBLE_CONTROLS = 3` bleibt hart bestehen.
- **Kein `filter: blur()` auf Lesetext:** Typografische Tiefe entsteht ausschließlich durch Luminanz-, Kontrast- und Ebenen-Staffelung.
- **Keine 60fps-Animation von `box-shadow`-Blur-Radien oder SVG-Filtern:** Im 60fps-Loop sind nur `transform` (`translate3d` / `scale`) und `opacity` erlaubt.
- **Kein Überschreiben expliziter Nutzer-Wünsche durch passive Metriken:** Wenn der Besucher aktiv eine Welt oder einen Regler setzt, modulieren die Gesprächs-Metriken den Raum nur noch als relatives Delta (`±15–25 %`) um diesen Anker herum.
- **Kein Commit, Push oder Live-Deploy ohne explizite Owner-Freigabe.**

---

## H. DECISION SUPPORT

| Frage | Antwort |
| :--- | :--- |
| **Was passiert heute schon?** | Vollständige Spezifikation des 2.5D-Tiefenmodells + exakte Vernetzungs-Architektur zwischen den **109 Gesprächs-Metriken (`src/metrics/metrics-catalog.json`)**, den **12 Schicht-2-Parametern (`src/metrics/surface.js`)**, den **8 Spatial-Depth-Dimensionen (`--depth-*`)** und dem **180-Bone-System (`src/surface/surface-bones.js`)** in Abschnitt I. |
| **Was folgt morgen als erster Implementierungsschritt?** | Umsetzung von Abschnitt I + Stufe 1 Vertical Slice (`src/metrics/surface.js`, `src/surface/surface-projector.js`, `src/presence/presence.js`, `src/styles/bones/bones-depth.css` + Unit-Tests in `tests/surface.test.js`). |
| **Was wäre Scope Creep?** | WebGL-Shader, Rive-WASM, neue Backend-Config-Keys oder zusätzliche sichtbare Slider. |
| **Wo liegt der größte ästhetische Hebel?** | Im Dreiklang aus **(1) Corneal Counter-Parallax im Auge**, **(2) 3-Pixel-Gegenparallaxe des 4-Orb-Lichtfelds** und **(3) an `orbA` sowie `--p-depth / --p-closeness` gekoppeltem Kontakt- & Umgebungsschatten**. |

---

## I. VERNETZUNG MIT DEM 3-SCHICHTEN-METRIKSYSTEM (`src/metrics/` → 12 Parameter → 8 Spatial-Depth-Dimensionen & 180 Bones)

### 1. Diagnose der aktuellen Lücke zwischen `src/metrics/` und `src/surface/`

Eine Code-Inspektion von `src/main.js`, `src/metrics/surface.js` und `src/surface/surface-projector.js` zeigt drei konkrete Stellen, an denen das bestehende Metriksystem heute noch vom Raum- und Bone-System abgeschnitten ist:

1. **`--p-*` Variablen werden geschrieben, aber räumlich nirgends gelesen:**  
   `writeVariables()` in `src/metrics/surface.js:524-526` schreibt bei jedem `RESPONSE_END` alle 12 Parameter (`--p-tempo`, `--p-density`, `--p-warmth`, `--p-calm`, `--p-closeness`, `--p-openness`, `--p-attention`, `--p-certainty`, `--p-playfulness`, `--p-formality`, `--p-depth`, `--p-energy`) auf `document.documentElement`. Eine Volltextsuche (`grep`) über `src/styles/` bestätigt: **Keine einzige CSS-Regel liest `--p-depth`, `--p-closeness`, `--p-openness` oder `--p-attention` aus.**
2. **`keepAuthoritativeSurface()` überschreibt passive Metrik-Turns, sobald ein Regler oder eine Welt aktiv ist:**  
   In `src/main.js:130-141` ruft `keepAuthoritativeSurface()` nach jedem `RESPONSE_END` und bei jeder Änderung von `data-surface-level` sofort `surfaceProjector.reapply()` auf, sobald `surfaceStore.isModified()` wahr ist. `surfaceProjector.apply()` (`src/surface/surface-projector.js:308`) ruft wiederum `applySurface(projected.legacyParams, root)` auf — und **überschreibt damit die frisch aus dem Gespräch berechneten 12 Metrik-Parameter** mit den statischen Werten aus `toLegacyParams(surfaceState)`.
3. **Weder `eye-motion-engine.js` noch die 180 Bones erhalten das Metrik-Delta:**  
   Wenn der Besucher z. B. lange überlegt (`think_time_total`, `hold_before_send`), tief verschachtelte Sätze schreibt (`clause_depth`, `abstractness`) oder persönliche Nähe aufbaut (`self_disclosure`, `second_person_ratio`), verändern sich in `src/metrics/engine.js` zwar `depth`, `calm` und `closeness` — aber das 180-Bone-Lichtfeld (`orbA..D`, `auraOpacity`, `horizonLineAlpha`) und die Augen-Kinematik (`presence.setParams`) erfahren davon nichts, sobald ein Bone-Set aktiv ist.

---

### 2. Architektur der Vernetzung: Anker (`SurfaceState` / `Bones`) + Metrik-Modulation (`Δp`)

Damit explizite Nutzerentscheidungen (Sprachbefehl / Welt / Regler) und implizite Gesprächs-Metriken (`mountMetrics`) sich **verstärken statt gegenseitig zu überschreiben**, gilt folgendes Kompositionsgesetz:

$$\text{EffectiveValue} = \text{clamp}\Big(\text{AnchorValue}(\text{World / SurfaceState}) + \text{Gain} \cdot \Delta p_{\text{metrics}},\ \text{min},\ \text{max}\Big)$$

wobei $\Delta p_k = p_k - 0.5 \in [-0.5, +0.5]$ die Abweichung des jeweiligen Schicht-2-Parameters vom neutralen Ruhewert `0.5` ist:
- **Im Ruhezustand ($\Delta p_k = 0$):** Die Oberfläche zeigt exakt den gewählten Anker (Default-Papierwelt oder gewählte 180-Bone-Welt). Alle bestehenden 239 Tests bleiben zu 100 % invariant.
- **Im Gesprächsverlauf ($\Delta p_k \neq 0$):** Nach jedem Turn (`RESPONSE_END`) fließt der neue 12-Parameter-Vektor `metricParams` in `surfaceProjector.setMetricParams(metricParams)` ein und moduliert die **8 Spatial-Depth-Dimensionen (`--depth-*`)**, ausgewählte **Atmosphären-/Augen-Bones** sowie die **Präsenz-Kinematik**.

---

### 3. Vollständige Vernetzungs-Matrix: 109 Metriken → 12 Parameter → 8 Spatial-Depth-Dimensionen

Die folgende Tabelle zeigt den durchgängigen Signalpfad von den konkreten Metriken aus `src/metrics/metrics-catalog.json` und `src/metrics/compute.js` über die 12 Parameter in `src/metrics/engine.js` bis in die 8 neuen Spatial-Depth-Dimensionen:

| Spatial-Depth-Dimension | CSS Custom Property | Primäre Schicht-2-Parameter (`src/metrics/engine.js`) | Treibende Schicht-1-Metriken (`src/metrics/metrics-catalog.json` & `compute.js`) | Mathematische Kopplungsformel (`0..1` bzw. px) | Räumliches Verhalten im Gespräch |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0. Mood-Achse `spatiality`** | `--surface-spatial` | `+0.45 depth`<br>`+0.30 openness`<br>`+0.25 closeness` | `clause_depth` (`+0.6`), `abstractness` (`+0.5`), `mtld` (`+0.4`), `think_time_total` (`+0.4`), `hold_before_send` (`+0.4`), `open_question` (`+0.5`), `self_disclosure` (`+0.5`), `concreteness` (`-0.5`), `flesch_reading_ease` (`-0.5`) | `clamp(2.4 * (0.45*(depth - 0.5) + 0.30*(openness - 0.5) + 0.25*(closeness - 0.5)), -1, 1)` | **Hauptachse der Raumtiefe (`-1` flach/konkret ↔ `+1` tief/weit/nahbar):** Steigt automatisch, wenn das Gespräch von kurzen Floskeln zu substanziellen, persönlichen oder offenen Fragen übergeht. |
| **1. `depthIntensity`** | `--depth-intensity` | `+0.32 depth`<br>`+0.18 openness`<br>`+0.14 attention` | `type_token_ratio`, `long_word_ratio`, `subordinate_conjunction_ratio`, `long_pause_ratio`, `topic_keyword_density` (`+0.45`), `topic_coherence` (`+0.35`) | `clamp(0.50 + 0.32*(depth - 0.5) + 0.18*(openness - 0.5) + 0.14*(attention - 0.5), 0.15, 0.95)` | Skaliert den Gesamtabstand der 7 Z-Ebenen. Ein fokussiertes, nachdenkliches Gespräch baut schrittweise einen tieferen Raum auf; bei Tab-Wechsel (`window_blur_rate`, `hidden_time_ratio`) flacht er sanft ab. |
| **2. `parallaxGain`** | `--depth-parallax` | `+0.35 openness`<br>`+0.25 energy`<br>`+0.20 playfulness`<br>`-0.20 formality` | `curiosity_words` (`+0.4`), `question_ratio` (`+0.5`), `surprise_markers` (`+0.3`), `emoji_ratio` (`+0.5`), `humor_irony` (`+0.5`), `arousal_vader` (`+0.5`), `formality_f_score` (`+0.6`), `passive_voice_ratio` (`+0.5`) | `reducedMotion ? 0 : clamp(0.85 + 0.35*(openness - 0.5) + 0.25*(energy - 0.5) + 0.20*(playfulness - 0.5) - 0.20*(formality - 0.5), 0.20, 1.35)` | Steuert die Beweglichkeit zwischen `Z = -3` und `Z = +1`. Neugierige, lebendige Exploration macht den Raum beweglich; nüchtern-formale Sprache (`formality`) stabilisiert ihn. |
| **3. `cornealDepth`** | `--depth-cornea` | `+0.35 closeness`<br>`+0.25 attention`<br>`+0.15 warmth` | `first_person_singular_ratio` (`+0.5`), `second_person_ratio` (`+0.4`), `self_disclosure` (`+0.5`), `vocative_address` (`+0.35`), `pointer_near_presence_ratio`, `gratitude_markers` (`+0.45`) | `clamp(0.65 + 0.35*(closeness - 0.5) + 0.25*(attention - 0.5) + 0.15*(warmth - 0.5), 0.25, 1.00)` | Verstärkt die Hornhaut-Wölbung (Gegenparallaxe zwischen tiefer Pupille und Catchlight). Wenn der Besucher den Agenten direkt anspricht (*„du“*) oder mit der Maus nahe bei den Augen verweilt, wirkt das Auge plastischer und präsenter. |
| **4. `lightDirectionCoupling`** | `--depth-light-x`<br>`--depth-light-y` | `orbAX`, `orbAY`<br>`+0.18 warmth`<br>`+0.15 calm` | `sentiment_valence` (`+0.5`), `sentiment_balance` (`+0.35`), `joy_lexicon` (`+0.4`), `anger_lexicon` (`-0.5`), `negation_ratio` (`-0.4`) | `lx = clamp((50 - orbAX)/50 + 0.18*(warmth - 0.5), -1, 1)`<br>`ly = clamp((50 - orbAY)/50 + 0.15*(calm - 0.5), -1, 1)` | Verbindet den primären Licht-Orb (`orbA`) mit dem Schattenwinkel und verschiebt den Lichteinfall subtil mit der emotionalen Temperatur und Gelassenheit des Gesprächs. |
| **5. `shadowElevation`** | `--depth-shadow-length`<br>`--depth-contact-alpha` | `+16px depth`<br>`-10px closeness`<br>`+6px calm`<br>`+0.18 closeness` (Kontakt) | `clause_depth`, `think_time_total`, `first_person_singular_ratio`, `boosters` (`+0.5`), `dominance_vad` (`+0.35`), `imperative_mood` (`+0.3`) | `len = round(clamp(14 + 16*(depth - 0.5) - 10*(closeness - 0.5) + 6*(calm - 0.5), 8, 32))`<br>`contact = clamp(0.28 + 0.18*(closeness - 0.5) + 0.12*(certainty - 0.5), 0.14, 0.48)` | Hohe Nähe (`closeness`) und Bestimmtheit (`certainty`) holen die Präsenz nah an die Trägerfläche (kurzer, knackiger Kontaktschatten `8–11px`); hohe Abstraktion (`depth`) lässt sie höher über dem Grund schweben (`20–32px`). |
| **6. `atmosphericHaze`** | `--depth-haze` | `+0.30 openness`<br>`+0.20 depth`<br>`-0.25 certainty`<br>`-0.20 formality` | `hedge_ratio` (`-0.6 certainty`), `hedges` (`-0.5`), `modal_verb_ratio` (`-0.4`), `conditional_ratio` (`+0.4 openness`), `future_tense_ratio` (`+0.4`), `boosters` (`+0.5 certainty`) | `clamp(0.35 + 0.30*(openness - 0.5) + 0.20*(depth - 0.5) - 0.25*(certainty - 0.5) - 0.20*(formality - 0.5), 0.08, 0.78)` | Wenn der Besucher abwägt (*„vielleicht“, „was wäre wenn“*), legt sich ein weicher, offener atmosphärischer Dunst über `Z = -3 / -2`. Bei klaren, entschiedenen Aussagen (`boosters`, `imperative_mood`) wird die Luft glasklar. |
| **7. `focalSeparation`** | `--depth-focal-contrast` | `+0.35 attention`<br>`+0.25 density`<br>`+0.15 certainty`<br>`-0.15 openness` | `word_count` (`+0.6 density`), `mean_sentence_length` (`+0.5`), `noun_ratio` (`+0.4`), `topic_keyword_density` (`+0.45 attention`), `closed_question` (`+0.3`) | `clamp(0.50 + 0.35*(attention - 0.5) + 0.25*(density - 0.5) + 0.15*(certainty - 0.5) - 0.15*(openness - 0.5), 0.15, 0.95)` | Bei hoher Informationsdichte und engem Themenfokus hebt sich die Antwortebene (`Z = +1`) kontrastreich hervor, während periphere Schichten gedämpft werden, um Cognitive Overload zu verhindern. |
| **8. `visualGravity`** | `--depth-gravity` | `+0.45 calm`<br>`+0.35 depth`<br>`-0.45 energy`<br>`-0.25 tempo` | `typing_speed_cps` (`+0.5 tempo`), `typing_burst_length` (`+0.4 energy`), `turns_per_minute` (`+0.5`), `interruption_rate` (`+0.4`), `long_pause_ratio` (`+0.3 calm`), `turn_interval_median` (`-0.4 tempo`) | `clamp(0.45*(calm - 0.5) + 0.35*(depth - 0.5) - 0.45*(energy - 0.5) - 0.25*(tempo - 0.5), -0.85, 0.85)` | Schnelles Tippen und hohe Schlagzahl (`turns_per_minute`) geben der Fokus-Bühne Auftrieb (`< 0`, nach vorn/oben); ruhiges Verweilen und lange Pausen erden die Komposition sanft nach unten (`> 0`). |

---

### 4. Kopplung der Metrik-Dimensionen an das 180-Bone-Skelett (`src/surface/surface-bones.js`)

Wenn ein 180-Bone-Welt-Zustand aktiv ist (oder der Default-Bone-Satz läuft), moduliert `surface-projector.js` über die 8 Spatial-Depth-Dimensionen gezielt diese 12 bestehenden Bones aus `BONE_SCHEMA`, ohne die WCAG-AA-Textfarben anzutasten:

| Bestehender Bone (`src/surface/surface-bones.js`) | Familie | Modulationsformel durch Spatial Depth / Metriken | Sichtbare Wirkung im 180-Bone-System |
| :--- | :--- | :--- | :--- |
| **`eyeShadowX`** | `eyes` | `round(base.eyeShadowX + lightX * shadowLength * 0.55)` | Schatten fällt endlich konsistent vom primären Licht-Orb (`orbA`) weg statt starr mit `X = 0`. |
| **`eyeShadowY`** | `eyes` | `round(clamp(shadowLength, 6, 32))` | Schattenlänge folgt `depth` (schwebend) vs. `closeness` (nah an der Fläche). |
| **`eyeShadowBlur`** | `eyes` | `round(clamp(shadowLength * 1.85, 12, 54))` | Progressiver Blur passend zur Elevation (Comeau-Prinzip). |
| **`eyeHaloBlur`** | `eyes` | `round(clamp(base.eyeHaloBlur * (0.75 + 0.5 * depthIntensity), 8, 60))` | Tieferer Gesprächsraum weitet den atmosphärischen Lichthof (`Z = -1`) um die Augen. |
| **`catchlightMainOpacity`** | `eyes` | `clamp(base.catchlightMainOpacity + 0.14 * (cornealDepth - 0.65), 0.35, 1)` | Stärkere Hornhaut-Präsenz bei hoher Nähe (`closeness`) und Aufmerksamkeit (`attention`). |
| **`pupilSizeBias`** | `eyes` | `clamp(base.pupilSizeBias + 0.12 * (closeness - 0.5) + 0.08 * (warmth - 0.5), 0.75, 1.28)` | Subtile relationale Pupillen-Weitung bei persönlicher Zuwendung und Wärme. |
| **`horizonLineAlpha`** | `texture` | `clamp(Math.max(base.horizonLineAlpha, 0.12 * depthIntensity) * (1 - 0.35 * atmosphericHaze), 0, 0.85)` | Gibt selbst der Default-Welt eine zarte Turrell-Raumschwelle, die bei hohem Haze sanft im Dunst weicher wird. |
| **`sedimentOpacity`** | `texture` | `clamp(Math.max(base.sedimentOpacity, 0.08 * depthIntensity), 0, 0.36)` | Aktiviert subtile Tiefenschichtung im Hintergrundfeld (`Z = -2`), sobald `depthIntensity` steigt. |
| **`auraOpacity`** | `light` | `clamp(base.auraOpacity + 0.18 * (depthIntensity - 0.5) + 0.12 * (warmth - 0.5), 0.08, 0.96)` | Das 4-Orb-Lichtfeld (`Z = -3`) gewinnt mit steigender Gesprächstiefe an räumlicher Leuchtkraft. |
| **`auraBreathMs`** | `light` | `round(clamp(base.auraBreathMs * (1 + 0.35 * (calm - 0.5) - 0.25 * (energy - 0.5)), 6500, 26000))` | Raum-Atmung (`Z = -3`) verlangsamt sich bei hoher Ruhe (`calm`) und beschleunigt sich sanft bei hoher Energie. |
| **`vignetteAlpha`** | `light` | `clamp(base.vignetteAlpha + 0.14 * (focalSeparation - 0.5), 0.02, 0.62)` | Hohe Konzentration (`attention`, `density`) schließt die periphere Vignette leicht, um den Blick auf die Antwort zu bündeln. |
| **`answerShadowAlpha`** | `typography` | `clamp(base.answerShadowAlpha + 0.08 * focalSeparation, 0, 0.18)` | Hebt die Antwort (`Z = +1`) bei hoher Fokustiefe hauchfein vom Hintergrund ab. |

---

### 5. Code-Blueprint für die Implementierung morgen (`deriveSpatialDepth`)

Dieser Blueprint kann morgen direkt in `src/metrics/surface.js` und `src/surface/surface-projector.js` übernommen werden:

```js
// In src/metrics/surface.js — reine, deterministische Ableitung der 8 Spatial-Depth-Dimensionen
export function deriveSpatialDepth(params = {}, options = {}) {
  const p = {};
  for (const id of PARAMETER_IDS) p[id] = clamp01(params?.[id]);

  const {
    tempo, density, warmth, calm, closeness, openness,
    attention, certainty, playfulness, formality, depth, energy,
  } = p;

  const reducedMotion = Boolean(options?.reducedMotion);
  const orbAX = Number.isFinite(options?.orbAX) ? options.orbAX : 22;
  const orbAY = Number.isFinite(options?.orbAY) ? options.orbAY : 18;

  const spatiality = Number(clamp(
    2.4 * (0.45 * (depth - 0.5) + 0.30 * (openness - 0.5) + 0.25 * (closeness - 0.5)),
    -1,
    1,
  ).toFixed(4));

  const depthIntensity = Number(clamp(
    0.50 + 0.32 * (depth - 0.5) + 0.18 * (openness - 0.5) + 0.14 * (attention - 0.5),
    0.15,
    0.95,
  ).toFixed(3));

  const parallaxGain = reducedMotion
    ? 0
    : Number(clamp(
        0.85 + 0.35 * (openness - 0.5) + 0.25 * (energy - 0.5) + 0.20 * (playfulness - 0.5) - 0.20 * (formality - 0.5),
        0.20,
        1.35,
      ).toFixed(3));

  const cornealDepth = Number(clamp(
    0.65 + 0.35 * (closeness - 0.5) + 0.25 * (attention - 0.5) + 0.15 * (warmth - 0.5),
    0.25,
    1.00,
  ).toFixed(3));

  const baseLightX = (50 - orbAX) / 50;
  const baseLightY = (50 - orbAY) / 50;
  const lightX = Number(clamp(baseLightX + 0.18 * (warmth - 0.5), -1, 1).toFixed(3));
  const lightY = Number(clamp(baseLightY + 0.15 * (calm - 0.5), -1, 1).toFixed(3));

  const shadowLengthPx = Math.round(clamp(
    14 + 16 * (depth - 0.5) - 10 * (closeness - 0.5) + 6 * (calm - 0.5),
    8,
    32,
  ));
  const contactAlpha = Number(clamp(
    0.28 + 0.18 * (closeness - 0.5) + 0.12 * (certainty - 0.5),
    0.14,
    0.48,
  ).toFixed(3));

  const atmosphericHaze = Number(clamp(
    0.35 + 0.30 * (openness - 0.5) + 0.20 * (depth - 0.5) - 0.25 * (certainty - 0.5) - 0.20 * (formality - 0.5),
    0.08,
    0.78,
  ).toFixed(3));

  const focalSeparation = Number(clamp(
    0.50 + 0.35 * (attention - 0.5) + 0.25 * (density - 0.5) + 0.15 * (certainty - 0.5) - 0.15 * (openness - 0.5),
    0.15,
    0.95,
  ).toFixed(3));

  const visualGravity = Number(clamp(
    0.45 * (calm - 0.5) + 0.35 * (depth - 0.5) - 0.45 * (energy - 0.5) - 0.25 * (tempo - 0.5),
    -0.85,
    0.85,
  ).toFixed(3));

  const lagFarMs = Math.round(clamp(1250 + 350 * (calm - 0.5) - 200 * (tempo - 0.5), 850, 1650));
  const lagMidMs = Math.round(clamp(650 + 180 * (calm - 0.5) - 120 * (tempo - 0.5), 420, 920));
  const lagNearMs = Math.round(clamp(280 + 80 * (calm - 0.5) - 60 * (tempo - 0.5), 180, 420));

  return {
    spatiality,
    depthIntensity,
    parallaxGain,
    cornealDepth,
    lightX,
    lightY,
    shadowLengthPx,
    contactAlpha,
    atmosphericHaze,
    focalSeparation,
    visualGravity,
    lagFarMs,
    lagMidMs,
    lagNearMs,
    variables: {
      '--surface-spatial': String(spatiality),
      '--depth-intensity': String(depthIntensity),
      '--depth-parallax': String(parallaxGain),
      '--depth-cornea': String(cornealDepth),
      '--depth-light-x': String(lightX),
      '--depth-light-y': String(lightY),
      '--depth-shadow-length': `${shadowLengthPx}px`,
      '--depth-contact-alpha': String(contactAlpha),
      '--depth-haze': String(atmosphericHaze),
      '--depth-focal-contrast': String(focalSeparation),
      '--depth-gravity': String(visualGravity),
      '--scene-lag-far': `${lagFarMs}ms`,
      '--scene-lag-mid': `${lagMidMs}ms`,
      '--scene-lag-near': `${lagNearMs}ms`,
    },
  };
}
```

---

## ABSCHLUSSFRAGE

> **Wie kann agentfähig.de räumlicher, tiefer und präsenter werden, ohne seine Klarheit, Eleganz und Direktheit zu verlieren?**

Indem räumliche Tiefe **nicht als dekorative Effekt-Schicht über die Seite gelegt wird, sondern aus der physikalischen und kommunikativen Kopplung der bereits vorhandenen Elemente entsteht**:
1. **Ein Licht-Ursprung (`orbA`)** bestimmt jeden Schatten- und Glanzwinkel.
2. **Die Augen wölben sich dreidimensional**, weil tiefe Iris und äußerer Hornhaut-Reflex sich minimal gegenläufig bewegen.
3. **Die 7 Z-Ebenen lösen sich zeitlich und räumlich voneinander**, angetrieben vom bereits laufenden 60fps-Kinematik-Loop.
4. **Das 3-Schichten-Metriksystem (`109 Metriken → 12 Parameter → 8 Spatial-Depth-Dimensionen`) übersetzt Gesprächsverlauf in Raum:** Nähe (`closeness`) und Aufmerksamkeit (`attention`) holen die Präsenz nah und greifbar an die Oberfläche; begriffliche Tiefe (`depth`) und Offenheit (`openness`) weiten den Lichtraum dahinter. So bleibt `agentfähig.de` so schlicht wie ein Blatt Papier — gewinnt aber die Ruhe, Schichtung und Präsenz eines beleuchteten Raums.
