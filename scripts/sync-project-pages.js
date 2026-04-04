#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "projects.json");
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const LEGACY_OUT_DIR = path.join(PROJECTS_DIR, "generated");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeLegacyGeneratedDir() {
  fs.rmSync(LEGACY_OUT_DIR, { recursive: true, force: true });
}

function removePreviouslyGeneratedPages(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".md")) continue;
    if (entry.name === "_index.md") continue;

    const filePath = path.join(dirPath, entry.name);
    const raw = fs.readFileSync(filePath, "utf8");
    const isGeneratedProjectPage =
      raw.includes("[extra.project]") &&
      /\bgenerated\s*=\s*true\b/.test(raw);

    if (isGeneratedProjectPage) {
      fs.rmSync(filePath, { force: true });
    }
  }
}

function tomlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/\"/g, '\\"')}"`;
}

function tomlArray(values) {
  if (!Array.isArray(values) || values.length === 0) return "[]";
  return `[${values.map((v) => tomlString(v)).join(", ")}]`;
}

function compactUnique(values) {
  const out = [];
  const seen = new Set();

  for (const value of values || []) {
    const trimmed = String(value || "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }

  return out;
}

function renderPage(project) {
  const title = String(project.title || project.slug || "Untitled Project").trim();
  const description = String(project.description || "").trim();
  const extendedDescription = String(project.extended_description || "").trim();
  const problem = String(project.problem || "").trim();
  const approach = String(project.approach || "").trim();
  const outcome = String(project.outcome || "").trim();
  const contentMarkdown = String(project.content_markdown || "").trim();
  const slug = String(project.slug || "").trim();
  const group = String(project.group || "").trim();
  const status = String(project.status || "").trim();
  const date = String(project.date || "2026-01-01").trim();
  const lang = String(project.lang || "").trim();
  const role = String(project.role || "").trim();
  const icon = String(project.icon || "").trim();
  const github = String(project.github_url || "").trim();
  const live = String(project.live_url || "").trim();
  const url = String(project.url || "").trim();
  const urlLabel = String(project.url_label || "Visit").trim();
  const external = Boolean(project.external);
  const techs = compactUnique(project.techs || []);
  const highlights = compactUnique(project.highlights || []);
  const thumbnailImage = String(project.thumbnail_image || "").trim();
  const thumbnailAlt = String(project.thumbnail_alt || title).trim();
  const tags = compactUnique([...(project.tags || []), ...techs]);

  const statusBadgeMap = {
    live: "Live",
    academic: "Academic",
    archived: "Archived",
    wip: "WIP",
  };
  const badge = statusBadgeMap[status.toLowerCase()] || "";

  const links = [];
  if (live) links.push(`- Live: [${title}](${live})`);
  if (github) links.push(`- Code: [GitHub repository](${github})`);
  if (url) {
    const label = urlLabel || "Visit";
    links.push(`- ${label}: [${label}](${url})`);
  }

  const bodyParts = [
    "## Overview",
    "",
    description || "Project details.",
    "",
  ];

  if (extendedDescription) {
    bodyParts.push(extendedDescription, "");
  }

  if (highlights.length > 0) {
    bodyParts.push("## Highlights", "", ...highlights.map((item) => `- ${item}`), "");
  }

  if (techs.length > 0) {
    bodyParts.push("## Tech Focus", "", ...techs.map((item) => `- ${item}`), "");
  }

  if (problem) {
    bodyParts.push("## Problem", "", problem, "");
  }

  if (approach) {
    bodyParts.push("## Approach", "", approach, "");
  }

  if (outcome) {
    bodyParts.push("## Outcome", "", outcome, "");
  }

  if (links.length > 0) {
    bodyParts.push("## Links", "", ...links, "");
  }

  if (contentMarkdown) {
    bodyParts.push(contentMarkdown, "");
  }

  const body = bodyParts.join("\n");

  const frontmatter = [
    "+++",
    `title = ${tomlString(title)}`,
    `description = ${tomlString(description)}`,
    'template = "page.html"',
    `date = ${tomlString(date)}`,
    "[extra]",
    'back_url = "/projects/"',
    'back_title = "Projects"',
    'back_subtitle = "Back to"',
  ];

  if (thumbnailImage) {
    frontmatter.push(`thumbnail_image = ${tomlString(thumbnailImage)}`);
  }
  if (thumbnailAlt) {
    frontmatter.push(`thumbnail_alt = ${tomlString(thumbnailAlt)}`);
  }
  if (badge) {
    frontmatter.push(`badge = ${tomlString(badge)}`);
  }

  frontmatter.push(
    "[extra.comments]",
    "enabled = false",
    "[taxonomies]",
    `categories = ${tomlArray(["projects"])}`,
    `tags = ${tomlArray(tags)}`,
    "[extra.project]",
    `slug = ${tomlString(slug)}`,
    `group = ${tomlString(group)}`,
    `status = ${tomlString(status)}`,
    `lang = ${tomlString(lang)}`,
    `role = ${tomlString(role)}`,
    `icon = ${tomlString(icon)}`,
    `github_url = ${tomlString(github)}`,
    `live_url = ${tomlString(live)}`,
    `url = ${tomlString(url)}`,
    `url_label = ${tomlString(urlLabel)}`,
    `external = ${external ? "true" : "false"}`,
    "generated = true",
    `techs = ${tomlArray(techs)}`,
    "+++",
    "",
    body,
    "",
  );

  return frontmatter.join("\n");
}

function main() {
  const data = readJson(DATA_FILE);
  const projects = Array.isArray(data.projects) ? data.projects : [];

  ensureDir(PROJECTS_DIR);
  removeLegacyGeneratedDir();
  removePreviouslyGeneratedPages(PROJECTS_DIR);

  let written = 0;
  for (const project of projects) {
    const slug = String(project.slug || "").trim();
    if (!slug) continue;

    const outFile = path.join(PROJECTS_DIR, `${slug}.md`);
    fs.writeFileSync(outFile, renderPage(project), "utf8");
    written += 1;
  }

  console.log(`Synced ${written} project page(s) into ${path.relative(ROOT, PROJECTS_DIR)}`);
}

main();
