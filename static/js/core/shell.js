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
import { initResponsive } from "./responsive.js";
import { initTheme } from "./theme-engine.js";
import { initAuth } from "../system/auth-integration.js";
import { initDropdowns } from "../ui/dropdowns.js";
import { SHELL_CONFIG_DEFAULTS } from "./shell-config.js";

window.__componentsJS = true;
let _injected = false;
let _activeShellController = null;
let _shellAbortHandlersBound = false;

const DEFAULT_SHELL_CONFIG = {
  ...SHELL_CONFIG_DEFAULTS,
  shellFetchTimeoutMs: 10000,
  noCss: false,
  showNavbar: true,
};

function getShellRuntimeConfig() {
  const rawConfig = getConfig() || {};
  const nestedShell = rawConfig.shell && typeof rawConfig.shell === 'object' ? rawConfig.shell : {};
  const merged = { ...DEFAULT_SHELL_CONFIG, ...rawConfig, ...nestedShell };

  if (typeof merged.shellPath !== 'string' || merged.shellPath.trim() === '') {
    merged.shellPath = DEFAULT_SHELL_CONFIG.shellPath;
  }

  return merged;
}

function normalizePath(path) {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

function isSameOriginHost() {
  return window.location.origin === BASE_URL;
}

function maybeRegisterServiceWorker(config) {
  if (config.enablePwa === false) return;
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  const swPath = typeof config.swPath === 'string' && config.swPath.trim() !== ''
    ? config.swPath
    : '/sw.js';

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swPath).catch(() => {
      // Subdomains can opt out or provide their own /sw.js.
    });
  }, { once: true });
}

// Helpers to inject CSS and favicon assets into foreign documents.
function injectCSS(sameOrigin, config) {
  if (config.noCss) return;
  if (document.querySelector('link[data-shell-style="main"]')) return;

  const cssBase = sameOrigin ? '' : BASE_URL;
  const shellCssHref = sameOrigin ? `${cssBase}/css/main.css` : `${cssBase}/css/dui.css`;

  const mainLink = document.createElement("link");
  mainLink.rel = "stylesheet";
  mainLink.href = shellCssHref;
  mainLink.setAttribute('data-shell-style', 'main');
  if (!sameOrigin) mainLink.crossOrigin = "anonymous";
  document.head.appendChild(mainLink);

  const faLink = document.createElement("link");
  faLink.rel = "stylesheet";
  faLink.href = `${cssBase}/css/font-awesome.min.css`;
  faLink.setAttribute('data-shell-style', 'fa');
  faLink.media = "print";
  faLink.onload = function () { this.media = "all"; };
  if (!sameOrigin) faLink.crossOrigin = "anonymous";
  document.head.appendChild(faLink);
}

function injectFavicons(sameOrigin, config) {
  if (config.favicon === false) return;
  const iconBase = sameOrigin ? "/icons/" : `${BASE_URL}/icons/`;

  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());

  const iconLinks = [
    { rel: "icon", type: "image/png", sizes: "96x96", href: `${iconBase}favicon-96x96-transparent.png` },
    { rel: "icon", type: "image/svg+xml", href: `${iconBase}favicon.svg` },
    { rel: "shortcut icon", href: `${iconBase}favicon-transparent.ico` },
    { rel: "apple-touch-icon", sizes: "180x180", href: `${iconBase}apple-touch-icon-180x180-transparent.png` }
  ];

  // Avoid cross-origin webmanifest warnings on subdomains.
  if (sameOrigin) {
    document.querySelectorAll('link[rel="manifest"]').forEach(el => el.remove());
    iconLinks.push({ rel: "manifest", href: `${iconBase}site.webmanifest` });
  }

  iconLinks.forEach(f => {
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
    root.querySelectorAll('[data-nav-chrome="lang"]').forEach(node => node.remove());
  }
  if (!config.showAppsGrid) {
    root.querySelectorAll('[data-nav-chrome="apps"]').forEach(node => node.remove());
  }
  if (!config.showAccountButton) {
    root.querySelectorAll('[data-nav-chrome="account"]').forEach(node => node.remove());
  }
  if (!config.showThemeToggle) {
    root.querySelectorAll('[data-nav-chrome="theme"]').forEach(node => node.remove());
  }
  if (!config.showMobileMenu) {
    const mobileMenu = root.querySelector('#hamburger-toggle')?.closest('.flex-none');
    if (mobileMenu) mobileMenu.remove();
  }
}

function hydrate(shellRoot) {
  const config = getShellRuntimeConfig();
  const sameOrigin = isSameOriginHost();

  const hasMainStyles = !!document.querySelector('link[rel="stylesheet"][href*="/css/main.css"], link[rel="stylesheet"][href*="/css/dui.css"], link[data-shell-style="main"]');
  const hasFaviconLinks = !!document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');

  // On subdomains always inject shared assets.
  // On same-origin shell test pages, inject only if missing.
  if (!sameOrigin || !hasMainStyles) {
    injectCSS(sameOrigin, config);
  }
  if (!sameOrigin || !hasFaviconLinks) {
    injectFavicons(sameOrigin, config);
  }

  applyChromeVisibility(shellRoot, config);

  initResponsive();
  initTheme(shellRoot);
  initDropdowns(shellRoot);
  initAuth(shellRoot);
}

function resolveShellRoot(doc) {
  return doc.querySelector('.site-nav-shell') || doc.querySelector('.drawer');
}

function abortActiveShellFetch() {
  if (_activeShellController) {
    _activeShellController.abort();
    _activeShellController = null;
  }
}

function bindShellAbortHandlers() {
  if (_shellAbortHandlersBound) return;
  _shellAbortHandlersBound = true;

  window.addEventListener('pagehide', abortActiveShellFetch, { once: true });
  window.addEventListener('beforeunload', abortActiveShellFetch, { once: true });
}

async function bootstrapShell() {
  if (_injected) return;
  _injected = true;

  const config = getShellRuntimeConfig();
  if (config.showNavbar === false) return;

  maybeRegisterServiceWorker(config);

  const sameOrigin = isSameOriginHost();

  const existingNavbar = document.querySelector(".navbar");
  if (existingNavbar) {
    // If shell is loaded onto the main site, skip mutations; if external and pre-rendered, hydrate.
    if (!sameOrigin) {
      hydrate(document.body);
    }
    return;
  }

  // We are on an external subdomain. Fetch shell first, then atomically move content.
  const shellUrl = `${BASE_URL}${normalizePath(config.shellPath)}`;
  const timeoutMs = Number(config.shellFetchTimeoutMs) > 0
    ? Number(config.shellFetchTimeoutMs)
    : DEFAULT_SHELL_CONFIG.shellFetchTimeoutMs;
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  _activeShellController = controller;
  bindShellAbortHandlers();

  try {
    const res = await fetch(shellUrl, { signal: controller.signal });
    if (!res.ok) throw new Error("Failed to fetch layout shell");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const shellRoot = resolveShellRoot(doc);
    if (!shellRoot) throw new Error("Navbar shell root not found in fetched HTML");

    const slot = shellRoot.querySelector(".site-nav-slot");
    if (!slot) throw new Error("site-nav-slot missing in fetched navbar shell");

    const children = Array.from(document.body.children);
    const fragment = document.createDocumentFragment();
    children.forEach(node => fragment.appendChild(node));

    slot.appendChild(fragment);
    document.body.appendChild(shellRoot);
    hydrate(shellRoot);
  } catch (err) {
    if (err && err.name === 'AbortError') {
      if (timedOut) {
        console.warn(`[shell.js] Bootstrap fetch timed out after ${timeoutMs}ms`);
      }
      return;
    }
    console.error("[shell.js] Bootstrap Error:", err);
  } finally {
    window.clearTimeout(timeoutId);
    if (_activeShellController === controller) {
      _activeShellController = null;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapShell);
} else {
  bootstrapShell();
}
