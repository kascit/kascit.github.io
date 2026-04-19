/**
 * Mobile Scroll To Top Button
 */
import { isMobile } from "../core/responsive.js";

export function initScrollToTop() {
  if (!isMobile()) return;
  if (document.body.getAttribute("data-scroll-top-init") === "1") return;
  document.body.setAttribute("data-scroll-top-init", "1");

  const btn = document.createElement("button");
  btn.id = "scroll-to-top";
  btn.className = "btn btn-circle btn-primary btn-lg";
  btn.setAttribute("aria-label", "Scroll to top");

  const svgNs = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(svgNs, "svg");
  icon.setAttribute("class", "h-6 w-6");
  icon.setAttribute("fill", "none");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("stroke", "currentColor");
  const path = document.createElementNS(svgNs, "path");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("d", "M5 10l7-7m0 0l7 7m-7-7v18");
  icon.appendChild(path);
  btn.appendChild(icon);
  
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
