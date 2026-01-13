(function () {
  "use strict";
  var e = document.currentScript;
  if (!e) return;
  var t = e.dataset || {},
    r = { "goyo-dark": "night", "goyo-light": "lofi" },
    a = t.defaultColorset || "dark",
    n = t.darkBrightness || "normal",
    d = t.lightBrightness || "normal",
    o = { dark: "goyo-dark", light: "goyo-light" },
    s = o[a] || "goyo-dark";
  (window.darkBrightness = n), (window.lightBrightness = d);
  var i = localStorage.getItem("theme") || s,
    u = r[i] || i,
    l = "goyo-dark" === i ? n : d;
  document.documentElement.setAttribute("data-theme", u),
    document.documentElement.setAttribute("data-brightness", l);
})();
