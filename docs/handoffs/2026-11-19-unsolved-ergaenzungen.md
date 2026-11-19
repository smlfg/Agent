# UNSOLVED — Handoff-Ergänzungen (19.11.2026, Abend)

**Nicht die Hauptliste.** Die Entscheidungswarteschlange läuft in
[`docs/UNSOLVED-TECHNIK.md`](../UNSOLVED-TECHNIK.md) (U1–U8). Diese Datei enthält **nur die
Ergänzungen U9–U14**, die zum Zeitpunkt der Konsolidierung nicht eingefügt
werden konnten: `docs/UNSOLVED-TECHNIK.md` wurde parallel bearbeitet (mtime 20:10,
laufende Session). Einfügen nach U8, gleiches Spaltenformat — dabei U01→U9 usw.
umbenennen.

Kein genehmigter Backlog. Jeder Eintrag braucht eine Owner-Entscheidung, bevor
er wirkt. Provenienz je Eintrag.

Format: ID · Erkenntnis · Warum nicht integriert · Quelle · Empfehlung.

---

## U01 · Der Wissensgraph ist kein Beleg

Die 25 INFERRED-Kanten wurden gegen die Quelldateien geprüft: 15 belegt,
8 schwach, **2 sachlich falsch** (Hume 300 ms und Moshi 200 ms wurden dem
800-ms-Ziel zugeschlagen, `tech/research/konkurrenz.md:32,61` gegen `:65,70`).
Zusätzlich haben alle 160 Knoten `source_location: None`, und die
Konfidenz-Scores sind invertiert (0,9 auf falschen, 0,75 auf belegten Kanten).

**Nicht integriert, weil:** Es ist eine Aussage über ein Werkzeug, nicht über das
Produkt — und `graphify-out/` ist nicht versioniert.

**Quelle:** `graphify-out/triage/P2-inferred-verified.md` · **REVIEW**

## U02 · `graphify-out/` ist nicht in `.gitignore`

`git check-ignore` schlägt fehl, der gesamte Graph (160 Knoten, `graph.json`,
`graph.html`) erscheint als untracked. Jeder Lauf erzeugt neue Diff-Kandidaten.

**Nicht integriert, weil:** `.gitignore` ändern ist eine Owner-Entscheidung und
kollidiert mit der laufenden Graph-Arbeit.

**Quelle:** `graphify-out/triage/P5-grad0-und-rauschen.md` · **REVIEW**

## U03 · AG-UI als Zustandskanal (Upstream-Option)

Für den Kanal Agent → Oberfläche existiert ein reifer Upstream: **AG-UI**
(MIT, 20.573 ★, Push am 19.11.2026). Dessen Doku benutzt selbst
`{"path":"/user/preferences","value":{"theme":"dark"}}` als Beispiel.
Für „der Agent färbt seine eigene Seite" gibt es dagegen **kein** Produkt —
A2UI und MCP Apps schließen Agent-Styling ausdrücklich aus
(„prevents agents from injecting styling").

**Nicht integriert, weil:** Ein Kanal-Standard ist eine Architekturentscheidung.
`EXECUTION_PLAN-M0-M5.md` §10.3 legt bereits ein eigenes Zustandsschema fest; ob
AG-UI das ersetzt, ergänzt oder ignoriert wird, ist offen.

**Quelle:** `graphify-out/prebuild/UPSTREAM-SEARCH-generative-ui.md` · **REVIEW**

## U04 · Graphify verwirft alle Asset-Links

Nicht nur Bild-Embeds: Der Markdown-Extraktor (`graphifyy 0.9.112`) verwirft
über `_MD_CITEABLE_EXTS` auch normale Links auf `.png`/`.pdf`/`.svg`
(`markdown.py:22-26, 40, 43`). Deshalb bleiben elf PNG-Knoten bei Grad 0,
obwohl die `.md`-Transkription sie alle einbettet.

**Nicht integriert, weil:** Kein Repo-Fix möglich — das ist ein
Extraktor-Limit. Ein Upstream-Patch wäre S/M, aber kein Projektziel.

**Quelle:** `graphify-out/triage/P1-image-edges.md` · **DEFER**

## U05 · Zwei Kollisionen aus der Anforderungsprüfung sind noch offen

Von 27 Kollisionen sind mehrere inzwischen durch ADRs und Execution Plan
beantwortet (Eigenbau → ADR-0003, Latenz → ADR-0001, Voice → Designentscheidungen).
**Offen bleiben zwei:**

- **Stille vs. Fokus:** Gilt „neue Antwort im Fokus" (`DESIGN-DECISIONS.md`) auch
  für still gelieferte Hintergrund-Ergebnisse? Der Plan führt `bg` als eigene
  Zeile (§10.3), legt aber nicht fest, ob sie den Fokus nehmen darf.
- **Ist die sichtbare Fläche das Produkt?** Skizze (Regler, Augen, Effekte) gegen
  Designinspiration (Agent entscheidet, Input verschwindet).

**Nicht integriert, weil:** beides Produktentscheidungen sind, keine Befunde.

**Quelle:** `graphify-out/prebuild/S8-anforderungs-kollisionen.md` (K12–K14, K07/K08) · **REVIEW**

## U06 · Gedächtnis ist strukturell und technisch nicht tragfähig

Zwei unabhängige Prüfungen, ein Ergebnis: **kein gemeinsamer Anker** (0 Kanten
zwischen Notion, Vectorize und den Upstream-Repos) und **keine Laufzeit-Tauglichkeit**
(Notion 3 req/s workspace-weit; Vectorize asynchron, „at least an hour" bei
250k Inserts). Notion bleibt als Projekt-/Wissensspiegel brauchbar.

**Nicht integriert, weil:** Gedächtnis ist in V1 nicht im Ablauf; eine
Integration würde Scope erzeugen.

**Quelle:** `graphify-out/synergie/S5-kontext-gedaechtnis.md`,
`docs/handoffs/2026-11-19-upstream-grenzen.md` (R15) · **DEFER**

---

## Bewusst verworfen (DISCARD) — nicht wieder aufnehmen

| Punkt | Grund |
|---|---|
| Payments / `⟨Pay⟩` (x402, MPP) | Einzige Spur ist ein unsicheres Skizzenwort; in `tech/INTENT-TECHNIK.md` selbst auf „nicht vertiefen" gesetzt; kein Treffer in den Produktquellen. |
| Graphify/Foam/Claude-Memory als **Produkt**synergie | Adressiert ausdrücklich „Ordner und Pläne dieses Repos" — Entwicklungswerkstatt, kein Produktfeature. |
| `validate.yml`-AST-Knoten (14) | Extraktor-Rauschen aus YAML-Syntax, eigener Cluster, kein Wissenswert. |
| „10 Skizzenbilder sind isoliert, also fehlt Inhalt" | Falsche Schlussfolgerung: Der Inhalt ist eingebettet, der Extraktor verwirft ihn (U04). |
