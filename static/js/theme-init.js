(function () {
  "use strict";
  var e = document.currentScript;
  if (!e) return;
  var t = e.dataset || {},
    r = { dark: "night", light: "lofi" },
    a = t.defaultColorset || "auto";
  var raw = (window.__getThemeCookie ? window.__getThemeCookie() : null) || a;
  var resolved = (window.__resolveColorset ? window.__resolveColorset(raw) : raw);
  var u = r[resolved] || resolved;
  document.documentElement.setAttribute("data-theme", u);
  document.documentElement.style.backgroundColor = "";
})();
