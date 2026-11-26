#!/usr/bin/env node
// Antwort-Eval (ADR-0007): schickt evals/answers.json durch den echten Worker und prüft die Antworten.
// Nicht Teil von npm test (kostet Modellaufrufe, schwankt leicht) — manuell oder nightly.
//   Live (empfohlen):  node evals/answers.mjs --url https://www.xn--agentfhig-02a.de
//     prüft den deployten Worker mit echten Bindings und MiniMax; kein Token nötig.
//     Achtung: Rate-Limit 20 Anfragen / 10 min pro IP — ein Lauf braucht 15.
//   Lokal: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (Workers AI per REST). Die Worker-Timeouts
//     (Embedding 1,5 s, je LLM-Stufe 4 s) sind für REST vom Laptop oft zu knapp → leere Antworten.
// Ergebnis: evals/answers-report.json, Exit-Code 1 bei Fehlschlag.
import { readFile, writeFile } from 'node:fs/promises';
import worker from '../deploy/agentfaehig-site/src/worker.js';

const urlArg = process.argv.indexOf('--url');
const liveUrl = urlArg > 0 ? process.argv[urlArg + 1]?.replace(/\/$/, '') : null;
const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env;
if (!liveUrl && (!account || !token)) { console.error('--url <live> angeben oder CLOUDFLARE_ACCOUNT_ID und CLOUDFLARE_API_TOKEN setzen'); process.exit(2); }

const AI = {
  async run(model, input) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
      method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(input),
    });
    const body = await res.json();
    if (!res.ok || body.success === false) throw new Error(`Workers AI ${model}: ${res.status}`);
    return body.result;
  },
};
const env = {
  AI, ASSETS: { fetch: () => new Response('') },
  ...Object.fromEntries(['MINIMAX_API_KEY', 'MINIMAX_BASE_URL', 'MINIMAX_MODEL', 'OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL', 'WORKERS_AI_MODEL']
    .filter((k) => process.env[k]).map((k) => [k, process.env[k]])),
};

const spec = JSON.parse(await readFile('evals/answers.json', 'utf8'));
const has = (text, term) => text.toLowerCase().includes(term.toLowerCase());
let n = 0;
async function ask(prompt, history, lastSourceIds) {
  n += 1;
  const req = new Request('https://www.xn--agentfhig-02a.de/api/agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://www.xn--agentfhig-02a.de', 'cf-connecting-ip': `10.0.0.${n}` },
    body: JSON.stringify({ prompt, history, last_source_ids: lastSourceIds, params: {} }),
  });
  const res = liveUrl
    ? await fetch(`${liveUrl}/api/agent`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://www.xn--agentfhig-02a.de' }, body: await req.text() })
    : await worker.fetch(req, env);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) body.text = body.text ?? '', body.error = body.error ?? `HTTP ${res.status}`;
  return body;
}

const report = [];
for (const entry of spec.entries) {
  const history = []; let lastSourceIds = []; let out;
  for (const turn of entry.turns) {
    out = await ask(turn, history, lastSourceIds);
    history.push({ role: 'user', content: turn }, { role: 'assistant', content: out.text ?? '' });
    lastSourceIds = (out.sources ?? []).map((s) => s.id);
  }
  const text = out.text ?? ''; const ids = (out.sources ?? []).map((s) => s.id); const e = entry.expect; const fails = [];
  if (!text.trim()) fails.push('leere Antwort');
  for (const bad of [...spec.global_must_not, ...(e.must_not ?? [])]) if (has(text, bad)) fails.push(`verboten: „${bad}"`);
  if (e.must_any && !e.must_any.some((t) => has(text, t))) fails.push(`keiner von: ${e.must_any.join(' / ')}`);
  if (e.sources_any && !e.sources_any.some((id) => ids.includes(id))) fails.push(`keine Quelle aus: ${e.sources_any.join(', ')}`);
  if (e.sources_min !== undefined && ids.length < e.sources_min) fails.push(`zu wenige Quellen (${ids.length})`);
  if (e.sources_max !== undefined && ids.length > e.sources_max) fails.push(`zu viele Quellen (${ids.join(', ')})`);
  if (e.contact_card !== undefined && Boolean(out.contact_card) !== e.contact_card) fails.push(`contact_card=${out.contact_card}`);
  report.push({ id: entry.id, turns: entry.turns, ok: !fails.length, fails, text, sources: ids, coverage: out.coverage, provider: out.provider, model: out.model });
  console.log(`${fails.length ? 'XX' : 'OK'} ${entry.id.padEnd(14)} [${out.provider ?? out.error ?? '?'}] ${fails.join('; ')}\n   → ${text.replace(/\s+/g, ' ').slice(0, 160)}`);
}
const passed = report.filter((r) => r.ok).length;
await writeFile('evals/answers-report.json', `${JSON.stringify({ at: new Date().toISOString(), target: liveUrl ?? 'local', passed, total: report.length, report }, null, 2)}\n`);
console.log(`\nAntwort-Eval: ${passed}/${report.length} bestanden → evals/answers-report.json`);
process.exit(passed === report.length ? 0 : 1);
