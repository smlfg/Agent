// Voice button — speak instead of typing (Web Speech API, no backend).
//
// Owner: voice is optional. "Click first, then speak." Text stays the main
// path; nothing here sends a turn on its own. The visitor still presses Enter
// or Send. The transcript is provisional (damped colour) until a final result
// arrives; then it stays in the field and the field takes focus again.
//
// The button is only revealed when the browser exposes SpeechRecognition.
// There is no install, no key, no server: the browser's own speech service
// does the recognising (Chrome sends the audio to Google), which is why the
// first use shows one quiet line under the field for six seconds.
//
// Browser state is mirrored as a document event so other modules (eyes,
// metrics) can react without knowing this file:
//   document.dispatchEvent(new CustomEvent('agentfaehig:mic',
//     { detail: { state: 'listening' | 'idle' | 'error' } }))

export const MIC_EVENT = 'agentfaehig:mic';
export const MIC_STATES = Object.freeze(['idle', 'listening', 'error']);
export const RECOGNITION_LANG = 'en-US';
export const PROVISIONAL_CLASS = 'is-interim';
export const CONSENT_TEXT = "Voice uses your browser's speech service.";
export const CONSENT_VISIBLE_MS = 6000;
export const CONSENT_FADE_MS = 400;
export const ERROR_VISIBLE_MS = 1800;
export const STOP_FALLBACK_MS = 1600;

// Which key event moves the microphone state machine. Unknown pairs are
// no-ops, so a stray event can never invent a state.
const TRANSITIONS = Object.freeze({
  idle: Object.freeze({ START: 'listening' }),
  listening: Object.freeze({ STOP: 'idle', ERROR: 'error' }),
  error: Object.freeze({ START: 'listening', STOP: 'idle', RESET: 'idle' }),
});

export function micNext(state, event) {
  const row = TRANSITIONS[state];
  const next = row && row[event];
  return MIC_STATES.includes(next) ? next : state;
}

function collapse(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

// The base is the visitor's own text captured when listening starts; it is
// kept verbatim apart from trailing whitespace. `finalText` accumulates, the
// interim fragment is always replaced (the browser revises it in place).
export function composeTranscript(base = '', finalText = '', interimText = '') {
  const parts = [];
  const kept = String(base ?? '').replace(/\s+$/, '');
  if (kept) parts.push(kept);
  const finalPart = collapse(finalText);
  if (finalPart) parts.push(finalPart);
  const interimPart = collapse(interimText);
  if (interimPart) parts.push(interimPart);
  return parts.join(' ');
}

// Web Speech returns the whole result list on every event: finished results
// are final, the trailing one is revised while the visitor speaks.
export function collectTranscript(results, from = 0) {
  let finalText = '';
  let interimText = '';
  const list = results ?? [];
  const length = Number.isFinite(list.length) ? list.length : 0;
  for (let i = Math.max(0, Number(from) || 0); i < length; i += 1) {
    const result = list[i];
    if (!result) continue;
    const alternative = result[0] ?? result;
    const text = String(alternative?.transcript ?? result.transcript ?? '');
    if (!text.trim()) continue;
    if (result.isFinal) {
      const part = text.trim();
      finalText = finalText ? `${finalText} ${part}` : part;
    } else {
      interimText = text.trim();
    }
  }
  return { final: finalText, interim: interimText };
}

export const ERROR_HINTS = Object.freeze({
  'not-allowed': 'Microphone access is blocked. You can keep typing.',
  'service-not-allowed': 'Microphone access is blocked. You can keep typing.',
  'no-speech': "I didn't catch anything. You can keep typing.",
  network: 'Voice needs a connection right now. You can keep typing.',
});

export const DEFAULT_ERROR_HINT = "Voice didn't work just now. You can keep typing.";

export function hintForError(code) {
  return ERROR_HINTS[code] ?? DEFAULT_ERROR_HINT;
}

// A user-initiated stop arrives as "aborted"; it is not a failure and gets
// no hint.
export function isSilentError(code) {
  return code === 'aborted';
}

export function getRecognitionCtor(scope = globalThis) {
  if (!scope) return null;
  const ctor = scope.SpeechRecognition || scope.webkitSpeechRecognition;
  return typeof ctor === 'function' ? ctor : null;
}

export function isMicSupported(scope = globalThis) {
  return getRecognitionCtor(scope) !== null;
}

// ── Browser side ──────────────────────────────────────────────────────────

const CSS_ID = 'agentfaehig-mic-css';
const CSS_HREF = new URL('../styles/mic.css', import.meta.url).href;

function ensureStylesheet(doc) {
  if (!doc || doc.getElementById(CSS_ID)) return;
  const link = doc.createElement('link');
  link.id = CSS_ID;
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  (doc.head ?? doc.documentElement).append(link);
}

/**
 * Mount the voice button.
 *
 * @param {{
 *   input: HTMLInputElement,
 *   button: HTMLButtonElement,
 *   store?: object,
 *   reducedMotion?: boolean,
 *   scope?: object,
 * }} options
 * @returns {{destroy: () => void}}
 */
export function mountMic({ input, button, reducedMotion = false, scope = globalThis } = {}) {
  const doc = input?.ownerDocument ?? (typeof document !== 'undefined' ? document : null);
  if (!input || !button || !doc) return { destroy() {} };

  ensureStylesheet(doc);

  const Recognition = getRecognitionCtor(scope);
  if (!Recognition) {
    button.hidden = true;
    button.setAttribute('aria-pressed', 'false');
    return {
      destroy() {
        button.hidden = true;
      },
    };
  }

  button.hidden = false;
  button.setAttribute('aria-pressed', 'false');
  if (reducedMotion) button.classList.add('is-reduced-motion');

  const form = button.form ?? input.form ?? button.closest('form');
  const live = doc.getElementById('live');
  const view = doc.defaultView ?? globalThis;
  const CustomEventCtor = view.CustomEvent ?? globalThis.CustomEvent;
  const EventCtor = view.Event ?? globalThis.Event;
  const raf = view.requestAnimationFrame
    ? (fn) => view.requestAnimationFrame(fn)
    : (fn) => setTimeout(fn, 0);

  // One quiet line under the field, first use only, gone after six seconds.
  // Reload is a fresh start: nothing is persisted.
  const consent = doc.createElement('p');
  consent.className = 'mic-consent';
  consent.id = 'mic-consent';
  consent.textContent = CONSENT_TEXT;
  consent.hidden = true;
  if (reducedMotion) consent.classList.add('is-reduced-motion');
  (form && typeof form.append === 'function' ? form : input.parentNode).append(consent);

  let state = 'idle';
  let session = null;
  let consentShown = false;
  let destroyed = false;
  let consentTimer = null;
  let consentHideTimer = null;
  let errorTimer = null;
  let stopTimer = null;
  let announceTimer = null;

  function later(ms, fn) {
    const id = setTimeout(() => {
      if (!destroyed) fn();
    }, Math.max(0, ms));
    return id;
  }

  function clearErrorTimer() {
    if (errorTimer !== null) {
      clearTimeout(errorTimer);
      errorTimer = null;
    }
  }

  function clearStopTimer() {
    if (stopTimer !== null) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
  }

  function emit(next) {
    if (!CustomEventCtor) return;
    doc.dispatchEvent(new CustomEventCtor(MIC_EVENT, { detail: { state: next } }));
  }

  function setState(next) {
    if (next === state) return;
    state = next;
    button.classList.toggle('is-listening', next === 'listening');
    button.classList.toggle('is-error', next === 'error');
    button.setAttribute('aria-pressed', next === 'listening' ? 'true' : 'false');
    emit(next);
  }

  function announce(text) {
    if (!live || !text) return;
    // Clear first so a repeated message is still announced, then speak once.
    if (announceTimer !== null) clearTimeout(announceTimer);
    live.textContent = '';
    announceTimer = later(40, () => {
      announceTimer = null;
      live.textContent = text;
    });
  }

  function setInputValue(value, provisional) {
    const changed = input.value !== value;
    if (changed) input.value = value;
    const classChanged = input.classList.contains(PROVISIONAL_CLASS) !== Boolean(provisional);
    input.classList.toggle(PROVISIONAL_CLASS, Boolean(provisional));
    if ((changed || classChanged) && EventCtor) {
      input.dispatchEvent(new EventCtor('input', { bubbles: true }));
    }
  }

  function focusInput() {
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
    try {
      const end = input.value.length;
      input.setSelectionRange(end, end);
    } catch {
      /* some browsers never allow setSelectionRange on this input */
    }
  }

  function maybeShowConsent() {
    if (consentShown || destroyed) return;
    consentShown = true;
    consent.hidden = false;
    raf(() => {
      if (!destroyed) consent.classList.add('is-visible');
    });
    consentTimer = later(CONSENT_VISIBLE_MS, () => {
      consentTimer = null;
      consent.classList.remove('is-visible');
      const fade = reducedMotion ? 0 : CONSENT_FADE_MS;
      consentHideTimer = later(fade, () => {
        consentHideTimer = null;
        consent.hidden = true;
      });
    });
  }

  function start() {
    if (destroyed || session) return;
    clearErrorTimer();
    maybeShowConsent();

    const active = {
      rec: null,
      base: input.value.replace(/\s+$/, ''),
      finalText: '',
      interimText: '',
      closed: false,
    };
    session = active;

    let rec;
    try {
      rec = new Recognition();
    } catch {
      announce(DEFAULT_ERROR_HINT);
      setState('error');
      errorTimer = later(ERROR_VISIBLE_MS, () => {
        errorTimer = null;
        setState('idle');
      });
      session = null;
      return;
    }

    rec.lang = RECOGNITION_LANG;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    active.rec = rec;

    setState('listening');

    rec.onresult = (event) => {
      if (session !== active || active.closed || destroyed) return;
      const { final, interim } = collectTranscript(event?.results);
      active.finalText = final;
      active.interimText = interim;
      setInputValue(
        composeTranscript(active.base, final, interim),
        interim.length > 0,
      );
    };

    rec.onerror = (event) => {
      if (session !== active || active.closed || destroyed) return;
      const code = event?.error ?? 'unknown';
      if (isSilentError(code)) {
        finish({});
        return;
      }
      announce(hintForError(code));
      finish({ error: true });
    };

    rec.onend = () => {
      if (session !== active || active.closed || destroyed) return;
      finish({});
    };

    try {
      rec.start();
    } catch {
      announce(DEFAULT_ERROR_HINT);
      finish({ error: true });
    }
  }

  function stop() {
    const active = session;
    if (!active || active.closed) return;
    try {
      active.rec?.stop();
    } catch {
      finish({});
      return;
    }
    // Some engines never fire `end` after a manual stop; keep control here.
    clearStopTimer();
    stopTimer = later(STOP_FALLBACK_MS, () => {
      stopTimer = null;
      if (session === active) finish({});
    });
  }

  /**
   * End the current recognition session exactly once. A manual stop folds
   * whatever is still interim into normal text (nothing the visitor said is
   * thrown away); a send during listening leaves the field to conversation.js.
   */
  function finish({ error = false, commit = true } = {}) {
    const active = session;
    if (!active) return;
    session = null;
    active.closed = true;
    clearStopTimer();

    const rec = active.rec;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* already ended */
      }
    }

    if (commit) {
      setInputValue(
        composeTranscript(active.base, active.finalText, active.interimText),
        false,
      );
      focusInput();
    } else {
      input.classList.remove(PROVISIONAL_CLASS);
    }

    if (error) {
      setState('error');
      clearErrorTimer();
      errorTimer = later(ERROR_VISIBLE_MS, () => {
        errorTimer = null;
        setState('idle');
      });
    } else {
      setState('idle');
    }
  }

  function onClick(event) {
    event.preventDefault();
    if (state === 'listening') stop();
    else start();
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape' || state !== 'listening') return;
    event.preventDefault();
    stop();
  }

  function onSubmit() {
    // Pressing Enter/Send sends the visible text as usual; it only stops the
    // microphone, it never writes back into the field conversation.js clears.
    if (state === 'listening') finish({ commit: false });
  }

  button.addEventListener('click', onClick);
  doc.addEventListener('keydown', onKeyDown);
  const submitTarget = form ?? input;
  if (submitTarget && typeof submitTarget.addEventListener === 'function') {
    submitTarget.addEventListener('submit', onSubmit);
  }

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;

      const active = session;
      session = null;
      if (active) {
        active.closed = true;
        const rec = active.rec;
        if (rec) {
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          try {
            rec.abort();
          } catch {
            /* already ended */
          }
        }
      }

      clearErrorTimer();
      clearStopTimer();
      if (consentTimer !== null) clearTimeout(consentTimer);
      if (consentHideTimer !== null) clearTimeout(consentHideTimer);
      if (announceTimer !== null) clearTimeout(announceTimer);

      button.removeEventListener('click', onClick);
      doc.removeEventListener('keydown', onKeyDown);
      if (submitTarget && typeof submitTarget.removeEventListener === 'function') {
        submitTarget.removeEventListener('submit', onSubmit);
      }

      consent.remove();
      button.classList.remove('is-listening', 'is-error');
      button.setAttribute('aria-pressed', 'false');
      input.classList.remove(PROVISIONAL_CLASS);
    },
  };
}
