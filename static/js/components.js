/**
 * dhanur.me — Plug-and-play design system shell.
 *
 * Include this single script and it automatically:
 *   1. Injects the required CSS (main.css + font-awesome.min.css)
 *   2. Fetches the full layout shell (navbar + sidebar drawer) from /navbar/
 *   3. Wraps your page content inside the DaisyUI drawer
 *   4. Handles theme (dark/light), brightness, logo switching, cookie sync
 *   5. Positions the apps-grid dropdown centered under its button
 *   6. Optionally overrides favicon, logo, badge, and chrome visibility
 *
 * Simplest usage (just the script tag):
 *   <script src="https://dhanur.me/js/components.js" defer></script>
 *
 * Full configuration:
 *   <script>
 *     window.SiteNavConfig = {
 *       // Layout
 *       mode: "full",                // "full" (drawer + sidebar) or "navbar" (top bar only)
 *
 *       // Navigation
 *       nav: [
 *         { name: "Home", url: "/", icon: "fa-solid fa-house" },
 *         { name: "Docs", url: "/docs/", icon: "fa-solid fa-book" },
 *         { name: "Links", type: "dropdown", icon: "fa-solid fa-link", members: [
 *           { name: "GitHub", url: "https://github.com/…", icon: "fa-brands fa-github" }
 *         ]}
 *       ],
 *       sidebarNav: [ … ],          // sidebar items (falls back to nav)
 *       activePath: "/docs/",        // highlight active sidebar item
 *
 *       // Branding
 *       logo: {
 *         href: "/",                 // where logo links to
 *         html: "<img src='…' class='h-8'>"  // raw HTML for logo content
 *       },
 *       favicon: "/path/to/icon.png",  // override favicon
 *       badge: {
 *         text: "BETA",
 *         class: "badge-warning"     // any DaisyUI badge class
 *       },
 *
 *       // Chrome visibility
 *       showSearch: false,           // default: false (subdomains can't use search)
 *       showAppsGrid: true,          // default: true
 *       showThemeToggle: true        // default: true
 *     };
 *   </script>
 *   <script src="https://dhanur.me/js/components.js" defer></script>
 *
 * Script tag attributes:
 *   data-base-url   — Override base URL (default: auto-detect)
 *   data-no-css     — Skip auto-injecting CSS
 */
(function () {
  "use strict";

  // =========================================================================
  // Constants
  // =========================================================================
  var THEME_MAP = { dark: "night", light: "lofi" };
  var MAIN_SITE = "https://dhanur.me";

  // =========================================================================
  // Script element + config
  // =========================================================================
  var SCRIPT_EL =
    document.currentScript ||
    document.querySelector('script[src*="components.js"]');

  var SCRIPT_CFG = {
    baseUrl: SCRIPT_EL ? SCRIPT_EL.getAttribute("data-base-url") : null,
    noCss: SCRIPT_EL ? SCRIPT_EL.hasAttribute("data-no-css") : false,
  };

  // =========================================================================
  // SiteNavConfig (set by consumer before this script loads)
  // =========================================================================
  var NAV_CFG = window.SiteNavConfig || {};
  var NAV_MODE = NAV_CFG.mode || "full";
  var NAV_ITEMS = NAV_CFG.nav || null;
  var SIDEBAR_NAV = NAV_CFG.sidebarNav || null;
  var ACTIVE_PATH = NAV_CFG.activePath || location.pathname;
  var SHOW_SEARCH = NAV_CFG.showSearch === true; // default false
  var SHOW_APPS = NAV_CFG.showAppsGrid !== false; // default true
  var SHOW_THEME = NAV_CFG.showThemeToggle !== false; // default true
  var LOGO_CFG = NAV_CFG.logo || null;
  var FAVICON_CFG = NAV_CFG.favicon || null;
  var BADGE_CFG = NAV_CFG.badge || null;

  // =========================================================================
  // Base URL resolution
  // =========================================================================
  function resolveBase(override) {
    if (override) return override.replace(/\/+$/, "");
    var h = location.hostname;
    if (h === "dhanur.me" || h.endsWith(".dhanur.me")) return MAIN_SITE;
    return location.origin;
  }

  var BASE = resolveBase(SCRIPT_CFG.baseUrl);
  var SAME_ORIGIN = location.origin === BASE;

  // =========================================================================
  // Cookie helpers
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

  // =========================================================================
  // FOUC prevention — apply theme class immediately
  // =========================================================================
  (function () {
    var theme = getCookie() || "dark";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    }
  })();

  // =========================================================================
  // CSS auto-injection
  // =========================================================================
  function injectCSS() {
    if (SCRIPT_CFG.noCss) return;
    var cssBase = SAME_ORIGIN ? "" : BASE;
    var hasMain = false;
    var hasFA = false;
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      if (href.indexOf("main.css") !== -1) hasMain = true;
      if (href.indexOf("font-awesome") !== -1) hasFA = true;
    }

    // --- Font preloads (always crossorigin per spec) ---
    var preloads = [
      { href: cssBase + "/webfonts/fa-solid-900.woff2", type: "font/woff2" },
      { href: cssBase + "/webfonts/fa-brands-400.woff2", type: "font/woff2" },
      { href: cssBase + "/fonts/Pretendard-Regular.woff", type: "font/woff" },
    ];
    preloads.forEach(function (p) {
      var pl = document.createElement("link");
      pl.rel = "preload";
      pl.as = "font";
      pl.type = p.type;
      pl.href = p.href;
      pl.crossOrigin = "anonymous";
      document.head.appendChild(pl);
    });

    // --- main.css ---
    if (!hasMain) {
      var mainLink = document.createElement("link");
      mainLink.rel = "stylesheet";
      mainLink.href = cssBase + "/css/main.css";
      if (!SAME_ORIGIN) mainLink.crossOrigin = "anonymous";
      document.head.appendChild(mainLink);
    }

    // --- Font Awesome CSS (async load via media="print" trick) ---
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
      // noscript fallback (won't fire in JS-only env but good practice)
      var ns = document.createElement("noscript");
      var nsFa = document.createElement("link");
      nsFa.rel = "stylesheet";
      nsFa.href = cssBase + "/css/font-awesome.min.css";
      ns.appendChild(nsFa);
      document.head.appendChild(ns);
    }

    // --- @font-face overrides: font-display: swap for FA + Pretendard ---
    var fontStyle = document.createElement("style");
    fontStyle.textContent =
      "@font-face{font-family:\"Font Awesome 6 Brands\";font-style:normal;font-weight:400;font-display:swap;" +
      "src:url(" + cssBase + "/webfonts/fa-brands-400.woff2) format(\"woff2\")," +
      "url(" + cssBase + "/webfonts/fa-brands-400.ttf) format(\"truetype\")}" +
      "@font-face{font-family:\"Font Awesome 6 Free\";font-style:normal;font-weight:400;font-display:swap;" +
      "src:url(" + cssBase + "/webfonts/fa-regular-400.woff2) format(\"woff2\")," +
      "url(" + cssBase + "/webfonts/fa-regular-400.ttf) format(\"truetype\")}" +
      "@font-face{font-family:\"Font Awesome 6 Free\";font-style:normal;font-weight:900;font-display:swap;" +
      "src:url(" + cssBase + "/webfonts/fa-solid-900.woff2) format(\"woff2\")," +
      "url(" + cssBase + "/webfonts/fa-solid-900.ttf) format(\"truetype\")}" +
      "@font-face{font-family:\"Pretendard-Regular\";" +
      "src:url('" + cssBase + "/fonts/Pretendard-Regular.woff') format(\"woff\");" +
      "font-weight:400;font-style:normal;font-display:swap}" +
      "body{font-family:\"Pretendard-Regular\",sans-serif}";
    document.head.appendChild(fontStyle);
  }

  injectCSS();

  // =========================================================================
  // URL rewriting helpers
  // =========================================================================
  function rewriteUrls(el) {
    if (SAME_ORIGIN) return;
    el.querySelectorAll('a[href^="/"]').forEach(function (a) {
      if (a.closest("[data-config-nav]")) return;
      a.href = BASE + a.getAttribute("href");
    });
    el.querySelectorAll('img[src^="/"]').forEach(function (img) {
      img.src = BASE + img.getAttribute("src");
    });
    el.querySelectorAll("source[srcset]").forEach(function (source) {
      var srcset = source.getAttribute("srcset");
      if (srcset && srcset.charAt(0) === "/") {
        source.setAttribute(
          "srcset",
          srcset.replace(/(^|\s)\//g, "$1" + BASE + "/"),
        );
      }
    });
  }

  function fixLogoLink(el) {
    if (LOGO_CFG && LOGO_CFG.href) return; // user will override
    var logoA = el.querySelector(".flex-1 > a.btn");
    if (logoA) logoA.href = MAIN_SITE + "/";
  }

  // =========================================================================
  // Nav replacement: Header
  // =========================================================================
  function isChromeLi(li) {
    return li.hasAttribute("data-nav-chrome");
  }

  function buildHeaderNavItem(item) {
    var li = document.createElement("li");
    li.setAttribute("data-config-nav", "");

    if (item.type === "dropdown" && item.members) {
      li.className = "dropdown dropdown-end";
      var btn = document.createElement("div");
      btn.setAttribute("tabindex", "0");
      btn.setAttribute("role", "button");
      btn.className = "btn btn-ghost";
      if (item.icon) {
        var ic = document.createElement("i");
        ic.className = item.icon;
        btn.appendChild(ic);
        btn.appendChild(document.createTextNode(" "));
      }
      btn.appendChild(document.createTextNode(item.name + " "));
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "inline w-4 h-4 ml-1");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("viewBox", "0 0 24 24");
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("d", "M19 9l-7 7-7-7");
      svg.appendChild(path);
      btn.appendChild(svg);
      li.appendChild(btn);

      var dropUl = document.createElement("ul");
      dropUl.setAttribute("tabindex", "0");
      dropUl.className =
        "dropdown-content menu bg-base-100 border border-gray-500/15 rounded-box z-1 p-2 shadow-sm";
      item.members.forEach(function (m) {
        var mLi = document.createElement("li");
        var mA = document.createElement("a");
        mA.className = "btn btn-ghost hover:no-underline";
        mA.href = m.url;
        if (m.icon) {
          var mIc = document.createElement("i");
          mIc.className = m.icon;
          mA.appendChild(mIc);
          mA.appendChild(document.createTextNode(" "));
        }
        mA.appendChild(document.createTextNode(m.name));
        mLi.appendChild(mA);
        dropUl.appendChild(mLi);
      });
      li.appendChild(dropUl);
    } else {
      var a = document.createElement("a");
      a.className = "btn btn-ghost hover:no-underline";
      a.href = item.url;
      if (item.icon) {
        var ic2 = document.createElement("i");
        ic2.className = item.icon;
        a.appendChild(ic2);
        a.appendChild(document.createTextNode(" "));
      }
      a.appendChild(document.createTextNode(item.name));
      li.appendChild(a);
    }

    return li;
  }

  function replaceHeaderNav(container, items) {
    if (!items) return;
    var headerUl = container.querySelector(".menu.menu-horizontal");
    if (!headerUl) return;

    var children = Array.prototype.slice.call(headerUl.children);
    var chromeItems = [];

    children.forEach(function (li) {
      if (isChromeLi(li)) {
        chromeItems.push(li);
      } else {
        li.remove();
      }
    });

    var insertBefore = chromeItems.length > 0 ? chromeItems[0] : null;
    items.forEach(function (item) {
      var li = buildHeaderNavItem(item);
      if (insertBefore) {
        headerUl.insertBefore(li, insertBefore);
      } else {
        headerUl.appendChild(li);
      }
    });
  }

  // =========================================================================
  // Nav replacement: Sidebar
  // =========================================================================
  function normSlash(p) {
    return (p || "").replace(/\/$/, "") || "/";
  }

  function buildSidebarNavItem(item, activePath) {
    var li = document.createElement("li");
    li.setAttribute("data-config-nav", "");
    var isActive = normSlash(activePath) === normSlash(item.url);
    var isAncestor =
      item.url !== "/" && activePath.indexOf(item.url) === 0;

    if (item.children && item.children.length > 0) {
      var details = document.createElement("details");
      if (isActive || isAncestor) details.open = true;

      var summary = document.createElement("summary");
      if (item.icon) {
        var ic = document.createElement("i");
        ic.className = item.icon;
        summary.appendChild(ic);
        summary.appendChild(document.createTextNode(" "));
      }
      summary.appendChild(document.createTextNode(item.name));
      if (isActive) summary.className = "rounded bg-gray-500/15";
      details.appendChild(summary);

      var childUl = document.createElement("ul");

      var selfLi = document.createElement("li");
      if (isActive) selfLi.className = "rounded bg-gray-500/15";
      var selfA = document.createElement("a");
      selfA.className = "hover:no-underline";
      selfA.href = item.url;
      selfA.textContent = item.name;
      selfLi.appendChild(selfA);
      childUl.appendChild(selfLi);

      item.children.forEach(function (child) {
        childUl.appendChild(buildSidebarNavItem(child, activePath));
      });

      details.appendChild(childUl);
      li.appendChild(details);
    } else {
      if (isActive) li.className = "rounded bg-gray-500/15";
      var a = document.createElement("a");
      a.className = "hover:no-underline";
      a.href = item.url;
      if (item.icon) {
        var ic2 = document.createElement("i");
        ic2.className = item.icon;
        a.appendChild(ic2);
        a.appendChild(document.createTextNode(" "));
      }
      a.appendChild(document.createTextNode(item.name));
      li.appendChild(a);
    }

    return li;
  }

  function replaceSidebarNav(container, items) {
    if (!items) return;
    var sidebarUl = container.querySelector("[data-sidebar-nav]");
    if (!sidebarUl) return;

    sidebarUl.innerHTML = "";
    items.forEach(function (item) {
      sidebarUl.appendChild(buildSidebarNavItem(item, ACTIVE_PATH));
    });
  }

  // =========================================================================
  // Theme wiring
  // =========================================================================
  function wireTheme(root, drawerEl) {
    var src = drawerEl || root;
    var current = getCookie() || src.dataset.defaultColorset || "dark";
    var darkBrightness = src.dataset.darkBrightness || "normal";
    var lightBrightness = src.dataset.lightBrightness || "normal";

    function applyTheme(theme) {
      var daisyTheme = THEME_MAP[theme] || theme;
      var brightness = theme === "dark" ? darkBrightness : lightBrightness;
      document.documentElement.setAttribute("data-theme", daisyTheme);
      document.documentElement.setAttribute("data-brightness", brightness);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    }

    applyTheme(current);

    // Logo switching
    var logoDark = root.querySelector(".logo-dark");
    var logoLight = root.querySelector(".logo-light");

    function updateLogos(theme) {
      var isDark = theme === "dark";
      if (logoDark) logoDark.classList.toggle("invisible", !isDark);
      if (logoLight) logoLight.classList.toggle("invisible", isDark);
    }
    updateLogos(current);

    // Wire ALL theme toggles
    var ctrls = root.querySelectorAll(".theme-controller");
    ctrls.forEach(function (ctrl) {
      ctrl.checked = current === "dark";
      ctrl.addEventListener("change", function (e) {
        var theme = e.target.checked ? "dark" : "light";
        setCookie(theme);
        applyTheme(theme);
        updateLogos(theme);
        ctrls.forEach(function (other) {
          if (other !== e.target) other.checked = e.target.checked;
        });
      });
    });
  }

  // =========================================================================
  // Apps dropdown positioning — center under button, clamp to viewport
  // =========================================================================
  function initAppsDropdown(root) {
    var wrapper = root.querySelector('[data-nav-chrome="apps"] .dropdown');
    if (!wrapper) return;
    var content = wrapper.querySelector(".dropdown-content");
    if (!content) return;

    function position() {
      var rect = wrapper.getBoundingClientRect();
      var w = content.offsetWidth || 224;
      var idealLeft = (rect.width - w) / 2;
      var rightOverflow =
        rect.left + idealLeft + w - (window.innerWidth - 8);
      if (rightOverflow > 0) idealLeft -= rightOverflow;
      if (rect.left + idealLeft < 8) idealLeft = 8 - rect.left;
      content.style.left = idealLeft + "px";
      content.style.right = "auto";
    }

    wrapper.addEventListener("focusin", position);
    wrapper.addEventListener("mouseenter", position);
  }

  // =========================================================================
  // Favicon override
  // =========================================================================
  function applyFavicon(faviconPath) {
    if (!faviconPath) return;
    var existing = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
    );
    existing.forEach(function (el) {
      el.remove();
    });
    var link = document.createElement("link");
    link.rel = "icon";
    link.href = faviconPath;
    document.head.appendChild(link);
  }

  // =========================================================================
  // Logo override
  // =========================================================================
  function applyLogo(logoConfig, container) {
    if (!logoConfig) return;
    var logoA = container.querySelector(".flex-1 > a.btn");
    if (!logoA) return;
    if (logoConfig.href !== undefined) logoA.href = logoConfig.href;
    if (logoConfig.html) logoA.innerHTML = logoConfig.html;
  }

  // =========================================================================
  // Badge
  // =========================================================================
  function applyBadge(badgeConfig, container) {
    if (!badgeConfig || !badgeConfig.text) return;
    var navbar = container.querySelector(".navbar");
    if (!navbar) return;
    var badge = document.createElement("div");
    badge.className =
      "badge " + (badgeConfig.class || "badge-neutral") + " badge-sm ml-2";
    badge.textContent = badgeConfig.text;
    var logoDiv = navbar.querySelector(".flex-1");
    if (logoDiv) logoDiv.appendChild(badge);
  }

  // =========================================================================
  // Chrome visibility — show/hide search, apps grid, theme toggle
  // =========================================================================
  function applyChrome(container) {
    // Search — hidden by default for subdomains
    if (!SHOW_SEARCH) {
      var searchDiv = container.querySelector(".drawer-side .px-2.pt-4.pb-0");
      if (searchDiv) searchDiv.style.display = "none";
      var searchModal = document.querySelector("#search-modal");
      if (searchModal) searchModal.style.display = "none";
      // Also hide the search modal label overlay
      var searchOverlay = document.querySelector(
        '.modal-toggle#search-modal + .modal',
      );
      if (searchOverlay) searchOverlay.style.display = "none";
    }
    // Apps grid
    if (!SHOW_APPS) {
      var appsLi = container.querySelector('[data-nav-chrome="apps"]');
      if (appsLi) appsLi.style.display = "none";
      var appsSidebar = container.querySelector("[data-apps-grid-sidebar]");
      if (appsSidebar) appsSidebar.style.display = "none";
    }
    // Theme toggle
    if (!SHOW_THEME) {
      var themeLi = container.querySelector('[data-nav-chrome="theme"]');
      if (themeLi) themeLi.style.display = "none";
      var themeSidebar = container.querySelector(
        ".drawer-side .swap.swap-rotate",
      );
      if (themeSidebar) {
        var themeDiv = themeSidebar.closest(".px-4.py-3");
        if (themeDiv) themeDiv.style.display = "none";
      }
    }
  }

  // =========================================================================
  // Post-injection setup — called after shell is in the DOM
  // =========================================================================
  function postInject(container, drawerEl) {
    // Wire theme first (sets data-theme + data-brightness immediately)
    wireTheme(container, drawerEl);

    // Apply chrome visibility
    applyChrome(container);

    // Override branding
    applyLogo(LOGO_CFG, container);
    applyFavicon(FAVICON_CFG);
    applyBadge(BADGE_CFG, container);

    // Position apps dropdown
    if (SHOW_APPS) {
      initAppsDropdown(container);
    }
  }

  // =========================================================================
  // Fetch helper
  // =========================================================================
  function fetchNavbar() {
    var navUrl = SAME_ORIGIN ? "/navbar/" : BASE + "/navbar/";
    var fetchOpts = SAME_ORIGIN ? {} : { mode: "cors" };
    return fetch(navUrl, fetchOpts).then(function (r) {
      return r.text();
    });
  }

  // =========================================================================
  // Mode: Full drawer (default)
  // =========================================================================
  function initFullMode(contentNodes, container) {
    fetchNavbar()
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var drawer = doc.querySelector(".drawer");
        if (!drawer) {
          console.warn("[components.js] no .drawer in /navbar/ response");
          contentNodes.forEach(function (n) {
            container.appendChild(n);
          });
          return;
        }

        // Replace nav items from config
        if (NAV_ITEMS) {
          replaceHeaderNav(drawer, NAV_ITEMS);
          replaceSidebarNav(drawer, SIDEBAR_NAV || NAV_ITEMS);
        }

        // Move content into slot
        var slot = drawer.querySelector(".site-nav-slot");
        if (slot) {
          contentNodes.forEach(function (node) {
            slot.appendChild(node);
          });
        }

        // Logo always links to main site (unless overridden)
        fixLogoLink(drawer);

        // Rewrite URLs for cross-origin
        rewriteUrls(drawer);

        // Inject
        container.innerHTML = "";
        container.appendChild(drawer);

        // Run all post-injection setup
        postInject(container, drawer);
      })
      .catch(function (err) {
        console.warn("[components.js] fetch failed:", err);
        contentNodes.forEach(function (n) {
          container.appendChild(n);
        });
      });
  }

  // =========================================================================
  // Mode: Navbar only (for SPAs)
  // =========================================================================
  function initNavbarMode() {
    fetchNavbar()
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var drawer = doc.querySelector(".drawer");
        var navbar = doc.querySelector(".navbar");
        if (!navbar) {
          console.warn("[components.js] no .navbar in /navbar/ response");
          return;
        }

        // Hide hamburger (no sidebar to open)
        var hamburger = navbar.querySelector(".flex-none.lg\\:hidden");
        if (hamburger) hamburger.style.display = "none";

        // Replace nav items from config
        if (NAV_ITEMS) {
          replaceHeaderNav(navbar, NAV_ITEMS);
        }

        // Logo always links to main site (unless overridden)
        fixLogoLink(navbar);

        // Rewrite URLs for cross-origin
        rewriteUrls(navbar);

        // Insert as first child of body
        document.body.insertBefore(navbar, document.body.firstChild);

        // Pad body for fixed navbar
        document.body.style.paddingTop = "4rem";

        // Run all post-injection setup
        postInject(document.body, drawer);
      })
      .catch(function (err) {
        console.warn("[components.js] fetch failed:", err);
      });
  }

  // =========================================================================
  // Auto-inject: wraps all body children
  // =========================================================================
  function autoInject() {
    var children = [];
    while (document.body.firstChild) {
      children.push(document.body.removeChild(document.body.firstChild));
    }
    initFullMode(children, document.body);
  }

  // =========================================================================
  // Custom element: <site-nav> (backwards compat)
  // =========================================================================
  class SiteNav extends HTMLElement {
    connectedCallback() {
      if (NAV_MODE === "navbar") {
        initNavbarMode();
      } else {
        var children = Array.prototype.slice.call(this.childNodes);
        initFullMode(children, this);
      }
    }
  }

  if (!customElements.get("site-nav")) {
    customElements.define("site-nav", SiteNav);
  }

  // =========================================================================
  // Bootstrap
  // =========================================================================
  var _injected = false;

  function bootstrap() {
    if (_injected) return;
    _injected = true;

    // If <site-nav> exists, custom element handles it
    if (document.querySelector("site-nav")) return;

    if (NAV_MODE === "navbar") {
      initNavbarMode();
    } else {
      autoInject();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
