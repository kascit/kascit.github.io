export function appendStylesheetOnce(href) {
  if (!href) return null;
  const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
  if (existing) return existing;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  return link;
}

export function appendScriptOnce({
  src, selector, async = true, defer = false, crossOrigin, loadedAttribute, onLoad, onError,
}) {
  if (!src && !selector) return null;
  const existing = selector ? document.querySelector(selector) : document.querySelector(`script[src="${src}"]`);

  if (existing) {
    if (typeof onLoad === "function") {
      const isMarkedLoaded = loadedAttribute ? existing.getAttribute(loadedAttribute) === "1" : false;
      if (isMarkedLoaded || existing.readyState === "complete") onLoad();
      else existing.addEventListener("load", onLoad, { once: true });
    }
    if (typeof onError === "function") existing.addEventListener("error", onError, { once: true });
    return existing;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = async;
  script.defer = defer;
  if (crossOrigin) script.crossOrigin = crossOrigin;

  script.addEventListener("load", () => {
    if (loadedAttribute) script.setAttribute(loadedAttribute, "1");
    if (typeof onLoad === "function") onLoad();
  }, { once: true });

  if (typeof onError === "function") script.addEventListener("error", onError, { once: true });

  document.head.appendChild(script);
  return script;
}
