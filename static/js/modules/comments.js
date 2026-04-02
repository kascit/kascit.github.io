/**
 * Giscus Comments wrapper
 * - Injects giscus once on page load
 * - On theme change, uses postMessage to update the iframe theme
 *   (no reload, no re-injection, no loader flash)
 */

export function initComments() {
  const mount = document.getElementById("comments");
  if (!mount) return;

  // Only inject if not already present
  if (mount.querySelector("iframe.giscus-frame, script[src*='giscus']")) return;

  const isDark = document.documentElement.classList.contains("dark");
  const giscusTheme = isDark ? "dark" : "light";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", mount.getAttribute("data-repo") || "");
  script.setAttribute("data-repo-id", mount.getAttribute("data-repo-id") || "");
  script.setAttribute("data-category", mount.getAttribute("data-category") || "");
  script.setAttribute("data-category-id", mount.getAttribute("data-category-id") || "");
  script.setAttribute("data-mapping", mount.getAttribute("data-mapping") || "pathname");
  script.setAttribute("data-strict", mount.getAttribute("data-strict") || "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "1");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", giscusTheme);
  script.setAttribute("data-lang", "en");
  script.setAttribute("data-loading", "lazy");
  script.crossOrigin = "anonymous";
  script.async = true;
  mount.appendChild(script);
}

/**
 * Update giscus theme via postMessage — no reload, no flash.
 */
function updateGiscusTheme(theme) {
  const iframe = document.querySelector("iframe.giscus-frame");
  if (!iframe) return;
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app"
  );
}

// Listen for theme changes and update giscus in-place
document.addEventListener("themeChanged", (e) => {
  if (document.getElementById("comments")) {
    updateGiscusTheme(e.detail); // e.detail is "dark" or "light"
  }
});
