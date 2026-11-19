# Projektstand — Agentfähig

Stand: 19.11.2026. Phase: Planung — Reihenfolge und Wenn-Dann-Wege festgelegt.

## Planungsstand

Was ich vorhabe, in meinen eigenen Worten: [`VISION-samuel.md`](VISION-samuel.md).

Ein unabhängiges Zweitgutachten (Argon/Gemini und ich) zur Frage „WOW oder zum
Scheitern verurteilt" mit drei Produktfallen und der fehlenden Teststufe:
[`GUTACHTEN-wow-oder-scheitern.md`](GUTACHTEN-wow-oder-scheitern.md).

Der Bauplan steht in [`PLAN-ADREN.md`](PLAN-ADREN.md): fünf Stufen von der
Planung bis zum Erstbau, mit Wenn-Dann-Diagramm, Mess-Gates und drei ADRs in
[`adr/`](adr/). Der nächste Schritt ist der Messlauf (Stufe 1), kein
Anwendungscode.

Vergleichbare Projekte wurden gesucht:
[`UPSTREAM_SEARCH-vergleichbare-projekte.md`](../UPSTREAM_SEARCH-vergleichbare-projekte.md).
Darin ist ein früheres Risiko ausgeräumt — für Augen mit Präsenz und für die
live erzeugte Oberfläche gibt es inzwischen Upstreams.

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

Am 19.11.2026 mit Samuel geklärt ([Entscheidungen](DESIGN-DECISIONS.md)):

1. Erster Besucherablauf: text-erster Ablauf — Ankommen, Augen wachen nach
   etwa 5 Sekunden auf, eine Textnachricht, Typewriter-Antwort im Fokus;
   Hintergrund-Ergebnisse erscheinen still über State-Sync.
2. Eingabemodalität: Text zuerst, Mikrofon nach Klick. Voice ist damit Teil
   des Erstbaus.
3. Regler: erste Version mit einem Regler, dessen Belegung im Gespräch entsteht
   (Agent erfragt sein Aussehen); Ausbaupfad 1 → 2/3 → max 3.
4. Backend-Aufrufe: Front-Agent als schneller echter Duplex-Sprachagent;
   dahinter echte schlaue Agenten (Analysing, Looking-up).
5. Prüfung: Messlauf als Gate vor dem Erstbau — `examples/voice-agent` lokal,
   20 englische Sprach-Wechsel (Sprach-Entscheidung vom 19.11., 2. Runde;
   ursprünglich deutsch geplant), Auswertung von `first_audio_ms`; benötigt
   Plan-Modus und Owner-Freigabe.

Nächster Schritt: Der Messlauf-Plan liegt ausgearbeitet vor
([MESSLAUF-PLAN.md](../tech/MESSLAUF-PLAN.md)) — nach Samuels Sprach-Entscheidung
(Voice auf Englisch) **einstufig und ohne externe Keys**: 20 englische
Sprach-Wechsel auf dem unveränderten Beispiel, Auswertung von `first_audio_ms`
und Stage-Timings. Die deutsche Pipeline bleibt wünschbares Feature und ist
näher dran als gedacht: deutsches STT via `nova-3` ist SDK-seitig belegt
([CLOUDFLARE-MACHBARKEIT.md](CLOUDFLARE-MACHBARKEIT.md), Missions-Artefakt vom
19.11., Audit `A-20261119T161858-753a2d1e`), nur TTS braucht einen externen
Provider — Kostenrecherche läuft. Freigabe für Klon und Lauf ist erteilt
(mit Plan-Validator); Annahme Free-Account (Samuel: „free ist immer besser
als paid"), der LLM-Tausch im Klon ist damit der erwartete Fall. Danach
entscheidet die Build-Freigabe. Noch keine abschließende gemeinsame
Designabnahme: offen sind Regler-Default, das Ergebnis des Besuchs im Detail,
Fehler-UX und die Sprache des Text-Kanals neben dem englischen Voice-Kanal.

## Aktuell vorhanden

- Ursprüngliche Idee als Sprachtranskript in `Idea`.
- Versionierte Skizze mit PDF, PNG, Ausschnitten und Rohdaten.
- Projektanweisungen und Ablage für die nächsten Arbeitsschritte.
- Strukturprüfung über `bash scripts/validate.sh`.

Noch offen: Produktabnahme, technische Architektur, Anwendung, Verhaltenstests
und Deployment. Keine dieser Leistungen ist durch das Gerüst bereits erbracht.
