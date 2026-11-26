import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { htmlToText } from '../scripts/chunks/collect.mjs';
import { buildBatches, pendingSources } from '../scripts/chunks/condense.mjs';
import { validateChunk, hints, resolveDeterministicLink } from '../scripts/chunks/check.mjs';
import { chunkHash, approve } from '../scripts/chunks/approve.mjs';
import { isApproved } from '../scripts/chunks/chunk-file.mjs';
import { migrate } from '../scripts/chunks/migrate-knowledge.mjs';

test('HTML to text removes chrome, tags, entities and whitespace', () => {
  assert.equal(htmlToText('<header>x</header><main>Hello&nbsp; <b>world</b></main><script>bad</script>'), 'Hello world');
});
test('batching is stable and cache excludes unchanged sources', () => {
  const sources = [{ id: 'a', source_hash: '1' }, { id: 'b', source_hash: '2' }, { id: 'c', source_hash: '3' }];
  assert.deepEqual(buildBatches(sources, 2).map((b) => b.map((s) => s.id)), [['a', 'b'], ['c']]);
  assert.deepEqual(pendingSources(sources, { a: '1' }).map((s) => s.id), ['b', 'c']);
});
test('chunk validation checks source id, link, word limit and hints', () => {
  const source = { id: 'x', text: 'https://example.com/x' }; const seen = new Set();
  assert.deepEqual(validateChunk({ id: 'x', title: 'X', text: 'Kurz', topics: [], aliases: [], waypoints: ['*'], link: 'https://example.com/x' }, source, seen), []);
  assert.ok(validateChunk({ id: 'y', title: 'Y', text: 'a '.repeat(121), topics: [], aliases: [], waypoints: [], link: 'https://bad.example' }, source).length >= 3);
  assert.deepEqual(hints('Mail a@example.com, Ruf 01234567890'), ['E-Mail', 'Telefon']);
});
test('chunk hash changes when approved content changes', () => { assert.notEqual(chunkHash('one'), chunkHash('two')); });
test('approval is bound to content: text change invalidates it', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'approve-test-')); const file = join(dir, 'a.md');
  await writeFile(file, '---\nid: a\ntitle: "A"\nupdated_at: 2026-11-25\n---\n\nOriginal\n');
  await writeFile(join(dir, 'ok.json'), JSON.stringify({ approved: ['a'] }));
  await approve({ from: join(dir, 'ok.json'), knowledgeDir: dir });
  const approved = await readFile(file, 'utf8'); assert.ok(isApproved(approved));
  assert.ok(isApproved(approved.replace('2026-11-25', '2026-12-01')), 'updated_at does not invalidate');
  assert.ok(!isApproved(approved.replace('Original', 'Geändert')), 'text change invalidates');
  assert.ok(!isApproved(approved.replace('title: "A"', 'title: "B"')), 'frontmatter change invalidates');
});
test('screening: personal chunks first, + approves, − removes approval', async () => {
  const { loadChunks, decide } = await import('../scripts/chunks/screen.mjs');
  const dir = await mkdtemp(join(tmpdir(), 'screen-test-'));
  await writeFile(join(dir, 'gh-x.md'), '---\nid: gh-x\ntitle: "X"\nsource_kind: "github"\n---\n\nRepo\n');
  await writeFile(join(dir, 'about.md'), '---\nid: about\ntitle: "Über"\nsource_kind: "manual"\n---\n\nPerson\n');
  let rows = await loadChunks(dir); assert.deepEqual(rows.map((r) => r.id), ['about', 'gh-x']);
  await decide('gh-x.md', true, dir); rows = await loadChunks(dir); assert.ok(rows.find((r) => r.id === 'gh-x').approved);
  await decide('gh-x.md', false, dir); rows = await loadChunks(dir); assert.ok(!rows.find((r) => r.id === 'gh-x').approved);
});
test('knowledge migration creates one manual source per supported section item', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'chunks-test-')); const input = join(dir, 'knowledge.json');
  await writeFile(input, JSON.stringify({ owner: { name: 'S' }, offerings: [{ id: 'offer' }], approach: [{ point: 'p' }], faq: [{ q: 'q' }], projects_public: [{ id: 'project' }] }));
  assert.equal(await migrate({ input, outDir: dir }), 5); assert.equal((await readdir(join(dir, 'sources'))).length, 5);
  assert.equal(JSON.parse(await readFile(join(dir, 'sources', 'kj-owner.json'), 'utf8')).source_kind, 'manual');
});
test('resolveDeterministicLink maps sources to canonical URLs', () => {
  assert.equal(resolveDeterministicLink({ source_kind: 'github', url: 'https://github.com/smlfg/repo' }), 'https://github.com/smlfg/repo');
  assert.equal(resolveDeterministicLink({ source_kind: 'web', url: 'https://human-agent-interface.com/x' }), 'https://human-agent-interface.com/x');
  assert.equal(resolveDeterministicLink({ source_kind: 'manual', url: 'kj-owner' }), null);
  assert.equal(resolveDeterministicLink({ source_kind: 'manual', url: 'https://example.org/manual' }), 'https://example.org/manual');
  // Validation rejects mismatched github link
  const ghSource = { id: 'gh-repo', source_kind: 'github', url: 'https://github.com/smlfg/repo', text: 'Some text' };
  assert.ok(validateChunk({ id: 'gh-repo', title: 'Repo', text: 'Text', topics: [], aliases: [], waypoints: ['*'], link: 'https://wrong.example.com' }, ghSource).length >= 1);
});
