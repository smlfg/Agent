import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8');
const html = read('../src/living-surface.html');
const license = read('../src/vendor/openvoiceui/LICENSE-openvoiceui.txt');

function tagWith(pattern, source = html) {
  const match = source.match(new RegExp(`<[^>]*${pattern}[^>]*>`, 'i'));
  assert.ok(match, `expected a tag containing ${pattern}`);
  return match[0];
}

test('document declares English', () => {
  assert.match(html, /<html[^>]*\blang="en"/i);
});

test('document has a main landmark and an sr-only h1', () => {
  assert.match(html, /<main[\s>]/i);
  const h1 = tagWith('\\bh1\\b').toLowerCase();
  assert.ok(h1.startsWith('<h1'), 'expected an h1 element');
  assert.match(h1, /class="[^"]*\bsr-only\b[^"]*"/);
});

test('composer input is labelled', () => {
  assert.match(html, /<label[^>]*\bfor="composer-input"[^>]*>/i);
});

test('presence is hidden from assistive technology', () => {
  const presence = tagWith('id="presence"');
  assert.match(presence, /aria-hidden="true"/i);
});

test('a polite live region exists', () => {
  assert.match(html, /aria-live="polite"/i);
});

test('motion toggle exists', () => {
  assert.match(html, /id="motion-toggle"/);
});

test('skip link points to the composer input', () => {
  const skip = tagWith('href="#composer-input"');
  assert.match(skip, /class="[^"]*skip-link[^"]*"/i);
});

test('presence markup exposes both eyes and pupil containers', () => {
  for (const id of ['left-eye', 'right-eye', 'left-pupil-container', 'right-pupil-container']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing id ${id}`);
  }
});

test('source chip styles are linked', () => {
  assert.match(html, /<link[^>]*href="styles\/sources\.css"/);
});

test('vendored license is MIT', () => {
  assert.match(license, /MIT License/);
});
