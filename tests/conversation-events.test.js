import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mountConversation } from '../src/conversation/conversation.js';
import { createStore, initialState, reduce } from '../src/state/store.js';

function makeDom() {
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
        if (force === true || (!set.has(name) && force !== false)) {
          set.add(name);
        } else {
          set.delete(name);
        }
        el.className = [...set].join(' ');
      },
    };
  }

  function createElement(tag) {
    const el = {
      tagName: String(tag).toUpperCase(),
      id: '',
      className: '',
      classList: null,
      children: [],
      parentNode: null,
      attributes: {},
      dataset: {},
      style: {},
      textContent: '',
      innerHTML: '',
      value: '',
      _listeners: Object.create(null),
      ownerDocument: null,
      replaceChildren(...nodes) {
        this.children = [];
        for (const n of nodes) this.append(n);
      },
      append(...nodes) {
        for (const n of nodes) {
          n.parentNode = this;
          this.children.push(n);
        }
      },
      removeChild(node) {
        const i = this.children.indexOf(node);
        if (i >= 0) this.children.splice(i, 1);
        node.parentNode = null;
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
        if (name === 'id') {
          this.id = value;
          byId.set(value, this);
        }
      },
      getAttribute(name) {
        return this.attributes[name] ?? null;
      },
      addEventListener(type, fn) {
        (this._listeners[type] ??= []).push(fn);
      },
      removeEventListener(type, fn) {
        const list = this._listeners[type];
        if (!list) return;
        const i = list.indexOf(fn);
        if (i >= 0) list.splice(i, 1);
      },
      dispatchEvent(event) {
        const list = this._listeners[event.type];
        if (!list) return;
        for (const fn of [...list]) fn(event);
      },
      querySelector(sel) {
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
      },
      querySelectorAll(sel) {
        if (sel === '.pair-entry') {
          const out = [];
          const visit = (node) => {
            if (node.className && node.className.split(/\s+/).includes('pair-entry')) out.push(node);
            for (const child of node.children) visit(child);
          };
          visit(this);
          return out;
        }
        return [];
      },
      get isConnected() {
        return this.parentNode !== null;
      },
      focus() {},
      getBoundingClientRect() {
        return { bottom: 100, height: 40 };
      },
    };
    el.classList = classListOf(el);
    return el;
  }

  const document = {
    createElement,
    head: createElement('head'),
    documentElement: createElement('html'),
    defaultView: { innerWidth: 800, innerHeight: 600 },
    dispatchEvent() {},
    querySelector() {
      return null;
    },
    getElementById(id) {
      return byId.get(id) ?? null;
    },
  };

  for (const el of [document.head, document.documentElement]) {
    el.ownerDocument = document;
  }

  const form = createElement('form');
  form.id = 'composer';
  const input = createElement('input');
  input.id = 'composer-input';
  const pair = createElement('div');
  pair.id = 'pair';
  const live = createElement('motiondiv');
  live.id = 'live';
  const root = createElement('motiondiv');
  root.id = 'stage';

  form.append(input);
  root.append(form, pair, live);
  document.documentElement.append(root);

  return { document, root, form, input, pair, live };
}

function readyStore() {
  let state = reduce(initialState, { type: 'AWAKE' });
  state = reduce(state, { type: 'INPUT', value: 'x' });
  return createStore(state);
}

function submitForm(form, input, value) {
  input.value = value;
  form.dispatchEvent({ type: 'submit', preventDefault() {} });
}

test('onEvent forwards retrieval events before agent.respond resolves', async () => {
  const dom = makeDom();
  globalThis.document = dom.document;

  const emissions = [];
  const eventBus = { emit: (ev) => emissions.push(ev) };

  let resolveSlow;
  const slowAgent = {
    respond(prompt, options) {
      assert.equal(typeof options.onEvent, 'function');
      assert.equal(options.turnId, 'turn-1');
      options.onEvent({
        action_id: 'retrieval-001',
        type: 'retrieval.started',
        status: 'started',
      });
      options.onEvent({
        action_id: 'retrieval-001',
        type: 'retrieval.completed',
        status: 'success',
        metadata: { coverage: 'GIVEN' },
      });
      return new Promise((resolve) => {
        resolveSlow = () => resolve({ text: 'Done.' });
      });
    },
  };

  const store = readyStore();
  const ui = mountConversation({
    root: dom.root,
    store,
    agent: slowAgent,
    eventBus,
    reducedMotion: true,
  });

  submitForm(dom.form, dom.input, 'hello');

  const started = emissions.find((e) => e.type === 'retrieval.started');
  const completed = emissions.find((e) => e.type === 'retrieval.completed');
  assert.ok(started, 'retrieval.started emitted while respond is pending');
  assert.ok(completed, 'retrieval.completed emitted while respond is pending');
  assert.equal(started.turn_id, 'turn-1');
  assert.equal(completed.turn_id, 'turn-1');
  assert.equal(completed.metadata.coverage, 'GIVEN');

  resolveSlow();
  await new Promise((r) => setTimeout(r, 0));
  ui.destroy();
});

test('stale onEvent from an interrupted turn is not forwarded to eventBus', async () => {
  const dom = makeDom();
  globalThis.document = dom.document;

  const emissions = [];
  const eventBus = { emit: (ev) => emissions.push(ev) };

  let turnOneOnEvent;
  let finishTurnOne;
  let turn = 0;
  const agent = {
    respond(prompt, options) {
      turn += 1;
      if (turn === 1) {
        turnOneOnEvent = options.onEvent;
        return new Promise((resolve) => {
          finishTurnOne = () => resolve({ text: 'First answer.' });
        });
      }
      return Promise.resolve({ text: 'Second.' });
    },
  };

  const store = readyStore();
  const ui = mountConversation({
    root: dom.root,
    store,
    agent,
    eventBus,
    reducedMotion: true,
  });

  submitForm(dom.form, dom.input, 'first');
  assert.equal(store.getState().turn, 1);
  assert.equal(store.getState().phase, 'thinking');

  submitForm(dom.form, dom.input, 'second');
  assert.equal(store.getState().turn, 2);
  assert.ok(emissions.some((e) => e.type === 'turn.interrupted' && e.turn_id === 'turn-1'));

  const countBeforeStale = emissions.length;
  turnOneOnEvent({
    action_id: 'retrieval-stale',
    type: 'retrieval.started',
    status: 'started',
  });
  assert.equal(emissions.length, countBeforeStale, 'stale retrieval.started ignored');

  finishTurnOne?.();
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(
    !emissions.some((e) => e.action_id === 'retrieval-stale'),
    'no stale forwarding after late resolve',
  );
  ui.destroy();
});