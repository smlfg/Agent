import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  DEFAULT_THRESHOLDS,
  askWorker,
  buildWaypointCatalog,
  evaluateDecision,
  runOrchestratorTurn,
  sanitizeOrchestratorReply,
} from '../src/agent/orchestrator.js';
import { assertAtMostOneWorkerCall } from '../src/voice/build-prompt.js';

const knowledge = JSON.parse(
  readFileSync(new URL('./fixtures/knowledge.legacy.json', import.meta.url), 'utf8'),
);

test('DEFAULT_THRESHOLDS matches the calibrated application-code constants', () => {
  assert.deepEqual(DEFAULT_THRESHOLDS, {
    pTopMin: 0.55,
    pMarginMin: 0.15,
    hasDirectionMin: 0.5,
    wantsDepthMin: 0.5,
    stickyCardMin: 0.45,
  });
  assert.equal(Object.isFrozen(DEFAULT_THRESHOLDS), true);
});

test('evaluateDecision shows card only when has_direction, p_top, and margin thresholds pass', () => {
  // Strong winner with orientation only -> show card, do not call worker
  const orient = evaluateDecision({
    has_direction: 0.85,
    wants_depth: 0.25,
    scores: {
      'website-as-agent': 0.76,
      creator: 0.14,
      'person-agent': 0.1,
    },
  });

  assert.equal(orient.waypoint?.id, 'website-as-agent');
  assert.equal(orient.runner_up?.id, 'creator');
  assert.equal(orient.call_worker, false);
  assert.deepEqual(orient.threads, []);
  assert.equal(orient.card_on_screen, 'website-as-agent');

  // Strong winner with depth >= 0.5 -> show card AND call worker
  const depth = evaluateDecision({
    has_direction: 0.85,
    wants_depth: 0.5,
    scores: [
      { id: 'creator', label: 'Creator', p: 0.72 },
      { id: 'what-this-is', label: 'What this is', p: 0.2 },
    ],
  });

  assert.deepEqual(depth.waypoint, { id: 'creator', label: 'Creator', p: 0.72 });
  assert.deepEqual(depth.runner_up, { id: 'what-this-is', label: 'What this is', p: 0.2 });
  assert.equal(depth.call_worker, true);
  assert.deepEqual(depth.threads, []);
  assert.equal(depth.card_on_screen, 'creator');
});

test('evaluateDecision keeps sticky card_on_screen when margin is narrow and sticky score >= stickyCardMin', () => {
  const sticky = evaluateDecision({
    has_direction: 0.7,
    wants_depth: 0.8,
    card_on_screen: 'person-agent',
    scores: {
      'website-as-agent': 0.51,
      'person-agent': 0.46,
      creator: 0.03,
    },
  });

  assert.equal(sticky.waypoint?.id, 'person-agent');
  assert.equal(sticky.card_on_screen, 'person-agent');
  assert.equal(sticky.runner_up?.id, 'website-as-agent');
  assert.equal(sticky.call_worker, true);

  // Below stickyCardMin (0.45) and below pTopMin/margin -> nothing shown
  const dropped = evaluateDecision({
    has_direction: 0.7,
    wants_depth: 0.8,
    card_on_screen: 'person-agent',
    scores: {
      'website-as-agent': 0.51,
      'person-agent': 0.44,
      creator: 0.05,
    },
  });

  assert.equal(dropped.waypoint, null);
  assert.equal(dropped.card_on_screen, null);
  assert.equal(dropped.call_worker, false);
  assert.deepEqual(dropped.threads, []);
});

test('evaluateDecision returns top 2 threads when has_direction < 0.5 and nothing in between', () => {
  const unclear = evaluateDecision({
    has_direction: 0.35,
    wants_depth: 0.9,
    scores: {
      'what-this-is': 0.42,
      creator: 0.31,
      'plaud-thoughts': 0.15,
    },
  });

  assert.equal(unclear.waypoint, null);
  assert.equal(unclear.call_worker, false);
  assert.equal(unclear.card_on_screen, null);
  assert.equal(unclear.threads.length, 2);
  assert.deepEqual(
    unclear.threads.map((t) => t.id),
    ['what-this-is', 'creator'],
  );

  // has_direction >= 0.5 but ambiguous scores and no sticky card -> nothing
  const nothingInBetween = evaluateDecision({
    has_direction: 0.65,
    wants_depth: 0.8,
    scores: {
      'what-this-is': 0.52,
      creator: 0.48,
    },
  });

  assert.equal(nothingInBetween.waypoint, null);
  assert.equal(nothingInBetween.call_worker, false);
  assert.deepEqual(nothingInBetween.threads, []);
  assert.equal(nothingInBetween.card_on_screen, null);
});

test('buildWaypointCatalog builds deterministic entries from knowledge.json', () => {
  const catalog = buildWaypointCatalog(knowledge);

  assert.equal(catalog instanceof Map, true);
  for (const expectedId of [
    'what-this-is',
    'creator',
    'website-as-agent',
    'person-agent',
    'team-knowledge-interface',
    'agentfaehig',
    'hai',
    'plaud-thoughts',
  ]) {
    const entry = catalog.get(expectedId);
    assert.ok(entry, `Expected waypoint ${expectedId} in catalog`);
    assert.equal(entry.id, expectedId);
    assert.equal(typeof entry.label, 'string');
    assert.ok(entry.label.length > 0);
    assert.ok(Array.isArray(entry.facts) && entry.facts.length > 0);
    assert.equal(entry.link, null);
  }
});

test('askWorker throws on unknown or missing waypoint_id (no fallback)', () => {
  const catalog = buildWaypointCatalog(knowledge);

  assert.throws(
    () => askWorker({ waypoint_id: 'invented-topic', question: 'What is that?' }, { catalog }),
    /Unknown waypoint_id/,
  );
  assert.throws(
    () => askWorker({ waypoint_id: '', question: 'What is this?' }, { catalog }),
    /Unknown waypoint_id/,
  );
  assert.throws(
    () => askWorker({ question: 'What is this?' }, { catalog }),
    /Unknown waypoint_id/,
  );
});

test('askWorker answers covered questions in <=3 plain sentences and returns NOT_COVERED for missing topics', () => {
  const catalog = buildWaypointCatalog(knowledge);

  const covered = askWorker(
    { waypoint_id: 'creator', question: 'Who built this interface?' },
    { catalog },
  );
  assert.notEqual(covered.answer, 'NOT_COVERED');
  assert.ok(covered.answer.includes('Samuel'));
  assert.equal(covered.answer.includes('?'), false);
  assert.equal(covered.link, null);

  const sentenceCount = covered.answer.split(/(?<=[.])\s+/).filter(Boolean).length;
  assert.ok(sentenceCount >= 1 && sentenceCount <= 3);

  // Verbatim URL from custom catalog facts is preserved; absent URL stays null
  const withUrlCatalog = new Map(catalog);
  withUrlCatalog.set('repo-demo', {
    id: 'repo-demo',
    label: 'Demo Repo',
    facts: ['The source repository lives at https://example.org/demo-repo for testing.'],
    link: 'https://example.org/demo-repo',
  });
  const linked = askWorker(
    { waypoint_id: 'repo-demo', question: 'Where is the repository?' },
    { catalog: withUrlCatalog },
  );
  assert.equal(linked.link, 'https://example.org/demo-repo');

  // Unapproved / missing topics must return NOT_COVERED
  for (const question of [
    'What is the pricing in 2027?',
    'What is Samuel phone number?',
    'What is the guaranteed delivery timeline?',
    'Does it ship with quantum telemetry?',
  ]) {
    const res = askWorker({ waypoint_id: 'creator', question }, { catalog });
    assert.deepEqual(res, { answer: 'NOT_COVERED', link: null });
  }
});

test('runOrchestratorTurn invokes ask_worker at most once per turn and enforces guard', async () => {
  const decision = evaluateDecision({
    has_direction: 0.9,
    wants_depth: 0.8,
    scores: {
      'website-as-agent': 0.86,
      creator: 0.1,
    },
  });

  let workerCalls = 0;
  const result = await runOrchestratorTurn({
    visitorMessage: 'How does a website that is the agent work for a studio?',
    history: 'Visitor: Hello\nAgent: Agentfähig is a Human-Agent Interface.',
    decision,
    knowledge,
    workerFn: async ({ waypoint_id, question }) => {
      workerCalls += 1;
      return askWorker({ waypoint_id, question }, { knowledge });
    },
  });

  assert.equal(workerCalls, 1);
  assert.equal(result.workerCalled, true);
  assert.equal(result.workerCallCount, 1);
  assert.equal(result.text.endsWith('?'), false);
  assert.ok(result.text.length > 20);

  // Direct guard check: second call in same turn throws
  const guarded = assertAtMostOneWorkerCall(() => ({ answer: 'ok', link: null }));
  guarded({ waypoint_id: 'creator', question: 'Who?' });
  assert.throws(
    () => guarded({ waypoint_id: 'what-this-is', question: 'What?' }),
    /At most one ask_worker call is allowed per turn/,
  );

  // Orientation turn (wants_depth < 0.5) never calls worker
  const orientDecision = evaluateDecision({
    has_direction: 0.9,
    wants_depth: 0.2,
    scores: { 'website-as-agent': 0.86, creator: 0.1 },
  });
  let orientCalls = 0;
  const orientResult = await runOrchestratorTurn({
    visitorMessage: 'Just looking around',
    decision: orientDecision,
    knowledge,
    workerFn: async () => {
      orientCalls += 1;
      return { answer: 'Should not be called', link: null };
    },
  });
  assert.equal(orientCalls, 0);
  assert.equal(orientResult.workerCallCount, 0);
});

test('NOT_COVERED and worker errors produce a calm 1-sentence response shorter than covered answers without retrying', async () => {
  const decision = evaluateDecision({
    has_direction: 0.9,
    wants_depth: 0.9,
    scores: { 'website-as-agent': 0.9, creator: 0.05 },
  });

  const covered = await runOrchestratorTurn({
    visitorMessage: 'What is a website that is the agent for studios?',
    decision,
    knowledge,
  });

  let notCoveredCalls = 0;
  const notCovered = await runOrchestratorTurn({
    visitorMessage: 'What is the pricing in 2027?',
    decision,
    knowledge,
    workerFn: async ({ waypoint_id, question }) => {
      notCoveredCalls += 1;
      return askWorker({ waypoint_id, question }, { knowledge });
    },
  });

  assert.equal(notCoveredCalls, 1);
  assert.equal(notCovered.workerCallCount, 1);
  assert.equal(notCovered.text.endsWith('?'), false);
  assert.equal(notCovered.text.includes('!'), false);
  assert.ok(
    notCovered.text.length < covered.text.length,
    `Expected NOT_COVERED reply (${notCovered.text.length}) to be shorter than covered reply (${covered.text.length})`,
  );

  let errorCalls = 0;
  const timedOut = await runOrchestratorTurn({
    visitorMessage: 'Tell me about studio websites',
    decision,
    knowledge,
    workerFn: async () => {
      errorCalls += 1;
      throw new Error('Worker timeout after 3000ms');
    },
  });

  assert.equal(errorCalls, 1, 'Worker must never be retried on error or timeout');
  assert.equal(timedOut.workerCallCount, 1);
  assert.equal(timedOut.text.endsWith('?'), false);
  assert.equal(timedOut.text.includes('!'), false);
  assert.ok(timedOut.text.length < covered.text.length);
});

test('Rule 5 & Rule 7: zero turns end with "?" and forbidden preambles/exclamation marks are stripped', async () => {
  const samples = [
    'Great question! Here is how it works? Would you like more?',
    "I'd be happy to help! Agentfähig stays calm!!",
    'It answers directly??',
    'Certainly! Ask anything?!',
  ];

  for (const sample of samples) {
    const cleaned = sanitizeOrchestratorReply(sample, {
      decision: {
        has_direction: 0.8,
        waypoint: { id: 'what-this-is', label: 'What this is', p: 0.8 },
        runner_up: null,
      },
    });
    assert.equal(cleaned.endsWith('?'), false, `Turn must not end with ?: ${cleaned}`);
    assert.equal(cleaned.includes('?'), false, `Turn must not contain ?: ${cleaned}`);
    assert.equal(cleaned.includes('!'), false, `Turn must not contain !: ${cleaned}`);
    assert.equal(/great question/i.test(cleaned), false);
    assert.equal(/i['’]d be happy to/i.test(cleaned), false);
  }

  const fromModel = await runOrchestratorTurn({
    visitorMessage: 'Hello?',
    decision: { has_direction: 0.1, waypoint: null, runner_up: null, call_worker: false },
    knowledge,
    modelFn: async () => 'Great question! Agentfähig is a Human-Agent Interface. What would you like to see?',
  });

  assert.equal(fromModel.text.endsWith('?'), false);
  assert.equal(fromModel.text.includes('!'), false);
  assert.equal(/great question/i.test(fromModel.text), false);
});

test('Rule 2 / §9.1: 50 directionless messages with waypoint null have 0 topic-name leaks', async () => {
  const catalog = buildWaypointCatalog(knowledge);
  const forbiddenTerms = [];
  const exemptions = new Set([
    'agentfähig',
    'agentfaehig',
    'human-agent interface',
    'human agent interface',
  ]);

  for (const entry of catalog.values()) {
    for (const term of [entry.id, entry.label]) {
      if (!exemptions.has(term.toLowerCase())) {
        forbiddenTerms.push(term);
      }
    }
  }

  const directionlessMessages = [
    'hi', 'hello', 'hey there', 'good morning', 'good evening',
    'what?', 'ok', 'hmm', 'interesting', 'tell me something',
    'who?', 'why?', 'how?', 'not sure', 'just browsing',
    'surprise me', 'what is going on', 'anything here', 'start', 'test',
    'hallo', 'moin', 'guten tag', 'was geht', 'erzaehl mal',
    'keine ahnung', 'ich schaue nur', 'weiter', 'nochmal', 'bitte',
    'cool', 'nice', 'okay then', 'maybe', 'yes',
    'no', 'wait', 'look', 'speak', 'say something',
    'are you there', 'can you talk', 'listen', 'go on', 'help',
    'what now', 'anything else', 'im listening', 'show me', 'ready',
  ];
  assert.equal(directionlessMessages.length, 50);

  let leakCount = 0;

  for (let i = 0; i < directionlessMessages.length; i += 1) {
    const msg = directionlessMessages[i];
    const decision = evaluateDecision({
      has_direction: 0.15,
      wants_depth: 0.1,
      scores: {
        'what-this-is': 0.3,
        creator: 0.25,
        'website-as-agent': 0.2,
      },
    });
    assert.equal(decision.waypoint, null);

    // Alternate between default synthesis and an adversarial model trying to leak catalog topics.
    const res = await runOrchestratorTurn({
      visitorMessage: msg,
      decision,
      knowledge,
      catalog,
      modelFn: i % 2 === 0
        ? undefined
        : async () => `You can check ${forbiddenTerms[i % forbiddenTerms.length]} next!`,
    });

    assert.equal(res.workerCallCount, 0);
    assert.equal(res.text.endsWith('?'), false);

    for (const term of forbiddenTerms) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}-])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}-])`, 'iu');
      if (re.test(res.text)) {
        leakCount += 1;
      }
    }
  }

  assert.equal(leakCount, 0);
});

test('askWorker and runOrchestratorTurn answer "was ist humanagent interface" with the HAI definition', async () => {
  const catalog = buildWaypointCatalog(knowledge);

  for (const waypointId of ['hai', 'what-this-is']) {
    const workerRes = askWorker(
      { waypoint_id: waypointId, question: 'was ist humanagent interface' },
      { catalog },
    );
    assert.notEqual(workerRes.answer, 'NOT_COVERED');
    assert.match(workerRes.answer, /human and agent work as one system/i);

    const decision = evaluateDecision({
      has_direction: 0.9,
      wants_depth: 0.85,
      scores: { [waypointId]: 0.88, creator: 0.08 },
    });
    const turn = await runOrchestratorTurn({
      visitorMessage: 'was ist humanagent interface',
      decision,
      knowledge,
      catalog,
    });
    assert.equal(turn.workerCallCount, 1);
    assert.notEqual(turn.workerResult?.answer, 'NOT_COVERED');
    assert.match(turn.text, /human and agent work as one system/i);
  }
});
