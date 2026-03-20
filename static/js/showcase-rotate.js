// Auto-rotate showcase tabs on the landing page.
(function () {
  var tabs = document.querySelectorAll('input[name="showcase_tabs"]');
  if (tabs.length < 2) return;
  var idx = 0, timer;
  function next() { idx = (idx + 1) % tabs.length; tabs[idx].checked = true; }
  function start() { timer = setInterval(next, 4000); }
  function stop() { clearInterval(timer); }
  start();
  var container = tabs[0].closest('.tabs');
  if (container) {
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('change', function () {
      stop();
      for (var i = 0; i < tabs.length; i++) { if (tabs[i].checked) idx = i; }
      start();
    });
  }
})();
