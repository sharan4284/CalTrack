// CalTrack Service Worker — PWA Cache & Offline Engine
const CACHE_NAME = 'caltrack-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// Install: Cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service worker precache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate for local assets, network-first for external APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip Firebase/Firestore/Google API network calls — let SDKs handle their own persistence
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('firebaseio.com') ||
    url.origin.includes('identitytoolkit.googleapis.com') ||
    url.origin.includes('generativelanguage.googleapis.com') ||
    url.origin.includes('fitness.googleapis.com')
  ) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.origin === self.location.origin || url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'))
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || (event.request.mode === 'navigate' ? caches.match('/') : null);
      });

      return cachedResponse || fetchPromise;
    })
  );
});
