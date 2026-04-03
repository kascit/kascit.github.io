/**
 * Search — fully self-contained lazy-loader + search UI
 *
 * Loads Fuse.js and the search index on demand (modal open or Ctrl+K),
 * then wires up the search input, results rendering, and keyboard nav.
 *
 * Reads data attributes from its own <script> tag:
 *   data-fuse          — URL to fuse.min.js
 *   data-search-index  — URL to search_index.xx.js
 *   data-lang          — language code (default "en")
 */
(function () {
  "use strict";
  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset || {};
  var fuseSrc = data.fuse || "";
  var indexSrc = data.searchIndex || "";

  var searchLoaded = false;
  var searchReady = false;

  // ── Debounce util ────────────────────────────────────────────────────
  function debounce(func, wait) {
    var timeout;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () { func.apply(ctx, args); }, wait);
    };
  }

  // ── Teaser builder ───────────────────────────────────────────────────
  function makeTeaser(body, terms) {
    var TERM_WEIGHT = 40;
    var NORMAL_WORD_WEIGHT = 2;
    var FIRST_WORD_WEIGHT = 8;
    var TEASER_MAX_WORDS = 30;

    var stemmedTerms = terms.map(function (w) { return w.toLowerCase(); });
    var termFound = false;
    var index = 0;
    var weighted = [];
    var sentences = body.toLowerCase().split(". ");

    for (var i in sentences) {
      var words = sentences[i].split(" ");
      var value = FIRST_WORD_WEIGHT;
      for (var j in words) {
        var word = words[j];
        if (word.length > 0) {
          for (var k in stemmedTerms) {
            if (word.toLowerCase().startsWith(stemmedTerms[k])) {
              value = TERM_WEIGHT;
              termFound = true;
            }
          }
          weighted.push([word, value, index]);
          value = NORMAL_WORD_WEIGHT;
        }
        index += word.length;
        index += 1;
      }
      index += 1;
    }

    if (weighted.length === 0) return body;

    var windowWeights = [];
    var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);
    var curSum = 0;
    for (var n = 0; n < windowSize; n++) { curSum += weighted[n][1]; }
    windowWeights.push(curSum);
    for (var n = 0; n < weighted.length - windowSize; n++) {
      curSum -= weighted[n][1];
      curSum += weighted[n + windowSize][1];
      windowWeights.push(curSum);
    }

    var maxSumIndex = 0;
    if (termFound) {
      var maxFound = 0;
      for (var n = windowWeights.length - 1; n >= 0; n--) {
        if (windowWeights[n] > maxFound) {
          maxFound = windowWeights[n];
          maxSumIndex = n;
        }
      }
    }

    var teaser = [];
    var startIndex = weighted[maxSumIndex][2];
    for (var n = maxSumIndex; n < maxSumIndex + windowSize; n++) {
      var w = weighted[n];
      if (startIndex < w[2]) {
        teaser.push(body.substring(startIndex, w[2]));
        startIndex = w[2];
      }
      if (w[1] === TERM_WEIGHT) teaser.push("<b>");
      startIndex = w[2] + w[0].length;
      teaser.push(body.substring(w[2], startIndex));
      if (w[1] === TERM_WEIGHT) teaser.push("</b>");
    }
    teaser.push("\u2026");
    return teaser.join("");
  }

  // ── Result item renderer ─────────────────────────────────────────────
  function formatSearchResultItem(item, terms) {
    var li = document.createElement("li");
    li.className = "search-result-item";
    li.innerHTML =
      '<a href="' + item.item.id + '" class="search-result-link block px-4 py-3 rounded-md hover:bg-base-200/50 transition-colors duration-150">' +
        '<div class="flex items-start gap-3">' +
          '<div class="search-result-icon flex-shrink-0 mt-1">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>' +
          '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<div class="search-result-title font-semibold text-sm text-base-content mb-1">' + item.item.title + '</div>' +
            '<div class="search-result-excerpt text-xs text-base-content/60 line-clamp-2">' + makeTeaser(item.item.body, terms) + '</div>' +
          '</div>' +
          '<div class="search-result-arrow flex-shrink-0 opacity-0 transition-opacity duration-150">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>' +
          '</div>' +
        '</div>' +
      '</a>';

    var link = li.querySelector(".search-result-link");
    var arrow = li.querySelector(".search-result-arrow");
    link.addEventListener("mouseenter", function () { arrow.style.opacity = "1"; });
    link.addEventListener("mouseleave", function () { arrow.style.opacity = "0"; });
    return li;
  }

  // ── Core search wiring ───────────────────────────────────────────────
  function initSearch() {
    if (typeof Fuse === "undefined" || !window.searchIndex) return;
    if (searchReady) return;
    searchReady = true;

    var $searchInput = document.getElementById("search");
    if (!$searchInput) return;

    var $searchResultsContainer = document.querySelector(".search-results-container");
    var $searchResultsHeader = document.querySelector(".search-results__header");
    var $searchResultsItems = document.querySelector(".search-results__items");
    var MAX_ITEMS = 10;
    var selectedIndex = -1;

    var options = {
      keys: [
        { name: "title", weight: 2 },
        { name: "body", weight: 1 },
        { name: "tags", weight: 1 },
      ],
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.4,
    };
    var currentTerm = "";
    var documents = Object.values(window.searchIndex.documentStore.docs);
    var fuse = new Fuse(documents, options);

    function updateSelectedResult() {
      var items = $searchResultsItems.querySelectorAll(".search-result-item");
      items.forEach(function (item, index) {
        var link = item.querySelector(".search-result-link");
        if (index === selectedIndex) {
          link.classList.add("border");
        } else {
          link.classList.remove("border");
        }
      });
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    $searchInput.addEventListener("keyup", debounce(function () {
      var term = $searchInput.value.trim();
      if (term === currentTerm || !fuse) return;
      $searchResultsItems.innerHTML = "";
      $searchResultsHeader.innerHTML = "";
      selectedIndex = -1;

      if (term === "") { currentTerm = ""; return; }

      var results = fuse.search(term).filter(function (r) { return r.item.body !== ""; });

      if (results.length === 0) {
        $searchResultsHeader.innerHTML = '<span class="text-base-content/60">No results found for <strong class="text-base-content">"' + term + '"</strong></span>';
        return;
      }

      currentTerm = term;
      $searchResultsHeader.innerHTML = '<span class="text-base-content/60">' + results.length + ' result' +
        (results.length === 1 ? "" : "s") + ' for <strong class="text-base-content">"' + term + '"</strong></span>';
      for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
        if (!results[i].item.body) continue;
        $searchResultsItems.appendChild(formatSearchResultItem(results[i], term.split(" ")));
      }
    }, 150));

    var searchModal = document.getElementById("search-modal");
    var modalBackdrop = document.querySelector(".modal");

    if (searchModal) {
      searchModal.addEventListener("change", function () {
        if (this.checked) {
          setTimeout(function () { $searchInput.focus(); }, 100);
        } else {
          $searchInput.value = "";
          $searchResultsItems.innerHTML = "";
          $searchResultsHeader.innerHTML = "";
          currentTerm = "";
          selectedIndex = -1;
        }
      });
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", function (e) {
        if (e.target === modalBackdrop && searchModal.checked) {
          searchModal.checked = false;
        }
      });
    }

    $searchInput.addEventListener("keydown", function (e) {
      var items = $searchResultsItems.querySelectorAll(".search-result-item");
      if (e.key === "Escape") { searchModal.checked = false; return; }
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelectedResult();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelectedResult();
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        var link = items[selectedIndex].querySelector(".search-result-link");
        if (link) window.location.href = link.getAttribute("href");
      }
    });
  }

  // ── Lazy library loader ──────────────────────────────────────────────
  function loadSearchLibraries(callback) {
    if (searchReady && typeof Fuse !== "undefined" && window.searchIndex) {
      if (callback) callback();
      return;
    }

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
          searchInput.placeholder = "Search posts...";
          searchInput.disabled = false;
          searchInput.focus();
        }
        initSearch();
        if (callback) callback();
      };
      document.body.appendChild(searchIndexScript);
    };
    document.body.appendChild(fuseScript);
  }

  // ── Event wiring ─────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    var searchModal = document.getElementById("search-modal");

    // Lazy-load on modal open
    if (searchModal) {
      searchModal.addEventListener("change", function () {
        if (this.checked) loadSearchLibraries();
      });
    }

    // Ctrl+K / ⌘K — toggle modal AND lazy-load
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (searchModal) {
          searchModal.checked = !searchModal.checked;
          searchModal.dispatchEvent(new Event("change"));
        }
        loadSearchLibraries();
      }
    });
  });
})();
