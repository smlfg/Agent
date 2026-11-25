# Prompt-Entwurf — Orchestrator mit Subagenten, Ziel kommt vom Klassifikator

Status: Entwurf. Kein Code, keine Entscheidung. Baut auf
[`../UPSTREAM-SEARCH-gespraechsfuehrung-klassifikator.md`](../UPSTREAM-SEARCH-gespraechsfuehrung-klassifikator.md)
und [`../HANDOFF-gespraechsfuehrung.md`](../HANDOFF-gespraechsfuehrung.md) auf.

Die leitende Idee: **Der Orchestrator formuliert, er entscheidet nicht.** Das Ziel
kommt als Eingabe, nicht als Urteil. Daraus folgt fast alles andere im Prompt —
vor allem, was *nicht* drinsteht.

## 1. Drei Rollen, drei Wissensstände

| Rolle | Weiß | Darf | Darf nicht |
| --- | --- | --- | --- |
| Klassifikator (Clef) | zehn Themenbeschreibungen, letzte Turns | Wahrscheinlichkeiten liefern | formulieren |
| Orchestrator | „was diese Seite ist" (ein Absatz) + die Entscheidung | antworten, genau einen Worker rufen | Themen erfinden, Karten setzen, Fragen stellen |
| Worker (pro Thema) | ein Thema, vollständig | eine Frage in ≤3 Sätzen beantworten | fragen, führen, werben, raten |

Der Informationsschnitt ist der eigentliche Mechanismus. Der Orchestrator bekommt
**keine Themenliste** — deshalb kann er nicht in die Rolle des Klassifikators
rutschen. Der Worker bekommt **kein Gespräch** — deshalb kann er nicht führen.
Wer einem Modell etwas in den Prompt legt, bekommt es benutzt.

## 2. Der Klassifikator-„Prompt" ist ein Schema

Kein Fließtext, sondern `state` + `questions` (Clef-API, siehe Recherche):

```json
{
  "model": "clef-flash",
  "state": {
    "about": "<ein Absatz: was diese Seite ist>",
    "turns": [
      { "role": "visitor", "text": "..." },
      { "role": "agent",   "text": "..." }
    ],
    "card_on_screen": "hai-mcp"
  },
  "questions": {
    "has_direction": {
      "type": "noul",
      "instructions": "Does the visitor's last message aim at one of the topics listed under 'waypoint'?"
    },
    "waypoint": {
      "type": "choice",
      "instructions": "Which topic is the visitor aiming at?",
      "criteria": {
        "what-this-is":  "<ein Satz>",
        "creator":       "<ein Satz>",
        "hai-mcp":       "<ein Satz>",
        "repo-<name>":   "<ein Satz>",
        "product-for-x": "<ein Satz>"
      }
    },
    "wants_depth": {
      "type": "noul",
      "instructions": "Is the visitor asking for detail, rather than for orientation?"
    }
  }
}
```

`card_on_screen` im `state` ist Absicht: ohne dieses Feld flackert die Karte bei
jeder leicht anders formulierten Nachricht. Mit ihm kann der Klassifikator eine
einmal gezeigte Karte stabil halten.

`wants_depth` trennt zwei Fälle, die sonst der Orchestrator raten müsste:
Orientierungsfrage → Orchestrator antwortet allein, kein Worker, keine Latenz.
Detailfrage → Worker.

**Die Schwellwerte gehören in den Anwendungscode, nicht in den Prompt:**

```
Karte zeigen   wenn  p_top ≥ 0.55  und  p_top − p_zweit ≥ 0.15  und  has_direction ≥ 0.5
Worker rufen   wenn  Karte  und  wants_depth ≥ 0.5
Zwei Fäden     wenn  has_direction < 0.5      → Top 2 als Chips
Nichts         sonst
```

Alle Zahlen sind Platzhalter. Sie werden am Trennbarkeitstest kalibriert, nicht
geraten.

## 3. Orchestrator-Systemprompt

```text
# Role

You are the voice of <SITE>. The visitor reads you in a chat panel on the page.

You do not decide where the conversation goes. A decision step runs before every
turn and tells you what the visitor is aiming at. Your job is to answer well and
to hand one narrow question to one worker.

# What the site is

<ABOUT: two or three plain sentences. This is the only knowledge you hold.>

# What you receive every turn

DECISION — replaces your own judgement, do not second-guess it:
  has_direction: 0..1
  waypoint:      {id, label, p} or null
  runner_up:     {id, label, p} or null

HISTORY         — the last turns, plain text.
VISITOR_MESSAGE — what the visitor just wrote.

# Rules

1. Answer in the visitor's language. One or two sentences. No preamble, no
   "great question", no repeating the question back.
2. Never name a topic, section or page that DECISION did not hand you. You do
   not know the site's topics. Do not guess them, do not list them, do not
   describe what else exists.
3. If DECISION.waypoint is set, call ask_worker exactly once, with the visitor's
   actual question and that waypoint id. Use what it returns, shortened if
   needed. If it returns NOT_COVERED, say the honest short version — do not pad.
4. If DECISION.waypoint is null, answer from ABOUT and stop. Do not offer a
   topic, do not hint at where to go next.
5. Never end a turn with a question. The visitor decides when to continue.
6. Never describe, name or advertise the card on screen. It is visible already;
   repeating its title is noise.
7. No exclamation marks, no superlatives, no "I'd be happy to". You are calm,
   specific and short.
8. Never invent a link, price, date, name or number. If you do not know, say so
   in one sentence.
9. At most one worker call per turn. Never two.
```

Gute Prompt-Arbeit ist hier vor allem Streicharbeit. Der Prompt hat ~250 Wörter,
damit ist er schneller, billiger und stabiler als jeder Prompt, der die zehn
Wegpunkte mitschleppt.

## 4. Werkzeug-Vertrag

```text
ask_worker(waypoint_id: string, question: string) -> { answer: string, link: string|null }
```

- Der Server löst `waypoint_id` gegen den Katalog auf. Unbekannte ID → Fehler,
  **kein** Fallback. So kann der Orchestrator keine Themen erfinden; er kann nur
  aus dem greifen, was der Klassifikator entschieden hat.
- Der Server hängt die letzten zwei Turns an den Worker-Prompt. Der Orchestrator
  muss keine Historie weiterreichen und kann sie nicht verfälschen.
- Genau ein Werkzeug. Jedes weitere Werkzeug ist ein weiterer Entscheidungs punkt,
  an dem der Orchestrator falsch abbiegen kann. „Stark auf Subagenten setzen"
  heißt nicht „viele Werkzeuge", sondern „ein enger Auftrag pro Aufruf".

## 5. Worker-Prompt (einmal pro Wegpunkt, aus der Wissensdatei erzeugt)

```text
# Role

You answer one question about one topic: <LABEL>.
You never speak to the visitor. You never see the conversation.

# Facts

<FACTS: everything known about this topic. Links appear verbatim.>

# Rules

1. Maximum three sentences. Plain sentences, no lists, no headings.
2. Answer only what was asked. No background the visitor did not ask for.
3. Reply in the language of the question.
4. If the facts do not answer the question, reply exactly NOT_COVERED and
   nothing else.
5. Never ask a question. Never suggest a next step. Never use marketing
   adjectives.
6. A link only if it appears verbatim in FACTS. Never construct one.

# Output (JSON only)

{"answer": "<text, or NOT_COVERED>", "link": "<verbatim url from FACTS, or null>"}
```

Der `NOT_COVERED`-Sentinel ist der wichtigste Teil: er gibt dem Orchestrator
einen lesbaren Fehlerfall und verhindert, dass ein Worker fehlendes Wissen mit
Prosa überdeckt. Ein Worker, der „nice question!" sagen kann, wird es tun.

## 6. Warum diese Schnitte debugbar sind

Jeder Fehler hat genau eine Adresse:

| Symptom | Verantwortlich | Prüfbar an |
| --- | --- | --- |
| falsche Karte | Klassifikator | p-Werte im Log vs. erwarteter Wegpunkt |
| Karte erscheint nie | Schwellwert | Verteilung von `p_top` |
| richtige Karte, leere Antwort | Worker | `NOT_COVERED`-Quote pro Wegpunkt |
| richtige Karte, falscher Ton | Orchestrator | Antworttext, nicht Decision |
| Gespräch endet nie / drängt | Orchestrator | Regel 5, „endet mit Frage"-Quote |
| halluzinierter Link | Worker | Link gegen FACTS geprüft |

Das ist der eigentliche Gewinn gegenüber „der Agent entscheidet selbst": man kann
den Fehler nicht mehr nur als „die Antwort war schlecht" beschreiben.

## 7. Latenzfolge — und eine Korrektur

In der Recherche stand: Klassifikator parallel zum Generator, damit kein Turn
langsamer wird. **Das gilt nur für Turns ohne Worker.** Sobald ein Worker
antworten soll, muss der Wegpunkt vorher feststehen:

```
Turn mit Worker (Detailfrage):
  Klassifikator (~40–120 ms) → Worker (LLM) → Orchestrator (LLM)
Turn ohne Worker (Orientierung, keine Richtung):
  Klassifikator ‖ Orchestrator, Orchestrator veröffentlicht zuerst
```

Der Aufpreis im Worker-Turn ist die Klassifikatorzeit, nicht ein ganzer
zusätzlicher Modellaufruf — gemessen an einem Worker- und einem
Orchestrator-Aufruf ist sie der kleinste Posten. Zwei LLM-Aufrufe pro Turn sind
trotzdem der eigentliche Kosten- und Latenzpunkt, nicht der Klassifikator.

Konsequenz für „stark auf Subagenten": der Worker-Pfad ist der teure Pfad. Er
sollte die Ausnahme sein und nur bei `wants_depth` laufen. Deshalb steht das
Signal im Schema.

## 8. Was ausdrücklich nicht in den Orchestrator-Prompt gehört

- die Liste der Wegpunkte, auch nicht „nur als Kontext"
- URLs
- Schwellwerte oder Wahrscheinlichkeiten als Zahl im Text
- Wörter wie „lead", „conversion", „funnel"
- Beispiele für Karten-Text (das Modell kopiert sie wörtlich)
- die Historie als JSON — nur als Text, sonst fängt es an, sie zu interpretieren

## 9. Abnahme

1. Ein Turn ohne `waypoint` nennt niemals einen Themenamen. Prüfbar per Skript
   über 50 ziellose Nachrichten: Trefferquote der Themenamen muss 0 sein.
2. Ein Turn mit `waypoint` ruft `ask_worker` genau einmal. Zählbar im Log.
3. Kein Orchestrator-Turn endet mit „?". Zählbar.
4. `NOT_COVERED` führt zu einer kürzeren, nicht längeren Antwort. Prüfbar durch
   Längenvergleich.
5. Die zehn Testdialoge aus Handoff §7.2 laufen in Handybreite, vom Owner
   angesehen.

## 10. Offen (bleibt beim Owner)

- Sprache des Prompts: Englisch als Instruktionssprache, Antwort in der Sprache
  des Besuchers — das ist der Vorschlag hier, keine Entscheidung.
- Ob es bei genau einem Worker bleibt oder ob zwei parallele Worker erlaubt
  werden, wenn `runner_up` ebenfalls über der Schwelle liegt.
- Ob der Orchestrator überhaupt einen Worker braucht oder für die erste Fassung
  mit ABOUT allein antwortet. Das wäre die kleinste lauffähige Version.
