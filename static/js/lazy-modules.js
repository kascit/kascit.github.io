(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};

  window.addEventListener("DOMContentLoaded", function () {
    var katexInlineElements = document.querySelectorAll(".katex-inline");
    var katexBlockElements = document.querySelectorAll(".katex-block");
    var hasKatex =
      katexInlineElements.length > 0 || katexBlockElements.length > 0;
    var hasMermaid = document.querySelector(".mermaid");

    if (hasKatex && data.katexCss && data.katexJs) {
      var katexCSS = document.createElement("link");
      katexCSS.rel = "stylesheet";
      katexCSS.href = data.katexCss;
      document.head.appendChild(katexCSS);

      var katexScript = document.createElement("script");
      katexScript.src = data.katexJs;
      katexScript.onload = function () {
        katexInlineElements.forEach(function (elem) {
          var texContent = elem.textContent || elem.innerText;
          try {
            katex.render(texContent, elem, {
              throwOnError: false,
              displayMode: false,
            });
          } catch (e) {
            console.error("KaTeX render error:", e);
          }
        });

        katexBlockElements.forEach(function (elem) {
          var texContent = elem.textContent || elem.innerText;
          try {
            katex.render(texContent, elem, {
              throwOnError: false,
              displayMode: true,
            });
          } catch (e) {
            console.error("KaTeX render error:", e);
          }
        });
      };
      document.head.appendChild(katexScript);
    }

    if (hasMermaid && data.mermaidJs) {
      var mermaidScript = document.createElement("script");
      mermaidScript.src = data.mermaidJs;
      mermaidScript.onload = function () {
        if (typeof window.initMermaid === "function") {
          window.initMermaid();
        }
      };
      document.head.appendChild(mermaidScript);
    }
  });
})();
