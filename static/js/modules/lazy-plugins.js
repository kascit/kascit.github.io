/**
 * Lazy loading for KaTeX and Mermaid.js
 */
import { getConfig } from './config.js';
import { appendScriptOnce, appendStylesheetOnce } from './resource-loader.js';

function renderKatex(katexInlineElements, katexBlockElements) {
  if (typeof window.katex === "undefined") return;

  katexInlineElements.forEach((elem) => {
    const texContent = elem.textContent || elem.innerText;
    try { window.katex.render(texContent, elem, { throwOnError: false, displayMode: false }); } catch (e) { console.error(e); }
  });

  katexBlockElements.forEach((elem) => {
    const texContent = elem.textContent || elem.innerText;
    try { window.katex.render(texContent, elem, { throwOnError: false, displayMode: true }); } catch (e) { console.error(e); }
  });
}

export function initLazyPlugins() {
  const config = getConfig();
  
  const katexInlineElements = document.querySelectorAll(".katex-inline");
  const katexBlockElements = document.querySelectorAll(".katex-block");
  const hasKatex = katexInlineElements.length > 0 || katexBlockElements.length > 0;
  const hasMermaid = document.querySelector(".mermaid");

  if (hasKatex && config.katexCss && config.katexJs) {
    appendStylesheetOnce(config.katexCss);
    if (typeof window.katex !== "undefined") {
      renderKatex(katexInlineElements, katexBlockElements);
    } else {
      appendScriptOnce({
        src: config.katexJs,
        loadedAttribute: "data-loaded",
        onLoad: () => renderKatex(katexInlineElements, katexBlockElements),
      });
    }
  }

  // Pre-initialize Mermaid globally so it binds to the theme system properly later
  window.initMermaid = async function() {
    const isDark = document.documentElement.classList.contains("dark");
    if (typeof window.mermaid !== "undefined") {
      window.mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default" });
      const mermaidElements = document.querySelectorAll(".mermaid");
      if (mermaidElements.length > 0) {
        await window.mermaid.run({ nodes: mermaidElements });
      }
    }
  };

  if (hasMermaid && config.mermaidJs) {
    appendScriptOnce({
      src: config.mermaidJs,
      loadedAttribute: "data-loaded",
      onLoad: () => {
        if (typeof window.initMermaid === "function") {
          window.initMermaid();
        }
      },
    });
  }
}
