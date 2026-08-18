/**
 * Smoke: deny-by-default + grant + revoke + enforce fails after revoke.
 * Glue only — no HAI feature code.
 */
import {
  generateKeyPair,
  PasetoV4PublicSigner,
  loadRules,
  DeclarativePolicyEngine,
  InMemoryAuditSink,
  InMemoryPendingStore,
  InMemoryRevocationList,
  InMemorySpendLedger,
  Broker,
  LeaseEnforcer,
} from 'leasebroker';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = [];
const log = (step, obj) => {
  const line = { step, ...obj, at: new Date().toISOString() };
  out.push(line);
  console.log(JSON.stringify(line));
};

const kp = generateKeyPair('smoke-k1');
const signer = new PasetoV4PublicSigner(kp);
const revocations = new InMemoryRevocationList();
const spend = new InMemorySpendLedger();
const enforcer = new LeaseEnforcer(signer, revocations, spend);

const req = {
  agentId: 'cursor-main',
  taskId: 'qualify-smoke-0014',
  capabilities: [{ kind: 'fs.read', paths: ['./data/**'] }],
  requestedDurationMs: 600_000,
};

// --- 1) Deny without matching rule ---
{
  const policy = new DeclarativePolicyEngine(loadRules([]));
  const broker = new Broker(policy, signer, new InMemoryAuditSink(), new InMemoryPendingStore(), kp.kid);
  const result = broker.request(req);
  log('deny_empty_rules', { type: result.type, reason: result.reason ?? null });
  if (result.type !== 'denied') {
    writeFileSync(join(root, 'smoke-result.json'), JSON.stringify({ ok: false, out }, null, 2));
    process.exit(1);
  }
}

// --- 2) Grant with allow rule ---
let token;
let leaseId;
{
  const rules = loadRules(JSON.parse(readFileSync(join(root, 'rules-allow-fs.json'), 'utf8')));
  const policy = new DeclarativePolicyEngine(rules);
  const broker = new Broker(policy, signer, new InMemoryAuditSink(), new InMemoryPendingStore(), kp.kid);
  const result = broker.request(req);
  leaseId = result.type === 'granted' ? result.lease?.id ?? null : null;
  log('grant_with_rule', { type: result.type, leaseId });
  if (result.type !== 'granted' || !leaseId) {
    writeFileSync(join(root, 'smoke-result.json'), JSON.stringify({ ok: false, out }, null, 2));
    process.exit(1);
  }
  token = result.token;
  const checkOk = enforcer.check(token, { kind: 'fs.read', path: './data/hello.txt' });
  log('enforce_before_revoke', { ok: checkOk.ok, detail: checkOk.ok ? null : checkOk });
  if (!checkOk.ok) {
    writeFileSync(join(root, 'smoke-result.json'), JSON.stringify({ ok: false, out }, null, 2));
    process.exit(1);
  }
  const checkDenyPath = enforcer.check(token, { kind: 'fs.read', path: './private/secret.txt' });
  log('enforce_out_of_scope_path', { ok: checkDenyPath.ok });
}

// --- 3) Revoke then enforce must fail ---
{
  revocations.revoke(leaseId);
  log('revoke', { leaseId });
  const check = enforcer.check(token, { kind: 'fs.read', path: './data/hello.txt' });
  log('enforce_after_revoke', { ok: check.ok, reason: check.ok ? null : (check.reason ?? check) });
  if (check.ok) {
    writeFileSync(join(root, 'smoke-result.json'), JSON.stringify({ ok: false, out }, null, 2));
    process.exit(1);
  }
}

// CLI deny smoke (empty rules file)
import { spawnSync } from 'node:child_process';
const stateDir = join(root, '.leasebroker-cli-smoke');
mkdirSync(stateDir, { recursive: true });
const cli = spawnSync(
  'npx',
  [
    'leasebroker',
    'request',
    '--state-dir',
    stateDir,
    '--rules-file',
    join(root, 'rules-empty.json'),
    '--request',
    JSON.stringify(req),
  ],
  { cwd: root, encoding: 'utf8' }
);
log('cli_deny_empty_rules', {
  status: cli.status,
  stdout: (cli.stdout || '').trim().slice(0, 500),
  stderr: (cli.stderr || '').trim().slice(0, 300),
});

const ok = out.some((e) => e.step === 'deny_empty_rules' && e.type === 'denied')
  && out.some((e) => e.step === 'grant_with_rule' && e.type === 'granted')
  && out.some((e) => e.step === 'enforce_after_revoke' && e.ok === false)
  && cli.status === 2;

writeFileSync(join(root, 'smoke-result.json'), JSON.stringify({ ok, out }, null, 2));
process.exit(ok ? 0 : 1);
