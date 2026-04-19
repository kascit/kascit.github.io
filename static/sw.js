// Service Worker with smart caching strategy
// Cache versioning: Update CACHE_VERSION when assets change
const CACHE_VERSION = "v13";
const CACHE_NAME = `kascit-${CACHE_VERSION}`;
const META_CACHE = `kascit-meta-${CACHE_VERSION}`;
const RUNTIME_META_CACHE = "kascit-runtime-meta-v1";

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
  "/js/core/boot.js",
  "/js/core/main.js",
  "/js/system/offline-reload.js",
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
const DO_NOT_CACHE = [
  /\.map$/,
  /analytics/,
  /giscus/,
  /^\/sw\.js$/,
  /^\/js\/notify-banner\.js$/,
  /^\/__runtime\//,
  /^\/share-target\/$/,
  /^\/open-file\/$/,
  /^\/handler\/$/,
];

function canonicalDocumentPath(pathname) {
  if (!pathname || pathname === "/") return "/";
  if (pathname.endsWith("/")) return pathname;
  if (/\.[A-Za-z0-9]+$/.test(pathname)) return pathname;
  return `${pathname}/`;
}

function documentCacheKey(url) {
  const canonicalPath = canonicalDocumentPath(url.pathname);
  return `${canonicalPath}${url.search}`;
}

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
  const KEEP_CACHES = [CACHE_NAME, META_CACHE];
  event.waitUntil(
    // Clean up old caches (including stale meta caches)
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!KEEP_CACHES.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim())
      .then(() => updateInstalledWidgets()),
  );
});

// Simple metadata storage via Cache API

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

async function setRuntimeJson(path, payload) {
  try {
    const cache = await caches.open(RUNTIME_META_CACHE);
    await cache.put(
      path,
      new Response(JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }),
    );
  } catch (_e) {
    // ignore runtime cache failures
  }
}

async function getRuntimeJson(path) {
  try {
    const cache = await caches.open(RUNTIME_META_CACHE);
    const res = await cache.match(path);
    if (!res) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeShareText(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 5000);
}

async function handleShareTargetPost(request) {
  try {
    const formData = await request.formData();
    const payload = {
      title: normalizeShareText(formData.get("title") || ""),
      text: normalizeShareText(formData.get("text") || ""),
      url: normalizeShareText(formData.get("url") || ""),
      files: [],
      receivedAt: new Date().toISOString(),
    };

    for (const [field, value] of formData.entries()) {
      if (typeof File !== "undefined" && value instanceof File) {
        payload.files.push({
          field,
          name: value.name,
          type: value.type || "application/octet-stream",
          size: value.size || 0,
        });
      }
    }

    await setRuntimeJson("/__runtime/share-target", payload);
    return Response.redirect("/share-target/?shared=1", 303);
  } catch (_e) {
    return Response.redirect("/share-target/?error=1", 303);
  }
}

function hasWidgetRuntime() {
  return (
    !!self.widgets &&
    typeof self.widgets.updateByTag === "function" &&
    typeof self.widgets.getByTag === "function"
  );
}

function getWidgetTemplateUrl(definition) {
  return (
    definition?.msAcTemplate ||
    definition?.ms_ac_template ||
    ""
  );
}

function getWidgetDataUrl(definition) {
  return (
    definition?.data ||
    definition?.msAcData ||
    definition?.ms_ac_data ||
    ""
  );
}

async function buildWidgetPayload(definition) {
  const templateUrl = getWidgetTemplateUrl(definition);
  if (!templateUrl) return null;

  const templateRes = await fetch(templateUrl, { cache: "no-store" });
  if (!templateRes.ok) return null;

  const dataUrl = getWidgetDataUrl(definition);
  const dataRes = dataUrl
    ? await fetch(dataUrl, { cache: "no-store" }).catch(() => null)
    : null;

  return {
    template: await templateRes.text(),
    data: dataRes && dataRes.ok ? await dataRes.text() : "{}",
  };
}

async function updateWidgetByTag(tag, definitionHint) {
  if (!hasWidgetRuntime() || !tag) return;

  const widget = await self.widgets.getByTag(tag).catch(() => null);
  const definition = definitionHint || widget?.definition;
  if (!definition) return;

  const payload = await buildWidgetPayload(definition).catch(() => null);
  if (!payload) return;

  await self.widgets.updateByTag(tag, payload).catch(() => {});
}

async function updateInstalledWidgets() {
  if (!hasWidgetRuntime() || typeof self.widgets.matchAll !== "function") {
    return;
  }

  const widgets = await self.widgets.matchAll().catch(() => []);
  for (const widget of widgets) {
    const tag = widget?.definition?.tag;
    if (tag) {
      await updateWidgetByTag(tag, widget.definition);
    }
  }
}

self.addEventListener("widgetinstall", (event) => {
  const tag = event?.widget?.definition?.tag;
  if (!tag) return;
  event.waitUntil(updateWidgetByTag(tag, event.widget.definition));
});

self.addEventListener("widgetresume", (event) => {
  const tag = event?.widget?.definition?.tag;
  if (!tag) return;
  event.waitUntil(updateWidgetByTag(tag, event.widget.definition));
});

function parseLatestFromRSS(xmlText) {
  try {
    // Service Workers have no DOM access, so use regex instead of DOMParser
    const itemMatch = xmlText.match(/<item[\s\S]*?<\/item>/);
    if (!itemMatch) return null;
    const item = itemMatch[0];

    const getTag = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : null;
    };

    // <link> in RSS is self-closing-ish; handle both <link>url</link> and bare text
    const title = getTag("title") || "New post";
    const link = getTag("link") || "/blog/";
    const pubDate = getTag("pubDate") || "";
    const guid = getTag("guid") || link;
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

  // share_target: capture POST payload and redirect to reader page.
  if (request.method === "POST" && url.pathname === "/share-target/") {
    event.respondWith(handleShareTargetPost(request));
    return;
  }

  // Runtime metadata endpoint used by feature pages.
  if (request.method === "GET" && url.pathname === "/__runtime/share-target.json") {
    event.respondWith(
      (async () => {
        const payload = await getRuntimeJson("/__runtime/share-target");
        if (!payload) return jsonResponse({ error: "not_found" }, 404);
        return jsonResponse(payload, 200);
      })(),
    );
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip files that should not be cached (let the browser handle natively)
  if (DO_NOT_CACHE.some((pattern) => pattern.test(url.pathname))) {
    return;
  }

  // Determine if this asset should be cached
  const shouldCache = CACHEABLE_PATTERNS.some((pattern) =>
    pattern.test(url.pathname),
  );
  const acceptsHtml = (request.headers.get("accept") || "").includes("text/html");
  const isDocumentRequest =
    request.mode === "navigate" ||
    request.destination === "document" ||
    acceptsHtml;

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
  } else if (isDocumentRequest) {
    // Stale-while-revalidate for HTML navigations to keep route changes seamless.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const key = documentCacheKey(url);
        const cachedResponse =
          (await cache.match(key)) ||
          (await cache.match(request));

        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(key, response.clone());
            }
            return response;
          })
          .catch(() => null);

        if (cachedResponse) {
          event.waitUntil(networkFetch);
          return cachedResponse;
        }

        const networkResponse = await networkFetch;
        if (networkResponse) {
          return networkResponse;
        }

        return (await caches.match("/offline/")) ||
          new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
      })(),
    );
  } else {
    // Network-first for uncached non-document requests.
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
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
