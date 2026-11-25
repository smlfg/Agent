#!/usr/bin/env node
// Kalibriert die coverage-Schwelle auf dem Golden-Set: höchste Trefferquote bei
// known/followup bei minimalen falschen GIVEN für unknown/ambiguous/adversarial.
import { readFile, writeFile } from 'node:fs/promises';
import { search } from '../deploy/agentfaehig-site/src/search.js';

const golden = JSON.parse(await readFile('evals/golden.json', 'utf8')).entries;
const { vectors } = JSON.parse(await readFile('evals/query-embeddings.json', 'utf8'));
const missing = [...new Set(golden.flatMap((e) => e.turns))].filter((t) => !vectors?.[t]);
if (missing.length) throw new Error(`${missing.length} Golden-Vektoren fehlen; node scripts/embed-golden.mjs ausführen`);

const rows = [];
for (const e of golden) {
  const history = e.turns.slice(0, -1).map((content) => ({ role: 'user', content }));
  const r = await search({ query: e.turns.at(-1), history, embedQuery: async (t) => vectors[t] });
  rows.push({ id: e.id, want: e.expect.coverage, alias: r.features.aliasHit, cos: r.features.cosTop });
}
const evaluate = (t) => {
  const got = rows.map((r) => ({ ...r, got: r.alias || r.cos >= t ? 'GIVEN' : 'NOT_COVERED' }));
  return { t, falseGiven: got.filter((r) => r.want === 'NOT_COVERED' && r.got === 'GIVEN').length,
    hit: got.filter((r) => r.want === 'GIVEN' && r.got === 'GIVEN').length, correct: got.filter((r) => r.want === r.got).length };
};
const grid = Array.from({ length: 61 }, (_, i) => Number((0.3 + i * 0.01).toFixed(2))).map(evaluate);
// Erst minimale falsche GIVEN (Alias-Treffer bei Fragen über bekannte Namen sind unvermeidbar), dann maximale Treffer.
const best = grid.sort((a, b) => a.falseGiven - b.falseGiven || b.hit - a.hit || a.t - b.t)[0];
await writeFile('deploy/agentfaehig-site/src/knowledge/coverage.json',
  `${JSON.stringify({ rule: 'aliasHit || cosTop >= cosThreshold', params: { cosThreshold: best.t }, calibrated_on: golden.length, result: best }, null, 2)}\n`);
console.log(`cosThreshold=${best.t} · korrekt ${best.correct}/${rows.length} · GIVEN-Treffer ${best.hit}/${rows.filter((r) => r.want === 'GIVEN').length} · falsche GIVEN ${best.falseGiven}`);
