#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  ROOT,
  resolveImageMagickCommand,
  runMagick,
  assertInsideRoot,
} = require("./lib/shared");

const OUTPUT_MODE = (process.argv[2] || "public").trim().toLowerCase();
if (OUTPUT_MODE !== "public" && OUTPUT_MODE !== "static") {
  console.error("ERROR: Output mode must be 'public' or 'static'.");
  process.exit(1);
}

const OUTPUT_ROOT =
  OUTPUT_MODE === "static"
    ? path.resolve(ROOT, "static")
    : path.resolve(ROOT, "public");
const ICON_DIR = path.join(OUTPUT_ROOT, "icons");
const SRC_SVG =
  OUTPUT_MODE === "static"
    ? path.resolve(ROOT, "static", "icons", "favicon.svg")
    : path.resolve(ROOT, "public", "icons", "favicon.svg");
const GEN_DIR = assertInsideRoot(
  path.join(ROOT, "scripts", ".tmp-icons"),
  "Temp icons directory",
);

const SQUIRCLE_RADIUS_PERCENT = Number.parseInt(
  process.env.SQUIRCLE_RADIUS_PERCENT || "11",
  10,
);
const BASE_GLYPH_COLOR = process.env.BASE_GLYPH_COLOR || "#000000";
const FAVICON_GLYPH_SCALE = Number.parseInt(
  process.env.FAVICON_GLYPH_SCALE || "84",
  10,
);
const TOUCH_GLYPH_SCALE = Number.parseInt(
  process.env.TOUCH_GLYPH_SCALE || "76",
  10,
);
const PWA_GLYPH_SCALE = Number.parseInt(
  process.env.PWA_GLYPH_SCALE || "74",
  10,
);
const PWA_MASKABLE_GLYPH_SCALE = Number.parseInt(
  process.env.PWA_MASKABLE_GLYPH_SCALE || "66",
  10,
);

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

function renderIconAsync(
  command,
  src,
  size,
  bg,
  out,
  glyphPercent,
  glyphColor,
  shape = "squircle",
) {
  const glyphWidth = Math.floor((size * glyphPercent) / 100);
  const max = size - 1;
  const radius = radiusPx(size);

  if (bg === "none") {
    return runMagickAsync(command, [
      "-size",
      `${size}x${size}`,
      "xc:none",
      "(",
      "-density",
      "1200",
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

  if (shape === "square") {
    return runMagickAsync(command, [
      "-size",
      `${size}x${size}`,
      `xc:${bg}`,
      "(",
      "-density",
      "1200",
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

  return runMagickAsync(command, [
    "-size",
    `${size}x${size}`,
    "xc:none",
    "-fill",
    bg,
    "-draw",
    `roundrectangle 0,0,${max},${max},${radius},${radius}`,
    "(",
    "-density",
    "1200",
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

async function main() {
  if (!fs.existsSync(OUTPUT_ROOT) || !fs.statSync(OUTPUT_ROOT).isDirectory()) {
    throw new Error(
      `Output directory not found for mode '${OUTPUT_MODE}': ${OUTPUT_ROOT}`,
    );
  }

  ensureExists(SRC_SVG, "Source SVG");

  const command = resolveImageMagickCommand();
  if (!command) {
    console.log(
      "Icon generation skipped: ImageMagick is not installed (magick/convert not found).",
    );
    return;
  }

  fs.rmSync(GEN_DIR, { recursive: true, force: true });
  fs.mkdirSync(ICON_DIR, { recursive: true });
  fs.mkdirSync(GEN_DIR, { recursive: true });

  const tasks = [];

  for (const s of [16, 32, 48, 64, 96, 128]) {
    tasks.push({
      src: SRC_SVG,
      size: s,
      bg: "none",
      out: path.join(ICON_DIR, `favicon-${s}x${s}-transparent.png`),
      glyphPercent: FAVICON_GLYPH_SCALE,
      glyphColor: BASE_GLYPH_COLOR,
      shape: "squircle",
    });
    tasks.push({
      src: SRC_SVG,
      size: s,
      bg: WHITE_BG,
      out: path.join(ICON_DIR, `favicon-${s}x${s}.png`),
      glyphPercent: FAVICON_GLYPH_SCALE,
      glyphColor: BASE_GLYPH_COLOR,
      shape: "squircle",
    });
  }

  for (const s of [120, 152, 167, 180]) {
    tasks.push({
      src: SRC_SVG,
      size: s,
      bg: WHITE_BG,
      out: path.join(ICON_DIR, `apple-touch-icon-${s}x${s}.png`),
      glyphPercent: TOUCH_GLYPH_SCALE,
      glyphColor: BASE_GLYPH_COLOR,
      shape: "squircle",
    });
    tasks.push({
      src: SRC_SVG,
      size: s,
      bg: "none",
      out: path.join(ICON_DIR, `apple-touch-icon-${s}x${s}-transparent.png`),
      glyphPercent: TOUCH_GLYPH_SCALE,
      glyphColor: BASE_GLYPH_COLOR,
      shape: "squircle",
    });
  }

  tasks.push({
    src: SRC_SVG,
    size: 192,
    bg: "none",
    out: path.join(ICON_DIR, "icon-192x192-transparent.png"),
    glyphPercent: PWA_GLYPH_SCALE,
    glyphColor: BASE_GLYPH_COLOR,
    shape: "squircle",
  });
  tasks.push({
    src: SRC_SVG,
    size: 512,
    bg: "none",
    out: path.join(ICON_DIR, "icon-512x512-transparent.png"),
    glyphPercent: PWA_GLYPH_SCALE,
    glyphColor: BASE_GLYPH_COLOR,
    shape: "squircle",
  });

  tasks.push({
    src: SRC_SVG,
    size: 192,
    bg: WHITE_BG,
    out: path.join(ICON_DIR, "icon-192x192-maskable.png"),
    glyphPercent: PWA_MASKABLE_GLYPH_SCALE,
    glyphColor: BASE_GLYPH_COLOR,
    shape: "square",
  });
  tasks.push({
    src: SRC_SVG,
    size: 512,
    bg: WHITE_BG,
    out: path.join(ICON_DIR, "icon-512x512-maskable.png"),
    glyphPercent: PWA_MASKABLE_GLYPH_SCALE,
    glyphColor: BASE_GLYPH_COLOR,
    shape: "square",
  });

  tasks.push({
    src: SRC_SVG,
    size: 192,
    bg: "none",
    out: path.join(ICON_DIR, "icon-192x192-maskable-transparent.png"),
    glyphPercent: PWA_MASKABLE_GLYPH_SCALE,
    glyphColor: BASE_GLYPH_COLOR,
    shape: "square",
  });
  tasks.push({
    src: SRC_SVG,
    size: 512,
    bg: "none",
    out: path.join(ICON_DIR, "icon-512x512-maskable-transparent.png"),
    glyphPercent: PWA_MASKABLE_GLYPH_SCALE,
    glyphColor: BASE_GLYPH_COLOR,
    shape: "square",
  });
  tasks.push({
    src: SRC_SVG,
    size: 192,
    bg: BLACK_BG,
    out: path.join(ICON_DIR, "icon-192x192-dark.png"),
    glyphPercent: PWA_GLYPH_SCALE,
    glyphColor: WHITE_BG,
    shape: "squircle",
  });
  tasks.push({
    src: SRC_SVG,
    size: 512,
    bg: BLACK_BG,
    out: path.join(ICON_DIR, "icon-512x512-dark.png"),
    glyphPercent: PWA_GLYPH_SCALE,
    glyphColor: WHITE_BG,
    shape: "squircle",
  });
  tasks.push({
    src: SRC_SVG,
    size: 192,
    bg: BLACK_BG,
    out: path.join(ICON_DIR, "icon-192x192-maskable-dark.png"),
    glyphPercent: PWA_MASKABLE_GLYPH_SCALE,
    glyphColor: WHITE_BG,
    shape: "square",
  });
  tasks.push({
    src: SRC_SVG,
    size: 512,
    bg: BLACK_BG,
    out: path.join(ICON_DIR, "icon-512x512-maskable-dark.png"),
    glyphPercent: PWA_MASKABLE_GLYPH_SCALE,
    glyphColor: WHITE_BG,
    shape: "square",
  });

  await runPool(tasks, CONCURRENCY, (t) =>
    renderIconAsync(
      command,
      t.src,
      t.size,
      t.bg,
      t.out,
      t.glyphPercent,
      t.glyphColor,
      t.shape,
    ),
  );

  copyAlias(
    path.join(ICON_DIR, "apple-touch-icon-180x180.png"),
    path.join(ICON_DIR, "apple-touch-icon.png"),
  );

  copyAlias(
    path.join(ICON_DIR, "icon-192x192-transparent.png"),
    path.join(ICON_DIR, "icon-192x192.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-transparent.png"),
    path.join(ICON_DIR, "icon-512x512.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-192x192-transparent.png"),
    path.join(ICON_DIR, "icon-192x192-monochrome.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-transparent.png"),
    path.join(ICON_DIR, "icon-512x512-monochrome.png"),
  );

  copyAlias(
    path.join(ICON_DIR, "icon-192x192-transparent.png"),
    path.join(ICON_DIR, "android-chrome-192x192.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-transparent.png"),
    path.join(ICON_DIR, "android-chrome-512x512.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-192x192-dark.png"),
    path.join(ICON_DIR, "android-chrome-192x192-dark.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-dark.png"),
    path.join(ICON_DIR, "android-chrome-512x512-dark.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-192x192-maskable.png"),
    path.join(ICON_DIR, "android-chrome-192x192-maskable.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-maskable.png"),
    path.join(ICON_DIR, "android-chrome-512x512-maskable.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-192x192-maskable-dark.png"),
    path.join(ICON_DIR, "android-chrome-192x192-maskable-dark.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-maskable-dark.png"),
    path.join(ICON_DIR, "android-chrome-512x512-maskable-dark.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-192x192-transparent.png"),
    path.join(ICON_DIR, "android-chrome-192x192-transparent.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-transparent.png"),
    path.join(ICON_DIR, "android-chrome-512x512-transparent.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-192x192-maskable-transparent.png"),
    path.join(ICON_DIR, "android-chrome-192x192-maskable-transparent.png"),
  );
  copyAlias(
    path.join(ICON_DIR, "icon-512x512-maskable-transparent.png"),
    path.join(ICON_DIR, "android-chrome-512x512-maskable-transparent.png"),
  );

  await Promise.all([
    runMagickAsync(command, [
      path.join(ICON_DIR, "favicon-16x16.png"),
      path.join(ICON_DIR, "favicon-32x32.png"),
      path.join(ICON_DIR, "favicon-48x48.png"),
      path.join(ICON_DIR, "favicon-64x64.png"),
      path.join(ICON_DIR, "favicon.ico"),
    ]),
    runMagickAsync(command, [
      path.join(ICON_DIR, "favicon-16x16-transparent.png"),
      path.join(ICON_DIR, "favicon-32x32-transparent.png"),
      path.join(ICON_DIR, "favicon-48x48-transparent.png"),
      path.join(ICON_DIR, "favicon-64x64-transparent.png"),
      path.join(ICON_DIR, "favicon-transparent.ico"),
    ]),
  ]);

  copyAlias(
    path.join(ICON_DIR, "favicon.ico"),
    path.join(OUTPUT_ROOT, "favicon.ico"),
  );
  copyAlias(SRC_SVG, path.join(OUTPUT_ROOT, "favicon.svg"));

  fs.rmSync(GEN_DIR, { recursive: true, force: true });

  console.log(`Icon generation complete in '${OUTPUT_MODE}' from: ${SRC_SVG}`);
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
