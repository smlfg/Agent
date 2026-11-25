import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export function buildBatches(sources, size = 8) {
  const batches = []; for (let i = 0; i < sources.length; i += size) batches.push(sources.slice(i, i + size)); return batches;
}
export function pendingSources(sources, cache = {}) { return sources.filter((s) => cache[s.id] !== s.source_hash); }
export const sourcePrompt = (sources, template) => `${template}\n\n${sources.map((s) => `<<<SOURCE id=${s.id}>>>\n${s.text}\n<<<END>>>`).join('\n\n')}`;
async function loadSources(dir) { return Promise.all((await readdir(`${dir}/sources`).catch(() => [])).filter((n) => n.endsWith('.json')).map(async (n) => JSON.parse(await readFile(`${dir}/sources/${n}`, 'utf8')))); }
export async function condense({ outDir = 'scripts/chunks/.out', batchSize = 8, limit, dryRun = false, invoke } = {}) {
  const sources = await loadSources(outDir); const cache = JSON.parse(await readFile(`${outDir}/cache.json`, 'utf8').catch(() => '{}'));
  const batches = buildBatches(pendingSources(sources, cache).slice(0, limit ?? Infinity), batchSize);
  if (dryRun) { console.log(JSON.stringify({ batches: batches.map((b) => b.map((s) => s.id)) }, null, 2)); return batches; }
  if (!invoke) throw new Error('condense requires an injected model invoker');
  await mkdir(`${outDir}/chunks`, { recursive: true }); await mkdir(`${outDir}/tmp-${randomUUID()}`, { recursive: true });
  for (const batch of batches) {
    let result; for (let attempt = 0; attempt < 2; attempt++) { try { result = await invoke(batch); break; } catch (error) { if (attempt) throw error; } }
    for (const chunk of result.chunks) await writeFile(`${outDir}/chunks/${chunk.id}.json`, `${JSON.stringify(chunk, null, 2)}\n`);
    for (const source of batch) cache[source.id] = source.source_hash;
  }
  await writeFile(`${outDir}/cache.json`, `${JSON.stringify(cache, null, 2)}\n`); return batches;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2); const value = (flag, fallback) => { const i = args.indexOf(flag); return i < 0 ? fallback : args[i + 1]; };
  await condense({ batchSize: Number(value('--batch', 8)), limit: value('--limit') && Number(value('--limit')), dryRun: args.includes('--dry-run') });
}
