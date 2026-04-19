/**
 * Blog feed progressive reveal (infinite-scroll style)
 */

import { isLargeScreen, prefersReducedMotion } from "../core/responsive.js";

export function initBlogFeed() {
  const mount = document.querySelector("[data-blog-feed-mount]");
  const feed = (mount && mount.querySelector("[data-blog-feed]")) || document.getElementById("blog-feed");
  const sentinel = (mount && mount.querySelector("[data-blog-feed-sentinel]")) || document.getElementById("blog-feed-sentinel");
  const scroller = (mount && mount.querySelector("[data-blog-feed-scroller]")) || document.getElementById("blog-feed-scroller");
  if (!feed || !sentinel || !scroller) return;

  const items = Array.from(feed.querySelectorAll("[data-feed-item]"));
  if (items.length === 0) return;

  function hiddenItems() {
    return items.filter((item) => item.classList.contains("hidden"));
  }

  function getBatchSize() {
    return isLargeScreen() ? 2 : 1;
  }

  function doneState() {
    sentinel.classList.add("is-done");
    sentinel.textContent = "";
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("All caught up. "));
    const archiveLink = document.createElement("a");
    archiveLink.href = "/archive/";
    archiveLink.className = "font-medium underline";
    archiveLink.textContent = "Browse the archive";
    span.appendChild(archiveLink);
    span.appendChild(document.createTextNode("."));
    sentinel.appendChild(span);
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

      if (prefersReducedMotion()) {
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
    if (!nearBottom()) return;

    const revealed = revealNextBatch();
    if (revealed && hiddenItems().length > 0) {
      requestAnimationFrame(revealWhileNearBottom);
    }
  }

  let revealRaf = null;
  function scheduleRevealWhileNearBottom() {
    if (revealRaf) return;
    revealRaf = requestAnimationFrame(() => {
      revealRaf = null;
      revealWhileNearBottom();
    });
  }

  scroller.addEventListener(
    "scroll",
    () => {
      scheduleRevealWhileNearBottom();
    },
    { passive: true }
  );

  window.addEventListener("resize", scheduleRevealWhileNearBottom, { passive: true });

  sentinel.addEventListener("click", () => {
    if (hiddenItems().length > 0) {
      revealNextBatch();
    }
  });

  // Ensure short viewports start with enough cards to enable in-panel scrolling.
  scheduleRevealWhileNearBottom();
}
