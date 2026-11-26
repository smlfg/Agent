# Upstream-Recherche — Gesprächs-Eval für den Server-Prompt

Frage: Womit prüft man über mehrere Gesprächswechsel, dass der Agent keine Floskeln
wiederholt und höchstens einmal nach seinem Aussehen fragt?

Stand: 26.11.2026. Repo-Daten per `gh api` abgerufen.

## Kandidaten

| Kandidat | Lizenz · letzter Push | Passt | Passt nicht |
| --- | --- | --- | --- |
| [promptfoo](https://github.com/promptfoo/promptfoo) | MIT · 26.11.2026 | deklarative Fälle, eigene JS-Provider und -Assertions, `--repeat` für Streuung, läuft per `npx` ohne Abhängigkeit im Projekt | Mehrfach-Wechsel mit echter Antwort-Historie braucht einen eigenen kleinen Provider |
| [DSPy](https://github.com/stanfordnlp/dspy) | MIT · 25.11.2026 | optimiert Prompts automatisch gegen eine Metrik | Python-Laufzeit; der Prompt wird hier in JavaScript gebaut; Optimierer ersetzt das Prüfen nicht |
| [DeepEval](https://github.com/confident-ai/deepeval) | Apache-2.0 · 26.11.2026 | Metriken für Mehrfach-Wechsel | Python; viele Metriken brauchen ein Richter-Modell |
| `evals/answers.mjs` (vorhanden) | im Repo | prüft den echten Worker | Live-Ziel mit Rate-Limit oder Cloudflare-Token; nur Begriffe der letzten Antwort, keine Prüfung über den Verlauf |

## Entscheidung

**promptfoo, nur per `npx -y promptfoo@0.126.0`**, ohne Änderung an `package.json`.
Andocken: CLI-Aufruf; der Provider importiert `buildServerPrompt` und `search` direkt
aus dem Repo und ruft das lokale Ollama. Konfiguration: `evals/promptfoo/`.
`evals/answers.mjs` bleibt für den Live-Antwort-Eval zuständig.

## DSPy: bewertet, nicht gebaut

Sinnvoll erst, wenn (a) eine Metrik steht, die dem Owner-Urteil entspricht, (b) etliche
echte Gesprächsverläufe als Beispiele vorliegen und (c) gegen das Produktionsmodell
optimiert werden darf. Heute fehlt alles drei. Gegen ein lokales Ersatzmodell optimierte
Prompts müssten nicht auf das Produktionsmodell übertragen werden können. Dazu käme eine
zweite Sprache im Stack.

## Grenzen des Evals

- Das lokale Modell ist nicht das Produktionsmodell.
- Die Assertions sind Wortmuster; umformulierte Floskeln und umschriebene Fragen
  können durchrutschen. Die Verläufe selbst lesen.
