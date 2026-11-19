# ADR-0006 — Ein Strom, eine Uhr: Segment- und Zeitvertrag

- **Status:** vorgeschlagen (Owner-Entscheidung ausstehend)
- **Datum:** 19.11.2026
- **Bezieht sich auf:** [`EXECUTION_PLAN-M0-M5.md`](../EXECUTION_PLAN-M0-M5.md) §10.3/§10.4,
  [`ADR-0002`](ADR-0002-agent-als-interface.md), `tech/ABGLEICH-DESIGN-TECHNIK.md`,
  `tech/CLOUDFLARE-MACHBARKEIT-VORPRUEFUNG-2026-11-12.md`

## Kontext

`EXECUTION_PLAN-M0-M5.md` §10.3 legt den Zustand bereits fest: eine Wahrheit auf dem
Server, `seq` streng monoton, Snapshot beim Verbinden, Deltas danach, Intents in
Gegenrichtung. Das regelt die **Reihenfolge**.

Nicht geregelt ist die **Zeit**. Der Typewriter ist heute an vier Stellen
unterschiedlich definiert (Stand 19.11., Zeilen können driften):

| Stelle | Was dort steht | Folge |
|---|---|---|
| `tech/research/cloudflare-bausteine.md` (Satz-Chunking) | TTS liest satzweise vor | Satzgrenzen |
| `tech/ABGLEICH-DESIGN-TECHNIK.md` (Typewriter) | Browser hält einen Wortpuffer | Wortgrenzen |
| `tech/INTENT-TECHNIK.md` (Latenzbudget T2) | Budget ohne Anzeigepuffer | kein Anteil für den Typewriter |
| `tech/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md` (Messung) | misst `first_audio_ms` | sichtbarer Buchstabe ungemessen |
| `tech/ABGLEICH-DESIGN-TECHNIK.md` (offen) | Wort-Zeitmarken **unbelegt** | gemeinsame Basis fehlt |

Dazu kommt ein Befund aus der Machbarkeitsprüfung (S7): Cloudflares eigenes
Latenzbudget summiert schon **890 ms**, die veröffentlichte Beispielmessung
liegt bei **950 ms** bis zum ersten Audio und **1.200 ms** pro Turn. Ein Puffer,
der im Budget nicht auftaucht, ist deshalb kein Detail, sondern die Differenz
zwischen „gehalten" und „gerissen".

Zwei unabhängige Prüfläufe sind auf denselben Punkt gelaufen: der Zustandslauf
(von der Seite `seq`) und der Latenzlauf (von der Seite der Zeit). Ergebnis:
**es ist ein Vertrag, nicht zwei.**

## Entscheidung

**Ein Modellstrom wird an genau einer Stelle — im Durable Object — in
Wort-/Satzsegmente mit Zeitstempel auf einer Uhr geschnitten. TTS, Typewriter
und Messung lesen dieselbe Segmentliste.**

Daraus folgen vier Regeln:

1. **Eine Uhr.** Alle Zeitstempel beziehen sich auf dieselbe Nullpunktsreferenz
   des DO, nicht auf Client-Zeit und nicht auf Zeitpunkte des Modell-Providers.
2. **Eine Segmentierung.** Die Grenze zwischen „Wort" und „Satz" wird einmal
   festgelegt, nicht pro Verbraucher. Ein zweiter Segmentierer ist unzulässig.
3. **Der Typewriter ist ein Play-out-Puffer** (`D_display`) und Teil des
   Latenzbudgets — kein reiner UI-Effekt. Er verbraucht Zeit, die im Budget
   ausgewiesen werden muss.
4. **Der Text-Hauptweg bekommt eine eigene Metrik:** `first_glyph_ms` (erster
   sichtbarer Buchstabe). `first_audio_ms` misst den Voice-Weg und lässt den
   Hauptweg des ersten Ablaufs ungemessen.

## Konsequenzen

**Positiv**

- Kein zweiter Segmentierer. Ein solcher Nachtrag würde DO, Client und
  gespeicherte Nachrichten gleichzeitig betreffen — geschätzt **3–5 Tage**.
- „890 ms", „unter 1 s" und „Wortrhythmus" werden vergleichbar, statt drei
  unvergleichbare Zahlen zu bleiben.
- `tech/ABGLEICH-DESIGN-TECHNIK.md` (Wort-Zeitmarken unbelegt) wird beantwortbar, statt offen
  zu bleiben.
- Der Typewriter kann nicht mehr stillschweigend aus dem Budget fallen.

**Negativ**

- Ein zusätzliches Feld pro Segment; das Zustandsschema aus §10.3 wächst.
- Die Uhr im DO ist eine neue Invariante, die getestet werden muss
  (Monotonie, kein Segment ohne Zeitstempel).
- `first_glyph_ms` ist eine zweite Messgröße neben `first_audio_ms`; beide
  müssen getrennt berichtet werden, sonst entsteht wieder eine Sammelzahl.

**Neutral**

- Kein Widerspruch zu §10.3: `seq` regelt Reihenfolge, die Uhr regelt Zeit.
  Der Vertrag ergänzt die bestehenden Invarianten um eine Zeitdimension.

## Belegstand

- **VERIFIED:** Die vier unterschiedlichen Definitionen (Dateien oben, per
  Volltextsuche gefunden). Die Latenzzahlen 890 / 950 / 1.200 ms (Cloudflare-Doku,
  geprüft am 19.11.2026).
- **RECOMMENDED:** Der Vertrag selbst und die 3–5 Tage Schätzung.
- **HYPOTHESIS:** Dass Wort-Zeitmarken aus dem STT-Stream überhaupt in
  ausreichender Qualität kommen. Bleibt bis zur Messung offen.

## Offen

- Kommen Zeitmarken aus dem STT-/TTS-Stream, oder muss der DO sie selbst
  vergeben? Erst nach dem Messlauf beantwortbar.
- Darf der Play-out-Puffer das Budget *überschreiten*, wenn die Alternative ein
  leerlaufender Puffer ist (sichtbarer Ruckler)? Das ist eine Produktentscheidung,
  keine technische — sie gehört zu `tech/ABGLEICH-DESIGN-TECHNIK.md` (Verhalten bei Stocken).
- Übernimmt `first_glyph_ms` die Abnahmerolle für den Text-Pfad, während
  `first_audio_ms` sie für den Voice-Pfad behält? Vorschlag: ja, getrennt.
