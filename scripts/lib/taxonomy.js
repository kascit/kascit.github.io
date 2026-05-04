#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { ROOT, compactUnique } = require("./shared");

const RULES_FILE = path.join(ROOT, "data", "taxonomy-rules.json");

function normalizeAtom(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/[^\p{L}\p{N}\s+]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAtoms(values) {
  const atoms = new Set();

  for (const value of values || []) {
    const normalized = normalizeAtom(value);
    if (!normalized) continue;

    atoms.add(normalized);
    for (const token of normalized.split(" ")) {
      if (token.length > 1) atoms.add(token);
    }
  }

  return atoms;
}

function includesKeyword(atom, keyword) {
  return atom === keyword || atom.includes(keyword) || keyword.includes(atom);
}

function loadTaxonomyRules() {
  const raw = fs.readFileSync(RULES_FILE, "utf8");
  const parsed = JSON.parse(raw);

  parsed.canonical_tags = compactUnique(parsed.canonical_tags || []);
  parsed.tag_priority = compactUnique(
    parsed.tag_priority || parsed.canonical_tags || [],
  );
  parsed.tag_rules = Array.isArray(parsed.tag_rules) ? parsed.tag_rules : [];
  parsed.blog_category_rules = Array.isArray(parsed.blog_category_rules)
    ? parsed.blog_category_rules
    : [];

  return parsed;
}

function deriveSemanticTagsFromValues(values, rules, options) {
  const maxTags = Number.isFinite(options && options.maxTags)
    ? Number(options.maxTags)
    : 0;
  const atoms = toAtoms(values);
  const scores = new Map();

  for (const rule of rules.tag_rules || []) {
    const tag = normalizeAtom(rule.tag);
    if (!tag) continue;

    const keywords = compactUnique(rule.keywords || [])
      .map(normalizeAtom)
      .filter(Boolean);
    if (keywords.length === 0) continue;

    let score = 0;
    keywords.forEach((keyword) => {
      for (const atom of atoms) {
        if (includesKeyword(atom, keyword)) {
          score += atom === keyword ? 2 : 1;
        }
      }
    });

    if (score > 0) {
      scores.set(tag, (scores.get(tag) || 0) + score);
    }
  }

  const order = new Map(
    (rules.tag_priority || []).map((tag, index) => [normalizeAtom(tag), index]),
  );
  const sorted = Array.from(scores.keys()).sort((a, b) => {
    const as = scores.get(a) || 0;
    const bs = scores.get(b) || 0;
    if (as !== bs) return bs - as;

    const ai = order.has(a) ? order.get(a) : Number.MAX_SAFE_INTEGER;
    const bi = order.has(b) ? order.get(b) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  });

  if (maxTags > 0) return sorted.slice(0, maxTags);
  return sorted;
}

function deriveBlogCategory(tags, rules) {
  const normalizedTags = new Set(
    (tags || []).map(normalizeAtom).filter(Boolean),
  );

  for (const rule of rules.blog_category_rules || []) {
    const category = String(rule.category || "").trim();
    if (!category) continue;

    const ruleTags = (rule.tags || []).map(normalizeAtom).filter(Boolean);
    const matched = ruleTags.some((tag) => normalizedTags.has(tag));
    if (matched) return category;
  }

  return String(rules.default_blog_category || "notes");
}

module.exports = {
  RULES_FILE,
  normalizeAtom,
  loadTaxonomyRules,
  deriveSemanticTagsFromValues,
  deriveBlogCategory,
};
