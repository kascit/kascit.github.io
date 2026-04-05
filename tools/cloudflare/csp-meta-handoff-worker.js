export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("text/html")) {
      return response;
    }

    const nonceArray = new Uint8Array(16);
    crypto.getRandomValues(nonceArray);
    const nonce = btoa(String.fromCharCode(...nonceArray));

    const newResponse = new Response(response.body, response);

    const csp = `default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'wasm-unsafe-eval' https://dhanur.me blob: https://*.dhanur.me https://www.googletagmanager.com https://www.google-analytics.com https://giscus.app https://utteranc.es https://static.cloudflareinsights.com https://gist.github.com https://asciinema.org https://challenges.cloudflare.com https://*.cloudflare.com https://*.sentry-cdn.com; style-src 'nonce-${nonce}' 'unsafe-inline' https://*.dhanur.me https://fonts.googleapis.com https://giscus.app; font-src 'self' data: https://*.dhanur.me https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.dhanur.me https://*.sentry.io https://www.google-analytics.com https://stats.g.doubleclick.net; manifest-src 'self' https://*.dhanur.me; frame-src 'self' https://giscus.app https://utteranc.es https://www.youtube.com https://codepen.io https://www.openstreetmap.org https://asciinema.org https://challenges.cloudflare.com; frame-ancestors 'self' https://www.pwabuilder.com https://pwabuilder.com; worker-src 'self' blob: https://*.dhanur.me; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`;

    newResponse.headers.set("Content-Security-Policy", csp);

    class NonceHandler {
      element(element) {
        element.setAttribute("nonce", nonce);
      }
    }

    class MetaTagHandler {
      element(element) {
        const httpEquiv = element.getAttribute("http-equiv");
        if (httpEquiv && httpEquiv.toLowerCase() === "content-security-policy") {
          element.remove();
        }
      }
    }

    return new HTMLRewriter()
      .on("script", new NonceHandler())
      .on("style", new NonceHandler())
      .on("meta", new MetaTagHandler())
      .transform(newResponse);
  },
};
