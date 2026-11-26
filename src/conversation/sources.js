// Source chips under a finished answer (ADR-0007 point 5, decision Q15).
// The server sends {id, title, link}; both title and link are treated as
// untrusted data: titles go in through textContent, links only if http(s).

function safeHref(link) {
  if (typeof link !== 'string') return null;
  try {
    // No base URL on purpose: relative and protocol-relative links throw.
    const { protocol } = new URL(link);
    // The link is used verbatim (Q15), the parsed URL only validates it.
    return protocol === 'http:' || protocol === 'https:' ? link : null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw `sources` from the agent result
 * @returns {Array<{id: string, title: string, href: string|null}>}
 */
export function normalizeSources(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const items = [];
  for (const source of raw) {
    const id = String(source?.id ?? '');
    const title = typeof source?.title === 'string' ? source.title.trim() : '';
    if (!title || seen.has(id || title)) continue;
    seen.add(id || title);
    items.push({ id, title, href: safeHref(source.link) });
  }
  return items;
}

/**
 * @param {Document} doc
 * @param {unknown} raw
 * @returns {HTMLElement|null} null when there is nothing to show
 */
export function renderSources(doc, raw) {
  const items = normalizeSources(raw);
  if (!items.length) return null;

  const list = doc.createElement('ul');
  list.className = 'sources';
  list.setAttribute('aria-label', 'Sources');

  for (const { title, href } of items) {
    const chip = doc.createElement(href ? 'a' : 'span');
    chip.className = 'source-chip';
    chip.textContent = title;
    if (href) {
      chip.setAttribute('href', href);
      // A new tab keeps the conversation, which lives only in memory.
      chip.setAttribute('target', '_blank');
      chip.setAttribute('rel', 'noopener noreferrer');
    }
    const row = doc.createElement('li');
    row.append(chip);
    list.append(row);
  }
  return list;
}
