// Football Manager 2026 - Service Worker
// Verzió növelése frissítéskor kényszeríti az újratöltést
const CACHE_VERSION = 'fm2026-v13'; // v12: csapat-szintű előretolási vonal (középpályások/védők felnyomulnak támadáskor)
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

// INSTALL - cache-eljük a fájlokat. cache:'reload' -> KIKÉNYSZERÍTI, hogy a
// böngésző HTTP-cache-ét megkerülve friss példányt töltsön, ne egy régit.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell (fresh fetch)');
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url =>
            fetch(url, { cache: 'reload' })
              .then(resp => cache.put(url, resp))
              .catch(err => console.warn(`[SW] Failed to cache ${url}:`, err))
          )
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

// FETCH
// FONTOS VÁLTOZÁS: a HTML dokumentumot (index.html / navigáció) mostantól
// NETWORK-FIRST stratégiával szolgáljuk ki, nem cache-first-tel. Fejlesztés
// alatt ez kritikus: cache-first mellett a telepített PWA a KÓDFRISSÍTÉSEKET
// sosem látta volna, mert mindig a régi cache-elt index.html futott volna,
// hiába küldtünk új verziót. Képek/ikonok maradhatnak cache-first (ritkán
// változnak), de maga a játéklogika mindig a legfrissebb legyen, ha van net.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const isDocument = event.request.mode === 'navigate' ||
                      event.request.destination === 'document' ||
                      event.request.url.endsWith('index.html') ||
                      event.request.url.endsWith('/');
  
  if (isDocument) {
    // NETWORK-FIRST: mindig a legfrissebb kódot próbáljuk betölteni.
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  
  // Minden más (képek, manifest stb.): CACHE-FIRST, háttérben frissítve
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
