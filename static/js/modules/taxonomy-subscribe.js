/**
 * Taxonomy RSS subscription helper.
 * Static-site friendly approach:
 * - Select terms (tags/categories)
 * - Persist selection in cookies across taxonomy pages
 * - Copy feed URLs
 * - Export selected feeds as OPML for feed readers
 */

import { isDesktop, onResponsiveChange } from "./responsive.js";
import { readCookie, writeCookie } from "./cookie-utils.js";

const TAXONOMY_SELECTION_COOKIE = "taxonomy-rss-selection-v1";
const TAXONOMY_SELECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const TAXONOMY_SELECTION_STORAGE_KEY = "taxonomy-rss-selection-store-v1";
const TAXONOMY_SELECTION_STORAGE_SENTINEL = "__ls__";
const MAX_COOKIE_PAYLOAD_SIZE = 3500;

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeFilePart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "taxonomy";
}

function downloadTextFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

function feedToPage(feed) {
  const value = String(feed || "");
  if (!value) return "";
  return value.replace(/rss\.xml(?:\?.*)?$/i, "");
}

function normalizeSelectionEntry(item) {
  if (Array.isArray(item)) {
    const taxonomy = String(item[0] || "taxonomy");
    const feed = String(item[1] || "");
    const name = String(item[2] || "");
    return {
      taxonomy,
      name: name || feedToPage(feed).split("/").filter(Boolean).pop() || "feed",
      feed,
      page: feedToPage(feed),
    };
  }

  return {
    taxonomy: String(item?.taxonomy || "taxonomy"),
    name: String(item?.name || ""),
    feed: String(item?.feed || ""),
    page: String(item?.page || feedToPage(item?.feed || "")),
  };
}

function parseSelectionPayload(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeSelectionEntry).filter((item) => item.feed);
  } catch (_error) {
    return [];
  }
}

function serializeSelection(items) {
  const compact = items.map((item) => [
    String(item.taxonomy || "taxonomy"),
    String(item.feed || ""),
    String(item.name || ""),
  ]);
  return JSON.stringify(compact);
}

function loadCookieSelection() {
  const raw = readCookie(TAXONOMY_SELECTION_COOKIE);
  if (raw === TAXONOMY_SELECTION_STORAGE_SENTINEL) {
    try {
      return parseSelectionPayload(localStorage.getItem(TAXONOMY_SELECTION_STORAGE_KEY) || "[]");
    } catch (_error) {
      return [];
    }
  }

  return parseSelectionPayload(raw);
}

function saveCookieSelection(items) {
  try {
    const payload = serializeSelection(items);

    if (payload.length > MAX_COOKIE_PAYLOAD_SIZE) {
      localStorage.setItem(TAXONOMY_SELECTION_STORAGE_KEY, payload);
      writeCookie(
        TAXONOMY_SELECTION_COOKIE,
        TAXONOMY_SELECTION_STORAGE_SENTINEL,
        {
          maxAgeSeconds: TAXONOMY_SELECTION_COOKIE_MAX_AGE,
          path: "/",
          sameSite: "Lax",
          secure: window.location.protocol === "https:",
        }
      );
      return;
    }

    localStorage.removeItem(TAXONOMY_SELECTION_STORAGE_KEY);
    writeCookie(TAXONOMY_SELECTION_COOKIE, payload, {
      maxAgeSeconds: TAXONOMY_SELECTION_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "Lax",
      secure: window.location.protocol === "https:",
    });
  } catch (_error) {
    // ignore cookie write failures
  }
}

function buildOpml(selectedTerms) {
  const title = "custom taxonomy feeds";
  const now = new Date().toUTCString();
  const outlines = selectedTerms
    .map((term) => `    <outline text="${xmlEscape(term.name)}" title="${xmlEscape(term.name)}" type="rss" xmlUrl="${xmlEscape(term.feed)}" htmlUrl="${xmlEscape(term.page)}" category="${xmlEscape(term.taxonomy)}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>${xmlEscape(title)}</title>\n    <dateCreated>${xmlEscape(now)}</dateCreated>\n  </head>\n  <body>\n${outlines}\n  </body>\n</opml>\n`;
}

export function initTaxonomySubscribe() {
  const rail = document.querySelector("[data-taxonomy-subscribe]");
  if (!rail) return;

  const selectedWrap = rail.querySelector("[data-taxonomy-subscribe-selected]");
  const emptyNode = rail.querySelector("[data-taxonomy-subscribe-empty]");
  const metaNode = rail.querySelector("[data-taxonomy-subscribe-meta]");
  const singleLink = rail.querySelector("[data-taxonomy-subscribe-single]");
  const copyBtn = rail.querySelector("[data-taxonomy-subscribe-copy]");
  const opmlBtn = rail.querySelector("[data-taxonomy-subscribe-opml]");
  const clearBtn = rail.querySelector("[data-taxonomy-subscribe-clear]");
  const addVisibleBtn = rail.querySelector("[data-taxonomy-subscribe-add-visible]");

  if (!selectedWrap || !emptyNode || !metaNode || !singleLink || !copyBtn || !opmlBtn || !clearBtn || !addVisibleBtn) {
    return;
  }

  const termNodes = Array.from(document.querySelectorAll("[data-taxonomy-term][data-term-feed]"));
  if (termNodes.length === 0) return;

  const taxonomyName = rail.getAttribute("data-taxonomy-name") || "taxonomy";
  const selected = new Map(loadCookieSelection().map((term) => [term.feed, term]));

  function getTermData(node) {
    return {
      taxonomy: node.getAttribute("data-term-taxonomy") || taxonomyName,
      name: node.getAttribute("data-term-name") || "",
      feed: node.getAttribute("data-term-feed") || "",
      page: node.getAttribute("data-term-url") || "",
    };
  }

  function setNodeSelected(node, isSelected) {
    node.classList.toggle("is-selected", isSelected);
    const toggle = node.querySelector("[data-taxonomy-subscribe-toggle]");
    if (!toggle) return;

    toggle.setAttribute("aria-pressed", isSelected ? "true" : "false");
    toggle.innerHTML = isSelected
      ? '<i class="fa-solid fa-check"></i>'
      : '<i class="fa-solid fa-plus"></i>';
  }

  function taxonomyIconClass(taxonomy) {
    const value = String(taxonomy || "").toLowerCase();
    return value === "categories" || value === "category"
      ? "fa-regular fa-folder"
      : "fa-solid fa-tag";
  }

  function renderSelected() {
    selectedWrap.innerHTML = "";

    const values = Array.from(selected.values());
    const count = values.length;
    const hasSelection = count > 0;

    values.forEach((term) => {
      const chip = document.createElement("div");
      chip.className = "taxonomy-subscribe-chip";

      const icon = document.createElement("i");
      icon.className = `${taxonomyIconClass(term.taxonomy)} taxonomy-subscribe-chip-icon`;
      icon.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.textContent = term.name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "taxonomy-subscribe-chip-remove";
      removeBtn.setAttribute("aria-label", `Remove ${term.name}`);
      removeBtn.setAttribute("data-remove-feed", term.feed);
      removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

      chip.appendChild(icon);
      chip.appendChild(text);
      chip.appendChild(removeBtn);
      selectedWrap.appendChild(chip);
    });

    emptyNode.hidden = hasSelection;
    metaNode.textContent = `${count} selected`;
    copyBtn.disabled = !hasSelection;
    opmlBtn.disabled = !hasSelection;

    if (count === 1) {
      singleLink.href = values[0].feed;
      singleLink.classList.remove("is-disabled");
      singleLink.setAttribute("aria-disabled", "false");
    } else {
      singleLink.removeAttribute("href");
      singleLink.classList.add("is-disabled");
      singleLink.setAttribute("aria-disabled", "true");
    }

    saveCookieSelection(values);
  }

  function toggleNode(node) {
    const term = getTermData(node);
    if (!term.feed) return;

    if (selected.has(term.feed)) {
      selected.delete(term.feed);
      setNodeSelected(node, false);
    } else {
      selected.set(term.feed, term);
      setNodeSelected(node, true);
    }

    renderSelected();
  }

  termNodes.forEach((node) => {
    const term = getTermData(node);
    setNodeSelected(node, selected.has(term.feed));
    const toggle = node.querySelector("[data-taxonomy-subscribe-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleNode(node);
    });
  });

  function applyPickerVisibility() {
    const allow = isDesktop();
    termNodes.forEach((node) => {
      const toggle = node.querySelector("[data-taxonomy-subscribe-toggle]");
      if (!toggle) return;

      toggle.hidden = !allow;
      toggle.disabled = !allow;
      node.classList.toggle("is-picker-enabled", allow);
    });
  }

  applyPickerVisibility();
  onResponsiveChange(applyPickerVisibility);

  selectedWrap.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-feed]");
    if (!removeBtn) return;

    const feed = removeBtn.getAttribute("data-remove-feed");
    if (!feed || !selected.has(feed)) return;

    selected.delete(feed);
    const node = termNodes.find((termNode) => termNode.getAttribute("data-term-feed") === feed);
    if (node) setNodeSelected(node, false);
    renderSelected();
  });

  clearBtn.addEventListener("click", () => {
    selected.clear();
    termNodes.forEach((node) => setNodeSelected(node, false));
    renderSelected();
  });

  addVisibleBtn.addEventListener("click", () => {
    termNodes.forEach((node) => {
      if (node.hidden) return;
      const term = getTermData(node);
      if (!term.feed) return;

      selected.set(term.feed, term);
      setNodeSelected(node, true);
    });

    renderSelected();
  });

  copyBtn.addEventListener("click", async () => {
    if (copyBtn.disabled) return;
    const urls = Array.from(selected.values()).map((term) => term.feed);
    const text = urls.join("\n");

    try {
      await navigator.clipboard.writeText(text);
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copied";
      window.setTimeout(() => {
        copyBtn.textContent = original;
      }, 1200);
    } catch (_error) {
      // Clipboard can fail in non-secure contexts; fallback to download.
      downloadTextFile(`${safeFilePart(taxonomyName)}-feeds.txt`, `${text}\n`, "text/plain;charset=utf-8");
    }
  });

  opmlBtn.addEventListener("click", () => {
    if (opmlBtn.disabled) return;
    const terms = Array.from(selected.values());
    const opml = buildOpml(terms);
    downloadTextFile("taxonomy-feeds.opml", opml, "text/x-opml;charset=utf-8");
  });

  singleLink.addEventListener("click", (event) => {
    if (singleLink.classList.contains("is-disabled")) {
      event.preventDefault();
    }
  });

  renderSelected();
}
