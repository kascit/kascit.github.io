#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { ROOT, collectFiles } = require("./lib/shared");

const PUBLIC_DIR = path.resolve(ROOT, "public");
const CONFIG_PATH = path.resolve(ROOT, "config.toml");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

const EXCLUDED_PATH_PREFIXES = [
  "/404.html",
  "/offline/",
  "/navbar/",
  "/open-file/",
  "/share-target/",
  "/handler/",
  "/tmp_test.html",
];

function readBaseUrl() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error("config.toml not found; cannot determine base_url.");
  }

  const config = fs.readFileSync(CONFIG_PATH, "utf8");
  const match = config.match(/^base_url\s*=\s*"([^"]+)"/m);
  if (!match) {
    throw new Error("base_url missing from config.toml.");
  }
  return match[1].replace(/\/$/, "");
}

function isHtml(abs, entry) {
  return entry.isFile() && entry.name.toLowerCase().endsWith(".html");
}

function toUrlPath(absPath) {
  const rel = path.relative(PUBLIC_DIR, absPath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) {
    return `/${rel.slice(0, -"index.html".length)}`;
  }
  return `/${rel}`;
}

function isExcluded(urlPath) {
  return EXCLUDED_PATH_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(baseUrl, urls) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const url of urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(url)}</loc>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR) || !fs.statSync(PUBLIC_DIR).isDirectory()) {
    console.error(
      "Public output missing; build the site before generating sitemap.",
    );
    process.exit(1);
  }

  const baseUrl = readBaseUrl();
  const htmlFiles = collectFiles(PUBLIC_DIR, isHtml);

  const urls = new Set();
  for (const filePath of htmlFiles) {
    const urlPath = toUrlPath(filePath);
    if (isExcluded(urlPath)) continue;
    urls.add(`${baseUrl}${urlPath}`);
  }

  const sorted = Array.from(urls).sort();
  const xml = buildSitemap(baseUrl, sorted);
  fs.writeFileSync(SITEMAP_PATH, xml, "utf8");

  console.log(`Generated sitemap.xml with ${sorted.length} URL(s).`);
}

main();
