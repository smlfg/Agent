// Horological Contextual Controls (max 3 bipolar watch-index dials above the eyes).
// No box, no numbers, no percentages, no settings chrome: stays hidden until
// the conversation adapts the surface, supports live scrubbing + tapping word poles,
// and exposes whisper-quiet Undo / Reset crown marks.

import {
  CONTEXTUAL_CONTROL_SPECS,
  DEFAULT_SURFACE_STATE,
  MAX_VISIBLE_CONTROLS,
} from './surface-state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SCALE_START_X = 6;
const SCALE_END_X = 94;

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function normalizedFromValue(spec, value) {
  if (spec.kind === 'enum') {
    const count = Math.max(2, spec.options?.length ?? 3);
    const idx = Math.max(0, spec.options.findIndex((o) => o.value === value));
    return idx / (count - 1);
  }
  const num = Number(value);
  if (!Number.isFinite(num) || spec.max === spec.min) return 0.5;
  return clamp01((num - spec.min) / (spec.max - spec.min));
}

function valueFromSlider(spec, sliderValue) {
  if (spec.kind === 'enum') {
    const idx = Math.max(0, Math.min(spec.options.length - 1, Math.round(Number(sliderValue))));
    return spec.options[idx].value;
  }
  return Number(sliderValue);
}

function xOnDial(t) {
  return Number((SCALE_START_X + clamp01(t) * (SCALE_END_X - SCALE_START_X)).toFixed(2));
}

function createCrownButton(action, label, iconPath) {
  const btn = el('button', 'surface-crown-btn');
  btn.type = 'button';
  btn.dataset.action = action;
  btn.setAttribute('aria-label', label);
  btn.title = label;

  const svg = svgEl('svg', {
    viewBox: '0 0 16 16',
    width: 13,
    height: 13,
    'aria-hidden': 'true',
    focusable: 'false',
  });
  for (const d of iconPath) {
    svg.append(svgEl('path', {
      d,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.35,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }));
  }
  btn.append(svg);
  return btn;
}

/**
 * @param {{container: HTMLElement, surfaceStore: object, reducedMotion?: boolean}} options
 */
export function mountSurfaceControls({ container, surfaceStore, reducedMotion = false } = {}) {
  if (!container) throw new Error('mountSurfaceControls: container is required');
  if (!surfaceStore) throw new Error('mountSurfaceControls: surfaceStore is required');

  const doc = container.ownerDocument ?? document;
  const root = doc.documentElement;

  const itemsWrap = el('div', 'surface-controls-items');
  const actionsWrap = el('div', 'surface-controls-actions');

  const undoBtn = createCrownButton('undo', 'Rückgängig', [
    'M4.5 6.5H11a3.2 3.2 0 1 1 0 6.4H7.5',
    'M6.6 4.1 4.2 6.5 6.6 8.9',
  ]);
  const resetBtn = createCrownButton('reset', 'Ursprung', [
    'M4.5 4.5 11.5 11.5',
    'M11.5 4.5 4.5 11.5',
  ]);

  actionsWrap.append(undoBtn, resetBtn);
  container.replaceChildren(itemsWrap, actionsWrap);

  let renderedIds = [];
  const bindings = new Map();
  let dragCheckpointed = false;
  let hideTimerId = 0;

  function beginDragCheckpoint(label) {
    if (root?.dataset) root.dataset.surfaceDragging = 'true';
    if (dragCheckpointed) return;
    dragCheckpointed = true;
    surfaceStore.checkpoint(`Regler: ${label}`);
  }

  function endDragCheckpoint() {
    dragCheckpointed = false;
    if (root?.dataset) delete root.dataset.surfaceDragging;
  }

  function readSpecValue(spec, state) {
    return state?.[spec.dimension]?.[spec.param];
  }

  function stepTowardPole(spec, direction) {
    const state = surfaceStore.getState();
    const current = readSpecValue(spec, state);
    if (spec.kind === 'enum') {
      const idx = Math.max(0, spec.options.findIndex((o) => o.value === current));
      const nextIdx = Math.max(0, Math.min(spec.options.length - 1, idx + direction));
      const nextVal = spec.options[nextIdx].value;
      if (nextVal === current) return;
      surfaceStore.applyPatch(
        { [spec.dimension]: { [spec.param]: nextVal } },
        {
          source: 'control',
          summary: `${spec.label}: ${spec.options[nextIdx].label}`,
          focusControls: surfaceStore.getActiveControls(),
        },
      );
      return;
    }

    const span = spec.max - spec.min;
    const rawStep = Math.max(spec.step || 0.02, span * 0.15);
    const stepDecimals = String(spec.step || 0.05).split('.')[1]?.length ?? 2;
    const nextRaw = Number(current) + direction * rawStep;
    const snapped = Number((Math.round(nextRaw / spec.step) * spec.step).toFixed(stepDecimals));
    const nextVal = Math.max(spec.min, Math.min(spec.max, snapped));
    if (nextVal === current) return;
    surfaceStore.applyPatch(
      { [spec.dimension]: { [spec.param]: nextVal } },
      {
        source: 'control',
        summary: spec.label,
        focusControls: surfaceStore.getActiveControls(),
      },
    );
  }

  function buildControlNode(spec) {
    const wrap = el('div', 'surface-control');
    wrap.dataset.controlId = spec.id;
    wrap.style.setProperty('--t', '0.5');

    const lowLabel = spec.lowLabel ?? spec.options?.[0]?.label?.toLowerCase() ?? '';
    const highLabel = spec.highLabel ?? spec.options?.[spec.options.length - 1]?.label?.toLowerCase() ?? '';

    const lowBtn = el('button', 'surface-pole surface-pole--low', lowLabel);
    lowBtn.type = 'button';
    lowBtn.setAttribute('aria-label', `${spec.label}: eher ${lowLabel}`);
    lowBtn.addEventListener('click', () => stepTowardPole(spec, -1));

    const highBtn = el('button', 'surface-pole surface-pole--high', highLabel);
    highBtn.type = 'button';
    highBtn.setAttribute('aria-label', `${spec.label}: eher ${highLabel}`);
    highBtn.addEventListener('click', () => stepTowardPole(spec, 1));

    const dial = el('div', 'surface-dial');
    const originVal = readSpecValue(spec, DEFAULT_SURFACE_STATE);
    const originX = xOnDial(normalizedFromValue(spec, originVal));

    const svg = svgEl('svg', {
      class: 'surface-dial-svg',
      viewBox: '0 0 100 18',
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
      focusable: 'false',
    });

    svg.append(svgEl('line', {
      class: 'surface-dial-rail',
      x1: SCALE_START_X,
      y1: 11,
      x2: SCALE_END_X,
      y2: 11,
    }));

    const tickCount = spec.kind === 'enum' ? (spec.options?.length ?? 3) : 9;
    for (let i = 0; i < tickCount; i += 1) {
      const tx = xOnDial(i / (tickCount - 1));
      const isOrigin = Math.abs(tx - originX) < 1.5;
      svg.append(svgEl('line', {
        class: isOrigin ? 'surface-dial-tick surface-dial-tick--origin' : 'surface-dial-tick',
        x1: tx,
        y1: isOrigin ? 6.2 : 8.4,
        x2: tx,
        y2: isOrigin ? 14.8 : 13.4,
      }));
    }

    const arc = svgEl('line', {
      class: 'surface-dial-arc',
      x1: originX,
      y1: 11,
      x2: originX,
      y2: 11,
    });
    const needle = svgEl('line', {
      class: 'surface-dial-needle',
      x1: originX,
      y1: 4,
      x2: originX,
      y2: 14.5,
    });
    const pivot = svgEl('circle', {
      class: 'surface-dial-pivot',
      cx: originX,
      cy: 11,
      r: 1.75,
    });
    svg.append(arc, needle, pivot);

    const inputId = `surface-ctl-${spec.id.replace(/[^a-z0-9_-]/gi, '-')}`;
    const input = document.createElement('input');
    input.id = inputId;
    input.type = 'range';
    input.className = 'surface-dial-input';
    input.setAttribute('aria-label', `${spec.label}: ${lowLabel} bis ${highLabel}`);

    if (spec.kind === 'enum') {
      input.min = '0';
      input.max = String((spec.options?.length ?? 3) - 1);
      input.step = '1';
    } else {
      input.min = String(spec.min);
      input.max = String(spec.max);
      input.step = String(spec.step);
    }

    input.addEventListener('pointerdown', () => beginDragCheckpoint(spec.label));
    input.addEventListener('keydown', (event) => {
      if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
        beginDragCheckpoint(spec.label);
      }
    });
    input.addEventListener('input', () => {
      if (!dragCheckpointed) beginDragCheckpoint(spec.label);
      const nextVal = valueFromSlider(spec, input.value);
      surfaceStore.applyPatch(
        { [spec.dimension]: { [spec.param]: nextVal } },
        {
          source: 'control',
          summary: spec.label,
          focusControls: surfaceStore.getActiveControls(),
          recordHistory: false,
        },
      );
    });
    input.addEventListener('change', endDragCheckpoint);
    input.addEventListener('pointerup', endDragCheckpoint);
    input.addEventListener('pointercancel', endDragCheckpoint);
    input.addEventListener('blur', endDragCheckpoint);

    dial.append(svg, input);
    wrap.append(lowBtn, dial, highBtn);

    bindings.set(spec.id, { spec, wrap, originX, arc, needle, pivot, input });
    return wrap;
  }

  function render() {
    const state = surfaceStore.getState();
    const activeIds = surfaceStore
      .getActiveControls()
      .filter((id) => Object.hasOwn(CONTEXTUAL_CONTROL_SPECS, id))
      .slice(0, MAX_VISIBLE_CONTROLS);

    const visible = activeIds.length > 0 || surfaceStore.isModified();
    container.dataset.controlCount = String(activeIds.length);

    if (!visible) {
      if (!container.hidden) {
        if (reducedMotion) {
          container.classList.remove('is-closing');
          container.hidden = true;
          itemsWrap.replaceChildren();
          bindings.clear();
          renderedIds = [];
        } else {
          container.classList.add('is-closing');
          clearTimeout(hideTimerId);
          hideTimerId = setTimeout(() => {
            container.classList.remove('is-closing');
            container.hidden = true;
            itemsWrap.replaceChildren();
            bindings.clear();
            renderedIds = [];
          }, 260);
        }
      }
      return;
    }

    clearTimeout(hideTimerId);
    container.classList.remove('is-closing');
    container.hidden = false;

    const structureChanged = activeIds.length !== renderedIds.length
      || activeIds.some((id, idx) => id !== renderedIds[idx]);

    if (structureChanged) {
      bindings.clear();
      const nodes = activeIds.map((id) => buildControlNode(CONTEXTUAL_CONTROL_SPECS[id]));
      itemsWrap.replaceChildren(...nodes);
      renderedIds = activeIds;
    }

    for (const id of activeIds) {
      const binding = bindings.get(id);
      if (!binding) continue;
      const val = readSpecValue(binding.spec, state);
      const t = normalizedFromValue(binding.spec, val);
      const nx = xOnDial(t);

      binding.wrap.style.setProperty('--t', t.toFixed(3));
      binding.arc.setAttribute('x1', String(Math.min(binding.originX, nx)));
      binding.arc.setAttribute('x2', String(Math.max(binding.originX, nx)));
      binding.needle.setAttribute('x1', String(nx));
      binding.needle.setAttribute('x2', String(nx));
      binding.pivot.setAttribute('cx', String(nx));

      if (binding.spec.kind === 'enum') {
        const idx = Math.max(0, binding.spec.options.findIndex((o) => o.value === val));
        if (binding.input.value !== String(idx)) binding.input.value = String(idx);
        binding.input.setAttribute('aria-valuetext', binding.spec.options[idx]?.label ?? String(val));
      } else {
        const strVal = String(val);
        if (binding.input.value !== strVal) binding.input.value = strVal;
      }
    }

    undoBtn.hidden = !surfaceStore.canUndo();
    undoBtn.disabled = !surfaceStore.canUndo();
    resetBtn.hidden = !surfaceStore.isModified();
    resetBtn.disabled = !surfaceStore.isModified();
  }

  function onUndoClick() {
    surfaceStore.undo({ source: 'control' });
  }

  function onResetClick() {
    surfaceStore.reset({ source: 'control' });
  }

  undoBtn.addEventListener('click', onUndoClick);
  resetBtn.addEventListener('click', onResetClick);

  const unsubscribe = surfaceStore.subscribe(() => render());
  render();

  return {
    destroy() {
      clearTimeout(hideTimerId);
      endDragCheckpoint();
      unsubscribe();
      undoBtn.removeEventListener('click', onUndoClick);
      resetBtn.removeEventListener('click', onResetClick);
      container.replaceChildren();
      container.classList.remove('is-closing');
      container.hidden = true;
      delete container.dataset.controlCount;
      bindings.clear();
      renderedIds = [];
    },
  };
}
