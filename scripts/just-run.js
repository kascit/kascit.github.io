#!/usr/bin/env node
"use strict";

const { spawn } = require("child_process");

const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31;1m",
};

function supportsColor() {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stdout.isTTY);
}

function logError(message) {
  const prefix = supportsColor() ? `${ANSI.red}[ERR ]${ANSI.reset}` : "[ERR]";
  process.stderr.write(`${prefix} ${message}\n`);
}

function usageAndExit() {
  logError("Usage: node scripts/just-run.js <label> -- <command> [args...]");
  process.exit(2);
}

const argv = process.argv.slice(2);
const delimiterIndex = argv.indexOf("--");
if (delimiterIndex <= 0) usageAndExit();

const label = String(argv[0] || "step").trim() || "step";
const commandTokens = argv.slice(delimiterIndex + 1);
if (commandTokens.length === 0) usageAndExit();

const command = commandTokens[0];
const args = commandTokens.slice(1);

const child = spawn(command, args, {
  stdio: "inherit",
  shell: false,
});

child.on("error", (err) => {
  logError(`${label} failed to start: ${err.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (code === 0) {
    process.exit(0);
    return;
  }

  if (signal) {
    logError(`${label} failed: terminated by signal ${signal}`);
    process.exit(1);
    return;
  }

  logError(`${label} failed (exit ${code})`);
  process.exit(code || 1);
});
