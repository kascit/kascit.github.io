#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./lib/shared");

const mode = (process.argv[2] || "public").trim().toLowerCase();
if (mode !== "public" && mode !== "static") {
  console.error("ERROR: Mode must be 'public' or 'static'.");
  process.exit(1);
}

const outputDir =
  mode === "public"
    ? path.resolve(ROOT, "public")
    : path.resolve(ROOT, "static");

const manifestPath = path.join(outputDir, "responsive-manifest.json");
const cssDir = path.join(outputDir, "css");
const cssPath = path.join(cssDir, "lqip.css");

function lqipClassName(manifestKey) {
  const hash = crypto
    .createHash("sha1")
    .update(String(manifestKey))
    .digest("hex")
    .slice(0, 10);
  return `lqip-${hash}`;
}

function escapeCssUrl(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "");
}

function main() {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(`ERROR: Output directory not found: ${outputDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error(
      `ERROR: responsive-manifest.json not found at ${manifestPath}`,
    );
    process.exit(1);
  }

  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(
      `ERROR: Failed to parse responsive-manifest.json: ${err.message}`,
    );
    process.exit(1);
  }

  const lines = ["/* Auto-generated LQIP classes. Do not edit by hand. */"];

  let count = 0;
  for (const [key, data] of Object.entries(manifest)) {
    if (!data || !data.lqip) continue;
    const className = lqipClassName(key);
    const lqip = escapeCssUrl(data.lqip);
    lines.push(
      `.${className}{background-image:url("${lqip}");background-size:cover;background-position:center;}`,
    );
    count += 1;
  }

  fs.mkdirSync(cssDir, { recursive: true });
  fs.writeFileSync(cssPath, `${lines.join("\n")}\n`, "utf8");

  console.log(
    `Generated ${count} LQIP class(es) in ${path.relative(ROOT, cssPath).replace(/\\/g, "/")}.`,
  );
}

main();
