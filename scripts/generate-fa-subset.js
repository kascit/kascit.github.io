#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { ROOT, collectFiles } = require("./lib/shared");

const mode = (process.argv[2] || "static").trim().toLowerCase();
if (mode !== "static" && mode !== "public") {
  console.error("ERROR: Mode must be 'static' or 'public'.");
  process.exit(1);
}

const outputDir =
  mode === "public"
    ? path.resolve(ROOT, "public")
    : path.resolve(ROOT, "static");

const sourceCssPath = path.join(outputDir, "css", "font-awesome.min.css");
const targetCssPath = path.join(outputDir, "css", "font-awesome.subset.css");

const SCAN_DIRS = [
  path.resolve(ROOT, "templates"),
  path.resolve(ROOT, "content"),
  path.resolve(ROOT, "data"),
  path.resolve(ROOT, "static", "js"),
  path.resolve(ROOT, "config.toml"),
];

const SCAN_EXTENSIONS = new Set([
  ".html",
  ".tera",
  ".md",
  ".toml",
  ".json",
  ".js",
]);

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function isScanTarget(abs, entry) {
  if (!entry.isFile()) return false;
  const ext = path.extname(entry.name).toLowerCase();
  return SCAN_EXTENSIONS.has(ext);
}

function collectIconClasses() {
  const used = new Set();

  for (const entry of SCAN_DIRS) {
    if (!fs.existsSync(entry)) continue;

    if (fs.statSync(entry).isFile()) {
      const content = readText(entry);
      const matches = content.match(/\bfa-[a-z0-9-]+\b/g) || [];
      matches.forEach((name) => used.add(name));
      continue;
    }

    const files = collectFiles(entry, isScanTarget);
    for (const file of files) {
      const content = readText(file);
      const matches = content.match(/\bfa-[a-z0-9-]+\b/g) || [];
      matches.forEach((name) => used.add(name));
    }
  }

  return used;
}

function parseBlocks(css) {
  const blocks = [];
  let depth = 0;
  let blockStart = 0;

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) {
        blockStart = findBlockStart(css, blockStart, i);
      }
      depth += 1;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(blockStart, i + 1).trim());
        blockStart = i + 1;
      }
    }
  }

  return blocks.filter(Boolean);
}

function findBlockStart(css, from, to) {
  let start = from;
  while (start < to && /\s/.test(css[start])) start += 1;
  return start;
}

function getHeader(block) {
  const idx = block.indexOf("{");
  return idx === -1 ? block : block.slice(0, idx).trim();
}

function getBody(block) {
  const idx = block.indexOf("{");
  return idx === -1 ? "" : block.slice(idx + 1, -1).trim();
}

function hasUsedIcon(header, used) {
  const matches = header.match(/\.fa-[a-z0-9-]+/g) || [];
  for (const raw of matches) {
    const cls = raw.slice(1);
    if (used.has(cls)) return true;
  }
  return false;
}

function shouldKeepBlock(block, used) {
  if (!block) return false;
  const header = getHeader(block);
  const body = getBody(block);

  if (header.startsWith("@font-face")) return true;
  if (header.startsWith("@keyframes")) return header.includes("fa-");
  if (header.includes(":root") || header.includes(":host")) return true;

  if (body.includes("--fa:")) {
    return hasUsedIcon(header, used);
  }

  if (/\.fa\b|\.fa-/.test(header)) return true;
  if (/\.fa\b|\.fa-/.test(body)) return true;

  return false;
}

function main() {
  if (!fs.existsSync(sourceCssPath)) {
    console.error(`ERROR: Source CSS not found: ${sourceCssPath}`);
    process.exit(1);
  }

  const used = collectIconClasses();
  if (used.size === 0) {
    console.warn(
      "WARN: No Font Awesome classes found in repo scan; subset may be empty.",
    );
  }

  const sourceCss = readText(sourceCssPath);
  const blocks = parseBlocks(sourceCss);
  const kept = blocks.filter((block) => shouldKeepBlock(block, used));

  const banner =
    "/* Auto-generated Font Awesome subset. Do not edit by hand. */";
  const payload = `${banner}\n${kept.join("\n")}\n`;

  fs.mkdirSync(path.dirname(targetCssPath), { recursive: true });
  fs.writeFileSync(targetCssPath, payload, "utf8");

  console.log(
    `Generated Font Awesome subset with ${kept.length} rule block(s) at ${path.relative(ROOT, targetCssPath).replace(/\\/g, "/")}.`,
  );
}

main();
