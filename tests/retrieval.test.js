// Offline-Gate der Suche (ADR-0007). Regel (Owner, 25.11.2026): Ranking + Sicherheit hart.
// Ob eine Antwort wirklich belegt ist, prüft evals/answers.mjs — nicht dieser Test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { search } from '../deploy/agentfaehig-site/src/search.js';

const RANKING_QUOTA = 0.85;
const golden = JSON.parse(await readFile('evals/golden.json', 'utf8')).entries;
let queryEmbeddings;
try { queryEmbeddings = JSON.parse(await readFile('evals/query-embeddings.json', 'utf8')); } catch { queryEmbeddings = null; }
const embedQuery = async (text) => queryEmbeddings.vectors[text];

// Wie im Betrieb: der Browser schickt die Quellen der letzten Antwort als last_source_ids mit.
async function run(entry) {
  let lastSourceIds = []; const history = []; let result;
  for (const turn of entry.turns) {
    result = await search({ query: turn, history, lastSourceIds, embedQuery });
    lastSourceIds = result.hits.slice(0, 3).map((h) => h.id);
    history.push({ role: 'user', content: turn });
  }
  return result;
}

test('Golden-Vektoren vollständig', () => {
  const missing = [...new Set(golden.flatMap((e) => e.turns))].filter((t) => !Array.isArray(queryEmbeddings?.vectors?.[t]));
  assert.equal(missing.length, 0, `Missing Golden vectors (${missing.length}); node scripts/embed-golden.mjs ausführen`);
});

test('hart: „wer ist samuel" → about-samuel auf Platz 1', async () => {
  const r = await search({ query: 'wer ist samuel', embedQuery });
  assert.equal(r.hits[0]?.id, 'about-samuel');
  assert.equal(r.coverage, 'GIVEN');
});

test('hart: adversarial → kein GIVEN, gefälschte Marker erzwingen nichts', async () => {
  const bad = [];
  for (const e of golden.filter((x) => x.class === 'adversarial')) {
    const r = await run(e);
    if (r.coverage !== 'NOT_COVERED') bad.push(`${e.id}: ${r.coverage}`);
    for (const forced of [...e.turns.at(-1).matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1])) {
      if (r.hits[0]?.id === forced && !r.features.aliasHit && r.features.cosTop < 0.56) bad.push(`${e.id}: Marker ${forced} erzwingt Platz 1`);
    }
  }
  assert.deepEqual(bad, []);
});

test('hart: unbekannt/mehrdeutig ohne Alias-Treffer → NOT_COVERED', async () => {
  const bad = [];
  for (const e of golden.filter((x) => ['unknown', 'ambiguous'].includes(x.class) && !x.answer_only)) {
    const r = await run(e);
    if (!r.features.aliasHit && r.coverage !== 'NOT_COVERED') bad.push(`${e.id}: cos ${r.features.cosTop.toFixed(3)}`);
  }
  assert.deepEqual(bad, []);
});

test(`Quote: bekannt + Rückfragen → Pflicht-Chunk in Top 5 (≥ ${RANKING_QUOTA * 100} %)`, async () => {
  const cases = golden.filter((x) => ['known', 'followup'].includes(x.class));
  const misses = [];
  for (const e of cases) {
    const ids = (await run(e)).hits.map((h) => h.id);
    const missing = e.expect.must_ids.filter((id) => !ids.includes(id));
    if (missing.length) misses.push(`${e.id}: fehlt ${missing.join(',')}`);
  }
  const rate = (cases.length - misses.length) / cases.length;
  if (misses.length) console.log(`Ranking-Quote ${(rate * 100).toFixed(0)} % — verfehlt:\n  ${misses.join('\n  ')}`);
  assert.ok(rate >= RANKING_QUOTA, `Ranking-Quote ${(rate * 100).toFixed(0)} % < ${RANKING_QUOTA * 100} %`);
});
