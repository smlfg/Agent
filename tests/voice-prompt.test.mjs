import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assertAtMostOneWorkerCall,
  buildSystemPrompt,
  buildTurnInput,
} from '../src/voice/build-prompt.js';

const VOICE_PROMPT_PATH = fileURLToPath(
  new URL('../src/voice/voice-prompt.md', import.meta.url),
);
const TOOL_SCHEMA_PATH = fileURLToPath(
  new URL('../src/voice/ask-worker.tool.json', import.meta.url),
);

test('buildSystemPrompt replaces <SITE> and <ABOUT> in src/voice/voice-prompt.md without leaving placeholders', (t) => {
  if (!existsSync(VOICE_PROMPT_PATH)) {
    t.diagnostic('src/voice/voice-prompt.md not present yet');
    assert.fail('Expected src/voice/voice-prompt.md to exist');
  }

  const prompt = buildSystemPrompt({
    site: 'Agentfaehig',
    about: 'A conversational site that helps visitors find the right capability or project. Built around direct answers and single waypoints.',
  });

  assert.ok(prompt.startsWith('# Role'), 'Prompt should start at # Role without draft header');
  assert.ok(prompt.includes('You are the voice of Agentfaehig.'));
  assert.ok(
    prompt.includes(
      'A conversational site that helps visitors find the right capability or project. Built around direct answers and single waypoints.',
    ),
  );
  assert.equal(prompt.includes('<SITE>'), false);
  assert.equal(/<ABOUT:[^>]*>/.test(prompt), false);
});

test('buildSystemPrompt strips metadata or draft header before # Role', () => {
  const dir = mkdtempSync(join(tmpdir(), 'voice-prompt-test-'));
  try {
    const tempPromptPath = join(dir, 'draft-voice-prompt.md');
    writeFileSync(
      tempPromptPath,
      [
        '---',
        'status: draft',
        '---',
        '',
        'Entwurf-Kopf: interne Notiz vor dem Prompt.',
        '',
        '# Role',
        '',
        'You are the voice of <SITE>.',
        '',
        '# What the site is',
        '',
        '<ABOUT: two or three plain sentences. This is the only knowledge you hold.>',
      ].join('\n'),
      'utf8',
    );

    const prompt = buildSystemPrompt({
      site: 'ExampleSite',
      about: 'Short plain description.',
      templatePath: tempPromptPath,
    });

    assert.ok(prompt.startsWith('# Role\n'));
    assert.equal(prompt.includes('status: draft'), false);
    assert.equal(prompt.includes('Entwurf-Kopf'), false);
    assert.ok(prompt.includes('You are the voice of ExampleSite.'));
    assert.ok(prompt.includes('Short plain description.'));
    assert.equal(prompt.includes('<SITE>'), false);
    assert.equal(/<ABOUT:[^>]*>/.test(prompt), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('buildSystemPrompt validates site and about as non-empty strings', () => {
  const dir = mkdtempSync(join(tmpdir(), 'voice-prompt-val-'));
  try {
    const tempPromptPath = join(dir, 'voice-prompt.md');
    writeFileSync(
      tempPromptPath,
      '# Role\nVoice of <SITE>.\n<ABOUT: plain sentences.>\n',
      'utf8',
    );

    assert.throws(
      () => buildSystemPrompt({ site: '', about: 'Valid about.', templatePath: tempPromptPath }),
      /site must be a non-empty string/,
    );
    assert.throws(
      () => buildSystemPrompt({ site: '   ', about: 'Valid about.', templatePath: tempPromptPath }),
      /site must be a non-empty string/,
    );
    assert.throws(
      () => buildSystemPrompt({ about: 'Valid about.', templatePath: tempPromptPath }),
      /site must be a non-empty string/,
    );
    assert.throws(
      () => buildSystemPrompt({ site: 'ValidSite', about: '', templatePath: tempPromptPath }),
      /about must be a non-empty string/,
    );
    assert.throws(
      () => buildSystemPrompt({ site: 'ValidSite', about: '  \n ', templatePath: tempPromptPath }),
      /about must be a non-empty string/,
    );
    assert.throws(
      () => buildSystemPrompt({ site: 'ValidSite', templatePath: tempPromptPath }),
      /about must be a non-empty string/,
    );
    assert.throws(
      () => buildSystemPrompt(),
      /site must be a non-empty string/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('buildTurnInput formats DECISION, HISTORY, and VISITOR_MESSAGE', () => {
  const input = buildTurnInput({
    decision: {
      has_direction: 0.82,
      waypoint: { id: 'what-is-hai', label: 'What is HAI', p: 0.82 },
      runner_up: { id: 'hai-mcp', label: 'hai-mcp', p: 0.12 },
    },
    history: 'Visitor: Hi\nAgent: Hello.',
    visitorMessage: 'How does HAI differ from a chatbot?',
  });

  assert.match(input, /^DECISION\n/);
  assert.match(input, /has_direction: 0\.82/);
  assert.match(input, /waypoint:\s+\{"id":"what-is-hai","label":"What is HAI","p":0\.82\}/);
  assert.match(input, /runner_up:\s+\{"id":"hai-mcp","label":"hai-mcp","p":0\.12\}/);
  assert.match(input, /\nHISTORY\nVisitor: Hi\nAgent: Hello\.\n/);
  assert.match(input, /\nVISITOR_MESSAGE\nHow does HAI differ from a chatbot\?$/);
});

test('buildTurnInput supports null waypoints and boundary has_direction values 0 and 1', () => {
  const zero = buildTurnInput({
    decision: { has_direction: 0, waypoint: null, runner_up: null },
    history: '',
    visitorMessage: 'What is this?',
  });
  assert.match(zero, /has_direction: 0\n/);
  assert.match(zero, /waypoint:\s+null\n/);
  assert.match(zero, /runner_up:\s+null\n/);
  assert.match(zero, /HISTORY\n\(none\)\n/);

  const one = buildTurnInput({
    decision: {
      has_direction: 1,
      waypoint: { id: 'creator', label: 'Creator', p: 1 },
      runner_up: null,
    },
    visitorMessage: 'Who built this?',
  });
  assert.match(one, /has_direction: 1\n/);
});

test('buildTurnInput rejects invalid has_direction and malformed decision fields', () => {
  const base = {
    history: '',
    visitorMessage: 'Hello',
  };

  for (const bad of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY, '0.5', null, undefined]) {
    assert.throws(
      () =>
        buildTurnInput({
          ...base,
          decision: { has_direction: bad, waypoint: null, runner_up: null },
        }),
      /decision\.has_direction/,
    );
  }

  assert.throws(
    () => buildTurnInput({ ...base, decision: null }),
    /decision must be a non-null object/,
  );

  assert.throws(
    () =>
      buildTurnInput({
        ...base,
        decision: {
          has_direction: 0.5,
          waypoint: { id: '', label: 'Bad', p: 0.5 },
          runner_up: null,
        },
      }),
    /decision\.waypoint\.id/,
  );

  assert.throws(
    () =>
      buildTurnInput({
        decision: { has_direction: 0.5, waypoint: null, runner_up: null },
        history: '',
        visitorMessage: '   ',
      }),
    /visitorMessage/,
  );
});

test('assertAtMostOneWorkerCall allows 0 or 1 call per turn (including NOT_COVERED) and throws on 2nd call', async () => {
  // 0 calls allowed
  let called = 0;
  const zeroTurnWorker = assertAtMostOneWorkerCall(async () => {
    called += 1;
    return 'unused';
  });
  assert.equal(zeroTurnWorker.getCallCount(), 0);
  assert.equal(called, 0);

  // 1 call allowed with normal answer
  const oneTurnCalls = [];
  const oneTurnWorker = assertAtMostOneWorkerCall(async ({ question, waypoint_id }) => {
    oneTurnCalls.push({ question, waypoint_id });
    return 'HAI treats the interface itself as the agent.';
  });
  const answer = await oneTurnWorker({
    question: 'What is HAI?',
    waypoint_id: 'what-is-hai',
  });
  assert.equal(answer, 'HAI treats the interface itself as the agent.');
  assert.equal(oneTurnCalls.length, 1);
  assert.equal(oneTurnWorker.getCallCount(), 1);

  // 1 call returning NOT_COVERED is allowed, but a 2nd call in the same turn throws
  let mockCalls = 0;
  const notCoveredWorker = assertAtMostOneWorkerCall(async ({ question, waypoint_id }) => {
    mockCalls += 1;
    assert.ok(waypoint_id.length > 0);
    assert.ok(question.length > 0);
    return 'NOT_COVERED';
  });
  const firstResult = await notCoveredWorker({
    question: 'What is the pricing in 2027?',
    waypoint_id: 'what-is-hai',
  });
  assert.equal(firstResult, 'NOT_COVERED');
  assert.equal(mockCalls, 1);

  assert.throws(
    () =>
      notCoveredWorker({
        question: 'Try another waypoint?',
        waypoint_id: 'hai-mcp',
      }),
    /At most one ask_worker call is allowed per turn/,
  );
  assert.equal(mockCalls, 1);

  // Reset allows 1 call in the next turn
  notCoveredWorker.reset();
  const nextTurnResult = await notCoveredWorker({
    question: 'What is hai-mcp?',
    waypoint_id: 'hai-mcp',
  });
  assert.equal(nextTurnResult, 'NOT_COVERED');
  assert.equal(mockCalls, 2);
});

test('ask-worker.tool.json is valid JSON with required parameters and NOT_COVERED note', () => {
  const raw = readFileSync(TOOL_SCHEMA_PATH, 'utf8');
  const schema = JSON.parse(raw);

  assert.equal(schema.name, 'ask_worker');
  assert.equal(typeof schema.description, 'string');
  assert.ok(schema.description.includes('NOT_COVERED'));
  assert.match(schema.description, /at most once per turn/i);

  assert.equal(schema.parameters?.type, 'object');
  assert.equal(schema.parameters?.properties?.question?.type, 'string');
  assert.equal(schema.parameters?.properties?.waypoint_id?.type, 'string');
  assert.deepEqual(schema.parameters?.required, ['question', 'waypoint_id']);
});
