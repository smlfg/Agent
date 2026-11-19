# HANDOFF — doppelte U-IDs und ein Material-Widerspruch

Stand: 19.11.2026, 20:14 · Session `ses_e0ad6016affeOu8ZOT5M7Xax4W` ·
keine Mission, kein Lease (`hai_status` 20:08: `remaining_writer_capacity: 0`,
`remaining_mission_capacity: 0`).

**Warum diese Datei und keine Änderung:** `docs/UNSOLVED-TECHNIK.md`, `docs/PROJECT.md`,
`docs/EXECUTION_PLAN-M0-M5.md` und `PROJEKTPFADE.md` wurden zwischen 20:05 und 20:13
von mindestens einer parallelen Session geschrieben — `UNSOLVED-TECHNIK.md` wuchs in
fünf Minuten dreimal (6,5 → 7,8 → 10,4 KB, mtimes 20:09/20:12/20:13),
`PROJECT.md` zweimal. Gemäß Konkurrenzregel wurde keine dieser Dateien
angefasst. Beide Befunde stehen hier als fertiger Patch; die Datei ist
ausdrücklich **kein** Plan, keine Entscheidung, kein Code, kein Commit.

---

## H1 — Zwei doppelte IDs in `docs/UNSOLVED-TECHNIK.md` (verifiziert)

Die ID-Vergabe läuft sichtbar kollidierend, weil mehrere Sessions gleichzeitig
„die nächste freie Nummer" wählen. Momentaufnahme 20:16 (`docs/UNSOLVED-TECHNIK.md`,
28 Zeilen):

| ID | Anzahl | Beispiele |
|---|---|---|
| `U12` | **3×** | STT-Stufe; „Gate braucht registrierte Schwelle"; weitere |
| `U9`, `U10`, `U11`, `U13` | je **2×** | Typewriter-Wahrnehmungsgrenze, Barrierefreiheit, „deployter Lauf", Domainzuordnung |
| `U18`, `U19` | **0×** | Lücke zwischen U17 und U20 |
| höchste ID | `U24` | — |

Prüfbefehl (verlässlicher als Zählen von Hand):

```bash
grep -o "^| \*\*U[0-9]*\*\*" docs/UNSOLVED-TECHNIK.md | tr -d '|* ' | sort | uniq -c
```

**Warum das mehr ist als Kosmetik:** `docs/PROJECT.md:47–48` verweist für die
STT-Instabilität auf „U12". Mit drei U12-Einträgen zeigt der Zeiger nicht mehr
auf einen Punkt, sondern auf drei.

**Vorgeschlagener Umgang (mechanisch, keine Inhaltsänderung):** die
Doppelten einmalig neu nummerieren (nächste freie Nummern oberhalb `U24`),
danach den Prüfbefehl oben ausführen und `docs/PROJECT.md:48` gegenprüfen.
Reihenfolge im Anhang ist zweitrangig; Umsortieren würde den Diff nur
vergrößern. Wer künftig anhängt: erst den Prüfbefehl laufen lassen, nicht
„nächste Nummer" raten.

---

## H2 — `PLAN-STUFEN-0-5` (damals `PLAN-ADREN`) behauptet eine Aufnahme, die `KI-DIALOG` als fehlend belegt

| Aussage | Beleg |
|---|---|
| „KI-Dialog 19.11. auswerten — Platzhalter steht, Aufnahme ist **aufgezeichnet**, aber noch nicht ausgewertet" | `docs/PLAN-STUFEN-0-5.md:79–80` |
| Abschlussbedingung Stufe 0: „… **und** der KI-Dialog eingespeist oder bewusst verworfen ist" | `docs/PLAN-STUFEN-0-5.md:87` |
| Dagegen: „**Aufnahme fehlt — Pin leer.** … `list_files` für den 19.11. liefert ausschließlich zwei ältere Aufnahmen" | `docs/KI-DIALOG-2026-11-19.md:28` |

**Bedeutung:** Die Abschlussbedingung von Stufe 0 hängt an Material, das nach
dem ausführlicheren Beleg nicht existiert. Kein Eintrag in `UNSOLVED-TECHNIK.md` nennt
diesen Widerspruch (geprüft 20:13: kein Treffer für „aufgezeichnet" oder
„PLAN-ADREN", heute `PLAN-STUFEN-0-5`); `U4` (KI-Dialog-Übernahmen) und `U7` (Plaud-Betriebsnotiz)
beschreiben nur die Folgen.

**Vorgeschlagener UNSOLVED-Eintrag (zum Einfügen, ID nach H1 anpassen):**

> | **U1x** | `docs/PLAN-STUFEN-0-5.md:79–80` behauptet, die KI-Dialog-Aufnahme sei „aufgezeichnet", `docs/KI-DIALOG-2026-11-19.md:28` belegt das Gegenteil („Aufnahme fehlt — Pin leer"). Die Abschlussbedingung von Stufe 0 (`PLAN-STUFEN-0-5.md:87`) hängt damit an Material, das es nicht gibt. | Zwei gültige Dokumente widersprechen sich; welche Aussage gilt, entscheidet der Owner (Aufnahme nachgereicht → Pfad nennen; sonst Plan-Satz korrigieren). Ein stiller Textersatz wäre eine Aussage über den Abschluss von Stufe 0. | `docs/PLAN-STUFEN-0-5.md:79–80, 87`; `docs/KI-DIALOG-2026-11-19.md:28` | **REVIEW** |

---

## H3 — bereits erfasst, keine Aktion nötig

`PROJEKTPFADE.md` §5 Punkt 4 behauptet weiterhin, `PLAN-STUFEN-0-5.md:82` plane
deutsche Wechsel. Das ist sachlich falsch (Zeile 82 ist der KI-Dialog-Abschnitt;
`PLAN-STUFEN-0-5.md:5–6` sagt „misst englisch"). Der Punkt ist bereits als
M0-Deliverable geführt (`docs/EXECUTION_PLAN-M0-M5.md` §1, Punkt 4) — hier nur
bestätigt, nicht erneut eingetragen.

---

## H4 — Zwei Entscheidungswarteschlangen mit zwei ID-Schemata (verifiziert 20:15)

| Datei | IDs | Umfang | Stand |
|---|---|---|---|
| `UNSOLVED-TECHNIK.md` (Repo-Wurzel) | `U-01` … `U-07` | 7 Einträge | 20:15 |
| `docs/UNSOLVED-TECHNIK.md` | `U1` … `U24`, davon `U12`/`U13` doppelt (siehe H1) | 21 Einträge | 20:15 |

Beide sind aktiv, keine verweist auf die andere. Folge: Wer „U4" liest, landet je
nach Datei bei einem anderen Punkt. Vorschlag: **eine** Datei als kanonisch
bestimmen (die Wurzel entspricht der Auftragsvorgabe, `docs/` ist die reichere
Sammlung) und die andere als Verweis-Stub mit Datum stehen lassen. Keine
Zusammenführung ohne Owner: beide werden von verschiedenen Sessions
fortgeschrieben, ein Merge würde fremde Arbeit überschreiben.

---

## Was in dieser Session tatsächlich geprüft wurde

- Gelesen (vollständig): `README.md`, `IDEA-TRANSKRIPT.txt`, `docs/VISION-samuel.md`,
  `docs/PROJECT.md`, `docs/PLAN-STUFEN-0-5.md`, `docs/DESIGN-DECISIONS.md`,
  `docs/PROJECT_CONTRACT.md` (Kopf), `docs/EXECUTION_PLAN-M0-M5.md` (M0–M5, §4–§10),
  `docs/KI-DIALOG-2026-11-19.md`, `docs/UNSOLVED-TECHNIK.md`, `PROJEKTPFADE.md`,
  `tech/MESSPROTOKOLL-2026-11-19.md`, `tech/PLAN_VALIDATION_REPORT.md`,
  `scripts/validate.sh`.
- Live geprüft: `hai_status` (20:08) — zwei Lanes (`prezero-clean`, `brueggen`)
  bei Limit 2, eine aktive Mission `M-20261119T194948-3db0ab44` (Projektpfad
  dieses Repos, T1-Messlauf), `remaining_writer_capacity: 0`,
  `remaining_mission_capacity: 0`, `~/Control` existiert nicht.
- Nicht getan: keine Änderung an Code, ADRs, Entscheidungen, Plänen; keine
  Commits, Pushes, Deploys; keine Mission eröffnet oder überschrieben.

Für die Sitzung selbst gab es keinen neuen technischen Befund: Vision, Status,
Messlage und Gates standen beim Lesen bereits in den oben genannten Dateien.
