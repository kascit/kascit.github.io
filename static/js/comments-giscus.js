(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};
  var targetId = data.target || "comments";
  var mount = document.getElementById(targetId);
  if (!mount) return;

  var userTheme = localStorage.getItem("theme") || "goyo-dark";
  var giscusTheme = userTheme === "goyo-dark" ? "dark" : "light";

  var script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", data.repo || "");
  script.setAttribute("data-repo-id", data.repoId || "");
  script.setAttribute("data-category", data.category || "");
  script.setAttribute("data-category-id", data.categoryId || "");
  script.setAttribute("data-mapping", data.mapping || "pathname");
  script.setAttribute("data-strict", data.strict || "0");
  script.setAttribute("data-reactions-enabled", data.reactionsEnabled || "1");
  script.setAttribute("data-emit-metadata", data.emitMetadata || "1");
  script.setAttribute("data-input-position", data.inputPosition || "top");
  script.setAttribute("data-theme", giscusTheme);
  script.setAttribute("data-lang", data.lang || "en");
  script.setAttribute("data-loading", data.loading || "lazy");
  script.crossOrigin = "anonymous";
  script.async = true;

  mount.appendChild(script);
})();
