/**
 * Lazy loading for KaTeX and Mermaid.js
 */
import { getConfig } from './config.js';

function appendStylesheetOnce(href) {
  if (!href) return;
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function appendScriptOnce(src, onLoad) {
  if (!src) return;
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (typeof onLoad === "function") {
      if (existing.getAttribute("data-loaded") === "1") {
        onLoad();
      } else {
        existing.addEventListener("load", onLoad, { once: true });
      }
    }
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.addEventListener("load", () => {
    script.setAttribute("data-loaded", "1");
    if (typeof onLoad === "function") onLoad();
  }, { once: true });
  document.head.appendChild(script);
}

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
      appendScriptOnce(config.katexJs, () => renderKatex(katexInlineElements, katexBlockElements));
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
    appendScriptOnce(config.mermaidJs, () => {
      if (typeof window.initMermaid === "function") {
        window.initMermaid();
      }
    });
  }
}
