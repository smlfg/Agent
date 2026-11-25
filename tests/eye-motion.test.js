import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EYE_STATES,
  STATE_ALIASES,
  EYE_MOTION_LIMITS,
  DEFAULT_MOTION_CONFIG,
  EYE_STATE_PROFILES,
  normalizeEyeState,
} from '../src/presence/eye-motion-profiles.js';
import {
  computeResponsiveBounds,
  createEyeMotionEngine,
} from '../src/presence/eye-motion-engine.js';

const DESKTOP = Object.freeze({
  viewportWidth: 1280,
  viewportHeight: 800,
  containerWidth: 1248,
  eyeWidth: 100,
  eyeHeight: 115,
  baseGapPx: 30,
});

const MOBILE = Object.freeze({
  viewportWidth: 375,
  viewportHeight: 667,
  containerWidth: 343,
  eyeWidth: 82.5,
  eyeHeight: 93.75,
  baseGapPx: 22.5,
});

const NARROW_MOBILE = Object.freeze({
  viewportWidth: 320,
  viewportHeight: 568,
  containerWidth: 288,
  eyeWidth: 70.4,
  eyeHeight: 80,
  baseGapPx: 19.2,
});

function runSteps(engine, count, dtMs = 16) {
  let frame = engine.getFrame();
  for (let i = 0; i < count; i += 1) {
    frame = engine.step(dtMs);
  }
  return frame;
}

test('exposes all 8 required states and resolves aliases cleanly', () => {
  assert.deepEqual([...EYE_STATES], [
    'dormant',
    'awakening',
    'present',
    'listening',
    'thinking',
    'responding',
    'adapting',
    'idle',
  ]);
  for (const state of EYE_STATES) {
    assert.ok(EYE_STATE_PROFILES[state], `missing profile for ${state}`);
    assert.equal(normalizeEyeState(state), state);
  }
  assert.equal(STATE_ALIASES.processing, 'thinking');
  assert.equal(STATE_ALIASES.speaking, 'responding');
  assert.equal(normalizeEyeState('processing'), 'thinking');
  assert.equal(normalizeEyeState('speaking'), 'responding');
  assert.equal(normalizeEyeState('unknown-state'), 'present');
});

test('all 8 states produce distinct resting/settled motion characteristics', () => {
  const signatures = new Set();
  for (const state of EYE_STATES) {
    const engine = createEyeMotionEngine({ state, viewport: DESKTOP });
    const frame = runSteps(engine, 90, 16);
    const sig = [
      frame.pair.x.toFixed(1),
      frame.pair.y.toFixed(1),
      frame.effectiveGapPx.toFixed(1),
      frame.pupilDilation.toFixed(2),
      frame.left.lidTopPct.toFixed(1),
      frame.left.lidBottomPct.toFixed(1),
      frame.left.pupilX.toFixed(1),
      frame.left.pupilY.toFixed(1),
    ].join('|');
    signatures.add(sig);
  }
  assert.equal(signatures.size, EYE_STATES.length);
});

test('supports left, right, up and down positional movement relative to shared center', () => {
  const engine = createEyeMotionEngine({ state: 'present', viewport: DESKTOP });
  const centerFrame = runSteps(engine, 120, 16);

  engine.setParams({ offsetX: -1, offsetY: 0 });
  const leftFrame = runSteps(engine, 120, 16);
  assert.ok(leftFrame.pair.x < centerFrame.pair.x - 30, 'offsetX=-1 moves eyes left');

  engine.setParams({ offsetX: 1, offsetY: 0 });
  const rightFrame = runSteps(engine, 120, 16);
  assert.ok(rightFrame.pair.x > centerFrame.pair.x + 30, 'offsetX=+1 moves eyes right');

  engine.setParams({ offsetX: 0, offsetY: -1 });
  const upFrame = runSteps(engine, 120, 16);
  assert.ok(upFrame.pair.y < centerFrame.pair.y - 12, 'offsetY=-1 moves eyes up');

  engine.setParams({ offsetX: 0, offsetY: 1 });
  const downFrame = runSteps(engine, 120, 16);
  assert.ok(downFrame.pair.y > centerFrame.pair.y + 12, 'offsetY=+1 moves eyes down');

  // Shifting shared centerX/centerY translates around the new anchor.
  engine.setParams({ centerX: 0.4, centerY: -0.3, offsetX: 0, offsetY: 0 });
  const shiftedCenter = runSteps(engine, 120, 16);
  assert.ok(shiftedCenter.pair.x > centerFrame.pair.x + 15);
  assert.ok(shiftedCenter.pair.y < centerFrame.pair.y - 4);
});

test('spread dynamically moves eyes closer together and wider apart without overlapping', () => {
  const engine = createEyeMotionEngine({ state: 'present', viewport: DESKTOP });
  const neutral = runSteps(engine, 120, 16);

  engine.setParams({ spread: 0.65 });
  const close = runSteps(engine, 120, 16);
  assert.ok(close.effectiveGapPx < neutral.effectiveGapPx - 8, 'spread<1 brings eyes closer');
  assert.ok(close.left.x > neutral.left.x);
  assert.ok(close.right.x < neutral.right.x);
  assert.ok(close.effectiveGapPx >= EYE_MOTION_LIMITS.minGapPx, 'never overlaps');

  engine.setParams({ spread: 1.55 });
  const wide = runSteps(engine, 120, 16);
  assert.ok(wide.effectiveGapPx > neutral.effectiveGapPx + 12, 'spread>1 widens eyes');
  assert.ok(wide.left.x < neutral.left.x);
  assert.ok(wide.right.x > neutral.right.x);

  // Even an extreme spread=0 cannot cause negative or overlapping gap.
  engine.setParams({ spread: 0 });
  const clampedMin = runSteps(engine, 120, 16);
  assert.ok(clampedMin.effectiveGapPx >= EYE_MOTION_LIMITS.minGapPx);
});

test('asymmetry remains organic and strictly bounded even under extreme inputs', () => {
  const engine = createEyeMotionEngine({
    state: 'adapting',
    viewport: DESKTOP,
    params: { asymmetry: 99, asymmetryBias: 10 },
  });
  const frame = runSteps(engine, 100, 16);

  const scaleDiff = Math.abs(frame.left.scaleY - frame.right.scaleY);
  const yDiff = Math.abs(frame.left.y - frame.right.y);

  assert.ok(scaleDiff > 0.005, 'eyes exhibit subtle visible scale asymmetry');
  assert.ok(scaleDiff <= EYE_MOTION_LIMITS.maxAsymmetryScaleDelta * 2 + 0.002);
  assert.ok(yDiff > 0.1, 'eyes exhibit subtle vertical asymmetry');
  assert.ok(yDiff <= 8.1, 'vertical asymmetry stays bounded and non-deforming');
  assert.ok(Math.abs(frame.pair.tiltDeg) <= EYE_MOTION_LIMITS.maxTiltDeg);
});

test('transitions are smooth with no teleports and safe dt clamping', () => {
  const engine = createEyeMotionEngine({ state: 'present', viewport: DESKTOP });
  const start = runSteps(engine, 60, 16);

  engine.setParams({ offsetX: 1, spread: 1.5 });
  const step1 = engine.step(16);
  const step2 = engine.step(16);
  const settled = runSteps(engine, 120, 16);

  const totalJump = Math.abs(settled.pair.x - start.pair.x);
  const firstDelta = Math.abs(step1.pair.x - start.pair.x);
  const secondDelta = Math.abs(step2.pair.x - step1.pair.x);

  assert.ok(totalJump > 40);
  assert.ok(firstDelta < totalJump * 0.25, 'no single-frame teleport on target change');
  assert.ok(secondDelta > 0, 'smoothly accelerates into motion');

  // Huge tab-resume dt spike is clamped safely so it cannot explode or teleport.
  const preSpike = engine.getFrame();
  const postSpike = engine.step(5000);
  assert.ok(Number.isFinite(postSpike.pair.x) && Number.isFinite(postSpike.pair.y));
  assert.ok(Math.abs(postSpike.pair.x - preSpike.pair.x) < 35);
});

test('idle behavior stays subtly alive with drift and periodic micro-shifts', () => {
  const engine = createEyeMotionEngine({ state: 'idle', viewport: DESKTOP, seed: 42 });
  const xs = [];
  const ys = [];
  const gaps = [];

  for (let i = 0; i < 450; i += 1) {
    const f = engine.step(20); // 9 seconds total
    if (i % 15 === 0) {
      xs.push(f.pair.x);
      ys.push(f.pair.y);
      gaps.push(f.effectiveGapPx);
    }
  }

  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  const spanGap = Math.max(...gaps) - Math.min(...gaps);

  assert.ok(spanX > 4, `expected alive idle horizontal drift, got ${spanX}`);
  assert.ok(spanY > 2, `expected alive idle vertical drift, got ${spanY}`);
  assert.ok(spanGap > 0.5, `expected subtle idle spread breathing, got ${spanGap}`);
});

test('focus mode engages cleanly on interaction and pointer tracking stays soft', () => {
  const engine = createEyeMotionEngine({ state: 'idle', viewport: DESKTOP });
  runSteps(engine, 40, 16);

  // Focus on composer (below center)
  engine.setFocusTarget({ x: 640, y: 720, anchor: { x: 640, y: 140 }, strength: 1, source: 'caret' });
  const focused = runSteps(engine, 90, 16);
  assert.equal(focused.focusActive, true);
  assert.ok(focused.pair.y > 4, 'eyes lean softly toward focused area');
  assert.ok(focused.left.pupilY > 2, 'pupils attend focused target');

  // Release returns cleanly
  engine.clearFocusTarget('caret');
  const released = runSteps(engine, 90, 16);
  assert.equal(released.focusActive, false);

  // Pointer near far edge uses soft compressed response (never raw full-range snap)
  const pointerEngine = createEyeMotionEngine({ state: 'present', viewport: DESKTOP });
  pointerEngine.setPointer(1280, 800, { x: 640, y: 150 });
  const pointerSample = runSteps(pointerEngine, 90, 16);
  const bounds = pointerEngine.getSnapshot().bounds;
  assert.ok(pointerSample.pair.x > 4 && pointerSample.pair.x < bounds.rangeX * 0.45);
  assert.ok(pointerSample.left.pupilX > 1.5);
});

test('responsive bounds prevent overflow across desktop and narrow mobile even at extreme inputs', () => {
  for (const vp of [DESKTOP, MOBILE, NARROW_MOBILE]) {
    const bounds = computeResponsiveBounds(vp, DEFAULT_MOTION_CONFIG);
    assert.ok(bounds.rangeX > 0 && bounds.rangeX <= bounds.availableHalfWidth + 0.01);

    const engine = createEyeMotionEngine({
      state: 'adapting',
      viewport: vp,
      params: { centerX: 1, offsetX: 1, spread: 1.65, scale: 1.14 },
    });
    const frame = runSteps(engine, 120, 16);
    const totalHalfSpan =
      Math.abs(frame.pair.x)
      + (vp.baseGapPx + (frame.right.x - frame.left.x)) / 2
      + vp.eyeWidth * frame.pair.scale;
    const maxAllowedHalf = vp.containerWidth / 2 - EYE_MOTION_LIMITS.viewportMarginPx + 0.5;
    assert.ok(
      totalHalfSpan <= maxAllowedHalf,
      `overflow at ${vp.viewportWidth}px: ${totalHalfSpan.toFixed(1)} > ${maxAllowedHalf.toFixed(1)}`,
    );
  }
});

test('reducedMotion drastically shrinks excursions and eliminates idle drift animation', () => {
  const full = createEyeMotionEngine({ state: 'thinking', viewport: DESKTOP, reducedMotion: false });
  const reduced = createEyeMotionEngine({ state: 'thinking', viewport: DESKTOP, reducedMotion: true });

  const fullSettled = runSteps(full, 120, 16);
  const red1 = reduced.step(16);
  const red2 = runSteps(reduced, 180, 16);

  // Eyes stay open/present (valid scale and non-zero gap)
  assert.ok(red1.effectiveGapPx >= EYE_MOTION_LIMITS.minGapPx);
  assert.ok(red1.pair.scale >= 0.88 && red1.pair.scale <= 1.14);

  // Motion excursion is strongly reduced compared to full motion
  assert.ok(Math.abs(red1.pair.x) < Math.abs(fullSettled.pair.x) * 0.35);
  assert.ok(Math.abs(red1.pair.y) < Math.abs(fullSettled.pair.y) * 0.35);

  // No continuous drift in reduced motion
  assert.equal(red1.pair.x, red2.pair.x);
  assert.equal(red1.pair.y, red2.pair.y);
  assert.equal(red1.effectiveGapPx, red2.effectiveGapPx);
});

test('pause freezes frame output without losing state and engine is deterministic', () => {
  const a = createEyeMotionEngine({ state: 'idle', viewport: DESKTOP, seed: 999 });
  const b = createEyeMotionEngine({ state: 'idle', viewport: DESKTOP, seed: 999 });

  const fa = runSteps(a, 150, 16);
  const fb = runSteps(b, 150, 16);
  assert.deepEqual(fa, fb);

  a.setPaused(true);
  const frozen = a.step(16);
  assert.deepEqual(frozen.pair, fa.pair);
  assert.deepEqual(frozen.left, fa.left);
});

test('3D volumetric orientation, perspective Z, and scene parallax stay bounded and calm under reducedMotion', () => {
  const full = createEyeMotionEngine({ state: 'present', viewport: DESKTOP });
  full.setParams({ offsetX: 0.9, offsetY: -0.6, scale: 1.35 });
  const nearFrame = runSteps(full, 120, 16);

  assert.ok(nearFrame.pair.zPx > 15, `expected positive Z on approach, got ${nearFrame.pair.zPx}`);
  assert.ok(Math.abs(nearFrame.pair.rotYDeg) > 1 && Math.abs(nearFrame.pair.rotYDeg) <= 9);
  assert.ok(Math.abs(nearFrame.pair.rotXDeg) > 0.5 && Math.abs(nearFrame.pair.rotXDeg) <= 6.5);
  assert.ok(Math.abs(nearFrame.scene.x) > 0.1 && Math.abs(nearFrame.scene.x) <= 1);
  assert.ok(nearFrame.scene.depthZ > 0.4);

  full.setParams({ offsetX: 0, offsetY: 0, scale: 0.7 });
  const farFrame = runSteps(full, 120, 16);
  assert.ok(farFrame.pair.zPx < -15, `expected negative Z on retreat, got ${farFrame.pair.zPx}`);
  assert.ok(farFrame.scene.depthZ < -0.4);

  const reduced = createEyeMotionEngine({ state: 'present', viewport: DESKTOP, reducedMotion: true });
  reduced.setParams({ offsetX: 0.9, scale: 1.35 });
  const redFrame = runSteps(reduced, 30, 16);
  assert.equal(redFrame.pair.rotXDeg, 0);
  assert.equal(redFrame.pair.rotYDeg, 0);
  assert.equal(redFrame.left.rotXDeg, 0);
  assert.equal(redFrame.left.rotYDeg, 0);
  assert.equal(redFrame.scene.x, 0);
  assert.equal(redFrame.scene.y, 0);
  assert.ok(redFrame.pair.zPx > 10, 'static approach Z depth remains legible under reducedMotion');
});
