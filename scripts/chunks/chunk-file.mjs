import { createHash } from 'node:crypto';

const sha = (text) => createHash('sha256').update(text).digest('hex');

export function splitChunk(raw) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  return m ? { front: m[1].split('\n'), text: m[2].trim() } : { front: [], text: raw.trim() };
}

// Freigabe gilt für Frontmatter (ohne approved_hash/updated_at) + Text.
export function contentHash(raw) {
  const { front, text } = splitChunk(raw);
  const stable = front.filter((line) => !/^(approved_hash|updated_at):/.test(line)).join('\n');
  return `sha256:${sha(`${stable}\n---\n${text}`)}`;
}

export const approvedHash = (raw) =>
  /^approved_hash:\s*(\S+)\s*$/m.exec(splitChunk(raw).front.join('\n'))?.[1] ?? null;

export const isApproved = (raw) => approvedHash(raw) === contentHash(raw);

export const joinChunk = (front, text) => `---\n${front.join('\n')}\n---\n\n${text.trim()}\n`;
