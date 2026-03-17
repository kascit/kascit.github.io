(function () {
  "use strict";
  var e = document.currentScript;
  if (!e) return;
  var t = e.dataset || {},
    r = { dark: "night", light: "lofi" },
    a = t.defaultColorset || "dark";
  var i = (window.__getThemeCookie ? window.__getThemeCookie() : null) || a,
    u = r[i] || i;
  document.documentElement.setAttribute("data-theme", u);
  document.documentElement.style.backgroundColor = "";
})();
