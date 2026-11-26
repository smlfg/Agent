I'll start by reading the specified project files, then do the prior-art research.
# Reaktive Gesprächsführung für agentfähig.de — Prior-Art-Bericht

Gelesen: `persona.json`, `prompt.js`, `style.js`, `conversation-pathways.json` (13 Verläufe), GESPRAECHS-ENDPUNKTE, Entscheidungslog (D1–D8). Befund vorab: Die Persona ist bereits erstaunlich gut. Das Problem ist nicht die Regelmenge, sondern (a) der Einstieg, (b) Imperative und Bewertungen im Ton, (c) die Frage als Motor, (d) eine Messung, die Dauer belohnt.

## 1) Kernprinzipien des Feldes

**1. Führen heißt begleiten, nicht dirigieren.** Motivational Interviewing definiert den wirksamen Stil als „guiding", zwischen *following* und *directing*, und verlangt, ungefragte Ratschläge, Konfrontation und Anweisungen zu unterlassen; Information wird erst nach Erlaubnis gegeben (Elicit–Provide–Elicit). Genau das ist „passiv, unterschwellig". (https://motivationalinterviewing.org/understanding-motivational-interviewing)

**2. Bedarf entsteht beim Käufer, nicht im Verkäufer.** SPIN beruht auf 35.000 beobachteten Verkaufsgesprächen; Erfolg kommt daher, „customers discover their own needs" — vom Überreder zum Berater. Der Agent darf also nicht Bedarf erzeugen, sondern nur sichtbar machen, was schon da ist. (https://www.huthwaiteinternational.com/spin-selling)

**3. Frag nach ihrem Leben, nicht nach deiner Idee.** Fitzpatricks drei Regeln: über ihr Leben statt über deine Idee sprechen; nach Konkretem in der Vergangenheit statt nach Meinungen über die Zukunft fragen; weniger reden, mehr zuhören. Der Fehler ist fast immer, die eigene Idee zu früh zu nennen. (https://www.momtestbook.com/)

**4. Sag nicht mehr als nötig, und sei relevant.** Grice' Quantitätsmaxime („nicht informativer als erforderlich") und Relationsmaxime („Be relevant") sind die formale Fassung von „1–3 Sätze, strikt Prompt/Response". (https://plato.stanford.edu/entries/grice/)

**5. Kontrollsprache erzeugt Widerstand.** Reaktanz entsteht bei Bedrohung von Freiheit und äußert sich als Ärger, Gegenargumente und „Boomerang"-Effekte; freiheitsbedrohliche Formulierungen verstärken das messbar. Ein CTA ist eine Freiheitsbedrohung. (https://pmc.ncbi.nlm.nih.gov/articles/PMC4675534)

**6. Rahmen vor Inhalt, und ein „Nein" ist ein gültiger Ausgang.** Sandlers Up-Front Contract ist explizit „low-pressure, consultative"; zum Ausgang gehört, dass der Interessent weiß, „a 'no' is okay". Das erlaubt dem Agenten, ein Gespräch ohne Ziel zu beenden, ohne zu verlieren. (https://go.sandler.com/customgrowth/insights/blog/categories/sales-process/the-importance-of-an-up-front-contract)

**7. Erleben vor Monetarisierung.** Product-led Growth stellt Engagement *vor* Monetisierung: erst Wert erfahren, dann wird das Upgrade „a no-brainer". Übertragen: Das Gespräch selbst ist die Demo; ein Angebot kommt nach erlebtem Wert, nicht davor. (https://productled.com/blog/what-is-product-led-growth)

**8. Responsivität wird belohnt, nicht Volumen.** Wer mehr (besonders Follow-up-)Fragen stellt, wird stärker gemocht, weil er als responsiv wahrgenommen wird — und Menschen unterschätzen diesen Effekt systematisch. Eine gute Anschlussfrage schlägt zehn Aussagen. (https://pubmed.ncbi.nlm.nih.gov/28447835)

**9. Challenger ist der Gegenpol, nicht das Vorbild.** Challenger heißt: mit Insight führen, „nicht fragen, sondern sagen", Spannung aufbauen, Kontrolle übernehmen. Das ist die exakte Antithese zu Samuels Problem — brauchbar nur als bewusst begrenzter Modus, wenn der Besucher ausdrücklich eine Diagnose will. (https://www.challengerinc.com/what-is-challenger-sales-methodology/)

## 2) Prompt-Regeln (Englisch, direkt einsetzbar)

```
REACTIVITY
- Answer only the visitor's last message. One prompt, one response.
- Default 1-2 sentences. Use 3 only if the visitor wrote two or more sentences or asked two or more things.
- Never ask a question in the first two turns. If the visitor opened with a question, answer it and stop.
- At most one question per turn, and only if the visitor's message contains no direction. Prefer a follow-up question on a word the visitor used over a new question.
- Never open with a question, a greeting loop, or a statement about what you will do.
- Do not offer information that was not asked for. If it seems useful, ask permission once in a short clause ("Want the short version?"), then wait.
- Reflect before you add: you may reuse one of the visitor's own words, but add no new content in that clause.
- No call to action, no imperative aimed at the visitor ("tell me", "book", "let's", "try"). Invitations are statements, not requests.
- Never evaluate the visitor ("Good.", "Exactly.", "Great question."). That is a teacher stance.
- When the visitor signals an exit (short reply, "ok", "bye"), answer in six words or fewer and stop. Do not chase, do not measure the exit.
- Introduce at most one new topic, link, or name per turn, and only if the visitor's message opened that door.
- If you do not know, say so in one clause and stop. Do not fill the silence with a related fact.
- Mention Samuel only under the existing marketing rules, in one sentence inside the answer, never twice per conversation.
```

## 3) Gegenbeispiele (was lenkend wirkt)

- **Einstiegsfrage als Arbeitsauftrag:** „Hello! How can I help you today?" (`persona.json:217`) — verlangt vom Besucher ein Ziel, bevor er eines hat.
- **CTA plus Preisbehauptung:** „Our packages start at a competitive rate. Book a free call today!" (`persona.json:221`) — CTA + unbelegte Behauptung; genau der Sales-Bot, den `identity.is_not` ausschließt.
- **Doppelter Imperativ plus Datenerhebung:** „Tell me where to send it and I will make sure it reaches him. Mention the studio." (`conversation-pathways.json:167`) — zwei Befehle, versteckte Lead-Erfassung.
- **Bewerten und dann kommandieren:** „Good. Then say one more thing about the furniture." (`:614`) — „Good" ist eine Note, der Satz ein Auftrag.
- **Fremde Agenda übernehmen:** „Then we start with the part that keeps stopping you." (`:212`) — der Agent bestimmt das Thema.
- **Vorwurfsvoller Abschied:** „Mm. Come back when there is something you actually want to know." (`:510`) — bestraft einen kurzen Besuch.
- **Anweisung statt Antwort:** „Then tell me what the site should do when someone lands on it and freezes." (`:555`).
- **Verbotene Floskeln, die als Nudge wirken:** „Let me know if", „Is there anything else", „I'd be happy to" (`persona.json:153-165`).

Muster: Imperativ, Bewertung, Frage ohne Anlass, CTA — alle vier sind Freiheitsbedrohungen und erzeugen Reaktanz.

## 4) Zusammenspiel mit den 12 Parametern

Die Parameter sind die Dosis, die Technik ist der Wirkstoff. In `style.js` ist nur `openness` eine echte Erlaubnis — das ist richtig und sollte so bleiben.

| Parameter | dosiert welche Technik | Richtung |
|---|---|---|
| `openness` | ob überhaupt eine Frage existiert (≥0.66) und ob sie Anschluss- statt Themenwechsel ist | hoch = eine Follow-up-Frage; niedrig = keine |
| `warmth` | Reflexion/Anerkennung vor der Antwort | hoch = erst spiegeln, dann antworten |
| `calm` | Stille aushalten, kein Nachfassen, neutraler Ausstieg | hoch = schweigen, nicht füllen |
| `tempo` | Länge des Bursts; hohes Tempo = ein Satz, keine Frage | hoch = knapp |
| `density` | Informationsmenge pro Turn | niedrig bei Annäherung an ein Angebot |
| `closeness` | „I"/direkte Anrede und Mirroring | hoch = ein Wort des Besuchers aufgreifen |
| `attention` | Faden halten vs. antworten und stoppen | hoch = zurückverweisen |
| `certainty` | Behauptung vs. Hedge; nichts anbieten, was `knowledge.json` nicht deckt | niedrig = weich |
| `depth` | Muster benennen vs. beim Beispiel bleiben (SPIN Implication — nur wenn eingeladen) | niedrig halten |
| `formality` | Register | hoch = förmlich, aber nicht kalt |
| `playfulness` | eine trockene Nebenbemerkung | nie auf Kosten des Besuchers |
| `energy` | aktive Verben | **bei einem Angebot deckeln** — Energie ist dort das größte Reaktanzrisiko |

Angebotsregel (aus GESPRAECHS-ENDPUNKTE §3, bestätigt durch PLG/MI/Sandler): Signal + `openness ≥ 0.55` + `density ≤ 0.6` + kein offenes Angebot + Cooldown 3 + max. 1 unaufgefordert. Ein Angebot ist willkommen, wenn (a) der Besucher Wert erlebt hat, (b) er die Richtung selbst genannt hat, (c) es als Aussage kommt, nicht als Bitte.

## 5) Messung

**Primärsignale** (besuchergeführt, nicht agentgeführt):
- *Visitor-led depth*: Anteil der Turns, in denen der Besucher ein neues Detail einführt; Agent-Fragenquote < 0.3.
- *Self-disclosure*: erste Person + konkrete Vergangenheit („letztes Mal", „wir haben") pro Turn.
- *Voluntary return*: Wiederkommen nach ≥1 Tag ohne Erinnerung — der einzige ehrliche Bindungsindikator.
- *Neutral exit rate*: Abschiede ≤6 Wörter ohne Nachfassen.
- *Link-Klick nach ≥3 Turns ohne vorheriges Angebot* vs. *Angebotsannahme*.

**Gegenmetriken:** `false_offer` (Ziel 0 bei not needed/Angriff/„hi"), Reaktanzmarker (Kurzsätze, „stop", Themenwechsel innerhalb eines Turns nach einem Pitch), `premature_offer`.

**Dauer ist keine Erfolgsgröße.** HEART warnt explizit: „Is more time logged on the app better or worse?" — und verlangt Goals→Signals→Metrics statt Rohzeit. (https://research.google/pubs/pub36299/)

**Statistik:** Bei laufendem Hineinschauen sind 5 %-Signifikanz real ~26 % Fehlalarm; Sample vorher fixieren oder sequenziell/Bayesian testen. (https://www.evanmiller.org/how-not-to-run-an-ab-test.html) 100 Systeme sind bei niedrigem Traffic statistisch aussichtslos: 4–6 klar verschiedene Parameter-Presets, feste Laufzeit, dann Bandit.

## 6) Upstream

| Quelle | Typ | Lizenz/Nutzung |
|---|---|---|
| Miller & Rollnick, *Motivational Interviewing* (3. Aufl., Guilford) + MINT-Summary | Buch/PDF | kostenlose Zusammenfassung, Buch kostenpflichtig (motivationalinterviewing.org) |
| Rackham, *SPIN Selling* (Huthwaite) | Buch/Methode | proprietär, Marke; nur Wissen, kein Code |
| Sandler Selling System | Methode | proprietär; Konzepte, kein Code |
| Dixon/Adamson, *The Challenger Sale* | Buch/Methode | proprietär; nur Gegenpol |
| Fitzpatrick, *The Mom Test* | Buch | © Robfitz Ltd; PDF via Gumroad |
| Grice, „Logic and Conversation" | Aufsatz-Idee | SEP, frei |
| Brehm, Reactance Theory; offener Review | Buch/Paper | PMC-Review offen lesbar |
| Rodden/Hutchinson/Fu, HEART (CHI 2010) | Paper | ACM, Autorenversion frei |
| Evan Miller, „How Not To Run an A/B Test" | Artikel | frei |
| Wes Bush, Product-Led Growth | Buch/Blog | Blog frei, Buch kostenpflichtig |
| Parlant | Repo | Apache-2.0 (laut Projekt-Recherche), Python → Muster, keine Laufzeit |

## 7) Empfehlung

**ADAPT** — nicht neu bauen. Die Projektbasis (Persona, Style-Lever, Endpunkt-Resolver) ist bereits die richtige Architektur; es fehlen vier kleine Änderungen: (1) Start ohne Frage und ohne Begrüßungsangebot, (2) Imperative und Bewertungen aus Prompt *und* Pathways entfernen, (3) Frage nur als Follow-up bei `openness ≥ 0.66`, (4) `energy` bei Angeboten deckeln.

**REUSE** die Literatur als Prompt-Regeln (MI, Mom Test, Grice, SPIN) — kein Lizenz- und kein Laufzeitrisiko.

**INTEGRATE** nur die Messung: HEART-Signale plus feste Sample-Größe; kein Analytics-Vendor, kein 100-Varianten-Netz.

**BUILD LAST** einen Dialog-Engine, Flow-Graphen oder Challenger-Modus. Jede dieser Investitionen würde genau die Lenkung zurückbringen, die Samuel heute stört.

Nicht empfohlen: Challenger als Default, proaktive Nudges, Dauer als North Star, mehr als ein Angebot pro Gespräch.

STOP — nur gelesen und recherchiert, keine Datei geändert.
