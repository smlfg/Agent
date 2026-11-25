// Per-turn typing collector. Pure bookkeeping; no metrics are computed here.
// All times are milliseconds from the same clock.

const POINTER_THROTTLE_MS = 50;
const NEAR_PRESENCE_PX = 200;

export function createCollector({ input = null, now = defaultNow } = {}) {
  const mountedAt = now();

  let turn = 0;
  let keys = [];
  let keydowns = 0;
  let backspaces = 0;
  let clicks = 0;
  let blurCount = 0;
  let hiddenMs = 0;
  let hiddenSince = null;
  let pointerSamples = 0;
  let pointerNear = 0;
  let lastPointerAt = -Infinity;
  let firstKeyAt = null;
  let lastKeyAt = null;
  let lastSubmitAt = null;
  let responseEndAt = null;

  function recordKeyDown(key, at = now(), { repeat = false } = {}) {
    keydowns += 1;
    if (firstKeyAt === null) firstKeyAt = at;
    lastKeyAt = at;
    if (key === 'Backspace' || key === 'Delete') {
      backspaces += 1;
      return;
    }
    if (typeof key === 'string' && key.length === 1 && !repeat) {
      keys.push([at, key]);
    }
  }

  function recordPointer(at = now(), nearPresence = false) {
    if (at - lastPointerAt < POINTER_THROTTLE_MS) return;
    lastPointerAt = at;
    pointerSamples += 1;
    if (nearPresence) pointerNear += 1;
  }

  function recordClick() {
    clicks += 1;
  }

  function recordBlur() {
    blurCount += 1;
  }

  function recordHidden(ms) {
    if (Number.isFinite(ms) && ms > 0) hiddenMs += ms;
  }

  function markResponseEnd(at = now()) {
    responseEndAt = at;
  }

  function endTurn({ turn: turnId = turn + 1, prompt = '', phaseBeforeSubmit = 'idle', at = now() } = {}) {
    const inputs = {
      turn: turnId,
      prompt: String(prompt ?? ''),
      answer: '',
      phaseBeforeSubmit,
      mountedAt,
      submitAt: at,
      responseEndAt,
      firstKeyAt,
      lastKeyAt,
      typing: {
        keys: keys.map(([t, key]) => [t, key]),
        keydowns,
        backspaces,
      },
      pointer: { samples: pointerSamples, nearPresence: pointerNear },
      hiddenMs,
      blurCount,
      clicks,
      interruption: phaseBeforeSubmit === 'thinking' || phaseBeforeSubmit === 'speaking',
    };

    turn = turnId;
    keys = [];
    keydowns = 0;
    backspaces = 0;
    clicks = 0;
    blurCount = 0;
    hiddenMs = 0;
    pointerSamples = 0;
    pointerNear = 0;
    firstKeyAt = null;
    lastKeyAt = null;
    lastSubmitAt = at;

    return inputs;
  }

  function onKeyDown(event) {
    recordKeyDown(event.key, now(), { repeat: Boolean(event.repeat) });
  }

  function onPointerMove(event) {
    const at = now();
    if (at - lastPointerAt < POINTER_THROTTLE_MS) return;
    let near = false;
    if (typeof document !== 'undefined' && typeof document.elementFromPoint === 'function') {
      const presence = document.getElementById('presence');
      if (presence && typeof presence.getBoundingClientRect === 'function') {
        const rect = presence.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        near = Math.hypot(event.clientX - cx, event.clientY - cy) <= NEAR_PRESENCE_PX;
      }
    }
    recordPointer(at, near);
  }

  function onVisibilityChange() {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      hiddenSince = now();
    } else if (hiddenSince !== null) {
      recordHidden(now() - hiddenSince);
      hiddenSince = null;
    }
  }

  const cleanups = [];
  if (input && typeof input.addEventListener === 'function') {
    input.addEventListener('keydown', onKeyDown);
    cleanups.push(() => input.removeEventListener('keydown', onKeyDown));
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('pointerdown', recordClick, { passive: true });
    if (typeof window !== 'undefined') window.addEventListener('blur', recordBlur);
    cleanups.push(() => document.removeEventListener('pointermove', onPointerMove));
    cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));
    cleanups.push(() => document.removeEventListener('pointerdown', recordClick));
    cleanups.push(() => { if (typeof window !== 'undefined') window.removeEventListener('blur', recordBlur); });
  }

  return {
    endTurn,
    markResponseEnd,
    recordKeyDown,
    recordPointer,
    recordClick,
    recordBlur,
    recordHidden,
    getResponseEndAt: () => responseEndAt,
    getLastSubmitAt: () => lastSubmitAt,
    destroy() {
      for (const cleanup of cleanups) cleanup();
      cleanups.length = 0;
    },
  };
}

function defaultNow() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now();
  return Date.now();
}
