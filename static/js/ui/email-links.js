/**
 * email-links.js — ROT13 email decode for CF-bypass email cards.
 *
 * The email_card shortcode stores the address ROT13-encoded in a
 * `data-rot13-email` attribute (e.g. "pbagnpg@qunahe.zr").
 * This module decodes it at runtime and sets the real mailto: href.
 *
 * Why ROT13 and not a plain data attribute?
 * Cloudflare's email obfuscation pass scans raw HTML for `mailto:` strings
 * and replaces them with /cdn-cgi/l/email-protection#… which non-JS crawlers
 * (like Ahrefs) follow and receive a 404.  ROT13 encoding means no `mailto:`
 * ever appears in the static HTML Cloudflare sees.
 *
 * Why not inline <script>?
 * The CF Worker removes 'unsafe-inline' from Content-Security-Policy and
 * replaces it with a strict nonce-based policy.  Only scripts loaded via the
 * fingerprinted module bundle receive the correct nonce; bare inline scripts
 * are blocked.  This module is imported by main.js, which is served with
 * the proper nonce.
 */

function rot13(s) {
  return s.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export function initEmailLinks(root = document) {
  root.querySelectorAll("[data-rot13-email]").forEach((el) => {
    const encoded = el.getAttribute("data-rot13-email");
    if (!encoded) return;
    el.setAttribute("href", "mailto:" + encodeURIComponent(rot13(encoded)));
    el.removeAttribute("data-rot13-email");
  });
}
