# Reality Sync — Agentfähig, 25.11.2026

Zweck: tatsächlichen Produktstand, kanonische Dokumentation und Ausführungsgates
wieder in Übereinstimmung bringen. Kein neues Feature, kein Produktionsdeploy,
keine neue Architektur.

## 1 · Tatsächlicher Git- und Arbeitsstand

### Missionsbeginn

- HEAD `01909a4` auf `stabilization/2026-11-19`.
- Vier Worktrees: Hauptworktree plus `deploy_spatial_depth_slice`,
  `site_voice_chat_prompt` und `spatial_depth_embodiment` unter dem
  Antigravity-Worktree-Root.
- Die drei genannten Produkt-Commits wurden direkt geprüft:
  - `e8feda7` — adaptive Living Surface und Eye Motion, 29 Dateien.
  - `d2b737e` — erste subtile Spatial-Depth-Erweiterung, 8 Dateien.
  - `2fc876a` — Provider-Timeouts/Fallback und `verify-live.sh`, 5 Dateien.

### Während des Syncs vom bestehenden Orchestrator abgeschlossen

- `a6a8a00` — Slice A: ruhiger `error`-Zustand, Store, Augenprofil, Tests und
  Plan-Gate-Artefakte.
- `5a70997` — Transkript inhaltserhaltend als `docs/ai-avatare.txt` gesichert,
  Takeaway-Dokument und vorhandene Mobile-/Audio-Artefakte committet.
- `ea3bd2e` — Merge des aktivierten 2.5D-Spatial-Depth-Slices mit Slice A auf
  `integration/spatial-depth-error-state`.

Diese Commits wurden nicht von dieser Reality-Sync-Session erzeugt und nicht
rückwirkend verändert. Der Reality-Sync-Bericht und die unten genannten
kanonischen Korrekturen bilden einen eigenen, separat prüfbaren Arbeitsstand.

### Offene fremde Worktrees

`site_voice_chat_prompt` enthält eigene uncommittete Änderungen an
`docs/PROJECT.md`, `src/README.md`, einer Voice-Notiz, `src/voice/` und
`tests/voice-prompt.test.mjs`. Diese Arbeit wurde weder gelesen als aktuell
abgeschlossen behauptet noch verändert. Die übrigen beiden fremden Worktrees
waren beim Check sauber; `spatial_depth_embodiment` steht auf `4e0a838`.

## 2 · Verifizierter Produktstand

| Klasse | Feststellung |
| --- | --- |
| **VERIFIED** | Vanilla-ES-Module-Anwendung mit reaktiven Augen, Typewriter, Composer, Unterbrechen, validiertem Surface-State, kontextuellen Reglern, Undo/Reset, Provider-Fallback und sichtbarer DEV-DATA-Kennzeichnung. |
| **VERIFIED** | Ruhiger `error`-Zustand durch `store.js`, `presence.js` und `eye-motion-profiles.js`; verständliche Fehlermeldung und `aria-live`; Recovery per INPUT/SUBMIT. |
| **VERIFIED** | 2.5D ist mit CSS-/JS-Ebenen, Licht, Schatten, Parallaxe und gestaffelten Übergängen implementiert und im Merge aktiviert. Kein WebGL, keine Three.js-/3D-Engine. |
| **VERIFIED** | 279/279 Node-Tests auf Integrations-HEAD; 43/43 gezielte Slice-A-Tests; `validate.sh` grün. |
| **VERIFIED** | Lokaler Fehler-Browser-Smoke normal und Reduced Motion grün; erweiterter Spatial-Browser-Test für Default-Desktop, Bones-Desktop, Mobile und Reduced Motion grün. |
| **VERIFIED** | Öffentliche UI zeigt nach einem echten Browser-Turn `PONG`; `dev-badge` verborgen; Live-Region aktualisiert; keine Pageerrors. `verify-live.sh` meldet HTTP 200 mit echtem `text` von `minimax`. |
| **VERIFIED** | Aktive Cloudflare-Version zum Prüfzeitpunkt: `9e0c8e7f-777f-4981-9f37-98c6f1679a52` (Version 20). Bindings/Variablen: `AI`, `ASSETS`, `MINIMAX_MODEL`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `WORKERS_AI_MODEL`; Secret-Namen vorhanden, keine Secret-Werte erfasst. |
| **DOCUMENTED** | Produktvision, Designentscheidungen, alte Verträge, M1-Bericht und historische Messprotokolle. Sie sind keine automatisch aktuellen Funktionsnachweise. |
| **UNVERIFIED / NOT RUN** | Erneuter Voice-20-Turn-Lauf, aktuelle STT-Stabilität und neue `first_audio_ms`-Messung. |
| **UNVERIFIED / NOT RUN** | Fremdtest, DPPM/On-Demand-Agenten Ende zu Ende, serverautoritative Zwei-Tab-Synchronisation und langfristige Zustandsevolution. |
| **UNVERIFIED / NOT RUN** | Vollständige Spatial-Browser-Matrix auf der Produktions-URL; produktiv geprüft wurden UI, echter Agententurn und `verify-live.sh`. |
| **VERIFIED als Kleinbefund** | Lokaler `favicon.ico`-404 im Normalmodus; keine Pageerrors. Kein kausaler Zusammenhang mit Slice A oder Spatial Depth nachgewiesen. |

## 3 · Korrigierte kanonische Dokumente

- `README.md` — aktueller Funktionsumfang, 279 Tests, Provider-Kette und
  Live-Nachweis statt alter M1-Grenzen.
- `docs/PROJECT.md` — neuer verifizierter Kopf mit VERIFIED / DOCUMENTED /
  UNVERIFIED, Rebaseline-Verweis und klarer Historisierung der alten Planung.
- `src/README.md` — ersetzt „nur reservierter Code“ durch die tatsächliche
  Modulkarte einschließlich 2.5D-Abgrenzung.
- `tests/README.md` — ersetzt „keine Anwendungstests“ durch Suite, Kommandos,
  aktuelle Ergebnisse und fehlende Voice-/Fremdtest-Nachweise.
- `package.json` — Beschreibung entspricht wieder der lauffähigen Anwendung.
- `docs/EXECUTION_PLAN-M0-M5.md` — einziger vorgeschlagener Gesamtplan R0–R4,
  Gate-Klassifikation und OPEN OWNER DECISIONS; alter M0–M5-Verlauf bleibt als
  Historie erhalten.
- `tech/EXECUTION_PLAN-M1-MESSLAUF.md` — ausdrücklich historisches
  Voice-Task-Protokoll, kein zweiter Gesamtplan und keine aktuelle Freigabe.
- `docs/UNSOLVED-TECHNIK.md` — aktuelle Triage vor der historischen
  Warteschlange; U20 und U29 geklärt, Voice/Fremdtest nicht als bestanden markiert.
- `PLAN-VALIDATION-REPORT-mcode-reality-sync-2026-11-25.md` — zusätzliche
  unabhängige Validator-Evidenz auf Harness mcode/MiniMax-M3.

Es wurde keine neue Dokumentationshierarchie eingeführt.

## 4 · Execution-Plan-Konflikt und Gate-Entscheidung

Der Konflikt bestand aus dem Programm-Plan `docs/EXECUTION_PLAN-M0-M5.md` und
 dem Task-Plan `tech/EXECUTION_PLAN-M1-MESSLAUF.md`, die unterschiedliche M2–M5-
Bedeutungen und Voraussetzungen trugen. Der Reality Sync weist ihnen getrennte
Rollen zu:

1. **Ein vorgeschlagener Gesamtplan:** `docs/EXECUTION_PLAN-M0-M5.md`, R0–R4.
2. **Historisches M1-Protokoll:** `tech/EXECUTION_PLAN-M1-MESSLAUF.md` nur für
   eine spätere Voice-Reaktivierung.

Weiterhin verbindlich: Owner-Gates für Commit/Push/Deploy/Secrets,
Upstream-First, Council plus unabhängiges ACCEPT vor neuen Build-Lanes,
Continuous Authorize und ein Writer pro Integrationsstelle.

Nicht rückwirkend bestanden und nicht pauschal auf unabhängige UI-Arbeit
übertragbar: „M0 = kein Code“, Voice vor jedem UI-Slice und die alten
D-/O-Listen als automatische aktuelle Blocker oder Freigaben.

**OPEN OWNER DECISIONS:** Ratifizierung des Rebaseline-Plans, genauer Scope des
nächsten Spatial-Slices, Fremdtest als Expansions- oder Stable-Gate sowie Zeitpunkt
und Grenzen der Voice-/DPPM-Reaktivierung.

## 5 · Slice A — Validation Gap

- `PLAN-SLICE-A.md` und `UPSTREAM_SEARCH.md` vorhanden; Entscheidung `ADAPT`
  auf die bestehende Architektur, keine neue Dependency.
- Plan-SHA-256 `653e0b461b7dbc890a5461027a6a3cc67c577309e6dfc60a284daa145da3b3fe`
  entspricht exakt dem Hash im späteren Council-Artefakt.
- Lokales Ollama-Council: `SCORE_OK`, overall `0.854`, Threshold `0.75`, drei
  unterschiedliche Modelle. Der frühere `NO_JUDGMENT`-Lauf bleibt als eigene
  untracked Evidenz erhalten und wird nicht als Erfolg dargestellt.
- `PLAN_VALIDATION_REPORT.md`: `ACCEPT`, Attempt 1/2, Build Release `yes`.
- Zusätzlicher read-only Validator auf separatem Harness: mcode/MiniMax-M3,
  ebenfalls `ACCEPT`; Hash, Scope, Implementierung und aktuelle Evidenz geprüft.
- Ergebnis: **ACCEPT bestätigt**, nicht künstlich neu erzeugt. Governance-
  Einschränkung des Validators: Build und erster Gate-Report liegen im selben
  Commit; die zeitliche ACCEPT-vor-Build-Reihenfolge ist aus Git allein nicht
  separat nachweisbar.

## 6 · Tatsächlich ausgeführte Tests

| Prüfung | Ergebnis |
| --- | --- |
| `node --test tests/*.test.js deploy/agentfaehig-site/test/*.test.mjs` vor Spatial-Merge | 278/278 bestanden |
| Dasselbe Kommando auf Integrations-HEAD `ea3bd2e` | **279/279 bestanden, 0 fehlgeschlagen** |
| `node --test tests/store.test.js tests/eye-motion.test.js tests/remoteAgent.test.js` | **43/43 bestanden** |
| `bash scripts/validate.sh` zuerst | 1 Fehler: `docs/AI_Avatare` ohne Endung |
| `bash scripts/validate.sh` nach `docs/ai-avatare.txt` | **grün**, nur zwei Unterstrich-Hinweise, 0 Fehler |
| Lokaler Fehler-Browser-Smoke | `error`-Phase und Augenzustand, Fehlertext + Live-Region, Recovery und DEV-DATA-Kennzeichnung bestanden; Reduced Motion statisch |
| `tests/spatial-depth-browser.py` | Default-Desktop, Bones-Desktop, Mobile und Reduced Motion bestanden |
| `deploy/agentfaehig-site/verify-live.sh` | Alle Seiten-/Routenchecks grün; `/api/agent` HTTP 200 mit echtem `text` von `minimax` |
| Öffentlicher UI-Browser-Turn | `PONG` sichtbar, `dev-badge` verborgen, Live-Region aktualisiert, keine Pageerrors |

Der Spatial-Browser-Test benötigte einen Diagnose- und Wiederholungslauf:
zunächst ein Verbindungsfehler, danach ein Timeout beim Pair-Eintrag. Ein
separater diagnostischer Turn zeigte eine funktionierende Anwendung; der
anschließende unveränderte Testlauf war vollständig grün. Diese Vorgänge werden
nicht als anfänglich erfolgreiche Läufe dargestellt.

**NOT RUN:** Voice-20-Turn-Latenzlauf, Fremdtest, produktive Spatial-Matrix,
DPPM-/Zwei-Tab-/Persistenz-E2E und ein erneuter Rollback. Keine Pakete
installiert, keine Deployments ausgeführt.

## 7 · Untracked Arbeit und Commits

Folgende Dateien bleiben als fremde beziehungsweise historische Arbeitsstände
ungetrackt und wurden nicht gelöscht, verschoben oder committet:

| Pfad | Einordnung |
| --- | --- |
| `UPSTREAM-SEARCH-gespraechsfuehrung-klassifikator.md` | Fremde Gesprächsführungs-Recherche |
| `docs/PROMPT-ENTWURF-orchestrator.md` | Fremder Orchestrator-Entwurf zur Gesprächsführung |
| `docs/missions/M-20261120T001455-ce62b600-SPATIAL-DEPTH-METRIKEN.md` | Fremde Spatial-Metrik-Mission |
| `research/UPSTREAM-SEARCH-spatial-depth.md` | Fremde Spatial-Recherche |
| `tech/M0-DEPLOYED-ANALYSE-2026-11-20.md` | Fremde M0-Analyse |
| `tech/evidence/grade-PLAN-SLICE-A-no_judgment-20261125T175512Z.json` | Historischer, nicht erfolgreicher Council-Versuch; bewusst nicht als Erfolg committet |

Gesicherte Produkt-Commits des bestehenden Orchestrators: `a6a8a00`, `5a70997`
und `ea3bd2e`. Der Reality-Sync-Commit enthält ausschließlich die oben
genannten kanonischen Dokumente und diesen Bericht. Kein Stash, Reset, Push,
Pauschal-Löschung oder Eingriff in fremde Worktrees.

## 8 · Blocker, Evidence Debt und nächster Schritt

### BLOCKER für einen neuen Spatial-Slice

- Exakter Slice-Scope und Ratifizierung des Rebaseline-Plans durch Samuel fehlen.
- Für neuen Feature-Code fehlen dessen eigene Upstream- und Plan-Gates.

Das sind Auftrags-/Gate-Blocker, keine nachgewiesenen technischen Blocker der
vorhandenen Living Surface.

### EVIDENCE DEBT

Voice-Messung, Fremdtest, produktive Spatial-Matrix, DPPM-/Persistenz-E2E und
`favicon.ico`-404. Keiner dieser Punkte wird ohne belegten technischen
Zusammenhang als pauschaler UI-Blocker behandelt.

### FUTURE WORK

Voice-/DPPM-Reaktivierung, langfristige Zustandsevolution, weitere Pathways,
Pilot/Stable und ein erneuter Rollback.

**Genau ein empfohlener Implementierungsschritt:** Samuel legt den Umfang des
einen nächsten räumlichen Vertical Slice fest und ratifiziert dabei den
Rebaseline-Plan; erst danach Upstream- und Plan-Gates für genau diesen Slice.
