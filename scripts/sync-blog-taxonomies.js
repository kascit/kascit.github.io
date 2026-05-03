#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { ROOT, collectFiles, tomlArray, compactUnique } = require("./lib/shared");
const { loadTaxonomyRules, deriveSemanticTagsFromValues, deriveBlogCategory } = require("./lib/taxonomy");

const BLOG_DIR = path.join(ROOT, "content", "blog");

function toCanonicalTags(input, rules) {
  const canonical = new Set(
    (rules.canonical_tags || [])
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return compactUnique(input || [])
    .map((item) => String(item || "").trim().toLowerCase())
    .filter((tag) => Boolean(tag) && (canonical.size === 0 || canonical.has(tag)));
}

function parseFrontMatter(raw, filePath) {
  const match = raw.match(/^(\+\+\+\s*\n)([\s\S]*?)(\n\+\+\+\s*\n?)([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid TOML frontmatter in ${path.relative(ROOT, filePath)}`);
  }

  return {
    prefix: match[1],
    frontMatterBody: match[2],
    suffix: match[3],
    contentBody: match[4],
  };
}

function parseTomlArray(line) {
  const values = [];
  if (!line) return values;

  const regex = /"([^"]+)"/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    values.push(match[1]);
  }

  return compactUnique(values);
}

function stripTaxonomiesTable(frontMatterBody) {
  const lines = frontMatterBody.split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();

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

    out.push(lines[i]);
  }

  while (out.length > 0 && out[out.length - 1].trim() === "") out.pop();
  return out.join("\n");
}

function extractTitleAndDescription(frontMatterBody) {
  const titleMatch = frontMatterBody.match(/^\s*title\s*=\s*"([^"]*)"\s*$/m);
  const descMatch = frontMatterBody.match(/^\s*description\s*=\s*"([^"]*)"\s*$/m);

  return {
    title: titleMatch ? titleMatch[1] : "",
    description: descMatch ? descMatch[1] : "",
  };
}

function extractTaxonomyArrays(frontMatterBody) {
  const taxMatch = frontMatterBody.match(/\[taxonomies\]([\s\S]*?)(\n\[[^\]]+\]|$)/m);
  if (!taxMatch) return { tags: [], categories: [] };

  const block = taxMatch[1] || "";
  const tagsLine = block.match(/^\s*tags\s*=\s*\[[^\]]*\]\s*$/m);
  const categoriesLine = block.match(/^\s*categories\s*=\s*\[[^\]]*\]\s*$/m);

  return {
    tags: parseTomlArray(tagsLine ? tagsLine[0] : ""),
    categories: parseTomlArray(categoriesLine ? categoriesLine[0] : ""),
  };
}

function buildFile(parsed, nextTags, nextCategories) {
  const stripped = stripTaxonomiesTable(parsed.frontMatterBody);
  const nextFrontMatter = [
    stripped,
    "",
    "[taxonomies]",
    `tags = ${tomlArray(nextTags)}`,
    `categories = ${tomlArray(nextCategories)}`,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  return `${parsed.prefix}${nextFrontMatter}\n+++\n${parsed.contentBody}`;
}

function main() {
  const rules = loadTaxonomyRules();
  const blogFiles = collectFiles(
    BLOG_DIR,
    (abs, entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("_")
  );

  let updated = 0;
  for (const filePath of blogFiles) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = parseFrontMatter(raw, filePath);
    const taxonomy = extractTaxonomyArrays(parsed.frontMatterBody);
    const meta = extractTitleAndDescription(parsed.frontMatterBody);

    const nextTags = toCanonicalTags(deriveSemanticTagsFromValues(
      [...taxonomy.tags, ...taxonomy.categories, meta.title, meta.description],
      rules,
      { maxTags: 4 }
    ), rules);

    const fallbackTags = toCanonicalTags(taxonomy.tags || [], rules);
    const safeTags = nextTags.length > 0 ? nextTags : fallbackTags;
    if (safeTags.length === 0) {
      safeTags.push("meta");
    }
    const nextCategory = deriveBlogCategory(safeTags, rules);
    const nextCategories = [nextCategory];

    const nextFile = buildFile(parsed, safeTags, nextCategories);
    if (nextFile !== raw) {
      fs.writeFileSync(filePath, nextFile, "utf8");
      updated += 1;
    }
  }

  console.log(`Blog taxonomy sync complete: ${updated} file(s) updated.`);
}

main();
