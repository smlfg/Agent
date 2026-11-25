import { readFileSync } from 'node:fs';
import {
  assertAtMostOneWorkerCall,
  buildSystemPrompt,
  buildTurnInput,
} from '../voice/build-prompt.js';

// Entwurf, durch ENTSCHEIDUNGEN-RAG überholt.
const DEFAULT_KNOWLEDGE_URL = new URL('../../tests/fixtures/knowledge.legacy.json', import.meta.url);

const DEFAULT_SITE = 'Agentfähig';
const DEFAULT_ABOUT = [
  'Agentfähig is a Human-Agent Interface where the website itself is experienced as an agent.',
  'Rather than a document with a separate chatbot alongside it, the page is an interface that visitors interact with directly by text or optionally by voice.',
].join(' ');

const NOT_COVERED_SENTINEL = 'NOT_COVERED';
const HONEST_UNCOVERED_REPLY = 'That detail is not covered here.';
const WORKER_ERROR_REPLY = 'That detail is not available right now.';

const URL_RE = /\bhttps?:\/\/[^\s)>\]"']+/i;

const FORBIDDEN_PREAMBLE_RES = [
  /^(?:great question|that's a great question|good question)\s*[!.,:\-—]*\s*/i,
  /^(?:i['’]d be happy to|i would be happy to)(?:\s+(?:help|explain|answer|share)(?:\s+(?:with\s+)?that)?)?\s*[!.,:\-—]*\s*/i,
  /^(?:certainly|of course|sure|absolutely)\s*[!.,:\-—]+\s*/i,
  /^(?:as an ai(?:\s+(?:language\s+)?model)?|let me know if[^.!?\n]*|feel free to[^.!?\n]*|i hope this helps)\s*[!.,:\-—]*\s*/i,
];

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'do', 'does',
  'for', 'from', 'have', 'here', 'how', 'i', 'in', 'into', 'is', 'it', 'its',
  'me', 'more', 'my', 'of', 'on', 'or', 'our', 'please', 'tell', 'that', 'the',
  'their', 'them', 'there', 'these', 'they', 'this', 'to', 'us', 'was', 'we',
  'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would', 'you',
  'your', 'aber', 'als', 'am', 'an', 'auch', 'auf', 'aus', 'bei', 'bin', 'bis',
  'da', 'damit', 'dann', 'das', 'dass', 'dein', 'dem', 'den', 'der', 'des',
  'dich', 'die', 'dies', 'dir', 'doch', 'du', 'ein', 'eine', 'einem', 'einen',
  'einer', 'er', 'es', 'euch', 'fuer', 'für', 'hat', 'hier', 'ich', 'ihr',
  'im', 'in', 'ist', 'ja', 'kann', 'man', 'mein', 'mich', 'mir', 'mit', 'nach',
  'nicht', 'noch', 'nun', 'oder', 'ohne', 'sehr', 'sein', 'sich', 'sie', 'sind',
  'so', 'ueber', 'über', 'um', 'und', 'uns', 'von', 'vor', 'wann', 'war', 'was',
  'wer', 'wie', 'wir', 'wird', 'wo', 'zu', 'zum', 'zur',
]);

const UNAVAILABLE_ATTRIBUTE_TOKENS = new Set([
  'price', 'prices', 'pricing', 'cost', 'costs', 'fee', 'fees', 'quote', 'budget',
  'eur', 'euro', 'usd', 'dollar', 'kosten', 'preis', 'preise',
  'phone', 'telephone', 'mobile', 'cell', 'call', 'telefon', 'telefonnummer', 'nummer',
  'email', 'mail', 'address', 'street', 'adresse', 'kontakt',
  'timeline', 'timelines', 'deadline', 'deadlines', 'eta', 'schedule', 'availability',
  'lieferzeit', 'termin', 'termine', 'verfuegbarkeit',
]);

const SITE_NAME_EXEMPTIONS = new Set([
  'agentfaehig',
  'agentfähig',
  'human-agent interface',
  'human agent interface',
]);

export const DEFAULT_THRESHOLDS = Object.freeze({
  pTopMin: 0.55,
  pMarginMin: 0.15,
  hasDirectionMin: 0.5,
  wantsDepthMin: 0.5,
  stickyCardMin: 0.45,
});

function assertProbability(value, fieldName) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${fieldName} must be a finite number between 0 and 1`);
  }
  return value;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadDefaultKnowledge() {
  return JSON.parse(readFileSync(DEFAULT_KNOWLEDGE_URL, 'utf8'));
}

function normalizeCandidateList(scores) {
  if (Array.isArray(scores)) {
    return scores.map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error(`scores[${index}] must be an object { id, label, p }`);
      }
      const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : '';
      if (!id) {
        throw new Error(`scores[${index}].id must be a non-empty string`);
      }
      const label = typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : id;
      const p = assertProbability(entry.p, `scores[${index}].p`);
      return { id, label, p };
    });
  }

  if (scores && typeof scores === 'object') {
    return Object.entries(scores).map(([rawId, rawValue]) => {
      const id = String(rawId).trim();
      if (!id) {
        throw new Error('scores keys must be non-empty waypoint ids');
      }
      if (typeof rawValue === 'number') {
        const p = assertProbability(rawValue, `scores.${id}`);
        return { id, label: id, p };
      }
      if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
        const p = assertProbability(rawValue.p, `scores.${id}.p`);
        const label = typeof rawValue.label === 'string' && rawValue.label.trim()
          ? rawValue.label.trim()
          : id;
        return { id, label, p };
      }
      throw new Error(`scores.${id} must be a probability 0..1 or { label, p }`);
    });
  }

  throw new Error('scores must be an object map or an array of candidates');
}

/**
 * Evaluate classifier probabilities into a deterministic DECISION object.
 * Thresholds live in application code (never inside the LLM prompt).
 */
export function evaluateDecision(
  {
    has_direction = 0,
    scores = {},
    card_on_screen = null,
    wants_depth = 0,
  } = {},
  thresholds = DEFAULT_THRESHOLDS,
) {
  const hasDirection = assertProbability(has_direction, 'has_direction');
  const wantsDepth = assertProbability(wants_depth, 'wants_depth');
  const cfg = {
    ...DEFAULT_THRESHOLDS,
    ...(thresholds && typeof thresholds === 'object' ? thresholds : {}),
  };

  const ranked = normalizeCandidateList(scores).sort((a, b) => {
    if (b.p !== a.p) return b.p - a.p;
    return a.id.localeCompare(b.id);
  });

  const top = ranked[0] ?? null;
  const second = ranked[1] ?? null;
  const pTop = top ? top.p : 0;
  const pSecond = second ? second.p : 0;

  const primaryMatch = top !== null
    && pTop >= cfg.pTopMin
    && (pTop - pSecond) >= cfg.pMarginMin;

  const stickyId = typeof card_on_screen === 'string' && card_on_screen.trim()
    ? card_on_screen.trim()
    : null;
  const stickyCandidate = stickyId ? ranked.find((entry) => entry.id === stickyId) ?? null : null;
  const stickyMatch = stickyCandidate !== null && stickyCandidate.p >= cfg.stickyCardMin;

  let waypoint = null;
  if (hasDirection >= cfg.hasDirectionMin) {
    if (primaryMatch) {
      waypoint = top;
    } else if (stickyMatch) {
      waypoint = stickyCandidate;
    }
  }

  let runnerUp = null;
  if (waypoint && top && waypoint.id !== top.id) {
    runnerUp = top;
  } else {
    runnerUp = second;
  }

  const callWorker = waypoint !== null && wantsDepth >= cfg.wantsDepthMin;
  const threads = hasDirection < cfg.hasDirectionMin ? ranked.slice(0, 2) : [];

  return {
    has_direction: hasDirection,
    wants_depth: wantsDepth,
    waypoint,
    runner_up: runnerUp,
    call_worker: callWorker,
    threads,
    card_on_screen: waypoint ? waypoint.id : null,
  };
}

function extractVerbatimLink(facts) {
  for (const fact of facts) {
    const match = URL_RE.exec(fact);
    if (match) return match[0];
  }
  return null;
}

function cleanFacts(items) {
  return items
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}

const HAI_SHARED_HINTS = [
  'humanagent',
  'humanagent interface',
  'human agent interface',
  'human-agent interface',
  'hai',
  'was ist hai',
  'was ist humanagent interface',
  'agentfaehig',
  'agentfähig',
];

const PROJECT_EXTRA_HINTS = {
  hai: HAI_SHARED_HINTS,
  agentfaehig: HAI_SHARED_HINTS,
};

/**
 * Build a deterministic waypoint lookup catalog from knowledge.json.
 * Includes offerings, projects_public, and core waypoints what-this-is & creator.
 */
export function buildWaypointCatalog(knowledge = loadDefaultKnowledge()) {
  if (!knowledge || typeof knowledge !== 'object') {
    throw new Error('knowledge must be an object');
  }

  const catalog = new Map();

  const addEntry = ({ id, label, facts, matchHints = [] }) => {
    const cleanId = String(id).trim();
    const cleanLabel = String(label || cleanId).trim();
    const normalizedFacts = cleanFacts(facts);
    catalog.set(cleanId, {
      id: cleanId,
      label: cleanLabel,
      facts: normalizedFacts,
      link: extractVerbatimLink(normalizedFacts),
      matchHints: cleanFacts(matchHints),
    });
  };

  // Core waypoint: what-this-is (from approach + non-unapproved FAQ entries + HAI summary)
  const approachFacts = (Array.isArray(knowledge.approach) ? knowledge.approach : [])
    .map((item) => item?.point);
  const projectsPublic = Array.isArray(knowledge.projects_public) ? knowledge.projects_public : [];
  const haiProject = projectsPublic.find((project) => project?.id === 'hai');
  const faqEntries = Array.isArray(knowledge.faq) ? knowledge.faq : [];
  const whatFacts = [];
  const whatHints = [];
  if (haiProject?.what) {
    whatFacts.push(`${haiProject.title || 'Human Agent Interface (HAI)'}: ${haiProject.what}`);
  }
  for (const entry of faqEntries) {
    if (!entry || typeof entry.a !== 'string') continue;
    // Do not treat null pricing/contact stances as covered factual pricing/contact claims.
    const qLower = String(entry.q || '').toLowerCase();
    if (knowledge.pricing?.stance == null && /\b(cost|price|pricing|kosten|preis)\b/.test(qLower)) {
      continue;
    }
    if (knowledge.contact?.method == null && /\b(contact|reach|email|phone|kontakt)\b/.test(qLower)) {
      continue;
    }
    whatFacts.push(entry.a);
    if (typeof entry.q === 'string' && entry.q.trim()) {
      whatHints.push(entry.q);
    }
  }
  whatFacts.push(...approachFacts);
  addEntry({
    id: 'what-this-is',
    label: 'What this is',
    facts: whatFacts,
    matchHints: ['what is this', 'how does it work', 'approach', ...HAI_SHARED_HINTS, ...whatHints],
  });

  // Core waypoint: creator (from owner + approved contact)
  const owner = knowledge.owner && typeof knowledge.owner === 'object' ? knowledge.owner : {};
  const creatorFacts = [];
  if (owner.name && owner.role) {
    creatorFacts.push(`${owner.name}: ${owner.role}.`);
  } else if (owner.name) {
    creatorFacts.push(`${owner.name}.`);
  }
  if (owner.one_liner) {
    creatorFacts.push(owner.one_liner);
  }
  if (knowledge.contact?.approved && knowledge.contact?.text) {
    creatorFacts.push(knowledge.contact.text);
  }
  addEntry({
    id: 'creator',
    label: 'Creator',
    facts: creatorFacts,
    matchHints: ['creator', 'who built this', 'who made this', 'author', 'founder'],
  });

  // Offerings
  for (const offering of Array.isArray(knowledge.offerings) ? knowledge.offerings : []) {
    if (!offering?.id) continue;
    addEntry({
      id: offering.id,
      label: offering.title || offering.id,
      facts: [offering.what, offering.for_whom, offering.example, offering.link],
      matchHints: [offering.title, offering.id],
    });
  }

  // Public projects
  for (const project of projectsPublic) {
    if (!project?.id) continue;
    const statusLine = project.status ? `Status: ${project.status}.` : null;
    const extraHints = PROJECT_EXTRA_HINTS[project.id] || [];
    addEntry({
      id: project.id,
      label: project.title || project.id,
      facts: [project.what, statusLine, project.link],
      matchHints: [project.title, project.id, ...extraHints],
    });
  }

  return catalog;
}

function resolveCatalogMap(catalog, knowledge) {
  if (catalog instanceof Map) return catalog;
  if (catalog && typeof catalog === 'object') {
    const map = new Map();
    for (const [id, entry] of Object.entries(catalog)) {
      if (entry && typeof entry === 'object') {
        const facts = cleanFacts(Array.isArray(entry.facts) ? entry.facts : []);
        map.set(id, {
          id: entry.id || id,
          label: entry.label || id,
          facts,
          link: entry.link ?? extractVerbatimLink(facts),
          matchHints: cleanFacts(Array.isArray(entry.matchHints) ? entry.matchHints : []),
        });
      }
    }
    return map;
  }
  return buildWaypointCatalog(knowledge);
}

function stemToken(token) {
  if (token === 'built') return 'build';
  if (token === 'made') return 'make';
  if (token.length > 4 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

function tokenize(text) {
  const matches = String(text || '')
    .toLowerCase()
    .normalize('NFKC')
    .match(/[\p{L}\p{N}]+/gu);
  if (!matches) return [];
  return matches
    .filter((tok) => !STOPWORDS.has(tok) && tok.length > 1)
    .map(stemToken);
}

function splitSentences(text) {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatWorkerAnswer(text, facts) {
  let clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean || clean === NOT_COVERED_SENTINEL) {
    return { answer: NOT_COVERED_SENTINEL, link: null };
  }
  // Remove question marks and exclamation marks per Worker rules 1 & 5
  clean = clean.replace(/[?!]+/g, '.').replace(/\.{2,}/g, '.').trim();
  const sentences = splitSentences(clean).slice(0, 3);
  if (sentences.length === 0) {
    return { answer: NOT_COVERED_SENTINEL, link: null };
  }
  const answer = sentences
    .map((s) => (/[.]$/.test(s) ? s : `${s}.`))
    .join(' ');
  const verbatimLink = extractVerbatimLink(facts);
  return {
    answer,
    link: verbatimLink,
  };
}

/**
 * Resolve a single narrow question against one strictly validated waypoint.
 * Throws when waypoint_id is unknown or missing (no fallback).
 */
export function askWorker(
  { waypoint_id, question } = {},
  { knowledge, catalog, matcher } = {},
) {
  const resolvedCatalog = resolveCatalogMap(catalog, knowledge);
  const id = typeof waypoint_id === 'string' ? waypoint_id.trim() : '';

  if (!id || !resolvedCatalog.has(id)) {
    throw new Error(`Unknown waypoint_id: ${String(waypoint_id)}`);
  }
  if (typeof question !== 'string' || question.trim().length === 0) {
    throw new Error('question must be a non-empty string');
  }

  const entry = resolvedCatalog.get(id);
  const cleanQuestion = question.trim();

  if (typeof matcher === 'function') {
    const custom = matcher({ entry, question: cleanQuestion, waypoint_id: id });
    if (custom == null || custom === NOT_COVERED_SENTINEL) {
      return { answer: NOT_COVERED_SENTINEL, link: null };
    }
    if (typeof custom === 'string') {
      return formatWorkerAnswer(custom, entry.facts);
    }
    if (typeof custom === 'object') {
      if (custom.answer === NOT_COVERED_SENTINEL || !custom.answer) {
        return { answer: NOT_COVERED_SENTINEL, link: null };
      }
      const formatted = formatWorkerAnswer(custom.answer, entry.facts);
      const requestedLink = typeof custom.link === 'string' ? custom.link.trim() : null;
      const verifiedLink = requestedLink && entry.facts.some((fact) => fact.includes(requestedLink))
        ? requestedLink
        : formatted.link;
      return { answer: formatted.answer, link: verifiedLink };
    }
    return { answer: NOT_COVERED_SENTINEL, link: null };
  }

  if (entry.facts.length === 0) {
    return { answer: NOT_COVERED_SENTINEL, link: null };
  }

  const rawTokens = (cleanQuestion.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
  const factsJoinedLower = entry.facts.join(' ').toLowerCase();

  // Reject unapproved/unavailable attribute requests (pricing, phone, email, address, timelines)
  // or specific years not appearing in facts.
  for (const rawTok of rawTokens) {
    if (UNAVAILABLE_ATTRIBUTE_TOKENS.has(rawTok) && !factsJoinedLower.includes(rawTok)) {
      return { answer: NOT_COVERED_SENTINEL, link: null };
    }
    if (/^(?:19|20)\d{2}$/.test(rawTok) && !factsJoinedLower.includes(rawTok)) {
      return { answer: NOT_COVERED_SENTINEL, link: null };
    }
  }

  const qTokens = tokenize(cleanQuestion);
  const scoredFacts = entry.facts.map((fact, index) => {
    const hints = Array.isArray(entry.matchHints) ? entry.matchHints : [];
    const hintText = index === 0 && hints.length
      ? `${fact} ${entry.label || entry.id} ${hints.join(' ')}`
      : (index === 0 ? `${fact} ${entry.label || entry.id}` : fact);
    const factTokens = new Set(tokenize(hintText));
    let overlap = 0;
    for (const tok of qTokens) {
      if (factTokens.has(tok)) overlap += 1;
    }
    return { fact, overlap, index };
  });

  scoredFacts.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return a.index - b.index;
  });

  const bestOverlap = scoredFacts[0]?.overlap ?? 0;
  if (bestOverlap === 0) {
    return { answer: NOT_COVERED_SENTINEL, link: null };
  }

  const selected = scoredFacts
    .filter((item) => item.overlap > 0)
    .slice(0, 2)
    .map((item) => item.fact);

  return formatWorkerAnswer(selected.join(' '), selected);
}

function isExemptTopicTerm(term) {
  return SITE_NAME_EXEMPTIONS.has(term.toLowerCase());
}

function hasTopicLeak(text, catalog) {
  if (!catalog || catalog.size === 0) return false;
  const lower = text.toLowerCase();

  for (const entry of catalog.values()) {
    const candidates = [entry.id, entry.label];
    for (const candidate of candidates) {
      if (typeof candidate !== 'string') continue;
      const trimmed = candidate.trim();
      if (!trimmed || isExemptTopicTerm(trimmed)) continue;

      const pattern = new RegExp(`(?<![\\p{L}\\p{N}-])${escapeRegExp(trimmed.toLowerCase())}(?![\\p{L}\\p{N}-])`, 'u');
      if (pattern.test(lower)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Enforce orchestrator output rules on a candidate reply:
 * - Rule 2: when decision.waypoint is null, never leak catalog waypoint names/ids
 *   (outside the site name "Agentfähig" / "Human-Agent Interface").
 * - Rule 5: never end a turn with a question mark ("?").
 * - Rule 7: strip exclamation marks ("!") and forbidden preamble phrases.
 */
export function sanitizeOrchestratorReply(
  text,
  { decision = null, catalog, about = DEFAULT_ABOUT } = {},
) {
  let clean = typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';

  if (!clean || clean === NOT_COVERED_SENTINEL || /\bNOT_COVERED\b/.test(clean)) {
    return HONEST_UNCOVERED_REPLY;
  }

  // Rule 7: strip forbidden preamble phrases (iteratively in case two stack)
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of FORBIDDEN_PREAMBLE_RES) {
      const next = clean.replace(re, '').trim();
      if (next !== clean) {
        clean = next;
        changed = true;
      }
    }
  }

  // Rule 7 & Rule 5: remove exclamation marks and question marks
  clean = clean
    .replace(/[!]+/g, '.')
    .replace(/\?+/g, '.')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+([.,])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || clean === '.') {
    clean = HONEST_UNCOVERED_REPLY;
  }

  // Rule 2: topic non-leakage when no waypoint is selected
  if (!decision?.waypoint) {
    const resolvedCatalog = catalog ? resolveCatalogMap(catalog) : buildWaypointCatalog();
    if (hasTopicLeak(clean, resolvedCatalog)) {
      const safeAbout = typeof about === 'string' && about.trim() ? about.trim() : '';
      const aboutFirst = splitSentences(safeAbout)[0];
      if (aboutFirst && !hasTopicLeak(aboutFirst, resolvedCatalog)) {
        clean = aboutFirst
          .replace(/[!?]+/g, '.')
          .replace(/\.{2,}/g, '.')
          .trim();
      } else {
        clean = HONEST_UNCOVERED_REPLY;
      }
    }
  }

  if (!/[.]$/.test(clean)) {
    clean = `${clean}.`;
  }

  return clean;
}

function synthesizeFromAbout(about) {
  const sentences = splitSentences(about).slice(0, 2);
  return sentences.join(' ') || DEFAULT_ABOUT;
}

function synthesizeFromWorker(workerResult) {
  const sentences = splitSentences(workerResult.answer).slice(0, 2);
  return sentences.join(' ') || HONEST_UNCOVERED_REPLY;
}

/**
 * Execute one complete Orchestrator turn:
 * 1. Builds system prompt and per-turn DECISION/HISTORY/VISITOR_MESSAGE input.
 * 2. Invokes ask_worker at most once when decision.waypoint is set and call_worker !== false.
 * 3. Handles NOT_COVERED and worker errors/timeouts calmly in 1 sentence without retrying.
 * 4. Calls optional modelFn or synthesizes a concise 1-2 sentence reply, then sanitizes output.
 */
export async function runOrchestratorTurn({
  visitorMessage,
  history = '',
  decision = { has_direction: 0, waypoint: null, runner_up: null, call_worker: false },
  knowledge,
  catalog,
  site = DEFAULT_SITE,
  about = DEFAULT_ABOUT,
  workerFn,
  modelFn,
} = {}) {
  if (typeof visitorMessage !== 'string' || visitorMessage.trim().length === 0) {
    throw new Error('visitorMessage must be a non-empty string');
  }

  const resolvedKnowledge = knowledge ?? loadDefaultKnowledge();
  const resolvedCatalog = resolveCatalogMap(catalog, resolvedKnowledge);
  const resolvedDecision = {
    has_direction: typeof decision?.has_direction === 'number'
      ? decision.has_direction
      : (decision?.waypoint ? 1 : 0),
    waypoint: decision?.waypoint ?? null,
    runner_up: decision?.runner_up ?? null,
    call_worker: decision?.call_worker ?? Boolean(decision?.waypoint),
    threads: Array.isArray(decision?.threads) ? decision.threads : [],
    card_on_screen: decision?.card_on_screen ?? (decision?.waypoint ? decision.waypoint.id : null),
  };

  const systemPrompt = buildSystemPrompt({ site, about });
  const turnInput = buildTurnInput({
    decision: {
      has_direction: resolvedDecision.has_direction,
      waypoint: resolvedDecision.waypoint,
      runner_up: resolvedDecision.runner_up,
    },
    history,
    visitorMessage,
  });

  const baseWorker = typeof workerFn === 'function'
    ? workerFn
    : ({ waypoint_id, question }) => askWorker(
      { waypoint_id, question },
      { knowledge: resolvedKnowledge, catalog: resolvedCatalog },
    );
  const guardedWorker = assertAtMostOneWorkerCall(baseWorker);

  const shouldCallWorker = Boolean(resolvedDecision.waypoint)
    && resolvedDecision.call_worker !== false;

  let workerResult = null;
  let workerError = null;

  if (shouldCallWorker) {
    try {
      const raw = await guardedWorker({
        waypoint_id: resolvedDecision.waypoint.id,
        question: visitorMessage.trim(),
      });
      if (typeof raw === 'string') {
        workerResult = { answer: raw.trim() || NOT_COVERED_SENTINEL, link: null };
      } else if (raw && typeof raw === 'object') {
        const answer = typeof raw.answer === 'string' && raw.answer.trim()
          ? raw.answer.trim()
          : NOT_COVERED_SENTINEL;
        const link = typeof raw.link === 'string' && raw.link.trim() ? raw.link.trim() : null;
        workerResult = { answer, link };
      } else {
        workerResult = { answer: NOT_COVERED_SENTINEL, link: null };
      }
    } catch (err) {
      workerError = err;
      workerResult = { answer: NOT_COVERED_SENTINEL, link: null };
    }
  }

  let draftReply;
  if (workerError) {
    draftReply = WORKER_ERROR_REPLY;
  } else if (workerResult && workerResult.answer === NOT_COVERED_SENTINEL) {
    draftReply = HONEST_UNCOVERED_REPLY;
  } else if (typeof modelFn === 'function') {
    draftReply = await modelFn({
      systemPrompt,
      turnInput,
      decision: resolvedDecision,
      workerResult,
      visitorMessage: visitorMessage.trim(),
      history,
      site,
      about,
    });
  } else if (workerResult) {
    draftReply = synthesizeFromWorker(workerResult);
  } else {
    draftReply = synthesizeFromAbout(about);
  }

  const text = sanitizeOrchestratorReply(draftReply, {
    decision: resolvedDecision,
    catalog: resolvedCatalog,
    about,
  });

  return {
    text,
    decision: resolvedDecision,
    workerCalled: guardedWorker.getCallCount() > 0,
    workerCallCount: guardedWorker.getCallCount(),
    workerResult,
    link: workerResult && workerResult.answer !== NOT_COVERED_SENTINEL ? workerResult.link : null,
    cardOnScreen: resolvedDecision.card_on_screen,
    threads: resolvedDecision.threads,
    systemPrompt,
    turnInput,
  };
}
