// agentfähig.de worker: Living Surface as homepage (static assets) + POST /api/agent (MiniMax, OpenAI fallback).
// Agent endpoint code taken from DeepSeek agent D1 (tested in deploy/site/test/agent-endpoint.test.mjs).

const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const MINIMAX_ANTHROPIC_BASE_URL = "https://api.minimax.io/anthropic";
const DEFAULT_MINIMAX_MODEL = "MiniMax-M3.1-Flash";
const AGENT_SYSTEM_DEFAULT = "You are the presence on agentfähig.de, a website that behaves like an agent, built by Samuel. Answer in one to three short sentences. React to what the visitor says. Never say 'How can I help'. Be warm, curious and honest. No lists, no markdown.";
const AGENT_TIMEOUT_MS = 9000;
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

  const messages = buildAgentMessages(input.value);

  if (env.MINIMAX_API_KEY) {
    const result = await callMiniMax(messages, env);
    if (result.ok) {
      return json({ text: result.text, provider: "minimax", model: result.model });
    }
  }

  if (env.OPENAI_API_KEY && env.OPENAI_MODEL) {
    const result = await callOpenAI(messages, env);
    if (result.ok) {
      return json({ text: result.text, provider: "openai", model: result.model });
    }
  }

  return json({ error: "no_provider" }, 503);
}

function normalizeAgentInput(payload) {
  const prompt = trimMax(payload?.prompt, AGENT_PROMPT_MAX);
  if (!prompt) {
    return { ok: false, error: "A prompt is required." };
  }

  let system = "";
  if (payload?.system !== undefined && payload?.system !== null) {
    system = trimMax(payload.system, AGENT_SYSTEM_MAX);
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

  return { ok: true, value: { prompt, system, history } };
}

function buildAgentMessages({ prompt, system, history }) {
  const messages = [];
  messages.push({ role: "system", content: system || AGENT_SYSTEM_DEFAULT });
  for (const item of history) {
    messages.push({ role: item.role, content: item.content });
  }
  messages.push({ role: "user", content: prompt });
  return messages;
}

async function callMiniMax(messages, env) {
  // MiniMax keys from Samuel's Token/Coding plan work on the Anthropic-compatible
  // endpoint (same as Hermes: https://api.minimax.io/anthropic, model MiniMax-M3.1-Flash).
  const model = env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL;
  const base = env.MINIMAX_BASE_URL || MINIMAX_ANTHROPIC_BASE_URL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);
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

async function callOpenAI(messages, env) {
  const model = env.OPENAI_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: AGENT_MAX_TOKENS,
        temperature: AGENT_TEMPERATURE,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false };

    const data = await response.json();
    const text = stripThinking(extractChatText(data));
    if (!text) return { ok: false };

    return { ok: true, text, model };
  } catch (error) {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

function extractChatText(data) {
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
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
