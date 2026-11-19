// Integration point (owned by Claude Code). Wires store, presence and conversation.
import { createStore } from './state/store.js';
import * as devAgent from './dev/devAgent.js';
import { mountPresence } from './presence/presence.js';
import { mountConversation } from './conversation/conversation.js';
import { mountGaze } from './presence/gaze.js';
import { buildDevChain } from './dev/failingAgents.js';
import { mountMetrics } from './metrics/surface.js';
import { mountIdle } from './presence/idle.js';

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

// The conversation talks to whatever agent is current. Dev tools (replay)
// can swap it at runtime; production will swap in the real backend adapter.
// Every agent goes through the fallback chain. Dev: ?fail=quota,timeout,network
// puts simulated failing providers in front of the dev agent.
const baseAgent = buildDevChain(new URLSearchParams(location.search));
let currentAgent = baseAgent;
const agent = {
  respond: (prompt, opts) => currentAgent.respond(prompt, opts),
};
function setAgent(next) {
  currentAgent = next ?? baseAgent;
}

mountPresence({ root: document.getElementById('presence'), store, reducedMotion });
mountConversation({ root: stage, store, agent, reducedMotion });
// Eyes follow the writing caret and look ahead while the visitor types.
mountGaze({ input: document.getElementById('composer-input'), reducedMotion });
// In silence the eyes wait expectantly and glance at the input (never sleep).
mountIdle({
  store,
  root: document.getElementById('presence'),
  composer: document.getElementById('composer-input'),
  reducedMotion,
});
// Conversation metrics → 12 parameters → surface, applied once per turn end.
mountMetrics({ store, input: document.getElementById('composer-input') });

// Gentle awakening: after ~5 s, or as soon as the visitor starts typing.
setTimeout(() => store.dispatch({ type: 'AWAKE' }), AWAKE_AFTER_MS);

// Debug handle for local verification and dev tools only.
window.__agentfaehig = { store, setAgent, devAgent, reducedMotion };

// Development replay of synthetic conversations: open with ?replay
if (new URLSearchParams(location.search).has('replay')) {
  import('./dev/replay.js')
    .then((m) => m.mountReplay({ stage, store, setAgent, reducedMotion }))
    .catch((err) => console.error('[replay] failed to load', err));
}
