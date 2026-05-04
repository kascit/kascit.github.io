#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { tomlArray, compactUnique, ROOT } = require("./lib/shared");

const ABOUT_FILE = path.join(ROOT, "content", "about.md");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractAboutSkillTags(raw) {
  const tags = [];
  const tagChipRegex =
    /\{\{\s*tag_chip\(\s*name\s*=\s*"([^"]+)"[^)]*\)\s*\}\}/g;

  let match;
  while ((match = tagChipRegex.exec(raw)) !== null) {
    tags.push(match[1]);
  }

  return compactUnique(tags);
}

function extractExistingTaxonomyTags(raw) {
  const parsed = parseFrontMatter(raw);
  const taxMatch = parsed.frontMatterBody.match(
    /\[taxonomies\]([\s\S]*?)(\n\[[^\]]+\]|$)/m,
  );
  if (!taxMatch) return [];

  const block = taxMatch[1] || "";
  const tagsLine = block.match(/^\s*tags\s*=\s*\[[^\]]*\]\s*$/m);
  if (!tagsLine) return [];

  const values = [];
  const regex = /"([^"]+)"/g;
  let match;
  while ((match = regex.exec(tagsLine[0])) !== null) {
    values.push(match[1]);
  }

  return compactUnique(values);
}

function parseFrontMatter(raw) {
  const match = raw.match(/^(\+\+\+\s*\n)([\s\S]*?)(\n\+\+\+\s*\n?)([\s\S]*)$/);
  if (!match) {
    throw new Error(
      "content/about.md does not contain valid TOML frontmatter.",
    );
  }

  return {
    prefix: match[1],
    frontMatterBody: match[2],
    delimiterClose: match[3],
    contentBody: match[4],
  };
}

function stripTaxonomiesTable(frontMatterBody) {
  const lines = frontMatterBody.split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "[taxonomies]") {
      i += 1;
      while (i < lines.length) {
        const nextTrimmed = lines[i].trim();
        if (nextTrimmed.startsWith("[") && nextTrimmed.endsWith("]")) {
          i -= 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    out.push(line);
  }

  while (out.length > 0 && out[out.length - 1].trim() === "") {
    out.pop();
  }

  return out.join("\n");
}

function buildAboutWithSyncedTaxonomies(raw, tags) {
  const parsed = parseFrontMatter(raw);
  const strippedFrontMatter = stripTaxonomiesTable(parsed.frontMatterBody);
  const frontMatterParts = [
    strippedFrontMatter,
    "",
    "[taxonomies]",
    `tags = ${tomlArray(tags)}`,
  ];
  const nextFrontMatter = frontMatterParts
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  return `${parsed.prefix}${nextFrontMatter}\n+++\n${parsed.contentBody}`;
}

function main() {
  const aboutRaw = readText(ABOUT_FILE);
  const rawSkills = extractAboutSkillTags(aboutRaw);

  if (rawSkills.length === 0) {
    console.error("No tag_chip entries were found in content/about.md");
    process.exit(1);
  }

  // Direct 1:1 sync of skills to tags
  const safeTags = compactUnique(
    rawSkills.map((s) => s.trim().toLowerCase()).filter(Boolean),
  );

  const nextAbout = buildAboutWithSyncedTaxonomies(aboutRaw, safeTags);
  if (nextAbout !== aboutRaw) {
    fs.writeFileSync(ABOUT_FILE, nextAbout, "utf8");
  }

  console.log(
    `About skill tags synced into content/about.md: ${safeTags.length}`,
  );
}

main();
