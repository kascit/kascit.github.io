/* global HTMLRewriter */
/* eslint-disable no-unused-vars */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (
      url.hostname === "orange-bonus-9c36.dhanurrelhan2005.workers.dev" ||
      url.hostname === "csp-worker.dhanur.me"
    ) {
      return new Response(
        "Worker is active. Systems operational. 🛡️\n\nHello World.",
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const response = await fetch(request);
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("text/html")) {
      return response;
    }

    const nonceArray = new Uint8Array(16);
    crypto.getRandomValues(nonceArray);
    const nonce = btoa(String.fromCharCode(...nonceArray));

    const internalDomains =
      "https://dhanur.me https://social.dhanur.me https://up.dhanur.me https://auth.dhanur.me https://linkr.dhanur.me https://tasks.dhanur.me https://blog.dhanur.me https://api.dhanur.me";

    // Replaced 'unsafe-inline' with 'nonce-${nonce}' in style-src
    const csp = `default-src 'none'; script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'wasm-unsafe-eval' blob: ${internalDomains} https://www.googletagmanager.com https://www.google-analytics.com https://giscus.app https://utteranc.es https://static.cloudflareinsights.com https://gist.github.com https://asciinema.org https://challenges.cloudflare.com https://*.cloudflare.com https://*.sentry-cdn.com; style-src 'self' 'nonce-${nonce}' ${internalDomains} https://fonts.googleapis.com https://giscus.app; font-src 'self' data: ${internalDomains} https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${internalDomains} https://*.sentry.io https://www.google-analytics.com https://stats.g.doubleclick.net https://analytics.ahrefs.com; manifest-src 'self' ${internalDomains}; frame-src 'self' https://giscus.app https://utteranc.es https://www.youtube.com https://codepen.io https://www.openstreetmap.org https://asciinema.org https://challenges.cloudflare.com; frame-ancestors 'self' https://www.pwabuilder.com https://pwabuilder.com; worker-src 'self' blob: ${internalDomains}; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; require-trusted-types-for 'script'; trusted-types default dompurify giscus googletagmanager sentry 'allow-duplicates';`;

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Content-Security-Policy", csp);
    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });

    class NonceHandler {
      element(element) {
        element.setAttribute("nonce", nonce);
      }
    }

    class MetaTagHandler {
      element(element) {
        const httpEquiv = element.getAttribute("http-equiv");
        if (
          httpEquiv &&
          httpEquiv.toLowerCase() === "content-security-policy"
        ) {
          element.remove();
        }
      }
    }

    // Added .on("style", new NonceHandler()) to inject nonces into style tags
    return new HTMLRewriter()
      .on("script", new NonceHandler())
      .on("style", new NonceHandler())
      .on("meta", new MetaTagHandler())
      .transform(newResponse);
  },
};
