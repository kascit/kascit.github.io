#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { resolveImageMagickCommand, runMagick, collectFiles, toPosixRel, ROOT } = require("./lib/shared");

const sourceDirArg = process.argv[2] || "static/images";
const sourceDir = path.resolve(ROOT, sourceDirArg);
const TARGET_WIDTHS = [640, 1200, 1920, 2560, 3840];

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const GENERATED_RE = /-(640|1200|1920|2560|3840|fallback)\.(webp|jpe?g)$/i;

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

function optimizeResponsiveSet(command, sourcePath) {
  const generated = [];

  for (const targetWidth of TARGET_WIDTHS) {
    const output = replaceExtension(sourcePath, `-${targetWidth}.webp`);
    writeWebpVariant(command, sourcePath, output, targetWidth);
    generated.push(output);
  }

  const fallbackOutput = replaceExtension(sourcePath, "-fallback.jpg");
  writeFallbackJpeg(command, sourcePath, fallbackOutput);
  generated.push(fallbackOutput);

  return { generated };
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

  for (const sourceFile of sourceFiles) {
    try {
      const result = optimizeResponsiveSet(command, sourceFile);
      processed += 1;
      generatedCount += result.generated.length;
    } catch (error) {
      failed += 1;
      console.warn(`WARN: Failed to generate responsive assets for ${toPosixRel(sourceFile)}: ${error.message}`);
    }
  }

  if (processed === 0) {
    console.error("ERROR: No responsive assets were generated successfully.");
    process.exit(1);
  }

  console.log(
    `Generated responsive assets for ${processed} source image(s): ${generatedCount} written, ${failed} failed.`
  );
}

main();
