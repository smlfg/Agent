import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  planIdle,
  stageFor,
  createRng,
  VALID_ACTIONS,
  STAGE1_MS,
  STAGE2_MS,
  STAGE3_MS,
  CALM_STEP_MS,
  MIN_PLAN_MS,
  STAGE1_INTERVAL_MIN_MS,
  STAGE1_INTERVAL_MAX_MS,
  STAGE2_INTERVAL_MIN_MS,
  STAGE2_INTERVAL_MAX_MS,
  IMPULSE_MIN_INTERVAL_MS,
  IMPULSE_JITTER_MS,
} from '../src/presence/idle.js';

function simulate(seed, fromMs = 0, toMs = 600000) {
  const rng = createRng(seed);
  let t = fromMs;
  const plans = [];
  for (let guard = 0; t <= toMs && guard < 100000; guard += 1) {
    const plan = planIdle(t, rng);
    plans.push({ t, ...plan });
    assert.ok(plan.nextInMs >= MIN_PLAN_MS, 'a plan must always move time forward');
    assert.ok(VALID_ACTIONS.includes(plan.action), `unknown action ${plan.action}`);
    t += plan.nextInMs;
  }
  return plans;
}

test('stages follow idle time', () => {
  assert.equal(stageFor(0), 0);
  assert.equal(stageFor(STAGE1_MS - 1), 0);
  assert.equal(stageFor(STAGE1_MS), 1);
  assert.equal(stageFor(STAGE2_MS - 1), 1);
  assert.equal(stageFor(STAGE2_MS), 2);
  assert.equal(stageFor(STAGE3_MS - 1), 2);
  assert.equal(stageFor(STAGE3_MS), 3);
});

test('first seconds are calm: no glances, gaze stays with the visitor', () => {
  const rng = createRng(7);
  for (let t = 0; t < STAGE1_MS; t += 500) {
    const plan = planIdle(t, rng);
    assert.equal(plan.stage, 0, `stage at ${t} ms`);
    assert.equal(plan.action, 'visitor');
    assert.ok(plan.nextInMs > 0 && plan.nextInMs <= CALM_STEP_MS);
    assert.ok(t + plan.nextInMs <= STAGE1_MS || plan.nextInMs === CALM_STEP_MS);
  }
});

test('a reset drops straight back to the calm first stage', () => {
  const rng = createRng(11);
  assert.equal(planIdle(STAGE3_MS * 2, rng).stage, 3);
  const reset = planIdle(0, rng);
  assert.equal(reset.stage, 0);
  assert.equal(reset.action, 'visitor');
});

test('stage 1 only glances occasionally, stage 2 a little more often', () => {
  for (const seed of [1, 2, 3, 42]) {
    const plans = simulate(seed);
    const one = plans.filter((p) => p.stage === 1);
    const two = plans.filter((p) => p.stage === 2);
    assert.ok(one.length > 0 && two.length > 0, 'both stages are exercised');

    for (const p of one) {
      assert.ok(['glance', 'visitor'].includes(p.action));
      assert.ok(p.nextInMs >= STAGE1_INTERVAL_MIN_MS && p.nextInMs <= STAGE1_INTERVAL_MAX_MS);
    }
    for (const p of two) {
      assert.ok(['linger', 'visitor'].includes(p.action));
      assert.ok(p.nextInMs >= STAGE2_INTERVAL_MIN_MS && p.nextInMs <= STAGE2_INTERVAL_MAX_MS);
    }
  }
  assert.equal(planIdle(STAGE3_MS, createRng(1)).action, 'ask');
});

test('impulses stay rare: never closer than 20 s, never before 60 s', () => {
  for (const seed of [1, 2, 3, 99, 12345]) {
    const asks = simulate(seed).filter((p) => p.action === 'ask');
    assert.ok(asks.length > 0, 'stage 3 does eventually ask');
    assert.ok(asks[0].t >= STAGE3_MS, 'no impulse before the third stage');
    for (let i = 1; i < asks.length; i += 1) {
      const gap = asks[i].t - asks[i - 1].t;
      assert.ok(
        gap >= IMPULSE_MIN_INTERVAL_MS,
        `impulse gap ${gap} ms must stay above ${IMPULSE_MIN_INTERVAL_MS} ms`,
      );
      assert.ok(
        gap <= IMPULSE_MIN_INTERVAL_MS + IMPULSE_JITTER_MS,
        `impulse gap ${gap} ms must stay within the intended cadence`,
      );
    }
  }
});

test('ten minutes of waiting yield only a handful of impulses', () => {
  const asks = simulate(5).filter((p) => p.action === 'ask');
  const maxExpected = Math.ceil((600000 - STAGE3_MS) / IMPULSE_MIN_INTERVAL_MS) + 1;
  assert.ok(asks.length <= maxExpected, `${asks.length} impulses is too many`);
});

test('planning is deterministic for a seeded rng', () => {
  const elapsed = Array.from({ length: 120 }, (_, i) => i * 6000);
  const a = elapsed.map((t) => planIdle(t, createRng(1234)));
  const b = elapsed.map((t) => planIdle(t, createRng(1234)));
  assert.deepEqual(a, b);

  const c = elapsed.map((t) => planIdle(t, createRng(987654)));
  assert.notDeepEqual(a, c, 'different seeds should not replay the same behaviour');
});

test('seeded rng stays in [0, 1) and repeats exactly', () => {
  const a = createRng(77);
  const b = createRng(77);
  for (let i = 0; i < 1000; i += 1) {
    const value = a();
    assert.equal(value, b());
    assert.ok(value >= 0 && value < 1);
  }
});
