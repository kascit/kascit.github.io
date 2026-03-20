// Fix drawer state on back navigation (bfcache).
// Must NOT be deferred — needs to run early to catch pageshow.
(function () {
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var d = document.getElementById('my-drawer-2');
      if (d) d.checked = false;
    }
  });
})();
