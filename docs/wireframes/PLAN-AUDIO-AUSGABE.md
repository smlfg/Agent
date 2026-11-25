# PLAN — Audio-Ausgabe des Agenten

Stand: 20.11.2026 · Status: **VORSCHLAG zur Owner-Abnahme — kein Build.**
Verfasser: UX/Interaction-Architektur (OpenCode) · Bezug:
[`agentfaehig-wireframe.html`](agentfaehig-wireframe.html),
[`wireframe-prototype-interactive.md`](wireframe-prototype-interactive.md)

> **Control-Plane-Status: DEGRADED (sichtbar, nicht still).**
> `hai_health` ist `ok`, aber `hai_open_mission` antwortet
> `active_mission_exists` (`M-20261119T194948-3db0ab44`, T1-Messlauf), Lane-Limit
> 2 (`prezero-clean`, `brueggen`). Dieser Plan entsteht ohne Mission und ohne
> Lease. Es wurde nichts implementiert, committet, gepusht oder deployt.

---

## 0 · Befund

Voice ist im Konzept und im Live-Stand **nur als Eingang** behandelt:

| Ort | Ist-Stand | Lücke |
|---|---|---|
| Konzept v0.2 | `USER_SPEAKING`, Mikro, Pegel, Transkript, Text-Fallback | kein Zustand für **Agenten-Stimme**, kein Control, keine Fehler |
| Live `agentfähig.de` (20.11., read-only) | `Send` + `Speak instead of typing`; kein Ausgabe-Control im DOM | Agent spricht nicht hörbar |
| `PROJECT_CONTRACT` T5 | „Voice rein/raus … `first_audio_ms`" | **Ausgabe ist bereits Pflicht**, nicht nur Eingang |
| `DESIGN-DECISIONS` DD:14 | „Ohne hörbaren Ton: Antwort auch als Text; eine sanfte visuelle Reaktion signalisiert die Antwort." | Default ist Stille — Audio muss **opt-in** sein, nicht Standard |

Der Plan schließt die Konzeptlücke und hält DD:14 ein. Er ändert **keine**
bestätigte Entscheidung; sollte Ton zum Default werden, ist das eine neue
DD-Zeile und Owner-Sache.

## 1 · Nicht verhandelbare Randbedingungen

| # | Bedingung | Quelle |
|---|---|---|
| A0 | **Kein Ton ohne ausdrückliche Handlung.** Default `speech=OFF`. | DD:14, autoplay-Policy |
| A1 | Audio ist eine **zweite Darstellung derselben Antwort**, nie neuer Inhalt. | ADR-0002 |
| A2 | Text bleibt vollständig und primär; **keine Information nur im Audio**. | DD:14, Q1 |
| A3 | Stimme ist **Englisch** (DD:25); der Textkanal ist offen (D5). | DD:25 |
| A4 | Ein sichtbares Stop; Unterbrechung ≤ 150 ms; kein Auto-Resume. | VISION „nicht bevormundend" |
| A5 | Kein simulierter Pegel, keine erfundene Sprechbewegung; nur echte Ereignisse. | Q1, VISION:108–110 |
| A6 | `first_audio_ms` wird gemessen, nicht geschätzt. | T5, Messlauf |
| A7 | Kein Mikrofon im selben Moment wie Ausgabe (kein Echo). | Q4 |

## 2 · Produktform (Vorschlag)

1. **Ein Control**: Lautsprecher-Zeichen im Composer, neben Senden und Stimme
   (44 px). Klick schaltet die Ausgabe für die Sitzung ein; erneuter Klick aus.
2. **Erste Aktivierung** zeigt genau einen Satz im Text (kein Modal):
   „Die Stimme ist Englisch. Der Text bleibt deutsch." Danach startet die
   Ausgabe — der Klick ist die Einwilligung, der Satz nur die Information.
3. **Sprechen beginnt mit dem ersten vollständigen Satz**, nicht mit dem ersten
   Token. Verhindert TTS-Neustarts mitten im Stream.
4. **Satzweise**: Text streamt wie heute; jede fertige Sentenz geht in die
   Sprech-Queue. Bei Abbruch wird die Queue verworfen.
5. **Wort-Hervorhebung** folgt echten Boundary-Ereignissen der TTS; ohne
   Ereignisse bleibt der Text ruhig (kein Fake-Karaoke).
6. **Kein Mund, kein Avatar.** Das Auge bleibt ruhig; optional senkt sich das
   Unterlid um 6 % (echter Zustand, kein „Sprechen"-Theater).
7. **Stop** ist immer sichtbar, solange gesprochen wird; `Esc`, Tippen oder
   Mikro-Klick stoppen ebenfalls.
8. **Mobile**: gleiches Control; iOS-Stummschalter ist nicht auslesbar → es wird
   **nicht** behauptet, Ton sei an. Bei fehlender Ausgabe erscheint der Hinweis
   erst, wenn ein echtes Ereignis ihn belegt.

## 3 · Zustandsdimension `speech` (orthogonal)

| Wert | Auslöser | Sichtbar | Erlaubt | Verboten |
|---|---|---|---|---|
| `OFF` | Default; Klick auf Lautsprecher (aus) | Icon aus, kein Ribbon | alles andere | Ton, Behauptung „stumm" |
| `ARMING` | Erster Klick | ein Infosatz, Icon halb | Start nach Satz | Modal, zweiter Klick-Zwang |
| `SPEAKING` | erster vollständiger Satz | Ribbon + Wort-Hervorhebung + Stop | Pause, Stop, Scrub im Verlauf | Overlap mit Mikro |
| `PAUSED` | Tab verborgen / OS-Unterbrechung | Ribbon steht, „pausiert" | Weiter per Klick | Auto-Resume ohne Klick |
| `INTERRUPTED` | Tippen, Mikro, Esc, Stop | Ribbon weg, Text bleibt | neuer Turn | Nachsprechen des Rests |
| `BLOCKED` | Autoplay verboten, Stummschalter belegt | eine sachliche Zeile | Textweg | Retry-Schleife, „Ton läuft" |
| `UNAVAILABLE` | keine Stimme für Sprache, Provider-Fehler | eine Zeile, Text weiter | manuell erneut | stiller Fehlschlag |

**Nicht erlaubt:** `SPEAKING` ohne vorheriges `ARMING`; `RESPONDING → SPEAKING`
automatisch; `INTERRUPTED → SPEAKING` ohne neuen Klick; Audio als einziger Träger
einer Aussage; Sprechen während `USER_SPEAKING`.

**Recovery:** Reload → `speech=OFF` (keine stille Wiederaufnahme). War die
Ausgabe an, zeigt der Lautsprecher beim nächsten Besuch „aus", nicht „an".

## 4 · Ablauf „erste Audio-Ausgabe"

| Zeit | Ereignis | Sichtbar | Typ |
|---|---|---|---|
| 0 | Nutzer klickt Lautsprecher | Icon wechselt, Infosatz | E |
| +200 ms | Satz steht | eine Zeile, 160 ms Fade | E |
| Antwort-Token | Text streamt | wie heute | E |
| erster Satz vollständig | TTS startet | Ribbon, erstes Wort hervorgehoben | E |
| Satzende | nächster Satz | Hervorhebung wandert | E |
| Antwortende | Queue leer | Ribbon aus, Icon bleibt an | E |
| Tippen / Esc / Mikro | Stop | Ribbon weg in ≤ 150 ms | E |

Der 20-Sekunden-Ablauf bleibt **unverändert still**, solange niemand den
Lautsprecher aktiviert. Damit ist Audio kein Bestandteil des Erstversprechens,
sondern eine ruhige Erweiterung.

## 5 · Fehlerfälle (sichtbar, je eine Zeile)

| Fall | Text | Verhalten |
|---|---|---|
| Autoplay blockiert | „Ton braucht einen Klick." | `BLOCKED`; Klick startet erneut |
| Keine englische Stimme | „Für diese Stimme fehlt die Ausgabe." | `UNAVAILABLE`; Text bleibt |
| Provider/TTS-Fehler | „Die Stimme ist ausgefallen — die Antwort steht als Text." | `UNAVAILABLE`; kein Retry-Sturm |
| iOS-Stummschalter | „Ton ist am Gerät aus." **nur wenn belegt** | `BLOCKED` |
| Netz weg mitten im Satz | Ribbon stoppt, Satz bleibt Text | `INTERRUPTED` |
| Nutzer tippt während Ausgabe | sofort still | `INTERRUPTED` |

## 6 · Accessibility

- **Text ist die Untertitelung.** Die Antwort wird beim Sprechen nie versteckt
  oder gekürzt.
- **Keine Doppelvertonung:** Screenreader-Nutzer hören sonst App-TTS **und**
  ihre eigene Ausgabe. Vorschlag: während `SPEAKING` wird die
  `aria-live`-Ansage der Antwort unterdrückt; der Text bleibt im DOM und
  navigierbar. → offene Entscheidung A-04.
- **`Pause motion` stoppt kein Audio.** Zwei getrennte Size-Regler: Bewegung
  (visuell) und Stimme (hörbar). Beides sichtbar, beides einzeln.
- Kein Informationsverlust bei 200 % Zoom, kein Audio-only-Status.
- Sprachausgabe ist nie Voraussetzung für eine Funktion.

## 7 · Messung (Teil von T5)

| Größe | Definition | Warum |
|---|---|---|
| `first_audio_ms` | Submit → erster hörbarer Sample | Kernzahl aus T5 |
| `speech_start_delay_ms` | erster Token → erster Sample | zeigt TTS-Kosten |
| `barge_in_ms` | Nutzeraktion → Stille | Unterbrechbarkeits-Versprechen |
| `sentence_abort_rate` | abgebrochene Sätze / gestartete | Qualität der Queue |
| `mute_rate` | Ausgabe sofort wieder aus | Produkturteil „nervt" |

Der Messlauf bleibt eigenständig (ADR-0001); dieser Plan erfindet keine
Zielwerte. Ein lokaler `wrangler dev`-Wert ist keine Produktionslatenz.

## 8 · Arbeitsschnitte

| # | Schnitt | Dateien | DoD | Gate |
|---|---|---|---|---|
| S1 | Konzept ergänzen: Dimension, Frame `AGENT_SPEAKING`, §7 Ausgang, Motion-Zeilen, L10, offene Punkte | `docs/wireframes/agentfaehig-wireframe.html`, `…-interactive.md` | Screenshots, `validate.sh` 0, keine Konsolenfehler | Owner sieht es |
| S2 | Prototyp-Demo **Browser-TTS** (Web Speech API), klar beschriftet, kein Autoplay | dieselbe HTML-Datei | Sprechen/Stop/Wort-Hervorhebung, `speech=OFF` beim Laden | Design-Freigabe |
| S3 | Live-Fähigkeit: Provider-Entscheidung, englische Stimme, Instrumentierung | `src/`, `deploy/` | echter Ton, `first_audio_ms` geloggt | Mission/Lease + D8 |
| S4 | Messlauf-Integration | `tech/MESSLAUF-PLAN.md`, Protokoll | 20 Wechsel, Median dokumentiert | T5 |
| S5 | Owner-Abnahme: 2 Personen hören zu | Protokoll | „hilft / nervt / neutral" | Owner |

S1 und S2 sind Designarbeit ohne Produktivcode. S3–S5 brauchen einen
autorisierten Lauf; dieser Plan startet sie nicht.

## 9 · Offene Owner-Entscheidungen

| ID | Frage | Vorschlag |
|---|---|---|
| A-01 | Deutsche Stimme | geparkt (DD:25), nicht Teil von S1/S2 |
| A-02 | Automatisch sprechen, wenn per Mikro gefragt wurde? | **nein** in V1; erst nach S5 |
| A-03 | Satzweise oder ganze Antwort sprechen? | satzweise (früherer Ton, kein Neustart) |
| A-04 | Screenreader-Doppelvertonung | `aria-live` während `SPEAKING` stumm, Text bleibt |
| A-05 | Stimm-Persona / Provider | erst nach Messlauf und Kostenentscheidung (D8) |

## 10 · Nicht-Ziele

Kein Autoplay, kein Wake-Word, kein Always-Listening, keine Audio-only-Aussage,
kein Voice-Cloning, keine deutsche Stimme in diesem Schnitt, keine
Einstellungsseite, kein Deploy, keine Änderung an DD:14.

## 11 · Risiken

| Risiko | Wirkung | Gegenmittel |
|---|---|---|
| Ton nervt im Büro/allgemein | sofort aus, Urteil „Spielerei" | Default aus, ein Control, `mute_rate` messen |
| Englische Stimme + deutscher Text | Bruch | einmaliger Infosatz, `lang` korrekt setzen, A-01 |
| TTS-Latenz | „kaputte Illusion" | satzweise, `speech_start_delay_ms` messen |
| Doppelvertonung | Screenreader-Chaos | A-04 |
| Autoplay-Policy | Ton startet nicht | Klick ist der Start, `BLOCKED` sichtbar |
| Providerkosten | Budget | D8 vor S3 |

## 12 · Definition of Done für diesen Plan

- [ ] Samuel hat A-01…A-05 gesehen (keine muss jetzt entschieden werden).
- [ ] S1 ist als nächster Design-Schnitt freigegeben oder abgelehnt.
- [ ] Kein Code, kein Commit, kein Deploy durch diesen Plan.

**Nächster Schritt:** S1 — die Dimension `speech` und den Frame
`AGENT_SPEAKING` in das bestehende Wireframe-Artefakt einfügen, ohne den
20-Sekunden-Ablauf hörbar zu machen.
