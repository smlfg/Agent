# UNSOLVED — Handoff der unabhängigen Verifikation (19.11.2026, 20:15)

**Nicht die Hauptliste.** Die Entscheidungswarteschlangen liegen in
[`docs/UNSOLVED-TECHNIK.md`](../UNSOLVED-TECHNIK.md) (Technik/Planung) und
[`docs/UNSOLVED-PLANUNG.md`](../UNSOLVED-PLANUNG.md) (Produkt/Wireframes, `U-01…`). Beide wurden während
dieser Konsolidierung von anderen Sessions bearbeitet; ein Einfügeversuch wurde
um 20:12 durch eine parallele Session überschrieben. Diese Datei enthält **nur** die Punkte aus
der Verifikation, die dort noch nicht stehen. Einfügen nach Owner-Durchsicht,
gleiches Spaltenformat, IDs beim Merge umbenennen (V1→nächste freie U-Nummer).

Kein genehmigter Backlog. Jede Zeile ist eine Frage an den Owner.

| ID | Punkt | Warum nicht integriert? | Quelle | Empfehlung |
|---|---|---|---|---|
| **V1** | **Control Plane widersprüchlich:** Mission `M-20261119T194948-3db0ab44` und Executer-Lease `S-20261119T195007-03a762bf` sind im Store `active` (Write-Path nur `tech/MESSPROTOKOLL-2026-11-19.md`, Laufzeit bis 20:35). `hai_health` meldet `active_mission_count: 0`. `docs/PROJECT_CONTRACT.md` behauptet „ohne Mission und ohne Lease". | Ein Supersede auf Basis des Blocks würde eine laufende Lease treffen; welche Sicht gilt, kann nur der Owner entscheiden. Der Widerspruch ist im Vertrag als Gegenprüfung vermerkt, nicht stillschweigend überschrieben. | `~/.hai/missions/M-20261119T194948-3db0ab44/{mission.json,sessions/S-20261119T195007-03a762bf.json}`; `hai_health`; `docs/PROJECT_CONTRACT.md:7–18` | **REVIEW (dringend)** — vor Supersede/neuer Mission klären |
| **V2** | **Session 19:44–19:47 einordnen:** 5 User-/5 Assistant-Zeilen in `cf_voice_messages` (id 6–15) auf unverändertem `src/server.ts` (`llm=deepseek`, Paid-only). `docs/UNSOLVED-TECHNIK.md` U12 nennt sie „Sprach-Turns"; dafür gibt es **keine** Metriken, und die User-Zeilen sehen getippt aus. Text oder Voice, welches Modell, welche Session — ungeklärt. | Eine Ursache wäre Spekulation; die Zählung selbst ist im Protokoll korrigiert. Für die Aussage „Paid-Wand" ist die Einordnung entscheidend. | DO-SQLite `cf_voice_messages` id 6–15; Trace: letzter `5035` 19:44:19; `git diff` nur `package.json` | **REVIEW** — vor Verallgemeinerung der Paid-Wand |
| **V3** | **Schreibzugriffe außerhalb der Lease:** `docs/KI-DIALOG-2026-11-19.md` (19:51), `docs/PROJECT_CONTRACT.md` (19:54), `tech/EXECUTION_PLAN-M1-MESSLAUF.md` (19:54) nach Lease-Erteilung 19:50:07, obwohl nur das Protokoll erlaubt war. | Zeitliche Zuordnung ist plausibel, Urheberschaft nicht bewiesen; keine stille Zuschreibung oder nachträgliche „Legalisierung". | Datei-mtimes vs. `resolved_write_paths` der Session | **REVIEW** — Ownership klären |
| **V4** | **Mess-Evidenz ist mutabel:** Das Protokoll zitiert das DO-SQLite nur abgekürzt (`…5890aaec….sqlite`) und außerhalb des Repos; in `tech/evidence/` liegt nur der Council-Score. Der Befund änderte sich zwischen Behauptung und Prüfung. | Ein Witness-Artefakt (Kopie + SHA-256 + „as-of"-Zeit) ändert die Messprozedur — Owner-Entscheidung, keine stille Regel. | `tech/MESSPROTOKOLL-2026-11-19.md`, „Gegenprüfung"; `PROJEKTPFADE.md` §5.5 | **REVIEW** — Kopie + Hash je Messung |
| **V5** | **`graphify-out/` ist getrackt:** 96 Dateien, 1,1 MB, obwohl `PROJEKTPFADE.md` „wird nicht committet" sagte (3,7 MB ebenfalls veraltet). | „Graph versionieren oder nicht" ist eine Projektentscheidung; kein eigenmächtiges `git rm --cached`. | `git ls-files graphify-out`; `du -sh` | **REVIEW** |
| **V6** | **PII im Protokoll:** persönliche E-Mail-Adresse in der Setup-Tabelle. | Kein Secret, aber personenbezogen; Ersetzen ändert eine Evidenzzeile. | `tech/MESSPROTOKOLL-2026-11-19.md:17` | **REVIEW** — vor einem Commit ersetzen |
| **V7** | **`validate.sh` prüft nur eine Whitelist** von 13 Dateien; ein echter Broken Link in `docs/PROJECT_CONTRACT.md` lief grün durch (Ziel existiert inzwischen). Hash-Drift und falsche Zahlen werden nie erkannt. | Tooling-Änderung; nicht Projekt-Scope, aber Voraussetzung für belastbare Doku-Gates. | `scripts/validate.sh:12–27`; manueller Link-Scan | **REVIEW** — alle authored Docs und Hash-Verweise prüfen |

## Korrekturhinweis (kein eigener Punkt)

`docs/UNSOLVED-TECHNIK.md` U1 sagt, die UI zeige „die vier kompakten Werte". Im
unveränderten Beispiel rendert `src/client.tsx` **drei** Werte (`llm_ms`,
`tts_ms`, `first_audio_ms`; Zeilen 255/259/265 und 778/782/788). `total_ms`
wird nirgends angezeigt. Für die Entscheidung (Erfassungsweg) ändert das nichts,
für die Formulierung schon.

## Bewusst nicht aufgenommen

- **Plan-ACCEPT nicht hashgebunden** — vom Owner am 19.11. entschieden
  (inhaltsbezogen); steht im Protokoll.
- **Externe Modellfakten** (DeepSeek Paid-only, `melotts`-Deprecation 20.11.2026,
  nur `aura-1/2-en/2-es` als TTS) — bereits in `docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`;
  in der Verifikation gegengeprüft, kein Nachtrag nötig.
- **Doppeltes Machbarkeitsdokument** — bereits `PROJEKTPFADE.md` §5.3.
