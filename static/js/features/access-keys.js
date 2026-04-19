/**
 * Access-key hint overlay — Vimium-style link hints for keyboard navigation.
 *
 * Hold Alt → reveal hint badges on every visible interactive element.
 * Press hint char(s) → activate the element. Release Alt → dismiss.
 * Alt+↑ / Alt+↓ → scroll the page; hints re-appear after scroll settles.
 *
 * Design rules:
 *  1. Only truly in-viewport, CSS-visible, non-aria-hidden elements are hinted.
 *  2. Duplicate hrefs → SAME hint assigned to all instances (both sidebar + header).
 *  3. Explicit `data-hint` values on elements always take precedence.
 *  4. Auto-generated hints never start with a char claimed by any explicit hint.
 *  5. Auto-generated hints are strictly prefix-free (no exact match shadows another).
 */

import { isMobile, prefersReducedMotion } from "../core/responsive.js";

// ─── Constants ────────────────────────────────────────────────────────────────

// Chars for auto-generation (home-row biased, no 't' or 'c' which might be base tags)
const HINT_CHARS = "sdfwejxzioqy";
const BADGE_MARGIN = 4;  // min px from edge

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled]):not([hidden])",
  "input:not([disabled]):not([hidden]):not([type='hidden'])",
  "select:not([disabled]):not([hidden])",
  "textarea:not([disabled]):not([hidden])",
  "[role='button']:not([disabled])",
  "[role='link']",
  "[role='tab']",
  "summary",
  "label[for*='search']",
].join(", ");

// ─── Semantic Base Rules ──────────────────────────────────────────────────────

const SEMANTIC_RULES = [
  // Toggles & Actions
  { selector: "#hamburger-toggle", hint: "m" },
  { selector: "#sidebar-toggle, [data-sidebar-toggle]", hint: "s" },
  { selector: "#toc-toggle, [data-toc-toggle]", hint: "r" },
  { selector: "[data-theme-mode='light']", hint: "tl" },
  { selector: "[data-theme-mode='dark']", hint: "td" },
  { selector: "[data-theme-mode='auto']", hint: "ta" },
  { selector: "[aria-label='Languages']", hint: "f" },
  { selector: "[aria-label='Apps']", hint: "g" },
  { selector: "[aria-label='Account']", hint: "u" },
  { selector: "[data-search-trigger], label[for*='search']", hint: "k" },

  // Explicit Root Overrides (Should bypass generic layout classes)
  { match: (el) => isPath(el, "/tags/"), hint: "t" },
  { match: (el) => isPath(el, "/categories/"), hint: "c" },

  // Prev / Next Nav Buttons (Default pagination flow)
  { selector: ".nav-button-prev", hint: "v" },
  { selector: ".nav-button-next", hint: "n" },

  // Base Logic Paths (Functions matching URL pathnames)
  { match: (el) => isPath(el, "/"), hint: "h" },
  { match: (el) => isPath(el, "/about/"), hint: "a" },
  { match: (el) => isPath(el, "/projects/"), hint: "p" },
  { match: (el) => isPath(el, "/links/"), hint: "l" },
  { match: (el) => isPath(el, "/blog/"), hint: "b" },
  { match: (el) => isPath(el, "/archive/"), hint: "x" },

  // Footer equivalents
  { match: (el) => isPath(el, "/privacy"), hint: "yp" },
  { match: (el) => isPath(el, "/tos"), hint: "yt" },
  { match: (el) => isPath(el, "/appreciation"), hint: "yc" },
  // Links (/links/) will automatically be matched by the 'l' base rule above, even in the footer, which creates the perfect identical dedup you requested!
  { match: (el) => isExternalHost(el, "getzola.org"), hint: "yz" }
];

/**
 * Returns true only when `el` is an anchor whose parsed hostname is exactly
 * `host` or a direct subdomain of it (e.g. docs.getzola.org).
 * Prevents CodeQL js/incomplete-url-substring-sanitization: an arbitrary URL
 * like `evil.com?q=getzola.org` will NOT match.
 */
function isExternalHost(el, host) {
  if (el.tagName !== "A" || !el.href) return false;
  try {
    const { hostname } = new URL(el.href);
    return hostname === host || hostname.endsWith(`.${host}`);
  } catch { return false; }
}

function isPath(el, path) {
  if (el.tagName !== "A" || !el.href) return false;
  try {
    const url = new URL(el.href, window.location.origin);
    // Ignore external origins
    if (url.origin !== window.location.origin) return false;
    
    // Exact match ignoring trailing slashes
    const p1 = url.pathname.replace(/\/$/, "");
    const p2 = path.replace(/\/$/, "");
    return p1 === p2;
  } catch(e) { return false; }
}

// ─── State ────────────────────────────────────────────────────────────────────

let active = false;
let isAltHeld = false;
let hintNodes = [];       // { hint, badge, element }[]
let narrowPrefix = "";
let listenersBound = false;
let badgeContainer = null;
let activeHintLeaders = new Set();
let scrollBadges = { up: null, down: null };

// ─── Visibility ───────────────────────────────────────────────────────────────

function isVisible(el) {
  if (!el || !el.isConnected) return false;
  if (el.closest("[aria-hidden='true'], [inert]")) return false;

  const closedDetails = el.closest("details:not([open])");
  if (closedDetails && !el.matches("summary") && !el.closest("summary")) return false;

  const style = window.getComputedStyle(el);
  if (style.display === "none") return false;
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  if (parseFloat(style.opacity) < 0.02) return false;
  if (style.pointerEvents === "none") return false;

  if (
    el.offsetParent === null &&
    style.position !== "fixed" &&
    style.position !== "sticky" &&
    el !== document.body
  ) return false;

  const rect = el.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) return false;

  return true;
}

function isDisabled(el) {
  return el.disabled === true || el.getAttribute("aria-disabled") === "true";
}

// ─── Hint generation ──────────────────────────────────────────────────────────

/**
 * Generate exactly `count` unique hint strings safely.
 * Mathematically guarantees prefix-free property so no hint shadows another.
 */
function generateHints(count, reservedLeaders) {
  if (count <= 0) return [];
  const pool = HINT_CHARS.split("").filter(c => !reservedLeaders.has(c));
  if (pool.length === 0) {
    "abcdefghijklmnopqrstuvwxyz".split("").forEach(c => {
      if (!reservedLeaders.has(c)) pool.push(c);
    });
  }

  const P = pool.length;
  const hints = [];

  if (count <= P) {
    for (let i = 0; i < count; i++) hints.push(pool[i]);
  } else {
    // Prefix-free math: if we need `count` items from `P` characters,
    // we take `k` characters to act as prefixes for 2-char hints.
    const k = Math.ceil((count - P) / (P - 1));
    const safeK = Math.min(k, P); // clamp
    const numSingle = P - safeK;
    
    // 1-char hints
    for (let i = 0; i < numSingle; i++) {
        hints.push(pool[i]);
    }
    
    // 2-char hints
    for (let i = numSingle; i < P; i++) {
        for (let j = 0; j < P; j++) {
            if (hints.length >= count) return hints;
            hints.push(pool[i] + pool[j]);
        }
    }
  }

  return hints;
}

// ─── Badge rendering ──────────────────────────────────────────────────────────

function ensureContainer() {
  if (badgeContainer && badgeContainer.isConnected) return badgeContainer;
  badgeContainer = document.createElement("div");
  badgeContainer.setAttribute("data-access-key-overlay", "");
  badgeContainer.setAttribute("aria-hidden", "true");
  badgeContainer.style.cssText =
    "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
  document.body.appendChild(badgeContainer);
  return badgeContainer;
}

function removeContainer() {
  badgeContainer?.remove();
  badgeContainer = null;
}

function createBadge(hint, element) {
  const rect = element.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const badge = document.createElement("span");
  badge.className = "access-key-badge";
  badge.setAttribute("data-access-key-badge", hint);
  badge.textContent = hint.toUpperCase();

  const bw = hint.length > 1 ? 28 : 20;
  const bh = 20;
  // center horizontally on element if smaller than badge
  let left = rect.left;
  if (rect.width < bw) left = rect.left + (rect.width/2) - (bw/2);
  let top = rect.top;
  if (rect.height < bh) top = rect.top + (rect.height/2) - (bh/2);
  
  left = Math.max(BADGE_MARGIN, Math.min(left, vw - bw - BADGE_MARGIN));
  top  = Math.max(BADGE_MARGIN, Math.min(top,  vh - bh - BADGE_MARGIN));

  badge.style.cssText = `position:fixed;left:${left}px;top:${top}px;`;
  if (prefersReducedMotion()) badge.style.animation = "none";

  ensureContainer().appendChild(badge);
  return { hint, badge, element };
}

// ─── Scroll indicators ────────────────────────────────────────────────────────

const svgUp = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
const svgDown = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`;

function canScrollUp()   { return (document.documentElement.scrollTop || window.scrollY) > 1; }
function canScrollDown() {
  const el = document.documentElement;
  return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
}

function makeScrollBadge(direction) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scrollbarW = vw - document.documentElement.clientWidth;
  
  const top = direction === "up"
    ? Math.max(BADGE_MARGIN + 4, vh * 0.22 - 12)
    : Math.min(vh - 32, vh * 0.78 - 12);

  const badge = document.createElement("span");
  badge.className = `access-key-badge access-key-scroll-badge access-key-scroll-badge--${direction}`;
  badge.setAttribute("data-access-key-scroll", direction);
  badge.innerHTML = direction === "up" ? svgUp : svgDown;
  badge.title = direction === "up" ? "Alt+↑  Scroll up" : "Alt+↓  Scroll down";
  badge.style.cssText = `position:fixed;right:${Math.max(12, scrollbarW + 8)}px;top:${top}px;`;
  if (prefersReducedMotion()) badge.style.animation = "none";

  ensureContainer().appendChild(badge);
  return badge;
}

function updateScrollBadges() {
  scrollBadges.up?.remove();
  scrollBadges.down?.remove();
  scrollBadges = { up: null, down: null };
  if (canScrollUp())   scrollBadges.up   = makeScrollBadge("up");
  if (canScrollDown()) scrollBadges.down = makeScrollBadge("down");
}

// ─── Target collection ───────────────────────────────────────────────────────

function collectTargets() {
  const all  = document.querySelectorAll(INTERACTIVE_SELECTOR);
  const seen = new Set();
  const result = [];

  for (const el of all) {
    if (isDisabled(el)) continue;
    if (!isVisible(el)) continue;
    if (seen.has(el)) continue;
    seen.add(el);
    result.push(el);
  }

  // duplicates with same href ARE kept now!
  return result;
}

// ─── Show / Dismiss ───────────────────────────────────────────────────────────

function showHints() {
  if (active) return;
  active = true;
  narrowPrefix = "";

  const targets = collectTargets();
  if (targets.length === 0) { active = false; return; }

  const explicitMap  = new Map(); 
  const explicitExact = new Set();
  const hrefToHint = new Map();

  for (const el of targets) {
    let explicitHint = null;

    // 1. Semantic Rules (JS predefined)
    for (const rule of SEMANTIC_RULES) {
      if ((rule.selector && el.matches(rule.selector)) || (rule.match && rule.match(el))) {
        explicitHint = rule.hint;
        break;
      }
    }

    // 2. HTML Override (fallback)
    const raw = el.getAttribute("data-hint");
    if (raw) explicitHint = raw.trim().toLowerCase().replace(/\s+/g, "");

    if (explicitHint) {
      explicitMap.set(el, explicitHint);
      explicitExact.add(explicitHint);
      if (el.tagName === "A" && el.href) hrefToHint.set(el.href, explicitHint);
    }
  }

  // To prevent ANY auto-gen hint from conflicting with an explicit hint
  const reservedLeaders = new Set([...explicitExact].map(h => h[0]));

  const toGenerate = [];
  for (const el of targets) {
    if (!explicitMap.has(el)) {
      if (el.tagName === "A" && el.href && hrefToHint.has(el.href)) {
        explicitMap.set(el, hrefToHint.get(el.href)); // duplicate reuse
      } else {
        toGenerate.push(el);
      }
    }
  }

  const generated = generateHints(toGenerate.length, reservedLeaders);
  let gi = 0;
  for (const el of toGenerate) {
    const h = generated[gi++] ?? "??";
    explicitMap.set(el, h);
    if (el.tagName === "A" && el.href) hrefToHint.set(el.href, h);
  }

  hintNodes = targets.map(el => createBadge(explicitMap.get(el), el));
  activeHintLeaders = new Set(hintNodes.map(n => n.hint[0]));

  updateScrollBadges();

  document.documentElement.setAttribute("data-access-keys-active", "1");
  window.addEventListener("scroll", onScrollWhileActive, { capture: true, passive: true, once: true });
  window.addEventListener("resize", dismissHints, { once: true });
}

function dismissHints() {
  if (!active) return;
  active = false;
  narrowPrefix = "";
  activeHintLeaders = new Set();

  scrollBadges.up?.remove();
  scrollBadges.down?.remove();
  scrollBadges = { up: null, down: null };

  removeContainer();
  hintNodes = [];
  document.documentElement.removeAttribute("data-access-keys-active");

  window.removeEventListener("scroll", onScrollWhileActive, { capture: true });
  window.removeEventListener("resize", dismissHints);
}

function onScrollWhileActive() { dismissHints(); }

// ─── Activation ───────────────────────────────────────────────────────────────

function activateElement(el) {
  dismissHints();
  el.focus();
  if (!["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) el.click();
}

// ─── Narrowing ────────────────────────────────────────────────────────────────

function narrowHints(char) {
  const prefix = narrowPrefix + char.toLowerCase();
  
  const candidates = hintNodes.filter(n => n.hint.startsWith(prefix));
  if (candidates.length === 0) { dismissHints(); return; }
  
  narrowPrefix = prefix;

  // Exact Match Logic
  // If all remaining candidates are EXACT matches, activate the first one.
  const isAllExact = candidates.every(c => c.hint === prefix);
  if (isAllExact && candidates.length > 0) {
    activateElement(candidates[0].element);
    return;
  }
  
  // NOTE: If there is an exact match AND other longer candidates (e.g. T and TL),
  // we do NOT activate yet! The user must press Enter to activate T, or keep typing for TL.
  
  for (const node of hintNodes) {
    if (node.hint.startsWith(prefix)) {
      node.badge.classList.add("access-key-badge--active");
      node.badge.classList.remove("access-key-badge--dimmed");
      const typed = prefix.toUpperCase();
      const rest  = node.hint.slice(prefix.length).toUpperCase();
      node.badge.innerHTML = `<span class="access-key-badge__typed">${typed}</span>${rest}`;
    } else {
      node.badge.classList.remove("access-key-badge--active");
      node.badge.classList.add("access-key-badge--dimmed");
    }
  }
}

// ─── Keyboard handler ─────────────────────────────────────────────────────────

function onKeydown(event) {
  if (isMobile()) return;

  if (event.key === "Alt") isAltHeld = true;

  const altOnly = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

  if (altOnly && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault();
    if (active) dismissHints();

    const step = window.innerHeight * 0.85;
    window.scrollBy({ top: (event.key === "ArrowUp" ? -1 : 1) * step, behavior: "smooth" });
    
    let fired = false;
    const resume = () => {
      if (fired) return;
      fired = true;
      window.removeEventListener("scrollend", resume);
      if (isAltHeld && !active) showHints();
    };
    window.addEventListener("scrollend", resume);
    setTimeout(resume, 800); // fallback if scrollend isn't supported or doesn't fire
    return;
  }

  if (event.key === "Alt" && altOnly) {
    if (!active) { event.preventDefault(); showHints(); }
    return;
  }

  if (!active) return;

  if (event.key === "Escape") { event.preventDefault(); dismissHints(); return; }
  if (["Control", "Meta", "Shift", "Alt"].includes(event.key)) return;
  if (event.ctrlKey || event.metaKey) { dismissHints(); return; }

  // If user typed T and TL both exist, and they want T, they hit Enter
  if (event.key === "Enter" && narrowPrefix !== "") {
    const exact = hintNodes.find(n => n.hint === narrowPrefix);
    if (exact) {
      event.preventDefault();
      activateElement(exact.element);
    } else {
      dismissHints();
    }
    return;
  }

  const char = event.key.length === 1 ? event.key.toLowerCase() : "";
  if (char) {
    const validLeader = activeHintLeaders.has(char);
    const validNext   = narrowPrefix !== "" && hintNodes.some(n => n.hint.startsWith(narrowPrefix + char));

    // Wait! Backspace should work!
    if (validLeader || validNext) {
      event.preventDefault();
      event.stopPropagation();
      narrowHints(char);
      return;
    }
  }

  // Backspace support
  if (event.key === "Backspace" && narrowPrefix.length > 0) {
      event.preventDefault();
      narrowPrefix = narrowPrefix.slice(0, -1);
      if (narrowPrefix.length === 0) {
          // just render all as normal
          for (const node of hintNodes) {
              node.badge.innerHTML = node.hint.toUpperCase();
              node.badge.classList.remove("access-key-badge--active");
              node.badge.classList.remove("access-key-badge--dimmed");
          }
      } else {
          // re-narrow using remaining prefix
          const oldPrefix = narrowPrefix;
          narrowPrefix = ""; 
          narrowHints(oldPrefix);
      }
      return;
  }

  event.preventDefault();
  dismissHints();
}

function onKeyup(event) {
  if (event.key === "Alt") {
    isAltHeld = false;
    if (active && narrowPrefix === "") dismissHints();
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initAccessKeys() {
  if (listenersBound) return;
  listenersBound = true;
  document.addEventListener("keydown", onKeydown, true);
  document.addEventListener("keyup", onKeyup, true);
  window.addEventListener("blur", dismissHints);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") dismissHints();
  });
  window.addEventListener("pagehide", dismissHints);
}
