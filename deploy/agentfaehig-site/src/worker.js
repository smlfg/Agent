// agentfähig.de worker: Living Surface as homepage (static assets) + POST /api/agent
// (MiniMax → OpenAI-kompatibel → Workers AI als letzte, schlüsselfreie Stufe).
// Agent endpoint code taken from DeepSeek agent D1 (tested in deploy/site/test/agent-endpoint.test.mjs).

import { search } from './search.js';
import siteConfig from './site-config.json' with { type: 'json' };
import persona from '../../../src/agent/persona.json' with { type: 'json' };
import { buildServerPrompt } from '../../../src/agent/prompt.js';
import { createAgentEvent, formatSseFrame, turnIdFor } from '../../../src/state/agent-events.js';

const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const MINIMAX_ANTHROPIC_BASE_URL = "https://api.minimax.io/anthropic";
const DEFAULT_MINIMAX_MODEL = "MiniMax-M3.1-Flash";
// Zweiter, echter Anbieter über die OpenAI-kompatible Schnittstelle (OpenRouter).
// Bleibt optional: ohne OPENAI_API_KEY und OPENAI_MODEL wird er übersprungen.
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
// Dritte Stufe: Workers AI über das native Binding. Braucht keinen Schlüssel und
// kein Guthaben; läuft auf dem freien Neuronen-Kontingent. Modell per Var änderbar.
const DEFAULT_WORKERS_AI_MODEL = "@cf/zai-org/glm-4.7-flash";
const AGENT_SYSTEM_DEFAULT = "You are the presence on agentfähig.de, the public embodiment of the Human-Agent Interface (HAI) built by Samuel — an interface where human and agent work as one system and the website itself is experienced as an agent rather than a document with a separate chatbot. Answer in one to three short sentences. React to what the visitor says. Never say 'How can I help'. Be warm, curious and honest. No lists, no markdown.";
const AGENT_TIMEOUT_MS = 4000; // pro Anbieter; Responsiveness-Vorgabe: Gesamtzeit klein halten
const AGENT_TOTAL_BUDGET_MS = 9000; // Gesamtbudget aller Stufen; Client bricht bei 10 s ab
const AGENT_MIN_STAGE_MS = 1500;
const AGENT_MAX_TOKENS = 900; // M3.1-Flash always reasons; reasoning tokens count against this budget
const AGENT_TEMPERATURE = 0.8;
const AGENT_PROMPT_MAX = 600;
const AGENT_HISTORY_MAX = 6;
const AGENT_HISTORY_ITEM_MAX = 600;
const AGENT_SYSTEM_MAX = 4000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const ALLOWED_ORIGIN_HOSTS = new Set([
  "www.xn--agentfhig-02a.de",
  "xn--agentfhig-02a.de",
]);

const agentRateBuckets = new Map();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/agent") return handleAgent(request, env, ctx);
    if (url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },
};

export function wantsEventStream(request, payload) {
  if (Boolean(payload?.stream)) return true;
  return (request.headers.get('accept') || '').toLowerCase().includes('text/event-stream');
}

export async function runWorkerTools(tools, context, emitEvent) {
  const emit = (partial) => {
    if (typeof emitEvent === 'function') {
      try {
        emitEvent(partial);
      } catch {
        /* ignore */
      }
    }
  };

  const runOne = async (tool, idx) => {
    const name = String(tool?.name ?? `tool-${idx}`);
    const action_id = `tool-${name}-${idx}`;
    const maxRetries = Number.isFinite(tool?.maxRetries) ? tool.maxRetries : 0;
    const retryDelayMs = Number.isFinite(tool?.retryDelayMs) ? tool.retryDelayMs : 50;
    let attempt = 0;

    emit({
      type: 'tool.started',
      action_id,
      metadata: { tool: name, attempt: 1 },
    });

    for (;;) {
      attempt += 1;
      const startedAt = Date.now();
      try {
        await tool.run(context, { attempt });
        emit({
          type: 'tool.completed',
          action_id,
          duration_ms: Math.max(0, Date.now() - startedAt),
          metadata: { tool: name, attempt },
        });
        return;
      } catch (error) {
        if (attempt <= maxRetries) {
          emit({
            type: 'tool.retry',
            action_id,
            metadata: {
              tool: name,
              attempt: attempt + 1,
              reason: error?.code || error?.name || 'error',
            },
          });
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          continue;
        }
        const isTimeout = error?.name === 'TimeoutError';
        emit({
          type: 'tool.failed',
          action_id,
          status: isTimeout ? 'timeout' : 'error',
          duration_ms: Math.max(0, Date.now() - startedAt),
          metadata: { tool: name, reason: error?.code || error?.name || 'error' },
        });
        throw error;
      }
    }
  };

  await Promise.all(tools.map((tool, idx) => runOne(tool, idx)));
}

function buildFinalPayload(result, provider, retrieved) {
  const raw = String(result.text || '');
  const markers = [...raw.matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => match[1]);
  const allowed = new Map(retrieved.hits.map((hit) => [hit.id, hit]));
  const validIds = [...new Set(markers.filter((id) => allowed.has(id)))];
  const text = raw.replace(/\[\[[^\]]+\]\]/g, '').replace(/\s{2,}/g, ' ').trim();
  const sources = validIds.map((id) => ({ id, title: allowed.get(id).title, link: allowed.get(id).link ?? null }));
  const coverage = retrieved.coverage;
  if (coverage === 'GIVEN' && !validIds.length) {
    console.warn('agent_uncited', JSON.stringify({ coverage, hit_count: retrieved.hits.length }));
  }
  return {
    text,
    sources,
    contact_card: Boolean(retrieved.business && siteConfig.contact?.approved),
    coverage,
    ...(coverage === 'GIVEN' && !validIds.length ? { uncited: true } : {}),
    provider,
    model: result.model,
  };
}

function providerFailureReason(error, response) {
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return 'timeout';
  if (response) return `http_${response.status}`;
  return 'network';
}

function openAiProviderLabel(env) {
  const base = String(env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, '');
  return env.OPENAI_PROVIDER || (base.includes('openrouter.ai') ? 'openrouter' : 'openai');
}

export async function executeAgentTurn({ input, env, emitEvent, turnStartMs }) {
  const emit = (partial) => {
    if (typeof emitEvent === 'function') {
      try {
        emitEvent(partial);
      } catch {
        /* ignore */
      }
    }
  };

  emit({
    type: 'turn.received',
    action_id: 'turn-001',
    status: 'running',
    metadata: { has_history: input.history.length > 0 },
  });

  emit({
    type: 'context.prepared',
    action_id: 'context-001',
    status: 'success',
    duration_ms: 0,
    metadata: {
      history_items: input.history.length,
      param_keys: Object.keys(input.params).length,
      anchor_sources: input.lastSourceIds.length,
    },
  });

  const retrieved = await search({
    query: input.prompt,
    history: input.history,
    lastSourceIds: input.lastSourceIds,
    turnId: input.turnId,
    onEvent: emitEvent,
    embedQuery: env.AI
      ? async (text) => {
          const result = await withTimeout(env.AI.run('@cf/baai/bge-m3', { text: [text] }), 1500);
          return result?.data?.[0] || result?.embeddings?.[0] || result?.result?.data?.[0] || null;
        }
      : null,
  });

  if (Array.isArray(env?.AGENT_TOOLS) && env.AGENT_TOOLS.length > 0) {
    await runWorkerTools(env.AGENT_TOOLS, { retrieved, params: input.params }, emitEvent);
  }

  const messages = buildAgentMessages(input, retrieved);
  const attempted = [];
  const startedAt = Date.now();
  const stageMs = () => Math.min(AGENT_TIMEOUT_MS, AGENT_TOTAL_BUDGET_MS - (Date.now() - startedAt));
  const hasTime = () => stageMs() >= AGENT_MIN_STAGE_MS;

  const tryStage = async ({ stageKey, eventProvider, resolvedModel, call }) => {
    const attemptNum = attempted.length + 1;
    if (attempted.length > 0) {
      const from = attempted[attempted.length - 1];
      emit({
        type: 'provider.switched',
        action_id: `provider-${attemptNum}`,
        metadata: { from, to: eventProvider, attempt: attemptNum },
      });
    }

    emit({
      type: 'provider.started',
      action_id: `provider-${attemptNum}`,
      metadata: { provider: eventProvider, attempt: attemptNum },
    });

    emit({
      type: 'generation.started',
      action_id: `gen-${attemptNum}`,
      metadata: { provider: eventProvider, model: resolvedModel },
    });

    attempted.push(stageKey);
    const stageStart = Date.now();
    const result = await call();
    const stageDurationMs = Math.max(0, Date.now() - stageStart);

    if (result.ok) {
      const finalProviderName = result.provider || eventProvider;
      const payload = buildFinalPayload(result, finalProviderName, retrieved);
      emit({
        type: 'generation.completed',
        action_id: `gen-${attempted.length}`,
        duration_ms: stageDurationMs,
        metadata: {
          provider: finalProviderName,
          model: result.model,
          cited_sources: payload.sources.length,
        },
      });
      return { ok: true, payload };
    }

    emit({
      type: 'provider.failed',
      action_id: `provider-${attempted.length}`,
      status: result.reason === 'timeout' ? 'timeout' : 'error',
      duration_ms: stageDurationMs,
      metadata: {
        provider: eventProvider,
        reason: result.reason || 'failed',
        ...(result.status ? { http_status: result.status } : {}),
      },
    });
    return null;
  };

  if (env.MINIMAX_API_KEY) {
    const model = env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL;
    const outcome = await tryStage({
      stageKey: 'minimax',
      eventProvider: 'minimax',
      resolvedModel: model,
      call: () => callMiniMax(messages, env, stageMs()),
    });
    if (outcome) return outcome;
  }

  if (env.OPENAI_API_KEY && env.OPENAI_MODEL && hasTime()) {
    const eventProvider = openAiProviderLabel(env);
    const outcome = await tryStage({
      stageKey: 'openai',
      eventProvider,
      resolvedModel: env.OPENAI_MODEL,
      call: () => callOpenAI(messages, env, stageMs()),
    });
    if (outcome) return outcome;
  }

  if (env.AI && hasTime()) {
    const model = env.WORKERS_AI_MODEL || DEFAULT_WORKERS_AI_MODEL;
    const outcome = await tryStage({
      stageKey: 'workers-ai',
      eventProvider: 'workers-ai',
      resolvedModel: model,
      call: () => callWorkersAI(messages, env, stageMs()),
    });
    if (outcome) return outcome;
  }

  const errCode = !attempted.length ? 'no_provider' : 'providers_unavailable';
  emit({
    type: 'system.error',
    action_id: 'system-001',
    status: 'error',
    metadata: { code: errCode, attempts_count: attempted.length, attempts: attempted },
  });

  return {
    ok: false,
    status: 503,
    errorPayload: !attempted.length
      ? { error: 'no_provider' }
      : { error: 'providers_unavailable', attempts: attempted },
  };
}

async function handleAgent(request, env, ctx) {
  if (request.method !== "POST") {
    return json({ error: "Only POST requests are accepted." }, 405, { Allow: "POST" });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "Requests must be JSON." }, 415);
  }

  const url = new URL(request.url);
  if (!isAllowedOrigin(request, url)) {
    return json({ error: "Origin not allowed." }, 403);
  }

  if (isRateLimited(clientIp(request))) {
    return json({ error: "Too many requests." }, 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "JSON could not be read." }, 400);
  }

  const input = normalizeAgentInput(payload);
  if (!input.ok) {
    return json({ error: input.error }, 400);
  }

  const turnStartMs = Date.now();
  const streaming = wantsEventStream(request, payload);

  if (!streaming) {
    const outcome = await executeAgentTurn({
      input: input.value,
      env,
      emitEvent: null,
      turnStartMs,
    });
    if (outcome.ok) return json(outcome.payload, 200);
    return json(outcome.errorPayload, outcome.status);
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  let writeChain = Promise.resolve();

  const emitEvent = (partial) => {
    let ev;
    try {
      ev = createAgentEvent({ ...partial, turn_id: input.value.turnId }, { turnStartMs });
    } catch {
      return;
    }
    writeChain = writeChain
      .then(() => writer.write(encoder.encode(formatSseFrame('agent.event', ev))))
      .catch(() => {});
  };

  const streamTask = (async () => {
    try {
      const outcome = await executeAgentTurn({
        input: input.value,
        env,
        emitEvent,
        turnStartMs,
      });

      if (outcome.ok) {
        writeChain = writeChain
          .then(() => writer.write(encoder.encode(formatSseFrame('agent.result', outcome.payload))))
          .catch(() => {});
        emitEvent({
          type: 'turn.completed',
          action_id: 'turn-001',
          status: 'success',
          duration_ms: Math.max(0, Date.now() - turnStartMs),
          metadata: {
            provider: outcome.payload.provider,
            coverage: outcome.payload.coverage,
            sources: outcome.payload.sources.length,
          },
        });
      } else {
        writeChain = writeChain
          .then(() =>
            writer.write(
              encoder.encode(
                formatSseFrame('agent.error', { ...outcome.errorPayload, status: outcome.status }),
              ),
            ),
          )
          .catch(() => {});
      }

      await writeChain;
      try {
        await writer.close();
      } catch {
        /* client may have disconnected */
      }
    } catch {
      try {
        await writer.close();
      } catch {
        /* ignore */
      }
    }
  })();

  if (typeof ctx?.waitUntil === 'function') {
    ctx.waitUntil(streamTask);
  }

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}

function normalizeAgentInput(payload) {
  const prompt = trimMax(payload?.prompt, AGENT_PROMPT_MAX);
  if (!prompt) {
    return { ok: false, error: "A prompt is required." };
  }

  let history = [];
  if (Array.isArray(payload?.history)) {
    history = payload.history
      .slice(0, AGENT_HISTORY_MAX)
      .map((item) => ({
        role: item?.role === "assistant" ? "assistant" : "user",
        content: trimMax(item?.content, AGENT_HISTORY_ITEM_MAX),
      }))
      .filter((item) => item.content);
  }

  const params = clampParams(payload?.params);
  const lastSourceIds = Array.isArray(payload?.last_source_ids)
    ? payload.last_source_ids.filter((id) => typeof id === 'string').slice(0, 5)
    : [];
  const turnId = turnIdFor(payload?.turn_id ?? 1);
  const stream = Boolean(payload?.stream);
  return { ok: true, value: { prompt, history, params, lastSourceIds, turnId, stream } };
}

function clampParams(value) {
  const out = {};
  if (!value || typeof value !== 'object') return out;
  for (const [key, spec] of Object.entries(siteConfig.persona_params || {})) {
    if (!Number.isFinite(Number(value[key]))) continue;
    const number = Number(value[key]);
    out[key] = Math.min(Number(spec.max), Math.max(Number(spec.min), number));
  }
  return out;
}

function buildAgentMessages({ prompt, history, params }, retrieved) {
  const messages = [];
  messages.push({ role: "system", content: buildServerPrompt({ persona, params, retrieved, fallback: FALLBACK_DE }) });
  for (const item of history) {
    messages.push({ role: item.role, content: item.content });
  }
  messages.push({ role: "user", content: prompt });
  return messages;
}

const FALLBACK_DE = 'Dazu habe ich nichts Belegtes. Ich kann dir erklären, was HAI ist, woran Samuel arbeitet oder wie diese Seite funktioniert.';

function finalizeResponse(result, provider, retrieved) {
  return json(buildFinalPayload(result, provider, retrieved));
}

async function callMiniMax(messages, env, timeoutMs = AGENT_TIMEOUT_MS) {
  // MiniMax keys from Samuel's Token/Coding plan work on the Anthropic-compatible
  // endpoint (same as Hermes: https://api.minimax.io/anthropic, model MiniMax-M3.1-Flash).
  const model = env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL;
  const base = env.MINIMAX_BASE_URL || MINIMAX_ANTHROPIC_BASE_URL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns = messages.filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const response = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": env.MINIMAX_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        system,
        messages: turns,
        max_tokens: AGENT_MAX_TOKENS,
        temperature: AGENT_TEMPERATURE,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Diagnose ohne Secrets und ohne Nutzerinhalt: nur Status, Fehlertyp, Providermeldung, Rate-Limit-Header.
      let detail = null;
      try {
        const body = await response.json();
        detail = {
          type: body?.error?.type ?? body?.type ?? null,
          message: String(body?.error?.message ?? body?.base_resp?.status_msg ?? "").slice(0, 200),
          code: body?.base_resp?.status_code ?? null,
        };
      } catch {}
      const rl = {};
      for (const [k, v] of response.headers) if (/ratelimit|retry-after/i.test(k)) rl[k] = v;
      console.warn("agent_provider_status", "minimax", response.status, JSON.stringify(detail), JSON.stringify(rl));
      return {
        ok: false,
        status: response.status,
        detail,
        reason: providerFailureReason(null, response),
      };
    }

    const data = await response.json();
    const text = stripThinking((data?.content || [])
      .filter((block) => block?.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("")
      .trim());
    if (!text) {
      console.warn("agent_provider_empty", "minimax", data?.stop_reason ?? null);
      return { ok: false, reason: 'empty' };
    }

    return { ok: true, text, model };
  } catch (error) {
    console.warn("agent_provider_error", "minimax", error?.name ?? "error");
    return { ok: false, reason: providerFailureReason(error, null) };
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAI(messages, env, timeoutMs = AGENT_TIMEOUT_MS) {
  const model = env.OPENAI_MODEL;
  const base = String(env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, "");
  const provider = env.OPENAI_PROVIDER || (base.includes("openrouter.ai") ? "openrouter" : "openai");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // OpenRouter empfiehlt Herkunfts-Header; ohne sie funktioniert der Aufruf,
  // die Zuordnung im Dashboard fehlt aber.
  const headers = {
    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };
  if (base.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://www.xn--agentfhig-02a.de/";
    headers["X-Title"] = "agentfaehig.de";
  }

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: AGENT_MAX_TOKENS,
        temperature: AGENT_TEMPERATURE,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Nur Status und Fehlertyp protokollieren, nie Schlüssel oder Besucherinhalt.
      let detail = null;
      try {
        const body = await response.json();
        detail = {
          type: body?.error?.type ?? body?.type ?? null,
          message: String(body?.error?.message ?? "").slice(0, 200),
        };
      } catch {}
      console.warn("agent_provider_status", provider, response.status, JSON.stringify(detail));
      return {
        ok: false,
        status: response.status,
        reason: providerFailureReason(null, response),
      };
    }

    const data = await response.json();
    const text = stripThinking(extractChatText(data));
    if (!text) return { ok: false, reason: 'empty' };

    return { ok: true, text, provider, model };
  } catch (error) {
    console.warn("agent_provider_error", provider, error?.name ?? "error");
    return { ok: false, reason: providerFailureReason(error, null) };
  } finally {
    clearTimeout(timer);
  }
}

function extractChatText(data) {
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

async function callWorkersAI(messages, env, timeoutMs = AGENT_TIMEOUT_MS) {
  const model = env.WORKERS_AI_MODEL || DEFAULT_WORKERS_AI_MODEL;
  try {
    // AI.run kennt kein AbortSignal; die Zeitgrenze wird deshalb um das Promise gelegt.
    const run = env.AI.run(model, {
      messages,
      max_tokens: AGENT_MAX_TOKENS,
      temperature: AGENT_TEMPERATURE,
    });
    const data = await withTimeout(run, timeoutMs);
    const text = stripThinking(workersAiText(data));
    if (!text) {
      console.warn("agent_provider_empty", "workers-ai", model);
      return { ok: false, reason: 'empty' };
    }
    return { ok: true, text, model };
  } catch (error) {
    console.warn("agent_provider_error", "workers-ai", error?.name ?? "error");
    return { ok: false, reason: providerFailureReason(error, null) };
  }
}

// Workers AI liefert je nach Modell { response } oder { choices: [...] }.
function workersAiText(data) {
  if (typeof data === "string") return data;
  if (typeof data?.response === "string") return data.response;
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`timed out after ${ms}ms`);
      error.name = "TimeoutError";
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function stripThinking(text) {
  return String(text || "").replace(/<think[\s\S]*?<\/think>/gi, "").trim();
}

function isAllowedOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch (error) {
    return false;
  }

  if (originHost === url.host.toLowerCase()) return true;
  return ALLOWED_ORIGIN_HOSTS.has(originHost);
}

function clientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = agentRateBuckets.get(ip);

  if (agentRateBuckets.size > 5000) {
    for (const [key, value] of agentRateBuckets) {
      if (now - value.windowStart >= RATE_LIMIT_WINDOW_MS) {
        agentRateBuckets.delete(key);
      }
    }
  }

  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    agentRateBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(status === 204 ? null : JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}
function trimMax(value, max) {
  return String(value || "").trim().slice(0, max);
}
