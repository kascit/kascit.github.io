#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const outputDirArg = process.argv[2] || "public";
const outputDir = path.resolve(ROOT, outputDirArg);
const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;
const BASE_HOSTS = new Set(["dhanur.me", "www.dhanur.me"]);

let manifest = {};
const manifestPath = path.join(outputDir, "responsive-manifest.json");

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(`ERROR: Failed to parse responsive-manifest.json: ${err.message}`);
  }
}

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
  if (!trimmed) return null;
  if (/^(data:|blob:|javascript:|mailto:|#)/i.test(trimmed)) return null;

  let pathname = trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (!BASE_HOSTS.has(parsed.hostname.toLowerCase())) {
        return null;
      }
      pathname = parsed.pathname;
    } catch (_error) {
      return null;
    }
  }

  if (IMAGE_EXT_RE.test(pathname)) {
     const { base } = splitUrl(pathname);
     return base.startsWith("/") ? base : `/${base}`;
  }

  return null;
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

function injectIntoImgTag(tag) {
  if (!/^<img\b/i.test(tag)) return tag;
  if (/\sdata-no-responsive\b/i.test(tag)) return tag;

  const srcMatch = tag.match(/\ssrc\s*=\s*(?:(["'])(.*?)\1|([^\s>]+))/i);
  if (!srcMatch) return tag;

  const srcValue = srcMatch[2] || srcMatch[3] || "";
  const manifestKey = shouldHandleSource(srcValue);
  
  if (!manifestKey) return tag;
  const data = manifest[manifestKey];
  if (!data) return tag;

  // Build the correct srcset from exactly what was generated
  let srcset = "";
  if (data.variants && data.variants.length > 0) {
      srcset = data.variants.map((width) => `${buildVariantPath(srcValue, width)} ${width}w`).join(", ");
  }

  let injectedTag = tag;
  
  // Inject srcset
  if (!/\ssrcset\s*=/i.test(injectedTag) && srcset) {
      const hasSizes = /\ssizes\s*=/i.test(injectedTag);
      const inject = hasSizes ? ` srcset="${srcset}"` : ` srcset="${srcset}" sizes="100vw"`;
      injectedTag = injectedTag.replace(/\s*\/?>$/, `${inject}$&`);
  }

  // Inject width and height to prevent CLS
  if (!/\swidth\s*=/i.test(injectedTag) && data.width) {
      injectedTag = injectedTag.replace(/\s*\/?>$/, ` width="${data.width}"$&`);
  }
  if (!/\sheight\s*=/i.test(injectedTag) && data.height) {
      injectedTag = injectedTag.replace(/\s*\/?>$/, ` height="${data.height}"$&`);
  }

  // Inject lazy loading
  if (!/\sloading\s*=/i.test(injectedTag)) {
      injectedTag = injectedTag.replace(/\s*\/?>$/, ` loading="lazy"$&`);
  }
  if (!/\sdecoding\s*=/i.test(injectedTag)) {
      injectedTag = injectedTag.replace(/\s*\/?>$/, ` decoding="async"$&`);
  }

  // Inject LQIP (Low Quality Image Placeholder) via style
  if (data.lqip && !/\sstyle\s*=[^>]*background-image[^>]*>/i.test(injectedTag)) {
      const styleMatch = injectedTag.match(/\sstyle\s*=\s*(["'])(.*?)\1/i);
      const lqipStyle = `background-image: url('${data.lqip}'); background-size: cover; background-position: center;`;
      
      if (styleMatch) {
          // Append to existing style attribute
          const existingStyle = styleMatch[2];
          const newStyle = existingStyle.trim().endsWith(";") ? `${existingStyle} ${lqipStyle}` : `${existingStyle}; ${lqipStyle}`;
          injectedTag = injectedTag.replace(styleMatch[0], ` style="${newStyle}"`);
      } else {
          // Create new style attribute
          injectedTag = injectedTag.replace(/\s*\/?>$/, ` style="${lqipStyle}"$&`);
      }
  }

  return injectedTag;
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

  // Verify manifest loading
  if (Object.keys(manifest).length === 0) {
      console.warn("WARN: responsive-manifest.json was not found or empty. Generation might not have run or no images were found.");
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
    `Injected responsive srcset, LQIP, and CLS attributes into ${injectedTags} <img> tag(s) across ${changedFiles} HTML file(s).`
  );
}

main();
