/**
 * toc.js — Single source of truth for all Table of Contents behaviour.
 *
 * Covers:
 *  - Expand / collapse toggle + localStorage memory (blog posts, archive, etc.)
 *  - Active-section highlighting via IntersectionObserver with a reliable
 *    "closest above" fallback so the active state never goes blank mid-scroll.
 *  - Smooth auto-scroll of the TOC rail to keep the active link visible.
 *  - Click → immediate hash + highlight sync.
 *  - Auto-close open <details> when focus leaves the sidebar.
 */

const STORAGE_KEY = "toc-collapsed";

// ─── helpers ────────────────────────────────────────────────────────────────

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function getTocToggleBtn() {
  return document.querySelector("[data-toc-toggle]") || document.getElementById("toc-toggle");
}

function getTocSidebar() {
  return document.querySelector("[data-toc-sidebar]") || document.getElementById("toc-sidebar");
}

// ─── collapse / expand toggle ────────────────────────────────────────────────

function applyCollapsedState(collapsed) {
  document.body.classList.toggle("toc-collapsed", collapsed);
  document.documentElement.setAttribute("data-toc-collapsed", collapsed ? "1" : "0");

  const btn = getTocToggleBtn();
  if (!btn) return;

  const showLabel = btn.getAttribute("data-show-label") || "Show table of contents";
  const hideLabel = btn.getAttribute("data-hide-label") || "Hide table of contents";
  const label = collapsed ? showLabel : hideLabel;
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-tooltip-label", label);
  btn.removeAttribute("title");
  document.dispatchEvent(new CustomEvent("tooltips:update", { detail: { element: btn } }));
}

function initTocToggle() {
  const btn = getTocToggleBtn();
  if (!btn) return;

  const prepaintState = document.documentElement.getAttribute("data-toc-collapsed");
  const isCollapsed =
    prepaintState === "1" ||
    (prepaintState === null && safeStorageGet(STORAGE_KEY) === "1");
  applyCollapsedState(isCollapsed);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const nowCollapsed = !document.body.classList.contains("toc-collapsed");
    applyCollapsedState(nowCollapsed);
    safeStorageSet(STORAGE_KEY, nowCollapsed ? "1" : "0");
  });
}

// ─── active-section spy ──────────────────────────────────────────────────────

function initTocSpyObserver() {
  const tocSidebar = getTocSidebar();
  if (!tocSidebar) return;

  // Collect every anchored heading inside <main> that has a matching TOC entry.
  // Zola renders child TOC links as full URLs (e.g. https://host/path/#id), so
  // we match by both bare-hash (#id), full URL end-match (href$="#id"), and
  // data-toc-id attribute — covering both page.toc children and archive anchors.
  const headings = Array.from(
    document.querySelectorAll("main h1[id], main h2[id], main h3[id], main h4[id], main [id]")
  ).filter((el) => {
    const id = el.id;
    if (!id) return false;
    const safe = CSS.escape(id);
    return !!(  
      tocSidebar.querySelector(`a.toc-link[href="#${safe}"]`) ||
      tocSidebar.querySelector(`.toc-link[data-toc-id="${safe}"]`) ||
      tocSidebar.querySelector(`a.toc-link[href$="#${id}"]`) ||
      tocSidebar.querySelector(`a[href="#${safe}"]`)
    );
  });

  if (headings.length === 0) return;

  // ── link helpers ────────────────────────────────────────────────────────

  function getTocLink(id) {
    if (!id) return null;
    const safe = CSS.escape(id);
    return (
      // Bare hash links (archive year/month anchors)
      tocSidebar.querySelector(`a.toc-link[href="#${safe}"]`) ||
      // <summary> parent headings with data-toc-id
      tocSidebar.querySelector(`.toc-link[data-toc-id="${safe}"]`) ||
      // Full permalink children: Zola outputs href="https://host/path/#id"
      tocSidebar.querySelector(`a.toc-link[href$="#${id}"]`) ||
      tocSidebar.querySelector(`a[href="#${safe}"]`) ||
      null
    );
  }


  let currentActiveId = null;

  function setActive(id) {
    if (id === currentActiveId) return;
    currentActiveId = id;

    tocSidebar.querySelectorAll(".toc-link.toc-active").forEach((el) =>
      el.classList.remove("toc-active")
    );

    const link = getTocLink(id);
    if (!link) return;

    link.classList.add("toc-active");

    // Open any ancestor <details> elements.
    if (!document.body.classList.contains("toc-collapsed")) {
      let details = link.closest("details");
      while (details) {
        details.open = true;
        details = details.parentElement?.closest("details") ?? null;
      }
      // Bring the active link into view within the sidebar — not the viewport.
      link.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  // ── "closest above" fallback ─────────────────────────────────────────────
  // When no heading is inside the observer window (fast scroll, initial load,
  // etc.) we walk the headings in document order and pick the last one whose
  // top is at or above the viewport midpoint. This guarantees the active state
  // never goes blank.

  function resolveActiveFromScroll() {
    const midY = window.scrollY + window.innerHeight * 0.25;
    let best = null;
    for (const h of headings) {
      const top = h.getBoundingClientRect().top + window.scrollY;
      if (top <= midY) best = h.id;
      else break; // headings are in document order; once we pass midY we stop
    }
    if (best) setActive(best);
  }

  // ── IntersectionObserver ─────────────────────────────────────────────────
  // rootMargin: trigger the highlight as the heading enters the top ~30% of
  // the viewport. The bottom clip is generous so sections with many
  // paragraphs stay highlighted while the user reads through them.

  const visibleHeadings = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleHeadings.add(entry.target);
        } else {
          visibleHeadings.delete(entry.target);
        }
      });

      if (visibleHeadings.size > 0) {
        // Pick the first visible heading in document order.
        let topHeading = null;
        for (const h of headings) {
          if (visibleHeadings.has(h)) { topHeading = h; break; }
        }
        if (topHeading) setActive(topHeading.id);
      } else {
        // No heading in the observer window → fall back to closest-above scan.
        resolveActiveFromScroll();
      }
    },
    {
      // Top margin: activates when heading is within the top 30% of viewport.
      // Bottom margin: keeps the heading "visible" until 55% below for long sections.
      rootMargin: "-10px 0px -55% 0px",
      threshold: 0,
    }
  );

  headings.forEach((h) => observer.observe(h));

  // ── initial state ────────────────────────────────────────────────────────

  const hash = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
  if (hash && document.getElementById(hash)) {
    setActive(hash);
  } else {
    resolveActiveFromScroll();
  }

  // ── click sync ───────────────────────────────────────────────────────────

  tocSidebar.addEventListener("click", (event) => {
    const link = event.target.closest(".toc-link");
    if (!link) return;

    let id = link.getAttribute("data-toc-id") || "";
    if (!id) {
      const href = link.getAttribute("href") || "";
      const hi = href.indexOf("#");
      if (hi >= 0) id = decodeURIComponent(href.slice(hi + 1));
    }
    if (!id) return;

    if (location.hash !== `#${id}`) location.hash = id;
    setActive(id);
  });
}

// ─── auto-close details on outside click ────────────────────────────────────

function initTocAutoClose() {
  const tocSidebar = getTocSidebar();
  if (!tocSidebar) return;

  const closeAll = () =>
    tocSidebar.querySelectorAll("details.toc-details[open]").forEach((d) => {
      d.open = false;
    });

  document.addEventListener("click", (e) => {
    if (!tocSidebar.contains(e.target)) closeAll();
  });
  document.addEventListener("focusin", (e) => {
    if (!tocSidebar.contains(e.target)) closeAll();
  });
}

// ─── public entry point ──────────────────────────────────────────────────────

export function initToc() {
  initTocToggle();
  initTocSpyObserver();
  initTocAutoClose();
}
