#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { contentHash, isApproved, splitChunk } from './chunks/chunk-file.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_KNOWLEDGE_DIR = join(ROOT, 'src/agent/knowledge');
const DEFAULT_OUTPUT_DIR = join(ROOT, 'deploy/agentfaehig-site/src/knowledge');
const EMBED_MODEL = '@cf/baai/bge-m3';

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'null') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try { return JSON.parse(trimmed); } catch { /* fall through to string */ }
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseFrontmatter(raw) {
  const { front } = splitChunk(raw);
  const fields = {};
  for (const line of front) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    fields[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1));
  }
  return fields;
}

function embeddedText(chunk) {
  return [chunk.title, ...(chunk.aliases || []), chunk.text].join('\n');
}

function normalizeChunk(raw, filename) {
  const fields = parseFrontmatter(raw);
  const { text } = splitChunk(raw);
  if (!fields.id || !fields.title) throw new Error(`${filename}: id and title are required`);
  return {
    id: String(fields.id),
    title: String(fields.title),
    text,
    topics: Array.isArray(fields.topics) ? fields.topics.map(String) : [],
    aliases: Array.isArray(fields.aliases) ? fields.aliases.map(String) : [],
    waypoints: Array.isArray(fields.waypoints) ? fields.waypoints.map(String) : [],
    link: fields.link == null ? null : String(fields.link),
    source_kind: String(fields.source_kind || ''),
    hash: contentHash(raw),
  };
}

async function readApprovedChunks(knowledgeDir, log = console) {
  const files = (await readdir(knowledgeDir)).filter((file) => file.endsWith('.md')).sort();
  const chunks = [];
  for (const filename of files) {
    const raw = await readFile(join(knowledgeDir, filename), 'utf8');
    if (!isApproved(raw)) {
      log.log(`Skipping ${filename}: not approved or approved_hash does not match contentHash`);
      continue;
    }
    chunks.push(normalizeChunk(raw, filename));
  }
  chunks.sort((a, b) => a.id.localeCompare(b.id));
  return chunks;
}

async function readJsonIfPresent(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

export async function buildKnowledge({
  knowledgeDir = DEFAULT_KNOWLEDGE_DIR,
  outputDir = DEFAULT_OUTPUT_DIR,
  embed = null,
  noEmbed = false,
  builtAt = new Date().toISOString(),
  log = console,
} = {}) {
  const chunks = await readApprovedChunks(knowledgeDir, log);
  await mkdir(outputDir, { recursive: true });

  const chunkDocument = { version: 1, built_at: builtAt, chunks };
  await writeFile(join(outputDir, 'chunks.json'), `${JSON.stringify(chunkDocument, null, 2)}\n`);

  const embeddingPath = join(outputDir, 'embeddings.json');
  const previous = await readJsonIfPresent(embeddingPath, { model: EMBED_MODEL, dim: null, vectors: {} });
  const previousVectors = previous?.vectors && typeof previous.vectors === 'object' ? previous.vectors : {};
  const currentIds = new Set(chunks.map((chunk) => chunk.id));
  const vectors = Object.fromEntries(Object.entries(previousVectors).filter(([id]) => currentIds.has(id)));
  const missing = chunks.filter((chunk) => vectors[chunk.id]?.hash !== chunk.hash);

  if (!noEmbed && missing.length) {
    if (typeof embed !== 'function') throw new Error('Embedding requires an injected embed(texts) function or --no-embed');
    for (let start = 0; start < missing.length; start += 50) {
      const batch = missing.slice(start, start + 50);
      const embedded = await embed(batch.map(embeddedText));
      if (!Array.isArray(embedded) || embedded.length !== batch.length) {
        throw new Error(`Embedder returned ${embedded?.length ?? 'no'} vectors for ${batch.length} texts`);
      }
      for (const [index, vector] of embedded.entries()) {
        if (!Array.isArray(vector) || vector.length === 0 || vector.some((value) => !Number.isFinite(value))) {
          throw new Error(`Embedder returned an invalid vector for ${batch[index].id}`);
        }
        vectors[batch[index].id] = {
          hash: batch[index].hash,
          v: vector.map((value) => Number(Number(value).toFixed(5))),
        };
      }
    }
  }

  const dimensions = Object.values(vectors).map((entry) => entry.v?.length).filter(Boolean);
  const dim = dimensions[0] ?? previous.dim ?? null;
  if (dimensions.some((value) => value !== dim)) throw new Error('Embedding vectors have inconsistent dimensions');
  await writeFile(embeddingPath, `${JSON.stringify({ model: EMBED_MODEL, dim, vectors }, null, 2)}\n`);
  const missingIds = chunks.filter((chunk) => !vectors[chunk.id] || vectors[chunk.id].hash !== chunk.hash).map((chunk) => chunk.id);
  log.log(`Built ${chunks.length} approved chunks in ${join(outputDir, 'chunks.json')}`);
  if (missingIds.length) log.log(`Missing embeddings (${missingIds.length}): ${missingIds.join(', ')}`);
  else log.log(`Embeddings complete: ${chunks.length} vectors`);
  return { chunks, vectors, missingIds };
}

export async function cloudflareEmbed(texts, env = process.env) {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required for embeddings');
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBED_MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  });
  if (!response.ok) throw new Error(`Workers AI embedding failed with HTTP ${response.status}`);
  const data = await response.json();
  const vectors = data?.result?.data ?? data?.result?.embeddings ?? data?.data;
  if (!Array.isArray(vectors)) throw new Error('Workers AI embedding response contained no vectors');
  return vectors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const noEmbed = process.argv.includes('--no-embed');
  buildKnowledge({ noEmbed, embed: noEmbed ? null : (texts) => cloudflareEmbed(texts) })
    .catch((error) => { console.error(`build-knowledge failed: ${error.message}`); process.exitCode = 1; });
}
