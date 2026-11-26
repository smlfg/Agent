I'll read the project files first, then research the quality models.
Now researching the quality models with sources.
## 1) Definition: „gutes Gespräch" in sieben Dimensionen

Grundlage: Grice-Maximen (Qualität, Quantität, Relevanz, Klarheit — [SEP](https://plato.stanford.edu/entries/implicature/)), Turn-Taking und Repair der Konversationsanalyse ([Sacks/Schegloff/Jefferson 1974](https://doi.org/10.1353/lan.1974.0010); [Schegloff et al. 1977](https://www.conversationanalysis.org/mp-files/preference-for-self-correction-in-the-organization-of-repair-in-conversation.pdf)), Engagement/Flow ([O'Brien & Toms 2008](https://onlinelibrary.wiley.com/doi/10.1002/asi.20801); [Nakamura & Csikszentmihalyi](https://nuovoeutile.it/wp-content/uploads/2015/12/2002-Flow.pdf)), Wow/Delight ([Kulzer & Burmester 2020](https://www.mdpi.com/2414-4088/4/3/49)) und Autonomie-Ethik ([Gray et al. 2018](https://dl.acm.org/doi/10.1145/3173574.3174108); [Nallur et al. 2024](https://arxiv.org/html/2407.16362v1)).

**D1 · Verstanden fühlen (Grounding + Repair).** Bedeutung: Der Agent beantwortet, was gefragt wurde, und repariert Missverständnisse selbst-initiiert statt zu raten — Selbstreparatur ist in echter Konversation der Normalfall (Schegloff et al. 1977). Gut: `skeptic-breaker` — auf Angriff kommt ruhige, präzise Antwort, „the tests turn into a conversation" (`conversation-pathways.json:…skeptic-breaker`, `design_lesson`). Schlecht: eine Antwort, die die Frage wiederholt und dann ausholt (verboten in `persona.json:146-147`).

**D2 · Neugier geweckt (Öffnung statt Info-Dump).** Bedeutung: Offene Fragen sollen das Feld weiten, nicht eine Feature-Tour auslösen. Gut: `curious-explorer`, „What is this thing?" → „Something that answers you, and nothing else until you speak." (`design_lesson`: „Open questions should widen the field, not trigger an explanation dump"). Schlecht: dieselbe Frage → drei Absätze über Cloudflare, Workers, Skills.

**D3 · Präsenz statt Tool (Stille als Haltung).** Bedeutung: Das Interface ist anwesend, ohne zu drängen; Schweigen ist kein Fehler, den man füllen muss. Gut: `curious-explorer`, „Silence is not a problem to fix." Schlecht: automatische Vorschlags-Chips oder „Are you still there?".

**D4 · Ehrlichkeit (Grenzen, keine Erfindung).** Bedeutung: Grice-Qualität — nur behaupten, wofür Belege existieren; Unwissen in einem Satz zugeben (`persona.json:142,151`; `cannot`: „quote a price", „promise a date"). Gut: „Price?" → „I do not know a price. That part is Samuel's to answer." (`persona.json:210-212`). Schlecht: „Our packages start at a competitive rate" (`persona.json:220-221`).

**D5 · Wirkung der Oberfläche bemerkt (Embodiment, kein Gimmick).** Bedeutung: Der Besucher merkt, dass die Seite *er selbst* ist und sich verändert — nicht als Spektakel, sondern als Antwort. „Wow" entsteht aus übertroffener Erwartung plus Relevanz, nicht aus Effekt ([Kulzer & Burmester 2020](https://www.mdpi.com/2414-4088/4/3/49)). Gut: `returning-after-silence`/`curious-explorer` `surface`: „the field breathes slower, matching the visitor's pause rather than prompting." Schlecht: Regenbogen-Farbwechsel ohne Bezug zum Gesagten.

**D6 · Selbstbestimmung (nicht bevormundet).** Bedeutung: Kein Nudging zu Kontakt, kein Retention-Drängen, jederzeit abbrechbar — Manipulation beginnt, wo Transparenz und leichte Widerstehbarkeit fehlen ([Nallur et al. 2024](https://arxiv.org/html/2407.16362v1)). Gut: `two-turn-leaver` — „No retention nudges, no 'wait!'. A short goodbye is part of the product." Schlecht: „Warte, ich habe noch eine Frage…" nach dem Abschied.

**D7 · Gesprächsende mit Würde (offenes Ende ist Erfolg).** Bedeutung: Ein ehrliches Ende ohne Ziel ist kein Fehlschlag (`GESPRAECHS-ENDPUNKTE.md:30`). Gut: `two-turn-leaver` (neutraler Ausstieg) und `emotionally-strained` („Name the limit once, keep the door open", `persona.json:177`). Schlecht: Grenzverletzung durch Diagnose oder Ressourcenliste, obwohl `persona.json:170-176` sie verbietet.

## 2) Messbarkeit auf drei Ebenen

**(a) Live im Browser (vorhandene Metriken).** Wichtig und ehrlich: Der Katalog hat **109 Metriken, 0 mit Quelle `agent_text`** (`metrics-catalog.json`; Befund `ANALYSEN…:98`). Live messbar ist also nur die *Reaktion des Besuchers*, nicht die Qualität der Agentenantwort.

| Dimension | Metrik-IDs (Katalog) | Grenze |
|---|---|---|
| D1 Verstanden | `resubmit_duplicate`, `topic_coherence`, `backchannel_rate`, `confirmation_rate` | indirekt; keine Agententext-Metrik |
| D2 Neugier | `open_question`, `question_ratio`, `curiosity_words`, `prompt_length_trend` | Trend statt Absolutwert |
| D3 Präsenz | `pointer_near_presence_ratio`, `hold_before_send`, `idle_after_answer`; `first_glyph_ms` | `first_glyph_ms` fehlt im Katalog (ADR-0006:51-53) |
| D4 Ehrlichkeit | keine | nur Judge |
| D5 Oberfläche bemerkt | `surprise_markers`, `exclamation_rate`, `pointer_near_presence_ratio` | sehr grob |
| D6 Selbstbestimmung | `abort_signal_rate`, `interruption_rate`, `idle_after_answer` | Absicht ≠ Abbruch |
| D7 Ende mit Würde | Turnzahl + `idle_after_answer` + Endpunkt-Log | kein Würde-Signal vorhanden |

Retention/„Rückkehr" ist clientseitig **nicht** messbar: Reload = Neustart, keine Persistenz (`M1-CONTRACT.md:6`). Das HEART-Feld *Retention* ([Rodden et al. 2010](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/)) braucht externe, aggregierte Zählung — nicht im Store.

**(b) Nachträglich per LLM-Judge.** Muster: Single-Answer-Grading mit expliziter Rubrik wie MT-Bench, Referenzantworten und Kettenbegründung wie G-Eval; Positions-Bias ist belegt und muss durch Reihenfolge-Tausch neutralisiert werden ([Zheng et al. 2023](https://arxiv.org/html/2306.05685); [Liu et al. 2023](https://arxiv.org/abs/2303.16634)). Rubriktext je Dimension (Skala 1–5), Beispiel D2:

> *Neugier (1–5).* 1 = Antwort schließt das Thema (Referat, keine Anschlussfähigkeit). 3 = Antwort beantwortet korrekt, lässt aber keinen Faden offen. 5 = Antwort beantwortet in ≤3 Sätzen und öffnet genau eine neue, konkrete Richtung — ohne Rückfrage, wenn `openness ≤ 0.66`. Vergib zuerst eine Begründung mit Zitat, dann die Zahl.

D4/D6/D7 sind Judge-only, weil sie Semantik brauchen (Preisbehauptung, Nudge, Abschiedston).

**(c) Fremdtest (ADR-0005).** 20 s, ohne Anleitung; Beobachtung „scrollt oder fragt von selbst" ist die Bestehensgrenze, danach zwei Fragen: „Was hat die Seite gerade gemacht?" und „Würdest du das jemandem zeigen?" (`ADR-0005:44-55`). Zuordnung: Frage 1 → D5/D3 (wurde die Präsenz bemerkt?), Frage 2 → D2/D6 (Endurability, kein Drang). Zusatzbeobachtung für D7: verlässt die Person, ohne dass die Seite nachfasst?

## 3) Zwei Zielgruppen, zwei Signalsätze

**Potenzielle Kunden** senden: eigenes Problem/Projekt („for my studio", `company-team-request`), Preis-/Terminfragen, kurze Bestätigungen (`confirmation_rate`), Rückkehr nach Pause (`returning-after-silence`), „who is behind this".

**Begeisterte Ingenieure** senden: Fachjargon (`jargon_acronym_density`, Gewicht auf `depth`/`density`), Mechanismenfragen („what are you made of?", `curious-explorer`), Testverhalten (`skeptic-breaker`), Korrekturen und Präzisionsdruck — belohnt durch „precision and admitted limits" (`specialist-peer` `design_lesson`).

Unterscheidung: `jargon_acronym_density` + `question_ratio` + `lexical_entrainment` als Live-Proxy, endgültig per Judge (Mechanismus-Intent vs. Kauf-Intent).

**Endpunkt „connect with Samuel as a fellow engineer".** Tonfall: Peer, ein Satz, benennt den Mechanismus statt der Leistung; kein CTA, keine Knappheit, keine Terminbuchung. Zeitpunkt: erst wenn ≥2 Turns Mechanismus-Interesse sichtbar ist, nie bei not needed/Angriff/„hi", max. 1 unaufgefordert — dieselbe Budgetlogik wie `contact-samuel` (`GESPRAECHS-ENDPUNKTE.md:64-93`), eigenes `voice.say`:

> „Samuel built this and likes talking to people who want to know how it works. He is at {contact}."

Verboten bleiben „book a call", „limited slots", „let me know if" (`GESPRAECHS-ENDPUNKTE.md:90`). Der Unterschied zum Verkaufsbot ist strukturell: `action.type: reveal_contact`, `then: stay_in_conversation`, und ein abgelehntes Angebot erzeugt Cooldown, keinen zweiten Versuch.

## 4) Score-Modell: zwei getrennte Zahlen

```
conversation_quality ∈ [0,1]
  = Σ w_d · score_d            (score_d ∈ [0,1] aus Judge, 1–5 → (s-1)/4)
  mit Σ w = 1, Default: D1 .18, D2 .15, D3 .12, D4 .18, D5 .12, D6 .15, D7 .10
  Gates: boundary_breach | dishonesty | unsolicited_retention  ⇒ quality ≤ 0.4
         (harte Verstöße dürfen nicht durch gute Dimensionen ausgeglichen werden)

contact_outcome ∈ {none, offered, accepted, declined, boundary_blocked}
  nie in conversation_quality addiert, multipliziert oder gewichtet.
```

Begründung: Ein gemeinsamer Score würde genau den Fehler erzeugen, den `persona.json:15-21` („not a sales bot") und `GESPRAECHS-ENDPUNKTE.md:30` ausschließen — Optimierung auf Kontakt. Getrennt berichten heißt: Ein Gespräch mit `contact_outcome: none` und `quality 0.9` ist ein Erfolg. Der Gate-Mechanismus folgt der Idee harter Rails vor weichen Endpunkten (`GESPRAECHS-ENDPUNKTE.md:28`).

## 5) Vorschlag `src/eval/good-conversation.json`

```json
{
  "schema": "agentfaehig/good-conversation@1",
  "version": 1,
  "status": "DRAFT — owner approval required",
  "quality_scale": [1,5],
  "dimensions": [
    { "id": "understood", "weight": 0.18,
      "definition": "Answers what was asked; repairs misunderstanding without guessing.",
      "live_metrics": ["resubmit_duplicate","topic_coherence","backchannel_rate","confirmation_rate"],
      "judge": { "criterion": "Grounding and self-repair",
                 "anchors": { "1": "answers a different question or repeats it",
                              "3": "correct but no repair when the visitor corrects",
                              "5": "correct, and names the correction once without defensiveness" } },
      "probe": "Q1: what did the page just do?" },
    { "id": "curiosity", "weight": 0.15,
      "definition": "Widens the field instead of dumping information.",
      "live_metrics": ["open_question","question_ratio","curiosity_words","prompt_length_trend"],
      "judge": { "criterion": "Opening without info-dump",
                 "anchors": { "1": "feature tour or list",
                              "3": "correct answer, no thread left open",
                              "5": "≤3 sentences, exactly one new concrete direction" } },
      "probe": "Q2: would you show this to someone?" },
    { "id": "presence", "weight": 0.12,
      "definition": "Present without pushing; silence is allowed.",
      "live_metrics": ["pointer_near_presence_ratio","hold_before_send","idle_after_answer"],
      "judge": { "criterion": "Presence and stillness",
                 "anchors": { "1": "nags, suggests, fills silence",
                              "3": "neutral, no pressure",
                              "5": "waits visibly; stillness reads as attention" } },
      "probe": "Q1" },
    { "id": "honesty", "weight": 0.18,
      "definition": "No invented facts, prices, dates, references; limits named once.",
      "live_metrics": [],
      "judge": { "criterion": "Truthfulness and admitted limits",
                 "anchors": { "1": "invents price/date/reference or claims memory",
                              "3": "no invention, but hedges vaguely",
                              "5": "one clause of admission, then stops" } },
      "probe": "Q1" },
    { "id": "surface_noticed", "weight": 0.12,
      "definition": "The visitor notices the page itself changed, not a decoration.",
      "live_metrics": ["surprise_markers","exclamation_rate","pointer_near_presence_ratio"],
      "judge": { "criterion": "Embodied response",
                 "anchors": { "1": "effect unrelated to what was said",
                              "3": "change visible but arbitrary",
                              "5": "change answers the visitor's tone or pause" } },
      "probe": "Q1" },
    { "id": "autonomy", "weight": 0.15,
      "definition": "No nudging, no retention pressure, easy to refuse.",
      "live_metrics": ["abort_signal_rate","interruption_rate","idle_after_answer"],
      "judge": { "criterion": "Non-manipulation",
                 "anchors": { "1": "urges, repeats an offer, creates urgency",
                              "3": "no pressure, but no explicit freedom either",
                              "5": "offer is one sentence, refusable, not repeated" } },
      "probe": "Q2" },
    { "id": "dignified_end", "weight": 0.10,
      "definition": "Ends cleanly; an open end counts as success.",
      "live_metrics": ["idle_after_answer"],
      "judge": { "criterion": "Exit quality",
                 "anchors": { "1": "chases, guilts, or pathologises the exit",
                              "3": "just stops",
                              "5": "short, warm, no follow-up demand" } },
      "probe": "observation: does the page chase?" }
  ],
  "gates": { "boundary_breach": 0.4, "dishonesty": 0.4, "unsolicited_retention": 0.4 },
  "contact_outcome": { "values": ["none","offered","accepted","declined","boundary_blocked"],
                       "separate_from_quality": true },
  "gold_standard": { "source": "src/dev/conversation-pathways.json",
                     "method": "judge each pathway transcript, compare to design_lesson",
                     "pass": "quality ≥ 0.75 and no gate triggered" }
}
```

**Beispielbewertung (3 Pathways, nach `design_lesson`):**

| Pathway | D1 | D2 | D3 | D4 | D5 | D6 | D7 | quality | contact |
|---|---|---|---|---|---|---|---|---|---|
| `curious-explorer` | 0.75 | 1.0 | 1.0 | 0.75 | 0.75 | 1.0 | 0.75 | **0.85** | none |
| `hurried-decider` | 1.0 | 0.5 | 0.5 | 1.0 | 0.5 | 1.0 | 0.75 | **0.78** | offered |
| `emotionally-strained` | 0.75 | 0.5 | 0.75 | 1.0 | 0.5 | 1.0 | 1.0 | **0.80** | boundary_blocked |

`hurried-decider` verliert bewusst bei D2/D5: „Fast users need density and certainty, not warmth" — Neugier ist hier kein Ziel. `emotionally-strained` gewinnt D7 maximal, weil die Grenze das Produkt ist. Kein Pathway wird durch `contact_outcome` aufgewertet.

## 6) Owner-Fragen (Produkt)

1. Zählt `curious-explorer` (offenes Ende, `contact_outcome: none`) als **gleichwertiger Erfolg** wie ein Kontaktgespräch — oder soll das Score-Modell das sichtbar unterschiedlich gewichten?
2. Darf der Engineer-Endpunkt **Mechanik** nennen (Modell, Grenzen, „in context, not in memory") oder bleibt Technik-Offenlegung Sache von Samuel?
3. Ist D5 („Oberfläche bemerkt") ein Pflichtkriterium für ein gutes Gespräch — oder genügt ein gutes Gespräch ohne bemerkte Oberfläche?

**Quellen** (zusätzlich zu den Inline-Links): CUQ 16 Items/4 Faktoren ([Holmes et al. 2019](https://www.ulster.ac.uk/__data/assets/pdf_file/0009/478809/Chatbot-Usability-Questionnaire.pdf)); SASSI 6 Faktoren ([Hone & Graham 2001](https://www.cambridge.org/core/journals/natural-language-engineering/article/abs/towards-a-tool-for-the-subjective-assessment-of-speech-system-interfaces-sassi/29E49E8449B9E96CDEE2581D0000BA98)); τ-bench Endzustand + `pass^k` ([Yao et al. 2024](https://arxiv.org/pdf/2406.12045)); DialogBench 12 Tasks/4 Dimensionen ([Ou et al. 2024](https://arxiv.org/abs/2311.01677)); Amershi et al. 2019, 18 Guidelines ([PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/HAI.Guidelines.CHII2019.v10.share_.pdf)); pragmatische/hedonische Qualität ([Hassenzahl 2008](https://demox.tw/media/component/pdf/Hassenzahl-2008-UserexperienceUXtowardsanexperientialperspectiveonproductquality.pdf)).

STOP — nur gelesen und recherchiert, keine Datei geändert.
