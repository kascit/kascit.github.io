// Notification banner logic for blog posts.
(function () {
  "use strict";

  var banner = document.querySelector("[data-notify-banner]");
  var dismissBtn = banner && banner.querySelector("[data-notify-dismiss]");
  var enableBtn = banner && banner.querySelector("[data-notify-enable]");
  var toast = document.querySelector("[data-notify-toast]");
  var toastAlert = toast && toast.querySelector("[data-notify-toast-alert]");
  var toastMsg = toast && toast.querySelector("[data-notify-toast-message]");
  var toastTimer = 0;

  var DISMISS_KEY = "notify-banner-dismissed";
  var DENIED_KEY = "notify-banner-denied";
  var DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  var DENIED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

  if (!banner) return;

  function readTimestamp(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return 0;
      var value = Number(raw);
      return Number.isFinite(value) ? value : 0;
    } catch (_) {
      return 0;
    }
  }

  function writeTimestamp(key) {
    try {
      localStorage.setItem(key, String(Date.now()));
    } catch (_) {
      // localStorage can fail in strict privacy mode
    }
  }

  function hideBanner() {
    banner.classList.add("hidden");
    banner.style.display = "none";
    banner.setAttribute("aria-hidden", "true");
  }

  function showBanner() {
    banner.classList.remove("hidden");
    banner.style.removeProperty("display");
    banner.removeAttribute("aria-hidden");
  }

  function setEnableBusy(isBusy) {
    if (!enableBtn) return;
    enableBtn.disabled = isBusy;
    enableBtn.classList.toggle("is-loading", isBusy);
  }

  // Toast helper
  function showToast(message, type) {
    if (!toast || !toastAlert || !toastMsg) return;

    var variant =
      type === "success"
        ? "success"
        : type === "error"
        ? "error"
        : "info";

    toastAlert.classList.remove(
      "notify-toast__content--success",
      "notify-toast__content--error",
      "notify-toast__content--info",
    );
    toastAlert.classList.add("notify-toast__content--" + variant);
    toastMsg.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.classList.add("hidden");
    }, 3600);
  }

  function requestPermission() {
    if (typeof Notification === "undefined") {
      return Promise.resolve("unsupported");
    }

    try {
      var maybePromise = Notification.requestPermission();
      if (maybePromise && typeof maybePromise.then === "function") {
        return maybePromise;
      }
    } catch (_) {
      return Promise.resolve("denied");
    }

    return Promise.resolve(Notification.permission);
  }

  function requestLatestCheckFromWorker() {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready
      .then(function (registration) {
        var target =
          registration.active || registration.waiting || registration.installing;
        if (target) {
          target.postMessage({ type: "CHECK_LATEST_POST" });
        }
      })
      .catch(function () {
        // Service worker may not be ready yet
      });
  }

  // Check if should show banner
  var supportsNotifications = typeof Notification !== "undefined";
  var supportsServiceWorker =
    "serviceWorker" in navigator && window.isSecureContext;
  var notificationsGranted =
    typeof Notification !== "undefined" &&
    Notification.permission === "granted";
  var notificationsDenied =
    typeof Notification !== "undefined" &&
    Notification.permission === "denied";
  var canPrompt =
    typeof Notification !== "undefined" &&
    Notification.permission === "default";
  var dismissedAt = readTimestamp(DISMISS_KEY);
  var deniedAt = readTimestamp(DENIED_KEY);
  var recentlyDismissed =
    dismissedAt && Date.now() - dismissedAt < DISMISS_WINDOW_MS;
  var recentlyDenied = deniedAt && Date.now() - deniedAt < DENIED_WINDOW_MS;

  // Show only when this prompt is actionable for the user.
  if (
    !supportsNotifications ||
    !supportsServiceWorker ||
    notificationsGranted ||
    notificationsDenied ||
    !canPrompt ||
    recentlyDismissed ||
    recentlyDenied
  ) {
    hideBanner();
    return;
  }

  // Show banner
  showBanner();

  // Dismiss handler
  if (dismissBtn) {
    dismissBtn.addEventListener("click", function () {
      hideBanner();
      writeTimestamp(DISMISS_KEY);
      showToast("No worries. We will ask again later.", "info");
    });
  }

  // Enable handler
  if (enableBtn) {
    enableBtn.addEventListener("click", function () {
      if (!supportsNotifications) {
        hideBanner();
        showToast("Your browser does not support notifications.", "error");
        return;
      }

      if (!supportsServiceWorker) {
        hideBanner();
        showToast(
          "Background notifications need HTTPS and service worker support.",
          "error",
        );
        return;
      }

      setEnableBusy(true);
      requestPermission()
        .then(function (permission) {
          if (permission === "granted") {
            hideBanner();
            writeTimestamp(DISMISS_KEY);
            requestLatestCheckFromWorker();
            showToast("Awesome. New posts will trigger notifications.", "success");
            return;
          }

          if (permission === "denied") {
            hideBanner();
            writeTimestamp(DENIED_KEY);
            showToast(
              "Notifications were blocked. You can enable them in browser settings.",
              "error",
            );
            return;
          }

          showToast("Permission was not granted this time.", "info");
        })
        .catch(function () {
          showToast("Could not request notification permission right now.", "error");
        })
        .then(function () {
          setEnableBusy(false);
        });
    });
  }
})();
