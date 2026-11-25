# Upstream-Recherche — Klassifikator entscheidet das Gesprächsziel

Frage: Soll nicht der Generative Agent bestimmen, wohin das Gespräch führt
(Endpunkt/Wegpunkt), sondern ein separates Klassifikator-/Entscheidungsmodell?

Bezug: [`HANDOFF-gespraechsfuehrung.md`](HANDOFF-gespraechsfuehrung.md) Abschnitt 4
beschreibt heute das Gegenteil (ein Agent, alle Wegpunkte im Prompt, Werkzeug
`show_waypoint(id)`). Diese Recherche prüft die Alternative.

Stand: 25.11.2026. Recherche, keine Entscheidung. Alle Zahlen sind aus den unten
verlinkten Primärquellen abgeschrieben, nicht geschätzt.

## 1. Kurzfazit

Das Muster ist nicht exotisch, es hat einen Namen und ist 2026 ein Produkt:
**Decision Model** (auch „Classifier Model", „System-One-Modell"). Ein Modell, das
einen Zustand plus ein Schema typisierter Fragen bekommt und pro Frage
Wahrscheinlichkeiten für erlaubte Optionen zurückgibt — ohne Freitext, ohne
Parsing.

Cloudflare betreibt genau das selbst, auf derselben Plattform, auf der Agentfähig
läuft: `@cf/cloudflare/clef-flash` (9B) und `@cf/cloudflare/clef` (27B), Apache-2.0,
Zero Data Retention, dokumentierte Latenz von 38,8 ms Median (flash) und Preise
von 0,038 bzw. 0,24 USD pro Million Input-Tokens.

Der Vorschlag deines Gegenübers ist damit **technisch gedeckt und günstig**. Ob er
besser ist als der heutige Plan, hängt an einer Sache, die diese Recherche nicht
beantworten kann: ob ein Klassifikator auf Deutsch die zehn Wegpunkte sauber
trennt. Das ist eine Messung, kein Literaturproblem.

## 2. Wie das Muster heißt

Drei Namen für dieselbe Sache, je nach Herkunft:

| Begriff | Herkunft | Kern |
| --- | --- | --- |
| Decision Model / System One | Typesafe (Jev), Cloudflare (Clef) | Zustand + typisierte Fragen → Wahrscheinlichkeiten, nicht-autoregressiv |
| Semantic Router | Aurelio Labs | Embedding-Ähnlichkeit gegen Beispielsätze, kalibrierter Schwellwert, kann „keine Route" sagen |
| NLU + Dialog-Policy | klassische Dialogforschung (Rasa, DIET) | Absichtsklassifikator entscheidet, die Generierung formuliert nur |

Der gemeinsame Kern: **Entscheiden und Formulieren werden getrennt.** Der
Generierer darf nicht mitentscheiden, wohin es geht.

## 3. Kandidaten

### K1 — Cloudflare Clef / Clef-flash (Entscheidungsmodell, managed)

- Modell-IDs: `@cf/cloudflare/clef-flash` (9B), `@cf/cloudflare/clef` (27B)
- Doku: <https://developers.cloudflare.com/workers-ai/models/clef-flash/> ·
  <https://developers.cloudflare.com/workers-ai/models/clef/>
- Ankündigung: <https://blog.cloudflare.com/clef-decision-models>
- Modellkarte mit Evalzahlen: <https://huggingface.co/Cloudflare/clef-flash> (Apache-2.0)
- API: `env.AI.run("@cf/cloudflare/clef-flash", { state, questions })`. Erlaubte
  Fragetypen: `noul` (wahr/falsch → eine Wahrscheinlichkeit), `choice`
  (benannte Optionen mit Beschreibung), `score` (geordnete Stufen). 1 bis 64
  Fragen pro Aufruf. `state` darf String **oder** JSON sein — laut Doku
  ausdrücklich „chat logs, or application state".
- Kontext: flash 24.576 Tokens, clef 65.536 Tokens.
- Preis: 0,038 USD / Mio. Input-Tokens (flash), 0,24 USD / Mio. (clef).
  **Keine Kosten für Output-Tokens.** Zero Data Retention.
- Latenz (Median / p95, ms), gemessen in der Decision-Index-Suite:
  Clef 209,3 / 238,6 · **Clef-flash 38,8 / 122,4** · Jev 524,1 / 536,0 ·
  Kev 9B 51,4 / 187,9 · Laya 5,8 / 222,5.
- Für uns relevante Benchmarks (macro-F1 / Accuracy, aus derselben Suite):

  | Benchmark | Clef | Clef-flash | Jev |
  | --- | --- | --- | --- |
  | BANKING77 (77 Intents, macro-F1) | **94,2** | 90,9 | 79,7 |
  | CLINC150 + Out-of-Scope (macro-F1) | **97,4** | 66,8 | 89,3 |
  | Home-Appliance-Simulator (case exact) | 83,0 | **97,7** | 52,3 |
  | Agent-Trace-Observability (primary action) | 68,5 | 69,8 | **71,6** |

  Zwei Zeilen sind für uns die wichtigen:
  - **BANKING77** ist wörtlich „77 Absichten in einem engen Themenfeld
    auseinanderhalten" — der strukturgleiche Fall zu „zehn Wegpunkte".
  - **CLINC150+OOS** enthält „gehört zu keiner Absicht". Genau der Fall
    „Nachricht enthält keine Richtung". Hier bricht **flash auf 66,8 ein**,
    während das große Clef 97,4 hält. Das ist der stärkste Einzelbefund dieser
    Recherche: die günstige Variante ist gut im Zuordnen und schwach im
    Verweigern.

### K2 — Semantic Router (Embeddings + kalibrierter Schwellwert, OSS)

- <https://github.com/aurelio-labs/semantic-router> (MIT, 4k Sterne)
- Ablauf: pro Route ein paar Beispielsätze, Embedding, Kosinusnähe. `fit()` mit
  beschrifteten Beispielen inkl. `None` macht aus dem Roh-Score eine
  Wahrscheinlichkeit; `confidence_threshold = 0.5` heißt dann wörtlich „handle
  nur, wenn es wahrscheinlicher richtig als falsch ist", sonst kommt `None`
  zurück.
- Modellfrei im engeren Sinn: die Entscheidung ist ein Vektorvergleich, kein
  Modellaufruf.
- Auf Cloudflare abbildbar: `@cf/baai/bge-m3` (multilingual) oder
  `@cf/google/embeddinggemma-300m` als Encoder, Routen als Vektoren in
  Vectorize. Kein zusätzlicher Modellaufruf, keine zusätzliche Rechnung —
  nur ein Embedding (das der RAG-Pfad sowieso braucht).
- Schwäche: keine Dialoglogik. Ein einzelner Besuchersatz wird gegen
  Beispielsätze gemessen; „ich will das mal ausprobieren" landet je nach
  Beispielsatz zufällig richtig. Der Router sieht Kontext nur, wenn man ihm
  den Kontext als Text gibt.

### K3 — SetFit (eigenes kleines Modell, Few-Shot)

- <https://github.com/huggingface/setfit> · Paper <https://arxiv.org/abs/2209.11055>
- Kernaussage des Papers: mit **8 gelabelten Beispielen pro Klasse** erreicht
  SetFit auf dem Kundenbewertungs-Datensatz dasselbe Niveau wie ein voll
  feinabgestimmtes RoBERTa-Large auf 3.000 Beispielen — ohne Prompts.
  Multilingual durch Austausch des Sentence-Transformer-Rumpfs.
- Praktischer Haken: das Modell muss trainiert und irgendwo gehostet werden.
  Workers AI bietet kein „eigenes Klassifikationsmodell hochladen"; die
  LoRA-Angebote dort sind Textgenerierung. Also RunPod/Modal/eigener Container
  — genau die Zusatzkomponente, die der Cloudflare-Pfad vermeiden wollte.
- Wert für uns: **Offline-Werkzeug**, um zu prüfen, ob die zehn Wegpunkte
  überhaupt trennbar sind, bevor man Infrastruktur baut. 80 Beispiele, ein
  Laptop, eine Stunde.

### K4 — Rasa DIET / klassische NLU-Policy-Trennung (Vorläufer, nicht Deployment)

- <https://arxiv.org/abs/2004.09936> (DIET, Rasa, 2020)
- Befund des Papers: für Intent- und Entity-Erkennung bringt ein großes
  vorTrainiertes Modell **keinen klaren Vorteil**; ihr schlanker, rein
  überwachter Ansatz schlägt feinabgestimmtes BERT und trainiert ~6× schneller.
- Warum das hier steht: es ist der Beleg, dass „Absicht mit kleinem Modell
  klassifizieren, Dialogzustand getrennt führen" kein neuer Trick ist, sondern
  zehn Jahre Standard in Task-Dialogen — und dass dafür kein LLM nötig war.

### K5 — LLM als Klassifikator mit erzwungenem Schema (Status quo)

Das ist im Kern der heutige Handoff-Plan: derselbe Agent, der formuliert,
entscheidet auch. Belegt nachteilig:
- Sycophancy: <https://arxiv.org/abs/2310.13548> zeigt über fünf Assistenten
  hinweg, dass Modelle Antworten liefern, die den Nutzeransichten folgen,
  und dass Präferenzmodelle genau das belohnen. Ein Modell, das gleichzeitig
  gefallen und führen soll, führt nicht.
- Nicht-deterministisch und nicht kalibriert: die Ausgabe ist Text, den man
  parsen muss; „wie sicher war das Modell" ist nicht abfragbar.
- Teuer und langsam im Vergleich: derselbe Prompt muss die zehn
  Wegpunktbeschreibungen mitschleppen, jeder Turn zahlt sie mit.

### K6 — Llama Guard 3 (enger Nachbar, falscher Zweck)

- `@cf/meta/llama-guard-3-8b`, Inhaltsklassifikation für Prompt und Antwort.
- Nützlich als Sicherheits-/Scope-Rail, **nicht** als Wegpunkt-Router: es
  kennt Sicherheitskategorien, keine Geschäftsziele.

## 4. Was das für die Gesprächsmechanik aus dem Handoff bedeutet

Der Handoff legt in Abschnitt 3 sechs Regeln fest. Ein Klassifikator bedient
vier davon mechanisch statt durch Prompt-Text:

| Handoff-Regel | heute (Prompt) | mit Klassifikator |
| --- | --- | --- |
| 3 — höchstens zwei Fäden, nur wenn keine Richtung | Modell entscheidet, ob eine Richtung da ist | `noul`-Frage `hat_richtung`; unter Schwellwert → zwei Fäden aus Top-2 |
| 5 — eine Karte bei klarer Absicht | Werkzeugaufruf `show_waypoint(id)` | `choice`-Frage über zehn Optionen; Karte bei p > Schwelle **und** Abstand zu Top-2 |
| 6 — Themenwechsel lässt Karte verschwinden | Modell muss sich erinnern, sie wegzunehmen | jeder Turn wird neu klassifiziert, die Karte ist ein *Ableitungsprodukt* des letzten Turns — nichts zu vergessen |
| 6a — konkret Fragende bekommen keine Fäden | Modell soll das erkennen | dieselbe `noul`-Frage; Schwelle justierbar |

Regel 2 (Bridge-Antwort in ein bis zwei Sätzen) bleibt Aufgabe des Generierers.
Regel 4 (Chips unter der Antwort) wird zur UI-Frage, nicht zur Prompt-Frage.

Zwei Dinge werden dadurch einfacher:
- Der Prompt verliert die zehn Wegpunktbeschreibungen. Sie sind Konfiguration
  des Klassifikators (`criteria`), nicht Prompt-Text.
- „Wegpunkt erscheint nie" ist keine Prompt-Schwäche mehr, sondern eine
  ablesbare Zahl: p lag immer unter der Schwelle. Die Auswertung aus
  Handoff §8 wird damit direkt diagnostisch.

## 5. Der Latenzpunkt, der die Architektur entscheidet

Der naive Aufbau ist seriell: Klassifikator fragen, Wegpunkt in den
Generierungs-Prompt setzen, antworten. Das addiert einen Roundtrip (~40–120 ms
Edge-Latenz bei flash) **vor** die Antwort — gegen das Kernversprechen des
Projekts.

Der Aufbau, der zu Handoff §3.4 passt, ist **parallel**:

1. Besuchernachricht geht gleichzeitig an Generator und Klassifikator.
2. Der Generator schreibt die Bridge-Antwort, ohne den Wegpunkt zu kennen.
   Er darf ihn nicht erwähnen — laut Handoff steht die Karte ohnehin *unter*
   der Antwort, nicht im Text.
3. Der Klassifikator liefert nach ~40 ms die Karte/Fäden; die UI blendet sie
   ein, sobald sie da ist.
4. Ist der Klassifikator langsamer als der Generator (p95 122 ms), erscheint
   die Karte minimal nach der Antwort — was der gewünschten Dramaturgie sogar
   entspricht.

Kosten: nur die Wartezeit des Klassifikators, und die liegt unter der des
Generierers. **Kein zusätzlicher Latenzbeitrag im Normalfall.**

Preislich ist es irrelevant: 1.000 Tokens Zustand pro Turn bei 0,038 USD/Mio.
sind 0,000038 USD pro Turn; 10.000 Turns kosten ~0,38 USD mit flash, ~2,40 USD
mit dem großen Clef. Eine Konversation mit 20 Turns kostet also rund einen
Zehntausendstel-Dollar.

**Nachtrag (Subagenten):** Der parallele Aufbau gilt nur, solange der Generator
allein antwortet. Sobald ein Subagent pro Wegpunkt antwortet, muss der Wegpunkt
vor dessen Aufruf feststehen — dann ist die Folge seriell: Klassifikator →
Subagent → Orchestrator. Der Aufpreis ist die Klassifikatorzeit (~40–120 ms), und
der eigentliche Kostenpunkt sind die zwei LLM-Aufrufe. Details und der
Prompt-Entwurf: [`docs/PROMPT-ENTWURF-orchestrator.md`](docs/PROMPT-ENTWURF-orchestrator.md).

## 6. Risiken, die diese Recherche nicht wegnimmt

1. **Deutsch ist unbelegt.** Weder die Clef-Modellkarte noch die
   Semantic-Router-Beispiele nennen deutsche Evaluationszahlen. Alle Zahlen
   oben sind englisch. Ob „ich will mal sehen, was das ist" auf Deutsch
   korrekt auf den Grundstrom „What this is" fällt, weiß niemand, bevor es
   jemand gemessen hat.
2. **Zehn Ziele sind wenig Daten, viel Bedeutung.** BANKING77 hat 77 Intents
   mit je ~100 Trainingsbeispielen. Unsere zehn Wegpunkte haben je einen Satz
   Beschreibung. Das ist der schlechteste Fall für ein Entscheidungsmodell und
   der beste für ein Embedding (wenig Daten, viel Semantik).
3. **Die Verweigerung ist der schwache Punkt**, nicht die Zuordnung — siehe
   CLINC150+OOS: 97,4 (Clef) gegen 66,8 (flash). Wer die falsche Variante
   wählt, bekommt einen Agenten, der jedem Satz eine Karte anhängt.
4. **Ein Klassifikator kann nicht „überreden" und nicht „zurücktreten" im
   erzählerischen Sinn.** Er liefert pro Turn eine Wahrscheinlichkeitsverteilung.
   Alles, was Gedächtnis über mehrere Turns braucht („der Besucher hat vorhin
   schon nach dem Produkt gefragt"), muss die Anwendungsschicht führen.
5. **Der Wegpunkt-Zustand ist damit global sichtbar und manipulierbar.** Wer
   die Schwelle kennt, kann Karten erzwingen. Bei einer öffentlichen
   Marketing-Seite ist das ein Kosmetikproblem, kein Sicherheitsproblem — aber
   es sollte bewusst so entschieden werden.

## 7. Offene Verifikationen (vor jeder Architekturentscheidung)

1. **Trennbarkeitstest ohne Infrastruktur:** 10 Wegpunkte × 8 deutsche
   Beispielsätze, SetFit oder reiner Embedding-Vergleich lokal. Fragestellung:
   Wie oft liegt der richtige Wegpunkt in den Top 2, wie oft kommt Unsinn
   („keine Richtung") heraus, wo verwechselt das Modell zwei Wegpunkte
   systematisch? Ergebnis: eine Konfusionsmatrix, keine Meinung.
2. **Verweigerungs-Test:** dieselben Sätze plus 20 bewusst ziellose Sätze
   („hallo", „was geht", „bist du ein Bot") und 20 out-of-scope Sätze. Die
   Zahl, die zählt, ist falsch-positive Karten pro ziellosem Turn.
3. **Clef-Sondierung:** ein Aufruf gegen `@cf/cloudflare/clef-flash` und
   `@cf/cloudflare/clef` mit genau diesen Beispielsätzen, deutsche Fassung,
   `choice` über zehn Wegpunkte plus `noul` `hat_richtung`. Zwei Modelle, ein
   Vergleich, echte Latenz auf unserer Plattform.
4. **Erst danach** die Architekturfrage: Klassifikator parallel zum Generator
   (empfohlen) oder seriell.

## 8. Empfehlung

**Der Vorschlag ist gut, aber nicht als Ersatz, sondern als Trennung von
Entscheiden und Formulieren.** Der Wegpunkt wird klassifiziert, der Satz wird
generiert, die Karte ist ein Ableitungsprodukt des letzten Turns statt einer
Erinnerung des Modells.

Reihenfolge nach Aufwand und Aussagekraft:

1. Lokaler Trennbarkeitstest (K2/K3-Mittel, keine Cloud, keine Kosten).
2. Clef-Sondierung auf Workers AI mit denselben Sätzen (K1, ein paar Cent).
3. Erst dann entscheiden, ob `show_waypoint` als Werkzeug aus dem Handoff
   herausfällt oder als Rückfallebene bleibt.

Was ich **nicht** empfehle: mit dem großen Clef anfangen, weil flash beim
Verweigern schwach ist — und dann feststellen, dass das eigentliche Problem
die zehn Beschreibungen sind, nicht das Modell.

Genau ein nächster Schritt: den Trennbarkeitstest aus Abschnitt 7.1 bauen —
80 deutsche Sätze, ein Skript, eine Konfusionsmatrix. Kein Cloudflare, kein
Deploy, keine Owner-Entscheidung nötig.

## 9. Quellen

- Cloudflare, „Introducing Clef" (Blog, 01.10.2026):
  <https://blog.cloudflare.com/clef-decision-models>
- Workers AI Modellseiten: <https://developers.cloudflare.com/workers-ai/models/clef/>
  und <https://developers.cloudflare.com/workers-ai/models/clef-flash/>
- Clef-flash Modellkarte inkl. Decision-Index-Zahlen (Apache-2.0):
  <https://huggingface.co/Cloudflare/clef-flash>
- Aurelio Labs Semantic Router (MIT): <https://github.com/aurelio-labs/semantic-router>
- Tunstall et al., „Efficient Few-Shot Learning Without Prompts" (SetFit, 2022):
  <https://arxiv.org/abs/2209.11055>
- Bunk et al., „DIET: Lightweight Language Understanding for Dialogue Systems"
  (2020): <https://arxiv.org/abs/2004.09936>
- Sharma et al., „Towards Understanding Sycophancy in Language Models" (2023):
  <https://arxiv.org/abs/2310.13548>
- Ong et al., „RouteLLM: Learning to Route LLMs with Preference Data" (2024):
  <https://arxiv.org/abs/2406.18665>
- Pipecat `smart-turn-v2` (Turn-End-Erkennung, für den Voice-Pfad später):
  <https://developers.cloudflare.com/workers-ai/models/smart-turn-v2/>
