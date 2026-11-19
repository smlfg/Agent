import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PATHWAY_PARAMS,
  applyTypingSteps,
  normalizePathways,
  planTyping,
  replayDelay,
} from '../src/dev/replay.js';

const RAW = JSON.parse(
  readFileSync(new URL('../src/dev/conversation-pathways.json', import.meta.url), 'utf8'),
);

test('data file has the documented shape', () => {
  assert.equal(typeof RAW.version, 'number');
  assert.ok(Array.isArray(RAW.parameters));
  assert.deepEqual(RAW.parameters, [...PATHWAY_PARAMS]);
  assert.ok(Array.isArray(RAW.pathways));
  assert.equal(RAW.pathways.length, 13);
});

test('every pathway and turn is structurally valid', () => {
  const ids = new Set();
  for (const pathway of RAW.pathways) {
    assert.equal(typeof pathway.id, 'string');
    assert.ok(pathway.id.length > 0);
    assert.ok(!ids.has(pathway.id), `duplicate pathway id: ${pathway.id}`);
    ids.add(pathway.id);

    assert.equal(typeof pathway.title, 'string');
    assert.ok(pathway.title.length > 0);
    assert.equal(typeof pathway.persona, 'string');
    assert.equal(typeof pathway.outcome, 'string');
    assert.equal(typeof pathway.design_lesson, 'string');
    assert.ok(Array.isArray(pathway.turns));
    assert.ok(pathway.turns.length > 0);

    for (const [index, turn] of pathway.turns.entries()) {
      const where = `${pathway.id} turn ${index}`;

      assert.equal(typeof turn.user, 'string', where);
      assert.ok(turn.user.length > 0, where);
      assert.equal(typeof turn.agent, 'string', where);
      assert.ok(turn.agent.length > 0, where);
      assert.equal(typeof turn.surface, 'string', where);

      assert.equal(typeof turn.typing, 'object', where);
      assert.equal(typeof turn.typing.duration_ms, 'number', where);
      assert.ok(turn.typing.duration_ms > 0, where);
      assert.equal(typeof turn.typing.backspaces, 'number', where);
      assert.ok(turn.typing.backspaces >= 0, where);
      assert.equal(typeof turn.typing.pause_before_send_ms, 'number', where);
      assert.ok(turn.typing.pause_before_send_ms >= 0, where);
      assert.equal(typeof turn.typing.interrupted_agent, 'boolean', where);

      assert.equal(typeof turn.params, 'object', where);
      assert.deepEqual(Object.keys(turn.params).sort(), [...PATHWAY_PARAMS].sort(), where);
      for (const name of PATHWAY_PARAMS) {
        const value = turn.params[name];
        assert.equal(typeof value, 'number', `${where} param ${name}`);
        assert.ok(value >= 0 && value <= 1, `${where} param ${name} in 0..1`);
      }
    }
  }
});

test('planTyping ends on the exact user text for every turn', () => {
  for (const pathway of RAW.pathways) {
    for (const turn of pathway.turns) {
      const steps = planTyping(turn.user, turn.typing, 1);
      assert.equal(applyTypingSteps(steps), turn.user, `${pathway.id}: ${turn.user}`);
    }
  }
});

test('planTyping delay sum matches duration_ms / speed', () => {
  for (const pathway of RAW.pathways) {
    for (const turn of pathway.turns) {
      for (const speed of [1, 2, 4]) {
        const steps = planTyping(turn.user, turn.typing, speed);
        const sum = steps.reduce((total, step) => total + step.delayMs, 0);
        const expected = turn.typing.duration_ms / speed;
        assert.ok(
          Math.abs(sum - expected) < 1e-6,
          `${pathway.id} @${speed}x: ${sum} vs ${expected}`,
        );
      }
    }
  }
});

test('planTyping simulates the requested number of backspaces', () => {
  for (const pathway of RAW.pathways) {
    for (const turn of pathway.turns) {
      const steps = planTyping(turn.user, turn.typing, 1);
      const deletes = steps.filter((step) => step.action === 'delete');
      const expected = Math.min(turn.typing.backspaces, Array.from(turn.user).length + 1);
      assert.equal(deletes.length, expected, `${pathway.id}: ${turn.user}`);

      for (let i = 0; i < steps.length; i += 1) {
        if (steps[i].action !== 'delete') continue;
        const previous = steps[i - 1];
        assert.ok(previous, 'a delete never starts the plan');
        assert.equal(previous.action, 'type');
        assert.equal(previous.char, steps[i].char, 'deleted char was just typed');
      }
    }
  }
});

test('planTyping is deterministic', () => {
  const typing = { duration_ms: 2400, backspaces: 3, pause_before_send_ms: 600 };
  const text = 'What is this thing, really?';
  assert.deepEqual(planTyping(text, typing, 1), planTyping(text, typing, 1));
  assert.deepEqual(planTyping(text, typing, 2), planTyping(text, typing, 2));
});

test('planTyping handles empty text and no backspaces', () => {
  assert.deepEqual(planTyping('', { duration_ms: 0, backspaces: 0 }), []);
  const steps = planTyping('', { duration_ms: 400, backspaces: 1 }, 1);
  assert.equal(applyTypingSteps(steps), '');
  assert.equal(steps.length, 2);
});

test('replayDelay stays in 500..900 ms and is deterministic', () => {
  for (const pathway of RAW.pathways) {
    for (const turn of pathway.turns) {
      const delay = replayDelay(turn.agent, 7);
      assert.equal(delay, replayDelay(turn.agent, 7));
      assert.ok(delay >= 500 && delay <= 900, `${delay}`);
      assert.equal(Number.isInteger(delay), true);
    }
  }
  assert.ok(replayDelay('', 7) >= 500);
});

test('normalizePathways keeps usable pathways only', () => {
  assert.equal(normalizePathways(RAW).length, 13);
  assert.deepEqual(normalizePathways(null), []);
  assert.deepEqual(normalizePathways({ pathways: 'nope' }), []);
  assert.deepEqual(
    normalizePathways({
      pathways: [
        { id: 'ok', title: 'Ok', turns: [{ user: 'hi' }] },
        { id: 'no-turns', title: 'No turns', turns: [] },
        { title: 'No id', turns: [{ user: 'hi' }] },
        null,
      ],
    }).map((pathway) => pathway.id),
    ['ok'],
  );
});
