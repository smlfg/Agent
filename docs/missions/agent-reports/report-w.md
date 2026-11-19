**Lexikon-Entscheidung:** AFINN-111 (Apache-2.0, 2477 Einträge, 43 KB, Upstream-Revision `1d6dfd2`) als reine Datentabelle in `src/metrics/lexicons/afinn.js` + vollständiger Lizenztext in `afinn-LICENSE.txt`; dazu eigene, kleine Seed-Listen (Intensivierer, Hedges, Booster, Imperative, Emoticons/Emoji) als CC0 in `src/metrics/lexicons/affect.js`. VADER hätte ~7500 Einträge geliefert und damit das Größenlimit gesprengt; AFINN passt und ist upstream-first. `THIRD_PARTY_NOTICES.md` ergänzt.

**Neu berechnete Metriken: 10** (50 → 60, übersprungen 59 → 49): `sentiment_valence`, `sentiment_balance`, `arousal_vader`, `self_disclosure`, `hedges`, `boosters`, `politeness_markers`, `imperative_mood`, `negation_ratio`, `second_person_ratio`. Sie wirken über die bestehenden Katalog-Gewichte auf warmth/calm/energy/playfulness/certainty (plus closeness/tempo/formality/openness). Keine offensichtlich falsch gerichteten Katalog-Gewichte gefunden.

**Beispielwerte (Metrik → relevante Parameter nach 1 Turn):**
- `"WOW this is amazing!!! thank you so much :)"` → valence .718, balance .900, arousal .838 → warmth .494, energy .459, playfulness .384
- `"fine. whatever. just answer."` → politeness 0, second-person 0, imperative .333, arousal 0 → warmth .411
- `"um, maybe? I am not sure, sorry, I guess…"` → hedges 1.0, negation 1.0, self-disclosure .5 → certainty .476 (nach 4 Turns <.45)
- `"good"` .620 vs `"not good"` .392 (Negationskippung); balance .750 vs .250

**Verifikation:** `node --check` grün; `node --test tests/*.test.js` 141/141 grün; Goldtest gestiegen von 74.8 % auf **78.1 %** (703/900). `bash scripts/validate.sh` scheitert nur am vorgesehenen „kein git“-Umfeld (`git ls-files` ohne Repo), die beiden inhaltlichen Checks davor sind OK.

**Abweichung, offen gemeldet:** `tests/metrics.test.js` musste minimal angepasst werden — seine Abdeckungs-Assertion verglich `Object.keys(metrics)` hart mit exakt den 50 library-freien IDs und wäre durch jede neue Affekt-Metrik zwangsläufig rot geworden. Der Goldtest selbst blieb unverändert.
