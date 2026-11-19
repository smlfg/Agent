/*
 * M0 client-side instrumentation (page init script).
 *
 * Injected with Playwright's addInitScript BEFORE any page script runs.
 * It is observation-only: it wraps the global WebSocket constructor and
 * AudioBufferSourceNode.start, and observes the transcript DOM. It never
 * changes protocol messages, request bodies, model choice or UI.
 *
 * Clocks:
 *  - Every t_* value is performance.now() (monotonic, same page, same origin).
 *  - performance.timeOrigin is recorded so t_* can be mapped to UTC.
 *  - Server-side values (turn_metrics / metrics) are copied verbatim. They use
 *    the Worker clock and are NEVER subtracted from client timestamps.
 *
 * Definitions (also documented in tech/M0-LATENZMESSUNG-2026-11-19.md):
 *  - t_send: outgoing text_message frame leaves the page.
 *  - t_first_visible_text: first non-empty assistant text is in the DOM and
 *    two animation frames have passed (approximates "after paint").
 *    t_first_visible_text_dom is the optimistic DOM-mutation time.
 *  - t_first_audible_audio: first AudioBufferSourceNode.start() attributable
 *    to the turn, converted to the page clock; null when no audio is produced.
 */
(() => {
  if (window.__M0) return;

  const M = {
    version: 1,
    runId: "__M0_RUN_ID__",
    startedAt: performance.now(),
    timeOrigin: performance.timeOrigin,
    records: [],
    turns: [],
    seq: 0
  };
  window.__M0 = M;

  // Isolated conversation ID: the app reads this key at module load and uses
  // it as the Durable Object instance name. A fresh browser profile already
  // gets a fresh UUID; setting it explicitly makes the run reproducible and
  // keeps foreign sessions out of this conversation.
  try {
    localStorage.setItem("voice-agent-session-id", M.runId);
  } catch {}

  function rec(kind, data) {
    M.records.push({
      i: ++M.seq,
      t: performance.now(),
      wall: new Date(performance.timeOrigin + performance.now()).toISOString(),
      kind,
      ...(data || {})
    });
  }

  function openTurn() {
    // A turn is "current" while open, or for a short grace window after an
    // error close: the SDK sends turn_metrics *after* the status/idle frame.
    const now = performance.now();
    for (let i = M.turns.length - 1; i >= 0; i--) {
      const t = M.turns[i];
      if (!t.closed) return t;
      if (
        t.t_closed !== undefined &&
        now - t.t_closed < 3000 &&
        !t.server.turn_metrics
      ) {
        return t;
      }
    }
    return null;
  }

  function assistantNodes() {
    return Array.from(
      document.querySelectorAll("div.flex.justify-start")
    );
  }

  // --- Turn lifecycle ------------------------------------------------------

  function startTurn(text) {
    const turn = {
      id: M.turns.length + 1,
      text,
      t_send: performance.now(),
      t_send_wall: new Date(
        performance.timeOrigin + performance.now()
      ).toISOString(),
      closed: false,
      outcome: null,
      t_first_visible_text: null,
      t_first_visible_text_dom: null,
      t_first_visible_text_sample: null,
      t_first_audible_audio: null,
      t_first_audio_bytes: null,
      binary_frames: 0,
      server: {},
      error: null,
      _assistCountAtStart: assistantNodes().length,
      _rafPending: false
    };
    M.turns.push(turn);
    rec("turn.send", { turn: turn.id, chars: text.length });
    return turn;
  }

  // --- WebSocket observation ----------------------------------------------

  const OrigWS = window.WebSocket;

  function WrappedWebSocket(...args) {
    const ws = new OrigWS(...args);
    rec("ws.open", { url: String(args[0]) });

    ws.addEventListener("message", (event) => {
      const data = event.data;
      if (typeof data === "string") {
        let msg = null;
        try {
          msg = JSON.parse(data);
        } catch {
          msg = null;
        }
        const turn = openTurn();
        rec("ws.in", {
          turn: turn ? turn.id : null,
          type: msg ? msg.type : null,
          bytes: data.length,
          msg
        });
        if (msg) handleServerMessage(msg, turn);
      } else {
        const bytes =
          typeof data.byteLength === "number"
            ? data.byteLength
            : typeof data.size === "number"
              ? data.size
              : null;
        const turn = openTurn();
        rec("ws.in.binary", { turn: turn ? turn.id : null, bytes });
        if (turn) {
          turn.binary_frames += 1;
          if (turn.t_first_audio_bytes === null) {
            turn.t_first_audio_bytes = performance.now();
            rec("turn.first_audio_bytes", { turn: turn.id, bytes });
          }
        }
      }
    });

    const origSend = ws.send.bind(ws);
    ws.send = function (data) {
      if (typeof data === "string") {
        let msg = null;
        try {
          msg = JSON.parse(data);
        } catch {
          msg = null;
        }
        const type = msg ? msg.type : null;
        rec("ws.out", { type, bytes: data.length, msg });
        if (type === "text_message" && typeof msg.text === "string") {
          startTurn(msg.text);
        }
      } else {
        rec("ws.out.binary", {
          bytes:
            typeof data.byteLength === "number"
              ? data.byteLength
              : typeof data.size === "number"
                ? data.size
                : null
        });
      }
      return origSend(data);
    };

    ws.addEventListener("close", (event) => {
      rec("ws.close", { code: event.code, reason: event.reason });
    });
    ws.addEventListener("error", () => rec("ws.error", {}));

    return ws;
  }

  WrappedWebSocket.prototype = OrigWS.prototype;
  for (const key of ["CONNECTING", "OPEN", "CLOSING", "CLOSED"]) {
    try {
      WrappedWebSocket[key] = OrigWS[key];
    } catch {}
  }
  window.WebSocket = WrappedWebSocket;

  // --- Server message bookkeeping -----------------------------------------

  function handleServerMessage(msg, turn) {
    if (!turn) return;
    const s = turn.server;

    switch (msg.type) {
      case "status":
        s.status = s.status || [];
        s.status.push({ t: performance.now(), value: msg.status });
        if (msg.status === "thinking" && s.t_thinking === undefined) {
          s.t_thinking = performance.now();
        }
        if (
          msg.status === "idle" &&
          turn.error &&
          turn.outcome === null
        ) {
          // Do not close immediately: turn_metrics follows status/idle.
          // Fallback close only if the terminal summary never arrives.
          setTimeout(() => {
            if (!turn.closed && !turn.server.turn_metrics) {
              closeTurn(turn, turn.outcome || "error");
            }
          }, 2000);
        }
        break;
      case "transcript":
        if (msg.role === "user" && s.t_user_transcript === undefined) {
          s.t_user_transcript = performance.now();
          s.user_transcript = msg.text;
        }
        break;
      case "transcript_start":
        if (s.t_transcript_start === undefined) {
          s.t_transcript_start = performance.now();
        }
        break;
      case "transcript_delta":
        s.delta_chars = (s.delta_chars || 0) + (msg.text ? msg.text.length : 0);
        if (
          s.t_server_first_delta === undefined &&
          typeof msg.text === "string" &&
          msg.text.trim().length > 0
        ) {
          s.t_server_first_delta = performance.now();
          rec("turn.server_first_delta", {
            turn: turn.id,
            sample: msg.text.slice(0, 80)
          });
        }
        break;
      case "transcript_end":
        s.t_transcript_end = performance.now();
        s.final_text = msg.text;
        break;
      case "metrics":
        s.t_metrics_message = performance.now();
        s.metrics = {
          llm_ms: msg.llm_ms,
          tts_ms: msg.tts_ms,
          first_audio_ms: msg.first_audio_ms,
          total_ms: msg.total_ms
        };
        break;
      case "turn_metrics": {
        const target =
          turn ||
          M.turns.find((t) => !t.closed && !t.server.turn_metrics) ||
          null;
        if (!target) break;
        target.server.t_turn_metrics = performance.now();
        const { type, ...payload } = msg;
        target.server.turn_metrics = payload;
        if (target.outcome === null) target.outcome = payload.outcome;
        closeTurn(target, payload.outcome);
        break;
      }
      case "completion_outcome":
        s.completion_outcome = {
          code: msg.code,
          finishReason: msg.finishReason,
          partialOutput: msg.partialOutput
        };
        break;
      case "error":
        turn.error = {
          message: msg.message,
          code: msg.code,
          stage: msg.stage,
          retryable: msg.retryable
        };
        rec("turn.error", { turn: turn.id, error: turn.error });
        if (msg.code === "stt_startup_failed") {
          closeTurn(turn, "error");
        }
        break;
      default:
        break;
    }
  }

  function closeTurn(turn, outcome) {
    if (turn.closed) return;
    turn.closed = true;
    turn.t_closed = performance.now();
    if (turn.outcome === null) turn.outcome = outcome || "unknown";
    rec("turn.closed", { turn: turn.id, outcome: turn.outcome });
  }

  // --- First visible text --------------------------------------------------

  function maybeCaptureVisibleText() {
    const turn = openTurn();
    if (!turn || turn.t_first_visible_text !== null) return;

    const nodes = assistantNodes();
    if (nodes.length <= turn._assistCountAtStart) return;

    const text = (nodes[nodes.length - 1].innerText || "").trim();
    if (text.length === 0 || text === "..." || text === "…") return;

    if (turn.t_first_visible_text_dom === null) {
      turn.t_first_visible_text_dom = performance.now();
      turn.t_first_visible_text_sample = text.slice(0, 160);
      rec("dom.first_visible_text_mutation", {
        turn: turn.id,
        chars: text.length,
        sample: turn.t_first_visible_text_sample
      });
    }

    if (turn._rafPending) return;
    turn._rafPending = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (turn.t_first_visible_text === null) {
          turn.t_first_visible_text = performance.now();
          rec("dom.first_visible_text_frame", {
            turn: turn.id,
            chars: text.length
          });
        }
      });
    });
  }

  const observer = new MutationObserver(() => {
    maybeCaptureVisibleText();
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
    characterData: true
  });

  // --- First audible audio -------------------------------------------------

  if (window.AudioBufferSourceNode) {
    const origStart = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (when, offset, duration) {
      let leadMs = 0;
      try {
        const ctx = this.context;
        if (typeof when === "number" && when > 0) {
          leadMs = Math.max(0, (when - ctx.currentTime) * 1000);
        }
      } catch {}
      const audibleAt = performance.now() + leadMs;
      const turn = openTurn();
      rec("audio.source_start", {
        turn: turn ? turn.id : null,
        leadMs: Number(leadMs.toFixed(3)),
        durationS:
          this.buffer && typeof this.buffer.duration === "number"
            ? Number(this.buffer.duration.toFixed(4))
            : null
      });
      if (turn && turn.t_first_audible_audio === null) {
        turn.t_first_audible_audio = audibleAt;
        rec("turn.first_audible_audio", {
          turn: turn.id,
          leadMs: Number(leadMs.toFixed(3))
        });
      }
      return origStart.apply(this, arguments);
    };
  }

  // --- Environment facts ---------------------------------------------------

  M.env = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory ?? null,
    visibilityState: document.visibilityState,
    sessionId: null
  };

  try {
    M.env.sessionId = localStorage.getItem("voice-agent-session-id");
  } catch {}

  // Test-only hooks. Used by the instrumentation self-test; they do not send
  // anything and are not part of the product path.
  M._selftestStartTurn = startTurn;
  M._selftestCloseTurn = closeTurn;

  M.snapshot = () => ({
    runId: M.runId,
    startedAt: M.startedAt,
    timeOrigin: M.timeOrigin,
    env: M.env,
    turns: M.turns.map((t) => {
      const { _assistCountAtStart, _rafPending, ...rest } = t;
      return rest;
    })
  });

  M.eventsSince = (cursor) => M.records.slice(cursor);
  M.eventCount = () => M.records.length;

  rec("instrument.ready", {
    runId: M.runId,
    sessionId: M.env.sessionId,
    userAgent: navigator.userAgent
  });
})();
