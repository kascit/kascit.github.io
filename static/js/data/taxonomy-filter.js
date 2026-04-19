/**
 * Taxonomy term filter (used on /tags and /categories pages).
 * Provides fast in-page fuzzy filtering without any external dependency.
 */

function normalizeText(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function fuzzyScore(query, text) {
  if (!query) return 0;
  if (!text) return -1;

  const directIndex = text.indexOf(query);
  if (directIndex >= 0) {
    const startsWithBonus = directIndex === 0 ? 3 : 0;
    return 100 + startsWithBonus - directIndex;
  }

  let q = 0;
  let score = 0;
  let lastMatch = -2;

  for (let i = 0; i < text.length && q < query.length; i += 1) {
    if (text[i] !== query[q]) continue;

    score += 2;
    if (i === lastMatch + 1) {
      score += 1;
    }

    if (lastMatch >= 0) {
      score -= Math.max(0, (i - lastMatch - 1) * 0.08);
    }

    lastMatch = i;
    q += 1;
  }

  return q === query.length ? score : -1;
}

export function initTaxonomyFilter() {
  const root = document.querySelector("[data-taxonomy-filter]");
  if (!root) return;

  const input = root.querySelector("[data-taxonomy-filter-input]");
  const clearBtn = root.querySelector("[data-taxonomy-filter-clear]");
  const list = root.querySelector("[data-taxonomy-filter-list]");
  const meta = root.querySelector("[data-taxonomy-filter-meta]");
  const empty = root.querySelector("[data-taxonomy-filter-empty]");

  if (!input || !clearBtn || !list || !meta || !empty) return;

  const nodes = Array.from(list.querySelectorAll("[data-taxonomy-term]"));
  if (nodes.length === 0) return;

  const items = nodes.map((node, index) => {
    const rawName = node.getAttribute("data-term-name") || node.textContent || "";
    return {
      node,
      index,
      name: rawName,
      normalized: normalizeText(rawName),
    };
  });

  const total = items.length;

  function setMeta(visible, query) {
    if (!query) {
      meta.textContent = `${total} terms`;
      return;
    }

    meta.textContent = `${visible} of ${total} matching`;
  }

  function applyFilter() {
    const query = normalizeText(input.value);

    clearBtn.hidden = query.length === 0;

    if (!query) {
      items.forEach((item) => {
        item.node.hidden = false;
        item.node.style.order = String(item.index);
      });
      empty.hidden = true;
      setMeta(total, query);
      return;
    }

    const ranked = [];
    items.forEach((item) => {
      const score = fuzzyScore(query, item.normalized);
      if (score < 0) {
        item.node.hidden = true;
        return;
      }

      item.node.hidden = false;
      ranked.push({ item, score });
    });

    ranked
      .sort((a, b) => b.score - a.score || a.item.normalized.localeCompare(b.item.normalized))
      .forEach((entry, order) => {
        entry.item.node.style.order = String(order);
      });

    const visible = ranked.length;
    empty.hidden = visible > 0;
    setMeta(visible, query);
  }

  input.addEventListener("input", applyFilter);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      applyFilter();
      input.blur();
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    applyFilter();
    input.focus();
  });

  applyFilter();
}
