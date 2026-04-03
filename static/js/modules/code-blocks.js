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

function normalizeCodeText(value) {
  if (!value) return "";
  let normalized = String(value).replace(/\r\n/g, "\n");
  if (normalized.startsWith("\n")) {
    normalized = normalized.slice(1);
  }
  return normalized.replace(/\n$/, "");
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

  const values = [];
  for (let i = 1; i <= lineCount; i += 1) {
    values.push(String(i));
  }
  gutter.textContent = values.join("\n");
  return gutter;
}

function syncCodeMetrics(pre, codeBlock) {
  const styles = window.getComputedStyle(codeBlock);
  const lineHeight = styles.lineHeight;
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

  const normalizedCode = normalizeCodeText(codeBlock.textContent || codeBlock.innerText || "");
  const lines = normalizedCode.length === 0 ? [""] : normalizedCode.split("\n");
  const lineCount = Math.max(1, lines.length);

  const language = inferLanguage(codeBlock, pre);
  const languageLabel = toLanguageLabel(language);

  pre.setAttribute("data-codeblock-enhanced", "1");
  pre.setAttribute("data-lang", language);
  pre.classList.add("codeblock-enhanced");

  codeBlock.setAttribute("data-lang", language);
  codeBlock.classList.add("codeblock-content");
  codeBlock.setAttribute("spellcheck", "false");
  codeBlock.setAttribute("translate", "no");

  syncCodeMetrics(pre, codeBlock);

  pre.insertBefore(createToolbar(languageLabel, normalizedCode), codeBlock);
  pre.insertBefore(createLineNumberNode(lineCount), codeBlock);
}

export function initCodeBlocks() {
  document.querySelectorAll("pre > code").forEach((node) => {
    enhanceCodeBlock(node);
  });
}
