/**
 * Main Web Application Entrypoint (ES Module)
 */

import { initResponsive } from "./responsive.js";
import { initTheme } from "./theme-engine.js";
import { initAuth } from "../system/auth-integration.js";
import { initDropdowns } from "../ui/dropdowns.js";
import { initDrawer } from "../ui/drawer.js";
import { initServiceWorker } from "../system/service-worker.js";
import { initCookieConsent } from "../telemetry/cookie-consent.js";
import { initWebMCP } from "../system/webmcp.js";
import { initTooltips } from "../ui/tooltips.js";
import { initExternalLinkUtm } from "../telemetry/external-link-utm.js";

// Structural UX natively bundled
// Deferred UX & Heavy components are loaded lazily on demand.

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
  return (
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html"
  );
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
      runSafely(
        () => import("../features/toc.js").then((mod) => mod.initToc()),
        "toc",
      );
    }

    runSafely(() => initTooltips(document), "tooltips");

    if (has("[data-search-mount]")) {
      runSafely(
        () =>
          import("../features/search-loader.js").then((mod) =>
            mod.initSearchLoader(),
          ),
        "search loader",
      );
    }

    if (has('input[name="showcase_tabs"]')) {
      runSafely(
        () =>
          import("../ui/showcase-rotate.js").then((mod) =>
            mod.initShowcaseRotate(),
          ),
        "showcase rotate",
      );
    }

    if (has("pre > code")) {
      runSafely(
        () =>
          import("../ui/code-blocks.js").then((mod) => mod.initCodeBlocks()),
        "code blocks",
      );
    }

    if (
      hasAny([
        "[data-copy-url]",
        "main h1[id]",
        "main h2[id]",
        "main h3[id]",
        "main h4[id]",
        "main h5[id]",
        "main h6[id]",
      ])
    ) {
      runSafely(
        () =>
          import("../features/clipboard.js").then((mod) => mod.initClipboard()),
        "clipboard",
      );
    }

    if (hasAny(["[data-shortcut]", "[data-desktop-only='true']"])) {
      runSafely(
        () =>
          import("../features/shortcuts.js").then((mod) => mod.initShortcuts()),
        "shortcuts",
      );
    }

    if (has("[data-keybind]") || isHomeRoute()) {
      runSafely(
        () =>
          import("../features/keyboard-shortcuts.js").then((mod) =>
            mod.initKeyboardShortcuts(),
          ),
        "keyboard shortcuts",
      );
    }

    runSafely(
      () =>
        import("../features/access-keys.js").then((mod) =>
          mod.initAccessKeys(),
        ),
      "access keys",
    );

    runSafely(
      () => import("../ui/scroll-top.js").then((mod) => mod.initScrollToTop()),
      "scroll top",
    );

    if (has("[data-rot13-email]")) {
      runSafely(
        () =>
          import("../ui/email-links.js").then((mod) =>
            mod.initEmailLinks(document),
          ),
        "email links",
      );
    }

    if (hasAny([".katex-inline", ".katex-block", ".mermaid"])) {
      runSafely(
        () =>
          import("../ui/lazy-plugins.js").then((mod) => mod.initLazyPlugins()),
        "lazy plugins",
      );
    }
  });

  // Heavier/optional page features during idle time natively bundled.
  runWhenIdle(() => {
    if (has("[data-sidebar-toggle]") && has("[data-toc-toggle]")) {
      runSafely(
        () =>
          import("../data/layout-recommendation.js").then((mod) =>
            mod.initLayoutRecommendation(),
          ),
        "layout recommendation",
      );
    }

    if (hasAny(["[data-blog-feed]", "[data-blog-feed-mount]"])) {
      runSafely(
        () => import("../data/blog-feed.js").then((mod) => mod.initBlogFeed()),
        "blog feed",
      );
    }

    if (has("[data-taxonomy-filter]")) {
      runSafely(
        () =>
          import("../data/taxonomy-filter.js").then((mod) =>
            mod.initTaxonomyFilter(),
          ),
        "taxonomy filter",
      );
    }

    if (has("[data-taxonomy-subscribe]")) {
      runSafely(
        () =>
          import("../data/taxonomy-subscribe.js").then((mod) =>
            mod.initTaxonomySubscribe(),
          ),
        "taxonomy subscribe",
      );
    }

    if (
      has("[data-taxonomy-playlist]") ||
      new URLSearchParams(window.location.search).has("pl")
    ) {
      runSafely(
        () =>
          import("../data/taxonomy-playlist.js").then((mod) =>
            mod.initTaxonomyPlaylist(),
          ),
        "taxonomy playlist",
      );
    }

    if (has("[data-comments-mount]")) {
      runSafely(
        () =>
          import("../features/comments.js").then((mod) => mod.initComments()),
        "comments",
      );
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
