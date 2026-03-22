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
    { name: "Tasks", url: "https://tasks.dhanur.me", icon: "fa-solid fa-list-check" },
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
    document.currentScript ||
    document.querySelector('script[src*="shell.js"]');

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
      imageOnly: userLogo.darkImage !== undefined || userLogo.lightImage !== undefined || !CFG.logo,
    };
  })();

  // =========================================================================
  // 3. Base URL resolution
  // =========================================================================
  var SCRIPT_ORIGIN = SCRIPT_EL && SCRIPT_EL.src ? new URL(SCRIPT_EL.src).origin : MAIN_SITE;
  var BASE = (SCRIPT_ATTR.baseUrl || SCRIPT_ORIGIN).replace(/\/+$/, "");
  var SAME_ORIGIN = location.origin === BASE;

  // =========================================================================
  // 4. Utility: debounce
  // =========================================================================
  function debounce(fn, ms) {
    var t;
    return function () {
      var self = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
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
    if (window.__setThemeCookie) { window.__setThemeCookie(val); return; }
    var d = COOKIE_DOMAIN ? "; domain=" + COOKIE_DOMAIN : "";
    document.cookie = "theme=" + val + "; path=/" + d + "; max-age=31536000; SameSite=Lax";
  }

  // Resolve "auto" to "dark" or "light" based on OS preference
  function resolveColorset(val) {
    if (window.__resolveColorset) return window.__resolveColorset(val);
    if (val === "auto") {
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
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
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
  })();

  // =========================================================================
  // 7. CSS injection
  // =========================================================================
  function injectCSS() {
    if (NO_CSS) return;
    var cssBase = SAME_ORIGIN ? "" : BASE;

    var hasMain = false, hasFA = false;
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
      pl.rel = "preload"; pl.as = "font"; pl.type = p.type;
      pl.href = p.href; pl.crossOrigin = "anonymous";
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
      faLink.onload = function () { this.media = "all"; };
      if (!SAME_ORIGIN) faLink.crossOrigin = "anonymous";
      document.head.appendChild(faLink);
      var ns = document.createElement("noscript");
      var nsFa = document.createElement("link");
      nsFa.rel = "stylesheet"; nsFa.href = cssBase + "/css/font-awesome.min.css";
      ns.appendChild(nsFa); document.head.appendChild(ns);
    }

    var fontStyle = document.createElement("style");
    fontStyle.textContent =
      '@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap;' +
        "src:url(" + cssBase + '/webfonts/fa-brands-400.woff2) format("woff2"),' +
        "url(" + cssBase + '/webfonts/fa-brands-400.ttf) format("truetype")}' +
      '@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:swap;' +
        "src:url(" + cssBase + '/webfonts/fa-regular-400.woff2) format("woff2"),' +
        "url(" + cssBase + '/webfonts/fa-regular-400.ttf) format("truetype")}' +
      '@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap;' +
        "src:url(" + cssBase + '/webfonts/fa-solid-900.woff2) format("woff2"),' +
        "url(" + cssBase + '/webfonts/fa-solid-900.ttf) format("truetype")}' +
      '@font-face{font-family:"Pretendard-Regular";' +
        "src:url('" + cssBase + '/fonts/Pretendard-Regular.woff\') format("woff");' +
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
    var iconBase = (typeof FAVICON_CFG === "string")
      ? FAVICON_CFG.replace(/\/+$/, "") + "/"
      : BASE + "/icons/";

    document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="manifest"]'
    ).forEach(function (el) { el.remove(); });

    [
      { rel: "icon", type: "image/png", sizes: "96x96", href: iconBase + "favicon-96x96.png" },
      { rel: "icon", type: "image/svg+xml", href: iconBase + "favicon.svg" },
      { rel: "shortcut icon", href: iconBase + "favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: iconBase + "apple-touch-icon.png" },
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
  var _mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  // Mode cycling order (kept for validation)
  var MODE_CYCLE = ["auto", "light", "dark"];

  // Active segment style classes
  var ACTIVE_CLASS = "bg-base-content/25 shadow-sm opacity-100 ring-1 ring-base-content/10";
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
    if (_logoDark) _logoDark.classList.toggle("invisible", resolvedTheme !== "dark");
    if (_logoLight) _logoLight.classList.toggle("invisible", resolvedTheme !== "light");
  }

  function updateToggleUI() {
    // Find all switcher containers (desktop + mobile)
    var switchers = document.querySelectorAll(".theme-switcher");
    switchers.forEach(function (sw) {
      var btns = sw.querySelectorAll("[data-theme-mode]");
      btns.forEach(function (btn) {
        var mode = btn.getAttribute("data-theme-mode");
        // Remove all dynamic classes first
        ACTIVE_CLASS.split(" ").forEach(function (c) { btn.classList.remove(c); });
        INACTIVE_CLASS.split(" ").forEach(function (c) { btn.classList.remove(c); });
        // Apply correct state
        if (mode === _currentMode) {
          ACTIVE_CLASS.split(" ").forEach(function (c) { btn.classList.add(c); });
        } else {
          INACTIVE_CLASS.split(" ").forEach(function (c) { btn.classList.add(c); });
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
    document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolved }));
  }

  function wireTheme() {
    _currentMode = getCookie() || "auto";
    // Ensure valid mode
    if (MODE_CYCLE.indexOf(_currentMode) === -1) _currentMode = "auto";

    var resolved = resolveColorset(_currentMode);
    applyTheme(resolved);
    updateToggleUI();
    document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolved }));

    // Wire click handlers on all segment buttons
    var allBtns = document.querySelectorAll(".theme-switcher [data-theme-mode]");
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
          document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolved }));
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

        var panel = dd.querySelector(".dropdown-panel");
        if (panel) {
          panel.style.opacity = "0";
          panel.style.transform = "";
          panel.style.pointerEvents = "none";
          setTimeout(function () {
            if (!dd.hasAttribute("data-open")) panel.style.visibility = "hidden";
          }, 150);
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
      if (panel) {
        positionPanel(dd);
        panel.style.visibility = "visible";
        panel.style.pointerEvents = "auto";
        void panel.offsetHeight;
        panel.style.opacity = "1";
        panel.style.transform = "translateY(0) scale(1)";
      }
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
        panel.addEventListener("click", function (e) { e.stopPropagation(); });
      }
    });

    document.addEventListener("click", function () { if (openDropdown) closeAll(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openDropdown) closeAll(); });
    window.addEventListener("resize", debounce(function () { if (openDropdown) positionPanel(openDropdown); }, 100));
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

  function normSlash(p) { return (p || "").replace(/\/$/, "") || "/"; }

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

      var dropUl = el("ul", "dropdown-content menu bg-base-100 border border-gray-500/15 rounded-box z-1 p-2 shadow-sm");
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
        items.forEach(function(li) {
          if (!li.hasAttribute("data-nav-chrome")) {
            headerNavUl.removeChild(li);
          } else if (!insertBeforeNode) {
            insertBeforeNode = li;
          }
        });
        
        // Insert custom nav items
        CFG.nav.forEach(function(item) {
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
        sidebarNavItems.forEach(function(item) {
          if (item.type === "dropdown" && item.members) {
             item.members.forEach(function(m) {
               sidebarUl.appendChild(buildSidebarNavItem(m));
             });
          } else if (item.children) {
             sidebarUl.appendChild(buildSidebarNavItem(item));
             item.children.forEach(function(c) {
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
    drawer.querySelectorAll("#sidebar [data-sidebar-nav] a").forEach(function(a) {
      try {
        if (normSlash(new URL(a.href, location.origin).pathname) === activePath) {
          a.parentElement.className = "rounded bg-gray-500/15 font-medium";
        }
      } catch (e) {}
    });

    // Handle Chrome Visibility Overrides
    if (CFG.showSearch === false) {
      var searchEl = drawer.querySelector('.input[aria-label="Search"]');
      if (searchEl) {
        var searchContainer = searchEl.closest('div.px-2.pt-4');
        if (searchContainer) searchContainer.style.display = 'none';
      }
    }
    if (CFG.showAppsGrid === false) {
      var appsEl = drawer.querySelector('[data-nav-chrome="apps"]');
      if (appsEl) appsEl.style.display = 'none';
      var appsSidebarEl = drawer.querySelector('[data-apps-grid-sidebar]');
      if (appsSidebarEl) appsSidebarEl.style.display = 'none';
    }
    if (CFG.showThemeToggle === false) {
      var themeEl = drawer.querySelector('[data-nav-chrome="theme"]');
      if (themeEl) themeEl.style.display = 'none';
      var themeSidebarEl = drawer.querySelector('#theme-toggle-mobile');
      if (themeSidebarEl) themeSidebarEl.style.display = 'none';
    }
    if (CFG.showAccount === false) {
      var accountEl = drawer.querySelector('[data-nav-chrome="account"]');
      if (accountEl) accountEl.style.display = 'none';
      var accountSidebarEl = drawer.querySelector('[data-sidebar-account]');
      if (accountSidebarEl) accountSidebarEl.style.display = 'none';
    }

    // Apply logo badge if requested
    if (BADGE_CFG && BADGE_CFG.text) {
      var logoLink = drawer.querySelector(".navbar .btn-ghost.logo-gradient");
      if (logoLink) {
        var badge = el("div", "badge " + (BADGE_CFG.class || "badge-neutral") + " badge-sm ml-2");
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
    if (window.AUTH) { callback(); return; }
    var existing = document.querySelector('script[src*="auth-client.js"]');
    if (existing) {
      // Script tag exists but AUTH may not be ready yet
      document.addEventListener("authReady", function () { callback(); }, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://auth.dhanur.me/auth-client.js";
    script.defer = true;
    script.onload = function () {
      // AUTH.onReady will fire when status is fetched
      if (window.AUTH && typeof AUTH.onReady === "function") {
        AUTH.onReady(function () { callback(); });
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
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return "resets " + months[d.getUTCMonth()] + " " + d.getUTCDate();
    } catch (e) { return ""; }
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
    var sidebarCreditsRow = drawer.querySelector('[data-auth="sidebar-credits-row"]');
    if (sidebarCreditsRow) {
      sidebarCreditsRow.classList.remove("hidden");
      var sBalanceEl = sidebarCreditsRow.querySelector('[data-auth="sidebar-credits-balance"]');
      var sResetEl = sidebarCreditsRow.querySelector('[data-auth="sidebar-credits-reset"]');
      if (sBalanceEl) sBalanceEl.textContent = balanceText;
      if (sResetEl) sResetEl.textContent = resetText;
    }
  }

  function hideCreditsUI(drawer) {
    var creditsRow = drawer.querySelector('[data-auth="credits-row"]');
    if (creditsRow) creditsRow.classList.add("hidden");
    var sidebarCreditsRow = drawer.querySelector('[data-auth="sidebar-credits-row"]');
    if (sidebarCreditsRow) sidebarCreditsRow.classList.add("hidden");
  }

  function initAuth(drawer) {
    if (!drawer || typeof AUTH === "undefined" || !window.AUTH) return;

    // Dynamically query DOM instead of relying on build refs
    var r = {
      navGuestAvatar: drawer.querySelector('.navbar [data-dropdown="account"] .bg-base-300'),
      navAuthedAvatar: drawer.querySelector('.navbar [data-dropdown="account"] .ring-primary'),
      navAvatarImg: drawer.querySelector('.navbar [data-dropdown="account"] .ring-primary img'),
      navAuthedHeader: drawer.querySelector('.navbar .dropdown-panel [data-auth="name"]')?.closest('.border-b'),
      navGuestHeader: drawer.querySelector('.navbar .dropdown-panel .fa-user')?.closest('.border-b'),
      navName: drawer.querySelector('.navbar [data-auth="name"]'),
      navEmail: drawer.querySelector('.navbar [data-auth="email"]'),
      navRole: drawer.querySelector('.navbar [data-auth="role"]'),
      navLoginItem: drawer.querySelector('.navbar [data-auth="login-item"]'),
      navAccountItem: drawer.querySelector('.navbar [data-auth="account-item"]'),
      navUpgradeItem: drawer.querySelector('.navbar [data-auth="upgrade-item"]'),
      navLogoutItem: drawer.querySelector('.navbar [data-auth="logout-item"]'),
      
      sidebarGuestAvatar: drawer.querySelector('#sidebar [data-sidebar-account] .bg-base-300'),
      sidebarAuthedAvatar: drawer.querySelector('#sidebar [data-sidebar-account] .ring-primary'),
      sidebarAvatarImg: drawer.querySelector('#sidebar [data-sidebar-account] .ring-primary img'),
      sidebarName: drawer.querySelector('#sidebar [data-sidebar-account] .font-semibold'),
      sidebarEmail: drawer.querySelector('#sidebar [data-sidebar-account] .text-xs.opacity-60'),
      sidebarLoginBtn: drawer.querySelector('#sidebar [data-auth="sidebar-login-btn"]'),
      sidebarLogoutBtn: drawer.querySelector('#sidebar [data-auth="sidebar-logout-btn"]'),
      sidebarAccountBtn: drawer.querySelector('#sidebar [data-auth="sidebar-account-btn"]')
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
        if (r.navAuthedHeader && r.navAuthedHeader.querySelector('img')) r.navAuthedHeader.querySelector('img').src = avatarUrl;
        if (r.navName) r.navName.textContent = userName;
        if (r.navEmail) r.navEmail.textContent = userEmail;
        if (r.navRole) {
          r.navRole.textContent = role.toUpperCase();
          r.navRole.className = role === "admin" ? "badge badge-sm badge-error" : "badge badge-sm badge-success";
          r.navRole.classList.remove("hidden");
        }
        if (r.navLoginItem) r.navLoginItem.classList.add("hidden");
        if (r.navAccountItem) r.navAccountItem.classList.remove("hidden");
        if (r.navLogoutItem) r.navLogoutItem.classList.remove("hidden");
        if (r.navUpgradeItem) r.navUpgradeItem.classList.toggle("hidden", role === "admin");

        if (r.sidebarGuestAvatar) r.sidebarGuestAvatar.classList.add("hidden");
        if (r.sidebarAuthedAvatar) r.sidebarAuthedAvatar.classList.remove("hidden");
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

        if (r.sidebarGuestAvatar) r.sidebarGuestAvatar.classList.remove("hidden");
        if (r.sidebarAuthedAvatar) r.sidebarAuthedAvatar.classList.add("hidden");
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
      AUTH.onReady(function (auth) { updateUI(auth.status || auth); });
    }
    document.addEventListener("authChanged", function (e) { updateUI(e.detail); });
    document.addEventListener("creditsChanged", function (e) { updateCreditsUI(drawer, e.detail); });

    drawer.querySelectorAll('[data-auth="login-btn"], [data-auth="sidebar-login-btn"]').forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        if (typeof AUTH.login === "function") { e.preventDefault(); AUTH.login(); }
      });
    });

    drawer.querySelectorAll('[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"]').forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof AUTH.logout === "function") {
          AUTH.logout().then(function () { window.location.reload(); });
        }
      });
    });

    drawer.querySelectorAll('[data-auth="upgrade-btn"]').forEach(function (btn) {
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
        .then(function(res) { 
          if (!res.ok) throw new Error("Failed to fetch navbar");
          return res.text(); 
        })
        .then(function(html) {
          // Parse HTML
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          var newDrawer = doc.querySelector(".drawer");
          if (!newDrawer) throw new Error("Drawer not found in fetched HTML");

          // Inject children into slot
          var slot = newDrawer.querySelector(".site-nav-slot");
          if (!slot) throw new Error("site-nav-slot missing in fetched navbar shell");
          
          children.forEach(function (node) { slot.appendChild(node); });
          
          document.body.appendChild(newDrawer);
          hydrate(newDrawer);
        })
        .catch(function(err) {
          console.error("Shell.js Error: ", err);
          // Fallback: put original content back if fetch fails
          children.forEach(function (node) { document.body.appendChild(node); });
        });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
