# PROJECT_CONTRACT — Agentfähig

Stand: 19.11.2026 · Status: **ENTWURF zur Owner-Abnahme** — keine Freigabe, keine
Zustimmung durch den Agenten. Verfasser: Engineering-Lead-Rolle (OpenCode).
Gegenstück: [`EXECUTION_PLAN-M0-M5.md`](EXECUTION_PLAN-M0-M5.md).

> **Control-Plane-Status: DEGRADED (sichtbar, nicht still).**
> `hai_health` ist `ok` (Kernel `contract_kernel`), aber für dieses Projekt gibt es
> keinen rechtmäßigen Schreibpfad: zwei aktive Lanes (`prezero-clean`, `brueggen`)
> bei Limit 2, `~/Control/ACTIVE_PROJECTS.md` existiert nicht
> ([`PROJEKTPFADE.md`](../PROJEKTPFADE.md) §5), und eine verwaiste Mission
> `M-20261119T194948-3db0ab44` (T1 Messlauf, `contract_version` 1,
> `session_count` 0) blockiert `hai_open_mission` mit `active_mission_exists`.
> Supersede verlangt ein Owner-Gate, das ich nicht in Samuels Namen auslöse.
> **Folge:** Dieses Dokument entsteht ohne Mission und ohne Lease. Es ist ein
> Planungsartefakt, kein autorisierter Lauf. **Backfill:** Mission öffnen oder
> Orphan mit Owner-Gate superseden, beide Dokumente als Evidenz nachtragen.
> Es wurde nichts committet, gepusht oder deployt.

> **Gegenprüfung 20:09 (unabhängig, read-only) — der Block oben ist im
> Missionsstatus nicht korrekt.** Der lokale HAI-Store enthält sehr wohl eine
> Mission `M-20261119T194948-3db0ab44` (Status `active`, Objective T1-Messlauf,
> `contract_version` 1, angelegt 19:49:48) **und** eine Executer-Session
> `S-20261119T195007-03a762bf` (Status `active`, erteilt 19:50:07, gültig bis
> 20:35, `resolved_write_paths` = nur `tech/MESSPROTOKOLL-2026-11-19.md`,
> `criterion_ids` C1–C4). `hai_health` meldet dagegen `active_mission_count: 0`
> — das ist der eigentliche Control-Plane-Widerspruch (MCP-Sicht vs.
> Dateisystem), nicht „keine Mission/keine Lease". **Folge:** Vor einem Supersede
> muss der Owner den Widerspruch auflösen; ein Supersede würde eine laufende
> Lease treffen. Schreibzugriffe nach 19:50 auf `docs/PROJECT_CONTRACT.md`,
> `tech/EXECUTION_PLAN-M1-MESSLAUF.md` und `docs/KI-DIALOG-2026-11-19.md` liegen außerhalb
> des erlaubten Pfads. Details:
> [`docs/handoffs/2026-11-19-plan-konsolidierung.md`](handoffs/2026-11-19-plan-konsolidierung.md)
> K-1 (Control-Plane-Widerspruch) und K-2 (tote Querverweise in der
> Warteschlange; die Hauptliste vergab während der Konsolidierung U12/U13
> doppelt).

---

## 0 · Grundlage und Beweislage

Dieses Dokument **ersetzt keine** bestehende Planung. Es behandelt die vorhandene
Planung als Baseline und macht sie prüfbar. Jede Erfolgsaussage trägt eine
Belegspalte; was nicht belegt ist, steht als **Vorschlag** oder **offen** da.

**Belegstufen in diesem Dokument:** **VERIFIED** = durch Quelle, Code oder
Messung belegt (Belegspalte gefüllt) · **RECOMMENDED** = begründeter Vorschlag,
nicht beschlossen (als „Vorschlag V1…V8" oder Empfehlung gekennzeichnet) ·
**HYPOTHESIS** = plausibel, ungeprüft (ausdrücklich so benannt) ·
**REJECTED** = verworfen, mit Grund (Kapitel 4).

| Eingang (laut Auftrag) | Tatsächliches Artefakt im Repo | Belastbarkeit |
|---|---|---|
| Freigegebene Projektplanung | [`PLAN-STUFEN-0-5.md`](PLAN-STUFEN-0-5.md) (Wenn-Dann-Plan, Stufen 0–5), [`DESIGN-DECISIONS.md`](DESIGN-DECISIONS.md), [`MESSLAUF-PLAN.md`](../tech/MESSLAUF-PLAN.md) (Validator `ACCEPT`) | Planung ja, **Freigabe nein**: alle fünf ADRs aus `PLAN-STUFEN-0-5.md` stehen auf „vorgeschlagen" (`PLAN-STUFEN-0-5.md:247–248`), ebenso der am 19.11. abends ergänzte [`ADR-0006`](adr/ADR-0006-zeitvertrag.md) (Zeitvertrag, Status „vorgeschlagen"); das `ACCEPT` ist nicht an die aktuelle Plandatei gebunden (Hash-Drift, `PLAN_VALIDATION_REPORT.md:88–104`) |
| PRIOR_ART_REPORT | [`research/PRIOR_ART_REPORT.md`](../research/PRIOR_ART_REPORT.md) (Build/Buy/Adapt je Baustein, Lizenz, Reifegrad, Belegstufen [A]–[C]), dazu [`UPSTREAM-SEARCH-vergleichbare-projekte.md`](../UPSTREAM-SEARCH-vergleichbare-projekte.md) und [`tech/UPSTREAM-SEARCH-cloudflare.md`](../tech/UPSTREAM-SEARCH-cloudflare.md) | Kandidaten + Lizenzen geprüft, **nichts geklont oder ausgeführt** (`UPSTREAM-SEARCH-vergleichbare-projekte.md:26–29`); der jüngere Bericht korrigiert Einzelaussagen der älteren Suche |
| Engineering Readiness Audit | [`CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md`](CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md) (T1–T9 mit Nachweisen), [`tech/LUECKEN-2026-11-12.md`](../tech/LUECKEN-2026-11-12.md) (Lückenliste) | Technische Machbarkeit belegt. **Kein eigenständiges Audit-Artefakt** — Bereitschaft ist über mehrere Dateien verstreut; Kapitel 1 dieses Dokuments konsolidiert sie, ein zusätzliches Audit wäre Doppelarbeit |
| Bestehendes Repository | `src/` und `tests/` enthalten je nur ein README (`src/README.md`, `tests/README.md`) | **Null Anwendungscode, null Anwendungstests.** `bash scripts/validate.sh` prüft Gerüst und Links, nicht Funktion (verifiziert 19.11., Exit 0) |

**Der ehrlichste Satz über den Ausgangszustand:** 19.11.2026 hat rund zwanzig
Planungs-, Recherche- und Prüfdokumente erzeugt und **null Zeilen
Anwendungscode**. Für ein Projekt, dessen These „die ersten 20 Sekunden müssen
lebendig sein" lautet, sind bisher null Sekunden gebaut. Das ist keine Kritik an
der Planung (sie war nötig), sondern die wichtigste Randbedingung dieses Plans.

---

## 1 · Erfolgsdefinition

Regeln für dieses Kapitel:

- **Ausgangswert** = was heute belegbar ist. „0" heißt: nachweislich nicht
  vorhanden, nicht „vermutlich schlecht".
- **Zielwert** ohne Baseline ist als **Vorschlag (V1…V8)** markiert und braucht
  Samuels Entscheidung. Es werden keine Zahlen als vereinbart dargestellt, die
  es nicht sind.

### 1.1 PRODUCT SUCCESS — welches Nutzerproblem gelöst sein muss

**Das Problem:** Eine Website, die einen Agenten *hat*, ist austauschbar. Ein
Besucher merkt nach zehn Sekunden: Chatfenster, austauschbar, kein Grund zu
bleiben. Agentfähig soll das Gegenteil sein — die Seite **ist** der Agent, und
der Besucher erlebt in 20 Sekunden, dass sich die Seite *seinetwegen* verändert
(`VISION-samuel.md:45–50,71–81`).

| # | Kriterium | Messgröße | Ausgangswert | Zielwert | Validierung | Evidenz |
|---|---|---|---|---|---|---|
| P1 | Ein Fremder erlebt die Seite als Etwas, nicht als Spielerei | Verhalten nach 20 s **ohne Anleitung**: scrollt von selbst **oder** fragt, was passiert | **0 Tests durchgeführt** | **V1:** 1 von 1 besteht (Gate bei M3); **V2:** ≥ 2 von 3 bestehen (M5) | ADR-0005-Test: 20 s, keine Anleitung, Bildschirmaufzeichnung, zwei Fragen danach | Aufzeichnung + Protokoll mit Zeitstempel in `tech/` |
| P2 | Der Besucher kann **in eigenen Worten** sagen, was passiert ist | Antwort auf „Was hat die Seite gerade gemacht?" nennt die Selbstveränderung | 0 Tests | **V3:** Antwort nennt Farb-/Haltungswechsel **ohne** das Wort „Theme" oder „Dark Mode" | wörtliche Mitschrift der Antwort, nicht Paraphrase | Zitat + Datum in `tech/` |
| P3 | Die Kern-Handlung (Agent fragt nach seinem Aussehen, Seite ändert sich) ist erlebbar | Abgeschlossene Abläufe „Frage → Regler → sichtbare Änderung **und** anderer Ton" | nicht implementiert | 1 Ablauf end-to-end, vom Fremden **ohne Hilfe** ausgelöst | Beobachtung im Fremdtest + Reload-Probe (Zustand bleibt) | Aufzeichnung + State-Snapshot |
| P4 | Der Besucher wird nicht bevormundet (Grenze aus der Vision) | Anzahl aufgezwungener Schritte vor dem ersten eigenen Intent | nicht implementiert | **V4:** 0 Klicks Pflicht vor der ersten Texteingabe; Mikrofon nur nach ausdrücklichem Klick | Zählung im Ablaufprotokoll; Review gegen `VISION-samuel.md:95–102` | Ablaufprotokoll + Review-Notiz |

**Was Produkterfolg ausdrücklich nicht ist:** „Latenz unter 1 s", „Voice läuft",
„auf Cloudflare". Das sind technische Mittel (Kapitel 1.2), keine Nutzenaussage.

### 1.2 TECHNICAL SUCCESS — welche Fähigkeiten nachweislich existieren müssen

| # | Fähigkeit | Messgröße | Ausgangswert | Zielwert | Validierung | Evidenz |
|---|---|---|---|---|---|---|
| T1 | Ein Text-Turn läuft durch eine echte Agent-Runtime bis zur sichtbaren Antwort | erster Text-Token im Browser (ms, ab Absenden) | **kein Messwert** (Text-Pfad nie gebaut) | **V5:** Wert wird gemessen und protokolliert — Zielwert erst aus dem Messwert ableiten (Entscheidung 5 vom 19.11.) | Browser-Netzwerk/Server-Log, Zeitstempel je Token | Messzeile in `tech/` |
| T2 | Die Antwort erscheint als wortlängen-abhängiger Typewriter | Zeichen pro Sekunde je Wortlänge; keine Sprünge bei Streaming-Pausen | nicht implementiert | sichtbar ungleichmäßig: kurze Wörter schneller als lange; Puffer läuft nie leer sichtbar | 3 aufgezeichnete Antworten, ausgewertet am Frame-Timing | Video + Messskript-Ausgabe |
| T3 | Ein Zustandsfeld steuert **Oberfläche und Antwort-Haltung** gleichzeitig (ADR-0004) | ein Reglerwert → (a) CSS-Variablen geändert, (b) Prompt-Fragment geändert, (c) Antworttext nachweislich anders formuliert | nicht implementiert | alle drei Wirkungen in **einem** Durchlauf sichtbar; überlebt Reload | A/B-Durchlauf bei zwei Reglerstellungen, Antworten blind verglichen | 2 Bildschirmfotos + 2 Antworttexte + State-Snapshot |
| T4 | Ein Hintergrund-Agent liefert ein Ergebnis **still** (ohne Unterbrechung) | Zeit von Auslösung bis sichtbares Ergebnis; kein Fokuswechsel, keine Sprech-Unterbrechung | nicht implementiert | Ergebnis erscheint ohne Zutun des Besuchers, ohne dass der Front-Fokus wandert | Beobachtung + Ereignisprotokoll | Protokoll + Aufzeichnung |
| T5 | Voice rein/raus funktioniert nach Klick, englisch | `first_audio_ms`, Transkriptqualität, Abbruchrate | **0 von 20 Messzeilen** (`MESSPROTOKOLL-2026-11-19.md`, Messwerttabelle). Laufversuch 1 am Paid-Modell gescheitert; Laufversuch 2 (19.11. abends) belegt: **Free-Plan trägt das getauschte Modell `glm-4.7-flash` für Text-Turns** (zwei Turns beantwortet, keine Konsolenfehler). **Voice ungemessen:** der Voice-Pfad startet nicht (`Flux STT WebSocket upgrade failed`, 5 Versuche, modellunabhängig) | **V6:** 20 Wechsel protokolliert, Median `first_audio_ms` gemessen; Kriterium daraus abgeleitet | Messlauf nach `MESSLAUF-PLAN.md`, Protokoll vollständig; offener Erfassungsweg für Stage-Timings (`docs/UNSOLVED-TECHNIK.md` U1) | Protokoll + Auswertung |
| T6 | Der Seitenzustand ist der Agentzustand (nicht nur eine Nachrichtenliste) | zwei Browser-Tabs zeigen denselben Zustand nach einer Änderung | nicht implementiert | Änderung in Tab A erscheint in Tab B ohne Reload | Zwei-Tab-Probe | Aufzeichnung + State-Dump |

### 1.3 DELIVERY SUCCESS — was im Budget geliefert sein muss

| # | Ergebnis | Messgröße | Ausgangswert | Zielwert | Validierung | Evidenz |
|---|---|---|---|---|---|---|
| D1 | Jeder Meilenstein besitzt ein **Artefakt an einem Pfad** und eine **durchgeführte** Abnahmeprozedur | Anteil Meilensteine mit beidem | 0 von 6 | 6 von 6 bei Projektende | Abnahme durch **jemanden außer dem Autor** (Verifier-Rolle) | Abnahmeprotokoll je Meileinstein |
| D2 | Abweichungen werden sichtbar statt still | offene Abweichungen mit Pfad und Grund | 4 dokumentiert (`PROJEKTPFADE.md` §5) | 0 unadressierte; jede entweder geschlossen oder mit Owner-Entscheid | Durchsicht der Abweichungsliste | Liste in `EXECUTION_PLAN-M0-M5.md` §1 |
| D3 | Kalender | — | **keine Kapazitätszusage vorhanden** | **nicht setzbar ohne D9** (Owner-Stunden/Woche) | Owner setzt D9; Plan rechnet dann | dieses Dokument, Kapitel 3 D9 |

**Klarstellung ohne Beschönigung:** Ein Liefertermin ist heute nicht seriös
nennbar. Es fehlen: Owner-Kapazität, Entscheidungsgeschwindigkeit, Vergleichswerte
aus einem früheren Build in diesem Repo. Wer hier „6 Wochen" schreibt, erfindet.

### 1.4 QUALITY SUCCESS — Mindestanforderungen

| # | Anforderung | Prüfbar durch | Ausgangswert | Zielwert |
|---|---|---|---|---|
| Q1 | Kein stiller Fehlschlag: jeder Fehlerzustand ist sichtbar | Fehlerinjektion (Modell nicht verfügbar, Mikrofon verweigert, Netz weg) → sichtbarer Zustand | nicht implementiert; Laufversuch 1 zeigte genau diesen Fehler **unsichtbar** für den Besucher (`MESSPROTOKOLL:30–33`) | 3 injizierte Fehler, 3 sichtbare, verständliche Zustände |
| Q2 | Zustand ist server-autoritativ und überlebt Reload | Reload-Probe nach jeder Zustandsänderung | nicht implementiert | 100 % der Zustandsfelder überleben Reload |
| Q3 | Übernommener Upstream-Code ist als solcher erkennbar und lizenziert | Verzeichnis `src/vendor/` mit Quelle + Lizenztext je Datei | 0 Dateien | jede Kopie hat `LICENSE`-Notiz + Quell-URL (MIT verlangt Copyright-Notiz, `ADR-0003`) |
| Q4 | Keine Secrets im Repo, keine ungefragte Aufnahme | `git ls-files`-Prüfung; Mikrofon nur nach Klick | keine Secrets (geprüft), Aufnahme-Verhalten unbekannt | 0 Secrets; Mikrofon-Aufnahme beginnt ausschließlich nach explizitem Klick |
| Q5 | Datenschutz vor öffentlichem Deploy entschieden | schriftliche Entscheidung zu Audio-/Transkript-Aufbewahrung | **offen** — nirgends behandelt (`tech/LUECKEN-2026-11-12.md:166–171`) | Entscheidung mit Datum **vor** M4-Deploy |
| Q6 | Der Repo-Check bleibt grün | `bash scripts/validate.sh` | grün (19.11., Exit 0) | nach jedem Meilenstein grün |
| Q7 | Mindestens 3 Smoke-Checks für den gebauten Ablauf | Skripte in `tests/`, einzeln ausführbar | 0 | 3 Checks: Text-Turn, Reload-Persistenz, stilles Hintergrund-Ergebnis |

### 1.5 OWNER SUCCESS — was Samuel selbst nachvollziehen und abnehmen muss

Maßstab ist nicht „Samuel hat gelesen", sondern **„Samuel kann es ohne Notizen
erklären und selbst verändern"** (Grundlage: `VISION-samuel.md:136–142` — kein
erfahrener Entwickler; das ist eine Design-Randbedingung, keine Schwäche).

| # | Fähigkeit | Nachweis (beobachtbar) | Wann fällig |
|---|---|---|---|
| O1 | Den Datenweg eines Text-Turns in eigenen Worten erklären: Absenden → Agent → Token → Typewriter | 5-Minuten-Teach-Back ohne Notizen; ich stelle 2 Rückfragen, Samuel antwortet | Ende M2 |
| O2 | Die Kopplung „ein Reglerwert → Aussehen **und** Haltung" erklären **und** die Zuordnung selbst ändern (eine Datei, geführt) | Samuel ändert eine Farb-/Tone-Zuordnung; Seite verhält sich danach anders; er erklärt vorher, was passieren wird | Ende M3 |
| O3 | Eine Messzeile lesen und deuten: was `first_audio_ms` misst und was **nicht** | Er erklärt den Unterschied zwischen lokalem Messwert und Produktionslatenz (`ADR-0001`, „Negativ") | Ende M1 |
| O4 | Den Fremdtest selbst durchführen und das Urteil selbst fällen | Er führt den Test durch und entscheidet bestanden/nicht bestanden, ohne dass ich es ihm sage | Ende M3 / M5 |
| O5 | Einen Deploy zurückrollen | Er rollt auf Anweisung zurück und erklärt, was dabei passiert | Ende M4 |
| O6 | Jede Nicht-Entscheidung als Nicht-Entscheidung erkennen | Er benennt in der Abnahme, welche Punkte offen sind, ohne dass ich sie ihm vorlese | jedes Gate |

**Regel für O1–O6:** Ein Gate, das nur ich bestehen kann, ist nicht bestanden.
Das ist die operative Bedeutung von „Owner kann abnehmen".

---

## 2 · SCOPE CONTRACT

### 2.1 Projektziel in einem Satz

**Agentfähig V1 macht in 20 Sekunden erlebbar, dass die Seite nicht über einen
Agenten berichtet, sondern sein Zustand ist: ein Besucher kommt an, die Augen
wachen auf, er schreibt einen Satz, der Agent antwortet sichtbar lebendig — und
auf die Frage des Agenten nach seinem Aussehen verändert sich die Seite **und**
seine Antwort-Haltung, während der Besucher zusieht.**

### 2.2 Verpflichtende Funktionen für V1

Quelle je Zeile: bestätigte Designentscheidung oder ADR. Nichts hier ist neu.

| ID | Funktion | Warum Pflicht | Beleg |
|---|---|---|---|
| F1 | Ankommen → Augen wachen nach ~5 s sanft auf | Erster Eindruck, „soft and not scary" | `DESIGN-DECISIONS.md:20`, `VISION-samuel.md:59–61` |
| F2 | Texteingabe ohne Formular/Enter-Denken; Antwort im Fokus als Typewriter (lebendig, wortlängen-abhängig) | Kern des Ablaufs | `DESIGN-DECISIONS.md:17–20` |
| F3 | Genau **ein** Regler, dessen Belegung im Gespräch entsteht; er verändert Aussehen **und** Haltung | Unterscheidet Erlebnis von Spielerei | `DESIGN-DECISIONS.md:22`, `ADR-0004` |
| F4 | Front-Agent plus **ein** Sub-Agent, dessen Ergebnis **still** über State-Sync erscheint | Beweist die These „die Welt läuft weiter, nur leiser" | `DESIGN-DECISIONS.md:23`, `PLAN-STUFEN-0-5.md:181` |
| F5 | Voice nach Klick, englische Pipeline | Bestätigt als Teil des Erstbaus | `DESIGN-DECISIONS.md:21,25` |
| F6 | Augen-Animation aus `EyeFace.js` (MIT) übernommen, nicht neu gebaut | Wiederverwendung vor Eigenbau | `ADR-0003` |
| F7 | Ein Fremder testet 20 s ohne Anleitung, bevor ausgebaut wird | Einzige Prüfung der eigentlichen Frage | `ADR-0005` |

### 2.3 Ausdrücklich ausgeschlossen aus V1

| Ausgeschlossen | Beleg |
|---|---|
| Zweiter und dritter Regler (Ausbaupfad 1 → 2/3 → max 3) | `PLAN-STUFEN-0-5.md:290`, `DESIGN-DECISIONS.md:22` |
| Zweiter Sub-Agent (Looking-up) | `PLAN-STUFEN-0-5.md:227–232` |
| Deutsche Stimme (geparkt, eigener Lauf + Provider-Entscheidung) | `DESIGN-DECISIONS.md:25` |
| Bild-/Bildeingang (`picture`) | `PLAN-STUFEN-0-5.md:177` (nur Text in V1) |
| Proaktives Nachsprechen des Agenten (T4) | `VISION-samuel.md:119–122` (Wunsch, eigener ADR bei Ausbau) |
| Pathways (`website/person/team/company`), Mandanten, `⟨Pay⟩` | `PLAN-STUFEN-0-5.md:204–217`, `INTENT-TECHNIK.md` T7/T9 |
| Chat-Verlauf mit Scroll-Historie als Hauptansicht | `ADR-0002` (Agent ist das Interface) |
| Analytics, A/B-Tests, SEO, Mehrsprachigkeit, Accounts, Persistenz über Besucher hinweg | keine Quelle im Repo — bewusst nicht aufgenommen |

### 2.4 Technische Qualitätsanforderungen (nicht verhandelbar)

Q1–Q7 aus Kapitel 1.4, plus: **eine** Zustandsquelle (kein zweiter Wahrheitspfad),
**jede** Übernahme fremden Codes lizenziert (Q3), **jede** Zahl im Protokoll ist
gemessen und nicht geschätzt (`MESSLAUF-PLAN.md:164`).

### 2.5 Verhandelbar (darf ohne Change Request fallen)

Reihenfolge der Bausteine innerhalb eines Meilensteins · Farbpalette und
Startposition des Reglers · Typewriter-Raten · Wortwahl der System-Prompts ·
Hosting-Ziel (eigene Domain vs. `workers.dev`) · welches freie Modell den
Front-Agent fährt (solange Latenz und Kosten im Rahmen bleiben) · ob der
Fremdtest aufgezeichnet oder nur protokolliert wird.

### 2.6 Nur mit Owner-Freigabe änderbar

| Gegenstand | Warum gesperrt |
|---|---|
| Scope aus 2.2/2.3 (Hinzufügen **oder** Streichen) | sonst kein messbarer Lieferbegriff |
| Die sieben Abnahmekriterien in Kapitel 1 | sonst verschieben sich die Gates |
| Plattform- und Providerwechsel (Cloudflare verlassen, TTS-Anbieter) | teuer und rückwirkend (`PLAN-STUFEN-0-5.md:215–217`: nur nach erneutem Messlauf) |
| Kostenpflichtige Dienste, Deploy auf `agentfähig.de`, öffentliche Ankündigung | harte Gates aus `AGENTS.md` |
| Datenschutz-/Aufbewahrungsentscheidung (Q5) | rechtlich, nicht technisch |
| Änderung eines ADR-Status | ADRs gehören dem Owner, nicht dem Agenten |
| Zielwerte V1–V6 | sie sind Vorschläge, keine Beschlüsse |

---

## 3 · Genehmigungspflichtige Entscheidungen

Jede Zeile ist eine Entscheidung, die **nur Samuel** treffen kann. Ohne sie
blockiert der jeweilige Meilenstein — nicht der Agent.

| ID | Entscheidung | Fällig vor | Wenn nicht entschieden |
|---|---|---|---|
| **D1** | ADR-0001 bis ADR-0005 **plus ADR-0006** (Zeitvertrag, neu am 19.11. abends): bestätigen / ändern / verwerfen | M0-Ende | Kein Design-Baseline; jeder Bau wäre gegen einen Vorschlag gebaut |
| **D2** | Lane + Mission/Lease für Agentfähig (welche Lane weicht, oder befristetes Capacity-Window) | M0-Ende | Kein rechtmäßiger Schreibpfad (heute DEGRADED); Orphan `M-20261119T194948-3db0ab44` blockiert neue Missionen |
| **D3** | Reihenfolge: Messlauf **vor** Skeleton (ADR-0001 wörtlich) **oder** parallel (Empfehlung, siehe CR-1) | M0-Ende | Entweder Stillstand oder stiller Bruch mit ADR-0001 |
| **D4** | Voice: Teil des ersten Durchstichs (`DESIGN-DECISIONS.md:21`) **oder** erst M4 (`PLAN-STUFEN-0-5.md:176–190` plant risikoärmer) | vor M2 | Widerspruch zwischen zwei freigegebenen Dokumenten bleibt offen |
| **D5** | Sprache des **Text**-Kanals: Deutsch oder Englisch (Voice ist englisch) | vor M2 | Typewriter-Texte und Prompts nicht schreibbar |
| **D6** | Erster Regler: Achse + Startwert | ✅ **beantwortet 19.11. abends** | entfällt — Beleg: `DESIGN-DECISIONS.md`, Zeilen „Erster Regler" (**warm ↔ cold**) und „Projektion der Gestalt" (feste, deterministische Regel zuerst); sichtbare Umgestaltung ist Teil des ersten Ablaufs |
| **D7** | Datenschutz: Aufbewahrung von Audio/Transkripten, Löschfrist, Hinweis an Besucher | vor M4-Deploy | Kein öffentlicher Betrieb vertretbar |
| **D8** | Kostenrahmen: Free-Plan bleiben? Paid? TTS-Anbieter mit Preisdeckel? | vor M4 | Jeder Modellwechsel ist eine unautorisierte Kostenentscheidung |
| **D9** | Kapazität: Owner-Stunden pro Woche für Review/Entscheidung/Fremdtest | vor Terminnennung | Kein Kalender möglich (Kapitel 1.3 D3) |

**Empfehlung zur Bündelung:** D1, D3, D4, D5 in **einer** Sitzung
(45–60 min). Sie hängen zusammen: Wer D1 beantwortet, hat D4/D5 schon halb
beantwortet. D2 ist ein 10-Minuten-Schritt danach. **D6 ist entfallen** (19.11.
abends beantwortet: warm ↔ cold), D7–D9 sind nicht sitzungsgebunden.

---

## 4 · Change Control

Jede neue Idee — auch eine gute — durchläuft drei Fragen, bevor sie Arbeit wird:

**A.** Ist sie notwendig, um ein **bereits genehmigtes** Akzeptanzkriterium aus
Kapitel 1 zu erfüllen?
**B.** Falls nein: Ist sie ein **eigener** Change Request mit eigenem Nutzen,
eigenem Aufwand und eigenem Gate?
**C.** Welches bestehende Arbeitspaket **entfällt oder verschiebt sich**, wenn sie
aufgenommen wird?

Ohne beantwortetes C wird nichts aufgenommen. „Machen wir später auch noch" ist
keine Antwort auf C. Format:

```
CR-NN | Was | A: nein/ja (welches Kriterium) | B: eigener CR? | C: was entfällt |
Entscheidung: offen / angenommen (Datum) / abgelehnt (Grund)
```

### Bereits anhängige Change Requests (aus dem Repo, nicht erfunden)

| CR | Inhalt | A | B | C | Status |
|---|---|---|---|---|---|
| **CR-1** | Messlauf (M1) parallel zum Skeleton (M2) statt davor — der Textpfad enthält kein STT/TTS, die Latenz misst also den Voice-Pfad (M4) | nein | ja | nichts entfällt; zwei disjunkte Writer (`tech/` vs. `src/`) | **offen → D3** |
| **CR-2** | Voice erst nach dem Fremdtest (M3) statt im ersten Durchstich | nein | ja | entfällt aus M2; `DESIGN-DECISIONS.md:21` müsste geändert werden | **offen → D4** |
| **CR-3** | Deutscher Text-Kanal neben englischer Stimme | nein | ja | nichts; betrifft nur Prompt + Typewriter-Inhalte | **offen → D5** |
| **CR-4** | Zweiter/„fünfter" Regler, „2 more when this" | nein | ja | entfällt: M3-Fertigstellung verzögert sich | **abgelehnt für V1** (`PLAN-STUFEN-0-5.md:290`) |
| **CR-5** | Deploy auf eigener Domain statt `workers.dev` | nein | ja | nichts, aber Q5/D7 werden vorgezogen | **offen → M4** |
| **CR-6** | Latenzziel hart auf 890 ms festlegen (Cloudflare-Beispielwert) | nein | ja | entfällt: Kriterium würde vor der Messung erfunden | **abgelehnt** (`MESSLAUF-PLAN.md:169–170`) |

---

## 5 · Was „fertig" hier nicht heißt

- **Nicht fertig, weil alle Tickets geschlossen sind.** Fertig heißt: das
  Artefakt existiert an einem Pfad, die Abnahmeprozedur wurde von jemandem
  **außer dem Autor** durchgeführt, und die Evidenz liegt im Repo.
- **Nicht fertig, weil der Agent es behauptet.** Kein Claim ohne Pfad
  (`AGENTS.md`, „Qualifikation und Promotion").
- **Nicht fertig, weil die Demo gut aussah.** Der Fremdtest ist das Gate, nicht
  die Meinung des Bauherrn (`ADR-0005`, „Negativ": Samuel ist der am
  schlechtesten geeignete Testfall).
- **Nicht fertig, weil die Zahl gut ist.** `first_audio_ms` aus `wrangler dev`
  ist ein lokaler Messwert, keine Produktionslatenz (`ADR-0001`, „Negativ").
