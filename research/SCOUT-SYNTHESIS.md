# Aggregierte OpenCode-Befunde — 12.11.2026

Scouts: OpenCode v2.2.7, Modell `opencode-go/deepseek-v4.1-flash`, frische Sessions,
read-only beauftragt. Diese Synthese trennt überprüfbare Befunde, offene Hypothesen
und verworfene Interpretationen. Keine vollständigen Tool-Logs im Repository.

## 1. Lokale Designquellen

Die [Skizze](../sketches/2026-11-12-agentfaehig.md) nennt `voice`, `text`, `picture`
(Zeile 25), menschliche Richtungswahl (34–37), `vibrant / alive / vivid` sowie
`soft smooth` (60–66), weiche Augen (75) und höchstens drei Slider (81–85).
Scroll-Verlauf, Mikrofonfreigabe und Typewriter-Rhythmus werden dort nicht festgelegt.
Die [neuen Entscheidungen](../docs/DESIGN-DECISIONS.md) ergänzen diese Quelle.

Mehrere lokale Scouts lieferten vor allem Abgrenzungen dessen, was noch offen ist,
keine neue externe Forschung. Die Wiederholungen sind hier zusammengefasst.

## 2. Cloudflare: Text-Streaming grundsätzlich vorhanden

Der Web-Scout hat offizielle Seiten abgerufen:

- [Chat-Agent-Beispiel](https://developers.cloudflare.com/agents/examples/chat-agent/)
- [Agent-Klasse](https://developers.cloudflare.com/agents/agent-class/)
- [WebSockets](https://developers.cloudflare.com/agents/agent-class/websockets/)

Das Beispiel verwendet `AIChatAgent`, `onChatMessage()` und eine Streaming-Response
über `toUIMessageStreamResponse()`. Damit ist Text-Streaming eine vorhandene
Plattformfähigkeit. Es beweist weder die Latenz unseres künftigen Produkts noch
eine funktionierende TTS-Pipeline. Provider, Netzwerk und UI bleiben zu prüfen.

Evidenz: Session `ses_e2e39222cffefGqEisHeuUfiZj`, erfolgreiche Web-Abrufe und Exit 0.

## 3. Wortrhythmus: interessante Hypothese, kein UI-Nachweis

Der Forschungs-Scout fand Literatur zu Wortlänge, Häufigkeit, Vorhersagbarkeit und
Blickbewegungen. Zentraler Fund:

- Kliegl, Grabner, Rolfs & Engbert (2004), *Length, frequency, and predictability
  effects of words on eye movements in reading*.
  [PDF beim Mitautor](http://www.martinrolfs.de/rolfslab/pdf/2004/Kliegl.EurJCognPsychol.16.2004.262.pdf),
  [vom Scout abgerufene Textkopie](https://docslib.org/doc/3539283/length-frequency-and-predictability-effects-of-words-on-eye-movements-in-reading).

Das PDF ließ sich mit dem Webfetch-Tool nicht auslesen; der Scout verwendete eine
Textkopie. Weitere Literaturhinweise betrafen Häufigkeitseffekte und parafoveale
Vorschau. Exakte Effektgrößen und Sekundärzitate werden hier nicht übernommen,
da sie nicht unabhängig anhand der Originalarbeiten geprüft wurden.

Belastbare Grenze der bisherigen Recherche: Sie liefert keinen direkten Versuch
zu unserem Typewriter-Effekt. Aus längerer Betrachtungsdauer folgt nicht automatisch,
dass jeder Buchstabe eines längeren Wortes langsamer eingeblendet werden sollte.
Auch die pauschale Scout-Empfehlung „konstantes Buchstabentempo“ ist damit nicht
als wissenschaftlich bewiesene Alternative begründet.

Samuels gewünschter Rhythmus bleibt eine Gestaltungshypothese. Nach Designabnahme
können Varianten hinsichtlich Gefühl, Lesbarkeit und Wartezeit verglichen werden.
Evidenz: Session `ses_e2e3166aaffelgCJYPBObv75LD`, Exit 0; Quellenzugriff teils begrenzt.

## 4. Korrigierte Scout-Aussagen

- „max 3“ ist ein Slider-Limit, kein nachgewiesenes Nachrichtenlimit.
- Automatisches Erwachen und Reaktion nach Klick müssen kein Widerspruch sein;
  sie können unterschiedliche Zustände beschreiben.
- „Lebendig“ ist sehr wohl in der Skizze verankert. Der konkrete pulsierende
  Typewriter kommt aus Samuels Antworten.
- Ein Text-Eingabefeld beweist keine bereits spezifizierte Text-Ausgabe.
- Der Cloudflare-Scout hat keine Grundlage für eine pauschale Aussage geliefert,
  dass Cloudflare generell keine Audio-/TTS-Integration besitzt.

## 5. Betriebsstand

Direkte CLI-Aufrufe mit gesetztem Prozess-Arbeitsverzeichnis funktionieren.
Der MCP-Adapter übergibt weiterhin ein ungültiges `--dir` und wird umgangen.
Lokale Lesezugriffe sowie `webfetch`/`websearch` wurden beobachtet.
KnowledgeGraph-Zugriff aus OpenCode ist noch nicht nachgewiesen.
