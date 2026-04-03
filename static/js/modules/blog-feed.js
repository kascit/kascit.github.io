/**
 * Blog feed progressive reveal (infinite-scroll style)
 */

export function initBlogFeed() {
  const feed = document.getElementById("blog-feed");
  const sentinel = document.getElementById("blog-feed-sentinel");
  const scroller = document.getElementById("blog-feed-scroller");
  if (!feed || !sentinel || !scroller) return;

  const items = Array.from(feed.querySelectorAll("[data-feed-item]"));
  if (items.length === 0) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hiddenItems() {
    return items.filter((item) => item.classList.contains("hidden"));
  }

  function getBatchSize() {
    return window.innerWidth < 1280 ? 1 : 2;
  }

  function doneState() {
    sentinel.classList.add("is-done");
    sentinel.innerHTML = '<span>All caught up. <a href="/archive/" class="font-medium underline">Browse the archive</a>.</span>';
  }

  function nearBottom() {
    const threshold = 140;
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    return distance <= threshold;
  }

  function revealNextBatch() {
    const next = hiddenItems().slice(0, getBatchSize());
    if (next.length === 0) {
      doneState();
      return false;
    }

    next.forEach((item) => {
      item.classList.remove("hidden");
      item.classList.add("blog-feed-item-enter");

      if (prefersReducedMotion) {
        item.classList.add("is-visible");
      } else {
        requestAnimationFrame(() => {
          item.classList.add("is-visible");
        });
      }
    });

    if (hiddenItems().length === 0) {
      doneState();
    }

    return true;
  }

  function revealWhileNearBottom() {
    let safety = 0;
    while (hiddenItems().length > 0 && nearBottom() && safety < items.length) {
      if (!revealNextBatch()) {
        break;
      }
      safety += 1;
    }
  }

  scroller.addEventListener(
    "scroll",
    () => {
      revealWhileNearBottom();
    },
    { passive: true }
  );

  window.addEventListener("resize", revealWhileNearBottom, { passive: true });

  sentinel.addEventListener("click", () => {
    if (hiddenItems().length > 0) {
      revealNextBatch();
    }
  });

  // Ensure short viewports start with enough cards to enable in-panel scrolling.
  revealWhileNearBottom();
}
