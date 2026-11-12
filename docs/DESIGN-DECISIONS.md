# Designentscheidungen — Grilling, 12.11.2026

Quelle: direkte Antworten von Samuel in dieser Session. Dies ist ein Zwischenstand,
keine vollständige Spezifikation und keine Freigabe zur Implementierung.

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
| Eine Version mit Ownership | Keine mehreren Wegwerf-Prototypen/Varianten, sondern **eine** hochwertige Version mit vollem Ownership (heute Nacht kein Bau mehr, Umsetzung ausgeruht in eigener Mission). |
| Eingabe & Voice-Priorität | Text und Voice gehören beide zum Kern („ich bin voice fan“); Voice wird als eigenes Modul gekapselt (Wiederverwendung aus `smlfg/hai-voice-builder` & `smlfg/MonesterAG-ent-`). |
| Reaktivität (Text vor TTS) | Reaktivität hat Vorrang: Sobald das erste Token eintrifft (`transcript_start` / `transcript_delta`), wechseln Fokus und Augen sofort und der pulsierende Typewriter läuft los; da Voice technisch einen Schritt mehr braucht, folgt die Sprachausgabe asynchron, sobald das Audio-Chunk bereit ist. |
| Aufwecken, Einstieg & Handy-Standard (Zero-Popup) | Textfeld + Mikrofon-Button sind von Anfang an sichtbar; jede erste Aktion (Mausbewegung, Klick, Taste, Touch — oder 5 s Ruhe) weckt die Augen. Am Handy ist Finger-/Fokus-Verfolgung (`PointerEvent`/`TouchEvent`) der Standard; **keinerlei ungefragte Permission-Popups** beim Laden oder Tippen (Mikrofon-Freigabe erst bei bewusstem Klick aufs Mikrofon). |
| Augen-Gestalt & State-Machine | Die Handskizze gibt nur die Richtung vor und soll **nicht** wörtlich als krakeliges Gekritzel abgemalt werden: Gefordert sind **starke, polierte, reaktive Augen ohne Gesicht** mit maximaler Außenwirkung (State-Machine & Timings aus `CX-ArtLab/BoopFace`, MIT). |
| Slider = HAI-Parameter | Die bis zu 3 sichtbaren Slider sind **die direkten Parameter des H.A.I.** (Steuerung von Tempo `schneller ↔ tiefer`, Informationsmenge `weniger ↔ mehr Input/Output` wie der Cognitive-Load-Slider aus `BIO-HAI`, sowie Atmosphäre `warm ↔ cold`). |
| Prior-Art-Basis | Vanilla SVG + kurzes Pointer/Focus-JS für Gekritzel-zu-Augen (`ADAPT`), native `<input type="range">` + CSS Custom Properties (`INTEGRATE`) sowie Wiederverwendung der Fonts, Service-Bindings und Wissensquellen aus `Agentfägig.de` und `Human-Agent-Interface` (`REUSE`). |
| Zusammenarbeit | Eine Frage pro Runde; nach jeder inhaltlichen Antwort ein OpenCode-Scout mit DeepSeek V4.1 Flash. |

## Hypothese und technische Abhängigkeiten

Samuel begründet den Wortrhythmus damit, dass kurze Wörter schneller erfasst werden
können. Die Übertragung auf buchstabenweise Animation ist noch ungeprüft; siehe
[Recherche](../research/SCOUT-SYNTHESIS.md). Diese Unsicherheit hebt die gewünschte
Gestaltungsrichtung nicht auf.

Cloudflare unterstützt Text-Streaming grundsätzlich. Ein gemessener End-to-End-Lauf
mit gewähltem Modell, Browser und gegebenenfalls Sprache fehlt noch.

## Offene Fragen

- Welches konkrete Ergebnis der Besucher am Ende von `What this is` erhält.
- Konkrete Zahlenwerte für Typewriter-Tempo und Verhalten bei langen Antworten.
- Modellprovider, Voice-Pipeline und konkrete Architektur (eigener Worker vs. Flotte).
- Abnahmekriterien und abschließende Bestätigung des gemeinsamen Verständnisses.

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
