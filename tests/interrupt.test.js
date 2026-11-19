import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  findSentenceRest,
  findWordEnd,
  planFinishSentence,
  INTERRUPT_MAX_CHARS,
  INTERRUPT_MAX_MS,
} from '../src/conversation/typewriter.js';

function unitsOf(text) {
  return Array.from(text);
}

// --- sentence remainder ----------------------------------------------------

test('sentence rest includes the terminator', () => {
  const units = unitsOf('Hallo Welt. Noch ein Satz.');
  const rest = findSentenceRest(units, 0);
  assert.equal(rest.start, 0);
  assert.equal(rest.end, 11);
  assert.equal(rest.restChars, 11);
  assert.equal(units.slice(0, rest.end).join(''), 'Hallo Welt.');
});

test('sentence rest continues measured from the current typing position', () => {
  const units = unitsOf('Hallo Welt. Noch ein Satz.');
  const rest = findSentenceRest(units, 6);
  assert.equal(rest.restChars, 5);
  assert.equal(units.slice(6, rest.end).join(''), 'Welt.');
});

test('sentence rest stops before a line end', () => {
  const units = unitsOf('erste Zeile\nzweite Zeile');
  const rest = findSentenceRest(units, 0);
  assert.equal(rest.restChars, 11);
  assert.equal(units.slice(0, rest.end).join(''), 'erste Zeile');
});

test('sentence rest keeps closing quotes and repeated marks', () => {
  const units = unitsOf('He said "go." Then more');
  const rest = findSentenceRest(units, 0);
  assert.equal(units.slice(0, rest.end).join(''), 'He said "go."');
});

test('sentence rest treats an ellipsis mark as a sentence end', () => {
  const units = unitsOf('Wait… More text follows');
  const rest = findSentenceRest(units, 0);
  assert.equal(units.slice(0, rest.end).join(''), 'Wait…');
});

test('sentence rest without a terminator runs to the end', () => {
  const units = unitsOf('no end in sight');
  const rest = findSentenceRest(units, 0);
  assert.equal(rest.restChars, units.length);
  assert.equal(rest.end, units.length);
});

test('sentence rest treats a leading line end as an empty remainder', () => {
  const units = unitsOf('\nNext');
  const rest = findSentenceRest(units, 0);
  assert.equal(rest.restChars, 0);
  assert.equal(rest.end, 0);
});

// --- word boundary ---------------------------------------------------------

test('word end stops at whitespace and at the end of the text', () => {
  const units = unitsOf('this is a test');
  assert.equal(findWordEnd(units, 0), 4);
  assert.equal(findWordEnd(units, 5), 7);
  assert.equal(findWordEnd(units, 10), 14);
});

test('word end is the current position when the next unit is whitespace', () => {
  const units = unitsOf('word next');
  assert.equal(findWordEnd(units, 4), 4);
});

// --- cut vs finished -------------------------------------------------------

test('short sentence remainder finishes within the default limits', () => {
  const plan = planFinishSentence({
    units: unitsOf('Short one. And a much longer second sentence follows here.'),
    index: 0,
    baseDelayMs: 30,
  });
  assert.equal(plan.result, 'finished');
  assert.equal(plan.appendEllipsis, false);
  assert.equal(plan.tail, 'Short one.');
  assert.equal(plan.delayMs, 8);
  assert.ok(plan.totalMs <= INTERRUPT_MAX_MS);
});

test('long sentence remainder cuts after the current word with an ellipsis', () => {
  const units = unitsOf('This sentence keeps running far beyond the small receipt budget. Next.');
  const plan = planFinishSentence({ units, index: 11, baseDelayMs: 30 });
  assert.equal(plan.result, 'cut');
  assert.equal(plan.appendEllipsis, true);
  assert.ok(plan.tail.endsWith('…'));
  assert.equal(plan.endIndex, findWordEnd(units, 11));
});

test('the decision boundary is exactly maxChars', () => {
  const exactly = unitsOf(`${'x'.repeat(INTERRUPT_MAX_CHARS - 1)}.`);
  const over = unitsOf(`${'x'.repeat(INTERRUPT_MAX_CHARS)}.`);

  const fits = planFinishSentence({ units: exactly, index: 0 });
  const cuts = planFinishSentence({ units: over, index: 0 });

  assert.equal(fits.result, 'finished');
  assert.equal(fits.steps, INTERRUPT_MAX_CHARS);
  assert.equal(cuts.result, 'cut');
});

test('the maxMs cap wins over the 4x cadence', () => {
  const units = unitsOf(`${'x'.repeat(39)}.`);
  const plan = planFinishSentence({ units, index: 0, maxMs: 100, baseDelayMs: 30 });
  assert.equal(plan.result, 'finished');
  assert.ok(plan.delayMs < 8, 'per-step delay must shrink to fit the cap');
  assert.ok(plan.totalMs <= 100);
  assert.equal(plan.totalMs, plan.steps * plan.delayMs);
});

test('a zero remainder needs no steps and reports finished', () => {
  const plan = planFinishSentence({ units: unitsOf('Done.'), index: 5 });
  assert.equal(plan.result, 'finished');
  assert.equal(plan.steps, 0);
  assert.equal(plan.totalMs, 0);
});
