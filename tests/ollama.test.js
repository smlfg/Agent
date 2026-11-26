import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOllamaAgent,
  parseModelParam,
  cleanAnswer,
  DEFAULT_SYSTEM,
} from '../src/agent/ollamaAgent.js';

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function chatBody(content) {
  return { message: { role: 'assistant', content } };
}

function agent(fetchImpl, options = {}) {
  return createOllamaAgent({
    baseUrl: 'http://127.0.0.1:11434',
    model: 'lfm3-vl:latest',
    fetchImpl,
    ...options,
  });
}

test('id includes the model', () => {
  assert.equal(agent(async () => jsonResponse(chatBody('hi'))).id, 'ollama:lfm3-vl:latest');
});

test('request has the required shape', async () => {
  const calls = [];
  const a = agent(async (url, init) => {
    calls.push({ url, init });
    return jsonResponse(chatBody('Hello there.'));
  }, { maxTokens: 55, temperature: 0.4 });

  await a.respond('hey');

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://127.0.0.1:11434/api/chat');
  assert.equal(calls[0].init.method, 'POST');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.stream, false);
  assert.equal(body.think, false);
  assert.equal(body.keep_alive, '30m');
  assert.equal(body.model, 'lfm3-vl:latest');
  assert.equal(body.options.num_predict, 55);
  assert.equal(body.options.temperature, 0.4);
  assert.equal(body.messages[0].role, 'system');
  assert.equal(body.messages[0].content, DEFAULT_SYSTEM);
  assert.equal(body.messages.at(-1).content, 'hey');
});

test('getSystem overrides the system prompt per request', async () => {
  let calls = 0;
  const a = agent(async (url, init) => {
    const body = JSON.parse(init.body);
    calls += 1;
    return jsonResponse(chatBody(`answer ${calls}`));
  }, { getSystem: () => `persona ${calls}` });

  await a.respond('one');
  await a.respond('two');

  // captured bodies are not retained; re-run to inspect the second request
  const bodies = [];
  const b = agent(async (url, init) => {
    bodies.push(JSON.parse(init.body));
    return jsonResponse(chatBody('ok.'));
  }, { getSystem: () => `persona ${bodies.length + 1}` });

  await b.respond('one');
  await b.respond('two');
  assert.equal(bodies[0].messages[0].content, 'persona 1');
  assert.equal(bodies[1].messages[0].content, 'persona 2');
});

test('thinking tags are removed and whitespace trimmed', async () => {
  const a = agent(async () => jsonResponse(chatBody('  <think>hmm</think>Hi there.  ')));
  const result = await a.respond('hey');
  assert.equal(result.text, 'Hi there.');
});

test('unclosed thinking block is removed (nothing left → provider error)', async () => {
  const a = agent(async () => jsonResponse(chatBody('<think>secret reasoning that never closes')));
  await assert.rejects(() => a.respond('hey'), (err) => err.kind === 'server');
});

test('answers are cut to three sentences', async () => {
  const a = agent(async () =>
    jsonResponse(chatBody('One. Two. Three. Four. Five.')));
  const result = await a.respond('hey');
  assert.equal(result.text, 'One. Two. Three.');
});

test('result carries dev/provider/model', async () => {
  const a = agent(async () => jsonResponse(chatBody('Fine.')));
  const result = await a.respond('hey');
  assert.deepEqual(result, {
    text: 'Fine.',
    dev: true,
    provider: 'ollama',
    model: 'lfm3-vl:latest',
  });
});

test('history keeps only the last N turns', async () => {
  const bodies = [];
  const a = agent(async (url, init) => {
    bodies.push(JSON.parse(init.body));
    return jsonResponse(chatBody(`reply ${bodies.length}`));
  }, { historyTurns: 2 });

  await a.respond('turn1');
  await a.respond('turn2');
  await a.respond('turn3');

  const third = bodies[2].messages;
  // system + 2 previous pairs + current user
  assert.equal(third.length, 1 + 2 * 2 + 1);
  assert.deepEqual(
    third.map((m) => `${m.role}:${m.content}`),
    [
      'system:' + DEFAULT_SYSTEM,
      'user:turn1',
      'assistant:reply 1',
      'user:turn2',
      'assistant:reply 2',
      'user:turn3',
    ],
  );
});

test('historyTurns 0 keeps no memory', async () => {
  const bodies = [];
  const a = agent(async (url, init) => {
    bodies.push(JSON.parse(init.body));
    return jsonResponse(chatBody('ok.'));
  }, { historyTurns: 0 });

  await a.respond('one');
  await a.respond('two');
  assert.equal(bodies[1].messages.length, 2);
});

test('network failure classifies as network', async () => {
  const a = agent(async () => {
    throw new TypeError('fetch failed');
  });
  await assert.rejects(a.respond('hey'), (error) => error.kind === 'network');
});

test('HTTP 500 classifies as server', async () => {
  const a = agent(async () => jsonResponse({ error: 'boom' }, 500));
  await assert.rejects(a.respond('hey'), (error) => error.kind === 'server');
});

test('HTTP 404 (missing model) classifies as server', async () => {
  const a = agent(async () => jsonResponse({ error: 'model not found' }, 404));
  await assert.rejects(a.respond('hey'), (error) => error.kind === 'server');
});

test('empty answer is a server-class error', async () => {
  const a = agent(async () => jsonResponse(chatBody('<think>x</think>')));
  await assert.rejects(a.respond('hey'), (error) => error.kind === 'server');
});

test('external abort becomes AbortError', async () => {
  const controller = new AbortController();
  const a = agent((url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));

  const pending = a.respond('hey', { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, (error) => error.name === 'AbortError');
});

test('pre-aborted signal rejects without a request', async () => {
  let called = false;
  const controller = new AbortController();
  controller.abort();
  const a = agent(async () => {
    called = true;
    return jsonResponse(chatBody('hi.'));
  });
  await assert.rejects(a.respond('hey', { signal: controller.signal }), (e) => e.name === 'AbortError');
  assert.equal(called, false);
});

test('probe is true on ok and false on failure', async () => {
  const ok = agent(async (url) => {
    assert.equal(url, 'http://127.0.0.1:11434/api/tags');
    return { ok: true, status: 200, json: async () => ({ models: [] }) };
  });
  assert.equal(await ok.probe(), true);

  const bad = agent(async () => {
    throw new TypeError('fetch failed');
  });
  assert.equal(await bad.probe(), false);
});

test('warmUp sends num_predict 1 and swallows errors', async () => {
  let body = null;
  const a = agent(async (url, init) => {
    body = JSON.parse(init.body);
    throw new TypeError('fetch failed');
  });
  await a.warmUp();
  assert.equal(body.options.num_predict, 1);

  const healthy = agent(async () => jsonResponse(chatBody('ok.')));
  await healthy.warmUp();
});

test('cleanAnswer handles empty input', () => {
  assert.equal(cleanAnswer('   '), '');
  assert.equal(cleanAnswer(null), '');
});

test('cleanAnswer keeps URLs and domains intact and preserves <surface> blocks while stripping them from history', async () => {
  const urlReply = cleanAnswer(
    'Besuche https://www.human-agent-interface.com und agentfähig.de für Details. Zweiter Satz. Dritter Satz. Vierter Satz.',
  );
  assert.equal(
    urlReply,
    'Besuche https://www.human-agent-interface.com und agentfähig.de für Details. Zweiter Satz. Dritter Satz.',
  );

  const bodies = [];
  const replies = [
    'Ich passe mich an. Zwei. Drei. Vier. <surface>{"motion":{"energy":0.2}}</surface>',
    'Gerne.',
  ];
  const a = agent(async (url, init) => {
    bodies.push(JSON.parse(init.body));
    return jsonResponse(chatBody(replies[bodies.length - 1]));
  });

  const first = await a.respond('Sei ruhiger');
  assert.equal(first.text, 'Ich passe mich an. Zwei. Drei. <surface>{"motion":{"energy":0.2}}</surface>');

  await a.respond('Und jetzt?');
  assert.deepEqual(bodies[1].messages, [
    { role: 'system', content: DEFAULT_SYSTEM },
    { role: 'user', content: 'Sei ruhiger' },
    { role: 'assistant', content: 'Ich passe mich an. Zwei. Drei.' },
    { role: 'user', content: 'Und jetzt?' },
  ]);
});

test('parseModelParam reads model and llm', () => {
  assert.deepEqual(parseModelParam(new URLSearchParams('?model=qwen3:8b')), {
    model: 'qwen3:8b',
    enabled: true,
  });
  assert.deepEqual(parseModelParam('?llm=off'), { model: null, enabled: false });
  assert.deepEqual(parseModelParam(new URLSearchParams('model=mistral:latest&llm=off')), {
    model: 'mistral:latest',
    enabled: false,
  });
  assert.deepEqual(parseModelParam(''), { model: null, enabled: true });
  assert.deepEqual(parseModelParam(undefined), { model: null, enabled: true });
});
