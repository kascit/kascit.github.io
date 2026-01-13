(function () {
  "use strict";
  var e = document.currentScript;
  if (!e) return;
  var t = (e.dataset && e.dataset.gtagId) || "";
  if (!t) return;
  window.dataLayer = window.dataLayer || [];
  function a() {
    dataLayer.push(arguments);
  }
  a("js", new Date()), a("config", t);
})();
