// promptfoo provider: runs one whole conversation against a local Ollama model with
// the real server prompt (buildServerPrompt) and the real retrieval (search).
// Mirrors worker.js (system + history + user, citation markers removed) and
// remoteAgent.js (last 3 exchanges, surface params). Not mirrored: the production
// models, the stage timeouts and the browser's brief-length cut.
// AGENT_PROMPT_ROOT points at another tree with src/agent/ to measure an older prompt.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const OLLAMA = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const from = (root, path) => pathToFileURL(resolve(root, path)).href;

async function ollama(path, body) {
  const res = await fetch(`${OLLAMA}${path}`, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Ollama ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

export default class ConversationProvider {
  constructor(options = {}) {
    this.model = process.env.OLLAMA_MODEL || options.config?.model || 'qwen3:8b';
  }

  id() {
    return `agentfaehig-conversation:${this.model}`;
  }

  async callApi(_prompt, context) {
    const root = process.env.AGENT_PROMPT_ROOT || REPO;
    const { buildServerPrompt } = await import(from(root, 'src/agent/prompt.js'));
    const persona = JSON.parse(await readFile(resolve(root, 'src/agent/persona.json'), 'utf8'));
    const { search } = await import(from(REPO, 'deploy/agentfaehig-site/src/search.js'));
    const { createSurfaceStore } = await import(from(REPO, 'src/surface/surface-state.js'));
    const { parseAdaptationIntent } = await import(from(REPO, 'src/surface/surface-adapter.js'));
    const site = JSON.parse(await readFile(resolve(REPO, 'deploy/agentfaehig-site/src/site-config.json'), 'utf8'));

    const surface = createSurfaceStore();
    const history = [];
    const turns = [];
    let lastSourceIds = [];
    for (const visitor of String(context.vars.turns).split('|').map((turn) => turn.trim())) {
      const intent = parseAdaptationIntent(visitor, surface.getState());
      if (intent.action === 'patch') surface.applyPatch(intent.patch, { source: 'conversation' });
      const params = {};
      for (const [key, value] of Object.entries(surface.toLegacyParams())) {
        const spec = site.persona_params[key];
        if (spec) params[key] = Math.min(spec.max, Math.max(spec.min, value));
      }
      const recent = history.slice(-6);
      const retrieved = await search({
        query: visitor,
        history: recent,
        lastSourceIds,
        embedQuery: async (text) => (await ollama('/api/embed', { model: 'bge-m3', input: [text] })).embeddings?.[0] || null,
      });
      const system = buildServerPrompt({
        persona, params, retrieved,
        fallback: 'Dazu habe ich nichts Belegtes. Ich kann dir erklären, was HAI ist, woran Samuel arbeitet oder wie diese Seite funktioniert.',
      });
      const data = await ollama('/api/chat', {
        model: this.model,
        stream: false,
        think: false,
        messages: [{ role: 'system', content: system }, ...recent, { role: 'user', content: visitor }],
        options: { temperature: 0.8, num_predict: 900, num_ctx: 16384 },
      });
      const raw = String(data.message?.content || '').replace(/<think[\s\S]*?<\/think>/gi, '');
      lastSourceIds = [...raw.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1])
        .filter((id) => retrieved.hits.some((hit) => hit.id === id)).slice(0, 5);
      const agent = raw.replace(/\[\[[^\]]+\]\]/g, '').replace(/\s{2,}/g, ' ').trim();
      history.push({ role: 'user', content: visitor }, { role: 'assistant', content: agent });
      turns.push({ visitor, agent });
    }
    return { output: JSON.stringify({ turns }, null, 1) };
  }
}
