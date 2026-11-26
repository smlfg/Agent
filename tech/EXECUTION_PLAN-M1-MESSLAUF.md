# Execution Plan — Agentfähig v1 (historisches M1-Task-Protokoll)

Ursprünglicher Stand: 19.11.2026. Status am Reality Sync 25.11.2026:
**HISTORISCH — nur Task-Protokoll für den Voice-Messlauf, kein aktueller
Gesamt-Execution-Plan und keine aktuelle Build-Freigabe.**

Der alleinige vorgeschlagene Gesamtplan steht in
[`docs/EXECUTION_PLAN-M0-M5.md`](../docs/EXECUTION_PLAN-M0-M5.md). Diese Datei
bleibt unverändert in ihrer historischen Begründung erhalten. Der Voice-Lauf
wurde im Reality Sync **nicht erneut ausgeführt** und gilt nicht als bestanden.
Seine historischen Voraussetzungen werden nicht pauschal auf unabhängige
UI-/Spatial-Slices übertragen; eine Reaktivierung erfolgt nur mit eigenem Plan
und den dann gültigen Owner-Gates.

## 0 · Historischer Geltungsbereich dieses Plans (19.11.2026)

Der Contract existiert, ist aber **`VORSCHLAG — nicht genehmigt`**
(`PROJECT_CONTRACT.md:3`, Sign-off `:331–337` leer, O1–O11 unbeantwortet).

Daraus folgt für die Ausführung:

| Bereich | Status | Begründung |
|---|---|---|
| **D1 (Messlauf)** | **ausführbar** | separat autorisiert durch [`MESSLAUF-PLAN.md`](MESSLAUF-PLAN.md) (`ACCEPT`, Build Release `allowed`) plus Owner-Freigabe für Klon und Lauf |
| **D2–D5** | **geplant, nicht startbar** | `F4`: eine offene Entscheidung O2–O11 beim D2-Start ⇒ **STOP**. `§9`: „Der Vertrag ist erst gültig, wenn jede Zeile beantwortet ist." |

Damit ist die Reihenfolge nicht Geschmack, sondern Vertragsmechanik: D1 ist das
einzige Tor, das offen ist, und es ist gleichzeitig das Tor vor jedem App-Code
(`AC-D1-6`, ADR-0001).

**Zwei Punkte, die ich nicht still entscheide:**

1. **D1-Abnahme ist noch nicht bindend.** Solange der Contract unsigniert ist,
   sind AC-D1-1 bis AC-D1-7 Empfehlungen. Ich messe trotzdem gegen sie, weil ein
   zweiter Lauf teurer wäre als eine späte Signatur.
2. **O3 und O4 berühren D1.** O3 legt fest, dass das Latenzkriterium ein
   *Messergebnis* ist (nicht vorab „1 s") — das ist die Arbeitsgrundlage von T5.
   O4 legt die Textkanal-Sprache fest; AC-D1-4 misst den Textpfad, die Sprache
   beeinflusst die Messung aber nicht.

## 1 · Ausgangszustand (belegt, 19.11.2026)

| Befund | Beleg |
|---|---|
| Klon installiert, Dev-Server läuft | `~/Projects/05_INBOX/cloudflare-agents`, `curl localhost:5173` → 200 |
| Nur eine Klon-Änderung | `git diff` → `+ @modelcontextprotocol/client` (Install-Fix, kein Code) |
| Auth + Scope `ai (write)` | `wrangler whoami` |
| Account-Plan **Free** | [`MESSPROTOKOLL-2026-11-19.md`](MESSPROTOKOLL-2026-11-19.md) Z. 18, 33 |
| **Laufversuch 1 gescheitert** | ebd. Z. 21–39: `AI_APICallError 5035`, 5 User / 0 Assistant **im Fenster 17:47–17:50** (später enthält dieselbe Tabelle eine fremde Session mit 5 Assistant-Antworten; Gegenprüfung am Ende des Protokolls), keine `turn_metrics` |
| Ursache | `examples/voice-agent/src/server.ts:139` → Paid-only-Modell |
| Fehler ist vertragskonform protokolliert | entspricht `AC-D1-7` (BLOCKED mit Fehlerauszug, kein Ersatzwert) |
| SDK liefert die geforderten Werte | `agents/dist/types-_Faxb570.d.ts:183–235`: `metrics{…}` + `turn_metrics{speechStartToFinalMs, modelToFirstTextMs, ttsToFirstAudioMs, turnTotalMs, outcome}` |
| **UI zeigt nur 4 Werte** | `src/client.tsx:252–270`; `turn_metrics` wird nicht gerendert |
| Protokoll-Tabelle leer | ebd. Z. 45–66 |

Der gescheiterte Lauf bleibt sichtbar. Er wird nicht durch einen neuen Task
verdeckt, sondern ist die Begründung für T1.

## 2 · Voraussetzungen (vor T1 zu klären)

| # | Voraussetzung | Blockiert |
|---|---|---|
| P1 | Free-fähiges, nicht abgekündigtes Modell gewählt (`glm-4.7-flash` oder `gpt-oss-20b`) | T1 |
| P2 | Erfassungsweg für `model→first-text` und `tts→first-audio` belegt (AC-D1-2) | T2 — ohne ihn wäre der 20-Turn-Lauf nicht abnahmefähig |
| P3 | Contract-Signatur inkl. O1–O11 | D2–D5 |

P1 und P2 löst T1 selbst. P3 ist eine Owner-Entscheidung, kein Engineering-Task.

## 3 · Meilensteine (fünf, = die fünf Deliverables)

| # | Meilenstein | Exit-Kriterium | Abhängig von |
|---|---|---|---|
| **M1** | **D1 — Gate G1** | 20 Voice-Turns + Textpfad im Protokoll, Statistik reproduzierbar, `docs/LATENCY-CRITERIA.md` signiert | P1, P2 |
| **M2** | **D3 — Zustandsvertrag** | `docs/STATE_CONTRACT.md` + `seq`/Uhr/Projektionen implementiert, Tests grün | M1, P3 |
| **M3** | **D2 — v1-App ausgeliefert** | URL ohne Login, AC-D2-1…12 auf dem Deploy | M2 (AC-D2 setzt D3 voraus), P3 |
| **M4** | **D4 — Tests + Evidenz** | Offline-Suite grün, E2E auf URL, Evidenzpaket vollständig | M3 |
| **M5** | **D5 — Fremdtest** | ≥ 2/3 nach AC-D5-3, Bericht + Einwilligungen | M4, eingefrorener Deploy |

**Abweichung vom Contract, bewusst:** `§6` sagt „D3 parallel zu D2". Beide
schreiben in `src/`; das verletzt „ein Writer pro Artefakt". Ich plane D3
**vor** D2. Das kostet keine Zeit, weil AC-D2-* den Zustandsvertrag ohnehin
voraussetzt (`§6`: „D2 wird nicht abgenommen, bevor D3 steht").

## 4 · Arbeitspakete

### M1 — D1 (im Detail geplant)

| ID | Ziel | Komponenten | Voraussetzung | Ergebnis | Validierung | Done |
|---|---|---|---|---|---|---|
| **T1** | Modellwechsel + **ein** Turn mit Stage-Timings | Klon `src/server.ts:139`, Browser, Protokoll | P1 | Protokollabschnitt „Laufversuch 2" mit vollständiger Zeile | Werte aus UI **und** WS-Frame stimmen überein; Modell mit Datei:Zeile belegt | Zeile vollständig, `Outcome=completed`, Erfassungsweg dokumentiert |
| T2 | 20 Voice-Turns | Protokoll | T1 grün | 20 Zeilen, Rohwerte | Zählung = 20; Abbrüche mit Grund | AC-D1-1, AC-D1-2 erfüllt |
| T3 | Textpfad separat messen | `sendText` des Beispiels | T1 (Erfassungsweg) | Text-Turn-Zeile mit `model→first-text` | nicht aus Voice-Summe abgeleitet | AC-D1-4 erfüllt |
| T4 | Statistik-Skript | `tech/` (erlaubt nach AC-D1-6) | T2, T3 | Skript + Ausgabe im Repo | zweiter Lauf, identische Werte | AC-D1-3 erfüllt |
| T5 | Latenzkriterium + Signatur | `docs/LATENCY-CRITERIA.md` | T4 | Metrik, Perzentil, Schwelle, Kontext, Datum | Owner-Signatur | AC-D1-5 erfüllt, Gate G1 zu |

### M2–M5 (bewusst nur auf Deliverable-Ebene)

Nicht in Tasks zerlegt. Grund: Der Contract ist unsigniert (P3), und D1 kann die
Modell-/Architekturwahl verändern (F1, F2). Detailplanung jetzt wäre Arbeit auf
Vermutung. Zerlegung erfolgt nach M1, gegen den dann signierten Contract.

## 5 · Vertical Slice

Der Slice ist **ein vollständiger Voice-Turn mit vollständiger Messung**:
Mikrofon-Klick → Sprache → Transkript → **Free-fähiges Modell** → TTS → hörbare
Antwort → `llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms`, `model→first-text`,
`tts→first-audio` → Protokollzeile.

Er schneidet alle Schichten und endet an einem beobachtbaren Ergebnis. Er
beantwortet die zwei Fragen, die über den ganzen 20-Turn-Lauf entscheiden:
Trägt der Free-Plan den LLM-Pfad? Und ist AC-D1-2 überhaupt erfassbar?

Warum nicht „20 Turns" als Slice: Laufversuch 1 hat genau das widerlegt —
20 Turns mit falschem Modell sind 20-mal derselbe Fehler und null Messwerte.

## 6 · Exakt nächstes Arbeitspaket: T1

**Ziel (ein Satz):** Nach dem Modellwechsel auf ein Free-fähiges Modell **einen**
englischen Voice-Turn durchführen und alle sieben geforderten Werte als
Protokollzeile festhalten.

**Non-Goal:** keine 20 Turns, keine Textpfad-Messung, kein Statistik-Skript,
kein Umbau des Beispiels außer der einen Modellzeile, kein Deploy, kein
Anwendungscode in `src/`.

**Boundaries:** Schreiben nur `tech/MESSPROTOKOLL-2026-11-19.md`. Klon nur lesen
außer `src/server.ts:139`.

**Schritte:**

1. Ausgangszustand notieren: Protokoll endet mit gescheitertem Laufversuch 1.
2. Modell in `examples/voice-agent/src/server.ts:139` auf ein Free-fähiges,
   nicht abgekündigtes Modell setzen — eine Zeile, Diff festhalten.
3. Server neu starten.
4. Einen englischen Wechsel sprechen (z. B. „What time is it?").
5. Die vier UI-Werte ablesen.
6. `turn_metrics` aus dem WebSocket-Frame lesen (DevTools → Network → WS).
7. Modell, Diff, Werte, `Outcome`, Konsolenfehler protokollieren.
8. Wenn Schritt 6 nicht ohne Codeänderung gelingt: das als Befund notieren und
   T1 mit `BLOCKED` (Erfassungsweg) beenden — **nicht** ad hoc Instrumentierung
   einbauen.

**Abnahmekriterien:**

- Sieben Werte vorhanden oder mit genanntem Grund als „nicht erfasst" markiert
  (AC-D1-2, nie geschätzt).
- Modellwechsel mit Datei:Zeile und Diff belegt.
- UI-Wert und WS-Wert für `first_audio_ms` stimmen überein.
- `Outcome` gesetzt; bei Fehlschlag Fehlerauszug im Protokoll (AC-D1-7).
- `bash scripts/validate.sh` läuft durch.

**Stop-Kriterien:**

- Erneute Paid-/Key-Wand → **BLOCKED**, Rückfrage (F6).
- Kein Ton nach ~1 h Fehlersuche → **BLOCKED** mit Log-Auszug, kein Fork
  (`MESSLAUF-PLAN.md` Z. 176–177).
- Budget Phase 0 + 1 ≤ 2 h gesamt; Laufversuch 1 hat bereits verbraucht.

## 7 · Parallelisierung

Keine. Ein Writer (Protokoll), ein linearer Pfad. Zulässig wäre Parallelität nur
bei disjunkten Dateien, geklärten Schnittstellen und benanntem
Integrationsverantwortlichen — trifft auf keinen Task zu. Der Contract-Wunsch
„D3 parallel zu D2" wird aus demselben Grund sequenziert (§3).

## 8 · Backlog (verändert den Scope nicht)

| ID | Punkt | Warum nicht jetzt |
|---|---|---|
| B1 | Contract signieren, O1–O11 beantworten | Owner-Entscheidung, blockiert D2–D5 (P3) |
| B2 | Plan-Hash an heutigen Plan binden | Freigabe-Hygiene, kein Messblocker |
| B3 | `~/Control/ACTIVE_PROJECTS.md` anlegen | außerhalb des Write-Roots |
| B4 | Doppeltes Machbarkeitsdokument zusammenführen | Doku-Schuld |
| B5 | `docs/PLAN-STUFEN-0-5.md:82` auf Englisch korrigieren | ohne Wirkung auf D1 |
| B6 | O4 entscheiden (Textkanal Deutsch/Englisch) | beeinflusst D2-UI, nicht D1-Messung |

## 9 · Session-Protokoll (Vorlage)

```
Ziel:            <ein primäres Ziel>
Geändert:        <Dateien, jeweils mit Grund>
Verifiziert:     <Befehl/Beobachtung → Ergebnis>
Offen:           <was nicht verifiziert wurde, mit Grund>
Nächster Schritt:<genau einer>
```

### Session 1 (19.11.2026) — Planung

```
Ziel:            Execution Plan gegen den echten Contract erstellen
Geändert:        tech/EXECUTION_PLAN-M1-MESSLAUF.md (neu) — Planung, kein Code
Verifiziert:     Contract gelesen (Status VORSCHLAG, O1–O11 offen);
                 gescheiterten Laufversuch 1 im Protokoll bestätigt;
                 AC-D1-2 gegen SDK-Typen und UI geprüft → Stage-Timings
                 nicht in der UI sichtbar; validate.sh → OK
Offen:           Contract-Signatur (P3), Modellwahl (P1), Erfassungsweg (P2)
Nächster Schritt:T1 nach Owner-Freigabe
```

### Session 2 (19.11.2026) — T1, teilweise

```
Ziel:            T1 — ein Turn mit Modellwechsel und vollständiger Messung
Geändert:        Klon: src/server.ts:139 (eine Zeile, deepseek → glm-4.7-flash)
                 tech/MESSPROTOKOLL: Abschnitt "Laufversuch 2"
Verifiziert:     Server neu gestartet, HTTP 200; zwei Text-Turns beantwortet,
                 keine Konsolenfehler → Free-Plan trägt glm-4.7-flash (P1 ✅)
                 Metriken: UI zeigt keine, Network-Capture 0 Frames,
                 Observability-Store ohne Werte → AC-D1-2 nicht erfassbar
Offen:           Erfassungsweg (P2) — BLOCKED; Voice-Turn nicht durchgeführt
Nächster Schritt:Erfassungsweg entscheiden, dann ein Voice-Turn (T1 abschließen)
```
