# Dateinamen — Regel, Ist-Zustand, Umbenennungen

Stand: 19.11.2026, 20:40 · Verfasser: OpenCode (DeepSeek V4.1 Flash).
Zweck: Dateinamen sollen ohne Kontext verständlich sein — und die Regel soll
prüfbar sein, nicht nur aufgeschrieben.

## 1 · Regel

Vier Regeln, in dieser Reihenfolge. Nur die ersten drei werden maschinell
geprüft; die vierte braucht ein Auge.

| # | Regel | Warum | Geprüft von |
|---|---|---|---|
| **N1** | **Ein Basisname kommt im ganzen Projekt genau einmal vor.** | Zwei `EXECUTION_PLAN.md` in `docs/` und `tech/` sind derselbe Name für zwei Pläne — man greift zwangsläufig zum falschen. | `scripts/check-names.sh` |
| **N2** | **Jede Datei hat eine Endung.** | `Idea` ohne Endung wurde von graphify übersprungen und war in Editoren nicht als Text erkennbar. | `scripts/check-names.sh` |
| **N3** | **Keine Leerzeichen, keine Umlaute im Dateinamen.** Umlaute werden transliteriert (`ae/oe/ue`). | Links und Werkzeugketten brechen sonst still. | `scripts/check-names.sh` |
| **N4** | **Der Name sagt, was drin ist.** Kein Kürzel, das nur der Autor versteht (`PLAN-ADREN`), kein Einzelwort ohne Gegenstand (`INTENT`). Wo zwei Dateien dasselbe Thema haben, unterscheidet der Zusatz die Rolle (`-BRIEF`, `-VORPRUEFUNG`, `-AUDIT`). | Der Name ist die einzige Beschriftung, die immer sichtbar ist. | Review |

**Schreibweise (Empfehlung, kein Fehler):** `THEMA-ZUSATZ.md`, Trennung mit
Bindestrich, Deutsch. Unterstriche bleiben nur bei den etablierten Ankern
(`PROJECT_CONTRACT.md`, `EXECUTION_PLAN-*.md`, `PLAN_VALIDATION_REPORT.md`,
`PRIOR_ART_REPORT.md`) — sie sind Verweisziele aus anderen Dokumenten und aus
dem HAI-Vertrag.

## 2 · Bewusst ausgenommen

| Ausnahme | Grund |
|---|---|
| `README.md` je Ordner | Konvention: jeder Ordner beschreibt sich selbst |
| `SKILL.md`, `references/`, `scripts/` in `skills/` | Fremde Pakete, werden als Ganzes aktualisiert |
| `docs/adr/ADR-NNNN-*.md` | Nummer ist der stabile Schlüssel, Zitate verweisen darauf |
| `docs/handoffs/YYYY-MM-DD-thema.md` | Datum ist Teil der Adressierbarkeit |
| `tech/MESSPROTOKOLL-YYYY-MM-DD.md` | Messprotokoll ist datumsgebunden |
| `tech/evidence/*.json` | Dateiname stammt aus dem erzeugenden System (Belegkopie) |
| `sketches/raw/`, `sketches/blocks/` | Rohdaten der Skizze, unverändert |
| `.gitignore` und andere Dotfiles | Werkzeugkonvention |

## 3 · Was in diesem Durchgang umbenannt wurde

Ausgeführt mit `git mv` (Historie bleibt), danach alle Verweise ersetzt.
Grundlage ist der Befund aus `scripts/check-names.sh` plus die Sichtprüfung
gegen N4.

| Vorher | Nachher | Grund |
|---|---|---|
| `Idea` | `IDEA-TRANSKRIPT.txt` | N2: keine Endung. Zugleich sagt der Name jetzt, was drin ist (Plaud-Transkript) |
| `docs/PLAN-ADREN.md` | `docs/PLAN-STUFEN-0-5.md` | N4: „ADREN" ist ein Kürzel; die Datei ist der Bauplan Stufen 0–5 |
| `tech/INTENT.md` | `tech/INTENT-TECHNIK.md` | N4: Einzelwort ohne Gegenstand; es ist der technische Intent |
| `docs/MISSION_BRIEF-graphify-verification.md` | `docs/MISSION-BRIEF-graphify-verifikation.md` | N3/N4: Unterstrich, gemischte Sprache |
| `tech/briefs/cloudflare-bausteine.md` | `tech/briefs/BRIEF-cloudflare-bausteine.md` | N1: gleicher Basisname wie das Ergebnis in `tech/research/` |
| `tech/briefs/konkurrenz.md` | `tech/briefs/BRIEF-konkurrenz.md` | N1: dito |

**Bereits vorher erledigt** (parallele Session, hier nur dokumentiert, damit die
Liste vollständig ist): `docs/EXECUTION_PLAN.md` → `docs/EXECUTION_PLAN-M0-M5.md`,
`tech/EXECUTION_PLAN.md` → `tech/EXECUTION_PLAN-M1-MESSLAUF.md`,
`tech/CLOUDFLARE_MACHBARKEIT.md` → `tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md`,
`docs/CLOUDFLARE-MACHBARKEIT.md` → `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`,
`tech/ABGLEICH.md` → `tech/ABGLEICH-DESIGN-TECHNIK.md`,
`tech/LUECKEN.md` → `tech/LUECKEN-2026-11-12.md`,
`UNSOLVED.md` → `docs/UNSOLVED-PLANUNG.md`,
`docs/UNSOLVED.md` → `docs/UNSOLVED-TECHNIK.md`,
`UPSTREAM_SEARCH-*.md` → `UPSTREAM-SEARCH-*.md`, Handoffs → `docs/handoffs/`.

## 4 · Prüfen

```bash
bash scripts/check-names.sh   # Namensregel N1–N3
bash scripts/validate.sh      # Gerüst, Links, Skills (ruft check-names mit auf)
```

Erwartete Ausgabe bei sauberem Stand:

```
OK: <n> Dateien — Basisnamen eindeutig, Endung vorhanden, ASCII, ohne Leerzeichen
```

## 5 · Offen (kein Namensproblem, sondern ein ID-Problem)

Die zwei Warteschlangen heißen jetzt eindeutig (`docs/UNSOLVED-TECHNIK.md`,
`docs/UNSOLVED-PLANUNG.md`), verwenden aber weiter **zwei ID-Konventionen**
(`U1…` und `U-01…`). Das ist in
[`UNSOLVED-PLANUNG.md`](UNSOLVED-PLANUNG.md) U-09 als `DEFER` geführt: eine
ID-Angleichung würde Zitate in fremden Dokumenten brechen. Dateinamen sind
damit klar; die Adressierbarkeit innerhalb der Listen bleibt eine
Owner-Entscheidung.
