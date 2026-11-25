#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { cloudflareEmbed } from './build-knowledge.mjs';

const evals = JSON.parse(await readFile('evals/golden.json', 'utf8'));
const path = 'evals/query-embeddings.json';
let existing = { model: '@cf/baai/bge-m3', vectors: {} };
try { existing = JSON.parse(await readFile(path, 'utf8')); } catch {}
const texts = [...new Set(evals.entries.flatMap((entry) => entry.turns))];
const missing = texts.filter((text) => !Array.isArray(existing.vectors?.[text]));
if (!missing.length) { console.log(`Golden embeddings complete: ${texts.length} vectors`); process.exit(0); }
let embedded;
try { embedded = await cloudflareEmbed(missing); }
catch (error) { console.error(`embed-golden failed: ${error.message}`); process.exitCode = 1; }
if (embedded) {
  for (const [index, vector] of embedded.entries()) existing.vectors[missing[index]] = vector;
  await writeFile(path, `${JSON.stringify(existing, null, 2)}\n`);
  console.log(`Embedded ${missing.length} missing Golden messages into ${path}`);
}
