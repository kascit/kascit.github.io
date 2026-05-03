#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");
const { ROOT, compactUnique } = require("./lib/shared");
const { loadTaxonomyRules, deriveSemanticTagsFromValues } = require("./lib/taxonomy");

const DATA_FILE = path.join(ROOT, "data", "projects.json");
const API_BASE = "https://api.github.com";

function readProjects() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);
  parsed.projects = Array.isArray(parsed.projects) ? parsed.projects : [];
  return parsed;
}

function writeProjects(data) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseRepoFromUrl(url) {
  const value = String(url || "").trim();
  if (!value) return null;

  const match = value.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

function getGitHubToken() {
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  if (envToken.trim()) return envToken.trim();

  try {
    const token = execSync("gh auth token", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();

    return token;
  } catch {
    return "";
  }
}

function githubRequest(endpoint, token) {
  const headers = {
    "User-Agent": "kascit-project-sync",
    Accept: "application/vnd.github+json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      `${API_BASE}${endpoint}`,
      {
        method: "GET",
        headers,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`GitHub API ${endpoint} failed with ${res.statusCode}: ${body.slice(0, 200)}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Invalid JSON from GitHub API ${endpoint}: ${error.message}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function titleCaseToken(token) {
  const acronyms = new Map([
    ["api", "API"],
    ["aws", "AWS"],
    ["gcp", "GCP"],
    ["cli", "CLI"],
    ["ci", "CI"],
    ["cd", "CD"],
    ["dsa", "DSA"],
    ["iot", "IoT"],
    ["ui", "UI"],
    ["ux", "UX"],
    ["jpa", "JPA"],
    ["h2", "H2"],
    ["cpp", "C++"],
  ]);

  const lower = token.toLowerCase();
  if (acronyms.has(lower)) return acronyms.get(lower);
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatTopic(topic) {
  return String(topic || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseToken)
    .join(" ");
}

function toLanguageList(languagesPayload) {
  const entries = Object.entries(languagesPayload || {});
  if (entries.length === 0) return [];

  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .filter(Boolean);
}

function deriveStatus(existingStatus, repoArchived, hasPublicUrl) {
  if (repoArchived) return "archived";
  if (String(existingStatus || "").toLowerCase() === "wip") return "wip";
  if (hasPublicUrl) return "live";
  return String(existingStatus || "").trim() || "live";
}

function toCanonicalTags(input, rules) {
  const canonical = new Set(
    (rules.canonical_tags || [])
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return compactUnique(input || [])
    .map((tag) => String(tag || "").trim().toLowerCase())
    .filter((tag) => Boolean(tag) && (canonical.size === 0 || canonical.has(tag)));
}

async function syncProjectFromGitHub(project, token, rules) {
  const repoRef = parseRepoFromUrl(project.github_url);
  if (!repoRef) return { project, synced: false, reason: "no-github-url" };

  const { owner, repo } = repoRef;
  const repoData = await githubRequest(`/repos/${owner}/${repo}`, token);
  const languagesPayload = await githubRequest(`/repos/${owner}/${repo}/languages`, token);

  const languageList = toLanguageList(languagesPayload);
  const primaryLanguage = languageList[0] || String(repoData.language || "").trim();
  const langDisplay = compactUnique(languageList).slice(0, 2).join(" · ") || primaryLanguage;
  const repoTopics = compactUnique(repoData.topics || []);

  const techs = compactUnique([
    ...languageList,
    ...repoTopics.map(formatTopic),
    ...(project.techs || []),
  ]).slice(0, 6);

  const semanticTags = deriveSemanticTagsFromValues(
    [
      project.title,
      project.description,
      project.role,
      project.group,
      ...(project.tags || []),
      ...repoTopics,
      ...languageList,
      repoData.language || "",
    ],
    rules,
    { maxTags: 5 }
  );
  const existingTags = toCanonicalTags(project.tags || [], rules);
  const derivedTags = toCanonicalTags(semanticTags, rules);

  project.repo_language = primaryLanguage;
  project.repo_topics = repoTopics;
  project.repo_updated_at = repoData.pushed_at || repoData.updated_at || "";
  project.repo_archived = Boolean(repoData.archived);
  project.repo_stars = Number.isFinite(repoData.stargazers_count) ? Number(repoData.stargazers_count) : 0;

  if (langDisplay) project.lang = langDisplay;
  if (techs.length > 0) project.techs = techs;
  if (existingTags.length > 0) {
    project.tags = existingTags;
  } else if (derivedTags.length > 0) {
    project.tags = derivedTags;
  }

  const hasPublicUrl = Boolean(String(project.live_url || project.url || "").trim());
  project.status = deriveStatus(project.status, project.repo_archived, hasPublicUrl);

  return { project, synced: true, reason: `${owner}/${repo}` };
}

async function main() {
  const token = getGitHubToken();
  if (!token) {
    console.error("GitHub token not found. Set GITHUB_TOKEN or run `gh auth login` first.");
    process.exit(1);
  }

  const rules = loadTaxonomyRules();
  const data = readProjects();

  let syncedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < data.projects.length; i += 1) {
    const project = data.projects[i];

    try {
      const result = await syncProjectFromGitHub(project, token, rules);
      if (result.synced) {
        syncedCount += 1;
        console.log(`synced: ${result.reason}`);
      } else {
        skippedCount += 1;
        console.log(`skipped: ${project.slug || "(unknown)"} (${result.reason})`);
      }
    } catch (error) {
      skippedCount += 1;
      console.error(`failed: ${project.slug || "(unknown)"} - ${error.message}`);
    }
  }

  writeProjects(data);
  console.log(`Project data sync complete. synced=${syncedCount}, skipped=${skippedCount}`);
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
