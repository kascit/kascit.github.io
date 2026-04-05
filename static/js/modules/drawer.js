/**
 * Drawer toggle sync, sidebar collapse, apps-grid persistence,
 * and back navigation fixing.
 */
import { isMobile } from './responsive.js';

const SIDEBAR_KEY = "sidebar-collapsed";
const APPS_KEY = "apps_collapsed";

function readStorageFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch (_error) {
    return false;
  }
}

function writeStorageFlag(key, enabled) {
  try {
    localStorage.setItem(key, enabled ? "1" : "0");
  } catch (_error) {
    // Ignore storage write failures.
  }
}

function getDrawerCheckbox() {
  return document.querySelector("[data-drawer-checkbox]") || document.getElementById("my-drawer-2");
}

export function initDrawer() {
  // --- Mobile drawer sync ---
  function syncDrawerOpenClass() {
    const d = getDrawerCheckbox();
    if (!d) return;
    const open = d.checked && isMobile();
    document.body.classList.toggle("drawer-mobile-open", open);
  }

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      const d = getDrawerCheckbox();
      if (d) d.checked = false;
    }
    syncDrawerOpenClass();
  });

  const d = getDrawerCheckbox();
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
  const toggleBtn = document.querySelector("[data-sidebar-toggle]") || document.getElementById("sidebar-toggle");
  if (!toggleBtn) return;

  const drawer = toggleBtn.closest(".drawer");
  if (!drawer) return;

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
    toggleBtn.setAttribute("data-tooltip-label", "Toggle sidebar");
    toggleBtn.removeAttribute("title");
    document.dispatchEvent(new CustomEvent("tooltips:update", {
      detail: { element: toggleBtn },
    }));
  }

  // Restore persisted state
  const attrSaved = document.documentElement.getAttribute("data-sidebar-collapsed") === "1";
  const saved = attrSaved || readStorageFlag(SIDEBAR_KEY);
  applyCollapsed(saved);

  toggleBtn.addEventListener("click", () => {
    const nowCollapsed = !drawer.classList.contains("sidebar-collapsed");
    applyCollapsed(nowCollapsed);
    writeStorageFlag(SIDEBAR_KEY, nowCollapsed);
  });
}

function initAppsGridCollapse() {
  const details = document.querySelector("details[data-apps-grid-sidebar]");
  if (!details) return;

  // Restore persisted state
  const collapsed = readStorageFlag(APPS_KEY);
  details.open = !collapsed;

  details.addEventListener("toggle", () => {
    writeStorageFlag(APPS_KEY, !details.open);
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
  const sidebarRoot = document.querySelector("[data-sidebar-root]") || document.getElementById("sidebar");
  const navRoot = sidebarRoot ? sidebarRoot.querySelector("[data-sidebar-nav]") : document.querySelector("#sidebar [data-sidebar-nav]");
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
