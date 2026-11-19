# Was ich vorhabe — in meinen Worten

Stand: 19.11.2026 · Samuel Flg · Grundlage: `IDEA-TRANSKRIPT.txt` (eigenes Transkript),
`sketches/2026-11-12-agentfaehig.md` (Handskizze auf dem reMarkable),
`docs/DESIGN-DECISIONS.md` (meine eigenen Antworten aus dem Grilling)

---

## Der Plan

Es geht darum, dem Human Agent Interface ein Embodiment zu geben auf der
Webseite agentfähig.

Professionelles Vibe Coding.

Und so fängt es an — genau in dieser Reihenfolge:

> Ich will etwas bauen.
> Erst etwas planen.
> Dann will ich malen.
> Dann will ich es strukturieren und der letzte Schritt wird das Bauen sein.

Das war der Plan am Anfang, an einem Abend, mit Plaud und Notepad und dem
Guthaben, das verbraucht werden musste. Der Rest wird sich aus Texten ergeben,
die ich erst einmal lesen werde. Dann malen, dann scrapen und recherchieren,
was möglich ist. Danach geht es an die Implementierung oder an den Prozess.

So ist es immer: erst lesen, dann malen, dann strukturieren, **und der letzte
Schritt wird das Bauen sein.** Bauen ist das Letzte, nicht das Erste.

---

## Was ich will

Dass die Webseite selbst ein fetter Agent ist.

Dass das keine Webseite ist.

Sondern **du interagierst damit** — mit dem bestmöglichen Cloudflare Agent, der
mir möglich ist zu bauen.

> Voice, Text.
> Context, Skills.

Das sind die vier Säulen. Voice und Text sind der Eingang. Context und Skills
sind das, was den Agenten von einem Chatbot unterscheidet.

Und deshalb ist „eine Website mit einem Chatfenster" falsch. Das wäre eine
Webseite, die einen Agenten *hat*. Ich will keine Webseite **mit** einem Agenten.
Ich will eine Oberfläche, die **selbst** der Agent ist.

---

## Was das concret heißt

Die Seite ist nicht Dokument über etwas. Die Seite **ist** das, was der Agent
gerade ist.

Wenn ich ankomme, passiert zuerst fast nichts. Nach etwa fünf Sekunden wachen
Augen auf — **sanft**, nicht plötzlich — und schauen mich an. Nicht bedrohlich.
„Soft and not scary."

Dann schreibe ich einen Satz. Kein Formular, kein Enter-Taste-Denken, einfach
Text.

Die Antwort erscheint im Fokus. **Typewriter**, aber lebendig und pulsierend,
nicht bloß gleichmäßig — kurze Wörter schnell, bei längeren Wörtern ein
langsameres Zeichentempo. Das ist kein Effekt, das ist ein Gefühl: die Seite
antwortet, und man sieht ihr beim Antworten zu.

Und dann kommt der eigentliche Kern. Der Agent fragt mich, **wie er aussehen
soll**. Colour. Form. Output style. Das ist im Moment der allerwichtigste Teil
der ganzen Idee, weil er etwas tut, das normal ist und trotzdem keiner macht:
**der Agent fragt nach seinem eigenen Aussehen** — und dann verändert er die
Seite live, während ich zusehe. Kein Theme-Picker. Kein Einstellungsdialog.
Er fragt, ich antworte, und die Seite *ist danach anders*.

Regler: höchstens drei, mit „real time effects". Und das ist der Teil, der
mich am meisten elektrisiert — die Belegung des Reglers entsteht **im
Gespräch**. Ich sage irgendwas, und der Regler bewegt sich.

---

## Wie es sich anfühlen soll

Aus der Skizze, in meinen Worten:

**vibrant · alive · vivid** — das ist die Textur.
**welcomed**, engaging.
Kinder leicht.
Soft smooth, effortless, seamlessly.

Und ein Wort, das wichtig ist, weil es eine Warnung ist:

> **nicht bevormundend**

Die Seite darf mich nicht bevormunden. Das ist die Grenze. Alles andere ist
Verhandlung — wie warm oder kalt, wie präsent, wie schnell — aber die Seite
darf nie das Gefühl geben, dass sie mir etwas vorschreibt oder mich bedrängt.

Genau deshalb „nach Klick" beim Mikrofon: erst klicken, dann sprechen. Voice
ist im Erstbau, aber es ist **freiwillig**.

---

## Was im Hintergrund passiert

Der Front-Agent ist schnell und echt — kein simuliertes Denken, keine
Warteschleife mit „ich verstehe…" in Endlosschleife. Der antwortet mir.

Und dahinter laufen echte schlaue Agenten: **Analysing**, **Looking up**.
Deren Ergebnisse erscheinen **still** über State-Sync. Sie unterbrechen nicht.
Sie drängen sich nicht in den Vordergrund. Sie sind da, wenn ich sie anschaue.

Das ist „fast / slow" — die kleine Achse aus meiner Skizze. Und das ist der
Punkt, an dem die meisten Voice-Agents aufhören: bei denen ist nach der
Antwort Schluss. Bei mir läuft die Welt weiter, nur leiser.

Und der letzte Schritt, der offen ist und den ich mir wünsche: dass der Agent
**von sich aus weitersprechen** kann, wenn der langsame Pfad fertig ist. Dass
er nicht wartet, bis ich frage. Das ist T4, und ich habe noch keine Vorlage
dafür — aber ich habe eine Frage gefunden, die das kann.

---

## Wo das hinführt

Für `website`, `person`, `team`, `company` — der Agent kann für verschiedene
Adressen gebaut werden. Und: `plaud thoughts →`. Die Gedanken aus meinen
Plaud-Aufnahmen einspielen. Die Philosophie des HAI.

Das Motto steht schon: **wir machen das! — Agentfähig.de**

---

## Und was jetzt passiert

Ich bin kein erfahrener Entwickler. Das ist kein Selbstmitleid, das ist ein
Fakt, und der ändert, wie ich arbeite.

Deshalb ist der Ablauf, den ich mir jetzt vornehme, nicht „losbauen". Sondern:

**Erst suchen, was andere schon gebaut haben.** Bevor ich irgendwas baue,
will ich wissen, ob es das schon gibt. Bei den Augen mit Präsenz, bei der live
erzeugten Oberfläche, beim Weiterreden während der Hintergrundarbeit — für alle
drei habe ich inzwischen etwas gefunden, das offen lizenziert ist und das ich
übernehmen kann, statt es zu erfinden.

Und **erst messen, dann bauen.** Es gibt eine einzige Anforderung, an der die
ganze Idee hängt, und die ist bisher nur eine Behauptung: die Antwort in unter
einer Sekunde, auf Deutsch. Wenn ich das nicht messe, baue ich vielleicht auf
einem Weg, der stockt. Und ich habe jetzt nachgesehen: Workers AI hat aktuell
**kein deutsches TTS** im Katalog. Deutsch rein geht, deutsch raus ist die
offene Stelle.

> *Redaktioneller Nachtrag 19.11.2026:* Die Voice-Entscheidung der zweiten Runde
> lautet Englisch (`DESIGN-DECISIONS.md`, „Voice-Sprache"). Die deutsche
> Formulierung oben ist der Stand davor; Deutsch bleibt geparktes Feature.

Also: erst planen, dann malen, dann strukturieren — und der letzte Schritt wird
das Bauen sein.

---

## Herkunft der Zitate

Jedes wörtliche Zitat in diesem Dokument stammt aus einer Quelle im Repo. So
lässt sich prüfen, ob ich etwas erfunden oder umgedeutet habe.

| Zitat | Quelle |
|---|---|
| „Es geht darum dem Human Agent Interface ein Embodiment zu geben auf der Webseite agentfähig" | `IDEA-TRANSKRIPT.txt`, 00:00:57 |
| „Professionelles Vibe Coding" | `IDEA-TRANSKRIPT.txt`, 00:00:57 |
| „Ich will etwas bauen. / Erst etwas planen. / Dann will ich malen." | `IDEA-TRANSKRIPT.txt`, 00:00:43–00:00:48 |
| „der letzte Schritt wird das Bauen sein" | `IDEA-TRANSKRIPT.txt`, 00:00:50 |
| „Dass die Webseite selbst ein fetter Agent ist" | `IDEA-TRANSKRIPT.txt`, 00:01:21 |
| „Dass das keine Webseite ist" | `IDEA-TRANSKRIPT.txt`, 00:01:29 |
| „Voice, Text. Context, Skills." | `IDEA-TRANSKRIPT.txt`, 00:01:46–00:01:50 |
| „nicht bevormundend" | Skizze, Abschnitt 3 „Gefühl und Textur" |
| „vibrant · alive · vivid", „welcomed", „kinder leicht" | Skizze, Abschnitt 3 |
| „soft and not scary" | Skizze, Abschnitt 4 „Screens: Ruhe und Bewegung" |
| „after 5 seconds some eyes wake up and 'look at the user'" | Skizze, Abschnitt 2 „Vom User zum Agenten" |
| „colour · form · output style" | Skizze, Abschnitt 1 „Einstieg" |
| „max 3", „real time effects" | Skizze, Abschnitt 5 „Screens: Input und Slider" |
| „fast / slow" | Skizze, Abschnitt 7 „Was der Agent können muss" |
| „under 1 sec even with TTS if possible" | Skizze, Abschnitt 7 |
| „wir machen das! — Agentfähig.de" | Skizze, Abschnitt 8 „Meta und Philosophie" |
| „for website / person / team / company" | Skizze, Abschnitt 2 |
| „plaud thoughts →" | Skizze, Abschnitt 8 |
| Augen wachen nach 5 s auf, Typewriter im Fokus | `docs/DESIGN-DECISIONS.md`, Entscheidung vom 19.11.2026 |
| Typewriter „lebendig und pulsierend" | `docs/DESIGN-DECISIONS.md` |
| Mikrofon „nach Klick" | `docs/DESIGN-DECISIONS.md` |
| Regler: Belegung entsteht im Gespräch | `docs/DESIGN-DECISIONS.md` |
| Front-Agent echt, dahinter Analysing/Looking-up, still | `docs/DESIGN-DECISIONS.md` |
| Vorherige Leseposition behalten — abgelehnt | `docs/DESIGN-DECISIONS.md` |

Alles, was **nicht** wörtlich Zitat ist, ist Formulierung von mir für dieses
Dokument — die Sache, nicht der Wortlaut.

---

*Transkript und Skizze liegen im Repo, damit niemand — auch ich nicht — später
behaupten kann, es sei immer eine Website mit einem Chatbot daneben gewesen.
Siehe [`IDEA-TRANSKRIPT.txt`](../IDEA-TRANSKRIPT.txt) und
[`sketches/2026-11-12-agentfaehig.md`](../sketches/2026-11-12-agentfaehig.md).*
