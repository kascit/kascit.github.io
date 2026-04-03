/**
 * toc.js
 * Unifies Table of Contents functionality:
 * 1. Expand/Collapse Toggle & Memory
 * 2. Active Section Highlighting (IntersectionObserver)
 * 3. Smooth Auto-Scrolling of TOC Sidebar
 */

(function () {
  "use strict";

  const STORAGE_KEY = "toc-collapsed";

  // --- 1. Toggle Logic ---
  function applyCollapsedState(collapsed) {
    document.body.classList.toggle("toc-collapsed", collapsed);
    const btn = document.getElementById("toc-toggle");
    if (btn) {
      const showLabel = btn.getAttribute("data-show-label") || "Show table of contents";
      const hideLabel = btn.getAttribute("data-hide-label") || "Hide table of contents";
      const label = collapsed ? showLabel : hideLabel;
      btn.setAttribute("aria-label", label);
      btn.removeAttribute("title");
      const tooltipWrap = btn.closest(".tooltip");
      if (tooltipWrap) {
        tooltipWrap.setAttribute("data-tip", label);
      }
    }
  }

  function initTocToggle() {
    const btn = document.getElementById("toc-toggle");
    if (!btn) return;

    // Load state
    const isCollapsed = localStorage.getItem(STORAGE_KEY) === "1";
    applyCollapsedState(isCollapsed);

    // Click handler
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const nowCollapsed = !document.body.classList.contains("toc-collapsed");
      applyCollapsedState(nowCollapsed);
      localStorage.setItem(STORAGE_KEY, nowCollapsed ? "1" : "0");
    });
  }

  // --- 2. Active Section Highlighting ---
  function initTocSpy() {
    const tocSidebar = document.getElementById("toc-sidebar");
    if (!tocSidebar) return;

    // Collect headings ONLY from within main prose
    const headings = Array.from(
      document.querySelectorAll("main h1[id], main h2[id], main h3[id], main h4[id]")
    );
    if (headings.length === 0) return;

    let currentActiveId = null;
    let clickLockUntil = 0;

    function getActiveOffsetPx() {
      const rootStyle = window.getComputedStyle(document.documentElement);
      const scrollPaddingTop = parseFloat(rootStyle.scrollPaddingTop || "0") || 0;
      return Math.max(96, scrollPaddingTop + 18);
    }

    const CLICK_LOCK_MS = 1200;

    function nowMs() {
      return (window.performance && typeof window.performance.now === "function")
        ? window.performance.now()
        : Date.now();
    }

    function getTocLink(id) {
      if (!id) return null;
      var safeId = CSS.escape(id);
      const exact = tocSidebar.querySelector(`a.toc-link[href="#${safeId}"]`);
      if (exact) return exact;

      const summaryTarget = tocSidebar.querySelector(`.toc-link[data-toc-id="${safeId}"]`);
      if (summaryTarget) return summaryTarget;

      return Array.from(tocSidebar.querySelectorAll("a.toc-link[href]")).find((a) => {
        const href = a.getAttribute("href") || "";
        return href.endsWith(`#${id}`);
      }) || null;
    }

    function setActive(id) {
      if (id === currentActiveId) return;
      currentActiveId = id;

      // Clear previous active
      tocSidebar.querySelectorAll(".toc-link.toc-active").forEach(el => {
        el.classList.remove("toc-active");
      });

      const link = getTocLink(id);
      if (!link) return;

      // Set new active
      link.classList.add("toc-active");

      const tocIsCollapsed = document.body.classList.contains("toc-collapsed");
      if (tocIsCollapsed) return;

      // Auto-open parent details elements for nested hierarchies
      let parentDetails = link.closest("details");
      while (parentDetails) {
        parentDetails.open = true;
        parentDetails = parentDetails.parentElement.closest("details");
      }

      // Smooth scroll the sidebar to keep the link visible
      link.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function findActiveHeadingFromScroll() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const viewportBottom = scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Keep the final heading active when user reaches the bottom of page.
      if (viewportBottom >= docHeight - 2) {
        return headings[headings.length - 1].id;
      }

      const activationLine = scrollY + getActiveOffsetPx();
      let best = headings[0].id;
      let bestTop = headings[0].getBoundingClientRect().top + scrollY;
      let nextTop = null;
      let nextId = null;

      for (let i = 0; i < headings.length; i++) {
        const top = headings[i].getBoundingClientRect().top + scrollY;
        if (top <= activationLine + 1) {
          best = headings[i].id;
          bestTop = top;
        } else {
          nextTop = top;
          nextId = headings[i].id;
          break;
        }
      }

      // Prevent a persistent "one heading behind" state around anchor landings.
      if (nextId && nextTop !== null && (nextTop - activationLine) <= 28) {
        return nextId;
      }

      return best;
    }

    function syncActiveFromScroll() {
      if (nowMs() < clickLockUntil) return;
      const best = findActiveHeadingFromScroll();
      if (best && best !== currentActiveId) {
        setActive(best);
      }
    }

    function setActiveFromIdWithLock(id) {
      if (!id) return;
      if (!document.getElementById(id)) return;
      clickLockUntil = nowMs() + CLICK_LOCK_MS;
      setActive(id);
      window.setTimeout(syncActiveFromScroll, CLICK_LOCK_MS + 120);
    }

    let scrollRaf = null;
    function scheduleSyncFromScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () {
        scrollRaf = null;
        syncActiveFromScroll();
      });
    }

    window.addEventListener("scroll", scheduleSyncFromScroll, { passive: true });
    window.addEventListener("resize", scheduleSyncFromScroll, { passive: true });

    tocSidebar.addEventListener("click", function (event) {
      const target = event.target.closest(".toc-link");
      if (!target) return;

      let targetId = target.getAttribute("data-toc-id") || "";
      if (!targetId) {
        const href = target.getAttribute("href") || "";
        const hashIndex = href.indexOf("#");
        if (hashIndex >= 0) {
          targetId = decodeURIComponent(href.slice(hashIndex + 1));
        }
      }

      if (!targetId) return;

      // Summary targets (data-toc-id) may not navigate by default; sync hash to native anchor behavior.
      if (target.hasAttribute("data-toc-id") && location.hash !== `#${targetId}`) {
        location.hash = targetId;
      }

      setActiveFromIdWithLock(targetId);
    });

    window.addEventListener("hashchange", function () {
      const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
      if (id) {
        setActiveFromIdWithLock(id);
      }
    });

    // Handle initial hash or scroll position.
    const initialHash = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
    if (initialHash && document.getElementById(initialHash)) {
      setActiveFromIdWithLock(initialHash);
    } else {
      syncActiveFromScroll();
    }
  }

  // --- 3. Auto-close TOC dropdown groups when focus/click leaves sidebar ---
  function initTocAutoClose() {
    const tocSidebar = document.getElementById("toc-sidebar");
    if (!tocSidebar) return;

    const closeOpenDetails = () => {
      tocSidebar.querySelectorAll("details.toc-details[open]").forEach((d) => {
        d.open = false;
      });
    };

    document.addEventListener("click", (event) => {
      if (!tocSidebar.contains(event.target)) {
        closeOpenDetails();
      }
    });

    document.addEventListener("focusin", (event) => {
      if (!tocSidebar.contains(event.target)) {
        closeOpenDetails();
      }
    });
  }

  // --- Init All ---
  function initAll() {
    initTocToggle();
    initTocSpy();
    initTocAutoClose();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

})();
