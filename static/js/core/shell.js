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
import { CANONICAL_SHELL_HTML } from "./shell-template.js";

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
    host === "dhanur.me" ||
    host.endsWith(".dhanur.me") ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".github.io") ||
    host.endsWith(".onrender.com") ||
    host.endsWith(".local") ||
    window.location.protocol === "file:"
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
  faLink.href = `${cssBase}/css/font-awesome.subset.css`;
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

function syncNavLinks(shellRoot, config) {
  const currentPath = window.location.pathname;

  // Active path highlight
  shellRoot.querySelectorAll("[data-nav-link] a").forEach((anchor) => {
    try {
      const parsed = new URL(anchor.href, window.location.origin);
      if (
        parsed.origin === window.location.origin &&
        (parsed.pathname === currentPath ||
          (parsed.pathname !== "/" && currentPath.startsWith(parsed.pathname)))
      ) {
        anchor.classList.add("text-primary", "font-semibold");
      }
    } catch {}
  });

  // Custom nav override if explicitly requested
  if (config.customNav === true && Array.isArray(config.nav) && config.nav.length > 0) {
    const desktopMenu = shellRoot.querySelector(".menu.menu-horizontal");
    if (desktopMenu) {
      desktopMenu.querySelectorAll("[data-nav-link]").forEach((el) => el.remove());
      const appsItem = desktopMenu.querySelector('[data-nav-chrome="apps"]');
      for (const item of config.nav) {
        const li = document.createElement("li");
        li.setAttribute("data-nav-link", "custom");
        const a = document.createElement("a");
        a.className = "btn btn-ghost hover:no-underline";
        a.href = safeHref(item.url);
        if (item.icon) {
          const icon = document.createElement("i");
          icon.className = safeIconClass(item.icon);
          a.appendChild(icon);
        }
        a.appendChild(document.createTextNode(" " + String(item.name || "Link")));
        li.appendChild(a);
        if (appsItem) {
          desktopMenu.insertBefore(li, appsItem);
        } else {
          desktopMenu.appendChild(li);
        }
      }
    }
  }
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

function hydrateFooter() {
  document.querySelectorAll("[data-deploy-date]").forEach((el) => {
    if (el.textContent && el.textContent.trim().length > 0) return;
    try {
      if (document.lastModified) {
        const d = new Date(document.lastModified);
        if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
          el.textContent = "Updated " + d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    } catch {}
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
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
  syncNavLinks(shellRoot, config);
  updateAppsGridForRole(shellRoot, "guest");

  initResponsive();
  initTheme(shellRoot);
  initDropdowns(shellRoot);
  initMobilePanel();
  hydrateFooter();

  initAuth(document, (authStatus) => {
    const role = authStatus?.role || "guest";
    const access = checkAccess(config, authStatus);
    let contentSlot =
      shellRoot.querySelector(".site-nav-slot") ||
      shellRoot.querySelector(".drawer-content") ||
      document.querySelector("main") ||
      document.querySelector(".eco-page") ||
      document.querySelector("#app-root") ||
      document.querySelector("#app");

    if (!contentSlot) {
      const shellHeader =
        document.getElementById("dhanur-shell") ||
        shellRoot.querySelector(".navbar");
      if (shellHeader && shellHeader.nextElementSibling) {
        contentSlot = shellHeader.nextElementSibling;
      }
    }

    if (!access.allowed) {
      if (contentSlot) {
        if (!contentSlot.__originalContent) {
          contentSlot.__originalContent = Array.from(contentSlot.childNodes);
        }
        renderAccessWall(
          contentSlot,
          access.reason,
          document.title || "This app",
        );
      }
      return;
    }

    if (contentSlot && contentSlot.__originalContent) {
      contentSlot.replaceChildren(...contentSlot.__originalContent);
      delete contentSlot.__originalContent;
    }

    updateAppsGridForRole(shellRoot, role);
    syncMobileAuth(shellRoot, authStatus);
  });
}


function mountCanonicalShell() {
  const mountPoint = document.getElementById("dhanur-shell");

  let parsedChildren = [];
  const defaultPolicy =
    window.__defaultPolicy || window.trustedTypes?.defaultPolicy;

  if (defaultPolicy && typeof defaultPolicy.createHTML === "function") {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = defaultPolicy.createHTML(CANONICAL_SHELL_HTML);
    parsedChildren = Array.from(tempDiv.children);
  } else {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(CANONICAL_SHELL_HTML, "text/html");
      parsedChildren = Array.from(doc.body.children);
    } catch {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = CANONICAL_SHELL_HTML;
      parsedChildren = Array.from(tempDiv.children);
    }
  }

  if (mountPoint) {
    mountPoint.replaceChildren(...parsedChildren);
  } else {
    const fragment = document.createDocumentFragment();
    for (const child of parsedChildren) {
      fragment.appendChild(child);
    }
    document.body.prepend(fragment);
  }
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
  let navbar = document.querySelector(".navbar");

  if (!navbar) {
    mountCanonicalShell();
    navbar = document.querySelector(".navbar");
  }

  if (navbar) {
    hydrate(document.body);
    return;
  }

  injectCSS(sameOrigin, config);
  injectFavicons(sameOrigin, config);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapShell);
} else {
  bootstrapShell();
}

