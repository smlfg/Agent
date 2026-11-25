import MiniSearch from './vendor/minisearch/index.js';
import chunksDocument from './knowledge/chunks.json' with { type: 'json' };
import embeddingsDocument from './knowledge/embeddings.json' with { type: 'json' };
import coverageConfig from './knowledge/coverage.json' with { type: 'json' };

const chunks = Array.isArray(chunksDocument?.chunks) ? chunksDocument.chunks : [];
const byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));
const vectors = embeddingsDocument?.vectors || {};
const RRF_K = 60;

export function normalizeTerm(value) {
  return String(value ?? '').toLocaleLowerCase('de-DE')
    .replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

function processTerm(term) { return normalizeTerm(term).replace(/\s+/g, ''); }

const index = new MiniSearch({
  fields: ['title', 'aliases', 'topics', 'text'],
  storeFields: ['title', 'text', 'link'],
  searchOptions: { boost: { title: 3, aliases: 3, topics: 1.5, text: 1 }, fuzzy: 0.2, prefix: true },
  processTerm,
});
index.addAll(chunks);

const businessWords = /\b(preis|preise|kostet|kosten|angebot|angebote|termin|buchen|buchung|zusammenarbeit|beauftragen|hire|price|prices|cost|costs|quote|book|booking|collaborat|commission|contact)\b/i;

function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || !a.length) return -1;
  let dot = 0; let aa = 0; let bb = 0;
  for (let i = 0; i < a.length; i += 1) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; }
  return aa && bb ? dot / Math.sqrt(aa * bb) : -1;
}

function aliasHits(query) {
  const normalized = ` ${normalizeTerm(query)} `;
  return chunks.filter((chunk) => [chunk.title, ...(chunk.aliases || [])].some((alias) => {
    const value = normalizeTerm(alias);
    return value.length >= 3 && normalized.includes(` ${value} `);
  }));
}

function bm25List(query) { return index.search(query).map((result) => ({ id: result.id, score: Number(result.score) || 0 })); }
function semanticList(vector) {
  if (!Array.isArray(vector)) return [];
  return chunks.map((chunk) => ({ id: chunk.id, score: cosine(vector, vectors[chunk.id]?.v) }))
    .filter((result) => result.score >= 0).sort((a, b) => b.score - a.score);
}

// Regel (kalibriert per scripts/calibrate-coverage.mjs): Alias-Treffer oder Cosinus über Schwelle.
export function coverageFrom(features, params = coverageConfig?.params || {}) {
  if (features.aliasHit) return 'GIVEN';
  return features.cosTop >= (params.cosThreshold ?? 0.6) ? 'GIVEN' : 'NOT_COVERED';
}

export async function search({
  query,
  history = [],
  lastSourceIds = [],
  embedQuery = null,
  onEvent = null,
  turnId = 'turn-0',
  now = () => Date.now(),
} = {}) {
  const emit = (partial) => {
    if (typeof onEvent === 'function') {
      try {
        onEvent(partial);
      } catch {
        /* observer must not break retrieval */
      }
    }
  };

  const retrievalStartedAt = now();
  emit({
    turn_id: turnId,
    action_id: 'retrieval-001',
    type: 'retrieval.started',
    status: 'started',
    metadata: {
      has_history: Array.isArray(history) && history.length > 0,
      anchor_sources: Array.isArray(lastSourceIds) ? Math.min(lastSourceIds.length, 5) : 0,
    },
  });

  try {
    // Zitat-Marker aus der Nutzereingabe entfernen: sie dürfen keine Treffer erzwingen.
    const stripMarkers = (value) => String(value ?? '').replace(/\[\[[^\]]*\]\]/g, ' ').replace(/\s+/g, ' ').trim();
    const text = stripMarkers(query);
    const lastQuestion = stripMarkers([...history].reverse().find((turn) => turn?.role === 'user')?.content);
    const queries = [text];
    if (lastQuestion && lastQuestion !== text) queries.push(`${text} ${lastQuestion}`);
    const firstBm25 = bm25List(text);
    const secondBm25 = queries[1] ? bm25List(queries[1]) : [];
    let vector = null;
    if (typeof embedQuery === 'function') {
      const embStartedAt = now();
      emit({
        turn_id: turnId,
        action_id: 'embedding-001',
        type: 'embedding.started',
        status: 'started',
        metadata: { model: '@cf/baai/bge-m3' },
      });
      try {
        vector = await embedQuery(text);
        if (Array.isArray(vector) && vector.length > 0) {
          emit({
            turn_id: turnId,
            action_id: 'embedding-001',
            type: 'embedding.completed',
            status: 'success',
            duration_ms: Math.max(0, Math.round(now() - embStartedAt)),
            metadata: { dims: vector.length },
          });
        } else {
          vector = null;
          emit({
            turn_id: turnId,
            action_id: 'embedding-001',
            type: 'embedding.completed',
            status: 'empty',
            duration_ms: Math.max(0, Math.round(now() - embStartedAt)),
            metadata: { dims: 0 },
          });
        }
      } catch (err) {
        vector = null;
        const isTimeout = err?.name === 'TimeoutError' || /timed?\s*out/i.test(String(err?.message ?? ''));
        emit({
          turn_id: turnId,
          action_id: 'embedding-001',
          type: isTimeout ? 'embedding.timeout' : 'embedding.failed',
          status: isTimeout ? 'timeout' : 'error',
          duration_ms: Math.max(0, Math.round(now() - embStartedAt)),
          metadata: { fallback: 'bm25', reason: isTimeout ? 'timeout' : (err?.name || 'error') },
        });
      }
    }
    const semantic = semanticList(vector);
    const scores = new Map();
    const addRrf = (list) => list.forEach((hit, rank) => scores.set(hit.id, (scores.get(hit.id) || 0) + 1 / (RRF_K + rank + 1)));
    addRrf(firstBm25); addRrf(secondBm25); addRrf(semantic);
    for (const id of (Array.isArray(lastSourceIds) ? lastSourceIds : [])) if (byId.has(id)) scores.set(id, (scores.get(id) || 0) + 0.01);
    const aliases = aliasHits(text);
    for (const chunk of aliases) scores.set(chunk.id, (scores.get(chunk.id) || 0) + 0.05);
    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    const features = {
      aliasHit: aliases.length > 0,
      cosTop: Math.max(0, semantic[0]?.score ?? 0),
      bm25Top: firstBm25[0]?.score || 0,
      rrfTop: ranked[0] ? Math.min(1, ranked[0][1] / (1 / (RRF_K + 1) * 3)) : 0,
      gap: ranked.length > 1 ? Math.min(1, Math.max(0, ranked[0][1] - ranked[1][1]) * 100) : 1,
    };
    const hits = ranked.slice(0, 5).map(([id, score]) => {
      const chunk = byId.get(id);
      return { id, title: chunk.title, text: chunk.text, link: chunk.link ?? null, score: Number(score.toFixed(6)) };
    });
    const coverage = coverageFrom(features);
    const business = businessWords.test(text);
    const relevantHits = coverage === 'GIVEN' ? hits.length : 0;
    emit({
      turn_id: turnId,
      action_id: 'retrieval-001',
      type: 'retrieval.completed',
      status: coverage === 'GIVEN' ? 'success' : 'empty',
      duration_ms: Math.max(0, Math.round(now() - retrievalStartedAt)),
      metadata: {
        coverage,
        hits: relevantHits,
        candidate_hits: hits.length,
        multi_source: relevantHits >= 2,
        alias_hit: Boolean(features.aliasHit),
        top_score: Number(features.rrfTop.toFixed(4)),
        anchored: Array.isArray(lastSourceIds) && lastSourceIds.length > 0,
        business: Boolean(business),
      },
    });
    return { hits, coverage, business, features };
  } catch (err) {
    emit({
      turn_id: turnId,
      action_id: 'retrieval-001',
      type: 'retrieval.failed',
      status: 'error',
      duration_ms: Math.max(0, Math.round(now() - retrievalStartedAt)),
      metadata: { reason: err?.name || 'error' },
    });
    throw err;
  }
}

export { chunks };
