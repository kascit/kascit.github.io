// Critical anti-FOUC theme initializer — must run synchronously (no defer).
// Reads data-* attrs from its own <script> tag for Zola template values.
(function () {
  var script = document.currentScript;
  var cookieDomain = script.getAttribute('data-cookie-domain') || '';
  var defaultColorset = script.getAttribute('data-default-colorset') || 'dark';
  var SIDEBAR_KEY = 'sidebar-collapsed';

  function getStorageFlag(key) {
    try {
      return window.localStorage.getItem(key) === '1';
    } catch (_) {
      return false;
    }
  }

  // Cookie helpers — shared with all theme scripts via window globals
  // Scoped to .<cookieDomain> so all subdomains share the theme
  window.__getThemeCookie = function () {
    var m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    return m ? m[1] : null;
  };
  window.__setThemeCookie = function (val) {
    var h = location.hostname;
    var d = (h === 'localhost' || h === '127.0.0.1') ? '' : '; domain=.' + cookieDomain;
    document.cookie = 'theme=' + val + '; path=/' + d + '; max-age=31536000; SameSite=Lax';
  };

  // Resolve "auto" to "dark" or "light" based on OS preference
  window.__resolveColorset = function (val) {
    if (val === 'auto') {
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    return val;
  };

  var rawColorset = window.__getThemeCookie() || defaultColorset;
  var colorset = window.__resolveColorset(rawColorset);
  var themeMap = { dark: 'dark', light: 'light' };
  var themeName = themeMap[colorset] || colorset;
  var prepaintBgMap = { dark: '#010409', light: '#f6f8fa' };
  var prepaintBg = prepaintBgMap[colorset] || prepaintBgMap.dark;

  // Set data-theme SYNCHRONOUSLY so DaisyUI applies correct colors before first paint
  document.documentElement.setAttribute('data-theme', themeName);
  document.documentElement.style.backgroundColor = prepaintBg;

  if (colorset === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }

  // Prepaint UI state hydration: prevents first-frame sidebar/TOC flicker on navigation.
  document.documentElement.setAttribute(
    'data-sidebar-collapsed',
    getStorageFlag(SIDEBAR_KEY) ? '1' : '0'
  );
})();
