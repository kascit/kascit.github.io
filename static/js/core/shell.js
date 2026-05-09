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
import { checkAccess, renderAccessWall } from "../system/access-guard.js";
import { filterAppsByRole, getManifestSync } from "../system/manifest.js";
import { initDropdowns } from "../ui/dropdowns.js";
import { SHELL_CONFIG_DEFAULTS } from "./shell-config.js";

window.__componentsJS = true;
let _injected = false;

const DEFAULT_SHELL_CONFIG = {
  ...SHELL_CONFIG_DEFAULTS,
  noCss: false,
  showNavbar: true,
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
        // Subdomains can opt out or provide their own /sw.js.
      });
    },
    { once: true },
  );
}

// Helpers to inject CSS and favicon assets into foreign documents.
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

  // For cross-origin subdomains, skip .ico files to avoid CORB errors.
  // Browsers block opaque cross-origin .ico reads even with CORS headers.
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

  // Only include .ico for same-origin (avoids CORB on subdomains)
  if (sameOrigin) {
    iconLinks.push({
      rel: "shortcut icon",
      href: `${iconBase}favicon-transparent.ico`,
    });
  }

  // Avoid cross-origin webmanifest warnings on subdomains.
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
    // Ignore malformed URL and fall back to anchor.
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
    "[data-apps-grid], [data-apps-grid-sidebar], [data-apps-grid-mobile]",
  );
  if (!grids.length) return;

  const entries = Array.isArray(apps) ? apps : [];
  grids.forEach((grid) => {
    const isDesktop = grid.hasAttribute("data-apps-grid");
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

function updateAppsGridForRole(shellRoot, role) {
  const fallback = getManifestSync();
  const visibleApps = filterAppsByRole(fallback.apps, role);
  renderAppsGrid(shellRoot, visibleApps);
  return Promise.resolve(visibleApps);
}

// --- Mobile panel logic ---
function initMobilePanel(shellRoot) {
  const panel = shellRoot.querySelector("[data-shell-mobile-panel]");
  if (!panel) return;

  const toggle = shellRoot.querySelector("#shell-mobile-toggle");
  const backdrop = panel.querySelector("[data-shell-mobile-backdrop]");
  const drawer = panel.querySelector("[data-shell-mobile-drawer]");
  const closeBtn = panel.querySelector("[data-shell-mobile-close]");

  function openPanel() {
    panel.classList.remove("hidden");
    // Force reflow before adding transition class
    void drawer.offsetWidth;
    drawer.style.transform = "translateX(0)";
    document.body.style.overflow = "hidden";
  }

  function closePanel() {
    drawer.style.transform = "translateX(-100%)";
    document.body.style.overflow = "";
    setTimeout(() => {
      panel.classList.add("hidden");
    }, 300);
  }

  if (toggle) toggle.addEventListener("click", openPanel);
  if (backdrop) backdrop.addEventListener("click", closePanel);
  if (closeBtn) closeBtn.addEventListener("click", closePanel);

  // Close on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.classList.contains("hidden")) {
      closePanel();
    }
  });
}

// --- Mobile auth sync ---
function syncMobileAuth(shellRoot, authStatus) {
  const panel = shellRoot.querySelector("[data-shell-mobile-panel]");
  if (!panel) return;

  const isAuthed = authStatus?.authenticated === true;
  const user = authStatus?.user;

  const guestAvatar = panel.querySelector('[data-auth="mobile-guest-avatar"]');
  const authedAvatar = panel.querySelector(
    '[data-auth="mobile-authed-avatar"]',
  );
  const nameEl = panel.querySelector('[data-auth="mobile-name"]');
  const emailEl = panel.querySelector('[data-auth="mobile-email"]');
  const loginBtn = panel.querySelector('[data-auth="mobile-login-btn"]');
  const logoutBtn = panel.querySelector('[data-auth="mobile-logout-btn"]');
  const accountBtn = panel.querySelector('[data-auth="mobile-account-btn"]');

  if (isAuthed && user) {
    if (guestAvatar) guestAvatar.classList.add("hidden");
    if (authedAvatar) {
      authedAvatar.classList.remove("hidden");
      const img = authedAvatar.querySelector("img");
      if (img) img.src = user.avatar_url || "";
    }
    if (nameEl) nameEl.textContent = user.name || "User";
    if (emailEl) emailEl.textContent = user.email || "";
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (accountBtn) accountBtn.classList.remove("hidden");
  } else {
    if (guestAvatar) guestAvatar.classList.remove("hidden");
    if (authedAvatar) authedAvatar.classList.add("hidden");
    if (nameEl) nameEl.textContent = "Guest";
    if (emailEl) emailEl.textContent = "Not signed in";
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (accountBtn) accountBtn.classList.add("hidden");
  }

  // Wire up mobile logout
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      const auth = window.AUTH;
      if (auth && typeof auth.logout === "function") {
        const result = auth.logout();
        if (result && typeof result.then === "function") {
          result
            .then(() => window.location.reload())
            .catch(() => window.location.reload());
        } else {
          window.location.reload();
        }
      }
    };
  }

  // Wire up mobile login
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      const auth = window.AUTH;
      if (auth && typeof auth.login === "function") {
        auth.login();
      } else {
        window.location.href = "https://auth.dhanur.me";
      }
    };
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

  // On subdomains always inject shared assets.
  // On same-origin shell test pages, inject only if missing.
  if (!sameOrigin || !hasMainStyles) {
    injectCSS(sameOrigin, config);
  }
  if (!sameOrigin || !hasFaviconLinks) {
    injectFavicons(sameOrigin, config);
  }

  applyChromeVisibility(shellRoot, config);

  const cachedManifest = getManifestSync();
  renderAppsGrid(shellRoot, filterAppsByRole(cachedManifest.apps, "guest"));
  updateAppsGridForRole(shellRoot, "guest");

  initResponsive();
  initTheme(shellRoot);
  initDropdowns(shellRoot);
  initMobilePanel(shellRoot);

  initAuth(shellRoot, (authStatus) => {
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

  // Security hardening: do not inject cross-origin HTML into this document.
  // External consumers should ship a local shell markup and then call hydrate().
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
