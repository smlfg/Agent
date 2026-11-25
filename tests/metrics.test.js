import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createCollector } from '../src/metrics/collect.js';
import { AFFECT_METRIC_IDS, computeMetrics } from '../src/metrics/compute.js';
import { createParameterEngine } from '../src/metrics/engine.js';
import {
  PARAMETER_IDS,
  applySurface,
  currentBehaviour,
  mountMetrics,
} from '../src/metrics/surface.js';
import { createStore } from '../src/state/store.js';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, '../src/metrics/metrics-catalog.json'), 'utf8'));
const pathways = JSON.parse(readFileSync(join(here, '../src/dev/conversation-pathways.json'), 'utf8'));

const GOLD_TOLERANCE = 0.25;
const GOLD_SHARE = 0.6;
const AGENT_ANSWER_MS = 1200;
const IDLE_BEFORE_TYPING_MS = 500;

function buildTurnInputs(turn, index, typingStart, responseEndAt) {
  const typing = turn.typing ?? {};
  const duration = Math.max(1, Number(typing.duration_ms) || 1);
  const hold = Math.max(0, Number(typing.pause_before_send_ms) || 0);
  const backspaces = Math.max(0, Number(typing.backspaces) || 0);
  const prompt = String(turn.user ?? '');

  const count = Math.max(1, Math.min(prompt.length || 1, Math.round(duration / 160)));
  const keys = [];
  for (let i = 0; i < count; i++) {
    const at = typingStart + (duration * i) / Math.max(1, count - 1 || 1);
    keys.push([at, prompt[i % Math.max(1, prompt.length)] ?? 'a']);
  }

  const submitAt = typingStart + duration + hold;
  return {
    turn: index + 1,
    prompt,
    answer: '',
    phaseBeforeSubmit: typing.interrupted_agent ? 'speaking' : 'idle',
    mountedAt: 0,
    submitAt,
    responseEndAt,
    firstKeyAt: typingStart,
    lastKeyAt: typingStart + duration,
    typing: { keys, keydowns: keys.length + backspaces, backspaces },
    pointer: { samples: 0, nearPresence: 0 },
    hiddenMs: 0,
    blurCount: 0,
    clicks: 0,
    interruption: Boolean(typing.interrupted_agent),
  };
}

function runPathway(pathway) {
  const engine = createParameterEngine({ catalog, alpha: 0.35 });
  const history = [];
  const results = [];
  let clock = 0;
  let responseEndAt = 0;

  pathway.turns.forEach((turn, index) => {
    const inputs = buildTurnInputs(turn, index, clock + IDLE_BEFORE_TYPING_MS, responseEndAt);
    const metrics = computeMetrics(turn.user, inputs, history);
    const params = engine.update(metrics);
    results.push({ turn, params, metrics });
    const nextResponseEnd = inputs.submitAt + AGENT_ANSWER_MS;
    history.push({ ...inputs, answer: turn.agent, responseEndAt: nextResponseEnd });
    clock = nextResponseEnd;
    responseEndAt = nextResponseEnd;
  });

  return results;
}

test('catalog exposes 12 parameters and 109 metrics', () => {
  assert.equal(catalog.parameters.length, 12);
  assert.equal(catalog.metrics.length, 109);
  assert.deepEqual(catalog.parameters, [...PARAMETER_IDS]);
});

test('computeMetrics covers the library-free metrics plus the local affect set', () => {
  const libraryFree = catalog.metrics.filter((m) => /none/i.test(m.library));
  const libraryBound = catalog.metrics.filter((m) => !/none/i.test(m.library));
  const affect = catalog.metrics.filter((m) => AFFECT_METRIC_IDS.includes(m.id));
  const computed = [...libraryFree, ...affect];
  const inputs = buildTurnInputs(pathways.pathways[0].turns[0], 0, 500, 0);
  const metrics = computeMetrics(pathways.pathways[0].turns[0].user, inputs, []);

  assert.equal(libraryFree.length, 50);
  assert.equal(affect.length, AFFECT_METRIC_IDS.length);
  assert.equal(libraryBound.length, catalog.metrics.length - libraryFree.length);
  assert.deepEqual(Object.keys(metrics).sort(), computed.map((m) => m.id).sort());
  for (const [id, value] of Object.entries(metrics)) {
    assert.ok(Number.isFinite(value), `${id} is finite`);
    assert.ok(value >= 0 && value <= 1, `${id} in 0..1`);
  }
  console.log(`[metrics] computed ${computed.length} (${AFFECT_METRIC_IDS.length} local affect), skipped ${catalog.metrics.length - computed.length}`);
});

test('collector yields one TurnInputs snapshot per turn', () => {
  let clock = 0;
  const collector = createCollector({ input: null, now: () => clock });

  clock = 1000;
  collector.recordKeyDown('h');
  clock = 1150;
  collector.recordKeyDown('i');
  clock = 1200;
  collector.recordKeyDown('Backspace');
  clock = 1400;
  collector.markResponseEnd();
  clock = 1600;

  const inputs = collector.endTurn({ turn: 1, prompt: 'hi', phaseBeforeSubmit: 'speaking', at: clock });
  assert.equal(inputs.turn, 1);
  assert.equal(inputs.prompt, 'hi');
  assert.equal(inputs.typing.keys.length, 2);
  assert.equal(inputs.typing.backspaces, 1);
  assert.equal(inputs.typing.keydowns, 3);
  assert.equal(inputs.firstKeyAt, 1000);
  assert.equal(inputs.lastKeyAt, 1200);
  assert.equal(inputs.interruption, true);
  assert.equal(inputs.responseEndAt, 1400);

  const next = collector.endTurn({ turn: 2, prompt: 'again', phaseBeforeSubmit: 'idle', at: 5000 });
  assert.equal(next.typing.keys.length, 0);
  assert.equal(next.interruption, false);
});

test('golden: engine parameters track the 75 fixture turns', () => {
  let hits = 0;
  let total = 0;
  const misses = [];

  for (const pathway of pathways.pathways) {
    for (const { turn, params } of runPathway(pathway)) {
      for (const id of PARAMETER_IDS) {
        total += 1;
        const error = Math.abs(params[id] - turn.params[id]);
        if (error <= GOLD_TOLERANCE) hits += 1;
        else misses.push({ pathway: pathway.id, user: turn.user, id, got: params[id], want: turn.params[id] });
      }
    }
  }

  const share = hits / total;
  console.log(`[metrics] golden quote: ${hits}/${total} = ${(share * 100).toFixed(1)}% within ±${GOLD_TOLERANCE}`);
  if (misses.length) console.log(`[metrics] first misses: ${JSON.stringify(misses.slice(0, 5))}`);
  assert.equal(total, 900);
  assert.ok(share >= GOLD_SHARE, `golden share ${(share * 100).toFixed(1)}% >= ${GOLD_SHARE * 100}%`);
});

test('engine stays in range and follows weight signs', () => {
  const engine = createParameterEngine({ catalog });
  const before = engine.get();
  for (const value of Object.values(before)) assert.ok(value >= 0 && value <= 1);

  const warmer = engine.update({ joy_lexicon: 1 });
  assert.ok(warmer.warmth > before.warmth, 'joy raises warmth');

  const hedged = createParameterEngine({ catalog }).update({ hedge_ratio: 1 });
  assert.ok(hedged.certainty < 0.5, 'hedging lowers certainty');

  const engine2 = createParameterEngine({ catalog, alpha: 0.6 });
  for (let i = 0; i < 40; i++) {
    const vector = Object.fromEntries(
      catalog.metrics.map((m, j) => [m.id, ((i * 37 + j * 11) % 100) / 100]),
    );
    const params = engine2.update(vector);
    for (const value of Object.values(params)) assert.ok(value >= 0 && value <= 1);
  }
});

test('EMA moves monotonically per parameter for a fixed metric vector', () => {
  const engine = createParameterEngine({ catalog, alpha: 0.4 });
  const vector = {
    joy_lexicon: 1,
    hedge_ratio: 1,
    question_rate: 1,
    backspace_ratio: 1,
    prompt_length_chars: 0.8,
  };
  let previous = engine.get();
  const direction = {};

  for (let step = 0; step < 12; step++) {
    const next = engine.update(vector);
    for (const id of PARAMETER_IDS) {
      const delta = next[id] - previous[id];
      const sign = Math.sign(Number(delta.toFixed(9)));
      if (step === 0) direction[id] = sign;
      else if (direction[id] !== 0 && sign !== 0) {
        assert.equal(sign, direction[id], `${id} keeps its direction at step ${step}`);
      }
      assert.ok(next[id] >= 0 && next[id] <= 1);
    }
    previous = next;
  }
});

test('no cap: an extreme path reaches beyond 0.85 and below 0.15', () => {
  const libraryFree = catalog.metrics.filter((m) => /none/i.test(m.library));
  const high = {};
  const low = {};
  for (const metric of libraryFree) {
    const weight = metric.weights.playfulness ?? 0;
    high[metric.id] = weight < 0 ? 0 : 1;
    low[metric.id] = weight > 0 ? 0 : 1;
  }

  const upEngine = createParameterEngine({ catalog, alpha: 0.5 });
  let up = upEngine.get();
  for (let i = 0; i < 10; i++) up = upEngine.update(high);

  const downEngine = createParameterEngine({ catalog, alpha: 0.5 });
  let down = downEngine.get();
  for (let i = 0; i < 10; i++) down = downEngine.update(low);

  const peak = Math.max(...Object.values(up));
  const floor = Math.min(...Object.values(down));
  console.log(`[metrics] extreme path: peak ${peak.toFixed(3)}, floor ${floor.toFixed(3)}`);
  assert.ok(peak > 0.85 || floor < 0.15);
});

function createRoot() {
  const listeners = new Map();
  const props = {};
  return {
    style: { setProperty(name, value) { props[name] = String(value); } },
    dataset: {},
    props,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      listeners.get(type)?.delete(fn);
    },
    emit(type, detail) {
      for (const fn of listeners.get(type) ?? []) fn({ type, detail });
    },
  };
}

function appliedCount(root) {
  return Number(root.dataset.surfaceLevel ?? 0);
}

test('mountMetrics applies exactly once per turn, at RESPONSE_END', () => {
  const store = createStore();
  const root = createRoot();
  const mounted = mountMetrics({ store, input: null, root, catalog });

  store.dispatch({ type: 'AWAKE' });
  store.dispatch({ type: 'SUBMIT', prompt: 'hello there' });
  const turn1 = store.getState().turn;
  store.dispatch({ type: 'RESPONSE_START', turn: turn1, dev: true });
  store.dispatch({ type: 'RESPONSE_PROGRESS', turn: turn1, text: 'Hello' });
  assert.equal(appliedCount(root), 0, 'nothing applied while the answer types');

  store.dispatch({ type: 'RESPONSE_END', turn: turn1, text: 'Hello there' });
  assert.equal(appliedCount(root), 1, 'one apply at turn end');

  store.dispatch({ type: 'INPUT', value: 'again' });
  store.dispatch({ type: 'SUBMIT', prompt: 'again' });
  const turn2 = store.getState().turn;
  store.dispatch({ type: 'RESPONSE_START', turn: turn2, dev: true });
  store.dispatch({ type: 'RESPONSE_PROGRESS', turn: turn2, text: 'A' });
  assert.equal(appliedCount(root), 1);
  store.dispatch({ type: 'RESPONSE_END', turn: turn2, text: 'Again' });
  assert.equal(appliedCount(root), 2, 'still exactly one per turn');

  for (const id of PARAMETER_IDS) assert.ok(root.props[`--p-${id}`] !== undefined);
  assert.ok(root.props['--type-cadence-ms']);
  assert.ok(root.props['--leave-ms']);
  assert.ok(root.props['--onset-delay-ms']);
  assert.ok(root.props['--pair-measure']);
  assert.ok(root.props['--pair-gap']);
  assert.ok(root.props['--pair-line-height']);
  assert.ok(root.props['--accent-warmth']);

  mounted.destroy();
});

test('agentfaehig:params overrides only at the next turn end', () => {
  const store = createStore();
  const root = createRoot();
  const mounted = mountMetrics({ store, input: null, root, catalog });

  store.dispatch({ type: 'SUBMIT', prompt: 'first turn' });
  const turn1 = store.getState().turn;
  store.dispatch({ type: 'RESPONSE_START', turn: turn1 });
  store.dispatch({ type: 'RESPONSE_END', turn: turn1, text: 'first answer' });
  const before = root.props['--p-tempo'];
  assert.equal(appliedCount(root), 1);

  const detail = Object.fromEntries(PARAMETER_IDS.map((id) => [id, 0.9]));
  root.emit('agentfaehig:params', detail);
  assert.equal(root.props['--p-tempo'], before, 'event does not apply immediately');

  store.dispatch({ type: 'SUBMIT', prompt: 'second turn' });
  const turn2 = store.getState().turn;
  store.dispatch({ type: 'RESPONSE_START', turn: turn2 });
  store.dispatch({ type: 'RESPONSE_PROGRESS', turn: turn2, text: 'partial' });
  assert.equal(appliedCount(root), 1, 'still waiting for the turn end');

  store.dispatch({ type: 'RESPONSE_END', turn: turn2, text: 'second answer' });
  assert.equal(appliedCount(root), 2);
  assert.equal(root.props['--p-tempo'], '0.9', 'override applied at turn end');
  assert.equal(currentBehaviour().charDelayMs, 24, 'behaviour follows the override');

  mounted.destroy();
});

test('applySurface writes every parameter and returns the behaviour contract', () => {
  const root = createRoot();
  const params = Object.fromEntries(PARAMETER_IDS.map((id, i) => [id, i / 11]));
  const behaviour = applySurface(params, root);

  for (const id of PARAMETER_IDS) assert.ok(root.props[`--p-${id}`] !== undefined);
  assert.equal(typeof behaviour.charDelayMs, 'number');
  assert.equal(typeof behaviour.leaveMs, 'number');
  assert.equal(typeof behaviour.onsetDelayMs, 'number');
  assert.equal(typeof behaviour.blinkIntervalMs, 'number');
  assert.equal(typeof behaviour.saccadeIntervalMs, 'number');
  assert.equal(typeof behaviour.pupilScale, 'number');
  assert.ok(behaviour.type && behaviour.presence && behaviour.pair && behaviour.prompt);
});
