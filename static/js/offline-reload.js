// Auto-reload when the browser comes back online (offline page).
(function () {
  var el = document.getElementById('offline-status');
  el.textContent = 'Waiting for connection\u2026';

  function goBack() {
    el.textContent = 'Back online \u2014 reloading\u2026';
    el.style.color = '#4ade80';
    setTimeout(function () { window.location.reload(); }, 600);
  }

  if (navigator.onLine) { goBack(); return; }
  window.addEventListener('online', goBack);
})();
