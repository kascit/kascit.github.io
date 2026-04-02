/**
 * Drawer toggle sync, sidebar collapse, apps-grid persistence,
 * and back navigation fixing.
 */
import { isMobile } from './responsive.js';

const SIDEBAR_KEY = "sidebar-collapsed";
const APPS_KEY = "apps_collapsed";

export function initDrawer() {
  // --- Mobile drawer sync ---
  function syncDrawerOpenClass() {
    const d = document.getElementById("my-drawer-2");
    if (!d) return;
    const open = d.checked && isMobile();
    document.body.classList.toggle("drawer-mobile-open", open);
  }

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      const d = document.getElementById("my-drawer-2");
      if (d) d.checked = false;
    }
    syncDrawerOpenClass();
  });

  const d = document.getElementById("my-drawer-2");
  if (d) {
    d.addEventListener("change", syncDrawerOpenClass);
    window.addEventListener("resize", syncDrawerOpenClass);
    syncDrawerOpenClass();
  }

  // --- Desktop sidebar collapse toggle ---
  initSidebarToggle();

  // --- Apps grid collapse persistence ---
  initAppsGridCollapse();
}

function initSidebarToggle() {
  const toggleBtn = document.getElementById("sidebar-toggle");
  if (!toggleBtn) return;

  const drawer = toggleBtn.closest(".drawer");
  if (!drawer) return;

  const collapsedIcon = toggleBtn.querySelector(".sidebar-toggle-icon-collapsed");
  const expandedIcon = toggleBtn.querySelector(".sidebar-toggle-icon-expanded");

  function applyCollapsed(collapsed) {
    drawer.classList.toggle("sidebar-collapsed", collapsed);
    toggleBtn.classList.toggle("sidebar-toggle--collapsed", collapsed);
    if (collapsedIcon) collapsedIcon.classList.toggle("hidden", !collapsed);
    if (expandedIcon) expandedIcon.classList.toggle("hidden", collapsed);
  }

  // Restore persisted state
  const saved = localStorage.getItem(SIDEBAR_KEY) === "1";
  applyCollapsed(saved);

  toggleBtn.addEventListener("click", () => {
    const nowCollapsed = !drawer.classList.contains("sidebar-collapsed");
    applyCollapsed(nowCollapsed);
    localStorage.setItem(SIDEBAR_KEY, nowCollapsed ? "1" : "0");
  });
}

function initAppsGridCollapse() {
  const details = document.querySelector("details[data-apps-grid-sidebar]");
  if (!details) return;

  // Restore persisted state
  const collapsed = localStorage.getItem(APPS_KEY) === "1";
  details.open = !collapsed;

  details.addEventListener("toggle", () => {
    localStorage.setItem(APPS_KEY, details.open ? "0" : "1");
  });
}
