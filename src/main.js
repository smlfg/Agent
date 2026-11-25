// Integration point (owned by Claude Code). Wires store, presence and conversation.
import { createStore } from './state/store.js';
import { createAgentEventBus } from './state/agent-events.js';
import { mountEmbodiment } from './presence/embodiment.js';
import { createLocalPreRetrievalAgent } from './agent/local-retrieval.js';
import * as devAgent from './dev/devAgent.js';
import { mountPresence } from './presence/presence.js';
import { mountConversation } from './conversation/conversation.js';
import { mountGaze } from './presence/gaze.js';
import { parseFailureKinds, createFailingAgent } from './dev/failingAgents.js';
import { createAgentChain } from './agent/chain.js';
import { createRemoteAgent, isProductionHost } from './agent/remoteAgent.js';
import { createOllamaAgent, parseModelParam } from './agent/ollamaAgent.js';
import { createStyledDevAgent } from './dev/styledDevAgent.js';
import { buildSystemPrompt } from './agent/prompt.js';
import { deriveStyle } from './agent/style.js';
import { mountMic } from './voice/mic.js';
import { mountMetrics } from './metrics/surface.js';
import { mountIdle } from './presence/idle.js';
import { createSurfaceStore } from './surface/surface-state.js';
import { buildAdaptationPromptBlock, createAdaptiveAgent } from './surface/surface-adapter.js';
import { mountSurfaceProjector } from './surface/surface-projector.js';
import { mountSurfaceControls } from './surface/surface-controls.js';
import { mountKeyboardViewport } from './surface/keyboard-viewport.js';
import { mountObservabilityPanel } from './dev/observability-panel.js';

export const AWAKE_AFTER_MS = 5000;

const stage = document.getElementById('stage');
const store = createStore();
const eventBus = createAgentEventBus({ store });
const surfaceStore = createSurfaceStore();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The surface mirrors the phase so CSS can react to it.
store.subscribe((state) => {
  stage.dataset.phase = state.phase;
});

const devBadge = document.getElementById('dev-badge');
devBadge.hidden = true;
devBadge.title = devAgent.DEV_LABEL;

// The conversation talks to whatever agent is current. Dev tools (replay)
// can swap it at runtime; production will swap in the real backend adapter.
// Every agent goes through the fallback chain. Dev: ?fail=quota,timeout,network
// puts simulated failing providers in front of the dev agent.
const search = new URLSearchParams(location.search);
function currentParams() {
  return surfaceStore.toLegacyParams();
}
// Persona is loaded for the local prompt; factual knowledge is retrieved by the server.
let persona = null;
const loadJson = (path) => fetch(new URL(path, import.meta.url))
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null);
loadJson('./agent/persona.json').then((p) => { persona = p; });
let knowledgePromise = null;
const getKnowledge = () => (knowledgePromise ??= loadJson('./agent/knowledge.json'));
const getSystem = () => {
  const basePrompt = buildSystemPrompt({
    persona,
    style: deriveStyle(currentParams()),
  });
  const adaptationNote = buildAdaptationPromptBlock(
    surfaceStore.getState(),
    surfaceStore.getLastChange()?.summary || '',
  );
  return `${basePrompt}\n\n${adaptationNote}`;
};

// Last resort everywhere: styled development answers (marked dev:true).
const styledDev = { id: 'dev-styled', ...createStyledDevAgent({ getParams: currentParams }) };
const adapters = [...parseFailureKinds(search).map((kind) => createFailingAgent(kind))];
if (isProductionHost(location.hostname)) {
  // Production speaks only to the real endpoint. If every provider fails, the
  // surface shows an honest error instead of a canned answer that looks live.
  adapters.push(createRemoteAgent({ getParams: currentParams }));
} else {
  const local = parseModelParam(search);
  if (local.enabled) {
    const ollama = createOllamaAgent({ ...(local.model ? { model: local.model } : {}), getSystem });
    ollama.warmUp?.();
    adapters.push(ollama);
  }
  adapters.push(styledDev);
}
const presence = mountPresence({ root: document.getElementById('presence'), store, reducedMotion });
const surfaceProjector = mountSurfaceProjector({
  surfaceStore,
  presence,
  root: document.documentElement,
  reducedMotion,
});
const embodiment = mountEmbodiment({
  eventBus,
  store,
  presence,
  surfaceProjector,
  stage,
  root: document.documentElement,
  reducedMotion,
});
const observability = mountObservabilityPanel({
  eventBus,
  store,
  embodiment,
  presence,
  stage,
  search: location.search,
});
let innerAgent = createAgentChain(adapters, { timeoutMs: 10000 });
if (!isProductionHost(location.hostname)) {
  innerAgent = createLocalPreRetrievalAgent({ innerAgent, getKnowledge });
}
const baseAgent = createAdaptiveAgent({
  innerAgent,
  surfaceStore,
  projector: surfaceProjector,
});
let currentAgent = baseAgent;
// The DEV DATA badge shows only while answers actually come from dev data.
const agent = {
  respond: async (prompt, opts) => {
    const result = await currentAgent.respond(prompt, opts);
    devBadge.hidden = !result?.dev;
    return result;
  },
};
function setAgent(next) {
  currentAgent = next ?? baseAgent;
}

const surfaceControls = mountSurfaceControls({
  container: document.getElementById('surface-controls'),
  surfaceStore,
  reducedMotion,
});
// The eyes must survive the mobile keyboard (first mobile test, 20.11.2026).
const keyboardViewport = mountKeyboardViewport();
mountConversation({ root: stage, store, agent, eventBus, reducedMotion });
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
// Ensure explicit conversational adaptations or resets remain authoritative over
// passive metric commits (including async first-turn catalog resolution).
function keepAuthoritativeSurface() {
  if (surfaceStore.isModified() || surfaceStore.getLastChange()?.action === 'reset') {
    surfaceProjector.reapply();
  }
}
store.subscribe((state, prev, event) => {
  if (event.type === 'RESPONSE_END') keepAuthoritativeSurface();
});
new MutationObserver(() => keepAuthoritativeSurface()).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-surface-level'],
});
// Voice is voluntary: click first, then speak (browser speech recognition).
mountMic({
  input: document.getElementById('composer-input'),
  button: document.getElementById('mic-toggle'),
  reducedMotion,
});

// Gentle awakening: after ~5 s, or immediately if previewing a ?pose=<world|surprise>.
const poseParam = search.get('pose');
if (poseParam) {
  store.dispatch({ type: 'AWAKE' });
  if (poseParam.trim().toLowerCase() === 'surprise') {
    const seedParam = Number(search.get('seed')) || 42;
    surfaceProjector.surprise({ temperature: 0.95, seed: seedParam });
  } else {
    surfaceProjector.applyWorld(poseParam);
  }
} else {
  setTimeout(() => store.dispatch({ type: 'AWAKE' }), AWAKE_AFTER_MS);
}

// Debug handle for local verification and dev tools only.
window.__agentfaehig = {
  store,
  events: eventBus,
  embodiment,
  presence,
  observability,
  surface: surfaceStore,
  surfaceProjector,
  surfaceControls,
  keyboard: keyboardViewport,
  bones: {
    count: surfaceProjector.boneCount,
    getState: () => surfaceProjector.getActiveBones(),
    apply: (patch) => surfaceProjector.applyBonePatch(patch),
    applyWorld: (id) => surfaceProjector.applyWorld(id),
    surprise: (opts) => surfaceProjector.surprise(opts),
    listWorlds: () => surfaceProjector.listWorlds(),
    reset: () => surfaceProjector.clearBones(),
  },
  setAgent,
  devAgent,
  reducedMotion,
};

// Development replay of synthetic conversations: open with ?replay
if (new URLSearchParams(location.search).has('replay')) {
  import('./dev/replay.js')
    .then((m) => m.mountReplay({ stage, store, setAgent, reducedMotion }))
    .catch((err) => console.error('[replay] failed to load', err));
}
