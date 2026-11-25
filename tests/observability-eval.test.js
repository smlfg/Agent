import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAgentEventBus } from '../src/state/agent-events.js';
import { createStore, reduce, initialState } from '../src/state/store.js';
import {
  parseObservabilityQuery,
  EVAL_PRESETS,
  runEvalPreset,
  mountObservabilityPanel,
} from '../src/dev/observability-panel.js';

/* ── minimal DOM stub for Node ───────────────────────────────────────────── */

class ClassList {
  constructor(el) {
    this.el = el;
    this._ = new Set();
  }
  add(...names) {
    for (const n of names) this._.add(n);
    this.el.className = [...this._].join(' ');
  }
  remove(...names) {
    for (const n of names) this._.delete(n);
    this.el.className = [...this._].join(' ');
  }
  toggle(name, force) {
    if (force === true) this._.add(name);
    else if (force === false) this._.delete(name);
    else if (this._.has(name)) this._.delete(name);
    else this._.add(name);
    this.el.className = [...this._].join(' ');
  }
  contains(name) {
    return this._.has(name);
  }
}

class ObsElement {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.nodeName = this.tagName;
    this.children = [];
    this.className = '';
    this.classList = new ClassList(this);
    this.hidden = false;
    this._text = '';
    this.innerHTML = '';
    this.id = '';
    this.type = 'button';
    this.dataset = {};
    this.attributes = {};
    this.style = {};
    this.scrollTop = 0;
    this._listeners = {};
    this.parentNode = null;
  }
  get textContent() {
    if (this.children.length === 0) return this._text;
    return this.children.map((c) => c.textContent ?? '').join('');
  }
  set textContent(v) {
    this._text = String(v ?? '');
    this.children = [];
  }
  setAttribute(k, v) {
    this.attributes[k] = v;
    if (k === 'id') this.id = v;
    if (k === 'role') this.role = v;
    if (k === 'aria-label') this.ariaLabel = v;
    if (k === 'aria-selected') this.ariaSelected = v;
  }
  getAttribute(k) {
    return this.attributes[k] ?? null;
  }
  append(...nodes) {
    for (const n of nodes) {
      n.parentNode = this;
      this.children.push(n);
    }
    if (this.children.length) this._text = '';
  }
  appendChild(node) {
    this.append(node);
    return node;
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((c) => c !== this);
      this.parentNode = null;
    }
  }
  replaceChildren() {
    this.children = [];
  }
  querySelector(sel) {
    return walkSelect(this, sel);
  }
  querySelectorAll(sel) {
    const out = [];
    walkAll(this, sel, out);
    return out;
  }
  contains(node) {
    if (node === this) return true;
    for (const ch of this.children) {
      if (ch === node || ch.contains?.(node)) return true;
    }
    return false;
  }
  addEventListener(type, fn) {
    (this._listeners[type] ??= []).push(fn);
  }
  removeEventListener(type, fn) {
    const list = this._listeners[type];
    if (!list) return;
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  }
  dispatchEvent(ev) {
    const list = this._listeners[ev?.type];
    if (list) for (const fn of [...list]) fn(ev);
  }
  prepend(node) {
    node.parentNode = this;
    this.children.unshift(node);
  }
}

function walkAll(node, sel, out) {
  if (matchSel(node, sel)) out.push(node);
  for (const ch of node.children) walkAll(ch, sel, out);
}

function walkSelect(node, sel) {
  if (matchSel(node, sel)) return node;
  for (const ch of node.children) {
    const found = walkSelect(ch, sel);
    if (found) return found;
  }
  return null;
}

function matchSel(node, sel) {
  if (sel.startsWith('[data-obs="')) {
    const key = sel.slice(12, -2);
    return node.getAttribute?.('data-obs') === key;
  }
  if (sel.startsWith('.')) {
    const cls = sel.slice(1);
    if (node.classList?.contains(cls)) return true;
  const parts = String(node.className || '').split(/\s+/).filter(Boolean);
    return parts.includes(cls);
  }
  return false;
}

function installDom() {
  const head = new ObsElement('head');
  const body = new ObsElement('body');
  const doc = {
    head,
    body,
    activeElement: null,
    createElement(tag) {
      return new ObsElement(tag);
    },
    createTextNode(text) {
      return { textContent: text };
    },
    getElementById(id) {
      const found = body.children.find((c) => c.id === id);
      return found ?? null;
    },
    querySelector(sel) {
      if (sel === 'link[data-obs-panel-style]') {
        return head.children.find((c) => c.dataset?.obsPanelStyle !== undefined) ?? null;
      }
      return body.querySelector?.(sel) ?? walkSelect(body, sel);
    },
  };
  body.append = (...nodes) => {
    for (const n of nodes) {
      n.parentNode = body;
      body.children.push(n);
    }
  };
  head.append = (...nodes) => {
    for (const n of nodes) {
      n.parentNode = head;
      head.children.push(n);
    }
  };

  const winListeners = {};
  const win = {
    addEventListener(type, fn) {
      (winListeners[type] ??= []).push(fn);
    },
    removeEventListener(type, fn) {
      const list = winListeners[type];
      if (!list) return;
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    },
    dispatchKey(type, init) {
      const ev = { type, ...init, preventDefault() {} };
      for (const fn of [...(winListeners[type] ?? [])]) fn(ev);
    },
  };

  globalThis.document = doc;
  globalThis.window = win;
  return { doc, win, body };
}

test('EVAL_PRESETS: P01–P09 singles plus acceptance-5s-delay scenario', () => {
  const singles = EVAL_PRESETS.filter((p) => p.group === 'single');
  const scenarios = EVAL_PRESETS.filter((p) => p.group === 'scenario');
  assert.equal(singles.length, 9);
  assert.equal(scenarios.length, 1);
  assert.equal(scenarios[0].id, 'acceptance-5s-delay');
  for (let i = 1; i <= 9; i += 1) {
    const id = `P${String(i).padStart(2, '0')}`;
    assert.ok(singles.some((p) => p.id === id), `missing preset ${id}`);
  }
});

test('parseObservabilityQuery', () => {
  assert.deepEqual(parseObservabilityQuery(''), {
    devOpen: false,
    evalOpen: false,
    initialTab: 'observe',
  });
  assert.deepEqual(parseObservabilityQuery('?dev=1'), {
    devOpen: true,
    evalOpen: false,
    initialTab: 'observe',
  });
  assert.deepEqual(parseObservabilityQuery('?eval=1'), {
    devOpen: false,
    evalOpen: true,
    initialTab: 'evaluate',
  });
  assert.deepEqual(parseObservabilityQuery('?debug=1'), {
    devOpen: true,
    evalOpen: false,
    initialTab: 'observe',
  });
  assert.deepEqual(parseObservabilityQuery('?dev'), {
    devOpen: true,
    evalOpen: false,
    initialTab: 'observe',
  });
});

test('normal visitor: panel and sim badge stay hidden until opened', () => {
  const { body } = installDom();
  const bus = createAgentEventBus({ now: () => 1000 });
  const stage = new ObsElement('main');
  body.append(stage);

  const panel = mountObservabilityPanel({
    stage,
    eventBus: bus,
    search: '',
    embodiment: { getState: () => ({ intent: 'idle', eyeState: 'rest' }) },
  });

  assert.equal(panel.isOpen(), false);
  assert.equal(panel.element.hidden, true);
  assert.equal(panel.simBadge.hidden, true);

  panel.destroy();
  bus.destroy();
});

test('live observability updates from event bus', () => {
  const { body } = installDom();
  const store = createStore(reduce(initialState, { type: 'AWAKE' }));
  const bus = createAgentEventBus({ store, now: () => 1000 });
  const stage = new ObsElement('main');
  body.append(stage);

  store.dispatch({ type: 'SUBMIT', prompt: 'q' });
  const panel = mountObservabilityPanel({
    stage,
    eventBus: bus,
    store,
    search: '?dev=1',
    embodiment: {
      getState: () => ({
        intent: 'searching',
        activeProfile: 'searching',
        eyeState: 'avert',
        parallelCount: 1,
        reactionLatencyMs: 87,
      }),
    },
    presence: { getState: () => ({ state: 'thinking' }) },
  });

  assert.equal(panel.isOpen(), true);
  assert.match(panel.element.textContent, /Active Profile/);
  assert.match(panel.element.textContent, /searching/);
  assert.match(panel.element.textContent, /87 ms/);

  bus.emit({ type: 'retrieval.started', action_id: 'r-live' });
  bus.emit({
    type: 'retrieval.completed',
    action_id: 'r-live',
    metadata: { coverage: 'GIVEN', hits: 5, multi_source: true },
  });
  bus.emit({
    type: 'provider.switched',
    action_id: 'p-sw',
    metadata: { from: 'minimax', to: 'openrouter' },
  });
  bus.emit({
    type: 'tool.failed',
    action_id: 't-f',
    metadata: { tool: 'verify', reason: 'err' },
  });

  const timelineText = panel.element.querySelector('.obs-timeline').children
    .map((row) => row.textContent)
    .join('\n');
  assert.match(timelineText, /retrieval\.started/);
  assert.match(timelineText, /retrieval\.completed/);
  assert.match(timelineText, /provider\.switched/);
  assert.match(timelineText, /tool\.failed/);

  const panelText = panel.element.textContent;
  assert.match(panelText, /GIVEN/);
  assert.match(panelText, /hits=5/);

  store.dispatch({ type: 'SUBMIT', prompt: 'q2' });
  const stale = bus.emit({
    type: 'retrieval.completed',
    turn_id: 'turn-1',
    action_id: 'stale-r',
    metadata: { coverage: 'GIVEN' },
  });
  assert.equal(stale.stale, true);
  assert.equal(bus.getSnapshot().droppedStaleCount, 1);

  const staleRow = panel.element.querySelector('.obs-timeline').children.map((row) => row.textContent);
  assert.ok(staleRow.some((t) => t.includes('STALE')));
  assert.match(panel.element.textContent, /\[STALE\]/);

  panel.destroy();
  bus.destroy();
});

test('runEvalPreset: all presets emit simulated events; stop resets cleanly', async () => {
  installDom();
  const bus = createAgentEventBus({ now: () => 2000 });
  const stage = new ObsElement('main');
  document.body.append(stage);

  const panel = mountObservabilityPanel({
    stage,
    eventBus: bus,
    search: '?eval=1',
    embodiment: { getState: () => ({ intent: 'sim', eyeState: 'open' }) },
  });

  assert.equal(panel.isOpen(), true);
  assert.equal(panel.getActiveTab(), 'evaluate');

  const collected = [];

  for (const preset of EVAL_PRESETS) {
    const emitted = [];
    const unsub = bus.subscribe((event) => {
      emitted.push(event);
      collected.push(event);
    });

    const runPromise = panel.triggerPreset(preset.id, { speedScale: 0.002 });

    await new Promise((r) => setTimeout(r, 0));
    assert.equal(panel.simBadge.hidden, false, `sim badge visible during ${preset.id}`);

    const result = await runPromise;

    const allEmitted = emitted.length ? emitted : collected.slice(-result.emittedTypes.length);
    for (const ev of allEmitted) {
      assert.equal(ev.simulated, true, `${preset.id}: ${ev.type} must be simulated`);
    }
    assert.ok(result);
    assert.equal(result.presetId, preset.id);
    assert.ok(result.emittedTypes.length > 0);

    const timelineSim = panel.element.querySelector('.obs-timeline').children
      .map((row) => row.textContent);
    assert.ok(
      timelineSim.some((t) => t.includes('[SIM]')),
      `timeline shows SIM for ${preset.id}`,
    );

    unsub();
    bus.clearTimeline();
  }

  assert.ok(collected.length > 0);
  assert.ok(collected.every((ev) => ev.simulated === true));

  panel.triggerPreset('acceptance-5s-delay', { speedScale: 0.002 });
  await new Promise((r) => setTimeout(r, 5));
  const stopBtn = panel.element.querySelector('.obs-stop-btn');
  stopBtn.dispatchEvent({ type: 'click' });

  assert.equal(panel.simBadge.hidden, true, 'stop hides sim badge');
  assert.equal(panel.element.querySelector('.obs-timeline').children.length, 0);

  panel.destroy();
  bus.destroy();
});

test('runEvalPreset throws on unknown preset', async () => {
  const bus = createAgentEventBus();
  await assert.rejects(() => runEvalPreset('no-such-preset', { eventBus: bus }), RangeError);
  bus.destroy();
});