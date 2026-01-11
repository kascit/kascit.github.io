(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var gtagId = (el.dataset && el.dataset.gtagId) || "";
  if (!gtagId) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", gtagId);
})();
