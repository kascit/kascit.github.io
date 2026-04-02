/**
 * Position-aware Dropdowns
 */

export function initDropdowns(rootElement = document) {
  const dropdowns = rootElement.querySelectorAll("[data-dropdown]");
  if (!dropdowns.length) return;
  let openDropdown = null;

  function closeAll() {
    dropdowns.forEach((dd) => {
      dd.removeAttribute("data-open");
      const btn = dd.querySelector('[role="button"]');
      if (btn && btn.hasAttribute("data-tip")) {
        btn.classList.add("tooltip");
      }
    });
    openDropdown = null;
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
    dd.setAttribute("data-open", "");
    openDropdown = dd;
    const btn = dd.querySelector('[role="button"]');
    if (btn) btn.classList.remove("tooltip");

    const panel = dd.querySelector(".dropdown-panel");
    if (panel) positionPanel(dd);
  }

  dropdowns.forEach((dd) => {
    const btn = dd.querySelector('[role="button"]');
    if (!btn) return;
    const panel = dd.querySelector(".dropdown-panel");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = dd.hasAttribute("data-open");
      closeAll();
      if (!wasOpen) openPanel(dd);
    });

    if (panel) {
      panel.addEventListener("click", (e) => e.stopPropagation());
    }
  });

  document.addEventListener("click", () => { if (openDropdown) closeAll(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openDropdown) closeAll(); });
  window.addEventListener("resize", () => {
    if (openDropdown) positionPanel(openDropdown);
  });
}
