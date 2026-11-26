// promptfoo provider: runs one whole conversation through the real Worker
// (worker.fetch -> search -> buildServerPrompt -> callMiniMax, Anthropic endpoint).
// Needs MINIMAX_API_KEY in the process environment and a local Ollama with bge-m3
// (stands in for env.AI embeddings only; there is no chat fallback).
// AGENT_PROMPT_ROOT points at another tree with src/agent/ and deploy/agentfaehig-site/src/.
// EVAL_CALL_FILE (optional) counts model calls across runs; EVAL_CALL_MAX caps them.
// The request headers carry the key and are never read or recorded here.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const OLLAMA = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const from = (root, path) => pathToFileURL(resolve(root, path)).href;

let stopped = '';
let seen = null;
let conversationNo = 0;

function countCall() {
  const file = process.env.EVAL_CALL_FILE;
  if (!file) return;
  const next = (existsSync(file) ? Number(readFileSync(file, 'utf8')) : 0) + 1;
  if (next > Number(process.env.EVAL_CALL_MAX || 200)) throw new Error('call budget exhausted');
  writeFileSync(file, String(next));
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (!String(input).startsWith('https://api.minimax.io/')) return realFetch(input, init);
  if (stopped) throw new Error(stopped);
  countCall();
  const body = JSON.parse(init.body);
  const started = Date.now();
  seen = { system: body.system, model: body.model, status: null, ms: null };
  try {
    const response = await realFetch(input, init);
    seen.status = response.status;
    const data = await response.clone().json().catch(() => null);
    const code = data?.base_resp?.status_code || 0;
    if ([401, 402, 403, 429].includes(response.status) || [1002, 1004, 1008, 2049, 2056].includes(code)) {
      stopped = `STOP: MiniMax auth/quota error, http ${response.status}, code ${code}`;
      console.error(stopped);
    }
    return response;
  } finally {
    seen.ms = Date.now() - started;
  }
};

const embeddingsOnly = {
  run: async (model, input) => {
    if (model !== '@cf/baai/bge-m3') throw new Error('no chat fallback in this eval');
    const res = await realFetch(`${OLLAMA}/api/embed`, { method: 'POST', body: JSON.stringify({ model: 'bge-m3', input: input.text }) });
    return { data: (await res.json()).embeddings };
  },
};

export default class MiniMaxConversationProvider {
  id() {
    return 'agentfaehig-conversation:minimax-worker';
  }

  async callApi(_prompt, context) {
    if (!process.env.MINIMAX_API_KEY) return { error: 'MINIMAX_API_KEY is not set' };
    const root = process.env.AGENT_PROMPT_ROOT || REPO;
    const { default: worker } = await import(from(root, 'deploy/agentfaehig-site/src/worker.js'));
    const { createSurfaceStore } = await import(from(REPO, 'src/surface/surface-state.js'));
    const { parseAdaptationIntent } = await import(from(REPO, 'src/surface/surface-adapter.js'));
    const env = { MINIMAX_API_KEY: process.env.MINIMAX_API_KEY, AI: embeddingsOnly };

    const conversation = ++conversationNo;
    const surface = createSurfaceStore();
    const history = [];
    const turns = [];
    let lastSourceIds = [];
    for (const visitor of String(context.vars.turns).split('|').map((turn) => turn.trim())) {
      if (stopped) return { error: stopped };
      const intent = parseAdaptationIntent(visitor, surface.getState());
      if (intent.action === 'patch') surface.applyPatch(intent.patch, { source: 'conversation' });
      seen = null;
      const response = await worker.fetch(new Request('http://localhost/api/agent', {
        method: 'POST',
        // A fresh address per conversation keeps the Worker's rate limit out of the way.
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': `eval-${process.pid}-${conversation}` },
        body: JSON.stringify({ prompt: visitor, history: history.slice(-6), params: surface.toLegacyParams(), last_source_ids: lastSourceIds }),
      }), env);
      const data = await response.json();
      const ok = response.status === 200 && data.provider === 'minimax';
      const agent = ok ? data.text : '';
      turns.push({
        visitor,
        agent,
        ok,
        status: seen?.status ?? null,
        ms: seen?.ms ?? null,
        model: seen?.model ?? null,
        chunkInPrompt: Boolean(seen?.system?.includes('[[embodiment]]')),
        appearanceInPrompt: Boolean(seen?.system?.includes('Your appearance')),
        sources: ok ? (data.sources || []).map((source) => source.id) : [],
      });
      if (ok) {
        history.push({ role: 'user', content: visitor }, { role: 'assistant', content: agent });
        lastSourceIds = (data.sources || []).map((source) => source.id);
      }
    }
    if (stopped) return { error: stopped };
    return { output: JSON.stringify({ turns }, null, 1) };
  }
}
