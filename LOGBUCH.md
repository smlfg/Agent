# LOGBUCH

Entscheidungen, die belegt sind und **nicht versehentlich zurückgedreht werden dürfen**.

Lies das vor der Arbeit an `hai-mcp` oder `HAI_UIV1`. Jeder Eintrag nennt die Entscheidung, den
Grund, die Fundstelle und was nicht passieren darf. Wer einen Eintrag umkehren will, muss zuerst
seinen Grund widerlegen — nicht ihn übersehen.

---

## 2026-08-09 — Der Tag, an dem HAI seinen eigenen Owner ausgesperrt hat

Ausgangslage: Writer Credits auf 0, kein Agent durfte mehr schreiben, `hai_authorize_session` war
über jeden realen MCP-Client unerreichbar, Missionen ohne `project_path` konnten nie `completed`
werden. 21 abgebrochene gegen 9 fertige Missionen, mediane Lebensdauer **2 Minuten**, 15 der 21
Abbrüche waren Owner-Umlenkungen. Der Owner hat den MCP deaktiviert, um überhaupt arbeiten zu
können. Vollständig in [`fails/0004-writer-credits-blocked-the-owner.json`](fails/0004-writer-credits-blocked-the-owner.json).

### 1. Lernen kauft Kapazität — das ist die Substanz, nicht der Zoll

**Entscheidung:** Gleichzeitige Writer sind begrenzt, und die Grenze wächst durch abgeschlossene
Learning Blocks.

**Warum:** Wer agentisch codet, lernt nichts mehr. Und wer nichts mehr lernt, kann irgendwann nicht
mehr beurteilen, was die Agenten liefern. Die Kopplung ist keine Taktung und kein Sicherheitsgurt,
sondern der Schutz gegen Kompetenzverfall des Owners.

**Was nicht passieren darf:** Diese Kopplung wegoptimieren, weil sie im Weg steht. Genau das ist am
2026-08-09 schon einmal passiert — der Ledger wurde auf *„intentionally informational"* gestellt und
die Kopplung damit stillgelegt. Das produziert kurzfristig mehr und macht den Owner langfristig
blind. Wer hier Reibung entfernen will, muss zuerst diesen Absatz widerlegen.

### 2. Die Kapazität hat einen Boden und erreicht nie null

**Entscheidung:** `worker_capacity = min(floor + Lernblöcke, cap)`, `floor = 2`, `cap = 6`.
`LearningBudget.worker_capacity()` **wirft grundsätzlich nicht**.

**Warum:** Writer-Admission fällt bei Exceptions fail-closed durch. Eine werfende oder auf 0 fallende
Kapazität ist deshalb keine strenge Variante — sie ist Totalsperre. Genau daran ist der Tag
gescheitert. Ohne Lernen wird es *enger*, nie *zu*.

**Fundstelle:** `hai-mcp/src/hai_mcp/learning_budget.py: worker_capacity`,
`tests/test_worker_capacity.py: test_capacity_survives_a_destroyed_learning_ledger`.

**Was nicht passieren darf:** Den Boden auf 0 setzen. Eine Exception aus `worker_capacity()`
propagieren lassen. Verfall einbauen, der die Kapazität still schrumpfen lässt.

### 3. Themen sind unbegrenzt, Writer sind begrenzt

**Entscheidung:** `ACTIVE_CONTEXT.json` ist eine Liste, kein Kontingent. Mehrere Missionen dürfen
gleichzeitig `active` sein; `missions/active_mission.json` ist **Fokuszeiger, kein Exklusivschloss**.

**Warum:** Die knappe Ressource ist nicht, an wie viel der Owner denkt, sondern wie viel gleichzeitig
zurückkommt. Ein Deckel auf Themen bestrafte ihn dafür, an mehr als zwei Dinge zu denken, während die
Zahl gleichzeitiger Writer unbegrenzt blieb. Weil ein zweites Thema keine Mission öffnen konnte,
musste jeder Themenwechsel die laufende Mission töten — daher 15 Owner-Abbrüche an einem Tag.

**Fundstelle:** `mission.py: open_mission`, `state.py: set_focus`.

**Falle:** `_session_valid` prüfte zusätzlich gegen den globalen Aktiv-Zeiger. Das war korrekt,
solange nur eine Mission existieren konnte, und ist ab jetzt **still fatal**: jede Lease außerhalb der
fokussierten Mission gälte als ungültig, könnte weder ihren Contract lesen noch einen Slot halten.
Mehrere Missionen wären eine leere Geste. Ein Test hat das gefangen, kein Mensch.

### 4. Kollisionen verhindern disjunkte Write-Scopes, nicht ein Single-Writer-Lock

**Entscheidung:** Eine Writer-Lease reserviert `constraints.allowed_paths` unter `project_path`.
Überschneidet sich das mit einem aktiven Writer, wird abgelehnt — mit Pfad, Halter und Ablaufzeit.

**Warum:** Ein harter „genau ein Writer" verhindert Kollisionen, indem er Parallelität ganz verbietet.
Das ist zu teuer und löst das falsche Problem: Zwei Agenten in verschiedenen Verzeichnissen stören
sich nicht.

**Beleg, dass es nötig ist:** Am selben Tag haben zwei Sessions gleichzeitig in
`HAI_UIV1/Sources/HAIUIApp/HAIUIApp.swift` geschrieben; eine hat die Arbeit der anderen komplett
zurückgesetzt und deren Dateien per `exclude` aus `Package.swift` genommen. Der Build meldete trotzdem
„Build complete".

**Beleg, dass es wirkt:** Um 14:45 wurde eine Lease auf `AGENTS.md` mit `write_scope_conflict`
abgelehnt, weil `cursor-main-kimi-k3` sie bis 16:43 hielt. Vorher gewarnt statt hinterher überschrieben.

### 5. Der Bypass ist ein Logbuch mit Grund und Ablauf — kein Konfig-Flag

**Entscheidung:** Der Owner hebt die Kapazität befristet auf `cap`, indem er im Worker Panel einen
**Pflichtgrund** schreibt. Append-only nach `~/.hai/logbook/limits.jsonl`, `hai-mcp` liest dieselbe
Datei. Nach Ablauf fällt die Kapazität von selbst zurück.

**Warum:** `emergency_bypass_enabled` stand im Code, war per Test auf `false` geprüft und wurde von
**keinem** Enforcement-Pfad je gelesen. Toter Sicherheitskonfig ist schlimmer als keiner. Der Grund
wird nie bewertet, nur festgehalten — „Habe jetzt Zeit und Lust zu arbeiten" ist eine vollständige
Antwort. Der Zweck ist, dass die Entscheidung morgen noch lesbar ist, wenn der Burst still zum
Normalzustand geworden ist.

**Was nicht passieren darf:** Ein Flag wiedereinführen, das umgeht, ohne zu protokollieren. Eine Datei
schreiben, die niemand liest — das war der Fehler von `OWNER_CONTRACT.json`.

### 6. Ein MCP-Parameter ohne Typ ist ein unerreichbares Tool

**Entscheidung:** Boundary-Parameter werden als `StrictInt`/`StrictBool`/`StrictNumber` deklariert
(`Annotated[Any, Field(json_schema_extra={"type": …})]`). Laufzeit bleibt un-coerced, das Schema nennt
den Typ.

**Warum:** Nacktes `Any` veröffentlicht ein Schema **ohne** Typangabe. Ein konformer Client darf eine
Zahl dann als String serialisieren, und `strict_int` lehnt fail-closed ab — das Tool ist dauerhaft
unerreichbar statt bloß streng. Der Defekt war client-abhängig: in Cursor lief es, in Claude Code
nicht, und keine Fehlermeldung zeigte auf die Ursache.

**Warum es niemand gemerkt hat:** 151 grüne Tests. Sie rufen die Engine in-process mit echten
Integern auf und nie die Schnittstelle, an der ein Client ankommt.

**Was nicht passieren darf:** Einen Boundary-Parameter ohne Typangabe veröffentlichen. Offen und
empfohlen: `npx @modelcontextprotocol/inspector --cli` ins CI.

### 7. Tests, die nie gelaufen sind, sind keine Tests

**Fundstellen:**
- `hai-mcp/pyproject.toml`: `pythonpath` fehlte der Repo-Root, `tests/test_stdio_smoke.py` scheiterte
  an `ModuleNotFoundError` — unbemerkt.
- `HAI_UIV1/scripts/test.sh`: Ohne installiertes Xcode.app findet SwiftPM `swift-testing` nicht von
  allein. Erst `no such module 'Testing'`, nach dessen Behebung
  `Library not loaded: @rpath/lib_TestingInterop.dylib`. Beide Pfade liegen unter CommandLineTools in
  **verschiedenen** Verzeichnissen. Die vorhandenen Tests liefen dadurch nie.
- `scripts/validate.sh` brach in einem eingevendorten `node_modules` an einer kommentierten
  `tsconfig.json` ab — der Root wurde eine Zeit lang **gar nicht** validiert und meldete trotzdem nie
  „Fehler".

**Regel:** Ein grüner Lauf ist erst ein Beleg, wenn er auch wirklich stattgefunden hat. Prüfe die Zahl
der ausgeführten Tests, nicht nur den Exit-Code.

---

## 2026-08-18 — Nachgang: Der DEGRADED-Tag 09.08. ist abgewickelt

Am 09.08. fiel der Cursor-Transport zu `hai-mcp` wiederholt aus („Not connected" bei
ready-Schema). Etwa zehn Missionen wurden per ControlPlane-Adapter (`uv run`, sichtbar, mit
Fail-Record und Backfill) geschlossen, statt still weiterzuarbeiten. Die Trümmer lagen seitdem
als ~38 Inbox-Items und sechs Fail-Records herum (Inventur `INVENTUR-2026-08-18.md`, Cluster A/B).
Dieser Abschnitt führt sie über; die Inbox-Items selbst bleiben unangetastet, ihr Archivieren
ist eine Owner-Entscheidung.

### 1. Die Backfill-Norm hat getragen

**Entscheidung:** Bei Transport-Ausfall ist der ControlPlane-Adapter (`uv run python`,
`scripts/hai_mcp_call.py`) der dokumentierte DEGRADED-Pfad: sichtbar, mit Fail-Record,
Checkpoint und Backfill — nie ein stiller Direct-Write auf `~/.hai`.

**Warum:** Er hat am 09.08. rund zehn Closes ohne Datenverlust getragen
(fails/0005, 0006, 0010, 0011, 0016, 0017). Dieselbe Norm steht in `docs/ARCHITECTURE.md`
(Bootstrap-Adapter).

**Was nicht passieren darf:** Den Adapter still zur Gewohnheit machen. Er existiert für
Ausfälle; wer dauerhaft über ihn arbeitet, umgeht die Qualifizierung von `hai-mcp`.

### 2. Owner-ACKs aus der Inbox waren einmalig und missionsgebunden

Die ACKs vom 09.08. (Plan-Gate-Einmalausnahme für `M-20260809T123452`, Composer-2.5-
Writer-Fallback, „full-speed") galten für konkrete, längst geschlossene Missionen.

**Was nicht passieren darf:** Sie als Präzedenz oder Dauerfreigabe zitieren. Jede neue
Ausnahme braucht ein neues, exaktes Owner-Gate.

### 3. Was vom 09.08. offen bleibt

- **Root-Fix Fokus-Pointer** (`fails/0008-active-mission-pointer-wipe.md`,
  `mission.py:1425/1494`): Close wischt den Pointer unbedingt statt nur bei der gepointeten
  Mission. Bis heute kein Fix, kein Test.
- **Regression steht auf „desired":** Kein Fail 0005–0014 hat einen implementierten Test.
  Der Lernloop stoppt nach dem Erfassen.
- **Nummernkollisionen** in `fails/` sind seit heute aufgelöst (zweites `0005` → `0015`,
  `0008-verified-store` → `0016`, `0008-orphan` → `0017`).

---

## 2026-08-18 — Überschreiben nur mit Verdichtung (Hot State ≠ Gedächtnis)

Auslöser: Am selben Tag wurde `00_AKTUELL/JETZT.md` neu geschrieben und der Stand vom Morgen
(die A/B/C-Scope-Frage zu „fix hai-mcp") ging dabei verloren — nur im Chat-Transkript überlebt.
`~/Projects` ist kein Git-Repo; HAI-Checkpoints sichern `ACTIVE_CONTEXT.json`, aber **nicht**
`JETZT.md` oder `ACTIVE_PROJECTS.md`.

### 1. Hot State darf nur überschrieben werden, wenn die Verdichtung im Wiki liegt

**Entscheidung:** Hot State — `JETZT.md`, `ACTIVE_CONTEXT.json`, `ACTIVE_PROJECTS.md` — ist
überschreibbar, **aber nur**, wenn die verdichteten Kerninformationen des Vorgängerstands vorher
im versionierten Wiki dokumentiert (oder implementiert) sind. Das Wiki ist das, was parallel zu
HAI entsteht und in Git liegt: `LOGBUCH.md`, `fails/`, `docs/`, `INVENTUR-*`, `contracts/`.

**Warum:** Hot State beantwortet „wo stehen wir jetzt", das Wiki beantwortet „warum stehen wir
hier und was galt vorher". Wird Hot State ohne Verdichtung überschrieben, verliert HAI sein
Gedächtnis, während es behauptet, eines zu haben. Append-only-Flächen (Inbox, Audit,
Checkpoints, Intakes) zeigen, dass das System es anders längst richtig macht.

**Fundstelle:** Verlust vom 18.08. (altes `JETZT.md`, Scope-Frage A/B/C); Inventur
`INVENTUR-2026-08-18.md`; Intake `I-20260818T173852-d95132d8`.

**Was nicht passieren darf:** Ein Tagesstand, Fokus oder Lane-Wechsel, der den Vorgänger
kommentarlos ersetzt. Mindestverdichtung vor jedem Überschreiben: ein Satz im Wiki, was galt
und warum es fällt. Wer das zu aufwendig findet, darf Hot State nicht anfassen — sondern parken.

---

## Offen, bewusst nicht gelöst

- **Umlenken ist kein Scheitern, aber HAI kennt nur `completed` und `abandoned`.** 15 gute
  Entscheidungen stehen deshalb als Fehlschläge im Audit. Das Log lügt den Owner über sich selbst an.
  Ein dritter Ausgang (`redirected`/`parked`, wiederaufnehmbar) fehlt.
- **Die Kapazitätsformel steht doppelt**, in `hai_mcp/learning_budget.py` und in
  `HAI_UIV1/Sources/HAIClient/HAIOverviewReader.swift`. Driftet eine, driftet die Anzeige.
- **Die Credit-Felder liegen noch neben der Kapazität**, rein informativ. Historie, kein Gate.
- **Durchsetzung ist asymmetrisch.** `.cursor/hooks.json` blockt schreibende Shell-Befehle ohne aktive
  Mission fail-closed; Claude Code hat **keine** Hooks. HAI bindet nur, wer freiwillig durch die
  Zeremonie geht oder wo jemand einen Hook installiert hat. Symmetrisch machen erst, wenn die Gates
  nicht mehr würgen — sonst verdoppelt es den Schaden.
- **`beads` und `mcp_agent_mail`** liegen als `candidate_unverified` in der Registry, Smoke belegt,
  nicht angedockt. Siehe `STACK.md`.
