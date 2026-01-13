(function () {
  "use strict";

  /**
   * Scroll-to-top button - Mobile only
   * Uses centralized responsive helpers for consistent behavior
   */

  // Only initialize on mobile devices
  if (!window.ResponsiveHelpers || !window.ResponsiveHelpers.isMobile()) {
    return;
  }

  function init() {
    var btn = document.createElement("button");
    btn.id = "scroll-to-top";
    btn.className = "btn btn-circle btn-primary btn-lg";
    btn.setAttribute("aria-label", "Scroll to top");
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>';

    // Inline styles for positioning and animation
    btn.style.cssText =
      "position: fixed; bottom: 1rem; right: 1rem; z-index: 50; opacity: 0; pointer-events: none; transition: opacity 0.3s ease, transform 0.3s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transform: translateY(20px);";

    document.body.appendChild(btn);

    var lastScrollY = 0;
    var scrollingUp = false;
    var scrollThreshold = 300; // Show after scrolling down 300px
    var ticking = false;

    function updateButton() {
      var currentScrollY = window.scrollY;
      var isScrolledDown = currentScrollY > scrollThreshold;
      var isGoingUp = currentScrollY < lastScrollY;

      scrollingUp = isGoingUp;
      lastScrollY = currentScrollY;

      // Show: scrolled down past threshold AND scrolling up
      // Hide: at top OR scrolling down
      if (isScrolledDown && scrollingUp) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        btn.style.transform = "translateY(0)";
      } else {
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
        btn.style.transform = "translateY(20px)";
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateButton);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
