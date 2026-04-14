#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const outputDirArg = process.argv[2] || "public";
const outputDir = path.resolve(ROOT, outputDirArg);
const TARGET_WIDTHS = [640, 1200, 1920, 2560, 3840];
const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;
const BASE_HOSTS = new Set(["dhanur.me", "www.dhanur.me"]);

function collectHtmlFiles(rootDir) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith(".html")) continue;

      files.push(abs);
    }
  }

  return files;
}

function splitUrl(value) {
  const match = String(value || "").match(/^([^?#]*)([?#].*)?$/);
  return {
    base: (match && match[1]) || "",
    suffix: (match && match[2]) || "",
  };
}

function shouldHandleSource(src) {
  const trimmed = String(src || "").trim();
  if (!trimmed) return false;
  if (/^(data:|blob:|javascript:|mailto:|#)/i.test(trimmed)) return false;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (!BASE_HOSTS.has(parsed.hostname.toLowerCase())) {
        return false;
      }
      return parsed.pathname.includes("/images/") && IMAGE_EXT_RE.test(parsed.pathname);
    } catch (_error) {
      return false;
    }
  }

  const { base } = splitUrl(trimmed);
  return base.includes("/images/") && IMAGE_EXT_RE.test(base);
}

function buildVariantPath(src, width) {
  if (/^https?:\/\//i.test(src)) {
    const parsed = new URL(src);
    const withVariant = parsed.pathname.replace(IMAGE_EXT_RE, `-${width}.webp`);
    return `${parsed.origin}${withVariant}${parsed.search}${parsed.hash}`;
  }

  const { base, suffix } = splitUrl(src);
  const withVariant = base.replace(IMAGE_EXT_RE, `-${width}.webp`);
  return `${withVariant}${suffix}`;
}

function buildSrcset(src) {
  return TARGET_WIDTHS.map((width) => `${buildVariantPath(src, width)} ${width}w`).join(", ");
}

function injectIntoImgTag(tag) {
  if (!/^<img\b/i.test(tag)) return tag;
  if (/\ssrcset\s*=/i.test(tag)) return tag;
  if (/\sdata-no-responsive\b/i.test(tag)) return tag;

  const srcMatch = tag.match(/\ssrc\s*=\s*(?:(["'])(.*?)\1|([^\s>]+))/i);
  if (!srcMatch) return tag;

  const srcValue = srcMatch[2] || srcMatch[3] || "";
  if (!shouldHandleSource(srcValue)) return tag;

  const srcset = buildSrcset(srcValue);
  const hasSizes = /\ssizes\s*=/i.test(tag);
  const inject = hasSizes
    ? ` srcset="${srcset}"`
    : ` srcset="${srcset}" sizes="100vw"`;

  return tag.replace(/\s*\/?>$/, `${inject}$&`);
}

function processHtmlFile(filePath) {
  const before = fs.readFileSync(filePath, "utf8");
  let injected = 0;

  const after = before.replace(/<img\b[^>]*>/gi, (tag) => {
    const next = injectIntoImgTag(tag);
    if (next !== tag) injected += 1;
    return next;
  });

  if (after !== before) {
    fs.writeFileSync(filePath, after, "utf8");
  }

  return { changed: after !== before, injected };
}

function main() {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(`ERROR: Output directory '${outputDirArg}' does not exist.`);
    process.exit(1);
  }

  const htmlFiles = collectHtmlFiles(outputDir);
  if (htmlFiles.length === 0) {
    console.log(`No HTML files found under '${outputDirArg}'.`);
    return;
  }

  let changedFiles = 0;
  let injectedTags = 0;

  for (const filePath of htmlFiles) {
    const result = processHtmlFile(filePath);
    if (result.changed) {
      changedFiles += 1;
      injectedTags += result.injected;
    }
  }

  console.log(
    `Injected responsive srcset into ${injectedTags} <img> tag(s) across ${changedFiles} HTML file(s).`
  );
}

main();
