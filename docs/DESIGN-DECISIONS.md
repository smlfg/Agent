# Designentscheidungen — Grilling 12.11.2026, Produktklärungen 19.11.2026

Quelle: direkte Antworten von Samuel in diesen Sessions. Dies ist ein Zwischenstand,
keine vollständige Spezifikation und keine Freigabe zur Implementierung.
Die Fragestellungen stammen aus der
[Skizze vom 12.11.2026](../sketches/2026-11-12-agentfaehig.md).

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
| Erster Besucherablauf (19.11.) | Text-erster Ablauf: Ankommen, Augen wachen nach etwa 5 Sekunden sanft auf, eine Textnachricht, Typewriter-Antwort im Fokus. Hintergrund-Ergebnisse erscheinen still über State-Sync. |
| Eingabemodalität (19.11.) | Text zuerst; Mikrofon wird erst nach Klick freigegeben. Damit ist Voice Teil des Erstbaus (zuvor offener Punkt, jetzt bestätigt). |
| Slider (19.11.) | Erste Version mit genau einem Regler. Die Belegung entsteht im Gespräch: der Agent erfragt sein Aussehen. Ausbaupfad wie in der Skizze: 1 → 2/3 → max 3. |
| Backend-Aufrufe (19.11.) | Der Front-Agent ist ein schneller echter Duplex-Sprachagent; dahinter laufen echte schlaue Agenten (Analysing, Looking-up) statt Simulationen. Ergebnisse erscheinen still über State-Sync. |
| Prüfung (19.11.) | Messlauf als Gate vor dem Erstbau: `examples/voice-agent` lokal, Auswertung von `first_audio_ms` und Stage-Timings. Benötigt Plan-Modus und Owner-Freigabe. Laufsprache: 20 englische Wechsel (2. Runde, 19.11.; ursprünglich deutsch geplant). Freigabe erteilt — Lauf vorbehaltlich des Plan-Validators. |
| Voice-Sprache (19.11., 2. Runde) | Die Voice-Pipeline (STT/TTS) läuft auf Englisch; die englischsprachigen Default-Bausteine (`flux`, `aura-1`) sind damit bewusst gewählt. Deutsch bleibt **wünschbares Feature** (Samuel: „schönes Feature, aber wenn es nicht geht, dann halt Englisch") — geparkt, erreichbar über externen TTS (Samuel nennt ElevenLabs, weitere Anbieter; Kostenrecherche läuft). Messlauf dadurch entzerrt: 20 englische Wechsel statt deutsche Pipeline. |

## Hypothese und technische Abhängigkeiten

Samuel begründet den Wortrhythmus damit, dass kurze Wörter schneller erfasst werden
können. Die Übertragung auf buchstabenweise Animation ist noch ungeprüft; siehe
[Recherche](../research/SCOUT-SYNTHESIS.md). Diese Unsicherheit hebt die gewünschte
Gestaltungsrichtung nicht auf.

Cloudflare unterstützt Text-Streaming grundsätzlich. Ein gemessener End-to-End-Lauf
mit gewähltem Modell, Browser und gegebenenfalls Sprache fehlt noch.

## Konsequenzen der Entscheidungen vom 19.11.2026

- Der Messlauf ist durch Voice im Erstbau vom Empfehlungs- zum Pflichtpunkt
  geworden. Der frühere Grund „Deutsch-Fähigkeit ungeprüft“ ist am 19.11. geklärt:
  `flux`/`aura-1` sind nachweislich nur Englisch; deutsches STT ist über
  `WorkersAINova3STT({ language: “de“ })` SDK-seitig belegt, deutsches TTS braucht
  einen externen Provider. Die Stille-Sorge (+500 ms obendrauf) ist SDK-seitig
  widerlegt: der Server ignoriert `end_of_speech`, das Turn-Ende bestimmt das
  STT-Modell. Verbleibende Pflichtgründe für den Lauf: das reale `first_audio_ms`
  messen (Cloudflares Budget 890 ms bleibt unaufgelöst), Beta-Verhalten im
  Live-Betrieb, Modell-Wahl unter den Deprecations vom 20.11.2026 und der
  LLM-Pfad auf einem Free-Account. Evidenz mit SDK-Quellcode-Nachweisen:
  [CLOUDFLARE-MACHBARKEIT.md](CLOUDFLARE-MACHBARKEIT.md) (Missions-Artefakt vom
  19.11.).
- Das Umgestaltungs-Verhalten (Agent erfragt sein Aussehen und wirkt live) hat
  keine gefundene Vorlage ([konkurrenz.md](../tech/research/konkurrenz.md));
  der Mechanismus selbst ist trivial über State-Sync und CSS. Bewusstes
  Eigenbau-Risiko, kein kopierbares Muster.
- Die dokumentierte Spannung zur
  [Designinspiration](../Agentfähig/GreateWriting.txt) („bespoke principle“)
  bleibt als Designrisiko notiert, gerade weil der erste Regler vermutlich die
  Farbe oder Temperatur betreffen wird.

## Offene Fragen

Stand 19.11.2026 — die fünf Produktfragen aus `PROJECT.md` sind geklärt; folgende
Punkte bleiben offen:

- Konkretes Ergebnis des Besuchs: bleibt eine sichtbare Umgestaltung der Seite
  Teil des ersten Ablaufs oder folgt sie erst dem Ausbaupfad der Regler?
- Default-Belegung des ersten Reglers, solange der Nutzer noch nichts gesagt hat
  (Kandidat aus der Skizze: die warm↔cold-Achse).
- Beginn des Fokuswechsels beim ersten Text oder erst bei vollständiger Antwort.
- Typewriter-Tempo, Übergänge, Verhalten bei Streaming-Pausen und langen
  Antworten (Regel für leerlaufenden Puffer).
- Modellprovider, Voice-Pipeline und konkrete Architektur; durch Voice im
  Erstbau ist der Messlauf Pflicht (siehe Konsequenzen).
- Abnahmekriterien im Detail; Latenz-Kriterien aus den Messwerten ableiten,
  nicht vorab erfinden.
- Unklare Skizzenbegriffe `⟨Backup⟩`, `⟨Pay⟩`, `⟨Opp M⟩`, `⟨Moltdegect⟩` und das
  Stichwort „clear word“ bleiben unsichere Lesarten.
- Sprache des Text-Kanals: Voice läuft auf Englisch; ob Typewriter-Antworten
  (Text) Deutsch bleiben oder ebenfalls Englisch werden, ist nicht entschieden.

## Fortsetzung

Mit dem [Grilling-Skill](../skills/grilling/SKILL.md) an der offenen Frontier
fortsetzen. Entscheidungen oben nicht erneut abfragen. Fakten recherchieren,
Vorschläge als Vorschläge kennzeichnen. Noch keine Implementierung beginnen.
