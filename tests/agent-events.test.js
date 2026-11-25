import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AGENT_EVENT_TYPES,
  AGENT_EVENT_CATEGORIES,
  AGENT_EVENT_STATUSES,
  turnIdFor,
  parseTurnNumber,
  isValidEventType,
  sanitizeMetadata,
  inferDefaultStatus,
  createAgentEvent,
  sanitizeAgentEvent,
  formatSseFrame,
  createSseParser,
  createAgentEventBus,
} from '../src/state/agent-events.js';
import { createStore, reduce, initialState, initialEmbodiedState } from '../src/state/store.js';

test('turnIdFor and parseTurnNumber', () => {
  assert.equal(turnIdFor(' turn-3 '), 'turn-3');
  assert.equal(turnIdFor(4), 'turn-4');
  assert.equal(turnIdFor('bad'), 'turn-0');
  assert.equal(parseTurnNumber('turn-7'), 7);
  assert.equal(parseTurnNumber(2), 2);
  assert.equal(parseTurnNumber('x'), null);
});

test('createAgentEvent canonical fields and default status', () => {
  const ev = createAgentEvent({ type: 'embedding.started', turn: 2, action_id: 'emb-1' });
  assert.equal(ev.turn_id, 'turn-2');
  assert.equal(ev.category, 'embedding');
  assert.equal(ev.status, 'started');
  assert.equal(ev.simulated, false);
  assert.deepEqual(ev.metadata, {});

  const running = createAgentEvent({ type: 'turn.received', turn_id: 'turn-1' });
  assert.equal(running.status, 'running');

  const succ = createAgentEvent({
    type: 'retrieval.completed',
    metadata: { coverage: 'GIVEN', hits: 3 },
  });
  assert.equal(succ.status, 'success');

  const empty = createAgentEvent({
    type: 'retrieval.completed',
    metadata: { coverage: 'NOT_COVERED' },
  });
  assert.equal(empty.status, 'empty');
  assert.equal(inferDefaultStatus('tool.failed', {}), 'error');
});

test('sanitizeMetadata redacts secrets and unsafe content', () => {
  const raw = {
    api_key: 'sk-secret',
    Authorization: 'Bearer abc.def',
    prompt: 'hidden',
    system: 'sys',
    messages: ['a'],
    ip: '1.2.3.4',
    text: 'body',
    note: 'hello Bearer tok_xxx and sk-ABCDEFGHIJKL',
    detail: 'pre <think>secret</think> post',
    hits: 5,
    ok: true,
    source_ids: ['a', 'b'],
  };
  const meta = sanitizeMetadata(raw);
  assert.equal(meta.api_key, undefined);
  assert.equal(meta.prompt, undefined);
  assert.equal(meta.text, undefined);
  assert.equal(meta.note, 'hello [REDACTED] and [REDACTED]');
  assert.equal(meta.detail, 'pre post');
  assert.equal(meta.hits, 5);
  assert.equal(meta.ok, true);
  assert.deepEqual(meta.source_ids, ['a', 'b']);
  assert.equal(sanitizeMetadata(null).hits, undefined);
});

test('sanitizeAgentEvent never throws', () => {
  assert.equal(sanitizeAgentEvent(null), null);
  assert.equal(sanitizeAgentEvent({ type: 'nope' }), null);
  const ok = sanitizeAgentEvent({ type: 'turn.waiting', turn_id: 'turn-1' });
  assert.equal(ok.type, 'turn.waiting');
});

test('formatSseFrame and streaming parser', () => {
  const frame = formatSseFrame('agent.event', { a: 1 });
  assert.equal(frame, 'event: agent.event\ndata: {"a":1}\n\n');

  const frames = [];
  const parser = createSseParser({
    onFrame: (f) => frames.push(f),
  });

  const payload = formatSseFrame('agent.event', { x: 2 });
  for (const ch of payload) parser.push(ch);
  parser.flush();
  assert.equal(frames.length, 1);
  assert.deepEqual(frames[0].data, { x: 2 });

  frames.length = 0;
  parser.reset();
  const multi =
    ': comment\n' +
    'event: agent.event\r\n' +
    'data: {"y":1}\r\n' +
    '\r\n' +
    'event: agent.result\r\n' +
    'data: {"z":2}\r\n' +
    '\r\n';
  parser.push(multi);
  parser.flush();
  assert.equal(frames.length, 2);
  assert.equal(frames[0].event, 'agent.event');
  assert.deepEqual(frames[1].data, { z: 2 });

  frames.length = 0;
  parser.reset();
  parser.push('event: multi\n');
  parser.push('data: line1\n');
  parser.push('data: line2\n\n');
  parser.flush();
  assert.equal(frames[0].rawData, 'line1\nline2');
});

test('event bus tracks parallel actions and duration_ms', () => {
  let t = 1000;
  const bus = createAgentEventBus({
    now: () => t,
  });
  bus.startTurn(1);

  bus.emit({ type: 'embedding.started', action_id: 'e1' });
  bus.emit({ type: 'retrieval.started', action_id: 'r1' });
  bus.emit({ type: 'tool.started', action_id: 't1' });

  const snap = bus.getSnapshot();
  assert.equal(snap.parallelCount, 3);
  assert.equal(bus.getActiveActions().length, 3);

  t += 42;
  const done = bus.emit({ type: 'embedding.completed', action_id: 'e1' });
  assert.equal(done.event.duration_ms, 42);
  assert.equal(bus.getSnapshot().parallelCount, 2);

  bus.destroy();
});

test('stale-turn guard with store rejects old turn', () => {
  const store = createStore(reduce(initialState, { type: 'AWAKE' }));
  const bus = createAgentEventBus({ store });

  store.dispatch({ type: 'SUBMIT', prompt: 'one' });
  assert.equal(store.getState().turn, 1);
  bus.emit({ type: 'context.prepared', turn_id: 'turn-1' });
  assert.equal(store.getState().embodied.lastEventType, 'context.prepared');

  store.dispatch({ type: 'SUBMIT', prompt: 'two' });
  assert.equal(store.getState().turn, 2);
  bus.emit({ type: 'context.prepared', turn_id: 'turn-2' });
  assert.equal(store.getState().embodied.lastEventType, 'context.prepared');

  const stale = bus.emit({ type: 'retrieval.completed', turn_id: 'turn-1', metadata: { coverage: 'GIVEN' } });
  assert.equal(stale.accepted, false);
  assert.equal(stale.stale, true);
  assert.equal(bus.getSnapshot().droppedStaleCount, 1);
  assert.equal(store.getState().embodied.lastEventType, 'context.prepared');

  const tl = bus.getTimeline();
  const dropped = tl.find((e) => e.stale);
  assert.ok(dropped);
  assert.equal(dropped.event.type, 'retrieval.completed');

  bus.destroy();
});

test('runTool lifecycle success, retry, and fail', async () => {
  const bus = createAgentEventBus({ now: () => Date.now() });
  bus.startTurn(1);

  const ok = await bus.runTool('search', async () => 'result');
  assert.equal(ok, 'result');

  let calls = 0;
  const retried = await bus.runTool(
    'fetch',
    async ({ attempt }) => {
      calls++;
      if (attempt < 2) throw Object.assign(new Error('fail'), { code: 'E_FAIL' });
      return 99;
    },
    { maxRetries: 1, retryDelayMs: 1 },
  );
  assert.equal(retried, 99);
  assert.equal(calls, 2);

  await assert.rejects(
    () =>
      bus.runTool(
        'boom',
        async () => {
          throw Object.assign(new Error('timeout'), { name: 'TimeoutError' });
        },
        { maxRetries: 0 },
      ),
    (err) => err.name === 'TimeoutError',
  );

  const types = bus
    .getTimeline()
    .filter((e) => !e.stale)
    .map((e) => e.event.type)
    .filter((t) => t.startsWith('tool.'));
  assert.ok(types.includes('tool.started'));
  assert.ok(types.includes('tool.retry'));
  assert.ok(types.includes('tool.completed'));
  assert.ok(types.includes('tool.failed'));

  bus.destroy();
});

test('store AGENT_EVENT updates embodied without breaking reducer contract', () => {
  const base = { ...initialState, phase: 'thinking', turn: 1, prompt: 'q' };
  const next = reduce(base, {
    type: 'AGENT_EVENT',
    turn: 1,
    simulated: false,
    activeActionCount: 2,
    parallelCount: 2,
    agentEvent: createAgentEvent({
      type: 'retrieval.completed',
      turn: 1,
      metadata: { coverage: 'GIVEN', hits: 4, provider: 'minimax' },
    }),
  });
  assert.equal(next.embodied.coverage, 'GIVEN');
  assert.equal(next.embodied.hits, 4);
  assert.equal(next.embodied.provider, 'minimax');
  assert.equal(next.embodied.parallelCount, 2);

  const unchanged = reduce(base, {
    type: 'AGENT_EVENT',
    turn: 0,
    agentEvent: createAgentEvent({ type: 'turn.received', turn: 0 }),
  });
  assert.equal(unchanged, base);

  const submitted = reduce(base, { type: 'SUBMIT', prompt: 'next' });
  assert.deepEqual(submitted.embodied, initialEmbodiedState);
});

test('exported symbol inventories', () => {
  assert.equal(AGENT_EVENT_TYPES.length, 26);
  assert.equal(AGENT_EVENT_CATEGORIES.length, 10);
  assert.equal(AGENT_EVENT_STATUSES.length, 8);
  assert.ok(isValidEventType('generation.completed'));
  assert.throws(() => createAgentEvent({ type: 'bad' }), TypeError);
});