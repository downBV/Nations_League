// Football Manager 2026 - Service Worker
// Verzió növelése frissítéskor kényszeríti az újratöltést
const CACHE_VERSION = 'fm2026-v1';
const CACHE_NAME = `${CACHE_VERSION}-cache`;

// Fájlok amiket cache-elünk offline használathoz
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './background.png',
  './settings.png',
  './cups.png',
  './about.png',
  './kickoff.png',
  './exit.png',
  './won.png',
  './lost.png',
  './draw.png',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png'
];

// INSTALL - cache-eljük a fájlokat
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        // addAll helyett egyenkénti add, hogy egy hiányzó fájl ne törje el az egészet
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          }))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE - régi cache-ek törlése
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('fm2026-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH - cache-first stratégia, hálózati fallback-kel
self.addEventListener('fetch', (event) => {
  // Csak GET kéréseket kezelünk
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Háttérben frissítjük a cache-t (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Nincs cache-ben - hálózatról töltjük, és elmentjük
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline és nincs cache - ha HTML kérés volt, adjuk vissza az index.html-t
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
