// Conversation surface: composer -> store -> agent -> current pair only.
// One active exchange (prompt echo + answer); the previous one leaves upward.

import { createTypewriter } from './typewriter.js';

const THINKING_MARKUP = '<span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
const LEAVE_FALLBACK_MS = 700;
const CARET_FADE_MS = 600;

export function mountConversation({ root, store, agent, reducedMotion = false }) {
  const composer = root.querySelector('#composer');
  const input = root.querySelector('#composer-input');
  const pair = root.querySelector('#pair');
  const live = root.querySelector('#live');

  let aborter = null;
  let typewriter = null;
  let leaveTimer = null;
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
    if (reducedMotion) {
      removeEntry(entry);
      return;
    }
    entry.classList.add('is-leaving');
    entry.addEventListener('animationend', () => removeEntry(entry), { once: true });
    leaveTimer = setTimeout(() => removeEntry(entry), LEAVE_FALLBACK_MS);
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

  function createEntry(prompt) {
    for (const stale of pair.querySelectorAll('.pair-entry')) dismissEntry(stale);

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
      answerEl.textContent = 'Something went wrong. Try again.';
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

    stopTurn();
    store.dispatch({ type: 'SUBMIT', prompt });
    const turn = store.getState().turn;

    input.value = '';
    input.focus();

    const { entry, answerEl } = createEntry(prompt);
    entry.dataset.turn = String(turn);
    respond(prompt, turn, answerEl);
  }

  input.addEventListener('input', onInput);
  composer.addEventListener('submit', onSubmit);

  return {
    destroy() {
      stopTurn();
      clearLeaveTimer();
      clearCaretTimers();
      input.removeEventListener('input', onInput);
      composer.removeEventListener('submit', onSubmit);
    },
  };
}
