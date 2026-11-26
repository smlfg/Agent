import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const chunks = JSON.parse(readFileSync(new URL('../deploy/agentfaehig-site/src/knowledge/chunks.json', import.meta.url), 'utf8'));
const persona = JSON.parse(readFileSync(new URL('../src/agent/persona.json', import.meta.url), 'utf8'));

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /(?<![\w-])(?:\+|00|0)[1-9](?:[\s()./-]?\d){7,14}(?![\w-])/;

test('chunks.json has the published schema and 125 approved chunks', () => {
  assert.equal(typeof chunks.version, 'number');
  assert.equal(typeof chunks.built_at, 'string');
  assert.equal(chunks.chunks.length, 125);
  assert.deepEqual(chunks.chunks.map((chunk) => chunk.id), [...chunks.chunks].map((chunk) => chunk.id).sort());
  for (const chunk of chunks.chunks) {
    for (const field of ['id', 'title', 'text', 'source_kind', 'hash']) assert.equal(typeof chunk[field], 'string');
    for (const field of ['topics', 'aliases', 'waypoints']) assert.ok(Array.isArray(chunk[field]));
    assert.ok(chunk.link === null || chunk.link.startsWith('https://'), `${chunk.id} link must be https:// or null`);
    assert.ok(!EMAIL.test(chunk.text), `${chunk.id} contains an email`);
    assert.ok(!PHONE.test(chunk.text), `${chunk.id} contains a phone number`);
  }
});

test('published chunks include about-samuel and do not publish contact details', () => {
  const chunk = chunks.chunks.find((entry) => entry.id === 'about-samuel');
  assert.ok(chunk);
  assert.match(chunk.text, /Samuel Fleig/);
  assert.equal(JSON.parse(readFileSync(new URL('../deploy/agentfaehig-site/src/site-config.json', import.meta.url), 'utf8')).contact.approved, false);
});

test('persona uses server context and no longer delegates answers to Samuel', () => {
  const text = JSON.stringify(persona);
  assert.doesNotMatch(text, /knowledge\.json/);
  assert.doesNotMatch(text, /Samuel's to answer/);
  assert.match(text, /site-config\.contact/);
});

test('persona exemplars carry no stock phrase the model would parrot, and stay a draft', () => {
  const replies = persona.exemplars.good.map((example) => example.agent).join(' ');
  assert.doesNotMatch(replies, /I hear you|No rush|I am here|Take your time/i);
  assert.match(persona.status, /^DRAFT/);
});

test('every github chunk links deterministically to its github repository', () => {
  const ghChunks = chunks.chunks.filter((c) => c.source_kind === 'github');
  assert.equal(ghChunks.length, 86);
  for (const chunk of ghChunks) {
    assert.ok(chunk.link !== null, `${chunk.id} must have a non-null link`);
    assert.match(chunk.link, /^https:\/\/github\.com\/smlfg\/[A-Za-z0-9_.-]+$/, `${chunk.id} link must be its github repository`);
    assert.doesNotMatch(chunk.link, /human-agent-interface\.com|kleinanzeigen\.de|nvidia\.com|wg-gesucht\.de|lebensmittelwarnung\.de/, `${chunk.id} must not link to third-party or umbrella site`);
  }

  // Regression: HAI Skills Registry must link to repository, not human-agent-interface.com
  const registry = chunks.chunks.find((c) => c.id === 'gh-hai-skills-registry');
  assert.equal(registry.link, 'https://github.com/smlfg/HAI-skills-registry');

  // Regression: MCP packages must not link to their CLI counterparts
  assert.equal(chunks.chunks.find((c) => c.id === 'gh-chefkoch-mcp').link, 'https://github.com/smlfg/chefkoch-mcp');
  assert.equal(chunks.chunks.find((c) => c.id === 'gh-hisinone-mcp').link, 'https://github.com/smlfg/hisinone-mcp');
  assert.equal(chunks.chunks.find((c) => c.id === 'gh-ilias-mcp').link, 'https://github.com/smlfg/ilias-mcp');
  assert.equal(chunks.chunks.find((c) => c.id === 'gh-wg-gesucht-mcp').link, 'https://github.com/smlfg/wg-gesucht-mcp');
});

test('every web chunk links deterministically to its web page url', () => {
  const webChunks = chunks.chunks.filter((c) => c.source_kind === 'web');
  assert.equal(webChunks.length, 18);
  for (const chunk of webChunks) {
    assert.ok(chunk.link !== null, `${chunk.id} must have a non-null link`);
    assert.match(chunk.link, /^https:\/\/(www\.)?(human-agent-interface\.com|humanagentcontrol\.com|samuelfleig\.com)\//, `${chunk.id} must link to source web domain`);
  }
});
