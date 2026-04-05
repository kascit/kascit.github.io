/**
 * Position-aware Dropdowns
 */

let globalListenersBound = false;

function closeAllOpenDropdowns() {
  document.querySelectorAll("[data-dropdown][data-open]").forEach((dd) => {
    dd.removeAttribute("data-open");
  });
}

function getOpenDropdown() {
  return document.querySelector("[data-dropdown][data-open]");
}

function positionPanel(dd) {
  const panel = dd.querySelector(".dropdown-panel");
  if (!panel) return;
  const rect = dd.getBoundingClientRect();
  const pw = panel.offsetWidth || 224;
  let idealLeft = (rect.width - pw) / 2;

  const rightOverflow = rect.left + idealLeft + pw - (window.innerWidth - 16);
  if (rightOverflow > 0) idealLeft -= rightOverflow;
  if (rect.left + idealLeft < 8) idealLeft = 8 - rect.left;

  panel.style.left = `${idealLeft}px`;
  panel.style.right = "auto";
}

function openPanel(dd) {
  closeAllOpenDropdowns();
  dd.setAttribute("data-open", "");
  positionPanel(dd);
}

export function initDropdowns(rootElement = document) {
  const dropdowns = rootElement.querySelectorAll("[data-dropdown]");
  if (!dropdowns.length) return;

  dropdowns.forEach((dd) => {
    if (dd.getAttribute("data-dropdown-init") === "1") return;

    const btn = dd.querySelector('[role="button"]');
    if (!btn) return;
    const panel = dd.querySelector(".dropdown-panel");

    const hasTooltip = btn.classList.contains("tooltip")
      && (btn.hasAttribute("data-tooltip-label")
        || btn.hasAttribute("data-tip")
        || !!btn.querySelector(":scope > .tooltip-content"));
    dd.setAttribute("data-dropdown-tooltip", hasTooltip ? "1" : "0");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = dd.hasAttribute("data-open");
      if (wasOpen) {
        closeAllOpenDropdowns();
      } else {
        openPanel(dd);
      }
    });

    if (panel) {
      panel.addEventListener("click", (e) => e.stopPropagation());
    }

    dd.setAttribute("data-dropdown-init", "1");
  });

  if (globalListenersBound) return;
  globalListenersBound = true;

  document.addEventListener("click", () => {
    if (getOpenDropdown()) closeAllOpenDropdowns();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && getOpenDropdown()) closeAllOpenDropdowns();
  });
  window.addEventListener("resize", () => {
    const openDropdown = getOpenDropdown();
    if (openDropdown) positionPanel(openDropdown);
  });
}
