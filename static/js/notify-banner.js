// Notification banner logic for blog posts.
(function () {
  "use strict";

  var banner = document.getElementById("notify-banner");
  var dismissBtn = document.getElementById("notify-dismiss");
  var enableBtn = document.getElementById("notify-enable");
  var toast = document.getElementById("notify-toast");
  var toastMsg = document.getElementById("notify-toast-message");

  if (!banner) return;

  // Toast helper
  function showToast(message, type) {
    var alertEl = toast.querySelector(".alert");
    alertEl.className =
      "alert shadow-lg " +
      (type === "success"
        ? "alert-success"
        : type === "error"
        ? "alert-error"
        : "alert-info");
    toastMsg.textContent = message;
    toast.style.display = "block";

    setTimeout(function () {
      toast.style.display = "none";
    }, 3500);
  }

  // Check if should show banner
  var dismissed = localStorage.getItem("notify-banner-dismissed");
  var notificationsGranted =
    typeof Notification !== "undefined" &&
    Notification.permission === "granted";

  // Don't show if dismissed recently (7 days) or already granted
  if (
    dismissed &&
    Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000
  ) {
    return;
  }

  if (notificationsGranted) {
    return;
  }

  // Show banner
  banner.style.display = "flex";

  // Dismiss handler
  dismissBtn.addEventListener("click", function () {
    banner.style.display = "none";
    localStorage.setItem("notify-banner-dismissed", Date.now());
    showToast("No worries! We will ask again later", "info");
  });

  // Enable handler
  enableBtn.addEventListener("click", function () {
    if (typeof Notification === "undefined") {
      showToast("Your browser does not support notifications", "error");
      return;
    }

    if (Notification.permission === "granted") {
      banner.style.display = "none";
      showToast("You are already subscribed!", "success");
      return;
    }

    if (Notification.permission === "denied") {
      showToast(
        "Notifications blocked. Enable them in browser settings",
        "error"
      );
      return;
    }

    // Request permission
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        banner.style.display = "none";
        localStorage.setItem("notify-banner-dismissed", Date.now());
        showToast(
          "Awesome! You will get notified about new posts",
          "success"
        );
      } else {
        showToast(
          "Permission denied. You can enable it later in settings",
          "error"
        );
      }
    });
  });
})();
