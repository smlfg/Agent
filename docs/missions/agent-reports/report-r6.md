# Bericht — reaktive statt lenkende Gesprächsführung + Experimentierplattform

**Kurzfassung.** Das Feld liefert drei belastbare Mechanismen: Grice'sche Quantität/Relevanz, Turn-Übergabe der Konversationsanalyse und Autonomie-Stützung der Motivational Interviewing. Für agentfähig heißt das: **ADAPT** (Regeln in den Prompt, keine Frameworks), **INTEGRATE** (bestehendes `HAI_SITE_EVENTS` + ein Durable Object), **BUILD LAST** (Bandit = ~30 Zeilen TS, keine Plattform).

## 1) Kernprinzipien

1. **Quantity & Relation (Grice).** „Make your contribution as informative as is required" und „no more informative than is required"; „Be relevant". Die Antwort endet, wo die Frage endet — nicht dort, wo der Agent weiterkäme. https://plato.stanford.edu/entries/grice/
2. **Turn-Übergabe (Sacks/Schegloff/Jefferson 1974).** Das Rederecht wird Zug um Zug übergeben; Schweigen ist ein legitimer Slot, kein Defekt. Wer den nächsten Zug vorwegnimmt, nimmt dem Besucher den Turn. https://doi.org/10.2307/412243
3. **Selbstreparatur bevorzugen (Schegloff/Jefferson/Sacks 1977).** Sprecher korrigieren sich lieber selbst; Fremdkorrektur ist die markierte, „dispreferred" Form. Also: nicht antizipieren, nicht umformulieren, korrigieren lassen. https://doi.org/10.2307/413107
4. **Autonomie statt Righting Reflex (MI).** MI ist ein *guiding* Stil zwischen Folgen und Führen, ausdrücklich ohne „unsolicited advice, confronting, instructing, directing". https://motivationalinterviewing.org/understanding-motivational-interviewing
5. **Elicit–Provide–Elicit.** Erst erfragen, was die Person schon weiß; dann um Erlaubnis bitten; dann Information. Fragen sind Einladungen, keine Aufträge (ebd.).
6. **Invocation und Dismissal liegen beim Nutzer (HAX G3/G7/G8).** „Time services based on context", „Support efficient invocation", „Support efficient dismissal". Ein System, das sich selbst anbietet, verletzt G8. https://www.microsoft.com/en-us/haxtoolkit/library/
7. **Leading questions sind Übergriff.** Negative Interrogative („Isn't it true that…") drängen eine Antwort auf und erzeugen Zustimmung unter Druck. https://doi.org/10.1016/S0378-2166(02)00072-3

## 2) Prompt-Regeln (English, für einen 1–3-Satz-Agenten)

```
- Answer the last message only. Stop when it is answered.
- One to three sentences. Never more information than the question requires.
- Do not restate, summarise, or name what the visitor said. React to it instead.
- Never announce, offer, or preview what you could do next.
- Ask a question only if the visitor's turn leaves a visible gap. At most one; never two turns in a row.
- Never assign tasks, exercises, or homework ("tell me three things…").
- Reuse at most one of the visitor's words. Never paraphrase their feeling back at them.
- If you do not know, say so in one clause and stop.
- No praise, no encouragement, no "you are already ahead".
- Silence is an answer. If the visitor writes little, write less.
- Mention Samuel, a service, or a link only if the visitor asked about people, work, or contact.
- Prefer a statement to a question; prefer one example to one explanation.
```

## 3) Gegenbeispiele aus `src/dev/conversation-pathways.json`

Die Datei ist Entwicklungsmaterial (Zeile 3), aber ihre Muster sind der Fehler, den Samuel beschreibt — der Agent setzt die Agenda:

| Stelle | Satz | Warum lenkend |
|---|---|---|
| `hesitant-quiet` (~219) | „Good. What should it say when someone arrives and says nothing?" | Bewertung („Good") + Designaufgabe; macht den Besucher zum Bearbeiter. |
| `returning-after-silence` (~555) | „Then tell me what the site should do when someone lands on it and freezes." | Imperativ + Framing. |
| `non-native-speaker` (~614) | „Good. Then say one more thing about the furniture." | Auftrag, kein Angebot. |
| `hurried-decider` (167) | „Tell me where to send it… Mention the studio." | Datenerhebung + Instruktion; widerspricht `action.type: collect_nothing`. |
| `curious-explorer` (70) | „Then keep going. I will keep up…" | Anfeuern = Push. |
| `person-pathway` (~660) | „Three things you would say… and one thing you would never say." | Hausaufgabe als Frage verkleidet. |
| `two-turn-leaver` (510) | „Come back when there is something you actually want to know." | Retention-Nudge plus leichte Abwertung. |

Muster: 6 von 13 Pathways enthalten mindestens eine direktive Bewegung. Messbar als `directive_moves_per_100_turns` — hart auf 0 für `two-turn-leaver`, `curious-explorer`, `emotionally-strained`.

## 4) Zusammenspiel mit den 12 Parametern

| Parameter | Technik | Dosierung |
|---|---|---|
| `openness` | Fragerecht | Schwelle 0.66 (`style.js:96`) ist zu hoch als Default, aber richtig als *Erlaubnis*. Empfehlung: Default 0.45, Frage nur bei sichtbarer Lücke. |
| `calm` | Schweigen, weniger Zusagen | hoch = Ellipse erlaubt (`style.js:111`), keine Vorwärtsbewegung. |
| `attention` | Rückbezug vs. Antwort-und-Stopp | hoch = ein Rückgriff auf den letzten Satz, nicht auf das Thema. |
| `closeness` | Wortspiegelung (`mirror`, `style.js:124`) | hoch = ein Wort des Besuchers; nie Paraphrase des Gefühls. |
| `warmth` | eine Anerkennung | genau eine, nie zwei; `warmth`+`closeness` hoch = Ingratiation, deckeln. |
| `density`/`tempo` | Grice-Quantity-Dial | `targetWords` (`style.js:62`) ist bereits die richtige Achse. |
| `certainty` | Hedging | Hedging = epistemische Ehrlichkeit, nicht Unsicherheitstheater. |
| `depth` | Beispiel statt Muster | hoch darf die Ebene wechseln — nur wenn gefragt. |
| `playfulness` | ein Aside | ein trockener Satz, nie zwei. |
| `energy` | Verben | ändert Tempo, nie Inhaltsmenge. |
| `formality` | Register | nur Wortwahl. |

Regel: pro Turn bewegt sich **eine** Achse (Entscheidung 1 im Entscheidungslog).

## 5) Messen, ob die Technik wirkt

Primärsignale (alle ohne Inhalt, nur Zahlen): `session_seconds`, `turns`, `visitor_initiated_ratio`, `median_words_per_visitor_turn`, `return_same_session`, `contact_revealed`, `outbound_link_click`.

Gegen-Metriken (Guardrails, hart): `unprompted_offer_rate` ≤ 1/Gespräch (`persona.json:130`), `directive_moves/100`, `boundary_compliance` = 100 %, `open_end_kept` (kein Angebot bei `two-turn-leaver`), `exit_without_goodbye`.

Verzerrung: Dauer allein ist optimierbar (Goodhart) — deshalb nur Paare bewerten (Dauer ∧ Wiederkehr ∧ kein Push). https://arxiv.org/abs/1803.04585
Vorab-Simulation: 13 Pathways × 5 Läufe, Temperatur 0, Erfolg am Endzustand, `pass^5` (τ-bench-Methodik, https://arxiv.org/abs/2406.12045).

## 6) Upstream

| Artefakt | Typ | Lizenz | URL |
|---|---|---|---|
| Grice/SEP | Theorie | frei | plato.stanford.edu/entries/grice/ |
| Sacks et al. 1974 | Paper | JSTOR-Zugang | doi.org/10.2307/412243 |
| Schegloff et al. 1977 | Paper | JSTOR-Zugang | doi.org/10.2307/413107 |
| Heritage 2002 | Paper | Elsevier | doi.org/10.1016/S0378-2166(02)00072-3 |
| MINT/MI | Methodik | frei | motivationalinterviewing.org |
| HAX Guidelines (CHI'19) | Methodik | frei | microsoft.com/en-us/haxtoolkit/library/ |
| GrowthBook | Experimente | MIT (Kern), `enterprise/` kommerziell | github.com/growthbook/growthbook |
| PostHog | Analytics/Flags | MIT (Kern), `ee/` kommerziell | github.com/PostHog/posthog |
| Langfuse | LLM-Tracing | MIT (Kern), `ee/` kommerziell | github.com/langfuse/langfuse |
| promptfoo | Prompt-Evals | MIT | github.com/promptfoo/promptfoo |
| OpenAI Evals | Evals | MIT (Daten teils CC-BY/CC-BY-NC) | github.com/openai/evals |
| mabwiser | Bandits | Apache-2.0 | github.com/fidelity/mabwiser |
| Vowpal Wabbit | Contextual Bandits | BSD-3-artig | github.com/VowpalWabbit/vowpal_wabbit |
| Kohavi/Tang/Xu 2020 | Buch | kommerziell | experimentguide.com |
| Sample-Size (16σ²/Δ²) | Formel | frei | evanmiller.org/ab-testing/sample-size.html |
| Analytics Engine | Infra | Cloudflare | developers.cloudflare.com/analytics/analytics-engine/ |

## 7) Empfehlung

**REUSE: nichts.** Die drei Prinzipien sind Text, kein Paket — sie in ein Framework zu ziehen, kostet mehr, als sie einbringen (vgl. `GESPRAECHS-ENDPUNKTE.md` §2).
**INTEGRATE:** `HAI_SITE_EVENTS` (bereits vorhanden, `deploy/site/wrangler.jsonc:39`) + **ein** Durable Object als Varianten-Registry. `worker.js:462–489` normalisiert heute genau eine Experiment-ID, drei Varianten und eine Event-Whitelist — erweitern, nicht ersetzen.
**ADAPT:** die Regeln aus §2 + §4 als Prompt-Block; `openness`-Default senken, `directive_moves` als Test.
**BUILD LAST:** Bandit und jede Experiment-Plattform. Erst 6–10 Arme, dann Skalierung.

### Architektur

```
Besuch → session_random(Variante ohne Cookie, Reload = neu)
      → POST /api/agent {session_token} → DO-Registry (Gewichte) → Prompt
      → Antwort → POST /api/site-event {turn, duration, reward} → AE (90 Tage)
      → täglicher Cron: Aggregat lesen → Thompson-Update → Gewichte in DO/KV
```

Ereignis-Schema (passt in AE: 1 Index, 20 Blobs, 20 Doubles, 16 KB, `developers.cloudflare.com/analytics/analytics-engine/limits/`):

```json
{ "experiment_id": "surface-2026-11-19", "variant": "p03_calm",
  "event": "session_end", "target": "none", "path": "/", "language": "en",
  "viewport_class": "desktop",
  "turn_index": 3, "duration_ms": 84210, "visitor_turns": 3,
  "words_in": 41, "reward": 0.62, "guardrail": 0 }
```

Bandit (~30 Zeilen TS, Beta-Bernoulli mit Kontext-Buckets und Untergrenze):

```ts
type Arm = { a: number; b: number; n: number };
pick(ctx, arms, floor = 0.1) {
  const live = arms.filter(a => allowed(a, ctx));      // distress/injection/kein Angebot
  if (!live.length) return BASELINE;
  if (rng() < floor) return live[rngInt(live.length)]; // kein Starving
  let best = live[0], bestS = -1;
  for (const a of live) {
    const s = beta(a.a + prior.a[ctx], a.b + prior.b[ctx]); // Thompson
    if (s > bestS) { bestS = s; best = a; }
  }
  return best;
}
update(arm, reward, ctx) {
  const r = clamp01(reward);
  arm.a += r; arm.b += 1 - r; arm.n += 1;
  if (arm.n % 200 === 0) shrink(arm, prior, 0.98);     // Nichtstationarität
}
reward = 0.4*turnsNorm + 0.3*returnSameSession + 0.2*contact + 0.1*click - 0.5*guardrailHit;
```

**Mindeststichprobe.** n je Arm ≈ 16σ²/Δ². Bei p = 0.30 (σ² = 0.21): Δ = 10 pp → **336**, Δ = 5 pp → **1.344**, Δ = 3 pp → **3.733** pro Arm. Zehn Arme bei 5 pp = ~13.400 Sessions; bei 300/Woche ≈ 45 Wochen. **100 Systeme × 1.344 = 134.000 Sessions ≈ 8,6 Jahre** — „100 Systeme parallel" ist statistisch nicht finanzierbar. Konsequenz: (a) 6–10 Arme, (b) stetiges Belohnungssignal (Turns/Session) statt binär, (c) hierarchisches Prior über Stil-Familien statt flacher Arme, (d) Simulation als Vorwissen, damit der Bandit bei wenigen hundert Besuchen nicht zufällig gewinnt.

**Quellen lokal:** `src/agent/persona.json`, `src/agent/prompt.js`, `src/agent/style.js:62,96,111,124`, `src/dev/conversation-pathways.json`, `deploy/site/src/worker.js:296–320,462–489`, `deploy/site/datenschutz/index.html:284–291`, `docs/missions/M-20261119T220518-4585e9fd-ANALYSEN-N1-N7.md:780–886`.

STOP.
