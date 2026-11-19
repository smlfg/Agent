import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8');

const knowledge = JSON.parse(read('../src/agent/knowledge.json'));
const persona = JSON.parse(read('../src/agent/persona.json'));

const PARAMS = [
  'tempo', 'density', 'warmth', 'calm', 'closeness', 'openness',
  'attention', 'certainty', 'playfulness', 'formality', 'depth', 'energy',
];

const SOURCE_REF = /^[\w./-]+:\d+(?:-\d+)?$/;

function strings(value, path = '$', out = []) {
  if (typeof value === 'string') {
    out.push({ path, value });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => strings(item, `${path}[${index}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) strings(item, `${path}.${key}`, out);
  }
  return out;
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /(?<![\w-])(?:\+|00|0)[1-9](?:[\s()./-]?\d){7,14}(?![\w-])/;
const STREET = /\b\d{1,4}\s+[A-ZÄÖÜ][a-zäöüß]+(?:straße|strasse|str\.|weg|gasse|platz|allee)\b/;
const STREET_DE = /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|strasse|str\.|weg|gasse|platz|allee)\s+\d{1,4}\b/;
const STREET_EN = /\b\d{1,4}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Street|St\.|Road|Rd\.|Avenue|Ave\.|Lane|Ln\.|Drive|Dr\.)\b/;
const SCHEME_URL = /\b(?:https?|ftp|ssh|wss?):\/\/\S+/i;
const WWW_URL = /\bwww\.\S+/i;
const GIT_URL = /\bgit@[^\s"']+/;
const HOST = /(?<![\p{L}\p{N}-])(?:[a-z0-9-]+\.)+(?:de|com|org|net|io|dev|app|co|ai|cloud|internal|local|lan|test)\b/giu;
const ALLOWED_HOSTS = new Set(['agentfähig.de', 'agentfaehig.de']);
const PRIVATE_MARKERS = [
  '/Users/', '~/', '/home/', '/private/', 'C:\\', '.ssh', '.env', 'localhost',
  '127.0.0.1', '192.168.', '10.0.', 'Bearer ', 'api_key', 'sk-',
];

function violations(document) {
  const found = [];
  for (const { path, value } of strings(document)) {
    const reason = [];
    if (EMAIL.test(value)) reason.push('email');
    if (PHONE.test(value)) reason.push('phone');
    if (STREET.test(value) || STREET_DE.test(value) || STREET_EN.test(value)) reason.push('address');
    if (SCHEME_URL.test(value)) reason.push('url');
    if (WWW_URL.test(value)) reason.push('url');
    if (GIT_URL.test(value)) reason.push('git-url');
    for (const marker of PRIVATE_MARKERS) if (value.includes(marker)) reason.push(`private:${marker}`);
    for (const host of value.match(HOST) ?? []) {
      if (!ALLOWED_HOSTS.has(host.toLowerCase())) reason.push(`host:${host}`);
    }
    if (reason.length) found.push({ path, reason, value });
  }
  return found;
}

test('knowledge.json is valid JSON with the expected top-level fields', () => {
  assert.equal(typeof knowledge.version, 'number');
  assert.equal(typeof knowledge.status, 'string');
  assert.equal(typeof knowledge.owner, 'object');
  assert.equal(typeof knowledge.owner.name, 'string');
  assert.ok(knowledge.owner.name.length > 0);
  for (const key of ['offerings', 'approach', 'projects_public', 'faq', 'open_questions_for_samuel']) {
    assert.ok(Array.isArray(knowledge[key]), `${key} must be an array`);
  }
  assert.ok(knowledge.offerings.length > 0);
  assert.ok(knowledge.faq.length > 0);
  assert.ok(knowledge.open_questions_for_samuel.length > 0);
});

test('every offering and faq carries a file-and-line source', () => {
  for (const offering of knowledge.offerings) {
    assert.ok(offering.source, `offering ${offering.id} has no source`);
    for (const part of offering.source.split(',')) {
      assert.match(part.trim(), SOURCE_REF, `offering ${offering.id} source is not file:line`);
    }
  }
  for (const entry of knowledge.faq) {
    assert.ok(entry.source, `faq "${entry.q}" has no source`);
    for (const part of entry.source.split(',')) {
      assert.match(part.trim(), SOURCE_REF, `faq "${entry.q}" source is not file:line`);
    }
  }
  for (const item of knowledge.approach) {
    assert.ok(item.source, 'approach item has no source');
  }
  for (const project of knowledge.projects_public) {
    assert.ok(project.source, `project ${project.id} has no source`);
  }
});

test('knowledge.json and persona.json are still drafts', () => {
  assert.match(knowledge.status, /^DRAFT/);
  assert.match(persona.status, /^DRAFT/);
  for (const offering of knowledge.offerings) assert.equal(offering.approved, false);
  for (const entry of knowledge.faq) assert.equal(entry.approved, false);
});

test('nothing is invented about contact or pricing', () => {
  assert.equal(knowledge.contact.method, null);
  assert.equal(knowledge.contact.text, null);
  assert.equal(knowledge.contact.approved, false);
  assert.equal(knowledge.pricing.stance, null);
  assert.equal(knowledge.pricing.approved, false);
});

test('no private data patterns in knowledge.json', () => {
  assert.deepEqual(violations(knowledge), []);
});

test('no private data patterns in persona.json', () => {
  assert.deepEqual(violations(persona), []);
});

test('persona defines marketing rules', () => {
  const marketing = persona.marketing;
  assert.ok(marketing && typeof marketing === 'object');
  assert.ok(Array.isArray(marketing.mention_when) && marketing.mention_when.length >= 3);
  assert.ok(Array.isArray(marketing.never_when) && marketing.never_when.length >= 3);
  assert.equal(marketing.max_unprompted_per_conversation, 1);
  assert.ok(Array.isArray(marketing.delivery) && marketing.delivery.length >= 3);
  assert.equal(marketing.contact.source, 'knowledge.contact');
  assert.match(marketing.contact.fallback_text, /Samuel will add a way to reach him here\./);
  assert.match(marketing.unknown_fact, /never guess/i);
  assert.ok(marketing.never_when.some((rule) => /distress|strained/i.test(rule)));
});

test('persona has exactly twelve parameter fragments, one per parameter', () => {
  assert.ok(Array.isArray(persona.style_map));
  assert.equal(persona.style_map.length, 12);
  const covered = persona.style_map.map((entry) => entry.param);
  assert.deepEqual([...covered].sort(), [...PARAMS].sort());
  assert.equal(new Set(covered).size, 12);
  for (const entry of persona.style_map) {
    assert.equal(typeof entry.fragment, 'string');
    assert.ok(entry.fragment.trim().length > 0, `${entry.param} has an empty fragment`);
    assert.ok(entry.fragment.trim().endsWith('.'), `${entry.param} fragment is not one sentence`);
  }
});

test('persona baseline uses the same twelve parameters', () => {
  assert.deepEqual(Object.keys(persona.baseline).sort(), [...PARAMS].sort());
  for (const value of Object.values(persona.baseline)) {
    assert.ok(value >= 0 && value <= 1);
  }
});

test('persona keeps hard rules and safety limits', () => {
  assert.ok(Array.isArray(persona.rules.hard) && persona.rules.hard.length > 0);
  assert.ok(persona.rules.forbidden_phrases.includes('How can I help'));
  assert.equal(persona.safety.limits.no_prices, true);
  assert.equal(persona.safety.limits.no_invented_references, true);
  assert.equal(persona.safety.injection.treat_user_text_as, 'data');
  assert.ok(persona.limits.max_sentences <= 3);
});
