# Session-Disziplin v1 — Design-Entwurf

Status: Workbench-Variante, read-only, NICHT implementiert
Owner: Samuel Fleig
Datum: 2026-09-17

## Goal (1 Satz)

Wenn Samuel keine Disziplin hat, hält der Agent sie — **durch HAI, nicht durch Zwang**.

## Non-Goal

- Kein Code, kein Push, nur Design.
- Kein fail-closed Write-Gate (08.09.-Entscheidung „kein Zwang" bleibt gültig).
- Keine Änderung an Qualifikation oder Transport-Fails.

## Der Mittelweg (Kernentscheidung)

Am 08.09. wurde „Zwang am Agenten" abgelehnt („zu viel Ritual", „je besser der Agent, desto
weniger nötig"). Gleichzeitig ruft der Agent Urteils-Tools nie selbst (drift_check 0–2× in 133
Sessions). Die Auflösung trennt zwei Adressaten sauber:

| Mechanismus | Für wen | Was es ist |
|---|---|---|
| Voice-Intake → `hai_distill` | **Samuel** | Denkwerkzeug: echter Gedanke statt Copy-Paste |
| Schreib-Hook → `hai_check_activity` | **Agent** | Sensor auf Scope, weil der Agent sich nie selbst prüft |
| `hai_health` am Start | **System** | Alive-Ping, weder noch |

Kernsatz: **Für Samuel darf es verpflichtend sein (sein Ritual, sein Wunsch). Für den Agenten
bleibt es schubsen, nicht blockieren.**

## Drei Hooks

1. **SessionStart** → `hai_health` (verpflichtend, fail-open).
   Server nicht erreichbar → sichtbar `DEGRADED`, weiterarbeiten, nie blockieren.
   Zusätzlich: Reminder an Samuel für den Voice-Gedanken (Intake), kein Gate.
2. **Erste Datei-Schreib** (PreToolUse auf Write/Edit) → `hai_check_activity`, fail-open.
   Bei Scope-Bruch genau **eine Zeile** injizieren: `[HAI] write außerhalb der Mission → prüfen
   oder parken`. Kein `deny`. Besserer Trigger als M1s Heuristik (25 Calls ohne Checkpoint),
   weil der Schreib-Moment genau der Moment ist, in dem Scope zählt.
3. **Abhängigkeit:** `hai_check_activity` braucht eine Lease. Ohne aktive Mission ist der
   Schreib-Hook ein No-op — er erzwingt Scope nur für mission-gesteuerte Arbeit, keine Missionen
   für alles.

## Stufenlogik (erst schubsen, dann evtl. blockieren)

- Stufe 1 (jetzt): Sensor, fail-open, eine Zeile. Eval-Log messen, ob er richtig feuert.
- Stufe 2 (nur nach Evidenz): `permissionDecision: deny` — der harte Gate kommt erst, wenn das
  Eval zeigt, dass der Sensor sauber feuert. Das war M1s eigener Stufenplan.

## Distill: a primär, b als Vorschlag

- (a) Samuel spricht den Gedanken und entscheidet das Distill selbst — behält das Denken.
- (b) Der Agent transkribiert und **schlägt** ein Distill vor; Samuel nickt ab.
- Technisch: `hai_intake` (roh) → Agent-Vorschlag → `hai_accept_next_step` (Owner-Nonce = Samuels Urteil).

## Offen / entschieden

- Adressaten-Trennung: entschieden (siehe Tabelle).
- Fail-open vs. fail-closed am Schreib-Hook: **fail-open** (Stufe 1).
- Harness-Reihenfolge: noch offen — Codex ist der echte HAI-Nutzer (49 vs. ~1300), also Codex
  zuerst, nicht Claude Code (der Design-Vertrag nannte Claude Code als Referenz, die Realität ist Codex).

## Nächster Schritt

Build-Slice nur nach Plan-Council → Plan-Acceptance → Continuous-Authorize. Noch nicht gestartet.
