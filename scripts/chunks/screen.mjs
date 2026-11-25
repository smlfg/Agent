// Screening: ein Chunk nach dem anderen, + (freigeben) / − (raus) / ← (zurück).
// Start: node scripts/chunks/screen.mjs [--port 5174]  →  http://127.0.0.1:5174
// „+" schreibt approved_hash (an den Inhalt gebunden), „−" entfernt ihn.
// Entscheidungen: scripts/chunks/.out/decisions.json (nur lokal).
import { createServer } from 'node:http';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { splitChunk, contentHash, approvedHash, joinChunk } from './chunk-file.mjs';
import { hints } from './check.mjs';

const knowledgeDir = 'src/agent/knowledge';
const outDir = 'scripts/chunks/.out';
const decisionsFile = `${outDir}/decisions.json`;
const GROUP = { notion: 0, plaud: 0, manual: 0, web: 1, github: 2 };

const meta = (front) => Object.fromEntries(front.map((l) => /^(\w+):\s*(.*)$/.exec(l)).filter(Boolean)
  .map(([, k, v]) => [k, v.replace(/^"|"$/g, '')]));

export async function loadChunks(dir = knowledgeDir) {
  const files = (await readdir(dir).catch(() => [])).filter((n) => n.endsWith('.md')).sort();
  const rows = [];
  for (const file of files) {
    const raw = await readFile(`${dir}/${file}`, 'utf8');
    const { front, text } = splitChunk(raw); const m = meta(front);
    const personal = m.source_kind !== 'web' && m.source_kind !== 'github' || /person/.test(m.topics ?? '');
    rows.push({ file, id: m.id, title: m.title, text, source: m.source, link: m.link === 'null' ? null : m.link,
      kind: m.source_kind, personal, hints: hints(text), hash: contentHash(raw), approved: approvedHash(raw) === contentHash(raw) });
  }
  const rank = (r) => (r.personal ? 0 : 1 + (GROUP[r.kind] ?? 1));
  return rows.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
}

export async function decide(file, yes, dir = knowledgeDir) {
  const path = `${dir}/${file}`;
  const { front, text } = splitChunk(await readFile(path, 'utf8'));
  const base = front.filter((l) => !/^approved_hash:/.test(l));
  const next = yes ? [...base, `approved_hash: ${contentHash(joinChunk(base, text))}`] : base;
  await writeFile(path, joinChunk(next, text));
  return contentHash(joinChunk(base, text));
}

const page = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Chunk-Screening</title><style>
:root{--bg:#fafaf7;--fg:#1d1d1b;--mut:#6b6b66;--ok:#1f7a3a;--no:#a3302a;--card:#fff;--line:#e3e1da}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--fg:#eceae4;--mut:#9a988f;--card:#20201e;--line:#34332f}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 120px}
.bar{display:flex;justify-content:space-between;color:var(--mut);font-size:14px}
.prog{height:4px;background:var(--line);border-radius:2px;margin:8px 0 20px}.prog i{display:block;height:100%;background:var(--ok);border-radius:2px}
article{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px}
h1{font-size:22px;margin:0 0 4px}.tag{display:inline-block;font-size:12px;padding:2px 8px;border-radius:99px;border:1px solid var(--line);color:var(--mut);margin-right:6px}
.tag.p{border-color:#c9862b;color:#c9862b}.hint{color:var(--no);font-size:14px}
small{color:var(--mut);display:block;margin-top:12px;word-break:break-all}a{color:inherit}
.btns{position:fixed;left:0;right:0;bottom:0;display:flex;gap:12px;justify-content:center;padding:16px;background:var(--bg);border-top:1px solid var(--line)}
button{font:600 18px system-ui;padding:14px 0;width:min(30vw,180px);border-radius:10px;border:0;cursor:pointer;color:#fff}
#yes{background:var(--ok)}#no{background:var(--no)}#back{background:var(--mut)}
.done{text-align:center;padding:60px 0}</style>
<main><div class="bar"><span id="count"></span><span>Tasten: + / − / ←</span></div><div class="prog"><i id="pg"></i></div><div id="card"></div></main>
<div class="btns"><button id="back">← zurück</button><button id="no">− raus</button><button id="yes">+ ok</button></div>
<script>
let s;const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function load(){s=await (await fetch('/api/state')).json();render()}
function render(){const c=s.current;$('count').textContent=s.done+' / '+s.total+' entschieden';$('pg').style.width=(100*s.done/Math.max(1,s.total))+'%';
if(!c){$('card').innerHTML='<div class="done"><h1>Fertig.</h1><p>'+s.approved+' freigegeben, '+s.rejected+' raus.</p></div>';return}
$('card').innerHTML='<article>'+(c.personal?'<span class="tag p">Veröffentlichungsfreigabe</span>':'')+'<span class="tag">'+esc(c.kind)+'</span><h1>'+esc(c.title)+'</h1><p>'+esc(c.text).replace(/\\n\\n/g,'</p><p>')+'</p>'+(c.hints.length?'<p class="hint">Hinweis: '+esc(c.hints.join(', '))+'</p>':'')+'<small>Quelle: '+esc(c.source)+(c.link?' · <a href="'+esc(c.link)+'" target="_blank" rel="noopener">'+esc(c.link)+'</a>':'')+'</small></article>'}
async function act(path,body){s=await (await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{})})).json();render()}
$('yes').onclick=()=>s.current&&act('/api/decide',{id:s.current.id,yes:true});
$('no').onclick=()=>s.current&&act('/api/decide',{id:s.current.id,yes:false});
$('back').onclick=()=>act('/api/undo');
addEventListener('keydown',e=>{if(e.key==='+'||e.key==='ArrowRight'||e.key==='Enter')$('yes').click();else if(e.key==='-'||e.key==='ArrowDown')$('no').click();else if(e.key==='ArrowLeft'||e.key==='Backspace')$('back').click()});
load();</script></html>`;

async function readDecisions() { return JSON.parse(await readFile(decisionsFile, 'utf8').catch(() => '{"log":[]}')); }

export async function state(dir = knowledgeDir) {
  const rows = await loadChunks(dir); const { log } = await readDecisions();
  const last = new Map(log.map((d) => [d.id, d]));
  const decided = (r) => r.approved || (last.get(r.id)?.yes === false && last.get(r.id)?.hash === r.hash);
  const current = rows.find((r) => !decided(r)) ?? null;
  return { total: rows.length, done: rows.filter(decided).length, approved: rows.filter((r) => r.approved).length,
    rejected: rows.filter((r) => !r.approved && decided(r)).length, current };
}

const body = (req) => new Promise((ok) => { let b = ''; req.on('data', (d) => { b += d; }); req.on('end', () => ok(b ? JSON.parse(b) : {})); });

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[process.argv.indexOf('--port') + 1]) || 5174;
  await mkdir(outDir, { recursive: true });
  createServer(async (req, res) => {
    const send = (code, type, data) => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(data); };
    try {
      if (req.method === 'GET' && req.url === '/') return send(200, 'text/html; charset=utf-8', page);
      if (req.method === 'GET' && req.url === '/api/state') return send(200, 'application/json', JSON.stringify(await state()));
      if (req.method === 'POST' && req.url === '/api/decide') {
        const { id, yes } = await body(req); const row = (await loadChunks()).find((r) => r.id === id);
        if (!row) return send(404, 'application/json', '{"error":"unknown id"}');
        const hash = await decide(row.file, Boolean(yes)); const d = await readDecisions();
        d.log.push({ id, file: row.file, yes: Boolean(yes), hash, at: new Date().toISOString() });
        await writeFile(decisionsFile, `${JSON.stringify(d, null, 2)}\n`);
        return send(200, 'application/json', JSON.stringify(await state()));
      }
      if (req.method === 'POST' && req.url === '/api/undo') {
        const d = await readDecisions(); const lastOne = d.log.pop();
        if (lastOne) { await decide(lastOne.file, false); await writeFile(decisionsFile, `${JSON.stringify(d, null, 2)}\n`); }
        return send(200, 'application/json', JSON.stringify(await state()));
      }
      send(404, 'text/plain', 'not found');
    } catch (error) { send(500, 'application/json', JSON.stringify({ error: String(error) })); }
  }).listen(port, '127.0.0.1', () => console.log(`Chunk-Screening: http://127.0.0.1:${port}`));
}
