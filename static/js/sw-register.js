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

      // Check for new posts on every page load (SW will de-dup via stored guid)
      if (reg.active) {
        reg.active.postMessage({ type: "CHECK_LATEST_POST" });
      }

      // Also check when a new SW takes over (e.g. after site deploy)
      var refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (refreshing) return;
        refreshing = true;
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "CHECK_LATEST_POST",
          });
        }
      });
    });
  });

  // Request notification permission on PWA install
  window.addEventListener("appinstalled", function () {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(function () {});
    }
  });

  // Also allow requesting notification permission via a user gesture.
  // Look for any element with [data-enable-notifications] on the page.
  document.addEventListener("click", function (e) {
    var btn =
      e.target.closest && e.target.closest("[data-enable-notifications]");
    if (!btn) return;
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission()
        .then(function (result) {
          if (result === "granted" && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "CHECK_LATEST_POST",
            });
          }
        })
        .catch(function () {});
    }
  });
})();
