const CACHE_NAME = "dicoding-stories-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/scripts/index.js",
  "/public/images/favicon.png", // Tetap menggunakan path relatif dari /src
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            fetch(event.request)
              .then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                  return caches.match("/public/images/favicon.png");
                }
                const responseToCache = networkResponse.clone();
                cache.put(event.request, responseToCache);
                return networkResponse;
              })
              .catch(() => {
                return caches.match("/public/images/favicon.png");
              })
          );
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

self.addEventListener("push", (event) => {
  const title = "Dicoding Stories";
  const options = {
    body: event.data ? event.data.text() : "You have a new update!",
    icon: "/public/images/favicon.png", // Tetap menggunakan path relatif
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
