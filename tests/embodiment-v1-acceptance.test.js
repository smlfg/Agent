// Embodiment v1 acceptance AT-01 … AT-07 (Wave 1 vertical slice).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import worker from '../deploy/agentfaehig-site/src/worker.js';
import { createRemoteAgent } from '../src/agent/remoteAgent.js';
import { mountConversation } from '../src/conversation/conversation.js';
import {
  createAgentEvent,
  createAgentEventBus,
} from '../src/state/agent-events.js';
import { createStore, initialState, reduce } from '../src/state/store.js';
import { mountPresence } from '../src/presence/presence.js';
import {
  mountEmbodiment,
  resolveEmbodiedIntent,
} from '../src/presence/embodiment.js';
import { EMBODIED_INTENT_PROFILES } from '../src/presence/eye-motion-profiles.js';
import { createSurfaceStore } from '../src/surface/surface-state.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ORIGIN = 'https://www.xn--agentfhig-02a.de';
const AGENT_URL = `${ORIGIN}/api/agent`;
const MINIMAX_KEY = 'test-minimax-key-UniqueValue-9xYz';
const LLM_DELAY_MS = 5000;
const SAMUEL_ANSWER = 'Samuel baut das Human-Agent Interface [[person-samuel]].';

const ASSETS = { fetch: async () => new Response('asset', { status: 200 }) };

function minimaxOk(text) {
  return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function withFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

function delayedMiniMaxUpstream(text, delayMs = LLM_DELAY_MS) {
  return async (url) => {
    const target = String(url);
    if (target.includes('minimax') || target.includes('/v1/messages')) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return minimaxOk(text);
    }
    throw new Error(`unexpected upstream fetch: ${target}`);
  };
}

function styleStub() {
  const vars = new Map();
  return {
    setProperty(name, value) {
      vars.set(name, value);
    },
    removeProperty(name) {
      vars.delete(name);
    },
  };
}

function elAttrs() {
  return {
    attributes: {},
    dataset: {},
    style: styleStub(),
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
  };
}

function makeIntegrationDom() {
  const byId = new Map();

  function classListOf(el) {
    const set = new Set();
    return {
      add(...names) {
        for (const n of names) set.add(n);
        el.className = [...set].join(' ');
      },
      remove(...names) {
        for (const n of names) set.delete(n);
        el.className = [...set].join(' ');
      },
      toggle(name, force) {
        if (force === true || (!set.has(name) && force !== false)) set.add(name);
        else set.delete(name);
        el.className = [...set].join(' ');
      },
    };
  }

  function wireElement(el) {
    Object.assign(el, elAttrs());
    el.classList = classListOf(el);
    el.children = [];
    el.parentNode = null;
    el._listeners = Object.create(null);
    if (!el.style?.setProperty) el.style = styleStub();
    el.textContent = '';
    el.innerHTML = '';
    el.value = '';
    el.tagName = el.tagName || 'DIV';
    el.replaceChildren = (...nodes) => {
      el.children = [];
      for (const n of nodes) el.append(n);
    };
    el.append = (...nodes) => {
      for (const n of nodes) {
        n.parentNode = el;
        el.children.push(n);
      }
    };
    el.removeChild = (node) => {
      const i = el.children.indexOf(node);
      if (i >= 0) el.children.splice(i, 1);
      node.parentNode = null;
    };
    el.setAttribute = function setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === 'id') {
        this.id = value;
        byId.set(value, this);
      }
    };
    el.addEventListener = (type, fn) => {
      (el._listeners[type] ??= []).push(fn);
    };
    el.removeEventListener = (type, fn) => {
      const list = el._listeners[type];
      if (!list) return;
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    };
    el.dispatchEvent = (event) => {
      const list = el._listeners[event.type];
      if (!list) return;
      for (const fn of [...list]) fn(event);
    };
    el.querySelector = (sel) => {
      if (sel.startsWith('#')) {
        const want = sel.slice(1);
        const visit = (node) => {
          if (node.id === want) return node;
          for (const child of node.children) {
            const hit = visit(child);
            if (hit) return hit;
          }
          return null;
        };
        return visit(document.documentElement);
      }
      if (sel === 'link[data-agentfaehig-ack]') return null;
      return null;
    };
    el.querySelectorAll = (sel) => {
      if (sel === '.pair-entry') {
        const out = [];
        const visit = (node) => {
          if (node.className && node.className.split(/\s+/).includes('pair-entry')) out.push(node);
          for (const child of node.children) visit(child);
        };
        visit(el);
        return out;
      }
      return [];
    };
    Object.defineProperty(el, 'isConnected', {
      get() {
        return el.parentNode !== null;
      },
    });
    el.focus = () => {};
    el.getBoundingClientRect = () => ({ bottom: 100, height: 40, left: 540, top: 80, width: 200 });
    el.ownerDocument = null;
    return el;
  }

  const win = {
    innerWidth: 1280,
    innerHeight: 800,
    getComputedStyle: () => ({ columnGap: '30px', gap: '30px' }),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    setTimeout: (...args) => globalThis.setTimeout(...args),
    clearTimeout: (...args) => globalThis.clearTimeout(...args),
    requestAnimationFrame: (fn) => globalThis.setTimeout(fn, 16),
    cancelAnimationFrame: (id) => globalThis.clearTimeout(id),
    addEventListener() {},
    removeEventListener() {},
  };

  const document = {
    head: wireElement({ tagName: 'HEAD' }),
    documentElement: wireElement({ tagName: 'HTML', style: styleStub() }),
    defaultView: win,
    createElement(tag) {
      return wireElement({ tagName: String(tag).toUpperCase() });
    },
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    getElementById(id) {
      return byId.get(id) ?? null;
    },
  };

  document.head.ownerDocument = document;
  document.documentElement.ownerDocument = document;

  const presence = wireElement({ tagName: 'DIV' });
  presence.id = 'presence';
  presence.setAttribute('id', 'presence');

  const stage = wireElement({ tagName: 'DIV' });
  stage.id = 'stage';
  stage.setAttribute('id', 'stage');

  const form = wireElement({ tagName: 'FORM' });
  form.id = 'composer';
  const input = wireElement({ tagName: 'INPUT' });
  input.id = 'composer-input';
  const pair = wireElement({ tagName: 'DIV' });
  pair.id = 'pair';
  const live = wireElement({ tagName: 'DIV' });
  live.id = 'live';

  form.append(input);
  stage.append(form, pair, live);
  document.documentElement.append(presence, stage);

  presence.querySelector = (selector) => {
    if (selector === '.face-box') {
      return { getBoundingClientRect: () => ({ left: 540, top: 80, width: 200, height: 140 }) };
    }
    if (selector === '.eyes-container') return {};
    if (selector === '#left-eye' || selector === '.left-eye') {
      return { offsetWidth: 100, offsetHeight: 115 };
    }
    if (selector === '#right-eye' || selector === '.right-eye') {
      return { offsetWidth: 100, offsetHeight: 115 };
    }
    return null;
  };
  presence.querySelectorAll = () => [];
  presence.clientWidth = 1248;

  return { document, presence, stage, form, input, pair, live };
}

function readyStore() {
  let state = reduce(initialState, { type: 'AWAKE' });
  state = reduce(state, { type: 'INPUT', value: 'probe' });
  return createStore(state);
}

function submitForm(form, input, value) {
  input.value = value;
  form.dispatchEvent({ type: 'submit', preventDefault() {} });
}

async function waitFor(predicate, { timeoutMs = 15000, intervalMs = 25 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('waitFor: condition not met in time');
}

function intentNames(history) {
  return history.map((entry) => entry.intent);
}

function buildPipeline({ env, agent: agentOverride, reducedMotion = true } = {}) {
  const dom = makeIntegrationDom();
  globalThis.document = dom.document;
  globalThis.location = { origin: ORIGIN, hostname: 'www.xn--agentfhig-02a.de' };

  const store = readyStore();
  const eventBus = createAgentEventBus({ store });

  const presenceApi = mountPresence({
    root: dom.presence,
    store,
    reducedMotion,
  });

  const agent =
    agentOverride ??
    createRemoteAgent({
      endpoint: AGENT_URL,
      timeoutMs: 20000,
      fetchImpl: (url, init) => worker.fetch(new Request(url, init), env, {}),
    });

  const embodiment = mountEmbodiment({
    eventBus,
    store,
    presence: presenceApi,
    stage: dom.stage,
    root: dom.presence,
    reducedMotion,
    minDwellMs: 0,
  });

  const conversation = mountConversation({
    root: dom.stage,
    store,
    agent,
    eventBus,
    reducedMotion,
  });

  function destroy() {
    conversation.destroy();
    embodiment.destroy();
    presenceApi.destroy();
    eventBus.destroy();
  }

  return { store, eventBus, embodiment, dom, destroy };
}

const PROFILE_METRIC_KEYS = [
  'offsetX',
  'offsetY',
  'spreadDelta',
  'scaleMul',
  'pupilDelta',
  'depthBoost',
  'sheenBoost',
  'hazeBoost',
  'ambientMul',
  'damping',
  'lidTopDelta',
];

function profileMetricTuple(name) {
  const p = EMBODIED_INTENT_PROFILES[name];
  assert.ok(p, `missing profile ${name}`);
  return PROFILE_METRIC_KEYS.map((k) => p[k] ?? 0);
}

function l1Distance(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += Math.abs(a[i] - b[i]);
  return s;
}

// AT-01
test('AT-01: 5s delayed LLM — searching and grounded before answer', async () => {
  const env = {
    ASSETS,
    MINIMAX_API_KEY: MINIMAX_KEY,
    AI: {
      run: async (model) => {
        if (model === '@cf/baai/bge-m3') {
          return { data: [[0.1, 0.2, 0.3]] };
        }
        return { response: SAMUEL_ANSWER.replace(/\[\[[^\]]+\]\]/g, '').trim() };
      },
    },
  };

  await withFetch(delayedMiniMaxUpstream(SAMUEL_ANSWER), async () => {
    const { store, embodiment, dom, destroy } = buildPipeline({ env });

    try {
      const t0 = Date.now();
      submitForm(dom.form, dom.input, 'wer ist samuel');

      await new Promise((resolve) => setTimeout(resolve, 150));
      assert.ok(Date.now() - t0 < LLM_DELAY_MS, 'still inside delayed LLM window');

      assert.equal(store.getState().phase, 'thinking');
      assert.equal(store.getState().answer, '');

      const names = intentNames(embodiment.getState().history);
      assert.ok(names.includes('searching'), `expected searching in ${names.join(',')}`);
      assert.ok(
        names.includes('grounded') || names.includes('multi_source'),
        `expected grounded|multi_source in ${names.join(',')}`,
      );

      assert.equal(dom.presence.getAttribute('data-retrieval-coverage'), 'GIVEN');
      assert.equal(dom.stage.getAttribute('data-retrieval-coverage'), 'GIVEN');

      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 20000 });
      assert.ok(store.getState().answer.includes('Samuel'));
    } finally {
      destroy();
    }
  });
});

// AT-02
test('AT-02: NOT_COVERED — uncovered before answer', async () => {
  const env = { ASSETS, MINIMAX_API_KEY: MINIMAX_KEY };

  await withFetch(delayedMiniMaxUpstream('Darüber habe ich keine belegten Quellen.'), async () => {
    const { store, embodiment, dom, eventBus, destroy } = buildPipeline({ env });

    try {
      submitForm(dom.form, dom.input, 'wie wird das wetter morgen auf dem mars');

      await waitFor(() => {
        const names = intentNames(embodiment.getState().history);
        return names.includes('uncovered');
      }, { timeoutMs: 3000 });

      assert.equal(store.getState().phase, 'thinking');
      assert.equal(dom.stage.getAttribute('data-retrieval-coverage'), 'NOT_COVERED');
      assert.equal(dom.presence.getAttribute('data-retrieval-coverage'), 'NOT_COVERED');

      const liveTypes = eventBus.getTimeline().map((e) => e.event.type);
      assert.ok(liveTypes.includes('retrieval.completed'));
      assert.ok(!liveTypes.includes('generation.completed'), 'LLM still pending after NOT_COVERED');

      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 20000 });
    } finally {
      destroy();
    }
  });
});

// AT-03
test('AT-03: technical failure maps to error, not uncovered', () => {
  const errIntent = resolveEmbodiedIntent({
    event: createAgentEvent({ type: 'system.error', metadata: { code: 'providers_unavailable' } }),
    phase: 'error',
  });
  assert.equal(errIntent, 'error');
  assert.notEqual(errIntent, 'uncovered');

  const uncoveredIntent = resolveEmbodiedIntent({
    event: createAgentEvent({
      type: 'retrieval.completed',
      metadata: { coverage: 'NOT_COVERED', hits: 0 },
    }),
    phase: 'thinking',
  });
  assert.equal(uncoveredIntent, 'uncovered');
});

test('AT-03 integration: provider outage ends in error embodiment, not uncovered', async () => {
  await withFetch(async (url) => {
    const target = String(url);
    if (target.includes('minimax')) {
      return new Response('', { status: 429 });
    }
    return new Response('', { status: 500 });
  }, async () => {
    const env = {
      ASSETS,
      MINIMAX_API_KEY: MINIMAX_KEY,
      OPENAI_API_KEY: 'sk-test',
      OPENAI_MODEL: 'model',
      AI: { run: async () => { throw new Error('quota'); } },
    };

    const { store, embodiment, dom, eventBus, destroy } = buildPipeline({ env });

    try {
      submitForm(dom.form, dom.input, 'hallo');

      await waitFor(() => {
        const types = eventBus.getTimeline().map((e) => e.event.type);
        return types.includes('system.error');
      }, { timeoutMs: 12000 });

      const finalIntent = embodiment.getState().intent;
      const hist = intentNames(embodiment.getState().history);
      assert.notEqual(finalIntent, 'uncovered', `final intent should not be uncovered: ${hist.join(',')}`);
      assert.ok(
        finalIntent === 'error' || hist.includes('error') || store.getState().phase === 'error',
        `expected error path, got intent=${finalIntent} phase=${store.getState().phase}`,
      );

      await waitFor(
        () => store.getState().phase === 'idle' || store.getState().phase === 'error',
        { timeoutMs: 5000 },
      );
    } finally {
      destroy();
    }
  });
});

// AT-04
test('AT-04: multiple sequential embodied intents recorded in history', async () => {
  const env = {
    ASSETS,
    MINIMAX_API_KEY: MINIMAX_KEY,
    AI: {
      run: async (model) => {
        if (model === '@cf/baai/bge-m3') {
          return { data: [[0.1, 0.2, 0.3]] };
        }
        return { response: 'ok' };
      },
    },
  };

  await withFetch(delayedMiniMaxUpstream(SAMUEL_ANSWER), async () => {
    const { store, embodiment, dom, destroy } = buildPipeline({ env });

    try {
      submitForm(dom.form, dom.input, 'wer ist samuel');
      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 20000 });

      const names = intentNames(embodiment.getState().history);
      const unique = [...new Set(names)];
      assert.ok(unique.length >= 4, `expected >=4 distinct intents, got ${unique.join(',')}`);

      const searchIdx = names.indexOf('searching');
      const groundedIdx = Math.max(names.indexOf('grounded'), names.indexOf('multi_source'));
      assert.ok(searchIdx >= 0 && groundedIdx > searchIdx, names.join(' → '));
    } finally {
      destroy();
    }
  });
});

// AT-05
test('AT-05: interrupt drops stale turn events from embodiment', async () => {
  let calls = 0;
  let finishTurnOne;
  const agent = {
    respond(prompt, options) {
      calls += 1;
      if (calls === 1) {
        options.onEvent?.({
          action_id: 'r1',
          type: 'retrieval.started',
          turn_id: options.turnId,
        });
        return new Promise((resolve) => {
          finishTurnOne = () => resolve({ text: 'First answer.' });
        });
      }
      return Promise.resolve({ text: 'Second answer.' });
    },
  };

  const { store, embodiment, dom, eventBus, destroy } = buildPipeline({ agent });

  try {
    submitForm(dom.form, dom.input, 'first');
    await waitFor(() => store.getState().turn === 1 && store.getState().phase === 'thinking');
    const histAtTurn1 = intentNames(embodiment.getState().history);
    assert.ok(histAtTurn1.includes('searching'));

    submitForm(dom.form, dom.input, 'second');
    assert.equal(store.getState().turn, 2);
    assert.ok(
      eventBus.getTimeline().some((e) => e.event.type === 'turn.interrupted' && !e.stale),
      'turn.interrupted expected',
    );

    const histAfterInterrupt = intentNames(embodiment.getState().history);
    assert.ok(histAfterInterrupt.includes('interrupted'));

    finishTurnOne?.();
    await new Promise((r) => setTimeout(r, 30));

    const stale = eventBus.emit({
      type: 'retrieval.completed',
      turn_id: 'turn-1',
      action_id: 'retrieval-stale',
      metadata: { coverage: 'NOT_COVERED', hits: 0 },
    });
    assert.equal(stale.stale, true);
    assert.ok(eventBus.getSnapshot().droppedStaleCount >= 1);

    assert.notEqual(embodiment.getState().intent, 'uncovered');
    assert.notEqual(store.getState().embodied.coverage, 'NOT_COVERED');

    await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 5000 });
    assert.ok(!intentNames(embodiment.getState().history).slice(-3).includes('uncovered'));
  } finally {
    destroy();
  }
});

// AT-06
test('AT-06: surfaceStore and world params unchanged after embodiment cycle + reset', async () => {
  const surfaceStore = createSurfaceStore();
  surfaceStore.applyPatch(
    { atmosphere: { visualIntensity: 0.62 } },
    { source: 'test', summary: 'at06-baseline' },
  );
  const snapshotBefore = JSON.stringify({
    state: surfaceStore.getState(),
    legacy: surfaceStore.toLegacyParams(),
    modified: surfaceStore.isModified(),
  });

  const env = {
    ASSETS,
    MINIMAX_API_KEY: MINIMAX_KEY,
    AI: {
      run: async (model) => {
        if (model === '@cf/baai/bge-m3') return { data: [[0.1]] };
        return { response: 'kurz' };
      },
    },
  };

  await withFetch(delayedMiniMaxUpstream('kurz', 100), async () => {
    const { store, embodiment, dom, destroy } = buildPipeline({ env });

    try {
      submitForm(dom.form, dom.input, 'wer ist samuel');
      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 15000 });
      assert.ok(intentNames(embodiment.getState().history).length > 0);

      embodiment.reset();
      assert.equal(embodiment.getState().intent, 'idle');
      assert.equal(embodiment.getState().history.length, 0);
    } finally {
      destroy();
    }
  });

  const snapshotAfter = JSON.stringify({
    state: surfaceStore.getState(),
    legacy: surfaceStore.toLegacyParams(),
    modified: surfaceStore.isModified(),
  });
  assert.equal(snapshotBefore, snapshotAfter);
});

// AT-07
test('AT-07: searching, grounded, uncovered profiles are pairwise distinct', () => {
  const intents = ['searching', 'grounded', 'uncovered'];
  for (let i = 0; i < intents.length; i += 1) {
    for (let j = i + 1; j < intents.length; j += 1) {
      const a = profileMetricTuple(intents[i]);
      const b = profileMetricTuple(intents[j]);
      const dist = l1Distance(a, b);
      assert.ok(dist > 0.15, `${intents[i]} vs ${intents[j]} too similar (L1=${dist})`);
    }
  }
});

test('AT-07: browser harness artifacts present for perceptibility script', () => {
  const harnessPath = join(__dirname, 'embodiment-perceptibility-harness.html');
  const browserPath = join(__dirname, 'embodiment-perceptibility-browser.py');
  const harness = readFileSync(harnessPath, 'utf8');
  const browser = readFileSync(browserPath, 'utf8');
  assert.ok(harness.includes('EMBODIED_INTENT_PROFILES'), 'harness references profiles');
  assert.ok(browser.includes('google-chrome') || browser.includes('chromium'), 'browser runner targets Chrome');
});