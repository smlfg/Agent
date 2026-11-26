import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tokenizeLinks, renderLinkedText } from '../src/conversation/linkify.js';

function createMockDocument() {
  function guardInnerHTML(target) {
    Object.defineProperty(target, 'innerHTML', {
      configurable: true,
      get() {
        throw new Error('innerHTML must never be read');
      },
      set() {
        throw new Error('innerHTML must never be written');
      },
    });
    return target;
  }

  const doc = {
    createTextNode(value) {
      return { nodeType: 3, textContent: value };
    },
    createElement(tagName) {
      const el = {
        nodeType: 1,
        tagName: tagName.toUpperCase(),
        className: '',
        href: '',
        textContent: '',
        children: [],
        replaceChildren(...nodes) {
          this.children = nodes;
        },
      };
      return guardInnerHTML(el);
    },
  };

  function createContainer() {
    const container = {
      nodeType: 1,
      tagName: 'SPAN',
      ownerDocument: doc,
      children: [{ nodeType: 3, textContent: 'stale' }],
      replaceChildren(...nodes) {
        this.children = nodes;
      },
    };
    return guardInnerHTML(container);
  }

  return { doc, createContainer };
}

test('tokenizeLinks returns empty array for empty or nullish input', () => {
  assert.deepEqual(tokenizeLinks(''), []);
  assert.deepEqual(tokenizeLinks(null), []);
  assert.deepEqual(tokenizeLinks(undefined), []);
});

test('tokenizeLinks parses https, www, mailto, and safe internal paths', () => {
  const input =
    'See https://agentfaehig.de/about, www.human-agent-interface.com, mailto:hello@agentfaehig.de, /classic/, /impressum, and (/datenschutz/info).';
  const tokens = tokenizeLinks(input);

  assert.deepEqual(tokens, [
    { type: 'text', value: 'See ' },
    { type: 'link', label: 'https://agentfaehig.de/about', href: 'https://agentfaehig.de/about', external: true },
    { type: 'text', value: ', ' },
    {
      type: 'link',
      label: 'www.human-agent-interface.com',
      href: 'https://www.human-agent-interface.com',
      external: true,
    },
    { type: 'text', value: ', ' },
    { type: 'link', label: 'mailto:hello@agentfaehig.de', href: 'mailto:hello@agentfaehig.de', external: false },
    { type: 'text', value: ', ' },
    { type: 'link', label: '/classic/', href: '/classic/', external: false },
    { type: 'text', value: ', ' },
    { type: 'link', label: '/impressum', href: '/impressum', external: false },
    { type: 'text', value: ', and (' },
    { type: 'link', label: '/datenschutz/info', href: '/datenschutz/info', external: false },
    { type: 'text', value: ').' },
  ]);
});

test('tokenizeLinks strips trailing punctuation and unbalanced closing brackets while preserving balanced parens', () => {
  assert.deepEqual(tokenizeLinks('Read https://en.wikipedia.org/wiki/Foo_(bar).'), [
    { type: 'text', value: 'Read ' },
    {
      type: 'link',
      label: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      href: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      external: true,
    },
    { type: 'text', value: '.' },
  ]);

  assert.deepEqual(tokenizeLinks('(https://en.wikipedia.org/wiki/Foo_(bar))!'), [
    { type: 'text', value: '(' },
    {
      type: 'link',
      label: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      href: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      external: true,
    },
    { type: 'text', value: ')!' },
  ]);

  assert.deepEqual(tokenizeLinks('[https://agentfaehig.de/a[1]];'), [
    { type: 'text', value: '[' },
    { type: 'link', label: 'https://agentfaehig.de/a[1]', href: 'https://agentfaehig.de/a[1]', external: true },
    { type: 'text', value: '];' },
  ]);

  assert.deepEqual(tokenizeLinks('„https://agentfaehig.de”’»?:,'), [
    { type: 'text', value: '„' },
    { type: 'link', label: 'https://agentfaehig.de', href: 'https://agentfaehig.de', external: true },
    { type: 'text', value: '”’»?:' + ',' },
  ]);
});

test('tokenizeLinks rejects XSS payloads, disallowed schemes, protocol-relative paths, and malformed targets', () => {
  const cases = [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'http://example.com',
    'http://www.evil.com',
    '//evil.com',
    '//evil.com/impressum',
    'foo/impressum',
    '/classic-mode',
    '<script>alert(1)</script>',
    'mailto:notanemail',
    'mailto:@example.com',
    'mailto:user@localhost',
    'mailto:user@.com',
    'mailto:user@domain.',
    'www.',
    'foo.www.example.com',
  ];

  for (const input of cases) {
    assert.deepEqual(tokenizeLinks(input), [{ type: 'text', value: input }], `should stay plain text: ${input}`);
  }
});

test('tokenizeLinks collapses adjacent text tokens cleanly', () => {
  const input = 'Avoid http://evil.com and www. and keep https://agentfaehig.de safe.';
  const tokens = tokenizeLinks(input);

  assert.deepEqual(tokens, [
    { type: 'text', value: 'Avoid http://evil.com and www. and keep ' },
    { type: 'link', label: 'https://agentfaehig.de', href: 'https://agentfaehig.de', external: true },
    { type: 'text', value: ' safe.' },
  ]);
  for (let i = 1; i < tokens.length; i++) {
    assert.ok(!(tokens[i].type === 'text' && tokens[i - 1].type === 'text'));
  }
});

test('renderLinkedText builds safe DOM nodes with target/rel only on external links and zero innerHTML', () => {
  const { createContainer } = createMockDocument();
  const container = createContainer();

  renderLinkedText(
    container,
    'Go https://agentfaehig.de, www.human-agent-interface.com, mailto:hi@agentfaehig.de, or /impressum.',
  );

  assert.equal(container.children.length, 9);

  assert.deepEqual(container.children[0], { nodeType: 3, textContent: 'Go ' });

  const httpsLink = container.children[1];
  assert.equal(httpsLink.tagName, 'A');
  assert.equal(httpsLink.className, 'answer-link');
  assert.equal(httpsLink.href, 'https://agentfaehig.de');
  assert.equal(httpsLink.textContent, 'https://agentfaehig.de');
  assert.equal(httpsLink.target, '_blank');
  assert.equal(httpsLink.rel, 'noopener noreferrer');

  const wwwLink = container.children[3];
  assert.equal(wwwLink.tagName, 'A');
  assert.equal(wwwLink.className, 'answer-link');
  assert.equal(wwwLink.href, 'https://www.human-agent-interface.com');
  assert.equal(wwwLink.textContent, 'www.human-agent-interface.com');
  assert.equal(wwwLink.target, '_blank');
  assert.equal(wwwLink.rel, 'noopener noreferrer');

  const mailtoLink = container.children[5];
  assert.equal(mailtoLink.tagName, 'A');
  assert.equal(mailtoLink.className, 'answer-link');
  assert.equal(mailtoLink.href, 'mailto:hi@agentfaehig.de');
  assert.equal(mailtoLink.textContent, 'mailto:hi@agentfaehig.de');
  assert.equal(mailtoLink.target, undefined);
  assert.equal(mailtoLink.rel, undefined);

  const internalLink = container.children[7];
  assert.equal(internalLink.tagName, 'A');
  assert.equal(internalLink.className, 'answer-link');
  assert.equal(internalLink.href, '/impressum');
  assert.equal(internalLink.textContent, '/impressum');
  assert.equal(internalLink.target, undefined);
  assert.equal(internalLink.rel, undefined);

  assert.deepEqual(container.children[8], { nodeType: 3, textContent: '.' });
});

test('src/conversation/linkify.js contains zero innerHTML usage', () => {
  const source = readFileSync(new URL('../src/conversation/linkify.js', import.meta.url), 'utf8');
  const withoutComments = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal(withoutComments.includes('innerHTML'), false);
});
