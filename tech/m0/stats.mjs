#!/usr/bin/env node
/*
 * Recompute M0 statistics from the raw files of exactly one run.
 *
 * Reads  <runDir>/manifest.json, <runDir>/turns.jsonl, <runDir>/raw-events.jsonl
 * Writes <runDir>/summary.json and prints a compact report.
 *
 * No value is estimated. Every number is derived from a recorded turn.
 * If a raw cross-check fails, the script exits non-zero and says which check.
 */
import fs from "node:fs";
import path from "node:path";

const runDir = process.argv[2];
if (!runDir) {
  console.error("usage: node stats.mjs tech/m0/runs/<runId>");
  process.exit(2);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(runDir, "manifest.json"), "utf8")
);
const turns = fs
  .readFileSync(path.join(runDir, "turns.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const raw = fs
  .readFileSync(path.join(runDir, "raw-events.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

// --- Statistics ------------------------------------------------------------

function round(v, digits = 3) {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function quantile(sorted, q) {
  // Nearest-rank, 1-based: index = ceil(q * n), clamped to [1, n].
  const n = sorted.length;
  const rank = Math.min(n, Math.max(1, Math.ceil(q * n)));
  return sorted[rank - 1];
}

function describe(values) {
  const clean = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (clean.length === 0) {
    return {
      n: 0,
      note: "no measured values; no statistic computed"
    };
  }
  const sorted = [...clean].sort((a, b) => a - b);
  const n = sorted.length;
  const median =
    n % 2 === 1
      ? sorted[(n - 1) / 2]
      : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return {
    n,
    min: round(sorted[0]),
    median: round(median),
    p90: round(quantile(sorted, 0.9)),
    p95: round(quantile(sorted, 0.95)),
    max: round(sorted[n - 1]),
    mean: round(clean.reduce((a, b) => a + b, 0) / n),
    estimator: "nearest-rank for p90/p95; median is the middle value or the mean of the two middle values"
  };
}

const attempts = turns.length;
const planned = manifest.measurement?.turnsPlanned ?? null;
const notAttempted = planned === null ? null : Math.max(0, planned - attempts);
const runComplete =
  planned !== null && attempts === planned && !manifest.run?.aborted;
const successes = turns.filter(
  (t) => t.e2e_first_visible_text_ms !== null && t.outcome === "completed"
);
const failures = turns.filter(
  (t) => !(t.e2e_first_visible_text_ms !== null && t.outcome === "completed")
);

const errorBreakdown = {};
for (const t of failures) {
  let reason;
  if (/4006|daily free allocation|used up your daily free/i.test(t.error?.message ?? "")) {
    reason = "quota_4006";
  } else if (t.timeout) reason = "timeout";
  else if (t.error) reason = `error:${t.error.code ?? "unknown"}`;
  else if (t.outcome) reason = `outcome:${t.outcome}`;
  else if (t.e2e_first_visible_text_ms === null) reason = "no_visible_text";
  else reason = "unknown";
  errorBreakdown[reason] = (errorBreakdown[reason] ?? 0) + 1;
}

const measured = turns.map((t) => t.e2e_first_visible_text_ms);
const measuredDom = turns.map((t) => t.e2e_first_visible_text_dom_ms);
const warm = turns
  .filter((t) => t.index >= 2)
  .map((t) => t.e2e_first_visible_text_ms);
const serverModelToFirstText = turns.map(
  (t) => t.server?.turn_metrics?.modelToFirstTextMs
);
const serverTurnTotal = turns.map((t) => t.server?.turn_metrics?.turnTotalMs);
const serverModelStreamConsumption = turns.map(
  (t) => t.server?.turn_metrics?.modelStreamConsumptionMs
);

const audioProduced = turns.filter(
  (t) => t.e2e_first_audible_audio_ms !== null
).length;

// --- Raw cross-check -------------------------------------------------------

const rawChecks = {
  text_sends_match_turns: true,
  dom_events_match_records: true,
  recomputed_e2e_matches_records: true,
  turn_metrics_match_records: true,
  server_source_is_text: true,
  isolated_session: manifest.isolation?.sessionIdSeen === manifest.runId,
  server_mapping_matches_manifest: true,
  failures: []
};

const sends = raw.filter(
  (e) => e.kind === "ws.out" && e.type === "text_message"
);
if (sends.length !== turns.length) {
  rawChecks.text_sends_match_turns = false;
  rawChecks.failures.push(
    `text_message frames=${sends.length} but turn records=${turns.length}`
  );
}
for (let i = 0; i < Math.min(sends.length, turns.length); i++) {
  if (sends[i].msg?.text !== turns[i].prompt) {
    rawChecks.text_sends_match_turns = false;
    rawChecks.failures.push(
      `turn ${i + 1}: prompt mismatch raw="${sends[i].msg?.text}" record="${turns[i].prompt}"`
    );
  }
}

for (const t of turns) {
  if (t.e2e_first_visible_text_ms !== null) {
    const ev = raw.find(
      (e) =>
        e.kind === "dom.first_visible_text_frame" && e.turn === t.id
    );
    if (!ev || Math.abs(ev.t - t.t_first_visible_text) > 0.001) {
      rawChecks.dom_events_match_records = false;
      rawChecks.failures.push(
        `turn ${t.index}: DOM event missing or timestamp mismatch`
      );
    } else {
      const recomputed = Math.round((ev.t - t.t_send) * 1000) / 1000;
      if (Math.abs(recomputed - t.e2e_first_visible_text_ms) > 0.001) {
        rawChecks.recomputed_e2e_matches_records = false;
        rawChecks.failures.push(
          `turn ${t.index}: recomputed e2e ${recomputed} != recorded ${t.e2e_first_visible_text_ms}`
        );
      }
    }
  }
  if (t.server?.turn_metrics) {
    const ev = raw.find(
      (e) =>
        e.kind === "ws.in" &&
        e.turn === t.id &&
        e.msg?.type === "turn_metrics"
    );
    if (!ev) {
      rawChecks.turn_metrics_match_records = false;
      rawChecks.failures.push(`turn ${t.index}: turn_metrics frame missing`);
    } else {
      const a = t.server.turn_metrics;
      const b = ev.msg;
      for (const key of ["turnId", "source", "outcome", "turnTotalMs", "modelToFirstTextMs"]) {
        if (a[key] !== b[key]) {
          rawChecks.turn_metrics_match_records = false;
          rawChecks.failures.push(
            `turn ${t.index}: turn_metrics.${key} record=${a[key]} raw=${b[key]}`
          );
        }
      }
      if (b.source !== "text") {
        rawChecks.server_source_is_text = false;
        rawChecks.failures.push(
          `turn ${t.index}: turn source=${b.source}, expected text`
        );
      }
    }
  }
}

const manifestModel = manifest.target?.serverMapping?.resolvedModelId;
if (!manifestModel) {
  rawChecks.server_mapping_matches_manifest = false;
  rawChecks.failures.push("manifest has no resolvedModelId");
}

const newStoreFiles = (manifest.run?.doStoreFilesAfter ?? []).filter(
  (f) =>
    !(manifest.isolation?.durableObjectStoreFilesBefore ?? []).some(
      (b) => b.file === f.file
    )
);

const summary = {
  schema: "m0-latency-summary/1",
  runId: manifest.runId,
  mode: manifest.mode,
  source: {
    manifest: "manifest.json",
    turns: "turns.jsonl",
    rawEvents: "raw-events.jsonl"
  },
  model: {
    uiLabel: manifest.target?.uiModelLabel,
    llmQueryParam: manifest.target?.llmQueryParam,
    resolvedModelId: manifestModel,
    mappingExpression: manifest.target?.serverMapping?.expression,
    serverTsSha256: manifest.target?.serverTsSha256
  },
  isolation: {
    conversationId: manifest.isolation?.conversationId,
    sessionIdSeen: manifest.isolation?.sessionIdSeen,
    isolated: manifest.isolation?.sessionIdSeen === manifest.runId,
    newDurableObjectStoreFiles: newStoreFiles.map((f) => f.file),
    devServerShared: manifest.isolation?.devServerShared,
    devServerPidsBefore: manifest.isolation?.devServerPidsBefore,
    devServerPidsAfter: manifest.run?.devServerPidsAfter
  },
  attempts,
  planned,
  notAttempted,
  runComplete,
  successes: successes.length,
  failures: failures.length,
  errorRate: attempts === 0 ? null : round(failures.length / attempts, 4),
  errorRateDefinition:
    "failures / attempted turns; a failure is a turn without measured first visible text or with outcome != completed. Not-attempted turns are excluded and reported separately.",
  errorBreakdown,
  aborted: manifest.run?.aborted ?? null,
  latency: {
    primary_e2e_first_visible_text_ms: describe(measured),
    secondary_e2e_first_visible_text_dom_ms: describe(measuredDom),
    warm_excluding_turn_1_ms: describe(warm),
    server_modelToFirstTextMs: describe(serverModelToFirstText),
    server_turnTotalMs: describe(serverTurnTotal),
    server_modelStreamConsumptionMs: describe(serverModelStreamConsumption)
  },
  audio: {
    measuredFirstAudibleAudioTurns: audioProduced,
    note:
      audioProduced === 0
        ? "No TTS audio on the measured text-only path (no active call, STT startup blocked). First audible audio is therefore not a measured value in this run."
        : "At least one turn produced audible audio; see turns.jsonl."
  },
  rawVerification: rawChecks,
  turns: turns.map((t) => ({
    index: t.index,
    promptId: t.promptId,
    outcome: t.outcome,
    timeout: t.timeout,
    e2e_first_visible_text_ms: t.e2e_first_visible_text_ms,
    e2e_first_visible_text_dom_ms: t.e2e_first_visible_text_dom_ms,
    server_modelToFirstTextMs: t.server?.turn_metrics?.modelToFirstTextMs ?? null,
    server_turnTotalMs: t.server?.turn_metrics?.turnTotalMs ?? null,
    first_audio_bytes_ms: t.e2e_first_audio_bytes_ms,
    first_audible_audio_ms: t.e2e_first_audible_audio_ms,
    visibleText: t.visible_text ?? null,
    error: t.error ?? null
  }))
};

const summaryFile = path.join(runDir, "summary.json");
fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2) + "\n");

// --- Report ----------------------------------------------------------------

function fmt(d, unit = "ms") {
  if (!d || d.n === 0) return "n=0 (keine Messwerte)";
  return `n=${d.n} min=${d.min}${unit} median=${d.median}${unit} p90=${d.p90}${unit} p95=${d.p95}${unit} max=${d.max}${unit}`;
}

console.log(`M0 run ${summary.runId} (${summary.mode})`);
console.log(`model: ${summary.model.resolvedModelId} (query ${summary.model.llmQueryParam}, label ${summary.model.uiLabel})`);
console.log(`isolated session: ${summary.isolation.isolated} (${summary.isolation.sessionIdSeen})`);
console.log(`new DO store files: ${summary.isolation.newDurableObjectStoreFiles.length}`);
console.log("");
console.log(`attempts=${attempts} successes=${successes.length} failures=${failures.length} errorRate=${summary.errorRate}`);
console.log(`planned=${planned ?? "n/a"} notAttempted=${notAttempted ?? "n/a"} runComplete=${runComplete} aborted=${summary.aborted ?? "no"}`);
console.log(`server source text-only: ${rawChecks.server_source_is_text}`);
console.log("");
console.log("client end-to-end (primary):");
console.log("  " + fmt(summary.latency.primary_e2e_first_visible_text_ms));
console.log("client end-to-end (DOM mutation, lower bound):");
console.log("  " + fmt(summary.latency.secondary_e2e_first_visible_text_dom_ms));
console.log("warm only (turn 2..n):");
console.log("  " + fmt(summary.latency.warm_excluding_turn_1_ms));
console.log("server modelToFirstTextMs:");
console.log("  " + fmt(summary.latency.server_modelToFirstTextMs));
console.log("server turnTotalMs:");
console.log("  " + fmt(summary.latency.server_turnTotalMs));
console.log("");
console.log(`first audible audio: ${audioProduced}/${attempts} turns measured`);
console.log(`raw verification: ${rawChecks.failures.length === 0 ? "PASS" : "FAIL"}`);
for (const f of rawChecks.failures) console.log(`  - ${f}`);
console.log(`summary: ${summaryFile}`);

if (rawChecks.failures.length > 0) process.exitCode = 4;
