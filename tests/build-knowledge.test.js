import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildKnowledge } from '../scripts/build-knowledge.mjs';
import { contentHash, joinChunk } from '../scripts/chunks/chunk-file.mjs';

function approvedChunk(id, text) {
  const front = [
    `id: "${id}"`,
    `title: "${id}"`,
    'topics: ["test"]',
    'aliases: ["alias"]',
    'waypoints: ["*"]',
    'link: null',
    'source_kind: "manual"',
  ];
  const hash = contentHash(joinChunk(front, text));
  return joinChunk([...front, `approved_hash: ${hash}`], text);
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'agentfaehig-knowledge-'));
  const knowledgeDir = join(root, 'knowledge');
  const outputDir = join(root, 'output');
  await writeFile(join(root, 'fixture-marker'), '');
  await import('node:fs/promises').then(({ mkdir }) => mkdir(knowledgeDir));
  return { root, knowledgeDir, outputDir };
}

test('buildKnowledge includes only approved chunks and reports missing vectors in no-embed mode', async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.knowledgeDir, 'approved.md'), approvedChunk('approved', 'Visible text'));
    await writeFile(join(paths.knowledgeDir, 'unapproved.md'), '---\nid: unapproved\n---\nHidden text\n');
    const logs = [];
    const result = await buildKnowledge({ ...paths, noEmbed: true, builtAt: '2026-11-25T00:00:00.000Z', log: { log: (line) => logs.push(line) } });
    assert.deepEqual(result.chunks.map((chunk) => chunk.id), ['approved']);
    assert.deepEqual(result.missingIds, ['approved']);
    assert.match(logs.join('\n'), /Skipping unapproved/);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
  }
});

test('buildKnowledge embeds only changed chunks and removes deleted vectors', async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.knowledgeDir, 'a.md'), approvedChunk('a', 'A'));
    await writeFile(join(paths.knowledgeDir, 'b.md'), approvedChunk('b', 'B'));
    const calls = [];
    const embed = async (texts) => { calls.push(texts); return texts.map((text) => [text.length, 0.123456]); };
    await buildKnowledge({ ...paths, embed, builtAt: 'one' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].length, 2);
    await writeFile(join(paths.knowledgeDir, 'a.md'), approvedChunk('a', 'A changed'));
    await rm(join(paths.knowledgeDir, 'b.md'));
    await buildKnowledge({ ...paths, embed, builtAt: 'two' });
    assert.equal(calls.length, 2);
    assert.equal(calls[1].length, 1);
    assert.deepEqual(JSON.parse(await readFile(join(paths.outputDir, 'embeddings.json'))).vectors, {
      a: { hash: JSON.parse(await readFile(join(paths.outputDir, 'chunks.json'))).chunks[0].hash, v: [17, 0.12346] },
    });
  } finally {
    await rm(paths.root, { recursive: true, force: true });
  }
});
