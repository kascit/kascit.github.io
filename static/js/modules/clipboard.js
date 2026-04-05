/**
 * Clipboard Utilities (Buttons, Code blocks, Headings)
 */

async function copyText(value) {
  const text = String(value || "");
  if (!text) return;

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function setHeadingLinkIcon(link, copied) {
  const icon = document.createElement("i");
  icon.className = copied ? "fa-solid fa-check" : "fa-solid fa-link";
  link.replaceChildren(icon);
}

export function initClipboard() {
  // 1. Copy URL Buttons
  document.querySelectorAll("[data-copy-url]").forEach((button) => {
    if (button.getAttribute("data-copy-url-init") === "1") return;
    button.setAttribute("data-copy-url-init", "1");

    const originalLabel = button.getAttribute("data-copy-original-label") || button.textContent || "Copy";
    button.setAttribute("data-copy-original-label", originalLabel);

    button.addEventListener("click", () => {
      copyText(window.location.href).then(() => {
        const feedback = button.getAttribute("data-copy-feedback") || "Copied!";
        button.textContent = feedback;
        setTimeout(() => {
          button.textContent = button.getAttribute("data-copy-original-label") || originalLabel;
        }, 2000);
      }).catch(console.error);
    });
  });

  // 2. Heading Links
  document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]").forEach((heading) => {
    if (heading.getAttribute("data-copy-heading-init") === "1") return;

    if (heading.querySelector(":scope > .copy-heading-link-button")) {
      heading.setAttribute("data-copy-heading-init", "1");
      return;
    }

    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.className = "copy-heading-link-button";
    link.setAttribute("aria-label", "Copy link to this heading");
    link.setAttribute("title", "Copy link to this heading");
    setHeadingLinkIcon(link, false);

    link.addEventListener("click", (event) => {
      event.preventDefault();
      const canonical = `${window.location.origin}${window.location.pathname}#${heading.id}`;
      copyText(canonical).then(() => {
        setHeadingLinkIcon(link, true);
        link.classList.add("copied");
        link.setAttribute("title", "Copied!");
        setTimeout(() => {
          setHeadingLinkIcon(link, false);
          link.classList.remove("copied");
          link.setAttribute("title", "Copy link to this heading");
        }, 1800);
      }).catch(console.error);
    });

    heading.appendChild(link);
    heading.setAttribute("data-copy-heading-init", "1");
  });
}
