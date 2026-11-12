# Abgleich: Designentscheidungen gegen Technik

Stand: 12.11.2026 · HAI-Mission `M-20261112T230610-fd237a98`

Verglichen werden [`docs/DESIGN-DECISIONS.md`](../docs/DESIGN-DECISIONS.md),
[`docs/PROJECT.md`](../docs/PROJECT.md) und
[`research/SCOUT-SYNTHESIS.md`](../research/SCOUT-SYNTHESIS.md) (Commit `439b3d3`)
mit [`CLOUDFLARE_MACHBARKEIT.md`](CLOUDFLARE_MACHBARKEIT.md).

## Ergebnis

Keine der acht bestätigten Designentscheidungen stößt auf ein technisches
Hindernis. Zwei davon entschärfen sogar die einzige offene technische Frage:
Weil Text immer mitgeliefert wird und „unter einer Sekunde mit Sprachausgabe"
in `PROJECT.md` als Wunschziel steht, hängt der erste Ablauf nicht mehr an der
Sprach-Latenz. Neu aufgetaucht ist dafür eine Frage, die bisher in keinem
Dokument steht: wie Typewriter und Sprachausgabe zueinander laufen.

Alles hier ist Zuarbeit. Modell, Hosting und Architektur entscheidet Samuel;
nichts davon gilt als bestätigt.

## Bestätigte Entscheidungen

| Entscheidung | Technische Folge | Stand |
|---|---|---|
| Der Mensch gibt den Intent, der Agent reagiert | Der Agent muss nie von sich aus sprechen. Damit entfällt die offene Frage aus der Machbarkeit, ob er nachträglich reden kann, wenn ein Hintergrund-Agent fertig wird: späte Ergebnisse können still über die Zustands-Synchronisation erscheinen. | passt, vereinfacht |
| Präsenz vor dem Intent: Augen, sanfte Bewegung | Reines Frontend. Vor dem ersten Intent ist keine Verbindung zum Agenten nötig. | passt |
| Ohne hörbaren Ton: Antwort auch als Text | Text ist der Grundweg, Stimme die Zugabe. Text-Streaming ist belegt (Scout-Synthese, Abschnitt 2). Für Text ist „unter 1 s bis zum ersten Wort" unkritisch, weil Spracherkennung und Sprachausgabe wegfallen. | passt, entschärft T2 |
| Aktuelle Antwort sichtbar, ältere beim Scrollen | Der Verlauf muss gespeichert sein. Das Agents SDK nennt Nachrichten-Persistenz für Chat-Agenten (Worker-Bericht, nicht gegengeprüft). Jeder Agent hat ohnehin eigenen SQLite-Speicher. | passt |
| Neue Antwort bekommt den Fokus | Reines Frontend. | passt |
| Typewriter lebendig und pulsierend | Das Modell liefert Bruchstücke von Wörtern in unregelmäßigen Abständen. Für einen eigenen Rhythmus muss der Browser den Text puffern und selbst takten. Das ist Frontend, braucht aber eine Regel für den Fall, dass der Puffer leerläuft. | passt, mit Folgefrage |
| Wortrhythmus nach Wortlänge | Wie oben: setzt voraus, dass ganze Wörter vorliegen, bevor sie erscheinen. Kostet pro Wort eine kleine Verzögerung. | passt, mit Folgefrage |
| Eine Frage pro Runde, Scout nach jeder Antwort | Arbeitsweise, keine Technik. | — |

## Offene Designfragen: was die Technik dazu sagt

| Offene Frage aus `DESIGN-DECISIONS.md` | Technischer Befund |
|---|---|
| Eingabekanäle, „Text zuerst, Mikrofon nach Klick" | Browser geben das Mikrofon nur nach ausdrücklicher Erlaubnis des Besuchers frei, und Ton spielt in der Regel erst nach einer Nutzeraktion. „Mikrofon nach Klick" ist damit der technisch naheliegende Weg. Das ist allgemeines Browser-Verhalten und in dieser Mission nicht nachgeschlagen. |
| Fokuswechsel beim ersten Text oder bei vollständiger Antwort | Beides geht. Streaming liefert den Zeitpunkt des ersten Textes, das Ende der Antwort ist ebenfalls ein eigenes Ereignis. |
| Verhalten bei Streaming-Pausen und langen Antworten | Hier liegt die Folgefrage des Typewriters. Der Sprach-Client meldet die Zustände „denkt" und „spricht"; für reinen Text müsste das Frontend Pausen selbst erkennen. |
| Belegung der bis zu drei Slider | Technisch frei: Jeder Reglerwert ist ein Feld im Agent-Zustand und kommt in Echtzeit bei allen verbundenen Browsern an (geprüft). |
| Modellprovider, Voice-Pipeline, Architektur | Vorschlag in `CLOUDFLARE_MACHBARKEIT.md` und `UPSTREAM_SEARCH.md`. Nicht entschieden. |
| Abnahmekriterien | Der Sprach-Client liefert je Wechsel Messwerte (`first_audio_ms` und weitere). Daraus lassen sich Latenz-Kriterien direkt ableiten. |

## Neu: Typewriter und Stimme laufen nicht von selbst synchron

Die Sprach-Pipeline liest satzweise vor, sobald ein Satz fertig ist. Der
Typewriter soll dagegen nach Wortlänge pulsieren. Ohne Abstimmung laufen Text
und Stimme auseinander: Die Stimme ist mal voraus, mal hinterher. Ob das stört
oder gerade lebendig wirkt, ist eine Designfrage. Technisch gibt es drei Wege:
Text führt und Stimme folgt, Stimme führt und Text folgt, oder beide laufen
unabhängig. Ob die Pipeline Zeitmarken je Wort liefert, steht in keiner
geprüften Quelle.

## Wo Scout-Synthese und Machbarkeit sich ergänzen

- **Sprachausgabe auf Cloudflare:** Die Scout-Synthese lässt offen, ob es eine funktionierende Pipeline gibt. Die Machbarkeit belegt sie: `withVoice` im Agents SDK, als Beta markiert.
- **Messung fehlt:** Beide Dokumente kommen zum selben Schluss. Ein gemessener Lauf mit gewähltem Modell und Browser ist der nächste Schritt vor jeder Architekturentscheidung.
- **Kein Widerspruch gefunden.**

## Fragen an Samuel für die nächste Grilling-Runde

1. Reicht für den ersten Ablauf Text mit Typewriter, und Stimme kommt danach dazu? Das würde die Latenzfrage aus dem ersten Bau herausnehmen.
2. Wenn ein Hintergrund-Agent später etwas findet: Darf das still als Text erscheinen, oder zählt das schon als Initiative des Agenten?
3. Typewriter und Stimme: Wer führt?
4. Was soll der Typewriter tun, wenn das Modell stockt — stehen bleiben, langsamer werden, oder ein eigenes Zeichen geben?
