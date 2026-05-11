// Auto-reload when the browser comes back online (offline page).
(function () {
  var el =
    document.querySelector("[data-offline-status]") ||
    document.getElementById("offline-status");
  if (!el) return;
  var ATTEMPT_KEY = "offlineReloadLastAttempt";
  var ATTEMPT_WINDOW_MS = 6000;
  var POLL_INTERVAL_MS = 5000;
  var PING_TIMEOUT_MS = 2500;
  var isChecking = false;
  var pollInterval = null;

  el.textContent = "Waiting for connection";
  el.classList.add("status-pill", "status-pill--pending");

  function markOnlineAndRecover() {
    el.textContent = "Back online - reloading";
    el.classList.remove("status-pill--pending");
    el.classList.add("status-pill--online");

    if (pollInterval) clearInterval(pollInterval);

    setTimeout(function () {
      var path = window.location.pathname || "/";
      if (path === "/offline" || path === "/offline/") {
        window.location.assign("/");
        return;
      }
      window.location.reload();
    }, 600);
  }

  function attemptedRecently() {
    try {
      var ts = Number(window.sessionStorage.getItem(ATTEMPT_KEY) || "0");
      return Date.now() - ts < ATTEMPT_WINDOW_MS;
    } catch {
      return false;
    }
  }

  function rememberAttempt() {
    try {
      window.sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures.
    }
  }

  function probeNetwork() {
    // Requests under /__runtime/ are excluded from SW handling in static/sw.js.
    var controller = new AbortController();
    var timeoutId = window.setTimeout(function () {
      controller.abort();
    }, PING_TIMEOUT_MS);

    return fetch("/__runtime/ping?ts=" + Date.now(), {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        window.clearTimeout(timeoutId);
      });
  }

  function maybeRecover() {
    if (isChecking || attemptedRecently()) return;
    isChecking = true;

    el.textContent = "Checking connection";

    probeNetwork()
      .then(function (online) {
        if (!online) {
          el.textContent = "Waiting for connection";
          return;
        }

        rememberAttempt();
        markOnlineAndRecover();
      })
      .finally(function () {
        isChecking = false;
      });
  }

  if (navigator.onLine) {
    maybeRecover();
  }

  window.addEventListener("online", maybeRecover);

  function stopPolling() {
    if (pollInterval) {
      window.clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Periodic polling: keep checking network status every POLL_INTERVAL_MS
  // even if 'online' event doesn't fire. This ensures recovery on reconnect.
  pollInterval = setInterval(function () {
    if (navigator.onLine) {
      maybeRecover();
    }
  }, POLL_INTERVAL_MS);

  window.addEventListener("pagehide", stopPolling, { once: true });
  window.addEventListener("beforeunload", stopPolling, { once: true });
})();
