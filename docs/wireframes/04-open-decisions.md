# 04 · Offene Designentscheidungen

Diese Liste erfindet keine Produktentscheidung. Sie macht sichtbar, wo die
Wireframes eine Annahme treffen mussten, und was passiert, wenn die Entscheidung
ausbleibt. Jede Empfehlung ist **Vorschlag**, keine Freigabe.

## 1 · Übersicht

| ID | Frage | Optionen (kurz) | Empfehlung (Vorschlag) | Betroffen | Priorität |
|---|---|---|---|---|---|
| **OD-00** | Sind die abgeleiteten Flows UF-01…UF-08 die freigegebene Grundlage? | bestätigen / korrigieren / ersetzen | bestätigen nach Durchsicht | alle | **P0** |
| **OD-01** | Ist Mobile V1-Pflicht? | A first-class; B „darf nicht brechen"; C nur Desktop | B, mit Text und Voice als Mindestumfang | alle, besonders WF-01/02/09 | **P0** |
| **OD-02** | Wann fragt der Agent nach seinem Aussehen? | erste Antwort endet mit der Frage / separate Runde / später / nur auf Zuruf | erste vollständige Antwort endet mit genau einer Frage | WF-04/05 | P1 |
| **OD-03** | Wie erscheint das Hintergrund-Ergebnis? | immer sichtbare Zeile / eingeklappt mit Anzahl / versteckt bis gefragt | leise Zeile + inline aufklappbar; kein Toast | WF-08 | P1 |
| **OD-04** | Darf man während einer Antwort tippen oder senden? | alles sperren / Entwurf erlauben, Senden sperren / Senden erlauben / Stopp | Entwurf erlauben, Senden und Mikrofon sperren; kein Stopp in V1 | WF-03/04 | **P0** |
| **OD-05** | Wird das Voice-Transkript sichtbar und im Verlauf geführt? | im Feld / als eigene Nachricht / versteckt | als eigene Nachricht, Text bleibt Fallback | WF-09/12 | P1 |
| **OD-06** | Was überlebt Reload, für wen und wie lange? | Session-Cookie / localStorage / keine Persistenz / URL-Token | anonyme Session, Aussehen + letzte Antwort; keine Besucher-übergreifende Persistenz | WF-11, Q2/T6 | **P0** |
| **OD-07** | Sprache des Textkanals? (D5) | Deutsch / Englisch / gemischt | Deutsch für Text, Englisch für Voice, klar getrennt | alle Copy | **P0** |
| **OD-08** | Erster Regler: Achse, Startwert, Benennung, R1/R2? (D6) | warm↔kühl / colour / form / output style / kombiniert; R1 passiv / R2 ziehbar | warm↔kühl kombiniert mit Haltung, Mitte; R1 Pflicht, R2 Vorschlag | WF-05/06/07 | **P0** |
| **OD-09** | Wie tief und wie voll ist der Verlauf? | letzte 3 / letzte 5 / ganze Session / nur Antworten | letzte 5 Runden inkl. eigener Nachricht, ohne Zeitstempel | WF-12 | P1 |
| **OD-10** | Fehler-Copy und Retry-Politik? | automatisch / manuell / unbegrenzt | manuell, idempotent, keine Retry-Schleife | WF-10 | P1 |
| **OD-11** | Wo steht der Mikrofon-/Datenschutzhinweis? (D7) | inline vor erstem Klick / Disclosure / eigene Seite | eine ruhige Zeile am Mikrofon, Details als Disclosure; kein zweiter Pflichtklick | WF-09/10 | **P0** |
| **OD-12** | Bleibt das Aussehen nach der Entscheidung? | nur Sitzung / pro Besucher / global / Reset je Besuch | pro Besucher/Session, nicht global | WF-07/11 | P2 |
| **OD-13** | Warte-Schwellen und Typewriter-Puffer? | aus Messlauf ableiten / feste Werte | aus M1 ableiten (T1/T2); keine erfundenen Zahlen | WF-04/10 | P1 |
| **OD-14** | Ist das Textfeld vor dem Aufwachen sichtbar? | ab t=0 / mit Augen / bei erster Eingabe | ab t=0, leise; Augen bleiben ambient | WF-01 | P2 |
| **OD-15** | Bewegung bei reduziertem Modus und Pause/Stop? | sofort / wortweise / unverändert; Pause sichtbar | sofort oder wortweise; C-15 sichtbar, nie zeichenweise | WF-01/02/04/09/12 | P1 |
| **OD-16** | Fragt der Agent ein zweites Mal, wenn die Frage ignoriert wird? | einmal / wiederholt / nie | genau einmal; Regler bleibt danach bedienbar | WF-05/07 | P1 |
| **OD-17** | Wachen die Augen früher auf, wenn sofort getippt wird? | feste 5 s / sofort bei Interaktion | sofort bei erster Interaktion, sonst ~5 s | WF-01/02 | P2 |
| **OD-18** | Sende-Auslöser: Enter, Knopf oder beides? | Enter / Knopf / beides / Knopf erst ab erstem Zeichen | beides: Enter sendet, Knopf sichtbar und ab Text aktiv | WF-02/03 | **P0** |
| **OD-19** | Wie wird das erschöpfte Kontingent kommuniziert? | Restzahl / nur bei Erschöpfung / kein Hinweis | nur bei Erschöpfung, ohne Zahl, Textweg offen | WF-09/10 | P1 |

## 2 · P0 im Detail

### OD-00 · Flow-Freigabe

- **Warum jetzt:** Es gibt kein freigegebenes Flow-Dokument. Die Wireframes
  rekonstruieren UF-01…UF-08 aus bestätigten Designentscheidungen. Ohne
  Bestätigung ist die Grundlage ein Vorschlag, kein Baseline.
- **Wenn nicht entschieden:** Jede Screen-Abnahme ist eine Abnahme gegen eine
  Vermutung; spätere Korrekturen kosten alle Screens gleichzeitig.
- **Empfehlung:** Die acht Flows durchlesen, korrigieren und als V1-Baseline
  bestätigen. Nicht bestätigen, was nur aus der Skizze abgeleitet ist.

### OD-01 · Mobile-Umfang

- **Warum jetzt:** Ein geteilter Link landet auf dem Telefon. Das Repo sagt
  nicht, ob Mobile V1-Pflicht ist. Die Wireframes enthalten Mobile-Varianten,
  aber keine Mobile-Abnahme.
- **Optionen:** A) Mobile ist first-class mit eigener Abnahme; B) Mobile muss
  Text und Voice tragen, Desktop ist Referenz; C) Desktop-only, Mobile wird
  ausdrücklich nicht unterstützt.
- **Empfehlung:** B. Das hält den V1-Umfang klein, ohne einen toten Link auf
  dem Telefon zu riskieren.
- **Wenn nicht entschieden:** Kein Mobile-Test, keine Aussage über Touch-Ziele
  oder Tastatur; das Risiko bleibt bis zum Fremdtest unsichtbar.

### OD-04 · Eingabe während einer Antwort

- **Warum jetzt:** „Eine Frage pro Runde" ist bestätigt, aber nicht, ob der
  Composer während der Antwort bedienbar bleibt. Das ändert Disabled-Zustand,
  Fokus und Fehlerverhalten.
- **Optionen:** A) alles sperren; B) Entwurf erlauben, Senden und Mikrofon
  sperren; C) Senden erlauben und puffern; D) Stopp-Knopf.
- **Empfehlung:** B. Der Besucher kann den nächsten Satz vorbereiten, aber die
  Runde bleibt eine Runde. Ein Stopp-Knopf ist ein eigener Change Request, kein
  stilles Extra.
- **Wenn nicht entschieden:** WF-03/WF-04 können nicht abgenommen werden; das
  Risiko „ich sitze fest" bleibt offen.

### OD-06 · Reload und Besucher-Identität

- **Warum jetzt:** Q2 verlangt server-autoritativen Zustand über Reload, aber
  „Persistenz über Besucher hinweg" ist ausgeschlossen. Ohne Identität ist
  nicht bestimmbar, was „derselbe Besucher" heißt.
- **Optionen:** A) anonyme Session (Cookie), B) nur `localStorage`, C) keine
  Persistenz außer Aussehen, D) Token in der URL.
- **Empfehlung:** A, ohne Konto, ohne Cross-Visitor-Persistenz; D7 entscheidet
  die Aufbewahrung.
- **Wenn nicht entschieden:** T6 und Q2 sind nicht prüfbar; WF-11 bleibt eine
  Behauptung.

### OD-07 · Sprache des Textkanals (D5)

- **Warum jetzt:** Voice ist englisch entschieden. Der Textkanal ist offen.
  Jede Copy, jeder Placeholder und jeder Fehlertext hängt daran.
- **Optionen:** Deutsch, Englisch, gemischt (Text Deutsch, Voice Englisch).
- **Empfehlung:** Text Deutsch, Voice Englisch, sichtbar getrennt; die
  Voice-Antwort bleibt zusätzlich als deutscher Text lesbar. Das ist ein
  Vorschlag, keine Entscheidung.
- **Wenn nicht entschieden:** Keine Copy ist abnahmefähig; jede Sprache
  verändert Layout und Ton.

### OD-08 · Erster Regler (D6)

- **Warum jetzt:** Ohne Achse ist der Regler bedeutungslos und ADR-0004 nicht
  prüfbar. Die Skizze nennt `colour`, `form`, `output style`; der Kandidat ist
  warm↔kühl.
- **Optionen:** warm↔kühl, colour, form, output style, kombinierte Achse.
- **Empfehlung:** warm↔kühl, kombiniert mit Haltung (erzählend ↔ präzise),
  Startwert Mitte. R1 (benannt, passiv) ist Pflicht; R2 (ziehbar) folgt direkt
  danach, sonst wäre es eine Ansage statt eines Reglers. Das ist die einzige
  Variante, die Farbe **und** Verhalten gleichzeitig zeigt.
- **Wenn nicht entschieden:** WF-05/06/07 bleiben Platzhalter; T3 ist nicht
  testbar.

### OD-11 · Mikrofon- und Datenschutzhinweis (D7)

- **Warum jetzt:** Voice ist Teil des Erstbaus, aber Aufbewahrung von Audio und
  Transkripten ist nicht entschieden. Ein Hinweis, der etwas Falsches verspricht,
  ist schlimmer als keiner.
- **Optionen:** inline vor dem ersten Klick, Disclosure nach dem Klick, eigene
  Seite, kein Hinweis (nicht vertretbar).
- **Empfehlung:** eine ruhige Zeile am Mikrofon, Details als Disclosure; kein
  zusätzlicher Pflichtklick. Der Inhalt wartet auf D7.
- **Wenn nicht entschieden:** Kein öffentlicher Voice-Betrieb; WF-09 bleibt
  rechtlich unfertig.

### OD-18 · Sende-Auslöser

- **Warum jetzt:** Die Wireframes setzen „Enter sendet" plus sichtbaren Knopf.
  Das ist eine Auslegung von „kein Formular", keine bestätigte Entscheidung.
  Ohne Auslöser ist unklar, wann ein Satz abgeschickt wird.
- **Optionen:** A) nur Enter; B) nur Knopf; C) beides, Knopf sichtbar und ab
  Text aktiv; D) Knopf erscheint erst mit dem ersten Zeichen.
- **Empfehlung:** C. Enter bleibt schnell, der Knopf bleibt auf Touch sichtbar.
  D ist eleganter, versteckt aber die Absende-Möglichkeit vor dem ersten
  Zeichen.
- **Wenn nicht entschieden:** WF-03 ist nicht abnahmefähig; der erste
  Durchstich hat keinen geprüften Absende-Weg.

## 3 · P1/P2 in einem Satz

- **OD-02:** Die erste Antwort endet mit der Aussehen-Frage; sonst entsteht ein
  zweiter Agenten-Turn ohne Nutzerbeitrag.
- **OD-03:** Das Ergebnis ist eine leise Zeile, kein Badge und kein Toast; ein
  Fehler des Sub-Agenten wird leise, aber sichtbar.
- **OD-05:** Das finale Transkript wird als eigene Nachricht gezeigt, damit der
  Textweg und der Voice-Weg denselben Verlauf haben.
- **OD-09:** Fünf Runden reichen für Kontext, ohne ein Chat-Archiv zu bauen;
  Zeitstempel sind nicht spezifiziert und bleiben weg.
- **OD-10:** Retry ist manuell und idempotent; automatische Schleifen erzeugen
  das Gefühl, die Seite kämpfe gegen den Besucher.
- **OD-12:** Das Aussehen gehört dem Besucher, nicht allen Besuchern; global
  wäre eine ungefragte Veränderung für Dritte.
- **OD-13:** T1/T2 kommen aus dem Messlauf, nicht aus dem Gefühl; bis dahin sind
  es benannte Platzhalter.
- **OD-14:** Das Feld ist von Anfang an da, aber leise; die Augen sind Präsenz,
  keine Zugangssperre.
- **OD-15:** Reduzierte Bewegung ersetzt den Typewriter durch sofortigen oder
  wortweisen Text; die Augen bleiben pausierbar (C-15), die Information bleibt
  vollständig.
- **OD-16:** Die Frage kommt genau einmal; Wiederholung wäre bevormundend.
- **OD-17:** Wer sofort tippt, wartet nicht auf die Augen; die Präsenz reagiert
  auf den Menschen, nicht umgekehrt.
- **OD-19:** Das erschöpfte Kontingent wird benannt, nicht beziffert; der
  Textweg bleibt offen, Voice ist ehrlich gesperrt.

## 4 · Bezug zu den bereits gestellten Owner-Entscheidungen

Diese Liste dupliziert [`PROJECT_CONTRACT.md`](../PROJECT_CONTRACT.md) §3 nicht.
Sie zeigt nur, welche Designfrage daran hängt.

| Contract-Entscheidung | Designfolge |
|---|---|
| D4 Voice im ersten Durchstich | WF-09 ist scharf oder nur Knopf; OD-05/OD-11 hängen daran |
| D5 Textsprache | alle Copy, Placeholder, Fehlertexte (OD-07) |
| D6 erster Regler | WF-05/06/07, T3 (OD-08) |
| D7 Datenschutz | WF-09/10, OD-06/OD-11 |
| D8 Kostenrahmen | TTS-Verfügbarkeit, Voice-Fehlerzustand |
| D1 ADRs | ADR-0002/0004 sind vorgeschlagen; WF-04/05/06 hängen daran |

## 5 · Was passiert, wenn nichts entschieden wird

| Ausbleibende Entscheidung | Folge |
|---|---|
| OD-00 | Keine Baseline; jede Abnahme ist relativ |
| OD-01 | Kein Mobile-Test; Touch- und Tastaturversprechen ungeprüft |
| OD-04 | Composer-Zustände nicht baubar; „eine Runde" bleibt unklar |
| OD-06 | Q2/T6 nicht prüfbar; Reload bleibt Behauptung |
| OD-07 | Keine Copy; jede Sprache ändert Layout und Ton |
| OD-08 | Regler ohne Bedeutung; ADR-0004 nicht prüfbar |
| OD-11 | Kein öffentlicher Voice-Betrieb vertretbar |
| OD-18 | Kein geprüfter Absende-Weg; WF-03 nicht abnahmefähig |
| OD-19 | Kontingent wirkt wie ein Defekt; Voice-Erwartung bricht |

## 6 · Nicht Teil dieser Liste

Diese Punkte sind keine offenen Designentscheidungen, sondern aus dem V1-Scope
ausgeschlossen. Sie werden hier nicht als Feature versteckt:

- Bild-Eingang (`picture`), zweiter/dritter Regler, zweiter Sub-Agent,
  deutsche Stimme, proaktives Nachsprechen (T4), Pathways, Mandanten, `Pay`,
  Accounts, Analytics, SEO, Mehrsprachigkeit, Besucher-übergreifende
  Persistenz. Belege: [`PROJECT_CONTRACT.md`](../PROJECT_CONTRACT.md) §2.3.
- Ein eigenes Designsystem, ein Chat-Widget, ein Theme-Picker, eine
  Onboarding-Tour, Toasts oder Modals. Belege:
  [`02-components.md`](02-components.md) §1/§7.
