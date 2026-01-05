// Service Worker with smart caching strategy
// Cache versioning: Update CACHE_VERSION when assets change
const CACHE_VERSION = "v1";
const CACHE_NAME = `kascit-${CACHE_VERSION}`;

// Critical assets that must be cached on install
const CRITICAL_ASSETS = ["/", "/index.html"];

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
        return cache.addAll(CRITICAL_ASSETS).catch((err) => {
          console.warn("Failed to cache critical assets:", err);
          // Don't fail the install if critical assets are missing
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
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
          })
        );
      })
      .then(() => self.clients.claim())
  );
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
    pattern.test(url.pathname)
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
      })
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
            // If no cached response and offline, return a fallback
            return (
              cachedResponse ||
              new Response(
                "Offline - Content not available. Check your connection.",
                { status: 503, statusText: "Service Unavailable" }
              )
            );
          });
        })
    );
  }
});

// Handle messages from clients (useful for version updates)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
