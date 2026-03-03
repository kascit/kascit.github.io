/**
 * Shared Web Components for dhanur.me subdomains.
 *
 * Usage on any subdomain:
 *   <link rel="stylesheet" href="https://dhanur.me/css/main.css">
 *   <script src="https://dhanur.me/js/components.js" defer></script>
 *   <site-nav></site-nav>
 *
 * Attributes (all optional):
 *   brand-text   — Logo text         (default: "~/dhanur")
 *   brand-href   — Logo link target  (default: "https://dhanur.me")
 *   hide-toggle  — If present, hides the theme toggle button
 *   nav-items    — JSON array of {name, url, icon?} for nav links
 */
(function () {
  "use strict";

  // Cookie helpers — self-contained so the component works standalone on subdomains.
  // Reuses window.__getThemeCookie / __setThemeCookie if the main site defined them.
  var COOKIE_DOMAIN = (function () {
    var parts = location.hostname.split(".");
    return parts.length >= 2
      ? "." + parts.slice(-2).join(".")
      : location.hostname;
  })();

  function getCookie() {
    if (window.__getThemeCookie) return window.__getThemeCookie();
    var m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    return m ? m[1] : null;
  }

  function setCookie(val) {
    if (window.__setThemeCookie) {
      window.__setThemeCookie(val);
      return;
    }
    document.cookie =
      "theme=" +
      val +
      "; path=/; domain=" +
      COOKIE_DOMAIN +
      "; max-age=31536000; SameSite=Lax";
  }

  // Theme mapping (must match app.js)
  var THEME_MAP = { dark: "night", light: "lofi" };

  var defaultNav = [
    { name: "About", url: "https://dhanur.me/about/" },
    { name: "Projects", url: "https://dhanur.me/projects/" },
    { name: "Links", url: "https://dhanur.me/links/" },
    { name: "Blog", url: "https://dhanur.me/blog/" },
  ];

  // SVG icons for the theme toggle (sun / moon)
  var SUN_SVG =
    '<svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>';

  var MOON_SVG =
    '<svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>';

  class SiteNav extends HTMLElement {
    connectedCallback() {
      var brandText = this.getAttribute("brand-text") || "~/dhanur";
      var brandHref = this.getAttribute("brand-href") || "https://dhanur.me";
      var hideToggle = this.hasAttribute("hide-toggle");
      var navItems;

      try {
        navItems = JSON.parse(this.getAttribute("nav-items"));
      } catch (_) {
        navItems = defaultNav;
      }
      if (!navItems) navItems = defaultNav;

      var linksHtml = navItems
        .map(function (item) {
          var icon = item.icon ? '<i class="' + item.icon + '"></i> ' : "";
          return (
            '<li><a class="btn btn-ghost hover:no-underline" href="' +
            item.url +
            '">' +
            icon +
            item.name +
            "</a></li>"
          );
        })
        .join("");

      var toggleHtml = "";
      if (!hideToggle) {
        toggleHtml =
          '<li><label class="swap swap-rotate btn btn-ghost">' +
          '<input type="checkbox" class="site-theme-ctrl" aria-label="Toggle theme"/>' +
          SUN_SVG +
          MOON_SVG +
          "</label></li>";
      }

      this.innerHTML =
        '<div class="navbar opacity-95 fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-500/15 backdrop-blur-3xl">' +
        '<div class="flex-1">' +
        '<a href="' +
        brandHref +
        '" class="btn btn-ghost hover:animate-pulse hover:bg-transparent hover:border-transparent normal-case text-xl" style="background:linear-gradient(135deg,#9ca3af,#6b7280);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:bold;font-size:1.5rem;">' +
        brandText +
        "</a>" +
        "</div>" +
        '<div class="flex-none">' +
        '<ul class="menu menu-horizontal px-1 items-center">' +
        linksHtml +
        toggleHtml +
        "</ul>" +
        "</div>" +
        "</div>";

      var current = getCookie() || "dark";
      var daisyTheme = THEME_MAP[current] || current;
      document.documentElement.setAttribute("data-theme", daisyTheme);

      var ctrl = this.querySelector(".site-theme-ctrl");
      if (ctrl) {
        ctrl.checked = current === "dark";
        ctrl.addEventListener("change", function (e) {
          var userTheme = e.target.checked ? "dark" : "light";
          document.documentElement.setAttribute(
            "data-theme",
            THEME_MAP[userTheme],
          );
          setCookie(userTheme);
        });
      }
    }
  }

  customElements.define("site-nav", SiteNav);
})();
