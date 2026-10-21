// Offline cache for Brainvita. Version changes on every build so phones pick up updates.
const CACHE = "brainvita-202610211921";
const FILES = ["./","index.html","manifest.webmanifest","fonts/baloo2-latin.woff2","fonts/hind-400.woff2","fonts/hind-500.woff2","fonts/hind-600.woff2","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Pages: try the network for fresh updates, fall back to the cache when offline.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((r) => {
      const copy = r.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return r;
    }).catch(() => caches.match("index.html")));
    return;
  }
  // Everything else: cache first.
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
