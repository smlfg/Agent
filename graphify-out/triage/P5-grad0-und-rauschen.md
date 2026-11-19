# P5 — Grad-0-Knoten und validate.yml-Rauschen

Stand: 2026-11-19 · read-only Triage · Repo `03_HAI/Agentfaehig/Agent`
Grundlage: `graphify-out/graph.json` (160 Knoten, 183 Kanten, 12 Hyperedges, `built_at_commit 6bdc3a62`)
Methode: Grad nachgezählt in Python über `links`; Report-Regel aus dem installierten Paket
`graphifyy 0.9.112` (`~/.local/share/uv/tools/graphifyy/lib/python3.14/site-packages/graphify/`).
Kein `graphify`-Lauf, keine Repo-Änderung außer dieser Datei.

## Korrektur der Auftragsannahme (vorab)

Die Prämisse im Auftrag stimmt in zwei Punkten nicht, und beides ändert die Bewertung:

1. **Es sind 16 Knoten mit Grad 0, nicht 14.** Die 14 ist die Knotenzahl des
   `validate.yml`-Clusters — Zufall der gleichen Zahl.
2. **Die 14 `validate.yml`-Knoten haben Grad 0,1,2,3,4 — sie sind keine Grad-0-Knoten.**
   Sie bilden eine eigene, vom Rest getrennte **Zusammenhangskomponente der Größe 14**
   (13 `contains`-Kanten, alle EXTRACTED, alle intern). Nur 8 dieser 14 Knoten sind
   überhaupt Grad ≤ 1, und genau diese 8 werden von der Report-Regel als
   `contains`-only-AST-Rauschen **aussortiert**.

Grad-0-Menge (16, unverändert nach Report-Regel):

| Knoten-ID | Datei | file_type |
|---|---|---|
| `tech_cloudflare_machbarkeit_state_sync` | tech/CLOUDFLARE_MACHBARKEIT.md | concept |
| `tech_cloudflare_machbarkeit_latenz_budget` | tech/CLOUDFLARE_MACHBARKEIT.md | concept |
| `typewriter` | tech/ABGLEICH.md | concept |
| `tests_readme` | tests/README.md | document |
| `src_readme` | src/README.md | document |
| `sketches_2026-11-12-agentfaehig` | sketches/2026-11-12-agentfaehig.png | image |
| `sketches_blocks_01-einstieg` … `_10_technik_und_ausblick` (9 Stück) | sketches/blocks/*.png | image |

---

## A — Die drei inhaltlichen Grad-0-Knoten

### A.1 Tabelle

| Knoten | Datei | Platzhalter oder Inhalt (Zitat) | Kategorie | Vorschlag | Aufwand |
|---|---|---|---|---|---|
| **Zustands-Synchronisation** (`tech_cloudflare_machbarkeit_state_sync`, concept) | tech/CLOUDFLARE_MACHBARKEIT.md | **Inhalt, klar belegt.** Z. 46–49: „Text, der Agent-Zustand (Reglerwerte, Farben, Ergebnisse) und die Signale für die Animation. […] kommen über die **Zustands-Synchronisation** im Browser an, ohne neue Anfrage." Z. 60 (T4): „Ergebnis per Zustands-Sync nachreichen […] Sync geprüft". Z. 61 (T5): „Agent-Zustand synchronisiert an alle verbundenen Browser (`setState`, `useAgent`)". | Echtes Wissen ohne Verweis — **fehlende Kante**, kein Platzhalter | Kante zu `tech_abgleich` (tech/ABGLEICH.md Z. 26 nennt „Zustands-Synchronisation" wörtlich) und zu `sliders` bzw. `tech_intent` (tech/INTENT.md Z. 23, T5 „Zustand Agent ↔ Browser in Echtzeit synchron"). Nicht selbst setzen: gehört in einen Extraktionslauf. | Klein (eine Zeile Kontext in ABGLEICH/INTENT reicht, damit die Auflösung greift) |
| **Verhaltenstests README** (`tests_readme`, document) | tests/README.md | **Inhalt, kein leerer Platzhalter.** 4 Zeilen: „Hier entstehen Tests für die Abnahmekriterien des ersten implementierten Ablaufs. Noch gibt es keinen Anwendungscode und keine Anwendungstests. Der aktuelle Strukturcheck liegt unter [`scripts/validate.sh`](../scripts/validate.sh)." | Gerüst-Notiz mit echtem Inhalt, **plus eine fehlende Kante** (der Markdown-Link auf `scripts/validate.sh` erzeugt keine Kante) | Inhaltlich nichts tun. Die fehlende Kante ist ein Extraktionsbefund, kein Doku-Loch: der Link existiert, die Kante nicht. | Kein Aufwand am Text; Befund an Extraktion melden |
| **Application Code README** (`src_readme`, document) | src/README.md | **Inhalt, kein leerer Platzhalter.** 3 Zeilen: „Reserviert für die Implementierung des ersten abgestimmten Ablaufs. Framework, Paketverwaltung und Backend-Aufteilung sind noch nicht entschieden. Keine Laufzeit oder Abhängigkeiten allein für dieses Gerüst installieren." | Gerüst-Notiz, **bewusst referenzfrei** (kein Anwendungscode existiert) | Nichts tun. Ein Knoten ohne Kante ist hier die korrekte Abbildung des Projektstands. | 0 |

### A.2 Einordnung

**Zustands-Synchronisation ist der einzige der drei, der echtes Wissen ohne Verweis trägt.**
Der Begriff ist kein Extraktionsartefakt: er steht dreimal im Fließtext derselben Datei
(Z. 46, 60, 61) und wird in `tech/ABGLEICH.md` Z. 26 sowie `tech/INTENT.md` Z. 23 (T5) und
Z. 42 („Jeder Reglerwert ist ein Feld im Agent-Zustand") inhaltlich wieder aufgenommen.
Die Skizze liefert den Ursprung: `sketches/2026-11-12-agentfaehig.md` Z. 77–84
(„Screens: Input und Slider", „max 3", „real time effects"). Es gibt also drei sinnvolle
Zielorte und trotzdem keine Kante — das ist ein Auflösungs-, kein Wissensproblem.

**`tests_readme` und `src_readme` sind keine Platzhalter im Sinne von „leer", aber sie sind
Gerüst.** Beide tragen eine Aussage („noch nicht entschieden", „keine Laufzeit installieren"),
die für den Projektstand relevant ist. Sie sind bewusst referenzfrei. `tests/README.md`
enthält allerdings einen relativen Markdown-Link auf `../scripts/validate.sh`, der als
**Code-Datei-Link** von `extract_markdown` als Citation geführt wird
(`markdown.py:612 _is_code_file_link`, `markdown.py:625 add_link` → `#4804`), im Graphen aber
keine Kante erzeugt. In diesem Graph existiert **keine einzige** Doc→Code-Citation-Kante
(alle Doc-Kanten sind Doc→Doc oder Doc→PDF). Ob das ein Bug der Citation-Auflösung oder
erwartetes Verhalten für `..`-Pfade ist, ist **nicht belegt** — dafür müsste man den
Resolver laufen lassen, was hier untersagt ist.

**Randbefund zu den übrigen Grad-0-Konzepten** (nicht im Auftrag, aber gleiche Klasse):
`tech_cloudflare_machbarkeit_latenz_budget` ist ein **Duplikat** von `latency_budget_800ms`
(deg 1, aus `tech/research/cloudflare-bausteine.md`) — zwei Knoten für dieselbe Sache,
keine Kante dazwischen. `typewriter` ist Mitglied des Hyperedge `latency_sync_gap`
(mit `voice_pipeline` und `tech_abgleich`), hat aber Grad 0, weil **Hyperedges nicht in den
Grad eingehen**. Das erklärt zwei der 16 Grad-0-Knoten rein mechanisch.

---

## B — Das `validate.yml`-Rauschen

### B.1 Wie es entsteht (belegt)

1. `.yml` steht in `CODE_EXTENSIONS` (`detect.py:48`), wird also als Code behandelt, nicht als Doku.
2. Es gibt einen eigenen YAML-Struktur-Extraktor (`extractors/yaml_config.py`), dessen
   Docstring das Ziel nennt: „so that config-heavy repositories (Helm charts, Kubernetes
   manifests, **CI pipelines**) contribute nodes to code-only / AST-only runs (`graphify update`)
   instead of being skipped entirely (#2214)".
3. Der CI-Pfad ist **hart verdrahtet**: `yaml_config.py:112`
   `if "/.github/workflows/" in path.as_posix().casefold(): return True` — jede Datei unter
   `.github/workflows/` gilt unbesehen als Config und wird extrahiert.
4. Ergebnis: Dateiknoten `validate.yml` plus `contains`-Kanten auf **jeden** Top-Level- und
   verschachtelten Key (`name`, `on`, `push`, `pull_request`, `workflow_dispatch`, `jobs`,
   `validate`, `permissions`, `contents`, `runs-on`, `steps`, `uses`, `run`) = 14 Knoten,
   13 Kanten, alle Relation `contains`, alle EXTRACTED.
5. Der Report dämpft das teilweise selbst: 8 dieser Knoten (Grad 1, einzige Kante `contains`)
   werden von `_is_contains_only_ast_node` (`analyze.py:206`) aus der Isolated-Zahl
   ausgeschlossen — „AST declarations […] whose only edge is the structural `contains` […]
   are working as designed, not documentation gaps (#4205)".

### B.2 Ist es abstellbar? Ja, zwei Wege — beide belegt

| Option | Beleg | Wirkung | Bewertung |
|---|---|---|---|
| **`.graphifyignore`** im Scan-Root, gitignore-Syntax, z. B. `.github/workflows/` | `detect.py:1662 _load_graphifyignore`, `detect.py:1636–1645` („Merges .gitignore and .graphifyignore […] .graphifyignore is read last, so .graphifyignore […] adding a .graphifyignore can only ever exclude MORE, never re-include") | Datei fällt komplett aus dem Korpus | **Empfohlen.** Deklarativ, versionskontrollierbar, wirkt auf alle Läufe inkl. `update`/`watch`/Hooks |
| **`--exclude <pattern>`** (wiederholbar) | `cli.py:4547–4550` (Parsing `--exclude`/`--exclude=`), `cli.py:4621–4624` („#1886 persists --exclude", schreibt in `graphify-out/.graphify_build.json` unter `excludes`), gelesen in `watch.py:178 _read_build_excludes`; der Skill-Pfad nutzt sie ebenfalls (`skill.md:128 detect(..., extra_excludes=_read_build_excludes(out_path()))`) | dito, aber an einen Lauf gebunden und dann persistiert | Gleichwertig, aber unsichtbarer (Zustand in `.graphify_build.json`, nicht im Repo) |
| `extract --code-only` | `graphify --help` → `--code-only: index code (local AST, no API key) and skip doc/paper/image files` | **hilft nicht**: `.yml` ist Code, `validate.yml` bleibt drin. Aktueller Stand hat ohnehin `{"code_only": false}` in `.graphify_build.json` | Nicht geeignet |
| `.graphifyrc` | `rcfile.py:1–30`: erlaubte Keys sind nur `viz_node_limit`, `query_budget`, `query_depth`, `language.<ext>` | **kein** include/exclude-Key vorhanden | Nicht verfügbar |

**Zwei Einschränkungen, ehrlich:**

- **Keine der beiden Optionen ist in der Hilfe dokumentiert.** `graphify extract --help`
  gibt nur „Run 'graphify --help' for full usage." aus, und der `extract`-Block in
  `graphify --help` listet `--exclude` **nicht** (dafür `--no-gitignore`, das ausdrücklich
  sagt: „.graphifyignore and --exclude still apply", `cli.py:4866`). `.graphifyignore`
  kommt in `skill.md` überhaupt nicht vor. Beide Optionen sind **nur im Quellcode belegt**,
  nicht in der Nutzerdokumentation.
- **Fachlich ist das Rauschen harmlos und das Abschalten nicht gratis.** Die 14 Knoten
  kosten 0 isolierte Knoten (siehe C) und 13 harmlose `contains`-Kanten. Wenn man sie
  abschaltet, verschwindet auch der einzige Hinweis im Graphen, dass es überhaupt eine
  CI-Datei gibt. Für ein 160-Knoten-Graph ist der Nutzen klein, der Preis (eine
  Ignore-Zeile plus Konfigurationsfläche, die der Projektvertrag ohne Owner-Freigabe nicht
  erlaubt) real.

---

## C — 85 gegen 14, und der gitignore-Status

### C.1 Die 85 sind reproduzierbar — und enthalten keinen einzigen `validate.yml`-Knoten

Nachgerechnet mit der Report-Regel aus `report.py:373–377`:

```
isolated = [n for n in G.nodes() if G.degree(n) <= 1
            and _real_node(n)                      # report.py:202
            and not _is_contains_only_ast_node(G, n)]   # analyze.py:206
```

Ergebnis, exakt getroffen:

| Größe | Wert | Herleitung |
|---|---|---|
| Knoten mit Grad 0 | **16** | 11 image, 3 concept, 2 document |
| Knoten mit Grad 1 | **79** | |
| roh mit Grad ≤ 1 | **95** | = die zweite Zahl im Report („95 node(s) total") |
| davon von der Regel ausgeschlossen | **10** | 8 × `validate.yml` (`contains`-only, Grad 1) + `scripts_validate` (Dateiknoten) + `scripts_validate_sh__entry` (`contains`-only) |
| **Report-Zahl „85 isolated"** | **85** | 95 − 10 ✔ |

Damit ist der Satz aus dem Auftrag („validate.yml macht einen großen Teil der isolierten
Knoten aus") **widerlegt**: die 14 `validate.yml`-Knoten tragen **0** zur Zahl 85 bei.
Sie tragen 8 zur Rohzahl 95 bei — und werden dort von der Report-Regel bereits als
„working as designed" aussortiert. Hätte man `validate.yml` ignoriert, stünde im Report
weiterhin **85 isolated**, nur mit 146 statt 160 Knoten.

Warum 85 und nicht 16: die Report-Definition ist bewusst weich („≤1 connection") und
zählt Konzept- und Dokumentknoten mit, solange sie eine `source_file` mit Endung haben
(`analyze.py:187 _is_concept_node`: nur Knoten **ohne** Dateiendung gelten als Konzept).
Deshalb zählen 56 `file_type: concept`-Knoten mit Grad 1 als „isolated", obwohl sie einen
Beleg in einer Datei haben. Die zweite Zahl im Report (95) ist die ehrlichere Rohzahl.

### C.2 Snapshot 2026-11-18: der Report dort ist veraltet

| Datei | Knoten | Kanten | isolated |
|---|---|---|---|
| `graphify-out/2026-11-18/GRAPH_REPORT.md` (17:07) | 130 | 128 | **66** |
| `graphify-out/2026-11-18/graph.json` (17:37) | **160** | **183** | (nicht im Report erfasst) |
| `graphify-out/GRAPH_REPORT.md` (17:48) | 160 | 183 | **85** |

Der Snapshot-Report und der Snapshot-`graph.json` gehören **nicht zum selben Stand**: die
`graph.json` wurde 30 Minuten nach dem Report überschrieben, der Report nicht neu erzeugt.
Die 66 ist also keine alternative Definition von „isolated", sondern eine ältere
Knotenmenge (130) mit derselben Regel. 66 + 14 (`validate.yml`, im 130er-Stand noch nicht
enthalten) passt zur Größenordnung, ist aber nicht exakt nachrechenbar, weil der
130er-Graph überschrieben ist — **nicht belegt**, nur plausibel.

### C.3 `graphify-out` ist nicht ignoriert

- `.gitignore` im Repo-Root enthält **keinen** Eintrag zu `graphify-out` (geprüft: vollständiger
  Dateiinhalt gelesen; Treffer nur für `/runtime/`, `/sessions/raw/`, `.env`, `node_modules` u. a.).
- `git check-ignore -v graphify-out/ graphify-out/graph.json` → **Exit 1, keine Ausgabe** = kein Treffer.
- `git config core.excludesFile` → nicht gesetzt.
- Weitere `.gitignore`-Dateien im Repo: nur `./.gitignore`.
- `git status --short` führt `?? graphify-out/` — also **untracked und nicht ignoriert**.
- Größe des Verzeichnisses: `graph.json` 106 KB, `graph.html` 130 KB, plus Cache und Snapshot.

Nebenbei auffällig: `graphify-out/` enthält `graphify-out/2026-11-18/` mit einer eigenen
`graph.json` — ein Graph-im-Graph-Verzeichnis. `skill.md:155` sieht vor, Pfade unter
`scan_root + "/graphify-out/"` herauszufiltern; im aktuellen Graphen tauchen folgerichtig
keine `graphify-out`-Knoten auf (nur als Konzept `graphify_out_graph_*` aus
`UPSTREAM_SEARCH.md`). Das funktioniert also.

---

## Empfehlung

**Vor Projektstart sinnvoll (klein, reversibel):**

1. **`graphify-out/` in `.gitignore` aufnehmen.** Es ist generierter Output (236 KB Text +
   HTML), untracked, und ohne Eintrag landen Cache-, Snapshot- und Reportdateien früher oder
   später versehentlich im Commit. Ein `graphify-out/`-Block mit einer Zeile genügt.
   *Erfordert Owner-Freigabe (Repo-Änderung), nicht selbst ausführen.*
2. **Zustands-Synchronisation einmal verlinken.** Der Knoten ist der einzige der drei, der
   echtes Wissen ohne Verweis trägt. `tech/ABGLEICH.md` Z. 26 nennt den Begriff bereits
   wörtlich — es fehlt keine Prosa, nur die Auflösung. Wenn man den Graphen behalten will,
   ist ein erneuter Extraktionslauf nach der nächsten Textänderung ausreichend; eine
   manuelle Kante ist nicht nötig und wäre gegen die Graph-Hygiene.

**Nicht tun:**

3. **`validate.yml` nicht ausschließen.** Es kostet 0 isolierte Knoten, 13 harmlose Kanten
   und ist die einzige Spur der CI im Graphen. Eine `.graphifyignore` dafür wäre reine
   Kosmetik an einer Zahl, die niemanden blockiert — und sie führt eine Konfigurationsfläche
   ein, die der Projektvertrag ohne ausdrücklichen Auftrag nicht vorsieht
   („Keine neuen Config-Keys ohne ausdrücklichen Auftrag").
4. **`src/README.md` und `tests/README.md` nicht anfassen.** Beide tragen Inhalt, beide sind
   bewusst referenzfrei. Ein Knoten ohne Kante ist hier die richtige Abbildung des Stands
   „es gibt noch keinen Code". Wer sie verlinkt, verlinkt Gerüst zu Gerüst.
5. **Die 85 nicht als Qualitätsziel behandeln.** Die Zahl ist eine Report-Konvention
   („≤1 connection", Konzepte mit Datei zählen mit), kein Befund. Die belastbare Zahl für
   „echt verwaist" ist 16 Grad 0 — und davon sind 11 Skizzen-PNGs, die per Definition
   keine Kanten tragen.

---

## Antwort in 5 Zeilen

- **Platzhalter-Urteil:** `src/README.md` und `tests/README.md` tragen echten Inhalt, sind aber bewusst referenzfreies Gerüst; nur „Zustands-Synchronisation" ist echtes Wissen ohne Verweis (dreifach belegt: CLOUDFLARE_MACHBARKEIT.md Z. 46/60/61, ABGLEICH.md Z. 26, INTENT.md Z. 23).
- **Rauschen abstellbar:** ja, aber nicht nötig — `.graphifyignore` (detect.py:1662) oder `--exclude` (cli.py:4547, persistiert in `.graphify_build.json`); `--code-only` hilft nicht (`.yml` ist Code), `.graphifyrc` hat keinen exclude-Key.
- **85 gegen 14:** die 85 ist exakt reproduziert (95 Knoten mit Grad ≤ 1 minus 10 contains-only/Dateiknoten); die 14 `validate.yml`-Knoten tragen davon **0** bei — die Auftragsannahme, sie machten einen großen Teil aus, ist falsch; der Snapshot-Report (66/130) ist gegenüber seiner eigenen `graph.json` (160/183) veraltet.
- **gitignore-Status:** `graphify-out` steht **nicht** in `.gitignore` (check-ignore Exit 1, `git status` = `?? graphify-out/`) — einzige echte Lücke.
- **Empfehlung:** `graphify-out/` ignorieren (Owner-Freigabe nötig); `validate.yml`-Rauschen stehen lassen; `src`/`tests`-READMEs unberührt lassen; 85 nicht als Qualitätsziel lesen.
