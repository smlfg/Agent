import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_TEMPLATE_PATH = fileURLToPath(
  new URL('./voice-prompt.md', import.meta.url),
);

const ROLE_HEADING_RE = /^# Role\b/m;
const SITE_PLACEHOLDER_RE = /<SITE>/g;
const ABOUT_PLACEHOLDER_RE = /<ABOUT:\s*[^>]+>/g;

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function assertProbability(value, fieldName) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${fieldName} must be a finite number between 0 and 1`);
  }
  return value;
}

function validateWaypoint(waypoint, fieldName) {
  if (waypoint === null || waypoint === undefined) {
    return null;
  }
  if (typeof waypoint !== 'object' || Array.isArray(waypoint)) {
    throw new Error(`${fieldName} must be an object { id, label, p } or null`);
  }
  const id = assertNonEmptyString(waypoint.id, `${fieldName}.id`);
  const label = assertNonEmptyString(waypoint.label, `${fieldName}.label`);
  const p = assertProbability(waypoint.p, `${fieldName}.p`);
  return { id, label, p };
}

function formatHistory(history) {
  if (history === null || history === undefined) {
    return '(none)';
  }
  if (typeof history === 'string') {
    const trimmed = history.trim();
    return trimmed.length > 0 ? trimmed : '(none)';
  }
  if (Array.isArray(history)) {
    if (history.length === 0) {
      return '(none)';
    }
    return history
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
          const role = typeof entry.role === 'string' && entry.role.trim()
            ? entry.role.trim()
            : `turn_${index + 1}`;
          const text = entry.text ?? entry.content ?? entry.message;
          if (typeof text === 'string') {
            return `${role}: ${text.trim()}`;
          }
        }
        throw new Error(`history[${index}] must be a string or { role, text } object`);
      })
      .filter(Boolean)
      .join('\n') || '(none)';
  }
  throw new Error('history must be a string, an array, or null/undefined');
}

function extractPromptBody(rawTemplate) {
  const normalized = rawTemplate.replace(/\r\n/g, '\n');
  const match = ROLE_HEADING_RE.exec(normalized);
  if (!match) {
    throw new Error('voice-prompt template must contain a "# Role" heading');
  }
  return normalized.slice(match.index).trim();
}

/**
 * Build the system prompt from the voice-prompt markdown template.
 * Strips any draft header or frontmatter preceding "# Role" and replaces
 * the <SITE> and <ABOUT: ...> placeholders.
 */
export function buildSystemPrompt({
  site,
  about,
  templatePath = DEFAULT_TEMPLATE_PATH,
} = {}) {
  const cleanSite = assertNonEmptyString(site, 'site');
  const cleanAbout = assertNonEmptyString(about, 'about');

  const rawTemplate = readFileSync(templatePath, 'utf8');
  let prompt = extractPromptBody(rawTemplate);

  if (!SITE_PLACEHOLDER_RE.test(prompt)) {
    throw new Error('voice-prompt template is missing the <SITE> placeholder');
  }
  SITE_PLACEHOLDER_RE.lastIndex = 0;

  if (!ABOUT_PLACEHOLDER_RE.test(prompt)) {
    throw new Error('voice-prompt template is missing the <ABOUT: ...> placeholder');
  }
  ABOUT_PLACEHOLDER_RE.lastIndex = 0;

  prompt = prompt.replace(SITE_PLACEHOLDER_RE, () => cleanSite);
  prompt = prompt.replace(ABOUT_PLACEHOLDER_RE, () => cleanAbout);

  if (SITE_PLACEHOLDER_RE.test(prompt) || ABOUT_PLACEHOLDER_RE.test(prompt)) {
    throw new Error('Unreplaced placeholder remained in system prompt');
  }
  SITE_PLACEHOLDER_RE.lastIndex = 0;
  ABOUT_PLACEHOLDER_RE.lastIndex = 0;

  return prompt;
}

/**
 * Validate and format the per-turn input block (DECISION, HISTORY, VISITOR_MESSAGE).
 */
export function buildTurnInput({ decision, history, visitorMessage } = {}) {
  if (!decision || typeof decision !== 'object' || Array.isArray(decision)) {
    throw new Error('decision must be a non-null object');
  }

  const hasDirection = assertProbability(decision.has_direction, 'decision.has_direction');
  const waypoint = validateWaypoint(decision.waypoint, 'decision.waypoint');
  const runnerUp = validateWaypoint(decision.runner_up, 'decision.runner_up');
  const formattedHistory = formatHistory(history);
  const cleanVisitorMessage = assertNonEmptyString(visitorMessage, 'visitorMessage');

  const formatWaypoint = (wp) => (wp === null ? 'null' : JSON.stringify(wp));

  return [
    'DECISION',
    `  has_direction: ${hasDirection}`,
    `  waypoint:      ${formatWaypoint(waypoint)}`,
    `  runner_up:     ${formatWaypoint(runnerUp)}`,
    '',
    'HISTORY',
    formattedHistory,
    '',
    'VISITOR_MESSAGE',
    cleanVisitorMessage,
  ].join('\n');
}

/**
 * Wrap a worker call function so it can be invoked at most once per turn.
 * Calling the wrapped worker a second time in the same turn throws an Error.
 */
export function assertAtMostOneWorkerCall(worker) {
  if (typeof worker !== 'function') {
    throw new TypeError('worker must be a function');
  }

  let callCount = 0;

  const guardedWorker = (...args) => {
    if (callCount >= 1) {
      throw new Error('At most one ask_worker call is allowed per turn');
    }
    callCount += 1;
    return worker(...args);
  };

  guardedWorker.getCallCount = () => callCount;
  guardedWorker.reset = () => {
    callCount = 0;
  };

  return guardedWorker;
}
