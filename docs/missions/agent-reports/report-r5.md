I'll read the specified files first, then check the internal repo for prior art.
## Serendipität und unterschwellige Führung im Interface — Bericht (nur gelesen, nichts geändert)

**Prior-Art-Gate, Kurzfassung.** Intern bereits vorhanden: Calm Technology als Gestaltungsregel mit Teekannen-Bild (`research/EMBODIMENT-RECHERCHE.md:568-600`), „ambient first, explicit on demand" (`docs/visual-exploration/03-pathway-flow.md:16`), Dockets verworfener „ask-first hero" (`tech/research/konkurrenz.md:19`), und der Regelkern `src/agent/prompt.js:17-22`. Offiziell: Google Conversation Design (CC BY 4.0), Microsoft HAX, calmtech.com. Extern: unten je Prinzip. **Befund: es fehlt keine Idee, es fehlt die Dosierung — und ein Prüfer, der Gelenktes erkennt.**

### 1) Sieben Prinzipien, die Reagieren statt Führen erzeugen

1. **Kleinster Aufmerksamkeitsaufwand, Peripherie ↔ Zentrum.** „Technology should require the smallest possible amount of attention"; Ruhe heißt nicht Unsichtbarkeit, sondern ein Signal, das nicht klingelt ([calmtech.com](https://calmtech.com/), Prinzipien 1 und 3; [Weiser/Brown 1996](https://calmtech.com/papers/coming-age-calm-technology.html)). Für die Seite: die Augen dürfen einladen, aber nichts verlangen.
2. **Minimale gemeinsame Arbeit.** Sprecher investieren so wenig gemeinsamen Aufwand wie möglich; Verstehen ist ein Aushandeln, kein Abarbeiten ([Clark & Brennan 1991](https://doi.org/10.1037/10096-006)). Der Agent soll deshalb *weniger* tun als der Besucher, nicht mehr: kein Nachfassen, kein Weiterreichen, keine Aufgabe.
3. **Knappheit ist Kooperation, nicht Stil.** „Saying too much is as uncooperative as saying too little"; jede Zeile muss relevant sein ([Google, Learn about conversation](https://developers.google.com/assistant/conversation-design/learn-about-conversation), Grice-Maximen). Das ist heute schon Regel (`prompt.js:17`), aber nicht messbar.
4. **Die Pause gehört dem Besucher.** Turn-Taking ist ein System mit Rederecht-Übergabe; „Don't keep speaking after asking a question" und „only a single question at a time" ([Google, ebd.](https://developers.google.com/assistant/conversation-design/learn-about-conversation); [Sacks/Schegloff/Jefferson 1974](https://www.jstor.org/stable/412243)). Schweigen ist ein Zug, kein Loch.
5. **Neugier kommt aus einer Lücke, die der Besucher selbst schließen will.** Curiosity entsteht, wenn eine Informationslücke spürbar wird, *und* wenn schon etwas Wissen da ist (Tip-of-the-tongue) ([Loewenstein 1994](https://doi.org/10.1037/0033-2909.116.1.75)). Praktisch: die Lücke muss an dem hängen, was der Besucher gerade gesagt hat — nicht an einem Hook.
6. **Serendipität hat eine Mechanik: Trigger → Verbindung → Nachfolgen → Wert, mit einem unerwarteten Faden.** Wer sie bauen will, macht den Trigger billig (ein Wort, ein Blick), die Verbindung sichtbar (feiner Faden) und das Nachfolgen optional ([McCay-Peet & Toms 2015](https://doi.org/10.1002/asi.23273)). Ein „easter egg" ist genau das: kleiner Trigger, kein CTA.
7. **Langsamkeit und Ambiguität sind Ressourcen.** Slow Technology will „reflection and moments of mental rest rather than efficiency" ([Hallnäs & Redström 2001](https://link.springer.com/article/10.1007/PL00000019)); Ambiguität ist ein Designmaterial, das Interpretation beim Nutzer lässt ([Gaver et al. 2003](https://dl.acm.org/doi/10.1145/642611.642653)); reflexive Interfaces provozieren Nachdenken statt Gehorsam ([Sengers et al. 2005](https://dl.acm.org/doi/10.1145/1094562.1094569)).
8. **Die ethische Grenze ist Abweisbarkeit, nicht Absicht.** Nudges müssen transparent und leicht abwehrbar sein ([Sunstein 2015](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2526341)); „support efficient dismissal" und „efficient correction" ([MS HAX G8/G9](https://www.microsoft.com/en-us/haxtoolkit/library/)); was Lenkung verdeckt und Ausstieg verteuert, ist ein Dark Pattern ([Gray et al. 2018](https://dl.acm.org/doi/10.1145/3173574.3174108)).

### 2) Prompt-Regeln (English, additiv zu `prompt.js`)

```
REACTIVITY
1. Answer only what was asked. If the visitor's sentence is already complete, end there.
2. Never propose a next step, a topic, or a service. No "would you like", "shall I", "I can also".
3. Never assign the visitor a task. No "tell me three things", "say one more thing about X".
4. Default one sentence. Three only when the question is genuinely three-part.
5. Do not restate or paraphrase the question before answering.

INVITATIONS INSTEAD OF QUESTIONS
6. A question is allowed only when the answer cannot be given without it, at most once per conversation.
7. Prefer a half-open statement over a question: name one concrete detail and stop. ("Old doors." not "What do you make?")
8. Mirror at most one of the visitor's words. Never echo the whole sentence back.

SILENCE AND EXITS
9. When the visitor sends a bare "ok", "cool", "hi": acknowledge in three words or fewer and stop. ("Mm." / "No rush.")
10. Ending the exchange is a success, not a failure. Do not fill a silence to keep the conversation alive.
11. Never chase. No "come back", no "before you go", no re-opening after goodbye.

OFFERS
12. Samuel may be mentioned at most once per conversation, in one clause inside an answer, and never after a greeting, a test, or distress.
13. When you do not know: one clause, no redirect into a question. Stop.

TEXTURE
14. One dry aside per conversation, maximum. No emoji, no exclamation, no stage directions.
15. Answer at the visitor's level of abstraction: if they named a thing, stay with the thing.
```

### 3) Gegenbeispiele — was heute tatsächlich lenkt

Die Datei verstößt gegen ihre eigene Regel: `style.js:96` erlaubt eine Frage erst ab `openness >= 0.66`, aber **alle fünf Frage-Turns der 75 Beispiel-Turns liegen darunter**:

- `hesitant-quiet`, openness 0.5: „Something specific, or the whole thing?" und „Good. What should it say when someone arrives and says nothing?" — das „Good." bewertet den Besucher, die Frage verlangt eine Antwort.
- `emotionally-strained`, 0.4: „Which one keeps coming back?" — Intake-Frage bei einem belasteten Besucher; das ist Therapeuten-Geste, nicht Präsenz.
- `company-team-request`, 0.5: „Evening. What would the team need to ask it, on a normal day?" — Begrüßung plus Verhör.
- `non-native-speaker`, 0.5: „A furniture page. What should a visitor feel first: the wood, or you?" — erzwungene Binärwahl, Design-Hausaufgabe.

Schwerer wiegt, was der `?`-Check **nicht** sieht: Imperative. `hurried-decider`: „Tell me where to send it and I will make sure it reaches him." `non-native-speaker`: „Then say one more thing about the furniture." `person-pathway`: „Three things you would say at a first meeting, and one thing you would never say." `interrupter`: „Shorter: say the rest when you know it." Das sind Formulare im Gesprächskleid — der Agent führt, weil er Aufgaben verteilt, nicht weil er fragt.

Weitere Muster: jede „I can…"- oder „If you want…"-Konstruktion; jede Zusammenfassung („In summary" ist schon verboten, `prompt.js:33`); jedes Angebot als eigener Block statt als Clause (verbietet `persona.json:132` bereits); und `persona.json:130` (`max_unprompted_per_conversation: 1`) ist richtig, aber ungeprüft.

### 4) Zusammenspiel mit den 12 Parametern

Kein 13. Parameter (AGENTS.md: keine neuen Config-Keys ohne Freigabe). Die Technik wird auf die bestehenden Achsen dosiert:

| Parameter | Technik, die er dosiert | Dose |
|---|---|---|
| `openness` | Erlaubnis für *eine* Frage | Schwelle auf **0.75**; darunter nur Halbsatz-Einladung |
| `density` | Länge, Zahl der offenen Details | 0.2–0.5: ein Detail; >0.6: keine Lücke (Lücke braucht Luft) |
| `tempo` | wer den Boden hält | >0.7: kürzere Turns, schneller zurückgeben; <0.3: Pause stehen lassen |
| `calm` | Schweigen ungefüllt lassen | >0.7: kein Nachfassen, kein Füllsatz |
| `warmth` | Continuers („Mm.", „No rush.") | 0–3 Marker, nie als Frage getarnt |
| `closeness` | Spiegeln | ≤0.35: kein Echo; ≥0.68: ein Wort |
| `attention` | Rückbezug auf den letzten Satz | hoch: Faden halten; niedrig: antworten und stoppen |
| `certainty` | Aussage vs. Hedging | hoch: keine Weichmacher, aber auch keine erfundene Tatsache |
| `depth` | konkret vs. Muster | niedrig: beim genannten Ding bleiben (wichtig gegen Dozieren) |
| `formality` | Register | nur Wortwahl, nie Distanz erzeugen |
| `playfulness` | Easter-Egg-Budget | ≤1 trockene Bemerkung, kein Witz-Angebot |
| `energy` | Verbstärke | hoch: aktive Verben, nicht mehr Sätze |

Die fehlende Achse ist nicht ein Parameter, sondern eine **abgeleitete Größe**: `reach = openness × (1 − density) × calm`. Sie steuert allein, ob ein unaufgefordertes Samuel-Angebot überhaupt erlaubt ist. Damit bleibt `persona.json` unverändert, und die „unterschwellige Führung" ist an genau einer Stelle sichtbar und testbar.

### 5) Wie man misst, ob es wirkt

Vorhandene Signale aus `src/metrics/metrics-catalog.json` (Gruppen `interaction`, `discourse`) reichen: `turn_interval_median`, `idle_after_answer`, `typing_burst_length`, `backspace_ratio`, `hidden_time_ratio`, `window_blur_rate`, `question_rate`, `topic_shift_score`, `confirmation_rate`, `backchannel_rate`.

Vier Kennzahlen, die das Problem direkt treffen:

- **visitor_word_share** = Besucherwörter / Gesamtwörter. Steigt, wenn der Besucher führt. Primärziel.
- **agent_question_rate** = Agent-Turns mit Frage / Agent-Turns. Ziel ≤ 0,10. Heute: 5/75 = 0,067 — sieht gut aus, ist es aber nicht, weil die Imperative fehlen; deshalb zusätzlich **agent_directive_rate** (Imperativ- und Aufgaben-Erkennung, `imperative_mood` existiert bereits im Katalog).
- **voluntary_return** = Wiederkommen ohne Prompt, plus `open_end_kept` = Anteil Gespräche, die ohne Angebot enden und trotzdem nicht als Abbruch zählen.
- **contact_rate** und **link_click_rate** wie vom Owner genannt — aber nur als Sekundärziel, sonst optimiert man auf Conversion.

Gegen Goodhart ([Manheim & Garrabrant 2018](https://arxiv.org/abs/1803.04585)): Gesprächsdauer allein belohnt Festhalten. Deshalb Dauer nur zusammen mit `visitor_word_share` und `voluntary_return` bewerten, im HEART-Rahmen (Engagement + Task Success getrennt, [Rodden et al. 2010](https://dl.acm.org/doi/10.1145/1753326.1753383)). Für „100 Systeme": Prompt-Varianten als Arme, Thompson Sampling ([Russo et al. 2018](https://arxiv.org/abs/1707.02038)) mit harten Guardrails (kein Angebot bei Distress/Angriff — nie optimierbar), Primärmetrik vorab fixiert, Grenzwerte für `agent_directive_rate` als Constraint, nicht als Ziel.

### 6) Upstream (mit Lizenz)

- Google Conversation Design — Doku **CC BY 4.0**, Code Apache-2.0; Plattform seit 13.06.2023 deprecated, die Prinzipien gelten weiter ([Seite](https://developers.google.com/assistant/conversation-design/learn-about-conversation)).
- Microsoft HAX, 18 Guidelines, CHI 2019 — Papier peer-reviewed, Webtexte frei lesbar ([Library](https://www.microsoft.com/en-us/haxtoolkit/library/)).
- calmtech.com — Calm Technology® ist **registrierte Marke**; Prinzipien zitierbar, Name geschützt ([calmtech.com](https://calmtech.com/)).
- Erika Hall, *Conversational Design*, A Book Apart 2018 — kommerzielles Buch ([abookapart.com](https://abookapart.com/products/conversational-design)).
- McCay-Peet & Toms 2015 — **CC BY-NC-ND 4.0** (offen, aber keine kommerzielle Bearbeitung) ([PDF](https://eprints.whiterose.ac.uk/id/eprint/88721/7/Serendipity.pdf)).
- Hallnäs & Redström 2001 — closed, Autoren-PDF ([redstrom.se](http://redstrom.se/johan/papers/slowtech.pdf)).
- Gaver et al. 2003, Sengers et al. 2005, Gray et al. 2018, Rodden et al. 2010 — ACM, zitierbar, nicht kopierbar.
- Loewenstein 1994 — APA, paywalled. Sunstein 2015 — SSRN, frei.
- Kein Datensatz nötig: die 13 Pathways (`src/dev/conversation-pathways.json`, als synthetisch markiert) sind der Evaluationssatz.
- Repos (Parlant Apache-2.0, Rasa CALM, NeMo Guardrails) wurden in `GESPRAECHS-ENDPUNKTE.md` schon bewertet — für diese Frage liefern sie nichts Neues.

### 7) Empfehlung

**ADAPT + INTEGRATE, nicht BUILD.** Die Regeln aus §2 als Prompt-Block übernehmen (Quelle: Google/Hall/Calm, CC-BY bzw. zitierfähig), `style.js:96` auf 0.75 heben, und — wichtiger als beides — **einen Prüfer bauen, der Gelenktes erkennt**: `?`-Zählung genügt nicht, Imperative und Aufgaben müssen mitgezählt werden, sonst bleibt der Agent höflich-lenkend und die Metrik grün. Erst danach über 100 Varianten messen, mit `agent_directive_rate` als Constraint.

Ehrliche Einschränkung: Für „reaktive Agenten auf Marketingseiten" gibt es keine kontrollierte Evidenz; die Principles sind Design-Kanon (Evidenz A/B), keine gemessene Wirkung. Und die fünf Regelverstöße in den Pathways sind der eigentliche Befund — der Agent führt, weil seine eigenen Beispiele führen, nicht weil der Prompt es verlangt.

DONE — nur gelesen und recherchiert, keine Datei geändert.
