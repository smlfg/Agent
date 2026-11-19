# S2 — Agenten-Orchestrierung

Synergie-Kandidat: Die Skizze erfindet Agentenrollen (Front / Analysing / Looking-up / Backup); die Cloudflare-Recherche liefert Bausteine dafür (Sub-Agenten, Queues, Workflows, Durable Objects, Agents SDK).

Stand: 19.11.2026. Keine Repo-Änderung außer dieser Datei. Keine Technologie-Entscheidung — Optionen mit Kosten.

## Befund

Ein Auftrag, zwei Artefakte, eine offene Naht.

- **Ein Auftrag:** Beide Recherche-Briefs tragen die Rollen im Hintergrundabsatz (`tech/briefs/cloudflare-bausteine.md:12`, `tech/briefs/konkurrenz.md:12`). T3 in `tech/INTENT.md:21` fragt ausdrücklich nach ihrem Zusammenspiel.
- **Zwei Artefakte:** Die Rollen erscheinen als Bild (Skizze, `tech/CLOUDFLARE_MACHBARKEIT.md:31-36`), die Primitive als Menü (`tech/research/cloudflare-bausteine.md:202-215`).
- **Die Naht:** `tech/CLOUDFLARE_MACHBARKEIT.md` erwähnt „Queue" und „Workflow" **null Mal** (geprüft: `grep -n "Queue\|Workflow"` → keine Treffer), obwohl T3 Queues als Option nennt (`tech/INTENT.md:21`) und die Recherche sie für genau diesen Fall empfiehlt (`tech/research/cloudflare-bausteine.md:213-214`).

Die Rollen sind also nicht getrennt *gedacht*, aber getrennt *ausgearbeitet*: vier Namen ohne Semantik auf der einen Seite, vier Primitiven ohne Zuordnung auf der anderen.

## Der Anker

**Ein Task-Modell: der Auftrag, den der Front-Agent an einen Hintergrund-Agenten gibt — mit Eingabe, Ausgabe, Zustellweg des Ergebnisses und Verhalten bei Fehler oder Zeitüberschreitung.**

Warum genau das und nicht die drei anderen Kandidaten:

| Kandidat | Trägt der Text ihn? | Befund |
|---|---|---|
| **Nachrichtenformat** | Nein | Kein Dokument fordert ein Wire-Format. Der gewählte Weg (`subAgent`) ist ein typisierter RPC-Aufruf (`tech/CLOUDFLARE_MACHBARKEIT.md:59`, `tech/research/cloudflare-bausteine.md:106-108`), Ergebnisse kommen über Zustands-Sync (`:176-180`). Ein eigenes Nachrichtenformat wäre Zusatzarbeit ohne Forderung. |
| **Task-/Job-Modell** | **Ja** | T3 fragt „Wie reden Agenten untereinander … Wer hält den Zustand?" (`tech/INTENT.md:21`). Die Skizze fordert „no latency!" für die Kommunikation (`sketches/2026-11-12-agentfaehig.md:118-119`) — das ist eine Eigenschaft des Auftrags (blockiert er den Antwortweg?), keine des Transports. Und die Primitive unterscheiden sich genau entlang dieser Achsen. |
| **Rollen-Taxonomie** | Teilweise | Die vier Namen stehen (`sketches/:115-117`), aber ohne Eingabe/Ausgabe/Fehlerfall. Eine Taxonomie ohne Semantik ist eine Liste, keine Festlegung. Sie ist die *Instanz* des Task-Modells, nicht der Anker. |
| **Fähigkeits-Register** | Nein | Kein Dokument verlangt Discovery, Capability-Matching oder dynamische Rollenwahl. Alle Rollen sind statisch gezeichnet (`sketches/:121-129`). |

Der Anker ist entscheidungsrelevant, ohne dass ich entscheide: **Sub-Agent, Queue und Workflow sind nicht austauschbar, sondern unterscheiden sich an genau vier Stellen** — blockiert der Aufruf den Antwortweg, überlebt der Auftrag einen Absturz, wird er wiederholt, und wer erfährt vom Ergebnis (`tech/research/cloudflare-bausteine.md:104-119, 202-215`; `tech/CLOUDFLARE_MACHBARKEIT.md:59`). Ohne das Task-Modell ist die Bausteinwahl Raten mit guter Quellenlage.

Ein Bestandteil des Ankers ist bereits entschieden und darf nicht neu verhandelt werden: späte Ergebnisse dürfen still über die Zustands-Synchronisation erscheinen, der Agent muss nicht nachträglich sprechen (`tech/ABGLEICH.md:26`). Damit ist der **Zustellweg** für den langsamen Pfad festgelegt — und die Latenzforderung „no latency!" (`sketches/:118`) betrifft nur noch den Front-Pfad, nicht die Agent-zu-Agent-Kommunikation.

## Belege

| Stelle | Datei:Zeile | Inhalt |
|---|---|---|
| Rollen, Skizze | `sketches/2026-11-12-agentfaehig.md:115-117` | „User → Front man Agent" mit drei nachgelagerten Agenten: Analysing, Looking up, ⟨Backup⟩ |
| Rollen, Abschnitt | `sketches/:107` | Abschnitt „7 · Was der Agent können muss" (nicht 99-140; der Bereich 99-105 ist Abschnitt 6, Design) |
| Latenz auf der Kommunikation | `sketches/:118-119` | Doppelpfeil „Kommunikation"; „**no latency!** — under 1 sec even with TTS if possible" |
| Rolle unklar benannt | `sketches/:167` | ⟨Backup⟩ ist als unsichere Lesart geführt („Bachw"); die Rolle ist nicht gesichert |
| Multiagent unklar | `sketches/:112` | „⟨Opp M⟩" / „⟨Moltdegect⟩" (vermutlich „Multiagent") — auch der Oberbegriff ist ungesichert |
| Stack-Nennung | `sketches/:153` | „// 3 parts \| Cloudflare Agent SDK \| CSS!" |
| Anforderung T3 | `tech/INTENT.md:21` | „Front man Agent → Analysing / Looking up / Backup \| Wie reden Agenten untereinander (Durable Objects, RPC, Sub-Agenten, Queues)? Wer hält den Zustand?" |
| Rollen im Brief | `tech/briefs/cloudflare-bausteine.md:12` | „reicht Arbeit an langsamere Agenten weiter (Analyse, Nachschlagen, Backup)" |
| Rollen im Konkurrenz-Brief | `tech/briefs/konkurrenz.md:12` | „(Analyse, Nachschlagen)" — **Backup fehlt hier** |
| Konkurrenz als Latenz-Split | `tech/briefs/konkurrenz.md:25` | Gruppe 4 heißt „Front-Agent plus Hintergrund-Agenten (schnell/langsam getrennt)" — nicht „Rollen" |
| Verdrahtung, Bild | `tech/CLOUDFLARE_MACHBARKEIT.md:31-36` | Alle vier Agenten **innerhalb** eines „Durable Object pro Besucher"; `F -- subAgent --> A/L/BK` |
| Verdrahtung, Text | `tech/CLOUDFLARE_MACHBARKEIT.md:44-49` | „Der Front-Agent … ruft die drei nachgelagerten Agenten als Sub-Agenten auf. Deren Ergebnisse kommen über die Zustands-Synchronisation im Browser an" |
| Sub-Agent-Urteil | `tech/CLOUDFLARE_MACHBARKEIT.md:59` | „`this.subAgent(Klasse, name)`, Kinder auf derselben Maschine mit eigenem Speicher" — **machbar** |
| Queue/Workflow fehlen | `tech/CLOUDFLARE_MACHBARKEIT.md` | Kein Vorkommen von „Queue" oder „Workflow" in der ganzen Datei (eigener `grep`) |
| Sub-Agent, Recherche | `tech/research/cloudflare-bausteine.md:106-108` | „Parent/child DO composition via facets, nested routing, and typed parent lookup"; „Agenten als Tools" |
| Muster-Katalog | `tech/research/cloudflare-bausteine.md:109-111` | „sequential, routing, parallel, orchestrator, evaluator" |
| Workflows | `tech/research/cloudflare-bausteine.md:202-207` | Schritte mit automatischen Retries, `step.sleep()`, `waitForEvent` für Human-in-the-Loop |
| Queues | `tech/research/cloudflare-bausteine.md:209-215` | „selbst wenn der Front-Agent Antwort gibt, kann er Analyse-/Backup-Aufgaben in eine Queue legen" (`:213-214`) |
| RPC-Fehlerverhalten | `tech/research/cloudflare-bausteine.md:118` | „All RPC calls are asynchronous … and **propagate exceptions to the caller**" |
| DO-Grenzen | `tech/research/cloudflare-bausteine.md:266,269` | CPU 30 s pro Request; Soft-Limit 1.000 Requests/s pro Objekt |
| Konkurrenz, Gruppe 4 | `tech/research/konkurrenz.md:43-53` | Sechs Funde zu „Front-Agent plus Hintergrund-Agenten" — das Thema ist dort schon recherchiert |
| Deep Agents | `tech/research/konkurrenz.md:49` | Fünf Werkzeuge: `start_async_task`, `check_async_task`, `update_async_task`, `cancel_async_task`, `list_async_tasks` |
| OpenAI Agents SDK | `tech/research/konkurrenz.md:53` | „Agents as tools" und „Handoffs"; Orchestrierung per LLM oder per Code |
| Cloudflare Patterns | `tech/research/konkurrenz.md:48` | „das Routing-Beispiel ist die Skizze in Code. Die Worker sind unsere Analysing- und Looking-up-Agenten" |
| Hume = 3 Ebenen | `tech/research/konkurrenz.md:32` | „Genau die Drei-Ebenen-Logik der Skizze" (Interface/Agent/Worker) |
| „no latency" eingeordnet | `tech/research/konkurrenz.md:52` | „Die slow-Path-Ergebnisse laufen in derselben Antwort nach … Das ist die Form von ‚no latency!'" |
| Branchenstandard | `tech/research/konkurrenz.md:50` | „Das Muster ist keine Eigenlösung, sondern Branchenstandard." |
| Upstream-Verdict | `tech/UPSTREAM_SEARCH.md:17` | `cloudflare/agents` deckt T3 ab; Verdict **use** |
| Kein Eigenbau | `tech/UPSTREAM_SEARCH.md:28-36` | „Kein Eigenbau geplant." Entscheidung liegt bei Samuel, nicht bestätigt |
| Späte Ergebnisse | `tech/ABGLEICH.md:26` | Späte Ergebnisse dürfen still über Zustands-Sync erscheinen; die Frage „nachträglich sprechen" entfällt |
| Rolle nirgends entschieden | `docs/DESIGN-DECISIONS.md:31-41` | Offene Fragen enthalten keinen Punkt zu Rollen, Aufgaben oder Zuständigkeit |
| Offene Produktfrage | `docs/PROJECT.md:33` | „Welche Agent-Funktion benötigt einen echten Backend-Aufruf?" — unbeantwortet |
| Fehlerverhalten fehlt | `tech/LUECKEN.md:161-165` | „**Fehlerverhalten:** nicht festgelegt" |
| Lücke nicht als Lücke | `tech/LUECKEN.md:131-165` | Die Lückenliste „Was vor dem ersten Build fehlt" führt Rollen-Semantik **nicht** auf |
| Wurzel-Upstream | `UPSTREAM_SEARCH.md:5-11` | Need ist Graphify/Mesh, nicht Orchestrierung — **kein passender Kandidat hier** (geprüft, absichtlich leer) |
| Graph-Befund | `graphify-out/graph.json` (eigene Auswertung) | Hyperedges „Multi-Agent Kommunikationsmuster" und „Agent Architecture Flow" (4 Rollen) überschneiden sich mit „Async Agent Implementierungen" (3) und „Cloudflare Infrastructure Stack" (5) in **null** Knoten. `Front-Agent` und `Front man Agent` existieren als zwei Knoten. `Analysing Agent`, `Looking up agent`, `Backup Agent` sind nur der Skizze zugeordnet, obwohl sie auch in `tech/CLOUDFLARE_MACHBARKEIT.md:33-35` stehen. Reiner Befund, keine Kanten-Empfehlung. |

**Vollständigkeit der beteiligten Stellen:** Die im Auftrag genannten fünf Stellen stimmen, sind aber unvollständig. Fehlten: beide Recherche-Briefs (dort steht der gemeinsame Auftrag), `tech/UPSTREAM_SEARCH.md` (Verdict), `tech/ABGLEICH.md` (eine Teilfestlegung des Ankers), `tech/LUECKEN.md` und `docs/DESIGN-DECISIONS.md` (belegen die Lücke). Die Zeilenangabe „ca. 99-140" für die Agent-Architektur ist zu weit: betroffen ist Abschnitt 7, `sketches/:107-129`.

## Rollen vs Bausteine

Cloudflare-Primitive nach ihrer eigenen Beschreibung: Sub-Agent = Kind-DO mit eigenem Speicher, typisierter Aufruf (`tech/CLOUDFLARE_MACHBARKEIT.md:59`); Queue = garantierte Zustellung, Entkopplung, Dead Letter (`tech/research/cloudflare-bausteine.md:209-215`); Workflow = mehrstufig, Retry, `waitForEvent` (`:202-207`); DO = geteilter Zustand plus WebSocket (`tech/CLOUDFLARE_MACHBARKEIT.md:44-49`).

| Skizzen-Rolle | Was der Text über sie sagt | Passender Baustein | Wo es **nicht** passt |
|---|---|---|---|
| **Front man Agent** | „fast / slow", antwortet, hält den Kontakt (`sketches/:111,123`) | DO mit WebSocket + State-Sync; kleines Modell | Er darf **hinter keinem** Primitiv stehen: Queue und Workflow sind per Definition nachgelagert, das Modell ist mit 400–850 ms der größte Posten im Budget (`tech/CLOUDFLARE_MACHBARKEIT.md:73,81`). Der Front ist der einzige Agent ohne Bausteinwahl. |
| **Analysing Agent** | „live meta" · „want to change" (`sketches/:114`) — laut `tech/LUECKEN.md:61-62` ungeklärt | Am ehesten Kind-DO mit eigenem Zustand (laufende Aktualisierung) | **Workflows passen schlecht:** ein Workflow ist ein Lauf mit deterministischem Replay und Ende; „live meta, want to change" klingt nach fortlaufender Beobachtung. Queue passt ebenfalls schlecht, wenn Zwischenstände mehrfach ankommen sollen. |
| **Looking up agent** | Nachschlagen; Wissensquelle T8 (`tech/INTENT.md:26`), `sketches/:117` mit „? ? Pay?" | Queue (einmalig, wiederholbar, Dead Letter) oder Sub-Agent; darunter AI Search / Vectorize | Nichts. Das ist die einzige Rolle, die auf allen drei Primitiven plausibel sitzt — und genau deshalb die einzige, bei der die Wahl wirklich offen ist. |
| **⟨Backup⟩** | Nur der Name; Lesart unsicher (`sketches/:167`) | **keiner** | Die Rolle ist nicht definiert. Liest man „Backup" als Ausweichpfad (Modell-Fallback, Ersatzantwort), dann ist das eine **Routing-Eigenschaft des Front-Agenten** (`tech/research/cloudflare-bausteine.md:335-341`, AI Gateway mit Modell-Fallback), kein fünfter Agent. Als eigener Agent wäre sie ein Baustein ohne Aufgabe. |

**Was das heißt:** Drei der vier Rollen sind keine Agenten im technischen Sinn, sondern **Eigenschaften des Front-Agenten** (Antwortweg, Routing, Fallback). Nur Analysing und Looking-up tragen echte Hintergrundarbeit. Die Skizze zeichnet vier Kästen, die Technik braucht zwei plus Regeln am Front. Das ist kein Widerspruch zur Skizze — die Zeichnung ist eine Absichtsskizze —, aber es ist die Stelle, an der ein ungeprüfter Bau vier Agenten anlegt, wo zwei genügen, und damit dreimal die Fehler- und Kostengrenzen eines eigenen DO erbt (`tech/research/cloudflare-bausteine.md:258-274`).

Zweiter Punkt: `tech/CLOUDFLARE_MACHBARKEIT.md:31-36` zeichnet die drei Kinder **innerhalb** des Besucher-DO. Die zitierte Quelle (`:59`) sagt aber „Kinder … mit eigenem Speicher", also eigene DOs. Das Bild ist eine Vereinfachung, die die DO-zu-DO-Grenze verdeckt — und mit ihr die Kosten und die Fehlerfortpflanzung (`tech/research/cloudflare-bausteine.md:118`: RPC-Exceptions erreichen den Aufrufer).

## Konflikte

1. **Queue vs. Sub-Agent — offen und unbemerkt.** Die Recherche sagt, Queues passen für Analyse- und Backup-Aufgaben (`tech/research/cloudflare-bausteine.md:213-214`). Die Machbarkeit wählt `subAgent` (`tech/CLOUDFLARE_MACHBARKEIT.md:59`) und nennt Queues gar nicht. Beide Dokumente stammen aus derselben Mission, demselben Tag. Das ist der härteste Beleg für zwei Stränge — und niemand hat den Widerspruch bisher aufgeschrieben, auch `tech/LUECKEN.md:103-129` nicht.

2. **Rollen-Semantik fehlt, nicht die Rollen.** Die Namen sind von der Skizze in die Technik gewandert (`sketches/:115-117` → `tech/INTENT.md:21` → `tech/CLOUDFLARE_MACHBARKEIT.md:33-35`), die Bedeutung nicht. ⟨Backup⟩ ist sogar als unsichere Lesart markiert (`sketches/:167`). `tech/LUECKEN.md:161-165` notiert fehlendes Fehlerverhalten, führt aber „was ist ein Auftrag" nicht als Lücke — die Lücke ist selbst nicht erfasst.

3. **Backup fällt still aus dem zweiten Brief.** `tech/briefs/cloudflare-bausteine.md:12` nennt drei Hintergrundrollen inklusive Backup; `tech/briefs/konkurrenz.md:12` nennt nur „Analyse, Nachschlagen". Der Rollensatz ist zwischen den beiden Arbeitern schon nicht mehr derselbe.

4. **4 Rollen vs. 3 Ebenen vs. 2 Agenten vs. Werkzeugliste.** Skizze: 4 Agenten (`sketches/:115-117`). Hume: 3 Ebenen, ausdrücklich als „genau die Drei-Ebenen-Logik der Skizze" gelesen (`tech/research/konkurrenz.md:32`). Stimm: 2 (Voice + Supervisor, `:29`). OpenAI SDK: 1 Manager + Spezialisten als Werkzeuge (`:53`). Cloudflares Pattern-Katalog: Orchestrator-Workers (`tech/research/cloudflare-bausteine.md:109-111`). **Vier Dokumente, vier Zahlen, keine Begründung für die vierte Rolle.** Das ist kein Fehler der Recherche — es ist die unbeantwortete Frage, was „Backup" leisten soll.

5. **Baut Agentfähig ein Framework nach?** Nein — und das ist begründet, nicht behauptet. `tech/UPSTREAM_SEARCH.md:17` vergibt für `cloudflare/agents` das Verdict **use** und deckt T3 damit ab; `:28-36` sagt „Kein Eigenbau geplant". Die Konkurrenz-Recherche stützt das: das Muster ist „keine Eigenlösung, sondern Branchenstandard" (`tech/research/konkurrenz.md:50`). Der verbleibende Nachbaurisiko liegt **nicht im Code, sondern im Vokabular**: Wenn die vier Rollen als eigene Architektur behandelt werden, obwohl sie sich als `agents-as-tools` mit vier Werkzeugnamen abbilden lassen (`:53`, `tech/research/cloudflare-bausteine.md:106-108`), entsteht eine Eigenarchitektur ohne eigenen Gegenstand. Das ist die eigentliche Gefahr — nicht ein nachgebautes SDK.

6. **Kein Widerspruch, aber eine verschobene Anforderung.** „no latency!" steht in der Skizze auf dem Doppelpfeil *Kommunikation* (`sketches/:118`). Diese Anforderung ist durch die bestätigte Entscheidung in `tech/ABGLEICH.md:26` bereits entwertet: späte Ergebnisse erscheinen still. Die Skizze fordert also an einer Stelle etwas, das das Design schon aufgegeben hat — gut, aber es steht nirgends, dass die Anforderung damit erledigt ist.

## Kosten des Verpassens

**S1 — Latenzbudget wird zweimal ausgegeben.** Wird das Bild aus `tech/CLOUDFLARE_MACHBARKEIT.md:31-36` wörtlich gebaut („F ruft die drei als Sub-Agenten auf", `:47-49`), liegt der Analyse-Aufruf im Antwortweg des Front-Agenten. Das Budget ist 400 ms Modell / 800–950 ms bis zum ersten Audio (`:73-74`), der Front ist mit 400–850 ms schon der größte Posten (`:81`). Ein wartender Sub-Agent addiert einen zweiten Modellaufruf. Ergebnis: die einzige messbare Anforderung (`first_audio_ms`) fällt durch — und zwar aus einem strukturellen Grund, nicht durch Modellwahl. Die Reparatur ist Umbau des Transportwegs samt Ergebnispfad, keine Parameteränderung.

**S2 — Zwei Wege für späte Ergebnisse, die sich überholen.** Wird später auf Queue umgestellt (weil `tech/research/cloudflare-bausteine.md:213-214` recht hat), hat der Queue-Consumer keinen Parent, der den DO-Zustand setzt: die Zustellung an den Browser (`tech/CLOUDFLARE_MACHBARKEIT.md:48-49`) muss neu gebaut werden, parallel zum bestehenden Sub-Agent-Pfad. Zwei Ergebniswege, ein Zustand — und die bestätigte Entscheidung „späte Ergebnisse erscheinen still" (`tech/ABGLEICH.md:26`) hat in diesem Aufbau keinen benannten Eigentümer. Kosten: doppelte Zustellogik plus eine Race, die nur im Betrieb auffällt.

**S3 — Ein Hintergrundfehler wird zum Besucherfehler.** Ohne definierten Fehlerfall gilt das Default-Verhalten: RPC-Exceptions erreichen den Aufrufer (`tech/research/cloudflare-bausteine.md:118`). Ein langsamer oder scheiternder Analysing-Agent erscheint dann als Fehler beim Besucher, obwohl dessen Antwort schon lief. `tech/LUECKEN.md:161-165` hält fest, dass Fehlerverhalten nirgends festgelegt ist — bei einem einzelnen Agenten ist das eine Lücke, bei vier verketteten ist es ein Ausfallpfad. Und `docs/PROJECT.md:33` („Welche Agent-Funktion benötigt einen echten Backend-Aufruf?") wird unbeantwortbar, weil im Zweifel jede Rolle einen bekommt.

## Verankerung

**Ziel: `tech/INTENT.md`, Zeile 21 (T3) — gestützt auf eine neue Tabelle in `docs/`.**

T3 ist der richtige Ort, weil dort die Anforderung steht, die den ganzen Strang aufspannt, und weil T3 heute nur nach dem *Wie des Redens* fragt („Durable Objects, RPC, Sub-Agenten, Queues"), nicht nach dem *Was des Auftrags*. Solange die Zeile so formuliert bleibt, zieht sie jede Antwort auf die Transportfrage — genau das ist in `tech/CLOUDFLARE_MACHBARKEIT.md` passiert, wo die Bausteinwahl steht und die Aufgabenbeschreibung fehlt. Die Tabelle selbst gehört nach `docs/`, weil sie eine Produktfrage ist: welche Rolle was tut, entscheidet der Owner, nicht die Recherche (`AGENTS.md:41-42` verbietet, Architektur aus der Skizze abzuleiten; `docs/DESIGN-DECISIONS.md:31-41` führt diese Frage bisher nicht). `tech/INTENT.md` verweist dann auf die Tabelle, statt sie zu duplizieren. Kosten: eine Tabelle, vier Zeilen, kein Code, keine Technologieentscheidung — und `tech/CLOUDFLARE_MACHBARKEIT.md:102-108` (die Latenzmessung) bleibt davon unberührt.

## Urteil

**ECHTE SYNERGIE — mit einer unausgearbeiteten Naht.**

Begründung: Es ist ein Auftrag (beide Briefs tragen die Rollen), es ist ein Produkt (die Rollen sind in der Skizze erfunden, nicht aus Cloudflare abgeleitet), und die Bausteine passen strukturell — drei von vier Rollen sitzen auf einem benennbaren Primitiv. Kein `THEMENVERWANDT`: die Rollen sind keine Metapher, sie kommen in derselben Mission als Anforderung T3 wieder. Kein `WIDERSPRUCH`: der eine harte Gegensatz (Queue vs. Sub-Agent) ist eine offene Wahl, kein sich ausschließender Satz. Die Naht ist, dass die Rollen als Bild und die Primitive als Menü existieren und `tech/CLOUDFLARE_MACHBARKEIT.md` die beiden Menüpunkte gar nicht nennt, die die Recherche für diesen Fall empfiehlt.

Grenze des Urteils: Kein Dokument definiert, was ein Auftrag zwischen den Agenten ist. Diese Aussage stützt sich auf Abwesenheit (Volltextsuche in `tech/`, `docs/`, `sketches/`) — Abwesenheit ist schwächer belegt als ein Zitat. Sollte eine Definition außerhalb dieses Repos liegen (Owner-Rechner, `notion/`), ist der Befund teilweise überholt; `notion/README.md:27-35` beschreibt die Notion-Spur jedoch als leer.

## Ein nächster Schritt

**Eine Tabelle „Rolle → Auftrag" mit vier Zeilen in `docs/`, vor jedem Bau. Prüfbar, nicht diskutierbar.**

Spalten, je Rolle (`Front`, `Analysing`, `Looking up`, `Backup`):

1. **Eingabe** — was die Rolle bekommt (Text, Bild, Suchbegriff, nichts).
2. **Ausgabe** — was zurückkommt (Text, Treffer, Zustandsänderung).
3. **Blockiert den Antwortweg?** — `ja` / `nein`. Pflicht, keine leere Zelle.
4. **Zustellweg des Ergebnisses** — im Antwortstrom / Zustands-Sync / gar nicht.
5. **Fehlerfall** — was der Besucher sieht, wenn die Rolle scheitert oder zu lange braucht (ein Satz).

**Überprüfbar durch:** Zwei Personen, die die Tabelle allein lesen, entscheiden für jede Rolle unabhängig gleich, ob sie im Antwortweg liegt. Weichen sie ab, ist die Zeile nicht fertig. Zusätzlich muss jede Zeile eine der drei Cloudflare-Optionen mechanisch nach sich ziehen (blockiert → DO-Aufruf; nein + einmalig + wiederholbar → Queue; nein + mehrstufig + Freigabe → Workflow; nein + fortlaufend → Kind-DO) — ohne dass jemand nach Geschmack wählt.

**Zulässiges Ergebnis:** Die Zeile `Backup` bleibt leer oder wird als „kein Agent — Fallback im Front" gestrichen. Das ist kein Scheitern, sondern die Auflösung einer unsicheren Lesart (`sketches/:167`).

---

**Kurzantwort (5 Zeilen):**
- **Anker:** ein Task-Modell (Auftrag Front → Hintergrund: Eingabe, Ausgabe, Zustellweg, Fehlerfall) — nicht Nachrichtenformat, nicht Rollen-Taxonomie.
- **Rollen-Delta:** 3 der 4 Rollen brauchen kein Primitiv (Front = DO, Backup = Fallback-Regel); echte Hintergrundarbeit nur bei Analysing (fortlaufend → Kind-DO, nicht Workflow) und Looking-up (Queue passt).
- **Wichtigster Konflikt:** `tech/CLOUDFLARE_MACHBARKEIT.md` wählt `subAgent` und nennt Queues null Mal, während die Recherche Queues für genau diesen Fall empfiehlt (`cloudflare-bausteine.md:213-214`).
- **Verankerungsziel:** `tech/INTENT.md:21` (T3) auf ein Task-Modell umformulieren, Tabelle in `docs/`.
- **Urteil:** ECHTE SYNERGIE mit unausgearbeiteter Naht.
