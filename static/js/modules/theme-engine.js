/**
 * Theme Engine (Light/Dark/Auto)
 */
import { COOKIE_DOMAIN } from './config.js';
import { readCookie, writeCookie } from './cookie-utils.js';

const THEME_MAP = { dark: "dark", light: "light" };
const MODE_CYCLE = ["auto", "light", "dark"];

let _currentMode = "auto";
let _mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function getCookie() {
  if (window.__getThemeCookie) return window.__getThemeCookie();
  return readCookie("theme") || null;
}

function setCookie(val) {
  if (window.__setThemeCookie) { window.__setThemeCookie(val); return; }
  writeCookie("theme", val, {
    maxAgeSeconds: 31536000,
    domain: COOKIE_DOMAIN || undefined,
    path: "/",
    sameSite: "Lax",
    secure: window.location.protocol === "https:",
  });
}

function resolveColorset(val) {
  if (window.__resolveColorset) return window.__resolveColorset(val);
  if (val === "auto") {
    return (_mediaQuery && _mediaQuery.matches) ? "dark" : "light";
  }
  return val;
}

function applyTheme(resolvedTheme) {
  const daisyTheme = THEME_MAP[resolvedTheme] || resolvedTheme;
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

  document.querySelectorAll(".logo-dark").forEach(el => el.classList.toggle("invisible", resolvedTheme !== "dark"));
  document.querySelectorAll(".logo-light").forEach(el => el.classList.toggle("invisible", resolvedTheme !== "light"));

  // Hero images (landing page)
  document.querySelectorAll(".hero-dark").forEach(el => el.classList.toggle("hidden", resolvedTheme !== "dark"));
  document.querySelectorAll(".hero-light").forEach(el => el.classList.toggle("hidden", resolvedTheme !== "light"));
}

function updateToggleUI() {
  document.querySelectorAll(".theme-switcher").forEach(sw => {
    sw.querySelectorAll("[data-theme-mode]").forEach(btn => {
      const mode = btn.getAttribute("data-theme-mode");
      const isActive = mode === _currentMode;

      // Active: visible highlight
      btn.style.background = isActive
        ? "color-mix(in oklab, var(--color-base-content) 20%, transparent)"
        : "";
      btn.style.boxShadow = isActive
        ? "0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent)"
        : "";
      btn.style.opacity = isActive ? "1" : "0.55";
    });
  });
}

function setMode(mode) {
  _currentMode = mode;
  setCookie(mode);
  const resolved = resolveColorset(mode);
  applyTheme(resolved);
  updateToggleUI();
  document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolved }));
}

export function initTheme(rootElement = document) {
  _currentMode = getCookie() || "auto";
  if (!MODE_CYCLE.includes(_currentMode)) _currentMode = "auto";

  const resolved = resolveColorset(_currentMode);
  applyTheme(resolved);
  updateToggleUI();
  document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolved }));

  rootElement.querySelectorAll(".theme-switcher [data-theme-mode]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const mode = btn.getAttribute("data-theme-mode");
      if (mode && mode !== _currentMode) setMode(mode);
    });
  });

  if (_mediaQuery) {
    const osChangeHandler = () => {
      if (_currentMode === "auto") {
        const resolvedAuto = resolveColorset("auto");
        applyTheme(resolvedAuto);
        updateToggleUI();
        document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolvedAuto }));
      }
    };
    if (_mediaQuery.addEventListener) _mediaQuery.addEventListener("change", osChangeHandler);
    else if (_mediaQuery.addListener) _mediaQuery.addListener(osChangeHandler);
  }
}
