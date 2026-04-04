#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const CONFIG_FILE = path.join(ROOT, "config.toml");
const OUT_FILE = path.join(ROOT, "static", "widgets", "latest-posts-data.json");

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_error) {
    return "";
  }
}

function parseBaseUrl() {
  const configRaw = readFileSafe(CONFIG_FILE);
  const m = configRaw.match(/^\s*base_url\s*=\s*(?:"([^"]+)"|'([^']+)')\s*$/m);
  const base = m ? (m[1] || m[2]).trim() : "https://dhanur.me";
  return base.replace(/\/$/, "");
}

function parseFrontMatterToml(raw) {
  const m = raw.match(/^\+\+\+\s*\r?\n([\s\S]*?)\r?\n\+\+\+/);
  if (!m) return {};

  const frontMatter = m[1];
  const result = {};

  for (const line of frontMatter.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[")) continue;

    const kv = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!kv) continue;

    const key = kv[1];
    const valueRaw = kv[2].trim();

    if ((valueRaw.startsWith("\"") && valueRaw.endsWith("\"")) || (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
      result[key] = valueRaw.slice(1, -1);
    } else {
      result[key] = valueRaw;
    }
  }

  return result;
}

function parseBlogPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") && f !== "_index.md")
    .map((f) => path.join(BLOG_DIR, f));

  const posts = [];

  for (const filePath of files) {
    const raw = readFileSafe(filePath);
    if (!raw) continue;

    const fm = parseFrontMatterToml(raw);
    const fileName = path.basename(filePath, ".md");
    const slug = String(fm.slug || fileName).trim();
    const title = String(fm.title || slug || "Untitled").trim();
    const description = String(fm.description || "").trim();
    const dateRaw = String(fm.date || "").trim();
    const parsedDate = Number.isNaN(Date.parse(dateRaw)) ? 0 : Date.parse(dateRaw);

    posts.push({
      title,
      slug,
      description,
      dateRaw,
      parsedDate,
    });
  }

  posts.sort((a, b) => b.parsedDate - a.parsedDate);
  return posts;
}

function buildPayload() {
  const baseUrl = parseBaseUrl();
  const sortedPosts = parseBlogPosts();
  const posts = sortedPosts.slice(0, 5).map((p) => ({
    title: p.title,
    url: `${baseUrl}/blog/${p.slug}/`,
    description: p.description,
  }));

  const latestParsed = sortedPosts.length > 0 ? sortedPosts[0].parsedDate : 0;
  const timestamp = latestParsed > 0
    ? new Date(latestParsed).toISOString()
    : "1970-01-01T00:00:00.000Z";

  return {
    updatedAt: timestamp,
    updatedAtHuman: timestamp.slice(0, 10),
    posts,
  };
}

function main() {
  const payload = buildPayload();
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated widget data: ${path.relative(ROOT, OUT_FILE)}`);
}

main();
