/**
 * Main Web Application Entrypoint (ES Module)
 */

import { initResponsive } from "./modules/responsive.js";
import { initTheme } from "./modules/theme-engine.js";
import { initAuth } from "./modules/auth-integration.js";
import { initDropdowns } from "./modules/dropdowns.js";
import { initDrawer } from "./modules/drawer.js";
import { initServiceWorker } from "./modules/service-worker.js";
import { initCookieConsent } from "./modules/cookie-consent.js";
import { initWebMCP } from "./modules/webmcp.js";
import { initTooltips } from "./modules/tooltips.js";

function runSafely(task, label) {
  try {
    const result = task();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        console.error(`[Bootstrap] ${label} failed:`, error);
      });
    }
  } catch (error) {
    console.error(`[Bootstrap] ${label} failed:`, error);
  }
}

function runAfterFirstPaint(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(callback);
    });
    return;
  }

  window.setTimeout(callback, 0);
}

function runWhenIdle(callback, timeout = 1200) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, 120);
}

function markUiInitReady() {
  const apply = () => {
    document.documentElement.setAttribute("data-ui-init", "1");
  };

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
    return;
  }

  window.setTimeout(apply, 0);
}

function syncPrepaintLayoutState() {
  const doc = document.documentElement;
  const sidebarCollapsed = doc.getAttribute("data-sidebar-collapsed") === "1";
  const tocCollapsed = doc.getAttribute("data-toc-collapsed") === "1";

  document.querySelectorAll(".drawer").forEach((drawer) => {
    drawer.classList.toggle("sidebar-collapsed", sidebarCollapsed);
  });

  if (document.body) {
    document.body.classList.toggle("toc-collapsed", tocCollapsed);
  }
}

async function importAndInit(modulePath, exportName, args = []) {
  const mod = await import(modulePath);
  const fn = mod[exportName];
  if (typeof fn === "function") {
    return await fn(...args);
  }
  return undefined;
}

async function importModule(modulePath) {
  return await import(modulePath);
}

function has(selector) {
  return !!document.querySelector(selector);
}

function hasAny(selectors) {
  return selectors.some((selector) => has(selector));
}

function isHomeRoute() {
  return window.location.pathname === "/" || window.location.pathname === "/index.html";
}

function bootstrapSite() {
  runSafely(() => initResponsive(), "responsive");

  // Align classes with prepaint attrs before transitions are enabled.
  runSafely(() => syncPrepaintLayoutState(), "prepaint layout sync");

  // Expose WebMCP imperative APIs early for inspector/runtime detection.
  runSafely(() => initWebMCP({ runtime: "main" }), "webmcp");

  // Keep key page-shell behavior eager to avoid flashes during navigation.
  runSafely(() => initTheme(document), "theme");
  runSafely(() => initDrawer(), "drawer");
  runSafely(() => initDropdowns(document), "dropdowns");
  runSafely(() => initTooltips(document), "tooltips");
  runSafely(() => initCookieConsent(), "cookie consent");
  runSafely(() => initAuth(document), "auth");

  // Register SW early so runtime issues never block installability.
  runSafely(() => initServiceWorker(), "service worker");

  // Turn transitions on only after initial shell state is fully synced.
  markUiInitReady();

  // UX niceties after initial paint.
  runAfterFirstPaint(() => {
    if (hasAny(["[data-toc-sidebar]", "[data-toc-toggle]"])) {
      runSafely(() => importModule("./toc.js"), "toc");
    }

    if (has("[data-search-mount]")) {
      runSafely(() => importModule("./search-loader.js"), "search loader");
    }

    if (has('input[name="showcase_tabs"]')) {
      runSafely(() => importModule("./showcase-rotate.js"), "showcase rotate");
    }

    if (has("pre > code")) {
      runSafely(() => importAndInit("./modules/code-blocks.js", "initCodeBlocks"), "code blocks");
    }

    if (hasAny(["[data-copy-url]", "main h1[id]", "main h2[id]", "main h3[id]", "main h4[id]", "main h5[id]", "main h6[id]"])) {
      runSafely(() => importAndInit("./modules/clipboard.js", "initClipboard"), "clipboard");
    }

    if (hasAny(["[data-shortcut]", "[data-desktop-only='true']"])) {
      runSafely(() => importAndInit("./modules/shortcuts.js", "initShortcuts"), "shortcuts");
    }

    if (has("[data-keybind]") || isHomeRoute()) {
      runSafely(() => importAndInit("./modules/keyboard-shortcuts.js", "initKeyboardShortcuts"), "keyboard shortcuts");
    }

    runSafely(() => importAndInit("./modules/scroll-top.js", "initScrollToTop"), "scroll top");

    if (hasAny([".katex-inline", ".katex-block", ".mermaid"])) {
      runSafely(() => importAndInit("./modules/lazy-plugins.js", "initLazyPlugins"), "lazy plugins");
    }
  });

  // Heavier/optional page features during idle time.
  runWhenIdle(() => {
    if (has("[data-sidebar-toggle]") && has("[data-toc-toggle]")) {
      runSafely(() => importAndInit("./modules/layout-recommendation.js", "initLayoutRecommendation"), "layout recommendation");
    }

    if (hasAny(["[data-blog-feed]", "[data-blog-feed-mount]"])) {
      runSafely(() => importAndInit("./modules/blog-feed.js", "initBlogFeed"), "blog feed");
    }

    if (has("[data-taxonomy-filter]")) {
      runSafely(() => importAndInit("./modules/taxonomy-filter.js", "initTaxonomyFilter"), "taxonomy filter");
    }

    if (has("[data-taxonomy-subscribe]")) {
      runSafely(() => importAndInit("./modules/taxonomy-subscribe.js", "initTaxonomySubscribe"), "taxonomy subscribe");
    }

    if (has("[data-taxonomy-playlist]") || new URLSearchParams(window.location.search).has("pl")) {
      runSafely(() => importAndInit("./modules/taxonomy-playlist.js", "initTaxonomyPlaylist"), "taxonomy playlist");
    }

    if (has("[data-comments-mount]")) {
      runSafely(() => importAndInit("./modules/comments.js", "initComments"), "comments");
    }
  });

  window.addEventListener("pageshow", () => {
    document.documentElement.setAttribute("data-ui-init", "1");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapSite);
} else {
  bootstrapSite();
}
