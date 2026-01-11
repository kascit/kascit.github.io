(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};
  var fuseSrc = data.fuse || "";
  var indexSrc = data.searchIndex || "";
  var lang = data.lang || "en";

  var searchLoaded = false;
  var searchLoadCallbacks = [];

  function loadSearchLibraries(callback) {
    if (searchLoaded && typeof Fuse !== "undefined" && window.searchIndex) {
      if (callback) callback();
      return;
    }

    if (callback) searchLoadCallbacks.push(callback);
    if (searchLoaded) return;
    searchLoaded = true;

    var searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.placeholder = "Loading search...";
      searchInput.disabled = true;
    }

    var fuseScript = document.createElement("script");
    fuseScript.src = fuseSrc;
    fuseScript.onload = function () {
      var searchIndexScript = document.createElement("script");
      searchIndexScript.src = indexSrc;
      searchIndexScript.onload = function () {
        if (searchInput) {
          searchInput.placeholder = "Search documentation...";
          searchInput.disabled = false;
          searchInput.focus();
        }
        if (typeof initSearch === "function") {
          initSearch();
        }
        searchLoadCallbacks.forEach(function (cb) {
          cb();
        });
        searchLoadCallbacks = [];
      };
      document.body.appendChild(searchIndexScript);
    };

    document.body.appendChild(fuseScript);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var searchModal = document.getElementById("search-modal");
    if (searchModal) {
      searchModal.addEventListener("change", function () {
        if (this.checked) {
          loadSearchLibraries();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        loadSearchLibraries();
      }
    });
  });
})();
