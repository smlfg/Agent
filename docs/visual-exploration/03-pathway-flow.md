# Pathway / Flow Visualization — Visual Design Concept

> Scope: visual and motion design only. No functional code, no backend logic.  
> Context: Agentfähig v1, first pathway `What this is`, front-agent + cheap swarm-agent architecture.

---

## Metaphor

The interface is a single amorphous field. The scribble texture is not decoration — it is the agent's "body". Pathways are not menus; they are currents that briefly part the field when the front-agent recognizes an intent. The user does not navigate to a pathway; the pathway reveals itself as the conversation finds its temperature.

---

## 1. How the user chooses or perceives a pathway

### Guiding principle: ambient first, explicit on demand

- **Before any input:** no visible pathway labels. The field is calm, breathing, untextured except for the scribble. The only controls are the three one-word sliders (`warm ↔ cold`, `soft ↔ sharp`, `still ↔ alive`) and the input line.
- **During typing / voice input:** a faint ripple travels from the input line toward the center, where the eyes live. The front-agent is listening. No pathway is shown yet.
- **At intent recognition:** the eyes glance slightly to the side (a short, soft aversion, ~300 ms). At the same moment, one of three thin luminous threads briefly brightens in the peripheral field:
  - leftward thread → `What this is`
  - upward thread → `creator`
  - rightward thread → `product for X`
- **Explicit fallback:** if confidence is low or the user pauses, the three threads become faintly readable labels near the bottom edge, each a single word: `what · create · product`. They do not look like buttons; they look like folds in the paper. A tap/click nudges the front-agent toward that current.

### Key visual rule

Pathways are never a top navigation. They appear as shifts in the field's grain, not as destinations.

---

## 2. Visual cues: front-agent thinking vs swarm-agent working

The eyes are the primary signal. Everything else is secondary texture.

### Front-agent thinking

- Eyes narrow slightly (eyelid curve deepens by ~10%).
- Gaze averts to the upper-left or upper-right, as if looking elsewhere for a moment.
- The scribble field around the eyes thins — lines pull inward, density drops by ~20%.
- A very faint, slow pulse (~0.8 Hz) appears in the pupil area, like a held breath.
- No text, no spinner. The face itself is the status indicator.

### Swarm-agent working in background

- Eyes return to the user but soften — focus relaxes, as if the front-agent is "holding the space" while someone else fetches the answer.
- A second, more distant motion begins **behind** the eyes: a slower, wider ripple in the scribble field, like wind through tall grass. This is the swarm current.
- A single faint node (a small, soft glow, ~8 px radius) appears in the periphery corresponding to the active pathway thread. It does not blink; it breathes slowly.
- The difference from front-agent thinking: the front-agent's signal is in the eyes (sharp, local, fast), the swarm's signal is in the field (soft, peripheral, slow).

---

## 3. How results from a background agent arrive

Three motion layers, in order:

### 3.1 The connect effect

When the swarm-agent begins answering, the peripheral node brightens and a faint line draws itself from the node toward the eyes — not a straight tech line, but a hand-drawn stroke that wavers slightly, as if sketched in real time. The line stops just behind the eyes and dissolves into the scribble field.

- Duration: ~600 ms.
- Easing: quick start, slow settle.
- Opacity peak: ~30% — never dominant.

### 3.2 The glow before text

~100–200 ms before the first token arrives, the eyes receive a subtle extra highlight (pupil catchlight brightens) and the input field's baseline warms by one step. This is the visual "inhale" before speech.

### 3.3 Text arrival

- The answer does not drop in as a block. It unfolds as a pulsating typewriter near the input field.
- New words push the previous answer upward and back in space (slight blur + scale down), keeping the current sentence in sharp focus.
- As the swarm's answer streams in, the peripheral node dims and the connect line fades. The signal returns to the front-agent's eyes and voice.

---

## 4. Whether and how to show the agent ecosystem

### Decision: show it, but only as a ghost diagram

The ecosystem (front, analysing, looking-up, backup) is not a dashboard. It is a transient constellation that appears when the swarm is active and dissolves when the answer arrives.

### Visual treatment

- A very faint, sketch-like diagram hovers behind the eyes, visible only when the swarm is working.
- Four soft dots, loosely arranged in a small arc:
  - **front** — the eyes themselves, brightest
  - **analysing** — a small dot to the upper left, blinking in a slow rhythm
  - **looking-up** — a small dot to the upper right, tracing tiny figure-eights
  - **backup** — a dot below, dormant and dim unless activated; when activated it gently expands once
- The dots are connected by barely visible hand-drawn lines. The lines do not animate continuously; they occasionally "shiver" to show liveness.
- Labels: none by default. On hover/focus (desktop) or long-press (mobile), the dots reveal single-word tooltips: `analysing`, `looking-up`, `backup`.

### When it appears

Only during the swarm phase of a pathway. It never appears during idle listening or simple front-agent replies.

---

## 5. Progress / signal design without spinners or toasts

| Situation | Forbidden | Visual solution |
|---|---|---|
| Waiting for first token | Spinner, toast, bouncing dots | Eyes avert and narrow; field thins; slow pupil pulse |
| Background agent working | Progress bar, percentage | Peripheral node + ghost constellation; slow field ripple |
| Answer arriving | Toast notification | Connect effect + typewriter glow |
| Long answer streaming | Load-more button | Older text recedes naturally; current sentence stays sharp |
| Error or stall | Red banner, alert | Eyes look down and blink slowly; field texture becomes still and slightly cooler; a single soft word appears below the input line only if the user has been waiting > 4 s |
| Success / done | Checkmark animation | Eyes return to user, pupils widen slightly, field settles |

### Core principle

Status is expressed through the agent's own body language, not through UI chrome. If the user cannot read the state from the eyes and the field, the signal is too strong or too weak.

---

## 6. Concrete example: the `What this is` pathway

### Scene 0 — Idle

The screen is a warm paper field. Two soft eyes breathe in the center. The three sliders are visible at the bottom. The input line waits below the eyes. Nothing moves except idle breathing and occasional blinks.

### Scene 1 — User begins typing

The user types: "Was ist Agentfähig?"

- Each keystroke sends a tiny ripple toward the eyes.
- The eyes shift focus to the input line.
- The leftward pathway thread (`what`) faintly brightens before the user finishes the sentence.

### Scene 2 — Front-agent recognizes intent

- Eyes glance to the upper-left (~300 ms).
- The scribble field thins around the eyes.
- A slow pupil pulse begins: the front-agent is thinking.

### Scene 3 — Swarm-agent is called

- Eyes return to the user, softened.
- A peripheral node appears on the left thread and begins breathing.
- The ghost constellation fades in behind the eyes: `analysing` and `looking-up` dots animate gently.
- A hand-drawn line sketches itself from the left node toward the eyes (connect effect).

### Scene 4 — Answer begins

- The connect line dissolves.
- The eyes receive a brief highlight.
- The input baseline warms.
- Text begins to type out below the eyes:

> "Agentfähig ist ein Interface, das den Menschen als Auslöser behält."

- Short words appear quickly; longer words stretch slightly.
- Each new sentence pushes the previous one upward and back.

### Scene 5 — Voice joins

- A few hundred milliseconds after the text starts, a subtle wave emanates from the eyes toward the edges — the visual equivalent of "now speaking".
- The text continues unaffected.

### Scene 6 — Done

- The answer finishes typing.
- Eyes return fully to user, pupils widen slightly.
- The field settles. The ghost constellation is gone.
- The input line is ready again.

---

## 7. Three visual variations

### Variation A — "Ink on warm paper" (default)

- Hand-drawn strokes, slight wobble, warm paper background.
- Pathway threads look like pulled ink lines.
- Eyes are charcoal-grey, with soft edges.
- Swarm nodes are small amber glows.
- Motion: organic, slightly imperfect, human.
- Best for: the `soft` and `warm` ends of the sliders.

### Variation B — "Signal in fog"

- Cooler palette, desaturated blue-grey field.
- Pathway threads are faint light rays, not ink lines.
- Eyes are luminous, almost lantern-like, with sharper pupils.
- Swarm nodes are small cold flares.
- Motion: slower, more ethereal, longer fades.
- Best for: the `cold` and `still` ends of the sliders.

### Variation C — "Living wireframe"

- Field is a sparse, delicate mesh of hand-drawn geometry.
- Pathway threads are thin vibrating strings.
- Eyes are built from overlapping ellipses with a subtle chromatic offset.
- Swarm nodes pulse in quick, rhythmic bursts.
- Motion: sharper, more electric, but still soft-edged.
- Best for: the `sharp` and `alive` ends of the sliders.

---

## 8. Key risks and open visual questions

1. **Pathway discoverability vs. minimalism.** If the threads are too faint, users may never notice they are on a pathway. If they are too bright, the interface becomes a navigation menu. Need a feel-test with first-time users.
2. **Thinking vs. swarm distinction.** The two states rely on similar eye motions. We need to verify that users can tell "front-agent is thinking" from "someone else is working in the background" without explanation.
3. **Ghost constellation clutter.** Four ecosystem dots plus pathway threads plus eyes plus input plus sliders may be too much on small screens. A mobile-specific reduction is likely needed.
4. **Typewriter rhythm and motion sickness.** The pulsating typewriter combined with receding old answers could feel unstable. A reduced-motion variant is essential.
5. **Color of trust.** The connect effect must look like signal, not like a loading indicator. Color, speed, and opacity need careful tuning.
6. **Error state without alarm.** A still, cool field is gentle, but it must still communicate that something is wrong. The line between calm and unresponsive is thin.

---

## Output for next step

This document is intended as a sketch brief. The next step is to produce low-fidelity motion storyboards (e.g., 6–8 frame sketches per scene) for Variation A before any code is written.
