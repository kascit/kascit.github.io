// Critical prepaint bootstrap that must execute synchronously in <head>.
// Reads template values through data-* attributes on its script tag.
(function () {
  var s = document.currentScript,
    d = document.documentElement;
  var cs = s ? s.getAttribute("data-default-colorset") : "dark";

  function getL(k) {
    try {
      return localStorage.getItem(k) === "1";
    } catch {
      return false;
    }
  }

  var c = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  var raw = c ? decodeURIComponent(c[1]) : cs;
  var mode =
    raw === "auto"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : raw;

  d.setAttribute("data-theme", mode);
  // Also set a theme class immediately so CSS prepaint rules using
  // `html.dark` / `html.light` apply before the JS modules load. This
  // prevents a flash/flicker of the wrong logo variant during navigation.
  try {
    d.classList.remove("light", "dark");
    d.classList.add(mode);
  } catch {
    // Ignore failures (e.g. if classList isn't supported). The data-theme
    // attribute will still be set correctly.
  }
  d.setAttribute("data-ui-init", "0");
  d.setAttribute(
    "data-sidebar-collapsed",
    getL("sidebar-collapsed") ? "1" : "0",
  );
  d.setAttribute("data-toc-collapsed", getL("toc-collapsed") ? "1" : "0");

  function activateDeferredCss() {
    var links = document.querySelectorAll('link[data-defer-css="true"]');
    for (var i = 0; i < links.length; i += 1) {
      links[i].media = "all";
      links[i].removeAttribute("data-defer-css");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activateDeferredCss, {
      once: true,
    });
  } else {
    activateDeferredCss();
  }
})();
