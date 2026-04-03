/**
 * Clipboard Utilities (Buttons, Code blocks, Headings)
 */

export function initClipboard() {
  // 1. Copy URL Buttons
  document.querySelectorAll("[data-copy-url]").forEach((button) => {
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = button.getAttribute("data-copy-feedback") || "Copied!";
        setTimeout(() => (button.innerHTML = originalText), 2000);
      }).catch(console.error);
    });
  });

  // 2. Heading Links
  document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]").forEach((heading) => {
    const originalContent = heading.innerHTML;
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.className = "copy-heading-link-button";
    link.setAttribute("aria-label", "Copy link to this heading");
    link.setAttribute("title", "Copy link to this heading");
    const defaultIcon = '<i class="fa-solid fa-link"></i>';
    const copiedIcon = '<i class="fa-solid fa-check"></i>';
    link.innerHTML = defaultIcon;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigator.clipboard.writeText(new URL(link.href, window.location.href).toString()).then(() => {
        link.innerHTML = copiedIcon;
        link.classList.add("copied");
        link.setAttribute("title", "Copied!");
        setTimeout(() => {
          link.innerHTML = defaultIcon;
          link.classList.remove("copied");
          link.setAttribute("title", "Copy link to this heading");
        }, 1800);
      }).catch(console.error);
    });

    const textSpan = document.createElement("span");
    textSpan.innerHTML = originalContent;
    heading.innerHTML = "";
    heading.appendChild(textSpan);
    heading.appendChild(link);
  });
}
