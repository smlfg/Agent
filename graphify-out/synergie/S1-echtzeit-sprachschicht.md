# S1 — Echtzeit-Sprachschicht

Synergie-Kandidat geprüft: „Latenz, Sprachpipeline und Typewriter-Effekt sind EIN Constraint".

Stand: 19.11.2026. Graph-Daten aus `graphify-out/graph.json`. Alle Zeilenangaben
gegen den Arbeitsstand am Ende dieses Laufs (nicht gegen `HEAD`).

**Wichtig für die Lesart:** Während dieses Laufs hat eine parallele Session
`docs/PROJECT.md` und `docs/DESIGN-DECISIONS.md` auf den Stand 19.11.2026
gebracht (Produktklärungen mit Samuel). Zwei vorher offene Punkte sind dadurch
entschieden — der Anker ist dadurch nicht kleiner, sondern
verbindlicher. Wo eine Entscheidung vom 19.11. eine ältere Aussage überholt, steht
das ausdrücklich dabei.

Abgrenzung: Zustands-Synchronisation als Transportmechanismus ist Gegenstand von
`S4-zustand-streaming.md`. Überschneidung nur an einer Stelle — dem Statusfeld
`thinking | speaking`, das der Typewriter braucht (siehe K4).

---

## Liste geprüft

Alle sechs genannten Stellen existieren. Die genannten Knoten sind im Graph
vorhanden: `agents_sdk_voice`, `workers_ai_models_stt`, `workers_ai_models_tts`,
`latency_budget_800ms`, `deepgram`, `elevenlabs`, `twilio`, `plivo`, `telnyx`,
`livekit_agents`, `tech_cloudflare_machbarkeit_latenz_budget`,
`tech_cloudflare_machbarkeit_websocket`, `typewriter`, `voice_pipeline`
sowie die Hyperedge `latency_sync_gap` mit genau den drei Knoten
`Typewriter Feature`, `Voice Pipeline Feature`, `Abgleich Document`.

Die Liste ist **unvollständig**, und zwar an den Stellen, wo der Konflikt
tatsächlich entsteht:

| Fehlt in der Kandidatenliste | Warum es dazugehört |
|---|---|
| `docs/PROJECT.md:20` | Die eigentliche Produktvorgabe („unter einer Sekunde, möglichst einschließlich TTS, als Wunschziel"). Ohne sie ist unklar, wogegen die 800 ms gemessen werden. |
| `docs/DESIGN-DECISIONS.md:14,17-18` (und `:20-24,36-43`) | Definiert „Typewriter" und „Wortrhythmus" überhaupt erst — die einzige Quelle des Begriffs. Kein Graph-Knoten. Seit 19.11. kommen dort die Entscheidungen, die den Messlauf zum Pflicht-Gate machen. |
| `sketches/2026-11-12-agentfaehig.md:118-119` | „no latency!" / „under 1 sec even with TTS if possible". Die Zeile existiert, hat aber keinen Knoten; im Graph taucht die Skizze nur über Agenten, Slider und Pathways auf. |
| `tech/LUECKEN.md:120-122,161-165` | Hat den 800-vs-890-Widerspruch und die Typewriter-Fehlerfrage bereits notiert. Die Teile sind also bekannt — nur nicht als ein Constraint. |
| `research/SCOUT-SYNTHESIS.md:33-55` | Der Wortrhythmus ist dort ausdrücklich Hypothese ohne UI-Nachweis. Das begrenzt, wie hart man ihn vertraglich festschreiben darf. |

Der Kandidat ist damit nicht falsch, sondern zu schmal: er verbindet die
Recherche-Dokumente und lässt die Produktdokumente weg, in denen die abweichenden
Definitionen stehen.

---

## Der Anker

Der Anker ist **ein Ausgabestrom mit einer Uhr**, kein Latenzwert. Vertragsförmig:
Der Modell-Output wird an **genau einer Stelle** — im Durable Object, nicht im
Browser — in Segmente geschnitten; jedes Segment trägt Typ (`wort` | `satz`),
Index und Startzeit in Millisekunden seit Turn-Start auf einer monotonen Uhr.
Drei Verbraucher lesen dieselbe Liste: der TTS-Synthesizer die Satzsegmente, der
Typewriter die Wortsegmente, die Messung die Zeitpunkte t3 (erstes Token),
t4 (erster sichtbarer Buchstabe) und t5 (erstes hörbares Byte). Damit ist der
Typewriter kein UI-Effekt, sondern ein **Play-out-Puffer mit Vorlaufzeit
`D_display`**, und `D_display` ist ein Posten im selben Budget wie STT und TTS.
Der eine Wert, der heute nirgends steht und überall gebraucht wird, ist die
Kopplung: ob der sichtbare Cursor der Audio-Uhr folgt, ihr vorausläuft oder
unabhängig läuft — ausgedrückt als Offset in Millisekunden.

Heute ist dieselbe Sache an vier Stellen verschieden definiert:

- Cloudflare schneidet **Sätze**: „LLM tokens are sentence-chunked and synthesized concurrently" (`tech/research/cloudflare-bausteine.md:95-97`).
- Der Abgleich lässt den **Browser Wörter** puffern und selbst takten (`tech/ABGLEICH.md:31-32`).
- Das Intent-Budget zählt **nur Transport + STT + LLM + TTS**, ohne Typewriter-Puffer (`tech/INTENT.md:20`).
- Die Machbarkeit misst `first_audio_ms` und **keinen sichtbaren Buchstaben** (`tech/CLOUDFLARE_MACHBARKEIT.md:74,104-107`).

Damit fehlt jeder der drei Stellen genau dasselbe: ein gemeinsamer Nullpunkt und
eine gemeinsame Segmentgrenze.

---

## Belege

| Stelle | Datei:Zeile | was dort steht |
|---|---|---|
| Produktvorgabe | `docs/PROJECT.md:20` | „Reaktion unter einer Sekunde, möglichst einschließlich TTS, als Wunschziel." Weich, ohne Messpunkt; steht bis heute unter „Vorschläge aus der Skizze, noch keine Architekturentscheidungen" (`:17`). |
| Erstbau (19.11.) | `docs/PROJECT.md:32-36` | Erster Ablauf ist **text-first**: Textnachricht, Typewriter-Antwort im Fokus — und „Voice ist damit Teil des Erstbaus". Beide Ausgabewege sind also im ersten Bau. |
| Gate (19.11.) | `docs/PROJECT.md:41-43` | Messlauf als Gate vor dem Erstbau, 20 deutsche Sprach-Wechsel, Auswertung `first_audio_ms`. |
| Gate-Detail (19.11.) | `docs/DESIGN-DECISIONS.md:24,36-43` | Gate ist durch Voice im Erstbau „vom Empfehlungs- zum Pflichtpunkt" geworden; genannt werden 890-ms-Budget, +500 ms Stille, Beta, 20 req/min. |
| Kriterien-Politik (19.11.) | `docs/DESIGN-DECISIONS.md:67-68` | „Abnahmekriterien im Detail; Latenz-Kriterien aus den Messwerten ableiten, nicht vorab erfinden." |
| Skizze | `sketches/2026-11-12-agentfaehig.md:118-119` | „no latency!" / „under 1 sec even with TTS **if possible**". |
| Skizze Eingänge | `sketches/2026-11-12-agentfaehig.md:25` | `voice`, `text`, `picture` gleichrangig, kein Pfad ist der Hauptpfad. |
| Intent T2 | `tech/INTENT.md:20` | Budget = „Transport + STT + LLM (erstes Token) + TTS (erstes Audio). Wo geht die Zeit hin?" |
| Konvergenzpunkt | `tech/INTENT.md:52-54` | `CLOUDFLARE_MACHBARKEIT.md` ist der Ort, an dem „Latenzbudget" zusammenlaufen soll. |
| Machbarkeit, Urteil | `tech/CLOUDFLARE_MACHBARKEIT.md:9-10` | „Cloudflares eigene Zahlen liegen bei 800 bis 950 ms und damit an der Grenze; ob das hält, lässt sich nur messen." |
| Machbarkeit, T2 | `tech/CLOUDFLARE_MACHBARKEIT.md:58` | Satzweises Vorlesen; Urteil **unklar**; „Keine echte Messung vorhanden." |
| 800-ms-Regel | `tech/CLOUDFLARE_MACHBARKEIT.md:73` | „under 800 milliseconds", Budget 40 ms Mic / 300 ms STT / 400 ms LLM / 150 ms TTS. |
| Doku-Beispiel | `tech/CLOUDFLARE_MACHBARKEIT.md:74` | `llm_ms: 850`, `tts_ms: 200`, `first_audio_ms: 950`, `total_ms: 1200`; „sagt nicht, ob das gemessen oder nur ein Beispiel ist". |
| Rechenfehler | `tech/CLOUDFLARE_MACHBARKEIT.md:80` | „40 + 300 + 400 + 150 sind 890 ms, nicht unter 800." |
| Stille-Erkennung | `tech/CLOUDFLARE_MACHBARKEIT.md:82` | Client wartet zusätzlich 500 ms `silenceDurationMs`; Verrechnung mit `flux`-Turn-Detection undokumentiert. |
| Transport | `tech/CLOUDFLARE_MACHBARKEIT.md:75-76` | WebRTC sei „the better choice"; das SDK nutzt trotzdem WebSocket. |
| Messplan | `tech/CLOUDFLARE_MACHBARKEIT.md:102-108` | 20 deutsche Turns, `examples/voice-agent`, `first_audio_ms` je Turn. Braucht Klon und Freigabe. |
| Text zuerst | `tech/ABGLEICH.md:28` | „Text ist der Grundweg, Stimme die Zugabe." Für Text sei „unter 1 s" unkritisch — „entschärft T2". |
| Typewriter puffert | `tech/ABGLEICH.md:31-32` | Browser muss puffern und selbst takten; „setzt voraus, dass ganze Wörter vorliegen […] Kostet pro Wort eine kleine Verzögerung." |
| Pausen | `tech/ABGLEICH.md:41` | „Der Sprach-Client meldet die Zustände ‚denkt' und ‚spricht'; für reinen Text müsste das Frontend Pausen selbst erkennen." |
| Einzige Metrik | `tech/ABGLEICH.md:44` | „Der Sprach-Client liefert je Wechsel Messwerte (`first_audio_ms` und weitere)." Kein Kriterium, nur Quelle. |
| Sync-Lücke | `tech/ABGLEICH.md:46-54` | Stimme liest satzweise, Typewriter pulsiert nach Wortlänge; drei Wege (Text führt / Stimme führt / unabhängig); „Ob die Pipeline Zeitmarken je Wort liefert, steht in keiner geprüften Quelle." |
| Typewriter-Begriff | `docs/DESIGN-DECISIONS.md:17-18` | „lebendig und pulsierend", „Kurze Wörter schnell; bei längeren Wörtern auch langsameres Zeichentempo." Rein visuell definiert. |
| Ohne Ton | `docs/DESIGN-DECISIONS.md:14` | Antwort auch als Text; visuelle Reaktion signalisiert die Antwort. |
| Abnahme offen | `docs/DESIGN-DECISIONS.md:67-68`; `docs/PROJECT.md:41-43` | Kriterien werden aus Messwerten abgeleitet, nicht vorab gesetzt; das Gate selbst ist festgelegt, der Schwellwert nicht. |
| Satz-Chunking | `tech/research/cloudflare-bausteine.md:95-97` | „LLM tokens are sentence-chunked and synthesized concurrently" — erstes Audio wartet nicht auf den ganzen Text, aber auf den ersten Satz. |
| Cloudflare-Metriken | `tech/research/cloudflare-bausteine.md:323-329` | `llm_ms`, `tts_ms`, `first_audio_ms`, `total_ms` plus Stage-Timings; Outcomes `completed`, `no_output`, `aborted`. |
| WebSocket-Boden | `tech/research/cloudflare-bausteine.md:318-322` | „each chunk contains 100–500 milliseconds of audio. That chunking size […] becomes the latency floor." |
| Beta-Stand | `tech/CLOUDFLARE_MACHBARKEIT.md:55,96`; `tech/LUECKEN.md:115-119` | Voice ist Beta; Paketnamen in drei Ständen (`@cloudflare/voice` abgekündigt, `agents/voice`, `packages/voice`). |
| Konkurrenz LiveKit | `tech/research/konkurrenz.md:27` | WebRTC Frontend↔Agent, eigenes Turn-Detection-Modell, **keine Latenzzahl belegt**. |
| Konkurrenz Pipecat | `tech/research/konkurrenz.md:28` | 500–800 ms Round-Trip, „in most cases", ohne Messaufbau. |
| Andere Messuhr | `tech/research/konkurrenz.md:65` | 800-ms-Ziel = „vom Ende der Nutzerstimme bis zum Beginn der Agentenstimme" — nicht ab Mikrofon. |
| VAD-Standard | `tech/research/konkurrenz.md:66` | `silence_duration_ms` 500 ms vor Inferenzbeginn. |
| Moshi / Hume | `tech/research/konkurrenz.md:31-32` | 200 ms Ende-zu-Ende bzw. ~300 ms Zielvorgabe, beide andere Bauweise. |
| bereits notiert | `tech/LUECKEN.md:120-122` | 800 ms vs. 890 ms als offener Widerspruch vermerkt. |
| bereits notiert | `tech/LUECKEN.md:161-165` | Fehlerverhalten Typewriter (Puffer leer, Pausen) als offen vermerkt. |
| Rhythmus-Hypothese | `research/SCOUT-SYNTHESIS.md:33-55` | Kein direkter Versuch zum Typewriter-Effekt; „bleibt eine Gestaltungshypothese". |

---

## Konflikte

**K1 — Vier Zielzahlen, aber keine gemeinsamen Messpunkte.**
Skizze: „under 1 sec … if possible" (`sketches:119`). Produkt: „unter einer
Sekunde, möglichst einschließlich TTS" (`docs/PROJECT.md:20`). Cloudflare-Regel:
„under 800 milliseconds" (`tech/CLOUDFLARE_MACHBARKEIT.md:73`). Doku-Beispiel:
`first_audio_ms: 950`, `total_ms: 1200` (`:74`). Zusätzlich geht Cloudflares
eigenes Budget nicht auf: 890 ms statt 800 (`:80`). Der Owner will den Schwellwert
ausdrücklich erst aus Messwerten ableiten (`docs/DESIGN-DECISIONS.md:67-68`) —
der Schwellwert ist also bewusst offen. Offen ist aber auch der **Bezugspunkt**,
und das ist keine Absicht, sondern ein Versäumnis.
*Entscheidungsbedarf:* nicht „welche Zahl", sondern: von wo bis wo wird gemessen
(siehe K2), und wird der Wert p95 über 20 Turns oder als Einzelmessung
ausgewertet? Ohne das ist „800 bis 950 ms" (`:9-10`) keine Spanne, sondern eine
Reihe nicht vergleichbarer Zahlen.

**K2 — Drei Nullpunkte, also nicht vergleichbare Zahlen.**
Intent misst ab Mikrofon-Frame (`tech/INTENT.md:20`). Die Konkurrenz-Messung
misst ab Ende der Nutzerstimme (`tech/research/konkurrenz.md:65`). Cloudflares
Client misst zusätzlich 500 ms Stille ab (`tech/CLOUDFLARE_MACHBARKEIT.md:82`)
und der WebSocket-Chunk legt 100–500 ms Boden darunter
(`tech/research/cloudflare-bausteine.md:318-322`). 800 ms ab Mikrofon und 800 ms
ab Sprachrende sind je nach Sprechdauer 0,5–2 s auseinander. `first_audio_ms`
allein sagt nicht, welcher der beiden Nullpunkte gilt.
*Entscheidungsbedarf:* t0 festlegen (Mic-Frame oder Sprachende) und in jedem
Dokument dieselbe Definition verlangen — vor dem Messlauf, nicht danach.

**K3 — Der Pflicht-Messlauf misst nur den Sprachpfad, der Erstablauf ist text-first.**
Seit 19.11. gilt: erster Ablauf text-first mit Typewriter (`docs/PROJECT.md:32-34`),
Voice ist trotzdem Teil des Erstbaus (`:35-36`), und der Messlauf ist Gate
(`:41-43`, `docs/DESIGN-DECISIONS.md:24`). Das Gate erfasst aber nur
`first_audio_ms` und Stage-Timings (`docs/DESIGN-DECISIONS.md:24,67`). Damit
prüft das eine Pflicht-Gate den **zweiten** Ausgabeweg, während der erste
(Typewriter) ungemessen bleibt. Vorher stand hier ein Widerspruch zwischen
`tech/ABGLEICH.md:28` („entschärft T2") und
`tech/CLOUDFLARE_MACHBARKEIT.md:58` (T2 „unklar") — der ist durch die
Owner-Entscheidung zugunsten von Voice im Erstbau aufgelöst; die Messlücke ist
dadurch aber größer, nicht kleiner.
*Entscheidungsbedarf:* Bekommt der Messlauf einen zweiten Endpunkt (erster
sichtbarer Buchstabe), oder wird das Gate bewusst nur für Sprache abgenommen und
der Textpfad separat geprüft?

**K4 — „Typewriter" ist zwei Features unter einem Wort.**
`docs/DESIGN-DECISIONS.md:17-18` definiert ihn rein visuell (Zeichentempo nach
Wortlänge). `tech/ABGLEICH.md:46-54` behandelt ihn als etwas, das mit der
*Sprachausgabe* synchron laufen muss. Das ist nur dann dasselbe, wenn der
Textcursor der sichtbare Zwilling des Audio-Cursors ist. Ist er das nicht, ist
die Sync-Frage gegenstandslos — und umgekehrt wird aus einem Animationseffekt
ein Ausgabevertrag.
*Entscheidungsbedarf:* Ist Typewriter (a) Anzeige-Politik über einem Strom mit
einer Uhr, oder (b) eine eigenständige Animation mit eigener Uhr? Dazu gehört
das Statusfeld: `thinking | speaking` (`tech/ABGLEICH.md:41`) ist heute die
einzige Quelle, aus der „Pause" von „fertig" unterschieden werden kann — und für
reinen Text existiert sie nicht.

**K5 — Satz gegen Wort: niemand legt fest, wer schneidet.**
TTS schneidet Sätze (`tech/research/cloudflare-bausteine.md:95-97`), der
Typewriter braucht Wörter (`tech/ABGLEICH.md:31-32`), und Wort-Zeitmarken sind
in keiner geprüften Quelle belegt (`tech/ABGLEICH.md:53-54`). Zwei Segmentierer
ohne gemeinsame Zeitbasis sind genau der Zustand, den `ABGLEICH:48-51`
beschreibt.
*Entscheidungsbedarf:* Segmentierung serverseitig (DO schneidet Wörter *und*
Sätze, Client rendert nur) oder clientseitig (dann muss die Wortzeit aus
Zeichenzahl und Rate geschätzt werden, mit sichtbarem Fehler bei Sprechpausen)?

**K6 — Der Transport bestimmt den Takt, wird aber nach dem Typewriter entschieden.**
WebSocket-Chunks von 100–500 ms sind laut Cloudflare der Latenz-Boden
(`tech/research/cloudflare-bausteine.md:318-322`); WebRTC wird für Echtzeit
empfohlen, das SDK nutzt WebSocket (`tech/CLOUDFLARE_MACHBARKEIT.md:75-76`).
Der Typewriter-Takt hängt an derselben Zustellung: bei 300-ms-Chunks kann der
Puffer in Stufen leeren, nicht gleichmäßig. Wer den Typewriter zuerst auf
WebSocket-Timing baut, baut ihn auf einen Jitter, der sich mit WebRTC ändert.
*Entscheidungsbedarf:* Transport vor Typewriter-Timing festlegen — oder den
Typewriter explizit jitter-unabhängig definieren (Puffer + lokale Uhr).

**K7 — Der Vertrag würde auf ein Beta-Interface gebaut.**
Voice ist Beta, das Paket wurde schon einmal umbenannt
(`tech/CLOUDFLARE_MACHBARKEIT.md:55,96`; `tech/LUECKEN.md:115-119`). Ein Vertrag,
der auf SDK-interne Events zugreift, bricht bei jedem Minor.
*Entscheidungsbedarf:* Der Anker muss eine eigene, kleine Schnittstelle sein
(Segmentliste + Status + zwei Zeitstempel), nicht `agents/voice`-Interna.

**K8 — „Kein Widerspruch gefunden" gilt nur für die acht Entscheidungen.**
`tech/ABGLEICH.md:60` sagt das ausdrücklich im Abschnitt „Wo Scout-Synthese und
Machbarkeit sich ergänzen". Für das Budget stimmt es nicht
(`tech/LUECKEN.md:120-122`). Wer den Satz wörtlich nimmt, hört mit der Prüfung
zu früh auf.

---

## Kosten des Verpassens

Schätzung, keine Messung: es gibt keinen Code (`docs/PROJECT.md:58-59`), also sind
das Erfahrungswerte für eine Person, ohne Messlauf und ohne Design-Iteration.

**S1 — Typewriter auf Roh-Token gebaut, Stimme kommt später.**
Der naheliegende erste Bau rendert Token-Deltas mit einem festen Zeichentimer.
Sobald die Sprachpipeline dazukommt, liefert sie satzweise Chunks
(`tech/research/cloudflare-bausteine.md:95-97`): der Text erscheint dann in
Satzschüben statt Wort für Wort, und der in `docs/DESIGN-DECISIONS.md:18`
gewünschte Wortrhythmus ist nicht mehr baubar, ohne den Renderer zu ersetzen.
Umbau: Wortpuffer, eigener Scheduler, Drift-Kontrolle, UI-Tests neu schreiben —
**2–4 Tage**, plus eine verworfene Animationsabstimmung, die Samuel erneut
abnehmen muss.

**S2 — Gate wird grün, misst aber den falschen Ausgabeweg.**
Der Messlauf (`tech/CLOUDFLARE_MACHBARKEIT.md:104-107`) liefert `first_audio_ms`
und Stage-Timings, sonst nichts; er ist seit 19.11. Pflicht-Gate vor dem Erstbau
(`docs/DESIGN-DECISIONS.md:24`, `docs/PROJECT.md:41-43`). Ergebnis „780 ms" ist
grün, während der erste sichtbare Buchstabe durch Wortpufferung
(`tech/ABGLEICH.md:32`) plus 500 ms Stille (`tech/CLOUDFLARE_MACHBARKEIT.md:82`)
erst bei 1,3–1,7 s erscheint. Das Gate autorisiert dann einen Erstbau, dessen
Hauptweg (Typewriter, text-first, `docs/PROJECT.md:32-34`) nie gemessen wurde.
Nachrüstung: zweiter Client-Zeitstempel, zweite Messreihe, neue
Animations-Timeline — **1–3 Tage**; teurer ist, dass eine grüne Ampel eine
offene Frage als beantwortet aussehen lässt.

**S3 — Zwei Segmentierer ohne gemeinsame Zeitbasis.**
Server schneidet Sätze, Browser schneidet Wörter, beide mit eigener Uhr. Die
Synchronisation braucht Wort-Zeitmarken, die laut `tech/ABGLEICH.md:53-54` in
keiner geprüften Quelle stehen. Nachträglich muss ein Segmentprotokoll in den
DO, in den Client und in die gespeicherten Teilnachrichten; die 20-Turn-Messung
wird ungültig und muss wiederholt werden — **3–5 Tage** und eine
Protokollversion, die niemand geplant hat.

Nicht eingerechnet, aber derselbe Fehler in klein: ein späterer Wechsel
WebSocket → WebRTC (`tech/CLOUDFLARE_MACHBARKEIT.md:75,90-92`) ändert
Jitter-Puffer und Takt; ein Typewriter, der auf 300-ms-Chunks getunt ist, muss
neu getunt werden.

---

## Verankerung

**Datei:** `tech/CLOUDFLARE_MACHBARKEIT.md`, neuer Abschnitt direkt nach dem
Latenz-Abschnitt (nach Zeile 92, vor `## Risiken`), Überschrift
`## Ausgabestrom: Segment- und Uhrenvertrag`. Der Ort ist richtig, weil
`tech/INTENT.md:52-54` dieses Dokument als den Punkt benennt, an dem das
Latenzbudget zusammenläuft, und weil dort schon die einzige offene Frage steht.
Der Abschnitt bleibt als Zuarbeit markiert wie `:12-13`.

Fünf Sätze, die dort stehen sollten:

1. „Der Modell-Output wird an genau einer Stelle, im Durable Object, in Segmente mit Typ (`wort`/`satz`), Index und Startzeit seit Turn-Start geschnitten; der Browser segmentiert nicht."
2. „Typewriter und TTS sind zwei Verbraucher derselben Segmentliste; der Typewriter ist ein Play-out-Puffer, dessen Vorlauf `D_display` als eigener Posten im Latenzbudget steht."
3. „Gemessen wird ab t0 = erstes Mikrofon-Frame bis t5 = erstes hörbares Byte und bis t4 = erster sichtbarer Buchstabe; `first_audio_ms` allein ist kein Abnahmekriterium."
4. „Ob der sichtbare Cursor der Audio-Uhr folgt, vorausläuft oder unabhängig läuft, wird vor dem ersten Bau als Offset in Millisekunden entschieden und nicht nachträglich kalibriert."
5. „Der Vertrag hängt an einer eigenen kleinen Schnittstelle (Segmente, Status, zwei Zeitstempel), nicht an Beta-Interna von `agents/voice`."

**Wer darauf verweisen muss:**

- `tech/ABGLEICH.md:31-32,41,46-54` — die Typewriter-Zeilen und die Sync-Frage. Danach ist „wer führt?" keine offene Designfrage mehr, sondern ein Offset.
- `docs/DESIGN-DECISIONS.md:17-18,63-64,67-68` — Samuel: Definition von „Typewriter", die offene Regel für den leerlaufenden Puffer und die Kriterien-Politik („aus den Messwerten ableiten"). Nur er kann entscheiden, ob der Cursor an der Stimme hängt.
- `tech/LUECKEN.md:14,29,120-122,161-165` — Lücke 3 (Abnahmekriterium), Lücke 7 (Typewriter × Stimme), Latenz-Widerspruch, Fehlerverhalten.
- `docs/PROJECT.md:32-36,41-43` — der text-first Erstbau mit Voice als Teil davon und das Messlauf-Gate bekommen hier ihre Messdefinition. Die alte Frage „Wie werden Reaktionszeit … geprüft?" (`:34` in der Fassung vom 12.11.) ist damit beantwortet, aber nur halb instrumentiert.
- Der Messplan `tech/CLOUDFLARE_MACHBARKEIT.md:102-108` — er muss t4 zusätzlich zu `first_audio_ms` erfassen, sonst misst er die Hälfte.

Nicht hier verankern: die Zustands-Synchronisation als Transport (S4) und die
Frage, ob späte Hintergrund-Ergebnisse gesprochen werden dürfen
(`tech/CLOUDFLARE_MACHBARKEIT.md:60,99`). Das ist ein eigener Constraint.

---

## Urteil

**ECHTE SYNERGIE.** Latenz, Sprachpipeline und Typewriter sind derselbe
Constraint, weil der Typewriter kein Nachbearbeitungseffekt ist, sondern der
Play-out-Puffer des einen Modellstroms — seine Wortpufferung kostet Verzögerung
im Budget, und das satzweieise Chunking, das TTS schnell macht, ist genau das,
was ihn unregelmäßig macht; ohne gemeinsame Segmentgrenze und gemeinsamen
Nullpunkt sind „800 ms", „unter 1 s" und „Wortrhythmus" nicht drei Themen,
sondern drei nicht vergleichbare Zahlen.

---

## Ein nächster Schritt

Schreibe den Abschnitt `## Ausgabestrom: Segment- und Uhrenvertrag` mit den
fünf Sätzen aus „Verankerung" in `tech/CLOUDFLARE_MACHBARKEIT.md` nach Zeile 92.
Satz 3 legt dabei **nur die Messpunkte und das Instrument** fest, nicht den
Schwellwert — Schwellwerte erst aus den Messwerten ableiten, so verlangt es
`docs/DESIGN-DECISIONS.md:67-68`:

> **Messpunkte: t0 = erstes Mikrofon-Frame, t3 = erstes Token, t4 = erster
> sichtbarer Buchstabe, t5 = erstes hörbares Byte. Instrument: `first_audio_ms`
> und Stage-Timings aus dem VoiceClient (`tech/research/cloudflare-bausteine.md:323-329`)
> plus ein neuer Client-Zeitstempel für t4. Ausgewertet über 20 deutsche Turns
> mit `examples/voice-agent`; die Sekunde aus `docs/PROJECT.md:20` ist Wunsch,
> kein Gate, bis die Messung einen Wert stützt.**

Überprüfbar daran: `rg -n "Uhrenvertrag|t4" tech/CLOUDFLARE_MACHBARKEIT.md`
findet den Abschnitt; `tech/ABGLEICH.md:44` verweist danach auf Messpunkte statt
nur auf `first_audio_ms`; und kein Dokument nennt mehr „unter 1 s" ohne
Bezugspunkt (heute: `docs/PROJECT.md:20`, `sketches:119`, `tech/INTENT.md:20`,
`tech/ABGLEICH.md:28`).

Der Messlauf selbst bleibt der Schritt danach — er braucht Klon und Freigabe
(`tech/CLOUDFLARE_MACHBARKEIT.md:108`, `docs/PROJECT.md:45-46`).
