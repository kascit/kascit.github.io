#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TARGET_DIRS = ["templates", "static"];
const VALID_EXTENSIONS = new Set([".xml", ".xsl"]);
const SKIP_DIRS = new Set(["public", "resources", ".git", ".github", "node_modules", ".tmp-out"]);

function walkFiles(dirPath, files) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      walkFiles(absPath, files);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (VALID_EXTENSIONS.has(ext)) {
      files.push(absPath);
    }
  }
}

function collectXmlFiles() {
  const files = [];
  for (const relDir of TARGET_DIRS) {
    const absDir = path.join(ROOT, relDir);
    if (!fs.existsSync(absDir)) {
      continue;
    }
    walkFiles(absDir, files);
  }
  return files.sort();
}

function validateFile(filePath) {
  const result = spawnSync("xmllint", ["--noout", filePath], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8"
  });

  if (result.status === 0) {
    return null;
  }

  const stderr = (result.stderr || "").trim();
  const stdout = (result.stdout || "").trim();
  const detail = stderr || stdout || "Invalid XML/XSL syntax";

  return {
    filePath,
    msg: detail
  };
}

function main() {
  const xmllintCheck = spawnSync("xmllint", ["--version"], {
    cwd: ROOT,
    shell: true,
    stdio: "ignore"
  });

  if (xmllintCheck.status !== 0) {
    console.error("xmllint is required for XML/XSL validation.");
    console.error("Install via Scoop: scoop install libxml2");
    process.exit(1);
  }

  const files = collectXmlFiles();
  if (files.length === 0) {
    console.log("No XML/XSL files found to validate.");
    return;
  }

  const errors = [];
  for (const filePath of files) {
    const err = validateFile(filePath);
    if (err) {
      errors.push(err);
    }
  }

  if (errors.length > 0) {
    console.error("XML/XSL validation failed:");
    for (const err of errors) {
      const rel = path.relative(ROOT, err.filePath).replace(/\\/g, "/");
      console.error(`- ${rel}: ${err.msg}`);
    }
    process.exit(1);
  }

  console.log(`Validated ${files.length} XML/XSL file(s).`);
}

main();
