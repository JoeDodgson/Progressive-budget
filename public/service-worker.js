const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Install to create the cache
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
    );
    
    self.skipWaiting();
  });
  
// Activate to remove all the cache (from an old service worker)
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Store any successful API calls in the cache
self.addEventListener("fetch", evt => {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(`Error: service-worker.js - self.addEventListener("fetch"): ${err}`))
    );

    return;
  }

  // If the request is not for the API, check if the request matches with the cache
  evt.respondWith(
    // If the request matches the cache, serve static assets ("offline-first" approach)
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    }).catch(err => console.log(`Error: service-worker.js - self.addEventListener("fetch"): ${err}`))
  );
});

// If any get requests are made, check the cache first, but if it is not in the cache, proceed with the fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});