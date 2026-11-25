// Bridge behaviour tests for the spatial-depth layer.
//
// Signal path under test:
//   Layer 1  computeMetrics()              turn text + typing -> 109 metrics
//   Layer 2  createParameterEngine()       metrics -> 12 surface parameters
//   Layer 3  deriveSurface()/deriveSpatialDepth()
//                                          parameters -> spatial CSS tokens
//   180-bone compileBonesToCssVars()       orbA light origin -> --depth-light-*
//
// Contract source: research/UPSTREAM-SEARCH-spatial-depth.md §3–§5.
// The depth tokens are additive: they must not replace the existing mood,
// palette, or reduced-motion behaviour covered by surface.test.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeMetrics } from '../src/metrics/compute.js';
import { createParameterEngine } from '../src/metrics/engine.js';
import * as surface from '../src/metrics/surface.js';
import { compileBonesToCssVars } from '../src/surface/surface-bones.js';
import { WORLD_LIST } from '../src/surface/surface-worlds.js';

const { PARAMETER_IDS, applySurface, deriveSurface } = surface;

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, '../src/metrics/metrics-catalog.json'), 'utf8'));

const STEPS = [0.1, 0.3, 0.5, 0.7, 0.9];

// Expected range and unit per depth token (research doc §3, table rows 0–8).
const DEPTH_SPEC = Object.freeze({
  '--surface-spatial': { unit: '', min: -1, max: 1 },
  '--depth-intensity': { unit: '', min: 0.15, max: 0.95 },
  '--depth-parallax': { unit: '', min: 0.2, max: 1.35 },
  '--depth-cornea': { unit: '', min: 0.25, max: 1 },
  '--depth-light-x': { unit: '', min: -1, max: 1 },
  '--depth-light-y': { unit: '', min: -1, max: 1 },
  '--depth-shadow-length': { unit: 'px', min: 8, max: 32 },
  '--depth-contact-alpha': { unit: '', min: 0.14, max: 0.48 },
  '--depth-haze': { unit: '', min: 0.08, max: 0.78 },
  '--depth-focal-contrast': { unit: '', min: 0.15, max: 0.95 },
  '--depth-gravity': { unit: '', min: -0.85, max: 0.85 },
  '--scene-lag-far': { unit: 'ms', min: 850, max: 1650 },
  '--scene-lag-mid': { unit: 'ms', min: 420, max: 920 },
  '--scene-lag-near': { unit: 'ms', min: 180, max: 420 },
});

const DEPTH_KEYS = Object.keys(DEPTH_SPEC);

function params(overrides = {}) {
  return { ...Object.fromEntries(PARAMETER_IDS.map((id) => [id, 0.5])), ...overrides };
}

function createRoot() {
  const props = {};
  return {
    style: { setProperty(name, value) { props[name] = String(value); } },
    dataset: {},
    props,
  };
}

function numericToken(variables, key, label) {
  const raw = variables?.[key];
  assert.notEqual(raw, undefined, `${label}: ${key} is missing from deriveSurface().variables`);
  const match = /^(-?\d+(?:\.\d+)?)([a-z%]*)$/.exec(String(raw));
  assert.ok(match, `${label}: ${key} must be a plain token, got ${JSON.stringify(raw)}`);
  return { value: Number(match[1]), unit: match[2] };
}

/** deriveSurface().variables plus a full existence/range/unit check. */
function depthVariables(overrides = {}, options = {}) {
  const { variables } = deriveSurface(params(overrides), options);
  const missing = DEPTH_KEYS.filter((key) => variables?.[key] === undefined);
  assert.deepEqual(
    missing,
    [],
    `deriveSurface() must expose every spatial-depth token; missing ${missing.join(', ')}`,
  );
  for (const [key, spec] of Object.entries(DEPTH_SPEC)) {
    const { value, unit } = numericToken(variables, key, 'neutral');
    assert.equal(unit, spec.unit, `${key} must use unit ${JSON.stringify(spec.unit)}`);
    // Reduced motion hard-zeros parallax; that zero is the documented exception.
    const lowerBound = options.reducedMotion === true && key === '--depth-parallax' ? 0 : spec.min;
    assert.ok(
      value >= lowerBound && value <= spec.max,
      `${key} = ${value} outside [${lowerBound}, ${spec.max}]`,
    );
  }
  return variables;
}

function token(overrides, key, options = {}) {
  return numericToken(depthVariables(overrides, options), key, key).value;
}

function increasing(fn, values, label) {
  let previous = -Infinity;
  for (const value of values) {
    const current = fn(value);
    assert.ok(current > previous, `${label}: expected ${current} > ${previous} at ${value}`);
    previous = current;
  }
}

function decreasing(fn, values, label) {
  let previous = Infinity;
  for (const value of values) {
    const current = fn(value);
    assert.ok(current < previous, `${label}: expected ${current} < ${previous} at ${value}`);
    previous = current;
  }
}

function closeTo(actual, expected, epsilon, label) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${label}: expected ${expected} ± ${epsilon}, got ${actual}`,
  );
}

function deriveSpatialDepth(values, options = {}) {
  assert.equal(
    typeof surface.deriveSpatialDepth,
    'function',
    'src/metrics/surface.js must export deriveSpatialDepth(params, options) (research/UPSTREAM-SEARCH-spatial-depth.md §5)',
  );
  return surface.deriveSpatialDepth(values, options);
}

// ── Turn fixtures for the end-to-end pipeline ───────────────────────────────

const DEEP_PROMPT = 'I keep wondering whether the deeper meaning of this interface emerges because '
  + 'the system holds contradictions open while the conversation slowly becomes a space, although '
  + 'I cannot yet say what that space should contain, and perhaps the honest question is how trust '
  + 'and abstraction can coexist in a pattern that does not collapse into mere decoration?';
const SHALLOW_PROMPT = 'ok, new paragraph';
const PERSONAL_PROMPT = 'I feel so grateful to you, thank you!';
const FORMAL_PROMPT = 'Would the system please provide a formal summary of the procedure.';

/**
 * One-turn TurnInputs fixture. `pauses` injects long typing pauses ([keyIndex, gapMs])
 * so `long_pause_ratio` can differ between turns; `hold` is the idle pause before send.
 */
function buildTurnInputs(prompt, { duration = 1200, hold = 0, startAt = 0, pauses = [], backspaces = 0 } = {}) {
  const count = Math.max(1, Math.min(prompt.length || 1, Math.round(duration / 160)));
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push([startAt + (duration * i) / Math.max(1, count - 1 || 1), prompt[i % Math.max(1, prompt.length)] ?? 'a']);
  }
  let pauseMs = 0;
  for (const [fromIndex, gap] of pauses) {
    pauseMs += gap;
    for (let i = fromIndex; i < keys.length; i++) keys[i][0] += gap;
  }
  return {
    turn: 1,
    prompt,
    answer: '',
    phaseBeforeSubmit: 'idle',
    mountedAt: 0,
    submitAt: startAt + duration + hold + pauseMs,
    responseEndAt: 0,
    firstKeyAt: startAt,
    lastKeyAt: keys[keys.length - 1][0],
    typing: { keys, keydowns: keys.length + backspaces, backspaces },
    pointer: { samples: 0, nearPresence: 0 },
    hiddenMs: 0,
    blurCount: 0,
    clicks: 0,
    interruption: false,
  };
}

/** computeMetrics -> createParameterEngine -> applySurface, exactly as mountMetrics does per turn. */
function runTurn(prompt, typing = {}) {
  const engine = createParameterEngine({ catalog });
  const inputs = buildTurnInputs(prompt, typing);
  const metrics = computeMetrics(prompt, inputs, []);
  const nextParams = engine.update(metrics);
  const root = createRoot();
  const behaviour = applySurface(nextParams, root);
  return { inputs, metrics, params: nextParams, root, behaviour };
}

// ── 1. Neutral anchor ───────────────────────────────────────────────────────

test('neutral parameters produce every spatial-depth token inside its documented range', () => {
  const variables = depthVariables();

  // Neutral invariance: all-neutral parameters reproduce the documented anchor,
  // so an untouched surface has depth without showing a mood.
  closeTo(numericToken(variables, '--surface-spatial', 'neutral').value, 0, 0.001, '--surface-spatial anchor');
  closeTo(numericToken(variables, '--depth-intensity', 'neutral').value, 0.5, 0.001, '--depth-intensity anchor');
  closeTo(numericToken(variables, '--depth-parallax', 'neutral').value, 0.85, 0.001, '--depth-parallax anchor');
  closeTo(numericToken(variables, '--depth-cornea', 'neutral').value, 0.65, 0.001, '--depth-cornea anchor');
  closeTo(numericToken(variables, '--depth-shadow-length', 'neutral').value, 14, 0.001, '--depth-shadow-length anchor');
  closeTo(numericToken(variables, '--depth-contact-alpha', 'neutral').value, 0.28, 0.001, '--depth-contact-alpha anchor');
  closeTo(numericToken(variables, '--depth-haze', 'neutral').value, 0.35, 0.001, '--depth-haze anchor');
  closeTo(numericToken(variables, '--depth-focal-contrast', 'neutral').value, 0.5, 0.001, '--depth-focal-contrast anchor');
  closeTo(numericToken(variables, '--depth-gravity', 'neutral').value, 0, 0.001, '--depth-gravity anchor');
  closeTo(numericToken(variables, '--scene-lag-far', 'neutral').value, 1250, 0.5, '--scene-lag-far anchor');
  closeTo(numericToken(variables, '--scene-lag-mid', 'neutral').value, 650, 0.5, '--scene-lag-mid anchor');
  closeTo(numericToken(variables, '--scene-lag-near', 'neutral').value, 280, 0.5, '--scene-lag-near anchor');

  // The light vector comes from the primary orb (default 22% / 18%), so it is
  // non-zero at neutral and still inside the normalized -1..1 space.
  const lightX = numericToken(variables, '--depth-light-x', 'neutral').value;
  const lightY = numericToken(variables, '--depth-light-y', 'neutral').value;
  assert.ok(lightX > 0 && lightX <= 1, `--depth-light-x ${lightX} must point away from the orb`);
  assert.ok(lightY > 0 && lightY <= 1, `--depth-light-y ${lightY} must point away from the orb`);
});

// ── 2. Monotonicity of the 8 spatial dimensions ─────────────────────────────

test('depth raises intensity and shadow length; closeness shortens the shadow and deepens the cornea', () => {
  increasing((depth) => token({ depth }, '--depth-intensity'), STEPS, 'depth -> --depth-intensity');
  increasing((depth) => token({ depth }, '--depth-shadow-length'), STEPS, 'depth -> --depth-shadow-length');

  increasing((closeness) => token({ closeness }, '--depth-cornea'), STEPS, 'closeness -> --depth-cornea');
  increasing((closeness) => token({ closeness }, '--depth-contact-alpha'), STEPS, 'closeness -> --depth-contact-alpha');
  decreasing((closeness) => token({ closeness }, '--depth-shadow-length'), STEPS, 'closeness -> --depth-shadow-length');
});

test('openness raises parallax and haze; attention with density raises focal contrast', () => {
  increasing((openness) => token({ openness }, '--depth-parallax'), STEPS, 'openness -> --depth-parallax');
  increasing((openness) => token({ openness }, '--depth-haze'), STEPS, 'openness -> --depth-haze');

  increasing(
    (value) => token({ attention: value, density: value }, '--depth-focal-contrast'),
    STEPS,
    'attention+density -> --depth-focal-contrast',
  );
});

test('gravity separates lift from grounding', () => {
  // Energy and tempo give the stage lift (negative gravity).
  decreasing(
    (value) => token({ energy: value, tempo: value }, '--depth-gravity'),
    STEPS,
    'energy+tempo -> --depth-gravity',
  );
  // Calm and depth ground the composition (positive gravity).
  increasing(
    (value) => token({ calm: value, depth: value }, '--depth-gravity'),
    STEPS,
    'calm+depth -> --depth-gravity',
  );
});

// ── 3. Reduced motion ───────────────────────────────────────────────────────

test('reduced motion zeroes parallax but keeps depth, cornea and shadow elevation', () => {
  const still = depthVariables({ warmth: 0.9, openness: 0.9, energy: 0.8 }, { reducedMotion: true });
  const moving = depthVariables({ warmth: 0.9, openness: 0.9, energy: 0.8 });

  assert.equal(still['--depth-parallax'], '0', 'reduced motion must hard-zero --depth-parallax');
  assert.ok(Number(moving['--depth-parallax']) > 0.2, 'moving surface keeps a real parallax gain');

  for (const key of ['--depth-intensity', '--depth-cornea', '--depth-shadow-length', '--depth-contact-alpha', '--depth-light-x', '--depth-light-y']) {
    assert.equal(still[key], moving[key], `${key} must survive reduced motion unchanged`);
  }
  assert.equal(still['--surface-jitter-state'], 'paused', 'the existing reduced-motion palette contract still holds');
});

// ── 4. End-to-end turn pipeline ─────────────────────────────────────────────

test('a deep, slow turn opens more depth than a shallow one through the whole pipeline', () => {
  const deep = runTurn(DEEP_PROMPT, { duration: 12000, hold: 6000, pauses: [[20, 3000], [60, 4000]] });
  const shallow = runTurn(SHALLOW_PROMPT, { duration: 1200, hold: 0 });

  // Layer 1 really sees the difference.
  assert.ok(
    deep.metrics.think_time_total > shallow.metrics.think_time_total,
    'deep turn thinks longer (think_time_total)',
  );
  assert.ok(
    deep.metrics.hold_before_send > shallow.metrics.hold_before_send,
    'deep turn holds before send (hold_before_send)',
  );

  // Layer 2 carries it into the depth parameter.
  assert.ok(deep.params.depth > shallow.params.depth, `depth ${deep.params.depth} > ${shallow.params.depth}`);

  // Layer 3 projects it as visible depth.
  const deepIntensity = Number(deep.root.props['--depth-intensity']);
  const shallowIntensity = Number(shallow.root.props['--depth-intensity']);
  const deepSpatial = Number(deep.root.props['--surface-spatial']);
  const shallowSpatial = Number(shallow.root.props['--surface-spatial']);

  assert.ok(Number.isFinite(deepIntensity), '--depth-intensity must be written by applySurface');
  assert.ok(deepIntensity > shallowIntensity, `--depth-intensity ${deepIntensity} > ${shallowIntensity}`);
  assert.ok(deepSpatial > shallowSpatial, `--surface-spatial ${deepSpatial} > ${shallowSpatial}`);
  assert.ok(deep.behaviour.type.charMs > 0, 'the behaviour contract still resolves');
});

test('a personal, grateful turn thickens the cornea and contact shadow versus a formal one', () => {
  const personal = runTurn(PERSONAL_PROMPT, { duration: 2400, hold: 200 });
  const formal = runTurn(FORMAL_PROMPT, { duration: 4000, hold: 900 });

  assert.ok(personal.params.closeness > formal.params.closeness, 'gratitude and self-disclosure create closeness');
  assert.ok(personal.params.warmth > formal.params.warmth, 'gratitude raises warmth');

  const personalCornea = Number(personal.root.props['--depth-cornea']);
  const formalCornea = Number(formal.root.props['--depth-cornea']);
  const personalContact = Number(personal.root.props['--depth-contact-alpha']);
  const formalContact = Number(formal.root.props['--depth-contact-alpha']);

  assert.ok(Number.isFinite(personalCornea), '--depth-cornea must be written by applySurface');
  assert.ok(personalCornea > formalCornea, `--depth-cornea ${personalCornea} > ${formalCornea}`);
  assert.ok(personalContact > formalContact, `--depth-contact-alpha ${personalContact} > ${formalContact}`);
});

// ── 5. 180-bone light vector ────────────────────────────────────────────────

test('compileBonesToCssVars derives --depth-light-x/y from orbAX/orbAY for all 8 worlds', () => {
  assert.equal(WORLD_LIST.length, 8);

  const observedX = new Set();
  const observedY = new Set();

  for (const world of WORLD_LIST) {
    const { orbAX, orbAY } = world.bones;
    const vars = compileBonesToCssVars(world.bones);

    assert.notEqual(vars['--depth-light-x'], undefined, `${world.id}: --depth-light-x is missing`);
    assert.notEqual(vars['--depth-light-y'], undefined, `${world.id}: --depth-light-y is missing`);

    const expectedX = Math.max(-1, Math.min(1, (50 - orbAX) / 50));
    const expectedY = Math.max(-1, Math.min(1, (50 - orbAY) / 50));
    closeTo(Number(vars['--depth-light-x']), expectedX, 0.002, `${world.id}: --depth-light-x from orbAX ${orbAX}`);
    closeTo(Number(vars['--depth-light-y']), expectedY, 0.002, `${world.id}: --depth-light-y from orbAY ${orbAY}`);

    // The bone tokens stay the single source of truth for the light origin.
    assert.equal(vars['--bone-orb-a-x'], `${orbAX}%`, `${world.id}: --bone-orb-a-x must still mirror orbAX`);
    assert.equal(vars['--bone-orb-a-y'], `${orbAY}%`, `${world.id}: --bone-orb-a-y must still mirror orbAY`);

    // Bridge: the metric layer reads the same orb origin, so a neutral parameter
    // vector modulates but never contradicts the active world's light vector.
    const bridged = deriveSpatialDepth(params(), { orbAX, orbAY });
    closeTo(
      numericToken(bridged.variables, '--depth-light-x', world.id).value,
      Number(vars['--depth-light-x']),
      0.002,
      `${world.id}: deriveSpatialDepth and compileBonesToCssVars share one light origin (x)`,
    );
    closeTo(
      numericToken(bridged.variables, '--depth-light-y', world.id).value,
      Number(vars['--depth-light-y']),
      0.002,
      `${world.id}: deriveSpatialDepth and compileBonesToCssVars share one light origin (y)`,
    );

    observedX.add(vars['--depth-light-x']);
    observedY.add(vars['--depth-light-y']);
  }

  assert.ok(observedX.size > 1, 'the curated worlds span more than one light direction (x)');
  assert.ok(observedY.size > 1, 'the curated worlds span more than one light direction (y)');
});

// ── 6. CSS Spatial Depth Contract ───────────────────────────────────────────

test('2.5D CSS rules apply to default surface, couple light/cornea/lag, and keep .stage unflattened', () => {
  const depthCss = readFileSync(join(here, '../src/styles/bones/bones-depth.css'), 'utf8');
  const textureCss = readFileSync(join(here, '../src/styles/bones/bones-texture.css'), 'utf8');

  // .stage must not carry filter (would rasterize children into one flat bitmap).
  assert.equal(
    /\.stage\s*\{[^}]*filter:/s.test(textureCss),
    false,
    'bones-texture.css must not apply filter directly on .stage',
  );
  assert.match(textureCss, /body::before,\s*html\[data-bones-active="true"\]\s*\.stage::before\s*\{[^}]*filter:/s);

  // Depth rules use html:root:root so they work on default landing surface AND bones worlds.
  assert.equal(
    depthCss.includes('html[data-bones-active="true"]'),
    false,
    'bones-depth.css must not gate spatial depth behind data-bones-active',
  );
  assert.match(depthCss, /html:root:root\s+\.presence\s+\.eye\s*\{[^}]*--depth-light-x[^}]*--depth-contact-alpha/s);
  assert.match(depthCss, /\.left-eye\s+\.eye-catchlight[^}]*--eye-left-pupil-x/s);
  assert.match(depthCss, /\.right-eye\s+\.eye-catchlight[^}]*--eye-right-pupil-x/s);
  assert.match(depthCss, /\.pupil-core[^}]*--eye-left-pupil-x/s);
  assert.match(depthCss, /--scene-lag-far/);
  assert.match(depthCss, /--scene-lag-mid/);
  assert.match(depthCss, /--scene-lag-near/);
  assert.match(depthCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(depthCss, /is-motion-paused/);
});
