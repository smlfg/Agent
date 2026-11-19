# HANDOFF — Voice ist Slice 2 (Owner-Entscheidung 19.11., 3. Runde)

Status: **nicht angewendet.** Grund: Die Zieldateien sind durch eine parallele
Session uncommittet geändert (`git status`, 19.11.2026 20:11). Ein direkter
Patch würde fremde, nicht committete Arbeit überschreiben. Dieser Handoff
enthält die exakten Änderungen; wer die Dateien besitzt, wendet sie an.

## Entscheidung (Owner, diese Session)

> „voice ist erst im 2."

Ausgelegt als: **Voice ist nicht Teil des ersten Slices.** Slice 1 ist
text-first (Augen, Text/Typewriter, ein Regler, ein stiller Sub-Agent). Voice
folgt als eigener Slice (Slice 2). Die Entscheidung zur englischen Voice-Pipeline
(19.11., 2. Runde) bleibt unverändert. Damit ist D4 aus `PROJECT_CONTRACT.md`
beantwortet.

**Empfehlung, nicht Teil der Entscheidung:** Der Voice-Slice beginnt erst nach
dem Fremdtest (M3), wie es `docs/EXECUTION_PLAN-M0-M5.md` bereits vorsieht. Die reine
Aussage „erst im 2." legt nur die Reihenfolge fest, nicht das Gate.

**Folge für die Messung:** Die 20 Voice-Wechsel bleiben Pflicht, sind aber Gate
vor dem Voice-Slice (M4), nicht vor dem Text-Slice (M2). Für Slice 1 zählt der
Text-Pfad (erster Token/Typewriter-Start), nicht `first_audio_ms`.

---

## Patch 1 — `docs/DESIGN-DECISIONS.md`

**1a.** In der Tabelle „Bestätigt" nach der Zeile `Voice-Sprache (19.11., 2. Runde)`
einfügen:

```markdown
| **Scope Slice 1 (19.11., 3. Runde)** | **Voice ist nicht Teil des ersten Slices.** Slice 1 ist text-first: Augen, Text/Typewriter, ein Regler, ein stiller Sub-Agent. Voice folgt als eigener Slice nach dem ersten akzeptierten Slice inklusive Fremdtest. Die Zeile *Eingabemodalität* („Voice ist damit Teil des Erstbaus") ist damit für den ersten Slice überholt; die Entscheidung zur englischen Voice-Pipeline bleibt unverändert. |
```

**1b.** In „Konsequenzen der Entscheidungen vom 19.11.2026" nach dem ersten
Aufzählungspunkt (endet mit „Missions-Artefakt vom 19.11.") einfügen:

```markdown
- **Korrektur 19.11., 3. Runde (Scope):** Voice ist nicht im ersten Slice. Der
  Messlauf bleibt Pflicht, ist aber Gate vor dem Voice-Slice (M4), nicht vor dem
  Text-Slice. Für Slice 1 zählt der Text-Pfad — erster Token und
  Typewriter-Start, nicht `first_audio_ms`.
```

**1c.** In „Offene Fragen" am Ende des letzten Punktes (Sprache des Text-Kanals)
ergänzen:

```markdown
  Mit Voice in Slice 2 ist das die nächste Pflichtentscheidung für Slice 1; sie
  steuert Modellwahl, Prompts und den Fremdtest.
```

---

## Patch 2 — `docs/PROJECT.md`

**2a.** In „Vor dem ersten Build zu entscheiden", Punkt 2, den Satz ersetzen:

- vorher: `2. Eingabemodalität: Text zuerst, Mikrofon nach Klick. Voice ist damit Teil des Erstbaus.`
- nachher: `2. Eingabemodalität: Text zuerst, Mikrofon nach Klick. Voice folgt als eigener Slice nach dem ersten akzeptierten Slice (Entscheidung 19.11., 3. Runde); Slice 1 ist text-first.`

**2b.** Den Absatz „Nächster Schritt" (ab „Nächster Schritt: Der Messlauf-Plan
liegt ausgearbeitet vor") ersetzen durch:

```markdown
Nächster Schritt: **Textsprache für Slice 1 entscheiden** (Deutsch oder
Englisch; D5 im Contract-Entwurf), danach den Ein-Seiten-Bauplan für Slice 1
(M2) mit Validator-`ACCEPT` auf den aktuellen Hash. Der Voice-Messlauf bleibt
Pflicht, wird aber vor dem Voice-Slice (M4) ausgeführt, nicht vor Slice 1.
Laufversuch 1 und 2 siehe [MESSPROTOKOLL](../../tech/MESSPROTOKOLL-2026-11-19.md).
```

---

## Patch 3 — `docs/PROJECT_CONTRACT.md`

**3a.** Tabelle 2.2, Zeile F5:

- vorher: `| F5 | Voice nach Klick, englische Pipeline | Bestätigt als Teil des Erstbaus | ... |`
- nachher: `| F5 | Voice nach Klick, englische Pipeline | Nicht Teil von Slice 1; eigener Voice-Slice nach M3 (Owner-Entscheidung 19.11., 3. Runde) | ... |`

**3b.** Tabelle 3, Zeile D4:

- vorher: `| **D4** | Voice: Teil des ersten Durchstichs ... **oder** erst M4 ... | vor M2 | Widerspruch ... bleibt offen |`
- nachher: `| **D4** | **Entschieden 19.11., 3. Runde: Voice erst M4.** Slice 1 ist text-first. | — | M2 ohne Voice; M4 mit Voice |`

**3c.** Tabelle 4, Zeile CR-2, Status:

- vorher: `**offen → D4**`
- nachher: `**angenommen (19.11., 3. Runde) — Voice nach M3**`

---

## Patch 4 — `docs/EXECUTION_PLAN-M0-M5.md`

**4a.** M2, Zeile „Abhängigkeiten": `M0 (D1, D3, D4, D5)` → `M0 (D1, D3, D5)`.
D4 ist entschieden und blockiert M2 nicht mehr.

**4b.** Abhängigkeitsgraph: Kante `D4["D4 Voice in M2?"] --> M2` entfernen.
M2 → M3 → M4 bleibt der Pfad; Voice gehört zu M4.

**4c.** §8 „Der kleinste wertvolle nächste Schritt": D4 aus der Liste der
offenen Entscheidungen entfernen. Offen bleiben D1, D3, D5, D6; D2 danach.

**4d.** M4, „Zielzustand": explizit `Voice = Slice 2` nennen (nicht „Real
Integration" als vage Stufe).

---

## Patch 5 — `docs/PLAN-STUFEN-0-5.md`

Im Abschnitt „Stufe 3 — Prototyp (Text zuerst)" den Absatz „Offen in dieser
Stufe: Ob das Mikrofon schon sendet … ist nicht entschieden." ersetzen durch:

```markdown
**Entschieden 19.11., 3. Runde:** Nein. Stufe 3 und 3b laufen ohne Voice; das
Mikrofon ist sichtbar, aber ohne Funktion. Voice folgt erst in Stufe 5 (M4).
```

---

## Patch 6 — `tech/MESSPROTOKOLL-2026-11-19.md` (nur Einordnung, keine Daten)

Direkt unter der Überschrift einfügen:

```markdown
> **Einordnung (Owner-Entscheidung 19.11., 3. Runde):** Der 20-Turn-Lauf ist
> Gate vor dem Voice-Slice (M4), nicht vor Slice 1 (text-first). Die leere
> Tabelle bleibt unverändert; sie wird erst vor M4 gefüllt.
```

---

## Prüfung nach dem Anwenden

```bash
rg -n "Voice ist damit Teil des Erstbaus|Voice ist Teil des Erstbaus" docs/   # → 0 Treffer
rg -n "D4" docs/PROJECT_CONTRACT.md docs/EXECUTION_PLAN-M0-M5.md                    # → entschieden, nicht offen
bash scripts/validate.sh                                                      # → OK
```

## Warum dieser Handoff und kein direkter Patch

`git status` am 19.11.2026, 20:11: `docs/PROJECT.md`, `docs/DESIGN-DECISIONS.md`,
`docs/PLAN-STUFEN-0-5.md`, `tech/MESSPROTOKOLL-2026-11-19.md`, `UNSOLVED-TECHNIK.md` und
weitere Dateien sind durch eine parallele Session geändert oder neu angelegt.
Der Handoff respektiert deren uncommittete Arbeit; es wurde nichts überschrieben,
nichts gestaged, nichts committet.

## Nebenbefund: zwei UNSOLVED-Dateien

Zum Zeitpunkt des Handoffs existierten parallel eine Root-Queue und
`docs/UNSOLVED-TECHNIK.md`. **Inzwischen aufgelöst (19.11. abends):** die Listen
heißen [`docs/UNSOLVED-TECHNIK.md`](../UNSOLVED-TECHNIK.md) (Mess-/Technikfragen)
und [`docs/UNSOLVED-PLANUNG.md`](../UNSOLVED-PLANUNG.md) (Wireframe/Plan/Governance);
Handoffs liegen in [`docs/handoffs/`](README.md). Die drei Review-Punkte stehen als
**R01–R03** in `docs/UNSOLVED-TECHNIK.md` (eigener ID-Kreis). Die Parallel-Session führt
dort zugleich U-Einträge mit teils doppelten IDs; das ist unabhängig von R01–R03
und bei der nächsten Pflege zu bereinigen.

Sicherungskopie der drei Punkte:

- **Gate-Schwelle (REVIEW):** vor der Messung registrieren; die dokumentierte
  Entscheidung „Kriterien aus Messwerten ableiten" (`MESSLAUF-PLAN.md:169–170`,
  CR-6) ist für ein Gate methodisch rückwärts.
- **Domain-Route (DEFER, M4):** `agentfähig.de` ist im README/Manifest belegt,
  aber nicht als Route in `fleet/05-capability-map/wrangler.jsonc`; vor Deploy
  prüfen.
- **SDK-Evidenz (DEFER):** Evidenz zitiert `agents@0.27.0`, Lauf nutzt `0.33.0`;
  vier Stichproben halten in 0.33.0, Audit-sha256 nicht brechen.
