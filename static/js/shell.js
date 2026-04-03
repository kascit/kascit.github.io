/**
 * Subdomain "Plug-and-play" Design Shell Export (ES Module)
 *
 * Fetches the navbar HTML from dhanur.me and wires it up
 * using the EXACT same ES modules that power the main site.
 *
 * Usage in external frontend (e.g., React, Vue, HTML):
 * <script type="module" src="https://dhanur.me/js/shell.js"></script>
 */

import { BASE_URL, getConfig } from './modules/config.js';
import { initResponsive } from './modules/responsive.js';
import { initTheme } from './modules/theme-engine.js';
import { initAuth } from './modules/auth-integration.js';
import { initDropdowns } from './modules/dropdowns.js';

window.__componentsJS = true;
let _injected = false;

const DEFAULT_SHELL_CONFIG = {
  shellPath: '/navbar/',
  noCss: false,
  favicon: true,
  showNavbar: true,
  showMobileMenu: true,
  showLanguage: false,
  showAppsGrid: true,
  showAccountButton: true,
  showThemeToggle: false,
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

// Helpers to inject CSS and favicon assets into foreign documents.
function injectCSS(sameOrigin, config) {
  if (config.noCss) return;
  if (document.querySelector('link[data-shell-style="main"]')) return;

  const cssBase = sameOrigin ? '' : BASE_URL;

  // Preloads
  [
    { href: `${cssBase}/webfonts/fa-solid-900.woff2`, type: "font/woff2" },
    { href: `${cssBase}/webfonts/fa-brands-400.woff2`, type: "font/woff2" },
    { href: `${cssBase}/fonts/Pretendard-Regular.woff`, type: "font/woff" },
  ].forEach(p => {
    const pl = document.createElement("link");
    pl.rel = "preload"; pl.as = "font"; pl.type = p.type;
    pl.href = p.href; pl.crossOrigin = "anonymous";
    pl.setAttribute('data-shell-style', 'preload');
    document.head.appendChild(pl);
  });

  const mainLink = document.createElement("link");
  mainLink.rel = "stylesheet";
  mainLink.href = `${cssBase}/css/main.css`;
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

  const fontStyle = document.createElement("style");
  fontStyle.textContent = `
    @font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap;src:url(${cssBase}/webfonts/fa-brands-400.woff2) format("woff2"),url(${cssBase}/webfonts/fa-brands-400.ttf) format("truetype")}
    @font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:swap;src:url(${cssBase}/webfonts/fa-regular-400.woff2) format("woff2"),url(${cssBase}/webfonts/fa-regular-400.ttf) format("truetype")}
    @font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap;src:url(${cssBase}/webfonts/fa-solid-900.woff2) format("woff2"),url(${cssBase}/webfonts/fa-solid-900.ttf) format("truetype")}
    @font-face{font-family:"Pretendard-Regular";src:url('${cssBase}/fonts/Pretendard-Regular.woff') format("woff");font-weight:400;font-style:normal;font-display:swap}
    body{font-family:"Pretendard-Regular",sans-serif}
  `;
  fontStyle.setAttribute('data-shell-style', 'fonts');
  document.head.appendChild(fontStyle);
}

function injectFavicons(sameOrigin, config) {
  if (config.favicon === false) return;
  const iconBase = sameOrigin ? "/icons/" : `${BASE_URL}/icons/`;

  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());

  const iconLinks = [
    { rel: "icon", type: "image/png", sizes: "96x96", href: `${iconBase}favicon-96x96.png` },
    { rel: "icon", type: "image/svg+xml", href: `${iconBase}favicon.svg` },
    { rel: "shortcut icon", href: `${iconBase}favicon.ico` },
    { rel: "apple-touch-icon", sizes: "180x180", href: `${iconBase}apple-touch-icon.png` }
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

  // Only inject CSS/favicons if we are truly on a subdomain layout,
  // not accidentally running on the main site
  if (!sameOrigin) {
    injectCSS(sameOrigin, config);
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

function bootstrapShell() {
  if (_injected) return;
  _injected = true;

  const config = getShellRuntimeConfig();
  if (config.showNavbar === false) return;

  const sameOrigin = isSameOriginHost();

  const existingNavbar = document.querySelector(".navbar");
  if (existingNavbar) {
    // If shell is loaded onto the main site, skip mutations; if external and pre-rendered, hydrate.
    if (!sameOrigin) {
      hydrate(document.body);
    }
    return;
  }

  // We are on an external subdomain. Hide root content, fetch shell, inject content into slot.
  const children = Array.from(document.body.children);
  children.forEach(c => document.body.removeChild(c));

  const shellUrl = `${BASE_URL}${normalizePath(config.shellPath)}`;

  fetch(shellUrl)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch layout shell");
      return res.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const shellRoot = resolveShellRoot(doc);
      if (!shellRoot) throw new Error("Navbar shell root not found in fetched HTML");

      const slot = shellRoot.querySelector(".site-nav-slot");
      if (!slot) throw new Error("site-nav-slot missing in fetched navbar shell");

      children.forEach(node => slot.appendChild(node));
      document.body.appendChild(shellRoot);

      hydrate(shellRoot);
    })
    .catch(err => {
      console.error("[shell.js] Bootstrap Error:", err);
      // Fallback
      children.forEach(node => document.body.appendChild(node));
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapShell);
} else {
  bootstrapShell();
}
