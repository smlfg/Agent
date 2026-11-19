# 02 · Komponentenarchitektur

Grundsatz aus [`ADR-0003`](../adr/ADR-0003-wiederverwendung-vor-eigenbau.md):
**Wiederverwenden vor Eigenbau.** Es gibt in diesem Repo kein Designsystem und
keinen UI-Code. Deshalb beschreibt dieses Kapitel Komponenten als
Verantwortlichkeiten und Zustände, nicht als Implementierung. Kein Frontend-Code.

## 1 · Wiederverwendung statt eigenes Designsystem

| Baustein | Kandidat | Status | Warum |
|---|---|---|---|
| Augen | `EyeFace.js` aus OpenVoiceUI (MIT) | **übernehmen** (F6, ADR-0003) | Genau die geforderte Präsenz; Lizenz und API vor Übernahme prüfen |
| Regler | Radix UI Slider (MIT), falls React | **Kandidat** | Unstyled, Tastatur und ARIA bereits gelöst; keine eigene Slider-Logik |
| Regler ohne React | natives `input[type=range]` | **Baseline** | Im Browser tastatur- und Screenreader-fähig; kein Paket nötig |
| Versteckte Live-Region | Radix `VisuallyHidden` oder CSS-Clip | **Kandidat** | Kleine, etablierte Lösung statt Eigenbau |
| Disclosure | Radix Collapsible oder natives `details/summary` | **Kandidat** | Hintergrund-Ergebnis aufklappen ohne Modal |
| Icons | eine etablierte offene Icon-Sammlung (z. B. Lucide, ISC) | **optional** | Nur Mikrofon, Senden, Schließen; Textlabels bleiben |
| Chat-UI | – | **nicht verwenden** | Würde ADR-0002 widersprechen (kein Chat-Fenster) |
| Toast-System | – | **nicht verwenden** | Hintergrund-Ergebnisse dürfen nicht unterbrechen |
| Modal-System | – | **nicht verwenden** | Fehler und Ergebnisse bleiben inline |

**Kein eigenes Designsystem.** Was gebraucht wird, ist eine dünne
Token-Schicht für die eine Achse (F3/ADR-0004) plus die vorhandenen
Plattform-Bausteine. Ein Designsystem mit Buttons, Cards, Badges und Modals wäre
für eine Oberfläche ohne diese Elemente unnötiger Eigenbau.

## 2 · Komponentenübersicht

| ID | Komponente | Verantwortung | Zustände | Screens |
|---|---|---|---|---|
| C-01 | Stage | Vollflächige Bühne ohne Chrome; ordnet Präsenz, Fokus, Nebenlinie, Composer | default, reduced-motion, error | alle |
| C-02 | EyePresence | Augen als Präsenz; nie einzige Bedeutung | Ruhe, Wach, Hört, Wartet, Antwortet, Fehler | WF-01, 02, 04, 05, 09 |
| C-03 | FocusAnswer | Aktuelle Antwort im Fokus; Typewriter; kein innerer Scroll | wartend, streamend, fertig, unterbrochen | WF-04, 05, 07, 11, 12 |
| C-04 | Composer | Einzeilige Eingabe + Senden; Entwurf bleibt erhalten | leer, Entwurf, gesperrt, Fehler | WF-01–09, 11 |
| C-05 | MicControl | Freiwillige Spracheingabe nach Klick | bereit, angefragt, hört, verweigert, nicht verfügbar, gesperrt | WF-02–04, 09 |
| C-06 | AppearanceSlider | Genau eine Achse; Oberfläche und Haltung | unbenannt, benannt, ziehend, synchronisierend, Fehler, gesperrt | WF-05, 06, 07, 11 |
| C-07 | BackgroundResult | Stilles Ergebnis, inline aufklappbar | verborgen, Ergebnis, leer, Fehler | WF-04, 08 |
| C-08 | StatusLine | Verbindung/Agentenzustand, nur bei Abweichung | verborgen, verbindet, offline, degraded | WF-02, 04, 10 |
| C-09 | InlineError | Fehlertext + genau eine Aktion, erhält Inhalt | default, retry läuft, gesperrt | WF-10, inline |
| C-10 | PermissionNotice | Mikrofon verweigert; Hilfe; Textweg | verweigert, nicht verfügbar, behoben | WF-09, 10 |
| C-11 | HistoryList | Ältere Antworten, gedämpft; keine Blasen | leer, gefüllt, neue Antwort | WF-12 |
| C-12 | NewAnswerAnchor | Sprungmarke „Neue Antwort" ohne Fokusklau | verborgen, sichtbar | WF-12 |
| C-13 | LiveRegion | Höfliche Ankündigungen für Antwort/Status | idle, announce | alle |
| C-14 | SkipLinks | Tastatur-Einstieg zu Eingabe/Antwort | verborgen, fokussiert | alle |
| C-15 | MotionToggle | Pause/Stop der Augen-Dauerbewegung (WCAG 2.2.2 A) | Bewegung an, pausiert | WF-01, 02, 04, 05, 09 |
| C-16 | ConsentLine | Eine Zeile vor der ersten Aufnahme, kein Pflichtklick | ungesehen, gelesen | WF-09 |

## 3 · Komponentenverträge

### C-01 · Stage

- **Verantwortung:** Eine einzige Oberfläche, kein Router, keine Kopfzeile.
  Sie ordnet von oben nach unten: Präsenz, aktuelle Antwort, Nebenlinie,
  Regler, Composer.
- **Zustände:** Default; `prefers-reduced-motion`; Fehlerzustand (Stage bleibt
  bedienbar).
- **Regeln:** Die Stage scrollt als Ganzes. Kein verschachtelter Scrollbereich
  für die Antwort. Der Composer bleibt auf Mobile unten sichtbar.
- **Accessibility:** Ein `<main>`-Landmark; eine `h1` nur für Screenreader
  („Agentfähig"), keine sichtbare Überschrift.

### C-02 · EyePresence

- **Verantwortung:** Präsenz zeigen, ohne zu bedrohen oder zu bedienen.
- **Eingaben:** Präsenzzustand aus [`00`](00-flows-and-viewports.md) §3;
  `reducedMotion`; optional Zeigerposition (nur Desktop, optional).
- **Zustände:** Ruhe, Wach, Hört, Wartet, Antwortet, Fehler.
- **Regeln:** Keine Bedeutung ausschließlich über die Augen. Kein Blinzeln in
  schneller Folge. Kein Blickkontakt erzwingen. Keine Reaktion auf Tippen, die
  wie eine Aufforderung wirkt.
- **Accessibility:** `aria-hidden="true"`. Der Zustand wird über C-08/C-13
  getextet. Bei reduzierter Bewegung: statische offene Augen.
- **WCAG 2.2.2 (Level A):** Automatische Dauerbewegung über fünf Sekunden
  braucht eine Pause-/Stop-Möglichkeit. `prefers-reduced-motion` allein ist
  **kein** Ersatz. Deshalb C-15; `EyeFace.js` bringt diese Steuerung nicht mit
  und muss umschlossen werden.

### C-03 · FocusAnswer

- **Verantwortung:** Die aktuelle Antwort ist der Hauptinhalt. Ältere treten
  zurück (C-11).
- **Eingaben:** Textstrom, Status (wartend/streamend/fertig/unterbrochen),
  Haltung (nur indirekt über Formulierung, nicht als Label).
- **Zustände:** wartend (kein Token), streamend (Typewriter), fertig,
  unterbrochen (Teiltext + C-09).
- **Regeln:** Kein „Ich denke nach"-Text. Kein Skeleton mit Fake-Wörtern. Der
  Cursor ist kein Ladebalken. Lange Antworten scrollen mit der Seite, nicht in
  einem inneren Kasten. Die eigene Nachricht steht klein als Kontext darüber.
- **Accessibility:** Sichtbarer Typewriter; die Live-Region erhält den
  vollständigen Text nach Abschluss, nicht jedes Zeichen. Bei reduzierter
  Bewegung erscheint der Text sofort oder in größeren Blöcken.

### C-04 · Composer

- **Verantwortung:** Intent aufnehmen, ohne Formular-Zeremonie.
- **Eingaben:** Einzeiliger Text; Enter sendet; IME-Komposition wird respektiert.
- **Zustände:** leer (Senden aus), Entwurf (Senden an), gesperrt (Antwort läuft,
  Text bleibt editierbar), Fehler (Text bleibt, C-09).
- **Regeln:** Kein Autofokus. Kein Zeichenzähler ohne definierte Grenze. Keine
  Live-Validierung. Kein Platzhalter, der wie eine Systemmeldung klingt.
- **Accessibility:** Sichtbares Label oder `aria-label` „Nachricht an den
  Agenten"; Senden als echter Button, nicht als Icon ohne Namen; 48 px hoch.

### C-05 · MicControl

- **Verantwortung:** Voice ist freiwillig und beginnt ausschließlich nach Klick.
- **Eingaben:** Klick, Browser-Permission, Aufnahmezustand, Pegel.
- **Zustände:** bereit, angefragt, hört, verweigert, nicht verfügbar, gesperrt.
- **Regeln:** Kein Auto-Start, kein Autoplay, keine Aufnahme im Hintergrund.
  Stopp ist immer erreichbar, solange zugehört wird. Bei Verweigerung kein
  wiederholter Prompt.
- **Accessibility:** `aria-pressed`, wechselndes Label, 48 × 48 px,
  Zustandsänderung über C-13. Der Textweg bleibt sichtbar.

### C-06 · AppearanceSlider

- **Verantwortung:** Genau eine Achse, die Aussehen **und** Haltung verschiebt.
- **Eingaben:** Achsenbezeichnung (aus dem Gespräch), Wert,Startwert,
  Bestätigungsstatus.
- **Zustände:** `R0 unsichtbar` → `R1 benannt, passiv` → `R2 ziehbar`;
  zusätzlich synchronisierend, Fehler (Rücksprung), gesperrt.
- **Regeln:** Nie mehr als ein Regler in V1. Keine Farbe als einzige
  Wertinformation. Kein „Speichern"-Button. Kein Theme-Picker. Die Belegung
  entsteht im Gespräch: R0 vor der Benennung, R1 als Anzeige, R2 als Bedienung.
  R1 ist Pflicht; R2 ist Vorschlag (ADR-0004, „Offen").
- **Accessibility:** R1 ist **kein** Range-Element, sondern eine Anzeige mit
  Textwert, damit kein toter Regler fokussierbar ist. R2 hat `aria-valuetext`
  für Richtung und Haltung („eher warm, erzählend"), Thumb-Hitfläche 44 px,
  Pfeile, Home/End, PageUp/Down.

### C-07 · BackgroundResult

- **Verantwortung:** Ergebnis des einen Sub-Agenten still anzeigen.
- **Eingaben:** Ergebnis oder Fehler; Anzahl.
- **Zustände:** verborgen, Ergebnis, leer (keine Zeile), Fehler (leise Zeile).
- **Regeln:** Kein Fokuswechsel, kein Scroll, kein Ton, kein Toast, kein Badge.
  Keine zweite Sprechspur. Aufklappen ist inline, nicht modal.
- **Accessibility:** Disclosure mit `aria-expanded`; `aria-live="polite"` für
  die Verfügbarkeit; Zeile mindestens 44 px hoch; Escape schließt.

### C-08 · StatusLine

- **Verantwortung:** Abweichungen sichtbar machen, ohne im Normalfall zu stören.
- **Zustände:** verborgen (Default), verbindet, offline, degraded.
- **Regeln:** Im Erfolgsfall keine „online"-Anzeige. Keine Dauer-Spinner. Keine
  technischen Codes.
- **Accessibility:** `role="status"`, `aria-live="polite"`; Text, nicht nur
  Farbe oder Icon.

### C-09 · InlineError

- **Verantwortung:** Fehler an seinem Ort, mit genau einer klaren Aktion.
- **Zustände:** default, retry läuft, gesperrt, behoben, **Kontingent
  erschöpft**.
- **Regeln:** Kein Modal, kein Auto-Dismiss, kein Schuldton, keine rohen Codes.
  Eingabe und Teilantwort bleiben erhalten. Retry ist idempotent. „Kontingent
  erschöpft" ist ein normaler Betriebszustand, kein Defekt: Grund benennen,
  Voice sperren, Textweg offen lassen.
- **Accessibility:** `role="alert"` nur bei unmittelbarem Handlungsbedarf, sonst
  `role="status"`. Fokus wird nicht erzwungen; die Aktion ist per Tab erreichbar.

### C-10 · PermissionNotice

- **Verantwortung:** Mikrofon-Verweigerung erklären und den Textweg offen halten.
- **Zustände:** verweigert, nicht verfügbar, behoben.
- **Regeln:** Kein erneuter Browser-Prompt. Hilfe ist ein Disclosure, kein
  Modal. Keine Behauptung, dass Audio gespeichert oder nicht gespeichert wird,
  solange D7 offen ist.
- **Accessibility:** Klarer Text, Hilfe per Tastatur erreichbar, kein Farbzwang.

### C-11 · HistoryList

- **Verantwortung:** Ältere Antworten zurücktreten lassen, ohne sie zu verstecken.
- **Zustände:** leer, gefüllt, neue Antwort angekommen.
- **Regeln:** Keine Chat-Blasen, keine Avatare, keine Zeitstempel (nicht
  spezifiziert). Höchstens eine ruhige Kontextzeile pro Runde. Die aktuelle
  Antwort bleibt deutlich stärker.
- **Accessibility:** Logische Überschriften; ältere Inhalte bleiben im
  DOM erreichbar; neue Antwort wird angekündigt, nicht fokussiert.

### C-12 · NewAnswerAnchor

- **Verantwortung:** Tastatur- und Screenreader-Nutzern den Sprung zur neuen
  Antwort ermöglichen, ohne den Lesefluss zu kapern.
- **Zustände:** verborgen, sichtbar (wenn gescrollt und neue Antwort da).
- **Regeln:** Kein automatischer `focus()`. Der Link ist nur bei Bedarf sichtbar,
  aber per Tab erreichbar, sobald er existiert.
- **Accessibility:** Label „Zur neuen Antwort"; Ziel erhält `tabindex="-1"` nur
  als Sprungziel, nicht als Dauerfokus.

### C-13 · LiveRegion

- **Verantwortung:** Zustandsänderungen höflich ankündigen.
- **Zustände:** idle, announce.
- **Regeln:** Eine Region für Antwort, eine für Status; keine doppelten
  Ansagen. Der Typewriter wird nicht zeichenweise vorgelesen.
- **Accessibility:** `aria-live="polite"`, `aria-atomic="true"` für die Antwort;
  `role="status"` für Verbindung.

### C-14 · SkipLinks

- **Verantwortung:** Tastaturnutzern den Einstieg in die einzige Oberfläche
  erleichtern.
- **Zustände:** verborgen, fokussiert.
- **Regeln:** Nur bei Fokus sichtbar; keine dauerhafte visuelle Leiste.
- **Accessibility:** „Zur Eingabe", „Zur aktuellen Antwort"; sichtbarer Fokusring.

### C-15 · MotionToggle

- **Verantwortung:** Die automatische Dauerbewegung der Augen pausieren und
  fortsetzen (WCAG 2.2.2, Level A).
- **Zustände:** Bewegung an, pausiert.
- **Regeln:** Sobald sich die Augen automatisch bewegen, ist die Steuerung
  erreichbar. Sie ist ein leiser Textknopf, kein Einstellungsmenü. Im
  pausierten Zustand bleiben die Augen offen und zeigen denselben
  Präsenzzustand statisch. `prefers-reduced-motion` schaltet die Bewegung
  zusätzlich ab, ersetzt die Steuerung aber nicht.
- **Accessibility:** Label wechselt „Bewegung pausieren" / „Bewegung
  fortsetzen"; `aria-pressed`; 44 × 44 px; Fokusring; keine Zeitbegrenzung.

### C-16 · ConsentLine

- **Verantwortung:** Vor der ersten Aufnahme in einem Satz sagen, was
  aufgenommen wird, ohne einen zweiten Pflichtklick zu erzeugen.
- **Zustände:** ungesehen, gelesen.
- **Regeln:** Keine Checkbox, kein Modal, kein Formular. Details als Disclosure.
  Der Wortlaut ist gesperrt, bis D7 entschieden ist; bis dahin wird nichts
  versprochen, was nicht gilt.
- **Accessibility:** Text ist lesbar und per Tastatur erreichbar; das Disclosure
  hat `aria-expanded`; die Zeile verschiebt den Composer nicht.

## 4 · Token-Rollen (keine Werte)

Die eine Achse (F3/ADR-0004) braucht benannte Rollen. Das ist keine
Farbpalette und keine Designentscheidung über konkrete Werte.

| Rolle | Wofür | Vom Regler beeinflusst |
|---|---|---|
| `surface` | Grundfläche | ja (Temperatur) |
| `text` | Lesetext | ja (Kontrast/Temperatur) |
| `muted` | Verlauf, Nebenlinie | ja |
| `accent` | Fokusring, aktiver Zustand | ja |
| `border` | Trennlinien | ja |
| `focus` | Tastaturfokus | nein, muss immer sichtbar bleiben |
| `space-*` | Abstände | nein |
| `type-*` | Schriftgrößen/Gewichte | ja (Dichte) |
| `motion-*` | Dauer/Easing | nein, außer `reduced` |

**Harte Regel:** `focus` darf durch den Regler nie unter den Kontrastwert
fallen. Der Regler verändert Atmosphäre, nicht Bedienbarkeit.

## 5 · Responsive-Verhalten je Komponente

| Komponente | Desktop | Mobile | Regel |
|---|---|---|---|
| C-01 Stage | zentrierte Spalte 600–640 px | fluid, 16–20 px Rand | gleiche Reihenfolge |
| C-02 Eyes | 96–112 px | 56–72 px | nie ganz ausblenden |
| C-03 FocusAnswer | 20–24 px, 65–75 Zeichen | 18 px, volle Breite | keine innere Scrollbox |
| C-04 Composer | 640 px, unten | volle Breite, Safe-Area | bei Tastatur sichtbar |
| C-05 Mic | 48 px, rechts | 48 px, links unter dem Feld | 44 px Minimum |
| C-06 Slider | 640 px, einzeilig | volle Breite, einzeilig | Thumb 44 px |
| C-07 Background | in der Spalte | volle Breite, 44 px Zeile | kein Modal |
| C-08 Status | leise, oben/unten | leise, oben | nur bei Abweichung |
| C-09 Error | in der Antwortfläche | volle Breite | kein Modal |
| C-11 History | gedämpft, Spalte | gedämpft, volle Breite | kein horizontales Scrollen |
| C-15 Motion | Ecke oben rechts, Textknopf | Ecke oben rechts, 44 px | verdeckt nie den Composer |
| C-16 Consent | Zeile am Composer | Zeile am Composer | eine Zeile, kein Modal |

## 6 · Accessibility-Prüfliste

Bezugsrahmen: WCAG 2.2 AA. Das ist eine Prüfliste, kein Zertifikat.

| Bereich | Anforderung | Prüfung |
|---|---|---|
| Tastatur | Alles ohne Maus erreichbar; kein Trap | Tab durch alle Zustände, Escape, Enter, Pfeile |
| Fokus | Sichtbar, 3:1, nie durch Regler unlesbar | Fokusring bei jeder Achsenstellung |
| Touch | 44 × 44 px Designziel, 24 × 24 px Minimum | 360-px-Viewport, Daumen |
| Lesbarkeit | 16 px Minimum, 1.5 Zeilenhöhe, 65–75 Zeichen | 200 % Zoom, 320 px Reflow |
| Kontrast | 4.5:1 Text, 3:1 große Schrift/Fokus | beide Achsenenden |
| Farbe | Nie alleinige Bedeutung | Reglerwert als Text; Fehler als Text |
| Bewegung | `prefers-reduced-motion` respektieren | Augen, Typewriter, Scrollen |
| Dauerbewegung | Pause/Stop für automatische Augen (WCAG 2.2.2 A) | C-15 sichtbar, per Tastatur bedienbar, Zustand bleibt verständlich |
| Betriebsgrenze | Kontingent erschöpft ist sichtbar und kein Dead End | Voice gesperrt, Textweg offen, Grund genannt |
| Screenreader | Antwort vollständig, nicht zeichenweise | Live-Region-Test |
| Sprachwechsel | Voice englisch, Text laut D5 markiert | `lang`-Attribute |
| Fehler | Klar, konkret, mit Aktion, kein Auto-Dismiss | alle WF-10-Varianten |
| Zeit | Keine Zeitlimits, keine auto-schließenden Meldungen | Errors offen lassen |
| Audio | Kein Autoplay; Text ist immer vollständig | Ankunft, Voice, TTS-Ausfall |

## 7 · Was hier bewusst nicht gebaut wird

- Kein Chat-Widget, keine Blasen, kein Verlauf-Panel.
- Kein Theme-Picker, kein Einstellungsdialog, kein „Personalisieren"-Menü.
- Kein Onboarding, keine Tour, keine Tooltips.
- Kein Einstellungsmenü für Bewegung; nur der eine Pause-/Stop-Textknopf (C-15).
- Kein Toast-, Modal- oder Notification-System.
- Kein zweiter oder dritter Regler.
- Keine Karten, Badges, Avatare, Zeitstempel ohne Anforderung.
- Keine eigene Icon- oder Typografie-Bibliothek.
- Kein Frontend-Code in diesem Schritt.
