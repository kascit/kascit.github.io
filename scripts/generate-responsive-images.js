#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  resolveImageMagickCommand,
  runMagick,
  runCapture,
  collectFiles,
  toPosixRel,
  ROOT,
} = require("./lib/shared");

const sourceModeArg = (process.argv[2] || "static").trim().toLowerCase();
if (sourceModeArg !== "static" && sourceModeArg !== "public") {
  console.error("ERROR: Source mode must be 'static' or 'public'.");
  process.exit(1);
}

const sourceDir =
  sourceModeArg === "public"
    ? path.resolve(ROOT, "public")
    : path.resolve(ROOT, "static", "images");
const TARGET_WIDTHS = [240, 360, 480, 640, 768, 1024, 1280, 1600, 1920, 2560];

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
// Allow matching any old generated files to skip
const GENERATED_RE =
  /-(240|320|360|480|640|768|800|1024|1200|1280|1600|1920|2560|3840|fallback)\.(webp|jpe?g)$/i;

function isSourceImage(abs, entry) {
  const rel = toPosixRel(abs, sourceDir);
  if (
    rel.startsWith("icons/") ||
    rel.startsWith("favicon") ||
    entry.name.startsWith("favicon") ||
    entry.name.startsWith("icon-") ||
    entry.name.startsWith("apple-touch-icon")
  ) {
    return false;
  }
  const ext = path.extname(entry.name).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return false;
  if (GENERATED_RE.test(entry.name)) return false;
  return true;
}

const os = require("os");
const { spawn } = require("child_process");

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

function runMagickAsync(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore", shell: false });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ImageMagick failed with code ${code}`));
    });
    child.on("error", reject);
  });
}

function writeWebpVariantAsync(command, sourcePath, outPath, width) {
  return runMagickAsync(command, [
    sourcePath,
    "-auto-orient",
    "-strip",
    "-resize",
    `${width}x>`,
    "-quality",
    "84",
    "-define",
    "webp:method=6",
    outPath,
  ]);
}

function writeFallbackJpegAsync(command, sourcePath, outPath) {
  return runMagickAsync(command, [
    sourcePath,
    "-auto-orient",
    "-strip",
    "-sampling-factor",
    "4:2:0",
    "-interlace",
    "Plane",
    "-resize",
    "1920x>",
    "-quality",
    "86",
    outPath,
  ]);
}

function replaceExtension(filePath, suffixWithExtension) {
  return filePath.replace(/\.[^.]+$/, suffixWithExtension);
}

function getImageMetadata(command, sourcePath) {
  const idCmd = command === "convert" ? "identify" : command;
  const args =
    command === "convert"
      ? ["-format", "%w|%h", sourcePath]
      : ["identify", "-format", "%w|%h", sourcePath];

  const result = runCapture(idCmd, args);
  if (result.status !== 0) {
    throw new Error(`Failed to get dimensions for ${sourcePath}`);
  }
  const parts = result.stdout.trim().split("|");
  return { width: parseInt(parts[0], 10), height: parseInt(parts[1], 10) };
}

function getLQIPBase64(command, sourcePath) {
  const result = spawnSync(
    command,
    [sourcePath, "-resize", "16x", "-quality", "20", "webp:-"],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    console.warn(`WARN: Failed to generate LQIP for ${sourcePath}`);
    return null;
  }
  return `data:image/webp;base64,${result.stdout.toString("base64")}`;
}

async function optimizeResponsiveSet(command, sourcePath) {
  const generated = [];
  const meta = getImageMetadata(command, sourcePath);
  const actualWidth = meta.width;

  const validBreakpoints = [];
  const variantPromises = [];

  for (const targetWidth of TARGET_WIDTHS) {
    if (targetWidth > actualWidth && validBreakpoints.length > 0) {
      break;
    }
    const output = replaceExtension(sourcePath, `-${targetWidth}.webp`);
    variantPromises.push(writeWebpVariantAsync(command, sourcePath, output, targetWidth));
    generated.push(output);
    validBreakpoints.push(targetWidth);
    if (targetWidth >= actualWidth) {
      break;
    }
  }

  const fallbackOutput = replaceExtension(sourcePath, "-fallback.jpg");
  variantPromises.push(writeFallbackJpegAsync(command, sourcePath, fallbackOutput));
  generated.push(fallbackOutput);

  await Promise.all(variantPromises);

  const lqip = getLQIPBase64(command, sourcePath);

  return { generated, validBreakpoints, meta, lqip };
}

async function main() {
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    console.error(
      `ERROR: Source directory for mode '${sourceModeArg}' does not exist: ${sourceDir}`,
    );
    process.exit(1);
  }

  const command = resolveImageMagickCommand();
  if (!command) {
    console.log(
      "Responsive image generation skipped: ImageMagick is not installed (magick/convert not found).",
    );
    return;
  }

  const sourceFiles = collectFiles(sourceDir, isSourceImage);
  if (sourceFiles.length === 0) {
    console.log(`No source images found under '${sourceDir}'.`);
    return;
  }

  let processed = 0;
  let generatedCount = 0;
  let failed = 0;

  const manifest = {};

  console.log(
    `Generating responsive images with ${CONCURRENCY} parallel workers...`,
  );

  const results = await runPool(sourceFiles, CONCURRENCY, async (sourceFile) => {
    try {
      const result = await optimizeResponsiveSet(command, sourceFile);
      const posixRel = toPosixRel(sourceFile, sourceDir);
      return {
        success: true,
        sourceFile,
        posixRel,
        result,
      };
    } catch (error) {
      return {
        success: false,
        sourceFile,
        error: error.message,
      };
    }
  });

  for (const item of results) {
    if (item.success) {
      processed += 1;
      generatedCount += item.result.generated.length;
      manifest[`/${item.posixRel}`] = {
        width: item.result.meta.width,
        height: item.result.meta.height,
        variants: item.result.validBreakpoints,
        fallback: `/${replaceExtension(item.posixRel, "-fallback.jpg")}`,
        lqip: item.result.lqip,
      };
    } else {
      failed += 1;
      console.warn(
        `WARN: Failed to generate responsive assets for ${toPosixRel(item.sourceFile)}: ${item.error}`,
      );
    }
  }

  fs.writeFileSync(
    path.join(sourceDir, "responsive-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  if (processed === 0) {
    console.error("ERROR: No responsive assets were generated successfully.");
    process.exit(1);
  }

  console.log(
    `Generated responsive assets for ${processed} source image(s): ${generatedCount} written, ${failed} failed.`,
  );
}

main().catch((err) => {
  console.error("Responsive image generation error:", err);
  process.exit(1);
});
