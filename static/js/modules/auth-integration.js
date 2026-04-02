/**
 * Authentication Integration
 * Handles Auth client loading and UI state syncing.
 */

// Auto-inject auth-client.js from auth.dhanur.me
function injectAuthSDK(callback) {
  if (window.AUTH) { callback(); return; }
  if (document.querySelector('script[src*="auth-client.js"]')) {
    document.addEventListener("authReady", () => callback(), { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = "https://auth.dhanur.me/auth-client.js";
  script.defer = true;
  script.onload = () => {
    if (window.AUTH && typeof AUTH.onReady === "function") {
      AUTH.onReady(() => callback());
    } else {
      callback();
    }
  };
  script.onerror = () => console.warn("[Auth] Could not load auth-client.js");
  document.head.appendChild(script);
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
  injectAuthSDK(() => {
    if (typeof AUTH === "undefined" || !window.AUTH) return;
    
    const r = {
      navGuestAvatar: drawerElement.querySelector('.navbar [data-dropdown="account"] .bg-base-300'),
      navAuthedAvatar: drawerElement.querySelector('.navbar [data-dropdown="account"] .ring-primary'),
      navAvatarImg: drawerElement.querySelector('.navbar [data-dropdown="account"] .ring-primary img'),
      navAuthedHeader: drawerElement.querySelector('.navbar .dropdown-panel [data-auth="name"]')?.closest('.border-b'),
      navGuestHeader: drawerElement.querySelector('.navbar .dropdown-panel .fa-user')?.closest('.border-b'),
      navName: drawerElement.querySelector('.navbar [data-auth="name"]'),
      navEmail: drawerElement.querySelector('.navbar [data-auth="email"]'),
      navRole: drawerElement.querySelector('.navbar [data-auth="role"]'),
      navLoginItem: drawerElement.querySelector('.navbar [data-auth="login-item"]'),
      navAccountItem: drawerElement.querySelector('.navbar [data-auth="account-item"]'),
      navUpgradeItem: drawerElement.querySelector('.navbar [data-auth="upgrade-item"]'),
      navLogoutItem: drawerElement.querySelector('.navbar [data-auth="logout-item"]'),
      
      sidebarGuestAvatar: drawerElement.querySelector('#sidebar [data-sidebar-account] .bg-base-300'),
      sidebarAuthedAvatar: drawerElement.querySelector('#sidebar [data-sidebar-account] .ring-primary'),
      sidebarAvatarImg: drawerElement.querySelector('#sidebar [data-sidebar-account] .ring-primary img'),
      sidebarName: drawerElement.querySelector('#sidebar [data-sidebar-account] .font-semibold'),
      sidebarEmail: drawerElement.querySelector('#sidebar [data-sidebar-account] .text-xs.opacity-60'),
      sidebarLoginBtn: drawerElement.querySelector('#sidebar [data-auth="sidebar-login-btn"]'),
      sidebarLogoutBtn: drawerElement.querySelector('#sidebar [data-auth="sidebar-logout-btn"]'),
      sidebarAccountBtn: drawerElement.querySelector('#sidebar [data-auth="sidebar-account-btn"]')
    };

    function updateUI(status) {
      if (!status) return;
      const authed = status.authenticated;
      const user = status.user;
      const avatarUrl = user?.avatar_url || "";
      const userName = user?.name || "User";
      
      if (authed && user) {
        r.navGuestAvatar?.classList.add("hidden");
        r.navAuthedAvatar?.classList.remove("hidden");
        if (r.navAvatarImg) r.navAvatarImg.src = avatarUrl;
        
        r.navAuthedHeader?.classList.remove("hidden");
        r.navGuestHeader?.classList.add("hidden");
        if (r.navAuthedHeader?.querySelector('img')) r.navAuthedHeader.querySelector('img').src = avatarUrl;
        
        if (r.navName) r.navName.textContent = userName;
        if (r.navEmail) r.navEmail.textContent = user.email || "";
        
        if (r.navRole) {
          const role = status.role || "user";
          r.navRole.textContent = role.toUpperCase();
          r.navRole.className = role === "admin" ? "badge badge-sm badge-error" : "badge badge-sm badge-success";
          r.navRole.classList.remove("hidden");
          r.navUpgradeItem?.classList.toggle("hidden", role === "admin");
        }
        
        r.navLoginItem?.classList.add("hidden");
        r.navAccountItem?.classList.remove("hidden");
        r.navLogoutItem?.classList.remove("hidden");

        r.sidebarGuestAvatar?.classList.add("hidden");
        r.sidebarAuthedAvatar?.classList.remove("hidden");
        if (r.sidebarAvatarImg) r.sidebarAvatarImg.src = avatarUrl;
        if (r.sidebarName) r.sidebarName.textContent = userName;
        if (r.sidebarEmail) r.sidebarEmail.textContent = user.email || "";
        
        r.sidebarLoginBtn?.classList.add("hidden");
        r.sidebarLogoutBtn?.classList.remove("hidden");
        r.sidebarAccountBtn?.classList.remove("hidden");

        updateCreditsUI(drawerElement, status.credits || null);
      } else {
        r.navGuestAvatar?.classList.remove("hidden");
        r.navAuthedAvatar?.classList.add("hidden");
        r.navAuthedHeader?.classList.add("hidden");
        r.navGuestHeader?.classList.remove("hidden");
        r.navRole?.classList.add("hidden");
        r.navLoginItem?.classList.remove("hidden");
        r.navAccountItem?.classList.add("hidden");
        r.navLogoutItem?.classList.add("hidden");
        r.navUpgradeItem?.classList.add("hidden");

        r.sidebarGuestAvatar?.classList.remove("hidden");
        r.sidebarAuthedAvatar?.classList.add("hidden");
        if (r.sidebarName) r.sidebarName.textContent = "Guest";
        if (r.sidebarEmail) r.sidebarEmail.textContent = "Not signed in";
        
        r.sidebarLoginBtn?.classList.remove("hidden");
        r.sidebarLogoutBtn?.classList.add("hidden");
        r.sidebarAccountBtn?.classList.add("hidden");

        hideCreditsUI(drawerElement);
      }
    }

    if (typeof AUTH.onReady === "function") {
      AUTH.onReady((auth) => updateUI(auth.status || auth));
    }
    
    document.addEventListener("authChanged", e => updateUI(e.detail));
    document.addEventListener("creditsChanged", e => updateCreditsUI(drawerElement, e.detail));

    drawerElement.querySelectorAll('[data-auth="login-btn"], [data-auth="sidebar-login-btn"]').forEach(btn => {
      btn.addEventListener("click", e => { e.preventDefault(); AUTH.login && AUTH.login(); });
    });

    drawerElement.querySelectorAll('[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"]').forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        if (AUTH.logout) AUTH.logout().then(() => window.location.reload());
      });
    });

    drawerElement.querySelectorAll('[data-auth="upgrade-btn"]').forEach(btn => {
      btn.addEventListener("click", e => { e.preventDefault(); AUTH.upgrade && AUTH.upgrade(); });
    });
  });
}
