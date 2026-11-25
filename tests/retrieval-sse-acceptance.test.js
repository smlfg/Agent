// End-to-end: Worker SSE → remoteAgent → conversation → event bus → embodiment.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import worker from '../deploy/agentfaehig-site/src/worker.js';
import { createRemoteAgent } from '../src/agent/remoteAgent.js';
import { mountConversation } from '../src/conversation/conversation.js';
import { createAgentEventBus } from '../src/state/agent-events.js';
import { createStore, initialState, reduce } from '../src/state/store.js';
import { mountPresence } from '../src/presence/presence.js';
import { mountEmbodiment } from '../src/presence/embodiment.js';

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

function buildPipeline({
  env,
  reducedMotion = true,
} = {}) {
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

  const agent = createRemoteAgent({
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

test('mandatory 5s delayed LLM: retrieval SSE and embodiment precede answer', async () => {
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

      const hist = embodiment.getState().history;
      const names = intentNames(hist);
      assert.ok(names.includes('searching'), `expected searching in ${names.join(',')}`);
      assert.ok(
        names.includes('grounded') || names.includes('multi_source'),
        `expected grounded|multi_source in ${names.join(',')}`,
      );

      assert.equal(dom.presence.getAttribute('data-retrieval-coverage'), 'GIVEN');
      assert.equal(dom.stage.getAttribute('data-retrieval-coverage'), 'GIVEN');

      const intent = dom.presence.dataset.agentIntent;
      assert.ok(
        intent === 'grounded'
          || intent === 'multi_source'
          || intent === 'concentrating'
          || intent === 'switching',
        `unexpected data-agent-intent before LLM completion: ${intent}`,
      );
      assert.equal(dom.stage.dataset.agentIntent, intent);

      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 20000 });

      const answer = store.getState().answer;
      assert.ok(answer.includes('Samuel'), `answer missing Samuel: ${answer}`);
      assert.equal(store.getState().phase, 'idle');
    } finally {
      destroy();
    }
  });
});

test('NOT_COVERED: mars weather shows uncovered retrieval before LLM', async () => {
  const env = {
    ASSETS,
    MINIMAX_API_KEY: MINIMAX_KEY,
  };

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
      assert.ok(
        embodiment.getState().history.some((e) => e.intent === 'uncovered'),
        'uncovered intent missing from embodiment history',
      );

      const liveTypes = eventBus.getTimeline().map((e) => e.event.type);
      const retrievalDone = liveTypes.includes('retrieval.completed');
      const generationDone = liveTypes.includes('generation.completed');
      assert.ok(retrievalDone, 'retrieval.completed expected');
      assert.ok(!generationDone, 'LLM should still be pending after NOT_COVERED slice');

      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 20000 });
    } finally {
      destroy();
    }
  });
});

test('embedding.timeout: live SSE then BM25 retrieval still completes', async () => {
  const env = {
    ASSETS,
    MINIMAX_API_KEY: MINIMAX_KEY,
    AI: {
      run: async (model) => {
        if (model === '@cf/baai/bge-m3') {
          const err = new Error('timed out after 1500ms');
          err.name = 'TimeoutError';
          throw err;
        }
        return { response: 'Antwort nach BM25-Fallback.' };
      },
    },
  };

  await withFetch(delayedMiniMaxUpstream('Samuel baut HAI.'), async () => {
    const { store, embodiment, eventBus, dom, destroy } = buildPipeline({ env });

    try {
      submitForm(dom.form, dom.input, 'wer ist samuel');

      await waitFor(() => {
        const types = eventBus.getTimeline().map((e) => e.event.type);
        return types.includes('embedding.timeout');
      }, { timeoutMs: 4000 });

      const types = eventBus.getTimeline().map((e) => e.event.type);
      assert.ok(types.includes('embedding.started'));
      const timeoutEv = eventBus.getTimeline().find((e) => e.event.type === 'embedding.timeout');
      assert.ok(timeoutEv);
      assert.equal(timeoutEv.event.metadata?.fallback, 'bm25');
      assert.ok(!types.includes('generation.completed'), 'LLM still pending when embedding.timeout observed');

      await waitFor(() => types.includes('retrieval.completed') || eventBus.getTimeline().some(
        (e) => e.event.type === 'retrieval.completed',
      ), { timeoutMs: 3000 });

      const retrievalEv = eventBus.getTimeline().find((e) => e.event.type === 'retrieval.completed');
      assert.ok(retrievalEv);
      assert.equal(retrievalEv.event.metadata?.coverage, 'GIVEN');
      assert.ok(
        embodiment.getState().history.some((e) => e.intent === 'degraded' || e.intent === 'searching'),
        'embodiment should reflect embedding timeout or search path',
      );

      await waitFor(() => store.getState().phase === 'idle', { timeoutMs: 20000 });
      assert.ok(store.getState().answer.length > 0);
    } finally {
      destroy();
    }
  });
});