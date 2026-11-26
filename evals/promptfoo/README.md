# Eval-Set Agentfähig

## Regel
1. Wer Prompt, Persona, Wissen, Suche oder Modell ändert, fährt `npm run eval` vor dem Commit.
2. Jeder gefundene Fehler wird erst ein Fall, dann behoben.
3. Kein Deploy, wenn ein Fall aus `cases-regression.yaml` schlechter ist als die Vergleichsbasis.
4. Je Lauf 3 Wiederholungen; die Antworten der roten Fälle liest ein Mensch.

## Dateien
| Datei | Inhalt |
|---|---|
| `cases-regression.yaml` | darf nie wieder kaputtgehen |
| `cases-capability.yaml` | kann er noch nicht; wandert nach Erfolg zu regression |
| `baseline.md` | eine Zeile je abgenommenem Lauf |
| `promptfoo-eval.yaml` | Regeln, die für jeden Fall gelten |
| `run-eval.sh` | Startskript hinter `npm run eval` |
| `eval-last-run.html` | letzter Lauf mit allen Antworten (nicht in Git) |

## Lauf
`npm run eval` (promptfoo 0.126.0, MiniMax über den Worker-Pfad, Schlüssel aus `.env`,
Ollama mit bge-m3). Einmal-Probelauf: `EVAL_REPEAT=1 npm run eval`.
Nicht Teil von `npm test` (kostet Aufrufe, schwankt). Die Suche bleibt über
`evals/golden.json` in `npm test` abgesichert.

Der Lauf hebt das Zeitlimit auf 30 s an. Er sagt also nichts darüber, ob eine Antwort
live in 4 s ankommt; die Dauer je Aufruf steht als `ms` in der Ausgabe.

## Neuer Fall
    - description: "<Datum> <Fehler in einem Satz>"
      vars: { turns: 'Eingabe 1 | Eingabe 2', expectAsk: 'true' }
