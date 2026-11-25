import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  planGaze,
  countWords,
  CARET_SOURCE,
  RELEASE_SOURCE,
  RELEASE_AFTER_MS,
  PAUSE_AFTER_MS,
  SPEED_MAX_CHARS_PER_SECOND,
  LEAD_MIN_PX,
  LEAD_MAX_PX,
  BACKSPACE_LOOKBACK_PX,
  PAUSE_LOOKBACK_PX,
  OVERVIEW_WORD_THRESHOLD,
  OVERVIEW_INTERVAL_MS,
  OVERVIEW_HOLD_MS,
  INTENSITY_FULL_WORDS,
} from '../src/presence/gaze.js';

const CARET = Object.freeze({
  x: 600,
  y: 200,
  startX: 300,
  middleX: 450,
  wordStartX: 540,
});

function typing(overrides = {}) {
  return {
    now: 1000,
    lastInputAt: 995,
    startedAt: 0,
    speed: 0,
    direction: 1,
    focused: true,
    reducedMotion: false,
    words: 1,
    length: 4,
    ...overrides,
  };
}

test('looks ahead of the caret in writing direction', () => {
  const plan = planGaze(typing({ speed: 8 }), CARET);
  assert.equal(plan.source, CARET_SOURCE);
  assert.equal(plan.mode, 'follow');
  assert.ok(plan.x > CARET.x, 'gaze x must lead the caret');
  assert.equal(plan.y, CARET.y);
});

test('lead grows with typing speed and is capped', () => {
  const slow = planGaze(typing({ speed: 2 }), CARET);
  const fast = planGaze(typing({ speed: 12 }), CARET);
  const capped = planGaze(typing({ speed: SPEED_MAX_CHARS_PER_SECOND * 10 }), CARET);

  assert.ok(slow.x > CARET.x);
  assert.ok(fast.x > slow.x, 'faster typing leads further ahead');
  assert.ok(capped.x - CARET.x <= LEAD_MAX_PX, 'lead never exceeds the cap');
  assert.ok(capped.x - CARET.x >= LEAD_MIN_PX, 'minimum lead is kept');
});

test('backspace glances back to the left', () => {
  const plan = planGaze(typing({ direction: -1, speed: 8 }), CARET);
  assert.equal(plan.mode, 'backspace');
  assert.ok(plan.x < CARET.x);
  assert.equal(plan.x, CARET.x - BACKSPACE_LOOKBACK_PX);
});

test('after a short pause it reads back towards the middle of the text', () => {
  const plan = planGaze(
    typing({ now: 2000, lastInputAt: 2000 - PAUSE_AFTER_MS - 10 }),
    CARET,
  );
  assert.equal(plan.mode, 'pause');
  assert.ok(plan.x < CARET.x);
  assert.equal(plan.x, CARET.middleX);
});

test('pause fallback without measured middle stays left of the caret', () => {
  const plan = planGaze(
    typing({ now: 2000, lastInputAt: 2000 - PAUSE_AFTER_MS - 10 }),
    { x: CARET.x, y: CARET.y },
  );
  assert.equal(plan.mode, 'pause');
  assert.equal(plan.x, CARET.x - PAUSE_LOOKBACK_PX);
});

test('release after 1.5 s without typing or on blur', () => {
  const timeout = planGaze(typing({ now: 5000, lastInputAt: 5000 - RELEASE_AFTER_MS }), CARET);
  assert.equal(timeout.source, RELEASE_SOURCE);
  assert.equal(timeout.mode, 'release');

  const blur = planGaze(typing({ focused: false }), CARET);
  assert.equal(blur.source, RELEASE_SOURCE);
});

test('does not release just before the timeout', () => {
  const plan = planGaze(typing({ now: 5000, lastInputAt: 5000 - RELEASE_AFTER_MS + 1 }), CARET);
  assert.equal(plan.source, CARET_SOURCE);
});

test('intensity rises with text length and stays within 0..1', () => {
  const empty = planGaze(typing({ words: 0, length: 0 }), CARET);
  const few = planGaze(typing({ words: 4, length: 20 }), CARET);
  const many = planGaze(typing({ words: 16, length: 90 }), CARET);
  const full = planGaze(typing({ words: INTENSITY_FULL_WORDS * 2, length: 400 }), CARET);

  assert.equal(empty.intensity, 0);
  assert.ok(few.intensity > 0 && few.intensity < many.intensity);
  assert.equal(full.intensity, 1);
  for (const plan of [empty, few, many, full]) {
    assert.ok(plan.intensity >= 0 && plan.intensity <= 1);
  }
});

test('intensity is derived from input text when state has no word count', () => {
  const plan = planGaze(
    typing({ now: 500, lastInputAt: 490, words: undefined, length: undefined }),
    { ...CARET, text: 'eins zwei drei vier fuenf sechs' },
  );
  const expected = Math.min(6 / INTENSITY_FULL_WORDS, 1);
  assert.equal(plan.intensity, expected);
});

test('overview jumps to the beginning after enough words', () => {
  const now = OVERVIEW_INTERVAL_MS + 100;
  const plan = planGaze(
    typing({ now, lastInputAt: now, startedAt: 0, words: OVERVIEW_WORD_THRESHOLD + 1 }),
    CARET,
  );
  assert.equal(plan.mode, 'overview');
  assert.ok(plan.x < CARET.x);
  assert.equal(plan.x, CARET.startX);
});

test('overview needs both enough words and an active typing window', () => {
  const now = OVERVIEW_INTERVAL_MS + 100;
  const tooShort = planGaze(
    typing({ now, lastInputAt: now, startedAt: 0, words: OVERVIEW_WORD_THRESHOLD - 1 }),
    CARET,
  );
  assert.equal(tooShort.mode, 'follow');

  const firstCycle = planGaze(
    typing({ now: OVERVIEW_INTERVAL_MS - 1, lastInputAt: OVERVIEW_INTERVAL_MS - 1, startedAt: 0, words: 12 }),
    CARET,
  );
  assert.equal(firstCycle.mode, 'follow');

  const windowClosed = planGaze(
    typing({
      now: OVERVIEW_INTERVAL_MS + OVERVIEW_HOLD_MS + 1,
      lastInputAt: OVERVIEW_INTERVAL_MS + OVERVIEW_HOLD_MS + 1,
      startedAt: 0,
      words: 12,
    }),
    CARET,
  );
  assert.equal(windowClosed.mode, 'follow');
});

test('reduced motion keeps the gaze static and never jumps back', () => {
  const now = OVERVIEW_INTERVAL_MS + 100;
  const plan = planGaze(
    typing({ now, lastInputAt: now, words: 20, reducedMotion: true }),
    CARET,
  );
  assert.equal(plan.mode, 'steady');
  assert.equal(plan.x, CARET.x);
  assert.equal(plan.y, CARET.y);

  const back = planGaze(typing({ direction: -1, reducedMotion: true }), CARET);
  assert.equal(back.x, CARET.x);
});

test('release still wins over reduced motion', () => {
  const plan = planGaze(
    typing({ now: 9000, lastInputAt: 9000 - RELEASE_AFTER_MS, reducedMotion: true }),
    CARET,
  );
  assert.equal(plan.source, RELEASE_SOURCE);
});

test('planner is deterministic for identical arguments', () => {
  const states = [
    typing({ speed: 6 }),
    typing({ now: OVERVIEW_INTERVAL_MS + 100, lastInputAt: OVERVIEW_INTERVAL_MS + 100, words: 12 }),
    typing({ direction: -1 }),
  ];
  for (const state of states) {
    assert.deepEqual(planGaze(state, CARET), planGaze({ ...state }, { ...CARET }));
  }
});

test('counts words and ignores whitespace-only text', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('eins'), 1);
  assert.equal(countWords('eins zwei drei'), 3);
  assert.equal(countWords(undefined), 0);
});
