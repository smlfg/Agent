# KI-Avatare — Takeaways für Agentfähig

Stand: 25.11.2026  
Quelle: [Transkript `ai-avatare.txt`](ai-avatare.txt)  
Status: **Arbeitsnotiz und Produkt-Hypothesen — keine neue Designentscheidung und keine Build-Freigabe.**

> **Kernaussage für Agentfähig:** Nicht ein möglichst menschlicher Avatar macht
> das Projekt stark. Entscheidend ist ein glaubwürdiges Zusammenspiel von
> Verhalten, Antwort und Kontrolle: Die Oberfläche zeigt Präsenz, ohne den
> Menschen zu bedrängen oder etwas vorzutäuschen.

Der Talk liefert dafür Anregungen und Praxisbeispiele, aber keinen belastbaren
Wirkungsnachweis für Agentfähig. Aussagen wie „Avatare erhöhen Vertrauen“ oder
„Avatare senken Hemmschwellen“ müssen deshalb im eigenen Kontext geprüft werden.

## 1. Präsenz braucht kein menschliches Gesicht

Im Talk werden Avatare vor allem mit sozialer Präsenz, Bindung und niedrigeren
Hemmschwellen begründet. Dafür ist kein fotorealistischer Mensch nötig.

**Für Agentfähig:** Die bereits entschiedenen **reaktiven Augen ohne Gesicht**
sind eine passende, reduzierte Form von Embodiment. Sie können Aufmerksamkeit
und Reaktion zeigen, ohne einen virtuellen Menschen zu spielen. Das passt zu
„soft and not scary“ und zur Idee, dass die Website selbst der Agent ist.

**Konsequenz:** Keine zusätzliche menschliche Avatar-Figur einführen. Die
Qualität der vorhandenen Augen und ihrer Reaktionen ist wichtiger als mehr
visuelle Detailtiefe.

## 2. Verhalten schlägt Maximalrealismus

Der Talk betont Mimik, Gestik und Verhalten stärker als fotorealistische
Darstellung. Ein hochwertiges Bild mit unpassendem Verhalten wirkt unglaubwürdig.

**Für Agentfähig:** Die entscheidende Designarbeit liegt in:

- Blick- und Fokusführung,
- sanften Übergängen zwischen Ruhe und Aktivität,
- passendem Timing von Augen, Typewriter und Voice,
- nachvollziehbaren Reaktionen auf Eingabe, Unterbrechung und Fehler,
- einem ruhigen Verhalten, wenn im Hintergrund weitere Agenten arbeiten.

**Konsequenz:** Erst Zustände und Übergänge sauber machen, dann weitere Effekte.
Kein „Uncanny Valley“ durch besonders echte Grafik erzeugen.

## 3. Embodiment muss einen Interaktionsgewinn liefern

Als Orientierung nennt der Talk zwei Achsen: **Emotions-/Beziehungsbedarf** und
**Interaktionskomplexität**. Bei einfachen Faktenfragen kann ein Chatbot oder
Text genügen; bei komplexeren oder persönlicheren Situationen kann zusätzliche
Präsenz hilfreich sein.

**Für Agentfähig:** Der Nutzen liegt nicht darin, jede Antwort niedlich zu
animieren. Die Augen sollen helfen, eine unbekannte Interaktionsform zu
verstehen:

- Ist der Agent bereit?
- Reagiert er auf mich?
- Antwortet er gerade?
- Arbeitet noch etwas im Hintergrund?
- Kann ich eingreifen?

Bei reinen Informationen bleibt der Inhalt wichtiger als die Animation.

## 4. Denken, Sprechen und Zeigen müssen zusammenpassen

Der Talk beschreibt drei Säulen: **Denken, Sprechen und Zeigen**. Ein gutes
Sprachmodell allein erzeugt noch keinen guten Avatar.

**Für Agentfähig:** Diese Säulen entsprechen bereits vorhandenen Bausteinen:

| Säule im Talk | Agentfähig |
| --- | --- |
| Denken | Front-Agent plus On-Demand Agents |
| Sprechen | Text und Typewriter zuerst; Voice als eigenes Modul |
| Zeigen | Augen, Fokus, visuelle Zustände und Slider-Projektion |

Entscheidend ist eine gemeinsame, nachvollziehbare Zustandslogik. Augen, Text
und Audio dürfen nicht unterschiedliche Dinge behaupten — etwa „denkt nach“,
während bereits eine Antwort angezeigt wird.

**Konsequenz:** Reaktionen als Projektion des tatsächlichen Agentenzustands
verstehen, nicht als unabhängige Dekoration. Dies ist eine Prüfregel für die
bestehende Architektur, keine neue Technikentscheidung.

## 5. Vertrauen entsteht durch Ehrlichkeit und Kontrolle

Vertrauen ist im Talk ein zentrales Thema. Daraus folgt nicht, dass ein
menschliches Gesicht automatisch vertrauenswürdig ist.

**Für Agentfähig:** Vertrauen sollte durch konkretes Verhalten entstehen:

- Der Agent ist eindeutig als KI erkennbar.
- Sichtbare Zustände entsprechen dem realen Systemverhalten.
- „Ich weiß es nicht“ ist besser als eine selbstsichere falsche Antwort.
- Text bleibt eine vollwertige Alternative zu Voice.
- Das Mikrofon wird erst nach bewusstem Klick aktiviert.
- Bewegung kann pausiert werden; Unterbrechen bleibt möglich.
- Hintergrundarbeit drängt sich nicht ungefragt in den Vordergrund.

Das passt direkt zur bestehenden Grenze **„nicht bevormundend“**.

## 6. Freundlichkeit darf nicht in Manipulation kippen

In der Diskussion werden dauerhafte Freundlichkeit, Emotionserkennung und
personalisierte Avatare auch kritisch betrachtet.

**Für Agentfähig:** „Warm“ bedeutet nicht, dass der Agent immer zustimmt oder
nur das sagt, was der Mensch hören möchte. Er darf nachfragen, widersprechen,
Grenzen nennen und unsicher sein.

**Bewusst nicht übernehmen:**

- Emotions- oder Wahrheitsanalyse aus Mimik, Stimme oder Gestik,
- manipulative Personalisierung,
- künstliche Nähe, die einen Menschen vortäuscht,
- zusätzliche Sensorik ohne eigenen, freigegebenen Nutzen.

## 7. Autonomie braucht explizite Grenzen

Der Talk stellt die Frage, was ein virtueller Avatar entscheiden darf. Diese
Frage ist für Agentfähig wichtiger als die Optik.

**Für Agentfähig:** Der Agent darf seine Präsenz innerhalb des vorgesehenen
Modells verhandeln — etwa Gestalt und Interaktionsstil über die bestehenden
Slider und den gemeinsamen Zustand. Daraus folgt keine allgemeine Handlungs-
 oder Entscheidungsfreiheit.

**Zu prüfen:**

- Jede sichtbare Veränderung ist auf erlaubte Parameter begrenzt.
- Externe oder folgenreiche Aktionen benötigen einen klaren Waypoint und eine
  ausdrückliche Bestätigung.
- Ein Gespräch über Gestalt ist keine Freigabe für andere Aktionen.
- Der Mensch kann den gewählten Zustand nachvollziehen und korrigieren.

## 8. Ein Avatar rettet kein schwaches Fundament

Die Praxisbeispiele zeigen, dass Wissensbasis, Antwortqualität, Sprache,
Latenz und Systemintegration vor der Avatar-Wirkung stehen. Im Talk wird dafür
das Bild verwendet, nicht mit der Fassade vor dem Fundament zu beginnen.

**Für Agentfähig:** Mehr visuelle Präsenz kompensiert weder falsche Antworten
noch einen unzuverlässigen Provider- oder Voice-Pfad. Der echte Agentenpfad,
klare Inhalte, Fehlerverhalten und Messung haben Vorrang vor zusätzlichen
Animationen oder neuen Avatar-Funktionen.

## 9. Wirkung prüfen statt aus dem Talk ableiten

Der Talk selbst weist auf begrenzte Evidenz und kontextabhängige Wirkungen hin.
Für Agentfähig sind daher keine pauschalen Aussagen wie „Augen erhöhen
Vertrauen“ belegt.

Im bereits geplanten Fremdtest können die folgenden Fragen als **Vorschlag**
aufgegriffen werden:

1. Verstehen Besucher ohne Erklärung, was die Augen gerade signalisieren?
2. Wirken sie aufmerksam und freundlich — oder beobachtend und unangenehm?
3. Hilft die Präsenz beim Einstieg in `What this is`, oder lenkt sie vom Inhalt ab?
4. Erkennen Besucher jederzeit, dass sie mit einer KI interagieren?
5. Finden sie Textalternative, Unterbrechen und „Pause motion“ selbstständig?
6. Können sie nach dem Besuch benennen, was der Agent darf und was nicht?

Technische und erlebbare Qualität bleiben getrennt: Latenz und Fehlerfreiheit
messen; Verständlichkeit, Präsenz und Vertrauen durch Beobachtung und gezielte
Nachfragen prüfen. Kleine Tests liefern Hinweise, keine universelle Wahrheit.

## 10. Konkrete Integration: Was ich wo einbauen würde

Ich würde den Talk **nicht als neues Avatar-Modul** integrieren. Die vorhandene
Living Surface enthält bereits die richtigen Integrationspunkte. Dort würde ich
Verhalten, Grenzen und Prüfungen präzisieren.

### A · Zuerst: Fehlerzustand Ende zu Ende sichtbar machen

**Konkreter Befund im aktuellen Code:** `RESPONSE_ERROR` setzt die Phase in
`src/state/store.js` derzeit auf `idle`. Der Text meldet den Fehler zwar ehrlich,
aber die Augen kehren damit sofort in ihren normalen Ruhezustand zurück. Genau
hier entsteht sonst eine Lücke zwischen gezeigtem und tatsächlichem Zustand.

**Kleinster Code-Slice:**

| Datei | Konkrete Änderung |
| --- | --- |
| `src/state/store.js` | Eine Phase `error` ergänzen; `RESPONSE_ERROR` führt zu `error` statt direkt zu `idle`. `INPUT` und `SUBMIT` ermöglichen den normalen Wiedereinstieg. |
| `src/presence/presence.js` | `error` auf einen eigenen Augenzustand abbilden statt auf den Idle-Fallback. |
| `src/presence/eye-motion-profiles.js` | Ein ruhiges, neutrales `error`-Profil ergänzen — kein trauriges Gesicht, kein aggressives Rot, keine hektische Animation. |
| `src/conversation/conversation.js` | Die vorhandene verständliche Fehlermeldung und `aria-live` behalten; keine künstliche Denkpause oder zusätzliche Animation ergänzen. |
| `tests/store.test.js`, `tests/eye-motion.test.js`, `tests/remoteAgent.test.js` | Fehlerzustand, ungültige/späte Events und Wiedereinstieg nach einem neuen Input prüfen. |

**Abnahme:** Bei einer echten fehlgeschlagenen Antwort bleiben Fehlertext und
ruhiger Fehlerzustand sichtbar. Die nächste Eingabe führt kontrolliert zurück zu
`listening` beziehungsweise `thinking`. Reduced Motion zeigt denselben Zustand
ohne Bewegung. Kein neues Modul, kein neuer Provider, kein visueller Umbau.

### B · Danach: Die vorhandenen Augen an einen eindeutigen Zustandsvertrag binden

`src/main.js` bleibt die Verdrahtung. `src/state/store.js` bleibt die Quelle der
Gesprächsphase; `src/presence/presence.js` projiziert sie. Ich würde **keinen
zweiten Avatar-State** einführen.

| Zustand | Darf nur eintreten, wenn … | Sichtbare Bedeutung |
| --- | --- | --- |
| `dormant` | noch kein `AWAKE` erfolgt ist | keine aktive Aufmerksamkeit |
| `listening` | der Besucher tatsächlich Text eingibt | Blick und Fokus gehen zur Eingabe |
| `thinking` | ein echter Agentenaufruf läuft | ruhiges Warten, keine erfundene Arbeit |
| `speaking` | der Typewriter tatsächlich Antworttext ausgibt | Aufmerksamkeit auf die Antwort |
| `adapting` | ein validierter Surface-Patch etwas verändert hat | kurze Bestätigung der realen Anpassung |
| `idle` | die Seite bereit für die nächste Handlung ist | ruhige, offene Präsenz |
| `error` | der aktuelle Aufruf tatsächlich fehlgeschlagen ist | zurückhaltener, klar unterscheidbarer Fehlerzustand |

Die Verhaltensprofile bleiben in `src/presence/eye-motion-profiles.js`; Blick-
und Fokusführung bleiben in `src/presence/gaze.js` und `src/presence/idle.js`.
Integriert wird hier also vor allem eine **getestete Bedeutung pro Zustand**,
keine zusätzliche Grafik.

### C · Autonomie: Die vorhandene Whitelist als Grenze verwenden

Hier ist schon viel Richtiges vorhanden:

- `src/surface/surface-state.js` erlaubt nur die vier bekannten Dimensionen und
  validiert beziehungsweise clamped jeden Patch.
- `src/surface/surface-adapter.js` entfernt unsichere beziehungsweise unbekannte
  Modell-Patches und führt weder rohes CSS noch JavaScript aus.
- `src/surface/surface-controls.js` bietet bereits Undo und Reset.

**Konkrete Integration:** Diese Grenzen behalten und in
`tests/adaptive-surface.test.js` sowie `tests/surface.test.js` ausdrücklich als
Sicherheitsvertrag abnehmen. Ein `<surface>`-Block darf ausschließlich die
Oberfläche verändern. Buchungen, Kontaktaufnahmen, Käufe oder andere externe
Aktionen gehören **nicht** in diesen Kanal und werden durch ein Gespräch über
Aussehen niemals freigegeben. Keine neuen Slider und keine neue Aktionslogik aus
diesem Talk.

### D · Gesprächsgrenzen: An zwei vorhandenen Stellen ergänzen

Für die verbale Rolle des Agenten würde ich die bereits vorhandenen Regeln
nutzen statt einen zusätzlichen „Avatar-Prompt“ zu bauen:

- `src/agent/prompt.js` in `DEFAULT_RULES`: Regeln, die auch ohne geladene
  Persona immer gelten.
- `src/agent/persona.json` unter `rules.hard` und `exemplars`: konkrete gute und
  schlechte Antworten. Die Datei bleibt dabei als DRAFT gekennzeichnet, bis
  Samuel sie freigibt.

Zu ergänzen wären vier kurze Regeln:

1. Kein Anspruch, ein Mensch, Mitarbeiter oder virtueller Kollege zu sein.
2. Keine Behauptung, Gefühle oder Wahrhaftigkeit aus Text, Stimme oder Mimik zu
   erkennen.
3. Eine gewünschte Gestaltänderung ist keine Freigabe für andere Aktionen.
4. Wärme bedeutet nicht automatische Zustimmung; Unsicherheit und Widerspruch
   bleiben erlaubt.

Die vorhandenen Textmetriken unter `src/metrics/` dürfen weiterhin die
Oberfläche anpassen, aber keine diagnostischen Aussagen über Besucher erzeugen.
Passende Prüfpunkte sind `tests/style.test.js`, `tests/knowledge.test.js` und die
bestehenden Metriktests.

### E · Kontrolle und Voice: Vorhandenes verifizieren, nicht neu bauen

- **Bewegung:** `src/presence/presence.js` enthält bereits Pause/Resume und
  Reduced Motion.
- **Voice:** `src/main.js` und `src/voice/mic.js` behalten den bewussten Klick vor
  der Mikrofonfreigabe.
- **Unterbrechen:** `src/conversation/conversation.js` enthält bereits den
  Abbruch und eine kurze Bestätigung.
- **Korrigieren:** `src/surface/surface-controls.js` enthält Undo und Reset.

Dafür braucht es aus dem Talk keine neue Funktion. Ich würde die vorhandenen
Tests (`tests/mic.test.js`, `tests/interrupt.test.js`,
`tests/keyboard-viewport.test.js`) und die Browserabnahme nutzen. Kein
automatischer Gesprächsbeginn und kein Wechsel der Voice-Architektur.

### F · Fremdtest: In den vorhandenen Plan einsortieren

Kein zweites Testdokument und keine neue A/B-Studie. Die Fragen aus Abschnitt 9
passen größtenteils in [`tech/FREMDTEST-PLAN.md`](../tech/FREMDTEST-PLAN.md):

| Takeaway | Vorhandener Ort im Fremdtest-Plan |
| --- | --- |
| Zustände der Augen verstehen | §7, Fragen 1, 3 und 4 |
| Freundlich oder unheimlich | S10 und E8 |
| Hilft Präsenz oder lenkt sie ab | T2 und S4; zusätzlich notieren, ob Blick/Aufmerksamkeit bei Augen oder Antwort bleibt |
| Kontrolle finden | T4/T6, S6/S8 sowie P4/P5 |
| Können und Grenzen benennen | §7, Frage 2 |

**Einzige inhaltliche Lücke, die ich dort ergänzen würde:**

> „Hast du das als Mensch, KI oder etwas anderes wahrgenommen? Woran?“

Damit wird KI-Erkennbarkeit geprüft, ohne vorab eine gewünschte Antwort
vorzugeben. Die übrigen sechs Fragen aus dieser Notiz müssen nicht als zusätzlicher
Fragenkatalog an eine ohnehin kurze Testsitzung gehängt werden.

### Was ich bewusst noch nicht integrieren würde

Einen Zustand `background` erst einführen, wenn dafür echte Ereignisse der
späteren On-Demand-Agenten vorliegen. Solange der aktuelle Store nur `dormant`,
`idle`, `listening`, `thinking` und `speaking` kennt, wäre eine sichtbare
„Ich arbeite im Hintergrund“-Präsenz nur Simulation. Dasselbe gilt für TTS,
Hologramme oder zusätzliche Modalitäten.

## Was wir ausdrücklich nicht aus dem Talk übernehmen

- kein fotorealistischer Mensch als neues Zielbild,
- kein Avatar als Ersatz für menschliche Beziehungen,
- keine Hologramme, Service-Roboter oder neue Hardware,
- keine permanente Begrüßung oder ungefragte Gesprächsführung,
- keine zusätzlichen Slider, Agenten oder Modalitäten als Folge dieser Notiz,
- keine Annahme, dass mehr Realismus oder mehr Animation automatisch besser ist.

## Kleinster sinnvoller nächster Schritt

**Nur Slice A:** den echten Fehlerzustand von `store.js` bis zur Augenprojektion
und zu den Tests führen. Das ist die kleinste konkrete Verbesserung aus dem Talk,
weil sie Vertrauen durch wahrheitsgemäße Präsenz statt durch mehr Realismus
schafft. Die übrigen Punkte bleiben Vorschläge und starten nicht automatisch.

## Stellen im Talk zur späteren Nachverfolgung

| Zeit | Impuls |
| --- | --- |
| 00:04:25 | Beziehungsbedarf und Interaktionskomplexität als Einordnungsachsen |
| 00:06:15 | Verhalten und Passung statt Maximalrealismus |
| 00:06:44 | Denken, Sprechen und Zeigen gemeinsam orchestrieren |
| 00:07:41 | Entscheidungsrechte und Verhaltensregeln des Avatars klären |
| 00:08:15 | Technik, Uncanny Valley, Ethik, Recht, Vertrauen und Akzeptanz |
| 00:11:15 | Anwendungsfall definieren, Basis schaffen, Interaktion iterativ gestalten |
| 00:45:21 | Kleine Verhaltensdetails wie Blinzeln verändern die Wirkung |
| 00:51:41 | Fundament und Plattform vor der Avatar-Fassade |
| 01:05:23 | Echtheit, Kennzeichnung und kopierbare bzw. gefälschte Avatare |

Projektbezug: [Vision](VISION-samuel.md),
[bestätigte Designentscheidungen](DESIGN-DECISIONS.md) und
[Projektstand](PROJECT.md). Diese Dokumente bleiben maßgeblich; die vorliegende
Notiz verändert deren Entscheidungen nicht.
