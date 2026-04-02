/**
 * Service Worker Registration & Notification sync
 */
import { getConfig } from './config.js';

export function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const config = getConfig();
  const swPath = config.swPath || "/sw.js";

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(swPath).catch(error => {
      console.error("Service Worker registration failed:", error);
    });

    navigator.serviceWorker.ready.then(reg => {
      if ("periodicSync" in reg) reg.periodicSync.register("content-sync", { minInterval: 24 * 60 * 60 * 1000 }).catch(() => {});
      if ("sync" in reg) reg.sync.register("sync-site-refresh").catch(() => {});

      if (reg.active) reg.active.postMessage({ type: "CHECK_LATEST_POST" });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "CHECK_LATEST_POST" });
        }
      });
    });
  });

  window.addEventListener("appinstalled", () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  });

  document.addEventListener("click", e => {
    const btn = e.target.closest && e.target.closest("[data-enable-notifications]");
    if (!btn) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().then(result => {
        if (result === "granted" && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "CHECK_LATEST_POST" });
        }
      }).catch(() => {});
    }
  });
}
