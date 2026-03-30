/* --- drawer-fix.js --- */
// Fix drawer state on back navigation (bfcache) and sync a body class so
// floating UI (e.g. scroll-to-top) stays below the mobile drawer panel.
// Must NOT be deferred — needs to run early to catch pageshow.
(function () {
  function isMobileDrawerViewport() {
    return typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 1023px)").matches
      : window.innerWidth < 1024;
  }

  function syncDrawerOpenClass() {
    var d = document.getElementById("my-drawer-2");
    if (!d) return;
    var open = d.checked && isMobileDrawerViewport();
    document.body.classList.toggle("drawer-mobile-open", open);
  }

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      var d = document.getElementById("my-drawer-2");
      if (d) d.checked = false;
    }
    syncDrawerOpenClass();
  });

  document.addEventListener("DOMContentLoaded", function () {
    var d = document.getElementById("my-drawer-2");
    if (!d) return;
    d.addEventListener("change", syncDrawerOpenClass);
    window.addEventListener("resize", syncDrawerOpenClass);
    syncDrawerOpenClass();
  });
})();

/* --- responsive-helpers.js --- */
/**
 * Centralized responsive behavior management
 * Provides consistent mobile/desktop detection and monitoring
 * across the entire site for navbar, TOC, keyboard hints, buttons, etc.
 */

(function () {
  "use strict";

  /**
   * BREAKPOINT CONSTANTS
   * Matches Tailwind CSS breakpoints for consistency
   */
  const BREAKPOINTS = {
    MOBILE: 0,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  };

  /**
   * Responsive state tracking
   */
  const state = {
    isDesktop: false,
    isMobile: false,
    mediaQueries: {},
    listeners: new Set(),
  };

  /**
   * Initialize media queries and detect initial state
   */
  function initializeMediaQueries() {
    // Primary responsive checks
    state.mediaQueries.hoverCapable = window.matchMedia("(hover: hover)");
    state.mediaQueries.finePointer = window.matchMedia("(pointer: fine)");
    state.mediaQueries.largeScreen = window.matchMedia(
      `(min-width: ${BREAKPOINTS.LG}px)`,
    );
    state.mediaQueries.touchDevice = window.matchMedia("(pointer: coarse)");

    updateResponsiveState();

    // Listen for changes
    Object.values(state.mediaQueries).forEach((mq) => {
      mq.addListener(updateResponsiveState);
    });
  }

  /**
   * Update responsive state based on current media queries
   */
  function updateResponsiveState() {
    const wasDesktop = state.isDesktop;

    // Desktop: hover capable AND fine pointer (mouse)
    state.isDesktop =
      state.mediaQueries.hoverCapable.matches &&
      state.mediaQueries.finePointer.matches;

    // Mobile: everything else
    state.isMobile = !state.isDesktop;

    // Notify listeners if state changed
    if (wasDesktop !== state.isDesktop) {
      notifyListeners();
    }
  }

  /**
   * RESPONSIVE BEHAVIOR API
   */

  /**
   * Check if device is desktop
   */
  function isDesktop() {
    return state.isDesktop;
  }

  /**
   * Check if device is mobile
   */
  function isMobile() {
    return state.isMobile;
  }

  /**
   * Check if screen is large (lg breakpoint and up)
   */
  function isLargeScreen() {
    return state.mediaQueries.largeScreen.matches;
  }

  /**
   * Check if device is touch-enabled
   */
  function isTouchDevice() {
    return state.mediaQueries.touchDevice.matches;
  }

  /**
   * Register callback for responsive state changes
   */
  function onResponsiveChange(callback) {
    state.listeners.add(callback);
    return () => state.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  function notifyListeners() {
    state.listeners.forEach((callback) => {
      try {
        callback({
          isDesktop: state.isDesktop,
          isMobile: state.isMobile,
          isLargeScreen: isLargeScreen(),
          isTouchDevice: isTouchDevice(),
        });
      } catch (e) {
        console.error("Error in responsive listener:", e);
      }
    });
  }

  /**
   * HELPER FUNCTIONS FOR COMMON PATTERNS
   */

  /**
   * Show/hide element based on responsive condition
   * Usage: toggleDisplay(element, 'mobile') // shows on mobile, hides on desktop
   */
  function toggleDisplay(element, mode) {
    if (!element) return;

    const shouldShow =
      (mode === "mobile" && state.isMobile) ||
      (mode === "desktop" && state.isDesktop);

    element.style.display = shouldShow ? "" : "none";
  }

  /**
   * Add/remove class based on responsive condition
   * Usage: toggleClass(element, 'hidden', 'desktop') // hidden on desktop
   */
  function toggleClass(element, className, mode) {
    if (!element) return;

    const shouldHave =
      (mode === "mobile" && state.isMobile) ||
      (mode === "desktop" && state.isDesktop);

    if (shouldHave) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  /**
   * Execute callback only on specific devices
   * Usage: onDevice('mobile', () => { ... }) // runs on mobile only
   */
  function onDevice(mode, callback) {
    if (
      (mode === "mobile" && state.isMobile) ||
      (mode === "desktop" && state.isDesktop)
    ) {
      callback();
    }

    // Listen for changes
    return onResponsiveChange((responsive) => {
      const shouldRun =
        (mode === "mobile" && responsive.isMobile) ||
        (mode === "desktop" && responsive.isDesktop);

      if (shouldRun) {
        callback();
      }
    });
  }

  /**
   * Get current device type string
   */
  function getDeviceType() {
    if (state.isMobile) return "mobile";
    if (state.isDesktop) return "desktop";
    return "unknown";
  }

  /**
   * INITIALIZATION
   */

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMediaQueries);
  } else {
    initializeMediaQueries();
  }

  /**
   * EXPORT TO GLOBAL SCOPE
   */
  window.ResponsiveHelpers = {
    isDesktop,
    isMobile,
    isLargeScreen,
    isTouchDevice,
    onResponsiveChange,
    toggleDisplay,
    toggleClass,
    onDevice,
    getDeviceType,
    BREAKPOINTS,
  };

  // Also expose state for debugging
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    window.__ResponsiveState = () => state;
  }
})();

/* --- clipboard-utils.js --- */
/**
 * Clipboard Utilities - Consolidated clipboard functionality
 * Includes: copy URL buttons, copy code blocks, copy heading links
 */

// Copy URL buttons (data-copy-url)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-copy-url]").forEach((button) => {
    button.addEventListener("click", () => {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          const originalText = button.innerHTML;
          button.innerHTML =
            button.getAttribute("data-copy-feedback") || "Copied!";
          setTimeout(() => (button.innerHTML = originalText), 2000);
        })
        .catch(console.error);
    });
  });
});

// Copy code blocks
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML = '<i class="fa-regular fa-clipboard"></i>';

    button.addEventListener("click", () => {
      navigator.clipboard
        .writeText(codeBlock.innerText)
        .then(() => {
          button.innerHTML = '<i class="fa-solid fa-check"></i>';
          button.classList.add("copied");
          setTimeout(() => {
            button.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
            button.classList.remove("copied");
          }, 2000);
        })
        .catch(console.error);
    });

    codeBlock.parentNode.appendChild(button);
  });
});

// Copy heading links
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")
    .forEach((heading) => {
      const originalContent = heading.innerHTML;
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.className = "copy-heading-link-button";
      link.setAttribute("aria-label", "Copy link to this heading");
      link.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>';

      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigator.clipboard
          .writeText(new URL(link.href, window.location.href).toString())
          .then(() => {
            link.style.transform = "scale(1.2)";
            setTimeout(() => (link.style.transform = "scale(1.05)"), 200);
          })
          .catch(console.error);
      });

      const textSpan = document.createElement("span");
      textSpan.innerHTML = originalContent;
      heading.innerHTML = "";
      heading.appendChild(textSpan);
      heading.appendChild(link);
    });
});

/* --- shortcut-hints.js --- */
(function () {
  "use strict";

  /**
   * Keyboard shortcut hints renderer
   * Shows platform-specific keyboard shortcuts (Ctrl/⌘, etc.)
   * Automatically hides on mobile devices using centralized responsive helpers
   */

  function renderShortcut(el) {
    var spec = el.getAttribute("data-shortcut");
    if (!spec) return;

    var desktopOnly = el.getAttribute("data-desktop-only") === "true";

    // Use centralized responsive helpers for consistent behavior
    if (
      desktopOnly &&
      window.ResponsiveHelpers &&
      window.ResponsiveHelpers.isMobile()
    ) {
      el.style.display = "none";
      return;
    }

    var platform =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      "";
    var isMac = /mac/i.test(platform);
    var primary = isMac ? "⌘" : "Ctrl";
    var altLabel = isMac ? "Option" : "Alt";
    var metaLabel = isMac ? "⌘" : "Win";

    var parts = spec.split("+").map(function (key) {
      var lower = key.trim().toLowerCase();
      if (lower === "primary") return primary;
      if (lower === "alt") return altLabel;
      if (lower === "meta") return metaLabel;
      if (lower === "shift") return "Shift";
      if (lower === "cmd" || lower === "command") return "⌘";
      return key.length === 1 ? key.toUpperCase() : key;
    });

    el.innerHTML = parts
      .map(function (k) {
        return '<kbd class="kbd">' + k + "</kbd>";
      })
      .join("");
    if (el.classList) el.classList.remove("hidden");
    el.style.display = "inline-flex";
    el.style.gap = "2px";
    el.classList.add("shortcut-hint-ready");
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-shortcut]").forEach(renderShortcut);
  });
})();

/* --- scroll-to-top.js --- */
(function () {
  "use strict";

  /**
   * Scroll-to-top button - Mobile only
   * Uses centralized responsive helpers for consistent behavior
   */

  // Only initialize on mobile devices
  if (!window.ResponsiveHelpers || !window.ResponsiveHelpers.isMobile()) {
    return;
  }

  function init() {
    var btn = document.createElement("button");
    btn.id = "scroll-to-top";
    btn.className = "btn btn-circle btn-primary btn-lg";
    btn.setAttribute("aria-label", "Scroll to top");
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>';

    // Inline styles for positioning and animation
    btn.style.cssText =
      "position: fixed; bottom: 1rem; right: 1rem; z-index: 40; opacity: 0; pointer-events: none; transition: opacity 0.3s ease, transform 0.3s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transform: translateY(20px);";

    document.body.appendChild(btn);

    var lastScrollY = 0;
    var scrollingUp = false;
    var scrollThreshold = 300; // Show after scrolling down 300px
    var ticking = false;

    function updateButton() {
      var currentScrollY = window.scrollY;
      var isScrolledDown = currentScrollY > scrollThreshold;
      var isGoingUp = currentScrollY < lastScrollY;

      scrollingUp = isGoingUp;
      lastScrollY = currentScrollY;

      // Show: scrolled down past threshold AND scrolling up
      // Hide: at top OR scrolling down
      if (isScrolledDown && scrollingUp) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        btn.style.transform = "translateY(0)";
      } else {
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
        btn.style.transform = "translateY(20px)";
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateButton);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* --- lazy-modules.js --- */
(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};

  window.addEventListener("DOMContentLoaded", function () {
    var katexInlineElements = document.querySelectorAll(".katex-inline");
    var katexBlockElements = document.querySelectorAll(".katex-block");
    var hasKatex =
      katexInlineElements.length > 0 || katexBlockElements.length > 0;
    var hasMermaid = document.querySelector(".mermaid");

    if (hasKatex && data.katexCss && data.katexJs) {
      var katexCSS = document.createElement("link");
      katexCSS.rel = "stylesheet";
      katexCSS.href = data.katexCss;
      document.head.appendChild(katexCSS);

      var katexScript = document.createElement("script");
      katexScript.src = data.katexJs;
      katexScript.onload = function () {
        katexInlineElements.forEach(function (elem) {
          var texContent = elem.textContent || elem.innerText;
          try {
            katex.render(texContent, elem, {
              throwOnError: false,
              displayMode: false,
            });
          } catch (e) {
            console.error("KaTeX render error:", e);
          }
        });

        katexBlockElements.forEach(function (elem) {
          var texContent = elem.textContent || elem.innerText;
          try {
            katex.render(texContent, elem, {
              throwOnError: false,
              displayMode: true,
            });
          } catch (e) {
            console.error("KaTeX render error:", e);
          }
        });
      };
      document.head.appendChild(katexScript);
    }

    if (hasMermaid && data.mermaidJs) {
      var mermaidScript = document.createElement("script");
      mermaidScript.src = data.mermaidJs;
      mermaidScript.onload = function () {
        if (typeof window.initMermaid === "function") {
          window.initMermaid();
        }
      };
      document.head.appendChild(mermaidScript);
    }
  });
})();

/* --- page-init.js --- */
(function () {
  "use strict";
  var el = document.currentScript;
  var data = (el && el.dataset) || {};
  var defaultColorset = data.defaultColorset || "dark";

  window.defaultColorset = defaultColorset;
  window.fallbackTheme = defaultColorset || "dark";

  var themeMapping = { dark: "dark", light: "light" };
  var currentUserTheme =
    (window.__getThemeCookie ? window.__getThemeCookie() : null) ||
    window.fallbackTheme;

  // Resolve "auto" to actual OS preference
  var resolvedTheme =
    currentUserTheme === "auto"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : currentUserTheme;

  window.initMermaid = function () {
    var mermaidTheme = resolvedTheme === "light" ? "light" : "dark";
    if (typeof mermaid !== "undefined") {
      mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
      var renderMermaid = async function () {
        var mermaidElements = document.querySelectorAll(".mermaid");
        if (mermaidElements.length > 0) {
          await mermaid.run({ nodes: mermaidElements });
        }
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderMermaid);
      } else {
        renderMermaid();
      }
    }
  };

  if (typeof mermaid !== "undefined") {
    window.initMermaid();
  }
})();

/* --- sw-register.js --- */
(function () {
  "use strict";
  var el = document.currentScript;
  if (!el || !("serviceWorker" in navigator)) return;
  var swPath = (el.dataset && el.dataset.swPath) || "/sw.js";

  window.addEventListener("load", function () {
    navigator.serviceWorker.register(swPath).catch(function (error) {
      console.error("Service Worker registration failed:", error);
    });

    navigator.serviceWorker.ready.then(function (reg) {
      if ("periodicSync" in reg) {
        reg.periodicSync
          .register("content-sync", { minInterval: 24 * 60 * 60 * 1000 })
          .catch(function () {});
      }
      if ("sync" in reg) {
        reg.sync.register("sync-site-refresh").catch(function () {});
      }

      // Check for new posts on every page load (SW will de-dup via stored guid)
      if (reg.active) {
        reg.active.postMessage({ type: "CHECK_LATEST_POST" });
      }

      // Also check when a new SW takes over (e.g. after site deploy)
      var refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (refreshing) return;
        refreshing = true;
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "CHECK_LATEST_POST",
          });
        }
      });
    });
  });

  // Request notification permission on PWA install
  window.addEventListener("appinstalled", function () {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(function () {});
    }
  });

  // Also allow requesting notification permission via a user gesture.
  // Look for any element with [data-enable-notifications] on the page.
  document.addEventListener("click", function (e) {
    var btn =
      e.target.closest && e.target.closest("[data-enable-notifications]");
    if (!btn) return;
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission()
        .then(function (result) {
          if (result === "granted" && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "CHECK_LATEST_POST",
            });
          }
        })
        .catch(function () {});
    }
  });
})();

/* --- comments-giscus.js --- */
(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};
  var targetId = data.target || "comments";
  var mount = document.getElementById(targetId);
  if (!mount) return;

  var rawTheme =
    (window.__getThemeCookie ? window.__getThemeCookie() : null) || "auto";
  var giscusTheme =
    rawTheme === "auto"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : rawTheme;

  var script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", data.repo || "");
  script.setAttribute("data-repo-id", data.repoId || "");
  script.setAttribute("data-category", data.category || "");
  script.setAttribute("data-category-id", data.categoryId || "");
  script.setAttribute("data-mapping", data.mapping || "pathname");
  script.setAttribute("data-strict", data.strict || "0");
  script.setAttribute("data-reactions-enabled", data.reactionsEnabled || "1");
  script.setAttribute("data-emit-metadata", data.emitMetadata || "1");
  script.setAttribute("data-input-position", data.inputPosition || "top");
  script.setAttribute("data-theme", giscusTheme);
  script.setAttribute("data-lang", data.lang || "en");
  script.setAttribute("data-loading", data.loading || "lazy");
  script.crossOrigin = "anonymous";
  script.async = true;

  mount.appendChild(script);
})();

/* --- shell.js --- */
/**
 * dhanur.me — Plug-and-play design system shell.
 *
 * Include this single script and it automatically:
 *   1. Injects CSS (main.css + font-awesome.min.css) from dhanur.me
 *   2. Builds the full layout shell (navbar + sidebar drawer) in JS — no network fetch
 *   3. Wraps your page content inside the DaisyUI drawer
 *   4. Handles theme (dark/light), logo switching, cookie sync
 *   5. Overrides favicon to dhanur.me icon set by default
 *   6. Wires dropdown positioning, auth UI (when AUTH SDK is present)
 *
 * Simplest usage (just the script tag):
 *   <script src="https://dhanur.me/js/shell.js" defer></script>
 *
 * Configuration (set before this script loads):
 *   Create a file `js/shell-config.js`:
 *     window.SiteNavConfig = {
 *       nav: [
 *         { name: "Home", url: "/", icon: "fa-solid fa-house" },
 *         { name: "Docs", url: "/docs/", icon: "fa-solid fa-book" }
 *       ],
 *       activePath: "/docs/",
 *       logo: { href: "/", text: "~/myapp" },
 *       showAppsGrid: true,
 *       showThemeToggle: true,
 *       showAccount: true,
 *       noCSS: false
 *     };
 *
 *   Then load it before shell.js:
 *   <script src="/js/shell-config.js"></script>
 *   <script src="https://dhanur.me/js/shell.js" defer></script>
 *
 * Script tag attributes:
 *   data-base-url   — Override base URL (default: https://dhanur.me)
 *   data-no-css     — Skip auto-injecting CSS
 */
(function () {
  "use strict";

  // =========================================================================
  // 1. Constants
  // =========================================================================
  var THEME_MAP = { dark: "dark", light: "light" };
  var MAIN_SITE = "https://dhanur.me";

  var APPS = [
    { name: "Home", url: "https://dhanur.me", icon: "fa-solid fa-globe" },
    { name: "Linkr", url: "https://linkr.dhanur.me", icon: "fa-solid fa-link" },
    {
      name: "Tasks",
      url: "https://tasks.dhanur.me",
      icon: "fa-solid fa-list-check",
    },
  ];

  var SVG_HAMBURGER =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
  var SVG_APPS_GRID =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="14" cy="2" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="14" cy="8" r="1.5"/><circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/><circle cx="14" cy="14" r="1.5"/></svg>';
  var SVG_CHEVRON =
    '<svg class="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  var SVG_SUN =
    '<svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>';
  var SVG_MOON =
    '<svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>';

  // Default logo: dhanur.me theme-specific images
  var DEFAULT_LOGO = {
    href: MAIN_SITE,
    text: "~/dhanur",
    darkImage: MAIN_SITE + "/images/logo-light.png",
    lightImage: MAIN_SITE + "/images/logo-dark.png",
    darkImageWebp: MAIN_SITE + "/images/logo-light.webp",
    lightImageWebp: MAIN_SITE + "/images/logo-dark.webp",
    imagePadding: "15px",
  };

  // Default nav: single Home link
  var DEFAULT_NAV = [
    { name: "Home", url: MAIN_SITE, icon: "fa-solid fa-house" },
  ];

  // =========================================================================
  // 2. Script element + SiteNavConfig
  // =========================================================================
  var SCRIPT_EL =
    document.currentScript || document.querySelector('script[src*="shell.js"]');

  var SCRIPT_ATTR = {
    baseUrl: SCRIPT_EL ? SCRIPT_EL.getAttribute("data-base-url") : null,
    noCss: SCRIPT_EL ? SCRIPT_EL.hasAttribute("data-no-css") : false,
  };

  var CFG = window.SiteNavConfig || {};
  var NAV_ITEMS = CFG.nav || DEFAULT_NAV;
  var ACTIVE_PATH = CFG.activePath || location.pathname;
  var BADGE_CFG = CFG.badge || null;
  var FAVICON_CFG = CFG.favicon !== undefined ? CFG.favicon : true;
  var SHOW_APPS = CFG.showAppsGrid !== false;
  var SHOW_THEME = CFG.showThemeToggle !== false;
  var SHOW_ACCOUNT = CFG.showAccount !== false;
  var NO_CSS = CFG.noCSS === true || SCRIPT_ATTR.noCss;

  // Merge logo config with defaults
  var LOGO_CFG = (function () {
    var userLogo = CFG.logo || {};
    return {
      href: userLogo.href || DEFAULT_LOGO.href,
      text: userLogo.text || DEFAULT_LOGO.text,
      html: userLogo.html || null,
      darkImage: userLogo.darkImage || DEFAULT_LOGO.darkImage,
      lightImage: userLogo.lightImage || DEFAULT_LOGO.lightImage,
      darkImageWebp: userLogo.darkImageWebp || DEFAULT_LOGO.darkImageWebp,
      lightImageWebp: userLogo.lightImageWebp || DEFAULT_LOGO.lightImageWebp,
      imagePadding: userLogo.imagePadding || DEFAULT_LOGO.imagePadding,
      imageOnly:
        userLogo.darkImage !== undefined ||
        userLogo.lightImage !== undefined ||
        !CFG.logo,
    };
  })();

  // =========================================================================
  // 3. Base URL resolution
  // =========================================================================
  var SCRIPT_ORIGIN =
    SCRIPT_EL && SCRIPT_EL.src ? new URL(SCRIPT_EL.src).origin : MAIN_SITE;
  var BASE = (SCRIPT_ATTR.baseUrl || SCRIPT_ORIGIN).replace(/\/+$/, "");
  var SAME_ORIGIN = location.origin === BASE;

  // =========================================================================
  // 4. Utility: debounce
  // =========================================================================
  function debounce(fn, ms) {
    var t;
    return function () {
      var self = this,
        args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(self, args);
      }, ms);
    };
  }

  // =========================================================================
  // 5. Cookie helpers
  // =========================================================================
  var COOKIE_DOMAIN = (function () {
    var h = location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return "";
    var parts = h.split(".");
    return parts.length >= 2 ? "." + parts.slice(-2).join(".") : "";
  })();

  function getCookie() {
    if (window.__getThemeCookie) return window.__getThemeCookie();
    var m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    return m ? m[1] : null;
  }

  function setCookie(val) {
    if (window.__setThemeCookie) {
      window.__setThemeCookie(val);
      return;
    }
    var d = COOKIE_DOMAIN ? "; domain=" + COOKIE_DOMAIN : "";
    document.cookie =
      "theme=" + val + "; path=/" + d + "; max-age=31536000; SameSite=Lax";
  }

  // Resolve "auto" to "dark" or "light" based on OS preference
  function resolveColorset(val) {
    if (window.__resolveColorset) return window.__resolveColorset(val);
    if (val === "auto") {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return val;
  }

  // =========================================================================
  // 6. FOUC prevention — apply theme immediately (synchronous)
  // =========================================================================
  (function () {
    var raw = getCookie() || "auto";
    var theme = resolveColorset(raw);
    var daisyTheme = THEME_MAP[theme] || theme;
    document.documentElement.setAttribute("data-theme", daisyTheme);
    document.documentElement.classList.add(theme === "dark" ? "dark" : "light");
    document.documentElement.style.colorScheme =
      theme === "dark" ? "dark" : "light";
  })();

  // =========================================================================
  // 7. CSS injection
  // =========================================================================
  function injectCSS() {
    if (NO_CSS) return;
    var cssBase = SAME_ORIGIN ? "" : BASE;

    var hasMain = false,
      hasFA = false;
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      if (href.indexOf("main.css") !== -1) hasMain = true;
      if (href.indexOf("font-awesome") !== -1) hasFA = true;
    }

    // Font preloads
    [
      { href: cssBase + "/webfonts/fa-solid-900.woff2", type: "font/woff2" },
      { href: cssBase + "/webfonts/fa-brands-400.woff2", type: "font/woff2" },
      { href: cssBase + "/fonts/Pretendard-Regular.woff", type: "font/woff" },
    ].forEach(function (p) {
      var pl = document.createElement("link");
      pl.rel = "preload";
      pl.as = "font";
      pl.type = p.type;
      pl.href = p.href;
      pl.crossOrigin = "anonymous";
      document.head.appendChild(pl);
    });

    if (!hasMain) {
      var mainLink = document.createElement("link");
      mainLink.rel = "stylesheet";
      mainLink.href = cssBase + "/css/main.css";
      if (!SAME_ORIGIN) mainLink.crossOrigin = "anonymous";
      document.head.appendChild(mainLink);
    }

    if (!hasFA) {
      var faLink = document.createElement("link");
      faLink.rel = "stylesheet";
      faLink.href = cssBase + "/css/font-awesome.min.css";
      faLink.media = "print";
      faLink.onload = function () {
        this.media = "all";
      };
      if (!SAME_ORIGIN) faLink.crossOrigin = "anonymous";
      document.head.appendChild(faLink);
      var ns = document.createElement("noscript");
      var nsFa = document.createElement("link");
      nsFa.rel = "stylesheet";
      nsFa.href = cssBase + "/css/font-awesome.min.css";
      ns.appendChild(nsFa);
      document.head.appendChild(ns);
    }

    var fontStyle = document.createElement("style");
    fontStyle.textContent =
      '@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap;' +
      "src:url(" +
      cssBase +
      '/webfonts/fa-brands-400.woff2) format("woff2"),' +
      "url(" +
      cssBase +
      '/webfonts/fa-brands-400.ttf) format("truetype")}' +
      '@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:swap;' +
      "src:url(" +
      cssBase +
      '/webfonts/fa-regular-400.woff2) format("woff2"),' +
      "url(" +
      cssBase +
      '/webfonts/fa-regular-400.ttf) format("truetype")}' +
      '@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap;' +
      "src:url(" +
      cssBase +
      '/webfonts/fa-solid-900.woff2) format("woff2"),' +
      "url(" +
      cssBase +
      '/webfonts/fa-solid-900.ttf) format("truetype")}' +
      '@font-face{font-family:"Pretendard-Regular";' +
      "src:url('" +
      cssBase +
      '/fonts/Pretendard-Regular.woff\') format("woff");' +
      "font-weight:400;font-style:normal;font-display:swap}" +
      'body{font-family:"Pretendard-Regular",sans-serif}';
    document.head.appendChild(fontStyle);
  }
  injectCSS();

  // =========================================================================
  // 8. Favicon injection
  // =========================================================================
  function injectFavicons() {
    if (FAVICON_CFG === false) return;
    var iconBase =
      typeof FAVICON_CFG === "string"
        ? FAVICON_CFG.replace(/\/+$/, "") + "/"
        : BASE + "/icons/";

    document
      .querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
      )
      .forEach(function (el) {
        el.remove();
      });

    [
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: iconBase + "favicon-96x96.png",
      },
      { rel: "icon", type: "image/svg+xml", href: iconBase + "favicon.svg" },
      { rel: "shortcut icon", href: iconBase + "favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: iconBase + "apple-touch-icon.png",
      },
      { rel: "manifest", href: iconBase + "site.webmanifest" },
    ].forEach(function (f) {
      var link = document.createElement("link");
      link.rel = f.rel;
      if (f.type) link.type = f.type;
      if (f.sizes) link.sizes = f.sizes;
      link.href = f.href;
      if (!SAME_ORIGIN && f.rel === "manifest") link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }

  // =========================================================================
  // 9. Theme engine (3-mode: auto / light / dark)
  // =========================================================================
  var _logoDark = null;
  var _logoLight = null;
  var _currentMode = "auto"; // raw cookie value: "auto", "dark", "light"
  var _mediaQuery = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  // Mode cycling order (kept for validation)
  var MODE_CYCLE = ["auto", "light", "dark"];

  // Active segment style classes
  var ACTIVE_CLASS = "bg-base-content/15 shadow-sm opacity-100";
  var INACTIVE_CLASS = "opacity-50 hover:opacity-80";

  function applyTheme(resolvedTheme) {
    var daisyTheme = THEME_MAP[resolvedTheme] || resolvedTheme;
    document.documentElement.setAttribute("data-theme", daisyTheme);
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    document.documentElement.style.backgroundColor = "";
    if (_logoDark)
      _logoDark.classList.toggle("invisible", resolvedTheme !== "dark");
    if (_logoLight)
      _logoLight.classList.toggle("invisible", resolvedTheme !== "light");
  }

  function updateToggleUI() {
    // Find all switcher containers (desktop + mobile)
    var switchers = document.querySelectorAll(".theme-switcher");
    switchers.forEach(function (sw) {
      var btns = sw.querySelectorAll("[data-theme-mode]");
      btns.forEach(function (btn) {
        var mode = btn.getAttribute("data-theme-mode");
        // Remove all dynamic classes first
        ACTIVE_CLASS.split(" ").forEach(function (c) {
          btn.classList.remove(c);
        });
        INACTIVE_CLASS.split(" ").forEach(function (c) {
          btn.classList.remove(c);
        });
        // Apply correct state
        if (mode === _currentMode) {
          ACTIVE_CLASS.split(" ").forEach(function (c) {
            btn.classList.add(c);
          });
        } else {
          INACTIVE_CLASS.split(" ").forEach(function (c) {
            btn.classList.add(c);
          });
        }
      });
    });
  }

  function setMode(mode) {
    _currentMode = mode;
    setCookie(mode);
    var resolved = resolveColorset(mode);
    applyTheme(resolved);
    updateToggleUI();
    document.dispatchEvent(
      new CustomEvent("themeChanged", { detail: resolved }),
    );
  }

  function wireTheme() {
    _currentMode = getCookie() || "auto";
    // Ensure valid mode
    if (MODE_CYCLE.indexOf(_currentMode) === -1) _currentMode = "auto";

    var resolved = resolveColorset(_currentMode);
    applyTheme(resolved);
    updateToggleUI();
    document.dispatchEvent(
      new CustomEvent("themeChanged", { detail: resolved }),
    );

    // Wire click handlers on all segment buttons
    var allBtns = document.querySelectorAll(
      ".theme-switcher [data-theme-mode]",
    );
    allBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var mode = btn.getAttribute("data-theme-mode");
        if (mode && mode !== _currentMode) {
          setMode(mode);
        }
      });
    });

    // Listen for OS preference changes — only affects "auto" mode
    if (_mediaQuery) {
      var osChangeHandler = function () {
        if (_currentMode === "auto") {
          var resolved = resolveColorset("auto");
          applyTheme(resolved);
          updateToggleUI();
          document.dispatchEvent(
            new CustomEvent("themeChanged", { detail: resolved }),
          );
        }
      };
      if (_mediaQuery.addEventListener) {
        _mediaQuery.addEventListener("change", osChangeHandler);
      } else if (_mediaQuery.addListener) {
        _mediaQuery.addListener(osChangeHandler);
      }
    }
  }

  // =========================================================================
  // 10. Dropdown controller
  // =========================================================================
  function initDropdowns(root) {
    var dropdowns = root.querySelectorAll("[data-dropdown]");
    if (!dropdowns.length) return;
    var openDropdown = null;

    function closeAll() {
      dropdowns.forEach(function (dd) {
        dd.removeAttribute("data-open");

        // Restore tooltip if it was suppressed
        var btn = dd.querySelector('[role="button"]');
        if (btn && btn.hasAttribute("data-tip")) {
          btn.classList.add("tooltip");
        }

      });
      openDropdown = null;
    }

    function positionPanel(dd) {
      var panel = dd.querySelector(".dropdown-panel");
      if (!panel) return;
      var rect = dd.getBoundingClientRect();
      var pw = panel.offsetWidth || 224;
      var idealLeft = (rect.width - pw) / 2;

      // Use window.innerWidth - 32 to safely clear any scrollbars (up to 20px) and leave padding
      var rightOverflow = rect.left + idealLeft + pw - (window.innerWidth - 16);
      if (rightOverflow > 0) idealLeft -= rightOverflow;
      if (rect.left + idealLeft < 8) idealLeft = 8 - rect.left;

      panel.style.left = idealLeft + "px";
      panel.style.right = "auto";
    }

    function openPanel(dd) {
      dd.setAttribute("data-open", "");
      openDropdown = dd;

      // Suppress tooltip while open
      var btn = dd.querySelector('[role="button"]');
      if (btn) btn.classList.remove("tooltip");

      var panel = dd.querySelector(".dropdown-panel");
      if (panel) positionPanel(dd);
    }

    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector('[role="button"]');
      if (!btn) return;
      var panel = dd.querySelector(".dropdown-panel");

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = dd.hasAttribute("data-open");
        closeAll();
        if (!wasOpen) openPanel(dd);
      });

      if (panel) {
        panel.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    });

    document.addEventListener("click", function () {
      if (openDropdown) closeAll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openDropdown) closeAll();
    });
    window.addEventListener(
      "resize",
      debounce(function () {
        if (openDropdown) positionPanel(openDropdown);
      }, 100),
    );
  }

  // =========================================================================
  // 11. DOM Extractors & Builders (for SiteNavConfig customization)
  // =========================================================================

  function el(tag, className, innerHTML) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (innerHTML) e.innerHTML = innerHTML;
    return e;
  }

  function normSlash(p) {
    return (p || "").replace(/\/$/, "") || "/";
  }

  function buildHeaderNavItem(item) {
    var li = document.createElement("li");
    if (item.type === "dropdown" && item.members) {
      li.className = "dropdown dropdown-end";
      var btn = el("div", "btn btn-ghost");
      btn.setAttribute("tabindex", "0");
      btn.setAttribute("role", "button");
      var btnHTML = "";
      if (item.icon) btnHTML += '<i class="' + item.icon + '"></i> ';
      btnHTML += item.name + " " + SVG_CHEVRON;
      btn.innerHTML = btnHTML;
      li.appendChild(btn);

      var dropUl = el(
        "ul",
        "dropdown-content menu bg-base-100 border border-base-content/10 rounded-box z-1 p-2 shadow-sm",
      );
      dropUl.setAttribute("tabindex", "0");
      item.members.forEach(function (m) {
        var mLi = document.createElement("li");
        var mA = el("a", "btn btn-ghost hover:no-underline");
        mA.href = m.url;
        var mHTML = "";
        if (m.icon) mHTML += '<i class="' + m.icon + '"></i> ';
        mHTML += m.name;
        mA.innerHTML = mHTML;
        mLi.appendChild(mA);
        dropUl.appendChild(mLi);
      });
      li.appendChild(dropUl);
    } else {
      var a = el("a", "btn btn-ghost hover:no-underline");
      a.href = item.url;
      var aHTML = "";
      if (item.icon) aHTML += '<i class="' + item.icon + '"></i> ';
      aHTML += item.name;
      a.innerHTML = aHTML;
      li.appendChild(a);
    }
    return li;
  }

  function buildSidebarNavItem(item) {
    var li = document.createElement("li");
    var isActive = normSlash(ACTIVE_PATH) === normSlash(item.url);
    if (isActive) li.className = "rounded bg-gray-500/15 font-medium";
    var a = el("a", "hover:no-underline");
    a.href = item.url;
    var aHTML = "";
    if (item.icon) aHTML += '<i class="' + item.icon + '"></i> ';
    aHTML += item.name;
    a.innerHTML = aHTML;
    li.appendChild(a);
    return li;
  }

  function customizeDOM(drawer) {
    if (!drawer) return;

    // 1. Override Header Nav if CFG.nav is provided
    if (CFG.nav) {
      var headerNavUl = drawer.querySelector(".navbar .menu.menu-horizontal");
      if (headerNavUl) {
        // Remove all non-chrome <li> elements
        var items = Array.from(headerNavUl.children);
        var insertBeforeNode = null;
        items.forEach(function (li) {
          if (!li.hasAttribute("data-nav-chrome")) {
            headerNavUl.removeChild(li);
          } else if (!insertBeforeNode) {
            insertBeforeNode = li;
          }
        });

        // Insert custom nav items
        CFG.nav.forEach(function (item) {
          var li = buildHeaderNavItem(item);
          if (insertBeforeNode) headerNavUl.insertBefore(li, insertBeforeNode);
          else headerNavUl.appendChild(li);
        });
      }
    }

    // 2. Override Sidebar Nav if CFG.sidebarNav or explicitly defined CFG.nav
    var sidebarNavItems = CFG.sidebarNav || CFG.nav;
    if (sidebarNavItems) {
      var sidebarUl = drawer.querySelector("#sidebar [data-sidebar-nav]");
      if (sidebarUl) {
        sidebarUl.innerHTML = ""; // Clear Zola links
        sidebarNavItems.forEach(function (item) {
          if (item.type === "dropdown" && item.members) {
            item.members.forEach(function (m) {
              sidebarUl.appendChild(buildSidebarNavItem(m));
            });
          } else if (item.children) {
            sidebarUl.appendChild(buildSidebarNavItem(item));
            item.children.forEach(function (c) {
              sidebarUl.appendChild(buildSidebarNavItem(c));
            });
          } else {
            sidebarUl.appendChild(buildSidebarNavItem(item));
          }
        });
      }
    }

    // Apply active state (fallback for existing Zola DOM elements)
    var activePath = normSlash(ACTIVE_PATH);
    drawer
      .querySelectorAll("#sidebar [data-sidebar-nav] a")
      .forEach(function (a) {
        try {
          if (
            normSlash(new URL(a.href, location.origin).pathname) === activePath
          ) {
            a.parentElement.className = "rounded bg-gray-500/15 font-medium";
          }
        } catch (e) {}
      });

    // Handle Chrome Visibility Overrides
    if (CFG.showSearch === false) {
      var searchEl = drawer.querySelector('.input[aria-label="Search"]');
      if (searchEl) {
        var searchContainer = searchEl.closest("div.px-2.pt-4");
        if (searchContainer) searchContainer.style.display = "none";
      }
    }
    if (CFG.showAppsGrid === false) {
      var appsEl = drawer.querySelector('[data-nav-chrome="apps"]');
      if (appsEl) appsEl.style.display = "none";
      var appsSidebarEl = drawer.querySelector("[data-apps-grid-sidebar]");
      if (appsSidebarEl) appsSidebarEl.style.display = "none";
    }
    if (CFG.showThemeToggle === false) {
      var themeEl = drawer.querySelector('[data-nav-chrome="theme"]');
      if (themeEl) themeEl.style.display = "none";
      var themeSidebarEl = drawer.querySelector("#theme-toggle-mobile");
      if (themeSidebarEl) themeSidebarEl.style.display = "none";
    }
    if (CFG.showAccount === false) {
      var accountEl = drawer.querySelector('[data-nav-chrome="account"]');
      if (accountEl) accountEl.style.display = "none";
      var accountSidebarEl = drawer.querySelector("[data-sidebar-account]");
      if (accountSidebarEl) accountSidebarEl.style.display = "none";
    }

    // Apply logo badge if requested
    if (BADGE_CFG && BADGE_CFG.text) {
      var logoLink = drawer.querySelector(".navbar .btn-ghost.logo-gradient");
      if (logoLink) {
        var badge = el(
          "div",
          "badge " + (BADGE_CFG.class || "badge-neutral") + " badge-sm ml-2",
        );
        badge.textContent = BADGE_CFG.text;
        logoLink.parentElement.appendChild(badge);
      }
    }
  }

  // =========================================================================
  // 12. Auth integration + Credits display
  // =========================================================================

  // Auto-inject auth-client.js from auth.dhanur.me
  function injectAuthSDK(callback) {
    if (window.AUTH) {
      callback();
      return;
    }
    var existing = document.querySelector('script[src*="auth-client.js"]');
    if (existing) {
      // Script tag exists but AUTH may not be ready yet
      document.addEventListener(
        "authReady",
        function () {
          callback();
        },
        { once: true },
      );
      return;
    }
    var script = document.createElement("script");
    script.src = "https://auth.dhanur.me/auth-client.js";
    script.defer = true;
    script.onload = function () {
      // AUTH.onReady will fire when status is fetched
      if (window.AUTH && typeof AUTH.onReady === "function") {
        AUTH.onReady(function () {
          callback();
        });
      } else {
        callback();
      }
    };
    script.onerror = function () {
      console.warn("[shell.js] Could not load auth-client.js");
    };
    document.head.appendChild(script);
  }

  function formatCreditsReset(periodEnd) {
    if (!periodEnd) return "";
    try {
      var d = new Date(periodEnd);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return "resets " + months[d.getUTCMonth()] + " " + d.getUTCDate();
    } catch (e) {
      return "";
    }
  }

  function updateCreditsUI(drawer, credits) {
    if (!credits) return;
    var isUnlimited = credits.unlimited || credits.balance === -1;
    var balanceText = isUnlimited ? "∞" : String(credits.balance);
    var resetText = isUnlimited ? "" : formatCreditsReset(credits.periodEnd);

    // Desktop dropdown
    var creditsRow = drawer.querySelector('[data-auth="credits-row"]');
    if (creditsRow) {
      creditsRow.classList.remove("hidden");
      var balanceEl = creditsRow.querySelector('[data-auth="credits-balance"]');
      var resetEl = creditsRow.querySelector('[data-auth="credits-reset"]');
      if (balanceEl) balanceEl.textContent = balanceText;
      if (resetEl) resetEl.textContent = resetText;
    }

    // Mobile sidebar
    var sidebarCreditsRow = drawer.querySelector(
      '[data-auth="sidebar-credits-row"]',
    );
    if (sidebarCreditsRow) {
      sidebarCreditsRow.classList.remove("hidden");
      var sBalanceEl = sidebarCreditsRow.querySelector(
        '[data-auth="sidebar-credits-balance"]',
      );
      var sResetEl = sidebarCreditsRow.querySelector(
        '[data-auth="sidebar-credits-reset"]',
      );
      if (sBalanceEl) sBalanceEl.textContent = balanceText;
      if (sResetEl) sResetEl.textContent = resetText;
    }
  }

  function hideCreditsUI(drawer) {
    var creditsRow = drawer.querySelector('[data-auth="credits-row"]');
    if (creditsRow) creditsRow.classList.add("hidden");
    var sidebarCreditsRow = drawer.querySelector(
      '[data-auth="sidebar-credits-row"]',
    );
    if (sidebarCreditsRow) sidebarCreditsRow.classList.add("hidden");
  }

  function initAuth(drawer) {
    if (!drawer || typeof AUTH === "undefined" || !window.AUTH) return;

    // Dynamically query DOM instead of relying on build refs
    var r = {
      navGuestAvatar: drawer.querySelector(
        '.navbar [data-dropdown="account"] .bg-base-300',
      ),
      navAuthedAvatar: drawer.querySelector(
        '.navbar [data-dropdown="account"] .ring-primary',
      ),
      navAvatarImg: drawer.querySelector(
        '.navbar [data-dropdown="account"] .ring-primary img',
      ),
      navAuthedHeader: drawer
        .querySelector('.navbar .dropdown-panel [data-auth="name"]')
        ?.closest(".border-b"),
      navGuestHeader: drawer
        .querySelector(".navbar .dropdown-panel .fa-user")
        ?.closest(".border-b"),
      navName: drawer.querySelector('.navbar [data-auth="name"]'),
      navEmail: drawer.querySelector('.navbar [data-auth="email"]'),
      navRole: drawer.querySelector('.navbar [data-auth="role"]'),
      navLoginItem: drawer.querySelector('.navbar [data-auth="login-item"]'),
      navAccountItem: drawer.querySelector(
        '.navbar [data-auth="account-item"]',
      ),
      navUpgradeItem: drawer.querySelector(
        '.navbar [data-auth="upgrade-item"]',
      ),
      navLogoutItem: drawer.querySelector('.navbar [data-auth="logout-item"]'),

      sidebarGuestAvatar: drawer.querySelector(
        "#sidebar [data-sidebar-account] .bg-base-300",
      ),
      sidebarAuthedAvatar: drawer.querySelector(
        "#sidebar [data-sidebar-account] .ring-primary",
      ),
      sidebarAvatarImg: drawer.querySelector(
        "#sidebar [data-sidebar-account] .ring-primary img",
      ),
      sidebarName: drawer.querySelector(
        "#sidebar [data-sidebar-account] .font-semibold",
      ),
      sidebarEmail: drawer.querySelector(
        "#sidebar [data-sidebar-account] .text-xs.opacity-60",
      ),
      sidebarLoginBtn: drawer.querySelector(
        '#sidebar [data-auth="sidebar-login-btn"]',
      ),
      sidebarLogoutBtn: drawer.querySelector(
        '#sidebar [data-auth="sidebar-logout-btn"]',
      ),
      sidebarAccountBtn: drawer.querySelector(
        '#sidebar [data-auth="sidebar-account-btn"]',
      ),
    };

    function updateUI(status) {
      if (!status) return;
      var authed = status.authenticated;
      var user = status.user;
      var role = status.role || "user";
      var avatarUrl = (user && user.avatar_url) || "";
      var userName = (user && user.name) || "User";
      var userEmail = (user && user.email) || "";
      var credits = status.credits || null;

      if (authed && user) {
        if (r.navGuestAvatar) r.navGuestAvatar.classList.add("hidden");
        if (r.navAuthedAvatar) r.navAuthedAvatar.classList.remove("hidden");
        if (r.navAvatarImg) r.navAvatarImg.src = avatarUrl;
        if (r.navAuthedHeader) r.navAuthedHeader.classList.remove("hidden");
        if (r.navGuestHeader) r.navGuestHeader.classList.add("hidden");
        if (r.navAuthedHeader && r.navAuthedHeader.querySelector("img"))
          r.navAuthedHeader.querySelector("img").src = avatarUrl;
        if (r.navName) r.navName.textContent = userName;
        if (r.navEmail) r.navEmail.textContent = userEmail;
        if (r.navRole) {
          r.navRole.textContent = role.toUpperCase();
          r.navRole.className =
            role === "admin"
              ? "badge badge-sm badge-error"
              : "badge badge-sm badge-success";
          r.navRole.classList.remove("hidden");
        }
        if (r.navLoginItem) r.navLoginItem.classList.add("hidden");
        if (r.navAccountItem) r.navAccountItem.classList.remove("hidden");
        if (r.navLogoutItem) r.navLogoutItem.classList.remove("hidden");
        if (r.navUpgradeItem)
          r.navUpgradeItem.classList.toggle("hidden", role === "admin");

        if (r.sidebarGuestAvatar) r.sidebarGuestAvatar.classList.add("hidden");
        if (r.sidebarAuthedAvatar)
          r.sidebarAuthedAvatar.classList.remove("hidden");
        if (r.sidebarAvatarImg) r.sidebarAvatarImg.src = avatarUrl;
        if (r.sidebarName) r.sidebarName.textContent = userName;
        if (r.sidebarEmail) r.sidebarEmail.textContent = userEmail;
        if (r.sidebarLoginBtn) r.sidebarLoginBtn.classList.add("hidden");
        if (r.sidebarLogoutBtn) r.sidebarLogoutBtn.classList.remove("hidden");
        if (r.sidebarAccountBtn) r.sidebarAccountBtn.classList.remove("hidden");

        // Update credits display
        updateCreditsUI(drawer, credits);
      } else {
        if (r.navGuestAvatar) r.navGuestAvatar.classList.remove("hidden");
        if (r.navAuthedAvatar) r.navAuthedAvatar.classList.add("hidden");
        if (r.navAuthedHeader) r.navAuthedHeader.classList.add("hidden");
        if (r.navGuestHeader) r.navGuestHeader.classList.remove("hidden");
        if (r.navRole) r.navRole.classList.add("hidden");
        if (r.navLoginItem) r.navLoginItem.classList.remove("hidden");
        if (r.navAccountItem) r.navAccountItem.classList.add("hidden");
        if (r.navLogoutItem) r.navLogoutItem.classList.add("hidden");
        if (r.navUpgradeItem) r.navUpgradeItem.classList.add("hidden");

        if (r.sidebarGuestAvatar)
          r.sidebarGuestAvatar.classList.remove("hidden");
        if (r.sidebarAuthedAvatar)
          r.sidebarAuthedAvatar.classList.add("hidden");
        if (r.sidebarName) r.sidebarName.textContent = "Guest";
        if (r.sidebarEmail) r.sidebarEmail.textContent = "Not signed in";
        if (r.sidebarLoginBtn) r.sidebarLoginBtn.classList.remove("hidden");
        if (r.sidebarLogoutBtn) r.sidebarLogoutBtn.classList.add("hidden");
        if (r.sidebarAccountBtn) r.sidebarAccountBtn.classList.add("hidden");

        // Hide credits display
        hideCreditsUI(drawer);
      }
    }

    if (typeof AUTH.onReady === "function") {
      AUTH.onReady(function (auth) {
        updateUI(auth.status || auth);
      });
    }
    document.addEventListener("authChanged", function (e) {
      updateUI(e.detail);
    });
    document.addEventListener("creditsChanged", function (e) {
      updateCreditsUI(drawer, e.detail);
    });

    drawer
      .querySelectorAll(
        '[data-auth="login-btn"], [data-auth="sidebar-login-btn"]',
      )
      .forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          if (typeof AUTH.login === "function") {
            e.preventDefault();
            AUTH.login();
          }
        });
      });

    drawer
      .querySelectorAll(
        '[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"]',
      )
      .forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof AUTH.logout === "function") {
            AUTH.logout().then(function () {
              window.location.reload();
            });
          }
        });
      });

    drawer
      .querySelectorAll('[data-auth="upgrade-btn"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof AUTH.upgrade === "function") AUTH.upgrade();
        });
      });
  }

  // =========================================================================
  // 13. Bootstrap (Fetch & Inject / Hydrate)
  // =========================================================================
  window.__componentsJS = true;
  var _injected = false;

  function hydrate(drawer) {
    customizeDOM(drawer);

    // Find dynamic logos
    _logoDark = drawer.querySelector(".logo-dark");
    _logoLight = drawer.querySelector(".logo-light");

    wireTheme();
    initDropdowns(drawer);
    injectFavicons();

    // Auto-inject auth SDK and initialize auth integration
    injectAuthSDK(function () {
      initAuth(drawer);
    });
  }

  function bootstrap() {
    if (_injected) return;
    _injected = true;

    var existingNavbar = document.querySelector(".navbar");

    if (existingNavbar) {
      // Scenario A: Zola already built the HTML (e.g. main site)
      // Just hydrate the existing DOM.
      hydrate(document.body);
    } else {
      // Scenario B: External Subdomain (e.g. auth.dhanur.me)
      // Fetch the navbar HTML shell and inject it.

      // Save current page body content
      var children = [];
      while (document.body.firstChild) {
        children.push(document.body.removeChild(document.body.firstChild));
      }

      fetch(BASE + "/navbar/")
        .then(function (res) {
          if (!res.ok) throw new Error("Failed to fetch navbar");
          return res.text();
        })
        .then(function (html) {
          // Parse HTML
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          var newDrawer = doc.querySelector(".drawer");
          if (!newDrawer) throw new Error("Drawer not found in fetched HTML");

          // Inject children into slot
          var slot = newDrawer.querySelector(".site-nav-slot");
          if (!slot)
            throw new Error("site-nav-slot missing in fetched navbar shell");

          children.forEach(function (node) {
            slot.appendChild(node);
          });

          document.body.appendChild(newDrawer);
          hydrate(newDrawer);
        })
        .catch(function (err) {
          console.error("Shell.js Error: ", err);
          // Fallback: put original content back if fetch fails
          children.forEach(function (node) {
            document.body.appendChild(node);
          });
        });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();

/* --- app.js --- */
function debounce(func, wait) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function makeTeaser(body, terms) {
  var TERM_WEIGHT = 40;
  var NORMAL_WORD_WEIGHT = 2;
  var FIRST_WORD_WEIGHT = 8;
  var TEASER_MAX_WORDS = 30;

  var stemmedTerms = terms.map(function (w) {
    return w.toLowerCase();
  });
  var termFound = false;
  var index = 0;
  var weighted = [];

  var sentences = body.toLowerCase().split(". ");

  for (var i in sentences) {
    var words = sentences[i].split(" ");
    var value = FIRST_WORD_WEIGHT;

    for (var j in words) {
      var word = words[j];

      if (word.length > 0) {
        for (var k in stemmedTerms) {
          if (word.toLowerCase().startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }

      index += word.length;
      index += 1;
    }

    index += 1;
  }

  if (weighted.length === 0) {
    return body;
  }

  var windowWeights = [];
  var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);
  var curSum = 0;
  for (var i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (var i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  var maxSumIndex = 0;
  if (termFound) {
    var maxFound = 0;
    for (var i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  var teaser = [];
  var startIndex = weighted[maxSumIndex][2];
  for (var i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    var word = weighted[i];
    if (startIndex < word[2]) {
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }

    if (word[1] === TERM_WEIGHT) {
      teaser.push("<b>");
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));

    if (word[1] === TERM_WEIGHT) {
      teaser.push("</b>");
    }
  }
  teaser.push("\u2026");
  return teaser.join("");
}

function formatSearchResultItem(item, terms) {
  var li = document.createElement("li");
  li.className = "search-result-item";
  li.innerHTML = `
    <a href="${
      item.item.id
    }" class="search-result-link block px-4 py-3 rounded-md hover:bg-base-200/50 transition-colors duration-150">
      <div class="flex items-start gap-3">
        <div class="search-result-icon flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="search-result-title font-semibold text-sm text-base-content mb-1">${
            item.item.title
          }</div>
          <div class="search-result-excerpt text-xs text-base-content/60 line-clamp-2">${makeTeaser(
            item.item.body,
            terms,
          )}</div>
        </div>
        <div class="search-result-arrow flex-shrink-0 opacity-0 transition-opacity duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  `;

  var link = li.querySelector(".search-result-link");
  var arrow = li.querySelector(".search-result-arrow");
  link.addEventListener("mouseenter", function () {
    arrow.style.opacity = "1";
  });
  link.addEventListener("mouseleave", function () {
    arrow.style.opacity = "0";
  });

  return li;
}

function initSearch() {
  if (typeof Fuse === "undefined" || !window.searchIndex) {
    return;
  }

  var $searchInput = document.getElementById("search");
  if (!$searchInput) {
    return;
  }

  var $searchResultsContainer = document.querySelector(
    ".search-results-container",
  );
  var $searchResultsHeader = document.querySelector(".search-results__header");
  var $searchResultsItems = document.querySelector(".search-results__items");
  var MAX_ITEMS = 10;
  var selectedIndex = -1;

  var options = {
    keys: [
      { name: "title", weight: 2 },
      { name: "body", weight: 1 },
      { name: "tags", weight: 1 },
    ],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.4,
  };
  var currentTerm = "";
  var documents = Object.values(window.searchIndex.documentStore.docs);
  var fuse = new Fuse(documents, options);

  function updateSelectedResult() {
    var items = $searchResultsItems.querySelectorAll(".search-result-item");
    items.forEach(function (item, index) {
      var link = item.querySelector(".search-result-link");
      if (index === selectedIndex) {
        link.classList.add("border");
      } else {
        link.classList.remove("border");
      }
    });

    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }

  $searchInput.addEventListener(
    "keyup",
    debounce(function () {
      var term = $searchInput.value.trim();
      if (term === currentTerm || !fuse) {
        return;
      }
      $searchResultsItems.innerHTML = "";
      $searchResultsHeader.innerHTML = "";
      selectedIndex = -1;

      if (term === "") {
        currentTerm = "";
        return;
      }

      var results = fuse.search(term).filter(function (r) {
        return r.item.body !== "";
      });

      if (results.length === 0) {
        $searchResultsHeader.innerHTML = `<span class="text-base-content/60">No results found for <strong class="text-base-content">"${term}"</strong></span>`;
        return;
      }

      currentTerm = term;
      $searchResultsHeader.innerHTML = `<span class="text-base-content/60">${
        results.length
      } result${
        results.length === 1 ? "" : "s"
      } for <strong class="text-base-content">"${term}"</strong></span>`;
      for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
        if (!results[i].item.body) {
          continue;
        }
        $searchResultsItems.appendChild(
          formatSearchResultItem(results[i], term.split(" ")),
        );
      }
    }, 150),
  );

  var searchModal = document.getElementById("search-modal");
  var modalBackdrop = document.querySelector(".modal");

  if (searchModal) {
    searchModal.addEventListener("change", function () {
      if (this.checked) {
        setTimeout(function () {
          $searchInput.focus();
        }, 100);
      } else {
        $searchInput.value = "";
        $searchResultsItems.innerHTML = "";
        $searchResultsHeader.innerHTML = "";
        currentTerm = "";
        selectedIndex = -1;
      }
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", function (e) {
      if (e.target === modalBackdrop && searchModal.checked) {
        searchModal.checked = false;
      }
    });
  }

  $searchInput.addEventListener("keydown", function (e) {
    var items = $searchResultsItems.querySelectorAll(".search-result-item");

    if (e.key === "Escape") {
      searchModal.checked = false;
      return;
    }

    if (items.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelectedResult();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelectedResult();
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      var link = items[selectedIndex].querySelector(".search-result-link");
      if (link) {
        window.location.href = link.getAttribute("href");
      }
    }
  });
}

function initThemeListeners() {
  var fallbackTheme =
    window && window.fallbackTheme ? window.fallbackTheme : "dark";
  var currentUserTheme =
    (window.__getThemeCookie ? window.__getThemeCookie() : null) ||
    fallbackTheme;

  // Resolve 'auto' to the actual OS preference to prevent UI breaking
  var resolvedTheme = window.__resolveColorset
    ? window.__resolveColorset(currentUserTheme)
    : currentUserTheme;

  updateLogoForTheme(resolvedTheme);
  updateHeroForTheme(resolvedTheme);

  document.addEventListener("themeChanged", function (e) {
    var userTheme = e.detail;
    var resolvedUpdatedTheme = window.__resolveColorset
      ? window.__resolveColorset(userTheme)
      : userTheme;

    updateLogoForTheme(resolvedUpdatedTheme);
    updateHeroForTheme(resolvedUpdatedTheme);
    updateGiscusTheme(resolvedUpdatedTheme);
  });
}

function updateLogoForTheme(userTheme) {
  var isDarkTheme = userTheme === "dark";

  var logoDark = updateLogoForTheme._logoDark;
  var logoLight = updateLogoForTheme._logoLight;

  if (logoDark === undefined || logoLight === undefined) {
    logoDark = updateLogoForTheme._logoDark =
      document.querySelector(".logo-dark");
    logoLight = updateLogoForTheme._logoLight =
      document.querySelector(".logo-light");
  }

  if (!logoDark && !logoLight) {
    return;
  }

  if (logoDark) {
    logoDark.classList.toggle("invisible", !isDarkTheme);
  }
  if (logoLight) {
    logoLight.classList.toggle("invisible", isDarkTheme);
  }
}

function updateHeroForTheme(userTheme) {
  var isDark = userTheme === "dark";

  var heroDark = updateHeroForTheme._heroDark;
  var heroLight = updateHeroForTheme._heroLight;

  if (heroDark === undefined || heroLight === undefined) {
    heroDark = updateHeroForTheme._heroDark =
      document.querySelector(".hero-dark");
    heroLight = updateHeroForTheme._heroLight =
      document.querySelector(".hero-light");
  }

  if (!heroDark && !heroLight) return;

  if (heroDark) heroDark.classList.toggle("hidden", !isDark);
  if (heroLight) heroLight.classList.toggle("hidden", isDark);
}

function updateGiscusTheme(userTheme) {
  var iframe = document.querySelector("iframe.giscus-frame");

  if (iframe) {
    iframe.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: userTheme,
          },
        },
      },
      "https://giscus.app",
    );
  }
}


function initMath() {
  if (typeof katex === "undefined") {
    return;
  }

  var mathElements = document.querySelectorAll(".katex-inline");
  mathElements.forEach(function (element) {
    var formula = element.textContent;
    try {
      katex.render(formula, element, {
        throwOnError: false,
        displayMode: false,
      });
    } catch (e) {
      console.error("KaTeX rendering error:", e);
    }
  });

  var blockMathElements = document.querySelectorAll(".katex-block");
  blockMathElements.forEach(function (element) {
    var formula = element.textContent;
    try {
      katex.render(formula, element, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      console.error("KaTeX rendering error:", e);
    }
  });
}

/* --- sidebar-toggle.js --- */
(function () {
  "use strict";

  const SIDEBAR_COOKIE_NAME = "sidebar_collapsed";
  const APPS_COOKIE_NAME = "apps_collapsed";
  const COOKIE_MAX_AGE = 31536000; // 1 year

  function getSidebarCookie() {
    var m = document.cookie.match(/(?:^|; )sidebar_collapsed=([^;]*)/);
    return m ? m[1] === "true" : false;
  }

  function setSidebarCookie(collapsed) {
    var d =
      location.hostname !== "localhost" && location.hostname !== "127.0.0.1"
        ? "; domain=." + location.hostname.split(".").slice(-2).join(".")
        : "";
    document.cookie =
      SIDEBAR_COOKIE_NAME +
      "=" +
      collapsed +
      "; path=/" +
      d +
      "; max-age=" +
      COOKIE_MAX_AGE +
      "; SameSite=Lax";
  }

  function getBoolCookie(name) {
    var re = new RegExp("(?:^|; )" + name + "=([^;]*)");
    var m = document.cookie.match(re);
    return m ? m[1] === "true" : false;
  }

  function setBoolCookie(name, value) {
    var d =
      location.hostname !== "localhost" && location.hostname !== "127.0.0.1"
        ? "; domain=." + location.hostname.split(".").slice(-2).join(".")
        : "";
    document.cookie =
      name +
      "=" +
      value +
      "; path=/" +
      d +
      "; max-age=" +
      COOKIE_MAX_AGE +
      "; SameSite=Lax";
  }

  function updateToggleButton(collapsed) {
    var toggleBtn = document.getElementById("sidebar-toggle");
    if (!toggleBtn) return;
    
    var iconCollapsed = toggleBtn.querySelector(".sidebar-toggle-icon-collapsed");
    var iconExpanded = toggleBtn.querySelector(".sidebar-toggle-icon-expanded");
    
    if (iconCollapsed && iconExpanded) {
      if (collapsed) {
        iconCollapsed.classList.remove("hidden");
        iconExpanded.classList.add("hidden");
      } else {
        iconCollapsed.classList.add("hidden");
        iconExpanded.classList.remove("hidden");
      }
    }

    toggleBtn.classList.toggle("sidebar-toggle--collapsed", collapsed);
  }

  function applySidebarState(collapsed) {
    var drawer = document.querySelector(".drawer");
    var sidebar = document.getElementById("sidebar");

    if (!drawer || !sidebar) return;

    // CSS handles all positioning and animations now
    drawer.classList.toggle("sidebar-collapsed", collapsed);
    
    updateToggleButton(collapsed);
  }

  function toggleSidebar() {
    var drawer = document.querySelector(".drawer");
    if (!drawer) return;

    var isCurrentlyCollapsed = drawer.classList.contains("sidebar-collapsed");
    var newCollapsedState = !isCurrentlyCollapsed;
    
    setSidebarCookie(newCollapsedState);
    applySidebarState(newCollapsedState);
  }

  function initSidebarToggle() {
    var toggleBtn = document.getElementById("sidebar-toggle");
    if (!toggleBtn) return;

    var collapsed = getSidebarCookie();
    if (collapsed) {
      applySidebarState(true);
    } else {
      applySidebarState(false);
    }

    toggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });
  }


  function initAppsGridCollapse() {
    var details = document.querySelector("details[data-apps-grid-sidebar]");
    if (!details) return;

    var collapsed = getBoolCookie(APPS_COOKIE_NAME);
    details.open = !collapsed;

    details.addEventListener("toggle", function () {
      setBoolCookie(APPS_COOKIE_NAME, !details.open);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initSidebarToggle();
      initAppsGridCollapse();
    });
  } else {
    initSidebarToggle();
    initAppsGridCollapse();
  }
})();

document.addEventListener("DOMContentLoaded", function () {
  initSearch();
  initThemeListeners();
  initMath();

  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      const searchModal = document.getElementById("search-modal");
      if (searchModal) {
        searchModal.checked = !searchModal.checked;
        searchModal.dispatchEvent(new Event("change"));
      }
    }
  });
});


