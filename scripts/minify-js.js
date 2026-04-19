#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { createPackageRunner, requireEnvVar, collectFiles, ROOT } = require("./lib/shared");

const outputDirArg = process.argv[2] || "public";
const outputDir = path.resolve(ROOT, outputDirArg);
const terserVersion = requireEnvVar("TERSER_VERSION");
const esbuildVersion = requireEnvVar("ESBUILD_VERSION");

function listJsFiles(dir) {
  return collectFiles(dir, (_abs, entry) => {
    if (!entry.name.endsWith(".js")) return false;
    if (entry.name.endsWith(".min.js")) return false;
    return true;
  });
}

function main() {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(`ERROR: Output directory '${outputDirArg}' does not exist.`);
    process.exit(1);
  }

  const jsDir = path.join(outputDir, "js");
  if (!fs.existsSync(jsDir) || !fs.statSync(jsDir).isDirectory()) {
    console.log(`No ${outputDirArg}/js directory found. Skipping JS minification.`);
    return;
  }

  const { runPkg } = createPackageRunner();

  console.log(`Optimizing JavaScript in '${outputDirArg}'...`);

  const mainEntry = path.join(jsDir, "core", "main.js");
  if (fs.existsSync(mainEntry)) {
    console.log(`Bundling ${outputDirArg}/js/core/main.js with esbuild@${esbuildVersion}...`);
    runPkg(
      [
        "dlx",
        `esbuild@${esbuildVersion}`,
        `${outputDirArg}/js/core/main.js`,
        "--bundle",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--allow-overwrite",
        `--outfile=${outputDirArg}/js/core/main.js`,
      ],
      [
        "--yes",
        `esbuild@${esbuildVersion}`,
        `${outputDirArg}/js/core/main.js`,
        "--bundle",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--allow-overwrite",
        `--outfile=${outputDirArg}/js/core/main.js`,
      ]
    );
  }

  console.log(`Minifying remaining JavaScript with terser@${terserVersion}...`);

  let minifiedCount = 0;
  const files = listJsFiles(jsDir);
  const normalizedMain = path.normalize(mainEntry);

  for (const file of files) {
    const normalizedFile = path.normalize(file);
    if (normalizedFile === normalizedMain) continue;

    const rel = path.relative(outputDir, file).split(path.sep).join("/");
    const isModule = !rel.startsWith("js/vendor/");

    const pnpmArgs = [
      "dlx",
      `terser@${terserVersion}`,
      file,
      "--compress",
      "--mangle",
      "--ecma",
      "2020",
      "-o",
      file,
    ];
    const npxArgs = [
      "--yes",
      `terser@${terserVersion}`,
      file,
      "--compress",
      "--mangle",
      "--ecma",
      "2020",
      "-o",
      file,
    ];

    if (isModule) {
      pnpmArgs.splice(5, 0, "--module");
      npxArgs.splice(5, 0, "--module");
    }

    runPkg(pnpmArgs, npxArgs);
    minifiedCount += 1;
  }

  const swFile = path.join(outputDir, "sw.js");
  if (fs.existsSync(swFile) && fs.statSync(swFile).isFile()) {
    runPkg(
      [
        "dlx",
        `terser@${terserVersion}`,
        swFile,
        "--compress",
        "--mangle",
        "--ecma",
        "2020",
        "-o",
        swFile,
      ],
      [
        "--yes",
        `terser@${terserVersion}`,
        swFile,
        "--compress",
        "--mangle",
        "--ecma",
        "2020",
        "-o",
        swFile,
      ]
    );
    minifiedCount += 1;
  }

  console.log(`Minified ${minifiedCount} JavaScript file(s).`);
}

main();
