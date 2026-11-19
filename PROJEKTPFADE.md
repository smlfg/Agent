# Projektpfade — was liegt wo

Stand: 19.11.2026. Zweck: alles, was zu Agentfähig gehört, ist von hier aus
auffindbar. Wer eine Datei außerhalb dieses Ordners sucht, findet sie in
Abschnitt 3 mit Zweck und Grund.

## 1 · Im Projekt

| Pfad | Inhalt |
|---|---|
| `IDEA-TRANSKRIPT.txt` | Ursprüngliches Sprachtranskript, unverändert |
| `sketches/` | Handskizze als PDF/PNG, Ausschnitte und Rohdaten |
| `Agentfähig/` | Designinspiration (`GreateWriting.txt`), keine Anforderung |
| `docs/` | Projektstand, Scope-Vertrag, Pläne, Designentscheidungen, Gutachten, ADRs, UX, Wireframes, Namensregel |
| `docs/DATEINAMEN.md` | Namensregel N1–N4, Ist-Zustand und Umbenennungsprotokoll |
| `docs/UNSOLVED-TECHNIK.md` | Entscheidungswarteschlange Technik/Planung (kein genehmigter Backlog) |
| `docs/UNSOLVED-PLANUNG.md` | Entscheidungswarteschlange Produkt/Wireframes (kein genehmigter Backlog) |
| `docs/DATEINAMEN.md` | Namensregel N1–N4, Ist-Zustand und Umbenennungen |
| `docs/handoffs/` | Nicht angewendete Handoffs, `YYYY-MM-DD-thema.md`, mit Index |
| `docs/PROJECT_CONTRACT.md` | Scope-Vertrag (Entwurf, nicht signiert) |
| `docs/EXECUTION_PLAN-M0-M5.md` | Programmplan M0–M5 (Entwurf) |
| `docs/PLAN-STUFEN-0-5.md` | Bauplan Stufen 0–5 mit Wenn-Dann-Wegen und ADR-Übersicht |
| `docs/DATEINAMEN.md` | Namensregel, Ausnahmen und die durchgeführten Umbenennungen |
| `docs/adr/` | Sechs ADRs (0001–0005 plus 0006 Zeitvertrag, 19.11. abends), alle auf „vorgeschlagen" |
| `tech/` | Machbarkeit, Messlauf-Plan + Execution Plan, Protokoll, Gate-Bericht, Recherchen |
| `tech/briefs/` | Recherche-Aufträge (`BRIEF-<thema>.md`), keine Ergebnisse |
| `tech/research/` | Recherche-Ergebnisse zu denselben Themen (ohne `BRIEF-`-Präfix) |
| `tech/evidence/` | Kopien von Belegen, die außerhalb des Repos entstanden |
| `research/` | Scout-Synthese, Prior Art, Embodiment-Muster |
| `research/PRIOR_ART_REPORT.md` | Prior Art mit Lizenz-/Reifegradprüfung (Build/Buy/Adapt) |
| `research/EMBODIMENT-RECHERCHE.md` | Muster zu Präsenz, Typografie, adaptiver Oberfläche |
| `UPSTREAM-SEARCH-*.md` | Upstream-Suchen (Root: vergleichbare Projekte, graphify) |
| `skills/` | Projektkopien der Skills (Herkunft und Lizenzen in `skills/README.md`) |
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
| `~/Projects/00_AKTUELL/claudeflareworkerhaus` | Zeugenquelle für SDK-Zitate in `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md` | Nur Pfadzitate, keine Kopie nötig |
| `03_HAI/registry/components/claudeflareworkerhaus.json` | Registry-Eintrag der Komponente | Registry ist eigene Quelle |
| `~/Control/ACTIVE_PROJECTS.md` | Aktive Top-Level-Lanes | **Existiert nicht** (`~/Control` fehlt) — siehe Abschnitt 5 |

## 4 · Was nicht in die Historie gehört

- `graphify-out/` — generierter Graph, enthält Cache-JSONs und kennt die
  Dokumente vom 19.11. nicht. **Widerspruch (20:09 geprüft):** entgegen der
  ursprünglichen Absicht sind 96 Dateien (1,1 MB, nicht 3,7 MB) derzeit in Git
  getrackt. Ob der Graph versioniert bleiben soll, ist offen
  (`docs/handoffs/2026-11-19-unsolved-ergaenzungen.md` U02; dessen Aussage „untracked" ist
  durch diesen Befund überholt).
- Klon und `node_modules` — nie committen.

## 5 · Bekannte Abweichungen (offen, Stand 19.11.2026)

1. **Plan-Hash:** Council-Score gilt für `29e81d62…`, aktuelle Plandatei ist
   `a10b394c…`. „ACCEPT" ist damit nicht an den heutigen Plan gebunden.
2. **Pflichtpfad fehlt:** `~/Control/ACTIVE_PROJECTS.md` existiert nicht,
   `~/Projects/00_AKTUELL/JETZT.md` nennt Agentfähig nicht.
3. **Doppeltes Machbarkeitsdokument:** `tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md`
   (Stand 12.11.) und `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md` (19.11., mit Nachweisen).
   Gültig ist `docs/`.
4. **Messlauf-Sprache (Eintrag überholt — am 19.11. abends geprüft):** Hier stand,
   `docs/PLAN-STUFEN-0-5.md:82` plane deutsche Wechsel. Das ist nicht (mehr) richtig:
   `PLAN-STUFEN-0-5.md:5–6` hält fest, dass Stufe 1 **englisch** misst, und Zeile 82
   gehört zum Abschnitt KI-Dialog. Die Abweichung besteht nicht; gültig ist
   englisch (`DESIGN-DECISIONS.md`, „Voice-Sprache").
5. **Lauf-Evidenz außerhalb des Repos und mutabel:** Das Protokoll zitiert das
   DO-SQLite nur abgekürzt (`…5890aaec….sqlite`) und ändert sich mit jedem
   Lauf; in `tech/evidence/` liegt nur der Council-Score. Reproduzierbar ist
   der Befund derzeit nur über den Pfad im Klon, nicht über eine Kopie
   (`docs/handoffs/2026-11-19-verifikation.md` V4).

## 6 · Dateinamen

Die verbindliche Regel N1–N4, der Ist-Zustand und alle ausgeführten
Umbenennungen stehen in [`docs/DATEINAMEN.md`](docs/DATEINAMEN.md). Prüfung:

```bash
bash scripts/check-names.sh      # N1–N3
bash scripts/validate.sh         # ruft check-names mit auf
```

Kurzfassung: ein Basisname genau einmal, jede Datei mit Endung, keine
Leerzeichen/Umlaute, und der Name nennt Rolle und Gegenstand. Handoffs liegen
historisch unter `docs/handoffs/`, die zwei Warteschlangen heißen
`docs/UNSOLVED-PLANUNG.md` und `docs/UNSOLVED-TECHNIK.md`.
