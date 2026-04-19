/**
 * Google Analytics bootstrap helper.
 *
 * Supports both:
 * - ES module usage via initGtag(gtagId)
 * - legacy script-tag auto init with data-gtag-id
 */

export function initGtag(gtagId) {
  var id = String(gtagId || "").trim();
  if (!id) return false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", id);
  return true;
}

function autoInitFromScriptTag() {
  var script = document.currentScript;
  if (!script || !script.dataset) return;

  var gtagId = script.dataset.gtagId || "";
  if (gtagId) {
    initGtag(gtagId);
  }
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  autoInitFromScriptTag();
}
