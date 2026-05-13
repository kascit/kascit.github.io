/**
 * Subdomain "Plug-and-play" Design Shell Export (ES Module)
 *
 * Fetches the navbar HTML from dhanur.me and wires it up
 * using the EXACT same ES modules that power the main site.
 *
 * Usage in external frontend (e.g., React, Vue, HTML):
 * <script type="module" src="https://dhanur.me/js/shell.js"></script>
 */

import { BASE_URL, getConfig } from "./config.js";
import { ensureDefaultPolicy } from "./trusted-types.js";
import { initResponsive } from "./responsive.js";
import { initTheme } from "./theme-engine.js";
import { initAuth } from "../system/auth-integration.js";
import { checkAccess, renderAccessWall } from "../system/access-guard.js";
import {
  fetchManifest,
  filterAppsByRole,
  getManifestSync,
} from "../system/manifest.js";
import { initDropdowns } from "../ui/dropdowns.js";
import { SHELL_CONFIG_DEFAULTS } from "./shell-config.js";

// Must run before any DOM injection sink is used (innerHTML, script.src, etc.)
ensureDefaultPolicy();

window.__componentsJS = true;
let _injected = false;

// Explicitly default all standard modules to True to prevent configuration-drop erasures
const DEFAULT_SHELL_CONFIG = {
  ...SHELL_CONFIG_DEFAULTS,
  noCss: false,
  showNavbar: true,
  showLanguage: true,
  showAppsGrid: true,
  showAccountButton: true,
  showThemeToggle: true,
  showMobileMenu: true,
  enablePwa: false,
  favicon: false,
};

function getShellRuntimeConfig() {
  const rawConfig = getConfig() || {};
  const nestedShell =
    rawConfig.shell && typeof rawConfig.shell === "object"
      ? rawConfig.shell
      : {};
  const merged = { ...DEFAULT_SHELL_CONFIG, ...rawConfig, ...nestedShell };

  if (typeof merged.shellPath !== "string" || merged.shellPath.trim() === "") {
    merged.shellPath = DEFAULT_SHELL_CONFIG.shellPath;
  }

  return merged;
}

function isSameOriginHost() {
  return window.location.origin === BASE_URL;
}

function isTrustedHost() {
  const host = window.location.hostname;
  return (
    host === "dhanur.me" || host.endsWith(".dhanur.me") || host === "localhost"
  );
}

function maybeRegisterServiceWorker(config) {
  if (config.enablePwa === false) return;
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  const swPath =
    typeof config.swPath === "string" && config.swPath.trim() !== ""
      ? config.swPath
      : "/sw.js";

  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker.register(swPath).catch(() => {
        // Subdomains opt out or host custom instances
      });
    },
    { once: true },
  );
}

function injectCSS(sameOrigin, config) {
  if (config.noCss) return;
  if (document.querySelector('link[data-shell-style="main"]')) return;

  const cssBase = sameOrigin ? "" : BASE_URL;
  const shellCssHref = sameOrigin
    ? `${cssBase}/css/main.css`
    : `${cssBase}/css/dui.css`;

  const mainLink = document.createElement("link");
  mainLink.rel = "stylesheet";
  mainLink.href = shellCssHref;
  mainLink.setAttribute("data-shell-style", "main");
  if (!sameOrigin) mainLink.crossOrigin = "anonymous";
  document.head.appendChild(mainLink);

  const faLink = document.createElement("link");
  faLink.rel = "stylesheet";
  faLink.href = `${cssBase}/css/font-awesome.min.css`;
  faLink.setAttribute("data-shell-style", "fa");
  faLink.media = "print";
  faLink.onload = function () {
    this.media = "all";
  };
  if (!sameOrigin) faLink.crossOrigin = "anonymous";
  document.head.appendChild(faLink);
}

function injectFavicons(sameOrigin, config) {
  if (config.favicon === false) return;
  const iconBase = sameOrigin ? "/icons/" : `${BASE_URL}/icons/`;

  document
    .querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
    )
    .forEach((el) => el.remove());

  const iconLinks = [
    {
      rel: "icon",
      type: "image/png",
      sizes: "96x96",
      href: `${iconBase}favicon-96x96-transparent.png`,
    },
    { rel: "icon", type: "image/svg+xml", href: `${iconBase}favicon.svg` },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: `${iconBase}apple-touch-icon-180x180-transparent.png`,
    },
  ];

  if (sameOrigin) {
    iconLinks.push({
      rel: "shortcut icon",
      href: `${iconBase}favicon-transparent.ico`,
    });
  }

  if (sameOrigin) {
    document
      .querySelectorAll('link[rel="manifest"]')
      .forEach((el) => el.remove());
    iconLinks.push({ rel: "manifest", href: `${iconBase}site.webmanifest` });
  }

  iconLinks.forEach((f) => {
    const link = document.createElement("link");
    link.rel = f.rel;
    if (f.type) link.type = f.type;
    if (f.sizes) link.sizes = f.sizes;
    link.href = f.href;
    if (!sameOrigin && f.rel === "manifest") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

function applyChromeVisibility(root, config) {
  if (!config.showLanguage) {
    root
      .querySelectorAll('[data-nav-chrome="lang"]')
      .forEach((node) => node.remove());
  }
  if (!config.showAppsGrid) {
    root
      .querySelectorAll('[data-nav-chrome="apps"]')
      .forEach((node) => node.remove());
  }
  if (!config.showAccountButton) {
    root
      .querySelectorAll('[data-nav-chrome="account"]')
      .forEach((node) => node.remove());
  }
  if (!config.showThemeToggle) {
    root
      .querySelectorAll('[data-nav-chrome="theme"]')
      .forEach((node) => node.remove());
  }
  if (!config.showMobileMenu) {
    const mobileBtn = root.querySelector("#shell-mobile-toggle");
    if (mobileBtn) {
      const wrapper = mobileBtn.closest(".flex-none");
      if (wrapper) wrapper.remove();
    }
    const mobilePanel = root.querySelector("[data-shell-mobile-panel]");
    if (mobilePanel) mobilePanel.remove();
  }
}

function safeHref(value) {
  const input = String(value || "").trim();
  if (!input) return "#";
  try {
    const parsed = new URL(input, window.location.origin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // Ignore malformed strings
  }
  return "#";
}

function safeIconClass(value) {
  const input = String(value || "").trim();
  if (!input) return "fa-solid fa-link";
  if (!/^[a-z0-9\s_-]+$/i.test(input)) return "fa-solid fa-link";
  return input;
}

function renderAppsGrid(shellRoot, apps) {
  const grids = shellRoot.querySelectorAll(
    "[data-app-menu-grid], [data-apps-grid], [data-apps-grid-mobile]",
  );
  if (!grids.length) return;

  const entries = Array.isArray(apps) ? apps : [];
  grids.forEach((grid) => {
    const gridMode = grid.getAttribute("data-app-menu-grid");
    const isDesktop =
      gridMode === "desktop" ||
      (!gridMode && grid.hasAttribute("data-apps-grid"));
    const padding = isDesktop ? "p-3" : "p-2.5";

    const fragment = document.createDocumentFragment();

    for (const app of entries) {
      const href = safeHref(app?.url);
      const icon = safeIconClass(app?.icon);
      const name = String(app?.name || "App").trim() || "App";

      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.className = `group flex flex-col items-center gap-1.5 ${padding} rounded-md hover:bg-base-200 transition-colors duration-200 no-underline hover:no-underline text-base-content`;

      const iconWrap = document.createElement("div");
      iconWrap.className =
        "w-10 h-10 rounded-md bg-base-300/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors";

      const iconNode = document.createElement("i");
      iconNode.className = `${icon} text-lg`;

      const label = document.createElement("span");
      label.className =
        "text-[10px] font-medium opacity-70 group-hover:opacity-100";
      label.textContent = name;

      iconWrap.appendChild(iconNode);
      anchor.appendChild(iconWrap);
      anchor.appendChild(label);
      fragment.appendChild(anchor);
    }

    grid.replaceChildren(fragment);
  });
}

async function updateAppsGridForRole(shellRoot, role) {
  const cached = getManifestSync();
  const cachedVisible = filterAppsByRole(cached.apps, role);
  renderAppsGrid(shellRoot, cachedVisible);

  const fresh = await fetchManifest(role);
  const freshVisible = filterAppsByRole(fresh.apps, role);
  renderAppsGrid(shellRoot, freshVisible);
  return freshVisible;
}

// --- Mobile Panel Event Delegation ---
function initMobilePanel() {
  const panel = document.querySelector("[data-shell-mobile-panel]");
  if (!panel) return;

  const drawer = panel.querySelector("[data-shell-mobile-drawer]");

  function openPanel() {
    panel.classList.remove("hidden");
    void panel.offsetWidth; // Trigger clean reflow layout execution
    if (drawer) drawer.style.transform = "translateX(0)";
    document.body.style.overflow = "hidden";
  }

  function closePanel() {
    if (drawer) drawer.style.transform = "translateX(-100%)";
    document.body.style.overflow = "";
    setTimeout(() => {
      panel.classList.add("hidden");
    }, 300);
  }

  // Pure single-listener routing blocks element detach loops
  if (!document.__shellMobileDelegated) {
    document.__shellMobileDelegated = true;
    document.addEventListener("click", (e) => {
      const toggleTarget = e.target.closest("#shell-mobile-toggle");
      if (toggleTarget) {
        e.preventDefault();
        e.stopPropagation();
        openPanel();
        return;
      }

      const closeTarget = e.target.closest("[data-shell-mobile-close]");
      const backdropTarget = e.target.closest("[data-shell-mobile-backdrop]");
      if (closeTarget || backdropTarget) {
        e.preventDefault();
        e.stopPropagation();
        closePanel();
        return;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.classList.contains("hidden")) {
        closePanel();
      }
    });
  }
}

function syncMobileAuth(shellRoot, authStatus) {
  // Redundant proxy check maintained strictly for edge consumers using local overrides
  const panel = shellRoot.querySelector("[data-shell-mobile-panel]");
  if (!panel) return;

  const isAuthed = authStatus?.authenticated === true;
  const user = authStatus?.user;
  const nameEl = panel.querySelector('[data-auth="mobile-name"]');
  const emailEl = panel.querySelector('[data-auth="mobile-email"]');

  if (isAuthed && user) {
    if (nameEl) nameEl.textContent = user.name || "User";
    if (emailEl) emailEl.textContent = user.email || "";
  } else {
    if (nameEl) nameEl.textContent = "Guest";
    if (emailEl) emailEl.textContent = "Not signed in";
  }
}

function hydrate(shellRoot) {
  const config = getShellRuntimeConfig();
  const sameOrigin = isSameOriginHost();

  const hasMainStyles = !!document.querySelector(
    'link[rel="stylesheet"][href*="/css/main.css"], link[rel="stylesheet"][href*="/css/dui.css"], link[data-shell-style="main"]',
  );
  const hasFaviconLinks = !!document.querySelector(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
  );

  if (!sameOrigin || !hasMainStyles) {
    injectCSS(sameOrigin, config);
  }
  if (!sameOrigin || !hasFaviconLinks) {
    injectFavicons(sameOrigin, config);
  }

  applyChromeVisibility(shellRoot, config);
  updateAppsGridForRole(shellRoot, "guest");

  initResponsive();
  initTheme(shellRoot);
  initDropdowns(shellRoot);
  initMobilePanel();

  initAuth(document, (authStatus) => {
    const role = authStatus?.role || "guest";
    const access = checkAccess(config, authStatus);
    const contentSlot =
      shellRoot.querySelector(".site-nav-slot") ||
      shellRoot.querySelector(".drawer-content");

    if (!access.allowed) {
      if (contentSlot) {
        renderAccessWall(
          contentSlot,
          access.reason,
          document.title || "This app",
        );
      }
      return;
    }

    updateAppsGridForRole(shellRoot, role);
    syncMobileAuth(shellRoot, authStatus);
  });
}

async function bootstrapShell() {
  if (_injected) return;
  _injected = true;

  const config = getShellRuntimeConfig();
  if (config.showNavbar === false) return;

  if (!isTrustedHost()) {
    console.warn("[shell.js] Execution blocked on unauthorized origin.");
    return;
  }

  maybeRegisterServiceWorker(config);

  const sameOrigin = isSameOriginHost();
  const existingNavbar = document.querySelector(".navbar");

  if (existingNavbar) {
    if (!sameOrigin) {
      hydrate(document.body);
    }
    return;
  }

  if (!sameOrigin) {
    injectCSS(false, config);
    injectFavicons(false, config);
    return;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapShell);
} else {
  bootstrapShell();
}
