(function () {
  "use strict";
  var e = document.currentScript;
  if (!e) return;
  var t = e.dataset || {},
    r = { dark: "night", light: "lofi" },
    a = t.defaultColorset || "dark",
    n = t.darkBrightness || "normal",
    d = t.lightBrightness || "normal";
  ((window.darkBrightness = n), (window.lightBrightness = d));
  var i = (window.__getThemeCookie ? window.__getThemeCookie() : null) || a,
    u = r[i] || i,
    l = "dark" === i ? n : d;
  (document.documentElement.setAttribute("data-theme", u),
    document.documentElement.setAttribute("data-brightness", l));
})();
