# Projektstand — Agentfähig

Stand: 12.11.2026. Phase: Idee und Design strukturieren.

## Ausgangspunkt

Samuels lokales Transkript `Idea` beschreibt die Reihenfolge Planen, Malen,
Strukturieren und Bauen. Ziel ist ein Embodiment des Human-Agent Interface auf
Agentfähig, mit Voice, Text, Kontext und Skills. Cloudflare ist die genannte
technische Richtung; eine konkrete Implementierung ist noch nicht festgelegt.

Die [Skizze](../sketches/2026-11-12-agentfaehig.md) ergänzt Bildinput, eine weiche
Augen-Animation und eine lebendige, einladende Oberfläche. Nutzer sollen die
Richtung bestimmen und Farbe, Form und Ausgabestil beeinflussen können.
Bis zu drei gleichzeitig sichtbare Slider sind eine Designidee.

## Vorschläge aus der Skizze, noch keine Architekturentscheidungen

- Ein schneller Front-Agent mit nachgelagerter Analyse und Recherche.
- Reaktion unter einer Sekunde, möglichst einschließlich TTS, als Wunschziel.
- Cloudflare Agent SDK und CSS als technische Ansatzpunkte.
- Sichtbare HAI-Interaktion und unmittelbare Effekte der Designregler.

Unklare Begriffe und Lesarten sind in der Skizzentranskription markiert.
Die [Designinspiration](../Agentfähig/GreateWriting.txt) liefert Hintergrund;
ihre Aussagen sind nicht automatisch Anforderungen oder verifizierte Fakten.

## Vor dem ersten Build zu entscheiden

1. Welcher erste Besucherablauf soll vollständig funktionieren?
2. Welche Eingabemodalität gehört in diesen ersten Ablauf?
3. Welche Regler verändern konkret welche sichtbaren Eigenschaften?
4. Welche Agent-Funktion benötigt einen echten Backend-Aufruf?
5. Wie werden Reaktionszeit, Nutzerkontrolle und Fehlerverhalten geprüft?

Das Grilling läuft bereits: [bestätigte Entscheidungen](DESIGN-DECISIONS.md)
und [aggregierte Recherche](../research/SCOUT-SYNTHESIS.md) sichern den Zwischenstand.
Nächster Schritt: offene Eingabe- und Produktfragen einzeln mit Samuel klären.
Noch keine abschließende gemeinsame Designabnahme oder Build-Freigabe.

## Aktuell vorhanden

- Ursprüngliche Idee als Sprachtranskript in `Idea`.
- Versionierte Skizze mit PDF, PNG, Ausschnitten und Rohdaten.
- Projektanweisungen und Ablage für die nächsten Arbeitsschritte.
- Strukturprüfung über `bash scripts/validate.sh`.

Noch offen: Produktabnahme, technische Architektur, Anwendung, Verhaltenstests
und Deployment. Keine dieser Leistungen ist durch das Gerüst bereits erbracht.
