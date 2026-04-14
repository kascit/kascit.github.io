#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const sourceDirArg = process.argv[2] || "static/images";
const sourceDir = path.resolve(ROOT, sourceDirArg);
const TARGET_WIDTHS = [640, 1200, 1920, 2560, 3840];

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const GENERATED_RE = /-(640|1200|1920|2560|3840|fallback)\.(webp|jpe?g)$/i;

function runCapture(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT,
    stdio: "pipe",
    shell: false,
    encoding: "utf8",
  });
}

function resolveImageMagickCommand() {
  const magick = runCapture("magick", ["-version"]);
  if (magick.status === 0) return "magick";

  const convert = runCapture("convert", ["-version"]);
  if (convert.status === 0) return "convert";

  return "";
}

function runMagick(command, args) {
  const result = runCapture(command, args);
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "ImageMagick command failed").trim());
  }
}

function collectSourceFiles(rootDir) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
        continue;
      }
      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) continue;
      if (GENERATED_RE.test(entry.name)) continue;

      files.push(abs);
    }
  }

  return files;
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

function toWorkspaceRelative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
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

  const sourceFiles = collectSourceFiles(sourceDir);
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
      console.warn(`WARN: Failed to generate responsive assets for ${toWorkspaceRelative(sourceFile)}: ${error.message}`);
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
