#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { createPackageRunner, requireEnvVar } = require("./lib/shared");

const esbuildVersion = requireEnvVar("ESBUILD_VERSION");
const inputPath = "static/js/core/shell.js";
const outputPath = "static/js/shell.min.js";

function syncCanonicalShellTemplate() {
  const templatePath = path.resolve(__dirname, "../templates/shell-chrome.html");
  const generatedTemplatePath = path.resolve(__dirname, "../static/js/core/shell-template.js");

  if (fs.existsSync(templatePath)) {
    const rawHtml = fs.readFileSync(templatePath, "utf8");
    const sanitizedHtml = rawHtml.replace(/`/g, "\\`").replace(/\${/g, "\\${");
    const fileContent = `// AUTO-GENERATED from templates/shell-chrome.html — DO NOT EDIT MANUALLY\nexport const CANONICAL_SHELL_HTML = \`${sanitizedHtml}\`;\n`;
    fs.writeFileSync(generatedTemplatePath, fileContent, "utf8");
    console.log("✅ Synced CANONICAL_SHELL_HTML from templates/shell-chrome.html");
  }
}

function main() {
  syncCanonicalShellTemplate();

  const { runPkg } = createPackageRunner();

  console.log(
    `Bundling ${inputPath} to ${outputPath} with esbuild@${esbuildVersion}...`,
  );

  const pnpmArgs = [
    "dlx",
    `esbuild@${esbuildVersion}`,
    inputPath,
    "--bundle",
    "--format=iife",
    "--target=es2020",
    "--minify",
    "--allow-overwrite",
    `--outfile=${outputPath}`,
  ];

  const npxArgs = [
    "--yes",
    `esbuild@${esbuildVersion}`,
    inputPath,
    "--bundle",
    "--format=iife",
    "--target=es2020",
    "--minify",
    "--allow-overwrite",
    `--outfile=${outputPath}`,
  ];

  try {
    runPkg(pnpmArgs, npxArgs);
    fs.copyFileSync(outputPath, "static/js/shell.js");
    console.log("✅ Shell bundle built successfully (shell.min.js and shell.js).");
  } catch {
    console.error("❌ Build failed");
    process.exit(1);
  }
}

main();
