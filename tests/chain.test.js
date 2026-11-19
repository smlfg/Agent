import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAgentChain,
  classifyError,
  AllProvidersFailed,
} from '../src/agent/chain.js';
import {
  buildDevChain,
  createFailingAgent,
  parseFailureKinds,
} from '../src/dev/failingAgents.js';

const abortErr = () => Object.assign(new Error('aborted'), { name: 'AbortError' });
const quotaErr = () => Object.assign(new Error('quota'), { status: 429, code: '4006' });
const timeoutErr = () => Object.assign(new Error('timeout'), { name: 'TimeoutError' });
const networkErr = () => Object.assign(new Error('network'), { code: 'ECONNRESET', kind: 'network' });
const filterErr = () => Object.assign(new Error('blocked'), { status: 400, kind: 'content-filter' });
const serverErr = () => Object.assign(new Error('server'), { status: 503 });

const adapter = (id, respond) => ({ id, respond });

const ok = (id, text = `${id} answer`) =>
  adapter(id, async () => ({ text, dev: false }));

function failing(id, error, delayMs = 1) {
  let calls = 0;
  const agent = adapter(id, (prompt, { signal } = {}) => {
    calls += 1;
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(abortErr());
      const timer = setTimeout(() => reject(error), delayMs);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(abortErr());
      }, { once: true });
    });
  });
  return Object.assign(agent, { calls: () => calls });
}

const pending = (id) =>
  adapter(id, (prompt, { signal } = {}) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortErr());
    signal?.addEventListener('abort', () => reject(abortErr()), { once: true });
  }));

test('classifyError separates quota, timeout, network, content-filter, server', () => {
  assert.equal(classifyError(quotaErr()), 'quota');
  assert.equal(classifyError({ code: '4006' }), 'quota');
  assert.equal(classifyError({ status: 429 }), 'quota');
  assert.equal(classifyError(timeoutErr()), 'timeout');
  assert.equal(classifyError(networkErr()), 'network');
  assert.equal(classifyError(new TypeError('fetch failed')), 'network');
  assert.equal(classifyError(filterErr()), 'content-filter');
  assert.equal(classifyError({ status: 400 }), 'content-filter');
  assert.equal(classifyError(serverErr()), 'server');
  assert.equal(classifyError(abortErr()), 'abort');
});

test('tries adapters in priority order and returns the first success', async () => {
  const chain = createAgentChain([failing('a', quotaErr()), ok('b', 'from b')]);
  const result = await chain.respond('hello');

  assert.equal(result.provider, 'b');
  assert.equal(result.text, 'from b');
  assert.equal(result.dev, false);
  assert.deepEqual(result.attempts.map((a) => a.provider), ['a', 'b']);
  assert.equal(result.attempts[0].kind, 'quota');
  assert.equal(result.attempts[1].outcome, 'success');
});

test('walks down through quota, timeout and network failures', async () => {
  const chain = createAgentChain([
    failing('a', quotaErr()),
    failing('b', timeoutErr()),
    failing('c', networkErr()),
    ok('d', 'last link'),
  ], { timeoutMs: 100 });
  const result = await chain.respond('hello');

  assert.equal(result.provider, 'd');
  assert.deepEqual(
    result.attempts.map((a) => a.kind ?? a.outcome),
    ['quota', 'timeout', 'network', 'success'],
  );
});

test('a real hang becomes a timeout and moves to the next provider', async () => {
  const chain = createAgentChain([pending('slow'), ok('next', 'recovered')], { timeoutMs: 20 });
  const result = await chain.respond('hello');

  assert.equal(result.provider, 'next');
  assert.equal(result.attempts[0].outcome, 'timeout');
  assert.equal(result.attempts[0].provider, 'slow');
});

test('an outer abort stops the whole chain and reaches no later adapter', async () => {
  const controller = new AbortController();
  const second = ok('second', 'must not run');
  let secondCalls = 0;
  second.respond = async () => {
    secondCalls += 1;
    return { text: 'must not run' };
  };

  const chain = createAgentChain([pending('first'), second], { timeoutMs: 5000 });
  const pendingResult = chain.respond('hello', { signal: controller.signal });

  setTimeout(() => controller.abort(), 10);

  await assert.rejects(pendingResult, (error) => error.name === 'AbortError');
  assert.equal(secondCalls, 0);
});

test('throws AllProvidersFailed with every attempt once all providers fail', async () => {
  const chain = createAgentChain([
    failing('a', quotaErr()),
    failing('b', networkErr()),
  ]);

  await assert.rejects(chain.respond('hello'), (error) => {
    assert.ok(error instanceof AllProvidersFailed);
    assert.equal(error.name, 'AllProvidersFailed');
    assert.deepEqual(error.attempts.map((a) => a.provider), ['a', 'b']);
    return true;
  });
});

test('circuit breaker skips a provider after three consecutive quota errors for 60 s', async () => {
  let clock = 0;
  const primary = failing('primary', quotaErr());
  const backup = ok('backup', 'still here');
  const chain = createAgentChain([primary, backup], { now: () => clock });

  for (let i = 0; i < 3; i++) {
    const result = await chain.respond('hello');
    assert.equal(result.provider, 'backup');
    assert.equal(result.attempts[0].kind, 'quota');
  }
  assert.equal(primary.calls(), 3);

  const skipped = await chain.respond('hello');
  assert.equal(skipped.provider, 'backup');
  assert.equal(skipped.attempts[0].outcome, 'skipped');
  assert.equal(skipped.attempts[0].reason, 'circuit-open');
  assert.equal(primary.calls(), 3);

  clock += 60001;
  const afterCooldown = await chain.respond('hello');
  assert.equal(afterCooldown.attempts[0].provider, 'primary');
  assert.equal(afterCooldown.attempts[0].kind, 'quota');
  assert.equal(primary.calls(), 4);
});

test('content-filter is not passed on to the next provider', async () => {
  const second = failing('second', quotaErr());
  const chain = createAgentChain([failing('first', filterErr()), second]);

  await assert.rejects(chain.respond('hello'), (error) => {
    assert.equal(error.name, 'ContentFilterError');
    return true;
  });
  assert.equal(second.calls(), 0);
});

test('a 5xx is retried once at the same provider before moving on', async () => {
  let calls = 0;
  const flaky = adapter('flaky', async () => {
    calls += 1;
    if (calls === 1) throw serverErr();
    return { text: 'second time works', dev: false };
  });
  const backup = ok('backup');
  const chain = createAgentChain([flaky, backup], { retryBackoffMs: 1 });
  const result = await chain.respond('hello');

  assert.equal(result.provider, 'flaky');
  assert.equal(result.text, 'second time works');
  assert.equal(calls, 2);
  assert.deepEqual(result.attempts.map((a) => a.outcome), ['error', 'success']);
  assert.equal(result.attempts[0].kind, 'server');
});

test('buildDevChain puts simulated failures in front of the canned dev agent', async () => {
  assert.deepEqual(parseFailureKinds(new URLSearchParams('fail=quota,timeout')), ['quota', 'timeout']);
  assert.deepEqual(parseFailureKinds('?fail=network,bogus'), ['network']);

  const chain = buildDevChain(new URLSearchParams('fail=quota,timeout'));
  const result = await chain.respond('hello');

  assert.equal(result.provider, 'dev');
  assert.equal(result.dev, true);
  assert.match(result.text, /\S/);
  assert.deepEqual(result.attempts.map((a) => a.kind ?? a.outcome), ['quota', 'timeout', 'success']);

  const onlyDev = buildDevChain(new URLSearchParams('fail=bogus'));
  const devResult = await onlyDev.respond('hello');
  assert.equal(devResult.provider, 'dev');
  assert.equal(devResult.attempts.length, 1);
});

test('createFailingAgent simulates each documented failure class', async () => {
  for (const kind of ['quota', 'timeout', 'network']) {
    const agent = createFailingAgent(kind, { delayMs: 1 });
    await assert.rejects(agent.respond('hello'), (error) => error.name !== 'AbortError');
  }
});
