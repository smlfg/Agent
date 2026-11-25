# Third-party notices

## OpenVoiceUI — MIT

- Source: https://github.com/MCERQUA/OpenVoiceUI @ `efd921f576c4992d3714b2b2829abc356f338dd3`
- Copied unmodified into `src/vendor/openvoiceui/`:
  - `face/EyeFace.js`, `face/BaseFace.js`, `core/EventBus.js`
  - `styles/eyes.css` (excerpt of `src/styles/face.css`, lines 100–216 and 290–300)
- License text: `src/vendor/openvoiceui/LICENSE-openvoiceui.txt` (Copyright (c) 2025 OpenVoiceUI Contributors)
- Adopted per ADR-0003; owner moved the adoption ahead of the measurement run for M1 (19.11.2026).

## AFINN-111 — Apache-2.0

- Source: https://github.com/fnielsen/afinn (data/AFINN-111.txt)
- Upstream revision: `1d6dfd2b2b8a604eafdd2d175b7a682a0ea0217d` (2022-04-04)
- Copyright: Finn Aarup Nielsen and Technical University of Denmark
- Vendored as data only in `src/metrics/lexicons/afinn.js` (2477 entries, scores −5…+5);
  no upstream code was copied. Used for local valence scoring without a package install.
- License text: `src/metrics/lexicons/afinn-LICENSE.txt` (Apache License 2.0)
- Own affect seed lists (intensifiers, hedges, boosters, imperatives, emoji) are
  original work in `src/metrics/lexicons/affect.js`, released CC0-1.0.
