#!/usr/bin/env node
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

const PNPM_VERSION = process.env.PNPM_VERSION || "10.8.0";
const ESLINT_VERSION = process.env.ESLINT_VERSION || "9.38.0";
const STYLELINT_VERSION = process.env.STYLELINT_VERSION || "16.10.0";

let packageRunner = "pnpm";

function log(level, message) {
  const result = spawnSync("node", ["scripts/just-log.js", level, message], {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
  });

  if (typeof result.status !== "number" || result.status !== 0) {
    const code = typeof result.status === "number" ? result.status : 1;
    process.exit(code);
  }
}

function run(command, args, label) {
  log("info", label);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true
  });

  if (typeof result.status !== "number" || result.status !== 0) {
    const code = typeof result.status === "number" ? result.status : 1;
    process.exit(code);
  }
}

function canRun(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "ignore",
    shell: true
  });

  return result.status === 0;
}

function ensurePnpm() {
  if (canRun("pnpm", ["--version"])) {
    packageRunner = "pnpm";
    return;
  }

  if (canRun("corepack", ["--version"])) {
    run("corepack", ["enable"], "Enable Corepack");
    run("corepack", ["prepare", `pnpm@${PNPM_VERSION}`, "--activate"], "Activate pnpm version");

    if (canRun("pnpm", ["--version"])) {
      packageRunner = "pnpm";
      return;
    }
  }

  if (!canRun("npx", ["--version"])) {
    log("error", "Neither pnpm/corepack nor npx is available.");
    process.exit(1);
  }

  packageRunner = "npx";
  log("warn", "pnpm unavailable locally; falling back to npx.");
}

function runPackageCommand(pnpmArgs, npxArgs, label) {
  if (packageRunner === "pnpm") {
    run("pnpm", pnpmArgs, label);
    return;
  }

  run("npx", npxArgs, label);
}

function main() {
  ensurePnpm();

  runPackageCommand(
    [
      "dlx",
      `eslint@${ESLINT_VERSION}`,
      "--max-warnings=0",
      "--config",
      "eslint.config.mjs",
      "scripts",
      "static/js/modules",
      "static/js/main.js",
      "static/js/boot.js",
      "static/js/search-loader.js",
      "static/js/notify-banner.js",
      "static/js/offline-reload.js"
    ],
    [
      "--yes",
      `eslint@${ESLINT_VERSION}`,
      "--max-warnings=0",
      "--config",
      "eslint.config.mjs",
      "scripts",
      "static/js/modules",
      "static/js/main.js",
      "static/js/boot.js",
      "static/js/search-loader.js",
      "static/js/notify-banner.js",
      "static/js/offline-reload.js"
    ],
    "Lint JavaScript"
  );

  runPackageCommand(
    [
      "dlx",
      `stylelint@${STYLELINT_VERSION}`,
      "--config",
      ".stylelintrc.json",
      "src/**/*.css"
    ],
    [
      "--yes",
      `stylelint@${STYLELINT_VERSION}`,
      "--config",
      ".stylelintrc.json",
      "src/**/*.css"
    ],
    "Lint CSS"
  );

  run("node", ["scripts/validate-xml-xsl.js"], "Validate XML/XSL");

  run("zola", ["check"], "Validate Tera templates (zola check)");

  log("ok", "All quality checks passed.");
}

main();
