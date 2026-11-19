import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteAgent, isProductionHost } from '../src/agent/remoteAgent.js';
import { classifyError } from '../src/agent/chain.js';

const ENDPOINT = 'https://example.test/api/agent';

const jsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

const pendingForever = () => new Promise(() => {});

const fetchReturning = (data, status = 200, onCall = () => {}) =>
  async (url, init) => {
    onCall(url, init);
    return jsonResponse(data, status);
  };

test('adapter exposes id "remote" and posts the prompt to the endpoint', async () => {
  const calls = [];
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    getSystem: () => 'stay quiet',
    fetchImpl: fetchReturning({ text: 'hi back', provider: 'workers-ai', model: 'llama' }, 200, (url, init) => calls.push({ url, init })),
  });

  assert.equal(agent.id, 'remote');
  const result = await agent.respond('hello');

  assert.deepEqual(result, { text: 'hi back', dev: false, provider: 'workers-ai', model: 'llama' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, ENDPOINT);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');

  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.prompt, 'hello');
  assert.equal(body.system, 'stay quiet');
  assert.equal('history' in body, false);
});

test('resolves a relative endpoint against the page origin, not the <base>', async () => {
  const previous = globalThis.location;
  globalThis.location = { origin: 'https://www.agentfähig.de' };
  try {
    let seen = null;
    const agent = createRemoteAgent({
      fetchImpl: async (url) => {
        seen = url;
        return jsonResponse({ text: 'ok', provider: 'p', model: 'm' });
      },
    });
    await agent.respond('hello');
    // new URL() canonicalises the internationalised host to punycode.
    assert.equal(seen, 'https://www.xn--agentfhig-02a.de/api/agent');
  } finally {
    globalThis.location = previous;
  }
});

test('keeps only the last historyTurns turns in session memory', async () => {
  const bodies = [];
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    historyTurns: 1,
    fetchImpl: fetchReturning({ text: 'answer' }, 200, (url, init) => bodies.push(JSON.parse(init.body))),
  });

  await agent.respond('first');
  await agent.respond('second');

  assert.equal('history' in bodies[0], false);
  assert.deepEqual(bodies[1].history, [
    { role: 'user', content: 'first' },
    { role: 'assistant', content: 'answer' },
  ]);
  assert.equal(bodies[1].prompt, 'second');
});

test('a 503 response rejects as kind server and is classified as server', async () => {
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    fetchImpl: async () => jsonResponse({ error: 'no provider' }, 503),
  });

  await assert.rejects(agent.respond('hello'), (error) => {
    assert.equal(error.kind, 'server');
    assert.equal(error.status, 503);
    assert.equal(classifyError(error), 'server');
    return true;
  });
});

test('a 429 response rejects as kind quota and is classified as quota', async () => {
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    fetchImpl: async () => jsonResponse({ error: 'slow down' }, 429),
  });

  await assert.rejects(agent.respond('hello'), (error) => {
    assert.equal(error.kind, 'quota');
    assert.equal(classifyError(error), 'quota');
    return true;
  });
});

test('a rejected fetch rejects as kind network and is classified as network', async () => {
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    fetchImpl: async () => { throw new TypeError('fetch failed'); },
  });

  await assert.rejects(agent.respond('hello'), (error) => {
    assert.equal(error.kind, 'network');
    assert.equal(classifyError(error), 'network');
    return true;
  });
});

test('a hanging request rejects as kind timeout and is classified as timeout', async () => {
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    timeoutMs: 10,
    fetchImpl: pendingForever,
  });

  await assert.rejects(agent.respond('hello'), (error) => {
    assert.equal(error.kind, 'timeout');
    assert.equal(error.name, 'TimeoutError');
    assert.equal(classifyError(error), 'timeout');
    return true;
  });
});

test('an outer abort rejects with AbortError and never resolves', async () => {
  const controller = new AbortController();
  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    timeoutMs: 5000,
    fetchImpl: (url, init) => new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        reject(error);
      }, { once: true });
    }),
  });

  const pending = agent.respond('hello', { signal: controller.signal });
  setTimeout(() => controller.abort(), 5);

  await assert.rejects(pending, (error) => {
    assert.equal(error.name, 'AbortError');
    return true;
  });
});

test('an already-aborted signal rejects before calling fetch', async () => {
  let calls = 0;
  const controller = new AbortController();
  controller.abort();

  const agent = createRemoteAgent({
    endpoint: ENDPOINT,
    fetchImpl: async () => { calls += 1; return jsonResponse({ text: 'nope' }); },
  });

  await assert.rejects(agent.respond('hello', { signal: controller.signal }), (error) => {
    assert.equal(error.name, 'AbortError');
    return true;
  });
  assert.equal(calls, 0);
});

test('isProductionHost accepts the production spellings only', () => {
  for (const host of [
    'www.xn--agentfhig-02a.de',
    'xn--agentfhig-02a.de',
    'www.agentfähig.de',
    'agentfähig.de',
    'AGENTFÄHIG.DE',
    'agentfähig.de.',
  ]) {
    assert.equal(isProductionHost(host), true, `expected production host: ${host}`);
  }

  for (const host of ['localhost', '127.0.0.1', 'localhost:5173', '127.0.0.1:5173', '', null, undefined, 'example.com', 'evilagentfähig.de']) {
    assert.equal(isProductionHost(host), false, `expected non-production host: ${host}`);
  }
});
