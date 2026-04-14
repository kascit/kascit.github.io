#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { resolveImageMagickCommand, runCapture, collectFiles, prettyBytes, ROOT } = require("./lib/shared");

const outputDirArg = process.argv[2] || "public";
const outputDir = path.resolve(ROOT, outputDirArg);

const OPTIMIZERS = {
  ".jpg": {
    args: ["-strip", "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "86"],
    minGainBytes: 128,
  },
  ".jpeg": {
    args: ["-strip", "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "86"],
    minGainBytes: 128,
  },
  ".png": {
    args: [
      "-strip",
      "-define",
      "png:compression-level=9",
      "-define",
      "png:compression-strategy=1",
      "-define",
      "png:exclude-chunk=all",
    ],
    minGainBytes: 64,
  },
  ".webp": {
    args: ["-strip", "-define", "webp:method=6", "-quality", "84"],
    minGainBytes: 128,
  },
  ".gif": {
    args: ["-strip"],
    minGainBytes: 64,
  },
};

function isOptimizableImage(_abs, entry) {
  const ext = path.extname(entry.name).toLowerCase();
  return Object.prototype.hasOwnProperty.call(OPTIMIZERS, ext);
}

function optimizeFile(filePath, command) {
  const ext = path.extname(filePath).toLowerCase();
  const optimizer = OPTIMIZERS[ext];
  if (!optimizer) {
    return { status: "skipped", savedBytes: 0 };
  }

  const beforeSize = fs.statSync(filePath).size;
  if (beforeSize <= 0) {
    return { status: "skipped", savedBytes: 0 };
  }

  const tempPath = `${filePath}.opt-tmp`;
  const args = [filePath, ...optimizer.args, tempPath];

  const result = runCapture(command, args);
  if (result.status !== 0 || !fs.existsSync(tempPath)) {
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { force: true });
    }
    return {
      status: "failed",
      savedBytes: 0,
      error: (result.stderr || result.stdout || "ImageMagick optimize failed").trim(),
    };
  }

  const afterSize = fs.statSync(tempPath).size;
  const gain = beforeSize - afterSize;

  if (gain >= optimizer.minGainBytes) {
    fs.renameSync(tempPath, filePath);
    return { status: "optimized", savedBytes: gain };
  }

  fs.rmSync(tempPath, { force: true });
  return { status: "unchanged", savedBytes: 0 };
}

function main() {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(`ERROR: Output directory '${outputDirArg}' does not exist.`);
    process.exit(1);
  }

  const command = resolveImageMagickCommand();
  if (!command) {
    console.log("Image optimization skipped: ImageMagick is not installed (magick/convert not found).");
    return;
  }

  const files = collectFiles(outputDir, isOptimizableImage);
  if (files.length === 0) {
    console.log(`No raster image files found under '${outputDirArg}'.`);
    return;
  }

  let optimized = 0;
  let failed = 0;
  let unchanged = 0;
  let totalSaved = 0;

  for (const filePath of files) {
    const result = optimizeFile(filePath, command);
    if (result.status === "optimized") {
      optimized += 1;
      totalSaved += result.savedBytes;
      continue;
    }
    if (result.status === "failed") {
      failed += 1;
      const rel = path.relative(outputDir, filePath).split(path.sep).join("/");
      console.warn(`WARN: optimize failed for ${rel}: ${result.error}`);
      continue;
    }
    unchanged += 1;
  }

  console.log(
    `Optimized ${optimized}/${files.length} image files (${unchanged} unchanged, ${failed} failed), saved ${prettyBytes(totalSaved)}.`
  );
}

main();
