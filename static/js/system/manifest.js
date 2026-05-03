const MANIFEST_URL = "https://up.dhanur.me/api/manifest";
const CACHE_KEY = "dhanur_manifest_v1";
const CACHE_TTL_MS = 60 * 60 * 1000;

const FALLBACK_APPS = [
  { name: "Home", url: "https://dhanur.me", icon: "fa-solid fa-globe", minRole: "guest" },
  { name: "Linkr", url: "https://linkr.dhanur.me", icon: "fa-solid fa-link", minRole: "guest" },
  { name: "Tasks", url: "https://tasks.dhanur.me", icon: "fa-solid fa-list-check", minRole: "guest" },
  { name: "Auth", url: "https://auth.dhanur.me", icon: "fa-solid fa-fingerprint", minRole: "guest" },
  { name: "Status", url: "https://up.dhanur.me", icon: "fa-solid fa-signal", minRole: "admin", category: "Admin" },
];

let manifestState = null;
const inflightByRole = new Map();

function normalizeRole(role) {
  if (role === "admin") return "admin";
  if (role === "user") return "user";
  return "guest";
}

function roleLevel(role) {
  if (role === "admin") return 2;
  if (role === "user") return 1;
  return 0;
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.apps)) return null;

    const cachedAt = Number(data._cachedAt || 0);
    return {
      ...data,
      _stale: Date.now() - cachedAt > CACHE_TTL_MS,
    };
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        version: data.version || "1",
        apps: Array.isArray(data.apps) ? data.apps : FALLBACK_APPS,
        _cachedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore localStorage quota and private-mode errors.
  }
}

export function getManifestSync() {
  if (manifestState && Array.isArray(manifestState.apps)) {
    return manifestState;
  }

  const cached = readCache();
  if (cached && Array.isArray(cached.apps)) {
    manifestState = cached;
    return cached;
  }

  return { version: "0", apps: FALLBACK_APPS, _stale: true };
}

export function filterAppsByRole(apps, role = "guest") {
  const level = roleLevel(role);
  return (Array.isArray(apps) ? apps : []).filter((app) => roleLevel(app?.minRole || "guest") <= level);
}

export async function fetchManifest(role = "guest") {
  const normalizedRole = normalizeRole(role);
  if (inflightByRole.has(normalizedRole)) {
    return inflightByRole.get(normalizedRole);
  }

  const promise = (async () => {
    try {
      const url = `${MANIFEST_URL}?role=${encodeURIComponent(normalizedRole)}`;
      const response = await fetch(url, {
        credentials: "omit",
        mode: "cors",
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error(`Manifest request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.apps)) {
        throw new Error("Manifest payload is invalid");
      }

      manifestState = {
        version: data.version || "1",
        apps: data.apps,
      };
      writeCache(manifestState);
      return manifestState;
    } catch {
      return getManifestSync();
    }
  })();

  inflightByRole.set(normalizedRole, promise);

  try {
    return await promise;
  } finally {
    inflightByRole.delete(normalizedRole);
  }
}
