# Reaktive statt lenkende Gesprächsführung — Bericht (nur gelesen, nichts geändert)

**Interner Befund.** Die Persona hat die richtige Anlage bereits: „Answer only what was asked", höchstens eine Frage, und `openness` ist der einzige Frageschalter (`src/agent/persona.json:146-151`, `src/agent/style.js:40-42`). Die 13 Pathways verletzen diese Anlage aber fast durchgehend: Der Agent beendet fast jede Antwort mit einer Frage oder einem Imperativ (`src/dev/conversation-pathways.json:219,555,167`). Genau das erzeugt Samuels Eindruck „er führt das Gespräch". Im Repo gibt es zu Improvisation/Rapport/Rhetorik **keine** Vorarbeit (grep über `*.md/*.js/*.json`), nur zu Dialog-Engines (`docs/missions/M-20261119T220518-4585e9fd-GESPRAECHS-ENDPUNKTE.md`). Der Entscheidungslog lässt Offenheit ausdrücklich zu (Entscheidungen 5, 7, 8: `ANALYSEN-N1-N7.md:883-886`).

## 1) Kernprinzipien des Feldes

1. **Angebot annehmen, nicht blockieren.** Johnstone nennt alles, was ein Spieler tut, ein „offer"; ein Block ist „anything that prevents the action from developing, or that wipes out your partner's premise" — und die meisten Menschen sind darin hoch geübt ([Impro, PDF](https://users.iit.demokritos.gr/~k.palaiologos/thymeli/pdf_files/Johnstone,%20Keith%20(1981),%20Impro_%20Improvisation%20and%20the%20Theatre,%20London_Methuen%20Drama.pdf)).
2. **Status minimal dosieren.** Nicht über oder unter dem Gegenüber spielen, sondern „just a little above or below", sonst wird die Interaktion theatralisch statt echt (ebd.). Ein Experte, der erklärt, spielt hohen Status; ein Zuhörer, der bewertet, ebenfalls.
3. **Der nächste Zug gehört dem Gegenüber.** Turn-Taking ist „locally managed, party-administered, interactionally controlled" ([Sacks/Schegloff/Jefferson 1974](https://www.conversationanalysis.org/mp-files/simplest-systematics-for-the-organization-of-turn-taking-for-conversation-language.pdf/)). Wer jede Antwort mit einer Frage schließt, entzieht dem Besucher die Selbstwahl.
4. **Präferenzorganisation beachten.** Zustimmung kommt ohne Pause und unvermittelt; Ablehnung wird verzögert, abgefedert, begründet ([Pomerantz](https://www.apomerantz.com/wp-content/uploads/2015/04/agreeingdisag23d.pdf)). Reaktiv heißt: die *Form* des präferierten Zuges wählen, ohne inhaltlich Zustimmung zu erzwingen.
5. **Grounding statt Vollständigkeit.** Kommunikation arbeitet nach dem „principle of least collaborative effort"; man sagt so viel, wie zum gegenseitigen Verstehen nötig ist — nicht so viel, wie man weiß ([Clark & Brennan 1991](https://web.stanford.edu/~clark/1990s/Clark%2C%20H.H.%20_%20Brennan%2C%20S.E.%20_Grounding%20in%20communication_%201991.pdf)).
6. **Reparatur dem Sprecher überlassen.** Selbstreparatur ist strukturell präferiert; Fremdreparatur soll nur die Stelle zeigen, nicht die Korrektur liefern ([Schegloff/Jefferson/Sacks 1977](https://www.troyspier.com/assets/files/bibliographies/discourse/schegloff_jefferson_sacks_preference_self_correction.pdf)). Minimalzeichen wie „mm" sind „continuers": Sie geben den Zug zurück, statt ihn zu übernehmen ([Schegloff 1982](https://www.conversationanalysis.org/mp-files/discourse-as-interactional-achievement-some-uses-of-uh-huh-and-other-things-that-come-between-sentences.pdf/)).
7. **Rat ist asymmetrisch und gesichtsbedrohend.** Unggefragter Rat erzeugt Widerstand; er funktioniert nur, wenn er erfragt oder durch eine Problemschilderung vorbereitet ist ([Heritage & Sefi 1992](https://www.cambridge.org/core/elements/advice-in-conversation/9E68E3E402CD45F386E6611821A08330); [Brown & Levinson, FTA](https://www.tandfonline.com/doi/full/10.1080/0163853X.2018.1470440)).
8. **Rapport = Aufmerksamkeit + Positivität + Koordination**, wobei in frühen Begegnungen Positivität und Aufmerksamkeit stärker wiegen als Koordination ([Tickle-Degnen & Rosenthal 1990](https://www.justinecassell.com/discourse07/week3/TickleDegnenRosenthal_NatureofRapport.pdf)).
9. **Phatische Rede stiftet Bindung, nicht Information.** „How do you do" ist kein Datenaustausch ([Malinowski 1923](https://www.taylorfrancis.com/chapters/edit/10.4324/9780203597071-35/bronislaw-malinowski-phatic-communion)); Small Talk ist eine eigene kommunikative Modalität ([Coupland](https://doi.org/10.4324/9781315838328-1)).
10. **Initiative ist ein Kostenfaktor.** Mixed-Initiative-Prinzipien verlangen, Unsicherheit über Ziele und Aufmerksamkeit des Nutzers zu berücksichtigen und im Zweifel weniger zu tun ([Horvitz 1999](https://erichorvitz.com/uiact.htm)). Empirisch: Antizipatorische Hilfe erzeugt Selbstbedrohung und senkt Annahme und Nutzung ([CHIWORK 2026](https://dl.acm.org/doi/10.1145/3808045.3808054)); ungefragte Empfehlungen, die der Ersteinschätzung widersprechen, erzeugen Reactance ([Fitzsimons & Lehmann 2004](https://pubsonline.informs.org/doi/10.1287/mksc.1030.0033)); Nutzer fürchten Kontrollverlust und Aufdringlichkeit ([Proactivity Dilemma](https://dl.acm.org/doi/fullHtml/10.1145/3543829.3543834)).
11. **Stille ist eine Technik.** Wartezeiten von drei Sekunden verändern Antwortlänge, Spekulation und die Zahl der Fragen des Gegenübers ([Rowe 1974](https://onlinelibrary.wiley.com/doi/10.1002/tea.3660110202)).
12. **Reincorporation statt neuer Themen.** Der Improvisator geht rückwärts: Er formt die Geschichte aus dem, was schon liegt ([Johnstone, Impro Kap. 4](https://users.iit.demokritos.gr/~k.palaiologos/thymeli/pdf_files/Johnstone,%20Keith%20(1981),%20Impro_%20Improvisation%20and%20the%20Theatre,%20London_Methuen%20Drama.pdf)).

## 2) Prompt-Regeln (Englisch, für 1–3 Sätze)

```
OFFER
1. Treat every visitor message as an offer. Continue its premise; never replace it with your own.
2. Accept the social offer, not necessarily the factual claim. If a fact is wrong, say so in one clause and stay in their frame.
3. Do not introduce a topic, example, opinion, evaluation, or next step the visitor did not bring.
4. Do not use "we". There is no shared plan unless the visitor names one.

TURN
5. Answer what was asked, then stop. No preface, no summary, no offer of further help.
6. Do not end with a question unless openness is high. If you ask, ask one open question and make it ignorable.
7. Never issue an imperative that assigns the visitor work ("tell me…", "send me…", "name three…").
8. If the visitor stops, stop. Silence is a valid response, not a gap to fill.

RELATION
9. Do not praise, grade, diagnose, coach, or compliment. Acknowledgement is not evaluation.
10. Give advice only when explicitly asked; then one sentence and return the turn.
11. Use one of the visitor's own nouns at most once. Do not mirror their mood.
12. No joke performance. At most one dry aside, and only if playfulness is high.

TRUTH
13. If you do not know, say so in one clause and stop. Do not bridge to Samuel, a call, or a link.
14. Never ask for data. Mention Samuel only when the visitor asks who is behind this or describes a problem his work answers — never because a turn count was reached.
```

## 3) Gegenbeispiele aus den Pathways

| Zitat | Stelle | Warum lenkend |
|---|---|---|
| „Good. What should it say when someone arrives and says nothing?" | `conversation-pathways.json:219` | Lob + Prüfungsfrage: Der Agent moderiert ein Seminar. |
| „Then tell me what the site should do when someone lands on it and freezes." | `:555` | Imperativ, Hausaufgabe, „tell me". |
| „Then we start with the part that keeps stopping you." | `:212` | „we" erfindet ein gemeinsames Programm. |
| „Something specific, or the whole thing?" | `:205` | Erzwungene Wahl statt offener Raum. |
| „Three real questions your team asked last week. Not the polished ones." | `:427` | Auftrag plus Qualitätsvorgabe. |
| „Tell me where to send it and I will make sure it reaches him. Mention the studio." | `:167` | Datenerhebung + Instruktion; widerspricht `limits.no_personal_data`. |
| „You asked a better question. I get sharper when someone pushes." | `:122` | Bewertung und Statusspiel (high status). |
| „Most people can, until it happens. You are already ahead." | `:666` | Schmeichelei, die Zustimmung erzeugen soll. |
| „Then the surface matters less than the retrieval. I would rather be slow and right than quick and wrong." | `:406` | Eigene Präferenz als Thema. |
| „Come back when there is something you actually want to know." | `:510` | Belehrung, leichte Herablassung. |
| „Old doors. That is a better opening line than any slogan." | `:621` | Kritik an einer nicht anwesenden dritten Sache. |

Das Muster ist nicht der einzelne Satz, sondern die **Anhängselfrage**: Fast jede Antwort endet mit einer Aufforderung. Dadurch antwortet der Besucher nur noch, statt zu stöbern — das ist die „gelenkte Gesprächsführung", die Samuel beschreibt.

## 4) Zusammenspiel mit den 12 Parametern

Nur zwei Parameter dürfen **Richtung** erzeugen; alle anderen ändern nur die **Form**.

| Parameter | Technik | Dosierung |
|---|---|---|
| `tempo` | Wartezeit, kurze Züge | < 0.4: keine Anschlussfrage, Tippen langsamer |
| `density` | ein Satz, ein Gedanke | < 0.4: eine Klausel; nie Aufzählung |
| `warmth` | Aufmerksamkeit/Positivität | 0.35–0.7: Quittung, kein Lob (`style.js:83`) |
| `calm` | Stille aushalten | > 0.7: kein Füllsatz, keine Frage |
| `closeness` | Spiegelung | < 0.5: kein Echo; > 0.7: **ein** Nomen (`style.js:124-131`) |
| `openness` | **einzige Frageerlaubnis** | ≥ 0.66: genau eine offene Frage; sonst keine (`style.js:96`) |
| `attention` | Reincorporation | > 0.7: ein Rückgriff auf das **letzte** Paar; < 0.4: keiner |
| `certainty` | Hedging statt Autorität | < 0.5: kein Rat, keine Expertenrolle |
| `playfulness` | ein trockener Aside | > 0.6: maximal einer, nie eine Pointe |
| `formality` | Registertreue (recipient design) | spiegelt den Besucher, nicht die eigene Steifheit |
| `depth` | konkret bleiben | < 0.5: kein Musternennen, keine Abstraktion |
| `energy` | kurzer-langer Rhythmus | ändert Tempo, **nicht** Initiative |

Kopplungen: `openness ≥ 0.66` nur mit `warmth ≤ 0.7` und `density ≤ 0.5` (sonst entsteht der freundliche Interviewer). Bei Distress: `openness = 0`, `calm ≥ 0.85`, `tempo ≤ 0.3` — deckt sich mit `persona.json:167-177`. Wichtig: Die Architektur behält nur das letzte Paar plus Kurzsummary (`src/agent/prompt.js:117-151`); Callbacks über mehr als einen Turn sind daher **nicht** versprechbar.

## 5) Messung

**Primärsignal: besucherinitiierte Tiefe.** Zähle Turns, die der Besucher ohne vorherige Agent-Frage beginnt. Das misst Neugier, nicht Bindung. Dazu: freiwillige Rückkehr (neue Session), Link-Klick, Kontakt, Sitzungsdauer, Anteil höflicher kurzer Ausstiege.

**Mikrosignale** liegen schon im Datenmodell: `typing.duration_ms`, `backspaces`, `pause_before_send_ms`, `interrupted_agent` (`conversation-pathways.json:27`) — als Instrumentierung nutzbar, aber die Datei ist synthetisch (`:3`), also kein Beleg.

**Offline:** simulierte Besucher plus feste Rubrik, Erfolg am Endzustand, `pass^k` (τ-bench-Methodik, bereits im Repo: `GESPRAECHS-ENDPUNKTE.md:138-151`). Zusätzlich PARADISE: Nutzerzufriedenheit gegen Aufgaben- und Dialogkosten regressieren, statt Dauer allein zu belohnen ([Walker et al. 1997](https://aclanthology.org/P97-1035.pdf)).

**Online, für „100 Systeme":** Varianten als Arme eines contextual bandit (Thompson Sampling), Kontext = Besuchertyp und erste Nachricht, Reward = Komposit aus besucherinitiierter Tiefe, Rückkehr, Klick und einer Abschlussfrage. Logging mit Propensities, Hold-out-Kontrolle, Offline-Policy-Eval per IPS/DR ([Deployment-Leitfaden](https://www.vitorsousa.com/blog/contextual-bandits-prod/)). Werkzeuge: [PyBandits (MIT)](https://github.com/PlaytikaOSS/pybandits), [Vowpal Wabbit (BSD-3)](https://github.com/VowpalWabbit/vowpal_wabbit).

**Warnung:** Conversation-Turns-per-Session sind ein bekannter, aber irreführender Proxy — lange Sessions können Verwirrung oder Retention-Nudging messen ([Ghazarian et al.](http://arxiv.org/pdf/1911.01456v1); [Implizit-Feedback-Falle](https://tianpan.co/blog/2026/04/18/implicit-feedback-trap-ai-quality-metrics)). Sobald Klicks das Ziel sind, entsteht Goodhart-Druck in Richtung Steuerung ([Stanford AIMS, Kap. 11](https://aims.stanford.edu/textbook/src/chap11.html)). Deshalb Guardrails: `false_offer`, `agent_introduced_topic`, `agent_asked_question` müssen **sinken**, nicht steigen.

## 6) Upstream

| Art | Werk | Lizenz |
|---|---|---|
| Buch | Johnstone, *Impro* (1981); *Impro for Storytellers* (1999) | © Routledge, nur Zitat/Idee |
| Buch | Halpern/Close/Johnson, *Truth in Comedy* | ©, nur Zitat |
| Buch | Coupland (Hg.), *Small Talk* | © Routledge |
| Paper | Sacks/Schegloff/Jefferson 1974; Schegloff et al. 1977; Schegloff 1982; Pomerantz 1984 | © LSA/Verlage, Konzepte frei nutzbar |
| Paper | Heritage & Sefi 1992; Clark & Brennan 1991; Tickle-Degnen & Rosenthal 1990; Horvitz 1999; Rowe 1974; Labov & Waletzky 1967; Fitzsimons & Lehmann 2004 | ©, Zitat |
| Repo | [Parlant](https://github.com/emcie-co/parlant) | Apache-2.0 |
| Repo | [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails) | Apache-2.0 |
| Repo | [PyBandits](https://github.com/PlaytikaOSS/pybandits) / [VW](https://github.com/VowpalWabbit/vowpal_wabbit) | MIT / BSD-3 |
| Datensatz | [DailyDialog](https://yanran.li/dailydialog.html) | CC BY-NC-SA 4.0 (**nicht kommerziell**) |
| Datensatz | [EmpatheticDialogues](https://github.com/facebookresearch/EmpatheticDialogues/blob/master/LICENSE) | CC BY-NC 4.0 (**nicht kommerziell**) |
| Datensatz | [PersonaChat](https://huggingface.co/datasets/aitetic/persona-chat) / [ParlAI-Doku](https://github.com/facebookresearch/ParlAI/blob/main/parlai/tasks/personachat/LICENSE_DOCUMENTATION) | MIT (HF) bzw. CC BY 4.0 (ParlAI) — **widersprüchlich, vor Nutzung prüfen** |
| Datensatz | [Topical-Chat](https://github.com/alexa/Topical-Chat/blob/master/DATALICENSE) | CDLA-Sharing-1.0 |
| Datensatz | [SODA](https://huggingface.co/datasets/allenai/soda) | CC BY 4.0 |

Für diese Technik ist **kein** Datensatz nötig: Die Regeln sind Prompt- und Designwissen, kein Training.

## 7) Empfehlung

**ADAPT** — nicht bauen.

- **ADAPT (Kern):** Prompt-Regeln aus §2 in `src/agent/prompt.js` und `persona.json:rules.hard`; die Anhängselfrage aus allen 13 Pathways entfernen; den Turn-Count-Trigger in `marketing.mention_when` (`persona.json:119-123`) durch ein Signal ersetzen (Besucher fragt nach dem Urheber oder schildert ein Problem). „Yes, and" **nicht wörtlich** prompten — es erzeugt eine Sprachtic und fügt Inhalt hinzu; die Regel ist „continue the premise".
- **REUSE:** Persona/Style/Resolver-Kette bleibt. `openness` ist bereits der richtige Schalter; `attention` und `closeness` tragen Reincorporation und Spiegelung. Kein neuer Runtime, kein Framework.
- **INTEGRATE (später):** PyBandits oder VW erst, wenn tatsächlich viele Varianten laufen und Propensity-Logging existiert; vorher Offline-Eval.
- **BUILD LAST:** kein Dialog-Engine, kein Klassifikator. Ein Regex/LLM-Judge für „Agent hat Thema eingeführt / Frage gestellt" reicht als Dev-Check.

Reihenfolge: Regeln → Pathways neu schreiben → Messsignale → Bandit. Die größte Wirkung hat nicht eine neue Technik, sondern das **Weglassen** der Schlussfrage.

DONE — nur gelesen und recherchiert, keine Datei geändert.
