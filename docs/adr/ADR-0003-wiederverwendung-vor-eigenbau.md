# ADR-0003 — Wiederverwendung vor Eigenbau: Augen und Layout-Generierung

- **Status:** vorgeschlagen (Owner-Entscheidung ausstehend)
- **Datum:** 19.11.2026
- **Bezieht sich auf:** `UPSTREAM_SEARCH-vergleichbare-projekte.md`,
  `tech/UPSTREAM_SEARCH-cloudflare.md`

## Kontext

`tech/CLOUDFLARE_MACHBARKEIT.md` führt als Risiko:

> „Keine Vorlage für den Kern der Idee. Die Konkurrenz-Recherche fand kein
> Projekt, bei dem der Agent die eigene Seite per Regler live umgestaltet."

Diese Aussage stammt vom 12.11.2026 und ist **seitdem überholt**. Die erweiterte
Suche vom 19.11.2026 hat zwei Upstreams gefunden, die genau die beiden
schwierigsten Teile der Skizze liefern:

- **Augen mit Präsenz:** `MCERQUA/OpenVoiceUI` → `src/face/EyeFace.js` (MIT).
  Gelesen: zwei Augen, stimmungsabhängige Lidanimationen
  (`happy`, `sad`, `angry`, `thinking`, `surprised`, `listening`),
  maus-verfolgende Pupillen, autonomes Blinzeln und Umsehen. Reines
  Frontend-JavaScript, kein Server, kein Python.
- **Agent erzeugt Oberfläche live:** `Pika-Labs/Pika-Experiments` →
  `generative-ui/` (Apache-2.0). Muster: „the agent listens, analyzes what's
  being discussed, and dynamically generates the most appropriate visual
  composition for each response."

Samuel ist kein erfahrener Entwickler. Das verschärft die Pflicht, verfügbaren
Code zu nutzen: Eigenbau bei ungeprüfter Latenz, unbekanntem Kostenrahmen und
unklarem Deutsch-Sprachpfad ist das größte Risiko in diesem Projekt.

## Entscheidung

**Für die Augen und die Layout-Logik wird eigener Code nicht geschrieben.**

- `EyeFace.js` wird **übernommen** (MIT). Die Datei ist in sich geschlossen,
  arbeitet gegen ein `EventBus` und ein `FaceManager`, beides ebenfalls im
  Repo. Sie wird an das Cloudflare-Protokoll gehängt: die Stimmungsnamen der
  Skizze (`idle`, `listening`, `thinking`, `speaking`) müssen auf die
  vorhandenen (`happy`, `sad`, …) abgebildet werden — das ist eine
  Adapter-Funktion, kein Neuaufbau.
- Die Layout-Erzeugung aus `generative-ui` wird als **Muster** übernommen, nicht
  der Code. Der Pika-Stack hängt an OpenAI Realtime und Pika MCP; der
  transportneutrale Teil ist die Idee „Agent wählt Layout passend zur Antwort".

**Was damit ausdrücklich nicht entschieden ist:** Ob Cloudflare überhaupt die
Plattform bleibt. Dieser ADR sagt nur: Falls Cloudflare, dann mit
übernommenem Augen-Code.

## Konsequenzen

**Positiv**

- Zwei der schwersten Teile (Präsenz-Animation, Layout-Logik) sind geliefert
  und lizenzlich sauber.
- Der Eigenbau-Anteil sinkt auf: Transport, State-Sync, Regler-Bindung,
  Design-Handwerk. Das sind die Teile, die ohnehin Agentfähig-spezifisch sind.
- Das Risiko „keine Vorlage" aus der Machbarkeitsanalyse ist ausgeräumt.

**Negativ**

- **MIT verlangt die Copyright-Notiz.** Bei Übernahme muss die Herkunft im
  Code stehen. Das ist lästig, aber billig.
- `EyeFace.js` bringt eine Abhängigkeit mit: `FaceManager`, `EventBus`, und
  sie erwartet bestimmte DOM-IDs (`left-eye`, `right-eye`,
  `left-pupil-container`). Das ist ein **Adapter-Bedarf**, kein Kopieren
  ganzer Dateien.
- Zwei Fremdquellen (MIT + Apache-2.0) in einem Projekt erfordern saubere
  Herkunftsnachweise.

**Neutral**

- Apache-2.0 (Pika) verlangt bei Weitergabe eine Namensnennung und den
  Lizenztext. Da nur das *Muster* und nicht der Code übernommen wird, ist das
  eine Notiz für später, kein Blockierer.

## Offen

- Wie groß ist der Adapter-Aufwand genau? Erst nach dem Lesen von
  `BaseFace.js`, `FaceManager` und `EventBus` im Detail bewertbar. → Gehört in
  den Plan-Abschnitt „Prototyp", nicht hier.
- Bleibt `capturia` (MIT) als dritte Referenz, falls `EyeFace` nicht passt?
  Muster, nicht Code.
