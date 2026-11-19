# HANDOFF — Upstream-Grenzen für das Risikoregister (19.11.2026, Abend)

Status: **nicht eingebaut.** Grund: `docs/EXECUTION_PLAN-M0-M5.md` und
`docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md` wurden während dieser Prüfung von einer
parallelen Session bearbeitet (mtime 19.11. 20:05 bzw. 16:18). Ein Einfügen
hätte einen fremden Stand überschrieben. Dieser Handoff enthält den fertigen
Text zum Einfügen — er ist bewusst kein zweites Risikoregister.

Herkunft: Machbarkeitsprüfung gegen Upstream-Doku, 19.11.2026.
Rohbericht (flüchtig, nicht versioniert): `graphify-out/prebuild/S7-technische-grenzen.md`.

Belegstand: **VERIFIED** = gegen Upstream-Doku geprüft · **RECOMMENDED** =
begründete Empfehlung, nicht beschlossen.

## Patch 1 — fünf Risiken, die im Register R1–R12 fehlen

Einfügen nach `R12` in `docs/EXECUTION_PLAN-M0-M5.md` §6, gleiches Spaltenformat.

| ID | Risiko | Eintritt | Wirkung | Frühwarnung | Gegenmaßnahme | Verantwortlich |
|---|---|---|---|---|---|---|
| **R13** | **Queues als Echtzeit-Transport** (falls Hintergrund-Agenten gebaut werden): Standard-Batch-Timeout 5 s (konfigurierbar 0–60 s), keine Reihenfolgegarantie, Doppelzustellung möglich | M | hoch | Antwort kommt Sekunden nach dem Turn | DO-RPC / `subAgent` für turns-nahe Arbeit; Queues nur für Aufträge, die Sekunden bis Minuten warten dürfen | Agent |
| **R14** | **Rate-Limit trägt keine vier Rollen:** 20 req/min pro Account und Modell bei Paid-Textmodellen → 4 Rollen = 5 Turns/min global | H (bei Multi-Agent) | hoch | 429 bei zwei gleichzeitigen Besuchern | Rollen serialisieren oder Front-Modell klein halten; max. 6 ausgehende Verbindungen pro Request beachten | Agent |
| **R15** | **Gedächtnis zur Laufzeit** (falls geplant): Notion 180 req/min = 3/s **workspace-weit**, 429 mit `Retry-After` bis 60 s; Vectorize ist **asynchron** (Write-Ahead-Log, Index-Job, „at least an hour" bei 250k Inserts) | M | hoch | erste Drosselung im Test; „geschrieben, nicht lesbar" | DO-SQLite als Source of Truth; Notion nur asynchron als Wissensspiegel; Vectorize nie als primäre Lesequelle im selben Turn | Agent + Owner |
| **R16** | **Token-Eigenbau größer als nötig:** ohne Upstream-Standard 100–160 Zeilen | M | mittel | Token-Datei wächst über 60 Zeilen | W3C DTCG Format Module (Dateiformat) + `colorjs.io` (WCAG-Kontrast) nutzen → **32–48 Zeilen** statt 100–160 (RECOMMENDED, −52…−80 %) | Agent |
| **R17** | **Kontrastbruch über den Regelweg:** warm↔cold in HSL läuft um Faktor **2,25×** auseinander; in OKLCH mit konstantem L nur +3,4–3,5 % (niedriges Chroma), +14–15 % bei gesättigten Akzenten | M | mittel | Regler am Anschlag schwer lesbar | OKLCH mit konstantem L, Kontrastprüfung mit `colorjs.io` (WCAG 2.2, 4,5:1) | Agent |

## Patch 2 — Latenz-Zahlen präzisieren

Betrifft `docs/EXECUTION_PLAN-M0-M5.md` §6 (R5) und
`docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`: dort steht „800–950 ms". Vollständig (VERIFIED):

- Cloudflares **eigenes Budget summiert 890 ms** (40 + 300 + 400 + 150), bevor Overhead beginnt.
- Veröffentlichtes Doku-Beispiel: **950 ms** bis zum ersten Audio (`first_audio_ms`), **1.200 ms** für den ganzen Turn (`total_ms`).
- Damit ist „unter 800 ms" schon in der Addition gerissen und „unter 1 s fertig" am dokumentierten Beispiel nicht erreichbar.

Konsequenz für die Abnahme: Kriterium auf **Time-to-First-Audio** schneiden; „für die ganze Antwort" ist kein haltbares Kriterium.

## Patch 3 — deutscher TTS: Ergänzung zu ADR-0001

ADR-0001 nennt die Lage korrekt. Ergänzung (VERIFIED, Workers-AI-Katalog,
Stand 19.11.2026):

- `aura-1`: Englisch, 12 Stimmen, keine `language`-Option.
- `aura-2`: nur `en` und `es`.
- `melotts`: kann laut Upstream kein Deutsch und ist **ab 20.11.2026 abgekündigt** — fällt einen Tag nach diesem Handoff weg.
- Deepgram hat deutsche Aura-2-Stimmen, Cloudflare exportiert sie aber nicht.
- ADR-0001 nennt bereits den billigsten Ausweg (`TTSProvider`-Adapter, ≈15 Zeilen) — dieser bleibt vor einem Anbieterwechsel zu prüfen.

## Nicht in diesem Handoff

- Die Messung selbst (gehört in `tech/MESSPROTOKOLL-2026-11-19.md` bzw. M1).
- Der Segment- und Zeitvertrag → eigenes [`docs/adr/ADR-0006-zeitvertrag.md`](../adr/ADR-0006-zeitvertrag.md).
