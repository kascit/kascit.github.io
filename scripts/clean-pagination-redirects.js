#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");

if (!fs.existsSync(publicDir)) {
  console.log("No public directory found; skipping pagination redirect cleanup.");
  process.exit(0);
}

let removed = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === "page") {
      const pageOneDir = path.join(fullPath, "1");
      if (fs.existsSync(pageOneDir) && fs.statSync(pageOneDir).isDirectory()) {
        fs.rmSync(pageOneDir, { recursive: true, force: true });
        removed += 1;
      }
    }

    walk(fullPath);
  }
}

walk(publicDir);
console.log(`Removed ${removed} page/1 redirect directories.`);
