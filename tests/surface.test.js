import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MOOD_PRESETS,
  PARAMETER_IDS,
  applySurface,
  deriveSurface,
  parsePreviewParams,
} from '../src/metrics/surface.js';

function params(overrides = {}) {
  return { ...Object.fromEntries(PARAMETER_IDS.map((id) => [id, 0.5])), ...overrides };
}

function axes(overrides) {
  return deriveSurface(params(overrides)).axes;
}

function increasing(fn, values) {
  let previous = -Infinity;
  for (const value of values) {
    const current = fn(value);
    assert.ok(current > previous, `expected ${current} > ${previous} at ${value}`);
    previous = current;
  }
}

function decreasing(fn, values) {
  let previous = Infinity;
  for (const value of values) {
    const current = fn(value);
    assert.ok(current < previous, `expected ${current} < ${previous} at ${value}`);
    previous = current;
  }
}

test('temperature axis is monotone in warmth, closeness and formality', () => {
  increasing((warmth) => axes({ warmth }).temperature, [0.1, 0.3, 0.5, 0.7, 0.9]);
  increasing((closeness) => axes({ closeness }).temperature, [0.1, 0.3, 0.5, 0.7, 0.9]);
  decreasing((formality) => axes({ formality }).temperature, [0.1, 0.3, 0.5, 0.7, 0.9]);
});

test('nervousness axis is monotone in calm, energy, tempo and attention', () => {
  decreasing((calm) => axes({ calm }).nervousness, [0.1, 0.3, 0.5, 0.7, 0.9]);
  increasing((energy) => axes({ energy }).nervousness, [0.1, 0.3, 0.5, 0.7, 0.9]);
  increasing((tempo) => axes({ tempo }).nervousness, [0.1, 0.3, 0.5, 0.7, 0.9]);
  decreasing((attention) => axes({ attention }).nervousness, [0.1, 0.3, 0.5, 0.7, 0.9]);
});

test('compactness axis is monotone in density, closeness and depth', () => {
  increasing((density) => axes({ density }).compactness, [0.1, 0.3, 0.5, 0.7, 0.9]);
  increasing((closeness) => axes({ closeness }).compactness, [0.1, 0.3, 0.5, 0.7, 0.9]);
  decreasing((depth) => axes({ depth }).compactness, [0.1, 0.3, 0.5, 0.7, 0.9]);
});

test('derived behaviour follows the axes without capping at the neutral value', () => {
  const nervousA = deriveSurface(params({ calm: 0.82 }));
  const nervousB = deriveSurface(params({ calm: 0.18 }));
  assert.ok(nervousB.charDelayMs < nervousA.charDelayMs, 'nervous types faster');
  assert.ok(nervousB.blinkIntervalMs < nervousA.blinkIntervalMs, 'nervous blinks sooner');
  assert.ok(nervousB.saccadeIntervalMs < nervousA.saccadeIntervalMs, 'nervous looks sooner');

  const airy = deriveSurface(params({ density: 0.12 }));
  const dense = deriveSurface(params({ density: 0.88 }));
  assert.ok(dense.pair.measureRem < airy.pair.measureRem, 'dense narrows the measure');
  assert.ok(dense.pair.gapRem < airy.pair.gapRem, 'dense tightens the gap');

  const cold = deriveSurface(params({ warmth: 0.12 }));
  const warm = deriveSurface(params({ warmth: 0.88 }));
  assert.ok(warm.pair.lineHeight > cold.pair.lineHeight, 'warm opens the leading');
  assert.ok(warm.axes.temperature > 0.25, 'warm crosses its anchor gain');
  assert.ok(cold.axes.temperature < -0.15, 'cold crosses its anchor gain');
});

test('presets reach strongly coloured extremes', () => {
  const warm = deriveSurface(MOOD_PRESETS.warm).axes.temperature;
  const cold = deriveSurface(MOOD_PRESETS.cold).axes.temperature;
  const nervous = deriveSurface(MOOD_PRESETS.nervous).axes.nervousness;
  const calm = deriveSurface(MOOD_PRESETS.calm).axes.nervousness;

  assert.ok(warm > 0.85, `warm ${warm} > 0.85`);
  assert.ok(cold < -0.8, `cold ${cold} < -0.8`);
  assert.ok(nervous > 0.85, `nervous ${nervous} > 0.85`);
  assert.ok(calm < -0.85, `calm ${calm} < -0.85`);
});

function parseHex(value) {
  const match = /^#([0-9a-f]{6})$/i.exec(String(value));
  assert.ok(match, `expected #rrggbb, got ${value}`);
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function linear(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

test('every extreme keeps text and prompt contrast at WCAG AA', () => {
  const cases = [
    ['neutral', params()],
    ['warm', { ...MOOD_PRESETS.warm }],
    ['cold', { ...MOOD_PRESETS.cold }],
    ['nervous', { ...MOOD_PRESETS.nervous }],
    ['calm', { ...MOOD_PRESETS.calm }],
    ['warmth 0', params({ warmth: 0 })],
    ['warmth 1', params({ warmth: 1 })],
    ['formality 0', params({ formality: 0 })],
    ['formality 1', params({ formality: 1 })],
  ];

  for (const [name, values] of cases) {
    const { variables } = deriveSurface(values);
    for (const bg of ['--bg-start', '--bg-end']) {
      for (const fg of ['--text', '--muted', '--prompt', '--placeholder']) {
        const ratio = contrast(variables[fg], variables[bg]);
        assert.ok(ratio >= 4.5, `${name}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
      }
    }
  }
});

test('?mood and ?params preview parsing', () => {
  assert.deepEqual(parsePreviewParams('?mood=warm'), { ...MOOD_PRESETS.warm });
  assert.deepEqual(parsePreviewParams('mood=NERVOUS'), { ...MOOD_PRESETS.nervous });
  assert.equal(parsePreviewParams('?mood=hot'), null);
  assert.equal(parsePreviewParams(''), null);
  assert.equal(parsePreviewParams('?params='), null);

  const parsed = parsePreviewParams('?params=warmth:0.9,calm:0.2,bogus:1');
  assert.deepEqual(parsed, { warmth: 0.9, calm: 0.2 });

  const clamped = parsePreviewParams('?params=warmth:9,calm:-1,depth:nope');
  assert.deepEqual(clamped, { warmth: 1, calm: 0 });

  const precedence = parsePreviewParams('?mood=cold&params=warmth:0.4');
  assert.deepEqual(precedence, { warmth: 0.4 });
});

function createRoot() {
  const props = {};
  return {
    style: { setProperty(name, value) { props[name] = String(value); } },
    dataset: {},
    props,
  };
}

test('reduced motion keeps the palette but removes drift', () => {
  const values = { ...MOOD_PRESETS.warm };
  const normal = deriveSurface(values, { reducedMotion: false });
  const reduced = deriveSurface(values, { reducedMotion: true });

  assert.equal(normal.motion, true);
  assert.equal(reduced.motion, false);
  assert.equal(reduced.variables['--surface-jitter-state'], 'paused');
  assert.equal(reduced.variables['--surface-jitter-amp'], '0px');

  for (const key of ['--bg-start', '--bg-end', '--text', '--accent']) {
    assert.equal(reduced.variables[key], normal.variables[key], `${key} still follows the mood`);
  }
  assert.deepEqual(reduced.axes, normal.axes);

  const root = createRoot();
  applySurface(values, root, { reducedMotion: true });
  assert.equal(root.props['--surface-jitter-state'], 'paused');
  assert.equal(root.props['--surface-jitter-amp'], '0px');
  assert.ok(root.props['--bg-start']);
});
