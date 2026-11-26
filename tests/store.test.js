import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reduce, createStore, initialState, PHASES } from '../src/state/store.js';

const at = (overrides) => ({ ...initialState, ...overrides });

test('initial state is dormant with an empty pair', () => {
  assert.equal(initialState.phase, 'dormant');
  assert.equal(initialState.prompt, '');
  assert.equal(initialState.answer, '');
  assert.equal(initialState.turn, 0);
  assert.equal(initialState.dev, false);
  assert.deepEqual([...PHASES], ['dormant', 'idle', 'listening', 'thinking', 'speaking', 'error']);
});

test('AWAKE wakes only from dormant', () => {
  const awake = reduce(initialState, { type: 'AWAKE' });
  assert.equal(awake.phase, 'idle');
  assert.notEqual(awake, initialState);

  for (const phase of ['idle', 'listening', 'thinking', 'speaking', 'error']) {
    const state = at({ phase });
    assert.equal(reduce(state, { type: 'AWAKE' }), state);
  }
});

test('INPUT sets listening for non-empty values and idle for empty values', () => {
  const idle = at({ phase: 'idle' });

  const typing = reduce(idle, { type: 'INPUT', value: 'hello' });
  assert.equal(typing.phase, 'listening');

  const cleared = reduce(at({ phase: 'listening' }), { type: 'INPUT', value: '' });
  assert.equal(cleared.phase, 'idle');
});

test('INPUT is ignored while thinking or speaking', () => {
  for (const phase of ['thinking', 'speaking']) {
    const state = at({ phase });
    assert.equal(reduce(state, { type: 'INPUT', value: 'more' }), state);
    assert.equal(reduce(state, { type: 'INPUT', value: '' }), state);
  }
});

test('SUBMIT ignores empty or whitespace-only prompts', () => {
  const state = at({ phase: 'listening' });
  assert.equal(reduce(state, { type: 'SUBMIT', prompt: '' }), state);
  assert.equal(reduce(state, { type: 'SUBMIT', prompt: '   ' }), state);
  assert.equal(reduce(state, { type: 'SUBMIT', prompt: undefined }), state);
});

test('SUBMIT starts a new turn with a trimmed prompt and an empty answer', () => {
  const state = at({ phase: 'listening', prompt: 'old', answer: 'old answer', turn: 3 });
  const next = reduce(state, { type: 'SUBMIT', prompt: '  new prompt  ' });

  assert.equal(next.phase, 'thinking');
  assert.equal(next.prompt, 'new prompt');
  assert.equal(next.answer, '');
  assert.equal(next.turn, 4);
  assert.equal(next.dev, false);
});

test('SUBMIT while speaking interrupts and replaces the pair', () => {
  const state = at({ phase: 'speaking', prompt: 'a', answer: 'a partial', turn: 1 });
  const next = reduce(state, { type: 'SUBMIT', prompt: 'b' });

  assert.equal(next.phase, 'thinking');
  assert.equal(next.prompt, 'b');
  assert.equal(next.answer, '');
  assert.equal(next.turn, 2);
});

test('RESPONSE_START ignores a stale turn', () => {
  const state = at({ phase: 'thinking', turn: 2 });
  assert.equal(reduce(state, { type: 'RESPONSE_START', turn: 1, dev: true }), state);
});

test('RESPONSE_START moves a current turn into speaking', () => {
  const state = at({ phase: 'thinking', turn: 2 });
  const next = reduce(state, { type: 'RESPONSE_START', turn: 2, dev: true });
  assert.equal(next.phase, 'speaking');
  assert.equal(next.answer, '');
  assert.equal(next.dev, true);
});

test('RESPONSE_START requires the thinking phase', () => {
  const state = at({ phase: 'idle', turn: 2 });
  assert.equal(reduce(state, { type: 'RESPONSE_START', turn: 2, dev: false }), state);
});

test('RESPONSE_PROGRESS updates the answer for the current turn only', () => {
  const state = at({ phase: 'speaking', turn: 2 });
  const next = reduce(state, { type: 'RESPONSE_PROGRESS', turn: 2, text: 'partial' });
  assert.equal(next.answer, 'partial');

  assert.equal(reduce(state, { type: 'RESPONSE_PROGRESS', turn: 1, text: 'stale' }), state);
});

test('RESPONSE_END completes the turn and keeps the text', () => {
  const state = at({ phase: 'speaking', turn: 2, answer: 'partial' });
  const next = reduce(state, { type: 'RESPONSE_END', turn: 2, text: 'full answer' });
  assert.equal(next.phase, 'idle');
  assert.equal(next.answer, 'full answer');

  assert.equal(reduce(state, { type: 'RESPONSE_END', turn: 1, text: 'stale' }), state);
});

test('RESPONSE_END without text keeps the visible answer', () => {
  const state = at({ phase: 'speaking', turn: 2, answer: 'partial' });
  const next = reduce(state, { type: 'RESPONSE_END', turn: 2 });
  assert.equal(next.phase, 'idle');
  assert.equal(next.answer, 'partial');
});

test('RESPONSE_ERROR moves thinking or speaking into error for the current turn only', () => {
  for (const phase of ['thinking', 'speaking']) {
    const state = at({ phase, turn: 2 });
    const next = reduce(state, { type: 'RESPONSE_ERROR', turn: 2 });
    assert.equal(next.phase, 'error');
    assert.equal(reduce(state, { type: 'RESPONSE_ERROR', turn: 1 }), state);
  }

  for (const phase of ['dormant', 'idle', 'listening', 'error']) {
    const state = at({ phase, turn: 2 });
    assert.equal(reduce(state, { type: 'RESPONSE_ERROR', turn: 2 }), state);
  }
});

test('error holds on empty INPUT and recovers via non-empty INPUT or SUBMIT', () => {
  const errored = at({ phase: 'error', prompt: 'failed', answer: 'partial', turn: 2, dev: true });

  assert.equal(reduce(errored, { type: 'INPUT', value: '' }), errored);
  assert.equal(reduce(errored, { type: 'INPUT', value: undefined }), errored);

  const typing = reduce(errored, { type: 'INPUT', value: 'try again' });
  assert.equal(typing.phase, 'listening');

  const submittedDirect = reduce(errored, { type: 'SUBMIT', prompt: '  retry  ' });
  assert.equal(submittedDirect.phase, 'thinking');
  assert.equal(submittedDirect.prompt, 'retry');
  assert.equal(submittedDirect.answer, '');
  assert.equal(submittedDirect.turn, 3);
  assert.equal(submittedDirect.dev, false);

  const submittedAfterInput = reduce(typing, { type: 'SUBMIT', prompt: 'retry 2' });
  assert.equal(submittedAfterInput.phase, 'thinking');
  assert.equal(submittedAfterInput.turn, 3);
  assert.equal(submittedAfterInput.answer, '');

  assert.equal(reduce(errored, { type: 'RESPONSE_START', turn: 2, dev: false }), errored);
  assert.equal(reduce(errored, { type: 'RESPONSE_PROGRESS', turn: 2, text: 'late' }), errored);
  assert.equal(reduce(errored, { type: 'RESPONSE_END', turn: 2, text: 'late' }), errored);
  assert.equal(reduce(errored, { type: 'RESPONSE_ERROR', turn: 2 }), errored);
});

test('RESPONSE events are ignored outside their expected phase', () => {
  const state = at({ phase: 'listening', turn: 1 });
  assert.equal(reduce(state, { type: 'RESPONSE_PROGRESS', turn: 1, text: 'x' }), state);
  assert.equal(reduce(state, { type: 'RESPONSE_END', turn: 1, text: 'x' }), state);
});

test('createStore notifies subscribers with state, previous state and event', () => {
  const store = createStore();
  const calls = [];
  const unsubscribe = store.subscribe((state, prev, event) => calls.push({ state, prev, event }));

  store.dispatch({ type: 'AWAKE' });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].state.phase, 'idle');
  assert.equal(calls[0].prev.phase, 'dormant');
  assert.equal(calls[0].event.type, 'AWAKE');

  unsubscribe();
  store.dispatch({ type: 'INPUT', value: 'hi' });
  assert.equal(calls.length, 1);
  assert.equal(store.getState().phase, 'listening');
});

test('createStore does not notify when the state does not change', () => {
  const store = createStore(at({ phase: 'thinking', turn: 1 }));
  let count = 0;
  store.subscribe(() => { count++; });

  const before = store.getState();
  assert.equal(store.dispatch({ type: 'INPUT', value: 'ignored' }), before);
  assert.equal(store.dispatch({ type: 'AWAKE' }), before);
  assert.equal(count, 0);
});

test('createStore unsubscribe is idempotent', () => {
  const store = createStore();
  let count = 0;
  const unsubscribe = store.subscribe(() => { count++; });

  unsubscribe();
  unsubscribe();
  store.dispatch({ type: 'AWAKE' });
  assert.equal(count, 0);
});
