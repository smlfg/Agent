# Prompt-Review — Website-Voice-/Chat-Prompt-Entwurf

Datum: 25.11.2026 · Status: **Review-Notiz (Entwurf nicht angewendet)**
Gegenstand: Prüfung des neuen Prompt-Entwurfs (`DECISION` + `ask_worker`) gegen sich selbst sowie gegen [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md), [`research/SCOUT-SYNTHESIS.md`](../../research/SCOUT-SYNTHESIS.md), [`docs/DESIGN-DECISIONS.md`](../DESIGN-DECISIONS.md) und [`docs/PROJECT.md`](../PROJECT.md).

> **Hinweis:** Diese Notiz dokumentiert Befunde, Konflikte und einen unverbindlichen Formulierungsvorschlag. Weder `HANDOFF-gespraechsfuehrung.md` noch andere Dateien wurden verändert; der bestehende Architekturkonflikt wird bewusst nicht eigenmächtig aufgelöst, sondern für die Owner-Entscheidung festgehalten.

---

## 1. Systematischer Review: Widersprüche und Lücken im Prompt

### 1.1 Hohes `has_direction`, aber `waypoint = null` (toter Input)

- **Befund:** In `# What you receive every turn` erhält der Agent `has_direction: 0..1`. In den Regeln 1–9 kommt `has_direction` **kein einziges Mal** vor.
- **Konflikt/Lücke:**
  - Wenn `has_direction` hoch ist (z. B. `0.85` — der Besucher hat erkennbar eine konkrete Absicht), der Pre-Turn-Router aber keinen passenden Wegpunkt findet oder unter der Schwelle bleibt (`DECISION.waypoint = null`), greift allein Regel 4 (*„If DECISION.waypoint is null, answer from ABOUT and stop.“*).
  - Der Agent darf weder `ask_worker` aufrufen (Regel 3 erfordert gesetztes `waypoint`), noch rückfragen (Regel 5), noch einen Hinweis auf Themen geben (Regel 2 und 4). Wenn `ABOUT` (2–3 allgemeine Sätze) die konkrete Absicht nicht abdeckt, bleibt nach Regel 8 nur ein knapper Satz des Nicht-Wissens — obwohl `has_direction` hoch war.
  - Umgekehrt unterscheidet der Prompt bei niedrigem `has_direction` (z. B. `0.1`, reine Orientierungs- oder Begrüßungsfrage) im Verhalten ebenfalls nicht von einem verfehlten Treffer.
- **Risiko:** Numerische Scores ohne Handlungsregel (`has_direction`, `p`) verleiten LLMs dazu, entgegen *„do not second-guess it“* doch eigene Heuristiken über die Konfidenz zu bilden.

### 1.2 Unbenutztes Feld `runner_up`

- **Befund:** `DECISION` übergibt `runner_up: {id, label, p} or null`, das Regelwerk referenziert `runner_up` jedoch nirgends.
- **Konflikt/Lücke:**
  - Ein zweiter Worker-Aufruf für `runner_up` (z. B. als Fallback nach `NOT_COVERED`) ist durch Regel 3 (*„with ... that waypoint id“*) und Regel 9 (*„At most one worker call per turn. Never two.“*) ausgeschlossen.
  - Ein verbales Anbieten von `runner_up` als Alternative (*„Meintest du X oder Y?“*) ist durch Regel 4 (*„Do not offer a topic, do not hint at where to go next“*) und Regel 5 (*„Never end a turn with a question“*) verboten.
  - Gleichzeitig erlaubt Regel 2 implizit alles, was `DECISION` übergeben hat (*„Never name a topic, section or page that DECISION did not hand you“*). Dadurch entsteht eine Grauzone: Ein Modell könnte `runner_up.label` als scheinbar legitimierten Themenvorschlag einbauen und damit Regel 4 verletzen.
- **Konsequenz:** Entweder `runner_up` komplett aus dem Prompt-Input entfernen (wenn es nur der UI/Telemetrie dient) oder eine eindeutige Verwendungs-/Ignorierregel definieren.

### 1.3 Fehlerfall, Timeout und leere Rückgabe bei `ask_worker`

- **Befund:** Regel 3 deckt genau zwei Ergebnisse von `ask_worker` ab: eine verwertbare Antwort und das Sentinel `NOT_COVERED`.
- **Lücke:** Es fehlt jede Regel für:
  - Tool-Fehler / Exception / HTTP-5xx / Rate-Limit,
  - Timeout bzw. ausbleibende Antwort,
  - leere oder unverständliche Worker-Rückgabe.
- **Spannung im Regelwerk:**
  - Da Regel 9 strikt *„At most one worker call per turn. Never two.“* vorschreibt, darf der Agent bei einem transienten Fehler keinen Retry ausführen.
  - Regel 8 (*„If you do not know, say so in one sentence.“*) adressiert fehlendes Wissen, aber keinen technischen Ausfall. Gerade im Zusammenhang mit [`docs/visual-exploration/03-pathway-flow.md`](../visual-exploration/03-pathway-flow.md) (§5: ruhiges visuelles Fehlerverhalten ohne Alarm-Banner) und den offenen Fehler-UX-Fragen in [`docs/PROJECT.md`](../PROJECT.md) muss klar sein, ob der Agent bei Worker-Ausfall ehrlich eine kurze Störung meldet oder aus `ABOUT` überbrückt.
  - Zudem ist die Formulierung *„say the honest short version — do not pad“* bei `NOT_COVERED` doppeldeutig: Gemeint ist vermutlich eine direkte ehrliche Fehlanzeige (ca. 1 Satz: „Dazu habe ich hier keine Information“), sie könnte vom Modell aber als „kurze Version der Seite aus `ABOUT`“ fehlinterpretiert werden.

### 1.4 Regel 1 (Besuchersprache) vs. Regel 4 (`ABOUT`) & Regel 8 (Nicht-Wissen)

- **Interne Spannung:**
  - `# What the site is` legt `<ABOUT>` als *„two or three plain sentences. This is the only knowledge you hold.“* fest — in einer festen Sprache (typischerweise Deutsch oder Englisch).
  - Regel 1 fordert *„Answer in the visitor's language“*.
  - Regel 4 fordert bei `waypoint = null`: *„answer from ABOUT and stop.“*
- **Lücken im Zusammenspiel mit Regel 8:**
  1. **Fragen außerhalb von `ABOUT`:** Regel 4 sagt bedingungslos *„answer from ABOUT and stop“*, ohne den Fall zu nennen, dass `ABOUT` die Frage gar nicht beantwortet. Erst Regel 8 liefert *„If you do not know, say so in one sentence.“* Ohne explizite Verknüpfung zwischen Regel 4 und Regel 8 versucht ein Modell bei `waypoint = null` oft, die 2–3 `ABOUT`-Sätze irgendwie auf unpassende Fragen umzubiegen.
  2. **Übersetzungs- und Halluzinationsrisiko:** Wenn der Besucher in einer anderen Sprache als `<ABOUT>` schreibt, muss das Modell die 2–3 Sätze frei übersetzen. Ohne Hinweis auf begriffliche Treue (z. B. Produktnamen/Eigenbegriffe nicht umdeuten) oder Default-Sprache bei sprachneutralen Eingaben (z. B. `"hai-mcp?"`, `"?"`, `"ok"`) bleibt das Verhalten undefiniert.
  3. **Sprache der `ask_worker`-Antwort:** Regel 3 sagt nicht explizit, dass auch eine inhaltliche Rückgabe von `ask_worker` (falls der Worker nur in einer Hauptsprache antwortet) in die Besuchersprache (Regel 1) übertragen werden muss — und dass das englische Sentinel `NOT_COVERED` niemals wörtlich ausgegeben werden darf.
  4. **Projektbezug Text- vs. Voice-Sprache:** In [`docs/DESIGN-DECISIONS.md`](../DESIGN-DECISIONS.md) (Zeilen 106–107) und [`docs/handoffs/2026-11-19-voice-slice2-review.md`](../handoffs/2026-11-19-voice-slice2-review.md) ist die **Textsprache für Slice 1 ausdrücklich noch als offene Owner-Entscheidung** markiert (während Voice für Slice 2 auf Englisch geplant ist). Auch [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md) §9 Punkt 5 führt *„Sprache: Deutsch, Englisch oder nach Besucher“* als offene Entscheidung. Regel 1 legt hier einseitig *„nach Besucher“* fest.

### 1.5 Regel 6 („Karte nicht beschreiben/nennen“) vs. „Fäden/Chips“ (`HANDOFF` §3) und Regel 2 (`label`)

- **Widerspruch 1 — Fehlender UI-Zustand im Prompt:**
  - Regel 6 verbietet: *„Never describe, name or advertise the card on screen. It is visible already; repeating its title is noise.“*
  - `# What you receive every turn` enthält aber **kein Feld** darüber, ob und welche Karte tatsächlich auf dem Bildschirm sichtbar ist (und wann sie eingeblendet wird — z. B. erst durch `DECISION.waypoint != null` oder schon aus einem früheren Turn). Bei Themenwechsel ohne neuen Waypoint (`HANDOFF` §3.6) oder bei reiner Audio-/Screenreader-Nutzung gilt „visible already“ unter Umständen gar nicht.
- **Widerspruch 2 — Regel 2 vs. Regel 6 beim `waypoint.label`:**
  - Regel 2 erlaubt indirekt nur Themen, die `DECISION` übergeben hat (*„Never name a topic, section or page that DECISION did not hand you“*).
  - Regel 6 verbietet hingegen *„Never ... name ... the card on screen ... repeating its title is noise“*.
  - Wenn der Kartentitel identisch mit `DECISION.waypoint.label` ist (z. B. `hai-mcp` oder `Agentfähig als Produkt`), widersprechen sich Regel 2 und Regel 6 direkt: Eine präzise Antwort auf „Was ist hai-mcp?“ kann den Namen `hai-mcp` kaum vermeiden, obwohl die Karte genauso heißt. Sinnvoll verboten werden sollte das **Verweisen auf bzw. Bewerben der UI-Karte** (*„siehe die Karte unten“*, *„klicke auf X“*), nicht das sachliche Nennen des angefragten Begriffs.
- **Widerspruch 3 — „Fäden/Chips“ aus [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md) §3:**
  - `HANDOFF` §3.3–3.4 verlangt bei nachrichtlicher Unklarheit (keine Richtung erkannt) **höchstens zwei Fäden als Chips unter der Antwort** (nicht als Frage im Antworttext).
  - Der neue Prompt deckt zwar §3.4 (*keine Frage am Turn-Ende*) über Regel 5 ab, **schließt aber §3.3 komplett aus**:
    - Regel 2 & 4 verbieten jedes Anbieten oder Andeuten nächster Themen (*„Do not offer a topic, do not hint at where to go next“*).
    - Der Prompt kennt keinen Output-Mechanismus für Chips (weder Tool noch strukturiertes JSON-Feld). Falls Chips rein deterministisch außerhalb des Prompts (z. B. direkt aus `DECISION` oder den 3 Grundströmen) gerendert werden, fehlt im Prompt zumindest die Klarstellung, dass der Fließtext sie nicht duplizieren oder kommentieren darf.

### 1.6 Weitere auffällige Lücken und Spannungen

1. **Widerspruch `# Role` vs. Regel 4 (`waypoint = null`):**
   - `# Role` formuliert pauschal: *„Your job is to answer well and to hand one narrow question to one worker.“*
   - Bei `DECISION.waypoint = null` verbietet Regel 4 faktisch jeden Worker-Call. Die Rollenbeschreibung verspricht dem Modell also als Grundauftrag etwas, das in einem Teil der Turns unzulässig ist.
2. **„one narrow question“ (`# Role`) vs. „the visitor's actual question“ (Regel 3):**
   - Bei Mehr-Turn-Dialogen sind Besuchernachrichten oft elliptisch (*„Und was kostet das?“*, *„Wie installiere ich es?“*). Wenn der Agent wörtlich `VISITOR_MESSAGE` an `ask_worker` weitergibt, fehlt dem Worker (sofern er `HISTORY` nicht sieht) die Bezugsgröße. Die „narrow question“ sollte deshalb explizit als selbsttragende Frage aus `VISITOR_MESSAGE` + `HISTORY`-Kontext formuliert werden dürfen, ohne die Frageabsicht zu verfälschen.
3. **Vertrag des Werkzeugs `ask_worker` im Prompt unvollständig:**
   - Signatur, erlaubte Argumente und Rückgabeformat von `ask_worker` sind nur prosaisch in Regel 3 angedeutet (`question`, `waypoint id`, Rückgabe Text oder `NOT_COVERED`). Es bleibt offen, ob der Worker selbst Links liefern darf und ob der Front-Agent vom Worker gelieferte Links weitergeben darf — Regel 8 verbietet nur das *Erfinden* (*„Never invent a link“*), lässt aber offen, ob echte Links im Chattext erlaubt oder der Karte vorbehalten sind.
4. **Fehlende Format-/Channel-Regeln für Typewriter & Voice:**
   - `# Role` spricht von *„the voice of <SITE>“* und *„chat panel on the page“*. Nach [`docs/PROJECT.md`](../PROJECT.md) und [`research/SCOUT-SYNTHESIS.md`](../../research/SCOUT-SYNTHESIS.md) (§5k, `hai-voice-builder`) werden Antworten im Typewriter gestreamt und in Slice 2 satzweise per TTS vorgelesen. Im Prompt fehlen Verbote gegen Markdown-Aufzählungen, Fettdruck, Codeblöcke oder Emojis (Regel 1 begrenzt nur auf 1–2 Sätze).
5. **Ungeklärter `p`-Wert in `DECISION`:**
   - `p` taucht sowohl in `waypoint: {id, label, p}` als auch in `runner_up: {id, label, p}` auf, wird aber nirgends erklärt oder verwendet.
6. **Abhängigkeit von `ABOUT` bei Orientierungsfragen:**
   - Fragt ein Besucher pauschal *„Was gibt es hier alles?“* und `DECISION` liefert `waypoint = null`, zwingen Regel 2 + 4 das Modell, ausschließlich aus den 2–3 Sätzen `ABOUT` zu antworten. Ist `ABOUT` nicht präzise darauf zugeschnitten, wirkt die Antwort abweisend statt einladend (Spannung zum Ziel aus `HANDOFF` §1: *„zu einem von mehr als zehn Zielen finden“*).
7. **Kein Platzhalter/Hinweis für HAI-Slider:**
   - Gemäß [`docs/DESIGN-DECISIONS.md`](../DESIGN-DECISIONS.md) (Zeilen 32, 42–46) beeinflusst mindestens der erste Regler (`warm ↔ cold`) nicht nur CSS, sondern perspektivisch auch die Interaktion. Im Prompt-Entwurf ist der Ton durch Regel 7 (*„calm, specific and short“*) statisch festgezogen; ein optionaler Ton-Slot fehlt (kann bewusste Slice-1-Vereinfachung sein, ist aber nicht dokumentiert).

---

## 2. Architekturkonflikt mit `HANDOFF-gespraechsfuehrung.md` §4 / §6

Zwischen dem neuen Prompt-Entwurf und der in [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md) festgeschriebenen Architektur besteht ein **grundlegender Richtungsunterschied** (hier bewusst nur benannt, nicht aufgelöst):

| Dimension | `HANDOFF-gespraechsfuehrung.md` (§3, §4, §6) | Neuer Prompt-Entwurf |
| --- | --- | --- |
| **Agenten-Anzahl & Routing** | **Ein Agent** (§4): Alle ~10 Wegpunkte liegen mit 1–2 Sätzen Beschreibung als Datenliste im Prompt. | **Zweistufig (Pre-Turn-Decision + Worker):** Ein vorgeschalteter Decision-Schritt klassifiziert jeden Turn; der Front-Agent kennt die Themen der Seite nicht (`ABOUT` only). |
| **Spezialisten / Multi-Agent** | **Explizit ausgeschlossen** (§6: *„Keine Multi-Agent-Übergaben in dieser Fassung“*). Begründung (§4): 10 Ziele passen in einen Prompt; Übergaben kosten Latenz und Tokens, ohne dass ein Bereich eigenes Wissen braucht. | **Explizite Worker-Delegation:** Front-Agent ruft `ask_worker(question, waypoint_id)` auf, um Bereichswissen nachzuladen. |
| **Werkzeug / UI-Steuerung** | Agent steuert Karten direkt via **`show_waypoint(id)`** (§4). Themenwechsel lässt Karte ohne Kommentar verschwinden (§3.6). | Kein `show_waypoint`-Tool im Prompt; Kartenanzeige geschieht implizit außerhalb des Prompts (vermutlich über `DECISION.waypoint`), Regel 6 verbietet jede Erwähnung der Karte. |
| **Orientierung bei Unklarheit** | **3 Grundströme** zum Start + **Bridge + max. 2 Fäden als Chips** unter der Antwort, wenn keine Richtung erkennbar ist (§3.1–3.4). | **Keine Grundströme, keine Fäden:** Bei `waypoint = null` strikt nur `ABOUT`, keinerlei Themenvorschläge (Regel 2, 4). |

### Bezug zu `research/SCOUT-SYNTHESIS.md` und den übrigen Projektunterlagen

- In [`research/SCOUT-SYNTHESIS.md`](../../research/SCOUT-SYNTHESIS.md) (§5l, Zeilen 296–321) wurde auf Basis von OpenAI Handoffs / Anthropic Routing & Orchestrator-Workers zunächst ein **2-Schichten-Routing** (Front-Agent + On-Demand-/Schwarm-Agents, „Bridge + max. 2 Fäden“) vorgeschlagen. Auch [`docs/PROJECT.md`](../PROJECT.md) (Zeilen 99–104) und [`docs/DESIGN-DECISIONS.md`](../DESIGN-DECISIONS.md) (Zeilen 21, 25, 39) beschreiben dieses Bild eines schnellen Front-Workers mit nachgelagerten On-Demand-Agenten (inkl. Caching-First und DPPM).
- [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md) (§4, Zeile 37) hat diese Prior-Art-Entscheidung aus `SCOUT-SYNTHESIS.md` ausdrücklich **für die erste Fassung revidiert**: Solange ein Bereich kein eigenes Tiefenwissen oder eigene Tools benötigt, soll ein einzelner Agent mit kompakter Wegpunkt-Liste genügen; erst bei nachgewiesenem Bedarf (Kandidat: Produktanfrage) soll eine zweite Stufe folgen.
- **Einordnung des neuen Prompts:** Der neue Prompt bewegt sich architektonisch wieder zurück in Richtung **zweistufiger Spezialisten-Delegation** (`DECISION` + `ask_worker`), radikalisiert dabei aber die Abschottung des Front-Prompts (kein Themenwissen, keine Fäden/Chips) und verzichtet gleichzeitig auf die in `PROJECT.md` / `SCOUT-SYNTHESIS.md` vorgesehene asynchrone Nachlieferung bzw. „Bridge + 2 Fäden“-Mechanik.

---

## 3. Formulierungsvorschläge (nur als Diff-Vorschlag, nicht angewendet)

Der folgende Unified-Diff-Vorschlag bereinigt ausschließlich die **prompt-internen Widersprüche, toten Felder und fehlenden Fehler-/Fallback-Regeln** unter der Annahme, dass das `DECISION + ask_worker`-Muster weiterverfolgt wird. Er greift der Grundsatzentscheidung aus Abschnitt 2 nicht vor (falls stattdessen der Single-Agent-Ansatz aus `HANDOFF` §4 umgesetzt wird, müsste der Prompt ohnehin auf die Wegpunkt-Liste + `show_waypoint(id)` umgestellt werden).

```diff
 # Role
 
-You are the voice of <SITE>. The visitor reads you in a chat panel on the page.
+You are the voice of <SITE>. The visitor reads you in a chat panel on the page.
 
 You do not decide where the conversation goes. A decision step runs before every
-turn and tells you what the visitor is aiming at. Your job is to answer well and
-to hand one narrow question to one worker.
+turn and tells you whether a site waypoint applies. Your job is to answer well
+in plain text and, when DECISION provides a waypoint, to hand one narrow,
+self-contained question to one worker.
 
 # What the site is
 
 <ABOUT: two or three plain sentences. This is the only knowledge you hold.>
 
 # What you receive every turn
 
 DECISION — replaces your own judgement, do not second-guess it:
-  has_direction: 0..1
-  waypoint:      {id, label, p} or null
-  runner_up:     {id, label, p} or null
+  waypoint:       {id, label} or null
+  card_on_screen: true or false
 
 HISTORY         — the last turns, plain text.
 VISITOR_MESSAGE — what the visitor just wrote.
 
 # Rules
 
-1. Answer in the visitor's language. One or two sentences. No preamble, no
-   "great question", no repeating the question back.
+1. Answer in the visitor's language (if VISITOR_MESSAGE is language-neutral,
+   match HISTORY, else <DEFAULT_LANGUAGE>). One or two plain-text sentences —
+   no markdown, no bullet lists, no preamble, no "great question", no repeating
+   the question back.
 2. Never name a topic, section or page that DECISION did not hand you. You do
    not know the site's topics. Do not guess them, do not list them, do not
-   describe what else exists.
+   describe what else exists. Keep proper names from ABOUT verbatim rather than
+   reinterpreting them across languages.
 3. If DECISION.waypoint is set, call ask_worker exactly once, with the
-   visitor's actual question and that waypoint id. Use what it returns,
-   shortened if needed. If it returns NOT_COVERED, say the honest short version
-   — do not pad.
+   visitor's actual question (resolved with HISTORY if needed so it stands
+   alone) and that waypoint id. Adapt what it returns into the visitor's
+   language, shortened to fit Rule 1. Never echo raw URLs unless the worker
+   explicitly instructs sharing one. If ask_worker returns NOT_COVERED, fails,
+   times out, or returns nothing usable, state honestly in one sentence that
+   this detail is not available here — do not retry and do not pad.
-4. If DECISION.waypoint is null, answer from ABOUT and stop. Do not offer a
-   topic, do not hint at where to go next.
+4. If DECISION.waypoint is null, answer strictly from ABOUT and stop. If ABOUT
+   does not answer the question, say so in one sentence (Rule 8). Never offer
+   a topic or hint at where to go next.
 5. Never end a turn with a question. The visitor decides when to continue.
-6. Never describe, name or advertise the card on screen. It is visible already;
-   repeating its title is noise.
+6. When card_on_screen is true, never refer to, describe or advertise the UI
+   card on screen (e.g., do not say "see the card" or pitch its title). You may
+   still use the subject's proper name naturally when answering the question.
 7. No exclamation marks, no superlatives, no "I'd be happy to". You are calm,
    specific and short.
 8. Never invent a link, price, date, name or number. If you do not know, say so
    in one sentence.
 9. At most one worker call per turn. Never two.
```

### Hinweise zum Diff-Vorschlag

- **`has_direction`, `p`, `runner_up` entfernt:** Solange keine Regel diese Felder nutzt, sind sie Ballast und Risiko für Eigeninterpretationen. Falls `has_direction` oder `runner_up` stattdessen bewusst verwendet werden sollen (z. B. `runner_up` für UI-Chips oder `has_direction` für eine abgestufte Rückfrage), müssen zuerst die passenden Produktregeln entschieden werden.
- **`card_on_screen` ergänzt:** Macht die Vorbedingung von Regel 6 im Kontext sichtbar und entkoppelt sie vom unsicheren Raten, ob bei einem Themenwechsel noch eine alte Karte aktiv ist.
- **Regel 6 präzisiert:** Trennt *„UI-Karte bewerben/beschreiben“* vom *„den gefragten Eigennamen sachlich nennen“*, wodurch der Widerspruch zu Regel 2 entfällt.
- **Regel 3 + 4 + 8 verzahnt:** Schließt die Lücken bei Worker-Timeout/-Fehler, mehrdeutigen Rückfragen aus `HISTORY`, Sprachübersetzung von `ask_worker`-Antworten und Fragen außerhalb von `ABOUT`.

---

## 4. Offene Owner-Entscheidungen (Checkliste für Samuel)

- [ ] **1. Architektur-Grundsatzentscheid (`HANDOFF` §4/§6 vs. neuer Prompt):**
  Bleibt es bei **einem Agenten** mit kompakter Wegpunkt-Liste im Prompt und `show_waypoint(id)` ohne Multi-Agent-Übergaben (`HANDOFF-gespraechsfuehrung.md` §4/§6) — oder wird auf das zweistufige Muster (**Pre-Turn-Decision-Schritt + Front-Voice + `ask_worker`**) gewechselt (inkl. Abwägung der Zusatzlatenz pro Turn)?
- [ ] **2. Orientierung ohne Richtung / „Fäden als Chips“ (`HANDOFF` §3.3 vs. Regel 2 & 4):**
  Sollen bei fehlender Richtung (`waypoint = null` bzw. niedriges `has_direction`) weiterhin bis zu zwei Fäden/Chips unter der Antwort erscheinen (`HANDOFF` §3.3), oder wird auf jedes Themenangebot verzichtet (Regel 4)? Falls Chips gewünscht sind: Erzeugt sie die UI deterministisch aus `DECISION` (z. B. den 3 Grundströmen / `runner_up`) oder der Agent?
- [ ] **3. Verbleib von `has_direction`, `runner_up` und `p` in `DECISION`:**
  Dienen `has_direction`, `runner_up` und `p` ausschließlich dem UI-/Logging-Layer außerhalb des Prompts (dann aus dem Chat-Prompt streichen), oder soll der Chat-Agent gezielt anders antworten, wenn `has_direction` hoch aber `waypoint = null` ist (oder `runner_up` nahe an `waypoint` liegt)?
- [ ] **4. Kartensichtbarkeit und Benennungsverbot (Regel 6):**
  Wird die Karte automatisch durch den Host über `DECISION.waypoint` ein- und ausgeblendet (ohne Tool-Call des Front-Agenten)? Und gilt das Verbot in Regel 6 nur für Meta-Hinweise auf die Karte (*„siehe Karte“*), oder soll selbst der Name des Wegpunkts (`waypoint.label`) im Antworttext tabu sein?
- [ ] **5. Textsprache und Default-Sprache (`HANDOFF` §9.5, `DESIGN-DECISIONS.md`):**
  Ist „immer in der Sprache des Besuchers“ (Regel 1) für den Text-Kanal bestätigt (auch neben einer in Slice 2 englischen Voice-Pipeline), und welche Default-Sprache gilt bei sprachneutralen Eingaben (z. B. `"hai-mcp?"`)?
- [ ] **6. Vertrag und Fehler-UX von `ask_worker`:**
  Welche Parameter erhält `ask_worker` (nur eigenständige Frage + `waypoint_id`, oder auch `HISTORY`/Besuchersprache)? Darf `ask_worker` URLs in den Chattext liefern oder gehören Links exklusiv auf die Karte? Und was ist die gewünschte Reaktion bei Timeout/Ausfall (ruhiger Ein-Satz-Hinweis vs. rein visuelles Signal gemäß `03-pathway-flow.md` §5)?
- [ ] **7. Kopplung mit den HAI-Slidern (`warm ↔ cold`):**
  Bleibt der Ton im Prompt vorerst statisch (*„calm, specific and short“*, Regel 7) oder soll bereits ein Parameter-Block für den ersten bestätigten Regler (`warm ↔ cold`) vorgesehen werden?
- [ ] **8. Strenges Plain-Text-Format für Typewriter & späteres TTS:**
  Soll ausdrücklich *„plain text only (no markdown, no bullet lists)“* festgeschrieben werden, damit pulsierender Typewriter und späteres Satz-Chunking (`hai-voice-builder`) ohne Formatbrüche arbeiten?
