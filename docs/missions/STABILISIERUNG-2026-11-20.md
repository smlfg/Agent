# Stabilisierung 20.11.2026 — gesicherter Stand und eine echte Agentenantwort

Bearbeitet nach der Opus-Session (`322679cd`, Ende 23:46 wegen 5-Stunden-Limit).
Ziel: Zustand sichern, Baseline herstellen, genau eine vertikale Funktion
abschließen, nichts Neues erfinden.

## 1. Gesicherter Stand

- Branch `stabilization/2026-11-19`, Commit `cddb06e`
  („wip(stabilisierung): Tagesstand 19.11. sichern").
- Gesichert wurde alles, was keine laufende Fremd-Session gerade schreibt.
  Bewusst offen: `README.md`, `docs/PROJECT.md`, `docs/UNSOLVED-TECHNIK.md`,
  `tech/*`, `docs/wireframes/agentfaehig-wireframe.html`,
  `src/living-surface.html`, `src/presence/*`, `src/styles/*`, `src/surface/*`,
  `src/main.js`, `tests/adaptive-surface.test.js`, `tests/eye-motion.test.js`,
  `deploy/*`. Diese Bereiche wurden zur Commit-Zeit aktiv beschrieben.
- Der Baum des Commits ist eigenständig lauffähig: 220/220 Client-Tests grün im
  exportierten Index (`git checkout-index` in ein temporäres Verzeichnis).
- Sicherung außerhalb des Repos:
  `03_HAI/Agentfaehig/_backups/2026-11-19_2359/agent-baseline.bundle` (alle
  Branches) und `worktree-uncommitted.tar.gz` (Arbeitsbaum ohne `node_modules`,
  `public/`, `.git`).

## 2. Live-Stand der beiden Worker

| Worker | Domain | Stand |
|---|---|---|
| `agentfaehig` | `www.agentfähig.de` | Version `34e02191`, Living Surface als `/`, alte Seite unter `/classic/` |
| `human-agent-interface` | `www.human-agent-interface.com` | unverändert, eigene Startseite, `/impressum/`, `/datenschutz/` |

`bash deploy/agentfaehig-site/verify-live.sh` prüft beide Worker auf HTTP-Status
**und** Inhalt (nicht nur den Titel): 9 Prüfungen, alle ok. Rücksprung für den
Agentfähig-Worker: `wrangler rollback 93f1d456-dea0-4afd-916b-1c7992bbace4 --name agentfaehig`.

## 3. Die abgeschlossene vertikale Funktion

Besuchertext → `POST /api/agent` → echter Anbieter → dargestellte Antwort.

Nachweis gegen die öffentliche Domain (20.11., 00:09):

```bash
curl -s -X POST https://www.xn--agentfhig-02a.de/api/agent \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://www.xn--agentfhig-02a.de' \
  -d '{"prompt":"Was ist das hier eigentlich?"}'
```

Ergebnis: HTTP 200 in 1,93 s, `provider: "openrouter"`,
`model: "deepseek/deepseek-v4.1-flash"`, deutsche Antwort in der Persona.

Im echten Chrome: Text eingegeben, abgeschickt, Antwort lief als Typewriter
durch, `#dev-badge` blieb `hidden`, `aria-busy="false"`, Phase zurück auf `idle`.
Es wurden also keine Entwicklungsdaten angezeigt.

**Keine stillen DEV-DATA-Antworten mehr in Produktion.** `src/main.js` hängt den
Stil-Dev-Agenten nur noch außerhalb der Produktionshosts in die Kette. Fällt in
Produktion jeder Anbieter aus, zeigt die Oberfläche den vorhandenen ehrlichen
Fehlerzustand („I can't answer right now. Try again in a bit.") statt einer
erfundenen Agentenantwort.

## 4. Warum `no_provider` kam — echte Ursache

- Das Secret `MINIMAX_API_KEY` liegt seit 23:37 auf dem richtigen Worker
  (`wrangler secret list --name agentfaehig`).
- Der Aufruf kommt an, MiniMax antwortet aber mit **429**:
  `rate_limit_error`, `"Token Plan usage limit reached: Upgrade your Token Plan
  or purchase Credits for more usage. (2056)"` — identisch über die
  OpenAI-kompatible und die Anthropic-kompatible Schnittstelle.
- Das ist **kein Schlüsselproblem**, sondern das aufgebrauchte Token-Plan-Kontingent.
- `no_provider` war nur der Endzustand der Kette: MiniMax 429, danach kein
  zweiter Anbieter, also 503. Der Fehler wurde erst durch den 429-Beleg
  eindeutig (`wrangler tail` + `agent_provider_status`).

Der Worker hat jetzt drei Stufen: MiniMax → OpenAI-kompatibel (OpenRouter) →
Workers AI. Live sind derzeit die ersten beiden verdrahtet.

## 5. Tests (reproduzierbar)

```bash
npm test
```

`248/248` grün: `scripts/validate.sh` (Struktur, Links, Skills, Dateinamen),
239 Client-Tests, 9 Worker-Tests in
`deploy/agentfaehig-site/test/agent-endpoint.test.mjs` (Anbieter-Reihenfolge,
Fallback, ehrliche 503, Origin-Sperre, leerer Prompt).

Zusätzlich lokal geprüft: `wrangler dev` mit echtem Schlüssel liefert HTTP 200
und eine echte Antwort (`provider: openrouter`, 1,86 s).

## 6. Offene Blocker

1. **MiniMax-Kontingent leer** (Beleg oben). Ohne Aufladen bleibt MiniMax die
   erste Stufe, die immer 429 liefert.
2. **OpenRouter ist ein Notbehelf.** Der Schlüssel stammt aus einem
   Hermes-Profil, hat `limit: 1` (1 USD) und Free-Tier-Status. Für öffentlichen
   Verkehr ist das keine Dauerlösung, sondern die Brücke bis MiniMax wieder
   antwortet. Der Schlüssel liegt nur als Worker-Secret, nicht im Repo.
3. **Live ≠ Arbeitsbaum.** `src/worker.js` und `wrangler.jsonc` wurden nach dem
   Deploy weiter geschrieben (00:07/00:08, u. a. `ai`-Binding und Workers AI als
   dritte, schlüsselfreie Stufe). Die ist deshalb noch **nicht** live. Ein
   sauberer Redeploy nach Abschluss des Schreibers bringt sie live.
4. **Weitere Schreiber aktiv.** Claude Code (Doku) und Antigravity (CSS,
   Presence, Surface) schreiben weiter; die betroffenen Dateien sind bewusst
   uncommittet.
5. **Visuelle Prüfung offen.** Im Screenshot nach einem Gespräch lief die
   Antwort rechts aus dem Bild, während der frische Ladezustand sauber war
   (Composer sichtbar, beide Augen im Bild, `elementFromPoint` trifft das
   Eingabefeld). Das ist ein Kandidat für die laufende Surface-Arbeit, kein
   Beleg für einen Defekt der Agenten-Kette.

## 7. Ein nächster Schritt

Nachdem der Surface-Schreiber fertig ist: **ein** sauberer Redeploy des
aktuellen Workers (`bash deploy/agentfaehig-site/deploy.sh --prod`), damit das
`ai`-Binding und Workers AI als schlüsselfreie dritte Stufe live gehen. Danach
`/api/agent` mit leerem `OPENAI_API_KEY` prüfen: antwortet Workers AI, kann der
persönliche OpenRouter-Schlüssel vom Worker entfernt werden und MiniMax bleibt
die erste Stufe, sobald das Kontingent wieder da ist.
