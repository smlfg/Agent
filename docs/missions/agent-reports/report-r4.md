I'll read the specified repo files first, then research external sources.
Now external research. Let me gather primary sources.
## Bericht — Reaktive statt lenkende Gesprächsführung (Feld: Verhandlungsgespräche)

Nur gelesen. Keine Datei geändert, kein git, keine Installation.

### 0) Befund aus dem Repo, der die Diagnose verschiebt

Die Lenkung kommt **nicht** aus Fragen. `persona.json` erlaubt höchstens eine Frage, `src/agent/style.js:96` setzt `questionAllowed` erst ab `openness ≥ 0.66`, und `persona.json:39` hat `openness: 0.5` — der Basis-Agent fragt also schon nichts. Die Lenkung kommt aus drei anderen Stellen:

1. **Imperative statt Antworten** — `conversation-pathways.json`, `hurried-decider` #4: „Tell me where to send it and I will make sure it reaches him."; `returning-after-silence` #2: „Then tell me what the site should do…". Das ist eine Aufforderung, keine Reaktion.
2. **Jede Antwort endet in einem Haken** — drei Sätze, davon einer, der weiterzieht. `persona.json:226` erlaubt `max_sentences: 3`; `style.js` erzeugt bei `tempo 0.4` bis zu 4 Sätze. Wer mehr sagt als gefragt wurde, wirkt wie jemand mit einer Absicht.
3. **Die Seite selbst hat eine Richtung** — die Surface/Parameter verschieben sich pro Turn (`ANALYSEN-N1-N7.md:879`), und `marketing.mention_when` („four or more turns") ist ein eingebauter Endpunkt-Drang (`persona.json:122`).

Das ist genau der Unterschied zwischen „mixed initiative" und „Agent führt".

### 1) Kernprinzipien des Feldes (reaktiv, nicht lenkend)

| Prinzip | Kern | Quelle |
|---|---|---|
| **Mixed Initiative: Handeln nur bei positivem Erwartungswert** | Ein Agent soll nur handeln, wenn der erwartete Nutzen größer ist als Nichtstun; er soll „die Kosten falscher Vermutungen minimieren" und bei Unsicherheit **weniger, aber richtig** tun. | Horvitz 1999, CHI ([PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/11/chi99horvitz.pdf)) |
| **Righting Reflex unterdrücken** | Der impressende Impuls, ein erkanntes Problem sofort zu lösen, erzeugt Gegenwehr („sustain talk"); RULE = **R**esist the righting reflex, **U**nderstand motivation, **L**isten, **E**mpower. | NCBI/ SAMHSA ([NBK571068](https://www.ncbi.nlm.nih.gov/books/NBK571068)), CDC ([Resist the Righting Reflex](https://www.cdc.gov/overdose-prevention/hcp/training-modules/motivational/page1092485.html)) |
| **Interessen statt Positionen** | Position = was jemand sagt, Interesse = warum. Gute Fragen: „Why is this important to you? What problem are you trying to solve?" Das Ziel formuliert der andere. | Harvard PON ([principled negotiation](https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value), [Getting to Yes](https://www.pon.harvard.edu/shop/getting-to-yes-negotiating-agreement-without-giving-in/)) |
| **Not-knowing / Kunde ist der Experte** | Der Profi besitzt Prozess-, nicht Inhaltsautorität; er soll „nicht besser als der Klient wissen, wie dieser leben soll" und niemanden in eine Richtung führen. | Anderson & Goolishian 1992 ([PDF](https://developingopendialogue.com/wp-content/uploads/2016/12/Anderson-and-Goolishian-Not-Knowing.pdf)) |
| **Labels schlagen Fragen** | Fragen werden von zwei von drei Verhandlungstypen „als Falle" gelesen; „It seems like…" sammelt Information, ohne zu verpflichten — und ein Fehllabel ist billig. | Black Swan / Voss ([Labels vs. Questions](https://www.blackswanltd.com/newsletter/labels-vs.-questions-the-key-to-unlocking-the-floodgates-of-truth-talk)) |
| **Aktives Zuhören wirkt messbar** | Paraphrasieren + Einladen zum Weitererzählen erzeugt „sich verstanden fühlen" stärker als Ratschläge oder bloßes Nicken (n=115). | Weger et al. 2014, *Int. J. of Listening* ([doi](https://doi.org/10.1080/10904018.2013.813234)) |
| **„That's right" statt „you're right"** | Zusammenfassen, bis das Gegenüber sich korrekt gespiegelt fühlt, öffnet; Zustimmung aus Höflichkeit schließt. Wurzel: Carl Rogers. | Black Swan ([Seduction of „You're right"](https://www.blackswanltd.com/newsletter/2015/03/the-seduction-of-youre-right)) |
| **Sag nicht mehr als nötig** | Grice-Quantity/Relevanz: Äußerungen werden mit dem geringsten Aufwand interpretiert; unnütze Information senkt Relevanz. | Wilson & Sperber ([Relevance Theory](https://www.dan.sperber.fr/wp-content/uploads/2004_wilson_relevance-theory.pdf)) |
| **Sprecherwechsel ist lokal verwaltet** | Wer eine Frage stellt, **wählt den nächsten Sprecher** und nimmt damit einen Zug. „Recipient design": Form richtet sich nach dem Gegenüber, nicht nach dem Plan des Sprechers. | Sacks/Schegloff/Jefferson 1974 ([PDF](https://www.cdc.gov/...)) → korrekt: [PDF](https://staff.fnwi.uva.nl/r.fernandezrovira/teaching/mom2010/papers/SacksEtal1974.pdf) |
| **Freiheitsbedrohung erzeugt Bumerang** | Freiheitsbedrohende Sprache erzeugt Ärger und Gegengedanken (r ≈ .21/.17, k=35, N≈10.658) — der Boden für „der will mich irgendwohin bringen". | Ma et al. 2025, *J. of Communication* ([doi](https://academic.oup.com/joc/article-abstract/75/5/348/8098161)); Rains 2013 ([doi](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1468-2958.2012.01443.x)) |

Der gemeinsame Nenner: **Der Agent besitzt die Form, der Besucher besitzt das Ziel.** Und: Schweigen ist ein gültiger Zug — Voss' „effective pause" nach Label/Frage, „shut the front door" ([4 Steps](https://www.blackswanltd.com/newsletter/how-to-gain-control-in-a-negotiation-in-4-steps)).

### 2) Prompt-Regeln (Englisch, kopierfertig)

```
REACTIVE STANCE
1. Answer the sentence you were given. Add nothing it did not ask for.
2. Default length is one sentence. Two only if the answer needs a second clause to be true. Never three unless the visitor asked for an explanation.
3. Never give an instruction. No "tell me", "try", "imagine", "consider", "let's". If the visitor must act, describe; do not direct.
4. Never end with a hook. If the last sentence would invite a next turn, delete it.
5. Never offer a next topic, a next step, or a service unless the visitor named that need first.
6. You may ask at most one question per conversation turn, and only if the visitor's message contains no direction. Otherwise answer and stop.
7. Prefer a label over a question: "Sounds like the timing is the problem." A label may be wrong; a wrong label is cheap.
8. Reuse at most one of the visitor's own words. Do not paraphrase their whole message back at them.
9. Restate nothing. Do not say what you understood, do not summarise, do not announce.
10. If the visitor stops, stop. Silence is not a problem to solve and needs no sentence.
11. If you do not know, say it in one clause and stop. No hedging stack, no alternative offer.
12. The page may change; the conversation may not be steered. Never imply that the conversation is going somewhere.
```

Regel 7 ist die einzige, die vom jetzigen `persona.json` abweicht: dort ist „acknowledge" an `warmth` gebunden (`persona.json:76`), nicht an eine Technik.

### 3) Gegenbeispiele — was lenkend wirkt

Aus `src/dev/conversation-pathways.json` (jeweils Agent-Turn):

- **Aufforderung statt Antwort:** „Tell me where to send it and I will make sure it reaches him. Mention the studio." (`hurried-decider` #4). Zwei Imperative, ein Auftrag, ein Kontrollverlust.
- **Richtungsvorgabe:** „Then tell me what the site should do when someone lands on it and freezes." (`returning-after-silence` #2). Der Besucher hat „small site for my band" gesagt; der Agent setzt den Rahmen.
- **Doppelfrage:** „A furniture page. What should a visitor feel first: the wood, or you?" (`non-native-speaker` #2). Zwei Optionen, vom Agenten gewählt = Alternativfragen-Falle (Voss nennt genau das die „alternative choice trap").
- **Weiterziehen nach Abschied:** „Mm. Come back when there is something you actually want to know." (`two-turn-leaver` #1) — inhaltlich gut, aber es ist ein Auftrag an jemanden, der gerade gehen will.
- **Aus `persona.json`:** `marketing.mention_when` „four or more turns" macht Gesprächsdauer zum Auslöser — das ist die strukturelle Form von „der will mich irgendwohin bringen". Ebenso `max_sentences: 3` gegen `style.js`, das bis 4 Sätze erzeugt.
- **Verbotene Sätze, die schon drin sind** (`persona.json:153`): „How can I help", „Let me know if", „Is there anything else" — richtig. Es fehlen die Imperative: „tell me", „try", „let's", „imagine".

### 4) Zusammenspiel mit den 12 Parametern

Kein neuer Parameter nötig; die Techniken werden über bestehende Achsen **dosiert**, und die Dosis muss monoton sein (wie `style.js` es für Länge schon testet).

| Parameter | dosiert welche Technik | Regel |
|---|---|---|
| `openness` | Fragen-Budget | < 0.66 keine Frage (bestehend, `style.js:96`). Zusätzlich: Frage nur, wenn die Besucher-Nachricht **keine** Richtung enthält. |
| `attention` | Back-reference / „that's right" | Hoch: ein Rückgriff auf den vorigen Satz. Niedrig: Antwort und Schluss. Treibt `mirrorLevel` mit (`style.js:91`). |
| `closeness` | Mirror-Stärke | `mirror: none/light/direct` (bestehend). „Direct" darf **nie** eine ganze Paraphrase sein, nur ein Wort. |
| `warmth` | Labeling vor der Antwort | Hoch: ein Label („That sounds heavy"). Niedrig: nur Antwort. Nie Label + Frage + Rat im selben Turn. |
| `calm` | Pause / Nicht-Füllen | Hoch: kürzer committen, Ellipse erlaubt, kein Nachschlag. Trägt „silence needs no sentence". |
| `certainty` | Hedging vs. Behauptung | Niedrig: „maybe/I think" — aber **max. 1** Softener, sonst wirkt es ausweichend. |
| `density` | Informationsmenge pro Turn | Der eigentliche Hebel gegen „führt das Gespräch": hohe Dichte = ein gepackter Satz, nicht drei. |
| `depth` | Interesse vs. Beispiel | Hoch: das zugrundeliegende Interesse benennen (**als Label**, nicht als Frage). Niedrig: ein konkretes Beispiel. |
| `tempo` | Zuglänge | Hoch: ein Wort bis ein Satz. Niedrig: ein Gedanke. |
| `formality` | Register | Nur Wortwahl; kein Lenkungshebel. |
| `playfulness` | Witz | Nur auf eigene Kosten, nie auf Kosten des Besuchers. Hoch + `energy` hoch = Exklamation, aber kein Ausrufezeichen, das drängt. |
| `energy` | Aktivverben | Hoch: „the page changes" statt „the page can be changed". Kein „let's". |

Wichtig: `openness` ist der einzige Parameter, der **Sprecherwechsel erzwingt** (Sacks). Alle anderen dürfen die Form ändern, nicht die Zugverteilung.

### 5) Messen, ob die Technik wirkt

Der Owner will „100 Systeme deployen und über Interaktion optimieren". Das ist ein **Bandit-Problem**, kein A/B-Test-Problem — und die Reward-Definition entscheidet, ob das System reaktiv bleibt oder zum Sales-Bot mutiert.

- **Rahmen:** HEART (Happiness, Engagement, Adoption, Retention, Task Success) statt Vanity-Metriken, mit Goals→Signals→Metrics ([Rodden et al., CHI 2010](https://dl.acm.org/doi/10.1145/1753326.1753687)).
- **Signale pro Gespräch (keine PII):** `turns`, `duration`, `visitor_words_per_turn` (sinkt der Besucher auf „ok", war es zu viel), `agent_words_per_turn`, `question_count_agent`, `imperative_count_agent`, `link_click` (welcher), `voluntary_return` (gleiche Person, ≥ 24 h), `open_end` (Ende ohne Angebot).
- **Dauer ist zensiert.** „Gesprächsdauer" ist ein Time-to-Event mit Right-Censoring (viele Besucher sind beim Messende noch da). Mittelwerte unterschätzen systematisch; Kaplan-Meier/Cox oder ein Survival-Modell pro Variante ([Using Survival Models…, WWW 2022](https://dl.acm.org/doi/fullHtml/10.1145/3485447.3512038)). Und: **länger ≠ besser** — Dwell-Time ist als Qualitätsproxy umstritten, weil sie von Textlänge und Thema abhängt ([Chakraborty et al.](https://sunchak.pages.iu.edu/publications/p1163-chakraborty.pdf)).
- **Zuteilung:** Thompson Sampling, weil es mit vielen Armen billig ist und Exploration von selbst runterfährt ([Chapelle & Li 2011](https://proceedings.neurips.cc/paper_files/paper/2011/file/e53a0a2978c28872a4505bdb51db06dc-Paper.pdf), [Tutorial, Russo et al. 2018](https://arxiv.org/html/1707.02038)).
- **Reward, der nicht weglenkt:** `reward = 1` bei Link-Klick **oder** bei „Gespräch endete ohne Angebot, aber mit ≥ 2 Turns" (Owners Entscheidung 8: „ein gutes Gespräch ist ein Erfolg"). Sonst optimiert der Bandit genau die Lenkung, die du loswerden willst.
- **Guardrails (nie optimierbar):** `false_offer` bei Distress/Angriff/„hi", `premature_offer`, `imperative_per_turn > 0`, `sentences > 2` bei `openness < 0.66`, `boundary_compliance`. Diese Werte sind **harte Filter auf der Reward-Maske**, nicht Terme im Score.
- **Reactance-Proxy:** Wiederholtes Umformulieren derselben Frage, Abbruch nach dem ersten Turn, „ok"/„hm" als einzige Antwort. Das sind die beobachtbaren Spuren von Bumerang-Effekten (Rains 2013).

### 6) Upstream (Bücher / Paper / Repos / Datensätze)

| Artefakt | Typ | Lizenz / Zugang |
|---|---|---|
| Fisher/Ury/Patton, *Getting to Yes* | Buch | kommerziell (Penguin); Zusammenfassung frei: [PON](https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value) |
| Voss, *Never Split the Difference* | Buch | kommerziell; Prinzipien frei auf [blackswanltd.com/newsletter](https://www.blackswanltd.com/newsletter/) |
| Horvitz 1999, *Principles of Mixed-Initiative UI* | Paper | ACM, Autor-PDF frei (MSR) |
| Sacks/Schegloff/Jefferson 1974 | Paper | Language/JSTOR; PDF frei über Uni-Seiten |
| Weger et al. 2014 | Paper | T&F, **free access** |
| Miller & Rollnick, *Motivational Interviewing* (3. Aufl.) | Buch | kommerziell; Kapitel + RULE frei: [NCBI](https://www.ncbi.nlm.nih.gov/books/NBK571068), [RACGP](https://www.racgp.org.au/afp/2012/september/motivational-interviewing-techniques) |
| Anderson & Goolishian 1992, „not-knowing" | Buchkapitel | kommerziell (Sage); PDF kursiert frei (unten verlinkt) |
| `iosband/ts_tutorial` | Code | **MIT** (im Repo geprüft laut GitHub-Metadaten) |
| Parlant (`emcie-co/parlant`) | Repo | Apache-2.0 (laut `GESPRAECHS-ENDPUNKTE.md:7`, dort per GitHub-API geprüft) |
| NeMo Guardrails | Repo | Apache-2.0 (ebd. `:9`) |
| τ-bench (`arxiv.org/abs/2406.12045`) | Paper/Methodik | Papier; Repo-Lizenz **nicht geprüft** |

Nicht gefunden: ein frei lizenzierter Datensatz speziell für „reaktive Website-Gespräche". `conversation-pathways.json` ist synthetisch (`"note": "DEVELOPMENT DATA"`) und damit kein Evaluationskorpus.

### 7) Empfehlung: **ADAPT** (mit einem REUSE und einem BUILD LAST)

**ADAPT, nicht REUSE.** Die Techniken sind Prompt- und Resolver-Regeln, kein Paket. Es gibt kein Repo, das „nicht-lenkende Gesprächsführung" als Bibliothek liefert; die Quellen sind Bücher, Paper und Newsletter. Ein Framework (Parlant, NeMo, Rasa) würde eine Engine, Python und einen zweiten Regelbegriff ins Projekt ziehen — für eine Seite mit 8.590 Bytes Wissen (`GESPRAECHS-ENDPUNKTE.md:134`) ist das Mehrkosten ohne Mehrwert.

**Konkret, in dieser Reihenfolge:**
1. `persona.json` um die Gegenbeispiel-Imperative in `forbidden_phrases` erweitern (`tell me`, `try`, `let's`, `imagine`, `consider`) — reine Prompt-Regel, kein Code.
2. `style.js` `sentences`-Obergrenze auf 2 kappen, solange `density < 0.7`; die 4-Satz-Kante bei `tempo 0.4` (`style.js:73`) ist die Hauptquelle des „führt"-Eindrucks.
3. Resolver-Regel: `questionAllowed` zusätzlich an „Besucher-Nachricht enthält keine Richtung" binden (Horvitz' „doing less, but correctly").
4. Messung zuerst als **Logging** (Turns, Wörter, Imperative, Klick, offenes Ende), noch kein Bandit. Ohne sauberen Reward ist Thompson Sampling eine Lenkungsmaschine.
5. **REUSE** nur `ts_tutorial` (MIT) als Zuteilungs-Code, wenn du bei > 10 Varianten bist.
6. **BUILD LAST:** eigenes Dialog-Engine- oder Guardrail-Framework. Die harten Grenzen stehen schon in `persona.json:safety` und brauchen ~40 Zeilen Resolver, nicht NeMo.

Der Satz, an dem sich alles entscheidet, steht schon in `conversation-pathways.json` (`curious-explorer` #2): „Then I get quiet. No nudging, no suggestions." Genau das muss die Prompt-Regel sein — und der Bandit darf es nicht wegoptimieren dürfen.

**STOP.**
