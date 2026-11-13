# Handoff — Gesprächsführung des Website-Agenten

Status: Anforderungen. Kein Code. Entscheidungen in Abschnitt 8 gehören dem
Owner und werden nicht vom Umsetzenden getroffen.

## 1. Problem

Ein Besucher soll im Gespräch zu einem von mehr als zehn Zielen finden
(8 Domains, hai-mcp, GitHub-Repos, Website-Agent als Produkt, Kontakt zum
Creator), ohne Menüwand, ohne starren Wizard und ohne Verkaufston.

Vorarbeit: docs/visual-exploration/03-pathway-flow.md, sketches/ (Zeilen 30–53),
Prior-Art-Notiz (OpenAI Handoffs, Anthropic Routing, NN/g Progressive Disclosure).

## 2. Leitgröße

Die Aufmerksamkeit des Besuchers ist knapp. Jeder Turn zeigt so wenig wie
möglich und nie mehr als ein Ziel.

## 3. Gesprächsmechanik

1. **Start mit drei Grundströmen:** „What this is", „creator", „product for X".
   Kein weiteres Ziel ist anfangs sichtbar.
2. **Bridge:** Der Agent beantwortet die aktuelle Frage in ein bis zwei kurzen
   Sätzen.
3. **Höchstens zwei Fäden**, in der Sprache des Besuchers, und nur wenn seine
   Nachricht keine Richtung enthält. Wer konkret fragt, bekommt die Antwort
   ohne Anschlussangebot.
4. **Fäden als Chips** unter der Antwort, nicht als Frage im Antworttext. Die
   Antwort endet nicht mit „Willst du …?".
5. **Eine Wegpunkt-Karte bei klarer Absicht:** genau ein Ziel wird eingeblendet.
6. **Zurücktreten:** Wechselt der Besucher das Thema, verschwindet die Karte
   ohne Kommentar.

## 4. Architektur

Änderung gegenüber der Prior-Art-Entscheidung (zweistufiges Routing):

- **Ein Agent**, alle Wegpunkte mit je ein bis zwei Sätzen Beschreibung im
  Prompt, plus ein Werkzeug `show_waypoint(id)`, das die Karte einblendet.
- Begründung: Zehn Ziele passen in einen Prompt. Eine Übergabe an
  Spezialisten kostet pro Besucher zusätzliche Latenz und Tokens, ohne dass
  ein Bereich bisher eigenes Wissen oder eigene Werkzeuge braucht.
- Eine zweite Stufe kommt erst, wenn ein Bereich das nachweislich braucht.
  Kandidat: die Produktanfrage.
- Die Wegpunkte liegen als Datenliste vor (id, Titel, Beschreibung, URL), nicht
  verstreut im Prompt-Text. Ein neues Ziel ist ein neuer Eintrag.

## 5. Weg ohne Gespräch

Eine schlichte Linkzeile im Fuß der Seite führt zu allen Zielen. Sie ist die
Rückfallebene für Besucher, die nicht chatten wollen, und für Suchmaschinen.

## 6. Nicht-Ziele

- Kein Navigationsmenü, kein Link-Baum mit zehn Buttons im Hauptbereich
- Kein mehrstufiger Wizard
- Keine Multi-Agent-Übergaben in dieser Fassung
- Keine Lead-Erfassung, kein Formular im Gespräch
- Mehr als eine Wegpunkt-Karte gleichzeitig

## 7. Abnahme

1. Beim Start sind genau die drei Grundströme sichtbar.
2. Jedes der Ziele ist von jedem Grundstrom aus in höchstens zwei Turns
   erreichbar. Geprüft mit je einem festen Testdialog pro Ziel.
3. Kein Turn zeigt mehr als zwei Fäden und mehr als eine Karte.
4. Auf eine konkrete Frage folgt eine Antwort ohne Fäden.
5. Nach einem Themenwechsel ist die vorige Karte nicht mehr sichtbar.
6. Die Fußzeile enthält alle Ziele und funktioniert ohne JavaScript.
7. Geprüft in Handybreite.

## 8. Messung

Pro Gespräch zwei Werte loggen, ohne personenbezogene Daten:

- Anzahl Turns, bis die erste Karte erscheint
- ob die Karte angeklickt wurde, und welche

Nach zwei bis vier Wochen: Ziele, die nie erscheinen oder nie geklickt werden,
prüfen. Entweder ist die Beschreibung schwach oder das Ziel gehört nicht hinein.

## 9. Offene Entscheidungen des Owners

1. Die genaue Liste der Wegpunkte mit Titel, Beschreibung und URL.
2. Wofür „X" im dritten Grundstrom steht.
3. Token-Budget pro Gespräch und was passiert, wenn es erreicht ist.
4. Ob das Logging aus Abschnitt 8 gewünscht ist und wo es liegt.
5. Sprache: Deutsch, Englisch oder nach Besucher.

## 10. Vorschlag für den Missionsvertrag

- Erstes Hinsehen des Owners: nach der Wegpunkt-Liste und dem Prompt-Entwurf,
  vor dem Code.
- Ein Kriterium verlangt einen echten Lauf: die Testdialoge aus Abnahme 2
  gegen die laufende Seite, in Handybreite, vom Owner selbst angesehen.
- Deploy macht der Owner.
