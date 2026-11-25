// DEVELOPMENT ONLY — embodied agent observability & visual evaluation (ADR-0008).

const STYLE_HREF = new URL('../styles/observability-panel.css', import.meta.url).href;

let simSeq = 0;

function toParams(search) {
  if (search instanceof URLSearchParams) return search;
  const raw = typeof search === 'string' ? search.replace(/^\?/, '') : '';
  return new URLSearchParams(raw);
}

function flagOpen(params, key) {
  if (!params.has(key)) return false;
  const val = params.get(key);
  return val === null || val === '' || val === '1' || val === 'true';
}

export function parseObservabilityQuery(search) {
  const params = toParams(search);
  const devOpen = flagOpen(params, 'dev') || flagOpen(params, 'debug');
  const evalOpen = flagOpen(params, 'eval');
  let initialTab = 'observe';
  if (evalOpen) initialTab = 'evaluate';
  else if (devOpen) initialTab = 'observe';
  return { devOpen, evalOpen, initialTab };
}

function sleepMs(ms, signal) {
  if (!ms || ms <= 0) return Promise.resolve();
  if (!signal) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' }));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function ensureStyle(doc) {
  if (!doc?.head) return;
  if (doc.querySelector('link[data-obs-panel-style]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLE_HREF;
  link.dataset.obsPanelStyle = '';
  doc.head.append(link);
}

function metaPills(metadata) {
  if (!metadata || typeof metadata !== 'object') return '';
  const parts = [];
  for (const [k, v] of Object.entries(metadata)) {
    if (v === undefined) continue;
    const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
    parts.push(`${k}=${val}`);
  }
  return parts.join(' ');
}

/** Single embodied states for visual evaluation (P01–P09). */
const SINGLE_PRESETS = [
  {
    id: 'P01',
    label: 'P01 · Orienting',
    kind: 'state',
    group: 'single',
    steps: [{ delayMs: 0, events: [{ type: 'turn.received' }] }],
  },
  {
    id: 'P02',
    label: 'P02 · Searching',
    kind: 'state',
    group: 'single',
    steps: [{ delayMs: 0, events: [{ type: 'retrieval.started', action_id: 'retrieval-search' }] }],
  },
  {
    id: 'P03',
    label: 'P03 · Grounded Hit',
    kind: 'state',
    group: 'single',
    steps: [
      {
        delayMs: 0,
        events: [
          {
            type: 'retrieval.completed',
            action_id: 'retrieval-hit',
            metadata: { coverage: 'GIVEN', hits: 1, multi_source: false },
          },
        ],
      },
    ],
  },
  {
    id: 'P04',
    label: 'P04 · Multi-Source',
    kind: 'state',
    group: 'single',
    steps: [
      {
        delayMs: 0,
        events: [
          {
            type: 'retrieval.completed',
            action_id: 'retrieval-multi',
            metadata: { coverage: 'GIVEN', hits: 5, multi_source: true },
          },
        ],
      },
    ],
  },
  {
    id: 'P05',
    label: 'P05 · Uncovered',
    kind: 'state',
    group: 'single',
    steps: [
      {
        delayMs: 0,
        events: [
          {
            type: 'retrieval.completed',
            action_id: 'retrieval-miss',
            metadata: { coverage: 'NOT_COVERED', hits: 0 },
          },
        ],
      },
    ],
  },
  {
    id: 'P06',
    label: 'P06 · Degraded Search',
    kind: 'state',
    group: 'single',
    steps: [{ delayMs: 0, events: [{ type: 'embedding.timeout', action_id: 'embed-timeout' }] }],
  },
  {
    id: 'P07',
    label: 'P07 · Concentrating',
    kind: 'state',
    group: 'single',
    steps: [
      {
        delayMs: 0,
        events: [{ type: 'generation.started', action_id: 'gen-1', metadata: { provider: 'minimax' } }],
      },
    ],
  },
  {
    id: 'P08',
    label: 'P08 · Streaming',
    kind: 'state',
    group: 'single',
    steps: [
      {
        delayMs: 0,
        events: [{ type: 'response.streaming', action_id: 'stream-1', metadata: { clause: 1, progress: 0.55 } }],
      },
    ],
  },
  {
    id: 'P09',
    label: 'P09 · Completing',
    kind: 'state',
    group: 'single',
    steps: [
      { delayMs: 0, events: [{ type: 'response.completed', action_id: 'resp-done' }] },
      { delayMs: 40, events: [{ type: 'turn.waiting' }] },
    ],
  },
];

const SCENARIO_PRESETS = [
  {
    id: 'acceptance-5s-delay',
    label: '5s Delayed LLM Acceptance',
    kind: 'scenario',
    group: 'scenario',
    highlight: true,
    steps: [
      {
        delayMs: 0,
        events: [
          { type: 'turn.received' },
          { type: 'retrieval.started', action_id: 'retrieval-acc' },
        ],
      },
      {
        delayMs: 320,
        events: [
          { type: 'embedding.completed', action_id: 'embed-acc' },
          {
            type: 'retrieval.completed',
            action_id: 'retrieval-acc',
            metadata: { coverage: 'GIVEN', hits: 4, multi_source: true },
          },
        ],
      },
      {
        delayMs: 80,
        events: [{ type: 'generation.started', action_id: 'gen-acc', metadata: { provider: 'minimax' } }],
      },
      {
        delayMs: 5000,
        events: [
          { type: 'generation.completed', action_id: 'gen-acc' },
          { type: 'response.streaming', action_id: 'stream-acc', metadata: { progress: 0.5 } },
          { type: 'response.completed', action_id: 'stream-acc' },
          { type: 'turn.waiting' },
        ],
      },
    ],
  },
];

export const EVAL_PRESETS = Object.freeze([...SINGLE_PRESETS, ...SCENARIO_PRESETS]);

const PRESET_BY_ID = new Map(EVAL_PRESETS.map((p) => [p.id, p]));

export async function runEvalPreset(presetId, { eventBus, store = null, speedScale = 1, signal = null } = {}) {
  const preset = PRESET_BY_ID.get(presetId);
  if (!preset) throw new RangeError(`Unknown eval preset: ${presetId}`);

  if (!eventBus?.startTurn || !eventBus?.emit) {
    throw new TypeError('runEvalPreset requires an eventBus with startTurn and emit');
  }

  const scale = Number.isFinite(speedScale) && speedScale > 0 ? speedScale : 1;
  const simTurnId = eventBus.startTurn(`turn-900${++simSeq}`, { simulated: true });
  const emittedTypes = [];

  for (const step of preset.steps) {
    await sleepMs((step.delayMs ?? 0) * scale, signal);

    for (const partial of step.events) {
      const result = eventBus.emit({ ...partial, simulated: true });
      if (result?.event?.type) emittedTypes.push(result.event.type);
    }
  }

  return { presetId, turnId: simTurnId, emittedTypes };
}

function statusBadgeClass(status) {
  if (status === 'success' || status === 'started' || status === 'running') return 'obs-badge-ok';
  if (status === 'warning' || status === 'timeout') return 'obs-badge-warn';
  if (status === 'error' || status === 'cancelled') return 'obs-badge-err';
  if (status === 'empty') return 'obs-badge-empty';
  return '';
}

function formatCoverageBadge(coverage) {
  if (coverage === 'GIVEN') return '[OK] GIVEN';
  if (coverage === 'NOT_COVERED') return '[EMPTY] NOT_COVERED';
  return '[—]';
}

export function mountObservabilityPanel({
  root = null,
  stage = null,
  eventBus,
  store = null,
  embodiment = null,
  presence = null,
  search = '',
} = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const win = typeof window !== 'undefined' ? window : null;
  if (!doc || !eventBus) {
    return {
      open() {},
      close() {},
      toggle() {},
      triggerPreset() {
        return Promise.resolve();
      },
      isOpen: () => false,
      getActiveTab: () => 'observe',
      element: null,
      simBadge: null,
      destroy() {},
    };
  }

  const host = stage ?? root ?? doc.body;
  const query = parseObservabilityQuery(search);

  const panel = el(
    'aside',
    'obs-panel',
    undefined,
  );
  panel.id = 'agent-observability';
  panel.setAttribute('aria-label', 'Agent observability and visual evaluation');
  panel.hidden = true;

  let simBadge = doc.getElementById('sim-badge');
  if (!simBadge) {
    simBadge = el('p', 'sim-badge', 'SIMULATED · EVAL MODE');
    simBadge.id = 'sim-badge';
    simBadge.hidden = true;
    host.append(simBadge);
  }

  const head = el('div', 'obs-head');
  const title = el('span', 'obs-title', 'OBS · EMBODIED STATE');
  const tabs = el('div', 'obs-tabs');
  const tabObserve = el('button', 'obs-tab', 'Observe');
  tabObserve.type = 'button';
  tabObserve.dataset.tab = 'observe';
  tabObserve.setAttribute('role', 'tab');
  const tabEvaluate = el('button', 'obs-tab', 'Evaluate');
  tabEvaluate.type = 'button';
  tabEvaluate.dataset.tab = 'evaluate';
  tabEvaluate.setAttribute('role', 'tab');
  tabs.append(tabObserve, tabEvaluate);
  const closeBtn = el('button', 'obs-close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close observability panel');
  head.append(title, tabs, closeBtn);

  const body = el('div', 'obs-body');

  const paneObserve = el('div', 'obs-pane obs-pane-observe');
  paneObserve.append(el('p', 'obs-sim-banner', '[SIMULATED · EVAL MODE — NO LIVE LLM]'));

  function obsCard(label, key, initial = '—') {
    const card = el('div', 'obs-card');
    card.append(el('div', 'obs-card-label', label));
    const val = el('div', 'obs-card-value', initial);
    val.setAttribute('data-obs', key);
    card.append(val);
    return { card, val };
  }

  const cards = el('div', 'obs-cards');
  const cardVisual = obsCard('Visual State', 'visual');
  const cardActions = obsCard('Active Actions', 'actions', 'Idle');
  const cardRetrieval = obsCard('Retrieval', 'retrieval');
  const cardProvider = obsCard('Provider / Tools', 'provider');
  const cardStale = obsCard('Stale Guard', 'stale', '[OK] 0 dropped');
  const cardProfile = obsCard('Active Profile', 'profile');
  const cardReaction = obsCard('Reaction Latency', 'reaction', '—');
  const cardEls = {
    visual: cardVisual.val,
    actions: cardActions.val,
    retrieval: cardRetrieval.val,
    provider: cardProvider.val,
    stale: cardStale.val,
    profile: cardProfile.val,
    reaction: cardReaction.val,
  };
  cards.append(
    cardVisual.card,
    cardActions.card,
    cardRetrieval.card,
    cardProvider.card,
    cardStale.card,
    cardProfile.card,
    cardReaction.card,
  );

  const timelineHead = el('div', 'obs-timeline-head');
  timelineHead.append(el('span', 'obs-timeline-title', 'Event timeline'));
  const clearBtn = el('button', 'obs-clear', 'Clear');
  clearBtn.type = 'button';
  timelineHead.append(clearBtn);
  const timeline = el('div', 'obs-timeline');
  timeline.setAttribute('role', 'log');

  paneObserve.append(cards, timelineHead, timeline);

  const paneEvaluate = el('div', 'obs-pane obs-pane-evaluate');
  paneEvaluate.append(
    el(
      'p',
      'obs-eval-notice',
      'SIMULATED EVENTS — Evaluates surface embodiment without calling any live LLM.',
    ),
  );
  const evalGroups = el('div', 'obs-eval-groups');
  const singleGroup = el('div', 'obs-eval-group');
  singleGroup.append(el('p', 'obs-eval-group-title', 'Single States (P01–P09)'));
  const singleButtons = el('div', 'obs-eval-buttons');
  const scenarioGroup = el('div', 'obs-eval-group');
  scenarioGroup.append(el('p', 'obs-eval-group-title', 'Timed Scenarios'));
  const scenarioButtons = el('div', 'obs-eval-buttons');

  for (const preset of EVAL_PRESETS) {
    const btn = el('button', 'obs-preset-btn', preset.label);
    btn.type = 'button';
    btn.dataset.presetId = preset.id;
    if (preset.highlight) btn.classList.add('is-highlight');
    if (preset.group === 'scenario') scenarioButtons.append(btn);
    else singleButtons.append(btn);
  }

  singleGroup.append(singleButtons);
  scenarioGroup.append(scenarioButtons);
  evalGroups.append(singleGroup, scenarioGroup);

  const stopBtn = el('button', 'obs-stop-btn', 'Stop / Reset to Idle');
  stopBtn.type = 'button';
  paneEvaluate.append(evalGroups, stopBtn);

  body.append(paneObserve, paneEvaluate);
  const keyhint = el('p', 'obs-keyhint', 'Alt+Shift+D observe · Alt+Shift+E evaluate · Esc close');
  panel.append(head, body, keyhint);
  doc.body.append(panel);

  let activeTab = 'observe';
  let openState = false;
  let simController = null;
  let simRunning = false;

  let toolCalls = 0;
  let toolRetries = 0;
  let providerSwitches = 0;
  let lastHits = null;
  let lastMulti = null;

  function setSimUi(active) {
    if (active) {
      simBadge.hidden = false;
      panel.classList.add('is-sim-active');
    } else {
      simBadge.hidden = true;
      panel.classList.remove('is-sim-active');
    }
  }

  function renderTimeline() {
    timeline.replaceChildren();
    const entries = eventBus.getTimeline?.() ?? [];
    for (const entry of entries) {
      const ev = entry.event;
      const row = el('div', 'obs-timeline-row');
      const badges = [];
      if (ev.simulated) badges.push(el('span', 'obs-badge obs-badge-sim', '[SIM]'));
      if (entry.stale) badges.push(el('span', 'obs-badge obs-badge-stale', '[STALE DROPPED]'));
      const statusCls = statusBadgeClass(ev.status);
      if (statusCls) badges.push(el('span', `obs-badge ${statusCls}`, `[${String(ev.status).toUpperCase()}]`));

      const line = el(
        'span',
        '',
        `+${ev.timestamp}ms ${ev.type} id=${ev.action_id}${ev.duration_ms != null ? ` dur=${ev.duration_ms}ms` : ''}`,
      );
      row.append(...badges, line);
      const pills = metaPills(ev.metadata);
      if (pills) {
        const pill = el('span', 'obs-meta-pill', pills);
        row.append(pill);
      }
      timeline.append(row);
    }
    timeline.scrollTop = timeline.scrollHeight;
  }

  function renderCards(snap) {
    const visualEl = cardEls.visual;
    const actionsEl = cardEls.actions;
    const retrievalEl = cardEls.retrieval;
    const providerEl = cardEls.provider;
    const staleEl = cardEls.stale;

    const emb = embodiment?.getState?.() ?? {};
    const pres = presence?.getState?.() ?? {};
    const intent = emb.intent ?? '—';
    const eye = emb.eyeState ?? emb.eye ?? pres.state ?? '—';
    const parallel = snap?.parallelCount ?? emb.parallelCount ?? 0;
    visualEl.textContent = `intent=${intent} · eyes=${eye} · parallel=${parallel}`;

    const activeProfile = emb.activeProfile ?? emb.intent ?? '—';
    cardEls.profile.textContent = activeProfile;

    const reactionMs = emb.reactionLatencyMs;
    cardEls.reaction.textContent =
      Number.isFinite(reactionMs) ? `${Math.round(reactionMs)} ms` : '—';

    const actions = snap?.activeActions ?? [];
    if (!actions.length) {
      actionsEl.textContent = 'Idle';
    } else {
      actionsEl.textContent = actions
        .map((a) => `${a.action_id} ${a.type}${a.metadata?.tool ? ` tool=${a.metadata.tool}` : ''}${a.metadata?.provider ? ` prov=${a.metadata.provider}` : ''}`)
        .join(' | ');
    }

    const cov = snap?.lastCoverage ?? '—';
    retrievalEl.textContent = `${formatCoverageBadge(cov)} hits=${lastHits ?? '—'} multi=${lastMulti ?? '—'}`;

    const prov = snap?.lastProvider ?? '—';
    providerEl.textContent = `provider=${prov} · switches=${providerSwitches} · tools=${toolCalls} · retries=${toolRetries}`;

    const dropped = snap?.droppedStaleCount ?? 0;
    staleEl.textContent = dropped > 0 ? `[STALE] ${dropped} dropped` : `[OK] ${dropped} dropped`;
  }

  function onBusEvent(event, snap, meta) {
    if (event.type === 'tool.started') toolCalls += 1;
    if (event.type === 'tool.retry') toolRetries += 1;
    if (event.type === 'provider.switched') providerSwitches += 1;
    if (event.type === 'retrieval.completed') {
      lastHits = event.metadata?.hits ?? lastHits;
      lastMulti = event.metadata?.multi_source ?? lastMulti;
    }
    if (event.simulated || snap?.simulatedActive) setSimUi(true);
    renderCards(snap);
    renderTimeline();
  }

  const unsubBus = eventBus.subscribe?.(onBusEvent) ?? (() => {});

  function syncTabs() {
    tabObserve.setAttribute('aria-selected', String(activeTab === 'observe'));
    tabEvaluate.setAttribute('aria-selected', String(activeTab === 'evaluate'));
    paneObserve.classList.toggle('is-active', activeTab === 'observe');
    paneEvaluate.classList.toggle('is-active', activeTab === 'evaluate');
  }

  function open(tab = activeTab) {
    ensureStyle(doc);
    activeTab = tab === 'evaluate' ? 'evaluate' : 'observe';
    syncTabs();
    panel.hidden = false;
    openState = true;
    renderCards(eventBus.getSnapshot?.() ?? {});
    renderTimeline();
  }

  function close() {
    panel.hidden = true;
    openState = false;
  }

  function toggle(tab) {
    if (openState && (!tab || tab === activeTab)) {
      close();
      return;
    }
    open(tab ?? activeTab);
  }

  function stopSimulation() {
    if (simController) {
      simController.abort();
      simController = null;
    }
    simRunning = false;
    eventBus.clearTimeline?.();
    eventBus.reset?.();
    toolCalls = 0;
    toolRetries = 0;
    providerSwitches = 0;
    lastHits = null;
    lastMulti = null;
    setSimUi(false);
    renderCards(eventBus.getSnapshot?.() ?? {});
    renderTimeline();
  }

  async function triggerPreset(presetId, opts = {}) {
    stopSimulation();
    simController = new AbortController();
    simRunning = true;
    setSimUi(true);
    try {
      return await runEvalPreset(presetId, {
        eventBus,
        store,
        speedScale: opts.speedScale ?? 1,
        signal: opts.signal ?? simController.signal,
      });
    } catch (err) {
      if (err?.name !== 'AbortError') throw err;
      return null;
    } finally {
      simRunning = false;
      if (!simController?.signal.aborted) {
        /* keep badge briefly visible after successful run */
      }
    }
  }

  function isOpen() {
    return openState && !panel.hidden;
  }

  function getActiveTab() {
    return activeTab;
  }

  tabObserve.addEventListener('click', () => {
    activeTab = 'observe';
    syncTabs();
  });
  tabEvaluate.addEventListener('click', () => {
    activeTab = 'evaluate';
    syncTabs();
  });
  closeBtn.addEventListener('click', () => close());
  clearBtn.addEventListener('click', () => {
    eventBus.clearTimeline?.();
    renderTimeline();
  });
  stopBtn.addEventListener('click', () => stopSimulation());

  for (const btn of panel.querySelectorAll('.obs-preset-btn')) {
    btn.addEventListener('click', () => {
      const id = btn.dataset.presetId;
      if (id) triggerPreset(id);
    });
  }

  function onKeyDown(event) {
    if (!event.altKey || !event.shiftKey) return;
    const key = event.key?.toLowerCase();
    if (key === 'd') {
      event.preventDefault();
      toggle('observe');
    } else if (key === 'e') {
      event.preventDefault();
      toggle('evaluate');
    }
  }

  function onKeyUp(event) {
    if (event.key !== 'Escape' || !openState) return;
    const active = doc.activeElement;
    if (active && panel.contains(active)) close();
  }

  if (win) {
    win.addEventListener('keydown', onKeyDown);
    win.addEventListener('keyup', onKeyUp);
  }

  if (query.devOpen || query.evalOpen) {
    open(query.initialTab);
  } else {
    syncTabs();
  }

  return {
    open,
    close,
    toggle,
    triggerPreset,
    isOpen,
    getActiveTab,
    element: panel,
    simBadge,
    destroy() {
      stopSimulation();
      unsubBus();
      if (win) {
        win.removeEventListener('keydown', onKeyDown);
        win.removeEventListener('keyup', onKeyUp);
      }
      panel.remove();
      if (simBadge?.parentNode) simBadge.remove();
    },
  };
}