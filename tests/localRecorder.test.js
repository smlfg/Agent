import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

import { createLocalRecorder } from '../src/dev/localRecorder.js';
import { createDevServer } from '../scripts/dev-server.mjs';

function makeMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    dump: () => map,
  };
}

test('createLocalRecorder records ok, error, and aborted turns without mutating results', async () => {
  let tick = 1700000000000;
  const posted = [];
  const storage = makeMemoryStorage();
  const recorder = createLocalRecorder({
    sessionId: 'unit-session-1',
    origin: 'http://127.0.0.1:5173',
    endpoint: 'http://127.0.0.1:5173/__dev/transcript',
    storage,
    fetchImpl: async (url, init) => {
      posted.push({ url, body: JSON.parse(init.body) });
      return { ok: true };
    },
    now: () => {
      tick += 25;
      return tick;
    },
  });

  const wrapped = recorder.wrapRespond(async (prompt) => {
    if (prompt === 'boom') throw new Error('provider down');
    if (prompt === 'stop') {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    }
    return {
      text: 'Ich bin agentfähig.',
      provider: 'remote',
      model: '@cf/zai-org/glm-4.7-flash',
      dev: false,
      sources: [{ id: 'what-this-is', title: 'Was ist agentfähig?' }],
      coverage: { score: 0.91 },
      contact_card: false,
    };
  });

  const res = await wrapped('Hallo');
  assert.equal(res.text, 'Ich bin agentfähig.');
  await assert.rejects(() => wrapped('boom'), /provider down/);
  await assert.rejects(() => wrapped('stop'), { name: 'AbortError' });

  const entries = recorder.getEntries();
  assert.equal(entries.length, 3);
  assert.equal(entries[0].turn, 1);
  assert.equal(entries[0].status, 'ok');
  assert.equal(entries[0].provider, 'remote');
  assert.equal(entries[0].sources[0].id, 'what-this-is');
  assert.equal(entries[0].durationMs, 25);

  assert.equal(entries[1].turn, 2);
  assert.equal(entries[1].status, 'error');
  assert.equal(entries[1].error, 'provider down');

  assert.equal(entries[2].turn, 3);
  assert.equal(entries[2].status, 'aborted');

  const stored = JSON.parse(storage.getItem('agentfaehig.local.sessions'));
  assert.equal(stored.length, 1);
  assert.equal(stored[0].sessionId, 'unit-session-1');
  assert.equal(stored[0].entries.length, 3);
  assert.equal(posted.length, 3);

  const md = recorder.exportMarkdown();
  assert.match(md, /# Local Session unit-session-1/);
  assert.match(md, /Turn 1 .* — ok/);
  assert.match(md, /\*\*Visitor:\*\* Hallo/);
  assert.match(md, /\*\*Agent:\*\* Ich bin agentfähig\./);
  assert.match(md, /sources=Was ist agentfähig\?/);
  assert.match(md, /\*\*Error:\*\* provider down/);
});

test('createLocalRecorder tolerates failing storage and failing fetch', async () => {
  const brokenStorage = {
    getItem() { throw new Error('storage blocked'); },
    setItem() { throw new Error('quota exceeded'); },
  };
  const recorder = createLocalRecorder({
    sessionId: 'resilient-1',
    origin: 'http://127.0.0.1:8787',
    endpoint: 'http://127.0.0.1:5173/__dev/transcript',
    storage: brokenStorage,
    fetchImpl: () => Promise.reject(new Error('network offline')),
  });

  const wrapped = recorder.wrapRespond(async () => ({ text: 'ok', dev: true }));
  const res = await wrapped('ping');
  assert.equal(res.text, 'ok');
  assert.equal(recorder.getEntries().length, 1);
});

async function listenEphemeral(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  return `http://127.0.0.1:${addr.port}`;
}

test('createDevServer serves static assets, records transcripts to disk, and proxies /api/agent', async (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentfaehig-devsrv-'));
  const sessionsDir = path.join(tmpDir, 'sessions');

  const mockWorker = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ text: `echo:${body.prompt}`, provider: 'mock-worker', dev: false }));
  });
  const workerUrl = await listenEphemeral(mockWorker);

  const server = createDevServer({
    sessionsDir,
    workerUrl,
  });
  const baseUrl = await listenEphemeral(server);

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => mockWorker.close(resolve));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // 1. Serves / -> living-surface.html with no-store
  const home = await fetch(`${baseUrl}/`);
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('cache-control'), 'no-store');
  const html = await home.text();
  assert.match(html, /id="composer-input"/);

  // 2. Rejects traversal
  const traversal = await fetch(`${baseUrl}/%2e%2e/package.json`);
  assert.ok(traversal.status === 403 || traversal.status === 404);

  // 3. Writes transcript JSONL + Markdown with loopback CORS
  const postRes = await fetch(`${baseUrl}/__dev/transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://127.0.0.1:8787',
    },
    body: JSON.stringify({
      sessionId: 'sess/../evil',
      turn: 1,
      ts: '2026-11-26T20:10:00.000Z',
      origin: 'http://127.0.0.1:8787',
      status: 'ok',
      prompt: 'Was ist das?',
      answer: 'Eine lebende Oberfläche.',
      provider: 'remote',
      model: '@cf/zai-org/glm-4.7-flash',
      dev: false,
      sources: [{ id: 'intro', title: 'Einführung' }],
      durationMs: 120,
    }),
  });
  assert.equal(postRes.status, 200);
  assert.equal(postRes.headers.get('access-control-allow-origin'), 'http://127.0.0.1:8787');
  const postBody = await postRes.json();
  assert.equal(postBody.ok, true);
  assert.equal(postBody.file, 'sess____evil.jsonl');

  const jsonlContent = fs.readFileSync(path.join(sessionsDir, 'sess____evil.jsonl'), 'utf8');
  const mdContent = fs.readFileSync(path.join(sessionsDir, 'sess____evil.md'), 'utf8');
  assert.match(jsonlContent, /Was ist das\?/);
  assert.match(mdContent, /# Local Session sess____evil/);
  assert.match(mdContent, /\*\*Agent:\*\* Eine lebende Oberfläche\./);

  // 4. Proxies POST /api/agent to workerUrl
  const proxyRes = await fetch(`${baseUrl}/api/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test-proxy' }),
  });
  assert.equal(proxyRes.status, 200);
  const proxyData = await proxyRes.json();
  assert.equal(proxyData.text, 'echo:test-proxy');

  // 5. Returns 503 when upstream worker is unreachable
  await new Promise((resolve) => mockWorker.close(resolve));
  const offlineRes = await fetch(`${baseUrl}/api/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'offline' }),
  });
  assert.equal(offlineRes.status, 503);
  const offlineData = await offlineRes.json();
  assert.equal(offlineData.error, 'local_worker_offline');
});
