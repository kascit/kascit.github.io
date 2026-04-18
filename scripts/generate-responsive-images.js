#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { resolveImageMagickCommand, runMagick, runCapture, collectFiles, toPosixRel, ROOT } = require("./lib/shared");

const sourceDirArg = process.argv[2] || "static/images";
const sourceDir = path.resolve(ROOT, sourceDirArg);
const TARGET_WIDTHS = [240, 360, 480, 640, 768, 1024, 1280, 1600, 1920, 2560];

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
// Allow matching any old generated files to skip
const GENERATED_RE = /-(240|320|360|480|640|768|800|1024|1200|1280|1600|1920|2560|3840|fallback)\.(webp|jpe?g)$/i;

function isSourceImage(abs, entry) {
  const ext = path.extname(entry.name).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return false;
  if (GENERATED_RE.test(entry.name)) return false;
  return true;
}

function writeWebpVariant(command, sourcePath, outPath, width) {
  runMagick(command, [
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

function writeFallbackJpeg(command, sourcePath, outPath) {
  runMagick(command, [
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
  // ImageMagick 6 uses standalone `identify`, whereas ImageMagick 7 uses `magick identify`
  const idCmd = command === "convert" ? "identify" : command;
  const args = command === "convert" ? ["-format", "%w|%h", sourcePath] : ["identify", "-format", "%w|%h", sourcePath];
  
  const result = runCapture(idCmd, args);
  if (result.status !== 0) {
    throw new Error(`Failed to get dimensions for ${sourcePath}`);
  }
  const parts = result.stdout.trim().split("|");
  return { width: parseInt(parts[0], 10), height: parseInt(parts[1], 10) };
}

function getLQIPBase64(command, sourcePath) {
  // Use image magick to resize to 16px wide and output to stdout as webp
  const result = spawnSync(command, [sourcePath, "-resize", "16x", "-quality", "20", "webp:-"], { stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    console.warn(`WARN: Failed to generate LQIP for ${sourcePath}`);
    return null;
  }
  return `data:image/webp;base64,${result.stdout.toString("base64")}`;
}

function optimizeResponsiveSet(command, sourcePath) {
  const generated = [];
  const meta = getImageMetadata(command, sourcePath);
  const actualWidth = meta.width;

  const validBreakpoints = [];

  for (const targetWidth of TARGET_WIDTHS) {
    if (targetWidth > actualWidth && validBreakpoints.length > 0) {
      // Don't up-scale if we already have the base width or a smaller width
      break;
    }
    const output = replaceExtension(sourcePath, `-${targetWidth}.webp`);
    writeWebpVariant(command, sourcePath, output, targetWidth);
    generated.push(output);
    validBreakpoints.push(targetWidth);
    if (targetWidth >= actualWidth) {
       break; // Stop at the first width that matches or exceeds original
    }
  }

  const fallbackOutput = replaceExtension(sourcePath, "-fallback.jpg");
  writeFallbackJpeg(command, sourcePath, fallbackOutput);
  generated.push(fallbackOutput);

  const lqip = getLQIPBase64(command, sourcePath);

  return { generated, validBreakpoints, meta, lqip };
}

function main() {
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    console.error(`ERROR: Source directory '${sourceDirArg}' does not exist.`);
    process.exit(1);
  }

  const command = resolveImageMagickCommand();
  if (!command) {
    console.log("Responsive image generation skipped: ImageMagick is not installed (magick/convert not found).");
    return;
  }

  const sourceFiles = collectFiles(sourceDir, isSourceImage);
  if (sourceFiles.length === 0) {
    console.log(`No source images found under '${sourceDirArg}'.`);
    return;
  }

  let processed = 0;
  let generatedCount = 0;
  let failed = 0;

  const manifest = {};

  for (const sourceFile of sourceFiles) {
    try {
      const result = optimizeResponsiveSet(command, sourceFile);
      processed += 1;
      generatedCount += result.generated.length;

      const posixRel = toPosixRel(sourceFile, sourceDir);
      manifest[`/${posixRel}`] = {
        width: result.meta.width,
        height: result.meta.height,
        variants: result.validBreakpoints,
        fallback: `/${replaceExtension(posixRel, "-fallback.jpg")}`,
        lqip: result.lqip
      };
    } catch (error) {
      failed += 1;
      console.warn(`WARN: Failed to generate responsive assets for ${toPosixRel(sourceFile)}: ${error.message}`);
    }
  }

  fs.writeFileSync(path.join(sourceDir, "responsive-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  if (processed === 0) {
    console.error("ERROR: No responsive assets were generated successfully.");
    process.exit(1);
  }

  console.log(
    `Generated responsive assets for ${processed} source image(s): ${generatedCount} written, ${failed} failed.`
  );
}

main();
