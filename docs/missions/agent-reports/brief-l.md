HAI-Mission M-20261119T220518-4585e9fd (Integrator Claude Code). Projekt agentfähig: eine Website, die sich wie ein Agent verhält. Kein git, keine Installation, kein Netzwerk. Lege AUSSCHLIESSLICH die Datei src/dev/conversation-pathways.json an (ändere nichts anderes).

ROLLE: AGENT L — PSEUDO-GESPRÄCHE / PATHWAYS
ZIEL: Mindestens 10 halluzinierte, realistische Gesprächsverläufe zwischen einem Besucher und dem Agenten — je einer pro möglichem Pathway, wie sich ein Gespräch drehen kann. Sie dienen später als Entwicklungsdaten (Dev-Agent), als Testfälle für die Metrik-Engine und als Design-Material.
LIES ZUERST: docs/missions/M-20261119T220518-4585e9fd-METRIK-PARAMETER-VERTRAG.md (12 Parameter), docs/visual-exploration/03-pathway-flow.md, docs/VISION-samuel.md, sketches/2026-11-12-agentfaehig.md, src/dev/devAgent.js.
REGELN DES PRODUKTS: Englisch. Der Besucher spricht zuerst, der Agent antwortet nur auf Eingabe (strikt Prompt/Response). Nur das aktuelle Paar ist sichtbar. Der Agent fragt NICHT nach Farbe/Form/Stil; die Oberfläche verändert sich aus dem Gespräch. Unterbrechen ist erlaubt. Der Agent ist kein Assistent-Chatbot ("How can I help you" verboten), sondern eine Präsenz: kurz, zugewandt, neugierig, ehrlich.
PATHWAYS (mindestens diese, gern mehr): neugieriger Erkunder; skeptischer Tester, der den Agenten bricht; Eiliger mit konkretem Ziel (Website/Projekt anfragen); Unsicherer, der kaum schreibt; Verspielter/Trolliger; emotional Belasteter (Agent bleibt sicher und grenzt sich ab, keine Therapie); Fachmensch, der über Agents/HAI fachsimpelt; Firma/Team-Anfrage (Pathway website/person/team/company aus der Skizze); Unterbrecher, der mitten in Antworten neu schreibt; jemand, der nach 2 Turns geht; Rückkehrer nach langer Stille; Nicht-Muttersprachler mit Fehlern.
FORMAT (gültiges JSON, ein Objekt):
{ "version": 1, "note": "DEVELOPMENT DATA — synthetic conversations, not real users",
  "parameters": ["tempo","density","warmth","calm","closeness","openness","attention","certainty","playfulness","formality","depth","energy"],
  "pathways": [ { "id": "curious-explorer", "title": "...", "persona": "...", "entry": "wie die Person ankommt", "turns": [
     { "user": "...", "typing": { "duration_ms": 0, "backspaces": 0, "pause_before_send_ms": 0, "interrupted_agent": false },
       "agent": "...",
       "params": { "tempo": 0.5, "density": 0.5, "warmth": 0.5, "calm": 0.5, "closeness": 0.5, "openness": 0.5, "attention": 0.5, "certainty": 0.5, "playfulness": 0.5, "formality": 0.5, "depth": 0.5, "energy": 0.5 },
       "surface": "1 Satz: was die Seite/Augen/Typewriter jetzt anders macht (Verhalten, nicht nur Farbe)" } ],
     "outcome": "wie es endet", "design_lesson": "was wir daraus für die UI lernen" } ] }
Je Pathway 4–10 Turns; params plausibel aus dem Turn abgeleitet und über Turns geglättet (nicht springen ohne Grund); Agentenantworten 1–3 Sätze.
VERIFIKATION: node -e "const j=JSON.parse(require('fs').readFileSync('src/dev/conversation-pathways.json','utf8'));if(j.pathways.length<10)throw new Error('zu wenige');console.log(j.pathways.length,'pathways',j.pathways.reduce((n,p)=>n+p.turns.length,0),'turns')" muss laufen. STOP danach, antworte mit der Pathway-Liste.
