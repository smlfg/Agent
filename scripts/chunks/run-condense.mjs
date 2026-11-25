// Orchestrator-Runner: liefert condense.mjs den echten Modellaufruf (codex exec, Luna).
// Nicht aus einer Codex-Sandbox heraus starten (fails/0017).
import { spawn } from 'node:child_process';
import { appendFile, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { condense, sourcePrompt } from './condense.mjs';

const outDir = 'scripts/chunks/.out';
const schema = resolve('scripts/chunks/batch.schema.json');
const template = await readFile('scripts/chunks/prompt.md', 'utf8');

function codex(prompt, cwd, outFile) {
  return new Promise((ok, fail) => {
    const args = ['exec', '--ephemeral', '--skip-git-repo-check', '-s', 'read-only', '-m', 'gpt-5.6-luna',
      '--json', '--output-schema', schema, '-o', outFile, '-C', cwd];
    const child = spawn('codex', args, { stdio: ['pipe', 'pipe', 'inherit'] });
    let events = '';
    child.stdout.on('data', (d) => { events += d; });
    child.on('close', (code) => (code === 0 ? ok(events) : fail(new Error(`codex exit ${code}`))));
    child.stdin.end(prompt);
  });
}

async function invoke(batch) {
  const cwd = await mkdtemp(join(tmpdir(), 'chunks-codex-'));
  const outFile = join(cwd, 'out.json');
  const events = await codex(sourcePrompt(batch, template), cwd, outFile);
  const usage = events.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .find((e) => e?.type === 'turn.completed')?.usage ?? null;
  await appendFile(`${outDir}/usage.jsonl`, `${JSON.stringify({ at: new Date().toISOString(), ids: batch.map((s) => s.id), usage })}\n`);
  console.error(`batch ${batch[0].id}… (${batch.length}) usage=${JSON.stringify(usage)}`);
  return JSON.parse(await readFile(outFile, 'utf8'));
}

const args = process.argv.slice(2);
const value = (flag, fallback) => { const i = args.indexOf(flag); return i < 0 ? fallback : args[i + 1]; };
await condense({ outDir, batchSize: Number(value('--batch', 15)), limit: value('--limit') && Number(value('--limit')), invoke });
