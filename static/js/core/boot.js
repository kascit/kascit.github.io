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
  d.setAttribute("data-ui-init", "0");
  d.setAttribute(
    "data-sidebar-collapsed",
    getL("sidebar-collapsed") ? "1" : "0",
  );
  d.setAttribute("data-toc-collapsed", getL("toc-collapsed") ? "1" : "0");
})();
