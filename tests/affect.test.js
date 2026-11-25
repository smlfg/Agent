import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { AFFECT_METRIC_IDS, computeMetrics } from '../src/metrics/compute.js';
import { createParameterEngine } from '../src/metrics/engine.js';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, '../src/metrics/metrics-catalog.json'), 'utf8'));

const WARM = 'WOW this is amazing!!! thank you so much :)';
const FLAT = 'fine. whatever. just answer.';
const HEDGY = 'um, maybe? I am not sure, sorry, I guess…';

function metricsFor(text) {
  return computeMetrics(text, {}, []);
}

function paramsFor(text, turns = 1) {
  const engine = createParameterEngine({ catalog });
  const metrics = metricsFor(text);
  let params = engine.get();
  for (let i = 0; i < turns; i++) params = engine.update(metrics);
  return params;
}

test('affect ids are catalog metrics with weights on the surface parameters', () => {
  assert.equal(AFFECT_METRIC_IDS.length, 10);
  for (const id of AFFECT_METRIC_IDS) {
    const metric = catalog.metrics.find((entry) => entry.id === id);
    assert.ok(metric, `${id} exists in the catalog`);
    const parameters = Object.keys(metric.weights ?? {});
    assert.ok(parameters.length >= 2, `${id} carries at least two weights`);
  }
});

test('WOW this is amazing!!! thank you so much :) is high valence and high arousal', () => {
  const warm = metricsFor(WARM);
  const flat = metricsFor(FLAT);

  assert.ok(warm.sentiment_valence > 0.65, `valence ${warm.sentiment_valence}`);
  assert.ok(warm.sentiment_balance > 0.8, `balance ${warm.sentiment_balance}`);
  assert.ok(warm.arousal_vader > 0.6, `arousal ${warm.arousal_vader}`);
  assert.ok(warm.second_person_ratio > 0.5, 'thanks-you speaks to the other');
  assert.ok(warm.politeness_markers > 0.2, 'thanks is polite');

  assert.ok(flat.arousal_vader < 0.2, 'no arousal cues in the flat line');
  assert.ok(warm.sentiment_valence > flat.sentiment_valence, 'excited beats flat in valence');
  assert.ok(warm.arousal_vader > flat.arousal_vader, 'excited beats flat in arousal');
});

test('fine. whatever. just answer. reads cold: low warmth, directive, no address', () => {
  const flat = metricsFor(FLAT);
  const warm = metricsFor(WARM);
  const flatParams = paramsFor(FLAT);
  const warmParams = paramsFor(WARM);

  assert.equal(flat.politeness_markers, 0);
  assert.equal(flat.second_person_ratio, 0);
  assert.equal(flat.self_disclosure, 0);
  assert.ok(flat.imperative_mood > 0.3, `imperative ${flat.imperative_mood}`);
  assert.ok(flatParams.warmth < 0.48, `warmth ${flatParams.warmth}`);
  assert.ok(warmParams.warmth > flatParams.warmth + 0.04, 'warm beats flat in warmth');
});

test('um, maybe? I am not sure, sorry, I guess… reads uncertain', () => {
  const hedgy = metricsFor(HEDGY);
  const confident = metricsFor('Yes. That is correct.');

  assert.ok(hedgy.hedges > 0.8, `hedges ${hedgy.hedges}`);
  assert.ok(hedgy.negation_ratio > 0.8, 'not sure carries negation');
  assert.ok(hedgy.self_disclosure > 0.3, 'I + sorry is self-disclosure');
  assert.ok(hedgy.hedges > confident.hedges + 0.5);
  assert.ok(paramsFor(HEDGY, 4).certainty < 0.5, 'repeated hedging lowers certainty');
});

test('negation flips valence: not good is below neutral and below good', () => {
  const good = metricsFor('good');
  const notGood = metricsFor('not good');

  assert.ok(good.sentiment_valence > 0.55, `good ${good.sentiment_valence}`);
  assert.ok(notGood.sentiment_valence < 0.45, `not good ${notGood.sentiment_valence}`);
  assert.ok(notGood.sentiment_valence < good.sentiment_valence - 0.15, 'negation drops valence');
  assert.ok(notGood.sentiment_balance < 0.5, 'negative balance');
});

test('warmth cluster (I + feeling, thanks, you) and cold commands stay apart', () => {
  const warmth = metricsFor('I am so happy, thank you!');
  const command = metricsFor('Stop. Just do it now.');

  assert.ok(warmth.self_disclosure > 0.5);
  assert.ok(warmth.politeness_markers > 0.2);
  assert.ok(warmth.second_person_ratio > 0.5);
  assert.ok(command.imperative_mood > 0.6);
  assert.equal(command.second_person_ratio, 0);
  assert.ok(command.sentiment_valence < warmth.sentiment_valence);
});

test('every affect metric is finite and inside 0..1 for degenerate input', () => {
  for (const text of ['', '?!', 'I HATE THIS!!!', "it's fine, thanks :)", 'ok', '😡😡']) {
    const metrics = metricsFor(text);
    for (const id of AFFECT_METRIC_IDS) {
      const value = metrics[id];
      assert.ok(Number.isFinite(value), `${id} is finite for ${JSON.stringify(text)}`);
      assert.ok(value >= 0 && value <= 1, `${id} in 0..1 for ${JSON.stringify(text)}`);
    }
  }
});
