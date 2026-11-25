// Local pre-retrieval parity for dev / browser (ADR-0008). Lexical search over knowledge entries.

const STOP_WORDS = new Set([
  'wer', 'was', 'wie', 'ist', 'sind', 'der', 'die', 'das', 'und', 'ein', 'eine', 'einer', 'einem',
  'einen', 'den', 'dem', 'des', 'von', 'zu', 'zum', 'zur', 'mit', 'auf', 'fuer', 'für', 'im', 'in',
  'am', 'an', 'als', 'auch', 'noch', 'nur', 'oder', 'bei', 'nach', 'vor', 'über', 'ueber', 'mir',
  'mich', 'dein', 'deine', 'ihr', 'ihre', 'uns', 'euch', 'sich', 'dass', 'wenn', 'dann', 'schon',
  'mal', 'doch', 'sehr', 'mehr', 'viel', 'gibt', 'gib', 'sag', 'sage', 'erzaehl', 'erzaehle', 'erzähl',
  'bitte', 'hallo', 'hey', 'hello',
  'who', 'what', 'how', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for',
  'with', 'me', 'my', 'your', 'about', 'tell', 'please', 'can', 'could', 'would', 'do', 'does',
  'did', 'have', 'has', 'be', 'been', 'this', 'that', 'it', 'its', 'we', 'you', 'they', 'them',
]);

function normalizeText(input) {
  let s = String(input ?? '').toLowerCase();
  s = s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
  s = s.replace(/[^\p{L}\p{N}\s-]/gu, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function tokenize(text) {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function collectEntryText(entry) {
  const parts = [];
  if (entry.topic) parts.push(entry.topic);
  if (entry.title) parts.push(entry.title);
  if (Array.isArray(entry.keywords)) parts.push(...entry.keywords);
  if (Array.isArray(entry.facts)) parts.push(...entry.facts);
  if (typeof entry.facts === 'string') parts.push(entry.facts);
  return parts.join(' ');
}

function scoreEntry(queryTokens, queryNorm, entry, lastSourceIds) {
  let score = 0;
  const topicNorm = normalizeText(entry.topic ?? entry.title ?? '');
  const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
  const factText = Array.isArray(entry.facts) ? entry.facts.join(' ') : String(entry.facts ?? '');
  const factNorm = normalizeText(factText);
  const haystack = normalizeText(`${topicNorm} ${keywords.join(' ')} ${factNorm}`);

  for (const kw of keywords) {
    const kNorm = normalizeText(kw);
    if (!kNorm) continue;
    if (queryNorm.includes(kNorm) || kNorm.includes(queryNorm)) score += 1.5;
    for (const qt of queryTokens) {
      if (kNorm === qt || kNorm.startsWith(qt) || qt.startsWith(kNorm)) score += 0.6;
    }
  }

  if (topicNorm) {
    if (queryNorm.includes(topicNorm) || topicNorm.includes(queryNorm)) score += 1.2;
    for (const qt of queryTokens) {
      if (topicNorm.includes(qt) || qt.length >= 3 && topicNorm.startsWith(qt)) score += 0.5;
    }
  }

  for (const qt of queryTokens) {
    if (qt.length < 2) continue;
    const re = new RegExp(`\\b${qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (re.test(haystack)) score += 0.45;
    for (const word of haystack.split(/\s+/)) {
      if (word.startsWith(qt) && qt.length >= 3) score += 0.35;
    }
  }

  const id = String(entry.id ?? '');
  if (id && lastSourceIds.includes(id)) score += 0.25;

  return score;
}

function entriesFromDoc(knowledgeDoc) {
  if (Array.isArray(knowledgeDoc?.chunks)) return knowledgeDoc.chunks;
  if (Array.isArray(knowledgeDoc?.entries)) return knowledgeDoc.entries;
  return [];
}

/**
 * Deterministic lexical retrieval over local knowledge entries or chunks.
 * @param {string} query
 * @param {{ entries?: object[], chunks?: object[] }} knowledgeDoc
 * @param {{ history?: object[], lastSourceIds?: string[] }} [options]
 */
export function searchLocalKnowledge(query, knowledgeDoc, { history = [], lastSourceIds = [] } = {}) {
  void history;
  const entries = entriesFromDoc(knowledgeDoc);
  const queryNorm = normalizeText(query);
  const queryTokens = tokenize(query);

  const scored = entries.map((entry) => {
    const score = scoreEntry(queryTokens, queryNorm, entry, lastSourceIds);
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const relevantHits = scored.filter(({ score }) => score >= 1.0);
  const topScore = scored.length ? scored[0].score : 0;
  const coverage = relevantHits.length >= 1 ? 'GIVEN' : 'NOT_COVERED';

  const hits = coverage === 'GIVEN'
    ? relevantHits.map(({ entry, score }) => ({
        id: entry.id,
        title: entry.topic || entry.title || entry.id,
        link: entry.link ?? null,
        score,
      }))
    : [];

  return {
    coverage,
    hits,
    multiSource: relevantHits.length >= 2,
    topScore,
  };
}

let defaultKnowledgePromise = null;

export function loadDefaultKnowledge() {
  if (!defaultKnowledgePromise) {
    defaultKnowledgePromise = import('./knowledge.json', { assert: { type: 'json' } })
      .then((mod) => mod.default ?? mod)
      .catch(() => ({ entries: [] }));
  }
  return defaultKnowledgePromise;
}

function emitEvent(callback, partial) {
  if (typeof callback !== 'function') return;
  try {
    callback(partial);
  } catch {
    /* listener must not break retrieval */
  }
}

/**
 * @param {{ innerAgent: { respond: Function }, getKnowledge?: () => Promise<object>, now?: () => number }} config
 */
export function createLocalPreRetrievalAgent({ innerAgent, getKnowledge, now = () => Date.now() }) {
  const resolveKnowledge = typeof getKnowledge === 'function'
    ? getKnowledge
    : () => loadDefaultKnowledge();

  async function respond(prompt, opts = {}) {
    const { signal, onEvent } = opts;

    if (signal?.aborted) {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    }

    emitEvent(onEvent, {
      action_id: 'turn-001',
      type: 'turn.received',
      category: 'turn',
      status: 'running',
    });
    emitEvent(onEvent, {
      action_id: 'context-001',
      type: 'context.prepared',
      category: 'context',
      status: 'success',
    });

    const retrievalStartedAt = now();
    emitEvent(onEvent, {
      action_id: 'retrieval-local-001',
      type: 'retrieval.started',
      category: 'retrieval',
      status: 'started',
    });

    let coverage = 'NOT_COVERED';
    let hits = [];
    let topScore = 0;

    try {
      const doc = await resolveKnowledge();
      if (signal?.aborted) {
        const error = new Error('aborted');
        error.name = 'AbortError';
        throw error;
      }
      const result = searchLocalKnowledge(prompt, doc);
      coverage = result.coverage;
      hits = result.hits;
      topScore = result.topScore;

      emitEvent(onEvent, {
        action_id: 'retrieval-local-001',
        type: 'retrieval.completed',
        category: 'retrieval',
        status: coverage === 'GIVEN' ? 'success' : 'empty',
        duration_ms: Math.max(0, now() - retrievalStartedAt),
        metadata: {
          coverage,
          hits: hits.length,
          multi_source: hits.length >= 2,
          top_score: topScore,
          source: 'local-index',
        },
      });
    } catch (loadError) {
      if (signal?.aborted || loadError?.name === 'AbortError') throw loadError;
      emitEvent(onEvent, {
        action_id: 'retrieval-local-001',
        type: 'retrieval.failed',
        category: 'retrieval',
        status: 'error',
        duration_ms: Math.max(0, now() - retrievalStartedAt),
        metadata: {
          source: 'local-index',
          reason: String(loadError?.message ?? 'load_failed').slice(0, 120),
        },
      });
    }

    const res = await innerAgent.respond(prompt, opts);
    const sources = res?.sources?.length
      ? res.sources
      : hits.slice(0, 3).map(({ id, title, link }) => ({ id, title, link }));

    return {
      ...res,
      coverage: res?.coverage ?? coverage,
      sources,
    };
  }

  return { respond };
}