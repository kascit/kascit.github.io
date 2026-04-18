#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { resolveImageMagickCommand, runMagick } = require("./lib/shared");

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_ROOT_ARG = process.argv[2] || "public";
const OUTPUT_ROOT = path.resolve(ROOT_DIR, OUTPUT_ROOT_ARG);
const ICON_DIR = path.join(OUTPUT_ROOT, "icons");
const SRC_SVG = path.resolve(process.argv[3] || path.join(ICON_DIR, "favicon.svg"));
const GEN_DIR = path.join(ROOT_DIR, "scripts", ".tmp-icons");

const SQUIRCLE_RADIUS_PERCENT = Number.parseInt(process.env.SQUIRCLE_RADIUS_PERCENT || "11", 10);
const BASE_GLYPH_COLOR = process.env.BASE_GLYPH_COLOR || "#000000";
const FAVICON_GLYPH_SCALE = Number.parseInt(process.env.FAVICON_GLYPH_SCALE || "84", 10);
const TOUCH_GLYPH_SCALE = Number.parseInt(process.env.TOUCH_GLYPH_SCALE || "76", 10);
const PWA_GLYPH_SCALE = Number.parseInt(process.env.PWA_GLYPH_SCALE || "74", 10);
const PWA_MASKABLE_GLYPH_SCALE = Number.parseInt(process.env.PWA_MASKABLE_GLYPH_SCALE || "66", 10);
const SHORTCUT_GLYPH_SCALE = Number.parseInt(process.env.SHORTCUT_GLYPH_SCALE || "58", 10);
const SHORTCUT_MASKABLE_GLYPH_SCALE = Number.parseInt(process.env.SHORTCUT_MASKABLE_GLYPH_SCALE || "48", 10);

const WHITE_BG = "#ffffff";
const BLACK_BG = "#000000";

function ensureExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function radiusPx(size) {
  return Math.floor((size * SQUIRCLE_RADIUS_PERCENT) / 100);
}

function renderIcon(command, src, size, bg, out, glyphPercent, glyphColor, shape = "squircle") {
  const glyphWidth = Math.floor((size * glyphPercent) / 100);
  const max = size - 1;
  const radius = radiusPx(size);

  if (bg === "none") {
    runMagick(command, [
      "-size",
      `${size}x${size}`,
      "xc:none",
      "(",
      "-background",
      "none",
      src,
      "-resize",
      `${glyphWidth}x`,
      "-alpha",
      "set",
      "-channel",
      "RGB",
      "-fill",
      glyphColor,
      "-colorize",
      "100",
      "+channel",
      ")",
      "-gravity",
      "center",
      "-compose",
      "over",
      "-composite",
      "-colorspace",
      "sRGB",
      "-type",
      "TrueColorMatte",
      "-define",
      "png:color-type=6",
      out,
    ]);
    return;
  }

  if (shape === "square") {
    runMagick(command, [
      "-size",
      `${size}x${size}`,
      `xc:${bg}`,
      "(",
      "-background",
      "none",
      src,
      "-resize",
      `${glyphWidth}x`,
      "-alpha",
      "set",
      "-channel",
      "RGB",
      "-fill",
      glyphColor,
      "-colorize",
      "100",
      "+channel",
      ")",
      "-gravity",
      "center",
      "-compose",
      "over",
      "-composite",
      "-colorspace",
      "sRGB",
      "-type",
      "TrueColorMatte",
      "-define",
      "png:color-type=6",
      out,
    ]);
    return;
  }

  runMagick(command, [
    "-size",
    `${size}x${size}`,
    "xc:none",
    "-fill",
    bg,
    "-draw",
    `roundrectangle 0,0,${max},${max},${radius},${radius}`,
    "(",
    "-background",
    "none",
    src,
    "-resize",
    `${glyphWidth}x`,
    "-alpha",
    "set",
    "-channel",
    "RGB",
    "-fill",
    glyphColor,
    "-colorize",
    "100",
    "+channel",
    ")",
    "-gravity",
    "center",
    "-compose",
    "over",
    "-composite",
    "-colorspace",
    "sRGB",
    "-type",
    "TrueColorMatte",
    "-define",
    "png:color-type=6",
    out,
  ]);
}

function copyAlias(src, dst) {
  fs.copyFileSync(src, dst);
}



function main() {
  if (!fs.existsSync(OUTPUT_ROOT) || !fs.statSync(OUTPUT_ROOT).isDirectory()) {
    throw new Error(`Output directory not found: ${OUTPUT_ROOT_ARG}`);
  }

  ensureExists(SRC_SVG, "Source SVG");

  const command = resolveImageMagickCommand();
  if (!command) {
    throw new Error("ImageMagick is required for icon generation (magick/convert not found).");
  }

  fs.rmSync(GEN_DIR, { recursive: true, force: true });
  fs.mkdirSync(ICON_DIR, { recursive: true });
  fs.mkdirSync(GEN_DIR, { recursive: true });

  for (const s of [16, 32, 48, 64, 96, 128]) {
    renderIcon(command, SRC_SVG, s, "none", path.join(ICON_DIR, `favicon-${s}x${s}-transparent.png`), FAVICON_GLYPH_SCALE, BASE_GLYPH_COLOR);
    renderIcon(command, SRC_SVG, s, WHITE_BG, path.join(ICON_DIR, `favicon-${s}x${s}.png`), FAVICON_GLYPH_SCALE, BASE_GLYPH_COLOR);
  }

  for (const s of [120, 152, 167, 180]) {
    renderIcon(command, SRC_SVG, s, WHITE_BG, path.join(ICON_DIR, `apple-touch-icon-${s}x${s}.png`), TOUCH_GLYPH_SCALE, BASE_GLYPH_COLOR);
    renderIcon(command, SRC_SVG, s, "none", path.join(ICON_DIR, `apple-touch-icon-${s}x${s}-transparent.png`), TOUCH_GLYPH_SCALE, BASE_GLYPH_COLOR);
  }
  copyAlias(path.join(ICON_DIR, "apple-touch-icon-180x180.png"), path.join(ICON_DIR, "apple-touch-icon.png"));

  renderIcon(command, SRC_SVG, 192, "none", path.join(ICON_DIR, "icon-192x192-transparent.png"), PWA_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, SRC_SVG, 512, "none", path.join(ICON_DIR, "icon-512x512-transparent.png"), PWA_GLYPH_SCALE, BASE_GLYPH_COLOR);

  renderIcon(command, SRC_SVG, 192, WHITE_BG, path.join(ICON_DIR, "icon-192x192-maskable.png"), PWA_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, SRC_SVG, 512, WHITE_BG, path.join(ICON_DIR, "icon-512x512-maskable.png"), PWA_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);

  renderIcon(command, SRC_SVG, 192, "none", path.join(ICON_DIR, "icon-192x192-maskable-transparent.png"), PWA_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, SRC_SVG, 512, "none", path.join(ICON_DIR, "icon-512x512-maskable-transparent.png"), PWA_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, SRC_SVG, 192, BLACK_BG, path.join(ICON_DIR, "icon-192x192-dark.png"), PWA_GLYPH_SCALE, WHITE_BG);
  renderIcon(command, SRC_SVG, 512, BLACK_BG, path.join(ICON_DIR, "icon-512x512-dark.png"), PWA_GLYPH_SCALE, WHITE_BG);
  renderIcon(command, SRC_SVG, 192, BLACK_BG, path.join(ICON_DIR, "icon-192x192-maskable-dark.png"), PWA_MASKABLE_GLYPH_SCALE, WHITE_BG);
  renderIcon(command, SRC_SVG, 512, BLACK_BG, path.join(ICON_DIR, "icon-512x512-maskable-dark.png"), PWA_MASKABLE_GLYPH_SCALE, WHITE_BG);

  copyAlias(path.join(ICON_DIR, "icon-192x192-transparent.png"), path.join(ICON_DIR, "icon-192x192.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-transparent.png"), path.join(ICON_DIR, "icon-512x512.png"));
  copyAlias(path.join(ICON_DIR, "icon-192x192-transparent.png"), path.join(ICON_DIR, "icon-192x192-monochrome.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-transparent.png"), path.join(ICON_DIR, "icon-512x512-monochrome.png"));

  copyAlias(path.join(ICON_DIR, "icon-192x192-transparent.png"), path.join(ICON_DIR, "android-chrome-192x192.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-transparent.png"), path.join(ICON_DIR, "android-chrome-512x512.png"));
  copyAlias(path.join(ICON_DIR, "icon-192x192-dark.png"), path.join(ICON_DIR, "android-chrome-192x192-dark.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-dark.png"), path.join(ICON_DIR, "android-chrome-512x512-dark.png"));
  copyAlias(path.join(ICON_DIR, "icon-192x192-maskable.png"), path.join(ICON_DIR, "android-chrome-192x192-maskable.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-maskable.png"), path.join(ICON_DIR, "android-chrome-512x512-maskable.png"));
  copyAlias(path.join(ICON_DIR, "icon-192x192-maskable-dark.png"), path.join(ICON_DIR, "android-chrome-192x192-maskable-dark.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-maskable-dark.png"), path.join(ICON_DIR, "android-chrome-512x512-maskable-dark.png"));
  copyAlias(path.join(ICON_DIR, "icon-192x192-transparent.png"), path.join(ICON_DIR, "android-chrome-192x192-transparent.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-transparent.png"), path.join(ICON_DIR, "android-chrome-512x512-transparent.png"));
  copyAlias(path.join(ICON_DIR, "icon-192x192-maskable-transparent.png"), path.join(ICON_DIR, "android-chrome-192x192-maskable-transparent.png"));
  copyAlias(path.join(ICON_DIR, "icon-512x512-maskable-transparent.png"), path.join(ICON_DIR, "android-chrome-512x512-maskable-transparent.png"));



  runMagick(command, [
    path.join(ICON_DIR, "favicon-16x16.png"),
    path.join(ICON_DIR, "favicon-32x32.png"),
    path.join(ICON_DIR, "favicon-48x48.png"),
    path.join(ICON_DIR, "favicon-64x64.png"),
    path.join(ICON_DIR, "favicon.ico"),
  ]);

  runMagick(command, [
    path.join(ICON_DIR, "favicon-16x16-transparent.png"),
    path.join(ICON_DIR, "favicon-32x32-transparent.png"),
    path.join(ICON_DIR, "favicon-48x48-transparent.png"),
    path.join(ICON_DIR, "favicon-64x64-transparent.png"),
    path.join(ICON_DIR, "favicon-transparent.ico"),
  ]);

  copyAlias(path.join(ICON_DIR, "favicon.ico"), path.join(OUTPUT_ROOT, "favicon.ico"));
  copyAlias(SRC_SVG, path.join(OUTPUT_ROOT, "favicon.svg"));

  fs.rmSync(GEN_DIR, { recursive: true, force: true });

  console.log(`Icon generation complete in '${OUTPUT_ROOT_ARG}' from: ${SRC_SVG}`);
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
