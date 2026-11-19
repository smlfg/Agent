I'll start by reading the mission contract and report, then examine the existing code.
Now I'll implement the hyperreal eye anatomy and motion in the two owned files.
**Geänderte Dateien**
- `src/presence/presence.js`
- `src/styles/presence.css`

- Iris jetzt mit radialer Faserstruktur, Krypten, warmem Farbverlauf, dunklem Limbusring und weich auslaufender Pupille.
- Feste Glanzlichter (Hauptreflex + gefensterter Fensterreflex) liegen im Auge, die Pupille bewegt sich darunter weiter.
- Lider: Hautton-Verlauf, weiche Schattenkante, angedeutete Wimpernlinien, feuchter Lidrand; auf die Augapfel-Silhouette geclippt, damit keine Flächen überstehen.
- Augapfel: Innenverschattung oben, Subsurface-Wärme, Wet-Meniskus, sehr dezente Äderchen und Lid-Schatten über der Iris.
- Pupillenweite reagiert auf Zustand (listening weiter, thinking enger, 600 ms) sowie minimal auf Zeigernähe/Helligkeit; Mikrosakkaden nur bei ruhendem Zeiger.
- Blinzeln asymmetrisch (schnell zu, langsam auf), gelegentlich doppelt; alle eigenen Timer ruhen bei Pause und Reduced Motion. Mausverfolgung (Vendor) und Erwachen/Dormant bleiben erhalten.
- Verifikation: `node --check` OK, `node --test tests/*.test.js` 41/41 grün; Browserprüfung Desktop + 375 px (dormant, idle, listening, thinking, paused, reduced), kein horizontaler Überlauf.
- Hinweis: `bash scripts/validate.sh` bricht in diesem Worktree ab, weil kein Git-Repo vorhanden ist (unabhängig von den Änderungen); Vendor- und Fremddateien wurden nicht angefasst.
