# S8 — Harte Anforderungen und ihre Kollisionen

Stand: 19.11.2026, 16:15 · read-only Prüfung des Repo-Stands · **nur diese Datei neu angelegt.**

**Prüfgegenstand:** alle Aussagen mit Anforderungscharakter in
`sketches/2026-11-12-agentfaehig.md` (maßgeblich), `Idea`, `Agentfähig/GreateWriting.txt`
(nicht verbindlich), `docs/PROJECT.md`, `docs/DESIGN-DECISIONS.md`, `tech/INTENT.md`,
`tech/ABGLEICH.md`, `tech/CLOUDFLARE_MACHBARKEIT.md`, `tech/LUECKEN.md`,
`tech/research/*.md`, `tech/briefs/*.md`, `tech/UPSTREAM_SEARCH-cloudflare.md`, `UPSTREAM_SEARCH.md`, `AGENTS.md`.

**Nicht mein Gegenstand:** technische Machbarkeit (Parallel-Prüfer), Synergie-Kandidaten
(Parallel-Prüfer), Empfehlungen. Ich formuliere Entscheidungsfragen, keine Antworten.

## Belegregel und ein Befund vorab

- Jede Zeile braucht zwei belegte Stellen mit `Datei:Zeile`. Wo nur eine Stelle existiert,
  steht sie unter „Einzelquellen-Risiko", nicht unter „Kollisionen".
- **Wichtig für die Lesbarkeit aller Zeilenangaben:** `docs/` wurde am 19.11.2026 fortgeschrieben
  (Produktklärungen), `tech/` steht weiterhin auf Stand 12.11.2026. Ich zitiere den Stand von
  19.11.2026, 16:10. `tech/UPSTREAM_SEARCH.md` heißt inzwischen
  `tech/UPSTREAM_SEARCH-cloudflare.md`; das alte `UPSTREAM_SEARCH.md` in der Wurzel ist die
  Graphify-Suche und hat mit dem Produkt nichts zu tun.
- Folge daraus, der wichtigste Einzelbefund: **mehrere Kollisionen sind keine Designstreitigkeiten,
  sondern Stände-Risse.** `tech/ABGLEICH.md` und `tech/LUECKEN.md` beschreiben Entscheidungen als
  offen, die `docs/DESIGN-DECISIONS.md` am 19.11. bereits getroffen hat (siehe K25).

---

## 1 · Harte Anforderungen

Kategorien: Latenz · Runtime · Datenschutz · Kosten · Scope · UX · Technologie · Prozess.

### Aus der Skizze (maßgeblich)

| ID | Wortlaut (kurz) | Quelle Datei:Zeile | Kategorie |
|---|---|---|---|
| A01 | „Not a website — an Agent itself" | `sketches/2026-11-12-agentfaehig.md:24` | Scope |
| A02 | Drei Eingänge, Pfeil nach oben: `voice`, `text`, `picture` | `sketches/…:25` | Scope |
| A03 | Der Agent „asks the user for what it should look like": `colour` · `form` · `output style` | `sketches/…:26-27` | UX |
| A04 | „Einziges sichtbares Bedienelement: `sliders`" | `sketches/…:28` | UX |
| A05 | „after 5 seconds some eyes wake up and 'look at the user'" | `sketches/…:35` | UX |
| A06 | `Pathways`: „user decides where the 'call' is going to" | `sketches/…:36-37` | Scope |
| A07 | `product` → `for X`: `for website` · `for person` · `for team` · `for company` | `sketches/…:41-52` | Scope |
| A08 | „nicht bevormundend" | `sketches/…:65` | UX |
| A09 | „soft and not scary" (Augen) | `sketches/…:75` | UX |
| A10 | Wecksignale „after click", „mouse move" | `sketches/…:81` | UX |
| A11 | „1 message" | `sketches/…:82` | UX |
| A12 | „2/3", „max 3" (drei Slider) | `sketches/…:83-84` | UX |
| A13 | „clear word", „real time effects" | `sketches/…:84` | UX |
| A14 | „maybe 5 options but only show 3" | `sketches/…:105` | UX |
| A15 | „fast / slow" | `sketches/…:111` | Runtime |
| A16 | „no latency!" | `sketches/…:118` | Latenz |
| A17 | „under 1 sec even with TTS if possible" | `sketches/…:119` | Latenz |
| A18 | „Cloudflare Agent SDK", „CSS!" als Bausteine | `sketches/…:153` | Technologie |
| A19 | „HAI Interaction → can be visible" (mit „Connect effect") | `sketches/…:154` | UX |
| A20 | „popups move 'when … is …'" | `sketches/…:155` | UX |

### Aus den bindenden Projektdateien (19.11.2026)

| ID | Wortlaut (kurz) | Quelle Datei:Zeile | Kategorie |
|---|---|---|---|
| A21 | „Der Mensch gibt den Intent; der Agent reagiert darauf." | `docs/DESIGN-DECISIONS.md:12` | UX |
| A22 | Präsenz vor dem Intent: Augen/Bewegung „sanft, minimal, unaufregend" | `docs/DESIGN-DECISIONS.md:13` | UX |
| A23 | „Ohne hörbaren Ton: Antwort auch als Text; eine sanfte visuelle Reaktion signalisiert die Antwort." | `docs/DESIGN-DECISIONS.md:14` | UX |
| A24 | Aktuelle Antwort bleibt sichtbar, ältere „beim Scrollen sichtbar" | `docs/DESIGN-DECISIONS.md:15` | UX |
| A25 | „Neue Antwort steht im Fokus"; alte Leseposition halten wurde abgelehnt | `docs/DESIGN-DECISIONS.md:16` | UX |
| A26 | Typewriter „lebendig und pulsierend, nicht bloß gleichmäßig" | `docs/DESIGN-DECISIONS.md:17` | UX |
| A27 | „Kurze Wörter schnell; bei längeren Wörtern auch langsameres Zeichentempo" | `docs/DESIGN-DECISIONS.md:18` | UX |
| A28 | Erstablauf: Augen nach „etwa 5 Sekunden", „eine Textnachricht", Typewriter im Fokus, „Hintergrund-Ergebnisse erscheinen still" | `docs/DESIGN-DECISIONS.md:20` | UX |
| A29 | „Text zuerst; Mikrofon wird erst nach Klick freigegeben. Damit ist Voice Teil des Erstbaus" | `docs/DESIGN-DECISIONS.md:21` | Scope |
| A30 | „Erste Version mit genau einem Regler"; Belegung „entsteht im Gespräch: der Agent erfragt sein Aussehen"; Ausbaupfad 1 → 2/3 → max 3 | `docs/DESIGN-DECISIONS.md:22` | Scope |
| A31 | Front-Agent = „echter Duplex-Sprachagent"; dahinter echte Analysing/Looking-up-Agenten; Ergebnisse „still über State-Sync" | `docs/DESIGN-DECISIONS.md:23` | Runtime |
| A32 | „Messlauf als Gate vor dem Erstbau": 20 deutsche Sprach-Wechsel, `first_audio_ms` | `docs/DESIGN-DECISIONS.md:24` | Prozess |
| A33 | „Latenz-Kriterien aus den Messwerten ableiten, nicht vorab erfinden" | `docs/DESIGN-DECISIONS.md:67-68` | Prozess |
| A34 | „Bis zu drei gleichzeitig sichtbare Slider sind eine Designidee." | `docs/PROJECT.md:15` | UX |
| A35 | „Reaktion unter einer Sekunde, möglichst einschließlich TTS, als Wunschziel." | `docs/PROJECT.md:20` | Latenz |
| A36 | „Cloudflare Agent SDK und CSS als technische Ansatzpunkte." | `docs/PROJECT.md:21` | Technologie |
| A37 | GreateWriting: „nicht automatisch Anforderungen oder verifizierte Fakten" | `docs/PROJECT.md:25-26` | Prozess |
| A38 | Cloudflare ist „die genannte technische Richtung"; Implementierung „noch nicht festgelegt" | `docs/PROJECT.md:9-10` | Prozess |
| A39 | „Keine Framework-, Hosting- oder Modellentscheidung als bestätigt darstellen, solange sie nur aus einer Skizze abgeleitet ist." | `AGENTS.md:41-42` | Prozess |
| A40 | „Die Webseite selbst [ist] ein fetter Agent"; „Voice, Text, Context, Skills" | `Idea:00:01:21`, `Idea:00:01:46` | Scope |

### Aus tech/ und den Briefs (12.11.2026)

| ID | Wortlaut (kurz) | Quelle Datei:Zeile | Kategorie |
|---|---|---|---|
| A41 | „Plattform: Cloudflare" als Rahmenbedingung; Andockpunkt `claudeflareworkerhaus`, unangetastet | `tech/INTENT.md:31-33` | Technologie |
| A42 | „Kein eigener Code." Upstream zuerst, mindestens drei Kandidaten Pflicht | `tech/INTENT.md:34-35` | Prozess |
| A43 | „Schreibbereich: nur `tech/`" | `tech/INTENT.md:38` | Prozess |
| A44 | „Jeder Besucher bekommt einen eigenen Agenten"; „eine einzige WebSocket-Verbindung" | `tech/CLOUDFLARE_MACHBARKEIT.md:44-45` | Runtime |
| A45 | „under 1 sec even with TTS" ist die „genau eine offene Anforderung"; Urteil **unklar** | `tech/CLOUDFLARE_MACHBARKEIT.md:8-10,58` | Latenz |
| A46 | 20 Anfragen/min je Konto und Modell für bezahlte Textmodelle; „Für eine öffentliche Startseite wäre das eng" | `tech/CLOUDFLARE_MACHBARKEIT.md:97` | Kosten |
| A47 | „Kein Eigenbau geplant"; Augen/„on wind"/Connect-Effekt = Frontend-Gestaltung, nicht Teil der Suche | `tech/UPSTREAM_SEARCH-cloudflare.md:34-36` | Prozess |
| A48 | „Keine Vorlage für den Kern der Idee" (Agent gestaltet eigene Seite per Regler live) | `tech/CLOUDFLARE_MACHBARKEIT.md:100` | Technologie |
| A49 | „Der Besucher spricht, tippt oder zeigt ein Bild"; Front-Agent antwortet „in unter einer Sekunde (auch mit Sprachausgabe)" | `tech/briefs/cloudflare-bausteine.md:10-11` | Latenz |
| A50 | „über höchstens drei Schieberegler" | `tech/briefs/cloudflare-bausteine.md:13` | UX |
| A51 | „höchstens drei Slider" (Skizze 81–85 gedeutet) | `research/SCOUT-SYNTHESIS.md:11` | UX |
| A52 | Keine Preise in der Recherche; nur „ob ein Baustein den bezahlten Workers-Plan braucht" | `tech/briefs/cloudflare-bausteine.md:38-39`, `tech/briefs/konkurrenz.md:34` | Kosten |
| A53 | Messlauf braucht „Plan-Modus und Freigabe des Owners" | `tech/CLOUDFLARE_MACHBARKEIT.md:108` | Prozess |
| A54 | Slogan ist deutsch; `flux`/`aura-1` auf Deutsch ungeprüft | `tech/CLOUDFLARE_MACHBARKEIT.md:98` | Runtime |
| A55 | `plaud thoughts →` als Wissensquelle (T8) | `sketches/…:136`, `tech/INTENT.md:26` | Datenschutz |
| A56 | „Sichtbare HAI-Interaktion und unmittelbare Effekte der Designregler" | `docs/PROJECT.md:22` | UX |

### Aus GreateWriting (ausdrücklich nicht verbindlich, A37)

| ID | Wortlaut (kurz) | Quelle Datei:Zeile | Kategorie |
|---|---|---|---|
| A57 | „Input UI (dying): Forms, drop-downs, hamburger menus, settings toggles." | `Agentfähig/GreateWriting.txt:139` | UX |
| A58 | „The 'button' dies. The 'pixel' remains." | `GreateWriting.txt:141` | UX |
| A59 | Chat „becomes optional. The emergency exit, not the main entrance." | `GreateWriting.txt:152` | UX |
| A60 | „the system observes continuously … and acts when needed without being asked" | `GreateWriting.txt:106` | UX |
| A61 | „Silent operation becomes the primary interface"; „assume the system worked unless informed otherwise" | `GreateWriting.txt:207,209` | UX |
| A62 | Personalisierung = „picking a dark mode or a color theme … decoration, not adaptation" | `GreateWriting.txt:222` | UX |
| A63 | Deliverable ist „an algorithm that generates a bespoke experience for a user of one" | `GreateWriting.txt:229` | UX |
| A64 | „High intelligence systems generate measurable absence" | `GreateWriting.txt:283-284` | UX |
| A65 | „Pricing the outcome … Pay $0.5/meeting" | `GreateWriting.txt:307-311` | Kosten |
| A66 | „You cannot have 'anticipatory design' without total surveillance" | `GreateWriting.txt:318` | Datenschutz |
| A67 | „Screens are a phase"; „scaffolding comes down" | `GreateWriting.txt:119,131` | Scope |

---

## 2 · Kollisionen

Art: **Wert** (zwei Zahlen), **Ziel** (zwei Absichten), **Ausschluss** (eines verbietet das andere),
**Begriff** (gleiches Wort, zwei Bedeutungen). „Wenn man es beim Bauen merkt" = das konkrete Symptom.

### Latenz

| K-ID | A (ID) | B (ID) | Art | Warum unvereinbar | Entscheidungsfrage an den Owner | Wenn man es beim Bauen merkt |
|---|---|---|---|---|---|---|
| K01 | A17 „under 1 sec even with TTS if possible" (`sketches/…:119`), A49 (`tech/briefs/cloudflare-bausteine.md:11`), A45 | A33 „Latenz-Kriterien aus den Messwerten ableiten, nicht vorab erfinden" (`docs/DESIGN-DECISIONS.md:67-68`), A35 „Wunschziel" (`docs/PROJECT.md:20`) | Wert | Drei Verbindlichkeitsgrade für dieselbe Zahl: Skizze mit Konditional („if possible"), Brief als Fakt ohne Konditional, Projektdatei als „Wunschziel", Entscheidungsdatei verbietet ein Kriterium vor der Messung. Ein Abnahmekriterium kann nicht gleichzeitig 1 s lauten und erst nach der Messung entstehen. | Gilt „1 s inklusive Sprachausgabe" als Abnahmekriterium des Erstbaus, oder entsteht das Kriterium erst aus den 20 Messwerten? | Der Messlauf liefert z. B. `first_audio_ms` 950 und `total_ms` 1200; niemand kann sagen, ob das „bestanden" ist. Der Erstbau gilt als fertig und die Frage wandert in die Nachpolitik. |
| K02 | A17/A45: 1 s **inklusive** TTS | A23 „Ohne hörbaren Ton: Antwort auch als Text" (`DESIGN-DECISIONS.md:14`), `tech/ABGLEICH.md:28` „Text ist der Grundweg, Stimme die Zugabe" | Ziel | Wenn Stimme „Zugabe" ist, darf sie das Latenzziel des Grundwegs nicht mitbestimmen; wenn Voice „Teil des Erstbaus" ist (A29) und die 1 s inkl. TTS gelten (A17, A45), ist Stimme kein Zusatz, sondern der kritische Pfad. Beide Sätze stehen gleichzeitig im Material. | Ist Stimme im Erstbau ein gleichrangiger Kanal mit eigenem Latenzanspruch, oder ein Zusatz, der die Textlatenz nicht gefährden darf? | Der Front-Agent wird als Voice-Pipeline gebaut (A31), die Text-Anzeige hängt aber an derselben Kette; bei Verzögerung wird die Textantwort langsamer als nötig, weil die TTS-Satzgrenzen den Takt geben. |
| K03 | A27 Wortrhythmus nach Wortlänge (`DESIGN-DECISIONS.md:18`) | A17/A35: Antwort unter 1 s (`sketches/…:119`, `PROJECT.md:20`) | Ziel | `tech/ABGLEICH.md:32` hält fest: der Wortrhythmus „setzt voraus, dass ganze Wörter vorliegen, bevor sie erscheinen. Kostet pro Wort eine kleine Verzögerung." Damit ist der erste sichtbare Text systematisch später als das erste Token. | Zählt die Sekunde bis zum ersten **Zeichen** oder bis zum ersten **vollständigen Wort**? | Das erste Wort erscheint bei ~1,1 s, obwohl das Modell bei 0,4 s lieferte. Die Latenzmessung (Token-Zeit) und das Nutzererlebnis (Wort-Zeit) widersprechen sich dauerhaft in jedem Dashboard. |
| K04 | A44 „eine einzige WebSocket-Verbindung" (`CLOUDFLARE_MACHBARKEIT.md:45`) | `CLOUDFLARE_MACHBARKEIT.md:75` „Für Echtzeit-Gespräche sei WebRTC ‚the better choice'"; WebSocket-Chunking „becomes the latency floor" (`tech/research/cloudflare-bausteine.md:318-321`), Ausweichpfad `realtime-examples` (`UPSTREAM_SEARCH-cloudflare.md:23`) | Technologie | Das Architekturbild setzt eine Technik fest, die die zitierte Plattform selbst für den Latenzfall nicht empfiehlt, während die Latenz das offene Kriterium ist (A45). Man kann nicht gleichzeitig „eine WebSocket-Verbindung" als Aufbau und „1 s inkl. TTS" als Ziel führen, ohne den Transport zur Variable zu machen. | Bleibt WebSocket gesetzt (einfacher, ein Upstream) und die Latenz wird zur Folge, oder wird der Transport (WebRTC) zum Entscheidungsgegenstand des Erstbaus? | Der Messlauf besteht auf WebSocket, danach stellt jemand fest, dass der Latenz-Floor schon im Chunking liegt; der Transportwechsel wird zum Umbau mitten im Erstbau. |

### Slider und sichtbare Bedienung

| K-ID | A (ID) | B (ID) | Art | Warum unvereinbar | Entscheidungsfrage an den Owner | Wenn man es beim Bauen merkt |
|---|---|---|---|---|---|---|
| K05 | A30 „genau einem Regler" (`DESIGN-DECISIONS.md:22`) | A34 „bis zu drei gleichzeitig sichtbare Slider" (`PROJECT.md:15`), A50 „höchstens drei" (`briefs/cloudflare-bausteine.md:13`), A12 „max 3" (`sketches/…:84`) | Wert | Zwei bindende Dateien desselben Tages nennen verschiedene Zahlen (1 vs 3). Die Skizze ist mit „max 3" eine Obergrenze, nicht eine Zielzahl; `PROJECT.md` liest sie als Merkmal („bis zu drei"), `DESIGN-DECISIONS.md` als Ausbaupfad. | Ist die erste Version ausdrücklich **ein** Regler (und 3 nur später), oder sind drei gleichzeitig sichtbare Regler Teil des Erstbaus? | Das Layout wird für drei Regler gebaut (State-Sync ist für n Regler trivial), die Designabnahme sagt „ein Regler"; oder umgekehrt: alles ist auf einen Regler verdrahtet und der Ausbaupfad wird zur Neu-Verdrahtung. |
| K06 | A14 „maybe 5 options but only show 3" (`sketches/…:105`) | A12 „max 3" (`sketches/…:84`), A30 „1 → 2/3 → max 3" (`DESIGN-DECISIONS.md:22`) | Wert | „5 options, 3 shown" beschreibt einen Vorrat, aus dem drei sichtbar sind; „max 3" beschreibt die Obergrenze der sichtbaren Regler. Wird beides addiert, sind es fünf Belegungen bei drei Reglern – eine Zuordnung, die nirgends entschieden ist (`tech/LUECKEN.md:18-21`). | Gibt es fünf Regler-Belegungen, von denen drei sichtbar sind, oder höchstens drei Belegungen überhaupt? | Jeder baut „drei Regler" und belegt sie ad hoc; die fünfte Option aus der Skizze fällt still weg oder taucht später als ungeplantes viertes Bedienelement auf. |
| K07 | A04 „Einziges sichtbares Bedienelement: sliders" (`sketches/…:28`) | A29 „Mikrofon wird erst nach Klick freigegeben" (`DESIGN-DECISIONS.md:21`), `sketches/…:82` „Texteingabefeld", A10 „after click" (`sketches/…:81`) | Ausschluss | „Einziges sichtbares Bedienelement" schließt Textfeld, Mikrofon-Knopf und Klick-Flächen aus. Der bestätigte Erstablauf braucht aber mindestens ein Textfeld und eine Mikrofon-Freigabe, also drei Bedienelemente. | Ist „nur Slider" eine Aussage über die visuelle Ruhe (kein Menü, keine Navigation) oder eine harte Obergrenze an Bedienelementen? | Beim ersten Klick auf das Mikrofon ist die Skizzen-Aussage verletzt; im Review wird sie als „war doch nur Poesie" weggewinkt, ohne dass jemand die Grenze neu gesetzt hat. |
| K08 | A57/A58 „Input UI (dying)" / „The 'button' dies" (`GreateWriting.txt:139,141`) | A04, A30, A34 (Sliders als Kern), A56 „unmittelbare Effekte der Designregler" (`PROJECT.md:22`) | Ausschluss | Der Text erklärt Formulare und „settings toggles" für tot und will Input-UI abschaffen; das Produkt macht einen Schieberegler – die reinste Form eines „settings toggle" – zum einzigen Bedienelement. | Folgt das Produkt der Inspiration (Input verschwindet, der Agent entscheidet) oder der Skizze (der Nutzer dreht Regler)? | Der Regler wird als „veraltete Input-UI" umgebaut, das Gespräch übernimmt die Steuerung; oder der Regler bleibt und die Inspiration wird zur Dekoration im README. |
| K09 | A62 Personalisierung per Farbthema = „decoration, not adaptation" (`GreateWriting.txt:222`) | A30 „der Agent erfragt sein Aussehen" + `sketches/…:27` `colour` · `form` · `output style`; `DESIGN-DECISIONS.md:48-51` nennt genau diese „dokumentierte Spannung" | Ziel | Die Inspiration nennt Farbe/Modus ausdrücklich wertlos, die Skizze macht Farbe/Form/Ausgabestil zum gefragten Kern und der erste Regler „vermutlich die Farbe oder Temperatur" (`DESIGN-DECISIONS.md:50-51`). | Ist die sichtbare Umgestaltung (Farbe/Form) das Produktversprechen, oder nur ein Einstieg, der durch echte Verhaltensanpassung ersetzt werden muss? | Der erste Regler ist ein Farbregler, die Gestaltung wirkt „wie ein Theme-Picker", und die Inspirationsquelle im Repo erklärt das Produkt für oberflächlich. |

### Text, Verlauf, Fokus, Stille

| K-ID | A (ID) | B (ID) | Art | Warum unvereinbar | Entscheidungsfrage an den Owner | Wenn man es beim Bauen merkt |
|---|---|---|---|---|---|---|
| K10 | A59 Chat = „emergency exit, not the main entrance" (`GreateWriting.txt:152`) | A23 Text als Grundweg (`DESIGN-DECISIONS.md:14`), A28 „eine Textnachricht" als Erstablauf (`:20`), A29 Text zuerst (`:21`) | Ziel | Der Erstablauf ist Text im Haupteingang. Die Inspiration will genau das Gegenteil: Chat nur als Ausnahme. | Ist Text der Haupteingang des Erstbaus (und die Inspiration bleibt Zeitdiagnose), oder muss der Erstablauf ohne Chat-Eingabe funktionieren? | Der Erstbau hat ein Textfeld, das laut Inspiration nicht existieren dürfte; jede Design-Review führt dieselbe Diskussion ohne Entscheidungsgrundlage. |
| K11 | A11 „1 message" (`sketches/…:82`), A28 „eine Textnachricht" (`DESIGN-DECISIONS.md:20`) | A24 „Ältere Antworten treten zurück und werden beim Scrollen sichtbar" (`DESIGN-DECISIONS.md:15`) | Wert/Ziel | „Eine Nachricht" und „Verlauf mit Scrollen" sind zwei verschiedene Produkte: Einzelantwort-Bühne vs. Gesprächsprotokoll. Die Skizze ist mit „1 message" die knappere, `DESIGN-DECISIONS.md:15` die reichere Lesart. | Zeigt die Bühne immer nur die aktuelle Antwort (Verlauf nur auf Scroll), oder ist der Verlauf ein gleichwertiger Teil der Oberfläche? | Beide werden gebaut (Liste + Fokus-Karte), die Seite wird zur Chat-App mit Fokus-Effekt; oder der Verlauf fehlt und `DESIGN-DECISIONS.md:15` ist unerfüllt. |
| K12 | A28/A31 „Hintergrund-Ergebnisse erscheinen still über State-Sync" (`DESIGN-DECISIONS.md:20,23`; `ABGLEICH.md:26`) | A25 „Neue Antwort steht im Fokus, auch wenn vorher im Verlauf gelesen wurde" (`DESIGN-DECISIONS.md:16`), A23 „sanfte visuelle Reaktion signalisiert die Antwort" (`:14`) | Ziel | **Beide Sätze stehen in derselben Tabelle derselben Datei.** Ein spätes Hintergrund-Ergebnis ist eine neue Antwort; die eine Regel sagt „still", die andere sagt „in den Fokus, Leseposition aufgeben". Ohne Fallunterscheidung ist das unentscheidbar. | Gilt die Fokus-Regel (A25) auch für Ergebnisse, die der Besucher nicht angefragt hat, oder erscheinen genau die still? | Genau der erste späte Analysing-Treffer reißt den Leser aus dem Scrollen (oder bleibt unbemerkt) – und niemand kann sagen, welche der beiden bestätigten Regeln verletzt wurde. |
| K13 | A08 „nicht bevormundend" (`sketches/…:65`) | A25 Fokus-Übernahme gegen die Leseposition (`DESIGN-DECISIONS.md:16`) | Ziel | Die Leseposition zu nehmen, weil der Agent fertig ist, ist die definitorische Form von Bevormundung – und `DESIGN-DECISIONS.md:16` hat die Alternative ausdrücklich **abgelehnt**. | Darf der Agent den Fokus nehmen, obwohl die Skizze „nicht bevormundend" verlangt (Fokus nur, wenn der Nutzer nichts liest)? | Der Nutzer scrollt, die Antwort springt; im Usability-Test ist das der erste Beanstandungspunkt und die Regel muss nachträglich verfeinert werden. |
| K14 | A61 „Silent operation becomes the primary interface" (`GreateWriting.txt:207`), A23 „sanfte visuelle Reaktion" | A23/A25: jede Antwort wird visuell signalisiert und in den Fokus genommen (`DESIGN-DECISIONS.md:14,16`) | Ziel | „Stille als Prinzip" heißt: keine Bestätigung, solange nichts schiefgeht. Das Produkt signalisiert **jede** Antwort sichtbar. | Ist sichtbare Reaktion pro Antwort gewollt (Präsenz) oder nur bei Anomalie (Stille)? | Entweder der Typewriter/Effekt wirkt „geschwätzig" gegen die Inspiration, oder die Präsenz verschwindet und die Seite wirkt tot. |
| K15 | A05 „after 5 seconds some eyes wake up" (`sketches/…:35`), A28 „etwa 5 Sekunden" (`DESIGN-DECISIONS.md:20`) | A10 „after click", „mouse move" als Wecksignale (`sketches/…:81`) | Ziel | Zwei Auslöser für dasselbe Ereignis: Zeit (5 s) und Interaktion (Klick/Maus). `research/SCOUT-SYNTHESIS.md:61-62` nennt sie ausdrücklich „kein Widerspruch" – aber nur, weil dort zwei Zustände angenommen werden, was nirgends entschieden ist. | Wecken die Augen nach 5 s von selbst, oder erst bei Klick/Mausbewegung (und die 5 s gelten nur ab Seitenaufruf ohne Interaktion)? | Ein Besucher, der nach 30 s nichts tut, sieht schlafende Augen; oder die Augen wecken bei jeder zufälligen Mausbewegung, was `unaufregend` (A22) verletzt. |
| K16 | A60 „acts when needed without being asked" (`GreateWriting.txt:106`) | A21 „Der Mensch gibt den Intent; der Agent reagiert" (`DESIGN-DECISIONS.md:12`), `ABGLEICH.md:26` „Der Agent muss nie von sich aus sprechen" | Ziel | Handeln ohne Aufforderung ist das Gegenteil von „reagiert". A21 ist bestätigt, A60 ist nicht verbindlich – aber A60 ist der einzige Satz im Material, der erklärt, warum es überhaupt Hintergrund-Agenten gibt. | Bleibt der Agent rein reaktiv (Hintergrund-Agenten liefern nur auf Anfrage nach), oder dürfen sie von sich aus Ergebnisse einspielen? | Die Analysing-Agenten werden gebaut und stellen fest, dass sie ohne Auftrag nichts tun dürfen; die Architektur (A15 fast/slow, A31) verliert ihren Zweck. |

### Sichtbarkeit, Website-Begriff, Produktumfang

| K-ID | A (ID) | B (ID) | Art | Warum unvereinbar | Entscheidungsfrage an den Owner | Wenn man es beim Bauen merkt |
|---|---|---|---|---|---|---|
| K17 | A19 „HAI Interaction → can be visible" (`sketches/…:154`), A56 sichtbare Interaktion (`PROJECT.md:22`) | A64 „High intelligence systems generate measurable absence" (`GreateWriting.txt:283-284`) | Ziel | Der eine Satz macht Sichtbarkeit zum Produktziel, der andere zum Intelligenz-Mangel. | Ist die sichtbare Interaktion (Augen, Effekte, Typewriter) das Produkt oder nur Übergangsprogramm? | Jede Animations-Entscheidung wird zur Glaubensfrage; Effekte werden abgeschwächt, bis „can be visible" nicht mehr erkennbar ist. |
| K18 | A67 „Screens are a phase … scaffolding comes down" (`GreateWriting.txt:119,131`) | A36 „Cloudflare Agent SDK und CSS" (`PROJECT.md:21`), A18 CSS (`sketches/…:153`) | Ausschluss | Eine Zielvision, in der Bildschirme verschwinden, ist mit einem Produkt, dessen Medium CSS im Browser ist, nicht vereinbar – außer als ferne Rhetorik. | Ist der Bildschirm das Medium des Produkts (Inspiration nur Hintergrund), oder ist „screenless" eine Anforderung an den Erstbau? | Der Erstbau ist eine Webseite; sobald jemand A67 ernst nimmt, ist der gesamte Erstbau nicht mehr legitimierbar. |
| K19 | A01 „Not a website" (`sketches/…:24`), A40 „Webseite selbst ein fetter Agent" (`Idea:00:01:21`) | A07 `for website` als Produktast (`sketches/…:42`), `sketches/…:101` „colour feel of the website" | Begriff | „Not a website" meint an der einen Stelle „keine statische Seite, sondern ein Gegenüber", an der anderen könnte es „kein Bildschirm" heißen (A67). Die Skizze selbst nennt ihr Medium zweimal „website". | Heißt „not a website": kein Marketingdokument, sondern ein Gegenüber – oder: keine Oberfläche? | Zwei Teams bauen verschiedene Produkte: das eine eine Agenten-Startseite, das andere eine sprachliche Schnittstelle ohne Layout. |
| K20 | A07 vier Produktäste `for website/person/team/company` (`sketches/…:41-52`) | A40/A38 eine Startseite für Agentfähig (`Idea:00:01:21`, `PROJECT.md:8-10`) | Scope | Vier Adressaten sind vier Produkte (Mandanten, Isolation, Preis). Der Rest des Materials baut genau eines: die Startseite von Agentfähig. | Ist `for X` eine Produkt-Roadmap (vier Varianten) oder nur eine Beschreibung, für wen dieser eine Agent taugt? | Das Datenmodell wird mandantenfähig gebaut (A44, T7) und niemand nutzt es; oder die Frage „für wen" bleibt unbeantwortet und die Startseite kann ihr Publikum nicht adressieren. |
| K21 | A02 drei Eingänge inkl. `picture` (`sketches/…:25`), T1 (`tech/INTENT.md:19`), `PROJECT.md:12` „ergänzt Bildinput" | A29 Erstbau = Text + Mikrofon (`DESIGN-DECISIONS.md:21`), A28 Erstablauf ohne Bild (`:20`) | Scope | Bild ist eine der drei Skizzen-Eingänge und steht in T1, kommt im bestätigten Erstablauf aber nicht vor – ohne dass irgendwo steht „Bild ist vertagt". | Gehört Bildinput in den Erstbau, oder wird er ausdrücklich vertagt (und die Skizze damit eingeschränkt)? | Der Erstbau wird abgenommen, und die Skizzen-Anforderung „picture" ist stillschweigend verschwunden; später fällt auf, dass es dafür kein Beispiel im Upstream gibt (`CLOUDFLARE_MACHBARKEIT.md:57`). |
| K22 | A06 „user decides where the 'call' is going to" (`sketches/…:36-37`) | A44 „Jeder Besucher bekommt einen eigenen Agenten" (`CLOUDFLARE_MACHBARKEIT.md:44`); T7 offen „pro Besucher oder pro Mandant" (`:115`) | Ziel | Entweder der Nutzer wählt den Weg, oder das System gibt jedem Besucher automatisch einen Agenten. Beides zugleich ergibt zwei Zuständigkeiten für dieselbe Adressierung. | Wählt der Besucher den Weg (Pathways), oder wird er ihm zugewiesen? | Die Adressierung wird pro Besucher gebaut; „user decides" fällt weg, obwohl die Skizze es als eigene Achse zeichnet. |

### Technologie, Prozess, Kosten, Datenschutz

| K-ID | A (ID) | B (ID) | Art | Warum unvereinbar | Entscheidungsfrage an den Owner | Wenn man es beim Bauen merkt |
|---|---|---|---|---|---|---|
| K23 | A42 „Kein eigener Code", A47 „Kein Eigenbau geplant" (`INTENT.md:34`, `UPSTREAM_SEARCH-cloudflare.md:34`) | A48 „Keine Vorlage für den Kern der Idee" (`CLOUDFLARE_MACHBARKEIT.md:100`), `DESIGN-DECISIONS.md:44-47` „Bewusstes Eigenbau-Risiko, kein kopierbares Muster" | Ausschluss | Das Kernversprechen (Agent gestaltet die eigene Seite live per Regler) hat kein Upstream; „kein eigener Code" verbietet genau das, was das Produkt ausmacht. Die Ausnahme ist bereits faktisch erklärt (`DESIGN-DECISIONS.md:44-47`), aber nicht als Regel geändert. | Gilt „kein eigener Code" ausnahmslos (dann fällt der Kern weg), oder ist Frontend-/Regler-Code als Gestaltung ausgenommen (dann muss die Regel das sagen)? | Das Upstream-First-Gate blockiert den Kern; jemand baut ihn „als Frontend" und die Regel wird still umgangen – der Prozess verliert seine Prüfkraft für alle späteren Slices. |
| K24 | A41 „Plattform: Cloudflare" (`INTENT.md:31`), A49 „Geplant ist der Bau auf Cloudflare" (`briefs/konkurrenz.md:14`) | A39 „Keine Framework-/Hosting-Entscheidung als bestätigt darstellen" (`AGENTS.md:41-42`), A38 „Implementierung noch nicht festgelegt" (`PROJECT.md:9-10`) | Prozess | Die Recherche behandelt Cloudflare als gesetzt, die Projektregel nennt gerade das eine unzulässige Ableitung. Damit ist der Status der wichtigsten Technologieentscheidung im Repo widersprüchlich. | Ist Cloudflare jetzt entschieden (dann A38/A39 für dieses Thema schließen), oder weiter offen (dann dürfen T1–T9 nicht Cloudflare-only beantwortet werden)? | Zwei Slices arbeiten mit unterschiedlicher Prämisse; der eine prüft Alternativen und wird zurückgewiesen, der andere baut Cloudflare und niemand weiß, ob das je entschieden wurde. |
| K25 | A29 „Voice ist Teil des Erstbaus" (`DESIGN-DECISIONS.md:21`, 19.11.) | `ABGLEICH.md:64` „Reicht für den ersten Ablauf Text mit Typewriter, und Stimme kommt danach dazu?"; `ABGLEICH.md:12` „acht bestätigte Designentscheidungen"; `LUECKEN.md:133-136` „Erster Besucherablauf: nicht festgelegt" (beide 12.11.) | Ziel | Drei technische Dokumente beschreiben einen Entscheidungsstand, den die Designentscheidungen überholt haben. Wer nach `tech/` baut, baut einen anderen Erstbau als wer nach `docs/` baut. | Wird `tech/` (ABGLEICH, LUECKEN) auf den 19.11.-Stand nachgezogen, bevor der Messlauf-Plan geschrieben wird – oder gelten für den Erstbau nur `docs/`? | Der Messlauf-Plan wird aus ABGLEICH-Fragen gebaut („reicht Text?"), obwohl Voice schon im Scope ist; die Messung beantwortet dann die falsche Frage. |
| K26 | A52 Preise sind ausgeschlossen (`briefs/cloudflare-bausteine.md:38-39`, `briefs/konkurrenz.md:34`) | A46 20 req/min je Konto und Modell, „für eine öffentliche Startseite wäre das eng" (`CLOUDFLARE_MACHBARKEIT.md:97`), A44 ein Agent pro Besucher | Kosten | Die öffentliche Startseite mit einem Agenten pro Besucher ist eine Kapazitäts- und Kostenentscheidung (Rate-Limits, Paid-Plan); genau diese Rechnung wurde per Auftrag ausgeschlossen. Damit ist die Anforderung nicht prüfbar. | Wird die Kosten-/Kapazitätsfrage vor dem Erstbau geöffnet (Rate-Limits, Plan, Modellklasse), oder bleibt sie bewusst offen und der Erstbau ist nicht öffentlich? | Der erste Tag mit Publikum läuft in 20 req/min; entweder die Seite antwortet mit Fehlern oder es wird ad hoc ein Paid-Plan gebucht, ohne Freigabe (verletzt `AGENTS.md:27-28`). |
| K27 | A55 `plaud thoughts →` als Wissensquelle (`sketches/…:136`, T8 `INTENT.md:26`) | A44 öffentlicher Besucher-Agent, jeder Besucher ein eigener Agent (`CLOUDFLARE_MACHBARKEIT.md:44`); `LUECKEN.md:156-160` „kein Wort zu DSGVO, Aufbewahrung, Löschung" | Datenschutz | Persönliche Gedanken aus Sprachnotizen als Wissensbasis eines Agenten, den Fremde befragen, ohne je eine Aufbewahrungs- oder Löschregel zu definieren. A66 („total surveillance") macht das Thema explizit, ohne dass es irgendwo beantwortet wird. | Ist `plaud thoughts` im Erstbau Wissensquelle (dann braucht es eine Datenschutzentscheidung vorher), oder bleibt es Notiz ohne Funktion? | Die erste fremde Person fragt den Agenten etwas, das nur aus Samuels privaten Aufnahmen stammen kann; die Antwort ist korrekt und der Vorfall nicht rückholbar. |

---

## 3 · Einzelquellen-Risiko

Anforderung, die **nur einmal** und **nur in einer nicht verbindlichen Quelle** steht (oder nur in einer
ungeprüften Behauptung), aber beim Bauen leicht als gegeben behandelt wird.

| Anforderung | Einzige Quelle | Verbindlich? | Frage |
|---|---|---|---|
| Input-UI abschaffen, „The 'button' dies" | `GreateWriting.txt:137-141` | Nein (`PROJECT.md:25-26`, `AGENTS.md:10-11`) | Aussage über die ferne Zukunft oder Verbot von Buttons im Erstbau? |
| Chat nur als Notausgang | `GreateWriting.txt:152` | Nein | Darf der Erstbau ein Chat-Eingabefeld im Zentrum haben? |
| Personalisierung per Farbe ist „Dekoration" | `GreateWriting.txt:222` | Nein – aber als „Designrisiko" adoptiert (`DESIGN-DECISIONS.md:48-51`) | Ist der Farbregler Produktversprechen oder Selbstwiderspruch? |
| System handelt ohne Aufforderung, beobachtet kontinuierlich | `GreateWriting.txt:106,112` | Nein, widerspricht A21 | Warum gibt es Hintergrund-Agenten, wenn sie nie von selbst liefern dürfen? |
| „Ohne totale Überwachung kein anticipatory design" | `GreateWriting.txt:318` | Nein | Gilt das als bewusst gemachter „Bargain" oder als Grund, jede Beobachtung zu unterlassen? |
| Preis pro Ergebnis (0,5 $/Termin) | `GreateWriting.txt:307-311` | Nein; Preise im Auftrag ausgeschlossen (`briefs/cloudflare-bausteine.md:38`) | Gibt es überhaupt ein Geschäftsmodell im Erstbau, oder ist die Seite kostenlos? |
| „Screens are a phase" | `GreateWriting.txt:119-131` | Nein | Ferne Vision oder Rahmen für den Erstbau? |
| Deutsch als Sprache von UI und Stimme | `sketches/…:137` (Slogan) + `CLOUDFLARE_MACHBARKEIT.md:98,105` (Messlauf „auf Deutsch") | Halb: Slogan ja, Anforderung nirgends | Ist Deutsch Anforderung oder Zufall des Slogans? Der ganze Voice-Gate hängt daran. |
| 20 Anfragen/min je Konto und Modell | `CLOUDFLARE_MACHBARKEIT.md:97` („Nicht gegengeprüft") vs. `research/cloudflare-bausteine.md:282-284` (als VERIFIZIERT) | Nein, und die beiden Quellen widersprechen sich im Belegstatus | Welche Modelle fallen darunter – und ist die Startseite damit überhaupt öffentlich machbar? |
| Satzweises Vorlesen der Pipeline | `tech/ABGLEICH.md:48` (Folgerung, keine Primärquelle) | Nein, nicht gegengeprüft | Ist satzweises TTS gesetzt, oder nur eine Annahme über die Beta? |
| Zeitmarken je Wort existieren nicht | `tech/ABGLEICH.md:53-54` („steht in keiner geprüften Quelle") | Nein | Ist die Wort-TTS-Synchronie damit ausgeschlossen oder nur unbekannt? |
| Bild-Eingang technisch vorhanden | `CLOUDFLARE_MACHBARKEIT.md:57` („nicht gegengeprüft", „kein fertiges Beispiel") | Nein | Ist `picture` (A02) im Erstbau überhaupt baubar? |
| „Bewusstes Eigenbau-Risiko" als Freigabe | `DESIGN-DECISIONS.md:44-47` | Ja, aber nur als Notiz – die Regel A42/A47 wurde nicht geändert | Ersetzt diese Notiz die Upstream-First-Regel? (siehe K23) |

---

## 4 · Begriffs-Kollisionen

Gleiches Wort, verschiedene Bedeutung – die gefährlichste Sorte, weil beide Seiten recht haben.

| Begriff | Bedeutung A (Quelle) | Bedeutung B (Quelle) | Warum gefährlich |
|---|---|---|---|
| **Zustand** | Agent-State, per `setState` an alle Clients (`CLOUDFLARE_MACHBARKEIT.md:61`) | UI-Zustand „Fokus/Leseposition" (`DESIGN-DECISIONS.md:16`) | Ein Regler-Update und ein Fokuswechsel sind technisch derselbe Kanal; „Zustand synchronisieren" klingt nach beidem. |
| **Status** | `idle / listening / thinking / speaking` (`CLOUDFLARE_MACHBARKEIT.md:62`) | Antwort-Zustand (gestreamt/fertig, `ABGLEICH.md:40`) | Zwei Zustandsmaschinen, ein Wort; die Augen-Animation hängt an der einen, der Typewriter an der anderen. |
| **Streaming** | LLM-Token-Stream (`ABGLEICH.md:31`) | Satzweises TTS-Streaming (`ABGLEICH.md:48`), „resumable Streaming" (`research/cloudflare-bausteine.md:243`) | Drei Takte für dieselbe Antwort; „gestreamt" sagt nichts über die sichtbare Geschwindigkeit. |
| **Typewriter** | Buchstabenweise Einblendung mit Puls (`DESIGN-DECISIONS.md:17`) | Wortrhythmus nach Wortlänge (`:18`) | Zwei verschiedene Mechanismen (Zeichentakt vs Wortpuffer), oft als ein Feature behandelt. |
| **Agent** | Das Produkt/die Seite selbst (`Idea:00:01:21`, `sketches/…:24`) | Front-DO und Sub-DOs (`CLOUDFLARE_MACHBARKEIT.md:31-35`) | „Ein Agent pro Besucher" meint Architektur, „die Seite ist ein Agent" meint ein Erlebnis. |
| **Agent** (2) | LLM-Modell („tuned for voice agents", `research/cloudflare-bausteine.md:52-54`) | Akteur mit Speicher und Werkzeugen (`CLOUDFLARE_MACHBARKEIT.md:44-49`) | Modellwahl-Diskussionen und Architektur-Diskussionen verwechseln sich. |
| **still** | ohne Ton („ohne hörbaren Ton", `DESIGN-DECISIONS.md:14`) | ohne Aufmerksamkeit („erscheinen still", `:20,23`) | „Still erscheinen" kann heißen „wortlos" oder „unaufdringlich" – davon hängt K12 ab. |
| **Stille** | Designprinzip: nichts bestätigen (`GreateWriting.txt:195-207`) | akustische Stille (`DESIGN-DECISIONS.md:14`) | Die Inspiration meint Aufmerksamkeitssparsamkeit, das Design meint Lautstärke. |
| **max 3** | Slider-Obergrenze (`sketches/…:84`) | wurde als Nachrichtenlimit gelesen und korrigiert (`research/SCOUT-SYNTHESIS.md:60`) | Zeigt, dass die Skizzenzahlen schon einmal falsch übertragen wurden; „3" steht an drei Stellen für drei Dinge. |
| **Text zuerst** | Bau-Reihenfolge der Kanäle (`DESIGN-DECISIONS.md:21`) | Modalitäts-Priorität: „Text ist der Grundweg" (`ABGLEICH.md:28`) | Ein Zeitplan und eine Rangordnung, die man für dasselbe hält. |
| **Pay / Preis** | Besucher zahlt den Agenten (T9, x402, `CLOUDFLARE_MACHBARKEIT.md:65`) | Wir rechnen pro Ergebnis ab (`GreateWriting.txt:307-311`) | Entgegengesetzte Geldrichtungen, gleiches Wort. |
| **Backup** | dritter Sub-Agent `⟨Backup⟩` (`sketches/…:116,167`) | Daten-Backup / Ausweichpfad (`UPSTREAM_SEARCH-cloudflare.md:23`) | Die Lesart ist ungeklärt; „Backup-Agent" wird gebaut, ohne zu wissen, was er tut. |
| **Not a website** | kein statisches Marketing, sondern Gegenüber (`sketches/…:24`) | kein Bildschirm (`GreateWriting.txt:119-131`) | Siehe K19; bestimmt, ob Layout überhaupt existiert. |
| **Mandant** | „ein Agent pro Besucher oder pro Mandant" (`CLOUDFLARE_MACHBARKEIT.md:115`) | `for company` aus der Skizze (`sketches/…:42`) | Mandant = Kunde oder = Firma als Adressat? Bestimmt das Isolationsmodell. |

---

## 5 · Die 5 Entscheidungen, die vor dem Bau fallen müssen

Sortiert nach Schadenskosten (was es kostet, wenn es erst beim Bauen auffällt).

**D1 — Eigenbau-Verbot vs. Kern ohne Vorlage (K23).**
Frage: Gilt „kein eigener Code" ausnahmslos, oder ist Frontend-/Regler-Code ausgenommen?
- **Option A: Ausnahme schriftlich (Regel ändern).** Konsequenz: Upstream-First bleibt für Backend scharf, der Kern ist baubar; Preis: ein Präzedenzfall, der jede spätere „ging nicht anders"-Begründung leichter macht.
- **Option B: Regel bleibt hart.** Konsequenz: Das Live-Umgestalten fällt aus dem Erstbau; der Erstbau wird zum Standard-Voice-Agent und die Produktidee wartet.

**D2 — Latenz-Ziel: Zahl oder Messung (K01 + A33).**
Frage: Ist „1 s inkl. TTS" Abnahmekriterium oder Messergebnis?
- **Option A: 1 s als Kriterium.** Konsequenz: Transport (K04/WebRTC) und Modellwahl werden vorab festgelegt, der Messlauf wird zur Prüfung statt zur Erkundung; Risiko: durchfallen.
- **Option B: Kriterium erst aus 20 Messwerten.** Konsequenz: keine Abnahme vor der Messung, dafür ein reales Budget; Risiko: die Zahl 1 s verschwindet stillschweigend.

**D3 — Rolle der Stimme im Erstbau (K02 + K25).**
Frage: Ist Voice gleichrangiger Kanal mit Latenzanspruch oder Zugabe hinter Text?
- **Option A: gleichrangig.** Konsequenz: Beta-Risiko, Deutsch-Risiko und 890-ms-Budget werden Erstbau-Risiken; `tech/` muss nachgezogen werden.
- **Option B: Zugabe.** Konsequenz: Erstbau wird kleiner und früher prüfbar; `DESIGN-DECISIONS.md:21` („Voice ist Teil des Erstbaus") muss revidiert werden.

**D4 — Stille oder Aufmerksamkeit (K12 + K13 + K14).**
Frage: Gilt „neue Antwort im Fokus" auch für Hintergrund-Ergebnisse?
- **Option A: Fokus für alles.** Konsequenz: einfache Regel, aber sie nimmt die Leseposition und widerspricht „nicht bevormundend".
- **Option B: Fokus nur für angefragte Antworten, späte Ergebnisse still.** Konsequenz: zwei Antwortklassen im UI (mehr Zustand, mehr Testfälle), dafür beide bestätigten Sätze erfüllbar.

**D5 — Ist die sichtbare Fläche das Produkt? (K07 + K08 + K17 + K18).**
Frage: Bleibt der Regler das einzige Gestaltungselement, und wie viel sichtbare Präsenz ist gewollt?
- **Option A: Skizze folgen (Regler, Augen, Effekte sichtbar).** Konsequenz: Inspiration GreateWriting wird ausdrücklich zur Zeitdiagnose degradiert; klar baubar.
- **Option B: Inspiration folgen (Agent entscheidet, Input verschwindet).** Konsequenz: Slider und „can be visible" fallen weg; der Erstbau braucht ein neues Bedienkonzept und die Skizze wird partiell ungültig.

---

## 6 · Vage, nicht belastbar (bewusst nicht als Anforderung aufgenommen)

| Stelle | Warum nicht belastbar |
|---|---|
| „// 3 parts" (`sketches/…:153`) | Drei Teile wovon (Seite, Stack, Agenten)? Kein Bezug im Text; wäre sonst eine harte Scope-Zahl. |
| „2/3" (`sketches/…:83`) | Zwei von drei was? Steht als Kartentitel ohne Objekt. |
| „no latency!" (`sketches/…:118`) | Rhetorischer Nullwert neben „under 1 sec"; als Zahl unbrauchbar. |
| „clear word" (`sketches/…:84`) | Kein Bezug; `DESIGN-DECISIONS.md:69-70` führt es selbst als unsichere Lesart. |
| „Connect effect" (`sketches/…:154`) | Effekt ohne Beschreibung. |
| „popups move 'when … is …'" (`sketches/…:155`) | Bedingung fehlt im Text. |
| „live meta", „want to change" (`sketches/…:114`) | Bedeutung ungeklärt (`LUECKEN.md:61-62`). |
| „2 more when this" (`sketches/…:105`) | Grammatisch nicht auflösbar; nur „5 options / 3" ist verwertbar (K06). |
| „Make my design ⟨Reg⟩ smart", „the swarm ⟨lokat⟩" (`sketches/…:143-144`) | Lesarten unsicher; keine Anforderung formulierbar. |
| „⟨Opp M⟩", „⟨Moltdegect⟩", „⟨in touch⟩" (`sketches/…:112-113,163-166`) | Transkription unklar; `LUECKEN.md:169-171` bestätigt. |
| „Sinnvoll" im Doppelpfeil (`sketches/…:118`) | Ohne Objekt. |
| „kinder leicht", „vibrant/alive/vivid", „welcomed" (`sketches/…:58-64`) | Gefühlswörter ohne messbare Operationalisierung (`LUECKEN.md:48-51`); als Kategorie UX nicht prüfbar, nur als Beurteilungsraster. |
| „First-Response-Zeit in ms je Turn" | Keine Anforderung, sondern Metrik-Quelle (`CLOUDFLARE_MACHBARKEIT.md:44`). |
| „no latency" vs „800 ms" (`CLOUDFLARE_MACHBARKEIT.md:73`) | 800 ms ist Cloudflares Behauptung, keine Owner-Anforderung; als Wert-Kollision mit A17 nicht zulässig, weil die eine Seite keine Anforderung ist. |
