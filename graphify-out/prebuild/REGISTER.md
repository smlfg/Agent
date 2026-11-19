# Prebuild-Register — was trägt, was geht nicht, was muss entschieden werden

Zweck: Probleme vor der Implementierung finden statt während. Kein Code, keine
Architekturentscheidung. Jede Zeile braucht einen Beleg (`Datei:Zeile` oder
Berichtspfad). Status: `GESICHERT` = Prüfer fertig, `OFFEN` = Prüfer läuft noch.

Stand: 19.11.2026. Quellen: 13 Prüfläufe, Berichte unter
`graphify-out/synergie/`, `graphify-out/prebuild/`, `graphify-out/triage/`.

## Index der Prüfberichte

Dieses Register ist der Einstieg in die Auswertungen. Die einzelnen Berichte
sind klickbar verlinkt, damit sie von hier aus erreichbar sind:

**Synergie-Prüfungen (S1–S6):**
[`S1 Echtzeit-Sprachschicht`](../synergie/S1-echtzeit-sprachschicht.md) ·
[`S2 Agenten-Orchestrierung`](../synergie/S2-agenten-orchestrierung.md) ·
[`S3 Generative UI`](../synergie/S3-generative-ui.md) ·
[`S4 Zustands-Streaming`](../synergie/S4-zustand-streaming.md) ·
[`S5 Kontext-Gedächtnis`](../synergie/S5-kontext-gedaechtnis.md) ·
[`S6 Payments und Tools`](../synergie/S6-payments-und-tools.md)

**Triage / Verifikation (P1–P5):**
[`P1 Image-Edges`](../triage/P1-image-edges.md) ·
[`P2 INFERRED-Kanten verifiziert`](../triage/P2-inferred-verified.md) ·
[`P3 Grad-1 A`](../triage/P3-grad1-a.md) ·
[`P4 Grad-1 B`](../triage/P4-grad1-b.md) ·
[`P5 Grad-0 und Rauschen`](../triage/P5-grad0-und-rauschen.md)

**Weitere Prebuild-Recherchen:**
[`S7 technische Grenzen`](S7-technische-grenzen.md) ·
[`S8 Anforderungs-Kollisionen`](S8-anforderungs-kollisionen.md) ·
[`Upstream-Search Generative UI`](UPSTREAM-SEARCH-generative-ui.md) ·
[`Upstream-Search Design-Tokens`](UPSTREAM-SEARCH-design-tokens.md)

Der übergeordnete Graph-Bericht liegt in
[`GRAPH_REPORT.md`](../GRAPH_REPORT.md).

## Gate 0 — Vorbedingungen (blockieren alles andere)

| # | Befund | Beleg | Status |
|---|---|---|---|
| G0-1 | `graph.json` gebaut 18.11. 17:48, Quelldateien geändert 19.11. 16:07 (Links in `tech/` repariert, `tech/UPSTREAM_SEARCH.md` → `-cloudflare.md`). Graph misst einen überholten Stand. | `stat graphify-out/graph.json`; `git diff --stat` | GESICHERT |
| G0-2 | `built_at_commit: 6bdc3a6` **entspricht** `git rev-parse HEAD` und ist trotzdem nicht frisch: uncommittete Änderungen sind unsichtbar. Frischeprüfung braucht Inhalts-Hash oder mtime, nicht den Commit. | `graphify-out/graph.json` | GESICHERT |
| G0-3 | `graphify-out/` steht nicht in `.gitignore` (untracked, 100 % des Graphs im `git status`). | `git check-ignore` Exit 1 | GESICHERT |
| G0-4 | Uncommittete Arbeit aus 19.11. 16:02–16:07 (u. a. `docs/MISSION_BRIEF-graphify-verification.md`, `UPSTREAM_SEARCH-graphify.md`) — Stand ungeklärt, ob abgeschlossen. | `git status` | **OWNER-FRAGE** |

## Owner-Entscheidungen aus dem Grilling (19.11.2026)

| # | Frage | Entscheidung | Folge für den Plan |
|---|---|---|---|
| Q1 | Ist das Live-Umgestalten Kern oder Zutat? | **Kern** — gemeint ist: die H2A-Interaktion hat Einfluss auf das UI | A-4 bleibt im Erstbau |
| Q2 | Slider: Design-Parameter oder Interaktionsanzeige? | **Design-Parameter** — „ich als Bediener kann ihn einstellen" | Mensch ist der Akteur, nicht der Agent → kein Injection-Vektor |
| Q3 | Nur Mensch oder auch Agent? | **Beides** — Mensch (explizit) und Interaktion (implizit) schreiben in denselben Zustand; der bestimmt **Werdegang** und **Gestalt** | Ein Zustand, zwei Schreiber, eine Projektion (= A-1, bestätigt) |
| Q4 | Übersetzt eine feste Regel oder das Modell? | **Beides, feste Regel zuerst** (erreichbarer) | Erstbau: deterministische Projektion, ~50 LOC. Modell-Abbildung später, dann nur als Vorschlag |
| Q7 | Ist „Tiefe" Gestalt oder Werdegang? | **Beides** — Anzeige sofort, Agenten-Aufwand nachgelagert | Tiefe braucht Entkopplung über den Ereignisstrom, sonst wird der Regler zur Wartezeit |
| Q8 | Voice im Erstbau? | **A — Text-first.** Voice kommt später, „am besten kostenlos"; als Telefon-Anwendung darf es beste Qualität sein | Erstbau ohne TTS. `docs/DESIGN-DECISIONS.md:21` („Voice ist Teil des Erstbaus") muss revidiert werden; das Mess-Gate (C-11) misst sonst den falschen Weg |

**Geparkt — Voice-Zweig (nach dem Erstbau):** Bausteine liegen schon im Material, aber unverbunden: Twilio / Plivo / Telnyx (`tech/research/cloudflare-bausteine.md`), LiveKit Agents (`tech/research/konkurrenz.md`), `phonecall`-Repo (`UPSTREAM_SEARCH.md`), ElevenLabs/Deepgram Aura-2-de (B-5).
**Kosten-Kollision:** „kostenlos" und „als Telefon" schließen sich aus — Telefonie kostet pro Nummer und pro Minute, unabhängig vom TTS. Kostenlos ist nur Web-Voice (Browser/Web Speech, mittlere Qualität). Entscheidung nötig, wenn der Zweig startet.

Konsequenz: Der Agent beeinflusst die Gestalt durch das, was er **tut** (Ereignisse), nicht durch das, was er **vorschreibt** (Stile). Der Branchen-Einwand (A2UI/MCP Apps schließen Agent→Styling aus) betrifft den Erstbau damit nicht.

Offen und jetzt blockierend: **welche Regler und welche Werte** (C-3) und **welche Interaktions-Ereignisse** die Gestalt speisen.

## Design-Parameter (Skizze: 5 geplant, max 3 sichtbar, `sketches:101-105`)

| # | Parameter | Achse | Wirkung | Sichtbar im Erstbau | Beleg |
|---|---|---|---|---|---|
| 1 | **warm ↔ cold** | warmhearted / wooden / gentle ↔ techy / blueish | Gestalt (Farbe, Radius, Textur) | ja | `sketches:102-104` |
| 2 | **Präsenz** | ruhig ↔ ausdrucksstark | Gestalt (Augen, Bewegung, Effekte) | ja | `sketches:71-75` („on wind", „soft and not scary") |
| 3 | **Tiefe** | knapp/schnell ↔ forschend/tief | **beides** (Owner): Gestalt *und* Werdegang — Anzeige sofort, Agenten-Aufwand nachgelagert | ja | `tech/INTENT.md:23` („output style"), `sketches:111` (`fast/slow`); Owner 19.11. |
| 4 | reserviert („2 more when this") | offen | offen | nein | `sketches:105` |
| 5 | reserviert | offen | offen | nein | `sketches:105` |

**Nicht als Regler:** Tempo — ist bereits durch A-5 (Segment- und Uhrenvertrag) determiniert; ein Regler wäre ein zweiter Name für dieselbe Größe.

**Token-Unterbau (Upstream geprüft, 19.11.):**

| Baustein | Upstream | Eigenbau | Beleg |
|---|---|---|---|
| Token-Dateiformat | W3C DTCG Format Module 2025.10 (CG Report, **kein** W3C-Standard) | Token-Vertrag **12–18 Z.** (statt 40–60) | `UPSTREAM-SEARCH-design-tokens.md` |
| Kontrast-Prüfung | `colorjs.io` 0.7.1 (MIT, 32,4 kB, 0 Deps) — WCAG **und** APCA | Kontrast-Gate **20–30 Z.** (statt 60–100) | ebd. |
| warm ↔ cold ohne Kontrastbruch | OKLCH mit konstantem L: Drift +3,4–3,5 % (niedriges Chroma), +14–15 % (gesättigte Akzente); HSL dagegen Faktor **2,25×**; CIE-LCH kippt ins Purpur | Hue-Bereiche + Bedeutung | ebd. |
| „Mensch setzt Design-Parameter live" | **kein Upstream-Modell** in 15 geprüften Kandidaten | Rest | ebd. |

**Gesamt: 32–48 Zeilen statt 100–160 (−52…−80 %).** Damit ist der *rechnerische* Teil innerhalb des 80-Zeilen-Glue-Budgets; was darüber bleibt, ist Produkt-UI (Slider), kein Infrastruktur-Eigenbau. Das ist der Unterschied, auf den K23 zielt.

**Einschränkung:** WCAG 3.0 schreibt selbst „The contrast algorithm used in WCAG 3 is yet to be determined" — WCAG 2.2 (4,5:1) bleibt die einzige verabschiedete Schwelle. `apca-w3` scheidet aus („Limited W3 License / Patent(s) pending").

| Q9 | Erster Besucherablauf? | **A — Minimal:** Klick → Augen → Eingabe → Antwort tippt sich → drei Regler verändern sofort die Gestalt | Erstbau ohne Werdegang-Beweis, ohne zweiten Agenten |

## Erstbau-Abgrenzung (nach Q9 = A)

**Drin:**

| Baustein | Quelle | Umfang |
|---|---|---|
| Ein DO (Front) mit WebSocket, ein Textmodell | A-2 reduziert, `tech/CLOUDFLARE_MACHBARKEIT.md:59` | — |
| Ereignisstrom + `seq` + eine Uhr (A-1 + A-5, **ein** Vertrag) | S1 + S4 | Kern |
| Typewriter als Play-out-Puffer des Streams | A-5 | — |
| Regler **warm** (volle Wirkung) und **Präsenz** (Augen, Ruhe/Bewegung) | Skizze `:71-75,102-104` | Token 12–18 Z., Gate 20–30 Z. |
| Regler **Tiefe** — **nur Gestalt-Hälfte** (Ausgabelänge), Werdegang-Hälfte erst später | Q7 + Q9=A | — |
| Feste Projektionsregel Ereignis → Gestalt | Q4 | ~50 Z. |
| Text-first, kein TTS | Q8 | — |

**Nicht drin (bewusst):** Voice/TTS · zweiter Agent (Analysing/Looking-up) · Werdegang-Wirkung von Tiefe · Gedächtnis (B-6/B-7) · Notion zur Laufzeit · Payments · Multi-Agent-Orchestrierung.

**Konsequenzen, die sauber notiert sein müssen:**

1. **A-2 (Task-Modell) entfällt für den Erstbau** — kein zweiter Agent, also auch kein Queues-vs-`subAgent`-Konflikt (C-1), kein Rate-Limit-Risiko (B-8) im Erstbau. Beides bleibt für Stufe 2 relevant.
2. **Tiefe ist im Erstbau nur Gestalt.** Der Erstbau darf nicht behaupten, den Werdegang zu zeigen — Q7 bleibt Produktabsicht, nicht Erstbau-Zusage.
3. **Das Mess-Gate (C-11) ist gegenstandslos**, solange es `first_audio_ms` prüft. Für den Erstbau braucht es `first_glyph_ms` (erster sichtbarer Buchstabe) — sonst ist der Hauptweg ungemessen.

## Register A — TRÄGT (Synergie mit gemeinsamem Anker)


| # | Anker | Warum ein Anker, nicht nur verwandt | Kosten des Verpassens | Verankerungsort | Status |
|---|---|---|---|---|---|
| A-1 | **Ereignisstrom**: ein Gespräch ist append-only Events mit monotoner, agent-vergebener `seq`. Text, `status`, Reglerwerte, späte Ergebnisse sind Projektionen. Typewriter = Anzeigetempo eines Präfixes, kein eigener Puffer. | Zustands-Sync und Slider sind dasselbe Feld (`tech/ABGLEICH.md:42`); Typewriter hängt an derselben Renderer-Naht (`:31`); `status` hat zwei Produzenten (`:41`) | 6–10 Tage; spätes Sub-Agent-Ergebnis landet via `setState` im laufenden Text, intermittierend | `docs/STATE_CONTRACT.md` (neu), verlinkt aus `docs/PROJECT.md:28-34` | GESICHERT |
| A-2 | **Task-Modell**: Auftrag Front → Hintergrund-Agent mit Eingabe, Ausgabe, Zustellweg, Fehlerfall. Nicht Nachrichtenformat, nicht Rollen-Taxonomie. | Beide Briefs tragen die Rollen; Front ist der DO mit WebSocket, Analysing braucht Kind-DO, Looking-up passt auf Queue, Backup ist Fallback-Regel | Vokabular-Drift, kein Code-Risiko; Rollen werden zweimal erfunden | `tech/INTENT.md:21` (T3) von Transport- auf Task-Frage umschreiben; Rollen-Tabelle nach `docs/` | GESICHERT |
| A-3 | 15 von 25 INFERRED-Kanten tragen textlich | P2-Bericht, je Kante mit `Datei:Zeile` | — | keine Aktion | GESICHERT |
| A-5 | **Segment- und Uhrenvertrag** — derselbe Strom wie A-1: an **einer** Stelle (im DO) in Wort-/Satzsegmente mit Zeitstempel auf **einer** Uhr geschnitten; TTS, Typewriter und Messung lesen dieselbe Liste. Der Typewriter ist damit ein Play-out-Puffer `D_display` im Budget, kein UI-Effekt. | Heute an vier Stellen verschieden definiert: Satz-Chunking (`tech/research/cloudflare-bausteine.md:95-97`), Browser-Wortpuffer (`tech/ABGLEICH.md:31-32`), Budget ohne Puffer (`tech/INTENT.md:20`), Messung ohne sichtbaren Buchstaben (`tech/CLOUDFLARE_MACHBARKEIT.md:74`) | 3–5 Tage: zwei Segmentierer ohne gemeinsame Zeitbasis; Wort-Zeitmarken sind unbelegt (`tech/ABGLEICH.md:53-54`), Protokoll nachträglich in DO, Client und gespeicherte Nachrichten | `tech/CLOUDFLARE_MACHBARKEIT.md`, neuer Abschnitt `## Ausgabestrom: Segment- und Uhrenvertrag` nach Z. 92 | GESICHERT |

> **A-1 und A-5 sind derselbe Vertrag, von zwei Seiten gefunden.** S4 (Zustand) und S1 (Latenz) sind unabhängig auf denselben Punkt gelaufen: es gibt genau einen Ereignisstrom mit einer Uhr, und alles andere (Text, Status, Slider, Typewriter, TTS, Messung) ist Projektion davon. Konsequenz für den Plan: **ein** Dokument, nicht zwei. `docs/STATE_CONTRACT.md` und der Segmentvertrag dürfen nicht getrennt geschrieben werden, sonst entstehen wieder zwei Segmentierer.
| A-4 | **Typisierter Kanal Agent → UI**: sichtbare Katalogelemente + Werte, zwei Wege gebunden. Bewusst NICHT „Antwort als Komponentenbaum". **Upstream für den Kanal existiert: AG-UI** (MIT, 20.573 ★, Push am Prüftag) — dessen Doku nutzt `{"path":"/user/preferences","value":{"theme":"dark"}}` selbst als Beispiel. | Skizze gatet jede UI-Änderung an Ereignisse (`after click`, `mouse move`, `when … is …`), nie an den Token-Strom; „max 3 von 5" (`sketches:84,105`) und Zwei-Wege-Zustand (`tech/INTENT.md:23`) tragen | Textkanal verhärtet vor der Slider-Entscheidung; Nachricht muss quer durch Prompt, Renderer und Typewriter neu geschnitten werden | `docs/DESIGN-DECISIONS.md:38` mit Rückverweis auf `tech/INTENT.md:23`; Kanal: AG-UI | GESICHERT (Restrisiko, s. B-9) |

## Register B — GEHT NICHT / GEHT NICHT ALS BELEG

| # | Behauptung | Harte Grenze | Konsequenz | Status |
|---|---|---|---|---|
| B-1 | Der Wissensgraph taugt als Entscheidungsbeleg | Alle 160 Knoten haben `source_location: None`; 2 INFERRED-Kanten sind sachlich **falsch** (Hume 300 ms / Moshi 200 ms wurden dem 800-ms-Ziel zugeschlagen, `tech/research/konkurrenz.md:32,61,65,70`); Scores sind invertiert (0.9 auf falschen, 0.75 auf belegten) | Graph nur als Navigationsindex. Jede Sachaussage braucht `Datei:Zeile` im Fließtext. | GESICHERT |
| B-2 | `validate.yml` als Wissensknoten | 14 AST-Knoten aus YAML-Syntax, eigene Komponente, tragen 0 zu den 85 bei | nicht abstellen nötig (`.graphifyignore` ginge, belegt `detect.py:1662`); stehen lassen | GESICHERT |
| B-3 | **„unter 800 ms" / „unter 1 s fertig"** | Cloudflares eigenes Budget summiert **890 ms** (40+300+400+150), bevor Overhead beginnt; veröffentlichtes Doku-Beispiel: **950 ms** bis erstes Audio, **1.200 ms** pro Turn | Kriterium auf **Time-to-First-Audio** schneiden, Text als Grundweg, Sprache messen statt versprechen | GESICHERT (S7) |
| B-4 | **Queues als Echtzeit-Transport** | Standard-Batch-Timeout **5 s** (konfigurierbar 0–60 s), keine Reihenfolgegarantie, Doppelzustellung möglich → **6,25×** über dem Budget | Während eines Turns: DO-RPC / Sub-Agenten. Queues nur für Aufträge, die Sekunden bis Minuten warten dürfen | GESICHERT (S7) |
| B-5 | **Deutscher TTS auf Workers AI** | Katalog hat **keine deutsche Stimme**: `aura-1` EN (12 Stimmen), `aura-2` nur `en`/`es`, `melotts` kein Deutsch **und ab 20.11.2026 abgekündigt** (also einen Tag nach diesem Bericht) | ElevenLabs (de, ~100 ms Median), Deepgram Aura-2-de direkt, oder Browser-TTS — je mit eigener Latenz-, Kosten-, Qualitätsmessung | GESICHERT (S7) |
| B-6 | **Notion als Laufzeit-Gedächtnis** | **3 req/s**, workspace-weit geteilt, 429 + `Retry-After` bis 60 s; 500 KB / 1.000 Blöcke pro Request; kein Push | DO-SQLite als Gesprächsspeicher, Notion asynchron als Projekt-/Wissensspiegel | GESICHERT (S7, deckt sich mit S5) |
| B-7 | **Vectorize als sofort konsistentes Gedächtnis** | Write-Ahead-Log, Änderungen erst nach **asynchronem** Index-Job sichtbar; 1.000 Updates pro Job; „at least an hour" bei 250k Inserts | DO-SQLite als Source of Truth, Vectorize nur Hintergrundindex — nie primäre Lesequelle im selben Turn | GESICHERT (S7, deckt sich mit S5) |
| B-8 | **Vier Agentenrollen unter Latenzbudget** | **20 req/min pro Account und Modell** bei Paid-Textmodellen → 4 Rollen = **5 Turns/min global**; max. 6 ausgehende Verbindungen pro Request | Rollen serialisieren oder Front-Modell klein halten; 7+ parallele Sub-Agenten technisch ausgeschlossen | GESICHERT (S7) |
| B-9 | „Der Agent färbt seine eigene Seite live um" als gedeckte Fähigkeit | kein Upstream-Fund in der Konkurrenz-Recherche (`tech/research/konkurrenz.md:77`); der Anker A-4 ist plausibel, aber nicht belegt | A-4 nur mit eigenem Prototyp belegen, nicht als bestehendes Muster einplanen | GESICHERT (S3) |

## Register C — ENTSCHEIDUNG (nur Owner, blockiert Bau)

| # | Frage | Seite A | Seite B | Status |
|---|---|---|---|---|
| C-1 | ~~Transport für Hintergrund-Agenten~~ → **technisch entschieden:** Queues fallen für Echtzeit aus (5 s Batch-Timeout, B-4), also DO-RPC/Sub-Agenten | `subAgent` (`tech/CLOUDFLARE_MACHBARKEIT.md:59`) | Queues (Research) — durch Upstream-Grenze erledigt | GESICHERT (S2 + S7) |
| C-2 | Latenzziel | Budget 800 ms, Summe der Anteile 890 ms (`tech/CLOUDFLARE_MACHBARKEIT.md:73,80`) | „under 1 sec even with TTS" aus der Skizze | GESICHERT (Zahl widersprüchlich) |
| C-3 | Slider-/Begriffs-Belegung (warm↔cold, „5 options but only show 3", „clear word") | Skizze | keiner technischen Achse zugeordnet | GESICHERT (`tech/LUECKEN.md:18-21`) |
| C-4 | **D1 Eigenbau-Verbot vs. Kern ohne Vorlage (K23)** — gilt „kein eigener Code" ausnahmslos? | **A:** Ausnahme schriftlich; Rest bleibt upstream-scharf. Preis: Präzedenzfall | **B:** Regel bleibt hart → das Live-Umgestalten fällt aus dem Erstbau, Produktidee wartet | GESICHERT · **HÄRTESTE** |
| C-5 | **D2 Latenz-Ziel: Kriterium oder Messergebnis (K01, A33)** — ist „1 s inkl. TTS" Abnahme oder Messwert? | **A:** 1 s als Kriterium → Transport + Modellwahl vorab fest, Messlauf wird Prüfung statt Erkundung; Risiko: durchfallen | **B:** Kriterium erst aus 20 Messwerten; Risiko: die Zahl verschwindet stillschweigend | GESICHERT |
| C-6 | **D3 Voice im Erstbau (K02, K25)** — gleichrangiger Kanal oder Zugabe hinter Text? | **A:** gleichrangig → Beta-, Deutsch- und 890-ms-Risiko werden Erstbau-Risiken | **B:** Zugabe → kleiner und früher prüfbar, aber `docs/DESIGN-DECISIONS.md:21` muss revidiert werden | GESICHERT |
| C-7 | **D4 Stille vs. Fokus (K12, K13, K14)** — gilt „neue Antwort im Fokus" auch für Hintergrund-Ergebnisse? | **A:** Fokus für alles → einfache Regel, nimmt Leseposition, widerspricht „nicht bevormundend" | **B:** Fokus nur für angefragte Antworten → zwei Antwortklassen im UI, mehr Zustand + Testfälle | GESICHERT (beißt A-1) |
| C-8 | **D5 Ist die sichtbare Fläche das Produkt? (K07, K08, K17, K18)** — bleibt der Regler das einzige Gestaltungselement? | **A:** Skizze folgen (Regler, Augen, Effekte) → GreateWriting wird Zeitdiagnose, klar baubar | **B:** Inspiration folgen (Agent entscheidet, Input verschwindet) → Slider fallen weg, neues Bedienkonzept, Skizze partiell ungültig | GESICHERT |
| C-9 | **Standverschiebung (K25):** `docs/` steht auf 19.11., `tech/` auf 12.11. — `tech/ABGLEICH.md` und `tech/LUECKEN.md` führen als offen, was `docs/DESIGN-DECISIONS.md` schon entschieden hat | Designentscheidungen sind bestätigt | tech/ ist veraltet → darf nicht als Entscheidungsquelle dienen | GESICHERT |
| C-10 | Graphify/Frische-Politik: `graphify-out/` ignorieren oder committen; Graph-Neubau nach Link-Reparatur | — | — | **OWNER-FRAGE** |
| C-11 | **Mess-Gate misst den falschen Weg:** Pflicht-Gate (20 deutsche Turns, `first_audio_ms`) prüft den **zweiten** Ausgabeweg (Voice), während der Erstablauf text-first mit Typewriter ist. Das Gate kann grün werden und den Hauptweg ungemessen lassen. | Gate wie beschrieben (`docs/PROJECT.md:32-43`, `docs/DESIGN-DECISIONS.md:24`) | Hauptweg = Text + Typewriter, braucht eigene Metrik (z. B. `first_glyph_ms`) | GESICHERT (S1) |

## Register D — AUSGESCHLOSSEN (Nebenschauplatz, nicht weiter verfolgen)

| # | Punkt | Begründung | Status |
|---|---|---|---|
| D-1 | Payments (x402 / MPP) | einzige Spur `⟨Pay⟩` (`sketches/…:117,128,168`), Lesart offen (auch „Ray"); in `tech/INTENT.md:27` selbst auf „nicht vertiefen"; `grep` in `docs/PROJECT.md`, `docs/DESIGN-DECISIONS.md`, `Idea`: null Treffer | GESICHERT |
| D-2 | Graphify/Foam als **Produkt**synergie | `UPSTREAM_SEARCH.md:5-10` adressiert „Ordner und Pläne dieses Repos"; kein Graph-/Notiz-/Memory-Feature in den Produktquellen | GESICHERT |

## Echte Lücken (klein, Doku-Arbeit, kein Bau)

| # | Lücke | Beleg | Aufwand |
|---|---|---|---|
| L-1 | `tech/LUECKEN.md` wird von keiner Datei verlinkt | P3-Bericht | 1 Zeile in `README.md` |
| L-2 | `WebSocket Transport` hängt am falschen Anker (`Front-Agent` statt Transportentscheidung) | P4; `tech/research/cloudflare-bausteine.md:318-322`, `tech/CLOUDFLARE_MACHBARKEIT.md:75-76` | S |
| L-3 | `UPSTREAM_SEARCH.md:19,21,22` beruft sich auf „Worker-Berichte" ohne Verweis | P4 | S (repariert 4 Knoten) |
| L-4 | Zwei parallele Kandidatenlisten ohne Querverweis: `tech/research/cloudflare-bausteine.md:343` vs. `UPSTREAM_SEARCH.md:11` | P4 | S |
| L-5 | `graphify-out/` nicht ignoriert | P5 | S (Owner-Freigabe) |
