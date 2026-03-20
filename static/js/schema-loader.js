document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('script.schema-ld-raw').forEach(function (el) {
    if (el.textContent) {
      try {
        var blob = new Blob([el.textContent], { type: 'application/ld+json' });
        var url = URL.createObjectURL(blob);
        var s = document.createElement('script');
        s.type = 'application/ld+json';
        s.src = url;
        document.head.appendChild(s);
      } catch (e) {
        console.error('Failed to inject JSON-LD', e);
      }
    }
  });
});
