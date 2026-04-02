/**
 * Mobile Scroll To Top Button
 */
import { isMobile } from './responsive.js';

export function initScrollToTop() {
  if (!isMobile()) return;

  const btn = document.createElement("button");
  btn.id = "scroll-to-top";
  btn.className = "btn btn-circle btn-primary btn-lg";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>';
  
  btn.style.cssText = "position: fixed; bottom: 1rem; right: 1rem; z-index: 40; opacity: 0; pointer-events: none; transition: opacity 0.3s ease, transform 0.3s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transform: translateY(20px);";
  document.body.appendChild(btn);

  let lastScrollY = 0;
  let scrollingUp = false;
  const scrollThreshold = 300;
  let ticking = false;

  function updateButton() {
    const currentScrollY = window.scrollY;
    scrollingUp = currentScrollY < lastScrollY;
    lastScrollY = currentScrollY;

    if (currentScrollY > scrollThreshold && scrollingUp) {
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

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateButton);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
