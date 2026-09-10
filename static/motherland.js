/**
 * Legacy compatibility shim for motherland.js
 * Automatically loads the unified shell architecture.
 */
(function () {
  if (window.Motherland) return;

  window.Motherland = {
    init: function () {
      return { destroy: function () {} };
    },
    destroy: function () {},
  };

  // Load standard shell if not already present
  if (!document.querySelector('script[src*="/js/shell.js"]')) {
    const s = document.createElement("script");
    s.type = "module";
    s.src = "/js/shell.js";
    document.head.appendChild(s);
  }
})();
