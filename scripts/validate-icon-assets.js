#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SOURCES = [
  "templates/macros/head.html",
  "static/js/core/shell.js",
  "static/icons/site.webmanifest",
  "static/sw.js",
];

const GENERATED_ICON_FILES = new Set([
  "apple-touch-icon-180x180-transparent.png",
  "favicon-16x16-transparent.png",
  "favicon-32x32-transparent.png",
  "favicon-96x96-transparent.png",
  "favicon-96x96.png",
  "favicon-transparent.ico",
  "icon-192x192-transparent.png",
  "icon-192x192.png",
  "icon-192x192-maskable.png",
  "icon-512x512.png",
  "icon-512x512-maskable.png",
]);

function readUtf8(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function collectIconRefs(text) {
  const refs = text.match(/\/icons\/[A-Za-z0-9._/-]+/g) || [];
  return refs.filter((ref) => !ref.endsWith("/"));
}

function main() {
  const missing = [];
  const seen = new Set();

  for (const relPath of SOURCES) {
    const content = readUtf8(relPath);
    const refs = collectIconRefs(content);

    for (const ref of refs) {
      if (seen.has(ref)) {
        continue;
      }
      seen.add(ref);

      const diskPath = path.join(
        ROOT,
        "static",
        ref.replace(/^\/icons\//, "icons/"),
      );
      const fileName = path.basename(ref);
      if (!fs.existsSync(diskPath) && !GENERATED_ICON_FILES.has(fileName)) {
        missing.push({ ref, source: relPath });
      }
    }
  }

  if (missing.length > 0) {
    console.error("Missing icon assets referenced by source files:");
    for (const item of missing) {
      console.error(`- ${item.ref} (referenced in ${item.source})`);
    }
    process.exit(1);
  }

  console.log(
    `Icon asset references validated (${seen.size} unique references).`,
  );
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
