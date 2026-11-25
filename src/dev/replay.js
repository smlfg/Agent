// DEVELOPMENT ONLY — replays the persona pathways through the real UI.
// Loaded by main.js when the URL carries ?replay. Not part of the product.

import { respond as devRespond } from './devAgent.js';

export const PATHWAY_PARAMS = Object.freeze([
  'tempo',
  'density',
  'warmth',
  'calm',
  'closeness',
  'openness',
  'attention',
  'certainty',
  'playfulness',
  'formality',
  'depth',
  'energy',
]);

const SPEEDS = Object.freeze([0.5, 1, 2, 4]);
const STYLE_HREF = new URL('../styles/replay.css', import.meta.url).href;
const DATA_HREF = new URL('./conversation-pathways.json', import.meta.url).href;

/**
 * Deterministic keystroke plan for one visitor prompt.
 * Each step is {action: 'type'|'delete', char, delayMs}; applying the plan in
 * order to an empty string yields exactly `text`. Mistakes are typed and then
 * deleted so the plan ends on the real prompt even with backspaces.
 *
 * @param {string} text
 * @param {{duration_ms?: number, backspaces?: number}} [typing]
 * @param {number} [speed]
 * @returns {{action: 'type'|'delete', char: string, delayMs: number}[]}
 */
export function planTyping(text, typing = {}, speed = 1) {
  const chars = Array.from(String(text ?? ''));
  const rate = Number.isFinite(speed) && speed > 0 ? speed : 1;
  const durationMs = Math.max(0, Number(typing?.duration_ms) || 0) / rate;
  const requested = Math.max(0, Math.trunc(Number(typing?.backspaces) || 0));
  const mistakes = Math.min(requested, chars.length + 1);

  const slots = new Map();
  for (let j = 0; j < mistakes; j += 1) {
    const pos = Math.floor(((j + 1) * (chars.length + 1)) / (mistakes + 1));
    slots.set(pos, (slots.get(pos) ?? 0) + 1);
  }

  const steps = [];
  for (let i = 0; i <= chars.length; i += 1) {
    const count = slots.get(i) ?? 0;
    for (let k = 0; k < count; k += 1) {
      const wrong = wrongChar(chars[i] ?? chars[chars.length - 1] ?? 'x', k);
      steps.push({ action: 'type', char: wrong });
      steps.push({ action: 'delete', char: wrong });
    }
    if (i < chars.length) steps.push({ action: 'type', char: chars[i] });
  }

  const delay = steps.length > 0 ? durationMs / steps.length : 0;
  return steps.map((step) => ({ ...step, delayMs: delay }));
}

/** Apply a keystroke plan to a string. Exposed so the plan is easy to test. */
export function applyTypingSteps(steps) {
  let value = '';
  for (const step of steps) {
    if (step.action === 'delete') value = value.slice(0, -1);
    else value += step.char;
  }
  return value;
}

/**
 * Deterministic synthetic agent latency in the 500–900 ms band (before speed).
 * @param {string} text
 * @param {number} [seed]
 */
export function replayDelay(text, seed = 0) {
  const str = String(text ?? '');
  let hash = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return 500 + (hash % 401);
}

/** Keep only usable pathways from the development data file. */
export function normalizePathways(raw) {
  const list = Array.isArray(raw?.pathways) ? raw.pathways : [];
  return list.filter(
    (pathway) =>
      pathway &&
      typeof pathway.id === 'string' &&
      typeof pathway.title === 'string' &&
      Array.isArray(pathway.turns) &&
      pathway.turns.length > 0,
  );
}

function wrongChar(target, index) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const base = target ? target.toLowerCase().charCodeAt(0) : 64;
  const slot = ((base + (index + 1) * 7) % 26 + 26) % 26;
  return alphabet[slot];
}

function abortError() {
  const error = new Error('aborted');
  error.name = 'AbortError';
  return error;
}

function isAbort(error) {
  return Boolean(error) && error.name === 'AbortError';
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, Math.max(0, ms));
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function ensureStyle() {
  if (document.querySelector('link[data-replay-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLE_HREF;
  link.dataset.replayStyle = '';
  document.head.append(link);
}

/**
 * @param {{stage: HTMLElement, store: object, setAgent: (agent: object|null) => void, reducedMotion?: boolean}} options
 */
export function mountReplay({ stage, store, setAgent, reducedMotion = false }) {
  const composer = stage.querySelector('#composer');
  const input = stage.querySelector('#composer-input');
  if (!composer || !input) {
    console.warn('[replay] composer not found; replay not mounted');
    return { destroy() {} };
  }

  ensureStyle();

  const panel = element('aside', 'replay-panel');
  panel.dataset.replayPanel = '';
  panel.setAttribute('aria-label', 'Replay development panel');
  if (reducedMotion) panel.classList.add('is-reduced');

  const head = element('div', 'replay-head');
  const title = element('span', 'replay-title', 'REPLAY · DEV');
  const keyHint = element('span', 'replay-keyhint', 'R hides');
  const collapseBtn = element('button', 'replay-icon', '−');
  collapseBtn.type = 'button';
  collapseBtn.title = 'Collapse panel';
  collapseBtn.setAttribute('aria-label', 'Collapse panel');
  collapseBtn.setAttribute('aria-expanded', 'true');
  head.append(title, keyHint, collapseBtn);

  const body = element('div', 'replay-body');

  const selectLabel = element('label', 'replay-label', 'Pathway');
  const select = element('select', 'replay-select');
  select.id = 'replay-pathway';
  selectLabel.htmlFor = select.id;

  const persona = element('p', 'replay-persona');

  const controls = element('div', 'replay-controls');
  const playBtn = element('button', 'replay-btn replay-btn-primary', 'Play');
  playBtn.type = 'button';
  const nextBtn = element('button', 'replay-btn', 'Next turn');
  nextBtn.type = 'button';
  const restartBtn = element('button', 'replay-btn', 'Restart');
  restartBtn.type = 'button';
  controls.append(playBtn, nextBtn, restartBtn);

  const speedRow = element('div', 'replay-speed');
  speedRow.setAttribute('role', 'group');
  speedRow.setAttribute('aria-label', 'Playback speed');
  const speedLabel = element('span', 'replay-label', 'Speed');
  const speedButtons = SPEEDS.map((value) => {
    const button = element('button', 'replay-speed-btn', `${value}×`);
    button.type = 'button';
    button.dataset.speed = String(value);
    button.setAttribute('aria-pressed', String(value === 1));
    button.title = `${value}× playback speed`;
    speedRow.append(button);
    return button;
  });
  speedRow.prepend(speedLabel);

  const autoLabel = element('label', 'replay-auto');
  const autoInput = document.createElement('input');
  autoInput.type = 'checkbox';
  autoInput.checked = true;
  autoLabel.append(autoInput, document.createTextNode(' Auto-advance'));

  const status = element('p', 'replay-status', 'Loading…');
  status.setAttribute('role', 'status');

  const paramsBox = element('div', 'replay-params');
  paramsBox.setAttribute('role', 'list');
  paramsBox.setAttribute('aria-label', 'Surface parameters');
  const paramRows = new Map();
  for (const name of PATHWAY_PARAMS) {
    const row = element('div', 'replay-param');
    row.setAttribute('role', 'listitem');
    const nameEl = element('span', 'replay-param-name', name);
    const track = element('span', 'replay-param-track');
    const fill = element('span', 'replay-param-fill');
    track.append(fill);
    const valueEl = element('span', 'replay-param-value', '0.00');
    row.append(nameEl, track, valueEl);
    paramsBox.append(row);
    paramRows.set(name, { row, fill, valueEl });
  }

  const surface = element('p', 'replay-surface');
  const outcome = element('p', 'replay-outcome');
  const lesson = element('p', 'replay-lesson');

  body.append(
    selectLabel,
    select,
    persona,
    controls,
    speedRow,
    autoLabel,
    status,
    paramsBox,
    surface,
    outcome,
    lesson,
  );
  panel.append(head, body);
  document.body.append(panel);

  let pathways = [];
  let pathway = null;
  let turns = [];
  let turnIndex = -1;
  let playing = false;
  let speed = 1;
  let autoAdvance = true;
  let controller = null;
  let pendingPrompt = null;
  let pendingText = '';

  function replayRespond(prompt, { signal } = {}) {
    if (prompt !== pendingPrompt) return devRespond(prompt, { signal });
    const text = pendingText;
    const delay = replayDelay(text, 7) / speed;
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(abortError());
        return;
      }
      const onAbort = () => {
        clearTimeout(timer);
        reject(abortError());
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve({ text, dev: true });
      }, delay);
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  const replayAgent = {
    respond(prompt, opts) {
      return replayRespond(prompt, opts ?? {});
    },
  };

  function fireInput() {
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function syncUI() {
    playBtn.textContent = playing ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(playing));
    panel.dataset.state = playing ? 'playing' : 'idle';
    for (const button of speedButtons) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.speed) === speed));
    }
  }

  function setParamsVars(params) {
    for (const name of PATHWAY_PARAMS) {
      const value = Number(params?.[name]);
      document.documentElement.style.setProperty(
        `--p-${name}`,
        String(Number.isFinite(value) ? value : 0),
      );
    }
  }

  function clearParamsVars() {
    for (const name of PATHWAY_PARAMS) {
      document.documentElement.style.removeProperty(`--p-${name}`);
    }
  }

  function renderParams(params) {
    for (const name of PATHWAY_PARAMS) {
      const row = paramRows.get(name);
      const value = Number(params?.[name]);
      const safe = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
      row.fill.style.width = `${Math.round(safe * 100)}%`;
      row.valueEl.textContent = safe.toFixed(2);
      row.row.title = `${name}: ${safe.toFixed(2)}`;
    }
  }

  function clearParamsView() {
    for (const name of PATHWAY_PARAMS) {
      const row = paramRows.get(name);
      row.fill.style.width = '0%';
      row.valueEl.textContent = '0.00';
      row.row.title = name;
    }
  }

  function showTurn(turn, index) {
    setParamsVars(turn.params);
    renderParams(turn.params);
    surface.textContent = `Surface · ${turn.surface}`;
    setStatus(`Turn ${index + 1} / ${turns.length}${playing ? ' · playing' : ''}`);
  }

  function showPathway(next) {
    pathway = next;
    turns = next?.turns ?? [];
    turnIndex = -1;
    persona.textContent = next ? next.persona : '';
    outcome.textContent = next?.outcome ? `Outcome · ${next.outcome}` : '';
    lesson.textContent = next?.design_lesson ? `Lesson · ${next.design_lesson}` : '';
    surface.textContent = next ? 'Surface · press Play to run this pathway.' : '';
    clearParamsView();
    setStatus(next ? `Ready · ${turns.length} turns` : 'No pathways');
  }

  function abortRun() {
    if (controller) {
      controller.abort();
      controller = null;
    }
  }

  function stopPlayback(message) {
    abortRun();
    playing = false;
    setAgent(null);
    if (message) setStatus(message);
    syncUI();
  }

  function finishPlayback() {
    abortRun();
    playing = false;
    setAgent(null);
    clearParamsVars();
    turnIndex = turns.length;
    setStatus(`Finished · ${turns.length} turns`);
    syncUI();
  }

  function waitForIdle(signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(abortError());
        return;
      }
      let settled = false;
      const onAbort = () => finish(abortError());
      function finish(error) {
        if (settled) return;
        settled = true;
        unsubscribe();
        signal.removeEventListener('abort', onAbort);
        if (error) reject(error);
        else resolve();
      }
      const unsubscribe = store.subscribe((state) => {
        if (state.phase === 'idle') finish();
      });
      signal.addEventListener('abort', onAbort, { once: true });
      if (store.getState().phase === 'idle') finish();
    });
  }

  async function runFrom(startIndex, signal) {
    const runTurns = turns;
    for (let i = startIndex; i < runTurns.length; i += 1) {
      if (signal.aborted) return;
      turnIndex = i;
      const turn = runTurns[i];
      showTurn(turn, i);

      input.value = '';
      fireInput();

      const plan = planTyping(turn.user, turn.typing, speed);
      for (const step of plan) {
        await sleep(step.delayMs, signal);
        if (step.action === 'delete') input.value = input.value.slice(0, -1);
        else input.value += step.char;
        fireInput();
      }

      await sleep((Number(turn.typing?.pause_before_send_ms) || 0) / speed, signal);

      pendingPrompt = turn.user;
      pendingText = turn.agent;
      if (typeof composer.requestSubmit === 'function') composer.requestSubmit();
      else composer.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

      if (!autoAdvance) {
        stopPlayback(`Turn ${i + 1} / ${runTurns.length} · sent (auto-advance off)`);
        return;
      }

      if (turn.typing?.interrupted_agent && i + 1 < runTurns.length) {
        setStatus(`Turn ${i + 1} / ${runTurns.length} · interrupted`);
        continue;
      }

      await waitForIdle(signal);
    }
    finishPlayback();
  }

  function startPlayback() {
    if (turns.length === 0) return;
    abortRun();
    if (turnIndex < 0 || turnIndex >= turns.length) {
      turnIndex = 0;
      clearParamsVars();
    }
    pendingPrompt = null;
    pendingText = '';
    playing = true;
    setAgent(replayAgent);
    controller = new AbortController();
    syncUI();
    runFrom(turnIndex, controller.signal).catch((error) => {
      if (isAbort(error)) return;
      console.error('[replay]', error);
      stopPlayback('Replay failed · see console');
    });
  }

  function togglePlay() {
    if (playing) {
      stopPlayback(`Paused · turn ${Math.min(turnIndex + 1, turns.length)} / ${turns.length}`);
      return;
    }
    startPlayback();
  }

  function nextTurn() {
    abortRun();
    playing = false;
    setAgent(null);
    if (!turns.length) return;
    if (turnIndex + 1 >= turns.length) {
      finishPlayback();
      return;
    }
    turnIndex += 1;
    startPlayback();
  }

  function restart() {
    stopPlayback();
    pendingPrompt = null;
    pendingText = '';
    turnIndex = -1;
    input.value = '';
    fireInput();
    clearParamsVars();
    clearParamsView();
    if (turns.length) {
      surface.textContent = 'Surface · press Play to run this pathway.';
      setStatus(`Ready · ${turns.length} turns`);
    }
    syncUI();
  }

  function loadPathwayById(id) {
    const next = pathways.find((candidate) => candidate.id === id) ?? pathways[0] ?? null;
    showPathway(next);
    if (next) select.value = next.id;
  }

  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTurn);
  restartBtn.addEventListener('click', restart);

  for (const button of speedButtons) {
    button.addEventListener('click', () => {
      const value = Number(button.dataset.speed);
      if (!Number.isFinite(value) || value === speed) return;
      speed = value;
      syncUI();
      if (playing) startPlayback();
    });
  }

  autoInput.addEventListener('change', () => {
    autoAdvance = autoInput.checked;
  });

  select.addEventListener('change', () => {
    stopPlayback();
    clearParamsVars();
    loadPathwayById(select.value);
    syncUI();
  });

  collapseBtn.addEventListener('click', () => {
    const collapsed = panel.classList.toggle('is-collapsed');
    collapseBtn.textContent = collapsed ? '+' : '−';
    collapseBtn.setAttribute('aria-expanded', String(!collapsed));
    collapseBtn.title = collapsed ? 'Expand panel' : 'Collapse panel';
    collapseBtn.setAttribute('aria-label', collapsed ? 'Expand panel' : 'Collapse panel');
  });

  function onKeyDown(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key;
    if (key !== 'r' && key !== 'R') return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT')
    ) {
      return;
    }
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      event.preventDefault();
      keyHint.textContent = 'R hides';
    }
  }
  window.addEventListener('keydown', onKeyDown);

  fetch(DATA_HREF)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((raw) => {
      pathways = normalizePathways(raw);
      for (const candidate of pathways) {
        const option = document.createElement('option');
        option.value = candidate.id;
        option.textContent = `${candidate.title} — ${candidate.persona}`;
        option.title = candidate.persona;
        select.append(option);
      }
      loadPathwayById(pathways[0]?.id);
      syncUI();
    })
    .catch((error) => {
      console.error('[replay] failed to load pathways', error);
      setStatus('Could not load pathways');
    });

  syncUI();
  setStatus('Loading…');

  return {
    destroy() {
      abortRun();
      setAgent(null);
      clearParamsVars();
      window.removeEventListener('keydown', onKeyDown);
      panel.remove();
    },
  };
}
