/**
 * Code block enhancements:
 * - language badge
 * - line numbers
 * - copy button
 */

const LANGUAGE_LABELS = {
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",
  py: "Python",
  rb: "Ruby",
  rs: "Rust",
  go: "Go",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  yml: "YAML",
  yaml: "YAML",
  toml: "TOML",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  md: "Markdown",
  dockerfile: "Dockerfile",
  sql: "SQL",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  cs: "C#",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
};

const METRIC_SYNC_DEBOUNCE_MS = 80;
const enhancedCodeBlocks = new Map();

let metricSyncBound = false;
let metricSyncTimer = null;

function clearInlineBackgrounds(node) {
  if (!node) return;

  node.style.removeProperty("background");
  node.style.removeProperty("background-color");

  node.querySelectorAll("[style]").forEach((el) => {
    if (!el.getAttribute("style")) return;
    el.style.removeProperty("background");
    el.style.removeProperty("background-color");
  });
}

function normalizeCodeText(value, options = {}) {
  const { trimLeadingNewline = true, trimTrailingNewline = false } = options;
  if (!value) return "";
  let normalized = String(value).replace(/\r\n/g, "\n");

  if (trimLeadingNewline && normalized.startsWith("\n")) {
    normalized = normalized.slice(1);
  }

  if (trimTrailingNewline) {
    normalized = normalized.replace(/\n$/, "");
  }

  return normalized;
}

function inferLanguage(codeBlock, pre) {
  const fromData = (pre.getAttribute("data-lang") || codeBlock.getAttribute("data-lang") || "").trim();
  if (fromData) return fromData.toLowerCase();

  const languageClass = Array.from(codeBlock.classList).find((cls) => cls.startsWith("language-"));
  if (languageClass) {
    return languageClass.slice("language-".length).toLowerCase();
  }

  return "text";
}

function toLanguageLabel(language) {
  if (!language) return "Text";
  const normalized = language.toLowerCase();
  if (LANGUAGE_LABELS[normalized]) return LANGUAGE_LABELS[normalized];
  if (normalized.length <= 4) return normalized.toUpperCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function createLineNumberNode(lineCount) {
  const gutter = document.createElement("span");
  gutter.className = "codeblock-gutter";
  gutter.setAttribute("aria-hidden", "true");

  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= lineCount; i += 1) {
    const lineNumber = document.createElement("span");
    lineNumber.className = "codeblock-line-number";
    lineNumber.textContent = String(i);
    fragment.appendChild(lineNumber);
  }

  gutter.appendChild(fragment);
  return gutter;
}

function normalizeLineHeight(lineHeight, fontSize) {
  if (lineHeight && lineHeight !== "normal") {
    return lineHeight;
  }

  const fontSizeValue = Number.parseFloat(fontSize || "");
  if (Number.isFinite(fontSizeValue) && fontSizeValue > 0) {
    return `${(fontSizeValue * 1.5).toFixed(3)}px`;
  }

  return "";
}

function syncCodeMetrics(pre, codeBlock) {
  if (!pre || !codeBlock || !pre.isConnected || !codeBlock.isConnected) return;

  const styles = window.getComputedStyle(codeBlock);
  const lineHeight = normalizeLineHeight(styles.lineHeight, styles.fontSize);
  const fontSize = styles.fontSize;
  const fontFamily = styles.fontFamily;

  if (lineHeight && lineHeight !== "normal") {
    pre.style.setProperty("--code-block-line-height", lineHeight);
  }
  if (fontSize) {
    pre.style.setProperty("--code-block-font-size", fontSize);
  }
  if (fontFamily) {
    pre.style.setProperty("--code-block-font-family", fontFamily);
  }
}

function scheduleMetricSync() {
  if (metricSyncTimer) {
    window.clearTimeout(metricSyncTimer);
  }

  metricSyncTimer = window.setTimeout(() => {
    metricSyncTimer = null;

    enhancedCodeBlocks.forEach((codeBlock, pre) => {
      if (!pre.isConnected || !codeBlock.isConnected) {
        enhancedCodeBlocks.delete(pre);
        return;
      }
      syncCodeMetrics(pre, codeBlock);
    });
  }, METRIC_SYNC_DEBOUNCE_MS);
}

function bindMetricSyncEvents() {
  if (metricSyncBound) return;
  metricSyncBound = true;

  window.addEventListener("resize", scheduleMetricSync, { passive: true });
  window.addEventListener("orientationchange", scheduleMetricSync, { passive: true });
  window.addEventListener("load", scheduleMetricSync, { once: true });
  document.addEventListener("themeChanged", scheduleMetricSync);

  if (document.fonts && typeof document.fonts.addEventListener === "function") {
    document.fonts.addEventListener("loadingdone", scheduleMetricSync);
  }
}

function createToolbar(languageLabel, copyText) {
  const toolbar = document.createElement("div");
  toolbar.className = "codeblock-toolbar";

  const langTag = document.createElement("span");
  langTag.className = "codeblock-lang-tag";
  langTag.textContent = languageLabel;

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "codeblock-copy-btn";
  copyBtn.setAttribute("aria-label", "Copy code");
  copyBtn.setAttribute("title", "Copy code");
  copyBtn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';

  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        copyBtn.classList.add("copied");
        copyBtn.setAttribute("title", "Copied!");
        window.setTimeout(() => {
          copyBtn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
          copyBtn.classList.remove("copied");
          copyBtn.setAttribute("title", "Copy code");
        }, 1400);
      })
      .catch(() => {
        copyBtn.setAttribute("title", "Unable to copy");
      });
  });

  toolbar.appendChild(langTag);
  toolbar.appendChild(copyBtn);
  return toolbar;
}

function enhanceCodeBlock(codeBlock) {
  const pre = codeBlock.parentElement;
  if (!pre || pre.tagName !== "PRE") return;
  if (pre.classList.contains("mockup-code")) return;
  if (pre.getAttribute("data-codeblock-enhanced") === "1") return;

  const rawCodeText = codeBlock.textContent || codeBlock.innerText || "";
  const normalizedCode = normalizeCodeText(rawCodeText, { trimLeadingNewline: true, trimTrailingNewline: true });
  const codeForLineCount = normalizeCodeText(rawCodeText, { trimLeadingNewline: true, trimTrailingNewline: false });
  const lines = codeForLineCount.length === 0 ? [""] : codeForLineCount.split("\n");
  const lineCount = Math.max(1, lines.length);

  const language = inferLanguage(codeBlock, pre);
  const languageLabel = toLanguageLabel(language);

  pre.setAttribute("data-codeblock-enhanced", "1");
  pre.setAttribute("data-lang", language);
  pre.classList.add("codeblock-enhanced");

  clearInlineBackgrounds(pre);

  codeBlock.setAttribute("data-lang", language);
  codeBlock.classList.add("codeblock-content");
  codeBlock.classList.add("z-code");
  codeBlock.setAttribute("spellcheck", "false");
  codeBlock.setAttribute("translate", "no");

  syncCodeMetrics(pre, codeBlock);
  enhancedCodeBlocks.set(pre, codeBlock);

  pre.insertBefore(createToolbar(languageLabel, normalizedCode), codeBlock);
  pre.insertBefore(createLineNumberNode(lineCount), codeBlock);
}

export function initCodeBlocks() {
  document.querySelectorAll("pre > code").forEach((node) => {
    enhanceCodeBlock(node);
  });

  bindMetricSyncEvents();
  scheduleMetricSync();
}
