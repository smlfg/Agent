# Lücken — Quereinblick über das Repo

Stand: 12.11.2026. Grundlage: README.md, AGENTS.md, Idea, docs/, research/,
notion/README.md, sketches/2026-11-12-agentfaehig.md und alles unter tech/.
Diese Datei listet Lücken. Sie trifft keine Entscheidungen und belegt nichts neu.

## Hier muss Samuel weiterarbeiten

1. Ersten Besucherablauf festlegen. Ohne ihn fehlen Abnahmekriterien und jeder
   Build-Kern (`docs/PROJECT.md:30`, `docs/DESIGN-DECISIONS.md:31`).
2. Über die Freigabe der Latenz-/Deutsch-Messung entscheiden. Der Klon von
   `examples/voice-agent` beantwortet T2, Deutsch und Stille-Erkennung in einem
   Lauf (`tech/CLOUDFLARE_MACHBARKEIT.md:102-108`). Bis dahin bleibt die eine
   offene Skizzen-Anforderung „under 1 sec" ungeklärt (`:8-10`).
3. Abnahmekriterien festlegen, bevor der erste Ablauf gebaut wird
   (`docs/DESIGN-DECISIONS.md:38`). Vorhanden ist nur eine Metrik-Quelle
   (`first_audio_ms`, `tech/CLOUDFLARE_MACHBARKEIT.md:44`), kein Kriterium.
4. Slider-Belegung und die zugehörigen Skizzen-Begriffe klären: warm ↔ cold,
   „maybe 5 options but only show 3", „clear word" — nichts davon ist einem
   Regler zugeordnet (`sketches/2026-11-12-agentfaehig.md:102-105,84`;
   `docs/DESIGN-DECISIONS.md:36`).
5. Architektur- und Modellentscheidung: Front-Modell, Voice-Pipeline, eigener
   Worker oder Flotte `claudeflareworkerhaus`, Agent pro Besucher oder Mandant
   (`tech/CLOUDFLARE_MACHBARKEIT.md:112-116`). Vorhanden sind nur Kandidaten
   (`tech/research/cloudflare-bausteine.md:47-60`), keine Wahl.
6. Unsichere Lesarten der Skizze klären. Alle neun stehen noch offen; nur
   ⟨Pay⟩ wurde vorsichtig notiert (`sketches/2026-11-12-agentfaehig.md:159-171`;
   `tech/INTENT.md:27`).
7. Typewriter × Stimme abstimmen (wer führt?) und das Fehlerverhalten bei
   stockendem Modell definieren (`tech/ABGLEICH.md:48-54,67`). Beides steht
   in keinem Dokument, ist aber Folge der bestätigten Entscheidungen.
8. Datenschutz und Kosten eröffnen oder bewusst vertagen. Beide Themen sind in
   keinem Dokument behandelt (siehe Frage 4).
9. Notion-Zugang wählen: Export, Token oder Copy-Paste. Ohne ihn bleibt die
   Notion-Spur leer (`notion/README.md:32-35`).
10. Kleine Eingangsdetails klären oder für den ersten Build weglassen:
    „mouse move" als Wecksignal und „1 message" (`sketches/:81-82`) sind
    nirgends behandelt.

## 1 · Skizzen-Punkte, die weder in docs/ noch in tech/ behandelt sind

- `Pathways` — „user decides where the 'call' is going to"
  (`sketches/:36-37`). T7 behandelt nur die Ziel-Aufteilung
  for website/person/team/company (`tech/INTENT.md:25`), nicht die
  Nutzerentscheidung über den Weg.
- Die beiden Ableitungsachsen „What this is" und „creator" (`sketches/:38-40`).
  In keinem Dokument gefunden.
- Das Gefühl-Wortfeld als Ganzes: vibrant/alive/vivid, welcomed, kinderleicht,
  soft smooth, effortless, seamlessly, welcoming, fluid und „nicht
  bevormundend" (`sketches/:58-66`). `research/SCOUT-SYNTHESIS.md:9-11` zitiert
  es nur; docs/ und tech/ operationalisieren es nirgends.
- „mouse move" als zweites Wecksignal neben „after click" (`sketches/:81`).
  `tech/ABGLEICH.md:39` behandelt nur „Mikrofon nach Klick".
- „clear word" und „1 message" auf der Slider-Karte (`sketches/:82-84`).
  Nicht gefunden. Nur „max 3" wurde als Slider-Limit gedeutet
  (`research/SCOUT-SYNTHESIS.md:60`).
- Die warm ↔ cold-Achse mit warmhearted/wooden/gentle und techy/blueish
  (`sketches/:102-104`). Nicht gefunden.
- „2 more when this" — „maybe 5 options but only show 3" (`sketches/:105`).
  Nicht gefunden.
- „live meta" und „want to change" am Analysis-Agenten (`sketches/:114`).
  Bedeutung ungeklärt, nicht behandelt.
- „Concept of Meta" und das Motto „wir machen das! — Agentfähig.de"
  (`sketches/:135,137`). Nicht gefunden. „philosophy of HAI" und „plaud
  thoughts" sind nur als Wissensquelle T8 gedeutet (`tech/INTENT.md:26`).
- Ruhe/Bewegung-Screens und Augen-Animation sind zwar als T6 „reines
  Frontend" abgelegt (`tech/INTENT.md:24`), inhaltlich aber bewusst an das
  Design zurückgegeben (`tech/CLOUDFLARE_MACHBARKEIT.md:62`).

## 2 · Offene Fragen in den Dokumenten — und was nur Samuel beantworten kann

Offene Fragen stehen in vier Listen:

- `docs/DESIGN-DECISIONS.md:31-38`: Besucherablauf, Eingabekanäle,
  Fokuswechsel, Typewriter-Tempo, Slider-Belegung, Modellprovider/Voice/
  Architektur, Abnahmekriterien.
- `docs/PROJECT.md:28-34`: fünf Entscheidungen vor dem ersten Build.
- `tech/ABGLEICH.md:62-67`: vier neue Fragen (Text zuerst?, späte Ergebnisse,
  Typewriter vs Stimme, Verhalten bei Stocken).
- `tech/CLOUDFLARE_MACHBARKEIT.md:112-116`: eigener Worker, Agent pro
  Besucher/Mandant, Latenz-Ziel hart oder weich.

Nur Samuel kann beantworten:

- Alle Produkt- und Designfragen: erster Ablauf, Eingabekanäle (er verwies
  selbst auf Mikrofonberechtigung, `docs/DESIGN-DECISIONS.md:32-33`),
  Fokuswechsel-Timing, Slider-Belegung, Abnahmekriterien.
- Alle Lesarten der Skizze — laut `AGENTS.md:11-12` bleiben sie offen, bis
  Samuel sie klärt.
- Architektur-, Hosting- und Modellentscheidungen; `AGENTS.md:41-42` verbietet,
  sie aus einer Skizze abzuleiten. Samuel kann sie aber delegieren.
- Freigaben: Messung/Klon, Not-Zugriffe, Kostenpflichtiges
  (`AGENTS.md:27-28`; `tech/CLOUDFLARE_MACHBARKEIT.md:108`).

Nicht Samuel-Fragen, sondern Mess- und Prüfaufgaben:

- Ob `flux`/`aura-1` Deutsch können und ob die 1-s-Latenz hält
  (`tech/CLOUDFLARE_MACHBARKEIT.md:98,104-107`).
- Typewriter-Tempo und Streaming-Pausen: Samuel setzt die Richtung, die
  konkreten Werte kommen aus der Messung
  (`docs/DESIGN-DECISIONS.md:35`; `research/SCOUT-SYNTHESIS.md:48-55`).

## 3 · Widersprüche und verschiedene Stände

- Kein inhaltlicher Widerspruch zwischen Design und Technik; `tech/ABGLEICH.md:60`
  meldet das selbst: „Kein Widerspruch gefunden."
- Stände-Verschiebung: `tech/INTENT.md:7` sagt, die Designentscheidungen des
  Owners „werden gepusht". `tech/ABGLEICH.md:5-8` vergleicht sie bereits. Der
  INTENT-Stand ist veraltet.
- Belegstand-Widerspruch: `tech/research/cloudflare-bausteine.md:5-7` erklärt
  alle Aussagen dieses Laufs als VERIFIZIERT. Der Orchestrator nennt dieselben
  Punkte (Bild-Katalog, AI Search) „nicht gegengeprüft"
  (`tech/CLOUDFLARE_MACHBARKEIT.md:57,64`). Ein von beiden lässt sich nicht
  halten.
- Voice-Paketnamen: drei verschiedene Stände. Doku nennt
  `@cloudflare/voice-deepgram`/`voice-elevenlabs` (`tech/research/cloudflare-bausteine.md:25-27`),
  derselbe Worker meldet inzwischen `packages/voice` und „Stand klären"
  (`:367-372`), der Orchestrator meldet `@cloudflare/voice` als abgekündigt
  zugunsten `agents/voice` (`tech/CLOUDFLARE_MACHBARKEIT.md:96`).
- Die Cloudflare-Latenz-Quelle widerspricht sich selbst: Budget 800 ms, Summe
  der Anteile 890 ms (`tech/CLOUDFLARE_MACHBARKEIT.md:73,80`). Richtig
  gekennzeichnet, aber ungelöst.
- `notion/README.md:27-28` behauptet, die Skizze sei „derzeit die einzige
  inhaltliche Quelle". Veraltet: `docs/DESIGN-DECISIONS.md` existiert.
- Betriebsstand ohne Fortgang: MCP-Adapter übergibt ungültiges `--dir`,
  KnowledgeGraph-Zugriff nicht nachgewiesen (`research/SCOUT-SYNTHESIS.md:70-74`).
  Kein Widerspruch, aber offen und möglicherweise veraltet.
- Missions-IDs: der Konkurrenz-Brief nennt eine inzwischen inaktive Mission;
  der Bericht korrigiert das selbst (`tech/briefs/konkurrenz.md:10-13`).

## 4 · Was vor dem ersten Build fehlt — festgelegt oder nicht

- **Erster Besucherablauf:** nicht festgelegt
  (`docs/DESIGN-DECISIONS.md:31`, `docs/PROJECT.md:30`, `tech/ABGLEICH.md:64`).
  Einziger Richtungshinweis: Text zuerst und Stimme danach als Vorschlag
  (`tech/ABGLEICH.md:64`), von Samuel nicht entschieden.
- **Abnahmekriterien:** nicht festgelegt (`docs/DESIGN-DECISIONS.md:38`,
  `docs/PROJECT.md:34`). Vorhanden ist nur die Metrik-Quelle
  `first_audio_ms` (`tech/CLOUDFLARE_MACHBARKEIT.md:44`).
- **Slider-Belegung:** nicht festgelegt (`docs/DESIGN-DECISIONS.md:36`).
  Technisch frei (`tech/ABGLEICH.md:42`). Skizzenideen warm ↔ cold, „5 options
  but only show 3", „clear word" sind keiner Belegung zugeordnet
  (`sketches/:102-105,84`).
- **Modellwahl:** nicht festgelegt (`docs/DESIGN-DECISIONS.md:37`,
  `tech/CLOUDFLARE_MACHBARKEIT.md:12`). Kandidatenlisten vorhanden
  (`tech/research/cloudflare-bausteine.md:47-60`); Hebel identified: das
  Front-Modell (`tech/CLOUDFLARE_MACHBARKEIT.md:81`).
- **Messung:** Plan vorhanden, aber nicht ausgeführt und nicht freigegeben —
  `examples/voice-agent` klonen, zwanzig Wechsel Deutsch aufzeichnen
  (`tech/CLOUDFLARE_MACHBARKEIT.md:102-108`).
- **Kosten:** nicht gefunden. Die Recherche-Briefs schließen Preise explizit
  aus (`tech/briefs/cloudflare-bausteine.md:38`,
  `tech/briefs/konkurrenz.md:34`). Vorhanden sind nur Limits: 20/50 req/min
  für Paid-Textmodelle (`tech/research/cloudflare-bausteine.md:280-284`),
  Free-Plan-Grenzen (`:144-146,260-272`). Kein Budget, keine Preisrechnung.
- **Datenschutz:** nicht gefunden. Nur Randnotizen: Mikrofonfreigabe nach
  Klick als Browserverhalten (`tech/ABGLEICH.md:39`), Audio und Transkripte
  liegen im Agent-Speicher (`tech/CLOUDFLARE_MACHBARKEIT.md:29,49`),
  DO-Speicher-Limits (`tech/research/cloudflare-bausteine.md:261-262`). Kein
  Wort zu DSGVO, Aufbewahrung, Löschung oder Protokollierung.
- **Fehlerverhalten:** nicht festgelegt. Offene Folgefragen: Puffer leergeführt
  (`tech/ABGLEICH.md:31`), Pausen erkennen (`:41`), Verhalten bei Stocken
  (`:67`). Fremdes Muster als Bezug: `bridge_timeout` bei Stimm
  (`tech/research/konkurrenz.md:29`). `docs/PROJECT.md:34` fordert die Prüfung
  von Fehlerverhalten, definiert es aber nicht.

## 5 · Unsichere Lesarten der Skizze — Stand ungeklärt

Alle neun aus der Lesart-Tabelle sind noch ungeklärt
(`sketches/:159-171`): ⟨Opp M⟩, ⟨Moltdegect⟩, ⟨instantly⟩, ⟨in touch⟩,
⟨Backup⟩, ⟨Pay⟩, ⟨Sinnvoll⟩, ⟨Reg⟩, ⟨lokat⟩.

Behandelt wurde nur ⟨Pay⟩: vorsichtig als T9 notiert, x402/MPP vorhanden,
Lesart selbst bleibt unsicher (`tech/INTENT.md:27`,
`tech/CLOUDFLARE_MACHBARKEIT.md:65`).

Weitere unklare Begriffe, die nicht einmal in der Lesart-Tabelle stehen:
„on wind" (`sketches/:72`), „2 more when this" (`:105`), „live meta" /
„want to change" (`:114`), „Concept of Meta" (`:135`), die Unterscheidung
„plaud thoughts" → als Plaud-Transkripte gedeutet (`:136`;
`tech/INTENT.md:26`). Ihre Bedeutung kann nur Samuel liefern (`AGENTS.md:12`).

## 6 · Aussagen in tech/, die nur als Worker belegt und nicht gegengeprüft sind

Beleglegende: „Worker" heißt ungeprüft
(`tech/CLOUDFLARE_MACHBARKEIT.md:21-24`).

- `sendText` umgeht die Spracherkennung (`tech/CLOUDFLARE_MACHBARKEIT.md:56`).
- Bild-Eingang über Workers-AI-Vision-Modelle, Modellkatalog (`:57` —
  ausdrücklich „nicht gegengeprüft").
- Modellnamen für schnell/langsam (`:60`, Beleg „Worker").
- Durable-Objects-Namensfrage für T7 (`:63`).
- AI Search als Wissensquelle für T8 (`:64` — ausdrücklich „nicht
  gegengeprüft").
- Fremde Latenzzahlen: Pipecat 500–800 ms, Hume ~300 ms, Moshi ~200 ms
  (`:84-86` — „nicht gegengeprüft").
- Modell-Limits 20/50 req/min (`:97` — ausdrücklich „Nicht gegengeprüft").
  Widerspruch dazu: der Worker-Bericht meldet dieselbe Aussage als
  VERIFIZIERT (`tech/research/cloudflare-bausteine.md:280-284`).
- Nachrichten-Persistenz für Chat-Agenten
  (`tech/ABGLEICH.md:29` — „Worker-Bericht, nicht gegengeprüft").
- „Mikrofon nach Klick" als allgemeines Browserverhalten, „in dieser Mission
  nicht nachgeschlagen" (`tech/ABGLEICH.md:39`).
- json-render: `Slider`-Baustein nur laut Worker
  (`tech/UPSTREAM_SEARCH.md:19`; `tech/research/konkurrenz.md:41` — beide
  Worker-Läufe, kein eigener Abgleich).
- `realtime-examples` ohne Lizenz-Feld; vor Übernahme prüfen
  (`tech/UPSTREAM_SEARCH.md:23`).
- Doku-Metriken `llm_ms: 850 …` — die Seite sagt nicht, ob gemessen oder nur
  ein Beispiel (`tech/CLOUDFLARE_MACHBARKEIT.md:74`).
- Unbelegt-Einträge aus der Konkurrenz-Recherche: Stack von Docket und
  Navless, diverse Lizenzen, EVI-Doku-Abschaltung
  (`tech/research/konkurrenz.md:73-80`).
- Grundsatz: der Worker-Bericht erklärt sich als VERIFIZIERT
  (`tech/research/cloudflare-bausteine.md:5-7`), der Orchestrator hält einzelne
  Punkte für ungeprüft (`tech/CLOUDFLARE_MACHBARKEIT.md:21-24,57,64`). Der
  Belegstand dieser Dateien ist damit selbst nicht gegenseitig geklärt.
