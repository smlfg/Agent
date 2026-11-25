import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { sha256 } from './collect.mjs';

// knowledge.json-Einträge werden Quellen (source_kind manual) und laufen wie alle
// anderen durch condense → check → skim. knowledge.json bleibt unverändert.
export async function migrate({ input = 'src/agent/knowledge.json', outDir = 'scripts/chunks/.out' } = {}) {
  const knowledge = JSON.parse(await readFile(input, 'utf8'));
  const entries = [['owner', knowledge.owner], ...['offerings', 'approach', 'faq', 'projects_public']
    .flatMap((key) => (knowledge[key] ?? []).map((v, i) => [`${key}-${v.id ?? i}`, v]))];
  await mkdir(`${outDir}/sources`, { recursive: true });
  for (const [key, value] of entries) {
    const id = `kj-${key.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    const text = JSON.stringify(value, null, 2);
    const record = { id, source_kind: 'manual', url: '', title: key, text, meta: { from: `knowledge.json:${key}` }, source_hash: sha256(text) };
    await writeFile(`${outDir}/sources/${id}.json`, `${JSON.stringify(record, null, 2)}\n`);
  }
  return entries.length;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(`migrated ${await migrate()} sources`);
