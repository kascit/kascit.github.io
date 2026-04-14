#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

// ---------------------------------------------------------------------------
// ANSI helpers (shared with just-log.js)
// ---------------------------------------------------------------------------

const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31;1m",
};

function supportsColor() {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stdout.isTTY);
}

// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------

function runCapture(command, args, cwd) {
  return spawnSync(command, args, {
    cwd: cwd || ROOT,
    stdio: "pipe",
    shell: false,
    encoding: "utf8",
  });
}

function runInherit(command, args, label, opts) {
  if (label) console.log(label);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: Boolean(opts && opts.shell),
  });
  if (typeof result.status !== "number" || result.status !== 0) {
    process.exit(typeof result.status === "number" ? result.status : 1);
  }
}

function canRun(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "ignore",
    shell: true,
  });
  return result.status === 0;
}

// ---------------------------------------------------------------------------
// ImageMagick helpers
// ---------------------------------------------------------------------------

function resolveImageMagickCommand() {
  const magick = runCapture("magick", ["-version"]);
  if (magick.status === 0) return "magick";

  const convert = runCapture("convert", ["-version"]);
  if (convert.status === 0) return "convert";

  return "";
}

function runMagick(command, args) {
  const result = runCapture(command, args);
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "ImageMagick command failed").trim());
  }
}

// ---------------------------------------------------------------------------
// Package runner (pnpm / npx fallback)
// ---------------------------------------------------------------------------

function requireEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    process.stderr.write(`ERROR: Required environment variable ${name} is not set.\n`);
    process.stderr.write("Ensure versions.env is loaded (run via 'just' or 'source versions.env').\n");
    process.exit(1);
  }
  return value;
}

function createPackageRunner() {
  const pnpmVersion = requireEnvVar("PNPM_VERSION");
  let runner = "pnpm";

  if (canRun("pnpm", ["--version"])) {
    return { runner: "pnpm", run: makeRunFn("pnpm"), runPkg: makeRunPkgFn("pnpm") };
  }

  if (canRun("corepack", ["--version"])) {
    runInherit("corepack", ["enable"], undefined, { shell: true });
    runInherit("corepack", ["prepare", `pnpm@${pnpmVersion}`, "--activate"], undefined, { shell: true });
    if (canRun("pnpm", ["--version"])) {
      return { runner: "pnpm", run: makeRunFn("pnpm"), runPkg: makeRunPkgFn("pnpm") };
    }
  }

  if (!canRun("npx", ["--version"])) {
    process.stderr.write("ERROR: neither pnpm/corepack nor npx is available.\n");
    process.exit(1);
  }

  runner = "npx";
  const prefix = supportsColor() ? `${ANSI.red}[WARN]${ANSI.reset}` : "[WARN]";
  process.stderr.write(`${prefix} pnpm unavailable locally; falling back to npx.\n`);
  return { runner: "npx", run: makeRunFn("npx"), runPkg: makeRunPkgFn("npx") };
}

function makeRunFn(runner) {
  return function run(command, args, label) {
    runInherit(command, args, label, { shell: true });
  };
}

function makeRunPkgFn(runner) {
  return function runPkg(pnpmArgs, npxArgs, label) {
    if (runner === "pnpm") {
      runInherit("pnpm", pnpmArgs, label, { shell: true });
    } else {
      runInherit("npx", npxArgs, label, { shell: true });
    }
  };
}

// ---------------------------------------------------------------------------
// File system helpers
// ---------------------------------------------------------------------------

function collectFiles(rootDir, filterFn) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      if (filterFn && !filterFn(abs, entry)) continue;
      files.push(abs);
    }
  }

  return files;
}

function toPosixRel(absPath, root) {
  return path.relative(root || ROOT, absPath).split(path.sep).join("/");
}

// ---------------------------------------------------------------------------
// TOML helpers
// ---------------------------------------------------------------------------

function tomlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function tomlArray(values) {
  if (!Array.isArray(values) || values.length === 0) return "[]";
  return `[${values.map((v) => tomlString(v)).join(", ")}]`;
}

function compactUnique(values) {
  const out = [];
  const seen = new Set();

  for (const value of values || []) {
    const trimmed = String(value || "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

function prettyBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

module.exports = {
  ROOT,
  ANSI,
  supportsColor,
  runCapture,
  runInherit,
  canRun,
  resolveImageMagickCommand,
  runMagick,
  requireEnvVar,
  createPackageRunner,
  collectFiles,
  toPosixRel,
  tomlString,
  tomlArray,
  compactUnique,
  prettyBytes,
};
