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

  // --- Sidebar current-page highlighting ---
  initSidebarCurrentPage();
}

function initSidebarToggle() {
  const toggleBtn = document.getElementById("sidebar-toggle");
  if (!toggleBtn) return;

  const drawer = toggleBtn.closest(".drawer");
  if (!drawer) return;

  const tooltipWrap = document.getElementById("sidebar-toggle-wrapper");

  const collapsedIcon = toggleBtn.querySelector(".sidebar-toggle-icon-collapsed");
  const expandedIcon = toggleBtn.querySelector(".sidebar-toggle-icon-expanded");

  function applyCollapsed(collapsed) {
    drawer.classList.toggle("sidebar-collapsed", collapsed);
    toggleBtn.classList.toggle("sidebar-toggle--collapsed", collapsed);
    document.documentElement.setAttribute("data-sidebar-collapsed", collapsed ? "1" : "0");
    if (collapsedIcon) collapsedIcon.classList.toggle("hidden", !collapsed);
    if (expandedIcon) expandedIcon.classList.toggle("hidden", collapsed);

    const label = collapsed ? "Show sidebar" : "Hide sidebar";
    toggleBtn.setAttribute("aria-label", label);
    toggleBtn.setAttribute("title", label);
    if (tooltipWrap) {
      tooltipWrap.setAttribute("data-tip", label);
    }
  }

  // Restore persisted state
  const attrSaved = document.documentElement.getAttribute("data-sidebar-collapsed") === "1";
  const saved = attrSaved || localStorage.getItem(SIDEBAR_KEY) === "1";
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

function normalizePath(pathname) {
  if (!pathname) return "/";
  let path = pathname.split("#")[0].split("?")[0] || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

function resolveLocalPath(href) {
  if (!href || href.startsWith("#")) return null;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return normalizePath(url.pathname);
  } catch {
    return null;
  }
}

function initSidebarCurrentPage() {
  const navRoot = document.querySelector("#sidebar [data-sidebar-nav]");
  if (!navRoot) return;

  const currentPath = normalizePath(window.location.pathname);
  const links = Array.from(navRoot.querySelectorAll("a[href]"));

  let best = null;
  for (const link of links) {
    const path = resolveLocalPath(link.getAttribute("href"));
    if (!path) continue;

    const isExact = currentPath === path;
    const isSectionMatch = path !== "/" && currentPath.startsWith(`${path}/`);
    if (!isExact && !isSectionMatch) continue;

    const score = path.length + (isExact ? 1000 : 0);
    if (!best || score > best.score) {
      best = { link, score };
    }
  }

  if (!best && currentPath === "/") {
    const rootLink = links.find((link) => resolveLocalPath(link.getAttribute("href")) === "/");
    if (rootLink) best = { link: rootLink, score: 0 };
  }

  navRoot.querySelectorAll(".sidebar-link-active").forEach((el) => el.classList.remove("sidebar-link-active"));
  navRoot.querySelectorAll(".sidebar-parent-active").forEach((el) => el.classList.remove("sidebar-parent-active"));
  navRoot.querySelectorAll('a[aria-current="page"]').forEach((el) => el.removeAttribute("aria-current"));

  if (!best?.link) return;

  best.link.classList.add("sidebar-link-active");
  best.link.setAttribute("aria-current", "page");

  let parentDetails = best.link.closest("details");
  while (parentDetails) {
    parentDetails.open = true;
    const summary = parentDetails.querySelector(":scope > summary");
    if (summary) summary.classList.add("sidebar-parent-active");
    parentDetails = parentDetails.parentElement?.closest("details") || null;
  }
}
