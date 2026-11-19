import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BONE_FAMILIES,
  BONE_SCHEMA,
  BONE_COUNT,
  DEFAULT_BONES,
  contrastRatio,
  ensureWcagContrast,
  validateBonePatch,
  compileBonesToCssVars,
  mutateBonesCreative,
} from '../src/surface/surface-bones.js';
import {
  WORLD_LIST,
  SURFACE_WORLDS,
  getWorldById,
  matchWorldFromUtterance,
} from '../src/surface/surface-worlds.js';

test('180-bone skeleton covers all 7 anatomical families with >= 165 bones', () => {
  assert.ok(BONE_COUNT >= 165, `expected >= 165 bones, got ${BONE_COUNT}`);
  const counts = Object.fromEntries(BONE_FAMILIES.map((f) => [f, 0]));
  for (const spec of Object.values(BONE_SCHEMA)) {
    assert.ok(BONE_FAMILIES.includes(spec.family), `unknown family ${spec.family}`);
    counts[spec.family] += 1;
  }
  for (const family of BONE_FAMILIES) {
    assert.ok(counts[family] >= 12, `family ${family} should have >= 12 bones, got ${counts[family]}`);
  }
});

test('validateBonePatch accepts flat/grouped patches, clamps values, and rejects unsafe/unknown keys', () => {
  const { patch, nextBones, changedBones, rejected } = validateBonePatch({
    light: { bgAngle: 999, orbAX: -5 },
    eyes: { irisHue: -360, eyeRadiusTl: 99 },
    textColor: 'javascript:alert(1)',
    bogusBone: 42,
    rawCss: 'body{display:none}',
  });

  assert.equal(patch.bgAngle, 240);
  assert.equal(nextBones.bgAngle, 240);
  assert.equal(nextBones.orbAX, 0);
  assert.equal(nextBones.irisHue, -180);
  assert.equal(nextBones.eyeRadiusTl, 76);
  assert.equal(nextBones.textColor, DEFAULT_BONES.textColor);
  assert.ok(changedBones.includes('bgAngle'));
  assert.ok(rejected.includes('textColor'));
  assert.ok(rejected.includes('bogusBone'));
  assert.ok(rejected.includes('rawCss'));
});

test('all 8 curated agent worlds validate cleanly and pass WCAG AA across background gradient stops', () => {
  assert.equal(WORLD_LIST.length, 8);
  for (const world of WORLD_LIST) {
    assert.deepEqual(world.rejected, [], `world ${world.id} had rejected bones: ${world.rejected.join(', ')}`);
    assert.equal(getWorldById(world.id), world);

    for (const bgKey of ['bgStart', 'bgMid', 'bgEnd']) {
      const textRatio = contrastRatio(world.bones.textColor, world.bones[bgKey]);
      assert.ok(textRatio >= 4.5, `${world.id} textColor contrast vs ${bgKey} = ${textRatio.toFixed(2)} < 4.5`);
      const promptRatio = contrastRatio(world.bones.promptColor, world.bones[bgKey]);
      assert.ok(promptRatio >= 4.5, `${world.id} promptColor contrast vs ${bgKey} = ${promptRatio.toFixed(2)} < 4.5`);
    }

    const vars = compileBonesToCssVars(world.bones);
    assert.ok(vars['--bg-start'].startsWith('#'));
    assert.ok(vars['--bone-answer-font-stack'].length > 5);
  }
  assert.ok(SURFACE_WORLDS['vesper-lapis-zinnober']);
});

test('mutateBonesCreative produces distinct, valid, WCAG-AA-safe high-temperature worlds', () => {
  const a = mutateBonesCreative({ seed: 17, temperature: 0.95 });
  const b = mutateBonesCreative({ seed: 73, temperature: 0.95 });
  const c = mutateBonesCreative({ seed: 42, temperature: 1.0 });

  assert.notDeepEqual(a.bones, b.bones);
  for (const sample of [a, b, c]) {
    const guarded = ensureWcagContrast(sample.bones);
    for (const bgKey of ['bgStart', 'bgMid', 'bgEnd']) {
      assert.ok(contrastRatio(guarded.textColor, guarded[bgKey]) >= 4.5);
      assert.ok(contrastRatio(guarded.mutedColor, guarded[bgKey]) >= 4.5);
    }
  }
});

test('matchWorldFromUtterance resolves named worlds and surprise exploration commands', () => {
  assert.equal(matchWorldFromUtterance('Zeig mir das Risograph Atelier!').world.id, 'risograph-druckwerkstatt');
  assert.equal(matchWorldFromUtterance('Ab ins Nachtobservatorium bitte.').world.id, 'nocturne-turrell-observatorium');
  assert.equal(matchWorldFromUtterance('Gib mir Wabi-Sabi Kintsugi').world.id, 'wabi-sabi-kintsugi-clay');
  assert.equal(matchWorldFromUtterance('Überrasch mich mit etwas Neuem!').kind, 'surprise');
  assert.equal(matchWorldFromUtterance('Wie ist das Wetter?'), null);
});
