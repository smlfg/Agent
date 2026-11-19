# PLAN_VALIDATION_REPORT

Stand: 19.11.2026 — Gate-Agent (Plan-Validator), gemäß
[PLAN_ACCEPTANCE_GATE.md](../../../docs/PLAN_ACCEPTANCE_GATE.md).

## Verdict

ACCEPT

## Checked Plan

`~/Projects/03_HAI/Agentfaehig/Agent/tech/MESSLAUF-PLAN.md`

Plan-Council-Evidenz (Input, kein Ersatz für dieses Verdict):
`~/Projects/03_HAI/workbench/plan-council/out/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`
— Kopie im Projekt: [`tech/evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`](evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json) —
Overall 0.792 ≥ Threshold 0.75, Verdict SCORE_OK, `plan_path` und `plan_sha256`
passen zum geprüften Plan. Council-Abweichung dokumentiert: 3 statt 4 Jurymodelle
(`qwen3.5:35b` nicht installiert); Threshold trotzdem klar erreicht.

## Attempt

1/2

## Findings

**Kriterien aus dem Vertrag:**

- **Scope klar:** Einstufiger Messlauf (20 englische Sprach-Wechsel) gegen das
  vorgefundene Beispiel, nur Konfiguration, kein Eigenbau (Plan Z. 86–94).
  Kein Feature-/App-Code → Upstream-First-Gate greift für den Lauf nicht;
  `UPSTREAM-SEARCH-cloudflare.md` (Klon-Ziel, Beispiel-URL) existiert trotzdem
  als Beleg.
- **DoD messbar:** Protokolldatei `tech/MESSPROTOKOLL-<Datum>.md` mit je Wechsel
  einer Zeile (`llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms`, Outcome);
  Auswertung Min/Median/P90 von `first_audio_ms` gegen drei benannte
  Vergleichspunkte (Cloudflare-Budget 890 ms — verifiziert in
  `CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md` Z. 73–81; Skizze „under 1 sec"; Pipecat-Referenz
  in `research/konkurrenz.md`). Latenz-Kriterien bewusst erst aus Messwerten
  abgeleitet (Plan Z. 169–170). Keine vorab erfundenen Zahlen.
- **Non-Goals klar:** Kein Deploy, keine Build-/Provider-Entscheidung aus einem
  Lauf, keine Schreibzugriffe außerhalb `tech/` (Plan Z. 86–94). Deutsch ist
  sauber geparkt mit reaktivierbarem Pfad und abgeschlossener Kostenrecherche
  (Plan Z. 143–158).
- **Boundaries klar:** Write-Root `tech/` für Plan und Protokoll; Klon-Ziel
  `~/Projects/05_INBOX/cloudflare-agents` gemäß
  `UPSTREAM-SEARCH-cloudflare.md`; Owner-Freigabe für Klon und Lauf liegt vor
  (19.11., „mit Validator"), im Plan als Pflicht geführt (Plan Z. 98–101).

**Risikobehandlung (Prüfkriterien aus dem Dispatch):**

- **Free/Paid:** Annahme Free ist explizit und folgt Samuels Entscheidung; der
  LLM-Tausch im Klon auf ein Free-fähiges Modell (`glm-4.7-flash`,
  `gpt-oss-20b`, beide ohne Deprecation) ist als erwarteter Schritt geplant,
  nicht nur als Ausweichpfad; Account-Status wird im Lauf geprüft und
  protokolliert (Plan Z. 104–112). Paid- oder Key-Wand ohne Freigabe → Stop und
  Rückfrage (Plan Z. 178). Ausreichend.
- **wrangler-Auth:** Als offener Punkt geführt mit Prüf-und-Protokollier-Pflicht
  in Phase 0 (Plan Z. 113–115, 183). Genau das ist der schwächste
  Council-Metric (feasibility 0.667) — der Plan trägt dem Rechnung, statt die
  Annahme stillschweigend zu treffen. Ausreichend für einen Messlauf.
- **Beta:** Cloudflare Realtime Agents (WebRTC, offene Beta) ist nur
  dokumentierte Reserve, kein Teil des Laufs (Plan Z. 138–141). Kein
  Beta-Risiko im Execution-Pfad.
- **Drift:** Gering. Messwerte fließen zurück in `docs/DESIGN-DECISIONS.md`,
  keine Entscheidung aus einem Lauf; Stopp-Kriterien BLOCKED bei ~1 h
  Fehlersuche ohne Debugging-Fork, Budget ≤ 2 h sichtbar (Plan Z. 172–178).

**Kleine, nicht-blockierende Anmerkungen (kein REPLAN-Grund):**

- Clone-Ziel hat einen Nebensatz „auf Wunsch Samuels auch innerhalb des
  Projekts" (Plan Z. 100) — Default ist eindeutig (05_INBOX); nur relevant,
  falls Samuel im Lauf abweicht. Continuous-Authorize deckt diesen Fall.
- Der LLM-Tausch im Klon ist eine Minimaländerung am Beispiel-Code
  (Modell-ID); der Plan führt sie unter „konfiguriert, nicht erweitert". Im
  Execution-Report sollte die geänderte Zeile als Evidenz protokolliert werden.
- Council-Judge `qwen3:8b` (0.562) kritisiert fehlendes Budget — das Budget
  steht explizit in Plan Z. 174–175; die Kritik ist durch den Plan widerlegt.

## Replan Instructions

(nicht applicable — Verdict ACCEPT)

## Build Release

allowed: yes

## Nachtrag 19.11.2026 (nach dem Verdict, ändert es nicht)

Beim Nachprüfen am Abend festgestellt: Das Council-Artefakt trägt
`plan_sha256: 29e81d628928e85ee58575ea5fb6e987c6aae2f04a455303845bdfe94e2f2f52`,
die heutige `tech/MESSLAUF-PLAN.md` hat
`a10b394c7c9c47f1afc03ccf0d77e48b305c0b116244ffa493e22686b0449d0f`.

Der Plan wurde also nach dem Scoring (15:29) noch geändert. Der Abschnitt
„Plan-Council-Evidenz" oben behauptet, `plan_sha256` passe zum geprüften Plan —
das gilt nur für die Fassung von 15:29, nicht für die heutige Datei.

**Folge:** Dieses ACCEPT ist an keine prüfbare Planfassung gebunden. Es wird
nicht stillschweigend weiterverwendet. Vor Laufversuch 2 entweder neu scoren
(neuer Score, Attempt 2/2) oder die Abweichung als Finding im Contract
ausweisen — Fehlerklasse wie `fails/0021-plan-validation-anchor-drift.json`.
Inhaltlich unterscheiden sich die Fassungen im geprüften Umfang nicht
(Scope, DoD, Non-Goals unverändert); belegt ist das damit nicht.
