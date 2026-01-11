(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};
  var themeMapping = { "goyo-dark": "night", "goyo-light": "lofi" };
  var defaultColorset = data.defaultColorset || "dark";
  var darkBrightness = data.darkBrightness || "normal";
  var lightBrightness = data.lightBrightness || "normal";
  var themeMap = { dark: "goyo-dark", light: "goyo-light" };
  var fallbackTheme = themeMap[defaultColorset] || "goyo-dark";

  // Expose brightness config for other scripts (e.g., goyo.js)
  window.darkBrightness = darkBrightness;
  window.lightBrightness = lightBrightness;

  var currentUserTheme = localStorage.getItem("theme") || fallbackTheme;
  var actualTheme = themeMapping[currentUserTheme] || currentUserTheme;
  var currentBrightness =
    currentUserTheme === "goyo-dark" ? darkBrightness : lightBrightness;

  document.documentElement.setAttribute("data-theme", actualTheme);
  document.documentElement.setAttribute("data-brightness", currentBrightness);
})();
