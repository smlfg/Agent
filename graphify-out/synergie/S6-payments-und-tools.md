# S6 — Zahlungs-Protokolle und Upstream-Werkzeuge

Stand: 19.11.2026 · Ziel: Relevanz für *dieses* Projekt, nicht Vollständigkeit.
Geprüfte Produktquellen: `sketches/2026-11-12-agentfaehig.md`, `tech/INTENT.md`,
`docs/PROJECT.md`, `tech/LUECKEN.md` (+ `docs/DESIGN-DECISIONS.md`, `Idea`).

---

## A · Payment Protocol Stack (x402, MPP)

### Urteil: NICHT RELEVANT

Kein Dokument fordert, dass der Agent zahlt oder bezahlt wird. Die *einzige*
Spur ist ein einziges, als unsicher markiertes handgeschriebenes Wort.

**Positivbelege (die ganze Spur):**

| Stelle | Inhalt |
|---|---|
| `sketches/2026-11-12-agentfaehig.md:117` | „rechts zwei Fragezeichen und `⟨Pay⟩`" — ohne Pfeil, ohne Kontext |
| `sketches/2026-11-12-agentfaehig.md:128` | Mermaid-Ersatz `L -.->\|? ? Pay?\| L` — zwei Fragezeichen davor |
| `sketches/2026-11-12-agentfaehig.md:168` | Lesart-Tabelle: `⟨Pay⟩` transkribiert „Pay", möglich **„Ray"** — ungeklärt |
| `tech/INTENT.md:27` | T9: „Nur notieren, ob Cloudflare dafür etwas hat. **Nicht vertiefen.**" |

**Negativbelege (Suchbefehl + Ergebnis):**

```
$ grep -n -i -E "zahl|payment|x402|mpp|preis|bezahl|abrechn|invoice|stripe|usdc" \
    sketches/2026-11-12-agentfaehig.md tech/INTENT.md docs/PROJECT.md \
    tech/LUECKEN.md docs/DESIGN-DECISIONS.md Idea README.md AGENTS.md
```
Treffer nur in `tech/LUECKEN.md:151,155,173`, und zwar ausschließlich als
(1) **Infrastruktur-Kosten** (Cloudflare-Preisrechnung fehlt), (2) Verweis auf
die T9-Notiz, (3) Falschtreffer `:195` „Latenz**zahl**en" (= Millisekunden).

```
$ grep -n -i "pay" sketches/… tech/INTENT.md docs/PROJECT.md \
    tech/LUECKEN.md docs/DESIGN-DECISIONS.md Idea
```
Treffer: nur `sketches/:117,128,168`, `tech/INTENT.md:27`, `tech/LUECKEN.md:27,171,173`
— also **nur** das Wort `⟨Pay⟩` und seine Verwaltung. **Null Treffer** in
`docs/PROJECT.md`, `docs/DESIGN-DECISIONS.md`, `Idea`, `README.md`.

**Einordnung:** x402/MPP sind in `tech/research/cloudflare-bausteine.md:150-166`
korrekt beschrieben — als Feature-Inventar des Agents SDK, nicht als Anforderung.
`tech/CLOUDFLARE_MACHBARKEIT.md` führt T9 als „vorhanden … Nicht vertieft".
Das ist eine Bestandsaufnahme, keine Synergie: Es gibt kein Produktziel
(Geschäftsmodell, Bezahlschranke, Pay-per-Call), an das die Protokolle andocken.

**Rest-Unsicherheit:** ob `⟨Pay⟩` überhaupt „Pay" heißt. Das ist eine
Lesart-Frage an Samuel, keine Entwicklungsfrage — und selbst bei „Pay" wäre es
eine Produktentscheidung (darf der Agent transagieren?), kein Baustein, den man
jetzt vorbereiten müsste.

---

## B · Upstream Tool Evaluation Cluster (Graphify, Memory-Setup, Graphify-RS, Foam) + `graphify-out/`

### Urteil: NICHT RELEVANT als Produktsynergie — reine Entwicklungs-Infrastruktur

Die Werkzeugfrage baut **nicht** dieselbe Schicht wie das Produkt. Sie ist
außerdem bereits abgeschlossen, also gar keine offene Priorisierung.

**Belege — das Werkzeug adressiert das Repo, nicht den Agenten:**

- `UPSTREAM_SEARCH.md:5-10` — Need wörtlich: „Ein Mesh (Wissensgraph) zwischen
  den Ordnern und Plänen **dieses Repos** … `Idea`, `sketches/`, `docs/`, `tech/`".
  Korpus = Projektdateien, Nutzer = Entwickler/Agenten, Output = statischer Graph.
- `UPSTREAM_SEARCH.md:17` — Kandidat 1 liefert `graph.html`, `GRAPH_REPORT.md`,
  `graph.json`; keine Laufzeit-Komponente.
- `UPSTREAM_SEARCH.md:56-71` — „Installationsweg (ausgeführt am 18.11.2026)":
  bereits installiert, Mesh gebaut. Die Frage ist **entschieden und erledigt**.
- `graphify-out/GRAPH_REPORT.md:3` — „Graph Report - **Agent**", 160 Knoten,
  Communities = „Agentfähig Sketch", „Cloudflare-Bausteine Research",
  „Technical Intent" usw. Also eine Karte der Dokumente, kein Produktbestandteil.
- `git status --porcelain graphify-out` → `?? graphify-out/` (untracked):
  lokales Arbeitsartefakt, kein Teil des ausgelieferten Projekts.

**Negativbeleg — kein Graph-/Notiz-/Memory-Produktfeature gefordert:**

```
$ grep -n -i -E "graph|notiz|memory|ged(ä|ae)chtnis|netz|mesh|wiki|wissensgraph" \
    sketches/2026-11-12-agentfaehig.md tech/INTENT.md docs/PROJECT.md \
    docs/DESIGN-DECISIONS.md Idea README.md
```
Treffer ausschließlich als **Falschtreffer**: `sketches/:45,88,122` =
Mermaid-Schlüsselwort `graph TD/LR` (Diagramme über den *Interaktionsfluss*);
`sketches/:8` „**Notizbuch** Agentfähig" = das reMarkable-Quellheft;
`sketches/:194` „diesen **Notizen**" = redaktionelle Anmerkung.
**Kein** Produktfeature „Graph", „Notizsystem", „Gedächtnis" in der Skizze.

Zusatzprüfung `knowledgegraph|persistent memory`: nur `research/SCOUT-SYNTHESIS.md:74`
(Werkzeugzugriff aus OpenCode nicht nachgewiesen), `skills/grilling/SKILL.md:38`
(erlaubte Quelle beim Grillen). Beides **Entwicklungsseite**, nichts Produkt.

**Die eine scheinbare Brücke — und warum sie nicht trägt:** `Idea` nennt
„Voice, Text, **Context**, Skills" (00:01:50), und `tech/INTENT.md:26` (T8)
braucht eine Wissensquelle für den Looking-up-Agenten (`plaud thoughts →`,
Vectorize / AI Search / statische `llms.txt`). Das ist eine **Produkt-Schicht:
Wissensabruf zur Laufzeit für Besucher**. Graphify ist eine **andere Schicht:
Doku-Navigation zur Entwicklungszeit für Samuel/Agenten**. Anderer Korpus
(Repo-Markdown vs. Plaud-Inhalte), anderer Konsument, anderer Zeitpunkt.
T8 bleibt offen und wird *nicht* durch Graphify beantwortet.

**Verwechslungsgefahr, ausdrücklich:** Es gibt zwei `UPSTREAM_SEARCH.md`.
- `UPSTREAM_SEARCH.md` (Wurzel) = Werkzeug, produktneutral.
- `tech/UPSTREAM_SEARCH.md` = Produkt-Upstreams (`cloudflare/agents`,
  `json-render`, …), deckt T1–T9 ab — **zentral für den Build**.
Nur die Wurzeldatei fällt unter dieses Urteil.

---

## Konsequenz für die Priorisierung vor Projektstart

| Position | Urteil | Ein Satz Grund |
|---|---|---|
| Payments (x402/MPP) | **darf aus der Liste fallen** | Ein unklares handschriftliches Wort, in `INTENT.md:27` selbst auf „nicht vertiefen" gesetzt, null Treffer in den Produktdokumenten. |
| Graphify & Co. als *offene* Frage | **darf aus der Liste fallen** | Schon gelöst (installiert, Mesh gebaut); als Infrastruktur erledigt, nicht als Produktaufgabe. |
| `graphify-out/` als Bauvorhaben | **darf fallen** | Untracked-Artefakt, ohnehin nicht Teil des Produkts. |
| Graphify als laufende Pflege | **nicht priorisieren, nur dulden** | `graphify update .` bei Bedarf, kostet kein Produktbudget. |
| `tech/UPSTREAM_SEARCH.md` | **nicht fallen lassen** | Deckt T1–T9 ab und ist die Grundlage jeder Build-Entscheidung. |
| T8 Wissensquelle (`plaud thoughts`) | **nicht fallen lassen** | Echtes Produktfeature, von Graphify *nicht* abgedeckt. |

Unterm Strich: Beide Cluster kosten vor dem Projektstart **null** Priorisierung.
Der einzige Grund, warum sie überhaupt auftauchen, ist, dass Recherche-Worker
ihr Feature-Inventar breit gezogen haben — nicht, dass das Produkt sie verlangt.

---

## Ein nächster Schritt

- **Cluster A (Payments):** keiner nötig. Optional, falls Samuel `⟨Pay⟩`
  anders liest als „Ray": *eine* Produktfrage an ihn („darf der Agent
  Zahlungen auslösen?"), danach wieder schließen.
- **Cluster B (Werkzeuge):** keiner nötig. Bei Bedarf nach Meilensteinen
  `graphify update .`; keine Produktarbeit daraus ableiten.
