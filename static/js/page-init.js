(function () {
  "use strict";
  var el = document.currentScript;
  var data = (el && el.dataset) || {};
  var themeMap = { dark: "goyo-dark", light: "goyo-light" };
  var defaultColorset = data.defaultColorset || "dark";
  var darkBrightness = data.darkBrightness || "normal";
  var lightBrightness = data.lightBrightness || "normal";

  window.defaultColorset = defaultColorset;
  window.darkBrightness = window.darkBrightness || darkBrightness;
  window.lightBrightness = window.lightBrightness || lightBrightness;
  window.themeMap = themeMap;
  window.fallbackTheme = themeMap[defaultColorset] || "goyo-dark";

  var themeMapping = { "goyo-dark": "night", "goyo-light": "lofi" };
  var currentUserTheme = localStorage.getItem("theme") || window.fallbackTheme;

  window.initMermaid = function () {
    var mermaidTheme = currentUserTheme === "goyo-light" ? "light" : "dark";
    if (typeof mermaid !== "undefined") {
      mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
      var renderMermaid = async function () {
        var mermaidElements = document.querySelectorAll(".mermaid");
        if (mermaidElements.length > 0) {
          await mermaid.run({ nodes: mermaidElements });
        }
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderMermaid);
      } else {
        renderMermaid();
      }
    }
  };

  if (typeof mermaid !== "undefined") {
    window.initMermaid();
  }
})();
