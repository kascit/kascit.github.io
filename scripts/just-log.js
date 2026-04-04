#!/usr/bin/env node
"use strict";

const ANSI = {
  reset: "\x1b[0m",
  blue: "\x1b[34;1m",
  green: "\x1b[32;1m",
  yellow: "\x1b[33;1m",
  red: "\x1b[31;1m",
  cyan: "\x1b[36;1m",
};

const LEVELS = {
  info: { label: "INFO", color: ANSI.blue },
  ok: { label: " OK ", color: ANSI.green },
  warn: { label: "WARN", color: ANSI.yellow },
  error: { label: "ERR ", color: ANSI.red },
  step: { label: "STEP", color: ANSI.cyan },
};

function supportsColor() {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stdout.isTTY);
}

function main() {
  const levelArg = String(process.argv[2] || "info").toLowerCase();
  const message = process.argv.slice(3).join(" ").trim();

  const level = LEVELS[levelArg] || LEVELS.info;
  const text = message || "";

  if (supportsColor()) {
    process.stdout.write(`${level.color}[${level.label}]${ANSI.reset} ${text}\n`);
    return;
  }

  process.stdout.write(`[${level.label.trim()}] ${text}\n`);
}

main();
