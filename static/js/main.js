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
import { initExternalLinkUtm } from "./modules/external-link-utm.js";

// Structural UX natively bundled
import { initToc } from "./toc.js";
import { initSearchLoader } from "./search-loader.js";
import { initShowcaseRotate } from "./showcase-rotate.js";
import { initCodeBlocks } from "./modules/code-blocks.js";
import { initClipboard } from "./modules/clipboard.js";
import { initShortcuts } from "./modules/shortcuts.js";
import { initKeyboardShortcuts } from "./modules/keyboard-shortcuts.js";
import { initAccessKeys } from "./modules/access-keys.js";
import { initScrollToTop } from "./modules/scroll-top.js";
import { initLazyPlugins } from "./modules/lazy-plugins.js";

// Deferred UX & Heavy components natively bundled
import { initLayoutRecommendation } from "./modules/layout-recommendation.js";
import { initBlogFeed } from "./modules/blog-feed.js";
import { initTaxonomyFilter } from "./modules/taxonomy-filter.js";
import { initTaxonomySubscribe } from "./modules/taxonomy-subscribe.js";
import { initTaxonomyPlaylist } from "./modules/taxonomy-playlist.js";
import { initComments } from "./modules/comments.js";

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
    console.log(`\x1b[1m
···························································
··············qpppu········································
·······)pDDDDDDDDDDDDDDbpu······················)DDDDDDDDDD
·····pDDDDDDDDDDDDDDDDDDDDDbu···················)DDDDDDDDDD
···pDDDDDDDDDDDDDDDDDDDDDDDDDbp·················)DDDDDDDDDD
·)DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDp···············)DDDDDDDDDD
·DDDDDDDDDDDP·······PDDDDDDDDDDDDb··············QDDDDDDDDDD
(DDDDDDDDDDP··········(DDDDDDDDDDDDb···········)DDDDDDDDDDP
QDDDDDDDDDP·············PDDDDDDDDDDDDDp······)pDDDDDDDDDDD·
DDDDDDDDDDb···············)QDDDDDDDDDDDDDDDDDDDDDDDDDDDDDP·
DDDDDDDDDDb·················)DDDDDDDDDDDDDDDDDDDDDDDDDDP···
DDDDDDDDDDb···················)DDDDDDDDDDDDDDDDDDDDDDPP····
DDDDDDDDDDb·······················PDDDDDDDDDDDDDDDPP·······
······································c(·PPPP(c············
···························································
\x1b[0m`);
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
  runSafely(() => initExternalLinkUtm(document), "external link utm");
  runSafely(() => initCookieConsent(), "cookie consent");
  runSafely(() => initAuth(document), "auth");

  // Register SW early so runtime issues never block installability.
  runSafely(() => initServiceWorker(), "service worker");

  // Turn transitions on only after initial shell state is fully synced.
  markUiInitReady();

  // UX niceties after initial paint.
  runAfterFirstPaint(() => {
    if (hasAny(["[data-toc-sidebar]", "[data-toc-toggle]"])) {
      runSafely(() => initToc(), "toc");
    }

    if (has("[data-search-mount]")) {
      runSafely(() => initSearchLoader(), "search loader");
    }

    if (has('input[name="showcase_tabs"]')) {
      runSafely(() => initShowcaseRotate(), "showcase rotate");
    }

    if (has("pre > code")) {
      runSafely(() => initCodeBlocks(), "code blocks");
    }

    if (hasAny(["[data-copy-url]", "main h1[id]", "main h2[id]", "main h3[id]", "main h4[id]", "main h5[id]", "main h6[id]"])) {
      runSafely(() => initClipboard(), "clipboard");
    }

    if (hasAny(["[data-shortcut]", "[data-desktop-only='true']"])) {
      runSafely(() => initShortcuts(), "shortcuts");
    }

    if (has("[data-keybind]") || isHomeRoute()) {
      runSafely(() => initKeyboardShortcuts(), "keyboard shortcuts");
    }

    runSafely(() => initAccessKeys(), "access keys");

    runSafely(() => initScrollToTop(), "scroll top");

    if (hasAny([".katex-inline", ".katex-block", ".mermaid"])) {
      runSafely(() => initLazyPlugins(), "lazy plugins");
    }
  });

  // Heavier/optional page features during idle time natively bundled.
  runWhenIdle(() => {
    if (has("[data-sidebar-toggle]") && has("[data-toc-toggle]")) {
      runSafely(() => initLayoutRecommendation(), "layout recommendation");
    }

    if (hasAny(["[data-blog-feed]", "[data-blog-feed-mount]"])) {
      runSafely(() => initBlogFeed(), "blog feed");
    }

    if (has("[data-taxonomy-filter]")) {
      runSafely(() => initTaxonomyFilter(), "taxonomy filter");
    }

    if (has("[data-taxonomy-subscribe]")) {
      runSafely(() => initTaxonomySubscribe(), "taxonomy subscribe");
    }

    if (has("[data-taxonomy-playlist]") || new URLSearchParams(window.location.search).has("pl")) {
      runSafely(() => initTaxonomyPlaylist(), "taxonomy playlist");
    }

    if (has("[data-comments-mount]")) {
      runSafely(() => initComments(), "comments");
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
