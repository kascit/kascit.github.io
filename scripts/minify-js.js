#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const outputDirArg = process.argv[2] || "public";
const outputDir = path.resolve(ROOT, outputDirArg);
const terserVersion = process.env.TERSER_VERSION || "5.31.6";
const esbuildVersion = process.env.ESBUILD_VERSION || "0.24.2";
const pnpmVersion = process.env.PNPM_VERSION || "10.8.0";

let packageRunner = "pnpm";

function run(command, args, label) {
  if (label) console.log(label);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
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

function ensurePackageRunner() {
  if (canRun("pnpm", ["--version"])) {
    packageRunner = "pnpm";
    return;
  }

  if (canRun("corepack", ["--version"])) {
    run("corepack", ["enable"]);
    run("corepack", ["prepare", `pnpm@${pnpmVersion}`, "--activate"]);
    if (canRun("pnpm", ["--version"])) {
      packageRunner = "pnpm";
      return;
    }
  }

  if (!canRun("npx", ["--version"])) {
    console.error("ERROR: neither pnpm/corepack nor npx is available for JS minification.");
    process.exit(1);
  }

  packageRunner = "npx";
}

function runPackageCommand(pnpmArgs, npxArgs) {
  if (packageRunner === "pnpm") {
    run("pnpm", pnpmArgs);
    return;
  }
  run("npx", npxArgs);
}

function listJsFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".js")) continue;
      if (entry.name.endsWith(".min.js")) continue;
      out.push(full);
    }
  }
  return out;
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

  ensurePackageRunner();

  console.log(`Optimizing JavaScript in '${outputDirArg}'...`);

  const mainEntry = path.join(jsDir, "main.js");
  if (fs.existsSync(mainEntry)) {
    console.log(`Bundling ${outputDirArg}/js/main.js with esbuild@${esbuildVersion}...`);
    runPackageCommand(
      [
        "dlx",
        `esbuild@${esbuildVersion}`,
        `${outputDirArg}/js/main.js`,
        "--bundle",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--allow-overwrite",
        `--outfile=${outputDirArg}/js/main.js`,
      ],
      [
        "--yes",
        `esbuild@${esbuildVersion}`,
        `${outputDirArg}/js/main.js`,
        "--bundle",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--allow-overwrite",
        `--outfile=${outputDirArg}/js/main.js`,
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
    const isModule = rel.startsWith("js/modules/");

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

    runPackageCommand(pnpmArgs, npxArgs);
    minifiedCount += 1;
  }

  const swFile = path.join(outputDir, "sw.js");
  if (fs.existsSync(swFile) && fs.statSync(swFile).isFile()) {
    runPackageCommand(
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
