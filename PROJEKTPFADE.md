# Projektpfade — was liegt wo

Stand: 19.11.2026. Zweck: alles, was zu Agentfähig gehört, ist von hier aus
auffindbar. Wer eine Datei außerhalb dieses Ordners sucht, findet sie in
Abschnitt 3 mit Zweck und Grund.

## 1 · Im Projekt

| Pfad | Inhalt |
|---|---|
| `Idea` | Ursprüngliches Sprachtranskript, unverändert |
| `sketches/` | Handskizze als PDF/PNG, Ausschnitte und Rohdaten |
| `Agentfähig/` | Designinspiration (`GreateWriting.txt`), keine Anforderung |
| `docs/` | Projektstand, Vision, Plan, Designentscheidungen, Gutachten, ADRs |
| `docs/adr/` | Fünf ADRs, alle auf „vorgeschlagen" |
| `tech/` | Machbarkeit, Messlauf-Plan, Protokoll, Gate-Bericht, Recherchen |
| `tech/evidence/` | Kopien von Belegen, die außerhalb des Repos entstanden |
| `research/` | Scout-Synthese |
| `UPSTREAM_SEARCH-*.md` | Upstream-Suchen (Root: vergleichbare Projekte, graphify) |
| `skills/` | Projektkopie des Grilling-Skills |
| `src/`, `tests/` | Noch leer, nur README |
| `graphify-out/` | Generierter Graph, **kein** Projektinhalt (siehe Abschnitt 4) |

## 2 · Belege im Projekt

| Datei | Herkunft | SHA-256 |
|---|---|---|
| `tech/evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json` | Kopie von `03_HAI/workbench/plan-council/out/` (19.11.2026) | `e54df498482aaba80f474f476c96531ff0bd28fd2864f60621c9d6ccee9dafe8` |

Zitiert von `tech/MESSPROTOKOLL-2026-11-19.md:6` und
`tech/PLAN_VALIDATION_REPORT.md:15`. Inhalt: Overall 0.792, Threshold 0.75,
Verdict `SCORE_OK`, 3 Jurymodelle, `plan_sha256: 29e81d62…e2f2f52`.
Dieser Hash passt **nicht** zur aktuellen `tech/MESSLAUF-PLAN.md`
(`a10b394c…b0449d0f`) — siehe Abschnitt 5.

## 3 · Außerhalb des Projekts — und warum

| Pfad | Zweck | Warum nicht kopiert |
|---|---|---|
| `~/Projects/05_INBOX/cloudflare-agents` | Klon für den Messlauf, `examples/voice-agent` installiert | 922 MB, davon 865 MB `node_modules`; Kopie würde das Repo unbrauchbar machen |
| `03_HAI/workbench/plan-council/out/` | Quelle der Belegkopie oben | Nur die eine Datei ist Beleg |
| `03_HAI/docs/UPSTREAM_FIRST_GATE.md`, `PLAN_ACCEPTANCE_GATE.md`, `CONTINUOUS_AUTHORIZE.md` | Geltende Verträge | Eine Quelle. Kopien würden auseinanderlaufen |
| `03_HAI/docs/PLAN_VALIDATION_REPORT.md` | Kanonischer Anker des Plan-Validators | Enthält derzeit ein **fremdes** Verdict vom 24.08.2026 (anderes Projekt) |
| `03_HAI/LOGBUCH.md`, `03_HAI/fails/` | Entscheidungen, Fails, Lernregeln | Kanonische HAI-Pfade, append-only |
| `~/Projects/00_AKTUELL/claudeflareworkerhaus` | Zeugenquelle für SDK-Zitate in `docs/CLOUDFLARE-MACHBARKEIT.md` | Nur Pfadzitate, keine Kopie nötig |
| `03_HAI/registry/components/claudeflareworkerhaus.json` | Registry-Eintrag der Komponente | Registry ist eigene Quelle |
| `~/Control/ACTIVE_PROJECTS.md` | Aktive Top-Level-Lanes | **Existiert nicht** (`~/Control` fehlt) — siehe Abschnitt 5 |

## 4 · Was nicht in die Historie gehört

- `graphify-out/` — generierter Graph, 3,7 MB, enthält Cache-JSONs und kennt
  die Dokumente vom 19.11. nicht. Wird nicht committet.
- Klon und `node_modules` — nie committen.

## 5 · Bekannte Abweichungen (offen, Stand 19.11.2026)

1. **Plan-Hash:** Council-Score gilt für `29e81d62…`, aktuelle Plandatei ist
   `a10b394c…`. „ACCEPT" ist damit nicht an den heutigen Plan gebunden.
2. **Pflichtpfad fehlt:** `~/Control/ACTIVE_PROJECTS.md` existiert nicht,
   `~/Projects/00_AKTUELL/JETZT.md` nennt Agentfähig nicht.
3. **Doppeltes Machbarkeitsdokument:** `tech/CLOUDFLARE_MACHBARKEIT.md`
   (Stand 12.11.) und `docs/CLOUDFLARE-MACHBARKEIT.md` (19.11., mit Nachweisen).
   Gültig ist `docs/`.
4. **Messlauf-Sprache:** `docs/PLAN-ADREN.md:82` plant deutsche Wechsel, die
   Entscheidung vom 19.11. lautet englisch. Gültig ist englisch.
