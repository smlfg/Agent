# Fremdtest-Plan — fünf Personen, erste explorative Runde

Stand: 19.11.2026. **Status: VORSCHLAG — nicht freigegeben, nicht ausgeführt.**
Dieses Dokument enthält **keine Ergebnisse**. Es ersetzt
[`ADR-0005`](../docs/adr/ADR-0005-fremder-testet.md) nicht und ändert dessen
Entscheidung (eine Person, 20 Sekunden, zwei Fragen) nicht; es macht daraus ein
ausführbares Protokoll und benennt, was eine einzelne Person nicht tragen kann.

Bezug: `ADR-0005` (Entscheidung), [`UX-INFORMATIONSARCHITEKTUR.md`](../docs/UX-INFORMATIONSARCHITEKTUR.md)
§6 A16 (First-Click-Test, ~5 Personen), `docs/EXECUTION_PLAN-M0-M5.md` M3/M5
(Fremdtest als Gate vor dem Ausbau), `docs/PROJECT_CONTRACT.md` P1–P4.

## 0 · Belegstand dieses Plans

| Label | Inhalt |
|---|---|
| **VERIFIED** | Es gibt 0 Fremdtests, 0 Anwendungscode und keine Aufzeichnung (`docs/EXECUTION_PLAN-M0-M5.md` §1; `src/README.md`; `tests/README.md`). |
| **RECOMMENDED** | Stichprobe, Aufgaben, Kriterien, Schwellen, Fehlerklassen, Abbruchregeln — begründet, nicht beschlossen. |
| **HYPOTHESIS** | Dass fünf Personen die Blockaden finden, die eine Person verbirgt; und dass die Kriterien S1–S10 den Kernnutzen messen statt Politur. |
| **REJECTED** | Ein bestandenes n = 5 als Gate-PASS. Es ist ein Screening; das Gate braucht danach den Pilot (M5). Ebenfalls verworfen: Think-Aloud in den ersten 20 Sekunden, weil es die Messung zerstört. |

## 1 · Zweck

Der Test prüft die fünf Wahrnehmungen, nicht den Geschmack: Ist interaktiv
erkennbar, ist natürliche Kommunikation möglich, ist Reaktion sichtbar, ist
Veränderung erlebbar, bleibt Kontrolle? Ästhetik wird **nicht** bewertet.

## 2 · Stichprobe (n = 5)

Ausschluss: kennt das Projekt, hat Skizze oder Wireframes gesehen, arbeitet im
Agenten-/HAI-Umfeld, ist Samuel.

| Person | Profil | Zusatzbedingung |
|---|---|---|
| P1 | Kein Tech-Hintergrund, 30–60 | — |
| P2 | Mobil-first, nutzt fast nur das Handy | eigenes Gerät, Touch |
| P3 | Nutzt täglich ChatGPT | prüft, ob „kein Chat" den Experten verwirrt |
| P4 | Systemeinstellung „Bewegung reduzieren" | **Tastatur-only**, keine Maus |
| P5 | Kein Mikrofon / verweigert Freigabe | **ohne Mikrofon** |

P4 und P5 decken die geforderten Zusatzbedingungen. Zusätzlich ein
**deterministischer** Barrierefreiheits-Durchlauf (kein Teilnehmer, zählt nicht
als UX-Evidenz): Tab-Reihenfolge, Fokusring, Esc-Stop, Regler per Pfeiltasten,
`aria-live`, Augen `aria-hidden`, WCAG 2.2.2 (Pause/Stop) nach
`UX-INFORMATIONSARCHITEKTUR.md` §2.7.

## 3 · Aufbau

- **URL:** `agentfähig.de` oder eine ungelistete Preview — aber nur nach dem
  Preflight in §3a. Die Domain zeigt seit 19.11. die Living Surface; ohne
  Provider antwortet sie `DEV DATA` (siehe `docs/UNSOLVED-TECHNIK.md` U29).
- Frisches Browserprofil, keine Extensions, Zoom 100 %, 1440×900 (P2 eigenes Gerät).
- Bildschirm **und** Audio in **einer** Aufnahme (gemeinsame Uhr).
- Kein Think-Aloud in den ersten 20 Sekunden.
- Moderation sitzt seitlich, schweigt, notiert nur Zeitmarken und Hinweise.

### 3a · Preflight vor jeder Sitzung (sonst INVALID)

1. `curl -s -X POST https://www.xn--agentfhig-02a.de/api/agent -H 'content-type: application/json' -d '{"prompt":"preflight"}'`
   → HTTP 200 und JSON mit `text`.
2. Seite laden, eine Testnachricht senden, im DOM prüfen: kein „DEV DATA".
3. Erst dann Teilnehmer einladen. Schlägt 1 oder 2 fehl, ist die Sitzung
   **INVALID** — kein Datenpunkt, kein „interessantes Ergebnis".

**Startwortlaut (wörtlich, nicht erweitern):**

> „Ich zeige dir eine Seite. Schau sie dir an. Ich sage erstmal nichts. Sag
> Bescheid, wenn du fertig bist oder wenn du etwas ausprobieren willst."

Timer startet beim ersten Paint.

## 4 · Aufgaben

| # | Auftrag | Erfolg beobachtbar |
|---|---|---|
| **T1** | *(keine Aufgabe — 20 s freie Beobachtung)* | Eine willentliche Handlung ≤ 20 s ohne Ansprache (tippen, Eingabe klicken, sprechen) |
| **T2** | „Schreib der Seite, was du von ihr willst." | Nachricht ohne Hilfe abgeschickt, Antwort erscheint, Teilnehmer liest sie |
| **T3** | „Sorg dafür, dass sie anders aussieht." *(verrät den Regler nicht)* | Findet Steuerung **oder** erreicht es sprachlich; benennt ≥ 2 veränderte Dimensionen (nicht nur Farbe) |
| **T4** | „Mach das rückgängig." | Findet Rückgängig oder handelt neu aus |
| **T5** | „Lass sie etwas im Hintergrund tun — und finde später das Ergebnis." | Startet, arbeitet weiter, findet Ergebnis ohne Hilfe ≤ 2 min |
| **T6** | *(nur wenn Voice gebaut)* „Sprich mit ihr." | Erklärt die Freigabe in eigenen Worten; kann stoppen und stumm schalten; weiß, ob das Mikrofon an ist |

Hinweise sind standardisiert und zählbar: **H1** „Du kannst sie auch ansprechen."
**H2** „Vielleicht ist irgendwo etwas, das du bewegen kannst." Mehr als zwei
Hinweise pro Aufgabe = Aufgabe nicht bestanden.

## 5 · Zeitmarken

`T0 first paint · T_first_action · T_first_keystroke · T_send · T_first_char ·
T_response_complete · T_pref_change · T_undo · T_result_found · T_mic/T_stop`
(je Sitzung eine Zeile, siehe §9).

## 6 · Erfolgskriterien (Vorschlag, n = 5)

| ID | Kriterium | Schwelle |
|---|---|---|
| S1 | Erste willentliche Handlung ≤ 20 s ohne Ansprache | ≥ 4/5 |
| S2 | Eingabe gefunden ≤ 60 s, ≤ 1 Hinweis | 5/5 |
| S3 | Nachricht ohne Fehlabsendung und ohne Hilfe gesendet | 5/5 |
| S4 | Antwort gelesen und in eigenen Worten wiedergegeben | 5/5 |
| S5 | Präferenzänderung erzeugt und benannt (≥ 2 Dimensionen) | ≥ 3/5 |
| S6 | Rückgängig gefunden | ≥ 4/5 |
| S7 | Hintergrundresultat entdeckt | ≥ 4/5 |
| S8 | Voice-Freigabe verstanden, Stop funktioniert *(nur falls gebaut)* | 2/2 der Voice-Fälle |
| S9 | Kritische Fehler | 0 |
| S10 | Unaufgeforderte Unheimlichkeits-/Überwachungsäußerung | 0 |

**Grenze:** Auch 5/5 ist **kein Gate-PASS**. n = 5 widerlegt nichts und beweist
nichts; es findet Blockaden. Das UX-Gate braucht danach den Pilot mit 2–3
weiteren Fremden und einen Fix-Zyklus.

## 7 · Verständnisfragen (nach den Aufgaben, offen)

1. „Was hat die Seite gerade gemacht?" *(wörtlich wie in `ADR-0005`)*
2. „Was glaubst du, was sie kann — und was nicht?"
3. „Woran hättest du gemerkt, dass sie dich verstanden hat?"
4. „Hast du irgendwann nicht gewusst, ob sie noch arbeitet?"
5. „Würdest du das jemandem zeigen? Wem — und was würdest du dabei sagen?"
6. „War irgendetwas unangenehm?" *(zuletzt, neutral)*
7. Erzwungene Wahl: „Eher Website, Werkzeug oder Gegenüber?" — danach „warum?"

## 8 · Kritische Fehler

| ID | Definition | Warum kritisch |
|---|---|---|
| E1 | Eingabe in 60 s nicht gefunden (ohne Hinweis) | Kerninteraktion nicht auffindbar |
| E2 | Unbeabsichtigtes Senden / ungewollte Aktion | Vertrauensverlust |
| E3 | Nutzer glaubt, das Mikrofon sei an, obwohl es aus ist (oder umgekehrt) | Datenschutz; sofortiger Abbruch |
| E4 | Laufende Ausgabe/Stimme nicht stoppbar | Kontroll-Gate verfehlt |
| E5 | Veränderung ohne benennbare Ursache oder als Bug gedeutet | Kernnutzen nicht vermittelt |
| E6 | Hintergrundresultat nie entdeckt | Architekturbeweis für den Nutzer nicht existent |
| E7 | Nach einem Fehler ist die Sitzung nicht fortsetzbar | Fehler-UX fehlt |
| E8 | Unaufgeforderte Äußerung „beobachtet / unheimlich" | Kritisch auch bei bestandenen Aufgaben |

## 9 · Abbruchkriterien

- Widerruf der Einwilligung oder sichtbares Unbehagen → sofort Ende.
- Drei Hinweise bei einer Aufgabe → Aufgabe FAIL, weitergehen; kein Retten.
- 5 Minuten ohne Fortschritt → Sitzung beenden, als E1 protokollieren.
- Prototypfehler → einmal notieren, nicht wiederholen; bei Wiederholung Ende.
- Moderator will erklären → notieren; genau das ist der Befund.

**Datenblatt je Sitzung:** `P-ID · Datum · Gerät/Browser · Bedingung · T0 ·
T_first_action · T_first_keystroke · T_send · T_first_char ·
T_response_complete · T_pref_change · T_undo · T_result_found · H1/H2 · E* ·
Zitate wörtlich · Urteil`.

## 10 · Auswertung und Grenzen

Pro Person eine Zeile; Kodierung der Beobachtungen; **Anzahl** und wörtliche
Zitate, keine Mittelwerte bei n = 5. „Hat es funktioniert" und „hat es getragen"
getrennt bewerten. Das Urteil wird aus den vorregistrierten Kriterien berechnet,
nicht aus dem Eindruck des Bauherrn.

Was diese Runde **nicht** sagen kann: keine Signifikanz, keine Generalisierung,
kein Beweis emotionaler Wirkung, keine Aussage über Besucher außerhalb der
Stichprobe. Sie findet Blockaden — das ist ihr Zweck.

## 11 · Abgrenzung

- `ADR-0005` bleibt die Entscheidung (eine Person, 20 s, zwei Fragen). Dieses
  Protokoll ist die größere Runde für M3/M5 und braucht eine eigene Freigabe.
- Es ersetzt **nicht** die Latenzmessung (`tech/MESSLAUF-PLAN.md`) und nicht die
  technische Abnahme.
- Keine Analytics, kein A/B, keine Aufbewahrung personenbezogener Daten über die
  Sitzung hinaus.
