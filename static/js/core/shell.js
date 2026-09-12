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

const CANONICAL_SHELL_HTML = `<div class="navbar site-topbar fixed top-0 left-0 right-0 z-50 h-16 bg-base-100/80 backdrop-blur-md border-b border-base-content/10">
    <div class="flex-none lg:hidden">
        <button id="shell-mobile-toggle" type="button" aria-label="Open menu" class="btn btn-ghost btn-circle btn-sm transition-colors duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </div>

    <div class="flex-1 flex justify-center items-center lg:flex lg:justify-start">
        <a href="https://dhanur.me/" class="btn btn-ghost hover:bg-transparent hover:border-transparent normal-case text-xl font-bold text-base-content logo-firefly site-logo-link">
            <div class="relative h-16 flex items-center">
                <picture>
                    <img src="https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/images/branding/logo-light.png" alt="~/dhanur" class="h-16 w-auto p-[14px] logo-dark" sizes="200px" data-logo-type="dark" loading="eager" fetchpriority="high" />
                </picture>
                <picture class="absolute inset-0 flex items-center">
                    <img src="https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/images/branding/logo-dark.png" alt="~/dhanur" class="h-16 w-auto p-[14px] logo-light" sizes="200px" data-logo-type="light" loading="eager" fetchpriority="high" />
                </picture>
            </div>
        </a>
    </div>

    <div class="flex-none lg:hidden" aria-hidden="true"><div class="btn btn-circle btn-sm invisible"></div></div>

    <div class="flex-none hidden lg:flex">
        <ul class="menu menu-horizontal px-1 items-center">
            <li data-nav-chrome="apps" class="ml-1">
                <div class="relative p-0" data-dropdown="apps">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-square tooltip tooltip-bottom" data-tooltip-label="Apps" aria-label="Apps">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </div>
                    <div class="dropdown-panel z-50 mt-2 p-4 bg-base-100 border border-base-content/10 rounded-box w-64 right-0 mr-2 md:mr-4">
                        <div class="grid grid-cols-3 gap-2" data-app-menu-grid="desktop">
                            <div class="col-span-3 flex justify-center py-4 opacity-50"><span class="loading loading-spinner loading-sm"></span></div>
                        </div>
                    </div>
                </div>
            </li>

            <li data-nav-chrome="account" class="ml-1">
                <div class="relative p-0" data-dropdown="account">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle tooltip tooltip-bottom" data-tooltip-label="Account" aria-label="Account">
                        <div data-auth="nav-guest-avatar" class="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center">
                            <i class="fa-solid fa-user text-base-content/50 text-sm"></i>
                        </div>
                        <div data-auth="nav-authed-avatar" class="hidden w-9 h-9 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Profile" class="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div class="dropdown-panel z-50 mt-2 bg-base-100 border border-base-content/10 rounded-box w-64 right-0 mr-2 md:mr-4 overflow-hidden">
                        <div data-auth="nav-authed-header" class="hidden px-3 pt-3 pb-2 border-b border-base-content/10 cursor-default select-none">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-full overflow-hidden shrink-0"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-auth="nav-authed-header-avatar" class="w-full h-full object-cover" alt="Profile" /></div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold truncate text-sm" data-auth="nav-name"></div>
                                    <div class="text-xs opacity-60 truncate" data-auth="nav-email"></div>
                                </div>
                                <span class="badge badge-sm hidden" data-auth="nav-role"></span>
                            </div>
                        </div>
                        <div data-auth="nav-guest-header" class="px-3 pt-3 pb-2 border-b border-base-content/10 cursor-default select-none">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-user text-base-content/40"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold text-sm">Guest</div>
                                    <div class="text-xs opacity-60">Not signed in</div>
                                </div>
                            </div>
                        </div>
                        <div class="hidden px-3 py-1.5 border-b border-base-content/10" data-auth="credits-row">
                            <div class="flex items-center justify-between text-xs">
                                <span class="flex items-center gap-1.5 opacity-70">
                                    <span>🪙</span>
                                    <span data-auth="credits-balance">—</span>
                                    <span class="opacity-60">credits</span>
                                </span>
                                <span class="opacity-40 text-[10px]" data-auth="credits-reset"></span>
                            </div>
                        </div>
                        <ul class="menu p-2">
                            <li data-nav-chrome="theme">
                                <div class="flex items-center gap-2.5 px-2.5 py-2">
                                    <i class="fa-solid fa-circle-half-stroke w-4 text-center opacity-60"></i>
                                    <div id="theme-toggle" class="theme-switcher w-full bg-base-300/70 text-xs font-medium">
                                        <button data-theme-mode="light" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-sun mr-1"></i>Light</button>
                                        <button data-theme-mode="dark" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-moon mr-1"></i>Dark</button>
                                        <button data-theme-mode="auto" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-circle-half-stroke mr-1"></i>Auto</button>
                                    </div>
                                </div>
                            </li>
                            <li data-auth="login-item">
                                <a class="flex items-center gap-3" href="https://auth.dhanur.me/" data-auth="login-btn"><i class="fa-solid fa-right-to-bracket w-4 text-center"></i><span>Sign In</span></a>
                            </li>
                            <li class="hidden" data-auth="account-item">
                                <a class="flex items-center gap-3" href="https://auth.dhanur.me/"><i class="fa-solid fa-gear w-4 text-center"></i><span>Account Settings</span></a>
                            </li>
                            <li class="hidden border-t border-base-content/10 mt-1 pt-1" data-auth="logout-item">
                                <button type="button" class="w-full text-left flex items-center gap-3 text-error/80 hover:text-error" data-auth="logout-btn"><i class="fa-solid fa-right-from-bracket w-4 text-center"></i><span>Sign Out</span></button>
                            </li>
                        </ul>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</div>

<div id="shell-mobile-panel" class="fixed inset-0 z-[100] hidden" data-shell-mobile-panel>
    <div class="absolute inset-0 bg-black/50 transition-opacity" data-shell-mobile-backdrop></div>
    <div class="absolute top-0 left-0 bottom-0 w-72 bg-base-100 shadow-2xl flex flex-col overflow-y-auto transform -translate-x-full transition-transform duration-300" data-shell-mobile-drawer>
        <div class="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
            <a href="https://dhanur.me/" class="font-bold text-lg text-base-content no-underline hover:no-underline">dhanur.me</a>
            <button type="button" class="btn btn-ghost btn-circle btn-sm" data-shell-mobile-close aria-label="Close menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="px-4 py-4 border-b border-base-content/10" data-nav-chrome="apps">
            <div class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">Apps</div>
            <div class="grid grid-cols-3 gap-2" data-app-menu-grid="mobile">
                <div class="col-span-3 flex justify-center py-4 opacity-50"><span class="loading loading-spinner loading-sm"></span></div>
            </div>
        </div>
        <div class="px-4 py-3 border-b border-base-content/10" data-nav-chrome="account">
            <div class="flex items-center gap-3 mb-3">
                <div data-auth="mobile-guest-avatar" class="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-user text-base-content/50 text-sm"></i>
                </div>
                <div data-auth="mobile-authed-avatar" class="hidden w-9 h-9 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden shrink-0">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Profile" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate" data-auth="mobile-name">Guest</div>
                    <div class="text-xs opacity-60 truncate" data-auth="mobile-email">Not signed in</div>
                </div>
            </div>
            <div class="flex gap-2">
                <a href="https://auth.dhanur.me/" class="btn btn-primary btn-sm flex-1 no-underline hover:no-underline" data-auth="mobile-login-btn">Sign In</a>
                <button type="button" class="btn btn-ghost btn-sm flex-1 text-error/80 hover:text-error hidden" data-auth="mobile-logout-btn">Sign Out</button>
                <a href="https://auth.dhanur.me/" class="btn btn-ghost btn-sm flex-1 hidden no-underline hover:no-underline" data-auth="mobile-account-btn">Account</a>
            </div>
        </div>
        <div class="px-4 py-3" data-nav-chrome="theme">
            <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-circle-half-stroke w-4 text-center opacity-60"></i>
                <div class="theme-switcher w-full bg-base-300/70 text-xs font-medium">
                    <button data-theme-mode="light" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-sun mr-1"></i>Light</button>
                    <button data-theme-mode="dark" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-moon mr-1"></i>Dark</button>
                    <button data-theme-mode="auto" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-circle-half-stroke mr-1"></i>Auto</button>
                </div>
            </div>
        </div>
    </div>
</div>`;

function mountCanonicalShell() {
  const mountPoint = document.getElementById("dhanur-shell");
  const tempDiv = document.createElement("div");

  if (window.trustedTypes && window.__defaultPolicy) {
    tempDiv.innerHTML = window.__defaultPolicy.createHTML(CANONICAL_SHELL_HTML);
  } else {
    tempDiv.innerHTML = CANONICAL_SHELL_HTML;
  }

  if (mountPoint) {
    mountPoint.replaceChildren(...tempDiv.children);
  } else {
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
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

