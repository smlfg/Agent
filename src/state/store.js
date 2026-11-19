// Living-surface state machine (M1 contract). Pure reducer + tiny store.
// Phases: dormant -> idle -> listening -> thinking -> speaking -> idle
// Only the current pair (prompt + answer) exists. There is no history.

export const PHASES = Object.freeze(['dormant', 'idle', 'listening', 'thinking', 'speaking']);

export const initialState = Object.freeze({
  phase: 'dormant',
  prompt: '',   // the visitor's current input, echoed once submitted
  answer: '',   // visible part of the current answer
  turn: 0,      // increments on every SUBMIT; lets views drop stale work
  dev: false,   // true while the answer comes from development data
});

/**
 * @param {typeof initialState} state
 * @param {{type: string, [k: string]: any}} event
 */
export function reduce(state, event) {
  switch (event.type) {
    case 'AWAKE':
      return state.phase === 'dormant' ? { ...state, phase: 'idle' } : state;

    case 'INPUT': {
      // Typing wakes the surface; it never interrupts an answer in progress.
      if (state.phase === 'thinking' || state.phase === 'speaking') return state;
      const phase = event.value && event.value.length > 0 ? 'listening' : 'idle';
      return { ...state, phase };
    }

    case 'SUBMIT': {
      const prompt = String(event.prompt ?? '').trim();
      if (!prompt) return state;
      // Submitting during thinking/speaking interrupts: the old pair is replaced.
      return { ...state, phase: 'thinking', prompt, answer: '', turn: state.turn + 1, dev: false };
    }

    case 'RESPONSE_START':
      if (event.turn !== state.turn || state.phase !== 'thinking') return state;
      return { ...state, phase: 'speaking', answer: '', dev: Boolean(event.dev) };

    case 'RESPONSE_PROGRESS':
      if (event.turn !== state.turn || state.phase !== 'speaking') return state;
      return { ...state, answer: String(event.text ?? '') };

    case 'RESPONSE_END':
      if (event.turn !== state.turn || state.phase !== 'speaking') return state;
      return { ...state, phase: 'idle', answer: String(event.text ?? state.answer) };

    case 'RESPONSE_ERROR':
      if (event.turn !== state.turn) return state;
      return { ...state, phase: 'idle' };

    default:
      return state;
  }
}

export function createStore(state = initialState) {
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch(event) {
      const prev = state;
      state = reduce(state, event);
      if (state !== prev) for (const fn of [...listeners]) fn(state, prev, event);
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
