# Designentscheidungen — Grilling, 12.11.2026

Quelle: direkte Antworten von Samuel in dieser Session. Dies ist ein Zwischenstand,
keine vollständige Spezifikation und keine Freigabe zur Implementierung.

## Bestätigt

| Thema | Entscheidung |
| --- | --- |
| Initiative | Der Mensch gibt den Intent; der Agent reagiert darauf. |
| Präsenz vor dem Intent | Augen und Bewegung dürfen Präsenz zeigen: sanft, minimal, „unaufregend“. |
| Ohne hörbaren Ton | Antwort auch als Text; eine sanfte visuelle Reaktion signalisiert die Antwort. |
| Text und Verlauf | Aktuelle Antwort bleibt sichtbar. Ältere Antworten treten zurück und werden beim Scrollen sichtbar. |
| Neue Antwort | Neue Antwort steht im Fokus, auch wenn vorher im Verlauf gelesen wurde. Der Vorschlag, die alte Leseposition zu halten, wurde abgelehnt. |
| Typewriter | Gewünscht: lebendig und pulsierend, nicht bloß gleichmäßig. |
| Wortrhythmus | Kurze Wörter schnell; bei längeren Wörtern auch langsameres Zeichentempo. Exakte Raten und Übergänge offen. |
| Zusammenarbeit | Eine Frage pro Runde; nach jeder inhaltlichen Antwort ein OpenCode-Scout mit DeepSeek V4.1 Flash. |

## Hypothese und technische Abhängigkeiten

Samuel begründet den Wortrhythmus damit, dass kurze Wörter schneller erfasst werden
können. Die Übertragung auf buchstabenweise Animation ist noch ungeprüft; siehe
[Recherche](../research/SCOUT-SYNTHESIS.md). Diese Unsicherheit hebt die gewünschte
Gestaltungsrichtung nicht auf.

Cloudflare unterstützt Text-Streaming grundsätzlich. Ein gemessener End-to-End-Lauf
mit gewähltem Modell, Browser und gegebenenfalls Sprache fehlt noch.

## Offene Fragen

- Erster konkreter Besucherablauf und Ergebnis der Interaktion.
- Standard-Einstieg und Eingabekanäle. Samuel hat auf Mikrofonberechtigung
  hingewiesen; „Text zuerst, Mikrofon nach Klick“ wurde noch nicht bestätigt.
- Beginn des Fokuswechsels beim ersten Text oder erst bei vollständiger Antwort.
- Typewriter-Tempo, Übergänge, Verhalten bei Streaming-Pausen und langen Antworten.
- Bedeutung und Belegung der bis zu drei sichtbaren Slider.
- Modellprovider, Voice-Pipeline und konkrete Architektur.
- Abnahmekriterien und abschließende Bestätigung des gemeinsamen Verständnisses.

## Fortsetzung

Mit dem [Grilling-Skill](../skills/grilling/SKILL.md) an der offenen Frontier
fortsetzen. Entscheidungen oben nicht erneut abfragen. Fakten recherchieren,
Vorschläge als Vorschläge kennzeichnen. Noch keine Implementierung beginnen.
