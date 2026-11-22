/* Offline cache for The Red Dome.
   - Art (assets/) and fonts: served from the cache at once, refreshed in the background.
   - Page, scripts and styles: from the network when online (so updates arrive), cache when offline.
   Change VERSION to throw the whole cache away. */
const VERSION = "reddome-v3";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(req) {
  return caches.open(VERSION).then((cache) =>
    cache.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
}

function networkFirst(req) {
  return caches.open(VERSION).then((cache) =>
    fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => cache.match(req, { ignoreSearch: true }))
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  if (isFont || url.pathname.includes("/assets/")) e.respondWith(staleWhileRevalidate(req));
  else e.respondWith(networkFirst(req));
});
