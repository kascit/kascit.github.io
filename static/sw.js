// Service Worker with smart caching strategy
// Cache versioning: Update CACHE_VERSION when assets change
const CACHE_VERSION = "v3";
const CACHE_NAME = `kascit-${CACHE_VERSION}`;

// Critical assets that must be cached on install
const CRITICAL_ASSETS = [
  "/",
  "/index.html",
  "/about/",
  "/links/",
  "/blog/",
  "/projects/",
  "/privacy/",
  "/offline/",
  // Assets needed for offline page to render properly
  "/css/main.css",
  "/css/font-awesome.min.css",
  "/goyo.js",
  "/js/theme-init.js",
  "/fonts/Pretendard-Regular.woff",
  "/webfonts/fa-solid-900.woff2",
  "/webfonts/fa-brands-400.woff2",
];

// Asset patterns to cache (will be cached on-demand)
const CACHEABLE_PATTERNS = [
  /\.html$/,
  /\.css$/,
  /\.js$/,
  /\.json$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.webp$/,
  /\.woff2?$/,
  /\.ttf$/,
];

// Assets to never cache
const DO_NOT_CACHE = [/\.map$/, /analytics/, /giscus/];

// Service Worker Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache each asset individually so one failure doesn't kill the rest
        return Promise.all(
          CRITICAL_ASSETS.map((url) =>
            cache.add(url).catch(() => {
              // Silently skip assets that can't be fetched (e.g. during dev)
            }),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

// Service Worker Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Clean up old caches
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Simple metadata storage via Cache API
const META_CACHE = `kascit-meta-${CACHE_VERSION}`;

async function getStoredLatest() {
  try {
    const cache = await caches.open(META_CACHE);
    const res = await cache.match("/__meta/latest_post");
    if (!res) return null;
    const json = await res.json();
    return json;
  } catch (e) {
    return null;
  }
}

async function setStoredLatest(info) {
  try {
    const cache = await caches.open(META_CACHE);
    await cache.put(
      "/__meta/latest_post",
      new Response(JSON.stringify(info), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch (e) {
    // ignore
  }
}

function parseLatestFromRSS(xmlText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");
    const firstItem = doc.querySelector("item");
    if (!firstItem) return null;
    const title = firstItem.querySelector("title")?.textContent || "New post";
    const link = firstItem.querySelector("link")?.textContent || "/blog/";
    const pubDate = firstItem.querySelector("pubDate")?.textContent || "";
    const guid = firstItem.querySelector("guid")?.textContent || link;
    return { title, link, pubDate, guid };
  } catch (e) {
    return null;
  }
}

async function checkLatestAndNotify() {
  try {
    const res = await fetch("/rss.xml", { cache: "no-store" });
    if (!res.ok) return;
    const text = await res.text();
    const latest = parseLatestFromRSS(text);
    if (!latest) return;
    const stored = await getStoredLatest();

    // First run: store baseline without notifying
    if (!stored) {
      await setStoredLatest(latest);
      return;
    }

    const changed =
      stored.guid !== latest.guid || stored.pubDate !== latest.pubDate;
    if (!changed) return;

    // Update stored latest
    await setStoredLatest(latest);

    // Show notification if permitted
    if (
      self.registration &&
      typeof self.registration.showNotification === "function" &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      await self.registration.showNotification("New blog post", {
        body: latest.title,
        tag: "new-post",
        data: { url: latest.link },
        icon: "/icons/favicon-96x96.png",
        badge: "/icons/favicon-96x96.png",
      });
    }
  } catch (e) {
    // ignore
  }
}

// Periodic Background Sync - check RSS
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-sync") {
    event.waitUntil(checkLatestAndNotify());
  }
});

// One-off Background Sync - also check RSS
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-site-refresh") {
    event.waitUntil(checkLatestAndNotify());
  }
});

// Service Worker Fetch Event - Smart caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip files that should not be cached
  if (DO_NOT_CACHE.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(fetch(request));
    return;
  }

  // Determine if this asset should be cached
  const shouldCache = CACHEABLE_PATTERNS.some((pattern) =>
    pattern.test(url.pathname),
  );

  if (shouldCache) {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (
              !response ||
              response.status !== 200 ||
              response.type === "error"
            ) {
              return response;
            }

            // Clone the response and cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return cached response if fetch fails
            return caches.match(request);
          });
      }),
    );
  } else {
    // Network-first strategy for documents (HTML, etc.)
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses
          if (response.status === 200 && request.destination === "document") {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Serve the offline page for document requests
            if (request.destination === "document") {
              return caches.match("/offline/");
            }
            return new Response("Offline", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
        }),
    );
  }
});

// Handle messages from clients (useful for version updates)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CHECK_LATEST_POST") {
    event.waitUntil(checkLatestAndNotify());
  }
});

// Open post on notification click
self.addEventListener("notificationclick", (event) => {
  const url = event.notification?.data?.url;
  event.notification?.close();
  if (url) {
    event.waitUntil(
      (async () => {
        const allClients = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const client of allClients) {
          try {
            const clientUrl = new URL(client.url);
            if (clientUrl.pathname === new URL(url, location.origin).pathname) {
              return client.focus();
            }
          } catch (_) {
            /* ignore */
          }
        }
        return clients.openWindow(url);
      })(),
    );
  }
});
