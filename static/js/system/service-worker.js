/**
 * Service Worker Registration & Notification sync
 */
import { getConfig } from "../core/config.js";

const PERIODIC_SYNC_TAG = "content-sync";
const ONE_OFF_SYNC_TAG = "sync-site-refresh";

function postLatestCheckToWorker(registration) {
  if (!registration) return;
  const target = registration.active || registration.waiting || registration.installing;
  if (target) {
    target.postMessage({ type: "CHECK_LATEST_POST" });
  }
}

async function registerPeriodicSync(registration) {
  if (!("periodicSync" in registration)) return;

  try {
    const tags = typeof registration.periodicSync.getTags === "function"
      ? await registration.periodicSync.getTags()
      : [];
    if (tags.includes(PERIODIC_SYNC_TAG)) return;
    await registration.periodicSync.register(PERIODIC_SYNC_TAG, {
      minInterval: 24 * 60 * 60 * 1000,
    });
  } catch (_) {
    // Unsupported by browser or blocked by permissions/power policy.
  }
}

async function registerBackgroundSync(registration) {
  if (!("sync" in registration)) return;

  try {
    const tags = typeof registration.sync.getTags === "function"
      ? await registration.sync.getTags()
      : [];
    if (tags.includes(ONE_OFF_SYNC_TAG)) return;
    await registration.sync.register(ONE_OFF_SYNC_TAG);
  } catch (_) {
    // Unsupported by browser or blocked by permissions/power policy.
  }
}

async function setupServiceWorker(swPath) {
  try {
    await navigator.serviceWorker.register(swPath);
    const registration = await navigator.serviceWorker.ready;

    registerPeriodicSync(registration);
    registerBackgroundSync(registration);
    postLatestCheckToWorker(registration);

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;

      navigator.serviceWorker.ready
        .then(postLatestCheckToWorker)
        .catch(() => {
          // Ignore temporary controller churn.
        })
        .then(() => {
          refreshing = false;
        });
    });
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

let swInitTriggered = false;

function startServiceWorker(swPath) {
  if (swInitTriggered) return;
  swInitTriggered = true;
  setupServiceWorker(swPath);
}

export function initServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  const config = getConfig();
  const swPath = config.swPath || "/sw.js";

  if (document.readyState === "complete") {
    startServiceWorker(swPath);
    return;
  }

  // Register at load for minimal page contention.
  window.addEventListener("load", () => {
    startServiceWorker(swPath);
  }, { once: true });

  // Safety net for scanners / environments that check quickly.
  window.setTimeout(() => {
    startServiceWorker(swPath);
  }, 1500);
}
