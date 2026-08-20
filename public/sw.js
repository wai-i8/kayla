const CACHE_NAME = 'kayla-shell-v2';
const BASE = new URL('./', self.registration.scope).pathname;
const SHELL = [
  BASE,
  `${BASE}index.html`,
  `${BASE}site.webmanifest`,
  `${BASE}kayla-favicon-v2-48.png`,
  `${BASE}kayla-apple-touch-icon-v2-180.png`,
  `${BASE}kayla-icon-any-v2-192.png`,
  `${BASE}kayla-icon-any-v2-512.png`,
  `${BASE}kayla-icon-maskable-v2-192.png`,
  `${BASE}kayla-icon-maskable-v2-512.png`,
  `${BASE}kayla-album.webp`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('kayla-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(`${BASE}index.html`)));
    return;
  }

  const isPublicAsset = url.pathname.startsWith(`${BASE}assets/`) || SHELL.includes(url.pathname);
  if (!isPublicAsset || url.search) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })),
  );
});
