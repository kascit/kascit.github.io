#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

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

function runCapture(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT_DIR,
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

function writeFaSvg(out, width, height, pathData) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">\n  <path d="${pathData}" fill="#000000"/>\n</svg>\n`;
  fs.writeFileSync(out, svg, "utf8");
}

function generateShortcutFamily(command, name, svg) {
  renderIcon(command, svg, 96, "none", path.join(ICON_DIR, `${name}-96.png`), SHORTCUT_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, svg, 192, "none", path.join(ICON_DIR, `${name}.png`), SHORTCUT_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, svg, 512, "none", path.join(ICON_DIR, `${name}-512.png`), SHORTCUT_GLYPH_SCALE, BASE_GLYPH_COLOR);

  renderIcon(command, svg, 192, WHITE_BG, path.join(ICON_DIR, `${name}-maskable.png`), SHORTCUT_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, svg, 512, WHITE_BG, path.join(ICON_DIR, `${name}-maskable-512.png`), SHORTCUT_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);

  renderIcon(command, svg, 192, "none", path.join(ICON_DIR, `${name}-maskable-transparent.png`), SHORTCUT_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);
  renderIcon(command, svg, 512, "none", path.join(ICON_DIR, `${name}-maskable-transparent-512.png`), SHORTCUT_MASKABLE_GLYPH_SCALE, BASE_GLYPH_COLOR);

  renderIcon(command, svg, 192, BLACK_BG, path.join(ICON_DIR, `${name}-light.png`), SHORTCUT_GLYPH_SCALE, WHITE_BG);
  renderIcon(command, svg, 512, BLACK_BG, path.join(ICON_DIR, `${name}-light-512.png`), SHORTCUT_GLYPH_SCALE, WHITE_BG);

  copyAlias(path.join(ICON_DIR, `${name}.png`), path.join(ICON_DIR, `${name}-transparent.png`));
  copyAlias(path.join(ICON_DIR, `${name}-512.png`), path.join(ICON_DIR, `${name}-transparent-512.png`));
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

  const FA_USER = "M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z";
  const FA_CODE = "M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z";
  const FA_LINK = "M419.5 96c-16.6 0-32.7 4.5-46.8 12.7-15.8-16-34.2-29.4-54.5-39.5 28.2-24 64.1-37.2 101.3-37.2 86.4 0 156.5 70 156.5 156.5 0 41.5-16.5 81.3-45.8 110.6l-71.1 71.1c-29.3 29.3-69.1 45.8-110.6 45.8-86.4 0-156.5-70-156.5-156.5 0-1.5 0-3 .1-4.5 .5-17.7 15.2-31.6 32.9-31.1s31.6 15.2 31.1 32.9c0 .9 0 1.8 0 2.6 0 51.1 41.4 92.5 92.5 92.5 24.5 0 48-9.7 65.4-27.1l71.1-71.1c17.3-17.3 27.1-40.9 27.1-65.4 0-51.1-41.4-92.5-92.5-92.5zM275.2 173.3c-1.9-.8-3.8-1.9-5.5-3.1-12.6-6.5-27-10.2-42.1-10.2-24.5 0-48 9.7-65.4 27.1L91.1 258.2c-17.3 17.3-27.1 40.9-27.1 65.4 0 51.1 41.4 92.5 92.5 92.5 16.5 0 32.6-4.4 46.7-12.6 15.8 16 34.2 29.4 54.6 39.5-28.2 23.9-64 37.2-101.3 37.2-86.4 0-156.5-70-156.5-156.5 0-41.5 16.5-81.3 45.8-110.6l71.1-71.1c29.3-29.3 69.1-45.8 110.6-45.8 86.6 0 156.5 70.6 156.5 156.9 0 1.3 0 2.6 0 3.9-.4 17.7-15.1 31.6-32.8 31.2s-31.6-15.1-31.2-32.8c0-.8 0-1.5 0-2.3 0-33.7-18-63.3-44.8-79.6z";
  const FA_PEN_NIB = "M368.5 18.3l-50.1 50.1 125.3 125.3 50.1-50.1c21.9-21.9 21.9-57.3 0-79.2L447.7 18.3c-21.9-21.9-57.3-21.9-79.2 0zM279.3 97.2l-.5 .1-144.1 43.2c-19.9 6-35.7 21.2-42.3 41L3.8 445.8c-2.9 8.7-1.9 18.2 2.5 26L161.7 316.4c-1.1-4-1.6-8.1-1.6-12.4 0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48c-4.3 0-8.5-.6-12.4-1.6L40.3 505.7c7.8 4.4 17.2 5.4 26 2.5l264.3-88.6c19.7-6.6 35-22.4 41-42.3l43.2-144.1 .1-.5-135.5-135.5z";

  const aboutSvg = path.join(GEN_DIR, "about.svg");
  const projectsSvg = path.join(GEN_DIR, "projects.svg");
  const linksSvg = path.join(GEN_DIR, "links.svg");
  const blogSvg = path.join(GEN_DIR, "blog.svg");

  writeFaSvg(aboutSvg, 448, 512, FA_USER);
  writeFaSvg(projectsSvg, 576, 512, FA_CODE);
  writeFaSvg(linksSvg, 576, 512, FA_LINK);
  writeFaSvg(blogSvg, 512, 512, FA_PEN_NIB);

  generateShortcutFamily(command, "about", aboutSvg);
  generateShortcutFamily(command, "projects", projectsSvg);
  generateShortcutFamily(command, "links", linksSvg);
  generateShortcutFamily(command, "blog", blogSvg);

  copyAlias(path.join(ICON_DIR, "projects.png"), path.join(ICON_DIR, "tasks.png"));

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
