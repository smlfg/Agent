// Plain-text linkifier for conversation answers.
// Builds DOM nodes directly (createTextNode / createElement) without innerHTML.

const LINK_CANDIDATE_RE =
  /(https?:\/\/[^\s<>"']+|mailto:[^\s<>"']+|www\.[^\s<>"']+)|(^|[\s(])(\/(?:impressum|datenschutz|classic)(?:\/[^\s<>"']*)?(?![\p{L}\p{N}_-]))/gu;

const TRAILING_PUNCT = new Set(['.', ',', ';', ':', '!', '?', "'", '"', '”', '’', '»']);
const BRACKET_PAIRS = new Map([
  [')', '('],
  [']', '['],
  ['}', '{'],
]);
const MAILTO_ADDR_RE = /^[^\s@<>]+@[^\s@.<>]+(?:\.[^\s@.<>]+)+$/;

function countChar(str, ch) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ch) count += 1;
  }
  return count;
}

function stripTrailing(candidate) {
  let raw = candidate;
  while (raw.length > 0) {
    const last = raw.at(-1);
    if (TRAILING_PUNCT.has(last)) {
      raw = raw.slice(0, -1);
      continue;
    }
    const open = BRACKET_PAIRS.get(last);
    if (open && countChar(raw, last) > countChar(raw, open)) {
      raw = raw.slice(0, -1);
      continue;
    }
    break;
  }
  return {
    label: raw,
    trailing: candidate.slice(raw.length),
  };
}

function validateCandidate(label, kind) {
  if (!label) return null;

  if (kind === 'path') {
    if (label.startsWith('//')) return null;
    return { type: 'link', label, href: label, external: false };
  }

  const href = kind === 'www' ? `https://${label}` : label;
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }

  if (parsed.protocol === 'https:') {
    if (!parsed.hostname) return null;
    if (kind === 'www') {
      const parts = parsed.hostname.split('.');
      if (parts.length < 2 || parts.some((part) => !part)) return null;
    }
    return { type: 'link', label, href, external: true };
  }

  if (parsed.protocol === 'mailto:') {
    const address = label.slice('mailto:'.length).split('?')[0];
    if (!MAILTO_ADDR_RE.test(address)) return null;
    return { type: 'link', label, href, external: false };
  }

  return null;
}

function pushText(tokens, value) {
  if (!value) return;
  const last = tokens.at(-1);
  if (last && last.type === 'text') {
    last.value += value;
  } else {
    tokens.push({ type: 'text', value });
  }
}

export function tokenizeLinks(text) {
  const source = String(text ?? '');
  if (!source) return [];

  const tokens = [];
  let cursor = 0;

  LINK_CANDIDATE_RE.lastIndex = 0;
  let match;
  while ((match = LINK_CANDIDATE_RE.exec(source)) !== null) {
    const isPath = match[3] !== undefined;
    const prefix = isPath ? match[2] : '';
    const rawCandidate = isPath ? match[3] : match[1];
    const matchStart = match.index + prefix.length;

    if (match.index > cursor) {
      pushText(tokens, source.slice(cursor, match.index));
    }
    if (prefix) {
      pushText(tokens, prefix);
    }

    let kind = 'url';
    if (isPath) kind = 'path';
    else if (rawCandidate.startsWith('www.')) kind = 'www';
    else if (rawCandidate.startsWith('mailto:')) kind = 'mailto';

    // Avoid linking `www.` embedded inside an identifier, domain, email, or scheme.
    if (kind === 'www' && matchStart > 0 && /[\p{L}\p{N}.:/@-]/u.test(source[matchStart - 1])) {
      pushText(tokens, rawCandidate);
      cursor = matchStart + rawCandidate.length;
      continue;
    }

    const { label, trailing } = stripTrailing(rawCandidate);
    const linkToken = validateCandidate(label, kind);

    if (linkToken) {
      tokens.push(linkToken);
      pushText(tokens, trailing);
    } else {
      pushText(tokens, rawCandidate);
    }

    cursor = matchStart + rawCandidate.length;
  }

  if (cursor < source.length) {
    pushText(tokens, source.slice(cursor));
  }

  return tokens;
}

export function renderLinkedText(container, text) {
  const doc = container.ownerDocument ?? document;
  const tokens = tokenizeLinks(text);
  const nodes = tokens.map((tok) => {
    if (tok.type === 'text') {
      return doc.createTextNode(tok.value);
    }
    const anchor = doc.createElement('a');
    anchor.className = 'answer-link';
    anchor.href = tok.href;
    anchor.textContent = tok.label;
    if (tok.external) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    return anchor;
  });
  container.replaceChildren(...nodes);
}
