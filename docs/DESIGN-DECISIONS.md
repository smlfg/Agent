# Designentscheidungen — Grilling 12.11.2026, Produktklärungen 19.11.2026

Quelle: direkte Antworten von Samuel in diesen Sessions. Dies ist ein Zwischenstand,
keine vollständige Spezifikation und keine Freigabe zur Implementierung.
Die Fragestellungen stammen aus der
[Skizze vom 12.11.2026](../sketches/2026-11-12-agentfaehig.md).

## Bestätigt

| Thema | Entscheidung |
| --- | --- |
| Initiative | Der Mensch gibt den Intent; der Agent reagiert darauf. |
| Erste Nachricht | Der Mensch initiiert das Gespräch. Der Agent eröffnet es nicht mit einem eigenen Begrüßungssatz. |
| Wartezeit | Der Mensch darf sofort initiieren; die fünf Sekunden aus der Skizze sind keine erzwungene Wartezeit. |
| Präsenz vor dem Intent | Augen und Bewegung dürfen Präsenz zeigen: sanft, minimal, „unaufregend“. |
| Ohne hörbaren Ton | Antwort auch als Text; eine sanfte visuelle Reaktion signalisiert die Antwort. |
| Text und Verlauf | Aktuelle Antwort bleibt sichtbar. Ältere Antworten treten zurück und werden beim Scrollen sichtbar. |
| Neue Antwort | Neue Antwort steht im Fokus, auch wenn vorher im Verlauf gelesen wurde. Der Vorschlag, die alte Leseposition zu halten, wurde abgelehnt. |
| Typewriter | Gewünscht: lebendig und pulsierend, nicht bloß gleichmäßig. |
| Wortrhythmus | Kurze Wörter schnell; bei längeren Wörtern auch langsameres Zeichentempo. Exakte Raten und Übergänge offen. |
| Pathways-Architektur | Hinter dem schnellen Front-Worker bearbeiten **On-Demand Agents** die Pathways (`What this is`, `creator`, `product for X`) nach dem **DPPM-Muster** (Plan, Dispatch, Parallelize, Merge; Vorbild `HAI-DPPM` / `SelfAI`) mit dynamischem Flow State. |
| Caching-First + Synthese | Wenn bereits eine schnelle/gecachte Antwort vorliegt, wird diese **sofort zuerst ausgegeben**, und die tiefere Synthese der On-Demand-Agenten wird danach nachgereicht. |
| Erster Pathway & Gesprächsfluss | User Story für den Einstieg: Besucher fragt z. B. „Was bist du?“ → Agent antwortet knapp („Hey, ich bin ein Agent — dynamisch, adaptiv. Was möchtest du wissen?“) ohne ungefragten Monolog; der Mensch bestimmt den Weg bis zu klaren **Determined End Waypoints** (Buchen, Informieren, Reinlesen, Installieren). |
| Ziel-Portfolio (Domains, Produkte, GH, Agent-als-Produkt) | Als Ziel-Waypoints hinter den 3 Grundströmen (`What this is`, `creator`, `product for X`) stehen Samuels **Domain-Portfolio** (`agentfähig.de`, `human-agent-interface.com`, `humanagentinterface.de`, `humanagentcontrol.com`, `samuelfleig.com`, `agent-human-interface.com` u. a.), **Produkte & Open Source** (`hai-mcp`, beste GitHub-Projekte wie `hai-voice-builder`, `MonesterAG-ent-`, `HAI-DPPM`), **Kontaktdaten** sowie **„solche Website-Agents selbst als Produkt anbieten“** (`for website`). |
| Gesprächsführung („How to carry“) | **2-Schichten-Routing ohne Menü-Wand:** Vorne nur die 3 Grundströme (`What this is`, `creator`, `product for X`); der Front-Agent antwortet in **1–2 Sätzen (Bridge)** + **max. 2 natürlichen Richtungs-Impulsen** und blendet bei klarem Intent **genau 1 passende Waypoint-Card** zur Zeit ein. |
| Eine Version mit Ownership | Keine mehreren Wegwerf-Prototypen/Varianten, sondern **eine** hochwertige Version mit vollem Ownership (heute Nacht kein Bau mehr, Umsetzung ausgeruht in eigener Mission). |
| Eingabe & Voice-Priorität | Text und Voice gehören beide zum Kern („ich bin voice fan“); Voice wird als eigenes Modul gekapselt (Wiederverwendung aus `smlfg/hai-voice-builder` & `smlfg/MonesterAG-ent-`). |
| Reaktivität (Text vor TTS) | Reaktivität hat Vorrang: Sobald das erste Token eintrifft (`transcript_start` / `transcript_delta`), wechseln Fokus und Augen sofort und der pulsierende Typewriter läuft los; da Voice technisch einen Schritt mehr braucht, folgt die Sprachausgabe asynchron, sobald das Audio-Chunk bereit ist. |
| Aufwecken, Einstieg & Handy-Standard (Zero-Popup) | Textfeld + Mikrofon-Button sind von Anfang an sichtbar; jede erste Aktion (Mausbewegung, Klick, Taste, Touch — oder 5 s Ruhe) weckt die Augen. Am Handy ist Finger-/Fokus-Verfolgung (`PointerEvent`/`TouchEvent`) der Standard; **keinerlei ungefragte Permission-Popups** beim Laden oder Tippen (Mikrofon-Freigabe erst bei bewusstem Klick aufs Mikrofon). |
| Augen-Gestalt & State-Machine | Die Handskizze gibt nur die Richtung vor und soll **nicht** wörtlich als krakeliges Gekritzel abgemalt werden: Gefordert sind **starke, polierte, reaktive Augen ohne Gesicht** mit maximaler Außenwirkung (State-Machine & Timings aus `CX-ArtLab/BoopFace`, MIT). |
| Negativ-Abgrenzung (`prototype/index.html`) | Der erste visuelle Wurf in `prototype/index.html` ist **ausdrücklich nicht das Zielbild**: keine starren `div`-Rechteck-Augen ohne Pointer-Tracking, kein zufälliger SVG-Striche-Salat, kein Glassmorphism (`backdrop-filter`), keine Emoji-Icons (`🎙️`), keine fehlenden `@font-face`-Schriften und keine reinen Farb-Attrappen-Slider ohne Verhaltens-/Typografie-Wirkung. |
| Slider = CSS Visual Style × HAI Interaction | Jeder der 3 sichtbaren Slider koppelt live **CSS Visual Style** und **HAI Interaction Experience**: (1) `warm ↔ cold` = Papier/Holz-Wärme vs. kühles Tech-Blau × nahbarer vs. nüchterner Ton; (2) `soft ↔ sharp` (`knapp ↔ ausführlich`) = weiche Radien/Striche vs. klare Kante × sanft-erklärend vs. knapp-direkt (Cognitive Load); (3) `still ↔ alive` (`schnell ↔ tief`) = ruhiges Feld vs. lebendiger Puls × ruhige Sofort-Antwort vs. aktive DPPM-Synthese & 2 Fäden. |
| Anti-Scope-Creep (3 vertikale Slices) | Umsetzung in 3 strikt getrennten vertikalen Slices mit explizitem `Not included`-Parkplatz pro Slice (Slice 1 = Core Vertical Slice mit 1 Pathway + 3 statischen JSON-Waypoints; Slice 2 = On-Demand DPPM + voller 8-Domains/GH-Katalog; Slice 3 = Polish & Live-Deploy). |
| Prior-Art-Basis | Vanilla SVG + kurzes Pointer/Focus-JS für Gekritzel-zu-Augen (`ADAPT`), native `<input type="range">` + CSS Custom Properties (`INTEGRATE`) sowie Wiederverwendung der Fonts, Service-Bindings und Wissensquellen aus `Agentfägig.de` und `Human-Agent-Interface` (`REUSE`). |
| Zusammenarbeit | Eine Frage pro Runde; nach jeder inhaltlichen Antwort ein OpenCode-Scout mit DeepSeek V4.1 Flash. |
| Erster Besucherablauf (19.11.) | Text-erster Ablauf: Ankommen, Augen wachen nach etwa 5 Sekunden sanft auf, eine Textnachricht, Typewriter-Antwort im Fokus. Hintergrund-Ergebnisse erscheinen still über State-Sync. |
| Eingabemodalität (19.11.) | Text zuerst; Mikrofon wird erst nach Klick freigegeben. Damit ist Voice Teil des Erstbaus (zuvor offener Punkt, jetzt bestätigt). |
| Slider (19.11.) | Erste Version mit genau einem Regler. Die Belegung entsteht im Gespräch: der Agent erfragt sein Aussehen. Ausbaupfad wie in der Skizze: 1 → 2/3 → max 3. |
| Backend-Aufrufe (19.11.) | Der Front-Agent ist ein schneller echter Duplex-Sprachagent; dahinter laufen echte schlaue Agenten (Analysing, Looking-up) statt Simulationen. Ergebnisse erscheinen still über State-Sync. |
| Prüfung (19.11.) | Messlauf als Gate vor dem Erstbau: `examples/voice-agent` lokal, Auswertung von `first_audio_ms` und Stage-Timings. Benötigt Plan-Modus und Owner-Freigabe. Laufsprache: 20 englische Wechsel (2. Runde, 19.11.; ursprünglich deutsch geplant). Freigabe erteilt — Lauf vorbehaltlich des Plan-Validators. |
| Voice-Sprache (19.11., 2. Runde) | Die Voice-Pipeline (STT/TTS) läuft auf Englisch; die englischsprachigen Default-Bausteine (`flux`, `aura-1`) sind damit bewusst gewählt. Deutsch bleibt **wünschbares Feature** (Samuel: „schönes Feature, aber wenn es nicht geht, dann halt Englisch") — geparkt, erreichbar über externen TTS (Samuel nennt ElevenLabs, weitere Anbieter; Kostenrecherche läuft). Messlauf dadurch entzerrt: 20 englische Wechsel statt deutsche Pipeline. |
| Regler-Belegung (19.11., Abend) | Der Mensch stellt den Agenten ein: der Bediener zieht den Regler. Zusätzlich wirkt die H2A-Interaktion selbst auf Werdegang und Gestalt. Beides schreibt in denselben Zustand; die Oberfläche ist dessen Projektion. |
| Erster Regler (19.11., Abend) | **warm ↔ cold** — beantwortet die bisher offene Default-Belegung. Einziger Regler, der in der Skizze zweimal vorkommt und direkt auf einen Token-Vertrag abbildbar ist (Farbtemperatur, Radius, Textur) mit messbarer Kontrastprüfung. |
| Ausbaupfad der Regler (19.11., Abend) | Fünf geplant, max. drei gleichzeitig sichtbar (Skizze „2 more when this / maybe 5 options but only show 3"). Sichtbar: 1 warm↔cold, 2 Präsenz (ruhig ↔ ausdrucksstark), 3 Tiefe (knapp ↔ forschend). Tempo ist **kein** Regler — bereits durch den Segmentvertrag bestimmt. |
| Tiefe wirkt doppelt (19.11., Abend) | Tiefe ist **Gestalt und Werdegang**: Anzeige springt sofort um, der Agenten-Aufwand folgt nachgelagert. Im ersten Ablauf ist nur die Gestalt-Hälfte sichtbar. |
| Projektion der Gestalt (19.11., Abend) | Feste, deterministische Regel zuerst (Ereignis → Gestalt). Eine Modell-Abbildung folgt später und nur als Vorschlag. |

## Hypothese und technische Abhängigkeiten

Samuel begründet den Wortrhythmus damit, dass kurze Wörter schneller erfasst werden
können. Die Übertragung auf buchstabenweise Animation ist noch ungeprüft; siehe
[Recherche](../research/SCOUT-SYNTHESIS.md). Diese Unsicherheit hebt die gewünschte
Gestaltungsrichtung nicht auf.

Cloudflare unterstützt Text-Streaming grundsätzlich. Ein gemessener End-to-End-Lauf
mit gewähltem Modell, Browser und gegebenenfalls Sprache fehlt noch.

## Konsequenzen der Entscheidungen vom 19.11.2026

- Der Messlauf ist durch Voice im Erstbau vom Empfehlungs- zum Pflichtpunkt
  geworden. Der frühere Grund „Deutsch-Fähigkeit ungeprüft“ ist am 19.11. geklärt:
  `flux`/`aura-1` sind nachweislich nur Englisch; deutsches STT ist über
  `WorkersAINova3STT({ language: “de“ })` SDK-seitig belegt, deutsches TTS braucht
  einen externen Provider. Die Stille-Sorge (+500 ms obendrauf) ist SDK-seitig
  widerlegt: der Server ignoriert `end_of_speech`, das Turn-Ende bestimmt das
  STT-Modell. Verbleibende Pflichtgründe für den Lauf: das reale `first_audio_ms`
  messen (Cloudflares Budget 890 ms bleibt unaufgelöst), Beta-Verhalten im
  Live-Betrieb, Modell-Wahl unter den Deprecations vom 20.11.2026 und der
  LLM-Pfad auf einem Free-Account. Evidenz mit SDK-Quellcode-Nachweisen:
  [CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md](CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md) (Missions-Artefakt vom
  19.11.).
- Das Umgestaltungs-Verhalten (Agent erfragt sein Aussehen und wirkt live) hat
  keine gefundene Vorlage ([konkurrenz.md](../tech/research/konkurrenz.md));
  der Mechanismus selbst ist trivial über State-Sync und CSS. Bewusstes
  Eigenbau-Risiko, kein kopierbares Muster.
- Die dokumentierte Spannung zur
  [Designinspiration](../Agentfähig/GreateWriting.txt) („bespoke principle“)
  bleibt als Designrisiko notiert, gerade weil der erste Regler vermutlich die
  Farbe oder Temperatur betreffen wird.

## Offene Fragen

Stand 19.11.2026 — die fünf Produktfragen aus `PROJECT.md` sind geklärt; folgende
Punkte bleiben offen:

- ~~Konkretes Ergebnis des Besuchs: bleibt eine sichtbare Umgestaltung der Seite
  Teil des ersten Ablaufs oder folgt sie erst dem Ausbaupfad der Regler?~~
  **Beantwortet 19.11. abends:** sie ist Teil des ersten Ablaufs — der Regler
  wirkt sofort auf die Gestalt (feste Projektionsregel, s. o.).
- ~~Default-Belegung des ersten Reglers, solange der Nutzer noch nichts gesagt hat
  (Kandidat aus der Skizze: die warm↔cold-Achse).~~
  **Beantwortet 19.11. abends:** warm ↔ cold (s. o.).
- Beginn des Fokuswechsels beim ersten Text oder erst bei vollständiger Antwort.
- Typewriter-Tempo, Übergänge, Verhalten bei Streaming-Pausen und langen
  Antworten (Regel für leerlaufenden Puffer).
- Modellprovider, Voice-Pipeline und konkrete Architektur; durch Voice im
  Erstbau ist der Messlauf Pflicht (siehe Konsequenzen).
  Offen bleibt im Einzelnen: welches schnelle Modell im Front-Worker, welches im
  On-Demand-Worker, welcher deutsche TTS-Adapter, eigener Worker vs. Flotte.
- Messbare Abnahmekriterien (`first_token_ms`, `first_audio_ms`, Fallback bei
  Modell-/Netzwerk-Pause) und abschließende Bestätigung des gemeinsamen
  Verständnisses. Latenz-Kriterien aus den Messwerten ableiten, nicht vorab
  erfinden.
- Unklare Skizzenbegriffe `⟨Backup⟩`, `⟨Pay⟩`, `⟨Opp M⟩`, `⟨Moltdegect⟩` und das
  Stichwort „clear word“ bleiben unsichere Lesarten.
- Sprache des Text-Kanals: Voice läuft auf Englisch; ob Typewriter-Antworten
  (Text) Deutsch bleiben oder ebenfalls Englisch werden, ist nicht entschieden.

## Ergänzung aus dem übertragenen Gespräch

Samuel bestätigt dort: „der Mensch initiiert das Gespräch“, „man darf natürlich
initiieren“, „das müssen cheap swarm agents machen, die pathways“ sowie `ja` zu
der Arbeitsteilung Front-Agent → Schwarm-Agent und `What this is` als erstem
Pathway (siehe `FableTP5.2talk`). Die Interpretation, dass „1 message“ in der
Skizze die erste Besuchernachricht meint, bleibt eine Lesart, keine Änderung der
Originalquelle. Auch das bereits sichtbare Eingabefeld ist dort eine vorgeschlagene
Ausgestaltung.

Die Aussage zu Sensorfreigaben wurde inzwischen gegen MDN geprüft (siehe
[Recherche](../research/SCOUT-SYNTHESIS.md)): iOS Safari verlangt für Gyroskop-Zugriff
`DeviceOrientationEvent.requestPermission()` innerhalb einer Nutzer-Geste, während
Pointer-/Touch-Events keine Berechtigung benötigen. „Wenn du nicht widersprichst“
und pauschales „passt“ zählen weiterhin nicht als ausdrückliche Designbestätigung.

## Fortsetzung

Mit dem [Grilling-Skill](../skills/grilling/SKILL.md) an der offenen Frontier
fortsetzen. Entscheidungen oben nicht erneut abfragen. Fakten recherchieren,
Vorschläge als Vorschläge kennzeichnen. Noch keine Implementierung beginnen.
