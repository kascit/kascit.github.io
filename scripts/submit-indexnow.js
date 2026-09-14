#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const { ROOT } = require("./lib/shared");

const INDEXNOW_KEY = "b8a07c11d2e947cf8f419b4e138a7c2d";
const HOST = "dhanur.me";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_PATH = path.resolve(ROOT, "public", "sitemap.xml");

const isDryRun = process.argv.includes("--dry-run");

function extractUrlsFromSitemap(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`sitemap.xml not found at ${sitemapPath}. Build site first.`);
  }

  const content = fs.readFileSync(sitemapPath, "utf8");
  const urls = [];
  const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function submitToIndexNow(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: "api.indexnow.org",
      port: 443,
      path: "/indexnow",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          // IndexNow returns 200 (OK) or 202 (Accepted) on success
          reject(new Error(`IndexNow submission failed with HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("IndexNow request timed out"));
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    const urls = extractUrlsFromSitemap(SITEMAP_PATH);
    console.log(`[INFO] Found ${urls.length} URL(s) in sitemap for IndexNow.`);

    if (urls.length === 0) {
      console.log("[WARN] No URLs found in sitemap.xml. Skipping submission.");
      return;
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls.slice(0, 10000), // IndexNow allows up to 10,000 URLs per submit
    };

    if (isDryRun) {
      console.log(`[DRY-RUN] Would submit ${payload.urlList.length} URL(s) to IndexNow:`);
      console.log(`[DRY-RUN] Key Location: ${payload.keyLocation}`);
      console.log(`[DRY-RUN] First 3 URLs: ${payload.urlList.slice(0, 3).join(", ")}`);
      return;
    }

    console.log(`[INFO] Submitting ${payload.urlList.length} URL(s) to IndexNow (api.indexnow.org)...`);
    const result = await submitToIndexNow(payload);
    console.log(`[OK] IndexNow submission successful (HTTP ${result.status}).`);
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    // Non-blocking in CI/CD so network timeouts don't fail deployment
    process.exit(isDryRun ? 1 : 0);
  }
}

main();
