// Keyboard viewport — the eyes stay on screen while the mobile keyboard is open.
//
// First mobile test (20.11.2026): as soon as the keyboard slides out, the eyes
// disappear. Two causes, one per engine family:
// - Chromium mobile keeps the *layout* viewport at full height by default, so
//   100dvh never shrinks; the browser pans to the input and the eyes at the
//   top slide off screen. Fixed natively by the viewport meta in
//   living-surface.html: interactive-widget=resizes-content resizes the layout
//   viewport itself, so the stage grid compresses and dvh follows the keyboard.
// - iOS Safari overlays the keyboard and never resizes the layout viewport,
//   then pans the page to the focused input. No meta tag changes that, so this
//   module measures the overlay via window.visualViewport and writes
//   --keyboard-inset / data-keyboard on <html>; base.css lets the stage shrink
//   by exactly that amount, keeping eyes and composer inside the visible band.
//
// The stage shrinks on every visualViewport resize tick, so the composer stays
// glued to the visible bottom edge while the keyboard animates. Safari's
// reveal-pan therefore never has a reason to fire.
//
// Pinch zoom must not be mistaken for a keyboard: the inset is only applied
// while a typing target (text input, textarea, contenteditable) holds focus.

export const KEYBOARD_VAR = '--keyboard-inset';
export const KEYBOARD_ATTR = 'keyboard';
export const KEYBOARD_OPEN = 'open';

// Below this the inset is treated as URL-bar jitter or a pan, not a keyboard.
export const KEYBOARD_INSET_MIN_PX = 96;

const NON_TYPING_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'file', 'image', 'radio',
  'range', 'reset', 'submit',
]);

// True for elements the mobile keyboard would open for.
export function isTypingTarget(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') return !NON_TYPING_INPUT_TYPES.has((el.type || 'text').toLowerCase());
  return false;
}

// True keyboard height in CSS pixels. Deliberately independent of
// visualViewport.offsetTop: that reports the *pan*, while the keyboard always
// covers the bottom of the layout viewport.
export function computeKeyboardInset({ innerHeight, viewportHeight } = {}) {
  const inner = Number(innerHeight);
  const visual = Number(viewportHeight);
  if (!Number.isFinite(inner) || !Number.isFinite(visual) || visual <= 0) return 0;
  return Math.max(0, Math.round(inner - visual));
}

export function isKeyboardOpen(inset) {
  return Number(inset) >= KEYBOARD_INSET_MIN_PX;
}

// Pure decision for the browser side: only a typing target above the threshold
// counts as an open keyboard.
export function planKeyboardState({ inset, activeElement } = {}) {
  const open = isKeyboardOpen(inset) && isTypingTarget(activeElement);
  return { open, inset: open ? Math.max(0, Number(inset) || 0) : 0 };
}

// Browser side. Writes --keyboard-inset and data-keyboard on the root and
// keeps the focused input inside the shrinking visible band.
export function mountKeyboardViewport({ root = document.documentElement, doc = document, win = window } = {}) {
  const vv = win.visualViewport;
  if (!vv || !root || !root.style) {
    return { apply() {}, reset() {}, destroy() {} };
  }

  let rafId = 0;

  function setState(inset) {
    if (inset > 0) {
      root.style.setProperty(KEYBOARD_VAR, `${Math.round(inset)}px`);
      root.dataset[KEYBOARD_ATTR] = KEYBOARD_OPEN;
    } else {
      root.style.removeProperty(KEYBOARD_VAR);
      delete root.dataset[KEYBOARD_ATTR];
    }
  }

  function update() {
    rafId = 0;
    const { open, inset } = planKeyboardState({
      inset: computeKeyboardInset({ innerHeight: win.innerHeight, viewportHeight: vv.height }),
      activeElement: doc.activeElement,
    });
    setState(open ? inset : 0);
    if (!open) return;

    // Keep the focused target inside the visible band while the keyboard
    // animates: minimal scroll only when the target is actually obscured,
    // so the browser's own reveal-pan never kicks in and hides the eyes.
    const el = doc.activeElement;
    if (typeof el.scrollIntoView !== 'function') return;
    const rect = el.getBoundingClientRect();
    const visibleBottom = vv.offsetTop + vv.height;
    if (rect.bottom > visibleBottom + 1) {
      el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    // The compressed stage fits the layout viewport again; undo any leftover
    // document scroll from browsers that scroll instead of panning.
    if (win.scrollY > 0) win.scrollTo(0, 0);
  }

  function schedule() {
    if (!rafId) rafId = win.requestAnimationFrame(update);
  }

  vv.addEventListener('resize', schedule);
  vv.addEventListener('scroll', schedule);
  win.addEventListener('focusin', schedule);
  win.addEventListener('focusout', schedule);

  return {
    // Test hook (window.__agentfaehig.keyboard): drives exactly the state the
    // real visualViewport path writes, for headless verification of the CSS.
    apply(inset) {
      setState(Math.max(0, Number(inset) || 0));
    },
    reset() {
      setState(0);
    },
    destroy() {
      if (rafId) win.cancelAnimationFrame(rafId);
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
      win.removeEventListener('focusin', schedule);
      win.removeEventListener('focusout', schedule);
      setState(0);
    },
  };
}
