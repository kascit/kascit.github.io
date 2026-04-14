#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const { createPackageRunner, requireEnvVar, ROOT } = require("./lib/shared");

const ESLINT_VERSION = requireEnvVar("ESLINT_VERSION");
const STYLELINT_VERSION = requireEnvVar("STYLELINT_VERSION");

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
    shell: true,
  });

  if (typeof result.status !== "number" || result.status !== 0) {
    const code = typeof result.status === "number" ? result.status : 1;
    process.exit(code);
  }
}

function main() {
  const { runPkg } = createPackageRunner();

  runPkg(
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
      "static/js/offline-reload.js",
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
      "static/js/offline-reload.js",
    ],
    "Lint JavaScript"
  );

  runPkg(
    [
      "dlx",
      `stylelint@${STYLELINT_VERSION}`,
      "--config",
      ".stylelintrc.json",
      "src/**/*.css",
    ],
    [
      "--yes",
      `stylelint@${STYLELINT_VERSION}`,
      "--config",
      ".stylelintrc.json",
      "src/**/*.css",
    ],
    "Lint CSS"
  );

  run("node", ["scripts/validate-xml-xsl.js"], "Validate XML/XSL");

  run("zola", ["check"], "Validate Tera templates (zola check)");

  log("ok", "All quality checks passed.");
}

main();
