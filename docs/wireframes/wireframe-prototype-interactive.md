# Interaktiver Lo-Fi-Prototyp — Storyboard, Zustände, Motion

Stand: 20.11.2026 · v0.2 · Rolle: UX-Architektur / Motion / HCI ·
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

**v0.2 ist an den Live-Stand vom 20.11.2026 angepasst.** `agentfähig.de` ist
öffentlich erreichbar; die Anatomie (ein Auge rechts, Composer unten, warme
Palette, Fußzeile mit „Pause motion") stammt von dort. Die erste Fassung mit
zwei abstrakten Augen und einer Haarlinie im Feld ist damit überholt.

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
| C · Zustands- und Übergangsdiagramm | `#zustaende` | 8 orthogonale Dimensionen als SVG (inkl. `motion`), Übergangstabelle, verbotene Übergänge, Recovery-Tabelle |
| D · Motion Specifications | `#motion` | 22 Zeilen mit Auslöser `T`/`E`, Eigenschaft, Werten, Dauer, Easing, Unterbrechbarkeit, reduzierte Variante |
| E · Typografie und Antwortdarstellung | `#typo` | Rollen, Größen, Regeln, lauffähige Typewriter-Demo mit Rate, Wortlänge und Puffer-Stillstand |
| F · Live-Anpassung | `#regler` | Ablauf in 6 Schritten, ziehbarer Regler mit Undo, drei Ebenen (visuell / Tonalität / Fähigkeiten), Nebenwirkungsliste |
| G · Voice | `#voice` | 9 Zustände, Regeln, echter Mikro-Test nach Klick, simulierte Pegelanzeige (beschriftet), Verweigerungszustand |
| H · Desktop und Mobil | `#responsive` | zwei Geräterahmen in der Live-Anatomie plus Unterschiedstabelle |
| I · Prototyp-Spezifikation | `#prototyp` | Bedienung, ehrliche Simulationsliste, Abnahmekriterien L1–L9, Übergabe an den Erstbau |
| Anhang · Live-Abgleich | `#live` | was vom Live-Stand übernommen ist, was das Konzept ergänzt, was live noch fehlt |

## Anatomie (vom Live-Stand übernommen)

| Element | Befund am Live-Stand (20.11., read-only) | Übernahme |
|---|---|---|
| Auge | ein Auge rechts, warme Iris, Lider, Blick folgt | ein Auge, 21 cqw, Lid 900 ms |
| Fläche | Papier ≈ `#f5efe6`, Text `#3d3229`, muted `#6b5b4c`, Akzent `#c17a4d` | exakt diese Tokens als warmer Pol |
| Composer | Formular unten, Placeholder „…", Senden- und Stimme-Icon, 44 px | gleiche Anatomie, plus Fokusstrich |
| Fußzeile | „Pause motion" links, Imprint · Privacy · „Built by Samuel" | übernommen, Pause als Zustand |
| Marke | `h1.sr-only` (1 × 1 px) | übernommen, als P-06 notiert |

Die Antwort rückt in die linke Spalte (8–68 %), weil das Auge rechts sitzt.
Das ist die einzige geometrische Abweichung von der Live-Anatomie.

## Was simuliert ist

- Agentenantworten sind feste Beispieltexte, kein Modell.
- Der Hintergrundjob ist ein Timer, kein Sub-Agent.
- Typewriter-Raten sind Vorschläge, keine Messung.
- Es gibt keine Latenzmessung und keine Latenzaussage.
- Persistenz über Reload ist **nicht** implementiert, aber als Anforderung
  (`Q2`) spezifiziert.
- Der Mikrofon-Test ist echt (nach Klick); der simulierte Pegel ist sichtbar
  als „SIMULIERT · Prototyp" beschriftet.

## Geprüft (20.11.2026)

| Prüfung | Ergebnis |
|---|---|
| Datei lädt ohne Konsolenfehler (Chrome, lokal) | keine Einträge im Console-Buffer |
| Storyboard abspielen / pausieren / scrubben / überspringen | Phasen wechseln korrekt, Uhr folgt, Lid 900 ms ease-out |
| Pause motion | `aria-pressed` wechselt, Caret/Balken stehen, Zustand bleibt bedienbar; `prefers-reduced-motion` startet pausiert |
| Regler + Undo | Fläche und Beispieltext wechseln; Undo stellt 0,62 her; Fakten beider Sätze identisch |
| Fast/Slow A/B | Ergebnis-Karte erscheint; Chips nur in Variante B; kein Fokuswechsel |
| Voice simuliert / Stop | Pegel sichtbar, Zustand `USER_SPEAKING` → `TEXT_IDLE`, Stop entfernt Ring und Pegel |
| Layout | Screenshots bei 1440 px und im 390-px-Mobilrahmen; keine horizontalen Überläufe |
| `bash scripts/validate.sh` | Exit 0 |

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
| P-06 | Sichtbarkeit der Einladung: der Composer zeigt nur „…" | Fremdtest nötig (`P1`) |
| P-07 | Umfang von „Pause motion" (Autonomie vs. Zustandswechsel) | Bestätigung nötig |
| P-08 | Markenname nur für Screenreader (`h1.sr-only`) | Owner-Entscheidung |

**Audio-Ausgabe fehlt in diesem Artefakt noch.** Sie ist als eigener Schnitt
geplant: [`PLAN-AUDIO-AUSGABE.md`](PLAN-AUDIO-AUSGABE.md) — opt-in, Default
stumm (DD:14), `first_audio_ms` als T5-Messgröße.

Nicht eingeführt und nicht entschieden: automatisches, ungefragtes Sprechen
(`T4`), zweiter/dritter Regler, deutsche Stimme, Bild-Eingang.

## Prüfung des Repos

```bash
bash scripts/validate.sh
```

Der Check prüft Gerüst und lokale Markdown-Verweise, nicht die Funktion einer
Anwendung.
