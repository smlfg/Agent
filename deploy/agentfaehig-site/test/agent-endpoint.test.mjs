// Verhalten von POST /api/agent ohne Netzwerk: fetch wird ersetzt.
// Prüft die Anbieter-Reihenfolge (MiniMax → OpenAI-kompatibel → Workers AI),
// die ehrliche 503-Antwort ohne Anbieter und die Origin-Sperre.
import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../src/worker.js';

const ORIGIN = 'https://www.xn--agentfhig-02a.de';
const ASSETS = { fetch: () => new Response('asset', { status: 200 }) };

function request(body = { prompt: 'Hallo' }, origin = ORIGIN) {
  return new Request(`${ORIGIN}/api/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body),
  });
}

function minimaxOk(text = 'Antwort von MiniMax') {
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

function completion(text = 'Antwort vom zweiten Anbieter') {
  return new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function withFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return Promise.resolve()
    .then(run)
    .finally(() => { globalThis.fetch = original; });
}

test('MiniMax antwortet: provider minimax, kein zweiter Aufruf', async () => {
  const calls = [];
  await withFetch(async (url) => {
    calls.push(String(url));
    return minimaxOk();
  }, async () => {
    const res = await worker.fetch(request(), {
      ASSETS,
      MINIMAX_API_KEY: 'test',
      OPENAI_API_KEY: 'test2',
      OPENAI_MODEL: 'model',
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      text: 'Antwort von MiniMax',
      provider: 'minimax',
      model: 'MiniMax-M3.1-Flash',
    });
  });
  assert.equal(calls.length, 1);
  assert.match(calls[0], /minimax/);
});

test('MiniMax 429: fällt auf den OpenAI-kompatiblen Anbieter zurück', async () => {
  const calls = [];
  await withFetch(async (url) => {
    calls.push(String(url));
    return String(url).includes('minimax') ? minimax429() : completion();
  }, async () => {
    const res = await worker.fetch(request(), {
      ASSETS,
      MINIMAX_API_KEY: 'test',
      MINIMAX_MODEL: 'MiniMax-M3.1-Flash',
      OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
      OPENAI_MODEL: 'deepseek/deepseek-v4.1-flash',
      OPENAI_API_KEY: 'test2',
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.provider, 'openrouter');
    assert.equal(body.text, 'Antwort vom zweiten Anbieter');
  });
  assert.equal(calls.length, 2);
  assert.match(calls[1], /^https:\/\/openrouter\.ai\/api\/v1\/chat\/completions$/);
});

test('Kein Anbieter erreichbar: ehrliche 503 statt erfundener Antwort', async () => {
  await withFetch(async (url) => (String(url).includes('minimax') ? minimax429() : new Response('', { status: 500 })), async () => {
    const res = await worker.fetch(request(), {
      ASSETS,
      MINIMAX_API_KEY: 'test',
      OPENAI_API_KEY: 'test2',
      OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
      OPENAI_MODEL: 'model',
    });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), {
      error: 'providers_unavailable',
      attempts: ['minimax', 'openai'],
    });
  });
});

test('MiniMax 429 ohne zweiten Schlüssel: Workers AI antwortet', async () => {
  const seen = [];
  await withFetch(async () => minimax429(), async () => {
    const res = await worker.fetch(request(), {
      ASSETS,
      MINIMAX_API_KEY: 'test',
      AI: {
        run: async (model, input) => {
          seen.push({ model, input });
          return { response: 'Antwort von Workers AI' };
        },
      },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      text: 'Antwort von Workers AI',
      provider: 'workers-ai',
      model: '@cf/zai-org/glm-4.7-flash',
    });
  });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].model, '@cf/zai-org/glm-4.7-flash');
  assert.ok(Array.isArray(seen[0].input.messages));
});

test('Workers AI: choices-Form wird gelesen, Modell aus der Umgebung gilt', async () => {
  await withFetch(async () => minimax429(), async () => {
    const res = await worker.fetch(request(), {
      ASSETS,
      MINIMAX_API_KEY: 'test',
      WORKERS_AI_MODEL: '@cf/openai/gpt-oss-20b',
      AI: { run: async () => ({ choices: [{ message: { content: 'aus choices' } }] }) },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.text, 'aus choices');
    assert.equal(body.model, '@cf/openai/gpt-oss-20b');
  });
});

test('Alle drei Anbieter scheitern: providers_unavailable mit Versuchsliste', async () => {
  await withFetch(async (url) => (String(url).includes('minimax') ? minimax429() : new Response('', { status: 500 })), async () => {
    const res = await worker.fetch(request(), {
      ASSETS,
      MINIMAX_API_KEY: 'test',
      OPENAI_API_KEY: 'test2',
      OPENAI_MODEL: 'model',
      AI: { run: async () => { throw new Error('quota'); } },
    });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), {
      error: 'providers_unavailable',
      attempts: ['minimax', 'openai', 'workers-ai'],
    });
  });
});

test('Ohne Schlüssel: keine erfundene Antwort', async () => {
  const res = await worker.fetch(request(), { ASSETS });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: 'no_provider' });
});

test('Fremde Origin wird abgelehnt', async () => {
  const res = await worker.fetch(request({ prompt: 'Hallo' }, 'https://example.com'), {
    ASSETS,
    MINIMAX_API_KEY: 'test',
  });
  assert.equal(res.status, 403);
});

test('Leerer Prompt wird abgelehnt', async () => {
  const res = await worker.fetch(request({ prompt: '   ' }), { ASSETS });
  assert.equal(res.status, 400);
});

test('Default system prompt defines Human-Agent Interface (HAI) when system is omitted', async () => {
  let capturedMessages = null;
  const res = await worker.fetch(request({ prompt: 'was ist humanagent interface' }), {
    ASSETS,
    AI: {
      run: async (_model, input) => {
        capturedMessages = input.messages;
        return { response: 'HAI ist eine Schnittstelle.' };
      },
    },
  });
  assert.equal(res.status, 200);
  assert.equal(capturedMessages?.[0]?.role, 'system');
  assert.match(capturedMessages?.[0]?.content || '', /Human-Agent Interface \(HAI\)/);
  assert.match(capturedMessages?.[0]?.content || '', /human and agent work as one system/i);
});
