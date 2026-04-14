/**
 * Authentication Integration
 * Handles Auth client loading and UI state syncing.
 */

import { appendScriptOnce } from "./resource-loader.js";

function getAuthClient() {
  if (!window.AUTH || typeof window.AUTH !== "object") return null;
  return window.AUTH;
}

function once(fn) {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    fn(...args);
  };
}

function pickFirst(...nodes) {
  return nodes.find(Boolean) || null;
}

function showElements(...elements) {
  elements.forEach((el) => el?.classList.remove("hidden"));
}

function hideElements(...elements) {
  elements.forEach((el) => el?.classList.add("hidden"));
}

function setText(el, value) {
  if (el) el.textContent = value;
}

function setSrc(el, value) {
  if (el) el.src = value;
}

function bindAll(root, selector, eventName, handler, options) {
  root.querySelectorAll(selector).forEach((node) => {
    node.addEventListener(eventName, handler, options);
  });
}

// Auto-inject auth-client.js from auth.dhanur.me
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

function formatCreditsReset(periodEnd) {
  if (!periodEnd) return "";
  try {
    const d = new Date(periodEnd);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `resets ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  } catch (e) { return ""; }
}

function updateCreditsUI(drawer, credits) {
  if (!credits) return;
  const isUnlimited = credits.unlimited || credits.balance === -1;
  const balanceText = isUnlimited ? "∞" : String(credits.balance);
  const resetText = isUnlimited ? "" : formatCreditsReset(credits.periodEnd);

  // Desktop
  const creditsRow = drawer.querySelector('[data-auth="credits-row"]');
  if (creditsRow) {
    creditsRow.classList.remove("hidden");
    const b = creditsRow.querySelector('[data-auth="credits-balance"]');
    const r = creditsRow.querySelector('[data-auth="credits-reset"]');
    if (b) b.textContent = balanceText;
    if (r) r.textContent = resetText;
  }

  // Mobile
  const sidebarRow = drawer.querySelector('[data-auth="sidebar-credits-row"]');
  if (sidebarRow) {
    sidebarRow.classList.remove("hidden");
    const sb = sidebarRow.querySelector('[data-auth="sidebar-credits-balance"]');
    const sr = sidebarRow.querySelector('[data-auth="sidebar-credits-reset"]');
    if (sb) sb.textContent = balanceText;
    if (sr) sr.textContent = resetText;
  }
}

function hideCreditsUI(drawer) {
  drawer.querySelector('[data-auth="credits-row"]')?.classList.add("hidden");
  drawer.querySelector('[data-auth="sidebar-credits-row"]')?.classList.add("hidden");
}

export function initAuth(drawerElement = document) {
  if (drawerElement.__authIntegrationBound) return;
  drawerElement.__authIntegrationBound = true;

  injectAuthSDK(() => {
    const auth = getAuthClient();
    if (!auth) return;

    const navbarRoot = drawerElement.querySelector(".navbar");
    const sidebarRoot = drawerElement.querySelector("[data-sidebar-root]") || drawerElement.querySelector("#sidebar");
    const sidebarAccountRoot = drawerElement.querySelector("[data-sidebar-account]");
    
    const r = {
      navGuestAvatar: pickFirst(
        drawerElement.querySelector('[data-auth="nav-guest-avatar"]'),
        navbarRoot?.querySelector('[data-dropdown="account"] .bg-base-300')
      ),
      navAuthedAvatar: pickFirst(
        drawerElement.querySelector('[data-auth="nav-authed-avatar"]'),
        navbarRoot?.querySelector('[data-dropdown="account"] .ring-primary')
      ),
      navAvatarImg: pickFirst(
        drawerElement.querySelector('[data-auth="nav-authed-avatar"] img'),
        navbarRoot?.querySelector('[data-dropdown="account"] .ring-primary img')
      ),
      navAuthedHeader: pickFirst(
        drawerElement.querySelector('[data-auth="nav-authed-header"]'),
        navbarRoot?.querySelector('.dropdown-panel [data-auth="nav-name"]')?.closest('.border-b')
      ),
      navGuestHeader: pickFirst(
        drawerElement.querySelector('[data-auth="nav-guest-header"]'),
        navbarRoot?.querySelector('.dropdown-panel .fa-user')?.closest('.border-b')
      ),
      navAuthedHeaderImg: drawerElement.querySelector('[data-auth="nav-authed-header-avatar"]'),
      navName: pickFirst(
        drawerElement.querySelector('[data-auth="nav-name"]'),
        navbarRoot?.querySelector('[data-auth="name"]')
      ),
      navEmail: pickFirst(
        drawerElement.querySelector('[data-auth="nav-email"]'),
        navbarRoot?.querySelector('[data-auth="email"]')
      ),
      navRole: pickFirst(
        drawerElement.querySelector('[data-auth="nav-role"]'),
        navbarRoot?.querySelector('[data-auth="role"]')
      ),
      navLoginItem: navbarRoot?.querySelector('[data-auth="login-item"]') || null,
      navAccountItem: navbarRoot?.querySelector('[data-auth="account-item"]') || null,
      navLogoutItem: navbarRoot?.querySelector('[data-auth="logout-item"]') || null,
      
      sidebarGuestAvatar: pickFirst(
        drawerElement.querySelector('[data-auth="sidebar-guest-avatar"]'),
        sidebarAccountRoot?.querySelector('.bg-base-300')
      ),
      sidebarAuthedAvatar: pickFirst(
        drawerElement.querySelector('[data-auth="sidebar-authed-avatar"]'),
        sidebarAccountRoot?.querySelector('.ring-primary')
      ),
      sidebarAvatarImg: pickFirst(
        drawerElement.querySelector('[data-auth="sidebar-authed-avatar"] img'),
        sidebarAccountRoot?.querySelector('.ring-primary img')
      ),
      sidebarName: pickFirst(
        drawerElement.querySelector('[data-auth="sidebar-name"]'),
        sidebarAccountRoot?.querySelector('.font-semibold')
      ),
      sidebarEmail: pickFirst(
        drawerElement.querySelector('[data-auth="sidebar-email"]'),
        sidebarAccountRoot?.querySelector('.text-xs.opacity-60')
      ),
      sidebarLoginBtn: sidebarRoot?.querySelector('[data-auth="sidebar-login-btn"]') || null,
      sidebarLogoutBtn: sidebarRoot?.querySelector('[data-auth="sidebar-logout-btn"]') || null,
      sidebarAccountBtn: sidebarRoot?.querySelector('[data-auth="sidebar-account-btn"]') || null
    };

    function updateUI(status) {
      if (!status) return;
      const authed = status.authenticated;
      const user = status.user;
      const avatarUrl = user?.avatar_url || "";
      const userName = user?.name || "User";
      
      if (authed && user) {
        hideElements(r.navGuestAvatar, r.navGuestHeader, r.navLoginItem);
        showElements(r.navAuthedAvatar, r.navAuthedHeader, r.navAccountItem, r.navLogoutItem);
        setSrc(r.navAvatarImg, avatarUrl);
        
        setSrc(r.navAuthedHeaderImg, avatarUrl);
        
        setText(r.navName, userName);
        setText(r.navEmail, user.email || "");
        
        if (r.navRole) {
          const role = status.role || "user";
          r.navRole.textContent = role.toUpperCase();
          r.navRole.className = role === "admin" ? "badge badge-sm badge-error" : "badge badge-sm badge-success";
          showElements(r.navRole);
        }

        hideElements(r.sidebarGuestAvatar, r.sidebarLoginBtn);
        showElements(r.sidebarAuthedAvatar, r.sidebarLogoutBtn, r.sidebarAccountBtn);
        setSrc(r.sidebarAvatarImg, avatarUrl);
        setText(r.sidebarName, userName);
        setText(r.sidebarEmail, user.email || "");
        
        updateCreditsUI(drawerElement, status.credits || null);
      } else {
        showElements(r.navGuestAvatar, r.navGuestHeader, r.navLoginItem);
        hideElements(r.navAuthedAvatar, r.navAuthedHeader, r.navRole, r.navAccountItem, r.navLogoutItem);

        showElements(r.sidebarGuestAvatar, r.sidebarLoginBtn);
        hideElements(r.sidebarAuthedAvatar, r.sidebarLogoutBtn, r.sidebarAccountBtn);
        setText(r.sidebarName, "Guest");
        setText(r.sidebarEmail, "Not signed in");

        hideCreditsUI(drawerElement);
      }
    }

    if (typeof auth.onReady === "function") {
      auth.onReady((payload) => updateUI(payload?.status || payload || auth.status || null));
    } else if (auth.status) {
      updateUI(auth.status);
    }
    
    document.addEventListener("authChanged", e => updateUI(e.detail));
    document.addEventListener("creditsChanged", e => updateCreditsUI(drawerElement, e.detail));

    bindAll(drawerElement, '[data-auth="login-btn"], [data-auth="sidebar-login-btn"]', "click", (e) => {
        e.preventDefault();
        if (typeof auth.login === "function") auth.login();
      });

    bindAll(drawerElement, '[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"]', "click", (e) => {
        e.preventDefault();
        if (typeof auth.logout === "function") {
          const result = auth.logout();
          if (result && typeof result.then === "function") {
            result
              .then(() => window.location.reload())
              .catch((error) => {
                console.warn("[Auth] Logout failed:", error);
                window.location.reload();
              });
          } else {
            window.location.reload();
          }
        }
      });

  });
}
