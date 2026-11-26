import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolveDeterministicLink } from './check.mjs';
import { splitChunk, contentHash, joinChunk } from './chunk-file.mjs';
import { approve } from './approve.mjs';
import { buildKnowledge } from '../build-knowledge.mjs';

const KNOWLEDGE_DIR = 'src/agent/knowledge';
const OUT_DIR = 'scripts/chunks/.out';

export async function repairKnowledgeLinks({ knowledgeDir = KNOWLEDGE_DIR, outDir = OUT_DIR, dryRun = false } = {}) {
  const files = (await readdir(knowledgeDir)).filter((f) => f.endsWith('.md')).sort();
  const modified = [];
  const approvedIds = [];

  for (const file of files) {
    const path = `${knowledgeDir}/${file}`;
    const raw = await readFile(path, 'utf8');
    const { front, text } = splitChunk(raw);

    const getMeta = (k) => {
      const line = front.find((l) => l.startsWith(`${k}:`));
      if (!line) return null;
      const val = line.slice(k.length + 1).trim();
      return val === 'null' ? null : val.replace(/^"|"$/g, '');
    };

    const id = getMeta('id');
    const sourceKind = getMeta('source_kind');
    const source = getMeta('source');
    const currentLink = getMeta('link');
    const isApprovedBefore = front.some((l) => l.startsWith('approved_hash:'));

    // Skip unapproved drafts that are not part of the approved set (e.g. embodiment.md)
    if (!isApprovedBefore) continue;

    const sourceObj = { id, source_kind: sourceKind, url: source };
    const targetLink = resolveDeterministicLink(sourceObj, currentLink);

    approvedIds.push(id);

    if (currentLink !== targetLink) {
      modified.push({ id, file, currentLink, targetLink });
      if (!dryRun) {
        const nextFront = front.map((line) => {
          if (line.startsWith('link:')) {
            return `link: ${targetLink === null ? 'null' : JSON.stringify(targetLink)}`;
          }
          return line;
        });
        await writeFile(path, joinChunk(nextFront, text));
      }
    }
  }

  if (!dryRun) {
    const approvalsPath = `${outDir}/approvals-link-audit.json`;
    await writeFile(approvalsPath, JSON.stringify({ approved: approvedIds }, null, 2));
    await approve({ from: approvalsPath, knowledgeDir });
    await buildKnowledge({ knowledgeDir, noEmbed: true });

    // Sync embeddings.json vectors hash with updated chunk hashes
    const chunksDoc = JSON.parse(await readFile('deploy/agentfaehig-site/src/knowledge/chunks.json', 'utf8'));
    const embPath = 'deploy/agentfaehig-site/src/knowledge/embeddings.json';
    const embDoc = JSON.parse(await readFile(embPath, 'utf8'));
    for (const chunk of chunksDoc.chunks) {
      if (embDoc.vectors[chunk.id]) {
        embDoc.vectors[chunk.id].hash = chunk.hash;
      }
    }
    await writeFile(embPath, `${JSON.stringify(embDoc, null, 2)}\n`);
  }

  return { total: approvedIds.length, modifiedCount: modified.length, modified };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await repairKnowledgeLinks();
  console.log(`Repaired links for ${result.modifiedCount} / ${result.total} chunks.`);
}
