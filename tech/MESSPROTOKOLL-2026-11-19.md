# Messprotokoll: Voice-Lauf examples/voice-agent (Englisch)

Datum: 19.11.2026. Plan: [MESSLAUF-PLAN.md](MESSLAUF-PLAN.md), Verdict des
Plan-Validators: ACCEPT ([PLAN_VALIDATION_REPORT.md](PLAN_VALIDATION_REPORT.md),
Attempt 1/2, Build Release: allowed). Council-Score: 0.792 (SCORE_OK, 3 Jurymodelle,
Evidence: `03_HAI/workbench/plan-council/out/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`,
Kopie im Projekt: [`evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json`](evidence/grade-MESSLAUF-PLAN-score_ok-20261119T152952Z.json)).

## Setup-Belege (Phase 0)

| Punkt | Befund |
|---|---|
| Node | v22.23.1 (Vorgabe: 18+) ✅ |
| Klon | `git clone --depth 1 https://github.com/cloudflare/agents` → `~/Projects/05_INBOX/cloudflare-agents` (Owner-Freigabe 19.11.) |
| Install | `npm install --legacy-peer-deps` — **Abweichung 1 vom unveränderten Beispiel:** Upstream-Peer-Konflikt (`agents@0.33.0` ↔ `react@19.3.1`, ERESOLVE); nur Install-Flag, keine Code-Änderung |
| Fix 2 | Erster Server-Start scheiterte: `agents` importiert `@modelcontextprotocol/client@2.4.0` (optionaler Peer), den `--legacy-peer-deps` überspringt. **Abweichung 2:** Paket explizit installiert (`npm i --legacy-peer-deps @modelcontextprotocol/client@2.4.0`, trägt sich in package.json des Klons ein) — Install-Fix, kein Code geändert |
| Auth | `npx wrangler whoami`: eingeloggt (OAuth, Account smlflg@gmail.com, Scope `ai (write)` vorhanden) ✅ — der offene Punkt „Remote-Binding-Auth" ist damit geklärt |
| Account-Plan | Annahme Free (Samuel: „free ist immer besser als paid"); klärt sich am Lauf des Default-LLMs (`deepseek-v4.1-flash-1017`, Paid-only) |
| Start | `npm run start` (vite dev; Worker + DO lokal, KI-Inferenz remote) |

## Messwerte (20 englische Sprach-Wechsel)

Rohwerte, ungeschönt. Turns nur mit Begründung aussortiert (Spalte „Befund").

| # | llm_ms | tts_ms | first_audio_ms | total_ms | speech→transcript | model→first-text | tts→first-audio | Outcome | Befund |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |
| 4 | | | | | | | | | |
| 5 | | | | | | | | | |
| 6 | | | | | | | | | |
| 7 | | | | | | | | | |
| 8 | | | | | | | | | |
| 9 | | | | | | | | | |
| 10 | | | | | | | | | |
| 11 | | | | | | | | | |
| 12 | | | | | | | | | |
| 13 | | | | | | | | | |
| 14 | | | | | | | | | |
| 15 | | | | | | | | | |
| 16 | | | | | | | | | |
| 17 | | | | | | | | | |
| 18 | | | | | | | | | |
| 19 | | | | | | | | | |
| 20 | | | | | | | | | |

Stille-Erkennung (Beobachtungen): _hier notieren_
Konsolen-/Serverfehler: _hier notieren_

## Auswertung (wird nach dem Lauf gefüllt)

- Min / Median / P90 von `first_audio_ms`: _folgt_
- Vergleich: Cloudflare-Budget 890 ms · Skizzenwunsch „under 1 sec" · Pipecat-Referenz 500–800 ms
- Latenz-Kriterien aus den Messwerten ableiten (nicht vorab erfunden)
