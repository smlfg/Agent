import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickResponse, respond } from '../src/dev/devAgent.js';

test('pickResponse is deterministic for the same prompt', () => {
  const first = pickResponse('hello');
  const second = pickResponse('hello');
  assert.equal(typeof first, 'string');
  assert.ok(first.length > 0);
  assert.equal(first, second);
});

test('pickResponse is deterministic across many prompts', () => {
  for (const prompt of ['a', 'b', 'hello world', '', '123', 'x'.repeat(500)]) {
    assert.equal(pickResponse(prompt), pickResponse(prompt));
  }
});

test('pickResponse returns a string for missing input', () => {
  assert.equal(typeof pickResponse(undefined), 'string');
  assert.equal(pickResponse(undefined), pickResponse(''));
});

test('respond resolves with the deterministic text and dev marker', async () => {
  const result = await respond('hello', { delayMs: 0 });
  assert.deepEqual(result, { text: pickResponse('hello'), dev: true });
  assert.equal(result.dev, true);
  assert.equal(typeof result.text, 'string');
});

test('respond rejects with AbortError when the signal is already aborted', async () => {
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    respond('hello', { signal: controller.signal, delayMs: 0 }),
    (error) => error instanceof Error && error.name === 'AbortError',
  );
});

test('respond rejects with AbortError when aborted while pending', async () => {
  const controller = new AbortController();
  const pending = respond('hello', { signal: controller.signal, delayMs: 1000 });

  await new Promise((resolve) => setTimeout(resolve, 5));
  controller.abort();

  await assert.rejects(
    pending,
    (error) => error instanceof Error && error.name === 'AbortError',
  );
});
