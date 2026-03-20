document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('script.schema-ld-raw').forEach(function (el) {
    if (el.textContent) {
      try {
        var s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = el.textContent;
        document.head.appendChild(s);
      } catch (e) {
        console.error('Failed to inject JSON-LD', e);
      }
    }
  });
});
