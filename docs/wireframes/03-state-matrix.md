# 03 · Zustandsmatrix und Feedback-Regeln

Legende: `●` primär spezifiziert · `○` Variante spezifiziert · `–` nicht
zutreffend (Grund in der Zelle) · `?` offen, siehe [`04-open-decisions.md`](04-open-decisions.md).

## 1 · Was die acht Zustände bedeuten

| Zustand | Bedeutung | Abgrenzung |
|---|---|---|
| Default | Stabiler Ausgangszustand, keine offene Arbeit | nicht „leer", wenn Inhalt erwartet wird |
| Loading | Arbeit läuft, Ergebnis noch nicht da | kein erfundener Fortschritt |
| Empty | Gültiger Zustand ohne Inhalt | kein Fehler, keine Schuld |
| Success | Beabsichtigtes Ergebnis erreicht | kein Erfolgs-Toast nötig |
| Error | Vorgang fehlgeschlagen, System bleibt nutzbar | nicht dasselbe wie Validation |
| Validation Error | Eingabe abgelehnt, korrigierbar | Text bleibt erhalten |
| Disabled | Aktion wegen Zustand nicht verfügbar | nicht wegen fehlender Berechtigung |
| Permission Denied | Browser/OS verweigert ausdrücklich | nur Voice relevant |

## 2 · Zustandsmatrix Screens

| Screen | Default | Loading | Empty | Success | Error | Validation Error | Disabled | Permission Denied |
|---|---|---|---|---|---|---|---|---|
| **WF-01** Ankommen | ● ruhiges Feld | ● Feld, kein Spinner | ● identisch | ● Augen wach | ● WF-10 | – kein Submit | ● Senden aus | – kein Zugriff |
| **WF-02** Bereit | ● Augen + Feld | ○ Status „verbindet" | ● leeres Feld | ● WF-03/WF-09 | ○ WF-10 | – kein Submit | ○ Agent nicht erreichbar | ○ erst nach Mikrofonklick |
| **WF-03** Schreiben | ● leeres Feld | – synchron | ● Placeholder | ● Entwurf | ○ Serverfehler | ○ nur Leerzeichen / Ablehnung | ● während Antwort | – kein Zugriff |
| **WF-04** Antwort | ● wartet auf Token | ● streamt | ● noch kein Token | ● vollständig | ● Strom abgebrochen | – kein Submit | ● Composer gesperrt | – kein Zugriff |
| **WF-05** Aussehen | ● Frage + Composer, kein Regler (R0) | ○ Achse wird gebildet | ○ Achse unbenannt | ● Achse benannt, WF-06 (R1) | ○ kein toter Regler, Textweg | – kein Submit | ○ Composer gesperrt | – kein Zugriff |
| **WF-06** Regler | ● letzter Wert | ○ wird angewendet | – keine Sammlung | ● Änderung live | ● Sync-Fehler | – freie Achse | ○ Zustand fehlt | – kein Zugriff |
| **WF-07** Veränderter Zustand | ● verändert | – kein Seitenladen | – kein leerer Zustand | ● drei Wirkungen | ● Teilwirkung | – kein Submit | ○ Regler gesperrt | – kein Zugriff |
| **WF-08** Hintergrund | ● keine Zeile | ○ unsichtbar | ● keine Zeile | ● leise Zeile | ○ leise Fehlerzeile | – kein Submit | – kein Bedarf | – kein Zugriff |
| **WF-09** Voice | ● Mikrofon bereit | ● Permission angefragt | ● nichts gehört | ● Transkript | ● kein Gerät / TTS | ○ unverständlich | ● während Antwort | ● verweigert |
| **WF-10** Fehler | ● kein Fehler | ○ Retry läuft | – kein Inhalt | ● wiederhergestellt | ● Fehler sichtbar, inkl. Kontingent | ● Eingabe abgelehnt | ○ Retry gesperrt | ● Mikrofon |
| **WF-11** Wiederkehr | ● Zustand lädt | ● lädt ruhig | ● frischer Start | ● wiederhergestellt | ● teilweise/fehlgeschlagen | – kein Submit | ● Composer wartet | – kein Zugriff |
| **WF-12** Verlauf | ● aktuelle Antwort | – synchron | ● kein Verlauf | ● neue Antwort im Fokus | ○ Verlauf nicht ladbar | – kein Submit | – kein Bedarf | – kein Zugriff |

## 3 · Zustandsdetails, die leicht übersehen werden

### 3.1 Loading ohne Lüge

Es gibt drei Wartearten, die nicht verwechselt werden dürfen:

| Warteart | Sichtbar | Nicht sichtbar |
|---|---|---|
| Verbindung/State lädt | ruhiges Feld, keine Skeletons | Spinner über der ganzen Seite |
| Antwort wartet auf ersten Token | Augen „wartet"; Status erst nach Schwelle | „Ich verstehe…", Fake-Sätze |
| Regler wird angewendet | Regler bleibt am letzten bestätigten Wert | Fortschrittsbalken, „Speichern…" |

**Schwellen sind offen (OD-13).** Das Modell lautet:

```
t0  senden
t0–T1  ruhig warten, kein Text
T1–T2  Status „antwortet" (Tatsache, kein Rollenspiel)
> T2   Fehler mit Retry; Text bleibt erhalten
```

`T1` und `T2` werden aus dem Messlauf abgeleitet, nicht vorab erfunden
(ADR-0001). Bis dahin sind sie Platzhalter.

### 3.2 Empty ist kein Fehler

- Kein Verlauf: keine „Noch keine Nachrichten"-Box.
- Kein Hintergrund-Ergebnis: keine Zeile, keine „0 Ergebnisse".
- Leeres Feld: Placeholder, Senden aus, keine rote Markierung.
- Keine Achse benannt: zugänglicher Name „Aussehen", sichtbar „Mitte".

### 3.3 Success ohne Erfolgsbanner

Erfolg wird gezeigt, nicht behauptet:

| Vorgang | Erfolgsfeedback |
|---|---|
| Erste Antwort | Antwort erscheint im Fokus |
| Regleränderung | Seite und nächste Antwort sind anders |
| Hintergrund-Ergebnis | leise Zeile ist da |
| Voice | Transkript und Antwort sind da |
| Reload | Zustand ist da, ohne „Willkommen zurück" |

### 3.4 Validation Error nur wo definiert

Es gibt genau zwei Stellen:

1. **Composer:** nur Leerzeichen → Senden bleibt aus, keine Fehlermeldung.
2. **Server lehnt Eingabe ab** → inline Fehler, Text bleibt, erneut senden.

Es gibt **keine erfundene Zeichenbegrenzung**. Wenn später eine definiert wird,
kommt sie als Owner-Entscheidung, nicht als stilles UI-Limit.

### 3.5 Disabled vs. Permission Denied

| Fall | Zustand | Darstellung |
|---|---|---|
| Antwort läuft, Senden gesperrt | Disabled | Feld bleibt editierbar, Senden aus |
| Agent nicht erreichbar | Disabled + Error | WF-10 mit Retry |
| Mikrofon vom Browser verweigert | Permission Denied | C-10, Textweg bleibt |
| Kein Mikrofon vorhanden | Error (nicht Permission) | „kein Mikrofon gefunden" |
| Regler wegen Zustandsfehler gesperrt | Disabled + Error | letzter bestätigter Wert |

Die **Einwilligungszeile** (C-16) ist keiner der acht Zustände, sondern die
Vorstufe von „Permission Denied": eine Zeile vor der ersten Aufnahme, kein
zweiter Pflichtklick. Sie wird nicht als eigener Screen geführt.

### 3.6 Nie Stille ohne sichtbare Reaktion

„Kein simuliertes Denken" heißt **nicht** „keine Rückmeldung". Zwischen Senden
und erstem Token passiert sichtbar etwas, ohne dass Text erfunden wird:

| Zeitfenster | Sichtbar | Nicht sichtbar |
|---|---|---|
| t0–T1 | Augen „wartet", Cursor ruhig | Fake-Satz, „Ich verstehe…" |
| T1–T2 | knappe Statuszeile „antwortet" | Fortschrittsbalken, Prozent |
| > T2 | Fehler + Retry, Text bleibt | Endlosschleife, stiller Abbruch |

Die Schwelle kommt aus dem Messlauf (OD-13). Bis dahin ist sie ein benannter
Platzhalter, keine Zahl.

### 3.7 Dauerbewegung und Pause (WCAG 2.2.2 A)

Die Augen bewegen sich automatisch und länger als fünf Sekunden. Deshalb:

- C-15 („Bewegung pausieren") ist erreichbar, sobald die Bewegung beginnt.
- Pausiert bleiben die Augen offen und zeigen denselben Präsenzzustand
  statisch; die Information geht nicht verloren.
- `prefers-reduced-motion` schaltet die Bewegung zusätzlich ab, ersetzt C-15
  aber nicht.
- Die Pause ist keine Einstellungsseite und kein Modal; sie ist ein Textknopf.

### 3.8 Kontingent erschöpft ist kein Defekt

Die Betriebsgrenze (Free-Kontingent) ist ein **normaler** Zustand:

- Grund sichtbar benennen, ohne technische Codes.
- Voice ehrlich sperren; kein wiederholter Permission-Prompt.
- Textweg bleibt vollständig offen.
- Kein Dead End, kein „Neu laden"-Zwang.
- Ob ein Restkontingent beziffert wird, ist OD-19.

## 4 · Feedback-Regeln

1. **Die Wirkung ist das Feedback.** Kein Toast für Erfolg.
2. **Kein stiller Fehlschlag.** Jeder Fehler ist sichtbar, auch der des
   Sub-Agenten (Q1).
3. **Nie Stille ohne sichtbare Reaktion.** Arbeit wird gezeigt, ohne Text zu
   erfinden: Augen, Cursor, Statuszeile nach Schwelle.
4. **Keine Unterbrechung durch Hintergrundarbeit.** Kein Fokus, kein Scroll,
   kein Ton, kein Modal.
5. **Ein Fehler, eine Aktion.** Kein Rattenschwanz aus drei Buttons.
6. **Eingabe überlebt.** Text und Teilantwort bleiben bei jedem Fehler erhalten.
7. **Kein Auto-Dismiss.** Fehler verschwinden nicht nach Sekunden.
8. **Keine rohen Codes.** Keine Stacktraces, keine HTTP-Nummern im UI.
9. **Keine Farbe allein.** Jeder Zustand hat Text oder Form.
10. **Höflich ankündigen.** `aria-live="polite"` für Antwort und Hintergrund;
    `role="alert"` nur bei unmittelbarem Handlungsbedarf.
11. **Kein Fokusklau.** Auch die neue Antwort nicht; sie wird angekündigt und
    visuell fokussiert, nicht per `focus()` angesprungen.

## 5 · Gleichzeitige Zustände und Priorität

Mehrere Zustände können gleichzeitig auftreten. Anzeigepriorität:

| Priorität | Zustand | Ort |
|---|---|---|
| 1 | Permission Denied (Mikrofon) | C-10, nah am Composer |
| 2 | Kontingent erschöpft (Voice) | C-08 + C-09, Voice gesperrt |
| 3 | Error (Antwort/Netz) | C-09, in der Antwortfläche |
| 4 | Disabled (Composer) | C-04, sichtbar gedimmt |
| 5 | BackgroundResult | C-07, leise Nebenlinie |
| 6 | StatusLine | C-08, leise |

Regeln:

- Fehler und Hintergrund-Ergebnis dürfen gleichzeitig sichtbar sein; der Fehler
  steht darüber, das Ergebnis bleibt leise darunter.
- Ein Hintergrund-Ergebnis darf einen Fehler nicht überdecken.
- Ein Permission-Denied-Hinweis darf den Textweg nicht verdecken.
- Es gibt nie zwei Modals, weil es keine Modals gibt.

## 6 · Was Reload überlebt (Q2)

| Zustand | Überlebt Reload? | Status |
|---|---|---|
| Aussehen/Reglerwert | ja, server-autoritativ | Q2, T6 |
| Letzte Antwort | ja | Q2 |
| Älterer Verlauf | ? | OD-06/OD-09 |
| Offenes Hintergrund-Ergebnis | ? | OD-06 |
| Laufende Antwort | nein; als unterbrochen markieren | technisch offen |
| Entwurf im Composer | ? | OD-06 |
| Mikrofon-Erlaubnis | Browser entscheidet, nicht die App | Q4 |
| Besucher-Identität | ? | OD-06 |

**Regel:** Kein Zustand wird „gefühlt" wiederhergestellt. Was nicht sicher
geladen ist, startet frisch und sagt es leise.

## 7 · Übergangstabelle

| Von | Auslöser | Nach | Bedingung |
|---|---|---|---|
| WF-01 | ~5 s | WF-02 | Augen wach |
| WF-01 | Text | WF-03 | Feld bedienbar |
| WF-02 | Text | WF-03 | nicht leer |
| WF-03 | Senden | WF-04 | Agent erreichbar |
| WF-03 | Senden | WF-10 | Agent nicht erreichbar |
| WF-04 | Frage nach Aussehen | WF-05 | Zustand `appearanceInvitation` |
| WF-05 | Textantwort | WF-06 | Achse benannt (R1) |
| WF-06 | Regler R2 | WF-07 | alle drei Wirkungen bestätigt |
| WF-09 | Voice-Kontingent erschöpft | WF-10/C-08 | Textweg bleibt offen |
| WF-04 | Sub-Agent fertig | WF-08 | ohne Fokuswechsel |
| WF-02 | Mikrofonklick | WF-09 | Permission erlaubt |
| WF-09 | Turn-Ende | WF-04 | Transkript vorhanden |
| WF-09 | Permission verweigert | WF-10/C-10 | Textweg bleibt |
| WF-04 | Fehler | WF-10 | Teiltext bleibt |
| WF-10 | Retry | WF-04 | Verbindung wieder da |
| WF-11 | Zustand geladen | WF-02 | vollständig |
| WF-11 | kein Zustand | WF-01 | frischer Start |
| WF-04/WF-12 | neue Antwort | WF-12 | visueller Fokus, keine Fokusübernahme |
