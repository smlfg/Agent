import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitGraphemes,
  tokenizeDissolveText,
  countGlyphs,
  countWords,
  planDissolve,
  createDissolveGroup,
} from '../src/conversation/dissolve.js';

// --- grapheme and token helpers -------------------------------------------

test('splitGraphemes keeps combining marks and emoji together', () => {
  assert.deepEqual(splitGraphemes('e\u0301'), ['e\u0301']);
  assert.deepEqual(splitGraphemes('👍🏽'), ['👍🏽']);
  assert.equal(splitGraphemes('abc').length, 3);
});

test('tokenizeDissolveText preserves the text exactly, including whitespace', () => {
  const source = 'Schall  und\nRauch';
  const tokens = tokenizeDissolveText(source);
  assert.equal(tokens.map((token) => token.text).join(''), source);
  assert.deepEqual(tokens.map((token) => token.type), ['word', 'space', 'word', 'space', 'word']);
});

test('tokenizeDissolveText treats markup as plain characters, not HTML', () => {
  const source = '<b>rauch</b>';
  const tokens = tokenizeDissolveText(source);
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0].type, 'word');
  assert.equal(tokens[0].text, source);
  assert.deepEqual(tokens[0].glyphs.slice(0, 3), ['<', 'b', '>']);
});

test('countGlyphs and countWords count only visible word content', () => {
  const tokens = tokenizeDissolveText('a bc\n  de');
  assert.equal(countWords(tokens), 3);
  assert.equal(countGlyphs(tokens), 5);
});

// --- timing and granularity plan ------------------------------------------

test('reduced motion removes immediately and never animates', () => {
  const plan = planDissolve({ reducedMotion: true, glyphCount: 240, wordCount: 40 });
  assert.equal(plan.animated, false);
  assert.equal(plan.durationMs, 0);
  assert.equal(plan.staggerMs, 0);
  assert.equal(plan.totalMs, 0);
});

test('animated plans stay inside the 700-1400 ms window', () => {
  for (const glyphCount of [1, 2, 5, 40, 240, 241, 600, 1200, 5000]) {
    const wordCount = Math.max(1, Math.ceil(glyphCount / 6));
    const plan = planDissolve({ reducedMotion: false, glyphCount, wordCount });
    assert.equal(plan.animated, true, `count ${glyphCount}`);
    assert.ok(plan.totalMs >= 700, `too short for ${glyphCount}: ${plan.totalMs}`);
    assert.ok(plan.totalMs <= 1400, `too long for ${glyphCount}: ${plan.totalMs}`);
    assert.ok(plan.durationMs > 0);
    assert.ok(plan.staggerMs >= 0);
  }
});

test('granularity degrades from glyphs to words to a single block', () => {
  assert.equal(planDissolve({ glyphCount: 20, wordCount: 4 }).granularity, 'glyph');
  assert.equal(planDissolve({ glyphCount: 600, wordCount: 100 }).granularity, 'word');
  assert.equal(planDissolve({ glyphCount: 5000, wordCount: 800 }).granularity, 'block');
});

test('the plan is deterministic for the same input', () => {
  const a = planDissolve({ glyphCount: 55, wordCount: 11 });
  const b = planDissolve({ glyphCount: 55, wordCount: 11 });
  assert.deepEqual(a, b);
});

test('a single glyph still gets a visible animation', () => {
  const plan = planDissolve({ glyphCount: 1, wordCount: 1 });
  assert.equal(plan.staggerMs, 0);
  assert.equal(plan.totalMs, plan.durationMs);
  assert.ok(plan.totalMs >= 700 && plan.totalMs <= 1400);
});

// --- non-stacking group (no DOM) ------------------------------------------

test('starting a dissolve finishes older ones first and never stacks', () => {
  const group = createDissolveGroup();
  const finished = [];

  const first = group.start(() => finished.push('first'));
  const second = group.start(() => finished.push('second'));

  assert.deepEqual(finished, ['first'], 'the older dissolve is finished at once');
  assert.equal(group.size, 1, 'only the newest dissolve stays active');

  const third = group.start(() => finished.push('third'));
  assert.deepEqual(finished, ['first', 'second']);
  assert.equal(group.size, 1);

  assert.equal(third(), true, 'finish reports that it ran');
  assert.deepEqual(finished, ['first', 'second', 'third']);
  assert.equal(group.size, 0);
  assert.equal(third(), false, 'finish is idempotent');
  assert.equal(first(), false);
  assert.equal(second(), false);
});

test('a burst of dissolves leaks nothing and finishes every task exactly once', () => {
  const group = createDissolveGroup();
  let calls = 0;
  const finishes = [];
  for (let i = 0; i < 50; i++) {
    finishes.push(group.start(() => {
      calls += 1;
    }));
  }

  assert.equal(calls, 49, 'each new dissolve supersedes the previous one');
  assert.equal(group.size, 1);

  group.finishAll();
  assert.equal(calls, 50);
  assert.equal(group.size, 0);

  group.finishAll();
  assert.equal(calls, 50, 'finishing twice is a no-op');
  for (const finish of finishes) assert.equal(finish(), false);
});
