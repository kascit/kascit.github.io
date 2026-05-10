#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");

if (!fs.existsSync(publicDir)) {
  console.log(
    "No public directory found; skipping pagination redirect cleanup.",
  );
  process.exit(0);
}

let removed = 0;
const removedPaths = [];

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
        // Derive the public-relative URL for sitemap cleanup
        const relPath = path
          .relative(publicDir, pageOneDir)
          .split(path.sep)
          .join("/");
        removedPaths.push(`/${relPath}/`);
        fs.rmSync(pageOneDir, { recursive: true, force: true });
        removed += 1;
      }
    }

    walk(fullPath);
  }
}

walk(publicDir);
console.log(`Removed ${removed} page/1 redirect directories.`);

// Also purge stale /page/1/ entries from sitemap.xml so search engines don't
// index redirect stubs. Zola generates the sitemap before post-build cleanup runs.
const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath) && removedPaths.length > 0) {
  const originalSitemap = fs.readFileSync(sitemapPath, "utf8");
  let sitemap = originalSitemap;
  let purged = 0;
  for (const urlPath of removedPaths) {
    // Match the full <url>...</url> block containing this path in <loc>
    const escaped = urlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `\\s*<url>[\\s\\S]*?<loc>[^<]*${escaped}[^<]*<\\/loc>[\\s\\S]*?<\\/url>`,
      "g",
    );
    const replaced = sitemap.replace(pattern, "");
    if (replaced !== sitemap) {
      sitemap = replaced;
      purged += 1;
    }
  }
  if (purged > 0) {
    fs.writeFileSync(sitemapPath, sitemap, "utf8");
    console.log(`Purged ${purged} stale page/1 URL(s) from sitemap.xml.`);
  }
}
