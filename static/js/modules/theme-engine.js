/**
 * Theme Engine (Light/Dark/Auto)
 */
import { COOKIE_DOMAIN } from './config.js';
import { readCookie, writeCookie } from './cookie-utils.js';

const THEME_MAP = { dark: "dark", light: "light" };
const MODE_CYCLE = ["auto", "light", "dark"];
const THEME_CANVAS_MAP = { dark: "#010409", light: "#f6f8fa" };
const THEME_TRANSITION_MS = 240;

let _currentMode = "auto";
let _mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
let _themeTransitionTimer = null;

function normalizeThemeMode(value, fallback = "auto") {
  const normalized = String(value || "").trim().toLowerCase();
  if (MODE_CYCLE.includes(normalized)) return normalized;
  if (normalized.includes("dark")) return "dark";
  if (normalized.includes("light")) return "light";
  return fallback;
}

function getCookie() {
  const raw = window.__getThemeCookie ? window.__getThemeCookie() : (readCookie("theme") || null);
  return normalizeThemeMode(raw, "auto");
}

function setCookie(val) {
  const normalized = normalizeThemeMode(val, "auto");
  if (window.__setThemeCookie) { window.__setThemeCookie(normalized); return; }
  writeCookie("theme", normalized, {
    maxAgeSeconds: 31536000,
    domain: COOKIE_DOMAIN || undefined,
    path: "/",
    sameSite: "Lax",
    secure: window.location.protocol === "https:",
  });
}

function resolveColorset(val) {
  const mode = normalizeThemeMode(val, "auto");
  if (window.__resolveColorset) return window.__resolveColorset(mode);
  if (mode === "auto") {
    return (_mediaQuery && _mediaQuery.matches) ? "dark" : "light";
  }
  return mode;
}

function applyTheme(resolvedTheme) {
  const daisyTheme = THEME_MAP[resolvedTheme] || resolvedTheme;
  document.documentElement.setAttribute("data-theme", daisyTheme);
  document.documentElement.style.backgroundColor = THEME_CANVAS_MAP[resolvedTheme] || THEME_CANVAS_MAP.dark;
  
  if (resolvedTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
  function setVisualState(selector, visible) {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.remove("hidden", "invisible");
      el.style.opacity = visible ? "1" : "0";
      el.style.visibility = visible ? "visible" : "hidden";
      el.style.pointerEvents = visible ? "" : "none";
    });
  }

  // Crossfade logo and hero theme variants instead of hard hide/show.
  setVisualState(".logo-dark", resolvedTheme === "dark");
  setVisualState(".logo-light", resolvedTheme === "light");
  setVisualState(".hero-dark", resolvedTheme === "dark");
  setVisualState(".hero-light", resolvedTheme === "light");
}

function beginThemeTransition() {
  const root = document.documentElement;
  root.classList.add("is-theme-switching");
  if (_themeTransitionTimer) {
    window.clearTimeout(_themeTransitionTimer);
  }
  _themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove("is-theme-switching");
    _themeTransitionTimer = null;
  }, THEME_TRANSITION_MS);
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
  beginThemeTransition();
  const resolved = resolveColorset(mode);
  applyTheme(resolved);
  updateToggleUI();
  document.dispatchEvent(new CustomEvent("themeChanged", { detail: resolved }));
}

export function getThemeMode() {
  return _currentMode;
}

export function getResolvedTheme() {
  const mode = normalizeThemeMode(_currentMode, "auto");
  return resolveColorset(mode);
}

export function setThemeMode(mode) {
  const normalized = String(mode || "").trim().toLowerCase();
  if (!MODE_CYCLE.includes(normalized)) {
    throw new Error(`Unsupported theme mode: ${mode}`);
  }

  if (normalized !== _currentMode) {
    setMode(normalized);
  }

  return _currentMode;
}

export function cycleThemeMode() {
  const currentIndex = MODE_CYCLE.indexOf(_currentMode);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const nextMode = MODE_CYCLE[(safeIndex + 1) % MODE_CYCLE.length];
  setMode(nextMode);
  return _currentMode;
}

export function initTheme(rootElement = document) {
  _currentMode = normalizeThemeMode(getCookie(), "auto");

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
        beginThemeTransition();
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
