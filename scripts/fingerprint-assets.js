#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.resolve(process.argv[2] || "public");
const SITE_ORIGIN = "https://dhanur.me";
const ALLOW_NON_PUBLIC_TARGET = process.env.ALLOW_NON_PUBLIC_FINGERPRINT === "1";

const HASHED_SEGMENT_RE = /\.[a-f0-9]{12}\.[^.]+$/i;
const FINGERPRINTABLE_EXTENSIONS = new Set([
  "css",
  "js",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "svg",
  "ico",
  "woff",
  "woff2",
  "webmanifest",
]);
const FINGERPRINTABLE_PREFIXES = [
  "images/",
  "fonts/",
  "css/",
  "js/",
];
const REWRITE_EXTENSIONS = new Set([
  ".html",
  ".xml",
  ".xsl",
  ".js",
  ".css",
  ".json",
  ".txt",
  ".webmanifest",
]);
const STABLE_LOADER_ENTRIES = [
  { sourceRel: "js/shell.js", stableRel: "js/shell.js", kind: "esm" },
  { sourceRel: "sw.js", stableRel: "sw.js", kind: "sw" },
];

function toPosixPath(value) {
  return value.replace(/\\/g, "/");
}

function fileHash(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex").slice(0, 12);
}

function collectFiles(dirPath, out = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const abs = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFiles(abs, out);
      continue;
    }

    if (!entry.isFile()) continue;

    const rel = toPosixPath(path.relative(PUBLIC_DIR, abs));
    out.push(rel);
  }

  return out;
}

function shouldFingerprint(relPath) {
  const normalized = String(relPath || "").toLowerCase();
  const parsed = path.posix.parse(normalized);

  if (HASHED_SEGMENT_RE.test(parsed.base)) return false;

  const ext = parsed.ext.replace(/^\./, "");
  if (FINGERPRINTABLE_EXTENSIONS.has(ext)) return true;

  return FINGERPRINTABLE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function shouldRewrite(relPath) {
  const ext = path.posix.extname(relPath).toLowerCase();
  return REWRITE_EXTENSIONS.has(ext);
}

function makeReplacementPairsForFile(relPath, mappings) {
  const fileDir = path.posix.dirname(relPath);
  const fromDir = fileDir === "." ? "" : fileDir;
  const pairs = [];

  for (const mapping of mappings) {
    const oldAbs = `/${mapping.sourceRel}`;
    const newAbs = `/${mapping.fingerprintedRel}`;

    pairs.push([`${SITE_ORIGIN}${oldAbs}`, `${SITE_ORIGIN}${newAbs}`]);
    pairs.push([oldAbs, newAbs]);

    const oldRel = path.posix.relative(fromDir, mapping.sourceRel) || path.posix.basename(mapping.sourceRel);
    const newRel = path.posix.relative(fromDir, mapping.fingerprintedRel) || path.posix.basename(mapping.fingerprintedRel);

    pairs.push([oldRel, newRel]);
    pairs.push([`./${oldRel}`, `./${newRel}`]);
  }

  pairs.sort((a, b) => b[0].length - a[0].length);
  return pairs;
}

function rewriteReferences(mappings) {
  const stableSourceSet = new Set(STABLE_LOADER_ENTRIES.map((entry) => entry.sourceRel));
  const rewriteMappings = mappings.filter((mapping) => !stableSourceSet.has(mapping.sourceRel));
  const files = collectFiles(PUBLIC_DIR).filter(shouldRewrite);

  let touched = 0;
  for (const relPath of files) {
    const absFile = path.join(PUBLIC_DIR, ...relPath.split("/"));
    const original = fs.readFileSync(absFile, "utf8");
    let rewritten = original;
    const replacements = makeReplacementPairsForFile(relPath, rewriteMappings);

    for (const [from, to] of replacements) {
      if (rewritten.includes(from)) {
        rewritten = rewritten.split(from).join(to);
      }
    }

    if (rewritten !== original) {
      fs.writeFileSync(absFile, rewritten, "utf8");
      touched += 1;
    }
  }

  return touched;
}

function toPublicAbsolutePath(relPath) {
  return path.join(PUBLIC_DIR, ...relPath.split("/"));
}

function stableLoaderContent(kind, targetRel) {
  const targetPath = `/${targetRel}`;

  if (kind === "sw") {
    return [
      "// Auto-generated stable service worker loader.",
      `importScripts(${JSON.stringify(targetPath)});`,
      "",
    ].join("\n");
  }

  return [
    "// Auto-generated stable ESM loader.",
    `import ${JSON.stringify(targetPath)};`,
    "",
  ].join("\n");
}

function emitStableLoaders(mappings) {
  const mappingBySource = new Map(mappings.map((mapping) => [mapping.sourceRel, mapping.fingerprintedRel]));
  const written = [];

  for (const entry of STABLE_LOADER_ENTRIES) {
    const targetRel = mappingBySource.get(entry.sourceRel);
    if (!targetRel) continue;

    const stableAbs = toPublicAbsolutePath(entry.stableRel);
    const stableDir = path.dirname(stableAbs);
    fs.mkdirSync(stableDir, { recursive: true });
    fs.writeFileSync(stableAbs, stableLoaderContent(entry.kind, targetRel), "utf8");
    written.push({ stableRel: entry.stableRel, targetRel });
  }

  return written;
}

function writeAssetManifest(mappings, stableLoaders) {
  const manifestPath = path.join(PUBLIC_DIR, "asset-manifest.json");
  const payload = {
    generatedAt: new Date().toISOString(),
    assets: mappings.map((mapping) => ({
      original: `/${mapping.sourceRel}`,
      fingerprinted: `/${mapping.fingerprintedRel}`,
    })),
    stable_loaders: stableLoaders.map((loader) => ({
      stable: `/${loader.stableRel}`,
      target: `/${loader.targetRel}`,
    })),
  };

  fs.writeFileSync(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`ERROR: public directory not found: ${PUBLIC_DIR}`);
    process.exit(1);
  }

  const targetDirName = path.basename(PUBLIC_DIR).toLowerCase();
  if (!ALLOW_NON_PUBLIC_TARGET && targetDirName !== "public") {
    console.error(
      `ERROR: refusing to fingerprint non-public directory '${PUBLIC_DIR}'. ` +
      "Use output dir named 'public' or set ALLOW_NON_PUBLIC_FINGERPRINT=1 to override."
    );
    process.exit(1);
  }

  const candidates = collectFiles(PUBLIC_DIR).filter(shouldFingerprint);
  const mappings = [];
  for (const sourceRel of candidates) {
    const sourceAbs = path.join(PUBLIC_DIR, ...sourceRel.split("/"));
    const sourceContent = fs.readFileSync(sourceAbs);
    const hash = fileHash(sourceContent);

    const parsed = path.posix.parse(sourceRel);
    const fingerprintedName = parsed.ext
      ? `${parsed.name}.${hash}${parsed.ext}`
      : `${parsed.base}.${hash}`;
    const fingerprintedRel = parsed.dir
      ? path.posix.join(parsed.dir, fingerprintedName)
      : fingerprintedName;
    const fingerprintedAbs = path.join(PUBLIC_DIR, ...fingerprintedRel.split("/"));

    if (fs.existsSync(fingerprintedAbs)) {
      fs.rmSync(fingerprintedAbs, { force: true });
    }

    fs.renameSync(sourceAbs, fingerprintedAbs);
    mappings.push({ sourceRel, fingerprintedRel });
  }

  if (mappings.length === 0) {
    console.log("No fingerprint targets found; skipping asset fingerprint step.");
    return;
  }

  const touchedFiles = rewriteReferences(mappings);
  const stableLoaders = emitStableLoaders(mappings);
  writeAssetManifest(mappings, stableLoaders);

  console.log(`Fingerprinted ${mappings.length} assets (original files removed) and rewrote ${touchedFiles} files.`);
  for (const mapping of mappings) {
    console.log(` - /${mapping.sourceRel} -> /${mapping.fingerprintedRel}`);
  }
  if (stableLoaders.length > 0) {
    console.log(`Generated ${stableLoaders.length} stable loader file(s):`);
    for (const loader of stableLoaders) {
      console.log(` * /${loader.stableRel} -> /${loader.targetRel}`);
    }
  }
}

main();
