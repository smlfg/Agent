import { readFile, readdir, writeFile } from 'node:fs/promises';
import { splitChunk, contentHash, joinChunk } from './chunk-file.mjs';

export { contentHash as chunkHash };

export async function approve({ from, knowledgeDir = 'src/agent/knowledge' }) {
  const ids = new Set(JSON.parse(await readFile(from, 'utf8')).approved);
  for (const file of (await readdir(knowledgeDir)).filter((n) => n.endsWith('.md'))) {
    const path = `${knowledgeDir}/${file}`;
    const { front, text } = splitChunk(await readFile(path, 'utf8'));
    const base = front.filter((line) => !/^approved_hash:/.test(line));
    const id = base.find((line) => line.startsWith('id:'))?.slice(3).trim().replaceAll('"', '');
    const next = ids.has(id) ? [...base, `approved_hash: ${contentHash(joinChunk(base, text))}`] : base;
    await writeFile(path, joinChunk(next, text));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await approve({ from: process.argv[process.argv.indexOf('--from') + 1] });
