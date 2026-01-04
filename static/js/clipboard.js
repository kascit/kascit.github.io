document.addEventListener("DOMContentLoaded", () => {
  const copyUrlButtons = document.querySelectorAll("[data-copy-url]");

  copyUrlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          const originalText = button.innerHTML;
          button.innerHTML =
            button.getAttribute("data-copy-feedback") || "Copied!";

          setTimeout(() => {
            button.innerHTML = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy URL:", err);
        });
    });
  });
});
