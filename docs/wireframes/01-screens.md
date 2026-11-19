# 01 · Screens WF-01 bis WF-12

Für alle Screens gelten die Regeln aus [`00-flows-and-viewports.md`](00-flows-and-viewports.md)
§6 und [`02-components.md`](02-components.md). Hier stehen nur die
screenspezifischen Festlegungen.

**Die zwölf IDs sind Prüfanker, keine zwölf Bausteine.** Es gibt genau eine
Fläche. WF-03/04/05/06/07/09/10/12 sind Zustände dieser Fläche. Wer daraus zwölf
Seiten baut, bricht ADR-0002.

**Interaktionen** stehen je Screen unter „Eingaben" (was der Besucher tun kann)
und „Systemfeedback" (was das System tut). „Zustandsvarianten" nennt die
Abweichungen; die vollständige Matrix steht in [`03-state-matrix.md`](03-state-matrix.md).

**Globale Regeln, die nicht wiederholt werden:**

- Keine Route, keine Kopfzeile, kein Menü. Navigation ist Scrollen und Tab.
- Kein Erfolgs-Toast. Die Wirkung selbst ist das Feedback.
- Kein Modal für Fehler oder Hintergrund-Ergebnisse. Alles inline.
- Kein Autofokus, kein Ton vor der ersten Nutzeraktion.
- Keine Farbe als einziger Bedeutungsträger.
- Kein erfundener Lade-Text („Ich verstehe …", „Einen Moment …").
- Jede Fehlermeldung nennt eine ausführbare Aktion und erhält die Eingabe.

## Mobile-Anatomie (gilt für alle Screens)

```
+---------------------------+
| Status        [Pause]     |
|                           |
|        ( o     o )        |
|        (   ~~~    )       |
|                           |
|  Aktuelle Antwort         |
|  ...                      |
|                           |
|  ---------------------    |
|  Hintergrund · 1   [>]    |
|                           |
|  [ Regler, falls da ]     |
|                           |
| +-----------------------+ |
| | Eingabe            -> | |
| +-----------------------+ |
| [ Mikrofon ]              |
+---------------------------+
```

`[Pause]` ist die WCAG-2.2.2-Steuerung für die Dauerbewegung der Augen
(C-15). Sie ist ein leiser Textknopf, kein Einstellungsmenü, und bleibt auch
auf kleinen Viewports erreichbar.

Reihenfolge, Touch-Ziele und Safe-Area sind in
[`02-components.md`](02-components.md) §5 festgelegt. Die Augen schrumpfen,
verschwinden aber nicht.

---

## WF-01 · Ankommen

| Feld | Wert |
|---|---|
| Zweck | Präsenz ohne Aufforderung; der Besucher wird nicht bevormundet |
| Primäre Aktion | Keine. Optional: ersten Satz tippen |
| Requirements | F1, P4, Q4; D5 (Sprache offen) |
| Flows | UF-01 |
| Navigation | Keine. Kein Menü, keine Route, kein Scroll-Zwang |
| Erfolgszustand | WF-02 nach ~5 s, ohne Layoutsprung |

### Informationshierarchie

1. Ruhiges Feld / Textur (fast nichts).
2. Textfeld, leise, aber von Beginn an bedienbar.
3. Sonst nichts: kein Logo, keine Erklärung, keine Feature-Liste, kein CTA.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|                                                                        |
|                                                                        |
|                 .    .        .       .    .        .                  |
|            .        .    .        .        .    .                      |
|                                                                        |
|                                                                        |
|                                                                        |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
|                                                        [ -> ]          |
+------------------------------------------------------------------------+
```

`[ -> ]` ist sichtbar deaktiviert, solange das Feld leer ist.

### Wireframe Mobile

```
+---------------------------+
|                           |
|     .   .      .    .     |
|        .    .      .      |
|                           |
|                           |
| +-----------------------+ |
| | Schreib einen Satz.   | |
| +-----------------------+ |
|                    [->]   |
+---------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Texteingabe | einzeilig | leer, Placeholder | leer, Fokus, deaktiviert | Tab, tippen | Label „Nachricht an den Agenten" |
| Senden | Button | deaktiviert | deaktiviert, aktiv | Tab, Enter/Space | `aria-disabled`, Label „Senden" |
| Mikrofon | – | nicht sichtbar | – | – | Erscheint erst in WF-02 |

### Systemfeedback

- Bei ~5 s wachen die Augen sanft auf. Kein Ton, keine Meldung, kein Scroll.
- Mit der ersten Bewegung erscheint die Pause-/Stop-Steuerung (C-15); vorher
  gibt es nichts zu pausieren.
- Das Textfeld bleibt an derselben Position; kein Layoutsprung.
- Bei `prefers-reduced-motion` erscheinen die Augen ohne Übergang.
- Wenn der Zustand nicht geladen werden kann: WF-10, aber das Feld bleibt.

### Zustand nach erfolgreicher Interaktion

WF-02. Der Besucher kann ohne einen einzigen Pflichtklick tippen; die Augen
waren der einzige automatische Vorgang.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | Feld, keine Augen | Tippen |
| Loading | Feld; kein Spinner, keine Skeletons | Tippen bleibt möglich |
| Empty | identisch mit Default | Tippen |
| Success | Augen wach, WF-02 | Weiter |
| Error | WF-10, Feld erhalten | Retry |
| Validation Error | nicht zutreffend (kein Submit) | – |
| Disabled | Senden aus, Feld bedienbar | Tippen |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Darf das Feld schon vor dem Aufwachen sichtbar sein? (OD-14)
- Ist Mobile V1-Pflicht? (OD-01)
- Placeholder-Sprache Deutsch oder Englisch? (OD-07/D5)

---

## WF-02 · Bereit

| Feld | Wert |
|---|---|
| Zweck | Ersten Intent ermöglichen; Text ist der Hauptweg, Voice die Option |
| Primäre Aktion | Einen Satz schreiben |
| Requirements | F1, F2, F5, F6, P4 |
| Flows | UF-01, UF-05 |
| Navigation | Keine; Tab-Reihenfolge laut 00 §6 |
| Erfolgszustand | WF-03 (Text vorhanden) oder WF-09 (Mikrofon geklickt) |

### Informationshierarchie

1. Augen: Präsenz, ruhig, nicht bedrohlich.
2. Composer: die einzige primäre Aktion.
3. Mikrofon: sekundär, freiwillig, nach Klick.
4. Statuszeile: nur bei Verbindungsabweichung sichtbar.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|                                                [Bewegung pausieren]   |
|                             (  o     o  )                              |
|                             (    ~~~    )                              |
|                                                                        |
|                                                                        |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

`[Bewegung pausieren]` ist die WCAG-2.2.2-Steuerung (C-15). Sie erscheint,
sobald die Augen sich bewegen, und bleibt dauerhaft erreichbar. Im pausierten
Zustand bleiben die Augen offen und statusfähig, nur ohne Dauerbewegung.

### Wireframe Mobile

```
+---------------------------+
|                 [Pause]   |
|        ( o      o )       |
|        (   ~~~    )       |
|                           |
|                           |
| +-----------------------+ |
| | Schreib einen Satz.   | |
| +-----------------------+ |
| [Mikrofon]          [->]  |
+---------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Texteingabe | einzeilig | leer | leer, Fokus, Entwurf, gesperrt | Tab, tippen, Enter sendet | Label „Nachricht an den Agenten"; kein Autofokus |
| Senden | Button | deaktiviert | deaktiviert, aktiv | Tab, Enter/Space | Label „Senden"; nicht nur Icon |
| Mikrofon | Toggle-Button | bereit | bereit, angefragt, hört, verweigert, nicht verfügbar | Tab, Enter/Space | Label wechselt: „Mikrofon starten" / „Zuhören beenden"; `aria-pressed` |
| Bewegung | Text-Toggle | sichtbar, Bewegung an | an, pausiert | Tab, Enter/Space | Label „Bewegung pausieren" / „Bewegung fortsetzen"; WCAG 2.2.2 |

### Systemfeedback

- Senden wird aktiv, sobald der getrimmte Text nicht leer ist.
- Fokusring ist sichtbar und nicht farbabhängig.
- Die Augen reagieren höchstens subtil auf Zeigerbewegung; keine Pflichtinteraktion.
- Ein Klick auf das Mikrofon startet die Browser-Permission, nie automatisch.
- Kein Status „online" im Default; Störungen sind die Ausnahme, nicht die Anzeige.
- Die Pause-Steuerung ist erreichbar, sobald sich die Augen bewegen; sie ist
  kein Menü und keine Einstellungsseite.

### Zustand nach erfolgreicher Interaktion

Der Text steht im Feld, Senden ist aktiv (WF-03), oder das Mikrofon hört zu
(WF-09). Es gibt keinen Fortschrittsbalken und keine Schrittanzeige.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | Augen wach, leeres Feld | Tippen |
| Loading | Statuszeile „verbindet", Feld bedienbar | Tippen |
| Empty | identisch mit Default | Tippen |
| Success | WF-03 oder WF-09 | Weiter |
| Error | WF-10, Feld erhalten | Retry |
| Validation Error | nicht vor dem Senden | – |
| Disabled | Feld und Senden gesperrt, wenn Agent nicht erreichbar | Retry in WF-10 |
| Permission Denied | erst nach Mikrofon-Klick, inline in WF-09 | Textweg |

### Offene Fragen

- Mobile Pflicht oder „darf nicht brechen"? (OD-01)
- Darf der Besucher während einer laufenden Antwort tippen? (OD-04)
- Ist der Status „verbunden" überhaupt sichtbar nötig? (OD-13)

---

## WF-03 · Schreiben

| Feld | Wert |
|---|---|
| Zweck | Einen Satz erfassen, ohne Formular-Zeremonie |
| Primäre Aktion | Senden |
| Requirements | F2, P4, Q1 |
| Flows | UF-01 |
| Navigation | Keine; Enter sendet, Escape löscht nicht |
| Erfolgszustand | WF-04 |

### Informationshierarchie

1. Geschriebener Text.
2. Senden.
3. Mikrofon als Alternative.
4. Augen treten zurück.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|                             (  o     o  )                              |
|                                                                        |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Ich möchte, dass du wärmer wirkst.           [ -> ]          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]                  |
+------------------------------------------------------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Texteingabe | einzeilig | leer | leer, Entwurf, IME-Komposition, gesperrt | Enter sendet; IME-Enter sendet nicht | Label bleibt; keine Zeichenzählung |
| Senden | Button | deaktiviert | aktiv ab nicht-leerem Text | Tab, Enter/Space | Label „Senden" |
| Mikrofon | Button | bereit | wie WF-02 | Tab, Enter/Space | Wie WF-02 |

### Systemfeedback

- Kein Zeichenzähler, keine Live-Validierung, kein rotes Aufblinken.
- Nur-Leerzeichen gilt als leer; Senden bleibt deaktiviert, ohne Fehlermeldung.
- Enter während einer IME-Komposition sendet nicht.
- Bei Server-Ablehnung: Text bleibt, inline Fehler in WF-10, kein Verlust.

### Zustand nach erfolgreicher Interaktion

WF-04: Das Feld wird geleert, die Nachricht erscheint klein als Kontext, die
Antwort beginnt im Fokus.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | leeres Feld, Senden aus | Tippen |
| Loading | nicht zutreffend | – |
| Empty | Placeholder, Senden aus | Tippen |
| Success | WF-04 | Weiter |
| Error | WF-10, Text erhalten | Retry |
| Validation Error | nur bei Server-Ablehnung; Text bleibt | Ändern, erneut senden |
| Disabled | Feld editierbar, Senden aus während Antwort | Warten oder Antwort lesen |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Gibt es eine maximale Länge? Im Repo nicht definiert; keine erfundene Grenze.
- Bleibt der Entwurf beim Reload erhalten? (OD-06)

---

## WF-04 · Antwort im Fokus

| Feld | Wert |
|---|---|
| Zweck | Die aktuelle Antwort ist der Hauptinhalt; kein Chat-Fenster |
| Primäre Aktion | Lesen, dann nächste Runde |
| Requirements | F2, T2, Q1, ADR-0002 |
| Flows | UF-01, UF-02, UF-05 |
| Navigation | Keine; Scrollen nach oben zeigt Älteres (WF-12) |
| Erfolgszustand | Antwort vollständig; Senden und Mikrofon wieder aktiv |

### Informationshierarchie

1. Aktuelle Antwort, groß und im Fokus.
2. Eigene Nachricht als kleiner Kontext darüber.
3. Hintergrund-Ergebnis, leise, darunter.
4. Composer, sichtbar, aber gesperrt.
5. Augen: antwortend, nicht alarmierend.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|  Du: Ich möchte, dass du wärmer wirkst.                    (klein)     |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Ich kann das so machen. Die Seite wird ruhiger, und meine        |  |
|  | Antworten kommen weniger technisch.                              |  |
|  | _                                                                |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  [ Status: antwortet ]                                                 |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                    (gesperrt) |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

`_` ist der pulsierende Typewriter-Cursor, kein Ladebalken.

### Wireframe Mobile

```
+---------------------------+
|        ( o     o )        |
|                           |
| Du: Ich möchte, dass ...  |
|                           |
| Ich kann das so machen.   |
| Die Seite wird ruhiger,   |
| und meine Antworten ...   |
| _                         |
|                           |
| [ Status: antwortet ]     |
| +-----------------------+ |
| | Schreib einen Satz.   | |
| +-----------------------+ |
| [Mikrofon]          [->]  |
+---------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Texteingabe | einzeilig | leer | editierbar, Senden gesperrt | Tab, tippen | Label bleibt; Entwurf möglich |
| Senden | Button | gesperrt | gesperrt bis Antwort fertig | – | `aria-disabled` |
| Mikrofon | Button | gesperrt | gesperrt bis Antwort fertig | – | `aria-disabled` |
| Antwort | Live-Region | wartend | wartend, streamend, fertig, unterbrochen | – | `aria-live="polite"`, komplette Antwort statt Zeichen |

### Systemfeedback

- Vor dem ersten Token: ruhiger Wartezustand ohne erfundenen Satz.
- **Nie Stille ohne sichtbare Reaktion:** Die Augen zeigen „wartet", nach der
  Schwelle kommt eine knappe Statuszeile. Arbeit wird sichtbar, ohne Text zu
  erfinden (E14).
- Erster Token startet den Typewriter; der Cursor pulsiert.
- Nach einer noch offenen Schwelle erscheint eine knappe Statuszeile
  „antwortet" — kein „Ich verstehe…", keine Endlosschleife (OD-13).
- Screenreader erhalten die vollständige Antwort, nicht jedes Zeichen.
- Bei Abbruch: Teiltext bleibt, inline Fehler mit Retry (WF-10).

### Zustand nach erfolgreicher Interaktion

Antwort vollständig, Cursor verschwindet, Senden und Mikrofon werden aktiv. Der
Fokus bleibt visuell auf der Antwort; die Tastatur bleibt im Feld, falls der
Besucher dort war.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | wartend, Cursor ruhig | – |
| Loading | Status „antwortet", keine Fake-Sätze | Warten oder Retry nach Fehler |
| Empty | noch kein Token | – |
| Success | vollständige Antwort, Eingabe frei | Nächste Runde |
| Error | Teiltext + WF-10 | Retry |
| Validation Error | nicht zutreffend | – |
| Disabled | Composer gesperrt | Warten |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Darf der Besucher die Antwort unterbrechen? (OD-04)
- Wie verhält sich der Puffer bei Streaming-Pausen? (OD-13)
- Wird die eigene Nachricht im Verlauf angezeigt? (OD-09)
- Bleibt die Antwort bei Reload sichtbar? (OD-06)

---

## WF-05 · Aussehen wird erfragt

| Feld | Wert |
|---|---|
| Zweck | Der Agent fragt nach seinem Aussehen; **noch kein Regler** (R0) |
| Primäre Aktion | In Worten antworten |
| Requirements | F3, ADR-0004, D6 |
| Flows | UF-03 |
| Navigation | Keine; der Zustand ist Teil der Antwortfläche |
| Erfolgszustand | WF-06: Der Agent hat die Achse benannt, der Regler erscheint (R1) |

### Informationshierarchie

1. Frage des Agenten.
2. Composer: Antwort in Worten.
3. Augen: ruhig, zugewandt.

**Kein Regler in diesem Zustand.** Er erscheint erst, wenn die Antwort ihm eine
Bedeutung gegeben hat. Ein Regler vor der Benennung wäre der Theme-Switcher, vor
dem ADR-0004 warnt.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|  Agent: "Wie soll ich aussehen - eher warm oder kühl?"                 |
|                                                                        |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Antworte in Worten ...                           |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

`warm/kühl` ist die Beispielachse aus der Skizze, **nicht entschieden** (D6).
Die endgültige Beschriftung entsteht aus der Antwort des Besuchers.

### Wireframe Mobile

```
+---------------------------+
|        ( o     o )        |
|                           |
| "Wie soll ich aussehen -  |
|  eher warm oder kühl?"    |
|                           |
|                           |
| +-----------------------+ |
| | Antworte in Worten    | |
| +-----------------------+ |
| [Mikrofon]          [->]  |
+---------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Texteingabe | einzeilig | leer | leer, Entwurf, gesperrt | Tab, tippen, Enter | Label „Antwort auf die Frage nach dem Aussehen" |
| Senden | Button | deaktiviert | aktiv ab Text | Tab, Enter/Space | Label „Senden" |
| Regler | – | nicht sichtbar (R0) | – | – | Erscheint erst in WF-06 (R1) |

### Systemfeedback

- Die Frage ist genau eine Frage; kein zweiter Aufruf, keine Liste.
- Es gibt keinen toten Regler und keinen Platzhalter, der wie ein Bedienelement
  aussieht.
- Die Antwort des Besuchers wird als Achsenbezeichnung zurückgegeben; erst
  danach erscheint der Regler.
- Die Einblendung in WF-06 wird höflich angekündigt; kein Fokusklau.
- Der Startwert ist neutral, solange D6 nicht entschieden ist.

### Zustand nach erfolgreicher Interaktion

Der Agent hat die Achse benannt (z. B. „warm ↔ kühl"). WF-06 zeigt den Regler
zuerst benannt und passiv (R1); erst danach darf gezogen werden (R2).

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | Frage + Composer, kein Regler | Antworten |
| Loading | Frage da, Achse wird noch gebildet | Warten, Textantwort möglich |
| Empty | Achse noch nicht benannt | Textantwort |
| Success | WF-06 (R1) | Weiter |
| Error | Zustand fehlt: Frage bleibt, kein toter Regler | Textantwort, Retry |
| Validation Error | nicht zutreffend | – |
| Disabled | Composer gesperrt, wenn Antwort läuft | Warten |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Wann im Gespräch fragt der Agent? (OD-02)
- Welche Achse und welcher Startwert? (D6/OD-08)
- Ist R2 (ziehbar) schon V1 oder erst R1 (benannt, passiv)? (OD-08)

---

## WF-06 · Regler bewegen

| Feld | Wert |
|---|---|
| Zweck | Die benannte Achse wird sichtbar (R1) und danach ziehbar (R2) |
| Primäre Aktion | R1 lesen; in R2 ziehen oder per Tastatur verschieben |
| Requirements | F3, T3, ADR-0004, D6 |
| Flows | UF-03 |
| Navigation | Keine; Escape bricht nichts ab, der Wert bleibt |
| Erfolgszustand | WF-07: Änderung sichtbar, Haltung in der nächsten Antwort hörbar |

### Informationshierarchie

1. Benannte Achse mit semantischem Wert.
2. Sichtbare Änderung der Seite (Palette, Dichte, Rhythmus).
3. Antwort-Haltung (in der nächsten Antwort, nicht als Behauptung).
4. Composer.

### Wireframe Desktop (R1 → R2)

**R1 — benannt, passiv.** Die Achse ist eine Anzeige, kein Bedienelement:

```
+------------------------------------------------------------------------+
|  Agent: "Dann nenne ich die Achse warm bis kühl."                      |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Aussehen: warm bis kühl                                         |  |
|  | warm  [----------------|----------------]  kühl   Mitte          |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
+------------------------------------------------------------------------+
```

**R2 — ziehbar.** Erst jetzt wird daraus ein Regler:

```
+------------------------------------------------------------------------+
|  +------------------------------------------------------------------+  |
|  | Aussehen: warm bis kühl                                         |  |
|  | warm  [============|--------------------]  kühl                  |  |
|  |        eher warm · erzählend                                     |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  (Palette, Dichte, Rhythmus und Haltung ändern sich live)              |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

R1 ist der Pflichtstand (benannt, sichtbar). R2 ist **Vorschlag**, nicht
entschieden: Der Besucher darf nach der Benennung ziehen, sonst wäre es eine
Ansage statt eines Reglers (ADR-0004, „Offen").

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Achsenanzeige R1 | statischer Text + Marker | Mitte | benannt, gesperrt | – | Kein Range-Element; Wert als Text, nicht als toter Regler |
| Regler R2 | Range | letzter bestätigter Wert | ziehend, synchronisierend, Fehler, gesperrt | Pfeile, Home/End | `aria-valuetext` nennt Richtung und Haltung |
| Wertanzeige | Text | – | – | – | nicht nur Farbe; Text ist die Bedeutung |

### Systemfeedback

- Die Benennung der Achse wird höflich angekündigt; R1 erscheint als Anzeige,
  nicht als toter Regler.
- Erst nach der Benennung wird R2 aktiv; die Aktivierung wird angekündigt.
- Die sichtbare Änderung ist sofort da; kein Bestätigungsdialog, kein Toast.
- Die Wertanzeige nennt Richtung und Haltung in Worten.
- Es gibt keine Erfolgsmeldung „Gespeichert". Der Zustand ist die Bestätigung.
- Bei Sync-Fehler: Regler springt auf den letzten bestätigten Wert, inline
  Hinweis, kein stiller Zustandsverlust.
- Die nächste Antwort zeigt die Haltung durch Formulierung, nicht durch
  Selbstbeschreibung.

### Zustand nach erfolgreicher Interaktion

WF-07. Der Regler bleibt bedienbar; der Besucher darf weiterziehen. Die
Änderung überlebt Reload (WF-11).

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | R1 benannt, passiv | Lesen |
| Loading | Wert wird angewendet, kein Spinner über der Seite | Warten |
| Empty | Achse noch nicht benannt (R0) | Erst antworten |
| Success | R2 ziehbar, WF-07 | Ziehen |
| Error | Rücksprung + inline Hinweis | Erneut ziehen |
| Validation Error | nicht zutreffend | – |
| Disabled | R2 gesperrt, wenn Zustand nicht verfügbar | Retry |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Welche Achse, welcher Startwert, welche Stufen? (D6/OD-08)
- Wird die Haltung sofort oder erst mit der nächsten Antwort sichtbar? (OD-08)
- Bleibt der Regler nach der ersten Entscheidung dauerhaft sichtbar? (OD-12)

---

## WF-07 · Veränderter Zustand

| Feld | Wert |
|---|---|
| Zweck | Erfolg ohne Erfolgsbanner: die Seite ist anders und bleibt anders |
| Primäre Aktion | Weiterreden oder weiterregeln |
| Requirements | F3, T3, Q2, T6 |
| Flows | UF-03 |
| Navigation | Keine |
| Erfolgszustand | Alle drei Wirkungen belegt: CSS, Prompt/Haltung, nächste Antwort; Reload besteht |

### Informationshierarchie

1. Veränderte Seite (Palette, Dichte, Rhythmus).
2. Nächste Antwort in der neuen Haltung.
3. Regler, weiter bedienbar.
4. Composer.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|  (Feld und Augen wirken verändert; kein Banner, keine Erklärung)       |
|                                                                        |
|  Agent: "Ruhig. Was möchtest du als Nächstes sehen?"                   |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | warm [----------|===============] kühl   eher warm · erzählend   |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Regler | Range | letzter Wert | bedienbar, synchronisierend, Fehler | Pfeile, Home/End | Wie WF-06 |
| Texteingabe | einzeilig | leer | leer, Entwurf | Tab, tippen | Wie WF-02 |

### Systemfeedback

- Kein „Erfolgreich angewendet", kein Häkchen, kein Konfetti.
- Die sichtbare Änderung und die nächste Antwort sind der Beweis.
- Keine Selbstbeschreibung des Agenten („ich bin jetzt warm"), weil das die
  Haltung behaupten statt zeigen würde (ADR-0004, „Negativ").
- Bei nur teilweiser Wirkung (z. B. CSS ja, Prompt nein) gilt der Zustand als
  Fehler, nicht als Erfolg.

### Zustand nach erfolgreicher Interaktion

Der Besucher kann weiterreden; die Änderung bleibt beim Reload erhalten
(WF-11). Der Regler bleibt sichtbar und bedienbar.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | veränderter Zustand | Weiter |
| Loading | nicht zutreffend (kein Seitenladen) | – |
| Empty | nicht zutreffend | – |
| Success | Wirkung sichtbar, Reload bestanden | Weiter |
| Error | Teilwirkung oder Sync-Fehler: inline, letzter bestätigter Wert | Retry |
| Validation Error | nicht zutreffend | – |
| Disabled | Regler gesperrt bei Zustandsfehler | Retry |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Bleibt die Änderung nur für diese Sitzung oder für diesen Besucher? (OD-06)
- Gilt sie über Reload hinaus auch für neue Tabs? (T6/OD-06)
- Darf der Besucher den Regler später zurücksetzen? (OD-12)

---

## WF-08 · Hintergrund-Ergebnis

| Feld | Wert |
|---|---|
| Zweck | Beweisen, dass die Welt weiterläuft, ohne den Fokus zu stehlen |
| Primäre Aktion | Ignorieren (Default) oder inline aufklappen |
| Requirements | F4, T4, Q1 |
| Flows | UF-04 |
| Navigation | Tab zur Zeile, Enter/Space klappt auf; Escape schließt |
| Erfolgszustand | Ergebnis ist da und auffindbar, ohne Unterbrechung |

### Informationshierarchie

1. Aktuelle Antwort bleibt Rang 1.
2. Leise Ergebniszeile darunter.
3. Aufgeklappter Inhalt, inline.
4. Composer.

### Wireframe Desktop (eingeklappt)

```
+------------------------------------------------------------------------+
|  Aktuelle Antwort bleibt im Fokus ...                                  |
|                                                                        |
|  ------------------------------------------------------------------    |
|  Hintergrund · 1 Ergebnis gefunden                           [öffnen]  |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

### Wireframe Desktop (aufgeklappt)

```
+------------------------------------------------------------------------+
|  Aktuelle Antwort bleibt im Fokus ...                                  |
|                                                                        |
|  ------------------------------------------------------------------    |
|  Hintergrund · 1 Ergebnis                                 [schließen]  |
|  +------------------------------------------------------------------+  |
|  | Gefunden: ...                                                    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
+------------------------------------------------------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Ergebniszeile | Disclosure-Button | eingeklappt | eingeklappt, aufgeklappt | Tab, Enter/Space, Escape | `aria-expanded`, `aria-controls`; Zeile 44 px |
| Inhalt | statischer Text | – | – | – | keine zweite Live-Region, die den Fokus zieht |

### Systemfeedback

- Die Zeile erscheint ohne Scroll, ohne Fokuswechsel, ohne Ton.
- `aria-live="polite"` kündigt nur „Hintergrund-Ergebnis verfügbar" an.
- Kein Badge, kein „Neu!", kein Toast, keine zweite Sprechspur.
- Bei Fehler des Sub-Agenten: leise, aber sichtbare Fehlerzeile; kein stiller
  Fehlschlag (Q1).
- Bei leerem Ergebnis: keine Zeile, kein „0 Ergebnisse".

### Zustand nach erfolgreicher Interaktion

Das Ergebnis ist sichtbar oder aufgeklappt; die aktuelle Antwort und der
Composer bleiben an derselben Stelle. Der Besucher kann weiterreden.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | keine Zeile | – |
| Loading | keine Zeile (Hintergrundarbeit ist still) | – |
| Empty | keine Zeile | – |
| Success | leise Zeile, einklappbar | Aufklappen |
| Error | leise Fehlerzeile | Retry? (OD-03) |
| Validation Error | nicht zutreffend | – |
| Disabled | nicht zutreffend | – |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Immer sichtbar oder eingeklappt? (OD-03)
- Darf ein Hintergrundfehler überhaupt sichtbar sein, ohne zu stören? (OD-03/Q1)
- Wie viele Ergebnisse, wie werden sie gruppiert? (OD-03)

---

## WF-09 · Voice nach Klick

| Feld | Wert |
|---|---|
| Zweck | Freiwillige Spracheingabe, nie automatisch, Text bleibt Fallback |
| Primäre Aktion | Sprechen (nach explizitem Mikrofon-Klick) |
| Requirements | F5, T5, Q4, D4, D7 |
| Flows | UF-05 |
| Navigation | Escape stoppt Zuhören; Fokus bleibt auf dem Mikrofon-Button |
| Erfolgszustand | Transkript erkannt, Antwort im Fokus (WF-04) |

### Informationshierarchie

1. Zuhören-Zustand mit Stopp.
2. Pegel als ruhige Rückmeldung.
3. Transkript (sobald erkannt).
4. Einwilligungszeile vor der ersten Aufnahme (Q4/D7), eine Zeile, kein Modal.
5. Augen.
6. Textweg bleibt sichtbar.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|                             (  o     o  )                              |
|                             (    ~~~    )                              |
|                                                                        |
|                     Zuhören ...            [ Stopp ]                   |
|                     Pegel  _ . : : . _                                 |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Transkript erscheint hier, sobald erkannt.       |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon aktiv ]            |
+------------------------------------------------------------------------+
```

### Wireframe Mobile

```
+---------------------------+
|        ( o     o )        |
|                           |
|   Zuhören ...   [Stopp]   |
|   Pegel _ . : : . _       |
|                           |
| +-----------------------+ |
| | Transkript ...        | |
| +-----------------------+ |
| [Mikrofon aktiv]          |
+---------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Mikrofon | Toggle-Button | bereit | bereit, angefragt, hört, verweigert, nicht verfügbar, gesperrt | Tab, Enter/Space | Label wechselt; `aria-pressed`; 48 px |
| Stopp | Button | nur beim Zuhören | aktiv | Tab, Enter/Space, Escape | Label „Zuhören beenden" |
| Transkript | Textanzeige | leer | leer, partiell, final | – | `aria-live="polite"` nur für Finaltext |
| Texteingabe | einzeilig | leer | bedienbar | Tab, tippen | Bleibt als Fallback sichtbar |
| Einwilligungszeile | Text + Disclosure | ungesehen | ungesehen, gelesen | Tab, Enter/Space | Keine Checkbox, kein zweiter Pflichtklick; Inhalt wartet auf D7 |

**Einwilligungszeile (L3):** Vor der ersten Aufnahme steht genau ein Satz, was
aufgenommen wird, mit einem Disclosure für Details. Sie ist kein Formular, keine
Checkbox und kein zweiter Pflichtklick. Der Wortlaut ist gesperrt, bis D7
entschieden ist (OD-11).

### Systemfeedback

- Der Browser-Permission-Dialog ist nativ und nicht Teil des Wireframes.
- Die Einwilligungszeile erscheint nur vor der ersten Aufnahme und bleibt
  danach still; sie wird nicht bei jedem Klick wiederholt.
- Bei Erlaubnis: sichtbarer Zuhören-Zustand und Pegel; kein Tonsignal.
- Bei Verweigerung: inline Hinweis „Mikrofon ist blockiert. Du kannst weiter
  tippen." plus Hilfe zum Freigeben; kein erneuter automatischer Prompt.
- Bei keinem Ton: „Ich habe nichts gehört" + erneut versuchen.
- Bei TTS-Ausfall: Textantwort bleibt vollständig lesbar, leiser Hinweis
  „Stimme nicht verfügbar".
- Keine Aufnahme ohne Klick; kein Autoplay.

### Zustand nach erfolgreicher Interaktion

Das Transkript steht im Feld oder als eigene Nachricht, dann läuft WF-04. Der
Textweg bleibt unverändert erreichbar.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | Mikrofon bereit | Klicken |
| Loading | „Mikrofon wird angefragt" | Warten |
| Empty | „Ich habe nichts gehört" | Erneut |
| Success | Transkript + WF-04 | Weiter |
| Error | WF-10 (kein Gerät, TTS) | Textweg |
| Validation Error | unverständlich: „Ich habe dich nicht verstanden" | Erneut |
| Disabled | Mikrofon gesperrt während Antwort | Warten |
| Permission Denied | inline Hinweis + Hilfe | Textweg |

### Offene Fragen

- Wird das Transkript sichtbar und im Verlauf geführt? (OD-05)
- Wo steht der Datenschutzhinweis, und blockiert er? (OD-11/D7)
- Ist Voice im ersten Durchstich scharf oder nur als Knopf vorhanden? (D4)
- Sprache des Textkanals neben englischer Stimme? (D5/OD-07)

---

## WF-10 · Fehler

| Feld | Wert |
|---|---|
| Zweck | Jeder Fehler ist sichtbar, verständlich und wiederaufnehmbar |
| Primäre Aktion | Erneut versuchen oder auf Text wechseln |
| Requirements | Q1, Q5 |
| Flows | UF-07 |
| Navigation | Keine Route; Fehler bleibt an seinem Ort, kein Modal |
| Erfolgszustand | Vorheriger Zustand wieder erreichbar, Eingabe erhalten |

### Informationshierarchie

1. Was ist passiert (ein Satz, keine Codes).
2. Was kann ich tun (eine Aktion).
3. Was bleibt erhalten (Text, Teilantwort).
4. Status, leise.

### Wireframe Desktop (Agent nicht verfügbar)

```
+------------------------------------------------------------------------+
|  +------------------------------------------------------------------+  |
|  | Ich kann gerade nicht antworten. Dein Text ist noch da.          |  |
|  |                                        [ Erneut versuchen ]      |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Ich möchte, dass du wärmer wirkst.               |          |
|          +--------------------------------------------------+          |
|                                                        [ -> ]          |
+------------------------------------------------------------------------+
```

### Fehlervarianten

| Fall | Ort | Text (Vorschlag) | Aktion | Was bleibt |
|---|---|---|---|---|
| Modell/Agent nicht verfügbar | Antwortfläche | „Ich kann gerade nicht antworten. Dein Text ist noch da." | Erneut versuchen | Text, Verlauf |
| Netz/Verbindung weg | Statuszeile + Antwort | „Keine Verbindung. Dein Text bleibt erhalten." | Erneut verbinden | Text, letzte Antwort |
| Zustandssync fehlgeschlagen | Regler | „Die Änderung konnte nicht gespeichert werden." | Erneut anwenden | letzter bestätigter Wert |
| Mikrofon verweigert | Composer | „Mikrofon ist blockiert. Du kannst weiter tippen." | Wie freigeben? | Textweg |
| Kein Mikrofon / kein Ton | Composer | „Ich habe kein Mikrofon gefunden." | Textweg | Textweg |
| TTS nicht verfügbar | Antwort | „Stimme nicht verfügbar. Die Antwort steht als Text da." | – | vollständige Textantwort |
| **Kontingent erschöpft** (Betriebsgrenze) | Status + Voice | „Das Voice-Kontingent ist für heute erreicht. Du kannst weiter tippen." | Textweg | Textweg, letzte Antwort |
| Eingabe abgelehnt | Composer | „Das konnte ich nicht senden." | Erneut senden | Text |
| App-Shell/Zustand nicht ladbar | ganze Fläche | „Die Seite konnte nicht geladen werden." | Neu laden | – (frischer Start) |

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Retry | Button | je nach Fehler | aktiv, gesperrt | Tab, Enter/Space | Label nennt Ziel |
| Textweg | Textfeld | erhalten | bedienbar | Tab, tippen | Fokus nicht erzwungen |
| Hilfe bei Mikrofon | Disclosure | eingeklappt | eingeklappt, offen | Tab, Enter/Space | `aria-expanded` |

### Systemfeedback

- `role="alert"` nur für unmittelbare Fehler; sonst `role="status"`.
- Kein Auto-Dismiss, keine timeoutende Meldung.
- Keine rohen Fehlercodes, keine Stacktraces, keine Schuldzuweisung.
- Kein Modal, das den Text verdeckt.
- Kein stiller Fehlschlag: auch der Sub-Agent-Fehler wird leise sichtbar.
- **Kontingent erschöpft ist kein Defekt.** Es ist ein normaler
  Betriebszustand: Grund sichtbar, Voice ehrlich gesperrt, Textweg offen, kein
  Dead End.
- Ein Retry ist idempotent; kein doppelter Turn durch Doppelklick.

### Zustand nach erfolgreicher Interaktion

Der Besucher ist wieder in WF-04 oder WF-02; der Text und die letzte
bestätigte Antwort sind unverändert.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | kein Fehler | – |
| Loading | Retry läuft, Button gesperrt | Warten |
| Empty | nicht zutreffend | – |
| Success | vorheriger Zustand | Weiter |
| Error | Fehlertext + Aktion | Retry |
| Validation Error | Eingabe abgelehnt, Text bleibt | Ändern |
| Disabled | Retry gesperrt während Versuch | Warten |
| Permission Denied | Mikrofon-Hinweis | Textweg |

### Offene Fragen

- Copy und Ton der Fehlermeldungen? (OD-10)
- Wie viele automatische Retries, bevor der Besucher entscheidet? (OD-10)
- Ab welcher Wartezeit gilt ein Turn als Fehler? (OD-13)
- Wird das Kontingent beziffert oder nur benannt? (OD-19)
- Datenschutzhinweis bei Voice-Fehlern? (OD-11)

---

## WF-11 · Wiederkehr / Reload

| Feld | Wert |
|---|---|
| Zweck | Server-autoritativen Zustand wiederherstellen, ohne Zeremonie |
| Primäre Aktion | Weiterreden |
| Requirements | Q2, T6, Q5 |
| Flows | UF-06 |
| Navigation | Reload/Zurück; keine eigene Route |
| Erfolgszustand | Aussehen, Reglerwert und letzte Antwort sind da; Augen sofort wach |

### Informationshierarchie

1. Letzte Antwort.
2. Reglerwert.
3. Composer.
4. Leiser Hinweis nur bei Teilwiederherstellung.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|  (Augen bereits wach, ruhig)                                           |
|                                                                        |
|  Letzte Antwort: ...                                                   |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | warm [----------|===============] kühl   eher warm · erzählend   |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
|                                          [ Mikrofon ]   [ -> ]         |
+------------------------------------------------------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Texteingabe | einzeilig | leer | leer, Entwurf | Tab, tippen | Wie WF-02 |
| Regler | Range | wiederhergestellt | bedienbar, Fehler | Pfeile | Wie WF-06 |
| Senden | Button | deaktiviert | aktiv ab Text | Tab, Enter/Space | Wie WF-02 |

### Systemfeedback

- Kein „Willkommen zurück!", kein Fortschrittsbalken, keine 5-Sekunden-Wiederholung.
- Bei vollständiger Wiederherstellung: keine Meldung; der Zustand spricht.
- Bei Teilwiederherstellung: leiser Satz, was fehlt, plus Textweg.
- Bei leerem Zustand: WF-01, kein Fehler.
- Bei Ladefehler: frischer Start plus leiser Hinweis, kein Dead End.

### Zustand nach erfolgreicher Interaktion

WF-02 mit erhaltenem Zustand. Der Besucher kann ohne erneutes Einrichten
weiterreden.

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | Zustand wird geladen, ruhiges Feld | Warten |
| Loading | kein Skeleton mit Fake-Inhalt | Warten |
| Empty | WF-01 | Tippen |
| Success | wiederhergestellter Zustand | Weiter |
| Error | frischer Start + leiser Hinweis | Neu beginnen |
| Validation Error | nicht zutreffend | – |
| Disabled | Composer gesperrt, solange Zustand lädt | Warten |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Was genau wird wiederhergestellt und für wen? (OD-06)
- Gibt es eine Cookie-/Session-Grenze? (OD-06/D7)
- Werden offene Hintergrund-Ergebnisse wiederhergestellt? (OD-06)

---

## WF-12 · Verlauf

| Feld | Wert |
|---|---|
| Zweck | Ältere Antworten treten zurück; die neue Antwort gewinnt den Fokus |
| Primäre Aktion | Lesen oder zur aktuellen Antwort springen |
| Requirements | ADR-0002, Designentscheidung „Neue Antwort im Fokus" |
| Flows | UF-08 |
| Navigation | Scrollen; Sprungmarke „Neue Antwort"; kein Fokusklau |
| Erfolgszustand | Aktuelle Antwort sichtbar, Verlauf bleibt erreichbar |

### Informationshierarchie

1. Aktuelle Antwort, stark.
2. Ältere Antworten, gedämpft und kleiner.
3. Sprungmarke „Neue Antwort" (nur bei gescrollter Position).
4. Composer.

### Wireframe Desktop

```
+------------------------------------------------------------------------+
|  (ältere Antwort, gedämpft)                                            |
|  (ältere Antwort, gedämpft)                                            |
|  ------------------------------------------------------------------    |
|  Aktuell                                                               |
|  +------------------------------------------------------------------+  |
|  | Aktuelle Antwort im Fokus                                        |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  [ ^ Neue Antwort ]   (nur sichtbar, wenn gescrollt)                   |
|                                                                        |
|          +--------------------------------------------------+          |
|          | Schreib einen Satz.                              |          |
|          +--------------------------------------------------+          |
+------------------------------------------------------------------------+
```

### Eingaben

| Element | Typ | Default | Zustände | Tastatur | Accessibility |
|---|---|---|---|---|---|
| Scrollfläche | Seite | oben bei aktueller Antwort | lesend, neue Antwort | Scrollen, Bild auf/ab | Reihenfolge bleibt logisch |
| Sprungmarke | Link/Button | verborgen | sichtbar bei Scroll | Tab, Enter | „Zur neuen Antwort"; kein `focus()` |
| Ältere Antworten | Text | gedämpft | – | – | Überschriftenhierarchie |

### Systemfeedback

- Neue Antwort löst visuelles Scrollen zur aktuellen Antwort aus.
- Screenreader hören „Neue Antwort" über eine höfliche Live-Region; der
  Tastaturfokus bleibt, wo er war.
- Bei `prefers-reduced-motion` springt die Ansicht ohne Animation.
- Kein Chat-Blasen-Design, keine Trennlinien pro Nachricht, keine Zeitstempel
  (nicht spezifiziert).

### Zustand nach erfolgreicher Interaktion

Die aktuelle Antwort ist sichtbar; der Besucher kann weiterlesen oder
weiterschreiben. Die Leseposition wird bewusst nicht gehalten
(Designentscheidung 19.11.).

### Zustandsvarianten

| Zustand | Darstellung | Aktion |
|---|---|---|
| Default | aktuelle Antwort, kein Verlauf | – |
| Loading | nicht zutreffend | – |
| Empty | kein Verlauf | – |
| Success | aktuelle Antwort im Fokus | Weiter |
| Error | Verlauf nicht ladbar: aktuelle Antwort bleibt | Retry (OD-06) |
| Validation Error | nicht zutreffend | – |
| Disabled | nicht zutreffend | – |
| Permission Denied | nicht zutreffend | – |

### Offene Fragen

- Wie viele ältere Antworten bleiben? (OD-09)
- Werden auch eigene Nachrichten gezeigt? (OD-09)
- Gibt es einen „nach oben"-Weg außer Scrollen? (OD-09)
