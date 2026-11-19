# Triage P1 — Bild-Embeds und relative Bildpfade: warum die PNG-Knoten Grad 0 haben

Stand: 19.11.2026 · Graph: `graphify-out/graph.json` (160 Knoten, 183 Kanten, 12 Hyperedges)
Geprüfte Behauptung: „Zehn Bilder sind per Markdown-Embed eingebettet, ihre PNG-Knoten haben
trotzdem Grad 0."
Prüfart: read-only. Kein `extract`/`cluster-only`/`label`/`update` im Repo, `graph.json` und alle
`.md` unverändert. Reproduktion ausschließlich im Temp-Verzeichnis
`/private/var/folders/cp/51bmm8v964s4mtd3ydyys65m0000gn/T/p1-img-repro`.
Installierte Version: **graphifyy 0.9.112** (`uv tool list`).

---

## 1 · Verdict

**„Extraktor ignoriert Bild-Embeds" — bestätigt, aber die Ursache ist breiter als der Befund
annimmt.**

Es sind **zwei voneinander unabhängige Sperren** im Markdown-Extraktor, und beide müssen
gleichzeitig fallen, damit eine Kante entstehen könnte:

| # | Sperre | Wirkung |
|---|---|---|
| A | `(?<!\!)`-Lookbehind in allen drei Link-Regexen | `![alt](bild.png)` wird **syntaktisch nicht als Link erkannt** — kein Match, keine Kante |
| B | Endungs-Whitelist `_MD_CITEABLE_EXTS` | Selbst ein **normaler** Link `[Text](bild.png)` wird verworfen, weil `.png` (und `.jpg`, `.svg`, `.pdf`) nicht in der Whitelist steht |

Die zweite Sperre ist die härtere Erkenntnis: **Der Befund „Embed wird ignoriert" ist wahr, aber
ein Umbau des Embeds in einen normalen Markdown-Link würde nichts ändern.** Das ist im
Reproduktions-Matrix-Test unten belegt.

Damit sind die zehn PNG-Knoten **kein Doku-Fehler und nicht durch Doku heilbar.** Es ist eine
bewusste Design-Entscheidung des Extraktors, keine Lücke im Repo.

---

## 2 · Beleg (installiertes Paket)

Paketwurzel:
`/Users/samuelfleig/.local/share/uv/tools/graphifyy/lib/python3.14/site-packages/graphify/`

### Sperre A — Bild-Syntax wird gar nicht erst als Link gelesen

`/Users/samuelfleig/.local/share/uv/tools/graphifyy/lib/python3.14/site-packages/graphify/extractors/markdown.py:22-26`

```python
_MD_INLINE_LINK_RE = re.compile(
    r'(?<!\!)\[[^\]]*\]\(\s*(?:'
    r'<([^<>\n]+)>\s*(?:"[^"\n]*"|\'[^\'\n]*\'|\([^()\n]*\))?\s*'
    r'|<?([^)\s>]+)>?(?:\s+[^)]*)?'
    r')\)')
```

Der Kommentar direkt darüber (Zeile 20-21) benennt die Absicht wörtlich:

```
# Inline markdown link: [text](target "optional title"). The negative lookbehind
# excludes images (![alt](src)).
```

Dieselbe `(?<!\!)` steht auch auf `_MD_REF_LINK_RE` (`:34`) und `_MD_WIKILINK_RE` (`:36`) —
reference-style und Obsidian-Wikilinks auf Bilder sind identisch gesperrt.

### Sperre B — Endungs-Whitelist verwirft Bildpfade

`…/graphify/extractors/markdown.py:40` und `:43`

```python
_MD_LINKABLE_EXTS = {".md", ".mdx", ".qmd", ".markdown", ".rst", ".txt"}
_MD_CITEABLE_EXTS = _MD_LINKABLE_EXTS | CODE_EXTENSIONS
```

`…/graphify/extractors/markdown.py:375-377` (in `_resolve_markdown_link`)

```python
linkable = _MD_LINKABLE_EXTS if exts is None else exts
if suffix not in linkable:
    if not wikilink:
        return None
```

`add_link()` ruft genau diese Funktion mit `exts=_MD_CITEABLE_EXTS` auf (`:618-619`, `:658`).
`.png` steht in keiner der beiden Mengen → `None` → kein `references`-Edge.

### Die Entscheidung ist dokumentiert, nicht versehentlich

`…/graphify/extractors/markdown.py:485` (Docstring von `extract_markdown`)

```
      URLs, in-page anchors, images and non-document targets are skipped; a
```

Für Wikilinks zusätzlich `:348`: `otherwise (``[[image.png]]``) it stays skipped.`

### Der eine PDF-Knoten mit Grad 1 ist **kein** Gegenbeweis

`sketches_2026_11_12_agentfaehig_pdf` hat eine Kante
(`notion_readme --references--> sketches_2026_11_12_agentfaehig_pdf`). Die stammt **nicht** aus
einem `.pdf`-Link: `notion/README.md:28` enthält nur den Code-Span `` `../sketches/` ``, und dieser
Verzeichnisverweis wurde falsch auf das PDF aufgelöst. `source_location` ist bei der Kante `None`.
Das deckt sich mit dem Befund in `P3-grad1-a.md` (Zeile 40, „Fehlauflösung"). Ein `.pdf`-Link
liefert nach Sperre B ebenfalls keine Kante.

---

## 3 · Reproduktion (Temp-Verzeichnis, ohne LLM, ohne Repo-Graph)

Zwei Ebenen, beide im Temp-Verzeichnis. Kein API-Key, kein LLM, `graph.json` des Repos unberührt.

### 3.1 Funktions-Ebene: `extract_markdown()` direkt

Eine `doc.md` mit Bild-Embed, normalem Link auf ein zweites PNG und einem echten `.md`-Link:

```
![Ausschnitt 1](blocks/01-einstieg.png)
Ein echter Link auf [das zweite Bild](blocks/02-zweit.png).
Ein Doku-Link auf [Notizen](notes.md).
```

Ergebnis:

```
EDGES:
  doc_md -> doc_test   contains
  doc_md -> notes_md   references      ← nur der .md-Link
```

Beide PNG-Links — Embed **und** normaler Link — erzeugen nichts.

### 3.2 Konstrukt-Matrix: erzeugt *irgendeine* Markdown-Form eine PNG-Kante?

| Konstrukt | Kante entstanden? |
|---|---|
| `![Alt](blocks/01-einstieg.png)` (Embed) | nein |
| `[Bild](blocks/01-einstieg.png)` (normaler Link) | nein |
| `[Bild][b1]` + `[b1]: blocks/01-einstieg.png` (reference-style) | nein |
| `[[blocks/01-einstieg.png]]` (Wikilink) | nein |
| `` `blocks/01-einstieg.png` `` (Code-Span) | nein (keine Datei-Zitation, weil `.png` ∉ `CODE_EXTENSIONS`) |
| `<img src="blocks/01-einstieg.png">` (HTML) | nein |
| `[Notizen](notes.md)` (Gegenprobe) | **ja**, `references` |

**Fazit: In graphifyy 0.9.112 existiert keine Markdown-Schreibweise, die einem Bildknoten eine
Kante gibt.**

### 3.3 `graphify update` (AST, kein LLM) — kein Unterschied

`graphify update .` im Temp-Verzeichnis: 4 Knoten, 3 Kanten. Die PNG-Dateien tauchen **gar nicht
auf** (keine Bildknoten, keine Kanten). Die CLI sagt es selbst:

```
Code graph updated. For doc/paper/image changes run /graphify --update in your AI assistant.
```

`update` behandelt Bilder überhaupt nicht. Bildknoten entstehen ausschließlich im semantischen
LLM-Pass (`cli.py:4703`, `file_type` aus `detect.py`/`analyze.py`), der Knoten für Bilddateien
anlegt, aber **keine** Kanten dafür erzeugt — genau das beobachtete Muster
`_origin: "semantic"` + `file_type: "image"` + Grad 0.

`.graphifyrc` bietet keine Rettung: laut `rcfile.py:1-31` gibt es nur `viz_node_limit`,
`query_budget`, `query_depth` und `language.<ext>=<sprache>`. Eine Endungs-Whitelist für Assets
ist nicht konfigurierbar.

---

## 4 · Fix-Optionen

| # | Option | Hält über den nächsten Lauf? | Aufwand | Nebenwirkung |
|---|---|---|---|---|
| 1 | **Akzeptieren + im Triage-Bericht als Extraktor-Limit festhalten** | ja | 0 | Bildknoten bleiben isoliert; niemand sucht später erneut nach der Ursache |
| 2 | **Upstream-Patch in graphifyy**: Asset-Endungen (`.png .jpg .jpeg .svg .webp .pdf`) in den Link-Pfad aufnehmen und als `file --embeds--> image` bzw. `--references-->` ausgeben. Die Relation `embeds` existiert bereits in `SEMANTIC_RELATIONS` (`extract.py:714`), es braucht also keinen neuen Edgetyp | ja (ab Version mit Patch) | **M** — PR gegen Upstream, Review, dann `uv tool upgrade` + vollständiger Re-Extract | Alle Bild-/Asset-Kanten aller Repos entstehen neu; Graph wächst; Re-Extract braucht den LLM-Backend-Lauf. Kein lokaler Quickfix |
| 3 | **Manuelle Kanten-Injektion in `graph.json`** | **nein** — der nächste `extract`/`update`-Lauf baut `graph.json` neu und überschreibt | S (Minuten) | Erzeugt einen Graphen, der nicht reproduzierbar ist. Widerspricht dem Zweck des Graphen; im Triage-Kontext zusätzlich ein Read-only-Bruch |
| 4 | **Doku-Seite weglassen, stattdessen je Bild eine `.md`-Sidecar** (`blocks/01-einstieg.md`, die das Bild beschreibt und von der Skizze verlinkt wird) | ja | M (11 Dateien + Skizzen-Umbau) | **Heilt die Bildknoten nicht** — der Bildknoten bleibt Grad 0, nur ein neuer Dokumentknoten bekommt eine Kante. Verschiebt das Problem und bläht das Repo auf. Nicht empfohlen |
| 5 | `.graphifyrc`-Konfiguration | — | — | **Nicht möglich**, `rcfile.py` kennt keinen Asset-Key (siehe 3.3) |

Option 4 ist bewusst aufgeführt, weil sie naheliegend klingt: sie löst den Befund nicht.

---

## 5 · Was das für die elf Grad-0-Bildknoten bedeutet

Der Befund nennt zehn Bilder. Tatsächlich sind **elf** PNG-Knoten bei Grad 0 — und die elf
zerfallen in zwei verschiedene Fälle, die man nicht zusammen behandeln darf:

| Fall | Knoten | Referenz vorhanden? | Heilbar durch Doku? |
|---|---|---|---|
| **A** | zehn Blockbilder (`blocks/01-einstieg.png` … `10-technik-und-ausblick.png`), eingebettet in `sketches/2026-11-12-agentfaehig.md:22,32,56,69,79,99,109,133,141,150` | **ja**, als Embed | **nein.** Die Referenz existiert, der Extraktor verwirft sie (Sperre A + B). Doku-Arbeit kann das nicht ändern — es gibt keine Markdown-Form, die zählt (3.2) |
| **B** | `sketches/2026-11-12-agentfaehig.png` (Ganzseiten-Scan) | **nein** — in keiner `.md` außerhalb `graphify-out/` referenziert | **nein, und zwar zu Recht.** Grad 0 ist hier die korrekte Abbildung: es gibt keinen Verweis. Auch ein neuer Verweis würde wegen Sperre B keine Kante erzeugen |

**Konsequenz.** Die zehn Blockbilder sind ein reiner Extraktor-Artefakt (Kategorie
`EXTRAKTOR-ARTEFAKT`, wie schon in `P3-grad1-a.md` Zeile 21 und `P5-grad0-und-rauschen.md`
Zeile 30-31 vermerkt). Sie sind **nicht** durch Doku heilbar, und es wäre falsch, dafür
Doku-Zeilen zu schreiben. Der einzige dauerhafte Weg ist Option 2 (Upstream). Bis dahin ist
Grad 0 für diese Knoten die ehrliche Abbildung des Extraktor-Stands, nicht ein Mangel des Repos.

Die in `P3-grad1-a.md` Zeile 21 vorgeschlagene Variante „Verzeichnis-Link `blocks/` →
`contains` je Blockbild" wäre ebenfalls ein Upstream-Eingriff, kein Doku-Fix — sie ist mit
Option 2 verwandt, aber schwächer (hängt an einem einzigen Verzeichnis-Link).

---

## 6 · Empfehlung

1. **Nichts im Repo ändern.** Kein Doku-Text, kein `graph.json`-Eingriff.
2. Diesen Befund als Extraktor-Limit in `P5-grad0-und-rauschen.md` gegenzeichnen (Verweis auf
   diese Datei), damit die elf Bildknoten nicht erneut triagiert werden.
3. Wenn Bildkanten im Graphen gebraucht werden: **Option 2 als Upstream-Issue/PR** anlegen
   (`embeds`-Relation existiert bereits). Nicht lokal patchen — der nächste Lauf überschreibt es.
