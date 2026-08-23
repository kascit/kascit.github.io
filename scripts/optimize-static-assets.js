#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  resolveImageMagickCommand,
  runCapture,
  collectFiles,
  prettyBytes,
  ROOT,
} = require("./lib/shared");

const outputDirLabel = process.argv[2] || "public";
const outputDir = path.resolve(ROOT, outputDirLabel);

const OPTIMIZERS = {
  ".jpg": {
    args: [
      "-resize",
      "1920x1920>",
      "-strip",
      "-sampling-factor",
      "4:2:0",
      "-interlace",
      "Plane",
      "-quality",
      "84",
    ],
    minGainBytes: 128,
  },
  ".jpeg": {
    args: [
      "-resize",
      "1920x1920>",
      "-strip",
      "-sampling-factor",
      "4:2:0",
      "-interlace",
      "Plane",
      "-quality",
      "84",
    ],
    minGainBytes: 128,
  },
  ".png": {
    args: [
      "-resize",
      "1920x1920>",
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

const os = require("os");
const { spawn } = require("child_process");

const CONCURRENCY = Math.max(2, Math.min(16, os.cpus() ? os.cpus().length : 4));
const GENERATED_RESPONSIVE_RE = /-(?:240|320|360|480|640|768|800|1024|1200|1280|1600|1920|2560|fallback)\.(?:webp|jpe?g)$/i;

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

function isOptimizableImage(_abs, entry) {
  const name = entry.name;
  if (GENERATED_RESPONSIVE_RE.test(name)) return false;
  const ext = path.extname(name).toLowerCase();
  return Object.prototype.hasOwnProperty.call(OPTIMIZERS, ext);
}

function optimizeFileAsync(filePath, command) {
  return new Promise((resolve) => {
    const ext = path.extname(filePath).toLowerCase();
    const optimizer = OPTIMIZERS[ext];
    if (!optimizer) {
      return resolve({ status: "skipped", savedBytes: 0 });
    }

    let beforeSize = 0;
    try {
      beforeSize = fs.statSync(filePath).size;
    } catch {
      return resolve({ status: "skipped", savedBytes: 0 });
    }
    if (beforeSize <= 0) {
      return resolve({ status: "skipped", savedBytes: 0 });
    }

    const tempPath = `${filePath}.opt-tmp`;
    const args = [filePath, ...optimizer.args, tempPath];

    const child = spawn(command, args, {
      stdio: "ignore",
      shell: false,
    });

    child.on("close", (code) => {
      if (code !== 0 || !fs.existsSync(tempPath)) {
        if (fs.existsSync(tempPath)) {
          fs.rmSync(tempPath, { force: true });
        }
        return resolve({
          status: "failed",
          savedBytes: 0,
          error: `ImageMagick exited with code ${code}`,
        });
      }

      const afterSize = fs.statSync(tempPath).size;
      const gain = beforeSize - afterSize;

      if (gain >= optimizer.minGainBytes) {
        fs.renameSync(tempPath, filePath);
        return resolve({ status: "optimized", savedBytes: gain });
      }

      fs.rmSync(tempPath, { force: true });
      return resolve({ status: "unchanged", savedBytes: 0 });
    });

    child.on("error", (err) => {
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { force: true });
      }
      return resolve({
        status: "failed",
        savedBytes: 0,
        error: err.message,
      });
    });
  });
}

async function main() {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(
      `ERROR: Output directory '${outputDirLabel}' does not exist.`,
    );
    process.exit(1);
  }

  const command = resolveImageMagickCommand();
  if (!command) {
    console.log(
      "Image optimization skipped: ImageMagick is not installed (magick/convert not found).",
    );
    return;
  }

  const files = collectFiles(outputDir, isOptimizableImage);
  if (files.length === 0) {
    console.log(`No raster image files found under '${outputDirLabel}'.`);
    return;
  }

  console.log(
    `Optimizing ${files.length} static raster images with ${CONCURRENCY} parallel workers...`,
  );

  let optimized = 0;
  let failed = 0;
  let unchanged = 0;
  let totalSaved = 0;

  const results = await runPool(files, CONCURRENCY, async (filePath) => {
    const result = await optimizeFileAsync(filePath, command);
    return { filePath, result };
  });

  for (const { filePath, result } of results) {
    if (result.status === "optimized") {
      optimized += 1;
      totalSaved += result.savedBytes;
    } else if (result.status === "failed") {
      failed += 1;
      const rel = path.relative(outputDir, filePath).split(path.sep).join("/");
      console.warn(`WARN: optimize failed for ${rel}: ${result.error}`);
    } else {
      unchanged += 1;
    }
  }

  console.log(
    `Optimized ${optimized}/${files.length} image files (${unchanged} unchanged, ${failed} failed), saved ${prettyBytes(totalSaved)}.`,
  );
}

main().catch((err) => {
  console.error("Static asset optimization error:", err);
  process.exit(1);
});
