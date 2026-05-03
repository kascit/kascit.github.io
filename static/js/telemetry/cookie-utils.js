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
  } = options;

  const maxAgePart = typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
  const domainPart = domain ? `; Domain=${domain}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}; Secure${maxAgePart}${domainPart}`;
}
