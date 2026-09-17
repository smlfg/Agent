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
  *Historisch. Überholt durch den Eintrag 2026-09-01 — sieben Closures; den Absatz nicht löschen.*
- **Die Kapazitätsformel steht doppelt**, in `hai_mcp/learning_budget.py` und in
  `HAI_UIV1/Sources/HAIClient/HAIOverviewReader.swift`. Driftet eine, driftet die Anzeige.
- **Die Credit-Felder liegen noch neben der Kapazität**, rein informativ. Historie, kein Gate.
- **Durchsetzung ist asymmetrisch.** `.cursor/hooks.json` blockt schreibende Shell-Befehle ohne aktive
  Mission fail-closed; Claude Code hat **keine** Hooks. HAI bindet nur, wer freiwillig durch die
  Zeremonie geht oder wo jemand einen Hook installiert hat. Symmetrisch machen erst, wenn die Gates
  nicht mehr würgen — sonst verdoppelt es den Schaden.
## 2026-08-18 — hai-mcp ist real implementiert, aber nicht qualifiziert

**Entscheidung:** hai-mcp bleibt unqualifiziert, bis die Stufen `Discover → Qualify → Sandbox →
Functional Check → Contract Validation → Tests/Conformance` mit Pfad-Evidenz durch sind. Solange
darf der Bootstrap-Adapter weiter arbeiten, aber nur mit sichtbarem `DEGRADED`, HAI-Fail und
Backfill-Plan. Stiller Bypass bleibt verboten.

**Warum:** AGENTS.md nennt hai-mcp wortwörtlich „die erste, noch unqualifizierte Bindung". Das ist
keine Lücke in der Doku, sondern gemessener Stand. Eine Bestandsaufnahme am 2026-08-18 zeigt
[path: `docs/`]: kein einziges Qualifikations-Dokument für hai-mcp, nur `EMAIL_MCP_READ_PATH.md`
(anderes Thema). In [`fails/`](fails/) liegen 8 Einträge mit `hai-mcp` im Namen — 0002, 0003,
0005, 0006, 0010, 0011, 0015, 0016 — die alle dasselbe Symptom in zwei Spielarten beschreiben:

1. `GetMcpTools` liefert `serverStatus: ready` und volle Tool-Liste, aber `CallMcpTool` für
   `hai_health`, `hai_status`, `hai_open_mission`, `hai_checkpoint`, `hai_close_mission` schlägt
   mit `Not connected` / `transport closed` fehl. Schema ist da, Transport nicht.
2. Catch-22: ohne `hai_open_mission` keine Mission, ohne Mission blockt der Shell-Hook jeden
   Schreibbefehl mit `keine aktive HAI-Mission für Schreibbefehl`. Fail 0015 beschreibt diesen
   Deadlock, Fail 0003 nennt ihn am konkreten HAI-TikTok-Slice.

**Was nicht passieren darf:**

- hai-mcp als „qualifiziert" oder „primären Control-Plane-Pfad" bezeichnen, ohne dass die
  Funktionalen Checks `hai_health`, `hai_status`, `hai_open_mission`, `hai_checkpoint`,
  `hai_close_mission` in mindestens einer Host-Session mit Pfad-Evidenz durchgelaufen sind.
- Den Deadlock zwischen Schema-Ready und Transport-Close mit einem stillen Hand-Edit auf
  `~/.hai/missions/active_mission.json` oder `mission.json` auflösen. Fail 0005, 0010, 0015
  verbieten das explizit (`safety_boundary`).
- `hai-mcp/AGENTS.md` (Owner-Read-First: `GOAL.md`, `docs/TOOL_CONTRACT.md`) überspringen, wenn
  ein Qualifikations-Slice aufgemacht wird. TOOL_CONTRACT.md ist der Prüfling der Stage
  `Contract Validation`.
- Die 8 Fail-Einträge zu einer Regression-Test-Suite zusammenfassen, ohne dass jeder einzelne
  Fail im Loop „beobachten, Grenze bewahren, strukturiert erfassen, Regression definieren"
  durchgelaufen ist. Aggregieren vor Qualifizieren ist Aggregat ohne Beleg.

**Fundstellen:** `hai-mcp/AGENTS.md`, `hai-mcp/docs/TOOL_CONTRACT.md` (noch zu lesen),
`fails/0002-hai-mcp-unavailable-in-cursor.json`,
`fails/0003-hai-mcp-transport-closed-during-hai-tiktok.json`,
`fails/0005-hai-mcp-not-connected-during-mission-close.json`
(mitigation: `hai-mcp/scripts/hai_mcp_call.py` stdio-bridge, **kein Cursor-CallMcpTool**),
`fails/0006-hai-mcp-not-connected-mbp-verify-close.md`,
`fails/0010-hai-mcp-callmcp-not-connected-after-cli-reload.json`,
`fails/0011-hai-mcp-not-connected-worker-pool-close.md` (resolved via Backfill),
`fails/0015-hai-mcp-call-not-connected.json`,
`fails/0016-hai-mcp-not-connected-verified-store-close.md` (resolved via Backfill).

**Genau ein nächster Schritt:** Einen Qualifikations-Slice anlegen — `hai-mcp qualify →
stage-2 sandbox` — der die sechs Pflicht-Pfade Intake, Status, Mission Contract, Drift, Proof,
Stop gegen einen frischen Host-Prozess laufen lässt und pro Pfad eine Evidenz-Datei ablegt.
Stage `Discover` ist belegt (hai-mcp existiert, mit eigenem AGENTS.md und Tests).

---

- **`beads` und `mcp_agent_mail`** liegen als `candidate_unverified` in der Registry, Smoke belegt,
  nicht angedockt. Siehe `STACK.md`.

## 2026-08-19 — AutoDesign-Paper geparkt als eigenständige Linie `meta-harness`

**Entscheidung:** Das AutoDesign-Paper (Meta-Harness-Optimierung, arxiv 2608.13560) wird nicht
sofort als Slice gebaut, sondern als neue eigenständige Linie `meta-harness` geparkt —
ausdrücklich **kein** Anbau an `plan-council`. Plan-Council scored Pläne VOR dem Build;
Meta-Harness mutiert den Harness ZWISCHEN Missionen — verschiedene Optimierungsobjekte,
verschiedene Gates.

**Warum parken:** Aktive Lane „HAI Build" behält Vorrang; das Konzept verliert nichts durch
Warten, die Platzierungsentscheidung und das Aktivierungs-Kit wären aber ohne Parkvermerk
weg gewesen (nur Chat-Text).

**Fundstellen:** Parkvermerk `parking/meta-harness-autodesign.md` (Kernidee, Accept-Gate
`J_train(H') > J_train(H) ∧ J_dev(H') ≥ J_dev(H)`, Single-Component-Regel, 5-Flächen-Mapping
auf HAI-Pfade, Gap: kein gebundener Optimization Record); Intake `I-20260819T132858-541ad279`;
Mission `M-20260819T133023-80c5ff1d`.

**Genau ein nächster Schritt:** Owner-Go → Linie aktivieren und Slice = Aktivierungs-Kit
dispatchen (`docs/META_HARNESS.md`, `contracts/optimization-record.schema.json`,
`registry/components/autodesign.json`, `workbench/meta-harness/UPSTREAM_SEARCH.md` —
alles Whitelist, kein Feature-Code).

## 2026-08-19 — Lanes brauchen einen Rückweg (`hai_deactivate_lane`)

**Entscheidung:** `set_focus` bekommt die Gegenfunktion `deactivate_lane` (neues Tool
`hai_deactivate_lane`). Der Guard läuft über das einzige strukturierte Lane-Feld
(`focus_id`), nicht über Mission-Referenzen — Lane-Einträge haben kein `mission_id`-Feld
(Validator-Finding, Attempt 1/2). Fail-closed: Die Fokus-Lane ist ohne `owner_ack=true`
nicht droppbar (`blocked_focus_lane`); jeder Drop schreibt append-only nach
`~/.hai/audit/lane-drops.jsonl`.

**Warum:** Die Lane `hai-pflichtpfad` klebte seit dem 09.08. als Zombie in
`ACTIVE_CONTEXT` (Mission `M-20260809T142626-c9e28f53` war completed, es gab keinen
Rückweg) und blockierte den Implementierungsfluss — Slices wurden geparkt statt
gebaut (Inbox 07.08.: „No HAI-MCP lane-drop operation is exposed").

**Fundstellen:** `hai-mcp/src/hai_mcp/state.py` (`deactivate_lane`), `server.py`
(`hai_deactivate_lane`), Test `tests/test_control_plane.py::test_deactivate_lane_focus_guard_and_audit`
(16/16 grün); Audit-Record `~/.hai/audit/lane-drops.jsonl`; Plan-Gate
`hai-mcp/Projek-Managment/PLAN_VALIDATION_REPORT_lane_drop.md` (ACCEPT, Attempt 2/2);
Mission `M-20260819T132409-939cb2aa`. LOC-Nachweis: 60 neue Zeilen ohne Tests (Budget ≤80,
Owner-Ausnahme Upstream-First). Hinweis: Der Anwendungs-Drop lief über denselben getesteten
Codepfad per CLI, weil der laufende MCP-Server das neue Tool erst nach Reload lädt
(Reload-Risiko = Fail 0010); Tool-Aufruf ab nächstem Server-Start normal.

**Genau ein nächster Schritt:** Owner entscheidet, welcher gestaute Slice die freie Lane
bekommt (Kandidaten aus der Inventur: `plan-council` läuft bereits als Fremd-Session,
`stt-local`, `consolidation-funnel`).

## 2026-08-20 — Profile Composer: Council-Ausnahme für den Build-Slice

**Owner-Entscheidung:** Samuel erlaubt die Implementierung von `workbench/profile-composer-v1/` ohne Plan-Council-Score. Der fehlgeschlagene lokale Versuch bleibt als `workbench/profile-composer-v1/COUNCIL_ATTEMPT_1.json` sichtbar; die Ausnahme gilt nur für diesen Slice und ist kein Präzedenzfall.

**Weiterhin hart:** Plan-Acceptance, Upstream-First, Continuous Authorize, Single-Writer, TDD/Conformance, fremder read-only Review, Promotion und Aktivierungs-/Commit-/Push-/Deploy-Gates bleiben fail-closed. Persönlicher Marketplace, Worktree-Aktivierung und Active-Receipt sind nicht freigegeben.

**Aktueller Hold:** Hermes erreicht OpenCode/MiniMax aus der Parent-Sandbox nicht; Cursor scheitert am Keychain-Zugriff; Spark fehlt. Es gibt daher noch keinen zulässigen Worker-/Validator-Dispatch und keinen Build-Claim.

**Owner-Entscheidung:** Die native Codex-Ausnahme für einen schreibenden Worker plus separaten strikt read-only Codex-Prüfer ist in derselben Session erteilt.

**Genau ein nächster Schritt:** Der separat dispatchte read-only Codex-Validator liefert das Plan-Acceptance-Verdict; nur bei `ACCEPT` startet der Build-Worker.

## 2026-08-21 — Self-Deadlock durch mutable Statusdatei im immutable Build-Pin

**Beobachtung:** Die v3-Conformance und der Live-Tryout sind `PASS`; der Post-Exec-Review ist `FAIL`.
Der Fallback `forced-fail -> codex-native` ist damit ausschließlich als Workbench-Tryout
bestätigt und weder aktiv noch promoviert.

**Ursache:** `FLEET_STATUS.md` war als unveränderliches Build-Artefakt auf SHA
`a97008204050d9fbd32827dd3b9dbabeec4202211df709e2226328e29e9b20e9` gepinnt, musste
aber nach dem Tryout auf SHA `43201cc884a9f6cf21609dcd157f982f137cc29d8f13beb4399aba5d1e651ce7`
aktualisiert werden. Die Pflicht zur Statusaktualisierung und der unveränderliche Pin
widersprachen einander und erzeugten einen Self-Deadlock.

**Entscheidung und Lernregel:** Mutable Status-, Resume- und Report-Dateien gehören nicht
in die unveränderliche Build-Artefaktmenge, sondern in eine getrennte, stufengebundene
Evidence-Klasse. Immutable Pins bleiben für Schemas, Semantik, Adapter, Recorder,
Fixtures und Templates. Ein Review-`FAIL` darf nicht umgedeutet, ein Pin nicht
nachträglich überschrieben, das fail-closed Gate nicht entfernt und mutable
Statusdateien nicht erneut immutable gepinnt werden.

**Fundstellen:** `workbench/variants/worker-pool-v3-native-consumption/POST_EXEC_REVIEW.md`;
`workbench/variants/worker-pool-v3-native-consumption/TRYOUT_REPORT.md`;
`workbench/variants/worker-pool-v3-native-consumption/evidence/conformance-attempt-6.log`;
terminaler Run `workbench/variants/worker-pool-v3-native-consumption/runs/R-20260820-worker-pool-v3-native-consumption-tryout.json`;
`workbench/variants/worker-pool-v3-native-consumption/evidence/post-exec-review-consumption.json`.

**Genau ein nächster Schritt:** Eine versionierte Korrekturvariante planen und validieren,
die immutable Build-Artefakte von mutablem Status trennt.

## 2026-08-21 — Kanonische HAI-Pfade in AGENTS.md verankert

**Beobachtung:** Ein Agent musste `rg --files -g AGENTS.md -g '*LOGBUCH*' -g '*logbuch*' -g '*LOG*' -g '*JOURNAL*' -g '*journal*'` ausführen, um `LOGBUCH.md` zu finden, bevor er einen Eintrag schreiben konnte. Das zentrale Self-Hosting-Artefakt („Speise strukturierte Inputs … zurück in HAI") war in keiner `AGENTS.md` namentlich verankert; der Bezug zwischen Vertrag und Pfad war implizit.

**Ursache:** Die Root- und Projekt-`AGENTS.md` haben das Hai-mcp-Pflichtprotokoll, Gates und Lanes benannt, aber die Adressen, an denen genau diese Pflicht mündet (`LOGBUCH.md`, `fails/`, `contracts/`, `docs/`, `parking/`, `workbench/`, `stable/`, Tagesstand, Lanes, Inventur), dem Agenten nicht als bekannt vorausgesetzt. Discovered-by-search ersetzte known-by-contract.

**Entscheidung und Lernregel:** Kanonische HAI-Pfade sind Teil des Vertrags, nicht Ergebnis von `rg`/`find`. Wer einen Logbuch-Eintrag, Fail-Record, Run-Contract, Plan-Report oder Upstream-Search erst suchen muss, bricht ab und meldet Vertragslücke (`BLOCKED`). Pfade werden in beiden `AGENTS.md` als fester Block geführt; neue zentrale Artefakte werden dort ergänzt, nicht implizit eingeführt. Verträge ohne benannten Anker sind unvollständig.

**Fundstellen:** `Projects/AGENTS.md` (Block „Kanonische HAI-Pfade"), `Projects/03_HAI/AGENTS.md` (Self-Hosting-Anker + Block „Kanonische Pfade in diesem Projekt"). Bestehende Einträge in `LOGBUCH.md` unverändert.

**Genau ein nächster Schritt:** Einen schmalen Harness-Bootstrap-Snippet (z. B. `~/.pi/agent/skills/hai-paths/SKILL.md`) entwerfen, der dieselben zehn Pfade für pi/aider/hermes ohne AGENTS.md-Lese-Zwang verfügbar macht; bis dahin gilt: Pfade aus der Root-`AGENTS.md` zitieren.

## 2026-08-21 — SML-AI-Timeline Plan-Council blockiert

**Plan-SHA:** `d31b62934ba0282e422ea93f9bfa429e13bc4306794a7730fa2307f531c322aa`.

**Verdict:** `NO_JUDGMENT` / `BLOCKED`. Alle Provider wurden durch die
Prozess-/Browser-Sandbox blockiert; es liegt daher kein belastbares Plan-Scoring vor.

**Evidenz:** `/Users/samuelfleig/Projects/03_HAI/SML-AI-Timeline/evidence/grade-PLAN-no_judgment-20260821T140527Z.json`.

**Entscheidung:** Kein Build, kein Fake-Score und keine Aufgabe an Samuel.

**Genau ein Resume-Schritt:** Plan-Council erneut ausführen, sobald mindestens ein
Provider innerhalb der zulässigen Sandbox funktionsfähig erreichbar ist.

## 2026-08-21 — Profile Composer belastet den Owner mit internem Cache-Aufräumen

**Beobachtung:** Für einen Offline-Test erzeugte der Worker vier Symlinks unter `workbench/profile-composer-v1/.venv/.uv-cache/`. Der Root-Validator folgte ihnen in `~/.cache/uv/` und prüfte fremde Paketdateien als HAI-Artefakte. Der Test stoppte; anschließend verlangte das Löschgate von Samuel eine Einzelbestätigung zum Entfernen der vier reinen Zeiger.

**Warum das Samuels Aufmerksamkeit kostet:** Der Grant war asymmetrisch: Er erlaubte das Erzeugen temporärer Links, aber nicht deren sichere Rücknahme. Das Löschgate unterscheidet zudem noch nicht zwischen task-erzeugten, rekonstruierbaren Symlinks im Workbench-Root und materiellen Nutzdaten. HAI eskalierte damit interne Hygiene statt einer echten Owner-Entscheidung. Das ist eine Orchestrierungs-/UX-Lücke, nicht Samuels Aufgabe.

**Lernregel:** Ein Worker darf keinen temporären Zustand erzeugen, dessen erwartbares Aufräumen nicht im selben Step-Grant enthalten ist. Bis eine eng begrenzte Regel für task-erzeugte, rekonstruierbare Workbench-Artefakte Owner-gegattet ist, wird ein solcher Probeweg vor dem Write abgelehnt oder vollständig in `/tmp` gehalten. Löschschutz für Nutzdaten bleibt unverändert.

**Fundstellen:** `workbench/profile-composer-v1/RUN_CONTRACT_02.json`, `AUTHORIZATION_02A.json`, `evidence/contract-tdd/OFFLINE_DEPENDENCY_PREFLIGHT.md`; betroffen sind nur `.venv/.uv-cache/{simple-v24,simple-v22,wheels-v6,archive-v0}`. Es wurde nichts gelöscht.

**Genau ein nächster Schritt:** Der Slice bleibt `PARKED`; kein weiterer Owner-Ping, bis ein bereits autorisierter, nicht-destruktiver Resume-Weg vorliegt.

## 2026-08-21 — Migration Logbuch → `bd`-Tickets (Owner: a)

**Owner-Entscheidung (verbatim „a!"):** Variante (a) aus `workbench/logbuch-json-tickets/UPSTREAM_SEARCH.md`. `LOGBUCH.md` wird durch `gastownhall/beads` (`bd`)-Tickets als kanonisches Substrat ersetzt; heutige 369 Zeilen werden unverändert in `04_ARCHIVE_READONLY/LOGBUCH-2026-08-21.md` archiviert (Hartes Gate „Nichts löschen").

**Stand der Recherche:** Fünf Upstream-Kandidaten geprüft, einer (beads, 26 490 ⭐, MIT, Go) klar vorne, vier rejected. In-house-Fallback (`logbuch/NNNN-titel.json` analog zu `fails/`) als Plan B dokumentiert.

**Offene Pflichten vor Promote:**
1. `MIGRATION_PLAN.md` und `SMOKE_SPEC.md` im selben Workbench-Verzeichnis.
2. Plan-Acceptance-Gate: `PLAN_VALIDATION_REPORT.md` mit Verdict `ACCEPT` durch unabhängigen Validator.
3. Continuous-Authorize-Gate: separate Owner-Acks für `bd install` (Curl-Pipe-Bash = externe Quelle) und `bd init` im Schatten-Projekt.
4. Smoke-Probe in `workbench/logbuch-json-tickets/smoke/` mit drei Beispiel-Tickets (Entscheidung, Fail, Lernregel) im aktuellen LOGBUCH-Stil.
5. AGENTS.md-„Kanonische HAI-Pfade"-Blöcke nach erfolgreichem Smoke nachziehen.

**Genau ein nächster Schritt:** `MIGRATION_PLAN.md` und `SMOKE_SPEC.md` schreiben; bis dahin kein `bd install`, kein Schreibzugriff außerhalb `workbench/logbuch-json-tickets/`.

## 2026-08-21 — Health-Council-Score durch Judge-Pool-Wechsel nicht gate-fähig

**Beobachtung:** Derselbe Plan-SHA `c2dc08df…` erhielt mit dem Default-Pool `0.766` und nach Austausch von `qwen3:8b` gegen `mistral:latest` `0.844`. Beide Artefakte melden `SCORE_OK`; nur die Council-Komposition änderte sich.

**Entscheidung:** Der Custom-Pool-Run ist keine zusätzliche Gate-Evidenz und autorisiert weder `ACCEPT` noch Build. Ein nachträglicher Judge-Tausch braucht einen neuen, vorab gebundenen und unabhängig validierten Attempt; Ergebnis-Shopping bleibt fail-closed.

**Owner-Richtung:** HAI arbeitet API-first für Qualität und Geschwindigkeit; lokale Modelle sind ausschließlich Fallback.

**Fundstelle:** `fails/0018-plan-council-judge-pool-shopping.json`; `workbench/plan-council/out/grade-PLAN_health-councils-score_ok-20260821T142824Z.json`; `workbench/plan-council/out/grade-PLAN_health-councils-score_ok-20260821T143132Z.json`.

**Genau ein nächster Schritt:** Eine versionierte API-first-Korrektur planen und validieren; bis dahin kein Health-Councils-Build.

## 2026-08-21 — Credential-Quelle prüfen, Secrets nicht öffnen

**Beobachtung:** Der offizielle MiniMax-Endpunkt `https://api.minimax.io/v1` weist den Default-`.env`-Credential mit HTTP 401 ab; Pi besitzt einen getrennten, bereits erfolgreich belegten Credential-Pfad. Präfix und Länge klassifizieren keinen Key zuverlässig.

**Entscheidung:** Agenten dürfen `.env` und Pi-Auth nicht anzeigen, vergleichen oder Schlüssel kopieren. API-first wird über den bereits credentialed Pi-Provider geplant; Credential-Auflösung bleibt in Pi, Ollama bleibt letzter Fallback.

**Fundstelle:** `fails/0019-minimax-credential-source-secret-boundary.json`; `workbench/plan-council/SMOKE_PLAN_COUNCIL.md`; offizielle MiniMax-Doku `https://platform.minimax.io/docs/api-reference/text-openai-api`.

**Genau ein nächster Schritt:** Pi-gestützten API-first-Korrekturplan validieren; vorher keine weitere Key-Inspektion und kein Provider-Call.

## 2026-08-21 — HAI-TIKTOK: lokaler Test grün, Anzeige gehalten

**Beobachtung:** Die lokale Suite lief mit Node `v22.23.1` vollständig grün (15/15).
Der anschließende Leseversuch auf `http://127.0.0.1:3000` wurde durch eine gespeicherte
Browser-Sperre für Localhost blockiert; es gab keinen Upload, NotebookLM-Aufruf oder Feed-Post.

**Evidenz:** `../03_HAI_PROJECTS/HAI-TIKTOK/package.json` (`npm test`),
`../03_HAI_PROJECTS/HAI-TIKTOK/tests/`; Browser-Blocker aus diesem Run.

**Entscheidung:** Der Test-Pass ist keine E2E-Qualifikation; die sichtbare Anzeige bleibt
ehrlich `BLOCKED`, bis der Owner Localhost im Browser freigibt.

**Genau ein nächster Schritt:** Owner erlaubt Browserzugriff auf `127.0.0.1:3000`; danach
einen vorhandenen HAI-TIKTOK-Clip ausschließlich lesend öffnen.

## 2026-08-24 — Externer Canonical-Anchor-Drift bekommt genau eine Owner-Recovery

**Beobachtung:** Nach dem bereits akzeptierten Parent-Plan wurde Root-`AGENTS.md:15` parallel
um den globalen Plan-Validierungsanker `docs/PLAN_VALIDATION_REPORT.md` erweitert. Der strikt
read-only C-G1-Validator `/root/council_c_g1_validator_v2` prüfte Attempt `2/2` des
unveränderten Child-Plans vollständig: Parent-Allowlist `47/47`, exakt drei Executables mit
`45 + 15 + 20 = 80` NLOC, fünf feste Council-Slots, getrennte Invoke-/Recorder-Grants,
Quorum-/Threshold-/Family-Cap-Regeln und alle drei Family-N-1-Fälle waren grün. Terminal blieb
das Verdict dennoch `UNCLEAR` und Build Release `no`, ausschließlich weil der neue globale
Anker fehlte und weder Parent- noch Child-Allowlist ihn enthielten.

**Ursache:** Der neue Root-Anker entstand außerhalb und nach den hashgebundenen Parent-/Child-
Plänen. Der rote Befund ist daher Governance-Scope-Drift, kein Defekt des geprüften
Planinhalts. Das zweimal reproduzierte Signal bleibt sichtbar in
[`fails/0021-plan-validation-anchor-drift.json`](fails/0021-plan-validation-anchor-drift.json).

**Owner-Entscheidung:** Samuels ausdrückliche Delegation der technischen Prozessarchitektur
erlaubt unter HAI Recontract v5, Audit `A-20260824T115555-551c4300`, Contracthash
`sha256:99bf510708d892c402cca25968dcdc4d863597a63ce3dead6abae8ebe02d8db4`, genau eine
read-only Owner-Recovery-Validation für den unveränderten Child-Planhash. Sie darf den
extern driftenden Reportpfad belegen, aber weder Planinhalt ändern noch einen Score erfinden,
ein Ergebnis vorwegnehmen oder Build öffnen. Die zwei normalen C-G1-Attempts und ihre
Ausnahmen sind verbraucht; dies ist kein stiller dritter normaler Attempt.

**Was nicht passieren darf:** Child-/Parent-Plan oder historische Reports umschreiben, den
globalen und den Child-Report still gleichsetzen, `ACCEPT` aus den grünen Teilprüfungen ableiten
oder C-B1 vor einem exakten autonomen Recovery-Verdict öffnen.

**Genau ein nächster Schritt:** Ausschließlich `/root/council_anchor_recovery_validator`
prüft read-only den unveränderten Planinhalt plus den behobenen v5-Pfadscope und liefert die
autonomen Reportbytes für `docs/PLAN_VALIDATION_REPORT.md`; bis dahin bleibt C-B1 geschlossen.

## 2026-08-24 — Recovery-Preflight stoppt vor Verdict bei falscher Leasebindung

**Beobachtung:** Recovery-Preflight 1 stoppte vor jeder fachlichen Prüfung mit
`BLOCKED_PREVALIDATION_LEASE_BINDING`. `RESUME.md` band die Read-Lease
`S-20260824T124135-db1a7034`, während der tatsächliche Dispatch für denselben allein
autorisierten Agenten `/root/council_anchor_recovery_validator` unter
`S-20260824T124350-fab7c0eb` lief. Der Preflight erzeugte kein Verdict, keine Writes und
keine Calls; Build Release blieb `no`.

**Entscheidung und Grenze:** Die alte Leasebindung ist superseded und unbenutzbar. Ausschließlich
die aktuelle Read-Lease `S-20260824T124350-fab7c0eb` mit Authorization-Audit
`A-20260824T124350-f91de2d5` ist unter HAI v5 und Contracthash
`sha256:99bf510708d892c402cca25968dcdc4d863597a63ce3dead6abae8ebe02d8db4` für den
unveränderten Child-Planhash gültig. Weil der Stopp vor fachlicher Validation lag, hat er die
einmalige Owner-Recovery weder begonnen noch verbraucht. Es entsteht keine neue Ausnahme und
kein zusätzlicher Plan-Acceptance-Attempt.

**Lernregel:** Agent-ID, Contract, Planhash und konkrete Session-Lease müssen vor dem ersten
fachlichen Bytevergleich gemeinsam gebunden sein. Ein Mismatch stoppt vor Verdict und darf
nicht als verbrauchter fachlicher Lauf oder als negative Planbewertung gezählt werden.

**Genau ein nächster Schritt:** Derselbe Agent wird erstmals gültig und strikt read-only unter
`S-20260824T124350-fab7c0eb` dispatcht; bis zum autonomen Report bleiben C-B1 und alle Calls
geschlossen.

## 2026-08-25 — Close restauriert die älteste Zombie-Mission als Fokus

**Beobachtung:** MCP war connected (`hai_health`/`hai_status` `ok: true`). Trotzdem sprang
`active_mission.json` nach Close der Lernpfad-Mission `M-20260825T195245-6b28439e`
(`closed_at=2026-08-25T17:55:31Z`) auf `M-20260809T142230-37b72a32` (created 2026-08-09,
`status=active`, Session expired, Ziel „JETZT.md löschen“). Parallel lagen 12 weitere
`mission.json` auf `status=active`. `max_active_lanes: 0` und fehlendes
`Projects/Projek-Managment/` sind **kein** Transportfehler.

**Ursache:** `_release_or_repoint_active_pointer` (`hai-mcp/src/hai_mcp/mission.py`) setzt den
Fokuszeiger nach Close auf `remaining[0]` = älteste noch-aktive Mission. Das ist der Fail-0008-
Gegensatz (nicht wischen), angewendet auf nie geschlossene Missionen. Fail 0017 (orphan nach
abandon) ist `mitigated`, Regression nur `desired`. `MAX_ACTIVE_LANES = 0` bedeutet unlimited
(LOGBUCH 2026-08-09 §3). `hai_get_next_step` hängt `Projek-Managment` an den Client-`project_path`.

**Beleg:** `03_HAI/parking/HAI_FAILURE_DIAGNOSIS_2026-08-25.md`. Loop: 13 aktive Missionen,
älteste = `M-20260809T142230-37b72a32`.

**Was nicht passieren darf:** `~/.hai/missions` per Hand umschreiben. Den Restore auf die
älteste Zombie-Mission als „Orphan wie 0017“ wegpatchen, ohne die 12 offenen Missionen zu
schließen. `max_active_lanes: 0` als Kapazitätsbug „reparieren“ und damit Themen wieder
rationieren.

**Genau ein nächster Schritt:** Cleanup-Mission: die 12 stale `status=active`-Missionen
schließen oder abandonen, älteste zuerst, über `hai_close_mission` — kein Handedit.

## 2026-08-25 — Zombie-Missionen per hai_close_mission abandoned

**Beobachtung:** 11 `status=active`-Missionen ohne live Session (9.8.–21.8.) plus die
Aug-09-Fokus-Zombie `M-20260809T142230-37b72a32` hielten den Restore-Pfad am Leben.
`mbp-daily-driver` war in `ACTIVE_CONTEXT.json` ACTIVE, in `ACTIVE_PROJECTS.md` PARKED.

**Entscheidung:** Owner-Cleanup über `hai_close_mission(abandoned, owner_ack=true)`, kein
Handedit an `~/.hai`. Lane-Drop `hai_deactivate_lane(mbp-daily-driver)`. hai-mcp-Pointer-
Algorithmus unverändert (`remaining[0]` = älteste Aktive) — der Defekt war der Bestand,
nicht die Restore-Regel aus Fail 0008.

Abandoned (Audit): `M-20260809T142230-37b72a32`, `M-20260809T144615-a68742fa`,
`M-20260809T150254-1c07a46c`, `M-20260810T064839-48bcf547`, `M-20260819T132409-939cb2aa`,
`M-20260819T162629-34a73e72`, `M-20260820T092932-283d67f9`, `M-20260820T163039-187f9485`,
`M-20260820T230243-e0586e55` (v8, hai-build stuck), `M-20260821T162759-b6c2a02b`,
`M-20260821T164704-bf5d169b`. Lane-Drop Audit in `~/.hai/audit/lane-drops.jsonl`.
Checkpoint `20260825T200601`. Diagnose bleibt `03_HAI/parking/HAI_FAILURE_DIAGNOSIS_2026-08-25.md`.

**Was nicht passieren darf:** `~/.hai/missions/*/mission.json` per Hand auf abandoned setzen.
Den Restore auf `remaining[0]` entfernen (Fail 0008 kehrt zurück). Themen über
`max_active_lanes` wieder rationieren.

**Genau ein nächster Schritt:** Diagnose-Mission `M-20260825T195627-42c99daa` per `hai_proof`
schließen; danach muss `active_mission.json` `status=none` sein.

## 2026-08-25 — Plan-Entwurf: Idle Learning Backlog & Material Worker

**Beobachtung:** Owner will explizit die eigene Weiterentwicklung als HAI-Priorität behandelt
wissen — Material-Worker sollen im Leerlauf Lernstoff für den nächsten Backlog-Item
vorbereiten, der Owner konsumiert ihn im `hai_learning_*`-Block. Das deckt sich mit
§1 dieses Logbuchs („Lernen ist Substanz, nicht Zoll"); der Plan setzt diese Lesart als
konkretes System um, statt sie zu unterlaufen.

**Entscheidung:** Plan-Artefakt liegt unter
[`03_HAI/Projek-Managment/PLAN_idle_learning_backlog.md`](../03_HAI/Projek-Managment/PLAN_idle_learning_backlog.md)
und ist im Status **DRAFT** — kein Build, keine Lease, keine `hai_open_mission`. Der Plan ist
Whitelist (Docs + Glue ≤ 80 LOC je Script), kein `UPSTREAM_SEARCH.md` in v1 nötig; Slice B
(Material-Worker Runtime) wird voraussichtlich eines brauchen.

**Host-Hinweis:** Der Plan wurde in einer Pi-Session (`MiniMax-M3`, Host ohne MCP) verfasst.
Main Session muss beim Backfill die `owner_ack` einholen, eine Mission öffnen und den
Plan-Validator (anderer Harness als Pi) für den `ACCEPT`-Verdict dispatchen. Bis dahin zählt
das Artefakt als Vorschlag, nicht als genehmigter Build-Input.

**Belegpfad:** `03_HAI/Projek-Managment/PLAN_idle_learning_backlog.md`; Worker-Spec
`03_HAI/docs/LEARNING_MATERIAL_WORKER.md` und Backlog-Konvention `03_HAI/docs/LEARNING_BACKLOG.md`
sind im Plan verlinkt, aber noch nicht geschrieben (Slice v1 muss diese Docs anlegen).

**Was nicht passieren darf:** Diesen Plan ohne vorheriges `PLAN_VALIDATION_REPORT_…md: ACCEPT`
als Build-Freigabe lesen. Den Material-Worker in v1 über die `hai-mcp`-Runtime bauen —
Whitelist gilt nur für Docs und ≤ 80 LOC Glue. Den Backlog parallel zu
`02_STUDIUM/lernpfad/PROGRESS.md` als zweite Wahrheit führen, ohne Sync-Konvention
(Slice D). Block-Complete durch einen Worker auslösen — Block-Complete bleibt Owner-Akt
(Logbuch §1).

**Genau ein nächster Schritt:** Owner liest den Plan in der Main Session
(Cursor/Claude), holt `owner_ack` und dispatcht den Plan-Validator-Agent mit dem
Dispatch-Brief aus [`docs/PLAN_ACCEPTANCE_GATE.md`](docs/PLAN_ACCEPTANCE_GATE.md); bei
`ACCEPT` startet Slice v1 (Docs + 4 Glue-Scripts mit `--selftest`).

## 2026-08-25 — Graphify als Stack-Kandidat installiert, nicht als Graph-Lauf

**Ursache:** Owner-Auftrag, https://github.com/Graphify-Labs/graphify zu installieren.
Offizielle Route ist `uv tool install graphifyy` plus Plattform-Register, kein Eigenbau
und kein Klon nach `05_INBOX`.

**Auswirkung:** CLI `graphify` 0.9.50 liegt unter `~/.local/bin/graphify`. Cursor hat eine
user-globale Rule `~/.cursor/rules/graphify.mdc` (`alwaysApply: true`). Registry
`registry/components/graphify.json` und `STACK.md` führen den Baustein als
`candidate_unverified`. Es gibt keinen `graphify-out/`-Graph auf dem Workspace; ohne
`graph.json` darf die Rule auf Read/Grep zurückfallen.

**Belegpfad:** `03_HAI/workbench/upstream/graphify/SMOKE.md`,
`03_HAI/registry/components/graphify.json`, Mission `M-20260825T214629-da102795`.

**Was nicht passieren darf:** `graphify` als Ersatz für `hai-mcp` lesen. Einen Graph-Lauf
über `/Users/samuelfleig/Projects` still starten. Die Cursor-Rule als Qualify-Beweis
nehmen. `graphify-mcp` ohne eigenen Slice in `mcp.json` hängen.

**Genau ein nächster Schritt:** Owner entscheidet, ob und auf welchem Write-Root der erste
`/graphify .`-Lauf (AST-only, lokal) stattfinden soll.

## 2026-08-25 — CodeGraph als zweiter Graph-Kandidat installiert, nicht indexiert

**Ursache:** Owner-Auftrag, https://github.com/colbymchenry/codegraph zu installieren, direkt
nach Graphify. Offizielle Route ist `npm i -g @colbymchenry/codegraph` plus
`codegraph install --target=cursor`, kein `curl | sh`, kein Eigenbau.

**Auswirkung:** CLI `codegraph` 1.5.0 liegt unter `~/.local/bin/codegraph`. Cursor-MCP
`codegraph` steht in `~/.cursor/mcp.json` neben `hai-mcp` (bestehende Server erhalten).
Registry und `STACK.md` führen ihn als `candidate_unverified` neben `graphify`. Kein
`.codegraph/` auf dem Workspace. Telemetry ist default an.

**Belegpfad:** `03_HAI/workbench/upstream/codegraph/SMOKE.md`,
`03_HAI/registry/components/codegraph.json`, Mission `M-20260825T215432-3f89df77`.

**Was nicht passieren darf:** CodeGraph als Ersatz für `hai-mcp` lesen. `codegraph init`
über `/Users/samuelfleig/Projects` still starten. Graphify deinstallieren oder die
Graphify-Rule überschreiben. `--target=auto` auf alle Agents ausweiten, ohne neuen Auftrag.

**Genau ein nächster Schritt:** Owner entscheidet, ob und auf welchem Write-Root der erste
`codegraph init` laufen soll — und ob Telemetry aus (`codegraph telemetry off`).

## 2026-08-25 — CodeGraph-Index auf 03_HAI, ohne hai-mcp

**Ursache:** Owner: „auf dem HAI“. `codegraph init` auf
`/Users/samuelfleig/Projects/03_HAI`.

**Auswirkung:** `.codegraph/` existiert (215 nodes, 13 files, 0.93 MB). Der Graph
enthält Workbench-Skripte und `.github/workflows/validate.yml`. `hai-mcp`,
`HAI_UIV1` und `MBP_HAI_MIGRATION` bleiben draußen, weil sie im Root-`.gitignore`
stehen. `/.codegraph/` ist gitignored.

**Belegpfad:** `03_HAI/workbench/upstream/codegraph/INIT_HAI.md`, Mission
`M-20260825T220022-14b35649`.

**Was nicht passieren darf:** Diesen 13-Datei-Index als Graph der Control Plane
lesen. `codegraph init` auf dem Projects-Root nachziehen.

**Genau ein nächster Schritt:** `codegraph init` auf `03_HAI/hai-mcp` (eigenes
Git-Repo, eigener Index).

## 2026-08-25 — CodeGraph-Index auf hai-mcp nachgezogen

**Ursache:** Owner „finish it“ nach PARKED-Mission `M-20260825T220236-1dbaa07b`
(writer_lock). Writer-Lock war frei.

**Auswirkung:** `03_HAI/hai-mcp/.codegraph/` existiert (31 Python-Files, 646 nodes,
2 016 edges, 2.29 MB). `.codegraph/` ist in `hai-mcp/.gitignore`. Der 03_HAI-Root-Index
bleibt daneben (13 Files, ohne Control-Plane-Source).

**Belegpfad:** `03_HAI/workbench/upstream/codegraph/INIT_HAI_MCP.md`, Mission
`M-20260825T220626-716e0c58`.

**Was nicht passieren darf:** Den 13-Datei-Root-Index mit dem hai-mcp-Index
verwechseln. MCP-Queries ohne `projectPath` auf hai-mcp als Workspace-Root annehmen
(`${workspaceFolder}` ist Projects).

**Genau ein nächster Schritt:** Cursor neu starten, damit der CodeGraph-MCP den
hai-mcp-Index per `projectPath` nutzen kann.

## 2026-08-25 — Zwei getrennte Writer, hart bei 2

**Beobachtung:** `single_writer_non_consumptive` (19.08.) hat BRUEGGEN und CodeGraph
hintereinander serialisiert, obwohl die Write-Scopes disjunkt waren. `worker_capacity: 4`
wurde nicht geprüft. Zwei Agenten warteten auf „einen Worker“.

**Entscheidung:** Canonical mode `two_writer_disjoint`. Höchstens zwei aktive Writer.
Nur bei disjunkten `write_scope`-Präfixen. Überlappung → `write_scope_conflict` mit
`held_path`. Dritter Writer → `writer_slots_full`. Learning hebt die 2 nicht an.
Credits bleiben non-consumptive. LOGBUCH 2026-08-09 §4 (Kollision ≠ Global-Lock) gilt
wieder; der Global-Lock vom 19.08. ist für Concurrency **superseded**, nicht für
„kein Credit-Spend“.

**Fundstelle:** `hai-mcp/src/hai_mcp/config.py` `MAX_CONCURRENT_WRITERS = 2`,
`mission.py` `_first_overlapping_prefix` + Admission in `authorize_session`.
Tests: `tests/test_worker_capacity.py`. Vertrag: `docs/TOOL_CONTRACT.md`.

**Was nicht passieren darf:** Den Cap still auf 4 oder 6 aus `learning_budget` setzen.
Überlappende Pfade (Parent/Kind) als disjunkt behandeln. Den 19.08.-Lock zurückholen,
ohne diesen Absatz zu widerlegen. MCP ohne Reload weiter auf altem Prozess laufen lassen
und Parallelität erwarten.

**Genau ein nächster Schritt:** Cursor: hai-mcp MCP-Server neu laden, dann `hai_status`
mit `writer_lock.mode == two_writer_disjoint` prüfen.

## 2026-08-25 — HAI-TikTok-Pipeline PARKED (Owner-Close-Out, nicht completed)

**Ursache:** Executer-Mission `M-20260825T222841-72aab6ac` sollte die Kette Session-Start → Notebook-LLM → Kurzvideo → Playback verdrahten. Owner hat neue Pipeline-Arbeit gestoppt, bevor Plan, Plan-ACCEPT und Glue liefen.

**Auswirkung:** Mission nicht `completed`. Fachlich **PARKED**. Kriterien `session-trigger`, `notebook-llm`, `video-gen`, `playback` ohne Datei-Nachweis. Diagnose nur als Close-Out-Ist-Stand.

**Belegpfad:** `03_HAI/workbench/tiktok-pipeline/EVIDENZ.md`; Checkpoint `20260825T223128`; Registry `registry/components/hai-tiktok.json`; Fail `fails/0003-hai-mcp-transport-closed-during-hai-tiktok.json`.

**Was nicht passieren darf:** Die Mission als `completed` schließen. Einen Executer ohne `PLAN_VALIDATION_REPORT.md` Verdict `ACCEPT` für genau diesen Schnitt starten. 0/10-Manifest oder den Test-Pass vom 21.08. als E2E-Qualifikation lesen.

**Genau ein nächster Schritt:** Owner dispatcht eine Planning-Lane für denselben E2E-Schnitt (bestehende Repos/MCPs verdrahten); erst nach Plan-Validator-`ACCEPT` ein Executer.

## 2026-08-26 — Planning-Lane TikTok-E2E abgeschlossen (ACCEPT), Parallel-Session-Close korrigiert

**Ursache:** Owner wählte Option A (Planning-Lane E2E-Schnitt). Mission
`M-20260826T224516-59a1177e` (UPSTREAM_SEARCH, PLAN, Validator-ACCEPT) wurde um 20:47:46Z
von einer Parallel-Session („Grill Human-Input-Gate“, Prozess 58922) als `abandoned`
geschlossen mit der Begründung „kein UPSTREAM_SEARCH.md, kein PLAN, kein ACCEPT“ — die
Artefakte lagen zu diesem Zeitpunkt bereits bzw. Minuten später vor. Race zwischen zwei
gleichzeitigen HAI-Sessions mit gegensätzlichen Annahmen über den DoD-Stand.

**Auswirkung:** Lease entzogen, Mission fälschlich abandoned. Korrektur: Re-Opening
`M-20260826T225043-6251022b` gemäß Parking `P-20260826T224731-671a4000`, alle drei
Kriterien mit Datei-Evidenz verifiziert und `completed` geschlossen
(Audit `A-20260826T225101-8ea0399c`).

**Owner-Entscheidungen (im Plan, Abschnitt 8):**
1. Browser-Localhost-Freigabe **nicht zwingend**. Default ist **Weg B**: Playback wird
   technisch nachgewiesen (ffprobe + lokaler Player + Byte-Range 206; Queue-/View-Mechanismus
   am 20.08. bewiesen); Kriterium produktseitig ehrlich `BLOCKED`, bis Owner Browser freigibt.
2. **Keine neuen Harnesses.** E2E-Lauf nutzt einen bestehenden Host (Präzedenz `codex`).

**Belegpfad:** `03_HAI/workbench/tiktok-pipeline/` (UPSTREAM_SEARCH.md, PLAN_E2E_PIPELINE.md,
PLAN_VALIDATION_REPORT.md — Verdict ACCEPT, Attempt 1/2, Build Release yes). Validator war
eigenständiger Subagent im selben Prime-Agent-Host (dokumentierte Abweichung vom
„anderer Harness“-Ideal im Gate-Vertrag).

**Was nicht passieren darf:** Den ACCEPT als E2E-Qualifikation lesen (Executer-Lauf fehlt).
Executer ohne Plan-Gate-ACCEPT starten (jetzt erfüllt, aber nur für diesen Plan-Pfad).
Parallel-Sessionen DoD-Stände ohne File-Freshness-Check als Close-Begründung akzeptieren.

**Genau ein nächster Schritt:** Owner gibt Executer-Lauf frei (Weg B); danach Dispatch nach
`PLAN_E2E_PIPELINE.md` Abschnitt 6 mit Write-Root `HAI-TIKTOK/data/` + `workbench/tiktok-pipeline/`.

## 2026-08-26 — Council-Score für PLAN_E2E_PIPELINE nachgereicht (SCORE_OK 0.812)

**Ursache:** Validator-ACCEPT vom selben Tag lief ohne Council-Score-Artefakt (dokumentierte
Lücke). Gate-Vertrag PLAN_COUNCIL.md ist fail-closed: ohne Score keine Build-Lane.

**Auswirkung:** Council-Lauf (live, lokales Ollama, 4 Judges) ergab **SCORE_OK** mit
overall **0.812** ≥ Threshold 0.75. Schwächste Metrik `ease` (Resume-nach-Failure nicht
explizit) — Feedback-Level. Verweis in PLAN_VALIDATION_REPORT.md nachgetragen; Gate-Kette
jetzt vollständig: Council SCORE_OK → Validator ACCEPT → Build Release yes.

**Belegpfad:** `03_HAI/workbench/plan-council/out/grade-PLAN_E2E_PIPELINE-score_ok-20260826T205530Z.json`;
Mission `M-20260826T225344-831a5971` (completed).

**Was nicht passieren darf:** Den Score als E2E-Nachweis lesen (nur Plan-Qualität). Executer
ohne die Betriebs-Vorbedingungen aus PLAN_E2E_PIPELINE.md Abschnitt 4 starten.

**Genau ein nächster Schritt:** Owner gibt Executer-Lauf frei (Weg B); Dispatch nach
PLAN_E2E_PIPELINE.md Abschnitt 6.

## 2026-08-28 — Executer-Lauf E2E abgebrochen: Node/Next.js-Forkbomb crasht Host

**Ursache:** Executer-Subagent (composer-2.5) der Mission `M-20260828T004419-e73c44f0`
startete `next dev` wiederholt blind neu (≥4 Starts ohne Prozess-Check), Prozessvermehrung
unter der Cursor-Coalition erschöpfte den Host (48 GB RAM) → Force-Reset 00:57
(`ResetCounter btn_rst`). Die Vorgänger-Mission `M-20260826T225703-8737de73` wurde zuvor
sauber abandoned (Lauf nie gestartet, Lease ungenutzt expired).

**Auswirkung:** Owner-Rechner-Crash; E2E-Lauf 0/4 Kriterien (`hai-cycle`-Submit
`fetch failed`, Worker 2× idle-Exit); Mission um 01:04 von paralleler Session abandoned;
Subagent „failed after relaunch recovery". Preflight (GO) und Plan-Gate (Council 0.812 +
Validator ACCEPT) bleiben gültig.

**Belegpfad:** `03_HAI/workbench/tiktok-pipeline/EVIDENZ_E2E_RUN.md`;
Fail `03_HAI/fails/0022-node-next-forkbomb-e2e-executer.json`;
`/Library/Logs/DiagnosticReports/node_2026-08-28-004645_samuel-mbp.diag` und
`ResetCounter-2026-08-28-005757.diag`; Checkpoints `20260828T004558`, `20260828T010318`,
`20260828T040823`.

**Was nicht passieren darf:** Subagenten lassen langlebige Server/Worker selbst spawnen
und bei Fehlern blind neu starten. Server-Neustart ohne vorherigen `lsof`-/PID-Check.
Die Nach-Reboot-RAM-Messung (01:00, ~26 GB frei) als Entlastung des Laufs lesen.

**Genau ein nächster Schritt:** E2E-Re-Dispatch nur in neuer Mission mit hartem
Prozess-Limit (genau 1 `next dev`, 1 Worker), von der Main Session entkoppelt gestartet
(eigene Terminals/nohup + PID-Datei); Subagent pollt nur, spawnt nicht.

## 2026-08-28 — Erstes TikTok auf dem Bildschirm seit Gründung

**Ursache:** Owner-Zeugnis in dieser Session: zum ersten Mal seit Gründung ist ein TikTok
auf dem Bildschirm angekommen. Bis 21.08. war die sichtbare Anzeige BLOCKED
(Browser-Localhost `127.0.0.1:3000`). Der Executer-Lauf vom frühen 28.08. ist an der
Node/Next-Forkbomb gescheitert (Fail 0022), ohne Anzeige-Nachweis.

**Auswirkung:** Der Produkt-Meilenstein „Clip sichtbar“ ist eingetreten. Das widerlegt
die Annahme, die Kette ende dauerhaft vor der Anzeige. Es ist ein Owner-Erfolg, kein
Fail — und es ersetzt noch nicht den reproduzierbaren Datei-Nachweis (kein Screenshot,
kein ffprobe, kein Player-Log in dieser Mission).

**Belegpfad:** Owner-Meldung 2026-08-28 ~20:49 lokale Zeit, Session Cursor/session-ledger;
Kontrast `03_HAI/workbench/tiktok-pipeline/EVIDENZ.md` (Playback damals unbewiesen) und
LOGBUCH 2026-08-21 (Anzeige BLOCKED). Mission `M-20260828T205013-bc53ea17`.

**Was nicht passieren darf:** Den Erfolg als vollständigen E2E-Nachweis lesen, ohne den
konkreten Pfad (Player, Datei/URL, Host, Weg A Browser vs. Weg B lokal) festzuhalten.
Den Meilenstein mit Fail 0022 vermischen oder den Stand „Anzeige BLOCKED“ als weiter
gültig behandeln.

**Genau ein nächster Schritt:** Owner nennt den konkreten Anzeige-Pfad (welcher Player,
welche Datei/URL, welcher Host), damit derselbe Erfolg als Datei-Evidenz unter
`03_HAI/workbench/tiktok-pipeline/` festgehalten werden kann.

## 2026-08-28 — Human-Input-Gate als Vertrag persistiert

**Ursache:** Grill-Pass lag seit 26.08. unter `00_AKTUELL/GRILL_PASS.md` (Mission
`M-20260826T231808-05af0c8b`, Reminder-Close 28.08.). Vertrag und Logbuch waren
Non-Goals jenes Slices, weil ein Executer den Writer-Lock auf `03_HAI` hielt.

**Auswirkung:** Fail-closed Docs-Vertrag: Bau braucht den menschlichen Grill-Stempel
(`PASS` + Owner-OK + nicht revoked) **und** die Agent-Stempel (Council +
Plan-ACCEPT). Keine hai-mcp-Enforcement. Verdict bleibt owner-facing unter
`00_AKTUELL/`; der Vertrag steht unter `docs/`.

**Belegpfad:** `03_HAI/docs/HUMAN_INPUT_GATE.md`; `00_AKTUELL/GRILL_PASS.md`;
Mission `M-20260828T205440-d60888dc` (v2 nach Write-Scope-Recontract).

**Was nicht passieren darf:** Grill-PASS als Ersatz für Plan-Council oder
Plan-ACCEPT lesen. Einen Pass nach Objective-/Lane-Wechsel weiterverwenden.
Das Gate für tot halten, nur weil `AGENTS.md` es in diesem Slice nicht pointert.

**Genau ein nächster Schritt:** Eine Zeile unter Harte Gates in `03_HAI/AGENTS.md`
(Spiegel in Root-`AGENTS.md` nur falls dort die anderen Gates stehen).

## 2026-08-28 — vorlese-Skill in Workspace-Harnesses

**Ursache:** Der Skill lag nur unter `~/.cursor/skills/vorlese/`. Andere Hosts
(Claude Code, Codex, OpenCode, Pi, Hermes, Gemini CLI, AiderDesk) hatten keine
`SKILL.md`. `npx skills add --agent '*'` (69 lastSelectedAgents) war für diesen
Slice zu breit.

**Auswirkung:** Dieselbe Anleitung (Piper Thorsten via `pycoach-speak`) steht in
den Skill-Verzeichnissen der Workspace-Harnesses. Root-`AGENTS.md` triggert
Vorlesen für jeden Host in diesem Workspace. Cursor-User-Rule unverändert.

**Belegpfad:** `03_HAI/workbench/upstream/vorlese-skill/INSTALL.md`;
`03_HAI/registry/components/vorlese.json`; Mission `M-20260828T213001-8810554f`.

**Was nicht passieren darf:** Den Skill in die restlichen 69 `lastSelectedAgents`
spiegeln, ohne eigenen Slice. `pycoach-speak` oder das Piper-Modell als Teil
dieser Integration umbauen. Die Cursor-User-Rule duplizieren.

**Genau ein nächster Schritt:** In einem Nicht-Cursor-Host (Claude Code oder
Codex) „lies vor: Hallo“ sagen und prüfen, dass Thorsten spricht.

## 2026-08-28 — Titel zuerst, opake ID bleibt Schlüssel

**Ursache:** Mensch und Agent sahen fast nur `_new_id`-Handles
(`M-YYYYMMDDThhmmss-hex`). Der sprechende Name lag schon im Contract
(Objective, Lane-Label, Intake-Text), hing aber nicht am Handle. Finder- und
ID-Umbau wären die teure, falsche Fläche.

**Auswirkung:** Ein Schema, zwei Felder, eine Darstellung. `hai_status` liefert
`focus_mission.{id,title}`; open/authorize/intake/park liefern `title` neben der
ID. Agenten nennen Titel zuerst, ID in Klammern. `_new_id` und Dateinamen
unverändert.

**Belegpfad:** `03_HAI/hai-mcp/src/hai_mcp/mission.py` (`_title_from_text`);
`03_HAI/hai-mcp/src/hai_mcp/state.py` (`_focus_mission`);
`03_HAI/hai-mcp/tests/test_title_display.py`; `03_HAI/AGENTS.md`; Root-`AGENTS.md`;
`03_HAI/hai-mcp/UPSTREAM_SEARCH.md`. Mission `M-20260828T213830-60cba60d`.

**Was nicht passieren darf:** Titel zum Primärschlüssel machen. Dateinamen in
`~/.hai` umbenennen. Ein zweites Agenten-Dialekt (Mensch sieht Sätze, Agent nur
IDs) einführen. `_new_id` oder `ids.py`-Regex aufweichen.

**Genau ein nächster Schritt:** Live-`hai_status` prüfen, dass `focus_mission.title`
das Objective dieser Mission ist; Dateinamen-Slice nur nach eigenem Plan.

## 2026-08-31 — HAI-Vision kanonisch in VISION.md

**Ursache:** Die Vision (Sanduhr-Modell, Compounding, Operator-Invarianten) lebte nur
in Samuels Kopf und verstreuten Chat-Sessions. Jeder neue Agent musste sie neu hören —
bis hinunter zu Basics wie „Samuel sieht keinen headless Browser" (Grok-Session
2026-08-30). Erklär-Reibung pro Session; die Selbstbeschreibung des Systems
compoundete nicht.

**Auswirkung:** `VISION.md` in der Projektwurzel ist die kanonische, agentenlesbare
Quelle für das WARUM: Sanduhr-Modell (Mensch als Engstelle by design), Compounding-
Schleife, Designprinzipien, Operator-Invarianten, Ist vs. Zielbild. `AGENTS.md`
bleibt das WIE (Gates, Verträge, Pfade) — keine Duplikation der Gates.

**Belegpfad:** `03_HAI/VISION.md`; Mission `M-20260831T002121-73a0b51f` (v1);
Session `S-20260831T002238-a27dced1`.

**Was nicht passieren darf:** Die Vision wieder nur mündlich tradieren. VISION.md zum
zweiten Regelwerk aufblasen — Gates bleiben in `AGENTS.md`. Operator-Invarianten ohne
Owner-Ack erweitern oder kürzen. Zielbild als vorhandene Fähigkeit lesen.

**Genau ein nächster Schritt:** Owner reviewt `VISION.md` und entscheidet über die
Pointer-Zeile unter „Kanonische Pfade" in `AGENTS.md` (Kriterium c3, fail-closed).

## 2026-08-31 — Erster Sanduhr-Orchestrator-Lauf (Bordmittel)

**Ursache:** Owner-Anweisung, als Orchestrator mit Subagenten (Grok, Composer) Teile
der Vision umzusetzen — ohne das System zuzubauen. Die generative Hälfte (Discovery
im Datensatz, Prüfung, Destillat, Backreport) existierte nur als Satz in `VISION.md`.

**Auswirkung:** Ein Durchstich auf Bordmitteln: Mission recontractet statt getötet
(v2); Grok destillierte 8 Kandidaten aus LOGBUCH/fails/parking/Inventur; Composer
bestätigte alle Evidenzketten und rankingte Stale-Missionen (2) vor Close-Label (7)
und Inbox (6). Orchestrator-Playbook und Discovery-Report liegen als Workbench-
Variante. Die vorläufige Inbox-Empfehlung wurde nach dem Prüfer gekippt. Nichts
installiert, kein Kandidat ausgeführt.

**Belegpfad:** `03_HAI/workbench/orchestrator-v1/PLAYBOOK.md`;
`03_HAI/workbench/orchestrator-v1/DISCOVERY_REPORT.md`; `03_HAI/VISION.md`;
Mission `M-20260831T002121-73a0b51f` (v2); Session `S-20260831T011317-14a0c24c`;
Checkpoint `~/.hai/history/checkpoints/20260831T012000`.

**Was nicht passieren darf:** Den Lauf als gebaute generative Pipeline lesen.
Playbook nach `docs/` ohne Owner-Gate heben. Einen der acht Kandidaten ohne die
eine Owner-Entscheidung ausführen. K5/K8 als neue Systeme bauen (Gates existieren).
K1-Frequenz „8 Fail-Records 0015/0016“ ungeprüft übernehmen (Nummern vermischt).

**Genau ein nächster Schritt:** Owner wählt den nächsten Slice: Stale-Missionen (2),
Inbox-Verdichtung (6), oder zuerst VISION-Review + AGENTS.md-Pointer (c3).

## 2026-08-31 — Stale-Mission-Slice: leere Liste akzeptiert

**Ursache:** Owner wählte Kandidat 2 (Stale-Missionen). Scan 2026-08-31T01:23+02 über
124 `mission.json`: 1 `active` (Fokus-Mission mit live Lease), 69 `completed`,
54 `abandoned`, 0 anderer Status. Die Zombie-Welle vom 25.08. war bereits per
`hai_close_mission` abgeräumt.

**Auswirkung:** Owner akzeptierte die leere Liste (explizit `1`). 0 Closes, 0
Handedits auf `~/.hai`. Pointer bleibt die lebende Session. Der Root-Fix
(Pointer-Wipe bei jedem Close, `fails/0008`) bleibt geparkt — hai-mcp-Code, nicht
dieser Lauf.

**Belegpfad:** `03_HAI/workbench/orchestrator-v1/STALE_MISSIONS.md`;
Mission `M-20260831T002121-73a0b51f` (v3); Session `S-20260831T012311-d1482628`.

**Was nicht passieren darf:** Eine leere Stale-Liste als Anlass für Handedits oder
für das Schließen der Fokus-Mission lesen. `fails/0008` für erledigt halten, nur
weil heute 0 Zombies da sind. Den Pointer von Hand setzen.

**Genau ein nächster Schritt:** Owner entscheidet c3 — `VISION.md` reviewen und die
Pointer-Zeile in `AGENTS.md` (ja/nein) — oder die Mission mit offenem c3 parken.

## 2026-08-31 — Inbox-Wahl A, TikTok-E2E HELD

**Ursache:** Owner wählte A (TikTok-E2E) nach Inbox-Cluster. Das ist Execute:
einmaliges Plan-ACCEPT reicht nicht (Fail 0014). Authorizer darf den Lauf nicht
selbst durchziehen. Eine aktive Mission global blockiert eine frische Executer-Mission.

**Auswirkung:** Wahl A festgehalten. Dispatch-Brief liegt. Kein `npm run dev`,
kein Worker, kein Video. Continuous-Authorize auf Host-Ack + ersten Step-Grant
plus Park dieser Mission (c3 bleibt offen).

**Belegpfad:** `03_HAI/workbench/orchestrator-v1/INBOX_CLUSTER.md`;
`03_HAI/workbench/orchestrator-v1/DISPATCH_TIKTOK_E2E.md`;
`03_HAI/docs/CONTINUOUS_AUTHORIZE.md`; `fails/0014-execute-ohne-continuous-authorize.json`;
Mission `M-20260831T002121-73a0b51f` (v4).

**Was nicht passieren darf:** ACCEPT als Session-Grant für Execute lesen.
Orchestrator startet `dev`/`jobs:watch` selbst. Preflight 28.08. ungeprüft
weiterverwenden. Fail 0022 (wiederholter `next dev`) wiederholen.

**Genau ein nächster Schritt:** Owner sagt `ja` oder `nein` zur Execute-Freigabe
in `DISPATCH_TIKTOK_E2E.md` (Host + erster Prozessstart + Park dieser Mission).

## 2026-08-31 — OpenClaw 2.0 CLI installiert (kein Onboard)

**Ursache:** Owner: OpenClaw 2.0 sei das HAI-Konzept, dann „installieren 1“.
Upstream-First vor Install: drei Kandidaten, Decision `use` OpenClaw als
Operator-Surface, nicht als Ersatz für hai-mcp.

**Auswirkung:** CLI `openclaw` 2026.8.1 unter `~/.local/bin`. Registry-Eintrag
`candidate_unverified`. Kein onboard, kein Daemon, keine Auth. `~/.openclaw`
existierte schon (skills, 07.08.), wurde nicht überschrieben.

**Belegpfad:** `03_HAI/workbench/openclaw-v1/UPSTREAM_SEARCH.md`;
`03_HAI/workbench/openclaw-v1/INSTALL.md`; `03_HAI/registry/components/openclaw.json`;
Mission `M-20260831T002121-73a0b51f` (v5).

**Was nicht passieren darf:** Install als Qualifikation oder als hai-mcp-Ersatz
lesen. `openclaw onboard --install-daemon` still starten. Control UI als
Sanduhr-Enforcement behaupten.

**Genau ein nächster Schritt:** Owner sagt `onboard` (sichtbares Setup, Auth
nur mit neuer Freigabe) oder `fertig` (CLI reicht für diesen Slice).

## 2026-08-31 — OpenClaw MiniMax-Auth hängt am orphan Agent `peter`

**Ursache:** Onboard hat MiniMax Global-API als Default (`minimax/MiniMax-M3`,
`api.minimax.io/anthropic`) gesetzt. Der API-Key landete im Auth-Store von
Agent `peter`, der nicht in `agents.list` steht. Die TUI läuft als `main`
ohne Profile. `MINIMAX_API_KEY` ist in der Shell nicht gesetzt.

**Auswirkung:** TUI-Fehler `auth or provider access failed for minimax`.
Inferenz ist konfiguriert, aber nicht authentifiziert.

**Belegpfad:** `workbench/openclaw-v1/ONBOARD.md`;
`openclaw models status` (Missing auth); `openclaw secrets audit --check`
(plaintext key nur unter `agents/peter/…/openclaw-agent.sqlite`).

**Was nicht passieren darf:** Key aus `peter` oder `~/dspy-playground/.env`
auslesen oder nach `main` kopieren (Fail 0019). CN-Endpoint nehmen.
Daemon nachinstallieren, um Auth zu „reparieren“.

**Genau ein nächster Schritt:** In der TUI (Agent `main`) `/auth minimax`
mit einem Key aus der Quelle, die in Pi funktioniert — nicht aus der
dspy-`.env`.

## 2026-08-31 — OpenClaw-Agent `peter` wieder in der Roster

**Ursache:** Owner: MiniMax-Auth fixen, Key bleibt bei `peter` (kein Copy nach `main`).

**Auswirkung:** `agents.entries.peter` zeigt auf `~/.openclaw/agents/peter/agent`.
`models list --agent peter`: MiniMax-M3 Auth yes. CLI-Default bleibt `main`
(Missing auth). `main` wurde nicht gelöscht.

**Belegpfad:** `workbench/openclaw-v1/ONBOARD.md`; `openclaw agents list`;
`openclaw models auth list --agent peter`.

**Was nicht passieren darf:** Key zwischen Agent-Stores kopieren. `main`
löschen, um Default zu erzwingen. Daemon starten.

**Genau ein nächster Schritt:** In der laufenden TUI `/agent peter`, dann
eine Testzeile schicken.

## 2026-08-31 — Session≠TikTok ist V1-Absicht, kein Bug

**Ursache:** Owner: „leider gibt es nicht pro session ein TikTok.“ Das Zielbild
„jede Session wird zum TikTok“ (`I-20260831T013139-3b7d0dc3`) ist nicht der
Betrieb. ADR 0002 verlangt ein explizites `TaskCompletionEvent v1` über
`hai-cycle`; globale Hooks sind eine eigene Owner-Entscheidung. Cursor-Chat
und HAI-Lease `S-…` feuern nichts. Ein Agent hat in der Nacht-Session ein
Lern-TikTok aus jener Session versprochen — ohne CLI, ohne Worker, ohne MP4.

**Auswirkung:** 1:1 Session→Clip ist Zielbild, nicht V1. Manuelle Durchstiche
(20.08. Codex, 28.08. Cursor-`hai-cycle`) belegen die Kette einmal, nicht
Automatik. Execute bleibt HELD (`DISPATCH_TIKTOK_E2E.md`). Diagnose festgehalten;
kein Build in diesem Slice. Fokus-Mission Lernpfad unberührt.

**Belegpfad:** `workbench/tiktok-pipeline/WARUM_KEIN_1ZU1.md`;
`HAI-TIKTOK/docs/adr/0002-explicit-completion-event-boundary.md`;
Intake `I-20260901T000013-a5c7f25f`.

**Was nicht passieren darf:** Die nächste Session als stilles Video versprechen,
ohne `hai-cycle`. ADR 0002 als Lücke lesen und Hooks ohne Owner-Gate legen.
Execute/`next dev` aus dieser Diagnose starten (Fail 0022). Die Lernpfad-Mission
mit TikTok-Work recontracten.

**Genau ein nächster Schritt:** Owner entscheidet später: bewusst manuell
`hai-cycle` für eine abgeschlossene Root-Session — oder Hook-Gate öffnen —
oder 1:1 als Zielbild stehen lassen.

## 2026-09-01 — Sieben ehrliche Session-Ausgänge

**Ursache:** `hai_close_mission` akzeptierte nur `completed` und `abandoned`.
Umlenken, Feierabend und stale `active` ohne Lease wurden als Fail gebucht
oder nie geschlossen. Iterion (p12) ist QUALIFY, nicht Stable — keine zweite
Lifecycle-Wahrheit, nur die Close-API die Agents wirklich aufrufen.

**Entscheidung:** Sieben Closures in `close_mission`: `completed`, `abandoned`,
`parked`, `redirected`, `blocked`, `superseded`, `expired`. `parked`/`blocked`
sind wiederaufnehmbar (`hai_resume_mission`). `redirected`/`superseded` brauchen
eine existierende `successor_mission_id` und sind kein Fail. `expired` nur ohne
live Session, ohne `owner_ack`. Writer-Leases werden in allen sieben widerrufen.
Der Pointer-Algorithmus `remaining[0]` bleibt; nicht-`active` Status gehören
nicht zur Restore-Menge (Fail 0008 unverändert).

**Fundstelle:** `hai-mcp/src/hai_mcp/mission.py` `close_mission` / `resume_mission`;
`tests/test_mission_lifecycle.py` (park/resume, expired-gate, 0008-Park).

**Was nicht passieren darf:** Iterion in diesem Slice andocken. `remaining[0]`
umbauen statt den Bestand aus `active` zu holen. Umlenken wieder als
`abandoned` buchen. `expired` bei live Lease durchlassen. `parked` ohne Resume
als Einbahnstraße lassen.

**Genau ein nächster Schritt:** Die vier stale `active`-ohne-Lease mit den neuen
Labels schließen (`parked` / `superseded` / `expired`), nicht `abandoned`.

**Drain 2026-09-01 (close_mission, kein Handedit):**
- `M-20260831T133520-3801b152` → `superseded` → `M-20260831T002121-73a0b51f`
- `M-20260831T204528-09291a34` → `superseded` → `M-20260831T200233-6a563b3e`
- `M-20260831T214729-51f889d7` → `parked` (Lernpfad-Dialog, resumable)
- `M-20260831T002121-73a0b51f` → `parked` (Orchestrator/Operator, resumable)

`uv run pytest` in `hai-mcp/`: 200 passed. MCP-Server-Prozess hat den neuen
Tool-Satz erst nach Restart (`hai_resume_mission` plus `successor_mission_id`).

## 2026-09-01 — hai-mcp bleibt Python bis zur Qualifikation

**Ursache:** Owner-Frage, ob `hai-mcp` in Rust umgeschrieben werden soll.
Der genannte Schmerz ist MCP-Transport (`Not connected` / uv-Start / stdio),
nicht Laufzeit, Typen oder Verteilbarkeit. Owner-Ack auf den Plan
„Kein Rust-Rewrite". Intake `I-20260901T003051-5cf867e4`.
Mission `Owner-Ack festhalten: hai-mcp nicht in Rust umschreiben; Bindung bleibt Python bis zur Qualifikation.` (`M-20260901T002928-b3e1c95a`).

**Entscheidung:** Die Control-Plane-Bindung `hai-mcp` wird vor Qualifikation
nicht nach Rust oder eine andere Sprache gewechselt. Offizielles Rust-SDK
(`rmcp`) existiert — das macht einen Rewrite möglich, nicht sinnvoll.
HAI ist die Verträge und der Zustand; `hai-mcp` ist eine austauschbare
Bindung (`docs/ARCHITECTURE.md`). Ein Sprachwechsel verdoppelt die Fläche
für dieselben Invarianten (Lease, Kapazitätsboden, Owner-Gates, `~/.hai`
JSON), bevor die bestehende Python-Fläche den Qualifikationspfad hat.

**Warum nicht jetzt:**
- Registry `present_unqualified`; LOGBUCH 2026-08-18 verlangt Pfad-Evidenz
  Discover → … → Contract Validation, keinen Sprachwechsel.
- ~4570 LOC `hai-mcp/src/hai_mcp/` plus ~3980 LOC Tests; Kern ist
  FastMCP/`mcp>=1.9.0`, nicht CPython-Performance.
- Transport-Fails (0002, 0003, 0005) sind stdio/Host. Rust ändert das
  Protokoll nicht.
- `rustc`/`cargo` sind auf dieser Maschine nicht installiert.
- Aktiver Learning Block ist Python Track 00. Lernen kauft Kapazität
  (2026-08-09); die Control Plane in eine Sprache zu ziehen, die der
  Owner nicht liest, löst die Kopplung auf.
- Prior Art im Repo ist P13: eine Kapazitätsformel via UniFFI in der
  Workbench — das Gegenteil eines MCP-Rewrites.

**Was nicht passieren darf:** Ein `rmcp`-Spike, Cargo-Projekt oder
Rust-Toolchain-Install als „nächster hai-mcp-Slice". Die Bindung als
qualifiziert bezeichnen, weil ein anderes SDK existiert. Close- oder
Pointer-Arbeit (Fail 0008, `remaining[0]`) in einen Rewrite ziehen.
Diese Entscheidung übergehen und die Sprachfrage ohne neuen, widerlegten
Grund wieder aufmachen.

**Genau ein nächster Schritt:** Der nächste hai-mcp-Slice bleibt Python —
Qualifikation (Pflichtpfade Intake/Status/Mission/Drift/Proof/Stop) oder
Host/stdio-Transport, nicht Rust. Close-Semantik ist seit heute sieben
Ausgänge; Pointer-Wipe (Fail 0008) bleibt ein eigener Python-Slice.

## 2026-09-01 — Computer Use andocken, kein Eigenbau-CUA

**Ursache:** Owner-Korrektur: Upstream-Suche gilt Agenten, die den Mac
steuern (Klick/Tippen/Apps), nicht Gaming-Voice.

**Entscheidung:** Desktop-Computer-Use kommt als Andock-Stack, nicht als
HAI-Modul. Codex/ChatGPT Computer Use (Sky) für den Codex-Host — App liegt
unter `~/.codex/computer-use/`, MCP-Eintrag existiert mit `enabled = false`.
Cua Driver (`trycua/cua`, MIT, `cua-driver mcp`) für Cross-Harness
(Cursor, Claude Code). Claude Desktop Computer Use nur im Claude-Desktop-Host.
`hai-mcp` bleibt Control Plane. OpenClaw bleibt Operator-UI, nicht der
Desktop-Treiber. Browser-MCPs und Playwright bleiben Browser-Lane.

**Beleg:** [`workbench/computer-use/UPSTREAM_SEARCH.md`](workbench/computer-use/UPSTREAM_SEARCH.md).
Continuous Authorize vor Execute: [`docs/CONTINUOUS_AUTHORIZE.md`](docs/CONTINUOUS_AUTHORIZE.md).

**Was nicht passieren darf:** Eigenes CUA schreiben. `hai-mcp` durch Sky
oder Cua ersetzen. Codex-`notify` (Computer Use) für andere Zwecke
überschreiben. VoiceInk/F5-Paste als Computersteuerung behandeln.
Ohne Owner-Gate `enabled = true` setzen oder TCC-Rechte ändern.

**Genau ein nächster Schritt:** Owner sagt, welche der zwei Install-Türen
zuerst: Codex-CU-MCP einschalten (schon da) oder Cua Driver für Cursor
qualifizieren. Kein Install ohne diesen Satz.

## 2026-09-01 — OpenClaw ist der Computer-Use-Fulfiller

**Ursache:** Owner: „ja openclaw kann das.“ Die CU-Suche hatte OpenClaw
nur als Control-UI abgelehnt.

**Entscheidung:** OpenClaw trägt First-Party Computer Use: Gateway-Tool
`computer` → Node-Befehle `computer.act` + `screen.snapshot`. macOS-App
wählt Peekaboo oder gebündeltes CUA (`cua-driver` 0.19.3 in
`OpenClaw.app`). Beleg: https://docs2.openclaw.ai/nodes/computer-use
Die ältere Suche `workbench/openclaw-v1/UPSTREAM_SEARCH.md` bleibt gültig
für die Operator-Oberfläche; sie beantwortet nicht den CU-Need.

**Was nicht passieren darf:** OpenClaw als „nur UI“ führen und daneben
ein zweites CUA bauen, obwohl die App den Driver bündelt. CLI
(`2026.8.1`) mit Volldesktop-CU verwechseln — Fulfiller ist die signierte
App, hier nicht unter `/Applications/OpenClaw.app`. `hai-mcp` ersetzen.
`computer` im `coding`-Profil als default annehmen (Docs: alsoAllow).

**Genau ein nächster Schritt:** OpenClaw-macOS-App als Node qualifizieren
(Computer Control, TCC, Pairing, `tools.alsoAllow: ["computer"]`) — nicht
separates cua-driver installieren, solange dieser Pfad trägt.

## 2026-09-01 — OpenClaw ist die zentrale Steuerung, nicht der Mensch

**Ursache:** Owner: Ein Agent soll die anderen bedienen. Mehrere parallele
Menschen-Chats mit Cursor, Claude, Codex machen keinen Sinn. OpenClaw
kann das.

**Entscheidung:** Der Alltagseingang ist **ein** Operator — OpenClaw.
Worker-Harnesses (Cursor, Claude Code, Codex, …) werden von dort
gestartet und eingesammelt: ACP (`docs2.openclaw.ai/tools/acp-agents`),
native Sub-agents (`sessions_spawn`), Codex-Plugin, Computer Use nur
wenn keine Schnittstelle existiert. Samuel bleibt die Engstelle der
Sanduhr (`VISION.md`), nicht der Dispatcher zwischen fünf UIs.
`hai-mcp` bleibt Control Plane (Vertrag, Lease, Evidence). cao bleibt
PARKED (`parking/multi-agent-owner-gate.md`) — nicht still zur
Primary-Orchestrierung machen.

**Was nicht passieren darf:** Samuel als Router zwischen Harnesses
einsetzen. OpenClaw mit `hai-mcp` vertauschen. Computer Use als
Ersatz für ACP, wo ACP den Harness schon startet.

**Genau ein nächster Schritt:** OpenClaw-Operator qualifizieren
(App-Node + ACP-Plugin-Doctor), ein Harness von dort spawnen, Evidenz
zurück in eine HAI-Mission — nicht drei Desktop-CUAs parallel anmachen.

## 2026-09-01 — Beim Zocken spricht OpenClaw, nicht die Cursor-Hooks

**Ursache:** Owner: Beim Zocken meldet sich OpenClaw per Voice und steuert
die anderen Agenten.

**Entscheidung:** Der Voice-Eingang beim Spielen ist OpenClaw Talk
(macOS-App, Overlay, Headset-Mikro), nicht `gaming-voice` Cursor-Hooks.
Talk: hören → Gateway-Session (Operator) → `talk.speak`. Derselbe
Operator startet Worker (ACP / Sub-agents / Computer Use). Beleg:
https://docs2.openclaw.ai/nodes/talk — Native Talk-Loop; Interrupt on
speech; Voice-Confirm vor Computer-/Node-Aktionen. Eigene Cursor-TTS-Hooks
sind dafür kein zweiter Operator.

**Was nicht passieren darf:** Gaming-Voice-Hooks und OpenClaw Talk
gleichzeitig auf denselben Lautsprecher/Mic. Cursor-`followup_message`
als Zocker-Eingang weiterbauen. Talk ohne `OpenClaw.app` als fertig
behaupten (CLI allein hat kein Talk-Overlay).

**Genau ein nächster Schritt:** OpenClaw-macOS-App + Talk Mode gegen
ein Headset qualifizieren (hören → eine Operator-Antwort → eine
ACP-Spawn), Gaming-Voice bleibt `off`.

## 2026-09-01 — OpenClaw.app und Gateway stehen, Talk-Smoke fehlt

**Ursache:** Owner: „kannst du das einrichten“ — Voice-Operator
(OpenClaw Talk + ACP), nicht die Cursor-Gaming-Hooks.

**Entscheidung:** Signierte App `2026.8.1` nach `/Applications/OpenClaw.app`
(`ai.openclaw.mac`). LaunchAgent-Gateway auf `127.0.0.1:18789`. Talk auf
Agent `peter`, `tools.alsoAllow: ["computer"]`, Plugin `acpx`, `hai-mcp`
in `mcp.servers`. Gaming-Voice bleibt `off`. MiniMax-Key bleibt auf
`peter`. Beleg: [`workbench/openclaw-v1/SETUP.md`](workbench/openclaw-v1/SETUP.md).

**Was nicht passieren darf:** Talk als fertig behaupten, solange der
Mac-Node `disconnected · unapproved` ist. ACP-Doctor-PASS aus einem
90s-Timeout (`Process failed`) ableiten. Gaming-Voice parallel
einschalten. Zweites CUA daneben installieren.

**Genau ein nächster Schritt:** In OpenClaw.app Permissions + Talk am
Headset; eine Antwort hören, dann ein ACP-Spawn. Nicht die Cursor-Hooks.

## 2026-09-01 — OpenClaw-Permissions gestaffelt, Hermes-Fehler nicht wiederholen

**Ursache:** Owner: Hermes-Worker-Fehler nicht wiederholen; Upstream,
welche Permissions OpenClaw wirklich braucht.

**Entscheidung:** Talk (Mic/Speech) vor ACP-Spawn vor Computer Use.
CU-TCC nicht klicken, solange Talk und `/acp doctor` unbelegt sind.
`tools.alsoAllow: ["computer"]` plus Node-Role vor Smoke ist Fail
[`fails/0023-openclaw-computer-before-talk-acp.json`](fails/0023-openclaw-computer-before-talk-acp.json).
Hermes Agent ≠ Hermes Node. Installation ≠ Qualifikation. Secrets
nicht zwischen Stores kopieren. Beleg:
[`workbench/openclaw-v1/OPERATOR_PERMISSIONS.md`](workbench/openclaw-v1/OPERATOR_PERMISSIONS.md),
[`workbench/openclaw-v1/UPSTREAM_SEARCH_OPERATOR_PERMISSIONS.md`](workbench/openclaw-v1/UPSTREAM_SEARCH_OPERATOR_PERMISSIONS.md).

**Was nicht passieren darf:** Accessibility/Screen Recording als ersten
Klick. ACP-Spawn mit `computer.act` vermischen. Parent-Sandbox als
Dispatch-Host. Gaming-Voice parallel. hai-mcp durch OpenClaw ersetzen.

**Genau ein nächster Schritt:** In OpenClaw.app nur Mikrofon und
Sprache; eine Talk-Antwort am Headset. Nicht Bedienungshilfen.

## 2026-09-01 — OpenClaw-TCC gemessen: Talk braucht Mic+Speech, CU ist Werbung

**Ursache:** Owner: testen, welche Permissions OpenClaw braucht.

**Entscheidung:** Der App-Reporter (`nodes.status.permissions`) ist die
Messung. Auf diesem Mac sind Mic, Speech, Accessibility, Screen,
Kamera, Ort, Notifications alle `false`. Node trotzdem `computer.act`
(Peekaboo) in den Caps — Capability ohne TCC. `system.which` ohne TCC
ok. ACP ohne CU-TCC. Talk-Prompt nur bei Owner-Start von Talk/Quick-Chat-Mikro.
Beleg: [`workbench/openclaw-v1/PERMISSION_SMOKE.md`](workbench/openclaw-v1/PERMISSION_SMOKE.md).

**Was nicht passieren darf:** `computer` in caps als erteilte
Bildschirmsteuerung lesen. Grant-Leiste Screen Recording für Talk
mitklicken. Accessibility fürs erste Hören.

**Genau ein nächster Schritt:** Talk oder Quick-Chat-Mikro in der App
starten und nur Mikrofon plus Sprache erlauben.

## 2026-09-01 — OpenClaw-Skills: Talk braucht keine, Worker braucht acp-router

**Ursache:** Owner: welche Skills braucht OpenClaw.

**Entscheidung:** Talk = null Skills. Worker = bestehendes `acp-router`
(`sessions_spawn`). hai-mcp bleibt MCP. peter sieht aktuell 97 Skills
inkl. `gaming-voice` und `peekaboo` — zu breit. Empfohlene Allowlist:
acp-router, node-connect, diagnose-gateway, healthcheck. `coding-agent`
bleibt opt-in aus. Beleg:
[`workbench/openclaw-v1/OPERATOR_SKILLS.md`](workbench/openclaw-v1/OPERATOR_SKILLS.md).

**Was nicht passieren darf:** ClawHub-Masse, `autoAllowSkills`, Whisper
für Talk, vorlese/gaming-voice als zweiter Voice-Operator, peekaboo
vor CU-TCC, coding-agent und acp-router parallel ohne Owner.

**Genau ein nächster Schritt:** Owner bestätigt die peter-Skill-Allowlist;
bis dahin Talk nur Mic+Speech, nicht den Skill-Friedhof.

## 2026-09-01 — OpenClaw-MCPs: nur hai-mcp, Talk ohne MCP

**Ursache:** Owner: welche MCPs braucht OpenClaw.

**Entscheidung:** Talk = kein MCP. Operator = einziges `mcp.servers.hai-mcp`
(doctor ok, 28 tools). ACP-Spawn ohne OpenClaw-Tool-Bridges. Cursor-MCPs
(plaud, gmail, …) bleiben im Worker. Kein Sky-CU, kein cua-driver-MCP.
Beleg: [`workbench/openclaw-v1/OPERATOR_MCPS.md`](workbench/openclaw-v1/OPERATOR_MCPS.md).

**Was nicht passieren darf:** Cursor-MCP-Kopie nach OpenClaw.
`pluginToolsMcpBridge` / `openClawToolsMcpBridge`. Codex computer-use
einschalten. hai-mcp durch `mcp serve` ersetzen.

**Genau ein nächster Schritt:** Keine weiteren MCPs; Talk mit Mic+Speech.

## 2026-09-01 — OpenClaw-Connectoren: kein Chat-Channel, nur Mac-Node

**Ursache:** Owner: welche Connectoren braucht OpenClaw.

**Entscheidung:** Talk und Operator brauchen **null Chat-Channels**.
Gemessen: `channels list` leer, Katalog Discord/Telegram/WhatsApp/…
uninstalled. Pflicht lokal: Device-Pair Mac-App `samuel-mbp`
(operator+node, connected). MiniMax und hai-mcp sind Provider/MCP,
keine Channels. ACPX startet Worker, ersetzt keinen Messenger.
Beleg: [`workbench/openclaw-v1/OPERATOR_CONNECTORS.md`](workbench/openclaw-v1/OPERATOR_CONNECTORS.md).

**Was nicht passieren darf:** `openclaw channels add` für Discord/Telegram/
WhatsApp/iMessage „damit es spricht“. Cursor-Connectors nach OpenClaw
spiegeln. Gateway von loopback auf LAN. Azure/ElevenLabs als Talk-Pfad
neben `talk.provider=system`. A2A/Bonjour öffentlich.

**Genau ein nächster Schritt:** Keine Channels; Talk mit Mic+Speech.

## 2026-09-01 — OpenClaw-Provider-Kette: peter MiniMax, Talk system, kein Fallback

**Ursache:** Owner: die Provider-Chain von OpenClaw.

**Entscheidung:** Drei getrennte Schichten, keine stille Kette.
Talk-Speech = `system` (Apple). Operator-Inferenz = Agent **peter**,
`minimax/MiniMax-M3` Global (`api.minimax.io/anthropic`), Auth nur im
peter-Store, Fallbacks **0**. Worker = ACPX `defaultAgent=cursor`.
`main` hat denselben Modellnamen, aber **Missing auth** — Key nicht
kopieren. Memory-Embeddings-Default OpenAI ist unqualifiziert/paused.
Beleg: [`workbench/openclaw-v1/OPERATOR_PROVIDERS.md`](workbench/openclaw-v1/OPERATOR_PROVIDERS.md).

**Was nicht passieren darf:** MiniMax-Key nach `main` (Fail 0019).
Fallback-Modelle oder zweite Provider-Logins „für Robustheit“.
Talk-`provider` mit MiniMax/ElevenLabs verwechseln. Katalog-Zeile
GPT-5 Auth-yes als peter-Auth lesen. `OPENAI_API_KEY` für Memory
als Pflicht der Operator-Kette setzen.

**Genau ein nächster Schritt:** Keine Provider ändern; Talk auf peter
mit Mic+Speech.

## 2026-09-01 — OpenClaw-Smoke: Gateway+MiniMax PASS, Talk Owner-Gate

**Ursache:** Owner: testen.

**Entscheidung:** CLI-Kette ist live. Gateway health HTTP 200.
peter MiniMax antwortet `pong` in 4s, Session
`agent:peter:smoke-20260901`, Fallback false, keine Tools.
OpenClaw.app geöffnet. TCC Mic/Speech weiter **false** — Stimme nur
nach Owner-Klick. ACP-Host `cursor-agent acp` existiert, kein
Doctor-PASS. Beleg:
[`workbench/openclaw-v1/TALK_SMOKE.md`](workbench/openclaw-v1/TALK_SMOKE.md),
[`workbench/openclaw-v1/TALK_SMOKE.ping.json`](workbench/openclaw-v1/TALK_SMOKE.ping.json).

**Was nicht passieren darf:** Screen Recording / Accessibility für Talk
mitklicken. `/acp doctor` als PASS aus dem Ping ableiten. Gaming-Voice
einschalten. MiniMax-Key nach main.

**Genau ein nächster Schritt:** In der offenen App Talk starten; nur
Mikrofon + Sprache.

## 2026-09-01 — OpenClaw-E2E: Talk BLOCKED, acpx PASS, sessions_spawn FAIL

**Ursache:** Owner: E2E.

**Entscheidung:** Voll-E2E ist **kein PASS**. Talk-TCC Mic/Speech weiter
false. Gateway und peter-MiniMax bleiben PASS. Direkter `acpx cursor
exec` (deny-all) antwortet `acp-pong`. Operator-Pfad
`sessions_spawn runtime=acp` dispatch_failed: **Unknown agent id
"cursor"** — `acp.defaultAgent=cursor` steht nicht in `agents.entries`
(nur main/peter). Skill-Beispiel `mode=session` ohne thread fällt
durch Validation. Beleg:
[`workbench/openclaw-v1/E2E_SMOKE.md`](workbench/openclaw-v1/E2E_SMOKE.md).

**Was nicht passieren darf:** E2E grün aus telephone-game ableiten.
`agents.entries.cursor` still schreiben ohne Owner. `--approve-all`.
`--auth-policy fail` als „Cursor nicht eingeloggt“ lesen (whoami war
ok). CU-TCC für Talk.

**Genau ein nächster Schritt:** Talk nur Mic+Speech; dann Owner-Satz für
ACP-Agent-Eintrag `cursor`.

## 2026-09-04 — Dopamin-Sperre dockt an die Fritzbox, nicht an hai-mcp

**Ursache:** Owner: Handy und alle Heimgeräte sperren, Cheap Dopamin. Zwei ACTIVE-Lanes voll; kein drittes Lane; kein Lock-Screen.

**Entscheidung:** Die Heimnetz-Sperre ist Kindersicherung/TR-064 auf der vorhandenen FRITZ!Box 7590 (FritzOS 8.25). Library: `fritzconnection`. hai-mcp bleibt Control Plane und bekommt kein Lock-Tool. Slice ist geparktes Workbench-Capture (`I-20260904T022030-1f5fda9e`), Lanes unverändert. HostFilter-SCPD listet alle 10 Actions inkl. `DisallowWANAccessByIP` und `AddHostEntryToFilterProfile`. Arbeits-Mac `samuel-mbp` / `192.168.178.69` nie WAN-Kill. AdGuard Home und always-on Mini-Agent sind PARKED (eigener Slice). WAN-Toggle am Handy erst nach Owner-Go auf genau ein Gerät.

**Beleg:** [`workbench/fritz-dopamin-v1/UPSTREAM_SEARCH.md`](workbench/fritz-dopamin-v1/UPSTREAM_SEARCH.md), [`workbench/fritz-dopamin-v1/DISCOVER.md`](workbench/fritz-dopamin-v1/DISCOVER.md), [`workbench/fritz-dopamin-v1/SMOKE.md`](workbench/fritz-dopamin-v1/SMOKE.md), Park `/Users/samuelfleig/.hai/inbox/park_20260904T022043_29840_ebe307fb.md`.

**Was nicht passieren darf:** `DisallowWANAccessByIP` auf den Arbeits-Mac. Feature-Code in hai-mcp. OpenClaw-Channels „damit das Handy fragt“. Passwort ins Repo. Stille dritte Lane. UI-Scraping (ha-fritzprofiles). Smoke-grün ohne Owner-Go und ohne Handy-Namen.

**Genau ein nächster Schritt:** Owner legt in der Fritzbox das Profil `HAI-Dopamin` an ([`workbench/fritz-dopamin-v1/OWNER_PROFILE.md`](workbench/fritz-dopamin-v1/OWNER_PROFILE.md)) und nennt den Gerätenamen des Handys, wenn eine Lane frei ist.

## 2026-09-04 — Erster Mesh-Lauf: Cloud-Orchestrator steuert ThinkPad-Hermes auf MBP-Inference

**Ursache:** Owner (Samuel) mit Grok Bot **Interconnect**: erster plug-and-play Tailscale-Meilenstein; Geräteübergreifendes HAI; M3 Max als Last-Resort Inference.

**Entscheidung / was heute zum ersten Mal ging:** Eine Cloud-Instanz (Grok Bot / Interconnect auf `cursor`, Tailscale `100.92.173.6`) arbeitet als Orchestrator über den Mesh und steuert den Hermes-**wggesucht**-Agenten auf dem ThinkPad (`pop-os`, `100.65.66.89`), dessen Token-Pfad als letzte Stufe auf dem MacBook Pro M3 Max (`samuel-mbp`, `100.100.119.4`) läuft — lokal Ollama `0.0.0.0:11434`, tool-calling verifiziert (`qwen3.5:35b` → `tool_calls`). HAI ist geräteübergreifend: Mesh zuerst, dann Agent. Der Mensch bleibt Akteur; Agenten-Zoo / Von-Neumann-Agenturarchitektur bleibt verworfen.

**Beleg:**
- Tailscale Mesh: `cursor` ↔ `pop-os` ↔ `samuel-mbp` (SSH TP→MBP User-Fix; Interconnect-Key auf TP+MBP)
- TP Hermes Fallbacks / Provider `mbp-ollama` → `http://100.100.119.4:11434/v1` (`qwen3.6:35b-a3b`, `qwen3.5:35b`, `muse-glimmer:30b-mlx`); Backup `~/.hermes/config.yaml.bak.mbp-lastresort-*`
- Live: TP `curl` MBP `/api/version` = Ollama `0.33.2`; `/v1/chat/completions` mit Tools → `finish_reason: tool_calls`
- Netzwerk-Handoff für Metal-Build: [`../metal-ml-lab/INTERCONNECT-NETWORK.md`](../metal-ml-lab/INTERCONNECT-NETWORK.md) (Pfad: `/Users/samuelfleig/Projects/metal-ml-lab/INTERCONNECT-NETWORK.md`)

**Was nicht passieren darf:** Last-Resort wieder auf TP-`localhost:11434` zeigen und so tun, als wäre der M3 Max tot. Mesh als Einzellaptop-HAI behandeln. Inference-Port ändern, ohne Interconnect/Hermes-Fallback mitzuziehen. „Verkaufbar“ am WG-Agenten behaupten, solange Listing #14002234 kein Outcome hat — Infrastruktur ≠ Ergebnis.

**Genau ein nächster Schritt:** Metal-/Cursor-Agent liefert den Inference-Stack im metal-Ordner; Interconnect hält den Mesh-Endpoint. Owner: eine echte Hermes-Session neu laden, damit Fallbacks greifen.

## 2026-09-14 — Agency dockt als Entscheidungs-Feed, nicht als Control Plane

**Ursache:** Owner-Auftrag, https://github.com/browser-use/agency lokal zu installieren und zu starten.

**Entscheidung:** Agency ist Discover-Kandidat unter `05_INBOX/agency` (Loopback `:3100`, Skill in Claude und Cursor). `hai-mcp` bleibt Control Plane. Karten, die Repos oder Mail mutieren, brauchen Mission+Lease. Keine dritte ACTIVE-Lane. Lizenz im Upstream nicht deklariert — kein Functional Claim.

**Beleg:** [`workbench/upstream/agency/INSTALL.md`](workbench/upstream/agency/INSTALL.md), [`workbench/upstream/agency/SMOKE.md`](workbench/upstream/agency/SMOKE.md), [`registry/components/agency.json`](registry/components/agency.json), [`../STACK.md`](../STACK.md). Mission `M-20260914T150106-5a49aa4e`.

**Was nicht passieren darf:** Agency als Ersatz für `hai_status`/`hai_intake`. Server auf `0.0.0.0` oder Tunnel. `me.md` / `.wrangler` committen. Send/Merge ohne Owner-Klick und ohne Mission.

**Genau ein nächster Schritt:** Owner öffnet `http://localhost:3100` und entscheidet die erste Karte (oder startet den Dev-Server erneut, falls der Prozess tot ist).

## 2026-09-14 — OpenClaw Talk Slice A BLOCKED an Mic/Speech

**Ursache:** Owner will einen Arbeits-Helfer auf dem MacBook: zwei Kanäle lokal (Stimme + Bildschirm), Antworten von einem großen LLM. Plan Slice A = nur Talk.

**Entscheidung:** Der Helfer bleibt OpenClaw, nicht Agency/OpenDuck/Clicky. Stimme lokal (Talk / Apple Speech), Antworten **peter / MiniMax**. Screen-Kanal und Computer Use bleiben hinter Talk (Fail 0023). `hai-build` Lane gedroppt (Control war schon PARKED). `chip-explainer` bleibt als späterer lokaler Screen-Kandidat. OpenDuck, mlx-audio `:8880` und Codex `realtime-voice-chat` beendet; Gaming-Voice `off`. Node `samuel-mbp` connected. microphone + speechRecognition **false** — Agent klickt TCC nicht. accessibility war nach Connect `true` (nicht in diesem Slice gesetzt, nicht zurückgesetzt). Mission `M-20260914T154051-fa025568` **BLOCKED**.

**Beleg:** [`workbench/openclaw-v1/TALK_SMOKE.md`](workbench/openclaw-v1/TALK_SMOKE.md), [`workbench/openclaw-v1/TALK_SMOKE.nodes.20260914T1543.json`](workbench/openclaw-v1/TALK_SMOKE.nodes.20260914T1543.json), Checkpoint `/Users/samuelfleig/.hai/history/checkpoints/20260914T154307`.

**Was nicht passieren darf:** Screen Recording / Accessibility als nächsten Klick. `computer.act`. Zweites Voice-Produkt. Lokales Kleinmodell als Antwort-LLM. MiniMax-Key nach `main`. Gaming-Voice on. `tccutil reset`. Agency/OpenDuck/Clicky als Ersatz-Helfer.

**Genau ein nächster Schritt:** In der offenen OpenClaw.app Talk starten, nur Mikrofon + Sprache, eine Antwort am Headset hören.

## 2026-09-14 — Grok Voice dockt als Cookbook-Sample, nicht in Agency

**Ursache:** Owner `/add-voice`. Kein Chat-Composer im Workspace (Agency = Aufgabenkasten). Offizieller Sample statt Fork.

**Entscheidung:** Sparse-Clone `05_INBOX/xai-cookbook` (`voice-examples/agent/web`, HEAD `01d8421`). Glue: ephemeral `/session`, `wss://api.x.ai/v1/realtime?model=grok-voice-latest` mit `xai-client-secret`, `grok-transcribe`, Composer-Waveform, Dev-Log-Sink, Loopback. Native Sample-Rate bleibt Cookbook-Standard (kein 24-kHz-Zwang). Keine dritte Lane. `candidate_unverified`.

**Beleg:** [`workbench/upstream/grok-voice/UPSTREAM_SEARCH.md`](workbench/upstream/grok-voice/UPSTREAM_SEARCH.md), [`workbench/upstream/grok-voice/INSTALL.md`](workbench/upstream/grok-voice/INSTALL.md), [`workbench/upstream/grok-voice/SMOKE.md`](workbench/upstream/grok-voice/SMOKE.md), [`workbench/upstream/grok-voice/GLUE.md`](workbench/upstream/grok-voice/GLUE.md), [`registry/components/grok-voice.json`](registry/components/grok-voice.json). Mission `M-20260914T152549-1f7547fb`.

**Was nicht passieren darf:** `XAI_API_KEY` im Client oder Chat. Server auf `0.0.0.0`. Agency-Fork für Voice. Live-Voice ohne Kopfhörer als „Bug“ lesen (Echo). Functional Claim ohne Browser-Lauf.

**Genau ein nächster Schritt:** Owner setzt `XAI_API_KEY` nur in `voice-examples/agent/web/xai/backend-nodejs/.env`, startet Backend `:8000` und Client `:5173`, öffnet `http://localhost:5173` **mit Kopfhörern**, Waveform-Button.

## 2026-09-14 — OpenClaw-Hilfe getestet: Text PASS, Talk weiter Owner-Gate

**Ursache:** Owner: umsetzen und testen; funktionale, simple Hilfe.

**Entscheidung:** Die Hilfe ist OpenClaw + peter/MiniMax, nicht Grok-Voice-Browser. Text-Pfad **PASS** (3s, ein deutscher Satz, keine Tools). Talk-Stimme bleibt lokal in der App; Gateway `talk.speak` mit Provider `system` ist UNAVAILABLE. `talk.mode enabled=true` setzt den Gateway-State, ersetzt aber den Mic-Klick nicht. Control UI `http://127.0.0.1:18789/` ist der Tipp-Eingang bis Talk steht. Kurzanleitung [`workbench/openclaw-v1/SIMPLE_HELP.md`](workbench/openclaw-v1/SIMPLE_HELP.md). Mission `M-20260914T154051-fa025568` weiter **BLOCKED** am TCC.

**Beleg:** [`workbench/openclaw-v1/TALK_SMOKE.md`](workbench/openclaw-v1/TALK_SMOKE.md), [`workbench/openclaw-v1/TALK_SMOKE.peter-help-20260914.json`](workbench/openclaw-v1/TALK_SMOKE.peter-help-20260914.json).

**Was nicht passieren darf:** Grok-Voice oder OpenDuck als Ersatz-Helfer. Cloud-TTS (openai/xai) einschalten, um Talk zu faken. Screen Recording klicken. `computer.act`. MiniMax-Key nach `main`.

**Genau ein nächster Schritt:** Menüleiste OpenClaw → Talk Mode, nur Mikrofon + Sprache, eine Antwort hören. Bis dahin in der Control UI tippen.

## 2026-09-14 — OpenClaw Diktat+Screen BLOCKED: Sprache-TCC da, kein diktiertes Message, kein Snapshot

**Ursache:** Owner-Plan Diktat plus Bildschirm sehen (peter). Mission `M-20260914T154051-fa025568` Contract v3. Close nicht `completed`: kein Satz mit Diktat-Provenance, kein `screen.snapshot`.

**Entscheidung:** Helfer bleibt OpenClaw + peter/MiniMax + Apple Speech (`talk.provider=system`). Diktat-Pfad ist Quick Chat **⌥Space** (Hover-Mikro), nicht Talk-Overlay, nicht der Geräte-Picker. Node `samuel-mbp` 16:20: microphone **true**, speechRecognition **true**, screenRecording **true**, accessibility **true**. Owner-WebChat 16:17 `hi` in `agent:peter:dashboard:16f492f8-…` zählt nicht als Diktat. `computer.act` nicht aufgerufen. `chip-explainer` bleibt. Mission **BLOCKED**.

**Beleg:** [`workbench/openclaw-v1/TALK_SMOKE.md`](workbench/openclaw-v1/TALK_SMOKE.md), [`workbench/openclaw-v1/SIMPLE_HELP.md`](workbench/openclaw-v1/SIMPLE_HELP.md), [`workbench/openclaw-v1/TALK_SMOKE.nodes.20260914T1620.json`](workbench/openclaw-v1/TALK_SMOKE.nodes.20260914T1620.json).

**Was nicht passieren darf:** `hi` oder getippten Text als Diktat-PASS lesen. Snapshot vor einem diktierten Satz. `computer.act`. MiniMax-Key nach `main`. Luna als Operator-Chat. Whisper/Deepgram nachrüsten. Gaming-Voice on. `tccutil reset`.

**Genau ein nächster Schritt:** In **peter** Quick Chat `⌥Space` Mikro einen Satz diktieren. Snapshot in der nächsten Resume, ohne Klicks.

## 2026-09-14 — OpenClaw Helfer Talk+See: Snapshot PASS, Reden BLOCKED

**Ursache:** Owner: Helfer muss hören, **reden**, sehen; Klicks später. Contract v3 hatte Reden gestrichen. v4 holt Talk-Overlay zurück.

**Entscheidung:** Mission `M-20260914T154051-fa025568` Contract v4. `screen.snapshot` auf `samuel-mbp` **PASS** (960×540 jpeg, kein `computer.act`). Bild: Codex/Luna links, Cursor-Plan Mitte, OpenClaw-Leiste auf **main**. Gehörte Talk-Antwort **kein PASS** (`talk.mode enabled=true` reicht nicht). STT/TTS bleibt Apple `system`. `chip-explainer` bleibt. Close **BLOCKED**.

**Beleg:** [`workbench/openclaw-v1/TALK_SMOKE.md`](workbench/openclaw-v1/TALK_SMOKE.md), [`workbench/openclaw-v1/SIMPLE_HELP.md`](workbench/openclaw-v1/SIMPLE_HELP.md), [`workbench/openclaw-v1/TALK_SMOKE.snapshot.20260914T1657.meta.json`](workbench/openclaw-v1/TALK_SMOKE.snapshot.20260914T1657.meta.json), [`workbench/openclaw-v1/TALK_SMOKE.nodes.20260914T1656.json`](workbench/openclaw-v1/TALK_SMOKE.nodes.20260914T1656.json).

**Was nicht passieren darf:** `main` oder Luna als Helfer-Session. Gateway-`talk.speak` als Talk-PASS. Snapshot-JPEG mit Secrets committen. `computer.act` in diesem Slice. MiniMax-Key nach `main`. Whisper nachrüsten. Gaming-Voice on.

**Genau ein nächster Schritt:** Menüleiste OpenClaw → Talk Mode, Agent **peter**, einen Satz sagen, die Antwort hören.

## 2026-09-14 — Peekaboo-Visualizer Overlay PASS, kein Klick

**Ursache:** Owner will eine farbliche Markierung auf dem echten Bildschirm (roter Kreis / Kasten), selbst klicken.

**Entscheidung:** Overlay-Host ist **Peekaboo.app** v4.4.0 (OpenClaw Foundation, notarized), CLI Homebrew 4.3.0. OpenClaw bleibt Broker, nicht Overlay-Fenster. `peekaboo visualizer` **5/5 dispatched**. Event Synthesizing **Granted**. Kein `computer.act`. `see --mode frontmost` FAIL (snapshot identity) — nicht als Kasten-PASS. Mission `M-20260914T154051-fa025568` Contract v5 **completed** für Overlay-only. Talk-Lautheit bleibt offen (nicht Done dieses Slices). `chip-explainer` bleibt.

**Beleg:** [`workbench/openclaw-v1/VISUALIZER_SMOKE.md`](workbench/openclaw-v1/VISUALIZER_SMOKE.md), [`workbench/openclaw-v1/VISUALIZER_SMOKE.visualizer.20260914T1736.json`](workbench/openclaw-v1/VISUALIZER_SMOKE.visualizer.20260914T1736.json), [`workbench/openclaw-v1/SIMPLE_HELP.md`](workbench/openclaw-v1/SIMPLE_HELP.md).

**Was nicht passieren darf:** OpenClaw-Talk als Overlay-Host behandeln. Clicky/Eigenbau-Kreis. `computer.act` „damit die Kästen kommen“. MiniMax-Key nach `main`. `see --frontmost` FAIL als Overlay-PASS lesen. Gaming-Voice on.

**Genau ein nächster Schritt:** In **peter** Talk Mode eine Antwort **hören**. Klicks extra Owner-Satz.

## 2026-09-14 — Peekaboo Feld-Highlight selbst getestet: PNG-Kästen ja, Live-Overlay nein

**Ursache:** Owner: „erster test failed“ / „test es, selbst“. Visualizer-Smoke war der falsche Erfolg; gebraucht war ein Kasten auf einem echten Knopf.

**Entscheidung:** Agent hat selbst getestet, kein Talk, kein `computer.act`. CLI auf Release **4.4.0** (Checksum match) gegen App 4.4.0. `see --app Cursor --window-id 4678 --annotate` **PASS**: New Chat / Search / Automations mit blauen Kästen auf der PNG. `see --mode screen` annotate disabled. OpenClaw-Fenster AX FAIL. Nach Relaunch Peekaboo.app keine `elementDetection`-VisualizerEvents — Live-Kästen auf dem Schirm **nicht belegt**. `visualizer` 5/5 bleibt HUD. Element-Boxes per Config/Defaults eingeschaltet. Mission `M-20260914T194703-7b72d1f0` **BLOCKED**. `chip-explainer` bleibt.

**Beleg:** [`workbench/openclaw-v1/VISUALIZER_SMOKE.md`](workbench/openclaw-v1/VISUALIZER_SMOKE.md), [`workbench/openclaw-v1/VISUALIZER_SMOKE.see.cursor.20260914T1954_annotated.png`](workbench/openclaw-v1/VISUALIZER_SMOKE.see.cursor.20260914T1954_annotated.png), [`workbench/openclaw-v1/VISUALIZER_SMOKE.visualizer.20260914T1950.json`](workbench/openclaw-v1/VISUALIZER_SMOKE.visualizer.20260914T1950.json).

**Was nicht passieren darf:** Visualizer-HUD oder PNG-annotate als Live-Feld-Highlight verkaufen. OpenClaw-Talk als Overlay-Host. `computer.act` „damit die Kästen kommen“. MiniMax-Key nach `main`. Gaming-Voice on.

**Genau ein nächster Schritt:** In Peekaboo.app Settings → Visualizer nachsehen, ob **Element boxes** an ist, Cursor-Fenster sichtbar lassen; dann `see` auf dieses Fenster nochmal feuern und 2 s auf New Chat/Search schauen.

## 2026-09-14 — Peekaboo-Highlight BLOCKED: PNG ja, Live-Kästen nein; GPU nicht in diesem Slice

**Ursache:** Mission `M-20260914T194703-7b72d1f0` nach Resume noch `active`. Live-Feld-Highlight auf dem echten Schirm war das Done-Kriterium; Owner-Reminder verlangt Close.

**Entscheidung:** **BLOCKED**, nicht completed. Browser-Fund SharePoint **SamuelTest** PASS (ChatGPT-Fenster). PNG-Kästen PASS. CLI-`see` emittiert in 4.4 keine `elementDetection`-Events — nur MCP `SeeTool`. Visualizer-HUD 20:07 5/5 zählt nicht als Feld-Highlight. OpenClaw-GPU-100%-Limit nicht in diesem Slice (fremder Write-Root). `chip-explainer` bleibt. Kein `computer.act`.

**Beleg:** [`workbench/openclaw-v1/VISUALIZER_SMOKE.md`](workbench/openclaw-v1/VISUALIZER_SMOKE.md), [`workbench/openclaw-v1/VISUALIZER_SMOKE.see.chatgpt.20260914T2007_annotated.png`](workbench/openclaw-v1/VISUALIZER_SMOKE.see.chatgpt.20260914T2007_annotated.png), Checkpoint `/Users/samuelfleig/.hai/history/checkpoints/20260914T201019`.

**Was nicht passieren darf:** Visualizer-HUD oder PNG-annotate als Live-Highlight verkaufen. Overlay-Mission offen lassen. GPU-Config unter Overlay-Lease schreiben. MiniMax-Key nach `main`. Gaming-Voice on.

**Genau ein nächster Schritt:** OpenClaw-GPU drosseln (`browser.extraArgs`: `--disable-gpu` in `~/.openclaw/openclaw.json`); Overlay danach per Resume, peter „markiere die SharePoint-Liste“.

## 2026-09-14 — OpenClaw-Fenster gekillt, Chromium-GPU per extraArgs begrenzt

**Ursache:** Overlay „Nachricht an peter“ hing (roter Stop). OpenClaw.app PID 6076 bei 98 % CPU; Mac blockiert.

**Entscheidung:** App hart beendet, Gateway gelassen. Neu gestartet: CPU 0 %. `browser.extraArgs` = `--disable-gpu`, `--disable-gpu-compositing`, `--disable-software-rasterizer`. Native Overlay-App ist nicht Chromium — Flags gelten für managed Chrome. Mission `M-20260914T201446-15a4d467` **completed**. `chip-explainer` bleibt. Kein `computer.act`.

**Beleg:** [`workbench/openclaw-v1/GPU_LIMIT.md`](workbench/openclaw-v1/GPU_LIMIT.md).

**Was nicht passieren darf:** Gateway mitkillen, um das Overlay zu retten. `gpuEnabled true` setzen. MiniMax-Key nach `main`. Gaming-Voice on.

**Genau ein nächster Schritt:** OpenClaw-Fenster prüfen, ob peter wieder reagiert. Overlay-Highlight per Resume, peter „markiere die SharePoint-Liste“.

## 2026-09-14 — Peekaboo lokal sieht, MiniMax denkt; Live-Kästen weiter BLOCKED

**Ursache:** Owner: Peekaboo lokal, LLM-API fürs Denken. `screen.snapshot` und `computer` haben MiniMax mit Bild-Tokens vollgestopft; Overlay-Host ist Peekaboo, nicht OpenClaw-Talk.

**Entscheidung:** `computer` aus `tools.alsoAllow` und Sandbox entfernt (Fail 0023). peter-Skills nur `acp-router` + Diagnose, nicht peekaboo-v4/Pillow. Peekaboo 4.4 MCP see-only an Peekaboo.app-`bridge.sock`, `PEEKABOO_VISUAL_ELEMENT_BOXES=true`, Klick-Tools disabled. MiniMax denkt über `{id, role, label, bounds}`. Ping 29 939 Input, MCP-`see` 30 848 — kein JPEG-Spike. Live-Feld-Highlight auf dem Schirm **unproven** (keine `elementDetection`-Events). Mission `M-20260914T204150-557c0c3f` **BLOCKED**. `chip-explainer` bleibt. Talk unverändert peter/`system`. Kein `computer.act`.

**Beleg:** [`workbench/openclaw-v1/THINKING_SPLIT.md`](workbench/openclaw-v1/THINKING_SPLIT.md), [`workbench/openclaw-v1/UPSTREAM_SEARCH.thinking-split.md`](workbench/openclaw-v1/UPSTREAM_SEARCH.thinking-split.md), [`workbench/openclaw-v1/PLAN_VALIDATION_REPORT.md`](workbench/openclaw-v1/PLAN_VALIDATION_REPORT.md), [`workbench/openclaw-v1/SIMPLE_HELP.md`](workbench/openclaw-v1/SIMPLE_HELP.md).

**Was nicht passieren darf:** Visualizer-HUD oder PNG-annotate als Live-Highlight verkaufen. `computer` wieder in `alsoAllow`. MiniMax-Key nach `main` oder Peekaboo-Credentials. Pillow-Kästen. Gaming-Voice on.

**Genau ein nächster Schritt:** Peekaboo.app vorn, Element-Boxes an; in Session `agent:peter:thinking-split-20260914` „markiere New Chat“ — 2 s auf den echten Knopf schauen, nicht auf die PNG.

## 2026-09-14 — Quick Chat hing wieder, native App 100 % CPU

**Ursache:** Owner: Mini-Quick-Chat geht nach der Antwort nicht weg. Dieselbe native Overlay-App wie 20:13, nicht Chromium.

**Entscheidung:** PID 32024 bei 100 % CPU gekillt (TERM tot, KILL). Neu PID 46555, CPU 0.2 %. Gateway 31983 gelassen, `healthz live`. Peekaboo-Split unberührt. Mission `M-20260914T224654-a5aa86b7` **completed**. `chip-explainer` bleibt. Kein `computer.act`.

**Beleg:** [`workbench/openclaw-v1/GPU_LIMIT.md`](workbench/openclaw-v1/GPU_LIMIT.md).

**Was nicht passieren darf:** Gateway mitkillen. Esc als Unstick verkaufen, wenn die App spinnt. MiniMax-Key nach `main`. Gaming-Voice on.

**Genau ein nächster Schritt:** ⌥Space, peter, kurzen Satz; danach **Esc**. Wenn die Leiste wieder spinnt, OpenClaw in der Menüleiste beenden.

## 2026-09-15 — Tool konfiguriert ≠ das richtige Tool aufgerufen

**Ursache:** Owner fragte in Codex BRUEGGEN „hai mcp check?“ / „ist hai mcp da?“. Codex prüfte den SharePoint-MCP (`ms365.verify-login`, Login `sfleig@brueggen-engineering.de`) und antwortete Ja. `hai_health` / `hai_status` wurden in der Session nicht aufgerufen. Vorher, bei kaputter `config.toml` (`notify` unter `[mcp_servers.hai-mcp.env]`), hatte Codex noch korrekt gesagt: ein MCP namens „hai“ sei nicht geladen.

**Entscheidung:** Konfigurierte Tools sind nicht dasselbe wie das vom Agenten **aufgerufene** Tool. Der Agent füllt Mehrdeutigkeit mit dem nächsten passenden Wort: in BRUEGGEN bindet `AGENTS.md` „MCP“ an SharePoint, `.mcp.json` kennt nur `ms365`. Ein grüner Login sieht aus wie Health, ist aber ein anderes Schloss. MCP ist außerdem host-lokal: Cursor hatte `hai-mcp` in `~/.cursor/mcp.json`, Codex nicht, bis derselbe `uv run`-Block in `~/.codex/config.toml` stand. Voice plus Subagents plus Browser verbrennen Kontingent, bevor ein Slice fertig ist (Account `benno.fleig@gmail.com` Plan `prolite` Wochenlimit 14.09. 23:21, Reset 19.09. 12:02).

**Beleg:** Codex-Sessions `/Users/samuelfleig/.codex/sessions/2026/09/15/rollout-2026-09-15T17-27-16-01a0a5ad-f60b-78b0-b78e-93488138bd62.jsonl` und `rollout-2026-09-15T17-28-50-01a0a5af-6382-72d0-8a9c-4f136e3fb790.jsonl`; Share `https://chatgpt.com/s/cx_6aa965ad4b6081918e26360377c21687`; Desktop-Log `mcp_servers.hai-mcp.env.notify` dann `server=hai-mcp status=ready`; `01_WORK/Jobs_Selbständigkeit_Geldverdienen/BRUEGGEN/.mcp.json` (nur ms365); `~/.codex/config.toml` `[mcp_servers.hai-mcp]`; Cursor `~/.cursor/mcp.json`. Parked: **Brueggen Version 1 unter hai-mcp festnageln** (`M-20260915T170838-1a8e7e73`), Checkpoint `/Users/samuelfleig/.hai/history/checkpoints/20260915T170938`.

**Was nicht passieren darf:** `ms365.verify-login` als `hai_health` lesen. „MCP ist konfiguriert“ als Beweis, dass der Agent hai-mcp benutzt hat. „hai mcp?“ in einem Projekt, dessen `AGENTS.md` MCP schon anders belegt. Denselben Cursor-Chat parallel zu Codex in `ARBEITSSTAND.md` schreiben. Den 100-Euro-Account (`prolite`) und den privaten Plus-Account still tauschen, ohne die E-Mail in Codex-Settings zu prüfen.

**Genau ein nächster Schritt:** In Codex neuer Thread, wörtlich `hai_health` und `hai_status` auf Server `hai-mcp` (nicht SharePoint); danach geparkte Mission `M-20260915T170838-1a8e7e73` dort resumieren und nur `ARBEITSSTAND.md` auf v1 schneiden.

## 2026-09-16 — Sketchpad Live dockt als OpenAI-Voice-Canvas, nicht als Grok

**Ursache:** Owner-Wahl für Full-duplex Voice+Canvas (tldraw + GPT-Live). Grok-Voice-Cookbook (`grok-voice`) deckt S2S ohne Board ab; LiveKit/Pipecat wären Extra-Runtime.

**Entscheidung:** Voll-Klon `05_INBOX/sketchpad-live` (HEAD `b38870c`). Glue: Next.js Loopback `:3010`, `OPENAI_API_KEY` nur `.env.local`, WebRTC `/api/session`, Canvas-Agent integriert. Keine dritte ACTIVE-Lane. `candidate_unverified`. Kein Umbau auf xAI/Gemini/Ollama.

**Beleg:** [`workbench/upstream/sketchpad-live/UPSTREAM_SEARCH.md`](workbench/upstream/sketchpad-live/UPSTREAM_SEARCH.md), [`workbench/upstream/sketchpad-live/INSTALL.md`](workbench/upstream/sketchpad-live/INSTALL.md), [`workbench/upstream/sketchpad-live/SMOKE.md`](workbench/upstream/sketchpad-live/SMOKE.md), [`registry/components/sketchpad-live.json`](registry/components/sketchpad-live.json). Mission `M-20260916T124238-84521638`.

**Was nicht passieren darf:** `OPENAI_API_KEY` im Chat, Glue oder Git. Server auf `0.0.0.0`. Live-Voice ohne Kopfhörer als „Bug“ lesen (Echo). Billed GPT-Live-Session in Automatisierung offen lassen. Functional Claim ohne Owner-Lauf mit echtem Key. Provider-Umbau (Grok/xAI) in diesem Slice.

**Genau ein nächster Schritt:** Owner setzt `OPENAI_API_KEY` nur in `05_INBOX/sketchpad-live/.env.local` (nicht in den Chat), startet `:3010`, Start Live mit Kopfhörern, danach End session.

## 2026-09-16 — OpenBot dockt als Image-Coworker auf Loopback, nicht als Bun-Template

**Ursache:** Owner wollte CopilotKit/openbot installieren. Der Upstream trennt Image-Lauf (`:3001`, ein Container) vom Clone+Bun-Template (`:3010`/`:3001` + Compose-Bots). Pick: Klon zum Andocken, erster Smoke = Image `v0.0.12`.

**Entscheidung:** Shallow-Clone `05_INBOX/openbot` Tag `v0.0.12` (HEAD `f88dd59`). Glue unter `workbench/upstream/openbot`. Keys nur in gitignored `.env` via Wizard `scripts/setup-openbot-keys.sh`. Agent führt `copilotkit login` nicht aus. Keine dritte ACTIVE-Lane. `candidate_unverified`. Kein `bun install` / `scripts/start.sh` in diesem Slice.

**Beleg:** [`workbench/upstream/openbot/INSTALL.md`](workbench/upstream/openbot/INSTALL.md), [`workbench/upstream/openbot/SMOKE.md`](workbench/upstream/openbot/SMOKE.md), [`registry/components/openbot.json`](registry/components/openbot.json). Mission **OpenBot v0.0.12 Inbox-Install** (`M-20260916T124554-5f86db6e`).

**Was nicht passieren darf:** Keys in Chat oder Git. Image auf `0.0.0.0:3001`. `MANAGED_AGENT_AG_UI_URL` auf `localhost:4201` gegen das Image setzen (Bots sind nicht im Image). Functional Claim ohne `curl /api/capabilities` → `mode: intelligence`. `hai-mcp` durch OpenBot-Gateway ersetzen.

**Genau ein nächster Schritt:** Owner führt `bash 03_HAI/scripts/setup-openbot-keys.sh` aus (CopilotKit `cpk-...` + `OPENAI_API_KEY` nur ins `.env`), danach `docker run` laut INSTALL.md und `curl -s localhost:3001/api/capabilities`.

## 2026-09-16 — Sketchpad Canvas-Whitelist: Terra Default, Luna wählbar

**Ursache:** Owner: ein Euro für sechs Minuten; Dropdown nur Sol/Astra. Dieselbe Responses-Route, andere Modell-IDs.

**Entscheidung:** Lokaler Fork in `05_INBOX/sketchpad-live`: `REASONING_MODELS` = Luna, Terra, Sol, Astra. Default **Terra**. Stimme bleibt `gpt-live-1`. Kein Provider-Wechsel.

**Beleg:** `05_INBOX/sketchpad-live/lib/canvas-contract.ts`, `app/components/LiveCanvas.tsx`, [`workbench/upstream/sketchpad-live/INSTALL.md`](workbench/upstream/sketchpad-live/INSTALL.md). Mission `M-20260916T151529-ffb8cba7`.

**Was nicht passieren darf:** Stimme auf Luna/Terra umbiegen (geht nicht). Fork als Upstream verkaufen. `git pull` ohne die Whitelist zu halten. Live-Session ohne End session.

**Genau ein nächster Schritt:** Seite `http://localhost:3010` neu laden, Dropdown **5.6 Terra** prüfen, kurze Live-Session, End session.

## 2026-09-16 — mlx-serve dockt als Apple-Silicon-Inference auf :11234

**Ursache:** Owner-Wahl für native MLX/GGUF-Inference mit OpenAI + Anthropic + Ollama-API auf `:11234`; ergänzt `ollama-last-resort` `:11434`, ersetzt weder Control Plane noch Ollama.

**Entscheidung:** Upstream `ddalcu/mlx-serve` (MIT, Homebrew formula). Glue unter `workbench/upstream/mlx-serve`, Registry `mlx-serve.json`, STACK-Zeile. Kein Source-Build, kein Modell-Download in Automatisierung. Erster `brew tap` scheiterte an git HTTP/2 EOF (~700 s); `mlx-serve` nicht installiert. Glue trotzdem geschrieben (`candidate_unverified`).

**Beleg:** [`workbench/upstream/mlx-serve/UPSTREAM_SEARCH.md`](workbench/upstream/mlx-serve/UPSTREAM_SEARCH.md), [`workbench/upstream/mlx-serve/INSTALL.md`](workbench/upstream/mlx-serve/INSTALL.md), [`workbench/upstream/mlx-serve/SMOKE.md`](workbench/upstream/mlx-serve/SMOKE.md), [`registry/components/mlx-serve.json`](registry/components/mlx-serve.json). Mission **mlx-serve Homebrew install** (`M-20260916T151757-b9dca056`).

**Was nicht passieren darf:** `hai-mcp` oder `ollama-last-resort` als ersetzt verkaufen. `./app/build.sh` Source-Build. `mlx-serve pull` großer Modelle in Agent-Automatisierung. Functional Claim ohne erfolgreichen brew install + Owner-Modell-Lauf. Server dauerhaft auf `0.0.0.0` lassen.

**Genau ein nächster Schritt:** Owner/Main Session wiederholt `brew tap ddalcu/mlx-serve https://github.com/ddalcu/mlx-serve && brew install mlx-serve` (ggf. `GIT_HTTP_VERSION=1.1`), danach `mlx-serve run <small-model>` oder MLX Core GUI bei Bedarf.

## 2026-09-16 — Sketchpad-Stimme lokal: whisper.cpp plus Thorsten, GPT-Live tot

**Ursache:** GPT-Live kostet 0,05 $/min; STT/TTS sind dort keine Adapter. Owner: Sketchpad forken, Turn-Pipeline lokal, Terra bleibt.

**Entscheidung:** `SKETCHPAD_VOICE=local` (Default). `whisper-server` Metal Loopback `:2022` (`ggml-small`). Piper Thorsten als WAV an den Browser, nicht `pycoach-speak`/`afplay`. `POST /api/session` → 410. PTT Taste M. LOC Client+Routes 182/200. `candidate_unverified`.

**Beleg:** [`workbench/upstream/sketchpad-live/UPSTREAM_SEARCH.local-voice.md`](workbench/upstream/sketchpad-live/UPSTREAM_SEARCH.local-voice.md), [`FORK_EVIDENCE.md`](workbench/upstream/sketchpad-live/FORK_EVIDENCE.md), [`SMOKE.md`](workbench/upstream/sketchpad-live/SMOKE.md), [`workbench/upstream/whisper.cpp/SMOKE.md`](workbench/upstream/whisper.cpp/SMOKE.md). Mission **Sketchpad-Fork lokale Turn-Pipeline** (`M-20260916T153415-49c204f5`).

**Was nicht passieren darf:** GPT-Live wieder starten ohne `SKETCHPAD_VOICE=live`. STT/TTS auf `0.0.0.0`. Functional Claim ohne Owner-PTT. Fork als Upstream verkaufen. mlx-serve parallel auf STACK schreiben.

**Genau ein nächster Schritt:** `http://localhost:3010` (Kopfhörer), Start, Taste M halten, eine Äußerung, Canvas und Thorsten prüfen.

## 2026-09-16 — Sketchpad Voice-Wahl: Local oder GPT-Live per Button

**Ursache:** Owner wollte lokale Stimme nicht fest, sondern wählbar.

**Entscheidung:** Panel **Voice:** Buttons Local / GPT-Live. Default Local, `localStorage` `sketchpad-voice-mode`. Während Session disabled. Env-410 auf `/api/session` entfernt, damit GPT-Live nach Wahl wieder darf. Canvas-Modell unverändert Terra-Default.

**Beleg:** `05_INBOX/sketchpad-live/app/components/LiveCanvas.tsx`, `app/api/session/route.ts`, [`workbench/upstream/sketchpad-live/TOGGLE_EVIDENCE.md`](workbench/upstream/sketchpad-live/TOGGLE_EVIDENCE.md). Mission **Voice-Modus UI-Wahl** (`M-20260916T160913-0097b189`).

**Was nicht passieren darf:** GPT-Live starten und offen lassen (0,05 $/min). Schalter während laufender Session umbiegen (UI disabled). Functional Claim ohne Owner-Klick.

**Genau ein nächster Schritt:** Seite neu laden, Voice **Local** lassen oder **GPT-Live** wählen, dann Start.

## 2026-09-16 — Sketchpad Local: Prompt-Paste plus Dauer-Zuhören

**Ursache:** Local war Push-to-talk (Mic nach Start disabled, nur Taste M). AirPods unbrauchbar. Kein Textfeld, also kein Prompt-Paste ohne Stimme.

**Entscheidung:** Panel-Prompt (Send / Cmd-Enter) geht ohne Mic an `handleDelegation` / Terra. Local nach Start: Mic an, RMS-Stille ~800 ms schneidet den Turn, Listen pausiert während Think/TTS (kein Barge-in). M optional. GPT-Live-WebRTC unverändert. Plan-Validator ACCEPT vor Build. Glue über LOC-Budget ~150 (LiveCanvas+CSS ~+373).

**Beleg:** `05_INBOX/sketchpad-live/app/components/LiveCanvas.tsx`, `app/globals.css`, [`workbench/upstream/sketchpad-live/PLAN_VALIDATION_REPORT.md`](workbench/upstream/sketchpad-live/PLAN_VALIDATION_REPORT.md), [`TEXT_LISTEN_EVIDENCE.md`](workbench/upstream/sketchpad-live/TEXT_LISTEN_EVIDENCE.md), [`INSTALL.md`](workbench/upstream/sketchpad-live/INSTALL.md), [`SMOKE.md`](workbench/upstream/sketchpad-live/SMOKE.md). Mission **Sketchpad Local: Prompt-Paste ohne Mic plus Dauer-Zuhören** (`M-20260916T180659-1832f637`).

**Was nicht passieren darf:** GPT-Live als Dauer-Duplex-Ersatz ohne Stop. Whisper nicht auf `:2022`. Functional Claim für AirPods-Listen ohne Owner-Lauf. Plan-Datei editieren. Barge-in / Thorsten abbrechen in diesem Slice.

**Genau ein nächster Schritt:** `http://localhost:3010` neu laden, Prompt ohne Mic senden; danach Local+Start, AirPods im Dropdown, ohne M sprechen.

## 2026-09-16 — Local zeigt Canvas-Bestätigung nicht als User-Text

**Ursache:** Local-Voice spielt `session.commentary.append` als Thorsten+Caption. Der Upstream-String hängt `Canvas operation confirmed: …` an — das ist eine Nachricht an das GPT-Live-Modell, kein User-Text.

**Entscheidung:** Nur im Local-Zweig von `sendLiveEvent` den Suffix streichen. GPT-Live `channel.send` bleibt inkl. Bestätigung.

**Beleg:** `05_INBOX/sketchpad-live/app/components/LiveCanvas.tsx` (`stripCanvasOperationConfirmedForLocalVoice`), [`workbench/upstream/sketchpad-live/TEXT_LISTEN_EVIDENCE.md`](workbench/upstream/sketchpad-live/TEXT_LISTEN_EVIDENCE.md). Mission **Local-Captions und Thorsten: interne Canvas-Bestätigung vom User-Text trennen.** (`M-20260916T182002-54132fc8`).

**Was nicht passieren darf:** Den Bestätigungs-String auch im GPT-Live-DataChannel entfernen. Alte Captions in localStorage als „noch kaputt“ lesen.

**Genau ein nächster Schritt:** Seite neu laden, neuen Prompt senden; Caption nur Narration, ohne `Canvas operation confirmed`.

## 2026-09-16 — Sketchpad Canvas-Default: Luna

**Ursache:** Owner: Startmodell soll Luna sein, nicht Terra.

**Entscheidung:** `DEFAULT_REASONING_MODEL = gpt-5.6-luna`. Dropdown bleibt Luna/Terra/Sol/Astra. LiveCanvas liest denselben Export.

**Beleg:** `05_INBOX/sketchpad-live/lib/canvas-contract.ts`, [`workbench/upstream/sketchpad-live/INSTALL.md`](workbench/upstream/sketchpad-live/INSTALL.md). Mission **Canvas-Startmodell Default auf Luna setzen.** (`M-20260916T182208-e5306d91`).

**Was nicht passieren darf:** Voice (`gpt-live-1`) mit Canvas-Modell verwechseln. Default in LiveCanvas hardcoden statt den Export zu nutzen.

**Genau ein nächster Schritt:** `http://localhost:3010` neu laden, Dropdown **5.6 Luna** prüfen.

## 2026-09-17 — BRUEGGEN Anhang-Plan: Mission completed; OpenCode lud konfiguriertes MCP erst nach App-Neustart

**Ursache:** Owner bat um Plan „SharePoint um Bewerbungsanhänge erweitern“. Recon: `hai-mcp` (global `~/.config/opencode/opencode.jsonc`) und Playwright-MCP (Projekt-`opencode.json`) waren konfiguriert, aber in der laufenden OpenCode-Instanz nicht als Tools geladen — Config-Stand (20:02) jünger als die App-Instanz; beide Server starteten standalone fehlerfrei. Session lief sichtbar DEGRADED: nur lesen, keine Schreibarbeit.

**Auswirkung/Entscheidung:** Nach App-Neustart (Owner: „bereit“) lud OpenCode beide MCPs. Versand-Mission **Auf SamuelTest muss die sichtbare Aktion „Versand freigeben“ den Unterlagen-/Fragebogenversand nur nach erfolgreichem P…** (`M-20260916T195153-5e3cdbb1`) geparkt — Deploy-/Rückbau-Widerspruch bleibt offen, Audit `A-20260917T020555-6155baa0`. Neue Mission **Bewerbungsanhänge als Teil der Akte planen…** (`M-20260917T020601-2cad4d96`): Writer-Lease `S-20260917T020605-00f3749e`, Plan-Datei erstellt, beide Kriterien verifiziert, completed — Audit `A-20260917T020750-60d2547f`. Zusätzlich Browser-Use read-only verifiziert (Chrome-Profil, `SamuelTest – Home` eingeloggt, MCP `:8931`).

**Beleg:** `01_WORK/Jobs_Selbständigkeit_Geldverdienen/BRUEGGEN/00_AKTUELL/PLAN_ANHAENGE_AKTE_2026-09-17.md`; `01_WORK/Jobs_Selbständigkeit_Geldverdienen/BRUEGGEN/.playwright-mcp/page-2026-09-17T00-01-32-281Z.yml`; `~/.local/share/opencode/log/opencode.log`; Checkpoint `20260917T020646`; Folge-Mission Logbuch `M-20260917T020815-25525d44`.

**Was nicht passieren darf:** „MCP konfiguriert“ mit „MCP im laufenden Prozess geladen“ verwechseln und stattdessen an der Config umbauen. Ohne geladenes MCP Schreibarbeit versuchen statt DEGRADED zu markieren.

**Genau ein nächster Schritt:** Owner entscheidet, ob der Sandbox-Draft-Test freigegeben wird (eine synthetische `BRG-ATTACH-`-Mail mit einem Textanhang, `AttachFile`-Draft in SamuelTest, read-only Readback; kein Publish).

## 2026-09-17 — BRUEGGEN Anhang-PASS: drei gestapelte Defekte nur durch echte Läufe gefunden

**Ursache:** Owner gab den Sandbox-Test frei (Publish + je eine synthetische Mail + sofort stoppen, Runden-Go einzeln). Die vorbereitete Prod-Definition (`browser-setup/mail01-intake-definition-prod.json`, arm-Skripte) war nie real gelaufen.

**Auswirkung/Entscheidung:** PASS in Runde 4: Run `08584119969831401705890701856CU17` Succeeded, Akte 12 mit genau einer Anlage `intake-attach-20260917-D.txt` (206 B, sha256 gleich), UI-Vorschau belegt, Flow danach `Stopped`. Drei gestapelte Defekte in Runden 1-3 gefunden und behoben: (1) `AttachFile`-Operation existiert in der Umgebung nicht → generische SharePoint-HTTP-Anlage (`HttpRequest`-REST `…/AttachmentFiles/add`); (2) `toLower` auf Null → `coalesce`; (3) `filter()` existiert in Power Automate nicht → Header-Parserei entfernt, Absenderadresse direkt. **Lehre: Flowprüfung (0/0) und Publish-Validierung erkennen diese Klasse nicht — nur ein echter Lauf prüft Expression-/Connector-Realität.** Nebenbefunde: Publish aktiviert einen gestoppten Flow selbst; hai-mcp-Evidenz-Check verweigert absolute Pfade mit Umlaut (`path_outside_root` trotz identischer NFC-Strings) — relativer Pfad („00_AKTUELL/…“) funktioniert.

**Beleg:** `01_WORK/Jobs_Selbständigkeit_Geldverdienen/BRUEGGEN/00_AKTUELL/ATTACH_SANDBOX_TEST_2026-09-17.md` (Runden 1-4); Commits `1e7811a`, `ae69180`, `db1187e`; Rohdaten `/tmp/attach-test-evidence/round2–4/` (flüchtig); Mission `M-20260917T021132-374452ac` (Audit `A-20260917T035644-64b30859`).

**Was nicht passieren darf:** Den Flow aktivieren, solange die Prod-Definition keinen `subjectFilter` mehr trägt und das Postfach nicht der echte Bewerbungseingang ist (jede neue Mail → Akte). „0 Fehler in der Flowprüfung“ als Lauffähigkeit deuten.

**Genau ein nächster Schritt:** Owner entscheidet die offenen Kundengates aus `PLAN_ANHAENGE_AKTE_2026-09-17.md` §4 (zuerst: Anhang vs. Portallink) — vor jedem Produktiv-Deploy.

## 2026-09-17 — hai-mcp Konvergenz: MBP-Branch und TP-Branch wieder zusammengeführt

**Ursache:** Owner bat um einen Vergleich beider hai-mcp-Stände (MBP vs TP). Befund: gleicher Ursprung `7300f0f`, aber zwei entgegengesetzte Richtungen. MBP baute nach innen (Learning-Budget, Worker-Kapazität, 2-Writer-Disjoint; 3 Commits + ~1268 uncommittete Zeilen, Branch `HAI-MCP-MBP`), TP baute nach außen (HTTP-Transport, Owner-Gate, logische Projekte, öffentliches GitHub-Repo `smlfg/hai-mcp`). Beide haben Module, die der anderen fehlen; die 8 Transport-Fails (0002–0016) sind eine Ursache, achtmal wiederholt: stdio-Transport bricht bei Parallelität/Host-Reload (`Not connected`), Catch-22 ohne Mission blockt der Shell-Hook jede Schreibarbeit.

**Auswirkung/Entscheidung:**
1. **Sicherung vor Konvergenz:** MBP-Substanz erst in 4 Commits gefasst (chore/core/tests/docs-scripts) — `.DS_Store`/`Projek-Managment`/Minimax-Runs ins `.gitignore`.
2. **Merge statt Rebase:** `origin/main` (TP) in `HAI-MCP-MBP` gemergt (Commit `2dd8aed`), 32 Konflikte in 10 Dateien aufgelöst, **241 Tests grün**. Rebase verworfen: 1 Konflikt-Durchlauf statt 7.
3. **Drei semantische Entscheidungen nach LOGBUCH:** (a) Mehrfach-Mission statt Einzel-Mission (08.09. — die Ein-Mission-Regel hatte den Owner ausgesperrt); (b) Owner-Gate-Default `nonce` (Tests brauchen jetzt explizit `ack_legacy`); (c) `project_id` nur speichern, wenn gesetzt.
4. **Zwei Workbench-Varianten:** `thematic-leases-v1` (3 thematische Writer-Slots `{learning, work, fun}`, Theme aus `project_path`, Cap als Map) und `session-discipline-v1` (Mittelweg nach 08.09.: **Agent hält Disziplin durch HAI, nicht durch Zwang** — Voice-Intake für Samuel, fail-open Schreib-Hook für den Agenten).

**Beleg:** hai-mcp Commit `2dd8aed` (lokal, nicht gepusht); 03_HAI Commit `64a6d16`; `workbench/thematic-leases-v1/DESIGN.md`, `workbench/session-discipline-v1/DESIGN.md`; pytest `241 passed`.

**Was nicht passieren darf:** Die Branches wieder auseinanderlaufen lassen ohne Rück-Sync — MBP-Module (`learning_budget`, `limits_logbook`) fehlen auf TP, TP-Module (`http_transport`, `owner_gate`, `projects`, `git_hygiene`, `skill_log`, `source_freshness`, `retry_guard`) fehlen auf MBP, plus 4 ungepushte TP-Commits in `hai-mcp-installed` (bis `d9c4dc9`). Pushen ohne Owner-Freigabe (es wurde nur lokal committet). „Konvergenz" mit „Qualifikation" verwechseln — beide Stände bleiben laut 08.18. unqualifiziert.

**Genau ein nächster Schritt:** Owner entscheidet Push vs. weiter lokal — und die 4 ungepushten TP-Commits (skill_log/source_freshness/retry_guard/git_hygiene + „Initial public upload") klären, bevor neu gebaut wird.
