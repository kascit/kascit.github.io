/**
 * Shared cookie helpers used across runtime modules.
 */

export function readCookie(name) {
  const key = `${name}=`;
  const parts = document.cookie ? document.cookie.split(";") : [];
  for (const part of parts) {
    const item = part.trim();
    if (item.startsWith(key)) {
      return decodeURIComponent(item.slice(key.length));
    }
  }
  return "";
}

export function writeCookie(name, value, options = {}) {
  const {
    maxAgeSeconds,
    domain,
    path = "/",
    sameSite = "Lax",
    secure = window.location.protocol === "https:",
  } = options;

  const attrs = [`Path=${path}`, `SameSite=${sameSite}`];
  if (typeof maxAgeSeconds === "number") attrs.push(`Max-Age=${maxAgeSeconds}`);
  if (domain) attrs.push(`Domain=${domain}`);
  if (secure) attrs.push("Secure");

  document.cookie = `${name}=${encodeURIComponent(value)}; ${attrs.join("; ")}`;
}