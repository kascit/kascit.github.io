/**
 * Trusted Types Bootstrap — Shared across main site and subdomains.
 *
 * Creates the 'default' Trusted Types policy so that raw string
 * assignments to innerHTML, script.src, etc. are automatically
 * converted to TrustedHTML / TrustedScriptURL by the browser.
 *
 * Must run BEFORE any code that touches DOM injection sinks.
 */
export function ensureDefaultPolicy() {
  // Avoid attempting to create the policy if it already exists. Creating
  // a TrustedTypes policy with the same name can trigger a CSP violation
  // (browsers may block duplicate creations when CSP doesn't allow
  // duplicates). The main site sets `window.__defaultPolicy` when it
  // bootstraps — check that first to keep this function idempotent.
  if (window.__defaultPolicy) return;

  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    try {
      window.__defaultPolicy = window.trustedTypes.createPolicy("default", {
        createScriptURL: function (s) {
          return s;
        },
        createHTML: function (s) {
          return s;
        },
      });
    } catch {
      /* policy already exists or creation blocked by CSP — safe to ignore */
    }
  }

  // Patch appendChild/insertBefore so dynamically-created iframes
  // (e.g. Cloudflare challenge, giscus) also get a default policy.
  function installFramePolicy(methodName) {
    const original = Element.prototype[methodName];
    Element.prototype[methodName] = function (...args) {
      const result = original.apply(this, args);
      const node = args[0];
      if (node && node.tagName === "IFRAME") {
        try {
          const win = node.contentWindow;
          if (win && win.trustedTypes && !win.trustedTypes.defaultPolicy) {
            win.trustedTypes.createPolicy("default", {
              createHTML: (s) => s,
              createScript: (s) => s,
              createScriptURL: (s) => s,
            });
          }
        } catch {
          /* cross-origin — expected */
        }
      }
      return result;
    };
  }
  installFramePolicy("appendChild");
  installFramePolicy("insertBefore");
}
