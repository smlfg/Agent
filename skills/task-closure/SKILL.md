---
name: task-closure
description: Use when about to declare a task done, blocked, or abandoned in the Agentfähig project. Verifies the task against its acceptance criteria, shows real evidence, records unresolved blockers, and closes it explicitly as DONE / BLOCKED / ABANDONED. Never claims completion from code changes alone.
---

# Task Closure — Agentfähig

Projektregel. Kein weiteres Skill, sondern die Abruchbedingung für jeden Slice.

Die Fehler, die diese Regel verhindert, sind in diesem Projekt bereits
aufgetreten: eine Session meldete „Voice funktioniert", weil der Server
antwortete — obwohl die Spracherkennung nie startete. Eine andere meldete
„Messwerte erhoben", obwohl die Tabelle leer war. Eine dritte meldete ein
Modell im Protokoll, das im Menü nie ausgewählt wurde.

**Kein Abschluss aus Codeänderungen allein.**

## Vor dem Abschluss

### 1. Kriterien gegen den Ist-Zustand prüfen

Die Annahmekriterien der Aufgabe heraussuchen — aus dem Auftrag, dem
Mission-Contract, dem ADRs oder `docs/EXECUTION_PLAN-M0-M5.md`. Wenn keine
existieren: **das ist selbst der Befund.** Dann `BLOCKED` mit dem Hinweis
„keine Annahmekriterien" melden, nicht erfinden.

Jedes Kriterium einzeln: erfüllt, teilweise, oder nicht erfüllt? Ein
teilweise erfülltes Kriterium ist ein Blocker, kein Erfolg.

### 2. Die passende Verifikation ausführen

```bash
bash scripts/validate.sh
```

Sobald Code existiert: zusätzlich die zugehörigen Tests oder Smoke-Checks.
Für den Messlauf: die Rohwerte gegen die Protokolltabelle prüfen — **nicht**
gegen eine Zusammenfassung, nicht gegen eine Erinnerung.

Belegt ist nur, was der Lauf zeigt. Ein Wert aus einer Doku, aus einem
Beispiel oder aus einer früheren Session ist **kein** Beleg. Beispiel:
`llm_ms: 850` in der Cloudflare-Doku ist ein Beispiel, und die Seite sagt
ausdrücklich nicht, ob er gemessen ist.

### 3. Belege zeigen, nicht behaupten

Die Ausgabe enthält:

- **Die tatsächliche Ausgabe** des Checks (Kommando und Ergebnis), nicht
  „der Check läuft grün".
- **Die geänderten Dateien** mit Pfad.
- **Die Zahl**, wenn eine Zahl die Aussage trägt — mit Einheit und
  Kontext (gemessen, geschätzt, gerechnet, übernommen).
- **Bei UI-/Layout-/Bewegungsänderungen zusätzlich:** Vorher-/Nachher-Screenshots
  unter identischen Bedingungen (Desktop, Mobile, `prefers-reduced-motion`) sowie
  bei Motion-Änderungen eine kurze Aufnahme (`.webm`) samt eigener Sichtprüfung
  der gerenderten Bilder; temporäre QA-Medien außerhalb des Git-Trees halten,
  sofern nicht ausdrücklich als Repo-Evidenz abgelegt.

Wenn ein Wert nicht gemessen wurde, steht das dabei. Nicht weglassen.

### 4. Den Projektstand fortschreiben

Nicht nur melden, sondern den Ort pflegen, an dem der Stand steht:

| Was | Wohin |
|---|---|
| Produktentscheidungen | `docs/DESIGN-DECISIONS.md` |
| Projektstand, nächste Schritte | `docs/PROJECT.md` |
| Ungelöste Punkte, die niemand entscheiden kann | `docs/UNSOLVED-TECHNIK.md` |
| Planungsentscheidungen | `docs/adr/` |
| Messwerte | `tech/MESSPROTOKOLL-*.md` |
| Tagesstand | `~/Projects/00_AKTUELL/JETZT.md` |

Ein offener Punkt, der nirgends festgehalten wird, ist beim nächsten Mal
wieder offen — und kostet eine zweite Recherche.

### 5. Ungelöste Blocker festhalten

Jeder Blocker mit: **Was** blockiert, **wo** es belegt ist (Pfad oder
Fehlermeldung), **was** die Bedingung zum Auflösen wäre, **wer** sie
auflösen muss (Agent, oder Samuel — Owner-Entscheidungen sind Samuels).

Ein Blocker ohne Belegpfad ist kein Blocker, sondern eine Vermutung.

### 6. Explizit schließen

Genau eine dieser Formulierungen, als letzte Zeile:

```
DONE — <was erledigt ist> · Belege: <Pfade/Kommandos>
BLOCKED — <was blockiert> · Bedingung zum Auflösen: <was fehlt> · Beleg: <Pfad>
ABANDONED — <warum aufgegeben> · <was trotzdem festgehalten wurde>
```

`BLOCKED` ist ein gültiges Ergebnis. Ein Slice, der sauber blockiert
und den Beleg liefert, ist **fertig** — nicht gescheitert.

## Was dieser Skill verbietet

- **Kein automatischer Start der nächsten Aufgabe.** Nach dem Abschluss
  wartet der Agent auf Samuels Auftrag. Eine Schlange von Selbstläufen hat
  in diesem Projekt bereits zu Kollisionen geführt: zwei Sessions haben
  denselben Browser-Tab und dieselbe Durable-Object-Unterhaltung geteilt,
  wodurch fremde Turns die Messung kontaminierten.
- **Keine Behauptung „fertig" aus Codeänderungen allein.**
- **Keine erfundenen Messwerte.** Eine leere Tabelle wird als leere Tabelle
  gemeldet.
- **Kein Überschreiben fremder Arbeit.** Was andere Sessions geschrieben
  haben, bleibt stehen; bei Widerspruch wird der Konflikt gemeldet, nicht
  aufgelöst.
- **Keine Framework-, Hosting- oder Modellentscheidung als bestätigt
  darstellen**, solange sie nur aus einer Skizze abgeleitet ist.
- **Keine erneute Eskalation** nach einem fehlgeschlagenen Ansatz: Befund
  melden, zurückmelden, auf Freigabe warten.

## Kollisionsregel

Während eines Arbeitsabschnitts schreibt **genau eine** Session an Klon,
Browser-Tab, laufenden Server und Protokolldatei. Weitere Harnesses bleiben
lesend.

Grund: derselbe Browser-Tab teilt sich eine Durable-Object-Konversation.
Fremde Turns in den Rohdaten machen den Lauf nicht abnahmefähig — das ist
in `tech/MESSPROTOKOLL-2026-11-19.md` als Kollisionsbefund dokumentiert.

Vor Beginn prüfen, ob ein Dev-Server, ein Browser-Tab oder ein laufender
Messversuch schon existiert. Wenn ja: **nicht** anfassen, sondern melden.

## Abschluss-Schnellcheck

```bash
bash scripts/validate.sh    # Exit 0?
git status --short           # Welche Dateien wurden berührt?
```

Danach: Kriterien einzeln geprüft? Belege in der Hand? Stand fortgeschrieben?
Blocker mit Pfad? Eine der drei Abschlussformulierungen als letzte Zeile?
