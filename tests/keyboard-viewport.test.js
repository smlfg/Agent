import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  KEYBOARD_VAR,
  KEYBOARD_ATTR,
  KEYBOARD_OPEN,
  KEYBOARD_INSET_MIN_PX,
  isTypingTarget,
  computeKeyboardInset,
  isKeyboardOpen,
  planKeyboardState,
  mountKeyboardViewport,
} from '../src/surface/keyboard-viewport.js';

function input(type = 'text') {
  return { tagName: 'INPUT', type, isContentEditable: false };
}

test('constants stay stable for the surface css', () => {
  assert.equal(KEYBOARD_VAR, '--keyboard-inset');
  assert.equal(KEYBOARD_ATTR, 'keyboard');
  assert.equal(KEYBOARD_OPEN, 'open');
  assert.ok(KEYBOARD_INSET_MIN_PX >= 60, 'threshold above url-bar jitter');
});

test('typing targets: text inputs, textareas, contenteditable', () => {
  assert.equal(isTypingTarget(input('text')), true);
  assert.equal(isTypingTarget(input('search')), true);
  assert.equal(isTypingTarget(input(undefined)), true, 'missing type defaults to text');
  assert.equal(isTypingTarget({ tagName: 'TEXTAREA', type: undefined, isContentEditable: false }), true);
  assert.equal(isTypingTarget({ tagName: 'DIV', isContentEditable: true }), true);
});

test('non-typing targets never open the keyboard state', () => {
  for (const type of ['button', 'checkbox', 'radio', 'submit', 'range', 'file']) {
    assert.equal(isTypingTarget(input(type)), false, `input[type=${type}]`);
  }
  assert.equal(isTypingTarget({ tagName: 'BUTTON', isContentEditable: false }), false);
  assert.equal(isTypingTarget({ tagName: 'BODY', isContentEditable: false }), false);
  assert.equal(isTypingTarget(null), false);
});

test('keyboard inset is the covered part of the layout viewport', () => {
  // iPhone-ish: 844 px layout viewport, keyboard leaves 544 px visible.
  assert.equal(computeKeyboardInset({ innerHeight: 844, viewportHeight: 544 }), 300);
  // Desktop and keyboard closed: no inset.
  assert.equal(computeKeyboardInset({ innerHeight: 844, viewportHeight: 844 }), 0);
  // A pan (visualViewport moved down) must not shrink the inset.
  assert.equal(computeKeyboardInset({ innerHeight: 844, viewportHeight: 544, offsetTop: 200 }), 300);
});

test('inset is robust against garbage viewport values', () => {
  assert.equal(computeKeyboardInset({}), 0);
  assert.equal(computeKeyboardInset({ innerHeight: NaN, viewportHeight: 400 }), 0);
  assert.equal(computeKeyboardInset({ innerHeight: 400, viewportHeight: 0 }), 0);
  assert.equal(computeKeyboardInset({ innerHeight: 400, viewportHeight: 600 }), 0, 'never negative');
});

test('keyboard counts as open only above the jitter threshold', () => {
  assert.equal(isKeyboardOpen(0), false);
  assert.equal(isKeyboardOpen(KEYBOARD_INSET_MIN_PX - 1), false);
  assert.equal(isKeyboardOpen(KEYBOARD_INSET_MIN_PX), true);
  assert.equal(isKeyboardOpen(300), true);
});

test('plan: open only with a typing target focused', () => {
  const typing = planKeyboardState({ inset: 300, activeElement: input() });
  assert.deepEqual(typing, { open: true, inset: 300 });

  const pinchZoom = planKeyboardState({ inset: 300, activeElement: { tagName: 'BODY', isContentEditable: false } });
  assert.deepEqual(pinchZoom, { open: false, inset: 0 }, 'pinch zoom without typing is not a keyboard');

  const jitter = planKeyboardState({ inset: 40, activeElement: input() });
  assert.deepEqual(jitter, { open: false, inset: 0 }, 'url-bar jitter is ignored');
});

/* ── mount: fake DOM, same contracts as the browser side ─────────────────── */

function fakeRoot() {
  const properties = new Map();
  return {
    properties,
    style: {
      setProperty: (name, value) => properties.set(name, value),
      removeProperty: (name) => properties.delete(name),
    },
    dataset: {},
  };
}function fakeWorld({ innerHeight = 844, viewportHeight = 844, activeElement = null, scrollY = 0 }) {
  const vvListeners = {};
  const winListeners = {};
  const calls = { scrollIntoView: 0, scrollTo: 0 };
  const vv = {
    height: viewportHeight,
    offsetTop: 0,
    addEventListener: (type, fn) => { (vvListeners[type] ??= []).push(fn); },
    removeEventListener: () => {},
  };
  const win = {
    innerHeight,
    scrollY,
    visualViewport: vv,
    requestAnimationFrame: (fn) => fn(),
    cancelAnimationFrame: () => {},
    scrollTo: () => { calls.scrollTo += 1; },
    addEventListener: (type, fn) => { (winListeners[type] ??= []).push(fn); },
    removeEventListener: () => {},
  };
  const target = activeElement && typeof activeElement === 'object'
    ? {
      ...activeElement,
      getBoundingClientRect: () => ({ top: 500, bottom: 560 }),
      scrollIntoView: () => { calls.scrollIntoView += 1; },
    }
    : activeElement;
  const doc = {
    activeElement: target,
  };
  const fire = (type) => {
    for (const fn of vvListeners[type] ?? []) fn();
    for (const fn of winListeners[type] ?? []) fn();
  };
  return { vv, win, doc, calls, fire };
}

test('mount writes the open state when a typing target is focused', () => {
  const root = fakeRoot();
  const world = fakeWorld({ innerHeight: 844, viewportHeight: 544, activeElement: input() });
  mountKeyboardViewport({ root, doc: world.doc, win: world.win });
  world.fire('resize');

  assert.equal(root.properties.get(KEYBOARD_VAR), '300px');
  assert.equal(root.dataset[KEYBOARD_ATTR], KEYBOARD_OPEN);
});

test('mount clears the state when the typing target blurs', () => {
  const root = fakeRoot();
  const world = fakeWorld({ innerHeight: 844, viewportHeight: 544, activeElement: input() });
  mountKeyboardViewport({ root, doc: world.doc, win: world.win });
  world.fire('resize');
  world.doc.activeElement = { tagName: 'BODY', isContentEditable: false };
  world.fire('focusout');

  assert.equal(root.properties.has(KEYBOARD_VAR), false);
  assert.equal(root.dataset[KEYBOARD_ATTR], undefined);
});

test('mount stays closed for url-bar jitter and pinch zoom', () => {
  const root = fakeRoot();
  const jitter = fakeWorld({ innerHeight: 844, viewportHeight: 810, activeElement: input() });
  mountKeyboardViewport({ root, doc: jitter.doc, win: jitter.win });
  jitter.fire('resize');
  assert.equal(root.dataset[KEYBOARD_ATTR], undefined);

  const pinch = fakeWorld({ innerHeight: 844, viewportHeight: 500, activeElement: { tagName: 'BODY', isContentEditable: false } });
  mountKeyboardViewport({ root, doc: pinch.doc, win: pinch.win });
  pinch.fire('resize');
  assert.equal(root.dataset[KEYBOARD_ATTR], undefined, 'no typing target, no keyboard');
});

test('mount realigns only when the focused target is obscured', () => {
  const root = fakeRoot();
  // Visible band ends at 544; target bottom 560 is obscured -> realign.
  const obscured = fakeWorld({ innerHeight: 844, viewportHeight: 544, activeElement: input() });
  mountKeyboardViewport({ root, doc: obscured.doc, win: obscured.win });
  obscured.fire('resize');
  assert.equal(obscured.calls.scrollIntoView, 1);

  // Target already inside the band: no scroll churn, no reveal-pan trigger.
  const visible = fakeWorld({ innerHeight: 844, viewportHeight: 544, activeElement: input() });
  const visibleDoc = {
    activeElement: {
      ...input(),
      getBoundingClientRect: () => ({ top: 480, bottom: 540 }),
      scrollIntoView: () => { visible.calls.scrollIntoView += 1; },
    },
  };
  mountKeyboardViewport({ root, doc: visibleDoc, win: visible.win });
  visible.fire('resize');
  assert.equal(visible.calls.scrollIntoView, 0, 'target visible: no realign at all');
  assert.equal(visible.calls.scrollTo, 0, 'no leftover document scroll to undo');
});

test('apply/reset drive the same css state as the live path', () => {
  const root = fakeRoot();
  const world = fakeWorld({});
  const kb = mountKeyboardViewport({ root, doc: world.doc, win: world.win });

  kb.apply(300);
  assert.equal(root.properties.get(KEYBOARD_VAR), '300px');
  assert.equal(root.dataset[KEYBOARD_ATTR], KEYBOARD_OPEN);

  kb.reset();
  assert.equal(root.properties.has(KEYBOARD_VAR), false);
  assert.equal(root.dataset[KEYBOARD_ATTR], undefined);
});

test('mount degrades to a no-op without visualViewport', () => {
  const root = fakeRoot();
  const win = { requestAnimationFrame: (fn) => fn() };
  const kb = mountKeyboardViewport({ root, doc: { activeElement: input() }, win });
  kb.apply(300); // inert stub, must not throw
  assert.equal(root.dataset[KEYBOARD_ATTR], undefined);
});
