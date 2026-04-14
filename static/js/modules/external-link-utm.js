const TRACKING_PARAM = "utm_source";
const TRACKING_VALUE = "dhanur.me";

function isTrackableExternalLink(anchor) {
  if (!anchor || anchor.dataset.noUtmSource === "true") {
    return false;
  }

  const rawHref = anchor.getAttribute("href");
  if (!rawHref) {
    return false;
  }

  let linkUrl;
  try {
    linkUrl = new URL(rawHref, window.location.href);
  } catch {
    return false;
  }

  if (linkUrl.protocol !== "http:" && linkUrl.protocol !== "https:") {
    return false;
  }

  return linkUrl.origin !== window.location.origin;
}

function applyTrackingParam(anchor) {
  if (!isTrackableExternalLink(anchor)) {
    return;
  }

  const linkUrl = new URL(anchor.href, window.location.href);
  if (linkUrl.searchParams.has(TRACKING_PARAM)) {
    return;
  }

  linkUrl.searchParams.set(TRACKING_PARAM, TRACKING_VALUE);
  anchor.href = linkUrl.toString();
}

function applyWithin(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = /** @type {Element} */ (node);
  if (element.matches("a[href]")) {
    applyTrackingParam(/** @type {HTMLAnchorElement} */ (element));
  }

  element.querySelectorAll("a[href]").forEach((anchor) => {
    applyTrackingParam(/** @type {HTMLAnchorElement} */ (anchor));
  });
}

export function initExternalLinkUtm(root = document) {
  if (!root || !root.querySelectorAll) {
    return;
  }

  root.querySelectorAll("a[href]").forEach((anchor) => {
    applyTrackingParam(/** @type {HTMLAnchorElement} */ (anchor));
  });

  if (typeof MutationObserver !== "function") {
    return;
  }

  const observeTarget = document.body || document.documentElement;
  if (!observeTarget) {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        applyWithin(node);
      });
    });
  });

  observer.observe(observeTarget, { childList: true, subtree: true });
  window.addEventListener(
    "pagehide",
    () => {
      observer.disconnect();
    },
    { once: true },
  );
}
