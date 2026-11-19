# Interaktiver Lo-Fi-Prototyp — Storyboard, Zustände, Motion

Stand: 19.11.2026 · Rolle: UX-Architektur / Motion / HCI ·
Status: **VORSCHLAG zur Owner-Abnahme — nicht freigegeben, kein Build.**

> **Control-Plane-Status: DEGRADED (sichtbar, nicht still).**
> `hai_health` ist `ok`, aber `hai_open_mission` antwortet
> `active_mission_exists` (`M-20261119T194948-3db0ab44`, T1-Messlauf), und das
> Lane-Limit ist mit `prezero-clean` + `brueggen` erschöpft. Dieses Artefakt
> entsteht **ohne Mission und ohne Lease**; es ist Designarbeit, kein
> autorisierter Lauf. Backfill: Mission öffnen oder Orphan per Owner-Gate
> superseden. Nichts wurde committet, gepusht oder deployt.

## Was hier vorliegt

[`agentfaehig-wireframe.html`](agentfaehig-wireframe.html) ist **eine**
selbstständige HTML-Datei (kein Build, keine Abhängigkeiten, kein Netzwerk,
kein Speicher). Sie ist die visuelle und zeitliche Ergänzung zum
Markdown-Wireframe-System in [`README.md`](README.md): bewegte Komposition,
20-Sekunden-Storyboard, anklickbarer Zustandsprototyp.

**Kein Produktivcode.** Die Datei liegt unter `docs/wireframes/`, nicht unter
`src/`. Sie enthält keinen Transport, kein Modell, keinen Zustandsspeicher und
keine Tests. Sie ist ein Design-Artefakt.

## Öffnen

```bash
open docs/wireframes/agentfaehig-wireframe.html
# oder, wenn der Browser file:// nicht erlaubt:
cd docs/wireframes && python3 -m http.server 8765
# → http://127.0.0.1:8765/agentfaehig-wireframe.html
```

Ein Moment lässt sich direkt verlinken: `?t=15.8` startet das Storyboard bei
15,8 Sekunden (`t` zwischen 0 und 20).

## Lieferung A–I

| Teil | Ort in der Datei | Inhalt |
|---|---|---|
| A · Low-Fi-Kompositionen | `#zustaende` | 13 Karten: DORMANT, AWAKENING, PRESENT, USER_TYPING, PROCESSING, RESPONDING, ADAPTING, ADAPTED, BACKGROUND_WORKING, BACKGROUND_RESULT_READY, ERROR, DISCONNECTED, USER_SPEAKING |
| B · 20-Sekunden-Storyboard | `#storyboard` | bedienbare Bühne, Zeitachse, 8 Momente mit Komposition, Fokus, Timing, Aktion, Reaktion, Übergang, Unterbrechung, reduzierte Variante |
| C · Zustands- und Übergangsdiagramm | `#zustaende` | 7 orthogonale Dimensionen als SVG, vollständige Übergangstabelle, verbotene Übergänge, Recovery-Tabelle |
| D · Motion Specifications | `#motion` | 22 Zeilen mit Auslöser `T`/`E`, Eigenschaft, Werten, Dauer, Easing, Unterbrechbarkeit, reduzierte Variante |
| E · Typografie und Antwortdarstellung | `#typo` | Rollen, Größen, Regeln, lauffähige Typewriter-Demo mit Rate, Wortlänge und Puffer-Stillstand |
| F · Live-Anpassung | `#regler` | Ablauf in 6 Schritten, ziehbarer Regler mit Undo, drei Ebenen (visuell / Tonalität / Fähigkeiten), Nebenwirkungsliste |
| G · Voice | `#voice` | 9 Zustände, Regeln, echter Mikro-Test nach Klick, simulierte Pegelanzeige (beschriftet), Verweigerungszustand |
| H · Desktop und Mobil | `#responsive` | zwei Geräterahmen plus Unterschiedstabelle |
| I · Prototyp-Spezifikation | `#prototyp` | Bedienung, ehrliche Simulationsliste, Abnahmekriterien L1–L8, Übergabe an den Erstbau |

## Verhältnis zum Markdown-Wireframe-System

| Dieser Prototyp | Prüfanker dort |
|---|---|
| DORMANT / AWAKENING | WF-01 · Ankommen |
| PRESENT | WF-02 · Bereit |
| USER_TYPING | WF-03 · Schreiben |
| PROCESSING / RESPONDING | WF-04 · Antwort im Fokus |
| ADAPTING | WF-06 · Regler bewegen |
| ADAPTED | WF-07 · Veränderter Zustand |
| BACKGROUND_WORKING / RESULT_READY | WF-08 · Hintergrund-Ergebnis |
| USER_SPEAKING | WF-09 · Voice nach Klick |
| ERROR / DISCONNECTED | WF-10 · Fehler |
| Recovery nach Reload | WF-11 · Wiederkehr / Reload |
| Verlaufsregeln in §04 | WF-12 · Verlauf |

Die Zuordnung ist eine Lesehilfe, keine neue Quelle. Wo beide Systeme
abweichen, gilt die dokumentierte Entscheidung aus
[`DESIGN-DECISIONS.md`](../DESIGN-DECISIONS.md) — und offene Punkte bleiben
offen.

## Was simuliert ist

- Agentenantworten sind feste Beispieltexte, kein Modell.
- Der Hintergrundjob ist ein Timer, kein Sub-Agent.
- Typewriter-Raten sind Vorschläge, keine Messung.
- Es gibt keine Latenzmessung und keine Latenzaussage.
- Persistenz über Reload ist **nicht** implementiert, aber als Anforderung
  (`Q2`) spezifiziert.
- Der Mikrofon-Test ist echt (nach Klick); der simulierte Pegel ist sichtbar
  als „SIMULIERT · Prototyp" beschriftet.

## Geprüft (19.11.2026)

| Prüfung | Ergebnis |
|---|---|
| Datei lädt ohne Konsolenfehler (Chrome, lokal) | keine Einträge im Console-Buffer |
| Storyboard abspielen / pausieren / scrubben / überspringen | Phasen wechseln korrekt (`dormant` → `ready` → `responding` → `adapted`), Uhr folgt |
| Reduzierte Bewegung | `body.reduced`, Augen und Übergänge ohne Animation, Information bleibt |
| Regler + Undo | Fläche und Beispieltext wechseln; Undo stellt 0,62 her; Fakten beider Sätze identisch |
| Fast/Slow A/B | Ergebnis-Karte erscheint; Chips nur in Variante B; kein Fokuswechsel |
| Voice simuliert / Stop | Pegel sichtbar, Zustand `USER_SPEAKING` → `TEXT_IDLE`, Stop entfernt Ring und Pegel |
| Layout | Screenshots bei 1440 px und 390-px-Rahmen; keine horizontale Überläufe der Seite |

Diese Prüfungen belegen Bedienbarkeit des Artefakts, **nicht** Produktwirkung.
Der Fremdtest (`ADR-0005`, `P1`) ist damit nicht bestanden.

## Offene Punkte, die dieser Prototyp sichtbar macht

| ID | Punkt | Status |
|---|---|---|
| P-01 | Fokuswechsel erst nach vollständiger Antwort (SETTLED) | Vorschlag; Alternative „ab erstem Token" offen |
| P-02 | Wiederkehr-Besuch: erneutes Erwachen bei 5 s ohne Pre-Glow | Vorschlag |
| P-03 | Verlauf: genau zwei angeschnittene ältere Antworten | Vorschlag, Lesetest nötig |
| P-04 | Mobile Erwachen 4,0 s statt 5,0 s | Vorschlag, keine Messung |
| P-05 | Reduzierte Bewegung ohne Blinzeln: bleibt Präsenz erhalten? | Test offen |

Nicht eingeführt und nicht entschieden: automatisches, ungefragtes Sprechen
(`T4`), zweiter/dritter Regler, deutsche Stimme, Bild-Eingang.

## Prüfung des Repos

```bash
bash scripts/validate.sh
```

Der Check prüft Gerüst und lokale Markdown-Verweise, nicht die Funktion einer
Anwendung.
