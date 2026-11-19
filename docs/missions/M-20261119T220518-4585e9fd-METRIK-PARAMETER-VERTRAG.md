# Metrik → Parameter → Oberfläche: Vertrag (Entwurf)

Mission `M-20261119T220518-4585e9fd` · 19.11.2026 · Integrator Claude Code. Owner-Vorgabe: viele NLP-Metriken (gern ~100) wirken auf das Gespräch; jede zahlt auf einen passenden Parameter ein; die Passung muss nicht exakt sein, soll aber sichtbar etwas bewirken. Die UI ist noch in Entwicklung, deshalb gibt es eine stabile Mittelschicht.

```
Schicht 1: Metriken (beliebig viele, roh)        → normiert auf 0…1
Schicht 2: 12 Oberflächen-Parameter (stabil)      → gewichtete Summe der Metriken, geglättet über Turns
Schicht 3: CSS-Variablen + Verhalten (änderbar)  → Komponenten lesen nur Schicht 2
```

## Schicht 2 — die 12 Parameter (fest, Werte 0…1, Ruhewert 0.5)

| id | Bedeutung (Gespräch) | Pol 0 | Pol 1 |
|---|---|---|---|
| `tempo` | Geschwindigkeit des Austauschs | langsam, bedächtig | schnell, knapp |
| `density` | Informationsdichte | luftig, wenig | dicht, viel |
| `warmth` | emotionale Wärme | kühl, sachlich | warm, zugewandt |
| `calm` | Erregung invertiert | aufgeregt, angespannt | ruhig, gelassen |
| `closeness` | Nähe / Vertrautheit | distanziert | nah, persönlich |
| `openness` | Offenheit / Exploration | fokussiert, eng | offen, weit |
| `attention` | Fokus des Nutzers | zerstreut, springend | konzentriert, bei einem Thema |
| `certainty` | Gewissheit | zögernd, unsicher | bestimmt, sicher |
| `playfulness` | Verspieltheit | ernst | verspielt |
| `formality` | Förmlichkeit | locker | förmlich |
| `depth` | Tiefe / Abstraktion | konkret, oberflächlich | tief, abstrakt |
| `energy` | Aktivierung / Antrieb | müde, leise | lebendig, laut |

## Schicht 1 — Eintragsformat je Metrik (JSON)

```json
{
  "id": "question_ratio",
  "name": "Question ratio",
  "group": "lexical | syntactic | semantic | affective | pragmatic | interaction | discourse",
  "source": "user_text | user_input_events | agent_text | turn_timing",
  "compute": "Kurzbeschreibung, im Browser in JS berechenbar",
  "library": "winkNLP (MIT) | none",
  "raw_range": "0..1",
  "normalize": "wie auf 0..1 abgebildet (Clamp/Sigmoid/Perzentil)",
  "weights": { "openness": 0.4, "attention": -0.2 },
  "confidence": "high | medium | low",
  "rationale": "warum diese Passung"
}
```
Gewichte −1…1, pro Metrik höchstens 3 Parameter. Nur Englisch, nur Text, nur Browser (kein Server, kein Modell > ~2 MB).

## Schicht 3 — Eintragsformat je Parameter
CSS-Variablen (`--p-tempo` …) + konkrete Wirkung je Komponente (Presence/Augen, Typewriter-Kadenz, Paar-Layout/Typografie, Composer, Agent-Antwortstil), markiert als VERHALTEN oder DEKORATION.
