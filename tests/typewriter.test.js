import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTypewriter } from '../src/conversation/typewriter.js';

function createFakeScheduler() {
  let nextId = 1;
  const pending = new Map();
  const calls = [];
  const scheduler = {
    schedule(fn, ms) {
      const id = nextId++;
      pending.set(id, fn);
      calls.push({ id, ms });
      return id;
    },
    cancel(id) {
      pending.delete(id);
    },
    get size() {
      return pending.size;
    },
    get calls() {
      return calls;
    },
    get delays() {
      return calls.map((call) => call.ms);
    },
    step() {
      const next = pending.entries().next();
      if (next.done) return false;
      pending.delete(next.value[0]);
      next.value[1]();
      return true;
    },
    flush() {
      let count = 0;
      while (scheduler.step()) count++;
      return count;
    },
  };
  return scheduler;
}

function setup(text, options = {}) {
  const scheduler = createFakeScheduler();
  const updates = [];
  const events = [];
  const doneCalls = [];
  const typewriter = createTypewriter({
    text,
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
    onUpdate: (visible, meta) => {
      updates.push(visible);
      events.push({ visible, ...meta });
    },
    onDone: () => doneCalls.push(true),
    ...options,
  });
  return { scheduler, updates, events, doneCalls, typewriter };
}

// --- char mode (default) ---------------------------------------------------

test('char mode types one character at a time, in order, as growing prefixes', () => {
  const text = 'Hello';
  const { scheduler, updates, events, doneCalls, typewriter } = setup(text);

  typewriter.start();
  assert.equal(updates.length, 0, 'nothing is revealed synchronously');

  scheduler.step();
  assert.deepEqual(updates, ['H']);

  scheduler.flush();

  assert.equal(updates.length, 5);
  for (const update of updates) assert.ok(text.startsWith(update), `not a prefix: ${update}`);
  for (let i = 1; i < updates.length; i++) {
    assert.equal(updates[i].length, updates[i - 1].length + 1);
  }
  assert.equal(updates.at(-1), text);
  assert.equal(doneCalls.length, 1);
  assert.equal(scheduler.size, 0);
  assert.ok(events.every((event) => event.unit === 'char'));
});

test('char mode keeps grapheme clusters (emoji) together', () => {
  const text = 'a😀b';
  const { scheduler, updates, typewriter } = setup(text);

  typewriter.start();
  scheduler.flush();

  assert.deepEqual(updates, ['a', 'a😀', 'a😀b']);
});

test('char mode preserves whitespace exactly', () => {
  const text = 'a  b\tc\nd';
  const { scheduler, updates, typewriter } = setup(text);

  typewriter.start();
  scheduler.flush();

  assert.equal(updates.at(-1), text);
  assert.equal(updates.at(-1).includes('  '), true);
  assert.deepEqual(updates, updates.slice().sort((x, y) => x.length - y.length));
});

test('char mode uses the base cadence with small deterministic jitter', () => {
  const text = 'plain';
  const { scheduler, events, typewriter } = setup(text, { charDelayMs: 30 });

  typewriter.start();
  scheduler.flush();

  const normal = events.filter((event) => event.state === 'typing');
  assert.ok(normal.length > 0);
  for (const event of normal) {
    assert.ok(event.delayMs >= 22 && event.delayMs <= 38, `out of jitter range: ${event.delayMs}`);
  }
});

test('an injected random source makes the cadence deterministic', () => {
  const { scheduler, events, typewriter } = setup('plain text', {
    charDelayMs: 30,
    random: () => 0.5,
  });

  typewriter.start();
  scheduler.flush();

  assert.deepEqual(scheduler.delays, scheduler.delays.map(() => 30));
  for (const event of events) {
    if (event.state !== 'done') assert.equal(event.delayMs, 30);
  }
});

test('pauses after punctuation are longer than the normal cadence', () => {
  const text = 'Wait, really. Next\nLine';
  const { scheduler, events, typewriter } = setup(text, { charDelayMs: 30 });

  typewriter.start();
  scheduler.flush();

  const comma = events.find((event) => event.visible.endsWith(','));
  assert.ok(comma, 'expected a comma event');
  assert.equal(comma.state, 'pausing');
  assert.ok(comma.delayMs >= 140, `comma pause too short: ${comma.delayMs}`);

  const period = events.find((event) => event.visible.endsWith('.'));
  assert.ok(period, 'expected a period event');
  assert.equal(period.state, 'pausing');
  assert.ok(period.delayMs >= 320, `sentence pause too short: ${period.delayMs}`);

  const lineBreak = events.find((event) => event.visible.endsWith('\n'));
  assert.ok(lineBreak, 'expected a line break event');
  assert.equal(lineBreak.state, 'pausing');
  assert.ok(lineBreak.delayMs >= 320, `line pause too short: ${lineBreak.delayMs}`);

  const normal = events.find((event) => event.visible === 'W');
  assert.ok(normal, 'expected the first plain character');
  assert.equal(normal.state, 'typing');
  assert.ok(normal.delayMs < 100, `normal delay too long: ${normal.delayMs}`);
  assert.ok(period.delayMs > normal.delayMs, 'sentence pause must exceed normal delay');
});

test('a run of sentence marks pauses once, at the last mark', () => {
  const text = 'Wait... Next';
  const { scheduler, events, typewriter } = setup(text);

  typewriter.start();
  scheduler.flush();

  const dotPrefixes = events.filter((event) => /\.+$/.test(event.visible));
  assert.equal(dotPrefixes.length, 3);
  assert.equal(dotPrefixes[0].state, 'typing');
  assert.equal(dotPrefixes[1].state, 'typing');
  assert.equal(dotPrefixes[2].state, 'pausing');
  assert.ok(dotPrefixes[2].delayMs >= 320);
});

test('the same text produces the same rhythm twice (seeded PRNG)', () => {
  const text = 'Determinism: same text, same ticks.';
  const first = setup(text);
  const second = setup(text);

  first.typewriter.start();
  first.scheduler.flush();
  second.typewriter.start();
  second.scheduler.flush();

  assert.deepEqual(first.scheduler.delays, second.scheduler.delays);
  assert.deepEqual(first.updates, second.updates);
  assert.equal(first.updates.at(-1), text);
  assert.equal(second.updates.at(-1), text);
});

// --- word mode (unchanged behaviour) ---------------------------------------

test('word mode types word by word in order and ends with the full text', () => {
  const text = 'Hello brave  world again';
  const { scheduler, updates, doneCalls, typewriter } = setup(text, { unit: 'word' });

  typewriter.start();
  assert.equal(updates.length, 0);

  scheduler.flush();

  assert.equal(updates.length, 4);
  for (const update of updates) assert.ok(text.startsWith(update), `not a prefix: ${update}`);
  for (let i = 1; i < updates.length; i++) {
    assert.ok(updates[i].length > updates[i - 1].length, 'updates must grow');
  }
  assert.equal(updates.at(-1), text);
  assert.equal(doneCalls.length, 1);
  assert.equal(scheduler.size, 0);
});

test('word mode keeps the original wordDelayMs cadence', () => {
  const { scheduler, typewriter } = setup('One two three', { unit: 'word' });

  typewriter.start();
  scheduler.flush();

  assert.deepEqual(scheduler.delays, [45, 45, 45]);
});

test('word mode preserves whitespace exactly', () => {
  const text = 'a  b\tc\nd';
  const { scheduler, updates, typewriter } = setup(text, { unit: 'word' });

  typewriter.start();
  scheduler.flush();

  assert.equal(updates.at(-1), text);
  assert.equal(updates.at(-1).includes('  '), true);
  assert.deepEqual(updates, updates.slice().sort((x, y) => x.length - y.length));
});

// --- empty text and reduced motion -----------------------------------------

test('empty text emits one empty update and finishes', () => {
  const { scheduler, updates, doneCalls, typewriter } = setup('');

  typewriter.start();

  assert.deepEqual(updates, ['']);
  assert.equal(doneCalls.length, 1);
  assert.equal(scheduler.size, 0);
});

test('reducedMotion updates synchronously with the full text', () => {
  const text = 'One two three';
  const { scheduler, updates, doneCalls, typewriter } = setup(text, { reducedMotion: true });

  typewriter.start();

  assert.deepEqual(updates, [text]);
  assert.equal(doneCalls.length, 1);
  assert.equal(scheduler.size, 0);
});

test('reducedMotion with empty text still emits empty update and finishes', () => {
  const { updates, doneCalls, typewriter } = setup('', { reducedMotion: true });

  typewriter.start();

  assert.deepEqual(updates, ['']);
  assert.equal(doneCalls.length, 1);
});

// --- stopping ---------------------------------------------------------------

test('stop aborts without onDone and cancels pending work', () => {
  const { scheduler, updates, doneCalls, typewriter } = setup('One two three');

  typewriter.start();
  assert.ok(scheduler.size > 0);
  scheduler.step();
  const afterFirstChar = updates.length;

  typewriter.stop();

  assert.equal(scheduler.size, 0);
  scheduler.flush();
  assert.equal(updates.length, afterFirstChar);
  assert.equal(doneCalls.length, 0);
});

test('stop is idempotent and safe before start', () => {
  const { scheduler, updates, doneCalls, typewriter } = setup('One two');

  assert.doesNotThrow(() => typewriter.stop());

  typewriter.start();
  scheduler.step();
  const afterStep = updates.length;

  assert.doesNotThrow(() => typewriter.stop());
  assert.doesNotThrow(() => typewriter.stop());

  scheduler.flush();
  assert.equal(updates.length, afterStep);
  assert.equal(doneCalls.length, 0);
});

test('stop after completion does not emit onDone twice', () => {
  const { scheduler, updates, doneCalls, typewriter } = setup('One two');

  typewriter.start();
  scheduler.flush();
  assert.equal(doneCalls.length, 1);

  typewriter.stop();
  assert.equal(doneCalls.length, 1);
  assert.equal(updates.at(-1), 'One two');
});
