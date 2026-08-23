#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  createPackageRunner,
  requireEnvVar,
  collectFiles,
  ROOT,
} = require("./lib/shared");

const outputDirLabel = "public";
const outputDir = path.resolve(ROOT, "public");
const terserVersion = requireEnvVar("TERSER_VERSION");
const esbuildVersion = requireEnvVar("ESBUILD_VERSION");

function listJsFiles(dir) {
  return collectFiles(dir, (_abs, entry) => {
    if (!entry.name.endsWith(".js")) return false;
    if (entry.name.endsWith(".min.js")) return false;
    return true;
  });
}

const { spawn } = require("child_process");
const os = require("os");

const IS_WIN = process.platform === "win32";
const CONCURRENCY = Math.max(2, Math.min(16, os.cpus() ? os.cpus().length : 4));

async function runPool(items, concurrency, fn) {
  const executing = new Set();
  const results = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

function runTerserFile(runner, terserVersion, relFile, isModule) {
  return new Promise((resolve, reject) => {
    const cmd = runner === "pnpm" ? "pnpm" : "npx";
    const args =
      runner === "pnpm"
        ? [
            "dlx",
            `terser@${terserVersion}`,
            relFile,
            "--compress",
            "--mangle",
            "--ecma",
            "2020",
            "-o",
            relFile,
          ]
        : [
            "--yes",
            `terser@${terserVersion}`,
            relFile,
            "--compress",
            "--mangle",
            "--ecma",
            "2020",
            "-o",
            relFile,
          ];
    if (isModule) {
      args.splice(runner === "pnpm" ? 4 : 3, 0, "--module");
    }
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "ignore",
      shell: IS_WIN,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Terser failed on ${relFile} (exit ${code})`));
    });
    child.on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(
      `ERROR: Output directory '${outputDirLabel}' does not exist.`,
    );
    process.exit(1);
  }

  const jsDir = path.join(outputDir, "js");
  if (!fs.existsSync(jsDir) || !fs.statSync(jsDir).isDirectory()) {
    console.log(
      `No ${outputDirLabel}/js directory found. Skipping JS minification.`,
    );
    return;
  }

  const { runner, runPkg } = createPackageRunner();

  console.log(`Optimizing JavaScript in '${outputDirLabel}'...`);

  const mainEntry = path.join(jsDir, "core", "main.js");
  if (fs.existsSync(mainEntry)) {
    console.log(
      `Bundling ${outputDirLabel}/js/core/main.js with esbuild@${esbuildVersion}...`,
    );
    runPkg(
      [
        "dlx",
        `esbuild@${esbuildVersion}`,
        `${outputDirLabel}/js/core/main.js`,
        "--bundle",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--allow-overwrite",
        `--outfile=${outputDirLabel}/js/core/main.js`,
      ],
      [
        "--yes",
        `esbuild@${esbuildVersion}`,
        `${outputDirLabel}/js/core/main.js`,
        "--bundle",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--allow-overwrite",
        `--outfile=${outputDirLabel}/js/core/main.js`,
      ],
    );
  }

  console.log(
    `Minifying remaining JavaScript with terser@${terserVersion} (${CONCURRENCY} parallel workers)...`,
  );

  const files = listJsFiles(jsDir);
  const normalizedMain = path.normalize(mainEntry);
  const tasks = [];

  for (const file of files) {
    const normalizedFile = path.normalize(file);
    if (normalizedFile === normalizedMain) continue;
    const rel = path.relative(outputDir, file).split(path.sep).join("/");
    const isModule = !rel.startsWith("js/vendor/");
    const relFile = path.relative(ROOT, file).split(path.sep).join("/");
    tasks.push({ relFile, isModule });
  }

  const swFile = path.join(outputDir, "sw.js");
  if (fs.existsSync(swFile) && fs.statSync(swFile).isFile()) {
    const relSwFile = path.relative(ROOT, swFile).split(path.sep).join("/");
    tasks.push({ relFile: relSwFile, isModule: true });
  }

  if (tasks.length > 0) {
    await runPool(tasks, CONCURRENCY, ({ relFile, isModule }) =>
      runTerserFile(runner, terserVersion, relFile, isModule),
    );
  }

  console.log(`Minified ${tasks.length} JavaScript file(s) in parallel.`);
}

main().catch((err) => {
  console.error("JS Minification error:", err);
  process.exit(1);
});
