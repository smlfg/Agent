1. `idle.js` plant reine Wartemomente: 0–8 s ruhiger Blick zum Besucher, danach gelegentliche Blicke zum Eingabefeld, die immer zurückkehren.
2. Ab 25 s häufiger mit kurzem Verweilen, leichter Pupillenweitung und minimal gehobenen Lidern (`is-waiting-1/2/3`); ab 60 s ein sanfter 400-ms-Nachfrage-Impuls, nie öfter als alle 22–29 s.
3. Jede Eingabe, Mausbewegung, Fokus oder Submit nullt die Uhr sofort: Release + voller Besucherblick, danach 1,4 s Ruhe und neu geplant; nur aktiv in `phase === 'idle'`.
4. Blick geht ausschließlich über `agentfaehig:gaze` (`source: 'idle'`, Koordinaten Besuchermitte bzw. Composer-Rect, `intensity`) — Pupillen bleiben Sache von `presence.js`.
5. `reducedMotion`, `is-motion-paused` und `is-reduced-motion` erzeugen nur den statischen Zustand `is-waiting-1` mit ruhigem Feldblick; `idle.css` bewegt nur Transform/Opacity, keine Keyframes, `prefers-reduced-motion` neutralisiert alles.
6. Verifiziert: `node --check src/presence/idle.js` ok, `node --test tests/*.test.js` 93/93 grün (inkl. 8 Idle-Tests); `scripts/validate.sh` scheitert nur am fehlenden Git-Repo dieses Scratchpad-Worktrees (`git ls-files` exit 128), nicht an den Dateien.
