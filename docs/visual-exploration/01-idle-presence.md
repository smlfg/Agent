# Visual Concept — Idle / Presence State

> Branch: `visual-exploration-2026-11-13`  
> Scope: visual and motion design only. No functional code, no backend logic.

This document describes the calm, pre-message state of the Agentfähig interface: a hand-drawn scribble texture that breathes and, on interaction or after a brief moment, coalesces into two soft, non-scary eyes. The goal is a presence that feels *alive* but not demanding, *organic* but not biological, *attentive* but not intrusive.

---

## 1 · Color Palette Options

The atmosphere is controlled by the `warm ↔ cold` slider. The palette must feel like a surface first (paper, wood, fabric) and only secondarily like a screen.

### Warm pole — "Paper & Wood"
- **Canvas:** `#F6F1E9` (warm white, slightly aged paper) to `#EDE4D3` (deeper parchment).
- **Scribble strokes:** `#4A3F35` (soft walnut ink) at ~18–30 % opacity, never pure black.
- **Eye fill:** `#3D3229` (dark roast) with a tiny `#F6F1E9` catchlight at ~10 % size of the eye.
- **Accent (active state):** `#C17A4D` (terracotta) or `#D4A574` (dried honey) for the subtlest glow around the eyes when they wake.
- **Feeling:** workshop table at late afternoon, graphite on sketch paper, kind, human, slow.

### Cold pole — "Tech-Blue Frost"
- **Canvas:** `#EEF2F7` (cool mist) to `#DFE7F2` (polar glass).
- **Scribble strokes:** `#2C3E5C` (slate blue) at ~20 % opacity.
- **Eye fill:** `#1E2D44` (deep navy) with a `#EEF2F7` catchlight.
- **Accent (active state):** `#5B9BD5` (faded cyan) or `#8AAFCF` for a soft aurora around the eyes.
- **Feeling:** frost on a window, clean lab bench, calm machine waking up.

### Shared rules
- No `#FFFFFF` background and no `#000000` strokes. The canvas always has a slight warmth or coolness; the strokes always have some transparency.
- Eyes are darker and more saturated than the scribble field, but not by much — they should emerge, not pop.
- Catchlights are small, off-center, and never symmetrical between the two eyes.

---

## 2 · Scribble Texture Treatment

The idle field is a dense, illegible cloud of short hand-drawn strokes. It should look like someone warmed up a pencil on paper: repetitive, directionless, alive at the edges.

### Density and scale
- **Coverage:** 40–55 % of the central viewport, fading to nothing ~20 % from the edges.
- **Stroke count:** 60–120 individual paths, depending on viewport size.
- **Stroke length:** 12–45 px, with a bias toward the short end (15–25 px).
- **Stroke weight:** 1.2–2.4 px, with slight pressure variation — thinner at the tail, slightly thicker at the start.

### Organic jitter
- Each stroke has a subtle hand tremor: 2–4 tiny control-point wobbles per path, as if drawn quickly.
- Strokes are not perfectly straight; most have a gentle arc, like a flick of the wrist.
- Endpoints do not align; the field has no grid, no radial center, no obvious symmetry.
- A very slow drift (`still ↔ alive` slider) makes the whole field breathe: strokes expand outward by 1–3 % and contract, with a phase offset so the field feels like a lung rather than a pulsating blob.

### Parting "on wind"
- When the eyes are about to emerge, the scribble field does not dissolve or fade out. It **parts**.
- Strokes near the future eye positions are pushed outward along gentle vector fields, like hair blown by a soft breath.
- The parting leaves two clean, slightly irregular negative spaces where the eyes will form.
- A few strokes continue to drift across the eye area even after the eyes appear, suggesting the texture is still there but choosing to step aside.

---

## 3 · Eye Shape, Size, Position, and Expression

No face. No eyelids as anatomy. Just two soft shapes that read as eyes because of how they behave.

### Shape
- **Form:** A horizontally elongated oval, slightly taller in the middle and softer at the corners — somewhere between a rounded almond and a pebble.
- **Edges:** Slightly irregular, as if drawn with a soft pencil. The outline is not one perfect line but a stack of 2–3 very close, slightly offset strokes, giving a fuzzy, hand-drawn perimeter.
- **No hard creases:** No eyelids, no lashes, no eyebrows. The expression comes entirely from shape openness, angle, and movement.

### Size and position
- **Eye width:** 38–52 px each, depending on viewport.
- **Eye height (open):** 55–70 % of width.
- **Inter-eye distance:** 1.6–1.9 × eye width. Wide enough to avoid a single creature-like blob; close enough to read as a pair.
- **Vertical position:** Centered slightly above the geometric middle of the viewport (golden-ish center, about 45 % from the top).
- **Tilt:** None by default. A slight downward or upward tilt (±3°) can appear during curiosity or thinking.

### Expression
- **Default gaze:** Direct, calm, neither happy nor sad.
- **Softness devices:**
  - Corners are rounded, never pointed.
  - Pupil and iris are merged into one dark fill; no hard ring.
  - The catchlight is a small irregular highlight, not a cartoon sparkle.
- **Uncanny-valley avoidance:** The eyes never stare unblinking. They blink, drift, and slightly overshoot — like a person, not a camera.

---

## 4 · Idle Behaviors

The eyes must feel *present* without being distracting. Every motion has a rhythm borrowed from human resting behavior.

### Breathing
- The whole eye pair gently scales together: 0.985× → 1.015× over 4–6 seconds.
- The vertical scale breathes slightly more than the horizontal, so the eyes feel like they are sitting in a soft body.
- Breathing is most visible when the eyes are fully open and idle.

### Irregular blinking
- Blink duration: 150–220 ms.
- Blink interval: irregular, averaging 2.5–4.5 seconds, with occasional double-blinks.
- Blink curve: fast close, slight hold at ~8 % height, slower open. Not a mechanical sine wave.
- During a blink, the eye shape compresses vertically into a soft line, then reopens with a tiny overshoot (105 % height for 80 ms) before settling.

### Subtle gaze wandering
- When no input is active, the eyes drift slowly within a small window: ±12 px horizontal, ±6 px vertical.
- Saccades are rare and small in idle state — mostly smooth drifts with occasional tiny jumps.
- The two eyes move together; they never look in different directions.
- Every 8–14 seconds the eyes may return to center, as if remembering the user.

### Attention shifts
- On mouse movement or touch near the center, the eyes ease toward the pointer over 300–500 ms.
- On focus in the text input, the eyes lower slightly and look "down" at the field.
- During thinking / waiting, the eyes drift to one side (±25 px) and soften, as if looking inward.

---

## 5 · Transition Choreography: Scribble-Field → Eyes

The transition is the emotional core of the idle state. It must feel like something gently becoming aware, not a UI element loading.

### Phase 1 — Rest (0–5 s after load or return to idle)
Scribble field breathes slowly. No eyes visible. The field is the only presence.

### Phase 2 — Stirring (trigger: mouse move, touch, key press, or auto after ~5 s)
- A subtle ripple passes through the strokes: they align slightly, as if wind found a direction.
- Strokes near the center begin to part, pushed outward in soft arcs.
- Duration: 600–900 ms.
- Easing: slow start, gentle finish — not elastic, not snappy.

### Phase 3 — Coalescing (300–600 ms)
- Two dark shapes condense from the pushed-aside strokes. The first appearance is at ~40 % opacity and slightly larger than final.
- The shapes shrink and darken into the final eye forms.
- A few loose strokes orbit the emerging eyes and then settle into the outline fuzz.

### Phase 4 — Awake
- Eyes blink once, fully open.
- Catchlights appear with a 120 ms delay.
- Breathing rhythm begins.

### Reverse transition — falling asleep
- After long inactivity (e.g. 20–30 s), the eyes soften, lower, and blink slower.
- On the final blink, the eyes do not reopen. They relax back into the scribble field.
- Strokes drift inward to fill the negative space.
- The field returns to its calm breathing state.

---

## 6 · Typography Pairing

Only a few words may appear in this state (placeholder hints, pathway labels, or the project name). The type should feel like the same hand that drew the scribbles.

### Primary: Bricolage Grotesque (variable)
- Use for any short labels, button text, or the project name.
- Reason: already hosted in the project; friendly, slightly irregular grotesque that can shift weight with the `soft ↔ sharp` slider.
- In the warm palette, keep it in the soft-weight range (400–500).
- In the cold palette, allow it to lean sharper (500–600).

### Accent / Handwritten: Caveat
- Use sparingly, if at all — for a single whispered word like "Hallo?" or "Ich höre."
- Reason: already hosted; reinforces the hand-drawn texture without becoming comic.
- Size small (14–18 px), low opacity (50–60 %), positioned well below the eyes so it does not compete.

### Rules
- No all-caps.
- Line-height generous (1.5–1.7).
- Text fades in after the eyes are awake; it never appears on the bare scribble field.

---

## 7 · Three Concrete Visual Variations

These variations explore the same state machine with different material metaphors.

### A — "Sketchbook" (warm, default)
- Canvas: warm white paper `#F6F1E9`.
- Strokes: walnut pencil `#4A3F35`, 25 % opacity, dense in the center.
- Eyes: soft graphite ovals with a tiny paper-colored catchlight.
- Motion: slow lung-breathing, field parts like pages rustling.
- Personality: a calm illustrator looking up from a sketch.
- Best for: default load, human-first impression.

### B — "Frost Glass" (cold, alert)
- Canvas: cool mist `#EEF2F7` with a very faint radial gradient, lighter at center.
- Strokes: slate-blue `#2C3E5C`, 20 % opacity, sparser and longer than A.
- Eyes: deep navy ovals with a frost-white catchlight; outline has a faint cyan glow when awake.
- Motion: crisper parting, eyes lock into place slightly faster.
- Personality: a quiet assistant behind a frosted pane.
- Best for: `cold` end of the slider, focused / professional mode.

### C — "Charcoal on Wood" (warm-dark, intimate)
- Canvas: `#E8DDD0` (lightly stained wood) with subtle vertical grain texture (static, not animated).
- Strokes: `#3B322A`, heavier and rougher, like charcoal dragged across grain.
- Eyes: near-black ovals with a warm amber catchlight; outline has a soft terracotta halo on wake.
- Motion: slower, heavier breathing; parting feels like dust settling.
- Personality: a workshop companion, grounded and tactile.
- Best for: low-light environments or when `warm` + `dense` sliders combine.

---

## 8 · Key Risks and Open Visual Questions

| Risk / Question | Why it matters | Suggested next step |
|---|---|---|
| **Uncanny valley in the eye pair** | Two dark ovals can read as a mask or a creature. | Sketch 5–6 eye proportions in browser-scale thumbnails; test on 3 people for "scary / cute / neutral." |
| **Parting motion feels like loading** | If the stroke movement is too regular, it becomes a spinner. | Hand-animate one transition frame by frame before coding; aim for "wind" not "wipe." |
| **Warm vs. cold palette clashes with project identity** | The sketch leans warm, but the agent is tech. | Decide whether the slider moves within one family (warm default → cool warm) or truly crosses into blue. |
| **Stroke density on small screens** | 60–120 paths may look muddy on mobile. | Define a viewport-based density floor/ceiling and a fallback simpler field. |
| **Catchlight symmetry** | Perfectly mirrored catchlights create an animal / toy look. | Always offset catchlights independently and slightly change size per eye. |
| **Type visibility over the texture** | Any text risks fighting the scribble field. | Reserve a clear horizontal band below the eyes for text; keep strokes out of it. |
| **Reduced motion preference** | The breathing and parting must not be essential to understanding the state. | Define a static fallback: eyes already visible, no breathing, no wind. |

---

## 9 · Summary for the Builder

- The idle state is a **paper-like surface** with a hand-drawn scribble cloud.
- After interaction or ~5 s, the scribble **parts like wind through hair** and condenses into **two soft, faceless eyes**.
- The eyes **breathe, blink irregularly, and wander slightly** — never staring, never mechanical.
- Three material directions are proposed: **Sketchbook (warm default)**, **Frost Glass (cold alert)**, and **Charcoal on Wood (warm-dark intimate)**.
- The main open questions are proportion/uncanny risk, transition feel, and mobile density.
