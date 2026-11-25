import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { URL } from 'node:url';

const run = promisify(execFile);
export const sha256 = (text) => createHash('sha256').update(text).digest('hex');
export const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function htmlToText(html) {
  return html.replace(/<(script|style|nav|footer|header)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ').trim();
}
const record = (id, source_kind, url, title, text, meta = {}) => ({
  id, source_kind, url, title, text: text.slice(0, 8000), meta, source_hash: sha256(text.slice(0, 8000)),
});

async function save(outDir, item) {
  await mkdir(`${outDir}/sources`, { recursive: true });
  await writeFile(`${outDir}/sources/${item.id}.json`, `${JSON.stringify(item, null, 2)}\n`);
}
export async function collectGithub({ outDir, exec = run } = {}) {
  const { stdout } = await exec('gh', ['repo', 'list', 'smlfg', '--visibility', 'public', '--limit', '300', '--json', 'name,isFork,description,repositoryTopics,homepageUrl,url,pushedAt']);
  const repos = JSON.parse(stdout).filter((repo) => !repo.isFork);
  for (const repo of repos) {
    let text = '';
    try { ({ stdout: text } = await exec('gh', ['api', `repos/smlfg/${repo.name}/readme`, '-H', 'Accept: application/vnd.github.raw'])); } catch { /* metadata only */ }
    await save(outDir, record(`gh-${slug(repo.name)}`, 'github', repo.url, repo.name, text, repo));
  }
  return repos.length;
}
async function siteLinks(start, html, fetcher) {
  const origin = new URL(start).origin;
  const links = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => {
    try { return new URL(m[1], start); } catch { return null; }
  }).filter((u) => u && u.origin === origin && !u.hash);
  const sitemap = new URL('/sitemap.xml', start);
  try {
    const xml = await (await fetcher(sitemap)).text();
    links.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => new URL(m[1])));
  } catch { /* fall back to links */ }
  const asset = /\.(css|js|mjs|png|jpe?g|gif|svg|ico|webp|woff2?|xml|json|txt|pdf|webmanifest)$/i;
  const pages = [new URL(start), ...links].filter((u) => !asset.test(u.pathname));
  return [...new Map(pages.map((u) => [u.origin + u.pathname, u])).values()].slice(0, 16);
}
export async function collectWeb({ outDir, sourcesFile = 'content/sources.json', fetcher = fetch } = {}) {
  const { sites } = JSON.parse(await readFile(sourcesFile, 'utf8'));
  let count = 0; const seenText = new Set();
  for (const start of sites) {
    try {
      const response = await fetcher(start); const html = await response.text();
      for (const url of await siteLinks(start, html, fetcher)) {
        try {
          const page = await fetcher(url); if (!/text\/html/i.test(page.headers?.get?.('content-type') ?? 'text/html')) continue;
          const pageHtml = await page.text(); const text = htmlToText(pageHtml); if (text.length < 200 || seenText.has(sha256(text))) continue; seenText.add(sha256(text));
          const host = new URL(url).host; const path = new URL(url).pathname.replace(/^\//, '') || 'home';
          await save(outDir, record(`web-${slug(host)}-${slug(path) || 'home'}`, 'web', url.href, text.slice(0, 100), text, { host })); count++;
        } catch { /* unreachable pages are skipped */ }
      }
    } catch { /* unreachable sites are skipped */ }
  }
  return count;
}
export async function collectManual({ outDir, manualDir = `${outDir}/manual` } = {}) {
  const { readdir } = await import('node:fs/promises'); let count = 0;
  for (const name of await readdir(manualDir).catch(() => [])) {
    if (!name.endsWith('.md')) continue;
    const raw = await readFile(`${manualDir}/${name}`, 'utf8');
    const kind = /^kind:\s*(notion|plaud|manual)\s*$/mi.exec(raw)?.[1] ?? 'manual';
    const text = raw.replace(/^---[\s\S]*?---\s*/m, '').trim();
    await save(outDir, record(`manual-${slug(name.replace(/\.md$/, ''))}`, kind, '', name.replace(/\.md$/, ''), text)); count++;
  }
  return count;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv[process.argv.indexOf('--only') + 1]; const outDir = 'scripts/chunks/.out';
  if (!only || only === 'github') await collectGithub({ outDir });
  if (!only || only === 'web') await collectWeb({ outDir });
  if (!only || only === 'manual') await collectManual({ outDir });
}
