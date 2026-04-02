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
    // if (btn) {
    //   const label = collapsed ? "Show table of contents" : "Hide table of contents";
    //   btn.setAttribute("aria-label", label);
    //   btn.setAttribute("title", label);
    // }
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

    function getTocLink(id) {
      if (!id) return null;
      var safeId = CSS.escape(id);
      return tocSidebar.querySelector(`a.toc-link[href="#${safeId}"]`);
    }

    function setActive(id) {
      if (id === currentActiveId) return;
      currentActiveId = id;

      // Clear previous active
      tocSidebar.querySelectorAll("a.toc-link.toc-active").forEach(el => {
        el.classList.remove("toc-active");
      });

      const link = getTocLink(id);
      if (!link) return;

      // Set new active
      link.classList.add("toc-active");

      // Auto-open parent details elements for nested hierarchies
      let parentDetails = link.closest("details");
      while (parentDetails) {
        parentDetails.open = true;
        parentDetails = parentDetails.parentElement.closest("details");
      }

      // Smooth scroll the sidebar to keep the link visible
      link.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    // Observer to detect which heading is at the top of the viewport
    const ioOptions = {
      root: null,
      // Fire as heading enters the top 40% of the viewport (refined threshold)
      rootMargin: "0px 0px -55% 0px",
      threshold: 0
    };

    let latestVisibleId = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          latestVisibleId = entry.target.id;
        }
      });

      if (latestVisibleId) {
        setActive(latestVisibleId);
      }
    }, ioOptions);

    headings.forEach(h => observer.observe(h));

    // Also handle aggressive upward scrolling using scroll listener
    let scrollRaf = null;
    window.addEventListener("scroll", function () {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () {
        scrollRaf = null;
        const viewportMid = window.scrollY + window.innerHeight / 2;
        let best = null;
        
        for (let i = 0; i < headings.length; i++) {
          const top = headings[i].getBoundingClientRect().top + window.scrollY;
          if (top <= viewportMid) {
            best = headings[i].id;
          } else {
            break; // Headings are sequential, break early
          }
        }
        
        if (best && best !== currentActiveId) {
          setActive(best);
        }
      });
    }, { passive: true });

    // Handle initial hash or first heading
    const initialHash = location.hash ? location.hash.slice(1) : null;
    if (initialHash && document.getElementById(initialHash)) {
      setActive(initialHash);
    } else if (headings.length > 0) {
      setActive(headings[0].id);
    }
  }

  // --- 3. Click summary elements to jump ---
  function initTocClicks() {
    document.querySelectorAll(".toc-menu summary[data-toc-href]").forEach(summary => {
      summary.addEventListener("click", function () {
        const href = this.getAttribute("data-toc-href");
        if (href && href.includes("#")) {
          const hash = href.split("#")[1];
          if (hash) window.location.hash = hash;
        }
      });
    });
  }

  // --- Init All ---
  function initAll() {
    initTocToggle();
    initTocSpy();
    initTocClicks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

})();
