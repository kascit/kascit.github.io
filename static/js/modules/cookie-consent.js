/**
 * Cookie consent manager.
 * Modes:
 * - necessary: only required cookies/features
 * - all: required + optional integrations (analytics, error monitoring, comments)
 */

import { getConfig } from "./config.js";

const CONSENT_COOKIE_KEY = "site_cookie_consent_v1";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const CONSENT_ALL = "all";
const CONSENT_NECESSARY = "necessary";

function readCookie(name) {
  const key = `${name}=`;
  const parts = document.cookie ? document.cookie.split(";") : [];
  for (const part of parts) {
    const item = part.trim();
    if (item.startsWith(key)) {
      return decodeURIComponent(item.slice(key.length));
    }
  }
  return "";
}

function writeCookie(name, value, maxAgeSeconds) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function getDomainCandidates() {
  const host = window.location.hostname;
  const candidates = ["", host, `.${host}`];
  const parts = host.split(".");
  if (parts.length >= 2) {
    const apex = `.${parts.slice(-2).join(".")}`;
    if (!candidates.includes(apex)) candidates.push(apex);
  }
  return candidates;
}

function clearAnalyticsCookies() {
  const cookieNames = (document.cookie || "")
    .split(";")
    .map((item) => item.trim().split("=")[0])
    .filter((name) => /^_ga($|_)/.test(name) || /^_gid$/.test(name) || /^_gat/.test(name));

  if (cookieNames.length === 0) return;

  const domains = getDomainCandidates();
  for (const name of cookieNames) {
    for (const domain of domains) {
      const domainPart = domain ? `; Domain=${domain}` : "";
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domainPart}`;
    }
  }
}

function appendScript({ src, async = true, defer = false, crossOrigin = "anonymous", onLoad }) {
  if (!src) return;
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (typeof onLoad === "function") onLoad();
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = async;
  script.defer = defer;
  if (crossOrigin) script.crossOrigin = crossOrigin;
  if (typeof onLoad === "function") {
    script.addEventListener("load", onLoad, { once: true });
  }
  document.head.appendChild(script);
}

function initGtag(gtagId) {
  if (!gtagId || window.__gtagInitialized) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  gtag("js", new Date());
  gtag("config", gtagId);
  window.__gtagInitialized = true;
}

function loadGoogleAnalytics(gtagId) {
  if (!gtagId) return;

  appendScript({
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`,
    async: true,
    crossOrigin: "anonymous",
    onLoad: () => initGtag(gtagId),
  });
}

function loadSentry(scriptUrl) {
  if (!scriptUrl || window.__sentryInitialized) return;

  appendScript({
    src: scriptUrl,
    async: true,
    crossOrigin: "anonymous",
    onLoad: () => {
      if (!window.Sentry) return;

      window.Sentry.init({
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      window.__sentryInitialized = true;
    },
  });
}

function isValidChoice(value) {
  return value === CONSENT_ALL || value === CONSENT_NECESSARY;
}

function getSavedChoice() {
  const choice = readCookie(CONSENT_COOKIE_KEY);
  return isValidChoice(choice) ? choice : "";
}

function applyChoice(choice, config) {
  if (choice === CONSENT_ALL) {
    loadGoogleAnalytics(config.gtagId || "");
    loadSentry(config.sentryScriptUrl || "");
    return;
  }

  clearAnalyticsCookies();
}

function setBannerVisible(visible) {
  const banner = document.querySelector("[data-cookie-consent-banner]");
  if (!banner) return;
  banner.classList.toggle("hidden", !visible);
}

function updateConsentStatusUi(choice) {
  const text = choice === CONSENT_ALL
    ? "All cookies allowed"
    : choice === CONSENT_NECESSARY
    ? "Necessary only"
    : "Necessary only (default)";
  document.querySelectorAll("[data-cookie-consent-status]").forEach((node) => {
    node.textContent = text;
  });
}

function emitConsentEvent(choice) {
  document.dispatchEvent(
    new CustomEvent("cookieConsentChanged", {
      detail: {
        choice,
        optional: choice === CONSENT_ALL,
      },
    })
  );
}

export function hasOptionalConsent() {
  return getSavedChoice() === CONSENT_ALL;
}

export function setCookieConsent(choice) {
  if (!isValidChoice(choice)) return;

  writeCookie(CONSENT_COOKIE_KEY, choice, CONSENT_COOKIE_MAX_AGE);
  const config = getConfig();
  applyChoice(choice, config);
  updateConsentStatusUi(choice);
  setBannerVisible(false);
  emitConsentEvent(choice);
}

function bindConsentActions() {
  if (document.body.getAttribute("data-cookie-consent-bound") === "1") return;
  document.body.setAttribute("data-cookie-consent-bound", "1");

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-cookie-consent-action]");
    if (!target) return;

    const action = target.getAttribute("data-cookie-consent-action");
    if (action === CONSENT_ALL) {
      setCookieConsent(CONSENT_ALL);
    } else if (action === CONSENT_NECESSARY) {
      setCookieConsent(CONSENT_NECESSARY);
    }
  });
}

export function initCookieConsent() {
  const config = getConfig();
  const choice = getSavedChoice();

  bindConsentActions();

  if (!choice) {
    // Necessary mode is always active as baseline; optional services remain disabled.
    applyChoice(CONSENT_NECESSARY, config);
    updateConsentStatusUi("");
    emitConsentEvent(CONSENT_NECESSARY);
    setBannerVisible(true);
    return;
  }

  setBannerVisible(false);
  updateConsentStatusUi(choice);
  applyChoice(choice, config);
  emitConsentEvent(choice);
}
