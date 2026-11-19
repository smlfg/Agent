# Wireframe-System V1 — Low Fidelity

Stand: 19.11.2026 · Rolle: Senior UX/UI Designer & Interaction Architect ·
Status: **VORSCHLAG zur Owner-Abnahme — nicht freigegeben, kein Build.**

> **Control-Plane-Status: DEGRADED (sichtbar, nicht still).**
> `hai_health` ist `ok`, aber es gibt keine freie Writer-Kapazität: zwei aktive
> Lanes (`prezero-clean`, `brueggen`) bei Limit 2 und eine aktive Mission
> (`M-20261119T194948-3db0ab44`, T1-Messlauf) ohne freien Missions-Slot.
> Dieses Wireframe-System entsteht daher als **Planungsartefakt ohne Mission und
> ohne Lease**. Es wurde nichts gebaut, committet, gepusht oder deployt.
> **Backfill:** Mission/Lease nach Owner-Gate nachtragen.

## Was hier vorliegt

Ein vollständiges Low-Fidelity-System für **Agentfähig V1**: Screens,
Zustände, Responsive-Varianten, Komponenten, Flow-Diagramme und die offenen
Designentscheidungen. **Die sechs Markdown-Dateien dieses Systems enthalten
keinen Frontend-Code**, keine Farben, keine Animationen, keine dekorativen
Details.

**Wichtig gegen die naive Lesart:** Die zwölf `WF`-IDs sind **Prüfanker für
Review und Abnahme, keine zwölf Bausteine.** Es gibt genau **eine** Fläche
(`S1`). WF-03/04/05/06/07/09/10/12 sind Zustände dieser Fläche, keine Routen.
Wer zwölf Seiten baut, hat das Produkt missverstanden.

| Datei | Inhalt |
|---|---|
| [`00-flows-and-viewports.md`](00-flows-and-viewports.md) | Abgeleitete User Flows, Screen-Flow, Präsenzzustände, Viewports |
| [`01-screens.md`](01-screens.md) | WF-01 bis WF-12 mit ASCII-Wireframes und Spezifikation |
| [`02-components.md`](02-components.md) | Wiederverwendbare Bausteine, Upstreams, Accessibility, Responsive-Regeln |
| [`03-state-matrix.md`](03-state-matrix.md) | Zustandsmatrix, Feedback-Regeln, Lade- und Fehlerverhalten |
| [`04-open-decisions.md`](04-open-decisions.md) | OD-00 bis OD-19 zur Owner-Freigabe |

**Parallel im selben Ordner:** `agentfaehig-wireframe.html` und
`wireframe-prototype-interactive.md` stammen aus einer anderen Session. Sie sind
ein interaktiver HTML-Prototyp mit eigener Spezifikation, **nicht Teil dieses
Markdown-Systems** und nicht von mir bewertet. Die Ablage ist im Fluss: Der
Prototyp ist während der Arbeit von `docs/wireframe/` nach `docs/wireframes/`
gewandert.

## Wichtiger Befund zur Auftragsgrundlage

Es gibt im Repo **kein Dokument mit freigegebenen User-Flow-IDs**. Was es gibt:

| Quelle | Status | Verwendung hier |
|---|---|---|
| [`DESIGN-DECISIONS.md`](../DESIGN-DECISIONS.md) | **bestätigt** (19.11.2026) | Grundlage der Flows UF-01 bis UF-08 |
| [`VISION-samuel.md`](../VISION-samuel.md) | Samuels Worte, daraus abgeleitet | Ton, Hierarchie, „nicht bevormundend" |
| [`PROJECT_CONTRACT.md`](../PROJECT_CONTRACT.md) §2.2, F1–F7 | **ENTWURF, unsigniert** | provisorischer Pflichtumfang |
| [`PLAN-STUFEN-0-5.md`](../PLAN-STUFEN-0-5.md) | Plan, ADRs „vorgeschlagen" | Stufenbezug, nicht Freigabe |
| [`ADR-0002`](../adr/ADR-0002-agent-als-interface.md), [`ADR-0004`](../adr/ADR-0004-regler-veraendert-oberflaeche-und-haltung.md) | **vorgeschlagen** | Interface- und Regler-Architektur |
| [`sketches/2026-11-12-agentfaehig.md`](../../sketches/2026-11-12-agentfaehig.md) | Rohidee, Lesarten offen | Layout-Hinweise, keine Anforderung |

**Konsequenz:** Die Flows sind aus den bestätigten Entscheidungen
rekonstruiert und als `UF-01…UF-08` versioniert. Sie sind **Vorschläge**, bis
Samuel sie bestätigt (OD-00). Die Wireframes erfinden keine Features, um diese
Lücke zu füllen.

## Parallelarbeit (Stand 19.11., 20:10)

Im selben Arbeitsbaum liegt ein paralleles UX/IA-Dokument:
[`UX-INFORMATIONSARCHITEKTUR.md`](../UX-INFORMATIONSARCHITEKTUR.md). Es
modelliert dieselbe Oberfläche als **eine Fläche S1 mit elf Zuständen** und
prüft diese Wireframes in §4.8. Vier Befunde sind hier eingearbeitet:

1. **WCAG 2.2.2 (Level A):** Dauerbewegung der Augen braucht eine sichtbare
   Pause-/Stop-Möglichkeit. `prefers-reduced-motion` ist kein Ersatz. → C-15.
2. **Kontingent erschöpft** ist ein normaler Betriebszustand, kein Randfehler.
   → WF-10, 03 §5.
3. **Sende-Auslöser** ist gesetzt, aber nicht freigegeben. → OD-18.
4. **Nie Stille ohne sichtbare Reaktion:** Arbeit muss sichtbar werden, ohne
   Text zu erfinden. → 03 §3.1.

Das parallele Dokument bleibt ein Entwurf; es ist hier **Quelle für Befunde**,
keine Freigabe.

## Lesekonvention

| Zeichen | Bedeutung |
|---|---|
| `WF-NN` | Screen-ID, stabil über alle Dateien |
| `UF-NN` | User-Flow-ID, abgeleitet und versioniert |
| `F1…F7` | Pflichtfunktion aus `PROJECT_CONTRACT` (Entwurf) |
| `P1…P4`, `T1…T6`, `Q1…Q7` | Erfolgs- und Qualitätskriterien (Entwurf) |
| `D1…D9` | Owner-Entscheidung aus `PROJECT_CONTRACT` §3 |
| `OD-NN` | offene Designentscheidung aus diesem System |
| `●` | primär spezifiziert |
| `○` | Variante spezifiziert |
| `–` | nicht zutreffend, Begründung in der Matrix |
| `?` | offen, verweist auf `OD-NN` |

## Scope

**Enthalten:** der bestätigte V1-Ablauf — Ankommen, Augen, Text, Antwort im
Fokus, genau ein Regler mit Oberflächen- *und* Haltungswechsel, ein stilles
Hintergrund-Ergebnis, Voice nach Klick, Fehlerzustände, Reload.

**Nicht enthalten und nicht erfunden:** Bild-Eingang, zweiter/dritter Regler,
zweiter Sub-Agent, deutsche Stimme, proaktives Nachsprechen (T4), Pathways
(`website/person/team/company`), Mandanten, `Pay`, Accounts, Analytics, SEO,
Mehrsprachigkeit, Besucher-übergreifende Persistenz. Belege:
[`PROJECT_CONTRACT.md`](../PROJECT_CONTRACT.md) §2.3.

## Lieferform

Figma ist auf dem Gerät installiert, aber **nicht als MCP/Connector
angebunden**. Damit ist keine echte Designumgebung mit überprüfbaren Frames
verfügbar. Der Auftrag sieht für diesen Fall strukturiertes Markdown,
ASCII-Wireframes und Mermaid vor — genau das liegt hier vor. Es wurde kein
HTML/CSS/JS erzeugt.

## Prüfung

```bash
bash scripts/validate.sh
```

Der Check prüft Gerüst und lokale Markdown-Verweise, nicht die Funktion einer
Anwendung. Die Wireframes sind ein Design-Artefakt, kein Funktionsnachweis.
