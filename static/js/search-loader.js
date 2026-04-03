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

  function getSearchMount() {
    return document.querySelector("[data-search-mount]") || document.querySelector(".modal");
  }

  function getSearchModal() {
    var mount = getSearchMount();
    return (mount && mount.querySelector("[data-search-modal]")) || document.getElementById("search-modal");
  }

  function getSearchInput() {
    var mount = getSearchMount();
    return (mount && mount.querySelector("[data-search-input]")) || document.getElementById("search");
  }

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
  var DOC_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>';
  var ARROW_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>';

  function sanitizeResultHref(rawHref) {
    if (typeof rawHref !== "string" || rawHref.trim() === "") return "#";
    var href = rawHref.trim();

    if (href[0] === "#") return href;
    if (href[0] === "/") {
      if (/\s/.test(href)) return "#";
      return href;
    }

    try {
      var parsed = new URL(href, window.location.origin);
      var protocol = (parsed.protocol || "").toLowerCase();
      if (protocol !== "http:" && protocol !== "https:") return "#";
      if (parsed.origin !== window.location.origin) return "#";
      return parsed.pathname + parsed.search + parsed.hash;
    } catch (_error) {
      return "#";
    }
  }

  function renderTeaserText(target, teaser) {
    var tokens = String(teaser || "").split(/(<b>|<\/b>)/);
    var isBold = false;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (token === "<b>") {
        isBold = true;
        continue;
      }
      if (token === "</b>") {
        isBold = false;
        continue;
      }
      if (!token) continue;

      if (isBold) {
        var strong = document.createElement("strong");
        strong.textContent = token;
        target.appendChild(strong);
      } else {
        target.appendChild(document.createTextNode(token));
      }
    }
  }

  function formatSearchResultItem(item, terms) {
    var li = document.createElement("li");
    li.className = "search-result-item";
    var link = document.createElement("a");
    link.href = sanitizeResultHref(item && item.item ? item.item.id : "");
    link.className = "search-result-link block px-4 py-3 rounded-md hover:bg-base-200/50 transition-colors duration-150";

    var row = document.createElement("div");
    row.className = "flex items-start gap-3";

    var iconWrap = document.createElement("div");
    iconWrap.className = "search-result-icon flex-shrink-0 mt-1";
    iconWrap.innerHTML = DOC_ICON_SVG;

    var bodyWrap = document.createElement("div");
    bodyWrap.className = "flex-1 min-w-0";

    var title = document.createElement("div");
    title.className = "search-result-title font-semibold text-sm text-base-content mb-1";
    title.textContent = item && item.item && typeof item.item.title === "string" ? item.item.title : "Untitled";

    var excerpt = document.createElement("div");
    excerpt.className = "search-result-excerpt text-xs text-base-content/60 line-clamp-2";
    renderTeaserText(excerpt, makeTeaser(item && item.item ? item.item.body : "", terms));

    var arrow = document.createElement("div");
    arrow.className = "search-result-arrow flex-shrink-0 opacity-0 transition-opacity duration-150";
    arrow.innerHTML = ARROW_ICON_SVG;

    bodyWrap.appendChild(title);
    bodyWrap.appendChild(excerpt);
    row.appendChild(iconWrap);
    row.appendChild(bodyWrap);
    row.appendChild(arrow);
    link.appendChild(row);
    li.appendChild(link);

    link.addEventListener("mouseenter", function () { arrow.style.opacity = "1"; });
    link.addEventListener("mouseleave", function () { arrow.style.opacity = "0"; });
    return li;
  }

  function setSearchHeader($searchResultsHeader, term, count, isEmpty) {
    if (!$searchResultsHeader) return;
    $searchResultsHeader.textContent = "";

    var wrap = document.createElement("span");
    wrap.className = "text-base-content/60";

    if (isEmpty) {
      wrap.appendChild(document.createTextNode('No results found for '));
      var emptyStrong = document.createElement("strong");
      emptyStrong.className = "text-base-content";
      emptyStrong.textContent = '"' + term + '"';
      wrap.appendChild(emptyStrong);
      $searchResultsHeader.appendChild(wrap);
      return;
    }

    wrap.appendChild(document.createTextNode(String(count) + " result" + (count === 1 ? "" : "s") + " for "));
    var strong = document.createElement("strong");
    strong.className = "text-base-content";
    strong.textContent = '"' + term + '"';
    wrap.appendChild(strong);
    $searchResultsHeader.appendChild(wrap);
  }

  // ── Core search wiring ───────────────────────────────────────────────
  function initSearch() {
    if (typeof Fuse === "undefined" || !window.searchIndex) return;
    if (searchReady) return;
    searchReady = true;

    var mount = getSearchMount();
    var $searchInput = getSearchInput();
    if (!$searchInput) return;

    var $searchResultsContainer = (mount && mount.querySelector("[data-search-results-container]")) || document.querySelector(".search-results-container");
    var $searchResultsHeader = (mount && mount.querySelector("[data-search-results-header]")) || document.querySelector(".search-results__header");
    var $searchResultsItems = (mount && mount.querySelector("[data-search-results-items]")) || document.querySelector(".search-results__items");
    if (!$searchResultsContainer || !$searchResultsHeader || !$searchResultsItems) return;
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
        setSearchHeader($searchResultsHeader, term, 0, true);
        return;
      }

      currentTerm = term;
      setSearchHeader($searchResultsHeader, term, results.length, false);
      for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
        if (!results[i].item.body) continue;
        $searchResultsItems.appendChild(formatSearchResultItem(results[i], term.split(" ")));
      }
    }, 150));

    var searchModal = getSearchModal();
    var modalBackdrop = (mount && mount.querySelector("[data-search-backdrop]")) || mount || document.querySelector(".modal");

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

    var searchInput = getSearchInput();
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
    var searchModal = getSearchModal();

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
