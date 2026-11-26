// Local dev server for Agentfähig:
// - Serves src/ with Cache-Control: no-store
// - Persists POST /__dev/transcript turns into sessions/raw/<sessionId>.{jsonl,md}
// - Proxies POST /api/agent to local wrangler dev (WORKER_URL, default 127.0.0.1:8787)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const MAX_BODY_BYTES = 256 * 1024;
const PROXY_TIMEOUT_MS = 10000;
const LOOPBACK_ORIGIN_RE = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function sanitizeSessionId(raw) {
  const cleaned = String(raw || 'session').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return cleaned || 'session';
}

function loopbackCorsHeaders(req) {
  const origin = String(req.headers.origin || '');
  if (!LOOPBACK_ORIGIN_RE.test(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        const err = new Error('Payload too large');
        err.statusCode = 413;
        req.destroy(err);
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function formatTurnMarkdown(entry, isFirst = false) {
  const safeId = sanitizeSessionId(entry?.sessionId);
  const lines = [];
  if (isFirst) {
    lines.push(`# Local Session ${safeId}`);
    lines.push('');
    lines.push(`- Origin: ${entry?.origin || 'unknown'}`);
    lines.push('');
  }
  const turn = entry?.turn ?? '?';
  const ts = entry?.ts || new Date().toISOString();
  const status = entry?.status || 'ok';
  lines.push(`## Turn ${turn} (${ts}) — ${status}`);
  lines.push('');
  lines.push(`**Visitor:** ${entry?.prompt ?? ''}`);
  lines.push('');
  if (status === 'ok') {
    lines.push(`**Agent:** ${entry?.answer ?? ''}`);
    lines.push('');
    const meta = [
      `provider=${entry?.provider ?? 'unknown'}`,
      `model=${entry?.model ?? 'none'}`,
      `dev=${Boolean(entry?.dev)}`,
      `latency=${entry?.durationMs ?? 0}ms`,
    ];
    if (entry?.coverage) meta.push(`coverage=${JSON.stringify(entry.coverage)}`);
    if (entry?.contact_card) meta.push('contact_card=true');
    if (Array.isArray(entry?.sources) && entry.sources.length) {
      const titles = entry.sources.map((s) => s?.title || s?.id || s?.url || '').filter(Boolean);
      if (titles.length) meta.push(`sources=${titles.join(', ')}`);
    }
    lines.push(`_Meta: ${meta.join(' | ')}_`);
  } else {
    lines.push(`**Error:** ${entry?.error ?? 'unknown error'} (${entry?.durationMs ?? 0}ms)`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function createDevServer({
  srcDir = path.join(REPO_ROOT, 'src'),
  sessionsDir = path.join(REPO_ROOT, 'sessions', 'raw'),
  workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:8787',
} = {}) {
  const resolvedSrc = path.resolve(srcDir);
  const resolvedSessions = path.resolve(sessionsDir);
  const resolvedWorker = String(workerUrl).replace(/\/+$/, '');

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = url.pathname;
    const cors = loopbackCorsHeaders(req);

    if (pathname === '/__dev/transcript') {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Cache-Control': 'no-store', ...cors });
        res.end();
        return;
      }
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method_not_allowed' }, cors);
        return;
      }
      try {
        const raw = await readBody(req);
        const entry = JSON.parse(raw.toString('utf8'));
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          sendJson(res, 400, { error: 'invalid_entry' }, cors);
          return;
        }
        const safeId = sanitizeSessionId(entry.sessionId);
        fs.mkdirSync(resolvedSessions, { recursive: true });
        const jsonlPath = path.join(resolvedSessions, `${safeId}.jsonl`);
        const mdPath = path.join(resolvedSessions, `${safeId}.md`);
        const isFirst = !fs.existsSync(mdPath);
        fs.appendFileSync(jsonlPath, `${JSON.stringify(entry)}\n`, 'utf8');
        fs.appendFileSync(mdPath, formatTurnMarkdown(entry, isFirst), 'utf8');
        sendJson(res, 200, { ok: true, file: path.basename(jsonlPath) }, cors);
      } catch (error) {
        const status = error?.statusCode === 413 ? 413 : 400;
        sendJson(res, status, { error: String(error?.message || 'invalid_json') }, cors);
      }
      return;
    }

    if (pathname === '/api/agent') {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Only POST requests are accepted.' });
        return;
      }
      try {
        const raw = await readBody(req);
        const upstream = await fetch(`${resolvedWorker}/api/agent`, {
          method: 'POST',
          headers: {
            'Content-Type': req.headers['content-type'] || 'application/json',
          },
          body: raw,
          signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
        });
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.writeHead(upstream.status, {
          'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(buf);
      } catch {
        sendJson(res, 503, { error: 'local_worker_offline' });
      }
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Cache-Control': 'no-store' });
      res.end();
      return;
    }

    let decoded;
    try {
      decoded = decodeURIComponent(pathname === '/' ? '/living-surface.html' : pathname);
    } catch {
      res.writeHead(400, { 'Cache-Control': 'no-store' });
      res.end('Bad Request');
      return;
    }

    const relPath = decoded.replace(/^\/+/, '');
    const filePath = path.resolve(resolvedSrc, relPath);
    if (filePath !== resolvedSrc && !filePath.startsWith(`${resolvedSrc}${path.sep}`)) {
      res.writeHead(403, { 'Cache-Control': 'no-store' });
      res.end('Forbidden');
      return;
    }

    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      res.writeHead(404, { 'Cache-Control': 'no-store' });
      res.end('Not Found');
      return;
    }

    if (!stat.isFile()) {
      res.writeHead(404, { 'Cache-Control': 'no-store' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 5173;
  const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:8787';
  const server = createDevServer({ workerUrl });
  server.listen(port, '127.0.0.1', () => {
    console.log(
      `agentfaehig dev: http://127.0.0.1:${port}/living-surface.html (transcripts -> sessions/raw/, /api/agent -> ${workerUrl})`,
    );
  });
}
