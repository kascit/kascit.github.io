/**
 * Access-key hint overlay.
 *
 * Hold Alt to reveal single-character badges on interactive elements.
 * While hints are visible, pressing a hint character activates that element.
 * Release Alt (or press Escape) to dismiss.
 *
 * Two-character hints are used when there are more elements than single chars.
 * Typing the first character of a two-char hint narrows the visible set; the
 * second character activates. Works like Vimium link-hints.
 *
 * Only in-viewport, visible, non-aria-hidden, non-inert elements are hinted.
 */

import { isMobile, prefersReducedMotion } from "./responsive.js";

// ─── Constants ───────────────────────────────────────────────────────
const HINT_CHARS = "sadfjklewcmpgh";
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled]):not([hidden])",
  "input:not([disabled]):not([hidden]):not([type='hidden'])",
  "select:not([disabled]):not([hidden])",
  "textarea:not([disabled]):not([hidden])",
  "[role='button']:not([disabled])",
  "[role='link']",
  "[role='tab']",
  "[tabindex]:not([tabindex='-1'])",
  "summary",
  "details > summary",
].join(", ");

const BADGE_OFFSET_X = 0;
const BADGE_OFFSET_Y = 0;
const BADGE_MARGIN = 2;

// ─── State ───────────────────────────────────────────────────────────
let active = false;
let hintNodes = [];
let narrowPrefix = "";
let listenersBound = false;
let badgeContainer = null;

// ─── Visibility / eligibility ────────────────────────────────────────

/**
 * Determine whether an element is truly interactive, visible, and in the
 * viewport.  Filters out:
 *   - disconnected nodes
 *   - zero-area elements
 *   - elements hidden via CSS (display:none, visibility:hidden, opacity <= 0.01)
 *   - elements behind aria-hidden or inert subtrees
 *   - elements inside a closed <details> (not the summary itself)
 *   - elements outside the viewport rect
 */
function isVisible(element) {
  if (!element || !element.isConnected) return false;

  // aria-hidden / inert subtree
  if (element.closest("[aria-hidden='true'], [inert]")) return false;

  // Inside a closed <details>? (summaries are ok)
  const closedDetails = element.closest("details:not([open])");
  if (closedDetails && !element.matches("summary") && !element.closest("summary")) {
    return false;
  }

  // Computed style checks
  const style = window.getComputedStyle(element);
  if (style.display === "none") return false;
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  if (parseFloat(style.opacity) < 0.02) return false;

  // offsetParent === null means hidden via ancestor display:none (except fixed/sticky)
  if (
    element.offsetParent === null &&
    style.position !== "fixed" &&
    style.position !== "sticky"
  ) {
    return false;
  }

  // Zero-area bounding rect
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;

  // Outside viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) {
    return false;
  }

  // Pointer-events: none means not truly interactive
  if (style.pointerEvents === "none") return false;

  return true;
}

/**
 * Check if an element is disabled or aria-disabled.
 */
function isDisabled(element) {
  if (element.disabled) return true;
  if (element.getAttribute("aria-disabled") === "true") return true;
  return false;
}

// ─── Hint label generation ───────────────────────────────────────────

function generateHints(count) {
  const chars = HINT_CHARS;
  const hints = [];

  if (count <= chars.length) {
    for (let i = 0; i < count; i++) {
      hints.push(chars[i]);
    }
    return hints;
  }

  // Two-character hints (Vimium-style)
  for (let i = 0; i < chars.length && hints.length < count; i++) {
    for (let j = 0; j < chars.length && hints.length < count; j++) {
      hints.push(chars[i] + chars[j]);
    }
  }

  return hints;
}

// ─── Badge rendering ─────────────────────────────────────────────────

function ensureBadgeContainer() {
  if (badgeContainer && badgeContainer.isConnected) return badgeContainer;

  badgeContainer = document.createElement("div");
  badgeContainer.setAttribute("data-access-key-overlay", "");
  badgeContainer.setAttribute("aria-hidden", "true");
  badgeContainer.style.cssText =
    "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
  document.body.appendChild(badgeContainer);

  return badgeContainer;
}

function removeBadgeContainer() {
  if (badgeContainer && badgeContainer.isConnected) {
    badgeContainer.remove();
  }
  badgeContainer = null;
}

function createBadge(hint, element) {
  const rect = element.getBoundingClientRect();
  const badge = document.createElement("span");
  badge.className = "access-key-badge";
  badge.setAttribute("data-access-key-badge", hint);
  badge.textContent = hint.toUpperCase();

  // Position: top-left of the element, clamped to viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = rect.left + BADGE_OFFSET_X;
  let top = rect.top + BADGE_OFFSET_Y;

  // Clamp so badge doesn't overflow viewport
  const badgeW = 22; // approximate
  const badgeH = 20;

  left = Math.max(BADGE_MARGIN, Math.min(left, vw - badgeW - BADGE_MARGIN));
  top = Math.max(BADGE_MARGIN, Math.min(top, vh - badgeH - BADGE_MARGIN));

  badge.style.cssText = `position:fixed;left:${left}px;top:${top}px;`;

  // Skip animation if reduced motion is preferred
  if (prefersReducedMotion()) {
    badge.style.animation = "none";
  }

  ensureBadgeContainer().appendChild(badge);

  return { badge, element, hint };
}

// ─── Target collection ───────────────────────────────────────────────

function collectTargets() {
  const elements = document.querySelectorAll(INTERACTIVE_SELECTOR);
  const seen = new Set();
  const result = [];

  for (const el of elements) {
    if (isDisabled(el)) continue;
    if (!isVisible(el)) continue;

    // Deduplicate by identity
    if (seen.has(el)) continue;
    seen.add(el);

    // Deduplicate by destination: skip anchors with duplicate hrefs
    // (e.g. same link in desktop nav + mobile drawer)
    if (el.tagName === "A" && el.href) {
      const href = el.href;
      // Allow if this is the first visible one for this href
      let isDup = false;
      for (const prev of result) {
        if (prev.tagName === "A" && prev.href === href) {
          isDup = true;
          break;
        }
      }
      if (isDup) continue;
    }

    result.push(el);
  }

  return result;
}

// ─── Show / dismiss ──────────────────────────────────────────────────

function showHints() {
  if (active) return;
  active = true;
  narrowPrefix = "";

  const targets = collectTargets();
  if (targets.length === 0) {
    active = false;
    return;
  }

  const hints = generateHints(targets.length);
  hintNodes = targets.map((element, i) => createBadge(hints[i], element));
  document.documentElement.setAttribute("data-access-keys-active", "1");

  // Dismiss on scroll or resize (the positions would be stale)
  window.addEventListener("scroll", dismissOnEvent, { capture: true, passive: true, once: true });
  window.addEventListener("resize", dismissOnEvent, { once: true });
}

function dismissHints() {
  if (!active) return;
  active = false;
  narrowPrefix = "";

  removeBadgeContainer();
  hintNodes = [];
  document.documentElement.removeAttribute("data-access-keys-active");

  window.removeEventListener("scroll", dismissOnEvent, { capture: true });
  window.removeEventListener("resize", dismissOnEvent);
}

function dismissOnEvent() {
  dismissHints();
}

// ─── Activation ──────────────────────────────────────────────────────

function activateElement(element) {
  dismissHints();

  const tag = element.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    element.focus();
  } else {
    element.focus();
    element.click();
  }
}

// ─── Narrowing (two-char hint matching) ──────────────────────────────

function narrowHints(char) {
  const prefix = narrowPrefix + char.toLowerCase();

  // Exact match → activate
  const exact = hintNodes.find((node) => node.hint === prefix);
  if (exact) {
    activateElement(exact.element);
    return;
  }

  // Prefix match → narrow visible set
  const candidates = hintNodes.filter((node) => node.hint.startsWith(prefix));
  if (candidates.length === 0) {
    dismissHints();
    return;
  }

  narrowPrefix = prefix;
  for (const node of hintNodes) {
    if (node.hint.startsWith(prefix)) {
      node.badge.classList.add("access-key-badge--active");
      node.badge.classList.remove("access-key-badge--dimmed");
    } else {
      node.badge.classList.remove("access-key-badge--active");
      node.badge.classList.add("access-key-badge--dimmed");
    }
  }
}

// ─── Keyboard handlers ──────────────────────────────────────────────

function onKeydown(event) {
  if (isMobile()) return;

  // Alt press (without other modifiers) shows hints
  if (event.key === "Alt" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    if (!active) {
      event.preventDefault();
      showHints();
    }
    return;
  }

  // While active, handle hint characters
  if (active) {
    if (event.key === "Escape") {
      event.preventDefault();
      dismissHints();
      return;
    }

    // Ignore modifier-only presses
    if (["Control", "Meta", "Shift"].includes(event.key)) return;

    // Any modifier combo besides Alt → dismiss (user is doing something else)
    if (event.ctrlKey || event.metaKey) {
      dismissHints();
      return;
    }

    // If a printable character is pressed (with or without Alt held)
    const char = event.key.length === 1 ? event.key : "";
    if (char && HINT_CHARS.includes(char.toLowerCase())) {
      event.preventDefault();
      event.stopPropagation();
      narrowHints(char);
      return;
    }

    // Any non-hint key dismisses
    event.preventDefault();
    dismissHints();
  }
}

function onKeyup(event) {
  // Alt release dismisses (unless user already narrowed into a two-char hint)
  if (event.key === "Alt" && active && narrowPrefix === "") {
    dismissHints();
  }
}

function onBlur() {
  dismissHints();
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    dismissHints();
  }
}

// ─── Init ────────────────────────────────────────────────────────────

export function initAccessKeys() {
  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener("keydown", onKeydown, true);
  document.addEventListener("keyup", onKeyup, true);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", dismissHints);
}
