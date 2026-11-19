// DEVELOPMENT DATA — not a real agent. Deterministic canned answers so the
// surface can be experienced without any backend. Replace in a later mission.

export const DEV_LABEL = 'Development data: answers are canned, no model is connected.';

const ANSWERS = [
  "I'm here. Tell me what you're working on, and I'll shape myself around it.",
  "That's interesting. Say a little more — what would make this feel right to you?",
  "I hear you. Let me keep it simple: one thought at a time, nothing more than you need.",
  "Got it. If you want, push back on that — I'm easier to shape than a page.",
  "Okay. I'll stay quiet until you say something. That's how this works.",
];

/** Deterministic: the same prompt always yields the same answer. */
export function pickResponse(prompt) {
  const text = String(prompt ?? '');
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return ANSWERS[hash % ANSWERS.length];
}

/**
 * Simulated agent call.
 * @param {string} prompt
 * @param {{signal?: AbortSignal, delayMs?: number}} [opts]
 * @returns {Promise<{text: string, dev: true}>}
 */
export function respond(prompt, { signal, delayMs = 700 } = {}) {
  return new Promise((resolve, reject) => {
    const abortError = () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return err;
    };
    if (signal?.aborted) return reject(abortError());
    const timer = setTimeout(() => resolve({ text: pickResponse(prompt), dev: true }), delayMs);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(abortError());
    }, { once: true });
  });
}
