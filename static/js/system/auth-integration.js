/**
 * Authentication Integration
 * Handles Auth client loading and UI state syncing across root and subdomains.
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

// Robust unwrapping for single nodes, Arrays, or NodeLists
function showElements(...items) {
  items.forEach((item) => {
    if (!item) return;
    if (item instanceof NodeList || Array.isArray(item)) {
      item.forEach((el) => el && el.classList.remove("hidden"));
    } else if (item.classList) {
      item.classList.remove("hidden");
    }
  });
}

function hideElements(...items) {
  items.forEach((item) => {
    if (!item) return;
    if (item instanceof NodeList || Array.isArray(item)) {
      item.forEach((el) => el && el.classList.add("hidden"));
    } else if (item.classList) {
      item.classList.add("hidden");
    }
  });
}

function setText(item, value) {
  if (!item) return;
  if (item instanceof NodeList || Array.isArray(item)) {
    item.forEach((el) => {
      if (el) el.textContent = value;
    });
  } else if (item.nodeType) {
    item.textContent = value;
  }
}

function setSrc(item, value) {
  if (!item) return;
  if (item instanceof NodeList || Array.isArray(item)) {
    item.forEach((el) => {
      if (!el) return;
      if (value) {
        el.src = value;
      } else {
        el.removeAttribute("src");
      }
    });
  } else if (item.nodeType) {
    if (value) {
      item.src = value;
    } else {
      item.removeAttribute("src");
    }
  }
}

function updateCreditsUI(root, credits) {
  const rows = root.querySelectorAll(
    '[data-auth="credits-row"], [data-auth="sidebar-credits-row"]',
  );
  const balances = root.querySelectorAll(
    '[data-auth="credits-balance"], [data-auth="sidebar-credits-balance"]',
  );
  const resets = root.querySelectorAll(
    '[data-auth="credits-reset"], [data-auth="sidebar-credits-reset"]',
  );

  if (!credits || rows.length === 0) {
    hideElements(rows);
    return;
  }

  showElements(rows);
  if (credits.unlimited || credits.balance === -1) {
    setText(balances, "∞");
    setText(resets, "Admin");
  } else {
    setText(balances, String(credits.balance ?? "—"));
    if (credits.periodEnd) {
      try {
        const d = new Date(credits.periodEnd);
        setText(
          resets,
          `resets ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
        );
      } catch {
        setText(resets, "");
      }
    } else {
      setText(resets, "");
    }
  }
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
      done();
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

    // Comprehensive node mapping covering Desktop Navbars, Subdomain Panels, and Root Domain Sidebars
    const r = {
      navGuestAvatar: drawerElement.querySelectorAll(
        '[data-auth="nav-guest-avatar"], [data-auth="mobile-guest-avatar"], [data-auth="sidebar-guest-avatar"]',
      ),
      navAuthedAvatar: drawerElement.querySelectorAll(
        '[data-auth="nav-authed-avatar"], [data-auth="mobile-authed-avatar"], [data-auth="sidebar-authed-avatar"]',
      ),
      navAvatarImg: drawerElement.querySelectorAll(
        '[data-auth="nav-authed-avatar"] img, [data-auth="mobile-authed-avatar"] img, [data-auth="sidebar-authed-avatar"] img',
      ),
      navAuthedHeaderImg: drawerElement.querySelectorAll(
        '[data-auth="nav-authed-header-avatar"], [data-auth="mobile-authed-header-avatar"]',
      ),
      navName: drawerElement.querySelectorAll(
        '[data-auth="nav-name"], [data-auth="mobile-name"], [data-auth="sidebar-name"]',
      ),
      navEmail: drawerElement.querySelectorAll(
        '[data-auth="nav-email"], [data-auth="mobile-email"], [data-auth="sidebar-email"]',
      ),
      navLoginItem: drawerElement.querySelectorAll(
        '[data-auth="login-item"], [data-auth="mobile-login-btn"], [data-auth="sidebar-login-btn"]',
      ),
      navAccountItem: drawerElement.querySelectorAll(
        '[data-auth="account-item"], [data-auth="mobile-account-btn"], [data-auth="sidebar-account-btn"]',
      ),
      navLogoutItem: drawerElement.querySelectorAll(
        '[data-auth="logout-item"], [data-auth="mobile-logout-btn"], [data-auth="sidebar-logout-btn"]',
      ),
      navGuestHeader: drawerElement.querySelectorAll(
        '[data-auth="nav-guest-header"], [data-auth="mobile-guest-header"]',
      ),
      navAuthedHeader: drawerElement.querySelectorAll(
        '[data-auth="nav-authed-header"], [data-auth="mobile-authed-header"]',
      ),
      navRoleBadge: drawerElement.querySelectorAll('[data-auth="nav-role"]'),
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
          r.navRoleBadge,
        );
        setSrc(r.navAvatarImg, avatarUrl);
        setSrc(r.navAuthedHeaderImg, avatarUrl);
        setText(r.navName, userName);
        setText(r.navEmail, user.email || "");
        setText(r.navRoleBadge, status.role || "user");

        try {
          if (avatarUrl)
            localStorage.setItem("dhanur_avatar_url_v1", avatarUrl);
        } catch {
          /* ignore */
        }

        updateCreditsUI(drawerElement, status.credits || null);
      } else {
        showElements(r.navGuestAvatar, r.navGuestHeader, r.navLoginItem);
        hideElements(
          r.navAuthedAvatar,
          r.navAuthedHeader,
          r.navAccountItem,
          r.navLogoutItem,
          r.navRoleBadge,
        );
      }

      if (typeof onAuthResolved === "function") {
        onAuthResolved(status);
      }
    }

    if (typeof auth.onReady === "function") {
      auth.onReady((payload) =>
        updateUI(payload?.status || payload || auth.status || null),
      );
    } else if (auth.status) {
      updateUI(auth.status);
    }

    document.addEventListener("authChanged", (e) => updateUI(e.detail));
    document.addEventListener("creditsChanged", (e) =>
      updateCreditsUI(drawerElement, e.detail),
    );
  });
}

export function openAuthLoginPopup(url = "https://auth.dhanur.me/login?popup=true") {
  const auth = getAuthClient();
  if (auth && typeof auth.login === "function") {
    auth.login();
    return;
  }
  const w = 500;
  const h = 700;
  const left = Math.max(0, Math.round((screen.width - w) / 2));
  const top = Math.max(0, Math.round((screen.height - h) / 2));
  const popup = window.open(
    url,
    "authy_popup",
    `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,status=no,resizable=yes,scrollbars=yes`,
  );
  if (popup && !popup.closed) {
    try {
      popup.focus();
    } catch {}
  }
}

if (typeof window !== "undefined") {
  window.openAuthLoginPopup = openAuthLoginPopup;
}

// Global Event Delegation for all authentication triggers (bound immediately, not deferred)
if (typeof document !== "undefined" && !document.__authClickDelegated) {
  document.__authClickDelegated = true;
  document.addEventListener("click", (e) => {
    const loginTarget = e.target.closest(
      '[data-auth="login-btn"], [data-auth="sidebar-login-btn"], [data-auth="mobile-login-btn"]',
    );
    if (loginTarget) {
      e.preventDefault();
      openAuthLoginPopup();
      return;
    }

    const logoutTarget = e.target.closest(
      '[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"], [data-auth="mobile-logout-btn"]',
    );
    if (logoutTarget) {
      e.preventDefault();
      const auth = getAuthClient();
      if (auth && typeof auth.logout === "function") {
        auth.logout();
      } else {
        fetch("https://auth.dhanur.me/api/auth/logout", {
          method: "POST",
          credentials: "include",
          mode: "cors",
        }).catch(() => {});
        document.dispatchEvent(
          new CustomEvent("authChanged", {
            detail: {
              authenticated: false,
              role: "guest",
              user: null,
              credits: null,
            },
          }),
        );
      }
      return;
    }
  });
}

// Intercept cross-origin callbacks securely across domain boundaries (bound immediately)
if (typeof window !== "undefined" && !window.__authMessageBound) {
  window.__authMessageBound = true;
  window.addEventListener("message", async (event) => {
    const isTrustedOrigin =
      event.origin === "https://auth.dhanur.me" ||
      event.origin === "https://dhanur.me" ||
      event.origin.endsWith(".dhanur.me") ||
      event.origin.startsWith("http://localhost:");

    if (!isTrustedOrigin) return;
    if (!event.data || typeof event.data !== "object") return;

    if (
      event.data.type === "auth-login-success" ||
      event.data.type === "auth-upgrade-success"
    ) {
      const auth = getAuthClient();
      let statusData = null;
      if (auth && typeof auth.refresh === "function") {
        statusData = await auth.refresh();
      } else {
        try {
          const res = await fetch("https://auth.dhanur.me/api/status", {
            credentials: "include",
          });
          if (res.ok) {
            statusData = await res.json();
          }
        } catch (err) {
          console.error(
            "[Auth] Background session synchronization failed:",
            err,
          );
        }
      }

      if (statusData) {
        document.dispatchEvent(
          new CustomEvent("authChanged", { detail: statusData }),
        );
      }

      if (event.source) {
        try {
          event.source.postMessage({ type: "auth-ack-close" }, event.origin);
        } catch {}
      }
    }
  });
}
