/**
 * Authentication Integration
 * Handles Auth client loading and UI state syncing.
 */

import { appendScriptOnce } from "../core/resource-loader.js";

function getAuthClient() {
  if (!window.AUTH || typeof window.AUTH !== "object") return null;
  return window.AUTH;
}

function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function showElements(...elements) {
  elements.forEach((el) => el && el.classList.remove("hidden"));
}

function hideElements(...elements) {
  elements.forEach((el) => el && el.classList.add("hidden"));
}

function setText(el, value) {
  if (el) el.textContent = value;
}

function setSrc(el, value) {
  if (el) el.src = value;
}

function bindAll(root, selector, eventName, handler, options) {
  const elements = root.querySelectorAll(selector);
  elements.forEach((el) => el.addEventListener(eventName, handler, options));
}

// function updateCreditsUI(drawerElement, credits) {
function updateCreditsUI() {
  // Update credit badges/counters if applicable
}

function injectAuthSDK(callback) {
  const done = once(callback);
  if (getAuthClient()) {
    done();
    return;
  }

  document.addEventListener("authReady", done, { once: true });

  appendScriptOnce({
    src: "https://auth.dhanur.me/auth-client.js",
    selector: 'script[src*="auth-client.js"]',
    defer: true,
    onLoad: () => {
      const auth = getAuthClient();
      if (auth && typeof auth.onReady === "function") {
        auth.onReady(() => done());
      } else {
        done();
      }
    },
    onError: () => {
      console.warn("[Auth] Could not load auth-client.js");
    },
  });

  window.setTimeout(() => {
    if (getAuthClient()) done();
  }, 2000);
}

export function initAuth(drawerElement = document, onAuthResolved = null) {
  if (drawerElement.__authIntegrationBound) return;
  drawerElement.__authIntegrationBound = true;

  injectAuthSDK(() => {
    const auth = getAuthClient();
    if (!auth) return;

    // DOM references
    const r = {
      navGuestAvatar: drawerElement.querySelector('[data-auth="guest-avatar"]'),
      navAuthedAvatar: drawerElement.querySelector(
        '[data-auth="authed-avatar"]',
      ),
      navAvatarImg: drawerElement.querySelector('[data-auth="avatar-img"]'),
      navAuthedHeaderImg: drawerElement.querySelector(
        '[data-auth="authed-header-img"]',
      ),
      navName: drawerElement.querySelector('[data-auth="user-name"]'),
      navEmail: drawerElement.querySelector('[data-auth="user-email"]'),
      navLoginItem: drawerElement.querySelector('[data-auth="nav-login-item"]'),
      navAccountItem: drawerElement.querySelector(
        '[data-auth="nav-account-item"]',
      ),
      navLogoutItem: drawerElement.querySelector(
        '[data-auth="nav-logout-item"]',
      ),
      navGuestHeader: drawerElement.querySelector('[data-auth="guest-header"]'),
      navAuthedHeader: drawerElement.querySelector(
        '[data-auth="authed-header"]',
      ),
    };

    function updateUI(status) {
      if (!status) return;
      const authed = status.authenticated;
      const user = status.user;
      const avatarUrl = user?.avatar_url || "";
      const userName = user?.name || "User";

      if (authed && user) {
        hideElements(r.navGuestAvatar, r.navGuestHeader, r.navLoginItem);
        showElements(
          r.navAuthedAvatar,
          r.navAuthedHeader,
          r.navAccountItem,
          r.navLogoutItem,
        );
        setSrc(r.navAvatarImg, avatarUrl);
        setSrc(r.navAuthedHeaderImg, avatarUrl);
        setText(r.navName, userName);
        setText(r.navEmail, user.email || "");

        try {
          if (avatarUrl)
            localStorage.setItem("dhanur_avatar_url_v1", avatarUrl);
        } catch {
          // err
        }

        updateCreditsUI(drawerElement, status.credits || null);
      } else {
        showElements(r.navGuestAvatar, r.navGuestHeader, r.navLoginItem);
        hideElements(
          r.navAuthedAvatar,
          r.navAuthedHeader,
          r.navAccountItem,
          r.navLogoutItem,
        );
      }

      if (typeof onAuthResolved === "function") {
        onAuthResolved(status);
      }
    }

    // Initialize UI on SDK load
    if (typeof auth.onReady === "function") {
      auth.onReady((payload) =>
        updateUI(payload?.status || payload || auth.status || null),
      );
    } else if (auth.status) {
      updateUI(auth.status);
    }

    // Listeners for SDK state changes
    document.addEventListener("authChanged", (e) => updateUI(e.detail));
    document.addEventListener("creditsChanged", (e) =>
      updateCreditsUI(drawerElement, e.detail),
    );

    // Click Bindings
    bindAll(
      drawerElement,
      '[data-auth="login-btn"], [data-auth="sidebar-login-btn"]',
      "click",
      (e) => {
        e.preventDefault();
        if (typeof auth.login === "function") auth.login();
      },
    );

    bindAll(
      drawerElement,
      '[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"]',
      "click",
      (e) => {
        e.preventDefault();
        if (typeof auth.logout === "function") auth.logout();
      },
    );

    // Intercept cross-origin messages from the OAuth popup
    window.addEventListener("message", async (event) => {
      const trustedOrigins = ["https://auth.dhanur.me"];
      if (!trustedOrigins.includes(event.origin)) return;
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "auth-login-success") {
        // Force the SDK to fetch the latest session set by the callback cookies
        if (auth && typeof auth.refresh === "function") {
          const freshStatus = await auth.refresh();
          updateUI(freshStatus);
        } else {
          // Fallback manual fetch if the SDK does not expose refresh()
          try {
            const res = await fetch("https://auth.dhanur.me/api/session", {
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              updateUI(data);
              document.dispatchEvent(
                new CustomEvent("authChanged", { detail: data }),
              );
            }
          } catch (err) {
            console.error(
              "[Auth] Background session synchronization failed:",
              err,
            );
          }
        }

        // Send confirmation back to popup so it safely terminates
        if (event.source) {
          event.source.postMessage({ type: "auth-ack-close" }, event.origin);
        }
      }
    });
  });
}
