`or reasoning fields.
- max_tokens 160, temperature 0.8, timeout 9s.
- Note: MiniMax-M3.1-Flash "always thinks" and `reasoning_effort` default is `max`. There might be latency concerns but we follow the task: max_tokens 160, temperature 0.8. Actually, the task says set max_tokens 160 and temperature 0.8. Note the OpenAI-compatible protocol accepts `max_tokens` / `max_completion_tokens`.

Actually there's a concern: MiniMax-M3.1-Flash always thinks and default reasoning effort is `max`, which could be slow (9s timeout). But the task explicitly instructs to use max_tokens 160, temperature 0.8. I could optionally add `reasoning_effort: "low"` to reduce latency, but the task doesn't ask for it. I should keep it minimal and faithful to instructions. Actually, to be safe and avoid overthinking, I'll follow the instructions exactly: max_tokens 160, temperature 0.8. I won't add reasoning_effort since not requested. Hmm, but thinking "always thinks" by default at `max` effort might exceed 9s timeout. But that's the owner's design choice and there's a fallback chain. I'll keep to spec. Actually let me consider: the task says "max_tokens 160, temperature 0.8, Timeout 9s". I'll do exactly that.

Now let me check the current index.html head to see if handleHomepage's `<html lang="en">` replace will still work for /classic. The existing index.html has `<html lang="en">` — confirmed handleHomepage works on it.

Now let me plan the implementation.

### Part 1: Startseite
- GET "/" and "/index.html" → serve surface/living-surface.html with injected `<base href="/surface/">` directly after `<head>`.
- Old homepage (handleHomepage) stays under "/classic/".
- Add "/classic", "/classic/*" to run_worker_first.
- Cache: "/" response gets `cache-control: public, max-age=0, must-revalidate`.

Wait, "ALLE anderen Pfade ... bleiben exakt wie sie sind". And "/classic/" should serve the old homepage. Currently `/` and `/index.html` route to handleHomepage. So now:
- `/` and `/index.html` → living surface
- `/classic/` (and maybe `/classic` and `/classic/*`?) → handleHomepage with the old index.html logic.

The task says: "Die bisherige Startseite (handleHomepage) bleibt unter "/classic/" erreichbar (gleiche Logik)."

So GET "/classic/" → handleHomepage. What about "/classic" without trailing slash? Let me handle both "/classic" and "/classic/". Actually the run_worker_first example says `"/classic", "/classic/*"`. Let me route `/classic` and `/classic/` to handleHomepage.

But handleHomepage fetches `env.ASSETS.fetch(request)` with the original request URL. If URL is `/classic/`, it would fetch `/classic/` from assets, which doesn't exist. So I need to rewrite the URL to `/index.html` (or `/`) before fetching assets.

Let me look at handleHomepage again: it calls `env.ASSETS.fetch(request)` using the original request. For the new /classic route, I need to rewrite the path to `/index.html`.

Actually the current handleHomepage works because `/` and `/index.html` map to the actual index.html asset. For /classic, I need a new version that rewrites to `/index.html`.

Let me create:
- `handleLivingSurface(request, env)`: fetches `surface/living-surface.html` from assets, injects `<base href="/surface/">` after `<head>`, sets cache-control public/max-age=0/must-revalidate.
- Modify routing: 
  - GET "/" or "/index.html" → handleLivingSurface
  - GET "/classic" or "/classic/" → handleClassic (rewrite to /index.html, use existing handleHomepage logic but with rewritten request)

Actually let me restructure handleHomepage to accept a target asset path. Or simpler: create a new function that rewrites request URL to /index.html then calls existing handleHomepage. handleHomepage uses `new URL(request.url)` and `env.ASSETS.fetch(request)`. If I create a new Request with pathname "/index.html", it will work.

Let me write a helper `rewriteAssetPath(request, newPath)`.

Let me write the code.

For living surface, the inject: after `<head>`. The file has:
```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
```

I need to inject `<base href="/surface/">` directly after `<head>`. The task says "direkt nach <head>". So replace `<head>` with `<head><base href="/surface/">`. But `<head>` might be `<head>` with no attributes (confirmed it's exactly `<head>` on line 3).

I'll do a robust replace: `html.replace(/<head>/i, '<head><base href="/surface/">')`. But careful: what if there are attributes? It's `<head>` plain. I'll match `<head>` case-insensitively, first occurrence.

Actually to be safe, I'll do `html.replace("<head>", '<head>\n<base href="/surface/">')` but the file might have `<head>` exactly. Confirmed line 3 is `<head>`. I'll use a regex replace of the first `<head>`.

### Part 2: POST /api/agent

Implementation details:
- Route: `if (url.pathname === "/api/agent") return handleAgent(request, env);`
- Method check: only POST + OPTIONS (CORS preflight). Actually the surface is same-origin, so CORS not strictly needed. But the remoteAgent sends same-origin fetch. Let me still handle OPTIONS minimally? The task says "nur POST". Let me check the existing pattern: handleHarnessCheckChat handles OPTIONS with CORS. But for same-origin, no preflight needed. The task says "Schutz: nur POST + Content-Type application/json". I'll accept POST only, return 405 for others. I could add OPTIONS for CORS safety but origin check is required. Let me keep it simple: POST only, 405 otherwise. Actually to be safe with the browser's own behavior and not break, but the fetch is same-origin JSON POST with content-type application/json — that's a "simple request" for same-origin? Actually cross-origin triggers preflight, but same-origin doesn't. Since it's same-origin, no preflight. I'll just do POST. But I'll also add CORS headers to responses? Not necessary. Keep minimal.

Origin check: "Origin-Prüfung auf die eigene Domain (beide Schreibweisen, www und apex) bzw. same-origin". So:
- If Origin header present: must be https://www.agentfähig.de, https://agentfähig.de, https://www.xn--agentfhig-02a.de, https://xn--agentfhig-02a.de (and maybe http:// for local dev? "bzw. same-origin" means same-origin allowed too). Actually the rule: check Origin against own domain OR same-origin. Same-origin means if Origin equals the request's own origin (host header matches). Let me implement:
  - Compute allowed origins set.
  - If `Origin` header is present, allow if it's in allowed set. Otherwise also allow if no origin (same-origin GET-ish) — but for POST with content-type application/json, browsers always send Origin for cross-origin, and for same-origin fetch they typically DO send Origin too? Actually same-origin fetch POST does NOT include Origin header in most browsers (Origin is sent for CORS requests and for POST in some cases). Hmm. Actually for same-origin requests, the `Origin` header is generally not sent except for POST? Let me recall: Fetch spec — Origin header is added for CORS requests and for non-GET/HEAD requests (POST) regardless of same-origin in some cases. Actually the Origin header is sent for POST requests even same-origin in some browsers, but for same-origin POST, Chrome does send Origin? 

  Let me be permissive but safe. The task says "Origin-Prüfung auf die eigene Domain ... bzw. same-origin". So logic: if Origin present, verify it matches own domain (allow both xn-- and punycode www/apex). Also allow same-origin: i.e., if Origin host equals request host (the `Host` header / url.host). Let me implement:

```
function isAllowedOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin non-CORS requests often omit Origin
  try {
    const originUrl = new URL(origin);
    const host = originUrl.host.toLowerCase(); // punycode normalized
    const allowed = new Set([
      "www.agentfähig.de", // actually URL.host gives punycode: "www.xn--agentfhig-02a.de"
      ...
    ]);
    ...
  }
}
```

Important: `new URL("https://www.agentfähig.de").host` returns the punycode form "www.xn--agentfhig-02a.de". So I should compare against punycode forms. Both "www.xn--agentfhig-02a.de" and "xn--agentfhig-02a.de". Plus also allow same-origin: origin host equals request url.host.

Let me define:
```
const ALLOWED_ORIGIN_HOSTS = new Set([
  "www.xn--agentfhig-02a.de",
  "xn--agentfhig-02a.de",
]);
```

And check:
```
if (!origin) return true; // e.g. curl / same-origin without Origin
let originHost;
try { originHost = new URL(origin).host.toLowerCase(); } catch { return false; }
if (originHost === url.host.toLowerCase()) return true; // same-origin
return ALLOWED_ORIGIN_HOSTS.has(originHost);
```

This covers both www/apex in punycode (new URL normalizes to punycode). Also "same-origin" covers dev environments (localhost).

Rate limiting: in-memory per-IP, 20 req/10min. Use a Map keyed by IP (from CF-Connecting-IP or x-forwarded-for). Best effort. Clean up old entries periodically.

Let me implement a simple sliding-window or fixed window. I'll use: `const rateLimit = new Map()` at module scope. Key = IP. Value = array of timestamps or a count+windowStart. Simple fixed window of 10 min: store `{count, windowStart}`. If now - windowStart > 10min, reset.

```
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) return true;
  return false;
}
```

Also clean up map if it grows large (e.g. > 1000 entries). Best effort.

Validation:
- prompt: string, max 600 chars. Required.
- history: array, max 6 entries, each role/content, content max 600, role in {user, assistant} (remoteAgent sends user/assistant). Let me validate role ∈ {user, assistant, system}? The spec says [{role, content}]. Keep role strings but sanitize to user/assistant. Actually MiniMax/OpenAI accept role user/assistant/system. History from remoteAgent: role user/assistant. I'll accept role in {user, assistant} and coerce others to "user" or drop? Let me just pass through only role ∈ {user, assistant}, truncate content to 600.
- system: string, max 4000.

Response: `{ text, provider, model }`.

MiniMax call:
```
POST https://api.minimax.io/v1/chat/completions
Authorization: Bearer env.MINIMAX_API_KEY
Content-Type: application/json
{
  model: env.MINIMAX_MODEL || DEFAULT (MiniMax-M3.1-Flash),
  messages: [system?, ...history, {role:user, content:prompt}],
  max_tokens: 160,
  temperature: 0.8,
  stream: false
}
```

Timeout 9s via AbortController.

Extract text: `data.choices[0].message.content`. Also strip reasoning: MiniMax returns `reasoning_content` field; content already has only final answer. But task says strip `<think>…</think>` or reasoning fields. I'll:
- extract content, and also strip any `<think>...</think>` blocks and any `reasoning_content`/`reasoning` from text just in case.
- Also skip if content empty but reasoning present? No — if content empty, treat as no text.

Strip function:
```
function stripThinking(text) {
  return text.replace(/<think[\s\S]*?<\/think>/gi, "").trim();
}
```

OpenAI fallback: existing convention. Looking at handleHarnessCheckChat, it uses `https://api.openai.com/v1/responses` with instructions/input. But the task says "OpenAI Chat Completions mit env.OPENAI_MODEL (bestehende Konvention im Worker beachten)". The existing convention in the worker uses the Responses API (`/v1/responses`) with `instructions` + `input` + `max_output_tokens`. Hmm. But the task says "OpenAI Chat Completions". There's a tension. "bestehende Konvention im Worker beachten" — the existing worker uses `/v1/responses`. But it explicitly says "OpenAI Chat Completions". 

Let me re-read: "Fallback: wenn MiniMax fehlt/fehlschlägt und env.OPENAI_API_KEY existiert → OpenAI Chat Completions mit env.OPENAI_MODEL (bestehende Konvention im Worker beachten)."

I think "bestehende Konvention im Worker beachten" refers to using `env.OPENAI_MODEL` and the `extractOpenAIText` helper and the existing error handling style. But it explicitly says "OpenAI Chat Completions" which is `/v1/chat/completions`. Hmm, ambiguous.

Given the explicit phrase "OpenAI Chat Completions", I'll use `/v1/chat/completions` with `messages` array (standard chat completions), model from `env.OPENAI_MODEL`, max_tokens 160, temperature 0.8. This is the standard Chat Completions API. The "bestehende Konvention" = use env.OPENAI_MODEL variable name and the general pattern (Authorization Bearer, error handling returning {error}). I'll also reuse `extractOpenAIText`? No, that's for Responses API. For chat completions, text is `data.choices[0].message.content`.

Actually, let me be careful. "bestehende Konvention im Worker beachten" most likely means: use the same env var name `OPENAI_MODEL` (not some new name) and follow the same general approach. The explicit "OpenAI Chat Completions" tells me to use the chat completions endpoint, not the responses endpoint. I'll use chat completions.

Let me write it cleanly.

Provider/model in response:
- MiniMax: provider "minimax", model = env.MINIMAX_MODEL
- OpenAI: provider "openai", model = env.OPENAI_MODEL

Now `vars` in wrangler.jsonc: add
```
"vars": {
  "MINIMAX_MODEL": "MiniMax-M3.1-Flash"
}
```

Note: vars are non-secret, baked into config. MINIMAX_API_KEY is a secret set via `wrangler secret put`.

Now let me also verify `MINIMAX_MODEL` default constant in worker: `const DEFAULT_MINIMAX_MODEL = "MiniMax-M3.1-Flash";` and use `env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL`.

For OpenAI model: `env.OPENAI_MODEL` — may be undefined. If undefined, fallback? The task says use env.OPENAI_MODEL. If not set, OpenAI fallback should fail gracefully → 503. I'll guard: if `env.OPENAI_MODEL` missing, skip OpenAI fallback. Actually just attempt with env.OPENAI_MODEL and if empty skip. Let me set a guard.

Now the base URL for MiniMax: `https://api.minimax.io/v1`. Confirmed.

Let me also handle the `history` — remoteAgent sends `{ role, content }` where role can be "user"/"assistant". I'll map them.

Let me write the code now.

Let me structure the new functions and constants.

Constants at top:
```
const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const DEFAULT_MINIMAX_MODEL = "MiniMax-M3.1-Flash";
const AGENT_SYSTEM_DEFAULT = "You are the presence on agentfähig.de, a website that behaves like an agent, built by Samuel. Answer in one to three short sentences. React to what the visitor says. Never say 'How can I help'. Be warm, curious and honest. No lists, no markdown.";
const AGENT_TIMEOUT_MS = 9000;
const AGENT_MAX_TOKENS = 160;
const AGENT_TEMPERATURE = 0.8;
const AGENT_PROMPT_MAX = 600;
const AGENT_HISTORY_MAX = 6;
const AGENT_HISTORY_ITEM_MAX = 600;
const AGENT_SYSTEM_MAX = 4000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
```

Now routing in fetch:
```
if (url.pathname === "/api/agent") {
  return handleAgent(request, env);
}
```
Add before the GET homepage check (or after, doesn't matter; put with other api routes). I'll add near the site-event block.

Then:
```
if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
  return handleLivingSurface(request, env);
}
if (request.method === "GET" && (url.pathname === "/classic" || url.pathname === "/classic/")) {
  return handleClassicHomepage(request, env);
}
```

handleClassicHomepage: rewrite request to `/index.html` then call handleHomepage logic.

```
function handleClassicHomepage(request, env) {
  const url = new URL(request.url);
  const assetUrl = new URL("/index.html", url.origin);
  return handleHomepage(new Request(assetUrl, request), env);
}
```

handleLivingSurface:
```
async function handleLivingSurface(request, env) {
  const url = new URL(request.url);
  const assetUrl = new URL("/surface/living-surface.html", url.origin);
  const response = await env.ASSETS.fetch(new Request(assetUrl, request));

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const injected = html.replace(/<head>/i, '<head><base href="/surface/">');
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
```

Wait, but the injection should happen "direkt nach <head>". `<base href="/surface/">` directly after `<head>`. My replace does exactly that.

But there's a subtlety: `<head>` might appear with attributes or whitespace. It's plain `<head>`. Good. But to be safe use regex `/<head[^>]*>/i` and inject after. Let me do:
```
const injected = html.replace(/<head([^>]*)>/i, '<head$1><base href="/surface/">');
```

This handles `<head>` and `<head attr>`. Good.

Now the `base href="/surface/"` — relative paths in the HTML like `styles/base.css` resolve to `/surface/styles/base.css`, and ES modules `./main.js` resolve relative to the document URL `/` + base → actually with `<base href="/surface/">`, a relative URL `./main.js` in the document resolves against `/surface/`, giving `/surface/main.js`. Good. And remoteAgent resolves endpoint against location.origin (not base), so `/api/agent` goes to origin. Good — that's exactly why they wrote resolveEndpoint with origin.

Now the cache-control. The task: "Cache: Antwort für "/" mit cache-control: public, max-age=0, must-revalidate." Only for "/"? It says response for "/" — I'll set for both "/" and "/index.html" (same handler). Actually the handler serves both. Setting cache-control public max-age=0 must-revalidate on both is fine. But the task specifically says for "/". I'll apply to the living surface handler generally (both / and /index.html), which is a superset. That's fine and reasonable. Actually to be safe, maybe only "/". But handleLivingSurface is used for both. Hmm. The instruction: "Cache: Antwort für "/" ...". I'll apply the header in handleLivingSurface for all its responses (both "/" and "/index.html"). This is a reasonable interpretation — /index.html also should not be aggressively cached. It's fine.

Now handleAgent:

```
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

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return json({ error: "Too many requests." }, 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
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
      return json({
        text: result.text,
        provider: "minimax",
        model: result.model,
      });
    }
  }

  if (env.OPENAI_API_KEY && env.OPENAI_MODEL) {
    const result = await callOpenAI(messages, env);
    if (result.ok) {
      return json({
        text: result.text,
        provider: "openai",
        model: result.model,
      });
    }
  }

  return json({ error: "no_provider" }, 503);
}
```

normalizeAgentInput:
```
function normalizeAgentInput(payload) {
  const prompt = trimMax(payload?.prompt, AGENT_PROMPT_MAX);
  if (!prompt) return { ok: false, error: "A prompt is required." };

  let system = "";
  if (payload?.system !== undefined && payload?.system !== null) {
    system = trimMax(payload.system, AGENT_SYSTEM_MAX);
  }

  let history = [];
  if (Array.isArray(payload?.history)) {
    history = payload.history.slice(0, AGENT_HISTORY_MAX).map((item) => {
      const role = item?.role === "assistant" ? "assistant" : "user";
      const content = trimMax(item?.content, AGENT_HISTORY_ITEM_MAX);
      return { role, content };
    }).filter((item) => item.content);
  }

  return { ok: true, value: { prompt, system, history } };
}
```

buildAgentMessages:
```
function buildAgentMessages({ prompt, system, history }) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  else messages.push({ role: "system", content: AGENT_SYSTEM_DEFAULT });
  for (const item of history) messages.push({ role: item.role, content: item.content });
  messages.push({ role: "user", content: prompt });
  return messages;
}
```

callMiniMax:
```
async function callMiniMax(messages, env) {
  const model = env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);
  try {
    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: AGENT_MAX_TOKENS,
        temperature: AGENT_TEMPERATURE,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false };

    let data;
    try {
      data = await response.json();
    } catch {
      return { ok: false };
    }

    const text = stripThinking(extractChatText(data));
    if (!text) return { ok: false };

    return { ok: true, text, model };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
```

extractChatText:
```
function extractChatText(data) {
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}
```

stripThinking:
```
function stripThinking(text) {
  return String(text || "").replace(/<think[\s\S]*?<\/think>/gi, "").trim();
}
```

Also MiniMax returns `reasoning_content` field separately; content already excludes it. But to be safe, also strip nothing else needed. The stripThinking handles `<think>` tags.

callOpenAI (chat completions):
```
async function callOpenAI(messages, env) {
  const model = env.OPENAI_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
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

    let data;
    try {
      data = await response.json();
    } catch {
      return { ok: false };
    }

    const text = stripThinking(extractChatText(data));
    if (!text) return { ok: false };

    return { ok: true, text, model };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
```

isAllowedOrigin and clientIp:
```
const ALLOWED_ORIGIN_HOSTS = new Set([
  "www.xn--agentfhig-02a.de",
  "xn--agentfhig-02a.de",
]);

function isAllowedOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  if (originHost === url.host.toLowerCase()) return true;
  return ALLOWED_ORIGIN_HOSTS.has(originHost);
}

function clientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
```

Wait: `new URL("https://www.agentfähig.de").host` — does it normalize to punycode? Yes, URL host getter returns ASCII/punycode. Let me verify: `new URL("https://www.agentfähig.de").host` → "www.xn--agentfhig-02a.de". And the apex `new URL("https://agentfähig.de").host` → "xn--agentfhig-02a.de". So ALLOWED_ORIGIN_HOSTS with punycode entries is correct.

Also "same-origin": originHost === url.host. For production, url.host will be "www.xn--agentfhig-02a.de" (punycode). So even without ALLOWED set, same-origin would pass. But cross-origin POST to the API with Origin = another site would fail. Good.

Rate limit map:
```
const agentRateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = agentRateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    agentRateBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) return true;
  return false;
}
```

Add cleanup: when map size > 5000, prune expired. Best effort. Let me add in isRateLimited:
```
if (agentRateBuckets.size > 5000) {
  for (const [key, value] of agentRateBuckets) {
    if (now - value.windowStart >= RATE_LIMIT_WINDOW_MS) agentRateBuckets.delete(key);
  }
}
```

Now the JSON response includes cache-control no-store via `json()`. Good.

Now about errors: "Fehlermeldungen ohne interne Details". My error responses are generic ("Origin not allowed", "Too many requests", "no_provider", "A prompt is required."). Good.

"keine Logs mit Inhalt" — I don't add any console.log. Good.

Now let me write the tests. No package.json, no test framework. Node test file `test/agent-endpoint.test.mjs` with mocked fetch. Use node:test and node:assert. Since worker.js is an ES module with `export default { fetch }`, I can import it.

But worker.js uses `crypto.getRandomValues`, `crypto.randomUUID`, `crypto.subtle` — available in Node 18+ as global `crypto` (webcrypto). `crypto.randomUUID` is global. `crypto.getRandomValues` is global. `crypto.subtle` is global in Node 20+. Should be fine.

The test imports the worker module's default export and calls `worker.fetch(request, env)` with a mock env and global fetch mocked.

To mock fetch, I can override `globalThis.fetch` in the test. The worker uses the global `fetch`. I can set `globalThis.fetch = mockFetch`.

Test cases:
1. MiniMax ok → returns { text, provider: "minimax", model }.
2. MiniMax error → OpenAI ok → returns { text, provider: "openai", model }.
3. Both missing (no keys) → 503 { error: "no_provider" }.
4. Validation: missing prompt → 400; prompt too long (truncated but that's fine); non-JSON → 415; non-POST → 405.
5. Origin check: disallowed origin → 403.

Let me also think about the fetch mock signature: `fetch(url, init)`. I need to inspect init.body to know which provider. Return Response objects.

For MiniMax mock: return new Response(JSON.stringify({ choices: [{ message: { content: "hi" } }] }), { status: 200 }).

For error: return new Response("", { status: 500 }).

For OpenAI: return Response with choices.

Let me write the test carefully.

Mock fetch:
```
function miniMaxOk(body) {
  return new Response(JSON.stringify({ choices: [{ message: { content: "hello from minimax" } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
}
```

I need to route based on url. Since the worker builds the request body, I can check `url` startsWith "https://api.minimax.io" vs "https://api.openai.com".

Test env:
```
const env = { MINIMAX_API_KEY: "test-minimax", MINIMAX_MODEL: "MiniMax-M3.1-Flash", OPENAI_API_KEY: "test-openai", OPENAI_MODEL: "gpt-x" };
```

Wait, OPENAI_MODEL — existing convention. The worker uses `env.OPENAI_MODEL`. In test, set it.

For "both missing" test, env = {} (no keys).

For validation test, env with minimax key but invalid payload.

Let me also test that history/system are passed through. Not strictly required but nice. The task's required tests: "MiniMax ok, MiniMax Fehler→OpenAI, beides fehlt→503, Validierung".

Now, there's a concern about AbortController/setTimeout in tests — the callMiniMax sets a 9s timer but clears it in finally. Fine.

Also note: `new Request` in Node — global Request/Response available in Node 18+. Good.

One more: the worker's `fetch` handler routes `/api/agent` before the ASSETS fallback. In tests I construct a Request with url "https://www.xn--agentfhig-02a.de/api/agent".

Origin header: For test requests I should NOT set an Origin header (same-origin omitted → allowed), except in the origin-rejection test where I set Origin: "https://evil.example".

Let me write everything now.

Let me first make the edits to worker.js, wrangler.jsonc, and create the test file.

Let me plan the exact edit locations in worker.js.

Edit 1: Add constants after line 68 (VIEWPORT_CLASSES) or near top. I'll add after line 68.

Edit 2: Add routing in fetch. Add `/api/agent` route. And change GET "/" handler + add "/classic".

Current fetch lines 124-157. I'll modify:
- After the site-event block (line 145), add agent route. Actually order: I'll add the agent route among API routes. Let me add right after line 145 (site-event) or before homepage. I'll add after the site-event if-block.

- Change lines 147-149 (homepage route) to living surface.
- Add classic route.

Let me write the edits.

For the routing, replace:
```
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return handleHomepage(request, env);
    }
```
with:
```
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return handleLivingSurface(request, env);
    }

    if (request.method === "GET" && (url.pathname === "/classic" || url.pathname === "/classic/")) {
      return handleClassicHomepage(request, env);
    }
```

And add agent route. I'll add after site-event block:
```
    if (url.pathname === "/api/agent") {
      return handleAgent(request, env);
    }
```

Actually I'll put the agent route right after the harness-check route or near site-event. Order doesn't matter since exact path match. I'll add it just before the site-event block or after. Let me add after the explain block (line 141) region. Simpler: add after site-event block (line 145).

Now functions: add handleAgent + helpers + handleLivingSurface + handleClassicHomepage. I'll add handleLivingSurface and handleClassicHomepage near handleHomepage (after line 197), and handleAgent + helpers near the end or after handleHarnessCheckChat.

Let me place:
- handleLivingSurface + handleClassicHomepage right after handleHomepage (after line 197).
- Agent functions after handleHarnessCheckChat (after line 376) — actually I'll put them at the end before json() or after handleClientHandoffUpload. I'll add a big block before `function json(...)` (line 672). Or after extractOpenAIText. Let me add after `extractOpenAIText` (line 525) — a natural place for helpers. Actually I'll put the agent endpoint + helpers together right before the `json` helper (line 672) to keep it grouped. Let me just append after `hasSecretLikeText` (line 535) region, before `handleClientHandoffUpload`.

I'll insert after line 535 (end of hasSecretLikeText function). Actually simpler to insert a big block right before `async function handleClientHandoffUpload`.

Let me do the edits now.

For constants, I need to define them before use (they're used in functions which are hoisted, but const at module top-level is fine since functions only run at fetch time). I'll add constants at top near other constants.

Let me write constants after line 68.

Now let me implement.</think>
Now update wrangler.jsonc:
Fertig. Alle drei Teile umgesetzt und verifiziert.

## Geänderte Dateien
- `src/worker.js` — Routing + `/api/agent` + `/classic/` + Living-Surface-Auslieferung
- `wrangler.jsonc` — `run_worker_first` um `/classic`, `/classic/*` ergänzt; `vars.MINIMAX_MODEL` gesetzt
- `.assetsignore` — `test/**` ergänzt (Testdatei nicht deployen)
- `test/agent-endpoint.test.mjs` — neu, 8 Tests grün

## Teil 1 — Startseite
- `GET /` und `/index.html` → `surface/living-surface.html` mit injiziertem `<base href="/surface/">` direkt nach `<head>` (regex `<head([^>]*)>`), Cache-Header `public, max-age=0, must-revalidate`.
- `GET /classic` und `/classic/` → alte `handleHomepage`-Logik, Request auf `/index.html` umgeschrieben.

## Teil 2 — `POST /api/agent`
- MiniMax primär: `POST https://api.minimax.io/v1/chat/completions`, `max_tokens 160`, `temperature 0.8`, Timeout 9 s (AbortController). Thinking-Inhalte via `stripThinking` (`<think>…</think>`) entfernt; MiniMax liefert Reasoning separat in `reasoning_content`, `content` enthält nur die Antwort.
- Fallback OpenAI Chat Completions mit `env.OPENAI_MODEL`; sonst `503 { error: "no_provider" }`.
- Schutz: nur POST + `application/json`, Origin-Prüfung (www/apex, punycode-normalisiert + same-origin), Ratenbegrenzung 20/10 min pro IP im Isolate-Speicher, generische Fehlermeldungen, keine Inhalts-Logs.

## Modell-ID + Quelle
- **`MiniMax-M3.1-Flash`** — offizielle Doku: https://platform.minimax.io/docs/api-reference/text-chat-openai und https://platform.minimax.io/docs/guides/text-generation (OpenAI-kompatibler Endpoint `https://api.minimax.io/v1`, Model-ID `MiniMax-M3.1-Flash`). Hinweis: M3.1-Flash „denkt" immer; `max_completion_tokens`/`max_tokens` akzeptiert.

## Verifikation
- `node --check src/worker.js` → OK
- `node --test test/agent-endpoint.test.mjs` → 8 pass, 0 fail

## Befehl für den Owner (Secret)
```
wrangler secret put MINIMAX_API_KEY
```
