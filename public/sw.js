// FOM Community PWA Service Worker

const CACHE_VERSION = 'fom-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// INSTALL: nothing to pre-cache — all pages are session-sensitive
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// ACTIVATE: clean up all old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// FETCH: strategy based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache POST (server actions)
  if (request.method !== 'GET') return;

  // Never cache auth, API, or any app pages (all are session-sensitive)
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/register') ||
    url.pathname === '/'
  ) return;

  // Next.js static chunks: cache-first (content-hashed filenames)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Everything else: network-first, fall back to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
