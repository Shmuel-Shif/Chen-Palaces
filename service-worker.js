const CACHE_NAME = 'chen-palaces-cache-v2';
const urlsToCache = [
    '/harmonot-chen/',
    '/harmonot-chen/index.html',
    '/harmonot-chen/hall.html',
    '/harmonot-chen/dashboard.html',
    '/harmonot-chen/css/styles.css',
    '/harmonot-chen/css/whatsapp-float.css',
    '/harmonot-chen/js/firebase-config.js',
    '/harmonot-chen/js/login.js',
    '/harmonot-chen/js/hall.js',
    '/harmonot-chen/js/dashboard.js',
    '/harmonot-chen/js/common.js',
    '/harmonot-chen/images/icon-192.png',
    '/harmonot-chen/images/icon-512.png',
    '/harmonot-chen/images/logo/logo.png',
    '/harmonot-chen/manifest.json'
];

// התקנת Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// שימוש בקבצים מה-cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// עדכון גרסאות של ה-cache
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