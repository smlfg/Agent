Geänderte Dateien:
- `src/conversation/typewriter.js` (neu)
- `src/conversation/conversation.js` (neu)
- `src/styles/conversation.css` (neu)

Zusammenfassung:
1. `createTypewriter` splittet per `/(\s+)/`, gibt pro Schritt ein Wort samt Folgewithespace aus, reducedMotion/Leertext synchron, `stop()` bricht ohne `onDone` ab.
2. `mountConversation` verdrahtet `input` → `INPUT` und Submit → `SUBMIT`, leert das Feld, hält den Fokus und bricht laufende Turns per `AbortController` + `typewriter.stop()` ab.
3. Altes `.pair-entry` erhält `is-leaving` (Entfernung via `animationend`, Fallback 700 ms; reducedMotion sofort), neues Paar mit Prompt-Echo und `aria-busy`-Antwort inkl. Denk-Punkten.
4. Antwortpfad dispatcht `RESPONSE_START/PROGRESS/END`, schreibt `#live` erst bei `onDone`, ignoriert `AbortError` und zeigt bei echten Fehlern `RESPONSE_ERROR` plus Inline-Text.
5. CSS: zentriertes Paar (max. 38rem), Leseschrift mit clamp, weiches Ein-/Ausblenden, sticky Composer mit 16px-Input und Fokusring, reduced-motion ohne Animationen.

Verifikation: `node --check` beider Dateien OK; Typewriter-Check gibt `["a b","done"]` aus. `scripts/validate.sh` bricht in dieser Kopie an `git ls-files` ab (kein Git-Repo), nicht an den Änderungen.
