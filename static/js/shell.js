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

// Helpers to inject CSS and Favicon to the foreign document
function injectCSS(sameOrigin) {
  const config = getConfig();
  if (config.noCss) return;
  
  const cssBase = sameOrigin ? "" : BASE_URL;

  // Preloads
  [
    { href: `${cssBase}/webfonts/fa-solid-900.woff2`, type: "font/woff2" },
    { href: `${cssBase}/webfonts/fa-brands-400.woff2`, type: "font/woff2" },
    { href: `${cssBase}/fonts/Pretendard-Regular.woff`, type: "font/woff" },
  ].forEach(p => {
    const pl = document.createElement("link");
    pl.rel = "preload"; pl.as = "font"; pl.type = p.type;
    pl.href = p.href; pl.crossOrigin = "anonymous";
    document.head.appendChild(pl);
  });

  const mainLink = document.createElement("link");
  mainLink.rel = "stylesheet";
  mainLink.href = `${cssBase}/css/main.css`;
  if (!sameOrigin) mainLink.crossOrigin = "anonymous";
  document.head.appendChild(mainLink);

  const faLink = document.createElement("link");
  faLink.rel = "stylesheet";
  faLink.href = `${cssBase}/css/font-awesome.min.css`;
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
  document.head.appendChild(fontStyle);
}

function injectFavicons(sameOrigin) {
  const config = getConfig();
  if (config.favicon === false) return;
  const iconBase = sameOrigin ? "/icons/" : `${BASE_URL}/icons/`;

  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="manifest"]').forEach(el => el.remove());

  [
    { rel: "icon", type: "image/png", sizes: "96x96", href: `${iconBase}favicon-96x96.png` },
    { rel: "icon", type: "image/svg+xml", href: `${iconBase}favicon.svg` },
    { rel: "shortcut icon", href: `${iconBase}favicon.ico` },
    { rel: "apple-touch-icon", sizes: "180x180", href: `${iconBase}apple-touch-icon.png` },
    { rel: "manifest", href: `${iconBase}site.webmanifest` },
  ].forEach(f => {
    const link = document.createElement("link");
    link.rel = f.rel;
    if (f.type) link.type = f.type;
    if (f.sizes) link.sizes = f.sizes;
    link.href = f.href;
    if (!sameOrigin && f.rel === "manifest") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

function hydrate(drawer) {
  const config = getConfig();
  const sameOrigin = window.location.origin === BASE_URL;

  // Only inject CSS/Favicons if we are truly on a subdomain layout, 
  // not accidentally running on the main site
  if (!sameOrigin) {
    injectCSS(sameOrigin);
    injectFavicons(sameOrigin);
  }

  // Optional: Run custom DOM mutators here if you still want window.SiteNavConfig to override <li> items.
  // We'll leave the complex mutator logic out of the core template here for a cleaner build, 
  // but if SiteNavConfig.nav was heavily used, it should be appended here.

  initResponsive();
  initTheme(drawer);
  initDropdowns(drawer);
  initAuth(drawer);
}

function bootstrapShell() {
  if (_injected) return;
  _injected = true;

  const existingNavbar = document.querySelector(".navbar");
  if (existingNavbar) {
    // If the main site or a pre-rendered layout already has the dom, just hydrate.
    hydrate(document.body);
    return;
  }

  // We are on an external subdomain. Hide root content, fetch shell, inject content into slot.
  const children = Array.from(document.body.children);
  children.forEach(c => document.body.removeChild(c));

  fetch(`${BASE_URL}/navbar/`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch layout shell");
      return res.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newDrawer = doc.querySelector(".drawer");
      if (!newDrawer) throw new Error("Drawer not found in fetched HTML");

      const slot = newDrawer.querySelector(".site-nav-slot");
      if (!slot) throw new Error("site-nav-slot missing in fetched navbar shell");
      
      children.forEach(node => slot.appendChild(node));
      document.body.appendChild(newDrawer);
      
      hydrate(newDrawer);
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
