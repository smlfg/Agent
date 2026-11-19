# UPSTREAM_SEARCH — Generative UI, getrennt nach Variante K und Variante T

Stand: 19.11.2026 · Subagent (Websuche erlaubt, Schreiben nur diese Datei) ·
Projekt `03_HAI/Agentfaehig/Agent`

Ergänzt [`tech/UPSTREAM_SEARCH-cloudflare.md`](../../tech/UPSTREAM_SEARCH-cloudflare.md)
und schließt die Lücke aus [`graphify-out/synergie/S3-generative-ui.md`](../synergie/S3-generative-ui.md):
S3 hat nur die projektinterne Recherche geprüft (`konkurrenz.md:77`: „kein Fund
für Agent färbt eigene Seite"), nicht den Markt. Das ist hiermit nachgeholt.

## Need

Die Skizze verlangt, dass der Agent das Aussehen **der ganzen Seite** steuert —
`colour · form · output style` (Ausschnitt 1/5), Slider mit „real time effects"
(Ausschnitt 5), „the 'design' colour feel of the website" mit Achse
`warm ↔ cold`, `techy · blueish · wooden · gentle` (Ausschnitt 6), „maybe 5
options but only show 3". Technische Fassung: `tech/INTENT.md:23`
(„Agent verändert das Aussehen der Seite").

Projektregel: „Kein eigener Code. Upstream zuerst" (`tech/INTENT.md:34`).

## Die Unterscheidung, an der alles hängt

| | Variante K (Container) | Variante T (Fläche) |
|---|---|---|
| Was der Agent bestimmt | welche **Komponenten in einem Panel** stehen und mit welchen Daten | welche **Werte die Design-Tokens der Seite** haben und welches Chrome sichtbar ist |
| Wer besitzt das Styling | der Client (Katalog, Theme, CSS) | niemand — der Agent schreibt |
| Typische Form | Chat-Karte, Inline-Widget, iframe | `:root`-CSS-Variablen, `document.documentElement` |
| Bezug zur Skizze | teilweise (Slider als Katalogelement) | **genau das Geforderte** |

Die ganze Branche baut K. Das ist kein Vorwurf, sondern der Befund — und er
erklärt, warum S3 keinen Beleg fand.

---

## Kandidaten

Reifegrad: Sterne, Lizenz und letzter Push am **19.11.2026, 15:18–15:40 UTC**
über die GitHub-API mit authentifiziertem `gh api` gelesen (nicht geschätzt).
„Steuert" = was der Agent tatsächlich beeinflusst.

| # | Kandidat | Repo/URL | Lizenz | Variante | Reifegrad | Was er konkret steuert | Lücke zur Skizze | Urteil |
|---|---|---|---|---|---|---|---|---|
| 1 | **AG-UI Protocol** | [ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui) · [docs.ag-ui.com](https://docs.ag-ui.com/concepts/state) | MIT | **Kanal für beides** (Protokoll, kein Renderer) | 20.573 ★ · Push 19.11.2026 | Geteilter Zustand Agent ↔ Frontend, beidseitig, als `STATE_SNAPSHOT` + `STATE_DELTA` (JSON Patch RFC 6902). Dokumentiertes Beispiel: `{"op":"add","path":"/user/preferences","value":{"theme":"dark"}}` | liefert **keinen** Token-Vertrag und **kein** CSS; was `theme` bedeutet, entscheidet der Client | **DECKT TEILWEISE** — der Kanal für T, nicht T selbst |
| 2 | **CopilotKit** | [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit) · [copilotkit.ai/generative-ui](https://www.copilotkit.ai/generative-ui) | MIT | **K** + **T-Architektur als Beispiel** | 38.820 ★ · Push 19.11.2026 | Gen UI in drei Stufen (controlled/declarative/open) plus MCP Apps; im Repo `examples/showcases/reskinnable-demo`: ganze App per Skin austauschbar, „the shell owns the design-token *names*; each skin owns the *values* via a `.theme-<id>` block, so a reskin is a pure value swap" | Skin-Wechsel ist ein **Dropdown für den Menschen**, kein Agent-Tool. Open-Gen-UI rendert „inside a sandbox", also Container | **DECKT TEILWEISE** — beste T-Architektur, falscher Auslöser |
| 3 | **assistant-ui** | [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) | MIT | **K** + **T-Präzedenzfall (schmal)** | 13.335 ★ · Push 19.11.2026 | (a) `apps/docs/components/tool-ui/set-theme-card.tsx`: Agent-Tool setzt das Seitentheme (`light`/`dark`/`system`) über `next-themes`, mit Freigabe-Karte, Decline-Pfad und Undo. (b) `packages/generative-frame/src/theme.ts`: kanonische Token-Liste `THEME_TOKENS` (25 `--color-*`, `--font-*`, `--radius-*`), die in ein Widget-Frame geschickt wird | (a) nur Hell/Dunkel/System, keine Farb-/Form-/Stilwerte, kein Slider. (b) Richtung ist Host → Frame, nicht Agent → Seite | **DECKT TEILWEISE** — der einzige echte „Agent ändert Seiten-Theme"-Code, den ich gefunden habe |
| 4 | **json-render** | [vercel-labs/json-render](https://github.com/vercel-labs/json-render) | Apache-2.0 | **K** | 19.776 ★ · Push 19.11.2026 | Agent emittiert JSON-Spec gegen einen Katalog; `$bindState` = Zwei-Wege-Bindung an Zustandspfade (`data-binding.mdx:133-170`), `visible` = Sichtbarkeit aus Zustand (`visibility.mdx`), `SpecStream` = JSONL aus JSON-Patch-Operationen, progressiv. 36 shadcn-Bausteine | Katalog ist die Grenze. Kein Theme-, Token- oder CSS-Konzept in den 29 Docs-Seiten (`apps/web/content/docs/`). Theme-Toggle existiert nur als Beispiel-App, nicht als Agent-Fähigkeit | **DECKT NICHT** für T · **DECKT** für „3 von 5 Slidern sichtbar" (K) |
| 5 | **A2UI (Google)** | [a2ui-project/a2ui](https://github.com/a2ui-project/a2ui) · [v0.9-Blog](https://developers.googleblog.com/a2ui-v0-9-generative-ui) | Apache-2.0 | **K**, kann die ganze Fläche füllen, aber Client-Styling | 17.646 ★ · Push 19.11.2026 | Agent streamt Layout-Daten gegen einen Katalog; Renderer für Lit/Angular/Flutter/React. Token-System existiert (`--a2ui-*`, `samples/client/lit/shell/THEMING.md`: „Themes can be configured by overriding default CSS variables … Application themes are defined using `CSSStyleSheet` instances") — gesetzt vom **App-Entwickler**, nicht vom Agenten | Der Agent setzt keine Token-Werte. „Client-controlled styling" ist Absicht: Branding schützen, „prevents agents from injecting styling" (Sekundärquelle, s. Belegstand) | **DECKT NICHT** für T — und zwar ausdrücklich per Design |
| 6 | **Vercel AI SDK (Generative UI)** | [vercel/ai](https://github.com/vercel/ai) · [ai-sdk.dev](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) | Apache-2.0 (GitHub-API meldet `NOASSERTION`, `LICENSE`-Datei: Apache-2.0) | **K** | 28.086 ★ · Push 19.11.2026 | „connecting the results of a tool call to a React component"; Tool-Teil → Komponente, Streaming, `useChat` | Reiner Renderer-Mechanismus. Kein Zustands-Rückkanal für Theme, keine Tokens | **DECKT NICHT** |
| 7 | **LangGraph / `useStream`** | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) · [Docs](https://docs.langchain.com/langsmith/generative-ui-react) | MIT | **K** + Zustandskanal | 45.156 ★ · Push 19.11.2026 | Graph pusht UI-Elemente in den State, Client rendert per `LoadExternalComponent`; `stream.values` ist beliebiger geteilter Zustand mit `submit` in Gegenrichtung | Das UI-Element ist eine Komponente im Chat. Ein Theme wäre nur über `values` + eigene CSS-Anwendung möglich | **DECKT NICHT** direkt; Zustandskanal ist brauchbar |
| 8 | **Tambo** | [tambo-ai/tambo](https://github.com/tambo-ai/tambo) · [docs.tambo.co](https://docs.tambo.co/) | MIT | **K** | 11.223 ★ · Push 18.11.2026 | Registrierte React-Komponenten; Agent wählt Komponente und streamt Props. „Interactable components" bleiben mit ID über Sessions | Kein Seiten-Theme. Props sind Komponenten-Props | **DECKT NICHT** |
| 9 | **OpenAI ChatKit** | [openai/chatkit-js](https://github.com/openai/chatkit-js) · [Theming](https://developers.openai.com/api/docs/guides/chatkit-themes) | Apache-2.0 | **K** | 1.971 ★ · Push **31.07.2026** (vier Monate alt) | Theme-Objekt mit `colorScheme`, `color.accent`, `radius`, `density`, `typography` — sehr nah an der Skizzen-Sprache. Gesetzt über `options`/`setOptions` durch die **App** | ChatKit stylt nur sich selbst. Agent kann Theme nicht setzen (Client-Tools laufen in der App). Zusätzlich: Agent-Builder-Hosted-Pfad stirbt am 30.11.2026, ChatKit bleibt | **DECKT NICHT** — Theme-Vokabular aber vorbildlich |
| 10 | **MCP Apps** (`ext-apps`) | [modelcontextprotocol/ext-apps](https://github.com/modelcontextprotocol/ext-apps) · [Overview](https://apps.extensions.modelcontextprotocol.io/api/documents/Overview.html) | Apache-2.0 (Übergang von MIT, `LICENSE`-Datei) | **K** (iframe) | 3.121 ★ · Push 10.11.2026 | Host schickt CSS-Variablen (`--color-background-primary`, `--font-sans`, `--border-radius-md`), Theme, Display-Modus, Größe **in die View** | Richtung ist Host → Karte. Die Karte kann den Host nicht umfärben; Theme-Änderung kommt als Notification vom Host | **DECKT NICHT** — liefert aber das Token-Vokabular, das T braucht |
| 11 | **MCP-UI (Legacy/Org)** | [MCP-UI-Org/mcp-ui](https://github.com/MCP-UI-Org/mcp-ui) · [mcpui.dev](https://mcpui.dev/guide/protocol-details) | Apache-2.0 | **K** (iframe) | 5.271 ★ · Push 16.09.2026 (langsamer) | `ui://`-Ressourcen, `ui/notifications/host-context-changed` (Theme, Locale, Viewport) | Wie #10, nur älter; MCP Apps ist der Nachfolger | **DECKT NICHT** |
| 12 | **Claude Artifacts** | [claude.com/features/artifacts](https://claude.com/features/artifacts) · [Hilfe](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) | proprietär, kein Repo | **K** (Panel) | Produkt, Reifegrad nicht in Sternen messbar | Claude schreibt HTML/CSS/JS, das „beside your conversation" läuft; Design-Template „built with your design system" | Kein SDK, um die **eigene** Seite zu steuern; Panel, nicht Fläche; nicht einbettbar in Cloudflare | **DECKT NICHT** |
| 13 | **OpenUI (Thesys)** — Ex-C1 | [thesysdev/openui](https://github.com/thesysdev/openui) · [thesys.dev](https://www.thesys.dev/) | MIT (Framework) / kommerziell (Cloud, Gateway) | **K** | 15.347 ★ · Push 19.11.2026 | OpenUI Lang: Modell komponiert Interfaces aus **deiner** Komponentenbibliothek; Renderer streamt. C1-API heißt jetzt „OpenUI Cloud (Formerly C1 API)" | Katalog + „bring your own design system" = Client-Styling. Kein Agent-Zugriff auf Seitentoken | **DECKT NICHT** |
| 14 | **OpenUI (W&B)** | [wandb/openui](https://github.com/wandb/openui) | Apache-2.0 | **K**, grenzt an T | 22.768 ★ · Push 05.11.2026 | Prompt → HTML/Tailwind, live gerendert, Konvertierung nach React/Svelte/Web Components. Erzeugt echte Seiten inkl. Styling | Eigenständige Prototyping-App („like v0 but open source"), keine Runtime-Bibliothek für deine Seite; Agent läuft nicht in deinem Frontend. **Namenskollision** mit #13, andere Firma, anderer Code | **DECKT NICHT** als Baustein — als Referenz für „Modell schreibt ganze Seite" brauchbar |
| 15 | **Ignite UI Theming MCP** | [infragistics](https://www.youtube.com/watch?v=DEtpr_Jpd0o) (Demo) | nicht geprüft | **T, aber Build-Zeit** | Demo, kein Repo-Nachweis | Agent liest Projekt, findet Tokens, generiert Palette + CSS-Variablen, schreibt globales Stylesheet | Passiert **vor** dem Deploy, in der Entwicklungsumgebung. Nicht zur Laufzeit, nicht pro Besucher | **DECKT NICHT** zur Laufzeit |

### Nicht belegbar / bewusst nicht in der Tabelle

- **Thesys C1 als eigenständiges Produkt** — nicht mehr existent unter dem Namen:
  die Thesys-Startseite führt „OpenUICloud — Formerly C1 API". Als eigener
  Kandidat nicht mehr führbar, in #13 aufgegangen.
- **„Agent-driven theming" als Produkt/Standard** — kein Treffer mit Repo,
  Lizenz oder Spezifikation. Siehe Abschnitt „Variante T — Stand der Technik".
- **`stimm-ai`, `pipecat`** — Stimme, nicht Oberfläche; stehen in
  `tech/UPSTREAM_SEARCH-cloudflare.md:21-22`.

---

## Variante T — Stand der Technik

**Antwort: Nein, Variante T ist 2026 kein Standardmuster.** Nicht „keine
Treffer", sondern: die drei Zutaten existieren einzeln und gereift, die
Verbindung ist nirgends ein Produkt. Belege, nicht Schweigen:

**1. Die etablierten Gen-UI-Achsen messen alle K, keine T.**
CopilotKit ordnet den ganzen Markt in drei Säulen plus MCP Apps und vier
Oberflächen (Chat, Chat+, Chatless). Alle drei Säulen beschreiben *was im
Panel erscheint*; die freiste ist „Open Generative UI", und die ist ausdrücklich
„rendered inside a sandbox", mit dem Nachteil „styling consistency and brand
alignment become challenging". Keine Achse heißt „der Agent besitzt das Chrome".
([copilotkit.ai/generative-ui](https://www.copilotkit.ai/generative-ui), 19.11.2026)

**2. Die führenden Spezifikationen schließen T per Design aus.**
A2UI: „Client-controlled styling … the agent describes what to show, and the
client decides how it looks. This keeps branding consistent, **prevents agents
from injecting styling**, preserves accessibility guarantees" (Sekundärquelle,
s. Belegstand). Im Repo bestätigt durch die Architektur: Token-System
`--a2ui-*` existiert, aber Themes werden vom App-Entwickler als
`CSSStyleSheet` gesetzt (`samples/client/lit/shell/THEMING.md`). Google formuliert
es positiv als „generate your UI **using your existing component catalog**"
([v0.9-Blog](https://developers.googleblog.com/a2ui-v0-9-generative-ui)).
Das ist eine bewusste Sicherheits- und Branding-Entscheidung, kein fehlendes Feature.

**3. MCP Apps dreht die Richtung um.** Der Host schickt Tokens in die Karte
(`--color-background-primary`, `--font-sans`, `--border-radius-md`) — „Views use
these variables with fallbacks to match the host's visual style"
([Overview](https://apps.extensions.modelcontextprotocol.io/api/documents/Overview.html)).
T bräuchte die Gegenrichtung. Es gibt sie in der Spec nicht.

**4. Wo „Agent + Design-Tokens" wirklich existiert, ist es Build-Zeit.**
Style Dictionary als Token-Build mit Agent-Lookup-Format (Supernova,
26.10.2026), Ignite-UI-Theming-MCP (Agent generiert Palette und Stylesheet im
Projekt), ThemeForge („a drop-in CSS theme system **an AI agent installs** in one
step", 05.10.2026), `tailwind-design-system`-Skill (w0shobson, 40k ★), und
`langchain-ai/design-agent` (baut `tokens.css` aus `tokens.json`). Alles
Entwickler-Werkzeug, nichts davon läuft pro Besucher.

**5. Drei echte Laufzeit-Präzedenzfälle — alle schmal:**
- **assistant-ui `set-theme-card.tsx`**: Agent-Tool setzt `light`/`dark`/`system`
  auf der Host-Seite, mit Freigabe und Undo. Fertiger Code, MIT. Umfang: eine
  Achse, drei Werte.
- **CopilotKit `reskinnable-demo`**: komplette App per Token-Wert-Tausch
  umskinnen („a reskin is a pure value swap"). Auslöser: Mensch per Dropdown.
- **AG-UI-Doku**: `{"path":"/user/preferences","value":{"theme":"dark"}}` als
  Beispiel einer State-Delta. Beispiel, kein Produkt.

**6. Der Markt redet über „adaptive UI", meint aber K.**
Griddynamics beschreibt „the interface is no longer a persistent container; it's
a variable, generated at runtime" — die Lösung ist dort ein Komponentenmodell
mit Vertragsregeln, nicht ein Token-Kanal. Orizon formuliert die Gegenposition
sauber: „Component libraries define what can be generated. **Design tokens set
the boundaries.**" Tokens sind die Grenze, nicht das Steuer.

**Zusammengefasst:** Wer T baut, baut 2026 gegen die ausdrückliche Design-Entscheidung
der vier größten Spezifikationen (A2UI, MCP Apps, json-render-Katalog, ChatKit-Options).
Das ist machbar — die Teile sind da — aber es ist kein Muster, auf das man sich
berufen kann. S3 hatte mit „upstream unbelegt" recht, und zwar aus dem härteren
Grund: nicht übersehen, sondern absichtlich nicht gebaut.

**Ein Nebenbefund, der zur Sache gehört:** die Skizze selbst ist an dieser Stelle
ambivalent. Ausschnitt 6 will das Farbgefühl der ganzen Seite, `sketches:189-199`
notiert gleichzeitig Kritik am oberflächlichen Farbthema, und
`Agentfähig/GreateWriting.txt:222` nennt reines Umfärben „decoration, not
adaptation" (zitiert nach S3, `graphify-out/synergie/S3-generative-ui.md:147-148`).
T ist also nicht nur upstream schwach gedeckt, sondern im Projekt auch
inhaltlich umstritten. Das ist eine Owner-Frage, keine Upstream-Frage.

---

## Wenn man den besten Kandidaten nimmt

„Bester Kandidat" heißt hier: **AG-UI als Kanal (#1) plus die Token-Architektur
aus #2/#3 als Vorlage.** Nicht ein Produkt, das T liefert — es gibt keins —,
sondern die kleinste Kombination, in der T nur noch Glue ist.

Was dann noch selbst geschrieben werden muss, geschätzt:

| Baustein | Zeilen | Warum es übrig bleibt |
|---|---|---|
| Token-Vertrag `:root` (Namen + Defaults) | 40–60 | Muss das Design des Owners abbilden. A2UI/assistant-ui liefern Namenslisten (`THEME_TOKENS`, 25 Einträge), aber nicht deine Werte |
| State-Schema im Agenten (`colour`, `warmth`, `form`, `outputStyle`, `visibleSliders`) | 30–50 | Fachliches Modell der Skizze. Kein Upstream kennt „warm ↔ cold" |
| Mapping State → CSS (`documentElement.style.setProperty`) | 40–70 | Der eigentliche T-Kern. 10 Zeilen Technik, 30–60 Zeilen Sonderfälle (HSL-Tripel, dunkel/hell, Übergangsdauer) |
| Slider-UI (3 sichtbar, Zwei-Wege) | 60–120 | Regler selbst sind Design-System-Bausteine (shadcn o. ä.), die Bindung an den Kanal ist Glue |
| Gegenrichtung Mensch → Agent (Slider losgelassen ⇒ State-Delta) | 20–40 | AG-UI trägt es, die Absicht „wer hat zuletzt gezogen" nicht |
| Werte-Validierung + Kontrast-Klemme | 60–100 | Pflicht, sobald ein Modell Farben schreibt (WCAG). Kein Upstream macht das für dich |
| Undo / Persistenz pro Besucher | 30–50 | `set-theme-card` zeigt das Muster (Undo-Button, vorheriger Wert) |
| **Summe T, nur Farbe/Stil** | **≈ 280–490** | |

Wenn „form" auch Layout-Chrome heißt (Radius, Dichte, Abstände, sichtbare
Rahmen), kommen 60–120 Zeilen dazu, und die visuelle Abnahme wird teuer, weil
jede Kombination geprüft werden muss: **≈ 350–600 Zeilen**.

Wenn die Slider dagegen **strukturell** sind (§S3-Anker A2, „3 von 5"), kippt
die Rechnung auf die K-Seite: json-render/A2UI liefern Katalog, Registry,
`$bindState`, `visible`, Streaming — dann sind es 150–300 Zeilen Glue, aber das
Ergebnis ist ein Panel, nicht die Seite.

**Ehrliche Einordnung:** Das sind keine 5.000 Zeilen. Es ist auch kein
`npm install`. Der Aufwand liegt in dem Bereich, in dem „kein eigener Code"
faktisch zu „etwas eigener Code" wird — und zwar genau an der Stelle, die das
Produkt ausmacht.

---

## Die drei besten Andockpunkte

**1. AG-UI als Zustandskanal (Repo #1).**
Weil T keinen Renderer braucht, sondern einen Kanal, und AG-UI der einzige
gereifte, protokollreine, bidirektionale Kanal mit JSON-Patch-Deltas ist (MIT,
20,5k ★, Push am Tag der Prüfung) — alles, was danach kommt, ist bewusst
Client-Sache.

**2. CopilotKit `reskinnable-demo` als Token-Vertrag (Repo #2).**
Weil dort der Satz steht, der T überhaupt haltbar macht: „the shell owns the
design-token *names*; each skin owns the *values*" — mit lauffähigem Code,
mehreren Themes und einem dokumentierten Dunkelmodus-Fallstrick. Das ist die
Antwort auf „wie bricht die Seite nicht, wenn der Agent Werte tauscht".

**3. assistant-ui `set-theme-card` + `THEME_TOKENS` (Repo #3).**
Weil es der einzige Fund ist, in dem ein **Agent** das Theme der **Seite**
setzt — mit Freigabe, Ablehnung und Undo — und weil `theme.ts` eine
25-Einträge-Token-Liste mitliefert, die man wörtlich als Startpunkt nehmen kann
(MIT).

> Nicht in den Top drei, aber der vierte Punkt: **json-render** (#4) bleibt der
> richtige Andockpunkt für den K-Zweig — nicht für T. Es ist das einzige hier
> gelistete Werkzeug, das `$bindState` (Zwei-Wege) und `visible` („3 von 5")
> zusammen bringt, also genau S3-Anker A2+A3 als K.

---

## Was die Regel „kein eigener Code" kostet

Wenn `tech/INTENT.md:34` hart bleibt — also kein Zeichen eigener Glue —, dann
fällt Folgendes aus dem Produkt, konkret:

**1. Die Slider selbst.** Kein Upstream liefert „Regler, die die Seite
verändern" als fertiges Feature. Ergebnis: Der Agent kann fragen, was der Mensch
will, aber die Antwort hat keinen Ort, an dem sie wirkt. Ausschnitt 5 („max 3",
„real time effects") entfällt vollständig.

**2. „the 'design' colour feel of the website" (Ausschnitt 6).** Das ist die
Zeile, die „Not a website — an Agent itself" technisch einlöst. Ohne sie bleibt
ein Chat mit Stimme — also die Kategorie, gegen die das Produkt antritt
(`tech/research/konkurrenz.md:21`, Open WebUI als Gegenbeispiel).

**3. `form` und Layout-Chrome.** Dafür gibt es **null** Upstream, nicht einmal
schwache. Fällt ersatzlos weg, nicht „später".

**4. „maybe 5 options but only show 3".** Der Agent darf nicht wählen, welche
Regler sichtbar sind, weil Sichtbarkeit aus Zustand eine Katalog-Sache ist
(json-render `visibility.mdx`) und damit eigener Code. Entfällt.

**5. Die Zwei-Wege-Bindung als Produktversprechen.** Der Kanal (AG-UI) ist
benutzbar, aber die Zuordnung „welcher Wert bedeutet welche CSS-Variable" ist
Design-Entscheidung des Owners und muss als Datei im Repo liegen. Eine
Token-Datei ist grenzwertig: sie ist Konfiguration, nicht Code — aber sie ist
der Punkt, an dem die Regel anfängt zu dehnbar zu werden.

**Was bleibt, wenn die Regel hart bleibt:** Stimme/Text/Bild-Eingang, Augen und
Effekte (T6 ist ohnehin „reines Frontend", `tech/INTENT.md:24`), Text-Antwort,
Sub-Agenten, Latenz. Also alles außer dem Alleinstellungsmerkmal. Der Agent
läuft dann in **einem** festen Skin, den der Owner einmal festlegt — das ist
technisch ein Chat-Produkt mit sehr guter Stimme, nicht „an Agent itself".

**Was die Regel nicht kostet:** Sicherheit. A2UIs Begründung („prevents agents
from injecting styling") ist ernst zu nehmen: sobald der Agent Token-Werte
schreibt, braucht es Wertebereiche, Kontrastprüfung und Undo. Das ist der
60–100-Zeilen-Block oben und der eigentliche Grund, warum die Spezifikationen
T nicht anbieten. Wer T baut, baut diese Klemme mit — egal wie die Regel steht.

---

## Belegstand

**Selbst geprüft (Datei/API gelesen, 19.11.2026):**
- Alle Sterne, Lizenzen, letzten Pushes in der Tabelle: `gh api repos/…`,
  15:18–15:40 UTC.
- AG-UI-State-Semantik inkl. `theme`-Beispiel: `docs.ag-ui.com/concepts/state`
  gelesen (Snapshot, Delta, JSON Patch, `useCoAgent`).
- json-render `$bindState` und `visible`: `apps/web/content/docs/data-binding.mdx:133-170`,
  `visibility.mdx` gelesen; `SpecStream` aus `streaming.mdx`.
- json-render hat **keine** Theming-Doku: `apps/web/content/docs/` vollständig
  gelistet (29 Einträge, kein `theme*`).
- A2UI-Token-Architektur: `samples/client/lit/shell/THEMING.md` und
  `.agents/skills/…/css-theming-styling.md` gelesen.
- assistant-ui: `apps/docs/components/tool-ui/set-theme-card.tsx` und
  `packages/generative-frame/src/theme.ts` vollständig gelesen.
- CopilotKit: `examples/showcases/reskinnable-demo/README.md` und
  `docs/DESIGN.md` gelesen (Token-Vertrag, Skin-Registry, `.theme-<id>`).
- ChatKit-Theme-Optionen: `developers.openai.com/api/docs/guides/chatkit-themes`
  und `…/custom-chatkit` gelesen.
- MCP Apps Token-Liste und Richtung: `apps.extensions.modelcontextprotocol.io`
  Overview + `ext-apps/…/add-app-to-server/SKILL.md`.
- Thesys C1 → OpenUI Cloud: `thesys.dev` Startseite („Formerly C1 API").
- Lizenzen mit Sonderfall: `vercel/ai` GitHub-API `NOASSERTION`, `LICENSE`-Datei
  Apache-2.0; `ext-apps` Lizenzübergang MIT → Apache-2.0 laut `LICENSE`-Datei.
- `openai/chatkit-js` letzter Push 31.07.2026 — selbst gelesen, Abstand zu allen
  anderen (19.11.2026) ist auffällig, Bewertung „wartungsarm" ist daraus
  **abgeleitet**, nicht bestätigt.

**Nur aus einer Quelle (nicht gegengeprüft):**
- „Client-controlled styling … prevents agents from injecting styling" (A2UI) —
  Medium-Artikel, sekundär. Die Architektur habe ich im Repo bestätigt, diesen
  Wortlaut nicht.
- CopilotKit-Säulen-Taxonomie (controlled/declarative/open + MCP Apps) — nur die
  Herstellerseite. Für die Aussage „K ist der Standard" ist ein Anbieter, der
  alle drei verkauft, eine gute, aber interessierte Quelle.
- Ignite-UI-Theming-MCP — nur ein YouTube-Demo-Video (10.03.2026), kein Repo,
  keine Lizenz. Deshalb kein Tabelleneintrag mit Reifegrad.
- Style Dictionary/Agent-Format, ThemeForge-Datum, `langchain-ai/design-agent` —
  je eine Blog-/Repo-Quelle, Beträge und Daten nicht nachgerechnet.
- Agent-Builder-Abschaltung 30.11.2026 — drei Sekundärquellen plus
  OpenAI-Deprecations-Seite im Suchergebnis; die Seite selbst habe ich nicht
  geöffnet.

**Nicht geprüft, ausdrücklich offen:**
- Ob AG-UI auf Cloudflare Workers praktisch läuft (SSE-Transport). Plausibel,
  aber nicht getestet — das ist S7-Stoff, nicht dieser Lauf.
- Ob `copilotkit` und Cloudflare Workers DO-State zusammen sauber laufen.
- Ob es kommerzielle Anbieter gibt, die T als Feature verkaufen („adaptive
  branding"), ohne es so zu nennen. Meine Suche fand keine; das ist ein
  Negativbefund aus sechs Suchläufen, kein Beweis der Abwesenheit.
- Zahlen zu npm-Downloads, Produktions-Adoptionsraten: nirgends erhoben.

---

## Ein nächster Schritt

Nicht Technik, sondern eine Zeile: ob „form" in `colour · form · output style`
die **Fläche** meint (dann T, dann 350–600 Zeilen Glue, dann gegen vier
Spezifikationen) oder die **Bausteine** (dann K, dann json-render, dann kein
T-Problem). Dieselbe Frage steht schon in `docs/DESIGN-DECISIONS.md:38`, nur
technisch formuliert. Diese Suche ändert die Antwort nicht — sie sagt nur, was
jeder Ausgang kostet.
