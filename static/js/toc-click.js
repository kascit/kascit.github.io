// TOC summary click handler — navigates to heading anchor.
document
  .querySelectorAll(".toc-menu summary[data-toc-href]")
  .forEach(function (summary) {
    summary.addEventListener("click", function (e) {
      var href = this.getAttribute("data-toc-href");
      if (href && href.includes("#")) {
        var hash = href.split("#")[1];
        if (hash) {
          window.location.hash = hash;
        }
      }
    });
  });
