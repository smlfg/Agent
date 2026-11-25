# ENTWURF: `<SITE>` und `<ABOUT>` für den Site-Voice-Chat-Prompt

> **Status: ENTWURF (DRAFT)** — Diese Datei ist ein Vorschlag und benötigt **Samuels ausdrückliche Freigabe**, bevor sie in einen produktiven Prompt (z. B. `src/voice/voice-prompt.md`) übernommen wird.
>
> **Kontext:** Die folgende Ausarbeitung richtet sich an die Platzhalter `<SITE>` und `<ABOUT>` des vorgegebenen Voice-Chat-Prompts (`# Role` / `# What the site is` / Rules 1–9). Der bestehende Architekturunterschied zu [`HANDOFF-gespraechsfuehrung.md`](../../HANDOFF-gespraechsfuehrung.md) (§4/§6) wird hier bewusst nicht verändert oder aufgelöst.

---

## 1. Vorschlag für `<SITE>`

```text
Agentfähig
```

**Quellen:**
- [`README.md`](../../README.md), Zeile 1 (`# Agentfähig`)
- [`docs/PROJECT.md`](../../docs/PROJECT.md), Zeile 1 (`# Projektstand — Agentfähig`) und Zeile 69 (`auf Agentfähig`)
- [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md), Zeile 12 (`auf der Webseite agentfähig`)
- [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt), Zeile 17 (`auf der Webseite agentfähig`)

*(Alternative Schreibweisen wie `agentfähig` oder `agentfähig.de` siehe Review-Checkliste in Abschnitt 5.)*

---

## 2. Vorschlag für `<ABOUT>` (Deutsch und Englisch)

### Deutsch (3 schlichte Sätze)

```text
Agentfähig ist ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird. Die Seite ist kein Dokument mit einem Chatbot daneben, sondern eine Oberfläche, mit der Besucher direkt per Text oder freiwillig per Sprache interagieren. Sie stützt das Gespräch auf Kontext und Fähigkeiten und bleibt dabei ruhig und nicht bevormundend.
```

### Englisch (3 plain sentences)

```text
Agentfähig is a Human-Agent Interface where the website itself is experienced as an agent. Rather than a document with a separate chatbot alongside it, the page is an interface that visitors interact with directly by text or optionally by voice. It grounds the conversation in context and skills while staying calm and never patronizing.
```

---

## 3. Quellenangabe pro Satz

### Deutsch

1. **Satz 1:** *„Agentfähig ist ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird.“*
   - [`README.md`](../../README.md), Zeile 1 (`# Agentfähig`) und Zeile 3 (`Ein Human-Agent Interface, bei dem die Website selbst als Agent erlebbar wird.`)
   - [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md), Zeilen 11–12 (`Es geht darum, dem Human Agent Interface ein Embodiment zu geben auf der Webseite agentfähig.`)
   - [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt), Zeile 17 (`Es geht darum dem Human Agent Interface ein Embodiment zu geben auf der Webseite agentfähig.`)

2. **Satz 2:** *„Die Seite ist kein Dokument mit einem Chatbot daneben, sondern eine Oberfläche, mit der Besucher direkt per Text oder freiwillig per Sprache interagieren.“*
   - [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md), Zeilen 48–50 (`Und deshalb ist „eine Website mit einem Chatfenster" falsch. ... Ich will keine Webseite **mit** einem Agenten. Ich will eine Oberfläche, die **selbst** der Agent ist.`), Zeile 56 (`Die Seite ist nicht Dokument über etwas.`) und Zeilen 202–203 (`eine Website mit einem Chatbot daneben`)
   - [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md), Zeile 39 (`du interagierst damit`), Zeilen 42–45 (`Voice, Text. ... Voice und Text sind der Eingang.`) und Zeilen 101–102 (`Voice ist im Erstbau, aber es ist **freiwillig**.`)
   - [`docs/PROJECT.md`](../../docs/PROJECT.md), Zeilen 135–136 (`Text zuerst, Mikrofon nach Klick. Voice ist damit Teil des Erstbaus.`)
   - [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt), Zeilen 26–35 (`Dass das keine Webseite ist / Sondern du interagierst damit ... Voice, Text`)

3. **Satz 3:** *„Sie stützt das Gespräch auf Kontext und Fähigkeiten und bleibt dabei ruhig und nicht bevormundend.“*
   - [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt), Zeilen 35–38 (`Voice, Text / Context, Skills.`)
   - [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md), Zeilen 43–46 (`Context, Skills. ... Context und Skills sind das, was den Agenten von einem Chatbot unterscheidet.`)
   - [`docs/PROJECT.md`](../../docs/PROJECT.md), Zeilen 69–70 (`mit Voice, Text, Kontext und Skills.`) und Zeile 94 (`nicht-bevormundend`)
   - [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md), Zeilen 60–61 (`sanft`, `Soft and not scary.`) und Zeilen 95–99 (`nicht bevormundend`, `die Seite darf nie das Gefühl geben, dass sie mir etwas vorschreibt oder mich bedrängt`)
   - [`docs/PROJECT.md`](../../docs/PROJECT.md), Zeilen 124–126 (`Ruhiges Feld`, `Ruhige Sofort-Antwort`)

### Englisch

1. **Sentence 1:** *“Agentfähig is a Human-Agent Interface where the website itself is experienced as an agent.”*
   - Abgeleitet aus Satz 1 (siehe [`README.md`](../../README.md) Z. 1, 3; [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md) Z. 11–12; [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt) Z. 17).
2. **Sentence 2:** *“Rather than a document with a separate chatbot alongside it, the page is an interface that visitors interact with directly by text or optionally by voice.”*
   - Abgeleitet aus Satz 2 (siehe [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md) Z. 39, 42–45, 48–50, 56, 101–102, 202–203; [`docs/PROJECT.md`](../../docs/PROJECT.md) Z. 135–136; [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt) Z. 26–35).
3. **Sentence 3:** *“It grounds the conversation in context and skills while staying calm and never patronizing.”*
   - Abgeleitet aus Satz 3 (siehe [`IDEA-TRANSKRIPT.txt`](../../IDEA-TRANSKRIPT.txt) Z. 35–38; [`docs/VISION-samuel.md`](../../docs/VISION-samuel.md) Z. 43–46, 60–61, 95–99; [`docs/PROJECT.md`](../../docs/PROJECT.md) Z. 69–70, 94, 124–126).

---

## 4. Prüfung gegen die harten Prompt-Regeln

| Prüfpunkt | Ergebnis | Befund |
|---|---|---|
| **Länge (2–3 schlichte Sätze)** | Bestanden | Sowohl DE als auch EN bestehen aus genau 3 kurzen, schlichten Sätzen. |
| **Keine Topics, Wegpunkte, Bereiche, Menüs oder Themenlisten (Prompt Rule 2)** | Bestanden | Keine Erwähnung von `What this is`, `creator`, `product for X`, `hai-mcp`, GitHub-Repos, Domains, Buchung, Kontakt oder anderen Themen/Wegpunkten. Keine Aufzählung dessen, „was es sonst noch gibt“. |
| **Keine Beschreibung der UI-Karte / Bedienelemente (Prompt Rule 6)** | Bestanden | Keine Erwähnung von Karten, Chips, Slidern oder visuellen UI-Komponenten. |
| **Kein Abschluss mit einer Frage (Prompt Rule 5)** | Bestanden | Alle Sätze sind reine Aussagesätze. |
| **Ruhiger Ton, keine Ausrufezeichen, keine Superlative (Prompt Rule 7)** | Bestanden | Keine Ausrufezeichen (`!`), keine Superlative (z. B. kein „bestmöglich“ aus dem Transkript übernommen), kein Fülltext. |
| **Keine erfundenen Links, Preise, Daten, Namen oder Zahlen (Prompt Rule 8)** | Bestanden | Keine URLs/Links, keine Preise, keine Datumsangaben, keine Zahlen, keine nicht belegten Namen. |
| **Keine unbelegten Framework-, Hosting- oder Modellentscheidungen** | Bestanden | Bewusst **kein** Verweis auf Cloudflare, Workers, Durable Objects, konkrete LLMs oder STT/TTS-Modelle (vgl. `AGENTS.md` und `docs/PROJECT.md` Z. 71). |

---

## 5. Checkliste für Samuels Review (offene Freigaben & Präzisierungen)

Vor Übernahme in einen produktiven Prompt muss Samuel folgende Punkte klären oder freigeben:

- [ ] **Schreibweise von `<SITE>`:** Soll `<SITE>` als `Agentfähig`, `agentfähig` oder mit Domain `agentfähig.de` angegeben werden?
- [ ] **Zielsprache von `<ABOUT>`:** Reicht die englische Fassung (passend zur englischen Prompt-Vorlage und der Voice-Sprach-Entscheidung in `docs/PROJECT.md` Z. 147–148) oder soll `<ABOUT>` zweisprachig bzw. auf Deutsch im Prompt stehen?
- [ ] **Umfang (rein HAI vs. Creator-/Produktkontext):** Soll `<ABOUT>` bewusst rein beim Konzept „Human-Agent Interface“ bleiben (damit bei `DECISION.waypoint == null` keine Themen vorweggenommen werden), oder soll Samuel Flg bzw. ein allgemeiner Produkt-/Projektkontext (ohne Themenliste) ergänzt werden?
- [ ] **Projekt-/Baustatus erwähnen oder auslassen:** Soll `<ABOUT>` den Zielzustand als laufende Seite beschreiben (wie oben entworfen) oder — falls der Prompt bereits während der frühen Testphase läuft — darauf hinweisen, dass sich das Projekt noch im Aufbau befindet (`README.md` Z. 4–5, `docs/PROJECT.md` Z. 3–6)?
- [ ] **Erwähnung von „Kontext und Fähigkeiten“ / „context and skills“:** Satz 3 nennt diese beiden agentischen Säulen ohne Themen zu verraten; prüfen, ob das gewünscht ist oder ob Satz 3 rein auf Haltung („ruhig und nicht bevormundend“) gekürzt werden soll.
- [ ] **Erwähnung von „Text oder freiwillig per Sprache“:** Prüfen, ob Sprachinput im `<ABOUT>` bereits genannt werden darf, solange Voice noch instabil/im Messlauf ist (`docs/PROJECT.md` Z. 43–49).
- [ ] **Anrede im Deutschen (`Besucher` vs. `du`):** Im Entwurf wird neutral „Besucher“ verwendet, damit der Agent die Anrede frei an den Besucher anpassen kann; prüfen, ob explizit „du“ gewünscht ist.
