#!/usr/bin/env node
/*
 * M0 text-path latency runner.
 *
 * Drives the unmodified examples/voice-agent UI in a fresh, isolated browser
 * context and records client-side monotonic timings plus the verbatim server
 * messages. Product code is not modified.
 *
 * Usage:
 *   node tech/m0/run.mjs --mode verify
 *   node tech/m0/run.mjs --mode full --turns 20
 *   node tech/m0/run.mjs --mode full --turns 20 --url http://localhost:5173
 *
 * Output: tech/m0/runs/<runId>/{manifest.json,turns.jsonl,raw-events.jsonl,
 *         turns-final.json,console.log}
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const PLAYWRIGHT_PATH =
  process.env.M0_PLAYWRIGHT ||
  "/Users/samuelfleig/Projects/00_AKTUELL/claudeflareworkerhaus/node_modules/playwright";
const { chromium } = require(PLAYWRIGHT_PATH);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const CLONE =
  process.env.M0_CLONE ||
  path.join(process.env.HOME, "Projects/05_INBOX/cloudflare-agents");
const VOICE_APP = path.join(CLONE, "examples/voice-agent");

const VERIFY_PROMPT = {
  id: "verify-01",
  text: "Reply with exactly: verification-ok"
};

function parseArgs(argv) {
  const args = {
    mode: "verify",
    turns: null,
    url: "http://localhost:5173",
    llm: "deepseek",
    out: path.join(HERE, "runs"),
    runId: null,
    headful: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mode") args.mode = argv[++i];
    else if (a === "--turns") args.turns = Number(argv[++i]);
    else if (a === "--url") args.url = argv[++i];
    else if (a === "--llm") args.llm = argv[++i];
    else if (a === "--out") args.out = path.resolve(argv[++i]);
    else if (a === "--run-id") args.runId = argv[++i];
    else if (a === "--headful") args.headful = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        "usage: node run.mjs [--mode verify|full] [--turns N] [--url URL] [--llm deepseek|qwen] [--out DIR] [--run-id ID] [--headful]"
      );
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${a}`);
    }
  }
  if (!["verify", "full", "selftest"].includes(args.mode)) {
    throw new Error(`--mode must be verify, full or selftest, got ${args.mode}`);
  }
  return args;
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isoCompact() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function git(args) {
  try {
    return execFileSync("git", ["-C", CLONE, ...args], {
      encoding: "utf8"
    }).trimEnd();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

function resolveModel(serverSource, llmParam) {
  const match = serverSource.match(/const llmModel\s*=\s*([\s\S]*?);/);
  if (!match) {
    return { resolvedModelId: null, modelExpression: null, modelIds: [] };
  }
  const expression = match[1].replace(/\s+/g, " ").trim();
  const ids = Array.from(expression.matchAll(/@cf\/[A-Za-z0-9._/-]+/g)).map(
    (m) => m[0]
  );
  const resolvedModelId =
    llmParam === "qwen" ? ids[0] ?? null : ids[1] ?? ids[0] ?? null;
  return { resolvedModelId, modelExpression: expression, modelIds: ids };
}

function listDoStores() {
  const dir = path.join(VOICE_APP, ".wrangler/state/v3/do/voice-agent-MyVoiceAgent");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".sqlite"))
      .sort()
      .map((f) => {
        const st = fs.statSync(path.join(dir, f));
        return { file: f, size: st.size, mtime: st.mtime.toISOString() };
      });
  } catch {
    return [];
  }
}

function devServerPids() {
  try {
    return execFileSync("lsof", ["-nP", "-iTCP:5173", "-sTCP:LISTEN", "-t"], {
      encoding: "utf8"
    })
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const promptsFile = path.join(HERE, "prompts.json");
  const allPrompts = readJson(promptsFile);
  const prompts =
    args.mode === "verify"
      ? [VERIFY_PROMPT]
      : args.mode === "selftest"
        ? []
        : allPrompts.slice(0, args.turns ?? allPrompts.length);

  const runId =
    args.runId ||
    `m0-${args.mode}-${isoCompact()}-${crypto.randomBytes(2).toString("hex")}`;
  if (!/^[A-Za-z0-9._-]+$/.test(runId)) {
    throw new Error(`run id must be [A-Za-z0-9._-]+, got ${runId}`);
  }

  const outDir = path.join(args.out, runId);
  fs.mkdirSync(outDir, { recursive: true });
  const turnsFile = path.join(outDir, "turns.jsonl");
  const rawFile = path.join(outDir, "raw-events.jsonl");
  const consoleFile = path.join(outDir, "console.log");
  const manifestFile = path.join(outDir, "manifest.json");
  fs.writeFileSync(turnsFile, "");
  fs.writeFileSync(rawFile, "");

  const consoleStream = fs.createWriteStream(consoleFile, { flags: "a" });
  const log = (level, text) => {
    const line = `${new Date().toISOString()} ${level} ${text}`;
    console.log(line);
    consoleStream.write(line + "\n");
  };

  // --- Manifest facts (read-only, before any traffic) --------------------
  const serverTsPath = path.join(VOICE_APP, "src/server.ts");
  const serverTs = fs.readFileSync(serverTsPath);
  const model = resolveModel(serverTs.toString("utf8"), args.llm);
  const instrumentPath = path.join(HERE, "instrument.js");
  const instrumentSource = fs.readFileSync(instrumentPath, "utf8");
  const instrumentSha = sha256(Buffer.from(instrumentSource));
  const injectedInstrument = instrumentSource.replace(
    "__M0_RUN_ID__",
    runId
  );

  const deps = {};
  for (const dep of ["agents", "ai", "workers-ai-provider", "wrangler", "vite"]) {
    try {
      deps[dep] = readJson(
        path.join(VOICE_APP, "node_modules", dep, "package.json")
      ).version;
    } catch {
      deps[dep] = null;
    }
  }

  const doBefore = listDoStores();
  const serverPids = devServerPids();

  const manifest = {
    schema: "m0-latency-manifest/1",
    runId,
    mode: args.mode,
    createdAt: new Date().toISOString(),
    target: {
      url: args.url,
      llmQueryParam: args.llm,
      uiModelLabel:
        args.llm === "qwen" ? "Qwen" : "DeepSeek (label maps to glm)",
      clone: CLONE,
      voiceApp: VOICE_APP,
      gitHead: git(["rev-parse", "HEAD"]),
      gitStatusVoiceAgent: git([
        "status",
        "--porcelain",
        "--",
        "examples/voice-agent"
      ]),
      serverTsSha256: sha256(serverTs),
      serverTsDiff: git([
        "diff",
        "--",
        "examples/voice-agent/src/server.ts"
      ]),
      serverMapping: {
        expression: model.modelExpression,
        modelIds: model.modelIds,
        resolvedModelId: model.resolvedModelId,
        note:
          "Model ID is resolved from the served source mapping; the voice protocol does not echo a model ID at runtime."
      }
    },
    versions: {
      node: process.version,
      playwright: readJson(
        path.join(PLAYWRIGHT_PATH, "package.json")
      ).version,
      ...deps
    },
    instrumentation: {
      file: path.relative(REPO, instrumentPath),
      sha256: instrumentSha,
      version: 1,
      clock: "performance.now() (monotonic, one page)",
      serverClock: "Worker Date.now(), copied verbatim from turn_metrics"
    },
    isolation: {
      conversationId: runId,
      mechanism:
        "localStorage['voice-agent-session-id'] = runId before app load; one browser context, one page",
      devServerUrl: args.url,
      devServerPidsBefore: serverPids,
      devServerShared: true,
      durableObjectStoreFilesBefore: doBefore
    },
    measurement: {
      turnsPlanned: prompts.length,
      prompts: prompts.map((p) => p.id),
      primaryMetric: "t_first_visible_text - t_send (performance.now, ms)",
      secondaryMetrics: [
        "t_first_visible_text_dom - t_send",
        "first audio bytes received - t_send",
        "t_first_audible_audio - t_send"
      ],
      serverMetrics: [
        "turn_metrics.modelToFirstTextMs",
        "turn_metrics.turnTotalMs",
        "turn_metrics.outcome",
        "metrics.llm_ms/tts_ms/first_audio_ms/total_ms (when sent)"
      ],
      timeoutMsPerTurn: 20000
    },
    limits: [
      "Text path only. A voice call cannot start while STT startup fails, so no TTS audio is produced for these turns.",
      "t_first_visible_text is DOM text plus two animation frames; compositor paint is not observable from JS.",
      "Server timings use the Worker clock and are reported separately, never combined with client timings.",
      "p95 at n=20 is close to the maximum; the report states the estimator explicitly.",
      "The dev server on :5173 is shared with other sessions; only the Durable Object instance is isolated."
    ]
  };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");

  log("info", `run ${runId} mode=${args.mode} turns=${prompts.length}`);
  log("info", `resolved model: ${model.resolvedModelId}`);
  log("info", `server.ts sha256: ${manifest.target.serverTsSha256}`);

  const browser = await chromium.launch({
    channel: process.env.M0_BROWSER_CHANNEL || "chrome",
    headless: !args.headful
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US"
  });
  await context.addInitScript({ content: injectedInstrument });
  const page = await context.newPage();

  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[vite]")) return;
    log(`console.${msg.type()}`, text.slice(0, 2000));
  });
  page.on("pageerror", (error) => {
    log("pageerror", String(error).slice(0, 2000));
  });
  page.on("requestfailed", (request) => {
    log(
      "requestfailed",
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`
    );
  });

  const url = `${args.url.replace(/\/$/, "")}/?llm=${encodeURIComponent(args.llm)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForFunction(() => window.__M0 && window.__M0.env, null, {
    timeout: 15000
  });

  const sessionId = await page.evaluate(() =>
    localStorage.getItem("voice-agent-session-id")
  );
  manifest.isolation.sessionIdSeen = sessionId;
  manifest.versions.browser = browser.version();
  manifest.versions.chromeChannel = process.env.M0_BROWSER_CHANNEL || "chrome";
  manifest.environment = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory ?? null,
    timeOrigin: performance.timeOrigin
  }));

  if (sessionId !== runId) {
    await browser.close();
    consoleStream.end();
    throw new Error(
      `isolation failed: localStorage session ${sessionId} != ${runId}`
    );
  }

  if (args.mode === "selftest") {
    const result = await page.evaluate(async () => {
      const M = window.__M0;
      const before = M.records.length;
      const turn = M._selftestStartTurn("selftest");

      const node = document.createElement("div");
      node.className = "flex justify-start";
      node.textContent = "selftest visible text";
      document.body.appendChild(node);
      await new Promise((resolve) => setTimeout(resolve, 120));
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      const visible = {
        dom_mutation_recorded: turn.t_first_visible_text_dom !== null,
        frame_recorded: turn.t_first_visible_text !== null,
        sample: turn.t_first_visible_text_sample
      };

      let audio = {
        source_started: false,
        audible_recorded: false,
        error: null
      };
      try {
        const ctx = new AudioContext();
        const buffer = ctx.createBuffer(1, 800, 16000);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.start();
        await new Promise((resolve) => setTimeout(resolve, 80));
        audio.source_started = true;
        audio.audible_recorded = turn.t_first_audible_audio !== null;
        await ctx.close();
      } catch (error) {
        audio.error = String(error);
      }

      M._selftestCloseTurn(turn, "completed");
      node.remove();
      await new Promise((resolve) => setTimeout(resolve, 50));

      return {
        visible,
        audio,
        turn,
        events: M.records.slice(before)
      };
    });

    const passed =
      result.visible.dom_mutation_recorded &&
      result.visible.frame_recorded &&
      result.audio.source_started &&
      result.audio.audible_recorded;

    fs.writeFileSync(
      path.join(outDir, "selftest.json"),
      JSON.stringify({ passed, ...result }, null, 2) + "\n"
    );
    fs.writeFileSync(
      rawFile,
      result.events.map((e) => JSON.stringify(e)).join("\n") + "\n"
    );

    manifest.run = {
      finishedAt: new Date().toISOString(),
      selftestPassed: passed,
      note:
        "Instrumentation self-test only: synthetic DOM node and synthetic audio buffer, no model request."
    };
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
    log(
      "info",
      `selftest passed=${passed} visible=${JSON.stringify(result.visible)} audio=${JSON.stringify(result.audio)}`
    );
    await browser.close();
    consoleStream.end();
    if (!passed) process.exitCode = 5;
    return;
  }

  await page.waitForFunction(
    () => {
      const input = document.querySelector('form input');
      return Boolean(input && !input.disabled);
    },
    null,
    { timeout: 25000 }
  );
  log("info", `connected, isolated session ${sessionId}`);

  const input = page.locator("form input").first();
  const sendButton = page.locator('form button[type="submit"]').first();

  let cursor = 0;
  let attempted = 0;
  let aborted = null;

  for (let index = 0; index < prompts.length; index++) {
    const prompt = prompts[index];
    attempted += 1;

    try {
      await input.fill(prompt.text);
      await sendButton.click();
    } catch (error) {
      log("error", `turn ${index + 1}: send failed: ${error.message}`);
      aborted = "send_failed";
      break;
    }

    let timedOut = false;
    try {
      await page.waitForFunction(
        (i) =>
          window.__M0 &&
          window.__M0.turns[i] &&
          window.__M0.turns[i].closed === true,
        index,
        { timeout: 20000 }
      );
    } catch {
      timedOut = true;
      log("warn", `turn ${index + 1}: timeout waiting for turn_metrics`);
    }

    const snapshot = await page.evaluate(() => window.__M0.snapshot());
    const turn = snapshot.turns[index];
    if (!turn) {
      log("error", `turn ${index + 1}: no turn recorded`);
      aborted = "no_turn_recorded";
      break;
    }

    const record = {
      ...turn,
      index: index + 1,
      promptId: prompt.id,
      prompt: prompt.text,
      timeout: timedOut,
      e2e_first_visible_text_ms:
        turn.t_first_visible_text !== null
          ? round(turn.t_first_visible_text - turn.t_send)
          : null,
      e2e_first_visible_text_dom_ms:
        turn.t_first_visible_text_dom !== null
          ? round(turn.t_first_visible_text_dom - turn.t_send)
          : null,
      e2e_first_audio_bytes_ms:
        turn.t_first_audio_bytes !== null
          ? round(turn.t_first_audio_bytes - turn.t_send)
          : null,
      e2e_first_audible_audio_ms:
        turn.t_first_audible_audio !== null
          ? round(turn.t_first_audible_audio - turn.t_send)
          : null,
      visible_text: turn.server?.final_text ?? turn.t_first_visible_text_sample,
      recordedAt: new Date().toISOString()
    };
    fs.appendFileSync(turnsFile, JSON.stringify(record) + "\n");

    const events = await page.evaluate(
      (c) => window.__M0.eventsSince(c),
      cursor
    );
    if (events.length > 0) {
      fs.appendFileSync(
        rawFile,
        events.map((e) => JSON.stringify(e)).join("\n") + "\n"
      );
      cursor += events.length;
    }

    log(
      "info",
      `turn ${index + 1}/${prompts.length} e2e=${record.e2e_first_visible_text_ms}ms ` +
        `server_model_to_first_text=${turn.server?.turn_metrics?.modelToFirstTextMs ?? "n/a"}ms ` +
        `outcome=${turn.server?.turn_metrics?.outcome ?? turn.outcome ?? "n/a"} ` +
        `audio=${record.e2e_first_audible_audio_ms ?? "none"}`
    );

    if (timedOut) {
      const stillOpen = await page.evaluate(
        (i) => window.__M0.turns[i] && !window.__M0.turns[i].closed,
        index
      );
      if (stillOpen) {
        aborted = "turn_never_closed";
        log("error", "turn never closed; aborting run");
        break;
      }
    }

    if (
      /4006|daily free allocation|used up your daily free/i.test(
        turn.error?.message ?? ""
      )
    ) {
      aborted = "quota_exhausted";
      log(
        "error",
        "Workers AI daily free allocation exhausted; aborting before further turns"
      );
      break;
    }

    await page.waitForTimeout(350);
  }

  const finalSnapshot = await page.evaluate(() => window.__M0.snapshot());
  fs.writeFileSync(
    path.join(outDir, "turns-final.json"),
    JSON.stringify(finalSnapshot, null, 2) + "\n"
  );
  const remaining = await page.evaluate((c) => window.__M0.eventsSince(c), cursor);
  if (remaining.length > 0) {
    fs.appendFileSync(
      rawFile,
      remaining.map((e) => JSON.stringify(e)).join("\n") + "\n"
    );
    cursor += remaining.length;
  }

  manifest.run = {
    finishedAt: new Date().toISOString(),
    attemptedTurns: attempted,
    completedTurns: finalSnapshot.turns.filter((t) => t.closed).length,
    aborted,
    rawEventCount: cursor,
    doStoreFilesAfter: listDoStores(),
    devServerPidsAfter: devServerPids()
  };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");

  log(
    "info",
    `done: attempted=${attempted} recorded=${finalSnapshot.turns.length} aborted=${aborted ?? "no"}`
  );
  log("info", `output: ${outDir}`);

  await browser.close();
  consoleStream.end();

  if (finalSnapshot.turns.length === 0) process.exitCode = 2;
  if (aborted) process.exitCode = 3;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
