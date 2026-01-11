(function () {
  "use strict";
  var el = document.currentScript;
  if (!el || !("serviceWorker" in navigator)) return;
  var swPath = (el.dataset && el.dataset.swPath) || "/sw.js";

  window.addEventListener("load", function () {
    navigator.serviceWorker.register(swPath).catch(function (error) {
      console.error("Service Worker registration failed:", error);
    });

    navigator.serviceWorker.ready.then(function (reg) {
      if ("periodicSync" in reg) {
        reg.periodicSync
          .register("content-sync", { minInterval: 24 * 60 * 60 * 1000 })
          .catch(function () {});
      }
      if ("sync" in reg) {
        reg.sync.register("sync-site-refresh").catch(function () {});
      }

      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        try {
          Notification.requestPermission().catch(function () {});
        } catch (e) {}
      }

      if (reg.active) {
        reg.active.postMessage({ type: "CHECK_LATEST_POST" });
      }
    });
  });
})();
