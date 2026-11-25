import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { approvedHash, contentHash } from './chunk-file.mjs';
const hash = (text) => createHash('sha256').update(text).digest('hex');
const words = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;
const front = (key, value) => `${key}: ${Array.isArray(value) ? `[${value.map((v) => JSON.stringify(v)).join(', ')}]` : value === null ? 'null' : JSON.stringify(value)}`;
const WAYPOINTS = ['what-this-is', 'creator', 'product-for-x', '*'];
export const normalizeWaypoints = (list = []) => { const out = [...new Set(list.map((w) => String(w).split(':')[0].trim()).filter((w) => WAYPOINTS.includes(w)))]; return out.length ? out : ['*']; };
export function hints(text) { const out = []; if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text)) out.push('E-Mail'); if (/(?:\+|00|0)[1-9](?:[\s()./-]?\d){7,14}/.test(text)) out.push('Telefon'); return out; }
export function validateChunk(chunk, source, seen = new Set()) {
  const errors = []; for (const key of ['id', 'title', 'text', 'topics', 'aliases', 'waypoints', 'link']) if (!(key in chunk)) errors.push(`missing ${key}`);
  if (source && chunk.id !== source.id) errors.push('id is not from source'); if (words(chunk.text ?? '') > 120) errors.push('over 120 words');
  const allowed = [source.url, source.meta?.homepageUrl, source.meta?.url].filter(Boolean); if (chunk.link && !source.text.includes(chunk.link) && !allowed.includes(chunk.link)) errors.push('link not in source'); if (seen.has(chunk.id)) errors.push('duplicate id'); seen.add(chunk.id); return errors;
}
export async function check({ outDir = 'scripts/chunks/.out', knowledgeDir = 'src/agent/knowledge' } = {}) {
  const sourceFiles = await readdir(`${outDir}/sources`).catch(() => []); const sources = Object.fromEntries(await Promise.all(sourceFiles.filter((n) => n.endsWith('.json')).map(async (n) => { const s = JSON.parse(await readFile(`${outDir}/sources/${n}`, 'utf8')); return [s.id, s]; })));
  const chunkFiles = await readdir(`${outDir}/chunks`).catch(() => []); const seen = new Set(); const report = [];
  await mkdir(knowledgeDir, { recursive: true });
  for (const file of chunkFiles.filter((n) => n.endsWith('.json'))) {
    const chunk = JSON.parse(await readFile(`${outDir}/chunks/${file}`, 'utf8')); const source = sources[chunk.id]; const errors = source ? validateChunk(chunk, source, seen) : ['unknown source id']; if (errors.length) { report.push({ id: chunk.id, errors, hints: [] }); continue; }
    const old = await readFile(`${knowledgeDir}/${chunk.id}.md`, 'utf8').catch(() => '');
    const body = [front('id', chunk.id), front('title', chunk.title), front('waypoints', normalizeWaypoints(chunk.waypoints)), front('topics', chunk.topics), front('aliases', chunk.aliases), front('link', chunk.link), front('source', source.url || source.id), front('source_kind', source.source_kind), front('source_hash', source.source_hash), front('updated_at', new Date().toISOString().slice(0, 10)), 'visibility: public'].join('\n');
    const next = `---\n${body}\n---\n\n${chunk.text.trim()}\n`; const kept = old && approvedHash(old) && approvedHash(old) === contentHash(next) ? approvedHash(old) : null; await writeFile(`${knowledgeDir}/${chunk.id}.md`, kept ? next.replace('\n---\n\n', `\napproved_hash: ${kept}\n---\n\n`) : next);
    report.push({ id: chunk.id, errors: [], hints: hints(chunk.text) });
  }
  return report;
}
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await check(), null, 2));
