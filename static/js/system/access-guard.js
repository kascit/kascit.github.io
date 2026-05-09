const ACCESS_WALL_STYLES = `
  .access-wall {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
    gap: 1rem;
  }
  .access-wall-icon {
    font-size: 2.75rem;
    opacity: 0.35;
  }
  .access-wall-title {
    font-size: 1.4rem;
    font-weight: 700;
  }
  .access-wall-sub {
    max-width: 32rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;

function ensureAccessWallStyles() {
  if (document.getElementById("access-wall-styles")) return;
  const style = document.createElement("style");
  style.id = "access-wall-styles";
  style.textContent = ACCESS_WALL_STYLES;
  document.head.appendChild(style);
}

export function checkAccess(config = {}, authStatus = null) {
  const requireAdmin = config.requireAdmin === true;
  const requireAuth = config.requireAuth === true || requireAdmin;

  if (!requireAuth) return { allowed: true };

  const authenticated = authStatus?.authenticated === true;
  const role = authStatus?.role || "guest";

  if (!authenticated) {
    return { allowed: false, reason: "auth_required" };
  }

  if (requireAdmin && role !== "admin") {
    return { allowed: false, reason: "admin_required" };
  }

  return { allowed: true };
}

export function renderAccessWall(
  slot,
  reason = "auth_required",
  appName = "This app",
) {
  if (!slot) return;

  ensureAccessWallStyles();

  const isAdminRequired = reason === "admin_required";
  const iconClass = isAdminRequired
    ? "fa-solid fa-shield-halved"
    : "fa-solid fa-lock";
  const title = isAdminRequired
    ? "Admin access required"
    : "Sign in to continue";
  const subtitle = isAdminRequired
    ? `${appName} is restricted to administrator sessions.`
    : `${appName} requires a dhanur.me account to continue.`;
  const buttonLabel = isAdminRequired ? "Verify Admin" : "Sign In";
  const buttonAttr = isAdminRequired ? "upgrade-btn" : "login-btn";

  slot.innerHTML = `
    <div class="access-wall">
      <i class="access-wall-icon ${iconClass}"></i>
      <h1 class="access-wall-title">${title}</h1>
      <p class="access-wall-sub">${subtitle}</p>
      <button class="btn btn-primary" data-auth="${buttonAttr}">
        <i class="fa-solid fa-right-to-bracket"></i>
        ${buttonLabel}
      </button>
    </div>
  `;

  const auth = window.AUTH;
  if (reason === "admin_required") {
    const btn = slot.querySelector('[data-auth="upgrade-btn"]');
    if (btn && auth && typeof auth.upgrade === "function") {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        auth.upgrade();
      });
    }
    return;
  }

  const btn = slot.querySelector('[data-auth="login-btn"]');
  if (btn && auth && typeof auth.login === "function") {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      auth.login();
    });
  }
}
