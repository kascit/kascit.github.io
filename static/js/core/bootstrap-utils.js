/**
 * Core Bootstrap Lifecycle Utilities
 *
 * Provides safe execution wrappers and DOM layout sync functions
 * used during the initial application startup sequence.
 */

export function runSafely(task, label) {
  try {
    const result = task();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        console.error(`[Bootstrap] ${label} failed:`, error);
      });
    }
  } catch (error) {
    console.error(`[Bootstrap] ${label} failed:`, error);
  }
}

export function runAfterFirstPaint(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(callback);
    });
    return;
  }

  window.setTimeout(callback, 0);
}

export function runWhenIdle(callback, timeout = 1200) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, 120);
}

export function markUiInitReady() {
  const apply = () => {
    document.documentElement.setAttribute("data-ui-init", "1");
  };

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
    return;
  }

  window.setTimeout(apply, 0);
}

export function syncPrepaintLayoutState() {
  const doc = document.documentElement;
  const sidebarCollapsed = doc.getAttribute("data-sidebar-collapsed") === "1";
  const tocCollapsed = doc.getAttribute("data-toc-collapsed") === "1";

  document.querySelectorAll(".drawer").forEach((drawer) => {
    drawer.classList.toggle("sidebar-collapsed", sidebarCollapsed);
  });

  if (document.body) {
    document.body.classList.toggle("toc-collapsed", tocCollapsed);
  }
}

export function has(selector) {
  return !!document.querySelector(selector);
}

export function hasAny(selectors) {
  return selectors.some((selector) => has(selector));
}

export function isHomeRoute() {
  return (
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html"
  );
}
