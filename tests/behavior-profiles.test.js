import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BEHAVIOR_PROFILE_IDS,
  BEHAVIOR_PROFILES,
  EXPRESSION_CHANNEL_GROUPS,
  INTENT_TO_PROFILE_ID,
  MILESTONE_HOLD_MS,
  MILESTONE_HOLD_INTENTS,
  activeChannelGroupsAcrossMatrix,
  applyMilestoneHold,
  atmosphereModulationFromChannels,
  embodiedOverlayForIntent,
  resolveBehaviorForIntent,
} from '../src/presence/behavior-profiles.js';
import { EMBODIED_INTENT_PROFILES, EMBODIED_INTENTS } from '../src/presence/eye-motion-profiles.js';
import { applyMilestoneHold as holdExport } from '../src/presence/behavior-profiles.js';
import { mountEmbodiment, resolveEmbodiedIntent } from '../src/presence/embodiment.js';
import { createAgentEventBus } from '../src/state/agent-events.js';
import { createStore, reduce } from '../src/state/store.js';
import { createSurfaceStore, DEFAULT_SURFACE_STATE } from '../src/surface/surface-state.js';
import { mountSurfaceProjector } from '../src/surface/surface-projector.js';

test('P01–P09 profiles exist with intent mappings', () => {
  assert.equal(BEHAVIOR_PROFILE_IDS.length, 9);
  for (const id of BEHAVIOR_PROFILE_IDS) {
    assert.ok(BEHAVIOR_PROFILES[id], id);
    assert.equal(BEHAVIOR_PROFILES[id].id, id);
    assert.ok(BEHAVIOR_PROFILES[id].intents.length >= 1, `${id} intents`);
    for (const ch of EXPRESSION_CHANNEL_GROUPS) {
      assert.ok(BEHAVIOR_PROFILES[id].channels[ch], `${id}.${ch}`);
    }
  }
  for (const intent of EMBODIED_INTENTS) {
    assert.ok(INTENT_TO_PROFILE_ID[intent], `missing profile for ${intent}`);
    assert.ok(EMBODIED_INTENT_PROFILES[intent]?.baseEyeState, intent);
  }
});

test('searching reduces ambient micro-motion (ambientMul < 1)', () => {
  const searching = embodiedOverlayForIntent('searching');
  assert.ok(Number(searching.ambientMul) < 1, `ambientMul=${searching.ambientMul}`);
  assert.equal(searching.suppressBlinks, true);
  assert.ok(searching.offsetX < -0.4, 'strong gaze aversion');
  assert.equal(BEHAVIOR_PROFILES.P02.channels.ambient.mul, searching.ambientMul);
});

test('all 15 expression channel groups are exercised across the matrix', () => {
  const used = activeChannelGroupsAcrossMatrix();
  assert.equal(used.size, EXPRESSION_CHANNEL_GROUPS.length);
  for (const group of EXPRESSION_CHANNEL_GROUPS) {
    assert.ok(used.has(group), `channel group unused: ${group}`);
  }
});

test('milestone hold blocks concentrating until holdMs elapses', () => {
  const t0 = 10_000;
  const held = applyMilestoneHold('concentrating', {
    milestoneIntent: 'grounded',
    holdUntil: t0 + MILESTONE_HOLD_MS,
  }, t0 + 50);
  assert.equal(held, 'grounded');
  const released = applyMilestoneHold('concentrating', {
    milestoneIntent: 'grounded',
    holdUntil: t0 + MILESTONE_HOLD_MS,
  }, t0 + MILESTONE_HOLD_MS);
  assert.equal(released, 'concentrating');
  assert.equal(holdExport, applyMilestoneHold);
  for (const intent of MILESTONE_HOLD_INTENTS) {
    assert.ok(MILESTONE_HOLD_INTENTS.has(intent));
  }
});

test('embodiment keeps grounded visible before generation.started concentrating', () => {
  const store = createStore();
  const eventBus = createAgentEventBus({ store, now: () => 0 });
  let fakeNow = 1000;
  const embodiment = mountEmbodiment({
    eventBus,
    store,
    now: () => fakeNow,
    minDwellMs: 0,
  });

  const groundedEv = {
    type: 'retrieval.completed',
    metadata: { coverage: 'GIVEN', hits: 2 },
  };
  embodiment.applyIntent('grounded', {}, { force: true });
  fakeNow += 50;
  const genEv = { type: 'generation.started' };
  const snap = eventBus.getSnapshot?.() ?? { parallelCount: 0, activeActions: [] };
  const resolved = resolveEmbodiedIntent({ event: genEv, snapshot: snap, phase: 'thinking' });
  const withHold = applyMilestoneHold(resolved, {
    milestoneIntent: 'grounded',
    holdUntil: fakeNow + MILESTONE_HOLD_MS - 50,
  }, fakeNow);
  assert.equal(withHold, 'grounded');

  fakeNow += MILESTONE_HOLD_MS + 1;
  const after = applyMilestoneHold(resolved, {
    milestoneIntent: 'grounded',
    holdUntil: 1000 + MILESTONE_HOLD_MS,
  }, fakeNow);
  assert.equal(after, 'concentrating');
  embodiment.destroy();
});

test('embodiment getState exposes profileId, channels, reactionLatencyMs', () => {
  const embodiment = mountEmbodiment({ minDwellMs: 0 });
  embodiment.applyIntent('searching', {}, { force: true });
  const st = embodiment.getState();
  assert.equal(st.profileId, 'P02');
  assert.ok(st.channels?.ambient);
  assert.equal(st.reactionLatencyMs, BEHAVIOR_PROFILES.P02.reactionLatencyMs);
  embodiment.destroy();
});

test('surface embodiment modulation clears without mutating surface store (AT-06)', () => {
  const surfaceStore = createSurfaceStore();
  const baselineScale = DEFAULT_SURFACE_STATE.embodiment.eyeScale;
  surfaceStore.applyPatch({ embodiment: { eyeScale: 1.22 } }, { summary: 'test' });
  assert.equal(surfaceStore.getState().embodiment.eyeScale, 1.22);

  const root = { style: { properties: new Map(), setProperty(k, v) { this.properties.set(k, v); }, removeProperty(k) { this.properties.delete(k); } }, dataset: {} };
  const projector = mountSurfaceProjector({ surfaceStore, root, reducedMotion: true });

  const mod = atmosphereModulationFromChannels(BEHAVIOR_PROFILES.P03.channels);
  assert.ok(Object.keys(mod).length >= 1);
  const modKeys = Object.keys(mod);
  projector.setEmbodimentModulation(mod);
  for (const key of modKeys) assert.ok(root.style.properties.has(key), key);

  projector.clearEmbodimentModulation();
  for (const key of modKeys) assert.equal(root.style.properties.has(key), false, key);
  assert.equal(surfaceStore.getState().embodiment.eyeScale, 1.22);
  assert.notEqual(baselineScale, undefined);

  projector.destroy();
});

test('resolveBehaviorForIntent returns profile metadata for each embodied intent', () => {
  for (const intent of EMBODIED_INTENTS) {
    const r = resolveBehaviorForIntent(intent);
    assert.ok(r, intent);
    assert.ok(BEHAVIOR_PROFILE_IDS.includes(r.profileId));
  }
});