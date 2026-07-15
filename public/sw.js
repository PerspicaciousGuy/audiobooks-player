const SHELL_CACHE = "quiet-library-shell-v1";
const STATIC_CACHE = "quiet-library-static-v1";
const PUBLIC_SHELL = ["/offline", "/privacy", "/terms"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PUBLIC_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key !== SHELL_CACHE &&
                key !== STATIC_CACHE &&
                key.startsWith("quiet-library-"),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function shouldBypass(request, url) {
  return (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.headers.has("range") ||
    request.destination === "audio" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/app/") ||
    url.pathname.startsWith("/offline-audio/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === "navigate" && url.pathname === "/app/offline") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (shouldBypass(request, url)) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    ["font", "image", "script", "style"].includes(request.destination)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
