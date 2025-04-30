const CACHE_NAME = 'chen-palaces-cache-v2';
const urlsToCache = [
  '/harmonot-chen/',
  '/harmonot-chen/index.html',
  '/harmonot-chen/hall.html',
  '/harmonot-chen/dashboard.html',
  '/harmonot-chen/css/styles.css',
  '/harmonot-chen/js/firebase-config.js',
  '/harmonot-chen/js/login.js',
  '/harmonot-chen/js/hall.js',
  '/harmonot-chen/js/dashboard.js',
  '/harmonot-chen/images/icon-192.png',
  '/harmonot-chen/images/icon-512.png',
  '/harmonot-chen/images/logo/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // אם יש תשובה מהמטמון, נחזיר אותה
        if (response) {
          return response;
        }
        
        // אחרת, נבצע את הבקשה לשרת
        return fetch(event.request).then(response => {
          // בדיקה שקיבלנו תשובה תקינה
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // שכפול התשובה כי אי אפשר להשתמש בה פעמיים
          const responseToCache = response.clone();

          // שמירה במטמון
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 