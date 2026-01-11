(function () {
  "use strict";
  var isDesktop =
    matchMedia("(hover: hover)").matches &&
    matchMedia("(pointer: fine)").matches;

  function renderShortcut(el) {
    var spec = el.getAttribute("data-shortcut");
    if (!spec) return;

    var desktopOnly = el.getAttribute("data-desktop-only") === "true";
    if (desktopOnly && !isDesktop) {
      el.style.display = "none";
      return;
    }

    var platform =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      "";
    var isMac = /mac/i.test(platform);
    var primary = isMac ? "⌘" : "Ctrl";
    var altLabel = isMac ? "Option" : "Alt";
    var metaLabel = isMac ? "⌘" : "Win";

    var parts = spec.split("+").map(function (key) {
      var lower = key.trim().toLowerCase();
      if (lower === "primary") return primary;
      if (lower === "alt") return altLabel;
      if (lower === "meta") return metaLabel;
      if (lower === "shift") return "Shift";
      if (lower === "cmd" || lower === "command") return "⌘";
      return key.length === 1 ? key.toUpperCase() : key;
    });

    el.innerHTML = parts
      .map(function (k) {
        return '<kbd class="kbd">' + k + "</kbd>";
      })
      .join("");
    el.style.display = "inline-flex";
    el.style.gap = "2px";
    el.classList.add("shortcut-hint-ready");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!isDesktop) {
      document
        .querySelectorAll('[data-desktop-only="true"]')
        .forEach(function (el) {
          el.style.display = "none";
        });
    }
    document.querySelectorAll("[data-shortcut]").forEach(renderShortcut);
  });
})();
