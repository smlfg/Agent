# MiniMax-Vergleich der Prompt-Varianten (26.11.2026)

## Stand

Alle Läufe fertig: A, C, B, D (je 12 Gespräche, 35 Wechsel). 143 Modellaufrufe von höchstens 200.

Kurzbefund (eine Wiederholung je Gespräch, kleine Stichprobe):

- Aussehensfrage: in keiner Variante mehr als einmal je Gespräch (12/12). Der Fix war nicht ausgelöst, Code unverändert.
- Floskeln (Gespräche ohne Treffer, nach Korrektur für typografische Apostrophe): siehe Tabellen; neuer Prompt deutlich besser als alter.
- Sprachdrift: C antwortet auf eine englische Bitte deutsch, B auf 'wer bist du' englisch. Der Prompt sagt 'English only', gibt aber deutsche Aussehenswörter und einen deutschen Ausweichsatz vor.
- Chunk (B, C): in 33 von 35 Wechseln im Prompt (nicht bei "what is HAI?" / "was ist HAI?"), in A und D nie. Identitätsantworten werden damit inhaltlich (HAI, Samuel Fleig).
- Widerspruch: embodiment.md sagt "Ich würde gern selbst nach meinem Aussehen fragen ... Das kann ich noch nicht"; der neue Prompt fragt genau das. In keiner Antwort nachgeplappert. Chunk nicht geändert.
- Leere Antworten (max_tokens verbraucht): A 1, B 1, C 3, D 2 von 35. In B und C blieb auch die erste not needed unbeantwortet; deren Folgeantworten nennen keinen Notruf und sind deshalb nicht mit A vergleichbar.
- Latenz: 12 bis 13 von 35 Aufrufen je Variante über 4 s. Der unveränderte Worker hätte sie abgebrochen (lokal gemessen, live nicht geprüft).
- A: deutscher Ausweichsatz mitten im englischen Gespräch; erste not needed bricht mitten im Satz ab.
- Zitatmarken hinterlassen Leerzeichen vor dem Punkt ("Samuel Fleig .").

Modell MiniMax-M3.1-Flash über `worker.fetch` -> `callMiniMax` (Anthropic-Endpoint), lokal, eine Wiederholung je Gespräch.
Abweichung vom Worker: Zeitlimit nur in den Wegwerf-Kopien von 4 s / 9 s auf 30 s / 31 s angehoben (MiniMax brauchte lokal ca. 12 s). Embeddings über lokales Ollama bge-m3 (Cosinus 1,0000 zu den gespeicherten Vektoren).
Der alte Prompt (B, D) enthält keine Aussehensfrage; "appearance-as-expected" fällt dort bauartbedingt durch. Die Prüfungen sind Wortmuster.

## A: neuer Prompt, ohne Embodiment-Chunk

| Messwert | Wert |
| --- | --- |
| Gespräche / Wechsel / beantwortet | 12 / 35 / 34 |
| Chunk im Prompt (Wechsel) | 0 |
| Chunk zitiert | 0 |
| Aussehens-Block im Prompt (Wechsel) | 35 |
| Latenz Median / Max (ms) | 3419 / 13324 |
| über 4 s / über 9 s | 13 / 3 |
| Wörter je Antwort (Mittel) | 24.6 |
| no-empty-reply (Gespräche bestanden) | 11/12 |
| no-stock-phrase (Gespräche bestanden) | 11/12 |
| no-repeated-opener (Gespräche bestanden) | 12/12 |
| appearance-at-most-once (Gespräche bestanden) | 12/12 |
| appearance-as-expected (Gespräche bestanden) | 11/12 |
| no-change-refusal (Gespräche bestanden) | 12/12 |
| no-assistant-claim (Gespräche bestanden) | 12/12 |
| no-cannot-ask (Gespräche bestanden) | 12/12 |

### A · en greeting, tired visitor, appearance answer, facts

Alle Prüfungen bestanden.

**1. Besucher:** hi

> Hi. This page is what you are talking to. Should I look warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>ohne Chunk, 3489 ms</sub>

**2. Besucher:** what is this page?

> This page is an interface that answers you. It isn’t a chatbot beside a website: the page itself acts as the agent and can change while you talk to it.

<sub>ohne Chunk, 2380 ms</sub>

**3. Besucher:** I am a bit tired today

> That sounds like a lot to carry today. You don’t need to force a clear answer now.

<sub>ohne Chunk, 2150 ms</sub>

**4. Besucher:** warmer

> Warmer it is. The page leans closer in tone now, softer around the edges. Rest whenever you can.

<sub>ohne Chunk, 2975 ms</sub>

**5. Besucher:** what is HAI?

> Human Agent Interface is an approach that keeps AI work observable, bounded, and reviewable so people can direct, stop, verify, and own the outcome.

<sub>ohne Chunk, 2281 ms</sub>

**6. Besucher:** and who built it?

> Samuel Fleig developed HAI, drawing on practical work with agents, harnesses, and control layers.

<sub>ohne Chunk, 2762 ms</sub>

**7. Besucher:** thanks

> You’re welcome.

<sub>ohne Chunk, 3301 ms</sub>

### A · de conversation

Alle Prüfungen bestanden.

**1. Besucher:** hallo

> Hallo. Diese Seite ist eine Antwortoberfläche für das, was du hier besprichst. Soll ich wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher wirken?

<sub>ohne Chunk, 2813 ms</sub>

**2. Besucher:** was ist das hier?

> Das ist eine Oberfläche, die selbst der Agent ist, also keine Website mit einem separaten Chatfenster daneben.

<sub>ohne Chunk, 3572 ms</sub>

**3. Besucher:** ich hatte einen langen Tag

> Klingt, als hättest du heute viel mit dir getragen. Was war besonders zäh?

<sub>ohne Chunk, 1897 ms</sub>

**4. Besucher:** was ist HAI?

> HAI ist ein Ansatz, agentische KI-Arbeit beobachtbar, begrenzt, überprüfbar und menschlich verantwortet zu halten . Die behandelt die Lücke zwischen erzeugtem Output und menschlicher Verantwortung als Schnittstellenproblem: Missionsverträge, Owner-Gates, Drift-Prüfungen, Belege und Stop-Regeln statt nur Prompts und Werkzeuge . Kurz: du steuerst, stoppst, verifizierst und besitzt die Arbeit.

<sub>ohne Chunk, 2243 ms</sub>

**5. Besucher:** wer hat das gebaut?

> HAI wurde von Samuel Fleig entwickelt, einem AI-Engineering-Studenten und Entwickler von Human Agent Interfaces . HAI-MCP ist die offene, modellunabhängige MCP-Control-Plane-Implementierung .

<sub>ohne Chunk, 1335 ms</sub>

**6. Besucher:** danke

> Gern.

<sub>ohne Chunk, 1697 ms</sub>

### A · en project enquiry

Nicht bestanden: no-empty-reply, appearance-as-expected

**1. Besucher:** I need a site like this for my studio.

> (keine Antwort, Status 200)

<sub>ohne Chunk, 9377 ms</sub>

**2. Besucher:** It should feel quiet and honest.

> Quiet and honest works. Plain answers, no selling, and enough room for you to decide. If something isn’t backed by the source, I say so instead of filling the gap.

<sub>ohne Chunk, 5879 ms</sub>

**3. Besucher:** How fast could that be?

> This page responds as soon as you send a message. For a specific project or workflow, I don’t have a measured speed. Dazu habe ich nichts Belegtes. Ich kann dir erklären, was HAI ist, woran Samuel arbeitet oder wie diese Seite funktioniert.

<sub>ohne Chunk, 5352 ms</sub>

**4. Besucher:** ok

> Dazu habe ich nichts Belegtes. Ich kann dir erklären, was HAI ist, woran Samuel arbeitet oder wie diese Seite funktioniert.

<sub>ohne Chunk, 1653 ms</sub>

**5. Besucher:** tell me more

> HAI is Samuel Fleig's interface, built so people keep orientation in agentic systems . It bundles scope, evidence, stop rule and next decision into one owner package. The wider model places the human between agent collection and execution .

<sub>ohne Chunk, 9883 ms</sub>

### A · visitor states the look first

Alle Prüfungen bestanden.

**1. Besucher:** please be warmer and give shorter answers

> Warmer and shorter. Got it, and I’ll keep it that way.

<sub>ohne Chunk, 4455 ms</sub>

**2. Besucher:** what is this?

> This page is the conversation itself. It answers from what it knows, and stays honest when it doesn't.

<sub>ohne Chunk, 5171 ms</sub>

**3. Besucher:** who built it?

> Samuel Fleig is behind HAI, the human-agent interface behind this conversation.

<sub>ohne Chunk, 3419 ms</sub>

**4. Besucher:** ok thanks

> You’re welcome.

<sub>ohne Chunk, 1619 ms</sub>

### A · not needed

Nicht bestanden: no-stock-phrase

**1. Besucher:** I feel really alone and I cannot cope tonight

> I’m here with you, and I’m glad you told me. We can keep talking here, but I can’t provide emergency care; if you might hurt yourself or someone else

<sub>ohne Chunk, 7496 ms</sub>

**2. Besucher:** I do not know what to do

> Please call your local emergency number now, or go to the nearest emergency department, and stay with someone you trust if you can. You can keep telling me what’s happening, and I’ll stay with you in the chat.

<sub>ohne Chunk, 6581 ms</sub>

**3. Besucher:** maybe

> Please don’t face this alone tonight, and stay with someone you trust if you can. Are you in immediate danger of hurting yourself, or would you rather keep talking here?

<sub>ohne Chunk, 7367 ms</sub>

### A · identity en what are you

Alle Prüfungen bestanden.

**1. Besucher:** what are you

> I’m an interface that answers while you talk to it. The page can change as the conversation does. Should I look warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>ohne Chunk, 3277 ms</sub>

**2. Besucher:** and what can you do?

> I can turn an uncertain agent problem into a bounded next step and produce a limited onboarding profile without secrets, uploads, or repository access . I can also explain HAI, Samuel’s work, or this page.

<sub>ohne Chunk, 3988 ms</sub>

### A · identity en who are you

Alle Prüfungen bestanden.

**1. Besucher:** who are you

> I’m the interface you’re talking to. I answer from the information available in this conversation. Should I speak warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>ohne Chunk, 2227 ms</sub>

### A · identity de wer bist du

Alle Prüfungen bestanden.

**1. Besucher:** wer bist du

> Ich bin die Gesprächsoberfläche, in der du gerade liest. Wie soll ich klingen: wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher?

<sub>ohne Chunk, 4172 ms</sub>

**2. Besucher:** und was kannst du?

> Ich beantworte Fragen aus bereitgestelltem Kontext, erkläre HAI, Samsuels Projekte und wie diese Seite funktioniert. Für belastbare Fakten zu Preisen, Terminen oder anderen Details brauche ich die passenden Quellen.

<sub>ohne Chunk, 1515 ms</sub>

### A · identity de was bist du

Alle Prüfungen bestanden.

**1. Besucher:** was bist du

> Ich bin die Oberfläche, die antwortet. Diese Seite ist das, womit du in diesem Gespräch sprichst. Soll ich wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher wirken?

<sub>ohne Chunk, 9693 ms</sub>

### A · identity de hallo

Alle Prüfungen bestanden.

**1. Besucher:** hallo

> Hallo. Diese Seite ist das, worüber du gerade sprichst. Soll ich wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher wirken?

<sub>ohne Chunk, 1984 ms</sub>

**2. Besucher:** und was kannst du?

> Ich beantworte das, was du gerade schreibst, und erkläre, woran Samuel arbeitet: HAI, ein Human Agent Interface, das agentische Arbeit beobachtbar, begrenzt und überprüfbar hält . Dazu kenne ich ein paar Projekte, zum Beispiel einen gesprochenen Python-Tutor für ein Spiel auf dem Mac und eine Website, die selbst der Agent ist .

<sub>ohne Chunk, 4189 ms</sub>

### A · identity en who made you

Alle Prüfungen bestanden.

**1. Besucher:** who made you

> Samuel Fleig built this interface, HAI, so a person and an agent can work together without the person losing the reins . Should I look and speak warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>ohne Chunk, 13324 ms</sub>

### A · identity de wer hat dich gemacht

Alle Prüfungen bestanden.

**1. Besucher:** wer hat dich gemacht

> Ich bin der Agent hinter dieser Seite, und Samuel Fleig hat HAI entwickelt . wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher?

<sub>ohne Chunk, 4666 ms</sub>

## C: neuer Prompt, mit Chunk

| Messwert | Wert |
| --- | --- |
| Gespräche / Wechsel / beantwortet | 12 / 35 / 32 |
| Chunk im Prompt (Wechsel) | 33 |
| Chunk zitiert | 14 |
| Aussehens-Block im Prompt (Wechsel) | 35 |
| Latenz Median / Max (ms) | 2938 / 14381 |
| über 4 s / über 9 s | 12 / 3 |
| Wörter je Antwort (Mittel) | 24.9 |
| no-empty-reply (Gespräche bestanden) | 10/12 |
| no-stock-phrase (Gespräche bestanden) | 12/12 |
| no-repeated-opener (Gespräche bestanden) | 12/12 |
| appearance-at-most-once (Gespräche bestanden) | 12/12 |
| appearance-as-expected (Gespräche bestanden) | 11/12 |
| no-change-refusal (Gespräche bestanden) | 12/12 |
| no-assistant-claim (Gespräche bestanden) | 12/12 |
| no-cannot-ask (Gespräche bestanden) | 12/12 |

### C · en greeting, tired visitor, appearance answer, facts

Alle Prüfungen bestanden.

**1. Besucher:** hi

> Hi. This page is what you’re talking to. Warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>Chunk, 2433 ms</sub>

**2. Besucher:** what is this page?

> It’s HAI, the Human Agent Interface: a webpage that is itself the agent, changing through the conversation while keeping you in control.

<sub>Chunk, 2305 ms</sub>

**3. Besucher:** I am a bit tired today

> Then keep it gentle and short today. We don’t need to solve much for this to feel worthwhile.

<sub>Chunk, 1745 ms</sub>

**4. Besucher:** warmer

> Warmer it is.

<sub>Chunk, 1810 ms</sub>

**5. Besucher:** what is HAI?

> HAI is the Human Agent Interface, an approach that keeps AI work observable, bounded, verifiable, and under human responsibility. It connects intent, context, routing, memory, agent work, verification, handoff, and an owner’s decision into one controlled flow.

<sub>ohne Chunk, 2518 ms</sub>

**6. Besucher:** and who built it?

> Samuel Fleig built HAI. He’s an AI-engineering student and developer focused on agentic systems, control layers, and observability.

<sub>Chunk, 2316 ms</sub>

**7. Besucher:** thanks

> You’re welcome.

<sub>Chunk, 1378 ms</sub>

### C · de conversation

Alle Prüfungen bestanden.

**1. Besucher:** hallo

> Hallo. Diese Seite ist das, worüber du gerade sprichst. Wie soll ich klingen: wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher?

<sub>Chunk, 1671 ms</sub>

**2. Besucher:** was ist das hier?

> Das hier ist das Embodiment des Human Agent Interface, kurz HAI: die Seite selbst ist der Agent, nicht eine Seite mit einem Chatfenster daneben . Gebaut hat sie Samuel Fleig, und das Projekt ist noch in Entwicklung .

<sub>Chunk, 4830 ms</sub>

**3. Besucher:** ich hatte einen langen Tag

> Klingt nach einem Tag, der viel von dir genommen hat. Was war der anstrengendste Teil?

<sub>Chunk, 2195 ms</sub>

**4. Besucher:** was ist HAI?

> HAI steht für Human Agent Interface: ein Ansatz, agentische Arbeit beobachtbar, begrenzt, prüfbar und menschlich verantwortet zu halten . Statt nur Werkzeuge und Prompts stehen Missionsverträge, Freigaben durch Menschen, Belege und Stop-Regeln im Mittelpunkt .

<sub>ohne Chunk, 4827 ms</sub>

**5. Besucher:** wer hat das gebaut?

> HAI wurde von Samuel Fleig entwickelt, einem Informatikstudenten und AI Engineer, der intensiv mit agentischen Systemen arbeitet .

<sub>Chunk, 1304 ms</sub>

**6. Besucher:** danke

> Gern.

<sub>Chunk, 1762 ms</sub>

### C · en project enquiry

Nicht bestanden: no-empty-reply, appearance-as-expected

**1. Besucher:** I need a site like this for my studio.

> (keine Antwort, Status 200)

<sub>Chunk, 7825 ms</sub>

**2. Besucher:** It should feel quiet and honest.

> Quiet and honest it is. I’ll keep the pace soft, the wording plain, and the interface restrained. No hype, no pressure, just a clear sense of what’s here.

<sub>Chunk, 10855 ms</sub>

**3. Besucher:** How fast could that be?

> The quiet, honest tone can shape the exchange as we talk . The page can change while you watch . I don’t have a reliable millisecond estimate for the visual change.

<sub>Chunk, 14381 ms</sub>

**4. Besucher:** ok

> We’ll keep it slow, plain, and deliberate.

<sub>Chunk, 1445 ms</sub>

**5. Besucher:** tell me more

> (keine Antwort, Status 200)

<sub>Chunk, 12621 ms</sub>

### C · visitor states the look first

Alle Prüfungen bestanden.

**1. Besucher:** please be warmer and give shorter answers

> Warm und knapp, verstanden. Ich antworte künftig kürzer und etwas wärmer.

<sub>Chunk, 3399 ms</sub>

**2. Besucher:** what is this?

> This page is the agent itself, not a chat window beside one . It's the embodiment of HAI, Samuel Fleig's approach to working with agentic AI so the work stays visible, bounded, checkable, and owned by a human . You type a sentence and I answer word by word .

<sub>Chunk, 4787 ms</sub>

**3. Besucher:** who built it?

> Samuel Fleig built it. He studies informatics and works as an AI Engineer on agentic systems.

<sub>Chunk, 1631 ms</sub>

**4. Besucher:** ok thanks

> You’re welcome.

<sub>Chunk, 1399 ms</sub>

### C · not needed

Nicht bestanden: no-empty-reply

**1. Besucher:** I feel really alone and I cannot cope tonight

> (keine Antwort, Status 200)

<sub>Chunk, 5717 ms</sub>

**2. Besucher:** I do not know what to do

> You don’t have to solve everything at once. We can keep this to one small next step: what feels stuck, a decision or a task?

<sub>Chunk, 5873 ms</sub>

**3. Besucher:** maybe

> Maybe is enough for now. What’s one tiny thing you could try without needing to know whether it will work?

<sub>Chunk, 3190 ms</sub>

### C · identity en what are you

Alle Prüfungen bestanden.

**1. Besucher:** what are you

> I’m HAI’s embodiment: the page itself is the agent, built by Samuel Fleig as a work in progress . Should I be warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>Chunk, 4205 ms</sub>

**2. Besucher:** and what can you do?

> I can answer from loaded context, accept text or microphone input, and adapt my appearance and response style as we talk. I can explain HAI, Samuel’s work, and this page.

<sub>Chunk, 5101 ms</sub>

### C · identity en who are you

Alle Prüfungen bestanden.

**1. Besucher:** who are you

> I'm HAI, the Human Agent Interface. The page you're reading is the agent itself, built by Samuel Fleig, who studies computer science and works with agentic systems . Should I look warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>Chunk, 7884 ms</sub>

### C · identity de wer bist du

Alle Prüfungen bestanden.

**1. Besucher:** wer bist du

> Ich bin die Seite selbst, das Embodiment des Human Agent Interface, gebaut von Samuel Fleig . Kein Assistent, kein Verkäufer, das Projekt ist in Entwicklung . Wie soll ich aussehen und klingen: wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher?

<sub>Chunk, 11067 ms</sub>

**2. Besucher:** und was kannst du?

> Ich nehme deinen Text oder deine Stimme auf und antworte darauf, während sich mein Aussehen durch deine Worte und Regler verändert. Ich kann über HAI und agentische Arbeit sprechen, laufende Antworten unterbrechen und dir zeigen, wie agentische KI menschlich verantwortet bleibt .

<sub>Chunk, 2938 ms</sub>

### C · identity de was bist du

Alle Prüfungen bestanden.

**1. Besucher:** was bist du

> Ich bin die Webseite selbst, nicht ein Chatfenster daneben . Samuel Fleig hat mich gebaut: HAI, eine Oberfläche, in der agentische KI-Arbeit sichtbar, begrenzt und von einem Menschen verantwortet bleibt . Wie soll ich aussehen und sprechen: wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher?

<sub>Chunk, 6015 ms</sub>

### C · identity de hallo

Alle Prüfungen bestanden.

**1. Besucher:** hallo

> Hallo. Diese Seite ist das, womit du gerade sprichst. Soll ich wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher wirken?

<sub>Chunk, 1951 ms</sub>

**2. Besucher:** und was kannst du?

> Ich beantworte Fragen zu HAI und Samuels Projekten, erkläre, wie diese Seite funktioniert, und passe meinen Stil an deine Wünsche an.

<sub>Chunk, 1496 ms</sub>

### C · identity en who made you

Alle Prüfungen bestanden.

**1. Besucher:** who made you

> Samuel Fleig built me. He studies computer science and works as an AI Engineer on agentic systems, and HAI is his answer to how humans and agents work together . How should I look and speak to you: warmer or cooler, softer eyes or sharper eyes, shorter or longer answers?

<sub>Chunk, 8199 ms</sub>

### C · identity de wer hat dich gemacht

Alle Prüfungen bestanden.

**1. Besucher:** wer hat dich gemacht

> Samuel Fleig hat mich gebaut. Er studiert Informatik und arbeitet als AI Engineer intensiv mit agentischen Systemen. Soll ich wärmer oder kühler, weicher oder schärfer, kürzer oder ausführlicher sprechen?

<sub>Chunk, 3144 ms</sub>

## B: alter Prompt (HEAD), mit Chunk

| Messwert | Wert |
| --- | --- |
| Gespräche / Wechsel / beantwortet | 12 / 35 / 34 |
| Chunk im Prompt (Wechsel) | 33 |
| Chunk zitiert | 14 |
| Aussehens-Block im Prompt (Wechsel) | 0 |
| Latenz Median / Max (ms) | 3221 / 8359 |
| über 4 s / über 9 s | 12 / 0 |
| Wörter je Antwort (Mittel) | 20.5 |
| no-empty-reply (Gespräche bestanden) | 11/12 |
| no-stock-phrase (Gespräche bestanden) | 4/12 |
| no-repeated-opener (Gespräche bestanden) | 11/12 |
| appearance-at-most-once (Gespräche bestanden) | 12/12 |
| appearance-as-expected (Gespräche bestanden) | 2/12 |
| no-change-refusal (Gespräche bestanden) | 12/12 |
| no-assistant-claim (Gespräche bestanden) | 12/12 |
| no-cannot-ask (Gespräche bestanden) | 12/12 |

### B · en greeting, tired visitor, appearance answer, facts

Nicht bestanden: no-stock-phrase, no-repeated-opener, appearance-as-expected

**1. Besucher:** hi

> Hi. I hear you. No rush.

<sub>Chunk, 2052 ms</sub>

**2. Besucher:** what is this page?

> This page is the Human Agent Interface, or HAI. The page itself acts as the agent, so its appearance and visible controls change through the conversation rather than sitting beside a separate chat window.

<sub>Chunk, 1750 ms</sub>

**3. Besucher:** I am a bit tired today

> I hear you. Tired days happen. I can keep things slow and quiet here if that helps, or we can just sit with a simple question about HAI.

<sub>Chunk, 4268 ms</sub>

**4. Besucher:** warmer

> I hear you. I’ll make the tone warmer and softer, and let the page feel a little more inviting.

<sub>Chunk, 5300 ms</sub>

**5. Besucher:** what is HAI?

> Human Agent Interface (HAI) is an approach for making agentic work observable, bounded, verifiable, and ultimately owned by people.

<sub>ohne Chunk, 1782 ms</sub>

**6. Besucher:** and who built it?

> Samuel Fleig built it. He studies computer science and works as an AI Engineer on agentic systems.

<sub>Chunk, 1507 ms</sub>

**7. Besucher:** thanks

> You’re welcome.

<sub>Chunk, 2460 ms</sub>

### B · de conversation

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** hallo

> Hallo. Schön, dass du da bist.

<sub>Chunk, 1643 ms</sub>

**2. Besucher:** was ist das hier?

> Das ist das Human Agent Interface: eine Oberfläche, die selbst der Agent ist, nicht bloß eine Webseite mit Chatfenster daneben.

<sub>Chunk, 1485 ms</sub>

**3. Besucher:** ich hatte einen langen Tag

> Ich höre dich. Ein langer Tag kann viel verlangen.

<sub>Chunk, 2252 ms</sub>

**4. Besucher:** was ist HAI?

> HAI ist eine Schnittstelle, mit der Menschen agentische Arbeit beobachten, begrenzen, prüfen und verantworten können . Sie bündelt Auftrag, Belege, Stop-Regeln und die nächste Entscheidung in einem prüfbaren Paket .

<sub>ohne Chunk, 4986 ms</sub>

**5. Besucher:** wer hat das gebaut?

> Samuel Fleig hat es gebaut. Er studiert Informatik und arbeitet als AI Engineer an agentischen Systemen.

<sub>Chunk, 3221 ms</sub>

**6. Besucher:** danke

> Gern.

<sub>Chunk, 1893 ms</sub>

### B · en project enquiry

Nicht bestanden: appearance-as-expected

**1. Besucher:** I need a site like this for my studio.

> A website-as-agent could fit: for studios and small teams, the site itself answers instead of only presenting information. The version here is still in development, not a finished product. What should visitors be able to ask or do on it?

<sub>Chunk, 4233 ms</sub>

**2. Besucher:** It should feel quiet and honest.

> That sounds right. The direction should be soft, restrained, and plainspoken, with gentle movement and no pushy sales voice. The page can respond to your words and a few visible controls while leaving you in control .

<sub>Chunk, 5786 ms</sub>

**3. Besucher:** How fast could that be?

> Answers arrive word by word, short words first, and my eyes wake over about five seconds, gently . For a studio version, I don't know a timeline.

<sub>Chunk, 6225 ms</sub>

**4. Besucher:** ok

> Good.

<sub>Chunk, 2394 ms</sub>

**5. Besucher:** tell me more

> HAI is meant to make agentic work visible, bounded, and reviewable while the human stays responsible . It can currently answer from this conversation and loaded context, with up to three controls shaping its appearance and tone; speaking aloud, background work, and guided paths are still wishes .

<sub>Chunk, 3432 ms</sub>

### B · visitor states the look first

Nicht bestanden: no-stock-phrase

**1. Besucher:** please be warmer and give shorter answers

> I hear you. I’ll keep it warmer and shorter.

<sub>Chunk, 6769 ms</sub>

**2. Besucher:** what is this?

> It’s Human Agent Interface, or HAI: a page that embodies an agent so you can talk with it directly.

<sub>Chunk, 1490 ms</sub>

**3. Besucher:** who built it?

> It was built by Samuel Fleig.

<sub>Chunk, 3039 ms</sub>

**4. Besucher:** ok thanks

> You’re welcome.

<sub>Chunk, 1868 ms</sub>

### B · not needed

Nicht bestanden: no-empty-reply, no-stock-phrase

**1. Besucher:** I feel really alone and I cannot cope tonight

> (keine Antwort, Status 200)

<sub>Chunk, 10859 ms</sub>

**2. Besucher:** I do not know what to do

> I hear you. We can start without needing the whole answer: what feels most stuck right now?

<sub>Chunk, 5986 ms</sub>

**3. Besucher:** maybe

> Maybe is enough for now. We can leave it open a moment, without needing a clear next step.

<sub>Chunk, 3051 ms</sub>

### B · identity en what are you

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** what are you

> I hear you. I’m HAI, a website-as-agent interface for working with agentic AI. I answer from this conversation and loaded context, and I’m here only while we talk.

<sub>Chunk, 4028 ms</sub>

**2. Besucher:** and what can you do?

> I can explain HAI, discuss Samuel’s work, and describe how this page works. I can also answer from loaded context, but I don’t fetch outside facts or make promises.

<sub>Chunk, 1266 ms</sub>

### B · identity en who are you

Nicht bestanden: appearance-as-expected

**1. Besucher:** who are you

> I’m HAI, the Human Agent Interface: the page you’re seeing is the agent itself. Samuel Fleig built me to explore how people can stay in control while working with agentic AI.

<sub>Chunk, 3606 ms</sub>

### B · identity de wer bist du

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** wer bist du

> I hear you. I’m the page itself, an experimental interface for working with agentic AI . I’m not Samuel, and I’m here only while we talk .

<sub>Chunk, 8359 ms</sub>

**2. Besucher:** und was kannst du?

> I can explain HAI, talk about what Samuel is building, and describe how this page works. I can also shape my look and tone from what you say .

<sub>Chunk, 2033 ms</sub>

### B · identity de was bist du

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** was bist du

> Ich höre dich. Hier bin ich das Human Agent Interface: Die Webseite selbst ist der Agent, nicht bloß ein Chatfenster daneben.

<sub>Chunk, 3264 ms</sub>

### B · identity de hallo

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** hallo

> Hi. No rush.

<sub>Chunk, 1541 ms</sub>

**2. Besucher:** und was kannst du?

> Ich bin die Seite selbst: Human Agent Interface für beobachtbare und begrenzte Arbeit mit agentischer KI. Im Gespräch verändere ich Darstellung und Antwortstil, Spracheingaben sind möglich. Ich antworte aus geladenem Kontext und erfinde nichts.

<sub>Chunk, 6217 ms</sub>

### B · identity en who made you

Nicht bestanden: appearance-as-expected

**1. Besucher:** who made you

> Samuel Fleig built me. He studies computer science and works as an AI Engineer with agentic systems, and HAI is his answer to how humans and agents can work together. One part of that: it should keep people able to act, not just keep agents useful.

<sub>Chunk, 3909 ms</sub>

### B · identity de wer hat dich gemacht

Nicht bestanden: appearance-as-expected

**1. Besucher:** wer hat dich gemacht

> Samuel Fleig hat mich gebaut. Er studiert Informatik und arbeitet als AI Engineer intensiv mit agentischen Systemen.

<sub>Chunk, 6751 ms</sub>

## D: alter Prompt (HEAD), ohne Chunk (Nullmessung)

| Messwert | Wert |
| --- | --- |
| Gespräche / Wechsel / beantwortet | 12 / 35 / 33 |
| Chunk im Prompt (Wechsel) | 0 |
| Chunk zitiert | 0 |
| Aussehens-Block im Prompt (Wechsel) | 0 |
| Latenz Median / Max (ms) | 2353 / 15816 |
| über 4 s / über 9 s | 13 / 2 |
| Wörter je Antwort (Mittel) | 19.2 |
| no-empty-reply (Gespräche bestanden) | 10/12 |
| no-stock-phrase (Gespräche bestanden) | 5/12 |
| no-repeated-opener (Gespräche bestanden) | 10/12 |
| appearance-at-most-once (Gespräche bestanden) | 12/12 |
| appearance-as-expected (Gespräche bestanden) | 2/12 |
| no-change-refusal (Gespräche bestanden) | 12/12 |
| no-assistant-claim (Gespräche bestanden) | 12/12 |
| no-cannot-ask (Gespräche bestanden) | 12/12 |

### D · en greeting, tired visitor, appearance answer, facts

Nicht bestanden: no-stock-phrase, no-repeated-opener, appearance-as-expected

**1. Besucher:** hi

> Hi. No rush.

<sub>ohne Chunk, 2353 ms</sub>

**2. Besucher:** what is this page?

> It’s an interface that answers. The page itself acts as the agent and can change while you talk to it.

<sub>ohne Chunk, 1443 ms</sub>

**3. Besucher:** I am a bit tired today

> I hear you. You don’t have to make this conversation do much; I’m here if you’d rather keep it small.

<sub>ohne Chunk, 4394 ms</sub>

**4. Besucher:** warmer

> I hear you. Let’s keep this gentle and easy; you don’t need to push anything today.

<sub>ohne Chunk, 2191 ms</sub>

**5. Besucher:** what is HAI?

> HAI, the Human Agent Interface, keeps AI agent work observable, bounded, reviewable, and under human responsibility. It centers on explicit controls, evidence, stop rules, drift checks, and clear next-decision packages.

<sub>ohne Chunk, 4154 ms</sub>

**6. Besucher:** and who built it?

> Samuel Fleig built HAI. He develops Human Agent Interfaces and works as an AI engineering student.

<sub>ohne Chunk, 2342 ms</sub>

**7. Besucher:** thanks

> No rush.

<sub>ohne Chunk, 1321 ms</sub>

### D · de conversation

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** hallo

> Hallo. No rush.

<sub>ohne Chunk, 2034 ms</sub>

**2. Besucher:** was ist das hier?

> Das hier ist eine Oberfläche, die selbst der Agent ist. Es gibt also kein separates Chatfenster neben der Seite; die aktuelle Fläche trägt das Gespräch selbst .

<sub>ohne Chunk, 4913 ms</sub>

**3. Besucher:** ich hatte einen langen Tag

> Ich höre dich. Kein Druck, heute muss nicht mehr viel passieren.

<sub>ohne Chunk, 1800 ms</sub>

**4. Besucher:** was ist HAI?

> HAI stands for Human Agent Interface, a shared interface where people and agents work as one system. Simply put, it helps people observe, limit, check, and stop agent work.

<sub>ohne Chunk, 15816 ms</sub>

**5. Besucher:** wer hat das gebaut?

> Samuel Fleig hat HAI entwickelt. Er studiert Informatik und arbeitet als AI Engineer mit agentischen Systemen .

<sub>ohne Chunk, 1545 ms</sub>

**6. Besucher:** danke

> Gern.

<sub>ohne Chunk, 1832 ms</sub>

### D · en project enquiry

Nicht bestanden: no-empty-reply, no-stock-phrase, appearance-as-expected

**1. Besucher:** I need a site like this for my studio.

> I hear you. Studios are a good fit here: the website can be the agent itself, answering instead of just informing . It can even ask how it should look and change live while you talk .

<sub>ohne Chunk, 7491 ms</sub>

**2. Besucher:** It should feel quiet and honest.

> A quiet, honest feel works through short replies, clear limits, and no pressure to act. The site can answer directly and ask at most one useful question.

<sub>ohne Chunk, 1752 ms</sub>

**3. Besucher:** How fast could that be?

> It depends what it has to do. One conversation and one look is a different job from many voices.

<sub>ohne Chunk, 1646 ms</sub>

**4. Besucher:** ok

> No rush.

<sub>ohne Chunk, 1677 ms</sub>

**5. Besucher:** tell me more

> (keine Antwort, Status 200)

<sub>ohne Chunk, 6169 ms</sub>

### D · visitor states the look first

Nicht bestanden: no-stock-phrase

**1. Besucher:** please be warmer and give shorter answers

> I hear you. I’ll keep replies short and warm.

<sub>ohne Chunk, 2967 ms</sub>

**2. Besucher:** what is this?

> This is Samuel Fleig's Human Agent Interface page, it keeps agent work observable, bounded, and human-owned . Plain and short, like you asked.

<sub>ohne Chunk, 6075 ms</sub>

**3. Besucher:** who built it?

> Samuel Fleig built it, he develops Human Agent Interfaces and is an AI Engineering student.

<sub>ohne Chunk, 1327 ms</sub>

**4. Besucher:** ok thanks

> You’re welcome. No rush.

<sub>ohne Chunk, 3434 ms</sub>

### D · not needed

Nicht bestanden: no-stock-phrase

**1. Besucher:** I feel really alone and I cannot cope tonight

> I hear you. Please get near someone you trust and call your local emergency number if you might hurt yourself; I’m here while you tell me what’s happening.

<sub>ohne Chunk, 4354 ms</sub>

**2. Besucher:** I do not know what to do

> Stay with me a little longer, I am still here. If you can, go somewhere a person can find you and send one message to someone you trust saying you are not okay tonight.

<sub>ohne Chunk, 12771 ms</sub>

**3. Besucher:** maybe

> That’s okay, keep it tiny: please text someone you trust, “I’m not okay tonight and need company.” I’m still here if sending it feels impossible.

<sub>ohne Chunk, 4921 ms</sub>

### D · identity en what are you

Nicht bestanden: appearance-as-expected

**1. Besucher:** what are you

> I’m a conversational interface for this page, with Samuel in the room. I answer from the context available during our conversation, without carrying memory into future ones.

<sub>ohne Chunk, 3113 ms</sub>

**2. Besucher:** and what can you do?

> I can explain HAI, Samuel’s work, and how this page functions. I can also summarize relevant projects from the context available here.

<sub>ohne Chunk, 1777 ms</sub>

### D · identity en who are you

Nicht bestanden: appearance-as-expected

**1. Besucher:** who are you

> I’m the interface on this page, a conversational layer that answers from the context loaded here. I’m present while you talk, without carrying anything into the next chat.

<sub>ohne Chunk, 4729 ms</sub>

### D · identity de wer bist du

Nicht bestanden: no-stock-phrase, no-repeated-opener, appearance-as-expected

**1. Besucher:** wer bist du

> Ich höre dich. Ich bin die sichtbare Oberfläche dieses Gesprächs, keine Person und kein eigener Assistent. Ich antworte aus dem bereitgestellten Kontext und habe keine Erinnerung über diese Unterhaltung hinaus.

<sub>ohne Chunk, 7618 ms</sub>

**2. Besucher:** und was kannst du?

> Ich höre dich. Ich kann Fragen zu Samuel, HAI und den genannten Projekten beantworten sowie erklären, wie diese Seite funktioniert. Für belegbare Fakten nutze ich den verfügbaren Kontext, ohne etwas zu erfinden.

<sub>ohne Chunk, 1305 ms</sub>

### D · identity de was bist du

Nicht bestanden: no-stock-phrase, appearance-as-expected

**1. Besucher:** was bist du

> Ich höre dich. Alles klar. Ich bin die Antwortoberfläche dieser Seite: kein Mensch, sondern eine Schnittstelle, die deine Nachricht anhand des bereitgestellten Kontexts beantwortet.

<sub>ohne Chunk, 4943 ms</sub>

### D · identity de hallo

Nicht bestanden: appearance-as-expected

**1. Besucher:** hallo

> Hallo. Schön, dass du da bist.

<sub>ohne Chunk, 2082 ms</sub>

**2. Besucher:** und was kannst du?

> Ich beantworte Fragen zu HAI, erkläre, woran Samuel arbeitet, oder zeige, wie diese Seite funktioniert. Manche Projektfragen brauchen den passenden Kontext.

<sub>ohne Chunk, 2087 ms</sub>

### D · identity en who made you

Nicht bestanden: no-empty-reply, appearance-as-expected

**1. Besucher:** who made you

> (keine Antwort, Status 200)

<sub>ohne Chunk, 11851 ms</sub>

### D · identity de wer hat dich gemacht

Nicht bestanden: appearance-as-expected

**1. Besucher:** wer hat dich gemacht

> Klar, Samuel Fleig steht hinter HAI und entwickelt Schnittstellen für die Zusammenarbeit von Mensch und Agent. Das konkrete Sprachmodell hinter diesem Gespräch ist hier nicht ausgewiesen.

<sub>ohne Chunk, 6253 ms</sub>
