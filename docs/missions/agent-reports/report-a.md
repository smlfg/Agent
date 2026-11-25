I'll start by reading the contract and relevant existing files.
Now implementing both files.
Changed files:
- `src/presence/presence.js` (new)
- `src/styles/presence.css` (new)

Summary:
1. `mountPresence({root, store, reducedMotion})` returns `pause/resume/destroy`; subscribes to store and maps phases to moods (dormant→lids closed + dim, idle→neutral, listening→listening, thinking→thinking, speaking→happy).
2. Uses standalone `EyeFace` on `.face-box`; `pause()` destroys it (timers/mousemove gone) and restores the pose statically, `resume()` re-inits and reapplies the current mood; `reducedMotion` never inits it and only toggles `VALID_MOODS` classes directly.
3. `.is-dormant` closes lids via `translateY(90%)`/`-30%` with opacity 0.55; leaving dormant opens them over 1.2 s via lid transitions (omitted for reduced motion and paused).
4. `presence.css` centers the eyes in the upper third with existing `base.css` tokens, adds a 6 s scale≤1.02 idle breath (off when paused/reduced), and kills all presence transitions/animations under `prefers-reduced-motion`.
5. `#motion-toggle` is wired with `aria-pressed`, "Pause motion"/"Resume motion", placed small bottom-left and keyboard-focusable; `node --check` and module import pass, all imports are existing relative paths (repo `scripts/validate.sh` aborts on the environment's missing git metadata, unrelated to these files).
