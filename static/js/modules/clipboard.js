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

  // 2. Code Blocks
  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML = '<i class="fa-regular fa-clipboard"></i>';

    button.addEventListener("click", () => {
      navigator.clipboard.writeText(codeBlock.innerText).then(() => {
        button.innerHTML = '<i class="fa-solid fa-check"></i>';
        button.classList.add("copied");
        setTimeout(() => {
          button.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
          button.classList.remove("copied");
        }, 2000);
      }).catch(console.error);
    });
    codeBlock.parentNode.appendChild(button);
  });

  // 3. Heading Links
  document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]").forEach((heading) => {
    const originalContent = heading.innerHTML;
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.className = "copy-heading-link-button";
    link.setAttribute("aria-label", "Copy link to this heading");
    link.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>';

    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigator.clipboard.writeText(new URL(link.href, window.location.href).toString()).then(() => {
        link.style.transform = "scale(1.2)";
        setTimeout(() => (link.style.transform = "scale(1.05)"), 200);
      }).catch(console.error);
    });

    const textSpan = document.createElement("span");
    textSpan.innerHTML = originalContent;
    heading.innerHTML = "";
    heading.appendChild(textSpan);
    heading.appendChild(link);
  });
}
