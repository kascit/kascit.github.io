/**
 * Keyboard Shortcut Hints renderer
 */
import { isMobile } from './responsive.js';

export function initShortcuts() {
  document.querySelectorAll("[data-shortcut]").forEach(renderShortcut);
}

function renderShortcut(el) {
  const spec = el.getAttribute("data-shortcut");
  if (!spec) return;

  const desktopOnly = el.getAttribute("data-desktop-only") === "true";
  if (desktopOnly && isMobile()) {
    el.style.display = "none";
    return;
  }

  const platform = (navigator.userAgentData?.platform) || navigator.platform || "";
  const isMac = /mac/i.test(platform);
  const primary = isMac ? "⌘" : "Ctrl";
  const altLabel = isMac ? "Option" : "Alt";
  const metaLabel = isMac ? "⌘" : "Win";

  const parts = spec.split("+").map(key => {
    const lower = key.trim().toLowerCase();
    if (lower === "primary") return primary;
    if (lower === "alt") return altLabel;
    if (lower === "meta") return metaLabel;
    if (lower === "shift") return "Shift";
    if (lower === "cmd" || lower === "command") return "⌘";
    return key.length === 1 ? key.toUpperCase() : key;
  });

  el.innerHTML = parts.map(k => `<kbd class="kbd">${k}</kbd>`).join("");
  el.classList.remove("hidden");
  el.style.display = "inline-flex";
  el.style.gap = "2px";
  el.classList.add("shortcut-hint-ready");
}
