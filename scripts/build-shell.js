#!/usr/bin/env node
"use strict";

const { createPackageRunner, requireEnvVar } = require("./lib/shared");

const esbuildVersion = requireEnvVar("ESBUILD_VERSION");
const inputPath = "static/js/core/shell.js";
const outputPath = "static/js/shell.min.js";

function main() {
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
    console.log("✅ Shell bundle built successfully.");
  } catch {
    console.error("❌ Build failed");
    process.exit(1);
  }
}

main();
