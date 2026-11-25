// Conversation surface: composer -> store -> agent -> current pair only.
// One active exchange (prompt echo + answer); the previous one leaves upward.

import { createTypewriter } from './typewriter.js';
import { dissolve } from './dissolve.js';
import { currentBehaviour } from '../metrics/surface.js';

const THINKING_MARKUP = '<span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
const LEAVE_FALLBACK_MS = 700;
const CARET_FADE_MS = 600;
const RESPONSE_ERROR_TEXT = "I can't answer right now. Try again in a bit.";
const ACK_CLASS_MS = 420;
const ACK_GAZE_RELEASE_MS = 600;

function ensureAckStylesheet(doc) {
  if (doc.querySelector('link[data-agentfaehig-ack]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../styles/ack.css', import.meta.url).href;
  link.setAttribute('data-agentfaehig-ack', '');
  (doc.head ?? doc.documentElement).append(link);
}

export function mountConversation({ root, store, agent, reducedMotion = false }) {
  const doc = root.ownerDocument ?? document;
  const composer = root.querySelector('#composer');
  const input = root.querySelector('#composer-input');
  const pair = root.querySelector('#pair');
  const live = root.querySelector('#live');
  const presence = doc.getElementById('presence') ?? root.querySelector('#presence');

  ensureAckStylesheet(doc);

  let aborter = null;
  let typewriter = null;
  let currentEntry = null;
  let leaveTimer = null;
  let ackTimer = null;
  let gazeReleaseTimer = null;
  const caretTimers = new Set();

  function clearLeaveTimer() {
    if (leaveTimer !== null) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
    }
  }

  function clearCaretTimers() {
    for (const id of caretTimers) clearTimeout(id);
    caretTimers.clear();
  }

  function clearAckTimers() {
    if (ackTimer !== null) {
      clearTimeout(ackTimer);
      ackTimer = null;
    }
    if (gazeReleaseTimer !== null) {
      clearTimeout(gazeReleaseTimer);
      gazeReleaseTimer = null;
    }
  }

  // Immediate receipt for an interruption: a single short blink (via is-ack),
  // a glance towards the visitor, and one gaze release shortly afterwards.
  // Reduced motion keeps the event receipt but skips the blink class.
  function acknowledgeInterrupt() {
    if (!reducedMotion && presence) {
      presence.classList.add('is-ack');
      if (ackTimer !== null) clearTimeout(ackTimer);
      ackTimer = setTimeout(() => {
        ackTimer = null;
        presence.classList.remove('is-ack');
      }, ACK_CLASS_MS);
    }

    doc.dispatchEvent(new CustomEvent('agentfaehig:ack', { detail: { kind: 'interrupt' } }));

    const view = doc.defaultView ?? globalThis;
    const x = Number.isFinite(view?.innerWidth) ? view.innerWidth / 2 : 0;
    const rect = presence && typeof presence.getBoundingClientRect === 'function'
      ? presence.getBoundingClientRect()
      : null;
    const y = rect
      ? rect.bottom + Math.max(12, rect.height * 0.12)
      : (Number.isFinite(view?.innerHeight) ? view.innerHeight * 0.35 : 0);

    doc.dispatchEvent(new CustomEvent('agentfaehig:gaze', {
      detail: { x, y, source: 'ack' },
    }));

    if (gazeReleaseTimer !== null) clearTimeout(gazeReleaseTimer);
    gazeReleaseTimer = setTimeout(() => {
      gazeReleaseTimer = null;
      doc.dispatchEvent(new CustomEvent('agentfaehig:gaze', { detail: { source: 'release' } }));
    }, ACK_GAZE_RELEASE_MS);
  }

  // The typed answer is plain text plus one aria-hidden caret span. The answer
  // string is only ever written through textContent, never parsed as HTML.
  function mountTypedAnswer(answerEl) {
    const textEl = document.createElement('span');
    textEl.className = 'tw-text';

    let caret = null;
    if (!reducedMotion) {
      caret = document.createElement('span');
      caret.className = 'tw-caret';
      caret.setAttribute('aria-hidden', 'true');
    }

    answerEl.replaceChildren(textEl);
    if (caret) answerEl.append(caret);
    return { textEl, caret };
  }

  function retireCaret(answerEl, caret) {
    if (!caret) return;
    answerEl.classList.remove('is-typing', 'is-pausing');
    answerEl.classList.add('is-done');
    const id = setTimeout(() => {
      caretTimers.delete(id);
      if (caret.parentNode) caret.remove();
    }, CARET_FADE_MS);
    caretTimers.add(id);
  }

  function removeEntry(entry) {
    if (entry && entry.parentNode) entry.parentNode.removeChild(entry);
  }

  function dismissEntry(entry) {
    if (!entry || !entry.isConnected) return;
    dissolve(entry, { reducedMotion });
  }

  function stopTurn() {
    if (aborter) {
      aborter.abort();
      aborter = null;
    }
    if (typewriter) {
      typewriter.stop();
      typewriter = null;
    }
  }

  function createEntry(prompt, { keepEntry = null } = {}) {
    for (const stale of pair.querySelectorAll('.pair-entry')) {
      if (stale === keepEntry) continue;
      dismissEntry(stale);
    }

    const entry = document.createElement('div');
    entry.className = 'pair-entry';

    const promptEl = document.createElement('p');
    promptEl.className = 'pair-prompt';
    promptEl.textContent = prompt;

    const answerEl = document.createElement('p');
    answerEl.className = 'pair-answer';
    answerEl.setAttribute('aria-busy', 'true');
    answerEl.innerHTML = THINKING_MARKUP;

    entry.append(promptEl, answerEl);
    pair.append(entry);
    currentEntry = entry;
    return { entry, answerEl };
  }

  async function respond(prompt, turn, answerEl) {
    const controller = new AbortController();
    aborter = controller;

    try {
      const result = await agent.respond(prompt, { signal: controller.signal });
      if (controller.signal.aborted || turn !== store.getState().turn) return;

      const text = String(result?.text ?? '');
      store.dispatch({ type: 'RESPONSE_START', turn, dev: Boolean(result?.dev) });

      const { textEl, caret } = mountTypedAnswer(answerEl);
      typewriter = createTypewriter({
        text,
        unit: 'char',
        charDelayMs: currentBehaviour().charDelayMs,
        reducedMotion,
        onUpdate(visible, meta) {
          textEl.textContent = visible;
          if (caret) {
            const pausing = meta?.state === 'pausing';
            answerEl.classList.toggle('is-pausing', pausing);
            answerEl.classList.toggle('is-typing', !pausing);
          }
          store.dispatch({ type: 'RESPONSE_PROGRESS', turn, text: visible });
        },
        onDone() {
          store.dispatch({ type: 'RESPONSE_END', turn, text });
          answerEl.setAttribute('aria-busy', 'false');
          if (live) live.textContent = text;
          retireCaret(answerEl, caret);
          typewriter = null;
        },
      });
      typewriter.start();
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      if (turn !== store.getState().turn) return;
      store.dispatch({ type: 'RESPONSE_ERROR', turn });
      answerEl.setAttribute('aria-busy', 'false');
      answerEl.textContent = RESPONSE_ERROR_TEXT;
      if (live) live.textContent = RESPONSE_ERROR_TEXT;
    } finally {
      if (aborter === controller) aborter = null;
    }
  }

  function onInput() {
    store.dispatch({ type: 'INPUT', value: input.value });
  }

  function onSubmit(event) {
    event.preventDefault();
    const prompt = input.value.trim();
    if (!prompt) return;

    const phase = store.getState().phase;
    const interrupting = phase === 'thinking' || phase === 'speaking';

    let previousEntry = null;
    let finishing = null;

    if (interrupting) {
      acknowledgeInterrupt();
      previousEntry = currentEntry;

      if (phase === 'speaking' && typewriter) {
        // Keep the running answer alive just long enough to land on a clean
        // sentence boundary; the new request is sent below without waiting.
        const running = typewriter;
        typewriter = null;
        finishing = running.finishSentence();
      } else {
        // Thinking (no text yet) or nothing left to type: dissolve as before.
        stopTurn();
      }
    } else {
      stopTurn();
    }

    store.dispatch({ type: 'SUBMIT', prompt });
    const turn = store.getState().turn;

    input.value = '';
    input.focus();

    const { entry, answerEl } = createEntry(prompt, {
      keepEntry: finishing ? previousEntry : null,
    });
    entry.dataset.turn = String(turn);

    // No waiting for the old sentence: the new turn goes out immediately.
    respond(prompt, turn, answerEl);

    if (finishing) {
      const release = () => dismissEntry(previousEntry);
      finishing.then(release, release);
    }
  }

  input.addEventListener('input', onInput);
  composer.addEventListener('submit', onSubmit);

  return {
    destroy() {
      stopTurn();
      clearLeaveTimer();
      clearCaretTimers();
      clearAckTimers();
      if (presence) presence.classList.remove('is-ack');
      input.removeEventListener('input', onInput);
      composer.removeEventListener('submit', onSubmit);
    },
  };
}
