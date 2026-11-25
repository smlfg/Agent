# Anwendungscode

Die Living Surface ist eine lauffähige Vanilla-ES-Module-Anwendung ohne
Laufzeit-Abhängigkeiten und ohne Build-Schritt. Einstieg:
[`living-surface.html`](living-surface.html) und [`main.js`](main.js).

## Module

| Bereich | Verantwortlichkeit |
| --- | --- |
| `state/` | Gesprächsphasen einschließlich `dormant`, `listening`, `thinking`, `speaking`, `idle` und `error` |
| `conversation/` | Composer, aktuelle Frage/Antwort, Typewriter, Unterbrechen und verständliche Fehleranzeige |
| `presence/` | Reaktive Augen, Blickführung, Ruheverhalten und parametrische Bewegungsprofile |
| `surface/` | Validierte Surface-State-Patches, Projektion, Undo/Reset, kontextuelle Regler und Worlds |
| `metrics/` | Konversations- und räumliche Parameter für die Oberflächenanpassung |
| `agent/` | Systemprompt, Provider-Adapter und Fallback-Kette |
| `voice/` | Freiwillige Mikrofon-Eingabe nach Klick |
| `dev/` | Deterministische, als `DEV DATA` markierte lokale Antworten und Fehler-Simulation |
| `vendor/` | Lizenzierte, unveränderte Drittanbieter-Bausteine |

Die räumliche Darstellung nutzt **2.5D-Techniken** (Ebenen, Licht, Schatten,
Parallaxe und gestaffelte Bewegung) in `surface/`, `presence/` und
`styles/bones/`. Es gibt keine WebGL-/Three.js-Welt und keine 3D-Engine.

## Lokal und produktiv

- `npm run dev` serviert `src/` auf `http://127.0.0.1:5173/living-surface.html`.
- Lokal antwortet standardmäßig `dev/devAgent.js` mit sichtbar markierten
  `DEV DATA`; das ist kein Modellnachweis.
- Produktiv spricht `agent/remoteAgent.js` mit `POST /api/agent` auf dem
  Cloudflare-Worker `agentfaehig`.
- Produktionsfehler zeigen einen ehrlichen Fehlerzustand statt einer als live
  getarnten lokalen Antwort.

Deployment-Konfiguration und Build liegen unter
[`../deploy/agentfaehig-site/`](../deploy/agentfaehig-site/). Verifikation:
[`../tests/README.md`](../tests/README.md).
