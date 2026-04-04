// Auto-reload when the browser comes back online (offline page).
(function () {
  var el = document.querySelector('[data-offline-status]') || document.getElementById('offline-status');
  if (!el) return;
  el.textContent = 'Waiting for connection';
  el.classList.add('status-pill', 'status-pill--pending');

  function goBack() {
    el.textContent = 'Back online - reloading';
    el.classList.remove('status-pill--pending');
    el.classList.add('status-pill--online');
    setTimeout(function () { window.location.reload(); }, 600);
  }

  if (navigator.onLine) { goBack(); return; }
  window.addEventListener('online', goBack);
})();
