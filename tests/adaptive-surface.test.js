import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SURFACE_DIMENSIONS,
  SURFACE_SCHEMA,
  DEFAULT_SURFACE_STATE,
  CONTEXTUAL_CONTROL_SPECS,
  MAX_VISIBLE_CONTROLS,
  validateSurfacePatch,
  createSurfaceStore,
} from '../src/surface/surface-state.js';
import {
  parseAdaptationIntent,
  extractModelSurfacePatch,
  enforceResponseLength,
  buildAdaptationPromptBlock,
  createAdaptiveAgent,
} from '../src/surface/surface-adapter.js';
import { projectSurfaceState } from '../src/surface/surface-projector.js';

test('unified SurfaceState defines all 4 dimensions and every required parameter', () => {
  assert.deepEqual([...SURFACE_DIMENSIONS], ['embodiment', 'motion', 'atmosphere', 'communication']);

  assert.deepEqual(Object.keys(SURFACE_SCHEMA.embodiment).sort(), [
    'asymmetry',
    'eyePositionX',
    'eyePositionY',
    'eyeScale',
    'eyeShape',
    'eyeSpacing',
    'gazeDirection',
  ]);
  assert.deepEqual(Object.keys(SURFACE_SCHEMA.motion).sort(), [
    'ambientMovement',
    'damping',
    'energy',
    'responsiveness',
    'speed',
  ]);
  assert.deepEqual(Object.keys(SURFACE_SCHEMA.atmosphere).sort(), [
    'background',
    'contrast',
    'primaryColor',
    'secondaryColor',
    'visualIntensity',
  ]);
  assert.deepEqual(Object.keys(SURFACE_SCHEMA.communication).sort(), [
    'responseLength',
    'responsePace',
    'textDensity',
    'tone',
    'typographyScale',
  ]);
});

test('validateSurfacePatch clamps values, applies deltas, and rejects unsafe/unknown entries', () => {
  const { nextState, changedPaths, rejected } = validateSurfacePatch({
    embodiment: {
      eyeSpacing: 99,
      eyePositionX: -5,
      eyeShape: 'WIDE',
      gazeDirection: { x: 2, y: -0.4 },
      evil: 'alert(1)',
    },
    motion: {
      energy: { delta: -0.3 },
      speed: 'fast',
    },
    atmosphere: {
      primaryColor: 'javascript:alert(1)',
      secondaryColor: '#1e7f7c',
      background: 'url(https://evil.example)',
    },
    communication: {
      responseLength: 'brief',
      typographyScale: 2.5,
    },
    rawCss: 'body { display: none; }',
  });

  assert.equal(nextState.embodiment.eyeSpacing, 2.35);
  assert.equal(nextState.embodiment.eyePositionX, -1);
  assert.equal(nextState.embodiment.eyeShape, 'wide');
  assert.deepEqual(nextState.embodiment.gazeDirection, { x: 1, y: -0.4 });
  assert.equal(nextState.motion.energy, 0.2);
  assert.equal(nextState.atmosphere.primaryColor, DEFAULT_SURFACE_STATE.atmosphere.primaryColor);
  assert.equal(nextState.atmosphere.secondaryColor, '#1E7F7C');
  assert.equal(nextState.atmosphere.background, 'paper');
  assert.equal(nextState.communication.responseLength, 'brief');
  assert.equal(nextState.communication.typographyScale, 1.36);

  for (const spec of Object.values(CONTEXTUAL_CONTROL_SPECS)) {
    assert.ok(typeof spec.lowLabel === 'string' && spec.lowLabel.length > 0, `missing lowLabel for ${spec.id}`);
    assert.ok(typeof spec.highLabel === 'string' && spec.highLabel.length > 0, `missing highLabel for ${spec.id}`);
  }

  assert.ok(changedPaths.includes('embodiment.eyeSpacing'));
  assert.ok(rejected.includes('embodiment.evil'));
  assert.ok(rejected.includes('motion.speed'));
  assert.ok(rejected.includes('atmosphere.primaryColor'));
  assert.ok(rejected.includes('atmosphere.background'));
  assert.ok(rejected.includes('rawCss'));
});

test('surfaceStore tracks undo history, reset, and caps active contextual controls at 3', () => {
  const store = createSurfaceStore();
  assert.equal(store.isModified(), false);
  assert.equal(store.canUndo(), false);
  assert.equal(store.getActiveControls().length, 0);

  store.applyPatch({
    motion: { energy: 0.16, ambientMovement: 0.18, speed: 0.2 },
    atmosphere: { visualIntensity: 0.2, contrast: 0.7 },
    communication: { typographyScale: 1.05 },
  }, { summary: 'ruhiger' });

  assert.equal(store.isModified(), true);
  assert.equal(store.canUndo(), true);
  assert.equal(store.getActiveControls().length, MAX_VISIBLE_CONTROLS);

  store.applyPatch({ embodiment: { eyeSpacing: 1.45 } }, { summary: 'weiter' });
  assert.equal(store.getState().embodiment.eyeSpacing, 1.45);
  assert.equal(store.getActiveControls()[0], 'embodiment.eyeSpacing');

  const undone = store.undo();
  assert.equal(undone.changed, true);
  assert.equal(store.getState().embodiment.eyeSpacing, DEFAULT_SURFACE_STATE.embodiment.eyeSpacing);
  assert.equal(store.getState().motion.energy, 0.16);

  const reset = store.reset();
  assert.equal(reset.changed, true);
  assert.deepEqual(store.getState(), DEFAULT_SURFACE_STATE);
  assert.equal(store.isModified(), false);
  assert.equal(store.getActiveControls().length, 0);
  // Reset itself is undoable so accidental resets can be recovered.
  assert.equal(store.canUndo(), true);
});

test('parseAdaptationIntent parses all 5 German utterances and compound instructions', () => {
  const store = createSurfaceStore();

  // 1. "Sei ruhiger." (preserves warmth rather than forcing cold shock)
  const calm = parseAdaptationIntent('Sei ruhiger.', store.getState());
  assert.equal(calm.action, 'patch');
  assert.ok(calm.patch.motion.energy <= 0.1);
  assert.ok(calm.patch.motion.ambientMovement <= 0.1);
  assert.ok(calm.patch.communication.responsePace <= 0.2);
  assert.equal(calm.patch.atmosphere.background, 'paper');
  assert.equal(calm.patch.communication.tone, 'calm');
  store.applyPatch(calm.patch, { focusControls: calm.focusControls });

  // 2. "Mach deine Augen weiter auseinander."
  const wide = parseAdaptationIntent('Mach deine Augen weiter auseinander.', store.getState());
  assert.equal(wide.action, 'patch');
  assert.ok(wide.patch.embodiment.eyeSpacing >= 2.0);
  assert.ok(wide.focusControls.includes('embodiment.eyeSpacing'));
  store.applyPatch(wide.patch, { focusControls: wide.focusControls });

  // 3. "Werde lebendiger und farbenfroher."
  const vivid = parseAdaptationIntent('Werde lebendiger und farbenfroher.', store.getState());
  assert.equal(vivid.action, 'patch');
  assert.ok(vivid.patch.motion.energy >= 0.9);
  assert.ok(vivid.patch.motion.ambientMovement >= 0.9);
  assert.equal(vivid.patch.atmosphere.background, 'vivid');
  assert.ok(vivid.patch.atmosphere.visualIntensity >= 0.9);
  store.applyPatch(vivid.patch, { focusControls: vivid.focusControls });

  // 4. "Antworte kürzer und sei zurückhaltender." (airy whitespace + deep withdrawal)
  const briefReserved = parseAdaptationIntent('Antworte kürzer und sei zurückhaltender.', store.getState());
  assert.equal(briefReserved.action, 'patch');
  assert.equal(briefReserved.patch.communication.responseLength, 'brief');
  assert.equal(briefReserved.patch.communication.tone, 'reserved');
  assert.ok(briefReserved.patch.communication.textDensity < 0.3);
  assert.ok(briefReserved.patch.embodiment.eyeScale <= 0.72);
  assert.ok(briefReserved.patch.embodiment.eyePositionY <= -0.7);
  assert.ok(briefReserved.patch.motion.energy <= 0.2);
  assert.equal(briefReserved.patch.atmosphere.background, 'minimal');
  store.applyPatch(briefReserved.patch, { focusControls: briefReserved.focusControls });

  // 5. "Mach alles rückgängig."
  const reset = parseAdaptationIntent('Mach alles rückgängig.', store.getState());
  assert.equal(reset.action, 'reset');

  // Single-step undo distinction
  const undo = parseAdaptationIntent('Mach das letzte rückgängig.', store.getState());
  assert.equal(undo.action, 'undo');

  // Example from spec: "Sei etwas ruhiger, komm näher und antworte kürzer."
  const compound = parseAdaptationIntent('Sei etwas ruhiger, komm näher und antworte kürzer.', DEFAULT_SURFACE_STATE);
  assert.equal(compound.action, 'patch');
  assert.ok(compound.patch.motion.energy < DEFAULT_SURFACE_STATE.motion.energy);
  assert.ok(compound.patch.embodiment.eyeScale >= 1.35);
  assert.ok(compound.patch.embodiment.eyePositionY >= 0.7);
  assert.equal(compound.patch.communication.responseLength, 'brief');
});

test('extractModelSurfacePatch strips <surface> tags safely and ignores invalid markup', () => {
  const valid = extractModelSurfacePatch('Klar, ich werde ruhiger. <surface>{"motion":{"energy":0.2}}</surface>');
  assert.equal(valid.text, 'Klar, ich werde ruhiger.');
  assert.deepEqual(valid.modelPatch, { motion: { energy: 0.2 } });

  const broken = extractModelSurfacePatch('Hallo <surface>{broken json</surface> Welt.');
  assert.equal(broken.text, 'Hallo Welt.');
  assert.equal(broken.modelPatch, null);

  const unclosed = extractModelSurfacePatch('Klar. <surface>{"motion":');
  assert.equal(unclosed.text, 'Klar.');
  assert.equal(unclosed.modelPatch, null);
});

test('projectSurfaceState and createAdaptiveAgent connect state -> style, prompt, and brevity', async () => {
  const store = createSurfaceStore();
  let seenPrompt = '';
  const innerAgent = {
    async respond() {
      seenPrompt = buildAdaptationPromptBlock(store.getState(), store.getLastChange()?.summary || '');
      return {
        text: 'Ich antworte jetzt deutlich kürzer und bleibe ruhig, damit du schneller weiterlesen kannst. Noch ein zweiter Satz.',
        dev: false,
      };
    },
  };
  const agent = createAdaptiveAgent({ innerAgent, surfaceStore: store });

  const res = await agent.respond('Antworte kürzer und sei zurückhaltender.');
  assert.equal(store.getState().communication.responseLength, 'brief');
  assert.match(seenPrompt, /ONE very short sentence/i);
  assert.match(seenPrompt, /Tone: reserved/i);
  // Brief enforcement caps reply to one crisp sentence.
  assert.equal((res.text.match(/[.!?]/g) || []).length, 1);

  const projected = projectSurfaceState(store.getState());
  assert.equal(projected.presenceParams.scale, store.getState().embodiment.eyeScale);
  assert.ok(projected.variables['--bg-start'].startsWith('#'));
});

test('createAdaptiveAgent never leaks <surface> tags even if the model outputs only a tag', async () => {
  const store = createSurfaceStore();
  const innerAgent = {
    async respond() {
      return { text: '<surface>{"motion":{"energy":0.2}}</surface>', dev: false };
    },
  };
  const agent = createAdaptiveAgent({ innerAgent, surfaceStore: store });
  const res = await agent.respond('Mach deine Augen weiter auseinander.');
  assert.equal(res.text.includes('<surface>'), false);
  assert.ok(res.text.length > 0);
});

test('enforceResponseLength preserves balanced replies and trims verbose brief replies', () => {
  const twoSentences = 'Erster Satz. Zweiter Satz.';
  assert.equal(enforceResponseLength(twoSentences, 'balanced'), twoSentences);
  assert.equal(enforceResponseLength(twoSentences, 'brief'), 'Erster Satz.');
});
