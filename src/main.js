// Integration point (owned by Claude Code). Wires store, presence and conversation.
import { createStore } from './state/store.js';
import * as devAgent from './dev/devAgent.js';
import { mountPresence } from './presence/presence.js';
import { mountConversation } from './conversation/conversation.js';

export const AWAKE_AFTER_MS = 5000;

const stage = document.getElementById('stage');
const store = createStore();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The surface mirrors the phase so CSS can react to it.
store.subscribe((state) => {
  stage.dataset.phase = state.phase;
});

const devBadge = document.getElementById('dev-badge');
devBadge.hidden = false;
devBadge.title = devAgent.DEV_LABEL;

mountPresence({ root: document.getElementById('presence'), store, reducedMotion });
mountConversation({ root: stage, store, agent: devAgent, reducedMotion });

// Gentle awakening: after ~5 s, or as soon as the visitor starts typing.
setTimeout(() => store.dispatch({ type: 'AWAKE' }), AWAKE_AFTER_MS);

// Debug handle for local verification only.
window.__agentfaehig = { store };
