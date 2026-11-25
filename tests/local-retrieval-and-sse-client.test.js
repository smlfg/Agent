import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteAgent } from '../src/agent/remoteAgent.js';
import { createAgentChain } from '../src/agent/chain.js';
import { searchLocalKnowledge, createLocalPreRetrievalAgent } from '../src/agent/local-retrieval.js';

const SAMPLE_KNOWLEDGE = {
  entries: [
    {
      id: 'about-samuel',
      topic: 'Samuel Fleig',
      keywords: ['samuel', 'fleig', 'owner', 'builder'],
      facts: ['Samuel builds Human-Agent Interfaces and agentfähig.'],
      link: 'https://agentfaehig.de/about-samuel',
    },
    {
      id: 'hai',
      topic: 'Human Agent Interface (HAI)',
      keywords: ['hai', 'human agent interface', 'human-agent interface'],
      facts: ['HAI is an interface where human and agent work as one system.'],
      link: null,
    },
    {
      id: 'agentfaehig',
      topic: 'Agentfähig',
      keywords: ['agentfaehig', 'agentfähig', 'website'],
      facts: ['The public embodiment of the Human-Agent Interface.'],
    },
  ],
};

function formatSseFrame(eventName, data) {
  return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sseResponse({ streamFactory, status = 200 }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        if (String(name).toLowerCase() === 'content-type') {
          return 'text/event-stream; charset=utf-8';
        }
        return null;
      },
    },
    body: {
      getReader() {
        return streamFactory();
      },
    },
  };
}

test('remoteAgent streams agent.event frames before respond resolves', async () => {
  let releaseGate;
  const gate = new Promise((resolve) => { releaseGate = resolve; });

  const events = [];
  const streamFactory = () => {
    const chunks = [
      new TextEncoder().encode(formatSseFrame('agent.event', {
        type: 'retrieval.started',
        action_id: 'retrieval-001',
        category: 'retrieval',
        status: 'started',
      })),
      new TextEncoder().encode(formatSseFrame('agent.event', {
        type: 'retrieval.completed',
        action_id: 'retrieval-001',
        category: 'retrieval',
        status: 'success',
        metadata: { coverage: 'GIVEN', hits: 2, multi_source: true, top_score: 1.2, source: 'index' },
      })),
    ];
    let index = 0;
    let gatePassed = false;

    return {
      read() {
        if (index < chunks.length) {
          const value = chunks[index];
          index += 1;
          return Promise.resolve({ done: false, value });
        }
        if (!gatePassed) {
          return gate.then(() => {
            gatePassed = true;
            const resultFrame = formatSseFrame('agent.result', {
              text: 'streamed answer',
              provider: 'workers-ai',
              model: 'llama',
              sources: [{ id: 'about-samuel', title: 'Samuel Fleig', link: null }],
              contact_card: false,
              coverage: 'GIVEN',
            });
            return { done: true, value: new TextEncoder().encode(resultFrame) };
          });
        }
        return Promise.resolve({ done: true, value: undefined });
      },
      cancel() {},
    };
  };

  const agent = createRemoteAgent({
    endpoint: 'https://example.test/api/agent',
    fetchImpl: async () => sseResponse({ streamFactory }),
  });

  const pending = agent.respond('who is samuel', {
    turnId: 1,
    onEvent: (event) => events.push(event.type),
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.deepEqual(events, ['retrieval.started', 'retrieval.completed']);

  releaseGate();
  const result = await pending;

  assert.equal(result.text, 'streamed answer');
  assert.equal(result.coverage, 'GIVEN');
  assert.equal(result.sources[0].id, 'about-samuel');
});

test('remoteAgent abort during SSE rejects with AbortError', async () => {
  const controller = new AbortController();

  const streamFactory = () => ({
    read() {
      return new Promise(() => {});
    },
    cancel() {},
  });

  const agent = createRemoteAgent({
    endpoint: 'https://example.test/api/agent',
    fetchImpl: async () => sseResponse({ streamFactory }),
  });

  const pending = agent.respond('hello', { signal: controller.signal });
  setTimeout(() => controller.abort('user-stop'), 5);

  await assert.rejects(pending, (error) => {
    assert.equal(error.name, 'AbortError');
    return true;
  });
});

test('remoteAgent agent.error on SSE stream rejects as server RemoteAgentError', async () => {
  const streamFactory = () => {
    const frame = formatSseFrame('agent.error', { error: 'providers_unavailable', status: 503 });
    let sent = false;
    return {
      read() {
        if (!sent) {
          sent = true;
          return Promise.resolve({ done: false, value: new TextEncoder().encode(frame) });
        }
        return Promise.resolve({ done: true, value: undefined });
      },
      cancel() {},
    };
  };

  const agent = createRemoteAgent({
    endpoint: 'https://example.test/api/agent',
    fetchImpl: async () => sseResponse({ streamFactory }),
  });

  await assert.rejects(agent.respond('hello'), (error) => {
    assert.equal(error.name, 'RemoteAgentError');
    assert.equal(error.kind, 'server');
    assert.equal(error.status, 503);
    return true;
  });
});

test('chain emits provider lifecycle events across failure and fallback', async () => {
  const serverErr = () => Object.assign(new Error('server'), { status: 503, kind: 'server' });
  const quotaErr = () => Object.assign(new Error('quota'), { status: 429, kind: 'quota' });

  let flakyCalls = 0;
  const flaky = {
    id: 'flaky',
    respond: async () => {
      flakyCalls += 1;
      if (flakyCalls === 1) throw serverErr();
      return { text: 'recovered', dev: false };
    },
  };
  const backup = {
    id: 'backup',
    respond: async () => ({ text: 'backup ok', dev: false }),
  };

  const retryTypes = [];
  const retryChain = createAgentChain([flaky], { retryBackoffMs: 1 });
  await retryChain.respond('hello', { onEvent: (event) => retryTypes.push(event.type) });
  assert.deepEqual(
    retryTypes.filter((t) => t.startsWith('provider.') || t.startsWith('generation.')),
    [
      'provider.started',
      'generation.started',
      'provider.failed',
      'provider.retry',
      'provider.started',
      'generation.started',
      'generation.completed',
    ],
  );

  const switchTypes = [];
  const switchChain = createAgentChain([
    { id: 'a', respond: async () => { throw quotaErr(); } },
    backup,
  ]);
  await switchChain.respond('hello', { onEvent: (event) => switchTypes.push(event.type) });
  assert.deepEqual(
    switchTypes.filter((t) => t.startsWith('provider.') || t.startsWith('generation.')),
    [
      'provider.started',
      'generation.started',
      'provider.failed',
      'provider.switched',
      'provider.started',
      'generation.started',
      'generation.completed',
    ],
  );
});

test('searchLocalKnowledge classifies Samuel/HAI as GIVEN and weather as NOT_COVERED', async () => {
  const samuel = searchLocalKnowledge('Wer ist Samuel und was ist HAI?', SAMPLE_KNOWLEDGE);
  assert.equal(samuel.coverage, 'GIVEN');
  assert.ok(samuel.hits.length >= 1);
  assert.equal(samuel.multiSource, true);
  const ids = samuel.hits.map((h) => h.id);
  assert.ok(ids.includes('about-samuel'));
  assert.ok(ids.includes('hai'));

  const weather = searchLocalKnowledge('Wie ist das Wetter morgen in Tokio?', SAMPLE_KNOWLEDGE);
  assert.equal(weather.coverage, 'NOT_COVERED');
  assert.equal(weather.hits.length, 0);
});

test('createLocalPreRetrievalAgent emits retrieval events before innerAgent completes', async () => {
  let innerResolve;
  const innerGate = new Promise((resolve) => { innerResolve = resolve; });

  const types = [];
  const wrapped = createLocalPreRetrievalAgent({
    getKnowledge: async () => SAMPLE_KNOWLEDGE,
    innerAgent: {
      respond: async () => {
        await innerGate;
        return { text: 'inner done', dev: true, sources: [] };
      },
    },
  });

  const pending = wrapped.respond('Wer ist Samuel und was ist HAI?', {
    onEvent: (event) => types.push(event.type),
  });

  await Promise.resolve();
  const retrievalIndex = types.indexOf('retrieval.completed');
  assert.ok(retrievalIndex > types.indexOf('retrieval.started'));
  assert.ok(types.includes('turn.received'));
  assert.ok(types.includes('context.prepared'));
  assert.ok(!types.includes('response.completed'));

  innerResolve();
  const result = await pending;
  assert.equal(result.coverage, 'GIVEN');
  assert.ok(result.sources.length >= 1);
  assert.equal(result.text, 'inner done');
});