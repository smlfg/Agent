// SSE embodied agent events on POST /api/agent (ADR-0008).
import test from 'node:test';
import assert from 'node:assert/strict';

import worker, { runWorkerTools, wantsEventStream } from '../deploy/agentfaehig-site/src/worker.js';
import { createSseParser } from '../src/state/agent-events.js';

const ORIGIN = 'https://www.xn--agentfhig-02a.de';
const ASSETS = { fetch: () => new Response('asset', { status: 200 }) };
const MINIMAX_KEY = 'test-minimax-key-UniqueValue-9xYz';
const OPENAI_KEY = 'test-openai-key-UniqueValue-7kLm';
const VISITOR_PROMPT = 'wer ist samuel';

function sseRequest(body, extraHeaders = {}) {
  return new Request(`${ORIGIN}/api/agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      Accept: 'text/event-stream',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

function jsonRequest(body = { prompt: 'Hallo' }) {
  return new Request(`${ORIGIN}/api/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

function minimaxOk(text) {
  return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function minimax429() {
  return new Response(JSON.stringify({ error: { type: 'rate_limit_error', message: 'limit' } }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });
}

function openRouterOk(text) {
  return new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function withFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

async function streamSse(response, { until, onFrame } = {}) {
  const frames = [];
  const agentEvents = [];
  let result = null;
  let error = null;

  const parser = createSseParser({
    onFrame(frame) {
      frames.push(frame);
      onFrame?.(frame);
      if (frame.event === 'agent.event' && frame.data && typeof frame.data === 'object') {
        agentEvents.push(frame.data);
      }
      if (frame.event === 'agent.result') result = frame.data;
      if (frame.event === 'agent.error') error = frame.data;
    },
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (value) parser.push(decoder.decode(value, { stream: true }));
    if (typeof until === 'function' && until({ agentEvents, frames, result, error })) {
      if (done) parser.flush();
      return { agentEvents, frames, result, error, reader, decoder, parser, done };
    }
    if (done) {
      parser.flush();
      break;
    }
  }

  return { agentEvents, frames, result, error, reader: null, decoder: null, parser, done: true };
}

async function finishSse({ reader, decoder, parser }) {
  const frames = [];
  const agentEvents = [];
  let result = null;
  let error = null;

  const tailParser = createSseParser({
    onFrame(frame) {
      frames.push(frame);
      if (frame.event === 'agent.event' && frame.data && typeof frame.data === 'object') {
        agentEvents.push(frame.data);
      }
      if (frame.event === 'agent.result') result = frame.data;
      if (frame.event === 'agent.error') error = frame.data;
    },
  });

  while (true) {
    const { value, done } = await reader.read();
    if (value) {
      const text = decoder.decode(value, { stream: true });
      parser.push(text);
      tailParser.push(text);
    }
    if (done) {
      parser.flush();
      tailParser.flush();
      break;
    }
  }

  return { agentEvents, frames, result, error };
}

test('wantsEventStream respects Accept and payload.stream', () => {
  const req = new Request('https://example.com', { headers: { Accept: 'text/event-stream' } });
  assert.equal(wantsEventStream(req, {}), true);
  assert.equal(wantsEventStream(new Request('https://example.com'), { stream: true }), true);
  assert.equal(wantsEventStream(new Request('https://example.com'), {}), false);
});

test('REAL-TIME: retrieval events arrive before delayed MiniMax LLM resolves', async () => {
  let resolveMiniMax;
  let miniMaxSettled = false;
  const miniMaxGate = new Promise((resolve) => {
    resolveMiniMax = (response) => {
      miniMaxSettled = true;
      resolve(response);
    };
  });

  await withFetch(async (url) => {
    if (String(url).includes('minimax')) return miniMaxGate;
    throw new Error(`unexpected fetch: ${url}`);
  }, async () => {
    const res = await worker.fetch(
      sseRequest({ prompt: VISITOR_PROMPT, turn_id: 'turn-7' }),
      { ASSETS, MINIMAX_API_KEY: MINIMAX_KEY },
    );
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/event-stream/);

    const partial = await streamSse(res, {
      until: ({ agentEvents }) => agentEvents.some((e) => e.type === 'retrieval.completed'),
    });

    assert.equal(miniMaxSettled, false);
    const types = partial.agentEvents.map((e) => e.type);
    assert.ok(types.includes('turn.received'));
    assert.ok(types.includes('context.prepared'));
    assert.ok(types.includes('retrieval.started'));
    const retrieval = partial.agentEvents.find((e) => e.type === 'retrieval.completed');
    assert.equal(retrieval?.turn_id, 'turn-7');
    assert.equal(retrieval?.metadata?.coverage, 'GIVEN');
    assert.ok((retrieval?.metadata?.hits ?? 0) >= 1);

    const thinking =
      '<think>secret internal thought</think>Samuel baut HAI [[about-samuel]].';
    resolveMiniMax(minimaxOk(thinking));

    const final = await finishSse(partial);
    const allEvents = [...partial.agentEvents, ...final.agentEvents];
    const allTypes = allEvents.map((e) => e.type);
    assert.ok(allTypes.includes('generation.completed'));
    assert.ok(final.result || partial.result);
    const payload = final.result || partial.result;
    assert.equal(payload.coverage, 'GIVEN');
    assert.match(payload.text, /^Samuel baut HAI/);
    assert.ok(allTypes.includes('turn.completed'));
  });
});

test('NOT_COVERED query streams retrieval.completed with empty hits', async () => {
  await withFetch(async () => minimaxOk('Kein Wetterdienst.'), async () => {
    const res = await worker.fetch(
      sseRequest({ prompt: 'wie wird das wetter morgen in tokio', turn_id: 2 }),
      { ASSETS, MINIMAX_API_KEY: MINIMAX_KEY },
    );
    const out = await streamSse(res);
    const retrieval = out.agentEvents.find((e) => e.type === 'retrieval.completed');
    assert.equal(retrieval?.metadata?.coverage, 'NOT_COVERED');
    assert.equal(retrieval?.metadata?.hits, 0);
    assert.equal(retrieval?.status, 'empty');
  });
});

test('embedding timeout streams embedding.timeout and BM25 answer still succeeds', async () => {
  await withFetch(async () => minimaxOk('Antwort nach BM25.'), async () => {
    const res = await worker.fetch(
      sseRequest({ prompt: VISITOR_PROMPT }),
      {
        ASSETS,
        MINIMAX_API_KEY: MINIMAX_KEY,
        AI: {
          run: async (model) => {
            if (model === '@cf/baai/bge-m3') {
              const err = new Error('timed out after 1500ms');
              err.name = 'TimeoutError';
              throw err;
            }
            return { response: 'ok nach fallback' };
          },
        },
      },
    );
    const out = await streamSse(res);
    const types = out.agentEvents.map((e) => e.type);
    assert.ok(types.includes('embedding.started'));
    const timeoutEv = out.agentEvents.find((e) => e.type === 'embedding.timeout');
    assert.ok(timeoutEv);
    assert.equal(timeoutEv.metadata?.fallback, 'bm25');
    assert.ok(types.includes('retrieval.completed'));
    assert.ok(out.result?.text);
  });
});

test('provider fallback emits switch events then openrouter success', async () => {
  await withFetch(async (url) => {
    return String(url).includes('minimax')
      ? minimax429()
      : openRouterOk('Von OpenRouter.');
  }, async () => {
    const res = await worker.fetch(
      sseRequest({ prompt: 'hallo' }),
      {
        ASSETS,
        MINIMAX_API_KEY: MINIMAX_KEY,
        OPENAI_API_KEY: OPENAI_KEY,
        OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
        OPENAI_MODEL: 'deepseek/deepseek-v4.1-flash',
      },
    );
    const out = await streamSse(res);
    const types = out.agentEvents.map((e) => e.type);
    assert.ok(types.includes('provider.started'));
    const failed = out.agentEvents.find((e) => e.type === 'provider.failed' && e.metadata?.provider === 'minimax');
    assert.ok(failed);
    assert.equal(failed.metadata?.http_status, 429);
    const switched = out.agentEvents.find((e) => e.type === 'provider.switched');
    assert.equal(switched?.metadata?.from, 'minimax');
    assert.equal(switched?.metadata?.to, 'openrouter');
    const startedOr = out.agentEvents.find(
      (e) => e.type === 'provider.started' && e.metadata?.provider === 'openrouter',
    );
    assert.ok(startedOr);
    assert.ok(types.includes('generation.completed'));
    assert.equal(out.result?.provider, 'openrouter');
  });
});

test('all providers fail: system.error and agent.error 503', async () => {
  await withFetch(async (url) => {
    return String(url).includes('minimax') ? minimax429() : new Response('', { status: 500 });
  }, async () => {
    const res = await worker.fetch(
      sseRequest({ prompt: 'hallo' }),
      {
        ASSETS,
        MINIMAX_API_KEY: MINIMAX_KEY,
        OPENAI_API_KEY: OPENAI_KEY,
        OPENAI_MODEL: 'model',
        AI: { run: async () => { throw new Error('quota'); } },
      },
    );
    const out = await streamSse(res);
    assert.ok(out.agentEvents.some((e) => e.type === 'system.error'));
    assert.equal(out.error?.status, 503);
    assert.equal(out.error?.error, 'providers_unavailable');
  });
});

test('runWorkerTools parallel retry and failure events', async () => {
  const events = [];
  const emitEvent = (partial) => events.push(partial);

  let retryOnceCalls = 0;
  const tools = [
    {
      name: 'retry-once',
      maxRetries: 1,
      async run() {
        retryOnceCalls += 1;
        if (retryOnceCalls === 1) throw new Error('transient');
      },
    },
    {
      name: 'always-ok',
      async run() {
        await new Promise((r) => setTimeout(r, 5));
      },
    },
    {
      name: 'fail-hard',
      async run() {
        await new Promise((r) => setTimeout(r, 40));
        throw new Error('boom');
      },
    },
  ];

  await assert.rejects(
    () => runWorkerTools(tools, { retrieved: { hits: [] }, params: {} }, emitEvent),
    /boom/,
  );

  const types = events.map((e) => e.type);
  assert.ok(types.includes('tool.started'));
  assert.ok(types.includes('tool.retry'));
  assert.ok(types.includes('tool.completed'));
  assert.ok(types.includes('tool.failed'));
  assert.ok(events.filter((e) => e.type === 'tool.started').length >= 2);
});

test('no secret, reasoning, or visitor prompt in agent.event SSE payloads', async () => {
  const prompt = 'wer ist samuel privatfrage 42';
  await withFetch(async (url) => {
    if (String(url).includes('minimax')) {
      return minimaxOk(
        '<think>do not leak</think>ok [[about-samuel]].',
      );
    }
    throw new Error(url);
  }, async () => {
    const res = await worker.fetch(
      sseRequest({ prompt, turn_id: 3 }),
      { ASSETS, MINIMAX_API_KEY: MINIMAX_KEY, OPENAI_API_KEY: OPENAI_KEY },
    );
    const out = await streamSse(res);
    const eventFrames = out.frames.filter((f) => f.event === 'agent.event');
    assert.ok(eventFrames.length > 0);
    for (const frame of eventFrames) {
      const raw = `event: agent.event\ndata: ${JSON.stringify(frame.data)}\n\n`;
      assert.doesNotMatch(raw, new RegExp(MINIMAX_KEY));
      assert.doesNotMatch(raw, new RegExp(OPENAI_KEY));
      assert.doesNotMatch(raw, /redacted_thinking/);
      assert.doesNotMatch(raw, /do not leak/);
      assert.doesNotMatch(raw, new RegExp(prompt));
    }
  });
});

test('JSON agent endpoint remains backward compatible', async () => {
  await withFetch(async () => minimaxOk('json ok'), async () => {
    const res = await worker.fetch(jsonRequest({ prompt: 'Hallo' }), {
      ASSETS,
      MINIMAX_API_KEY: MINIMAX_KEY,
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.text, 'json ok');
    assert.equal(res.headers.get('content-type')?.includes('application/json'), true);
  });
});