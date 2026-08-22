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

function enhanceRedirectStubs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      enhanceRedirectStubs(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    if (!content.includes('http-equiv="refresh"') && !content.includes("window.location.replace")) {
      continue;
    }

    // Extract target URL
    const match = content.match(/url=([^"'>]+)/i) || content.match(/const\s+target\s*=\s*"([^"]+)"/);
    if (!match) continue;
    const target = match[1].trim();

    const enhanced = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecting | dhanur.me</title>
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${target}">
  <meta name="description" content="This page has moved. You are being redirected to ${target}">
  <script>
    const target = "${target}";
    const hash = window.location.hash || "";
    window.location.replace(target + hash);
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=${target}">
  </noscript>
</head>
<body>
  <main style="font-family: sans-serif; padding: 2rem; text-align: center;">
    <h1>Page Moved</h1>
    <p><a href="${target}">Click here</a> to proceed if you are not redirected automatically.</p>
    <p style="margin-top: 1.5rem;"><a href="/">Home</a> | <a href="/blog/">Blog</a> | <a href="/projects/">Projects</a> | <a href="/links/">Links</a> | <a href="/about/">About</a></p>
  </main>
</body>
</html>
`;
    fs.writeFileSync(fullPath, enhanced, "utf8");
  }
}

walk(publicDir);
console.log(`Removed ${removed} page/1 redirect directories.`);

enhanceRedirectStubs(publicDir);

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
    const tmpPath = sitemapPath + ".tmp";
    fs.writeFileSync(tmpPath, sitemap, "utf8");
    fs.renameSync(tmpPath, sitemapPath);
    console.log(`Purged ${purged} stale page/1 URL(s) from sitemap.xml.`);
  }
}
