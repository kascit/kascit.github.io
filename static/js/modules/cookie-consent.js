/**
 * Cookie consent manager.
 * Modes:
 * - necessary: only required cookies/features
 * - all: required + optional integrations (analytics, error monitoring, comments)
 */

import { getConfig } from "./config.js";
import { readCookie, writeCookie } from "./cookie-utils.js";
import { initGtag } from "../gtag-init.js";
import { appendScriptOnce } from "./resource-loader.js";

const CONSENT_COOKIE_KEY = "site_cookie_consent_v1";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const CONSENT_ALL = "all";
const CONSENT_NECESSARY = "necessary";

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

function loadGoogleAnalytics(gtagId) {
  if (!gtagId) return;

  appendScriptOnce({
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`,
    async: true,
    crossOrigin: "anonymous",
    onLoad: () => {
      if (window.__gtagInitialized) return;
      if (initGtag(gtagId)) {
        window.__gtagInitialized = true;
      }
    },
  });
}

function loadSentry(scriptUrl) {
  if (!scriptUrl || window.__sentryInitialized) return;

  appendScriptOnce({
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

  writeCookie(CONSENT_COOKIE_KEY, choice, {
    maxAgeSeconds: CONSENT_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "Lax",
    secure: window.location.protocol === "https:",
  });
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
