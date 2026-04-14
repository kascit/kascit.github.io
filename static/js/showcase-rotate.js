// Auto-rotate showcase tabs on the landing page.
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('input[name="showcase_tabs"]'));
  if (tabs.length < 2) return;

  var ROTATION_MS = 20000;
  var idx = tabs.findIndex(function (tab) { return tab.checked; });
  if (idx < 0) idx = 0;
  tabs[idx].checked = true;

  var timer = null;

  function next() {
    idx = (idx + 1) % tabs.length;
    tabs[idx].checked = true;
  }

  function start() {
    stop();
    timer = setInterval(next, ROTATION_MS);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  start();
  var container = tabs[0].closest('.tabs');
  if (container) {
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('change', function () {
      idx = tabs.findIndex(function (tab) { return tab.checked; });
      if (idx < 0) idx = 0;
      start();
    });
  }
})();
