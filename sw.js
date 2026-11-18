/* Vidya Nirman offline shell v5.
   Network-first for fresh pages, with a safe offline fallback.
   Large media, PDFs, archives and third-party requests are not cached. */
const CACHE = 'vidya-nirman-shell-v5';
const CORE = [
  './',
  './index.html',
  './offline.html',
  './study-hub.html',
  './dashboard.html',
  './exam-centre.html',
  './mock-exam.html',
  './auth.html',
  './logo.png',
  './vn-icon-192.png',
  './vn-icon-512.png',
  './manifest.webmanifest'
];
const SKIP_CACHE = /\.(?:mp4|webm|mov|pdf|zip)$/i;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // One unavailable optional page should not prevent the entire PWA installing.
    await Promise.allSettled(CORE.map(async path => {
      const response = await fetch(path, { cache: 'reload' });
      if (!response.ok) throw new Error('Could not cache ' + path);
      await cache.put(path, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('vidya-nirman-shell-') && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || SKIP_CACHE.test(url.pathname)) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type !== 'opaque') {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;

      if (request.mode === 'navigate') {
        const fallback = await caches.match('./index.html') ||
          await caches.match('./offline.html');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
