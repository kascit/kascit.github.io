/**
 * Keyboard Shortcut Hints renderer
 */
import { isMobile } from './responsive.js';

let desktopOnlyVisibilityBound = false;
let desktopOnlyResizeTimer = null;

export function initShortcuts() {
  applyDesktopOnlyVisibility();
  document.querySelectorAll("[data-shortcut]").forEach(renderShortcut);

  if (!desktopOnlyVisibilityBound) {
    desktopOnlyVisibilityBound = true;
    window.addEventListener("resize", () => {
      if (desktopOnlyResizeTimer) {
        window.clearTimeout(desktopOnlyResizeTimer);
      }
      desktopOnlyResizeTimer = window.setTimeout(() => {
        desktopOnlyResizeTimer = null;
        applyDesktopOnlyVisibility();
      }, 120);
    });
  }
}

function applyDesktopOnlyVisibility() {
  const hideDesktopOnly = isMobile();
  document.querySelectorAll('[data-desktop-only="true"]').forEach((el) => {
    const hadStyle = el.hasAttribute("data-desktop-only-style");
    if (!hadStyle) {
      el.setAttribute("data-desktop-only-style", el.style.display || "");
    }

    if (hideDesktopOnly) {
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      return;
    }

    const previousDisplay = el.getAttribute("data-desktop-only-style") || "";
    el.style.display = previousDisplay;
    el.removeAttribute("aria-hidden");
  });
}

function renderShortcut(el) {
  if (el.getAttribute("data-shortcut-ready") === "1") return;

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

  el.textContent = "";
  parts.forEach((part, index) => {
    const kbd = document.createElement("kbd");
    kbd.className = "kbd";
    kbd.textContent = part;
    el.appendChild(kbd);
    if (index < parts.length - 1) {
      el.appendChild(document.createTextNode(" "));
    }
  });
  el.classList.remove("hidden");
  el.style.display = "inline-flex";
  el.style.gap = "2px";
  el.classList.add("shortcut-hint-ready");
  el.setAttribute("data-shortcut-ready", "1");
}
