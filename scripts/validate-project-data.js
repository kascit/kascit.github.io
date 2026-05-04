#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "projects.json");
const TAXONOMY_RULES_FILE = path.join(ROOT, "data", "taxonomy-rules.json");
const ALLOWED_GROUPS = new Set([
  "featured",
  "ecosystem",
  "personal",
  "learning",
  "experiments",
]);
const ALLOWED_STATUS = new Set(["", "live", "academic", "archived", "wip"]);

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isValidUrlLike(value) {
  if (!isNonEmptyString(value)) return false;
  const v = value.trim();
  if (v.startsWith("/")) return true;
  try {
    const parsed = new URL(v);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateProject(project, index, seenSlugs, errors, canonicalTags) {
  const id = `[project ${index + 1}]`;

  if (!isNonEmptyString(project.slug)) {
    errors.push(`${id} missing required string: slug`);
  }
  if (!isNonEmptyString(project.title)) {
    errors.push(`${id} missing required string: title`);
  }
  if (!isNonEmptyString(project.group)) {
    errors.push(`${id} missing required string: group`);
  }
  if (!isNonEmptyString(project.description)) {
    errors.push(`${id} missing required string: description`);
  }

  const slug = String(project.slug || "").trim();
  if (slug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`${id} invalid slug format: ${slug}`);
    }
    if (seenSlugs.has(slug)) {
      errors.push(`${id} duplicate slug detected: ${slug}`);
    }
    seenSlugs.add(slug);
  }

  const group = String(project.group || "").trim();
  if (group && !ALLOWED_GROUPS.has(group)) {
    errors.push(
      `${id} invalid group '${group}'. Allowed: ${Array.from(ALLOWED_GROUPS).join(", ")}`,
    );
  }

  const status = String(project.status || "")
    .trim()
    .toLowerCase();
  if (!ALLOWED_STATUS.has(status)) {
    errors.push(
      `${id} invalid status '${project.status}'. Allowed: live, academic, archived, wip`,
    );
  }

  const arrayFields = ["techs", "tags", "highlights", "repo_topics"];
  for (const field of arrayFields) {
    if (project[field] !== undefined && !isStringArray(project[field])) {
      errors.push(`${id} field '${field}' must be an array of strings`);
    }
  }

  const tags = Array.isArray(project.tags) ? project.tags : [];
  if (tags.length === 0) {
    errors.push(`${id} must define at least one taxonomy tag`);
  }
  for (const tag of tags) {
    const normalized = String(tag || "")
      .trim()
      .toLowerCase();
    if (!normalized) continue;

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
      errors.push(
        `${id} tag '${tag}' must be lowercase slug format (e.g. backend, cloud-native)`,
      );
      continue;
    }
  }

  const stringFields = [
    "icon",
    "lang",
    "role",
    "date",
    "url_label",
    "extended_description",
    "problem",
    "approach",
    "outcome",
    "content_markdown",
    "thumbnail_image",
    "thumbnail_alt",
    "repo_language",
    "repo_updated_at",
  ];
  for (const field of stringFields) {
    if (project[field] !== undefined && typeof project[field] !== "string") {
      errors.push(`${id} field '${field}' must be a string`);
    }
  }

  const urlFields = ["github_url", "live_url", "url"];
  for (const field of urlFields) {
    if (
      project[field] !== undefined &&
      project[field] !== "" &&
      !isValidUrlLike(project[field])
    ) {
      errors.push(
        `${id} field '${field}' has invalid URL/path value: ${project[field]}`,
      );
    }
  }

  if (
    project.thumbnail_image !== undefined &&
    project.thumbnail_image !== "" &&
    !String(project.thumbnail_image).startsWith("/")
  ) {
    errors.push(
      `${id} field 'thumbnail_image' must be a root-relative path (start with '/')`,
    );
  }

  if (project.external !== undefined && typeof project.external !== "boolean") {
    errors.push(`${id} field 'external' must be a boolean`);
  }

  if (
    project.repo_archived !== undefined &&
    typeof project.repo_archived !== "boolean"
  ) {
    errors.push(`${id} field 'repo_archived' must be a boolean`);
  }

  if (
    project.repo_stars !== undefined &&
    !Number.isFinite(project.repo_stars)
  ) {
    errors.push(`${id} field 'repo_stars' must be a number`);
  }
}

function main() {
  let data;
  try {
    data = readJson(DATA_FILE);
  } catch (error) {
    console.error(`Project data parse error: ${error.message}`);
    process.exit(1);
  }

  const projects = Array.isArray(data.projects) ? data.projects : null;
  if (!projects) {
    console.error("Project data must contain a top-level 'projects' array.");
    process.exit(1);
  }

  const errors = [];
  const seenSlugs = new Set();
  projects.forEach((project, index) =>
    validateProject(project, index, seenSlugs, errors, new Set()),
  );

  if (errors.length > 0) {
    console.error("Project data validation failed:");
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `Validated ${projects.length} project entr${projects.length === 1 ? "y" : "ies"}.`,
  );
}

main();
