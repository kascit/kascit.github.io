/**
 * toc.js (Refactored for IntersectionObserver)
 * Unifies Table of Contents functionality:
 * 1. Expand/Collapse Toggle & Memory
 * 2. Active Section Highlighting (IntersectionObserver)
 * 3. Smooth Auto-Scrolling of TOC Sidebar
 */

const STORAGE_KEY = "toc-collapsed";

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { }
}

function getTocToggleBtn() {
  return document.querySelector("[data-toc-toggle]") || document.getElementById("toc-toggle");
}

function getTocSidebar() {
  return document.querySelector("[data-toc-sidebar]") || document.getElementById("toc-sidebar");
}

function applyCollapsedState(collapsed) {
  document.body.classList.toggle("toc-collapsed", collapsed);
  document.documentElement.setAttribute("data-toc-collapsed", collapsed ? "1" : "0");
  const btn = getTocToggleBtn();
  if (btn) {
    const showLabel = btn.getAttribute("data-show-label") || "Show table of contents";
    const hideLabel = btn.getAttribute("data-hide-label") || "Hide table of contents";
    const label = collapsed ? showLabel : hideLabel;
    btn.setAttribute("aria-label", label);
    btn.setAttribute("data-tooltip-label", label);
    btn.removeAttribute("title");
    document.dispatchEvent(new CustomEvent("tooltips:update", { detail: { element: btn } }));
  }
}

function initTocToggle() {
  const btn = getTocToggleBtn();
  if (!btn) return;
  const prepaintState = document.documentElement.getAttribute("data-toc-collapsed");
  const isCollapsed = prepaintState === "1" || (prepaintState === null && safeStorageGet(STORAGE_KEY) === "1");
  applyCollapsedState(isCollapsed);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const nowCollapsed = !document.body.classList.contains("toc-collapsed");
    applyCollapsedState(nowCollapsed);
    safeStorageSet(STORAGE_KEY, nowCollapsed ? "1" : "0");
  });
}

function initTocSpyObserver() {
  const tocSidebar = getTocSidebar();
  if (!tocSidebar) return;

  const headings = Array.from(document.querySelectorAll("main h1[id], main h2[id], main h3[id], main h4[id]"));
  if (headings.length === 0) return;

  function getTocLink(id) {
    if (!id) return null;
    const safeId = CSS.escape(id);
    return tocSidebar.querySelector(`a.toc-link[href="#${safeId}"]`) ||
           tocSidebar.querySelector(`.toc-link[data-toc-id="${safeId}"]`) || null;
  }

  function setActive(id) {
    tocSidebar.querySelectorAll(".toc-link.toc-active").forEach(el => el.classList.remove("toc-active"));
    const link = getTocLink(id);
    if (!link) return;

    link.classList.add("toc-active");
    if (document.body.classList.contains("toc-collapsed")) return;

    let parentDetails = link.closest("details");
    while (parentDetails) {
      parentDetails.open = true;
      parentDetails = parentDetails.parentElement.closest("details");
    }

    link.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // Optimize observer to track states robustly without reflowing layout
  const headingStates = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      headingStates.set(entry.target.id, entry.isIntersecting);
    });

    let topIntersectingId = null;
    for (const heading of headings) {
      if (headingStates.get(heading.id)) {
        topIntersectingId = heading.id;
        break;
      }
    }
    
    // If no explicit intersection and scrolling fast, Fallback logic could be used,
    // but a 0 threshold + generous rootMargin maps it 100% locally.
    if (topIntersectingId) {
      setActive(topIntersectingId);
    }
  }, {
    rootMargin: "-20px 0px -60% 0px", // Trigger when heading comes into view
    threshold: 0 // use 0 so it triggers as soon as 1px is in view
  });

  headings.forEach(heading => observer.observe(heading));

  // Handle immediate hash if it exists
  const initialHash = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
  if (initialHash && document.getElementById(initialHash)) {
    setActive(initialHash);
  }

  // Handle click synchronizations natively
  tocSidebar.addEventListener("click", (event) => {
    const target = event.target.closest(".toc-link");
    if (!target) return;
    let targetId = target.getAttribute("data-toc-id") || "";
    if (!targetId) {
      const href = target.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex >= 0) targetId = decodeURIComponent(href.slice(hashIndex + 1));
    }
    if (!targetId) return;
    
    if (target.hasAttribute("data-toc-id") && location.hash !== `#${targetId}`) {
      location.hash = targetId;
    }
    setActive(targetId);
  });
}

function initTocAutoClose() {
  const tocSidebar = getTocSidebar();
  if (!tocSidebar) return;

  const closeOpenDetails = () => {
    tocSidebar.querySelectorAll("details.toc-details[open]").forEach(d => { d.open = false; });
  };

  document.addEventListener("click", (event) => {
    if (!tocSidebar.contains(event.target)) closeOpenDetails();
  });
  document.addEventListener("focusin", (event) => {
    if (!tocSidebar.contains(event.target)) closeOpenDetails();
  });
}

export function initToc() {
  initTocToggle();
  initTocSpyObserver();
  initTocAutoClose();
}
