const CACHE_NAME = "dicoding-stories-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/scripts/index.js",
  "/scripts/data/api.js",
  "/scripts/app.js",
  "/scripts/utils/url-parser.js",
  "/scripts/utils/config.js",
  "/routes/routes.js",
  "/scripts/pages/about-page.js",
  "/scripts/pages/add-story-page.js",
  "/scripts/pages/detail-page.js",
  "/scripts/pages/home-page.js",
  "/scripts/pages/login-page.js",
  "/scripts/pages/register-page.js",
  "/scripts/presenter/detail-presenter.js",
  "/scripts/presenter/home-presenter.js",
  "/scripts/idb.js",
  "/manifest.json", // Pastikan ada di sini
  "/public/images/favicon.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (event.request.method === "GET") {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        return new Response(
          "You are offline. Please connect to the internet.",
          {
            status: 503,
            statusText: "Service Unavailable",
          }
        );
      })
  );
});

self.addEventListener("push", (event) => {
  console.log("Push event received");

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "New Story Added!";
  const options = {
    body: data.body || "A new story has been added to Dicoding Stories.",
    icon: "/public/images/favicon.png",
    badge: "/public/images/favicon.png",
    data: {
      url: data.url || "/#home",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data.url;
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
