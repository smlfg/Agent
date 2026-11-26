// agentfähig.de worker: Living Surface as homepage (static assets) + POST /api/agent
// (MiniMax → OpenAI-kompatibel → Workers AI als letzte, schlüsselfreie Stufe).
// Agent endpoint code taken from DeepSeek agent D1 (tested in deploy/site/test/agent-endpoint.test.mjs).

import { search } from './search.js';
import siteConfig from './site-config.json' with { type: 'json' };
import persona from '../../../src/agent/persona.json' with { type: 'json' };
import { buildServerPrompt } from '../../../src/agent/prompt.js';

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
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const ALLOWED_ORIGIN_HOSTS = new Set([
  "www.xn--agentfhig-02a.de",
  "xn--agentfhig-02a.de",
]);

const agentRateBuckets = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/agent") return handleAgent(request, env);
    if (url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },
};

async function handleAgent(request, env) {
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

  const retrieved = await search({
    query: input.value.prompt,
    history: input.value.history,
    lastSourceIds: input.value.lastSourceIds,
    embedQuery: env.AI ? async (text) => {
      const result = await withTimeout(env.AI.run('@cf/baai/bge-m3', { text: [text] }), 1500);
      return result?.data?.[0] || result?.embeddings?.[0] || result?.result?.data?.[0] || null;
    } : null,
  });
  const messages = buildAgentMessages(input.value, retrieved);

  const attempted = [];
  const startedAt = Date.now();
  const stageMs = () => Math.min(AGENT_TIMEOUT_MS, AGENT_TOTAL_BUDGET_MS - (Date.now() - startedAt));
  const hasTime = () => stageMs() >= AGENT_MIN_STAGE_MS;

  if (env.MINIMAX_API_KEY) {
    attempted.push("minimax");
    const result = await callMiniMax(messages, env, stageMs());
    if (result.ok) {
      return finalizeResponse(result, 'minimax', retrieved);
    }
  }

  if (env.OPENAI_API_KEY && env.OPENAI_MODEL && hasTime()) {
    attempted.push("openai");
    const result = await callOpenAI(messages, env, stageMs());
    if (result.ok) {
      return finalizeResponse(result, result.provider, retrieved);
    }
  }

  if (env.AI && hasTime()) {
    attempted.push("workers-ai");
    const result = await callWorkersAI(messages, env, stageMs());
    if (result.ok) {
      return finalizeResponse(result, 'workers-ai', retrieved);
    }
  }

  if (!attempted.length) return json({ error: "no_provider" }, 503);
  return json({ error: "providers_unavailable", attempts: attempted }, 503);
}

function normalizeAgentInput(payload) {
  const prompt = trimMax(payload?.prompt, AGENT_PROMPT_MAX);
  if (!prompt) {
    return { ok: false, error: "A prompt is required." };
  }

  let history = [];
  if (Array.isArray(payload?.history)) {
    history = payload.history
      .slice(-AGENT_HISTORY_MAX)
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
  return { ok: true, value: { prompt, history, params, lastSourceIds } };
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
  const raw = String(result.text || '');
  const markers = [...raw.matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => match[1]);
  const allowed = new Map(retrieved.hits.map((hit) => [hit.id, hit]));
  const validIds = [...new Set(markers.filter((id) => allowed.has(id)))];
  const text = raw.replace(/\[\[[^\]]+\]\]/g, '').replace(/\s{2,}/g, ' ').trim();
  const sources = validIds.map((id) => ({ id, title: allowed.get(id).title, link: allowed.get(id).link ?? null }));
  const coverage = retrieved.coverage;
  if (coverage === 'GIVEN' && !validIds.length) console.warn('agent_uncited', JSON.stringify({ coverage, hit_count: retrieved.hits.length }));
  return json({
    text,
    sources,
    contact_card: Boolean(retrieved.business && siteConfig.contact?.approved),
    coverage,
    ...(coverage === 'GIVEN' && !validIds.length ? { uncited: true } : {}),
    provider,
    model: result.model,
  });
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
      return { ok: false, status: response.status, detail };
    }

    const data = await response.json();
    const text = stripThinking((data?.content || [])
      .filter((block) => block?.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("")
      .trim());
    if (!text) {
      console.warn("agent_provider_empty", "minimax", data?.stop_reason ?? null);
      return { ok: false };
    }

    return { ok: true, text, model };
  } catch (error) {
    console.warn("agent_provider_error", "minimax", error?.name ?? "error");
    return { ok: false };
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
      return { ok: false };
    }

    const data = await response.json();
    const text = stripThinking(extractChatText(data));
    if (!text) return { ok: false };

    return { ok: true, text, provider, model };
  } catch (error) {
    console.warn("agent_provider_error", provider, error?.name ?? "error");
    return { ok: false };
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
      return { ok: false };
    }
    return { ok: true, text, model };
  } catch (error) {
    console.warn("agent_provider_error", "workers-ai", error?.name ?? "error");
    return { ok: false };
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
  return String(text || "")
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, " ")
    .replace(/<think\b[^>]*>[\s\S]*$/gi, " ")
    .replace(/<\/?think\b[^>]*>/gi, " ")
    .trim();
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
