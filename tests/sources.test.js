import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeSources, renderSources } from '../src/conversation/sources.js';
import { createAgentChain } from '../src/agent/chain.js';
import { createRemoteAgent } from '../src/agent/remoteAgent.js';
import { createAdaptiveAgent } from '../src/surface/surface-adapter.js';
import { createSurfaceStore } from '../src/surface/surface-state.js';

// Just enough DOM. There is deliberately no innerHTML: titles must be text.
function fakeDoc() {
  return {
    createElement(tag) {
      return {
        tag,
        className: '',
        textContent: '',
        attributes: {},
        children: [],
        setAttribute(name, value) { this.attributes[name] = value; },
        append(...nodes) { this.children.push(...nodes); },
      };
    },
  };
}

const chipsOf = (list) => list.children.map((row) => row.children[0]);

test('an http(s) source becomes a link that keeps the URL verbatim', () => {
  const list = renderSources(fakeDoc(), [
    { id: 'a', title: 'About', link: 'https://example.org' },
    { id: 'b', title: 'Old', link: 'http://example.org/x?y=1' },
  ]);
  assert.equal(list.attributes['aria-label'], 'Sources');
  const [first, second] = chipsOf(list);
  assert.equal(first.tag, 'a');
  assert.equal(first.attributes.href, 'https://example.org');
  assert.equal(first.attributes.rel, 'noopener noreferrer');
  assert.equal(first.attributes.target, '_blank');
  assert.equal(second.attributes.href, 'http://example.org/x?y=1');
});

test('anything but an absolute http(s) URL stays an unlinked chip', () => {
  const links = [
    'javascript:alert(1)', 'JAVASCRIPT:alert(1)', '  javascript:alert(1)',
    'data:text/html,x', 'mailto:a@b.c', '/relative', '//evil.example', '', null, undefined,
    { toString: () => 'https://example.org' },
  ];
  for (const link of links) {
    const [chip] = chipsOf(renderSources(fakeDoc(), [{ id: 'x', title: 'X', link }]));
    assert.equal(chip.tag, 'span', String(link));
    assert.equal(chip.attributes.href, undefined, String(link));
  }
});

test('titles are written as plain text', () => {
  const title = '<img src=x onerror=alert(1)>';
  const [chip] = chipsOf(renderSources(fakeDoc(), [{ id: 'x', title, link: null }]));
  assert.equal(chip.textContent, title);
  assert.equal(chip.children.length, 0);
});

test('no usable source renders nothing', () => {
  for (const raw of [undefined, null, 'x', [], [null, {}, { id: 'a', title: '  ' }, { title: 7 }]]) {
    assert.equal(renderSources(fakeDoc(), raw), null);
  }
});

test('duplicate ids collapse to one chip, order is kept', () => {
  const items = normalizeSources([
    { id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'a', title: 'A again' },
  ]);
  assert.deepEqual(items.map((item) => item.title), ['A', 'B']);
});

test('server sources survive remote agent, chain and surface adapter', async () => {
  const sources = [{ id: 'about-samuel', title: 'Über Samuel', link: null }];
  const remote = createRemoteAgent({
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ text: 'Hallo.', sources }) }),
  });
  const agent = createAdaptiveAgent({
    innerAgent: createAgentChain([remote]),
    surfaceStore: createSurfaceStore(),
  });
  const result = await agent.respond('wer ist samuel');
  assert.deepEqual(result.sources, sources);
});

// mountConversation needs a real DOM, so the wiring is checked in the source.
test('the conversation places chips after the answer once typing is done', () => {
  const code = readFileSync(new URL('../src/conversation/conversation.js', import.meta.url), 'utf8');
  const done = code.slice(code.indexOf('onDone() {'), code.indexOf('typewriter.start()'));
  assert.match(done, /renderSources\(doc, result\?\.sources\)/);
  assert.match(done, /answerEl\.after\(chips\)/);
});
