(function () {
  "use strict";
  var el = document.currentScript;
  var data = (el && el.dataset) || {};
  var defaultColorset = data.defaultColorset || "dark";

  window.defaultColorset = defaultColorset;
  window.fallbackTheme = defaultColorset || "dark";

  var themeMapping = { dark: "night", light: "lofi" };
  var currentUserTheme =
    (window.__getThemeCookie ? window.__getThemeCookie() : null) ||
    window.fallbackTheme;

  window.initMermaid = function () {
    var mermaidTheme = currentUserTheme === "light" ? "light" : "dark";
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
