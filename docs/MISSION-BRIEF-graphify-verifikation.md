# Graphify-Inferenzkanten verifizieren (Mission Brief)

Status: **ENTWURF – nicht als HAI-Mission eröffnet.** Die Control-Plane-Blocker stehen am Ende.

## Objective

Die 25 INFERRED-Kanten (Ø 0,78 Konfidenz) und die 84 schwach verbundenen Knoten im Agentfähig-Wissensgraphen gegen die Quelldateien prüfen und das Ergebnis als aktualisierten Graphen plus Bericht mit Pfad-Evidenz festhalten.

## Artifact

- `graphify-out/GRAPH_REPORT.md` – aktualisiert, mit Abschnitt „Verifikation der INFERRED-Kanten"
- `graphify-out/graph.json` und `graphify-out/graph.html` – neuer Lauf aus aktuellem HEAD

## Done Criteria

1. Jede der 25 INFERRED-Kanten ist im Bericht als `BESTÄTIGT` oder `VERWORFEN` markiert, mit Beleg in der Form `Datei:Zeile`.
2. Die 14 Grad-0-Knoten (10 Skizzen-Bilder, `src/README.md`, `tests/README.md`, Zustands-Synchronisation) sind einzeln aufgeführt und als `verlinkt` oder `bewusst isoliert (Grund)` klassifiziert.
3. Der Graph wurde aus dem aktuellen HEAD neu gebaut; `built_at_commit` in `graph.json` entspricht `git rev-parse HEAD`.
4. `bash scripts/validate.sh` läuft ohne Fehler.
5. Offene Punkte – insbesondere bewusst isolierte Knoten – sind in `docs/PROJECT.md` vermerkt.

## Non-Goals

- Keine inhaltliche Änderung an Quelldokumenten (`sketches/`, `tech/`, `research/`, `src/`, `tests/`).
- Kein neues Modul, kein Framework- oder Modellwechsel, keine neue Config.
- Keine Commits, Pushes oder Deployments.
- Keine HAI-Control-Plane-Änderung (Lanes, Bindings, Owner-Gate) ohne gesonderte Freigabe.

## Boundaries (Write-Root)

`graphify-out/` und `docs/PROJECT.md`. Schreiben außerhalb ist verboten.

## Stop-Kriterium

Sofort stoppen und zurückmelden, wenn eine INFERRED-Kante nicht gegen eine konkrete Quelldatei belegt werden kann (→ `UNKLAR`, nicht raten), oder wenn `validate.sh` scheitert. Kein eigenständiges Eskalieren.

## Owner / Zeitbudget

Owner: Samuel. Zeitlimit: 2 Stunden. Bei Überschreitung sichtbar melden; keine Qualitäts- oder Sicherheitsgates umgehen.

---

## HAI-Status (nicht eröffnet)

`hai_health` / `hai_status` vom 19.11.2026: `ok: true`, aber:

- **Projekt nicht gebunden** – `projects` listet nur `brueggen` und `computer-day-audit-2026`; `Projek-Managment/` fehlt. Nötig: `hai_bind_project(owner_ack=true, device_id, reason)`.
- **Lanes voll** – aktiv: `prezero-clean`, `brueggen` (2/2, Limit 2), kein Capacity Window. `remaining_mission_capacity: 0`, `valid_writers: 0`.
- **Owner-Gate offen** – `authenticated_owner: false`, Modus `nonce`/Touch ID. Nötig: `hai_open_mission(owner_ack / owner_code / approval_context)`.
