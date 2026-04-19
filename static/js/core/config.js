/**
 * Centralized Configuration Loader
 * Supports both Zola native JSON config (via <script id="site-config">)
 * and backward-compatible window.SiteNavConfig for external subdomains.
 */

export function getConfig() {
  if (window.__siteConfig) return window.__siteConfig;
  
  // 1. Try to load native Zola JSON payload
  const jsonEl = document.getElementById("site-config");
  if (jsonEl) {
    try {
      window.__siteConfig = JSON.parse(jsonEl.textContent);
      return window.__siteConfig;
    } catch (e) {
      console.error("[SiteConfig] Failed to parse JSON config", e);
    }
  }

  // 2. Fallback for shell.js / external subdomain implementations
  window.__siteConfig = window.SiteNavConfig || {};
  return window.__siteConfig;
}

export const BASE_URL = "https://dhanur.me";

export const COOKIE_DOMAIN = (() => {
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") return "";
  const parts = h.split(".");
  return parts.length >= 2 ? "." + parts.slice(-2).join(".") : "";
})();
